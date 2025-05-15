
import { Task, UpdateTicket, mapKanbanPriorityToApi, mapColumnToStatus } from '../../../types/kanban';
import { toast } from '@/components/ui/use-toast';
import { createTicket, updateTicket, deleteTicket } from '@/services/api';

// Current user for demo purposes
const currentUser = {
  id: 2,
  nome: 'Usuário Atual'
};

export const addTaskOperation = async (
  columnId: string, 
  task: Omit<Task, 'id' | 'createdAt' | 'apiId'>, 
  setState: React.Dispatch<React.SetStateAction<any>>
): Promise<Task> => {
  try {
    console.log('Adicionando nova tarefa na coluna:', columnId);
    console.log('Dados da tarefa:', task);
    
    // Criar um novo ticket na API
    const apiStatus = mapColumnToStatus(columnId);
    const newApiTicket = {
      titulo: task.title,
      descricao: task.description || '',
      status: apiStatus,
      prioridade: mapKanbanPriorityToApi(task.priority),
      clinica_id: 1, // ID da clínica (fixo para demonstração)
      usuario_id: currentUser.id, // ID do usuário atual
    };
    
    // Enviar para a API
    const createdTicket = await createTicket(newApiTicket);
    console.log('Ticket criado na API:', createdTicket);
    
    // Criar a tarefa local com o ID retornado da API
    const newTaskId = `task-${createdTicket.id}`;
    const newTask: Task = {
      ...task,
      id: newTaskId,
      apiId: createdTicket.id,
      createdAt: new Date().toISOString(),
    };

    setState((prev: any) => {
      const column = prev.columns[columnId];
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [newTaskId]: newTask,
        },
        columns: {
          ...prev.columns,
          [columnId]: {
            ...column,
            taskIds: [...column.taskIds, newTaskId],
          },
        },
      };
    });

    toast({
      title: "Tarefa adicionada",
      description: `${task.title} foi adicionada com sucesso.`,
    });
    
    return newTask;
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    toast({
      title: "Erro ao adicionar tarefa",
      description: "Não foi possível criar a tarefa. Verifique sua conexão com a API.",
      variant: "destructive",
    });
    throw error;
  }
};

export const updateTaskOperation = async (
  taskId: string, 
  updatedTask: Partial<Omit<Task, 'id'>>, 
  state: any, 
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const task = state.columns 
      ? Object.values(state.columns).flatMap((col: any) => 
          col.taskIds.filter((id: string) => id === taskId).map((id: string) => state.tasks[id])
        ).find(Boolean) 
      : null;
    
    if (!task || !task.apiId) {
      throw new Error('Tarefa não encontrada');
    }

    // Encontrar em qual coluna a tarefa está atualmente
    let currentColumnId = '';
    for (const [columnId, column] of Object.entries(state.columns)) {
      if ((column as any).taskIds.includes(taskId)) {
        currentColumnId = columnId;
        break;
      }
    }

    // Preparar a atualização para a API
    const apiUpdates: UpdateTicket = {};
    
    if (updatedTask.title) {
      apiUpdates.titulo = updatedTask.title;
    }
    
    if (updatedTask.description !== undefined) {
      apiUpdates.descricao = updatedTask.description;
    }
    
    if (updatedTask.priority) {
      apiUpdates.prioridade = mapKanbanPriorityToApi(updatedTask.priority);
    }
    
    // Enviar atualizações para a API
    if (Object.keys(apiUpdates).length > 0) {
      await updateTicket(task.apiId, apiUpdates);
    }

    // Atualizar o estado local
    setState((prev: any) => {
      const updatedTasks = {
        ...prev.tasks,
        [taskId]: {
          ...prev.tasks[taskId],
          ...updatedTask,
        },
      };
      
      return {
        ...prev,
        tasks: updatedTasks,
      };
    });

    toast({
      title: "Tarefa atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    toast({
      title: "Erro ao atualizar",
      description: "Não foi possível salvar as alterações. Verifique sua conexão com a API.",
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteTaskOperation = async (
  taskId: string, 
  state: any, 
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    const task = state.tasks[taskId];
    if (!task || !task.apiId) {
      throw new Error('Tarefa não encontrada');
    }

    // Excluir na API
    await deleteTicket(task.apiId);

    // Atualizar o estado local
    setState((prev: any) => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];

      const newColumns = { ...prev.columns };
      for (const columnId in newColumns) {
        newColumns[columnId] = {
          ...newColumns[columnId],
          taskIds: newColumns[columnId].taskIds.filter((id: string) => id !== taskId),
        };
      }

      return {
        ...prev,
        tasks: newTasks,
        columns: newColumns,
      };
    });

    toast({
      title: "Tarefa removida",
      description: "A tarefa foi excluída com sucesso.",
      variant: "destructive",
    });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    toast({
      title: "Erro ao excluir",
      description: "Não foi possível remover a tarefa. Verifique sua conexão com a API.",
      variant: "destructive",
    });
    throw error;
  }
};
