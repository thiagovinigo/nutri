import { FieldValue } from 'firebase-admin/firestore';
import { isWellFormedLinkCode, isLinkCodeActive } from './nutriLinkCode.js';

/**
 * Resgata um código de vínculo gerado no CRM e grava o canal (chat id) no
 * documento do nutricionista dono do código. Uso único: o código é apagado na
 * mesma transação, então dois resgates simultâneos não vinculam duas vezes.
 *
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} code
 * @param {object} channelFields - ex.: { telegram_chat_id, telegram_linked_at }
 * @returns {Promise<object|null>} dados do nutricionista, ou null se o código for inválido/expirado
 */
export async function redeemNutriLinkCode(db, code, channelFields) {
  if (!isWellFormedLinkCode(code)) return null;

  const query = db.collection('users').where('nutriLinkCode', '==', code).limit(1);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(query);
    if (snap.empty) return null;

    const userDoc = snap.docs[0];
    const data = userDoc.data();
    const clearCode = { nutriLinkCode: FieldValue.delete(), nutriLinkCodeExpiresAt: FieldValue.delete() };

    if (!isLinkCodeActive(data.nutriLinkCodeExpiresAt)) {
      tx.update(userDoc.ref, clearCode);
      return null;
    }

    tx.update(userDoc.ref, { ...channelFields, ...clearCode });
    return data;
  });
}
