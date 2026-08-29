import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  Building, 
  User, 
  Phone, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Clock, 
  RefreshCw,
  Sparkles,
  Shield
} from "lucide-react";
import { UserAccount, UserRole } from "../types";
import { defaultAccounts } from "./AuthSystem";
import { saveStoredSuperAdminSession } from "./SuperAdminOtpAuth";

export interface RoleAuthConfig {
  role: UserRole;
  titleTa: string;
  titleEn: string;
  badgeTa: string;
  badgeEn: string;
  officerNameTa: string;
  officerNameEn: string;
  validPhones: string[]; // Normalized 10-digit phone numbers
  account: UserAccount;
  icon: React.ReactNode;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
  };
}

export const ROLE_AUTH_CONFIGS: Record<string, RoleAuthConfig> = {
  super_admin: {
    role: "super_admin",
    titleTa: "சூப்பர் அட்மின்",
    titleEn: "Super Admin Power",
    badgeTa: "முழு கட்டுப்பாடு & Super Key",
    badgeEn: "Full Master Access",
    officerNameTa: "ரா. சேவியர் பாபு (மாநில பொதுச்செயலாளர்)",
    officerNameEn: "R. Xavier Babu (State General Secretary)",
    validPhones: ["9443254321", "7010131915"],
    account: defaultAccounts[0],
    icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
    colorTheme: {
      bg: "bg-rose-950/40",
      border: "border-rose-500/50",
      text: "text-rose-400",
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30"
    }
  },
  state_president: {
    role: "state_president",
    titleTa: "மாநில தலைவர்",
    titleEn: "State President Executive",
    badgeTa: "மாநில நிர்வாக அதிகாரம்",
    badgeEn: "State Executive Power",
    officerNameTa: "எஸ். மைக்கேல் ஆல்வின் (மாநில தலைவர்)",
    officerNameEn: "S. Michael Alvin (State President)",
    validPhones: ["9443212345", "9789331681"],
    account: defaultAccounts[1],
    icon: <Award className="w-5 h-5 text-amber-400" />,
    colorTheme: {
      bg: "bg-amber-950/40",
      border: "border-amber-500/50",
      text: "text-amber-400",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30"
    }
  },
  district_admin: {
    role: "district_admin",
    titleTa: "மாவட்ட அட்மின்",
    titleEn: "District Admin Power",
    badgeTa: "மாவட்ட கிளை ஒப்புதல்",
    badgeEn: "District Branch Approval",
    officerNameTa: "எஸ். ரமேஷ் குமார் (மாவட்ட செயலாளர்)",
    officerNameEn: "S. Ramesh Kumar (District Secretary)",
    validPhones: ["9840987654", "9710055443"],
    account: defaultAccounts[3],
    icon: <Building className="w-5 h-5 text-blue-400" />,
    colorTheme: {
      bg: "bg-blue-950/40",
      border: "border-blue-500/50",
      text: "text-blue-400",
      badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    }
  },
  member: {
    role: "member",
    titleTa: "சங்க உறுப்பினர்",
    titleEn: "Union Active Member",
    badgeTa: "டிஜிட்டல் அடையாள அட்டை",
    badgeEn: "Digital Member ID & Welfare",
    officerNameTa: "ரா. கார்த்திகேயன் (பதிவு பெற்ற உறுப்பினர்)",
    officerNameEn: "R. Karthikeyan (Registered Painter)",
    validPhones: ["9876543210"],
    account: defaultAccounts[4],
    icon: <User className="w-5 h-5 text-emerald-400" />,
    colorTheme: {
      bg: "bg-emerald-950/40",
      border: "border-emerald-500/50",
      text: "text-emerald-400",
      badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    }
  }
};

interface RoleMobileAuthModalProps {
  lang: "ta" | "en";
  roleConfig: RoleAuthConfig;
  onClose: () => void;
  onSuccess: (user: UserAccount, isSuperAdminVerified?: boolean) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function RoleMobileAuthModal({
  lang,
  roleConfig,
  onClose,
  onSuccess,
  onAddAuditLog
}: RoleMobileAuthModalProps) {
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);

  // Timer for OTP countdown
  useEffect(() => {
    let interval: any = null;
    if (step === "otp" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  // Clean phone number helper (extracts last 10 digits)
  const cleanPhone = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    return cleaned.slice(-10);
  };

  // Helper to parse JSON safely
  const parseSafe = async (res: Response) => {
    const text = await res.text();
    if (!text || !text.trim()) return { success: res.ok };
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, error: `Server error (HTTP ${res.status})` };
    }
  };

