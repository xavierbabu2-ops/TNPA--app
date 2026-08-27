import React, { useState } from "react";
import { 
  ShieldAlert, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  User, 
  Phone, 
  Building,
  FileText
} from "lucide-react";
import { UserAccount } from "../types";

interface InsuranceClaim {
  id: string;
  applicantName: string;
  applicantPhone: string;
  district: string;
  claimType: "Accident Relief (விபத்து நிவாரணம்)" | "Medical Treatment (மருத்துவச் செலவு)" | "Natural Demise Support (இயற்கை மரண உதவி)";
  incidentDate: string;
  claimAmount: number;
  hospitalOrDetails: string;
  status: "pending" | "verified" | "approved" | "disbursed" | "rejected";
  submittedAt: string;
  adminRemarks?: string;
}

interface PainterInsurancePortalProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  isSuperAdmin: boolean;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function PainterInsurancePortal({
  lang,
  currentUser,
  isSuperAdmin,
  onAddAuditLog
}: PainterInsurancePortalProps) {
  const [activeTab, setActiveTab] = useState<"claims" | "submit" | "policies">("claims");

  const [claims, setClaims] = useState<InsuranceClaim[]>([
    {
      id: "CLM-2026-001",
      applicantName: "ஆர். முருகன்",
      applicantPhone: "9840012345",
      district: "சென்னை",
      claimType: "Accident Relief (விபத்து நிவாரணம்)",
      incidentDate: "2026-08-10",
      claimAmount: 50000,
      hospitalOrDetails: "ராஜீவ் காந்தி அரசு மருத்துவமனை, சென்னை - பணியின் போது ஏணியில் இருந்து தவறி விழுந்ததில் கால் எலும்பு முறிவு.",
      status: "approved",
      submittedAt: "2026-08-12",
      adminRemarks: "மருத்துவச் சான்றிதழ் & எஃப்.ஐ.ஆர் சரிபார்க்கப்பட்டது. ரூ.50,000 காப்பீட்டுத் தொகை வரவு வைக்கப்பட்டுள்ளது."
    },
    {
      id: "CLM-2026-002",
      applicantName: "எஸ். பாண்டி",
      applicantPhone: "9443254321",
      district: "மதுரை",
      claimType: "Medical Treatment (மருத்துவச் செலவு)",
      incidentDate: "2026-08-18",
      claimAmount: 25000,
      hospitalOrDetails: "வேலவன் மருத்துவமனை, மதுரை - ஒவ்வாமை மற்றும் சுவாசப் பிரச்சனைக்கு சிகிச்சை.",
      status: "pending",
      submittedAt: "2026-08-20"
    }
  ]);

  // Form state
  const [applicantName, setApplicantName] = useState(currentUser?.name || "");
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || "");
  const [applicantDistrict, setApplicantDistrict] = useState(currentUser?.district || "சென்னை");
  const [claimType, setClaimType] = useState<InsuranceClaim["claimType"]>("Accident Relief (விபத்து நிவாரணம்)");
  const [incidentDate, setIncidentDate] = useState("2026-08-24");
  const [claimAmount, setClaimAmount] = useState(25000);
  const [hospitalOrDetails, setHospitalOrDetails] = useState("");

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || !hospitalOrDetails) {
      alert(lang === "ta" ? "அனைத்து விவரங்களையும் நிரப்பவும்!" : "Please fill all details!");
      return;
    }

    const newClaim: InsuranceClaim = {
      id: `CLM-2026-${Math.floor(100 + Math.random() * 900)}`,
      applicantName,
      applicantPhone,
      district: applicantDistrict,
      claimType,
      incidentDate,
      claimAmount: Number(claimAmount) || 10000,
      hospitalOrDetails,
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0]
    };

    setClaims([newClaim, ...claims]);
    onAddAuditLog("Insurance Claim Submitted", `New claim ${newClaim.id} submitted by ${applicantName} for ${claimType}`);
    alert(lang === "ta" 
      ? `✓ உங்கள் காப்பீட்டு விண்ணப்பம் வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டது! குறிப்பு எண்: ${newClaim.id}` 
      : `✓ Insurance claim submitted successfully! Claim ID: ${newClaim.id}`);

    setHospitalOrDetails("");
    setActiveTab("claims");
  };

  const handleUpdateStatus = (id: string, status: InsuranceClaim["status"]) => {
    setClaims(claims.map(c => c.id === id ? { ...c, status } : c));
    onAddAuditLog("Insurance Claim Status Updated", `Claim ${id} status changed to ${status}`);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-blue-900/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/25 border border-blue-400/35 rounded-full text-xs text-blue-300 font-extrabold mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === "ta" ? "விபத்து & மருத்துவக் காப்பீட்டுத் திட்டம்" : "Painter Insurance & Accident Relief Portal"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {lang === "ta" ? "காப்பீட்டு கோரிக்கை மற்றும் டிராக்கர்" : "Insurance Claim & Relief Tracker"}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              {lang === "ta"
                ? "பெயிண்டிங் பணியின் போது ஏற்படும் விபத்துகள், மருத்துவச் செலவுகள் மற்றும் குடும்ப நல உதவிகளுக்கான காப்பீட்டு கோரிக்கைகளைச் சமர்ப்பித்து தற்போதைய நிலையைத் கண்காணிக்கவும்."
                : "Submit and track insurance claims for workplace accidents, medical treatments, and family welfare relief."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("claims")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "claims" ? "bg-blue-400 text-slate-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {lang === "ta" ? "கோரிக்கைகள் பட்டியல் (Claims Tracker)" : "Claims Tracker"}
            </button>
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "submit" ? "bg-blue-400 text-slate-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {lang === "ta" ? "+ புதிய கோரிக்கை சமர்ப்பிக்க" : "+ Submit New Claim"}
            </button>
            <button
              onClick={() => setActiveTab("policies")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "policies" ? "bg-blue-400 text-slate-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {lang === "ta" ? "காப்பீட்டு விபரங்கள் (Policies)" : "Insurance Policies"}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CLAIMS TRACKER */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>{lang === "ta" ? "சமர்ப்பிக்கப்பட்ட காப்பீட்டு கோரிக்கைகளின் நிலை" : "Submitted Insurance Claims & Status"}</span>
            </h3>

            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-400 transition-all">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-black font-mono">
                        {claim.id}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-black">
                        {claim.district}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        claim.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                        claim.status === "disbursed" ? "bg-indigo-100 text-indigo-800" :
                        claim.status === "rejected" ? "bg-rose-100 text-rose-800" :
                        claim.status === "verified" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {claim.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900">
                      {claim.applicantName} <span className="text-xs font-normal text-slate-500">(+91 {claim.applicantPhone})</span>
                    </h4>

                    <p className="text-xs font-extrabold text-blue-700">{claim.claimType}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-extrabold text-slate-400 block">{lang === "ta" ? "கோரும் தொகை:" : "Claim Amount:"}</span>
                        <span className="font-black text-emerald-700">₹{claim.claimAmount.toLocaleString()}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-extrabold text-slate-400 block">{lang === "ta" ? "நிகழ்வு தேதி:" : "Incident Date:"}</span>
                        <span className="font-semibold text-slate-800">{claim.incidentDate}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-extrabold text-slate-400 block">{lang === "ta" ? "சமர்ப்பித்த தேதி:" : "Submitted:"}</span>
                        <span className="font-semibold text-slate-800">{claim.submittedAt}</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 block">{lang === "ta" ? "மருத்துவமனை / விபத்து விபரங்கள்:" : "Hospital & Incident Details:"}</span>
                      <p className="font-medium leading-relaxed">{claim.hospitalOrDetails}</p>
                    </div>

                    {claim.adminRemarks && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
                        <span className="font-black block text-[11px] mb-0.5">🛡️ {lang === "ta" ? "அட்மின் குறிப்பு:" : "Admin Remarks:"}</span>
                        <p>{claim.adminRemarks}</p>
                      </div>
                    )}
                  </div>

                  {isSuperAdmin && (
                    <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(claim.id, "verified")}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(claim.id, "approved")}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(claim.id, "disbursed")}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Disburse Funds
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBMIT CLAIM FORM */}
      {activeTab === "submit" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 max-w-2xl mx-auto">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>{lang === "ta" ? "புதிய காப்பீட்டு கோரிக்கை விண்ணப்பம்" : "New Insurance Claim Application"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === "ta"
                ? "விபத்து அல்லது மருத்துவச் செலவுக்கான ஆவணங்களுடன் விண்ணப்பத்தைப் பூர்த்தி செய்யவும்."
                : "Complete the form with medical bills and accident reports for fast processing."}
            </p>
          </div>

          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                {lang === "ta" ? "உறுப்பினர் பெயர் (Member Name) *" : "Member Name *"}
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  {lang === "ta" ? "தொலைபேசி எண் (Phone) *" : "Phone Number *"}
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  {lang === "ta" ? "மாவட்டம் (District) *" : "District *"}
                </label>
                <select
                  value={applicantDistrict}
                  onChange={(e) => setApplicantDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  {["சென்னை", "கோயம்புத்தூர்", "மதுரை", "திருச்சி", "சேலம்", "நெல்லை", "வேலூர்", "ஈரோடு", "தஞ்சாவூர்", "திண்டுக்கல்", "விருதுநகர்", "கன்னியாகுமரி"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                {lang === "ta" ? "காப்பீட்டு வகை (Claim Type) *" : "Claim Type *"}
              </label>
              <select
                value={claimType}
                onChange={(e) => setClaimType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="Accident Relief (விபத்து நிவாரணம்)">Accident Relief (விபத்து நிவாரணம் - Up to ₹5 Lakhs)</option>
                <option value="Medical Treatment (மருத்துவச் செலவு)">Medical Treatment (மருத்துவச் செலவு - Up to ₹50,000)</option>
                <option value="Natural Demise Support (இயற்கை மரண உதவி)">Natural Demise Support (இயற்கை மரண உதவி - ₹30,000)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  {lang === "ta" ? "நிகழ்வு தேதி (Incident Date) *" : "Incident Date *"}
                </label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  {lang === "ta" ? "கோரும் தொகை (₹) *" : "Claim Amount (₹) *"}
                </label>
                <input
                  type="number"
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                {lang === "ta" ? "மருத்துவமனை பெயர் & நிகழ்வு விளக்கம் (Details) *" : "Hospital Name & Incident Description *"}
              </label>
              <textarea
                rows={3}
                required
                value={hospitalOrDetails}
                onChange={(e) => setHospitalOrDetails(e.target.value)}
                placeholder="எ.கா: அரசு மருத்துவமனை, சென்னை. பணி செய்யும் போது ஏற்பட்ட விபத்து பற்றிய விவரம்..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab("claims")}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-xl cursor-pointer"
              >
                {lang === "ta" ? "ரத்து செய்" : "Cancel"}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
              >
                {lang === "ta" ? "கோரிக்கையைச் சமர்ப்பிக்க" : "Submit Claim"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: POLICIES OVERVIEW */}
      {activeTab === "policies" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">1</div>
            <h4 className="text-base font-black text-slate-900">{lang === "ta" ? "விபத்து மரண காப்பீடு" : "Accidental Death Cover"}</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {lang === "ta"
                ? "பணி செய்யும் போதோ அல்லது வேறு எப்போதோ விபத்தினால் மரணம் நேரிட்டால் குடும்பத்திற்கு ₹5,00,000 காப்பீட்டுத் தொகை வழங்கப்படுகிறது."
                : "₹5,00,000 relief grant provided to the bereaved family in case of accidental fatality."}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">2</div>
            <h4 className="text-base font-black text-slate-900">{lang === "ta" ? "மருத்துவச் செலவு உதவி" : "Medical Reimbursement"}</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {lang === "ta"
                ? "பணி விபத்து காரணமாக ஏற்படும் மருத்துவமனை அட்மிஷன் மற்றும் அறுவை சிகிச்சை செலவுகளுக்கு ₹50,000 வரை திருப்பி வழங்கப்படுகிறது."
                : "Up to ₹50,000 reimbursement for hospital admissions and surgeries due to workplace injuries."}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">3</div>
            <h4 className="text-base font-black text-slate-900">{lang === "ta" ? "இயற்கை மரண உதவி" : "Natural Demise Support"}</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {lang === "ta"
                ? "சங்கத்தில் குறைந்தபட்சம் 2 ஆண்டுகள் உறுப்பினராக உள்ள பெயிண்டர்களின் இயற்கை மரணத்திற்கு உடனடியாக ₹30,000 இறுதி சடங்கு உதவி."
                : "₹30,000 immediate funeral and family support for members with at least 2 years of standing."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
