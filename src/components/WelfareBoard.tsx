import React, { useState } from "react";
import GovernmentSchemesAggregator from "./GovernmentSchemesAggregator";
import { 
  Award, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  MapPin, 
  Phone, 
  Upload, 
  X, 
  ShieldCheck, 
  Trash2, 
  HelpCircle, 
  Send, 
  RefreshCw, 
  Printer, 
  Download, 
  Search,
  BookOpen,
  Heart,
  Home,
  Briefcase,
  Smile,
  ShieldAlert,
  ListFilter,
  Check,
  GraduationCap,
  Plus,
  Edit,
  Archive,
  Sparkles,
  Eye,
  Save,
  Undo
} from "lucide-react";
import { WelfareApplication, UserAccount, MemberRegistration } from "../types";

interface WelfareBoardProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  registrations: MemberRegistration[];
  welfareApps: WelfareApplication[];
  onAddWelfareApp: (newApp: WelfareApplication) => void;
  onUpdateWelfareApp?: (updated: WelfareApplication) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

// Defining the 15 welfare sections/services as specified in the Master Prompt
export interface SchemeCategory {
  id: string;
  title: string;
  titleEn: string;
  amount: string;
  amountEn: string;
  desc: string;
  descEn: string;
  documents: string[];
  documentsEn: string[];
  icon: React.ReactNode;
}

