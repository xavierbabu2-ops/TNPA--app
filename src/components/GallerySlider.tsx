import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Video, Camera, Play, Sparkles } from "lucide-react";

interface GallerySliderProps {
  lang: "ta" | "en";
}

export default function GallerySlider({ lang }: GallerySliderProps) {
  const [activeMedia, setActiveMedia] = useState<"photo" | "video">("photo");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const photos = [
    {
      url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800",
      caption: "மாநில மாநாடு மற்றும் ஓவியர்கள் பேரணி கூட்டம் - சென்னை",
      captionEn: "State Union General Body Meeting and Painter Rally - Chennai"
    },
    {
      url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800",
      caption: "பாதுகாப்பான பெயிண்டிங் உபகரணங்கள் மற்றும் கயிறு ஏறும் பயிற்சி முகாம்",
      captionEn: "Safety Equipment Training and Rope Climbing Workshop"
    },
    {
      url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
      caption: "அதிநவீன ஸ்ப்ரே மற்றும் எஃபெக்ட்ஸ் ஓவிய வடிவமைப்பு கருத்தரங்கம்",
      captionEn: "Modern Spray Painting and Decorative Effects Masterclass"
    },
    {
      url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800",
      caption: "மாவட்ட அளவில் விபத்து நிவாரண நலநிதி காசோலைகள் வழங்குதல்",
      captionEn: "Distribution of Accidental Relief Welfare Cheques at District Camps"
    }
  ];

  const videos = [
    {
      title: "சங்கத்தின் செயல்பாடுகள் மற்றும் வரலாற்றுப் பார்வை",
      titleEn: "Union Achievements and History Overview",
      desc: "சங்கம் தொடங்கப்பட்டு லட்சக்கணக்கான ஓவியர்களின் வாழ்வாதாரத்தை மாற்றிய பயணம்.",
      descEn: "A journey of transformation supporting over 50,000+ Tamil painters.",
      duration: "12:45"
    },
    {
      title: "அரசு நலவாரியத்தில் பதிவு செய்வது எப்படி? (வீடியோ உரை)",
      titleEn: "Step-by-Step Guide to Welfare Board Registry",
      desc: "ஓய்வூதியம் மற்றும் உதவித்தொகை பெற ஆன்லைனில் விண்ணப்பிக்கும் நேரடி விளக்கம்.",
      descEn: "Live screen recording on how to apply for pension & accident claims.",
      duration: "08:15"
    }
  ];

  const handleNextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 md:p-6 shadow-md max-w-4xl mx-auto space-y-6">
      
      {/* Tab controls */}
      <div className="flex justify-between items-center border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-600" />
          <h4 className="font-extrabold text-stone-900 text-sm">
            {lang === "ta" ? "சங்க ஊடக அரங்கு (Gallery)" : "Union Media Gallery Showcase"}
          </h4>
        </div>

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
      </div>

      {/* Media rendering block */}
      {activeMedia === "photo" ? (
        <div className="relative">
          <div className="h-[250px] md:h-[400px] w-full rounded-xl overflow-hidden bg-stone-950 relative border">
            <img 
              src={photos[activePhotoIdx].url} 
              alt="Gallery" 
              className="w-full h-full object-cover opacity-90 transition-all duration-500" 
            />
            
            {/* Absolute caption overlays */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-left">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                {lang === "ta" ? "சங்க நிகழ்வுகள்" : "Union Meets"}
              </span>
              <p className="font-bold text-xs md:text-sm mt-1">
                {lang === "ta" ? photos[activePhotoIdx].caption : photos[activePhotoIdx].captionEn}
              </p>
            </div>
          </div>

          {/* Nav arrows */}
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
          {videos.map((vid, idx) => (
            <div key={idx} className="border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between bg-stone-50">
              <div className="relative h-40 bg-stone-900 flex items-center justify-center group cursor-pointer">
                <Play className="w-10 h-10 text-white group-hover:scale-110 active:scale-95 transition-all z-10" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                  {vid.duration}
                </div>
              </div>
              <div className="p-4 text-left">
                <h5 className="font-extrabold text-stone-900 text-xs">
                  {lang === "ta" ? vid.title : vid.titleEn}
                </h5>
                <p className="text-stone-500 text-[10px] mt-1 leading-relaxed">
                  {lang === "ta" ? vid.desc : vid.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