  // 1. Validate phone and send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    const tenDigit = cleanPhone(phoneInput);

    if (tenDigit.length !== 10) {
      setErrorMsg(
        lang === "ta"
          ? "சரியான 10-இலக்க மொபைல் எண்ணை உள்ளிடவும்."
          : "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    // STRICT CHECK: The entered phone MUST match one of the authorized registered numbers for this role
    const isAuthorized = roleConfig.validPhones.some((p) => cleanPhone(p) === tenDigit);

    if (!isAuthorized) {
      setErrorMsg(
        lang === "ta"
          ? `❌ தவறான மொபைல் எண்! "${roleConfig.titleTa}" பொறுப்பிற்கு பதிவு செய்யப்பட்ட அதிகாரப்பூர்வ மொபைல் எண்ணை மட்டுமே உள்ளிட வேண்டும். (அனுமதிக்கப்பட்ட எண்கள்: ${roleConfig.validPhones.map(p => `+91 ${p}`).join(", ")})`
          : `❌ Unauthorized Phone! Only the official registered mobile number for "${roleConfig.titleEn}" is allowed. (Registered numbers: ${roleConfig.validPhones.map(p => `+91 ${p}`).join(", ")})`
      );
      return;
    }

    setIsLoading(true);

    try {
      if (roleConfig.role === "super_admin") {
        // Super Admin OTP endpoint
        const resp = await fetch("/api/superadmin/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: `+91${tenDigit}` })
        });
        const data = await parseSafe(resp);
        setIsLoading(false);

        if (!resp.ok || !data.success) {
          setErrorMsg(lang === "ta" ? (data.errorTa || data.error) : data.error);
          return;
        }

        if (data.debugCode) {
          setDebugOtpCode(data.debugCode);
        }
      } else {
        // General OTP endpoint
        const resp = await fetch("/api/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: `+91${tenDigit}` })
        });
        const data = await parseSafe(resp);
        setIsLoading(false);

        if (!resp.ok || !data.success) {
          setErrorMsg(lang === "ta" ? (data.errorTa || data.error) : data.error);
          return;
        }

        if (data.debugCode) {
          setDebugOtpCode(data.debugCode);
        }
      }

      setStep("otp");
      setOtpTimer(60);
      setSuccessMsg(
        lang === "ta"
          ? `6-இலக்க OTP உங்களின் பதிவு செய்யப்பட்ட மொபைல் எண் (+91 ${tenDigit}) -க்கு அனுப்பப்பட்டுள்ளது.`
          : `6-digit OTP has been sent to your registered mobile number (+91 ${tenDigit}).`
      );
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Failed to dispatch OTP");
    }
  };

  // 2. Verify OTP and login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const code = otpInput.trim();

    if (code.length !== 6) {
      setErrorMsg(
        lang === "ta"
          ? "6-இலக்க OTP எண்ணை முழுமையாக உள்ளிடவும்."
          : "Please enter the full 6-digit OTP."
      );
      return;
    }

    setIsLoading(true);
    const tenDigit = cleanPhone(phoneInput);

    try {
      if (roleConfig.role === "super_admin") {
        const resp = await fetch("/api/superadmin/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: `+91${tenDigit}`,
            code: code
          })
        });
        const data = await parseSafe(resp);
        setIsLoading(false);

        if (!resp.ok || !data.success) {
          setErrorMsg(lang === "ta" ? (data.errorTa || data.error) : data.error);
          return;
        }

        // Save session in session storage for super admin
        if (data.token || data.sessionToken) {
          const validToken = data.token || data.sessionToken;
          const validUser = data.user || roleConfig.account;
          saveStoredSuperAdminSession(validToken, validUser);
        }

        setStep("success");
        onAddAuditLog(
          "Super Admin Verified Mobile Login",
          `Super Admin logged in with registered phone +91${tenDigit} and valid OTP.`
        );

        setTimeout(() => {
          onSuccess(roleConfig.account, true);
        }, 1200);
      } else {
        // Standard OTP verification
        const resp = await fetch("/api/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: `+91${tenDigit}`,
            code: code
          })
        });
        const data = await parseSafe(resp);
        setIsLoading(false);

        if (!resp.ok || !data.success) {
          setErrorMsg(lang === "ta" ? (data.errorTa || data.error) : data.error);
          return;
        }

        setStep("success");
        onAddAuditLog(
          "Role Mobile Login",
          `Logged in to ${roleConfig.titleEn} (${roleConfig.officerNameEn}) with registered phone +91${tenDigit}.`
        );

        setTimeout(() => {
          onSuccess(roleConfig.account, false);
        }, 1200);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "OTP verification failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-white relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`p-4 border-b border-stone-800 flex items-center justify-between ${roleConfig.colorTheme.bg}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-black/40 border border-white/10">
              {roleConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-stone-100">
                  {lang === "ta" ? roleConfig.titleTa : roleConfig.titleEn}
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${roleConfig.colorTheme.badgeBg}`}>
                  {lang === "ta" ? roleConfig.badgeTa : roleConfig.badgeEn}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                {lang === "ta" ? roleConfig.officerNameTa : roleConfig.officerNameEn}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-start gap-2 text-left">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200/90 leading-tight">
            {lang === "ta" 
              ? "பாதுகாப்பு விதிமுறை: இந்த பொறுப்பிற்கு பதிவு செய்யப்பட்ட அதிகாரப்பூர்வ மொபைல் எண்ணை உள்ளிட்டு OTP சரிபார்ப்பு செய்த பிறகே உள்நுழைய முடியும்."
              : "Security Requirement: You must enter the official registered mobile number for this role and verify with 6-digit OTP to gain access."}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-5 text-left">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: ENTER REGISTERED PHONE */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>{lang === "ta" ? "பதிவு செய்யப்பட்ட மொபைல் எண்" : "Registered Mobile Number"}</span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {lang === "ta" ? "அங்கீகரிக்கப்பட்ட எண்கள்:" : "Authorized:"} {roleConfig.validPhones.map(p => `...${p.slice(-4)}`).join(", ")}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 font-mono text-xs font-bold">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="94432 54321"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-12 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1.5">
                  {lang === "ta"
                    ? `குறிப்பு: "${roleConfig.titleTa}" அதிகாரத்திற்கு பதிவு செய்யப்பட்ட ${roleConfig.validPhones.join(" அல்லது ")} என்ற எண்ணை உள்ளிடவும்.`
                    : `Note: Enter registered phone ${roleConfig.validPhones.join(" or ")} assigned to this role.`}
                </p>
              </div>

              {/* Authorized Quick Hint Helper Buttons for Testing Ease */}
              <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block mb-1.5 font-bold uppercase tracking-wider">
                  {lang === "ta" ? "அதிகாரப்பூர்வ பதிவு எண்கள் (தேர்வு செய்க):" : "Official Registered Numbers (Tap to fill):"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {roleConfig.validPhones.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPhoneInput(p)}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded-lg text-xs font-mono text-amber-300 transition-colors cursor-pointer"
                    >
                      +91 {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {lang === "ta" ? "ரத்து" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || cleanPhone(phoneInput).length !== 10}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{lang === "ta" ? "OTP பெறுக" : "Send OTP"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ENTER OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>{lang === "ta" ? "6-இலக்க OTP குறியீடு" : "6-Digit OTP Code"}</span>
                  {debugOtpCode && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                      OTP: {debugOtpCode}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-center text-white font-mono text-xl tracking-[0.4em] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  autoFocus
                />
                
                {debugOtpCode && (
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setOtpInput(debugOtpCode)}
                      className="text-[11px] text-amber-400 underline hover:text-amber-300 font-medium cursor-pointer"
                    >
                      {lang === "ta" ? `OTP-ஐ தானாக நிரப்புக (${debugOtpCode})` : `Auto-fill OTP (${debugOtpCode})`}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 text-[11px] text-stone-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{otpTimer > 0 ? `${otpTimer}s` : (lang === "ta" ? "காலாவதியானது" : "Expired")}</span>
                  </div>
                  {otpTimer === 0 && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-amber-400 hover:underline font-bold cursor-pointer"
                    >
                      {lang === "ta" ? "மீண்டும் OTP அனுப்புக" : "Resend OTP"}
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setErrorMsg("");
                  }}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {lang === "ta" ? "எண் மாற்றுக" : "Change Phone"}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otpInput.trim().length !== 6}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === "ta" ? "உறுதி செய்து உள்நுழைக" : "Verify & Sign In"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "success" && (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base text-stone-100">
                {lang === "ta" ? "அங்கீகாரம் வெற்றிகரமாக முடிந்தது!" : "Authentication Successful!"}
              </h4>
              <p className="text-xs text-stone-300">
                {lang === "ta" 
                  ? `"${roleConfig.titleTa}" அதிகாரத்திற்கு மாற்றப்படுகிறீர்கள்...` 
                  : `Switching to ${roleConfig.titleEn}...`}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
