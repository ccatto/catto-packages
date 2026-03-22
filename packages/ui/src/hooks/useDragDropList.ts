// @ccatto/ui - Drag and Drop List Hook
"use client";

/**
 * useDragDropList - Reusable drag-and-drop list reordering hook
 *
 * Provides HTML5 drag-and-drop, touch-based drag, and keyboard reordering
 * for accessible list reordering. No external dependencies required.
 *
 * Features:
 *   - HTML5 Drag and Drop (desktop mouse)
 *   - Touch events (mobile/tablet)
 *   - Keyboard reordering (Space to grab, Arrow keys to move, Space/Enter to drop, Escape to cancel)
 *
 * Usage:
 *   const {
 *     items,
 *     dragHandlers,
 *     isDragging,
 *     dragOverIndex,
 *     hasChanges,
 *     reset,
 *   } = useDragDropList({
 *     initialItems: myItems,
 *     getKey: (item) => item.id,
 *     onReorder: (newItems) => console.log('Reordered:', newItems),
 *     disabled: false,
 *   });
 *
 *   // Use in your component
 *   {items.map((item, index) => (
 *     <div key={getKey(item)} {...dragHandlers(index)}>
 *       {item.name}
 *     </div>
 *   ))}
 */
import { useCallback, useEffect, useRef, useState } from "react";

/** Default minimum pixels of touch movement before drag activates */
const DEFAULT_TOUCH_DRAG_THRESHOLD = 10;

export interface UseDragDropListOptions<T> {
  /**
   * Initial items to display in the list
   */
  initialItems: T[];

  /**
   * Function to extract a unique key from each item
   * Used internally for tracking but not for React keys
   */
  getKey: (item: T) => string | number;

  /**
   * Called when items are reordered via drag-and-drop
   * Receives the new ordered array
   */
  onReorder?: (items: T[]) => void;

  /**
   * Disable drag-and-drop functionality
   * @default false
   */
  disabled?: boolean;

  /**
   * Minimum pixels of touch movement before drag activates.
   * Higher values reduce accidental drags; lower values feel more responsive.
   * @default 10
   */
  touchDragThreshold?: number;

  /**
   * Ref to the container element wrapping all draggable items.
   * When provided, a native (non-passive) touchmove listener is attached
   * to reliably call preventDefault() during touch drag, preventing page
   * scroll on iOS Safari and other mobile browsers.
   */
  containerRef?: React.RefObject<HTMLElement | null>;
}