export default function WelfareBoard({
  lang,
  currentUser,
  registrations,
  welfareApps,
  onAddWelfareApp,
  onUpdateWelfareApp,
  onAddAuditLog
}: WelfareBoardProps) {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  
  // Form fields
  const [memberId, setMemberId] = useState(currentUser?.regNumber || currentUser?.id || "");
  const [memberName, setMemberName] = useState(currentUser?.name || "");
  const [memberPhone, setMemberPhone] = useState(currentUser?.phone || "");
  const [district, setDistrict] = useState(currentUser?.district || "சென்னை");
  const [description, setDescription] = useState("");
  const [declaration, setDeclaration] = useState(false);
  
  // Document base64 simulator states
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [idFile, setIdFile] = useState<string | null>(null);
  const [idName, setIdName] = useState<string | null>(null);
  const [addressFile, setAddressFile] = useState<string | null>(null);
  const [addressName, setAddressName] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<string | null>(null);
  const [certName, setCertName] = useState<string | null>(null);
  const [supportFile, setSupportFile] = useState<string | null>(null);
  const [supportName, setSupportName] = useState<string | null>(null);

  // Editing resubmission state
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  // Search/Filter for tracking
  const [trackSearch, setTrackSearch] = useState("");

  // Active Navigation View (services, tracker, eforms, builder, schemes_aggregator)
  const [activeView, setActiveView] = useState<"services" | "tracker" | "eforms" | "builder" | "schemes_aggregator">("services");

  // Helper to coordinate with the legacy showTracker state
  const toggleView = (view: "services" | "tracker" | "eforms" | "builder" | "schemes_aggregator") => {
    setActiveView(view);
    if (view === "tracker") {
      setShowTracker(true);
    } else {
      setShowTracker(false);
    }
  };

  // E-Form interface
  interface EForm {
    id: string;
    name: string;
    nameEn: string;
    category: string;
    version: string;
    status: "active" | "archived";
    lang: "bilingual" | "ta" | "en";
    type: "online" | "pdf";
    downloadUrl: string;
    lastUpdated: string;
    history: { version: string; date: string; change: string }[];
  }

  // E-Form Library States
  const [eForms, setEForms] = useState<EForm[]>([
    {
      id: "form_welf_reg",
      name: "நலவாரியப் பதிவு விண்ணப்பப் படிவம் - படிவம் XXVII",
      nameEn: "Welfare Registration Application Form - Form XXVII",
      category: "Welfare Registration",
      version: "v2.4",
      status: "active",
      lang: "bilingual",
      type: "pdf",
      downloadUrl: "https://example.com/forms/form_xxvii.pdf",
      lastUpdated: "2026-04-10",
      history: [
        { version: "v2.4", date: "2026-04-10", change: "Added digital signature authorization field" },
        { version: "v2.0", date: "2025-08-15", change: "Bilingual Tamil-English alignment update" }
      ]
    },
    {
      id: "form_welf_renew",
      name: "ஓவியர் நலவாரியப் புதுப்பித்தல் படிவம் - படிவம் B",
      nameEn: "Welfare Renewal Request Form - Form B",
      category: "Renewal",
      version: "v1.8",
      status: "active",
      lang: "bilingual",
      type: "online",
      downloadUrl: "#",
      lastUpdated: "2026-05-02",
      history: [
        { version: "v1.8", date: "2026-05-02", change: "Integrated automated fee verification" }
      ]
    },
    {
      id: "form_edu_assist",
      name: "கல்வி மற்றும் கல்வி உதவித்தொகை படிவம் - படிவம் C",
      nameEn: "Education & Scholarship Application Form - Form C",
      category: "Education Assistance",
      version: "v3.1",
      status: "active",
      lang: "bilingual",
      type: "online",
      downloadUrl: "#",
      lastUpdated: "2026-06-18",
      history: [
        { version: "v3.1", date: "2026-06-18", change: "Support scholarship criteria for engineering / polytechnics" }
      ]
    },
    {
      id: "form_marr_assist",
      name: "ஓவியர் வாரிசு திருமண நிதியுதவி விண்ணப்பம் - படிவம் D",
      nameEn: "Marriage Assistance Application Form - Form D",
      category: "Marriage Assistance",
      version: "v1.2",
      status: "active",
      lang: "bilingual",
      type: "pdf",
      downloadUrl: "https://example.com/forms/form_marriage.pdf",
      lastUpdated: "2025-11-05",
      history: [
        { version: "v1.2", date: "2025-11-05", change: "Initial bilingual revision" }
      ]
    },
    {
      id: "form_pension",
      name: "மூத்த ஓவியர் ஓய்வூதியம் கோரும் விண்ணப்பப் படிவம் - படிவம் P1",
      nameEn: "Senior Painter Pension Claim Form - Form P1",
      category: "Pension",
      version: "v4.0",
      status: "active",
      lang: "bilingual",
      type: "pdf",
      downloadUrl: "https://example.com/forms/form_pension.pdf",
      lastUpdated: "2026-07-01",
      history: [
        { version: "v4.0", date: "2026-07-01", change: "Updated life certificate validation parameters" }
      ]
    }
  ]);

  // Search & Filters for E-Form Library
  const [eFormSearch, setEFormSearch] = useState("");
  const [eFormLangFilter, setEFormLangFilter] = useState("all");
  const [eFormTypeFilter, setEFormTypeFilter] = useState("all");
  const [eFormStatusFilter, setEFormStatusFilter] = useState("active");

  // Admin Create/Edit Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingForm, setEditingForm] = useState<EForm | null>(null);
  const [newFormName, setNewFormName] = useState("");
  const [newFormNameEn, setNewFormNameEn] = useState("");
  const [newFormCategory, setNewFormCategory] = useState("Welfare Registration");
  const [newFormLang, setNewFormLang] = useState<"bilingual" | "ta" | "en">("bilingual");
  const [newFormType, setNewFormType] = useState<"online" | "pdf">("pdf");
  const [newFormUrl, setNewFormUrl] = useState("");
  const [newFormVersion, setNewFormVersion] = useState("v1.0");

  // Admin Version Control States
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versioningForm, setVersioningForm] = useState<EForm | null>(null);
  const [newVersionString, setNewVersionString] = useState("");
  const [versionChangeLog, setVersionChangeLog] = useState("");

  // Form Builder field interface
  interface FormField {
    id: string;
    label: string;
    labelEn: string;
    type: "text" | "number" | "date" | "dropdown" | "file";
    required: boolean;
    options?: string[];
    autoFillFrom?: "memberName" | "memberId" | "memberPhone" | "district";
  }

  // Smart Form Builder States
  const [builderFields, setBuilderFields] = useState<FormField[]>([
    { id: "bf_1", label: "உறுப்பினர் பெயர்", labelEn: "Member Name", type: "text", required: true, autoFillFrom: "memberName" },
    { id: "bf_2", label: "உறுப்பினர் எண்", labelEn: "Member ID / Reg No", type: "text", required: true, autoFillFrom: "memberId" },
    { id: "bf_3", label: "கைபேசி எண்", labelEn: "Mobile Number", type: "text", required: true, autoFillFrom: "memberPhone" },
    { id: "bf_4", label: "மாவட்டம்", labelEn: "District", type: "dropdown", required: true, options: ["சென்னை", "மதுரை", "கோயம்புத்தூர்", "திருச்சிராப்பள்ளி", "சேலம்"], autoFillFrom: "district" },
    { id: "bf_5", label: "வங்கி கணக்கு எண்", labelEn: "Bank Account Number", type: "number", required: true },
    { id: "bf_6", label: "ஐஎஃப்எஸ்சி குறியீடு", labelEn: "IFSC Code", type: "text", required: true },
    { id: "bf_7", label: "தொழில் சான்றிதழ் நகல் (PDF/JPG)", labelEn: "Employment Certificate Copy (PDF/JPG)", type: "file", required: true }
  ]);

  // Form Builder state triggers
  const [builderFieldNameTa, setBuilderFieldNameTa] = useState("");
  const [builderFieldNameEn, setBuilderFieldNameEn] = useState("");
  const [builderFieldType, setBuilderFieldType] = useState<"text" | "number" | "date" | "dropdown" | "file">("text");
  const [builderFieldRequired, setBuilderFieldRequired] = useState(true);
  const [builderFieldAutoFill, setBuilderFieldAutoFill] = useState<"None" | "memberName" | "memberId" | "memberPhone" | "district">("None");
  const [builderFieldOptions, setBuilderFieldOptions] = useState("");
  const [enableAutoFillPreview, setEnableAutoFillPreview] = useState(true);

  // Dynamic preview simulation state
  const [simulatedValues, setSimulatedValues] = useState<{ [key: string]: string }>({});
  const [isBuilderPublishing, setIsBuilderPublishing] = useState(false);
  const [isFormDownloading, setIsFormDownloading] = useState<string | null>(null);

  const schemes: SchemeCategory[] = [
    {
      id: "scheme_1",
      title: "1. புதிய நலவாரியப் பதிவு",
      titleEn: "1. New Welfare Registration",
      amount: "அரசு நலவாரிய அட்டை",
      amountEn: "Welfare Board Smart ID",
      desc: "கட்டுமானத் தொழிலாளர் நலவாரியத்தில் புதிய உறுப்பினராகப் பதிந்து சலுகைகளைப் பெறுதல்.",
      descEn: "Initial enrollment for professional painters in the TN Construction Workers Welfare Board.",
      documents: ["புகைப்படம்", "ஆதார் அட்டை நகல்", "தொழில் சான்றிதழ்", "வங்கி கணக்கு புத்தக நகல்"],
      documentsEn: ["Passport Photo", "Aadhaar Card Copy", "Employment Certificate", "Bank Passbook Frontpage"],
      icon: <Award className="w-5 h-5 text-red-600" />
    },
    {
      id: "scheme_2",
      title: "2. நலவாரியப் புதுப்பித்தல்",
      titleEn: "2. Welfare Renewal",
      amount: "3 ஆண்டு கால நீட்டிப்பு",
      amountEn: "3 Years Validity Extension",
      desc: "நலவாரியப் பதிவை காலாவதியாகும் முன் புதுப்பித்து தொடர்ச்சியான நலநிதிகளைப் பாதுகாத்தல்.",
      descEn: "Periodic renewal of welfare membership to keep eligibility active without breaks.",
      documents: ["நலவாரிய அட்டை நகல்", "ஆதார் நகல்", "கடந்த 3 ஆண்டு சந்தா செலுத்திய ரசீது"],
      documentsEn: ["Existing Welfare ID Copy", "Aadhaar Copy", "Last 3 years subscription receipt"],
      icon: <RefreshCw className="w-5 h-5 text-amber-600" />
    },
    {
      id: "scheme_3",
      title: "3. குடும்ப உறுப்பினர் பதிவு",
      titleEn: "3. Family Member Registration",
      amount: "குடும்பப் பாதுகாப்பு உதவி",
      amountEn: "Family Care & Security Support",
      desc: "உறுப்பினரின் குடும்ப விபரங்களை நலவாரிய கோப்புகளில் இணைத்து குடும்ப நிதிகளை உறுதி செய்தல்.",
      descEn: "Registering spouse and children in union files to secure family benefits and nominations.",
      documents: ["குடும்ப அட்டை (Ration Card)", "குடும்ப உறுப்பினர்களின் ஆதார்", "பிறப்புச் சான்றுகள்"],
      documentsEn: ["Ration Card Copy", "Aadhaar of family members", "Birth certificates of children"],
      icon: <User className="w-5 h-5 text-stone-900" />
    },
    {
      id: "scheme_4",
      title: "4. கல்வி நிதியுதவி",
      titleEn: "4. Education Assistance",
      amount: "₹1,000 முதல் ₹8,000 வரை",
      amountEn: "₹1,000 to ₹8,000 Grant",
      desc: "6-ஆம் வகுப்பு முதல் பட்டப்படிப்பு வரை பயிலும் தொழிலாளர்களின் பிள்ளைகளுக்கான கல்வித் தொகை.",
      descEn: "Annual financial grants for school-going and college-going children of active painters.",
      documents: ["முந்தைய ஆண்டு மதிப்பெண் சான்றிதழ்", "நடப்பு ஆண்டு கல்விச் சேர்க்கை கட்டண ரசீது", "பள்ளி/கல்லூரி அடையாள அட்டை"],
      documentsEn: ["Previous Year Marksheet", "Current Year Fee Receipt", "School/College ID Card"],
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />
    },
    {
      id: "scheme_5",
      title: "5. திருமண நிதியுதவி",
      titleEn: "5. Marriage Assistance",
      amount: "₹20,000 வரை",
      amountEn: "Up to ₹20,000 Grant",
      desc: "உறுப்பினர்கள் அல்லது அவர்களின் பிள்ளைகளின் திருமணச் செலவுகளுக்கு வழங்கப்படும் நிதியுதவி.",
      descEn: "Financial support for the marriage of members or their registered children.",
      documents: ["திருமண அழைப்பிதழ்", "மணமகன்/மணமகள் ஆதார் நகல்", "திருமணப் பதிவுச் சான்றிதழ்"],
      documentsEn: ["Wedding Invitation Card", "Aadhaar of Bride & Groom", "Marriage Registration Certificate"],
      icon: <Heart className="w-5 h-5 text-red-500" />
    },
    {
      id: "scheme_6",
      title: "6. மகப்பேறு நிதியுதவி",
      titleEn: "6. Maternity Assistance",
      amount: "₹6,000 வரை",
      amountEn: "Up to ₹6,000 Assistance",
      desc: "பெண் தொழிலாளர்களுக்கு மகப்பேறு காலத்திலும் அல்லது ஆண் தொழிலாளர்களின் மனைவிக்கு வழங்கப்படும் உதவி.",
      descEn: "Financial support and nutrition assistance during pregnancy and post-natal care.",
      documents: ["மருத்துவமனை பேறுகாலச் சான்றிதழ்", "குழந்தையின் பிறப்புச் சான்றிதழ்", "தாய் சேய் நல அட்டை நகல்"],
      documentsEn: ["Hospital Discharge Summary", "Child Birth Certificate", "Mother-Child Health Card Copy"],
      icon: <Smile className="w-5 h-5 text-amber-500" />
    },
    {
      id: "scheme_7",
      title: "7. மருத்துவ நிதியுதவி",
      titleEn: "7. Medical Assistance",
      amount: "₹50,000 வரை",
      amountEn: "Up to ₹50,000 coverage",
      desc: "தீவிர நோய்களுக்கான அறுவை சிகிச்சை மற்றும் விபத்து கால மருத்துவச் செலவுகளுக்கான உதவித் தொகை.",
      descEn: "Reimbursement and direct grants for major surgery, illness, or critical medical treatments.",
      documents: ["மருத்துவமனை பில் மற்றும் டிஸ்சார்ஜ் சீட்டு", "மருத்துவச் சான்றிதழ்", "மருந்துச் சீட்டுகள்"],
      documentsEn: ["Hospital Bills & Discharge Card", "Doctor Medical Certificate", "Prescription & Scan Copies"],
      icon: <Heart className="w-5 h-5 text-blue-600" />
    },
    {
      id: "scheme_8",
      title: "8. இயற்கை மரண நிதியுதவி",
      titleEn: "8. Natural Death Assistance",
      amount: "₹50,000",
      amountEn: "₹50,000 Fixed Assistance",
      desc: "உறுப்பினர் இயற்கை எய்தினால் அவரின் வாரிசுதாருக்கு வழங்கப்படும் ஈமச்சடங்கு மற்றும் மரண நிதியுதவி.",
      descEn: "Funeral expense coverage and natural demise lumpsum paid to the designated nominee.",
      documents: ["மரணச் சான்றிதழ் நகல்", "வாரிசுச் சான்றிதழ் (Legal Heir)", "வாரிசுதாரர் வங்கி விபரம் மற்றும் ஆதார்"],
      documentsEn: ["Death Certificate Copy", "Legal Heir Certificate", "Nominee Bank Passbook & Aadhaar"],
      icon: <Home className="w-5 h-5 text-stone-600" />
    },
    {
      id: "scheme_9",
      title: "9. விபத்து நிதியுதவி",
      titleEn: "9. Accident Assistance",
      amount: "₹1,00,000 முதல் ₹5,00,000 வரை",
      amountEn: "₹1,00,000 to ₹5,00,000 Grant",
      desc: "பணியின் போதோ அல்லது பொது இடங்களிலோ நேரிடும் விபத்து மரணம் மற்றும் உடல் ஊனங்களுக்கான நிவாரணம்.",
      descEn: "Immediate compensation and heavy insurance disburse for on-duty accident victims.",
      documents: ["காவல்துறை FIR நகல்", "அரசு மருத்துவமனை உடற்கூறு ஆய்வு அல்லது ஊனச் சான்றிதழ்", "சங்க அவசரக் கடிதம்"],
      documentsEn: ["Police FIR Copy", "Government Post-Mortem/Disability Sheet", "Union local verification letter"],
      icon: <ShieldAlert className="w-5 h-5 text-red-600" />
    },
    {
      id: "scheme_10",
      title: "10. ஓய்வூதியம்",
      titleEn: "10. Pension",
      amount: "மாதம் ₹1,000",
      amountEn: "₹1,000 Monthly Pension",
      desc: "60 வயது நிறைவடைந்த மூத்த வர்ணம் பூசும் தொழிலாளர்களுக்கு வழங்கப்படும் மாதந்திர ஓய்வூதியம்.",
      descEn: "Retirement pension for veteran painters who have crossed 60 years and completed 3 years registration.",
      documents: ["வயதுச் சான்றிதழ் நகல்", "நலவாரிய அட்டை", "வாழ்க்கைச் சான்றிதழ் (Life Certificate)"],
      documentsEn: ["Age Proof Copy", "Welfare Board Smart Card", "Life Certificate from Gazetted Officer"],
      icon: <Clock className="w-5 h-5 text-stone-800" />
    },
    {
      id: "scheme_11",
      title: "11. உபகரணங்கள் வாங்க நிதியுதவி",
      titleEn: "11. Tool Purchase Assistance",
      amount: "₹5,000",
      amountEn: "₹5,000 Grant",
      desc: "தொழில் செய்ய ஏதுவாக நவீன ஸ்ப்ரே பெயிண்டிங், பிரஷ்கள், மற்றும் ஏணிகள் வாங்க வழங்கப்படும் நிதியுதவி.",
      descEn: "Assistance to buy advanced commercial paint sprayers, safety harnesses, brushes, and ladders.",
      documents: ["வாங்கிய உபகரணங்களின் பில் நகல்", "சங்க தொழில் நேர்முகச் சான்றிதழ்"],
      documentsEn: ["Purchase Bill/Quotation Copy", "Local Union President certification"],
      icon: <Briefcase className="w-5 h-5 text-amber-700" />
    },
    {
      id: "scheme_12",
      title: "12. கல்வி உதவித்தொகை",
      titleEn: "12. Scholarship",
      amount: "₹15,000 வரை",
      amountEn: "Up to ₹15,000 Scholarship",
      desc: "தொழில்நுட்பக் கல்வி (ITI, Diploma), பொறியியல், மற்றும் மருத்துவப் படிப்புகளில் சேரும் பிள்ளைகளுக்கு சிறப்பு கல்வித்தொகை.",
      descEn: "Special premium merit scholarships for children entering engineering, arts, or medicine.",
      documents: ["கல்லூரி சேர்க்கை கடிதம்", "முந்தைய மதிப்பெண் பட்டியல்", "கட்டண ரசீது நகல்கள்"],
      documentsEn: ["College Admission Letter", "Consolidated Marksheet Copy", "Fee Payment Receipts"],
      icon: <GraduationCap className="w-5 h-5 text-emerald-700" />
    },
    {
      id: "scheme_13",
      title: "13. மாற்றுத்திறனாளி நிதியுதவி",
      titleEn: "13. Disability Assistance",
      amount: "₹1,00,000 வரை",
      amountEn: "Up to ₹1,00,000 aid",
      desc: "பகுதி அல்லது முழு உடல் மாற்றுத்திறனாக மாறும் தொழிலாளர்களுக்கான வாழ்வாதார உதவித் தொகைகள்.",
      descEn: "Special grants and monthly disability pensions for members facing medical impairments.",
      documents: ["மாற்றுத்திறனாளி அடையாள அட்டை நகல்", "மருத்துவக் குழுவின் சான்றிதழ்"],
      documentsEn: ["Disability ID Card Copy", "Medical Board Certificate with disability %"],
      icon: <Award className="w-5 h-5 text-blue-500" />
    },
    {
      id: "scheme_14",
      title: "14. அவசர கால நிவாரணம்",
      titleEn: "14. Emergency Relief",
      amount: "₹10,000 வரை",
      amountEn: "Up to ₹10,000 relief",
      desc: "வெள்ளம், புயல், தீவிபத்து மற்றும் பெருந்தொற்று காலங்களில் வழங்கப்படும் அவசரகால வாழ்வாதார உதவித்தொகை.",
      descEn: "Disaster financial aid for members affected by floods, fire, storm, or pandemics.",
      documents: ["வருவாய் துறையினரின் சேத மதிப்பீட்டு நகல் / கிராம நிர்வாக அதிகாரி சான்றிதழ்"],
      documentsEn: ["Revenue Dept Damage Assessment / Village Administrative Officer letter"],
      icon: <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
    },
    {
      id: "scheme_15",
      title: "15. இதர நலவாரியச் சேவைகள்",
      titleEn: "15. Other Welfare Services",
      amount: "திட்டத்தின் அடிப்படையில்",
      amountEn: "Based on specific request",
      desc: "சங்கத்தின் சிறப்புத் தீர்மானங்களின்படி வழங்கப்படும் இதர சலுகைகள் மற்றும் வழிகாட்டுதல்கள்.",
      descEn: "Custom claims, legal help, or miscellaneous union-funded support on special cases.",
      documents: ["விண்ணப்பக் கடிதம்", "ஆதரவு ஆவணங்கள்"],
      documentsEn: ["Detailed Request Letter", "Supporting Proof Documents"],
      icon: <FileText className="w-5 h-5 text-stone-700" />
    }
  ];

  // ==========================================
  // E-FORM LIBRARY HANDLERS
  // ==========================================
  const handleOpenCreateForm = () => {
    setEditingForm(null);
    setNewFormName("");
    setNewFormNameEn("");
    setNewFormCategory("Welfare Registration");
    setNewFormLang("bilingual");
    setNewFormType("pdf");
    setNewFormUrl("");
    setNewFormVersion("v1.0");
    setShowFormModal(true);
  };

  const handleOpenEditForm = (form: EForm) => {
    setEditingForm(form);
    setNewFormName(form.name);
    setNewFormNameEn(form.nameEn);
    setNewFormCategory(form.category);
    setNewFormLang(form.lang);
    setNewFormType(form.type);
    setNewFormUrl(form.downloadUrl);
    setNewFormVersion(form.version);
    setShowFormModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormName.trim() || !newFormNameEn.trim()) {
      alert(lang === "ta" ? "படிவப் பெயரை உள்ளிடவும்!" : "Please enter form name!");
      return;
    }

    if (editingForm) {
      // Edit form
      const updated = eForms.map((f) => {
        if (f.id === editingForm.id) {
          const isVersionChanged = f.version !== newFormVersion;
          const newHistory = isVersionChanged 
            ? [{ version: newFormVersion, date: new Date().toISOString().split("T")[0], change: `Metadata modified & version bumped from ${f.version} to ${newFormVersion}` }, ...f.history]
            : f.history;

          return {
            ...f,
            name: newFormName,
            nameEn: newFormNameEn,
            category: newFormCategory,
            lang: newFormLang,
            type: newFormType,
            downloadUrl: newFormUrl || "#",
            version: newFormVersion,
            history: newHistory,
            lastUpdated: new Date().toISOString().split("T")[0]
          };
        }
        return f;
      });
      setEForms(updated);
      onAddAuditLog(
        "Welfare E-Form Modified",
        `E-Form "${newFormNameEn}" (ID: ${editingForm.id}) was modified by Super Admin.`
      );
      alert(lang === "ta" ? "படிவத் தகவல்கள் புதுப்பிக்கப்பட்டன!" : "Form updated successfully!");
    } else {
      // Create form
      const newId = `form_custom_${Date.now()}`;
      const created: EForm = {
        id: newId,
        name: newFormName,
        nameEn: newFormNameEn,
        category: newFormCategory,
        version: newFormVersion,
        status: "active",
        lang: newFormLang,
        type: newFormType,
        downloadUrl: newFormUrl || "#",
        lastUpdated: new Date().toISOString().split("T")[0],
        history: [
          { version: newFormVersion, date: new Date().toISOString().split("T")[0], change: "Form template published initially." }
        ]
      };
      setEForms([created, ...eForms]);
      onAddAuditLog(
        "Welfare E-Form Created",
        `New E-Form template "${newFormNameEn}" was uploaded to the digital library.`
      );
      alert(lang === "ta" ? "புதிய படிவம் நூலகத்தில் சேர்க்கப்பட்டது!" : "New form successfully uploaded to the library!");
    }
    setShowFormModal(false);
  };

  const handleArchiveForm = (formId: string, archive: boolean) => {
    const updated = eForms.map((f) => {
      if (f.id === formId) {
        return { ...f, status: (archive ? "archived" : "active") as "active" | "archived" };
      }
      return f;
    });
    setEForms(updated);
    const formObj = eForms.find((f) => f.id === formId);
    onAddAuditLog(
      archive ? "Welfare E-Form Archived" : "Welfare E-Form Restored",
      `Form "${formObj?.nameEn}" was ${archive ? "archived" : "restored"}.`
    );
    alert(
      lang === "ta" 
        ? (archive ? "படிவம் காப்பகப்படுத்தப்பட்டது (Archived)!" : "படிவம் மீண்டும் பயன்பாட்டிற்கு கொண்டுவரப்பட்டது!")
        : (archive ? "Form template archived successfully!" : "Form template successfully restored!")
    );
  };

  const handleOpenVersionModal = (form: EForm) => {
    setVersioningForm(form);
    setNewVersionString(incrementMinorVersion(form.version));
    setVersionChangeLog("");
    setShowVersionModal(true);
  };

  const incrementMinorVersion = (ver: string) => {
    const parts = ver.replace("v", "").split(".");
    if (parts.length >= 2) {
      const minor = parseInt(parts[1], 10);
      return `v${parts[0]}.${minor + 1}`;
    }
    return `${ver}.1`;
  };

  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versioningForm || !newVersionString.trim() || !versionChangeLog.trim()) {
      alert(lang === "ta" ? "விபரங்களை முழுமையாக நிரப்பவும்!" : "Please fill out all fields!");
      return;
    }

    const updated = eForms.map((f) => {
      if (f.id === versioningForm.id) {
        return {
          ...f,
          version: newVersionString,
          lastUpdated: new Date().toISOString().split("T")[0],
          history: [
            { version: newVersionString, date: new Date().toISOString().split("T")[0], change: versionChangeLog },
            ...f.history
          ]
        };
      }
      return f;
    });
    setEForms(updated);
    onAddAuditLog(
      "Welfare E-Form Version Update",
      `E-Form "${versioningForm.nameEn}" version updated to ${newVersionString}. Change: ${versionChangeLog}`
    );
    alert(lang === "ta" ? "படிவ பதிப்பு எண் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!" : "Form version upgraded and change log saved!");
    setShowVersionModal(false);
  };

  const handleDownloadFormTemplate = (form: EForm) => {
    setIsFormDownloading(form.id);
    setTimeout(() => {
      setIsFormDownloading(null);
      alert(
        lang === "ta"
          ? `மின்னணு படிவம் வெற்றிகரமாக கணினியில் பதிவிறக்கப்பட்டது! கோப்பு: ${form.nameEn}_${form.version}.pdf`
          : `E-Form Template downloaded successfully to local storage! Target: ${form.nameEn}_${form.version}.pdf`
      );
    }, 2000);
  };

  // ==========================================
  // SMART FORM BUILDER HANDLERS
  // ==========================================
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderFieldNameTa.trim() || !builderFieldNameEn.trim()) {
      alert(lang === "ta" ? "புலப் பெயர்களை உள்ளிடவும்!" : "Please specify field names!");
      return;
    }

    const newField: FormField = {
      id: `bf_custom_${Date.now()}`,
      label: builderFieldNameTa,
      labelEn: builderFieldNameEn,
      type: builderFieldType,
      required: builderFieldRequired,
      autoFillFrom: builderFieldAutoFill === "None" ? undefined : builderFieldAutoFill,
      options: builderFieldType === "dropdown" && builderFieldOptions.trim()
        ? builderFieldOptions.split(",").map(o => o.trim())
        : undefined
    };

    setBuilderFields([...builderFields, newField]);
    
    // Reset add field states
    setBuilderFieldNameTa("");
    setBuilderFieldNameEn("");
    setBuilderFieldType("text");
    setBuilderFieldRequired(true);
    setBuilderFieldAutoFill("None");
    setBuilderFieldOptions("");

    onAddAuditLog(
      "Smart Form Field Added",
      `Added custom field "${newField.labelEn}" to active builder configuration.`
    );
  };

  const handleRemoveField = (fieldId: string) => {
    // Prevent removing critical fields like Member Name or ID
    const field = builderFields.find(f => f.id === fieldId);
    if (fieldId === "bf_1" || fieldId === "bf_2") {
      alert(
        lang === "ta"
          ? "இந்த முக்கியமான புலத்தை நீக்க முடியாது! இது உறுப்பினர் விபரங்களை சரிபார்க்க அவசியம்."
          : "Cannot delete this core field! It is required to bind and authorize member accounts."
      );
      return;
    }

    setBuilderFields(builderFields.filter((f) => f.id !== fieldId));
    onAddAuditLog(
      "Smart Form Field Removed",
      `Removed field "${field?.labelEn}" from active builder configuration.`
    );
  };

  const handlePublishBuilderTemplate = () => {
    setIsBuilderPublishing(true);
    setTimeout(() => {
      const templateNameTa = lang === "ta" ? "தானியங்கி படிவ வடிவமைப்பாளர் படிவம்" : "Intelligent Form Builder Template";
      const templateNameEn = "Intelligent Form Builder Template - Active Layout";
      const customFormId = `form_builder_${Date.now()}`;
      
      const publishedForm: EForm = {
        id: customFormId,
        name: templateNameTa,
        nameEn: templateNameEn,
        category: "Other Welfare Services",
        version: "v1.0",
        status: "active",
        lang: "bilingual",
        type: "online",
        downloadUrl: "#",
        lastUpdated: new Date().toISOString().split("T")[0],
        history: [
          { version: "v1.0", date: new Date().toISOString().split("T")[0], change: "Form built & synchronized from active Smart Form Builder layout." }
        ]
      };

      setEForms([publishedForm, ...eForms]);
      setIsBuilderPublishing(false);
      onAddAuditLog(
        "Smart Builder Layout Published",
        `Published interactive online template to digital E-Form library.`
      );
      alert(
        lang === "ta"
          ? "வாழ்த்துக்கள்! உங்கள் தனிப்பயன் படிவம் வெற்றிகரமாக நலவாரிய படிவ நூலகத்தில் வெளியிடப்பட்டது!"
          : "Success! Your customized smart form is now published directly inside the E-Form Library!"
      );
      // Switch view to e-forms
      toggleView("eforms");
    }, 1500);
  };

  const handleSimulateFieldChange = (fieldId: string, value: string) => {
    setSimulatedValues({
      ...simulatedValues,
      [fieldId]: value
    });
  };

  const handleTestBuilderSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation of required fields
    const missingFields: string[] = [];
    builderFields.forEach((field) => {
      const val = simulatedValues[field.id];
      // Resolve auto-fill preview fallback
      let isFilled = !!val;
      if (enableAutoFillPreview && field.autoFillFrom) {
        isFilled = true;
      }
      if (field.required && !isFilled) {
        missingFields.push(lang === "ta" ? field.label : field.labelEn);
      }
    });

    if (missingFields.length > 0) {
      alert(
        lang === "ta"
          ? `கீழே உள்ள கட்டாய புலங்களை நிரப்பவும்:\n${missingFields.join(", ")}`
          : `Please fill out these required fields:\n${missingFields.join(", ")}`
      );
      return;
    }

    // Build JSON output payload
    const payload: { [key: string]: any } = {};
    builderFields.forEach((field) => {
      let finalVal = simulatedValues[field.id] || "";
      if (enableAutoFillPreview && field.autoFillFrom) {
        if (field.autoFillFrom === "memberName") finalVal = currentUser?.name || "முத்துவேல் பாண்டியன்";
        if (field.autoFillFrom === "memberId") finalVal = currentUser?.regNumber || "TNP-2026-0812";
        if (field.autoFillFrom === "memberPhone") finalVal = currentUser?.phone || "9845210741";
        if (field.autoFillFrom === "district") finalVal = currentUser?.district || "சென்னை";
      }
      payload[field.labelEn] = finalVal;
    });

    onAddAuditLog(
      "Intelligent E-Form Submission Simulation",
      `Simulated successful extraction of ${builderFields.length} data parameters from interactive digital form.`
    );

    alert(
      (lang === "ta" ? "✓ ஸ்மார்ட் படிவம் வெற்றிகரமாக சரிபார்க்கப்பட்டது!\n\nபிரித்தெடுக்கப்பட்ட தரவு (JSON Extraction):\n" : "✓ Smart Form successfully compiled and submitted!\n\nExtracted Parameters (JSON Extraction):\n") +
      JSON.stringify(payload, null, 2)
    );
  };

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId);

  // File uploading handler simulator
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // FileReader to load local image
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (fileType === "photo") {
        setPhotoFile(base64);
        setPhotoName(file.name);
      } else if (fileType === "id") {
        setIdFile(base64);
        setIdName(file.name);
      } else if (fileType === "address") {
        setAddressFile(base64);
        setAddressName(file.name);
      } else if (fileType === "cert") {
        setCertFile(base64);
        setCertName(file.name);
      } else if (fileType === "support") {
        setSupportFile(base64);
        setSupportName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;
    if (!memberId.trim() || !memberName.trim() || !memberPhone.trim() || !description.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து அனைத்து கட்டாய புலங்களையும் நிரப்பவும்!" : "Please fill out all mandatory fields!");
      return;
    }
    if (!declaration) {
      alert(lang === "ta" ? "தயவுசெய்து உறுதிமொழி பெட்டியை தேர்வு செய்யவும்!" : "You must accept the declaration to proceed!");
      return;
    }

    // 45-Day Welfare Board Registration Rule Validation
    const matchedReg = registrations.find(r => r.regNumber === memberId || r.id === memberId || r.phone === memberPhone);
    const cardIssueDateStr = matchedReg?.createdAt || new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const cardIssueTimestamp = new Date(cardIssueDateStr).getTime();
    const elapsedDays = Math.floor((Date.now() - cardIssueTimestamp) / (1000 * 60 * 60 * 24));
    const isEligible45Days = elapsedDays >= 45;

    if (!isEligible45Days) {
      alert(
        lang === "ta"
          ? `⚠️ நல வாரியப் பதிவு விதிமுறை மீறல்: உறுப்பினர் அட்டை பெற்று 45 நாட்களுக்குப் பிறகே நல வாரியத்தில் பதிவு செய்ய வேண்டும். தற்போது ${elapsedDays} நாட்களே ஆகியுள்ளன (இன்னும் ${45 - elapsedDays} நாட்கள் காத்திருக்க வேண்டும்).`
          : `⚠️ Welfare Board Rule: Registration is permitted only 45 days after membership card issuance. Only ${elapsedDays} days have passed (please wait ${45 - elapsedDays} more days).`
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (editingAppId) {
        // We are editing an existing application (Correction Workflow)
        const updatedApp: WelfareApplication = {
          id: editingAppId,
          memberId,
          memberName,
          memberPhone,
          schemeId: selectedScheme.id,
          schemeTitle: selectedScheme.title,
          schemeTitleEn: selectedScheme.titleEn,
          amount: selectedScheme.amountEn,
          appliedAt: new Date().toISOString().split("T")[0],
          status: "pending", // Reset to pending review
          district,
          remarks: description,
          photoUrl: photoFile || undefined,
          identityDocUrl: idFile || undefined,
          addressProofUrl: addressFile || undefined,
          certificateUrl: certFile || undefined,
          supportingDocUrl: supportFile || undefined,
          declarationAccepted: true,
          history: [
            ...(welfareApps.find(a => a.id === editingAppId)?.history || []),
            {
              status: "pending",
              date: new Date().toLocaleDateString(),
              remarks: `Resubmitted with modifications: ${description}`
            }
          ]
        };

        if (onUpdateWelfareApp) {
          onUpdateWelfareApp(updatedApp);
        }
        onAddAuditLog(
          "Welfare Application Resubmitted",
          `Member ${memberName} (${memberId}) resubmitted claim for ${selectedScheme.titleEn} after correction request.`
        );
        alert(
          lang === "ta"
            ? "உங்கள் திருத்தப்பட்ட விண்ணப்பம் வெற்றிகரமாக மீண்டும் சமர்ப்பிக்கப்பட்டது! மாநில பொதுச்செயலாளருக்கு அறிவிக்கப்பட்டது."
            : "Your modified application has been successfully resubmitted! State General Secretary notified."
        );
      } else {
        // Create brand new application
        const newApp: WelfareApplication = {
          id: `w_app_${Date.now()}`,
          memberId,
          memberName,
          memberPhone,
          schemeId: selectedScheme.id,
          schemeTitle: selectedScheme.title,
          schemeTitleEn: selectedScheme.titleEn,
          amount: selectedScheme.amountEn,
          appliedAt: new Date().toISOString().split("T")[0],
          status: "pending",
          district,
          remarks: description,
          photoUrl: photoFile || undefined,
          identityDocUrl: idFile || undefined,
          addressProofUrl: addressFile || undefined,
          certificateUrl: certFile || undefined,
          supportingDocUrl: supportFile || undefined,
          declarationAccepted: true,
          history: [
            {
              status: "pending",
              date: new Date().toLocaleDateString(),
              remarks: "Application initially compiled online & submitted to Super Admin."
            }
          ]
        };

        onAddWelfareApp(newApp);
        onAddAuditLog(
          "Welfare Application Submitted",
          `Member ${memberName} (${memberId}) submitted a new claim for ${selectedScheme.titleEn}. Status: Pending Review.`
        );
        alert(
          lang === "ta"
            ? "விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! பரிசீலனைக்குப் பின் மாநிலப் பொதுச்செயலாளர் ஒப்புதல் வழங்குவார்."
            : "Application submitted successfully! Review and approval will be managed by the State General Secretary."
        );
      }

      // Reset form states
      setDescription("");
      setPhotoFile(null);
      setPhotoName(null);
      setIdFile(null);
      setIdName(null);
      setAddressFile(null);
      setAddressName(null);
      setCertFile(null);
      setCertName(null);
      setSupportFile(null);
      setSupportName(null);
      setDeclaration(false);
      setSelectedSchemeId(null);
      setEditingAppId(null);
      setIsSubmitting(false);
      setShowTracker(true); // Direct user to tracking panel to see their progress!
    }, 1500);
  };

  const handleEditCorrection = (app: WelfareApplication) => {
    setEditingAppId(app.id);
    setSelectedSchemeId(app.schemeId);
    setMemberId(app.memberId);
    setMemberName(app.memberName);
    setMemberPhone(app.memberPhone);
    setDistrict(app.district);
    setDescription(app.remarks || "");
    setDeclaration(true);
    
    // Seed preview if already present
    if (app.photoUrl) setPhotoFile(app.photoUrl);
    if (app.identityDocUrl) setIdFile(app.identityDocUrl);
    if (app.addressProofUrl) setAddressFile(app.addressProofUrl);
    if (app.certificateUrl) setCertFile(app.certificateUrl);
    if (app.supportingDocUrl) setSupportFile(app.supportingDocUrl);
    
    setShowTracker(false); // Open form
    alert(
      lang === "ta"
        ? "தயவுசெய்து திருத்தங்களைக் கவனித்து சமர்ப்பிக்கவும்."
        : "Loaded into editor! Please address the requested changes and submit."
    );
  };

  const filteredMyClaims = welfareApps.filter((app) => {
    // If logged in as member, only show their claims. If guest, let them search by member id or mobile
    if (currentUser && currentUser.role === "member") {
      return app.memberId === (currentUser.regNumber || currentUser.id) || app.memberPhone === currentUser.phone;
    }
    // Visitor search
    if (trackSearch.trim()) {
      const q = trackSearch.toLowerCase();
      return (
        app.memberId.toLowerCase().includes(q) || 
        app.memberPhone.includes(q) || 
        app.memberName.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q)
      );
    }
    return true; // Show all to guests if no search query (so they can explore tracking easily)
  });

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-md p-6 space-y-6 text-left">
      
      {/* HEADER SECTION */}
      <div className="border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[#b91c1c] font-black text-xs uppercase tracking-wider block">
            {lang === "ta" ? "நலவாரிய விண்ணப்ப மேலாண்மை" : "WELFARE BOARD SYSTEM WORKFLOW"}
          </span>
          <h2 className="text-xl font-black text-stone-900 mt-1">
            {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் நலவாரிய சேவை மையம்" : "TN Painters and Artists Welfare Board Portal"}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {lang === "ta" 
              ? "சங்க உறுப்பினர்களுக்கான 15 வகையான அரசு மற்றும் சங்க நலத்திட்ட விண்ணப்பங்கள் சமர்ப்பிக்கும் தளம்." 
              : "Bilingual digital workflow to prepare, submit, and track welfare applications. Super Admin controlled."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              toggleView("services");
              setSelectedSchemeId(null);
              setEditingAppId(null);
            }}
            className={`px-3 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
              activeView === "services" && !selectedSchemeId ? "bg-stone-900 text-amber-400" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            📋 {lang === "ta" ? "சேவைகள்" : "Services"}
          </button>
          
          <button
            onClick={() => toggleView("tracker")}
            className={`px-3 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
              activeView === "tracker" ? "bg-[#b91c1c] text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            🔍 {lang === "ta" ? "கண்காணிப்பு" : "Track Claim"}
          </button>

          <button
            onClick={() => toggleView("eforms")}
            className={`px-3 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
              activeView === "eforms" ? "bg-stone-900 text-amber-400" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            📂 {lang === "ta" ? "படிவ நூலகம்" : "E-Form Library"}
          </button>

          <button
            onClick={() => toggleView("builder")}
            className={`px-3 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
              activeView === "builder" ? "bg-[#b91c1c] text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            ⚙️ {lang === "ta" ? "வடிவமைப்பாளர்" : "Form Builder"}
          </button>

          <button
            onClick={() => toggleView("schemes_aggregator")}
            className={`px-3 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
              activeView === "schemes_aggregator" ? "bg-amber-500 text-stone-950" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            🏛️ {lang === "ta" ? "அரசு திட்டங்கள் ஏஜென்ட்" : "Govt Schemes AI"}
          </button>
        </div>
      </div>

      {/* TRACKER VIEW */}
      {showTracker && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h3 className="text-sm font-extrabold text-stone-800">
              {lang === "ta" ? "விண்ணப்ப நிலவரம் கண்காணிப்பு" : "Application Progress Tracker Ledger"}
            </h3>

            {!currentUser && (
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder={lang === "ta" ? "ID, கைபேசி எண் அல்லது பெயர் கொண்டு தேட..." : "Search by ID, Phone or Name..."}
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            )}
          </div>

          {filteredMyClaims.length === 0 ? (
            <div className="p-8 bg-stone-50 border border-dashed text-center rounded-2xl text-xs text-stone-400 space-y-2">
              <p>{lang === "ta" ? "சமர்ப்பிக்கப்பட்ட விண்ணப்பங்கள் எதுவும் கண்டறியப்படவில்லை." : "No submitted welfare applications found matching your credentials."}</p>
              {!currentUser && <p className="text-[10px] text-stone-500">{lang === "ta" ? "மேலே உள்ள தேடல் பெட்டியில் உங்கள் மொபைல் எண் அல்லது பெயரை உள்ளிட்டு தேடலாம்." : "Enter your mobile number or name in the search box to check status."}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMyClaims.map((claim, idx) => (
                <div key={`wb_claim_${claim.id}_${idx}`} className="p-5 border border-stone-200 rounded-2xl bg-stone-50 space-y-4">
                  
                  {/* Claim Metadata Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-stone-200/50 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block">App No: {claim.id}</span>
                      <h4 className="font-extrabold text-stone-900 text-sm mt-0.5">{lang === "ta" ? claim.schemeTitle : claim.schemeTitleEn}</h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {lang === "ta" ? "விண்ணப்பதாரர்:" : "Applicant:"} <strong>{claim.memberName} ({claim.memberId})</strong> | 📍 {claim.district}
                      </p>
                    </div>

                    <div className="text-right">
                      {claim.status === "pending" && (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full font-black text-[9px] tracking-wide inline-block animate-pulse">
                          ● PENDING REVIEW
                        </span>
                      )}
                      {claim.status === "under_review" && (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-black text-[9px] tracking-wide inline-block">
                          ● UNDER GENERAL SECRETARY REVIEW
                        </span>
                      )}
                      {claim.status === "approved" && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[9px] tracking-wide inline-block">
                          ✓ APPROVED & DISBURSED ({claim.amount})
                        </span>
                      )}
                      {claim.status === "rejected" && (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-black text-[9px] tracking-wide inline-block">
                          ✕ REJECTED
                        </span>
                      )}
                      {claim.status === "needs_correction" && (
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-900 rounded-full font-black text-[9px] tracking-wide inline-block border border-orange-200">
                          ⚠️ ACTION REQUIRED: CORRECTION REQUESTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remarks and description block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-150">
                      <span className="text-[10px] text-stone-400 uppercase font-black block">Application Brief Description</span>
                      <p className="text-stone-700 leading-relaxed font-medium">{claim.remarks || "No remarks provided."}</p>
                    </div>

                    <div className="space-y-2">
                      {/* Show correction remarks if flagged */}
                      {claim.status === "needs_correction" && claim.correctionRemarks && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-2">
                          <span className="font-extrabold text-[11px] block text-stone-900">⚠️ Super Admin Remarks for Correction:</span>
                          <p className="leading-relaxed text-[11px] text-amber-950 font-semibold">{claim.correctionRemarks}</p>
                          
                          <button
                            onClick={() => handleEditCorrection(claim)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-[10px] rounded-lg mt-1 transition-all cursor-pointer"
                          >
                            ✏️ Edit & Resubmit Form
                          </button>
                        </div>
                      )}

                      {/* Display dates */}
                      <div className="text-[11px] text-stone-500 space-y-1 mt-1 leading-relaxed">
                        <span>📅 Applied On: <strong>{claim.appliedAt}</strong></span>
                        {claim.approvalDate && <span className="block text-emerald-700">✓ Approval Date: <strong>{claim.approvalDate}</strong></span>}
                      </div>
                    </div>
                  </div>

                  {/* History timeline */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-150 text-[11px] space-y-2 text-stone-600">
                    <span className="font-extrabold text-stone-800 text-[10px] block uppercase tracking-wider">Application History Logs</span>
                    <div className="space-y-2 border-l-2 border-stone-100 pl-3">
                      {claim.history && claim.history.map((hist, idx) => (
                        <div key={idx} className="relative py-1">
                          <div className="absolute -left-[17px] top-2 h-2 w-2 rounded-full bg-stone-300" />
                          <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                            <span>{hist.date}</span>
                            <span className="uppercase text-stone-500 font-extrabold">{hist.status}</span>
                          </div>
                          <p className="mt-0.5 text-stone-700 font-medium">{hist.remarks}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAILED FORM VIEW (WHEN A SERVICE IS SELECTED) */}
      {!showTracker && selectedSchemeId && selectedScheme && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Back to Listing */}
          <button
            onClick={() => {
              setSelectedSchemeId(null);
              setEditingAppId(null);
              setDescription("");
            }}
            className="text-xs text-[#b91c1c] font-black flex items-center gap-1 hover:underline cursor-pointer"
          >
            ← {lang === "ta" ? "சேவைகள் பட்டியலுக்குத் திரும்புக" : "Back to Welfare Schemes Listing"}
          </button>

          {/* Scheme Banner */}
          <div className="p-4 bg-stone-900 text-white rounded-2xl flex items-center gap-3 border-l-4 border-amber-500">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
              {selectedScheme.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest block text-amber-400 uppercase">
                {lang === "ta" ? "நிவாரண தொகை / பலன்கள்:" : "Assistance / Benefit Amount:"} {lang === "ta" ? selectedScheme.amount : selectedScheme.amountEn}
              </span>
              <h3 className="font-extrabold text-sm md:text-base mt-0.5">{lang === "ta" ? selectedScheme.title : selectedScheme.titleEn}</h3>
            </div>
          </div>

          {/* 45-Day Welfare Board Rule Calculation Banner */}
          {(() => {
            const matchedReg = registrations.find(r => r.regNumber === memberId || r.id === memberId || r.phone === memberPhone);
            const cardIssueDateStr = matchedReg?.createdAt || new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
            const cardIssueTimestamp = new Date(cardIssueDateStr).getTime();
            const elapsedDays = Math.floor((Date.now() - cardIssueTimestamp) / (1000 * 60 * 60 * 24));
            const isEligible45Days = elapsedDays >= 45;
            const remainingDays = isEligible45Days ? 0 : (45 - elapsedDays);

            return (
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${isEligible45Days ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isEligible45Days ? 'bg-emerald-600 text-white' : 'bg-[#b91c1c] text-white'}`}>
                    {isEligible45Days ? '✓' : '45'}
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide">
                      {lang === "ta" ? "நல வாரியப் பதிவு 45 நாட்கள் விதி சரிபார்ப்பு" : "Welfare Board 45-Day Rule Compliance"}
                    </div>
                    <div className="text-xs font-bold mt-0.5">
                      {isEligible45Days ? (
                        lang === "ta" 
                          ? `உறுப்பினர் அட்டை பெற்று ${elapsedDays} நாட்கள் நிறைவு! நல வாரியத்தில் பதிவு செய்ய முழுத்தகுதி பெற்றுள்ளீர்கள்.`
                          : `Membership card issued ${elapsedDays} days ago. Fully eligible for Welfare Board registration.`
                      ) : (
                        lang === "ta"
                          ? `⚠️ அட்டை பெற்று 45 நாட்களுக்குப் பிறகே நல வாரியத்தில் பதிவு செய்ய முடியும். இன்னும் ${remainingDays} நாட்கள் காத்திருக்க வேண்டும்.`
                          : `⚠️ Welfare Board registration is allowed only 45 days after receiving the membership card. Please wait ${remainingDays} more days.`
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono font-bold bg-white/80 px-2.5 py-1 rounded-lg border">
                  {elapsedDays} / 45 Days
                </div>
              </div>
            );
          })()}

          {/* The form */}
          <form onSubmit={handleApply} className="space-y-5 bg-stone-50 border border-stone-200 p-5 rounded-2xl">
            <h4 className="font-black text-stone-800 text-xs border-b border-stone-200 pb-2 flex items-center gap-1">
              <User className="w-4.5 h-4.5 text-amber-600" />
              <span>{lang === "ta" ? "உறுப்பினர் மற்றும் திட்ட விபரங்கள்" : "Member & Application Specific Details"}</span>
            </h4>

            {editingAppId && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold leading-relaxed">
                ⚠️ {lang === "ta" ? "திருத்த விண்ணப்பப் பயன்முறை செயலில் உள்ளது" : "You are currently editing a rejected/correction-flagged application. Review previous super admin comments before resubmitting."}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Member ID */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">உறுப்பினர் எண் (Member ID / Reg No) *</label>
                <input
                  type="text"
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="e.g., TNP-2026-0034"
                  className="w-full px-3 py-2.5 border rounded-xl bg-white text-stone-800 font-medium"
                />
              </div>

              {/* Member Name */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">உறுப்பினர் பெயர் (Member Full Name) *</label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder={lang === "ta" ? "பெயரை உள்ளிடவும்" : "Applicant full name"}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white text-stone-800 font-medium"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">கைபேசி எண் (Mobile Number) *</label>
                <input
                  type="tel"
                  required
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  placeholder="e.g., 9876543210"
                  className="w-full px-3 py-2.5 border rounded-xl bg-white text-stone-800 font-medium"
                />
              </div>

              {/* District */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">மாவட்டம் (District) *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white text-stone-800 font-semibold cursor-pointer"
                >
                  {["சென்னை", "மதுரை", "கோயம்புத்தூர்", "திருச்சிராப்பள்ளி", "சேலம்", "நெல்லை", "தஞ்சாவூர்", "திண்டுக்கல்"].map((d, idx) => (
                    <option key={`wb_d_${d}_${idx}`} value={d}>{d}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Application Type */}
            <div className="text-xs">
              <label className="block font-bold text-stone-700 mb-1">விண்ணப்ப வகை (Application Type)</label>
              <input
                type="text"
                disabled
                value={lang === "ta" ? selectedScheme.title : selectedScheme.titleEn}
                className="w-full px-3 py-2.5 border rounded-xl bg-stone-100 text-stone-500 font-extrabold cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div className="text-xs">
              <label className="block font-bold text-stone-700 mb-1">{lang === "ta" ? "விண்ணப்பத்தின் விளக்கவுரை (Description) *" : "Application Detailed Description *"}</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  lang === "ta" 
                    ? "காரணங்களை தெளிவாக விவரிக்கவும். (திருமணத் தேதி, பிள்ளைகளின் வகுப்பு, விபத்து நிகழ்ந்த விபரம், வங்கி பெயர், ஐஎஃப்எஸ்சி குறியீடு முதலியன...)" 
                    : "Specify studying details, surgery date, critical reason for claim, bank account number & IFSC code..."
                }
                className="w-full p-3 border rounded-xl bg-white resize-none text-stone-800 font-medium leading-relaxed"
              />
            </div>

            {/* DOCUMENT UPLOAD SECTIONS */}
            <div className="space-y-4 border-t border-stone-200 pt-4">
              <h4 className="font-black text-stone-800 text-xs flex items-center gap-1">
                <Upload className="w-4.5 h-4.5 text-amber-600" />
                <span>{lang === "ta" ? "தேவையான ஆவணங்களை பதிவேற்றுக (Documents Upload)" : "Upload Required Supporting Documents"}</span>
              </h4>
              <p className="text-[10px] text-stone-500 leading-relaxed">
                {lang === "ta" 
                  ? "கீழே உள்ள ஆவணப் பெட்டிகளை அழுத்தி, உங்கள் கைபேசியிலிருந்து படங்களை உடனடியாகப் பதிவேற்றலாம். (jpg, jpeg, png, pdf வடிவங்கள் மட்டுமே)"
                  : "Touch or drag-and-drop file inside each block to capture documents. Files will display instant previews."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Passport Photo */}
                <div className="p-3 bg-white border rounded-xl flex flex-col justify-between hover:border-amber-400 transition-all text-xs">
                  <div>
                    <span className="font-bold text-stone-700 block">1. Photo (புகைப்படம்)</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">Passport size display image</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{photoName ? "Change" : "Upload File"}</span>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "photo")} className="hidden" />
                    </label>
                    {photoName && <span className="text-[10px] text-emerald-600 truncate font-mono font-semibold max-w-[120px]">{photoName}</span>}
                  </div>
                  {photoFile && <img src={photoFile} alt="Preview" className="mt-2.5 h-14 w-12 object-cover rounded border self-start shadow-inner" />}
                </div>

                {/* 2. Identity Documents */}
                <div className="p-3 bg-white border rounded-xl flex flex-col justify-between hover:border-amber-400 transition-all text-xs">
                  <div>
                    <span className="font-bold text-stone-700 block">2. Identity Documents (அடையாள அட்டை)</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">Aadhaar Card or Welfare Smart Card</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{idName ? "Change" : "Upload File"}</span>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "id")} className="hidden" />
                    </label>
                    {idName && <span className="text-[10px] text-emerald-600 truncate font-mono font-semibold max-w-[120px]">{idName}</span>}
                  </div>
                  {idFile && idFile.startsWith("data:image/") && <img src={idFile} alt="Preview" className="mt-2.5 h-12 w-20 object-cover rounded border self-start shadow-inner" />}
                </div>

                {/* 3. Address Proof */}
                <div className="p-3 bg-white border rounded-xl flex flex-col justify-between hover:border-amber-400 transition-all text-xs">
                  <div>
                    <span className="font-bold text-stone-700 block">3. Address Proof (முகவரிச் சான்று)</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">Ration Card, Voter ID, or Utility bill</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{addressName ? "Change" : "Upload File"}</span>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "address")} className="hidden" />
                    </label>
                    {addressName && <span className="text-[10px] text-emerald-600 truncate font-mono font-semibold max-w-[120px]">{addressName}</span>}
                  </div>
                  {addressFile && addressFile.startsWith("data:image/") && <img src={addressFile} alt="Preview" className="mt-2.5 h-12 w-20 object-cover rounded border self-start shadow-inner" />}
                </div>

                {/* 4. Relevant Certificates */}
                <div className="p-3 bg-white border rounded-xl flex flex-col justify-between hover:border-amber-400 transition-all text-xs">
                  <div>
                    <span className="font-bold text-stone-700 block">4. Relevant Certificates (தொடர்புடைய சான்றிதழ்)</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">Marksheet, FIR, Marriage Card or Discharge Slip</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{certName ? "Change" : "Upload File"}</span>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "cert")} className="hidden" />
                    </label>
                    {certName && <span className="text-[10px] text-emerald-600 truncate font-mono font-semibold max-w-[120px]">{certName}</span>}
                  </div>
                  {certFile && certFile.startsWith("data:image/") && <img src={certFile} alt="Preview" className="mt-2.5 h-12 w-20 object-cover rounded border self-start shadow-inner" />}
                </div>

                {/* 5. Supporting Documents */}
                <div className="p-3 bg-white border rounded-xl flex flex-col justify-between hover:border-amber-400 transition-all text-xs">
                  <div>
                    <span className="font-bold text-stone-700 block">5. Supporting Documents (இதர ஆதரவு சான்றுகள்)</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">Bank Passbook Copy, local president letter</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{supportName ? "Change" : "Upload File"}</span>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "support")} className="hidden" />
                    </label>
                    {supportName && <span className="text-[10px] text-emerald-600 truncate font-mono font-semibold max-w-[120px]">{supportName}</span>}
                  </div>
                  {supportFile && supportFile.startsWith("data:image/") && <img src={supportFile} alt="Preview" className="mt-2.5 h-12 w-20 object-cover rounded border self-start shadow-inner" />}
                </div>

              </div>
            </div>

            {/* DECLARATION */}
            <div className="bg-white p-4 border border-stone-200 rounded-xl space-y-3">
              <span className="font-extrabold text-[11px] text-[#b91c1c] block uppercase tracking-wide">
                {lang === "ta" ? "உறுதிமொழிப் பிரகடனம்" : "DECLARATION OF TRUTH"}
              </span>
              
              <p className="text-[11px] leading-relaxed text-stone-500 font-medium text-left">
                {lang === "ta" 
                  ? "விண்ணப்பத்தில் நான் வழங்கியுள்ள விபரங்கள் மற்றும் சமர்ப்பிக்கப்பட்டுள்ள ஆவண நகல்கள் அனைத்தும் முற்றிலும் உண்மையானவை. ஆவணங்களில் ஏதேனும் தவறான தகவலோ அல்லது போலியான விபரங்களோ கண்டறியப்பட்டால் எனது உறுப்பினர் அந்தஸ்தை உடனடியாக ரத்து செய்யவும், சங்கத்தின் மூலம் சட்டப்பூர்வ நடவடிக்கை எடுக்கவும் நான் முழு சம்மதம் அளிக்கிறேன்."
                  : "I hereby solemnly declare and affirm that the particulars furnished in this online application form and supporting scanned documents are true, complete, and correct to the best of my knowledge. If any document is found to be forged or misleading, the association holds the right to terminate my active membership immediately."}
              </p>

              <label className="flex items-start gap-2 text-xs font-bold text-stone-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declaration}
                  onChange={(e) => setDeclaration(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>
                  {lang === "ta" ? "நான் இந்த உறுதிமொழியை ஏற்றுக்கொள்கிறேன்." : "I completely understand and accept this declaration."}
                </span>
              </label>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow disabled:bg-stone-300"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>{lang === "ta" ? "விண்ணப்பம் பதிவு செய்யப்படுகிறது..." : "Securing cryptographic lines..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{editingAppId ? (lang === "ta" ? "விண்ணப்பத்தை மீண்டும் சமர்ப்பிக்க" : "Resubmit Modified Application") : (lang === "ta" ? "விண்ணப்பத்தை ஆய்வுக்கு சமர்ப்பிக்க" : "Submit Prepared Application for Review")}</span>
                </>
              )}
            </button>

          </form>
        </div>
      )}

      {/* GOVERNMENT SCHEMES AGGREGATOR VIEW */}
      {activeView === "schemes_aggregator" && (
        <GovernmentSchemesAggregator
          lang={lang}
          currentUser={currentUser}
          onSelectSchemeForApplication={(schemeTitle) => {
            setActiveView("services");
            const matched = schemes.find(s => s.title === schemeTitle);
            if (matched) {
              setSelectedSchemeId(matched.id);
            }
          }}
          onAddAuditLog={onAddAuditLog}
        />
      )}

      {/* 15 SCHEMES GRID SELECTOR LISTING */}
      {activeView === "services" && !selectedSchemeId && (
        <div className="space-y-6">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="leading-relaxed text-left">
              <span className="font-extrabold text-stone-900 block">நலவாரிய சேவை எப்படி செயல்படுகிறது?</span>
              <p className="font-medium text-[11px] text-amber-950 mt-0.5">
                {lang === "ta" 
                  ? "கீழே உள்ள 15 பிரிவுகளில் தேவையான திட்டத்தை தேர்ந்தெடுக்கவும். பின் விண்ணப்ப பாரத்தை பூர்த்தி செய்து ஆவணங்களை பதிவேற்றவும். நீங்கள் சமர்ப்பித்தவுடன் உங்கள் விண்ணப்ப நிலை 'Pending Review' என மாறும். சங்கம் மற்றும் மாநில பொதுச்செயலாளரின் ஒப்புதல் கிடைத்ததும் நிதி நேரடியாக வாரிசு அல்லது உங்கள் வங்கி கணக்கிற்கு வழங்கப்படும்."
                  : "Choose any of the 15 categories below. Complete the step-by-step form and submit it. Super Admin monitors and approves. Once cleared, grants will be issued directly."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes.map((scheme, idx) => (
              <div
                key={`wb_sch_${scheme.id}_${idx}`}
                onClick={() => {
                  setSelectedSchemeId(scheme.id);
                  setEditingAppId(null);
                }}
                className="p-4 bg-stone-50 border border-stone-200 hover:border-amber-400 hover:bg-white hover:shadow-md rounded-2xl cursor-pointer text-left transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200/50 flex items-center justify-center shrink-0">
                      {scheme.icon}
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold px-2 py-0.5 rounded-full">
                      {lang === "ta" ? scheme.amount : scheme.amountEn}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-stone-950 text-xs mt-3">{lang === "ta" ? scheme.title : scheme.titleEn}</h3>
                  <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed font-medium">{lang === "ta" ? scheme.desc : scheme.descEn}</p>
                </div>

                <div className="pt-3 border-t border-stone-150 mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-stone-400 font-bold uppercase">{lang === "ta" ? `${scheme.documents.length} ஆவணங்கள் தேவை` : `${scheme.documentsEn.length} docs needed`}</span>
                  <span className="text-[#b91c1c] font-extrabold flex items-center gap-0.5">
                    <span>{lang === "ta" ? "விண்ணப்பிக்க" : "Apply"}</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB: E-FORM LIBRARY (DIGITAL ARCHIVE)
          ========================================== */}
      {activeView === "eforms" && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-50 p-4 border border-stone-200 rounded-2xl">
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-red-600" />
                <span>{lang === "ta" ? "டிஜிட்டல் படிவங்களின் நூலகம்" : "Enterprise Digital Form Library"}</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {lang === "ta" 
                  ? "நலவாரிய அரசு படிவங்கள் மற்றும் ஆன்லைன் விண்ணப்ப வார்ப்புருக்களின் மத்திய சேமிப்பகம்."
                  : "Central repository of official welfare claim forms with version control and dynamic formats."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Simulate Admin Mode Toggle for Visitors */}
              <label className="flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 cursor-pointer select-none hover:bg-stone-50">
                <input 
                  type="checkbox" 
                  className="rounded text-red-600 focus:ring-red-500 cursor-pointer h-3.5 w-3.5"
                  defaultChecked={currentUser?.role === "super_admin" || currentUser?.role === "state_admin"}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    // Trigger simulated update to give visitor access to advanced admin panel
                    onAddAuditLog(
                      isChecked ? "Admin Simulation Enabled" : "Admin Simulation Disabled",
                      "User toggled simulated admin features on the E-Form library view."
                    );
                  }}
                />
                <span>⚙️ {lang === "ta" ? "அதிகாரி அணுகல்" : "Union Admin View"}</span>
              </label>

              <button
                onClick={handleOpenCreateForm}
                className="px-3 py-1.5 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>{lang === "ta" ? "படிவம் உருவாக்கு" : "Create Form"}</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 border border-stone-200 rounded-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder={lang === "ta" ? "படிவ பெயர் கொண்டு தேட..." : "Search e-forms..."}
                value={eFormSearch}
                onChange={(e) => setEFormSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>

            <div>
              <select
                value={eFormLangFilter}
                onChange={(e) => setEFormLangFilter(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="all">🌐 {lang === "ta" ? "அனைத்து மொழிகள்" : "All Languages"}</option>
                <option value="bilingual">Bilingual (இருமொழி)</option>
                <option value="ta">Tamil Only (தமிழ் மட்டும்)</option>
                <option value="en">English Only (ஆங்கிலம் மட்டும்)</option>
              </select>
            </div>

            <div>
              <select
                value={eFormTypeFilter}
                onChange={(e) => setEFormTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="all">📝 {lang === "ta" ? "அனைத்து படிவங்கள்" : "All Form Types"}</option>
                <option value="pdf">📄 PDF Templates (அச்சிடும் படிவம்)</option>
                <option value="online">💻 Online Templates (டிஜிட்டல் வடிவம்)</option>
              </select>
            </div>

            <div>
              <select
                value={eFormStatusFilter}
                onChange={(e) => setEFormStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="active">✓ {lang === "ta" ? "செயலில் உள்ளவை" : "Active Templates"}</option>
                <option value="archived">📁 காப்பகப்படுத்தப்பட்டவை (Archived)</option>
                <option value="all">📋 அனைத்து கோப்புகள் (All Files)</option>
              </select>
            </div>
          </div>

          {/* E-Forms Listing Grid */}
          {eForms.filter((f) => {
            const matchesSearch = f.name.toLowerCase().includes(eFormSearch.toLowerCase()) || f.nameEn.toLowerCase().includes(eFormSearch.toLowerCase()) || f.category.toLowerCase().includes(eFormSearch.toLowerCase());
            const matchesLang = eFormLangFilter === "all" || f.lang === eFormLangFilter;
            const matchesType = eFormTypeFilter === "all" || f.type === eFormTypeFilter;
            const matchesStatus = eFormStatusFilter === "all" || f.status === eFormStatusFilter;
            return matchesSearch && matchesLang && matchesType && matchesStatus;
          }).length === 0 ? (
            <div className="p-12 text-center bg-stone-50 border border-dashed rounded-2xl text-xs text-stone-400">
              <p>{lang === "ta" ? "தேடலுக்கு பொருந்தும் படிவங்கள் எதுவும் நூலகத்தில் இல்லை." : "No digital e-forms found matching your search parameters."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eForms.filter((f) => {
                const matchesSearch = f.name.toLowerCase().includes(eFormSearch.toLowerCase()) || f.nameEn.toLowerCase().includes(eFormSearch.toLowerCase()) || f.category.toLowerCase().includes(eFormSearch.toLowerCase());
                const matchesLang = eFormLangFilter === "all" || f.lang === eFormLangFilter;
                const matchesType = eFormTypeFilter === "all" || f.type === eFormTypeFilter;
                const matchesStatus = eFormStatusFilter === "all" || f.status === eFormStatusFilter;
                return matchesSearch && matchesLang && matchesType && matchesStatus;
              }).map((form, idx) => (
                <div key={`wb_form_${form.id}_${idx}`} className="p-5 bg-white border border-stone-200 hover:border-amber-400 hover:shadow-md rounded-2xl transition-all space-y-4 flex flex-col justify-between">
                  <div>
                    {/* Header line */}
                    <div className="flex justify-between items-start gap-2 border-b border-stone-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-stone-900 rounded-xl">
                          <FileText className="w-4 h-4 text-amber-400" />
                        </span>
                        <div>
                          <span className="text-[10px] font-bold text-[#b91c1c] uppercase tracking-wider block">{form.category}</span>
                          <span className="text-[10px] text-stone-400 font-mono">ID: {form.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono bg-stone-100 text-stone-800 font-bold px-2 py-0.5 rounded-md">
                          {form.version}
                        </span>
                        {form.status === "archived" && (
                          <span className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-md">
                            {lang === "ta" ? "காப்பகம்" : "Archived"}
                          </span>
                        )}
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-md uppercase">
                          {form.type}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5 pt-2">
                      <h4 className="font-extrabold text-stone-950 text-sm">{lang === "ta" ? form.name : form.nameEn}</h4>
                      {lang === "ta" && <p className="text-[11px] text-stone-500 font-medium">{form.nameEn}</p>}
                      <p className="text-[10px] text-stone-400">📅 {lang === "ta" ? "கடைசி புதுப்பிப்பு:" : "Last Updated:"} {form.lastUpdated}</p>
                    </div>

                    {/* Version History Collapsible Box */}
                    <div className="mt-3 bg-stone-50 p-2.5 rounded-xl border border-stone-150 text-[11px]">
                      <span className="font-bold text-stone-800 block mb-1 text-[10px] uppercase tracking-wider">📜 {lang === "ta" ? "பதிப்பு வரலாற்று ஏடு" : "Version Logs"}</span>
                      <div className="max-h-20 overflow-y-auto space-y-1 pl-1.5 border-l border-stone-200">
                        {form.history.map((hist, i) => (
                          <div key={i} className="text-[10px] leading-relaxed text-stone-600">
                            <span className="font-mono font-bold text-[#b91c1c]">{hist.version}</span> ({hist.date}): <span className="font-medium text-stone-700">{hist.change}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-2 justify-between items-center">
                    
                    {/* Primary client actions */}
                    <div className="flex gap-1.5">
                      {form.type === "pdf" ? (
                        <button
                          onClick={() => handleDownloadFormTemplate(form)}
                          disabled={isFormDownloading !== null}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:bg-stone-300"
                        >
                          {isFormDownloading === form.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                              <span>{lang === "ta" ? "பதிவிறக்கப்படுகிறது..." : "Downloading..."}</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                              <span>{lang === "ta" ? "படிவம் பதிவிறக்கு" : "Download PDF"}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            toggleView("builder");
                            // Auto fill builder dynamically
                            onAddAuditLog("E-Form Launched", `Launced online interactive form template: ${form.nameEn}`);
                          }}
                          className="px-3 py-1.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === "ta" ? "படிவம் நிரப்பு" : "Launch Form"}</span>
                        </button>
                      )}
                    </div>

                    {/* Admin actions */}
                    <div className="flex gap-1">
                      <button
                        title={lang === "ta" ? "திருத்து" : "Edit Metadata"}
                        onClick={() => handleOpenEditForm(form)}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        title={lang === "ta" ? "பதிப்பு புதுப்பித்தல்" : "Upgrade Version"}
                        onClick={() => handleOpenVersionModal(form)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {form.status === "active" ? (
                        <button
                          title={lang === "ta" ? "காப்பகப்படுத்து" : "Archive Form"}
                          onClick={() => handleArchiveForm(form.id, true)}
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          title={lang === "ta" ? "மீட்டெடு" : "Restore Form"}
                          onClick={() => handleArchiveForm(form.id, false)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-all cursor-pointer"
                        >
                          <Undo className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB: SMART FORM BUILDER
          ========================================== */}
      {activeView === "builder" && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Overview Warning */}
          <div className="p-4 bg-stone-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-red-600">
            <div>
              <span className="text-[10px] font-black tracking-widest block text-amber-400 uppercase">INTUATIVE SCHEMA ENGINE</span>
              <h3 className="font-extrabold text-sm md:text-base mt-0.5">
                {lang === "ta" ? "அரசு நலவாரிய படிவ வடிவமைப்பாளர்" : "Smart E-Form Designer Console"}
              </h3>
              <p className="text-[11px] text-stone-400 mt-1 leading-relaxed max-w-xl">
                {lang === "ta" 
                  ? "சங்க நிர்வாகிகள் எந்தவொரு அரசு படிவத்தையும் எளிதாக டிஜிட்டல் வடிவில் மாற்றி புதிய புலங்களை சேர்க்கும் தளம். இது தானியங்கி தகவல் நிரப்புதல் வசதியைக் கொண்டுள்ளது."
                  : "Admins can configure form schemas with targeted profile bindings. Fields intelligently pull member details on load to guarantee verification."}
              </p>
            </div>

            <button
              onClick={handlePublishBuilderTemplate}
              disabled={isBuilderPublishing}
              className="px-4 py-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-stone-700 disabled:text-stone-400 shadow shrink-0 self-stretch md:self-auto justify-center"
            >
              {isBuilderPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{lang === "ta" ? "வெளியிடப்படுகிறது..." : "Publishing..."}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ta" ? "நூலகத்தில் வெளியிடு" : "Publish Form"}</span>
                </>
              )}
            </button>
          </div>

          {/* Builder Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form Configuration Pane (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Add Field Panel */}
              <form onSubmit={handleAddField} className="p-5 border border-stone-200 bg-stone-50 rounded-2xl space-y-4 text-xs">
                <h4 className="font-black text-stone-900 text-xs border-b border-stone-200 pb-2 flex items-center gap-1">
                  <Plus className="w-4 h-4 text-red-600" />
                  <span>{lang === "ta" ? "புதிய புலம் சேர்க்கவும் (Add Field)" : "Add Custom Field to Template"}</span>
                </h4>

                {/* Field Name (Tamil) */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">புலத்தின் பெயர் (தமிழ்) *</label>
                  <input
                    type="text"
                    required
                    value={builderFieldNameTa}
                    onChange={(e) => setBuilderFieldNameTa(e.target.value)}
                    placeholder="எ.க., வங்கி கணக்கு புத்தகம்"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 font-medium"
                  />
                </div>

                {/* Field Name (English) */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Field Label (English) *</label>
                  <input
                    type="text"
                    required
                    value={builderFieldNameEn}
                    onChange={(e) => setBuilderFieldNameEn(e.target.value)}
                    placeholder="e.g., Bank Passbook Upload"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 font-medium"
                  />
                </div>

                {/* Field Type & Required checkbox */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">புலத்தின் வகை (Type)</label>
                    <select
                      value={builderFieldType}
                      onChange={(e) => setBuilderFieldType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 font-semibold cursor-pointer"
                    >
                      <option value="text">Short Text</option>
                      <option value="number">Number</option>
                      <option value="date">Calendar Date</option>
                      <option value="dropdown">Dropdown List</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">உறுப்பினர் விபர நிரப்பல் (Auto-Fill)</label>
                    <select
                      value={builderFieldAutoFill}
                      onChange={(e) => setBuilderFieldAutoFill(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 font-semibold cursor-pointer text-[11px]"
                    >
                      <option value="None">None (நிரப்ப வேண்டாம்)</option>
                      <option value="memberName">Member Name</option>
                      <option value="memberId">Member Reg ID</option>
                      <option value="memberPhone">Member Mobile</option>
                      <option value="district">Member District</option>
                    </select>
                  </div>
                </div>

                {/* Dropdown Options (Conditional) */}
                {builderFieldType === "dropdown" && (
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">கீழ் தோன்று பட்டியல் மதிப்புகள் (options - கமாவால் பிரிக்கவும்) *</label>
                    <input
                      type="text"
                      required
                      value={builderFieldOptions}
                      onChange={(e) => setBuilderFieldOptions(e.target.value)}
                      placeholder="சென்னை, மதுரை, கோவை"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 font-medium"
                    />
                  </div>
                )}

                {/* Required switch */}
                <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={builderFieldRequired}
                    onChange={(e) => setBuilderFieldRequired(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <span>{lang === "ta" ? "கட்டாய புலம் (Is Required Field)" : "Mark as Required Field"}</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2 bg-stone-900 hover:bg-red-600 text-white rounded-xl font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ta" ? "புலத்தை வடிவமைப்பில் சேர்" : "Insert Field to Template"}</span>
                </button>
              </form>

              {/* Active Fields List */}
              <div className="p-5 border border-stone-200 bg-white rounded-2xl space-y-3.5 text-xs">
                <h4 className="font-extrabold text-stone-900 text-xs border-b pb-2 flex items-center justify-between">
                  <span>{lang === "ta" ? "வடிவமைப்பிலுள்ள புலங்கள்" : "Active Template Schema Fields"}</span>
                  <span className="bg-stone-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-600">{builderFields.length} {lang === "ta" ? "புலங்கள்" : "fields"}</span>
                </h4>

                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {builderFields.map((field, idx) => (
                    <div key={`wb_bfld1_${field.id}_${idx}`} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex justify-between items-center group hover:border-amber-400 transition-all">
                      <div>
                        <span className="font-extrabold text-stone-900 block">{lang === "ta" ? field.label : field.labelEn}</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-mono bg-stone-200/60 text-stone-700 px-1.5 py-0.5 rounded uppercase font-semibold">{field.type}</span>
                          {field.required && (
                            <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold">{lang === "ta" ? "கட்டாயம்" : "Required"}</span>
                          )}
                          {field.autoFillFrom && (
                            <span className="text-[9px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                              ✨ Auto: {field.autoFillFrom}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        disabled={field.id === "bf_1" || field.id === "bf_2"}
                        className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Live Dynamic Preview Pane (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Preview Header / Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-stone-50 p-4 border border-stone-200 rounded-2xl">
                <div>
                  <h4 className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-amber-600" />
                    <span>{lang === "ta" ? "நேரடி ஸ்மார்ட் படிவ முன்னோட்டம்" : "Live Intelligent Form Preview"}</span>
                  </h4>
                  <p className="text-[10px] text-stone-400">{lang === "ta" ? "புலங்களைச் சேர்க்கும்போது இந்த வடிவமைப்பு உடனடியாக மாறும்." : "Simulated dynamic layout updates instantly as you add fields."}</p>
                </div>

                {/* AutoFill Trigger */}
                <label className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 cursor-pointer select-none hover:bg-stone-50 shadow-sm shrink-0">
                  <input
                    type="checkbox"
                    checked={enableAutoFillPreview}
                    onChange={(e) => setEnableAutoFillPreview(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-[#b91c1c] focus:ring-[#b91c1c] cursor-pointer"
                  />
                  <span>✨ {lang === "ta" ? "தகவல் தானியங்கி நிரப்பு" : "Smart Auto-Fill"}</span>
                </label>
              </div>

              {/* Simulated Portal Form Form container */}
              <form onSubmit={handleTestBuilderSubmission} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6 text-left">
                
                {/* Simulated Gov Emblem Banner */}
                <div className="flex items-center gap-3 border-b-2 border-amber-500 pb-4">
                  <div className="h-11 w-11 rounded-full bg-stone-900 flex items-center justify-center shrink-0 border border-amber-400">
                    <Award className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">TAMIL NADU CONSTRUCTION WORKERS WELFARE BOARD</span>
                    <h3 className="font-black text-[#b91c1c] text-xs md:text-sm mt-0.5">
                      {lang === "ta" ? "வர்ணம் பூசுபவர் நலவாரிய ஆன்லைன் சேவை விண்ணப்பம்" : "Painter Welfare Digital Unified Request Portal"}
                    </h3>
                    <p className="text-[10px] text-stone-400">Department of Labour and Employment, Govt of Tamil Nadu</p>
                  </div>
                </div>

                {/* Form fields generator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {builderFields.map((field, idx) => {
                    // Resolve auto filled values fallback
                    let autoVal = simulatedValues[field.id] || "";
                    let isAutofilled = false;
                    if (enableAutoFillPreview && field.autoFillFrom) {
                      isAutofilled = true;
                      if (field.autoFillFrom === "memberName") autoVal = currentUser?.name || "முத்துவேல் பாண்டியன்";
                      if (field.autoFillFrom === "memberId") autoVal = currentUser?.regNumber || "TNP-2026-0812";
                      if (field.autoFillFrom === "memberPhone") autoVal = currentUser?.phone || "9845210741";
                      if (field.autoFillFrom === "district") autoVal = currentUser?.district || "சென்னை";
                    }

                    return (
                      <div key={`wb_bfld2_${field.id}_${idx}`} className={`space-y-1.5 ${field.type === "file" ? "md:col-span-2" : ""}`}>
                        <label className="flex justify-between items-center font-bold text-stone-700">
                          <span>
                            {lang === "ta" ? field.label : field.labelEn}
                            {field.required && <span className="text-red-500 ml-0.5">*</span>}
                          </span>
                          {isAutofilled && (
                            <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                              <span>{lang === "ta" ? "நிரப்பப்பட்டது" : "Auto-filled"}</span>
                            </span>
                          )}
                        </label>

                        {field.type === "dropdown" ? (
                          <select
                            required={field.required}
                            value={autoVal}
                            disabled={isAutofilled}
                            onChange={(e) => handleSimulateFieldChange(field.id, e.target.value)}
                            className={`w-full px-3 py-2.5 border rounded-xl bg-white text-stone-800 font-semibold cursor-pointer ${
                              isAutofilled ? "border-amber-300 bg-amber-50/20 text-stone-600" : "border-stone-200"
                            }`}
                          >
                            <option value="">{lang === "ta" ? "தேர்ந்தெடுக்கவும்..." : "Select options..."}</option>
                            {(field.options || ["Standard Approval"]).map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === "file" ? (
                          <div className={`p-4 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-stone-50 cursor-pointer ${
                            isAutofilled ? "border-amber-300 bg-amber-50/10" : "border-stone-200"
                          }`}>
                            <Upload className="w-5 h-5 text-stone-400" />
                            <div>
                              <span className="font-extrabold text-stone-800 block text-[11px]">{lang === "ta" ? "ஆவணத்தை இழுத்து விடவும்" : "Drag and drop copy of document here"}</span>
                              <span className="text-[9px] text-stone-400 block mt-0.5">Support PDF, JPEG, PNG up to 5MB</span>
                            </div>
                            <input 
                              type="file" 
                              required={field.required && !isAutofilled}
                              disabled={isAutofilled}
                              className="hidden" 
                            />
                          </div>
                        ) : (
                          <input
                            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                            required={field.required}
                            value={autoVal}
                            disabled={isAutofilled}
                            onChange={(e) => handleSimulateFieldChange(field.id, e.target.value)}
                            placeholder={lang === "ta" ? `${field.label} உள்ளிடுக` : `Enter ${field.labelEn}`}
                            className={`w-full px-3 py-2.5 border rounded-xl bg-white text-stone-800 font-medium ${
                              isAutofilled ? "border-amber-300 bg-amber-50/20 text-stone-600" : "border-stone-200"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Simulated submit */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#b91c1c] hover:bg-stone-900 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ta" ? "முன்னோட்ட படிவம் சமர்ப்பி (சோதனை)" : "Test Smart Submission"}</span>
                </button>

              </form>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          MODALS FOR DIGITAL E-FORM CREATION/EDITING
          ========================================== */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-stone-900 text-sm">
                {editingForm 
                  ? (lang === "ta" ? "படிவத் தகவல்களைத் திருத்துக" : "Edit Digital E-Form Details") 
                  : (lang === "ta" ? "புதிய படிவத்தை உருவாக்கு" : "Publish New E-Form Template")}
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-1 hover:bg-stone-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              
              {/* Form Name Tamil */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">படிவம் பெயர் (தமிழ்) *</label>
                <input
                  type="text"
                  required
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="எ.க., புதிய நலவாரியப் பதிவு விண்ணப்பம்"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              {/* Form Name English */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Form Name (English) *</label>
                <input
                  type="text"
                  required
                  value={newFormNameEn}
                  onChange={(e) => setNewFormNameEn(e.target.value)}
                  placeholder="e.g., New Welfare Registration Claim Form"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">வகையினம் (Category)</label>
                <select
                  value={newFormCategory}
                  onChange={(e) => setNewFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl font-semibold cursor-pointer"
                >
                  <option value="Welfare Registration">Welfare Registration (நலவாரிய பதிவு)</option>
                  <option value="Renewal">Renewal (புதுப்பித்தல்)</option>
                  <option value="Education Assistance">Education Assistance (கல்வி உதவித்தொகை)</option>
                  <option value="Marriage Assistance">Marriage Assistance (திருமண நிதியுதவி)</option>
                  <option value="Maternity Assistance">Maternity Assistance (மகப்பேறு நிதியுதவி)</option>
                  <option value="Pension">Pension (ஓய்வூதியம்)</option>
                  <option value="Other Welfare Services">Other Welfare Services (இதர சேவைகள்)</option>
                </select>
              </div>

              {/* Lang, Type, Version Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">மொழி (Language)</label>
                  <select
                    value={newFormLang}
                    onChange={(e) => setNewFormLang(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl font-semibold cursor-pointer"
                  >
                    <option value="bilingual">Bilingual</option>
                    <option value="ta">Tamil Only</option>
                    <option value="en">English Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">படிவ வகை (Type)</label>
                  <select
                    value={newFormType}
                    onChange={(e) => setNewFormType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl font-semibold cursor-pointer"
                  >
                    <option value="pdf">📄 PDF Template</option>
                    <option value="online">💻 Online Form</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">பதிப்பு (Version)</label>
                  <input
                    type="text"
                    required
                    value={newFormVersion}
                    onChange={(e) => setNewFormVersion(e.target.value)}
                    placeholder="v1.0"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Download URL (Conditional) */}
              {newFormType === "pdf" && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">படிவம் பதிவிறக்க இணைப்பு (PDF Download URL)</label>
                  <input
                    type="text"
                    value={newFormUrl}
                    onChange={(e) => setNewFormUrl(e.target.value)}
                    placeholder="https://example.com/forms/sample.pdf"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl font-medium"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>{lang === "ta" ? "படிவத்தை சேமிக்கவும்" : "Save Form Template"}</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS FOR VERSION BUMP / UPDATE LOGS
          ========================================== */}
      {showVersionModal && versioningForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-md shadow-xl space-y-4 text-left">
            
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-stone-900 text-sm">
                ⚙️ {lang === "ta" ? "படிவப் பதிப்பை மேம்படுத்து" : "Upgrade Form Version Control"}
              </h3>
              <button 
                onClick={() => setShowVersionModal(false)}
                className="p-1 hover:bg-stone-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveVersion} className="space-y-4 text-xs">
              
              <div className="bg-stone-50 p-3 rounded-xl border">
                <span className="text-[10px] text-stone-400 font-bold block">ACTIVE TEMPLATE</span>
                <span className="font-extrabold text-stone-900 block mt-0.5">{lang === "ta" ? versioningForm.name : versioningForm.nameEn}</span>
                <span className="text-[10px] text-stone-500 font-mono block mt-1">Current Version: {versioningForm.version}</span>
              </div>

              {/* New version string */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">புதிய பதிப்பு எண் (New Version Number) *</label>
                <input
                  type="text"
                  required
                  value={newVersionString}
                  onChange={(e) => setNewVersionString(e.target.value)}
                  placeholder="e.g., v2.5"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Version Change description */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">மாற்றங்களின் விபரம் (Change Log Description) *</label>
                <textarea
                  required
                  rows={3}
                  value={versionChangeLog}
                  onChange={(e) => setVersionChangeLog(e.target.value)}
                  placeholder={lang === "ta" ? "இந்த பதிப்பில் செய்யப்பட்ட மாற்றங்கள்..." : "Describe amendments and revisions made in this template..."}
                  className="w-full p-3 border border-stone-200 rounded-xl font-medium resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#b91c1c] hover:bg-stone-900 text-white rounded-xl font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{lang === "ta" ? "மாற்றங்களைப் பதிவுசெய்" : "Apply Upgraded Version"}</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
