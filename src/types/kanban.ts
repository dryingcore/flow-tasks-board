export type Priority = 'low' | 'medium' | 'high';
export type ApiPriority = 'baixa' | 'media' | 'alta';
export type ApiStatus = 'aberto' | 'em_desenvolvimento' | 'em_teste' | 'concluido' | 'liberado';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  apiId: number; // ID original da API
}

export interface ApiTicket {
  id: number;
  titulo: string;
  descricao: string;
  status: ApiStatus;
  prioridade: ApiPriority;
  clinica_id: number;
  usuario_id: number;
  responsavel_id: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiComment {
  id: number;
  texto: string;
  ticket_id: number;
  usuario_id: number;
  createdAt: string;
  updatedAt: string;
  usuario?: {
    id: number;
    nome: string;
  };
}

export interface Comment {
  id: number;
  text: string;
  ticketId: number;
  userId: number;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewTicket {
  titulo: string;
  descricao: string;
  status: ApiStatus;
  prioridade: ApiPriority;
  clinica_id: number;
  usuario_id: number;
}

export interface UpdateTicket {
  titulo?: string;
  descricao?: string;
  status?: ApiStatus;
  prioridade?: ApiPriority;
  responsavel_id?: number | null;
}

export interface NewComment {
  texto: string;
  ticket_id: number;
  usuario_id: number;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface KanbanState {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

export interface DragEndResult {
  destination?: {
    droppableId: string;
    index: number;
  };
  source: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
  type: string;
}

export const mapApiPriorityToKanban = (priority: ApiPriority): Priority => {
  switch (priority) {
    case 'alta': return 'high';
    case 'media': return 'medium';
    case 'baixa': return 'low';
    default: return 'medium';
  }
};

export const mapKanbanPriorityToApi = (priority: Priority): ApiPriority => {
  switch (priority) {
    case 'high': return 'alta';
    case 'medium': return 'media';
    case 'low': return 'baixa';
    default: return 'media';
  }
};

export const mapStatusToColumn = (status: ApiStatus): string => {
  switch (status) {
    case 'aberto': return 'column-1';
    case 'em_desenvolvimento': return 'column-2';
    case 'em_teste': return 'column-3';
    case 'liberado':
    case 'concluido': return 'column-4';
    default: return 'column-1';
  }
};

export const mapColumnToStatus = (columnId: string): ApiStatus => {
  switch (columnId) {
    case 'column-1': return 'aberto';
    case 'column-2': return 'em_desenvolvimento';
    case 'column-3': return 'em_teste';
    case 'column-4': return 'concluido';
    default: return 'aberto';
  }
};

export interface KanbanContextProps {
  state: KanbanState;
  searchTerm: string;
  priorityFilter: Priority | 'all';
  loading: boolean;
  error: string | null;
  addTask: (columnId: string, task: Omit<Task, 'id' | 'createdAt' | 'apiId'>) => Promise<Task>; 
  updateTask: (taskId: string, updatedTask: Partial<Omit<Task, 'id>>) => Promise<void>;
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
  isConnectedToApi?: boolean;
}
