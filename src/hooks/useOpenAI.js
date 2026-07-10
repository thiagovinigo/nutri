import { useState } from 'react';

export function useOpenAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (asyncFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction(...args);
      return result;
    } catch (err) {
      console.error('Erro na chamada OpenAI:', err);
      setError(err.message || 'Erro inesperado na IA');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
