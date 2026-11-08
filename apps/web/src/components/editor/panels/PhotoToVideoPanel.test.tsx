import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhotoToVideoPanel } from "./PhotoToVideoPanel";

vi.mock("../../../stores/notification-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../stores/project-store", () => ({
  useProjectStore: Object.assign(
    (selector: (state: any) => any) =>
      selector({
        project: {
          timeline: {
            tracks: [{ id: "track_video_1", type: "video", clips: [] }],
          },
        },
        importMedia: vi.fn(),
        addClip: vi.fn(),
        addClipToNewTrack: vi.fn(),
        updateClipKeyframes: vi.fn(),
      }),
    {
      getState: () => ({
        project: {
          timeline: {
            tracks: [{ id: "track_video_1", type: "video", clips: [] }],
          },
        },
      }),
    },
  ),
}));

vi.mock("../../../stores/timeline-store", () => ({
  useTimelineStore: (selector: (state: any) => any) =>
    selector({
      playheadPosition: 0,
      setPlayheadPosition: vi.fn(),
    }),
}));

describe("PhotoToVideoPanel", () => {
  it("renders starter templates and motion controls", () => {
    render(<PhotoToVideoPanel />);

    // Check header
    expect(screen.getByText(/Photo ➔ Video/)).toBeInTheDocument();

    // Check 4 1-click templates
    expect(screen.getByText(/Memories Album/)).toBeInTheDocument();
    expect(screen.getByText(/Product Showcase/)).toBeInTheDocument();
    expect(screen.getByText(/Festive Greeting/)).toBeInTheDocument();
    expect(screen.getByText(/Before & After/)).toBeInTheDocument();

    // Check motion presets
    expect(screen.getByText("Zoom In")).toBeInTheDocument();
    expect(screen.getByText("Zoom Out")).toBeInTheDocument();
    expect(screen.getByText("Pan Left")).toBeInTheDocument();
    expect(screen.getByText("Pan Right")).toBeInTheDocument();
    expect(screen.getByText("Random Motion")).toBeInTheDocument();

    // Check aspect fit styles
    expect(screen.getByText("Blurred Margin")).toBeInTheDocument();
    expect(screen.getByText("Fill / Crop")).toBeInTheDocument();
    expect(screen.getByText("Letterbox")).toBeInTheDocument();

    // Build button is disabled when empty
    const buildBtn = screen.getByRole("button", { name: /Build Slideshow/i });
    expect(buildBtn).toBeDisabled();
  });

  it("updates motion preset on click", () => {
    render(<PhotoToVideoPanel />);

    const panLeftBtn = screen.getByText("Pan Left");
    fireEvent.click(panLeftBtn);
    expect(panLeftBtn.className).toContain("text-primary");
  });
});
