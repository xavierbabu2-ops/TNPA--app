import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Pencil, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Download, 
  Printer, 
  Sparkles, 
  Eye, 
  RotateCcw,
  Building2,
  FileCheck
} from "lucide-react";
import { formatMemberNumber } from "../utils/districtCodes";
import { UserAccount } from "../types";

// ============================================================================
// VECTOR SVG CIRCULAR ASSOCIATION LOGO COMPONENT
// Raised hand holding paintbrush & paint roller with red border (#C00000)
// ============================================================================
export function AssociationEmblemLogo({
  customUrl,
  size = "md",
  className = "",
  onClick
}: {
  customUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}) {
  const sizeClasses = {
    sm: "w-10 h-10 md:w-11 md:h-11",
    md: "w-12 h-12 md:w-14 md:h-14",
    lg: "w-16 h-16 md:w-20 md:h-20"
  }[size];

  if (customUrl) {
    return (
      <div 
        onClick={onClick}
        className={`${sizeClasses} rounded-full bg-white border-2 border-[#C00000] p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0 ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""} ${className}`}
      >
        <img src={customUrl} alt="Association Logo" className="w-full h-full object-contain rounded-full" />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`${sizeClasses} rounded-full bg-white border-2 border-[#C00000] shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden select-none ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""} ${className}`}
      title="தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Circular Red Rim */}
        <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#C00000" strokeWidth="4" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#111111" strokeWidth="0.8" strokeDasharray="1 1" />

        {/* Association Top Text Arc */}
        <path id="textArcTop" d="M 18,50 A 32,32 0 0,1 82,50" fill="none" />
        <text className="text-[5.5px] font-black fill-[#C00000]" textAnchor="middle">
          <textPath href="#textArcTop" startOffset="50%">TN PA² ASSOCIATION</textPath>
        </text>

        {/* Association Bottom Text Arc */}
        <path id="textArcBottom" d="M 82,52 A 32,32 0 0,1 18,52" fill="none" />
        <text className="text-[5.5px] font-black fill-[#111111]" textAnchor="middle">
          <textPath href="#textArcBottom" startOffset="50%">MADURAI • TAMIL NADU</textPath>
        </text>

        {/* Inner Gold / White Center Disc */}
        <circle cx="50" cy="50" r="30" fill="#FFFDF0" stroke="#C00000" strokeWidth="1.2" />

        {/* Raised Hand & Paint Tools Illustration */}
        <g transform="translate(50, 50) scale(0.9) translate(-50, -50)">
          {/* Paint Splashes & Strokes */}
          <path d="M 28 42 C 34 30, 66 30, 72 42" stroke="#C00000" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="34" cy="34" r="1.5" fill="#C00000" />
          <circle cx="66" cy="34" r="1.5" fill="#C00000" />

          {/* Paint Roller Tool (Diagonal Left) */}
          <g transform="rotate(-25 45 42)">
            {/* Roller Sleeve */}
            <rect x="36" y="24" width="18" height="7" rx="1.5" fill="#111111" stroke="#C00000" strokeWidth="0.8" />
            <line x1="40" y1="24" x2="40" y2="31" stroke="#FFFFFF" strokeWidth="0.6" />
            <line x1="45" y1="24" x2="45" y2="31" stroke="#FFFFFF" strokeWidth="0.6" />
            <line x1="50" y1="24" x2="50" y2="31" stroke="#FFFFFF" strokeWidth="0.6" />
            {/* Metal Frame */}
            <path d="M 54 27.5 L 58 27.5 L 58 38 L 48 42" fill="none" stroke="#555555" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Paint Brush Tool (Diagonal Right) */}
          <g transform="rotate(25 55 42)">
            {/* Bristles */}
            <path d="M 50 24 L 58 24 L 59 31 L 49 31 Z" fill="#C00000" />
            {/* Ferrule (Metal) */}
            <rect x="49" y="31" width="10" height="4" fill="#888888" stroke="#111111" strokeWidth="0.5" />
            {/* Handle */}
            <path d="M 52 35 L 53 48 L 55 48 L 56 35 Z" fill="#111111" />
          </g>

          {/* Strong Raised Fist (Black & White with Red Outline) */}
          {/* Arm / Wrist */}
          <rect x="45" y="60" width="10" height="15" fill="#111111" rx="1" />
          {/* Fist Clench */}
          <circle cx="50" cy="53" r="8" fill="#111111" stroke="#FFFFFF" strokeWidth="0.8" />
          {/* Fingers / Knuckles */}
          <rect x="43" y="48" width="14" height="4" rx="1.5" fill="#222222" stroke="#FFFFFF" strokeWidth="0.6" />
          <rect x="44" y="52" width="12" height="3" rx="1" fill="#333333" stroke="#FFFFFF" strokeWidth="0.5" />
          {/* Thumb */}
          <path d="M 43 51 C 41 54, 43 58, 47 57" fill="#222222" stroke="#FFFFFF" strokeWidth="0.6" />
        </g>
      </svg>
    </div>
  );
}

