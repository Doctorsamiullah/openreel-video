import { describe, it, expect } from "vitest";
import { OllamaScriptProvider } from "./ollama-script-provider";

describe("OllamaScriptProvider", () => {
  it("generates structured video scripts conforming to schema in mock mode", async () => {
    const provider = new OllamaScriptProvider("http://127.0.0.1:11434", "llama3.2", true);
    const result = await provider.generateVideoScript("How to start a healthy morning routine", 30);

    expect(result.title).toBeDefined();
    expect(result.scenes.length).toBeGreaterThanOrEqual(3);
    expect(result.scenes[0]).toHaveProperty("visualDescription");
    expect(result.scenes[0]).toHaveProperty("stockSearchQuery");
    expect(result.scenes[0]).toHaveProperty("narrationText");
    expect(result.scenes[0]).toHaveProperty("captionText");
    expect(result.provider).toBe("ollama-mock");
  });

  it("rejects empty brief prompt", async () => {
    const provider = new OllamaScriptProvider("http://127.0.0.1:11434", "llama3.2", true);
    await expect(provider.generateVideoScript("   ")).rejects.toThrow(
      /Video idea\/brief prompt cannot be empty/,
    );
  });

  it("imports OpenMontage project JSON payloads correctly", () => {
    const provider = new OllamaScriptProvider();
    const imported = provider.importOpenMontage({
      version: "1.0",
      title: "OpenMontage Travel Video",
      pipeline: "explainer",
      scenes: [
        {
          title: "Introduction",
          duration: 6,
          visual: "Airplane flying into sunset",
          voiceover: "Traveling is the best way to discover the world.",
        },
        {
          title: "Destination",
          duration: 8,
          visual: "Mountain peaks in morning mist",
          voiceover: "Look at the beauty of these remote landscapes.",
        },
      ],
    });

    expect(imported.title).toBe("OpenMontage Travel Video");
    expect(imported.scenes).toHaveLength(2);
    expect(imported.totalDurationSeconds).toBe(14);
    expect(imported.scenes[0].stockSearchQuery).toContain("Airplane");
  });
});
