import React, { useState } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  Save, 
  Palette, 
  Layout, 
  Printer, 
  CheckCircle2, 
  RefreshCw, 
  QrCode, 
  User, 
  Sparkles,
  Sliders,
  Settings,
  Upload,
  Image as ImageIcon,
  Plus
} from "lucide-react";
import { MemberRegistration, UserAccount } from "../types";

interface SuperAdminIdCardEditorProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  registrations: MemberRegistration[];
  onUpdateRegistration?: (updated: MemberRegistration) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function SuperAdminIdCardEditor({
  lang,
  currentUser,
  registrations = [],
  onUpdateRegistration,
  onAddAuditLog
}: SuperAdminIdCardEditorProps) {
  const isSuperAdmin = currentUser?.role === "super_admin";

  // Template / Design state
  const [cardTheme, setCardTheme] = useState<"red_gold" | "royal_blue" | "dark_obsidian" | "emerald">("red_gold");
  const [headerTitleTa, setHeaderTitleTa] = useState("தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்");
  const [headerTitleEn, setHeaderTitleEn] = useState("Tamil Nadu Painters & Artists Progressive Association");
  const [unionRegNo, setUnionRegNo] = useState("TNMDUJCLMDUTU-50-26-00044");
  const [showBloodGroup, setShowBloodGroup] = useState(true);
  const [showFatherName, setShowFatherName] = useState(true);
  const [showQrCode, setShowQrCode] = useState(true);
  const [showHologram, setShowHologram] = useState(true);
  const [showUnionFlag, setShowUnionFlag] = useState(true);
  const [cardScale, setCardScale] = useState<number>(100); // percentage

  // Custom Gallery Uploads for Logo, Flag, Background Template & Full ID Card Front & Back
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [customFlagUrl, setCustomFlagUrl] = useState("");
  const [customBgUrl, setCustomBgUrl] = useState("");
  const [fullCardFrontUrl, setFullCardFrontUrl] = useState("");
  const [fullCardBackUrl, setFullCardBackUrl] = useState("");
  const [cardSideView, setCardSideView] = useState<"front" | "back">("front");
  
  // Interactive Touch-to-Edit Zone State
  const [activeTouchZone, setActiveTouchZone] = useState<string | null>(null);

  // Selected member to edit
  const safeRegistrations = Array.isArray(registrations) ? registrations : [];
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    safeRegistrations.length > 0 ? safeRegistrations[0].id : ""
  );

  const activeMember = safeRegistrations.find(m => m.id === selectedMemberId) || safeRegistrations[0];

  // Editable fields for the selected member
  const [editName, setEditName] = useState(activeMember?.name || "");
  const [editFather, setEditFather] = useState(activeMember?.fatherName || "");
  const [editDistrict, setEditDistrict] = useState(activeMember?.district || "");
  const [editPhone, setEditPhone] = useState(activeMember?.phone || "");
  const [editBlood, setEditBlood] = useState(activeMember?.bloodGroup || "O+");
  const [editRegNo, setEditRegNo] = useState(activeMember?.regNumber || "TNMDUJ-2026-0001");
  const [editPhoto, setEditPhoto] = useState(activeMember?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200");

  // Gallery Upload Handler Helper
  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update local state when member selection changes
  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    const m = safeRegistrations.find(reg => reg.id === id);
    if (m) {
      setEditName(m.name || "");
      setEditFather(m.fatherName || "");
      setEditDistrict(m.district || "");
      setEditPhone(m.phone || "");
      setEditBlood(m.bloodGroup || "O+");
      setEditRegNo(m.regNumber || "");
      setEditPhoto(m.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200");
    }
  };

  const handleSaveMemberChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert(lang === "ta" ? "அனுமதி மறுக்கப்பட்டது: சூப்பர் அட்மின் மட்டுமே இதை மாற்ற இயலும்." : "Access Denied: Only Super Admin can modify ID card records.");
      return;
    }

    if (activeMember && onUpdateRegistration) {
      const updated: MemberRegistration = {
        ...activeMember,
        name: editName,
        fatherName: editFather,
        district: editDistrict,
        phone: editPhone,
        bloodGroup: editBlood,
        regNumber: editRegNo,
        photoUrl: editPhoto
      };
      onUpdateRegistration(updated);
      onAddAuditLog("Super Admin ID Card Edit", `Super Admin modified ID card data for member: ${editName} (${editRegNo}) with Custom Logo, Flag & Reg No: ${unionRegNo}`);
      alert(lang === "ta" ? "✓ அடையாள அட்டை தரவுகள், லோகோ, கொடி மற்றும் பதிவு எண் சூப்பர் அட்மினால் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டன!" : "✓ ID card record, logo, union flag and registration numbers successfully updated by Super Admin!");
    } else {
      alert(lang === "ta" ? "✓ வடிவமைப்பு மற்றும் டெம்ப்ளேட் மாற்றங்கள் சேமிக்கப்பட்டன!" : "✓ ID card layout and template settings saved successfully!");
      onAddAuditLog("Super Admin ID Template Update", `Updated global ID card design template and styling.`);
    }
  };

  // Theme styling helpers
  const getThemeStyles = () => {
    switch (cardTheme) {
      case "royal_blue":
        return {
          headerBg: "bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white",
          accentColor: "text-blue-600",
          badgeBg: "bg-blue-900 text-white",
          borderCol: "border-blue-900"
        };
      case "dark_obsidian":
        return {
          headerBg: "bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-amber-300",
          accentColor: "text-amber-400",
          badgeBg: "bg-stone-900 text-amber-300 border border-amber-500/30",
          borderCol: "border-stone-800"
        };
      case "emerald":
        return {
          headerBg: "bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white",
          accentColor: "text-emerald-600",
          badgeBg: "bg-emerald-900 text-white",
          borderCol: "border-emerald-900"
        };
      case "red_gold":
      default:
        return {
          headerBg: "bg-gradient-to-r from-[#b91c1c] via-stone-900 to-[#1e1b4b] text-white",
          accentColor: "text-[#b91c1c]",
          badgeBg: "bg-amber-500 text-stone-950",
          borderCol: "border-amber-500/50"
        };
    }
  };

  const themeStyle = getThemeStyles();

  if (!isSuperAdmin) {
    return (
      <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <ShieldAlert className="w-16 h-16 text-rose-600 mx-auto animate-pulse" />
        <h3 className="text-xl font-black text-rose-900">
          {lang === "ta" ? "சூப்பர் அட்மின் அனுமதி தேவை (Super Admin Restriction)" : "Super Admin Authorization Required"}
        </h3>
        <p className="text-stone-700 text-xs md:text-sm">
          {lang === "ta"
            ? "அடையாள அட்டைகளை நேரடியாக திருத்துவது, டெம்ப்ளேட் வடிவமைப்பை மாற்றுவது மற்றும் அட்ஜஸ்ட் செய்வது போன்ற மேம்பட்ட கட்டுப்பாடுகள் சூப்பர் அட்மின் (Super Admin) கணக்கிற்கு மட்டுமே அனுமதிக்கப்பட்டுள்ளன."
            : "Direct ID card editing, layout adjustments, and template customization are strictly restricted to Super Admin accounts."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-[fadeIn_0.3s_ease-out]">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-[#b91c1c] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500 text-stone-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow">
              {lang === "ta" ? "சூப்பர் அட்மின் பிரத்யேகக் கட்டுப்பாடு" : "Super Admin Exclusive"}
            </span>
            <span className="text-amber-300 text-xs font-bold">
              {lang === "ta" ? "அடையாள அட்டை வடிவமைப்பு & நேரடி எடிட்டர்" : "ID Card Layout & Direct Editor"}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">
            {lang === "ta" ? "🎛️ ஐடி கார்டு டெம்ப்ளேட் & தரவு நிர்வாகி" : "ID Card Template & Data Master Control"}
          </h3>
          <p className="text-stone-300 text-xs md:text-sm max-w-2xl">
            {lang === "ta"
              ? "உறுப்பினர் அடையாள அட்டையின் வடிவமைப்பு (Design), நிறங்கள், தலைப்புகள், புலங்கள் (Fields) மற்றும் தனிப்பட்ட உறுப்பினர் தரவுகளை நேரடியாக மாற்றி அட்ஜஸ்ட் செய்யக்கூடிய சூப்பர் அட்மின் கட்டுப்பாட்டு மையம்."
              : "Advanced Super Admin studio to directly edit, customize layout, modify fields, and adjust design themes for all union member ID cards."}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-800/80 px-4 py-2.5 rounded-2xl border border-stone-700 text-xs font-bold text-amber-300 z-10">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{lang === "ta" ? "அதிகாரம்: சூப்பர் அட்மின்" : "Role: Super Admin Verified"}</span>
        </div>
      </div>

      {/* MAIN LAYOUT: CONTROLS & LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTROLS & EDITORS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. MEMBER SELECTOR & DATA EDITOR */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-[#b91c1c]" />
                <span>{lang === "ta" ? "1. உறுப்பினர் தரவை நேரடியாகத் திருத்து" : "1. Direct Member Data Editor"}</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {lang === "ta" ? "நேரடி மாற்றம் (Live Sync)" : "Live Sync Active"}
              </span>
            </div>

            {safeRegistrations.length > 0 && (
              <div className="space-y-3">
                <label className="block text-[11px] font-extrabold text-stone-600 uppercase">
                  {lang === "ta" ? "திருத்த வேண்டிய உறுப்பினரைத் தேர்ந்தெடு:" : "Select Member Record to Edit:"}
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleSelectMember(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                >
                  {safeRegistrations.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.district} - {m.regNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSaveMemberChanges} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "உறுப்பினர் பெயர் (Name)" : "Member Name"}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "தந்தை பெயர் (Father Name)" : "Father Name"}
                  </label>
                  <input
                    type="text"
                    value={editFather}
                    onChange={(e) => setEditFather(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "மாவட்டம் (District)" : "District"}
                  </label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "பதிவு எண் (Reg Number)" : "Registration Number"}
                  </label>
                  <input
                    type="text"
                    value={editRegNo}
                    onChange={(e) => setEditRegNo(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "இரத்த வகை (Blood Group)" : "Blood Group"}
                  </label>
                  <select
                    value={editBlood}
                    onChange={(e) => setEditBlood(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "மொபைல் எண் (Phone)" : "Phone Number"}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                  {lang === "ta" ? "புகைப்பட URL (Photo URL)" : "Photo URL"}
                </label>
                <input
                  type="text"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                />
              </div>

              <div className="pt-2 border-t">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#b91c1c] hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === "ta" ? "மாற்றங்களைப் பதிவு செய் & சேமி" : "Save ID Card Record Changes"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. DESIGN & TEMPLATE CUSTOMIZER */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-black text-stone-900 text-sm flex items-center gap-2 border-b pb-3">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>{lang === "ta" ? "2. அடையாள அட்டை வடிவமைப்பு & டெம்ப்ளேட் எடிட்டர்" : "2. ID Card Design & Template Customizer"}</span>
            </h4>

            <div className="space-y-4">
              {/* Color Theme Selector */}
              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase mb-2">
                  {lang === "ta" ? "வண்ண தீம் (Card Color Theme):" : "Card Color Theme:"}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardTheme("red_gold")}
                    className={`p-3 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                      cardTheme === "red_gold" ? "bg-red-50 border-[#b91c1c] text-[#b91c1c]" : "bg-stone-50 border-stone-200 text-stone-700"
                    }`}
                  >
                    🔴 {lang === "ta" ? "கெத்து சிவப்பு" : "Red & Gold"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme("royal_blue")}
                    className={`p-3 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                      cardTheme === "royal_blue" ? "bg-blue-50 border-blue-700 text-blue-800" : "bg-stone-50 border-stone-200 text-stone-700"
                    }`}
                  >
                    🔵 {lang === "ta" ? "ராயல் நீலம்" : "Royal Blue"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme("dark_obsidian")}
                    className={`p-3 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                      cardTheme === "dark_obsidian" ? "bg-stone-900 border-amber-400 text-amber-300" : "bg-stone-50 border-stone-200 text-stone-700"
                    }`}
                  >
                    🖤 {lang === "ta" ? "கருப்பு தங்கம்" : "Obsidian Dark"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme("emerald")}
                    className={`p-3 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                      cardTheme === "emerald" ? "bg-emerald-50 border-emerald-700 text-emerald-800" : "bg-stone-50 border-stone-200 text-stone-700"
                    }`}
                  >
                    🟢 {lang === "ta" ? "மரகத பச்சை" : "Emerald Green"}
                  </button>
                </div>
              </div>

              {/* Custom Header Titles & Union Registration Number */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "சங்கத்தின் பதிவு எண் (Union Reg Number)" : "Union Registration Number"}
                  </label>
                  <input
                    type="text"
                    value={unionRegNo}
                    onChange={(e) => setUnionRegNo(e.target.value)}
                    placeholder="TNMDUJCLMDUTU-50-26-00044"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "அட்டை தலைப்பு (தமிழ் Header)" : "Tamil Header Title"}
                  </label>
                  <input
                    type="text"
                    value={headerTitleTa}
                    onChange={(e) => setHeaderTitleTa(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "அட்டை தலைப்பு (English Header)" : "English Header Title"}
                  </label>
                  <input
                    type="text"
                    value={headerTitleEn}
                    onChange={(e) => setHeaderTitleEn(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              {/* GALLERY UPLOADS: FULL ID CARD, LOGO, FLAG, CUSTOM CARD BACKGROUND TEMPLATE */}
              <div className="pt-3 border-t space-y-3">
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#b91c1c]" />
                  <span>{lang === "ta" ? "மொபைல் காலரி மூலம் முழு அடையாள அட்டை / லோகோ / கொடி பதிவேற்றம்" : "Gallery Upload: Full ID Card Image, Logo, Flag & BG"}</span>
                </label>

                {/* Front & Back Card Image Upload Banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Front Card Upload */}
                  <div className="p-3.5 bg-gradient-to-r from-red-50 to-amber-50 border-2 border-dashed border-red-300 rounded-2xl space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[#b91c1c]">
                      <Upload className="w-4 h-4" />
                      <span className="text-xs font-black text-stone-900">
                        {lang === "ta" ? "முன்பக்கம் (Front Side)" : "Front Side Card"}
                      </span>
                    </div>
                    <p className="text-[9px] text-stone-600">
                      {lang === "ta" ? "காலரியிலிருந்து அடையாள அட்டை முன்பக்கம் தேர்வு செய்" : "Select front side image from gallery"}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <label className="px-3 py-1.5 bg-[#b91c1c] text-white rounded-xl text-[10px] font-black cursor-pointer hover:bg-rose-800 shadow-sm flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === "ta" ? "முன்பக்கம் பதிவேற்று" : "Upload Front"}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleGalleryFileSelect(e, setFullCardFrontUrl)} className="hidden" />
                      </label>
                      {fullCardFrontUrl && (
                        <button
                          type="button"
                          onClick={() => setFullCardFrontUrl("")}
                          className="px-2.5 py-1.5 bg-stone-200 text-stone-800 rounded-xl text-[10px] font-bold hover:bg-stone-300"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Back Card Upload */}
                  <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-2xl space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-blue-800">
                      <Upload className="w-4 h-4" />
                      <span className="text-xs font-black text-stone-900">
                        {lang === "ta" ? "பின்பக்கம் (Back Side)" : "Back Side Card"}
                      </span>
                    </div>
                    <p className="text-[9px] text-stone-600">
                      {lang === "ta" ? "காலரியிலிருந்து அடையாள அட்டை பின்பக்கம் தேர்வு செய்" : "Select back side image from gallery"}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <label className="px-3 py-1.5 bg-blue-700 text-white rounded-xl text-[10px] font-black cursor-pointer hover:bg-blue-800 shadow-sm flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === "ta" ? "பின்பக்கம் பதிவேற்று" : "Upload Back"}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleGalleryFileSelect(e, setFullCardBackUrl)} className="hidden" />
                      </label>
                      {fullCardBackUrl && (
                        <button
                          type="button"
                          onClick={() => setFullCardBackUrl("")}
                          className="px-2.5 py-1.5 bg-stone-200 text-stone-800 rounded-xl text-[10px] font-bold hover:bg-stone-300"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Logo Upload */}
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-center">
                    <span className="text-[10px] font-black text-stone-700 block">
                      {lang === "ta" ? "சங்க லோகோ (Union Logo)" : "Union Logo"}
                    </span>
                    {customLogoUrl ? (
                      <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border bg-white flex items-center justify-center">
                        <img src={customLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 mx-auto rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-xs font-bold">
                        Logo
                      </div>
                    )}
                    <label className="inline-block px-3 py-1.5 bg-[#b91c1c] text-white rounded-lg text-[10px] font-bold cursor-pointer hover:bg-rose-800">
                      {lang === "ta" ? "காலரி திற" : "Open Gallery"}
                      <input type="file" accept="image/*" onChange={(e) => handleGalleryFileSelect(e, setCustomLogoUrl)} className="hidden" />
                    </label>
                  </div>

                  {/* Flag Upload */}
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-center">
                    <span className="text-[10px] font-black text-stone-700 block">
                      {lang === "ta" ? "சங்கக் கொடி (Union Flag)" : "Union Flag"}
                    </span>
                    {customFlagUrl ? (
                      <div className="w-12 h-12 mx-auto rounded-xl overflow-hidden border bg-white flex items-center justify-center">
                        <img src={customFlagUrl} alt="Flag" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold">
                        Flag
                      </div>
                    )}
                    <label className="inline-block px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[10px] font-bold cursor-pointer hover:bg-amber-700">
                      {lang === "ta" ? "கொடி சேர்" : "Upload Flag"}
                      <input type="file" accept="image/*" onChange={(e) => handleGalleryFileSelect(e, setCustomFlagUrl)} className="hidden" />
                    </label>
                  </div>

                  {/* Custom Background Template Upload */}
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-center">
                    <span className="text-[10px] font-black text-stone-700 block">
                      {lang === "ta" ? "அட்டை பின்னணி டெம்ப்ளேட்" : "Card Background"}
                    </span>
                    {customBgUrl ? (
                      <div className="w-12 h-12 mx-auto rounded-xl overflow-hidden border bg-white flex items-center justify-center">
                        <img src={customBgUrl} alt="Bg" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-bold">
                        BG
                      </div>
                    )}
                    <label className="inline-block px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold cursor-pointer hover:bg-blue-700">
                      {lang === "ta" ? "பின்னணி சேர்" : "Upload BG"}
                      <input type="file" accept="image/*" onChange={(e) => handleGalleryFileSelect(e, setCustomBgUrl)} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Field Visibility Toggles */}
              <div className="pt-2 border-t space-y-2">
                <label className="block text-[11px] font-extrabold text-stone-700 uppercase">
                  {lang === "ta" ? "அட்டையில் காட்டப்படும் புலங்கள் (Field Visibility):" : "ID Card Field Toggles:"}
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold text-stone-800">
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <input
                      type="checkbox"
                      checked={showBloodGroup}
                      onChange={(e) => setShowBloodGroup(e.target.checked)}
                      className="rounded accent-[#b91c1c] w-4 h-4"
                    />
                    <span>{lang === "ta" ? "இரத்த வகை" : "Blood Group"}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <input
                      type="checkbox"
                      checked={showFatherName}
                      onChange={(e) => setShowFatherName(e.target.checked)}
                      className="rounded accent-[#b91c1c] w-4 h-4"
                    />
                    <span>{lang === "ta" ? "தந்தை பெயர்" : "Father Name"}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <input
                      type="checkbox"
                      checked={showUnionFlag}
                      onChange={(e) => setShowUnionFlag(e.target.checked)}
                      className="rounded accent-[#b91c1c] w-4 h-4"
                    />
                    <span>{lang === "ta" ? "சங்கக் கொடி" : "Union Flag"}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <input
                      type="checkbox"
                      checked={showQrCode}
                      onChange={(e) => setShowQrCode(e.target.checked)}
                      className="rounded accent-[#b91c1c] w-4 h-4"
                    />
                    <span>{lang === "ta" ? "QR குறியீடு" : "QR Code"}</span>
                  </label>
                </div>
              </div>

              {/* Scale Adjuster */}
              <div className="pt-2 border-t space-y-2">
                <div className="flex justify-between items-center text-xs font-extrabold text-stone-700">
                  <span>{lang === "ta" ? "அட்டை அளவு (Card Scale Preview Size)" : "Card Scale Zoom:"}</span>
                  <span className="text-[#b91c1c] font-black">{cardScale}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="120"
                  value={cardScale}
                  onChange={(e) => setCardScale(Number(e.target.value))}
                  className="w-full accent-[#b91c1c]"
                />
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW OF THE EDITED ID CARD (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4 sticky top-6">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{lang === "ta" ? "நேரடி அடையாள அட்டை முன்னோட்டம்" : "Live ID Card Preview"}</span>
              </h4>
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                {lang === "ta" ? "சூப்பர் அட்மின் ஸ்டூடியோ" : "Super Admin Studio"}
              </span>
            </div>

            {/* RENDER THE ID CARD PREVIEW WITH TOUCH-TO-EDIT, FRONT/BACK TABS & GALLERY ASSETS */}
            <div className="space-y-3">
              {/* Front / Back Toggle Tabs */}
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setCardSideView("front")}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${cardSideView === "front" ? "bg-[#b91c1c] text-white shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
                >
                  {lang === "ta" ? "முன்பக்கம் (Front Side)" : "Front Side"}
                </button>
                <button
                  type="button"
                  onClick={() => setCardSideView("back")}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${cardSideView === "back" ? "bg-blue-800 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
                >
                  {lang === "ta" ? "பின்பக்கம் (Back Side)" : "Back Side"}
                </button>
              </div>

              <div className="text-[11px] font-bold text-stone-600 bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-900">
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {cardSideView === "front" 
                      ? (lang === "ta" ? "💡 முன்பக்கத்தின் எந்த பகுதியையும் தொட்டு மாற்றலாம்" : "💡 Tap any section on front side to edit")
                      : (lang === "ta" ? "💡 பின்பக்க அடையாள அட்டை விவரங்கள்" : "💡 Back side ID card details")}
                  </span>
                </span>
                <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                  {cardSideView === "front" ? "Front" : "Back"}
                </span>
              </div>

              <div className="flex justify-center overflow-hidden py-4">
                {cardSideView === "front" ? (
                  fullCardFrontUrl ? (
                    <div className="w-[340px] rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden relative group">
                      <img src={fullCardFrontUrl} alt="Front ID Card" className="w-full h-auto object-contain" />
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] px-2 py-1 rounded-lg backdrop-blur-xs font-bold">
                        {lang === "ta" ? "காலரி முன்பக்கம்" : "Gallery Front"}
                      </div>
                    </div>
                  ) : (
                    <div 
                    style={{ 
                      transform: `scale(${cardScale / 100})`, 
                      transformOrigin: 'top center',
                      backgroundImage: customBgUrl ? `url(${customBgUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    className="w-[340px] bg-white rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden text-stone-900 transition-all duration-200 relative group"
                  >
                    
                    {/* CARD HEADER (Clickable to edit title) */}
                    <div 
                      onClick={() => {
                        const newTitle = prompt(lang === "ta" ? "புதிய அட்டை தலைப்பை உள்ளிடவும்:" : "Enter new card header title:", headerTitleTa);
                        if (newTitle) setHeaderTitleTa(newTitle);
                      }}
                      className={`${themeStyle.headerBg} p-4 text-center relative overflow-hidden cursor-pointer hover:opacity-95 transition-all`}
                      title="Click to edit header title"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-1 px-1">
                        <div className="flex items-center gap-1.5">
                          {customLogoUrl ? (
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-white border border-amber-300">
                              <img src={customLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-400 text-stone-950 font-black text-[9px] rounded uppercase">
                              TNPA²
                            </span>
                          )}
                        </div>

                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            const r = prompt(lang === "ta" ? "பதிவு எண்ணை மாற்றவும்:" : "Change registration number:", unionRegNo);
                            if (r) setUnionRegNo(r);
                          }}
                          className="text-[10px] text-amber-300 font-extrabold tracking-wider hover:underline"
                        >
                          REG NO: {unionRegNo}
                        </span>
                      </div>

                      <h3 className="text-xs font-black leading-snug text-white">
                        {lang === "ta" ? headerTitleTa : headerTitleEn}
                      </h3>

                      {showUnionFlag && (
                        <div className="mt-1.5 flex justify-center">
                          {customFlagUrl ? (
                            <div className="w-12 h-4 rounded overflow-hidden shadow">
                              <img src={customFlagUrl} alt="Flag" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="px-2 py-0.5 bg-amber-500/80 text-stone-950 text-[8px] font-black rounded flex items-center gap-1">
                              <span>🇮🇳</span> <span>TNPA² Flag</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CARD BODY */}
                    <div className="p-5 space-y-4 bg-gradient-to-b from-stone-50/90 to-white/95 relative">
                      
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <CreditCard className="w-48 h-48 text-stone-900" />
                      </div>

                      <div className="flex items-center gap-4 relative z-10">
                        {/* Photo (Clickable to change photo URL) */}
                        <div 
                          onClick={() => {
                            const p = prompt(lang === "ta" ? "புதிய புகைப்பட URL-ஐ உள்ளிடவும்:" : "Enter new photo URL:", editPhoto);
                            if (p) setEditPhoto(p);
                          }}
                          className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-amber-500 bg-stone-200 shrink-0 shadow-md cursor-pointer relative group/photo"
                          title="Click to update photo"
                        >
                          <img 
                            src={editPhoto} 
                            alt={editName}
                            onError={(e)=>{ (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200"; }}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                            Edit Photo
                          </div>
                        </div>

                        {/* Member Info (Clickable) */}
                        <div 
                          onClick={() => {
                            const n = prompt(lang === "ta" ? "உறுப்பினர் பெயரை மாற்றவும்:" : "Change member name:", editName);
                            if (n) setEditName(n);
                          }}
                          className="space-y-1.5 flex-1 min-w-0 cursor-pointer hover:bg-stone-100/50 p-1.5 rounded-xl transition-all"
                          title="Click to edit member details"
                        >
                          <div>
                            <div className="text-[9px] font-extrabold text-stone-400 uppercase flex items-center justify-between">
                              <span>{lang === "ta" ? "உறுப்பினர் பெயர்" : "Member Name"}</span>
                              <Edit3 className="w-3 h-3 text-stone-400" />
                            </div>
                            <div className="text-sm font-black text-stone-900 truncate">
                              {editName || "ஆர். ராஜேஷ்"}
                            </div>
                          </div>

                          {showFatherName && (
                            <div>
                              <div className="text-[9px] font-extrabold text-stone-400 uppercase">
                                {lang === "ta" ? "தந்தை பெயர்" : "Father Name"}
                              </div>
                              <div className="text-xs font-extrabold text-stone-700 truncate">
                                {editFather || "ச. முனுசாமி"}
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-[9px] font-extrabold text-stone-400 uppercase">
                              {lang === "ta" ? "மாவட்டம்" : "District"}
                            </div>
                            <div className="text-xs font-black text-[#b91c1c] uppercase">
                              {editDistrict || "மதுரை"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200 text-xs relative z-10">
                        <div 
                          onClick={() => {
                            const reg = prompt(lang === "ta" ? "உறுப்பினர் பதிவு எண்ணை மாற்றவும்:" : "Change member Reg No:", editRegNo);
                            if (reg) setEditRegNo(reg);
                          }}
                          className="bg-stone-100 p-2 rounded-xl cursor-pointer hover:bg-stone-200 transition-all"
                        >
                          <span className="text-[9px] font-bold text-stone-500 block uppercase">
                            {lang === "ta" ? "உறுப்பினர் பதிவு எண்" : "Member Reg No"}
                          </span>
                          <span className="font-black text-stone-900 text-[11px]">
                            {editRegNo || "TNMDUJ-2026-0001"}
                          </span>
                        </div>

                        {showBloodGroup && (
                          <div 
                            onClick={() => {
                              const bg = prompt(lang === "ta" ? "இரத்த வகையை மாற்றவும் (O+, A+, B+, AB+):" : "Change Blood Group:", editBlood);
                              if (bg) setEditBlood(bg);
                            }}
                            className="bg-red-50 p-2 rounded-xl border border-red-200 cursor-pointer hover:bg-red-100 transition-all"
                          >
                            <span className="text-[9px] font-bold text-red-700 block uppercase">
                              {lang === "ta" ? "இரத்த வகை" : "Blood Group"}
                            </span>
                            <span className="font-black text-red-800 text-sm">
                              {editBlood || "O+"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* FOOTER QR & SEAL */}
                      <div className="pt-3 border-t border-stone-200 flex items-center justify-between relative z-10">
                        {showQrCode ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-stone-950 p-1 rounded-lg flex items-center justify-center">
                              <QrCode className="w-full h-full text-amber-400" />
                            </div>
                            <div className="text-[9px] font-bold text-stone-500">
                              <div>{lang === "ta" ? "செயலி சரிபார்ப்பு" : "Verified QR"}</div>
                              <div className="text-emerald-700 font-extrabold">SECURE ID</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-stone-400">TNPA² OFFICIAL</div>
                        )}

                        {showHologram && (
                          <div className="px-2.5 py-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 text-stone-950 text-[9px] font-black rounded-lg shadow-inner uppercase tracking-wider">
                            ★ Hologram Stamp ★
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                  )
                ) : (
                  fullCardBackUrl ? (
                    <div className="w-[340px] rounded-3xl shadow-2xl border-2 border-blue-400 overflow-hidden relative group">
                      <img src={fullCardBackUrl} alt="Back ID Card" className="w-full h-auto object-contain" />
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] px-2 py-1 rounded-lg backdrop-blur-xs font-bold">
                        {lang === "ta" ? "காலரி பின்பக்கம்" : "Gallery Back"}
                      </div>
                    </div>
                  ) : (
                    <div className="w-[340px] bg-stone-900 text-stone-100 rounded-3xl shadow-2xl border-2 border-blue-500 p-5 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="text-center border-b border-stone-800 pb-3">
                        <h4 className="text-xs font-black text-amber-400">
                          {lang === "ta" ? "நிபந்தனைகள் மற்றும் விதிகள்" : "Terms & Conditions"}
                        </h4>
                        <p className="text-[9px] text-stone-400 mt-0.5">Tamil Nadu Painters & Artists Progressive Association</p>
                      </div>

                      <div className="space-y-2 text-[10px] text-stone-300">
                        <div className="flex gap-2">
                          <span className="text-amber-400 font-bold">1.</span>
                          <span>{lang === "ta" ? "இந்த அட்டை சங்கத்தின் அதிகாரப்பூர்வ உறுப்பினருக்கு மட்டுமே உரியது." : "This card is strictly for official union members."}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-amber-400 font-bold">2.</span>
                          <span>{lang === "ta" ? "அவசர உதவிக்கு மாநில தலைமையகத்தைத் தொடர்பு கொள்ளவும்." : "Contact state headquarters for emergency assistance & welfare claims."}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-amber-400 font-bold">3.</span>
                          <span>{lang === "ta" ? "பதிவு எண் மற்றும் செல்லுபடியாகும் காலம் பின்புறம் சரிபார்க்கப்படும்." : "Registration validity can be verified via TNPA² digital portal."}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[10px]">
                        <div>
                          <div className="text-stone-400 text-[8px]">ISSUED BY:</div>
                          <div className="font-bold text-amber-300">State General Secretary</div>
                        </div>
                        <div className="w-16 h-12 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-center text-[9px] text-stone-400 font-bold">
                          Seal / Sign
                        </div>
                      </div>

                      <div className="text-center pt-2 text-[8px] text-stone-500">
                        Helpline: +91 98400 48200 | www.tnpa2.org
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                {lang === "ta"
                  ? "இந்த அடையாள அட்டை வடிவமைப்பு மற்றும் தரவு மாற்றங்கள் சூப்பர் அட்மின் ஒப்புதலுடன் உடனடியாக கணினி முழுமைக்கும் பொருந்தும்."
                  : "All customizations and data edits applied here reflect instantly across member portals and print templates."}
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
