
import { useKanban } from '@/contexts/KanbanContext';
import { DragDropContext } from '@/components/dnd/DragDropContext';
import { Droppable } from '@/components/dnd/Droppable';
import Column from '@/components/Column';
import FilterBar from '@/components/FilterBar';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Index = () => {
  const { state, handleDragEnd, searchTerm, priorityFilter, addColumn } = useKanban();
  const [isClient, setIsClient] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  
  // Next.js hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Filter tasks based on search term and priority filter
  const getFilteredTasks = (columnId: string) => {
    const column = state.columns[columnId];
    if (!column) return [];
    
    return column.taskIds
      .map(taskId => state.tasks[taskId])
      .filter(task => {
        // Filter by search term
        const matchesSearch = !searchTerm || 
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Filter by priority
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        return matchesSearch && matchesPriority;
      });
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  if (!isClient) {
    return (
      <div className="container max-w-full py-6">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <div className="p-6 border-b sticky top-0 bg-background z-20">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-primary">Quadro Kanban</h1>
          <p className="text-muted-foreground">Organize suas tarefas com arrastar e soltar</p>
        </header>
        
        <FilterBar />
      </div>
      
      <div className="kanban-board p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="all-columns" type="column" className="flex gap-4 overflow-x-auto pb-4 pt-2 min-h-[calc(100vh-210px)]">
            <>
              {state.columnOrder.map((columnId, index) => {
                const column = state.columns[columnId];
                const tasks = getFilteredTasks(columnId);
                
                return (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                  />
                );
              })}
              
              {/* Botão para adicionar nova coluna ao final */}
              <div className="min-w-[280px] max-w-[280px]">
                <button
                  className="column-add-button w-full"
                  onClick={() => setIsAddingColumn(true)}
                >
                  <Plus size={16} className="mr-2" />
                  <span>Adicionar coluna</span>
                </button>
              </div>
            </>
          </Droppable>
        </DragDropContext>
      </div>
      
      <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar nova coluna</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="columnTitle">Título da coluna</Label>
              <Input
                id="columnTitle"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Ex: A fazer, Em andamento, Concluído"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingColumn(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddColumn}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
