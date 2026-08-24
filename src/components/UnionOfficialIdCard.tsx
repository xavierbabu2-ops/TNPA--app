import React, { useState } from "react";
import { Camera, Edit3, Sparkles, History, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatMemberNumber } from "../utils/districtCodes";
import { UserAccount } from "../types";
import ImageEditorModal from "./ImageEditorModal";
import ChangeHistoryModal from "./ChangeHistoryModal";

interface UnionOfficialIdCardProps {
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
  onUpdatePhoto?: (newPhotoUrl: string) => void;
  onUpdateLogo?: (newLogoUrl: string) => void;
}

export default function UnionOfficialIdCard({
  member,
  side = "both",
  className = "",
  currentUser,
  isEditable,
  customLogoUrl,
  onUpdatePhoto,
  onUpdateLogo
}: UnionOfficialIdCardProps) {
  // STRICT PRIMARY SUPER ADMIN EDIT CONTROL (Normal admins cannot edit)
  const isSuperAdmin = currentUser?.role === "super_admin" || currentUser?.isPrimarySuperAdmin === true || currentUser?.adminUsername === "superadmin";

  const districtName = member.district || "மதுரை";
  const displayMemberNo = formatMemberNumber(member.regNumber || "4016", districtName);
  const memberName = member.name || "மு.பிரகாசம்";
  const fatherName = member.fatherName || "சு. முனுசாமி";
  const occupation = member.occupation || "பெயிண்டர்";
  const bloodGroup = member.bloodGroup || "O+";
  const age = member.age || "38";
  const place = member.place || member.district || "மதுரை";
  const fullAddress = member.address || `${place}, ${districtName} மாவட்டம், தமிழ்நாடு`;
  
  const [photoUrl, setPhotoUrl] = useState<string>(
    member.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500"
  );
  const [logoUrl, setLogoUrl] = useState<string>(customLogoUrl || "");
  const [isEditedState, setIsEditedState] = useState<boolean>(!!member.isEdited);
  const [lastEditedAtState, setLastEditedAtState] = useState<string>(member.lastEditedAt || "13/08/2026, 10:30 AM");

  // Modal States
  const [activeEditor, setActiveEditor] = useState<"photo" | "logo" | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Sync prop changes
  React.useEffect(() => {
    if (member.photoUrl) setPhotoUrl(member.photoUrl);
  }, [member.photoUrl]);

  React.useEffect(() => {
    if (customLogoUrl) setLogoUrl(customLogoUrl);
  }, [customLogoUrl]);

  // Handle Photo Save (Super Admin Only)
  const handleSavePhoto = async (newPhotoUrl: string) => {
    const prevPhoto = photoUrl;
    setPhotoUrl(newPhotoUrl);
    setIsEditedState(true);
    if (onUpdatePhoto) {
      onUpdatePhoto(newPhotoUrl);
    }

    const memberId = member.id || "TNPA-MDU-2026-4016";

    try {
      const res = await fetch(`/api/members/${memberId}/photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentUser?.role || "super_admin",
          "x-username": currentUser?.adminUsername || "superadmin"
        },
        body: JSON.stringify({
          photoUrl: newPhotoUrl,
          previousPhotoUrl: prevPhoto,
          userRole: currentUser?.role || "super_admin",
          adminUsername: currentUser?.adminUsername || "superadmin",
          editorName: currentUser?.name || currentUser?.nameEn || "Super Admin R. Xavier Babu",
          editorId: currentUser?.id || "usr_super_admin",
          reason: "Official member identity photo update by Primary Super Admin"
        })
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.errorTa || data.error || "Permission Denied");
        setPhotoUrl(prevPhoto);
      } else {
        if (data.lastEditedAt) setLastEditedAtState(data.lastEditedAt);
      }
    } catch (err) {
      console.warn("Failed to persist member photo to backend:", err);
    }
  };

  // Handle Logo Save (Super Admin Only)
  const handleSaveLogo = async (newLogoUrl: string) => {
    const prevLogo = logoUrl;
    setLogoUrl(newLogoUrl);
    setIsEditedState(true);
    if (onUpdateLogo) {
      onUpdateLogo(newLogoUrl);
    }

    try {
      const res = await fetch("/api/system/logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentUser?.role || "super_admin",
          "x-username": currentUser?.adminUsername || "superadmin"
        },
        body: JSON.stringify({
          logoUrl: newLogoUrl,
          previousLogoUrl: prevLogo,
          userRole: currentUser?.role || "super_admin",
          adminUsername: currentUser?.adminUsername || "superadmin",
          editorName: currentUser?.name || currentUser?.nameEn || "Super Admin R. Xavier Babu",
          editorId: currentUser?.id || "usr_super_admin",
          reason: "Official State Association Logo update by Primary Super Admin"
        })
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.errorTa || data.error || "Permission Denied");
        setLogoUrl(prevLogo);
      } else {
        if (data.lastEditedAt) setLastEditedAtState(data.lastEditedAt);
      }
    } catch (err) {
      console.warn("Failed to persist system logo to backend:", err);
    }
  };

  // State Leaders Photos
  const leaderPhoto1 = "/s_michael_alvin.svg";
  const leaderPhoto2 = "/r_xavier_babu.svg";

  return (
    <div className={`space-y-4 flex flex-col items-center ${className}`}>
      
      {/* Top Controls & Public Edit Status Bar */}
      <div className="w-full max-w-[660px] flex flex-wrap items-center justify-between gap-2 px-1">
        {/* Status Badge */}
        <div className="flex items-center gap-1.5 bg-stone-100 text-stone-800 px-3 py-1 rounded-full text-xs font-black border border-stone-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {isEditedState 
              ? `திருத்தப்பட்டது — ${lastEditedAtState}` 
              : "அதிகாரப்பூர்வ அடையாள அட்டை (Verified Record)"}
          </span>
        </div>

        {/* Change History Modal Button */}
        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-amber-300 font-extrabold text-xs rounded-full shadow flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <History className="w-3.5 h-3.5" />
          <span>வரலாறு / Change History</span>
        </button>
      </div>

      {/* Image Editor Modal Component (Super Admin Only) */}
      <ImageEditorModal
        isOpen={activeEditor !== null && isSuperAdmin}
        title={activeEditor === "photo" ? "உறுப்பினர் புகைப்பட மாற்றம் (Member Photo)" : "சங்க லோகோ மாற்றம் (Association Logo)"}
        currentImageUrl={activeEditor === "photo" ? photoUrl : logoUrl || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=200&h=200"}
        aspectRatio={activeEditor === "photo" ? 3 / 4 : 1}
        onSave={activeEditor === "photo" ? handleSavePhoto : handleSaveLogo}
        onClose={() => setActiveEditor(null)}
      />

      {/* Change History Audit Modal */}
      <ChangeHistoryModal
        isOpen={showHistoryModal}
        contentId={member.id || "TNPA-MDU-2026-4016"}
        title={`உறுப்பினர் அடையாள அட்டை: ${memberName} (${displayMemberNo})`}
        currentUser={currentUser}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* ======================================================== */}
      {/* FRONT CARD                                               */}
      {/* ======================================================== */}
      {(side === "front" || side === "both") && (
        <div 
          id="union-id-card-front"
          className="w-full max-w-[660px] aspect-[1.58/1] bg-white rounded-xl border-4 border-[#c80000] shadow-2xl overflow-hidden flex flex-col justify-between relative select-none"
          style={{ fontFamily: "'Mukta Malalar', 'Catamaran', 'Noto Sans Tamil', sans-serif" }}
        >
          {/* TOP RED HEADER BANNER (Reduced height as requested) */}
          <div className="bg-[#c80000] text-white px-2 py-1 md:py-1.5 flex items-center justify-between border-b-2 border-stone-900 shrink-0">
            {/* Left Circular Logo (Clickable ONLY if Primary Super Admin) */}
            <div 
              onClick={() => isSuperAdmin && setActiveEditor("logo")}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-yellow-400 flex flex-col items-center justify-center text-stone-950 p-1 shrink-0 shadow-md relative group ${isSuperAdmin ? "cursor-pointer ring-2 ring-amber-400" : ""}`}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" />
              ) : (
                <>
                  <span className="text-[5px] md:text-[6px] font-extrabold tracking-tighter text-center leading-tight text-red-700">
                    தமிழ்நாடு பெயிண்டர்கள்
                  </span>
                  <div className="text-[12px] md:text-[14px] my-0">✊</div>
                  <span className="text-[6px] md:text-[7px] font-black tracking-tighter text-center leading-none text-black">
                    TN PA²
                  </span>
                </>
              )}

              {isSuperAdmin && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-amber-300" />
                </div>
              )}
            </div>

            {/* Center Header Titles */}
            <div className="text-center space-y-0 px-2 flex-1">
              <h1 className="text-xs md:text-sm lg:text-base font-black tracking-wide text-white drop-shadow-sm leading-tight">
                தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள்
              </h1>
              <h2 className="text-xs md:text-sm lg:text-base font-black tracking-wide text-white drop-shadow-sm leading-tight">
                முன்னேற்ற சங்கம்
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-yellow-200 tracking-wide leading-tight">
                அரசு பதிவு எண் TNMDUJCLMDUTU-50-26-00044
              </p>
              <p className="text-[8px] md:text-[9px] font-bold text-white tracking-wide leading-tight">
                1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107
              </p>
            </div>

            {/* Right Circular Logo (Clickable ONLY if Primary Super Admin) */}
            <div 
              onClick={() => isSuperAdmin && setActiveEditor("logo")}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-yellow-400 flex flex-col items-center justify-center text-stone-950 p-1 shrink-0 shadow-md relative group ${isSuperAdmin ? "cursor-pointer ring-2 ring-amber-400" : ""}`}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" />
              ) : (
                <>
                  <span className="text-[5px] md:text-[6px] font-extrabold tracking-tighter text-center leading-tight text-red-700">
                    தமிழ்நாடு பெயிண்டர்கள்
                  </span>
                  <div className="text-[12px] md:text-[14px] my-0">✊</div>
                  <span className="text-[6px] md:text-[7px] font-black tracking-tighter text-center leading-none text-black">
                    TN PA²
                  </span>
                </>
              )}

              {isSuperAdmin && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-amber-300" />
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE BODY SECTION (Expanded & Better Balanced) */}
          <div className="px-5 py-3 flex-1 relative flex items-center justify-between overflow-hidden bg-white">
            
            {/* Background Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-8 border-[#c80000] flex flex-col items-center justify-center p-4 text-[#c80000] text-center">
                <span className="text-4xl md:text-5xl">✊</span>
                <span className="text-[10px] md:text-xs font-black leading-tight mt-1">
                  தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
                </span>
                <span className="text-sm font-black mt-1 tracking-widest">TN PA²</span>
              </div>
            </div>

            {/* Left Member Details List (PROMINENT Member Number & Name for Mobile) */}
            <div className="space-y-2.5 relative z-10 flex-1 pr-3">
              
              {/* Member No (Super Prominent) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-stone-100 pb-1">
                <span className="text-xs md:text-sm font-black text-stone-700 uppercase tracking-wider">
                  உறுப்பினர் எண்:
                </span>
                <span className="text-[#c80000] font-mono font-black text-lg md:text-2xl tracking-wider drop-shadow-sm">
                  {displayMemberNo}
                </span>
              </div>

              {/* Member Name (Super Prominent) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-stone-100 pb-1">
                <span className="text-xs md:text-sm font-black text-stone-700 uppercase tracking-wider">
                  உறுப்பினர் பெயர்:
                </span>
                <span className="text-[#c80000] font-black text-lg md:text-2xl leading-tight">
                  {memberName}
                </span>
              </div>

              {/* Father Name */}
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-bold text-stone-600">தந்தை பெயர்:</span>
                <span className="text-stone-950 font-bold text-sm md:text-base">{fatherName}</span>
              </div>

              {/* Occupation */}
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-bold text-stone-600">தொழில்:</span>
                <span className="text-stone-950 font-bold text-sm md:text-base">{occupation}</span>
              </div>

              {/* Address / Location */}
              <div className="flex items-start gap-2">
                <span className="text-xs md:text-sm font-bold text-stone-600 shrink-0">இடம் / மாவட்டம்:</span>
                <span className="text-stone-950 font-bold text-xs md:text-sm line-clamp-1">{place} ({districtName})</span>
              </div>

            </div>

            {/* Right Member Passport Photo Box (Clickable ONLY if Primary Super Admin) */}
            <div className="relative z-10 shrink-0 pl-1">
              <div 
                onClick={() => isSuperAdmin && setActiveEditor("photo")}
                className={`w-28 h-36 md:w-36 md:h-44 bg-white border-2 border-black rounded-sm shadow-md overflow-hidden flex items-center justify-center relative group ${
                  isSuperAdmin ? "cursor-pointer ring-4 ring-amber-400/50" : ""
                }`}
              >
                <img 
                  src={photoUrl} 
                  alt="Member Photo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-none" 
                  style={{ imageRendering: "crisp-edges" }}
                />

                {isSuperAdmin && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300 gap-1 p-1 text-center">
                    <Camera className="w-6 h-6 animate-bounce" />
                    <span className="text-[9px] font-black uppercase tracking-tight text-white">
                      மாற்று / Edit
                    </span>
                  </div>
                )}
              </div>

              {isSuperAdmin && (
                <button
                  onClick={() => setActiveEditor("photo")}
                  className="mt-1 w-full py-0.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[9px] rounded shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>புகைப்படம் மாற்று</span>
                </button>
              )}
            </div>

          </div>

          {/* SIGNATURES ROW (Reduced vertical space as requested) */}
          <div className="px-4 py-1 grid grid-cols-3 gap-1 border-t border-stone-300 text-center font-black text-stone-900 bg-white shrink-0">
            <div className="space-y-0">
              <div className="h-5 flex items-end justify-center font-serif italic font-bold text-stone-900 text-xs md:text-sm">
                S. Michael A.
              </div>
              <div className="font-black text-[#c80000] text-[9px] md:text-[10px]">மாநிலத் தலைவர்</div>
            </div>

            <div className="space-y-0">
              <div className="h-5 flex items-end justify-center font-serif italic font-bold text-stone-900 text-xs md:text-sm">
                R. Xavier Babu
              </div>
              <div className="font-black text-[#c80000] text-[9px] md:text-[10px]">மாநில பொதுச்செயலாளர்</div>
            </div>

            <div className="space-y-0">
              <div className="h-5 flex items-end justify-center font-serif italic font-bold text-stone-900 text-xs md:text-sm">
                R. Sakthivel
              </div>
              <div className="font-black text-[#c80000] text-[9px] md:text-[10px]">மாநில பொருளாளர்</div>
            </div>
          </div>

          {/* BOTTOM RED FOOTER BANNER */}
          <div className="bg-[#c80000] text-white py-1 px-4 flex justify-between items-center text-xs md:text-sm font-black tracking-widest shrink-0">
            <span>உழைப்போம்.......</span>
            <span>உயர்வோம் ......</span>
          </div>

        </div>
      )}


      {/* ======================================================== */}
      {/* BACK CARD                                                */}
      {/* ======================================================== */}
      {(side === "back" || side === "both") && (
        <div 
          id="union-id-card-back"
          className="w-full max-w-[660px] aspect-[1.58/1] bg-white rounded-xl border-4 border-[#c80000] shadow-2xl overflow-hidden flex flex-col justify-between relative select-none"
          style={{ fontFamily: "'Mukta Malalar', 'Catamaran', 'Noto Sans Tamil', sans-serif" }}
        >
          {/* TOP RED HEADER BANNER */}
          <div className="bg-[#c80000] text-white px-2 py-1 md:py-1.5 flex items-center justify-between border-b-2 border-stone-900 shrink-0">
            {/* Left Circular Logo */}
            <div 
              onClick={() => isSuperAdmin && setActiveEditor("logo")}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-yellow-400 flex flex-col items-center justify-center text-stone-950 p-1 shrink-0 shadow-md relative group ${isSuperAdmin ? "cursor-pointer" : ""}`}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" />
              ) : (
                <>
                  <span className="text-[5px] md:text-[6px] font-extrabold tracking-tighter text-center leading-tight text-red-700">
                    தமிழ்நாடு பெயிண்டர்கள்
                  </span>
                  <div className="text-[12px] md:text-[14px] my-0">✊</div>
                  <span className="text-[6px] md:text-[7px] font-black tracking-tighter text-center leading-none text-black">
                    TN PA²
                  </span>
                </>
              )}
            </div>

            {/* Center Header Titles */}
            <div className="text-center space-y-0 px-2 flex-1">
              <h1 className="text-xs md:text-sm lg:text-base font-black tracking-wide text-white drop-shadow-sm leading-tight">
                தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள்
              </h1>
              <h2 className="text-xs md:text-sm lg:text-base font-black tracking-wide text-white drop-shadow-sm leading-tight">
                முன்னேற்ற சங்கம்
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-yellow-200 tracking-wide leading-tight">
                அரசு பதிவு எண் TNMDUJCLMDUTU-50-26-00044
              </p>
              <p className="text-[8px] md:text-[9px] font-bold text-white tracking-wide leading-tight">
                1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107
              </p>
            </div>

            {/* Right Circular Logo */}
            <div 
              onClick={() => isSuperAdmin && setActiveEditor("logo")}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-yellow-400 flex flex-col items-center justify-center text-stone-950 p-1 shrink-0 shadow-md relative group ${isSuperAdmin ? "cursor-pointer" : ""}`}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" />
              ) : (
                <>
                  <span className="text-[5px] md:text-[6px] font-extrabold tracking-tighter text-center leading-tight text-red-700">
                    தமிழ்நாடு பெயிண்டர்கள்
                  </span>
                  <div className="text-[12px] md:text-[14px] my-0">✊</div>
                  <span className="text-[6px] md:text-[7px] font-black tracking-tighter text-center leading-none text-black">
                    TN PA²
                  </span>
                </>
              )}
            </div>
          </div>

          {/* MIDDLE BODY SECTION (BACK) */}
          <div className="px-5 py-3 flex-1 relative flex items-center justify-between overflow-hidden bg-white">
            
            {/* Background Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-8 border-[#c80000] flex flex-col items-center justify-center p-4 text-[#c80000] text-center">
                <span className="text-4xl md:text-5xl">✊</span>
                <span className="text-[10px] md:text-xs font-black leading-tight mt-1">
                  தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
                </span>
                <span className="text-sm font-black mt-1 tracking-widest">TN PA²</span>
              </div>
            </div>

            {/* Left Member Details List (Back) */}
            <div className="space-y-2 relative z-10 text-stone-900 text-sm md:text-base font-bold leading-snug flex-1 pr-2">
              <div className="flex items-center gap-2">
                <span className="w-28 md:w-32 text-[#c80000] font-black">தந்தை பெயர்</span>
                <span>:</span>
                <span className="font-bold">{fatherName}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-28 md:w-32 text-[#c80000] font-black">வயது</span>
                <span>:</span>
                <span className="font-bold">{age}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-28 md:w-32 text-[#c80000] font-black">ரத்த வகை</span>
                <span>:</span>
                <span className="font-bold text-[#c80000]">{bloodGroup}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-28 md:w-32 text-[#c80000] font-black shrink-0">முழு முகவரி</span>
                <span>:</span>
                <span className="font-bold text-xs md:text-sm">{fullAddress}</span>
              </div>
            </div>

            {/* Right Side: Govt Seal & Leaders */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-1 shrink-0 pl-2">
              <div className="text-[10px] md:text-xs font-black text-[#c80000] tracking-wide">
                தமிழ்நாடு அரசு அனுமதி பெற்ற சங்கம்
              </div>

              {/* Tamil Nadu Govt Emblem Seal */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-emerald-600 bg-white p-1 flex items-center justify-center shadow-sm">
                <div className="text-center flex flex-col items-center justify-center">
                  <span className="text-xl md:text-2xl leading-none">🏛️</span>
                  <span className="text-[6px] md:text-[7px] font-black text-emerald-800 leading-tight">
                    தமிழ்நாடு அரசு
                  </span>
                </div>
              </div>

              {/* Two Leaders Photos */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="w-9 h-11 md:w-11 md:h-13 bg-stone-100 border border-stone-800 rounded-sm overflow-hidden shadow-sm">
                  <img src={leaderPhoto1} alt="Leader 1" className="w-full h-full object-cover" />
                </div>
                <div className="w-9 h-11 md:w-11 md:h-13 bg-stone-100 border border-stone-800 rounded-sm overflow-hidden shadow-sm">
                  <img src={leaderPhoto2} alt="Leader 2" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="text-[9px] md:text-[10px] font-black text-[#c80000] leading-tight">
                <div>ஒன்றுபடுவோம்! உரிமையை மீட்போம்.</div>
              </div>
            </div>

          </div>

          {/* BOTTOM RED FOOTER BANNER (BACK) */}
          <div className="bg-[#c80000] text-white py-1 px-4 flex justify-between items-center text-[10px] md:text-xs font-black tracking-widest shrink-0">
            <span>TN PA² STATE UNION</span>
            <span>SECURE DIGITAL ID</span>
          </div>

        </div>
      )}

    </div>
  );
}
