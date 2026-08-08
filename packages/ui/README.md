# @ccatto/ui

> **Catto** _(noun)_ — Pronounced like it rhymes with "tomato" or "potato" 🍅🥔
>
> _"Is it cat-oh or cah-toe?"_ — Yes.

A production-ready React component library built with Tailwind CSS v4, designed for modern web and mobile applications.

## The Story

I started building these components in 2022 while working on [RLeaguez.com](https://www.rleaguez.com), a sports league management platform. After years of copying the same Button, Card, and Modal components between projects, I decided to package them up properly.

Now I'm sharing them with the community. Take them, use them, build something cool. If they save you time, that's all the thanks I need.

— **Chris Catto**

## Who Is This For?

**@ccatto/ui is built for you if:**

- You're building a **Next.js 14+** app with the App Router
- You use **Tailwind CSS** (v3 or v4) for styling
- You want **dark mode** without the headache
- You need components that work on **web and mobile** (Capacitor/iOS/Android)
- You're tired of building the same Button, Modal, and Table for every project
- You value **TypeScript**, **accessibility**, and **consistent APIs**

**Perfect for:**

- SaaS dashboards
- E-commerce sites
- Sports/league management apps
- Admin panels
- Mobile-first web apps

**Not the best fit if:**

- You need unstyled/headless primitives (check out [Radix UI](https://www.radix-ui.com/) or [DaisyUI](https://daisyui.com/))
- You're not using React
- You prefer CSS-in-JS over Tailwind

## Overview

**@ccatto/ui** provides a comprehensive set of accessible, themeable UI components that work seamlessly with Next.js 14+ and React 18+. Built with a "dark-first" design philosophy, every component looks great in both light and dark modes out of the box.

**Why choose @ccatto/ui?**

- **Production-Tested** — Battle-tested in the RLeaguez sports platform serving real users
- **Accessibility First** — ARIA labels, keyboard navigation, and screen reader support built-in
- **Performance Optimized** — React.memo on high-frequency components, forwardRef support for form integration
- **i18n Ready** — Ships with 7 languages (EN, ES, PT, ZH, FR, DE, HI) + easy custom translations
- **Mobile Native** — Optional Capacitor haptics integration for iOS/Android apps
- **Consistent API** — Predictable props patterns across all components (`variant`, `size`, `className`)
- **Zero Config Theming** — CSS custom properties for runtime theme switching without rebuilds

Whether you're building a dashboard, e-commerce site, or mobile app, @ccatto/ui gives you the building blocks to ship faster without sacrificing quality.

## Features

- **71 UI Components** - Buttons, Cards, Inputs, Modals, Tables, Forms, Calendars, and more
- **5 Custom Hooks** - Table state, haptic feedback, drag-and-drop, server-side paging
- **7 Languages** - English, Spanish, Portuguese, Chinese, French, German, Hindi
- **Tailwind CSS v4** - Modern utility-first styling
- **Dark Mode Support** - All components support light/dark themes
- **TypeScript** - Full type definitions included
- **Next.js Compatible** - Works with App Router and `use client` directive
- **Mobile Ready** - Optional Capacitor haptics support for iOS/Android
- **2 Themes** - RLeaguez (orange/navy) and Neon Pulse themes included
- **1,208 Unit Tests** - Comprehensive test coverage with Vitest
- **Storybook** - Visual component documentation with 50+ stories

## Installation

```bash
# Using yarn (recommended for RLeaguez monorepo)
yarn add @ccatto/ui

# Using npm
npm install @ccatto/ui
```

### Peer Dependencies

```json
{
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0",
  "next": ">=13.0.0"
}
```

### Optional Peer Dependencies

```json
{
  "@capacitor/core": ">=5.0.0", // For mobile haptics
  "@capacitor/haptics": ">=5.0.0", // For mobile haptics
  "@tanstack/react-table": ">=8.0.0", // For table utilities
  "libphonenumber-js": ">=1.10.0", // For phone input formatting
  "react-hook-form": ">=7.0.0", // For FormCatto
  "zod": ">=3.0.0", // For FormCatto validation
  "@hookform/resolvers": ">=3.0.0", // For FormCatto zod integration
  "next-themes": ">=0.2.0" // For ThemeToggleCatto
}
```

## Quick Start

```tsx
import { ButtonCatto, CardCatto, InputCatto } from '@ccatto/ui';

function MyComponent() {
  return (
    <CardCatto title="Welcome" width="lg">
      <InputCatto placeholder="Enter your name" />
      <ButtonCatto variant="primary" onClick={() => alert('Hello!')}>
        Say Hello
      </ButtonCatto>
    </CardCatto>
  );
}
```

## Tailwind CSS Configuration

Add the package to your Tailwind CSS content sources:

```css
/* In your global.css (Tailwind v4) */
@import 'tailwindcss';
@source "../../node_modules/@ccatto/ui/dist";
```

Or in `tailwind.config.js` (Tailwind v3):

```js
module.exports = {
  content: [
    // ... your other paths
    './node_modules/@ccatto/ui/dist/**/*.{js,cjs}',
  ],
};
```

## Theme Setup

Import the theme CSS files in your app:

```tsx
// In your layout or global styles
import '@ccatto/ui/themes/tokens.css';
import '@ccatto/ui/themes/rleaguez.css';

// Or for the alternative theme:
// import '@ccatto/ui/themes/neon-pulse.css';
```

---

## Components (70)

### Core Components

| Component               | Description                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `ButtonCatto`           | Versatile button with 13 variants, loading states, haptic feedback      |
| `CardCatto`             | Content container with collapsible sections, multiple widths/elevations |
| `InputCatto`            | Text input with validation, icons, multiple variants                    |
| `SelectCatto`           | Dropdown select with search, custom rendering, keyboard navigation      |
| `SearchableSelectCatto` | Searchable dropdown with create-new option                              |
| `LinkCatto`             | Styled links with 8 variants, icons, button-style options               |
| `CheckboxCatto`         | Checkbox input with 4 sizes, custom styling                             |

### Form Components

| Component         | Description                                        |
| ----------------- | -------------------------------------------------- |
| `FormCatto`       | Form wrapper with react-hook-form + Zod validation |
| `OtpInputCatto`   | Multi-digit OTP/verification code input            |
| `DatePickerCatto` | Date input with calendar popup                     |
| `CalendarCatto`   | Calendar for date selection with 5 themes          |

### Feedback Components

| Component          | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `ToastCatto`       | Notifications with 6 variants, animations, placements           |
| `MellowModalCatto` | Modal dialog with themes, sizes, positions, auto-close          |
| `TooltipCatto`     | Hover tooltips with 5 variants, 4 positions                     |
| `EmptyStateCatto`  | Empty/no-data states with icons, actions, variants              |
| `BadgeCatto`       | Status badges with 8 variants, icons, dot mode, pulse animation |

### Navigation Components

| Component                | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| `TabsCatto`              | Tabbed navigation with 4 variants, icons, disabled states |
| `DrawerCatto`            | Slide-out drawer/sidebar                                  |
| `BottomNavCatto`         | Mobile bottom navigation with hide-on-scroll              |
| `AnimatedHamburgerCatto` | Animated hamburger menu icon                              |
| `NavLinkGroupCatto`      | Grouped navigation links with section headers             |
| `SidebarTreeNavCatto`    | Collapsible **nested** navigation tree (docs-style sidebar) |
| `HideOnScrollWrapper`    | Wrapper that hides content on scroll                      |

#### `SidebarTreeNavCatto` — nested docs-style nav tree

Generic, **data-driven** collapsible tree for knowledge bases / docs. Renders
whatever `items` tree it's given (arbitrary depth), auto-expands the ancestor
path to the active item, and is keyboard + screen-reader accessible. It owns no
layout — you place it.

```tsx
import { SidebarTreeNavCatto, type NavTreeItem } from "@ccatto/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navTree: NavTreeItem[] = [
  {
    key: "basics",
    label: "Basics",
    children: [
      { key: "rules", label: "The Rules", href: "/pickle-talk/rules" },
      { key: "scoring", label: "Scoring", href: "/pickle-talk/scoring" },
    ],
  },
  { key: "about", label: "About", href: "/about" },
];

// Desktop: a persistent sticky aside.
<aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto lg:block">
  <SidebarTreeNavCatto
    items={navTree}
    title="Pickle Talk"
    currentPath={usePathname()}
    collapsible
    storageKey="pickle-talk-nav"
    LinkComponent={Link}
  />
</aside>;
```

**Mobile** — wrap the *same* component in `DrawerCatto` (left flyout) opened by a
"Contents" button; nothing tree-specific changes:

```tsx
<DrawerCatto isOpen={open} onClose={() => setOpen(false)} side="left" title="Contents">
  <SidebarTreeNavCatto items={navTree} currentPath={pathname} LinkComponent={Link} />
</DrawerCatto>
```

**Sibling scroll-row recipe** — pair the tree with a slim
`MobileScrollIndicatorWrapperCatto` row of the current section's siblings for
quick thumb-hops, fed from the same data via the exported `findNavTreePath`:

```tsx
import { findNavTreePath, MobileScrollIndicatorWrapperCatto } from "@ccatto/ui";

const path = findNavTreePath(navTree, { currentPath: pathname }); // ["basics","rules"]
const parentKey = path[path.length - 2];
const siblings = /* find parentKey's children in navTree */ [];

<MobileScrollIndicatorWrapperCatto className="lg:hidden">
  <div className="flex gap-2 px-4">
    {siblings.map((s) => <Link key={s.key} href={s.href!}>{s.label}</Link>)}
  </div>
</MobileScrollIndicatorWrapperCatto>;
```

**Data source** — the control is pure, so adding a page never means editing the
nav: (1) keep a static `navTree.ts` and pass it in, or (2) build the same
`NavTreeItem[]` shape from a DB pages table (parent/order) with admin CRUD +
`useDragDropList` reordering. Same `items` shape either way.

### Data Display

| Component            | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `AvatarCatto`        | User avatar with image, initials fallback, status indicator |
| `SkeletonBaseCatto`  | Base skeleton with shimmer animation                        |
| `CardSkeletonCatto`  | Card-shaped loading skeleton                                |
| `TableSkeletonCatto` | Table loading skeleton                                      |
| `CarouselCatto`      | Image carousel with auto-advance and manual navigation      |

### Table Components (14)

| Component                                 | Description                                  |
| ----------------------------------------- | -------------------------------------------- |
| `TableCatto`                              | Full-featured data table with TanStack Table |
| `TableCoreCatto`                          | Core table rendering component               |
| `TableControlsCatto`                      | Table filter, search, and column visibility  |
| `SortableHeaderCatto`                     | Sortable column header                       |
| `Table`, `TableHeader`, `TableBody`, etc. | Primitive table elements                     |

### E-commerce Components

| Component               | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `ProductCardCatto`      | Product display card with image, price, rating, wishlist |
| `PricingCardCatto`      | Pricing tier card for subscription displays              |
| `CartItemCatto`         | Cart line item with quantity selector, remove action     |
| `QuantitySelectorCatto` | Quantity +/- buttons with min/max limits                 |
| `RatingStarsCatto`      | Star rating display/input with partial stars             |
| `ProductFilterSidebarCatto` | Faceted filter sidebar (desktop column + mobile drawer) |

#### `ProductFilterSidebarCatto` — mobile trigger placement

On mobile the component renders a built-in "Filters" hamburger trigger plus a
left drawer. To place the trigger **inline with your page `<h1>`** instead
(right-justified, mobile only), pass `hideMobileTrigger` and render your own
button that calls the same `onOpen` you pass to the sidebar:

```tsx
const [filtersOpen, setFiltersOpen] = useState(false);

<div className="flex items-center justify-between lg:block">
  <h1 className="text-2xl font-bold">Paddles</h1>
  <button className="lg:hidden" onClick={() => setFiltersOpen(true)}>
    Filters
  </button>
</div>

<ProductFilterSidebarCatto
  sections={sections}
  onChange={handleChange}
  isOpen={filtersOpen}
  onOpen={() => setFiltersOpen(true)}
  onClose={() => setFiltersOpen(false)}
  hideMobileTrigger   // suppress the built-in trigger; drawer still renders
/>;
```

### Server-side List Controls

Data-source-agnostic primitives for server-driven lists (paging + sort). They
manage **UI state only** — feed the returned values into your own query.

| Component               | Description                                                |
| ----------------------- | --------------------------------------------------------- |
| `useServerPagingCatto`  | Hook owning "Load more" `limit` state + reset-on-filter   |
| `LoadMoreButtonCatto`   | Centered load-more button + "Showing X of N" caption      |
| `SortSelectCatto`       | Accessible labeled sort `<select>` emitting a value string |
| `PaginationCatto`       | Numbered prev/next pager (classic page-based style)        |

### Phone Components

| Component           | Description                                         |
| ------------------- | --------------------------------------------------- |
| `PhoneInputCatto`   | Phone number input with auto-formatting, validation |
| `PhoneDisplayCatto` | Formatted phone number display                      |

### Loading Components

| Component                       | Description                                      |
| ------------------------------- | ------------------------------------------------ |
| `PageLoadingCatto`              | Full-page loading spinner with RLeaguez branding |
| `InlineLoadingCatto`            | Inline loading spinner for containers            |
| `LoadingCircleOrangeFancyCatto` | Animated orange loading circle                   |
| `LoadingMessageAndCircleCatto`  | Loading with message                             |

### Stepper Components

| Component              | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `ProgressStepperCatto` | Visual progress indicator for multi-step flows |
| `DetailedStepperCatto` | Stepper with titles and descriptions           |

### HR (Divider) Components (12)

| Component             | Description                          |
| --------------------- | ------------------------------------ |
| `HRDividerCatto`      | Basic dashed divider                 |
| `HRCircleCatto`       | Divider with circle decoration       |
| `HRTriangleCatto`     | Divider with triangle decoration     |
| `HRAnimatedLineCatto` | Animated line divider                |
| `HRSquareCatto`       | Divider with square decoration       |
| `HRSquaresCatto`      | Divider with multiple squares        |
| `HRPartyPulseCatto`   | Colorful pulsing divider             |
| `HRPulseDividerCatto` | Subtle pulsing divider               |
| `HRSubtleCatto`       | Minimal subtle divider               |
| `HRWideCatto`         | Wide decorative divider              |
| `HRHypnoCatto`        | Hypnotic animated divider            |
| `SectionTitleCatto`   | Section title with optional subtitle |

### Utility Components

| Component                           | Description                             |
| ----------------------------------- | --------------------------------------- |
| `ThemeSwitcherCatto`                | Theme selection component               |
| `ThemeToggleCatto`                  | Dark/light mode toggle (next-themes)    |
| `ButtonTogglePillCatto`             | Pill-shaped toggle button               |
| `LanguageSwitcherCatto`             | Language/locale switcher                |
| `MobileScrollIndicatorWrapperCatto` | Scroll indicator for mobile             |
| `AddToCalendarCatto`                | Calendar export dropdown (ICS + Google) |

---

## Component Examples

### ButtonCatto

```tsx
import { ButtonCatto } from '@ccatto/ui';
import { Mail } from 'lucide-react';

<ButtonCatto variant="primary" size="medium" onClick={handleClick}>
  Click Me
</ButtonCatto>

<ButtonCatto variant="danger" leftIcon={<Trash2 className="h-4 w-4" />}>
  Delete
</ButtonCatto>

<ButtonCatto variant="primary" isLoading>
  Saving...
</ButtonCatto>
```

**Variants:** `primary`, `secondary`, `tertiary`, `danger`, `catto`, `ghost`, `outline`, `goGreen`, `pill`, `pillOutline`, `funOrange`, `outlineRoundedXL`, `blueGradientXL`

### CardCatto

```tsx
import { CardCatto } from '@ccatto/ui';

<CardCatto
  title="Section Title"
  width="lg"
  collapsible
  defaultCollapsed={false}
>
  <p>Card content goes here</p>
</CardCatto>;
```

### BadgeCatto

```tsx
import { BadgeCatto } from '@ccatto/ui';

<BadgeCatto variant="success">Active</BadgeCatto>
<BadgeCatto variant="error" pulse>Live</BadgeCatto>
<BadgeCatto variant="primary" dot>New</BadgeCatto>
```

**Variants:** `default`, `primary`, `secondary`, `success`, `warning`, `error`, `info`, `outline`

### ProductCardCatto

```tsx
import { ProductCardCatto } from '@ccatto/ui';

<ProductCardCatto
  name="Premium Widget"
  price={29.99}
  originalPrice={39.99}
  image="/product.jpg"
  rating={4.5}
  reviewCount={128}
  onAddToCart={() => {}}
  onToggleWishlist={() => {}}
/>;
```

### MellowModalCatto

```tsx
import { MellowModalCatto } from '@ccatto/ui';

<MellowModalCatto
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  theme="danger"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
</MellowModalCatto>;
```

---

## Hooks (5)

### useHaptics

Provides haptic feedback on mobile devices (requires Capacitor).

```tsx
import { useHaptics } from '@ccatto/ui';

function MyComponent() {
  const { triggerHaptic, isAvailable } = useHaptics();

  const handlePress = () => {
    triggerHaptic('medium'); // 'light' | 'medium' | 'heavy'
  };

  return <button onClick={handlePress}>Tap me</button>;
}
```

### useTableStateCatto

Manages TanStack Table state (sorting, filtering, visibility, selection).

```tsx
import { useTableStateCatto } from '@ccatto/ui';

function MyTable() {
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
  } = useTableStateCatto();

  // Use with useReactTable...
}
```

### useTableInstanceCatto

Creates a TanStack Table instance with common configuration.

```tsx
import { useTableInstanceCatto } from '@ccatto/ui';

function MyTable({ data, columns }) {
  const table = useTableInstanceCatto(data, columns);
  // Render table...
}
```

### useDragDropList

Drag and drop list functionality.

```tsx
import { useDragDropList } from '@ccatto/ui';

function MyList({ items, onReorder }) {
  const { dragHandleProps, isDragging } = useDragDropList({
    items,
    onReorder,
  });
  // Render draggable list...
}
```

### useServerPagingCatto (server-side "Load more")

UI-only paging state for lists backed by a server query with
`{ take, skip, orderBy, orderDir }`. The hook owns `limit`; you wire it into
your own query. Changing `resetKey` (filters/search/sort) snaps back to page 1.

```tsx
import {
  useServerPagingCatto,
  LoadMoreButtonCatto,
  SortSelectCatto,
  ProductGridCatto,
} from '@ccatto/ui';

// 6-line wiring: hook -> external query -> button
const { limit, loadMore, hasMore } = useServerPagingCatto({
  total,
  pageSize: 48,
  resetKey: [brandSlug, shapes, search, sortKey],
});
const [orderBy, orderDir] = sortKey.split(':'); // your app maps sortKey -> query
const { data, loading } = useQuery(QUERY, {
  variables: { pagination: { take: limit, orderBy, orderDir } },
});
const items = data?.items ?? [];

return (
  <>
    <SortSelectCatto
      value={sortKey}
      onChange={setSortKey}
      options={[
        { value: 'createdAt:desc', label: 'Newest' },
        { value: 'price:asc', label: 'Price: Low to High' },
      ]}
    />
    <ProductGridCatto cols={4} loading={loading && items.length === 0}>
      {items.map((p) => (
        <ProductTileCatto key={p.id} {...p} />
      ))}
    </ProductGridCatto>
    <LoadMoreButtonCatto
      shown={items.length}
      total={total}
      loading={loading}
      onClick={loadMore}
    />
  </>
);
```

---

## Utilities

### cn

Class name merge utility (combines clsx + tailwind-merge).

```tsx
import { cn } from '@ccatto/ui';

<div className={cn('base-class', isActive && 'active-class', className)} />;
```

### Phone Utilities

```tsx
import {
  formatPhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumber,
} from '@ccatto/ui';

formatPhoneNumber('+15551234567'); // "(555) 123-4567"
isValidPhoneNumber('5551234567'); // true
```

### Keyboard Utilities

```tsx
import { handleKeyboardSelect, isEnterOrSpace } from '@ccatto/ui';

<div role="button" tabIndex={0} onKeyDown={handleKeyboardSelect(onClick)}>
  Accessible button
</div>;
```

---

## Internationalization (i18n)

All components accept a `labels` prop for easy internationalization. We also ship pre-made translations for popular languages.

### Available Locales

| Language               | Import                                    | Locale Code  |
| ---------------------- | ----------------------------------------- | ------------ |
| English                | `defaultLabels`                           | en (default) |
| Spanish                | `spanishLabels` or `esLabels`             | es           |
| Portuguese (Brazilian) | `portugueseLabels` or `ptLabels`          | pt-BR        |
| Chinese (Simplified)   | `chineseSimplifiedLabels` or `zhCNLabels` | zh-CN        |
| French                 | `frenchLabels` or `frLabels`              | fr           |
| German                 | `germanLabels` or `deLabels`              | de           |
| Hindi                  | `hindiLabels` or `hiLabels`               | hi           |

### Using Pre-made Translations

```tsx
import { portugueseLabels, SelectCatto, spanishLabels } from '@ccatto/ui';

// Use with a specific component
<SelectCatto labels={spanishLabels.select} options={options} />;

// Or use the full labels object based on locale
const labels =
  locale === 'es'
    ? spanishLabels
    : locale === 'pt'
      ? portugueseLabels
      : defaultLabels;

<SelectCatto labels={labels.select} options={options} />;
```

### Custom Translations

You can also provide your own translations:

```tsx
import { defaultLabels, SelectCatto } from '@ccatto/ui';

const frenchLabels = {
  ...defaultLabels,
  select: {
    placeholder: 'Sélectionnez une option',
    noOptions: 'Aucune option trouvée',
    clearButton: 'Effacer la sélection',
  },
};

<SelectCatto labels={frenchLabels.select} options={options} />;
```

---

## Types

```tsx
import type {
  FontSizeType,
  FontWeightType,
  HapticFeedback,
  SelectOption,
  StyleAnimations,
  StyleWidth,
  ThemeType,
} from '@ccatto/ui';
```

---

## Storybook

Run Storybook to explore all components visually:

```bash
yarn workspace @ccatto/ui storybook
# Opens at http://localhost:6006
```

Build static Storybook:

```bash
yarn workspace @ccatto/ui build-storybook
```

---

## Development

### Building the Package

```bash
cd packages/ui
yarn build
```

### Watch Mode

```bash
yarn dev
```

### Testing

```bash
yarn test        # Watch mode
yarn test:run    # Single run (1,208 tests)
yarn test:coverage
```

### Type Checking

```bash
yarn typecheck
```

---

## Package Info

- **Version:** 1.0.0
- **Bundle Size:** ~255KB (ESM)
- **License:** MIT
- **Author:** Chris Catto

---

## Links

- [RLeaguez](https://www.rleaguez.com) - Live application
- [GitHub](https://github.com/chriscatto/catto-ui) - Source code
- [CHANGELOG](./CHANGELOG.md) - Version history
- [CONTRIBUTING](./CONTRIBUTING.md) - Contribution guidelines
