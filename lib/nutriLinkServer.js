import { FieldValue } from 'firebase-admin/firestore';
import { isWellFormedLinkCode, isLinkCodeActive } from './nutriLinkCode.js';
import { chatIdVariants } from './whatsapp.js';

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
  return redeemLinkCode(
    db,
    {
      collection: 'patients',
      codeField: 'patientLinkCode',
      expiresField: 'patientLinkCodeExpiresAt',
      exclusive: exclusiveChannelOf(channelFields)
    },
    code,
    channelFields
  );
}

/**
 * "Um chat = um paciente": descreve o campo de chat que não pode ficar em dois
 * pacientes ao mesmo tempo. Sem isso, o mesmo número/conta ligado a dois
 * pacientes fazia o lookup do webhook (limit(1)) escolher um ao acaso e mostrar
 * os dados de saúde de um pro outro (visto no 1º teste real do WhatsApp). No
 * WhatsApp considera as duas formas de JID gravadas (@c.us do WAHA e
 * @s.whatsapp.net da Evolution).
 * @param {object} channelFields
 * @returns {{field: string, linkedAtField: string, values: Array}|null}
 */
function exclusiveChannelOf(channelFields = {}) {
  if (channelFields.whatsapp_chat_id) {
    return { field: 'whatsapp_chat_id', linkedAtField: 'whatsapp_linked_at', values: chatIdVariants(channelFields.whatsapp_chat_id) };
  }
  if (channelFields.telegram_chat_id !== undefined && channelFields.telegram_chat_id !== null) {
    return { field: 'telegram_chat_id', linkedAtField: 'telegram_linked_at', values: [channelFields.telegram_chat_id] };
  }
  return null;
}

async function redeemLinkCode(db, { collection, codeField, expiresField, exclusive = null }, code, channelFields) {
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

    // Leituras antes das escritas (regra das transações do Firestore): acha quem
    // mais já usa este chat, pra desvincular na mesma transação em que o dono do
    // código assume o vínculo.
    let previousOwners = [];
    if (exclusive) {
      const sameChat = await tx.get(db.collection(collection).where(exclusive.field, 'in', exclusive.values));
      previousOwners = sameChat.docs.filter((doc) => doc.id !== ownerDoc.id);
    }

    tx.update(ownerDoc.ref, { ...channelFields, ...clearCode });
    for (const previous of previousOwners) {
      tx.update(previous.ref, { [exclusive.field]: FieldValue.delete(), [exclusive.linkedAtField]: FieldValue.delete() });
    }
    return data;
  });
}
