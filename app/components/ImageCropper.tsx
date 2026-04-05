"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface ImageCropperProps {
  imageSrc: string;
  aspect?: number; // e.g. 1 for square, 16/9 for wide. undefined = free
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  circular?: boolean; // circular crop guide (for profile pics)
}

async function getCroppedImage(imageSrc: string, pixelCrop: Area, rotation: number): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const radians = (rotation * Math.PI) / 180;

  // Calculate bounding box of rotated image
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const rotW = image.width * cos + image.height * sin;
  const rotH = image.width * sin + image.height * cos;

  // Draw rotated full image on temp canvas
  canvas.width = rotW;
  canvas.height = rotH;
  ctx.translate(rotW / 2, rotH / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  // Extract the cropped area
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.92);
  });
}

export default function ImageCropper({ imageSrc, aspect: initialAspect, onCropComplete, onCancel, circular }: ImageCropperProps) {
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [originalAspect, setOriginalAspect] = useState<number | undefined>(undefined);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const onCropChange = useCallback((location: { x: number; y: number }) => setCrop(location), []);
  const onZoomChange = useCallback((z: number) => setZoom(z), []);

  const handleCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!croppedArea) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImage(imageSrc, croppedArea, rotation);
      onCropComplete(blob);
    } catch {
      // crop failed - submit original
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      onCropComplete(blob);
    } finally {
      setProcessing(false);
    }
  }, [croppedArea, imageSrc, rotation, onCropComplete]);

  const handleRotate = useCallback((deg: number) => {
    setRotation((prev) => (prev + deg) % 360);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
          <span className="material-symbols-outlined text-lg">close</span>
          Cancel
        </button>
        <h3 className="text-white font-semibold text-sm">Crop & Adjust</h3>
        <button
          onClick={handleConfirm}
          disabled={processing}
          className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50"
        >
          {processing ? "Processing..." : "Done"}
        </button>
      </div>

      {/* Crop area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect || originalAspect}
          cropShape={circular ? "round" : "rect"}
          showGrid={!circular}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={handleCropComplete}
          onMediaLoaded={(mediaSize) => {
            const ratio = mediaSize.width / mediaSize.height;
            setOriginalAspect(ratio);
            if (!initialAspect) setAspect(ratio);
          }}
        />
      </div>

      {/* Controls */}
      <div className="shrink-0 px-6 py-5 space-y-4">
        {/* Rotate buttons */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => handleRotate(-90)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors" title="Rotate left">
            <span className="material-symbols-outlined text-xl">rotate_left</span>
          </button>
          <button onClick={() => handleRotate(90)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors" title="Rotate right">
            <span className="material-symbols-outlined text-xl">rotate_right</span>
          </button>
          {rotation !== 0 && (
            <button onClick={() => setRotation(0)} className="px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium hover:bg-white/20 transition-colors">
              Reset ({rotation})
            </button>
          )}
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-4 max-w-md mx-auto w-full">
          <span className="material-symbols-outlined text-white/50 text-lg">photo_size_select_small</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 appearance-none bg-white/20 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="material-symbols-outlined text-white/50 text-lg">photo_size_select_large</span>
        </div>

        {/* Aspect Ratio Buttons */}
        {!circular && (
          <div className="flex justify-center gap-2 pt-2 border-t border-white/10 mt-2">
            <button onClick={() => setAspect(originalAspect)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${aspect === originalAspect ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>Original</button>
            <button onClick={() => setAspect(1)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${aspect === 1 ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>1:1 Square</button>
            <button onClick={() => setAspect(4 / 5)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${aspect === 4 / 5 ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>4:5 Portrait</button>
            <button onClick={() => setAspect(16 / 9)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${aspect === 16 / 9 ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>16:9 Landscape</button>
            <button onClick={() => setAspect(9 / 16)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${aspect === 9 / 16 ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>9:16 Reel</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
