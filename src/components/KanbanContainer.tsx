
import { DragDropContext } from "@/components/dnd/DragDropContext";
import Column from "@/components/Column";
import FilterBar from "@/components/FilterBar";
import { useKanban } from "@/contexts/kanban";

export const KanbanContainer = () => {
  const { state, handleDragEnd } = useKanban();
  const { columns, tasks } = state;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar />
      <div className="flex overflow-x-auto gap-4 pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          {Object.entries(columns).map(([columnId, column], index) => {
            // Get tasks for this column
            const columnTasks = column.taskIds.map(taskId => tasks[taskId]);
            
            return (
              <Column 
                key={columnId} 
                column={column} 
                tasks={columnTasks}
                index={index} 
              />
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
};
