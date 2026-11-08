import { describe, it, expect } from "vitest";
import { ComfyUIProvider } from "./comfyui-provider";

describe("ComfyUIProvider", () => {
  it("provides capabilities and hardware tiers in mock mode", async () => {
    const provider = new ComfyUIProvider("http://127.0.0.1:8188", true);
    const caps = await provider.capabilities();

    expect(caps.name).toContain("ComfyUI");
    expect(caps.availableModels).toContain("wan2.2");
    expect(caps.hardwareTier).toBe("T1");
  });

  it("generates a video clip result in mock mode", async () => {
    const provider = new ComfyUIProvider("http://127.0.0.1:8188", true);
    const progressLogs: string[] = [];

    const result = await provider.generateClip(
      {
        prompt: "A drone shot over snow-capped mountains at sunrise",
        model: "wan2.2",
        durationSeconds: 5,
        width: 1280,
        height: 720,
      },
      (percent, status) => {
        progressLogs.push(`${percent}%: ${status}`);
      },
    );

    expect(result.jobId).toBeDefined();
    expect(result.videoUrl).toBeDefined();
    expect(result.provider).toBe("comfyui-mock");
    expect(result.dimensions).toEqual({ width: 1280, height: 720 });
    expect(progressLogs.length).toBeGreaterThan(0);
  });

  it("rejects empty prompt requests", async () => {
    const provider = new ComfyUIProvider("http://127.0.0.1:8188", true);
    await expect(
      provider.generateClip({
        prompt: "   ",
        model: "wan2.2",
        durationSeconds: 5,
        width: 1280,
        height: 720,
      }),
    ).rejects.toThrow(/Prompt cannot be empty/);
  });
});
