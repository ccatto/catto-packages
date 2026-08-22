// @ccatto/ui - AccordionCatto tests
import { describe, expect, it, vi } from "vitest";
import {
  AccordionCatto,
  AccordionItemCatto,
} from "../../components/Accordion/AccordionCatto";
import { fireEvent, render, screen } from "../test-utils";

const items = [
  { id: "a", title: "Shipping", content: "Ships in 2 days" },
  { id: "b", title: "Returns", content: "30 day returns" },
  { id: "c", title: "Warranty", content: "1 year warranty", disabled: true },
];

describe("AccordionCatto (data-driven items)", () => {
  it("renders a header button per item with aria-expanded=false by default", () => {
    render(<AccordionCatto items={items} />);
    const headers = screen.getAllByRole("button");
    expect(headers).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Shipping" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("opens an item on click and links the panel via aria-controls", () => {
    render(<AccordionCatto items={items} />);
    const header = screen.getByRole("button", { name: "Shipping" });
    fireEvent.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
    const panelId = header.getAttribute("aria-controls");
    const panel = document.getElementById(panelId as string);
    expect(panel).toBeTruthy();
    expect(panel).toHaveAttribute("aria-labelledby", header.id);
  });

  it("respects defaultValue for the initial open item", () => {
    render(<AccordionCatto items={items} defaultValue="b" />);
    expect(screen.getByRole("button", { name: "Returns" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("disabled items cannot be toggled", () => {
    render(<AccordionCatto items={items} />);
    const disabled = screen.getByRole("button", { name: "Warranty" });
    expect(disabled).toBeDisabled();
    fireEvent.click(disabled);
    expect(disabled).toHaveAttribute("aria-expanded", "false");
  });
});

describe("AccordionCatto single vs multiple", () => {
  it('single mode closes the previously open item ("only one open")', () => {
    render(<AccordionCatto type="single" items={items} />);
    const a = screen.getByRole("button", { name: "Shipping" });
    const b = screen.getByRole("button", { name: "Returns" });
    fireEvent.click(a);
    expect(a).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(b);
    expect(a).toHaveAttribute("aria-expanded", "false");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });

  it("single + collapsible=false keeps the open item open on re-click", () => {
    render(<AccordionCatto type="single" collapsible={false} items={items} />);
    const a = screen.getByRole("button", { name: "Shipping" });
    fireEvent.click(a);
    fireEvent.click(a); // second click would normally close
    expect(a).toHaveAttribute("aria-expanded", "true");
  });

  it("multiple mode keeps several items open", () => {
    render(<AccordionCatto type="multiple" items={items} />);
    const a = screen.getByRole("button", { name: "Shipping" });
    const b = screen.getByRole("button", { name: "Returns" });
    fireEvent.click(a);
    fireEvent.click(b);
    expect(a).toHaveAttribute("aria-expanded", "true");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });
});

describe("AccordionCatto onValueChange", () => {
  it("emits a string in single mode and empty string when collapsed", () => {
    const onValueChange = vi.fn();
    render(
      <AccordionCatto type="single" items={items} onValueChange={onValueChange} />
    );
    const a = screen.getByRole("button", { name: "Shipping" });
    fireEvent.click(a);
    expect(onValueChange).toHaveBeenLastCalledWith("a");
    fireEvent.click(a);
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("emits an array in multiple mode", () => {
    const onValueChange = vi.fn();
    render(
      <AccordionCatto
        type="multiple"
        items={items}
        onValueChange={onValueChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Shipping" }));
    fireEvent.click(screen.getByRole("button", { name: "Returns" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);
  });
});

describe("AccordionCatto keyboard navigation", () => {
  it("ArrowDown moves focus to the next enabled header (skips disabled)", () => {
    render(<AccordionCatto items={items} />);
    const a = screen.getByRole("button", { name: "Shipping" });
    const b = screen.getByRole("button", { name: "Returns" });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(document.activeElement).toBe(b);
    // Warranty is disabled, so ArrowDown from Returns wraps back to Shipping.
    fireEvent.keyDown(b, { key: "ArrowDown" });
    expect(document.activeElement).toBe(a);
  });

  it("Home/End jump to the first/last enabled header", () => {
    render(<AccordionCatto items={items} />);
    const a = screen.getByRole("button", { name: "Shipping" });
    const b = screen.getByRole("button", { name: "Returns" });
    a.focus();
    fireEvent.keyDown(a, { key: "End" });
    expect(document.activeElement).toBe(b);
    fireEvent.keyDown(b, { key: "Home" });
    expect(document.activeElement).toBe(a);
  });
});

describe("AccordionCatto compound API", () => {
  it("works with <AccordionItemCatto> children", () => {
    render(
      <AccordionCatto type="multiple">
        <AccordionItemCatto value="x" title="One">
          First
        </AccordionItemCatto>
        <AccordionItemCatto value="y" title="Two">
          Second
        </AccordionItemCatto>
      </AccordionCatto>
    );
    const one = screen.getByRole("button", { name: "One" });
    fireEvent.click(one);
    expect(one).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("First")).toBeInTheDocument();
  });

  it("throws if AccordionItemCatto is used outside AccordionCatto", () => {
    // Silence the expected React error boundary logging.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <AccordionItemCatto value="z" title="Orphan">
          nope
        </AccordionItemCatto>
      )
    ).toThrow(/must be rendered inside <AccordionCatto>/);
    spy.mockRestore();
  });
});

describe("AccordionCatto controlled mode", () => {
  it("reflects the `value` prop and does not self-toggle", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <AccordionCatto
        type="single"
        items={items}
        value="a"
        onValueChange={onValueChange}
      />
    );
    const a = screen.getByRole("button", { name: "Shipping" });
    const b = screen.getByRole("button", { name: "Returns" });
    expect(a).toHaveAttribute("aria-expanded", "true");
    // Clicking asks the parent but does not change local state.
    fireEvent.click(b);
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(b).toHaveAttribute("aria-expanded", "false");
    // Parent updates the prop -> reflected.
    rerender(
      <AccordionCatto
        type="single"
        items={items}
        value="b"
        onValueChange={onValueChange}
      />
    );
    expect(b).toHaveAttribute("aria-expanded", "true");
  });
});
