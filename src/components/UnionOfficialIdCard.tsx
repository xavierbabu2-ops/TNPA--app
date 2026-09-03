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
  FileCheck,
  Image as ImageIcon,
  SlidersHorizontal
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

  return (
    <div 
      onClick={onClick}
      className={`${sizeClasses} rounded-full bg-white border-2 border-[#C00000] p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0 ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""} ${className}`}
      title="தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்"
    >
      <img 
        src={customUrl || "/tnpa_official_logo.png"} 
        alt="TNPA Official Association Logo" 
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain rounded-full" 
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/tnpa_logo.svg";
        }}
      />
    </div>
  );
}

// ============================================================================
// OFFICIAL ASSOCIATION WAVING FLAG COMPONENT
// Red and Black with paintbrush emblem
// ============================================================================
export function AssociationWavingFlag({
  customUrl,
  className = "",
  onClick
}: {
  customUrl?: string;
  className?: string;
  onClick?: () => void;
}) {
  if (customUrl) {
    return (
      <div onClick={onClick} className={`overflow-hidden rounded flex items-center justify-center ${className}`}>
        <img src={customUrl} alt="Association Flag" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div onClick={onClick} className={`relative overflow-hidden rounded shadow-sm select-none ${className}`} title="தமிழ்நாடு பெயிண்டர்கள் சங்கக் கொடி">
      <svg viewBox="0 0 160 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="flagWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>
        {/* Top Half: Vibrant Union Red */}
        <rect x="0" y="0" width="160" height="50" fill="url(#flagWaveGrad)" />
        {/* Bottom Half: Deep Labor Black */}
        <rect x="0" y="50" width="160" height="50" fill="#18181b" />

        {/* Center Disc & Brush Emblem */}
        <circle cx="80" cy="50" r="22" fill="#ffffff" stroke="#eab308" strokeWidth="2" />
        <g transform="translate(80, 50) scale(0.65) translate(-50, -50)">
          <path d="M 28 42 C 34 30, 66 30, 72 42" stroke="#b91c1c" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="42" y="24" width="16" height="7" rx="1.5" fill="#18181b" stroke="#b91c1c" strokeWidth="1" />
          <path d="M 50 24 L 58 24 L 59 31 L 49 31 Z" fill="#b91c1c" />
          <circle cx="50" cy="54" r="8" fill="#18181b" stroke="#ffffff" strokeWidth="1" />
          <rect x="45" y="60" width="10" height="15" fill="#18181b" rx="1" />
        </g>
        
        {/* Flag Pole Sleeve Line */}
        <rect x="0" y="0" width="4" height="100" fill="#facc15" />
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
function IdCardCenterWatermark({
  customUrl,
  opacity = 0.08,
  onTriggerUpload,
  isEditable = false,
}: {
  customUrl?: string;
  opacity?: number;
  onTriggerUpload?: () => void;
  isEditable?: boolean;
}) {
  const effectiveSrc = customUrl || "/tnpa_official_logo.png";

  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center select-none z-0 ${isEditable && onTriggerUpload ? "pointer-events-auto cursor-pointer group" : "pointer-events-none"}`}
      onClick={isEditable ? onTriggerUpload : undefined}
      title={isEditable ? "வாட்டர்மார்க் படத்தை போன் கேலரியிலிருந்து மாற்ற தட்டவும்" : undefined}
    >
      <div 
        className="w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 flex items-center justify-center p-2 transition-transform duration-200 group-hover:scale-105"
        style={{ opacity }}
      >
        <img
          src={effectiveSrc}
          alt="Official TNPA Watermark"
          referrerPolicy="no-referrer"
          className="max-w-full max-h-full object-contain filter drop-shadow-sm rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/tnpa_logo.svg";
          }}
        />
      </div>

      {isEditable && onTriggerUpload && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/15 backdrop-blur-[1px]">
          <span className="px-3.5 py-1.5 bg-[#C00000] text-white text-[11px] md:text-xs font-black rounded-full shadow-xl flex items-center gap-1.5 border-2 border-white transform scale-95 group-hover:scale-100 transition-transform">
            <Camera className="w-3.5 h-3.5 text-yellow-300" />
            <span>வாட்டர்மார்க் மாற்ற தட்டவும் (போன் கேலரி)</span>
          </span>
        </div>
      )}
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
  customWatermarkUrl?: string;
  onUpdatePhoto?: (newPhotoUrl: string) => void;
  onUpdateLogo?: (newLogoUrl: string) => void;
  onUpdateGovtSeal?: (newUrl: string) => void;
  onUpdateLeader1?: (newUrl: string) => void;
  onUpdateLeader2?: (newUrl: string) => void;
  onUpdateWatermark?: (newWatermarkUrl: string) => void;
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
  customWatermarkUrl,
  onUpdatePhoto,
  onUpdateLogo,
  onUpdateGovtSeal,
  onUpdateWatermark
}: UnionOfficialIdCardProps) {
  // Check authorization: only Super Admin and State President can modify / edit ID cards
  const canEditIdCard = Boolean(
    isEditable &&
    currentUser && (
      currentUser.role === "super_admin" ||
      currentUser.role === "state_president" ||
      currentUser.isPrimarySuperAdmin
    )
  );

  // Input references to directly open the device / mobile file manager
  const memberPhotoInputRef = useRef<HTMLInputElement>(null);
  const govtEmblemInputRef = useRef<HTMLInputElement>(null);
  const assocLogoInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

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

  // Local state for photo, logos, and watermark
  const [photoUrl, setPhotoUrl] = useState<string>(
    member.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500"
  );
  const [logoUrl, setLogoUrl] = useState<string>(customLogoUrl || "");
  const [govtSealUrl, setGovtSealUrl] = useState<string>(customGovtSealUrl || "");
  const [watermarkUrl, setWatermarkUrl] = useState<string>(() => {
    return customWatermarkUrl || localStorage.getItem("tnpa_custom_watermark") || "";
  });
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(() => {
    const saved = localStorage.getItem("tnpa_watermark_opacity");
    return saved ? parseFloat(saved) : 0.08;
  });
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

  useEffect(() => {
    if (customWatermarkUrl !== undefined) {
      setWatermarkUrl(customWatermarkUrl);
    }
  }, [customWatermarkUrl]);

  // Direct trigger to open mobile / device file manager (guarded by role authorization)
  const triggerMemberPhotoUpload = () => {
    if (!canEditIdCard) {
      showToast("⚠️ உறுப்பினர் அட்டையை மாற்ற சூப்பர் அட்மின் & மாநிலத் தலைவருக்கு மட்டுமே அனுமதி உண்டு!");
      return;
    }
    if (memberPhotoInputRef.current) {
      memberPhotoInputRef.current.click();
    } else {
      const el = document.getElementById("memberPhoto") as HTMLInputElement;
      if (el) el.click();
    }
  };

  const triggerGovtEmblemUpload = () => {
    if (!canEditIdCard) {
      showToast("⚠️ அரசு முத்திரை மாற்ற சூப்பர் அட்மின் & மாநிலத் தலைவருக்கு மட்டுமே அனுமதி உண்டு!");
      return;
    }
    if (govtEmblemInputRef.current) {
      govtEmblemInputRef.current.click();
    } else {
      const el = document.getElementById("govtEmblem") as HTMLInputElement;
      if (el) el.click();
    }
  };

  const triggerAssocLogoUpload = () => {
    if (!canEditIdCard) {
      showToast("⚠️ சங்க லோகோ மாற்ற சூப்பர் அட்மின் & மாநிலத் தலைவருக்கு மட்டுமே அனுமதி உண்டு!");
      return;
    }
    if (assocLogoInputRef.current) {
      assocLogoInputRef.current.click();
    } else {
      const el = document.getElementById("assocLogo") as HTMLInputElement;
      if (el) el.click();
    }
  };

  const triggerWatermarkUpload = () => {
    if (!canEditIdCard) {
      showToast("⚠️ வாட்டர்மார்க் மாற்ற சூப்பர் அட்மின் & மாநிலத் தலைவருக்கு மட்டுமே அனுமதி உண்டு!");
      return;
    }
    if (watermarkInputRef.current) {
      watermarkInputRef.current.click();
    } else {
      const el = document.getElementById("watermarkImageInput") as HTMLInputElement;
      if (el) el.click();
    }
  };

  // Handle Photo file selection from File Manager
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditIdCard) return;
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
    if (!canEditIdCard) return;
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
    if (!canEditIdCard) return;
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

  // Handle Watermark file selection from Phone File Manager / Gallery
  const handleWatermarkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditIdCard) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        setWatermarkUrl(resultUrl);
        localStorage.setItem("tnpa_custom_watermark", resultUrl);
        if (onUpdateWatermark) onUpdateWatermark(resultUrl);
        showToast("✅ அட்டையின் நடு வாட்டர்மார்க் படம் போனிலிருந்து மாற்றப்பட்டது! (Watermark Updated)");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetWatermark = () => {
    if (!canEditIdCard) return;
    setWatermarkUrl("");
    localStorage.removeItem("tnpa_custom_watermark");
    if (onUpdateWatermark) onUpdateWatermark("");
    showToast("🔄 அசல் சங்க வாட்டர்மார்க் மீட்டமைக்கப்பட்டது! (Reset to Default)");
  };

  const handleChangeOpacity = (newOpacity: number) => {
    if (!canEditIdCard) return;
    setWatermarkOpacity(newOpacity);
    localStorage.setItem("tnpa_watermark_opacity", String(newOpacity));
    showToast(`🎨 வாட்டர்மார்க் அடர்த்தி: ${Math.round(newOpacity * 100)}%`);
  };

  const showToast = (msg: string) => {
    setUploadSuccessToast(msg);
    setTimeout(() => {
      setUploadSuccessToast(null);
    }, 4000);
  };

  return (
    <div className={`space-y-6 flex flex-col items-center w-full ${className}`}>
      
      {/* Hidden File Inputs for Mobile / Device File Manager Interaction (Authorized only) */}
      {canEditIdCard && (
        <>
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
          <input
            type="file"
            id="watermarkImageInput"
            ref={watermarkInputRef}
            accept="image/*"
            onChange={handleWatermarkFileChange}
            style={{ display: "none" }}
          />
        </>
      )}

      {/* Floating Success Notification Toast */}
      {uploadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C00000] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-yellow-300" />
          <span className="font-bold text-xs md:text-sm">{uploadSuccessToast}</span>
        </div>
      )}

      {/* Watermark Quick Control Bar (நேரடியாக போனிலிருந்து மாற்ற) - ONLY FOR SUPER ADMIN & STATE PRESIDENT */}
      {canEditIdCard && (
        <div className="w-full max-w-[560px] xl:max-w-6xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-stone-900 flex items-center gap-2 flex-wrap">
                <span className="text-sm">அட்டையின் நடு வாட்டர்மார்க் படம் (Watermark Photo)</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-black rounded-md">
                  👑 சூப்பர் அட்மின் & மாநிலத் தலைவர் அனுமதி
                </span>
                {watermarkUrl ? (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold rounded-full">
                    ✓ கேலரி படம் இணைக்கப்பட்டுள்ளது
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold rounded-full">
                    ✓ அசல் சங்க லோகோ
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-600">
                போன் கேலரியிலிருந்து உங்கள் விருப்பமான படத்தை நேரடியாக வாட்டர்மார்க்காக வைக்கலாம்
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            <button
              type="button"
              onClick={triggerWatermarkUpload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 text-white font-black rounded-xl shadow-md cursor-pointer transition-all border border-amber-400"
              title="போன் கேலரியிலிருந்து வாட்டர்மார்க் படம் தேர்ந்தெடுக்க"
            >
              <Upload className="w-4 h-4" />
              <span>போன் கேலரியிலிருந்து மாற்று</span>
            </button>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setWatermarkUrl("/tnpa_official_logo.png");
                  localStorage.setItem("tnpa_custom_watermark", "/tnpa_official_logo.png");
                  if (onUpdateWatermark) onUpdateWatermark("/tnpa_official_logo.png");
                  showToast("✅ அசல் TNPA சங்க லோகோ வாட்டர்மார்க்காக வைக்கப்பட்டது!");
                }}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  watermarkUrl === "/tnpa_official_logo.png" || !watermarkUrl
                    ? "bg-[#C00000] text-white shadow-xs"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
                title="அசல் சங்க லோகோ"
              >
                சங்க லோகோ
              </button>

              <button
                type="button"
                onClick={() => {
                  setWatermarkUrl("/logo.svg");
                  localStorage.setItem("tnpa_custom_watermark", "/logo.svg");
                  if (onUpdateWatermark) onUpdateWatermark("/logo.svg");
                  showToast("✅ அரசு சின்னம் வாட்டர்மார்க்காக வைக்கப்பட்டது!");
                }}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  watermarkUrl === "/logo.svg"
                    ? "bg-[#C00000] text-white shadow-xs"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
                title="அரசு சின்னம்"
              >
                அரசு சின்னம்
              </button>
            </div>

            {/* Watermark Opacity Presets */}
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-0.5 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold px-1.5">அடர்த்தி:</span>
              {[
                { label: "8%", val: 0.08 },
                { label: "15%", val: 0.15 },
                { label: "25%", val: 0.25 },
              ].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleChangeOpacity(opt.val)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    Math.abs(watermarkOpacity - opt.val) < 0.03
                      ? "bg-[#C00000] text-white shadow-xs"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {watermarkUrl && (
              <button
                type="button"
                onClick={handleResetWatermark}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-bold rounded-xl cursor-pointer transition-all border border-stone-300"
                title="அசல் வாட்டர்மார்க்கை மீண்டும் அமைக்க"
              >
                <RotateCcw className="w-3 h-3 text-stone-600" />
                <span>மீட்டமை</span>
              </button>
            )}
          </div>
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
              {canEditIdCard && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={triggerWatermarkUpload}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-full shadow cursor-pointer transition-all active:scale-95"
                    title="போன் கேலரியிலிருந்து வாட்டர்மார்க் படம் மாற்ற"
                  >
                    <ImageIcon className="w-3 h-3 text-white" />
                    <span>வாட்டர்மார்க்</span>
                  </button>
                  <button
                    type="button"
                    onClick={triggerMemberPhotoUpload}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-yellow-400 text-xs font-bold rounded-full shadow cursor-pointer transition-all active:scale-95"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>போட்டோ மாற்று</span>
                  </button>
                </div>
              )}
            </div>

            {/* Front Card Canvas */}
            <div 
              id="union-id-card-front"
              className="w-full max-w-[560px] min-h-[340px] sm:min-h-[360px] bg-white rounded-xl border-4 border-[#C00000] shadow-2xl overflow-hidden flex flex-col justify-between relative select-none"
              style={{ fontFamily: "'Mukta Malalar', 'Catamaran', 'Noto Sans Tamil', sans-serif" }}
            >
              {/* Top Red Header Banner (#C00000) */}
              <div className="bg-[#C00000] text-white px-2 py-1.5 md:py-2 flex items-center justify-between border-b-2 border-stone-900 shrink-0">
                
                {/* Left Circular Association Logo */}
                <div className="relative group shrink-0">
                  <AssociationEmblemLogo 
                    customUrl={logoUrl}
                    size="md"
                    onClick={canEditIdCard ? triggerAssocLogoUpload : undefined}
                  />
                  {canEditIdCard && (
                    <div 
                      onClick={triggerAssocLogoUpload}
                      className="absolute -bottom-1 -right-1 bg-stone-950 text-yellow-400 p-1 rounded-full shadow cursor-pointer hover:bg-stone-800 border border-white"
                      title="சங்க லோகோ மாற்ற தட்டவும்"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </div>
                  )}
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
                    onClick={canEditIdCard ? triggerAssocLogoUpload : undefined}
                  />
                  {canEditIdCard && (
                    <div 
                      onClick={triggerAssocLogoUpload}
                      className="absolute -bottom-1 -right-1 bg-stone-950 text-yellow-400 p-1 rounded-full shadow cursor-pointer hover:bg-stone-800 border border-white"
                      title="சங்க லோகோ மாற்ற தட்டவும்"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

              </div>

              {/* Middle Body Section (Front Side) */}
              <div className="px-4 md:px-5 py-2.5 md:py-3 flex-1 relative flex items-center justify-between overflow-hidden bg-[#FFFFFF]">
                
                {/* Center Translucent Watermark (Phone or Default) */}
                <IdCardCenterWatermark 
                  customUrl={watermarkUrl}
                  opacity={watermarkOpacity}
                  onTriggerUpload={canEditIdCard ? triggerWatermarkUpload : undefined}
                  isEditable={canEditIdCard}
                />

                {/* Direct Watermark Change Shortcut Button inside Card (visible in edit mode) */}
                {canEditIdCard && (
                  <button
                    type="button"
                    onClick={triggerWatermarkUpload}
                    title="போன் கேலரியிலிருந்து வாட்டர்மார்க் படம் மாற்ற தட்டவும்"
                    className="absolute top-1.5 right-2 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/90 hover:bg-amber-600 text-white text-[9.5px] font-black rounded-full shadow-md border border-amber-300 hover:scale-105 cursor-pointer backdrop-blur-xs transition-all"
                  >
                    <Camera className="w-3 h-3 text-yellow-200" />
                    <span>வாட்டர்மார்க் மாற்று</span>
                  </button>
                )}

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
                    S. Michael Alwin
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
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={triggerWatermarkUpload}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-full shadow cursor-pointer transition-all active:scale-95"
                  title="போன் கேலரியிலிருந்து வாட்டர்மார்க் படம் மாற்ற"
                >
                  <ImageIcon className="w-3 h-3 text-white" />
                  <span>வாட்டர்மார்க்</span>
                </button>
                <button
                  type="button"
                  onClick={triggerGovtEmblemUpload}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C00000] hover:bg-red-700 text-white text-xs font-bold rounded-full shadow cursor-pointer transition-all active:scale-95"
                >
                  <Pencil className="w-3 h-3" />
                  <span>சின்னம் மாற்று</span>
                </button>
              </div>
            </div>

            {/* Back Card Canvas */}
            <div 
              id="union-id-card-back"
              className="w-full max-w-[560px] min-h-[340px] sm:min-h-[360px] bg-white rounded-xl border-4 border-[#C00000] shadow-2xl overflow-hidden flex flex-col justify-between relative select-none"
              style={{ fontFamily: "'Mukta Malalar', 'Catamaran', 'Noto Sans Tamil', sans-serif" }}
            >
              {/* Top Red Header Banner (#C00000) */}
              <div className="bg-[#C00000] text-white px-2 py-1.5 md:py-2 flex items-center justify-between border-b-2 border-stone-900 shrink-0">
                
                {/* Left Circular Association Logo */}
                <div className="relative group shrink-0">
                  <AssociationEmblemLogo 
                    customUrl={logoUrl}
                    size="md"
                    onClick={canEditIdCard ? triggerAssocLogoUpload : undefined}
                  />
                  {canEditIdCard && (
                    <div 
                      onClick={triggerAssocLogoUpload}
                      className="absolute -bottom-1 -right-1 bg-stone-950 text-yellow-400 p-1 rounded-full shadow cursor-pointer hover:bg-stone-800 border border-white"
                      title="சங்க லோகோ மாற்ற தட்டவும்"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </div>
                  )}
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
                    onClick={canEditIdCard ? triggerAssocLogoUpload : undefined}
                  />
                  {canEditIdCard && (
                    <div 
                      onClick={triggerAssocLogoUpload}
                      className="absolute -bottom-1 -right-1 bg-stone-950 text-yellow-400 p-1 rounded-full shadow cursor-pointer hover:bg-stone-800 border border-white"
                      title="சங்க லோகோ மாற்ற தட்டவும்"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

              </div>

              {/* Middle Body Section (Back Side) */}
              <div className="px-4 md:px-5 py-2.5 md:py-3 flex-1 relative flex items-center justify-between overflow-hidden bg-[#FFFFFF]">
                
                {/* Center Translucent Watermark (Phone or Default) */}
                <IdCardCenterWatermark 
                  customUrl={watermarkUrl}
                  opacity={watermarkOpacity}
                  onTriggerUpload={canEditIdCard ? triggerWatermarkUpload : undefined}
                  isEditable={canEditIdCard}
                />

                {/* Direct Watermark Change Shortcut Button inside Card (visible in edit mode) */}
                {canEditIdCard && (
                  <button
                    type="button"
                    onClick={triggerWatermarkUpload}
                    title="போன் கேலரியிலிருந்து வாட்டர்மார்க் படம் மாற்ற தட்டவும்"
                    className="absolute top-1.5 right-2 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/90 hover:bg-amber-600 text-white text-[9.5px] font-black rounded-full shadow-md border border-amber-300 hover:scale-105 cursor-pointer backdrop-blur-xs transition-all"
                  >
                    <Camera className="w-3 h-3 text-yellow-200" />
                    <span>வாட்டர்மார்க் மாற்று</span>
                  </button>
                )}

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
                      onClick={canEditIdCard ? triggerGovtEmblemUpload : undefined}
                    />
                    {/* Pencil Edit Badge */}
                    {canEditIdCard && (
                      <div 
                        onClick={triggerGovtEmblemUpload}
                        className="absolute -bottom-1 -right-1 bg-[#C00000] text-white p-1 rounded-full shadow cursor-pointer hover:bg-red-700 border border-white"
                        title="அரசு முத்திரை மாற்ற தட்டவும்"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </div>
                    )}
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
