import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Video, Camera, Play, Sparkles, ShieldCheck, Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { UserAccount } from "../types";

interface GallerySliderProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  isSuperAdmin?: boolean;
  onAddAuditLog: (action: string, details: string) => void;
}

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  captionEn: string;
}

interface VideoItem {
  id: string;
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  duration: string;
  videoUrl?: string;
}

export default function GallerySlider({ 
  lang, 
  currentUser, 
  isSuperAdmin: propIsSuperAdmin,
  onAddAuditLog 
}: GallerySliderProps) {
  const [activeMedia, setActiveMedia] = useState<"photo" | "video">("photo");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showSuperAdminEditor, setShowSuperAdminEditor] = useState(false);

  // Photos state
  const [photos, setPhotos] = useState<PhotoItem[]>([
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
  ]);

  // Videos state
  const [videos, setVideos] = useState<VideoItem[]>([
    {
      id: "v1",
      title: "சங்கத்தின் செயல்பாடுகள் மற்றும் வரலாற்றுப் பார்வை",
      titleEn: "Union Achievements and History Overview",
      desc: "சங்கம் தொடங்கப்பட்டு லட்சக்கணக்கான ஓவியர்களின் வாழ்வாதாரத்தை மாற்றிய பயணம்.",
      descEn: "A journey of transformation supporting over 50,000+ Tamil painters.",
      duration: "12:45"
    },
    {
      id: "v2",
      title: "அரசு நலவாரியத்தில் பதிவு செய்வது எப்படி? (வீடியோ உரை)",
      titleEn: "Step-by-Step Guide to Welfare Board Registry",
      desc: "ஓய்வூதியம் மற்றும் உதவித்தொகை பெற ஆன்லைனில் விண்ணப்பிக்கும் நேரடி விளக்கம்.",
      descEn: "Live screen recording on how to apply for pension & accident claims.",
      duration: "08:15"
    }
  ]);

  // New item form state
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [newPhotoCaptionEn, setNewPhotoCaptionEn] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoTitleEn, setNewVideoTitleEn] = useState("");
  const [newVideoDesc, setNewVideoDesc] = useState("");
  const [newVideoDuration, setNewVideoDuration] = useState("10:00");

  const isSuperAdmin = propIsSuperAdmin !== undefined 
    ? propIsSuperAdmin 
    : currentUser?.role === "super_admin";

  const handleNextPhoto = () => {
    if (photos.length === 0) return;
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    if (photos.length === 0) return;
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Add new photo
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("⚠️ Super Admin access required!");
      return;
    }
    if (!newPhotoUrl.trim() || !newPhotoCaption.trim()) {
      alert("Please enter photo URL and caption.");
      return;
    }
    const newP: PhotoItem = {
      id: `p_${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim(),
      captionEn: newPhotoCaptionEn.trim() || newPhotoCaption.trim()
    };
    setPhotos([newP, ...photos]);
    onAddAuditLog("Media Gallery Updated", `Super Admin added new photo: ${newPhotoCaption}`);
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    setNewPhotoCaptionEn("");
    alert("✓ Photo added successfully by Super Admin!");
  };

  // Delete photo
  const handleDeletePhoto = (id: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm("Are you sure you want to delete this photo?")) {
      setPhotos(photos.filter(p => p.id !== id));
      onAddAuditLog("Media Gallery Photo Deleted", `Deleted photo ID: ${id}`);
    }
  };

  // Add new video
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("⚠️ Super Admin access required!");
      return;
    }
    if (!newVideoTitle.trim()) {
      alert("Please enter video title.");
      return;
    }
    const newV: VideoItem = {
      id: `v_${Date.now()}`,
      title: newVideoTitle.trim(),
      titleEn: newVideoTitleEn.trim() || newVideoTitle.trim(),
      desc: newVideoDesc.trim() || "TNPA2 Official Broadcast",
      descEn: "TNPA2 Official Broadcast",
      duration: newVideoDuration
    };
    setVideos([newV, ...videos]);
    onAddAuditLog("Media Gallery Video Added", `Super Admin added video: ${newVideoTitle}`);
    setNewVideoTitle("");
    setNewVideoTitleEn("");
    setNewVideoDesc("");
    alert("✓ Video added successfully by Super Admin!");
  };

  // Delete video
  const handleDeleteVideo = (id: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm("Are you sure you want to delete this video?")) {
      setVideos(videos.filter(v => v.id !== id));
      onAddAuditLog("Media Gallery Video Deleted", `Deleted video ID: ${id}`);
    }
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 md:p-6 shadow-md max-w-4xl mx-auto space-y-6 text-left">
      
      {/* Tab controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-600" />
          <div>
            <h4 className="font-extrabold text-stone-900 text-sm">
              {lang === "ta" ? "சங்க ஊடக அரங்கு (Media Gallery)" : "Union Media Gallery Showcase"}
            </h4>
            <p className="text-[10px] text-stone-500">
              {lang === "ta" ? "🛡️ மீடியா மேலாண்மை மற்றும் எடிட்டிங் சூப்பர் அட்மினுக்கு மட்டுமே" : "🛡️ Media gallery upload & editing restricted strictly to Super Admin"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveMedia("photo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMedia === "photo" 
                  ? "bg-[#b91c1c] text-white shadow" 
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {lang === "ta" ? "புகைப்படங்கள்" : "Photos"}
            </button>
            <button
              onClick={() => setActiveMedia("video")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMedia === "video" 
                  ? "bg-[#b91c1c] text-white shadow" 
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {lang === "ta" ? "காணொளிகள்" : "Videos"}
            </button>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setShowSuperAdminEditor(!showSuperAdminEditor)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>{showSuperAdminEditor ? "எடிட்டர் மூடுக" : "⚙️ சூப்பர் அட்மின் எடிட்டர்"}</span>
            </button>
          )}
        </div>
      </div>

      {/* SUPER ADMIN EXCLUSIVE MEDIA EDITOR PANEL */}
      {isSuperAdmin && showSuperAdminEditor && (
        <div className="bg-rose-50/70 border-2 border-rose-500/40 rounded-2xl p-5 space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center justify-between border-b border-rose-200 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-700" />
              <h5 className="font-black text-rose-900 text-sm">
                {lang === "ta" ? "சூப்பர் அட்மின் பிரத்யேக மீடியா மேலாண்மை கன்சோல்" : "Super Admin Exclusive Media Management Control"}
              </h5>
            </div>
            <span className="text-[10px] font-black bg-rose-200 text-rose-900 px-2.5 py-0.5 rounded-full uppercase">
              {lang === "ta" ? "கட்டுப்பாடு: சூப்பர் அட்மின் மட்டும்" : "Exclusive Access"}
            </span>
          </div>

          {/* Add Photo Form */}
          <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-3">
            <h6 className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-rose-600" />
              <span>{lang === "ta" ? "புதிய புகைப்படம் அல்லது படம் சேர்க்க (Add New Photo)" : "Add New Photo to Gallery"}</span>
            </h6>
            <form onSubmit={handleAddPhoto} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder={lang === "ta" ? "புகைப்பட URL (Image URL)" : "Image URL"}
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
              />
              <input
                type="text"
                placeholder={lang === "ta" ? "தலைப்பு (Tamil Caption)" : "Tamil Caption"}
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="English Caption"
                  value={newPhotoCaptionEn}
                  onChange={(e) => setNewPhotoCaptionEn(e.target.value)}
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black cursor-pointer shrink-0"
                >
                  {lang === "ta" ? "சேர்" : "Add"}
                </button>
              </div>
            </form>
          </div>

          {/* Add Video Form */}
          <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-3">
            <h6 className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-rose-600" />
              <span>{lang === "ta" ? "புதிய காணொளி சேர்க்க (Add New Video)" : "Add New Video Showcase"}</span>
            </h6>
            <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder={lang === "ta" ? "காணொளி தலைப்பு (Title)" : "Video Title"}
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
              />
              <input
                type="text"
                placeholder={lang === "ta" ? "விளக்கம் (Description)" : "Description"}
                value={newVideoDesc}
                onChange={(e) => setNewVideoDesc(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
              />
              <input
                type="text"
                placeholder="Duration (e.g. 10:00)"
                value={newVideoDuration}
                onChange={(e) => setNewVideoDuration(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-800"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black cursor-pointer"
              >
                {lang === "ta" ? "வீடியோ சேர்" : "Add Video"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Media rendering block */}
      {activeMedia === "photo" ? (
        <div className="relative">
          <div className="h-[250px] md:h-[400px] w-full rounded-xl overflow-hidden bg-stone-950 relative border">
            {photos.length > 0 ? (
              <>
                <img 
                  src={photos[activePhotoIdx]?.url || photos[0].url} 
                  alt="Gallery" 
                  className="w-full h-full object-cover opacity-90 transition-all duration-500" 
                />
                
                {/* Absolute caption overlays */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-left flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      {lang === "ta" ? "சங்க நிகழ்வுகள்" : "Union Meets"}
                    </span>
                    <p className="font-bold text-xs md:text-sm mt-1">
                      {lang === "ta" ? photos[activePhotoIdx]?.caption : photos[activePhotoIdx]?.captionEn}
                    </p>
                  </div>

                  {isSuperAdmin && photos[activePhotoIdx] && (
                    <button
                      onClick={() => handleDeletePhoto(photos[activePhotoIdx].id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === "ta" ? "புகைப்படம் நீக்கு" : "Delete"}</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-stone-400 text-xs">
                {lang === "ta" ? "புகைப்படங்கள் இல்லை" : "No Photos Available"}
              </div>
            )}
          </div>

          {/* Nav arrows */}
          {photos.length > 1 && (
            <>
              <button 
                onClick={handlePrevPhoto} 
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextPhoto} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-3">
            {photos.map((_, idx) => (
              <span 
                key={idx} 
                className={`h-1.5 rounded-full transition-all ${activePhotoIdx === idx ? "w-6 bg-amber-500" : "w-1.5 bg-stone-200"}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((vid) => (
            <div key={vid.id} className="border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between bg-stone-50">
              <div className="relative h-40 bg-stone-900 flex items-center justify-center group cursor-pointer">
                <Play className="w-10 h-10 text-white group-hover:scale-110 active:scale-95 transition-all z-10" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                  {vid.duration}
                </div>
              </div>
              <div className="p-4 text-left flex flex-col justify-between flex-1">
                <div>
                  <h5 className="font-extrabold text-stone-900 text-xs">
                    {lang === "ta" ? vid.title : vid.titleEn}
                  </h5>
                  <p className="text-stone-500 text-[10px] mt-1 leading-relaxed">
                    {lang === "ta" ? vid.desc : vid.descEn}
                  </p>
                </div>

                {isSuperAdmin && (
                  <div className="mt-3 pt-2 border-t border-stone-200 flex justify-end">
                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{lang === "ta" ? "காணொளி நீக்கு" : "Delete Video"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

