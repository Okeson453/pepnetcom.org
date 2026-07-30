import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";

describe("FormField", () => {
  it("associates the label with its input via a matching id/htmlFor", () => {
    render(
      <FormField label="Email address">
        <Input type="email" />
      </FormField>
    );
    // getByLabelText only succeeds if the <label htmlFor> and <input id> match.
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("wires the error message to the input via aria-describedby", () => {
    render(
      <FormField label="Email address" error="Enter a valid email">
        <Input type="email" />
      </FormField>
    );
    const input = screen.getByLabelText("Email address");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent("Enter a valid email");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
