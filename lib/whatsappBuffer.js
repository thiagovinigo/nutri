/**
 * Buffer de mensagens por contato do WhatsApp.
 *
 * Resolve dois defeitos vistos no primeiro teste real com o WAHA (21/11/2026):
 *  1. Quem escreve em mensagens picadas ("2 copos de 00 ml" + "100") tinha cada
 *     pedaço respondido separado, sem o contexto do outro.
 *  2. Webhooks do mesmo contato eram processados em paralelo, então as respostas
 *     saíam fora de ordem e duas leituras/escritas do histórico se atropelavam.
 *
 * Funcionamento: cada mensagem entra na fila do contato e (re)inicia uma
 * contagem; quando o contato para de escrever, o lote inteiro é entregue de uma
 * vez a `processBatch`. Lotes do mesmo contato nunca rodam ao mesmo tempo, e
 * sempre na ordem em que fecharam. Memória do processo: serve ao servidor
 * Express da VPS (um processo só), não a funções serverless.
 */

const DEFAULT_DELAY_MS = 5000;
const DEFAULT_MAX_WAIT_MS = 20000;

/**
 * @template T
 * @param {object} options
 * @param {number|(() => number)} [options.delayMs] - silêncio do contato antes de fechar o lote
 * @param {number} [options.maxWaitMs] - teto de espera desde a 1ª mensagem do lote
 * @param {(chatId: string, items: T[]) => Promise<void>} options.processBatch
 */
export function createMessageBuffer({ delayMs = DEFAULT_DELAY_MS, maxWaitMs = DEFAULT_MAX_WAIT_MS, processBatch }) {
  const pending = new Map(); // chatId -> lote aberto, ainda esperando o contato terminar
  const chains = new Map(); // chatId -> fila de processamento (garante um lote por vez)
  const outstanding = new Set(); // promessas de lotes não concluídos (para drain)

  const currentDelay = () => (typeof delayMs === 'function' ? delayMs() : delayMs);

  function flush(chatId) {
    const batch = pending.get(chatId);
    if (!batch) return;
    pending.delete(chatId);

    const previous = chains.get(chatId) || Promise.resolve();
    const run = previous
      .then(() => processBatch(chatId, batch.items))
      .catch((error) => {
        // Não loga o chatId: é o telefone do paciente.
        console.error('Erro ao processar lote de mensagens do WhatsApp:', error);
      })
      .finally(() => {
        if (chains.get(chatId) === run) chains.delete(chatId);
        batch.resolve();
      });
    chains.set(chatId, run);
  }

  /**
   * Coloca a mensagem na fila do contato.
   * @param {string} chatId
   * @param {T} item
   * @returns {Promise<void>} resolve quando o lote desta mensagem terminar de ser processado (nunca rejeita)
   */
  function enqueue(chatId, item) {
    let batch = pending.get(chatId);
    if (!batch) {
      let resolve;
      const done = new Promise((resolver) => { resolve = resolver; });
      batch = { items: [], timer: null, startedAt: Date.now(), done, resolve };
      pending.set(chatId, batch);
      outstanding.add(done);
      done.then(() => outstanding.delete(done));
    }

    batch.items.push(item);
    clearTimeout(batch.timer);
    const remaining = batch.startedAt + maxWaitMs - Date.now();
    batch.timer = setTimeout(() => flush(chatId), Math.max(0, Math.min(currentDelay(), remaining)));
    return batch.done;
  }

  /** Espera todos os lotes abertos e em processamento terminarem (usado em testes e no desligamento). */
  async function drain() {
    while (outstanding.size > 0) {
      await Promise.all([...outstanding]);
    }
  }

  return { enqueue, drain };
}
