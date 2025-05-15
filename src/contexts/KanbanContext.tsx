
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  KanbanState, 
  Task, 
  Column, 
  DragEndResult, 
  Priority, 
  ApiTicket, 
  mapApiPriorityToKanban, 
  mapStatusToColumn,
  mapColumnToStatus,
  mapKanbanPriorityToApi,
  Comment, 
  ApiComment, 
  UpdateTicket,
  NewTicket
} from '../types/kanban';
import { loadState, saveState } from '../utils/storage';
import { toast } from '@/components/ui/use-toast';
import { 
  fetchTickets, 
  createTicket, 
  updateTicket, 
  deleteTicket as apiDeleteTicket,
  fetchComments,
  createComment
} from '@/services/api';

interface KanbanContextProps {
  state: KanbanState;
  searchTerm: string;
  priorityFilter: Priority | 'all';
  loading: boolean;
  error: string | null;
  addTask: (columnId: string, task: Omit<Task, 'id' | 'createdAt' | 'apiId'>) => Promise<void>;
  updateTask: (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addColumn: (title: string) => void;
  updateColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  handleDragEnd: (result: DragEndResult) => void;
  setSearchTerm: (term: string) => void;
  setPriorityFilter: (priority: Priority | 'all') => void;
  refreshData: () => Promise<void>;
  fetchTaskComments: (ticketId: number) => Promise<Comment[]>;
  addTaskComment: (ticketId: number, text: string) => Promise<Comment>;
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

  // Usuário mockado para demonstração
  const currentUser = {
    id: 2,  // Este ID deve corresponder a um usuário válido na API
    nome: 'Usuário Atual'
  };

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
        apiId: ticket.id,  // Guardar o ID original da API
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

  // Função para adicionar uma nova tarefa
  const addTask = async (columnId: string, task: Omit<Task, 'id' | 'createdAt' | 'apiId'>) => {
    try {
      // Criar um novo ticket na API
      const apiStatus = mapColumnToStatus(columnId);
      const newApiTicket: NewTicket = {
        titulo: task.title,
        descricao: task.description || '',
        status: apiStatus,
        prioridade: mapKanbanPriorityToApi(task.priority),
        clinica_id: 1, // ID da clínica (fixo para demonstração)
        usuario_id: currentUser.id, // ID do usuário atual
      };
      
      // Enviar para a API
      const createdTicket = await createTicket(newApiTicket);
      
      // Criar a tarefa local com o ID retornado da API
      const newTaskId = `task-${createdTicket.id}`;
      const newTask: Task = {
        ...task,
        id: newTaskId,
        apiId: createdTicket.id,
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
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Função para atualizar uma tarefa existente
  const updateTask = async (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => {
    try {
      const task = state.columns 
        ? Object.values(state.columns).flatMap(col => 
            col.taskIds.filter(id => id === taskId).map(id => state.tasks[id])
          ).find(Boolean) 
        : null;
      
      if (!task || !task.apiId) {
        throw new Error('Tarefa não encontrada');
      }

      // Encontrar em qual coluna a tarefa está atualmente
      let currentColumnId = '';
      for (const [columnId, column] of Object.entries(state.columns)) {
        if (column.taskIds.includes(taskId)) {
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
      setState((prev) => {
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
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Função para excluir uma tarefa
  const deleteTask = async (taskId: string) => {
    try {
      const task = state.tasks[taskId];
      if (!task || !task.apiId) {
        throw new Error('Tarefa não encontrada');
      }

      // Excluir na API
      await apiDeleteTicket(task.apiId);

      // Atualizar o estado local
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
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível remover a tarefa. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Buscar comentários de uma tarefa
  const fetchTaskComments = async (ticketId: number): Promise<Comment[]> => {
    try {
      const apiComments = await fetchComments(ticketId);
      return apiComments.map(comment => ({
        id: comment.id,
        text: comment.texto,
        ticketId: comment.ticket_id,
        userId: comment.usuario_id,
        userName: comment.usuario?.nome || 'Usuário Desconhecido',
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }));
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast({
        title: "Erro ao carregar comentários",
        description: "Não foi possível carregar os comentários. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Adicionar comentário a uma tarefa
  const addTaskComment = async (ticketId: number, text: string): Promise<Comment> => {
    try {
      const newApiComment = await createComment({
        texto: text,
        ticket_id: ticketId,
        usuario_id: currentUser.id
      });
      
      // Converter para o formato do frontend
      return {
        id: newApiComment.id,
        text: newApiComment.texto,
        ticketId: newApiComment.ticket_id,
        userId: newApiComment.usuario_id,
        userName: currentUser.nome,
        createdAt: newApiComment.createdAt,
        updatedAt: newApiComment.updatedAt
      };
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar o comentário. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
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

  const handleDragEnd = async (result: DragEndResult) => {
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

      setState(prev => ({
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
    fetchTaskComments,
    addTaskComment,
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