// ============================================================================
// OFFICIAL TAMIL NADU GOVT STAMP / EMBLEM COMPONENT
// ============================================================================
export function TamilNaduGovtEmblemStamp({
  customUrl,
  size = "md",
  className = "",
  onClick
}: {
  customUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16 md:w-18 md:h-18",
    lg: "w-20 h-20"
  }[size];

  if (customUrl) {
    return (
      <div 
        onClick={onClick}
        className={`${sizeClasses} rounded-full bg-white border-2 border-emerald-700 p-1 shadow-sm overflow-hidden flex items-center justify-center ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""} ${className}`}
      >
        <img src={customUrl} alt="Tamil Nadu Govt Emblem" className="w-full h-full object-contain rounded-full" />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`${sizeClasses} rounded-full bg-white border-2 border-emerald-700 shadow-sm flex flex-col items-center justify-center p-1 text-center select-none relative overflow-hidden ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""} ${className}`}
      title="தமிழ்நாடு அரசு அனுமதி பெற்ற சங்கம்"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Circular Green Ring */}
        <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#047857" strokeWidth="3" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#C00000" strokeWidth="1" />

        {/* Top Text Arc: தமிழ்நாடு அரசு */}
        <path id="govtTextTop" d="M 15,50 A 35,35 0 0,1 85,50" fill="none" />
        <text className="text-[6.5px] font-black fill-[#047857]" textAnchor="middle">
          <textPath href="#govtTextTop" startOffset="50%">தமிழ்நாடு அரசு</textPath>
        </text>

        {/* Bottom Text Arc: வாய்மையே வெல்லும் */}
        <path id="govtTextBottom" d="M 85,52 A 35,35 0 0,1 15,52" fill="none" />
        <text className="text-[5.5px] font-extrabold fill-[#C00000]" textAnchor="middle">
          <textPath href="#govtTextBottom" startOffset="50%">அனுமதி பெற்ற சங்கம்</textPath>
        </text>

        {/* Center Gopuram / Temple Tower Silhouette */}
        <g transform="translate(50, 48) scale(0.65) translate(-50, -50)">
          {/* Kalasam (Top Finials) */}
          <path d="M 48 18 L 50 14 L 52 18 Z" fill="#047857" />
          <circle cx="50" cy="14" r="1.5" fill="#D97706" />

          {/* Gopuram Tower Layers */}
          <polygon points="44,22 56,22 58,30 42,30" fill="#047857" stroke="#064E3B" strokeWidth="1" />
          <polygon points="40,30 60,30 63,42 37,42" fill="#047857" stroke="#064E3B" strokeWidth="1" />
          <polygon points="35,42 65,42 68,56 32,56" fill="#047857" stroke="#064E3B" strokeWidth="1" />
          <polygon points="30,56 70,56 73,72 27,72" fill="#047857" stroke="#064E3B" strokeWidth="1" />

          {/* Gopuram Gate Arch */}
          <path d="M 44 72 L 44 60 C 44 56, 56 56, 56 60 L 56 72 Z" fill="#FFFFFF" />
          <circle cx="50" cy="62" r="3" fill="#D97706" />

          {/* Ashoka Chakra & Lions Motif */}
          <circle cx="50" cy="78" r="5" fill="#FFFFFF" stroke="#047857" strokeWidth="1" />
          <circle cx="50" cy="78" r="1" fill="#047857" />
        </g>
      </svg>
    </div>
  );
}

