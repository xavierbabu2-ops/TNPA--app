import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  Lock,
  Unlock,
  Sparkles,
  Info,
  ChevronLeft,
  Zap,
  Check
} from "lucide-react";
import { UserAccount } from "../types";

interface SuperAdminOtpAuthProps {
  lang: "ta" | "en";
  onSuccess: (user: UserAccount, token: string) => void;
  onCancel?: () => void;
  onAddAuditLog: (action: string, details: string) => void;
  requiredForTitle?: string;
  requiredForTitleTa?: string;
}

export const SUPER_ADMIN_SESSION_KEY = "tnpa_super_admin_session_token";
export const SUPER_ADMIN_USER_KEY = "tnpa_super_admin_session_user";

// Helper to check if a valid active Super Admin session exists
export function getStoredSuperAdminSession(): { token: string; user: UserAccount } | null {
  try {
    const token = sessionStorage.getItem(SUPER_ADMIN_SESSION_KEY);
    const userStr = sessionStorage.getItem(SUPER_ADMIN_USER_KEY);
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return { token, user };
    }
  } catch {
    // ignore
  }
  return null;
}

export function clearStoredSuperAdminSession() {
  try {
    sessionStorage.removeItem(SUPER_ADMIN_SESSION_KEY);
    sessionStorage.removeItem(SUPER_ADMIN_USER_KEY);
  } catch {
    // ignore
  }
}

