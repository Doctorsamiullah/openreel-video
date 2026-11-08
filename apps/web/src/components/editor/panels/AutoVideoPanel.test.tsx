import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AutoVideoPanel } from "./AutoVideoPanel";
import { defaultOllamaScriptProvider } from "../../../services/providers/ollama-script-provider";
import { AutoVideoPipeline } from "../../../services/auto-video-pipeline";

vi.mock("../../../stores/notification-store", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AutoVideoPanel Component (Phase 5 UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders idea textarea and action buttons", () => {
    render(<AutoVideoPanel />);

    expect(screen.getByText(/Auto Video \(Idea ➔ Timeline\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/3 simple steps to start/i)).toBeInTheDocument();
    expect(screen.getByText("Generate Script")).toBeInTheDocument();
    expect(screen.getByTitle("Import OpenMontage Project")).toBeInTheDocument();
  });

  it("generates script and shows self-check report on submit", async () => {
    vi.spyOn(defaultOllamaScriptProvider, "generateVideoScript").mockResolvedValueOnce({
      title: "Meditation Habits",
      brief: "How to meditate",
      totalDurationSeconds: 15,
      targetAudience: "General",
      modelUsed: "mock-test",
      provider: "ollama-mock",
      scenes: [
        {
          id: "s1",
          order: 1,
          durationSeconds: 5,
          visualDescription: "Calm water ripples",
          stockSearchQuery: "calm water",
          narrationText: "Take a deep breath.",
          captionText: "Take a deep breath.",
        },
      ],
    });

    render(<AutoVideoPanel />);

    const textarea = screen.getByPlaceholderText(/3 simple steps to start/i);
    fireEvent.change(textarea, { target: { value: "How to meditate" } });

    const generateBtn = screen.getByText("Generate Script");
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText("Meditation Habits")).toBeInTheDocument();
      expect(screen.getByText("Pipeline Self-Check Report")).toBeInTheDocument();
      expect(screen.getByText(/Calm water ripples/i)).toBeInTheDocument();
      expect(screen.getByText("Assemble on Timeline")).toBeInTheDocument();
    });
  });

  it("assembles script onto timeline when clicking assemble button", async () => {
    vi.spyOn(defaultOllamaScriptProvider, "generateVideoScript").mockResolvedValueOnce({
      title: "Quick Tips",
      brief: "Tips brief",
      totalDurationSeconds: 10,
      targetAudience: "Youth",
      modelUsed: "mock-test",
      provider: "ollama-mock",
      scenes: [
        {
          id: "s1",
          order: 1,
          durationSeconds: 10,
          visualDescription: "Workspace desk",
          stockSearchQuery: "desk office",
          narrationText: "Organize your desk.",
          captionText: "Organize your desk.",
        },
      ],
    });

    const assembleSpy = vi.spyOn(AutoVideoPipeline, "assembleTimeline").mockResolvedValueOnce({
      success: true,
      scriptTitle: "Quick Tips",
      report: {
        totalScenes: 1,
        totalDurationSeconds: 10,
        audioVideoSyncOk: true,
        stockAttributionList: [],
        warnings: [],
        status: "passed",
        timestamp: Date.now(),
      },
    });

    render(<AutoVideoPanel />);

    const textarea = screen.getByPlaceholderText(/3 simple steps to start/i);
    fireEvent.change(textarea, { target: { value: "Productivity tips" } });

    fireEvent.click(screen.getByText("Generate Script"));

    await waitFor(() => {
      expect(screen.getByText("Assemble on Timeline")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Assemble on Timeline"));

    await waitFor(() => {
      expect(assembleSpy).toHaveBeenCalled();
    });
  });
});
