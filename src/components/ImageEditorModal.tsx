import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  Sparkles, 
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";

interface ImageEditorModalProps {
  isOpen: boolean;
  title: string;
  lang?: "ta" | "en";
  currentImageUrl?: string;
  defaultFallbackUrl?: string;
  aspectRatio?: number; // width / height, e.g. 3/4 for passport, 1/1 for logo, 16/9 for event
  allowRemove?: boolean;
  onSave: (editedImageDataUrl: string) => Promise<void> | void;
  onClose: () => void;
  onRemove?: () => Promise<void> | void;
}

export default function ImageEditorModal({
  isOpen,
  title,
  lang = "ta",
  currentImageUrl,
  defaultFallbackUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300&h=400",
  aspectRatio = 3 / 4,
  allowRemove = true,
  onSave,
  onClose,
  onRemove
}: ImageEditorModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [imageSrc, setImageSrc] = useState<string>(currentImageUrl || defaultFallbackUrl);
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update imageSrc when modal opens or prop changes
  useEffect(() => {
    if (isOpen) {
      setImageSrc(currentImageUrl || defaultFallbackUrl);
      setRotation(0);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setErrorMsg(null);
    }
  }, [isOpen, currentImageUrl, defaultFallbackUrl]);

  if (!isOpen) return null;

  // Immediately trigger file picker
  const handleOpenNativePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image selected from phone file picker / gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Support common image formats
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/heic"];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith("image/")) {
      setErrorMsg(
        lang === "ta" 
          ? "தயவுசெய்து JPG, JPEG, PNG அல்லது WEBP வடிவ படத்தை தேர்ந்தெடுக்கவும்." 
          : "Please select a valid JPG, JPEG, PNG or WEBP image."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
        setRotation(0);
        setZoom(1);
        setPanX(0);
        setPanY(0);
      }
    };
    reader.onerror = () => {
      setErrorMsg(lang === "ta" ? "படத்தை வாசிப்பதில் பிழை ஏற்பட்டது." : "Failed to read image file.");
    };
    reader.readAsDataURL(file);

    // Reset input value so re-selecting same file triggers onChange
    e.target.value = "";
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleRemove = async () => {
    if (confirm(lang === "ta" ? "புகைப்படத்தை அகற்ற விரும்புகிறீர்களா?" : "Are you sure you want to remove this photo?")) {
      setImageSrc(defaultFallbackUrl);
      if (onRemove) {
        await onRemove();
      }
      onClose();
    }
  };

  // Render canvas with rotation, zoom, pan, and compress to compressed JPEG DataURL
  const handleSaveEditedImage = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load image into canvas"));
        img.src = imageSrc;
      });

      // Target canvas output resolution (standard crisp high-res)
      const targetWidth = 600;
      const targetHeight = Math.round(targetWidth / aspectRatio);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.save();
      ctx.translate(targetWidth / 2 + panX, targetHeight / 2 + panY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw centered image
      const imgAspect = img.width / img.height;
      let drawW = targetWidth;
      let drawH = targetWidth / imgAspect;

      if (drawH < targetHeight) {
        drawH = targetHeight;
        drawW = targetHeight * imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Compress output to clean JPEG (~150KB)
      const outputDataUrl = canvas.toDataURL("image/jpeg", 0.88);

      await onSave(outputDataUrl);
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error("Canvas export error:", err);
      setIsSaving(false);
      setErrorMsg(
        err.message || (lang === "ta" ? "படத்தைச் சேமிப்பதில் பிழை ஏற்பட்டது." : "Failed to process and save image.")
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      
      {/* Native File Input (Hidden, triggered directly) */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg,image/png,image/webp,image/jpg" 
        className="hidden" 
      />

      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950 text-white p-4 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm md:text-base text-amber-200">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-stone-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl font-bold">
              {errorMsg}
            </div>
          )}

          {/* Interactive Crop / Preview Box */}
          <div className="flex flex-col items-center justify-center bg-stone-950 p-4 rounded-2xl relative border border-stone-800 min-h-[260px]">
            <div 
              className="relative overflow-hidden bg-stone-900 border-2 border-amber-400 rounded-xl shadow-2xl flex items-center justify-center select-none"
              style={{
                width: aspectRatio > 1 ? "280px" : "200px",
                height: aspectRatio > 1 ? `${280 / aspectRatio}px` : `${200 / aspectRatio}px`
              }}
            >
              <img 
                src={imageSrc} 
                alt="Editing Preview" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-200 pointer-events-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) translate(${panX}px, ${panY}px)`
                }}
              />

              <div className="absolute inset-0 border border-white/40 pointer-events-none rounded-lg" />
            </div>

            <span className="text-[10px] text-stone-400 font-bold mt-2">
              {lang === "ta" ? "நேரலை முன்னோட்டம் (Live Preview)" : "Live Image Preview"}
            </span>
          </div>

          {/* Edit Control Toolbar (Large Touch Buttons for Mobile) */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenNativePicker}
              className="py-2.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4 text-amber-600" />
              <span className="text-[10px]">{lang === "ta" ? "மாற்று" : "Replace"}</span>
            </button>

            <button
              type="button"
              onClick={handleRotate}
              className="py-2.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <RotateCw className="w-4 h-4 text-stone-700" />
              <span className="text-[10px]">{lang === "ta" ? "சுழற்று (90°)" : "Rotate"}</span>
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="py-2.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <ZoomIn className="w-4 h-4 text-stone-700" />
              <span className="text-[10px]">{lang === "ta" ? "பெரிதாக்கு" : "Zoom In"}</span>
            </button>

            <button
              type="button"
              onClick={handleZoomOut}
              className="py-2.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <ZoomOut className="w-4 h-4 text-stone-700" />
              <span className="text-[10px]">{lang === "ta" ? "சிறிதாக்கு" : "Zoom Out"}</span>
            </button>
          </div>

          {/* Quick Action Info Banner */}
          <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <p>
              {lang === "ta"
                ? "கைபேசியில் நேரடியாக கேலரி / கோப்புகளைத் திறந்து புதிய படத்தைத் தேர்ந்தெடுத்து சேமிக்கலாம்."
                : "Tap 'Replace' to immediately open your phone's internal storage or gallery file picker."}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          {allowRemove ? (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{lang === "ta" ? "அகற்று" : "Remove"}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              {lang === "ta" ? "ரத்து" : "Cancel"}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveEditedImage}
              className="px-5 py-2.5 bg-gradient-to-r from-[#b91c1c] via-stone-900 to-amber-600 hover:from-red-700 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>{lang === "ta" ? "சேமிக்கிறது..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ta" ? "சேமி & அமை" : "Save & Apply"}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
