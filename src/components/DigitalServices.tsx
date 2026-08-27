import React, { useState, useMemo, useEffect } from "react";
import { 
  Briefcase, 
  BookOpen, 
  Award, 
  AlertOctagon, 
  Map, 
  CheckSquare, 
  FileEdit, 
  HelpCircle, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle, 
  Download, 
  Printer, 
  Eye, 
  User, 
  Clock, 
  AlertTriangle, 
  Video, 
  FileText, 
  ChevronRight, 
  Send, 
  Sparkles, 
  Sun, 
  Moon, 
  PhoneCall, 
  Trash2,
  Lock,
  Compass,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";
import { UserAccount, AuditLog, KnowledgeArticle } from "../types";
import { motion, AnimatePresence } from "motion/react";

import HelpDeskVoiceTab from "./digital-services/HelpDeskVoiceTab";
import InsuranceLegalTab from "./digital-services/InsuranceLegalTab";
import SkillsContractorsTab from "./digital-services/SkillsContractorsTab";
import AchievementsTvTab from "./digital-services/AchievementsTvTab";
import SecurityHealthTab from "./digital-services/SecurityHealthTab";
import PainterJobsPortal from "./PainterJobsPortal";
import { useDigitalServicesState } from "../hooks/useDigitalServicesState";

interface DigitalServicesProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onAddAuditLog: (action: string, details: string) => void;
  langToggle: () => void;
}

// 1. Types for Digital Services
interface Job {
  id: string;
  title: string;
  titleEn: string;
  employer: string;
  district: string;
  skills: string;
  skillsEn: string;
  salary: string;
  duration: string;
  durationEn: string;
  phone: string;
  createdAt: string;
  applicationsCount: number;
  applied?: boolean;
  saved?: boolean;
}

interface Course {
  id: string;
  title: string;
  titleEn: string;
  category: "skills" | "safety" | "schemes" | "business" | "digital";
  desc: string;
  descEn: string;
  videoUrl: string;
  pdfUrl: string;
  quizQuestions: Array<{
    q: string;
    qEn: string;
    options: string[];
    optionsEn: string[];
    correctIndex: number;
  }>;
}

interface Certificate {
  id: string;
  recipientName: string;
  recipientNameEn: string;
  type: "training" | "workshop" | "volunteer";
  courseTitle: string;
  courseTitleEn: string;
  verificationId: string;
  issueDate: string;
  qrCodeUrl: string;
}

interface EmergencyRequest {
  id: string;
  memberName: string;
  memberPhone: string;
  category: "medical" | "accident" | "financial" | "disaster";
  district: string;
  details: string;
  status: "pending" | "dispatched" | "resolved";
  adminRemarks?: string;
  appliedAt: string;
}

interface Task {
  id: string;
  title: string;
  titleEn: string;
  assignedTo: "state_admin" | "district_admin" | "all";
  district?: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
  completedBy?: string;
}

