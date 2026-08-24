import React, { useState } from "react";
import { 
  CreditCard, 
  Download, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Building2,
  Sparkles,
  Award,
  Upload,
  FileUp,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { MemberRegistration, UserAccount } from "../types";
import UnionOfficialIdCard from "./UnionOfficialIdCard";
import { formatMemberNumber, generateDistrictRegNumber } from "../utils/districtCodes";
import { storage, db } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

interface MemberIdCardPortalProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  registrations: MemberRegistration[];
  onUpdateRegistration?: (updated: MemberRegistration) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function MemberIdCardPortal({
  lang,
  currentUser,
  registrations = [],
  onUpdateRegistration,
  onAddAuditLog
}: MemberIdCardPortalProps) {
  const isSuperAdmin = currentUser?.role === "super_admin" || currentUser?.role?.includes("admin");

  const safeRegistrations = Array.isArray(registrations) ? registrations : [];

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    safeRegistrations.length > 0 ? safeRegistrations[0].id : ""
  );

  const [activeSubTab, setActiveSubTab] = useState<"id_card" | "application" | "directory_cards">("id_card");
  const [cardSide, setCardSide] = useState<"front" | "back" | "both">("both");
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  // Custom fallback state
  const [customName, setCustomName] = useState(currentUser?.name || "ஆர். ராஜேஷ்");
  const [customFather, setCustomFather] = useState("ச. முனுசாமி");
  const [customDistrict, setCustomDistrict] = useState(currentUser?.district || "மதுரை");
  const [customPhone, setCustomPhone] = useState(currentUser?.phone || "9842189420");
  const [customBlood, setCustomBlood] = useState(currentUser?.bloodGroup || "O+");
  const [customRegNo, setCustomRegNo] = useState(currentUser?.regNumber || "TNMDUJ-2026-0042");
  const [customDob, setCustomDob] = useState("15-06-1988 (38 வயது)");

  const currentMember = safeRegistrations.find(r => r && r.id === selectedMemberId) || safeRegistrations[0];

  const memberName = currentMember?.name || customName;
  const memberFather = currentMember?.fatherName || customFather;
  const memberDistrict = currentMember?.district || customDistrict;
  const memberPhone = currentMember?.phone || customPhone;
  const memberBlood = currentMember?.bloodGroup || customBlood;
  const rawRegNo = currentMember?.regNumber || currentUser?.regNumber;
  const memberRegNo = rawRegNo ? formatMemberNumber(rawRegNo, memberDistrict) : generateDistrictRegNumber(memberDistrict);
  const memberPhoto = currentMember?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file || !currentMember) return;

    const setUploading = side === "front" ? setUploadingFront : setUploadingBack;
    setUploading(true);

    try {
      const storageRef = ref(storage, `id_cards/${currentMember.id}_${side}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Update Firestore
      const docRef = doc(db, "registrations", currentMember.id);
      const updateData = side === "front" ? { cardFrontUrl: downloadUrl } : { cardBackUrl: downloadUrl };
      await updateDoc(docRef, updateData);

      const updatedMember = {
        ...currentMember,
        ...(side === "front" ? { cardFrontUrl: downloadUrl } : { cardBackUrl: downloadUrl })
      };

      if (onUpdateRegistration) {
        onUpdateRegistration(updatedMember);
      }

      onAddAuditLog(
        `Upload ID Card (${side})`,
        `Successfully uploaded and stored ID card ${side} image for ${currentMember.name} via Firebase Storage`
      );

      alert(
        lang === "ta"
          ? `✅ அடையாள அட்டை ${side === "front" ? "முன்பக்க" : "பின்பக்க"} படம் வெற்றிகரமாக பதிவேற்றப்பட்டு ஃபயர்பேஸ் கிளவுடில் சேமிக்கப்பட்டது!`
          : `✅ ID card ${side} image uploaded and saved successfully to Firebase Storage!`
      );
    } catch (error) {
      console.error("Storage upload error, using local fallback:", error);
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const docRef = doc(db, "registrations", currentMember.id);
          const updateData = side === "front" ? { cardFrontUrl: dataUrl } : { cardBackUrl: dataUrl };
          await updateDoc(docRef, updateData);
        } catch (dbErr) {
          console.error("Firestore fallback error:", dbErr);
        }

        const updatedMember = {
          ...currentMember,
          ...(side === "front" ? { cardFrontUrl: dataUrl } : { cardBackUrl: dataUrl })
        };

        if (onUpdateRegistration) {
          onUpdateRegistration(updatedMember);
        }

        onAddAuditLog(
          `Upload ID Card (${side} - Local Fallback)`,
          `Stored ID card ${side} image locally for ${currentMember.name}`
        );

        alert(
          lang === "ta"
            ? `⚠️ கிளவுட் ஸ்டோரேஜ் இணைப்பு தவறியதால் படம் உள்ளூர் தரவாக சேமிக்கப்பட்டது.`
            : `⚠️ Cloud storage connection failed. Image saved via local fallback.`
        );
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
    onAddAuditLog("Print Member ID Card", `Printed official ID card for: ${memberName}`);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#b91c1c] via-stone-900 to-[#1e1b4b] text-white p-6 md:p-8 shadow-xl border border-amber-500/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs text-amber-300 font-extrabold">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>{lang === "ta" ? "அதிகாரப்பூர்வ டிஜிட்டல் அடையாள அட்டை & விண்ணப்பம்" : "Official Digital ID Card & Application Portal"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {lang === "ta" ? "உறுப்பினர் அடையாள அட்டை & விண்ணப்ப படிவம்" : "Member ID Card & Application Form"}
            </h1>
            <p className="text-stone-300 text-xs md:text-sm max-w-xl">
              {lang === "ta"
                ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் பதிவு பெற்ற உறுப்பினர்களுக்கான துல்லியமான அடையாள அட்டை வடிவமைப்பு."
                : "Official registered member identity cards matching the exact union layout specification."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab("id_card")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                activeSubTab === "id_card"
                  ? "bg-amber-500 text-stone-950 shadow-lg"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {lang === "ta" ? "🪪 அடையாள அட்டை (ID Card)" : "🪪 ID Card"}
            </button>
            <button
              onClick={() => setActiveSubTab("application")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                activeSubTab === "application"
                  ? "bg-amber-500 text-stone-950 shadow-lg"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {lang === "ta" ? "📄 விண்ணப்ப படிவம் (Application)" : "📄 Application Form"}
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveSubTab("directory_cards")}
                className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeSubTab === "directory_cards"
                    ? "bg-amber-500 text-stone-950 shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {lang === "ta" ? "👥 அனைத்து அட்டைகள் (Manage All)" : "👥 Manage All IDs"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Member Selector & Print controls */}
      {registrations.length > 0 && activeSubTab !== "directory_cards" && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-stone-700 shrink-0">
              {lang === "ta" ? "உறுப்பினரைத் தேர்ந்தெடு:" : "Select Member:"}
            </span>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#b91c1c] w-full sm:w-72"
            >
              {registrations.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.district} - {m.regNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-stone-100 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setCardSide("both")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${cardSide === "both" ? "bg-stone-950 text-white" : "text-stone-600 hover:text-stone-900"}`}
              >
                {lang === "ta" ? "இரு பக்கங்கள்" : "Both Sides"}
              </button>
              <button
                onClick={() => setCardSide("front")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${cardSide === "front" ? "bg-stone-950 text-white" : "text-stone-600 hover:text-stone-900"}`}
              >
                {lang === "ta" ? "முன்பக்கம் (Front)" : "Front"}
              </button>
              <button
                onClick={() => setCardSide("back")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${cardSide === "back" ? "bg-stone-950 text-white" : "text-stone-600 hover:text-stone-900"}`}
              >
                {lang === "ta" ? "பின்பக்கம் (Back)" : "Back"}
              </button>
            </div>

            <button
              onClick={handlePrintCard}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === "ta" ? "அட்டை அச்சிடு (Print ID Card)" : "Print ID Card"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 1: DIGITAL ID CARD VIEW (EXACT)    */}
      {/* ========================================== */}
      {activeSubTab === "id_card" && (
        <div className="flex flex-col items-center space-y-8 w-full">
          
          <UnionOfficialIdCard
            member={{
              id: currentMember?.id || "member_1",
              name: memberName,
              fatherName: memberFather,
              regNumber: memberRegNo,
              district: memberDistrict,
              occupation: currentMember?.occupation || "பெயிண்டர்",
              photoUrl: memberPhoto,
              bloodGroup: memberBlood,
              age: currentMember?.age || "38",
              phone: memberPhone,
              place: memberDistrict || "மதுரை"
            }}
            side={cardSide}
            currentUser={currentUser}
            isEditable={isSuperAdmin}
            onUpdatePhoto={(newUrl) => {
              if (currentMember) {
                currentMember.photoUrl = newUrl;
              }
              onAddAuditLog("Update Member Card Photo", `Updated official card photo for: ${memberName}`);
            }}
            onUpdateLogo={(newLogoUrl) => {
              onAddAuditLog("Update Association Logo", `Super Admin updated association logo for all ID cards`);
            }}
          />

          {/* Print Action Button */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handlePrintCard}
              className="px-8 py-3.5 bg-[#c80000] hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>{lang === "ta" ? "அடையாள அட்டை அச்சிடு / PDF (Print Card)" : "Print ID Card / PDF"}</span>
            </button>
          </div>

          {/* Firebase Storage & Gallery Upload Component */}
          <div className="w-full max-w-3xl bg-gradient-to-br from-stone-900 to-stone-950 text-white p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-6 mt-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-400">
                    {lang === "ta" ? "அடையாள அட்டை கேலரி பதிவேற்றம் (Firebase Storage Sync)" : "Device Gallery Upload & Firebase Storage Sync"}
                  </h3>
                  <p className="text-stone-400 text-xs">
                    {lang === "ta" 
                      ? "உங்களின் அடையாள அட்டை முன் மற்றும் பின்பக்க படங்களை கேலரியிலிருந்து பதிவேற்றி ஃபயர்பேஸ் கிளவுடில் சேமிக்கவும்."
                      : "Upload ID card front and back images from your gallery and sync with Firebase Storage & Firestore."}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/30">
                Cloud Sync Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Front ID Card Upload */}
              <div className="space-y-3 bg-stone-900/80 p-5 rounded-2xl border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-200">
                    {lang === "ta" ? "🪪 அடையாள அட்டை முன்பக்கம் (Front Side)" : "🪪 ID Card Front Side"}
                  </span>
                  {currentMember?.cardFrontUrl && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {lang === "ta" ? "சேமிக்கப்பட்டது" : "Uploaded"}
                    </span>
                  )}
                </div>

                {currentMember?.cardFrontUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-stone-700 h-40 bg-stone-950 flex items-center justify-center">
                    <img src={currentMember.cardFrontUrl} alt="ID Front" className="h-full w-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={currentMember.cardFrontUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-lg">
                        {lang === "ta" ? "பெரிதாக காண்க" : "View"}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 rounded-xl border-2 border-dashed border-stone-700 flex flex-col items-center justify-center gap-2 bg-stone-950/50 text-stone-400">
                    <FileUp className="w-8 h-8 text-amber-500/60" />
                    <span className="text-xs font-medium">{lang === "ta" ? "முன்பக்க படத்தைத் தேர்ந்தெடுக்கவும்" : "Select front image file"}</span>
                  </div>
                )}

                <label className="block w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs text-center rounded-xl cursor-pointer transition-all shadow-md">
                  {uploadingFront ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> {lang === "ta" ? "பதிவேற்றப்படுகிறது..." : "Uploading..."}
                    </span>
                  ) : (
                    <span>{lang === "ta" ? "📁 முன்பக்கம் பதிவேற்று (Upload Front)" : "📁 Upload Front Image"}</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "front")}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Back ID Card Upload */}
              <div className="space-y-3 bg-stone-900/80 p-5 rounded-2xl border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-200">
                    {lang === "ta" ? "🪪 அடையாள அட்டை பின்பக்கம் (Back Side)" : "🪪 ID Card Back Side"}
                  </span>
                  {currentMember?.cardBackUrl && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {lang === "ta" ? "சேமிக்கப்பட்டது" : "Uploaded"}
                    </span>
                  )}
                </div>

                {currentMember?.cardBackUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-stone-700 h-40 bg-stone-950 flex items-center justify-center">
                    <img src={currentMember.cardBackUrl} alt="ID Back" className="h-full w-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={currentMember.cardBackUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-lg">
                        {lang === "ta" ? "பெரிதாக காண்க" : "View"}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 rounded-xl border-2 border-dashed border-stone-700 flex flex-col items-center justify-center gap-2 bg-stone-950/50 text-stone-400">
                    <FileUp className="w-8 h-8 text-amber-500/60" />
                    <span className="text-xs font-medium">{lang === "ta" ? "பின்பக்க படத்தைத் தேர்ந்தெடுக்கவும்" : "Select back image file"}</span>
                  </div>
                )}

                <label className="block w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs text-center rounded-xl cursor-pointer transition-all shadow-md">
                  {uploadingBack ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> {lang === "ta" ? "பதிவேற்றப்படுகிறது..." : "Uploading..."}
                    </span>
                  ) : (
                    <span>{lang === "ta" ? "📁 பின்பக்கம் பதிவேற்று (Upload Back)" : "📁 Upload Back Image"}</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "back")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 2: APPLICATION FORM VIEW           */}
      {/* ========================================== */}
      {activeSubTab === "application" && (
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-stone-200 shadow-sm max-w-4xl mx-auto space-y-8">
          
          <div className="text-center border-b border-stone-200 pb-6 space-y-2">
            <div className="flex justify-center items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#b91c1c] text-white flex items-center justify-center font-black text-lg">
                T
              </div>
              <h2 className="text-xl font-black text-stone-900">
                தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் (TNPA²)
              </h2>
            </div>
            <p className="text-stone-600 text-xs font-bold">
              பதிவு அலுவலகம்: எண் 1/14, அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107 | அரசு பதிவு எண்: TNMDUJCLMDUTU-50-26-00044
            </p>
            <h3 className="text-base font-black text-[#b91c1c] pt-2">
              {lang === "ta" ? "உறுப்பினர் சேர்க்கை & நலவாரிய அடையாள அட்டை விண்ணப்பப் படிவம்" : "Official Membership & Welfare Board ID Card Application Form"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">{lang === "ta" ? "உறுப்பினர் முழு பெயர் (Full Name):" : "Member Full Name:"}</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberName}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">{lang === "ta" ? "தந்தை பெயர் (Father's Name):" : "Father's Name:"}</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberFather}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">{lang === "ta" ? "பிறந்த தேதி & வயது:" : "DOB & Age:"}</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {customDob}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">{lang === "ta" ? "இரத்த வகை (Blood Group):" : "Blood Group:"}</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberBlood}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">{lang === "ta" ? "கைபேசி எண் (Mobile Phone):" : "Mobile Phone:"}</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberPhone}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">{lang === "ta" ? "மாவட்டம் (District):" : "District:"}</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberDistrict}
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-xs space-y-3">
            <h4 className="font-black text-stone-900">{lang === "ta" ? "உறுப்பினர் உறுதிமொழி & பிரகடனம்:" : "Member Declaration:"}</h4>
            <p className="text-stone-700 leading-relaxed font-medium">
              {lang === "ta"
                ? "“நான் தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் (TNPA²) சட்டதிட்டங்களை முழுமையாக ஏற்றுக்கொள்கிறேன். சங்கத்தின் வளர்ச்சிக்கும், உறுப்பினர்களின் நலனுக்கும் முழு ஒத்துழைப்பு நல்குவேன் என உறுதி அளிக்கிறேன்.”"
                : "“I hereby declare that I abide by the bylaws of TNPA² and will uphold the welfare and unity of all construction painters across Tamil Nadu.”"}
            </p>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-stone-200 text-xs">
            <div className="text-center space-y-4">
              <div className="h-10 border-b border-stone-400 w-40 mx-auto" />
              <span className="font-bold text-stone-700">{lang === "ta" ? "உறுப்பினர் கையொப்பம்" : "Applicant Signature"}</span>
            </div>

            <button
              onClick={handlePrintCard}
              className="px-6 py-3 bg-[#b91c1c] hover:bg-rose-700 text-white font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{lang === "ta" ? "விண்ணப்பத்தைப் பதிவிறக்கு (Download PDF)" : "Download Application"}</span>
            </button>

            <div className="text-center space-y-4">
              <div className="h-10 border-b border-stone-400 w-40 mx-auto" />
              <span className="font-bold text-stone-700">{lang === "ta" ? "மாநில தலைவர் முத்திரை" : "State President Seal"}</span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 3: MANAGE ALL ID CARDS (ADMIN)     */}
      {/* ========================================== */}
      {activeSubTab === "directory_cards" && isSuperAdmin && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                {lang === "ta" ? "அனைத்து உறுப்பினர்களின் அடையாள அட்டை மேலாண்மை" : "Manage All Members ID Cards"}
              </h3>
              <p className="text-stone-400 text-xs">
                {registrations.length} {lang === "ta" ? "பதிவு பெற்ற உறுப்பினர்கள்" : "Registered Members"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registrations.map((mem) => (
              <div key={mem.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={mem.photoUrl} alt="" className="h-12 w-12 rounded-xl object-cover border border-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-black text-stone-900 text-xs truncate">{mem.name}</h4>
                    <p className="text-stone-500 text-[11px] truncate">{mem.district} • {mem.regNumber}</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ID Card Ready</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedMemberId(mem.id);
                    setActiveSubTab("id_card");
                  }}
                  className="px-3 py-1.5 bg-[#b91c1c] text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-all shrink-0 cursor-pointer"
                >
                  {lang === "ta" ? "அட்டை காண்க" : "View ID"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
