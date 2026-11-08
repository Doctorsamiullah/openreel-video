import React, { useRef, useState } from "react";
import { Upload, Sparkles, Plus, Layers } from "@/icons/lucide-compat";
import { toast } from "../../../../stores/notification-store";
import { DesignElement, DEFAULT_PHOTO_ADJUSTMENTS } from "../types";
import { SAMPLE_ASSETS } from "./sample-assets";

interface UploadsManagerProps {
  onInsertImage: (element: DesignElement) => void;
  onDeconstructPoster?: (imageSrc: string, fileName: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export interface UserUploadedImage {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
}

export const UploadsManager: React.FC<UploadsManagerProps> = ({
  onInsertImage,
  onDeconstructPoster,
  canvasWidth,
  canvasHeight,
}) => {
  const [userUploads, setUserUploads] = useState<UserUploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterDeconstructInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null, isDeconstructMode: boolean = false) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newUpload: UserUploadedImage = {
            id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: dataUrl,
            width: img.naturalWidth || img.width || 600,
            height: img.naturalHeight || img.height || 400,
          };
          setUserUploads((prev) => [newUpload, ...prev]);

          if (isDeconstructMode && onDeconstructPoster) {
            onDeconstructPoster(dataUrl, file.name);
          } else {
            toast.success(`Uploaded "${file.name}"`);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleInsert = (imgData: { url: string; width: number; height: number; name: string }) => {
    const maxWidth = canvasWidth * 0.5;
    const maxHeight = canvasHeight * 0.5;
    const ratio = imgData.width / imgData.height;

    let targetW = maxWidth;
    let targetH = maxWidth / ratio;
    if (targetH > maxHeight) {
      targetH = maxHeight;
      targetW = maxHeight * ratio;
    }

    const newElement: DesignElement = {
      id: `img-${Date.now()}`,
      type: "image",
      x: (canvasWidth - targetW) / 2,
      y: (canvasHeight - targetH) / 2,
      width: Math.round(targetW),
      height: Math.round(targetH),
      rotation: 0,
      opacity: 1,
      zIndex: Date.now(),
      src: imgData.url,
      originalWidth: imgData.width,
      originalHeight: imgData.height,
      adjustments: { ...DEFAULT_PHOTO_ADJUSTMENTS },
    };

    onInsertImage(newElement);
    toast.info(`Inserted "${imgData.name}" onto canvas`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-fg-3">
          Uploads & Images
        </span>
        <span className="text-[10px] text-fg-muted font-mono">
          PNG, JPG, SVG, WebP
        </span>
      </div>

      {/* Magic Layers Upload & Deconstruct Button */}
      <div className="rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm">
            <Layers size={15} />
          </div>
          <div>
            <span className="text-xs font-bold text-fg block">Magic Layers Deconstruction</span>
            <span className="text-[10px] text-fg-muted">Upload any flat poster & turn text/photos editable</span>
          </div>
        </div>
        <input
          type="file"
          ref={posterDeconstructInputRef}
          onChange={(e) => processFiles(e.target.files, true)}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => posterDeconstructInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all"
        >
          <Sparkles size={13} />
          <span>Upload Poster to Deconstruct</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-purple-500 bg-purple-500/15"
            : "border-border bg-bg-2 hover:border-purple-500/60 hover:bg-bg-3"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => processFiles(e.target.files, false)}
          accept="image/*"
          multiple
          className="hidden"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform mb-2">
          <Upload size={22} />
        </div>
        <span className="text-xs font-bold text-fg group-hover:text-purple-400 transition-colors">
          Upload photo or asset
        </span>
        <span className="text-[11px] text-fg-muted mt-0.5">
          Drag and drop or browse files
        </span>
      </div>

      {/* User Uploads Grid */}
      {userUploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg">Your Uploads ({userUploads.length})</span>
            <button
              type="button"
              onClick={() => setUserUploads([])}
              className="text-[10px] text-fg-muted hover:text-rose-400 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {userUploads.map((up) => (
              <div
                key={up.id}
                className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-bg-2 hover:border-purple-500 hover:shadow-md transition-all"
              >
                <img src={up.url} alt={up.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 p-1 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleInsert(up)}
                    className="flex w-full items-center justify-center gap-1 rounded bg-purple-600/90 hover:bg-purple-500 py-1 text-[10px] font-bold text-white shadow-sm"
                  >
                    <Plus size={11} />
                    <span>Insert</span>
                  </button>
                  {onDeconstructPoster && (
                    <button
                      type="button"
                      onClick={() => onDeconstructPoster(up.url, up.name)}
                      className="flex w-full items-center justify-center gap-1 rounded bg-pink-600/90 hover:bg-pink-500 py-1 text-[9px] font-bold text-white shadow-sm"
                    >
                      <Layers size={10} />
                      <span>Deconstruct</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preloaded Medical & Stock Assets */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            Medical & Poster Assets
          </span>
          <span className="text-[10px] text-fg-muted">Ready-to-use</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_ASSETS.map((asset) => (
            <div
              key={asset.id}
              onClick={() => handleInsert({ url: asset.src, width: asset.width, height: asset.height, name: asset.name })}
              className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border border-border bg-bg-2 hover:border-purple-500 hover:shadow-md transition-all"
              title={`Click to insert ${asset.name}`}
            >
              <img src={asset.src} alt={asset.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-1 transition-opacity">
                <Plus size={18} className="text-white drop-shadow mb-0.5" />
                <span className="text-[9px] text-white font-medium text-center truncate w-full px-1">
                  {asset.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