export default function DigitalServices({
  lang: langProp,
  currentUser,
  onAddAuditLog,
  langToggle
}: DigitalServicesProps) {
  const lang = langProp;
  // Theme state: Independent premium toggle within digital services workspace
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("services_theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("services_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Global search inside services
  const [servicesQuery, setServicesQuery] = useState("");

  // --- KNOWLEDGE BASE MANAGEMENT STATES & METHODS (VERSION 18.0) ---
  const [kbArticles, setKbArticles] = useState<KnowledgeArticle[]>([]);
  const [kbLoading, setKbLoading] = useState(false);
  const [kbError, setKbError] = useState("");
  const [semanticSearching, setSemanticSearching] = useState(false);
  const [semanticAnswer, setSemanticAnswer] = useState<{ta: string, en: string} | null>(null);
  const [kbFallbackMsg, setKbFallbackMsg] = useState("");

  // Admin Form Controls
  const [showAddKbForm, setShowAddKbForm] = useState(false);
  const [editingKbId, setEditingKbId] = useState<string | null>(null);
  const [newKbTitle, setNewKbTitle] = useState("");
  const [newKbTitleEn, setNewKbTitleEn] = useState("");
  const [newKbCategory, setNewKbCategory] = useState<"rules" | "policies" | "materials" | "faq" | "schemes">("faq");
  const [newKbContent, setNewKbContent] = useState("");
  const [newKbContentEn, setNewKbContentEn] = useState("");

  const fetchKbArticles = async () => {
    setKbLoading(true);
    setKbError("");
    try {
      const res = await fetch("/api/kb");
      if (res.ok) {
        const data = await res.json();
        setKbArticles(data);
      } else {
        setKbError("Failed to fetch knowledge base articles from state server.");
      }
    } catch (err) {
      setKbError("Network error. Unable to synchronize with the Union KB database.");
    } finally {
      setKbLoading(false);
    }
  };



  const handleSemanticSearch = async () => {
    if (!servicesQuery.trim()) return;
    setSemanticSearching(true);
    setSemanticAnswer(null);
    setKbFallbackMsg("");
    try {
      const res = await fetch("/api/gemini/kb-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: servicesQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setSemanticAnswer({
          ta: data.answerTa,
          en: data.answerEn
        });
        if (data.results) {
          setKbArticles(data.results);
        }
        if (data.fallback) {
          setKbFallbackMsg(lang === "ta" ? data.answerTa : data.answerEn);
        }
      } else {
        setKbError("Semantic AI Search service temporarily offline.");
      }
    } catch (err) {
      setKbError("Failed to communicate with semantic search engine.");
    } finally {
      setSemanticSearching(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbTitle || !newKbTitleEn || !newKbContent || !newKbContentEn) {
      alert("Please fill in all fields / தயவுசெய்து அனைத்து விபரங்களையும் நிரப்பவும்.");
      return;
    }

    try {
      const isEditing = !!editingKbId;
      const url = isEditing ? `/api/kb/${editingKbId}` : "/api/kb";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newKbTitle,
          titleEn: newKbTitleEn,
          category: newKbCategory,
          content: newKbContent,
          contentEn: newKbContentEn,
          role: currentUser?.role
        })
      });

      if (res.ok) {
        onAddAuditLog(
          isEditing ? "Updated KB Article" : "Created KB Article",
          `Article: ${newKbTitleEn}`
        );
        setNewKbTitle("");
        setNewKbTitleEn("");
        setNewKbContent("");
        setNewKbContentEn("");
        setNewKbCategory("faq");
        setEditingKbId(null);
        setShowAddKbForm(false);
        fetchKbArticles();
      } else {
        const data = await res.json();
        alert(data.error || "Operation failed");
      }
    } catch (err) {
      alert("Error saving knowledge base article.");
    }
  };

  const handleEditArticle = (art: KnowledgeArticle) => {
    setEditingKbId(art.id);
    setNewKbTitle(art.title);
    setNewKbTitleEn(art.titleEn);
    setNewKbCategory(art.category);
    setNewKbContent(art.content);
    setNewKbContentEn(art.contentEn);
    setShowAddKbForm(true);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm(lang === "ta" ? "இந்த கொள்கை விளக்கக் கட்டுரையை நீக்கவா?" : "Are you sure you want to delete this policy article?")) return;
    try {
      const res = await fetch(`/api/kb/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentUser?.role })
      });
      if (res.ok) {
        onAddAuditLog("Deleted KB Article", `Article ID: ${id}`);
        fetchKbArticles();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete article.");
      }
    } catch (err) {
      alert("Error connecting to server for deletion.");
    }
  };

  // ==========================================
  // NEXT-GEN DIGITAL SERVICES STATE (PART 11)
  // ==========================================
  const {
    activeSubTab, setActiveSubTab,
    complaints, setComplaints,
    activeComplaintId, setActiveComplaintId,
    newCompSubject, setNewCompSubject,
    newCompCategory, setNewCompCategory,
    newCompDesc, setNewCompDesc,
    newCompDoc, setNewCompDoc,
    complaintChatInput, setComplaintChatInput,
    voiceResponse, setVoiceResponse,
    voiceInputActive, setVoiceInputActive,
    callbacks, setCallbacks,
    callPhone, setCallPhone,
    callDateTime, setCallDateTime,
    callTopic, setCallTopic,
    callConsent, setCallConsent,
    tasks, setTasks,
    insurancePolicies, setInsurancePolicies,
    claimPolicyId, setClaimPolicyId,
    claimReason, setClaimReason,
    claimDoc, setClaimDoc,
    skillSubmissions, setSkillSubmissions,
    submitSkills, setSubmitSkills,
    submitExp, setSubmitExp,
    submitPortfolio, setSubmitPortfolio,
    publishCompany, setPublishCompany,
    publishServices, setPublishServices,
    publishExp, setPublishExp,
    publishContact, setPublishContact,
    publishOptIn, setPublishOptIn,
    contractors, setContractors,
    opinionPolls, setOpinionPolls,
    mfaEnabled, setMfaEnabled,
    suspiciousLogins, setSuspiciousLogins,
    cpuLoad, setCpuLoad,
    dbHealth, setDbHealth,
    storageUsed, setStorageUsed,
    apiLatency, setApiLatency,
    systemErrorLogs, setSystemErrorLogs
  } = useDigitalServicesState();

  useEffect(() => {
    if (activeSubTab === "knowledge_base") {
      fetchKbArticles();
    }
  }, [activeSubTab]);

  // ==========================================
  // JOB PORTAL STATE & INITIAL DATA
  // ==========================================
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "job_1",
      title: "அதிநவீன அடுக்குமாடி குடியிருப்பு பெயிண்டிங் காண்ட்ராக்ட்",
      titleEn: "Modern High-Rise Apartment Spray Painting Project",
      employer: "Vasanth Builders & Co",
      district: "சென்னை",
      skills: "ஸ்ப்ரே பெயிண்டிங், மல்டி-கலர் ஃபினிஷிங்",
      skillsEn: "Spray painting, texture multi-finish",
      salary: "₹18,000 - ₹24,000 / மாதம்",
      duration: "3 மாதங்கள்",
      durationEn: "3 Months",
      phone: "9443212345",
      createdAt: "2026-08-01",
      applicationsCount: 14,
      applied: false,
      saved: false
    },
    {
      id: "job_2",
      title: "அலங்கார கலை ஓவியர் மற்றும் தூரிகை கலைஞர் தேவை",
      titleEn: "Artistic Wall Painter and Traditional Muralist Needed",
      employer: "Kovai Decor & Arts",
      district: "கோயம்புத்தூர்",
      skills: "தூரிகை வரைதல், சுவரோவியக் கலை",
      skillsEn: "Traditional murals, fine brush strokes",
      salary: "₹800 - ₹1,200 / நாள்",
      duration: "15 நாட்கள்",
      durationEn: "15 Days",
      phone: "9842198421",
      createdAt: "2026-08-02",
      applicationsCount: 6,
      applied: false,
      saved: true
    },
    {
      id: "job_3",
      title: "மாநில நெடுஞ்சாலை பெயிண்டிங் பணிகள்",
      titleEn: "State Highway Thermoplastic Paint Contract",
      employer: "TNP Highways Contractors",
      district: "மதுரை",
      skills: "ரோடு மார்க்கிங், தெர்மோபிளாஸ்டிக் மெஷின் ஆப்பரேட்டிங்",
      skillsEn: "Road marking machine, high-vis paints",
      salary: "₹15,000 - ₹20,000 / மாதம்",
      duration: "1 மாதம்",
      durationEn: "1 Month",
      phone: "9150091500",
      createdAt: "2026-08-03",
      applicationsCount: 8,
      applied: true,
      saved: false
    }
  ]);

  // Form states for posting a new job
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobTitleEn, setNewJobTitleEn] = useState("");
  const [newJobEmployer, setNewJobEmployer] = useState("");
  const [newJobDistrict, setNewJobDistrict] = useState("சென்னை");
  const [newJobSkills, setNewJobSkills] = useState("");
  const [newJobSkillsEn, setNewJobSkillsEn] = useState("");
  const [newJobSalary, setNewJobSalary] = useState("");
  const [newJobDuration, setNewJobDuration] = useState("");
  const [newJobDurationEn, setNewJobDurationEn] = useState("");
  const [newJobPhone, setNewJobPhone] = useState("");

  const [jobDistrictFilter, setJobDistrictFilter] = useState("all");

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobEmployer || !newJobPhone) return;

    const addedJob: Job = {
      id: `job_${Date.now()}`,
      title: newJobTitle,
      titleEn: newJobTitleEn || newJobTitle,
      employer: newJobEmployer,
      district: newJobDistrict,
      skills: newJobSkills || "பொது பெயிண்டிங் (General Painting)",
      skillsEn: newJobSkillsEn || "General Painting",
      salary: newJobSalary || "பணிக்கு ஏற்ப (As per work)",
      duration: newJobDuration || "தற்காலிக வேலை",
      durationEn: newJobDurationEn || "Temporary Contract",
      phone: newJobPhone,
      createdAt: new Date().toISOString().split("T")[0],
      applicationsCount: 0,
      applied: false,
      saved: false
    };

    setJobs(prev => [addedJob, ...prev]);
    onAddAuditLog("New Job Posted", `Contractor job "${addedJob.titleEn}" listed in ${addedJob.district} region.`);
    setShowAddJobModal(false);
    
    // Reset form
    setNewJobTitle("");
    setNewJobTitleEn("");
    setNewJobEmployer("");
    setNewJobSkills("");
    setNewJobSkillsEn("");
    setNewJobSalary("");
    setNewJobDuration("");
    setNewJobDurationEn("");
    setNewJobPhone("");
  };

  const handleApplyJob = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const isApp = !j.applied;
        onAddAuditLog(isApp ? "Job Applied" : "Job Application Withdrawn", `Member submitted registry proposal to "${j.titleEn}".`);
        return { ...j, applied: isApp, applicationsCount: j.applicationsCount + (isApp ? 1 : -1) };
      }
      return j;
    }));
  };

  const handleSaveJob = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, saved: !j.saved };
      }
      return j;
    }));
  };

  // ==========================================
  // TRAINING ACADEMY STATE & INITIAL DATA
  // ==========================================
  const academyCourses: Course[] = [
    {
      id: "course_1",
      title: "அதிநவீன ஸ்ப்ரே மற்றும் டெக்ஸ்சர் பெயிண்டிங் மாஸ்டர்கிளாஸ்",
      titleEn: "Advanced Airless Spray & Textured Wall Masterclass",
      category: "skills",
      desc: "இலகுவான ஏர்லெஸ் ஸ்ப்ரே மெஷின்களை பாதுகாப்பாக கையாளுதல், கம்பிரசர் அழுத்தம் சீரமைத்தல் மற்றும் சொரசொரப்பான சுவர்களில் நவீன டெக்ஸ்சர் வடிவங்களை வரையும் நேரடி பயிற்சி வகுப்புகள்.",
      descEn: "Practical instructions on handling airless spray compressors, tuning nozzle pressure parameters, and creating luxury patterns on multi-story wall surfaces.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Safe placeholder embeds
      pdfUrl: "TNP_Spray_Painting_Manual_v2026.pdf",
      quizQuestions: [
        {
          q: "ஸ்ப்ரே பெயிண்டிங் செய்யும்போது அதிகப்படியான அழுத்தத்தைத் தவிர்க்க எந்தக் கருவியைச் சரிசெய்ய வேண்டும்?",
          qEn: "Which regulator should be optimized to prevent paint blowback in airless sprayers?",
          options: ["பிரஷர் ரெகுலேட்டர் (Pressure Regulator)", "வால்வு (Nozzle Valve)", "பில்டர் (Filter Screen)", "டேங்க் கேப் (Tank Cap)"],
          optionsEn: ["Pressure Regulator", "Nozzle Valve", "Filter Screen", "Tank Cap"],
          correctIndex: 0
        },
        {
          q: "சுவருக்கு எவ்வளவு இடைவெளி தூரத்தில் ஸ்ப்ரே துப்பாக்கியை வைத்து பெயிண்ட் அடிக்க வேண்டும்?",
          qEn: "What is the recommended spray nozzle distance from the wall surface?",
          options: ["5-8 இன்ச் (5-8 inches)", "10-12 இன்ச் (10-12 inches)", "20 இன்ச் (20 inches)", "2 இன்ச் (2 inches)"],
          optionsEn: ["5-8 inches", "10-12 inches", "20 inches", "2 inches"],
          correctIndex: 1
        }
      ]
    },
    {
      id: "course_2",
      title: "கெமிக்கல் பெயிண்ட் கையாளுதல் மற்றும் உயிர் பாதுகாப்பு பயிற்சி",
      titleEn: "Chemical Paint Formulations & Hazardous Safety Protocols",
      category: "safety",
      desc: "காரீயம் (Lead-free) மற்றும் தீங்கு விளைவிக்கும் ஆவியாகும் கரிம சேர்மங்கள் (VOCs) கலந்த சாயங்களை எவ்வாறு கையாள்வது, சுவாசம் காக்கும் முகமூடி (Respirators) தேர்வு செய்யும் வழிமுறைகள்.",
      descEn: "Essential training on protective equipment selection, handling toxic solvents/thinners, and mitigating respiratory damage from volatile organic compounds.",
      videoUrl: "https://www.youtube.com/embed/y9e_VqZp8wE",
      pdfUrl: "TNP_Chemical_Safety_Bylaws.pdf",
      quizQuestions: [
        {
          q: "தீங்கு விளைவிக்கும் நச்சு வாயுக்கள் மற்றும் ஆவிகளிலிருந்து மூச்சுக்குழாயைப் பாதுகாக்க எதை அணிய வேண்டும்?",
          qEn: "Which safety equipment is mandatory to prevent inhalation of highly volatile solvent fumes?",
          options: ["சாதாரண துணி மாஸ்க் (Simple cloth mask)", "செயற்கை சுவாச முகமூடி (Cartridge Respirator)", "ஹெல்மெட் (Helmet)", "பாதுகாப்பு கண்ணாடி (Goggles)"],
          optionsEn: ["Simple cloth mask", "Cartridge Respirator", "Helmet", "Goggles"],
          correctIndex: 1
        }
      ]
    },
    {
      id: "course_3",
      title: "தமிழக அரசு கட்டுமான நலவாரிய சலுகைகள் மற்றும் விண்ணப்பிக்கும் முறை",
      titleEn: "Tamil Nadu Government Construction Welfare Scheme Enrollment",
      category: "schemes",
      desc: "அரசின் அதிகாரப்பூர்வ நலவாரிய அடையாள அட்டை பெறுவது எப்படி? மகப்பேறு நிதி உதவி, திருமண உதவி, விபத்து மற்றும் மாதாந்திர ஓய்வூதியம் பெறுவதற்கான எளிய படிநிலைகள்.",
      descEn: "Step-by-step guidance on registering with the official Tamil Nadu Construction Workers Board to secure state pension benefits, marriage incentives, and medical relief.",
      videoUrl: "https://www.youtube.com/embed/7X8uGNojHzo",
      pdfUrl: "TN_Welfare_Form_8.pdf",
      quizQuestions: [
        {
          q: "நலவாரியத்தில் பதிவு பெற ஒரு பெயிண்டர் குறைந்தபட்சம் எத்தனை நாட்கள் பெயிண்டிங் பணி செய்திருக்க வேண்டும்?",
          qEn: "What is the minimum number of working days required in a year to register with the Welfare Board?",
          options: ["30 நாட்கள் (30 Days)", "90 நாட்கள் (90 Days)", "180 நாட்கள் (180 Days)", "365 நாட்கள் (365 Days)"],
          optionsEn: ["30 Days", "90 Days", "180 Days", "365 Days"],
          correctIndex: 1
        }
      ]
    }
  ];

  // Training active course viewer & quiz state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  const handleStartCourse = (course: Course) => {
    setSelectedCourse(course);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
  };

  const handleSelectQuizOption = (questionIdx: number, optionIdx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  const handleSubmitQuiz = () => {
    if (!selectedCourse) return;
    let correctCount = 0;
    selectedCourse.quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const passed = correctCount === selectedCourse.quizQuestions.length;
    setQuizSubmitted(true);
    setQuizPassed(passed);

    if (passed) {
      onAddAuditLog("Course Quiz Passed", `Passed security / technical assessment for course: ${selectedCourse.titleEn}.`);
      
      // Auto-generate certificate for this member
      const newCert: Certificate = {
        id: `cert_${Date.now()}`,
        recipientName: currentUser?.name || "சங்க உறுப்பினர்",
        recipientNameEn: currentUser?.nameEn || "Union Member",
        type: "training",
        courseTitle: selectedCourse.title,
        courseTitleEn: selectedCourse.titleEn,
        verificationId: `TNP-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate: new Date().toISOString().split("T")[0],
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFIED-TNP-ASSOCIATION-ID-${Math.floor(100000 + Math.random() * 900000)}`
      };
      setCertificates(prev => [newCert, ...prev]);
    } else {
      onAddAuditLog("Course Quiz Failed", `Attempted and failed quiz for course: ${selectedCourse.titleEn}.`);
    }
  };

  // ==========================================
  // DIGITAL CERTIFICATES STATE & SEEDS
  // ==========================================
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "cert_1",
      recipientName: "மு. சிவக்குமார்",
      recipientNameEn: "M. Sivakumar",
      type: "training",
      courseTitle: "அதிநவீன ஸ்ப்ரே மற்றும் டெக்ஸ்சர் பெயிண்டிங் மாஸ்டர்கிளாஸ்",
      courseTitleEn: "Advanced Airless Spray & Textured Wall Masterclass",
      verificationId: "TNP-CERT-948301",
      issueDate: "2026-07-28",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFIED-TNP-ASSOCIATION-ID-948301"
    },
    {
      id: "cert_2",
      recipientName: "ரா. சேவியர் பாபு",
      recipientNameEn: "R. Xavier Babu",
      type: "volunteer",
      courseTitle: "சென்னை புயல் கால அவசர நிவாரண தன்னார்வலர்",
      courseTitleEn: "Chennai Monsoon Cyclone Emergency Volunteer Shield",
      verificationId: "TNP-VOL-402812",
      issueDate: "2026-06-15",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFIED-TNP-VOLUNTEER-402812"
    }
  ]);

  const [activeViewingCertificate, setActiveViewingCertificate] = useState<Certificate | null>(null);

  // ==========================================
  // EMERGENCY HELP STATE & REQUESTS
  // ==========================================
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([
    {
      id: "em_1",
      memberName: "சி. ரவிச்சந்திரன்",
      memberPhone: "9442104523",
      category: "accident",
      district: "மதுரை",
      details: "மதுரை அண்ணா நகரில் புதிய கட்டிடம் ஒன்றில் 2வது மாடியில் சாரக்கட்டு ஏறி பெயிண்ட் அடிக்கும் போது கால்தவறி விழுந்து இடது கையில் தீவிர எலும்பு முறிவு ஏற்பட்டுள்ளது. அவசர மருத்துவ உதவி தேவை.",
      status: "dispatched",
      adminRemarks: "மதுரை மாவட்ட செயலாளர் திரு. குமார் அவர்கள் உடனடியாக அப்பல்லோ மருத்துவமனைக்கு அனுப்பப்பட்டுள்ளார். ரூ. 10,000 அவசர நிதியாக வழங்கப்பட்டது.",
      appliedAt: "2026-08-03"
    },
    {
      id: "em_2",
      memberName: "ஏ. முகம்மது ரஃபீக்",
      memberPhone: "9865431210",
      category: "medical",
      district: "திருச்சிராப்பள்ளி",
      details: "தீவிர கண் ஒவ்வாமை (Severe paint solvent ocular allergy) காரணமாக அரசு கண் மருத்துவமனையில் அனுமதிக்கப்பட்டுள்ளார். மருந்து வாங்க அவசர நிதி உதவி தேவை.",
      status: "pending",
      appliedAt: "2026-08-04"
    }
  ]);

  // Submit Emergency form states
  const [newEmName, setNewEmName] = useState("");
  const [newEmPhone, setNewEmPhone] = useState("");
  const [newEmCategory, setNewEmCategory] = useState<"medical" | "accident" | "financial" | "disaster">("medical");
  const [newEmDistrict, setNewEmDistrict] = useState("சென்னை");
  const [newEmDetails, setNewEmDetails] = useState("");

  const [showEmModal, setShowEmModal] = useState(false);

  const handleSubmitEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmName || !newEmPhone || !newEmDetails) return;

    const addedEm: EmergencyRequest = {
      id: `em_${Date.now()}`,
      memberName: newEmName,
      memberPhone: newEmPhone,
      category: newEmCategory,
      district: newEmDistrict,
      details: newEmDetails,
      status: "pending",
      appliedAt: new Date().toISOString().split("T")[0]
    };

    setEmergencies(prev => [addedEm, ...prev]);
    onAddAuditLog("Emergency SOS Submitted", `SOS Raised by ${addedEm.memberName} (${addedEm.category}) in ${addedEm.district}.`);
    setShowEmModal(false);

    // Alert
    alert(lang === "ta" 
      ? "உங்கள் அவசர உதவி கோரிக்கை பதிவு செய்யப்பட்டுள்ளது. மாநில/மாவட்ட நிர்வாகிகள் உடனடியாக உங்களை தொடர்புகொள்வார்கள்!" 
      : "Your Emergency SOS has been broadcasted! Union coordinators are dispatched and will reach out to you.");

    // Reset Form
    setNewEmName("");
    setNewEmPhone("");
    setNewEmDetails("");
  };

  const handleResolveEmergency = (id: string, remarks: string) => {
    setEmergencies(prev => prev.map(em => {
      if (em.id === id) {
        onAddAuditLog("EmergencySOS Resolved", `SOS assistance updated to resolved state for member: ${em.memberName}.`);
        return { ...em, status: "resolved", adminRemarks: remarks };
      }
      return em;
    }));
  };

  const handleDispatchEmergency = (id: string) => {
    setEmergencies(prev => prev.map(em => {
      if (em.id === id) {
        onAddAuditLog("Emergency Rescue Dispatched", `State responders assigned to ${em.memberName}'s accident site.`);
        return { ...em, status: "dispatched", adminRemarks: "நிவாரணக் குழு அனுப்பப்பட்டுள்ளது. (Rescue team dispatched)" };
      }
      return em;
    }));
  };

  // ==========================================
  // MEMBER MAP DISTRICT-WISE DATA
  // ==========================================
  const districtMapStats = [
    { name: "சென்னை", count: 3450, coordX: 380, coordY: 50, activeCamps: 4, funds: "₹1,85,000" },
    { name: "கோயம்புத்தூர்", count: 2890, coordX: 80, coordY: 180, activeCamps: 3, funds: "₹1,40,000" },
    { name: "மதுரை", count: 2150, coordX: 180, coordY: 260, activeCamps: 2, funds: "₹95,000" },
    { name: "திருச்சிராப்பள்ளி", count: 1870, coordX: 230, coordY: 190, activeCamps: 2, funds: "₹72,000" },
    { name: "சேலம்", count: 1420, coordX: 200, coordY: 110, activeCamps: 1, funds: "₹50,000" },
    { name: "நெல்லை", count: 1100, coordX: 140, coordY: 340, activeCamps: 1, funds: "₹38,000" }
  ];

  const [hoveredMapDistrict, setHoveredMapDistrict] = useState<any | null>(null);

  // ==========================================
  // TASK MANAGEMENT STATE & SEEDS
  // ==========================================

  // New task form states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTitleEn, setNewTaskTitleEn] = useState("");
  const [newTaskAssigned, setNewTaskAssigned] = useState<"state_admin" | "district_admin" | "all">("district_admin");
  const [newTaskDistrict, setNewTaskDistrict] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const addedTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      titleEn: newTaskTitleEn || newTaskTitle,
      assignedTo: newTaskAssigned,
      district: newTaskDistrict || undefined,
      dueDate: newTaskDueDate || new Date().toISOString().split("T")[0],
      priority: newTaskPriority,
      status: "pending"
    };

    setTasks(prev => [addedTask, ...prev]);
    onAddAuditLog("Task Assigned", `New task "${addedTask.titleEn}" routed to regional units.`);
    setShowAddTaskModal(false);

    // Reset Form
    setNewTaskTitle("");
    setNewTaskTitleEn("");
    setNewTaskDistrict("");
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "completed" ? "pending" : "completed";
        onAddAuditLog("Task Progress Modified", `Union task ID ${t.id} set to ${nextStatus}.`);
        return {
          ...t,
          status: nextStatus as any,
          completedBy: nextStatus === "completed" ? (currentUser?.nameEn || "Union Admin") : undefined
        };
      }
      return t;
    }));
  };

  // ==========================================
  // AI DOCUMENT GENERATOR STATE & MOCKS
  // ==========================================
  const [genDocType, setGenDocType] = useState<
    "circular" | "notice" | "agenda" | "minutes" | "invitation" | "appreciation" | "membership"
  >("circular");
  const [genLanguage, setGenLanguage] = useState<"ta" | "en">("ta");
  
  // Custom form details
  const [genSubject, setGenSubject] = useState("");
  const [genRecipient, setGenRecipient] = useState("");
  const [genVenue, setGenVenue] = useState("");
  const [genDate, setGenDate] = useState("");

  const [generatedDocResult, setGeneratedDocResult] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const handleGenerateDocument = async () => {
    setDocLoading(true);
    setGeneratedDocResult(null);

    // Build smart local templates based on choices
    setTimeout(() => {
      let doc = "";
      const dateStr = genDate || "04-08-2026";
      const subjectStr = genSubject || "அதிநவீன பெயிண்டிங் பாதுகாப்பு விழிப்புணர்வு முகாம்";
      const subjectStrEn = genSubject || "Advanced Paint Chemical Safety Awareness Program";
      const recipientStr = genRecipient || "அனைத்து மாவட்ட செயலாளர்கள் மற்றும் சங்க உறுப்பினர்கள்";
      const recipientStrEn = genRecipient || "All Regional Secretaries and Members";
      const venueStr = genVenue || "சங்க தலைமை அலுவலகம், திருச்சி";
      const venueStrEn = genVenue || "Union Headquarters Conference Hall, Trichy";

      if (genDocType === "circular") {
        if (genLanguage === "ta") {
          doc = `தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
தலைமை அலுவலகம், சென்னை.
சுற்றறிக்கை எண்: TNP/HQ/CIRCULAR-2026/49

தேதி: ${dateStr}
பெறுநர்: ${recipientStr}

பொருள்: ${subjectStr} - சார்பாக.

மதிப்பிற்குரிய உறுப்பினர்களே மற்றும் மாவட்ட நிர்வாகிகளே,
நமது மாநில பொதுக்குழு முடிவின்படி, வரும் வாரங்களில் அனைத்து மாவட்டங்களிலும் பெயிண்டிங் பணிகளின் போது கையாளுப்படும் வேதிப்பொருள் ஒவ்வாமை தடுப்பு முகாம்கள் நடத்தப்பட வேண்டும். 10 அடிக்கு மேல் உயரத்தில் வேலை செய்யும்போது பாதுகாப்பு வளையங்கள் மற்றும் ஹெல்மெட்களை கட்டாயமாக அணிந்து பணி செய்ய மாவட்ட பொறுப்பாளர்கள் தங்கள் எல்லைக்கு உட்பட்ட பெயிண்டர்களை வலியுறுத்த கேட்டுக்கொள்ளப்படுகிறார்கள்.

இவண்,
ரா. சேவியர் பாபு
மாநில பொதுச்செயலாளர்.`;
        } else {
          doc = `TAMIL NADU PAINTERS AND ARTISTS ADVANCEMENT ASSOCIATION
Headquarters, Chennai.
Circular No: TNP/HQ/CIRCULAR-2026/49

Date: ${dateStr}
Recipient: ${recipientStrEn}

Subject: Urgent directives regarding "${subjectStrEn}".

Dear Regional Administrators and Enrolled Painters,
As resolved by the State Executive Committee, all district units must immediately host educational camps addressing toxic chemical inhalation risks (lead-free paint alternatives). Please mandate safety harness configurations for heights exceeding 10 feet to ensure total accident-free workspace zero-casualty metrics.

Sincerely,
R. Xavier Babu
State General Secretary.`;
        }
      } else if (genDocType === "notice") {
        if (genLanguage === "ta") {
          doc = `அறிவிப்பு பலகை செய்தி

தலைப்பு: ${subjectStr}
தேதி: ${dateStr}
நடைபெறும் இடம்: ${venueStr}

சங்க உறுப்பினர்களுக்கு அறிவிப்பது என்னவென்றால், மேலே குறிப்பிட்டுள்ள தேதி மற்றும் இடத்தில் நமது சங்கத்தின் சிறப்பு தொழில்நுட்ப செயல்முறை முகாம் மற்றும் அரசு சலுகைகள் குறித்த விழிப்புணர்வு வகுப்பு நடைபெற உள்ளது. உறுப்பினர்கள் அனைவரும் தவறாது தங்களது நலவாரிய அடையாள அட்டையுடன் பங்கேற்கவும்.

- மாநில நிர்வாகக் குழு.`;
        } else {
          doc = `OFFICIAL ANNOUNCEMENT

Subject: Notice of Workshop / Assembly on "${subjectStrEn}"
Date: ${dateStr}
Venue: ${venueStrEn}

All registered union members and painting contractors are hereby requested to assemble on the aforementioned date to review government-sponsored educational schemes and accidental insurance upgrades. Bring your digital union RFID membership card.

- State Governing Body.`;
        }
      } else if (genDocType === "agenda") {
        if (genLanguage === "ta") {
          doc = `கூட்ட நிகழ்ச்சி நிரல் (Meeting Agenda)

பொருள்: ${subjectStr}
கூட்ட தேதி: ${dateStr}
இடம்: ${venueStr}

நேர அட்டவணை மற்றும் விவாத தலைப்புகள்:
1. காலை 10:00 - தமிழ்த்தாய் வாழ்த்து மற்றும் வரவேற்புரை
2. காலை 10:15 - கடந்த கூட்ட நடவடிக்கைகளின் அறிக்கை சமர்ப்பித்தல்
3. காலை 10:45 - ${subjectStr} குறித்த மாநில அளவிலான விரிவான விவாதம்
4. மதியம் 12:30 - மாவட்ட வாரியாக புதிய சேர்க்கை விவரங்கள் ஆய்வு
5. மதியம் 01:30 - மதிய உணவு இடைவேளை
6. மதியம் 02:30 - உறுப்பினர் நலவாரிய கோரிக்கைகளுக்கு நிதி ஒதுக்கீடு செய்தல்
7. மாலை 04:30 - நன்றியுரை மற்றும் தேசிய கீதம்.`;
        } else {
          doc = `AGENDA OF THE GENERAL COUNCIL MEET

Topic: "${subjectStrEn}"
Schedule Date: ${dateStr}
Assembly Location: ${venueStrEn}

Topics for Executive Evaluation:
1. 10:00 AM - State Anthem and Inaugural Address
2. 10:15 AM - Reading and ratification of previous session's minutes
3. 10:45 AM - Detailed technical debate on "${subjectStrEn}"
4. 12:30 PM - Review of district-wise pending subscription collection ledgers
5. 01:30 PM - Lunch Recess
6. 02:30 PM - Emergency Welfare Board claim allocations and disbursements
7. 04:30 PM - Vote of Thanks and National Anthem adjournment.`;
        }
      } else if (genDocType === "appreciation") {
        if (genLanguage === "ta") {
          doc = `தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
பாராட்டுச் சான்றிதழ் / கடிதம்

பெறுநர்: ${recipientStr}

அன்பார்ந்த தோழருக்கு,
நமது சங்கத்தின் வளர்ச்சிக்கும், உறுப்பினர்களின் நலனுக்கும் தாங்கள் செய்த அர்ப்பணிப்புள்ள சேவையைப் பாராட்டி இக்கடிதம் வழங்கப்படுகிறது. குறிப்பாக, "${subjectStr}" திட்டத்தில் தாங்கள் ஆற்றிய நற்பணிகள் போற்றுதலுக்குரியவை. தங்களின் சமூகக் கடமை உணர்வு மற்றும் ஓவியர்கள் மீதான அன்பு சங்கத்தின் பெருமையை மேலும் உயர்த்தியுள்ளது.

வாழ்த்துகளுடன்,
மாநிலத் தலைவர்.`;
        } else {
          doc = `OFFICIAL APPRECIATION LETTER
Tamil Nadu Painters and Artists Advancement Association

To: ${recipientStrEn}

Dear Colleague,
The State Executive Committee proudly places on record its sincere appreciation for your outstanding service rendered to our fraternity. Your tireless support during the execution of "${subjectStrEn}" has significantly elevated our union's reach and social impact. We honor your volunteerism.

With Warm Regards,
State Executive Chairman.`;
        }
      } else if (genDocType === "membership") {
        if (genLanguage === "ta") {
          doc = `தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
உறுப்பினர் சான்றிதழ் (Certificate of Union Membership)

பெறுநர்: ${recipientStr}
உறுப்பினர் எண்: TNP-2026-REG-${Math.floor(1000 + Math.random() * 9000)}

சங்கத்தின் சட்ட விதிகளுக்கு உட்பட்டு, திரு/திருமதி. ${recipientStr} அவர்கள் தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தில் பதிவுபெற்ற வாழ்நாள் உறுப்பினராக அங்கீகரிக்கப்பட்டுள்ளார் என்பதை சான்றளிக்கிறோம்.

பதிவு தேதி: ${dateStr}
சரிபார்ப்பு எண்: TNP-MEM-${Math.floor(100000 + Math.random() * 900000)}

- மாநிலத் தலைமையகம், சென்னை.`;
        } else {
          doc = `TAMIL NADU PAINTERS AND ARTISTS ADVANCEMENT ASSOCIATION
CERTIFICATE OF COVENANT MEMBERSHIP

Awarded To: ${recipientStrEn}
Union Registry Number: TNP-2026-REG-${Math.floor(1000 + Math.random() * 9000)}

This is to certify that ${recipientStrEn} is an active, verified, and accredited lifelong member of the Tamil Nadu Painters and Artists Advancement Association, enjoying all rights and institutional welfare privileges.

Enrolment Date: ${dateStr}
Verification Hash: TNP-MEM-${Math.floor(100000 + Math.random() * 900000)}

- State Headquarters Office, Chennai.`;
        }
      } else {
        // Fallback default
        doc = `Document Content: ${subjectStrEn}`;
      }

      setGeneratedDocResult(doc);
      setDocLoading(false);
      onAddAuditLog("AI Document Generated", `Automated templates generated for type: ${genDocType}.`);
    }, 1200);
  };

  const handlePrintDoc = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; padding: 20px; white-space: pre-wrap;">${generatedDocResult}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // ==========================================
  // KNOWLEDGE CENTER REPOSITORY & SEEDS
  // ==========================================
  const knowledgeArticles: KnowledgeArticle[] = [
    {
      id: "kb_1",
      title: "சங்கத்தின் அடிப்படை சட்ட விதிகள் மற்றும் பைலா (Bylaws)",
      titleEn: "Union Core Constitution and Code of Conduct",
      category: "rules",
      content: "1. சங்கம் 1989-ல் பதிவு செய்யப்பட்டது.\n2. உறுப்பினர்கள் அனைவரும் கட்டாயம் 18 வயது பூர்த்தி அடைந்திருக்க வேண்டும்.\n3. ஆண்டு உறுப்பினர் புதுப்பித்தல் சந்தா ₹500.\n4. சங்க விரோத நடவடிக்கைகளில் ஈடுபடும் நபர்கள் மாநில தலைவர் ஒப்புதலுடன் நீக்கப்படுவார்கள்.",
      contentEn: "1. Established in 1989. 2. Min age requirement: 18 years. 3. Annual renewal fee set at ₹500. 4. Disciplinary issues resolved by the State Governing Body."
    },
    {
      id: "kb_2",
      title: "உயரமான இடங்களில் வேலை செய்யும்போது கடைபிடிக்க வேண்டிய பாதுகாப்பு விதிகள்",
      titleEn: "Fall Prevention Guidelines & Safety Belts Protocols",
      category: "policies",
      content: "1. 10 அடிக்கு மேல் வேலை செய்யும்போது டபுள்-ஹூக் சேஃப்டி பெல்ட் அணிய வேண்டும்.\n2. சாரக்கட்டு (Scaffolding) உறுதியாக உள்ளதா என்பதை ஒவ்வொரு முறையும் சரிபார்க்க வேண்டும்.\n3. காற்றோட்டம் இல்லாத அறைகளில் பெயிண்ட் அடிக்கும்போது மாஸ்க் கட்டாயம்.\n4. மின்சார கம்பிகள் அருகில் இருந்தால் எச்சரிக்கையுடன் இருக்கவும்.",
      contentEn: "1. Wearing dual-hook safety belts is compulsory beyond 10ft elevation. 2. Scaffolding lock systems must be inspected daily. 3. Ensure respiratory cartridges are in place in closed areas. 4. Maintain a 3-meter distance from high-tension power lines."
    },
    {
      id: "kb_3",
      title: "அரசு திருமண உதவி நிதிக்கு விண்ணப்பிப்பது எப்படி?",
      titleEn: "How to Apply for daughters' marriage welfare claims?",
      category: "schemes",
      content: "விண்ணப்பிக்க தேவையான ஆவணங்கள்:\n1. மணமகள்/மணமகன் ஆதார் கார்டு\n2. சங்க நலவாரிய அடையாள அட்டை நகல்\n3. திருமண அழைப்பிதழ் மற்றும் ஊராட்சி திருமண சான்றிதழ்\n4. குடும்ப அட்டை நகல் மற்றும் வங்கி கணக்கு புத்தகம்\n5. மாநில/மாவட்ட செயலாளரின் சான்றொப்பம் பெற்ற விண்ணப்ப படிவம்.",
      contentEn: "Required documentation: 1. Bride/Groom Aadhaar proof. 2. Welfare Board registration card. 3. Marriage invitation card and village administrative certificate. 4. Bank passbook with clear IFSC. 5. Signature verification from the District Union Secretary."
    }
  ];

  // Filtering knowledge base
  const filteredKBArticles = useMemo(() => {
    return knowledgeArticles.filter(art => {
      const q = servicesQuery.toLowerCase();
      if (!q) return true;
      return (
        art.title.toLowerCase().includes(q) ||
        art.titleEn.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        art.contentEn.toLowerCase().includes(q)
      );
    });
  }, [servicesQuery]);

  // Combined Search results across Members, Jobs, Training, Documents, Events
  const globalUnifiedSearchResults = useMemo(() => {
    const q = servicesQuery.toLowerCase().trim();
    if (!q) return null;

    const matchedJobs = jobs.filter(j => 
      j.titleEn.toLowerCase().includes(q) || j.title.toLowerCase().includes(q) || j.district.toLowerCase().includes(q)
    );

    const matchedCourses = academyCourses.filter(c => 
      c.titleEn.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    );

    const matchedCerts = certificates.filter(c => 
      c.recipientNameEn.toLowerCase().includes(q) || c.recipientName.toLowerCase().includes(q) || c.verificationId.toLowerCase().includes(q)
    );

    return {
      jobs: matchedJobs,
      courses: matchedCourses,
      certs: matchedCerts
    };
  }, [servicesQuery, jobs, certificates]);

  return (
    <div className={`p-4 sm:p-6 rounded-3xl transition-all duration-300 border ${
      darkMode 
        ? "bg-stone-950 text-stone-100 border-stone-800" 
        : "bg-white text-stone-800 border-stone-200 shadow-sm"
    }`}>
      
      {/* HEADER CONTROL BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-stone-200/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">
                {lang === "ta" ? "டிஜிட்டல் சேவைகள் மையம்" : "DIGITAL SERVICES & LEARNING PORTAL"}
              </h3>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                Tamil Nadu Painters Advancement Association Services Suite
              </p>
            </div>
          </div>
        </div>

        {/* Local Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Language switch */}
          <button
            onClick={langToggle}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 flex items-center gap-1 cursor-pointer transition-all"
          >
            {lang === "ta" ? "English 🇬🇧" : "தமிழ் 🇮🇳"}
          </button>

          {/* Toggle local Dark Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              darkMode 
                ? "bg-stone-900 border-stone-800 text-yellow-400 hover:bg-stone-800" 
                : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* SOS Flag Button */}
          <button
            onClick={() => {
              setNewEmCategory("accident");
              setNewEmDistrict("சென்னை");
              setShowEmModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase flex items-center gap-1.5 animate-pulse cursor-pointer shadow-md"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{lang === "ta" ? "அவசர SOS" : "EMERGENCY SOS"}</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL TAB NAVIGATION */}
      <div className="flex overflow-x-auto pb-3 mb-6 gap-2 border-b border-stone-200/50 scrollbar-none">
        {[
          { id: "job_portal", label: "வேலை வாய்ப்புகள்", labelEn: "Job Portal", icon: Briefcase },
          { id: "academy", label: "பயிற்சி மையம்", labelEn: "Training Academy", icon: BookOpen },
          { id: "certificates", label: "டிஜிட்டல் சான்றிதழ்", labelEn: "Digital Certificates", icon: Award },
          { id: "emergency", label: "அவசர உதவி (SOS)", labelEn: "Emergency Assistance", icon: AlertOctagon },
          { id: "member_map", label: "உறுப்பினர் வரைபடம்", labelEn: "District GIS Map", icon: Map },
          { id: "tasks", label: "நிர்வாகப் பணிகள்", labelEn: "Admin Task Tracker", icon: CheckSquare },
          { id: "doc_generator", label: "AI ஆவண இயற்றி", labelEn: "AI Document Gen", icon: FileEdit },
          { id: "knowledge_base", label: "அறிவு களஞ்சியம்", labelEn: "Knowledge Base", icon: HelpCircle },
          { id: "help_desk", label: "உதவி & குரல் AI ✨", labelEn: "Help Desk & Voice AI ✨", icon: PhoneCall },
          { id: "insurance_legal", label: "காப்பீடு & சட்ட உதவி", labelEn: "Insurance & Legal Hub", icon: AlertTriangle },
          { id: "skills_contractors", label: "திறன் & காண்ட்ராக்டர்", labelEn: "Skills & Contractors", icon: Award },
          { id: "achievements_tv", label: "டிவி & கருத்துக்கணிப்புகள்", labelEn: "Union TV & Opinions", icon: Video },
          { id: "security_health_decision", label: "பாதுகாப்பு & கணினி நலம்", labelEn: "Security & Health Hub", icon: Lock }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setServicesQuery(""); // reset search
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-md border-b-2 border-amber-500" 
                  : darkMode
                    ? "bg-stone-900/60 text-stone-300 hover:bg-stone-800"
                    : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/70"
              }`}
            >
              <IconComp className="w-4 h-4 shrink-0" />
              <span>{lang === "ta" ? tab.label : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* UNIFIED INTEGRATED SEARCH BAR */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-stone-400" />
        </div>
        <input
          type="text"
          value={servicesQuery}
          onChange={(e) => setServicesQuery(e.target.value)}
          placeholder={
            lang === "ta" 
              ? "வேலைகள், பயிற்சி வகுப்புகள், சான்றிதழ்கள், சட்ட விதிமுறைகள் என அனைத்தையும் தேடுங்கள்..." 
              : "Search across members, active contractor jobs, training academy, bylaws and certificate IDs..."
          }
          className={`w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs outline-none border transition-all ${
            darkMode 
              ? "bg-stone-900 border-stone-800 text-stone-200 focus:ring-1 focus:ring-indigo-500" 
              : "bg-stone-50 border-stone-200 text-stone-800 focus:ring-1 focus:ring-indigo-500"
          }`}
        />
        {servicesQuery && (
          <button 
            onClick={() => setServicesQuery("")} 
            className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-600 font-black"
          >
            ✕
          </button>
        )}
      </div>

      {/* SEARCH OUTPUT DRAWER (If query has input) */}
      {servicesQuery && globalUnifiedSearchResults && (
        <div className={`p-4 rounded-2xl mb-6 border border-dashed ${
          darkMode ? "bg-stone-900/40 border-stone-800" : "bg-indigo-50/40 border-indigo-200"
        }`}>
          <h4 className="text-xs font-black uppercase text-indigo-600 mb-3 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "ஒன்றிணைந்த தேடல் முடிவுகள்" : "Unified Search Hub Results"}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Jobs matches */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-stone-400">Jobs ({globalUnifiedSearchResults.jobs.length})</span>
              {globalUnifiedSearchResults.jobs.map((j, idx) => (
                <div key={`ds_srch_j_${j.id}_${idx}`} className="p-2 bg-stone-500/5 rounded-xl text-xs border border-stone-200/10">
                  <p className="font-extrabold">{lang === "ta" ? j.title : j.titleEn}</p>
                  <span className="text-[10px] text-stone-400">{j.district} | {j.employer}</span>
                </div>
              ))}
            </div>

            {/* Courses matches */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-stone-400">Academy Courses ({globalUnifiedSearchResults.courses.length})</span>
              {globalUnifiedSearchResults.courses.map((c, idx) => (
                <div key={`ds_srch_c_${c.id}_${idx}`} className="p-2 bg-stone-500/5 rounded-xl text-xs border border-stone-200/10">
                  <p className="font-extrabold">{lang === "ta" ? c.title : c.titleEn}</p>
                  <span className="text-[10px] text-stone-400 uppercase font-black text-rose-500">{c.category}</span>
                </div>
              ))}
            </div>

            {/* Certificates matches */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-stone-400">Certificates ({globalUnifiedSearchResults.certs.length})</span>
              {globalUnifiedSearchResults.certs.map((c, idx) => (
                <div key={`ds_srch_cert_${c.id}_${idx}`} className="p-2 bg-stone-500/5 rounded-xl text-xs border border-stone-200/10">
                  <p className="font-extrabold">{c.recipientNameEn}</p>
                  <span className="text-[10px] text-stone-400">{c.verificationId} | {c.issueDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TABS INTERACTIVE LAYOUT AREA */}
      <div>
        
        {/* TAB 1: JOB PORTAL */}
        {activeSubTab === "job_portal" && (
          <div className="space-y-6">
            <PainterJobsPortal
              lang={lang}
              currentUser={currentUser}
              registrations={[]}
              onAddAuditLog={onAddAuditLog}
            />

            {/* Post Job Modal */}
            {showAddJobModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
                  darkMode ? "bg-stone-900 border-stone-800 text-stone-200" : "bg-white border-stone-200 text-stone-800"
                }`}>
                  <div className="flex justify-between items-center border-b border-stone-200/20 pb-3 mb-4">
                    <h5 className="font-black text-sm uppercase text-indigo-600">
                      {lang === "ta" ? "புதிய வேலைவாய்ப்பு விவரம் பதிவேற்று" : "Post a New Painter Job Circular"}
                    </h5>
                    <button onClick={() => setShowAddJobModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
                  </div>

                  <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">JOB TITLE (TAMIL) *</label>
                        <input
                          type="text"
                          required
                          value={newJobTitle}
                          onChange={(e) => setNewJobTitle(e.target.value)}
                          placeholder="எ.கா: சுவரோவியக் கலைஞர் தேவை"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">JOB TITLE (ENGLISH)</label>
                        <input
                          type="text"
                          value={newJobTitleEn}
                          onChange={(e) => setNewJobTitleEn(e.target.value)}
                          placeholder="e.g. Artistic Wall Painter Needed"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">CONTRACTOR NAME *</label>
                        <input
                          type="text"
                          required
                          value={newJobEmployer}
                          onChange={(e) => setNewJobEmployer(e.target.value)}
                          placeholder="e.g. Kovai Decors"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">DISTRICT *</label>
                        <select
                          value={newJobDistrict}
                          onChange={(e) => setNewJobDistrict(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        >
                          <option value="சென்னை">சென்னை</option>
                          <option value="கோயம்புத்தூர்">கோயம்புத்தூர்</option>
                          <option value="மதுரை">மதுரை</option>
                          <option value="திருச்சிராப்பள்ளி">திருச்சிராப்பள்ளி</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">SKILLS REQUIRED (TAMIL)</label>
                        <input
                          type="text"
                          value={newJobSkills}
                          onChange={(e) => setNewJobSkills(e.target.value)}
                          placeholder="ஸ்ப்ரே பெயிண்டிங்"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">SKILLS (ENGLISH)</label>
                        <input
                          type="text"
                          value={newJobSkillsEn}
                          onChange={(e) => setNewJobSkillsEn(e.target.value)}
                          placeholder="Spray operating"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">SALARY RANGE</label>
                        <input
                          type="text"
                          value={newJobSalary}
                          onChange={(e) => setNewJobSalary(e.target.value)}
                          placeholder="₹15,000"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">DURATION</label>
                        <input
                          type="text"
                          value={newJobDuration}
                          onChange={(e) => setNewJobDuration(e.target.value)}
                          placeholder="3 மாதங்கள்"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">MOBILE PHONE *</label>
                        <input
                          type="text"
                          required
                          value={newJobPhone}
                          onChange={(e) => setNewJobPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddJobModal(false)}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold cursor-pointer"
                      >
                        {lang === "ta" ? "ரத்து செய்" : "Cancel"}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black cursor-pointer"
                      >
                        {lang === "ta" ? "விளம்பரத்தை வெளியிடு" : "Publish Job Post"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRAINING ACADEMY */}
        {activeSubTab === "academy" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-black uppercase text-indigo-600">
                {lang === "ta" ? "டிஜிட்டல் பெயிண்டிங் அகாடமி" : "Painters Academy of Technical Skills"}
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                {lang === "ta" 
                  ? "நவீன தொழில்முறைகள், கெமிக்கல் பாதுகாப்பு விதிமுறைகள் மற்றும் அரசு திட்டங்கள் குறித்த சான்றளிக்கப்பட்ட வகுப்புகள்" 
                  : "Interactive multimedia guides, chemical protective protocols, and exam-backed certificate generation."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Courses list column */}
              <div className="lg:col-span-1 space-y-4">
                <span className="text-[10px] font-extrabold uppercase text-stone-400 block tracking-wider">
                  {lang === "ta" ? "கிடைக்கக்கூடிய பாடப் பிரிவுகள்" : "E-Learning Curriculum Courses"}
                </span>

                {academyCourses.map((c, idx) => (
                  <button
                    key={`ds_crs_${c.id}_${idx}`}
                    onClick={() => handleStartCourse(c)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                      selectedCourse?.id === c.id
                        ? "bg-indigo-50 border-indigo-300 shadow-sm"
                        : darkMode
                          ? "bg-stone-900/40 border-stone-800 hover:bg-stone-800"
                          : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[8px] uppercase tracking-wider font-extrabold">
                        {c.category}
                      </span>
                      <h5 className="text-xs font-black text-stone-800 mt-1">
                        {lang === "ta" ? c.title : c.titleEn}
                      </h5>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))}
              </div>

              {/* Active course study module */}
              <div className="lg:col-span-2">
                {selectedCourse ? (
                  <div className={`p-5 rounded-2xl border ${
                    darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200 shadow"
                  }`}>
                    <div className="flex justify-between items-start border-b border-stone-200/20 pb-3.5 mb-4">
                      <div>
                        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-[9px] uppercase tracking-wider font-black">
                          {selectedCourse.category} course
                        </span>
                        <h4 className="text-sm font-extrabold text-stone-900 mt-1.5">
                          {lang === "ta" ? selectedCourse.title : selectedCourse.titleEn}
                        </h4>
                      </div>
                      <button onClick={() => setSelectedCourse(null)} className="text-xs text-stone-400 hover:text-stone-600 font-extrabold">✕ Close</button>
                    </div>

                    {/* Multimedia Simulation Window */}
                    <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 relative group flex items-center justify-center border border-stone-800 shadow">
                      {selectedCourse.videoUrl && (selectedCourse.videoUrl.includes("youtube.com") || selectedCourse.videoUrl.includes("youtu.be")) ? (
                        <iframe
                          src={`${selectedCourse.videoUrl}${selectedCourse.videoUrl.includes("?") ? "&" : "?"}autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
                          title={selectedCourse.title}
                          className="w-full h-full border-0 absolute inset-0 z-10"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          controls
                          autoPlay
                          playsInline
                          poster="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop"
                          className="w-full h-full object-contain"
                          src={selectedCourse.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <div className="absolute top-2 left-2 z-20 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>TNPA² YouTube Masterclass</span>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-stone-600 mb-6">
                      {lang === "ta" ? selectedCourse.desc : selectedCourse.descEn}
                    </p>

                    {/* Resources */}
                    <div className="flex gap-3 mb-6">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Downloading course workbook: ${selectedCourse.pdfUrl}`);
                        }}
                        className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{lang === "ta" ? "பாடக்குறிப்புகள் பதிவிறக்கு (PDF)" : "Download Notes (PDF)"}</span>
                      </a>
                    </div>

                    {/* Interactive Certification Quiz */}
                    <div className="border-t border-stone-200/20 pt-5 mt-5">
                      <h5 className="text-xs font-black uppercase text-indigo-600 mb-3 flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{lang === "ta" ? "சான்றிதழ் வினாடி-வினா மதிப்பீடு" : "Technical Certification Assessment"}</span>
                      </h5>

                      <div className="space-y-5">
                        {selectedCourse.quizQuestions.map((q, qIdx) => (
                          <div key={qIdx} className="space-y-2">
                            <p className="font-extrabold text-xs text-stone-800">
                              Q{qIdx + 1}: {lang === "ta" ? q.q : q.qEn}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              {(lang === "ta" ? q.options : q.optionsEn).map((opt, optIdx) => {
                                const isSelected = quizAnswers[qIdx] === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    disabled={quizSubmitted}
                                    onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                    className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                                      isSelected
                                        ? "bg-indigo-600 text-white border-indigo-700 shadow"
                                        : darkMode
                                          ? "bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800"
                                          : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* Submit Actions */}
                        {!quizSubmitted ? (
                          <button
                            onClick={handleSubmitQuiz}
                            disabled={Object.keys(quizAnswers).length < selectedCourse.quizQuestions.length}
                            className={`w-full py-2.5 rounded-xl text-xs font-black uppercase cursor-pointer transition-all text-center ${
                              Object.keys(quizAnswers).length < selectedCourse.quizQuestions.length
                                ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                            }`}
                          >
                            {lang === "ta" ? "விடைகளைச் சமர்ப்பி" : "Submit Examination answers"}
                          </button>
                        ) : (
                          <div className={`p-4 rounded-xl text-center border ${
                            quizPassed 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                              : "bg-red-50 border-red-200 text-red-800"
                          }`}>
                            <h6 className="font-black text-xs uppercase mb-1">
                              {quizPassed 
                                ? (lang === "ta" ? "தேர்வில் வெற்றி! சான்றிதழ் தயாராக உள்ளது." : "EXAMINATION PASSED SUCCESSFULLY!") 
                                : (lang === "ta" ? "தோல்வி! மீண்டும் முயற்சிக்கவும்." : "ASSESSMENT FAILED")}
                            </h6>
                            <p className="text-[10px] opacity-90">
                              {quizPassed 
                                ? (lang === "ta" ? "டிஜிட்டல் சான்றிதழ் பகுதியில் உங்கள் சான்றிதழைப் பார்க்கலாம்/அச்சிடலாம்." : "Your training credentials have been appended to the digital vault.")
                                : (lang === "ta" ? "பாடப் பகுதிகளை மீண்டும் படித்துவிட்டு முயற்சிக்கவும்." : "Please review the notes and try the quiz again.")}
                            </p>
                            {!quizPassed && (
                              <button
                                onClick={() => {
                                  setQuizSubmitted(false);
                                  setQuizAnswers({});
                                }}
                                className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-extrabold cursor-pointer uppercase"
                              >
                                {lang === "ta" ? "மீண்டும் எழுதுக" : "Retry Quiz"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-indigo-200 mb-2" />
                    <span>{lang === "ta" ? "பாடத்தைத் தேர்வு செய்து பயிற்சியைத் துவங்குங்கள்" : "Select an active course on the left to begin learning"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DIGITAL CERTIFICATES */}
        {activeSubTab === "certificates" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-black uppercase text-indigo-600">
                {lang === "ta" ? "டிஜிட்டல் சான்றிதழ் பெட்டகம்" : "Accredited Painting Credentials"}
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                {lang === "ta" 
                  ? "தேர்வில் தேர்ச்சி பெற்ற வகுப்புகள் மற்றும் சங்கப் பணிகளுக்காக வழங்கப்பட்ட சரிபார்க்கக்கூடிய சான்றிதழ்கள்" 
                  : "Cryptographically verifiable union badges and course completion credentials."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert, idx) => (
                <div
                  key={`ds_crt_${cert.id}_${idx}`}
                  className={`p-6 rounded-3xl border relative transition-all ${
                    darkMode 
                      ? "bg-stone-900 border-stone-800" 
                      : "bg-[#fffdf9] border-stone-300/80 shadow hover:shadow-md"
                  }`}
                >
                  {/* Decorative vintage border for certificate */}
                  <div className="absolute inset-2 border border-dashed border-amber-600/30 rounded-2xl pointer-events-none" />

                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                      OFFICIAL TNP CERTIFICATE
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold">{cert.issueDate}</span>
                  </div>

                  <h5 className="text-center font-black text-xs text-stone-900 uppercase">
                    {lang === "ta" ? "நற்சான்றிதழ்" : "Certificate of Achievement"}
                  </h5>

                  <div className="text-center my-4 space-y-1">
                    <p className="text-[10px] text-stone-400 italic">This is proudly awarded to</p>
                    <p className="text-sm font-extrabold text-stone-900 decoration-amber-500 underline underline-offset-4">
                      {lang === "ta" ? cert.recipientName : cert.recipientNameEn}
                    </p>
                    <p className="text-[10px] text-stone-400 italic pt-1">for successful technical completion of</p>
                    <p className="text-xs font-black text-indigo-900">
                      {lang === "ta" ? cert.courseTitle : cert.courseTitleEn}
                    </p>
                  </div>

                  <div className="flex justify-between items-end border-t border-stone-200/40 pt-4 mt-4">
                    <div className="space-y-0.5 text-[9px] text-stone-400">
                      <p>Verification ID: <span className="font-mono text-stone-700 font-extrabold">{cert.verificationId}</span></p>
                      <p>Authority: Tamil Nadu Painters Association Council</p>
                    </div>

                    {/* QR Code and Actions */}
                    <div className="flex items-center gap-3">
                      <img
                        src={cert.qrCodeUrl}
                        alt="Verification QR"
                        className="w-12 h-12 border border-stone-200 rounded p-0.5 shrink-0 bg-white"
                      />
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            alert(`Downloading verified credentials package ${cert.verificationId}.pdf`);
                          }}
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[9px] font-bold cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveViewingCertificate(cert);
                          }}
                          className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Print Certificate Viewer Modal */}
            {activeViewingCertificate && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="w-full max-w-3xl bg-white rounded-3xl p-8 border-4 border-amber-600 shadow-2xl relative text-stone-800">
                  <div className="absolute inset-4 border border-dashed border-amber-600/40 pointer-events-none" />

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <Award className="w-8 h-8 text-amber-600" />
                      <div>
                        <h4 className="font-black text-xs uppercase tracking-wider text-amber-800">
                          TAMIL NADU PAINTERS ASSOCIATION
                        </h4>
                        <p className="text-[8px] text-stone-500 font-bold uppercase">Accredited Digital Registry, Chennai</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveViewingCertificate(null)}
                      className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs rounded-xl cursor-pointer"
                    >
                      ✕ CLOSE
                    </button>
                  </div>

                  <div className="text-center space-y-5 my-8">
                    <p className="font-serif text-lg text-amber-800 tracking-wide font-black uppercase">
                      CERTIFICATE OF EXCELLENCE
                    </p>
                    <p className="text-stone-400 italic text-xs">This is awarded in recognition of merit to</p>
                    <p className="text-2xl font-black font-serif underline decoration-amber-500 underline-offset-8 text-stone-900">
                      {activeViewingCertificate.recipientNameEn}
                    </p>
                    <p className="text-stone-400 italic text-xs">for demonstrating high efficiency and successfully passing assessments on</p>
                    <p className="text-md font-black text-indigo-950 uppercase tracking-tight">
                      {activeViewingCertificate.courseTitleEn}
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed max-w-lg mx-auto">
                      Issued under institutional seals of the central administration. Verified via scanning the digital blockchain signature QR block.
                    </p>
                  </div>

                  <div className="flex justify-between items-end border-t border-stone-200 pt-6 mt-8">
                    <div className="space-y-1 text-[10px] text-stone-500 text-left">
                      <p>CERTIFICATE ID: <span className="font-mono text-stone-900 font-extrabold">{activeViewingCertificate.verificationId}</span></p>
                      <p>VERIFICATION: VERIFIED ONLINE REGISTRY SECURE DATABASE</p>
                      <p>ISSUE DATE: {activeViewingCertificate.issueDate}</p>
                    </div>

                    <div className="text-center flex items-center gap-4">
                      <img
                        src={activeViewingCertificate.qrCodeUrl}
                        alt="QR"
                        className="w-16 h-16 border p-0.5 bg-white"
                      />
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Printer className="w-4 h-4" />
                        <span>PRINT CERTIFICATE</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EMERGENCY SOS HELPLINE */}
        {activeSubTab === "emergency" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-sm font-black uppercase text-red-600">
                  {lang === "ta" ? "அவசரக் கால உதவி மையம் (SOS)" : "Emergency Disaster & Accident SOS Line"}
                </h4>
                <p className="text-xs text-stone-400 mt-1">
                  {lang === "ta" 
                    ? "பணியிட விபத்துக்கள் அல்லது அவசரத் தேவைகளுக்காக மாநில உதவிக் குழுவை உடனடியாக அழைக்கவும்" 
                    : "Real-time dispatch controls for on-site painter accidents and medical emergencies."}
                </p>
              </div>

              <button
                onClick={() => setShowEmModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 animate-ping" />
                <span>{lang === "ta" ? "உதவி கோரிக்கை அனுப்பு" : "Raise SOS Alert"}</span>
              </button>
            </div>

            {/* Active Emergencies Tracker list */}
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-stone-400 block tracking-wider">
                {lang === "ta" ? "நடப்பு அவசர கோரிக்கைகள்" : "Active SOS Dispatches"}
              </span>

              {emergencies.map((em, idx) => (
                <div
                  key={`ds_em_${em.id}_${idx}`}
                  className={`p-5 rounded-2xl border transition-all ${
                    em.status === "pending" 
                      ? "bg-red-50/50 border-red-200" 
                      : em.status === "dispatched"
                        ? "bg-amber-50/50 border-amber-200"
                        : "bg-stone-50 border-stone-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-stone-200/10 pb-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        em.status === "pending" 
                          ? "bg-red-100 text-red-800" 
                          : em.status === "dispatched"
                            ? "bg-amber-100 text-amber-800 animate-pulse"
                            : "bg-green-100 text-green-800"
                      }`}>
                        {em.status}
                      </span>
                      <span className="px-2 py-0.5 bg-stone-900 text-white rounded text-[8px] uppercase tracking-wider font-extrabold">
                        {em.category}
                      </span>
                      <span className="text-xs font-extrabold text-stone-800">{em.memberName}</span>
                    </div>

                    <span className="text-[10px] text-stone-400 font-bold">{em.appliedAt} | {em.district}</span>
                  </div>

                  <p className="text-xs leading-relaxed text-stone-700 font-semibold mb-4">
                    {em.details}
                  </p>

                  {em.adminRemarks && (
                    <div className="p-3 bg-white/60 border border-stone-200/50 rounded-xl text-xs text-stone-600 mb-4">
                      <span className="font-extrabold text-stone-800 block mb-1">Response Coordination Action:</span>
                      {em.adminRemarks}
                    </div>
                  )}

                  {/* Actions for Admins / Responders */}
                  {em.status !== "resolved" && (
                    <div className="flex gap-2 justify-end border-t border-stone-200/15 pt-3">
                      {em.status === "pending" && (
                        <button
                          onClick={() => handleDispatchEmergency(em.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase cursor-pointer"
                        >
                          Dispatch Team
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const rem = prompt("Enter rescue coordination details & funding comments:") || "";
                          if (rem) handleResolveEmergency(em.id, rem);
                        }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-black uppercase cursor-pointer"
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Raise SOS modal */}
            {showEmModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
                  darkMode ? "bg-stone-900 border-stone-800 text-stone-200" : "bg-white border-stone-200 text-stone-800"
                }`}>
                  <div className="flex justify-between items-center border-b border-stone-200/20 pb-3 mb-4">
                    <h5 className="font-black text-sm uppercase text-red-600 flex items-center gap-1">
                      <AlertOctagon className="w-5 h-5 text-red-600 animate-ping" />
                      <span>{lang === "ta" ? "அவசர SOS உதவி கோரிக்கை" : "RAISE EMERGENCY DISPATCH"}</span>
                    </h5>
                    <button onClick={() => setShowEmModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
                  </div>

                  <form onSubmit={handleSubmitEmergency} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 mb-1">MEMBER NAME *</label>
                      <input
                        type="text"
                        required
                        value={newEmName}
                        onChange={(e) => setNewEmName(e.target.value)}
                        placeholder="எ.கா: மு. சிவகுமார்"
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">MOBILE PHONE *</label>
                        <input
                          type="text"
                          required
                          value={newEmPhone}
                          onChange={(e) => setNewEmPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">DISTRICT *</label>
                        <select
                          value={newEmDistrict}
                          onChange={(e) => setNewEmDistrict(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        >
                          <option value="சென்னை">சென்னை</option>
                          <option value="கோயம்புத்தூர்">கோயம்புத்தூர்</option>
                          <option value="மதுரை">மதுரை</option>
                          <option value="திருச்சிராப்பள்ளி">திருச்சிராப்பள்ளி</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 mb-1">EMERGENCY CATEGORY</label>
                      <select
                        value={newEmCategory}
                        onChange={(e) => setNewEmCategory(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                      >
                        <option value="medical">மருத்துவ அவசரம் (Medical Emergency)</option>
                        <option value="accident">பணி விபத்து (Workplace Accident)</option>
                        <option value="financial">கடுமையான நிதி நெருக்கடி (Financial Hardship)</option>
                        <option value="disaster">இயற்கை பேரிடர் பாதிப்பு (Disaster Relief)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 mb-1">DETAILED DESCRIPTION *</label>
                      <textarea
                        required
                        rows={4}
                        value={newEmDetails}
                        onChange={(e) => setNewEmDetails(e.target.value)}
                        placeholder="சம்பவத்தின் விவரங்கள் மற்றும் தேவையான உடனடி உதவி..."
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowEmModal(false)}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black cursor-pointer uppercase"
                      >
                        Raise SOS Now
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: GIS MEMBER MAP */}
        {activeSubTab === "member_map" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-black uppercase text-indigo-600">
                {lang === "ta" ? "தமிழக ஓவியர்கள் பரவல் வரைபடம் (GIS Map)" : "District-wise Union Member Distribution Map"}
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                {lang === "ta" 
                  ? "தமிழக மாவட்டங்கள் வாரியாக சங்க உறுப்பினர்கள் மற்றும் நலநிதி முகாம்கள் பற்றிய மேலோட்ட விவரங்கள்" 
                  : "State-wide GIS density overlay displaying active painters registers and campaign centers."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* SVG Interactive Map Container */}
              <div className="lg:col-span-2 bg-stone-900 rounded-3xl p-6 border border-stone-800 relative min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-4 bg-stone-950/80 border border-stone-800 px-3 py-1.5 rounded-xl text-[10px] font-bold text-indigo-400">
                  INTERACTIVE STATE VECTOR MAP
                </div>

                {/* SVG Visual approximation map of Tamil Nadu outline & pins */}
                <svg
                  viewBox="0 0 500 450"
                  className="w-full max-w-[420px] h-auto drop-shadow-2xl"
                >
                  {/* Faux Tamil Nadu Map Boundary Path */}
                  <path
                    d="M 220 20 L 320 25 L 360 40 L 410 60 L 420 90 L 390 120 L 420 180 L 440 220 L 380 250 L 360 280 L 320 320 L 260 360 L 190 390 L 170 430 L 140 440 L 120 420 L 100 390 L 120 340 L 100 290 L 60 250 L 40 210 L 80 160 L 120 140 L 160 110 L 170 70 L 200 40 Z"
                    fill="#1e1b4b"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    className="transition-colors hover:fill-[#2e1065]"
                  />

                  {/* Render District Nodes / Pinpoints */}
                  {districtMapStats.map((dist, idx) => (
                    <g
                      key={idx}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredMapDistrict(dist)}
                      onMouseLeave={() => setHoveredMapDistrict(null)}
                      onClick={() => setHoveredMapDistrict(dist)}
                    >
                      <circle
                        cx={dist.coordX}
                        cy={dist.coordY}
                        r="8"
                        fill="#ef4444"
                        className="animate-pulse"
                      />
                      <circle
                        cx={dist.coordX}
                        cy={dist.coordY}
                        r="4"
                        fill="#ffffff"
                      />
                      <text
                        x={dist.coordX + 10}
                        y={dist.coordY + 4}
                        fill="#f3f4f6"
                        fontSize="9"
                        fontWeight="bold"
                        className="opacity-60 group-hover:opacity-100 transition-opacity bg-stone-900"
                      >
                        {dist.name}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Inline floating map tooltip */}
                {hoveredMapDistrict && (
                  <div className="absolute bottom-4 right-4 bg-stone-950 border border-indigo-500/40 p-4 rounded-2xl w-56 text-left space-y-1.5 shadow-2xl">
                    <span className="text-[9px] font-black uppercase text-indigo-400 block">District Analytics</span>
                    <h5 className="font-extrabold text-xs text-white">{hoveredMapDistrict.name}</h5>
                    <div className="text-[10px] text-stone-400 space-y-1">
                      <p>Active Registered Painters: <span className="font-extrabold text-white">{hoveredMapDistrict.count.toLocaleString()}</span></p>
                      <p>Educational Camps: <span className="font-extrabold text-indigo-300">{hoveredMapDistrict.activeCamps}</span></p>
                      <p>Welfare Disbursed: <span className="font-extrabold text-emerald-400">{hoveredMapDistrict.funds}</span></p>
                    </div>
                  </div>
                )}
              </div>

              {/* District Rankings sidebar */}
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase text-stone-400 block tracking-wider">
                  {lang === "ta" ? "மாவட்டங்கள் அளவிலான புள்ளிவிவரங்கள்" : "District Registries Directory Density"}
                </span>

                <div className="space-y-3">
                  {districtMapStats.map((dist, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex justify-between items-center ${
                        darkMode ? "bg-stone-900/40 border-stone-800" : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-indigo-600 font-extrabold uppercase">Rank #{idx+1}</span>
                        <h6 className="text-xs font-black text-stone-800">{dist.name}</h6>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-stone-900">{dist.count.toLocaleString()} Members</p>
                        <p className="text-[9px] text-stone-400">Funds: {dist.funds}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TASK MANAGEMENT */}
        {activeSubTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-sm font-black uppercase text-indigo-600">
                  {lang === "ta" ? "நிர்வாகப் பொறுப்புகள் & இலக்குகள்" : "Union Admin Task Management Ledger"}
                </h4>
                <p className="text-xs text-stone-400 mt-1">
                  {lang === "ta" 
                    ? "மாநில மற்றும் மாவட்ட செயலாளர்களுக்கான பணிகளைப் பகிர்ந்து கண்காணிக்கும் தளம்" 
                    : "Track regional membership campaign deadlines and welfare processing audits."}
                </p>
              </div>

              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === "ta" ? "புதிய பணி உருவாக்கு" : "Create Admin Task"}</span>
              </button>
            </div>

            {/* Task list grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* High / Pending priorities */}
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase text-rose-500 block tracking-wider">
                  {lang === "ta" ? "முக்கியமான நிலுவைப் பணிகள்" : "Active & Critical Pending Tasks"}
                </span>

                {tasks.filter(t => t.status === "pending").map((task, idx) => (
                  <div
                    key={`ds_tsk_p_${task.id}_${idx}`}
                    className={`p-4 rounded-2xl border relative transition-all ${
                      task.priority === "high" 
                        ? "bg-rose-500/5 border-rose-300" 
                        : "bg-amber-500/5 border-amber-300"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        task.priority === "high" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span className="text-[10px] text-stone-400 block font-bold">Due: {task.dueDate}</span>
                    </div>

                    <h5 className="text-xs font-extrabold text-stone-900 mt-2.5">
                      {lang === "ta" ? task.title : task.titleEn}
                    </h5>

                    <p className="text-[10px] text-stone-400 mt-1">
                      Assigned To: <span className="font-extrabold">{task.assignedTo === "all" ? "All Secretariats" : task.assignedTo}</span> 
                      {task.district && ` (${task.district})`}
                    </p>

                    <div className="flex justify-end mt-4 border-t border-stone-200/10 pt-3">
                      <button
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase rounded-xl cursor-pointer"
                      >
                        {lang === "ta" ? "முடிக்கப்பட்டது என குறி" : "Mark Completed"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Completed tasks column */}
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase text-emerald-500 block tracking-wider">
                  {lang === "ta" ? "முடிவடைந்த பணிகள்" : "Archived Completed Tasks"}
                </span>

                {tasks.filter(t => t.status === "completed").map((task, idx) => (
                  <div
                    key={`ds_tsk_c_${task.id}_${idx}`}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase">
                        Completed
                      </span>
                      <span className="text-[10px] text-stone-400 font-bold">Closed</span>
                    </div>

                    <h5 className="text-xs font-extrabold text-stone-700 line-through mt-2">
                      {lang === "ta" ? task.title : task.titleEn}
                    </h5>

                    {task.completedBy && (
                      <p className="text-[9px] text-emerald-600 font-bold mt-2">
                        ✓ Verified by {task.completedBy}
                      </p>
                    )}

                    <div className="flex justify-end mt-3 border-t border-stone-200/10 pt-2">
                      <button
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className="text-[10px] font-bold text-stone-400 hover:text-rose-500"
                      >
                        Reopen Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Task modal */}
            {showAddTaskModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
                  darkMode ? "bg-stone-900 border-stone-800 text-stone-200" : "bg-white border-stone-200 text-stone-800"
                }`}>
                  <div className="flex justify-between items-center border-b border-stone-200/20 pb-3 mb-4">
                    <h5 className="font-black text-sm uppercase text-indigo-600">
                      {lang === "ta" ? "புதிய நிர்வாகப் பொறுப்பு உருவாக்கு" : "Deploy Regional Action Task"}
                    </h5>
                    <button onClick={() => setShowAddTaskModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
                  </div>

                  <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 mb-1">TASK TITLE (TAMIL) *</label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="எ.கா: பாதுகாப்பு கவச ஆடைகள் ஆய்வு செய்தல்"
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 mb-1">TASK TITLE (ENGLISH)</label>
                      <input
                        type="text"
                        value={newTaskTitleEn}
                        onChange={(e) => setNewTaskTitleEn(e.target.value)}
                        placeholder="e.g. Audit regional scaffold locks"
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">ASSIGNED AUDIENCE</label>
                        <select
                          value={newTaskAssigned}
                          onChange={(e) => setNewTaskAssigned(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        >
                          <option value="state_admin">State Secretaries</option>
                          <option value="district_admin">District Admins</option>
                          <option value="all">All Coordinators</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">TARGET REGION / DISTRICT</label>
                        <input
                          type="text"
                          value={newTaskDistrict}
                          onChange={(e) => setNewTaskDistrict(e.target.value)}
                          placeholder="e.g. Coimbatore"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">DUE DATE</label>
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">PRIORITY</label>
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddTaskModal(false)}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black cursor-pointer"
                      >
                        Publish Task
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: AI DOCUMENT GENERATOR */}
        {activeSubTab === "doc_generator" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-black uppercase text-indigo-600">
                {lang === "ta" ? "நிர்வாக ஆவண இயற்றி (AI Document Hub)" : "Automated Circular & Notice Composer"}
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                {lang === "ta" 
                  ? "சங்கத்தின் சுற்றறிக்கைகள், மாநாட்டு நிகழ்ச்சி நிரல்கள் மற்றும் பாராட்டு கடிதங்களை உடனுக்குடன் உருவாக்கி அச்சிடுங்கள்" 
                  : "Automate circular dispatches, executive meeting agendas, and official notices."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Controls Column */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                darkMode ? "bg-stone-900/40 border-stone-800" : "bg-stone-50 border-stone-200"
              }`}>
                <span className="text-[10px] font-extrabold uppercase text-stone-400 block tracking-wider">
                  Document Configuration
                </span>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">1. Document Type</label>
                  <select
                    value={genDocType}
                    onChange={(e) => setGenDocType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 outline-none"
                  >
                    <option value="circular">அரசு சுற்றறிக்கை (Official Circular)</option>
                    <option value="notice">விளம்பர அறிவிப்பு பலகை (Public Notice)</option>
                    <option value="agenda">கூட்ட நிகழ்ச்சி நிரல் (Meeting Agenda)</option>
                    <option value="appreciation">பாராட்டு கடிதம் (Appreciation Letter)</option>
                    <option value="membership">உறுப்பினர் சான்றிதழ் (Membership Certificate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">2. Output Language</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGenLanguage("ta")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black cursor-pointer ${
                        genLanguage === "ta" ? "bg-indigo-600 text-white" : "bg-stone-100 text-stone-800"
                      }`}
                    >
                      தமிழ் (Tamil)
                    </button>
                    <button
                      onClick={() => setGenLanguage("en")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black cursor-pointer ${
                        genLanguage === "en" ? "bg-indigo-600 text-white" : "bg-stone-100 text-stone-800"
                      }`}
                    >
                      ENGLISH
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">3. Subject / Topic</label>
                  <input
                    type="text"
                    value={genSubject}
                    onChange={(e) => setGenSubject(e.target.value)}
                    placeholder="எ.கா: பாதுகாப்பு முகாம்"
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">4. Recipient Name</label>
                  <input
                    type="text"
                    value={genRecipient}
                    onChange={(e) => setGenRecipient(e.target.value)}
                    placeholder="All regional members"
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">5. Venue</label>
                    <input
                      type="text"
                      value={genVenue}
                      onChange={(e) => setGenVenue(e.target.value)}
                      placeholder="திருச்சி"
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">6. Date</label>
                    <input
                      type="text"
                      value={genDate}
                      onChange={(e) => setGenDate(e.target.value)}
                      placeholder="20-08-2026"
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateDocument}
                  disabled={docLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>{docLoading ? "Drafting..." : "Generate Template"}</span>
                </button>
              </div>

              {/* Output Preview Column */}
              <div className="lg:col-span-2">
                {generatedDocResult ? (
                  <div className={`p-6 rounded-3xl border ${
                    darkMode ? "bg-stone-900/30 border-stone-800 text-stone-200" : "bg-white border-stone-200 text-stone-800 shadow"
                  }`}>
                    <div className="flex justify-between items-center border-b border-stone-200/20 pb-3 mb-4">
                      <span className="text-[10px] font-black uppercase text-indigo-600">Generated Draft Output</span>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrintDoc}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                        >
                          Print Document
                        </button>
                        <button
                          onClick={() => {
                            alert("Document copy compiled to clipboard.");
                          }}
                          className="px-3 py-1.5 bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-[10px] font-bold cursor-pointer"
                        >
                          Copy Text
                        </button>
                      </div>
                    </div>

                    <pre className="text-xs font-serif leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/50 max-h-80 overflow-y-auto whitespace-pre-wrap text-stone-800 text-left">
                      {generatedDocResult}
                    </pre>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-2xl">
                    <FileEdit className="w-8 h-8 text-indigo-200 mb-2" />
                    <span>{lang === "ta" ? "வடிகட்டிகளைத் தேர்வு செய்து ஆவணத்தை உருவாக்குங்கள்" : "Choose configurations on the left to output your automated notice"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: KNOWLEDGE BASE SEARCH */}
        {activeSubTab === "knowledge_base" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/50 pb-5">
              <div>
                <h4 className="text-sm font-black uppercase text-indigo-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  {lang === "ta" ? "சங்க அறிவுத் தளம் & அரசாணைகள்" : "Union Constitutional Knowledge Center"}
                </h4>
                <p className="text-xs text-stone-400 mt-1">
                  {lang === "ta" 
                    ? "விதிகள், கொள்கைகள் மற்றும் அரசாணைகளுக்கான AI-வலுவூட்டப்பட்ட தேடல் மற்றும் மேலாண்மை களம்" 
                    : "AI-powered semantic lookup and administration desk for official union bylaws and G.O. guidelines."}
                </p>
              </div>

              {/* Administrative Add Article Button */}
              {(currentUser?.role === "super_admin" || currentUser?.role === "state_admin") && (
                <button
                  onClick={() => {
                    setEditingKbId(null);
                    setNewKbTitle("");
                    setNewKbTitleEn("");
                    setNewKbCategory("faq");
                    setNewKbContent("");
                    setNewKbContentEn("");
                    setShowAddKbForm(!showAddKbForm);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow self-start sm:self-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {lang === "ta" ? "புதிய விதியைச் சேர்" : "Add New Policy/Rule"}
                </button>
              )}
            </div>

            {/* Admin Add/Edit Form Overlay */}
            {showAddKbForm && (
              <form onSubmit={handleSaveArticle} className="p-5 rounded-2xl border border-stone-200 bg-[#fbfbfa] space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-stone-200/40 pb-2">
                  <h5 className="text-xs font-black text-stone-900 uppercase">
                    {editingKbId ? (lang === "ta" ? "விதியைத் திருத்து" : "Edit Policy/Rule") : (lang === "ta" ? "புதிய விதியைச் சேர்" : "Create New Policy/Rule")}
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddKbForm(false);
                      setEditingKbId(null);
                    }}
                    className="text-stone-400 hover:text-stone-600 text-[10px] font-black"
                  >
                    CLOSE / மூடு
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-500">விளக்கத் தலைப்பு (தமிழ்)</label>
                    <input
                      type="text"
                      value={newKbTitle}
                      onChange={(e) => setNewKbTitle(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-stone-200 bg-white"
                      placeholder="எ.கா. உயரமான இடங்களில் வேலை செய்யும் பாதுகாப்பு விதிகள்"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-500">Policy Title (English)</label>
                    <input
                      type="text"
                      value={newKbTitleEn}
                      onChange={(e) => setNewKbTitleEn(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-stone-200 bg-white"
                      placeholder="e.g. Scaffolding and High-Elevation Safety Codes"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-500">பிரிவு (Category)</label>
                    <select
                      value={newKbCategory}
                      onChange={(e) => setNewKbCategory(e.target.value as any)}
                      className="w-full p-2 text-xs rounded-lg border border-stone-200 bg-white"
                    >
                      <option value="rules">{lang === "ta" ? "சங்க சட்ட விதிகள் (Rules)" : "Union Rules"}</option>
                      <option value="policies">{lang === "ta" ? "பாதுகாப்புக் கொள்கைகள் (Policies)" : "Safety Policies"}</option>
                      <option value="schemes">{lang === "ta" ? "அரசு நலத்திட்டங்கள் (Schemes)" : "Welfare Schemes"}</option>
                      <option value="materials">{lang === "ta" ? "வண்ணப் பொருட்கள் (Materials)" : "Materials Guide"}</option>
                      <option value="faq">{lang === "ta" ? "கேள்வி-பதில் (FAQ)" : "General FAQ"}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-500">விளக்கத் உள்ளவடிவம் (தமிழ்)</label>
                    <textarea
                      value={newKbContent}
                      onChange={(e) => setNewKbContent(e.target.value)}
                      rows={4}
                      className="w-full p-2 text-xs rounded-lg border border-stone-200 bg-white font-mono"
                      placeholder="ஒவ்வொரு விதியையும் புதிய வரியில் எழுதவும்..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-500">Policy Content (English)</label>
                    <textarea
                      value={newKbContentEn}
                      onChange={(e) => setNewKbContentEn(e.target.value)}
                      rows={4}
                      className="w-full p-2 text-xs rounded-lg border border-stone-200 bg-white font-mono"
                      placeholder="Write each rule/point on a new line..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddKbForm(false);
                      setEditingKbId(null);
                    }}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-all"
                  >
                    {lang === "ta" ? "ரத்து செய்" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow"
                  >
                    {lang === "ta" ? "சேமிக்கவும்" : "Save Article"}
                  </button>
                </div>
              </form>
            )}

            {/* Smart Semantic Search Banner/Button Trigger */}
            {servicesQuery.trim() && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-left">
                  <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-indigo-900">
                      {lang === "ta" ? "AI தேடல் தயார் நிலையில் உள்ளது!" : "AI Semantic Search Ready!"}
                    </h5>
                    <p className="text-[10px] text-indigo-700 mt-0.5">
                      {lang === "ta"
                        ? `"${servicesQuery}" என்ற உங்களது தேடலை அடிப்படையாகக் கொண்டு, சங்கக் கொள்கைகளில் இருந்து துல்லியமான விடைகளைப் பெற AI தேடலைத் தொடங்குங்கள்.`
                        : `Launch the AI semantic search to find actual rule interpretations and G.O. guidelines for "${servicesQuery}".`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSemanticSearch}
                  disabled={semanticSearching}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-center shrink-0"
                >
                  {semanticSearching ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      {lang === "ta" ? "தேடுகிறது..." : "AI Thinking..."}
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      {lang === "ta" ? "AI தேடல் தொடங்கு" : "Run AI Semantic Search"}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Graceful Fallback Warning Banner */}
            {kbFallbackMsg && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs space-y-1 text-left">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{lang === "ta" ? "உள்ளூர் தேடல் இயங்குகிறது (Local Search Active)" : "Local Keyword Database Search Active"}</span>
                </div>
                <p className="text-[10px] opacity-90 leading-relaxed">{kbFallbackMsg}</p>
              </div>
            )}

            {/* Smart AI Search Result Summary Card */}
            {semanticAnswer && (
              <div className="p-5 bg-gradient-to-tr from-stone-900 to-stone-950 text-white rounded-2xl border border-indigo-900/30 shadow-md space-y-3 relative overflow-hidden text-left">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-indigo-500/10 pointer-events-none" />
                
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">AI ASSISTANT DESK ANSWER / AI விளக்க அறிக்கை</span>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-3">
                  <h5 className="text-xs font-black text-amber-400">
                    {lang === "ta" ? "AI பதில்:" : "AI Synthesis Reply:"}
                  </h5>
                  <p className="text-xs leading-relaxed font-serif text-stone-200">
                    {lang === "ta" ? semanticAnswer.ta : semanticAnswer.en}
                  </p>
                </div>
              </div>
            )}

            {/* Loading Spinner */}
            {kbLoading && (
              <div className="flex flex-col items-center justify-center p-12 space-y-2">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs text-stone-400 font-bold">
                  {lang === "ta" ? "அறிவுத் தளம் ஒத்திசைக்கப்படுகிறது..." : "Synchronizing state guidelines..."}
                </span>
              </div>
            )}

            {/* Error Message */}
            {kbError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-bold">{kbError}</span>
              </div>
            )}

            {/* Empty State */}
            {!kbLoading && kbArticles.length === 0 && (
              <div className="text-center p-12 border border-dashed border-stone-200 rounded-3xl">
                <HelpCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h5 className="text-sm font-bold text-stone-700">
                  {lang === "ta" ? "விதிகள் ஏதும் கண்டறியப்படவில்லை" : "No Guidelines Found"}
                </h5>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  {lang === "ta"
                    ? "மதிப்பிற்குரிய தோழரே, உங்களது தேடலுக்குப் பொருத்தமான எந்தக் கட்டுரையும் அறிவுக்களஞ்சியத்தில் இல்லை."
                    : "No matching policy briefs or constitution clauses fit your active query."}
                </p>
              </div>
            )}

            {/* Articles Grid */}
            {!kbLoading && kbArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kbArticles.map((art, idx) => (
                  <div
                    key={`ds_art_${art.id}_${idx}`}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
                      darkMode ? "bg-stone-900/30 border-stone-800 text-stone-200" : "bg-[#faf9f5] border-stone-200 text-stone-800 shadow-sm"
                    }`}
                  >
                    <div className="space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-stone-900 text-white rounded text-[8px] uppercase tracking-wider font-extrabold">
                          {art.category}
                        </span>

                        {/* Admin Action Buttons */}
                        {(currentUser?.role === "super_admin" || currentUser?.role === "state_admin") && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditArticle(art)}
                              className="p-1 text-stone-400 hover:text-indigo-600 transition-all rounded"
                              title="Edit"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id)}
                              className="p-1 text-stone-400 hover:text-red-600 transition-all rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h5 className="text-xs font-black text-stone-950 mt-1.5 line-clamp-2">
                        {lang === "ta" ? art.title : art.titleEn}
                      </h5>

                      <pre className="text-[10px] leading-relaxed text-stone-600 mt-4 whitespace-pre-wrap font-serif border-t border-stone-200/30 pt-3 text-left line-clamp-6">
                        {lang === "ta" ? art.content : art.contentEn}
                      </pre>
                    </div>

                    {/* Expand View Option */}
                    <button
                      onClick={() => {
                        alert(`[${lang === 'ta' ? art.title : art.titleEn}]\n\n${lang === 'ta' ? art.content : art.contentEn}`);
                      }}
                      className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-all mt-4 text-left block border-t border-stone-200/20 pt-2.5"
                    >
                      {lang === "ta" ? "முழுமையாகப் படி (Read Full)" : "Read Full Article →"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* NEW TAB 9: DIGITAL HELP DESK & VOICE AI */}
        {/* ========================================== */}
        {activeSubTab === "help_desk" && (
          <HelpDeskVoiceTab
            lang={lang}
            currentUser={currentUser}
            darkMode={darkMode}
            onAddAuditLog={onAddAuditLog}
            complaints={complaints}
            setComplaints={setComplaints}
            activeComplaintId={activeComplaintId}
            setActiveComplaintId={setActiveComplaintId}
            newCompSubject={newCompSubject}
            setNewCompSubject={setNewCompSubject}
            newCompCategory={newCompCategory}
            setNewCompCategory={setNewCompCategory}
            newCompDesc={newCompDesc}
            setNewCompDesc={setNewCompDesc}
            newCompDoc={newCompDoc}
            setNewCompDoc={setNewCompDoc}
            complaintChatInput={complaintChatInput}
            setComplaintChatInput={setComplaintChatInput}
            voiceResponse={voiceResponse}
            setVoiceResponse={setVoiceResponse}
            voiceInputActive={voiceInputActive}
            setVoiceInputActive={setVoiceInputActive}
            callbacks={callbacks}
            setCallbacks={setCallbacks}
            callPhone={callPhone}
            setCallPhone={setCallPhone}
            callDateTime={callDateTime}
            setCallDateTime={setCallDateTime}
            callTopic={callTopic}
            setCallTopic={setCallTopic}
            callConsent={callConsent}
            setCallConsent={setCallConsent}
            onAddWorkflowTask={(title, titleEn) => {
              const smartWorkflowTask = {
                id: `task_workflow_${Date.now()}`,
                title,
                titleEn,
                assignedTo: "district_admin",
                district: currentUser?.district || "சென்னை",
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                priority: "high",
                status: "pending"
              };
              setTasks(prev => [smartWorkflowTask, ...prev]);
            }}
          />
        )}

        {activeSubTab === "insurance_legal" && (
          <InsuranceLegalTab
            lang={lang}
            currentUser={currentUser}
            darkMode={darkMode}
            onAddAuditLog={onAddAuditLog}
            insurancePolicies={insurancePolicies}
            setInsurancePolicies={setInsurancePolicies}
            claimPolicyId={claimPolicyId}
            setClaimPolicyId={setClaimPolicyId}
            claimReason={claimReason}
            setClaimReason={setClaimReason}
            claimDoc={claimDoc}
            setClaimDoc={setClaimDoc}
          />
        )}

        {activeSubTab === "skills_contractors" && (
          <SkillsContractorsTab
            lang={lang}
            currentUser={currentUser}
            darkMode={darkMode}
            onAddAuditLog={onAddAuditLog}
            skillSubmissions={skillSubmissions}
            setSkillSubmissions={setSkillSubmissions}
            submitSkills={submitSkills}
            setSubmitSkills={setSubmitSkills}
            submitExp={submitExp}
            setSubmitExp={setSubmitExp}
            submitPortfolio={submitPortfolio}
            setSubmitPortfolio={setSubmitPortfolio}
            contractors={contractors}
            setContractors={setContractors}
            publishCompany={publishCompany}
            setPublishCompany={setPublishCompany}
            publishServices={publishServices}
            setPublishServices={setPublishServices}
            publishExp={publishExp}
            setPublishExp={setPublishExp}
            publishContact={publishContact}
            setPublishContact={setPublishContact}
            publishOptIn={publishOptIn}
            setPublishOptIn={setPublishOptIn}
          />
        )}

        {activeSubTab === "achievements_tv" && (
          <AchievementsTvTab
            lang={lang}
            darkMode={darkMode}
            onAddAuditLog={onAddAuditLog}
            opinionPolls={opinionPolls}
            setOpinionPolls={setOpinionPolls}
          />
        )}

        {activeSubTab === "security_health_decision" && (
          <SecurityHealthTab
            lang={lang}
            currentUser={currentUser}
            darkMode={darkMode}
            onAddAuditLog={onAddAuditLog}
            mfaEnabled={mfaEnabled}
            setMfaEnabled={setMfaEnabled}
            suspiciousLogins={suspiciousLogins}
            cpuLoad={cpuLoad}
            dbHealth={dbHealth}
            storageUsed={storageUsed}
            apiLatency={apiLatency}
          />
        )}
      </div>
      </div>
    );
  }

