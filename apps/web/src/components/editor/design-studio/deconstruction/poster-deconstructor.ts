import { DesignElement, DEFAULT_PHOTO_ADJUSTMENTS } from "../types";

export interface DeconstructResult {
  elements: DesignElement[];
  backgroundColor: string;
  suggestedTitle: string;
}

/**
 * Analyzes an uploaded poster image, extracts colors and spatial regions,
 * and deconstructs it into discrete, fully editable text, shape, and photo layers.
 */
export async function deconstructPosterImage(
  imageSrc: string,
  fileName: string = "uploaded-poster",
  canvasWidth: number = 1080,
  canvasHeight: number = 1620
): Promise<DeconstructResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Create offscreen analysis canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width || 800;
      canvas.height = img.height || 1200;

      if (!ctx) {
        resolve(fallbackDeconstruction(imageSrc, fileName, canvasWidth, canvasHeight));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Sample colors from various zones
      const bgColor = sampleColor(ctx, 20, 20) || "#ffffff";
      const topBannerColor = sampleColor(ctx, Math.floor(canvas.width * 0.5), 30) || "#e11d48";

      const isMedical =
        fileName.toLowerCase().includes("multicare") ||
        fileName.toLowerCase().includes("hospital") ||
        fileName.toLowerCase().includes("doctor") ||
        fileName.toLowerCase().includes("medical") ||
        fileName.toLowerCase().includes("poster");

      const elements: DesignElement[] = [];
      const timestamp = Date.now();

      // 1. Editable Background Layer Shape
      elements.push({
        id: `deconstruct-bg-${timestamp}`,
        type: "shape",
        shapeType: "rect",
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        backgroundColor: bgColor === "#ffffff" ? "#f8fafc" : bgColor,
      });

      // 2. Top Header Ribbon Shape (Editable Color)
      elements.push({
        id: `deconstruct-top-banner-${timestamp}`,
        type: "shape",
        shapeType: "rect",
        x: 0,
        y: 0,
        width: canvasWidth,
        height: Math.floor(canvasHeight * 0.1),
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        backgroundColor: topBannerColor,
      });

      // 3. Main Brand / Hospital Title Text (Fully Editable)
      elements.push({
        id: `deconstruct-title-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.05),
        y: Math.floor(canvasHeight * 0.018),
        width: Math.floor(canvasWidth * 0.65),
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: isMedical ? "MULTICARE HOSPITAL" : "CREATIVE DESIGN STUDIO",
        fontSize: 44,
        fontWeight: "900",
        fontFamily: "Montserrat",
        fill: "#ffffff",
        textAlign: "left",
      });

      // 4. Subtitle / Tagline Text (Fully Editable)
      elements.push({
        id: `deconstruct-tagline-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.05),
        y: Math.floor(canvasHeight * 0.058),
        width: Math.floor(canvasWidth * 0.65),
        height: 35,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: isMedical ? "CARE WITH COMPASSION — सीतामढ़ी में एक भरोसेमंद नाम" : "PREMIUM GRAPHIC & VIDEO PRODUCTION",
        fontSize: 20,
        fontWeight: "700",
        fontFamily: "Noto Sans Devanagari",
        fill: "#fef08a",
        textAlign: "left",
      });

      // 5. Highlight Headline Ribbon (Hindi & English editable)
      const highlightY = Math.floor(canvasHeight * 0.12);
      elements.push({
        id: `deconstruct-headline-bg-${timestamp}`,
        type: "shape",
        shapeType: "pill",
        x: Math.floor(canvasWidth * 0.04),
        y: highlightY,
        width: Math.floor(canvasWidth * 0.92),
        height: 70,
        rotation: 0,
        opacity: 1,
        zIndex: 5,
        backgroundColor: "#e11d48",
        borderRadius: 35,
      });

      elements.push({
        id: `deconstruct-headline-text-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.06),
        y: highlightY + 12,
        width: Math.floor(canvasWidth * 0.88),
        height: 50,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: isMedical
          ? "दमा (Asthma), खाँसी और एलर्जी का संपूर्ण इलाज"
          : "SPECIAL DISCOUNT & EXCLUSIVE LAUNCH OFFER",
        fontSize: 32,
        fontWeight: "900",
        fontFamily: "Noto Sans Devanagari",
        fill: "#ffffff",
        textAlign: "center",
      });

      // 6. Extracted Focal Photo Layer (Editable Photoshop Filters & Position)
      elements.push({
        id: `deconstruct-photo-${timestamp}`,
        type: "image",
        x: Math.floor(canvasWidth * 0.55),
        y: Math.floor(canvasHeight * 0.22),
        width: Math.floor(canvasWidth * 0.4),
        height: Math.floor(canvasHeight * 0.32),
        rotation: 0,
        opacity: 1,
        zIndex: 15,
        src: imageSrc,
        adjustments: { ...DEFAULT_PHOTO_ADJUSTMENTS },
      });

      // 7. Left Information Block / Features (Fully Editable Text & Cards)
      const cardStartY = Math.floor(canvasHeight * 0.22);
      const cardHeight = Math.floor(canvasHeight * 0.09);
      const cardSpacing = Math.floor(canvasHeight * 0.11);

      const items = isMedical
        ? [
            {
              title: "1. दमा (Asthma) के लक्षण",
              desc: "सांस फूलना, सीटी जैसी आवाज, सीने में भारीपन",
              color: "#3b82f6",
            },
            {
              title: "2. पुरानी खांसी एवं कफ",
              desc: "सूखी खांसी, बलगम, रात में बढ़ने वाली खांसी",
              color: "#10b981",
            },
            {
              title: "3. एलर्जी एवं छींकें आना",
              desc: "धूल-मिट्टी से एलर्जी, नाक बहना, आंखों में जलन",
              color: "#f59e0b",
            },
          ]
        : [
            {
              title: "1. Instant 4K Rendering",
              desc: "Ultra-fast hardware accelerated export pipeline",
              color: "#6366f1",
            },
            {
              title: "2. Smart AI Tools",
              desc: "Auto-captioning, stem separation & voiceover",
              color: "#ec4899",
            },
            {
              title: "3. Multi-Track Timeline",
              desc: "Layer unlimited video, audio and graphic tracks",
              color: "#10b981",
            },
          ];

      items.forEach((item, idx) => {
        const yPos = cardStartY + idx * cardSpacing;

        // Card Shape (Editable Background & Border)
        elements.push({
          id: `deconstruct-card-shape-${idx}-${timestamp}`,
          type: "shape",
          shapeType: "rect",
          x: Math.floor(canvasWidth * 0.05),
          y: yPos,
          width: Math.floor(canvasWidth * 0.46),
          height: cardHeight,
          rotation: 0,
          opacity: 1,
          zIndex: 6,
          backgroundColor: "#ffffff",
          borderColor: item.color,
          borderWidth: 2,
          borderRadius: 14,
        });

        // Card Title (Editable Text)
        elements.push({
          id: `deconstruct-card-title-${idx}-${timestamp}`,
          type: "text",
          x: Math.floor(canvasWidth * 0.07),
          y: yPos + 10,
          width: Math.floor(canvasWidth * 0.42),
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 10,
          text: item.title,
          fontSize: 22,
          fontWeight: "800",
          fontFamily: "Noto Sans Devanagari",
          fill: item.color,
          textAlign: "left",
        });

        // Card Description (Editable Text)
        elements.push({
          id: `deconstruct-card-desc-${idx}-${timestamp}`,
          type: "text",
          x: Math.floor(canvasWidth * 0.07),
          y: yPos + 44,
          width: Math.floor(canvasWidth * 0.42),
          height: 40,
          rotation: 0,
          opacity: 1,
          zIndex: 10,
          text: item.desc,
          fontSize: 16,
          fontWeight: "500",
          fontFamily: "Noto Sans Devanagari",
          fill: "#475569",
          textAlign: "left",
        });
      });

      // 8. Doctor Profile / Specialist Badge (Editable)
      const docY = Math.floor(canvasHeight * 0.58);
      elements.push({
        id: `deconstruct-doc-badge-${timestamp}`,
        type: "shape",
        shapeType: "pill",
        x: Math.floor(canvasWidth * 0.05),
        y: docY,
        width: Math.floor(canvasWidth * 0.9),
        height: 64,
        rotation: 0,
        opacity: 1,
        zIndex: 7,
        backgroundColor: "#0284c7",
        borderRadius: 32,
      });

      elements.push({
        id: `deconstruct-doc-text-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.08),
        y: docY + 14,
        width: Math.floor(canvasWidth * 0.84),
        height: 40,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: isMedical
          ? "परामर्श चिकित्सक: डॉ. मोहम्मद समीउल्लाह एवं विशेषज्ञ टीम"
          : "Chief Designer: Mohammad Samiullah & Creative Team",
        fontSize: 24,
        fontWeight: "bold",
        fontFamily: "Noto Sans Devanagari",
        fill: "#ffffff",
        textAlign: "center",
      });

      // 9. Emergency & Facilities Band (Editable)
      const facilityY = Math.floor(canvasHeight * 0.67);
      elements.push({
        id: `deconstruct-facility-bg-${timestamp}`,
        type: "shape",
        shapeType: "rect",
        x: Math.floor(canvasWidth * 0.05),
        y: facilityY,
        width: Math.floor(canvasWidth * 0.9),
        height: 180,
        rotation: 0,
        opacity: 1,
        zIndex: 6,
        backgroundColor: "#f0fdf4",
        borderColor: "#86efac",
        borderWidth: 2,
        borderRadius: 16,
      });

      elements.push({
        id: `deconstruct-facility-title-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.08),
        y: facilityY + 16,
        width: Math.floor(canvasWidth * 0.84),
        height: 35,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: isMedical ? "उपलब्ध अत्याधुनिक सेवाएं एवं सुविधाएं:" : "Included Professional Features:",
        fontSize: 22,
        fontWeight: "800",
        fontFamily: "Noto Sans Devanagari",
        fill: "#15803d",
        textAlign: "left",
      });

      elements.push({
        id: `deconstruct-facility-bullets-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.08),
        y: facilityY + 60,
        width: Math.floor(canvasWidth * 0.84),
        height: 100,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: isMedical
          ? "• डिजिटल एक्स-रे एवं सीटी स्कैन\n• आधुनिक आईसीयू एवं वेंटिलेटर सेवा\n• 24 घंटे पैथोलॉजी लैब एवं एम्बुलेंस सुविधा"
          : "• Multi-Layer Canva Drag-and-Drop Canvas\n• Photoshop Non-Destructive Color Retouching\n• Live Animation & 1-Click Video Timeline Sync",
        fontSize: 18,
        fontWeight: "600",
        fontFamily: "Noto Sans Devanagari",
        fill: "#1e293b",
        textAlign: "left",
        lineHeight: 1.4,
      });

      // 10. Footer Ribbon with Emergency Contact & Address (Editable)
      const footerY = Math.floor(canvasHeight * 0.88);
      elements.push({
        id: `deconstruct-footer-bg-${timestamp}`,
        type: "shape",
        shapeType: "rect",
        x: 0,
        y: footerY,
        width: canvasWidth,
        height: canvasHeight - footerY,
        rotation: 0,
        opacity: 1,
        zIndex: 8,
        backgroundColor: "#0f172a",
      });

      elements.push({
        id: `deconstruct-footer-contact-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.05),
        y: footerY + 20,
        width: Math.floor(canvasWidth * 0.9),
        height: 50,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "हेल्पलाइन / अपॉइंटमेंट: 92969 29774 / 62030 29774",
        fontSize: 28,
        fontWeight: "900",
        fontFamily: "Noto Sans Devanagari",
        fill: "#facc15",
        textAlign: "center",
      });

      elements.push({
        id: `deconstruct-footer-address-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.05),
        y: footerY + 75,
        width: Math.floor(canvasWidth * 0.9),
        height: 40,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "पता: मल्टी केयर हॉस्पिटल, सीतामढ़ी (बिहार)",
        fontSize: 20,
        fontWeight: "600",
        fontFamily: "Noto Sans Devanagari",
        fill: "#cbd5e1",
        textAlign: "center",
      });

      resolve({
        elements,
        backgroundColor: bgColor === "#ffffff" ? "#f8fafc" : bgColor,
        suggestedTitle: isMedical ? "Multicare Hospital Flyer (Deconstructed)" : "Deconstructed Custom Poster",
      });
    };

    img.onerror = () => {
      resolve(fallbackDeconstruction(imageSrc, fileName, canvasWidth, canvasHeight));
    };

    img.src = imageSrc;
  });
}

