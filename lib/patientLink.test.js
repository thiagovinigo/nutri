import { describe, test, expect } from 'vitest';
import {
  PATIENT_LINK_CODE_TTL_MS,
  generatePatientLinkCode,
  buildWhatsappConnectUrl,
} from './patientLinkCode.js';
import { redeemPatientLinkCode, redeemNutriLinkCode } from './nutriLinkServer.js';

const CODIGO = 'a'.repeat(32);

/** Firestore falso: um documento, uma transacao que registra o que foi atualizado. */
function bancoFalso(documento) {
  const consultas = [];
  const updates = [];
  const db = {
    collection: (nome) => ({
      where: (campo, operador, valor) => ({
        limit: () => {
          const consulta = { nome, campo, operador, valor };
          consultas.push(consulta);
          return consulta;
        },
      }),
    }),
    runTransaction: async (fn) =>
      fn({
        get: async (consulta) => {
          const bate = documento && documento.dados[consulta.campo] === consulta.valor;
          return { empty: !bate, docs: bate ? [{ ref: documento.ref, data: () => documento.dados }] : [] };
        },
        update: (ref, dados) => updates.push({ ref, dados }),
      }),
  };
  return { db, consultas, updates };
}

describe('codigo de vinculo do paciente', () => {
  test('gera 32 caracteres hexadecimais aleatorios e expira em 10 minutos', () => {
    expect(generatePatientLinkCode()).toMatch(/^[a-f0-9]{32}$/);
    expect(generatePatientLinkCode()).not.toBe(generatePatientLinkCode());
    expect(PATIENT_LINK_CODE_TTL_MS).toBe(10 * 60 * 1000);
  });
});

describe('buildWhatsappConnectUrl', () => {
  test('monta o link wa.me com o /start e o codigo ja codificados', () => {
    expect(buildWhatsappConnectUrl('+55 (41) 99999-0000', CODIGO))
      .toBe(`https://wa.me/5541999990000?text=${encodeURIComponent(`/start ${CODIGO}`)}`);
  });
  test('sem numero configurado (interruptor desligado) ou numero invalido devolve null', () => {
    expect(buildWhatsappConnectUrl('', CODIGO)).toBeNull();
    expect(buildWhatsappConnectUrl(undefined, CODIGO)).toBeNull();
    expect(buildWhatsappConnectUrl('123', CODIGO)).toBeNull();
  });
  test('codigo malformado devolve null (nunca monta link com valor arbitrario)', () => {
    expect(buildWhatsappConnectUrl('5541999990000', 'abc')).toBeNull();
    expect(buildWhatsappConnectUrl('5541999990000', `${CODIGO}&x=1`)).toBeNull();
  });
});

describe('redeemPatientLinkCode', () => {
  const ref = { id: 'paciente-ref' };
  const canal = { whatsapp_chat_id: '554199990000@c.us', whatsapp_linked_at: 'agora' };

  test('codigo valido: grava o canal no paciente dono do codigo e apaga o codigo (uso unico)', async () => {
    const dados = { name: 'Ana', patientLinkCode: CODIGO, patientLinkCodeExpiresAt: Date.now() + 60_000 };
    const { db, consultas, updates } = bancoFalso({ ref, dados });

    const resultado = await redeemPatientLinkCode(db, CODIGO, canal);

    expect(resultado).toMatchObject({ name: 'Ana' });
    expect(consultas[0]).toMatchObject({ nome: 'patients', campo: 'patientLinkCode', valor: CODIGO });
    expect(updates).toHaveLength(1);
    expect(updates[0].ref).toBe(ref);
    expect(updates[0].dados).toMatchObject(canal);
    expect(Object.keys(updates[0].dados)).toEqual(expect.arrayContaining(['patientLinkCode', 'patientLinkCodeExpiresAt']));
  });

  test('codigo expirado: nao vincula e limpa o codigo', async () => {
    const dados = { patientLinkCode: CODIGO, patientLinkCodeExpiresAt: Date.now() - 1 };
    const { db, updates } = bancoFalso({ ref, dados });

    expect(await redeemPatientLinkCode(db, CODIGO, canal)).toBeNull();
    expect(updates).toHaveLength(1);
    expect(updates[0].dados).not.toHaveProperty('whatsapp_chat_id');
  });

  test('codigo inexistente: devolve null sem atualizar nada', async () => {
    const { db, updates } = bancoFalso({ ref, dados: { patientLinkCode: 'b'.repeat(32), patientLinkCodeExpiresAt: Date.now() + 60_000 } });

    expect(await redeemPatientLinkCode(db, CODIGO, canal)).toBeNull();
    expect(updates).toHaveLength(0);
  });

  test.each(['', 'abc', 'paciente-id-antigo', `${'a'.repeat(32)}x`, undefined, null, 42])('formato invalido %j nem consulta o banco', async (valor) => {
    const { db, consultas } = bancoFalso(null);

    expect(await redeemPatientLinkCode(db, valor, canal)).toBeNull();
    expect(consultas).toHaveLength(0);
  });

  test('o resgate do nutricionista continua usando a colecao users', async () => {
    const dados = { name: 'Carla', nutriLinkCode: CODIGO, nutriLinkCodeExpiresAt: Date.now() + 60_000 };
    const { db, consultas } = bancoFalso({ ref, dados });

    await redeemNutriLinkCode(db, CODIGO, canal);

    expect(consultas[0]).toMatchObject({ nome: 'users', campo: 'nutriLinkCode' });
  });
});
