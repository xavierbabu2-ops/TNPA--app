import React, { useState, useEffect } from "react";
import {
  Scale,
  ShieldCheck,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Award,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  UserCheck,
  Clock,
  Briefcase,
  BookOpen,
  Filter,
  Lock,
  RefreshCw,
  Send,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Printer,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Gavel
} from "lucide-react";
import { UserAccount, LegalAdvisor, LegalConsultationRequest } from "../types";

// Safe JSON parser helper
async function parseSafeJson(resp: Response) {
  const text = await resp.text();
  if (!text || !text.trim()) {
    return { success: resp.ok };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: `Unexpected server response (HTTP ${resp.status})` };
  }
}

interface StateLegalAdvisoryBoardProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function StateLegalAdvisoryBoard({
  lang,
  currentUser,
  onAddAuditLog
}: StateLegalAdvisoryBoardProps) {
  const [advisors, setAdvisors] = useState<LegalAdvisor[]>([]);
  const [consultations, setConsultations] = useState<LegalConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"directory" | "circular" | "request" | "cases" | "rights">("directory");
  const [copiedCircular, setCopiedCircular] = useState(false);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourtFilter, setSelectedCourtFilter] = useState("all");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("all");

  // Add / Edit Modal (Super Admin Only)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<LegalAdvisor | null>(null);
  const [formData, setFormData] = useState<Partial<LegalAdvisor>>({
    name: "",
    nameEn: "",
    designation: "மாநில சட்ட ஆலோசகர்",
    designationEn: "State Legal Advisor",
    barCouncilRegNo: "",
    court: "சென்னை உயர்நீதிமன்றம்",
    courtEn: "Madras High Court",
    phone: "",
    whatsapp: "",
    email: "",
    officeAddress: "",
    district: "சென்னை",
    districtEn: "Chennai",
    specialization: "தொழிலாளர் சட்டம், தொழிற்சங்க உரிமைகள் & விபத்து இழப்பீடு",
    specializationEn: "Labor Law, Union Rights & Accident Compensation",
    experienceYears: 10,
    photoUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80",
    status: "Active",
    emergencyAvailable: true,
    notes: ""
  });
  const [modalError, setModalError] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Legal Consultation Form
  const [consForm, setConsForm] = useState({
    memberName: currentUser?.name || "",
    memberPhone: currentUser?.phone || "",
    memberDistrict: currentUser?.district || "சென்னை",
    caseType: "accident_compensation" as any,
    caseTypeTa: "பணியிட விபத்து & காப்பீட்டு இழப்பீடு",
    description: ""
  });
  const [consSubmitting, setConsSubmitting] = useState(false);
  const [consSuccessMsg, setConsSuccessMsg] = useState("");

  const isSuperAdmin = currentUser?.role === "super_admin";

  // Fetch Legal Advisors and Consultations
  const fetchData = async () => {
    setLoading(true);
    try {
      const advRes = await fetch("/api/legal-advisors");
      const advData = await parseSafeJson(advRes);
      if (advData.success && Array.isArray(advData.advisors)) {
        setAdvisors(advData.advisors);
      }

      const consRes = await fetch("/api/legal-advisors/consultations");
      const consData = await parseSafeJson(consRes);
      if (consData.success && Array.isArray(consData.consultations)) {
        setConsultations(consData.consultations);
      }
    } catch (err) {
      console.error("Failed to load legal advisors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    if (!isSuperAdmin) return;
    setEditingAdvisor(null);
    setFormData({
      name: "",
      nameEn: "",
      designation: "மாநில சட்ட ஆலோசகர்",
      designationEn: "State Legal Advisor",
      barCouncilRegNo: "",
      court: "சென்னை உயர்நீதிமன்றம்",
      courtEn: "Madras High Court",
      phone: "",
      whatsapp: "",
      email: "",
      officeAddress: "",
      district: "சென்னை",
      districtEn: "Chennai",
      specialization: "தொழிலாளர் சட்டம், தொழிற்சங்க உரிமைகள் & விபத்து இழப்பீடு",
      specializationEn: "Labor Law, Union Rights & Accident Claims",
      experienceYears: 10,
      photoUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80",
      status: "Active",
      emergencyAvailable: true,
      notes: ""
    });
    setModalError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (adv: LegalAdvisor) => {
    if (!isSuperAdmin) return;
    setEditingAdvisor(adv);
    setFormData({ ...adv });
    setModalError("");
    setIsModalOpen(true);
  };

  // Save Advisor (Add or Edit)
  const handleSaveAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setModalError(lang === "ta" ? "சூப்பர் அட்மின்களுக்கு மட்டுமே அனுமதி உண்டு!" : "Super Admin privileges required!");
      return;
    }

    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.barCouncilRegNo?.trim()) {
      setModalError(
        lang === "ta"
          ? "வழக்கறிஞர் பெயர், பார் கவுன்சில் பதிவு எண் மற்றும் தொலைபேசி எண் கட்டாயம் தேவை!"
          : "Name, Bar Council Reg No, and Phone Number are required!"
      );
      return;
    }

    setModalSubmitting(true);
    setModalError("");

    try {
      const url = editingAdvisor
        ? `/api/legal-advisors/${editingAdvisor.id}`
        : "/api/legal-advisors";
      const method = editingAdvisor ? "PUT" : "POST";

      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentUser?.role || "super_admin"
        },
        body: JSON.stringify(formData)
      });

      const resData = await parseSafeJson(resp);
      if (!resp.ok || !resData.success) {
        throw new Error(lang === "ta" ? (resData.errorTa || resData.error) : resData.error);
      }

      onAddAuditLog(
        editingAdvisor ? "Legal Advisor Updated" : "Legal Advisor Registered",
        `Super Admin updated legal advisor: ${formData.nameEn || formData.name} (${formData.phone})`
      );

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || "Operation failed.");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Delete Advisor
  const handleDeleteAdvisor = async (id: string, name: string) => {
    if (!isSuperAdmin) return;
    const confirmMsg = lang === "ta"
      ? `வழக்கறிஞர் "${name}" அவர்களை நீக்க விரும்புகிறீர்களா? இதனை மாற்ற இயலாது.`
      : `Are you sure you want to remove legal advisor "${name}"?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const resp = await fetch(`/api/legal-advisors/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": currentUser?.role || "super_admin"
        }
      });
      const data = await parseSafeJson(resp);
      if (data.success) {
        onAddAuditLog("Legal Advisor Deleted", `Super Admin deleted advisor ID ${id} (${name})`);
        fetchData();
      } else {
        alert(lang === "ta" ? data.errorTa || data.error : data.error);
      }
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // Submit Legal Consultation Request
  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consForm.memberName.trim() || !consForm.memberPhone.trim() || !consForm.description.trim()) {
      alert(lang === "ta" ? "பெயர், கைபேசி எண் மற்றும் விவரங்களை உள்ளிடவும்!" : "Please fill in required fields!");
      return;
    }

    setConsSubmitting(true);
    setConsSuccessMsg("");

    try {
      const resp = await fetch("/api/legal-advisors/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: currentUser?.id || "GUEST",
          memberName: consForm.memberName,
          memberPhone: consForm.memberPhone,
          memberDistrict: consForm.memberDistrict,
          caseType: consForm.caseType,
          caseTypeTa: consForm.caseTypeTa,
          description: consForm.description
        })
      });

      const resData = await parseSafeJson(resp);
      if (resData.success) {
        setConsSuccessMsg(
          lang === "ta"
            ? "உங்கள் சட்ட உதவி கோரிக்கை பதிவு செய்யப்பட்டது! மாநில சட்ட ஆலோசகர் உங்களை விரைவில் தொடர்புகொள்வார்."
            : "Legal aid request submitted! State Legal Advisor will contact you shortly."
        );
        setConsForm({
          memberName: currentUser?.name || "",
          memberPhone: currentUser?.phone || "",
          memberDistrict: currentUser?.district || "சென்னை",
          caseType: "accident_compensation",
          caseTypeTa: "பணியிட விபத்து & காப்பீட்டு இழப்பீடு",
          description: ""
        });
        onAddAuditLog("Legal Aid Request Submitted", `Member ${consForm.memberName} requested legal assistance.`);
        fetchData();
      }
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setConsSubmitting(false);
    }
  };

  // Filtered Advisors
  const filteredAdvisors = advisors.filter((adv) => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      !query ||
      adv.name.toLowerCase().includes(query) ||
      adv.nameEn.toLowerCase().includes(query) ||
      adv.specialization.toLowerCase().includes(query) ||
      adv.court.toLowerCase().includes(query) ||
      adv.district.toLowerCase().includes(query) ||
      adv.barCouncilRegNo.toLowerCase().includes(query);

    const matchCourt =
      selectedCourtFilter === "all" ||
      (selectedCourtFilter === "high_court" && (adv.court.includes("உயர்நீதிமன்றம்") || adv.courtEn.includes("High Court"))) ||
      (selectedCourtFilter === "labor_court" && (adv.court.includes("தொழிலாளர்") || adv.courtEn.includes("Labor")));

    const matchDistrict =
      selectedDistrictFilter === "all" ||
      adv.district === selectedDistrictFilter ||
      adv.districtEn === selectedDistrictFilter;

    return matchQuery && matchCourt && matchDistrict;
  });

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out] text-left">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#31104b] text-white p-6 sm:p-8 shadow-2xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs text-amber-300 font-extrabold tracking-wide">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "ta" ? "தமிழ்நாடு அரசு பதிவு எண்: TNMDUJCLMDUTU- 50-26-00044" : "Reg No: TNMDUJCLMDUTU- 50-26-00044"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex flex-wrap items-center gap-3">
              <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 shrink-0" />
              <span>{lang === "ta" ? "மாநில சட்ட ஆலோசனைக் குழு" : "State Legal Advisory Council"}</span>
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              {lang === "ta"
                ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் அனைத்து உறுப்பினர்களுக்கும், தொழிலாளர்களுக்கும் சென்னை உயர்நீதிமன்ற மற்றும் மாவட்ட மூத்த வழக்கறிஞர்களின் வழிகாட்டுதலில் சட்டப் பாதுகாப்பு, விபத்து இழப்பீடு மற்றும் தொழிற்சங்க உரிமை உதவிகள்."
                : "Official Legal Advisory Board of TNPA² providing high-caliber legal defense, workplace accident compensation claims, trade union rights protection, and 24x7 legal aid by High Court Senior Advocates."}
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-1.5 font-medium text-stone-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {lang === "ta" ? "உயர்நீதிமன்ற வழக்கறிஞர்கள்" : "High Court Advocates"}
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-1.5 font-medium text-stone-200">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {lang === "ta" ? "இலவச தொழிலாளர் சட்ட உதவி" : "Free Labor Legal Aid"}
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-1.5 font-medium text-stone-200">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                {lang === "ta" ? "24x7 அவசர வழக்கு உதவி" : "24x7 Emergency Assistance"}
              </span>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center space-y-3 shadow-lg">
            <div className="text-amber-300 font-extrabold text-xs uppercase tracking-wider">
              {lang === "ta" ? "மாநில சட்ட உதவி உதவி எண்" : "STATE LEGAL HELPLINE"}
            </div>
            <a
              href="tel:9443214567"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-base shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
            >
              <Phone className="w-4 h-4 text-stone-950" />
              <span>+91 94432 14567</span>
            </a>
            <p className="text-[11px] text-stone-300">
              {lang === "ta" ? "திங்கள் - சனி (காலை 9:00 - இரவு 8:00)" : "Mon - Sat (9:00 AM - 8:00 PM)"}
            </p>

            {isSuperAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer border border-indigo-400/40"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>{lang === "ta" ? "+ புதிய சட்ட வல்லுநரை பதிவு செய்க" : "+ Register Legal Advisor"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATUTORY LEGAL WARNING ALERT BANNER */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 border-2 border-red-500/50 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-2xl shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                  {lang === "ta" ? "அதிமுக்கிய சட்ட எச்சரிக்கை சுற்றறிக்கை" : "STATUTORY LEGAL WARNING CIRCULAR"}
                </span>
                <span className="text-[11px] text-amber-300 font-mono font-bold">
                  Ref: TNPA/LEGAL-NOT/2026/044
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-amber-300">
                {lang === "ta"
                  ? "சங்கத்தின் பெயரையோ, மாநில பொறுப்பாளர்களையோ அவதூறு பரப்புவோர் மீது பாயும் கடுமையான சட்ட நடவடிக்கைகள்!"
                  : "Strict Legal Prosecution & Defamation Lawsuits for Slander against the Union & State Leaders!"}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed max-w-3xl">
                {lang === "ta"
                  ? "தமிழ்நாடு அரசால் அங்கீகரிக்கப்பட்ட நமது சங்கத்தின் நற்பெயருக்கு களங்கம் விளைவிப்பது, மாநில பொறுப்பாளர்களை இழிவாகப் பேசுவது, மிரட்டுவது அல்லது சமூக வலைத்தளங்களில் அவதூறு பரப்புவோர் மீது BNS குற்றவியல் சட்டப்பிரிவுகள், IT Act சைபர் கிரைம் வழக்கு மற்றும் ₹1 கோடி வரை சிவில் நஷ்ட ஈடு வழக்கு தொடரப்படும்."
                  : "Stringent criminal prosecution under BNS, IT Act cybercrime booking, and up to ₹1 Crore civil defamation damages will be filed against anyone spreading malicious rumors, defamatory posts, or threats against TNPA² and its State Executives."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("circular")}
            className="px-5 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-red-900/40 flex items-center gap-2 shrink-0 transition-all cursor-pointer border border-white/20 active:scale-95"
          >
            <Gavel className="w-4 h-4 text-amber-200" />
            <span>{lang === "ta" ? "முழு சட்ட சுற்றறிக்கையைப் படிக்க 📜" : "Read Official Legal Circular 📜"}</span>
          </button>
        </div>
      </div>

      {/* 3. SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "directory"
              ? "bg-indigo-700 text-white shadow-md"
              : "bg-stone-100 hover:bg-stone-200 text-stone-700"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{lang === "ta" ? "சட்ட ஆலோசகர்கள் பட்டியல்" : "Advisory Council Directory"}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{advisors.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("circular")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "circular"
              ? "bg-red-700 text-white shadow-md ring-2 ring-amber-400"
              : "bg-red-50 hover:bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>{lang === "ta" ? "சட்ட எச்சரிக்கை சுற்றறிக்கை & நஷ்ட ஈடு ⚖️" : "Legal Warning Circular & Damages ⚖️"}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">அறிவிப்பு</span>
        </button>

        <button
          onClick={() => setActiveTab("request")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "request"
              ? "bg-indigo-700 text-white shadow-md"
              : "bg-stone-100 hover:bg-stone-200 text-stone-700"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{lang === "ta" ? "சட்ட ஆலோசனை & உதவி கோரிக்கை" : "Apply for Legal Aid"}</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("cases")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "cases"
                ? "bg-indigo-700 text-white shadow-md"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === "ta" ? "உறுப்பினர் சட்ட கோரிக்கைகள் (அட்மின்)" : "Case Requests (Admin)"}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px]">
              {consultations.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("rights")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "rights"
              ? "bg-indigo-700 text-white shadow-md"
              : "bg-stone-100 hover:bg-stone-200 text-stone-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === "ta" ? "தொழிலாளர் சட்ட வழிகாட்டி" : "Labor Legal Handbook"}</span>
        </button>
      </div>

      {/* 3. SUPER ADMIN ACCESS NOTICE */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
        isSuperAdmin 
          ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
          : "bg-amber-50 border-amber-300 text-amber-950"
      }`}>
        <div className="flex items-center gap-2.5">
          {isSuperAdmin ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <strong className="block font-bold">
              {isSuperAdmin
                ? (lang === "ta" ? "சூப்பர் அட்மின் அதிகாரம் செயல்படுத்தப்பட்டுள்ளது" : "Super Admin Privilege Active")
                : (lang === "ta" ? "சட்ட ஆலோசகர்கள் மேலாண்மை பாதுகாப்பு அறிவிப்பு" : "Super Admin Governance Protected")}
            </strong>
            <span className="text-[11px] opacity-90">
              {isSuperAdmin
                ? (lang === "ta" ? "மாநில சட்ட ஆலோசகர்களை பதிவு செய்யவும், திருத்தவும் மற்றும் நீக்கவும் உங்களுக்கு முழு அதிகாரம் உள்ளது." : "You have full authorization to add, modify, and delete state legal advisor profiles.")
                : (lang === "ta" ? "மாநில சட்ட ஆலோசகர்களை பதிவு செய்யவும், திருத்தங்கள் மேற்கொள்ளவும் சூப்பர் அட்மின்களுக்கு மட்டுமே அனுமதி அளிக்கப்பட்டுள்ளது." : "Only verified Super Admins are authorized to register, edit, or remove state legal advisors.")}
            </span>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "புதிய வழக்கறிஞர் பதிவு" : "Register Advisor"}</span>
          </button>
        )}
      </div>

      {/* 4. TAB CONTENT 1: LEGAL ADVISORS DIRECTORY */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ta" ? "வழக்கறிஞர் பெயர், பார் கவுன்சில் எண், ஊர்..." : "Search by name, roll no, specialization..."}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={selectedCourtFilter}
                onChange={(e) => setSelectedCourtFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{lang === "ta" ? "அனைத்து நீதிமன்றங்கள்" : "All Courts"}</option>
                <option value="high_court">{lang === "ta" ? "சென்னை உயர்நீதிமன்றம் & மதுரை கிளை" : "Madras High Court"}</option>
                <option value="labor_court">{lang === "ta" ? "தொழிலாளர் தீர்ப்பாயம் / நீதிமன்றம்" : "Labor Courts / Tribunals"}</option>
              </select>

              <select
                value={selectedDistrictFilter}
                onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{lang === "ta" ? "அனைத்து மாவட்டங்கள்" : "All Districts"}</option>
                {Array.from(new Set(advisors.map(a => a.district))).filter(Boolean).map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>

              <button
                onClick={() => { setSearchQuery(""); setSelectedCourtFilter("all"); setSelectedDistrictFilter("all"); }}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Reset Filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Advisors Grid */}
          {loading ? (
            <div className="p-12 text-center text-stone-500 bg-white rounded-3xl border border-stone-200 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="font-semibold text-sm">{lang === "ta" ? "மாநில சட்ட ஆலோசகர்கள் விவரங்கள் ஏற்றப்படுகிறது..." : "Loading Legal Advisors..."}</p>
            </div>
          ) : filteredAdvisors.length === 0 ? (
            <div className="p-12 text-center text-stone-500 bg-white rounded-3xl border border-stone-200 space-y-3">
              <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="font-bold text-base text-stone-800">
                {lang === "ta" ? "தேடலுக்குரிய சட்ட ஆலோசகர்கள் இல்லை" : "No Legal Advisors Found"}
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {lang === "ta" ? "வடிகட்டிகளை மாற்றவும் அல்லது புதிய சட்ட ஆலோசகரை பதிவு செய்யவும்." : "Try adjusting your filters or search keywords."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAdvisors.map((adv) => (
                <div
                  key={adv.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
                >
                  {/* Top Accent Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500" />

                  <div className="space-y-4">
                    {/* Header with Photo & Basic Info */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={adv.photoUrl || "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80"}
                          alt={adv.name}
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80";
                          }}
                        />
                        {adv.emergencyAvailable && (
                          <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 bg-rose-600 text-white rounded-md text-[9px] font-black uppercase tracking-wider shadow">
                            24x7
                          </span>
                        )}
                      </div>

                      <div className="flex-grow space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                            {adv.barCouncilRegNo}
                          </span>
                          <span className="text-[11px] font-extrabold text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {adv.experienceYears}+ {lang === "ta" ? "ஆண்டு அனுபவம்" : "Yrs Exp"}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                          {lang === "ta" ? adv.name : (adv.nameEn || adv.name)}
                        </h3>

                        <p className="text-xs font-bold text-amber-700">
                          {lang === "ta" ? adv.designation : (adv.designationEn || adv.designation)}
                        </p>

                        <p className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Scale className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{lang === "ta" ? adv.court : (adv.courtEn || adv.court)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Specialization & Scope */}
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-stone-700">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-stone-900 font-bold">{lang === "ta" ? "சிறப்பு சட்டப்பிரிவு: " : "Specialization: "}</strong>
                          <span>{lang === "ta" ? adv.specialization : (adv.specializationEn || adv.specialization)}</span>
                        </div>
                      </div>

                      {adv.officeAddress && (
                        <div className="flex items-start gap-1.5 text-stone-600 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{adv.officeAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Direct Contact Buttons */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${adv.phone}`}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-transform active:scale-95"
                        title="Direct Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{lang === "ta" ? "அழைக்க" : "Call"}</span>
                      </a>

                      {adv.whatsapp && (
                        <a
                          href={`https://wa.me/91${adv.whatsapp.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                            lang === "ta"
                              ? `வணக்கம் வழக்கறிஞர் ${adv.name} அவர்களே, தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் மூலம் சட்ட ஆலோசனை பெற விரும்புகிறேன்.`
                              : `Hello Adv. ${adv.nameEn || adv.name}, I am contacting you regarding legal consultation through TNPA² association.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={() => {
                          setConsForm(prev => ({
                            ...prev,
                            description: `Legal consultation requested specifically with ${adv.name} (${adv.barCouncilRegNo}). \nIssue details: `
                          }));
                          setActiveTab("request");
                        }}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        {lang === "ta" ? "ஆலோசனை கோரிக்கை" : "Consult"}
                      </button>
                    </div>

                    {/* Super Admin Edit / Delete Controls */}
                    {isSuperAdmin && (
                      <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                        <button
                          onClick={() => handleOpenEditModal(adv)}
                          className="p-1.5 text-indigo-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title={lang === "ta" ? "விவரங்களை திருத்து (Super Admin Only)" : "Edit Advisor"}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdvisor(adv.id, adv.name)}
                          className="p-1.5 text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title={lang === "ta" ? "நீக்கு (Super Admin Only)" : "Delete Advisor"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB CONTENT: STATUTORY LEGAL WARNING & DEFAMATION CIRCULAR */}
      {activeTab === "circular" && (
        <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-black uppercase text-red-700 tracking-wide">
                {lang === "ta" ? "அரசாங்க பதிவு பெற்ற அதிகாரப்பூர்வ சுற்றறிக்கை" : "Official Government Registered Legal Notice"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const textToCopy = `தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் (TNPA²)\nஅரசு பதிவு எண்: TNMDUJCLMDUTU- 50-26-00044\nமாநில சட்ட ஆலோசனைக் குழு - அதிகாரப்பூர்வ சட்ட எச்சரிக்கை சுற்றறிக்கை\nசுற்றறிக்கை எண்: TNPA/LEGAL-NOT/2026/044\n\nசங்கத்தின் பெயரையோ, மாநில பொறுப்பாளர்களையோ அவதூறு பரப்புவது, இழிவாக பேசுவது, மிரட்டல் விடுப்பது போன்ற செயல்களில் ஈடுபடுவோர் மீது பாரதிய நியாய சன்ஹிதா (BNS) 356, 351, 352, 336, 340, தகவல் தொழில்நுட்ப சட்டம் (IT Act) 66D, 67 பிரிவுகளின் கீழ் குற்றவியல் வழக்கு மற்றும் ₹1 கோடி வரை சிவில் நஷ்ட ஈடு வழக்கு தொடரப்படும்.\n\nமாநில சட்ட ஆலோசனைக் குழு, சென்னை உயர்நீதிமன்றம்.`;
                  navigator.clipboard.writeText(textToCopy);
                  setCopiedCircular(true);
                  setTimeout(() => setCopiedCircular(false), 3000);
                }}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-stone-300"
              >
                {copiedCircular ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCircular ? (lang === "ta" ? "நகலெடுக்கப்பட்டது!" : "Copied!") : (lang === "ta" ? "சுற்றறிக்கையை நகலெடு" : "Copy Notice Text")}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? "அச்சுப் பிரதி எடு / Print PDF" : "Print Circular (PDF)"}</span>
              </button>
            </div>
          </div>

          {/* OFFICIAL CIRCULAR PAPER DOCUMENT */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-red-300 relative overflow-hidden space-y-6 text-stone-900">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <Scale className="w-96 h-96 text-stone-950" />
            </div>

            {/* Letterhead Header */}
            <div className="border-b-4 border-red-700 pb-5 text-center space-y-2 relative z-10">
              <div className="flex justify-center items-center gap-3">
                <Scale className="w-10 h-10 text-red-700 shrink-0" />
                <div className="text-center">
                  <span className="text-[11px] sm:text-xs font-black tracking-widest text-red-700 uppercase block">
                    “ ஒன்று கூடுவோம், வென்று காட்டுவோம் ”
                  </span>
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-stone-950 tracking-tight leading-tight">
                    {lang === "ta"
                      ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்"
                      : "TAMIL NADU PAINTERS AND ARTISTS PROGRESSIVE ASSOCIATION"}
                  </h2>
                  <span className="text-xs sm:text-sm font-bold text-indigo-900 block font-mono mt-0.5">
                    {lang === "ta" ? "தமிழ்நாடு அரசு பதிவு எண்:" : "TN Govt Registration No:"} TNMDUJCLMDUTU- 50-26-00044
                  </span>
                </div>
              </div>

              <div className="bg-stone-100 py-1.5 px-4 rounded-xl border border-stone-200 flex flex-wrap justify-between items-center text-[11px] font-bold text-stone-700 font-mono mt-3">
                <span>{lang === "ta" ? "சுற்றறிக்கை எண்:" : "Circular Ref:"} TNPA/LEGAL-NOT/2026/044</span>
                <span className="text-red-700 uppercase">{lang === "ta" ? "மாநில சட்ட ஆலோசனைக் குழு - தலைமை அறிவிப்பு" : "State Legal Advisory Council Order"}</span>
                <span>{lang === "ta" ? "தேதி: 29 ஆகஸ்ட் 2026" : "Date: 29 August 2026"}</span>
              </div>
            </div>

            {/* Subject Banner */}
            <div className="bg-red-50 border-l-4 border-red-700 p-4 rounded-r-2xl space-y-1 relative z-10">
              <span className="text-[11px] font-black text-red-800 uppercase tracking-wide">
                {lang === "ta" ? "பொருள் / SUBJECT:" : "SUBJECT:"}
              </span>
              <h3 className="text-sm sm:text-base font-black text-red-950 leading-snug">
                {lang === "ta"
                  ? "தமிழ்நாடு அரசால் அங்கீகரிக்கப்பட்ட நமது சங்கத்தின் நற்பெயரையோ, பதிவு எண்ணையோ மற்றும் மாநில / மாவட்ட நிர்வாகப் பொறுப்பாளர்களை அவதூறு பரப்புதல், இழிவாகப் பேசுதல், மிரட்டல் விடுப்பது போன்ற சட்டவிரோத செயல்களில் ஈடுபடுவோர் மீது பாயும் கடுமையான குற்றவியல் வழக்குகள், IT Act சைபர் கிரைம் நடவடிக்கைகள் மற்றும் ₹1 கோடி வரையிலான சிவில் நஷ்ட ஈடு வழக்குகள் பற்றிய அதிகாரப்பூர்வ சட்ட எச்சரிக்கை சுற்றறிக்கை."
                  : "Statutory Legal Notice & Warning regarding strict criminal prosecution, non-bailable cybercrime booking, and civil defamation lawsuits up to ₹1,00,00,000 for spreading malicious rumors, defamation, verbal abuse, or intimidation against the Association or State Office Bearers."}
              </h3>
            </div>

            {/* Circular Detailed Body Content */}
            <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-stone-800 relative z-10">
              {/* Section 1: Official Standing & Registration */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <h4 className="font-black text-indigo-900 text-sm sm:text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-700" />
                  <span>1. சங்கத்தின் அரசு அங்கீகாரம் மற்றும் சட்டப் பாதுகாப்பு (Statutory Recognition & Legal Standing)</span>
                </h4>
                <p>
                  தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் என்பது தமிழ்நாடு அரசாங்கத்தின் கீழ் முறைப்படி பதிவு செய்யப்பட்ட (பதிவு எண்: <strong>TNMDUJCLMDUTU- 50-26-00044</strong>) சட்டப்பூர்வமான மாநிலப் பேரியக்கமாகும். இச்சங்கத்தின் பெயர், இலச்சினை (Logo), கொடி, முத்திரை மற்றும் அரசு ஆவணங்கள் யாவும் இந்திய சட்டங்களின் கீழ் முழுமையான சட்டப் பாதுகாப்பு பெற்றவையாகும்.
                </p>
              </div>

              {/* Section 2: Prohibited Illegal Acts */}
              <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
                <h4 className="font-black text-rose-900 text-sm sm:text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-700" />
                  <span>2. தடை செய்யப்பட்ட சட்டவிரோத அவதூறு & மிரட்டல் குற்றங்கள் (Prohibited Criminal Acts)</span>
                </h4>
                <p>
                  சங்கத்தின் உறுப்பினர்களோ அல்லது வெளிநபர்களோ யாரேனும் கீழ்க்கண்ட செயல்களில் ஈடுபட்டால் அது தீவிர சட்டவிரோத குற்றமாகக் கருதப்பட்டு உடனடி சட்ட நடவடிக்கை மேற்கொள்ளப்படும்:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-800 font-medium">
                  <li>வாட்ஸ்அப் (WhatsApp Groups/Status), பேஸ்புக் (Facebook), யூடியூப் (YouTube), இன்ஸ்டாகிராம், எக்ஸ் (X/Twitter) அல்லது பிற சமூக ஊடகங்களில் சங்கத்தின் மீதோ, மாநில தலைவர், பொதுச்செயலாளர், பொருளாளர் உள்ளிட்ட மாநில நிர்வாகப் பொறுப்பாளர்கள் மீதோ அவதூறு ஆடியோ, வீடியோ, போஸ்டர்கள் அல்லது வதந்திகளைப் பரப்புதல்.</li>
                  <li>மாநில, மாவட்ட பொறுப்பாளர்களை தொலைபேசி அல்லது நேரிலோ ஆபாசமாக, தகாத வார்த்தைகளால் திட்டுவது, அவமதிப்பது அல்லது மிரட்டல் விடுப்பது (Verbal Abuse & Criminal Threats).</li>
                  <li>சங்கத்தின் அதிகாரப்பூர்வ லோகோ, சீல், லெட்டர்ஹெட் அல்லது உறுப்பினர் அட்டைகளை போலியாக தயாரிப்பது அல்லது தவறாகப் பயன்படுத்துவது (Forgery & Fraud).</li>
                  <li>தொழிலாளர்களிடையே பிளவை ஏற்படுத்தவும், சங்கத்தின் நற்பெயரைக் குலைக்கவும் உள்நோக்கத்துடன் பொய் பிரச்சாரங்கள் செய்வது.</li>
                </ul>
              </div>

              {/* Section 3: Statutory Penal & Cyber Crime Provisions */}
              <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-3">
                <h4 className="font-black text-amber-950 text-sm sm:text-base flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-amber-700" />
                  <span>3. பாயும் கடுமையான குற்றவியல் & சைபர் கிரைம் சட்டப் பிரிவுகள் (Applicable Penal Provisions)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-1">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded font-mono text-[10px] font-black">
                      BNS பிரிவு 356 (IPC 499 / 500)
                    </span>
                    <h5 className="font-bold text-stone-900 text-xs">அவதூறு வழக்கு (Criminal Defamation)</h5>
                    <p className="text-[11px] text-stone-600">
                      சங்கம் அல்லது பொறுப்பாளர்களின் நற்பெயருக்கு களங்கம் விளைவித்தால் 2 ஆண்டுகள் வரை சிறைத் தண்டனை மற்றும் கடுமையான அபராதம்.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-1">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded font-mono text-[10px] font-black">
                      BNS பிரிவு 351 (IPC 506)
                    </span>
                    <h5 className="font-bold text-stone-900 text-xs">மிரட்டல் & அச்சுறுத்தல் (Criminal Intimidation)</h5>
                    <p className="text-[11px] text-stone-600">
                      பொறுப்பாளர்களை மிரட்டுவது அல்லது உயிருக்கு அச்சுறுத்தல் விடுத்தால் 7 ஆண்டுகள் வரை கடுமையான சிறைத் தண்டனை.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-1">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded font-mono text-[10px] font-black">
                      BNS பிரிவு 352 (IPC 504)
                    </span>
                    <h5 className="font-bold text-stone-900 text-xs">அமைதியை குலைக்கும் அவமதிப்பு (Intentional Insult)</h5>
                    <p className="text-[11px] text-stone-600">
                      பொது அமைதியை சீர்குலைக்கும் வகையில் ஆபாசமாக பேசுதல் மற்றும் திட்டுவதற்கு சிறைத் தண்டனை.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-1">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded font-mono text-[10px] font-black">
                      BNS பிரிவு 336 / 340 (IPC 468 / 471)
                    </span>
                    <h5 className="font-bold text-stone-900 text-xs">ஆவண மோசடி & போலி தயாரிப்பு (Forgery & Fraud)</h5>
                    <p className="text-[11px] text-stone-600">
                      சங்கத்தின் பெயரில் போலி முத்திரை அல்லது அட்டை தயாரித்தால் 7 ஆண்டுகள் சிறைத் தண்டனை.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-1 md:col-span-2">
                    <span className="px-2 py-0.5 bg-indigo-700 text-white rounded font-mono text-[10px] font-black">
                      IT Act 2000 பிரிவு 66D, 66E, 67 (Cyber Crime)
                    </span>
                    <h5 className="font-bold text-stone-900 text-xs">இணையவழி சைபர் கிரைம் அவதூறு குற்றங்கள்</h5>
                    <p className="text-[11px] text-stone-600">
                      வாட்ஸ்அப், பேஸ்புக் மற்றும் யூடியூப் மூலம் அவதூறு மற்றும் தகாத பதிவுகளை வெளியிடுவோர் மீது பிணையில்லா கைது, மொபைல்/கணினி பறிமுதல், ₹5,00,000 வரை அபராதம் மற்றும் 3 முதல் 5 ஆண்டுகள் சிறை.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Civil Defamation Lawsuit & Compensation */}
              <div className="p-5 bg-red-900 text-white rounded-2xl shadow-lg space-y-2">
                <h4 className="font-black text-amber-300 text-sm sm:text-base flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  <span>4. நீதிமன்ற சிவில் நஷ்ட ஈடு வழக்கு - ₹25 லட்சம் முதல் ₹1 கோடி வரை (Civil Defamation Damages)</span>
                </h4>
                <p className="text-stone-200 text-xs leading-relaxed">
                  குற்றவியல் வழக்கு மட்டுமின்றி, சங்கத்தின் கண்ணியத்திற்கும், மாநில நிர்வாகிகளின் பொது வாழ்விற்கும் நற்பெயருக்கும் ஏற்படுத்திய இழப்பிற்காக சென்னை உயர்நீதிமன்றம் மற்றும் முதன்மை மாவட்ட நீதிமன்றங்களில் சம்பந்தப்பட்ட நபர் மீது <strong className="text-amber-300 font-black">₹25,00,000 (ரூபாய் 25 லட்சம்) முதல் ₹1,00,00,000 (ரூபாய் 1 கோடி) வரை சிவில் நஷ்ட ஈடு வழக்கு (Civil Defamation Damages Suit)</strong> தாக்கல் செய்யப்படும். மேலும் வழக்கின் முழு செலவுத் தொகையும் நீதிமன்ற உத்தரவுப்படி குற்றவாளியிடமிருந்தே வசூலிக்கப்படும்.
                </p>
              </div>

              {/* Section 5: Police Action & Union Disciplinary Action */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <h4 className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span>5. காவல்துறை நேரடி புகார் & உடனடி உறுப்பினர் பதவி ரத்து (Disciplinary & Police Action)</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 pl-2 text-stone-700">
                  <li>மாநில சட்ட ஆலோசனைக் குழு மூலம் தமிழ்நாடு காவல்துறை தலைமை இயக்குநர் (DGP), சென்னை மாநகர காவல் ஆணையர் மற்றும் மாவட்ட சைபர் கிரைம் எஸ்பி அலுவலகங்களில் உடனடியாக முதல் தகவல் அறிக்கை (FIR) பதிவு செய்யப்படும்.</li>
                  <li>குற்றச்சாட்டுக்கு உள்ளாகும் நபர் சங்க உறுப்பினராக இருந்தால், அவரது உறுப்பினர் அட்டை உடனடியாக முடக்கப்பட்டு சங்கத்திலிருந்து <strong>நிரந்தரமாக நீக்கப்படுவார்</strong>. நலவாரிய உதவிகள் மற்றும் சங்க சலுகைகள் யாவும் உடனடியாக ரத்து செய்யப்படும்.</li>
                </ul>
              </div>
            </div>

            {/* Official Seal and Signatures */}
            <div className="border-t-2 border-stone-200 pt-6 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs relative z-10">
              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center">
                  <span className="font-signature text-stone-800 font-bold text-sm tracking-wider">Adv. K. Senthil Nathan</span>
                </div>
                <strong className="block text-stone-900 font-extrabold">அட்வகேட் கே. செந்தில் நாதன், B.L.</strong>
                <span className="text-stone-500 text-[11px] block">மாநில முதன்மை சட்ட ஆலோசகர்</span>
                <span className="text-[10px] text-stone-400 font-mono">சென்னை உயர்நீதிமன்றம் (MS/1142/2002)</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="w-16 h-16 rounded-full border-2 border-red-700 flex flex-col items-center justify-center text-[8px] font-black text-red-800 text-center leading-none uppercase p-1">
                  <span>TNPA²</span>
                  <Scale className="w-4 h-4 text-red-700 my-0.5" />
                  <span>LEGAL SEAL</span>
                </div>
                <span className="text-[9px] font-bold text-stone-500 mt-1">அதிகாரப்பூர்வ சட்ட முத்திரை</span>
              </div>

              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center">
                  <span className="font-signature text-stone-800 font-bold text-sm tracking-wider">R. Xavier Babu</span>
                </div>
                <strong className="block text-stone-900 font-extrabold">ரா. சேவியர் பாபு</strong>
                <span className="text-stone-500 text-[11px] block">மாநில பொதுச்செயலாளர்</span>
                <span className="text-[10px] text-stone-400 font-mono">தலைமை நிர்வாகக் குழு</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT 2: SUBMIT LEGAL CONSULTATION / AID */}
      {activeTab === "request" && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200 space-y-6">
          <div className="border-b border-stone-100 pb-4 text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "சங்க உறுப்பினர்களுக்கான பிரத்யேக சட்ட உதவி" : "Members Legal Aid Application"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              {lang === "ta" ? "சட்ட ஆலோசனை & உதவி கோரிக்கை படிவம்" : "Apply for Free Legal Consultation"}
            </h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {lang === "ta"
                ? "உங்கள் பணி விவகாரம், விபத்து இழப்பீடு அல்லது பொது சட்ட பிரச்சனை பற்றிய விவரங்களை உள்ளிடவும். மாநில சட்டக் குழுவினர் உங்களை நேரடியாக தொடர்புகொள்வார்கள்."
                : "Submit your legal query or dispute details. Our State Legal Advocates will evaluate your case and guide you."}
            </p>
          </div>

          {consSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span>{consSuccessMsg}</span>
                <p className="text-[11px] text-emerald-700 font-normal mt-0.5">
                  {lang === "ta" ? "அவசர உதவிக்கு: +91 94432 14567 எண்ணை அழைக்கலாம்." : "For emergencies call +91 94432 14567."}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitConsultation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "உறுப்பினர் / மனுதாரர் பெயர் *" : "Member / Applicant Name *"}
                </label>
                <input
                  type="text"
                  value={consForm.memberName}
                  onChange={(e) => setConsForm({ ...consForm, memberName: e.target.value })}
                  placeholder="ரா. குமார்"
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "கைபேசி எண் (WhatsApp) *" : "Mobile Number (WhatsApp) *"}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={consForm.memberPhone}
                  onChange={(e) => setConsForm({ ...consForm, memberPhone: e.target.value.replace(/\D/g, "") })}
                  placeholder="9840123456"
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "மாவட்டம் *" : "District *"}
                </label>
                <input
                  type="text"
                  value={consForm.memberDistrict}
                  onChange={(e) => setConsForm({ ...consForm, memberDistrict: e.target.value })}
                  placeholder="மதுரை"
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "வழக்கு / பிரச்சனை வகை *" : "Dispute / Case Category *"}
                </label>
                <select
                  value={consForm.caseType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    const labels: any = {
                      accident_compensation: "பணியிட விபத்து & காப்பீட்டு இழப்பீடு",
                      labor_dispute: "ஊதிய பாக்கி / தொழிலாளர் உரிமை பிரச்சனை",
                      police_complaint: "காவல்துறை புகார் / அச்சுறுத்தல் பாதுகாப்பு",
                      contract_dispute: "ஒப்பந்த பாக்கி & கட்டிட உரிமையாளர் தகராறு",
                      general_legal_advice: "பொது சட்ட ஆலோசனை & நலவாரிய உரிமைகள்"
                    };
                    setConsForm({
                      ...consForm,
                      caseType: val,
                      caseTypeTa: labels[val] || "பொது சட்ட ஆலோசனை"
                    });
                  }}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="accident_compensation">{lang === "ta" ? "பணியிட விபத்து & காப்பீட்டு இழப்பீடு (MACT)" : "Workplace Accident & MACT Claim"}</option>
                  <option value="labor_dispute">{lang === "ta" ? "ஊதிய பாக்கி / தொழிலாளர் உரிமை பிரச்சனை" : "Wage Recovery & Labor Rights"}</option>
                  <option value="contract_dispute">{lang === "ta" ? "ஒப்பந்த பாக்கி & கட்டிட உரிமையாளர் தகராறு" : "Contract Dispute & Defamation"}</option>
                  <option value="police_complaint">{lang === "ta" ? "காவல்துறை புகார் / அச்சுறுத்தல் பாதுகாப்பு" : "Police Matter & Emergency Aid"}</option>
                  <option value="general_legal_advice">{lang === "ta" ? "பொது சட்ட ஆலோசனை & நலவாரிய உதவி" : "General Legal Advice"}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === "ta" ? "பிரச்சனை / வழக்கு விவரம் (சுருக்கமாக) *" : "Case Details & Summary *"}
              </label>
              <textarea
                rows={4}
                value={consForm.description}
                onChange={(e) => setConsForm({ ...consForm, description: e.target.value })}
                placeholder={lang === "ta" ? "நடந்த சம்பவம், தேதி, சம்பந்தப்பட்ட இடம் மற்றும் உங்களுக்குத் தேவையான சட்ட உதவி பற்றி விவரிக்கவும்..." : "Describe the incident, dispute, location, and the specific legal support needed..."}
                required
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={consSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {consSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === "ta" ? "சமர்ப்பிக்கிறது..." : "Submitting Request..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{lang === "ta" ? "சட்ட உதவி கோரிக்கையை சமர்ப்பிக்கவும்" : "Submit Legal Aid Request"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 6. TAB CONTENT 3: ADMIN CASE REQUESTS DESK (Super Admin / Judicial) */}
      {activeTab === "cases" && isSuperAdmin && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  {lang === "ta" ? "உறுப்பினர்களின் சட்ட உதவி கோரிக்கைகள்" : "Members Legal Aid Requests Desk"}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === "ta" ? "மாநில சட்ட ஆலோசகர்களை ஒதுக்குங்கள் மற்றும் வழக்கு நிலையை புதுப்பியுங்கள்." : "Assign legal advisors to applicant cases and track resolution."}
                </p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-800 text-xs font-black rounded-full">
                {consultations.length} {lang === "ta" ? "கோரிக்கைகள்" : "Cases"}
              </span>
            </div>

            {consultations.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                {lang === "ta" ? "தற்போது நிலுவையில் உள்ள கோரிக்கைகள் எதுவும் இல்லை." : "No pending legal aid requests."}
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.map((c) => (
                  <div key={c.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-black text-stone-900">{c.memberName}</strong>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">
                          {c.caseTypeTa}
                        </span>
                        <span className="text-stone-500 font-mono">📍 {c.memberDistrict}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                        c.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <p className="text-stone-700 text-xs leading-relaxed bg-white p-3 rounded-xl border border-stone-200">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                        <span>📞 {c.memberPhone}</span>
                        <span>🗓️ {new Date(c.createdAt).toLocaleDateString("ta-IN")}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${c.memberPhone}`}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{lang === "ta" ? "தொடர்புகொள்ள" : "Call Member"}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT 4: LABOR RIGHTS KNOWLEDGE BASE */}
      {activeTab === "rights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-black text-sm">
              <Scale className="w-5 h-5 text-indigo-600" />
              <span>{lang === "ta" ? "1. தமிழ்நாடு உடலுழைப்பு தொழிலாளர் நல வாரியம்" : "1. TN Manual Workers Welfare Board"}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === "ta"
                ? "கட்டிட மற்றும் பெயிண்டிங் தொழிலாளர்கள் நல வாரியத்தில் பதிவு செய்திருந்தால் இயற்கை மரணம், விபத்து மரணம் (ரூ. 5,00,000), திருமண உதவி, மகப்பேறு உதவி, மற்றும் ஓய்வூதியம் பெற முழு சட்ட உரிமை உண்டு."
                : "Registered painters are entitled to Rs 5 Lakhs accident relief, pension, maternity assistance, and scholarship benefits under the statutory welfare board."}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-black text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{lang === "ta" ? "2. பணியிட விபத்து இழப்பீட்டு சட்டம் (EC Act)" : "2. Employee's Compensation Act"}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === "ta"
                ? "உயரமான கட்டிடங்களில் வண்ணம் பூசும்போது அல்லது சாரத்தில் ஏறி பணிபுரியும்போது விபத்து ஏற்பட்டால், உரிய இழப்பீடு மற்றும் மருத்துவ சிகிச்சை செலவை கட்டிட ஒப்பந்ததாரர் மற்றும் உரிமையாளர் வழங்குவது சட்டப்படி கட்டாயமாகும்."
                : "Contractors and building owners are legally bound under EC Act to cover medical expenses and statutory compensation for any workplace fall or accident."}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-black text-sm">
              <Award className="w-5 h-5 text-amber-600" />
              <span>{lang === "ta" ? "3. தொழிற்சங்க உரிமைகள் (Trade Unions Act 1926)" : "3. Trade Unions Legal Protection"}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === "ta"
                ? "சங்கத்தில் இணைந்து நியாயமான கூலி மற்றும் தொழிலாளர் நலனுக்காக குரல் எழுப்புவது இந்திய அரசியலமைப்பு சட்டம் மற்றும் தொழிற்சங்க சட்டம் 1926-ன் கீழ் பாதுகாக்கப்பட்ட அடிப்படை உரிமையாகும்."
                : "Collective bargaining, fair daily wages, and peaceful representation are constitutional rights protected under Trade Union Act 1926."}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-black text-sm">
              <BookOpen className="w-5 h-5 text-rose-600" />
              <span>{lang === "ta" ? "4. சங்கத்தின் இலவச சட்ட உதவி மையம்" : "4. TNPA² Free Legal Aid Cell"}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === "ta"
                ? "பொய் வழக்குகள், காவல் நிலைய அச்சுறுத்தல்கள் அல்லது ஒப்பந்ததாரர்களால் ஏமாற்றப்படும் பட்சத்தில் நமது மாநில சட்ட ஆலோசகர்கள் மூலம் இலவச சட்ட ஆலோசனை மற்றும் நீதிமன்ற வாதாடல் வழங்கப்படும்."
                : "Association provides free legal representation and advocate counsel for members facing unfair police action, harassment, or wage non-payment."}
            </p>
          </div>
        </div>
      )}

      {/* 8. SUPER ADMIN ADD / EDIT MODAL */}
      {isModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <Scale className="w-6 h-6" />
                <h3 className="text-lg sm:text-xl font-black text-stone-900">
                  {editingAdvisor
                    ? (lang === "ta" ? "மாநில சட்ட ஆலோசகர் விவரங்களை திருத்து" : "Edit Legal Advisor")
                    : (lang === "ta" ? "+ புதிய மாநில சட்ட வல்லுநரை பதிவு செய்க" : "+ Register New State Legal Advisor")}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdvisor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "வழக்கறிஞர் பெயர் (தமிழ்) *" : "Advocate Name (Tamil) *"}
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="அட்வகேட் கே. செந்தில் நாதன், B.L."
                    required
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "வழக்கறிஞர் பெயர் (English)" : "Advocate Name (English)"}
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn || ""}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Adv. K. Senthil Nathan, B.L."
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "பார் கவுன்சில் பதிவு எண் *" : "Bar Council Reg No *"}
                  </label>
                  <input
                    type="text"
                    value={formData.barCouncilRegNo || ""}
                    onChange={(e) => setFormData({ ...formData, barCouncilRegNo: e.target.value })}
                    placeholder="MS/1142/2002"
                    required
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "பதவி / பொறுப்பு *" : "Designation *"}
                  </label>
                  <input
                    type="text"
                    value={formData.designation || ""}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="மாநில முதன்மை சட்ட ஆலோசகர்"
                    required
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "நீதிமன்றம் / தீர்ப்பாயம் *" : "Court / Practice Level *"}
                  </label>
                  <input
                    type="text"
                    value={formData.court || ""}
                    onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                    placeholder="சென்னை உயர்நீதிமன்றம் & மதுரை கிளை"
                    required
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "மாவட்டம் *" : "District *"}
                  </label>
                  <input
                    type="text"
                    value={formData.district || ""}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="சென்னை"
                    required
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "தொலைபேசி எண் (அழைப்பு) *" : "Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="9443214567"
                    required
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "வாட்ஸ்அப் எண்" : "WhatsApp Number"}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.whatsapp || ""}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, "") })}
                    placeholder="9443214567"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "மின்னஞ்சல் முகவரி" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="advocate@example.com"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "அனுபவம் (ஆண்டுகள்)" : "Experience (Years)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formData.experienceYears || 10}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "சிறப்பு சட்டப்பிரிவு *" : "Specialization Areas *"}
                </label>
                <input
                  type="text"
                  value={formData.specialization || ""}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="தொழிலாளர் சட்டம், தொழிற்சங்க உரிமைகள், விபத்து இழப்பீடு"
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "அலுவலக முகவரி" : "Office Address"}
                </label>
                <textarea
                  rows={2}
                  value={formData.officeAddress || ""}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  placeholder="உயர்நீதிமன்ற வழக்கறிஞர் வளாகம், சென்னை"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "புகைப்பட இணைய முகவரி (Photo URL)" : "Photo URL"}
                </label>
                <input
                  type="url"
                  value={formData.photoUrl || ""}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={formData.emergencyAvailable !== false}
                    onChange={(e) => setFormData({ ...formData, emergencyAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{lang === "ta" ? "24x7 அவசர சட்ட ஆலோசனைக்கு தயார் (Emergency Available)" : "Available for 24x7 Emergency Aid"}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  {lang === "ta" ? "ரத்து" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === "ta" ? "சேமிக்கிறது..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === "ta" ? "பதிவு செய்க / சேமிக்க" : "Save Advisor"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
