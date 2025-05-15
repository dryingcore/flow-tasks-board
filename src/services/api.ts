
import { ApiTicket } from '../types/kanban';

// Mock data para usar quando a API estiver inacessível devido a problemas de CORS
const mockTickets: ApiTicket[] = [
  {
    id: 10,
    titulo: "Erro na exportação",
    descricao: "Exportação de dados para Excel não funciona.",
    status: "em_teste",
    prioridade: "baixa",
    clinica_id: 1,
    usuario_id: 2,
    responsavel_id: null,
    createdAt: "2025-05-15T02:05:33.000Z",
    updatedAt: "2025-05-15T02:36:14.000Z"
  },
  {
    id: 9,
    titulo: "Erro na exportação",
    descricao: "Exportação de dados para Excel não funciona.",
    status: "aberto",
    prioridade: "baixa",
    clinica_id: 1,
    usuario_id: 2,
    responsavel_id: null,
    createdAt: "2025-05-15T02:05:32.000Z",
    updatedAt: "2025-05-15T02:36:25.000Z"
  },
  {
    id: 8,
    titulo: "Atualização de sistema",
    descricao: "Nova versão do sistema foi liberada.",
    status: "em_desenvolvimento",
    prioridade: "media",
    clinica_id: 1,
    usuario_id: 2,
    responsavel_id: null,
    createdAt: "2025-05-15T02:05:30.000Z",
    updatedAt: "2025-05-15T02:35:32.000Z"
  },
  {
    id: 7,
    titulo: "Atualização de sistema",
    descricao: "Nova versão do sistema foi liberada.",
    status: "em_desenvolvimento",
    prioridade: "media",
    clinica_id: 1,
    usuario_id: 2,
    responsavel_id: null,
    createdAt: "2025-05-15T02:05:29.000Z",
    updatedAt: "2025-05-15T02:12:17.000Z"
  },
  {
    id: 6,
    titulo: "Atualização de sistema",
    descricao: "Nova versão do sistema foi liberada.",
    status: "aberto",
    prioridade: "media",
    clinica_id: 1,
    usuario_id: 2,
    responsavel_id: null,
    createdAt: "2025-05-15T02:05:27.000Z",
    updatedAt: "2025-05-15T02:36:26.000Z"
  },
  {
    id: 5,
    titulo: "Erro na exportação",
    descricao: "Exportação de dados para Excel não funciona.",
    status: "em_teste",
    prioridade: "baixa",
    clinica_id: 1,
    usuario_id: 2,
    responsavel_id: null,
    createdAt: "2025-05-15T02:05:23.000Z",
    updatedAt: "2025-05-15T02:36:11.000Z"
  },
  {
    id: 4,
    titulo: "Relatório incorreto",
    descricao: "Os relatórios financeiros estão com valores errados.",
    status: "em_teste",
    prioridade: "media",
    clinica_id: 1,
    usuario_id: 2,
    responsavel_id: null,
    createdAt: "2025-05-15T02:05:21.000Z",
    updatedAt: "2025-05-15T02:36:09.000Z"
  },
  {
    id: 3,
    titulo: "Erro no login",
    descricao: "Usuários não conseguem acessar o sistema.",
    status: "em_teste",
    prioridade: "alta",
    clinica_id: 1,
    usuario_id: 2,
    responsavel_id: null,
    createdAt: "2025-05-15T02:05:17.000Z",
    updatedAt: "2025-05-15T05:11:42.000Z"
  },
  {
    id: 2,
    titulo: "Erro atualizado",
    descricao: "Descrição atualizada do erro.",
    status: "em_desenvolvimento",
    prioridade: "media",
    clinica_id: 1,
    usuario_id: 2,
    responsavel_id: 2,
    createdAt: "2025-05-14T23:29:58.000Z",
    updatedAt: "2025-05-15T02:35:56.000Z"
  }
];

// Tentativa com diferentes proxies CORS - se um falhar, tentamos outro
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
];

const API_BASE_URL = 'https://server.starlaudo.com.br/api';

export const fetchTickets = async (clinicaId: number): Promise<ApiTicket[]> => {
  // Tentamos cada proxy em sequência
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Tentando buscar tickets com o proxy: ${proxy}`);
      const response = await fetch(`${proxy}${API_BASE_URL}/tickets/clinica/${clinicaId}`);
      
      if (!response.ok) {
        console.error('Resposta da API não OK:', response.status, response.statusText);
        continue; // Tenta o próximo proxy
      }
      
      const data = await response.json();
      console.log('Dados recebidos da API:', data);
      
      // Se a resposta contém uma mensagem de erro CORS, continue para o próximo proxy
      if (data.success === false && data.message && data.message.includes("CORS")) {
        console.warn('Erro de CORS detectado, tentando próximo proxy');
        continue;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar tickets com o proxy ${proxy}:`, error);
      // Continua para o próximo proxy
    }
  }
  
  // Se todas as tentativas falharem, use os dados mock
  console.warn('Todos os proxies CORS falharam. Usando dados mock como fallback.');
  return mockTickets;
};
