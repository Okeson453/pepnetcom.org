import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders as a button by default", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders its child element directly when asChild is set, instead of wrapping it in a <button>", () => {
    // Regression test: this previously crashed at render time because the
    // component referenced the non-existent React.Slot instead of the
    // imported Radix Slot primitive.
    render(
      <Button asChild>
        <a href="/somewhere">Go</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
  });
});
