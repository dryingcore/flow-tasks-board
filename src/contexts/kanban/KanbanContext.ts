
import { createContext } from 'react';
import { KanbanContextProps } from '../../types/kanban';

// Create the context with undefined as initial value
export const KanbanContext = createContext<KanbanContextProps | undefined>(undefined);
