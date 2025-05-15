
import { ApiTicket, ApiComment, NewTicket, UpdateTicket, NewComment } from '../types/kanban';

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

// Nova abordagem: sempre usamos dados mock e simulamos operações de API localmente
// Não precisamos mais tentar acessar a API real que está com problemas de CORS

// Listar tickets por clínica (sempre retorna dados mock)
export const fetchTickets = async (clinicaId: number): Promise<ApiTicket[]> => {
  console.log('Buscando tickets para a clínica:', clinicaId);
  
  // Simular um pequeno atraso para parecer que está buscando dados
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockTickets;
};

// Simula um ID para novos tickets começando do último ID + 1
let nextTicketId = Math.max(...mockTickets.map(t => t.id)) + 1;

// Criar um novo ticket (simulado)
export const createTicket = async (ticket: NewTicket): Promise<ApiTicket> => {
  console.log('Criando novo ticket:', ticket);
  
  // Simular um pequeno atraso
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
  
  return newTicket;
};

// Atualizar um ticket existente (simulado)
export const updateTicket = async (ticketId: number, updates: UpdateTicket): Promise<ApiTicket> => {
  console.log(`Atualizando ticket ${ticketId}:`, updates);
  
  // Simular um pequeno atraso
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
  
  return mockTickets[ticketIndex];
};

// Deletar um ticket (simulado)
export const deleteTicket = async (ticketId: number): Promise<void> => {
  console.log(`Deletando ticket ${ticketId}`);
  
  // Simular um pequeno atraso
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Remove o ticket do array mock
  const ticketIndex = mockTickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) {
    throw new Error(`Ticket com ID ${ticketId} não encontrado`);
  }
  
  mockTickets.splice(ticketIndex, 1);
};

// Simula um ID para novos comentários
let nextCommentId = 3; // Começando do 3 já que temos 2 comentários mock

// Listar comentários de um ticket (simulado)
export const fetchComments = async (ticketId: number): Promise<ApiComment[]> => {
  console.log(`Buscando comentários para o ticket ${ticketId}`);
  
  // Simular um pequeno atraso
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Filtra os comentários pelo ticket_id
  return mockComments.filter(c => c.ticket_id === ticketId);
};

// Criar um novo comentário (simulado)
export const createComment = async (comment: NewComment): Promise<ApiComment> => {
  console.log('Criando novo comentário:', comment);
  
  // Simular um pequeno atraso
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
  
  return newComment;
};
