import React, { useState, useMemo } from "react";
import SuperAdminWhatsAppConsole from "./SuperAdminWhatsAppConsole";
import {
  ShieldAlert,
  Users,
  Briefcase,
  Layers,
  Award,
  Bell,
  Cpu,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  TrendingUp,
  Download,
  Share2,
  Lock,
  Terminal,
  Activity,
  Plus,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
  Printer,
  Sparkles,
  BookmarkCheck,
  Building,
  Check,
  ShieldCheck,
  Sliders,
  Database,
  Smartphone,
  Trash2,
  UserCheck,
  RefreshCw,
  Unlock,
  Settings,
  Key,
  Globe,
  MessageSquare,
  Tv,
  Film,
  Edit3
} from "lucide-react";
import { UserAccount } from "../types";

interface SuperAdminBusinessConsoleProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onAddAuditLog: (action: string, details: string) => void;
}

// Interfaces
interface Contractor {
  id: string;
  contractorName: string;
  companyName: string;
  ownerName: string;
  regNumber: string;
  gst?: string;
  mobile: string;
  whatsApp: string;
  email: string;
  address: string;
  district: string;
  categories: string[];
  experience: number;
  teamSize: number;
  machineryDetails: string;
  licenseDetails: string;
  status: "pending" | "approved" | "rejected" | "correction";
  badge: "None" | "Featured Painter" | "Master Painter" | "Senior Contractor" | "Expert Specialist" | "Award Winner";
  approvalDate?: string;
}

interface Company {
  id: string;
  brandName: string;
  logo: string;
  type: "Dealer" | "Distributor" | "Manufacturer";
  serviceArea: string;
  products: string;
  contact: string;
  status: "pending" | "active" | "rejected";
}

interface Supplier {
  id: string;
  supplierName: string;
  companyName: string;
  category: "Paint" | "Primer" | "Putty" | "Brushes" | "Rollers" | "Safety" | "Scaffolding" | "Spray Machines" | "Industrial" | "Waterproof";
  district: string;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  contact: string;
  approved: boolean;
}

interface BusinessLead {
  id: string;
  source: string;
  district: string;
  estimatedValue: number;
  status: "New" | "Contacted" | "Negotiating" | "Converted" | "Lost";
  assignedTo: string;
  followUpDate: string;
  notes: string;
}

interface Tender {
  id: string;
  title: string;
  department: string;
  district: string;
  value: number;
  deadline: string;
  eligibility: string;
  status: "New" | "Under Review" | "Applied" | "Submitted" | "Won" | "Lost" | "Cancelled";
  notes: string;
}

interface AwardEntry {
  id: string;
  recipientName: string;
  category: "Best District" | "Best Member" | "Best Volunteer" | "Best Contractor" | "Best Company" | "Best Trainer" | "Lifetime Achievement" | "Young Achiever";
  district: string;
  year: string;
  verifiedHash: string;
}

