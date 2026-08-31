import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../lib/firebase-admin.js';
import { requireAuthUid } from '../lib/auth.js';
import { normalizeCpfDigits, resolveCpfClaim } from '../lib/patients.js';

// Fecha o residual do bug "Cadastro duplicado" (backlog.md): garante que
// nenhum paciente ATIVO exista com o mesmo CPF de outro paciente ativo já
// existente. O client não consegue detectar isso sozinho - firestore.rules
// só deixa cada paciente ler o próprio doc - então a checagem precisa do
// Admin SDK (ignora rules) rodando numa transação, contra um índice
// patientCpfIndex/{cpfDigits} -> { patientId } que usa o próprio ID do
// documento como trava de unicidade.
//
// Fichas 'inativo' (provisórias, criadas pelo nutri antes do paciente ter
// conta) não entram nessa checagem de propósito - ver backlog.md e o plano
// desta mudança.

const bodySchema = z.object({
  cpf: z.string().min(1),
  patientId: z.string().min(1),
});

export const config = {
  api: {
    bodyParser: true,
  },
};

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

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload inválido: ' + parsed.error.issues.map(i => i.message).join('; ') });
  }

  const { cpf, patientId } = parsed.data;
  const cpfDigits = normalizeCpfDigits(cpf);
  if (cpfDigits.length !== 11) {
    return res.status(400).json({ error: 'CPF inválido - precisa ter 11 dígitos.' });
  }

  try {
    // Autorização: o próprio paciente reservando o CPF da própria conta, ou
    // o nutricionista dono editando o CPF de um paciente já ativo dele.
    if (patientId !== uid) {
      const patientSnap = await db.collection('patients').doc(patientId).get();
      if (!patientSnap.exists || patientSnap.data().nutricionista_id !== uid) {
        return res.status(403).json({ error: 'Você não tem acesso a este paciente.' });
      }
    }

    await db.runTransaction(async (tx) => {
      const indexRef = db.collection('patientCpfIndex').doc(cpfDigits);
      const indexSnap = await tx.get(indexRef);
      const indexPatientId = indexSnap.exists ? indexSnap.data().patientId : null;

      let conflictingDocExists = false;
      if (indexPatientId && indexPatientId !== patientId) {
        const conflictSnap = await tx.get(db.collection('patients').doc(indexPatientId));
        conflictingDocExists = conflictSnap.exists && conflictSnap.data().status === 'ativo';
      }

      const action = resolveCpfClaim({ indexPatientId, targetPatientId: patientId, conflictingDocExists });

      if (action === 'conflict') {
        // Mensagem propositalmente genérica - nunca expõe nome/dado do
        // outro paciente (evitaria um nutri usar isto pra descobrir se um
        // CPF é paciente de outra clínica).
        const err = new Error('CPF já está em uso por outro paciente ativo.');
        err.statusCode = 409;
        throw err;
      }

      if (action === 'reserve' || action === 'reclaim') {
        tx.set(indexRef, { patientId, updatedAt: FieldValue.serverTimestamp() });
      }
      // 'idempotent': nada a escrever.
    });

    return res.status(200).json({ ok: true, cpfDigits });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({ error: error.message });
    }
    console.error('Erro no guard de unicidade de CPF:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
