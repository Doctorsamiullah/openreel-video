import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GenerativeVideoPanel } from "./GenerativeVideoPanel";
import { defaultComfyUIProvider } from "../../../services/providers/comfyui-provider";

const mockImportMedia = vi.fn().mockResolvedValue({ success: true, mediaId: "media_123" });
const mockAddClipToNewTrack = vi.fn().mockResolvedValue({ success: true });
const mockSetPlayheadPosition = vi.fn();

vi.mock("../../../stores/notification-store", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../stores/project-store", () => ({
  useProjectStore: {
    getState: vi.fn(() => ({
      importMedia: mockImportMedia,
      addClipToNewTrack: mockAddClipToNewTrack,
    })),
  },
}));

vi.mock("../../../stores/timeline-store", () => ({
  useTimelineStore: {
    getState: vi.fn(() => ({
      playheadPosition: 0,
      setPlayheadPosition: mockSetPlayheadPosition,
    })),
  },
}));

describe("GenerativeVideoPanel Component (Phase 6 UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header with hardware tier badge and model options", () => {
    render(<GenerativeVideoPanel />);

    expect(screen.getByText("AI Video Generation")).toBeInTheDocument();
    expect(screen.getByText(/Tier T1 GPU/i)).toBeInTheDocument();
    expect(screen.getByText("Wan 2.2")).toBeInTheDocument();
    expect(screen.getByText("LTX-2")).toBeInTheDocument();
    expect(screen.getByText("Ovi")).toBeInTheDocument();
  });

  it("disables Ovi with hardware tier warning on T1 machines", () => {
    render(<GenerativeVideoPanel />);
    const oviButton = screen.getByText("Ovi").closest("button");
    expect(oviButton).toBeDisabled();
  });

  it("enforces consent checkbox in image-to-video mode", () => {
    render(<GenerativeVideoPanel />);

    // Switch to image-to-video
    const i2vTab = screen.getByText(/Animate Photo \(I2V\)/i);
    fireEvent.click(i2vTab);

    expect(screen.getByText(/I confirm I have explicit permission\/consent/i)).toBeInTheDocument();
    const generateBtn = screen.getByText("Generate 4-Second Clip");
    expect(generateBtn).toBeDisabled();

    // Fill prompt and check consent
    const promptInput = screen.getByPlaceholderText(/Gentle ocean waves/i);
    fireEvent.change(promptInput, { target: { value: "Ocean sunrise" } });

    const consentCheckbox = screen.getByRole("checkbox", {
      name: /I confirm I have explicit permission/i,
    });
    fireEvent.click(consentCheckbox);

    expect(generateBtn).not.toBeDisabled();
  });

  it("generates a video clip and adds to timeline", async () => {
    vi.spyOn(defaultComfyUIProvider, "generateClip").mockResolvedValueOnce({
      jobId: "test_job_123",
      videoUrl: "blob:test-clip",
      modelUsed: "wan2.2",
      provider: "comfyui-mock",
      durationSeconds: 4,
      dimensions: { width: 1280, height: 720 },
    });

    render(<GenerativeVideoPanel />);

    const promptInput = screen.getByPlaceholderText(/Redwood forest/i);
    fireEvent.change(promptInput, { target: { value: "Misty pine trees" } });

    const generateBtn = screen.getByText("Generate 4-Second Clip");
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText("Generated Candidate")).toBeInTheDocument();
      expect(screen.getByText("Add to Timeline")).toBeInTheDocument();
    });

    // Add to timeline
    fireEvent.click(screen.getByText("Add to Timeline"));

    await waitFor(() => {
      expect(mockImportMedia).toHaveBeenCalled();
      expect(mockAddClipToNewTrack).toHaveBeenCalledWith("media_123", 0);
    });
  });
});
