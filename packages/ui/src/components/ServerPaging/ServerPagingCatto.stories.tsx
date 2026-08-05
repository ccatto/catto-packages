import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { LoadMoreButtonCatto } from "./LoadMoreButtonCatto";
import { SortSelectCatto } from "./SortSelectCatto";
import { PaginationCatto } from "./PaginationCatto";

// ============================================
// LoadMoreButtonCatto
// ============================================

const loadMoreMeta = {
  title: "Components/ServerPaging/LoadMoreButton",
  component: LoadMoreButtonCatto,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof LoadMoreButtonCatto>;

export default loadMoreMeta;
type LoadMoreStory = StoryObj<typeof loadMoreMeta>;

export const LoadMoreDefault: LoadMoreStory = {
  args: { shown: 48, total: 704, loading: false, onClick: fn() },
};

export const LoadMoreLoading: LoadMoreStory = {
  args: { shown: 48, total: 704, loading: true, onClick: fn() },
};

/** Hidden entirely once everything is shown. */
export const LoadMoreAllShown: LoadMoreStory = {
  args: { shown: 704, total: 704, onClick: fn() },
};

// ============================================
// SortSelectCatto
// ============================================

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
];

export const SortSelect: StoryObj<typeof SortSelectCatto> = {
  render: () => {
    const [value, setValue] = useState("newest");
    return (
      <SortSelectCatto
        label="Sort"
        value={value}
        onChange={setValue}
        options={SORT_OPTIONS}
      />
    );
  },
};

// ============================================
// PaginationCatto
// ============================================

export const Pagination: StoryObj<typeof PaginationCatto> = {
  render: () => {
    const [page, setPage] = useState(3);
    return (
      <PaginationCatto page={page} pageCount={12} onPageChange={setPage} />
    );
  },
};
