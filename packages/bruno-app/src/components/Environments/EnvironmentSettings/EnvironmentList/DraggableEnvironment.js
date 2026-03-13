import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const DraggableEnvironment = ({ uid, index, onMoveEnvironment, onDropEnvironment, children, className, onClick, onDoubleClick, dragType = 'environment' }) => {
  const ref = useRef(null);
  const onDropRef = useRef(onDropEnvironment);
  onDropRef.current = onDropEnvironment;
  const onMoveRef = useRef(onMoveEnvironment);
  onMoveRef.current = onMoveEnvironment;

  const [{ isOver }, drop] = useDrop({
    accept: dragType,
    hover(item) {
      if (item.uid === uid) return;
      onMoveRef.current(item.uid, uid);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const [{ isDragging }, drag] = useDrag({
    type: dragType,
    item: () => ({ uid, index }),
    end: () => {
      onDropRef.current();
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    options: {
      dropEffect: 'move'
    }
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: isDragging || isOver ? 0.4 : 1 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
};

export default DraggableEnvironment;
