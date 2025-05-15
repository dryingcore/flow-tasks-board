
import { ApiTicket } from '../types/kanban';

const API_BASE_URL = 'https://server.starlaudo.com.br/api';

export const fetchTickets = async (clinicaId: number): Promise<ApiTicket[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/clinica/${clinicaId}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar tickets: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar tickets da API:', error);
    throw error;
  }
};
