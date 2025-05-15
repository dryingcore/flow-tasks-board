
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

export const addColumnOperation = (title: string, setState: React.Dispatch<React.SetStateAction<any>>) => {
  const newColumnId = `column-${uuidv4()}`;
  
  setState((prev: any) => {
    const newState = {
      ...prev,
      columns: {
        ...prev.columns,
        [newColumnId]: {
          id: newColumnId,
          title,
          taskIds: [],
        },
      },
      columnOrder: [...prev.columnOrder, newColumnId],
    };
    return newState;
  });

  toast({
    title: "Coluna adicionada",
    description: `${title} foi adicionada ao quadro.`,
  });
};

export const updateColumnOperation = (
  columnId: string, 
  title: string, 
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  setState((prev: any) => {
    const column = prev.columns[columnId];
    if (!column) return prev;

    const newState = {
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...column,
          title,
        },
      },
    };
    return newState;
  });

  toast({
    title: "Coluna atualizada",
    description: "O título da coluna foi atualizado.",
  });
};

export const deleteColumnOperation = (
  columnId: string, 
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  setState((prev: any) => {
    // Get all task IDs in this column
    const tasksToDelete = prev.columns[columnId].taskIds;
    
    // Create new objects without the deleted items
    const newColumns = { ...prev.columns };
    delete newColumns[columnId];
    
    const newTasks = { ...prev.tasks };
    tasksToDelete.forEach((taskId: string) => {
      delete newTasks[taskId];
    });
    
    const newColumnOrder = prev.columnOrder.filter((id: string) => id !== columnId);
    
    return {
      tasks: newTasks,
      columns: newColumns,
      columnOrder: newColumnOrder,
    };
  });

  toast({
    title: "Coluna removida",
    description: "A coluna e todas as suas tarefas foram excluídas.",
    variant: "destructive",
  });
};
