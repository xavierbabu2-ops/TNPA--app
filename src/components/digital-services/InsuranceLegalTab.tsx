import React from "react";
import { AlertTriangle, FileText, CheckSquare, AlertOctagon } from "lucide-react";
import { UserAccount } from "../../types";

interface InsuranceLegalTabProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  darkMode: boolean;
  onAddAuditLog: (action: string, details: string) => void;

  // Insurance States
  insurancePolicies: any[];
  setInsurancePolicies: React.Dispatch<React.SetStateAction<any[]>>;
  claimPolicyId: string;
  setClaimPolicyId: (val: string) => void;
  claimReason: string;
  setClaimReason: (val: string) => void;
  claimDoc: string;
  setClaimDoc: (val: string) => void;
}

export default function InsuranceLegalTab({
  lang,
  currentUser,
  darkMode,
  onAddAuditLog,
  insurancePolicies,
  setInsurancePolicies,
  claimPolicyId,
  setClaimPolicyId,
  claimReason,
  setClaimReason,
  claimDoc,
  setClaimDoc
}: InsuranceLegalTabProps) {
  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]" id="insurance-legal-container">
      {/* Top Header */}
      <div>
        <h4 className="text-sm font-black uppercase text-indigo-600">
          {lang === "ta" ? "சங்க காப்பீடு மற்றும் சட்ட விழிப்புணர்வு மையம்" : "Insurance Management & Labor Rights Center"}
        </h4>
        <p className="text-xs text-stone-400 mt-1">
          {lang === "ta"
            ? "உறுப்பினர் காப்பீட்டு பாலிசிகள், புதுப்பித்தல் நினைவூட்டல்கள் மற்றும் தொழிலாளர் சட்ட உரிமைகள் பற்றிய தகவல்கள்."
            : "Track mutual benefit policies, submit insurance claims, and review state labor protection checklists."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insurance Management Box */}
        <div className={`p-6 rounded-3xl border lg:col-span-2 ${
          darkMode ? "bg-stone-900/30 border-stone-800" : "bg-[#faf9f5] border-stone-200 shadow-sm"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-stone-400">
              {lang === "ta" ? "1. காப்பீட்டு பாலிசிகள் மற்றும் கோரிக்கைகள்" : "1. Enrolled Policies & Claims"}
            </h5>
            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
              Renewal Reminders Synced
            </span>
          </div>

          {/* Policies List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {insurancePolicies.map((p, idx) => {
              const diffDays = Math.ceil((new Date(p.renewalDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return (
                <div key={`policy_card_${p.id}_${idx}`} className="p-4 rounded-2xl bg-white border border-stone-200 text-left">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h6 className="text-xs font-black text-stone-900">
                      {lang === "ta" ? p.name : p.nameEn}
                    </h6>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
                      p.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-[10px] text-stone-500 font-bold">
                    <p>Policy No: <span className="text-stone-800 font-black">{p.policyNo}</span></p>
                    <p>Nominee: <span className="text-stone-800">{lang === "ta" ? p.nominee : p.nomineeEn}</span></p>
                    <p>Premium: <span className="text-indigo-600">{p.premiumAmount}</span></p>
                    <p className="border-t border-stone-100 pt-1.5 mt-1.5 flex justify-between text-[9px]">
                      <span>Renewal Date: <span className="text-stone-900">{p.renewalDate}</span></span>
                      <span className={diffDays < 30 ? "text-red-500 font-black" : "text-stone-500"}>
                        {diffDays > 0 ? `(${diffDays} days left)` : "(Expired)"}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* File an Insurance Claim Form */}
          <div className="border-t border-stone-200/50 pt-5 text-left space-y-4">
            <span className="text-[10px] font-black uppercase text-indigo-600 block">
              {lang === "ta" ? "காப்பீட்டு உரிமைகோரல் (File a Claim)" : "File an Insurance Claim"}
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={claimPolicyId}
                onChange={(e) => setClaimPolicyId(e.target.value)}
                className="p-2.5 rounded-xl border border-stone-200 bg-white text-xs outline-none text-stone-800"
              >
                <option value="">{lang === "ta" ? "பாலிசியை தேர்வு செய்யவும்" : "Select Insurance Policy..."}</option>
                {insurancePolicies.map((p, idx) => (
                  <option key={`policy_opt_${p.id}_${idx}`} value={p.id}>
                    {lang === "ta" ? p.name : p.nameEn}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                placeholder={lang === "ta" ? "கோரிக்கைக்கான காரணம்..." : "Enter reason for claim..."}
                className="p-2.5 rounded-xl border border-stone-200 bg-white text-xs outline-none text-stone-800 md:col-span-2"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={claimDoc}
                onChange={(e) => setClaimDoc(e.target.value)}
                placeholder={lang === "ta" ? "இணைக்கப்பட்ட மருத்துவ பில் (e.g., bills.pdf)..." : "Simulate document attachment (e.g. bill.pdf)..."}
                className="flex-1 p-2.5 rounded-xl border border-stone-200 bg-white text-xs outline-none text-stone-800"
              />
              <button
                onClick={() => {
                  if (!claimPolicyId || !claimReason) {
                    alert("Please choose a policy and enter your claim reason.");
                    return;
                  }
                  setInsurancePolicies(prev => prev.map(p => {
                    if (p.id === claimPolicyId) {
                      return { ...p, claimStatus: "Filed" };
                    }
                    return p;
                  }));
                  onAddAuditLog("Insurance Claim Filed", `Claim filed for Policy ID: ${claimPolicyId}. Reason: ${claimReason}.`);
                  
                  // Clear
                  setClaimPolicyId("");
                  setClaimReason("");
                  setClaimDoc("");
                  alert(lang === "ta" ? "காப்பீட்டு கோரிக்கை சமர்ப்பிக்கப்பட்டது! தணிக்கை குழு விரைவில் சரிபார்க்கும்." : "Insurance claim filed successfully! State audit panel notified.");
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {lang === "ta" ? "கோரிக்கையை சமர்ப்பி" : "Submit Claim"}
              </button>
            </div>

            {/* Claim Status Monitor */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <span className="text-[9px] font-extrabold uppercase text-stone-400 block mb-2">{lang === "ta" ? "கோரிக்கைகளின் தற்போதைய நிலை" : "Active Claims Status Monitor"}</span>
              <div className="space-y-2">
                {insurancePolicies.map((p, idx) => (
                  <div key={`policy_stat_${p.id}_${idx}`} className="flex justify-between items-center text-[10px] text-stone-600 font-bold">
                    <span>{lang === "ta" ? p.name : p.nameEn}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                      p.claimStatus === "Filed"
                        ? "bg-blue-100 text-blue-800 animate-pulse"
                        : "bg-stone-200 text-stone-600"
                    }`}>
                      {p.claimStatus === "None" ? (lang === "ta" ? "கோரப்படவில்லை" : "No Active Claims") : p.claimStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legal Support Checklist & Disclaimer */}
        <div className="space-y-6 text-left">
          <div className={`p-6 rounded-3xl border ${
            darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <h5 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{lang === "ta" ? "சட்ட விழிப்புணர்வு & உரிமைகள்" : "Labor Rights & Security Codes"}</span>
            </h5>

            <div className="space-y-4">
              {/* Card 1 */}
              <div className="border-b border-stone-100 pb-3">
                <h6 className="text-xs font-black text-stone-800 mb-1">
                  ⚖️ {lang === "ta" ? "குறைந்தபட்ச தினசரி கூலி சட்டம்" : "Minimum Wage Guarantee Rules"}
                </h6>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  {lang === "ta"
                    ? "தமிழக அரசாணை எண் G.O. 42-ன்படி, ஒரு தேர்ச்சி பெற்ற சுவர் ஓவியருக்கு தினசரி குறைந்தபட்ச கூலி ₹800 ஆக நிர்ணயிக்கப்பட்டுள்ளது."
                    : "Under TN Government G.O. 42, a skilled decorative painter is legally guaranteed a minimum daily rate of ₹800."}
                </p>
              </div>

              {/* Card 2 */}
              <div className="border-b border-stone-100 pb-3">
                <h6 className="text-xs font-black text-stone-800 mb-1">
                  🏗️ {lang === "ta" ? "உயரமான இட பாதுகாப்பு சட்ட விதி" : "Elevation Scaffold Protective Codes"}
                </h6>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  {lang === "ta"
                    ? "10 அடிக்கு மேல் உயரத்தில் வேலை செய்யும்போது, ஒப்பந்ததாரர் இரட்டை பாதுகாப்பு கயிறு மற்றும் வலைகளை அமைத்து தருவது சட்டப்படி கட்டாயமாகும்."
                    : "For work exceeding 10 feet in elevation, the prime housing contractor must mandate dual-hook harness hooks and crash nets."}
                </p>
              </div>

              {/* Card 3 */}
              <div className="pb-1">
                <h6 className="text-xs font-black text-stone-800 mb-1">
                  📋 {lang === "ta" ? "நலவாரிய விண்ணப்ப ஆவண சரிபார்ப்பு" : "Grievance Document Checklist"}
                </h6>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  {lang === "ta"
                    ? "ஆதார் கார்டு, வாக்காளர் அடையாள அட்டை, முந்தைய 90 நாட்கள் வேலை செய்ததற்கான சான்றிதழ், வங்கி கணக்கு புத்தகம்."
                    : "Aadhaar Card, construction work certification (min 90 days), and bank book with active IFSC codes."}
                </p>
              </div>
            </div>
          </div>

          {/* Secure Professional Legal Advice Disclaimer */}
          <div className="p-5 rounded-2xl bg-stone-900 text-stone-300 border border-stone-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-amber-500 block">⚠️ LEGAL ADVICE DISCLAIMER</span>
            <p className="text-[9px] leading-relaxed opacity-90">
              {lang === "ta"
                ? "இந்த தளம் பொதுவான சட்ட விழிப்புணர்வு மற்றும் தொழிலாளர் உரிமைகள் தகவல்களை மட்டுமே வழங்குகிறது. அதிகாரப்பூர்வ சட்ட ஆலோசனைகளுக்கு தகுதிபெற்ற வழக்கறிஞர்களை அணுகுமாறு சங்கம் பரிந்துரைக்கிறது."
                : "The AI Legal support assistant offers general informative awareness codes only. We highly advise securing professional attorney counsel for complex industrial disputes or binding litigation cases."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
