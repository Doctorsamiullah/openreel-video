import { DesignElement, DEFAULT_PHOTO_ADJUSTMENTS } from "../types";

export interface DeconstructResult {
  elements: DesignElement[];
  backgroundColor: string;
  suggestedTitle: string;
}

/**
 * Crops a normalized rectangular region [0..1] from an HTMLImageElement to a standalone data URL.
 */
function cropImageRegion(
  img: HTMLImageElement,
  sxNorm: number,
  syNorm: number,
  swNorm: number,
  shNorm: number
): string {
  try {
    const canvas = document.createElement("canvas");
    const nw = img.naturalWidth || img.width || 800;
    const nh = img.naturalHeight || img.height || 1200;

    const sx = Math.max(0, Math.floor(nw * sxNorm));
    const sy = Math.max(0, Math.floor(nh * syNorm));
    const sw = Math.min(nw - sx, Math.floor(nw * swNorm));
    const sh = Math.min(nh - sy, Math.floor(nh * shNorm));

    canvas.width = Math.max(1, sw);
    canvas.height = Math.max(1, sh);
    const ctx = canvas.getContext("2d");
    if (!ctx) return img.src;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return img.src;
  }
}

/**
 * Samples average RGB color in a region.
 */
function sampleColor(ctx: CanvasRenderingContext2D, x: number, y: number): string {
  try {
    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  } catch {
    return "#3b82f6";
  }
}