export default function SuperAdminOtpAuth({
  lang,
  onSuccess,
  onCancel,
  onAddAuditLog,
  requiredForTitle = "Super Admin Exclusive Console",
  requiredForTitleTa = "சூப்பர் அட்மின் பிரத்யேக கட்டளை மையம்"
}: SuperAdminOtpAuthProps) {
  // Wizard step: 'phone' or 'otp'
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneInput, setPhoneInput] = useState("9443254321"); // Pre-filled default for primary Super Admin
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);
  
  // Timers
  const [resendCountdown, setResendCountdown] = useState(0);
  const [expiryCountdown, setExpiryCountdown] = useState(300); // 5 minutes (300s)
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(5);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Input refs for 6 OTP boxes
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer countdown
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Expiry timer countdown
  useEffect(() => {
    let timer: any;
    if (step === "otp" && expiryCountdown > 0) {
      timer = setInterval(() => {
        setExpiryCountdown((prev) => {
          if (prev <= 1) {
            setErrorMsg(
              lang === "ta"
                ? "ஓடிபி காலாவதியாகிவிட்டது! புதிய ஓடிபி-ஐ பெறவும்."
                : "OTP code has expired! Please request a new one."
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, expiryCountdown, lang]);

  // Check stored active session on mount
  useEffect(() => {
    const existing = getStoredSuperAdminSession();
    if (existing?.token) {
      // Verify token with backend
      fetch("/api/superadmin/auth/status", {
        headers: {
          "Authorization": `Bearer ${existing.token}`,
          "x-superadmin-token": existing.token
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid && data.user) {
            onSuccess(data.user, existing.token);
          } else {
            clearStoredSuperAdminSession();
          }
        })
        .catch(() => {
          // If server fails or offline, keep local state or reset
        });
    }
  }, [onSuccess]);

  // Handle Phone Submit -> Send Super Admin OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setDebugOtpCode(null);

    const cleanDigits = phoneInput.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
      setErrorMsg(
        lang === "ta"
          ? "சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்!"
          : "Please enter a valid 10-digit Indian mobile number!"
      );
      return;
    }

    let tenDigit = cleanDigits.length === 10 ? cleanDigits : cleanDigits.slice(-10);
    if (!/^[6-9]\d{9}$/.test(tenDigit)) {
      setErrorMsg(
        lang === "ta"
          ? "இந்திய கைபேசி எண் 6, 7, 8 அல்லது 9-ல் தொடங்க வேண்டும்!"
          : "Indian mobile numbers must start with 6, 7, 8, or 9!"
      );
      return;
    }

    setIsLoading(true);

    try {
      const resp = await fetch("/api/superadmin/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${tenDigit}` })
      });

      const data = await resp.json();
      setIsLoading(false);

      if (!resp.ok || !data.success) {
        if (resp.status === 429) {
          setIsLockedOut(true);
        }
        throw new Error(
          lang === "ta" ? (data.errorTa || data.error) : (data.error || data.errorTa)
        );
      }

      setStep("otp");
      setResendCountdown(60);
      setExpiryCountdown(300); // 5 mins
      setAttemptsRemaining(5);
      setOtpDigits(["", "", "", "", "", ""]);
      
      if (data.debugCode) {
        setDebugOtpCode(data.debugCode);
      }

      setInfoMsg(
        lang === "ta"
          ? `அங்கீகரிக்கப்பட்ட சூப்பர் அட்மின் எண்ணிற்கு (+91 ${tenDigit}) 6 இலக்க ஓடிபி அனுப்பப்பட்டது.`
          : `6-digit Super Admin OTP dispatched to authorized number (+91 ${tenDigit}).`
      );

      onAddAuditLog(
        "Super Admin OTP Request",
        `Super Admin OTP dispatched to authorized mobile: +91${tenDigit}`
      );

      // Auto focus first OTP box
      setTimeout(() => {
        digitRefs.current[0]?.focus();
      }, 200);

    } catch (err: any) {
      setIsLoading(false);
      console.error("Super Admin OTP Send Error:", err);
      setErrorMsg(
        err.message || (lang === "ta" ? "ஓடிபி அனுப்புவதில் பிழை ஏற்பட்டது." : "Failed to send Super Admin OTP.")
      );
    }
  };

  // Handle OTP digit box change
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    // If pasted multi-digits
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split("");
      const next = [...otpDigits];
      pasted.forEach((d, i) => {
        if (i < 6) next[i] = d;
      });
      setOtpDigits(next);
      const targetIdx = Math.min(pasted.length, 5);
      digitRefs.current[targetIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = clean[0];
    setOtpDigits(next);

    // Auto advance
    if (index < 5 && clean[0]) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const fullCode = otpDigits.join("").trim();
    if (fullCode.length !== 6) {
      setErrorMsg(
        lang === "ta"
          ? "தயவுசெய்து 6 இலக்க ஓடிபி எண்ணை முழுமையாக உள்ளிடவும்!"
          : "Please enter all 6 digits of the OTP code!"
      );
      return;
    }

    const cleanDigits = phoneInput.replace(/\D/g, "");
    const tenDigit = cleanDigits.length === 10 ? cleanDigits : cleanDigits.slice(-10);

    setIsLoading(true);

    try {
      const resp = await fetch("/api/superadmin/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${tenDigit}`,
          code: fullCode
        })
      });

      const data = await resp.json();
      setIsLoading(false);

      if (!resp.ok || !data.success) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        if (resp.status === 429) {
          setIsLockedOut(true);
        }
        throw new Error(
          lang === "ta" ? (data.errorTa || data.error) : (data.error || data.errorTa)
        );
      }

      // Successful verification!
      const user = data.user as UserAccount;
      const token = data.token as string;

      // Store in session storage
      try {
        sessionStorage.setItem(SUPER_ADMIN_SESSION_KEY, token);
        sessionStorage.setItem(SUPER_ADMIN_USER_KEY, JSON.stringify(user));
      } catch {
        // ignore
      }

      onAddAuditLog(
        "Super Admin OTP Verified",
        `Super Admin session authorization successful for ${user.nameEn || user.name} via verified phone +91${tenDigit}`
      );

      onSuccess(user, token);

    } catch (err: any) {
      setIsLoading(false);
      console.error("Super Admin OTP Verification Error:", err);
      setErrorMsg(
        err.message || (lang === "ta" ? "ஓடிபி சரிபார்ப்பில் பிழை ஏற்பட்டது." : "Verification failed.")
      );
    }
  };

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="max-w-md w-full mx-auto bg-stone-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-stone-100 animate-[fadeIn_0.4s_ease-out]">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/40 border-b border-amber-500/20 text-center relative">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 mb-3 flex items-center justify-center">
          <div className="w-full h-full bg-stone-950 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] font-extrabold text-amber-300 uppercase tracking-widest mb-2">
          <Lock className="w-3 h-3 text-amber-400" />
          <span>{lang === "ta" ? "சூப்பர் அட்மின் ஓடிபி பாதுகாப்பு" : "SUPER ADMIN OTP GATEWAY"}</span>
        </div>

        <h3 className="text-lg font-black text-white tracking-wide">
          {lang === "ta" ? requiredForTitleTa : requiredForTitle}
        </h3>
        
        <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
          {lang === "ta"
            ? "அங்கீகரிக்கப்பட்ட சூப்பர் அட்மின் கைபேசி எண் மற்றும் 6-இலக்க ஓடிபி சரிபார்ப்பு மூலம் மட்டுமே அணுக முடியும்."
            : "Protected by 2-factor OTP verification for authorized Super Admin mobile numbers only."}
        </p>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-5">
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-950/70 border border-rose-600/40 rounded-2xl text-rose-300 text-xs font-semibold flex items-start gap-2.5 shadow-inner animate-[shake_0.4s_ease-in-out]">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span>{errorMsg}</span>
              {attemptsRemaining !== null && attemptsRemaining < 5 && attemptsRemaining > 0 && (
                <p className="text-[11px] text-amber-300 font-normal">
                  {lang === "ta"
                    ? `மீதமுள்ள முயற்சிகள்: ${attemptsRemaining} / 5`
                    : `Remaining attempts: ${attemptsRemaining} / 5`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info Alert */}
        {infoMsg && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-start gap-2.5 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Free Local Push OTP Demo Badge */}
        {debugOtpCode && step === "otp" && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-extrabold text-amber-400 block tracking-wider">
                  {lang === "ta" ? "இலவச நேரடி ஓடிபி அறிவிப்பு" : "INSTANT SECURE OTP NOTIFICATION"}
                </span>
                <span className="text-stone-300 text-[11px]">
                  {lang === "ta" ? "சூப்பர் அட்மின் குறியீடு:" : "Super Admin Code:"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const digits = debugOtpCode.split("");
                setOtpDigits(digits);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl font-mono text-sm tracking-widest transition-all cursor-pointer shadow flex items-center gap-1"
              title="1-Click Fill OTP"
            >
              <span>{debugOtpCode}</span>
              <Check className="w-3.5 h-3.5 text-stone-950 ml-1" />
            </button>
          </div>
        )}

        {/* STEP 1: PHONE NUMBER SELECTION */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-amber-400 tracking-wider mb-1.5 flex items-center justify-between">
                <span>{lang === "ta" ? "அங்கீகரிக்கப்பட்ட கைபேசி எண் *" : "Authorized Super Admin Mobile *"}</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  {lang === "ta" ? "10 இலக்க எண்" : "10 Digits"}
                </span>
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 text-xs font-bold font-mono">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="9443254321"
                  disabled={isLoading || isLockedOut}
                  className="w-full pl-12 pr-4 py-3 bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-2xl text-white font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
                  required
                />
              </div>

              {/* Authorized list hint */}
              <div className="mt-2.5 p-2.5 bg-stone-950/80 rounded-xl border border-stone-800 flex items-start gap-2 text-[11px] text-stone-400">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-stone-300">
                    {lang === "ta" ? "அங்கீகரிக்கப்பட்ட எண்கள்:" : "Authorized Super Admin Numbers:"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setPhoneInput("9443254321")}
                      className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded text-[10px] font-mono cursor-pointer transition-colors"
                    >
                      94432 54321 (Xavier Babu)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneInput("7010131915")}
                      className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded text-[10px] font-mono cursor-pointer transition-colors"
                    >
                      70101 31915 (HQ Admin)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLockedOut || phoneInput.length < 10}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                  <span>{lang === "ta" ? "ஓடிபி அனுப்புகிறது..." : "Dispatching OTP..."}</span>
                </>
              ) : (
                <>
                  <span>{lang === "ta" ? "பாதுகாப்பான ஓடிபி பெறுக" : "Generate Secure Super Admin OTP"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-left">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider">
                  {lang === "ta" ? "6 இலக்க ஓடிபி எண் *" : "Enter 6-Digit OTP *"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setErrorMsg("");
                    setInfoMsg("");
                  }}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>{lang === "ta" ? "எண் மாற்ற" : "Change Mobile"}</span>
                </button>
              </div>

              {/* 6 Segmented Input Boxes */}
              <div className="grid grid-cols-6 gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={`otp_box_${idx}`}
                    ref={(el) => { digitRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    disabled={isLoading || isLockedOut}
                    className={`h-13 text-center text-xl font-mono font-black rounded-2xl bg-stone-950 border transition-all focus:outline-none ${
                      digit
                        ? "border-amber-400 text-amber-300 shadow-md shadow-amber-500/10"
                        : "border-stone-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    }`}
                  />
                ))}
              </div>

              {/* Timer Bar */}
              <div className="flex items-center justify-between text-xs text-stone-400 mt-3 pt-1 border-t border-stone-800">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>
                    {lang === "ta" ? "காலாவதி நேரம்:" : "Expires in:"}{" "}
                    <strong className={expiryCountdown < 60 ? "text-rose-400 font-mono" : "text-amber-400 font-mono"}>
                      {formatTime(expiryCountdown)}
                    </strong>
                  </span>
                </div>

                <div>
                  {resendCountdown > 0 ? (
                    <span className="text-[11px] text-stone-500 font-mono">
                      {lang === "ta" ? `மீண்டும் அனுப்ப ${resendCountdown}s` : `Resend in ${resendCountdown}s`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isLoading || isLockedOut}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{lang === "ta" ? "மீண்டும் அனுப்புக" : "Resend OTP"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLockedOut || otpDigits.join("").length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                  <span>{lang === "ta" ? "சரிபார்க்கிறது..." : "Verifying Authorization..."}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>{lang === "ta" ? "சரிபார்த்து உள்நுழைக" : "Verify & Authorize Super Admin"}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Cancel / Return Button */}
        {onCancel && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-stone-400 hover:text-stone-200 font-semibold hover:underline cursor-pointer transition-colors"
            >
              {lang === "ta" ? "← முகப்பு பக்கத்திற்கு திரும்புக" : "← Return to Home Portal"}
            </button>
          </div>
        )}
      </div>

      {/* Security Footer Notice */}
      <div className="p-3 bg-stone-950/90 border-t border-stone-800 text-[10px] text-stone-500 text-center flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>
          {lang === "ta"
            ? "100% இலவச மற்றும் அதிநவீன கிரிப்டோகிராஃபிக் ஓடிபி பாதுகாப்பு அமைப்பு"
            : "Zero-Cost Cryptographic HMAC-SHA256 Super Admin Security"}
        </span>
      </div>
    </div>
  );
}
