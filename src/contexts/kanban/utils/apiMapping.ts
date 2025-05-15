
import { ApiTicket, KanbanState } from '../../../types/kanban';
import { mapApiPriorityToKanban, mapStatusToColumn } from '../../../types/kanban';

// Function to convert the API data to the format expected by the Kanban board
export const processApiData = (tickets: ApiTicket[], initialState: KanbanState): KanbanState => {
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
    const task = {
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
