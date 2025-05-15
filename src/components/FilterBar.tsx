
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SettingsButton from './SettingsButton';
import { useKanban } from '@/contexts/KanbanContext';
import ThemeToggle from './ThemeToggle';
import { Priority } from '@/types/kanban';

const FilterBar: React.FC = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    priorityFilter, 
    setPriorityFilter, 
    refreshData,
    isConnectedToApi 
  } = useKanban();
  
  return (
    <div className="p-4 bg-card border-b mb-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={priorityFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setPriorityFilter('all')}
            className="flex-1 md:flex-none"
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={priorityFilter === 'high' ? 'default' : 'outline'}
            onClick={() => setPriorityFilter('high')}
            className="flex-1 md:flex-none"
          >
            Alta
          </Button>
          <Button
            size="sm"
            variant={priorityFilter === 'medium' ? 'default' : 'outline'}
            onClick={() => setPriorityFilter('medium')}
            className="flex-1 md:flex-none"
          >
            Média
          </Button>
          <Button
            size="sm"
            variant={priorityFilter === 'low' ? 'default' : 'outline'}
            onClick={() => setPriorityFilter('low')}
            className="flex-1 md:flex-none"
          >
            Baixa
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant={isConnectedToApi ? "default" : "destructive"}>
            {isConnectedToApi ? "API Conectada" : "API Desconectada"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <SettingsButton />
          <Button size="sm" onClick={refreshData}>
            Atualizar
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
