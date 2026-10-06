import { describe, test, expect, vi, beforeEach } from 'vitest';

// Banco em memória: chave "colecao/id" -> dados. Os mocks abaixo (hoisted)
// leem este objeto, então cada teste monta só o estado que precisa.
const store = vi.hoisted(() => ({ docs: new Map(), writes: [], failTransaction: false }));
const requireAuthUid = vi.hoisted(() => vi.fn());

vi.mock('firebase-admin/firestore', () => ({ FieldValue: { serverTimestamp: () => 'SERVER_TS' } }));
vi.mock('../../lib/auth.js', () => ({ requireAuthUid }));
vi.mock('../../lib/firebase-admin.js', () => {
  const makeRef = (collection, id) => ({
    collection,
    id,
    get: async () => {
      const data = store.docs.get(`${collection}/${id}`);
      return { exists: data !== undefined, data: () => data };
    },
  });
  return {
    db: {
      collection: (name) => ({ doc: (id) => makeRef(name, id) }),
      runTransaction: async (fn) => {
        if (store.failTransaction) throw new Error('firestore indisponivel');
        const tx = {
          get: (ref) => ref.get(),
          set: (ref, data) => store.writes.push({ path: `${ref.collection}/${ref.id}`, data }),
        };
        return fn(tx);
      },
    },
  };
});

const { default: handler } = await import('../../api/patient-cpf-guard.js');

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

async function call({ method = 'POST', body = { cpf: '123.456.789-09', patientId: 'pat-1' } } = {}) {
  const res = makeRes();
  await handler({ method, body, headers: {} }, res);
  return res;
}

beforeEach(() => {
  store.docs.clear();
  store.writes.length = 0;
  store.failTransaction = false;
  requireAuthUid.mockReset();
  requireAuthUid.mockResolvedValue('pat-1'); // por padrao: o proprio paciente
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('patient-cpf-guard - requisicao', () => {
  test('rejeita metodo diferente de POST', async () => {
    const res = await call({ method: 'GET' });
    expect(res.statusCode).toBe(405);
  });

  test('propaga o status de falha de autenticacao', async () => {
    requireAuthUid.mockRejectedValue(Object.assign(new Error('Token ausente'), { statusCode: 401 }));
    const res = await call();
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token ausente');
  });

  test('rejeita payload sem cpf', async () => {
    const res = await call({ body: { patientId: 'pat-1' } });
    expect(res.statusCode).toBe(400);
  });

  test('rejeita CPF que nao tem 11 digitos', async () => {
    const res = await call({ body: { cpf: '123.456.789-0', patientId: 'pat-1' } });
    expect(res.statusCode).toBe(400);
    expect(store.writes).toHaveLength(0);
  });
});

describe('patient-cpf-guard - autorizacao', () => {
  test('nutricionista nao pode reservar CPF de paciente de outro nutricionista', async () => {
    requireAuthUid.mockResolvedValue('nutri-A');
    store.docs.set('patients/pat-1', { nutricionista_id: 'nutri-B', status: 'ativo' });
    const res = await call();
    expect(res.statusCode).toBe(403);
    expect(store.writes).toHaveLength(0);
  });

  test('403 tambem quando o paciente informado nao existe', async () => {
    requireAuthUid.mockResolvedValue('nutri-A');
    const res = await call();
    expect(res.statusCode).toBe(403);
  });

  test('nutricionista dono pode reservar o CPF do proprio paciente', async () => {
    requireAuthUid.mockResolvedValue('nutri-A');
    store.docs.set('patients/pat-1', { nutricionista_id: 'nutri-A', status: 'ativo' });
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(store.writes).toHaveLength(1);
  });

  test('paciente nao pode reservar CPF em nome de outro paciente', async () => {
    requireAuthUid.mockResolvedValue('pat-2');
    store.docs.set('patients/pat-1', { nutricionista_id: 'nutri-A', status: 'ativo' });
    const res = await call();
    expect(res.statusCode).toBe(403);
  });
});

describe('patient-cpf-guard - unicidade', () => {
  test('reserva o CPF normalizado quando ninguem o tem', async () => {
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, cpfDigits: '12345678909' });
    expect(store.writes).toEqual([
      { path: 'patientCpfIndex/12345678909', data: { patientId: 'pat-1', updatedAt: 'SERVER_TS' } },
    ]);
  });

  test('e idempotente quando o proprio paciente ja e o dono do CPF', async () => {
    store.docs.set('patientCpfIndex/12345678909', { patientId: 'pat-1' });
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(store.writes).toHaveLength(0);
  });

  test('409 quando outro paciente ATIVO ja tem o CPF, sem expor quem e', async () => {
    store.docs.set('patientCpfIndex/12345678909', { patientId: 'pat-OUTRO' });
    store.docs.set('patients/pat-OUTRO', { status: 'ativo', name: 'Fulana Secreta' });
    const res = await call();
    expect(res.statusCode).toBe(409);
    expect(JSON.stringify(res.body)).not.toContain('pat-OUTRO');
    expect(JSON.stringify(res.body)).not.toContain('Fulana');
    expect(store.writes).toHaveLength(0);
  });

  test('retoma o CPF quando o dono anterior foi apagado', async () => {
    store.docs.set('patientCpfIndex/12345678909', { patientId: 'pat-APAGADO' });
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(store.writes[0].data.patientId).toBe('pat-1');
  });

  test('retoma o CPF quando o dono anterior virou ficha inativa', async () => {
    store.docs.set('patientCpfIndex/12345678909', { patientId: 'pat-OUTRO' });
    store.docs.set('patients/pat-OUTRO', { status: 'inativo' });
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(store.writes).toHaveLength(1);
  });
});

describe('patient-cpf-guard - falhas', () => {
  test('erro inesperado vira 500 generico, sem vazar a mensagem interna', async () => {
    store.failTransaction = true;
    const res = await call();
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });
});
