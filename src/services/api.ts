
// Importações necessárias
import { ApiTicket, ApiComment, NewTicket, UpdateTicket, NewComment } from '../types/kanban';
import { toast } from '@/components/ui/use-toast';
import { getApiSettings, getApiUrl, getRequestBody, testApiConnection } from '@/utils/apiSettingsService';
import { fetchWithProxy } from './proxyService';

// Função auxiliar para fazer requisições HTTP com timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Usar nosso serviço de proxy para fazer requisições
    const response = await fetchWithProxy(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Verifica se conseguimos conectar à API real
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Verificando conexão com a API...');
    const isConnected = await testApiConnection();
    
    if (isConnected) {
      console.log('Conexão com a API estabelecida com sucesso!');
      return true;
    } else {
      console.warn('API respondeu, mas com status de erro ou não foi possível conectar');
      return false;
    }
  } catch (error) {
    console.error('Erro ao verificar conexão com a API:', error);
    return false;
  }
};

// Listar tickets por clínica
export const fetchTickets = async (clinicaId: number): Promise<ApiTicket[]> => {
  console.log('Buscando tickets para a clínica:', clinicaId);
  
  try {
    // Buscar dados reais da API
    const url = getApiUrl('getTickets', clinicaId);
    console.log('URL para buscar tickets:', url);
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Verificar se a resposta foi bem sucedida
    if (!response.ok) {
      throw new Error(`Erro ao buscar tickets: ${response.status} ${response.statusText}`);
    }
    
    const tickets = await response.json();
    console.log('Tickets recebidos da API real:', tickets);
    
    if (!Array.isArray(tickets)) {
      console.error('API não retornou um array para tickets:', tickets);
      throw new Error('Formato de resposta inválido da API');
    }
    
    // Retornamos dados reais da API
    return tickets;
  } catch (error) {
    console.error('Erro ao buscar da API real:', error);
    
    // Notificamos ao usuário que houve erro na API
    toast({
      title: "Erro ao buscar tickets",
      description: "Houve um erro ao comunicar-se com a API. Por favor, verifique sua conexão.",
      variant: "destructive",
    });
    
    // Se a API falhou, retornamos um array vazio
    throw error;
  }
};

