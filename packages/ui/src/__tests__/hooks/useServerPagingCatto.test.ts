// @ccatto/ui - useServerPagingCatto Tests

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useServerPagingCatto } from "../../hooks/useServerPagingCatto";

describe("useServerPagingCatto", () => {
  describe("Initial state", () => {
    it("starts limit at the default pageSize (24)", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({ total: 100 })
      );
      expect(result.current.limit).toBe(24);
    });

    it("starts limit at a custom pageSize", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({ total: 100, pageSize: 48 })
      );
      expect(result.current.limit).toBe(48);
    });
  });

  describe("loadMore", () => {
    it("increments limit by pageSize", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({ total: 100, pageSize: 48 })
      );

      act(() => result.current.loadMore());
      expect(result.current.limit).toBe(96);

      act(() => result.current.loadMore());
      expect(result.current.limit).toBe(144);
    });
  });

  describe("reset", () => {
    it("resets limit back to pageSize", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({ total: 100, pageSize: 24 })
      );

      act(() => result.current.loadMore());
      expect(result.current.limit).toBe(48);

      act(() => result.current.reset());
      expect(result.current.limit).toBe(24);
    });
  });

  describe("resetKey", () => {
    it("resets limit to pageSize when resetKey changes", () => {
      const { result, rerender } = renderHook(
        ({ key }) =>
          useServerPagingCatto({ total: 100, pageSize: 24, resetKey: key }),
        { initialProps: { key: ["brand-a"] as unknown[] } }
      );

      act(() => result.current.loadMore());
      expect(result.current.limit).toBe(48);

      // Filter/sort changed -> new resetKey -> back to page 1.
      rerender({ key: ["brand-b"] });
      expect(result.current.limit).toBe(24);
    });

    it("does not reset when resetKey is deep-equal", () => {
      const { result, rerender } = renderHook(
        ({ key }) =>
          useServerPagingCatto({ total: 100, pageSize: 24, resetKey: key }),
        { initialProps: { key: ["brand-a", 1] as unknown[] } }
      );

      act(() => result.current.loadMore());
      expect(result.current.limit).toBe(48);

      // New array reference, same stringified value -> no reset.
      rerender({ key: ["brand-a", 1] });
      expect(result.current.limit).toBe(48);
    });
  });

  describe("hasMore", () => {
    it("is true when limit is below total", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({ total: 100, pageSize: 24 })
      );
      expect(result.current.hasMore).toBe(true);
    });

    it("is false when limit meets total exactly", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({ total: 48, pageSize: 24 })
      );
      act(() => result.current.loadMore()); // limit 48 === total 48
      expect(result.current.hasMore).toBe(false);
    });

    it("is false when limit exceeds total", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({ total: 10, pageSize: 24 })
      );
      expect(result.current.hasMore).toBe(false);
    });

    it("is false when total is zero", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({ total: 0, pageSize: 24 })
      );
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe("showing", () => {
    it("builds the default caption", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({ total: 704, pageSize: 48 })
      );
      expect(result.current.showing(48)).toBe("Showing 48 of 704");
    });

    it("honors a custom label", () => {
      const { result } = renderHook(() =>
        useServerPagingCatto({
          total: 704,
          pageSize: 48,
          label: (shown, total) => `${shown}/${total}`,
        })
      );
      expect(result.current.showing(48)).toBe("48/704");
    });
  });
});
