
import { DragDropContext } from "@/components/dnd/DragDropContext";
import Column from "@/components/Column";
import FilterBar from "@/components/FilterBar";
import { useContext } from "react";
import { useKanban } from "@/contexts/KanbanContext";

export const KanbanContainer = () => {
  const { state, handleDragEnd } = useKanban();
  const { columns } = state;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          {Object.entries(columns).map(([columnId, column]) => (
            <Column key={columnId} columnId={columnId} column={column} />
          ))}
        </DragDropContext>
      </div>
    </div>
  );
};
