
import { ApiTicket, ApiComment, NewTicket, UpdateTicket, NewComment } from '../types/kanban';
import { toast } from '@/components/ui/use-toast';

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

// Mock de comentários
const mockComments: ApiComment[] = [
  {
    id: 1,
    texto: "Este é um comentário teste",
    ticket_id: 3,
    usuario_id: 2,
    createdAt: "2025-05-15T02:05:33.000Z",
    updatedAt: "2025-05-15T02:36:14.000Z"
  },
  {
    id: 2,
    texto: "Outro comentário de teste",
    ticket_id: 3,
    usuario_id: 2,
    createdAt: "2025-05-15T02:10:33.000Z",
    updatedAt: "2025-05-15T02:40:14.000Z"
  }
];

const API_BASE_URL = 'https://server.starlaudo.com.br/api';

// Variável para controlar quando usamos dados reais ou mock
let useMockData = false;

// Função auxiliar para fazer requisições HTTP
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors', // Tentamos com CORS explícito
  });
  
  clearTimeout(id);
  return response;
};

// Verifica se conseguimos conectar à API real
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Verificando conexão com a API...');
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: 'GET' }, 5000);
    
    if (response.ok) {
      console.log('Conexão com a API estabelecida com sucesso!');
      useMockData = false;
      return true;
    } else {
      console.warn('API respondeu, mas com status de erro:', response.status);
      useMockData = true;
      return false;
    }
  } catch (error) {
    console.warn('Não foi possível conectar à API real, usando dados mock:', error);
    useMockData = true;
    return false;
  }
};

// Listar tickets por clínica
export const fetchTickets = async (clinicaId: number): Promise<ApiTicket[]> => {
  console.log('Buscando tickets para a clínica:', clinicaId);
  
  try {
    // Verificamos se estamos usando dados mock ou reais
    if (!useMockData) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tickets?clinica_id=${clinicaId}`, {
          method: 'GET'
        });
        
        if (response.ok) {
          const tickets = await response.json();
          console.log('Tickets recebidos da API real:', tickets);
          return tickets;
        } else {
          throw new Error(`Erro ao buscar tickets: ${response.status}`);
        }
      } catch (error) {
        console.warn('Erro ao buscar da API real, usando dados mock:', error);
        useMockData = true; // Fallback para dados mock
      }
    }
    
    // Simular um pequeno atraso para parecer que está buscando dados
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Retornando dados mock para tickets');
    return mockTickets;
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    toast({
      title: "Erro ao buscar tickets",
      description: "Não foi possível buscar os tickets. Usando dados locais.",
      variant: "destructive",
    });
    return mockTickets;
  }
};

// Simula um ID para novos tickets começando do último ID + 1
let nextTicketId = Math.max(...mockTickets.map(t => t.id)) + 1;

// Criar um novo ticket
export const createTicket = async (ticket: NewTicket): Promise<ApiTicket> => {
  console.log('Criando novo ticket:', ticket);
  
  try {
    // Tentamos criar na API real primeiro
    if (!useMockData) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tickets`, {
          method: 'POST',
          body: JSON.stringify(ticket)
        });
        
        if (response.ok) {
          const createdTicket = await response.json();
          console.log('Ticket criado na API real:', createdTicket);
          return createdTicket;
        } else {
          throw new Error(`Erro ao criar ticket: ${response.status}`);
        }
      } catch (error) {
        console.warn('Erro ao criar na API real, usando dados mock:', error);
        useMockData = true; // Fallback para dados mock
      }
    }
    
    // Simulação de criação local
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newTicket: ApiTicket = {
      id: nextTicketId++,
      titulo: ticket.titulo,
      descricao: ticket.descricao,
      status: ticket.status,
      prioridade: ticket.prioridade,
      clinica_id: ticket.clinica_id,
      usuario_id: ticket.usuario_id,
      responsavel_id: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Adiciona ao array de tickets mock
    mockTickets.unshift(newTicket);
    console.log('Ticket criado localmente (mock):', newTicket);
    
    return newTicket;
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    throw error;
  }
};

