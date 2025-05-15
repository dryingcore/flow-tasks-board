
import { KanbanState } from '../types/kanban';

const STORAGE_KEY = 'kanban-state';

export const DEFAULT_STATE: KanbanState = {
  tasks: {
    'task-1': { 
      id: 'task-1', 
      title: 'Criar design do projeto', 
      description: 'Desenvolver mockups e wireframes para o aplicativo', 
      priority: 'high', 
      dueDate: '2023-05-25',
      createdAt: new Date().toISOString()
    },
    'task-2': { 
      id: 'task-2', 
      title: 'Configurar ambiente de desenvolvimento', 
      description: 'Instalar dependências e configurar o projeto', 
      priority: 'medium',
      createdAt: new Date().toISOString()
    },
    'task-3': { 
      id: 'task-3', 
      title: 'Implementar componentes básicos', 
      description: 'Criar componentes reutilizáveis para a interface', 
      priority: 'low',
      dueDate: '2023-06-10',
      createdAt: new Date().toISOString()
    },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'A Fazer',
      taskIds: ['task-1', 'task-2'],
    },
    'column-2': {
      id: 'column-2',
      title: 'Em Progresso',
      taskIds: ['task-3'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Concluído',
      taskIds: [],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

export const saveState = (state: KanbanState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

export const loadState = (): KanbanState | undefined => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return DEFAULT_STATE;
    return JSON.parse(savedState) as KanbanState;
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return DEFAULT_STATE;
  }
};
