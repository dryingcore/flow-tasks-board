
import { Comment } from '../../../types/kanban';
import { fetchComments, createComment } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

// Usuário para demonstração
const currentUser = {
  id: 2,
  nome: 'Usuário Atual'
};

export const fetchTaskCommentsOperation = async (ticketId: number): Promise<Comment[]> => {
  try {
    console.log(`Buscando comentários para o ticket ${ticketId}`);
    const apiComments = await fetchComments(ticketId);
    console.log('Comentários recebidos:', apiComments);
    
    // Converter para o formato do frontend
    return apiComments.map(comment => ({
      id: comment.id,
      text: comment.texto,
      ticketId: comment.ticket_id,
      userId: comment.usuario_id,
      userName: comment.usuario?.nome || currentUser.nome, // Fallback para usuário atual
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }));
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    toast({
      title: "Erro ao carregar comentários",
      description: "Não foi possível carregar os comentários. Verifique sua conexão com a API.",
      variant: "destructive",
    });
    
    // Retorna array vazio em caso de falha
    return [];
  }
};

export const addTaskCommentOperation = async (ticketId: number, text: string): Promise<Comment> => {
  try {
    console.log(`Adicionando comentário ao ticket ${ticketId}:`, text);
    
    // Criar comentário na API simulada
    const newApiComment = await createComment({
      texto: text,
      ticket_id: ticketId,
      usuario_id: currentUser.id
    });
    
    console.log('Comentário criado:', newApiComment);
    
    // Converter para o formato do frontend
    const newComment: Comment = {
      id: newApiComment.id,
      text: newApiComment.texto,
      ticketId: newApiComment.ticket_id,
      userId: newApiComment.usuario_id,
      userName: currentUser.nome,
      createdAt: newApiComment.createdAt,
      updatedAt: newApiComment.updatedAt
    };
    
    toast({
      title: "Comentário adicionado",
      description: "Seu comentário foi adicionado com sucesso.",
    });
    
    return newComment;
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    toast({
      title: "Erro ao adicionar comentário",
      description: "Não foi possível adicionar o comentário. Verifique sua conexão com a API.",
      variant: "destructive",
    });
    throw error;
  }
};