export interface DragHandlers {
  draggable: boolean;
  /** Data attribute for touch-based drag target identification */
  "data-drag-index": number;
  /** Keyboard tabIndex for accessibility */
  tabIndex: number;
  /** Accessible role for keyboard reordering */
  role: string;
  /** Accessible label describing drag state */
  "aria-roledescription": string;
  /** Whether this item is currently grabbed (keyboard drag) */
  "aria-grabbed": boolean | undefined;
  onDragStart: (e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
  onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

export interface UseDragDropListReturn<T> {
  /**
   * The current ordered list of items
   */
  items: T[];

  /**
   * Function that returns drag handlers for a specific index
   * Spread these onto your draggable element: {...dragHandlers(index)}
   */
  dragHandlers: (index: number) => DragHandlers;

  /**
   * Whether a drag operation is currently in progress
   */
  isDragging: boolean;

  /**
   * The index currently being dragged, or null
   */
  draggedIndex: number | null;

  /**
   * The index currently being hovered over during drag, or null
   */
  dragOverIndex: number | null;

  /**
   * Whether the current order differs from the initial order
   */
  hasChanges: boolean;

  /**
   * Reset to the initial order, discarding changes
   */
  reset: () => void;

  /**
   * Manually set the items (useful when external data changes)
   * If preserveChanges is false (default), also resets hasChanges
   */
  setItems: (newItems: T[], preserveChanges?: boolean) => void;

  /**
   * Move an item from one index to another programmatically
   */
  moveItem: (fromIndex: number, toIndex: number) => void;
}

export function useDragDropList<T>({
  initialItems,
  getKey,
  onReorder,
  disabled = false,
  touchDragThreshold = DEFAULT_TOUCH_DRAG_THRESHOLD,
  containerRef,
}: UseDragDropListOptions<T>): UseDragDropListReturn<T> {
  // Current ordered items
  const [items, setItemsState] = useState<T[]>(initialItems);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Track if we have unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  // Store initial items for reset and comparison
  const initialItemsRef = useRef<T[]>(initialItems);

  // Sync with initialItems when they change externally (and no local changes)
  useEffect(() => {
    if (!hasChanges) {
      const initialKeys = initialItemsRef.current.map(getKey).join(",");
      const newKeys = initialItems.map(getKey).join(",");

      if (initialKeys !== newKeys) {
        initialItemsRef.current = initialItems;
        setItemsState(initialItems);
      }
    }
  }, [initialItems, hasChanges, getKey]);

  // Reset to initial order
  const reset = useCallback(() => {
    setItemsState(initialItemsRef.current);
    setHasChanges(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Manually set items
  const setItems = useCallback((newItems: T[], preserveChanges = false) => {
    setItemsState(newItems);
    initialItemsRef.current = newItems;
    if (!preserveChanges) {
      setHasChanges(false);
    }
  }, []);

  // Move an item programmatically
  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (disabled) return;
      if (fromIndex === toIndex) return;
      if (fromIndex < 0 || fromIndex >= items.length) return;
      if (toIndex < 0 || toIndex >= items.length) return;

      const newItems = [...items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      setItemsState(newItems);
      setHasChanges(true);
      onReorder?.(newItems);
    },
    [disabled, items, onReorder]
  );

  // Track touch state with refs (avoid stale closures)
  const touchDragIndexRef = useRef<number | null>(null);
  const touchOverIndexRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const isTouchDraggingRef = useRef(false);

  // Drag handlers (HTML5 Drag and Drop - desktop)
  const handleDragStart = useCallback(
    (index: number) => (e: React.DragEvent<HTMLElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
      // Visual feedback
      e.currentTarget.style.opacity = "0.5";
    },
    [disabled]
  );

  const handleDragEnd = useCallback(
    () => (e: React.DragEvent<HTMLElement>) => {
      e.currentTarget.style.opacity = "1";
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    []
  );

  const handleDragOver = useCallback(
    (index: number) => (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedIndex !== null && index !== draggedIndex) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback(
    () => () => {
      setDragOverIndex(null);
    },
    []
  );

  const handleDrop = useCallback(
    (dropIndex: number) => (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);

      setItemsState(newItems);
      setHasChanges(true);
      setDraggedIndex(null);
      setDragOverIndex(null);

      onReorder?.(newItems);
    },
    [draggedIndex, items, onReorder]
  );

  // Touch handlers (mobile)
  const handleTouchStart = useCallback(
    (index: number) => (e: React.TouchEvent<HTMLElement>) => {
      if (disabled) return;
      const touch = e.touches[0];
      touchStartYRef.current = touch.clientY;
      touchStartXRef.current = touch.clientX;
      touchDragIndexRef.current = index;
      isTouchDraggingRef.current = false;
      // Prevent HTML5 drag from interfering with touch on mobile
      e.stopPropagation();
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    () => (e: React.TouchEvent<HTMLElement>) => {
      if (disabled || touchDragIndexRef.current === null) return;

      const touch = e.touches[0];
      const deltaY = Math.abs(touch.clientY - touchStartYRef.current);
      const deltaX = Math.abs(touch.clientX - touchStartXRef.current);

      // Only start dragging after threshold to avoid accidental drags
      if (!isTouchDraggingRef.current) {
        if (deltaY > touchDragThreshold || deltaX > touchDragThreshold) {
          isTouchDraggingRef.current = true;
          setDraggedIndex(touchDragIndexRef.current);
        } else {
          return;
        }
      }

      // Prevent page scrolling while dragging
      e.preventDefault();

      // Find the element under the touch point
      const elementBelow = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );
      if (!elementBelow) return;

      // Walk up the DOM to find the closest draggable row with data-drag-index
      const row = elementBelow.closest("[data-drag-index]") as HTMLElement;
      if (row) {
        const overIndex = parseInt(row.dataset.dragIndex!, 10);
        if (!isNaN(overIndex) && overIndex !== touchDragIndexRef.current) {
          touchOverIndexRef.current = overIndex;
          setDragOverIndex(overIndex);
        }
      } else if (process.env.NODE_ENV !== "production") {
        // Dev warning: touch is over an element that doesn't have data-drag-index
        // This usually means dragHandlers weren't spread onto the draggable elements
        console.warn(
          "[useDragDropList] Touch move detected an element without " +
            "data-drag-index. Ensure {...dragHandlers(index)} is spread " +
            "onto each draggable element."
        );
      }
    },
    [disabled, touchDragThreshold]
  );

  const handleTouchEnd = useCallback(
    () => () => {
      if (disabled) return;

      const fromIndex = touchDragIndexRef.current;
      const toIndex = touchOverIndexRef.current;

      if (
        isTouchDraggingRef.current &&
        fromIndex !== null &&
        toIndex !== null &&
        fromIndex !== toIndex
      ) {
        // Use the latest items via a setState callback to avoid stale closure
        setItemsState((prevItems) => {
          const newItems = [...prevItems];
          const [draggedItem] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, draggedItem);
          onReorder?.(newItems);
          return newItems;
        });
        setHasChanges(true);
      }

      // Reset touch state
      touchDragIndexRef.current = null;
      touchOverIndexRef.current = null;
      isTouchDraggingRef.current = false;
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [disabled, onReorder]
  );

  // Native touchmove listener to reliably prevent scroll during touch drag.
  // React's synthetic touchmove is passive on iOS Safari, so e.preventDefault()
  // silently fails. This attaches a non-passive native listener to the container.
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleNativeTouchMove = (e: TouchEvent) => {
      if (isTouchDraggingRef.current) {
        e.preventDefault();
      }
    };

    container.addEventListener("touchmove", handleNativeTouchMove, {
      passive: false,
    });

    return () => {
      container.removeEventListener("touchmove", handleNativeTouchMove);
    };
  }, [containerRef]);

  // Keyboard handlers (accessibility)
  // Track keyboard grab state with a ref to avoid stale closures
  const keyboardGrabbedIndexRef = useRef<number | null>(null);
  const [keyboardGrabbedIndex, setKeyboardGrabbedIndex] = useState<
    number | null
  >(null);

  const handleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) return;

      const grabbed = keyboardGrabbedIndexRef.current;

      if (grabbed === null) {
        // Not currently grabbed — Space to grab this item
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          keyboardGrabbedIndexRef.current = index;
          setKeyboardGrabbedIndex(index);
          setDraggedIndex(index);
        }
      } else {
        // Currently grabbed — handle movement, drop, or cancel
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          if (grabbed > 0) {
            const newIndex = grabbed - 1;
            // Perform the move immediately for keyboard
            setItemsState((prevItems) => {
              const newItems = [...prevItems];
              const [movedItem] = newItems.splice(grabbed, 1);
              newItems.splice(newIndex, 0, movedItem);
              return newItems;
            });
            keyboardGrabbedIndexRef.current = newIndex;
            setKeyboardGrabbedIndex(newIndex);
            setDraggedIndex(newIndex);
            setDragOverIndex(null);
            setHasChanges(true);
          }
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          setItemsState((prevItems) => {
            if (grabbed >= prevItems.length - 1) return prevItems;
            const newIndex = grabbed + 1;
            const newItems = [...prevItems];
            const [movedItem] = newItems.splice(grabbed, 1);
            newItems.splice(newIndex, 0, movedItem);
            keyboardGrabbedIndexRef.current = newIndex;
            setKeyboardGrabbedIndex(newIndex);
            setDraggedIndex(newIndex);
            setHasChanges(true);
            return newItems;
          });
          setDragOverIndex(null);
        } else if (e.key === " " || e.key === "Enter") {
          // Drop the item at current position
          e.preventDefault();
          onReorder?.(items);
          keyboardGrabbedIndexRef.current = null;
          setKeyboardGrabbedIndex(null);
          setDraggedIndex(null);
          setDragOverIndex(null);
        } else if (e.key === "Escape") {
          // Cancel — reset to initial order
          e.preventDefault();
          keyboardGrabbedIndexRef.current = null;
          setKeyboardGrabbedIndex(null);
          reset();
        }
      }
    },
    [disabled, items, onReorder, reset]
  );

  // Detect touch device to avoid draggable="true" conflicting with touch events
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  // Generate drag handlers for a specific index
  const dragHandlers = useCallback(
    (index: number): DragHandlers => ({
      draggable: !disabled && !isTouchDevice,
      "data-drag-index": index,
      tabIndex: disabled ? -1 : 0,
      role: "listitem",
      "aria-roledescription": "sortable",
      "aria-grabbed": keyboardGrabbedIndex === index ? true : undefined,
      onDragStart: handleDragStart(index),
      onDragEnd: handleDragEnd(),
      onDragOver: handleDragOver(index),
      onDragLeave: handleDragLeave(),
      onDrop: handleDrop(index),
      onTouchStart: handleTouchStart(index),
      onTouchMove: handleTouchMove(),
      onTouchEnd: handleTouchEnd(),
      onKeyDown: handleKeyDown(index),
    }),
    [
      disabled,
      isTouchDevice,
      keyboardGrabbedIndex,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleKeyDown,
    ]
  );

  return {
    items,
    dragHandlers,
    isDragging: draggedIndex !== null,
    draggedIndex,
    dragOverIndex,
    hasChanges,
    reset,
    setItems,
    moveItem,
  };
}

export default useDragDropList;
