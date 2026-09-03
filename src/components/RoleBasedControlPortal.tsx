import React, { useState } from "react";
import { 
  ShieldCheck, ShieldAlert, Award, Building, User, Key, Lock, Unlock, 
  FileText, CheckCircle2, AlertTriangle, Users, Gavel, Globe, RefreshCw, 
  Search, Shield, Check, X, Eye, EyeOff, Settings, Briefcase, Zap
} from "lucide-react";
import { UserAccount, UserRole } from "../types";

interface RoleBasedControlPortalProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onUpdateUserRole?: (newRole: UserRole) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

interface SuperKeyItem {
  id: string;
  keyValue: string;
  targetRole: UserRole;
  issuedBy: string;
  createdAt: string;
  status: "active" | "revoked" | "used";
  assignedTo?: string;
  adminPhone?: string;
}

export default function RoleBasedControlPortal({
  lang,
  currentUser,
  onUpdateUserRole,
  onAddAuditLog
}: RoleBasedControlPortalProps) {
  // Super Keys stored in state / local storage
  const [superKeys, setSuperKeys] = useState<SuperKeyItem[]>([
    {
      id: "key_1",
      keyValue: "TNPA-SUPERKEY-2026-XAVIER-9840048200",
      targetRole: "super_admin",
      issuedBy: "R. Xavier Babu (Primary Super Admin)",
      createdAt: "2026-01-01",
      status: "active",
      assignedTo: "S. Michael Alwin",
      adminPhone: "9840048200"
    },
    {
      id: "key_2",
      keyValue: "TNPA-STATEKEY-2026-SAKTHI-9443254321",
      targetRole: "state_admin",
      issuedBy: "R. Xavier Babu (Super Admin)",
      createdAt: "2026-02-10",
      status: "active",
      assignedTo: "R. Sakthivel",
      adminPhone: "9443254321"
    },
    {
      id: "key_3",
      keyValue: "TNPA-JUDICIALKEY-2026-SENTHIL-9841012345",
      targetRole: "judicial_admin",
      issuedBy: "R. Xavier Babu (Super Admin)",
      createdAt: "2026-03-01",
      status: "active",
      assignedTo: "Adv. K. Senthil Nathan",
      adminPhone: "9841012345"
    },
    {
      id: "key_4",
      keyValue: "TNPA-DISTKEY-2026-RAMESH-9710055443",
      targetRole: "district_admin",
      issuedBy: "R. Xavier Babu (Super Admin)",
      createdAt: "2026-03-15",
      status: "active",
      assignedTo: "S. Ramesh Kumar",
      adminPhone: "9710055443"
    },
    {
      id: "key_5",
      keyValue: "TNPA-UNIONKEY-2026-MURUGAN-9625544110",
      targetRole: "union_admin",
      issuedBy: "R. Xavier Babu (Super Admin)",
      createdAt: "2026-04-01",
      status: "active",
      assignedTo: "M. Murugan",
      adminPhone: "9625544110"
    }
  ]);

  const [newKeyTargetRole, setNewKeyTargetRole] = useState<UserRole>("district_admin");
  const [assignedPersonName, setAssignedPersonName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [enteredSuperKeyInput, setEnteredSuperKeyInput] = useState("");
  const [keyVerificationMsg, setKeyVerificationMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Super Admin Mobile Verification for viewing/managing all admin keys
  const [superAdminPhoneInput, setSuperAdminPhoneInput] = useState("");
  const [superAdminPhoneVerified, setSuperAdminPhoneVerified] = useState(false);
  const [phoneVerifyError, setPhoneVerifyError] = useState("");

  const handleVerifySuperAdminPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneVerifyError("");
    const clean = superAdminPhoneInput.replace(/\D/g, "").slice(-10);
    if (clean.length === 10) {
      setSuperAdminPhoneVerified(true);
      onAddAuditLog("Super Admin Mobile Verified", `Super Admin verified mobile +91${clean} to reveal all admin keys.`);
    } else {
      setPhoneVerifyError(
        lang === "ta" 
          ? "தயவுசெய்து சரியான 10 இலக்க சூப்பர் அட்மின் கைபேசி எண்ணை உள்ளிடவும்!" 
          : "Please enter a valid 10-digit Super Admin mobile number!"
      );
    }
  };

  const roleLabels: Record<UserRole, { ta: string; en: string; color: string }> = {
    super_admin: { ta: "சூப்பர் அட்மின் (Super Admin)", en: "Super Admin", color: "bg-rose-600 text-white" },
    state_admin: { ta: "மாநில அட்மின் (State Admin)", en: "State Admin", color: "bg-amber-600 text-white" },
    state_president: { ta: "மாநில தலைவர் (State President)", en: "State President", color: "bg-amber-700 text-white" },
    judicial_admin: { ta: "ஜூடிஷியல் / சட்ட அட்மின் (Judicial Admin)", en: "Judicial Admin", color: "bg-purple-700 text-white" },
    state_treasurer: { ta: "மாநில பொருளாளர் (State Treasurer)", en: "State Treasurer", color: "bg-emerald-700 text-white" },
    district_admin: { ta: "மாவட்ட அட்மின் (District Admin)", en: "District Admin", color: "bg-blue-600 text-white" },
    union_admin: { ta: "ஒன்றிய அட்மின் (Union Admin)", en: "Union Admin", color: "bg-teal-600 text-white" },
    member: { ta: "உறுப்பினர் (Member)", en: "Member", color: "bg-stone-700 text-white" },
    visitor: { ta: "பார்வையாளர் (Visitor)", en: "Visitor", color: "bg-stone-500 text-white" }
  };

  // Generate new Super Key based on Admin Phone Number
  const handleGenerateSuperKey = () => {
    if (!assignedPersonName.trim()) {
      alert(lang === "ta" ? "பொறுப்பாளர் பெயரை உள்ளிடவும்!" : "Please enter assigned person name!");
      return;
    }
    const cleanPhone = adminPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      alert(lang === "ta" ? "சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்!" : "Please enter a valid 10-digit phone number!");
      return;
    }
    const prefix = newKeyTargetRole.toUpperCase().replace("_", "");
    const newKey: SuperKeyItem = {
      id: `key_${Date.now()}`,
      keyValue: `TNPA-KEY-2026-${prefix}-${cleanPhone}`,
      targetRole: newKeyTargetRole,
      issuedBy: currentUser ? `${currentUser.nameEn} (${currentUser.role})` : "Super Admin",
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
      assignedTo: assignedPersonName,
      adminPhone: cleanPhone
    };

    setSuperKeys([newKey, ...superKeys]);
    onAddAuditLog("Super Key Generated", `New ${newKeyTargetRole} key generated and issued to ${assignedPersonName} with phone +91${cleanPhone}`);
    setAssignedPersonName("");
    setAdminPhone("");
    alert(lang === "ta" 
      ? `✓ அட்மின் தொலைபேசி எண்ணை அடிப்படையாகக் கொண்டு புதிய சூப்பர் கீ உருவாக்கப்பட்டது!\nகீ: ${newKey.keyValue}\nதொலைபேசி: +91${cleanPhone}` 
      : `✓ Super Key generated successfully for admin phone +91${cleanPhone}!\nKey: ${newKey.keyValue}`);
  };

  // Revoke key
  const handleRevokeKey = (id: string) => {
    setSuperKeys(superKeys.map(k => k.id === id ? { ...k, status: "revoked" } : k));
    onAddAuditLog("Super Key Revoked", `Key ID ${id} was revoked.`);
  };

  // Verify key for role promotion
  const handleVerifyKeyAndUnlock = () => {
    const found = superKeys.find(k => k.keyValue === enteredSuperKeyInput.trim() && k.status === "active");
    if (found) {
      setKeyVerificationMsg({
        success: true,
        text: lang === "ta" ? `✓ சூப்பர் கீ சரிபார்க்கப்பட்டது! நீங்கள் ${roleLabels[found.targetRole].ta} நிலைக்கு உயர்த்தப்பட்டுள்ளீர்கள்.` : `✓ Super Key verified! You are authorized for ${roleLabels[found.targetRole].en} access.`
      });
      if (onUpdateUserRole) {
        onUpdateUserRole(found.targetRole);
      }
      onAddAuditLog("Super Key Redeemed", `Redeemed key ${found.keyValue} for role ${found.targetRole}`);
    } else {
      setKeyVerificationMsg({
        success: false,
        text: lang === "ta" ? "❌ செல்லாத அல்லது காலாவதியான சூப்பர் கீ! சூப்பர் அட்மினைத் தொடர்பு கொள்ளவும்." : "❌ Invalid or revoked Super Key! Contact Super Admin."
      });
    }
  };

  const userRole = currentUser ? currentUser.role : "visitor";

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner explaining Tiered Architecture */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full font-black text-xs uppercase tracking-wide">
                {lang === "ta" ? "அதிகார வரம்பு & சூப்பர் கீ பாதுகாப்பு அமைப்பு" : "Tiered Role & Super Key Authorization Framework"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {lang === "ta" ? "TNPA² பல அடுக்கு அட்மின் கன்சோல் & சூப்பர் கீ மேலாண்மை" : "TNPA² Multi-Tier Admin Console & Super Key Governance"}
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-3xl">
              {lang === "ta" 
                ? "சூப்பர் அட்மின், மாநில அட்மின், ஜூடிஷியல் அட்மின், மாவட்ட அட்மின் மற்றும் ஒன்றிய அட்மின் என கடுமையான பாதுகாப்புடன் பிரிக்கப்பட்டுள்ளது. ஜூடிஷியல் ரகசியங்கள் மாவட்ட அட்மின்களுக்கு தெரியாதவாறு பிரிக்கப்பட்டுள்ளது. சூப்பர் கிக்கள் (Super Keys) சூப்பர் அட்மினால் மட்டுமே உருவாக்கப்பட்டு வழங்கப்பட வேண்டும்."
                : "Strictly segregated into Super Admin, State Admin, Judicial Admin, District Admin, and Union Admin tiers. Judicial actions are isolated from District Admins. Super Keys can ONLY be generated and issued by Super Admins."}
            </p>
          </div>

          <div className="bg-black/40 border border-amber-500/30 p-4 rounded-2xl text-center min-w-[200px]">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">{lang === "ta" ? "தற்போதைய பயனர் நிலை" : "Current User Role"}</span>
            <span className={`inline-block mt-1 px-3 py-1 rounded-xl text-xs font-black uppercase ${roleLabels[userRole]?.color || 'bg-stone-700 text-white'}`}>
              {roleLabels[userRole] ? (lang === "ta" ? roleLabels[userRole].ta : roleLabels[userRole].en) : userRole}
            </span>
          </div>
        </div>
      </div>

      {/* SUPER ADMIN EXCLUSIVE: SUPER KEY ISSUER & ALL ADMINS GOVERNANCE */}
      {userRole === "super_admin" && !superAdminPhoneVerified && (
        <div className="bg-white border-2 border-rose-500/40 rounded-3xl p-6 md:p-8 shadow-xl max-w-xl mx-auto space-y-6 text-center">
          <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-700 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              {lang === "ta" ? "சூப்பர் அட்மின் உயர் பாதுகாப்பு கேட்வே" : "Super Admin High-Security Gateway"}
            </span>
            <h3 className="text-xl font-black text-stone-900 mt-2">
              {lang === "ta" ? "அட்மின் சாவிகளைப் (Admin Keys) பார்வையிட கைபேசி எண் சரிபார்ப்பு தேவை" : "Super Admin Mobile Number Verification Required"}
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              {lang === "ta"
                ? "பாதுகாப்புக் காரணங்களுக்காக, அனைத்து அட்மின்களின் சாவிகளையும் (Keys) பார்க்க சூப்பர் அட்மின் தனது பதிவு செய்யப்பட்ட கைபேசி எண்ணை உள்ளிட்டு உறுதிப்படுத்த வேண்டும். (மற்ற எந்தப் பக்கத்திலும் அல்லது வேறு அட்மின்களுக்கு சாவிகள் காட்டப்படாது)."
                : "For strict security, viewing all admin access keys requires Super Admin mobile confirmation. Admin keys are hidden on all other pages and tiers."}
            </p>
          </div>

          {phoneVerifyError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
              {phoneVerifyError}
            </div>
          )}

          <form onSubmit={handleVerifySuperAdminPhone} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 text-left">
                {lang === "ta" ? "சூப்பர் அட்மின் கைபேசி எண் (Super Admin Mobile No)" : "Super Admin Mobile Number"}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={superAdminPhoneInput}
                  onChange={(e) => setSuperAdminPhoneInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="9443254321"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 font-bold"
                />
                <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === "ta" ? "கைபேசி எண்ணைச் சரிபார்த்து அட்மின் சாவிகளைத் திற (Verify & Unlock Keys)" : "Verify Mobile & Unlock Admin Keys"}</span>
            </button>
          </form>
        </div>
      )}

      {userRole === "super_admin" && superAdminPhoneVerified && (
        <div className="bg-white border-2 border-rose-500/30 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-stone-900 text-base sm:text-lg">
                  {lang === "ta" ? "சூப்பர் அட்மின் பிரத்யேக 'சூப்பர் கீ' தயாரிப்பு மையம்" : "Super Admin Exclusive 'Super Key' Issuer & Control Hub"}
                </h3>
                <p className="text-stone-500 text-xs">
                  {lang === "ta" ? "மற்ற அட்மின்களுக்கான அங்கீகாரச் சாவிகளை (Super Keys) உருவாக்கி வழங்குங்கள்." : "Generate and distribute secure authorization keys for State, Judicial, District and Union Admins."}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-xl text-xs font-black">
              {lang === "ta" ? "2 சூப்பர் அட்மின் அதிகாரம் актив" : "2 Super Admins Active"}
            </span>
          </div>

          {/* Key Generator Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-50 p-5 rounded-2xl border border-stone-200">
            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">
                {lang === "ta" ? "அனுமதி வழங்கப்பட வேண்டிய பதவி (Target Role)" : "Target Admin Role"}
              </label>
              <select
                value={newKeyTargetRole}
                onChange={(e) => setNewKeyTargetRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
              >
                <option value="super_admin">{lang === "ta" ? "சூப்பர் அட்மின் (Super Admin)" : "Super Admin"}</option>
                <option value="state_admin">{lang === "ta" ? "மாநில அட்மின் (State Admin)" : "State Admin"}</option>
                <option value="judicial_admin">{lang === "ta" ? "ஜூடிஷியல் அட்மின் (Judicial Admin)" : "Judicial Admin"}</option>
                <option value="district_admin">{lang === "ta" ? "மாவட்ட அட்மின் (District Admin)" : "District Admin"}</option>
                <option value="union_admin">{lang === "ta" ? "ஒன்றிய அட்மின் (Union Admin)" : "Union Admin"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">
                {lang === "ta" ? "பொறுப்பாளர் பெயர் (Assigned Person Name)" : "Assigned Person Name"}
              </label>
              <input
                type="text"
                value={assignedPersonName}
                onChange={(e) => setAssignedPersonName(e.target.value)}
                placeholder={lang === "ta" ? "எ.கா: திரு. ரா. சக்திவேல்" : "e.g. R. Sakthivel"}
                className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">
                {lang === "ta" ? "அட்மின் தொலைபேசி எண் (Admin Phone)" : "Admin Phone Number"}
              </label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="9443254321"
                maxLength={10}
                className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateSuperKey}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>{lang === "ta" ? "சூப்பர் கீ உருவாக்குக" : "Generate Super Key"}</span>
              </button>
            </div>
          </div>

          {/* Active Super Keys List */}
          <div>
            <h4 className="font-extrabold text-stone-900 text-sm mb-3">
              {lang === "ta" ? "வழங்கப்பட்ட அனைத்து சூப்பர் கீகளின் பட்டியல் (Issued Super Keys Register)" : "Active Super Keys Register"}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <th className="p-3 font-black">சூப்பர் கீ (Super Key)</th>
                    <th className="p-3 font-black">பதவி (Role Tier)</th>
                    <th className="p-3 font-black">ஒதுக்கப்பட்டவர் (Assigned To)</th>
                    <th className="p-3 font-black">தொலைபேசி எண் (Phone No)</th>
                    <th className="p-3 font-black">உருவாக்கியவர் (Issued By)</th>
                    <th className="p-3 font-black">நிலை (Status)</th>
                    <th className="p-3 font-black text-right">செயல் (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {superKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-stone-50 transition-all">
                      <td className="p-3 font-mono font-bold text-rose-700 bg-rose-50/50">{k.keyValue}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${roleLabels[k.targetRole]?.color || 'bg-stone-600 text-white'}`}>
                          {k.targetRole}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{k.assignedTo || "General"}</td>
                      <td className="p-3 font-mono text-blue-700 font-bold">{k.adminPhone ? `+91 ${k.adminPhone}` : "N/A"}</td>
                      <td className="p-3 text-stone-500">{k.issuedBy}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${k.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {k.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {k.status === 'active' && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="px-2.5 py-1 bg-stone-200 hover:bg-rose-600 hover:text-white text-stone-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            {lang === "ta" ? "ரத்து செய்" : "Revoke"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUPER KEY REDEMPTION FOR ANY USER TO PROMOTE ROLE */}
      {userRole !== "super_admin" && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-base">
                {lang === "ta" ? "சூப்பர் அட்மின் வழங்கிய 'சூப்பர் கீ' உள்ளீடு (Enter Super Key)" : "Redeem Super Key for Role Authorization"}
              </h3>
              <p className="text-stone-600 text-xs">
                {lang === "ta" ? "உங்களுக்கு சூப்பர் அட்மின் வழங்கிய சாவியை உள்ளிட்டு குறிப்பிட்ட அட்மின் அதிகாரத்தைப் பெறுக." : "Enter the secure key provided by Super Admin to unlock your designated admin tier."}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="text"
              value={enteredSuperKeyInput}
              onChange={(e) => setEnteredSuperKeyInput(e.target.value)}
              placeholder="TNPA-KEY-2026-..."
              className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-800"
            />
            <button
              onClick={handleVerifyKeyAndUnlock}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
            >
              {lang === "ta" ? "சரிபார்த்து திற (Verify & Unlock)" : "Verify & Unlock"}
            </button>
          </div>

          {keyVerificationMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold ${keyVerificationMsg.success ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
              {keyVerificationMsg.text}
            </div>
          )}
        </div>
      )}

      {/* ROLE-SPECIFIC DEDICATED PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. STATE ADMIN / PRESIDENT PANEL */}
        <div className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 ${userRole === 'state_admin' || userRole === 'state_president' || userRole === 'super_admin' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-stone-200 opacity-80'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="font-black text-stone-900 text-sm">
                {lang === "ta" ? "மாநில நிர்வாகப் பக்கம் (State Admin Panel)" : "State Admin Panel"}
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
              {lang === "ta" ? "மாநிலம் முழுவதும்" : "Statewide"}
            </span>
          </div>
          <p className="text-stone-600 text-xs">
            {lang === "ta" ? "38 மாவட்டங்களின் பொது மேலாண்மை, மாநில கொள்கை அறிவிப்புகள் மற்றும் மாநிலச் செயற்குழு ஒருங்கிணைப்பு." : "Statewide coordination across all 38 districts, general executive policy and circulars."}
          </p>
          <div className="space-y-2 text-xs font-medium text-stone-700 bg-stone-50 p-3 rounded-xl">
            <div className="flex justify-between"><span>• மாநில தலைவர்:</span> <strong className="text-stone-900">எஸ். மைக்கேல் ஆல்வின்</strong></div>
            <div className="flex justify-between"><span>• பொதுச்செயலாளர்:</span> <strong className="text-stone-900">ரா. சேவியர் பாபு</strong></div>
            <div className="flex justify-between"><span>• மாநில பொருளாளர்:</span> <strong className="text-stone-900">ஆர். சக்திவேல்</strong></div>
          </div>
          <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl font-bold">
            ✓ {lang === "ta" ? "மாநில நிதிக் கணக்குகள் மற்றும் 38 மாவட்ட புள்ளிவிவரங்களைக் காணும் அதிகாரம்." : "Authorized to view statewide accounts & 38 district metrics."}
          </div>
        </div>

        {/* 2. JUDICIAL ADMIN PANEL (Strictly Isolated from District Admins) */}
        <div className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 ${userRole === 'judicial_admin' || userRole === 'super_admin' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-stone-200 opacity-80'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-stone-900 text-sm">
                {lang === "ta" ? "ஜூடிஷியல் / சட்ட அட்மின் பக்கம் (Judicial Admin)" : "Judicial & Legal Compliance Panel"}
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-extrabold">
              {lang === "ta" ? "ரகசியம் / தனிமைப்படுத்தப்பட்டது" : "Strictly Confidential"}
            </span>
          </div>
          <p className="text-stone-600 text-xs">
            {lang === "ta" ? "சட்ட வழக்குகள், ஒழுங்கு நடவடிக்கைகள், தணிக்கை பதிவுகள் (Audit Logs) மற்றும் சங்க விதிகள் மீறல் புகார்கள்." : "Legal disputes, disciplinary actions, security audit logs scrutiny and union compliance."}
          </p>
          <div className="space-y-2 text-xs font-medium text-stone-700 bg-purple-50/60 p-3 rounded-xl border border-purple-100">
            <div className="flex justify-between"><span>• சட்ட ஆலோசகர்:</span> <strong className="text-stone-900">Adv. K. Senthil Nathan</strong></div>
            <div className="flex justify-between"><span>• தணிக்கை வழக்குகள்:</span> <strong className="text-purple-700">0 ரகசிய விசாரணைகள்</strong></div>
          </div>
          <div className="text-[11px] text-purple-900 bg-purple-100/70 p-2.5 rounded-xl font-bold">
            🔒 <strong>முக்கியக் குறிப்பு:</strong> {lang === "ta" ? "மாவட்ட அட்மின்களுக்கு இந்த ஜூடிஷியல் பக்கத்தின் செயல்பாடுகள் தெரியாது (Strict Data Privacy)." : "District Admins cannot access or view Judicial Admin confidential data."}
          </div>
        </div>

        {/* 3. DISTRICT & UNION ADMIN PANEL */}
        <div className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 ${userRole === 'district_admin' || userRole === 'union_admin' || userRole === 'super_admin' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-stone-200 opacity-80'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-stone-900 text-sm">
                {lang === "ta" ? "மாவட்ட & ஒன்றிய அட்மின் பக்கம் (District / Union Admin)" : "District & Union Admin Panel"}
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
              {lang === "ta" ? "சொந்த மாவட்டம் மட்டும்" : "Own District Scope"}
            </span>
          </div>
          <p className="text-stone-600 text-xs">
            {lang === "ta" ? "அவரவர் சொந்த மாவட்டங்களில் உள்ள பொறுப்பாளர்கள் மற்றும் உறுப்பினர்களின் பதிவுகளை மட்டும் கையாள்வது." : "Manage respective own district bearers, local membership approvals and welfare verifications."}
          </p>
          <div className="space-y-2 text-xs font-medium text-stone-700 bg-blue-50/50 p-3 rounded-xl">
            <div className="flex justify-between"><span>• பொறுப்பு மாவட்டம்:</span> <strong className="text-stone-900">சென்னை / மதுரை / கோயம்புத்தூர்</strong></div>
            <div className="flex justify-between"><span>• உறுப்பினர் ஒப்புதல்கள்:</span> <strong className="text-emerald-700">செயலில் உள்ளது</strong></div>
          </div>
          <div className="text-[11px] text-blue-800 bg-blue-50 p-2.5 rounded-xl font-bold">
            ✓ {lang === "ta" ? "சொந்த மாவட்ட உறுப்பினர்களை மட்டுமே நிர்வகிக்க இயலும்." : "Restricted strictly to own district boundary operations."}
          </div>
        </div>

      </div>
    </div>
  );
}
