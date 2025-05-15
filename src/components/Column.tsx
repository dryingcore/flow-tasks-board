
import { useState } from 'react';
import { Column as ColumnType } from '@/types/kanban';
import { useKanban } from '@/contexts/KanbanContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Task from './Task';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import TaskForm from './TaskForm';
import { Droppable } from '@/components/dnd/Droppable';
import { Draggable } from '@/components/dnd/Draggable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ColumnProps {
  column: ColumnType;
  tasks: Array<{ id: string; title: string; description?: string; priority: 'low' | 'medium' | 'high'; dueDate?: string; createdAt: string; apiId: number }>;
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

  const taskCount = tasks.length;

  return (
    <Draggable draggableId={column.id} index={index} type="column">
      <div className="kanban-column">
        {/* Column header with draggable handle */}
        <div className="kanban-column-header" data-drag-handle>
          <div className="flex items-center">
            <h2>{column.title}</h2>
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{taskCount}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit size={14} className="mr-2" /> Renomear coluna
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive">
                <Trash2 size={14} className="mr-2" /> Excluir coluna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tasks container - separate from column header */}
        <Droppable droppableId={column.id} type="task">
          <div className="kanban-cards-container">
            {tasks.map((task, taskIndex) => (
              <Draggable key={task.id} draggableId={task.id} index={taskIndex} type="task">
                <Task task={task} index={taskIndex} />
              </Draggable>
            ))}
            
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-24 border border-dashed rounded-md border-muted text-sm text-muted-foreground">
                Sem tarefas
              </div>
            )}
          </div>
        </Droppable>
        
        {/* Botão para adicionar tarefa no estilo Trello */}
        <div className="pt-2 mt-1">
          <button
            className="add-card-button"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus size={16} className="mr-2" />
            Adicionar tarefa
          </button>
        </div>

        {/* Diálogos para editar coluna, excluir coluna e adicionar tarefa */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
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
                  autoFocus
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar tarefa em {column.title}</DialogTitle>
            </DialogHeader>
            <TaskForm columnId={column.id} onComplete={() => setIsAddingTask(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </Draggable>
  );
};

export default Column;
