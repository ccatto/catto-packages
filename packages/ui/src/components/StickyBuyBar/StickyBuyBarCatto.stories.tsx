import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import StickyBuyBarCatto from "./StickyBuyBarCatto";

const meta = {
  title: "Components/StickyBuyBar",
  component: StickyBuyBarCatto,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onBuyClick: fn(),
  },
  // Tall wrapper so the bar has something to scroll past (it reveals after
  // revealAfterPx). Scroll the preview to see it slide up.
  decorators: [
    (Story) => (
      <div style={{ minHeight: "160vh", padding: "1rem" }}>
        <p style={{ color: "var(--catto-theme-text, #555)" }}>
          Scroll down to reveal the sticky buy bar.
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StickyBuyBarCatto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    buyUrl: "https://example.com/buy",
    price: 129.99,
    revealAfterPx: 200,
  },
};

export const Discounted: Story = {
  args: {
    buyUrl: "https://example.com/buy",
    price: 99.99,
    compareAtPrice: 149.99,
    discountCode: "PPR",
    revealAfterPx: 200,
  },
};

export const WithProduct: Story = {
  args: {
    buyUrl: "https://example.com/buy",
    productName: "Joola Perseus CFS 16mm",
    imageUrl: "https://placehold.co/80x80",
    price: 219.95,
    compareAtPrice: 279.95,
    discountCode: "PPR10",
    ctaLabel: "Buy on Joola",
    revealAfterPx: 200,
  },
};

export const PreFormattedPrice: Story = {
  args: {
    buyUrl: "https://example.com/buy",
    priceLabel: "From $130",
    compareAtLabel: "$180",
    revealAfterPx: 200,
  },
};

export const NoBuyUrlRendersNothing: Story = {
  args: {
    buyUrl: null,
    price: 129.99,
  },
};
