import React, { useState } from "react";
import { User, Shield } from "lucide-react";
import { UserAccount } from "../../types";

interface SkillsContractorsTabProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  darkMode: boolean;
  onAddAuditLog: (action: string, details: string) => void;

  // Skill Registry States
  skillSubmissions: any[];
  setSkillSubmissions: React.Dispatch<React.SetStateAction<any[]>>;
  submitSkills: string;
  setSubmitSkills: (val: string) => void;
  submitExp: string;
  setSubmitExp: (val: string) => void;
  submitPortfolio: string;
  setSubmitPortfolio: (val: string) => void;

  // Contractor Registry States
  contractors: any[];
  setContractors: React.Dispatch<React.SetStateAction<any[]>>;
  publishCompany: string;
  setPublishCompany: (val: string) => void;
  publishServices: string;
  setPublishServices: (val: string) => void;
  publishExp: string;
  setPublishExp: (val: string) => void;
  publishContact: string;
  setPublishContact: (val: string) => void;
  publishOptIn: boolean;
  setPublishOptIn: (val: boolean) => void;
}

export default function SkillsContractorsTab({
  lang,
  currentUser,
  darkMode,
  onAddAuditLog,
  skillSubmissions,
  setSkillSubmissions,
  submitSkills,
  setSubmitSkills,
  submitExp,
  setSubmitExp,
  submitPortfolio,
  setSubmitPortfolio,
  contractors,
  setContractors,
  publishCompany,
  setPublishCompany,
  publishServices,
  setPublishServices,
  publishExp,
  setPublishExp,
  publishContact,
  setPublishContact,
  publishOptIn,
  setPublishOptIn
}: SkillsContractorsTabProps) {
  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]" id="skills-contractors-container">
      {/* Header intro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-sm font-black uppercase text-indigo-600">
            {lang === "ta" ? "திறன் சான்றிதழ் சரிபார்ப்பு & ஒப்பந்தக்காரர் அடைவு" : "Skill Registry, Badge Endorsements & Contractor Hub"}
          </h4>
          <p className="text-xs text-stone-400 mt-1">
            {lang === "ta"
              ? "உறுப்பினர்கள் தங்களது திறன்களை சரிபார்த்து 'Verified' முத்திரை பெறலாம். ஒப்பந்தக்காரர்கள் தங்களது விபரங்களை வெளியிடலாம்."
              : "Endorse credentials to secure verified golden badges, or manage publicly visible contractor profiles."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Registry & Badge System */}
        <div className={`p-6 rounded-3xl border lg:col-span-2 ${
          darkMode ? "bg-stone-900/30 border-stone-800" : "bg-[#faf9f5] border-stone-200 shadow-sm"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-stone-400">
              {lang === "ta" ? "1. திறன் சரிபார்ப்பு மற்றும் தகுதிச் சான்றிதழ்" : "1. Skill Portfolios & Verified Badges"}
            </h5>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
              Admin Approval Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Submit Skill Form */}
            <div className="space-y-3.5 text-left">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">
                {lang === "ta" ? "திறன் சுயவிவரம் சமர்ப்பி" : "Submit Skill Portfolio"}
              </span>
              <input
                type="text"
                value={submitSkills}
                onChange={(e) => setSubmitSkills(e.target.value)}
                placeholder={lang === "ta" ? "திறன்கள் (எ.கா: ஸ்ப்ரே பெயிண்டிங், மியூரல்)..." : "Enter skills (e.g. Spray Painting, Murals)..."}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none bg-white text-stone-800"
              />
              <input
                type="text"
                value={submitExp}
                onChange={(e) => setSubmitExp(e.target.value)}
                placeholder={lang === "ta" ? "அனுபவம் (எ.கா: 5 வருடங்கள்)..." : "Years of experience..."}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none bg-white text-stone-800"
              />
              <input
                type="text"
                value={submitPortfolio}
                onChange={(e) => setSubmitPortfolio(e.target.value)}
                placeholder={lang === "ta" ? "சான்றிதழ் கோப்புப் பெயர் / இணைய இணைப்பு..." : "Certificate link / portfolio attachment filename..."}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none bg-white text-stone-800"
              />
              <button
                onClick={() => {
                  if (!submitSkills || !submitExp) {
                    alert("Provide skills and experience details!");
                    return;
                  }
                  const added = {
                    id: `sub_${Date.now()}`,
                    memberName: currentUser?.nameEn || "S. Palanivel",
                    skills: submitSkills.split(",").map(s => s.trim()),
                    experience: submitExp,
                    portfolioUrl: submitPortfolio || "p-doc.pdf",
                    verified: false
                  };
                  setSkillSubmissions(prev => [added, ...prev]);
                  onAddAuditLog("Skill Verification Submitted", `Member submitted credentials for: ${submitSkills}.`);

                  setSubmitSkills("");
                  setSubmitExp("");
                  setSubmitPortfolio("");
                  alert(lang === "ta" ? "திறன் சான்றுகள் சமர்ப்பிக்கப்பட்டது! நிர்வாக ஒப்புதலுக்குப் பின் சரிபார்ப்பு முத்திரை வழங்கப்படும்." : "Portfolio submitted! Verification approval queued with state admins.");
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {lang === "ta" ? "சரிபார்ப்புக்கு சமர்ப்பி" : "Submit for Verification"}
              </button>
            </div>

            {/* Skill Submissions Status */}
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">
                {lang === "ta" ? "சமர்ப்பிக்கப்பட்ட திறன்களின் நிலை" : "Skill Registry Review List"}
              </span>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {skillSubmissions.map((s, idx) => (
                  <div key={`sk_sub_${s.id}_${idx}`} className="p-3.5 bg-white border border-stone-200 rounded-2xl flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-xs text-stone-900">{s.memberName}</span>
                        {s.verified && (
                          <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">
                            ✓ Verified Badge
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {s.skills.map((sk: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 bg-stone-100 rounded text-[9px] font-bold text-stone-600">
                            {sk}
                          </span>
                        ))}
                      </div>
                      <span className="text-[9px] text-stone-400 font-bold block mt-1">Exp: {s.experience}</span>
                    </div>
                    
                    {/* Admin Endorsement */}
                    {!s.verified && (currentUser?.role === "super_admin" || currentUser?.role === "district_admin") && (
                      <button
                        onClick={() => {
                          setSkillSubmissions(prev => prev.map(item => {
                            if (item.id === s.id) {
                              return { ...item, verified: true };
                            }
                            return item;
                          }));
                          onAddAuditLog("Skill Certified", `Admins endorsed verified gold badge to: ${s.memberName}.`);
                          alert("Golden badge issued and verified in digital ledger!");
                        }}
                        className="px-2.5 py-1.5 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-[9px] font-black uppercase cursor-pointer text-stone-200"
                      >
                        Verify & Endorse Badge
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contractor Profiles Directory */}
        <div className="space-y-6 text-left">
          <div className={`p-6 rounded-3xl border ${
            darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <h5 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              <span>{lang === "ta" ? "2. அங்கீகரிக்கப்பட்ட ஒப்பந்தக்காரர்கள்" : "2. Contractor Registry"}</span>
            </h5>

            {/* Profile Publish opt-in */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 mb-4 space-y-2.5">
              <span className="text-[9px] font-black text-indigo-600 uppercase block">{lang === "ta" ? "உங்கள் விபரங்களை வெளியிடுங்கள்" : "Publish Contractor Profile"}</span>
              <input
                type="text"
                value={publishCompany}
                onChange={(e) => setPublishCompany(e.target.value)}
                placeholder={lang === "ta" ? "நிறுவனத்தின் பெயர்..." : "Enter your company..."}
                className="w-full p-2 rounded-lg border border-stone-200 text-[10px] outline-none bg-white text-stone-850"
              />
              <input
                type="text"
                value={publishServices}
                onChange={(e) => setPublishServices(e.target.value)}
                placeholder={lang === "ta" ? "வழங்கும் சேவைகள்..." : "Services offered..."}
                className="w-full p-2 rounded-lg border border-stone-200 text-[10px] outline-none bg-white text-stone-850"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={publishExp}
                  onChange={(e) => setPublishExp(e.target.value)}
                  placeholder="Experience..."
                  className="p-2 rounded-lg border border-stone-200 text-[10px] outline-none bg-white text-stone-850"
                />
                <input
                  type="text"
                  value={publishContact}
                  onChange={(e) => setPublishContact(e.target.value)}
                  placeholder="Contact phone..."
                  className="p-2 rounded-lg border border-stone-200 text-[10px] outline-none bg-white text-stone-850"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pubOptIn"
                  checked={publishOptIn}
                  onChange={(e) => setPublishOptIn(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pubOptIn" className="text-[8px] font-black text-stone-400 uppercase leading-none">
                  {lang === "ta" ? "தொடர்பு விபரங்களை பகிர ஒப்புக்கொள்கிறேன்" : "Opt-in to publish my contact details publicly"}
                </label>
              </div>
              <button
                onClick={() => {
                  if (!publishCompany || !publishContact) {
                    alert("Company name and contact phone mandatory!");
                    return;
                  }
                  const added = {
                    id: `con_${Date.now()}`,
                    company: publishCompany,
                    companyEn: publishCompany,
                    district: currentUser?.district || "சென்னை",
                    services: publishServices,
                    servicesEn: publishServices,
                    experience: publishExp || "3 Years",
                    contact: publishContact,
                    isPublished: publishOptIn
                  };
                  setContractors(prev => [added, ...prev]);
                  onAddAuditLog("Contractor Registered", `New contractor listed: ${publishCompany} in ${added.district}.`);

                  setPublishCompany("");
                  setPublishServices("");
                  setPublishExp("");
                  setPublishContact("");
                  alert("Contractor profile published in central directory!");
                }}
                className="w-full py-1.5 bg-stone-950 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer"
              >
                {lang === "ta" ? "ஒப்பந்த விபரங்களை வெளியிடு" : "Publish Listing"}
              </button>
            </div>

            {/* Listed contractors */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {contractors.filter(c => c.isPublished).map((c, idx) => (
                <div key={`sk_con_${c.id}_${idx}`} className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-[10px] text-stone-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-stone-900">{lang === "ta" ? c.company : c.companyEn}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[8px] font-black uppercase shrink-0">
                      {c.district}
                    </span>
                  </div>
                  <p className="mb-2 font-medium leading-relaxed">{lang === "ta" ? c.services : c.servicesEn}</p>
                  <div className="flex justify-between items-center text-[8px] text-stone-400 font-bold border-t border-stone-200/50 pt-1.5 mt-1.5">
                    <span>Exp: {c.experience}</span>
                    <span>📞 {c.contact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
