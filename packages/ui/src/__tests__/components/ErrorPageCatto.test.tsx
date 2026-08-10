// @ccatto/ui - ErrorPageCatto Tests
import { describe, expect, it } from "vitest";
import ErrorPageCatto from "../../components/ErrorPage/ErrorPageCatto";
import { render, screen } from "../test-utils";

describe("ErrorPageCatto", () => {
  it("renders title, code badge, and the primary action", () => {
    render(
      <ErrorPageCatto
        iconType="notFound"
        errorCode="404"
        title="Page not found"
        description="It may have moved."
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("It may have moved.")).toBeInTheDocument();
    // Default primary action.
    const home = screen.getByRole("link", { name: /go home/i });
    expect(home).toHaveAttribute("href", "/");
  });

  it("renders a secondary action only when both label and href are given", () => {
    const { rerender } = render(
      <ErrorPageCatto title="Nope" actionLabel="Home" actionHref="/" />,
    );
    expect(
      screen.queryByRole("link", { name: /browse/i }),
    ).not.toBeInTheDocument();

    rerender(
      <ErrorPageCatto
        title="Nope"
        actionLabel="Home"
        actionHref="/"
        secondaryActionLabel="Browse paddles"
        secondaryActionHref="/paddles"
      />,
    );
    expect(
      screen.getByRole("link", { name: /browse paddles/i }),
    ).toHaveAttribute("href", "/paddles");
  });

  it("hides optional subtitle/description/code when omitted", () => {
    render(<ErrorPageCatto title="Just a title" />);
    expect(screen.getByRole("heading", { name: "Just a title" })).toBeInTheDocument();
    // No error code paragraph rendered.
    expect(screen.queryByText("404")).not.toBeInTheDocument();
  });
});
