
export type Priority = 'low' | 'medium' | 'high';
export type ApiPriority = 'baixa' | 'media' | 'alta';
export type ApiStatus = 'aberto' | 'em_desenvolvimento' | 'em_teste' | 'concluido';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
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

export const mapStatusToColumn = (status: ApiStatus): string => {
  switch (status) {
    case 'aberto': return 'column-1';
    case 'em_desenvolvimento': return 'column-2';
    case 'em_teste': return 'column-3';
    case 'concluido': return 'column-4';
    default: return 'column-1';
  }
};
