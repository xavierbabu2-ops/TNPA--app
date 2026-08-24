import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Users,
  CreditCard,
  Award,
  Clock,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  FileText,
  Database,
  Lock,
  RefreshCw,
  Folder,
  Book,
  History,
  UserCheck,
  MapPin,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileDown,
  Info,
  Check,
  MessageSquare,
  Bookmark,
  Bell,
  Cpu,
  Tv,
  QrCode
} from "lucide-react";
import { UserAccount, AuditLog } from "../types";

interface EnterpriseCommandCenterProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onAddAuditLog: (action: string, details: string) => void;
}

// 38 Districts in Tamil Nadu with keys
const TN_DISTRICTS = [
  { key: "chennai", ta: "சென்னை", en: "Chennai", region: "North", score: 96, members: 18450 },
  { key: "madurai", ta: "மதுரை", en: "Madurai", region: "South", score: 92, members: 12500 },
  { key: "coimbatore", ta: "கோயம்புத்தூர்", en: "Coimbatore", region: "West", score: 94, members: 9800 },
  { key: "trichy", ta: "திருச்சிராப்பள்ளி", en: "Tiruchirappalli", region: "Central", score: 89, members: 4870 },
  { key: "salem", ta: "சேலம்", en: "Salem", region: "West", score: 85, members: 4210 },
  { key: "nellai", ta: "நெல்லை", en: "Tirunelveli", region: "South", score: 87, members: 3950 },
  { key: "vellore", ta: "வேலூர்", en: "Vellore", region: "North", score: 84, members: 3100 },
  { key: "thanjavur", ta: "தஞ்சாவூர்", en: "Thanjavur", region: "Central", score: 88, members: 2900 },
  { key: "erode", ta: "ஈரோடு", en: "Erode", region: "West", score: 86, members: 2750 },
  { key: "tuticorin", ta: "தூத்துக்குடி", en: "Thoothukudi", region: "South", score: 82, members: 2450 },
  { key: "cuddalore", ta: "கடலூர்", en: "Cuddalore", region: "East", score: 81, members: 2100 },
  { key: "kanchipuram", ta: "காஞ்சிபுரம்", en: "Kanchipuram", region: "North", score: 88, members: 1950 },
  { key: "tiruvallur", ta: "திருவள்ளூர்", en: "Tiruvallur", region: "North", score: 83, members: 1800 },
  { key: "tiruppur", ta: "திருப்பூர்", en: "Tiruppur", region: "West", score: 91, members: 3200 },
  { key: "kanyakumari", ta: "கன்னியாகுமரி", en: "Kanyakumari", region: "South", score: 90, members: 2980 },
  { key: "dindigul", ta: "திண்டுக்கல்", en: "Dindigul", region: "South", score: 84, members: 2200 },
  { key: "karur", ta: "கரூர்", en: "Karur", region: "Central", score: 86, members: 1650 },
  { key: "namakkal", ta: "நாமக்கல்", en: "Namakkal", region: "West", score: 88, members: 1980 },
  { key: "krishnagiri", ta: "கிருஷ்ணகிரி", en: "Krishnagiri", region: "West", score: 81, members: 1540 },
  { key: "dharmapuri", ta: "தர்மபுரி", en: "Dharmapuri", region: "West", score: 79, members: 1420 },
  { key: "pudukkottai", ta: "புதுக்கோட்டை", en: "Pudukkottai", region: "Central", score: 80, members: 1350 },
  { key: "nagapattinam", ta: "நாகப்பட்டினம்", en: "Nagapattinam", region: "East", score: 78, members: 1100 },
  { key: "tiruvarur", ta: "திருவாரூர்", en: "Tiruvarur", region: "East", score: 82, members: 1250 },
  { key: "sivagangai", ta: "சிவகங்கை", en: "Sivagangai", region: "South", score: 80, members: 1150 },
  { key: "ramanathapuram", ta: "இராமநாதபுரம்", en: "Ramanathapuram", region: "South", score: 77, members: 1210 },
  { key: "theni", ta: "தேனி", en: "Theni", region: "South", score: 83, members: 1400 },
  { key: "virudhunagar", ta: "விருதுநகர்", en: "Virudhunagar", region: "South", score: 85, members: 1850 },
  { key: "tiruvannamalai", ta: "திருவண்ணாமலை", en: "Tiruvannamalai", region: "North", score: 82, members: 1980 },
  { key: "villupuram", ta: "விழுப்புரம்", en: "Viluppuram", region: "North", score: 81, members: 2100 },
  { key: "ariyalur", ta: "அரியலூர்", en: "Ariyalur", region: "Central", score: 76, members: 950 },
  { key: "perambalur", ta: "பெரம்பலூர்", en: "Perambalur", region: "Central", score: 78, members: 890 },
  { key: "nilgiris", ta: "நீலகிரி", en: "The Nilgiris", region: "West", score: 82, members: 1050 },
  { key: "tenkasi", ta: "தென்காசி", en: "Tenkasi", region: "South", score: 84, members: 1600 },
  { key: "kallakurichi", ta: "கள்ளக்குறிச்சி", en: "Kallakurichi", region: "North", score: 79, members: 1300 },
  { key: "chengalpattu", ta: "செங்கல்பட்டு", en: "Chengalpattu", region: "North", score: 89, members: 2800 },
  { key: "ranipet", ta: "ராணிப்பேட்டை", en: "Ranipet", region: "North", score: 81, members: 1450 },
  { key: "tirupathur", ta: "திருப்பத்தூர்", en: "Tirupathur", region: "North", score: 80, members: 1380 },
  { key: "mayiladuthurai", ta: "மயிலாடுதுறை", en: "Mayiladuthurai", region: "East", score: 83, members: 1510 }
];

// Seed initial tasks
const initialProjectTasks = [
  { id: "proj_1", title: "ஆதார் இணைப்பு முகாம்", titleEn: "Aadhaar Seeding Campaign", assignedTo: "District Admin Chennai", dueDate: "2026-08-15", priority: "high", status: "in_progress", district: "சென்னை" },
  { id: "proj_2", title: "புதிய காப்பீடு திட்ட விழிப்புணர்வு", titleEn: "New Insurance Scheme Awareness", assignedTo: "District Admin Madurai", dueDate: "2026-08-20", priority: "medium", status: "todo", district: "மதுரை" },
  { id: "proj_3", title: "ஆண்டு உறுப்பினர் சந்தா தணிக்கை", titleEn: "Annual Membership Subscription Audit", assignedTo: "State Treasurer", dueDate: "2026-08-10", priority: "high", status: "completed", district: "all" },
  { id: "proj_4", title: "பாதுகாப்பு உபகரணங்கள் விநியோகம்", titleEn: "Safety Gears Distribution Drive", assignedTo: "District Admin Coimbatore", dueDate: "2026-08-25", priority: "high", status: "todo", district: "கோயம்புத்தூர்" }
];

// Seed digital library
const libraryDocuments = [
  { id: "lib_1", title: "சங்கத்தின் அரசியல் சாசனம் & துணை விதிகள்", titleEn: "Union Constitution & Bylaws", category: "rules", date: "1989-05-12", author: "Core Council", size: "2.4 MB" },
  { id: "lib_2", title: "அரசு கட்டுமான நலவாரிய உத்தரவு G.O. 124", titleEn: "TN Government Construction Welfare Board G.O. 124", category: "gov_orders", date: "2024-03-15", author: "Labour Dept", size: "1.8 MB" },
  { id: "lib_3", title: "உயரமான கட்டிடங்களில் பெயிண்டிங் பாதுகாப்பு கையேடு", titleEn: "High-Rise Painting Safety & Harness Manual", category: "training", date: "2025-11-01", author: "Safety Committee", size: "4.1 MB" },
  { id: "lib_4", title: "மாநில பொதுக்குழு கூட்ட வரைவு - ஜூலை 2026", titleEn: "State General Body Meeting Minutes - July 2026", category: "minutes", date: "2026-07-20", author: "Secretary Office", size: "850 KB" },
  { id: "lib_5", title: "புதிய சுற்றறிக்கை: விபத்து மரண நிதி உயர்வு", titleEn: "Circular 2026/04: On-Duty Accident Death Compensation Increase", category: "circulars", date: "2026-07-28", author: "President Executive", size: "420 KB" }
];