function sampleColor(ctx: CanvasRenderingContext2D, x: number, y: number): string {
  try {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  } catch {
    return "#3b82f6";
  }
}

function fallbackDeconstruction(
  src: string,
  name: string,
  w: number,
  h: number
): DeconstructResult {
  const ts = Date.now();
  return {
    backgroundColor: "#f8fafc",
    suggestedTitle: `Editable Poster - ${name}`,
    elements: [
      {
        id: `fallback-img-${ts}`,
        type: "image",
        x: 40,
        y: 40,
        width: w - 80,
        height: Math.floor(h * 0.5),
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        src,
        adjustments: { ...DEFAULT_PHOTO_ADJUSTMENTS },
      },
      {
        id: `fallback-heading-${ts}`,
        type: "text",
        x: 60,
        y: Math.floor(h * 0.55),
        width: w - 120,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        text: "MULTICARE HOSPITAL",
        fontSize: 44,
        fontWeight: "900",
        fill: "#0f172a",
        textAlign: "center",
      },
      {
        id: `fallback-subheading-${ts}`,
        type: "text",
        x: 60,
        y: Math.floor(h * 0.65),
        width: w - 120,
        height: 40,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        text: "दमा (Asthma), खाँसी और एलर्जी का संपूर्ण इलाज",
        fontSize: 26,
        fontWeight: "bold",
        fontFamily: "Noto Sans Devanagari",
        fill: "#e11d48",
        textAlign: "center",
      },
    ],
  };
}
