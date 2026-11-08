/**
 * Layout Engine for SAMI Design Studio
 * Handles Autofit with/without template, Auto Layout (Grid/Collage), and "Fit All Content" visibility guard.
 */

import { DesignElement, CanvasDimensions } from "../types";

/**
 * Arranges all elements on a blank canvas into a balanced grid/collage layout
 * with even margins, gutters, and zero overlap.
 */
export function computeAutoLayout(
  elements: DesignElement[],
  dimensions: CanvasDimensions
): DesignElement[] {
  if (elements.length === 0) return [];

  const copy: DesignElement[] = JSON.parse(JSON.stringify(elements));
  const marginX = Math.round(dimensions.width * 0.06);
  const marginY = Math.round(dimensions.height * 0.05);
  const usableWidth = dimensions.width - marginX * 2;
  const usableHeight = dimensions.height - marginY * 2;

  // Classify elements
  const textElements = copy.filter((el) => el.type === "text");
  const imageElements = copy.filter((el) => el.type === "image");
  const shapeElements = copy.filter((el) => el.type === "shape" || el.type === "badge");

  let currentY = marginY;

  // 1. Arrange Header Text (if any)
  const headerTexts = textElements.filter(
    (t) => (t.fontSize && t.fontSize >= 36) || (t.text && t.text.length < 50)
  );
  headerTexts.forEach((t) => {
    t.width = Math.min(usableWidth, Math.max(t.width, usableWidth * 0.85));
    t.x = Math.round((dimensions.width - t.width) / 2);
    t.y = currentY;
    currentY += t.height + 24;
  });

  // 2. Arrange Images in a clean Grid / Collage
  if (imageElements.length > 0) {
    const numImages = imageElements.length;
    let cols = 1;
    if (numImages === 2) cols = 2;
    else if (numImages >= 3 && numImages <= 4) cols = 2;
    else if (numImages >= 5) cols = 3;

    const gutter = 20;
    const colWidth = Math.round((usableWidth - (cols - 1) * gutter) / cols);
    const availableHeightForImages = Math.max(
      300,
      usableHeight - (currentY - marginY) - 140
    );
    const rows = Math.ceil(numImages / cols);
    const rowHeight = Math.min(
      Math.round(availableHeightForImages / rows),
      Math.round(colWidth * 0.85)
    );

    imageElements.forEach((img, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      img.x = marginX + col * (colWidth + gutter);
      img.y = currentY + row * (rowHeight + gutter);
      img.width = colWidth;
      img.height = rowHeight;
      img.lockAspectRatio = true;
      img.aspectRatio = colWidth / rowHeight;
    });

    currentY += rows * (rowHeight + gutter) + 16;
  }

  // 3. Arrange Remaining Body / Footnote Text
  const otherTexts = textElements.filter((t) => !headerTexts.includes(t));
  otherTexts.forEach((t) => {
    t.width = Math.min(usableWidth * 0.9, t.width);
    t.x = Math.round((dimensions.width - t.width) / 2);
    t.y = Math.min(currentY, dimensions.height - marginY - t.height);
    currentY += t.height + 16;
  });

  // 4. Arrange Shapes / Badges at the bottom or as accents
  shapeElements.forEach((s, idx) => {
    if (s.shapeType === "pill") {
      s.x = Math.round((dimensions.width - s.width) / 2);
      s.y = Math.min(currentY + idx * (s.height + 10), dimensions.height - marginY - s.height);
    }
  });

  return copy;
}

/**
 * Checks all elements and fits them safely within canvas bounds:
 * - Expands overflowing text boxes so no text is clipped
 * - Shifts elements that are off-canvas into the safe area
 * - Resolves overflows
 */
export function fitAllContentToCanvas(
  elements: DesignElement[],
  dimensions: CanvasDimensions
): { elements: DesignElement[]; adjustedCount: number } {
  let adjustedCount = 0;
  const padding = 30;

  const updated = elements.map((el) => {
    let changed = false;
    let { x, y, width, height } = el;

    // Check Text Overflow
    if (el.type === "text" && el.text) {
      const lines = el.text.split("\n");
      const lineHeight = (el.fontSize || 32) * (el.lineHeight || 1.25);
      const estimatedHeight = Math.ceil(lines.length * lineHeight + 12);
      if (estimatedHeight > height) {
        height = estimatedHeight;
        changed = true;
      }
    }

    // Constrain width
    if (width > dimensions.width - padding * 2) {
      width = dimensions.width - padding * 2;
      changed = true;
    }

    // Constrain X position
    if (x < padding) {
      x = padding;
      changed = true;
    } else if (x + width > dimensions.width - padding) {
      x = Math.max(padding, dimensions.width - padding - width);
      changed = true;
    }

    // Constrain Y position
    if (y < padding) {
      y = padding;
      changed = true;
    } else if (y + height > dimensions.height - padding) {
      y = Math.max(padding, dimensions.height - padding - height);
      changed = true;
    }

    if (changed) {
      adjustedCount++;
      return {
        ...el,
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      };
    }
    return el;
  });

  return { elements: updated, adjustedCount };
}

/**
 * Calculates optimal font size so that the text fits exactly inside the box width & height.
 */
export function calculateFitFontSize(
  text: string,
  boxWidth: number,
  boxHeight: number,
  currentFontSize: number = 32,
  lineHeightMultiplier: number = 1.25
): number {
  if (!text || boxWidth <= 0 || boxHeight <= 0) return currentFontSize;

  const lines = text.split("\n");
  const lineCount = Math.max(1, lines.length);

  // Height constraint: lineCount * (fontSize * lineHeightMultiplier) <= boxHeight
  const maxFontByHeight = Math.floor(boxHeight / (lineCount * lineHeightMultiplier));

  // Width constraint estimate (approx 0.6em per char for Latin/Devanagari)
  const longestLineLen = Math.max(...lines.map((l) => l.length), 1);
  const maxFontByWidth = Math.floor(boxWidth / (longestLineLen * 0.58));

  const optimalSize = Math.min(maxFontByHeight, maxFontByWidth);
  return Math.max(10, Math.min(180, optimalSize));
}
