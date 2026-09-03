import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Check, 
  X, 
  Download, 
  RefreshCw, 
  RotateCw, 
  Eye, 
  Grid, 
  Type, 
  Sliders, 
  Move,
  Maximize2,
  Trash2,
  Plus
} from "lucide-react";
import { GalleryPhoto } from "../types";

export interface GalleryImageOverlayModalProps {
  isOpen: boolean;
  lang?: "ta" | "en";
  initialImageSrc?: string;
  initialPhoto?: GalleryPhoto | null;
  onSaveToGallery?: (watermarkedDataUrl: string, caption?: string) => Promise<void> | void;
  onApplyForUpload?: (watermarkedDataUrl: string) => void;
  onClose: () => void;
}

type OverlayPosition = 
  | "center" 
  | "top-left" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-right" 
  | "top-center" 
  | "bottom-center"
  | "tile";

export default function GalleryImageOverlayModal({
  isOpen,
  lang = "ta",
  initialImageSrc,
  initialPhoto,
  onSaveToGallery,
  onApplyForUpload,
  onClose
}: GalleryImageOverlayModalProps) {
  const baseImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const watermarkFileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Base Image State
  const [baseImageSrc, setBaseImageSrc] = useState<string>(
    initialImageSrc || initialPhoto?.url || ""
  );

  // 2. Overlay / Watermark Image State
  const [watermarkSrc, setWatermarkSrc] = useState<string>("/tnpa_official_logo.png");
  const [watermarkName, setWatermarkName] = useState<string>(
    lang === "ta" ? "அசல் சங்க லோகோ (TNPA Official)" : "Official Union Logo"
  );
  const [isCustomWatermark, setIsCustomWatermark] = useState<boolean>(false);

  // 3. Transformation Controls
  const [position, setPosition] = useState<OverlayPosition>("bottom-right");
  const [scale, setScale] = useState<number>(25); // percentage of base image width (10% to 80%)
  const [opacity, setOpacity] = useState<number>(0.75); // 0.1 to 1.0
  const [rotation, setRotation] = useState<number>(0); // 0 to 360 deg
  const [offsetX, setOffsetX] = useState<number>(0); // fine tune offset px
  const [offsetY, setOffsetY] = useState<number>(0); // fine tune offset px
  const [blendMode, setBlendMode] = useState<GlobalCompositeOperation>("source-over");

  // 4. Optional Text Banner / Stamp
  const [includeTextStamp, setIncludeTextStamp] = useState<boolean>(true);
  const [customText, setCustomText] = useState<string>("தமிழ்நாடு பெயிண்டர்கள் சங்கம் - TNPA");
  const [textColor, setTextColor] = useState<string>("#FFFFFF");
  const [textBgColor, setTextBgColor] = useState<string>("rgba(0,0,0,0.6)");

  // 5. Processing & Status
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialImageSrc) {
        setBaseImageSrc(initialImageSrc);
      } else if (initialPhoto?.url) {
        setBaseImageSrc(initialPhoto.url);
      }
      
      // Load saved custom watermark if present in localStorage
      const savedWatermark = localStorage.getItem("tnpa_custom_watermark");
      if (savedWatermark) {
        setWatermarkSrc(savedWatermark);
        setWatermarkName(lang === "ta" ? "முந்தைய சேமிக்கப்பட்ட வாட்டர்மார்க்" : "Saved Custom Watermark");
        setIsCustomWatermark(true);
      }
    }
  }, [isOpen, initialImageSrc, initialPhoto, lang]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Trigger Base Image File Picker
  const handleOpenBaseImagePicker = () => {
    if (baseImageFileInputRef.current) {
      baseImageFileInputRef.current.click();
    }
  };

  // Trigger Watermark File Picker (Phone Gallery)
  const handleOpenWatermarkPicker = () => {
    if (watermarkFileInputRef.current) {
      watermarkFileInputRef.current.click();
    }
  };

  // Handle Base Image Selection
  const handleBaseImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert(lang === "ta" ? "படத்தின் அளவு 25MB-க்குள் இருக்க வேண்டும்" : "Image must be under 25MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBaseImageSrc(reader.result);
        showToast(lang === "ta" ? "✓ முதன்மை படம் தேர்ந்தெடுக்கப்பட்டது" : "✓ Base image loaded");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Transparent Watermark PNG selection from Phone Gallery
  const handleWatermarkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("png") && !file.type.includes("image")) {
      alert(
        lang === "ta" 
          ? "தயவுசெய்து வெளிப்படையான (Transparent) PNG படத்தை தேர்வு செய்யவும்." 
          : "Please select a transparent PNG image for best results."
      );
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setWatermarkSrc(reader.result);
        setWatermarkName(file.name);
        setIsCustomWatermark(true);
        // Save to localStorage for quick reuse
        localStorage.setItem("tnpa_custom_watermark", reader.result);
        showToast(
          lang === "ta" 
            ? "✓ போன் கேலரியிலிருந்து வாட்டர்மார்க் PNG பொருத்தப்பட்டது!" 
            : "✓ Watermark PNG loaded from device library!"
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Preset Watermark selector
  const handleSelectPreset = (url: string, name: string) => {
    setWatermarkSrc(url);
    setWatermarkName(name);
    setIsCustomWatermark(false);
    showToast(lang === "ta" ? `✓ ${name} லோகோ அமைக்கப்பட்டது` : `✓ ${name} applied`);
  };

  // Live Canvas Compositing & Rendering
  useEffect(() => {
    if (!isOpen || !baseImageSrc) return;

    let isSubscribed = true;
    setIsRendering(true);

    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = baseImageSrc;

    baseImg.onload = () => {
      if (!isSubscribed) return;

      const wmImg = new Image();
      wmImg.crossOrigin = "anonymous";
      wmImg.src = watermarkSrc;

      wmImg.onload = () => {
        if (!isSubscribed) return;
        renderComposite(baseImg, wmImg);
        setIsRendering(false);
      };

      wmImg.onerror = () => {
        if (!isSubscribed) return;
        renderComposite(baseImg, null);
        setIsRendering(false);
      };
    };

    baseImg.onerror = () => {
      if (!isSubscribed) return;
      setIsRendering(false);
    };

    return () => {
      isSubscribed = false;
    };
  }, [
    isOpen,
    baseImageSrc,
    watermarkSrc,
    position,
    scale,
    opacity,
    rotation,
    offsetX,
    offsetY,
    blendMode,
    includeTextStamp,
    customText,
    textColor,
    textBgColor
  ]);

  // Core Render Function
  const renderComposite = (baseImg: HTMLImageElement, wmImg: HTMLImageElement | null) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match base image
    const width = baseImg.naturalWidth || baseImg.width || 1200;
    const height = baseImg.naturalHeight || baseImg.height || 800;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw base image
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(baseImg, 0, 0, width, height);

    // 2. Draw watermark if present
    if (wmImg) {
      ctx.save();
      ctx.globalAlpha = Math.max(0.05, Math.min(1, opacity));
      ctx.globalCompositeOperation = blendMode;

      // Calculate watermark dimensions based on scale slider (% of image width)
      const targetWmWidth = (width * (scale / 100));
      const wmAspect = (wmImg.naturalWidth || wmImg.width) / (wmImg.naturalHeight || wmImg.height || 1);
      const targetWmHeight = targetWmWidth / wmAspect;

      const padding = Math.max(20, width * 0.03);

      if (position === "tile") {
        // Tiled diagonal pattern across the entire image
        const tileSpacingX = targetWmWidth * 1.8;
        const tileSpacingY = targetWmHeight * 1.8;
        
        for (let x = -width; x < width * 2; x += tileSpacingX) {
          for (let y = -height; y < height * 2; y += tileSpacingY) {
            ctx.save();
            ctx.translate(x + offsetX, y + offsetY);
            ctx.rotate((rotation * Math.PI) / 180 || -0.4);
            ctx.drawImage(
              wmImg,
              -targetWmWidth / 2,
              -targetWmHeight / 2,
              targetWmWidth,
              targetWmHeight
            );
            ctx.restore();
          }
        }
      } else {
        // Single anchor placement
        let drawX = 0;
        let drawY = 0;

        switch (position) {
          case "center":
            drawX = width / 2;
            drawY = height / 2;
            break;
          case "top-left":
            drawX = padding + targetWmWidth / 2;
            drawY = padding + targetWmHeight / 2;
            break;
          case "top-right":
            drawX = width - padding - targetWmWidth / 2;
            drawY = padding + targetWmHeight / 2;
            break;
          case "bottom-left":
            drawX = padding + targetWmWidth / 2;
            drawY = height - padding - targetWmHeight / 2;
            break;
          case "bottom-right":
            drawX = width - padding - targetWmWidth / 2;
            drawY = height - padding - targetWmHeight / 2;
            break;
          case "top-center":
            drawX = width / 2;
            drawY = padding + targetWmHeight / 2;
            break;
          case "bottom-center":
            drawX = width / 2;
            drawY = height - padding - targetWmHeight / 2;
            break;
        }

        // Apply fine offsets
        drawX += (offsetX / 100) * width;
        drawY += (offsetY / 100) * height;

        ctx.translate(drawX, drawY);
        if (rotation !== 0) {
          ctx.rotate((rotation * Math.PI) / 180);
        }

        // Draw shadow for better visibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.drawImage(
          wmImg,
          -targetWmWidth / 2,
          -targetWmHeight / 2,
          targetWmWidth,
          targetWmHeight
        );
      }

      ctx.restore();
    }

    // 3. Draw Optional Text Stamp at bottom
    if (includeTextStamp && customText.trim()) {
      ctx.save();
      const fontSize = Math.max(16, Math.floor(width * 0.024));
      ctx.font = `bold ${fontSize}px sans-serif`;
      
      const textMetrics = ctx.measureText(customText);
      const textWidth = textMetrics.width;
      const textPaddingH = fontSize * 1.2;
      const textPaddingV = fontSize * 0.6;
      const boxWidth = textWidth + textPaddingH * 2;
      const boxHeight = fontSize + textPaddingV * 2;

      const boxX = (width - boxWidth) / 2;
      const boxY = height - boxHeight - Math.max(16, height * 0.03);

      // Draw rounded background for text
      ctx.fillStyle = textBgColor;
      ctx.beginPath();
      const radius = boxHeight / 2;
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
      ctx.fill();

      // Draw subtle border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = textColor;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(customText, width / 2, boxY + boxHeight / 2);

      ctx.restore();
    }
  };

  // Get final rendered composite as Data URL
  const getRenderedDataUrl = (): string => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return "";
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  // Save directly to cloud gallery
  const handleSaveToGallery = async () => {
    const dataUrl = getRenderedDataUrl();
    if (!dataUrl) return;

    if (!onSaveToGallery) {
      handleDownload();
      return;
    }

    setIsSaving(true);
    try {
      await onSaveToGallery(
        dataUrl,
        initialPhoto?.caption || (lang === "ta" ? "வாட்டர்மார்க் இணைக்கப்பட்ட சங்க புகைப்படம்" : "Watermarked Union Photo")
      );
      showToast(lang === "ta" ? "✓ கேலரியில் வெற்றிகரமாக சேமிக்கப்பட்டது!" : "✓ Saved to gallery!");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (e) {
      console.error(e);
      alert(lang === "ta" ? "சேமிப்பதில் பிழை ஏற்பட்டது" : "Error saving watermarked photo");
    } finally {
      setIsSaving(false);
    }
  };

  // Apply to current upload form
  const handleApplyToUpload = () => {
    const dataUrl = getRenderedDataUrl();
    if (!dataUrl) return;

    if (onApplyForUpload) {
      onApplyForUpload(dataUrl);
      showToast(lang === "ta" ? "✓ பதிவேற்ற படிவத்திற்கு அனுப்பப்பட்டது!" : "✓ Applied to upload form!");
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  // Download directly to device
  const handleDownload = () => {
    const dataUrl = getRenderedDataUrl();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `tnpa_watermarked_${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
    showToast(lang === "ta" ? "✓ படம் பதிவிறக்கம் செய்யப்பட்டது!" : "✓ Image downloaded!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      
      {/* Hidden File Pickers */}
      <input
        ref={baseImageFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBaseImageSelect}
        className="hidden"
        id="base-image-picker"
      />
      <input
        ref={watermarkFileInputRef}
        type="file"
        accept="image/png,image/*"
        onChange={handleWatermarkFileSelect}
        className="hidden"
        id="watermark-image-picker"
      />

      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-5xl w-full text-white shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-[#C00000] flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm sm:text-base md:text-lg text-amber-400 flex items-center gap-2">
                <span>{lang === "ta" ? "வாட்டர்மார்க் & லோகோ ஓவர்லே ஸ்டுடியோ" : "Gallery Watermark & Overlay Studio"}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-full">
                  PNG Overlay Tool
                </span>
              </h4>
              <p className="text-[11px] text-stone-400">
                {lang === "ta" 
                  ? "போன் கேலரியிலிருந்து வெளிப்படையான PNG லோகோக்களை புகைப்படத்தின் மீது எளிதாகப் பொருத்தலாம்" 
                  : "Apply transparent PNG watermarks & logos from your phone gallery onto gallery photos"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast alert inside modal */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs font-black px-4 py-2 text-center animate-bounce">
            {toastMsg}
          </div>
        )}

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Left Column: Live Canvas Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{lang === "ta" ? "நேரலை முன்னோட்டம் (Live Canvas)" : "Live Preview"}</span>
              </span>

              <button
                type="button"
                onClick={handleOpenBaseImagePicker}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "ta" ? "முதன்மை படம் மாற்று" : "Change Base Photo"}</span>
              </button>
            </div>

            {/* Canvas Stage Container */}
            <div className="flex-1 min-h-[300px] sm:min-h-[400px] bg-stone-950 border-2 border-stone-800 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group shadow-inner">
              
              {baseImageSrc ? (
                <div className="relative max-w-full max-h-[50vh] flex items-center justify-center">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-2xl border border-stone-800"
                  />
                  {isRendering && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center rounded-xl">
                      <div className="flex items-center gap-2 bg-stone-900/90 text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold border border-stone-700">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{lang === "ta" ? "கலவை செய்யப்படுகிறது..." : "Compositing..."}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center mx-auto text-amber-500">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h6 className="font-bold text-sm text-stone-300">
                    {lang === "ta" ? "புகைப்படம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை" : "No photo selected"}
                  </h6>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    {lang === "ta" ? "உங்கள் போன் கேலரியிலிருந்து ஒரு புகைப்படத்தைத் தேர்ந்தெடுக்கவும்" : "Select a base photo from your device gallery"}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenBaseImagePicker}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow cursor-pointer inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{lang === "ta" ? "போன் கேலரியிலிருந்து படம் தேர்வு" : "Select Photo from Phone"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Presets for Position */}
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                <Move className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "ta" ? "இட அமைப்பு:" : "Position:"}</span>
              </span>

              <div className="flex flex-wrap gap-1">
                {[
                  { id: "bottom-right", label: lang === "ta" ? "வலது கீழ்" : "Bottom Right" },
                  { id: "bottom-left", label: lang === "ta" ? "இடது கீழ்" : "Bottom Left" },
                  { id: "top-right", label: lang === "ta" ? "வலது மேல்" : "Top Right" },
                  { id: "top-left", label: lang === "ta" ? "இடது மேல்" : "Top Left" },
                  { id: "center", label: lang === "ta" ? "மையம்" : "Center" },
                  { id: "tile", label: lang === "ta" ? "முழுதும் (Tile)" : "Tile Full" },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setPosition(pos.id as OverlayPosition)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      position === pos.id
                        ? "bg-[#C00000] text-white shadow-sm"
                        : "bg-stone-800 text-stone-400 hover:text-white"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Overlay Controls & Watermark Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            
            {/* 1. SELECT WATERMARK SOURCE FROM PHONE */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-black text-xs md:text-sm text-stone-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ta" ? "1. வாட்டர்மார்க் PNG தேர்வு" : "1. Select Watermark PNG"}</span>
                </h5>
                
                {isCustomWatermark && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    ✓ கேலரி படம்
                  </span>
                )}
              </div>

              {/* Action Button: Pick from Phone Gallery */}
              <button
                type="button"
                onClick={handleOpenWatermarkPicker}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 via-orange-600 to-[#C00000] hover:brightness-110 active:scale-98 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-amber-400/40"
              >
                <Camera className="w-4 h-4 text-yellow-200" />
                <span>{lang === "ta" ? "📱 போன் கேலரியிலிருந்து PNG தேர்ந்தெடுக்க" : "📱 Pick Transparent PNG from Phone"}</span>
              </button>

              {/* Watermark Presets List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {lang === "ta" ? "அல்லது மாதிரி லோகோ தேர்வு செய்க:" : "Or choose standard preset:"}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset("/tnpa_official_logo.png", "சங்க அசல் லோகோ")}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      watermarkSrc === "/tnpa_official_logo.png"
                        ? "bg-amber-950/60 border-amber-500 text-amber-200"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                    }`}
                  >
                    <img src="/tnpa_official_logo.png" alt="TNPA" className="w-6 h-6 rounded-full object-contain" />
                    <div className="truncate">
                      <span className="text-[11px] font-bold block truncate">சங்க லோகோ</span>
                      <span className="text-[9px] text-stone-500">TNPA Badge</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset("/logo.svg", "அரசு சின்னம்")}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      watermarkSrc === "/logo.svg"
                        ? "bg-amber-950/60 border-amber-500 text-amber-200"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                    }`}
                  >
                    <img src="/logo.svg" alt="Govt" className="w-6 h-6 rounded-full object-contain bg-white/10 p-0.5" />
                    <div className="truncate">
                      <span className="text-[11px] font-bold block truncate">அரசு சின்னம்</span>
                      <span className="text-[9px] text-stone-500">Govt Seal</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Active Watermark Indicator */}
              <div className="p-2 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 truncate">
                  <img src={watermarkSrc} alt="WM" className="w-5 h-5 rounded-full object-contain bg-black/40 border border-stone-700" />
                  <span className="text-stone-300 font-bold truncate">{watermarkName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg cursor-pointer"
                  title="சுழற்று (Rotate 90°)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. OVERLAY ADJUSTMENTS (SLIDERS) */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3.5">
              <h5 className="font-black text-xs md:text-sm text-stone-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>{lang === "ta" ? "2. அளவு & அடர்த்தி அமைப்புகள்" : "2. Scale & Opacity Controls"}</span>
              </h5>

              {/* Size Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-stone-400">{lang === "ta" ? "அளவு (Size)" : "Watermark Scale"}</span>
                  <span className="text-amber-400 font-mono">{scale}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                />
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-stone-400">{lang === "ta" ? "அடர்த்தி (Opacity)" : "Transparency"}</span>
                  <span className="text-amber-400 font-mono">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                />
                
                {/* Opacity Quick Chips */}
                <div className="flex gap-1.5 pt-1">
                  {[
                    { label: "20%", val: 0.20 },
                    { label: "40%", val: 0.40 },
                    { label: "60%", val: 0.60 },
                    { label: "80%", val: 0.80 },
                    { label: "100%", val: 1.0 },
                  ].map((op) => (
                    <button
                      key={op.label}
                      type="button"
                      onClick={() => setOpacity(op.val)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                        Math.abs(opacity - op.val) < 0.04
                          ? "bg-amber-600 text-white font-black"
                          : "bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-stone-400">{lang === "ta" ? "சுழற்சி (Rotation)" : "Angle"}</span>
                  <span className="text-amber-400 font-mono">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                />
              </div>

              {/* Blend Mode Selector */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-stone-400">{lang === "ta" ? "கலவை வடிவம் (Blend Mode)" : "Blend Mode"}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "source-over", label: "Normal" },
                    { id: "multiply", label: "Multiply" },
                    { id: "screen", label: "Screen" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setBlendMode(m.id as GlobalCompositeOperation)}
                      className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        blendMode === m.id
                          ? "bg-stone-800 border-amber-500 text-amber-300"
                          : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. OPTIONAL TEXT STAMP */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTextStamp}
                    onChange={(e) => setIncludeTextStamp(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                  />
                  <span className="font-black text-xs text-stone-200 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === "ta" ? "சங்க உரை முத்திரை (Text Stamp)" : "Include Text Stamp"}</span>
                  </span>
                </label>
              </div>

              {includeTextStamp && (
                <div className="space-y-2 pt-1 animate-[fadeIn_0.2s_ease-out]">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. தமிழ்நாடு பெயிண்டர்கள் சங்கம்"
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs font-bold text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-stone-400">
                    <span>{lang === "ta" ? "உரை நிறம்:" : "Color:"}</span>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!baseImageSrc}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border border-stone-700 transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{lang === "ta" ? "பதிவிறக்கு" : "Download PNG"}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onApplyForUpload && (
              <button
                type="button"
                onClick={handleApplyToUpload}
                disabled={!baseImageSrc}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === "ta" ? "பதிவேற்ற படிவத்திற்கு அனுப்புக" : "Use for Upload"}</span>
              </button>
            )}

            {onSaveToGallery && (
              <button
                type="button"
                onClick={handleSaveToGallery}
                disabled={!baseImageSrc || isSaving}
                className="px-5 py-2 bg-[#C00000] hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === "ta" ? "சேமிக்கப்படுகிறது..." : "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{lang === "ta" ? "கேலரியில் நேரலையாக சேமி" : "Save to Live Gallery"}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              {lang === "ta" ? "மூடுக" : "Close"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
