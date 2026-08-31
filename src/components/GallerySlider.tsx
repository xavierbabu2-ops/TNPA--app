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
  Eye
} from "lucide-react";
import { UserAccount, GalleryPhoto, GalleryVideo } from "../types";
import { 
  subscribeToGalleryPhotos, 
  saveGalleryPhotoToFirestore, 
  deleteGalleryPhotoFromFirestore,
  subscribeToGalleryVideos, 
  saveGalleryVideoToFirestore, 
  deleteGalleryVideoFromFirestore 
} from "../lib/syncService";
import { safeSpeak, safeCancelSpeech } from "../utils/safeSpeech";

interface GallerySliderProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  isSuperAdmin?: boolean;
  onAddAuditLog: (action: string, details: string) => void;
}

const DEFAULT_PHOTOS: GalleryPhoto[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800",
    caption: "மாநில மாநாடு மற்றும் ஓவியர்கள் பேரணி கூட்டம் - சென்னை",
    captionEn: "State Union General Body Meeting and Painter Rally - Chennai"
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800",
    caption: "பாதுகாப்பான பெயிண்டிங் உபகரணங்கள் மற்றும் கயிறு ஏறும் பயிற்சி முகாம்",
    captionEn: "Safety Equipment Training and Rope Climbing Workshop"
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
    caption: "அதிநவீன ஸ்ப்ரே மற்றும் எஃபெக்ட்ஸ் ஓவிய வடிவமைப்பு கருத்தரங்கம்",
    captionEn: "Modern Spray Painting and Decorative Effects Masterclass"
  },
  {
    id: "p4",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800",
    caption: "மாவட்ட அளவில் விபத்து நிவாரண நலநிதி காசோலைகள் வழங்குதல்",
    captionEn: "Distribution of Accidental Relief Welfare Cheques at District Camps"
  }
];

const DEFAULT_VIDEOS: GalleryVideo[] = [
  {
    id: "v1",
    title: "சங்கத்தின் செயல்பாடுகள் மற்றும் வரலாற்றுப் பார்வை",
    titleEn: "Union Achievements and History Overview",
    desc: "சங்கம் தொடங்கப்பட்டு லட்சக்கணக்கான ஓவியர்களின் வாழ்வாதாரத்தை மாற்றிய பயணம்.",
    descEn: "A journey of transformation supporting over 50,000+ Tamil painters.",
    duration: "12:45",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: "v2",
    title: "அரசு நலவாரியத்தில் பதிவு செய்வது எப்படி? (வீடியோ உரை)",
    titleEn: "Step-by-Step Guide to Welfare Board Registry",
    desc: "ஓய்வூதியம் மற்றும் உதவித்தொகை பெற ஆன்லைனில் விண்ணப்பிக்கும் நேரடி விளக்கம்.",
    descEn: "Live screen recording on how to apply for pension & accident claims.",
    duration: "08:15",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  }
];