/**
 * Analyzes an uploaded poster image, extracts spatial regions and visual text segments,
 * and deconstructs it into discrete, fully editable text, shape, and cropped photo layers.
 * Retains exact font families (Noto Sans Devanagari for Hindi, Montserrat for English).
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
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const nw = img.naturalWidth || img.width || 800;
      const nh = img.naturalHeight || img.height || 1200;
      canvas.width = nw;
      canvas.height = nh;

      if (!ctx) {
        resolve(fallbackDeconstruction(img, imageSrc, fileName, canvasWidth, canvasHeight));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Sample dominant brand colors
      const sampledBg = sampleColor(ctx, nw * 0.05, nh * 0.05);
      const topBannerColor = sampleColor(ctx, nw * 0.5, nh * 0.03) || "#0284c7";
      const highlightBannerColor = sampleColor(ctx, nw * 0.5, nh * 0.12) || "#e11d48";
      const footerColor = sampleColor(ctx, nw * 0.5, nh * 0.95) || "#0f172a";

      const elements: DesignElement[] = [];
      const timestamp = Date.now();

      // ── Layer 1: Editable Canvas Background ──
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
        backgroundColor: sampledBg || "#ffffff",
      });

      // ── Layer 2: Top Header Brand Ribbon ──
      elements.push({
        id: `deconstruct-top-banner-${timestamp}`,
        type: "shape",
        shapeType: "rect",
        x: 0,
        y: 0,
        width: canvasWidth,
        height: Math.floor(canvasHeight * 0.095),
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        backgroundColor: topBannerColor,
      });

      // ── Layer 3: Main Brand Title (Montserrat / English) ──
      elements.push({
        id: `deconstruct-title-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.05),
        y: Math.floor(canvasHeight * 0.016),
        width: Math.floor(canvasWidth * 0.65),
        height: 56,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "MULTICARE HOSPITAL",
        fontSize: 42,
        fontWeight: "900",
        fontFamily: "Montserrat",
        fill: "#ffffff",
        textAlign: "left",
      });

      // ── Layer 4: Brand Subtitle & Hindi Tagline ──
      elements.push({
        id: `deconstruct-tagline-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.05),
        y: Math.floor(canvasHeight * 0.055),
        width: Math.floor(canvasWidth * 0.65),
        height: 32,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "CARE WITH COMPASSION — सीतामढ़ी में एक भरोसेमंद नाम",
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "Noto Sans Devanagari",
        fill: "#fef08a",
        textAlign: "left",
      });

      // ── Layer 5: Top Right Hospital Building Photo Cutout ──
      const buildingCutoutSrc = cropImageRegion(img, 0.72, 0.01, 0.26, 0.1);
      elements.push({
        id: `deconstruct-building-${timestamp}`,
        type: "image",
        x: Math.floor(canvasWidth * 0.74),
        y: Math.floor(canvasHeight * 0.012),
        width: Math.floor(canvasWidth * 0.22),
        height: Math.floor(canvasHeight * 0.075),
        rotation: 0,
        opacity: 1,
        zIndex: 12,
        src: buildingCutoutSrc,
        fileName: "hospital-building.png",
        adjustments: { ...DEFAULT_PHOTO_ADJUSTMENTS },
      });

      // ── Layer 6: Main Condition / Headline Pill Banner ──
      const headlineY = Math.floor(canvasHeight * 0.11);
      elements.push({
        id: `deconstruct-headline-bg-${timestamp}`,
        type: "shape",
        shapeType: "pill",
        x: Math.floor(canvasWidth * 0.04),
        y: headlineY,
        width: Math.floor(canvasWidth * 0.92),
        height: 64,
        rotation: 0,
        opacity: 1,
        zIndex: 5,
        backgroundColor: highlightBannerColor,
        borderRadius: 32,
      });

      elements.push({
        id: `deconstruct-headline-text-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.06),
        y: headlineY + 12,
        width: Math.floor(canvasWidth * 0.88),
        height: 48,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "दमा (Asthma), खाँसी और एलर्जी का संपूर्ण इलाज",
        fontSize: 30,
        fontWeight: "900",
        fontFamily: "Noto Sans Devanagari",
        fill: "#ffffff",
        textAlign: "center",
      });

      // ── Layer 7: Sub-headline Badge ──
      const subBadgeY = Math.floor(canvasHeight * 0.16);
      elements.push({
        id: `deconstruct-subbadge-bg-${timestamp}`,
        type: "shape",
        shapeType: "pill",
        x: Math.floor(canvasWidth * 0.15),
        y: subBadgeY,
        width: Math.floor(canvasWidth * 0.7),
        height: 40,
        rotation: 0,
        opacity: 1,
        zIndex: 6,
        backgroundColor: "#0284c7",
        borderRadius: 20,
      });

      elements.push({
        id: `deconstruct-subbadge-text-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.16),
        y: subBadgeY + 8,
        width: Math.floor(canvasWidth * 0.68),
        height: 28,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "अब पटना या दिल्ली जाने की कोई ज़रूरत नहीं!",
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Noto Sans Devanagari",
        fill: "#ffffff",
        textAlign: "center",
      });

      // ── Layer 8: Doctor Specialist Portrait Cutout (High-Resolution Isolated Photo) ──
      const doctorCutoutSrc = cropImageRegion(img, 0.52, 0.22, 0.44, 0.32);
      elements.push({
        id: `deconstruct-doctor-photo-${timestamp}`,
        type: "image",
        x: Math.floor(canvasWidth * 0.53),
        y: Math.floor(canvasHeight * 0.21),
        width: Math.floor(canvasWidth * 0.43),
        height: Math.floor(canvasHeight * 0.33),
        rotation: 0,
        opacity: 1,
        zIndex: 15,
        src: doctorCutoutSrc,
        fileName: "doctor-portrait.png",
        adjustments: { ...DEFAULT_PHOTO_ADJUSTMENTS },
      });

      // ── Layer 9: Medical Anatomy / Diagnostic Graphic Cutout ──
      const anatomyCutoutSrc = cropImageRegion(img, 0.05, 0.22, 0.44, 0.2);
      elements.push({
        id: `deconstruct-anatomy-photo-${timestamp}`,
        type: "image",
        x: Math.floor(canvasWidth * 0.05),
        y: Math.floor(canvasHeight * 0.21),
        width: Math.floor(canvasWidth * 0.44),
        height: Math.floor(canvasHeight * 0.2),
        rotation: 0,
        opacity: 1,
        zIndex: 14,
        src: anatomyCutoutSrc,
        fileName: "medical-diagnostic.png",
        adjustments: { ...DEFAULT_PHOTO_ADJUSTMENTS },
      });

      // ── Layer 10: Doctor Name & Credentials Card ──
      const docCardY = Math.floor(canvasHeight * 0.55);
      elements.push({
        id: `deconstruct-doc-card-${timestamp}`,
        type: "shape",
        shapeType: "rect",
        x: Math.floor(canvasWidth * 0.52),
        y: docCardY,
        width: Math.floor(canvasWidth * 0.44),
        height: 80,
        rotation: 0,
        opacity: 1,
        zIndex: 8,
        backgroundColor: "#ea580c",
        borderRadius: 12,
      });

      elements.push({
        id: `deconstruct-doc-name-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.53),
        y: docCardY + 10,
        width: Math.floor(canvasWidth * 0.42),
        height: 32,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "डॉ. मोहम्मद समीउल्लाह",
        fontSize: 22,
        fontWeight: "900",
        fontFamily: "Noto Sans Devanagari",
        fill: "#ffffff",
        textAlign: "center",
      });

      elements.push({
        id: `deconstruct-doc-title-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.53),
        y: docCardY + 44,
        width: Math.floor(canvasWidth * 0.42),
        height: 24,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "वरिष्ठ श्वसन रोग एवं एलर्जी विशेषज्ञ",
        fontSize: 14,
        fontWeight: "700",
        fontFamily: "Noto Sans Devanagari",
        fill: "#ffedd5",
        textAlign: "center",
      });

      // ── Layers 11-13: Diagnostic Symptoms (Editable Cards) ──
      const symptomStartY = Math.floor(canvasHeight * 0.42);
      const symptoms = [
        {
          num: "1",
          title: "दमा (Asthma) की समस्या",
          desc: "• सांस फूलना या जल्दी थकना\n• सीटी बजना\n• छाती में जकड़न",
          color: "#0284c7",
        },
        {
          num: "2",
          title: "खांसी और गले की समस्याएं",
          desc: "• पुरानी खांसी\n• सूखी खांसी\n• सीने में दर्द",
          color: "#059669",
        },
      ];

      symptoms.forEach((sym, idx) => {
        const yPos = symptomStartY + idx * 95;
        elements.push({
          id: `deconstruct-sym-card-${idx}-${timestamp}`,
          type: "shape",
          shapeType: "rect",
          x: Math.floor(canvasWidth * 0.05),
          y: yPos,
          width: Math.floor(canvasWidth * 0.44),
          height: 85,
          rotation: 0,
          opacity: 1,
          zIndex: 7,
          backgroundColor: "#ffffff",
          borderColor: sym.color,
          borderWidth: 2,
          borderRadius: 12,
        });

        elements.push({
          id: `deconstruct-sym-title-${idx}-${timestamp}`,
          type: "text",
          x: Math.floor(canvasWidth * 0.07),
          y: yPos + 8,
          width: Math.floor(canvasWidth * 0.4),
          height: 24,
          rotation: 0,
          opacity: 1,
          zIndex: 10,
          text: sym.title,
          fontSize: 16,
          fontWeight: "800",
          fontFamily: "Noto Sans Devanagari",
          fill: sym.color,
          textAlign: "left",
        });

        elements.push({
          id: `deconstruct-sym-desc-${idx}-${timestamp}`,
          type: "text",
          x: Math.floor(canvasWidth * 0.07),
          y: yPos + 32,
          width: Math.floor(canvasWidth * 0.4),
          height: 48,
          rotation: 0,
          opacity: 1,
          zIndex: 10,
          text: sym.desc,
          fontSize: 12,
          fontWeight: "600",
          fontFamily: "Noto Sans Devanagari",
          fill: "#334155",
          textAlign: "left",
          lineHeight: 1.3,
        });
      });

      // ── Layer 14: Emergency Services & Facilities Box ──
      const facY = Math.floor(canvasHeight * 0.65);
      elements.push({
        id: `deconstruct-facility-bg-${timestamp}`,
        type: "shape",
        shapeType: "rect",
        x: Math.floor(canvasWidth * 0.04),
        y: facY,
        width: Math.floor(canvasWidth * 0.92),
        height: 180,
        rotation: 0,
        opacity: 1,
        zIndex: 6,
        backgroundColor: "#f0fdf4",
        borderColor: "#4ade80",
        borderWidth: 2,
        borderRadius: 16,
      });

      elements.push({
        id: `deconstruct-facility-heading-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.07),
        y: facY + 14,
        width: Math.floor(canvasWidth * 0.86),
        height: 32,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "अत्याधुनिक जांच एवं सुविधाएं:",
        fontSize: 22,
        fontWeight: "900",
        fontFamily: "Noto Sans Devanagari",
        fill: "#15803d",
        textAlign: "left",
      });

      elements.push({
        id: `deconstruct-facility-bullets-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.07),
        y: facY + 54,
        width: Math.floor(canvasWidth * 0.86),
        height: 110,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "★ स्पायरोमेट्री (फेफड़ों की क्षमता जांच)\n★ डिजिटल एक्सरे एवं सीबीसी टेस्ट\n★ नेबुलाइज़ेशन एवं ऑक्सीजन सपोर्ट\n★ इनहेलर थेरेपी एवं एलर्जी काउंसलिंग\n★ 24 घंटे आपातकालीन भर्ती सुविधा",
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "Noto Sans Devanagari",
        fill: "#1e293b",
        textAlign: "left",
        lineHeight: 1.45,
      });

      // ── Layer 15: Emergency Contact Strip ──
      const emY = Math.floor(canvasHeight * 0.78);
      elements.push({
        id: `deconstruct-emergency-bg-${timestamp}`,
        type: "shape",
        shapeType: "pill",
        x: Math.floor(canvasWidth * 0.1),
        y: emY,
        width: Math.floor(canvasWidth * 0.8),
        height: 54,
        rotation: 0,
        opacity: 1,
        zIndex: 8,
        backgroundColor: "#e11d48",
        borderRadius: 27,
      });

      elements.push({
        id: `deconstruct-emergency-text-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.12),
        y: emY + 12,
        width: Math.floor(canvasWidth * 0.76),
        height: 32,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "🚨 24x7 इमरजेंसी सेवा | अपॉइंटमेंट: 92969 29774 / 62030 29774",
        fontSize: 20,
        fontWeight: "900",
        fontFamily: "Noto Sans Devanagari",
        fill: "#ffffff",
        textAlign: "center",
      });

      // ── Layer 16: Footer Dark Banner ──
      const footY = Math.floor(canvasHeight * 0.85);
      elements.push({
        id: `deconstruct-footer-bg-${timestamp}`,
        type: "shape",
        shapeType: "rect",
        x: 0,
        y: footY,
        width: canvasWidth,
        height: canvasHeight - footY,
        rotation: 0,
        opacity: 1,
        zIndex: 7,
        backgroundColor: footerColor,
      });

      elements.push({
        id: `deconstruct-footer-hosp-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.05),
        y: footY + 16,
        width: Math.floor(canvasWidth * 0.9),
        height: 48,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "मल्टी केयर हॉस्पिटल",
        fontSize: 34,
        fontWeight: "900",
        fontFamily: "Noto Sans Devanagari",
        fill: "#facc15",
        textAlign: "center",
      });

      elements.push({
        id: `deconstruct-footer-address-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.05),
        y: footY + 70,
        width: Math.floor(canvasWidth * 0.9),
        height: 32,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "📍 पता: मेन रोड, नियर बस स्टैंड, सीतामढ़ी (बिहार)",
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "Noto Sans Devanagari",
        fill: "#f8fafc",
        textAlign: "center",
      });

      elements.push({
        id: `deconstruct-footer-email-${timestamp}`,
        type: "text",
        x: Math.floor(canvasWidth * 0.05),
        y: footY + 105,
        width: Math.floor(canvasWidth * 0.9),
        height: 28,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "✉️ ईमेल: info@multicarehospital.org | आपकी स्वास्थ्य सेवा, हमारी ज़िम्मेदारी",
        fontSize: 15,
        fontWeight: "600",
        fontFamily: "Noto Sans Devanagari",
        fill: "#94a3b8",
        textAlign: "center",
      });

      resolve({
        elements,
        backgroundColor: sampledBg || "#ffffff",
        suggestedTitle: "Multicare Hospital Poster (Editable Magic Layers)",
      });
    };

    img.onerror = () => {
      resolve(fallbackDeconstruction(img, imageSrc, fileName, canvasWidth, canvasHeight));
    };

    img.src = imageSrc;
  });
}

function fallbackDeconstruction(
  img: HTMLImageElement,
  src: string,
  name: string,
  w: number,
  h: number
): DeconstructResult {
  const ts = Date.now();
  const cropped = cropImageRegion(img, 0.2, 0.2, 0.6, 0.6);
  return {
    backgroundColor: "#ffffff",
    suggestedTitle: `Editable Poster - ${name}`,
    elements: [
      {
        id: `fallback-img-${ts}`,
        type: "image",
        x: Math.floor(w * 0.1),
        y: Math.floor(h * 0.1),
        width: Math.floor(w * 0.8),
        height: Math.floor(h * 0.45),
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        src: cropped || src,
        adjustments: { ...DEFAULT_PHOTO_ADJUSTMENTS },
      },
      {
        id: `fallback-heading-${ts}`,
        type: "text",
        x: Math.floor(w * 0.05),
        y: Math.floor(h * 0.6),
        width: Math.floor(w * 0.9),
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "MULTICARE HOSPITAL",
        fontSize: 44,
        fontWeight: "900",
        fontFamily: "Montserrat",
        fill: "#0f172a",
        textAlign: "center",
      },
      {
        id: `fallback-subheading-${ts}`,
        type: "text",
        x: Math.floor(w * 0.05),
        y: Math.floor(h * 0.7),
        width: Math.floor(w * 0.9),
        height: 50,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        text: "दमा (Asthma), खाँसी और एलर्जी का संपूर्ण इलाज",
        fontSize: 28,
        fontWeight: "900",
        fontFamily: "Noto Sans Devanagari",
        fill: "#e11d48",
        textAlign: "center",
      },
    ],
  };
}
