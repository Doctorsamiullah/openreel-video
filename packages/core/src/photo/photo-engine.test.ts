import { describe, it, expect, beforeEach } from "vitest";
import { PhotoEngine } from "./photo-engine";
import { PhotoAdjustmentEngine } from "./photo-adjustments";
import { RetouchingEngine, DEFAULT_BRUSH_CONFIG } from "./retouching-engine";
import type { PhotoBlendMode, LayerTransform } from "./types";

describe("PhotoEngine (Non-Destructive Core)", () => {
  let photoEngine: PhotoEngine;

  beforeEach(() => {
    photoEngine = new PhotoEngine({ width: 1920, height: 1080 });
  });

  it("creates a blank photo project with correct defaults", () => {
    const project = photoEngine.createProject(1920, 1080, "Cover Art");
    expect(project.id).toBeDefined();
    expect(project.name).toBe("Cover Art");
    expect(project.width).toBe(1920);
    expect(project.height).toBe(1080);
    expect(project.layers).toEqual([]);
    expect(project.selectedLayerIndex).toBe(-1);
    expect(project.backgroundColor).toBe("#ffffff");
  });

  it("adds layers with custom name, type, and opacity", () => {
    let project = photoEngine.createProject();
    project = photoEngine.addLayer(project, {
      name: "Foreground Text",
      type: "text",
      opacity: 0.85,
      blendMode: "overlay",
    });

    expect(project.layers.length).toBe(1);
    expect(project.layers[0].name).toBe("Foreground Text");
    expect(project.layers[0].type).toBe("text");
    expect(project.layers[0].opacity).toBe(0.85);
    expect(project.layers[0].blendMode).toBe("overlay");
    expect(project.layers[0].visible).toBe(true);
    expect(project.selectedLayerIndex).toBe(0);
  });

  it("updates layer opacity non-destructively without altering original source", () => {
    let project = photoEngine.createProject();
    project = photoEngine.addLayer(project, { name: "Base" });
    const layerId = project.layers[0].id;

    project = photoEngine.setLayerOpacity(project, layerId, 0.5);
    expect(project.layers[0].opacity).toBe(0.5);

    // Clamps to [0, 1] range
    project = photoEngine.setLayerOpacity(project, layerId, 1.5);
    expect(project.layers[0].opacity).toBe(1);

    project = photoEngine.setLayerOpacity(project, layerId, -0.5);
    expect(project.layers[0].opacity).toBe(0);
  });

  it("supports all required blend modes", () => {
    let project = photoEngine.createProject();
    project = photoEngine.addLayer(project, { name: "Blend Test" });
    const layerId = project.layers[0].id;

    const modes: PhotoBlendMode[] = [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "softLight",
      "hardLight",
      "colorDodge",
      "colorBurn",
      "difference",
      "exclusion",
      "hue",
      "saturation",
      "color",
      "luminosity",
    ];

    for (const mode of modes) {
      project = photoEngine.setLayerBlendMode(project, layerId, mode);
      expect(project.layers[0].blendMode).toBe(mode);
    }
  });

  it("reorders layers and toggles visibility correctly", () => {
    let project = photoEngine.createProject();
    project = photoEngine.addLayer(project, { name: "Layer 1" });
    project = photoEngine.addLayer(project, { name: "Layer 2" });
    project = photoEngine.addLayer(project, { name: "Layer 3" });

    const l1Id = project.layers[0].id;
    const l2Id = project.layers[1].id;

    // Toggle visibility
    project = photoEngine.setLayerVisibility(project, l2Id, false);
    expect(project.layers.find((l) => l.id === l2Id)?.visible).toBe(false);

    // Reorder layers (move index 0 to index 2)
    const reorderResult = photoEngine.reorderLayers(project, 0, 2);
    expect(reorderResult.success).toBe(true);
    expect(reorderResult.layers[0].id).toBe(l2Id);
    expect(reorderResult.layers[2].id).toBe(l1Id);
  });

  it("updates layer transforms (position, scale, rotation)", () => {
    let project = photoEngine.createProject();
    project = photoEngine.addLayer(project, { name: "Transformed" });
    const layerId = project.layers[0].id;

    const newTransform: Partial<LayerTransform> = {
      x: 100,
      y: 150,
      scale: 1.5,
      rotation: 45,
    };

    project = photoEngine.setLayerTransform(project, layerId, newTransform);
    const layer = project.layers[0];
    expect(layer.transform.x).toBe(100);
    expect(layer.transform.y).toBe(150);
    expect(layer.transform.scale).toBe(1.5);
    expect(layer.transform.rotation).toBe(45);
  });
});

describe("PhotoAdjustmentEngine", () => {
  let adjustmentEngine: PhotoAdjustmentEngine;
  let photoEngine: PhotoEngine;

  beforeEach(() => {
    adjustmentEngine = new PhotoAdjustmentEngine();
    photoEngine = new PhotoEngine();
  });

  it("creates and attaches brightness adjustment to a layer", () => {
    let project = photoEngine.createProject();
    project = photoEngine.addLayer(project, { name: "Subject" });
    const layerId = project.layers[0].id;

    const adjustment = adjustmentEngine.createAdjustment("brightness", {
      value: 0.25,
    });

    project = adjustmentEngine.addAdjustmentToLayer(project, layerId, adjustment);
    expect(project.layers[0].adjustments.length).toBe(1);
    expect(project.layers[0].adjustments[0].type).toBe("brightness");
    expect(project.layers[0].adjustments[0].params).toEqual({
      value: 0.25,
    });

    // Remove adjustment
    project = adjustmentEngine.removeAdjustmentFromLayer(
      project,
      layerId,
      adjustment.id,
    );
    expect(project.layers[0].adjustments.length).toBe(0);
  });
});

describe("RetouchingEngine", () => {
  let retouching: RetouchingEngine;

  beforeEach(() => {
    retouching = new RetouchingEngine();
  });

  it("configures brush parameters within safe limits", () => {
    expect(retouching.getBrushConfig().size).toBe(DEFAULT_BRUSH_CONFIG.size);

    retouching.setBrushSize(50);
    expect(retouching.getBrushConfig().size).toBe(50);

    // Clamps to max 500
    retouching.setBrushSize(1000);
    expect(retouching.getBrushConfig().size).toBe(500);

    // Clamps hardness to [0, 1]
    retouching.setBrushHardness(0.8);
    expect(retouching.getBrushConfig().hardness).toBe(0.8);
    retouching.setBrushHardness(2);
    expect(retouching.getBrushConfig().hardness).toBe(1);
  });

  it("manages clone stamp source coordinates", () => {
    expect(retouching.getCloneSource()).toBeNull();

    retouching.setCloneSource(250, 400, "layer-123");
    const source = retouching.getCloneSource();
    expect(source).toEqual({ x: 250, y: 400, layerId: "layer-123" });
  });
});
