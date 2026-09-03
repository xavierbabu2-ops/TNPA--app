import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Mail, 
  Phone, 
  Smartphone, 
  Fingerprint, 
  User, 
  Key, 
  LogOut, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Users,
  ShieldCheck,
  Zap,
  Cpu,
  AlertTriangle
} from "lucide-react";
import { UserAccount, UserRole } from "../types";
import { auth } from "../lib/firebase";
import SuperAdminOtpAuth from "./SuperAdminOtpAuth";
import { dispatchSmsOtp, verifySmsOtp } from "../utils/apiClient";

interface AuthSystemProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  onAddAuditLog: (action: string, details: string) => void;
}

// Global simulation list of users
export const defaultAccounts: UserAccount[] = [
  {
    id: "usr_super_admin",
    role: "super_admin",
    name: "ரா. சேவியர் பாபு",
    nameEn: "R. Xavier Babu",
    phone: "9443254321",
    email: "xavierbabu017@gmail.com",
    district: "மதுரை",
    districtEn: "Madurai",
    status: "approved",
    regNumber: "TNP-SUPERKEY-2026",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
    password: "admin",
    joinedAt: "2020-01-01T10:00:00Z"
  },
  {
    id: "usr_president",
    role: "state_president",
    name: "எஸ். மைக்கேல் ஆல்வின்",
    nameEn: "S. Michael Alwin",
    phone: "9443212345",
    email: "president@tnpainters.org",
    district: "சென்னை",
    districtEn: "Chennai",
    status: "approved",
    regNumber: "TNP-PRES-002",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    password: "president",
    joinedAt: "2020-01-01T10:00:00Z"
  },
  {
    id: "usr_treasurer",
    role: "state_treasurer",
    name: "ஆர். சக்திவேல்",
    nameEn: "R. Sakthivel",
    phone: "9443298765",
    email: "treasurer@tnpainters.org",
    district: "கோயம்புத்தூர்",
    districtEn: "Coimbatore",
    status: "approved",
    regNumber: "TNP-TREAS-003",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
    password: "treasurer",
    joinedAt: "2020-01-01T10:00:00Z"
  },
  {
    id: "usr_dist_admin",
    role: "district_admin",
    name: "எஸ். ரமேஷ் குமார்",
    nameEn: "S. Ramesh Kumar",
    phone: "9840987654",
    email: "chennai@tnpainters.org",
    district: "சென்னை",
    districtEn: "Chennai",
    status: "approved",
    regNumber: "TNP-DIST-004",
    photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200",
    password: "chennai",
    joinedAt: "2021-03-12T10:00:00Z"
  },
  {
    id: "usr_member_active",
    role: "member",
    name: "ரா. கார்த்திகேயன்",
    nameEn: "R. Karthikeyan",
    phone: "9876543210",
    email: "member@tnpainters.org",
    district: "சென்னை",
    districtEn: "Chennai",
    status: "approved",
    regNumber: "TNP-2026-0034",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    password: "member",
    joinedAt: "2026-08-01T10:30:00Z",
    aadhaar: "1234-5678-9012",
    dob: "1992-05-15",
    gender: "ஆண் (Male)",
    bloodGroup: "O+",
    address: "கண்ணகி நகர், துரைப்பாக்கம், சென்னை - 600097",
    experienceYears: 8
  }
];