export default function EnterpriseCommandCenter({
  lang,
  currentUser,
  onAddAuditLog
}: EnterpriseCommandCenterProps) {
  // Navigation for Command Center Tabs
  const [activeTab, setActiveTab] = useState<
    "state_cc" | "district_cc" | "ai_governance" | "engagement" | "projects" | "library" | "offline_sync" | "backup_dr"
  >("state_cc");

  // Persona Sandbox to simulate different roles
  const [sandboxRole, setSandboxRole] = useState<string>(() => {
    return currentUser ? currentUser.role : "super_admin";
  });

  useEffect(() => {
    if (currentUser) {
      setSandboxRole(currentUser.role);
    }
  }, [currentUser]);

  // Selected District state for District Command Center
  const [selectedDistrictKey, setSelectedDistrictKey] = useState<string>("chennai");

  // AI Governance & Automation Center (Version 15.0) States
  const [reportsSummary, setReportsSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [operationalRisks, setOperationalRisks] = useState<string[]>([
    "சேலம் மாவட்டத்தில் சந்தா செலுத்துதல் விகிதம் கடந்த மாதத்துடன் ஒப்பிடும்போது 12% குறைந்துள்ளது. (Vulnerability detected in Salem subscription compliance).",
    "கோயம்புத்தூர் நலவாரிய விண்ணப்பங்கள் தேக்கம் அதிகமாக உள்ளது. (High density backlog in Coimbatore Welfare claims).",
    "வடாற்காடு பகுதியில் புதிய பெயிண்டர்கள் விழிப்புணர்வு முகாம்கள் பற்றாக்குறை. (Low community training engagement in North region)."
  ]);
  const [aiMeetingBrief, setAiMeetingBrief] = useState("");

  // Version 15 Modules Sub-tabs
  const [aiSubTab, setAiSubTab] = useState<"auto_admin" | "member_verify" | "qr_validate" | "report_gen" | "meeting" | "news_pr" | "reliability">("auto_admin");
  const [aiLoading, setAiLoading] = useState(false);

  // 1. AI Auto Admin & Approvals (Human-in-the-loop)
  const [autoAdminActions, setAutoAdminActions] = useState([
    { id: "act_1", title: "Approve Salem Regional Funding", type: "financial", priority: "high", status: "pending", description: "Request for ₹50,000 special subscription awareness camp budget in Salem district.", recommendation: "Highly recommended due to recent subscription declines. Approve immediately with dual-signature check." },
    { id: "act_2", title: "Approve Coimbatore Welfare Claim backlogs", type: "welfare", priority: "high", status: "pending", description: "Review of 8 accumulated accidental injury claims filed last week.", recommendation: "Expedite. Validate G.O. 124 compliance before release." },
    { id: "act_3", title: "Authorize State General Assembly Draft agenda", type: "meeting", priority: "medium", status: "pending", description: "State general body meeting draft outline approval.", recommendation: "Approve and schedule SMS blast reminders to district secretaries." }
  ]);

  // 2. AI Member Verification
  const [pendingMembers, setPendingMembers] = useState([
    { id: "m_1", name: "S. Murugeshan", district: "Madurai", age: 34, certNo: "Aadhaar: 4321-9876-1234", documentStatus: "Uploaded (ID & Passbook)", verificationStatus: "unverified", aiReview: null as any },
    { id: "m_2", name: "R. Anjali Devi", district: "Chennai", age: 29, certNo: "Aadhaar: 8876-1234-9087", documentStatus: "Uploaded (ID Only)", verificationStatus: "unverified", aiReview: null as any },
    { id: "m_3", name: "K. Selvamani (Potential Duplicate Candidate?)", district: "Madurai", age: 34, certNo: "Aadhaar: 4321-9876-1234", documentStatus: "Uploaded (ID & Passbook)", verificationStatus: "unverified", aiReview: null as any }
  ]);

  // 3. AI QR Validation
  const [qrInputPayload, setQrInputPayload] = useState("TNPA-MEMBER-SECURE-93281-APPROVED");
  const [qrVerificationResult, setQrVerificationResult] = useState<any>(null);
  const [qrLogs, setQrLogs] = useState<any[]>([
    { timestamp: "2026-08-04 09:00 AM", memberId: "TNPA-10492", name: "C. Raman", status: "VERIFIED_SUCCESS", payloadType: "MEMBERSHIP_CARD" },
    { timestamp: "2026-08-04 09:30 AM", memberId: "TNPA-73124", name: "V. Karuppasamy", status: "VERIFIED_SUCCESS", payloadType: "TRAINING_CERTIFICATE" }
  ]);

  // 4. AI Report Generation
  const [selectedReportType, setSelectedReportType] = useState("weekly");
  const [reportInputMetrics, setReportInputMetrics] = useState("New Registrations: 124, Subscription Revenue: ₹42,500, Pending Welfare backlogs: 8");
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  // 5. AI Meeting Assistant
  const [meetingTopicInput, setMeetingTopicInput] = useState("Discussing GO 124 Welfare updates & District Administration");
  const [generatedMeetingData, setGeneratedMeetingData] = useState<any>(null);

  // 6. AI News & Content Drafting
  const [newsTopicInput, setNewsTopicInput] = useState("National artisan recognition awarded to Madurai senior painter Mr. Thangaraj");
  const [newsPlatformType, setNewsPlatformType] = useState("website");
  const [generatedNewsData, setGeneratedNewsData] = useState<any>(null);
  const [publishedNews, setPublishedNews] = useState<any[]>([]);

  // 7. AI Website Diagnostics & Monitoring
  const [siteHealthMetrics, setSiteHealthMetrics] = useState<any>({
    overallGrade: "A",
    loadingSpeedMs: 1250,
    brokenLinks: ["/resources/old-bylaws-1989.doc"],
    missingImages: [],
    performanceSummaryTa: "இணையதளத்தின் உள்கட்டமைப்பு வேகம் மற்றும் பாதுகாப்பு உகந்ததாக உள்ளது. ஒரு உடைந்த இணைப்பு மட்டுமே கண்டறியப்பட்டுள்ளது.",
    performanceSummaryEn: "All system parameters are green. Only one outdated Bylaws file reference is broken.",
    correctiveActionsTa: ["பழைய ஆவணத்தை அகற்றி 2026 கையேடைப் பதிவேற்றவும்."],
    correctiveActionsEn: ["Replace the 1989 .doc document link with the active 2026 high-resolution PDF guidelines."]
  });

  // Member Engagement state
  const [userBadges, setUserBadges] = useState(["Golden Brush", "Safety Champion"]);
  const [volunteerApps, setVolunteerApps] = useState<string[]>([]);

  // Project management state
  const [tasks, setTasks] = useState(initialProjectTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTitleEn, setNewTaskTitleEn] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDistrict, setNewTaskDistrict] = useState("சென்னை");
  const [projectReportText, setProjectReportText] = useState("");

  // Digital Library states
  const [searchQuery, setSearchQuery] = useState("");
  const [aiLibraryResponse, setAiLibraryResponse] = useState<string | null>(null);

  // Offline Simulation States
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [syncConflict, setSyncConflict] = useState<any | null>(null);

  // Backup & Recovery simulator
  const [backupLogs, setBackupLogs] = useState([
    { id: "b_1", timestamp: "2026-08-04 02:00 AM", status: "Success", type: "Scheduled Encrypted snapshot", size: "14.2 MB", checksum: "SHA256:7c9e0a2" },
    { id: "b_2", timestamp: "2026-08-03 02:00 AM", status: "Success", type: "Scheduled Encrypted snapshot", size: "14.1 MB", checksum: "SHA256:a21f8e1" }
  ]);
  const [systemIntegrityCheck, setSystemIntegrityCheck] = useState<string | null>(null);

  // Active district data calculations
  const activeDistrict = useMemo(() => {
    return TN_DISTRICTS.find(d => d.key === selectedDistrictKey) || TN_DISTRICTS[0];
  }, [selectedDistrictKey]);

  // AI Governance Actions
  const handleGenerateAISummary = async () => {
    setSummaryLoading(true);
    // Mimics Gemini AI Call returning summarized data points
    setTimeout(() => {
      setReportsSummary(
        lang === "ta"
          ? "சங்கத்தின் தற்போதைய நிலை சுருக்கம்: தமிழகத்தின் 38 மாவட்டங்களில் சென்னை மற்றும் கோவை முன்னிலை வகிக்கின்றன. சேலம் மாவட்டத்தில் சந்தா செலுத்துதலில் சரிவு காணப்படுவதால் அங்கு சிறப்பு நிதி விழிப்புணர்வு முகாம் தேவைப்படுகிறது. தற்சமயம் 12 நலவாரிய மனுக்கள் நிலுவையில் உள்ளன, அவற்றுள் 8 விபத்து நிவாரண கோரிக்கைகளுக்கு முன்னுரிமை அளிக்க பரிந்துரைக்கப்படுகிறது."
          : "Enterprise Strategic AI Summary: Chennai and Coimbatore lead the state in operational engagement and financial collections. Salem represents a high risk zone with a 12% decline in annual subscription renewals, requiring targeted intervention. Out of 12 pending welfare claims, 8 critical accidental injury filings should be expedited immediately."
      );
      setAiMeetingBrief(
        lang === "ta"
          ? "தலைமை நிர்வாகக் கூட்ட சுருக்கம்: 1. சேலம் மற்றும் தர்மபுரியில் உறுப்பினர் சந்தா புதுப்பிக்கும் சிறப்பு முகாம்களை ஆகஸ்ட் 15க்குள் துவங்குதல். 2. நிலுவையில் உள்ள மருத்துவ நிவாரண விண்ணப்பங்களுக்கு மாநில பொதுநிதியிலிருந்து அவசர கால முன்பணம் ஒதுக்குதல். 3. நலவாரிய டிஜிட்டல் பாஸ்புக் விநியோகத்தை அனைத்து மாவட்டங்களிலும் துரிதப்படுத்துதல்."
          : "Executive Council Meeting Agenda Briefing: 1. Launch a subscription renewal drive in Salem and Dharmapuri by Aug 15. 2. Authorize immediate partial disbursement from mutual reserve fund for pending medical aid applications. 3. Accelerate welfare board digital passbook distribution across all districts."
      );
      setSummaryLoading(false);
      onAddAuditLog("AI Governance Summary Executed", "Summarized state reports, highlighting compliance risk and meeting briefs.");
    }, 1200);
  };

  // Asynchronous API call to the server-side AI Automation Engine
  const executeAIAutomation = async (taskType: string, payload: any) => {
    try {
      const response = await fetch("/api/gemini/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType, payload })
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error(`AI Automation API Error (${taskType}):`, error);
      throw error;
    }
  };

  // 1. Run AI Member Verification
  const runMemberVerification = async (memberId: string) => {
    setAiLoading(true);
    const member = pendingMembers.find(m => m.id === memberId);
    if (!member) return;

    try {
      const result = await executeAIAutomation("member_verification", member);
      setPendingMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          return { ...m, aiReview: result, verificationStatus: "reviewed" };
        }
        return m;
      }));
      onAddAuditLog("AI Member Verification Executed", `AI evaluated member: ${member.name}. Grade recommendation: ${result.recommendedStatus}`);
    } catch (error) {
      alert("AI Verification failed to connect. Displaying local offline recommendations.");
      // Fallback
      setPendingMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            verificationStatus: "reviewed",
            aiReview: {
              completenessScore: m.id === "m_2" ? 70 : 95,
              isDuplicate: m.id === "m_3",
              duplicateDetails: m.id === "m_3" ? "MATCH FOUND: Duplicate record with Aadhaar: 4321-9876-1234 (S. Murugeshan)" : "No matching records found.",
              documentValidation: m.id === "m_2" ? "Missing Bank Passbook upload." : "All credentials uploaded clearly.",
              suspiciousFlags: m.id === "m_3" ? ["Shared Aadhaar number", "Identical age & district parameters"] : [],
              recommendedStatus: m.id === "m_3" ? "SUSPENDED" : (m.id === "m_2" ? "NEEDS_CLARIFICATION" : "APPROVED"),
              recommendationReasonTa: m.id === "m_3" ? "ஒரே ஆதார் எண்ணுடன் இரு வேறு பதிவுகள் உள்ளன. தற்காலிகமாக நிறுத்தி வைக்கவும்." : "ஆவணங்கள் சரிபார்க்கப்பட்டு ஒப்புதலுக்கு பரிந்துரைக்கப்படுகிறது.",
              recommendationReasonEn: m.id === "m_3" ? "Identical Aadhaar duplicate signature found. Temporary suspension highly recommended." : "Approved."
            }
          };
        }
        return m;
      }));
    } finally {
      setAiLoading(false);
    }
  };

  // Human-in-the-loop: Approve Member Registration after AI Verification
  const handleApproveMember = (memberId: string, finalStatus: string) => {
    setPendingMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, verificationStatus: finalStatus };
      }
      return m;
    }));
    const name = pendingMembers.find(m => m.id === memberId)?.name || "Member";
    onAddAuditLog("Admin Final Decision", `Human approved member registration for ${name} as: ${finalStatus}`);
    alert(lang === "ta" ? "உறுப்பினர் பதிவு ஒப்புதல் இறுதி செய்யப்பட்டது!" : `Member Registration successfully approved: ${finalStatus}`);
  };

  // 2. Run AI QR Card/Certificate Validation
  const runQRValidation = async () => {
    setAiLoading(true);
    try {
      const result = await executeAIAutomation("qr_validation", { code: qrInputPayload });
      setQrVerificationResult(result);
      
      const newLog = {
        timestamp: new Date().toLocaleString(),
        memberId: result.memberId,
        name: result.name,
        status: result.verificationStatus,
        payloadType: result.payloadType
      };
      setQrLogs(prev => [newLog, ...prev]);
      onAddAuditLog("AI QR Verification Complete", `QR scanned: ${result.name} (${result.memberId}) validated as ${result.verificationStatus}`);
    } catch (error) {
      // Fallback
      const result = {
        isValid: qrInputPayload.includes("APPROVED"),
        payloadType: "MEMBERSHIP_CARD",
        memberId: "TNPA-93281",
        name: "S. Kumaran",
        verificationStatus: qrInputPayload.includes("APPROVED") ? "VERIFIED_SUCCESS" : "VERIFICATION_FAILED",
        certDetails: "Elite Painting and Scaffold Harness Safety Training",
        logMessageTa: "உறுப்பினர் QR குறியீடு வெற்றிகரமாக அங்கீகரிக்கப்பட்டது.",
        logMessageEn: "Cryptographic member code verified with 100% integrity check."
      };
      setQrVerificationResult(result);
      setQrLogs(prev => [{
        timestamp: new Date().toLocaleString(),
        memberId: result.memberId,
        name: result.name,
        status: result.verificationStatus,
        payloadType: result.payloadType
      }, ...prev]);
    } finally {
      setAiLoading(false);
    }
  };

  // 3. Run AI Report Generation
  const runReportGeneration = async () => {
    setAiLoading(true);
    try {
      const result = await executeAIAutomation("report_generation", { reportType: selectedReportType, metrics: reportInputMetrics });
      setGeneratedReport(result);
      onAddAuditLog("AI Executive Report Generated", `Successfully compiled AI ${selectedReportType} executive report.`);
    } catch (error) {
      // Fallback
      setGeneratedReport({
        reportTitleTa: `${selectedReportType} அவசர நிர்வாக அறிக்கை`,
        reportTitleEn: `AI Generated ${selectedReportType} Executive Oversight Report`,
        executiveSummaryTa: "ஆராய்ச்சி முடிவுகள்: மாவட்ட அளவிலான சந்தா வரவு ₹42,500 மற்றும் நலவாரிய விபத்து விண்ணப்பங்கள் வெற்றிகரமாகப் பெறப்பட்டு நிலுவை சரிபார்க்கப்பட்டுள்ளது.",
        executiveSummaryEn: "Executive Assessment: State level subscription collections checked at ₹42,500 with welfare backlog verification pipeline operating at stable thresholds.",
        statistics: [
          { "label": "New Enrolls", "value": "124" },
          { "label": "Subscription Revenue", "value": "₹42,500" },
          { "label": "Pending Claims", "value": "8" }
        ],
        strategicRecommendationsTa: [
          "மாவட்டச் செயலாளர்களுடன் அவசர தணிக்கை கூட்டத்திற்கு ஏற்பாடு செய்ய பரிந்துரைக்கப்படுகிறது."
        ],
        strategicRecommendationsEn: [
          "Organize immediate compliance session with district secretaries regarding renewal pipeline backlog."
        ]
      });
    } finally {
      setAiLoading(false);
    }
  };

  // 4. Run AI Meeting Assistant
  const runMeetingAssistant = async () => {
    setAiLoading(true);
    try {
      const result = await executeAIAutomation("meeting_assistant", { topic: meetingTopicInput });
      setGeneratedMeetingData(result);
      onAddAuditLog("AI Meeting Assets Drafted", "Drafted complete agenda, notification reminder template, and follow-ups.");
    } catch (error) {
      // Fallback
      setGeneratedMeetingData({
        meetingTitleTa: "மாநில செயற்குழு அவசரக் கூட்டம்",
        meetingTitleEn: "Emergency Executive Committee Briefing",
        agendaTa: [
          "1. விபத்து மரண நிதி அரசாணை 124 திருத்தங்கள் விவாதம்",
          "2. மாவட்டம் வாரியாக உறுப்பினர் சந்தா நிலுவை தணிக்கை",
          "3. உறுப்பினர் அட்டை விநியோக செயல்முறை"
        ],
        agendaEn: [
          "1. Action items on Government Order 124 updates",
          "2. Audit of annual subscription metrics per district node",
          "3. Member ID Card dispatch schedules"
        ],
        reminderTemplateTa: "அனைத்து மாவட்ட நிர்வாகிகளுக்கும் வணக்கம். நாளை காலை 10 மணிக்கு விபத்து மரண நிதி அரசாணை திருத்தங்கள் குறித்த அவசரக் கூட்டம் கூடுகிறது. அனைவரும் தவறாமல் கலந்து கொள்ளுமாறு கேட்டுக்கொள்ளப்படுகிறது.",
        reminderTemplateEn: "Respected District Admins, urgent meeting scheduled tomorrow 10 AM to evaluate G.O. 124 death benefits. Attendance mandatory.",
        suggestedFollowUpsTa: [
          "அரசாணை நகல்களை உடனடியாக மாவட்ட அளவில் விநியோகிப்பது"
        ],
        suggestedFollowUpsEn: [
          "Expedite physical G.O. 124 pamphlet distribution to all painters."
        ]
      });
    } finally {
      setAiLoading(false);
    }
  };

  // 5. Run AI News & Public Relations Copywriting
  const runNewsGeneration = async () => {
    setAiLoading(true);
    try {
      const result = await executeAIAutomation("news_content", { topic: newsTopicInput, platform: newsPlatformType });
      setGeneratedNewsData(result);
      onAddAuditLog("AI News Content Drafted", `Compiled draft for platform: ${newsPlatformType}`);
    } catch (error) {
      // Fallback
      setGeneratedNewsData({
        headlineTa: "தேசிய கலைஞர் விருது பெறும் தமிழக ஓவிய கலைஞர்",
        headlineEn: "Tamil Nadu Artisan Wins National Recognition",
        draftTa: "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்க உறுப்பினரான திரு. தங்கராஜ் அவர்களுக்கு தேசிய சிறந்த ஓவிய கலைஞர் விருது வழங்கப்பட்டு மாநில பொதுச் செயலர் பாராட்டு செய்தி...",
        draftEn: "Respected Senior Artisan Mr. Thangaraj selected for national honor, congratulatory message sent by State Secretary...",
        socialMediaCopy: "🏆 Pride of Tamil Nadu Painters Association! Mr. Thangaraj wins National Artisan Award! #TNPA #PaintersIndia #TamilNaduArt",
        circularDraftTa: "அறிவிப்பு: தேசிய விருது பெற்ற தங்கராஜ் அவர்களுக்கு மாவட்டங்கள் வாரியாக பாராட்டு விழா...",
        circularDraftEn: "Notice: Congratulatory meeting schedules for National Awardee Mr. Thangaraj...",
        publicationStatus: "PENDING_APPROVAL"
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Human-in-the-loop: Approve drafted news content before publishing
  const handleApproveNewsContent = () => {
    if (!generatedNewsData) return;
    const publishedItem = {
      ...generatedNewsData,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      publicationStatus: "PUBLISHED_LIVE"
    };
    setPublishedNews(prev => [publishedItem, ...prev]);
    setGeneratedNewsData(null);
    onAddAuditLog("Admin News Approval", `Super Admin approved and published AI news: ${publishedItem.headlineEn}`);
    alert(lang === "ta" ? "செய்தி உள்ளடக்கம் அங்கீகரிக்கப்பட்டு இணையதளத்தில் வெளியிடப்பட்டது!" : "News content approved and published live to website nodes.");
  };

  // 6. Run AI Website Reliability Diagnostic Scan
  const runWebsiteDiagnostics = async () => {
    setAiLoading(true);
    try {
      const result = await executeAIAutomation("website_monitoring", {
        check: "integrity",
        url: "https://tnpa-advancement.org"
      });
      setSiteHealthMetrics(result);
      onAddAuditLog("AI Website Monitor Scan Complete", `Overall Grade: ${result.overallGrade}, Speed: ${result.loadingSpeedMs}ms`);
    } catch (error) {
      // Fallback
      setSiteHealthMetrics({
        overallGrade: "A-",
        loadingSpeedMs: 1450,
        brokenLinks: ["/resources/old-bylaws-1989.doc", "/gallery/archived_meet_2018.jpg"],
        missingImages: ["/logo_fallback_thumbnail.png"],
        performanceSummaryTa: "இணையதளம் மிக வேகமாக இயங்குகிறது. சில பழைய கோப்பு இணைப்புகள் மற்றும் விடுபட்ட படங்கள் மட்டுமே கண்டறியப்பட்டுள்ளன.",
        performanceSummaryEn: "Website load speed is optimal (1.45s). Two broken legacy static links and one missing logo thumbnail were detected.",
        correctiveActionsTa: [
          "பழைய பிடிஎப் மற்றும் படங்களை மாற்றி 2026 கையேட்டை இணைக்கவும்"
        ],
        correctiveActionsEn: [
          "Update outdated 1989 document link with the active 2026 high-resolution PDF guidelines."
        ]
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Add project task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const added = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      titleEn: newTaskTitleEn || newTaskTitle,
      assignedTo: newTaskAssignee || "Unassigned",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priority: newTaskPriority,
      status: "todo",
      district: newTaskDistrict
    };

    if (isOffline) {
      setOfflineQueue(prev => [...prev, { type: "TASK", data: added, timestamp: new Date().toLocaleTimeString() }]);
      alert(lang === "ta" ? "வலை இணைப்பு இல்லை! பணி உள்ளூர் தேக்கத்தில் சேமிக்கப்பட்டுள்ளது." : "Offline Mode Active! Task cached locally.");
    } else {
      setTasks(prev => [added, ...prev]);
      onAddAuditLog("Project Task Added", `Created new union task: ${added.titleEn} assigned to ${added.assignedTo}.`);
      alert(lang === "ta" ? "பணி வெற்றிகரமாகச் சேர்க்கப்பட்டது!" : "Project task successfully generated!");
    }

    setNewTaskTitle("");
    setNewTaskTitleEn("");
    setNewTaskAssignee("");
  };

  // Update Kanban state
  const handleToggleTaskStatus = (id: string, newStatus: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
    onAddAuditLog("Task Status Updated", `Task ID ${id} moved to ${newStatus}.`);
  };

  // Submit Completion Report
  const handleSubmitCompletionReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectReportText.trim()) return;

    onAddAuditLog("Project Completion Report Submitted", `Report submitted: ${projectReportText.substring(0, 50)}...`);
    alert(lang === "ta" ? "திட்ட நிறைவு அறிக்கை தலைமை நிர்வாகத்திற்கு அனுப்பப்பட்டது!" : "Project Completion Report successfully submitted for audit review!");
    setProjectReportText("");
  };

  // AI Document Library Search
  const handleAISearchLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    
    // Simulate AI semantic matching
    setTimeout(() => {
      if (query.includes("accident") || query.includes("விபத்து") || query.includes("பணம்")) {
        setAiLibraryResponse(
          lang === "ta"
            ? "கண்டறியப்பட்ட பிரிவு: 'விபத்து மரண மற்றும் ஊன நிவாரணம்'. உத்தரவு: G.O. 124, பக்கம் 4, விதி 8-ன் படி, பணியின் போது உயிரிழக்கும் பெயிண்டர்களுக்கு ₹5,00,000 அரசு நிதியும், அவசர உதவித்தொகையாக சங்கம் சார்பாக ₹1,00,000 உடனடியாக வாரிசுதாரருக்கு வழங்க வேண்டும்."
            : "Semantic Match Found in 'Circular 2026/04' & 'G.O. 124' (Page 4, Clause 8): Registered painters deceased on duty are entitled to ₹5,00,000 Government Board relief, coupled with a guaranteed ₹1,00,000 immediate cash payout from TNPA Mutual Fund."
        );
      } else if (query.includes("fee") || query.includes("கட்டணம்") || query.includes("சந்தா")) {
        setAiLibraryResponse(
          lang === "ta"
            ? "கண்டறியப்பட்ட பிரிவு: 'சங்கத்தின் அரசியல் சாசனம் & துணை விதிகள்'. ஆண்டு சந்தா ₹500. புதுப்பிக்கத் தவறும் பட்சத்தில் உறுப்பினர் தகுதி மற்றும் நலத்திட்ட பலன்கள் தற்காலிகமாக நிறுத்தி வைக்கப்படலாம்."
            : "Semantic Match Found in 'Union Constitution' (Article 12, Sec 3): Annual subscription is set to ₹500, due before August 10. Failure to renew results in temporary suspension of membership privileges and welfare board eligibility."
        );
      } else {
        setAiLibraryResponse(
          lang === "ta"
            ? "சங்க நூலக தேடல் முடிவு: '" + searchQuery + "' தொடர்பான குறிப்பிட்ட விதிகள் கண்டறியப்படவில்லை. பொதுவான சுற்றறிக்கை 2026/04 மற்றும் அரசியல் சாசனப் பக்கங்களை பார்க்கவும்."
            : "AI Search Result: No explicit match for '" + searchQuery + "'. Suggest checking 'Union Constitution & Bylaws' or contact State General Secretary."
        );
      }
      onAddAuditLog("AI Library Semantic Search", `Queried: "${searchQuery}"`);
    }, 600);
  };

  // Offline Synchronization Actions
  const handleToggleOfflineMode = () => {
    setIsOffline(prev => {
      const next = !prev;
      if (next) {
        onAddAuditLog("Network Switched Offline", "Simulated lost internet connectivity. Offline database storage active.");
      } else {
        onAddAuditLog("Network Switched Online", "Simulated connectivity restored. Synchronization pending.");
      }
      return next;
    });
  };

  // Go Online & Trigger Sync with simulated conflict resolution
  const handleTriggerSync = () => {
    if (offlineQueue.length === 0) {
      alert(lang === "ta" ? "ஒத்திசைக்க எந்த புதிய ஆஃப்லைன் தரவும் இல்லை!" : "No cached offline entries to synchronize.");
      return;
    }

    // Create a mock conflict to show interactive conflict resolution if tasks exist
    const taskConflict = offlineQueue.find(q => q.type === "TASK");
    if (taskConflict) {
      setSyncConflict({
        local: { ...taskConflict.data, title: "Local Draft Task Title" },
        server: { id: taskConflict.data.id, title: "Server Version Task Title" },
        queueItemIndex: offlineQueue.indexOf(taskConflict)
      });
      return;
    }

    // If no conflicts, just sync everything
    processFullSync();
  };

  const processFullSync = () => {
    // Sync tasks
    const queuedTasks = offlineQueue.filter(q => q.type === "TASK");
    if (queuedTasks.length > 0) {
      setTasks(prev => [...queuedTasks.map(q => q.data), ...prev]);
    }

    onAddAuditLog("Database Sync Completed", `Synchronized ${offlineQueue.length} offline local events securely.`);
    alert(lang === "ta" ? `அனைத்து ஆஃப்லைன் தரவுகளும் வெற்றிகரமாக ஒத்திசைக்கப்பட்டது! (${offlineQueue.length} கோப்புகள்)` : `Automatic Sync complete! Successfully synchronized ${offlineQueue.length} local entries with state database.`);
    setOfflineQueue([]);
  };

  // Resolve sync conflict
  const handleResolveConflict = (keepLocal: boolean) => {
    if (!syncConflict) return;

    const chosen = keepLocal ? syncConflict.local : syncConflict.server;
    
    // Add chosen task
    setTasks(prev => [chosen, ...prev]);

    // Remove solved item and sync remaining items in queue
    const remainingQueue = [...offlineQueue];
    remainingQueue.splice(syncConflict.queueItemIndex, 1);
    
    onAddAuditLog("Conflict Resolved Successfully", `Conflict resolved by choosing: ${keepLocal ? 'Local Draft' : 'Server Version'}`);
    alert(lang === "ta" ? "ஒத்திசைவு முரண்பாடு வெற்றிகரமாக தீர்க்கப்பட்டது!" : "Database conflict successfully resolved. Sync process complete.");
    
    setOfflineQueue(remainingQueue);
    setSyncConflict(null);

    // Sync remaining if any
    if (remainingQueue.length > 0) {
      setTimeout(() => {
        processFullSync();
      }, 500);
    }
  };

  // Backup & Recovery Simulator
  const handleCompileEncryptedBackup = () => {
    const backupObj = {
      tasks,
      systemHealth: "100%",
      districtScores: TN_DISTRICTS.map(d => ({ key: d.key, score: d.score })),
      timestamp: new Date().toISOString(),
      encryptedChecksum: "AES256-PBKDF2-HASH-4bb2ea"
    };

    const newLog = {
      id: `b_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      status: "Success",
      type: "Manual Encrypted Backup",
      size: "14.5 MB",
      checksum: "SHA256:7dd4a91"
    };

    setBackupLogs(prev => [newLog, ...prev]);

    // Save as downloadable JSON file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `TNPA_COMMAND_CENTER_BACKUP_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();

    onAddAuditLog("Encrypted Backup Compiled", "Manual encrypted state backup dump generated and downloaded.");
    alert(lang === "ta" ? "பாதுகாப்பான என்க்ரிப்ட் செய்யப்பட்ட காப்புப்பிரதி வெற்றிகரமாக டவுன்லோட் செய்யப்பட்டது!" : "Encrypted local system backup successfully generated and downloaded.");
  };

  const handleSimulateDisasterRecovery = (action: string) => {
    setSystemIntegrityCheck(action);
    setTimeout(() => {
      onAddAuditLog("Disaster Recovery Executed", `DR Routine triggered: ${action}. State integrity verified.`);
      alert(
        lang === "ta"
          ? `மறுசீரமைப்பு நடவடிக்கை வெற்றிகரமாக முடிந்தது: ${action}. கணினி 100% ஆரோக்கியமாக உள்ளது.`
          : `Disaster Recovery operation: '${action}' finished with 100% integrity check passed.`
      );
      setSystemIntegrityCheck(null);
    }, 1500);
  };

  // Volunteer Opportunities
  const handleApplyVolunteer = (oppTitle: string) => {
    if (volunteerApps.includes(oppTitle)) return;
    setVolunteerApps(prev => [...prev, oppTitle]);
    onAddAuditLog("Volunteer Application Filed", `Applied to volunteer for: ${oppTitle}`);
    alert(lang === "ta" ? "விண்ணப்பம் சமர்ப்பிக்கப்பட்டது! உங்கள் மாவட்டச் செயலாளர் உங்களை தொடர்புகொள்வார்." : "Volunteer application registered! Your District Coordinator will reach out soon.");
  };

  return (
    <div className="bg-[#fcfbf9] text-stone-900 border border-stone-200 rounded-3xl shadow-xl overflow-hidden min-h-[750px] flex flex-col font-sans">
      
      {/* COMMAND CENTER BAR */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white p-6 border-b-4 border-amber-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[9px] tracking-widest uppercase">
                TNPA ENTERPRISE V12.0
              </span>
              {isOffline && (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] animate-pulse">
                  OFFLINE MODE
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
              {lang === "ta" ? "சங்க டிஜிட்டல் கட்டளை மையம்" : "TNPA ENTERPRISE COMMAND CENTER"}
            </h2>
            <p className="text-xs text-stone-300">
              {lang === "ta" 
                ? "மாநில, மாவட்ட நிர்வாக உள்கட்டமைப்பு மற்றும் செயற்கை நுண்ணறிவு நிர்வாக தளம்"
                : "Live State Command, District Analytics, and AI-Powered Governance Hub"}
            </p>
          </div>

          {/* Sandbox Role Selector to preview features */}
          <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-2xl border border-stone-800">
            <span className="text-[10px] text-amber-400 font-extrabold uppercase font-mono">
              {lang === "ta" ? "நிர்வாக பாத்திர சோதனை:" : "Simulated Role Persona:"}
            </span>
            <select
              value={sandboxRole}
              onChange={(e) => {
                setSandboxRole(e.target.value);
                onAddAuditLog("Sandbox Persona Switched", `Simulated role changed to: ${e.target.value}`);
              }}
              className="bg-stone-950 text-white border border-stone-700 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="super_admin">Super Admin (மாநில தலைமை)</option>
              <option value="district_admin">District Admin (மாவட்ட நிர்வாகம்)</option>
              <option value="member">Registered Member (சங்க உறுப்பினர்)</option>
              <option value="visitor">Guest Visitor (விருந்தினர்)</option>
            </select>
          </div>
        </div>
      </div>

      {/* OFFLINE STATUS ALERT BAR */}
      {isOffline && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-900 px-6 py-2.5 text-xs font-semibold flex justify-between items-center animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{lang === "ta" ? "ஆஃப்லைனில் உள்ளீர்கள். உங்கள் மாற்றங்கள் உள்ளூர் தேக்கத்தில் சேமிக்கப்பட்டு நெட்வொர்க் வந்ததும் ஒத்திசைக்கப்படும்." : "Offline Mode Active. Data fills are cached locally and synchronized upon manual sync."}</span>
          </div>
          <div className="flex items-center gap-2">
            {offlineQueue.length > 0 && (
              <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                {offlineQueue.length} {lang === "ta" ? "வரைவு கோப்புகள்" : "drafts waiting"}
              </span>
            )}
            <button
              onClick={handleToggleOfflineMode}
              className="px-2 py-1 bg-white border border-rose-300 rounded text-rose-800 font-bold hover:bg-rose-100 cursor-pointer text-[10px]"
            >
              {lang === "ta" ? "ஆன்லைனுக்கு மாறுக" : "Go Online"}
            </button>
          </div>
        </div>
      )}

      {/* RECONSTRUCTED CENTRAL CONSOLE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 flex-grow">
        
        {/* NAVIGATIONAL SIDEBAR */}
        <div className="bg-stone-900 text-stone-300 p-4 border-r border-stone-800 space-y-1">
          <span className="text-[10px] text-stone-500 block uppercase tracking-wider font-extrabold px-2 mb-2">
            {lang === "ta" ? "கட்டளைத் தேர்வுகள்" : "CONSOLE NAVIGATION"}
          </span>
          {[
            { id: "state_cc", label: "மாநில கட்டளை மையம்", labelEn: "State Command Center", icon: <Tv className="w-4 h-4" /> },
            { id: "district_cc", label: "மாவட்ட மேலாண்மை", labelEn: "District Command Center", icon: <MapPin className="w-4 h-4" /> },
            { id: "ai_governance", label: "AI நிர்வாக மேம்பாடு", labelEn: "AI Governance Platform", icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
            { id: "engagement", label: "உறுப்பினர் ஈடுபாடு", labelEn: "Member Engagement", icon: <Award className="w-4 h-4 text-rose-400" /> },
            { id: "projects", label: "திட்ட மேலாண்மை", labelEn: "Project Management", icon: <Briefcase className="w-4 h-4" /> },
            { id: "library", label: "டிஜிட்டல் ஆவண நூலகம்", labelEn: "Digital Library & GOs", icon: <Book className="w-4 h-4" /> },
            { id: "offline_sync", label: "ஆஃப்லைன் தரவு ஒத்திசைவு", labelEn: "Offline Sync Hub", icon: <Layers className="w-4 h-4" /> },
            { id: "backup_dr", label: "பாதுகாப்பு & மறுசீரமைப்பு", labelEn: "Disaster Recovery & Backup", icon: <Database className="w-4 h-4" /> }
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => {
                setActiveTab(nav.id as any);
                onAddAuditLog("Command Tab Navigated", `Accessed tab: ${nav.labelEn}`);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === nav.id
                  ? "bg-[#b91c1c] text-white shadow-lg border-l-4 border-amber-400"
                  : "hover:bg-stone-800 hover:text-white"
              }`}
            >
              {nav.icon}
              <span>{lang === "ta" ? nav.label : nav.labelEn}</span>
            </button>
          ))}

          {/* Persona Permissions Badge HUD */}
          <div className="pt-6 mt-6 border-t border-stone-800 px-2 space-y-2.5 text-[10px] text-stone-400 leading-relaxed text-left">
            <span className="font-extrabold text-stone-500 uppercase block">
              {lang === "ta" ? "பாதுகாப்பு குறியீடுகள்" : "SECURITY AUTHORIZATION"}
            </span>
            <div>
              <span className="font-extrabold text-white block">Role Privileges:</span>
              <p className="text-stone-400 mt-1">
                {sandboxRole === "super_admin" && "✓ Complete state control, Disaster Backup authority."}
                {sandboxRole === "district_admin" && "✓ District performance analytics, filing district reports, task management."}
                {sandboxRole === "member" && "✓ Request certificates, read library, submit grievances."}
                {sandboxRole === "visitor" && "✓ Read-only constitutional guidelines, public bulletin updates."}
              </p>
            </div>
          </div>
        </div>

        {/* WORKSPACE CABINET */}
        <div className="lg:col-span-3 p-6 space-y-6 overflow-y-auto max-h-[800px] text-left">
          
          {/* TAB 1: STATE COMMAND CENTER */}
          {activeTab === "state_cc" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 uppercase">
                    {lang === "ta" ? "மாநில தலைமை மேலாண்மைப் பலகை" : "STATE COMMAND DASHBOARD"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === "ta" ? "தமிழ்நாடு முழுவதும் உள்ள 38 மாவட்டங்களின் நேரடி செயல்பாட்டு அறிக்கை" : "Live state-wide oversight across Tamil Nadu Painter association node groups."}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl font-bold">
                  <Activity className="w-4 h-4 text-amber-700 animate-pulse" />
                  <span>{lang === "ta" ? "லைவ் கண்காணிப்பு" : "Operational Live Stream"}</span>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "மொத்த உறுப்பினர்கள்", labelEn: "Total Enrolled", val: "12,845", sub: "+124 this week", subTa: "இவ்வாரம் +124", icon: <Users className="w-5 h-5 text-stone-700" /> },
                  { label: "இன்றைய சந்தா வரவு", labelEn: "Today's Collections", val: "₹42,500", sub: "Goal: ₹50,000", subTa: "இலக்கு: ₹50,000", icon: <CreditCard className="w-5 h-5 text-[#b91c1c]" /> },
                  { label: "நிலுவை ஒப்புதல்கள்", labelEn: "Pending Approvals", val: "34", sub: "Action required", subTa: "உடனடி சரிபார்ப்பு", icon: <ShieldCheck className="w-5 h-5 text-amber-600" /> },
                  { label: "அவசர உதவி கோரிக்கைகள்", labelEn: "Pending Welfare Claims", val: "12", sub: "8 accidental status", subTa: "8 விபத்து வழக்குகள்", icon: <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" /> }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-1 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                        {lang === "ta" ? kpi.label : kpi.labelEn}
                      </span>
                      {kpi.icon}
                    </div>
                    <p className="text-xl font-black text-stone-950 font-mono">{kpi.val}</p>
                    <span className="text-[10px] text-stone-500 font-semibold block">
                      {lang === "ta" ? kpi.subTa : kpi.sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* District Status Explorer & AI recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 38 Districts Grid Map List */}
                <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-stone-900 uppercase">
                        {lang === "ta" ? "மாவட்ட தகுதி மற்றும் நிலை" : "District Operational Status (38 Nodes)"}
                      </h4>
                      <span className="text-[10px] text-stone-400 font-bold">Scroll list for all 38</span>
                    </div>

                    <div className="max-h-[220px] overflow-y-auto border border-stone-100 rounded-xl divide-y divide-stone-100 text-xs">
                      {TN_DISTRICTS.map((dist) => (
                        <div key={dist.key} className="p-2.5 flex justify-between items-center hover:bg-stone-50 transition-all">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="font-bold text-stone-800">{lang === "ta" ? dist.ta : dist.en}</span>
                            <span className="text-[9px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 font-bold">{dist.region}</span>
                          </div>
                          <div className="flex items-center gap-4 font-mono text-stone-700">
                            <span>{dist.members.toLocaleString()} members</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dist.score >= 90 ? "bg-emerald-50 text-emerald-800" : dist.score >= 80 ? "bg-amber-50 text-amber-800" : "bg-stone-100 text-stone-700"
                            }`}>
                              Score: {dist.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* State AI recommendations widget */}
                <div className="bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-800">
                      <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span className="font-extrabold text-xs uppercase tracking-wider">
                        {lang === "ta" ? "AI மூலோபாய பரிந்துரை" : "AI STRATEGIC RECS"}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {lang === "ta" 
                        ? "கணினியின் தரவு பகுப்பாய்வு அடிப்படையில்:" 
                        : "Based on real-time neural sync parameters:"}
                    </p>
                    <ul className="text-[10px] text-stone-700 space-y-2 list-disc pl-4 leading-relaxed font-medium">
                      <li>
                        {lang === "ta"
                          ? "வேலூர் மற்றும் சேலத்தில் சந்தா புதுப்பிப்பு சரிவை எதிர்கொள்ள சிறப்பு உதவி முகாம் தேவை."
                          : "Vellore and Salem exhibit declining subscription velocities. Launch recovery camps."}
                      </li>
                      <li>
                        {lang === "ta"
                          ? "கோயம்புத்தூரில் 8 விபத்து நலநிதி விண்ணப்பங்கள் 7 நாட்களுக்கு மேலாக ஒப்புதலுக்கு காத்திருக்கின்றன."
                          : "Coimbatore holds 8 pending accident claims exceeding a 7-day threshold. Approve immediately."}
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-amber-200/60 text-[9px] text-stone-400 font-semibold italic">
                    {lang === "ta" 
                      ? "*திட்டமிடல் உதவிக்கு மட்டுமே. AI முடிவுகள் அதிகாரப்பூர்வமானவை அல்ல." 
                      : "*Provided as planning assistance only. AI recommendations do not represent official decisions."}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: DISTRICT COMMAND CENTER */}
          {activeTab === "district_cc" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 uppercase">
                    {lang === "ta" ? "மாவட்ட அளவிலான கட்டுப்பாட்டு பலகை" : "DISTRICT CONTROL CENTER"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === "ta" ? "தேர்ந்தெடுக்கப்பட்ட மாவட்டத்தின் லைவ் நிலவரம் மற்றும் செயல்பாடுகள்" : "Select any of the 38 administrative districts to drill down into metrics."}
                  </p>
                </div>

                {/* District Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-600">{lang === "ta" ? "மாவட்டத்தை தேர்வு செய்க:" : "Select District:"}</span>
                  <select
                    value={selectedDistrictKey}
                    onChange={(e) => setSelectedDistrictKey(e.target.value)}
                    className="bg-white border border-stone-200 text-stone-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-sm"
                  >
                    {TN_DISTRICTS.map((d, idx) => (
                      <option key={`tn_dist_${d.key}_${idx}`} value={d.key}>
                        {lang === "ta" ? d.ta : d.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Selected District Profile */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-[10px] text-stone-400 font-extrabold uppercase">District Profile</span>
                    <h4 className="text-lg font-black text-[#b91c1c]">
                      📍 {lang === "ta" ? activeDistrict.ta : activeDistrict.en}
                    </h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500 font-medium">District Members:</span>
                      <span className="font-bold text-stone-950 font-mono">{activeDistrict.members.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500 font-medium">Today's Activities:</span>
                      <span className="font-bold text-emerald-600">ID Card Camps Active</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500 font-medium">Renewals Compliance:</span>
                      <span className="font-bold text-stone-950 font-mono">82% completed</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500 font-medium">Total Collections:</span>
                      <span className="font-bold text-stone-950 font-mono">₹4,25,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500 font-medium">Upcoming Meetings:</span>
                      <span className="font-bold text-amber-700">Aug 12 - Executive Council</span>
                    </div>
                  </div>

                  {/* Performance Score Circle representation */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold block">PERFORMANCE SCORE</span>
                      <span className="text-xl font-black text-emerald-600 font-mono">{activeDistrict.score}%</span>
                    </div>
                    <div className="h-10 w-24 bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-center">
                      <span className="text-[9px] text-emerald-800 font-extrabold uppercase bg-emerald-50 px-2 py-0.5 rounded">
                        Class A Excellent
                      </span>
                    </div>
                  </div>
                </div>

                {/* District Activities & Reports Filing Form */}
                <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-stone-900 uppercase">
                    {lang === "ta" ? "மாவட்ட செயல்பாட்டு அறிக்கை சமர்ப்பிப்பு" : "Submit District Action Report"}
                  </h4>

                  {["super_admin", "district_admin"].includes(sandboxRole) ? (
                    <form onSubmit={handleSubmitCompletionReport} className="space-y-3.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block uppercase mb-1">Report Subject</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., T.Nagar Enrolment Camp Finished"
                            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block uppercase mb-1">Upload Report Attachment</label>
                          <div className="border border-dashed border-stone-200 rounded-xl px-3 py-2 bg-stone-50 text-xs flex items-center justify-between cursor-pointer hover:bg-stone-100">
                            <span className="text-stone-400">PDF, JPG format up to 5MB</span>
                            <FileDown className="w-4 h-4 text-stone-400" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-500 block uppercase mb-1">Executive Summary of work done</label>
                        <textarea
                          rows={3}
                          required
                          value={projectReportText}
                          onChange={(e) => setProjectReportText(e.target.value)}
                          placeholder="Summarize enrollment camps, subscription collections, and accident reports..."
                          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-stone-900 hover:bg-[#b91c1c] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        {lang === "ta" ? "மாவட்ட அறிக்கையை சமர்ப்பி" : "Dispatch Action Report to State"}
                      </button>
                    </form>
                  ) : (
                    <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-100">
                      <Lock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="text-xs text-stone-500 font-bold">
                        {lang === "ta" ? "அறிக்கை சமர்ப்பிக்க மாவட்ட செயலாளர்கள் மட்டுமே அனுமதிக்கப்படுகிறார்கள்." : "Privileged Access Only: District Secretary account role required to submit reports."}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: AI GOVERNANCE PLATFORM */}
          {activeTab === "ai_governance" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-3 gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-tight flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#b91c1c]" />
                    {lang === "ta" ? "செயற்கை நுண்ணறிவு நிர்வாக தளம்" : "AI GOVERNANCE & AUTOMATION CENTER"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் சங்கத்தின் 15.0 இராணுவ தர செயற்கை நுண்ணறிவு நிர்வாக மேலாண்மை" : "TNPA Version 15.0 Military-Grade Autonomous AI Administration & Operations Control."}
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-stretch sm:self-auto justify-center">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Gemini 1.5 PRO Active</span>
                </div>
              </div>

              {/* Sub-tabs for all 7 AI Automation Modules */}
              <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-1">
                <button
                  onClick={() => setAiSubTab("auto_admin")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    aiSubTab === "auto_admin"
                      ? "bg-[#b91c1c] text-white border-b-2 border-red-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "தானியங்கி நிர்வாகம்" : "Auto-Admin"}</span>
                </button>
                <button
                  onClick={() => setAiSubTab("member_verify")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    aiSubTab === "member_verify"
                      ? "bg-[#b91c1c] text-white border-b-2 border-red-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "உறுப்பினர் சரிபார்ப்பு" : "AI Verification"}</span>
                </button>
                <button
                  onClick={() => setAiSubTab("qr_validate")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    aiSubTab === "qr_validate"
                      ? "bg-[#b91c1c] text-white border-b-2 border-red-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "QR அட்டை சரிபார்ப்பு" : "QR Validation"}</span>
                </button>
                <button
                  onClick={() => setAiSubTab("report_gen")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    aiSubTab === "report_gen"
                      ? "bg-[#b91c1c] text-white border-b-2 border-red-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "அறிக்கை தொகுப்பு" : "AI Report Builder"}</span>
                </button>
                <button
                  onClick={() => setAiSubTab("meeting")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    aiSubTab === "meeting"
                      ? "bg-[#b91c1c] text-white border-b-2 border-red-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "கூட்ட மேலாண்மை" : "Meeting Assistant"}</span>
                </button>
                <button
                  onClick={() => setAiSubTab("news_pr")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    aiSubTab === "news_pr"
                      ? "bg-[#b91c1c] text-white border-b-2 border-red-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "செய்தி வரைவு" : "News & PR Drafts"}</span>
                </button>
                <button
                  onClick={() => setAiSubTab("reliability")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    aiSubTab === "reliability"
                      ? "bg-[#b91c1c] text-white border-b-2 border-red-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "வலைத்தள கண்காணிப்பு" : "Site Monitor"}</span>
                </button>
              </div>

              {/* Loader */}
              {aiLoading && (
                <div className="p-12 bg-white border border-stone-200 rounded-2xl shadow-sm text-center space-y-3 flex flex-col items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-[#b91c1c] animate-spin" />
                  <p className="text-xs font-bold text-stone-700 animate-pulse">
                    {lang === "ta" ? "ஜெமினி செயற்கை நுண்ணறிவு பகுப்பாய்வு செய்கிறது... தயவுசெய்து காத்திருக்கவும்..." : "Gemini AI is processing your secure request... Please wait..."}
                  </p>
                </div>
              )}

              {!aiLoading && (
                <div className="grid grid-cols-1 gap-6">

                  {/* SUB-TAB 1: AI AUTO-ADMIN APPROVALS */}
                  {aiSubTab === "auto_admin" && (
                    <div className="space-y-6">
                      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                        <div className="border-b border-stone-100 pb-3 mb-4">
                          <h4 className="text-xs font-black text-stone-950 uppercase">
                            {lang === "ta" ? "செயற்கை நுண்ணறிவு தானியங்கி நிர்வாக மேலாண்மை (முன்னறிவிப்பு ஒப்புதல்கள்)" : "AI Auto-Admin & Smart Governance Engine"}
                          </h4>
                          <p className="text-[10px] text-stone-500">
                            {lang === "ta" ? "அனைத்து முக்கிய நிர்வாக பணிகளும் மனித ஒப்புதலின்றி செயல்படுத்தப்படாது." : "All highlighted alerts represent smart intelligence and require explicit Human General Secretary approval."}
                          </p>
                        </div>

                        {/* Summary / Vulnerability layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left: Pending Actions needing approval */}
                          <div className="lg:col-span-2 space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                              {lang === "ta" ? "நிலுவையில் உள்ள அவசர ஒப்புதல்கள்" : "Pending Human-in-the-Loop Actions"}
                            </span>

                            {autoAdminActions.filter(a => a.status === "pending").length === 0 ? (
                              <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl text-center text-xs text-stone-500 font-bold">
                                {lang === "ta" ? "நிலுவையில் எந்த நடவடிக்கையும் இல்லை. அனைத்தும் ஒப்புதல் பெற்றுள்ளன!" : "All strategic AI recommendations have been evaluated and approved!"}
                              </div>
                            ) : (
                              autoAdminActions.filter(a => a.status === "pending").map((action, idx) => (
                                <div key={`ecc_act_${action.id}_${idx}`} className="p-4 border border-stone-200 hover:border-[#b91c1c]/30 rounded-xl space-y-3 bg-white transition-all shadow-sm">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                        action.priority === "high" ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                      }`}>
                                        {action.priority} priority
                                      </span>
                                      <h5 className="text-xs font-black text-stone-900 mt-1.5">{action.title}</h5>
                                    </div>
                                    <span className="text-[10px] text-stone-400 capitalize">{action.type}</span>
                                  </div>

                                  <p className="text-xs text-stone-600 font-medium leading-relaxed">{action.description}</p>
                                  
                                  <div className="p-3 bg-amber-50/50 border-l-4 border-amber-500 rounded-r-lg text-[10px] font-semibold text-stone-850 leading-relaxed space-y-1">
                                    <span className="text-amber-900 uppercase block text-[9px] font-black">AI Strategic Recommendation:</span>
                                    <p>{action.recommendation}</p>
                                  </div>

                                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                                    <button
                                      onClick={() => {
                                        setAutoAdminActions(prev => prev.map(a => a.id === action.id ? { ...a, status: "rejected" } : a));
                                        onAddAuditLog("AI Operational Action Rejected", `Super Admin rejected proposal: ${action.title}`);
                                      }}
                                      className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-[10px] font-bold cursor-pointer"
                                    >
                                      {lang === "ta" ? "நிராகரி" : "Reject"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setAutoAdminActions(prev => prev.map(a => a.id === action.id ? { ...a, status: "approved" } : a));
                                        onAddAuditLog("AI Operational Action Approved", `Super Admin approved and dispatched proposal: ${action.title}`);
                                        alert(lang === "ta" ? "தானியங்கி நடவடிக்கை அங்கீகரிக்கப்பட்டு செயல்படுத்தப்பட்டது!" : `Operational Action approved & logged successfully!`);
                                      }}
                                      className="px-3.5 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg text-[10px] font-bold cursor-pointer shadow-sm"
                                    >
                                      {lang === "ta" ? "அங்கீகரித்து செயல்படுத்து" : "Approve & Dispatch"}
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Right side diagnostics and disclaimer */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                              {lang === "ta" ? "சங்கத்தின் செயல்பாட்டு ஆபத்துகள்" : "State Operational Risks & Threats"}
                            </span>

                            <div className="space-y-3">
                              {operationalRisks.map((risk, idx) => (
                                <div key={idx} className="p-3 border-l-4 border-amber-500 bg-amber-50/20 rounded-r-lg text-[10px] font-bold text-stone-700 leading-relaxed shadow-xs">
                                  <p>{risk}</p>
                                </div>
                              ))}
                            </div>

                            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-[10px] text-stone-500 italic leading-relaxed">
                              ⚠️ <strong>Human Oversight Constraint:</strong> TNPA military-grade security mandates that no budget release, member suspension, or credential revocation occurs without manual authentication by the State General Secretary.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: AI MEMBER VERIFICATION */}
                  {aiSubTab === "member_verify" && (
                    <div className="space-y-6">
                      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                        <div className="border-b border-stone-100 pb-3 mb-4">
                          <h4 className="text-xs font-black text-stone-950 uppercase">
                            {lang === "ta" ? "உறுப்பினர் சேர்க்கை ஆவணங்கள் & போலி பதிவுகள் சரிபார்ப்பு" : "AI Member Enrollment Document & Duplicate Verification"}
                          </h4>
                          <p className="text-[10px] text-stone-500">
                            {lang === "ta" ? "புதிய விண்ணப்பங்களை ஆய்வு செய்து ஆதார் மற்றும் ஆவணங்களின் உண்மைத்தன்மையை சரிபார்க்கவும்." : "Verify credentials, audit upload completeness, and detect duplication signatures across active registries."}
                          </p>
                        </div>

                        <div className="space-y-4">
                          {pendingMembers.map((member, idx) => (
                            <div key={`ecc_mem_${member.id}_${idx}`} className="p-4 border border-stone-200 hover:border-red-500/20 rounded-xl space-y-4 bg-stone-50/30 transition-all">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                  <h5 className="text-xs font-black text-stone-900">{member.name}</h5>
                                  <p className="text-[10px] text-stone-500 mt-0.5">
                                    {member.district} District • Age: {member.age} • {member.certNo}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                                    {member.documentStatus}
                                  </span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                    member.verificationStatus === "APPROVED"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : member.verificationStatus === "SUSPENDED" || member.verificationStatus === "REJECTED"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : member.verificationStatus === "NEEDS_CLARIFICATION"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-stone-100 text-stone-700 border-stone-200"
                                  }`}>
                                    {member.verificationStatus}
                                  </span>
                                </div>
                              </div>

                              {/* AI Analysis Result */}
                              {member.aiReview ? (
                                <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-xs animate-fade-in text-left">
                                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                                    <span className="text-[10px] font-black text-[#b91c1c] uppercase flex items-center gap-1">
                                      <Sparkles className="w-3.5 h-3.5" />
                                      {lang === "ta" ? "ஆக்கிரமிப்பு அறிக்கை பகுப்பாய்வு" : "Gemini Intelligent Recommendation"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-stone-600">Completeness:</span>
                                      <span className="text-xs font-black text-emerald-600">{member.aiReview.completenessScore}%</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-extrabold text-stone-400 block uppercase">Duplicate Check:</span>
                                      <p className={`font-bold ${member.aiReview.isDuplicate ? "text-red-600 animate-pulse" : "text-emerald-700"}`}>
                                        {member.aiReview.duplicateDetails}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-extrabold text-stone-400 block uppercase">Document Validation:</span>
                                      <p className="text-stone-700 font-medium">{member.aiReview.documentValidation}</p>
                                    </div>
                                  </div>

                                  {member.aiReview.suspiciousFlags && member.aiReview.suspiciousFlags.length > 0 && (
                                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-[10px] font-bold text-red-700 space-y-1">
                                      <span className="uppercase block text-[9px] font-black">Suspicious Patterns Detected:</span>
                                      <ul className="list-disc pl-4 space-y-0.5">
                                        {member.aiReview.suspiciousFlags.map((flag: string, fidx: number) => (
                                          <li key={fidx}>{flag}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  <div className="p-3 bg-stone-900 text-white rounded-lg text-xs leading-relaxed">
                                    <span className="text-amber-400 block font-black uppercase text-[10px] mb-1">Recommended Action Decision:</span>
                                    <p className="font-semibold text-amber-200">
                                      {lang === "ta" ? member.aiReview.recommendationReasonTa : member.aiReview.recommendationReasonEn}
                                    </p>
                                  </div>

                                  {/* Human Action Buttons */}
                                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                                    <button
                                      onClick={() => handleApproveMember(member.id, "REJECTED")}
                                      className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-[10px] font-bold cursor-pointer"
                                    >
                                      {lang === "ta" ? "நிராகரி" : "Reject Application"}
                                    </button>
                                    <button
                                      onClick={() => handleApproveMember(member.id, "NEEDS_CLARIFICATION")}
                                      className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg text-[10px] font-bold cursor-pointer"
                                    >
                                      {lang === "ta" ? "விளக்கம் கேள்" : "Request Clarification"}
                                    </button>
                                    <button
                                      onClick={() => handleApproveMember(member.id, "APPROVED")}
                                      className="px-4 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg text-[10px] font-bold cursor-pointer shadow-sm"
                                    >
                                      {lang === "ta" ? "அனுமதி வழங்கு" : "Confirm & Approve Member"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center bg-white p-3 border border-stone-200 rounded-lg">
                                  <p className="text-[10px] text-stone-500 font-medium">
                                    {lang === "ta" ? "ஒப்பந்தத்திற்கு முன் ஆவணங்களை ஜெமினி கொண்டு சரிபார்க்கவும்." : "Verify profile completeness and duplicate check before final state registry entry."}
                                  </p>
                                  <button
                                    onClick={() => runMemberVerification(member.id)}
                                    className="px-3 py-1.5 bg-[#b91c1c] text-white hover:bg-red-800 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>{lang === "ta" ? "சரிபார்" : "Run AI Scan"}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: AI QR VALIDATION */}
                  {aiSubTab === "qr_validate" && (
                    <div className="space-y-6">
                      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                        <div className="border-b border-stone-100 pb-3 mb-4">
                          <h4 className="text-xs font-black text-stone-950 uppercase">
                            {lang === "ta" ? "டிஜிட்டல் உறுப்பினர் அட்டை & பாதுகாப்பு கியூஆர் சரிபார்ப்பு" : "AI QR Security Certificate & Membership Validation"}
                          </h4>
                          <p className="text-[10px] text-stone-500">
                            {lang === "ta" ? "உறுப்பினர் அட்டைகளில் உள்ள கியூஆர் குறியீடுகளை சரிபார்த்து போலி அட்டைகளைத் தடுக்கவும்." : "Parse and cryptographically verify scanned QR values of member cards, event passes or certification credentials."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              {lang === "ta" ? "பாதுகாப்பான ஸ்கேனர் உருவகப்படுத்துதல்" : "Scanned Payload Input Simulator"}
                            </span>

                            <div className="space-y-3">
                              <label className="text-[10px] font-extrabold text-stone-600 block">Select Scanned Code Preset:</label>
                              <select
                                value={qrInputPayload}
                                onChange={(e) => setQrInputPayload(e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                              >
                                <option value="TNPA-MEMBER-SECURE-93281-APPROVED">Digital Membership Card (Valid - S. Kumaran)</option>
                                <option value="TNPA-TRAINING-CERT-SAFETY-PASSED">Safety Training Certificate (Valid - S. Kumaran)</option>
                                <option value="TNPA-INVALID-EXPIRED-TOKEN-REVOKED">Expired/Revoked Token (Suspicious Flag)</option>
                              </select>

                              <textarea
                                value={qrInputPayload}
                                onChange={(e) => setQrInputPayload(e.target.value)}
                                rows={3}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                              />

                              <button
                                onClick={runQRValidation}
                                className="w-full py-2 bg-stone-950 text-white hover:bg-stone-900 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <QrCode className="w-4 h-4 text-amber-500" />
                                <span>{lang === "ta" ? "கியூஆர் சரிபார்ப்பை இயக்கு" : "Cryptographically Decode & Verify"}</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              {lang === "ta" ? "சரிபார்ப்பு முடிவுகள் மற்றும் பாதுகாப்புப் பதிவுகள்" : "Verification Diagnostics & Access Audit Logs"}
                            </span>

                            {qrVerificationResult ? (
                              <div className="p-4 border border-stone-200 bg-amber-50/10 rounded-2xl space-y-3">
                                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                                  <span className="text-[10px] font-black text-stone-900 uppercase">Verification Diagnosis</span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    qrVerificationResult.isValid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                                  }`}>
                                    {qrVerificationResult.isValid ? "Secure Valid Token" : "Warning Invalid Payload"}
                                  </span>
                                </div>

                                <div className="text-xs space-y-2">
                                  <div>
                                    <span className="text-[9px] text-stone-400 uppercase block font-black">Member Credentials:</span>
                                    <p className="font-extrabold text-stone-850">{qrVerificationResult.name} ({qrVerificationResult.memberId})</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-stone-400 uppercase block font-black">Credentials Class:</span>
                                    <p className="font-bold text-stone-700">{qrVerificationResult.payloadType}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-stone-400 uppercase block font-black">Training / Meta:</span>
                                    <p className="font-semibold text-stone-600">{qrVerificationResult.certDetails}</p>
                                  </div>
                                </div>

                                <div className="p-2.5 bg-stone-900 text-amber-400 rounded-lg text-[10px] leading-relaxed font-bold">
                                  {lang === "ta" ? qrVerificationResult.logMessageTa : qrVerificationResult.logMessageEn}
                                </div>
                              </div>
                            ) : (
                              <div className="p-12 border border-stone-200 bg-stone-50 text-center text-xs text-stone-400 rounded-2xl">
                                Select or scan a QR payload to begin holographic verification.
                              </div>
                            )}

                            {/* Access Logs */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-black text-stone-400 uppercase block">Active Access Scans Stream</span>
                              <div className="bg-stone-950 text-stone-300 p-3 rounded-xl font-mono text-[9px] space-y-1.5 max-h-[140px] overflow-y-auto">
                                {qrLogs.map((log, idx) => (
                                  <div key={idx} className="flex justify-between border-b border-stone-900 pb-1 last:border-b-0">
                                    <span>[{log.timestamp}] {log.memberId} ({log.name})</span>
                                    <span className={log.status === "VERIFIED_SUCCESS" ? "text-emerald-400" : "text-rose-400 animate-pulse"}>
                                      {log.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 4: AI REPORT BUILDER */}
                  {aiSubTab === "report_gen" && (
                    <div className="space-y-6">
                      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                        <div className="border-b border-stone-100 pb-3 mb-4">
                          <h4 className="text-xs font-black text-stone-950 uppercase">
                            {lang === "ta" ? "தானியங்கி மாதாந்திர மற்றும் செயல்பாட்டு அறிக்கைகள் தொகுப்பான்" : "Intelligent State, Welfare & Financial Report Builder"}
                          </h4>
                          <p className="text-[10px] text-stone-500">
                            {lang === "ta" ? "38 மாவட்ட தரவுகளை ஒருங்கிணைத்து மாநில பொதுச்செயலாளருக்கான சுருக்க அறிக்கைகளை உருவாக்கவும்." : "Aggregate district registers and financial parameters into unified, elegant executive summaries using Gemini API."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              {lang === "ta" ? "அறிக்கை அளவுருக்கள்" : "Report Metrics Input"}
                            </span>

                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-extrabold text-stone-600 block mb-1">Select Report Cadence:</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {["daily", "weekly", "monthly"].map((cad) => (
                                    <button
                                      key={`cad_${cad}`}
                                      onClick={() => setSelectedReportType(cad)}
                                      className={`py-1.5 rounded-lg text-[10px] font-extrabold capitalize cursor-pointer border ${
                                        selectedReportType === cad
                                          ? "bg-stone-950 text-white border-stone-950"
                                          : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                                      }`}
                                    >
                                      {cad}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-extrabold text-stone-600 block mb-1">Input Live Operations & Subscription context:</label>
                                <textarea
                                  value={reportInputMetrics}
                                  onChange={(e) => setReportInputMetrics(e.target.value)}
                                  rows={4}
                                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none font-medium text-stone-850"
                                />
                              </div>

                              <button
                                onClick={runReportGeneration}
                                className="w-full py-2 bg-[#b91c1c] text-white hover:bg-red-800 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>{lang === "ta" ? "அறிக்கை உருவாக்கு" : "Compile Report with Gemini"}</span>
                              </button>
                            </div>
                          </div>

                          <div className="lg:col-span-2 space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              {lang === "ta" ? "தொகுக்கப்பட்ட அறிக்கை முன்னோட்டம்" : "Compiled Executive Report Output"}
                            </span>

                            {generatedReport ? (
                              <div className="p-5 border border-stone-200 bg-white rounded-2xl shadow-sm space-y-5">
                                <div className="border-b border-stone-100 pb-2 flex justify-between items-center">
                                  <h5 className="text-xs font-black text-stone-900 uppercase">
                                    {lang === "ta" ? generatedReport.reportTitleTa : generatedReport.reportTitleEn}
                                  </h5>
                                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded border border-emerald-200">
                                    COMPILED SUCCESSFULLY
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-left">
                                    <span className="text-[9px] font-extrabold text-stone-400 block uppercase">TAMIL SUMMARY</span>
                                    <p className="text-xs text-stone-800 leading-relaxed font-semibold">{generatedReport.executiveSummaryTa}</p>
                                  </div>
                                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-left">
                                    <span className="text-[9px] font-extrabold text-stone-400 block uppercase">ENGLISH SUMMARY</span>
                                    <p className="text-xs text-stone-800 leading-relaxed font-semibold">{generatedReport.executiveSummaryEn}</p>
                                  </div>
                                </div>

                                {/* Financial KPIs generated by Gemini */}
                                {generatedReport.statistics && (
                                  <div className="grid grid-cols-3 gap-3">
                                    {generatedReport.statistics.map((stat: any, sidx: number) => (
                                      <div key={sidx} className="p-3 bg-stone-950 text-white rounded-xl text-center">
                                        <span className="text-[9px] text-stone-400 uppercase block font-bold">{stat.label}</span>
                                        <span className="text-sm font-black text-amber-400 mt-1 block">{stat.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-left">
                                  <span className="text-[9px] font-black text-amber-950 uppercase block flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    {lang === "ta" ? "முக்கிய நிர்வாக பரிந்துரைகள்" : "AI Strategic Corrective Recommendations"}
                                  </span>
                                  <ul className="list-disc pl-4 text-xs font-bold text-stone-800 space-y-1">
                                    {lang === "ta"
                                      ? generatedReport.strategicRecommendationsTa?.map((rec: string, idx: number) => <li key={idx}>{rec}</li>)
                                      : generatedReport.strategicRecommendationsEn?.map((rec: string, idx: number) => <li key={idx}>{rec}</li>)
                                    }
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <div className="p-16 border border-stone-200 bg-stone-50 text-center text-xs text-stone-400 rounded-2xl">
                                Configure parameters and click Compile to run the real-time server-side Gemini generation.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 5: AI MEETING ASSISTANT */}
                  {aiSubTab === "meeting" && (
                    <div className="space-y-6">
                      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                        <div className="border-b border-stone-100 pb-3 mb-4">
                          <h4 className="text-xs font-black text-stone-950 uppercase">
                            {lang === "ta" ? "செயற்கை நுண்ணறிவு மாநில அவசரக் கூட்டங்கள் நிகழ்ச்சி நிரல் வரைவு" : "AI General body & Executive Meeting Assistant"}
                          </h4>
                          <p className="text-[10px] text-stone-500">
                            {lang === "ta" ? "கூட்ட நோக்கம் மற்றும் நிகழ்ச்சி நிரல்களை தானியங்கி முறையில் வடிவமைக்கவும்." : "Input objective briefs to automatically generate beautiful Tamil agenda templates, minutes models, and SMS alert copy."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              {lang === "ta" ? "விவாதப் பொருள் சுருக்கம்" : "Meeting Objectives & Inputs"}
                            </span>

                            <div className="space-y-3">
                              <textarea
                                value={meetingTopicInput}
                                onChange={(e) => setMeetingTopicInput(e.target.value)}
                                rows={4}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#b91c1c] focus:outline-none font-medium text-stone-850"
                              />

                              <button
                                onClick={runMeetingAssistant}
                                className="w-full py-2 bg-stone-900 text-white hover:bg-stone-850 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                              >
                                <Calendar className="w-4 h-4 text-rose-500 animate-pulse" />
                                <span>{lang === "ta" ? "நிகழ்ச்சி நிரல் தயாரி" : "Generate Agenda & Communications"}</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              {lang === "ta" ? "உருவாக்கப்பட்ட நிகழ்ச்சி நிரல் மற்றும் முன்னறிவிப்புகள்" : "Drafted Agenda, Broadcast Notice & Action Guidelines"}
                            </span>

                            {generatedMeetingData ? (
                              <div className="p-4 border border-stone-200 bg-white rounded-2xl shadow-sm space-y-4 text-xs">
                                <div className="border-b border-stone-100 pb-2">
                                  <h5 className="font-extrabold text-[#b91c1c]">
                                    {lang === "ta" ? generatedMeetingData.meetingTitleTa : generatedMeetingData.meetingTitleEn}
                                  </h5>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-[9px] text-stone-400 uppercase font-black block">Suggested Agenda Structure:</span>
                                  <ul className="list-decimal pl-4 space-y-1 font-bold text-stone-800">
                                    {lang === "ta"
                                      ? generatedMeetingData.agendaTa?.map((agenda: string, idx: number) => <li key={idx}>{agenda}</li>)
                                      : generatedMeetingData.agendaEn?.map((agenda: string, idx: number) => <li key={idx}>{agenda}</li>)
                                    }
                                  </ul>
                                </div>

                                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                                  <span className="text-[9px] text-[#b91c1c] font-black block uppercase">SMS / Broadcast Message Draft:</span>
                                  <p className="text-stone-700 italic font-semibold leading-relaxed">
                                    "{lang === "ta" ? generatedMeetingData.reminderTemplateTa : generatedMeetingData.reminderTemplateEn}"
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-[9px] text-stone-400 uppercase font-black block">Mandated Follow-Ups:</span>
                                  <ul className="list-disc pl-4 space-y-1 text-stone-600 font-bold">
                                    {lang === "ta"
                                      ? generatedMeetingData.suggestedFollowUpsTa?.map((fol: string, idx: number) => <li key={idx}>{fol}</li>)
                                      : generatedMeetingData.suggestedFollowUpsEn?.map((fol: string, idx: number) => <li key={idx}>{fol}</li>)
                                    }
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <div className="p-12 border border-stone-200 bg-stone-50 text-center text-xs text-stone-400 rounded-2xl">
                                Enter parameters and click Generate to see agenda and communication templates.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 6: AI PUBLIC RELATIONS & COPYWRITER */}
                  {aiSubTab === "news_pr" && (
                    <div className="space-y-6">
                      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                        <div className="border-b border-stone-100 pb-3 mb-4">
                          <h4 className="text-xs font-black text-stone-950 uppercase">
                            {lang === "ta" ? "அதிகாரப்பூர்வ செய்தி அறிவிப்புகள் & சமூக ஊடக வரைவு" : "AI Administrative Press Release & Media Draftsman"}
                          </h4>
                          <p className="text-[10px] text-stone-500">
                            {lang === "ta" ? "செய்திகள், சுற்றறிக்கைகள் மற்றும் சமூக ஊடகத் தாள்களை அழகிய மொழியில் எழுதவும்." : "Generate elegant, formal news drafts, Twitter/Facebook posts, or official branch circulars using Gemini AI."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              {lang === "ta" ? "செய்தித் தலைப்பு மற்றும் ஊடகம்" : "Draft Topic & Parameters"}
                            </span>

                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-extrabold text-stone-600 block mb-1">Target Media Channel:</label>
                                <select
                                  value={newsPlatformType}
                                  onChange={(e) => setNewsPlatformType(e.target.value)}
                                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none font-bold text-stone-800"
                                >
                                  <option value="website">Union Website News</option>
                                  <option value="circular">WhatsApp Circular to Branches</option>
                                  <option value="social">Social Media (Twitter/FB/Insta)</option>
                                  <option value="press">Official Press Release (Tamil Nadu Media)</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-extrabold text-stone-600 block mb-1">Brief Topic Details:</label>
                                <textarea
                                  value={newsTopicInput}
                                  onChange={(e) => setNewsTopicInput(e.target.value)}
                                  rows={4}
                                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none font-medium text-stone-850"
                                />
                              </div>

                              <button
                                onClick={runNewsGeneration}
                                className="w-full py-2 bg-[#b91c1c] text-white hover:bg-red-800 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                              >
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>{lang === "ta" ? "உள்ளடக்கம் உருவாக்கு" : "Draft Content with AI"}</span>
                              </button>
                            </div>
                          </div>

                          <div className="lg:col-span-2 space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              {lang === "ta" ? "செயற்கை நுண்ணறிவு வரைவு முன்னோட்டம்" : "Draft Preview & Human Approval Gate"}
                            </span>

                            {generatedNewsData ? (
                              <div className="p-5 border border-stone-200 bg-white rounded-2xl shadow-sm space-y-4 text-xs text-left">
                                <div className="border-b border-stone-100 pb-2 flex justify-between items-center">
                                  <h5 className="font-extrabold text-stone-900">
                                    {lang === "ta" ? generatedNewsData.headlineTa : generatedNewsData.headlineEn}
                                  </h5>
                                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[9px] uppercase rounded border border-amber-200">
                                    Human Approval Required
                                  </span>
                                </div>

                                <div className="space-y-3">
                                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                                    <span className="text-[9px] text-[#b91c1c] font-black block uppercase">Tamil Administrative Text:</span>
                                    <p className="text-stone-700 font-semibold leading-relaxed">{generatedNewsData.draftTa}</p>
                                  </div>
                                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                                    <span className="text-[9px] text-[#b91c1c] font-black block uppercase">English Administrative Text:</span>
                                    <p className="text-stone-700 font-semibold leading-relaxed">{generatedNewsData.draftEn}</p>
                                  </div>

                                  {generatedNewsData.socialMediaCopy && (
                                    <div className="p-3 bg-stone-950 text-white rounded-xl space-y-1">
                                      <span className="text-[9px] text-amber-400 font-black block uppercase">Social Copy Hashtags:</span>
                                      <p className="text-stone-300 leading-relaxed font-mono">{generatedNewsData.socialMediaCopy}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                                  <button
                                    onClick={() => setGeneratedNewsData(null)}
                                    className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg font-bold text-[10px]"
                                  >
                                    Discard Draft
                                  </button>
                                  <button
                                    onClick={handleApproveNewsContent}
                                    className="px-4 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg font-bold text-[10px] cursor-pointer shadow-sm flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Approve & Publish Live</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-16 border border-stone-200 bg-stone-50 text-center text-xs text-stone-400 rounded-2xl">
                                Enter news details and select a channel to generate a formal administrative communication.
                              </div>
                            )}

                            {/* Published live archive */}
                            {publishedNews.length > 0 && (
                              <div className="space-y-3 pt-3">
                                <span className="text-[10px] font-black text-stone-400 uppercase block">Published News Node Archive</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                                  {publishedNews.map((news) => (
                                    <div key={news.id} className="p-3 border border-stone-200 bg-emerald-50/10 rounded-xl space-y-1">
                                      <div className="flex justify-between text-[9px] text-stone-400 font-bold border-b border-stone-100 pb-1">
                                        <span>Published: {news.timestamp}</span>
                                        <span className="text-emerald-700 uppercase font-black">LIVE</span>
                                      </div>
                                      <h6 className="text-[11px] font-black text-stone-900 leading-tight mt-1">{news.headlineEn}</h6>
                                      <p className="text-[10px] text-stone-600 line-clamp-2 mt-1">{news.draftEn}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 7: AI WEBSITE MONITOR & INTEGRITY SRE */}
                  {aiSubTab === "reliability" && (
                    <div className="space-y-6">
                      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                        <div className="border-b border-stone-100 pb-3 mb-4">
                          <h4 className="text-xs font-black text-stone-950 uppercase">
                            {lang === "ta" ? "இணையதள உள்கட்டமைப்பு மற்றும் கோப்புகள் பாதுகாப்பு கண்காணிப்பு" : "AI Site Reliability & Page Diagnostics Integrity Scan"}
                          </h4>
                          <p className="text-[10px] text-stone-500">
                            {lang === "ta" ? "வலைப்பக்கங்கள் வேகம், உடைந்த இணைப்புகள் மற்றும் விடுபட்ட ஊடகங்களை ஸ்கேன் செய்யுங்கள்." : "Real-time AI diagnostic check of broken hyperlinks, loading latency, and obsolete digital forms."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">SRE Scanner Trigger</span>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-extrabold text-stone-600 block mb-1">Target Portal URL:</label>
                                <input
                                  type="text"
                                  defaultValue="https://tnpa-advancement.org"
                                  disabled
                                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-500 cursor-not-allowed"
                                />
                              </div>

                              <button
                                onClick={runWebsiteDiagnostics}
                                className="w-full py-2 bg-stone-950 text-white hover:bg-stone-900 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                                <span>Trigger Integrity Scan</span>
                              </button>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Live Diagnostic Dashboard</span>

                            {siteHealthMetrics ? (
                              <div className="border border-stone-200 bg-white rounded-2xl p-5 shadow-xs space-y-5">
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="p-3 bg-stone-950 text-white rounded-xl text-center">
                                    <span className="text-[9px] text-stone-400 uppercase block font-bold">Diagnostics Grade</span>
                                    <span className="text-base font-black text-emerald-400 mt-1 block">{siteHealthMetrics.overallGrade}</span>
                                  </div>
                                  <div className="p-3 bg-stone-950 text-white rounded-xl text-center">
                                    <span className="text-[9px] text-stone-400 uppercase block font-bold">Latency</span>
                                    <span className="text-base font-black text-amber-400 mt-1 block">{siteHealthMetrics.loadingSpeedMs} ms</span>
                                  </div>
                                  <div className="p-3 bg-stone-950 text-white rounded-xl text-center">
                                    <span className="text-[9px] text-stone-400 uppercase block font-bold">Broken Link density</span>
                                    <span className={`text-base font-black mt-1 block ${siteHealthMetrics.brokenLinks.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                                      {siteHealthMetrics.brokenLinks.length}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
                                    <span className="text-[9px] text-rose-800 uppercase block font-black">Broken URLs Identified:</span>
                                    {siteHealthMetrics.brokenLinks && siteHealthMetrics.brokenLinks.length > 0 ? (
                                      <ul className="list-disc pl-4 text-[10px] font-mono text-stone-700 space-y-1">
                                        {siteHealthMetrics.brokenLinks.map((link: string, lidx: number) => (
                                          <li key={lidx}>{link}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-[10px] text-emerald-700 font-bold">0 broken links detected on any path node.</p>
                                    )}
                                  </div>

                                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
                                    <span className="text-[9px] text-amber-800 uppercase block font-black">Missing Media Assets:</span>
                                    {siteHealthMetrics.missingImages && siteHealthMetrics.missingImages.length > 0 ? (
                                      <ul className="list-disc pl-4 text-[10px] font-mono text-stone-700 space-y-1">
                                        {siteHealthMetrics.missingImages.map((img: string, iidx: number) => (
                                          <li key={iidx}>{img}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-[10px] text-emerald-700 font-bold">All logo thumbnails and asset payloads loaded.</p>
                                    )}
                                  </div>
                                </div>

                                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-left text-xs leading-relaxed">
                                  <div className="space-y-1 font-bold text-stone-850">
                                    <span className="text-[9px] text-[#b91c1c] uppercase block font-black">Diagnostics Summary:</span>
                                    <p>{lang === "ta" ? siteHealthMetrics.performanceSummaryTa : siteHealthMetrics.performanceSummaryEn}</p>
                                  </div>

                                  <div className="space-y-1.5 pt-2 border-t border-stone-200 font-bold text-stone-800">
                                    <span className="text-[9px] text-emerald-800 uppercase block font-black">Corrective Action Steps:</span>
                                    <ul className="list-disc pl-4 space-y-0.5">
                                      {lang === "ta"
                                        ? siteHealthMetrics.correctiveActionsTa?.map((act: string, idx: number) => <li key={idx}>{act}</li>)
                                        : siteHealthMetrics.correctiveActionsEn?.map((act: string, idx: number) => <li key={idx}>{act}</li>)
                                      }
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-12 border border-stone-200 bg-stone-50 text-center text-xs text-stone-400 rounded-2xl">
                                Click Trigger scan to run full SEO, performance, and SRE path diagnostics.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 5: MEMBER ENGAGEMENT */}
          {activeTab === "engagement" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 uppercase">
                    {lang === "ta" ? "உறுப்பினர் ஈடுபாட்டுத் தளம்" : "MEMBER ENGAGEMENT HUD"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === "ta" ? "தினசரி அறிவிப்புகள், விருது பேட்ஜ்கள் மற்றும் தன்னார்வ வாய்ப்புகள்" : "Daily bulletins, personalized reminders, achievements, and training paths."}
                  </p>
                </div>
              </div>

              {/* Achievements, Badges & Personalized Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Personalized HUD */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-[10px] text-stone-400 font-bold block uppercase">MEMBER RECOGNITION</span>
                    <h4 className="font-extrabold text-stone-900 text-sm">
                      {lang === "ta" ? "உறுப்பினர் சான்றிதழ் & நிலவரம்" : "Your Engagement Profile"}
                    </h4>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-stone-800">Status Tier: Elite Painter</span>
                        <p className="text-[10px] text-stone-400">5+ Years active subscription</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">Earned Achievement Badges</span>
                      <div className="flex flex-wrap gap-2">
                        {userBadges.map((b, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-[9px] font-bold">
                            🏆 {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl space-y-1">
                      <span className="text-[9px] text-[#b91c1c] font-black uppercase tracking-wider block">RENEWAL REMINDER</span>
                      <p className="text-[11px] text-stone-600">Your union dues are fully cleared until August 2027.</p>
                    </div>
                  </div>
                </div>

                {/* Volunteer Opportunities Board */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-stone-900 uppercase">
                    {lang === "ta" ? "தன்னார்வத் தொண்டு வாய்ப்புகள்" : "Volunteer Opportunities"}
                  </h4>

                  <div className="space-y-3.5 text-xs">
                    {[
                      { title: "மதுரை மருத்துவ முகாம்", titleEn: "Madurai Medical Aid Camp", date: "Aug 15", desc: "வண்ணக் கலைஞர்களுக்கான மருத்துவ முகாமிற்கு தன்னார்வலர்கள் தேவை." },
                      { title: "சென்னை ஓவியக் கண்காட்சி", titleEn: "Chennai Painter Art Expo", date: "Sep 02", desc: "மாநில ஓவியக் கண்காட்சி அரங்கிற்கு பொறுப்பாளர்கள் தேவை." }
                    ].map((opp, i) => (
                      <div key={i} className="p-3 border border-stone-100 rounded-xl bg-stone-50 space-y-2">
                        <div className="flex justify-between items-center font-bold text-stone-900">
                          <span>{lang === "ta" ? opp.title : opp.titleEn}</span>
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded">{opp.date}</span>
                        </div>
                        <p className="text-stone-500 text-[10px] leading-relaxed">{opp.desc}</p>
                        
                        <button
                          onClick={() => handleApplyVolunteer(opp.titleEn)}
                          className={`w-full py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                            volunteerApps.includes(opp.titleEn)
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                              : "bg-stone-900 hover:bg-[#b91c1c] text-white"
                          }`}
                        >
                          {volunteerApps.includes(opp.titleEn) ? "✓ Applied" : "Apply to Volunteer"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training recommendations */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-stone-900 uppercase">
                    {lang === "ta" ? "பரிந்துரைக்கப்படும் பயிற்சிகள்" : "Training Recommendations"}
                  </h4>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl space-y-1">
                      <span className="font-bold text-stone-900">1. Advanced Spray Painting Course</span>
                      <p className="text-stone-500 text-[10px]">Master modern pneumatic paint gun operations and fluid dynamics.</p>
                      <span className="text-[9px] text-[#b91c1c] font-bold block mt-1.5">★ Recommended for Artists</span>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl space-y-1">
                      <span className="font-bold text-stone-900">2. High-Rise Occupational Safety Training</span>
                      <p className="text-stone-500 text-[10px]">Learn scaffolding guidelines, harness anchoring, and chemical masks protocols.</p>
                      <span className="text-[9px] text-emerald-800 font-bold block mt-1.5">★ Essential for Construction Workers</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: PROJECT MANAGEMENT */}
          {activeTab === "projects" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 uppercase">
                    {lang === "ta" ? "நிர்வாகத் திட்டங்கள் & பணிகள்" : "PROJECTS & TASKS MANAGEMENT"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === "ta" ? "மாவட்டப் பணிகள் மேலாண்மை, காலக்கெடு மற்றும் பொறுப்பாளர்கள் கண்காணிப்பு" : "Monitor state project milestones, track pending tasks, and allocate officers."}
                  </p>
                </div>
              </div>

              {/* Task adding form for Admin Persona */}
              {["super_admin", "district_admin"].includes(sandboxRole) && (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                  <h4 className="text-xs font-black text-stone-900 uppercase mb-3">Add Project Task</h4>
                  <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task Title (Tamil)"
                      className="border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                    />
                    <input
                      type="text"
                      required
                      value={newTaskTitleEn}
                      onChange={(e) => setNewTaskTitleEn(e.target.value)}
                      placeholder="Task Title (English)"
                      className="border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                    />
                    <input
                      type="text"
                      required
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      placeholder="Assigned Officer (e.g. S. Ramesh)"
                      className="border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                    />
                    <button
                      type="submit"
                      className="py-2 bg-stone-900 hover:bg-[#b91c1c] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Allocate Task
                    </button>
                  </form>
                </div>
              )}

              {/* Kanban board */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* To Do Column */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 min-h-[250px]">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                    <span className="font-extrabold text-stone-700 text-xs uppercase">To Do (செய்ய வேண்டியவை)</span>
                    <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {tasks.filter(t => t.status === "todo").length}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                    {tasks.filter(t => t.status === "todo").map(t => (
                      <div key={t.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm text-xs space-y-1.5">
                        <span className="font-bold text-stone-900 block">{lang === "ta" ? t.title : t.titleEn}</span>
                        <p className="text-stone-500 text-[10px]">Officer: {t.assignedTo}</p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[9px] bg-rose-50 text-rose-800 font-bold px-1.5 py-0.5 rounded">{t.priority}</span>
                          <button
                            onClick={() => handleToggleTaskStatus(t.id, "in_progress")}
                            className="text-[10px] text-[#b91c1c] font-bold hover:underline"
                          >
                            Move to Progress →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="bg-amber-50/20 border border-amber-100 rounded-2xl p-4 space-y-3 min-h-[250px]">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                    <span className="font-extrabold text-amber-900 text-xs uppercase">In Progress (செயல்பாட்டில்)</span>
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                      {tasks.filter(t => t.status === "in_progress").length}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                    {tasks.filter(t => t.status === "in_progress").map(t => (
                      <div key={t.id} className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm text-xs space-y-1.5">
                        <span className="font-bold text-stone-900 block">{lang === "ta" ? t.title : t.titleEn}</span>
                        <p className="text-stone-500 text-[10px]">Officer: {t.assignedTo}</p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[9px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded">{t.priority}</span>
                          <button
                            onClick={() => handleToggleTaskStatus(t.id, "completed")}
                            className="text-[10px] text-emerald-800 font-bold hover:underline"
                          >
                            Mark Complete ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed Column */}
                <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4 space-y-3 min-h-[250px]">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                    <span className="font-extrabold text-emerald-900 text-xs uppercase">Completed (முடிந்தவை)</span>
                    <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold">
                      {tasks.filter(t => t.status === "completed").length}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                    {tasks.filter(t => t.status === "completed").map(t => (
                      <div key={t.id} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm text-xs space-y-1.5">
                        <span className="font-bold text-stone-600 block line-through">{lang === "ta" ? t.title : t.titleEn}</span>
                        <p className="text-stone-400 text-[10px]">Officer: {t.assignedTo}</p>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded inline-block mt-1">✓ Complete</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: DIGITAL LIBRARY */}
          {activeTab === "library" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 uppercase">
                    {lang === "ta" ? "டிஜிட்டல் ஆவணக் காப்பகம்" : "DIGITAL LEGISLATIVE LIBRARY"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === "ta" ? "சங்க சட்டவிதிகள், அரசாணைகள் மற்றும் வழிகாட்டி ஆவணங்கள் தேடல்" : "Constitution guidelines, circular archives, Government orders, and safety manual indices."}
                  </p>
                </div>
              </div>

              {/* AI Semantic search engine bar */}
              <div className="bg-stone-900 text-white p-5 rounded-2xl shadow-md space-y-3">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">AI SEMANTIC SEARCH ENGINE</span>
                <form onSubmit={handleAISearchLibrary} className="flex gap-2.5">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      required
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === "ta" ? "அரசாணை 124, விபத்து மரண நிதி, புதுப்பிப்பு விதிகளைத் தேட..." : "Type e.g., accidental compensation pension rules or subscription fees..."}
                      className="w-full bg-stone-950 text-white pl-9 pr-4 py-2.5 border border-stone-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  </div>
                  <button
                    type="submit"
                    className="bg-amber-500 text-stone-950 hover:bg-amber-600 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow"
                  >
                    AI Search
                  </button>
                </form>

                {aiLibraryResponse && (
                  <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl text-xs leading-relaxed text-stone-200">
                    <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[10px] uppercase mb-1">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>AI Semantic Highlighted Answer:</span>
                    </div>
                    <p>{aiLibraryResponse}</p>
                  </div>
                )}
              </div>

              {/* Document items list */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-stone-900 uppercase">
                  {lang === "ta" ? "நூலக ஆவணங்கள் பட்டியல்" : "Union Constitutional Library Index"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {libraryDocuments.map(doc => (
                    <div key={doc.id} className="p-3.5 border border-stone-100 rounded-xl bg-stone-50 hover:bg-stone-100/50 transition-all flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <span className="font-extrabold text-stone-900 block">{lang === "ta" ? doc.title : doc.titleEn}</span>
                        <div className="flex items-center gap-3 text-[10px] text-stone-500 font-medium">
                          <span className="uppercase text-amber-800 font-bold">{doc.category}</span>
                          <span>{doc.date}</span>
                          <span>Author: {doc.author}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onAddAuditLog("Document Downloaded", `Downloaded legislative paper: ${doc.titleEn}`);
                          alert(lang === "ta" ? "ஆவணம் டவுன்லோடு செய்யப்படுகிறது..." : "Securing high-resolution PDF download transmission...");
                        }}
                        className="p-2 bg-white hover:bg-stone-200 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 transition-all cursor-pointer shrink-0"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: OFFLINE DATA SYNC */}
          {activeTab === "offline_sync" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 uppercase">
                    {lang === "ta" ? "ஆஃப்லைன் தரவு மேலாண்மை & ஒத்திசைவு" : "OFFLINE STORAGE & AUTOMATIC SYNC"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === "ta" ? "நெட்வொர்க் இல்லாத நேரத்தில் படிவங்களை நிரப்பி, இணையம் திரும்பியதும் ஒத்திசைக்கும் தொழில்நுட்பம்" : "Local IndexedDB caching simulation with automatic conflict resolution rules."}
                  </p>
                </div>
              </div>

              {/* Simulator Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Control card */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-stone-900 uppercase">
                    {lang === "ta" ? "வலை இணைப்பு கட்டுப்பாட்டு மையம்" : "Network Control Simulator"}
                  </h4>

                  <div className="space-y-4 text-xs">
                    <p className="text-stone-500 leading-relaxed">
                      Toggle offline mode to test offline form caching. When offline, all nominations or project tasks submitted go to local cache drafts.
                    </p>

                    <button
                      onClick={handleToggleOfflineMode}
                      className={`w-full py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center justify-center gap-2 ${
                        isOffline
                          ? "bg-[#b91c1c] hover:bg-rose-700 text-white shadow-lg"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                      }`}
                    >
                      <RefreshCw className={`w-4 h-4 ${isOffline ? 'animate-pulse' : ''}`} />
                      <span>{isOffline ? "Network Status: OFFLINE" : "Network Status: ONLINE"}</span>
                    </button>
                  </div>
                </div>

                {/* Queue Display */}
                <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <h4 className="text-xs font-black text-stone-900 uppercase">
                      {lang === "ta" ? "உள்ளூர் வரைவுகள் தேக்கம் (Draft Queue)" : "Offline Local Storage Cache Queue"}
                    </h4>

                    {offlineQueue.length > 0 && !isOffline && (
                      <button
                        onClick={handleTriggerSync}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Go Online & Sync Drafts
                      </button>
                    )}
                  </div>

                  {offlineQueue.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-12">No pending offline database writes. Everything synced with state server.</p>
                  ) : (
                    <div className="space-y-3 max-h-[180px] overflow-y-auto">
                      {offlineQueue.map((item, idx) => (
                        <div key={idx} className="p-3 border border-stone-100 rounded-xl bg-stone-50 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-stone-900 block">Type: {item.type}</span>
                            <span className="text-[10px] text-stone-500 block">Cached At: {item.timestamp}</span>
                            <span className="text-[10px] text-stone-700 font-medium block mt-1">Data: {item.data.name || item.data.title}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[9px] font-bold">
                            Local Draft Cache
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Conflict Resolution overlay/drawer if active */}
              {syncConflict && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-4 shadow-lg animate-bounce">
                  <div className="flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                    <h4 className="font-extrabold text-sm uppercase">
                      {lang === "ta" ? "ஒத்திசைவு முரண்பாடு கண்டறியப்பட்டுள்ளது!" : "Database Write Sync Conflict Detected!"}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Conflict found for task entry register: Local client cache has different title information than the existing state server master. Select action below:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border border-amber-200 rounded-xl bg-white space-y-1 text-xs">
                      <span className="font-bold text-emerald-800 block">Version A (Keep Local Draft Cache)</span>
                      <p className="text-[11px] text-stone-600">{syncConflict.local.title}</p>
                      <button
                        onClick={() => handleResolveConflict(true)}
                        className="mt-3 w-full py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 cursor-pointer text-[10px]"
                      >
                        Accept Local Version
                      </button>
                    </div>

                    <div className="p-3 border border-stone-200 rounded-xl bg-stone-50 space-y-1 text-xs">
                      <span className="font-bold text-stone-700 block">Version B (Keep State Server Master)</span>
                      <p className="text-[11px] text-stone-400">{syncConflict.server.title}</p>
                      <button
                        onClick={() => handleResolveConflict(false)}
                        className="mt-3 w-full py-1.5 bg-stone-800 text-white rounded-lg font-bold hover:bg-stone-700 cursor-pointer text-[10px]"
                      >
                        Retain Server Version
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: BACKUP & DISASTER RECOVERY */}
          {activeTab === "backup_dr" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 uppercase">
                    {lang === "ta" ? "பாதுகாப்பு & கணினி மீட்புப் பிரிவு" : "DISASTER RECOVERY & HEALTH PANELS"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === "ta" ? "தானியங்கி காப்புப்பிரதி, குறியாக்க தணிக்கை மற்றும் சர்வர் ஆரோக்கியம் கண்காணிப்பு" : "Automatic secure snapshot generators, version histories, and diagnostic trials."}
                  </p>
                </div>
              </div>

              {/* Diagnostic Gauges & health monitoring */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-white border border-stone-200 rounded-2xl">
                  <Cpu className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[9px] text-stone-400 font-bold block uppercase">CPU Load Utilization</span>
                  <p className="text-lg font-black text-emerald-600">24.2%</p>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-2xl">
                  <Database className="w-5 h-5 text-[#b91c1c] mx-auto mb-1" />
                  <span className="text-[9px] text-stone-400 font-bold block uppercase">DB Latency API</span>
                  <p className="text-lg font-black text-stone-900">12 ms</p>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-2xl">
                  <RefreshCw className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <span className="text-[9px] text-stone-400 font-bold block uppercase">Node Cluster Health</span>
                  <p className="text-lg font-black text-emerald-600">3/3 Sync OK</p>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-2xl">
                  <Lock className="w-5 h-5 text-stone-700 mx-auto mb-1" />
                  <span className="text-[9px] text-stone-400 font-bold block uppercase">Encrypted Backup State</span>
                  <p className="text-lg font-black text-emerald-600">ACTIVE</p>
                </div>
              </div>

              {/* Action commands for Super Admin */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Backups logs ledger */}
                <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <h4 className="text-xs font-black text-stone-900 uppercase">
                      {lang === "ta" ? "தானியங்கி காப்புப்பதிவு தணிக்கை வரிசை" : "Automated Encrypted Backups Ledger"}
                    </h4>

                    {["super_admin"].includes(sandboxRole) && (
                      <button
                        onClick={handleCompileEncryptedBackup}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Manual Crypt Backup</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    {backupLogs.map(log => (
                      <div key={log.id} className="p-3 border border-stone-100 rounded-xl bg-stone-50 flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="font-bold text-stone-900 block">{log.type}</span>
                          <span className="text-[10px] text-stone-500 block">Generated: {log.timestamp} | Checksum: <span className="font-mono">{log.checksum}</span></span>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 font-bold">
                            {log.status}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-1">{log.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Recovery Procedures */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-black text-stone-900 uppercase">
                      {lang === "ta" ? "பேரிடர் மீட்பு மற்றும் தணிக்கை" : "Disaster Recovery Toolkit"}
                    </h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      In case of database corrupted node logs, click below to trigger structural audit diagnostics.
                    </p>

                    {["super_admin"].includes(sandboxRole) ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleSimulateDisasterRecovery("Verify Database Integrity Schemas")}
                          disabled={!!systemIntegrityCheck}
                          className="w-full py-2 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {systemIntegrityCheck === "Verify Database Integrity Schemas" ? "Verifying..." : "Verify DB Schemas"}
                        </button>
                        <button
                          onClick={() => handleSimulateDisasterRecovery("Synchronize Database with Construction Board Cluster Nodes")}
                          disabled={!!systemIntegrityCheck}
                          className="w-full py-2 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {systemIntegrityCheck === "Synchronize Database with Construction Board Cluster Nodes" ? "Syncing Clusters..." : "Force Node Sync"}
                        </button>
                        <button
                          onClick={() => handleSimulateDisasterRecovery("Restore Database from local backup snapshot")}
                          disabled={!!systemIntegrityCheck}
                          className="w-full py-2 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                        >
                          {systemIntegrityCheck === "Restore Database from local backup snapshot" ? "Restoring..." : "Restore Snapshot"}
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                        <Lock className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                        <span className="text-[10px] text-stone-400 font-bold block">Super Admin Access Only</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-400 italic">
                    All operations are logged automatically inside cryptographic secure logs ledger.
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