// Criar um novo ticket
export const createTicket = async (ticket: NewTicket): Promise<ApiTicket> => {
  console.log('Criando novo ticket:', ticket);
  
  try {
    const url = getApiUrl('createTicket');
    console.log('URL para criar ticket:', url);
    
    // Obter modelo de requisição da configuração
    const requestBody = getRequestBody('createTicket', ticket);
    console.log('Corpo da requisição:', requestBody);
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const createdTicket = await response.json();
      console.log('Ticket criado na API real:', createdTicket);
      return createdTicket;
    } else {
      throw new Error(`Erro ao criar ticket: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao criar na API real:', error);
    
    // Notificar o erro ao usuário
    toast({
      title: "Erro ao criar ticket",
      description: "Não foi possível criar o ticket na API. Verifique sua conexão.",
      variant: "destructive",
    });
    
    // Propagar o erro para tratamento superior
    throw error;
  }
};

// Atualizar um ticket existente
export const updateTicket = async (ticketId: number, updates: UpdateTicket): Promise<ApiTicket> => {
  console.log(`Atualizando ticket ${ticketId}:`, updates);
  
  try {
    const url = getApiUrl('updateTicket', ticketId);
    console.log('URL para atualizar ticket:', url);
    
    // Obter modelo de requisição da configuração
    const requestBody = getRequestBody('updateTicket', updates);
    console.log('Corpo da requisição:', requestBody);
    
    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const updatedTicket = await response.json();
      console.log('Ticket atualizado na API real:', updatedTicket);
      return updatedTicket;
    } else {
      throw new Error(`Erro ao atualizar ticket: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    toast({
      title: "Erro ao atualizar ticket",
      description: "Não foi possível atualizar o ticket. Verifique sua conexão.",
      variant: "destructive",
    });
    throw error;
  }
};

// Deletar um ticket
export const deleteTicket = async (ticketId: number): Promise<void> => {
  console.log(`Deletando ticket ${ticketId}`);
  
  try {
    const url = getApiUrl('deleteTicket', ticketId);
    console.log('URL para deletar ticket:', url);
    
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('Ticket deletado na API real com sucesso');
      return;
    } else {
      throw new Error(`Erro ao deletar ticket: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    toast({
      title: "Erro ao deletar ticket",
      description: "Não foi possível deletar o ticket. Verifique sua conexão.",
      variant: "destructive",
    });
    throw error;
  }
};

// Listar comentários de um ticket
export const fetchComments = async (ticketId: number): Promise<ApiComment[]> => {
  console.log(`Buscando comentários para o ticket ${ticketId}`);
  
  try {
    // Usar a rota de comentários com o ID do ticket
    const url = getApiUrl('getComments', ticketId);
    console.log('URL para buscar comentários:', url);
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const comments = await response.json();
      console.log('Comentários recebidos da API real:', comments);
      
      // Mapeia os campos da API para o formato interno
      const mappedComments = comments.map((comment: any) => ({
        id: comment.id,
        texto: comment.comentario, // Mapeia 'comentario' para 'texto' internamente
        ticket_id: comment.ticket_id,
        usuario_id: comment.usuario_id,
        createdAt: comment.createdAt || comment.created_at || new Date().toISOString(),
        updatedAt: comment.updatedAt || comment.updated_at || new Date().toISOString()
      }));
      
      return mappedComments;
    } else {
      throw new Error(`Erro ao buscar comentários: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    toast({
      title: "Erro ao buscar comentários",
      description: "Não foi possível buscar os comentários. Verifique sua conexão.",
      variant: "destructive",
    });
    return [];
  }
};

// Criar um novo comentário
export const createComment = async (comment: NewComment): Promise<ApiComment> => {
  console.log('Criando novo comentário:', comment);
  
  try {
    const url = getApiUrl('createComment');
    console.log('URL para criar comentário:', url);
    
    // Adaptar para o formato que a API espera
    const requestBody = {
      ticket_id: comment.ticket_id,
      usuario_id: comment.usuario_id,
      comentario: comment.texto // A API espera 'comentario', não 'texto'
    };
    
    console.log('Corpo da requisição:', requestBody);
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (response.ok) {
      const createdComment = await response.json();
      console.log('Comentário criado na API real:', createdComment);
      
      // Converter resposta da API para o formato interno
      const mappedComment: ApiComment = {
        id: createdComment.id,
        texto: createdComment.comentario, // Mapeia 'comentario' para 'texto' internamente
        ticket_id: createdComment.ticket_id,
        usuario_id: createdComment.usuario_id,
        createdAt: createdComment.createdAt || createdComment.created_at || new Date().toISOString(),
        updatedAt: createdComment.updatedAt || createdComment.updated_at || new Date().toISOString()
      };
      
      return mappedComment;
    } else {
      throw new Error(`Erro ao criar comentário: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    toast({
      title: "Erro ao criar comentário",
      description: "Não foi possível adicionar o comentário. Verifique sua conexão.",
      variant: "destructive",
    });
    throw error;
  }
};

// Inicializar a verificação da API com notificação clara
checkApiConnection().then(isConnected => {
  console.log(`Status da API: ${isConnected ? 'CONECTADA' : 'DESCONECTADA'}`);
  
  if (isConnected) {
    console.log('🟢 Usando API real para operações de dados');
    toast({
      title: "API Conectada",
      description: "Usando dados reais do servidor.",
    });
  } else {
    console.log('🔴 Falha ao conectar com a API');
    toast({
      title: "API Indisponível",
      description: "Não foi possível conectar à API. Verifique sua conexão ou as configurações de API.",
      variant: "destructive",
    });
  }
});
