
import { useKanban } from '@/contexts/KanbanContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const FilterBar = () => {
  const { searchTerm, setSearchTerm, priorityFilter, setPriorityFilter, addColumn } = useKanban();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      setValidationError('O título da coluna é obrigatório');
      return;
    }
    
    addColumn(newColumnTitle);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 py-4 sticky top-0 bg-background z-10">
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
        
        <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Nova Coluna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar nova coluna</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-2">
                <Label htmlFor="columnTitle">Título da coluna</Label>
                <Input
                  id="columnTitle"
                  value={newColumnTitle}
                  onChange={(e) => {
                    setNewColumnTitle(e.target.value);
                    if (e.target.value.trim()) setValidationError('');
                  }}
                  className={validationError ? 'border-destructive' : ''}
                />
                {validationError && (
                  <p className="text-sm text-destructive">{validationError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingColumn(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddColumn}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <ThemeToggle />
      </div>
    </div>
  );
};

export default FilterBar;
