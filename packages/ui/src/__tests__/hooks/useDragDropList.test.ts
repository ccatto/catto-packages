// @ccatto/ui - useDragDropList Tests
// Tests for the drag and drop list reordering hook

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDragDropList } from "../../hooks/useDragDropList";

interface TestItem {
  id: string;
  name: string;
}

const testItems: TestItem[] = [
  { id: "1", name: "Item 1" },
  { id: "2", name: "Item 2" },
  { id: "3", name: "Item 3" },
  { id: "4", name: "Item 4" },
];

const getKey = (item: TestItem) => item.id;

// Ensure jsdom is not detected as a touch device so draggable tests work
Object.defineProperty(navigator, "maxTouchPoints", {
  value: 0,
  writable: true,
  configurable: true,
});
// Remove ontouchstart if present (jsdom may define it)
if ("ontouchstart" in window) {
  delete (window as Record<string, unknown>).ontouchstart;
}

describe("useDragDropList", () => {
  // ============================================
  // Initial State Tests
  // ============================================

  describe("Initial State", () => {
    it("returns initial items", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current.items).toEqual(testItems);
    });

    it("starts with isDragging as false", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current.isDragging).toBe(false);
    });

    it("starts with draggedIndex as null", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current.draggedIndex).toBeNull();
    });

    it("starts with dragOverIndex as null", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current.dragOverIndex).toBeNull();
    });

    it("starts with hasChanges as false", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current.hasChanges).toBe(false);
    });

    it("returns empty array for empty initialItems", () => {
      const { result } = renderHook(() =>
        useDragDropList<TestItem>({ initialItems: [], getKey })
      );

      expect(result.current.items).toEqual([]);
    });
  });

  // ============================================
  // Drag Handlers Tests
  // ============================================

  describe("Drag Handlers", () => {
    it("returns drag handlers for an index", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      expect(handlers).toHaveProperty("draggable");
      expect(handlers).toHaveProperty("data-drag-index");
      expect(handlers).toHaveProperty("tabIndex");
      expect(handlers).toHaveProperty("role");
      expect(handlers).toHaveProperty("aria-roledescription");
      expect(handlers).toHaveProperty("aria-grabbed");
      expect(handlers).toHaveProperty("onDragStart");
      expect(handlers).toHaveProperty("onDragEnd");
      expect(handlers).toHaveProperty("onDragOver");
      expect(handlers).toHaveProperty("onDragLeave");
      expect(handlers).toHaveProperty("onDrop");
      expect(handlers).toHaveProperty("onTouchStart");
      expect(handlers).toHaveProperty("onTouchMove");
      expect(handlers).toHaveProperty("onTouchEnd");
      expect(handlers).toHaveProperty("onKeyDown");
    });

    it("sets data-drag-index to the provided index", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers0 = result.current.dragHandlers(0);
      const handlers2 = result.current.dragHandlers(2);

      expect(handlers0["data-drag-index"]).toBe(0);
      expect(handlers2["data-drag-index"]).toBe(2);
    });

    it("draggable is true when not disabled", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey, disabled: false })
      );

      const handlers = result.current.dragHandlers(0);
      expect(handlers.draggable).toBe(true);
    });

    it("draggable is false when disabled", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey, disabled: true })
      );

      const handlers = result.current.dragHandlers(0);
      expect(handlers.draggable).toBe(false);
    });
  });

  // ============================================
  // Move Item Tests
  // ============================================

  describe("moveItem", () => {
    it("moves item from one position to another", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      act(() => {
        result.current.moveItem(0, 2);
      });

      expect(result.current.items[0].id).toBe("2");
      expect(result.current.items[1].id).toBe("3");
      expect(result.current.items[2].id).toBe("1");
    });

    it("sets hasChanges to true after move", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      act(() => {
        result.current.moveItem(0, 2);
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it("calls onReorder callback after move", () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey, onReorder })
      );

      act(() => {
        result.current.moveItem(0, 2);
      });

      expect(onReorder).toHaveBeenCalledTimes(1);
      expect(onReorder).toHaveBeenCalledWith(expect.any(Array));
    });

    it("does nothing when fromIndex equals toIndex", () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey, onReorder })
      );

      act(() => {
        result.current.moveItem(1, 1);
      });

      expect(onReorder).not.toHaveBeenCalled();
      expect(result.current.hasChanges).toBe(false);
    });

    it("does nothing when disabled", () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragDropList({
          initialItems: testItems,
          getKey,
          onReorder,
          disabled: true,
        })
      );

      act(() => {
        result.current.moveItem(0, 2);
      });

      expect(onReorder).not.toHaveBeenCalled();
      expect(result.current.items).toEqual(testItems);
    });

    it("does nothing for invalid fromIndex", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      act(() => {
        result.current.moveItem(-1, 2);
      });

      expect(result.current.items).toEqual(testItems);
    });

    it("does nothing for invalid toIndex", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      act(() => {
        result.current.moveItem(0, 10);
      });

      expect(result.current.items).toEqual(testItems);
    });
  });

  // ============================================
  // Reset Tests
  // ============================================

  describe("reset", () => {
    it("resets items to initial order", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      act(() => {
        result.current.moveItem(0, 3);
      });

      expect(result.current.items[0].id).not.toBe("1");

      act(() => {
        result.current.reset();
      });

      expect(result.current.items).toEqual(testItems);
    });

    it("resets hasChanges to false", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      act(() => {
        result.current.moveItem(0, 2);
      });

      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.hasChanges).toBe(false);
    });

    it("resets drag state", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      act(() => {
        result.current.reset();
      });

      expect(result.current.draggedIndex).toBeNull();
      expect(result.current.dragOverIndex).toBeNull();
    });
  });

  // ============================================
  // setItems Tests
  // ============================================

  describe("setItems", () => {
    it("updates items", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const newItems: TestItem[] = [
        { id: "5", name: "Item 5" },
        { id: "6", name: "Item 6" },
      ];

      act(() => {
        result.current.setItems(newItems);
      });

      expect(result.current.items).toEqual(newItems);
    });

    it("resets hasChanges by default", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      act(() => {
        result.current.moveItem(0, 2);
      });

      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.setItems(testItems);
      });

      expect(result.current.hasChanges).toBe(false);
    });

    it("preserves hasChanges when preserveChanges is true", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      act(() => {
        result.current.moveItem(0, 2);
      });

      const newItems: TestItem[] = [{ id: "5", name: "Item 5" }];

      act(() => {
        result.current.setItems(newItems, true);
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });

  // ============================================
  // Touch Drag-and-Drop Tests (Mobile)
  // ============================================

  describe("Touch Drag-and-Drop", () => {
    // Helper to create a mock TouchEvent
    const createTouchEvent = (clientX: number, clientY: number) =>
      ({
        touches: [{ clientX, clientY }],
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.TouchEvent<HTMLElement>);

    // Helper to mock document.elementFromPoint returning a row with data-drag-index
    const mockElementFromPoint = (dragIndex: number | null) => {
      // jsdom doesn't define elementFromPoint — add it if missing
      if (!document.elementFromPoint) {
        document.elementFromPoint = vi.fn();
      }
      const spy = vi.spyOn(document, "elementFromPoint");
      if (dragIndex !== null) {
        const mockRow = document.createElement("tr");
        mockRow.setAttribute("data-drag-index", String(dragIndex));
        spy.mockReturnValue(mockRow);
      } else {
        spy.mockReturnValue(null);
      }
      return spy;
    };

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("touch start records the drag index without setting isDragging", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(1);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      // isDragging should not be true until threshold is crossed
      expect(result.current.isDragging).toBe(false);
      expect(result.current.draggedIndex).toBeNull();
    });

    it("touch move below threshold does not start dragging", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      // Move only 5px — below the 10px threshold
      act(() => {
        handlers.onTouchMove(createTouchEvent(103, 204));
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.draggedIndex).toBeNull();
    });

    it("touch move past threshold sets isDragging and draggedIndex", () => {
      const spy = mockElementFromPoint(2);
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      // Move 15px vertically — past threshold
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 215));
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.draggedIndex).toBe(0);
      spy.mockRestore();
    });

    it("touch move over a different row sets dragOverIndex", () => {
      const spy = mockElementFromPoint(2);
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 215));
      });

      expect(result.current.dragOverIndex).toBe(2);
      spy.mockRestore();
    });

    it("touch end reorders items when dragged to a different row", () => {
      const onReorder = vi.fn();
      const spy = mockElementFromPoint(2);
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey, onReorder })
      );

      const handlers = result.current.dragHandlers(0);

      // Touch start on index 0
      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      // Touch move past threshold, over index 2
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 215));
      });

      // Touch end — should reorder
      act(() => {
        handlers.onTouchEnd(createTouchEvent(100, 215));
      });

      // Item 1 (index 0) moved to index 2
      expect(result.current.items[0].id).toBe("2");
      expect(result.current.items[1].id).toBe("3");
      expect(result.current.items[2].id).toBe("1");
      expect(result.current.hasChanges).toBe(true);
      expect(onReorder).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it("touch end resets drag state", () => {
      const spy = mockElementFromPoint(2);
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 215));
      });
      act(() => {
        handlers.onTouchEnd(createTouchEvent(100, 215));
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.draggedIndex).toBeNull();
      expect(result.current.dragOverIndex).toBeNull();
      spy.mockRestore();
    });

    it("touch end without crossing threshold does not reorder", () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey, onReorder })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      // Small move — no drag triggered
      act(() => {
        handlers.onTouchMove(createTouchEvent(102, 203));
      });

      act(() => {
        handlers.onTouchEnd(createTouchEvent(102, 203));
      });

      expect(result.current.items).toEqual(testItems);
      expect(onReorder).not.toHaveBeenCalled();
      expect(result.current.hasChanges).toBe(false);
    });

    it("touch end on the same row does not reorder", () => {
      // elementFromPoint returns the same index we started on
      const spy = mockElementFromPoint(0);
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey, onReorder })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 215));
      });
      act(() => {
        handlers.onTouchEnd(createTouchEvent(100, 215));
      });

      // dragOverIndex won't update when overIndex === touchDragIndex,
      // so touchOverIndexRef stays null — no reorder
      expect(result.current.items).toEqual(testItems);
      expect(onReorder).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("touch drag does nothing when disabled", () => {
      const spy = mockElementFromPoint(2);
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragDropList({
          initialItems: testItems,
          getKey,
          onReorder,
          disabled: true,
        })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 215));
      });
      act(() => {
        handlers.onTouchEnd(createTouchEvent(100, 215));
      });

      expect(result.current.items).toEqual(testItems);
      expect(result.current.isDragging).toBe(false);
      expect(onReorder).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("touch move prevents default (stops page scroll) once dragging", () => {
      const spy = mockElementFromPoint(2);
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      const moveEvent = createTouchEvent(100, 215);

      act(() => {
        handlers.onTouchMove(moveEvent);
      });

      expect(moveEvent.preventDefault).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("touch move does not preventDefault before threshold", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      const moveEvent = createTouchEvent(102, 203);

      act(() => {
        handlers.onTouchMove(moveEvent);
      });

      expect(moveEvent.preventDefault).not.toHaveBeenCalled();
    });

    it("touch drag handles elementFromPoint returning null gracefully", () => {
      const spy = mockElementFromPoint(null);
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      // Should not throw
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 215));
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.dragOverIndex).toBeNull();
      spy.mockRestore();
    });
  });

  // ============================================
  // Configurable Touch Threshold Tests
  // ============================================

  describe("Configurable Touch Threshold", () => {
    const createTouchEvent = (clientX: number, clientY: number) =>
      ({
        touches: [{ clientX, clientY }],
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.TouchEvent<HTMLElement>);

    const mockElementFromPoint = (dragIndex: number) => {
      if (!document.elementFromPoint) {
        document.elementFromPoint = vi.fn();
      }
      const spy = vi.spyOn(document, "elementFromPoint");
      const mockRow = document.createElement("tr");
      mockRow.setAttribute("data-drag-index", String(dragIndex));
      spy.mockReturnValue(mockRow);
      return spy;
    };

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("uses default threshold of 10px when not specified", () => {
      const spy = mockElementFromPoint(2);
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      // 9px — should NOT trigger drag with default threshold of 10
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 209));
      });

      expect(result.current.isDragging).toBe(false);

      // 11px — should trigger drag
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 211));
      });

      expect(result.current.isDragging).toBe(true);
      spy.mockRestore();
    });

    it("respects custom touchDragThreshold", () => {
      const spy = mockElementFromPoint(2);
      const { result } = renderHook(() =>
        useDragDropList({
          initialItems: testItems,
          getKey,
          touchDragThreshold: 30,
        })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      // 15px — below custom threshold of 30
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 215));
      });

      expect(result.current.isDragging).toBe(false);

      // 35px — above custom threshold
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 235));
      });

      expect(result.current.isDragging).toBe(true);
      spy.mockRestore();
    });

    it("allows very small threshold for sensitive touch drag", () => {
      const spy = mockElementFromPoint(2);
      const { result } = renderHook(() =>
        useDragDropList({
          initialItems: testItems,
          getKey,
          touchDragThreshold: 2,
        })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      // 3px — above tiny threshold of 2
      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 203));
      });

      expect(result.current.isDragging).toBe(true);
      spy.mockRestore();
    });
  });

  // ============================================
  // Dev Warning Tests
  // ============================================

  describe("Dev Warning (missing data-drag-index)", () => {
    const createTouchEvent = (clientX: number, clientY: number) =>
      ({
        touches: [{ clientX, clientY }],
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.TouchEvent<HTMLElement>);

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("warns in dev when touch moves over element without data-drag-index", () => {
      // Mock elementFromPoint to return an element without data-drag-index
      if (!document.elementFromPoint) {
        document.elementFromPoint = vi.fn();
      }
      const spy = vi.spyOn(document, "elementFromPoint");
      const mockDiv = document.createElement("div"); // No data-drag-index
      spy.mockReturnValue(mockDiv);

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onTouchStart(createTouchEvent(100, 200));
      });

      act(() => {
        handlers.onTouchMove(createTouchEvent(100, 215));
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[useDragDropList]")
      );

      spy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  // ============================================
  // Keyboard Reordering Tests (Accessibility)
  // ============================================

  describe("Keyboard Reordering", () => {
    // Helper to create a mock KeyboardEvent
    const createKeyEvent = (key: string) =>
      ({
        key,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);

    it("Space grabs the item and sets isDragging", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(1);

      act(() => {
        handlers.onKeyDown(createKeyEvent(" "));
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.draggedIndex).toBe(1);
    });

    it("Enter also grabs the item", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const handlers = result.current.dragHandlers(2);

      act(() => {
        handlers.onKeyDown(createKeyEvent("Enter"));
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.draggedIndex).toBe(2);
    });

    it("ArrowDown moves grabbed item down one position", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      // Grab item at index 0
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent(" "));
      });

      // ArrowDown — move item 0 to index 1
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent("ArrowDown"));
      });

      expect(result.current.items[0].id).toBe("2");
      expect(result.current.items[1].id).toBe("1");
      expect(result.current.hasChanges).toBe(true);
      expect(result.current.draggedIndex).toBe(1);
    });

    it("ArrowUp moves grabbed item up one position", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      // Grab item at index 2
      act(() => {
        result.current.dragHandlers(2).onKeyDown(createKeyEvent(" "));
      });

      // ArrowUp — move item 2 to index 1
      act(() => {
        result.current.dragHandlers(2).onKeyDown(createKeyEvent("ArrowUp"));
      });

      expect(result.current.items[0].id).toBe("1");
      expect(result.current.items[1].id).toBe("3");
      expect(result.current.items[2].id).toBe("2");
      expect(result.current.draggedIndex).toBe(1);
    });

    it("ArrowUp at top boundary does nothing", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      // Grab item at index 0
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent(" "));
      });

      // ArrowUp at the top — should stay
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent("ArrowUp"));
      });

      expect(result.current.items[0].id).toBe("1");
      expect(result.current.draggedIndex).toBe(0);
    });

    it("ArrowDown at bottom boundary does nothing", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      const lastIndex = testItems.length - 1;

      // Grab last item
      act(() => {
        result.current.dragHandlers(lastIndex).onKeyDown(createKeyEvent(" "));
      });

      // ArrowDown at the bottom — should stay
      act(() => {
        result.current
          .dragHandlers(lastIndex)
          .onKeyDown(createKeyEvent("ArrowDown"));
      });

      expect(result.current.items[lastIndex].id).toBe("4");
    });

    it("Space drops the item (confirms reorder)", () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey, onReorder })
      );

      // Grab item 0
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent(" "));
      });

      // Move down
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent("ArrowDown"));
      });

      // Drop with Space
      act(() => {
        result.current.dragHandlers(1).onKeyDown(createKeyEvent(" "));
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.draggedIndex).toBeNull();
      expect(onReorder).toHaveBeenCalled();
    });

    it("Escape cancels and resets to initial order", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      // Grab item 0
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent(" "));
      });

      // Move down
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent("ArrowDown"));
      });

      expect(result.current.items[0].id).toBe("2");

      // Escape — cancel
      act(() => {
        result.current.dragHandlers(1).onKeyDown(createKeyEvent("Escape"));
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.items).toEqual(testItems);
      expect(result.current.hasChanges).toBe(false);
    });

    it("keyboard does nothing when disabled", () => {
      const { result } = renderHook(() =>
        useDragDropList({
          initialItems: testItems,
          getKey,
          disabled: true,
        })
      );

      const handlers = result.current.dragHandlers(0);

      act(() => {
        handlers.onKeyDown(createKeyEvent(" "));
      });

      expect(result.current.isDragging).toBe(false);
    });

    it("prevents default on all keyboard actions", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      // Grab
      const grabEvent = createKeyEvent(" ");
      act(() => {
        result.current.dragHandlers(0).onKeyDown(grabEvent);
      });
      expect(grabEvent.preventDefault).toHaveBeenCalled();

      // Arrow
      const arrowEvent = createKeyEvent("ArrowDown");
      act(() => {
        result.current.dragHandlers(0).onKeyDown(arrowEvent);
      });
      expect(arrowEvent.preventDefault).toHaveBeenCalled();

      // Escape
      const escapeEvent = createKeyEvent("Escape");
      act(() => {
        result.current.dragHandlers(1).onKeyDown(escapeEvent);
      });
      expect(escapeEvent.preventDefault).toHaveBeenCalled();
    });

    it("multiple arrow key presses move item progressively", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      // Grab item 0 ("Item 1")
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent(" "));
      });

      // Move down twice
      act(() => {
        result.current.dragHandlers(0).onKeyDown(createKeyEvent("ArrowDown"));
      });
      act(() => {
        result.current.dragHandlers(1).onKeyDown(createKeyEvent("ArrowDown"));
      });

      // "Item 1" should now be at index 2
      expect(result.current.items[0].id).toBe("2");
      expect(result.current.items[1].id).toBe("3");
      expect(result.current.items[2].id).toBe("1");
      expect(result.current.items[3].id).toBe("4");
    });
  });

  // ============================================
  // Accessibility Attributes Tests
  // ============================================

  describe("Accessibility Attributes", () => {
    it("sets tabIndex to 0 when not disabled", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current.dragHandlers(0).tabIndex).toBe(0);
    });

    it("sets tabIndex to -1 when disabled", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey, disabled: true })
      );

      expect(result.current.dragHandlers(0).tabIndex).toBe(-1);
    });

    it("sets role to listitem", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current.dragHandlers(0).role).toBe("listitem");
    });

    it("sets aria-roledescription to sortable", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current.dragHandlers(0)["aria-roledescription"]).toBe(
        "sortable"
      );
    });

    it("aria-grabbed is undefined when not grabbed", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current.dragHandlers(0)["aria-grabbed"]).toBeUndefined();
    });

    it("aria-grabbed is true on the grabbed item", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      // Grab item 1
      act(() => {
        result.current.dragHandlers(1).onKeyDown({
          key: " ",
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLElement>);
      });

      expect(result.current.dragHandlers(1)["aria-grabbed"]).toBe(true);
      expect(result.current.dragHandlers(0)["aria-grabbed"]).toBeUndefined();
      expect(result.current.dragHandlers(2)["aria-grabbed"]).toBeUndefined();
    });
  });

  // ============================================
  // Return Type Tests
  // ============================================

  describe("Return Type", () => {
    it("returns all expected properties", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(result.current).toHaveProperty("items");
      expect(result.current).toHaveProperty("dragHandlers");
      expect(result.current).toHaveProperty("isDragging");
      expect(result.current).toHaveProperty("draggedIndex");
      expect(result.current).toHaveProperty("dragOverIndex");
      expect(result.current).toHaveProperty("hasChanges");
      expect(result.current).toHaveProperty("reset");
      expect(result.current).toHaveProperty("setItems");
      expect(result.current).toHaveProperty("moveItem");
    });

    it("functions are callable", () => {
      const { result } = renderHook(() =>
        useDragDropList({ initialItems: testItems, getKey })
      );

      expect(typeof result.current.dragHandlers).toBe("function");
      expect(typeof result.current.reset).toBe("function");
      expect(typeof result.current.setItems).toBe("function");
      expect(typeof result.current.moveItem).toBe("function");
    });
  });
});