// ============================================================================
// WATERMARK COMPONENT FOR ID CARD BACKGROUND
// ============================================================================
function IdCardCenterWatermark() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none z-0">
      <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-8 border-[#C00000] flex flex-col items-center justify-center p-4 text-[#C00000] text-center">
        <svg viewBox="0 0 100 100" className="w-40 h-40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#C00000" strokeWidth="4" />
          <path d="M 30 65 L 50 30 L 70 65 Z" fill="#C00000" />
          <rect x="44" y="60" width="12" height="25" fill="#C00000" rx="2" />
        </svg>
        <span className="text-[9px] md:text-[10px] font-black leading-tight mt-1 text-[#C00000]">
          தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
        </span>
        <span className="text-xs font-black tracking-widest text-black">TN PA²</span>
      </div>
    </div>
  );
}

// ============================================================================
// PROPS INTERFACE
// ============================================================================
export interface UnionOfficialIdCardProps {
  member: {
    id?: string;
    name: string;
    fatherName?: string;
    regNumber?: string;
    district?: string;
    occupation?: string;
    photoUrl?: string;
    bloodGroup?: string;
    age?: string | number;
    dob?: string;
    phone?: string;
    place?: string;
    address?: string;
    isEdited?: boolean;
    lastEditedAt?: string;
  };
  side?: "front" | "back" | "both";
  className?: string;
  currentUser?: UserAccount | null;
  isEditable?: boolean;
  customLogoUrl?: string;
  customGovtSealUrl?: string;
  customLeader1Url?: string;
  customLeader2Url?: string;
  onUpdatePhoto?: (newPhotoUrl: string) => void;
  onUpdateLogo?: (newLogoUrl: string) => void;
  onUpdateGovtSeal?: (newUrl: string) => void;
  onUpdateLeader1?: (newUrl: string) => void;
  onUpdateLeader2?: (newUrl: string) => void;
}

