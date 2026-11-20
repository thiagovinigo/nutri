import { z } from 'zod';
import { db, auth } from '../lib/firebase-admin.js';
import { requireAuthUid } from '../lib/auth.js';
import { normalizeCpfDigits } from '../lib/patients.js';

const bodySchema = z.object({
  confirmText: z.literal('EXCLUIR')
});

export const config = {
  api: {
    bodyParser: true
  }
};

/**
 * Endpoint LGPD (Art. 18): exclusão definitiva da conta e dados pessoais
 * vinculados ao titular autenticado via Firebase ID Token.
 */
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
    return res.status(400).json({
      error: 'Confirmação inválida: digite EXCLUIR para confirmar a exclusão definitiva.'
    });
  }

  try {
    const patientRef = db.collection('patients').doc(uid);
    const patientSnap = await patientRef.get();
    const batch = db.batch();

    if (patientSnap.exists) {
      const pData = patientSnap.data() || {};
      const cpfDigits = pData.cpfDigits || normalizeCpfDigits(pData.cpf || '');
      if (cpfDigits.length === 11) {
        const cpfIndexRef = db.collection('patientCpfIndex').doc(cpfDigits);
        const cpfIndexSnap = await cpfIndexRef.get();
        if (cpfIndexSnap.exists && cpfIndexSnap.data()?.patientId === uid) {
          batch.delete(cpfIndexRef);
        }
      }
      batch.delete(patientRef);
    }

    const apptsSnap = await db.collection('appointments').where('patientId', '==', uid).get();
    apptsSnap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      batch.delete(userRef);
    }

    await batch.commit();

    try {
      await auth.deleteUser(uid);
    } catch (authErr) {
      if (authErr?.code !== 'auth/user-not-found') {
        throw authErr;
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Erro na exclusão definitiva LGPD:', error);
    return res.status(500).json({ error: 'Erro interno ao excluir conta e dados.' });
  }
}
