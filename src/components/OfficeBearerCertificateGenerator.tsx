import React, { useState, useRef } from "react";
import {
  Award,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Share2,
  Upload,
  Sparkles,
  Building2,
  FileText,
  BadgeCheck,
  Clock,
  RefreshCw
} from "lucide-react";
import { UserAccount } from "../types";

interface OfficeBearerCertificateGeneratorProps {
  lang: "ta" | "en";
  currentUser?: UserAccount | null;
  onAddAuditLog?: (action: string, details: string) => void;
}

export const TN_DISTRICTS = [
  "அரியலூர்", "செங்கல்பட்டு", "சென்னை", "கோயம்புத்தூர்", "கடலூர்", "தர்மபுரி", "திண்டுக்கல்", 
  "ஈரோடு", "கள்ளக்குறிச்சி", "காஞ்சிபுரம்", "கன்னியாகுமரி", "கரூர்", "கிருஷ்ணகிரி", "மதுரை", 
  "மயிலாடுதுறை", "நாகப்பட்டினம்", "நாமக்கல்", "நீலகிரி", "பெரம்பலூர்", "புதுக்கோட்டை", 
  "இராமநாதபுரம்", "ராணிப்பேட்டை", "சேலம்", "சிவகங்கை", "தென்காசி", "தஞ்சாவூர்", "தேனி", 
  "தூத்துக்குடி", "திருச்சிராப்பள்ளி", "திருநெல்வேலி", "திருப்பத்தூர்", "திருப்பூர்", "திருவள்ளூர்", 
  "திருவண்ணாமலை", "திருவாரூர்", "வேலூர்", "விழுப்புரம்", "விருதுநகர்"
];

export const PRESET_POSITIONS = [
  "மாவட்ட தலைவர் (District President)",
  "மாவட்ட செயலாளர் (District Secretary)",
  "மாவட்ட பொருளாளர் (District Treasurer)",
  "மாவட்ட துணைத் தலைவர் (District Vice President)",
  "மாவட்ட இணைச் செயலாளர் (District Joint Secretary)",
  "மாவட்ட இளைஞரணி செயலாளர் (District Youth Wing Secretary)",
  "ஒன்றிய தலைவர் (Block President)",
  "ஒன்றிய செயலாளர் (Block Secretary)",
  "நகர செயலாளர் (Town Secretary)",
  "கிளை தலைவர் (Branch President)",
  "கிளை செயலாளர் (Branch Secretary)",
  "செயற்குழு உறுப்பினர் (Executive Committee Member)"
];

