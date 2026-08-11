import { auth } from './firebase-admin.js';

/**
 * Extrai e verifica o Firebase ID token do header Authorization.
 * Primeiro uso de verificacao de ID token no projeto - os outros
 * endpoints em api/ hoje nao autenticam o chamador (ver debito
 * tecnico registrado no plano de verificacao-telefone-whatsapp).
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string>} uid do usuário autenticado
 * @throws {Error & { statusCode: number }} erro com statusCode 401 se o token faltar/for inválido
 */
export async function requireAuthUid(req) {
  const authHeader = req.headers['authorization'] || '';
  const match = authHeader.match(/^Bearer (.+)$/);

  if (!match) {
    const err = new Error('Token de autenticação ausente.');
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = await auth.verifyIdToken(match[1]);
    return decoded.uid;
  } catch (error) {
    console.error('Falha ao verificar ID token:', error);
    const err = new Error('Token de autenticação inválido ou expirado.');
    err.statusCode = 401;
    throw err;
  }
}
