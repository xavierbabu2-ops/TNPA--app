import React, { useState } from "react";
import { 
  Award, 
  Printer, 
  X, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  QrCode,
  Share2,
  Download
} from "lucide-react";
import { DistrictInChargePerson } from "../types/districtPortals";

interface DistrictAppointmentOrderModalProps {
  person: DistrictInChargePerson | null;
  isOpen: boolean;
  onClose: () => void;
  lang: "ta" | "en";
}

export default function DistrictAppointmentOrderModal({
  person,
  isOpen,
  onClose,
  lang
}: DistrictAppointmentOrderModalProps) {
  const [activeTab, setActiveTab] = useState<"order" | "id_badge">("order");
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !person) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கம் (TNPA²)\nஅதிகாரப்பூர்வ நியமன ஆணை:\nபெயர்: ${person.name}\nபொறுப்பு: ${person.role} (${person.unitName})\nமாவட்டம்: ${person.districtTa}\nஆணை எண்: ${person.appointmentOrderNo}\nதொடர்பு: ${person.phone}`;
    if (navigator.share) {
      navigator.share({ title: "TNPA² Appointment Order", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "district_leader":
        return lang === "ta" ? "மாவட்ட தலைமை பொறுப்பு" : "District Leadership";
      case "district_executive":
        return lang === "ta" ? "மாவட்ட செயற்குழு பொறுப்பாளர்" : "District Executive Committee";
      case "district_wing":
        return lang === "ta" ? "மாவட்ட சார்பு அணிப் பொறுப்பாளர்" : "District Wing / Cell In-Charge";
      case "town_incharge":
        return lang === "ta" ? "நகரப் பொறுப்பாளர்" : "Town / City In-Charge";
      case "union_incharge":
        return lang === "ta" ? "ஒன்றியப் பொறுப்பாளர்" : "Union / Block In-Charge";
      case "branch_incharge":
        return lang === "ta" ? "பேரூர் / கிளைப் பொறுப்பாளர்" : "Branch / Panchayat In-Charge";
      default:
        return lang === "ta" ? "பொறுப்பாளர்" : "Office Bearer";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:rounded-none">
        
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="bg-stone-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-stone-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-sm tracking-wide">
              {lang === "ta" ? "அதிகாரப்பூர்வ நியமன ஆவணம்" : "Official Appointment Document"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-stone-800 rounded-xl p-0.5 text-xs font-bold border border-stone-700">
              <button
                onClick={() => setActiveTab("order")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "order" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:text-white"
                }`}
              >
                📜 {lang === "ta" ? "நியமன ஆணை" : "Appointment Order"}
              </button>
              <button
                onClick={() => setActiveTab("id_badge")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "id_badge" ? "bg-amber-600 text-white shadow" : "text-stone-300 hover:text-white"
                }`}
              >
                🪪 {lang === "ta" ? "பொறுப்பாளர் அட்டை" : "Executive Badge"}
              </button>
            </div>

            <button
              onClick={handleShare}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-all cursor-pointer border border-stone-700"
              title="பகிரவும்"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "அச்சிடு / PDF" : "Print"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {copiedLink && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-1 px-4 text-center">
            ✅ விவரங்கள் நகலெடுக்கப்பட்டது!
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: OFFICIAL APPOINTMENT ORDER (அதிகாரப்பூர்வ நியமன ஆணை) */}
        {/* ========================================================= */}
        {activeTab === "order" && (
          <div className="p-6 sm:p-8 bg-[#fffdfa] text-stone-900 print:p-4">
            {/* Border Container */}
            <div className="border-4 border-double border-amber-800 p-5 sm:p-7 rounded-2xl relative bg-white shadow-sm">
              
              {/* Watermark Logo in Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                <div className="w-80 h-80 rounded-full border-[20px] border-amber-900 flex items-center justify-center text-7xl font-black">
                  TNPA²
                </div>
              </div>

              {/* Order Header */}
              <div className="text-center border-b-2 border-stone-800 pb-4 mb-5 relative">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-black text-xs shadow-md border-2 border-amber-300">
                    TNPA²
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-[#b91c1c] tracking-tight leading-tight">
                      தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கம்
                    </h2>
                    <p className="text-xs font-extrabold text-stone-700 tracking-wider">
                      TAMIL NADU PAINTERS AND ARTISTS ASSOCIATION (TNPA²)
                    </p>
                  </div>
                </div>

                <div className="inline-block bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide border border-amber-300 mt-1">
                  பதிவு எண்: 452/2018 | தலைமைச் செயலகம்: சென்னை - தமிழ்நாடு
                </div>

                <div className="flex justify-between items-center text-[11px] font-bold text-stone-600 mt-3 pt-2 border-t border-stone-200 px-1">
                  <div>
                    <span className="text-stone-500">ஆணை எண் / Ref: </span>
                    <span className="font-extrabold text-stone-900">{person.appointmentOrderNo}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">தேதி / Date: </span>
                    <span className="font-extrabold text-stone-900">{person.appointedDate}</span>
                  </div>
                </div>
              </div>

              {/* Title Banner */}
              <div className="text-center mb-6">
                <span className="inline-block bg-gradient-to-r from-red-700 via-[#b91c1c] to-amber-700 text-white font-black text-sm sm:text-base px-6 py-1.5 rounded-xl shadow">
                  அதிகாரப்பூர்வ பொறுப்பாளர் நியமன ஆணை
                </span>
                <p className="text-[11px] font-bold text-stone-500 mt-1">
                  OFFICIAL EXECUTIVE APPOINTMENT CERTIFICATE
                </p>
              </div>

              {/* In-Charge Details Box */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                {/* Photo */}
                <div className="relative shrink-0">
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    className="w-28 h-32 object-cover rounded-xl border-2 border-amber-500 shadow-md bg-stone-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300";
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow border-2 border-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Information Grid */}
                <div className="flex-1 space-y-2 text-xs w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-amber-200/80">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-stone-900">
                        திரு. {person.name}
                      </h3>
                      {person.nameEn && (
                        <p className="text-xs font-bold text-stone-500">Mr. {person.nameEn}</p>
                      )}
                    </div>
                    <span className="inline-block self-start sm:self-auto bg-stone-900 text-amber-400 font-extrabold text-[11px] px-3 py-1 rounded-lg">
                      {person.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-stone-800">
                    <div>
                      <span className="text-stone-500 block text-[10px] font-bold">பொறுப்பு வகை:</span>
                      <span className="font-extrabold text-amber-900">{getCategoryLabel(person.category)}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] font-bold">மாவட்டம் & பிரிவு:</span>
                      <span className="font-extrabold text-stone-900">{person.districtTa} மாவட்டம் ({person.unitName})</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] font-bold">கைபேசி எண்:</span>
                      <span className="font-bold text-stone-900">{person.phone}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] font-bold">இரத்த வகை:</span>
                      <span className="font-bold text-red-700">{person.bloodGroup || "O+"}</span>
                    </div>
                    {person.taluk && (
                      <div>
                        <span className="text-stone-500 block text-[10px] font-bold">வட்டம் / தாலுகா:</span>
                        <span className="font-bold text-stone-900">{person.taluk}</span>
                      </div>
                    )}
                    {person.whatsapp && (
                      <div>
                        <span className="text-stone-500 block text-[10px] font-bold">வாட்ஸ்அப்:</span>
                        <span className="font-bold text-emerald-700">{person.whatsapp}</span>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <span className="text-stone-500 block text-[10px] font-bold">முகவரி:</span>
                      <span className="font-semibold text-stone-700">{person.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Declaration Statement */}
              <div className="space-y-2.5 text-stone-800 text-xs leading-relaxed mb-8 bg-stone-50/80 p-4 rounded-xl border border-stone-200 text-justify">
                <p>
                  தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கத்தின் விதிகளின்படி, அமைப்பின் மாநில மற்றும் மாவட்ட நிர்வாகத்தின் ஒப்புதலுடன், திரு. <strong className="text-stone-950 font-black">{person.name}</strong> அவர்கள் <strong className="text-[#b91c1c] font-black">{person.districtTa} மாவட்டம்</strong> சார்ந்த <strong className="text-stone-950 font-black">{person.unitName}</strong> அமைப்பின் <strong className="text-[#b91c1c] font-black">{person.role}</strong> பொறுப்பாளராக அதிகாரப்பூர்வமாக நியமிக்கப்படுகிறார்.
                </p>
                <p>
                  இப்பொறுப்பில் இருந்து கொண்டு தொழிலாளர் நலன் காக்கவும், நலவாரிய திட்டங்கள் உரியவர்களை சென்றடையவும், சங்கத்தின் நற்பெயரையும் ஒழுக்கத்தையும் கட்டிக்காக்கவும் முழு மனதுடன் பணியாற்றுமாறு கேட்டுக் கொள்ளப்படுகிறார்.
                </p>
                {person.notes && (
                  <p className="text-[11px] text-amber-900 font-semibold italic bg-amber-50 p-2 rounded-lg border border-amber-200">
                    📌 சிறப்பு குறிப்பு: {person.notes}
                  </p>
                )}
              </div>

              {/* Signatures & Seal Section */}
              <div className="grid grid-cols-3 gap-2 pt-6 border-t-2 border-dashed border-stone-300 text-center text-[10px] text-stone-700 font-bold">
                <div className="flex flex-col items-center justify-end">
                  <div className="h-10 flex items-center font-serif text-amber-900 italic font-black text-xs">
                    R. Xavier Babu
                  </div>
                  <div className="border-t border-stone-400 w-full pt-1">
                    <span className="block font-black text-stone-900 text-[11px]">ஆர். சேவியர் பாபு</span>
                    <span>மாநில தலைவர்</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-red-600/80 flex flex-col items-center justify-center text-[8px] text-red-700 font-black p-1 uppercase leading-tight bg-red-50/50">
                    <span>TNPA²</span>
                    <span>OFFICIAL</span>
                    <span>SEAL</span>
                  </div>
                  <span className="text-[9px] text-stone-500 mt-1 font-extrabold">அதிகாரப்பூர்வ முத்திரை</span>
                </div>

                <div className="flex flex-col items-center justify-end">
                  <div className="h-10 flex items-center font-serif text-amber-900 italic font-black text-xs">
                    Dist. General Sec.
                  </div>
                  <div className="border-t border-stone-400 w-full pt-1">
                    <span className="block font-black text-stone-900 text-[11px]">மாவட்ட பொதுச்செயலாளர்</span>
                    <span>{person.districtTa} மாவட்டம்</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: EXECUTIVE ID BADGE (பொறுப்பாளர் அடையாள அட்டை) */}
        {/* ========================================================= */}
        {activeTab === "id_badge" && (
          <div className="p-6 sm:p-8 bg-stone-100 flex flex-col items-center justify-center print:bg-white print:p-2">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-amber-500 shadow-2xl bg-gradient-to-b from-[#991b1b] via-[#7f1d1d] to-[#1c1917] text-white p-5 relative">
              
              {/* Union Crest & Card Header */}
              <div className="flex items-center gap-2 border-b border-amber-400/30 pb-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-[#991b1b] text-xs shadow shrink-0 border border-amber-400">
                  TNPA²
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-xs text-amber-300 truncate">
                    தமிழ்நாடு பெயிண்டர்கள் & ஓவியர்கள் சங்கம்
                  </h4>
                  <p className="text-[9px] text-stone-300 font-bold uppercase tracking-wider truncate">
                    {person.districtTa} மாவட்ட நிர்வாகப் பொறுப்பாளர்
                  </p>
                </div>
              </div>

              {/* Photo & Role */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-2">
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    className="w-24 h-28 object-cover rounded-2xl border-2 border-amber-400 shadow-lg bg-stone-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300";
                    }}
                  />
                  <div className="absolute -bottom-2 bg-amber-500 text-stone-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow">
                    {person.districtCode}
                  </div>
                </div>

                <h3 className="font-black text-base text-white mt-1">
                  {person.name}
                </h3>
                <div className="bg-amber-400 text-stone-950 font-black text-xs px-3 py-1 rounded-xl mt-1 shadow-md">
                  {person.role}
                </div>
                <p className="text-[11px] text-amber-200 font-bold mt-0.5">
                  {person.unitName}
                </p>
              </div>

              {/* Badge Details Grid */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-3 text-[11px] space-y-1.5 border border-white/10 mb-4">
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold">ஆணை எண்:</span>
                  <span className="font-black text-amber-300">{person.appointmentOrderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold">கைபேசி எண்:</span>
                  <span className="font-bold text-white">{person.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold">இரத்த வகை:</span>
                  <span className="font-black text-red-400">{person.bloodGroup || "O+"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold">நியமன தேதி:</span>
                  <span className="font-bold text-stone-200">{person.appointedDate}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[9px] text-stone-400 pt-2 border-t border-white/10">
                <span>மாநில தலைமை அங்கீகாரம்</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  செயலில் உள்ளது
                </span>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
