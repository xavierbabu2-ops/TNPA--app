import React from "react";
import { Compass, TrendingUp } from "lucide-react";
import { UserAccount } from "../../types";

interface SecurityHealthTabProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  darkMode: boolean;
  onAddAuditLog: (action: string, details: string) => void;

  // Security States
  mfaEnabled: boolean;
  setMfaEnabled: (val: boolean) => void;
  suspiciousLogins: any[];

  // Health Metrics (often static/periodic in UI)
  cpuLoad: number;
  dbHealth: string;
  storageUsed: number;
  apiLatency: number;
}

export default function SecurityHealthTab({
  lang,
  currentUser,
  darkMode,
  onAddAuditLog,
  mfaEnabled,
  setMfaEnabled,
  suspiciousLogins,
  cpuLoad,
  dbHealth,
  storageUsed,
  apiLatency
}: SecurityHealthTabProps) {
  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]" id="security-health-container">
      {/* Header intro */}
      <div>
        <h4 className="text-sm font-black uppercase text-indigo-600">
          {lang === "ta" ? "பாதுகாப்பு மையம், கணினி நலம் & AI மேலாண்மை" : "Cyber Security, System Health & Decision Support"}
        </h4>
        <p className="text-xs text-stone-400 mt-1">
          {lang === "ta"
            ? "இரு காரணி அங்கீகாரம், சர்வர் செயல்திறன் கண்காணிப்பு மற்றும் மாநில செயலாளருக்கான AI மேலாண்மை அறிக்கைகள்."
            : "Monitor multi-factor logs, server performance specs, and dynamic growth insights for executive leadership."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cyber Security Module Box */}
        <div className={`p-6 rounded-3xl border lg:col-span-2 ${
          darkMode ? "bg-stone-900/30 border-stone-800" : "bg-[#faf9f5] border-stone-200 shadow-sm"
        }`}>
          <h5 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
            {lang === "ta" ? "1. பாதுகாப்பு தணிக்கை மற்றும் குறியாக்கம்" : "1. Cyber Security Auditing & Encryption"}
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* MFA & Backup Controls */}
            <div className="space-y-5 text-left">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">
                Multi Factor Authentication (MFA)
              </span>
              
              <div className="p-4 rounded-2xl bg-white border border-stone-200 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-xs text-stone-900 block">Authenticator App Sync</span>
                  <span className="text-[9px] text-stone-400 font-bold block mt-0.5">Secure logins via TOTP tokens</span>
                </div>
                <button
                  onClick={() => {
                    setMfaEnabled(!mfaEnabled);
                    onAddAuditLog("MFA Configuration Toggled", `MFA auth status updated to ${!mfaEnabled}.`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
                    mfaEnabled
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-900 text-white hover:bg-stone-800"
                  }`}
                >
                  {mfaEnabled ? "✓ Active" : "Toggle Enable"}
                </button>
              </div>

              {mfaEnabled && (
                <div className="p-3 bg-indigo-50/30 border border-indigo-200 rounded-xl text-center space-y-2 animate-[fadeIn_0.3s_ease-out]">
                  <span className="text-[9px] text-indigo-600 font-black uppercase block">Simulated Google Auth QR Code</span>
                  <div className="mx-auto w-24 h-24 bg-stone-900 border border-stone-800 flex items-center justify-center rounded-lg text-white font-black text-xs">
                    [ QR CODE ]
                  </div>
                  <span className="text-[8px] text-stone-400 font-bold uppercase block">Scan to bind TOTP: TNPA-MEMBER-SEC-773</span>
                </div>
              )}

              {/* Manual backup system */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">
                  {lang === "ta" ? "தரவு தானியங்கி காப்புநகல்" : "Cloud Ledger Encrypted Backup"}
                </span>
                <button
                  onClick={() => {
                    alert(lang === "ta" ? "அனைத்து உறுப்பினர் கோப்புகளும் என்க்ரிப்ட் செய்யப்பட்டு மேகக்கணினியில் காப்புநகல் செய்யப்பட்டது!" : "Full member ledger databases securely compiled, hash verified, and backed up to cloud-run secure vaults.");
                    onAddAuditLog("Manual Database Backup Completed", "Admin triggered manual database hot backup. Compressed archive generated.");
                  }}
                  className="w-full py-2 bg-stone-950 hover:bg-stone-900 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  {lang === "ta" ? "இப்போதே காப்புநகல் செய் (Backup)" : "Trigger Manual Cloud Backup"}
                </button>
              </div>
            </div>

            {/* Suspicious login alerts */}
            <div className="space-y-3.5 text-left">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">
                {lang === "ta" ? "பாதுகாப்பு எச்சரிக்கை பதிவுகள்" : "Security Incident Alert logs"}
              </span>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {suspiciousLogins.map((s, idx) => (
                  <div key={`sh_sec_${s.id}_${idx}`} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-[10px] leading-relaxed">
                    <div className="flex justify-between font-black text-red-600 mb-1">
                      <span>ALERT: SUSPICIOUS LOGIN</span>
                      <span>{s.time}</span>
                    </div>
                    <p className="font-bold text-stone-950">IP: {s.ip} ({s.location})</p>
                    <p className="text-stone-500">{s.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Health Monitor Panel */}
        <div className="space-y-6 text-left">
          <div className={`p-6 rounded-3xl border ${
            darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <h5 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>{lang === "ta" ? "2. கணினி நலம் மற்றும் வேகம்" : "2. System Health Status"}</span>
            </h5>

            <div className="space-y-4">
              {/* CPU Load bar */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-stone-700 mb-1">
                  <span>CPU Core Performance</span>
                  <span>{cpuLoad}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${cpuLoad}%` }}></div>
                </div>
              </div>

              {/* DB Health status */}
              <div>
                <span className="text-[9px] font-extrabold uppercase text-stone-400 block mb-0.5">Database Health</span>
                <span className="text-[11px] font-black text-emerald-600">{dbHealth}</span>
              </div>

              {/* Storage usage bar */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-stone-700 mb-1">
                  <span>Encrypted Storage Consumed</span>
                  <span>{storageUsed}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${storageUsed}%` }}></div>
                </div>
              </div>

              {/* Latency meter */}
              <div>
                <span className="text-[9px] font-extrabold uppercase text-stone-400 block mb-0.5">API Server Response Time</span>
                <span className="text-[11px] font-black text-indigo-600">{apiLatency} ms (Extremely Fast)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Decision Support & Executive Reports */}
      <div className={`p-6 rounded-3xl border text-left ${
        darkMode ? "bg-stone-900/30 border-stone-800" : "bg-indigo-50/20 border-indigo-200/50"
      }`}>
        <h5 className="text-xs font-black uppercase tracking-wider text-indigo-700 mb-4 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          <span>{lang === "ta" ? "மாநில பொதுச்செயலாளருக்கான AI மேலாண்மை முடிவெடுக்கும் தளம்" : "AI Decision Support & Administrative Growth Insights"}</span>
        </h5>

        <p className="text-xs text-stone-500 leading-relaxed mb-4">
          {lang === "ta"
            ? "மாநில பொதுச் செயலாளர் ரா. சேவியர் பாபு அவர்களின் கவனத்திற்கு: சங்க வளர்ச்சி போக்குகள் மற்றும் மாவட்ட வாரியான செயல்திறன் மதிப்பீடு."
            : "Prestige Executive Briefings compiled for State General Secretary R. Xavier Babu."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
            <span className="text-[9px] font-black uppercase text-indigo-600 block">District Growth Trends</span>
            <h6 className="text-xs font-black text-stone-850">Coimbatore Enrolment surge (+18%)</h6>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Airless Spray masterclass drives 140+ new young painters to register this month. Recommend hosting similar hands-on drives in Trichy and Salem.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
            <span className="text-[9px] font-black uppercase text-indigo-600 block">Welfare Board Claims Audit</span>
            <h6 className="text-xs font-black text-stone-850">Pension Disbursement Delay in Madurai</h6>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Average state pension processing time stands at 14 days. Madurai regional unit shows 28 days delay. Recommending auto-alerts to district secretary Kumar.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
            <span className="text-[9px] font-black uppercase text-indigo-600 block">Training Effectiveness index</span>
            <h6 className="text-xs font-black text-stone-850">92% Chemical Safety Passing Rate</h6>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Painters completing the respiratory cartridge training course report zero inhalation hazards over 3 months. Safety drives have proven highly successful.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
