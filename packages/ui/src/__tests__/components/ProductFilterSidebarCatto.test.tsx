// @ccatto/ui - ProductFilterSidebarCatto Tests
import { describe, expect, it, vi } from "vitest";
import ProductFilterSidebarCatto, {
  type FilterSection,
} from "../../components/ProductFilterSidebar/ProductFilterSidebarCatto";
import { fireEvent, render, screen } from "../test-utils";

const sections: FilterSection[] = [
  {
    key: "brand",
    title: "Brand",
    type: "checkbox",
    options: [
      { label: "Selkirk", value: "selkirk", count: 42 },
      { label: "Joola", value: "joola", count: 30 },
    ],
    selected: [],
  },
];

describe("ProductFilterSidebarCatto", () => {
  describe("mobile trigger", () => {
    it("renders the built-in trigger by default when mobile props are provided", () => {
      const onOpen = vi.fn();
      render(
        <ProductFilterSidebarCatto
          sections={sections}
          onChange={vi.fn()}
          isOpen={false}
          onOpen={onOpen}
          onClose={vi.fn()}
        />
      );

      const trigger = screen.getByRole("button", { name: "Filters" });
      expect(trigger).toBeInTheDocument();

      fireEvent.click(trigger);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("uses a custom mobileTriggerLabel", () => {
      render(
        <ProductFilterSidebarCatto
          sections={sections}
          onChange={vi.fn()}
          isOpen={false}
          onOpen={vi.fn()}
          onClose={vi.fn()}
          mobileTriggerLabel="Refine"
        />
      );

      expect(
        screen.getByRole("button", { name: "Refine" })
      ).toBeInTheDocument();
    });

    it("hides the built-in trigger when hideMobileTrigger is set", () => {
      render(
        <ProductFilterSidebarCatto
          sections={sections}
          onChange={vi.fn()}
          isOpen={false}
          onOpen={vi.fn()}
          onClose={vi.fn()}
          hideMobileTrigger
        />
      );

      expect(
        screen.queryByRole("button", { name: "Filters" })
      ).not.toBeInTheDocument();
    });

    it("renders no trigger at all when mobile props are omitted (desktop only)", () => {
      render(
        <ProductFilterSidebarCatto sections={sections} onChange={vi.fn()} />
      );

      expect(
        screen.queryByRole("button", { name: "Filters" })
      ).not.toBeInTheDocument();
    });
  });
});
