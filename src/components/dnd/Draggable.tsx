
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DraggableProps {
  draggableId: string;
  index: number;
  children: React.ReactNode;
  type?: string;
}

export const Draggable: React.FC<DraggableProps> = ({ children, draggableId, index, type = 'default' }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    
    el.setAttribute('data-draggable-id', draggableId);
    el.setAttribute('data-index', String(index));
    el.setAttribute('data-type', type);
    
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    
    const handleDragStart = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      
      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;
      
      // Create a custom event to inform the DragDropContext
      const startEvent = new CustomEvent('kanban-drag-start', {
        bubbles: true,
        detail: {
          draggableId,
          index,
          type,
          source: target,
        }
      });
      
      target.dispatchEvent(startEvent);
      setIsDragging(true);
      
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    };
    
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Create a custom event for drag movement
      const moveEvent = new CustomEvent('kanban-drag-move', {
        bubbles: true,
        detail: {
          draggableId,
          clientX: e.clientX,
          clientY: e.clientY,
          dx: e.clientX - startX,
          dy: e.clientY - startY
        }
      });
      
      document.dispatchEvent(moveEvent);
    };
    
    const handleDragEnd = () => {
      if (!isDragging) return;
      
      isDragging = false;
      setIsDragging(false);
      
      // Create a custom event for drag end
      const endEvent = new CustomEvent('kanban-drag-end', {
        bubbles: true,
        detail: {
          draggableId,
        }
      });
      
      document.dispatchEvent(endEvent);
      
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    el.addEventListener('mousedown', handleDragStart);
    
    return () => {
      el.removeEventListener('mousedown', handleDragStart);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [draggableId, index, type]);

  return (
    <div 
      ref={elementRef}
      className={cn("touch-none", isDragging && "opacity-50 animate-card-pop")}
    >
      {children}
    </div>
  );
};