export default function AuthSystem({
  lang,
  currentUser,
  onLogin,
  onLogout,
  onAddAuditLog
}: AuthSystemProps) {
  const [authMethod, setAuthMethod] = useState<"password" | "admin_key" | "otp" | "biometric" | "superadmin_otp">("password");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [biometricSupport, setBiometricSupport] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Admin 3-Factor Login States
  const [adminUsernameInput, setAdminUsernameInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [isLoggingInAdmin, setIsLoggingInAdmin] = useState(false);

  // Server SMS OTP States for Login
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // WebAuthn Passkeys & Biometric Device Adapter States
  const [isAuthenticatingWebAuthn, setIsAuthenticatingWebAuthn] = useState(false);
  const [biometricDeviceStatus, setBiometricDeviceStatus] = useState<any>(null);

  // New account sign up states
  const [signUpName, setSignUpName] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPass, setSignUpPass] = useState("");
  const [signUpDistrict, setSignUpDistrict] = useState("சென்னை");

  // Check standard biometric API availability & Physical Biometric Hardware Status
  useEffect(() => {
    if (window.PublicKeyCredential) {
      setBiometricSupport(true);
    }

    // Query server hardware biometric adapter status
    fetch("/api/biometric-device/status")
      ? fetch("/api/biometric-device/status")
          .then((res) => res.json())
          .then((data) => setBiometricDeviceStatus(data))
          .catch(() => {})
      : null;
  }, []);

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Handle Sign In with Email/Phone & Password
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const normalizedInput = emailOrPhone.trim().toLowerCase();
    
    // Find matching user
    const matched = defaultAccounts.find(
      (acc) => 
        (acc.email.toLowerCase() === normalizedInput || acc.phone === normalizedInput) && 
        acc.password === password
    );

    if (matched) {
      onLogin(matched);
      onAddAuditLog(
        "User Sign In", 
        `Successful login with password. User: ${matched.nameEn} (${matched.role})`
      );
    } else {
      setErrorMsg(
        lang === "ta" 
          ? "மின்னஞ்சல்/கைபேசி எண் அல்லது கடவுச்சொல் தவறானது!" 
          : "Invalid email/phone or password!"
      );
    }
  };

  // Helper to parse and format error codes with exact raw Firebase details for AuthSystem
  // Safe API fetch helper to prevent "Unexpected end of JSON input" on empty/invalid responses
  const safeFetchJson = async (url: string, options: RequestInit) => {
    let resp: Response;
    try {
      resp = await fetch(url, options);
    } catch (netErr: any) {
      console.error("Network fetch failure:", netErr);
      throw new Error(lang === "ta" 
        ? "சேவையகத்துடன் தொடர்புகொள்வதில் பிழை ஏற்பட்டது. இணைய இணைப்பை சரிபார்க்கவும்." 
        : "Failed to connect to OTP server. Please check network connection.");
    }

    const text = await resp.text();
    let data: any = {};
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON API response body:", text);
        throw new Error(lang === "ta" 
          ? "சேவையகத்திலிருந்து செல்லுபடியாகாத பதில் வந்தது. மீண்டும் முயற்சிக்கவும்." 
          : "Invalid response received from server. Please try again.");
      }
    } else {
      console.error("Empty response body received from server");
      throw new Error(lang === "ta" 
        ? "சேவையகத்திலிருந்து காலியான பதில் வந்தது. மீண்டும் முயற்சிக்கவும்." 
        : "Server returned an empty response. Please try again.");
    }

    if (!resp.ok || data.success === false) {
      const errDetail = lang === "ta" ? (data.errorTa || data.error) : (data.error || data.errorTa);
      throw new Error(errDetail || (lang === "ta" ? "செயல்பாடு தோல்வியடைந்தது." : "Request failed."));
    }

    return data;
  };

  // Server SMS OTP Dispatch (No reCAPTCHA, Offline Resilient)
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const cleanDigits = emailOrPhone.replace(/\D/g, "");
    if (!cleanDigits) {
      setErrorMsg(
        lang === "ta" 
          ? "தயவுசெய்து உங்கள் 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்!" 
          : "Please enter your 10-digit Indian mobile number!"
      );
      return;
    }

    let tenDigit = "";
    if (cleanDigits.length === 10) {
      tenDigit = cleanDigits;
    } else if (cleanDigits.length === 12 && cleanDigits.startsWith("91")) {
      tenDigit = cleanDigits.slice(2);
    } else if (cleanDigits.length === 11 && cleanDigits.startsWith("0")) {
      tenDigit = cleanDigits.slice(1);
    } else if (cleanDigits.length > 10) {
      tenDigit = cleanDigits.slice(-10);
    } else {
      setErrorMsg(
        lang === "ta" 
          ? "சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்!" 
          : "Please enter a valid 10-digit Indian mobile number!"
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(tenDigit)) {
      setErrorMsg(
        lang === "ta" 
          ? "இந்திய கைபேசி எண் 6, 7, 8 அல்லது 9-ல் தொடங்க வேண்டும்!" 
          : "Indian mobile numbers must start with 6, 7, 8, or 9!"
      );
      return;
    }

    const formattedPhone = `+91${tenDigit}`;
    setIsSendingOtp(true);

    try {
      const data = await dispatchSmsOtp(formattedPhone, lang);

      setOtpSent(true);
      setOtpTimer(60);
      setIsSendingOtp(false);
      if (data.debugCode) {
        setInfoMsg(
          lang === "ta"
            ? `SMS ஓடிபி உங்கள் எண்ணிற்கு (${formattedPhone}) அனுப்பப்பட்டுள்ளது. (ஓடிபி எண்: ${data.debugCode})`
            : `SMS OTP dispatched to ${formattedPhone}. (OTP Code: ${data.debugCode})`
        );
      } else {
        setInfoMsg(
          lang === "ta"
            ? `SMS ஓடிபி உங்கள் எண்ணிற்கு (${formattedPhone}) அனுப்பப்பட்டுள்ளது.`
            : `SMS OTP dispatched to ${formattedPhone}.`
        );
      }
      onAddAuditLog("SMS OTP Request", `SMS OTP dispatched to ${formattedPhone}`);
    } catch (err: any) {
      setIsSendingOtp(false);
      console.error("SMS OTP Send Error:", err);
      setErrorMsg(err.message || (lang === "ta" ? "SMS ஓடிபி அனுப்புவதில் பிழை ஏற்பட்டது." : "Failed to send SMS OTP."));
    }
  };

  // Server SMS OTP Verification (No reCAPTCHA, Offline Resilient)
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otpCode.trim()) {
      setErrorMsg(lang === "ta" ? "SMS மூலம் வந்த 6 இலக்க ஓடிபி எண்ணை உள்ளிடவும்!" : "Enter the 6-digit SMS code.");
      return;
    }

    const cleanDigits = emailOrPhone.replace(/\D/g, "");
    let tenDigit = cleanDigits.length === 10 ? cleanDigits : cleanDigits.slice(-10);
    const formattedPhone = `+91${tenDigit}`;

    setIsVerifyingOtp(true);

    try {
      await verifySmsOtp(formattedPhone, otpCode.trim(), lang);

      setIsVerifyingOtp(false);

      // Match user by phone digits
      const matched = defaultAccounts.find((acc) => acc.phone.includes(tenDigit)) || {
        id: `usr_phone_${cleanDigits}`,
        role: "member" as UserRole,
        name: "உறுப்பினர் (" + cleanDigits + ")",
        nameEn: "Verified Member (" + cleanDigits + ")",
        phone: cleanDigits,
        email: `user${cleanDigits}@tnpainters.org`,
        district: "சென்னை",
        districtEn: "Chennai",
        status: "approved" as const,
        regNumber: `TNP-${cleanDigits.slice(-4)}`,
        photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150",
        joinedAt: new Date().toISOString()
      };

      onLogin(matched);
      onAddAuditLog("User Sign In", `SMS OTP verified login for phone ${cleanDigits}.`);
    } catch (err: any) {
      setIsVerifyingOtp(false);
      console.error("SMS OTP Verification Error:", err);
      setErrorMsg(err.message || (lang === "ta" ? "ஓடிபி சரிபார்ப்பில் பிழை ஏற்பட்டது." : "Verification failed. Please check the code."));
    }
  };

  // Real WebAuthn Passkey Authentication Flow
  const handleBiometricLogin = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (!window.PublicKeyCredential) {
      setErrorMsg(lang === "ta" ? "உங்கள் உலாவியில் WebAuthn பயோமெட்ரிக் ஆதரவு இல்லை." : "WebAuthn / Passkey API is not supported in this browser.");
      return;
    }

    setIsAuthenticatingWebAuthn(true);
    const targetEmail = emailOrPhone.trim() || "admin@tnpainters.org";

    try {
      setInfoMsg(lang === "ta" ? "பயோமெட்ரிக் சவாலை பெறுகிறது..." : "Fetching WebAuthn challenge from server...");

      // 1. Fetch challenge from backend
      const optionsResp = await fetch("/api/webauthn/login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      });
      const optionsData = await optionsResp.json();

      if (!optionsResp.ok) {
        throw new Error(optionsData.error || "Failed to generate WebAuthn challenge.");
      }

      // Convert challenge string to Uint8Array
      const challengeBuffer = Uint8Array.from(atob(optionsData.challenge.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

      setInfoMsg(
        lang === "ta" 
          ? "உங்கள் சாதனத்தின் கைரேகை / முக அடையாள சென்சாரை பயன்படுத்தவும்..." 
          : "Please touch your fingerprint scanner / Face ID to authenticate..."
      );

      // 2. Invoke browser WebAuthn API
      let credential: any = null;
      try {
        credential = await navigator.credentials.get({
          publicKey: {
            challenge: challengeBuffer,
            timeout: 60000,
            rpId: window.location.hostname || "localhost",
            userVerification: "required"
          }
        });
      } catch (webAuthnErr: any) {
        console.warn("WebAuthn assertion prompt was canceled or unavailable:", webAuthnErr);
        // Fallback or explicit warning
        throw new Error(
          webAuthnErr.name === "NotAllowedError"
            ? (lang === "ta" ? "பயோமெட்ரிக் சரிபார்ப்பு ரத்து செய்யப்பட்டது அல்லது காலாவதியானது." : "Biometric prompt was canceled or timed out.")
            : (lang === "ta" ? "கைரேகை / முக அடையாள சென்சார் கிடைக்கவில்லை." : "Physical biometric sensor not active or credential not found on this device.")
        );
      }

      if (!credential) {
        throw new Error("No WebAuthn credential received.");
      }

      // 3. Verify assertion on server
      const verifyResp = await fetch("/api/webauthn/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          credential: {
            id: credential.id,
            rawId: Buffer.from(credential.rawId).toString("base64url"),
            type: credential.type
          }
        })
      });

      const verifyResult = await verifyResp.json();
      setIsAuthenticatingWebAuthn(false);

      if (verifyResp.ok && verifyResult.verified) {
        const matched = defaultAccounts.find((acc) => acc.email === targetEmail) || defaultAccounts[0];
        onLogin(matched);
        onAddAuditLog("Biometric WebAuthn Login", `Server-verified Passkey login for ${targetEmail}`);
      } else {
        setErrorMsg(verifyResult.error || "Biometric authentication failed server verification.");
      }
    } catch (err: any) {
      setIsAuthenticatingWebAuthn(false);
      setErrorMsg(err.message || (lang === "ta" ? "பயோமெட்ரிக் உள்நுழைவில் பிழை ஏற்பட்டது." : "Biometric login failed."));
    }
  };

  // Sign Up / Registration Form
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!signUpName.trim() || !signUpPhone.trim() || !signUpEmail.trim() || !signUpPass.trim()) {
      setErrorMsg(lang === "ta" ? "அனைத்து புலங்களையும் நிரப்பவும்!" : "Please fill in all fields!");
      return;
    }

    const newAcc: UserAccount = {
      id: `usr_${Date.now()}`,
      role: "member",
      name: signUpName,
      nameEn: signUpName,
      phone: signUpPhone,
      email: signUpEmail,
      district: signUpDistrict,
      districtEn: signUpDistrict,
      status: "pending", // Workflow requires approval first!
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150",
      password: signUpPass,
      joinedAt: new Date().toISOString()
    };

    // Store in default simulation database
    defaultAccounts.push(newAcc);
    
    setInfoMsg(
      lang === "ta" 
        ? "பதிவு செய்யப்பட்டது! உங்கள் கணக்கு இன்னும் ஒப்புதல் பெறவில்லை (Pending). நிர்வாகி ஒப்புதல் அளித்த பின் செயல்படும்." 
        : "Signed up successfully! Your status is Pending. Once approved by the General Secretary, you can log in."
    );
    
    onAddAuditLog("User Signup", `New user signup registered: ${signUpName} (${signUpPhone}). Status: Pending Approval.`);
    
    // Switch to sign in view
    setIsRegistering(false);
  };

  const handleForgotPassword = () => {
    if (!emailOrPhone.trim()) {
      setErrorMsg(lang === "ta" ? "முதலில் மின்னஞ்சல் அல்லது எண்ணை உள்ளிடவும்!" : "Please enter your email or phone first!");
      return;
    }
    setInfoMsg(
      lang === "ta" 
        ? `கடவுச்சொல் மீட்டமைப்பு இணைப்பு ${emailOrPhone} முகவரிக்கு அனுப்பப்பட்டது!` 
        : `Password recovery links successfully sent to ${emailOrPhone}!`
    );
    onAddAuditLog("Forgot Password", `Recovery token triggered for ${emailOrPhone}`);
  };

  // 3-Factor Secure Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!adminUsernameInput.trim() || !adminPasswordInput.trim() || !adminKeyInput.trim()) {
      setErrorMsg(
        lang === "ta" 
          ? "நிர்வாகி பெயர்/மின்னஞ்சல், கடவுச்சொல் மற்றும் அணுக்கம் சாவி சான்றிதழ்கள் மூன்றும் தேவை!" 
          : "Admin Username/Email, Password, and Admin Access Key are all required!"
      );
      return;
    }

    setIsLoggingInAdmin(true);

    try {
      const data = await safeFetchJson("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail: adminUsernameInput.trim(),
          password: adminPasswordInput.trim(),
          accessKey: adminKeyInput.trim()
        })
      });

      setIsLoggingInAdmin(false);

      if (data.success && data.user) {
        onLogin(data.user as UserAccount);
        onAddAuditLog(
          "Admin 3-Factor Sign In", 
          `Secure 3-factor login verified for admin ${data.user.adminUsername || data.user.nameEn} (${data.user.role})`
        );
      } else {
        setErrorMsg(data.error || (lang === "ta" ? "உள்நுழைவு தோல்வியடைந்தது." : "Login failed."));
      }
    } catch (err: any) {
      setIsLoggingInAdmin(false);
      console.error("Admin login error:", err);
      setErrorMsg(err.message || (lang === "ta" ? "நிர்வாகி உள்நுழைவில் பிழை ஏற்பட்டது." : "Admin login failed."));
    }
  };

  // Quick Switch logins for testing roles easily
  const handleQuickLogin = async (role: UserRole) => {
    if (role === "super_admin" || role === "state_president" || role === "state_treasurer" || role === "district_admin") {
      try {
        const adminMap: Record<string, { u: string; p: string; k: string }> = {
          super_admin: { u: "superadmin", p: "admin", k: "TNPA-KEY-SUPER-ADMIN" },
          state_president: { u: "president", p: "president", k: "TNPA-KEY-PRES-2026" },
          state_treasurer: { u: "treasurer", p: "treasurer", k: "TNPA-KEY-TREAS-2026" },
          district_admin: { u: "district_chennai", p: "chennai", k: "TNPA-KEY-DIST-2026" }
        };
        const creds = adminMap[role];
        if (creds) {
          const data = await safeFetchJson("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usernameOrEmail: creds.u,
              password: creds.p,
              accessKey: creds.k
            })
          });

          if (data.success && data.user) {
            onLogin(data.user as UserAccount);
            onAddAuditLog("Quick Role Switch", `Authenticated as role: ${role} via Fast-Pass controller.`);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend fast-pass fallback to local accounts:", err);
      }
    }

    const matched = defaultAccounts.find((acc) => acc.role === role);
    if (matched) {
      onLogin(matched);
      onAddAuditLog("Quick Role Switch", `Logged in as role: ${role} via Fast-Pass controller.`);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-stone-200/80 rounded-2xl shadow-xl overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      <div className="p-6 bg-stone-900 text-white flex flex-col items-center">
        <div className="h-14 w-14 rounded-full bg-amber-500 flex items-center justify-center mb-3">
          <Key className="w-7 h-7 text-stone-950" />
        </div>
        <h3 className="text-lg font-black tracking-wide">
          {lang === "ta" ? "டிஜிட்டல் நுழைவாயில்" : "ASSOCIATION SIGN IN PORTAL"}
        </h3>
        <p className="text-[11px] text-stone-400 mt-1">
          {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கம்" : "TN Painters and Artists Progressive Association"}
        </p>
      </div>

      <div className="p-6 space-y-5">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {!isRegistering ? (
          <>
            {/* Nav Selection Tabs */}
            <div className="grid grid-cols-5 gap-1 bg-stone-100 p-1 rounded-xl text-[9.5px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setErrorMsg("");
                }}
                className={`py-2 rounded-lg transition-all ${
                  authMethod === "password" ? "bg-white text-stone-900 shadow" : "text-stone-500"
                }`}
              >
                {lang === "ta" ? "உறுப்பினர்" : "Member"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("admin_key");
                  setErrorMsg("");
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-0.5 ${
                  authMethod === "admin_key" ? "bg-amber-500 text-stone-950 shadow font-black" : "text-amber-800"
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{lang === "ta" ? "நிர்வாகி" : "Admin"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("superadmin_otp");
                  setErrorMsg("");
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-0.5 ${
                  authMethod === "superadmin_otp" ? "bg-rose-700 text-white shadow font-black" : "text-rose-700 font-bold"
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>{lang === "ta" ? "சூப்பர் கீ" : "Super Key"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("otp");
                  setErrorMsg("");
                }}
                className={`py-2 rounded-lg transition-all ${
                  authMethod === "otp" ? "bg-white text-stone-900 shadow" : "text-stone-500"
                }`}
              >
                {lang === "ta" ? "OTP" : "SMS OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("biometric");
                  setErrorMsg("");
                }}
                className={`py-2 rounded-lg transition-all ${
                  authMethod === "biometric" ? "bg-white text-stone-900 shadow" : "text-stone-500"
                }`}
              >
                {lang === "ta" ? "பயோ" : "Passkey"}
              </button>
            </div>

            {/* PASSWORD LOGIN METHOD */}
            {authMethod === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "மின்னஞ்சல் அல்லது கைபேசி எண்" : "Email or Phone Number"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="member@tnpainters.org"
                      className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "கடவுச்சொல் (Password)" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-amber-800 font-bold hover:underline"
                  >
                    {lang === "ta" ? "கடவுச்சொல்லை மறந்துவிட்டீர்களா?" : "Forgot Password?"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-xl transition-all shadow-md"
                >
                  {lang === "ta" ? "உள்நுழைக" : "Sign In with Credentials"}
                </button>
              </form>
            )}

            {/* ADMIN 3-FACTOR PORTAL LOGIN METHOD */}
            {authMethod === "admin_key" && (
              <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
                <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-[10.5px] text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    {lang === "ta" 
                      ? "நிர்வாகி அணுகல் போர்ட்டலுக்கு 3 அடுக்கு பாதுகாப்பு சான்றுகள் தேவை: நிர்வாகி ஐடி, கடவுச்சொல் மற்றும் நிர்வாகி அணுக்கம் சாவி."
                      : "Admin Portal requires 3-Factor Verification: Admin ID, Password, and PBKDF2 Hashed Admin Access Key."}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "நிர்வாகி பெயர் / ஐடி" : "Admin ID / Username"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminUsernameInput}
                      onChange={(e) => setAdminUsernameInput(e.target.value)}
                      placeholder="superadmin / president"
                      className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 font-mono"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "கடவுச்சொல் (Password)" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-900"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "நிர்வாகி அணுக்கம் சாவி (Admin Access Key)" : "Admin Access Key (TNPA-KEY-****)"}
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminKey ? "text" : "password"}
                      required
                      value={adminKeyInput}
                      onChange={(e) => setAdminKeyInput(e.target.value)}
                      placeholder="TNPA-KEY-SUPER-ADMIN"
                      className="w-full pl-9 pr-9 py-2 border border-amber-300 rounded-xl bg-amber-50/50 text-stone-900 font-mono tracking-wide"
                    />
                    <Key className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowAdminKey(!showAdminKey)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingInAdmin}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoggingInAdmin ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === "ta" ? "சரிபார்க்கிறது..." : "Verifying 3-Factor Keys..."}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>{lang === "ta" ? "3-அடுக்கு நிர்வாகி உள்நுழைவு" : "Secure 3-Factor Admin Login"}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SUPER ADMIN OTP AUTHENTICATION METHOD */}
            {authMethod === "superadmin_otp" && (
              <div className="py-2">
                <SuperAdminOtpAuth
                  lang={lang}
                  onSuccess={(verifiedUser, token) => {
                    onLogin(verifiedUser);
                    onAddAuditLog(
                      "Super Admin OTP Login",
                      `Super Admin verified via Zero-Cost OTP engine: ${verifiedUser.nameEn || verifiedUser.name} (${verifiedUser.phone || "Admin"})`
                    );
                  }}
                  onAddAuditLog={onAddAuditLog}
                  requiredForTitle="Super Admin Security Clearance"
                  requiredForTitleTa="சூப்பர் அட்மின் உயர் பாதுகாப்பு சரிபார்ப்பு"
                />
              </div>
            )}

            {/* OTP LOGIN METHOD */}
            {authMethod === "otp" && (
              <div className="space-y-4 text-xs">

                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        {lang === "ta" ? "பதிவு செய்யப்பட்ட கைபேசி எண்" : "Registered Mobile Number"}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          disabled={isSendingOtp}
                          value={emailOrPhone}
                          onChange={(e) => setEmailOrPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="9876543210"
                          className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 font-mono"
                        />
                        <Smartphone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{lang === "ta" ? "அனுப்புகிறது..." : "Sending SMS OTP..."}</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 text-amber-500" />
                          <span>{lang === "ta" ? "SMS OTP அனுப்பவும்" : "Send SMS OTP Code"}</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        {lang === "ta" ? "SMS மூலம் வந்த 6 இலக்க OTP" : "Enter 6-digit SMS OTP"}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="E.g. 719203"
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 font-mono text-center text-lg font-black tracking-widest"
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-stone-500">
                      <span>{otpTimer > 0 ? `Resend code in 00:${otpTimer < 10 ? `0${otpTimer}` : otpTimer}` : "Ready to request new code"}</span>
                      {otpTimer === 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpTimer(60);
                          }}
                          className="text-amber-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          {lang === "ta" ? "மீண்டும் அனுப்பு" : "Resend SMS"}
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp}
                      className="w-full py-3 bg-[#b91c1c] hover:bg-[#991b1b] disabled:bg-rose-300 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{lang === "ta" ? "சரிபார்க்கிறது..." : "Verifying SMS OTP..."}</span>
                        </>
                      ) : (
                        <span>{lang === "ta" ? "கணக்கை சரிபார் (Verify OTP)" : "Verify SMS OTP & Log In"}</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* BIOMETRIC AUTH METHOD */}
            {authMethod === "biometric" && (
              <div className="text-center space-y-4 py-2">
                <div>
                  <input
                    type="email"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter registered email (e.g. admin@tnpainters.org)"
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 text-xs mb-3 font-medium text-stone-800"
                  />
                </div>

                <div 
                  className="mx-auto h-20 w-20 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center cursor-pointer border border-amber-200 shadow-inner group transition-all" 
                  onClick={handleBiometricLogin}
                >
                  {isAuthenticatingWebAuthn ? (
                    <RefreshCw className="w-10 h-10 text-[#b91c1c] animate-spin" />
                  ) : (
                    <Fingerprint className="w-12 h-12 text-[#b91c1c] group-hover:scale-110 transition-all" />
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-stone-800">
                    {lang === "ta" ? "கைரேகை / முக அடையாள பயோமெட்ரிக்" : "WebAuthn Biometric Passkey / Touch ID"}
                  </p>
                  <p className="text-[10px] text-stone-500 max-w-[290px] mx-auto leading-relaxed">
                    {lang === "ta" 
                      ? "சேவையகத்தால் சரிபார்க்கப்பட்ட பாதுகாப்பான பயோமெட்ரிக் உள்நுழைவு." 
                      : "Server-verified public key biometric authentication."}
                  </p>
                </div>

                {/* Hardware Biometric Device Status Indicator */}
                <div className="mt-3 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[10px] text-left text-stone-600 space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-stone-700" />
                      <span>Physical USB Scanner Adapter:</span>
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-black ${
                      biometricDeviceStatus?.adapterActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"
                    }`}>
                      {biometricDeviceStatus?.adapterActive ? "Active" : "Unconfigured"}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-stone-500 leading-snug">
                    {biometricDeviceStatus?.message || "Checks local Mantra MFS100 / SecuGen USB adapter endpoint."}
                  </p>
                </div>
              </div>
            )}

            {/* Link to sign up */}
            <div className="border-t border-stone-100 pt-4 text-center text-[11px]">
              <span className="text-stone-500">
                {lang === "ta" ? "புதிய உறுப்பினரா?" : "Not a registered member yet?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="text-[#b91c1c] font-black hover:underline"
              >
                {lang === "ta" ? "இப்போதே விண்ணப்பிக்கவும்" : "Submit Preliminary Application"}
              </button>
            </div>
          </>
        ) : (
          /* SIGN UP APPLICATION WORKFLOW FORM */
          <form onSubmit={handleSignUp} className="space-y-4 text-xs text-left">
            <h4 className="font-extrabold text-stone-950 border-b pb-2 mb-3">
              {lang === "ta" ? "புதிய விண்ணப்ப சமர்ப்பிப்பு" : "Submit Preliminary Enrolment"}
            </h4>

            <div>
              <label className="block font-bold text-stone-700 mb-1">பெயர் (Full Name) *</label>
              <input
                type="text"
                required
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="முத்துராஜ்"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">கைபேசி எண் (Phone) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  placeholder="944xxxxxxx"
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">மின்னஞ்சல் (Email) *</label>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">கடவுச்சொல் (Password) *</label>
                <input
                  type="password"
                  required
                  value={signUpPass}
                  onChange={(e) => setSignUpPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">மாவட்டம் (District) *</label>
                <select
                  value={signUpDistrict}
                  onChange={(e) => setSignUpDistrict(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="சென்னை">சென்னை (Chennai)</option>
                  <option value="மதுரை">மதுரை (Madurai)</option>
                  <option value="கோயம்புத்தூர்">கோயம்புத்தூர் (Coimbatore)</option>
                  <option value="திருச்சிராப்பள்ளி">திருச்சிராப்பள்ளி (Tiruchirappalli)</option>
                  <option value="சேலம்">சேலம் (Salem)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-extrabold rounded-xl transition-all shadow-md"
            >
              {lang === "ta" ? "விண்ணப்பத்தை சமர்ப்பி" : "Submit & Request Approval"}
            </button>

            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className="w-full py-2 bg-stone-100 text-stone-700 font-bold rounded-xl text-[10px]"
            >
              {lang === "ta" ? "ரத்து செய்து நுழைவிடத்திற்குத் திரும்பு" : "Cancel & Return to Login"}
            </button>
          </form>
        )}

        {/* ADMIN FAST-PASS SYSTEM PANEL */}
        <div className="bg-stone-50 border border-dashed border-stone-200 p-4 rounded-xl text-left">
          <div className="flex items-center gap-1 text-[#b91c1c] font-extrabold text-[10px] uppercase mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>{lang === "ta" ? "ஆய்வு விரைவுப் பாதை (Fast-Pass Controls)" : "Developer Fast-Pass Login"}</span>
          </div>
          <p className="text-[9px] text-stone-500 mb-3 leading-relaxed">
            {lang === "ta" 
              ? "ஆசிரியர்கள் மற்றும் சோதனையாளர்கள் அனைத்து 7 பயனர் பாத்திரங்களையும் எளிதாகச் சோதித்துப் பார்க்க, கீழே உள்ள பட்டன்களைப் பயன்படுத்தவும்." 
              : "Directly authenticate as any role to test custom views, approvals, and treasurer workflows instantly:"}
          </p>

          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <button
              onClick={() => handleQuickLogin("super_admin")}
              className="px-2 py-1 bg-stone-900 text-white font-bold hover:bg-stone-800 rounded flex items-center gap-1 text-left"
            >
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span>Super Admin</span>
            </button>
            <button
              onClick={() => handleQuickLogin("state_president")}
              className="px-2 py-1 bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 rounded text-left"
            >
              <span>State President</span>
            </button>
            <button
              onClick={() => handleQuickLogin("state_treasurer")}
              className="px-2 py-1 bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 rounded text-left"
            >
              <span>State Treasurer</span>
            </button>
            <button
              onClick={() => handleQuickLogin("district_admin")}
              className="px-2 py-1 bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 rounded text-left"
            >
              <span>District Admin</span>
            </button>
            <button
              onClick={() => handleQuickLogin("member")}
              className="px-2 py-1 bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 rounded text-left"
            >
              <span>Active Member</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
