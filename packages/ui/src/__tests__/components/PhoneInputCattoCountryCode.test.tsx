// @ccatto/ui - PhoneInputCatto with showCountryCode Tests
import { describe, expect, it, vi } from "vitest";
import PhoneInputCatto from "../../components/Phone/PhoneInputCatto";
import { fireEvent, render, screen } from "../test-utils";

describe("PhoneInputCatto with showCountryCode", () => {
  const defaultProps = {
    label: "Phone number",
    showCountryCode: true,
    countryCode: "US",
    onCountryChange: vi.fn(),
  };

  describe("rendering", () => {
    it("renders country code selector alongside input", () => {
      render(<PhoneInputCatto {...defaultProps} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Select country code" })
      ).toBeInTheDocument();
    });

    it("shows the selected country dial code", () => {
      render(<PhoneInputCatto {...defaultProps} countryCode="GB" />);

      expect(screen.getByText("+44")).toBeInTheDocument();
    });

    it("applies rounded-l-none to input when country code shown", () => {
      render(<PhoneInputCatto {...defaultProps} />);

      const input = screen.getByRole("textbox");
      expect(input.className).toContain("rounded-l-none");
      expect(input.className).toContain("rounded-r-md");
    });

    it("applies rounded-md to input when country code not shown", () => {
      render(<PhoneInputCatto label="Phone" />);

      const input = screen.getByRole("textbox");
      expect(input.className).toContain("rounded-md");
      expect(input.className).not.toContain("rounded-l-none");
    });
  });

  describe("wrapper focus ring", () => {
    it("does not apply focus ring directly to input when showCountryCode", () => {
      render(<PhoneInputCatto {...defaultProps} />);

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);

      // ring-4 should NOT be on the input itself (it goes on the wrapper)
      expect(input.className).not.toContain("ring-4");
    });

    it("applies focus ring to wrapper div when input is focused", () => {
      const { container } = render(<PhoneInputCatto {...defaultProps} />);

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);

      // The wrapper is the flex div containing button + input
      const wrapper = container.querySelector(".flex.rounded-md");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.className).toContain("ring-4");
    });

    it("removes focus ring from wrapper on blur", () => {
      const { container } = render(<PhoneInputCatto {...defaultProps} />);

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);
      fireEvent.blur(input);

      const wrapper = container.querySelector(".flex.rounded-md");
      expect(wrapper?.className).not.toContain("ring-4");
    });

    it("applies focus ring directly to input when no country code", () => {
      render(<PhoneInputCatto label="Phone" />);

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);

      expect(input.className).toContain("ring-4");
    });
  });

  describe("country change", () => {
    it("calls onCountryChange when a country is selected", () => {
      const onCountryChange = vi.fn();
      render(
        <PhoneInputCatto {...defaultProps} onCountryChange={onCountryChange} />
      );

      // Open the country dropdown
      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      // Select Germany
      fireEvent.click(screen.getByRole("option", { name: /Germany/ }));

      expect(onCountryChange).toHaveBeenCalledWith(
        "DE",
        expect.objectContaining({ code: "DE", dialCode: "+49" })
      );
    });
  });

  describe("error state with country code", () => {
    it("shows error message below the combined input", () => {
      render(
        <PhoneInputCatto {...defaultProps} error="Invalid phone number" />
      );

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid phone number"
      );
    });

    it("applies error border to input", () => {
      render(
        <PhoneInputCatto {...defaultProps} error="Invalid phone number" />
      );

      const input = screen.getByRole("textbox");
      expect(input.className).toContain("border-red-500");
    });
  });

  describe("sizes with country code", () => {
    it("passes size to country code selector", () => {
      render(<PhoneInputCatto {...defaultProps} size="large" />);

      const trigger = screen.getByRole("button", {
        name: "Select country code",
      });
      expect(trigger.className).toContain("h-12");

      const input = screen.getByRole("textbox");
      expect(input.className).toContain("h-12");
    });
  });

  describe("disabled with country code", () => {
    it("disables both input and country selector", () => {
      render(<PhoneInputCatto {...defaultProps} disabled />);

      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Select country code" })
      ).toBeDisabled();
    });
  });

  describe("custom search placeholder", () => {
    it("passes countrySearchPlaceholder to selector", () => {
      render(
        <PhoneInputCatto
          {...defaultProps}
          countrySearchPlaceholder="Buscar..."
        />
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
    });
  });
});
