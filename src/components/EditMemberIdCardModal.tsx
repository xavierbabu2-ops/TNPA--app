import React, { useState, useEffect } from "react";
import { 
  X, 
  Upload, 
  Camera, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  HeartHandshake, 
  Briefcase, 
  Calendar,
  RotateCcw,
  Loader2
} from "lucide-react";
import { ALL_38_TAMILNADU_DISTRICTS } from "../data/initialExecutives";

export interface MemberCardEditableData {
  name: string;
  fatherName: string;
  regNumber: string;
  district: string;
  phone: string;
  bloodGroup: string;
  age: string;
  occupation: string;
  address: string;
  photoUrl: string;
}

interface EditMemberIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "ta" | "en";
  initialData: MemberCardEditableData;
  onSave: (updatedData: MemberCardEditableData) => Promise<void>;
  isSaving: boolean;
}

export default function EditMemberIdCardModal({
  isOpen,
  onClose,
  lang,
  initialData,
  onSave,
  isSaving
}: EditMemberIdCardModalProps) {
  const [formData, setFormData] = useState<MemberCardEditableData>(initialData);
  const [photoPreview, setPhotoPreview] = useState<string>(initialData.photoUrl || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setPhotoPreview(initialData.photoUrl || "");
      setErrorMsg(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg(lang === "ta" ? "தயவுசெய்து பட கோப்பை மட்டும் தேர்ந்தெடுக்கவும் (JPG/PNG)" : "Please select an image file (JPG/PNG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setPhotoPreview(res);
      setFormData(prev => ({ ...prev, photoUrl: res }));
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg(lang === "ta" ? "உறுப்பினர் பெயரை உள்ளிடவும்" : "Please enter member name");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg(lang === "ta" ? "கைபேசி எண்ணை உள்ளிடவும்" : "Please enter phone number");
      return;
    }

    try {
      await onSave({
        ...formData,
        photoUrl: photoPreview || formData.photoUrl
      });
    } catch (err) {
      console.error("Save error:", err);
      setErrorMsg(lang === "ta" ? "சேமிப்பதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்." : "Error saving. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-[#C00000] overflow-hidden flex flex-col max-h-[92vh] animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#C00000] via-stone-900 to-black text-white px-6 py-4 flex items-center justify-between border-b-2 border-yellow-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-stone-950 flex items-center justify-center font-black shadow-md shrink-0">
              ✏️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{lang === "ta" ? "உறுப்பினர் அடையாள அட்டை திருத்துதல்" : "Edit Member ID Card Details"}</span>
                <span className="text-[10px] bg-yellow-400 text-stone-950 px-2 py-0.5 rounded-full font-black uppercase">
                  {lang === "ta" ? "புதிய விருப்பம்" : "New Option"}
                </span>
              </h2>
              <p className="text-xs text-stone-300 font-medium">
                {lang === "ta" 
                  ? "பெயர், மாவட்டம், புகைப்படம், இரத்த வகை, தொடர்பு எண் உள்ளிட்ட அனைத்து விவரங்களையும் மாற்றலாம்" 
                  : "Update member name, district, photo, blood group, contact number and card details"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title={lang === "ta" ? "மூடு" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ERROR BANNER */}
        {errorMsg && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center gap-2 text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* PHOTO UPLOAD & PREVIEW SECTION */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-[#C00000] shadow-md bg-stone-200 flex items-center justify-center">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Member" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500";
                    }}
                  />
                ) : (
                  <User className="w-10 h-10 text-stone-400" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#C00000] text-white p-1.5 rounded-full shadow border-2 border-white">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <span className="text-xs font-black text-stone-900 block">
                {lang === "ta" ? "உறுப்பினர் புகைப்படம் (Member Photo)" : "Member Photo"}
              </span>
              <p className="text-[11px] text-stone-500 font-medium">
                {lang === "ta" 
                  ? "கேலரி அல்லது கேமரா வழியாக புதிய புகைப்படத்தை எளிதாக மாற்றலாம் (JPG / PNG)" 
                  : "Upload a fresh passport-style photo from your mobile gallery or files"}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                <label className="px-4 py-2 bg-[#C00000] hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow cursor-pointer transition-all active:scale-95">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "புதிய புகைப்படம் பதிவேற்று" : "Upload New Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                
                {photoPreview !== initialData.photoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(initialData.photoUrl);
                      setFormData(prev => ({ ...prev, photoUrl: initialData.photoUrl }));
                    }}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{lang === "ta" ? "பழைய படம்" : "Reset"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* EDITABLE FIELDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* 1. Name */}
            <div className="space-y-1">
              <label className="font-black text-stone-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#C00000]" />
                <span>{lang === "ta" ? "உறுப்பினர் பெயர் (Full Name) *" : "Member Name *"}</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="எ.கா: மு. பிரகாசம்"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
              />
            </div>

            {/* 2. Father's / Husband's Name */}
            <div className="space-y-1">
              <label className="font-black text-stone-700 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-[#C00000]" />
                <span>{lang === "ta" ? "தந்தை / கணவர் பெயர் (Father's Name) *" : "Father's Name *"}</span>
              </label>
              <input
                type="text"
                required
                value={formData.fatherName}
                onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                placeholder="எ.கா: சு. முனுசாமி"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
              />
            </div>

            {/* 3. Member / Reg Number */}
            <div className="space-y-1">
              <label className="font-black text-stone-700 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#C00000]" />
                <span>{lang === "ta" ? "உறுப்பினர் எண் (Registration No) *" : "Member / Reg No *"}</span>
              </label>
              <input
                type="text"
                required
                value={formData.regNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, regNumber: e.target.value }))}
                placeholder="எ.கா: 4016 அல்லது TNP-MDU-4016"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-[#C00000] focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
              />
            </div>

            {/* 4. District (All 38 Districts Dropdown) */}
            <div className="space-y-1">
              <label className="font-black text-stone-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C00000]" />
                <span>{lang === "ta" ? "மாவட்டம் (District - 38 மாவட்டங்கள்) *" : "District (All 38 Districts) *"}</span>
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] cursor-pointer"
              >
                {ALL_38_TAMILNADU_DISTRICTS.map((d) => (
                  <option key={d.code} value={d.ta}>
                    {d.ta} ({d.en} - {d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Occupation */}
            <div className="space-y-1">
              <label className="font-black text-stone-700 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[#C00000]" />
                <span>{lang === "ta" ? "தொழில் / பணிப் பிரிவு (Occupation) *" : "Occupation *"}</span>
              </label>
              <input
                type="text"
                required
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                placeholder="எ.கா: பெயிண்டர் மற்றும் ஓவியர்"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
              />
            </div>

            {/* 6. Phone Number */}
            <div className="space-y-1">
              <label className="font-black text-stone-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#C00000]" />
                <span>{lang === "ta" ? "கைபேசி எண் (Phone Number) *" : "Phone Number *"}</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="எ.கா: 9842189420"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
              />
            </div>

            {/* 7. Blood Group */}
            <div className="space-y-1">
              <label className="font-black text-stone-700 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-[#C00000]" />
                <span>{lang === "ta" ? "இரத்த வகை (Blood Group) *" : "Blood Group *"}</span>
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-[#C00000] focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] cursor-pointer"
              >
                <option value="O+">O+ (பாசிட்டிவ்)</option>
                <option value="O-">O- (நெகட்டிவ்)</option>
                <option value="A+">A+ (பாசிட்டிவ்)</option>
                <option value="A-">A- (நெகட்டிவ்)</option>
                <option value="B+">B+ (பாசிட்டிவ்)</option>
                <option value="B-">B- (நெகட்டிவ்)</option>
                <option value="AB+">AB+ (பாசிட்டிவ்)</option>
                <option value="AB-">AB- (நெகட்டிவ்)</option>
              </select>
            </div>

            {/* 8. Age */}
            <div className="space-y-1">
              <label className="font-black text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C00000]" />
                <span>{lang === "ta" ? "வயது (Age) *" : "Age *"}</span>
              </label>
              <input
                type="text"
                required
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="எ.கா: 38"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
              />
            </div>

            {/* 9. Full Address */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-black text-stone-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C00000]" />
                <span>{lang === "ta" ? "இருப்பிடம் / முழு முகவரி (Full Address / Location) *" : "Full Address *"}</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="எ.கா: 1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] resize-none"
              />
            </div>

          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {lang === "ta" 
                ? "இங்கே செய்யப்படும் திருத்தங்கள் உடனடியாக அடையாள அட்டையின் முன்பக்கம் மற்றும் பின்பக்கத்தில் புதுப்பிக்கப்படும்."
                : "Edits saved here will immediately update both the front and back of the member ID card."}
            </span>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              {lang === "ta" ? "ரத்து செய் (Cancel)" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#C00000] to-[#990000] hover:from-red-700 hover:to-red-900 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs border border-yellow-400 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                  <span>{lang === "ta" ? "சேமிக்கப்படுகிறது..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-yellow-300" />
                  <span>{lang === "ta" ? "💾 மாற்றங்களைச் சேமி (Save Card)" : "Save Card"}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
