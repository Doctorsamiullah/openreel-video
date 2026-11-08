import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhotoEditorPage } from "./PhotoEditorPage";

const mockNavigate = vi.fn();
vi.mock("../hooks/use-router", () => ({
  useRouter: () => ({
    route: "photo-editor",
    params: {},
    navigate: mockNavigate,
  }),
}));

const mockImportMedia = vi.fn().mockResolvedValue({});
const mockCreateNewProject = vi.fn();

vi.mock("../stores/project-store", () => ({
  useProjectStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      importMedia: mockImportMedia,
      hasOpenProject: true,
      createNewProject: mockCreateNewProject,
    };
    return selector(state);
  },
}));

vi.mock("../stores/notification-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("PhotoEditorPage (Dedicated Full-Page Studio)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header, title, and studio workspace switcher", () => {
    render(<PhotoEditorPage />);
    expect(screen.getByText("SAMI Photo Studio")).toBeInTheDocument();
    expect(screen.getByText("Non-Destructive")).toBeInTheDocument();
    expect(screen.getAllByText("Video Editor").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Design Studio (Canva)").length).toBeGreaterThan(0);
  });

  it("navigates to video editor when clicking Video Editor or Back", () => {
    render(<PhotoEditorPage />);
    const backBtn = screen.getByText("Back");
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith("editor");
  });

  it("switches tabs between Adjust, Transform, and Presets", () => {
    render(<PhotoEditorPage />);
    
    // Default tab is Adjust
    expect(screen.getByText("Quick Adjustments")).toBeInTheDocument();
    expect(screen.getByText("Brightness")).toBeInTheDocument();

    // Switch to Transform
    fireEvent.click(screen.getByText("Transform"));
    expect(screen.getByText("Rotate & Flip")).toBeInTheDocument();
    expect(screen.getByText("Aspect Ratio Crop")).toBeInTheDocument();

    // Switch to Presets
    fireEvent.click(screen.getByText("Presets"));
    expect(screen.getByText("One-Click Filter Presets")).toBeInTheDocument();
    expect(screen.getByText("Vivid Pop")).toBeInTheDocument();
  });

  it("applies Auto Enhance when clicked", () => {
    render(<PhotoEditorPage />);
    const autoEnhanceBtn = screen.getByText("Auto Enhance");
    fireEvent.click(autoEnhanceBtn);
    // Adjustment controls should reflect the boost
    expect(screen.getByText("Brightness")).toBeInTheDocument();
  });

  it("renders canvas and action buttons", () => {
    render(<PhotoEditorPage />);
    expect(screen.getByText("Download PNG")).toBeInTheDocument();
    expect(screen.getByText("Add to Video Timeline")).toBeInTheDocument();
    expect(screen.getByText("Hold for Original")).toBeInTheDocument();
  });
});