export default function OfficeBearerCertificateGenerator({
  lang,
  currentUser,
  onAddAuditLog
}: OfficeBearerCertificateGeneratorProps) {
  // Input fields
  const [executiveName, setExecutiveName] = useState<string>(currentUser?.name || "ரா. கார்த்திகேயன்");
  const [designation, setDesignation] = useState<string>("மாவட்ட தலைவர் (District President)");
  const [district, setDistrict] = useState<string>(currentUser?.district || "மதுரை");
  const [membershipId, setMembershipId] = useState<string>(currentUser?.regNumber || "TNP-MDU-2026-0042");
  
  // Default appointment date: 60 days before today to show eligible by default, but editable
  const defaultEligibleDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [appointmentDate, setAppointmentDate] = useState<string>(defaultEligibleDate);
  
  const [photoUrl, setPhotoUrl] = useState<string>(
    currentUser?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500"
  );
  const [certificateSerial] = useState<string>(`TNPA/OB-CERT/2026/${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate] = useState<string>(new Date().toLocaleDateString("ta-IN", { day: "2-digit", month: "2-digit", year: "numeric" }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printCertificateRef = useRef<HTMLDivElement>(null);

  // 45 Days Rule Calculation
  const calculateDaysServed = (apptDateStr: string): number => {
    if (!apptDateStr) return 0;
    const appt = new Date(apptDateStr);
    const today = new Date();
    const diffTime = today.getTime() - appt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const daysServed = calculateDaysServed(appointmentDate);
  const isEligible = daysServed >= 45;
  const daysRemaining = 45 - daysServed;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset loaders for quick demo / testing
  const loadEligiblePreset = () => {
    setExecutiveName("ரா. கார்த்திகேயன்");
    setDesignation("மாவட்ட தலைவர் (District President)");
    setDistrict("மதுரை");
    setMembershipId("TNP-MDU-2026-0042");
    setAppointmentDate(new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  };

  const loadIneligiblePreset = () => {
    setExecutiveName("மு. சுரேஷ் குமார்");
    setDesignation("ஒன்றிய செயலாளர் (Block Secretary)");
    setDistrict("திருச்சிராப்பள்ளி");
    setMembershipId("TNP-TRY-2026-0189");
    setAppointmentDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  };

  // High Quality Print / PDF
  const handlePrintCertificate = () => {
    if (!isEligible) {
      alert(
        lang === "ta"
          ? `❌ பொறுப்பாளர் சான்றிதழ் பெற இன்னும் ${daysRemaining} நாட்கள் சேவை காலம் தேவைப்படுகிறது!`
          : `❌ Minimum 45 days of active service required. ${daysRemaining} days remaining.`
      );
      return;
    }
    window.print();
    onAddAuditLog?.("Office Bearer Certificate Printed", `Generated certificate for ${executiveName} (${designation}) - ${district}`);
  };

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    if (!isEligible) return;
    const text = encodeURIComponent(
      `*தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் (TN PA²)*\n\n` +
      `📜 *பொறுப்பாளர் சான்றிதழ் சரிபார்ப்பு*\n` +
      `👤 பொறுப்பாளர்: ${executiveName}\n` +
      `🎖️ பதவி: ${designation}\n` +
      `📍 மாவட்டம்: ${district}\n` +
      `📅 பொறுப்பேற்ற தேதி: ${appointmentDate} (${daysServed} நாட்கள் சேவை)\n` +
      `🆔 சான்றிதழ் எண்: ${certificateSerial}\n` +
      `🏛️ அரசு பதிவு எண்: TNMDUJCLMDUTU- 50-26-00044\n\n` +
      `மாநில பொதுக்குழு மற்றும் செயற்குழுவால் அங்கீகரிக்கப்பட்ட அதிகாரப்பூர்வ சான்றிதழ்.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out] text-stone-900">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-[#78350f] to-rose-950 text-white p-6 md:p-8 shadow-2xl border-2 border-amber-500/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-black text-amber-300">
              <Award className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>அரசு பதிவு எண்: TNMDUJCLMDUTU- 50-26-00044</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் (TN PA²)
            </h1>
            <h2 className="text-lg md:text-xl font-extrabold text-amber-300">
              அதிகாரப்பூர்வ பொறுப்பாளர் சான்றிதழ் உருவாக்கும் தளம் (Office Bearer Certificate Generator)
            </h2>
            <p className="text-xs md:text-sm text-stone-200 leading-relaxed font-medium">
              சங்கத்தின் விதிமுறைப்படி, பொறுப்பேற்ற தேதியிலிருந்து குறைந்தபட்சம் <strong className="text-amber-300 underline">45 நாட்கள் தீவிர சேவை</strong> ஆற்றிய பொறுப்பாளர்களுக்கு மட்டுமே மாநில தலைமையால் அதிகாரப்பூர்வமாக இச்சான்றிதழ் வழங்கப்படுகிறது.
            </p>
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="flex flex-col gap-2 shrink-0 bg-stone-900/80 p-3 rounded-2xl border border-amber-500/30">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider text-center">
              விரைவு சோதனை (Quick Test)
            </span>
            <button
              onClick={loadEligiblePreset}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>45+ நாட்கள் பணி (தகுதி பெற்றது)</span>
            </button>
            <button
              onClick={loadIneligiblePreset}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>20 நாட்கள் பணி (தகுதியற்றது)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FORM & ELIGIBILITY VERIFICATION CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUT CONTROLS */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <span>பொறுப்பாளர் விவரங்கள்</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              Input Details
            </span>
          </div>

          <div className="space-y-3 text-xs font-bold text-stone-700">
            <div>
              <label className="block text-stone-700 mb-1 font-extrabold">பொறுப்பாளர் பெயர் (Executive Name) *</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={executiveName}
                  onChange={(e) => setExecutiveName(e.target.value)}
                  placeholder="பெயர் உள்ளிடவும்"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-extrabold">பொறுப்பு / பதவி (Designation / Post) *</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-stone-800"
              >
                {PRESET_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-extrabold">மாவட்டம் / கிளை (District / Branch) *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-stone-800"
              >
                {TN_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist} மாவட்டம்</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-extrabold">உறுப்பினர் எண் / ஆதார் எண் (Membership ID) *</label>
              <input
                type="text"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                placeholder="எ.கா: TNP-MDU-2026-0042"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-extrabold flex items-center justify-between">
                <span>பொறுப்பேற்ற தேதி (Appointment Date) *</span>
                <span className="text-[10px] text-amber-700 font-bold">45 நாள் தகுதி விதி</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-stone-800"
                />
              </div>
            </div>

            {/* Photo Upload Box */}
            <div>
              <label className="block text-stone-700 mb-1 font-extrabold">பொறுப்பாளர் புகைப்படம் (Member Photo) *</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-16 rounded-lg border-2 border-amber-500 overflow-hidden bg-stone-100 shrink-0 shadow-inner">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>கேலரியிலிருந்து படம் மாற்றுக</span>
                  </button>
                  <p className="text-[10px] text-stone-400 mt-1">பாஸ்போர்ட் அளவு படம் பரிந்துரைக்கப்படுகிறது</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 45 DAYS ELIGIBILITY & LIVE STATUS CARD */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          
          {/* ELIGIBILITY STATUS PANEL */}
          <div className={`rounded-3xl p-6 shadow-xl border-2 transition-all ${
            isEligible 
              ? "bg-gradient-to-br from-emerald-950/90 via-stone-900 to-emerald-950 text-white border-emerald-500/50" 
              : "bg-gradient-to-br from-rose-950/90 via-stone-900 to-amber-950 text-white border-rose-500/50"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isEligible ? "bg-emerald-500 text-stone-950" : "bg-rose-500 text-white"
              }`}>
                {isEligible ? <BadgeCheck className="w-8 h-8" /> : <Clock className="w-8 h-8 animate-spin" />}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isEligible ? "bg-emerald-400 text-stone-950" : "bg-rose-400 text-stone-950"
                  }`}>
                    {isEligible ? "45 Days Completed • Eligible" : "Tenure Incomplete • Not Eligible"}
                  </span>
                  <span className="text-xs font-mono text-stone-300 font-bold">
                    சேவை காலம்: <strong className="text-amber-300 text-sm">{daysServed} நாட்கள்</strong> (தேவை: 45 நாட்கள்)
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-black text-white">
                  {isEligible ? (
                    <span className="text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      சான்றிதழ் பெற தகுதி பெற்றுள்ளீர்கள்! (Certificate Unlocked)
                    </span>
                  ) : (
                    <span className="text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      சான்றிதழ் பெற இன்னும் {daysRemaining} நாட்கள் சேவை தேவை!
                    </span>
                  )}
                </h3>

                <p className="text-xs md:text-sm text-stone-200 leading-relaxed font-medium">
                  {isEligible ? (
                    "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் விதிமுறைகளின்படி, பொறுப்பேற்ற தேதியிலிருந்து 45 நாட்களுக்கு மேல் சிறப்பாக பணியாற்றியமை உறுதிசெய்யப்பட்டு, அதிகாரப்பூர்வ பொறுப்பாளர் சான்றிதழ் உருவாக்கப்பட்டுள்ளது."
                  ) : (
                    `பொறுப்பாளர் சான்றிதழ் பெற இன்னும் ${daysRemaining} நாட்கள் சேவை காலம் மீதமுள்ளது. சங்கத்தின் விதிமுறைகளின்படி, பொறுப்பேற்ற தேதியிலிருந்து குறைந்தபட்சம் 45 நாட்கள் தீவிர மற்றும் சிறந்த சேவை ஆற்றிய பிறகே மாநில தலைமையின் அதிகாரப்பூர்வ சான்றிதழ் வழங்கப்படும்.`
                  )}
                </p>

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-stone-300 mb-1">
                    <span>பொறுப்பேற்றது: {appointmentDate}</span>
                    <span>முன்னேற்றம்: {Math.min(100, Math.round((daysServed / 45) * 100))}%</span>
                  </div>
                  <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isEligible ? "bg-gradient-to-r from-emerald-500 to-amber-400" : "bg-gradient-to-r from-rose-500 to-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.round((daysServed / 45) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="bg-white p-5 rounded-3xl shadow-lg border border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-xs text-stone-800">சான்றிதழ் பதிவிறக்கம் & அச்சிடுதல்</h4>
              <p className="text-[11px] text-stone-500">Official High-Definition Landscape Print</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleShareWhatsApp}
                disabled={!isEligible}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp-ல் பகிர்</span>
              </button>

              <button
                onClick={handlePrintCertificate}
                disabled={!isEligible}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>உயர் தரத்தில் அச்சிடு / PDF சேமி (Print Certificate)</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. OFFICIAL HIGH-QUALITY CERTIFICATE RENDER VIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>அதிகாரப்பூர்வ சான்றிதழ் மாதிரி முன்னோட்டம் (Official Certificate Preview)</span>
          </h3>
          <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
            {certificateSerial}
          </span>
        </div>

        {/* PRINTABLE HIGH-RESOLUTION CERTIFICATE WRAPPER */}
        <div className="overflow-x-auto pb-4">
          <div 
            ref={printCertificateRef}
            id="tnpa-official-certificate"
            className="w-[1000px] min-w-[1000px] mx-auto bg-[#fffdf9] text-stone-900 p-10 rounded-2xl shadow-2xl border-[12px] border-[#b45309] relative overflow-hidden font-sans select-none"
            style={{
              boxShadow: "0 25px 50px -12px rgba(180, 83, 9, 0.25)",
              backgroundImage: "radial-gradient(circle at center, #ffffff 0%, #fffbeb 100%)"
            }}
          >
            {/* INNER ORNAMENTAL GOLD BORDER */}
            <div className="absolute inset-2.5 border-2 border-amber-500/60 rounded-lg pointer-events-none" />
            <div className="absolute inset-3.5 border border-amber-400/40 rounded-sm pointer-events-none" />

            {/* CORNER ROYAL FLOURISHES */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-amber-600 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-amber-600 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-amber-600 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-amber-600 rounded-br-lg pointer-events-none" />

            {/* SUBTLE CENTER WATERMARK */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <div className="w-[500px] h-[500px] rounded-full border-[20px] border-amber-900 flex items-center justify-center">
                <span className="text-7xl font-black text-amber-900 tracking-widest text-center">TN PA²</span>
              </div>
            </div>

            {/* [TOP LEADERSHIP HEADER] - Photo 1, Photo 2, Photo 3 */}
            <div className="relative z-10 flex items-center justify-between px-8 border-b-2 border-amber-400/40 pb-6">
              
              {/* Photo 1: ரா. சேவியர் பாபு (மாநில பொதுச்செயலாளர்) */}
              <div className="flex flex-col items-center text-center w-52">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 shadow-md overflow-hidden bg-white p-0.5">
                  <img src="/r_xavier_babu.svg" alt="ரா. சேவியர் பாபு" className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="font-black text-xs text-stone-900 mt-1.5">ரா. சேவியர் பாபு</h4>
                <p className="text-[10px] font-extrabold text-[#991b1b]">மாநில பொதுச்செயலாளர்</p>
              </div>

              {/* Photo 2: மைக்கேல் ஆல்வின் (மாநில தலைவர் - Elevated Center) */}
              <div className="flex flex-col items-center text-center w-56 -mt-2">
                <div className="w-24 h-24 rounded-full border-4 border-amber-600 shadow-lg overflow-hidden bg-white p-1 ring-4 ring-amber-300/50">
                  <img src="/s_michael_alvin.svg" alt="மைக்கேல் ஆல்வின்" className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="font-black text-sm text-stone-950 mt-1.5">மைக்கேல் ஆல்வின்</h4>
                <p className="text-xs font-black text-[#991b1b] uppercase tracking-wide">மாநில தலைவர்</p>
              </div>

              {/* Photo 3: ரா. சக்திவேல் (மாநில பொருளாளர்) */}
              <div className="flex flex-col items-center text-center w-52">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 shadow-md overflow-hidden bg-white p-0.5">
                  <img src="/r_sakthivel.svg" alt="ரா. சக்திவேல்" className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="font-black text-xs text-stone-900 mt-1.5">ரா. சக்திவேல்</h4>
                <p className="text-[10px] font-extrabold text-[#991b1b]">மாநில பொருளாளர்</p>
              </div>

            </div>

            {/* [MAIN HEADING] */}
            <div className="text-center my-6 relative z-10 space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-[#991b1b] tracking-wide">
                தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் (TN PA²)
              </h2>
              <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                TAMIL NADU PAINTERS & ARTISTS ADVANCEMENT ASSOCIATION
              </p>
              <div className="inline-block px-4 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-xs font-black text-amber-950 mt-1">
                அரசு பதிவு எண்: TNMDUJCLMDUTU- 50-26-00044
              </div>

              {/* CERTIFICATE GOLD BADGE TITLE */}
              <div className="pt-4">
                <div className="inline-flex items-center gap-3 px-8 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 rounded-xl shadow-lg border border-amber-300">
                  <Award className="w-6 h-6 text-stone-950" />
                  <h1 className="text-2xl font-black tracking-wider uppercase drop-shadow-sm">
                    பொறுப்பாளர் சான்றிதழ்
                  </h1>
                  <Award className="w-6 h-6 text-stone-950" />
                </div>
                <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest mt-1">
                  OFFICIAL CERTIFICATE OF EXECUTIVE APPOINTMENT & SERVICE
                </p>
              </div>
            </div>

            {/* [BODY TEXT & MAIN CONTENT] */}
            <div className="relative z-10 my-6 px-12 text-center leading-relaxed">
              <p className="text-base font-bold text-stone-800 leading-loose">
                தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் மாநில பொதுக்குழு மற்றும் செயற்குழு உறுப்பினர்களால்{" "}
                <strong className="text-xl font-black text-[#991b1b] underline decoration-amber-500 underline-offset-4 px-2">
                  {executiveName}
                </strong>
                ,{" "}
                <strong className="text-base font-extrabold text-stone-900">
                  {district} மாவட்டம்
                </strong>
                {" "}அவர்கள்{" "}
                <strong className="text-lg font-black text-amber-950 bg-amber-100/80 px-3 py-0.5 rounded-lg border border-amber-300 inline-block mx-1">
                  {designation}
                </strong>
                {" "}ஆக தேர்வு செய்யப்பட்டு 45 நாட்களுக்கு மேல் சிறப்பாக பணியாற்றியமைக்காக இச்சான்றிதழ் வழங்கப்படுகிறது.
              </p>
            </div>

            {/* [LOWER SECTION: LEFT SEAL | CENTER CANDIDATE PHOTO | RIGHT OFFICIAL FLAG] */}
            <div className="relative z-10 grid grid-cols-3 items-center gap-4 px-8 my-4 py-4 border-t border-b border-amber-300/40 bg-amber-50/40 rounded-2xl">
              
              {/* [LEFT SIDE]: Golden Ribbon with Official TN PA² Emblem / Seal */}
              <div className="flex flex-col items-center text-center justify-center">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-xl flex items-center justify-center border-2 border-amber-700">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-900 flex flex-col items-center justify-center text-center p-1 bg-amber-50">
                    <ShieldCheck className="w-6 h-6 text-amber-800" />
                    <span className="text-[9px] font-black text-amber-950 uppercase leading-tight">TN PA² SEAL</span>
                    <span className="text-[7px] font-bold text-amber-800">அங்கீகரிக்கப்பட்டது</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-amber-900 mt-2">அதிகாரப்பூர்வ தங்க முத்திரை</span>
              </div>

              {/* [CENTER / CANDIDATE PHOTO FRAME] */}
              <div className="flex flex-col items-center text-center justify-center">
                <div className="w-24 h-28 rounded-xl border-4 border-amber-600 p-0.5 bg-white shadow-xl overflow-hidden relative">
                  <img src={photoUrl} alt={executiveName} className="w-full h-full object-cover rounded-lg" />
                  <div className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-[8px] text-amber-300 font-bold py-0.5 text-center">
                    {membershipId}
                  </div>
                </div>
                <span className="text-xs font-black text-stone-900 mt-1">{executiveName}</span>
                <span className="text-[10px] font-extrabold text-amber-800">{designation.split("(")[0]}</span>
              </div>

              {/* [BOTTOM RIGHT]: Official TN PA² Flag (Red and White with Center Emblem) */}
              <div className="flex flex-col items-center text-center justify-center">
                <div className="w-28 h-16 rounded-lg shadow-xl border-2 border-amber-600 overflow-hidden flex flex-col relative">
                  {/* Top Red Half */}
                  <div className="h-1/2 bg-[#dc2626] flex items-center justify-center" />
                  {/* Bottom White Half */}
                  <div className="h-1/2 bg-white flex items-center justify-center" />
                  {/* Center Emblem */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-stone-900 flex items-center justify-center text-[7px] font-black text-stone-950 shadow-md">
                      TNPA²
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-stone-900 mt-2">சங்கத்தின் அதிகாரப்பூர்வ கொடி</span>
              </div>

            </div>

            {/* [BOTTOM SIGNATORIES & ISSUE METADATA] */}
            <div className="relative z-10 flex items-end justify-between px-10 pt-4 mt-2">
              
              {/* General Secretary Signatory */}
              <div className="flex flex-col items-center text-center w-60">
                <div className="h-12 flex items-center justify-center">
                  <span className="font-serif italic text-base text-[#991b1b] font-black tracking-wider">
                    R. Xavier Babu
                  </span>
                </div>
                <div className="w-48 border-t-2 border-stone-800 pt-1">
                  <h5 className="text-xs font-black text-stone-950">ரா. சேவியர் பாபு</h5>
                  <p className="text-[10px] font-extrabold text-[#991b1b]">மாநில பொதுச்செயலாளர்</p>
                </div>
              </div>

              {/* Center Serial and Date */}
              <div className="text-center text-[10px] font-mono text-stone-600 space-y-0.5">
                <div>வழங்கப்பட்ட தேதி: <strong>{issueDate}</strong></div>
                <div>சான்றிதழ் எண்: <strong>{certificateSerial}</strong></div>
                <div className="text-emerald-700 font-extrabold">✓ 45 நாட்கள் தீவிர சேவை சரிபார்க்கப்பட்டது</div>
              </div>

              {/* State President Signatory */}
              <div className="flex flex-col items-center text-center w-60">
                <div className="h-12 flex items-center justify-center">
                  <span className="font-serif italic text-base text-[#991b1b] font-black tracking-wider">
                    S. Michael Alwin
                  </span>
                </div>
                <div className="w-48 border-t-2 border-stone-800 pt-1">
                  <h5 className="text-xs font-black text-stone-950">மைக்கேல் ஆல்வின்</h5>
                  <p className="text-[10px] font-extrabold text-[#991b1b]">மாநில தலைவர்</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