// Atualizar um ticket existente
export const updateTicket = async (ticketId: number, updates: UpdateTicket): Promise<ApiTicket> => {
  console.log(`Atualizando ticket ${ticketId}:`, updates);
  
  try {
    // Tentamos atualizar na API real primeiro
    if (!useMockData) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tickets/${ticketId}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
        
        if (response.ok) {
          const updatedTicket = await response.json();
          console.log('Ticket atualizado na API real:', updatedTicket);
          return updatedTicket;
        } else {
          throw new Error(`Erro ao atualizar ticket: ${response.status}`);
        }
      } catch (error) {
        console.warn('Erro ao atualizar na API real, usando dados mock:', error);
        useMockData = true; // Fallback para dados mock
      }
    }
    
    // Simulação de atualização local
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Encontra o ticket no array mock
    const ticketIndex = mockTickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) {
      throw new Error(`Ticket com ID ${ticketId} não encontrado`);
    }
    
    // Atualiza o ticket
    mockTickets[ticketIndex] = {
      ...mockTickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Ticket atualizado localmente (mock):', mockTickets[ticketIndex]);
    
    return mockTickets[ticketIndex];
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    throw error;
  }
};

// Deletar um ticket
export const deleteTicket = async (ticketId: number): Promise<void> => {
  console.log(`Deletando ticket ${ticketId}`);
  
  try {
    // Tentamos deletar na API real primeiro
    if (!useMockData) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tickets/${ticketId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          console.log('Ticket deletado na API real com sucesso');
          return;
        } else {
          throw new Error(`Erro ao deletar ticket: ${response.status}`);
        }
      } catch (error) {
        console.warn('Erro ao deletar na API real, usando dados mock:', error);
        useMockData = true; // Fallback para dados mock
      }
    }
    
    // Simulação de deleção local
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove o ticket do array mock
    const ticketIndex = mockTickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) {
      throw new Error(`Ticket com ID ${ticketId} não encontrado`);
    }
    
    mockTickets.splice(ticketIndex, 1);
    console.log('Ticket deletado localmente (mock)');
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    throw error;
  }
};

// Simula um ID para novos comentários
let nextCommentId = Math.max(...mockComments.map(c => c.id), 0) + 1;

// Listar comentários de um ticket
export const fetchComments = async (ticketId: number): Promise<ApiComment[]> => {
  console.log(`Buscando comentários para o ticket ${ticketId}`);
  
  try {
    // Verificamos se estamos usando dados mock ou reais
    if (!useMockData) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/comments?ticket_id=${ticketId}`, {
          method: 'GET'
        });
        
        if (response.ok) {
          const comments = await response.json();
          console.log('Comentários recebidos da API real:', comments);
          return comments;
        } else {
          throw new Error(`Erro ao buscar comentários: ${response.status}`);
        }
      } catch (error) {
        console.warn('Erro ao buscar comentários da API real, usando dados mock:', error);
        useMockData = true; // Fallback para dados mock
      }
    }
    
    // Simulação de busca local
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filtra os comentários pelo ticket_id
    const comments = mockComments.filter(c => c.ticket_id === ticketId);
    console.log('Comentários locais (mock):', comments);
    return comments;
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return [];
  }
};

// Criar um novo comentário
export const createComment = async (comment: NewComment): Promise<ApiComment> => {
  console.log('Criando novo comentário:', comment);
  
  try {
    // Tentamos criar na API real primeiro
    if (!useMockData) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/comments`, {
          method: 'POST',
          body: JSON.stringify(comment)
        });
        
        if (response.ok) {
          const createdComment = await response.json();
          console.log('Comentário criado na API real:', createdComment);
          return createdComment;
        } else {
          throw new Error(`Erro ao criar comentário: ${response.status}`);
        }
      } catch (error) {
        console.warn('Erro ao criar comentário na API real, usando dados mock:', error);
        useMockData = true; // Fallback para dados mock
      }
    }
    
    // Simulação de criação local
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newComment: ApiComment = {
      id: nextCommentId++,
      texto: comment.texto,
      ticket_id: comment.ticket_id,
      usuario_id: comment.usuario_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Adiciona ao array de comentários mock
    mockComments.push(newComment);
    console.log('Comentário criado localmente (mock):', newComment);
    
    return newComment;
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    throw error;
  }
};

// Inicializar a verificação da API
checkApiConnection().then(isConnected => {
  if (isConnected) {
    console.log('🟢 Usando API real para operações de dados');
  } else {
    console.log('🟠 Usando dados simulados (mock) para operações de dados');
  }
});
