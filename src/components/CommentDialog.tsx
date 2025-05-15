
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment, Task } from '@/types/kanban';
import { useKanban } from '@/contexts/KanbanContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, MessageSquare, RefreshCw } from 'lucide-react';

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

  const loadComments = async () => {
    if (!task.apiId) return;
    
    setIsLoading(true);
    try {
      const taskComments = await fetchTaskComments(task.apiId);
      setComments(taskComments);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
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
    
    try {
      const comment = await addTaskComment(task.apiId, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
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
            className="resize-none"
          />
          <Button onClick={handleAddComment} size="icon">
            <Send className="h-4 w-4" />
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
