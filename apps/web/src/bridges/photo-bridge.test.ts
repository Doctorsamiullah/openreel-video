import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PhotoBridge, getPhotoBridge, disposePhotoBridge } from "./photo-bridge";

describe("PhotoBridge - Non-destructive Photo Pipeline", () => {
  let bridge: PhotoBridge;

  beforeEach(() => {
    disposePhotoBridge();
    bridge = new PhotoBridge();
  });

  afterEach(() => {
    bridge.dispose();
  });

  it("starts uninitialized and guards operations gracefully", () => {
    expect(bridge.isInitialized()).toBe(false);
    expect(bridge.getActiveProject()).toBeNull();
    // Operations should fail safely without crashing
    expect(bridge.createProject(1920, 1080)).toBeNull();
    expect(bridge.addLayer({ name: "Uninit Layer" })).toBeNull();
  });

  it("initializes photo and retouching engines", () => {
    bridge.initialize();
    expect(bridge.isInitialized()).toBe(true);
    expect(bridge.getPhotoEngine()).not.toBeNull();
    expect(bridge.getRetouchingEngine()).not.toBeNull();
  });

  it("creates, tracks, and manages photo projects", () => {
    bridge.initialize();
    const project = bridge.createProject(1280, 720, "Thumbnail 01");
    expect(project).not.toBeNull();
    expect(project?.name).toBe("Thumbnail 01");
    expect(project?.width).toBe(1280);
    expect(project?.height).toBe(720);

    // Active project state
    expect(bridge.getActiveProject()?.id).toBe(project?.id);
    expect(bridge.getProject(project!.id)?.name).toBe("Thumbnail 01");
    expect(bridge.getAllProjects().length).toBe(1);

    // Delete project
    const deleted = bridge.deleteProject(project!.id);
    expect(deleted).toBe(true);
    expect(bridge.getAllProjects().length).toBe(0);
    expect(bridge.getActiveProject()).toBeNull();
  });

  it("adds, reorders, and adjusts layers non-destructively", () => {
    bridge.initialize();
    const project = bridge.createProject(1920, 1080, "Social Post");
    expect(project).not.toBeNull();

    // Add first layer
    const updated1 = bridge.addLayer({
      name: "Graphic Base",
      type: "shape",
      opacity: 0.9,
      blendMode: "normal",
    });
    expect(updated1?.layers.length).toBe(1);
    const layer1Id = updated1!.layers[0].id;

    // Add second layer
    const updated2 = bridge.addLayer({
      name: "Overlaid Title",
      type: "text",
      opacity: 1.0,
      blendMode: "overlay",
    });
    expect(updated2?.layers.length).toBe(2);
    expect(bridge.getLayerCount()).toBe(2);

    // Change layer opacity
    const updated3 = bridge.setLayerOpacity(layer1Id, 0.75);
    expect(updated3?.layers.find((l) => l.id === layer1Id)?.opacity).toBe(0.75);

    // Change layer blend mode
    const updated4 = bridge.setLayerBlendMode(layer1Id, "multiply");
    expect(updated4?.layers.find((l) => l.id === layer1Id)?.blendMode).toBe("multiply");

    // Toggle visibility
    const updated5 = bridge.setLayerVisibility(layer1Id, false);
    expect(updated5?.layers.find((l) => l.id === layer1Id)?.visible).toBe(false);
    expect(bridge.getVisibleLayers().length).toBe(1);

    // Rename layer
    const updated6 = bridge.renameLayer(layer1Id, "Renamed Base");
    expect(updated6?.layers.find((l) => l.id === layer1Id)?.name).toBe("Renamed Base");

    // Lock layer
    const updated7 = bridge.setLayerLocked(layer1Id, true);
    expect(updated7?.layers.find((l) => l.id === layer1Id)?.locked).toBe(true);

    // Duplicate layer
    const updated8 = bridge.duplicateLayer(layer1Id);
    expect(updated8?.layers.length).toBe(3);
  });

  it("manages layer selection and retrieval", () => {
    bridge.initialize();
    bridge.createProject(1920, 1080);
    bridge.addLayer({ name: "Layer A" });
    const p = bridge.addLayer({ name: "Layer B" });
    const layerAId = p!.layers[0].id;

    bridge.selectLayer(layerAId);
    const selected = bridge.getSelectedLayer();
    expect(selected?.id).toBe(layerAId);
    expect(selected?.name).toBe("Layer A");

    const fetched = bridge.getLayer(layerAId);
    expect(fetched?.id).toBe(layerAId);
  });

  it("configures retouching brush parameters and clone sources", () => {
    bridge.initialize();
    bridge.setBrushConfig({ size: 45, hardness: 0.8 });
    const config = bridge.getBrushConfig();
    expect(config?.size).toBe(45);
    expect(config?.hardness).toBe(0.8);

    bridge.setBrushSize(75);
    expect(bridge.getBrushConfig()?.size).toBe(75);

    bridge.setBrushHardness(0.5);
    expect(bridge.getBrushConfig()?.hardness).toBe(0.5);

    bridge.setCloneSource(120, 240, "layer-99");
    const clone = bridge.getCloneSource();
    expect(clone).toEqual({ x: 120, y: 240, layerId: "layer-99" });
  });

  it("singleton instance management via getPhotoBridge and disposePhotoBridge", () => {
    const instance1 = getPhotoBridge();
    const instance2 = getPhotoBridge();
    expect(instance1).toBe(instance2);

    disposePhotoBridge();
    const instance3 = getPhotoBridge();
    expect(instance3).not.toBe(instance1);
    disposePhotoBridge();
  });
});