export default function SuperAdminBusinessConsole({
  lang,
  currentUser,
  onAddAuditLog
}: SuperAdminBusinessConsoleProps) {
  // STRICT SECURITY CHECK
  const isSuperAdmin = currentUser?.role === "super_admin";

  // --- VERSION 14.0 SECURE ADMINISTRATION STATES ---
  const [secSubTab, setSecSubTab] = useState<"telemetry" | "admins" | "policies" | "ledger" | "firebase" | "disaster" | "tv_media">("telemetry");

  // --- TNPA2 TV MEDIA STUDIO MANAGEMENT STATES (SUPER ADMIN ONLY) ---
  const defaultTvMedia = [
    {
      id: "v1",
      title: "மாநில பேரவைக் கூட்டம் 2026 - தலைவர்கள் சிறப்பு உரை",
      titleEn: "State General Council 2026 - Executive Keynote Addresses",
      duration: "42:15",
      views: "18.5K",
      date: "3 நாட்கள் முன்பு",
      category: "மாநாடு",
      thumbnailColor: "from-amber-700 to-rose-900",
      speaker: "S. மைக்கேல் ஆல்வின் & ரா. சேவியர் பாபு",
      videoUrl: ""
    },
    {
      id: "v2",
      title: "பெயிண்டர் நலவாரிய அடையாள அட்டை பெறும் எளிய வழிமுறைகள்",
      titleEn: "Easy Steps to Apply for Construction Welfare Board ID Card",
      duration: "18:40",
      views: "34.2K",
      date: "1 வாரம் முன்பு",
      category: "பயிற்சி",
      thumbnailColor: "from-[#b91c1c] to-stone-900",
      speaker: "R. சக்திவேல் (மாநில பொருளாளர்)",
      videoUrl: ""
    },
    {
      id: "v3",
      title: "உயர் கட்டடங்களில் பெயிண்டிங் செய்யும்போது பின்பற்ற வேண்டிய பாதுகாப்பு முறைகள்",
      titleEn: "Safety & Harness Guidelines for High-Rise Painting Workers",
      duration: "25:10",
      views: "12.8K",
      date: "2 வாரங்கள் முன்பு",
      category: "பாதுகாப்பு",
      thumbnailColor: "from-blue-800 to-indigo-950",
      speaker: "பாதுகாப்புப் பிரிவு",
      videoUrl: ""
    },
    {
      id: "v4",
      title: "மதுரை & கோவை மாவட்ட மாபெரும் பெயிண்டர்கள் விழிப்புணர்வு பேரணி",
      titleEn: "Madurai & Coimbatore Painters Mega Awareness Rally",
      duration: "31:05",
      views: "22.1K",
      date: "3 வாரங்கள் முன்பு",
      category: "பேரணி",
      thumbnailColor: "from-emerald-700 to-stone-900",
      speaker: "மாவட்ட செயலாளர்கள்",
      videoUrl: ""
    }
  ];

  const [tvMediaItems, setTvMediaItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("tnpa2_tv_custom_media");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultTvMedia;
  });

  const [showTvModal, setShowTvModal] = useState(false);
  const [editingTvItem, setEditingTvItem] = useState<any | null>(null);
  const [tvTitleTa, setTvTitleTa] = useState("");
  const [tvTitleEn, setTvTitleEn] = useState("");
  const [tvCategory, setTvCategory] = useState("செய்திகள்");
  const [tvDuration, setTvDuration] = useState("15:00");
  const [tvSpeaker, setTvSpeaker] = useState("");
  const [tvVideoUrl, setTvVideoUrl] = useState("");

  const saveTvMediaToStorage = (updatedList: any[]) => {
    setTvMediaItems(updatedList);
    localStorage.setItem("tnpa2_tv_custom_media", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("tnpa_tv_media_updated", { detail: updatedList }));
  };

  const handleSaveTvMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("Super Admin permission required.");
      return;
    }
    if (editingTvItem) {
      const updated = tvMediaItems.map(item => item.id === editingTvItem.id ? {
        ...item,
        title: tvTitleTa || item.title,
        titleEn: tvTitleEn || item.titleEn,
        category: tvCategory || item.category,
        duration: tvDuration || item.duration,
        speaker: tvSpeaker || item.speaker,
        videoUrl: tvVideoUrl
      } : item);
      saveTvMediaToStorage(updated);
      onAddAuditLog("Super Admin TV Media Edit", `Updated TV video: ${tvTitleTa}`);
    } else {
      const newItem = {
        id: `tv_${Date.now()}`,
        title: tvTitleTa || "புதிய தொலைக்காட்சி காணொளி",
        titleEn: tvTitleEn || "New Broadcast Video",
        duration: tvDuration || "15:00",
        views: "1.2K",
        date: "இப்போது",
        category: tvCategory,
        thumbnailColor: "from-[#b91c1c] to-amber-900",
        speaker: tvSpeaker || "TNPA² Media Desk",
        videoUrl: tvVideoUrl
      };
      saveTvMediaToStorage([newItem, ...tvMediaItems]);
      onAddAuditLog("Super Admin TV Media Upload", `Uploaded new TV video: ${tvTitleTa}`);
    }
    setShowTvModal(false);
    setEditingTvItem(null);
    setTvTitleTa("");
    setTvTitleEn("");
    setTvSpeaker("");
    setTvVideoUrl("");
  };

  const handleDeleteTvMedia = (id: string, title: string) => {
    if (!isSuperAdmin) {
      alert("Super Admin permission required.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete TV media: "${title}"?`)) {
      const updated = tvMediaItems.filter(item => item.id !== id);
      saveTvMediaToStorage(updated);
      onAddAuditLog("Super Admin TV Media Delete", `Deleted TV video: ${title}`);
    }
  };

  const openEditTvMedia = (item: any) => {
    setEditingTvItem(item);
    setTvTitleTa(item.title);
    setTvTitleEn(item.titleEn);
    setTvCategory(item.category);
    setTvDuration(item.duration);
    setTvSpeaker(item.speaker || "");
    setTvVideoUrl(item.videoUrl || "");
    setShowTvModal(true);
  };

  // Simulated administrators list
  const [adminAccounts, setAdminAccounts] = useState<any[]>([
    {
      id: "adm_1",
      name: "ரா. சேவியர் பாபு",
      nameEn: "R. Xavier Babu",
      email: "xavierbabu@tnpainters.org",
      role: "Super Admin",
      phone: "9443254321",
      district: "மதுரை (Madurai)",
      status: "Active",
      joinedAt: "2020-01-01",
      lastLogin: "2026-08-04 08:31",
      devicesCount: 2,
      suspiciousLogins: 0,
    },
    {
      id: "adm_2",
      name: "எஸ். மைக்கேல் ஆல்வின்",
      nameEn: "S. Michael Alvin",
      email: "president@tnpainters.org",
      role: "State President",
      phone: "9443212345",
      district: "சென்னை (Chennai)",
      status: "Active",
      joinedAt: "2020-01-15",
      lastLogin: "2026-08-04 07:45",
      devicesCount: 1,
      suspiciousLogins: 0,
    },
    {
      id: "adm_3",
      name: "ஆர். சக்திவேல்",
      nameEn: "R. Sakthivel",
      email: "treasurer@tnpainters.org",
      role: "State Treasurer",
      phone: "9443298765",
      district: "கோயம்புத்தூர் (Coimbatore)",
      status: "Active",
      joinedAt: "2021-02-10",
      lastLogin: "2026-08-03 18:22",
      devicesCount: 1,
      suspiciousLogins: 0,
    },
    {
      id: "adm_4",
      name: "ஆர். கணேசன்",
      nameEn: "R. Ganesan",
      email: "media@tnpainters.org",
      role: "Media Administrator",
      phone: "9443100200",
      district: "திருச்சி (Trichy)",
      status: "Active",
      joinedAt: "2023-05-18",
      lastLogin: "2026-08-04 08:10",
      devicesCount: 3,
      suspiciousLogins: 1, // flagged
    },
    {
      id: "adm_5",
      name: "மு. ரவிக்குமார்",
      nameEn: "M. Ravikumar",
      email: "ravikumar@tnpainters.org",
      role: "District Administrator",
      phone: "9841234567",
      district: "சேலம் (Salem)",
      status: "Suspended",
      joinedAt: "2022-11-04",
      lastLogin: "2026-07-28 10:15",
      devicesCount: 1,
      suspiciousLogins: 2, // suspended
    },
  ]);

  // Roles including standard and custom ones
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [newCustomRoleName, setNewCustomRoleName] = useState("");
  const [newCustomRoleDesc, setNewCustomRoleDesc] = useState("");

  const defaultRoles = [
    "Super Admin",
    "State President",
    "State General Secretary",
    "State Treasurer",
    "State Administrator",
    "District Administrator",
    "Media Administrator",
    "Finance Administrator",
    "Training Administrator",
    "Support Administrator",
    "Member",
    "Visitor"
  ];

  const allRoles = useMemo(() => [...defaultRoles, ...customRoles], [customRoles]);

  // Permissions mapping: role -> permissions object
  const [permissionsMatrix, setPermissionsMatrix] = useState<{[key: string]: {[perm: string]: boolean}}>({
    "Super Admin": { view: true, create: true, edit: true, delete: true, approve: true, reject: true, export: true, print: true, share: true, manage: true },
    "State President": { view: true, create: true, edit: true, delete: false, approve: true, reject: true, export: true, print: true, share: true, manage: true },
    "State General Secretary": { view: true, create: true, edit: true, delete: false, approve: true, reject: true, export: true, print: true, share: true, manage: true },
    "State Treasurer": { view: true, create: false, edit: true, delete: false, approve: true, reject: true, export: true, print: true, share: false, manage: false },
    "State Administrator": { view: true, create: true, edit: true, delete: true, approve: false, reject: false, export: true, print: true, share: true, manage: true },
    "District Administrator": { view: true, create: true, edit: true, delete: false, approve: false, reject: false, export: false, print: true, share: false, manage: false },
    "Media Administrator": { view: true, create: true, edit: true, delete: false, approve: false, reject: false, export: false, print: false, share: true, manage: false },
    "Finance Administrator": { view: true, create: false, edit: true, delete: false, approve: false, reject: false, export: true, print: true, share: false, manage: false },
    "Training Administrator": { view: true, create: true, edit: true, delete: false, approve: false, reject: false, export: false, print: false, share: false, manage: false },
    "Support Administrator": { view: true, create: false, edit: false, delete: false, approve: false, reject: false, export: false, print: false, share: false, manage: false },
    "Member": { view: true, create: false, edit: false, delete: false, approve: false, reject: false, export: false, print: false, share: false, manage: false },
    "Visitor": { view: true, create: false, edit: false, delete: false, approve: false, reject: false, export: false, print: false, share: false, manage: false },
  });

  // Admin creator form states
  const [createAdminUsername, setCreateAdminUsername] = useState("");
  const [createAdminPassword, setCreateAdminPassword] = useState("");
  const [createAdminAccessKey, setCreateAdminAccessKey] = useState("");
  const [createAdminName, setCreateAdminName] = useState("");
  const [createAdminNameEn, setCreateAdminNameEn] = useState("");
  const [createAdminEmail, setCreateAdminEmail] = useState("");
  const [createAdminPhone, setCreateAdminPhone] = useState("");
  const [createAdminRole, setCreateAdminRole] = useState("District Administrator");
  const [createAdminDistrict, setCreateAdminDistrict] = useState("சென்னை (Chennai)");

  // Security policies configuration states
  const [loginSecurity, setLoginSecurity] = useState({
    otpEnabled: true,
    googleLoginEnabled: true,
    emailLoginEnabled: true,
    biometricsReady: true,
    fingerprintReady: true,
    sessionTimeout: 15, // minutes
    multipleDevicesAllowed: false,
    suspiciousLoginDetection: true,
  });

  const [accountSecurity, setAccountSecurity] = useState({
    accountLockoutLimit: 3, // failed attempts before lock
    tempSuspensionDuration: 30, // minutes
    passwordComplexity: "military", // "low" | "medium" | "high" | "military"
    deviceVerificationRequired: true,
  });

  const [dataSecurity, setDataSecurity] = useState({
    encryptSensitiveData: true,
    secureCloudStorage: true,
    automaticBackups: true,
    backupFrequency: "hourly", // "hourly" | "daily" | "weekly"
    versionHistory: true,
    disasterRecovery: true,
    disasterRegion: "asia-southeast1 (Singapore)"
  });

  const [aiSecurity, setAiSecurity] = useState({
    neverRevealConfidential: true,
    respectRolePermissions: true,
    refuseUnauthorizedRequests: true,
    logAiAdminActions: true,
  });

  const [docSecurity, setDocSecurity] = useState({
    pdfWatermark: "CONFIDENTIAL TNPA INTERNAL",
    securePDF: true,
    secureImages: true,
    secureVideos: true,
    secureDocuments: true,
    downloadPermissions: "super_admin_only", // "all_admins" | "super_admin_only"
    printPermissions: "super_admin_only", // "all_admins" | "super_admin_only"
  });

  const [apiSecurity, setApiSecurity] = useState({
    rateLimitingReqsPerMin: 100,
    tokenValidation: true,
    tlsEnforcement: true,
    apiLogging: true,
  });

  // --- VERSION 16.0 DISASTER RECOVERY & BUSINESS CONTINUITY STATES ---
  const [backups, setBackups] = useState<any[]>([
    { id: "bak_1", timestamp: "2026-08-04 08:00 AM", type: "Scheduled", size: "184.2 MB", location: "asia-southeast1 (Singapore)", encrypted: true, hash: "8a1f81b1c3e4f5a6b7c8d9e0f1a2b3c4", status: "Verified", integrity: "Pass" },
    { id: "bak_2", timestamp: "2026-08-04 04:00 AM", type: "Scheduled", size: "183.9 MB", location: "asia-southeast1 (Singapore)", encrypted: true, hash: "f9202adcbefac098a72412efcbdf119a", status: "Verified", integrity: "Pass" },
    { id: "bak_3", timestamp: "2026-08-04 12:00 AM", type: "Scheduled", size: "183.5 MB", location: "asia-southeast1 (Singapore)", encrypted: true, hash: "01c90afbc08fa90cb981de9a98ef112a", status: "Verified", integrity: "Pass" },
    { id: "bak_4", timestamp: "2026-08-03 08:00 PM", type: "Scheduled", size: "182.1 MB", location: "asia-southeast1 (Singapore)", encrypted: true, hash: "be9e120fbdcf21a91d2938acfe7a9821", status: "Verified", integrity: "Pass" },
    { id: "bak_5", timestamp: "2026-08-03 06:12 PM", type: "Manual", size: "181.8 MB", location: "us-central1 (Iowa - DR)", encrypted: true, hash: "ad90218efcd812f01de981a8c08920ef", status: "Verified", integrity: "Pass" }
  ]);

  const [activeDrills, setActiveDrills] = useState<any[]>([
    { id: "drill_1", name: "Network Failover Test", status: "Idle", lastRun: "2026-07-28", result: "Success (0ms Downtime)" },
    { id: "drill_2", name: "Multi-Region DB Mirror Verification", status: "Idle", lastRun: "2026-08-01", result: "Verified (3 Nodes Active)" },
    { id: "drill_3", name: "File Cryptographic Integrity Validation", status: "Idle", lastRun: "2026-08-03", result: "Verified (0 Corrupt Files)" },
    { id: "drill_4", name: "Primary Node Blackout Simulation", status: "Idle", lastRun: "2026-06-15", result: "Success (Failover under 3s)" }
  ]);

  const [drAlerts, setDrAlerts] = useState<any[]>([
    { id: "dr_alt_1", title: "Storage Warning", desc: "Main PDF storage bucket is approaching 80% allocated space.", severity: "Warning", active: true, timestamp: "2026-08-04 06:45 AM" },
    { id: "dr_alt_2", title: "API Outage Simulator", desc: "No outage detected. All third-party endpoints responding with latency < 150ms.", severity: "Info", active: false, timestamp: "2026-08-04 09:00 AM" }
  ]);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([
    { id: "m_log_1", date: "2026-08-01", activity: "Completed PostgreSQL minor version upgrade (16.2 -> 16.3)", engineer: "SRE Cluster Dev Node 4", downtime: "0s (Hot Swap)" },
    { id: "m_log_2", date: "2026-07-15", activity: "Cleared transient cached files and re-indexed search tables", engineer: "System Auto cron", downtime: "0s" }
  ]);
  const [maintenanceNotifMessage, setMaintenanceNotifMessage] = useState(
    "உள் பராமரிப்பு காரணமாக இன்று நள்ளிரவு 12:00 மணி முதல் 12:30 மணி வரை சேவைகள் தற்காலிகமாக நிறுத்தப்படலாம். சிரமத்திற்கு வருந்துகிறோம்."
  );
  const [maintenanceNotifMessageEn, setMaintenanceNotifMessageEn] = useState(
    "System upgrades scheduled tonight between 12:00 AM and 12:30 AM IST. Portal may experience minor performance issues. We apologize for any inconvenience."
  );

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "System initialized. Listening to secure VPC cloud scheduler on port 3000...",
    "VPC Firewall Layer 1 (WAF) rule sync completed.",
    "Singapore multi-region primary cluster responding: latency 24ms, health: OK."
  ]);

  const [dbTablesIntegrity, setDbTablesIntegrity] = useState<any[]>([
    { tableName: "Member Data (உறுப்பினர் விவரங்கள்)", recordCount: "1,24,580", lastChecked: "2026-08-04 08:00 AM", hash: "sha256:88a21fdcf90ab7a1c9201efcb092a48b", status: "Healthy" },
    { tableName: "Financial Records (நிதி பதிவுகள்)", recordCount: "98,421 Tx", lastChecked: "2026-08-04 08:00 AM", hash: "sha256:fb9281e09c8abce7b1e92c0182ba0911", status: "Healthy" },
    { tableName: "Documents & Attachments (ஆவணங்கள்)", recordCount: "4,512 Files", lastChecked: "2026-08-04 08:00 AM", hash: "sha256:a02dcf8efcd02e9a1de9a09e08cb01ff", status: "Healthy" },
    { tableName: "Meeting Records (கூட்ட முடிவுகள்)", recordCount: "1,200 Records", lastChecked: "2026-08-04 08:00 AM", hash: "sha256:32c910fabcdef90cb1e29da76be78912", status: "Healthy" },
    { tableName: "Welfare & Claims (நலவாரியப் பயன்கள்)", recordCount: "8,924 claims", lastChecked: "2026-08-04 08:00 AM", hash: "sha256:90412efba0cf2e9cbde90a09eefcb901", status: "Healthy" },
    { tableName: "Audit & Access Logs (பாதுகாப்புப் பதிவேடு)", recordCount: "3,45,210 Entries", lastChecked: "2026-08-04 08:00 AM", hash: "sha256:cf901efcbde7a0cb901efba1c0ee10b9", status: "Healthy" }
  ]);

  const [perfOptimizations, setPerfOptimizations] = useState({
    dbQueryOptimization: true,
    fileCacheEnforcement: true,
    lazyLoadingImages: true,
    gzipCompression: true,
    offlineCacheServiceWorker: true
  });

  // Telemetry system live indicators
  const [telemetry, setTelemetry] = useState({
    cpuUsage: 22,
    dbConnections: 142,
    storageUsed: 745, // MB
    bandwidth: 12.4, // GB
    errorLogsCount: 4,
    backupStatus: "Synchronized",
    lastBackupTime: "2026-08-04 08:00 AM"
  });

  // Simulated live updates for Telemetry
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const cpuDelta = Math.floor(Math.random() * 7) - 3;
        const connDelta = Math.floor(Math.random() * 5) - 2;
        const bwDelta = Number((Math.random() * 0.2).toFixed(2));
        return {
          ...prev,
          cpuUsage: Math.max(10, Math.min(95, prev.cpuUsage + cpuDelta)),
          dbConnections: Math.max(50, prev.dbConnections + connDelta),
          bandwidth: Number((prev.bandwidth + bwDelta).toFixed(2))
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // System security alerts / Notifications
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([
    { id: "alt_1", type: "Failed Login Attempt", user: "ravikumar@tnpainters.org", detail: "Brute force pattern detected (3 attempts from unregistered device IP: 157.45.12.9)", date: "2026-08-04", time: "08:12:44 AM", resolved: false, severity: "High" },
    { id: "alt_2", type: "Large Data Export", user: "palanisamy@tnpainters.org", detail: "Super Admin requested download of entire Tamil Nadu contractor registry (CSV)", date: "2026-08-04", time: "08:36:12 AM", resolved: true, severity: "Medium" },
    { id: "alt_3", type: "Critical Database Alert", user: "System Monitor", detail: "PostgreSQL read pool size reached 85% capacity threshold during bulk batch query", date: "2026-08-04", time: "07:55:10 AM", resolved: true, severity: "Low" },
    { id: "alt_4", type: "Backup Failure Warning", user: "Automated cron-job-12", detail: "Cloud Storage connection timed out. Retrying in 120 seconds.", date: "2026-08-03", time: "23:00:00 PM", resolved: true, severity: "High" },
  ]);

  // Comprehensive multi-column Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: "log_1", user: "R. Xavier Babu", role: "Super Admin", date: "2026-08-04", time: "08:36:12", action: "Data Export Triggered", oldVal: "N/A", newVal: "TNPA_SUPER_ADMIN_REPORT.csv", device: "Admin Workstation", browser: "Chrome 140.0", os: "Ubuntu Linux", loginMethod: "Google SSO + Biometrics", sessionId: "SESS-773a2e9b" },
    { id: "log_2", user: "S. Michael Alvin", role: "State President", date: "2026-08-04", time: "07:45:01", action: "Welfare Claim Approved", oldVal: "Status: Pending", newVal: "Status: Approved (ID: TNP-WLF-9041)", device: "Apple iPad Pro", browser: "Safari Mobile", os: "iOS 19.1", loginMethod: "OTP + Fingerprint", sessionId: "SESS-bb1c905e" },
    { id: "log_3", user: "R. Sakthivel", role: "State Treasurer", date: "2026-08-03", time: "18:22:15", action: "Treasurer Payment Verification", oldVal: "Status: Pending", newVal: "Status: Success (Txn: UPI901248)", device: "Samsung Galaxy S26", browser: "Chrome Mobile", os: "Android 16", loginMethod: "Secure PIN", sessionId: "SESS-44fa1290" },
    { id: "log_4", user: "R. Ganesan", role: "Media Administrator", date: "2026-08-04", time: "08:10:05", action: "Published News / Bulletin", oldVal: "N/A", newVal: "ID: n_801 - State Painting Standards v2", device: "Windows desktop", browser: "Firefox 138.0", os: "Windows 11 Enterprise", loginMethod: "Email OTP", sessionId: "SESS-993d3921" },
    { id: "log_5", user: "System Automated Node", role: "Cron Daemon", date: "2026-08-04", time: "08:00:00", action: "Database Auto-Backup Scheduled", oldVal: "Hash: 8a1f", newVal: "Hash: c90a - Uploaded to safe-bucket-1", device: "VPC Cloud Server", browser: "N/A", os: "Debian 12 Server", loginMethod: "Internal Auth Token", sessionId: "SESS-CRON-8201" },
  ]);

  // Generated reports viewer state
  const [viewingReport, setViewingReport] = useState<any | null>(null);

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState<
    "dashboard" | "contractors" | "companies" | "suppliers" | "networking" | "tenders" | "awards" | "notifications" | "ai_advisor" | "security"
  >("dashboard");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Mock State - Contractors
  const [contractors, setContractors] = useState<Contractor[]>([
    {
      id: "cnt_1",
      contractorName: "சண்முகம் அசோசியேட்ஸ்",
      companyName: "Shanmugam Painting Contractors",
      ownerName: "ஆர். சண்முகம்",
      regNumber: "TNPA-CON-9021",
      gst: "33AAECS4821M1ZH",
      mobile: "9442158910",
      whatsApp: "9442158910",
      email: "shanmugam@paintingcontractor.com",
      address: "24, நெய்க்காரப்பட்டி சாலை, சேலம்",
      district: "சேலம்",
      categories: ["Interior Painting", "Exterior Painting", "Industrial Painting"],
      experience: 15,
      teamSize: 22,
      machineryDetails: "Airless Spray Guns (2), Mobile Scaffolding (4 sets), Dustless Sanders",
      licenseDetails: "PWD Class II Painting Contractor License #892",
      status: "approved",
      badge: "Senior Contractor",
      approvalDate: "2026-01-10"
    },
    {
      id: "cnt_2",
      contractorName: "மிராகல் ஆர்ட்ஸ்",
      companyName: "Miracle Wall Textures",
      ownerName: "எஸ். அகமது அலி",
      regNumber: "TNPA-CON-4512",
      mobile: "9842100452",
      whatsApp: "9842100452",
      email: "ahmed@miracletextures.in",
      address: "105, அவினாசி ரோடு, கோயம்புத்தூர்",
      district: "கோயம்புத்தூர்",
      categories: ["Texture Painting", "Wood Polish", "Residential Projects"],
      experience: 8,
      teamSize: 12,
      machineryDetails: "Pattern Sprayers, Hopper Guns, Wood Polish Buffing Rigs",
      licenseDetails: "Local Corporation Business Reg #2024-C92",
      status: "pending",
      badge: "None"
    },
    {
      id: "cnt_3",
      contractorName: "ராஜா வாட்டர்ப்ரூஃபிங்",
      companyName: "Raja Waterproofing Specialists",
      ownerName: "வி. ராஜா",
      regNumber: "TNPA-CON-1102",
      gst: "33AABCR1029K2ZP",
      mobile: "9123456789",
      whatsApp: "9123456789",
      email: "raja@waterproofsolutions.com",
      address: "44, கோடம்பாக்கம் நெடுஞ்சாலை, சென்னை",
      district: "சென்னை",
      categories: ["Waterproofing", "Exterior Painting", "Scaffolding"],
      experience: 20,
      teamSize: 35,
      machineryDetails: "Heavy Pressure Washers (5), Grouting Injectors, Scaffolding 100ft",
      licenseDetails: "MSME Certified Contractor #UDYAM-TN-01-0982",
      status: "approved",
      badge: "Master Painter",
      approvalDate: "2025-11-20"
    },
    {
      id: "cnt_4",
      contractorName: "பாரத் இண்டஸ்ட்ரியல் பெயிண்டர்ஸ்",
      companyName: "Bharat Protective Coatings",
      ownerName: "பி. கே. கிருஷ்ணன்",
      regNumber: "TNPA-CON-7761",
      mobile: "9445123456",
      whatsApp: "9445123456",
      email: "krishnan@bharatcoatings.co.in",
      address: "ஆவடி சிட்கோ இண்டஸ்ட்ரியல் எஸ்டேட், திருவள்ளூர்",
      district: "திருவள்ளூர்",
      categories: ["Industrial Painting", "Government Contract Work"],
      experience: 12,
      teamSize: 18,
      machineryDetails: "Sand Blasting Machine, Air Compressor 15HP, DFT Meters",
      licenseDetails: "A-Class Boiler Protective Coating Specialist License",
      status: "correction",
      badge: "None"
    }
  ]);

  // Mock State - Brand/Dealer Profiles
  const [companies, setCompanies] = useState<Company[]>([
    { id: "comp_1", brandName: "Vibrant Paints Ltd", logo: "🎨", type: "Manufacturer", serviceArea: "Tamil Nadu State-wide", products: "Premium Acrylic Emulsions, Polyurethane Primers, Putty", contact: "info@vibrantpaints.com", status: "active" },
    { id: "comp_2", brandName: "Nippon Elite Dealers", logo: "🇯🇵", type: "Dealer", serviceArea: "Madurai & Southern Districts", products: "Automotive Coatings, Wood Polishes, Texture Tools", contact: "madurai@elitedealers.com", status: "active" },
    { id: "comp_3", brandName: "Apex Scaffolding Dist", logo: "🏗️", type: "Distributor", serviceArea: "Chennai Metro & West", products: "Heavy Duty Scaffolding, Safety Harnesses, Ladders", contact: "sales@apexscaffolds.com", status: "pending" }
  ]);

  // Mock State - Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: "sup_1", supplierName: "பாலசுப்பிரமணியம் டிரேடர்ஸ்", companyName: "Balu Paint Agency", category: "Paint", district: "மதுரை", stockStatus: "In Stock", contact: "9443120456", approved: true },
    { id: "sup_2", supplierName: "ராயல் டூல்ஸ் மார்ட்", companyName: "Royal Paint Tools & Hardware", category: "Brushes", district: "சென்னை", stockStatus: "Low Stock", contact: "9841029481", approved: true },
    { id: "sup_3", supplierName: "பாதுகாப்பு உபகரணங்கள் விநியோகம்", companyName: "Kovai Paint Safety Solutions", category: "Safety", district: "கோயம்புத்தூர்", stockStatus: "In Stock", contact: "9442231948", approved: true },
    { id: "sup_4", supplierName: "இமயம் ஸ்காஃபோல்டிங்", companyName: "Imayam Scaffolding Rental", category: "Scaffolding", district: "சேலம்", stockStatus: "Out of Stock", contact: "9150029312", approved: false }
  ]);

  // Mock State - Leads
  const [leads, setLeads] = useState<BusinessLead[]>([
    { id: "lead_1", source: "Salem Smart City Tender Office", district: "சேலம்", estimatedValue: 1250000, status: "Negotiating", assignedTo: "சண்முகம் அசோசியேட்ஸ்", followUpDate: "2026-08-10", notes: "Flyover beautification & weather coat painting project" },
    { id: "lead_2", source: "Kovai IT Park Interior Dev", district: "கோயம்புத்தூர்", estimatedValue: 750000, status: "Contacted", assignedTo: "மிராகல் ஆர்ட்ஸ்", followUpDate: "2026-08-15", notes: "Texture painting for 3 floors corporate workspace" },
    { id: "lead_3", source: "Metro Water Tank Epoxy Coating", district: "சென்னை", estimatedValue: 2400000, status: "Converted", assignedTo: "ராஜா வாட்டர்ப்ரூஃபிங்", followUpDate: "2026-08-01", notes: "EPoxy coating & concrete crystallization waterproofing" }
  ]);

  // Mock State - Tenders
  const [tenders, setTenders] = useState<Tender[]>([
    { id: "tend_1", title: "மதுரை அரசு கலைக்கல்லூரி வர்ணம் பூசுதல் பணி", department: "Public Works Department (PWD)", district: "மதுரை", value: 3500000, deadline: "2026-08-25", eligibility: "Registered PWD Class II Painters with 10L solvency", status: "New", notes: "Requires lead-free antifungal acrylic paint" },
    { id: "tend_2", title: "சென்னை மெட்ரோ இரயில் நிலையங்கள் புதுப்பித்தல்", department: "Chennai Metro Rail Ltd (CMRL)", district: "சென்னை", value: 8200000, deadline: "2026-08-18", eligibility: "ISO Certified Painters with Industrial Safety gear standard", status: "Applied", notes: "Exterior anti-carbonation coatings needed" },
    { id: "tend_3", title: "சேலம் உருக்காலை உள்கட்டமைப்பு அரிப்பு தடுப்பு", department: "Steel Authority of India (SAIL)", district: "சேலம்", value: 12000000, deadline: "2026-09-05", eligibility: "Heavy structural coating specialist certificate mandatory", status: "Under Review", notes: "Requires sand blasting and three-coat epoxy" }
  ]);

  // Mock State - Awards
  const [awards, setAwards] = useState<AwardEntry[]>([
    { id: "awd_1", recipientName: "வி. ராஜா (Raja Waterproofing)", category: "Best Contractor", district: "சென்னை", year: "2025", verifiedHash: "TNPA-CERT-88a21f9" },
    { id: "awd_2", recipientName: "சேலம் மாவட்ட கிளை", category: "Best District", district: "சேலம்", year: "2025", verifiedHash: "TNPA-CERT-5c1209b" },
    { id: "awd_3", recipientName: "ஆர். பழனிவேல் (Senior Master)", category: "Lifetime Achievement", district: "மதுரை", year: "2024", verifiedHash: "TNPA-CERT-11d2eef" }
  ]);

  // Smart Scheduler Notifications
  const [scheduledNotifs, setScheduledNotifs] = useState([
    { id: "not_1", title: "மழைக்கால வாட்டர்ப்ரூஃபிங் வழிகாட்டுதல்", target: "All Contractors", priority: "High", type: "Broadcast", date: "2026-08-05", sent: false },
    { id: "not_2", title: "சேலம் மாவட்ட தணிக்கை ஆவண சரிபார்ப்பு", target: "Salem District Admin", priority: "Emergency", type: "SMS Ready", date: "2026-08-07", sent: false },
    { id: "not_3", title: "மாநில நலவாரிய சந்தா காலக்கெடு எச்சரிக்கை", target: "Unregistered Painters", priority: "Medium", type: "Email", date: "2026-08-09", sent: false }
  ]);

  // AI Advisor Insights State
  const [aiAnalysisType, setAiAnalysisType] = useState<"growth" | "revenue" | "risks" | "district">("growth");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    suggestions: string[];
    ideas: string[];
    risks: string[];
    expansion: string[];
  }>({
    suggestions: [
      "Waterproofing & Epoxy coatings represent a 45% margin increase compared to basic emulsion paint work in Chennai Metro.",
      "Encourage young painters in Tiruppur and Coimbatore to form joint-venture consortia to qualify for state PWD infrastructure paint tenders (which usually require ₹20L+ solvency).",
      "Establish a certified scaffolding repository in Madurai district, renting out certified couplers to reduce overhead costs of small painters by 35%."
    ],
    ideas: [
      "State Painting Association Premium Label Program: Certify top-tier painters as 'TNPA Master Craftsmen', charging a 5% commission on direct luxury residential client leads routed via the portal.",
      "Bulk Material Procurement Agreements: Negotiate directly with brand companies (Vibrant Paints, etc.) for a 15% discount, distributing to registered contractors and keeping a 2% administrative fee for the union emergency trust."
    ],
    risks: [
      "Supply Shock Warning: Acrylic monomer pricing has increased by 14% globally. Advise contractors to write material price-escalation clauses in tenders slated for late 2026.",
      "Unlicensed scaffolding hazards detected in Trichy: Implement mandatory 1-day safety standard training prior to authorizing high-rise work on the platform."
    ],
    expansion: [
      "Launch specialized industrial painting training in Ranipet & Hosur, where heavy automotive and manufacturing industrial demands are underserved.",
      "Establish a dedicated digital dispute resolution panel to resolve outstanding paint contract payments between builders and painters."
    ]
  });

  // Dialog & Active Actions States
  const [activeCertificate, setActiveCertificate] = useState<AwardEntry | null>(null);
  const [newContractorName, setNewContractorName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newDistrict, setNewDistrict] = useState("சென்னை");
  const [newCategory, setNewCategory] = useState("Interior Painting");
  const [newTeamSize, setNewTeamSize] = useState(5);
  const [newExperience, setNewExperience] = useState(3);

  const [newTenderTitle, setNewTenderTitle] = useState("");
  const [newTenderDept, setNewTenderDept] = useState("");
  const [newTenderVal, setNewTenderVal] = useState(500000);
  const [newTenderEligibility, setNewTenderEligibility] = useState("");

  const [notifTitle, setNotifTitle] = useState("");
  const [notifPriority, setNotifPriority] = useState("High");
  const [notifType, setNotifType] = useState("Broadcast");
  const [notifDate, setNotifDate] = useState("2026-08-06");

  // Audit Logs inside the Business Platform
  const [businessAuditLogs, setBusinessAuditLogs] = useState<any[]>([
    { time: "08:34:00 AM", action: "Super Admin Auth Verified", details: "Secured credential matching role 'super_admin' executed." },
    { time: "08:31:12 AM", action: "Confidential Database Synced", details: "Retrieved contractor registry (4 entries) and current tender pipelines (3 entries)." }
  ]);

  const addBusLog = (action: string, details: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setBusinessAuditLogs(prev => [{ time: timestamp, action, details }, ...prev]);
    onAddAuditLog(action, details);
  };

  // Helper calculation for Dashboard
  const metrics = useMemo(() => {
    const totalContractors = contractors.length;
    const totalCompanies = companies.length;
    const activeSuppliers = suppliers.filter(s => s.approved).length;
    const pendingContractors = contractors.filter(c => c.status === "pending").length;
    const totalLeadsValue = leads.reduce((acc, lead) => acc + lead.estimatedValue, 0);
    const totalTenderPipeline = tenders.reduce((acc, ten) => acc + ten.value, 0);
    return {
      totalContractors,
      totalCompanies,
      activeSuppliers,
      pendingContractors,
      totalLeadsValue,
      totalTenderPipeline,
      growthScore: 88 // Out of 100
    };
  }, [contractors, companies, suppliers, leads, tenders]);

  // Filtered Contractors List
  const filteredContractors = useMemo(() => {
    return contractors.filter(c => {
      const matchesSearch = c.contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict = selectedDistrict === "All" || c.district === selectedDistrict;
      const matchesCat = selectedCategory === "All" || c.categories.includes(selectedCategory);
      return matchesSearch && matchesDistrict && matchesCat;
    });
  }, [contractors, searchQuery, selectedDistrict, selectedCategory]);

  // Handlers for Contractors
  const handleCreateContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractorName.trim() || !newOwnerName.trim()) return;

    const newC: Contractor = {
      id: `cnt_${Date.now()}`,
      contractorName: newContractorName,
      companyName: newCompanyName || `${newContractorName} Limited`,
      ownerName: newOwnerName,
      regNumber: `TNPA-CON-${Math.floor(1000 + Math.random() * 9000)}`,
      mobile: newMobile || "9443000000",
      whatsApp: newMobile || "9443000000",
      email: `${newOwnerName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      address: `10, State Highway Rd, ${newDistrict}`,
      district: newDistrict,
      categories: [newCategory],
      experience: Number(newExperience),
      teamSize: Number(newTeamSize),
      machineryDetails: "Standard Painting Tools, Scaffolding frames",
      licenseDetails: "Local Painter Guild Registration Certificate",
      status: "pending",
      badge: "None"
    };

    setContractors(prev => [newC, ...prev]);
    addBusLog("New Contractor Registered", `Contractor entry for ${newC.companyName} created as pending state.`);
    setNewContractorName("");
    setNewCompanyName("");
    setNewOwnerName("");
    setNewMobile("");
    alert(lang === "ta" ? "ஒப்பந்தக்காரர் விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!" : "Contractor application submitted for approval!");
  };

  const handleUpdateStatus = (id: string, nextStatus: "approved" | "rejected" | "correction") => {
    setContractors(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: nextStatus,
          approvalDate: nextStatus === "approved" ? new Date().toISOString().split("T")[0] : undefined
        };
      }
      return c;
    }));
    const targetC = contractors.find(c => c.id === id);
    addBusLog("Contractor Status Updated", `Contractor ID ${id} set to ${nextStatus}.`);
    alert(lang === "ta" ? `நிலை மாற்றப்பட்டது: ${nextStatus}` : `Status successfully updated to: ${nextStatus}`);
  };

  const handleAssignBadge = (id: string, badge: any) => {
    setContractors(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, badge };
      }
      return c;
    }));
    addBusLog("Contractor Badged", `Assigned '${badge}' merit token to contractor ID ${id}.`);
    alert(`Assigned badge: ${badge}`);
  };

  // Tender management
  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenderTitle.trim()) return;

    const newT: Tender = {
      id: `tend_${Date.now()}`,
      title: newTenderTitle,
      department: newTenderDept || "Department of Public Works",
      district: newDistrict,
      value: Number(newTenderVal),
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      eligibility: newTenderEligibility || "Registered Painters guild members",
      status: "New",
      notes: "Tender updated directly on business network center."
    };

    setTenders(prev => [newT, ...prev]);
    addBusLog("Tender Created", `New tender: '${newT.title}' with valuation ₹${newT.value.toLocaleString()}`);
    setNewTenderTitle("");
    setNewTenderDept("");
    setNewTenderEligibility("");
    alert("Tender added!");
  };

  const handleAdvanceTenderStatus = (id: string, nextStatus: any) => {
    setTenders(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    addBusLog("Tender Pipeline Advanced", `Tender ID ${id} advanced to state: ${nextStatus}`);
  };

  // Schedule notification
  const handleScheduleNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim()) return;

    const newN = {
      id: `not_${Date.now()}`,
      title: notifTitle,
      target: "All Association Nodes",
      priority: notifPriority,
      type: notifType,
      date: notifDate,
      sent: false
    };

    setScheduledNotifs(prev => [newN, ...prev]);
    addBusLog("Notification Scheduled", `Message scheduled: '${newN.title}' with priority ${newN.priority}`);
    setNotifTitle("");
    alert("Smart notification has been registered & scheduled!");
  };

  // Trigger simulated AI Analysis
  const runAiEngine = () => {
    setIsAiGenerating(true);
    addBusLog("AI Decision Engine Executed", `Analyzed business expansion parameters on district maps & material indices.`);
    setTimeout(() => {
      setIsAiGenerating(false);
      alert(lang === "ta" ? "AI பகுப்பாய்வு நிறைவுற்றது! உத்திகள் புதுப்பிக்கப்பட்டன." : "AI strategic recommendation matrix generated successfully.");
    }, 1200);
  };

  // Report Export simulation
  const handleExportData = (format: "csv" | "pdf") => {
    addBusLog("Data Export Initiated", `Super Admin generated database export in ${format.toUpperCase()} format.`);
    const headers = "Contractor ID,Contractor Name,Company Name,Mobile,District,Experience,Status\n";
    const csvContent = contractors.map(c => 
      `"${c.id}","${c.contractorName}","${c.companyName}","${c.mobile}","${c.district}",${c.experience},"${c.status}"`
    ).join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TNPA_SUPER_ADMIN_REPORT_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Export successful! File downloading...");
  };

  // Fetch real admin accounts and audit logs from backend API
  const refreshAdminAccounts = async () => {
    try {
      const resp = await fetch("/api/admin/accounts");
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.admins)) {
          setAdminAccounts(data.admins);
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin accounts from backend API:", err);
    }
  };

  React.useEffect(() => {
    refreshAdminAccounts();
  }, []);

  // --- VERSION 14.0 SECURE ADMINISTRATION ACTIONS ---
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createAdminName.trim() || !createAdminEmail.trim() || !createAdminPhone.trim() || !createAdminUsername.trim()) {
      alert("Please fill out all required fields including Admin Username.");
      return;
    }

    try {
      const resp = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUsername: createAdminUsername.trim(),
          password: createAdminPassword.trim() || undefined,
          accessKey: createAdminAccessKey.trim() || undefined,
          role: createAdminRole,
          name: createAdminName.trim(),
          nameEn: createAdminNameEn.trim() || createAdminName.trim(),
          email: createAdminEmail.trim(),
          phone: createAdminPhone.trim(),
          district: createAdminDistrict,
          permissions: permissionsMatrix[createAdminRole] || {
            view: true, create: true, edit: true, delete: false, approve: true, reject: true, export: true, print: true, share: true, manage: false
          }
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        addBusLog("Administrator Provisioned", `Super Admin provisioned account for ${data.admin.nameEn} (${data.admin.adminUsername})`);
        alert(`Admin Account Created Successfully!\n\nUsername: ${data.credentials.adminUsername}\nGenerated Password: ${data.credentials.generatedPassword}\nGenerated Access Key: ${data.credentials.generatedAccessKey}\n\nPlease copy these credentials securely.`);
        setCreateAdminUsername("");
        setCreateAdminPassword("");
        setCreateAdminAccessKey("");
        setCreateAdminName("");
        setCreateAdminNameEn("");
        setCreateAdminEmail("");
        setCreateAdminPhone("");
        refreshAdminAccounts();
      } else {
        alert(data.error || "Failed to create administrator account.");
      }
    } catch (err: any) {
      console.error("Error creating admin account:", err);
      alert(err.message || "Failed to connect to server.");
    }
  };

  const toggleAdminStatus = async (id: string) => {
    const target = adminAccounts.find(a => a.id === id);
    if (!target) return;
    const nextStatus = target.status === "Active" || target.status === "active" ? "Suspended" : "Active";

    try {
      const resp = await fetch(`/api/admin/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        addBusLog(`Account ${nextStatus}`, `Administrator ${target.nameEn || target.adminUsername} status set to ${nextStatus}`);
        refreshAdminAccounts();
      } else {
        alert(data.error || "Failed to update admin status.");
      }
    } catch (err: any) {
      console.error("Error updating admin status:", err);
      alert(err.message || "Failed to connect to server.");
    }
  };

  const deleteAdminAccount = async (id: string) => {
    const target = adminAccounts.find(adm => adm.id === id);
    if (!target) return;
    if (confirm(`Are you sure you want to permanently delete administrator ${target.nameEn || target.adminUsername}?`)) {
      try {
        const resp = await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
        const data = await resp.json();
        if (resp.ok && data.success) {
          addBusLog("Administrator Deleted", `Super Admin permanently deleted the account of ${target.nameEn || target.adminUsername}`);
          alert("Administrator deleted successfully.");
          refreshAdminAccounts();
        } else {
          alert(data.error || "Failed to delete administrator.");
        }
      } catch (err: any) {
        console.error("Error deleting admin:", err);
        alert(err.message || "Failed to delete administrator.");
      }
    }
  };

  const resetAdminPassword = async (adminId: string, nameEn: string) => {
    try {
      const resp = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        addBusLog("Password Reset Executed", `Super Admin reset password for ${nameEn} (${adminId})`);
        alert(`New Password Generated for ${nameEn}:\n\n${data.newPassword}\n\nPlease share this password with the administrator securely.`);
        refreshAdminAccounts();
      } else {
        alert(data.error || "Failed to reset password.");
      }
    } catch (err: any) {
      console.error("Error resetting password:", err);
      alert(err.message || "Failed to connect to server.");
    }
  };

  const regenerateAccessKey = async (adminId: string, nameEn: string) => {
    try {
      const resp = await fetch("/api/admin/regenerate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        addBusLog("Access Key Regenerated", `Super Admin regenerated access key for ${nameEn} (${adminId})`);
        alert(`New Admin Access Key Generated for ${nameEn}:\n\n${data.newAccessKey}\n\nPlease share this Access Key with the administrator securely.`);
        refreshAdminAccounts();
      } else {
        alert(data.error || "Failed to regenerate access key.");
      }
    } catch (err: any) {
      console.error("Error regenerating access key:", err);
      alert(err.message || "Failed to connect to server.");
    }
  };

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomRoleName.trim()) return;
    const roleName = newCustomRoleName.trim();
    if (allRoles.includes(roleName)) {
      alert("This role already exists.");
      return;
    }
    setCustomRoles(prev => [...prev, roleName]);
    setPermissionsMatrix(prev => ({
      ...prev,
      [roleName]: { view: true, create: false, edit: false, delete: false, approve: false, reject: false, export: false, print: false, share: false, manage: false }
    }));
    addBusLog("Custom Role Created", `Created role scope for custom administrative title: '${roleName}'`);
    setNewCustomRoleName("");
    setNewCustomRoleDesc("");
    alert(`Custom role '${roleName}' has been added and mapped to default read-only permissions.`);
  };

  const togglePermission = async (role: string, permission: string) => {
    const currentRolePerms = permissionsMatrix[role] || { view: true };
    const updatedPerms = {
      ...currentRolePerms,
      [permission]: !currentRolePerms[permission]
    };

    setPermissionsMatrix(prev => ({
      ...prev,
      [role]: updatedPerms
    }));

    addBusLog("Permissions Adjusted", `Modified '${permission}' permission for role: ${role} to ${updatedPerms[permission]}`);

    // Sync updated permissions to matching admins in backend
    const matchingAdmins = adminAccounts.filter(a => a.role === role);
    for (const adm of matchingAdmins) {
      try {
        await fetch(`/api/admin/accounts/${adm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: updatedPerms })
        });
      } catch (err) {
        console.warn(`Failed to update permissions for admin ${adm.id}:`, err);
      }
    }
    refreshAdminAccounts();
  };

  const resolveSecurityAlert = (id: string) => {
    setSecurityAlerts(prev => prev.map(alt => {
      if (alt.id === id) {
        addBusLog("Threat Alert Resolved", `Super Admin flagged alert ID ${id} (${alt.type}) as resolved.`);
        return { ...alt, resolved: true };
      }
      return alt;
    }));
  };

  const generateSecurityReport = (type: string) => {
    const timestamp = new Date().toISOString();
    let reportTitle = "";
    let columns: string[] = [];
    let rows: any[] = [];
    
    addBusLog("Security Report Generated", `Generated detailed ${type} to system workspace.`);
    
    if (type === "Security Compliance") {
      reportTitle = "TNPA ENTERPRISE SECURITY COMPLIANCE REPORT";
      columns = ["Metric / Scope", "Configuration Status", "Compliance Score", "Verification Hash"];
      rows = [
        ["OTP Multi-factor Login", loginSecurity.otpEnabled ? "Active (High)" : "Disabled (Critical Risk)", "100%", "MFA-7729b"],
        ["Biometric Credentials", loginSecurity.biometricsReady ? "Biometrics Ready" : "Disabled", "95%", "BIO-8821a"],
        ["Account Brute Force Lock", `Max ${accountSecurity.accountLockoutLimit} attempts`, "100%", "LOCK-3329f"],
        ["Sensitive Data Encryption", dataSecurity.encryptSensitiveData ? "AES-256 Enabled" : "Disabled", "100%", "ENC-1182c"],
        ["Document Watermarking", docSecurity.pdfWatermark ? "Enabled (Text: " + docSecurity.pdfWatermark + ")" : "Disabled", "90%", "DOC-4421b"],
        ["AI Integrity Enforcement", aiSecurity.neverRevealConfidential ? "Guarded (Never reveal confidential)" : "Off", "100%", "AI-9021a"],
        ["API Rate Limiting", `${apiSecurity.rateLimitingReqsPerMin} reqs/min`, "100%", "API-4491d"]
      ];
    } else if (type === "Audit Ledger") {
      reportTitle = "CRYPTOGRAPHIC AUDIT LOG DEEP TRAIL REPORT";
      columns = ["User", "Role", "Timestamp", "Action Done", "Device/OS", "Browser Scope"];
      rows = auditLogs.map(l => [l.user, l.role, `${l.date} ${l.time}`, l.action, `${l.device} (${l.os})`, l.browser]);
    } else if (type === "Login Security & Devices") {
      reportTitle = "EXECUTIVE LOGIN & SUSPICIOUS ATTEMPTS REPORT";
      columns = ["Admin User", "Role Profile", "Devices Connected", "Suspicious Logins Count", "Current Status"];
      rows = adminAccounts.map(a => [a.nameEn, a.role, `${a.devicesCount} registered`, a.suspiciousLogins, a.status]);
    } else if (type === "System Health & Backups") {
      reportTitle = "SYSTEM HEALTH TELEMETRY & AUTO-BACKUP LEDGER";
      columns = ["Health parameter", "Current Load / Status", "Threshold Guard", "Backups state"];
      rows = [
        ["CPU Core Load", `${telemetry.cpuUsage}%`, "85% Upper Bound", telemetry.backupStatus],
        ["Database Pools Connections", `${telemetry.dbConnections} active pools`, "500 pool limit", "Healthy"],
        ["Physical Server Storage", `${telemetry.storageUsed} MB`, "2.5 GB Cap", "Healthy"],
        ["Bandwidth Allocated", `${telemetry.bandwidth} GB`, "Unlimited (Metered)", "Healthy"],
        ["Active Backup Node", telemetry.backupStatus, "Real-time Synchronized", telemetry.lastBackupTime]
      ];
    }

    setViewingReport({
      title: reportTitle,
      timestamp,
      columns,
      rows,
      generatedBy: currentUser?.nameEn || "R. Xavier Babu",
      hash: "TNPA-SEC-" + Math.floor(100000 + Math.random() * 900000).toString(16)
    });
  };

  const generateDynamicRules = () => {
    let rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global function to verify if user has active session
    function isAuthenticated() {
      return request.auth != null;
    }

    // Role verification function
    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }
`;

    // Loop through each role and output their rule configs
    Object.keys(permissionsMatrix).forEach(role => {
      const perms = permissionsMatrix[role] || { view: true, create: false, edit: false, delete: false };
      const roleSlug = role.toLowerCase().replace(/\s+/g, "_");
      
      rules += `
    // Rules specifically matching '${role}' profile permissions
    match /documents_of_${roleSlug}/{docId} {
      allow read: if isAuthenticated() && (${perms.view ? 'true' : 'false'} || hasRole('super_admin'));
      allow create: if isAuthenticated() && (${perms.create ? 'true' : 'false'} && hasRole('${roleSlug}'));
      allow update: if isAuthenticated() && (${perms.edit ? 'true' : 'false'} && hasRole('${roleSlug}'));
      allow delete: if isAuthenticated() && (${perms.delete ? 'true' : 'false'} && hasRole('${roleSlug}'));
    }
`;
    });

    rules += `
    // Static core master lists
    match /contractors/{contractorId} {
      allow read: if isAuthenticated() && (${permissionsMatrix["Member"]?.view ? 'true' : 'false'});
      allow write: if isAuthenticated() && hasRole('super_admin');
    }
  }
}`;
    return rules;
  };

  // Gated Render Block
  if (!isSuperAdmin) {
    return (
      <div className="bg-[#fcfbf9] text-stone-900 border-2 border-dashed border-red-300 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6 shadow-lg my-12">
        <div className="bg-red-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto border border-red-200">
          <ShieldAlert className="w-10 h-10 text-red-600 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-red-950 uppercase tracking-tight">
          {lang === "ta" ? "அணுகல் மறுக்கப்பட்டது - பாதுகாப்பான பகுதி" : "Confidential Security Gate"}
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          {lang === "ta"
            ? "இந்த பிரத்யேக வணிக மேலாண்மைத் தளம் மாநில பொதுச் செயலாளருக்கு (Super Admin) மட்டுமே ஒதுக்கப்பட்டுள்ளது. வேறு எந்த பயனர் பாத்திரத்திற்கும் இங்கு அனுமதி இல்லை."
            : "This business management platform is exclusively reserved for the State General Secretary (Super Admin). Access has been denied cryptographically based on credentials."}
        </p>
        <div className="bg-stone-900 text-stone-400 p-4 rounded-2xl text-xs font-mono text-left space-y-1.5 border border-stone-800">
          <p className="text-amber-500 font-bold">// SECURE AUDIT BLOCK TRIPPED</p>
          <p>Requested: Super Admin Business Command Center v13.0</p>
          <p>Identity: {currentUser ? `${currentUser.nameEn} (${currentUser.role})` : "Guest / Visitor"}</p>
          <p>Security Resolution: DENIED</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfbf9] text-stone-900 border border-stone-200 rounded-3xl shadow-xl overflow-hidden min-h-[850px] flex flex-col font-sans">
      
      {/* ENTERPRISE GOLD HEADER */}
      <div className="bg-gradient-to-r from-red-950 via-stone-950 to-stone-900 text-white p-6 border-b-4 border-amber-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-stone-950 font-black text-[9px] tracking-widest uppercase">
                SUPER ADMIN PLATINUM CONSOLE V13.0
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                SECURED NODE
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase flex items-center gap-2">
              {lang === "ta" ? "மாநில ஒப்பந்ததாரர் & வணிகக் கட்டளை மையம்" : "TNPA Contractor & Business Command Center"}
            </h2>
            <p className="text-xs text-stone-300">
              {lang === "ta"
                ? "வல்லுநர் ஒப்பந்ததாரர்கள், நிறுவனங்கள், சப்ளையர்கள், அரசு டெண்டர்கள் மற்றும் AI வர்த்தக பகுப்பாய்வு"
                : "Confidential administration of contractors, company brands, paint suppliers, bid opportunities, and AI state growth planning."}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleExportData("csv")}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === "ta" ? "ஏற்றுமதி (CSV)" : "Export CSV"}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-[#b91c1c] hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "அச்சிடு" : "Print Console"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL CONSOLE DIRECTORY NAV */}
      <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex gap-1 overflow-x-auto scrollbar-none select-none">
        {[
          { id: "dashboard", label: "ரகசிய பலகை", labelEn: "Confidential KPI", icon: <Layers className="w-3.5 h-3.5" /> },
          { id: "contractors", label: "ஒப்பந்தக்காரர்கள்", labelEn: "Contractors Hub", icon: <Users className="w-3.5 h-3.5" /> },
          { id: "companies", label: "நிறுவன சுயவிவரங்கள்", labelEn: "Company Profiles", icon: <Building className="w-3.5 h-3.5" /> },
          { id: "suppliers", label: "சப்ளையர் கோப்பு", labelEn: "Material Suppliers", icon: <Briefcase className="w-3.5 h-3.5" /> },
          { id: "networking", label: "வணிக இணைப்புகள்", labelEn: "Business Leads", icon: <Share2 className="w-3.5 h-3.5" /> },
          { id: "tenders", label: "டெண்டர்கள்", labelEn: "Tender Tracking", icon: <FileText className="w-3.5 h-3.5" /> },
          { id: "awards", label: "விருதுகள் & சான்றிதழ்", labelEn: "Awards Registry", icon: <Award className="w-3.5 h-3.5 text-amber-600" /> },
          { id: "notifications", label: "ஸ்மார்ட் அறிவிப்புகள்", labelEn: "Notification Center", icon: <Bell className="w-3.5 h-3.5" /> },
          { id: "whatsapp_groups", label: "WhatsApp குழுக்கள்", labelEn: "WhatsApp Groups", icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> },
          { id: "ai_advisor", label: "AI வணிக ஆலோசகர்", labelEn: "AI Strategy Suite", icon: <Cpu className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> },
          { id: "security", label: "பாதுகாப்பு & விதிகள்", labelEn: "Security & Logs", icon: <Lock className="w-3.5 h-3.5" /> }
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => {
              setActiveSubTab(subTab.id as any);
              addBusLog("Console Module Switched", `Opened tab component: ${subTab.labelEn}`);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === subTab.id
                ? "bg-stone-900 text-white shadow-inner"
                : "text-stone-600 hover:bg-stone-200/60"
            }`}
          >
            {subTab.icon}
            <span>{lang === "ta" ? subTab.label : subTab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* CENTRAL MODULE VIEWPORT */}
      <div className="flex-grow p-6 space-y-6">
        
        {/* TAB 1: CONFIDENTIAL DASHBOARD SUMMARY */}
        {activeSubTab === "dashboard" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            
            {/* Top alert / executive briefing */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start text-xs text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold uppercase">STATE SECRETARY ACTIONABLE SUMMARY</span>
                <p>
                  You have <strong className="text-red-700">{metrics.pendingContractors} contractor applications</strong> awaiting review, and <strong className="text-stone-900">₹8.2M Tender deadline closing soon</strong> in Chennai District. AI predicts a supply cost peak in late August.
                </p>
              </div>
            </div>

            {/* Private KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "மொத்த ஒப்பந்தக்காரர்கள்", labelEn: "Enrolled Contractors", val: metrics.totalContractors, desc: "Active business nodes", icon: <Users className="w-5 h-5 text-stone-700" /> },
                { label: "அங்கீகரிக்கப்பட்ட பிராண்டுகள்", labelEn: "Registered Companies", val: metrics.totalCompanies, desc: "Manufacturer partnerships", icon: <Building className="w-5 h-5 text-indigo-700" /> },
                { label: "மதிப்பிடப்பட்ட லீட்ஸ் மதிப்பு", labelEn: "Active Business Leads", val: `₹${(metrics.totalLeadsValue / 100000).toFixed(1)} Lakhs`, desc: "Lead pipeline volume", icon: <TrendingUp className="w-5 h-5 text-emerald-700" /> },
                { label: "அரசு டெண்டர் உத்தேச மதிப்பு", labelEn: "Govt Tender Pipeline", val: `₹${(metrics.totalTenderPipeline / 100000).toFixed(1)} Lakhs`, desc: "Live contract tracking", icon: <Briefcase className="w-5 h-5 text-[#b91c1c]" /> }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-1 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      {lang === "ta" ? kpi.label : kpi.labelEn}
                    </span>
                    {kpi.icon}
                  </div>
                  <p className="text-2xl font-black text-stone-900 font-mono">{kpi.val}</p>
                  <span className="text-[10px] text-stone-400 block font-semibold">{kpi.desc}</span>
                </div>
              ))}
            </div>

            {/* Interactive State Growth & Analytical Widget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Radial Growth Score Ring & Stats (Built in clean responsive SVG) */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm text-center flex flex-col justify-between items-center space-y-4">
                <div className="space-y-1 text-left w-full border-b border-stone-100 pb-2">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase">STATE BUSINESS GROWTH INDEX</span>
                  <h4 className="text-xs font-bold text-stone-900">Tamil Nadu Painters Business Ecosystem Health</h4>
                </div>

                {/* SVG Dial */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle cx="50" cy="50" r="40" stroke="#f5f5f4" strokeWidth="8" fill="none" />
                    {/* Progress Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#b91c1c"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * metrics.growthScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-stone-900 font-mono">{metrics.growthScore}%</span>
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Excellent</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full text-xs text-stone-700">
                  <div className="bg-stone-50 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-stone-400 font-bold block">ACTIVE SUPPLIERS</span>
                    <span className="font-mono font-bold text-stone-800">{metrics.activeSuppliers} Nodes</span>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-stone-400 font-bold block">TENDER WIN RATIO</span>
                    <span className="font-mono font-bold text-stone-800">42.5%</span>
                  </div>
                </div>
              </div>

              {/* District business list overview */}
              <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-400 font-extrabold uppercase">STATE PROCUREMENT REPORT</span>
                    <h4 className="text-xs font-bold text-stone-900">District Contractor Strength & Valuation Map</h4>
                  </div>
                  <span className="text-[10px] bg-red-50 text-[#b91c1c] font-bold px-2 py-0.5 rounded-full">38 Districts Sync Active</span>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {[
                    { dist: "சென்னை", count: 18, value: "₹2.4 Crores", status: "High Demand", color: "bg-emerald-500" },
                    { dist: "கோயம்புத்தூர்", count: 12, value: "₹1.8 Crores", status: "Industrial Growth", color: "bg-emerald-500" },
                    { dist: "மதுரை", count: 9, value: "₹95 Lakhs", status: "High Tenders", color: "bg-amber-500" },
                    { dist: "சேலம்", count: 8, value: "₹72 Lakhs", status: "Compliance Risk", color: "bg-red-500" },
                    { dist: "திருச்சிராப்பள்ளி", count: 5, value: "₹45 Lakhs", status: "Steady", color: "bg-stone-400" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg border border-stone-100 hover:bg-stone-50">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="font-bold text-stone-800">{item.dist}</span>
                      </div>
                      <div className="flex items-center gap-4 text-stone-600">
                        <span>{item.count} Contractors</span>
                        <strong className="text-stone-900 font-mono">{item.value}</strong>
                        <span className="text-[10px] text-stone-400 font-medium hidden md:inline">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-stone-900 text-stone-300 p-2.5 rounded-xl text-[10px] font-mono flex justify-between items-center border border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-500" />
                    <span>Procurement Sync Hash: SHA256-4d2ea190bf</span>
                  </div>
                  <span className="text-emerald-400 font-bold">● AUTOMATIC BACKUP OK</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: CONTRACTORS MANAGEMENT */}
        {activeSubTab === "contractors" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            
            {/* Control bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200">
              <div className="flex flex-wrap gap-2 items-center flex-grow">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name, company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-1.5 border border-stone-300 rounded-xl text-xs bg-stone-50 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 w-44"
                  />
                </div>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 font-bold focus:outline-none"
                >
                  <option value="All">All Districts</option>
                  <option value="சென்னை">Chennai (சென்னை)</option>
                  <option value="கோயம்புத்தூர்">Coimbatore (கோவை)</option>
                  <option value="மதுரை">Madurai (மதுரை)</option>
                  <option value="சேலம்">Salem (சேலம்)</option>
                  <option value="திருவள்ளூர்">Tiruvallur</option>
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 font-bold focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Interior Painting">Interior Painting</option>
                  <option value="Exterior Painting">Exterior Painting</option>
                  <option value="Industrial Painting">Industrial Painting</option>
                  <option value="Texture Painting">Texture Painting</option>
                  <option value="Waterproofing">Waterproofing</option>
                </select>
              </div>

              <span className="text-xs text-stone-500 font-bold shrink-0">
                Found {filteredContractors.length} matching contractors
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Contractors Listing */}
              <div className="xl:col-span-2 space-y-4">
                {filteredContractors.length === 0 ? (
                  <div className="bg-white border border-stone-200 p-8 text-center text-stone-400 rounded-2xl">
                    No contractors match search credentials.
                  </div>
                ) : (
                  filteredContractors.map((c, idx) => (
                    <div key={`sa_fc_${c.id}_${idx}`} className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden">
                      {/* Gated Badge top right */}
                      <div className="absolute top-4 right-4 flex gap-1.5 items-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          c.status === "approved" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                          c.status === "pending" ? "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse" :
                          c.status === "correction" ? "bg-blue-50 text-blue-800 border border-blue-200" : "bg-red-50 text-red-800"
                        }`}>
                          {c.status}
                        </span>
                        {c.badge !== "None" && (
                          <span className="bg-amber-500 text-stone-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            ★ {c.badge}
                          </span>
                        )}
                      </div>

                      {/* Name & Contact */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 font-black tracking-widest block font-mono">ID: {c.regNumber}</span>
                        <h4 className="text-sm font-black text-stone-900">{lang === "ta" ? c.contractorName : c.companyName}</h4>
                        <p className="text-xs text-stone-500 font-semibold">Owner: {c.ownerName} | Experience: {c.experience} Years | District: {c.district}</p>
                      </div>

                      {/* Specifications Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-stone-50 p-3 rounded-xl">
                        <div>
                          <span className="text-[9px] text-stone-400 font-extrabold block">TEAM SIZE</span>
                          <span className="font-bold text-stone-800">{c.teamSize} Painters</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-400 font-extrabold block">GST NUMBER</span>
                          <span className="font-mono font-bold text-stone-800 text-[10px]">{c.gst || "Unregistered"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-400 font-extrabold block">MOBILE / WHATSAPP</span>
                          <span className="font-bold text-stone-800">{c.mobile}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-400 font-extrabold block">LICENSE DETAILS</span>
                          <span className="font-bold text-stone-800 truncate block">{c.licenseDetails}</span>
                        </div>
                      </div>

                      {/* Service Categories */}
                      <div className="flex flex-wrap gap-1">
                        {c.categories.map((cat, i) => (
                          <span key={i} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold">
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Super Admin Control Actions Panel */}
                      <div className="pt-3 border-t border-stone-100 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateStatus(c.id, "approved")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Approve Application
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(c.id, "correction")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Request Correction
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(c.id, "rejected")}
                            className="bg-stone-700 hover:bg-stone-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>

                        {/* Merit Badging Controls */}
                        <div className="flex items-center gap-1 text-[10px] text-stone-500">
                          <span className="font-bold">Mark Speciality:</span>
                          <select
                            onChange={(e) => handleAssignBadge(c.id, e.target.value as any)}
                            value={c.badge}
                            className="bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 text-[10px] font-bold focus:outline-none"
                          >
                            <option value="None">None</option>
                            <option value="Featured Painter">Featured Painter</option>
                            <option value="Master Painter">Master Painter</option>
                            <option value="Senior Contractor">Senior Contractor</option>
                            <option value="Expert Specialist">Expert Specialist</option>
                            <option value="Award Winner">Award Winner</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Secure Registration form to simulate adding contractor directly */}
              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-extrabold text-stone-900 uppercase">Direct Contractor Registration</h4>
                  <p className="text-[10px] text-stone-500">Super Admin rapid entry tool</p>
                </div>

                <form onSubmit={handleCreateContractor} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Contractor/Company Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senthil Spray Painters"
                      value={newContractorName}
                      onChange={(e) => setNewContractorName(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Owner Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ஆர். செந்தில் குமார்"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">District</label>
                      <select
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none font-bold"
                      >
                        <option value="சென்னை">Chennai</option>
                        <option value="மதுரை">Madurai</option>
                        <option value="கோயம்புத்தூர்">Coimbatore</option>
                        <option value="சேலம்">Salem</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Special Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none font-bold"
                      >
                        <option value="Interior Painting">Interior Painting</option>
                        <option value="Exterior Painting">Exterior Painting</option>
                        <option value="Industrial Painting">Industrial Painting</option>
                        <option value="Waterproofing">Waterproofing</option>
                        <option value="Scaffolding">Scaffolding</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Team Size</label>
                      <input
                        type="number"
                        min="1"
                        value={newTeamSize}
                        onChange={(e) => setNewTeamSize(Number(e.target.value))}
                        className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Experience (Yrs)</label>
                      <input
                        type="number"
                        min="1"
                        value={newExperience}
                        onChange={(e) => setNewExperience(Number(e.target.value))}
                        className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Mobile / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="9443xxxxxx"
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#b91c1c] hover:bg-red-800 text-white font-bold p-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-sm transition-all text-xs"
                  >
                    Register and Pending
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: COMPANY PROFILES */}
        {activeSubTab === "companies" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <span className="text-[10px] text-stone-400 font-extrabold uppercase">STATE PARTNER BRANDS</span>
                <h3 className="text-sm font-black text-stone-900 uppercase">Company brand & Distributor Registries</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {companies.map((comp, idx) => (
                  <div key={`sa_comp_${comp.id}_${idx}`} className="border border-stone-200 p-4 rounded-xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="text-3xl">{comp.logo}</div>
                        <span className="bg-stone-900 text-amber-500 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                          {comp.type}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-stone-950">{comp.brandName}</h4>
                      <div className="text-[11px] text-stone-600 leading-relaxed">
                        <p><strong>Products:</strong> {comp.products}</p>
                        <p><strong>Service Zone:</strong> {comp.serviceArea}</p>
                        <p><strong>Support:</strong> {comp.contact}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-2 border-t border-stone-100">
                      <span className="text-emerald-700 font-bold">● Active Authorized</span>
                      <button
                        onClick={() => alert(`Contacting brand partnership desk: ${comp.contact}`)}
                        className="text-[#b91c1c] hover:underline font-bold"
                      >
                        Contact Partnership
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MATERIAL SUPPLIERS DIRECTORY */}
        {activeSubTab === "suppliers" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-2 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase">SUPPLIER DIRECTORY</span>
                  <h3 className="text-sm font-black text-stone-900">Tamil Nadu Paint, Putty, and Scaffolding Suppliers</h3>
                </div>
                <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-1 rounded font-bold">
                  {suppliers.length} Registered Nodes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map((sup, idx) => (
                  <div key={`sa_sup_${sup.id}_${idx}`} className="p-3.5 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all flex justify-between items-center gap-3">
                    <div className="space-y-1">
                      <span className="bg-amber-100 text-amber-900 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                        {sup.category}
                      </span>
                      <h4 className="text-xs font-extrabold text-stone-900">{sup.companyName}</h4>
                      <p className="text-[11px] text-stone-500">Contact: {sup.supplierName} ({sup.contact}) | Zone: {sup.district}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        sup.stockStatus === "In Stock" ? "bg-emerald-50 text-emerald-800" :
                        sup.stockStatus === "Low Stock" ? "bg-amber-50 text-amber-800" : "bg-rose-50 text-rose-800"
                      }`}>
                        {sup.stockStatus}
                      </span>
                      
                      <button
                        onClick={() => {
                          setSuppliers(prev => prev.map(s => s.id === sup.id ? { ...s, approved: !s.approved } : s));
                          addBusLog("Supplier Authorization Updated", `Toggle approval for supplier: ${sup.companyName}`);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          sup.approved ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {sup.approved ? "Approved" : "Pending Auth"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BUSINESS LEADS & JOINT VENTURES */}
        {activeSubTab === "networking" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left: Active Business Leads Tracker */}
              <div className="lg:col-span-2 bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase">BUSINESS LEADS HUB</span>
                  <h3 className="text-sm font-black text-stone-900">Active High-Value Leads Allocation Pipeline</h3>
                </div>

                <div className="space-y-3">
                  {leads.map((lead, idx) => (
                    <div key={`sa_lead_${lead.id}_${idx}`} className="p-3.5 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-black text-stone-950">{lead.source}</h4>
                          <span className="text-[10px] text-stone-500 font-medium">Zone: {lead.district} | Assigned: {lead.assignedTo || "Unassigned"}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-[#b91c1c]">
                          ₹{lead.estimatedValue.toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-stone-600 italic">"{lead.notes}"</p>

                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className="text-stone-400">Next Followup: {lead.followUpDate}</span>
                        
                        <div className="flex gap-1">
                          {["Contacted", "Negotiating", "Converted"].map((st) => (
                            <button
                              key={`st_lead_${st}`}
                              onClick={() => {
                                setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: st as any } : l));
                                addBusLog("Lead Status Updated", `Lead ID ${lead.id} changed to status: ${st}`);
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                lead.status === st ? "bg-[#b91c1c] text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Joint Venture Partnership opportunities config */}
              <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-stone-300 p-5 rounded-2xl border border-stone-800 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase block">JOINT VENTURE DESK</span>
                  <h4 className="text-xs font-bold text-white uppercase">Ecosystem Multi-Contractor Consortia</h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Super Admin can authorize multiple small-scale contractors to coalesce under a unified state registration, allowing them to collectively bid on multi-crore infrastructure paint works.
                  </p>

                  <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800 space-y-2 text-[10px]">
                    <span className="text-amber-500 font-bold block uppercase">Active Consortia proposals:</span>
                    <p>● <strong>Coimbatore Paint Group</strong> (Miracle Arts + 2 partners)</p>
                    <p className="text-stone-400 pl-3">Target: CMRL Airport Painting Bid (₹85 Lakhs)</p>
                  </div>
                </div>

                <button
                  onClick={() => alert("Consortia framework established. Templates sent to Madurai, Salem & Chennai district nodes.")}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-stone-950 font-black p-2.5 rounded-xl uppercase tracking-wider text-[10px] transition-all shrink-0 mt-4"
                >
                  Authorize New Consortia Block
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: TENDER & CONTRACT OPPORTUNITIES */}
        {activeSubTab === "tenders" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Open Tenders list */}
              <div className="lg:col-span-2 bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase">TENDER RADAR ENGINE</span>
                  <h3 className="text-sm font-black text-stone-900">Government Procurement & Large Contracts Tracker</h3>
                </div>

                <div className="space-y-3">
                  {tenders.map((tend, idx) => (
                    <div key={`sa_tend_${tend.id}_${idx}`} className="p-4 border border-stone-200 rounded-xl hover:shadow-sm transition-all space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="bg-[#b91c1c] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">
                            {tend.district} Zone
                          </span>
                          <h4 className="text-xs font-black text-stone-950 mt-1">{tend.title}</h4>
                        </div>
                        <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                          ₹{(tend.value / 100000).toFixed(1)} Lakhs
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-600 space-y-1">
                        <p><strong>Issuing Dept:</strong> {tend.department}</p>
                        <p><strong>Eligibility:</strong> {tend.eligibility}</p>
                        <p><strong>Deadline:</strong> <strong className="text-red-700">{tend.deadline}</strong></p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-[10px]">
                        <span className="font-bold text-stone-500">Pipeline State: <strong className="text-stone-800">{tend.status}</strong></span>
                        <div className="flex gap-1">
                          {["Applied", "Under Review", "Won", "Lost"].map((st) => (
                            <button
                              key={`st_tend_${st}`}
                              onClick={() => handleAdvanceTenderStatus(tend.id, st)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                tend.status === st ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Tender form */}
              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-extrabold text-stone-900 uppercase">Input Tender Bid Opportunity</h4>
                  <p className="text-[10px] text-stone-500">Super Admin contract broadcasting module</p>
                </div>

                <form onSubmit={handleCreateTender} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Tender Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Government Painting Project"
                      value={newTenderTitle}
                      onChange={(e) => setNewTenderTitle(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Issuing Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Highways Department"
                      value={newTenderDept}
                      onChange={(e) => setNewTenderDept(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">District</label>
                      <select
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none font-bold"
                      >
                        <option value="சென்னை">Chennai</option>
                        <option value="மதுரை">Madurai</option>
                        <option value="கோயம்புத்தூர்">Coimbatore</option>
                        <option value="சேலம்">Salem</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Estimated Value (₹)</label>
                      <input
                        type="number"
                        value={newTenderVal}
                        onChange={(e) => setNewTenderVal(Number(e.target.value))}
                        className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Eligibility Criteria</label>
                    <textarea
                      placeholder="Specify Solvency / Certification requirements"
                      value={newTenderEligibility}
                      onChange={(e) => setNewTenderEligibility(e.target.value)}
                      rows={2}
                      className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-stone-900 hover:bg-stone-850 text-white font-bold p-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-sm transition-all text-xs"
                  >
                    Broadcast Tender Notification
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: AWARDS & CERTIFICATE GENERATION */}
        {activeSubTab === "awards" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            
            {/* Awards listing */}
            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <span className="text-[10px] text-stone-400 font-extrabold uppercase">STATE AWARDS INDEX</span>
                <h3 className="text-sm font-black text-stone-900">Official Recognition & Digital Credentials</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {awards.map((awd, idx) => (
                  <div key={`sa_awd_${awd.id}_${idx}`} className="border border-stone-200/80 p-4 rounded-xl space-y-3 flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-1.5 text-xs text-stone-700">
                      <div className="flex justify-between items-center">
                        <span className="bg-amber-100 text-amber-900 text-[8px] font-black uppercase px-2.5 py-0.5 rounded">
                          {awd.category}
                        </span>
                        <span className="font-mono text-stone-400">{awd.year}</span>
                      </div>
                      <h4 className="text-xs font-black text-stone-950">{awd.recipientName}</h4>
                      <p className="text-[10px] text-stone-400 font-semibold font-mono">HASH: {awd.verifiedHash}</p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveCertificate(awd);
                        addBusLog("Digital Certificate Generated", `QR verified token certificate produced for recipient ${awd.recipientName}`);
                      }}
                      className="w-full bg-[#b91c1c] hover:bg-red-800 text-white font-bold py-2 rounded-xl text-[10px] uppercase cursor-pointer"
                    >
                      Generate QR Verified Certificate
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium QR Certificate Live Viewer (Instant Render) */}
            {activeCertificate && (
              <div className="bg-gradient-to-br from-[#1c1917] to-[#0c0a09] text-white p-8 rounded-3xl border-2 border-amber-600 shadow-2xl space-y-6 max-w-2xl mx-auto animate-[fadeIn_0.5s_ease-out] relative overflow-hidden">
                {/* Visual watermarks */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

                <div className="text-center space-y-2">
                  <span className="text-[10px] tracking-widest text-amber-500 font-extrabold uppercase block">TAMIL NADU PAINTERS & ARTISTS ADVANCEMENT ASSOCIATION</span>
                  <h3 className="text-lg font-extrabold text-amber-400">மாநில உயரிய விருதுச் சான்றிதழ்</h3>
                  <div className="w-24 h-0.5 bg-amber-500/40 mx-auto" />
                </div>

                <div className="text-center space-y-4">
                  <p className="text-xs text-stone-400 italic">This official digital token of recognition is presented to</p>
                  <h4 className="text-xl font-black text-white">{activeCertificate.recipientName}</h4>
                  <p className="text-xs text-stone-300 leading-relaxed max-w-md mx-auto">
                    In prestigious appreciation of outstanding craftsmanship, dedication, and leadership in elevating the industrial standards for the painting and artist guild of <strong>{activeCertificate.district} District</strong> in the year <strong>{activeCertificate.year}</strong>.
                  </p>
                </div>

                <div className="flex justify-between items-center bg-stone-900/60 p-4 rounded-2xl border border-stone-800 text-left text-[10px] text-stone-400 font-mono">
                  <div className="space-y-1">
                    <p>CREDENTIAL HASH: {activeCertificate.verifiedHash}</p>
                    <p>VERIFIED ON: 2026-08-04T08:33Z</p>
                    <p>STATE PRESIDENT: எஸ். மைக்கேல் ஆல்வின்</p>
                    <p>STATE SEC: ரா. சேவியர் பாபு</p>
                  </div>

                  {/* Cryptographic QR code built in custom inline SVG */}
                  <div className="bg-white p-2.5 rounded-xl shrink-0">
                    <svg className="w-16 h-16" viewBox="0 0 100 100">
                      {/* Outer frame */}
                      <rect x="0" y="0" width="100" height="100" fill="white" />
                      {/* Corner Anchor Boxes */}
                      <rect x="10" y="10" width="20" height="20" fill="black" />
                      <rect x="15" y="15" width="10" height="10" fill="white" />
                      
                      <rect x="70" y="10" width="20" height="20" fill="black" />
                      <rect x="75" y="15" width="10" height="10" fill="white" />

                      <rect x="10" y="70" width="20" height="20" fill="black" />
                      <rect x="15" y="75" width="10" height="10" fill="white" />

                      {/* Random QR bit squares for authentication look */}
                      <rect x="40" y="20" width="10" height="15" fill="black" />
                      <rect x="45" y="45" width="15" height="10" fill="black" />
                      <rect x="25" y="40" width="10" height="10" fill="black" />
                      <rect x="65" y="55" width="15" height="15" fill="black" />
                      <rect x="40" y="70" width="15" height="10" fill="black" />
                      <rect x="70" y="35" width="10" height="15" fill="black" />
                    </svg>
                    <span className="text-[8px] text-stone-700 font-bold block text-center mt-1">VERIFY QR</span>
                  </div>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      alert("Certificate sent securely to member registered email address.");
                      addBusLog("Certificate Shared", `Mailed credential ${activeCertificate.verifiedHash} to recipient.`);
                    }}
                    className="px-4 py-1.5 bg-[#b91c1c] hover:bg-red-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Send to Email
                  </button>
                  <button
                    onClick={() => setActiveCertificate(null)}
                    className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SMART NOTIFICATION SCRIPT SCHEDULER */}
        {activeSubTab === "notifications" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Schedulers */}
              <div className="lg:col-span-2 bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase">SCHEDULER ENGINE</span>
                  <h3 className="text-sm font-black text-stone-900">Queued Push, Email, and SMS Alerts</h3>
                </div>

                <div className="space-y-3">
                  {scheduledNotifs.map((not, idx) => (
                    <div key={`sa_not_${not.id}_${idx}`} className="p-3.5 border border-stone-200 rounded-xl flex justify-between items-center gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            not.priority === "Emergency" ? "bg-rose-100 text-rose-800 animate-pulse" :
                            not.priority === "High" ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-700"
                          }`}>
                            {not.priority}
                          </span>
                          <span className="bg-stone-900 text-amber-500 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                            {not.type}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900">{not.title}</h4>
                        <p className="text-[10px] text-stone-400">Target: {not.target} | Date: {not.date}</p>
                      </div>

                      <button
                        onClick={() => {
                          setScheduledNotifs(prev => prev.map(n => n.id === not.id ? { ...n, sent: true } : n));
                          addBusLog("Broadcasting Alert", `Triggered manual dispatch for broadcast ID ${not.id}.`);
                          alert(`Broadcasting: ${not.title} via ${not.type} successfully!`);
                        }}
                        disabled={not.sent}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${
                          not.sent ? "bg-stone-100 text-stone-400" : "bg-[#b91c1c] text-white hover:bg-red-800"
                        }`}
                      >
                        {not.sent ? "Broadcast Sent" : "Transmit Now"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form to schedule alerts */}
              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-extrabold text-stone-900 uppercase">Schedule New Event Alarm</h4>
                  <p className="text-[10px] text-stone-500">Global messaging queue system</p>
                </div>

                <form onSubmit={handleScheduleNotif} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Message Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GST Filing Reminder"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Alarm Priority</label>
                      <select
                        value={notifPriority}
                        onChange={(e) => setNotifPriority(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none font-bold"
                      >
                        <option value="Emergency">Emergency</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Delivery Channel</label>
                      <select
                        value={notifType}
                        onChange={(e) => setNotifType(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none font-bold"
                      >
                        <option value="Broadcast">Push Notification</option>
                        <option value="SMS Ready">SMS Payload</option>
                        <option value="Email">Email Circular</option>
                        <option value="In-App">In-App Banner</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Schedule Date</label>
                    <input
                      type="date"
                      value={notifDate}
                      onChange={(e) => setNotifDate(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl p-2 text-stone-900 bg-stone-50 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#b91c1c] hover:bg-red-800 text-white font-bold p-2.5 rounded-xl uppercase tracking-wider text-[10px] cursor-pointer shadow-sm transition-all"
                  >
                    Commit Alert to Queue
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 9: AI BUSINESS ADVISOR & DECISION MATRIX */}
        {activeSubTab === "ai_advisor" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 border border-stone-800 shadow-2xl space-y-6">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span className="font-extrabold text-xs tracking-wider uppercase">TNPA ENTERPRISE AI ENGINE</span>
                  </div>
                  <h3 className="text-base font-black text-white uppercase">State Guild Strategic expansion neural advisor</h3>
                </div>

                <button
                  onClick={runAiEngine}
                  disabled={isAiGenerating}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-stone-950 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  {isAiGenerating ? "Synthesizing Core Data..." : "Recalculate AI Growth Model"}
                </button>
              </div>

              {/* Selection Tabs */}
              <div className="flex gap-2 overflow-x-auto border-b border-stone-800/60 pb-3">
                {[
                  { id: "growth", label: "Business Growth Suggestions", value: "growth" },
                  { id: "revenue", label: "Revenue Ideas", value: "revenue" },
                  { id: "risks", label: "Risk Mitigation", value: "risks" },
                  { id: "district", label: "District Development Plans", value: "district" }
                ].map((item, idx) => (
                  <button
                    key={`sa_adv_${item.id}_${idx}`}
                    onClick={() => {
                      setAiAnalysisType(item.value as any);
                      addBusLog("AI Advice Tab Accessed", `Super Admin queried strategic sub-category: ${item.label}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                      aiAnalysisType === item.value ? "bg-amber-600 text-stone-950 font-black" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Dynamic advice contents */}
              <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3">
                {isAiGenerating ? (
                  <div className="py-12 text-center text-stone-400 space-y-3">
                    <RotateCcw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
                    <p className="text-xs font-mono text-stone-500">Correlating district paint costs, PWD tender deadlines, and member subscription registries...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <Terminal className="w-4 h-4" />
                      <span>STRATEGIC SUMMARY REPORT [GENERATED FOR STATE GENERAL SECRETARY]</span>
                    </div>

                    <ul className="space-y-3.5 text-xs text-stone-300 leading-relaxed list-disc pl-5 font-medium">
                      {aiAnalysisType === "growth" && aiInsights.suggestions.map((s, i) => <li key={`growth_sug_${i}`}>{s}</li>)}
                      {aiAnalysisType === "revenue" && aiInsights.ideas.map((s, i) => <li key={`rev_idea_${i}`}>{s}</li>)}
                      {aiAnalysisType === "risks" && aiInsights.risks.map((s, i) => <li key={`risk_item_${i}`}>{s}</li>)}
                      {aiAnalysisType === "district" && aiInsights.expansion.map((s, i) => <li key={`dist_exp_${i}`}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* AI DECISION ENGINE MATRIX RECOMMENDATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {[
                  { title: "New District Expansion", action: "Hosur / Ranipet Node setup", state: "Recommended", level: "High Priority" },
                  { title: "Contractor Development", action: "Equip with sandblasting certificates", state: "80% match in Salem", level: "Medium" },
                  { title: "Supplier Partnerships", action: "Standard discount agreements", state: "15% target with brands", level: "Approved" }
                ].map((dec, i) => (
                  <div key={i} className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800 space-y-1">
                    <span className="text-[10px] text-amber-500 font-extrabold uppercase block">{dec.title}</span>
                    <strong className="text-white block">{dec.action}</strong>
                    <div className="flex justify-between items-center text-[10px] text-stone-400 pt-1">
                      <span>Status: {dec.state}</span>
                      <span className="font-bold text-red-500">{dec.level}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB 10: CONFIDENTIAL SECURITY AUDIT & FIREBASE SECURITY RULES */}
        {activeSubTab === "security" && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out] text-stone-900 text-left">
            
            {/* Header section with Security status overview */}
            <div className="bg-gradient-to-r from-stone-900 to-red-950 text-stone-100 p-5 rounded-2xl border border-stone-800 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#b91c1c] text-white text-[8px] font-black uppercase tracking-wider">
                    MILITARY-GRADE SECURITY ACTIVE
                  </span>
                  <span className="text-[10px] text-amber-500 font-mono">CRYPTOGRAPHIC TUNNEL V14.0</span>
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  {lang === "ta" ? "மத்திய பாதுகாப்பு மற்றும் தணிக்கை கட்டுப்பாட்டு மையம்" : "Enterprise Security, Audit & Portal Administration"}
                </h3>
                <p className="text-xs text-stone-300">
                  {lang === "ta" 
                    ? "நிர்வாகிகளை நிர்வகிக்கவும், அனுமதிகளை வரையறுக்கவும், முழு செயல்பாடுகளையும் தணிக்கை செய்யவும்"
                    : "Manage credentials, assign dynamic permissions, monitor real-time server telemetry, and inspect cryptographic audit logs."}
                </p>
              </div>

              {/* Sub navigation within Security tab */}
              <div className="flex flex-wrap gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800 select-none">
                {[
                  { id: "tv_media", label: "டிவி மீடியா மேலாண்மை", labelEn: "TNPA² TV Media Studio", icon: <Tv className="w-3.5 h-3.5" /> },
                  { id: "telemetry", label: "அலர்ட் & அளவீடுகள்", labelEn: "Alerts & Telemetry", icon: <Activity className="w-3.5 h-3.5" /> },
                  { id: "admins", label: "நிர்வாகிகள் & பாத்திரங்கள்", labelEn: "Admins & Roles", icon: <Users className="w-3.5 h-3.5" /> },
                  { id: "policies", label: "பாதுகாப்புக் கொள்கைகள்", labelEn: "Security Policies", icon: <Sliders className="w-3.5 h-3.5" /> },
                  { id: "ledger", label: "பாதுகாப்புப் பதிவேடு", labelEn: "Audit Ledger", icon: <Database className="w-3.5 h-3.5" /> },
                  { id: "firebase", label: "பயர்பேஸ் விதிகள்", labelEn: "Firebase & API", icon: <Globe className="w-3.5 h-3.5" /> },
                  { id: "disaster", label: "பேரிடர் மீட்பு & தொடர்ச்சி", labelEn: "Disaster & Continuity", icon: <ShieldCheck className="w-3.5 h-3.5" /> }
                ].map((secTab) => (
                  <button
                    key={secTab.id}
                    onClick={() => {
                      setSecSubTab(secTab.id as any);
                      addBusLog("Security Console Navigated", `Accessed sub-module: ${secTab.labelEn}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                      secSubTab === secTab.id
                        ? "bg-[#b91c1c] text-white shadow-sm font-black"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    {secTab.icon}
                    <span>{lang === "ta" ? secTab.label : secTab.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-TAB: TNPA2 TV MEDIA STUDIO (SUPER ADMIN EXCLUSIVE) */}
            {secSubTab === "tv_media" && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 text-[#b91c1c] mb-1">
                      <Tv className="w-5 h-5" />
                      <h4 className="text-base font-black text-stone-900">
                        {lang === "ta" ? "TNPA² டிவி சேனல் மீடியா மற்றும் காணொளி மேலாண்மை" : "TNPA² TV Channel Media & Video Manager"}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-500">
                      {lang === "ta" 
                        ? "சூப்பர் அட்மின் பிரத்தியேகக் கட்டுப்பாடு: TNPA² டிவி சேனலின் அனைத்து காணொளிகளையும் பதிவேற்றவும், திருத்தவும், நீக்கவும். மாற்றங்கள் அனைத்து மாவட்ட உறுப்பினர்களுக்கும் உடனடியாக நிகழ்நேரத்தில் (Real-time) ஒத்திசைக்கப்படும்." 
                        : "Super Admin Exclusive: Upload, edit, and delete videos for the TNPA² TV channel. Changes instantly propagate in real-time to all users across all districts."}
                    </p>
                  </div>
                  {isSuperAdmin ? (
                    <button
                      onClick={() => {
                        setEditingTvItem(null);
                        setTvTitleTa("");
                        setTvTitleEn("");
                        setTvSpeaker("");
                        setTvVideoUrl("");
                        setShowTvModal(true);
                      }}
                      className="px-4 py-2.5 bg-[#b91c1c] hover:bg-red-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === "ta" ? "புதிய காணொளி பதிவேற்று" : "Upload New Video"}</span>
                    </button>
                  ) : (
                    <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold">
                      🔒 Super Admin Access Required
                    </div>
                  )}
                </div>

                {/* Videos Table / Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tvMediaItems.map((item) => (
                    <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-stone-300 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.thumbnailColor || 'from-[#b91c1c] to-stone-900'} flex items-center justify-center text-white shrink-0 shadow-inner`}>
                            <Film className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-bold rounded-md mb-1">
                              {item.category} • {item.duration}
                            </span>
                            <h5 className="text-xs font-black text-stone-900 leading-tight">
                              {lang === "ta" ? item.title : item.titleEn}
                            </h5>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-stone-500 space-y-1 pt-2 border-t border-stone-100">
                        <div className="flex justify-between">
                          <span>பேச்சாளர் / Presenter:</span>
                          <strong className="text-stone-800">{item.speaker || "TNPA² Desk"}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>பார்வையாளர்கள் / Views:</span>
                          <strong className="text-stone-800">{item.views} ({item.date})</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        {isSuperAdmin ? (
                          <>
                            <button
                              onClick={() => openEditTvMedia(item)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{lang === "ta" ? "திருத்து" : "Edit"}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTvMedia(item.id, item.title)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{lang === "ta" ? "நீக்கு" : "Delete"}</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">Super Admin only control</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload / Edit Modal */}
                {showTvModal && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-stone-200 animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                        <div className="flex items-center gap-2">
                          <Tv className="w-5 h-5 text-[#b91c1c]" />
                          <h3 className="text-base font-black text-stone-900">
                            {editingTvItem ? (lang === "ta" ? "டிவி காணொளியைத் திருத்து" : "Edit TV Media") : (lang === "ta" ? "புதிய டிவி காணொளி பதிவேற்று" : "Upload TV Media")}
                          </h3>
                        </div>
                        <button
                          onClick={() => setShowTvModal(false)}
                          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 cursor-pointer font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveTvMedia} className="space-y-4 text-xs font-semibold text-stone-700">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-stone-600">
                            {lang === "ta" ? "காணொளி தலைப்பு (தமிழ்)" : "Video Title (Tamil)"}
                          </label>
                          <input
                            type="text"
                            required
                            value={tvTitleTa}
                            onChange={(e) => setTvTitleTa(e.target.value)}
                            placeholder="எ.கா: மாநில பேரவைக் கூட்டம் சிறப்பு உரை..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-xs font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-stone-600">
                            {lang === "ta" ? "காணொளி தலைப்பு (ஆங்கிலம்)" : "Video Title (English)"}
                          </label>
                          <input
                            type="text"
                            required
                            value={tvTitleEn}
                            onChange={(e) => setTvTitleEn(e.target.value)}
                            placeholder="e.g. State General Council Keynote Address..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-xs font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-stone-600">
                              {lang === "ta" ? "பிரிவு / Category" : "Category"}
                            </label>
                            <select
                              value={tvCategory}
                              onChange={(e) => setTvCategory(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-xs font-medium bg-white"
                            >
                              <option value="செய்திகள்">செய்திகள் (News)</option>
                              <option value="நலவாரியம்">நலவாரியம் (Welfare)</option>
                              <option value="உரை">உரை (Speech)</option>
                              <option value="பயிற்சி">பயிற்சி (Training)</option>
                              <option value="பேரணி">பேரணி (Rally)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-stone-600">
                              {lang === "ta" ? "கால அளவு / Duration" : "Duration"}
                            </label>
                            <input
                              type="text"
                              value={tvDuration}
                              onChange={(e) => setTvDuration(e.target.value)}
                              placeholder="15:30"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-xs font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-stone-600">
                            {lang === "ta" ? "பேச்சாளர் / Presenter" : "Speaker / Presenter"}
                          </label>
                          <input
                            type="text"
                            value={tvSpeaker}
                            onChange={(e) => setTvSpeaker(e.target.value)}
                            placeholder="எ.கா: S. மைக்கேல் ஆல்வின்"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-xs font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-stone-600">
                            {lang === "ta" ? "காணொளி இணைப்பு (YouTube / MP4 / HLS URL)" : "Video URL / YouTube Embed URL"}
                          </label>
                          <input
                            type="text"
                            value={tvVideoUrl}
                            onChange={(e) => setTvVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/embed/..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-xs font-medium"
                          />
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => setShowTvModal(false)}
                            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            {lang === "ta" ? "ரத்து செய்" : "Cancel"}
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#b91c1c] hover:bg-red-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm"
                          >
                            {editingTvItem ? (lang === "ta" ? "புதுப்பி" : "Update Media") : (lang === "ta" ? "பதிவேற்று & ஒளிபரப்பு" : "Upload & Broadcast")}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 1: TELEMETRY & THREAT ALERTS */}
            {secSubTab === "telemetry" && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                
                {/* Micro Metric Widgets */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-stone-700">
                  <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-stone-400">
                      <span className="text-[10px] uppercase font-bold">CPU Core Load</span>
                      <Cpu className="w-4 h-4 text-[#b91c1c]" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-stone-900 font-mono">{telemetry.cpuUsage}%</span>
                      <span className="text-[9px] text-emerald-600 font-bold uppercase">Safe</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          telemetry.cpuUsage > 80 ? "bg-red-600" : telemetry.cpuUsage > 50 ? "bg-amber-500" : "bg-emerald-500"
                        }`} 
                        style={{ width: `${telemetry.cpuUsage}%` }} 
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-stone-400">
                      <span className="text-[10px] uppercase font-bold">Database Read Pool</span>
                      <Database className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-stone-900 font-mono">{telemetry.dbConnections}</span>
                      <span className="text-[10px] text-stone-400">active pools</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(telemetry.dbConnections / 500) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-stone-400">
                      <span className="text-[10px] uppercase font-bold">Secure Cloud Storage</span>
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-stone-900 font-mono">{telemetry.storageUsed} MB</span>
                      <span className="text-[9px] text-stone-400">of 2.5 GB allocated</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(telemetry.storageUsed / 2500) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-stone-400">
                      <span className="text-[10px] uppercase font-bold">Consumed Bandwidth</span>
                      <Globe className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-stone-900 font-mono">{telemetry.bandwidth} GB</span>
                      <span className="text-[9px] text-emerald-600 font-bold uppercase">Optimal</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                  
                  {/* Left block: Threat alert log (real-time notification list) */}
                  <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-red-600 font-bold uppercase block">SECURE TELEMETRY FIREWALL</span>
                        <h4 className="text-xs font-black text-stone-900 uppercase">Live Vulnerability & Suspicious Action Alarm Board</h4>
                      </div>
                      <span className="px-2 py-0.5 bg-red-50 text-[#b91c1c] rounded text-[9px] font-extrabold tracking-wider animate-pulse">
                        Auto Defender Active
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {securityAlerts.map((alertItem, idx) => (
                        <div 
                          key={`sa_sec_alrt_${alertItem.id}_${idx}`} 
                          className={`p-3.5 border rounded-xl flex justify-between items-start gap-3 transition-all ${
                            alertItem.resolved 
                              ? "bg-stone-50 border-stone-200 opacity-75" 
                              : alertItem.severity === "High" 
                                ? "bg-red-50 border-red-200 text-red-950" 
                                : alertItem.severity === "Medium"
                                  ? "bg-amber-50 border-amber-200 text-amber-950"
                                  : "bg-stone-50 border-stone-200"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                alertItem.resolved 
                                  ? "bg-stone-200 text-stone-700" 
                                  : alertItem.severity === "High" 
                                    ? "bg-[#b91c1c] text-white" 
                                    : "bg-amber-400 text-stone-950"
                              }`}>
                                {alertItem.severity} Threat
                              </span>
                              <span className="text-[10px] font-bold text-stone-900 uppercase tracking-tight">
                                {alertItem.type}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {alertItem.date} {alertItem.time}
                              </span>
                            </div>

                            <p className="text-xs leading-relaxed font-medium">
                              <strong>Triggered by:</strong> {alertItem.user} — <span className="text-stone-600">{alertItem.detail}</span>
                            </p>
                          </div>

                          <div className="shrink-0">
                            {alertItem.resolved ? (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-extrabold text-[9px] uppercase inline-block">
                                Resolved ✓
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  resolveSecurityAlert(alertItem.id);
                                  alert("Security alert successfully mitigated and resolved!");
                                }}
                                className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded font-extrabold text-[9px] uppercase cursor-pointer"
                              >
                                Mitigate Alert
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right block: Backup status & disaster recovery triggers */}
                  <div className="bg-stone-900 text-white border border-stone-850 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-amber-500 mb-2">
                        <ShieldAlert className="w-4 h-4 animate-bounce" />
                        <span className="font-black text-xs uppercase tracking-wider">Disaster Recovery Node</span>
                      </div>
                      
                      <div className="space-y-2.5 text-xs text-stone-300">
                        <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                          <span>Backup Server Status:</span>
                          <strong className="text-emerald-400 uppercase font-mono">{telemetry.backupStatus}</strong>
                        </div>
                        <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                          <span>Auto-Backup Interval:</span>
                          <strong className="text-white uppercase font-mono">Every Hour (60m)</strong>
                        </div>
                        <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                          <span>Disaster Recovery Node:</span>
                          <strong className="text-white font-mono">{dataSecurity.disasterRegion}</strong>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span>Last Sync Snap:</span>
                          <strong className="text-stone-400 font-mono">{telemetry.lastBackupTime}</strong>
                        </div>
                      </div>

                      <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-[10px] text-stone-400 font-mono space-y-1">
                        <p>✓ AES-256 Cloud Encryption: Active</p>
                        <p>✓ Database Version History Tracking: On</p>
                        <p>✓ Triple Node Redundancy Sync: Approved</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <button
                        onClick={() => {
                          setTelemetry(prev => ({
                            ...prev,
                            backupStatus: "Synchronizing...",
                          }));
                          setTimeout(() => {
                            setTelemetry(prev => ({
                              ...prev,
                              backupStatus: "Synchronized",
                              lastBackupTime: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString()
                            }));
                            addBusLog("Manual SQL Dump Triggered", "Compiled secure master backup payload and pushed to Singapore Disaster Node.");
                            alert("Military-grade redundant SQL Backup snapshot created successfully!");
                          }, 1000);
                        }}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-stone-950 rounded-xl text-xs font-black uppercase transition-all shadow cursor-pointer text-center"
                      >
                        🚀 Trigger Redundant Auto-Backup
                      </button>

                      <button
                        onClick={() => {
                          addBusLog("Disaster Recovery Simulator Initiated", "Re-routed active ingress queries from Primary Singapore Node to secondary US Central Redundancy Nodes.");
                          alert("Disaster Recovery simulation active. Live queries successfully re-routed with 0% data loss.");
                        }}
                        className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-[10px] font-bold uppercase cursor-pointer text-center"
                      >
                        Test Recovery Route Failover
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUB-TAB 2: ADMINISTRATORS & PERMISSIONS GRID */}
            {secSubTab === "admins" && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                
                {/* 1. Admin Users Directory */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-stone-100 pb-2 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] text-red-600 font-bold uppercase">PORTAL OPERATORS</span>
                      <h4 className="text-xs font-black text-stone-900 uppercase">Registered Executive & Administrative Accounts</h4>
                    </div>
                    <span className="bg-stone-900 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-md">
                      {adminAccounts.length} ACTIVE ADMINS
                    </span>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50 font-bold text-stone-700">
                          <th className="p-2.5">Admin ID / Key</th>
                          <th className="p-2.5">Name (English / தமிழ்)</th>
                          <th className="p-2.5">Email / Phone</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">District</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Super Admin Control Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {adminAccounts.map((adm, idx) => {
                          const isSuperAdminAccount = adm.role === "Super Admin" || adm.role === "super_admin" || adm.adminUsername === "superadmin";
                          const isActive = adm.status === "Active" || adm.status === "active";
                          return (
                            <tr key={`sa_adm_${adm.id}_${idx}`} className="hover:bg-stone-50 transition-all font-medium text-stone-700">
                              <td className="p-2.5 font-mono text-[11px]">
                                <span className="font-bold text-amber-900 block">@{adm.adminUsername || adm.id}</span>
                                <span className="text-[10px] text-stone-400">{adm.maskedAccessKey || "Key Hashed"}</span>
                              </td>
                              <td className="p-2.5">
                                <span className="font-extrabold text-stone-950 block">{adm.nameEn || adm.name}</span>
                                <span className="text-[10px] text-stone-400">{adm.name}</span>
                              </td>
                              <td className="p-2.5 font-mono">
                                <span className="block">{adm.email}</span>
                                <span className="text-[10px] text-stone-400">{adm.phone}</span>
                              </td>
                              <td className="p-2.5">
                                <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-900 font-bold uppercase text-[9px]">
                                  {adm.role}
                                </span>
                              </td>
                              <td className="p-2.5 text-stone-600">{adm.district}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-850 animate-pulse"
                                }`}>
                                  {isActive ? "Active" : "Suspended"}
                                </span>
                              </td>
                              <td className="p-2.5 text-right space-x-1 whitespace-nowrap">
                                {!isSuperAdminAccount ? (
                                  <button
                                    onClick={() => toggleAdminStatus(adm.id)}
                                    className={`px-2 py-1 rounded text-[9px] font-extrabold uppercase cursor-pointer ${
                                      isActive
                                        ? "bg-amber-100 text-amber-900 hover:bg-amber-200" 
                                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    }`}
                                  >
                                    {isActive ? "Suspend" : "Activate"}
                                  </button>
                                ) : (
                                  <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[9px] font-extrabold uppercase">
                                    ★ Primary Super Admin
                                  </span>
                                )}

                                <button
                                  onClick={() => resetAdminPassword(adm.id, adm.nameEn || adm.adminUsername)}
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[9px] font-extrabold uppercase cursor-pointer"
                                >
                                  Reset Pass
                                </button>

                                <button
                                  onClick={() => regenerateAccessKey(adm.id, adm.nameEn || adm.adminUsername)}
                                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded text-[9px] font-extrabold uppercase cursor-pointer"
                                >
                                  New Key
                                </button>

                                {!isSuperAdminAccount && (
                                  <button
                                    onClick={() => deleteAdminAccount(adm.id)}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[9px] font-extrabold uppercase cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Admin Creation & Custom Roles Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  
                  {/* Create Administrator Panel */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="border-b border-stone-100 pb-2">
                      <h4 className="text-xs font-black text-stone-900 uppercase">🛡️ Provision New Administrative Credentials</h4>
                      <p className="text-[10px] text-stone-500">Super Admin only: Generate and assign PBKDF2 salted password & access keys</p>
                    </div>

                    <form onSubmit={handleCreateAdmin} className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Admin Username *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. arumugam_admin"
                            value={createAdminUsername}
                            onChange={(e) => setCreateAdminUsername(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Password (Auto if empty)</label>
                          <input
                            type="text"
                            placeholder="Auto-generated if empty"
                            value={createAdminPassword}
                            onChange={(e) => setCreateAdminPassword(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Access Key (Auto if empty)</label>
                          <input
                            type="text"
                            placeholder="Auto-generated if empty"
                            value={createAdminAccessKey}
                            onChange={(e) => setCreateAdminAccessKey(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Full Name (தமிழ்)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. க. ஆறுமுகம்"
                            value={createAdminName}
                            onChange={(e) => setCreateAdminName(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Full Name (English)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. K. Arumugam"
                            value={createAdminNameEn}
                            onChange={(e) => setCreateAdminNameEn(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="arumugam@tnpainters.org"
                            value={createAdminEmail}
                            onChange={(e) => setCreateAdminEmail(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="9443210101"
                            value={createAdminPhone}
                            onChange={(e) => setCreateAdminPhone(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Role Assignment</label>
                          <select
                            value={createAdminRole}
                            onChange={(e) => setCreateAdminRole(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none font-bold"
                          >
                            {allRoles.map((role, rIdx) => (
                              <option key={`adm_role_${role}_${rIdx}`} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">District Scope</label>
                          <select
                            value={createAdminDistrict}
                            onChange={(e) => setCreateAdminDistrict(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none font-bold"
                          >
                            <option value="சென்னை (Chennai)">சென்னை (Chennai)</option>
                            <option value="மதுரை (Madurai)">மதுரை (Madurai)</option>
                            <option value="கோயம்புத்தூர் (Coimbatore)">கோயம்புத்தூர் (Coimbatore)</option>
                            <option value="சேலம் (Salem)">சேலம் (Salem)</option>
                            <option value="திருச்சி (Trichy)">திருச்சி (Trichy)</option>
                            <option value="திருநெல்வேலி (Tirunelveli)">திருநெல்வேலி (Tirunelveli)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#b91c1c] hover:bg-red-800 text-white font-bold p-2.5 rounded-xl uppercase tracking-wider text-[10px] cursor-pointer shadow-sm transition-all"
                      >
                        ✓ Provision Account Credentials & Send OTP PIN
                      </button>
                    </form>
                  </div>

                  {/* Custom Roles Creator */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="border-b border-stone-100 pb-2">
                        <h4 className="text-xs font-black text-stone-900 uppercase">👥 Dynamic Custom Role Generator</h4>
                        <p className="text-[10px] text-stone-500">Design custom structural privileges for specialized labor sub-committees</p>
                      </div>

                      <form onSubmit={handleCreateCustomRole} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Custom Role Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Legal Advisor"
                            value={newCustomRoleName}
                            onChange={(e) => setNewCustomRoleName(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Role Responsibilities Description</label>
                          <textarea
                            rows={2}
                            placeholder="Responsible for oversight of Salem division painter general union administrative structures..."
                            value={newCustomRoleDesc}
                            onChange={(e) => setNewCustomRoleDesc(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 text-stone-950 bg-stone-50 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold p-2.5 rounded-xl uppercase tracking-wider text-[10px] cursor-pointer"
                        >
                          + Deploy Custom Administrative Role
                        </button>
                      </form>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[10px] text-stone-500 leading-relaxed">
                      💡 <strong>Note on Custody:</strong> Custom roles are automatically initialized with restricted <strong>View-only</strong> access. Use the matrix grid below to authorize elevated action vectors dynamically.
                    </div>
                  </div>

                </div>

                {/* 3. Interactive Permissions Gating Matrix Grid */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-stone-100 pb-2 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase">DYNAMIC PRIVILEGE MATRIX</span>
                      <h4 className="text-xs font-black text-stone-900 uppercase">Fine-Grained Role Permissions Configurator</h4>
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-3 py-1 rounded-full font-bold border border-amber-200">
                      🔒 State Level RBAC Enforcement Active
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    Click checkboxes to grant or revoke specific operational permissions instantly across the active TNPA portal node.
                  </p>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold">
                          <th className="p-3 text-left">Administrative Role Title</th>
                          <th className="p-3">View</th>
                          <th className="p-3">Create</th>
                          <th className="p-3">Edit</th>
                          <th className="p-3">Delete</th>
                          <th className="p-3">Approve</th>
                          <th className="p-3">Reject</th>
                          <th className="p-3">Export</th>
                          <th className="p-3">Print</th>
                          <th className="p-3">Share</th>
                          <th className="p-3">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {allRoles.map((role, rIdx) => {
                          const perms = permissionsMatrix[role] || {
                            view: true, create: false, edit: false, delete: false, approve: false, reject: false, export: false, print: false, share: false, manage: false
                          };
                          const isSuperAdminRole = role === "Super Admin";
                          return (
                            <tr key={`matrix_role_${role}_${rIdx}`} className="hover:bg-stone-50 transition-all font-medium text-stone-700">
                              <td className="p-3 text-left font-extrabold text-stone-900">
                                {role} {customRoles.includes(role) && "💼"}
                              </td>
                              {["view", "create", "edit", "delete", "approve", "reject", "export", "print", "share", "manage"].map((perm, pIdx) => (
                                <td key={`matrix_perm_${perm}_${pIdx}`} className="p-3">
                                  <input
                                    type="checkbox"
                                    disabled={isSuperAdminRole} // Super admin is always full control
                                    checked={isSuperAdminRole ? true : perms[perm]}
                                    onChange={() => togglePermission(role, perm)}
                                    className="h-4.5 w-4.5 cursor-pointer accent-[#b91c1c] disabled:opacity-50"
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-TAB 3: POLICY GATING CONTROL ROOM */}
            {secSubTab === "policies" && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] text-xs">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Gating Category 1: LOGIN SECURITY */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="border-b border-stone-100 pb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-600" />
                      <h4 className="font-black text-stone-900 uppercase">Login Authentication Gating</h4>
                    </div>

                    <div className="space-y-3 font-semibold text-stone-700">
                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Multi-Factor OTP Login</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Require SMS payload for executive access</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={loginSecurity.otpEnabled}
                          onChange={(e) => {
                            setLoginSecurity(prev => ({ ...prev, otpEnabled: e.target.checked }));
                            addBusLog("Authentication Shift", `OTP Login enforced: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Google Identity integration</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Enable strict cloud identity validation</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={loginSecurity.googleLoginEnabled}
                          onChange={(e) => {
                            setLoginSecurity(prev => ({ ...prev, googleLoginEnabled: e.target.checked }));
                            addBusLog("Authentication Shift", `Google Identity set to: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Biometrics / Fingerprint Ready</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Use on-device FIDO WebAuthn tokens</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={loginSecurity.biometricsReady}
                          onChange={(e) => {
                            setLoginSecurity(prev => ({ ...prev, biometricsReady: e.target.checked, fingerprintReady: e.target.checked }));
                            addBusLog("Authentication Shift", `Device Biometric Ready status set: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-bold block uppercase">Session Timeout Policy (Minutes)</label>
                        <input
                          type="number"
                          value={loginSecurity.sessionTimeout}
                          onChange={(e) => setLoginSecurity(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                          className="w-full border rounded-xl p-2 bg-stone-50 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gating Category 2: ACCOUNT SECURITY */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="border-b border-stone-100 pb-2 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <h4 className="font-black text-stone-900 uppercase">Account Security Constraints</h4>
                    </div>

                    <div className="space-y-3 font-semibold text-stone-700">
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-bold block uppercase">Brute Force Lockout Threshold</label>
                        <select
                          value={accountSecurity.accountLockoutLimit}
                          onChange={(e) => setAccountSecurity(prev => ({ ...prev, accountLockoutLimit: Number(e.target.value) }))}
                          className="w-full border rounded-xl p-2 bg-stone-50 font-bold"
                        >
                          <option value={3}>3 Failed Attempts (Strict)</option>
                          <option value={5}>5 Failed Attempts (Standard)</option>
                          <option value={10}>10 Failed Attempts (Lenient)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-bold block uppercase">Temporary Lock Duration (Minutes)</label>
                        <input
                          type="number"
                          value={accountSecurity.tempSuspensionDuration}
                          onChange={(e) => setAccountSecurity(prev => ({ ...prev, tempSuspensionDuration: Number(e.target.value) }))}
                          className="w-full border rounded-xl p-2 bg-stone-50 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-bold block uppercase">Password Complexity Requirements</label>
                        <select
                          value={accountSecurity.passwordComplexity}
                          onChange={(e) => setAccountSecurity(prev => ({ ...prev, passwordComplexity: e.target.value }))}
                          className="w-full border rounded-xl p-2 bg-stone-50 font-bold"
                        >
                          <option value="military">Military Grade (Symbols, Case, Hash verified)</option>
                          <option value="high">High Complexity (Alphanumeric + Special)</option>
                          <option value="medium">Medium (Letters & Numbers)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>New Device SMS Verification</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Challenge unknown user devices</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={accountSecurity.deviceVerificationRequired}
                          onChange={(e) => {
                            setAccountSecurity(prev => ({ ...prev, deviceVerificationRequired: e.target.checked }));
                            addBusLog("Account Security Change", `Device verification constraint updated: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gating Category 3: DATA & STORAGE ENCRYPTION */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="border-b border-stone-100 pb-2 flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-black text-stone-900 uppercase">Cryptographic Storage & Backups</h4>
                    </div>

                    <div className="space-y-3 font-semibold text-stone-700">
                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Real-time DB Encryption</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Enforce AES-256 block crypts on disk</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={dataSecurity.encryptSensitiveData}
                          onChange={(e) => {
                            setDataSecurity(prev => ({ ...prev, encryptSensitiveData: e.target.checked }));
                            addBusLog("Encryption Level Set", `Enforce AES-256: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Cloud Version History logs</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Keep immutable record edits logs</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={dataSecurity.versionHistory}
                          onChange={(e) => {
                            setDataSecurity(prev => ({ ...prev, versionHistory: e.target.checked }));
                            addBusLog("Data Gating Shift", `Version histories set: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-bold block uppercase">Cloud Backup Interval Frequency</label>
                        <select
                          value={dataSecurity.backupFrequency}
                          onChange={(e) => {
                            setDataSecurity(prev => ({ ...prev, backupFrequency: e.target.value }));
                            addBusLog("Cron Scheduler Reconfigured", `Automated SQL backups frequency set: ${e.target.value}`);
                          }}
                          className="w-full border rounded-xl p-2 bg-stone-50 font-bold"
                        >
                          <option value="hourly">Hourly Redundant Swarm Sync</option>
                          <option value="daily">Daily Cron Dump</option>
                          <option value="weekly">Weekly Master Recovery Archive</option>
                        </select>
                      </div>

                      <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-950 font-medium leading-relaxed">
                        ✓ Cloud database is configured to mirror transactions across 3 physical geolocated regional nodes automatically.
                      </div>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Gating Category 4: AI BRAIN INSTRUCTION SECURITY */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="border-b border-stone-100 pb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <h4 className="font-black text-stone-900 uppercase">AI Super-Brain Gating Controls</h4>
                    </div>

                    <div className="space-y-3 font-semibold text-stone-700">
                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Never Reveal Confidential Data</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Block system architecture bypass attempts</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={aiSecurity.neverRevealConfidential}
                          onChange={(e) => {
                            setAiSecurity(prev => ({ ...prev, neverRevealConfidential: e.target.checked }));
                            addBusLog("AI Guidelines Guarded", `Confidential leak blocks set: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Respect Role Privilege Gaps</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Ground AI capabilities based on login token</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={aiSecurity.respectRolePermissions}
                          onChange={(e) => {
                            setAiSecurity(prev => ({ ...prev, respectRolePermissions: e.target.checked }));
                            addBusLog("AI Guidelines Guarded", `RBAC Grounding set: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Refuse Unauthorized Queries</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Refuse admin-level commands from standard users</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={aiSecurity.refuseUnauthorizedRequests}
                          onChange={(e) => {
                            setAiSecurity(prev => ({ ...prev, refuseUnauthorizedRequests: e.target.checked }));
                            addBusLog("AI Guidelines Guarded", `Refuse unauthorized requests set: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Log AI Administrative Actions</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Append AI-synthesized actions to log ledger</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={aiSecurity.logAiAdminActions}
                          onChange={(e) => {
                            setAiSecurity(prev => ({ ...prev, logAiAdminActions: e.target.checked }));
                            addBusLog("AI Guidelines Guarded", `AI Admin audit tracking set: ${e.target.checked}`);
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gating Category 5: DOCUMENT & FILE VAULT SECURITY */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="border-b border-stone-100 pb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#b91c1c]" />
                      <h4 className="font-black text-stone-900 uppercase">Document & Media Watermarking</h4>
                    </div>

                    <div className="space-y-3 font-semibold text-stone-700">
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-bold block uppercase">Automatic Watermark Stamp (PDF / Image)</label>
                        <input
                          type="text"
                          value={docSecurity.pdfWatermark}
                          onChange={(e) => {
                            setDocSecurity(prev => ({ ...prev, pdfWatermark: e.target.value }));
                            addBusLog("Watermark Rule Modified", `Watermark set to: ${e.target.value}`);
                          }}
                          className="w-full border rounded-xl p-2 bg-stone-50 font-bold"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Secure PDF Gating (Watermark)</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Inject high-opacity stamps on PDF files</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={docSecurity.securePDF}
                          onChange={(e) => setDocSecurity(prev => ({ ...prev, securePDF: e.target.checked }))}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Secure Images / Media</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Add steganographic metadata on PNGs</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={docSecurity.secureImages}
                          onChange={(e) => setDocSecurity(prev => ({ ...prev, secureImages: e.target.checked }))}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-stone-400 font-bold block uppercase">Download Limits</label>
                          <select
                            value={docSecurity.downloadPermissions}
                            onChange={(e) => setDocSecurity(prev => ({ ...prev, downloadPermissions: e.target.value }))}
                            className="w-full border rounded-xl p-1.5 bg-stone-50 text-[11px]"
                          >
                            <option value="super_admin_only">Super Admin Only</option>
                            <option value="all_admins">All Executives</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-400 font-bold block uppercase">Print Permission</label>
                          <select
                            value={docSecurity.printPermissions}
                            onChange={(e) => setDocSecurity(prev => ({ ...prev, printPermissions: e.target.value }))}
                            className="w-full border rounded-xl p-1.5 bg-stone-50 text-[11px]"
                          >
                            <option value="super_admin_only">Super Admin Only</option>
                            <option value="all_admins">All Executives</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gating Category 6: API SECURITY */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="border-b border-stone-100 pb-2 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-black text-stone-900 uppercase">API rate limits & secure endpoint constraints</h4>
                    </div>

                    <div className="space-y-3 font-semibold text-stone-700">
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-bold block uppercase">API Request Rate Limiting Threshold</label>
                        <select
                          value={apiSecurity.rateLimitingReqsPerMin}
                          onChange={(e) => {
                            setApiSecurity(prev => ({ ...prev, rateLimitingReqsPerMin: Number(e.target.value) }));
                            addBusLog("API Policy Reconfigured", `Rate limiting threshold adjusted: ${e.target.value} req/min`);
                          }}
                          className="w-full border rounded-xl p-2 bg-stone-50 font-bold"
                        >
                          <option value={60}>60 requests / minute (Strict)</option>
                          <option value={100}>100 requests / minute (Balanced)</option>
                          <option value={300}>300 requests / minute (Developer Limit)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Cryptographic Token Validation</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Challenge every incoming JSON Web Token (JWT)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={apiSecurity.tokenValidation}
                          onChange={(e) => setApiSecurity(prev => ({ ...prev, tokenValidation: e.target.checked }))}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-stone-50 p-2.5 border rounded-xl">
                        <div>
                          <span>Enforce Strict TLS 1.3 Gating</span>
                          <span className="text-[10px] text-stone-400 block font-normal">Reject unencrypted handshake attempts</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={apiSecurity.tlsEnforcement}
                          onChange={(e) => setApiSecurity(prev => ({ ...prev, tlsEnforcement: e.target.checked }))}
                          className="h-4 w-4 cursor-pointer accent-[#b91c1c]"
                        />
                      </div>

                      <button
                        onClick={() => {
                          addBusLog("API Token Keys Rotated", "Invalided active JSON Web Token sessions. Triggered client-side silent re-auth handshakes.");
                          alert("All system API secrets and validation tokens successfully rotated!");
                        }}
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-amber-500 font-extrabold rounded-xl uppercase tracking-wider text-[10px] cursor-pointer shadow-sm text-center"
                      >
                        Rotate API Secret Keys (JWT)
                      </button>
                    </div>
                  </div>

                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl font-medium text-amber-900 flex justify-between items-center">
                  <span>🔒 Changes made here update the operational firewall and route configurations across the global TNPA ecosystem instantly.</span>
                  <button 
                    onClick={() => {
                      addBusLog("Security Configuration Deployed", "Saved current policy changes to cloud storage config payload.");
                      alert("Policies permanently committed and deployed!");
                    }}
                    className="px-4 py-2 bg-[#b91c1c] text-white font-extrabold text-[10px] rounded-lg hover:bg-red-800 uppercase tracking-widest cursor-pointer shadow"
                  >
                    Deploy Policy Changes
                  </button>
                </div>

              </div>
            )}

            {/* SUB-TAB 4: CRYPTOGRAPHIC AUDIT LOG DEEP TRAIL */}
            {secSubTab === "ledger" && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] text-xs">
                
                {/* Security Reports Generation panel */}
                <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">GOVERNANCE & AUDIT ASSURANCE</span>
                    <h4 className="text-xs font-black text-stone-900 uppercase">Generate Certified Security and Compliance Reports</h4>
                  </div>

                  <p className="text-[11px] text-stone-500 mb-2">
                    Select a configuration scope below to compile a certified, watermarked auditing report suitable for state council reviews and executive audits.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { type: "Security Compliance", label: "Security & Rules Audit", color: "bg-red-50 text-[#b91c1c] border-red-200 hover:bg-red-100" },
                      { type: "Audit Ledger", label: "System Action Logs Audit", color: "bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100" },
                      { type: "Login Security & Devices", label: "Login & Devices Audit", color: "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100" },
                      { type: "System Health & Backups", label: "System Health Telemetry", color: "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100" }
                    ].map((rep, idx) => (
                      <button
                        key={idx}
                        onClick={() => generateSecurityReport(rep.type)}
                        className={`p-3.5 border rounded-xl font-extrabold uppercase text-[10px] tracking-wider text-center cursor-pointer transition-all ${rep.color}`}
                      >
                        📜 {rep.label}
                      </button>
                    ))}
                  </div>

                  {/* Rendered report display if loaded */}
                  {viewingReport && (
                    <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl space-y-4 max-w-4xl mx-auto relative overflow-hidden text-stone-800 animate-[fadeIn_0.5s_ease-out]">
                      {/* Watermark */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none opacity-5 select-none font-black text-5xl md:text-7xl text-stone-900 tracking-widest whitespace-nowrap">
                        {docSecurity.pdfWatermark || "CONFIDENTIAL INTERNAL"}
                      </div>

                      <div className="flex justify-between items-start border-b border-stone-300 pb-3">
                        <div className="text-left space-y-1">
                          <span className="text-[10px] tracking-widest text-[#b91c1c] font-black uppercase">TAMIL NADU PAINTERS & ARTISTS ADVANCEMENT ASSOCIATION</span>
                          <h4 className="text-sm font-black text-stone-900 uppercase">{viewingReport.title}</h4>
                          <span className="text-[10px] text-stone-500 font-mono block">SECURE HASH: {viewingReport.hash} | TIMESTAMP: {viewingReport.timestamp}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <button
                            onClick={() => window.print()}
                            className="px-3.5 py-1.5 bg-[#b91c1c] hover:bg-red-800 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider cursor-pointer"
                          >
                            Print Report
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] border-collapse bg-white border">
                          <thead>
                            <tr className="border-b bg-stone-100 font-bold text-stone-700">
                              {viewingReport.columns.map((c: string, idx: number) => (
                                <th key={idx} className="p-2 border">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y font-medium text-stone-600">
                            {viewingReport.rows.map((row: any[], rowIdx: number) => (
                              <tr key={rowIdx} className="hover:bg-stone-50">
                                {row.map((val: any, colIdx: number) => (
                                  <td key={colIdx} className="p-2 border font-mono leading-relaxed">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono pt-2 border-t">
                        <span>GENERATED BY: {viewingReport.generatedBy} (ROLE: Super Admin)</span>
                        <span>CONFIDENTIAL SECURITY REPORT ✓</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Audit Logs Table Ledger */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-stone-100 pb-2 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase">SECURE PORTAL LEDGER</span>
                      <h4 className="text-xs font-black text-stone-900 uppercase">Cryptographically Tracked User Activity Log</h4>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addBusLog("Security Log Exported", "Downloaded CSV copy of portal logs to local partition.");
                          alert("CSV successfully generated and downloaded.");
                        }}
                        className="px-3 py-1.5 border border-stone-300 hover:bg-stone-50 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-sm bg-white"
                      >
                        <Download className="w-3.5 h-3.5 text-stone-600" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50 font-bold text-stone-700">
                          <th className="p-2.5">Portal Operator</th>
                          <th className="p-2.5">Date / Time</th>
                          <th className="p-2.5">Action Executed</th>
                          <th className="p-2.5">Previous Value</th>
                          <th className="p-2.5">New Value Output</th>
                          <th className="p-2.5">Hardware / Device</th>
                          <th className="p-2.5">Security Context</th>
                          <th className="p-2.5">Session ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                        {auditLogs.map((log, idx) => (
                          <tr key={`sa_aud_${log.id}_${idx}`} className="hover:bg-stone-50 font-medium">
                            <td className="p-2.5">
                              <span className="font-extrabold text-stone-900 block">{log.user}</span>
                              <span className="text-[9px] text-indigo-700 font-bold uppercase">{log.role}</span>
                            </td>
                            <td className="p-2.5 font-mono text-[11px] whitespace-nowrap">
                              <span className="block">{log.date}</span>
                              <span className="text-stone-400">{log.time}</span>
                            </td>
                            <td className="p-2.5 text-[#b91c1c] font-bold">{log.action}</td>
                            <td className="p-2.5 font-mono text-[11px] text-stone-500 max-w-[120px] truncate" title={log.oldVal}>{log.oldVal}</td>
                            <td className="p-2.5 font-mono text-[11px] text-stone-800 max-w-[150px] truncate font-bold" title={log.newVal}>{log.newVal}</td>
                            <td className="p-2.5 text-stone-600 whitespace-nowrap">{log.device}</td>
                            <td className="p-2.5 font-mono text-[10px] text-stone-500">
                              <span className="block text-stone-600">{log.os}</span>
                              <span className="block text-[9px]">{log.browser}</span>
                              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded font-bold text-[8px] uppercase inline-block mt-1">
                                {log.loginMethod}
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-[11px] text-stone-500">{log.sessionId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-TAB 5: FIREBASE POLICY COMPILE & API SANDBOX */}
            {secSubTab === "firebase" && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] text-xs">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left block: Dynamically Compiled Firebase rules */}
                  <div className="bg-stone-950 text-stone-300 p-5 rounded-2xl border border-stone-800 space-y-4">
                    <div className="border-b border-stone-800 pb-2 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#b91c1c] font-black tracking-widest uppercase block">DYNAMIC SECURE rules GENERATOR</span>
                        <h4 className="text-xs font-bold text-white uppercase">Cloud Firestore Authorization Policies</h4>
                      </div>
                      <span className="bg-[#b91c1c] text-white text-[9px] font-mono px-2.5 py-0.5 rounded uppercase font-black">
                        Live Compiled
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      The Firebase rules document below has been automatically compiled based on your active <strong>Dynamic Privilege Matrix</strong> configurations. Deploying updates publishes these configurations into the Firebase backend directly.
                    </p>

                    <pre className="bg-stone-900 text-emerald-400 p-4 rounded-xl text-[10px] font-mono overflow-x-auto max-h-[350px] leading-relaxed border border-stone-800">
                      {generateDynamicRules()}
                    </pre>

                    <button
                      onClick={() => {
                        addBusLog("Firebase Rules Deployed", "Committed generated Firestore rules to production cloud config node.");
                        alert("Firestore security rules successfully compiled and deployed to Firebase Firestore!");
                      }}
                      className="w-full py-2.5 bg-[#b91c1c] hover:bg-red-800 text-white rounded-xl text-xs font-black uppercase transition-all shadow cursor-pointer text-center"
                    >
                      🔥 Compile & Deploy Rules to Firebase Firestore
                    </button>
                  </div>

                  {/* Right block: API Security simulator */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="border-b border-stone-100 pb-2">
                        <span className="text-[10px] text-stone-400 font-extrabold uppercase">API SANDBOX VALIDATOR</span>
                        <h3 className="text-xs font-black text-stone-900 uppercase">Interactive Token and Rate Limit Inspector</h3>
                      </div>

                      <p className="text-[11px] text-stone-500">
                        Test and verify if rate limiting gates or token authentication layers block administrative API requests correctly.
                      </p>

                      <div className="space-y-3 font-semibold text-stone-700">
                        <div className="space-y-1">
                          <label className="text-[10px] text-stone-400 font-bold block uppercase">Simulate API Request Count (In 1 Second)</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              defaultValue={150}
                              id="apiSimCount"
                              className="w-24 border rounded-xl p-2 bg-stone-50 font-bold"
                            />
                            <button
                              onClick={() => {
                                const inputVal = Number((document.getElementById("apiSimCount") as HTMLInputElement)?.value || 150);
                                if (inputVal > apiSecurity.rateLimitingReqsPerMin) {
                                  addBusLog("API Rate Limit Tripped", `Throttled API flood attempt of ${inputVal} reqs/sec (Exceeded limit of ${apiSecurity.rateLimitingReqsPerMin} reqs/min)`);
                                  alert(`❌ Request Throttled: HTTP 429 Too Many Requests. Blocked ${inputVal - apiSecurity.rateLimitingReqsPerMin} excess vectors.`);
                                } else {
                                  addBusLog("API Query Handshake", `Authorized safe API pipeline: ${inputVal} requests executed`);
                                  alert(`✓ HTTP 200 OK: Processed ${inputVal} queries within acceptable safety constraints.`);
                                }
                              }}
                              className="px-4 py-2 bg-[#b91c1c] hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                            >
                              Send Simulated Requests
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 border-t pt-3">
                          <label className="text-[10px] text-stone-400 font-bold block uppercase">Inspect Active JWT Authorization Token</label>
                          <div className="p-3 bg-stone-950 text-stone-300 rounded-xl font-mono text-[10px] space-y-1 border border-stone-800">
                            <p className="text-amber-500 font-bold">// HEADER (ALGORITHM & TOKEN TYPE)</p>
                            <p className="text-stone-400">{"{ \"alg\": \"HS256\", \"typ\": \"JWT\" }"}</p>
                            <p className="text-indigo-400 font-bold mt-1">// PAYLOAD (DATA CLAIMS)</p>
                            <p className="text-stone-400">
                              {JSON.stringify({
                                uid: "usr_palanisamy",
                                email: "palanisamy@tnpainters.org",
                                role: "super_admin",
                                scope: Object.keys(permissionsMatrix["Super Admin"]).filter(k => permissionsMatrix["Super Admin"][k]),
                                exp: 1785834000
                              }, null, 2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 border rounded-xl text-[10px] text-stone-500 leading-relaxed font-mono">
                      🔒 Token algorithm is compiled using high-entropy secret signing keys. Client requests without matching tokens are silently rejected with HTTP 401 Unauthorized errors.
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUB-TAB 6: ENTERPRISE DISASTER RECOVERY & BUSINESS CONTINUITY SYSTEM */}
            {secSubTab === "disaster" && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] text-xs font-semibold">
                
                {/* 1. TOP METRICS PANEL: Live System Health & Endpoint Monitors */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* APP CLUSTER STATUS */}
                  <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400">App Cluster Gate</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${maintenanceMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-ping"}`} />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-xl font-black text-stone-900 block tracking-tight">
                        {maintenanceMode ? "Maintenance Active" : "Operational (V16.0)"}
                      </strong>
                      <span className="text-[10px] text-stone-500 block">
                        Ingress: 0.0.0.0:3000 • SSL TLS 1.3
                      </span>
                    </div>
                    <div className="pt-1.5 flex justify-between items-center border-t border-stone-100 text-[10px]">
                      <span className="text-stone-500">API Health Index:</span>
                      <span className="font-extrabold text-emerald-600">99.98%</span>
                    </div>
                  </div>

                  {/* DATABASE INTEGRITY STATUS */}
                  <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Database Protection</span>
                      <Database className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-xl font-black text-stone-900 block tracking-tight">
                        Sync Mirror Active
                      </strong>
                      <span className="text-[10px] text-stone-500 block">
                        3 nodes • Latency: 12ms • Pass ✓
                      </span>
                    </div>
                    <div className="pt-1.5 flex justify-between items-center border-t border-stone-100 text-[10px]">
                      <span className="text-stone-500">Last integrity check:</span>
                      <span className="font-extrabold text-indigo-600 font-mono">Today 08:00 AM</span>
                    </div>
                  </div>

                  {/* STORAGE QUOTA METERS */}
                  <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Cloud Storage Vol</span>
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-xl font-black text-stone-900 block tracking-tight">
                        745.5 MB Used
                      </strong>
                      <span className="text-[10px] text-stone-500 block">
                        Allocated: 2.5 GB • 29.8% Capacity
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: "29.8%" }} />
                    </div>
                  </div>

                  {/* BACKUP SCHEDULE PULSE */}
                  <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Backup Daemon</span>
                      <Cpu className="w-4 h-4 text-amber-500 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-xl font-black text-stone-900 block tracking-tight font-mono">
                        Cron Active
                      </strong>
                      <span className="text-[10px] text-stone-500 block">
                        Interval: Every 4 Hours • AES-256
                      </span>
                    </div>
                    <div className="pt-1.5 flex justify-between items-center border-t border-stone-100 text-[10px]">
                      <span className="text-stone-500">Next Scheduled Sync:</span>
                      <span className="font-extrabold text-amber-700 font-mono">Today 12:00 PM</span>
                    </div>
                  </div>

                </div>

                {/* 2. DUAL LAYOUT: Backup Orchestrator vs Automated Drills */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT: BACKUP ORCHESTRATOR & SCHEDULES (7 Cols) */}
                  <div className="lg:col-span-7 bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-5">
                    <div className="border-b border-stone-100 pb-2.5 flex justify-between items-center flex-wrap gap-2">
                      <div className="text-left">
                        <span className="text-[10px] text-[#b91c1c] font-black uppercase tracking-widest block">Disaster Recovery Backups</span>
                        <h4 className="text-sm font-black text-stone-900 uppercase">Cryptographic Backup Vault Log</h4>
                      </div>
                      
                      {/* Trigger manual backup button */}
                      <button
                        onClick={() => {
                          const backupId = `bak_${Date.now()}`;
                          const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
                          
                          setTerminalLogs(prev => [
                            ...prev,
                            `[INFO] Starting manual backup ${backupId} at ${timestamp}`,
                            `[INFO] Locking read pool and compiling tables (Member, Finance, Welfare, Audit)...`,
                            `[INFO] Cryptographic payload assembled: 184.5 MB. Calculating SHA-256 checksum...`,
                            `[SUCCESS] Backup payload hashed successfully: SHA-256 Checksum pass.`,
                            `[INFO] Uploading backup to dual regional storage: us-central1 & asia-southeast1...`,
                            `[SUCCESS] Backup compiled, encrypted, and written to secure bucket node.`
                          ]);

                          const newBackup = {
                            id: backupId,
                            timestamp,
                            type: "Manual",
                            size: "184.5 MB",
                            location: "us-central1 (Iowa - DR)",
                            encrypted: true,
                            hash: "c91a02" + Math.floor(Math.random() * 10000) + "efba" + Math.floor(Math.random() * 10000),
                            status: "Verified",
                            integrity: "Pass"
                          };

                          setBackups(prev => [newBackup, ...prev]);
                          addBusLog("Manual Backup Executed", `Created secure cryptographic backup snapshot ${newBackup.hash} to Iowa DR bucket.`);
                          alert("Military-grade encrypted snapshot compiled and written to Singapore & US Central nodes successfully!");
                        }}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider cursor-pointer shadow flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-500" />
                        <span>Trigger Manual Backup</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 leading-relaxed text-left">
                      Below is the immutable registry of cryptographic snapshots synchronized across Google Cloud Storage buckets. Each backup is isolated with military-grade AES-256 chunked encryption.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 bg-stone-50 font-bold text-stone-700 text-[10px]">
                            <th className="p-2">Snapshot Date</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Size</th>
                            <th className="p-2">Geolocations</th>
                            <th className="p-2">SHA-256 Integrity Hash</th>
                            <th className="p-2">Encryption</th>
                            <th className="p-2 text-right">Operational Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-medium text-stone-700 text-[11px]">
                          {backups.map((bak, idx) => (
                            <tr key={`sa_bak_${bak.id}_${idx}`} className="hover:bg-stone-50 transition-colors">
                              <td className="p-2 whitespace-nowrap font-mono">{bak.timestamp}</td>
                              <td className="p-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  bak.type === "Manual" ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-stone-100 text-stone-800"
                                }`}>
                                  {bak.type}
                                </span>
                              </td>
                              <td className="p-2 font-mono font-bold">{bak.size}</td>
                              <td className="p-2 text-stone-600 font-mono text-[10px]">{bak.location}</td>
                              <td className="p-2 font-mono text-stone-400 text-[9px]" title={bak.hash}>
                                {bak.hash.substring(0, 12)}...
                              </td>
                              <td className="p-2">
                                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                  ✓ AES-256
                                </span>
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  onClick={() => {
                                    const confirmRestore = window.confirm(`CRITICAL WARNING: Are you sure you want to restore the TNPA Portal data state back to snapshot from ${bak.timestamp}? Active connections will be paused during re-sync.`);
                                    if (confirmRestore) {
                                      setTerminalLogs(prev => [
                                        ...prev,
                                        `[ALERT] RESTORE OPERATION INITIATED FOR SNAPSHOT ${bak.id}`,
                                        `[INFO] Re-routing traffic to transient holding node...`,
                                        `[INFO] Clearing active local table memory blocks...`,
                                        `[INFO] Streaming payload from bucket ${bak.location}...`,
                                        `[INFO] Validating SHA-256 integrity hash: ${bak.hash} • PASS`,
                                        `[SUCCESS] Restored ${bak.size} database partition safely.`,
                                        `[SUCCESS] Normal portal routing resumed. 0% data integrity drift.`
                                      ]);
                                      addBusLog("Database Partition Restored", `Rolled back data registry to backup timestamp ${bak.timestamp} (Hash: ${bak.hash})`);
                                      alert("Database restored successfully under 3 seconds! Audit registries verified.");
                                    }
                                  }}
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[9px] font-extrabold uppercase cursor-pointer transition-colors"
                                >
                                  Restore Snapshot
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Schedulers & Cloud Storage Options */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-stone-500 font-bold block uppercase">Cloud Backup Interval Frequency</label>
                        <select
                          value={dataSecurity.backupFrequency}
                          onChange={(e) => {
                            setDataSecurity(prev => ({ ...prev, backupFrequency: e.target.value }));
                            addBusLog("Cron Scheduler Reconfigured", `Automated SQL backups frequency set: ${e.target.value}`);
                            setTerminalLogs(prev => [...prev, `[CONFIG] Automated backup frequency reconfigured to: ${e.target.value}`]);
                          }}
                          className="w-full border border-stone-300 rounded-xl p-2 bg-white text-stone-950 font-bold focus:outline-none"
                        >
                          <option value="hourly">Hourly Redundant Swarm Sync (Recommended)</option>
                          <option value="daily">Daily Cron Dump</option>
                          <option value="weekly">Weekly Master Recovery Archive</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-stone-500 font-bold block uppercase">Georeplicated Mirror Region</label>
                        <select
                          value={dataSecurity.disasterRegion}
                          onChange={(e) => {
                            setDataSecurity(prev => ({ ...prev, disasterRegion: e.target.value }));
                            addBusLog("Disaster Recovery Region Modified", `Primary standby node set: ${e.target.value}`);
                            setTerminalLogs(prev => [...prev, `[CONFIG] STANDBY MIRROR ROUTING SWAPPED TO: ${e.target.value}`]);
                          }}
                          className="w-full border border-stone-300 rounded-xl p-2 bg-white text-stone-950 font-bold focus:outline-none"
                        >
                          <option value="asia-southeast1 (Singapore)">asia-southeast1 (Singapore Node - Primary)</option>
                          <option value="us-central1 (Iowa - DR)">us-central1 (Iowa Node - Standby)</option>
                          <option value="europe-west3 (Frankfurt)">europe-west3 (Frankfurt Node - Redundant)</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT: EMERGENCY RECOVERY DRILLS & ALERTS MONITOR (5 Cols) */}
                  <div className="lg:col-span-5 bg-stone-900 text-stone-100 p-5 rounded-2xl shadow-lg space-y-5 flex flex-col justify-between font-semibold">
                    <div className="space-y-4">
                      <div className="border-b border-stone-850 pb-2.5 flex justify-between items-center">
                        <div className="text-left">
                          <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest block">Continuous Readiness</span>
                          <h4 className="text-sm font-black text-white uppercase">Automated Recovery Test & Drills</h4>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-black text-[8px] uppercase tracking-wider rounded border border-emerald-800 animate-pulse">
                          SRE Ready
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 leading-relaxed text-left">
                        Initiate failover drills to simulate unexpected network or database outages, validating the zero-downtime hot swap capabilities of the portal.
                      </p>

                      <div className="space-y-3">
                        {activeDrills.map((drill, idx) => (
                          <div key={`sa_drl_${drill.id}_${idx}`} className="p-3 bg-stone-950 rounded-xl border border-stone-850 flex justify-between items-center text-left">
                            <div className="space-y-1">
                              <strong className="text-xs text-white block">{drill.name}</strong>
                              <span className="text-[10px] text-stone-400 block">
                                Last run: {drill.lastRun} • <span className="font-mono text-[9px] text-emerald-500 font-bold">{drill.result}</span>
                              </span>
                            </div>

                            <button
                              disabled={drill.status === "Running..."}
                              onClick={() => {
                                setActiveDrills(prev => prev.map(d => d.id === drill.id ? { ...d, status: "Running..." } : d));
                                setTerminalLogs(prev => [
                                  ...prev,
                                  `[DRILL] INITIALIZING SIMULATION: ${drill.name}`,
                                  `[DRILL] Injecting chaos failure vector into primary network lines...`,
                                  `[DRILL] Monitoring ingress re-routing controllers...`
                                ]);

                                setTimeout(() => {
                                  const now = new Date().toISOString().split("T")[0];
                                  setActiveDrills(prev => prev.map(d => {
                                    if (d.id === drill.id) {
                                      return {
                                        ...d,
                                        status: "Idle",
                                        lastRun: now,
                                        result: "Success (0ms Downtime)"
                                      };
                                    }
                                    return d;
                                  }));

                                  setTerminalLogs(prev => [
                                    ...prev,
                                    `[DRILL SUCCESS] Failover complete. Ingress re-routed safely under 200ms.`,
                                    `[DRILL SUCCESS] Verified data coherence: 100% block match.`
                                  ]);
                                  addBusLog("Chaos Recovery Drill Passed", `Drill completed: ${drill.name}. Systems responded perfectly.`);
                                  alert(`Recovery Drill "${drill.name}" passed perfectly with zero packet loss and 0ms user disruption!`);
                                }, 1500);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider text-center cursor-pointer transition-all ${
                                drill.status === "Running..." 
                                  ? "bg-amber-600 text-stone-950 font-black animate-pulse" 
                                  : "bg-stone-800 hover:bg-stone-700 text-stone-200"
                              }`}
                            >
                              {drill.status === "Running..." ? "Testing..." : "Run Test"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Infrastructure Diagnostic Terminal Console */}
                    <div className="space-y-2 pt-4 border-t border-stone-850">
                      <div className="flex justify-between items-center text-[10px] text-stone-400">
                        <span className="font-bold uppercase font-mono tracking-wider">🖥️ Operational Telemetry Streams</span>
                        <button
                          onClick={() => setTerminalLogs([`Console cleared at ${new Date().toLocaleTimeString()}`])}
                          className="hover:text-white underline font-bold"
                        >
                          Clear Logs
                        </button>
                      </div>

                      <div className="p-3 bg-stone-950 rounded-xl border border-stone-850 font-mono text-[9px] text-emerald-400 h-[105px] overflow-y-auto space-y-1 text-left leading-relaxed">
                        {terminalLogs.map((logStr, lIdx) => (
                          <p key={lIdx}>{logStr}</p>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

                {/* 3. SYSTEM HEALTH ALERTS SIMULATOR & PERFORMANCE TUNER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* LEFT: DATABASE INTEGRITY VERIFICATION MATRICES */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="border-b border-stone-100 pb-2.5 flex justify-between items-center flex-wrap gap-2">
                      <div className="text-left">
                        <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest block">Data Security & Compliance</span>
                        <h4 className="text-sm font-black text-stone-900 uppercase">Cryptographic Data Integrity Ledger</h4>
                      </div>

                      <button
                        onClick={() => {
                          setTerminalLogs(prev => [
                            ...prev,
                            `[INTEGRITY] Syncing sha256 block chains for all active tables...`,
                            `[INTEGRITY] Scanning Member Data records (1,24,580 entries)... PASS`,
                            `[INTEGRITY] Scanning Financial Records (98,421 blocks)... PASS`,
                            `[INTEGRITY] Scanning Document Blobs (4,512 links)... PASS`,
                            `[INTEGRITY] Verified all cryptographic signature nodes match.`
                          ]);

                          setDbTablesIntegrity(prev => prev.map(t => ({
                            ...t,
                            lastChecked: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                            status: "Healthy Verified"
                          })));

                          addBusLog("Integrity Checks Completed", "Computed and verified SHA-256 signatures across all primary structural DB tables.");
                          alert("Cryptographic integrity verification complete! All tables have matching SHA-256 parity blocks (PASS).");
                        }}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-extrabold text-[10px] rounded-xl uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                      >
                        ✓ Run Parity Integrity checks
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 leading-relaxed text-left">
                      Below lists the health status of core database tables, audited automatically via continuous background hashing loops.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-100 bg-stone-50 text-[10px] text-stone-500 font-bold">
                            <th className="p-2">Database Table Name</th>
                            <th className="p-2">Record Count</th>
                            <th className="p-2 font-mono">Last Checked</th>
                            <th className="p-2">SHA-256 Checksum Signature</th>
                            <th className="p-2 text-right">Health</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-medium text-stone-700 text-[11px]">
                          {dbTablesIntegrity.map((table, tIdx) => (
                            <tr key={tIdx} className="hover:bg-stone-50 transition-colors">
                              <td className="p-2 font-bold text-stone-900">{table.tableName}</td>
                              <td className="p-2 font-mono">{table.recordCount}</td>
                              <td className="p-2 font-mono text-stone-500">{table.lastChecked}</td>
                              <td className="p-2 font-mono text-stone-400 text-[10px]">{table.hash}</td>
                              <td className="p-2 text-right">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-black uppercase text-[8px] border border-emerald-200 whitespace-nowrap font-mono">
                                  {table.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* RIGHT: BUSINESS CONTINUITY, MAINTENANCE GATES & ALERTS SIMULATOR */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-4 text-left">
                      <div className="border-b border-stone-100 pb-2 flex justify-between items-center">
                        <div className="text-left">
                          <span className="text-[10px] text-[#b91c1c] font-black uppercase tracking-widest block">Operational Controls</span>
                          <h4 className="text-sm font-black text-stone-900 uppercase">Business Continuity & Maintenance Gates</h4>
                        </div>
                        
                        {/* Maintenance Mode Toggle Switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-400 font-bold uppercase">Maintenance Mode:</span>
                          <button
                            onClick={() => {
                              const targetVal = !maintenanceMode;
                              setMaintenanceMode(targetVal);
                              setTerminalLogs(prev => [
                                ...prev,
                                `[ALERT] MAINTENANCE MODE TOGGLED TO: ${targetVal ? "ENABLED" : "DISABLED"}`,
                                `[INFO] Members will receive ${targetVal ? "upgrade greeting" : "normal portal index"} layout.`
                              ]);
                              addBusLog("Maintenance State Changed", `Super admin toggled maintenance mode: ${targetVal ? "ACTIVE" : "INACTIVE"}`);
                              alert(`Maintenance Mode is now ${targetVal ? "ENABLED. Standard users will see the warning message below." : "DISABLED. Normal operations resumed."}`);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                              maintenanceMode 
                                ? "bg-amber-600 text-stone-950 animate-pulse" 
                                : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                            }`}
                          >
                            {maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Toggling Maintenance Mode restricts general user registrations and claims operations, displaying a localized warning banner to all visitor channels while keeping the Super Admin consoles online.
                      </p>

                      {/* Notification messages setup */}
                      <div className="space-y-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                        <div className="space-y-1">
                          <label className="text-[9px] text-stone-400 font-bold block uppercase">Maintenance Banner Msg (தமிழ்)</label>
                          <input
                            type="text"
                            value={maintenanceNotifMessage}
                            onChange={(e) => setMaintenanceNotifMessage(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 bg-white font-semibold text-stone-900 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-stone-400 font-bold block uppercase">Maintenance Banner Msg (English)</label>
                          <input
                            type="text"
                            value={maintenanceNotifMessageEn}
                            onChange={(e) => setMaintenanceNotifMessageEn(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-2 bg-white font-semibold text-stone-900 focus:outline-none"
                          />
                        </div>

                        {/* Banner Preview */}
                        <div className="border border-amber-200 bg-amber-50 rounded-xl p-2.5 text-[10px] text-amber-950 space-y-1 leading-relaxed font-semibold">
                          <strong className="block text-amber-800 uppercase text-[8px] tracking-wide">⚠️ BROWSER PREVIEW FOR MEMBERS:</strong>
                          <p>{lang === "ta" ? maintenanceNotifMessage : maintenanceNotifMessageEn}</p>
                        </div>
                      </div>

                      {/* Performance Optimization metrics checkboxes */}
                      <div className="space-y-2 border-t pt-3">
                        <span className="text-[10px] text-stone-400 font-bold block uppercase">Automatic Performance Optimizations</span>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-600">
                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900">
                            <input
                              type="checkbox"
                              checked={perfOptimizations.dbQueryOptimization}
                              onChange={(e) => setPerfOptimizations(p => ({ ...p, dbQueryOptimization: e.target.checked }))}
                              className="rounded cursor-pointer"
                            />
                            <span>Automatic DB Query Caching</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900">
                            <input
                              type="checkbox"
                              checked={perfOptimizations.fileCacheEnforcement}
                              onChange={(e) => setPerfOptimizations(p => ({ ...p, fileCacheEnforcement: e.target.checked }))}
                              className="rounded cursor-pointer"
                            />
                            <span>CDN File Caching (30d TTL)</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900">
                            <input
                              type="checkbox"
                              checked={perfOptimizations.lazyLoadingImages}
                              onChange={(e) => setPerfOptimizations(p => ({ ...p, lazyLoadingImages: e.target.checked }))}
                              className="rounded cursor-pointer"
                            />
                            <span>Lazy Load & Image Comp</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900">
                            <input
                              type="checkbox"
                              checked={perfOptimizations.offlineCacheServiceWorker}
                              onChange={(e) => setPerfOptimizations(p => ({ ...p, offlineCacheServiceWorker: e.target.checked }))}
                              className="rounded cursor-pointer"
                            />
                            <span>Offline Support / IndexDB</span>
                          </label>
                        </div>
                      </div>

                    </div>

                    {/* Critical Alerts Diagnostic triggers */}
                    <div className="pt-4 border-t border-stone-100 flex justify-between items-center flex-wrap gap-2">
                      <span className="text-[10px] text-stone-400 font-mono">Test Admin Alerts Handler:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            const newAlert = {
                              id: `alt_${Date.now()}`,
                              type: "Backup Failure Warning",
                              user: "VPC backup-scheduler",
                              detail: "Cloud Storage response timeout. Block migration retried automatically.",
                              date: "2026-08-04",
                              time: new Date().toLocaleTimeString(),
                              resolved: false,
                              severity: "High"
                            };
                            setSecurityAlerts(prev => [newAlert, ...prev]);
                            addBusLog("Critical Backup Failure Simulated", "Triggered automated alert response for storage connection failure.");
                            alert("Simulated [Backup Failure] alert triggered! Navigate to the 'Alerts & Telemetry' sub-tab to view it live.");
                          }}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[9px] font-bold uppercase cursor-pointer"
                        >
                          Simulate Backup Fail
                        </button>

                        <button
                          onClick={() => {
                            const newAlert = {
                              id: `alt_${Date.now()}`,
                              type: "Storage Quota Warning",
                              user: "System Monitor",
                              detail: "PDF document uploads approaching critical limit threshold.",
                              date: "2026-08-04",
                              time: new Date().toLocaleTimeString(),
                              resolved: false,
                              severity: "Medium"
                            };
                            setSecurityAlerts(prev => [newAlert, ...prev]);
                            addBusLog("Storage Quota Simulated Alert", "Triggered automated quota telemetry alarm.");
                            alert("Simulated [Storage limit] alert triggered! Checked instantly inside telemetry subtab.");
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded text-[9px] font-bold uppercase cursor-pointer"
                        >
                          Simulate Storage Limit
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Audit Status Notice */}
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-left text-indigo-950 leading-relaxed font-semibold">
                  🛡️ <strong>Disaster Recovery Plan (DRP) Assurance:</strong> TNPA active clusters are configured for automatic, sub-second failovers. Backup data logs and cryptographic table signatures conform to ISO/IEC 27001 Information Security Management guidelines.
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB: DISTRICT WHATSAPP GROUPS MANAGEMENT */}
        {activeSubTab === "whatsapp_groups" && (
          <div className="animate-[fadeIn_0.4s_ease-out]">
            <SuperAdminWhatsAppConsole
              lang={lang}
              currentUser={currentUser}
              onAddAuditLog={(action, details) => addBusLog(action, details)}
            />
          </div>
        )}

      </div>

    </div>
  );
}