// ============================================================================
// MAIN COMPONENT: UNION OFFICIAL ID CARD (FRONT & BACK SIDE-BY-SIDE)
// ============================================================================
export default function UnionOfficialIdCard({
  member,
  side = "both",
  className = "",
  currentUser,
  isEditable = true,
  customLogoUrl,
  customGovtSealUrl,
  customLeader1Url,
  customLeader2Url,
  onUpdatePhoto,
  onUpdateLogo,
  onUpdateGovtSeal
}: UnionOfficialIdCardProps) {
  // Input references to directly open the device / mobile file manager
  const memberPhotoInputRef = useRef<HTMLInputElement>(null);
  const govtEmblemInputRef = useRef<HTMLInputElement>(null);
  const assocLogoInputRef = useRef<HTMLInputElement>(null);

  // Field values with defaults
  const districtName = member.district || "மதுரை";
  const displayMemberNo = formatMemberNumber(member.regNumber || "4016", districtName);
  const memberName = member.name || "மு.பிரகாசம்";
  const fatherName = member.fatherName || "சு. முனுசாமி";
  const occupation = member.occupation || "பெயிண்டர் மற்றும் ஓவியர்";
  const bloodGroup = member.bloodGroup || "O+";
  const age = member.age || "38";
  const place = member.place || districtName;
  const fullAddress = member.address || `${place}, ${districtName} மாவட்டம், தமிழ்நாடு - 625107`;

  // Local state for photo and logos
  const [photoUrl, setPhotoUrl] = useState<string>(
    member.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500"
  );
  const [logoUrl, setLogoUrl] = useState<string>(customLogoUrl || "");
  const [govtSealUrl, setGovtSealUrl] = useState<string>(customGovtSealUrl || "");
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  // Sync props changes
  useEffect(() => {
    if (member.photoUrl) setPhotoUrl(member.photoUrl);
  }, [member.photoUrl]);

  useEffect(() => {
    if (customLogoUrl) setLogoUrl(customLogoUrl);
  }, [customLogoUrl]);

  useEffect(() => {
    if (customGovtSealUrl) setGovtSealUrl(customGovtSealUrl);
  }, [customGovtSealUrl]);

  // Direct trigger to open mobile / device file manager
  const triggerMemberPhotoUpload = () => {
    if (memberPhotoInputRef.current) {
      memberPhotoInputRef.current.click();
    } else {
      const el = document.getElementById("memberPhoto") as HTMLInputElement;
      if (el) el.click();
    }
  };

  const triggerGovtEmblemUpload = () => {
    if (govtEmblemInputRef.current) {
      govtEmblemInputRef.current.click();
    } else {
      const el = document.getElementById("govtEmblem") as HTMLInputElement;
      if (el) el.click();
    }
  };

  const triggerAssocLogoUpload = () => {
    if (assocLogoInputRef.current) {
      assocLogoInputRef.current.click();
    } else {
      const el = document.getElementById("assocLogo") as HTMLInputElement;
      if (el) el.click();
    }
  };

  // Handle Photo file selection from File Manager
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        setPhotoUrl(resultUrl);
        if (onUpdatePhoto) onUpdatePhoto(resultUrl);
        showToast("✅ உறுப்பினர் புகைப்படம் மாற்றப்பட்டது! (Photo Updated)");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Govt Emblem file selection from File Manager
  const handleGovtEmblemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        setGovtSealUrl(resultUrl);
        if (onUpdateGovtSeal) onUpdateGovtSeal(resultUrl);
        showToast("✅ அரசு முத்திரை மாற்றப்பட்டது! (Emblem Updated)");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Association Logo file selection from File Manager
  const handleAssocLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        setLogoUrl(resultUrl);
        if (onUpdateLogo) onUpdateLogo(resultUrl);
        showToast("✅ சங்க லோகோ மாற்றப்பட்டது! (Logo Updated)");
      };
      reader.readAsDataURL(file);
    }
  };

  const showToast = (msg: string) => {
    setUploadSuccessToast(msg);
    setTimeout(() => {
      setUploadSuccessToast(null);
    }, 4000);
  };

  return (
    <div className={`space-y-6 flex flex-col items-center w-full ${className}`}>
      
      {/* Hidden File Inputs for Mobile / Device File Manager Interaction */}
      <input
        type="file"
        id="memberPhoto"
        ref={memberPhotoInputRef}
        accept="image/*"
        onChange={handlePhotoFileChange}
        style={{ display: "none" }}
      />
      <input
        type="file"
        id="govtEmblem"
        ref={govtEmblemInputRef}
        accept="image/*"
        onChange={handleGovtEmblemChange}
        style={{ display: "none" }}
      />
      <input
        type="file"
        id="assocLogo"
        ref={assocLogoInputRef}
        accept="image/*"
        onChange={handleAssocLogoChange}
        style={{ display: "none" }}
      />

      {/* Floating Success Notification Toast */}
      {uploadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C00000] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-yellow-300" />
          <span className="font-bold text-xs md:text-sm">{uploadSuccessToast}</span>
        </div>
      )}

      {/* Side-by-Side Dynamic Cards Grid */}
      <div className={`w-full max-w-6xl ${side === "both" ? "grid grid-cols-1 xl:grid-cols-2 gap-8 items-start justify-center" : "flex justify-center"}`}>
        
        {/* ================================================================= */}
        {/* FRONT SIDE CARD LAYOUT                                            */}
        {/* ================================================================= */}
        {(side === "front" || side === "both") && (
          <div className="flex flex-col items-center w-full">
            {/* Card Side Title Badge */}
            <div className="mb-2 w-full max-w-[560px] flex items-center justify-between px-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C00000] text-white text-xs font-black rounded-full shadow-sm">
                <FileCheck className="w-3.5 h-3.5" />
                <span>முன்பக்க அட்டை (Front Side)</span>
              </span>
              <button
                type="button"
                onClick={triggerMemberPhotoUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-yellow-400 text-xs font-bold rounded-full shadow cursor-pointer transition-all active:scale-95"
              >
                <Pencil className="w-3 h-3" />
                <span>போட்டோ மாற்று</span>
              </button>
            </div>

            {/* Front Card Canvas */}
            <div 
              id="union-id-card-front"
              className="w-full max-w-[560px] aspect-[1.58/1] bg-white rounded-xl border-4 border-[#C00000] shadow-2xl overflow-hidden flex flex-col justify-between relative select-none"
              style={{ fontFamily: "'Mukta Malalar', 'Catamaran', 'Noto Sans Tamil', sans-serif" }}
            >
              {/* Top Red Header Banner (#C00000) */}
              <div className="bg-[#C00000] text-white px-2 py-1.5 md:py-2 flex items-center justify-between border-b-2 border-stone-900 shrink-0">
                
                {/* Left Circular Association Logo */}
                <div className="relative group shrink-0">
                  <AssociationEmblemLogo 
                    customUrl={logoUrl}
                    size="md"
                    onClick={triggerAssocLogoUpload}
                  />
                  <div 
                    onClick={triggerAssocLogoUpload}
                    className="absolute -bottom-1 -right-1 bg-stone-950 text-yellow-400 p-1 rounded-full shadow cursor-pointer hover:bg-stone-800 border border-white"
                    title="சங்க லோகோ மாற்ற தட்டவும்"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Center Header Titles */}
                <div className="text-center space-y-0.5 px-2 flex-1">
                  <h1 className="text-[11px] sm:text-xs md:text-sm lg:text-[15px] font-black tracking-wide text-white drop-shadow-sm leading-tight">
                    தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள்
                  </h1>
                  <h2 className="text-[11px] sm:text-xs md:text-sm lg:text-[15px] font-black tracking-wide text-white drop-shadow-sm leading-tight">
                    முன்னேற்ற சங்கம்
                  </h2>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-yellow-200 tracking-wide leading-tight">
                    அரசு பதிவு எண் TNMDUJCLM DUTU-50-26-00044
                  </p>
                  <p className="text-[7.5px] sm:text-[8px] md:text-[9px] font-bold text-white tracking-wide leading-tight">
                    1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107
                  </p>
                </div>

                {/* Right Circular Association Logo */}
                <div className="relative group shrink-0">
                  <AssociationEmblemLogo 
                    customUrl={logoUrl}
                    size="md"
                    onClick={triggerAssocLogoUpload}
                  />
                  <div 
                    onClick={triggerAssocLogoUpload}
                    className="absolute -bottom-1 -right-1 bg-stone-950 text-yellow-400 p-1 rounded-full shadow cursor-pointer hover:bg-stone-800 border border-white"
                    title="சங்க லோகோ மாற்ற தட்டவும்"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </div>
                </div>

              </div>

              {/* Middle Body Section (Front Side) */}
              <div className="px-4 md:px-5 py-2.5 md:py-3 flex-1 relative flex items-center justify-between overflow-hidden bg-[#FFFFFF]">
                
                {/* Center Translucent Watermark */}
                <IdCardCenterWatermark />

                {/* Left Side Member Details */}
                <div className="space-y-2 md:space-y-2.5 relative z-10 flex-1 pr-2">
                  
                  {/* உறுப்பினர் எண் : */}
                  <div className="flex items-baseline gap-1.5 md:gap-2">
                    <span className="text-xs md:text-sm font-black text-black shrink-0 whitespace-nowrap">
                      உறுப்பினர் எண் :
                    </span>
                    <span className="text-[#C00000] font-mono font-black text-sm md:text-lg tracking-wider">
                      {displayMemberNo}
                    </span>
                  </div>

                  {/* உறுப்பினர் பெயர் : */}
                  <div className="flex items-baseline gap-1.5 md:gap-2">
                    <span className="text-xs md:text-sm font-black text-black shrink-0 whitespace-nowrap">
                      உறுப்பினர் பெயர் :
                    </span>
                    <span className="text-[#800000] font-black text-sm md:text-base leading-tight">
                      {memberName}
                    </span>
                  </div>

                  {/* உறுப்பினர் தொழில் : */}
                  <div className="flex items-baseline gap-1.5 md:gap-2">
                    <span className="text-xs md:text-sm font-black text-black shrink-0 whitespace-nowrap">
                      உறுப்பினர் தொழில் :
                    </span>
                    <span className="text-black font-bold text-xs md:text-sm">
                      {occupation}
                    </span>
                  </div>

                  {/* மாவட்டம் / இடம் */}
                  <div className="flex items-baseline gap-1.5 md:gap-2 pt-0.5">
                    <span className="text-[11px] md:text-xs font-black text-[#800000] shrink-0 whitespace-nowrap">
                      மாவட்டம் :
                    </span>
                    <span className="text-stone-800 font-bold text-[11px] md:text-xs">
                      {districtName} ({place})
                    </span>
                  </div>

                </div>

                {/* Right Side Photo Box with Pencil Edit Icon & Click-to-Upload */}
                <div className="relative z-10 shrink-0 pl-2 flex flex-col items-center">
                  <div 
                    onClick={triggerMemberPhotoUpload}
                    className="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 bg-white border-2 border-black rounded-sm shadow-md overflow-hidden flex items-center justify-center relative group cursor-pointer ring-2 ring-transparent hover:ring-[#C00000] transition-all"
                    title="புகைப்படத்தை மாற்ற தட்டவும் / Click to upload from File Manager"
                  >
                    <img 
                      src={photoUrl} 
                      alt="Member Photo" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />

                    {/* Hover & Mobile Edit Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-yellow-300 gap-1 p-1 text-center">
                      <Camera className="w-5 h-5 animate-bounce" />
                      <span className="text-[8px] font-black uppercase tracking-tight text-white">
                        மாற்று / Edit
                      </span>
                    </div>

                    {/* Permanent Visible Corner Pencil Icon */}
                    <div className="absolute bottom-1 right-1 bg-[#C00000] text-white p-1 rounded-full shadow border border-white">
                      <Pencil className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  <span className="text-[8px] font-bold text-[#800000] mt-1 text-center">
                    புகைப்படம் (Photo)
                  </span>
                </div>

              </div>

              {/* Signatures Bottom Row */}
              <div className="px-3 py-1 grid grid-cols-3 gap-1 border-t border-stone-300 text-center font-black bg-white shrink-0">
                <div className="space-y-0">
                  <div className="h-4 md:h-5 flex items-end justify-center font-serif italic font-bold text-stone-900 text-[10px] md:text-xs">
                    S. Michael Alvin
                  </div>
                  <div className="font-black text-[#C00000] text-[8px] md:text-[9.5px]">
                    மாநிலத் தலைவர்
                  </div>
                </div>

                <div className="space-y-0">
                  <div className="h-4 md:h-5 flex items-end justify-center font-serif italic font-bold text-stone-900 text-[10px] md:text-xs">
                    R. Xavier Babu
                  </div>
                  <div className="font-black text-[#C00000] text-[8px] md:text-[9.5px]">
                    மாநில பொதுச்செயலாளர்
                  </div>
                </div>

                <div className="space-y-0">
                  <div className="h-4 md:h-5 flex items-end justify-center font-serif italic font-bold text-stone-900 text-[10px] md:text-xs">
                    R. Sakthivel
                  </div>
                  <div className="font-black text-[#C00000] text-[8px] md:text-[9.5px]">
                    மாநில பொருளாளர்
                  </div>
                </div>
              </div>

              {/* Bottom Red Footer Banner (#C00000) */}
              <div className="bg-[#C00000] text-white py-1 px-4 flex justify-between items-center text-[10px] md:text-xs font-black tracking-widest shrink-0">
                <span>உழைப்போம்.......</span>
                <span>உயர்வோம் ......</span>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* BACK SIDE CARD LAYOUT                                             */}
        {/* ================================================================= */}
        {(side === "back" || side === "both") && (
          <div className="flex flex-col items-center w-full">
            {/* Card Side Title Badge */}
            <div className="mb-2 w-full max-w-[560px] flex items-center justify-between px-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-amber-300 text-xs font-black rounded-full shadow-sm">
                <Building2 className="w-3.5 h-3.5" />
                <span>பின்பக்க அட்டை (Back Side)</span>
              </span>
              <button
                type="button"
                onClick={triggerGovtEmblemUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C00000] hover:bg-red-700 text-white text-xs font-bold rounded-full shadow cursor-pointer transition-all active:scale-95"
              >
                <Pencil className="w-3 h-3" />
                <span>சின்னம் மாற்று</span>
              </button>
            </div>

            {/* Back Card Canvas */}
            <div 
              id="union-id-card-back"
              className="w-full max-w-[560px] aspect-[1.58/1] bg-white rounded-xl border-4 border-[#C00000] shadow-2xl overflow-hidden flex flex-col justify-between relative select-none"
              style={{ fontFamily: "'Mukta Malalar', 'Catamaran', 'Noto Sans Tamil', sans-serif" }}
            >
              {/* Top Red Header Banner (#C00000) */}
              <div className="bg-[#C00000] text-white px-2 py-1.5 md:py-2 flex items-center justify-between border-b-2 border-stone-900 shrink-0">
                
                {/* Left Circular Association Logo */}
                <div className="relative group shrink-0">
                  <AssociationEmblemLogo 
                    customUrl={logoUrl}
                    size="md"
                    onClick={triggerAssocLogoUpload}
                  />
                  <div 
                    onClick={triggerAssocLogoUpload}
                    className="absolute -bottom-1 -right-1 bg-stone-950 text-yellow-400 p-1 rounded-full shadow cursor-pointer hover:bg-stone-800 border border-white"
                    title="சங்க லோகோ மாற்ற தட்டவும்"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Center Header Titles */}
                <div className="text-center space-y-0.5 px-2 flex-1">
                  <h1 className="text-[11px] sm:text-xs md:text-sm lg:text-[15px] font-black tracking-wide text-white drop-shadow-sm leading-tight">
                    தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள்
                  </h1>
                  <h2 className="text-[11px] sm:text-xs md:text-sm lg:text-[15px] font-black tracking-wide text-white drop-shadow-sm leading-tight">
                    முன்னேற்ற சங்கம்
                  </h2>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-yellow-200 tracking-wide leading-tight">
                    அரசு பதிவு எண் TNMDUJCLM DUTU-50-26-00044
                  </p>
                  <p className="text-[7.5px] sm:text-[8px] md:text-[9px] font-bold text-white tracking-wide leading-tight">
                    1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107
                  </p>
                </div>

                {/* Right Circular Association Logo */}
                <div className="relative group shrink-0">
                  <AssociationEmblemLogo 
                    customUrl={logoUrl}
                    size="md"
                    onClick={triggerAssocLogoUpload}
                  />
                  <div 
                    onClick={triggerAssocLogoUpload}
                    className="absolute -bottom-1 -right-1 bg-stone-950 text-yellow-400 p-1 rounded-full shadow cursor-pointer hover:bg-stone-800 border border-white"
                    title="சங்க லோகோ மாற்ற தட்டவும்"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </div>
                </div>

              </div>

              {/* Middle Body Section (Back Side) */}
              <div className="px-4 md:px-5 py-2.5 md:py-3 flex-1 relative flex items-center justify-between overflow-hidden bg-[#FFFFFF]">
                
                {/* Center Translucent Watermark */}
                <IdCardCenterWatermark />

                {/* Left Side Member Details (Back) */}
                <div className="space-y-1.5 md:space-y-2 relative z-10 flex-1 pr-2 text-stone-900 text-xs md:text-sm font-bold leading-tight">
                  
                  {/* தந்தை பெயர் : */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="w-24 md:w-28 text-black font-black shrink-0 whitespace-nowrap">
                      தந்தை பெயர் :
                    </span>
                    <span className="font-bold text-stone-900">{fatherName}</span>
                  </div>

                  {/* வயது : */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="w-24 md:w-28 text-black font-black shrink-0 whitespace-nowrap">
                      வயது :
                    </span>
                    <span className="font-bold text-stone-900">{age} ஆண்டுகள்</span>
                  </div>

                  {/* இரத்த வகை : */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="w-24 md:w-28 text-[#800000] font-black shrink-0 whitespace-nowrap">
                      இரத்த வகை :
                    </span>
                    <span className="font-black text-[#C00000] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {bloodGroup}
                    </span>
                  </div>

                  {/* இருப்பிடம் : */}
                  <div className="flex items-start gap-1.5">
                    <span className="w-24 md:w-28 text-black font-black shrink-0 whitespace-nowrap">
                      இருப்பிடம் :
                    </span>
                    <span className="font-bold text-stone-900 text-[11px] md:text-xs leading-snug line-clamp-2">
                      {fullAddress}
                    </span>
                  </div>

                  {/* தொடர்பு எண் (Phone) */}
                  <div className="flex items-baseline gap-1.5 pt-0.5">
                    <span className="w-24 md:w-28 text-stone-700 font-black shrink-0 text-[11px] whitespace-nowrap">
                      தொடர்பு எண் :
                    </span>
                    <span className="font-mono font-bold text-stone-900 text-[11px]">
                      {member.phone || "9842189420"}
                    </span>
                  </div>

                </div>

                {/* Right Side: Govt Stamp / Emblem with Pencil Edit Icon */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1 shrink-0 pl-2">
                  <div className="text-[8.5px] md:text-[10px] font-black text-[#C00000] tracking-tight max-w-[130px] leading-tight">
                    தமிழ்நாடு அரசு அனுமதி பெற்ற சங்கம்
                  </div>

                  {/* Clickable Emblem with Pencil Icon */}
                  <div className="relative group">
                    <TamilNaduGovtEmblemStamp 
                      customUrl={govtSealUrl}
                      size="md"
                      onClick={triggerGovtEmblemUpload}
                    />
                    {/* Pencil Edit Badge */}
                    <div 
                      onClick={triggerGovtEmblemUpload}
                      className="absolute -bottom-1 -right-1 bg-[#C00000] text-white p-1 rounded-full shadow cursor-pointer hover:bg-red-700 border border-white"
                      title="அரசு முத்திரை மாற்ற தட்டவும்"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  <div className="text-[8px] md:text-[9px] font-black text-black leading-tight pt-1">
                    <div>ஒன்றுபடுவோம்!</div>
                    <div className="text-[#C00000]">உரிமையை மீட்போம்.</div>
                  </div>
                </div>

              </div>

              {/* Bottom Red Footer Banner (#C00000) */}
              <div className="bg-[#C00000] text-white py-1 px-4 flex justify-between items-center text-[10px] md:text-xs font-black tracking-widest shrink-0">
                <span>உழைப்போம்.......</span>
                <span>உயர்வோம் ......</span>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
