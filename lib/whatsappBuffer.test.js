import { describe, test, expect, vi, afterEach } from 'vitest';
import { createMessageBuffer } from './whatsappBuffer.js';

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

afterEach(() => {
  vi.useRealTimers();
});

describe('createMessageBuffer', () => {
  test('junta as mensagens picadas do mesmo contato numa chamada so, na ordem', async () => {
    const processBatch = vi.fn().mockResolvedValue();
    const buffer = createMessageBuffer({ delayMs: 20, processBatch });

    buffer.enqueue('ana', { text: 'bebi 2 copos' });
    buffer.enqueue('ana', { text: '100' });
    await buffer.drain();

    expect(processBatch).toHaveBeenCalledTimes(1);
    expect(processBatch).toHaveBeenCalledWith('ana', [{ text: 'bebi 2 copos' }, { text: '100' }]);
  });

  test('contatos diferentes nao se misturam', async () => {
    const processBatch = vi.fn().mockResolvedValue();
    const buffer = createMessageBuffer({ delayMs: 10, processBatch });

    buffer.enqueue('ana', { text: 'oi' });
    buffer.enqueue('bia', { text: 'ola' });
    await buffer.drain();

    expect(processBatch).toHaveBeenCalledTimes(2);
    expect(processBatch).toHaveBeenCalledWith('ana', [{ text: 'oi' }]);
    expect(processBatch).toHaveBeenCalledWith('bia', [{ text: 'ola' }]);
  });

  test('cada mensagem nova reinicia a contagem', async () => {
    vi.useFakeTimers();
    const processBatch = vi.fn().mockResolvedValue();
    const buffer = createMessageBuffer({ delayMs: 1000, processBatch });

    buffer.enqueue('ana', { text: 'a' });
    await vi.advanceTimersByTimeAsync(800);
    buffer.enqueue('ana', { text: 'b' });
    await vi.advanceTimersByTimeAsync(800);
    expect(processBatch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);
    expect(processBatch).toHaveBeenCalledTimes(1);
  });

  test('o tempo maximo de espera impede o lote de ficar aberto para sempre', async () => {
    vi.useFakeTimers();
    const processBatch = vi.fn().mockResolvedValue();
    const buffer = createMessageBuffer({ delayMs: 1000, maxWaitMs: 2500, processBatch });

    for (let i = 0; i < 6; i += 1) {
      buffer.enqueue('ana', { text: String(i) });
      await vi.advanceTimersByTimeAsync(600);
    }

    expect(processBatch).toHaveBeenCalled();
  });

  test('nunca processa dois lotes do mesmo contato ao mesmo tempo e mantem a ordem', async () => {
    const eventos = [];
    const processBatch = vi.fn(async (_chat, itens) => {
      eventos.push(`inicio:${itens[0].text}`);
      await esperar(60);
      eventos.push(`fim:${itens[0].text}`);
    });
    const buffer = createMessageBuffer({ delayMs: 10, processBatch });

    buffer.enqueue('ana', { text: 'primeiro' });
    await esperar(30); // o primeiro lote ja esta sendo processado
    buffer.enqueue('ana', { text: 'segundo' });
    await buffer.drain();

    expect(eventos).toEqual(['inicio:primeiro', 'fim:primeiro', 'inicio:segundo', 'fim:segundo']);
  });

  test('erro no processamento nao trava a fila e nao rejeita quem aguarda', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processBatch = vi.fn()
      .mockRejectedValueOnce(new Error('falhou'))
      .mockResolvedValueOnce();
    const buffer = createMessageBuffer({ delayMs: 5, processBatch });

    await buffer.enqueue('ana', { text: 'a' });
    await buffer.enqueue('ana', { text: 'b' });

    expect(processBatch).toHaveBeenCalledTimes(2);
    erro.mockRestore();
  });
});
