import React, { useState, useEffect } from "react";
// @ts-ignore
import logoSvg from "./logo.svg";
// @ts-ignore
import flagSvg from "./flag.svg";
import { 
  Users, 
  CreditCard, 
  MapPin, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  TrendingUp, 
  Globe, 
  Volume2, 
  Phone, 
  Bell, 
  UserPlus, 
  Search, 
  Check, 
  ChevronRight, 
  FileText, 
  Award,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  HeartHandshake,
  LogOut,
  User,
  ShieldCheck,
  Shield,
  Camera,
  Zap,
  Building,
  Briefcase,
  Layers,
  Eye,
  CheckSquare,
  Cpu,
  Tv,
  Crown,
  Radio,
  Lock,
  MessageCircle,
  Building2,
  Plus,
  Smartphone,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  initialLeaders, 
  initialNews, 
  initialWelfareSchemes, 
  initialDistricts, 
  initialStats, 
  sampleRegistrations, 
  samplePayments 
} from "./mockData";
import { 
  Leader, 
  NewsItem, 
  MemberRegistration, 
  PaymentRecord, 
  SystemStats, 
  UserAccount, 
  WelfareApplication, 
  AuditLog, 
  SystemSettings,
  ExecutiveMember,
  ExecutiveLevel
} from "./types";
import WelfareAdvisor from "./components/WelfareAdvisor";
import FloatingAIAssistant from "./components/FloatingAIAssistant";
import MemberRegistrationForm from "./components/MemberRegistration";
import PaymentModule from "./components/PaymentModule";
import AdminPanel from "./components/AdminPanel";
import GallerySlider from "./components/GallerySlider";
import AuthSystem, { defaultAccounts } from "./components/AuthSystem";
import MemberDashboard from "./components/MemberDashboard";
import WelfareBoard from "./components/WelfareBoard";
import LiveCommunication from "./components/LiveCommunication";
import DigitalServices from "./components/DigitalServices";
import EnterpriseCommandCenter from "./components/EnterpriseCommandCenter";
import SuperAdminBusinessConsole from "./components/SuperAdminBusinessConsole";
import SuperAdminOtpAuth, { getStoredSuperAdminSession, clearStoredSuperAdminSession } from "./components/SuperAdminOtpAuth";
import TnpaTvChannel from "./components/TnpaTvChannel";
import PainterJobsPortal from "./components/PainterJobsPortal";
import MemberIdCardPortal from "./components/MemberIdCardPortal";
import { MemberCardPortal } from "./components/MemberCardPortal";
import { MemberCardVerificationModal } from "./components/MemberCardVerificationModal";
import { getMemberCardRequestByToken } from "./utils/memberCardStorage";
import { MemberCardRequest } from "./types/memberCard";
import DistrictHierarchyDirectory from "./components/DistrictHierarchyDirectory";
import RoleBasedControlPortal from "./components/RoleBasedControlPortal";
import OfficeBearerPortal from "./components/OfficeBearerPortal";
import ExecutiveDirectoryPortal from "./components/ExecutiveDirectoryPortal";
import { INITIAL_EXECUTIVE_MEMBERS } from "./data/initialExecutives";
import { getExecutivePhoto } from "./utils/executivePhotos";
import PainterInsurancePortal from "./components/PainterInsurancePortal";
import PainterSkillAcademy from "./components/PainterSkillAcademy";
import DistrictBroadcastPortal from "./components/DistrictBroadcastPortal";
import GrievanceSupportDesk from "./components/GrievanceSupportDesk";
import StateLegalAdvisoryBoard from "./components/StateLegalAdvisoryBoard";
import { AutoUpdatePrompt, forcePurgeCacheAndReload } from "./components/AutoUpdatePrompt";
import RoleMobileAuthModal, { ROLE_AUTH_CONFIGS, RoleAuthConfig, getRegisteredRoleConfigs } from "./components/RoleMobileAuthModal";
import MemberDirectoryOfflinePortal from "./components/MemberDirectoryOfflinePortal";
import { safeSpeak, safeCancelSpeech } from "./utils/safeSpeech";
import { 
  subscribeToRegistrations, 
  subscribeToUnionConfig, 
  subscribeToLeaders, 
  subscribeToNews, 
  subscribeToBroadcasts,
  subscribeToWelfareApplications,
  saveWelfareApplicationToFirestore,
  subscribeToPayments,
  savePaymentToFirestore,
  saveRegistrationToFirestore, 
  saveUnionConfigToFirestore, 
  saveLeaderToFirestore, 
  saveNewsToFirestore,
  subscribeToExecutives,
  saveExecutiveToFirestore,
  deleteExecutiveFromFirestore,
  seedInitialFirestoreData,
  GlobalUnionConfig 
} from "./lib/syncService";

