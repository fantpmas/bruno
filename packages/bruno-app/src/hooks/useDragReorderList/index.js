import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook for managing drag-and-drop reordering of a list of items.
 * Maintains a temporary drag order during the drag operation and
 * calls onDrop with the reordered list when the drag completes.
 *
 * @param {Array} items - The source list of items (each must have a `uid` property)
 * @param {Function} onDrop - Called with the reordered list when a drag completes
 * @returns {{ displayItems, handleMove, handleDrop }}
 */
const useDragReorderList = (items, onDrop) => {
  const [dragOrderedItems, setDragOrderedItems] = useState(null);
  const dragOrderedItemsRef = useRef(null);
  const droppedOrderRef = useRef(null);

  const handleMove = useCallback((draggedUid, targetUid) => {
    const sourceList = dragOrderedItemsRef.current || items || [];
    const dragIndex = sourceList.findIndex((e) => e.uid === draggedUid);
    const targetIndex = sourceList.findIndex((e) => e.uid === targetUid);
    if (dragIndex === -1 || targetIndex === -1 || dragIndex === targetIndex) return;

    const reordered = [...sourceList];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    dragOrderedItemsRef.current = reordered;
    setDragOrderedItems(reordered);
  }, [items]);

  const timeoutRef = useRef(null);

  const handleDrop = useCallback(() => {
    const current = dragOrderedItemsRef.current;
    if (!current) return;

    // Remember the expected final uid order so we can keep showing
    // the optimistic order until Redux catches up.
    droppedOrderRef.current = current.map((e) => e.uid);
    onDrop(current);

    // Safety timeout: clear optimistic state if Redux never matches
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      droppedOrderRef.current = null;
      dragOrderedItemsRef.current = null;
      setDragOrderedItems(null);
    }, 5000);
  }, [onDrop]);

  // Only clear the optimistic drag order once Redux items
  // match the expected drop order. This prevents flicker from
  // intermediate file-watcher updates.
  useEffect(() => {
    if (!droppedOrderRef.current) {
      // No pending drop — clear any leftover drag state
      dragOrderedItemsRef.current = null;
      setDragOrderedItems(null);
      return;
    }

    const currentUids = (items || []).map((e) => e.uid);
    const expectedUids = droppedOrderRef.current;

    // Check if Redux order matches the expected drop order
    const matches = expectedUids.length === currentUids.length
      && expectedUids.every((uid, i) => uid === currentUids[i]);

    if (matches) {
      clearTimeout(timeoutRef.current);
      droppedOrderRef.current = null;
      dragOrderedItemsRef.current = null;
      setDragOrderedItems(null);
    }
  }, [items]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const displayItems = dragOrderedItems || items || [];

  return { displayItems, handleMove, handleDrop };
};

export default useDragReorderList;
