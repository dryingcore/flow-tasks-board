
import { useKanban } from '@/contexts/KanbanContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const FilterBar = () => {
  const { searchTerm, setSearchTerm, priorityFilter, setPriorityFilter } = useKanban();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 py-2 z-10">
      <div className="flex-1 w-full md:w-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar tarefas"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <div className="w-full md:w-[180px]">
          <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <ThemeToggle />
      </div>
    </div>
  );
};

export default FilterBar;
