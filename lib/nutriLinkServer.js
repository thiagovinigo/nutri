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
  return redeemLinkCode(db, { collection: 'users', codeField: 'nutriLinkCode', expiresField: 'nutriLinkCodeExpiresAt' }, code, channelFields);
}

/**
 * Mesmo resgate, para o PACIENTE: o código é gerado no Perfil do app
 * (lib/patientLinkCode.js) e grava o canal em patients/{id}. Substitui o
 * "/start <patientId>", que não provava posse da conta.
 *
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} code
 * @param {object} channelFields - ex.: { whatsapp_chat_id, whatsapp_linked_at }
 * @returns {Promise<object|null>} dados do paciente, ou null se o código for inválido/expirado
 */
export async function redeemPatientLinkCode(db, code, channelFields) {
  return redeemLinkCode(db, { collection: 'patients', codeField: 'patientLinkCode', expiresField: 'patientLinkCodeExpiresAt' }, code, channelFields);
}

async function redeemLinkCode(db, { collection, codeField, expiresField }, code, channelFields) {
  if (!isWellFormedLinkCode(code)) return null;

  const query = db.collection(collection).where(codeField, '==', code).limit(1);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(query);
    if (snap.empty) return null;

    const ownerDoc = snap.docs[0];
    const data = ownerDoc.data();
    const clearCode = { [codeField]: FieldValue.delete(), [expiresField]: FieldValue.delete() };

    if (!isLinkCodeActive(data[expiresField])) {
      tx.update(ownerDoc.ref, clearCode);
      return null;
    }

    tx.update(ownerDoc.ref, { ...channelFields, ...clearCode });
    return data;
  });
}
