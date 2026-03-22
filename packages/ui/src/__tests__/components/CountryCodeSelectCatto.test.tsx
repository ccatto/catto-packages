// @ccatto/ui - CountryCodeSelectCatto Tests
import { describe, expect, it, vi } from "vitest";
import { COUNTRIES } from "../../components/Phone/countries";
import CountryCodeSelectCatto from "../../components/Phone/CountryCodeSelectCatto";
import { fireEvent, render, screen, within } from "../test-utils";

describe("CountryCodeSelectCatto", () => {
  const defaultProps = {
    value: "US",
    onChange: vi.fn(),
  };

  describe("rendering", () => {
    it("renders trigger button with flag and dial code", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Select country code" })
      ).toBeInTheDocument();
      expect(screen.getByText("+1")).toBeInTheDocument();
    });

    it("displays selected country flag and dial code", () => {
      render(<CountryCodeSelectCatto {...defaultProps} value="GB" />);

      expect(screen.getByText("+44")).toBeInTheDocument();
    });

    it("sets aria-expanded to false when closed", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Select country code" })
      ).toHaveAttribute("aria-expanded", "false");
    });

    it("sets aria-haspopup to listbox", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Select country code" })
      ).toHaveAttribute("aria-haspopup", "listbox");
    });
  });

  describe("opening and closing", () => {
    it("opens dropdown on click", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("sets aria-expanded to true when open", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      expect(
        screen.getByRole("button", { name: "Select country code" })
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("renders dropdown in a portal (document.body)", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      // The listbox should be in the document (via portal to body)
      const listbox = screen.getByRole("listbox");
      expect(document.body.contains(listbox)).toBe(true);
    });

    it("closes dropdown on Escape key", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(
        screen.getByRole("button", { name: "Select country code" }),
        { key: "Escape" }
      );
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("closes dropdown on outside click", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("does not open when disabled", () => {
      render(<CountryCodeSelectCatto {...defaultProps} disabled />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("toggles closed on second click", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      const trigger = screen.getByRole("button", {
        name: "Select country code",
      });

      fireEvent.click(trigger);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.click(trigger);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("country list", () => {
    it("renders all countries as options", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      const options = screen.getAllByRole("option");
      expect(options.length).toBe(COUNTRIES.length);
    });

    it("marks the selected country with aria-selected", () => {
      render(<CountryCodeSelectCatto {...defaultProps} value="FR" />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      const listbox = screen.getByRole("listbox");
      const franceOption = within(listbox).getByRole("option", {
        name: /France/,
      });
      expect(franceOption).toHaveAttribute("aria-selected", "true");

      const usOption = within(listbox).getByRole("option", {
        name: /United States/,
      });
      expect(usOption).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("selection", () => {
    it("calls onChange with country code and data on selection", () => {
      const onChange = vi.fn();
      render(<CountryCodeSelectCatto {...defaultProps} onChange={onChange} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      const listbox = screen.getByRole("listbox");
      fireEvent.click(within(listbox).getByRole("option", { name: /Germany/ }));

      expect(onChange).toHaveBeenCalledWith(
        "DE",
        expect.objectContaining({
          code: "DE",
          dialCode: "+49",
          name: "Germany",
        })
      );
    });

    it("closes dropdown after selection", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      const listbox = screen.getByRole("listbox");
      fireEvent.click(within(listbox).getByRole("option", { name: /Canada/ }));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("search filtering", () => {
    it("renders search input in dropdown", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      expect(
        screen.getByPlaceholderText("Search countries...")
      ).toBeInTheDocument();
    });

    it("uses custom search placeholder", () => {
      render(
        <CountryCodeSelectCatto
          {...defaultProps}
          searchPlaceholder="Buscar paises..."
        />
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      expect(
        screen.getByPlaceholderText("Buscar paises...")
      ).toBeInTheDocument();
    });

    it("filters countries by name", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      const searchInput = screen.getByPlaceholderText("Search countries...");
      fireEvent.change(searchInput, { target: { value: "Ger" } });

      const options = screen.getAllByRole("option");
      expect(options.length).toBe(1);
      expect(options[0]).toHaveTextContent("Germany");
    });

    it("filters countries by dial code", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      const searchInput = screen.getByPlaceholderText("Search countries...");
      fireEvent.change(searchInput, { target: { value: "+44" } });

      const options = screen.getAllByRole("option");
      expect(options.length).toBe(1);
      expect(options[0]).toHaveTextContent("United Kingdom");
    });

    it("filters countries by ISO code", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      const searchInput = screen.getByPlaceholderText("Search countries...");
      fireEvent.change(searchInput, { target: { value: "JP" } });

      const options = screen.getAllByRole("option");
      expect(options.length).toBe(1);
      expect(options[0]).toHaveTextContent("Japan");
    });

    it("shows no results message when nothing matches", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Select country code" })
      );

      const searchInput = screen.getByPlaceholderText("Search countries...");
      fireEvent.change(searchInput, { target: { value: "zzzzz" } });

      expect(screen.queryAllByRole("option").length).toBe(0);
      expect(screen.getByText("No countries found")).toBeInTheDocument();
    });

    it("clears search when dropdown closes", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      const trigger = screen.getByRole("button", {
        name: "Select country code",
      });

      fireEvent.click(trigger);
      const searchInput = screen.getByPlaceholderText("Search countries...");
      fireEvent.change(searchInput, { target: { value: "France" } });

      // Close by toggling
      fireEvent.click(trigger);

      // Reopen — search should be cleared, all countries visible
      fireEvent.click(trigger);
      expect(screen.getAllByRole("option").length).toBe(COUNTRIES.length);
    });
  });

  describe("sizes", () => {
    it("applies small size to trigger", () => {
      render(<CountryCodeSelectCatto {...defaultProps} size="small" />);

      const trigger = screen.getByRole("button", {
        name: "Select country code",
      });
      expect(trigger.className).toContain("h-8");
      expect(trigger.className).toContain("text-sm");
    });

    it("applies medium size by default", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      const trigger = screen.getByRole("button", {
        name: "Select country code",
      });
      expect(trigger.className).toContain("h-10");
      expect(trigger.className).toContain("text-base");
    });

    it("applies large size to trigger", () => {
      render(<CountryCodeSelectCatto {...defaultProps} size="large" />);

      const trigger = screen.getByRole("button", {
        name: "Select country code",
      });
      expect(trigger.className).toContain("h-12");
      expect(trigger.className).toContain("text-lg");
    });
  });

  describe("disabled state", () => {
    it("sets disabled on trigger button", () => {
      render(<CountryCodeSelectCatto {...defaultProps} disabled />);

      expect(
        screen.getByRole("button", { name: "Select country code" })
      ).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(<CountryCodeSelectCatto {...defaultProps} disabled />);

      const trigger = screen.getByRole("button", {
        name: "Select country code",
      });
      expect(trigger.className).toContain("cursor-not-allowed");
      expect(trigger.className).toContain("opacity-50");
    });
  });

  describe("accessibility", () => {
    it("uses custom aria-label", () => {
      render(
        <CountryCodeSelectCatto
          {...defaultProps}
          ariaLabel="Choose your country"
        />
      );

      expect(
        screen.getByRole("button", { name: "Choose your country" })
      ).toBeInTheDocument();
    });

    it("opens on Enter key when closed", () => {
      render(<CountryCodeSelectCatto {...defaultProps} />);

      const trigger = screen.getByRole("button", {
        name: "Select country code",
      });

      // Simulate keydown on the container (which has the keyDown handler)
      fireEvent.keyDown(trigger, { key: "Enter" });

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });
});
