import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './utils/firebase-admin.js';
import { requireAuthUid } from './utils/auth.js';
import { normalizeCpfDigits, findCpfConflictGroups } from './utils/patients.js';

// Painel de admin V1 (dono único do sistema, não um dos nutricionistas):
// resolver conflitos de CPF, ver usuários entre tenants, métricas agregadas.
// Um endpoint só (roteado por `action`) pra não gastar mais slots de
// Serverless Function - ver backlog.md sobre o limite de 12 do plano Hobby.
//
// Autorização: uid fixo via env var ADMIN_UID (nunca VITE_-prefixada, nunca
// vai pro bundle do client). O client não tem como saber quem é o admin -
// só descobre chamando 'whoami' e vendo se dá 200 ou 403.
//
// Nenhum dado aqui é acessível pelo client normal - firestore.rules só deixa
// cada nutricionista ver os próprios pacientes - então toda leitura/escrita
// passa pelo Admin SDK, igual ao guard de CPF (api/patient-cpf-guard.js).

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('whoami') }),
  z.object({ action: z.literal('metrics') }),
  z.object({ action: z.literal('list_nutris') }),
  z.object({ action: z.literal('list_conflicts') }),
  z.object({
    action: z.literal('resolve_conflict'),
    keepPatientId: z.string().min(1),
    archivePatientId: z.string().min(1),
  }),
]);

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handleMetrics() {
  const [nutrisSnap, ativosSnap, inativosSnap] = await Promise.all([
    db.collection('users').where('role', '==', 'nutricionista').count().get(),
    db.collection('patients').where('status', '==', 'ativo').get(),
    db.collection('patients').where('status', '==', 'inativo').count().get(),
  ]);

  const ativos = ativosSnap.docs.map(d => d.data());
  const totalAtivos = ativos.length;
  const streakMedio = totalAtivos ? Math.round(ativos.reduce((sum, p) => sum + (p.streak || 0), 0) / totalAtivos) : 0;
  const xpMedio = totalAtivos ? Math.round(ativos.reduce((sum, p) => sum + (p.xp || 0), 0) / totalAtivos) : 0;

  return {
    nutrisAtivos: nutrisSnap.data().count,
    pacientesAtivos: totalAtivos,
    pacientesInativos: inativosSnap.data().count,
    streakMedio,
    xpMedio,
  };
}

async function handleListNutris() {
  const nutrisSnap = await db.collection('users').where('role', '==', 'nutricionista').get();
  const nutris = nutrisSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const patientsSnap = await db.collection('patients').get();
  const counts = new Map();
  for (const doc of patientsSnap.docs) {
    const p = doc.data();
    if (!p.nutricionista_id) continue;
    const entry = counts.get(p.nutricionista_id) || { ativos: 0, inativos: 0 };
    if (p.status === 'ativo') entry.ativos++;
    else if (p.status === 'inativo') entry.inativos++;
    counts.set(p.nutricionista_id, entry);
  }

  return nutris.map(n => ({
    id: n.id,
    name: n.name || '',
    email: n.email || '',
    crn: n.crn || '',
    createdAt: n.createdAt || null,
    pacientesAtivos: counts.get(n.id)?.ativos || 0,
    pacientesInativos: counts.get(n.id)?.inativos || 0,
  }));
}

async function handleListConflicts() {
  const ativosSnap = await db.collection('patients').where('status', '==', 'ativo').get();
  const ativos = ativosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const groups = findCpfConflictGroups(ativos);

  const nutriIds = [...new Set(groups.flatMap(g => g.patients.map(p => p.nutricionista_id).filter(Boolean)))];
  const nutriSnaps = await Promise.all(nutriIds.map(id => db.collection('users').doc(id).get()));
  const nutriNames = new Map(nutriSnaps.filter(s => s.exists).map(s => [s.id, s.data().name || s.id]));

  return groups.map(group => ({
    cpfDigits: group.cpfDigits,
    patients: group.patients.map(p => ({
      id: p.id,
      name: p.name || '',
      email: p.email || '',
      nutricionistaNome: nutriNames.get(p.nutricionista_id) || '—',
      streak: p.streak || 0,
      xp: p.xp || 0,
    })),
  }));
}

async function handleResolveConflict({ keepPatientId, archivePatientId }) {
  if (keepPatientId === archivePatientId) {
    const err = new Error('Não é possível arquivar o mesmo paciente que está mantendo.');
    err.statusCode = 400;
    throw err;
  }

  await db.runTransaction(async (tx) => {
    const [keepSnap, archiveSnap] = await Promise.all([
      tx.get(db.collection('patients').doc(keepPatientId)),
      tx.get(db.collection('patients').doc(archivePatientId)),
    ]);

    if (!keepSnap.exists || !archiveSnap.exists) {
      const err = new Error('Um dos pacientes não foi encontrado.');
      err.statusCode = 404;
      throw err;
    }
    if (keepSnap.data().status !== 'ativo' || archiveSnap.data().status !== 'ativo') {
      const err = new Error('Um dos pacientes já não está mais ativo - recarregue a lista de conflitos.');
      err.statusCode = 409;
      throw err;
    }

    // Revalida server-side que os dois batem no mesmo CPF - não confia no
    // client pra decidir o que arquivar.
    const keepCpf = keepSnap.data().cpfDigits || normalizeCpfDigits(keepSnap.data().cpf);
    const archiveCpf = archiveSnap.data().cpfDigits || normalizeCpfDigits(archiveSnap.data().cpf);
    if (!keepCpf || keepCpf !== archiveCpf) {
      const err = new Error('Os dois pacientes não têm o mesmo CPF.');
      err.statusCode = 400;
      throw err;
    }

    tx.update(archiveSnap.ref, { status: 'arquivado' });
    tx.set(db.collection('patientCpfIndex').doc(keepCpf), { patientId: keepPatientId, updatedAt: FieldValue.serverTimestamp() });
  });

  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let uid;
  try {
    uid = await requireAuthUid(req);
  } catch (err) {
    return res.status(err.statusCode || 401).json({ error: err.message });
  }

  if (!process.env.ADMIN_UID || uid !== process.env.ADMIN_UID) {
    return res.status(403).json({ error: 'Acesso restrito.' });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload inválido: ' + parsed.error.issues.map(i => i.message).join('; ') });
  }

  try {
    switch (parsed.data.action) {
      case 'whoami':
        return res.status(200).json({ isAdmin: true });
      case 'metrics':
        return res.status(200).json(await handleMetrics());
      case 'list_nutris':
        return res.status(200).json({ nutris: await handleListNutris() });
      case 'list_conflicts':
        return res.status(200).json({ groups: await handleListConflicts() });
      case 'resolve_conflict':
        return res.status(200).json(await handleResolveConflict(parsed.data));
      default:
        return res.status(400).json({ error: 'Ação desconhecida.' });
    }
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Erro no endpoint de admin:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
