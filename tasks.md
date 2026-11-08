# Production-Ready Hybrid Graphic Design Platform Deployment Plan (Canva + Photoshop)

> **Document:** `tasks.md`  
> **Target Application:** SAMI Graphic Design Studio (OpenReel Monorepo)  
> **Architecture:** Next.js / React 19 + TypeScript + Tailwind CSS + Zustand + Canvas / Fabric-style Vector Compositor & Raster Filter Pipeline  

---

## 1. Architectural Blueprint & Component Decomposition

```
apps/web/src/
├── components/editor/design-studio/
│   ├── types.ts                      # Multi-layer element schema, photo adjustments, canvas format presets
│   ├── DesignNavbar.tsx              # Format preset switcher, document title, undo/redo, PNG export, video sync
│   ├── LeftSidebar.tsx               # Canva-style tab rail (Templates, Elements, Text, Uploads, Brand, Layers)
│   ├── MainWorkspace.tsx             # Interactive central canvas, 8-handle bounding box, floating quick toolbar, zoom/pan
│   ├── ElementInspector.tsx          # Real-time text two-way binding, shape geometry, precise X/Y/W/H coordinates
│   ├── PhotoFilters.tsx              # Photoshop-style raster photo adjustments (Brightness, Contrast, Saturation, Blur, Warmth)
│   ├── FloatingActionBar.tsx         # Contextual object toolbar (Duplicate, Delete, Lock, Flip H/V, Layer order)
│   ├── uploads/
│   │   ├── UploadsManager.tsx        # Drag-and-drop HTML5 File API reader, local Object URLs, click/drag to canvas
│   │   └── sample-assets.ts          # Medical poster assets: Doctor portrait, Hospital exterior, Lungs diagram, Badges
│   └── templates/
│       ├── medical-poster-template.ts# Faithful multi-layer replica of user's "Multicare Hospital" Hindi medical poster
│       └── starter-templates.ts      # Retail discount sale, YouTube thumbnail, Festival greetings, Education
├── pages/
│   └── DesignStudioPage.tsx          # Full-screen dedicated page hosting the hybrid design studio
└── pages/
    └── DesignStudioPage.test.tsx     # Comprehensive test suite covering uploads, bounding boxes, filters, exports
```

---

## 2. Iterative Implementation Checklist

- [x] **Phase 1: Foundation & Data Model (`types.ts`)**
  - Define `DesignElement` supporting text, vector shapes, raster images, and medical poster badges.
  - Define `PhotoAdjustments` (brightness, contrast, saturation, warmth, blur, sharpness, vignette).
  - Define `CanvasDimensions` and standard size presets (A4 Flyer, Instagram 1:1, Story 9:16, YouTube 16:9).

- [x] **Phase 2: Medical Poster Template & Sample Assets (`sample-assets.ts` & `medical-poster-template.ts`)**
  - High-res vector and image representations for the user's uploaded "Multicare Hospital - Care with Compassion" medical flyer.
  - Layered typography with `Noto Sans Devanagari` (Hindi) and `Montserrat`/`Inter` (Latin).
  - Layered doctor portrait, hospital exterior photo, and respiratory lungs anatomy diagram.

- [x] **Phase 3: Uploads & Picture Management Engine (`UploadsManager.tsx`)**
  - Drag-and-drop zone with instant HTML5 File API handling and local `URL.createObjectURL`.
  - Click-to-insert or drag-to-canvas instantiating bounded `fabric.Image`-style layers with scale/rotate handles.
  - Preloaded stock & medical icon gallery for one-click insertion.

- [x] **Phase 4: Photoshop-Grade Raster Photo Adjustments (`PhotoFilters.tsx`)**
  - Non-destructive image adjustments: Brightness, Contrast, Saturation, Warmth, Blur, Vignette.
  - WebGL / Canvas 2D convolution filters and CSS filter matrix pipeline.
  - Orientation controls (Flip Horizontal, Flip Vertical, $90^\circ$ CW/CCW rotation).

- [x] **Phase 5: Canvas Core & Interactive Bounding Boxes (`MainWorkspace.tsx` & `FloatingActionBar.tsx`)**
  - 8-point interactive resize handles (NW, N, NE, E, SE, S, SW, W) + rotation handle node (`↻`).
  - Contextual floating action bar positioned directly above active layer (Duplicate, Delete, Lock, Flip, Layer Position).
  - Smart alignment guidelines, drag-and-drop re-positioning, and viewport zoom (25% - 200%).

- [x] **Phase 6: Real-Time Two-Way Element Inspector (`ElementInspector.tsx`)**
  - Live two-way bound Text Content editor with instantaneous canvas re-rendering.
  - Typography controls: Google Fonts selector (`Montserrat`, `Inter`, `Noto Sans Devanagari`, `Playfair Display`), weights, font sizes, text alignments.
  - Geometry inputs: Exact pixel $X$, $Y$, Width, Height, and Rotation inputs.
  - Granular layer index controls: Bring Forward, Send Backward, Bring to Front, Send to Back.

- [x] **Phase 7: High-Resolution Clean PNG Export Pipeline (`DesignNavbar.tsx`)**
  - Export pipeline that renders canvas without workspace guides, selection handles, or bounding boxes.
  - "Add to Video Timeline" handoff creating an image asset clip on the video timeline.

- [x] **Phase 8: Build Validation & Headless Test Verification**
  - Typecheck across `@openreel/web` (`tsc --noEmit`).
  - Vitest test suite validation covering template loading, image uploads, photo filter adjustments, and PNG export.
