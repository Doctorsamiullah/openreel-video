import { describe, expect, it } from "vitest";
import type { Timeline } from "../types/timeline";
import { timelineToOtio, serializeTimelineOtio } from "./otio-timeline";
import { timelineToFcpxml } from "./fcpxml";
import { timelineToEdl } from "./edl";

describe("Project Interchange Exporters (OTIO, FCPXML, EDL)", () => {
  const sampleTimeline: Timeline = {
    duration: 10,
    subtitles: [],
    markers: [
      { id: "m1", time: 2.5, label: "Hook Drop", color: "GREEN" },
    ],
    tracks: [
      {
        id: "video_track_1",
        name: "Main Video Track",
        type: "video",
        locked: false,
        hidden: false,
        muted: false,
        solo: false,
        transitions: [],
        clips: [
          {
            id: "clip_intro",
            mediaId: "C:/footage/sample_intro.mp4",
            trackId: "video_track_1",
            startTime: 0,
            duration: 4.5,
            inPoint: 1.0,
            outPoint: 5.5,
            volume: 1,
            effects: [],
            audioEffects: [],
            keyframes: [],
            transform: { position: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0.5, y: 0.5 } },
          },
          {
            id: "clip_outro",
            mediaId: "C:/footage/sample_outro.mp4",
            trackId: "video_track_1",
            startTime: 5.0,
            duration: 5.0,
            inPoint: 0,
            outPoint: 5.0,
            volume: 1,
            effects: [],
            audioEffects: [],
            keyframes: [],
            transform: { position: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0.5, y: 0.5 } },
          },
        ],
      },
      {
        id: "audio_track_1",
        name: "Dialogue",
        type: "audio",
        role: "dialogue",
        locked: false,
        hidden: false,
        muted: false,
        solo: false,
        transitions: [],
        clips: [
          {
            id: "audio_voice",
            mediaId: "C:/audio/voiceover.wav",
            trackId: "audio_track_1",
            startTime: 0,
            duration: 9.5,
            inPoint: 0,
            outPoint: 9.5,
            volume: 0.85,
            effects: [],
            audioEffects: [],
            keyframes: [],
            transform: { position: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0.5, y: 0.5 } },
          },
        ],
      },
    ],
  };

  describe("OpenTimelineIO (OTIO)", () => {
    it("generates valid OpenTimelineIO 1.0 schema with tracks and clips", () => {
      const otio = timelineToOtio(sampleTimeline, { name: "Test OTIO Export", fps: 30 });
      expect(otio.OTIO_SCHEMA).toBe("Timeline.1");
      expect(otio.name).toBe("Test OTIO Export");
      expect(otio.tracks).toBeDefined();

      const tracks = (otio.tracks as { children: Array<{ OTIO_SCHEMA: string; name: string; kind: string; children: any[] }> }).children;
      expect(tracks).toHaveLength(2);

      const videoTrack = tracks[0];
      expect(videoTrack.kind).toBe("Video");
      // Clip 1 (0 to 4.5s), Gap (4.5 to 5.0s), Clip 2 (5.0 to 10.0s)
      expect(videoTrack.children).toHaveLength(3);
      expect(videoTrack.children[0].OTIO_SCHEMA).toBe("Clip.2");
      expect(videoTrack.children[0].name).toBe("clip_intro");
      expect(videoTrack.children[1].OTIO_SCHEMA).toBe("Gap.1");
      expect(videoTrack.children[2].OTIO_SCHEMA).toBe("Clip.2");
      expect(videoTrack.children[2].name).toBe("clip_outro");

      const audioTrack = tracks[1];
      expect(audioTrack.kind).toBe("Audio");
      expect(audioTrack.children[0].OTIO_SCHEMA).toBe("Clip.2");
      expect(audioTrack.children[0].name).toBe("audio_voice");

      // Verify markers
      const markers = otio.markers as any[];
      expect(markers).toHaveLength(1);
      expect(markers[0].name).toBe("Hook Drop");
      expect(markers[0].color).toBe("GREEN");
    });

    it("serializes OTIO to valid JSON string", () => {
      const json = serializeTimelineOtio(sampleTimeline);
      const parsed = JSON.parse(json);
      expect(parsed.OTIO_SCHEMA).toBe("Timeline.1");
    });
  });

  describe("Final Cut Pro XML (FCPXML v1.10)", () => {
    it("generates well-formed FCPXML with formats, assets, spine, and audio roles", () => {
      const xml = timelineToFcpxml(sampleTimeline, { name: "Test Project", fps: 30, width: 1920, height: 1080 });
      expect(xml).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
      expect(xml).toContain("<!DOCTYPE fcpxml>");
      expect(xml).toContain("<fcpxml version=\"1.10\">");
      expect(xml).toContain("<format id=\"r_format\" name=\"FFVideoFormat1080p\"");
      expect(xml).toContain("<spine>");
      expect(xml).toContain("clip_intro");
      expect(xml).toContain("<gap name=\"Gap\"");
      expect(xml).toContain("clip_outro");
      expect(xml).toContain("audioRole=\"dialogue\"");
    });
  });

  describe("CMX 3600 EDL", () => {
    it("generates standard CMX 3600 EDL text with SMPTE timecodes", () => {
      const edl = timelineToEdl(sampleTimeline, { title: "Shorts_Test", fps: 30 });
      expect(edl).toContain("TITLE: SHORTS_TEST");
      expect(edl).toContain("FCM: NON-DROP FRAME");
      expect(edl).toContain("001  AX       V     C        00:00:01:00 00:00:05:15 00:00:00:00 00:00:04:15");
      expect(edl).toContain("* FROM CLIP NAME: clip_intro");
      expect(edl).toContain("* FROM CLIP NAME: clip_outro");
      expect(edl).toContain("003  AX       A     C        00:00:00:00 00:00:09:15 00:00:00:00 00:00:09:15");
      expect(edl).toContain("* FROM CLIP NAME: audio_voice");
    });
  });
});
