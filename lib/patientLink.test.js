import { describe, test, expect } from 'vitest';
import {
  PATIENT_LINK_CODE_TTL_MS,
  generatePatientLinkCode,
  buildWhatsappConnectUrl,
  buildTelegramConnectUrl,
} from './patientLinkCode.js';
import { redeemPatientLinkCode, redeemNutriLinkCode } from './nutriLinkServer.js';

const CODIGO = 'a'.repeat(32);

/**
 * Firestore falso: um documento ({ ref, dados }) ou vários, e uma transacao que
 * registra o que foi atualizado. Suporta where com "==" e "in".
 */
function bancoFalso(documentos) {
  const lista = Array.isArray(documentos) ? documentos : documentos ? [documentos] : [];
  const consultas = [];
  const updates = [];
  const db = {
    collection: (nome) => ({
      where: (campo, operador, valor) => {
        const consulta = { nome, campo, operador, valor };
        consultas.push(consulta);
        consulta.limit = () => consulta;
        return consulta;
      },
    }),
    runTransaction: async (fn) =>
      fn({
        get: async (consulta) => {
          const bate = (doc) => (consulta.operador === 'in'
            ? consulta.valor.includes(doc.dados[consulta.campo])
            : doc.dados[consulta.campo] === consulta.valor);
          const docs = lista.filter(bate).map((doc) => ({ id: doc.ref.id, ref: doc.ref, data: () => doc.dados }));
          return { empty: docs.length === 0, docs };
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

describe('buildTelegramConnectUrl', () => {
  test('monta o deep link t.me com o codigo no start (nunca o id do paciente)', () => {
    expect(buildTelegramConnectUrl('nutrivvo_bot', CODIGO)).toBe(`https://t.me/nutrivvo_bot?start=${CODIGO}`);
  });
  test('usuario do bot ou codigo invalidos devolvem null', () => {
    expect(buildTelegramConnectUrl('', CODIGO)).toBeNull();
    expect(buildTelegramConnectUrl('bot com espaco', CODIGO)).toBeNull();
    expect(buildTelegramConnectUrl('evil.com/x?', CODIGO)).toBeNull();
    expect(buildTelegramConnectUrl('nutrivvo_bot', 'paciente-id-antigo')).toBeNull();
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

  describe('um chat = um paciente (o vinculo novo desfaz o anterior)', () => {
    const dono = (extra = {}) => ({
      ref: { id: 'dono' },
      dados: { name: 'Ana', patientLinkCode: CODIGO, patientLinkCodeExpiresAt: Date.now() + 60_000, ...extra },
    });

    test('WhatsApp: outro paciente com o mesmo numero (inclusive no formato antigo da Evolution) e desvinculado', async () => {
      const antigo = { ref: { id: 'antigo' }, dados: { name: 'Thiago', whatsapp_chat_id: '554199990000@s.whatsapp.net', whatsapp_linked_at: 'x' } };
      const { db, updates } = bancoFalso([dono(), antigo]);

      await redeemPatientLinkCode(db, CODIGO, { whatsapp_chat_id: '554199990000@c.us', whatsapp_linked_at: 'agora' });

      const desvinculo = updates.find((u) => u.ref === antigo.ref);
      expect(desvinculo).toBeDefined();
      expect(Object.keys(desvinculo.dados).sort()).toEqual(['whatsapp_chat_id', 'whatsapp_linked_at']);
      expect(updates.find((u) => u.ref.id === 'dono').dados).toMatchObject({ whatsapp_chat_id: '554199990000@c.us' });
    });

    test('Telegram: outro paciente com o mesmo chat e desvinculado', async () => {
      const antigo = { ref: { id: 'antigo' }, dados: { telegram_chat_id: 777, telegram_linked_at: 'x' } };
      const { db, updates } = bancoFalso([dono(), antigo]);

      await redeemPatientLinkCode(db, CODIGO, { telegram_chat_id: 777, telegram_linked_at: 'agora' });

      const desvinculo = updates.find((u) => u.ref === antigo.ref);
      expect(Object.keys(desvinculo.dados).sort()).toEqual(['telegram_chat_id', 'telegram_linked_at']);
    });

    test('nao mexe em pacientes de outros numeros nem no proprio dono', async () => {
      const outro = { ref: { id: 'outro' }, dados: { whatsapp_chat_id: '5511888880000@c.us' } };
      const { db, updates } = bancoFalso([dono({ whatsapp_chat_id: '554199990000@c.us' }), outro]);

      await redeemPatientLinkCode(db, CODIGO, { whatsapp_chat_id: '554199990000@c.us', whatsapp_linked_at: 'agora' });

      expect(updates.map((u) => u.ref.id)).toEqual(['dono']);
    });

    test('codigo expirado nao desvincula ninguem', async () => {
      const antigo = { ref: { id: 'antigo' }, dados: { whatsapp_chat_id: '554199990000@c.us' } };
      const { db, updates } = bancoFalso([dono({ patientLinkCodeExpiresAt: Date.now() - 1 }), antigo]);

      expect(await redeemPatientLinkCode(db, CODIGO, { whatsapp_chat_id: '554199990000@c.us' })).toBeNull();
      expect(updates.map((u) => u.ref.id)).toEqual(['dono']);
    });
  });

  test('o resgate do nutricionista continua usando a colecao users', async () => {
    const dados = { name: 'Carla', nutriLinkCode: CODIGO, nutriLinkCodeExpiresAt: Date.now() + 60_000 };
    const { db, consultas } = bancoFalso({ ref, dados });

    await redeemNutriLinkCode(db, CODIGO, canal);

    expect(consultas[0]).toMatchObject({ nome: 'users', campo: 'nutriLinkCode' });
  });
});
