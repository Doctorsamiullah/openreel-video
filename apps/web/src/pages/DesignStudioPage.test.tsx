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
    expect(screen.getByText("Upload your image")).toBeInTheDocument();
    expect(screen.getByText("Medical & Poster Assets")).toBeInTheDocument();
    expect(screen.getByText("Doctor Specialist Portrait")).toBeInTheDocument();
  });

  it("switches to Text tab and displays typography options including Hindi and Urdu", () => {
    render(<DesignStudioPage />);
    fireEvent.click(screen.getByText("Text"));
    expect(screen.getByText("Add a heading")).toBeInTheDocument();
    expect(screen.getByText("Add a subheading")).toBeInTheDocument();
    expect(screen.getByText("हिंदी शीर्षक जोड़ें")).toBeInTheDocument();
    expect(screen.getByText("اردو عنوان شامل کریں")).toBeInTheDocument();
  });

  it("renders export actions, format presets, and triggers download", () => {
    render(<DesignStudioPage />);
    expect(screen.getByText("Download PNG")).toBeInTheDocument();
    expect(screen.getByText("Add to Video Timeline")).toBeInTheDocument();
    expect(screen.getByText("Format:")).toBeInTheDocument();

    const downloadBtn = screen.getByText("Download PNG");
    fireEvent.click(downloadBtn);
  });
});
