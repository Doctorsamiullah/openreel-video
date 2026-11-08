import { DesignElement, ElementAnimationConfig, PageAnimationConfig } from "../types";

// Easing functions
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    const t2 = t - 1.5 / d1;
    return n1 * t2 * t2 + 0.75;
  } else if (t < 2.5 / d1) {
    const t2 = t - 2.25 / d1;
    return n1 * t2 * t2 + 0.9375;
  } else {
    const t2 = t - 2.625 / d1;
    return n1 * t2 * t2 + 0.984375;
  }
}

export interface RenderTransform {
  opacity: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  visibleText?: string;
}

/**
 * Calculates the animated transform for an individual element at time t (in seconds).
 */
export function computeElementAnimation(
  element: DesignElement,
  t: number,
  pageConfig?: PageAnimationConfig
): RenderTransform {
  const anim: ElementAnimationConfig = element.animation || {
    preset: "none",
    duration: 1.2,
    delay: 0,
  };

  // If no element-level animation, fallback to page-level animation if active
  if (anim.preset === "none") {
    if (pageConfig && pageConfig.preset !== "none") {
      return computePageAnimationFallback(element, t, pageConfig);
    }
    return {
      opacity: element.opacity ?? 1,
      offsetX: 0,
      offsetY: 0,
      scaleX: 1,
      scaleY: 1,
      visibleText: element.text,
    };
  }

  const startTime = anim.delay || 0;
  const duration = Math.max(anim.duration || 1.2, 0.1);
  const baseOpacity = element.opacity ?? 1;

  if (t < startTime) {
    // Before start: element is either hidden or at initial state
    if (anim.preset === "pulse" || anim.preset === "heartbeat" || anim.preset === "breathe") {
      return { opacity: baseOpacity, offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1, visibleText: element.text };
    }
    return {
      opacity: 0,
      offsetX: 0,
      offsetY: 0,
      scaleX: 0,
      scaleY: 0,
      visibleText: anim.preset === "typewriter" ? "" : element.text,
    };
  }

  const elapsed = t - startTime;
  const progress = Math.min(elapsed / duration, 1);

  switch (anim.preset) {
    case "fade": {
      const eased = easeOutCubic(progress);
      return {
        opacity: baseOpacity * eased,
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
    }

    case "pan-left": {
      const eased = easeOutCubic(progress);
      const startOffset = 250;
      return {
        opacity: baseOpacity * eased,
        offsetX: (1 - eased) * -startOffset,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
    }

    case "pan-right": {
      const eased = easeOutCubic(progress);
      const startOffset = 250;
      return {
        opacity: baseOpacity * eased,
        offsetX: (1 - eased) * startOffset,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
    }

    case "pan-up":
    case "rise": {
      const eased = easeOutCubic(progress);
      const startOffset = 180;
      return {
        opacity: baseOpacity * eased,
        offsetX: 0,
        offsetY: (1 - eased) * startOffset,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
    }

    case "pan-down": {
      const eased = easeOutCubic(progress);
      const startOffset = 180;
      return {
        opacity: baseOpacity * eased,
        offsetX: 0,
        offsetY: (1 - eased) * -startOffset,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
    }

    case "pop": {
      const eased = easeOutBack(progress);
      const scale = Math.max(0, eased);
      return {
        opacity: baseOpacity * Math.min(progress * 2, 1),
        offsetX: 0,
        offsetY: 0,
        scaleX: scale,
        scaleY: scale,
        visibleText: element.text,
      };
    }

    case "bounce": {
      const eased = easeOutBounce(progress);
      return {
        opacity: baseOpacity * Math.min(progress * 2, 1),
        offsetX: 0,
        offsetY: (1 - eased) * -200,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
    }

    case "typewriter": {
      const fullText = element.text || "";
      const charCount = Math.floor(fullText.length * progress);
      const currentText = fullText.slice(0, charCount);
      return {
        opacity: baseOpacity,
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        visibleText: currentText,
      };
    }

    case "breathe": {
      const cycle = Math.sin(t * 2);
      const scale = 1 + cycle * 0.04;
      return {
        opacity: baseOpacity,
        offsetX: 0,
        offsetY: 0,
        scaleX: scale,
        scaleY: scale,
        visibleText: element.text,
      };
    }

    case "pulse": {
      const cycle = Math.abs(Math.sin(t * 3));
      const scale = 1 + cycle * 0.08;
      return {
        opacity: baseOpacity,
        offsetX: 0,
        offsetY: 0,
        scaleX: scale,
        scaleY: scale,
        visibleText: element.text,
      };
    }

    case "heartbeat": {
      const mod = (t * 1.5) % 1;
      let scale = 1;
      if (mod < 0.15) {
        scale = 1 + (mod / 0.15) * 0.12;
      } else if (mod < 0.3) {
        scale = 1.12 - ((mod - 0.15) / 0.15) * 0.12;
      } else if (mod < 0.45) {
        scale = 1 + ((mod - 0.3) / 0.15) * 0.08;
      } else if (mod < 0.6) {
        scale = 1.08 - ((mod - 0.45) / 0.15) * 0.08;
      }
      return {
        opacity: baseOpacity,
        offsetX: 0,
        offsetY: 0,
        scaleX: scale,
        scaleY: scale,
        visibleText: element.text,
      };
    }

    default:
      return {
        opacity: baseOpacity,
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
  }
}

function computePageAnimationFallback(
  element: DesignElement,
  t: number,
  pageConfig: PageAnimationConfig
): RenderTransform {
  const baseOpacity = element.opacity ?? 1;
  const progress = Math.min(t / (pageConfig.duration || 4.0), 1);
  const eased = easeOutCubic(progress);

  switch (pageConfig.preset) {
    case "fade":
      return {
        opacity: baseOpacity * eased,
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };

    case "rise":
      return {
        opacity: baseOpacity * eased,
        offsetX: 0,
        offsetY: (1 - eased) * 120,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };

    case "pan": {
      const dir = pageConfig.direction || "left";
      const dx = dir === "left" ? (1 - eased) * -160 : dir === "right" ? (1 - eased) * 160 : 0;
      const dy = dir === "up" ? (1 - eased) * 160 : dir === "down" ? (1 - eased) * -160 : 0;
      return {
        opacity: baseOpacity * eased,
        offsetX: dx,
        offsetY: dy,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
    }

    case "pop": {
      const backEased = easeOutBack(Math.min(t / 1.5, 1));
      return {
        opacity: baseOpacity * Math.min(progress * 2, 1),
        offsetX: 0,
        offsetY: 0,
        scaleX: Math.max(0, backEased),
        scaleY: Math.max(0, backEased),
        visibleText: element.text,
      };
    }

    case "breathe": {
      const cycle = Math.sin(t * 1.8);
      const scale = 1 + cycle * 0.03;
      return {
        opacity: baseOpacity,
        offsetX: 0,
        offsetY: 0,
        scaleX: scale,
        scaleY: scale,
        visibleText: element.text,
      };
    }

    case "stomp": {
      if (t < 0.4) {
        const dropProgress = t / 0.4;
        const scale = 1.4 - dropProgress * 0.4;
        return {
          opacity: baseOpacity * dropProgress,
          offsetX: 0,
          offsetY: 0,
          scaleX: scale,
          scaleY: scale,
          visibleText: element.text,
        };
      }
      return {
        opacity: baseOpacity,
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
    }

    default:
      return {
        opacity: baseOpacity,
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        visibleText: element.text,
      };
  }
}
