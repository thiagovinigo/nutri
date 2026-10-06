// Campos que o CLIENTE nunca deve gravar. A lista está espelhada em
// firestore.rules (funções serverOnlyKeys e nutriOnlyKeys) - o arquivo de
// regras não consegue importar este módulo, então mantenha os dois em sincronia.

// Só o servidor grava (Admin SDK, que ignora as regras):
//  - chat ids do Telegram/WhatsApp, gravados pelos webhooks ao resgatar o
//    vínculo; se o cliente pudesse escrevê-los, qualquer conta apontaria os
//    crons pro chat de outra pessoa e dispararia mensagens não solicitadas;
//  - campos do Radar de Abandono calculados por api/cron-risk-scan.js.
export const SERVER_ONLY_FIELDS = [
  'telegram_chat_id',
  'telegram_linked_at',
  'whatsapp_chat_id',
  'whatsapp_linked_at',
  'riskScore',
  'riskLevel',
  'riskFactors',
  'lastRiskNotifiedLevel',
  'lastRiskNotifiedAt',
];

// Só o nutricionista dono grava (correção manual do risco). O paciente não pode,
// senão suprimiria os próprios alertas de abandono.
export const NUTRI_ONLY_FIELDS = ['riskOverride'];

const omitKeys = (data, keys) => Object.fromEntries(Object.entries(data).filter(([key]) => !keys.includes(key)));

/** Cópia do objeto sem os campos só-de-servidor (não muta o original). */
export function omitServerOnlyFields(data) {
  return omitKeys(data, SERVER_ONLY_FIELDS);
}

/** Cópia sem tudo que o paciente não pode gravar no próprio doc (servidor + nutri). */
export function omitPatientUnwritableFields(data) {
  return omitKeys(data, [...SERVER_ONLY_FIELDS, ...NUTRI_ONLY_FIELDS]);
}
