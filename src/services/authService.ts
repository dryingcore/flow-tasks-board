
import { proxyFetch } from './proxyService';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nome: string;
    email: string;
    role: string;
    clinica_id?: number;
  }
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await proxyFetch("https://server.starlaudo.com.br/api/auth/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao autenticar!');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro no serviço de login:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};
