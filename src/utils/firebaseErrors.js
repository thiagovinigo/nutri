export function getFirebaseErrorMessage(error) {
  if (!error || !error.code) {
    return error?.message || 'Ocorreu um erro desconhecido. Tente novamente.';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso por outra conta. Tente fazer login ou recupere sua senha.';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido. Verifique se digitou corretamente.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada. Entre em contato com o suporte.';
    case 'auth/user-not-found':
      return 'Nenhum usuário encontrado com este e-mail. Verifique ou cadastre-se.';
    case 'auth/wrong-password':
      return 'A senha está incorreta. Tente novamente.';
    case 'auth/invalid-credential':
      return 'E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Escolha uma senha mais forte (pelo menos 6 caracteres).';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet e tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas falhas. Aguarde um momento e tente novamente.';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida. Contate o suporte.';
    default:
      return `Ocorreu um erro: ${error.message}`;
  }
}
