/**
 * Sample preloaded raster and vector graphic assets for the design studio.
 * These enable instant drag-and-drop or one-click insertion without requiring external uploads.
 */

export interface SampleAsset {
  id: string;
  name: string;
  category: "Medical" | "People" | "Icons" | "Badges";
  src: string;
  width: number;
  height: number;
}

export const SAMPLE_ASSETS: SampleAsset[] = [
  {
    id: "doctor-portrait-1",
    name: "Doctor Specialist Portrait",
    category: "Medical",
    src: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80",
    width: 600,
    height: 700,
  },
  {
    id: "hospital-exterior-1",
    name: "Modern Hospital Clinic",
    category: "Medical",
    src: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80",
    width: 800,
    height: 500,
  },
  {
    id: "lungs-anatomy-diagram",
    name: "Human Respiratory Lungs Anatomy",
    category: "Medical",
    src: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop&q=80",
    width: 600,
    height: 600,
  },
  {
    id: "patient-consultation",
    name: "Patient Consultation",
    category: "People",
    src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
    width: 800,
    height: 550,
  },
  {
    id: "tech-creator-photo",
    name: "Creator Gaming Workspace",
    category: "People",
    src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    width: 800,
    height: 500,
  },
  {
    id: "sale-banner-photo",
    name: "Fashion Retail Collection",
    category: "Badges",
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
    width: 800,
    height: 500,
  },
];
