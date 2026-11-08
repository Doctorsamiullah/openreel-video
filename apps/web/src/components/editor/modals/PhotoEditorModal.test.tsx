import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhotoEditorModal } from "./PhotoEditorModal";

const mockImportMedia = vi.fn().mockResolvedValue({ success: true });

vi.mock("../../../stores/project-store", () => ({
  useProjectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      importMedia: mockImportMedia,
    }),
}));

describe("PhotoEditorModal", () => {
  it("renders Photo Editor title and tabs when open", () => {
    render(<PhotoEditorModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Photo Editor/i)).toBeInTheDocument();
    expect(screen.getByText("Adjust")).toBeInTheDocument();
    expect(screen.getByText("Transform")).toBeInTheDocument();
    expect(screen.getByText("Presets")).toBeInTheDocument();
  });

  it("switches to Transform tab and shows rotation controls", () => {
    render(<PhotoEditorModal isOpen={true} onClose={vi.fn()} />);

    const transformTab = screen.getByText("Transform");
    fireEvent.click(transformTab);

    expect(screen.getByText("Rotate -90°")).toBeInTheDocument();
    expect(screen.getByText("Rotate +90°")).toBeInTheDocument();
    expect(screen.getByText("Flip Horiz")).toBeInTheDocument();
    expect(screen.getByText("Flip Vert")).toBeInTheDocument();
  });

  it("switches to Presets tab and displays filter options", () => {
    render(<PhotoEditorModal isOpen={true} onClose={vi.fn()} />);

    const presetsTab = screen.getByText("Presets");
    fireEvent.click(presetsTab);

    expect(screen.getByText("Vivid Pop")).toBeInTheDocument();
    expect(screen.getByText("Warm Gold")).toBeInTheDocument();
    expect(screen.getByText("Dramatic B&W")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<PhotoEditorModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
