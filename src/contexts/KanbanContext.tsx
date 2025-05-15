import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { KanbanState, Task, Column, DragEndResult, Priority, ApiTicket, mapApiPriorityToKanban, mapStatusToColumn } from '../types/kanban';
import { loadState, saveState } from '../utils/storage';
import { toast } from '@/components/ui/use-toast';
import { fetchTickets } from '@/services/api';

interface KanbanContextProps {
  state: KanbanState;
  searchTerm: string;
  priorityFilter: Priority | 'all';
  loading: boolean;
  error: string | null;
  addTask: (columnId: string, task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
  addColumn: (title: string) => void;
  updateColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  handleDragEnd: (result: DragEndResult) => void;
  setSearchTerm: (term: string) => void;
  setPriorityFilter: (priority: Priority | 'all') => void;
  refreshData: () => Promise<void>;
}

const KanbanContext = createContext<KanbanContextProps | undefined>(undefined);

// Estado inicial para o kanban (será substituído pelos dados da API)
const initialState: KanbanState = {
  tasks: {},
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'A Fazer',
      taskIds: [],
    },
    'column-2': {
      id: 'column-2',
      title: 'Em Desenvolvimento',
      taskIds: [],
    },
    'column-3': {
      id: 'column-3',
      title: 'Em Teste',
      taskIds: [],
    },
    'column-4': {
      id: 'column-4',
      title: 'Concluído',
      taskIds: [],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
};

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<KanbanState>(initialState);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para converter os dados da API para o formato do Kanban
  const processApiData = (tickets: ApiTicket[]): KanbanState => {
    const newState = { ...initialState };
    
    // Limpar as listas de tarefas em cada coluna
    Object.keys(newState.columns).forEach(columnId => {
      newState.columns[columnId].taskIds = [];
    });

    // Processar cada ticket da API
    tickets.forEach(ticket => {
      // Criar um ID para a tarefa no formato que o Kanban espera
      const taskId = `task-${ticket.id}`;
      
      // Converter o ticket para o formato de tarefa do Kanban
      const task: Task = {
        id: taskId,
        title: ticket.titulo,
        description: ticket.descricao,
        priority: mapApiPriorityToKanban(ticket.prioridade),
        createdAt: ticket.createdAt,
      };
      
      // Adicionar a tarefa ao estado
      newState.tasks[taskId] = task;
      
      // Mapear o status do ticket para a coluna correspondente
      const columnId = mapStatusToColumn(ticket.status);
      
      // Adicionar o ID da tarefa à coluna apropriada
      if (newState.columns[columnId]) {
        newState.columns[columnId].taskIds.push(taskId);
      }
    });

    return newState;
  };

  // Função para buscar dados da API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const tickets = await fetchTickets(1); // Buscando tickets da clínica com ID 1
      const newState = processApiData(tickets);
      setState(newState);
      saveState(newState);
    } catch (err) {
      setError('Erro ao carregar dados da API');
      console.error(err);
      // Tentar carregar do localStorage como fallback
      const savedState = loadState();
      if (savedState) {
        setState(savedState);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função pública para forçar a atualização dos dados
  const refreshData = async () => {
    await fetchData();
    toast({
      title: "Dados atualizados",
      description: "Todos os cards foram atualizados com sucesso.",
    });
  };

  // Carregar dados da API ao iniciar
  useEffect(() => {
    fetchData();
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!loading && !error) {
      saveState(state);
    }
  }, [state, loading, error]);

  const addTask = (columnId: string, task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTaskId = `task-${uuidv4()}`;
    const newTask: Task = {
      ...task,
      id: newTaskId,
      createdAt: new Date().toISOString(),
    };

    const column = state.columns[columnId];

    setState((prev) => {
      const newState = {
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
      return newState;
    });

    toast({
      title: "Tarefa adicionada",
      description: `${task.title} foi adicionada com sucesso.`,
    });
  };

  const updateTask = (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => {
    setState((prev) => {
      const task = prev.tasks[taskId];
      if (!task) return prev;

      const newState = {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: {
            ...task,
            ...updatedTask,
          },
        },
      };
      return newState;
    });

    toast({
      title: "Tarefa atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const deleteTask = (taskId: string) => {
    setState((prev) => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];

      const newColumns = { ...prev.columns };
      for (const columnId in newColumns) {
        newColumns[columnId] = {
          ...newColumns[columnId],
          taskIds: newColumns[columnId].taskIds.filter((id) => id !== taskId),
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
  };

  const addColumn = (title: string) => {
    const newColumnId = `column-${uuidv4()}`;
    
    setState((prev) => {
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

  const updateColumn = (columnId: string, title: string) => {
    setState((prev) => {
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

  const deleteColumn = (columnId: string) => {
    setState((prev) => {
      // Get all task IDs in this column
      const tasksToDelete = prev.columns[columnId].taskIds;
      
      // Create new objects without the deleted items
      const newColumns = { ...prev.columns };
      delete newColumns[columnId];
      
      const newTasks = { ...prev.tasks };
      tasksToDelete.forEach(taskId => {
        delete newTasks[taskId];
      });
      
      const newColumnOrder = prev.columnOrder.filter(id => id !== columnId);
      
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

  const handleDragEnd = (result: DragEndResult) => {
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

      setState(prev => ({
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

      setState(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));
      return;
    }

    // Moving from one column to another
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

    setState(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));
  };

  const value = {
    state,
    searchTerm,
    priorityFilter,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    addColumn,
    updateColumn,
    deleteColumn,
    handleDragEnd,
    setSearchTerm,
    setPriorityFilter,
    refreshData,
  };

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
};

export const useKanban = (): KanbanContextProps => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};
