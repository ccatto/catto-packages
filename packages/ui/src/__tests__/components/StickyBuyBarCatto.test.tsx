// @ccatto/ui - StickyBuyBarCatto tests
import { describe, expect, it, vi } from "vitest";
import StickyBuyBarCatto from "../../components/StickyBuyBar/StickyBuyBarCatto";
import { fireEvent, render, screen } from "../test-utils";

describe("StickyBuyBarCatto", () => {
  it("renders nothing when buyUrl is absent", () => {
    const { container } = render(<StickyBuyBarCatto price={99} />);
    expect(container).toBeEmptyDOMElement();
  });

  // The bar is aria-hidden until revealed, so role queries use { hidden: true }.
  it("renders a Buy link with affiliate-safe rel + new tab", () => {
    render(<StickyBuyBarCatto buyUrl="https://shop.example/p" price={99} />);
    const link = screen.getByRole("link", { name: "Buy", hidden: true });
    expect(link).toHaveAttribute("href", "https://shop.example/p");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "nofollow sponsored noopener noreferrer");
  });

  it("uses a custom ctaLabel", () => {
    render(
      <StickyBuyBarCatto buyUrl="https://x.test" price={10} ctaLabel="Shop now" />
    );
    expect(
      screen.getByRole("link", { name: "Shop now", hidden: true })
    ).toBeInTheDocument();
  });

  it("fires onBuyClick when the Buy link is clicked", () => {
    const onBuyClick = vi.fn();
    render(
      <StickyBuyBarCatto
        buyUrl="https://x.test"
        price={10}
        onBuyClick={onBuyClick}
      />
    );
    fireEvent.click(screen.getByRole("link", { name: "Buy", hidden: true }));
    expect(onBuyClick).toHaveBeenCalledTimes(1);
  });

  it("formats price with Intl currency", () => {
    render(
      <StickyBuyBarCatto buyUrl="https://x.test" price={129.99} currency="USD" />
    );
    expect(screen.getByText("$129.99")).toBeInTheDocument();
  });

  it("prefers priceLabel over numeric formatting", () => {
    render(
      <StickyBuyBarCatto
        buyUrl="https://x.test"
        price={129.99}
        priceLabel="From $130"
      />
    );
    expect(screen.getByText("From $130")).toBeInTheDocument();
    expect(screen.queryByText("$129.99")).toBeNull();
  });

  it("shows a struck-through compare-at price only when higher than price", () => {
    const { rerender } = render(
      <StickyBuyBarCatto
        buyUrl="https://x.test"
        price={80}
        compareAtPrice={100}
      />
    );
    const strike = screen.getByText("$100.00");
    expect(strike).toBeInTheDocument();
    expect(strike.className).toContain("line-through");

    // Not higher -> no compare-at shown.
    rerender(
      <StickyBuyBarCatto
        buyUrl="https://x.test"
        price={80}
        compareAtPrice={80}
      />
    );
    expect(screen.queryByText("$80.00", { selector: ".line-through" })).toBeNull();
  });

  it("shows the discount-code chip only when a code is set", () => {
    const { rerender } = render(
      <StickyBuyBarCatto buyUrl="https://x.test" price={10} discountCode="PPR" />
    );
    expect(screen.getByText("Code: PPR")).toBeInTheDocument();

    rerender(<StickyBuyBarCatto buyUrl="https://x.test" price={10} />);
    expect(screen.queryByText(/Code:/)).toBeNull();
  });

  it("renders the product name when provided", () => {
    render(
      <StickyBuyBarCatto
        buyUrl="https://x.test"
        price={10}
        productName="Joola Perseus"
      />
    );
    expect(screen.getByText("Joola Perseus")).toBeInTheDocument();
  });

  it("starts hidden (translated off-screen) until reveal", () => {
    const { container } = render(
      <StickyBuyBarCatto buyUrl="https://x.test" price={10} />
    );
    // The fixed bar is the second child (first is the in-flow spacer).
    const bar = container.querySelector(".fixed");
    expect(bar?.className).toContain("translate-y-full");
    expect(bar).toHaveAttribute("aria-hidden", "true");
  });

  it("reveals after scrolling past revealAfterPx", () => {
    const { container } = render(
      <StickyBuyBarCatto buyUrl="https://x.test" price={10} revealAfterPx={300} />
    );
    const bar = () => container.querySelector(".fixed") as HTMLElement;
    expect(bar().className).toContain("translate-y-full");

    Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
    fireEvent.scroll(window);

    expect(bar().className).toContain("translate-y-0");
    expect(bar()).toHaveAttribute("aria-hidden", "false");
  });
});
