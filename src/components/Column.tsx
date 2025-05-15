
import { useState } from 'react';
import { Column as ColumnType } from '@/types/kanban';
import { useKanban } from '@/contexts/KanbanContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Task from './Task';
import { Edit, Plus, Trash2 } from 'lucide-react';
import TaskForm from './TaskForm';
import { Droppable } from '@/components/dnd/Droppable';
import { Draggable } from '@/components/dnd/Draggable';

interface ColumnProps {
  column: ColumnType;
  tasks: Array<{ id: string; title: string; description?: string; priority: 'low' | 'medium' | 'high'; dueDate?: string; createdAt: string }>;
  index: number;
}

const Column = ({ column, tasks, index }: ColumnProps) => {
  const { updateColumn, deleteColumn } = useKanban();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSave = () => {
    if (editedTitle.trim()) {
      updateColumn(column.id, editedTitle);
      setIsEditing(false);
    }
  };

  return (
    <Draggable draggableId={column.id} index={index} type="column">
      <div className="kanban-column">
        <div className="kanban-column-header">
          <h2>{column.title}</h2>
          <div className="flex">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Edit size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar coluna</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-1">
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a coluna "{column.title}" e todas as suas tarefas? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteColumn(column.id)}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-1">
                  <Plus size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar tarefa em {column.title}</DialogTitle>
                </DialogHeader>
                <TaskForm columnId={column.id} onComplete={() => setIsAddingTask(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Droppable droppableId={column.id} type="task">
          <div className="kanban-cards-container">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-24 border border-dashed rounded-md border-muted">
                <p className="text-sm text-muted-foreground">Sem tarefas</p>
              </div>
            ) : (
              tasks.map((task, taskIndex) => (
                <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                  <Task task={task} index={taskIndex} />
                </Draggable>
              ))
            )}
          </div>
        </Droppable>
      </div>
    </Draggable>
  );
};

export default Column;
