
import { useContext } from 'react';
import { KanbanContext } from './KanbanContext';
import { KanbanContextProps } from '../../types/kanban';

export const useKanban = (): KanbanContextProps => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
};
