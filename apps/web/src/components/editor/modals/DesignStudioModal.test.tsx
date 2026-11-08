import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DesignStudioModal } from "./DesignStudioModal";

const mockImportMedia = vi.fn().mockResolvedValue({ success: true });

vi.mock("../../../stores/project-store", () => ({
  useProjectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      importMedia: mockImportMedia,
    }),
}));

describe("DesignStudioModal (Canva Full Feature Design Studio)", () => {
  it("renders Design Studio header and Canva tool tabs", () => {
    render(<DesignStudioModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Templates")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Elements")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Add to Video Timeline")).toBeInTheDocument();
  });

  it("lists Canva templates and allows selecting a template", () => {
    render(<DesignStudioModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Mega Discount Sale (50% OFF)")).toBeInTheDocument();
    expect(screen.getByText("Doctor Consultation & Free Camp")).toBeInTheDocument();

    const clinicTmpl = screen.getByText("Doctor Consultation & Free Camp");
    fireEvent.click(clinicTmpl);

    expect(clinicTmpl).toBeInTheDocument();
  });

  it("switches to Text tab and provides multilingual options (Devanagari & Urdu)", () => {
    render(<DesignStudioModal isOpen={true} onClose={vi.fn()} />);

    const textTab = screen.getByText("Text");
    fireEvent.click(textTab);

    expect(screen.getByText("Add Heading")).toBeInTheDocument();
    expect(screen.getByText("Add Subheading")).toBeInTheDocument();
    expect(screen.getByText("+ हिंदी शीर्षक (Devanagari)")).toBeInTheDocument();
    expect(screen.getByText("+ اردو عنوان شامل کریں (RTL)")).toBeInTheDocument();
  });

  it("switches to Elements tab and provides vector shape additions", () => {
    render(<DesignStudioModal isOpen={true} onClose={vi.fn()} />);

    const elementsTab = screen.getByText("Elements");
    fireEvent.click(elementsTab);

    expect(screen.getByText("Card / Box")).toBeInTheDocument();
    expect(screen.getByText("Circle")).toBeInTheDocument();
    expect(screen.getByText("Pill Badge")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<DesignStudioModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
