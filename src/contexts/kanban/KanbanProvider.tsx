
import React, { useState, useEffect, ReactNode } from 'react';
import { KanbanContext } from './KanbanContext';
import { KanbanState, Task, Column, DragEndResult, Priority, Comment } from '../../types/kanban';
import { loadState, saveState } from '../../utils/storage';
import { 
  addTaskOperation, 
  updateTaskOperation, 
  deleteTaskOperation 
} from './utils/taskOperations';
import { 
  addColumnOperation, 
  updateColumnOperation, 
  deleteColumnOperation 
} from './utils/columnOperations';
import { 
  handleDragEndOperation 
} from './utils/dragOperations';
import { 
  fetchTaskCommentsOperation, 
  addTaskCommentOperation 
} from './utils/commentOperations';
import {
  fetchData,
  refreshDataOperation
} from './utils/dataFetchOperations';

// Estado inicial para o kanban
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

interface KanbanProviderProps {
  children: ReactNode;
}

export const KanbanProvider: React.FC<KanbanProviderProps> = ({ children }) => {
  const [state, setState] = useState<KanbanState>(initialState);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectedToApi, setIsConnectedToApi] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch data from API
  const fetchDataHandler = async () => {
    await fetchData(
      initialState,
      setLoading,
      setError,
      setIsConnectedToApi,
      setState
    );
  };

  // Refresh data handler
  const refreshData = async () => {
    await refreshDataOperation(
      setIsRefreshing,
      setIsConnectedToApi,
      fetchDataHandler
    );
  };

  // Load data on component mount
  useEffect(() => {
    fetchDataHandler();
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!loading && !error) {
      saveState(state);
    }
  }, [state, loading, error]);

  // Task operations
  const addTask = (columnId: string, task: Omit<Task, 'id' | 'createdAt' | 'apiId'>) => {
    return addTaskOperation(columnId, task, setState);
  };

  const updateTask = async (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => {
    return updateTaskOperation(taskId, updatedTask, state, setState);
  };

  const deleteTask = async (taskId: string) => {
    return deleteTaskOperation(taskId, state, setState);
  };

  // Column operations
  const addColumn = (title: string) => {
    addColumnOperation(title, setState);
  };

  const updateColumn = (columnId: string, title: string) => {
    updateColumnOperation(columnId, title, setState);
  };

  const deleteColumn = (columnId: string) => {
    deleteColumnOperation(columnId, setState);
  };

  // Drag and drop operations
  const handleDragEnd = async (result: DragEndResult) => {
    handleDragEndOperation(result, state, setState, fetchDataHandler);
  };

  // Comment operations
  const fetchTaskComments = async (ticketId: number): Promise<Comment[]> => {
    return fetchTaskCommentsOperation(ticketId);
  };

  const addTaskComment = async (ticketId: number, text: string): Promise<Comment> => {
    return addTaskCommentOperation(ticketId, text);
  };

  const contextValue = {
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
    isConnectedToApi
  };

  return (
    <KanbanContext.Provider value={contextValue}>
      {children}
    </KanbanContext.Provider>
  );
};