export default function App() {
  console.log("App component initializing with Realtime Cloud Sync...");
  // Localization: 'ta' for Tamil, 'en' for English
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [directorySubTab, setDirectorySubTab] = useState<"members" | "districts">("members");

  // Core App states (synced globally in real-time with Firestore across all users)
  const [leaders, setLeaders] = useState<Leader[]>(initialLeaders);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [registrations, setRegistrations] = useState<MemberRegistration[]>(sampleRegistrations);
  const [payments, setPayments] = useState<PaymentRecord[]>(samplePayments);
  const [stats, setStats] = useState<SystemStats>(initialStats);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState<boolean>(true);
  const [showSyncInfoModal, setShowSyncInfoModal] = useState<boolean>(false);

  // Separate Executives Directory across State, District, Zonal, and Area/Union levels
  const [executives, setExecutives] = useState<ExecutiveMember[]>(() => {
    try {
      const stored = localStorage.getItem("tnpa_executives_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((e: ExecutiveMember) => ({
            ...e,
            photoUrl: getExecutivePhoto(e)
          }));
        }
      }
    } catch (e) {
      console.warn("Could not read stored executives:", e);
    }
    return INITIAL_EXECUTIVE_MEMBERS.map((e: ExecutiveMember) => ({
      ...e,
      photoUrl: getExecutivePhoto(e)
    }));
  });
  const [selectedExecutiveLevel, setSelectedExecutiveLevel] = useState<ExecutiveLevel>("state");

  // AUTH STATE: null represents non-logged visitor (Visitor / Guest mode)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isSuperAdminOtpVerified, setIsSuperAdminOtpVerified] = useState<boolean>(() => {
    const stored = getStoredSuperAdminSession();
    return !!(stored && stored.token);
  });
  const [selectedRoleAuth, setSelectedRoleAuth] = useState<RoleAuthConfig | null>(null);
  const [customFlagUrl, setCustomFlagUrl] = useState<string | null>(null);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const flagInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const isSuperAdmin = currentUser?.role === "super_admin" && isSuperAdminOtpVerified;
  const [showDistrictDirectoryModal, setShowDistrictDirectoryModal] = useState(false);

  // REAL-TIME FIRESTORE SUBSCRIPTIONS (MULTI-DEVICE GLOBAL SYNC)
  useEffect(() => {
    // 1. Initial background seed if database is new
    seedInitialFirestoreData(sampleRegistrations, initialLeaders, initialNews);

    // 2. Real-time registrations listener
    const unsubRegs = subscribeToRegistrations((remoteRegs) => {
      if (remoteRegs && remoteRegs.length > 0) {
        setRegistrations(remoteRegs);
        setIsCloudSyncActive(true);
      }
    });

    // 3. Real-time Union Config listener (ID Card templates, logos, emergency ticker)
    const unsubConfig = subscribeToUnionConfig((cfg: GlobalUnionConfig) => {
      if (cfg.customLogoUrl) setCustomLogoUrl(cfg.customLogoUrl);
      if (cfg.customFlagUrl) setCustomFlagUrl(cfg.customFlagUrl);
      if (cfg.emergencyAlert !== undefined) setEmergencyAlert(cfg.emergencyAlert);
      setIsCloudSyncActive(true);
    });

    // 4. Real-time Leaders listener
    const unsubLeaders = subscribeToLeaders((remoteLeaders) => {
      if (remoteLeaders && remoteLeaders.length > 0) {
        setLeaders(remoteLeaders);
        setIsCloudSyncActive(true);
      }
    });

    // 5. Real-time News listener
    const unsubNews = subscribeToNews((remoteNews) => {
      if (remoteNews && remoteNews.length > 0) {
        setNews(remoteNews);
        setIsCloudSyncActive(true);
      }
    });

    // 6. Real-time Welfare Applications listener
    const unsubWelfare = subscribeToWelfareApplications((remoteApps) => {
      if (remoteApps && remoteApps.length > 0) {
        setWelfareApplications(remoteApps);
        setIsCloudSyncActive(true);
      }
    });

    // 7. Real-time Payments listener
    const unsubPayments = subscribeToPayments((remotePayments) => {
      if (remotePayments && remotePayments.length > 0) {
        setPayments(remotePayments);
        setIsCloudSyncActive(true);
      }
    });

    // 8. Real-time Executives listener (State, District, Zone, Area/Union)
    const unsubExecs = subscribeToExecutives((remoteExecs) => {
      if (remoteExecs && remoteExecs.length > 0) {
        const sanitized = remoteExecs.map((e) => ({
          ...e,
          photoUrl: getExecutivePhoto(e)
        }));
        setExecutives(sanitized);
        try {
          localStorage.setItem("tnpa_executives_v1", JSON.stringify(sanitized));
        } catch (e) {}
      }
    });

    return () => {
      unsubRegs();
      unsubConfig();
      unsubLeaders();
      unsubNews();
      unsubWelfare();
      unsubPayments();
      unsubExecs();
    };
  }, []);


  // Welfare claims list (synced globally)
  const [welfareApplications, setWelfareApplications] = useState<WelfareApplication[]>([
    {
      id: "w_claim_1",
      memberId: "TNP-2026-0034",
      memberName: "ரா. கார்த்திகேயன்",
      memberPhone: "9876543210",
      schemeId: "ws2",
      schemeTitle: "விபத்து மரண மற்றும் ஊன நிவாரண உதவித் தொகை",
      schemeTitleEn: "Accident Death & Disability Financial Assistance",
      amount: "₹5,00,000 வரை (Up to ₹5,00,000)",
      appliedAt: "2026-08-02",
      status: "pending",
      district: "சென்னை",
      remarks: "பணி விபத்தின் காரணமாக வலது காலில் எலும்பு முறிவு ஏற்பட்டுள்ளது. அவசர நிவாரண நிதி கோரப்பட்டுள்ளது.",
      declarationAccepted: true,
      history: [
        { status: "pending", date: "2026-08-02", remarks: "விண்ணப்பம் மாவட்ட கிளையில் சமர்ப்பிக்கப்பட்டது." }
      ]
    }
  ]);

  // Security Audit logs list
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log_1",
      timestamp: new Date().toLocaleString(),
      action: "System Boot",
      details: "State database synchronized with secure TN Construction Board master node.",
      performedBy: "System Core",
      role: "System"
    },
    {
      id: "log_2",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleString(),
      action: "Backup Snapshot Compiled",
      details: "Database security backup dump exported to local node cluster.",
      performedBy: "R. Xavier Babu",
      role: "super_admin"
    }
  ]);

  // System parameters configuration
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    allowDistrictPreliminaryApproval: true,
    enableAutoApproval: false,
    maintenanceMode: false,
    requiredSubscriptionAmount: 500,
    aiKnowledgeBaseTa: "- சங்கம் துவங்கப்பட்ட ஆண்டு: 1989. நோக்கம்: தமிழ்நாடு முழுவதும் உள்ள கட்டட பெயிண்டர்கள், கலை ஓவியர்கள் மற்றும் ஸ்ப்ரே ஆப்பரேட்டர்களின் வாழ்வாதாரம் மற்றும் சமூகப் பாதுகாப்பை மேம்படுத்துவது.\n- கொள்கை விதிகள்: உறுப்பினர்கள் அனைவரும் 18 வயது பூர்த்தியடைந்தவராக இருக்க வேண்டும். ஆண்டு சந்தா ₹500 முறையாக செலுத்தப்பட வேண்டும்.\n- நலவாரிய ஓய்வூதியம்: 60 வயது பூர்த்தியடைந்த பதிவு பெற்ற ஓவியர்களுக்கு மாதந்தோறும் ₹1,000 ஓய்வூதியம் வழங்கப்படும்.\n- விபத்து மரண நிதி உதவி: பணியின்போது எதிர்பாராத விபத்தில் இறக்க நேரிட்டால் வாரிசுதாரருக்கு ₹5,00,000 அரசு மூலமும் மற்றும் சங்கத்தின் அவசர நிதியாக ₹1,00,000-ம் வழங்கப்படும்.\n- பாதுகாப்பு முறைகள்: 10 அடிக்கு மேல் உயரத்தில் வேலை செய்யும்போது பாதுகாப்பு பெல்ட் (safety harness) மற்றும் ஹெல்மெட் கட்டாயம் அணிய வேண்டும். நச்சுத்தன்மை வாய்ந்த கெமிக்கல்களை கையாளும்போது மாஸ்க் (respirators) மற்றும் கவச ஆடைகள் பயன்படுத்த வேண்டும்.",
    aiKnowledgeBaseEn: "- Union established: 1989. Objective: Uplifting livelihood of construction painters, artists, and spray operators across Tamil Nadu.\n- Bylaws: All members must be at least 18 years old. Annual union membership renewal fee is ₹500.\n- Construction Welfare Board Pension: Monthly ₹1,000 pension for registered painters after attaining 60 years of age.\n- On-duty accidental death claim: Up to ₹5,00,000 from Government construction board and ₹1,00,000 immediate cash relief from Union Mutual Fund.\n- Painting safety guidelines: Working above 10 feet requires wearing double-hook safety harness belts and helmets. Mixing toxic chemical-based paints requires respiratory masks and chemical-resistant gloves."
  });

  // Active Main Navigation tab
  const [activeTab, setActiveTab] = useState<"home" | "register" | "welfare_board" | "digital_services" | "jobs" | "advisor" | "payment" | "directory" | "executives" | "gallery" | "admin" | "live_comm" | "command_center" | "business_console" | "tv_channel" | "id_card_portal" | "member_card" | "role_control" | "legal_advisory" | "office_bearers" | "insurance" | "academy" | "broadcast" | "grievance">("home");

  // Public QR Code verification modal state
  const [verifyCardToken, setVerifyCardToken] = useState<string | null>(null);
  const [verifiedCardRequest, setVerifiedCardRequest] = useState<MemberCardRequest | null>(null);

  // Check URL params for verification token on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("verify_card") || params.get("verify_member_card");
      if (token) {
        setVerifyCardToken(token);
        const found = getMemberCardRequestByToken(token);
        setVerifiedCardRequest(found);
      }
    } catch (e) {
      console.error("Error reading URL search params:", e);
    }
  }, []);

  // Custom Accessibility states
  const [textSize, setTextSize] = useState<"normal" | "large" | "extra-large">("normal");
  const [highContrast, setHighContrast] = useState(false);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated live notification list
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "புதிய உறுப்பினர் சேர்க்கை முகாம் கோயம்புத்தூரில் துவங்குகிறது.", textEn: "New member registration camp started in Coimbatore.", time: "10 min ago" },
    { id: 2, text: "விபத்து காப்பீடு விண்ணப்ப நிலவரம் மாற்றப்பட்டுள்ளது.", textEn: "Accident insurance application status updated.", time: "1 hour ago" }
  ]);

  // Emergency Alert Box states (Triggered from header or Admin panel)
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(
    "அவசர அறிவிப்பு: மதுரையில் பெயிண்டர் திரு. முத்து அவர்களுக்கு பணி விபத்தில் ஏற்பட்ட காயத்திற்கு அவசரச் சங்க உதவிக் குழு அனுப்பப்பட்டுள்ளது. தொடர்பு எண்: +917010131915"
  );

  // Visitor Counter
  const [visitorCount, setVisitorCount] = useState(12845);

  useEffect(() => {
    // Faux live visitor counts incrementing over time
    const interval = setInterval(() => {
      setVisitorCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Helper to push secure audit logs
  const handleAddAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action,
      details,
      performedBy: currentUser ? currentUser.nameEn : "Anonymous Visitor",
      role: currentUser ? currentUser.role : "visitor"
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Text-To-Speech Reader
  const handleTTSRead = () => {
    const textToSpeak = lang === "ta" 
      ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம். ஒன்று கூடுவோம் வென்று காட்டுவோம். எங்கள் சங்கம் ஓவியர்களின் உரிமைகளுக்காகவும் முன்னேற்றத்திற்காகவும் செயல்படுகிறது."
      : "Tamil Nadu Painters and Artists Progressive Association. Let us unite and win. Our association strives for the rights and upliftment of all professional painters.";
    
    safeSpeak(textToSpeak, {
      lang: lang === "ta" ? "ta-IN" : "en-US",
      rate: 0.9,
      onError: () => {
        console.warn("TTS not supported or blocked in this environment.");
      }
    });
  };

  // Add or update registration from the component with immediate Real-Time Multi-Device Firestore sync
  const handleNewRegistration = async (newReg: MemberRegistration) => {
    setRegistrations((prev) => {
      const exists = prev.some((r) => r.id === newReg.id);
      if (exists) {
        return prev.map((r) => r.id === newReg.id ? newReg : r);
      } else {
        return [newReg, ...prev];
      }
    });

    // Save to Firestore in real-time
    try {
      await saveRegistrationToFirestore(newReg);
    } catch (e) {
      console.warn("Firestore registration save notice:", e);
    }
    
    // Add dynamic audit log
    handleAddAuditLog(
      newReg.status === "pending" ? "Registration Submitted" : "Registration Updated",
      `Online enrolment application for ${newReg.name} (${newReg.district}) updated and broadcasted to all users. Status: ${newReg.status}.`
    );

    // Add a live notification
    setNotifications((prev) => [
      { id: Date.now(), text: `உறுப்பினர் பதிவு செய்யப்பட்டது: ${newReg.name}`, textEn: `Member registered/updated: ${newReg.nameEn || newReg.name}`, time: "Just now" },
      ...prev
    ]);
  };

  // Sync entire registrations array to state and Firestore
  const handleUpdateRegistrations = (newRegs: MemberRegistration[] | ((prev: MemberRegistration[]) => MemberRegistration[])) => {
    setRegistrations((prev) => {
      const updated = typeof newRegs === "function" ? newRegs(prev) : newRegs;
      // Persist individual changed items to Firestore in background
      updated.forEach(item => {
        saveRegistrationToFirestore(item).catch(() => {});
      });
      return updated;
    });
  };

  // Sync leaders array to state and Firestore
  const handleUpdateLeaders = (newLeaders: Leader[] | ((prev: Leader[]) => Leader[])) => {
    setLeaders((prev) => {
      const updated = typeof newLeaders === "function" ? newLeaders(prev) : newLeaders;
      updated.forEach(item => {
        saveLeaderToFirestore(item).catch(() => {});
      });
      return updated;
    });
  };

  // Sync news array to state and Firestore
  const handleUpdateNews = (newNews: NewsItem[] | ((prev: NewsItem[]) => NewsItem[])) => {
    setNews((prev) => {
      const updated = typeof newNews === "function" ? newNews(prev) : newNews;
      updated.forEach(item => {
        saveNewsToFirestore(item).catch(() => {});
      });
      return updated;
    });
  };

  // Save / Appoint / Update Executive (State, District, Zone, Area/Union)
  const handleSaveExecutive = async (exec: ExecutiveMember) => {
    setExecutives((prev) => {
      const exists = prev.some(e => e.id === exec.id);
      const updated = exists ? prev.map(e => e.id === exec.id ? exec : e) : [exec, ...prev];
      try {
        localStorage.setItem("tnpa_executives_v1", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    try {
      await saveExecutiveToFirestore(exec);
    } catch (err) {
      console.warn("Error saving executive to Firestore:", err);
    }
  };

  // Delete / Remove Executive
  const handleDeleteExecutive = async (id: string) => {
    setExecutives((prev) => {
      const updated = prev.filter(e => e.id !== id);
      try {
        localStorage.setItem("tnpa_executives_v1", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    try {
      await deleteExecutiveFromFirestore(id);
    } catch (err) {
      console.warn("Error deleting executive from Firestore:", err);
    }
  };

  // Add payment
  const handleNewPayment = (newPay: PaymentRecord) => {
    setPayments((prev) => [newPay, ...prev]);
    savePaymentToFirestore(newPay).catch(() => {});
    setStats((prev) => ({ 
      ...prev, 
      totalFundsRaised: prev.totalFundsRaised + newPay.amount,
      welfareDisbursed: newPay.paymentType === "welfare_fund" ? prev.welfareDisbursed + newPay.amount : prev.welfareDisbursed
    }));
    handleAddAuditLog(
      "Online Payment Dispatched",
      `Online payment received of Rs. ${newPay.amount} from ${newPay.memberName}. Status: Success.`
    );
  };

  // Triggered when an admin broadcasts an emergency
  const handleBroadcastEmergency = (msg: string) => {
    setEmergencyAlert(msg);
    saveUnionConfigToFirestore({ emergencyAlert: msg }).catch(() => {});
  };

  // Handle Logout
  const handleLogout = async () => {
    if (currentUser) {
      handleAddAuditLog("Secure Logout", `User session ended for ${currentUser.nameEn}.`);
    }
    try {
      const stored = getStoredSuperAdminSession();
      if (stored?.token) {
        await fetch("/api/superadmin/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stored.token}`,
            "x-superadmin-token": stored.token
          }
        });
      }
    } catch {
      // ignore network errors on logout
    }
    clearStoredSuperAdminSession();
    setIsSuperAdminOtpVerified(false);
    setCurrentUser(null);
    setActiveTab("home");
  };

  // Handle DB restore callback
  const handleRestoreBackup = (data: any) => {
    if (data.leaders) setLeaders(data.leaders);
    if (data.news) setNews(data.news);
    if (data.registrations) setRegistrations(data.registrations);
    if (data.payments) setPayments(data.payments);
    if (data.welfareApplications) setWelfareApplications(data.welfareApplications);
    if (data.stats) setStats(data.stats);
  };

  // Filtered News based on search
  const filteredNews = news.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.titleEn.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.contentEn.toLowerCase().includes(query)
    );
  });

  return (
    <div className={`min-h-screen bg-stone-50 text-stone-800 flex flex-col antialiased transition-all ${
      highContrast ? "bg-stone-950 text-white" : ""
    } ${
      textSize === "large" ? "text-lg" : textSize === "extra-large" ? "text-xl" : "text-sm"
    }`}>
      
      {/* 1. TOP LIVE EMERGENCY TICKER */}
      <AnimatePresence>
        {emergencyAlert && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#b91c1c] text-yellow-300 font-bold px-4 py-2 text-xs md:text-sm flex justify-between items-center gap-3 border-b border-amber-500 shadow-inner z-50 shrink-0"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <ShieldAlert className="w-5 h-5 shrink-0 text-yellow-300 animate-bounce" />
              <div className="whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] cursor-pointer">
                <span>{emergencyAlert}</span>
              </div>
            </div>
            <button 
              onClick={() => setEmergencyAlert(null)}
              className="text-white hover:text-yellow-300 font-black cursor-pointer bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN HEADER & BRANDING PANEL */}
      <header className="bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#1e1b4b] text-white py-2.5 px-3 md:py-3.5 md:px-6 shadow-md border-b-2 border-amber-500 relative shrink-0" spellCheck={false}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-3 lg:gap-5">
          
          {/* Logo & Slogans Side-by-Side Flex Layout */}
          <div className="flex items-center gap-3.5 sm:gap-4 text-left w-full lg:w-auto min-w-0">
            {/* Logo Badge with TNPA² overlay */}
            <div className="relative shrink-0">
              <div 
                className={`h-[58px] w-[58px] sm:h-[64px] sm:w-[64px] rounded-full bg-white flex items-center justify-center relative p-0.5 shadow-lg border-2 border-amber-400 overflow-hidden animate-glowing-logo ${isSuperAdmin ? "cursor-pointer group hover:ring-2 hover:ring-amber-300" : ""}`}
                onClick={() => {
                  if (isSuperAdmin) {
                    logoInputRef.current?.click();
                  } else {
                    alert(lang === "ta" 
                      ? "🛡️ அனுமதி மறுக்கப்பட்டது: சூப்பர் அட்மினால் மட்டுமே சங்கத்தின் லோகோவை மாற்ற முடியும் (Super Admin Only)." 
                      : "🛡️ Access Denied: Only the verified Super Admin can change the official association logo.");
                  }
                }}
                title={isSuperAdmin 
                  ? (lang === "ta" ? "சூப்பர் அட்மின்: லோகோவை மாற்ற தொடவும்" : "Super Admin: Tap to change logo") 
                  : (lang === "ta" ? "சங்கத்தின் அதிகாரப்பூர்வ லோகோ - TNPA²" : "Official Association Logo - TNPA²")}
              >
                <img 
                  src={customLogoUrl || logoSvg} 
                  alt={lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் - TNPA²" : "TN Painters and Artists Progressive Association - TNPA²"} 
                  className="h-full w-full object-contain rounded-full" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = logoSvg;
                  }}
                />
                {isSuperAdmin && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                    <Camera className="w-4 h-4 text-amber-300" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 font-black text-[9px] px-1.5 py-0.2 rounded-md shadow-md border border-stone-900 leading-tight">
                TNPA²
              </span>
            </div>
            {isSuperAdmin && (
              <input
                type="file"
                ref={logoInputRef}
                accept="image/jpeg,image/png,image/webp,image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    if (file.size > 2 * 1024 * 1024) {
                      alert(lang === "ta" ? "கோப்பின் அளவு 2MB-ஐ விட அதிகமாக இருக்கக்கூடாது (Max 2MB)" : "File size exceeds 2MB limit.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      const base64 = reader.result as string;
                      setCustomLogoUrl(base64);
                      saveUnionConfigToFirestore({ customLogoUrl: base64 }).catch(() => {});
                      handleAddAuditLog("Updated Association Logo", "Official association logo updated by Super Admin & published to all users.");
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            )}

            {/* Association Info Column */}
            <div className="flex flex-col justify-center space-y-0.5 min-w-0 flex-1" spellCheck={false}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-amber-400 font-extrabold text-[12px] sm:text-[13px] tracking-wide block uppercase leading-tight">
                  “ {lang === "ta" ? "ஒன்று கூடுவோம், வென்று காட்டுவோம்" : "Let us Unite, Let us Conquer"} ”
                </span>
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950 font-black text-[11px] sm:text-xs px-2 py-0.5 rounded-lg shadow-sm border border-amber-200 uppercase tracking-wider inline-flex items-center">
                  TNPA²
                </span>
              </div>
              <h1 className="text-[15px] sm:text-[17px] md:text-lg font-black text-white tracking-normal leading-snug block drop-shadow-sm">
                {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்" : "TN Painters and Artists Progressive Association"}
                <span className="text-amber-300 font-black ml-1.5">(TNPA²)</span>
              </h1>
              <span className="text-stone-300 text-[10px] sm:text-[11px] block font-mono leading-tight mt-0.5 opacity-90">
                {lang === "ta" ? "தமிழக அரசின் பதிவு எண்: TNMDUJCLMDUTU-50-26-00044 | அதிகாரப்பூர்வ தளம்" : "Govt Reg No: TNMDUJCLMDUTU-50-26-00044 | Official Portal"}
              </span>
            </div>
          </div>

          {/* Action Controllers: Accessibility, Lang and user profile greetings */}
          <div className="flex flex-wrap items-center justify-start sm:justify-center lg:justify-end gap-1.5 sm:gap-2 w-full lg:w-auto shrink-0 pt-1 lg:pt-0 border-t border-white/10 lg:border-t-0">
            
            {/* Live Real-time Cloud Sync Badge */}
            <button
              onClick={() => setShowSyncInfoModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              title={lang === "ta" ? "நேரலை கிளவுட் ஒத்திசைவு செயலில் உள்ளது" : "Live Cloud Sync Active Across All Devices"}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-extrabold tracking-wide">
                {lang === "ta" ? "நேரலை ஒத்திசைவு" : "Live Synced"}
              </span>
            </button>
            
            {/* Logged User Greetings HUD */}
            {currentUser && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 border border-amber-500/30 rounded-lg text-xs">
                <img 
                  src={currentUser.photoUrl} 
                  alt="User" 
                  className="h-6 w-6 rounded-full object-cover border border-amber-500 shrink-0" 
                />
                <div className="text-left leading-none">
                  <span className="font-bold text-[10px] text-amber-400 flex items-center gap-1 truncate max-w-[90px]">
                    {lang === "ta" ? currentUser.name : currentUser.nameEn}
                    {currentUser.role === "super_admin" && (
                      <span title={isSuperAdminOtpVerified ? "Super Admin OTP Verified" : "OTP Pending"} className={`w-2 h-2 rounded-full inline-block ${isSuperAdminOtpVerified ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    )}
                  </span>
                  <span className="text-[8px] text-stone-300 block font-mono uppercase mt-0.5">
                    {currentUser.role === "super_admin" && isSuperAdminOtpVerified ? "SUPER ADMIN 🛡️" : currentUser.role.replace("_", " ")}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  title="Secure Logout"
                  className="p-1 text-stone-400 hover:text-white hover:bg-white/10 rounded transition-all cursor-pointer ml-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Audio Reader Helper Button */}
            <button
              onClick={handleTTSRead}
              title={lang === "ta" ? "ஒலி வடிவில் கேட்க" : "Listen in Speech"}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-amber-300 hover:text-amber-400 rounded-lg transition-all cursor-pointer flex items-center justify-center border border-white/10"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* FontSize toggler */}
            <div className="flex bg-black/30 p-0.5 rounded-lg border border-white/10 text-xs">
              <button 
                onClick={() => setTextSize("normal")} 
                className={`px-2 py-0.5 rounded transition-all ${textSize === "normal" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-300"}`}
              >
                A
              </button>
              <button 
                onClick={() => setTextSize("large")} 
                className={`px-2 py-0.5 rounded transition-all ${textSize === "large" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-300"}`}
              >
                A+
              </button>
            </div>

            {/* High Contrast */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-1.5 bg-black/25 rounded-lg border border-white/10 text-xs text-amber-300 font-bold ${highContrast ? "bg-amber-500 text-stone-950" : ""}`}
            >
              🌓
            </button>

            {/* Language Selection */}
            <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10 text-xs">
              <button 
                onClick={() => setLang("ta")} 
                className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1 font-bold ${lang === "ta" ? "bg-white text-[#991b1b] shadow" : "text-stone-300"}`}
              >
                <Globe className="w-3 h-3" />
                தமிழ்
              </button>
              <button 
                onClick={() => setLang("en")} 
                className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1 font-bold ${lang === "en" ? "bg-white text-[#991b1b] shadow" : "text-stone-300"}`}
              >
                <Globe className="w-3 h-3" />
                EN
              </button>
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="p-1.5 bg-black/20 hover:bg-black/40 text-amber-300 rounded-lg relative cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">
                  {notifications.length}
                </span>
              </button>

              <AnimatePresence>
                {showNotificationMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 text-stone-800 z-50 text-xs text-left"
                  >
                    <div className="border-b border-stone-100 pb-2 mb-2 flex justify-between items-center">
                      <span className="font-extrabold text-stone-900">{lang === "ta" ? "அறிவிப்புகள்" : "Union Notifications"}</span>
                      <button 
                        onClick={() => setNotifications([])} 
                        className="text-[10px] text-[#b91c1c] font-bold hover:underline"
                      >
                        {lang === "ta" ? "துடை" : "Clear All"}
                      </button>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-stone-400 text-center py-4">No notifications.</p>
                      ) : (
                        notifications.map((n, idx) => (
                          <div key={`app_notif_${n.id}_${idx}`} className="p-2 bg-stone-50 rounded-lg hover:bg-amber-50/50">
                            <p className="font-semibold text-stone-800">{lang === "ta" ? n.text : n.textEn}</p>
                            <span className="text-[9px] text-stone-400 block mt-1">{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </header>

      {/* 3. NAVIGATION BAR */}
      <nav className="bg-stone-900 text-stone-100 py-1.5 px-4 sticky top-0 z-40 shrink-0 border-b border-stone-800 flex justify-center overflow-x-auto select-none scrollbar-none">
        <div className="flex gap-1.5 max-w-7xl w-full">
          {[
            { id: "home", label: "முகப்பு", labelEn: "Home Portal" },
            { id: "register", label: "டிஜிட்டல் பதிவு", labelEn: "Register Member" },
            { id: "welfare_board", label: "நலவாரியம்", labelEn: "Welfare Board" },
            { id: "jobs", label: "வேலைவாய்ப்பு 💼", labelEn: "Painter Jobs 💼" },
            { id: "digital_services", label: "டிஜிட்டல் சேவைகள் ✨", labelEn: "Digital Services ✨" },
            { id: "command_center", label: "கட்டளை மையம் 🏛️", labelEn: "Command Center 🏛️" },
            { id: "tv_channel", label: "TNPA² TV 📺", labelEn: "TNPA² TV 📺" },
            { id: "member_card", label: "உறுப்பினர் அட்டை 🪪", labelEn: "Member Card 🪪" },
            { id: "id_card_portal", label: "அடையாள அட்டை & விண்ணப்பம்", labelEn: "ID Card & Application" },
            { id: "live_comm", label: "நேரடித் தொடர்பு 🔴", labelEn: "Live Meetings 🔴" },
            { id: "advisor", label: "AI ஆலோசகர்", labelEn: "AI Welfare Advisor" },
            { id: "payment", label: "சந்தா & வளர்ச்சி நிதி 💳", labelEn: "Subscriptions & Funds 💳" },
            { id: "executives", label: "நிர்வாகிகள் பட்டியல் 🏛️", labelEn: "Executives Directory 🏛️" },
            { id: "directory", label: "மாவட்ட தொடர்புகள்", labelEn: "Districts Directory" },
            { id: "gallery", label: "மீடியா அரங்கு", labelEn: "Photo Gallery" },
            { id: "role_control", label: "அதிகாரப் பிரிவுகள் & சூப்பர் கீ 🛡️", labelEn: "Role Tiers & Super Key 🛡️" },
            { id: "legal_advisory", label: "மாநில சட்ட ஆலோசனைக் குழு ⚖️", labelEn: "State Legal Advisory Board ⚖️" },
            { id: "office_bearers", label: "பொறுப்பாளர் நியமனம் 🏅", labelEn: "Office Bearers 🏅" },
            { id: "insurance", label: "காப்பீடு & கோரிக்கை 🛡️", labelEn: "Insurance & Relief 🛡️" },
            { id: "academy", label: "பயிற்சி & சான்றிதழ் 🏆", labelEn: "Skill Academy 🏆" },
            { id: "broadcast", label: "மாவட்ட அறிவிப்புகள் 📢", labelEn: "Live Broadcasts 📢" },
            { id: "grievance", label: "உறுப்பினர் குறைகள் 💬", labelEn: "Grievance Desk 💬" },
            ...(currentUser?.role === "super_admin" ? [{ id: "business_console", label: "வணிக மேலாண்மை 💼", labelEn: "Business Console 💼" }] : []),
            { id: "admin", label: "உறுப்பினர் & நிர்வாகம்", labelEn: "Portal Sign In" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id 
                  ? "bg-[#b91c1c] text-white shadow-md border-b-2 border-amber-400" 
                  : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              {lang === "ta" ? tab.label : tab.labelEn}
            </button>
          ))}
        </div>
      </nav>

      {/* 4. MAIN INTERACTIVE CONTENT AREA */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 space-y-8">
        
        {/* TAB 1: HOME PORTAL */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            
            {/* PREMIUM HERO SECTION */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7f1d1d] via-[#4c0519] to-[#1e1b4b] text-white p-4 sm:p-6 md:p-8 shadow-xl border border-stone-800">
              {/* Background Artful Accents */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                
                {/* Left Side: Copy and Quick Actions */}
                <div className="lg:col-span-7 space-y-4 md:space-y-5 text-left flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-300 font-extrabold animate-float-badge w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{lang === "ta" ? "அதிகாரப்பூர்வ டிஜிட்டல் தலைமையகம்" : "Official Digital Headquarters"}</span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-snug tracking-normal text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" spellCheck={false}>
                    {lang === "ta" ? (
                      <>
                        தமிழ்நாட்டின்{" "}
                        <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] font-black">
                          நிறங்களை
                        </span>{" "}
                        வடிக்கும் கரங்களின் வலிமை!
                      </>
                    ) : (
                      <>
                        Empowering the{" "}
                        <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] font-black">
                          Brushstrokes
                        </span>{" "}
                        that Color Tamil Nadu
                      </>
                    )}
                  </h2>
                  
                  <p className="text-stone-300 text-xs md:text-sm leading-relaxed max-w-xl">
                    {lang === "ta" ? (
                      "இல்லங்கள் முதல் இம்மாநிலத்தின் பெரும் கட்டிடங்கள் வரை அழகுபடுத்தும் லட்சக்கணக்கான பெயிண்டர்கள் மற்றும் ஓவியர்களின் வாழ்வாதாரம், சமூகப் பாதுகாப்பு, மற்றும் உரிமைகளைக் காக்கும் மாநிலப் பேரியக்கம்."
                    ) : (
                      "The premier state union safeguarding the livelihoods, welfare schemes, pensions, accident aids, and collective labor rights of professional painters, lacquerers, and spray artisans."
                    )}
                  </p>

                  {/* QUICK ACCESS ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      onClick={() => setActiveTab("register")}
                      className="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#b91c1c] hover:bg-rose-700 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{lang === "ta" ? "டிஜிட்டல் உறுப்பினர் சேர்க்கை" : "Online Membership Enrollment"}</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("advisor")}
                      className="px-4 py-2.5 sm:px-5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs md:text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{lang === "ta" ? "AI நலவாரிய வழிகாட்டி" : "Ask AI Welfare Assistant"}</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Animated flag container */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center gap-4 sm:gap-6 w-full">
                  
                  {/* FLAG RENDERING */}
                  <div 
                    className={`relative w-full max-w-xs sm:w-60 md:w-64 bg-black/20 p-3 sm:p-4 rounded-2xl border border-white/5 shadow-inner ${isSuperAdmin ? "cursor-pointer group hover:border-amber-400/40" : ""}`}
                    onClick={() => {
                      if (isSuperAdmin) {
                        flagInputRef.current?.click();
                      } else {
                        alert(lang === "ta" 
                          ? "🛡️ அனுமதி மறுக்கப்பட்டது: சூப்பர் அட்மினால் மட்டுமே இந்த அப்ளிகேஷனில் உள்ள கொடி, லோகோ மற்றும் அதிகாரப்பூர்வ படங்களை மாற்ற முடியும் (Super Admin Only)." 
                          : "🛡️ Access Denied: Only the verified Super Admin is authorized to change the official flag, logo, or pictures in this application.");
                      }
                    }}
                    title={
                      isSuperAdmin 
                        ? (lang === "ta" ? "சூப்பர் அட்மின்: கொடியை மாற்ற தொடவும்" : "Super Admin: Tap flag to change image")
                        : (lang === "ta" ? "சங்கத்தின் அதிகாரப்பூர்வக் கொடி (சூப்பர் அட்மினால் மட்டுமே மாற்ற முடியும்)" : "Official Association Flag (Super Admin Only)")
                    }
                  >
                    <span className="text-[10px] text-amber-400/80 font-mono block text-center uppercase tracking-widest mb-2 sm:mb-3 flex items-center justify-center gap-1">
                      {lang === "ta" ? "சங்கத்தின் அதிகாரப்பூர்வக் கொடி" : "Official Association Flag"}
                      {isSuperAdmin ? (
                        <Camera className="w-3 h-3 text-amber-400 opacity-80 group-hover:opacity-100" />
                      ) : (
                        <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30">அதிகாரப்பூர்வம்</span>
                      )}
                    </span>
                    
                    {/* 3D Waving Vector Flag Image */}
                    <div className="relative w-48 h-36 sm:w-52 sm:h-40 mx-auto select-none animate-wave-flag overflow-hidden rounded-lg">
                      <img 
                        src={customFlagUrl || flagSvg} 
                        alt={lang === "ta" ? "சங்கத்தின் அதிகாரப்பூர்வக் கொடி" : "Official Association Flag"} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = flagSvg;
                        }}
                      />
                      {isSuperAdmin && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold text-center px-2">
                          <Camera className="w-6 h-6 text-amber-300 mb-1 animate-bounce" />
                          <span>{lang === "ta" ? "சூப்பர் அட்மின்: கொடியை மாற்றுக" : "Super Admin: Change flag"}</span>
                        </div>
                      )}
                    </div>
                    {isSuperAdmin && (
                      <input
                        type="file"
                        ref={flagInputRef}
                        accept="image/jpeg,image/png,image/webp,image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.size > 5 * 1024 * 1024) {
                              alert(lang === "ta" ? "கோப்பின் அளவு 5MB-ஐ விட அதிகமாக இருக்கக்கூடாது (Max 5MB)" : "File size exceeds 5MB limit.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              const base64 = reader.result as string;
                              setCustomFlagUrl(base64);
                              handleAddAuditLog("Updated Association Flag", "Official flag photo updated by Super Admin.");
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* LIVE MEETING BANNER */}
                  <div className="w-full max-w-xs sm:w-64 md:max-w-sm bg-gradient-to-r from-red-950 to-stone-900 border border-red-500/30 rounded-2xl p-3 sm:p-4 shadow-lg text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-xl animate-pulse">
                      🔴 {lang === "ta" ? "நேரலை" : "LIVE SCHEDULE"}
                    </div>
                    
                    <h5 className="font-extrabold text-stone-100 text-xs flex items-center gap-2">
                      <span>{lang === "ta" ? "மாநில அவசரப் பொதுக்குழுக் கூட்டம்" : "Emergency General Assembly Call"}</span>
                    </h5>
                    
                    <p className="text-stone-400 text-[10px] mt-1">
                      {lang === "ta" ? "தலைமை: ரா. சேவியர் பாபு (மாநில பொதுச்செயலாளர்)" : "Chair: R. Xavier Babu (State General Secretary)"}
                    </p>
                    
                    <div className="mt-2.5 flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
                      <div className="text-[10px] text-stone-300">
                        <span>{lang === "ta" ? "துவங்க இன்னும்:" : "Starts In:"}</span>
                        <span className="font-mono text-amber-400 font-bold ml-1 block text-xs">24:12:08</span>
                      </div>
                      
                      <button
                        onClick={() => setActiveTab("live_comm")}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-[10px] rounded-lg transition-all"
                      >
                        {lang === "ta" ? "அரங்கில் நுழைய" : "Join Conference"}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Quick stats board */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "மொத்த உறுப்பினர்கள்", labelEn: "Total Members", val: stats.totalMembers, color: "text-[#b91c1c]", desc: "சங்கத்தில் இணைந்தவர்கள்", descEn: "Enrolled workers" },
                { label: "செயல்பாட்டு மாவட்டங்கள்", labelEn: "Active Districts", val: `${stats.districtsActive}/38`, color: "text-amber-600", desc: "தமிழகத்தின் அனைத்துப் பகுதிகள்", descEn: "Complete state coverage" },
                { label: "வழங்கப்பட்ட நலநிதி", labelEn: "Welfare Disbursed", val: `₹${stats.welfareDisbursed.toLocaleString()}`, color: "text-[#b91c1c]", desc: "குடும்ப நல உதவி மற்றும் ஓய்வூதியம்", descEn: "Disbursed to date" },
                { label: "தீர்க்கப்பட்ட வழக்குகள்", labelEn: "Welfare Board Registrations", val: stats.solvedCases, color: "text-emerald-600", desc: "தொழில்சார் சட்டப் பாதுகாப்பு", descEn: "Government board claims" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-sm text-center">
                  <span className="text-[10px] font-black uppercase text-stone-500 block tracking-wider">
                    {lang === "ta" ? stat.label : stat.labelEn}
                  </span>
                  <p className={`text-xl md:text-2xl font-black ${stat.color} my-1`}>
                    {stat.val}
                  </p>
                  <span className="text-[10px] text-stone-400 block font-medium">
                    {lang === "ta" ? stat.desc : stat.descEn}
                  </span>
                </div>
              ))}
            </div>

            {/* ROLE-BASED SECURE MOBILE AUTH & POWER ACCESS */}
            <section className="bg-stone-900 border border-amber-500/30 rounded-2xl p-5 text-white shadow-xl text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-stone-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h4 className="font-black text-amber-300 text-sm tracking-wide uppercase">
                      {lang === "ta" ? "பொறுப்புப் பாதுகாப்பு சரிபார்ப்பு & மொபைல் உள்நுழைவு" : "Role-Based Secure Mobile Authentication"}
                    </h4>
                  </div>
                  <p className="text-stone-300 text-xs mt-1">
                    {lang === "ta" 
                      ? "பாதுகாப்பு விதிமுறை: சோதனைப் பகுதியாக இருந்தாலும், அந்தந்த பொறுப்பிற்கு பதிவு செய்யப்பட்ட அதிகாரப்பூர்வ மொபைல் எண் மற்றும் 6-இலக்க OTP சரிபார்ப்பு மூலம் மட்டுமே உள்நுழைய முடியும்." 
                      : "Security Policy: Even for testing, access is strictly restricted to entering the official registered mobile number and completing 6-digit OTP verification."}
                  </p>
                </div>
                {currentUser && (
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{lang === "ta" ? "தற்போதைய அதிகாரம்:" : "Active Power:"} <span className="uppercase">{currentUser.role.replace("_", " ")}</span></span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {getRegisteredRoleConfigs(executives).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedRoleAuth(item);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.02] ${
                      currentUser?.role === item.role
                        ? "bg-amber-500/20 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/40"
                        : "bg-stone-800/80 hover:bg-stone-800 border-stone-700 text-stone-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {item.icon}
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${item.colorTheme.badgeBg}`}>
                          {lang === "ta" ? item.badgeTa : item.badgeEn}
                        </span>
                      </div>
                      <span className="font-extrabold text-xs block text-stone-100">{lang === "ta" ? item.titleTa : item.titleEn}</span>
                      <span className="text-[11px] text-stone-300 block truncate mt-0.5 font-medium">{lang === "ta" ? item.officerNameTa : item.officerNameEn}</span>
                      <span className="text-[10px] text-amber-300/80 block font-mono mt-1">
                        {lang === "ta" ? "பதிவு எண்:" : "Reg Phone:"} {item.validPhones.length > 0 ? item.validPhones.map(p => `...${p.slice(-4)}`).join(" / ") : (lang === "ta" ? "பதிவு செய்யப்பட்டுள்ளது" : "Registered")}
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-400 font-bold mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>{lang === "ta" ? "மொபைல் எண் வழி சரிபார்க்க" : "Verify Mobile & Login"}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* State Leaders (Only State President & General Secretary on Home Page) */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="text-[#b91c1c] font-black text-xs uppercase tracking-wider block">
                  {lang === "ta" ? "நமது மாநில தலைமை நிர்வாகிகள்" : "STATE UNION EXECUTIVE LEADERS"}
                </span>
                <h3 className="text-lg md:text-xl font-extrabold text-stone-900 mt-1">
                  {lang === "ta" ? "பெயிண்டர்கள் மற்றும் ஓவியர்களின் உரிமையை மீட்டு காப்போம்" : "Reclaiming and Protecting the Rights of Painters and Artists"}
                </h3>
              </div>

              {/* Only State President and State General Secretary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {leaders
                  .filter(l => 
                    l.roleEn.includes("President") || 
                    l.roleEn.includes("Secretary") ||
                    l.role.includes("தலைவர்") || 
                    l.role.includes("பொதுச்செயலாளர்")
                  )
                  .slice(0, 2)
                  .map((leader, idx) => {
                  const isPresident = leader.roleEn.includes("President") || leader.role.includes("தலைவர்");
                  const isSecretary = leader.roleEn.includes("Secretary") || leader.role.includes("செயலாளர்");

                  const defaultPhoto = isPresident 
                    ? "/s_michael_alvin.svg" 
                    : isSecretary 
                      ? "/r_xavier_babu.svg" 
                      : "/r_sakthivel.svg";
                  
                  const photoSrc = (leader.photoUrl && !leader.photoUrl.includes("placehold.co")) 
                    ? leader.photoUrl 
                    : defaultPhoto;

                  const borderStyle = isPresident
                    ? "border-4 border-amber-500 ring-2 ring-amber-100 shadow-amber-100"
                    : "border-4 border-blue-600 ring-2 ring-blue-100 shadow-blue-100";

                  const badgeStyle = isPresident
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-blue-50 border-blue-200 text-blue-900";

                  return (
                    <div key={`app_ldr_${leader.id}_${idx}`} className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50 hover:shadow-md transition-all flex flex-col items-center p-5 text-center">
                      <div 
                        className={`relative mb-3 ${isSuperAdmin ? "group cursor-pointer" : ""}`}
                        onClick={() => {
                          if (isSuperAdmin) {
                            const input = document.getElementById(`app_ldr_file_${leader.id}`) as HTMLInputElement;
                            input?.click();
                          }
                        }}
                      >
                        <img 
                          src={photoSrc} 
                          alt={leader.name} 
                          className={`h-28 w-28 rounded-full object-cover shadow-md bg-white ${borderStyle}`} 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultPhoto;
                          }}
                        />
                        {isSuperAdmin && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                            <Camera className="w-5 h-5 mb-0.5 text-amber-300" />
                            <span>{lang === "ta" ? "மாற்று" : "Change"}</span>
                          </div>
                        )}
                        {isSuperAdmin && (
                          <input
                            type="file"
                            id={`app_ldr_file_${leader.id}`}
                            accept="image/jpeg,image/png,image/webp,image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                if (file.size > 2 * 1024 * 1024) {
                                  alert(lang === "ta" ? "கோப்பின் அளவு 2MB-ஐ விட அதிகமாக இருக்கக்கூடாது (Max 2MB)" : "File size exceeds 2MB limit.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const base64 = reader.result as string;
                                  const updated = leaders.map(l => l.id === leader.id ? { ...l, photoUrl: base64 } : l);
                                  setLeaders(updated);
                                  handleAddAuditLog("Updated Leader Photo", `Photo updated for leader: ${leader.nameEn}`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        )}
                      </div>

                      <h4 className="font-extrabold text-stone-900 text-base">
                        {lang === "ta" ? leader.name : leader.nameEn}
                      </h4>

                      <span className={`px-3 py-0.5 border rounded-full font-extrabold text-[11px] uppercase mt-1 text-center ${badgeStyle}`}>
                        {lang === "ta" ? leader.role : leader.roleEn}
                      </span>

                      <div className="flex items-center gap-2 mt-4 w-full">
                        <a
                          href={`tel:${leader.phone}`}
                          className="flex-1 py-2 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>{leader.phone}</span>
                        </a>

                        <a
                          href={`https://wa.me/${leader.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all cursor-pointer"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SEPARATE 4-TIER EXECUTIVE DIRECTORIES HUB (State, District, Zone, Area/Union) */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-5 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#b91c1c]" />
                    <h3 className="font-black text-stone-900 text-base uppercase tracking-wide">
                      {lang === "ta" ? "நிர்வாகிகள் பட்டியல் (4 தனித்தனி அடுக்குகள்)" : "Executive Directories (4 Distinct Tiers)"}
                    </h3>
                  </div>
                  <p className="text-stone-500 text-xs mt-1">
                    {lang === "ta" 
                      ? "மாநிலம், மாவட்டம், மண்டலம் மற்றும் பகுதி ஒன்றிய நிர்வாகிகள் பட்டியல் தனித்தனியாக தொகுக்கப்பட்டுள்ளது. பொறுப்பாளர்களை நியமிப்பது மாற்றுவது சூப்பர் அட்மின் கட்டுப்பாட்டில் உள்ளது."
                      : "Distinct administrative directories for State, District, Zone, and Area/Union levels. Controlled by Super Admin."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveTab("executives");
                      setSelectedExecutiveLevel("state");
                    }}
                    className="px-4 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{lang === "ta" ? "முழு நிர்வாகிகள் பட்டியல் ➔" : "View Full Executives ➔"}</span>
                  </button>
                </div>
              </div>

              {/* 4 Dedicated Tier Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. மாநில நிர்வாகிகள் பட்டியல் */}
                <div className="bg-gradient-to-br from-stone-50 to-rose-50/40 border border-stone-200 hover:border-rose-300 p-4 rounded-2xl flex flex-col justify-between transition-all hover:shadow-md group">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-[#b91c1c] bg-rose-100 px-2.5 py-0.5 rounded-full">
                        {lang === "ta" ? "அடுக்கு 1 / Tier 1" : "Tier 1"}
                      </span>
                      <span className="text-[11px] font-extrabold text-stone-700">
                        {executives.filter(e => e.level === "state").length} {lang === "ta" ? "நிர்வாகிகள்" : "Leaders"}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-sm mt-2 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#b91c1c]" />
                      <span>{lang === "ta" ? "மாநில நிர்வாகிகள் பட்டியல்" : "State Executives List"}</span>
                    </h4>
                    <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                      {lang === "ta" 
                        ? "மாநில தலைவர், பொதுச்செயலாளர், பொருளாளர், துணைத் தலைவர்கள் மற்றும் மாநில சட்ட ஆலோசனைக் குழு."
                        : "State President, General Secretary, Treasurer, Vice Presidents, and State Advisory Board."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("executives");
                      setSelectedExecutiveLevel("state");
                    }}
                    className="w-full py-2 bg-white group-hover:bg-[#b91c1c] text-stone-900 group-hover:text-white border border-stone-200 group-hover:border-transparent rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer mt-3"
                  >
                    <span>{lang === "ta" ? "மாநில பட்டியல் பார்க்க" : "View State List"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. மாவட்ட நிர்வாகிகள் பட்டியல் */}
                <div className="bg-gradient-to-br from-stone-50 to-blue-50/40 border border-stone-200 hover:border-blue-300 p-4 rounded-2xl flex flex-col justify-between transition-all hover:shadow-md group">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                        {lang === "ta" ? "அடுக்கு 2 / Tier 2" : "Tier 2"}
                      </span>
                      <span className="text-[11px] font-extrabold text-stone-700">
                        {executives.filter(e => e.level === "district").length} {lang === "ta" ? "பொறுப்பாளர்கள்" : "Leaders"}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-sm mt-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{lang === "ta" ? "மாவட்ட நிர்வாகிகள் பட்டியல்" : "District Executives List"}</span>
                    </h4>
                    <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                      {lang === "ta" 
                        ? "தமிழ்நாட்டின் 38 மாவட்டங்களின் தலைவர், செயலாளர், பொருளாளர் மற்றும் மாவட்ட ஒருங்கிணைப்பாளர்கள்."
                        : "District Presidents, Secretaries, Treasurers, and Coordinators across all 38 districts."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("executives");
                      setSelectedExecutiveLevel("district");
                    }}
                    className="w-full py-2 bg-white group-hover:bg-blue-600 text-stone-900 group-hover:text-white border border-stone-200 group-hover:border-transparent rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer mt-3"
                  >
                    <span>{lang === "ta" ? "மாவட்ட பட்டியல் பார்க்க" : "View District List"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3. மண்டல நிர்வாகிகள் பட்டியல் */}
                <div className="bg-gradient-to-br from-stone-50 to-amber-50/40 border border-stone-200 hover:border-amber-300 p-4 rounded-2xl flex flex-col justify-between transition-all hover:shadow-md group">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        {lang === "ta" ? "அடுக்கு 3 / Tier 3" : "Tier 3"}
                      </span>
                      <span className="text-[11px] font-extrabold text-stone-700">
                        {executives.filter(e => e.level === "zone").length} {lang === "ta" ? "மண்டல பொறுப்புகள்" : "Zonal Posts"}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-sm mt-2 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-600" />
                      <span>{lang === "ta" ? "மண்டல நிர்வாகிகள் பட்டியல்" : "Zonal Executives List"}</span>
                    </h4>
                    <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                      {lang === "ta" 
                        ? "வடக்கு, தெற்கு, மேற்கு, மத்திய மற்றும் கிழக்கு மண்டல செயலாளர்கள் மற்றும் ஒருங்கிணைப்பாளர்கள்."
                        : "North, South, West, Central & East Zonal Secretaries and Regional Coordinators."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("executives");
                      setSelectedExecutiveLevel("zone");
                    }}
                    className="w-full py-2 bg-white group-hover:bg-amber-600 text-stone-900 group-hover:text-white border border-stone-200 group-hover:border-transparent rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer mt-3"
                  >
                    <span>{lang === "ta" ? "மண்டல பட்டியல் பார்க்க" : "View Zonal List"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4. பகுதி ஒன்றிய நிர்வாகிகள் பட்டியல் */}
                <div className="bg-gradient-to-br from-stone-50 to-emerald-50/40 border border-stone-200 hover:border-emerald-300 p-4 rounded-2xl flex flex-col justify-between transition-all hover:shadow-md group">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {lang === "ta" ? "அடுக்கு 4 / Tier 4" : "Tier 4"}
                      </span>
                      <span className="text-[11px] font-extrabold text-stone-700">
                        {executives.filter(e => e.level === "union_area").length} {lang === "ta" ? "கிளை அமைப்புகள்" : "Local Units"}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-sm mt-2 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>{lang === "ta" ? "பகுதி ஒன்றிய நிர்வாகிகள் பட்டியல்" : "Area & Union List"}</span>
                    </h4>
                    <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                      {lang === "ta" 
                        ? "வட்ட ஒன்றியங்கள், நகர அமைப்புகள் மற்றும் பகுதி அளவிலான களப் பொறுப்பாளர்கள் பட்டியல்."
                        : "Block unions, town branches, and area coordinators connecting local professional painters."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("executives");
                      setSelectedExecutiveLevel("union_area");
                    }}
                    className="w-full py-2 bg-white group-hover:bg-emerald-600 text-stone-900 group-hover:text-white border border-stone-200 group-hover:border-transparent rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer mt-3"
                  >
                    <span>{lang === "ta" ? "பகுதி/ஒன்றிய பட்டியல் பார்க்க" : "View Union/Area List"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Super Admin Status Banner */}
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-stone-700 font-semibold">
                    {lang === "ta" 
                      ? "நிர்வாகிகளை நியமிப்பது, பொறுப்புகளை மாற்றுவது மற்றும் நீக்குவது அனைத்தும் சூப்பர் அட்மினின் நேரடிக் கட்டுப்பாட்டில் இயங்குகிறது."
                      : "Executive appointments, role modifications, and relieves are exclusively managed under Super Admin credentials."}
                  </span>
                </div>

                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab("executives");
                      setSelectedExecutiveLevel("state");
                    }}
                    className="px-3.5 py-1.5 bg-[#b91c1c] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-rose-700 transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === "ta" ? "நிர்வாகி நியமன பலகை" : "Open Appoint Desk"}</span>
                  </button>
                )}
              </div>
            </section>

            {/* SUPER ADMIN, ADMIN POWERS & SPECIAL AI OPTIONS HUB */}
            <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white rounded-3xl p-6 md:p-8 border border-stone-800 shadow-xl space-y-6 text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 border border-rose-500/30 rounded-full text-xs text-rose-300 font-extrabold mb-2">
                    <Cpu className="w-3.5 h-3.5 text-rose-400" />
                    <span>{lang === "ta" ? "சூப்பர் அட்மின் & சிறப்பு AI விருப்பங்கள்" : "Super Admin Powers & Special AI Capabilities"}</span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {lang === "ta" ? "நிர்வாக கருவிகள் & செயற்கை நுண்ணறிவு மேலாண்மை" : "Advanced Executive Control & Artificial Intelligence Suite"}
                  </h3>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("advisor")}
                    className="px-4 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-300" />
                    <span>{lang === "ta" ? "AI தமிழ் ஆலோசகர்" : "AI Tamil Advisor"}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>{lang === "ta" ? "நிர்வாகி கன்சோல்" : "Admin Console"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1: State President Desk */}
                <div className="bg-stone-800/90 border border-stone-700 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-rose-400">
                      <Crown className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm text-white">
                        {lang === "ta" ? "மாநில தலைவர் அட்மின்" : "State President Admin"}
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs text-stone-300">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{lang === "ta" ? "38 மாவட்ட நிர்வாகிகள் நியமனம் & ஒப்புதல்" : "38 District Executive Appointments"}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{lang === "ta" ? "சங்க வங்கிக் கணக்கு நிதி தணிக்கை" : "Union Financial Audit & Treasury"}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{lang === "ta" ? "TNPA² டிவி நேரலை & சுற்றறிக்கை கட்டுப்பாடு" : "TNPA² TV Live Stream & Broadcast Desk"}</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="w-full py-2 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    {lang === "ta" ? "தலைவர் அட்மின் பலகை" : "Open President Desk"}
                  </button>
                </div>

                {/* Card 2: District & Zone Admin Desk */}
                <div className="bg-stone-800/90 border border-stone-700 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-amber-400">
                      <Shield className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm text-white">
                        {lang === "ta" ? "மாவட்ட & மண்டல அட்மின்" : "District & Zone Admin"}
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs text-stone-300">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{lang === "ta" ? "உறுப்பினர் விண்ணப்பங்கள் சரிபார்ப்பு" : "Verify District Member Applications"}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{lang === "ta" ? "நலவாரிய நிதிகளை அரசுக்கு பரிந்துரை" : "Forward Welfare Grants to Board"}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{lang === "ta" ? "மாவட்ட சுற்றறிக்கை மற்றும் கூட்டம் அறிவிப்பு" : "Broadcast District Circulars"}</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    {lang === "ta" ? "மாவட்ட அட்மின் பலகை" : "Open District Admin Desk"}
                  </button>
                </div>

                {/* Card 3: Special AI Options */}
                <div className="bg-stone-800/90 border border-stone-700 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                      <Sparkles className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm text-white">
                        {lang === "ta" ? "AI சிறப்பு விருப்பங்கள்" : "Special AI Options"}
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs text-stone-300">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{lang === "ta" ? "தமிழ் AI நலவாரிய கேள்விகள் பதில்" : "Automated Tamil Welfare Scheme Advisor"}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{lang === "ta" ? "ஆவண OCR மற்றும் ஆதார் சரிபார்ப்பு" : "Instant Document Verification Reader"}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{lang === "ta" ? "நேரலை அவசர குரல் செய்தி பகுப்பாய்வு" : "Live Meeting Audio Grievance Analyzer"}</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab("advisor")}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    {lang === "ta" ? "AI விருப்பங்களை இயக்குக" : "Launch AI Options Hub"}
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Services Grid */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-stone-900 text-sm tracking-wide uppercase text-left flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{lang === "ta" ? "சங்கத்தின் முதன்மை சேவைகள் & கருவிகள்" : "Union Primary Services & Modules"}</span>
                </h4>
                <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                  {lang === "ta" ? "அனைத்து 9 சேவைகள்" : "All 9 Modules Active"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "உறுப்பினர் சேர்க்கை", titleEn: "Member Enrolment", desc: "ஆன்லைன் மூலம் சங்கத்தில் இணைந்து உங்கள் டிஜிட்டல் அடையாள அட்டையை உடனடியாகப் பெறுங்கள்.", descEn: "Join the union online, fill the details & download your instant digital ID card.", tab: "register", icon: <UserPlus className="w-5 h-5 text-amber-700" />, badge: "புதியது / New" },
                  { title: "அரசு நலவாரியத் திட்டங்கள்", titleEn: "Welfare Schemes & Claims", desc: "அரசு நலவாரிய நிதி உதவி, விபத்து காப்பீடு & கல்வி உதவித்தொகை விண்ணப்பங்கள்.", descEn: "Government Welfare Board pension, accident relief & educational grant portal.", tab: "welfare_board", icon: <HeartHandshake className="w-5 h-5 text-rose-700" />, badge: "முக்கியம் / Core" },
                  { title: "டிஜிட்டல் சேவைகள் & QR", titleEn: "Digital Services & ID Verifier", desc: "QR அட்டை சரிபார்ப்பு, சுற்றறிக்கை பதிவிறக்கம் மற்றும் சான்றிதழ் கருவிகள்.", descEn: "Instant QR card verification, circular downloads and digital verification portal.", tab: "digital_services", icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />, badge: "சரிபார்ப்பு / QR" },
                  { title: "மாநில கட்டளை மையம்", titleEn: "State Command Center", desc: "சங்கத்தின் மாநில/மாவட்ட நிர்வாக அறிவிப்புகள், திட்டங்கள் மற்றும் சுற்றறிக்கைகள்.", descEn: "Union state/district administration desk, projects and circular repository.", tab: "command_center", icon: <Award className="w-5 h-5 text-amber-700" />, badge: "நிர்வாகம் / Desk" },
                  { title: "நேரடித் தொடர்பு & குறைதீர்ப்பு", titleEn: "Live Communication & Grievance", desc: "மாநில தலைவர்களுடன் நேரலை கூட்டங்கள், குரல் பதிவுகள் மற்றும் குறைதீர்ப்பு.", descEn: "Live meeting broadcasts, audio voice notes & direct grievance reporting system.", tab: "live_comm", icon: <Volume2 className="w-5 h-5 text-red-700" />, badge: "நேரலை / Live" },
                  { title: "AI நலவாரிய ஆலோசகர்", titleEn: "AI Tamil Welfare Advisor", desc: "நலவாரியத் திட்டங்கள், ஓய்வூதியம் மற்றும் விண்ணப்ப சந்தேகங்களுக்கு AI உதவி.", descEn: "Ask our automated AI Chatbot in Tamil/English about pensions, marriage grants, etc.", tab: "advisor", icon: <MessageSquare className="w-5 h-5 text-[#b91c1c]" />, badge: "AI Smart" },
                  { title: "சந்தா செலுத்த", titleEn: "Online Subscription & Receipts", desc: "மாதாந்திர/ஆண்டு சந்தா தொகையை UPI/QR மூலம் செலுத்தி ரசீது பெறுக.", descEn: "Pay monthly union subscription fees via UPI & download official payment receipts.", tab: "payment", icon: <CreditCard className="w-5 h-5 text-blue-700" />, badge: "ரசீது / Receipt" },
                  { title: "மாவட்ட தொடர்புகள்", titleEn: "Districts Leadership Directory", desc: "38 மாவட்ட தலைவர்கள் & நிர்வாகிகளின் நேரடி தொலைபேசி எண்கள்.", descEn: "Direct contact numbers, executive list and office addresses for all 38 districts.", tab: "directory", icon: <MapPin className="w-5 h-5 text-indigo-700" />, badge: "38 மாவட்டங்கள்" },
                  { title: "மீடியா & புகைப்பட அரங்கு", titleEn: "Photo Gallery & Video Archive", desc: "சங்கப் போராட்டங்கள், மாநாடுகள் மற்றும் வரலாற்று புகைப்படங்கள்.", descEn: "High quality photographic archive, union protests, conferences and events.", tab: "gallery", icon: <Camera className="w-5 h-5 text-purple-700" />, badge: "புகைப்படங்கள்" }
                ].map((serv, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(serv.tab as any)}
                    className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer text-left flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="h-10 w-10 rounded-xl bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                          {serv.icon}
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full border border-stone-200 group-hover:bg-amber-50 group-hover:text-amber-900 group-hover:border-amber-200 transition-colors">
                          {serv.badge}
                        </span>
                      </div>
                      
                      <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-[#b91c1c] transition-colors">
                        {lang === "ta" ? serv.title : serv.titleEn}
                      </h4>
                      <p className="text-stone-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
                        {lang === "ta" ? serv.desc : serv.descEn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[#b91c1c] font-black text-xs mt-4 pt-3 border-t border-stone-100">
                      <span>{lang === "ta" ? "துவக்குக" : "Open Module"}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* News and Bulletins */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-left">
                <div>
                  <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
                    <h4 className="font-extrabold text-stone-900 text-sm">
                      {lang === "ta" ? "அரசு நலவாரிய திட்டங்கள்" : "Government Welfare Schemes & Aids"}
                    </h4>
                    <span className="text-[10px] text-amber-800 font-extrabold uppercase bg-amber-50 px-2 py-0.5 rounded">
                      {lang === "ta" ? "உரிமைகள்" : "Welfare Board"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {initialWelfareSchemes.map((scheme, idx) => (
                      <div key={`app_ws_${scheme.id}_${idx}`} className="p-3.5 bg-stone-50 border border-stone-100 rounded-xl">
                        <span className="font-extrabold text-stone-900 text-xs block">
                          {lang === "ta" ? scheme.title : scheme.titleEn}
                        </span>
                        <p className="text-stone-500 text-[11px] mt-1 leading-relaxed">
                          {lang === "ta" ? scheme.description : scheme.descriptionEn}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-2 text-[10px]">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-black rounded-lg">
                            {lang === "ta" ? "உதவித் தொகை:" : "Grant Amount:"} {scheme.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("advisor")}
                  className="mt-4 w-full py-2.5 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {lang === "ta" ? "நலத்திட்டங்களுக்கு விண்ணப்பிப்பது எப்படி? AI வினாவிடை" : "How to Apply? Talk with AI Advisor"}
                </button>
              </div>

              {/* News bulletin feed */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="border-b border-stone-100 pb-2">
                    <h4 className="font-extrabold text-stone-900 text-sm">
                      {lang === "ta" ? "செய்திகள் & அறிவிப்புகள்" : "Union News Feed"}
                    </h4>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder={lang === "ta" ? "அறிவிப்புகளைத் தேட..." : "Search circulars..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  </div>

                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {filteredNews.map((newsItem, idx) => (
                      <div key={`app_news_${newsItem.id}_${idx}`} className="border-b border-stone-100 pb-3 last:border-none last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-[#b91c1c] font-black uppercase tracking-wider block">
                            {newsItem.categoryTa}
                          </span>
                          <span className="text-[9px] text-stone-400 block">{newsItem.date}</span>
                        </div>
                        <h5 className="font-extrabold text-stone-900 text-xs mt-0.5">
                          {lang === "ta" ? newsItem.title : newsItem.titleEn}
                        </h5>
                        
                        {/* News Image Preview from Mobile Gallery */}
                        {newsItem.imageUrl && (
                          <div className="mt-2 mb-1.5 rounded-xl overflow-hidden border border-stone-200 shadow-xs">
                            <img 
                              src={newsItem.imageUrl} 
                              alt={newsItem.title} 
                              className="w-full h-36 object-cover hover:scale-102 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <p className="text-stone-600 text-[11px] mt-1 leading-relaxed">
                          {lang === "ta" ? newsItem.content : newsItem.contentEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 text-center text-[11px] text-stone-400 font-bold">
                  {lang === "ta" ? "● அணைத்து அறிவிப்புகளும் நேரலையாக உள்ளன" : "● Live news sync active"}
                </div>
              </div>

            </section>

            {/* Gallery */}
            <section className="space-y-4 text-left">
              <div className="border-b border-stone-100 pb-2">
                <h4 className="font-black text-stone-900 text-sm uppercase">
                  {lang === "ta" ? "சங்க புகைப்படக் கண்காட்சி" : "Media gallery & event highlights"}
                </h4>
              </div>
              <GallerySlider lang={lang} currentUser={currentUser} isSuperAdmin={isSuperAdmin} onAddAuditLog={handleAddAuditLog} />
            </section>

            {/* CONTACT & SUPPORT HUB */}
            <section id="contact-hub" className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="text-[#b91c1c] font-black text-xs uppercase tracking-wider block">
                  {lang === "ta" ? "தொடர்பு மற்றும் ஆதரவு மையம்" : "CONTACT & EXECUTIVE SUPPORT CENTER"}
                </span>
                <h3 className="text-lg md:text-2xl font-extrabold text-stone-900 mt-1">
                  {lang === "ta" ? "ஏதேனும் சந்தேகங்கள் உள்ளதா? எங்களை தொடர்பு கொள்ளவும்" : "Have Queries? Get in Touch with Our Executive Panel"}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Contact Form (7 cols) */}
                <div className="lg:col-span-7 bg-stone-50 border border-stone-100 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-extrabold text-stone-900 text-sm mb-4">
                    {lang === "ta" ? "உடனடி உதவி கோரிக்கை படிவம்" : "Instant Help & Resolution Form"}
                  </h4>

                  {/* Form fields */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get("name") as string;
                    const phone = formData.get("phone") as string;
                    const category = formData.get("category") as string;
                    const message = formData.get("message") as string;
                    
                    if (!name || !phone || !message) {
                      alert(lang === "ta" ? "தயவுசெய்து அனைத்து கட்டாய துறைகளையும் நிரப்பவும்." : "Please fill out all required fields.");
                      return;
                    }

                    // Success alert
                    alert(
                      lang === "ta"
                        ? `நன்றி ${name}! உங்கள் கோரிக்கை (${category}) சமர்ப்பிக்கப்பட்டது. விரைவில் உங்களைத் தொடர்புகொள்வோம்.`
                        : `Thank you ${name}! Your request regarding ${category} was received. We will call you shortly.`
                    );
                    
                    // Add audit log
                    handleAddAuditLog(
                      "Contact Request Filed",
                      `Visitor ${name} (${phone}) filed query regarding: ${category}. Message preview: "${message.substring(0, 40)}..."`
                    );

                    // Clear form
                    (e.target as HTMLFormElement).reset();
                  }} className="space-y-4 text-xs text-stone-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-stone-500 font-extrabold uppercase mb-1">
                          {lang === "ta" ? "முழு பெயர் (கட்டாயம்) *" : "Full Name (Required) *"}
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder={lang === "ta" ? "உதாரணம்: கதிரேசன்" : "e.g., Kathiresan"}
                          className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] text-stone-500 font-extrabold uppercase mb-1">
                          {lang === "ta" ? "கைபேசி எண் (கட்டாயம்) *" : "Phone Number (Required) *"}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder={lang === "ta" ? "+91 98765 43210" : "+91 98765 43210"}
                          className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-stone-500 font-extrabold uppercase mb-1">
                          {lang === "ta" ? "மாவட்டம்" : "District"}
                        </label>
                        <select
                          name="district"
                          className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                        >
                          <option value="Trichy">திருச்சிராப்பள்ளி (Trichy)</option>
                          <option value="Chennai">சென்னை (Chennai)</option>
                          <option value="Madurai">மதுரை (Madurai)</option>
                          <option value="Coimbatore">கோயம்புத்தூர் (Coimbatore)</option>
                          <option value="Salem">சேலம் (Salem)</option>
                          <option value="Other">மற்றவை (Other)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-500 font-extrabold uppercase mb-1">
                          {lang === "ta" ? "விசாரணை வகை" : "Query Category"}
                        </label>
                        <select
                          name="category"
                          className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                        >
                          <option value="new_membership">{lang === "ta" ? "புதிய உறுப்பினர் சேர்க்கை" : "New Member Registration"}</option>
                          <option value="welfare_scheme">{lang === "ta" ? "அரசு நலவாரிய திட்டங்கள்" : "Government Welfare Schemes"}</option>
                          <option value="accident_rescue">{lang === "ta" ? "விபத்து கால அவசர உதவி" : "Accident Rescue Assistance"}</option>
                          <option value="payment_help">{lang === "ta" ? "சந்தா கட்டணம் செலுத்துதல்" : "Subscription Fee Payments"}</option>
                          <option value="other">{lang === "ta" ? "இதர சந்தேகங்கள்" : "Other General Query"}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-500 font-extrabold uppercase mb-1">
                        {lang === "ta" ? "உங்கள் கருத்து / கோரிக்கை *" : "Your Message / Petition *"}
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        placeholder={lang === "ta" ? "தயவுசெய்து உங்கள் கோரிக்கையை விரிவாக எழுதவும்..." : "Please describe your query or support request in detail..."}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#b91c1c] hover:bg-rose-700 text-white font-extrabold rounded-xl transition-all shadow cursor-pointer text-xs md:text-sm"
                    >
                      {lang === "ta" ? "விண்ணப்பத்தை சமர்ப்பிக்க" : "Submit Help Petition"}
                    </button>
                  </form>
                </div>

                {/* Address & Google Map (5 cols) */}
                <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                  <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-5 space-y-4">
                    <h4 className="font-extrabold text-stone-900 text-sm border-b border-stone-200/50 pb-2">
                      {lang === "ta" ? "சங்கத் தலைமையகம்" : "State Headquarters Office"}
                    </h4>
                    
                    <div className="space-y-3 text-xs text-stone-600 leading-relaxed text-left">
                      <p className="flex items-start gap-2">
                        <span className="shrink-0 font-bold text-amber-500">📍</span>
                        <span>
                          <strong>{lang === "ta" ? "முகவரி:" : "Address:"}</strong><br />
                          {lang === "ta" 
                            ? "அம்பலக்காரன்பட்டி, உத்தங்குடி போஸ்டல், மேலூர் மெயின் ரோடு, மதுரை 625107." 
                            : "Ambalakkaranpatti, Uthangudi Post, Melur Main Road, Madurai 625107."}
                        </span>
                      </p>
                      
                      <p className="flex items-center gap-2">
                        <span className="shrink-0 font-bold text-amber-500">📞</span>
                        <span>
                          <strong>{lang === "ta" ? "கைபேசி எண்:" : "Mobile Helpline:"}</strong><br />
                          <a href="tel:+917010131915" className="hover:underline text-[#b91c1c] font-bold">+91 70101 31915</a>
                        </span>
                      </p>

                      <p className="flex items-center gap-2">
                        <span className="shrink-0 font-bold text-amber-500">✉️</span>
                        <span>
                          <strong>Email:</strong><br />
                          <a href="mailto:paintargaloviyargalmunnetrasan@gmail.com" className="hover:underline text-[#b91c1c] font-bold text-xs sm:text-sm break-all">paintargaloviyargalmunnetrasan@gmail.com</a>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Visual Map Pin */}
                  <div className="bg-gradient-to-br from-stone-50 to-amber-50/20 border border-stone-200 rounded-2xl p-4 shadow-sm text-center flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-[#b91c1c] font-black uppercase tracking-widest block mb-2">
                        {lang === "ta" ? "வரைபடம் மற்றும் இருப்பிடம்" : "OFFICIAL HEADQUARTERS LOCATION MAP"}
                      </span>
                      
                      {/* Stylized Map Vector */}
                      <div className="relative h-28 bg-blue-50 border border-blue-100 rounded-xl overflow-hidden mb-3 shadow-inner flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-stone-300 pointer-events-none" />
                        
                        {/* Fake Google Map Grid Roads */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="w-full h-0.5 bg-amber-400/40 absolute top-10" />
                          <div className="w-full h-0.5 bg-amber-400/40 absolute top-16" />
                          <div className="h-full w-0.5 bg-blue-400/30 absolute left-24" />
                          <div className="h-full w-0.5 bg-blue-400/30 absolute left-40" />
                        </div>

                        {/* HQ Pin */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className="h-4 w-4 bg-[#b91c1c] rounded-full border-2 border-white animate-ping absolute" />
                          <MapPin className="w-6 h-6 text-[#b91c1c] relative z-10" />
                        </div>
                        
                        <span className="absolute bottom-1 right-2 text-[8px] bg-white/80 text-stone-500 px-1 rounded">
                          Madurai, Tamil Nadu
                        </span>
                      </div>
                    </div>

                    <a
                      href="https://maps.google.com/?q=Ambalakkaranpatti,Melur+Main+Road,Uthangudi,Madurai,Tamil+Nadu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{lang === "ta" ? "கூகுள் மேப்பில் பார்க்க" : "View on Google Maps"}</span>
                    </a>
                  </div>

                </div>

              </div>
            </section>

          </div>
        )}

        {/* TAB 2: DIGITAL REGISTER */}
        {activeTab === "register" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <MemberRegistrationForm 
              lang={lang} 
              onSubmitRegistration={handleNewRegistration} 
              registrations={registrations}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* TAB 3: AI WELFARE CHATBOT */}
        {activeTab === "advisor" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <WelfareAdvisor 
              lang={lang} 
              currentUser={currentUser}
              systemSettings={systemSettings}
              systemData={{
                totalRegisteredMembers: registrations.length + 12480,
                pendingClaimsCount: welfareApplications.filter(a => a.status === "pending").length,
                approvedClaimsCount: welfareApplications.filter(a => a.status === "approved").length,
                totalSubscriptionCollections: payments.reduce((acc, p) => acc + p.amount, 0) + 4829000,
                activeDistrictsCount: 38
              }}
            />
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION & UNION DEVELOPMENT FUND PAYMENT MODULE */}
        {activeTab === "payment" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <PaymentModule 
              lang={lang} 
              onAddPayment={handleNewPayment} 
              paymentsList={payments} 
              onUpdatePayments={setPayments}
              currentUser={currentUser}
              registrations={registrations}
              onAddAuditLog={handleAddAuditLog}
              customLogoUrl={customLogoUrl}
              customFlagUrl={customFlagUrl}
            />
          </div>
        )}

        {/* TAB 5: DISTRICT DIRECTORY CONTACTS & OFFLINE MEMBER DATABASE */}
        {activeTab === "directory" && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            {/* Top Sub-Tab Navigation Bar */}
            <div className="flex items-center justify-center p-1.5 bg-stone-200/80 rounded-2xl max-w-xl mx-auto border border-stone-300 shadow-inner">
              <button
                onClick={() => setDirectorySubTab("members")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  directorySubTab === "members"
                    ? "bg-[#b91c1c] text-white shadow-md"
                    : "text-stone-700 hover:text-stone-950 hover:bg-white/50"
                }`}
              >
                <Users className="w-4 h-4" />
                {lang === "ta" ? "உறுப்பினர் டைரக்டரி (PWA ஆஃப்லைன்)" : "Member Directory (PWA Offline)"}
              </button>
              <button
                onClick={() => setDirectorySubTab("districts")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  directorySubTab === "districts"
                    ? "bg-[#b91c1c] text-white shadow-md"
                    : "text-stone-700 hover:text-stone-950 hover:bg-white/50"
                }`}
              >
                <MapPin className="w-4 h-4" />
                {lang === "ta" ? "மாவட்டப் பொறுப்பாளர்கள் (38)" : "District Leadership (38)"}
              </button>
            </div>

            {directorySubTab === "members" ? (
              <MemberDirectoryOfflinePortal
                lang={lang}
                currentUser={currentUser}
                onOpenIdCard={(m) => {
                  setActiveTab("id_card_portal");
                }}
              />
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                <div className="text-center max-w-lg mx-auto mb-6">
                  <span className="text-[#b91c1c] font-black text-xs uppercase block">
                    {lang === "ta" ? "மாவட்டக் கிளைகள் & பொறுப்பாளர்கள்" : "DISTRICT LEVEL CONTACT CENTER"}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 mt-1">
                    {lang === "ta" ? "உங்கள் பகுதி சங்க செயலாளர்களை உடனடியாக தொடர்பு கொள்ளுங்கள்" : "Reach out to your local coordinators for immediate assistance"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {initialDistricts.map((dist, idx) => (
                    <div key={`app_dist_${dist.id}_${idx}`} className="p-4 border border-stone-200 bg-stone-50 rounded-2xl text-left space-y-3">
                      <div className="border-b border-stone-200 pb-2 flex justify-between items-center">
                        <span className="font-extrabold text-stone-950 text-sm">
                          📍 {lang === "ta" ? dist.district : dist.districtEn}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          {lang === "ta" ? "செயலில் உள்ளது" : "Active"}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-700">
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase font-bold">President / தலைவர்:</span>
                          <span className="font-bold text-stone-900">{dist.president}</span>
                          <a href={`tel:${dist.presidentPhone}`} className="text-[#b91c1c] font-bold block hover:underline mt-0.5">{dist.presidentPhone}</a>
                        </div>

                        <div className="border-t border-stone-200/50 pt-1.5">
                          <span className="text-[10px] text-stone-400 block uppercase font-bold">Secretary / செயலாளர்:</span>
                          <span className="font-bold text-stone-900">{dist.secretary}</span>
                          <a href={`tel:${dist.secretaryPhone}`} className="text-[#b91c1c] font-bold block hover:underline mt-0.5">{dist.secretaryPhone}</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PHOTO & VIDEO GALLERY */}
        {activeTab === "gallery" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <GallerySlider 
              lang={lang} 
              currentUser={currentUser} 
              isSuperAdmin={isSuperAdmin}
              onAddAuditLog={handleAddAuditLog} 
            />
          </div>
        )}

        {/* TAB 8: WELFARE BOARD MODULE */}
        {activeTab === "welfare_board" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <WelfareBoard
              lang={lang}
              currentUser={currentUser}
              registrations={registrations}
              welfareApps={welfareApplications}
              onAddWelfareApp={(newApp) => {
                setWelfareApplications((prev) => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
                saveWelfareApplicationToFirestore(newApp).catch(() => {});
              }}
              onUpdateWelfareApp={(updatedApp) => {
                setWelfareApplications((prev) => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
                saveWelfareApplicationToFirestore(updatedApp).catch(() => {});
              }}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* TAB 10: DIGITAL SERVICES WORKSPACE */}
        {activeTab === "digital_services" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <DigitalServices
              lang={lang}
              currentUser={currentUser}
              onAddAuditLog={handleAddAuditLog}
              langToggle={() => setLang(prev => prev === "ta" ? "en" : "ta")}
            />
          </div>
        )}

        {/* TAB 14: PAINTER & ARTIST JOBS EMPLOYMENT PORTAL */}
        {activeTab === "jobs" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <PainterJobsPortal
              lang={lang}
              currentUser={currentUser}
              registrations={registrations}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* TAB 7: SECURE ADMINISTRATIVE AND MEMBER WORKSPACE */}
        {activeTab === "admin" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {!currentUser ? (
              /* If visitor is not logged in, request authentication */
              <div className="space-y-4">
                <div className="max-w-md mx-auto text-center space-y-2 mb-2 text-stone-600">
                  <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-900 font-black text-[10px] uppercase inline-block">
                    {lang === "ta" ? "பாதுகாப்பான உள்கட்டமைப்பு" : "CRYPTOGRAPHIC SECURE CHANNEL"}
                  </span>
                  <p className="text-xs leading-relaxed max-w-sm mx-auto">
                    {lang === "ta" 
                      ? "அடையாள அட்டை பெற, நிலுவை செலுத்த, மற்றும் மாவட்ட வாரி நிர்வாகப் பணிகளைச் செய்ய உள்நுழையவும்." 
                      : "Access membership card downloaders, administrative reviews, or financial treasury ledger audits."}
                  </p>
                </div>
                
                <AuthSystem 
                  lang={lang}
                  currentUser={currentUser}
                  onLogin={(user) => {
                    setCurrentUser(user);
                    handleAddAuditLog("User Authenticated", `Session started for role scope: ${user.role}`);
                  }}
                  onLogout={handleLogout}
                  onAddAuditLog={handleAddAuditLog}
                />
              </div>
            ) : currentUser.role === "member" ? (
              /* If logged user is a standard member, redirect them to the Member Dashboard */
              <MemberDashboard
                lang={lang}
                member={currentUser}
                welfareApps={welfareApplications}
                onAddWelfareApp={(newApp) => setWelfareApplications((prev) => [newApp, ...prev])}
                payments={payments}
                onAddPayment={handleNewPayment}
                onNavigateToMemberCard={() => setActiveTab("member_card")}
                onUpdateProfile={(updated) => {
                  setCurrentUser(updated);
                  alert(lang === "ta" ? "சுயவிவரம் சேமிக்கப்பட்டது!" : "Biography saved successfully!");
                }}
                onAddAuditLog={handleAddAuditLog}
              />
            ) : (
              /* Otherwise, logged user is an Executive (Super Admin, Treasurer, President, Dist Admin) */
              <AdminPanel 
                lang={lang} 
                currentUser={currentUser}
                leaders={leaders}
                news={news}
                registrations={registrations}
                payments={payments}
                stats={stats}
                welfareApplications={welfareApplications}
                auditLogs={auditLogs}
                systemSettings={systemSettings}
                onUpdateLeaders={handleUpdateLeaders}
                onUpdateNews={handleUpdateNews}
                onUpdateRegistrations={handleUpdateRegistrations}
                onUpdatePayments={setPayments}
                onUpdateStats={setStats}
                onUpdateWelfareApplications={setWelfareApplications}
                onUpdateSystemSettings={setSystemSettings}
                onAddAuditLog={handleAddAuditLog}
                onSendEmergency={handleBroadcastEmergency}
                onRestoreBackup={handleRestoreBackup}
              />
            )}
          </div>
        )}

        {/* TAB 9: LIVE DIGITAL UNION COMMUNICATION SYSTEM */}
        {activeTab === "live_comm" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <LiveCommunication 
              lang={lang} 
              currentUser={currentUser} 
              onAddAuditLog={handleAddAuditLog} 
            />
          </div>
        )}

        {/* TAB 11: TNPA ENTERPRISE COMMAND CENTER - VERSION 12.0 */}
        {activeTab === "command_center" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <EnterpriseCommandCenter
              lang={lang}
              currentUser={currentUser}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* TAB 12: SUPER ADMIN EXCLUSIVE BUSINESS COMMAND CENTER - VERSION 13.0 */}
        {activeTab === "business_console" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {!isSuperAdminOtpVerified ? (
              <div className="py-8">
                <SuperAdminOtpAuth
                  lang={lang}
                  onSuccess={(verifiedUser, token) => {
                    setIsSuperAdminOtpVerified(true);
                    setCurrentUser(verifiedUser);
                    handleAddAuditLog(
                      "Super Admin Gateway Unlocked",
                      `Business Console access granted via official Super Key for ${verifiedUser.nameEn || verifiedUser.name}`
                    );
                  }}
                  onCancel={() => setActiveTab("home")}
                  onAddAuditLog={handleAddAuditLog}
                  requiredForTitle="Super Admin Business Console"
                  requiredForTitleTa="சூப்பர் அட்மின் வணிக மேலாண்மை மையம்"
                />
              </div>
            ) : (
              <SuperAdminBusinessConsole
                lang={lang}
                currentUser={currentUser}
                onAddAuditLog={handleAddAuditLog}
              />
            )}
          </div>
        )}

        {/* ROLE TIERS & SUPER KEY PORTAL */}
        {activeTab === "role_control" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <RoleBasedControlPortal
              lang={lang}
              currentUser={currentUser}
              onUpdateUserRole={(newRole) => {
                if (currentUser) {
                  setCurrentUser({ ...currentUser, role: newRole });
                }
              }}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* STATE LEGAL ADVISORY BOARD (மாநில சட்ட ஆலோசனைக் குழு) */}
        {activeTab === "legal_advisory" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <StateLegalAdvisoryBoard
              lang={lang}
              currentUser={currentUser}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* EXECUTIVES DIRECTORY PORTAL (4 SEPARATE TIERS: STATE, DISTRICT, ZONE, AREA/UNION) */}
        {activeTab === "executives" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <ExecutiveDirectoryPortal
              lang={lang}
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              executives={executives}
              onSaveExecutive={handleSaveExecutive}
              onDeleteExecutive={handleDeleteExecutive}
              onAddAuditLog={handleAddAuditLog}
              initialActiveLevel={selectedExecutiveLevel}
            />
          </div>
        )}

        {/* OFFICE BEARER ANNOUNCEMENTS & APPLICATIONS PORTAL */}
        {activeTab === "office_bearers" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <OfficeBearerPortal
              lang={lang}
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* PAINTER INSURANCE & ACCIDENT RELIEF PORTAL */}
        {activeTab === "insurance" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <PainterInsurancePortal
              lang={lang}
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* PAINTER SKILL & SAFETY ACADEMY PORTAL */}
        {activeTab === "academy" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <PainterSkillAcademy
              lang={lang}
              currentUser={currentUser}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* DISTRICT BROADCAST & WHATSAPP CIRCULAR PORTAL */}
        {activeTab === "broadcast" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <DistrictBroadcastPortal
              lang={lang}
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* GRIEVANCE & SUPPORT DESK */}
        {activeTab === "grievance" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <GrievanceSupportDesk
              lang={lang}
              currentUser={currentUser}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* TAB 13: TNPA2 OFFICIAL TV CHANNEL */}
        {activeTab === "tv_channel" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <TnpaTvChannel
              lang={lang}
              currentUser={currentUser}
              registrations={registrations}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* TAB 14: MEMBER ID CARD & APPLICATION PORTAL */}
        {activeTab === "id_card_portal" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <MemberIdCardPortal
              lang={lang}
              currentUser={currentUser}
              registrations={registrations}
              onUpdateRegistration={async (updated) => {
                setRegistrations((prev) => prev.map(r => r.id === updated.id ? updated : r));
                await saveRegistrationToFirestore(updated);
              }}
              onAddAuditLog={handleAddAuditLog}
            />
          </div>
        )}

        {/* TAB: MEMBER CARD (உறுப்பினர் அட்டை ₹100 PORTAL) */}
        {activeTab === "member_card" && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <MemberCardPortal
              currentUser={currentUser}
              onNavigateToAuth={() => setActiveTab("admin")}
              onNavigateToRegister={() => setActiveTab("register")}
            />
          </div>
        )}

      </main>

      {/* PUBLIC QR CODE VERIFICATION MODAL */}
      {verifyCardToken && (
        <MemberCardVerificationModal
          token={verifyCardToken}
          cardRequest={verifiedCardRequest}
          onClose={() => {
            setVerifyCardToken(null);
            setVerifiedCardRequest(null);
            // Clean URL query param without full reload
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete("verify_card");
              url.searchParams.delete("verify_member_card");
              window.history.replaceState({}, document.title, url.pathname);
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}

      {/* 5. SIDE EMERGENCY & FLOATING DIALERS */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        
        <button
          onClick={() => {
            alert(
              lang === "ta"
                ? "விபத்து உதவிக்குழுவிற்கு அவசர அழைப்பு செல்கிறது! நீங்கள் +917010131915 என்ற எண்ணை அழைக்கிறீர்கள்."
                : "Initiating emergency dispatch coordinator dial! Dialing +917010131915 directly."
            );
            window.open("tel:+917010131915");
          }}
          className="bg-rose-600 hover:bg-rose-700 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-bold border-2 border-white"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span className="text-xs tracking-wider font-extrabold uppercase hidden md:inline">
            {lang === "ta" ? "விபத்து அவசர உதவி" : "Accident Rescue Aid"}
          </span>
        </button>

        <a
          href="https://wa.me/917010131915"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white self-end"
        >
          <span className="text-xs font-bold mr-1.5 hidden md:inline">WhatsApp</span>
          <MessageSquare className="w-5 h-5" />
        </a>
      </div>

      {/* Floating Smart AI Virtual Assistant (TNPA AI) */}
      <FloatingAIAssistant 
        lang={lang}
        currentUser={currentUser}
        systemSettings={systemSettings}
        systemData={{
          totalRegisteredMembers: registrations.length + 12480,
          pendingClaimsCount: welfareApplications.filter(a => a.status === "pending").length,
          approvedClaimsCount: welfareApplications.filter(a => a.status === "approved").length,
          totalSubscriptionCollections: payments.reduce((acc, p) => acc + p.amount, 0) + 4829000,
          activeDistrictsCount: 38
        }}
      />

      {showDistrictDirectoryModal && (
        <DistrictHierarchyDirectory 
          lang={lang} 
          onClose={() => setShowDistrictDirectoryModal(false)} 
        />
      )}

      {/* Role-Based Mobile Authentication & Verification Modal */}
      {selectedRoleAuth && (
        <RoleMobileAuthModal
          lang={lang}
          roleConfig={selectedRoleAuth}
          onClose={() => setSelectedRoleAuth(null)}
          onSuccess={(user, isSuperAdminVerified) => {
            setCurrentUser(user);
            if (isSuperAdminVerified) {
              setIsSuperAdminOtpVerified(true);
            }
            setSelectedRoleAuth(null);
            handleAddAuditLog(
              "Role Authenticated",
              `User authenticated and switched to ${user.nameEn || user.name} (${user.role}) via registered mobile + OTP.`
            );
            setNotifications(prev => [
              {
                id: Date.now(),
                text: `அதிகாரப்பூர்வமாக உள்நுழைந்துள்ளீர்கள்: ${lang === "ta" ? selectedRoleAuth.titleTa : selectedRoleAuth.titleEn}`,
                textEn: `Successfully authenticated as: ${selectedRoleAuth.titleEn}`,
                time: "Just now"
              },
              ...prev
            ]);
          }}
          onAddAuditLog={handleAddAuditLog}
        />
      )}

      {/* Progressive Web App & APK Dynamic Auto-Update Prompt */}
      <AutoUpdatePrompt lang={lang} />

      {/* 6. ENTERPRISE FOOTER */}
      <footer className="bg-stone-900 text-stone-100 py-10 px-6 border-t-4 border-amber-500 shrink-0 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-amber-400 shrink-0 overflow-hidden">
                <img 
                  src={customLogoUrl || logoSvg} 
                  alt="TNPA² Logo" 
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = logoSvg;
                  }}
                />
              </div>
              <div>
                <span className="text-amber-400 font-extrabold text-xs block uppercase">
                  தமிழ்நாடு பெயிண்டர்கள் சங்கம்
                </span>
                <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-1.5 py-0.2 rounded font-mono">
                  TNPA²
                </span>
              </div>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              {lang === "ta"
                ? "எங்கள் சங்கம் (TNPA²) தமிழகத்தில் உள்ள பல்லாயிரக்கணக்கான வீடு மற்றும் கட்டிட வர்ணம் பூசும் தொழிலாளர்களின் வாழ்வாதாரத்தை மேம்படுத்தவும், அவர்களுக்கு விபத்துக் காப்பீடு மற்றும் ஓய்வூதியங்கள் கிடைக்கச் செய்யவும் அர்ப்பணிப்புடன் செயல்படுகிறது."
                : "TNPA² strives to improve the livelihood of thousands of painting contractors, house painters, and artists across Tamil Nadu by delivering educational, pension, and insurance rights."}
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-extrabold text-amber-500 text-xs block uppercase">{lang === "ta" ? "சங்கத் தலைமை அலுவலகம்" : "UNION HEADQUARTERS"}</span>
            <p className="text-stone-300 text-xs leading-relaxed">
              📍 {lang === "ta" ? "அம்பலக்காரன்பட்டி, உத்தங்குடி போஸ்டல், மேலூர் மெயின் ரோடு, மதுரை - 625107" : "Ambalakkaranpatti, Uthangudi Post, Melur Main Road, Madurai - 625107"}<br />
              📞 {lang === "ta" ? "கைபேசி: +91 70101 31915" : "Mobile: +91 70101 31915"}<br />
              ✉️ Email: <a href="mailto:paintargaloviyargalmunnetrasan@gmail.com" className="hover:underline text-amber-400 break-all">paintargaloviyargalmunnetrasan@gmail.com</a>
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-extrabold text-amber-500 text-xs block uppercase">{lang === "ta" ? "வலைத்தள வருகையாளர்கள்" : "PORTAL TRAFFIC"}</span>
            <div className="bg-black/40 p-3 rounded-xl border border-stone-800 text-xs">
              <span className="text-stone-400 block">{lang === "ta" ? "இன்று வரை மொத்த பார்வைகள்:" : "Total visitors counts:"}</span>
              <span className="text-lg font-mono font-bold text-emerald-400 mt-1 block">
                {visitorCount.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight">
              &copy; 2026 தமிழ்நாடு பெயிண்டர்கள் சங்கம். All Rights Reserved. Designed for PWA and Android-ready viewport standards.
            </p>
          </div>

        </div>
      </footer>

      {/* LIVE CLOUD SYNC INFORMATION MODAL */}
      <AnimatePresence>
        {showSyncInfoModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-900 border-2 border-emerald-500 text-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                  <h3 className="text-base font-black">
                    {lang === "ta" ? "நேரலை கிளவுட் ஒத்திசைவு நிலை" : "Real-Time Cloud Synchronization"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSyncInfoModal(false)}
                  className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-stone-300 leading-relaxed">
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl">
                  <span className="text-emerald-300 font-extrabold text-sm block mb-1">
                    {lang === "ta" 
                      ? "✅ நேரலை சர்வர் இணைப்பு முழுமையாகச் செயல்படுகிறது" 
                      : "✅ Multi-Device Live Sync is Active"}
                  </span>
                  <p className="text-emerald-200/90 text-xs">
                    {lang === "ta"
                      ? "சூப்பர் அட்மினால் அல்லது மாவட்டப் பொறுப்பாளர்களால் செய்யப்படும் உறுப்பினர் சேர்க்கை, அடையாள அட்டை (ID Card) வடிவமைப்பு, லோகோ, சங்க அறிவிப்புகள் அனைத்தும் இந்த செயலியைப் பயன்படுத்தும் அனைவருக்கும் நொடிப்பொழுதில் ஒத்திசைக்கப்படும்."
                      : "Any modification made to Member ID Cards, official logos, registration approvals, and emergency alerts propagates instantaneously in real-time to every user using this app on mobile or desktop."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700">
                    <span className="text-amber-400 font-black block mb-0.5">
                      {lang === "ta" ? "உறுப்பினர் தரவுத்தளம்" : "Members Database"}
                    </span>
                    <span className="text-emerald-400 font-bold">{registrations.length} {lang === "ta" ? "பதிவுகள் ஒத்திசைவு" : "records in sync"}</span>
                  </div>
                  <div className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700">
                    <span className="text-amber-400 font-black block mb-0.5">
                      {lang === "ta" ? "அடையாள அட்டை நிலை" : "ID Card Templates"}
                    </span>
                    <span className="text-emerald-400 font-bold">{lang === "ta" ? "நேரலையில் இணைக்கப்பட்டுள்ளது" : "Live Real-Time Synced"}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-800/90 rounded-2xl border border-amber-500/30 space-y-3 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span className="text-xs">{lang === "ta" ? "ஏபிகே (APK) நேரலை கிளவுட் ஒத்திசைவு:" : "APK Live Cloud Synchronization:"}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                      LIVE CONNECTED
                    </span>
                  </div>

                  <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-700/80 space-y-1.5 text-stone-300">
                    <p className="font-bold text-amber-300 text-xs">
                      {lang === "ta" 
                        ? "📌 ஏபிகே (APK) மற்றும் ஸ்டுடியோ நேரலை விளக்கம்:" 
                        : "📌 APK & Studio Real-time Sync Details:"}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {lang === "ta"
                        ? "1. தரவுத்தளம் (Firestore Data): உறுப்பினர்கள், நிர்வாகிகள், அடையாள அட்டை விவரங்கள், விண்ணப்பங்கள் ஆகியவை உங்கள் கைபேசியில் உள்ள ஏபிகே-வில் நொடிக்குள் 100% தானாகவே ஒத்திசைக்கிறது."
                        : "1. Database (Firestore Data): Members, executives, ID card data, and announcements sync 100% instantly to your installed APK."}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {lang === "ta"
                        ? "2. புதிய பட்டன்கள் & இடைமுக மாற்றங்கள் (UI Design Updates): ஸ்டுடியோவில் சேர்க்கப்படும் புதிய பொத்தான்கள் உடனடியாக கைபேசியில் தெரிய கீழே உள்ள 'நேரலை கிளவுட் செயலியைத் திற' பொத்தானைப் பயன்படுத்தலாம் அல்லது நேரடி சர்வர் இணைக்கப்பட்ட புதிய ஏபிகே-வை நிறுவலாம்."
                        : "2. New UI Buttons & Templates: To see newly added UI features instantly on your phone, tap 'Open Live Cloud App' below or install the live-server connected APK."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href="https://ais-pre-6c2bmpmluha3hg6bmnyjtk-317246514518.asia-southeast1.run.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all text-center no-underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{lang === "ta" ? "🌐 நேரலை கிளவுட் செயலியைத் திற (100% Live)" : "🌐 Open Live Cloud App"}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        forcePurgeCacheAndReload();
                      }}
                      className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{lang === "ta" ? "🔄 கேச் அழித்து புதுப்பி (Sync APK)" : "🔄 Clear Cache & Reload"}</span>
                    </button>
                  </div>
                </div>

                <p className="text-stone-400 text-[11px]">
                  {lang === "ta"
                    ? "குறிப்பு: சூப்பர் அட்மின் அல்லது மாநில தலைவர் செய்யும் அனைத்து மாற்றங்களும் கிளவுட் டேட்டாபேஸ் மூலமாக நொடிக்குள் உலகளவில் அனைத்து கைபேசிகளுக்கும் ஒத்திசைக்கப்படும்."
                    : "Note: All administrative updates propagate globally in real time via Cloud Firestore."}
                </p>
              </div>

              <button
                onClick={() => setShowSyncInfoModal(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all shadow cursor-pointer"
              >
                {lang === "ta" ? "புரிந்தது / தொடரவும்" : "Got it / Continue"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTOMATIC UPDATE NOTIFICATION & SILENT OTA RELOADER */}
      <AutoUpdatePrompt lang={lang} />

    </div>
  );
}
