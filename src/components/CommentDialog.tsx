
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment, Task } from '@/types/kanban';
import { useKanban } from '@/contexts/KanbanContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CommentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

const CommentDialog = ({ isOpen, onOpenChange, task }: CommentDialogProps) => {
  const { fetchTaskComments, addTaskComment } = useKanban();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    if (!task.apiId) return;
    
    setIsLoading(true);
    try {
      const taskComments = await fetchTaskComments(task.apiId);
      setComments(taskComments);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comentários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshComments = async () => {
    setRefreshing(true);
    await loadComments();
    setRefreshing(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task.apiId) return;
    
    setSubmitting(true);
    try {
      const comment = await addTaskComment(task.apiId, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enviar comentário ao pressionar Ctrl+Enter ou Command+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAddComment();
    }
  };

  useEffect(() => {
    if (isOpen && task.apiId) {
      loadComments();
    }
  }, [isOpen, task.apiId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Comentários - {task.title}
          </DialogTitle>
        </DialogHeader>
        
        {/* Área de adição de comentário */}
        <div className="flex items-end gap-2 mb-4">
          <Textarea 
            placeholder="Digite seu comentário aqui..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitting}
            className="resize-none"
          />
          <Button 
            onClick={handleAddComment} 
            size="icon"
            disabled={!newComment.trim() || submitting}
            aria-label="Enviar comentário"
          >
            <Send className={`h-4 w-4 ${submitting ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-0 right-0" 
            onClick={refreshComments}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Lista de comentários */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="animate-spin h-6 w-6 text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum comentário encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
