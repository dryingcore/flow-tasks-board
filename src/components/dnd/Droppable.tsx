
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DroppableProps {
  droppableId: string;
  children: React.ReactNode;
  type?: string;
  className?: string;
}

export const Droppable: React.FC<DroppableProps> = ({ children, droppableId, type = 'default', className }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);
  
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    
    el.setAttribute('data-droppable-id', droppableId);
    el.setAttribute('data-type', type);
    
    const handleDragOver = (e: Event) => {
      const dragEvent = e as CustomEvent;
      const { draggableId, type: dragType } = dragEvent.detail || {};
      
      // Only respond to items of the same type
      if (type !== dragType) return;
      
      // Check if this droppable is a valid target
      const rect = el.getBoundingClientRect();
      const { clientX, clientY } = dragEvent.detail;
      
      const isWithinBounds = 
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
      
      if (isWithinBounds) {
        setIsOver(true);
        
        // Notify the context that we're over this droppable
        const overEvent = new CustomEvent('kanban-droppable-over', {
          bubbles: true,
          detail: {
            droppableId,
            draggableId
          }
        });
        document.dispatchEvent(overEvent);
      } else {
        setIsOver(false);
      }
    };
    
    document.addEventListener('kanban-drag-move', handleDragOver);
    
    return () => {
      document.removeEventListener('kanban-drag-move', handleDragOver);
    };
  }, [droppableId, type]);

  return (
    <div 
      ref={elementRef}
      className={cn(
        className,
        isOver && "bg-muted/50 transition-colors"
      )}
    >
      {children}
    </div>
  );
};
