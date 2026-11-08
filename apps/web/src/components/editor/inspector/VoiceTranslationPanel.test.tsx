import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VoiceTranslationPanel } from "./VoiceTranslationPanel";

const mockAddSubtitle = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastWarning = vi.fn();

vi.mock("../../../stores/notification-store", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
    warning: (...args: unknown[]) => mockToastWarning(...args),
  },
}));

vi.mock("../../../stores/ui-store", () => ({
  useUIStore: () => [{ type: "clip", id: "clip-1" }],
}));

vi.mock("../../../stores/project-store", () => ({
  useProjectStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        getClip: vi.fn(() => ({ id: "clip-1", mediaId: "media-1", startTime: 0, duration: 10 })),
        getMediaItem: vi.fn(() => ({ id: "media-1", name: "Speaker Video.mp4" })),
        addSubtitle: mockAddSubtitle,
      }),
    {
      getState: () => ({
        addSubtitle: mockAddSubtitle,
      }),
    },
  ),
}));

vi.mock("../../../stores/ai-connection-store", () => ({
  useAIConnectionStore: () => ({
    provider: "ollama",
    model: "llama3.2",
    baseUrl: "http://127.0.0.1:11434",
    apiKey: "",
  }),
}));

describe("VoiceTranslationPanel (Phase 7: Dubbing & Multilingual Translation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders source and target language dropdowns with English, Hindi, and Urdu", () => {
    render(<VoiceTranslationPanel clipId="clip-1" />);

    expect(screen.getByText(/Transcribe, translate, and re-dub/i)).toBeInTheDocument();
    expect(screen.getAllByText("English").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Hindi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Urdu").length).toBeGreaterThanOrEqual(1);
  });

  it("warns if source and target languages are identical", async () => {
    render(<VoiceTranslationPanel clipId="clip-1" />);

    // Change target language to English (matching source)
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "en" } });

    const translateBtn = screen.getByText("Translate Voice");
    fireEvent.click(translateBtn);

    expect(mockToastError).toHaveBeenCalledWith("Source and target language must be different.");
  });

  it("enforces consent confirmation when Voicebox or VoiceStudio is selected", async () => {
    render(<VoiceTranslationPanel clipId="clip-1" />);

    const selects = screen.getAllByRole("combobox");
    // Select Voicebox engine (3rd dropdown)
    fireEvent.change(selects[2], { target: { value: "voicebox" } });

    expect(screen.getByText(/permission\/consent from the original speaker/i)).toBeInTheDocument();

    const translateBtn = screen.getByText("Translate Voice");
    expect(translateBtn).toBeDisabled();

    // Check consent box
    const consentBox = screen.getByRole("checkbox");
    fireEvent.click(consentBox);

    expect(translateBtn).not.toBeDisabled();
  });

  it("completes translation and allows syncing dubbed subtitles to timeline", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "नमस्ते दुनिया" } }],
      }),
    } as Response);

    // Mock speechSynthesis.speak
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
          setTimeout(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent), 10);
        }),
      },
      writable: true,
    });

    render(<VoiceTranslationPanel clipId="clip-1" />);

    const translateBtn = screen.getByText("Translate Voice");
    fireEvent.click(translateBtn);

    await waitFor(
      () => {
        expect(screen.getByText("Add Dubbed Track to Timeline")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Sync to timeline
    fireEvent.click(screen.getByText("Add Dubbed Track to Timeline"));

    expect(mockAddSubtitle).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: 0,
        endTime: 10,
        style: expect.objectContaining({
          fontFamily: expect.stringContaining("Noto Sans Devanagari"),
        }),
      }),
    );
  });
});
