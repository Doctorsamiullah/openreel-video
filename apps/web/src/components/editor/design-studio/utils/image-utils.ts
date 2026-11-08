/**
 * Image Processing & PDF Export Utilities for SAMI Video & Design Studio
 * Fully offline, non-destructive, supports JPG, PNG, WebP with EXIF orientation normalization.
 */

export interface NormalizedImageResult {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Normalizes an uploaded image file (JPG, PNG, WebP) with automatic EXIF rotation fix.
 * Uses createImageBitmap when available which automatically respects EXIF orientation tags.
 */
export async function normalizeImageFile(file: File | Blob): Promise<NormalizedImageResult> {
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch (e) {
    // Fallback if createImageBitmap fails on certain formats
  }

  if (bitmap) {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const width = bitmap.width;
      const height = bitmap.height;
      bitmap.close();
      return { dataUrl, width, height };
    }
    bitmap.close();
  }

  // Fallback to FileReader + Image
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl,
          width: img.naturalWidth || img.width || 800,
          height: img.naturalHeight || img.height || 600,
        });
      };
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generates a valid, standards-compliant PDF (v1.4) directly from a canvas element.
 * 100% offline, zero third-party dependencies, works across all PDF viewers.
 */
export function generatePdfBlobFromCanvas(
  canvas: HTMLCanvasElement,
  quality: number = 0.95
): Blob {
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const base64Data = dataUrl.split(",")[1];
  const binaryString = atob(base64Data);
  const imgLen = binaryString.length;
  const imgBytes = new Uint8Array(imgLen);
  for (let i = 0; i < imgLen; i++) {
    imgBytes[i] = binaryString.charCodeAt(i);
  }

  // Dimensions in points (1 pt = 1/72 inch). Standard 96 DPI screen scale to 72 DPI points:
  const ptWidth = Math.round((canvas.width / 96) * 72);
  const ptHeight = Math.round((canvas.height / 96) * 72);

  const header = `%PDF-1.4\n`;
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptWidth} ${ptHeight}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`;
  const contentStream = `q\n${ptWidth} 0 0 ${ptHeight} 0 0 cm\n/Im1 Do\nQ\n`;
  const obj4 = `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;
  const obj5Header = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLen} >>\nstream\n`;
  const obj5Footer = `\nendstream\nendobj\n`;

  const enc = new TextEncoder();
  const chunkHeader = enc.encode(header);
  const chunk1 = enc.encode(obj1);
  const chunk2 = enc.encode(obj2);
  const chunk3 = enc.encode(obj3);
  const chunk4 = enc.encode(obj4);
  const chunk5H = enc.encode(obj5Header);
  const chunk5F = enc.encode(obj5Footer);

  let offset = chunkHeader.length;
  const off1 = offset; offset += chunk1.length;
  const off2 = offset; offset += chunk2.length;
  const off3 = offset; offset += chunk3.length;
  const off4 = offset; offset += chunk4.length;
  const off5 = offset; offset += chunk5H.length + imgBytes.length + chunk5F.length;

  const xref = `xref\n0 6\n0000000000 65535 f \n${String(off1).padStart(10, "0")} 00000 n \n${String(off2).padStart(10, "0")} 00000 n \n${String(off3).padStart(10, "0")} 00000 n \n${String(off4).padStart(10, "0")} 00000 n \n${String(off5).padStart(10, "0")} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;
  const chunkXref = enc.encode(xref + trailer);

  return new Blob(
    [chunkHeader, chunk1, chunk2, chunk3, chunk4, chunk5H, imgBytes, chunk5F, chunkXref],
    { type: "application/pdf" }
  );
}
