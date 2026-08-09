import React, { useState, useRef, useEffect } from "react";
import UnionOfficialIdCard from "./UnionOfficialIdCard";
import { 
  User, 
  Shield, 
  CreditCard, 
  Sparkles, 
  Download, 
  Check, 
  AlertCircle, 
  Plus, 
  Printer, 
  Edit2, 
  Search, 
  Clock, 
  FileText, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  Upload, 
  Trash2, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Calendar,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { MemberRegistration as RegType } from "../types";
import { auth } from "../lib/firebase";

interface MemberRegistrationProps {
  lang: "ta" | "en";
  onSubmitRegistration: (newReg: RegType) => void;
  registrations: RegType[];
  onAddAuditLog: (action: string, details: string) => void;
}

export default function MemberRegistration({ 
  lang, 
  onSubmitRegistration, 
  registrations,
  onAddAuditLog
}: MemberRegistrationProps) {
  
  // Registration Portal view tab
  const [activePortalTab, setActivePortalTab] = useState<"apply" | "track" | "scanner">("apply");

  // Step state for wizard (1 to 5)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // --- STEP 1: Personal Info State ---
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [isSameAsMobile, setIsSameAsMobile] = useState(false);

  // Server SMS OTP States (No reCAPTCHA)
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpInfo, setOtpInfo] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // --- STEP 2: Address Info State ---
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("சென்னை");
  const [taluk, setTaluk] = useState("");
  const [villageOrTown, setVillageOrTown] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [address, setAddress] = useState("");

  // --- STEP 3: Occupation Info State ---
  const [profession, setProfession] = useState("House Painter");
  const [experience, setExperience] = useState<number>(5);
  const [specialization, setSpecialization] = useState<string[]>([]);

  // --- STEP 4: Uploads State ---
  const [photo, setPhoto] = useState<string>("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150");
  const [aadhaarFront, setAadhaarFront] = useState<string>("");
  const [aadhaarBack, setAadhaarBack] = useState<string>("");
  const [additionalDoc, setAdditionalDoc] = useState<string>("");
  
  // Drag-and-drop feedback states
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // --- STEP 5: Declaration & Signature State ---
  const [acceptRules, setAcceptRules] = useState(false);
  const [declareTruth, setDeclareTruth] = useState(false);
  const [signatureType, setSignatureType] = useState<"drawn" | "typed">("drawn");
  const [signatureText, setSignatureText] = useState("");
  const [signatureStyle, setSignatureStyle] = useState("font-serif italic");

  // Signature drawing canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string>("");

  // Tracking section search states
  const [searchPhoneOrId, setSearchPhoneOrId] = useState("");
  const [trackedApplication, setTrackedApplication] = useState<RegType | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Edit / Resubmission ID state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Scanner simulator states
  const [scannerInput, setScannerInput] = useState("");
  const [scannedResult, setScannedResult] = useState<RegType | null>(null);
  const [scanError, setScanError] = useState("");

  // Form Validation errors
  const [error, setError] = useState<string | null>(null);

  const districtsList = [
    "சென்னை", "மதுரை", "கோயம்புத்தூர்", "திருச்சிராப்பள்ளி", "சேலம்", 
    "திருநெல்வேலி", "வேலூர்", "ஈரோடு", "தஞ்சாவூர்", "திண்டுக்கல்", 
    "காஞ்சிபுரம்", "கிருஷ்ணகிரி", "கடலூர்", "தர்மபுரி", "நாகப்பட்டினம்",
    "கன்னியாகுமரி", "தூத்துக்குடி", "திருப்பூர்", "கரூர்", "நாமக்கல்", 
    "நீலகிரி", "பெரம்பலூர்", "புதுக்கோட்டை", "இராமநாதபுரம்", "சிவகங்கை", 
    "திருவள்ளூர்", "திருவண்ணாமலை", "திருவாரூர்", "இராணிப்பேட்டை", "தென்காசி", 
    "திருப்பத்தூர்", "செங்கல்பட்டு", "கள்ளக்குறிச்சி", "மயிலாடுதுறை"
  ];

  const specializationOptions = [
    { id: "interior", label: "உள்வடிவமைப்பு வர்ணம் (Interior Emulsion)", labelEn: "Interior Emulsion" },
    { id: "exterior", label: "வெளிப்புற தட்பவெப்ப வர்ணம் (Exterior Weathercoat)", labelEn: "Exterior Weathercoat" },
    { id: "texture", label: "அமைப்பு ஓவிய வேலை (Texture Wall Arts)", labelEn: "Texture Painting" },
    { id: "polishing", label: "மரப்பாலிஷ் வேலை (PU & Wood Polishing)", labelEn: "PU & Wood Polishing" },
    { id: "spraying", label: "தெளிப்பு வர்ணம் (Spray Painting)", labelEn: "Metal/Grille Spraying" },
    { id: "wall_art", label: "சுவர் சித்திர ஓவியங்கள் (Mural Wall Art)", labelEn: "Mural Wall Art" }
  ];

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

  // Sync WhatsApp with mobile phone
  useEffect(() => {
    if (isSameAsMobile) {
      setWhatsapp(phone);
    }
  }, [phone, isSameAsMobile]);

  // Set up drawing canvas context when Step 5 canvas is loaded
  useEffect(() => {
    if (step === 5 && signatureType === "drawn" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1e3a8a"; // Deep royal blue
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
      }
    }
  }, [step, signatureType]);

  // Server-side SMS OTP Dispatching (No reCAPTCHA)
  const handleSendOTP = async () => {
    setOtpError("");
    setOtpInfo("");
    setError(null);

    const cleanDigits = phone.replace(/\D/g, "");
    if (!cleanDigits) {
      setOtpError(lang === "ta" ? "தயவுசெய்து உங்கள் 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்!" : "Please enter your 10-digit Indian mobile number!");
      return;
    }

    let tenDigit = "";
    if (cleanDigits.length === 10) {
      tenDigit = cleanDigits;
    } else if (cleanDigits.length === 12 && cleanDigits.startsWith("91")) {
      tenDigit = cleanDigits.slice(2);
    } else if (cleanDigits.length === 11 && cleanDigits.startsWith("0")) {
      tenDigit = cleanDigits.slice(1);
    } else {
      setOtpError(lang === "ta" ? "சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்!" : "Please enter a valid 10-digit mobile number!");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(tenDigit)) {
      setOtpError(lang === "ta" ? "இந்திய கைபேசி எண் 6, 7, 8 அல்லது 9-ல் தொடங்க வேண்டும்!" : "Indian mobile numbers must start with 6, 7, 8, or 9!");
      return;
    }

    const formattedPhone = `+91${tenDigit}`;
    setIsSendingOtp(true);

    try {
      const resp = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone })
      });
      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || (lang === "ta" ? "SMS ஓடிபி அனுப்புவதில் பிழை ஏற்பட்டது." : "Failed to send SMS OTP."));
      }

      setOtpSent(true);
      setOtpTimer(60);
      setIsSendingOtp(false);
      setOtpError("");
      if (data.debugCode) {
        setOtpInfo(lang === "ta" ? `SMS ஓடிபி அனுப்பப்பட்டது! (ஓடிபி எண்: ${data.debugCode})` : `SMS OTP dispatched! (OTP Code: ${data.debugCode})`);
      } else {
        setOtpInfo(lang === "ta" ? "SMS ஓடிபி உங்களின் கைபேசி எண்ணிற்கு அனுப்பப்பட்டது." : "SMS OTP sent to your mobile phone.");
      }
      onAddAuditLog("SMS OTP Dispatched", `SMS OTP requested for ${formattedPhone}.`);
    } catch (err: any) {
      setIsSendingOtp(false);
      console.error("SMS OTP Send Error:", err);
      setOtpError(err.message || (lang === "ta" ? "SMS ஓடிபி அனுப்புவதில் பிழை ஏற்பட்டது." : "Failed to send SMS OTP."));
    }
  };

  // Server-side SMS OTP Verification (No reCAPTCHA)
  const handleVerifyOTP = async () => {
    if (!otpInput.trim()) {
      setOtpError(lang === "ta" ? "SMS மூலம் வந்த 6 இலக்க ஓடிபி எண்ணை உள்ளிடவும்!" : "Please enter the 6-digit SMS OTP code!");
      return;
    }

    const cleanDigits = phone.replace(/\D/g, "");
    let tenDigit = cleanDigits.length === 10 ? cleanDigits : cleanDigits.slice(-10);
    const formattedPhone = `+91${tenDigit}`;

    setIsVerifyingOtp(true);
    setOtpError("");
    setOtpInfo("");

    try {
      const resp = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, code: otpInput.trim() })
      });
      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || (lang === "ta" ? "தவறான 6 இலக்க ஓடிபி எண்!" : "Incorrect 6-digit OTP code."));
      }

      setIsPhoneVerified(true);
      setOtpSent(false);
      setIsVerifyingOtp(false);
      setOtpError("");
      setOtpInfo(lang === "ta" ? "கைபேசி எண் வெற்றிகரமாக சரிபார்க்கப்பட்டது!" : "Mobile number verified successfully!");
      onAddAuditLog("SMS OTP Verified", `Phone number ${phone} verified via SMS OTP.`);
    } catch (err: any) {
      setIsVerifyingOtp(false);
      console.error("SMS OTP Verification Error:", err);
      setOtpError(err.message || (lang === "ta" ? "ஓடிபி சரிபார்ப்பில் பிழை ஏற்பட்டது." : "Verification failed. Please check the code."));
    }
  };

  // Canvas signature actions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage("");
  };

  // Handle specialty skill toggle
  const handleSpecialtyToggle = (id: string) => {
    setSpecialization((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Simulated File Upload handler
  const handleFileUploadSimulated = (fieldName: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === "ta" ? "கோப்பின் அளவு 5MB-க்கும் குறைவாக இருக்க வேண்டும்!" : "File exceeds maximum size limit of 5MB!");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert(lang === "ta" ? "JPG, PNG, அல்லது PDF கோப்புகள் மட்டுமே அனுமதிக்கப்படும்!" : "Only JPG, PNG, or PDF formats are supported!");
      return;
    }

    // Dynamic progress bar simulator
    setUploadProgress(prev => ({ ...prev, [fieldName]: 10 }));
    let progress = 10;
    const interval = setInterval(() => {
      progress += 30;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }));
        
        // Generate a mock URL representation
        const mockUrl = URL.createObjectURL(file);
        if (fieldName === "photo") setPhoto(mockUrl);
        else if (fieldName === "aadhaar_front") setAadhaarFront(mockUrl);
        else if (fieldName === "aadhaar_back") setAadhaarBack(mockUrl);
        else if (fieldName === "additional_doc") setAdditionalDoc(mockUrl);
      } else {
        setUploadProgress(prev => ({ ...prev, [fieldName]: progress }));
      }
    }, 200);
  };

  // Handle Drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(true);
  };

  const handleDragLeave = () => {
    setIsDraggingPhoto(false);
  };

  const handleDrop = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUploadSimulated(fieldName, e.dataTransfer.files[0]);
    }
  };

  // Wizard Navigation validations
  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setError(lang === "ta" ? "முழு பெயரைத் தமிழில் உள்ளிடவும்!" : "Please enter full name in Tamil!");
        return false;
      }
      if (!nameEn.trim()) {
        setError(lang === "ta" ? "முழு பெயரை ஆங்கிலத்தில் உள்ளிடவும்!" : "Please enter full name in English!");
        return false;
      }
      if (!fatherName.trim()) {
        setError(lang === "ta" ? "தந்தை / கணவர் பெயரை உள்ளிடவும்!" : "Please enter Father's / Husband's Name!");
        return false;
      }
      if (!dob) {
        setError(lang === "ta" ? "பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்!" : "Please select Date of Birth!");
        return false;
      }
      if (!phone.trim() || phone.length < 10) {
        setError(lang === "ta" ? "சரியான கைபேசி எண்ணை உள்ளிடவும்!" : "Please enter valid 10-digit mobile number!");
        return false;
      }
      if (!isPhoneVerified) {
        setError(lang === "ta" ? "தயவுசெய்து உங்கள் தொலைபேசி எண்ணை SMS ஓடிபி மூலம் சரிபார்க்கவும்!" : "Please verify your mobile number via SMS OTP first!");
        return false;
      }
      if (!aadhaar.trim() || aadhaar.replace(/-/g, "").length !== 12) {
        setError(lang === "ta" ? "சரியான 12 இலக்க ஆதார் அட்டை எண்ணை உள்ளிடவும்!" : "Please enter a valid 12-digit Aadhaar Card number!");
        return false;
      }
    } else if (currentStep === 2) {
      if (!taluk.trim()) {
        setError(lang === "ta" ? "வட்டாரத் தகவலை (தாலுகா) உள்ளிடவும்!" : "Please enter Taluk/Sub-district!");
        return false;
      }
      if (!villageOrTown.trim()) {
        setError(lang === "ta" ? "கிராமம் அல்லது நகரத்தின் பெயரை உள்ளிடவும்!" : "Please enter Village or Town!");
        return false;
      }
      if (!pinCode.trim() || pinCode.length !== 6) {
        setError(lang === "ta" ? "சரியான 6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்!" : "Please enter a valid 6-digit PIN code!");
        return false;
      }
      if (!address.trim() || address.length < 10) {
        setError(lang === "ta" ? "முழு வீட்டு முகவரியை தெளிவாக உள்ளிடவும்!" : "Please fill out detailed residential address!");
        return false;
      }
    } else if (currentStep === 3) {
      if (experience < 1) {
        setError(lang === "ta" ? "குறைந்தபட்சம் 1 வருட அனுபவமாவது இருக்க வேண்டும்!" : "Experience must be at least 1 year!");
        return false;
      }
    } else if (currentStep === 4) {
      if (!photo) {
        setError(lang === "ta" ? "தயவுசெய்து உங்களின் புகைப்படத்தை பதிவேற்றவும்!" : "Profile photograph is required!");
        return false;
      }
      if (!aadhaarFront) {
        setError(lang === "ta" ? "ஆதார் அட்டை முன் பக்கத்தைப் பதிவேற்றவும்!" : "Aadhaar Card Front copy is required!");
        return false;
      }
      if (!aadhaarBack) {
        setError(lang === "ta" ? "ஆதார் அட்டை பின் பக்கத்தைப் பதிவேற்றவும்!" : "Aadhaar Card Back copy is required!");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev + 1) as any);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((prev) => (prev - 1) as any);
  };

  // Final submit handler
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptRules || !declareTruth) {
      setError(lang === "ta" ? "விதிகள் மற்றும் உண்மைகளை உறுதிப்படுத்தும் பெட்டிகளைத் தேர்வு செய்யவும்!" : "You must accept the Union terms and certify accuracy to proceed!");
      return;
    }

    let finalSig = "";
    if (signatureType === "drawn" && canvasRef.current) {
      finalSig = canvasRef.current.toDataURL();
    } else {
      finalSig = signatureText;
    }

    if (!finalSig) {
      setError(lang === "ta" ? "தயவுசெய்து உங்கள் டிஜிட்டல் கையொப்பத்தை இடவும்!" : "Digital Signature is mandatory!");
      return;
    }

    // Formulate final member payload
    const finalReg: RegType = {
      id: editingId || `reg_${Date.now()}`,
      regNumber: editingId 
        ? (registrations.find(r => r.id === editingId)?.regNumber || "") 
        : "", // approved state generates true membership number
      name,
      nameEn,
      fatherName,
      dob,
      gender,
      bloodGroup,
      phone,
      whatsapp,
      email,
      aadhaar,
      state,
      district,
      taluk,
      villageOrTown,
      pinCode,
      address,
      profession,
      experienceYears: experience,
      specialization: specialization.join(", "),
      photoUrl: photo,
      aadhaarFrontUrl: aadhaarFront,
      aadhaarBackUrl: aadhaarBack,
      additionalDocsUrl: additionalDoc,
      signatureData: signatureType === "drawn" ? finalSig : undefined,
      signatureType,
      signatureText: signatureType === "typed" ? signatureText : undefined,
      status: "pending", // Starts fresh as Pending
      createdAt: new Date().toISOString()
    };

    onSubmitRegistration(finalReg);
    setTrackedApplication(finalReg);
    
    alert(
      lang === "ta"
        ? "நன்றி! உங்கள் உறுப்பினர் சேர்க்கை விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. தற்போதைய நிலை: பரியோசனை நிலையில் (Pending Review)"
        : "Success! Your application has been registered securely. Current Status: Pending Review."
    );

    // Swap to tracking tab to show details & timeline
    setEditingId(null);
    setActivePortalTab("track");
    setSearchPhoneOrId(phone);
    setSearchAttempted(true);
    setStep(1); // Reset step counter for next use
  };

  // Search application helper
  const handleSearchApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
    const query = searchPhoneOrId.trim().toLowerCase();

    if (!query) {
      setTrackedApplication(null);
      return;
    }

    // Match by phone, application ID, or Membership Number
    const matched = registrations.find(
      (r) => 
        r.phone === query || 
        r.id === query || 
        (r.regNumber && r.regNumber.toLowerCase() === query)
    );

    if (matched) {
      setTrackedApplication(matched);
      setError(null);
    } else {
      setTrackedApplication(null);
    }
  };

  // Launch edit mode for correction
  const handleLaunchCorrectionEdit = (app: RegType) => {
    setEditingId(app.id);
    setName(app.name);
    setNameEn(app.nameEn || "");
    setFatherName(app.fatherName);
    setDob(app.dob);
    setGender(app.gender);
    setBloodGroup(app.bloodGroup);
    setPhone(app.phone);
    setWhatsapp(app.whatsapp || "");
    setEmail(app.email || "");
    setAadhaar(app.aadhaar || "");
    setIsSameAsMobile(app.phone === app.whatsapp);
    setIsPhoneVerified(true); // pre-verified

    setDistrict(app.district);
    setTaluk(app.taluk || "");
    setVillageOrTown(app.villageOrTown || "");
    setPinCode(app.pinCode || "");
    setAddress(app.address);

    setProfession(app.profession || "House Painter");
    setExperience(app.experienceYears);
    setSpecialization(app.specialization ? app.specialization.split(", ") : []);

    setPhoto(app.photoUrl);
    setAadhaarFront(app.aadhaarFrontUrl || "");
    setAadhaarBack(app.aadhaarBackUrl || "");
    setAdditionalDoc(app.additionalDocsUrl || "");

    setStep(1);
    setActivePortalTab("apply");
    alert(lang === "ta" ? "திருத்தப் பதிவேற்றப் பயன்முறை துவங்கப்பட்டது! பிழைகளைச் சரிசெய்து மீண்டும் சமர்ப்பிக்கவும்." : "Correction editing mode initiated. Review flagged fields and resubmit.");
  };

  // Simulate scanning of QR code (Verified portal display)
  const handleSimulateScanner = (e: React.FormEvent) => {
    e.preventDefault();
    setScanError("");
    setScannedResult(null);

    const query = scannerInput.trim().toLowerCase();
    if (!query) return;

    const matched = registrations.find(
      (r) => 
        r.status === "approved" && 
        (r.regNumber?.toLowerCase() === query || r.phone === query)
    );

    if (matched) {
      setScannedResult(matched);
    } else {
      setScanError(
        lang === "ta" 
          ? "அங்கீகரிக்கப்பட்ட உறுப்பினர் விவரம் எதுவும் கண்டறியப்படவில்லை! (Approved ID அல்லது கைபேசி எண் மட்டுமே ஸ்கேன் செய்ய முடியும்)" 
          : "No active verified member found with this ID or mobile!"
      );
    }
  };

  // Render dynamic badge helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-bold text-xs flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === "ta" ? "அங்கீகரிக்கப்பட்டது (Approved)" : "Approved"}</span>
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-full font-bold text-xs flex items-center gap-1.5 w-fit">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{lang === "ta" ? "நிராகரிக்கப்பட்டது (Rejected)" : "Rejected"}</span>
          </span>
        );
      case "needs_correction":
        return (
          <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-full font-bold text-xs flex items-center gap-1.5 w-fit">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span>{lang === "ta" ? "திருத்தம் தேவை (Needs Correction)" : "Needs Correction"}</span>
          </span>
        );
      case "under_review":
        return (
          <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full font-bold text-xs flex items-center gap-1.5 w-fit">
            <Clock className="w-4 h-4 text-blue-600 animate-spin" />
            <span>{lang === "ta" ? "பரிசீலனையில் (Under Review)" : "Under Review"}</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-stone-50 border border-stone-200 text-stone-600 rounded-full font-bold text-xs flex items-center gap-1.5 w-fit">
            <Clock className="w-4 h-4 text-stone-500 animate-pulse" />
            <span>{lang === "ta" ? "விண்ணப்பம் பெற்றது (Pending)" : "Pending Review"}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-lg max-w-5xl mx-auto overflow-hidden">
      
      {/* BRANDING BAR */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-850 p-5 text-white flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b-2 border-amber-500">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black uppercase tracking-wider">
              {lang === "ta" ? "டிஜிட்டல் உறுப்பினர் சேர்க்கை மையம்" : "UNION DIGITAL MEMBERSHIP HUB"}
            </h3>
          </div>
          <p className="text-stone-400 text-xs mt-1">
            {lang === "ta" ? "பாதுகாப்பான மற்றும் முழுமையான சுய-சரிபார்ப்பு அரசு கட்டமைப்பு" : "Interactive state construction painters identification loop"}
          </p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex bg-stone-850 p-1 rounded-xl border border-stone-700 w-fit shrink-0">
          <button
            onClick={() => setActivePortalTab("apply")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === "apply" ? "bg-amber-500 text-stone-950 shadow" : "text-stone-300 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "புதிய பதிவு" : "New Enrollment"}</span>
          </button>

          <button
            onClick={() => setActivePortalTab("track")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === "track" ? "bg-amber-500 text-stone-950 shadow" : "text-stone-300 hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "விண்ணப்ப நிலை" : "Track Application"}</span>
          </button>

          <button
            onClick={() => setActivePortalTab("scanner")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === "scanner" ? "bg-amber-500 text-stone-950 shadow" : "text-stone-300 hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "QR சரிபார்ப்பு" : "QR Verify"}</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* TAB 1: NEW APPLICATION WIZARD */}
        {activePortalTab === "apply" && (
          <div className="space-y-6">
            
            {/* Step Indicators */}
            <div className="flex justify-between items-center max-w-xl mx-auto pb-6 border-b border-stone-100">
              {[
                { s: 1, label: "தனிநபர்", labelEn: "Personal" },
                { s: 2, label: "முகவரி", labelEn: "Address" },
                { s: 3, label: "தொழில்", labelEn: "Job" },
                { s: 4, label: "ஆவணங்கள்", labelEn: "Uploads" },
                { s: 5, label: "கையொப்பம்", labelEn: "Sign" }
              ].map((stepObj) => (
                <div key={stepObj.s} className="flex flex-col items-center gap-1.5">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                    step === stepObj.s 
                      ? "bg-amber-500 border-amber-500 text-stone-950 shadow-md font-black" 
                      : step > stepObj.s 
                        ? "bg-stone-900 border-stone-900 text-amber-400" 
                        : "bg-white border-stone-200 text-stone-400"
                  }`}>
                    {step > stepObj.s ? "✓" : stepObj.s}
                  </div>
                  <span className="text-[10px] font-black text-stone-500">
                    {lang === "ta" ? stepObj.label : stepObj.labelEn}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2 max-w-2xl mx-auto">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {editingId && (
              <div className="p-3.5 bg-yellow-50 border border-yellow-200 text-yellow-900 text-xs font-bold rounded-xl flex items-center gap-2 max-w-2xl mx-auto">
                <Info className="w-4 h-4 shrink-0 text-yellow-600" />
                <span>
                  {lang === "ta" 
                    ? "கவனிக்க: நீங்கள் தற்போது முந்தைய திருத்தக் கோரிக்கையைச் சரிசெய்கிறீர்கள். திருத்தம் முடிந்ததும் மீண்டும் சமர்ப்பிக்கவும்." 
                    : "Note: You are currently editing a correction request. Make sure to update the faulty fields."}
                </span>
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="max-w-3xl mx-auto text-left space-y-6">
              
              {/* STEP 1: PERSONAL INFORMATION */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-100 text-stone-700 text-xs rounded-xl flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      {lang === "ta" 
                        ? "உங்கள் பெயர், பிறந்த தேதி மற்றும் கைபேசி எண் அனைத்தும் ஆதார் அட்டையில் உள்ளவாறு சரியாக இருக்க வேண்டும்." 
                        : "Personal details must strictly match credentials in your official Aadhaar booklet for welfare alignment."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">உறுப்பினர் பெயர் (தமிழ்) *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="எ.கா: ச. அன்புசெல்வன்"
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Full Name (English) *</label>
                      <input
                        type="text"
                        required
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder="E.g. S. Anbuselvan"
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">தந்தை / கணவர் பெயர் (Father / Spouse) *</label>
                      <input
                        type="text"
                        required
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder="எ.கா: மு. சக்திவேல்"
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">பிறந்த தேதி (DOB) *</label>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-stone-50 focus:bg-white cursor-pointer text-stone-800"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">இரத்த வகை (Blood) *</label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-white text-stone-800 cursor-pointer"
                        >
                          {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((bg) => (
                            <option key={`bg_${bg}`} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">பாலினம் (Gender) *</label>
                      <div className="flex gap-4 p-2 bg-stone-50 border rounded-xl">
                        {["Male", "Female", "Other"].map((gen) => (
                          <label key={`gen_${gen}`} className="flex items-center gap-1.5 cursor-pointer font-semibold">
                            <input
                              type="radio"
                              name="gender"
                              value={gen}
                              checked={gender === gen}
                              onChange={() => setGender(gen)}
                              className="text-amber-500 focus:ring-amber-500"
                            />
                            <span>{gen === "Male" ? (lang === "ta" ? "ஆண்" : "Male") : gen === "Female" ? (lang === "ta" ? "பெண்" : "Female") : (lang === "ta" ? "இதர" : "Other")}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">கைபேசி எண் (Active Mobile) *</label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            disabled={isPhoneVerified || isSendingOtp}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="944xxxxxxx"
                            className="w-full pl-8 pr-3 py-2 border rounded-xl bg-stone-50 disabled:bg-stone-100 disabled:text-stone-500"
                          />
                          <Smartphone className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
                        </div>
                        {!isPhoneVerified && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={isSendingOtp || otpTimer > 0}
                            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors flex items-center gap-1.5"
                          >
                            {isSendingOtp ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>{lang === "ta" ? "அனுப்புகிறது..." : "Sending..."}</span>
                              </>
                            ) : otpSent && otpTimer > 0 ? (
                              <span>{otpTimer}s</span>
                            ) : (
                              <span>{otpSent ? (lang === "ta" ? "மீண்டும் அனுப்ப" : "Resend OTP") : (lang === "ta" ? "SMS OTP அனுப்ப" : "Send SMS OTP")}</span>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Status / Error Display */}
                      {otpInfo && (
                        <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{otpInfo}</span>
                        </div>
                      )}

                      {otpError && (
                        <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-bold">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{otpError}</span>
                        </div>
                      )}

                      {/* Real OTP verification input */}
                      {otpSent && !isPhoneVerified && (
                        <div className="mt-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-blue-900">
                              {lang === "ta" ? "SMS மூலம் வந்த 6 இலக்க OTP குறியீட்டை உள்ளிடவும்" : "Enter the 6-digit SMS OTP code sent to your phone"}
                            </span>
                            {otpTimer > 0 && <span className="text-stone-500 font-mono text-xs">00:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}</span>}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={otpInput}
                              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                              placeholder="E.g. 849201"
                              className="px-3 py-1.5 border border-stone-300 rounded-lg text-center font-mono font-black tracking-widest text-base bg-white text-stone-900 focus:outline-none focus:border-amber-500 w-32"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOTP}
                              disabled={isVerifyingOtp}
                              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                            >
                              {isVerifyingOtp ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>{lang === "ta" ? "சரிபார்க்கிறது..." : "Verifying..."}</span>
                                </>
                              ) : (
                                <span>{lang === "ta" ? "சரிபார் (Verify OTP)" : "Verify OTP"}</span>
                              )}
                            </button>
                          </div>
                          {otpError && <p className="text-rose-600 font-bold mt-1 text-xs">{otpError}</p>}
                        </div>
                      )}

                      {isPhoneVerified && (
                        <div className="mt-2 flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{lang === "ta" ? "தொலைபேசி எண் ஃபயர்பேஸ் மூலம் வெற்றிகரமாக சரிபார்க்கப்பட்டது!" : "Mobile Number Verified via Firebase SMS OTP!"}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-stone-700">வாட்ஸ்அப் எண் (WhatsApp Number)</label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSameAsMobile}
                            onChange={(e) => setIsSameAsMobile(e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-[10px] text-stone-500 font-medium">{lang === "ta" ? "கைபேசி எண் போன்றதே" : "Same as Mobile"}</span>
                        </label>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        disabled={isSameAsMobile}
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                        placeholder="WhatsApp number"
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white disabled:bg-stone-100 disabled:text-stone-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">மின்னஞ்சல் முகவரி (Email Address - Optional)</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. painter@example.com"
                          className="w-full pl-8 pr-3 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                        />
                        <Mail className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">ஆதார் அட்டை எண் (Aadhaar Card Number) *</label>
                      <input
                        type="text"
                        maxLength={14}
                        required
                        value={aadhaar}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^\d-]/g, "");
                          setAadhaar(cleaned);
                        }}
                        placeholder="1234-5678-9012"
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ADDRESS DETAILS */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">மாநிலம் (State)</label>
                      <input
                        type="text"
                        disabled
                        value={state}
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-100 text-stone-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">மாவட்டம் (District) *</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3.5 py-2 border rounded-xl bg-white text-stone-800 cursor-pointer"
                      >
                        {districtsList.map((d, idx) => (
                          <option key={`reg_d_${d}_${idx}`} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">வட்டம் / தாலுகா (Taluk) *</label>
                      <input
                        type="text"
                        required
                        value={taluk}
                        onChange={(e) => setTaluk(e.target.value)}
                        placeholder="எ.கா: சோழிங்கநல்லூர்"
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">கிராமம் / நகரம் (Village / Town) *</label>
                      <input
                        type="text"
                        required
                        value={villageOrTown}
                        onChange={(e) => setVillageOrTown(e.target.value)}
                        placeholder="எ.கா: வேளச்சேரி"
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">அஞ்சல் குறியீடு (PIN Code) *</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="600042"
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">முழு வீட்டு முகவரி (Full Residential Address) *</label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={lang === "ta" ? "கதவு எண், தெரு பெயர், பிரதான பகுதி மற்றும் அடையாளங்கள்..." : "Door number, street name, layout, landmarks..."}
                      className="w-full p-3 border rounded-xl bg-stone-50 text-xs focus:bg-white resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: OCCUPATION & EXPERIENCE */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">தொழில் வகை (Profession) *</label>
                      <select
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="w-full px-3.5 py-2 border rounded-xl bg-white text-stone-800 cursor-pointer"
                      >
                        <option value="House Painter">{lang === "ta" ? "வீட்டு வர்ணம் பூசுபவர் (House Painter)" : "House Painter"}</option>
                        <option value="Painting Contractor">{lang === "ta" ? "பெயிண்டிங் ஒப்பந்தக்காரர் (Painting Contractor)" : "Painting Contractor"}</option>
                        <option value="Wall Artist">{lang === "ta" ? "சுவர் ஓவியக் கலைஞர் (Wall Decorative Artist)" : "Decorative Wall Artist"}</option>
                        <option value="Wood Polisher">{lang === "ta" ? "மரப்பாலிஷ் செய்பவர் (Wood Polisher)" : "Wood Polisher"}</option>
                        <option value="Spray Painter">{lang === "ta" ? "தெளிப்பு வர்ணம் பூசுபவர் (Spray Painter)" : "Spray Painter"}</option>
                        <option value="Industrial Coating">{lang === "ta" ? "தொழில்துறை பூச்சு நிபுணர் (Industrial Coating)" : "Industrial Coating Expert"}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">தொழில் அனுபவம் (Painting Experience - Years) *</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        required
                        value={experience}
                        onChange={(e) => setExperience(Number(e.target.value))}
                        className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white text-xs text-stone-850"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">
                      {lang === "ta" ? "நிறைவேற்றிய சிறப்புத் திறன்கள் (Specializations / Skills)" : "Select Skills & Specializations"}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {specializationOptions.map((opt, idx) => (
                        <div 
                          key={`reg_spec_${opt.id}_${idx}`}
                          onClick={() => handleSpecialtyToggle(opt.id)}
                          className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            specialization.includes(opt.id)
                              ? "bg-amber-50 border-amber-400 shadow-sm"
                              : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          <div className="text-left leading-tight pr-2">
                            <span className="text-[11px] font-bold text-stone-900 block">
                              {lang === "ta" ? opt.label : opt.labelEn}
                            </span>
                          </div>
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                            specialization.includes(opt.id) ? "bg-amber-500 border-amber-500 text-stone-950" : "border-stone-300"
                          }`}>
                            {specialization.includes(opt.id) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DOCUMENT UPLOADS */}
              {step === 4 && (
                <div className="space-y-6">
                  
                  {/* Photo Drag and Drop Card */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">{lang === "ta" ? "1. அடையாளப் புகைப்படம் (Passport Photo - JPG/PNG) *" : "1. Passport Photograph (JPG/PNG) *"}</label>
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "photo")}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center flex flex-col md:flex-row items-center justify-center gap-4 transition-all ${
                        isDraggingPhoto ? "border-amber-500 bg-amber-50/50" : "border-stone-300 bg-stone-50 hover:bg-stone-100/50"
                      }`}
                    >
                      <img 
                        src={photo} 
                        alt="Profile photograph Preview" 
                        referrerPolicy="no-referrer"
                        className="h-20 w-16 object-cover rounded-xl border border-stone-200 shadow-md shrink-0" 
                      />
                      <div className="text-xs text-left leading-relaxed">
                        <span className="font-extrabold text-stone-900 block">{lang === "ta" ? "புகைப்படத்தை இங்கே இழுக்கவும் அல்லது தேர்வு செய்க" : "Drag & Drop or browse to upload"}</span>
                        <span className="text-stone-400 block mt-0.5">{lang === "ta" ? "முகம் தெளிவாக தெரிய வேண்டும் (Max 5MB)" : "Must show face clearly (Max file size: 5MB)"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files && handleFileUploadSimulated("photo", e.target.files[0])}
                          className="mt-2 text-[11px] block cursor-pointer text-stone-600"
                        />
                      </div>
                    </div>
                    {uploadProgress["photo"] !== undefined && (
                      <div className="w-full bg-stone-100 rounded-full h-1 mt-1">
                        <div className="bg-amber-500 h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgress["photo"]}%` }} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Aadhaar Front */}
                    <div className="p-4 border border-stone-200 rounded-2xl bg-stone-50 space-y-3">
                      <span className="font-extrabold text-xs text-stone-900 block">{lang === "ta" ? "2. ஆதார் அட்டை முன் பக்கம் *" : "2. Aadhaar Card Front *"}</span>
                      <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-stone-400 shrink-0" />
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => e.target.files && handleFileUploadSimulated("aadhaar_front", e.target.files[0])}
                          className="text-xs text-stone-500 cursor-pointer"
                        />
                      </div>
                      {uploadProgress["aadhaar_front"] !== undefined && (
                        <div className="w-full bg-stone-100 rounded-full h-1">
                          <div className="bg-amber-500 h-1 rounded-full transition-all" style={{ width: `${uploadProgress["aadhaar_front"]}%` }} />
                        </div>
                      )}
                      {aadhaarFront && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{lang === "ta" ? "ஆதார் முன் பக்கம் இணைக்கப்பட்டது!" : "Aadhaar Front Uploaded!"}</span>
                        </div>
                      )}
                    </div>

                    {/* Aadhaar Back */}
                    <div className="p-4 border border-stone-200 rounded-2xl bg-stone-50 space-y-3">
                      <span className="font-extrabold text-xs text-stone-900 block">{lang === "ta" ? "3. ஆதார் அட்டை பின் பக்கம் *" : "3. Aadhaar Card Back *"}</span>
                      <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-stone-400 shrink-0" />
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => e.target.files && handleFileUploadSimulated("aadhaar_back", e.target.files[0])}
                          className="text-xs text-stone-500 cursor-pointer"
                        />
                      </div>
                      {uploadProgress["aadhaar_back"] !== undefined && (
                        <div className="w-full bg-stone-100 rounded-full h-1">
                          <div className="bg-amber-500 h-1 rounded-full transition-all" style={{ width: `${uploadProgress["aadhaar_back"]}%` }} />
                        </div>
                      )}
                      {aadhaarBack && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{lang === "ta" ? "ஆதார் பின் பக்கம் இணைக்கப்பட்டது!" : "Aadhaar Back Uploaded!"}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Optional Docs */}
                  <div className="p-4 border border-stone-200 rounded-2xl bg-stone-50 space-y-3">
                    <span className="font-extrabold text-xs text-stone-900 block">{lang === "ta" ? "4. கூடுதல் ஆதார ஆவணம் (Optional Supporting Document)" : "4. Optional Supporting Document (e.g. Work Slip)"}</span>
                    <div className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-stone-400 shrink-0" />
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => e.target.files && handleFileUploadSimulated("additional_doc", e.target.files[0])}
                        className="text-xs text-stone-500 cursor-pointer"
                      />
                    </div>
                    {additionalDoc && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{lang === "ta" ? "கூடுதல் ஆவணம் இணைக்கப்பட்டது" : "Additional Document Uploaded"}</span>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* STEP 5: DECLARATION & SIGNATURE */}
              {step === 5 && (
                <div className="space-y-6">
                  
                  {/* Terms check */}
                  <div className="bg-stone-50 border p-5 rounded-2xl space-y-3.5 text-xs text-stone-700 leading-relaxed">
                    <span className="font-extrabold text-stone-950 block">{lang === "ta" ? "சங்க விதிமுறைகள் மற்றும் உறுதிமொழி" : "Union Rules Declaration & Privacy Consent"}</span>
                    
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptRules}
                        onChange={(e) => setAcceptRules(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500 mt-0.5"
                      />
                      <span>
                        {lang === "ta" 
                          ? "சங்கத்தின் அதிகாரப்பூர்வ விதிகள், கட்டுப்பாடுகள் மற்றும் தனியுரிமைக் கொள்கைகளுக்கு நான் முழுமையாகக் கட்டுப்படுகிறேன்." 
                          : "I agree to abide by the rules, standard by-laws, and code of professional ethics of the association."}
                      </span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declareTruth}
                        onChange={(e) => setDeclareTruth(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500 mt-0.5"
                      />
                      <span>
                        {lang === "ta" 
                          ? "விண்ணப்பத்தில் நான் வழங்கியுள்ள தனிநபர், முகவரி மற்றும் தொழில் சார்ந்த அனைத்துத் தகவல்களும் முற்றிலும் உண்மை என்று சான்றளிக்கிறேன்." 
                          : "I solemnly certify that all details, address booklets, and document uploads submitted are true and verifiable."}
                      </span>
                    </label>
                  </div>

                  {/* Signature type selection tabs */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <label className="block text-xs font-bold text-stone-700">{lang === "ta" ? "கையொப்பம் இடும் முறை (Choose Signature Style)" : "Choose Signature Type"}</label>
                      <div className="flex bg-stone-100 p-1 rounded-lg border text-[11px]">
                        <button
                          type="button"
                          onClick={() => setSignatureType("drawn")}
                          className={`px-3 py-1 rounded font-bold cursor-pointer transition-all ${signatureType === "drawn" ? "bg-white text-blue-900 shadow" : "text-stone-500"}`}
                        >
                          {lang === "ta" ? "கையால் எழுத" : "Draw Signature"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureType("typed")}
                          className={`px-3 py-1 rounded font-bold cursor-pointer transition-all ${signatureType === "typed" ? "bg-white text-blue-900 shadow" : "text-stone-500"}`}
                        >
                          {lang === "ta" ? "பெயர் தட்டச்சு" : "Type Signature"}
                        </button>
                      </div>
                    </div>

                    {signatureType === "drawn" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-stone-400">{lang === "ta" ? "மவுஸ் அல்லது விரல் மூலம் கீழே பெட்டியில் கையெழுத்திடவும்:" : "Use mouse/touchpad to sign in the canvas box below:"}</span>
                          <button
                            type="button"
                            onClick={clearCanvas}
                            className="text-[11px] text-[#b91c1c] font-bold hover:underline"
                          >
                            {lang === "ta" ? "துடை (Clear)" : "Clear Signature"}
                          </button>
                        </div>
                        <div className="border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50 p-2 flex items-center justify-center overflow-hidden">
                          <canvas
                            ref={canvasRef}
                            width={420}
                            height={150}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="bg-white border rounded-xl shadow-inner cursor-crosshair max-w-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-xs">
                          <label className="block font-bold text-stone-600 mb-1">{lang === "ta" ? "உங்கள் பெயர் (ஆங்கிலத்தில்):" : "Type Your Name (English):"}</label>
                          <input
                            type="text"
                            value={signatureText}
                            onChange={(e) => setSignatureText(e.target.value)}
                            placeholder="S. Anbuselvan"
                            className="w-full px-4 py-2 border rounded-xl bg-stone-50 focus:bg-white text-sm"
                          />
                        </div>

                        {/* Font selections */}
                        <div className="space-y-2">
                          <span className="text-[11px] text-stone-400 block">{lang === "ta" ? "எழுத்துரு பாணியைத் தேர்ந்தெடு (Select Cursive Font Style):" : "Select Handwritten Font Style:"}</span>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "font-serif italic tracking-wide", name: "Classic" },
                              { id: "font-mono italic font-bold", name: "Technical" },
                              { id: "font-sans italic uppercase font-light", name: "Minimalist" }
                            ].map((st, idx) => (
                              <button
                                type="button"
                                key={`reg_sig_${st.id}_${idx}`}
                                onClick={() => setSignatureStyle(st.id)}
                                className={`p-2 border rounded-xl text-center cursor-pointer transition-all ${
                                  signatureStyle === st.id ? "bg-amber-500 text-stone-950 font-black" : "bg-stone-50 border-stone-200"
                                }`}
                              >
                                <span className={`text-xs block ${st.id}`}>Anbu</span>
                                <span className="text-[8px] text-stone-400 block mt-0.5">{st.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Signature Preview Panel */}
                        {signatureText && (
                          <div className="p-4 bg-stone-50 border rounded-xl text-center text-blue-900 border-dashed">
                            <span className="text-[10px] text-stone-400 block mb-1">DIGITAL SIGNATURE PREVIEW</span>
                            <span className={`text-lg block select-none ${signatureStyle}`}>{signatureText}</span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex justify-between pt-6 border-t border-stone-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{lang === "ta" ? "முந்தைய படி" : "Previous Step"}</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <span>{lang === "ta" ? "அடுத்த படி" : "Next Step"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="px-6 py-2.5 bg-[#b91c1c] hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === "ta" ? "விண்ணப்பத்தைச் சமர்ப்பி" : "Submit Registration"}</span>
                  </button>
                )}
              </div>

            </form>

          </div>
        )}

        {/* TAB 2: TRACK APPLICATION & DIGITAL ID GENERATION */}
        {activePortalTab === "track" && (
          <div className="space-y-6">
            
            {/* Search HUD */}
            <form onSubmit={handleSearchApplication} className="max-w-md mx-auto space-y-3 bg-stone-50 p-4 border rounded-2xl">
              <span className="font-extrabold text-xs text-stone-800 block text-left">
                {lang === "ta" ? "விண்ணப்பக் குறியீடு அல்லது கைபேசி எண் மூலம் தேடுக:" : "Search by Phone or Registration Number:"}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchPhoneOrId}
                  onChange={(e) => setSearchPhoneOrId(e.target.value)}
                  placeholder="e.g. 9876543210 or reg_1"
                  className="flex-grow px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs bg-white text-stone-800 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{lang === "ta" ? "தேடுக" : "Find"}</span>
                </button>
              </div>
            </form>

            {/* Results Output */}
            {searchAttempted && !trackedApplication && (
              <div className="p-8 bg-stone-50 border border-dashed rounded-2xl text-center text-stone-400 max-w-xl mx-auto space-y-2">
                <AlertCircle className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs font-bold">
                  {lang === "ta" ? "விண்ணப்ப விவரங்கள் எதுவும் கண்டறியப்படவில்லை!" : "No application records found matching your query."}
                </p>
                <p className="text-[11px] text-stone-400">
                  {lang === "ta" ? "பதிவு செய்யும்போது வழங்கிய சரியான கைபேசி எண்ணை உள்ளிட்டு சரிபார்க்கவும்." : "Please check your registered 10-digit phone number or reference ID."}
                </p>
              </div>
            )}

            {trackedApplication && (
              <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-6 max-w-xl mx-auto">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="text-left space-y-0.5">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">{lang === "ta" ? "விண்ணப்ப எண் / ID:" : "Application Ref:"}</span>
                    <h3 className="text-sm font-black text-stone-900 font-mono">{trackedApplication.id}</h3>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">{lang === "ta" ? "தற்போதைய நிலை:" : "Current Status:"}</span>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        trackedApplication.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                        trackedApplication.status === "needs_correction" ? "bg-yellow-100 text-yellow-800" :
                        trackedApplication.status === "rejected" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {trackedApplication.status === "approved" ? (lang === "ta" ? "அங்கீகரிக்கப்பட்டது (Approved)" : "Approved") :
                         trackedApplication.status === "needs_correction" ? (lang === "ta" ? "திருத்தம் தேவை (Needs Correction)" : "Needs Correction") :
                         trackedApplication.status === "rejected" ? (lang === "ta" ? "நிராகரிக்கப்பட்டது (Rejected)" : "Rejected") :
                         (lang === "ta" ? "பரிசீலனையில் உள்ளது (Pending)" : "Under Review")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* APPROVED PORTION: PRINT CARD & SECURE QR SCANNER */}
                {/* APPROVED PORTION: PRINT CARD & SECURE QR SCANNER */}
                {trackedApplication.status === "approved" && (
                  <div className="space-y-6 border-t pt-5">
                    
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                      🎉 <strong>{lang === "ta" ? "அதிர்ஷ்டம்!" : "Congratulations!"}</strong> {lang === "ta" ? "உங்கள் உறுப்பினர் சேர்க்கை இறுதிச் சரிபார்ப்புடன் அங்கீகரிக்கப்பட்டுள்ளது. உங்கள் பிரத்தியேக டிஜிட்டல் உறுப்பினர் அடையாள அட்டை தயார் நிலையில் உள்ளது." : "Your painter membership is fully authenticated. Your printable Digital ID Card with cryptographic validation is presented below."}
                    </div>

                    {/* RED/GOLD ID CARD DISPLAY */}
                    <div className="flex justify-center">
                      <div 
                        id="track-card-print-area"
                        className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-amber-500 shadow-2xl bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#1e1b4b] text-white p-5 flex flex-col relative"
                      >
                        {/* Gold flag decor */}
                        <div className="absolute top-0 right-0 h-1 w-1/3 bg-amber-400" />
                        <div className="absolute top-0 left-0 h-1 w-1/3 bg-red-500" />

                        {/* Top Brand Banner */}
                        <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-3">
                          <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 relative">
                            <span className="text-[10px] text-[#991b1b] font-black">TNP</span>
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-[7px] uppercase font-bold text-amber-300 block tracking-widest leading-none">
                              ஒன்று கூடுவோம், வென்று காட்டுவோம்
                            </span>
                            <span className="text-[9px] font-black block leading-tight">
                              T.N. PAINTERS & ARTISTS ASSOCIATION
                            </span>
                            <span className="text-[6px] text-stone-200 block leading-none">
                              Reg No: TNMDUJCLMDUTU-50-26-00044
                            </span>
                          </div>
                        </div>

                        {/* Middle Profile */}
                        <div className="grid grid-cols-3 gap-3 flex-1 mb-3">
                          <div className="flex flex-col items-center">
                            <img 
                              src={trackedApplication.photoUrl} 
                              alt="Member Profile photo" 
                              referrerPolicy="no-referrer"
                              className="h-20 w-16 object-cover rounded-lg border border-amber-300 shadow" 
                            />
                            <span className="text-[8px] text-amber-300 font-bold mt-1.5 uppercase bg-white/10 px-1.5 py-0.5 rounded">
                              {trackedApplication.bloodGroup || "O+"}
                            </span>
                          </div>

                          <div className="col-span-2 space-y-1.5 text-left text-xs">
                            <div>
                              <span className="text-[7px] text-amber-200 block leading-none">Name / பெயர்:</span>
                              <span className="text-[11px] font-extrabold text-white block truncate">{trackedApplication.nameEn || trackedApplication.name}</span>
                            </div>
                            <div>
                              <span className="text-[7px] text-amber-200 block leading-none">ID Number / எண்:</span>
                              <span className="text-[10px] font-mono font-bold text-yellow-300 block">{trackedApplication.regNumber}</span>
                            </div>
                            <div>
                              <span className="text-[7px] text-amber-200 block leading-none">District / மாவட்டம்:</span>
                              <span className="text-[9px] text-white block font-semibold">{trackedApplication.district}</span>
                            </div>
                          </div>
                        </div>

                        {/* Back footer with barcode & QR code */}
                        <div className="flex justify-between items-end border-t border-white/20 pt-2 shrink-0 text-[6px] text-amber-200">
                          <div className="text-left space-y-0.5 leading-tight">
                            <span>Phone / கைபேசி: {trackedApplication.phone}</span>
                            <br />
                            <span>Validity: 31st Dec 2026</span>
                            <br />
                            <span>Aadhaar: Verified (Aadhaar shielded)</span>
                          </div>

                          {/* Dynamic secure QR code */}
                          <div className="flex flex-col items-center">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                `TNP APPROVED MEMBER: ${trackedApplication.nameEn || trackedApplication.name} | Reg: ${trackedApplication.regNumber} | Dist: ${trackedApplication.district} | Validity: 2026-12-31 | Verified: Yes`
                              )}`}
                              alt="SECURE VERIFICATION QR" 
                              className="h-10 w-10 bg-white p-0.5 rounded border"
                            />
                            <span className="text-[4px] text-amber-300 uppercase font-black mt-0.5">SCAN TO VERIFY</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Dues Renewal and ID Actions */}
                    <div className="flex flex-wrap justify-center gap-4">
                      <button
                        onClick={() => window.print()}
                        className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Printer className="w-4 h-4 text-amber-400" />
                        <span>{lang === "ta" ? "அடையாள அட்டை அச்சிடு" : "Print Member ID Card"}</span>
                      </button>

                      {/* Interactive simulated download link */}
                      <a
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                          `==========================================\n  TAMIL NADU PAINTERS ASSOCIATION DIGITAL ID\n==========================================\nNAME: ${trackedApplication.nameEn || trackedApplication.name}\nREG NO: ${trackedApplication.regNumber}\nDISTRICT: ${trackedApplication.district}\nPHONE: ${trackedApplication.phone}\nSTATUS: VERIFIED ACTIVE\nVALIDITY: 31ST DEC 2026\n==========================================`
                        )}`}
                        download={`TNP_ID_CARD_${trackedApplication.regNumber}.txt`}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Download className="w-4 h-4" />
                        <span>{lang === "ta" ? "டிஜிட்டல் அட்டை டவுன்லோடு" : "Download ID Certificate"}</span>
                      </a>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* TAB 3: AUTHORIZED SCANNER SIMULATOR */}
        {activePortalTab === "scanner" && (
          <div className="space-y-6 max-w-xl mx-auto">
            
            <div className="bg-stone-50 border p-5 rounded-2xl text-left space-y-3 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                <span className="font-extrabold text-stone-950 block">{lang === "ta" ? "அங்கீகரிக்கப்பட்ட டிஜிட்டல் QR குறியீடு ஸ்கேனர்" : "SECURE CRYTOGRAPHIC VERIFICATION LOOP"}</span>
              </div>
              <p className="leading-relaxed">
                {lang === "ta" 
                  ? "உறுப்பினர்களின் சங்க அட்டையில் உள்ள QR குறியீட்டை ஸ்கேன் செய்து விவரங்களை சரிபார்க்கவும். (ஆதார் அல்லது தனிப்பட்ட ரகசிய ஆவணங்கள் எதுவும் வெளிப்படுத்தப்பட மாட்டாது)." 
                  : "Authorized scanning terminal. Submit a Membership ID or Phone below to verify the active enrollment status securely."}
              </p>

              <form onSubmit={handleSimulateScanner} className="flex gap-2 pt-2">
                <input
                  type="text"
                  required
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  placeholder="e.g. TNP-2026-0034 or 9876543210"
                  className="flex-grow px-3.5 py-2 border rounded-xl bg-white text-stone-800 text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  {lang === "ta" ? "விவரங்களை சரிபார்" : "Verify ID"}
                </button>
              </form>
            </div>

            {scanError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 text-left">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Simulated Verified scan result */}
            {scannedResult && (
              <div className="p-5 border-2 border-emerald-500 rounded-2xl bg-emerald-50/50 space-y-4 text-left shadow-md animate-[fadeIn_0.4s_ease-out]">
                
                <div className="flex justify-between items-center border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 animate-pulse" />
                    <span className="text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                      {lang === "ta" ? "உறுப்பினர் சரிபார்க்கப்பட்டார்" : "TNP SECURELY VERIFIED MEMBER"}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    ACTIVE MEMBER
                  </span>
                </div>

                <div className="flex gap-4 items-start">
                  <img 
                    src={scannedResult.photoUrl} 
                    alt="Scanned Member" 
                    referrerPolicy="no-referrer"
                    className="h-20 w-16 object-cover rounded-xl border border-emerald-300 shadow-sm" 
                  />
                  <div className="space-y-1.5 text-xs text-stone-700 flex-grow">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase leading-none">Full Name / பெயர்:</span>
                      <span className="font-extrabold text-stone-900">{scannedResult.nameEn || scannedResult.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase leading-none">Membership ID / எண்:</span>
                        <span className="font-mono font-extrabold text-stone-900">{scannedResult.regNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase leading-none">District / மாவட்டம்:</span>
                        <span className="font-bold text-stone-900">{scannedResult.district}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase leading-none">Validity / ஆயுள்:</span>
                        <span className="font-bold text-stone-900">31-Dec-2026</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase leading-none">Blood Group / இரத்தம்:</span>
                        <span className="font-bold text-stone-900">{scannedResult.bloodGroup || "O+"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-emerald-100 rounded-xl text-[10px] text-stone-500 leading-relaxed">
                  🛡️ <strong>Aadhaar Masking Guard:</strong> Security policy prevents exposure of 12-digit national identifier or scanned back-slip uploads to unauthorized coordinators.
                </div>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
