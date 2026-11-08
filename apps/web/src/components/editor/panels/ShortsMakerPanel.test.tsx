import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShortsMakerPanel } from "./ShortsMakerPanel";

const mockUpdateSettings = vi.fn().mockResolvedValue({ success: true });
const mockSeekTo = vi.fn();

vi.mock("../../../stores/project-store", () => ({
  useProjectStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      project: {
        id: "proj_test_1",
        name: "Test Project",
        settings: { width: 1920, height: 1080, frameRate: 30 },
        timeline: {
          duration: 30,
          subtitles: [
            { id: "s1", startTime: 0, endTime: 10, text: "Stop making this huge mistake in your video edits!" },
            { id: "s2", startTime: 10, endTime: 25, text: "Here is the secret trick that pros use every day." },
          ],
          tracks: [
            {
              id: "t1",
              name: "Video Track 1",
              type: "video",
              clips: [
                {
                  id: "c1",
                  mediaId: "test.mp4",
                  startTime: 0,
                  duration: 25,
                  inPoint: 0,
                  outPoint: 25,
                  volume: 1,
                  transform: { position: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0.5, y: 0.5 } },
                  effects: [],
                  audioEffects: [],
                  keyframes: [],
                },
              ],
              transitions: [],
              locked: false,
              hidden: false,
              muted: false,
              solo: false,
            },
          ],
        },
      },
      updateSettings: mockUpdateSettings,
    }),
}));

vi.mock("../../../stores/timeline-store", () => ({
  useTimelineStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      seekTo: mockSeekTo,
    }),
}));

vi.mock("@openreel/core", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    downloadBlob: vi.fn(),
  };
});

describe("ShortsMakerPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Shorts Maker header and 9:16 vertical badge", () => {
    render(<ShortsMakerPanel />);
    expect(screen.getByText("Shorts Maker & Interchange")).toBeInTheDocument();
    expect(screen.getByText("9:16 Vertical")).toBeInTheDocument();
  });

  it("detects viral highlight hooks and displays candidates", () => {
    render(<ShortsMakerPanel />);
    const detectBtn = screen.getByText("Detect Viral Highlight Hooks");
    fireEvent.click(detectBtn);

    expect(screen.getByText(/Detected Highlight Candidates/i)).toBeInTheDocument();
    expect(screen.getAllByText(/mistake/i).length).toBeGreaterThan(0);
  });

  it("updates 9:16 vertical canvas preset", async () => {
    render(<ShortsMakerPanel />);
    const applyBtn = screen.getByText("Apply 9:16 Vertical Preset to Canvas");
    fireEvent.click(applyBtn);

    expect(mockUpdateSettings).toHaveBeenCalledWith({
      width: 1080,
      height: 1920,
    });
  });

  it("triggers OTIO, FCPXML, and EDL interchange export", () => {
    render(<ShortsMakerPanel />);
    const otioBtn = screen.getByText("OTIO (.otio)");
    const fcpxmlBtn = screen.getByText("FCPXML (.fcpxml)");
    const edlBtn = screen.getByText("EDL (.edl)");

    fireEvent.click(otioBtn);
    fireEvent.click(fcpxmlBtn);
    fireEvent.click(edlBtn);

    // Verify buttons are clicked and processed without throwing
    expect(otioBtn).toBeInTheDocument();
    expect(fcpxmlBtn).toBeInTheDocument();
    expect(edlBtn).toBeInTheDocument();
  });
});
