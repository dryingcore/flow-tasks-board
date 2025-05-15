
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
    let dragHandle: HTMLElement | null = null;
    
    // Find the drag handle or use the element itself
    const findDragHandle = (element: HTMLElement): HTMLElement => {
      const handle = element.querySelector('[data-drag-handle]');
      return (handle as HTMLElement) || element;
    };
    
    const handleDragStart = (e: MouseEvent) => {
      // Skip if not left click
      if (e.button !== 0) return;
      
      // Only start drag from the drag handle or if no drag handle is specified
      const targetElement = e.target as HTMLElement;
      dragHandle = findDragHandle(el);
      
      // Check if the clicked element is the drag handle or its descendant
      if (dragHandle !== targetElement && !dragHandle.contains(targetElement)) {
        return;
      }
      
      // Check if we're trying to drag from a nested draggable's handle
      if (targetElement.closest('[data-draggable-id]') !== el) {
        // The click originated from a nested draggable, don't start the drag
        return;
      }
      
      e.preventDefault();
      e.stopPropagation(); // Stop event bubbling to prevent parent draggables from activating
      
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
          source: el,
        }
      });
      
      document.dispatchEvent(startEvent);
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
          type,
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
          type,
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
