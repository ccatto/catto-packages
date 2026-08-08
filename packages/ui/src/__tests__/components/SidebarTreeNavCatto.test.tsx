// @ccatto/ui - SidebarTreeNavCatto Tests
import { describe, expect, it, vi } from "vitest";
import SidebarTreeNavCatto, {
  findNavTreePath,
  type NavTreeItem,
} from "../../components/SidebarTreeNav/SidebarTreeNavCatto";
import { fireEvent, render, screen } from "../test-utils";

const TREE: NavTreeItem[] = [
  {
    key: "docs",
    label: "Docs",
    children: [
      {
        key: "getting-started",
        label: "Getting started",
        children: [
          { key: "install", label: "Install", href: "/docs/install" },
          { key: "config", label: "Config", href: "/docs/config" },
        ],
      },
      {
        key: "guides",
        label: "Guides",
        children: [
          { key: "forehand", label: "Forehand", href: "/guides/forehand" },
        ],
      },
    ],
  },
  { key: "api", label: "API", href: "/api" },
];

describe("findNavTreePath", () => {
  it("returns the root→node key path by href", () => {
    expect(findNavTreePath(TREE, { currentPath: "/docs/config" })).toEqual([
      "docs",
      "getting-started",
      "config",
    ]);
  });
  it("returns the path by activeKey and [] when nothing matches", () => {
    expect(findNavTreePath(TREE, { activeKey: "guides" })).toEqual([
      "docs",
      "guides",
    ]);
    expect(findNavTreePath(TREE, { currentPath: "/nope" })).toEqual([]);
  });
});

describe("SidebarTreeNavCatto", () => {
  it("auto-expands the active path and marks the active leaf", () => {
    render(<SidebarTreeNavCatto items={TREE} currentPath="/docs/config" />);
    // Active path expanded → Install + Config visible.
    expect(screen.getByText("Install")).toBeInTheDocument();
    expect(screen.getByText("Config")).toBeInTheDocument();
    // Sibling branch "Guides" is collapsed → its child hidden.
    expect(screen.queryByText("Forehand")).not.toBeInTheDocument();
    // Active leaf carries aria-current + data-active.
    const active = screen.getByText("Config").closest('[role="treeitem"]')!;
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveAttribute("data-active", "true");
  });

  it("collapses/expands a branch via its toggle", () => {
    render(<SidebarTreeNavCatto items={TREE} />);
    // Nothing expanded by default → only top level shows.
    expect(screen.queryByText("Getting started")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Docs"));
    expect(screen.getByText("Getting started")).toBeInTheDocument();
    expect(screen.getByText("Guides")).toBeInTheDocument();
    // Branch treeitem exposes aria-expanded.
    const docs = screen.getByText("Docs").closest('[role="treeitem"]')!;
    expect(docs).toHaveAttribute("aria-expanded", "true");
  });

  it("supports keyboard tree navigation (ArrowDown / ArrowRight)", () => {
    render(<SidebarTreeNavCatto items={TREE} />);
    const tree = screen.getByRole("tree");
    // Focus starts on the first row (Docs).
    fireEvent.keyDown(tree, { key: "ArrowRight" }); // expand Docs
    expect(screen.getByText("Getting started")).toBeInTheDocument();
    fireEvent.keyDown(tree, { key: "ArrowDown" }); // move to Getting started
    const active = document.activeElement;
    expect(active?.textContent).toContain("Getting started");
  });

  it("renders an icon rail when controlled-collapsed", () => {
    render(
      <SidebarTreeNavCatto items={TREE} collapsible collapsed />,
    );
    // No full tree; an expand affordance instead.
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /expand sidebar/i }),
    ).toBeInTheDocument();
  });

  it("uses LinkComponent for links", () => {
    const LinkComponent = vi.fn(
      ({ href, className, children }: any) => (
        <a href={href} className={className} data-testid="custom-link">
          {children}
        </a>
      ),
    );
    render(
      <SidebarTreeNavCatto
        items={TREE}
        currentPath="/docs/config"
        LinkComponent={LinkComponent}
      />,
    );
    // The active leaf link is rendered via the custom component.
    const links = screen.getAllByTestId("custom-link");
    expect(links.length).toBeGreaterThan(0);
    expect(LinkComponent).toHaveBeenCalled();
  });
});
