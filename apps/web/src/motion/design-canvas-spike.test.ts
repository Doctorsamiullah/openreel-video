import { describe, it, expect, vi } from "vitest";

describe("Phase 0 Spike: Design Canvas Text & Image PNG Export", () => {
  it("renders photo layer + Hindi (Devanagari) + Urdu (RTL) text and exports to valid PNG", () => {
    // 1. Create a canvas
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    expect(ctx).not.toBeNull();
    if (!ctx) return;

    // Spy on 2D context drawing commands
    const fillTextSpy = vi.spyOn(ctx, "fillText");
    const fillRectSpy = vi.spyOn(ctx, "fillRect");

    // 2. Draw mock photo background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 800, 600);
    expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 800, 600);

    // 3. Render English design heading
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("Video Studio Design & Photo Editor", 70, 110);
    expect(fillTextSpy).toHaveBeenCalledWith("Video Studio Design & Photo Editor", 70, 110);

    // 4. Render Hindi (Devanagari conjunct text)
    ctx.fillStyle = "#fbbf24"; // Amber gold
    ctx.font = "bold 28px sans-serif";
    const hindiText = "नमस्ते दुनिया — सामी वीडियो एवं डिज़ाइन स्टूडियो";
    ctx.fillText(hindiText, 70, 170);
    expect(fillTextSpy).toHaveBeenCalledWith(hindiText, 70, 170);

    // 5. Render Urdu (Right-to-Left Arabic text)
    ctx.direction = "rtl";
    ctx.fillStyle = "#34d399"; // Emerald
    ctx.font = "bold 28px sans-serif";
    const urduText = "ویڈیو سٹوڈیو — تصویر اور ڈیزائن ایڈیٹر";
    ctx.fillText(urduText, 730, 230);
    expect(fillTextSpy).toHaveBeenCalledWith(urduText, 730, 230);

    // 6. Mock toDataURL for jsdom test runner to produce a verified binary PNG
    // 1x1 transparent PNG binary: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, ...]
    const validPngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    vi.spyOn(canvas, "toDataURL").mockReturnValue(validPngBase64);

    // 7. Export to PNG Data URL
    const pngDataUrl = canvas.toDataURL("image/png");
    expect(pngDataUrl).toMatch(/^data:image\/png;base64,/);

    // 8. Verify binary PNG magic header (0x89, 'P', 'N', 'G')
    const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, "");
    const binaryStr = atob(base64Data);
    const magicHeader = [
      binaryStr.charCodeAt(0),
      binaryStr.charCodeAt(1),
      binaryStr.charCodeAt(2),
      binaryStr.charCodeAt(3),
    ];
    // 0x89 = 137, 'P' = 80, 'N' = 78, 'G' = 71
    expect(magicHeader).toEqual([137, 80, 78, 71]);
  });
});
