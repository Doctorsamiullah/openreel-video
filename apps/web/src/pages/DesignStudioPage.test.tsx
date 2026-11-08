import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DesignStudioPage } from "./DesignStudioPage";

const mockNavigate = vi.fn();
vi.mock("../hooks/use-router", () => ({
  useRouter: () => ({
    route: "design-studio",
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

describe("DesignStudioPage (Hybrid Canva + Photoshop Platform)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,mockedPngData");
  });

  it("renders hybrid platform title, medical poster template, and studio switcher", () => {
    render(<DesignStudioPage />);
    expect(screen.getByText("Canva + Photoshop Hybrid")).toBeInTheDocument();
    expect(screen.getAllByText("Video Editor").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Photo Editor").length).toBeGreaterThan(0);
  });

  it("navigates to video editor or photo editor when clicked", () => {
    render(<DesignStudioPage />);
    const videoBtn = screen.getByText("Video Editor");
    fireEvent.click(videoBtn);
    expect(mockNavigate).toHaveBeenCalledWith("editor");

    const photoBtn = screen.getByText("Photo Editor");
    fireEvent.click(photoBtn);
    expect(mockNavigate).toHaveBeenCalledWith("photo-editor");
  });

  it("renders all Canva tool rail tabs: Templates, Uploads, Text, Elements, Brand, Layers", () => {
    render(<DesignStudioPage />);
    expect(screen.getByText("Templates")).toBeInTheDocument();
    expect(screen.getByText("Uploads")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Elements")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Layers")).toBeInTheDocument();
  });

  it("switches to Uploads tab and renders drag-and-drop zone and medical assets", () => {
    render(<DesignStudioPage />);
    fireEvent.click(screen.getByText("Uploads"));
    expect(screen.getByText("Magic Layers Deconstruction")).toBeInTheDocument();
    expect(screen.getByText("Upload Poster to Deconstruct")).toBeInTheDocument();
    expect(screen.getByText("Upload photo or asset")).toBeInTheDocument();
    expect(screen.getByText("Medical & Poster Assets")).toBeInTheDocument();
    expect(screen.getByText("Doctor Specialist Portrait")).toBeInTheDocument();
  });

  it("switches to Text tab and displays typography options including Hindi and Urdu", () => {
    render(<DesignStudioPage />);
    fireEvent.click(screen.getByText("Text"));
    expect(screen.getByText("Add a Heading")).toBeInTheDocument();
    expect(screen.getByText("Add a Sub-heading")).toBeInTheDocument();
    expect(screen.getByText("हिंदी शीर्षक शामिल करें")).toBeInTheDocument();
    expect(screen.getByText("اردو عنوان شامل کریں")).toBeInTheDocument();
  });

  it("renders export actions, format presets, and triggers export modal", () => {
    render(<DesignStudioPage />);
    expect(screen.getByText("Export...")).toBeInTheDocument();
    expect(screen.getByText("Add to Video Timeline")).toBeInTheDocument();
    expect(screen.getByText("Format:")).toBeInTheDocument();

    const exportBtn = screen.getByText("Export...");
    fireEvent.click(exportBtn);

    // Modal opens with PNG, JPG, PDF options
    expect(screen.getByText(/Export & Download Design/i)).toBeInTheDocument();
    expect(screen.getByText("PNG")).toBeInTheDocument();
    expect(screen.getByText("JPG")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("renders Auto Layout and Fit All Content buttons", () => {
    render(<DesignStudioPage />);
    const autoLayoutBtns = screen.getAllByText("Auto Layout");
    expect(autoLayoutBtns.length).toBeGreaterThan(0);
    const fitAllBtns = screen.getAllByText(/Fit (All Content|Content)/i);
    expect(fitAllBtns.length).toBeGreaterThan(0);
  });
});
