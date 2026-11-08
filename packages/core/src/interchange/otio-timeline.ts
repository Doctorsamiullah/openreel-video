import type { OtioSerializable } from "../multicam/otio";
export type { OtioSerializable };

export interface OtioRationalTime {
  OTIO_SCHEMA: "RationalTime.1";
  value: number;
  rate: number;
}

export interface OtioTimeRange {
  OTIO_SCHEMA: "TimeRange.1";
  start_time: OtioRationalTime;
  duration: OtioRationalTime;
}

export const rationalTime = (value: number, rate: number): OtioRationalTime => ({
  OTIO_SCHEMA: "RationalTime.1",
  value: Math.round(value),
  rate,
});

export const timeRange = (start: number, duration: number, rate: number): OtioTimeRange => ({
  OTIO_SCHEMA: "TimeRange.1",
  start_time: rationalTime(start, rate),
  duration: rationalTime(duration, rate),
});

export interface TimelineToOtioOptions {
  name?: string;
  fps?: number;
}

import type { Timeline, Track } from "../types/timeline";

/**
 * Converts an OpenReel / SAMI Timeline into standard OpenTimelineIO 1.0 JSON schema.
 * Compatible with Kdenlive (OTIO bridge), DaVinci Resolve, and Premiere Pro.
 */
export function timelineToOtio(
  timeline: Timeline,
  options: TimelineToOtioOptions = {},
): OtioSerializable {
  const fps = options.fps && options.fps > 0 ? options.fps : 30;
  const name = options.name || "OpenReel Project Timeline";

  const tracks: OtioSerializable[] = timeline.tracks.map((track: Track, index: number) => {
    const isAudio = track.type === "audio" || track.role === "dialogue" || track.role === "music" || track.role === "effects";
    const kind = isAudio ? "Audio" : "Video";

    const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);
    const children: OtioSerializable[] = [];
    let currentPositionMs = 0;

    for (const clip of sortedClips) {
      const clipStartMs = clip.startTime * 1000;
      const clipDurationMs = clip.duration * 1000;

      // Insert gap if there is silence/space before clip
      if (clipStartMs > currentPositionMs) {
        const gapDurationMs = clipStartMs - currentPositionMs;
        const gapFrames = Math.round((gapDurationMs / 1000) * fps);
        if (gapFrames > 0) {
          children.push({
            OTIO_SCHEMA: "Gap.1",
            name: "Gap",
            source_range: timeRange(0, gapFrames, fps),
            metadata: {},
          });
        }
      }

      const inPointFrames = Math.round((clip.inPoint || 0) * fps);
      const durationFrames = Math.max(1, Math.round(clip.duration * fps));

      children.push({
        OTIO_SCHEMA: "Clip.2",
        name: clip.id,
        source_range: timeRange(inPointFrames, durationFrames, fps),
        media_reference: {
          OTIO_SCHEMA: "ExternalReference.1",
          target_url: clip.mediaId,
          available_range: null,
          metadata: {
            openreel_clip_id: clip.id,
            openreel_track_id: track.id,
          },
        },
        metadata: {
          openreel: {
            clipId: clip.id,
            trackId: track.id,
            startTime: clip.startTime,
            duration: clip.duration,
            inPoint: clip.inPoint,
            volume: clip.volume,
            speed: clip.speed ?? 1.0,
            fade: clip.fade,
            transform: clip.transform,
          },
        },
      });

      currentPositionMs = clipStartMs + clipDurationMs;
    }

    return {
      OTIO_SCHEMA: "Track.1",
      name: track.name || `${kind} Track ${index + 1}`,
      kind,
      children,
      source_range: null,
      effects: [],
      markers: [],
      metadata: {
        openreel: {
          trackId: track.id,
          locked: track.locked,
          muted: track.muted,
          role: track.role,
        },
      },
    };
  });

  const durationFrames = Math.max(1, Math.round((timeline.duration || 1) * fps));

  const markers: OtioSerializable[] = (timeline.markers || []).map((marker) => {
    const frame = Math.round(marker.time * fps);
    return {
      OTIO_SCHEMA: "Marker.1",
      name: marker.label || "Marker",
      marked_range: timeRange(frame, 1, fps),
      color: marker.color || "GREEN",
      metadata: {},
    };
  });

  return {
    OTIO_SCHEMA: "Timeline.1",
    name,
    global_start_time: rationalTime(0, fps),
    tracks: {
      OTIO_SCHEMA: "Stack.1",
      name: "tracks",
      children: tracks,
      source_range: timeRange(0, durationFrames, fps),
      effects: [],
      markers: [],
      metadata: {},
    },
    markers,
    metadata: {
      openreel: {
        version: "2.1",
        duration: timeline.duration,
        fps,
      },
    },
  };
}

export function serializeTimelineOtio(
  timeline: Timeline,
  options?: TimelineToOtioOptions,
): string {
  return JSON.stringify(timelineToOtio(timeline, options), null, 2);
}
