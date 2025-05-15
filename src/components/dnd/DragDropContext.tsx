
import { useState, useEffect, useRef } from 'react';
import { DragEndResult } from '@/types/kanban';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DragDropContextProps {
  children: React.ReactNode;
  onDragEnd: (result: DragEndResult) => void;
}

interface DragState {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  sourceElement: HTMLElement | null;
  isDragging: boolean;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export const DragDropContext: React.FC<DragDropContextProps> = ({ children, onDragEnd }) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [currentDroppable, setCurrentDroppable] = useState<string | null>(null);
  const dragCloneRef = useRef<HTMLDivElement | null>(null);
  
  // Calculate destination index when dragging
  const getDestinationIndex = (droppableId: string, clientY: number): number => {
    // Find all draggable items in the target droppable
    const droppable = document.querySelector(`[data-droppable-id="${droppableId}"]`);
    if (!droppable) return 0;
    
    const draggables = Array.from(
      droppable.querySelectorAll('[data-draggable-id]')
    ).filter(el => !el.getAttribute('data-draggable-id')?.includes(dragState?.draggableId || ''));
    
    if (draggables.length === 0) return 0;
    
    for (let i = 0; i < draggables.length; i++) {
      const rect = draggables[i].getBoundingClientRect();
      const middleY = rect.top + rect.height / 2;
      
      if (clientY < middleY) {
        return parseInt(draggables[i].getAttribute('data-index') || '0');
      }
    }
    
    return draggables.length;
  };
  
  const handleDragStart = (e: Event) => {
    const customEvent = e as CustomEvent;
    const { draggableId, index, type, source } = customEvent.detail;
    
    if (!source) return;
    
    // Find the droppable parent
    const droppableEl = source.closest('[data-droppable-id]');
    if (!droppableEl) return;
    
    const droppableId = droppableEl.getAttribute('data-droppable-id') || '';
    
    // Create a clone of the element for the drag preview
    const clone = source.cloneNode(true) as HTMLElement;
    const rect = source.getBoundingClientRect();
    
    // Set initial position
    clone.style.position = 'fixed';
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.opacity = '0.8';
    clone.style.transform = 'rotate(2deg)';
    clone.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    
    // Store a reference to append it later
    dragCloneRef.current = document.createElement('div');
    dragCloneRef.current.appendChild(clone);
    document.body.appendChild(dragCloneRef.current);
    
    // Update drag state
    setDragState({
      draggableId,
      type,
      source: { droppableId, index },
      sourceElement: source,
      isDragging: true,
      x: rect.left,
      y: rect.top,
      dx: 0,
      dy: 0
    });
  };
  
  const handleDragMove = (e: Event) => {
    const customEvent = e as CustomEvent;
    const { clientX, clientY, dx, dy } = customEvent.detail;
    
    if (dragState && dragCloneRef.current) {
      const clone = dragCloneRef.current.firstChild as HTMLElement;
      
      // Update clone position
      clone.style.left = `${dragState.x + dx}px`;
      clone.style.top = `${dragState.y + dy}px`;
      
      // Update drag state
      setDragState({
        ...dragState,
        dx,
        dy
      });
    }
  };
  
  const handleDragEnd = () => {
    if (!dragState) return;
    
    // Clean up drag clone
    if (dragCloneRef.current) {
      document.body.removeChild(dragCloneRef.current);
      dragCloneRef.current = null;
    }
    
    // If we have a destination droppable, call onDragEnd
    if (currentDroppable) {
      const destinationIndex = getDestinationIndex(currentDroppable, dragState.y + dragState.dy);
      
      const result: DragEndResult = {
        source: dragState.source,
        destination: {
          droppableId: currentDroppable,
          index: destinationIndex
        },
        draggableId: dragState.draggableId,
        type: dragState.type
      };
      
      onDragEnd(result);
    }
    
    // Reset state
    setDragState(null);
    setCurrentDroppable(null);
  };
  
  const handleDroppableOver = (e: Event) => {
    const customEvent = e as CustomEvent;
    const { droppableId } = customEvent.detail;
    
    if (droppableId !== currentDroppable) {
      setCurrentDroppable(droppableId);
    }
  };
  
  useEffect(() => {
    document.addEventListener('kanban-drag-start', handleDragStart);
    document.addEventListener('kanban-drag-move', handleDragMove);
    document.addEventListener('kanban-drag-end', handleDragEnd);
    document.addEventListener('kanban-droppable-over', handleDroppableOver);
    
    return () => {
      document.removeEventListener('kanban-drag-start', handleDragStart);
      document.removeEventListener('kanban-drag-move', handleDragMove);
      document.removeEventListener('kanban-drag-end', handleDragEnd);
      document.removeEventListener('kanban-droppable-over', handleDroppableOver);
    };
  }, [dragState, currentDroppable]);
  
  return (
    <div className={cn("relative", dragState?.isDragging && "cursor-grabbing")}>
      {children}
    </div>
  );
};
