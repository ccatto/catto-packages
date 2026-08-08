import type { Meta, StoryObj } from "@storybook/react";
import SidebarTreeNavCatto, {
  type NavTreeItem,
} from "./SidebarTreeNavCatto";

const TREE: NavTreeItem[] = [
  {
    key: "basics",
    label: "Basics",
    defaultOpen: true,
    children: [
      { key: "rules", label: "The Rules", href: "/pickle-talk/rules" },
      { key: "scoring", label: "Scoring", href: "/pickle-talk/scoring" },
      { key: "glossary", label: "Glossary", href: "/pickle-talk/glossary" },
    ],
  },
  {
    key: "training",
    label: "Training",
    href: "/pickle-talk/training",
    children: [
      {
        key: "drills",
        label: "Drills",
        children: [
          {
            key: "ready-position",
            label: "Ready Position",
            href: "/pickle-talk/training/ready-position",
          },
          {
            key: "dinking",
            label: "Dinking",
            href: "/pickle-talk/training/dinking",
          },
        ],
      },
      {
        key: "schedules",
        label: "Schedules",
        href: "/pickle-talk/training/schedules",
      },
    ],
  },
  {
    key: "gear",
    label: "Gear",
    badge: <span className="rounded bg-theme-secondary-subtle px-1.5 text-xs">3</span>,
    children: [
      { key: "paddles", label: "Paddles", href: "/gear/paddles" },
      { key: "balls", label: "Balls", href: "/gear/balls" },
    ],
  },
  { key: "about", label: "About", href: "/about" },
];

const meta = {
  title: "Components/SidebarTreeNav",
  component: SidebarTreeNavCatto,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="max-w-xs rounded-xl border border-theme-border p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarTreeNavCatto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { items: TREE, title: "Pickle Talk" },
};

/** Auto-expands the ancestor path to the active leaf and highlights it. */
export const ActivePath: Story = {
  args: {
    items: TREE,
    title: "Pickle Talk",
    currentPath: "/pickle-talk/training/ready-position",
  },
};

/** Whole-sidebar collapse toggle (desktop icon rail). */
export const Collapsible: Story = {
  args: { items: TREE, title: "Pickle Talk", collapsible: true },
};

/** The collapsed icon rail. */
export const CollapsedRail: Story = {
  args: {
    items: TREE,
    title: "Pickle Talk",
    collapsible: true,
    collapsed: true,
  },
};
