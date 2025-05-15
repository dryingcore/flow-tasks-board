
import { useKanban } from '@/contexts/KanbanContext';
import { DragDropContext } from '@/components/dnd/DragDropContext';
import { Droppable } from '@/components/dnd/Droppable';
import Column from '@/components/Column';
import FilterBar from '@/components/FilterBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';

const Index = () => {
  const { state, handleDragEnd, searchTerm, priorityFilter } = useKanban();
  const [isClient, setIsClient] = useState(false);
  
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

  if (!isClient) {
    return (
      <div className="container max-w-full py-6">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-full py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Quadro Kanban</h1>
        <p className="text-muted-foreground">Organize suas tarefas com arrastar e soltar</p>
      </header>
      
      <FilterBar />
      
      <ScrollArea className="h-[calc(100vh-200px)] w-full">
        <div className="p-2">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="all-columns" type="column" className="flex gap-4 overflow-x-auto pb-4 pt-2 min-h-[calc(100vh-210px)]">
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
            </Droppable>
          </DragDropContext>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Index;