export default function GallerySlider({ 
  lang, 
  currentUser, 
  isSuperAdmin: propIsSuperAdmin,
  onAddAuditLog 
}: GallerySliderProps) {
  const [activeMedia, setActiveMedia] = useState<"photo" | "video">("photo");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showSuperAdminEditor, setShowSuperAdminEditor] = useState(false);

  // Photos & Videos state with Live Cloud Sync
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);
  const [videos, setVideos] = useState<GalleryVideo[]>(DEFAULT_VIDEOS);

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

  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = propIsSuperAdmin !== undefined 
    ? propIsSuperAdmin 
    : currentUser?.role === "super_admin";

  // Subscribe to realtime Firestore photos and videos
  useEffect(() => {
    const unsubPhotos = subscribeToGalleryPhotos((cloudPhotos) => {
      if (cloudPhotos && cloudPhotos.length > 0) {
        setPhotos(cloudPhotos);
      }
    });

    const unsubVideos = subscribeToGalleryVideos((cloudVideos) => {
      if (cloudVideos && cloudVideos.length > 0) {
        setVideos(cloudVideos);
      }
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

  // Handle mobile gallery photo selection
  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert(lang === "ta" ? "படத்தின் அளவு 8MB-க்குள் இருக்க வேண்டும்" : "Image size must be under 8MB");
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

    // Check size - allow up to 30MB for local video upload in base64 / blob
    if (file.size > 30 * 1024 * 1024) {
      alert(lang === "ta" ? "வீடியோ கோப்பின் அளவு 30MB-க்குள் இருக்க வேண்டும்" : "Video file size must be under 30MB");
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
  };

  // Add new photo
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert(lang === "ta" ? "⚠️ சூப்பர் அட்மின் மட்டுமே புகைப்படங்களை சேர்க்க முடியும்!" : "⚠️ Super Admin access required!");
      return;
    }

    const finalUrl = photoSourceType === "file" ? newPhotoFileBase64 : newPhotoUrl.trim();

    if (!finalUrl) {
      alert(lang === "ta" ? "தயவுசெய்து மொபைல் கேலரியிலிருந்து படம் தேர்வு செய்யவும் அல்லது URL உள்ளிடவும்." : "Please select an image from gallery or provide a URL.");
      return;
    }
    if (!newPhotoCaption.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து படத்திற்கான தலைப்பை உள்ளிடவும்." : "Please enter a caption for the photo.");
      return;
    }

    setIsSubmitting(true);
    const newP: GalleryPhoto = {
      id: `p_${Date.now()}`,
      url: finalUrl,
      caption: newPhotoCaption.trim(),
      captionEn: newPhotoCaptionEn.trim() || newPhotoCaption.trim(),
      uploadedAt: new Date().toISOString()
    };

    const updated = [newP, ...photos];
    setPhotos(updated);
    setActivePhotoIdx(0);

    // Save to Firestore
    await saveGalleryPhotoToFirestore(newP);
    onAddAuditLog("Media Gallery Photo Added", `Super Admin added new photo: ${newPhotoCaption}`);

    // Reset inputs
    setNewPhotoFileBase64("");
    setNewPhotoFileName("");
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    setNewPhotoCaptionEn("");
    if (photoFileInputRef.current) photoFileInputRef.current.value = "";
    setIsSubmitting(false);

    alert(lang === "ta" ? "✓ புகைப்படம் வெற்றிகரமாக கேலரியில் சேர்க்கப்பட்டு அனைவருக்கும் ஒத்திசைக்கப்பட்டது!" : "✓ Photo added and live synced to all users!");
  };

  // Delete photo
  const handleDeletePhoto = async (id: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm(lang === "ta" ? "இந்த புகைப்படத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?" : "Are you sure you want to delete this photo?")) {
      const updated = photos.filter(p => p.id !== id);
      setPhotos(updated);
      setActivePhotoIdx(0);
      await deleteGalleryPhotoFromFirestore(id);
      onAddAuditLog("Media Gallery Photo Deleted", `Deleted photo ID: ${id}`);
    }
  };

  // Add new video
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert(lang === "ta" ? "⚠️ சூப்பர் அட்மின் மட்டுமே காணொளிகளை சேர்க்க முடியும்!" : "⚠️ Super Admin access required!");
      return;
    }

    const finalVideoUrl = videoSourceType === "file" ? newVideoFileBase64 : newVideoUrl.trim();

    if (!newVideoTitle.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து வீடியோவின் தலைப்பை உள்ளிடவும்." : "Please enter a video title.");
      return;
    }

    if (!finalVideoUrl && !newVideoUrl.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து மொபைலிலிருந்து வீடியோவை தேர்ந்தெடுக்கவும் அல்லது வீடியோ லிங்கை உள்ளிடவும்." : "Please select a video file or enter a video URL.");
      return;
    }

    setIsSubmitting(true);
    const newV: GalleryVideo = {
      id: `v_${Date.now()}`,
      title: newVideoTitle.trim(),
      titleEn: newVideoTitleEn.trim() || newVideoTitle.trim(),
      desc: newVideoDesc.trim() || (lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் சங்க அதிகாரப்பூர்வ காணொளி" : "TNPA2 Official Video"),
      descEn: "TNPA2 Official Broadcast & Video",
      duration: newVideoDuration || "05:00",
      videoUrl: finalVideoUrl,
      uploadedAt: new Date().toISOString()
    };

    const updated = [newV, ...videos];
    setVideos(updated);

    // Save to Firestore
    await saveGalleryVideoToFirestore(newV);
    onAddAuditLog("Media Gallery Video Added", `Super Admin added video: ${newVideoTitle}`);

    // Reset inputs
    setNewVideoFileBase64("");
    setNewVideoFileName("");
    setNewVideoUrl("");
    setNewVideoTitle("");
    setNewVideoTitleEn("");
    setNewVideoDesc("");
    setNewVideoDuration("05:00");
    if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    setIsSubmitting(false);

    alert(lang === "ta" ? "✓ காணொளி வெற்றிகரமாக சேர்க்கப்பட்டு அனைவருக்கும் ஒத்திசைக்கப்பட்டது!" : "✓ Video added and live synced to all users!");
  };

  // Delete video
  const handleDeleteVideo = async (id: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm(lang === "ta" ? "இந்த வீடியோவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?" : "Are you sure you want to delete this video?")) {
      const updated = videos.filter(v => v.id !== id);
      setVideos(updated);
      await deleteGalleryVideoFromFirestore(id);
      onAddAuditLog("Media Gallery Video Deleted", `Deleted video ID: ${id}`);
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
              <span>{lang === "ta" ? "சங்க ஊடக அரங்கு (Media Gallery)" : "Union Media Gallery Showcase"}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                {lang === "ta" ? "நேரலை" : "Live Synced"}
              </span>
            </h4>
            <p className="text-xs text-stone-500">
              {lang === "ta" 
                ? "📱 மொபைல் போன் கேலரியிலிருந்து புகைப்படங்கள் & வீடியோக்கள் பதிவேற்றும் வசதி" 
                : "📱 Direct photo & video uploads from mobile device gallery and camera"}
            </p>
          </div>
        </div>

        {/* Media Switcher & Admin Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
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
            <button
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
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setShowSuperAdminEditor(!showSuperAdminEditor)}
              className="px-3.5 py-2 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{showSuperAdminEditor ? (lang === "ta" ? "எடிட்டர் மூடுக" : "Close Editor") : (lang === "ta" ? "+ புதிய மீடியா சேர்க்க" : "+ Add Media")}</span>
            </button>
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
                  {lang === "ta" ? "சூப்பர் அட்மின் பிரத்யேக மீடியா மேலாண்மை கன்சோல்" : "Super Admin Exclusive Media Management Control"}
                </h5>
                <p className="text-[11px] text-rose-700 font-medium">
                  {lang === "ta" 
                    ? "மொபைல் கேலரியிலிருந்து நேரடியாக புகைப்படங்கள் / வீடியோக்களைத் தேர்வு செய்து பதிவேற்றவும்." 
                    : "Directly pick photos & videos from your phone storage or gallery and publish live."}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-rose-200 text-rose-900 px-3 py-1 rounded-full uppercase tracking-wider">
              {lang === "ta" ? "சூப்பர் அட்மின் அனுமதி" : "Super Admin Active"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. ADD PHOTO CARD */}
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h6 className="font-black text-xs md:text-sm text-stone-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#b91c1c]" />
                    <span>{lang === "ta" ? "1. புதிய புகைப்படம் சேர்க்க (Add Photo)" : "1. Add New Photo"}</span>
                  </h6>
                  
                  {/* Photo Source Selector */}
                  <div className="flex gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPhotoSourceType("file")}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer ${photoSourceType === "file" ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-600"}`}
                    >
                      {lang === "ta" ? "📱 கேலரி / கேமரா" : "📱 Gallery"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSourceType("url")}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer ${photoSourceType === "url" ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-600"}`}
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
                            (JPEG, PNG, WebP - Max 8MB)
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
                              className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
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
                    <span>{isSubmitting ? (lang === "ta" ? "பதிவேற்றப்படுகிறது..." : "Uploading...") : (lang === "ta" ? "புகைப்படத்தை கேலரியில் சேர்க்க" : "Publish Photo to Live Gallery")}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* 2. ADD VIDEO CARD */}
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h6 className="font-black text-xs md:text-sm text-stone-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#b91c1c]" />
                    <span>{lang === "ta" ? "2. புதிய காணொளி சேர்க்க (Add Video)" : "2. Add New Video"}</span>
                  </h6>

                  {/* Video Source Selector */}
                  <div className="flex gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setVideoSourceType("file")}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer ${videoSourceType === "file" ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-600"}`}
                    >
                      {lang === "ta" ? "📱 போன் வீடியோ" : "📱 Device Video"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceType("url")}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer ${videoSourceType === "url" ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-600"}`}
                    >
                      {lang === "ta" ? "🌐 YouTube / Link" : "🌐 Video Link"}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddVideo} className="space-y-3.5 mt-3">
                  {/* File Picker from Phone Storage */}
                  {videoSourceType === "file" ? (
                    <div>
                      <label className="block text-[11px] font-extrabold text-stone-700 mb-1.5">
                        {lang === "ta" ? "மொபைலிலிருந்து வீடியோ தேர்வு செய்யவும் *" : "Select video file from device storage *"}
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
                            {lang === "ta" ? "📱 போன் கேலரி / வீடியோ கோப்பைத் திறக்க கிளிக் செய்யவும்" : "📱 Tap to select Video from Mobile Gallery / Files"}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            (MP4, WebM, MOV - Max 30MB)
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
                                {lang === "ta" ? "நீளம்:" : "Duration:"} {newVideoDuration}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNewVideoFileBase64("");
                                setNewVideoFileName("");
                                if (videoFileInputRef.current) videoFileInputRef.current.value = "";
                              }}
                              className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
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
                        {lang === "ta" ? "வீடியோ லிங்க் / YouTube URL *" : "Video Link / YouTube URL *"}
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
                      {lang === "ta" ? "வீடியோ தலைப்பு (Title) *" : "Video Title *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ta" ? "எ.கா: நலவாரிய ஓய்வூதியம் விண்ணப்பிக்கும் செய்முறை" : "e.g., How to apply for Welfare Board Pension"}
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* Video Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                        {lang === "ta" ? "விளக்கம் (Tamil Description)" : "Tamil Description"}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === "ta" ? "விவரக் குறிப்பு..." : "Description..."}
                        value={newVideoDesc}
                        onChange={(e) => setNewVideoDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                        {lang === "ta" ? "கால அளவு (Duration)" : "Duration (e.g. 08:30)"}
                      </label>
                      <input
                        type="text"
                        placeholder="08:30"
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
                    <span>{isSubmitting ? (lang === "ta" ? "சேமிக்கப்படுகிறது..." : "Saving...") : (lang === "ta" ? "வீடியோவை கேலரியில் சேர்க்க" : "Publish Video to Live Gallery")}</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MEDIA RENDERING SHOWCASE */}
      {activeMedia === "photo" ? (
        <div className="space-y-4">
          
          {/* Main Photo Slider */}
          <div className="relative group">
            <div className="h-[280px] sm:h-[380px] md:h-[480px] w-full rounded-3xl overflow-hidden bg-stone-950 relative border-2 border-stone-200 shadow-xl">
              {photos.length > 0 ? (
                <>
                  <img 
                    src={photos[activePhotoIdx]?.url || photos[0].url} 
                    alt="Gallery" 
                    className="w-full h-full object-cover transition-all duration-500 cursor-pointer" 
                    onClick={() => setSelectedPhotoForModal(photos[activePhotoIdx])}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Absolute Caption Overlay */}
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
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 text-xs space-y-2">
                  <ImageIcon className="w-8 h-8 text-stone-600" />
                  <span>{lang === "ta" ? "புகைப்படங்கள் எதுவும் இல்லை" : "No Photos Available"}</span>
                </div>
              )}
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

        </div>
      ) : (
        /* VIDEOS SHOWCASE GRID */
        <div className="space-y-4">
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
                      ⏱️ {vid.duration}
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

          {videos.length === 0 && (
            <div className="text-center py-12 text-stone-400 text-xs border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
              {lang === "ta" ? "காணொளிகள் எதுவும் இல்லை. சூப்பர் அட்மின் எடிட்டர் மூலம் வீடியோக்களைச் சேர்க்கலாம்." : "No videos available in gallery."}
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
                {selectedVideoForModal.videoUrl?.includes("youtube.com") || selectedVideoForModal.videoUrl?.includes("youtu.be") ? (
                  <iframe
                    src={
                      selectedVideoForModal.videoUrl.includes("watch?v=") 
                        ? selectedVideoForModal.videoUrl.replace("watch?v=", "embed/") 
                        : selectedVideoForModal.videoUrl
                    }
                    title={selectedVideoForModal.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={selectedVideoForModal.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
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
