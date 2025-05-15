
import { DragEndResult } from '../../../types/kanban';
import { mapColumnToStatus } from '../../../types/kanban';
import { updateTicket } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export const handleDragEndOperation = async (
  result: DragEndResult,
  state: any,
  setState: React.Dispatch<React.SetStateAction<any>>,
  fetchData: () => Promise<void>
) => {
  const { destination, source, draggableId, type } = result;

  // Drop outside a droppable area
  if (!destination) {
    return;
  }

  // Dropped in the same position
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return;
  }

  // Handling column reordering
  if (type === 'column') {
    const newColumnOrder = Array.from(state.columnOrder);
    newColumnOrder.splice(source.index, 1);
    newColumnOrder.splice(destination.index, 0, draggableId);

    setState((prev: any) => ({
      ...prev,
      columnOrder: newColumnOrder
    }));
    return;
  }

  // Handle task movement within the same column
  const start = state.columns[source.droppableId];
  const finish = state.columns[destination.droppableId];

  if (start === finish) {
    const newTaskIds = Array.from(start.taskIds);
    newTaskIds.splice(source.index, 1);
    newTaskIds.splice(destination.index, 0, draggableId);

    const newColumn = {
      ...start,
      taskIds: newTaskIds,
    };

    setState((prev: any) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newColumn.id]: newColumn,
      },
    }));
    return;
  }

  // Moving from one column to another
  try {
    // Obter o task que está sendo movido
    const task = state.tasks[draggableId];
    if (!task || !task.apiId) {
      throw new Error('Tarefa não encontrada');
    }

    // Mapear a nova coluna para o status correspondente na API
    const newStatus = mapColumnToStatus(destination.droppableId);
    
    // Atualizar o status na API
    await updateTicket(task.apiId, { status: newStatus });
    
    // Atualizar localmente
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    setState((prev: any) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));

    toast({
      title: "Ticket movido",
      description: `Ticket movido para ${finish.title}.`,
    });
  } catch (error) {
    console.error("Erro ao atualizar status do ticket:", error);
    toast({
      title: "Erro ao mover ticket",
      description: "Não foi possível atualizar o status. A operação será revertida.",
      variant: "destructive",
    });
    
    // Reverter para o estado anterior em caso de erro
    fetchData();
  }
};
