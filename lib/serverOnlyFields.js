// Campos que SÓ o servidor grava (Admin SDK nos webhooks do Telegram/WhatsApp,
// ao resgatar o vínculo). O cliente nunca deve escrevê-los: se qualquer conta
// pudesse, apontaria os crons (api/cron-*.js) pro chat de outra pessoa e
// dispararia mensagens não solicitadas.
//
// A MESMA lista está em firestore.rules (função serverOnlyKeys) - o arquivo de
// regras não consegue importar este módulo, então mantenha os dois em sincronia.

export const SERVER_ONLY_FIELDS = [
  'telegram_chat_id',
  'telegram_linked_at',
  'whatsapp_chat_id',
  'whatsapp_linked_at',
];

/** Cópia do objeto sem os campos só-de-servidor (não muta o original). */
export function omitServerOnlyFields(data) {
  return Object.fromEntries(Object.entries(data).filter(([key]) => !SERVER_ONLY_FIELDS.includes(key)));
}
