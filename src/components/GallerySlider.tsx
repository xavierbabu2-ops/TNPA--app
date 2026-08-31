import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Video, 
  Camera, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Smartphone, 
  Maximize2, 
  Volume2, 
  Share2, 
  Download, 
  Film, 
  Check,
  Eye,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { UserAccount, GalleryPhoto, GalleryVideo } from "../types";
import { 
  subscribeToGalleryPhotos, 
  saveGalleryPhotoToFirestore, 
  deleteGalleryPhotoFromFirestore,
  clearAllGalleryPhotosFromFirestore,
  subscribeToGalleryVideos, 
  saveGalleryVideoToFirestore, 
  deleteGalleryVideoFromFirestore,
  clearAllGalleryVideosFromFirestore
} from "../lib/syncService";
import { safeSpeak, safeCancelSpeech } from "../utils/safeSpeech";

interface GallerySliderProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  isSuperAdmin?: boolean;
  onAddAuditLog: (action: string, details: string) => void;
}

// Convert any YouTube link (watch, youtu.be, shorts) to an embed URL
function getEmbedVideoUrl(url: string): string {
  if (!url) return "";
  try {
    if (url.includes("youtube.com/shorts/")) {
      const parts = url.split("youtube.com/shorts/");
      const id = parts[1]?.split("?")[0]?.split("&")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      const id = parts[1]?.split("?")[0]?.split("&")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtube.com/watch")) {
      const match = url.match(/[?&]v=([^&]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
  } catch (e) {
    console.warn("Error parsing video URL:", e);
  }
  return url;
}

export default function GallerySlider({ 
  lang, 
  currentUser, 
  isSuperAdmin: propIsSuperAdmin,
  onAddAuditLog 
}: GallerySliderProps) {
  const [activeMedia, setActiveMedia] = useState<"photo" | "video">("video");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showSuperAdminEditor, setShowSuperAdminEditor] = useState(false);

  // Photos & Videos state with Live Real-time Cloud Sync (Initial is clean empty array)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modal Lightbox states
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<GalleryPhoto | null>(null);
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<GalleryVideo | null>(null);

  // Form states for new Photo
  const [photoSourceType, setPhotoSourceType] = useState<"file" | "url">("file");
  const [newPhotoFileBase64, setNewPhotoFileBase64] = useState<string>("");
  const [newPhotoFileName, setNewPhotoFileName] = useState<string>("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [newPhotoCaptionEn, setNewPhotoCaptionEn] = useState("");

  // Form states for new Video
  const [videoSourceType, setVideoSourceType] = useState<"file" | "url">("file");
  const [newVideoFileBase64, setNewVideoFileBase64] = useState<string>("");
  const [newVideoFileName, setNewVideoFileName] = useState<string>("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoTitleEn, setNewVideoTitleEn] = useState("");
  const [newVideoDesc, setNewVideoDesc] = useState("");
  const [newVideoDuration, setNewVideoDuration] = useState("05:00");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>("");

  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = propIsSuperAdmin !== undefined 
    ? propIsSuperAdmin 
    : (currentUser?.role === "super_admin" || currentUser?.role?.includes("admin"));

  // Realtime subscription to Firestore gallery photos & videos
  useEffect(() => {
    setIsSyncing(true);
    const unsubPhotos = subscribeToGalleryPhotos((cloudPhotos) => {
      setPhotos(cloudPhotos || []);
      setIsSyncing(false);
    });

    const unsubVideos = subscribeToGalleryVideos((cloudVideos) => {
      setVideos(cloudVideos || []);
      setIsSyncing(false);
    });

    return () => {
      unsubPhotos();
      unsubVideos();
    };
  }, []);

  const handleNextPhoto = () => {
    if (photos.length === 0) return;
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    if (photos.length === 0) return;
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Helper to upload media file to backend server
  const uploadMediaToServer = async (base64: string, fileName: string, mediaType: "video" | "photo"): Promise<string> => {
    try {
      const resp = await fetch("/api/media/upload-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataBase64: base64,
          fileName,
          mediaType
        })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.url) {
          return json.url;
        }
      }
    } catch (e) {
      console.warn("Backend media upload failed, falling back to local base64/blob:", e);
    }
    return base64;
  };

  // Handle mobile gallery photo selection
  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert(lang === "ta" ? "படத்தின் அளவு 25MB-க்குள் இருக்க வேண்டும்" : "Image size must be under 25MB");
      return;
    }

    setNewPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setNewPhotoFileBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle mobile phone video selection
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert(lang === "ta" ? "வீடியோ கோப்பின் அளவு 100MB-க்குள் இருக்க வேண்டும்" : "Video file size must be under 100MB");
      return;
    }

    setNewVideoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setNewVideoFileBase64(base64);
    };
    reader.readAsDataURL(file);

    // Auto-detect video duration
    try {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.src = URL.createObjectURL(file);
      tempVideo.onloadedmetadata = () => {
        URL.revokeObjectURL(tempVideo.src);
        const minutes = Math.floor(tempVideo.duration / 60);
        const seconds = Math.floor(tempVideo.duration % 60);
        const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        setNewVideoDuration(formatted);
      };
    } catch (e) {
      console.warn("Could not calculate duration:", e);
    }
  };

  // Add new photo with cloud synchronization
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert(lang === "ta" ? "⚠️ சூப்பர் அட்மின் மட்டுமே புகைப்படங்களை சேர்க்க முடியும்!" : "⚠️ Super Admin access required!");
      return;
    }

    if (photoSourceType === "file" && !newPhotoFileBase64) {
      alert(lang === "ta" ? "தயவுசெய்து மொபைல் கேலரியிலிருந்து படம் தேர்ந்தெடுக்கவும்." : "Please select an image from gallery.");
      return;
    }
    if (photoSourceType === "url" && !newPhotoUrl.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து புகைப்படத்தின் இணைய முகவரியை (URL) உள்ளிடவும்." : "Please enter the photo URL.");
      return;
    }
    if (!newPhotoCaption.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து படத்திற்கான தலைப்பை உள்ளிடவும்." : "Please enter a caption for the photo.");
      return;
    }

    setIsSubmitting(true);
    setUploadStatusText(lang === "ta" ? "புகைப்படம் சேமிக்கப்படுகிறது..." : "Saving photo to cloud...");
    setUploadProgress(40);

    let finalUrl = newPhotoUrl.trim();
    if (photoSourceType === "file" && newPhotoFileBase64) {
      finalUrl = await uploadMediaToServer(newPhotoFileBase64, newPhotoFileName, "photo");
      setUploadProgress(80);
    }

    const newP: GalleryPhoto = {
      id: `photo_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      url: finalUrl,
      caption: newPhotoCaption.trim(),
      captionEn: newPhotoCaptionEn.trim() || newPhotoCaption.trim(),
      uploadedAt: new Date().toISOString()
    };

    // Save to Firestore for worldwide realtime reflection
    await saveGalleryPhotoToFirestore(newP);
    setPhotos(prev => [newP, ...prev.filter(p => p.id !== newP.id)]);
    setActivePhotoIdx(0);
    onAddAuditLog("Media Gallery Photo Published", `Super Admin published photo: ${newPhotoCaption}`);

    // Reset inputs
    setNewPhotoFileBase64("");
    setNewPhotoFileName("");
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    setNewPhotoCaptionEn("");
    if (photoFileInputRef.current) photoFileInputRef.current.value = "";
    setUploadProgress(100);
    setIsSubmitting(false);

    alert(lang === "ta" ? "✓ புகைப்படம் வெற்றிகரமாக பதிவேற்றப்பட்டது! அனைத்து உறுப்பினர்களுக்கும் உடனடியாக பிரதிபலிக்கிறது." : "✓ Photo published and live synced to all union members worldwide!");
  };

  // Delete single photo
  const handleDeletePhoto = async (id: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm(lang === "ta" ? "இந்த புகைப்படத்தை சங்க ஊடக அரங்கிலிருந்து நீக்க விரும்புகிறீர்களா?" : "Are you sure you want to delete this photo?")) {
      await deleteGalleryPhotoFromFirestore(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
      setActivePhotoIdx(0);
      onAddAuditLog("Media Gallery Photo Deleted", `Deleted photo ID: ${id}`);
    }
  };

  // Add new video with cloud synchronization
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert(lang === "ta" ? "⚠️ சூப்பர் அட்மின் மட்டுமே காணொளிகளை சேர்க்க முடியும்!" : "⚠️ Super Admin access required!");
      return;
    }

    if (!newVideoTitle.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து வீடியோவின் தலைப்பை உள்ளிடவும்." : "Please enter a video title.");
      return;
    }

    if (videoSourceType === "file" && !newVideoFileBase64) {
      alert(lang === "ta" ? "தயவுசெய்து மொபைலிலிருந்து வீடியோவை தேர்வு செய்யவும்." : "Please select a video file.");
      return;
    }
    if (videoSourceType === "url" && !newVideoUrl.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து வீடியோ லிங்கை (YouTube / URL) உள்ளிடவும்." : "Please enter a video link.");
      return;
    }

    setIsSubmitting(true);
    setUploadStatusText(lang === "ta" ? "வீடியோ பதிவேற்றப்பட்டு ஒத்திசைக்கப்படுகிறது..." : "Uploading video and broadcasting to cloud...");
    setUploadProgress(35);

    let finalVideoUrl = newVideoUrl.trim();
    if (videoSourceType === "file" && newVideoFileBase64) {
      finalVideoUrl = await uploadMediaToServer(newVideoFileBase64, newVideoFileName, "video");
      setUploadProgress(85);
    }

    const newV: GalleryVideo = {
      id: `video_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: newVideoTitle.trim(),
      titleEn: newVideoTitleEn.trim() || newVideoTitle.trim(),
      desc: newVideoDesc.trim() || (lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் சங்க அதிகாரப்பூர்வ காணொளி" : "TNPA Official Video"),
      descEn: "TNPA Official Video Broadcast",
      duration: newVideoDuration || "05:00",
      videoUrl: finalVideoUrl,
      uploadedAt: new Date().toISOString()
    };

    // Save to Firestore for worldwide realtime reflection
    await saveGalleryVideoToFirestore(newV);
    setVideos(prev => [newV, ...prev.filter(v => v.id !== newV.id)]);
    onAddAuditLog("Media Gallery Video Published", `Super Admin published video: ${newVideoTitle}`);

    // Reset inputs
    setNewVideoFileBase64("");
    setNewVideoFileName("");
    setNewVideoUrl("");
    setNewVideoTitle("");
    setNewVideoTitleEn("");
    setNewVideoDesc("");
    setNewVideoDuration("05:00");
    if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    setUploadProgress(100);
    setIsSubmitting(false);

    alert(lang === "ta" ? "✓ காணொளி வெற்றிகரமாக பதிவேற்றப்பட்டது! அனைத்து பயனர்களுக்கும் நேரலையாகத் தோன்றும்." : "✓ Video published and live synced to all union members worldwide!");
  };

  // Delete single video
  const handleDeleteVideo = async (id: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm(lang === "ta" ? "இந்த வீடியோவை சங்க ஊடக அரங்கிலிருந்து நீக்க விரும்புகிறீர்களா?" : "Are you sure you want to delete this video?")) {
      await deleteGalleryVideoFromFirestore(id);
      setVideos(prev => prev.filter(v => v.id !== id));
      onAddAuditLog("Media Gallery Video Deleted", `Deleted video ID: ${id}`);
    }
  };

  // Purge all old mock media completely from Firestore
  const handlePurgeAllMockMedia = async () => {
    if (!isSuperAdmin) return;
    if (window.confirm(lang === "ta" ? "அனைத்து மாதிரி புகைப்படங்கள் மற்றும் வீடியோக்களையும் சங்க ஊடக அரங்கிலிருந்து முழுமையாக நீக்க விரும்புகிறீர்களா? (நீங்கள் பதிவேற்றும் புதிய வீடியோக்கள் மட்டுமே இருக்கும்)" : "Are you sure you want to clear all existing media from the gallery? Only your new uploads will remain.")) {
      setIsSubmitting(true);
      await clearAllGalleryPhotosFromFirestore();
      await clearAllGalleryVideosFromFirestore();
      setPhotos([]);
      setVideos([]);
      setActivePhotoIdx(0);
      setIsSubmitting(false);
      onAddAuditLog("Media Gallery Reset", "Super Admin purged all existing mock photos and videos from gallery");
      alert(lang === "ta" ? "✓ மாதிரி புகைப்படங்கள் மற்றும் வீடியோக்கள் அனைத்தும் முழுமையாக நீக்கப்பட்டுவிட்டன. இப்போது உங்கள் புதிய வீடியோக்களைப் பதிவேற்றலாம்." : "✓ All previous media cleared. You can now upload your official videos and photos.");
    }
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-4 sm:p-6 md:p-8 shadow-md max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-[#b91c1c] text-white rounded-2xl shadow-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-stone-900 text-base md:text-lg flex items-center gap-2">
              <span>{lang === "ta" ? "சங்க ஊடக அரங்கு (Media Gallery)" : "Union Media Gallery"}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {lang === "ta" ? "நேரலை ஒத்திசைவு" : "Live Synced"}
              </span>
            </h4>
            <p className="text-xs text-stone-500">
              {lang === "ta" 
                ? "📱 சூப்பர் அட்மின் பதிவேற்றும் காணொளிகள் & புகைப்படங்கள் அனைத்து உறுப்பினர்களுக்கும் உடனடியாகப் பிரதிபலிக்கும்" 
                : "📱 Official videos & photos uploaded by Super Admin reflect live to all members worldwide"}
            </p>
          </div>
        </div>

        {/* Media Switcher & Admin Button */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              id="gallery-tab-videos"
              onClick={() => setActiveMedia("video")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMedia === "video" 
                  ? "bg-[#b91c1c] text-white shadow-sm" 
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "காணொளிகள்" : "Videos"} ({videos.length})</span>
            </button>
            <button
              id="gallery-tab-photos"
              onClick={() => setActiveMedia("photo")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMedia === "photo" 
                  ? "bg-[#b91c1c] text-white shadow-sm" 
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "புகைப்படங்கள்" : "Photos"} ({photos.length})</span>
            </button>
          </div>

          {isSuperAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                id="superadmin-add-media-btn"
                onClick={() => setShowSuperAdminEditor(!showSuperAdminEditor)}
                className="px-3.5 py-2 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{showSuperAdminEditor ? (lang === "ta" ? "எடிட்டர் மூடுக" : "Close Editor") : (lang === "ta" ? "+ புதிய மீடியா பதிவேற்றுக" : "+ Upload Media")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUPER ADMIN EXCLUSIVE MEDIA EDITOR PANEL */}
      {isSuperAdmin && showSuperAdminEditor && (
        <div className="bg-gradient-to-br from-rose-50/90 via-amber-50/40 to-stone-50 border-2 border-rose-400/50 rounded-3xl p-5 md:p-6 space-y-6 animate-[fadeIn_0.3s_ease-out] shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-rose-200/80 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-rose-600 text-white rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h5 className="font-black text-rose-950 text-sm md:text-base">
                  {lang === "ta" ? "சூப்பர் அட்மின் பிரத்யேக மீடியா மேலாண்மை மையம்" : "Super Admin Exclusive Media Management Studio"}
                </h5>
                <p className="text-[11px] text-rose-700 font-medium">
                  {lang === "ta" 
                    ? "மொபைல் கேலரி அல்லது இணையத்திலிருந்து வீடியோக்கள் & புகைப்படங்களை நேரடியாக பதிவேற்றலாம். இவை உடனடியாக அனைத்து பயனர்களுக்கும் தெரியும்." 
                    : "Upload device videos & photos or video links. Changes reflect globally in real-time."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(photos.length > 0 || videos.length > 0) && (
                <button
                  type="button"
                  onClick={handlePurgeAllMockMedia}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-600 text-rose-800 hover:text-white rounded-xl text-[11px] font-black flex items-center gap-1 border border-rose-300 transition-all cursor-pointer"
                  title={lang === "ta" ? "அனைத்து மீடியாக்களையும் நீக்க" : "Purge all media"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "அனைத்தையும் நீக்கு" : "Purge All"}</span>
                </button>
              )}
              <span className="text-[10px] font-black bg-rose-200 text-rose-900 px-3 py-1 rounded-full uppercase tracking-wider">
                {lang === "ta" ? "அட்மின் அனுமதி" : "Super Admin"}
              </span>
            </div>
          </div>

          {/* Upload Progress Bar if active */}
          {isSubmitting && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl space-y-1.5 animate-pulse">
              <div className="flex justify-between text-xs font-black text-amber-900">
                <span>{uploadStatusText || (lang === "ta" ? "பதிவேற்றப்படுகிறது..." : "Uploading...")}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                <div className="bg-[#b91c1c] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. ADD VIDEO CARD (Primary) */}
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h6 className="font-black text-xs md:text-sm text-stone-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#b91c1c]" />
                    <span>{lang === "ta" ? "1. புதிய காணொளி பதிவேற்றுக (Add Video)" : "1. Add New Video"}</span>
                  </h6>

                  {/* Video Source Selector */}
                  <div className="flex gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setVideoSourceType("file")}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${videoSourceType === "file" ? "bg-rose-600 text-white shadow-xs" : "bg-stone-100 text-stone-600"}`}
                    >
                      {lang === "ta" ? "📱 போன் வீடியோ" : "📱 File"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceType("url")}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${videoSourceType === "url" ? "bg-rose-600 text-white shadow-xs" : "bg-stone-100 text-stone-600"}`}
                    >
                      {lang === "ta" ? "🌐 YouTube / Link" : "🌐 URL Link"}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddVideo} className="space-y-3.5 mt-3">
                  {/* File Picker from Phone Storage */}
                  {videoSourceType === "file" ? (
                    <div>
                      <label className="block text-[11px] font-extrabold text-stone-700 mb-1.5">
                        {lang === "ta" ? "மொபைல் / கணினியிலிருந்து வீடியோவை தேர்ந்தெடுக்கவும் *" : "Select video file from device storage *"}
                      </label>
                      <div className="border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl p-4 bg-rose-50/30 text-center transition-all">
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                          onChange={handleVideoFileSelect}
                          className="hidden"
                          id="mobile-gallery-video-input"
                        />
                        <label 
                          htmlFor="mobile-gallery-video-input" 
                          className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                        >
                          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-full">
                            <Film className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-rose-900">
                            {lang === "ta" ? "📱 வீடியோ கோப்பைத் திறக்க இங்கே கிளிக் செய்யவும்" : "📱 Tap to select Video from Files / Gallery"}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            (MP4, WebM, MOV, 3GP - Max 100MB)
                          </span>
                        </label>

                        {/* Video File Name & Duration Indicator */}
                        {newVideoFileBase64 && (
                          <div className="mt-3 p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-left flex items-center justify-between">
                            <div className="truncate">
                              <span className="text-[11px] font-black text-emerald-900 block truncate">
                                🎬 {newVideoFileName}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold">
                                {lang === "ta" ? "கால அளவு:" : "Duration:"} {newVideoDuration}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNewVideoFileBase64("");
                                setNewVideoFileName("");
                                if (videoFileInputRef.current) videoFileInputRef.current.value = "";
                              }}
                              className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                        {lang === "ta" ? "வீடியோ லிங்க் / YouTube URL / Shorts *" : "Video Link / YouTube URL / Shorts *"}
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... or .mp4 link"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  )}

                  {/* Video Title */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                      {lang === "ta" ? "வீடியோ தலைப்பு (Video Title) *" : "Video Title *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ta" ? "எ.கா: தமிழ்நாடு பெயிண்டர்கள் நலவாரிய ஓய்வூதிய நேரலை அறிக்கை" : "e.g., TNPA Welfare Pension Video"}
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* Video Description & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                        {lang === "ta" ? "விவரக் குறிப்பு (Tamil Description)" : "Description"}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === "ta" ? "வீடியோ பற்றிய குறிப்பு..." : "Short description..."}
                        value={newVideoDesc}
                        onChange={(e) => setNewVideoDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                        {lang === "ta" ? "கால அளவு (Duration)" : "Duration"}
                      </label>
                      <input
                        type="text"
                        placeholder="05:30"
                        value={newVideoDuration}
                        onChange={(e) => setNewVideoDuration(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || (videoSourceType === "file" ? !newVideoFileBase64 : !newVideoUrl.trim())}
                    className="w-full py-2.5 bg-stone-900 hover:bg-[#b91c1c] disabled:bg-stone-300 disabled:text-stone-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>{isSubmitting ? (lang === "ta" ? "பதிவேற்றப்படுகிறது..." : "Publishing...") : (lang === "ta" ? "வீடியோவை நேரலையில் பதிவேற்றுக" : "Publish Video to Live Gallery")}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* 2. ADD PHOTO CARD */}
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h6 className="font-black text-xs md:text-sm text-stone-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#b91c1c]" />
                    <span>{lang === "ta" ? "2. புதிய புகைப்படம் பதிவேற்றுக (Add Photo)" : "2. Add New Photo"}</span>
                  </h6>
                  
                  {/* Photo Source Selector */}
                  <div className="flex gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPhotoSourceType("file")}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${photoSourceType === "file" ? "bg-rose-600 text-white shadow-xs" : "bg-stone-100 text-stone-600"}`}
                    >
                      {lang === "ta" ? "📱 கேலரி / கேமரா" : "📱 File"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSourceType("url")}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${photoSourceType === "url" ? "bg-rose-600 text-white shadow-xs" : "bg-stone-100 text-stone-600"}`}
                    >
                      {lang === "ta" ? "🌐 URL லிங்க்" : "🌐 URL"}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddPhoto} className="space-y-3.5 mt-3">
                  {/* File Picker from Phone Gallery */}
                  {photoSourceType === "file" ? (
                    <div>
                      <label className="block text-[11px] font-extrabold text-stone-700 mb-1.5">
                        {lang === "ta" ? "மொபைல் கேலரியிலிருந்து படம் தேர்ந்தெடுக்கவும் *" : "Select image from phone gallery *"}
                      </label>
                      <div className="border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl p-4 bg-rose-50/30 text-center transition-all">
                        <input
                          ref={photoFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                          onChange={handlePhotoFileSelect}
                          className="hidden"
                          id="mobile-gallery-photo-input"
                        />
                        <label 
                          htmlFor="mobile-gallery-photo-input" 
                          className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                        >
                          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-full">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-rose-900">
                            {lang === "ta" ? "📱 போன் கேலரி / கேமராவைத் திறக்க இங்கே கிளிக் செய்யவும்" : "📱 Tap to open Mobile Gallery / Camera"}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            (JPEG, PNG, WebP - Max 25MB)
                          </span>
                        </label>

                        {/* Thumbnail Preview */}
                        {newPhotoFileBase64 && (
                          <div className="mt-3 relative inline-block">
                            <img 
                              src={newPhotoFileBase64} 
                              alt="Preview" 
                              className="h-24 w-auto max-w-full rounded-xl object-cover border-2 border-rose-500 shadow-md mx-auto"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setNewPhotoFileBase64("");
                                setNewPhotoFileName("");
                                if (photoFileInputRef.current) photoFileInputRef.current.value = "";
                              }}
                              className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-bold text-stone-600 block mt-1 truncate max-w-xs mx-auto">
                              {newPhotoFileName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                        {lang === "ta" ? "புகைப்பட இணையதள முகவரி (Image URL) *" : "Image Web URL *"}
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  )}

                  {/* Caption in Tamil */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                      {lang === "ta" ? "படத்தின் தலைப்பு / விளக்கம் (Tamil Caption) *" : "Tamil Caption *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ta" ? "எ.கா: மதுரை மாவட்ட சிறப்பு ஓவியர் பேரவை கூட்டம்" : "e.g., Madurai District Painters Meet"}
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* Caption in English */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                      {lang === "ta" ? "ஆங்கில தலைப்பு (English Caption - விருப்பத்தேர்வு)" : "English Caption (Optional)"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Madurai District Painters Conference"
                      value={newPhotoCaptionEn}
                      onChange={(e) => setNewPhotoCaptionEn(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || (photoSourceType === "file" ? !newPhotoFileBase64 : !newPhotoUrl.trim())}
                    className="w-full py-2.5 bg-[#b91c1c] hover:bg-rose-700 disabled:bg-stone-300 disabled:text-stone-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmitting ? (lang === "ta" ? "பதிவேற்றப்படுகிறது..." : "Uploading...") : (lang === "ta" ? "புகைப்படத்தை நேரலையில் சேர்க்க" : "Publish Photo to Live Gallery")}</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MEDIA RENDERING SHOWCASE */}
      {activeMedia === "video" ? (
        /* VIDEOS SHOWCASE GRID */
        <div className="space-y-4">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((vid) => (
                <div 
                  key={vid.id} 
                  className="border border-stone-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between bg-stone-50 hover:border-amber-400 group"
                >
                  {/* Video Clickable Thumbnail */}
                  <div 
                    onClick={() => setSelectedVideoForModal(vid)}
                    className="relative h-44 bg-stone-900 flex items-center justify-center cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />
                    
                    {/* Decorative preview backdrop */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px]" />
                    
                    {/* Big Play Button */}
                    <div className="relative z-10 p-3.5 bg-rose-600/90 group-hover:bg-rose-600 text-white rounded-full shadow-xl group-hover:scale-115 active:scale-95 transition-all">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
                      <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-amber-400 font-mono font-bold">
                        ⏱️ {vid.duration || "05:00"}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="bg-[#b91c1c] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow">
                        {lang === "ta" ? "காணொளி" : "Video"}
                      </span>
                    </div>
                  </div>

                  {/* Content & Actions */}
                  <div className="p-4 text-left flex flex-col justify-between flex-1 space-y-3">
                    <div>
                      <h5 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-2">
                        {lang === "ta" ? vid.title : vid.titleEn}
                      </h5>
                      <p className="text-stone-600 text-xs mt-1 leading-relaxed line-clamp-2">
                        {lang === "ta" ? vid.desc : vid.descEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedVideoForModal(vid)}
                        className="px-3 py-1.5 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{lang === "ta" ? "இயக்குக" : "Play Now"}</span>
                      </button>

                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="p-1.5 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          title={lang === "ta" ? "வீடியோவை நீக்கு" : "Delete Video"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* CLEAN EMPTY STATE WHEN NO VIDEOS */
            <div className="text-center py-12 px-4 border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/70 space-y-3">
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Video className="w-6 h-6" />
              </div>
              <h5 className="font-extrabold text-stone-900 text-sm md:text-base">
                {lang === "ta" 
                  ? "சங்க ஊடக அரங்கு - காணொளிகள் பகுதி" 
                  : "Union Media Gallery - Videos Area"}
              </h5>
              <p className="text-stone-600 text-xs max-w-lg mx-auto leading-relaxed">
                {lang === "ta" 
                  ? "பழைய மாதிரி காணொளிகள் அனைத்தும் நீக்கப்பட்டுள்ளன. சூப்பர் அட்மின் பதிவேற்றும் புதிய வீடியோக்கள் மட்டுமே இங்கு அனைவருக்கும் நேரடியாக நேரலையில் பிரதிபலிக்கும்." 
                  : "Sample mock videos have been cleared. Only official videos uploaded by the Super Admin will reflect here live for all union members."}
              </p>
              {isSuperAdmin && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowSuperAdminEditor(true);
                      setVideoSourceType("file");
                    }}
                    className="px-5 py-2.5 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "ta" ? "முதல் வீடியோவை பதிவேற்றுக" : "Upload First Video Now"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* PHOTOS SHOWCASE */
        <div className="space-y-4">
          {photos.length > 0 ? (
            <>
              {/* Main Photo Slider */}
              <div className="relative group">
                <div className="h-[280px] sm:h-[380px] md:h-[480px] w-full rounded-3xl overflow-hidden bg-stone-950 relative border-2 border-stone-200 shadow-xl">
                  <img 
                    src={photos[activePhotoIdx]?.url || photos[0].url} 
                    alt="Gallery" 
                    className="w-full h-full object-cover transition-all duration-500 cursor-pointer" 
                    onClick={() => setSelectedPhotoForModal(photos[activePhotoIdx])}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Caption Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 text-white text-left flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-amber-400 bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                          {lang === "ta" ? "சங்க நிகழ்வுகள்" : "Union Meets"}
                        </span>
                        <span className="text-[10px] text-stone-300">
                          {activePhotoIdx + 1} / {photos.length}
                        </span>
                      </div>
                      <p className="font-black text-sm sm:text-base md:text-lg mt-1.5 leading-snug drop-shadow-md">
                        {lang === "ta" ? photos[activePhotoIdx]?.caption : photos[activePhotoIdx]?.captionEn}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedPhotoForModal(photos[activePhotoIdx])}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        title={lang === "ta" ? "பெரிதாக்கிப் பார்க்க" : "View Full Size"}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{lang === "ta" ? "பெரிதாக்கு" : "Zoom"}</span>
                      </button>

                      {isSuperAdmin && photos[activePhotoIdx] && (
                        <button
                          onClick={() => handleDeletePhoto(photos[activePhotoIdx].id)}
                          className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{lang === "ta" ? "நீக்கு" : "Delete"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevPhoto} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg z-10"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleNextPhoto} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg z-10"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                  {photos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activePhotoIdx === idx ? "border-amber-500 scale-105 shadow-md" : "border-stone-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={photo.url} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* CLEAN EMPTY STATE WHEN NO PHOTOS */
            <div className="text-center py-12 px-4 border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/70 space-y-3">
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h5 className="font-extrabold text-stone-900 text-sm md:text-base">
                {lang === "ta" 
                  ? "சங்க ஊடக அரங்கு - புகைப்படங்கள் பகுதி" 
                  : "Union Media Gallery - Photos Area"}
              </h5>
              <p className="text-stone-600 text-xs max-w-lg mx-auto leading-relaxed">
                {lang === "ta" 
                  ? "பழைய மாதிரி புகைப்படங்கள் நீக்கப்பட்டுள்ளன. சூப்பர் அட்மின் பதிவேற்றும் புதிய புகைப்படங்கள் இங்கு அனைவருக்கும் உடனடியாக நேரலையில் தோன்றும்." 
                  : "Sample mock photos have been cleared. Only official photos uploaded by the Super Admin will reflect here live for all union members."}
              </p>
              {isSuperAdmin && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowSuperAdminEditor(true);
                      setPhotoSourceType("file");
                    }}
                    className="px-5 py-2.5 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "ta" ? "முதல் புகைப்படத்தை பதிவேற்றுக" : "Upload First Photo Now"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FULL PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedPhotoForModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-900 border border-stone-700 rounded-3xl p-4 md:p-6 max-w-4xl w-full shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <ImageIcon className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wide">
                    {lang === "ta" ? "முழுத்திரை புகைப்படம்" : "High Definition Photo Viewer"}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPhotoForModal(null)}
                  className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                <img 
                  src={selectedPhotoForModal.url} 
                  alt="Full view" 
                  className="max-h-[70vh] max-w-full object-contain rounded-2xl" 
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-stone-800 text-xs">
                <p className="font-bold text-stone-200">
                  {lang === "ta" ? selectedPhotoForModal.caption : selectedPhotoForModal.captionEn}
                </p>
                <div className="flex gap-2">
                  <a
                    href={selectedPhotoForModal.url}
                    download="tnpa_gallery_photo.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === "ta" ? "பதிவிறக்கு" : "Download"}</span>
                  </a>
                  <button
                    onClick={() => setSelectedPhotoForModal(null)}
                    className="px-4 py-1.5 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                  >
                    {lang === "ta" ? "மூடுக" : "Close"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL INTERACTIVE VIDEO PLAYER MODAL */}
      <AnimatePresence>
        {selectedVideoForModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-900 border border-stone-700 rounded-3xl p-4 md:p-6 max-w-4xl w-full shadow-2xl text-white space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <Video className="w-5 h-5" />
                  <span className="font-black text-xs md:text-sm">
                    {lang === "ta" ? selectedVideoForModal.title : selectedVideoForModal.titleEn}
                  </span>
                </div>
                <button
                  onClick={() => {
                    safeCancelSpeech();
                    setSelectedVideoForModal(null);
                  }}
                  className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner">
                {selectedVideoForModal.videoUrl?.includes("youtube.com") || selectedVideoForModal.videoUrl?.includes("youtu.be") || selectedVideoForModal.videoUrl?.includes("drive.google.com") ? (
                  <iframe
                    src={getEmbedVideoUrl(selectedVideoForModal.videoUrl)}
                    title={selectedVideoForModal.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={selectedVideoForModal.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Description & Speech tools */}
              <div className="p-4 bg-stone-800/70 border border-stone-700/60 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    {lang === "ta" ? "காணொளி விவரம் & உரை" : "Video Description"}
                  </span>
                  <button
                    onClick={() => {
                      const text = `${selectedVideoForModal.title}. ${selectedVideoForModal.desc}`;
                      safeSpeak(text, { lang: lang === "ta" ? "ta-IN" : "en-US" });
                    }}
                    className="px-2.5 py-1 bg-stone-700 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{lang === "ta" ? "குரலில் கேட்க" : "Listen in Tamil"}</span>
                  </button>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {lang === "ta" ? selectedVideoForModal.desc : selectedVideoForModal.descEn}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    safeCancelSpeech();
                    setSelectedVideoForModal(null);
                  }}
                  className="px-5 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white font-black text-xs rounded-xl cursor-pointer"
                >
                  {lang === "ta" ? "மூடுக" : "Close Player"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
