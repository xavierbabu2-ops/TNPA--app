import React, { useState } from "react";
import { 
  Smartphone, 
  Flag, 
  Award, 
  Download, 
  Sparkles, 
  CheckCircle, 
  Star, 
  Shield, 
  Image as ImageIcon,
  Share2,
  Layers,
  Globe
} from "lucide-react";
import { UserAccount } from "../types";

interface PlayStorePromoStudioProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function PlayStorePromoStudio({
  lang,
  currentUser,
  onAddAuditLog
}: PlayStorePromoStudioProps) {
  const [selectedTheme, setSelectedTheme] = useState<"red_flag" | "saffron" | "royal_blue">("red_flag");
  const [leaderName, setLeaderName] = useState<string>("மாநிலத் தலைவர் & தலைவர்கள் (Union Leadership)");

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out] pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 text-white p-6 md:p-10 shadow-2xl border border-red-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/25 border border-red-400/40 rounded-full text-xs text-red-300 font-extrabold">
              <Flag className="w-3.5 h-3.5 text-red-400" />
              <span>{lang === "ta" ? "கூகுள் ப்ளே ஸ்டோர் பிரமோஷன் & 3டி மாக்கப் ஸ்டுடியோ" : "Google Play Store 3D Promo Studio"}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              {lang === "ta" ? "TNPA² ப்ளே ஸ்டோர் விளம்பர வடிவமைப்பு" : "TNPA² Play Store Official 3D Mockup Studio"}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
              {lang === "ta"
                ? "சங்கத்தின் அதிகாரப்பூர்வ கொடி, தலைவர்கள் திருவுருவங்கள் மற்றும் மொபைல் ஆப் இடைமுகங்களுடன் கூடிய உயர் தரமான பிளே ஸ்டோர் ஃபீச்சர் பேனர் மற்றும் ஸ்கிரீன்ஷாட்கள்."
                : "Generate and preview high-fidelity Play Store feature graphics, 3D phone mockups featuring union leaders, union flags, and app interfaces."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                onAddAuditLog("Play Store Assets Exported", "Exported Play Store promotional 3D banner & mockups");
                alert(lang === "ta" ? "✓ பிளே ஸ்டோர் கிராபிக்ஸ் வெற்றிகரமாகத் தயாரிக்கப்பட்டது! (Play Store Graphics Ready)" : "✓ Play Store promotional assets prepared for download!");
              }}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black shadow-lg cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>{lang === "ta" ? "ப்ளே ஸ்டோர் பேனர் பதிவிறக்கம் (Download Assets)" : "Download Store Assets"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: 3D FEATURE GRAPHIC BANNER (1024x500) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-red-600" />
              <span>{lang === "ta" ? "1. ப்ளே ஸ்டோர் ஃபீச்சர் பேனர் (1024 x 500 px Feature Graphic)" : "1. Play Store Feature Graphic Banner (1024x500)"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === "ta" ? "சங்கத்தின் கொடி, தலைவர்கள் மற்றும் தொழிலாளர் ஒற்றுமையை வெளிப்படுத்தும் முதன்மை விளம்பரப் படம்" : "Primary store banner featuring union flag, leaders, and worker solidarity"}
            </p>
          </div>

          {/* Theme switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Theme:</span>
            <button
              onClick={() => setSelectedTheme("red_flag")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTheme === "red_flag" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {lang === "ta" ? "சங்க சிவப்பு கொடி (Red Flag)" : "Red Flag"}
            </button>
            <button
              onClick={() => setSelectedTheme("saffron")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTheme === "saffron" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {lang === "ta" ? "மஞ்சள் / காவி (Saffron Gold)" : "Saffron"}
            </button>
            <button
              onClick={() => setSelectedTheme("royal_blue")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTheme === "royal_blue" ? "bg-indigo-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {lang === "ta" ? "நீலம் (Royal Blue)" : "Royal Blue"}
            </button>
          </div>
        </div>

        {/* FEATURE GRAPHIC PREVIEW BOX (1024x500 proportion) */}
        <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 shadow-2xl border-4 ${
          selectedTheme === "red_flag" 
            ? "bg-gradient-to-br from-red-950 via-red-900 to-slate-950 border-red-500/60" 
            : selectedTheme === "saffron"
            ? "bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 border-amber-500/60"
            : "bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 border-blue-500/60"
        } text-white flex flex-col justify-between min-h-[380px]`}>
          
          {/* Background watermark flag / emblem */}
          <div className="absolute right-6 top-6 opacity-15 pointer-events-none flex items-center justify-center">
            <Flag className="w-80 h-80 text-white animate-pulse" />
          </div>

          {/* Top Header info */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-amber-400">
                <span className="text-xl font-black text-red-700">TN</span>
              </div>
              <div>
                <span className="px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {lang === "ta" ? "அதிகாரப்பூர்வ செயலி" : "Official Android App"}
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">தமிழ்நாடு பெயிண்டர்கள் சங்கம் (TNPA²)</h4>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black">4.9 / 5.0 Play Store Rating</span>
            </div>
          </div>

          {/* Center Content: Leaders & Union Flag & 3D Mockup elements */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-xl text-xs font-bold text-amber-300 border border-white/10">
                <Shield className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? "5 இலட்சம் விபத்து காப்பீடு" : "₹5L Accident Insurance"}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {lang === "ta" ? "தொழிலாளர்களின் உரிமை குரல்" : "The Voice of Master Painters"}
              </h2>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {lang === "ta" 
                  ? "சங்கத்தின் மாநிலத் தலைவர்கள் மற்றும் நிர்வாகிகள் வழிகாட்டுதலில் இயங்கும் நவீன டிஜிட்டல் நலவாரிய தளம்."
                  : "Operating under the visionary leadership of union presidents and state executives with complete digital welfare tracking."}
              </p>
            </div>

            {/* Central 3D Union Flag & Leaders Badge Mockup */}
            <div className="flex flex-col items-center justify-center text-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-1 shadow-2xl flex items-center justify-center relative">
                <Flag className="w-10 h-10 text-white animate-bounce" />
                <div className="absolute -bottom-2 px-2 py-0.5 bg-slate-900 text-amber-300 rounded text-[9px] font-black border border-amber-400">
                  TNPA² FLAG
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-amber-300 uppercase tracking-widest">{lang === "ta" ? "மாநிலத் தலைவர்கள் & வழிகாட்டுதல்" : "State Leaders & Board"}</p>
                <p className="text-xs font-bold text-white">{lang === "ta" ? "சங்கக் கொடி & தொழிலாளர் ஐக்கியம்" : "Union Flag & Solidarity"}</p>
              </div>
            </div>

            {/* Right side bullet features */}
            <div className="space-y-2 text-xs font-bold text-slate-200">
              <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === "ta" ? "டிஜிட்டல் உறுப்பினர் அடையாள அட்டை" : "Digital ID Card & QR Code"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === "ta" ? "ஏசியன், நிப்பான் & ஜே.எஸ்.டபிள்யூ பயிற்சி" : "Asian, Nippon & JSW Academy"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === "ta" ? "நேரலை மாவட்ட வாட்ஸ்அப் அறிவிப்புகள்" : "Live District Broadcasts"}</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer info */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span>© 2026 தமிழ்நாடு பெயிண்டர்கள் சங்கம் (TNPA²)</span>
            <span className="text-amber-400">Google Play Store Ready (AAB / APK)</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: 3D PHONE SCREENSHOT MOCKUPS FOR STORE */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-red-600" />
            <span>{lang === "ta" ? "2. ப்ளே ஸ்டோர் போன் ஸ்கிரீன்ஷாட் மாக்கப்கள் (App Mockups Gallery)" : "2. Play Store 3D Phone Mockup Screenshots"}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === "ta" ? "ப்ளே ஸ்டோரில் பதிவேற்ற வேண்டிய முக்கிய செயலி திரைகளின் வடிவமைப்பு" : "High-resolution mobile screen mockups for store presentation"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Mockup 1: ID Card & QR */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black">SCREEN 1</span>
                <span className="text-[10px] text-amber-400 font-bold">ID Card 🪪</span>
              </div>
              <h4 className="text-sm font-black text-white">{lang === "ta" ? "டிஜிட்டல் உறுப்பினர் அட்டை" : "Digital Member ID"}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {lang === "ta" ? "QR குறியீட்டுடன் கூடிய அசல் அடையாள அட்டை மற்றும் சங்கத்தின் கொடி முத்திரை." : "Official digital ID card with QR code and union emblem."}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-900 to-slate-950 p-4 rounded-2xl border border-red-500/40 text-center space-y-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl mx-auto flex items-center justify-center text-amber-300 font-black text-xs">
                QR
              </div>
              <p className="text-xs font-black">TNPA²-2026-0042</p>
              <p className="text-[9px] text-slate-300">Verified Union Member</p>
            </div>
          </div>

          {/* Mockup 2: Insurance & Relief */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black">SCREEN 2</span>
                <span className="text-[10px] text-emerald-400 font-bold">Insurance 🛡️</span>
              </div>
              <h4 className="text-sm font-black text-white">{lang === "ta" ? "காப்பீட்டு கோரிக்கை" : "Accident Relief"}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {lang === "ta" ? "₹5 இலட்சம் விபத்து நிவாரணம் மற்றும் மருத்துவச் செலவு கோரிக்கை டிராக்கர்." : "₹5 Lakhs accident relief & medical expense tracking system."}
              </p>
            </div>

            <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span>Relief Status</span>
                <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[9px] font-black">APPROVED</span>
              </div>
              <p className="text-xs font-black text-white">₹5,00,000 Claim</p>
            </div>
          </div>

          {/* Mockup 3: Brand Academy */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-black">SCREEN 3</span>
                <span className="text-[10px] text-purple-400 font-bold">Academy 🏆</span>
              </div>
              <h4 className="text-sm font-black text-white">{lang === "ta" ? "பிராண்ட் பயிற்சி அகாடமி" : "Paint Academy"}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {lang === "ta" ? "ஏசியன், நிப்பான், டுலக்ஸ் மற்றும் ஜே.எஸ்.டபிள்யூ நேரலை ஆன்லைன் வகுப்புகள்." : "Asian, Nippon, Dulux & JSW masterclass live training."}
              </p>
            </div>

            <div className="bg-purple-950/80 p-4 rounded-2xl border border-purple-500/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <Award className="w-4 h-4" />
                <span>Master Certified</span>
              </div>
              <p className="text-[10px] text-slate-300">Verified Certificate ID: 8942</p>
            </div>
          </div>

          {/* Mockup 4: Broadcasts */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black">SCREEN 4</span>
                <span className="text-[10px] text-rose-400 font-bold">Broadcasts 📢</span>
              </div>
              <h4 className="text-sm font-black text-white">{lang === "ta" ? "நேரலை வாட்ஸ்அப் சுற்றறிக்கை" : "Live WhatsApp Circular"}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {lang === "ta" ? "மாநிலத் தலைவர் அறிவிப்புகள் மற்றும் மாவட்ட வாட்ஸ்அப் இணைப்புகள்." : "State president notifications & district WhatsApp circulars."}
              </p>
            </div>

            <div className="bg-rose-950/80 p-4 rounded-2xl border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-300">
                <Globe className="w-4 h-4 animate-spin" />
                <span>Live Broadcast</span>
              </div>
              <p className="text-[10px] text-slate-300">Instant Push Notification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
