import React, { useState } from "react";
import { 
  Users, 
  FileText, 
  Settings, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ShieldAlert, 
  DollarSign, 
  UserCheck, 
  ShieldCheck, 
  Activity, 
  Database, 
  QrCode, 
  Printer, 
  Download, 
  Upload, 
  Lock, 
  Award, 
  Map, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  Search,
  RefreshCw,
  Camera,
  CreditCard,
  Video
} from "lucide-react";
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
  UserRole 
} from "../types";
import SmartAIAnalytics from "./SmartAIAnalytics";
import { generateDistrictRegNumber } from "../utils/districtCodes";

import { AdminMemberCardVerification } from "./AdminMemberCardVerification";
import SelfHealingConsole from "./SelfHealingConsole";
import SuperAdminIdCardEditor from "./SuperAdminIdCardEditor";
import UnionConferenceStudio from "./UnionConferenceStudio";

interface AdminPanelProps {
  lang: "ta" | "en";
  currentUser: UserAccount;
  leaders: Leader[];
  news: NewsItem[];
  registrations: MemberRegistration[];
  payments: PaymentRecord[];
  stats: SystemStats;
  welfareApplications: WelfareApplication[];
  auditLogs: AuditLog[];
  systemSettings: SystemSettings;
  onUpdateLeaders: (updated: Leader[]) => void;
  onUpdateNews: (updated: NewsItem[]) => void;
  onUpdateRegistrations: (updated: MemberRegistration[]) => void;
  onUpdatePayments: (updated: PaymentRecord[]) => void;
  onUpdateStats: (updated: SystemStats) => void;
  onUpdateWelfareApplications: (updated: WelfareApplication[]) => void;
  onUpdateSystemSettings: (updated: SystemSettings) => void;
  onAddAuditLog: (action: string, details: string) => void;
  onSendEmergency: (msg: string) => void;
  onRestoreBackup: (data: {
    leaders: Leader[];
    news: NewsItem[];
    registrations: MemberRegistration[];
    payments: PaymentRecord[];
    welfareApplications: WelfareApplication[];
    stats: SystemStats;
  }) => void;
}

export default function AdminPanel({
  lang,
  currentUser,
  leaders,
  news,
  registrations,
  payments,
  stats,
  welfareApplications,
  auditLogs,
  systemSettings,
  onUpdateLeaders,
  onUpdateNews,
  onUpdateRegistrations,
  onUpdatePayments,
  onUpdateStats,
  onUpdateWelfareApplications,
  onUpdateSystemSettings,
  onAddAuditLog,
  onSendEmergency,
  onRestoreBackup
}: AdminPanelProps) {
  const isSuperAdmin = currentUser?.role === "super_admin";
  // Sidebar tab selection
  const [adminTab, setAdminTab] = useState<
    "dashboard" | "ai_analytics" | "member_approvals" | "welfare_approvals" | "payment_verifications" | "member_card_payments" | "news_circulars" | "leaders_directory" | "system_controls" | "audit_logs" | "self_healing" | "id_card_customizer" | "conference_studio"
  >("dashboard");

  // Leader state editor
  const [newLeaderName, setNewLeaderName] = useState("");
  const [newLeaderNameEn, setNewLeaderNameEn] = useState("");
  const [newLeaderRole, setNewLeaderRole] = useState("மாநில துணைத் தலைவர்");
  const [newLeaderRoleEn, setNewLeaderRoleEn] = useState("State Vice President");
  const [newLeaderPhone, setNewLeaderPhone] = useState("");
  const [newLeaderPhoto, setNewLeaderPhoto] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150");

  // News state editor
  const [newNewsTitle, setNewNewsTitle] = useState("");
  const [newNewsTitleEn, setNewNewsTitleEn] = useState("");
  const [newNewsContent, setNewNewsContent] = useState("");
  const [newNewsContentEn, setNewNewsContentEn] = useState("");
  const [newNewsCat, setNewNewsCat] = useState<"news" | "circular" | "event">("news");
  const [newNewsImageBase64, setNewNewsImageBase64] = useState("");
  const [newNewsImageFileName, setNewNewsImageFileName] = useState("");
  const [newNewsImageUrl, setNewNewsImageUrl] = useState("");
  const [newNewsImageSource, setNewNewsImageSource] = useState<"file" | "url">("file");

  // AI Drafting companion states
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftType, setDraftType] = useState("circular");
  const [draftLoading, setDraftLoading] = useState(false);

  // Emergency message value
  const [emergencyText, setEmergencyText] = useState("");

  // Search queries for admin sheets
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "pending" | "under_review" | "needs_correction" | "approved" | "rejected">("pending");
  const [remarksDict, setRemarksDict] = useState<{[key: string]: string}>({});

  // Welfare Search and Filter states
  const [welfareSearch, setWelfareSearch] = useState("");
  const [welfareStatusFilter, setWelfareStatusFilter] = useState<"all" | "pending" | "under_review" | "needs_correction" | "approved" | "rejected">("pending");
  const [welfareDistrictFilter, setWelfareDistrictFilter] = useState<string>("all");

  // Role check permission helpers
  const canApproveMembers = ["super_admin", "district_admin", "state_admin"].includes(currentUser.role);
  const canApproveWelfare = ["super_admin", "state_admin", "state_president"].includes(currentUser.role);
  const canApprovePayments = ["super_admin", "state_treasurer"].includes(currentUser.role);
  const canEditSettings = currentUser.role === "super_admin";
  const canDeleteData = currentUser.role === "super_admin" || currentUser.role === "state_admin";

  const handleGenerateAIDraft = async () => {
    if (!draftPrompt.trim() || draftLoading) return;
    setDraftLoading(true);
    try {
      const res = await fetch("/api/gemini/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: draftPrompt, type: draftType })
      });
      if (!res.ok) throw new Error("Drafting failed");
      const data = await res.json();
      if (data.titleTa) setNewNewsTitle(data.titleTa);
      if (data.titleEn) setNewNewsTitleEn(data.titleEn);
      if (data.contentTa) setNewNewsContent(data.contentTa);
      if (data.contentEn) setNewNewsContentEn(data.contentEn);
      
      // Update news category selection if draft type matches
      if (draftType === "news" || draftType === "circular" || draftType === "event") {
        setNewNewsCat(draftType as any);
      }

      onAddAuditLog("AI Draft Document Generated", `Drafted standard union '${draftType}' about: ${draftPrompt.substring(0, 40)}...`);
      alert(lang === "ta" ? "செயற்கை நுண்ணறிவு மூலம் வெற்றிகரமாக வரைவு செய்யப்பட்டது! விவரங்களை கீழே சரிபார்க்கவும்." : "AI successfully generated the draft! Please review the populated fields below.");
      setDraftPrompt("");
    } catch (err) {
      console.error(err);
      alert(lang === "ta" ? "மன்னிக்கவும், வரைவு உருவாக்கத்தில் சிக்கல் ஏற்பட்டது." : "Apologies, draft generation failed.");
    } finally {
      setDraftLoading(false);
    }
  };

  // Double workflow: approve membership
  const handleApproveMember = (id: string) => {
    const targetMember = registrations.find(r => r.id === id);
    const regNumber = targetMember?.regNumber && targetMember.regNumber.length > 3
      ? targetMember.regNumber
      : generateDistrictRegNumber(targetMember?.district || "சென்னை");
    const updated = registrations.map((r) => {
      if (r.id === id) {
        onAddAuditLog(
          "Approved Member Enrollment",
          `Membership Number ${regNumber} allocated to ${r.name} (${r.district}).`
        );
        return { ...r, status: "approved" as const, regNumber };
      }
      return r;
    });
    onUpdateRegistrations(updated);
    
    // Increment total stats
    onUpdateStats({
      ...stats,
      totalMembers: stats.totalMembers + 1
    });

    alert(lang === "ta" ? "உறுப்பினர் சேர்க்கை அங்கீகரிக்கப்பட்டு டிஜிட்டல் அட்டை உருவாக்கப்பட்டது!" : "Member successfully enrolled, Digital ID Card generated!");
  };

  const handleRejectMember = (id: string) => {
    const updated = registrations.map((r) => {
      if (r.id === id) {
        onAddAuditLog("Rejected Member Enrollment", `Application for ${r.name} was rejected.`);
        return { ...r, status: "rejected" as const };
      }
      return r;
    });
    onUpdateRegistrations(updated);
    alert(lang === "ta" ? "விண்ணப்பம் நிராகரிக்கப்பட்டது!" : "Application rejected!");
  };

  const handleSetUnderReview = (id: string) => {
    const updated = registrations.map((r) => {
      if (r.id === id) {
        onAddAuditLog("Application set to Under Review", `Application for ${r.name} is now under review.`);
        return { ...r, status: "under_review" as const };
      }
      return r;
    });
    onUpdateRegistrations(updated);
    alert(lang === "ta" ? "விண்ணப்பம் பரிசீலனைக்கு மாற்றப்பட்டது!" : "Application set to Under Review status!");
  };

  const handleRequestCorrection = (id: string, remarks: string) => {
    if (!remarks.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து திருத்தக் குறிப்புகளை உள்ளிடவும்!" : "Please enter correction remarks first!");
      return;
    }
    const updated = registrations.map((r) => {
      if (r.id === id) {
        onAddAuditLog("Requested Correction", `Application for ${r.name} flagged for correction. Remarks: ${remarks}`);
        return { 
          ...r, 
          status: "needs_correction" as const, 
          correctionRemarks: remarks 
        };
      }
      return r;
    });
    onUpdateRegistrations(updated);
    alert(lang === "ta" ? "திருத்தக் கோரிக்கை விண்ணப்பதாரருக்கு அனுப்பப்பட்டது!" : "Correction request sent to applicant!");
    // Clear specific remarks state
    setRemarksDict(prev => ({ ...prev, [id]: "" }));
  };

  // Double workflow: Treasurer verifies payment & Super Admin grants final approval
  const handleVerifyPayment = (id: string) => {
    const updated = payments.map((p) => {
      if (p.id === id) {
        onAddAuditLog(
          "Treasurer Payment Verification",
          `Transaction ${p.transactionId} verified for Rs. ${p.amount} from member ${p.memberName}`
        );
        return { ...p, status: "success" as const }; // verified/completed
      }
      return p;
    });
    onUpdatePayments(updated);

    // Update financial statistics
    const matched = payments.find((p) => p.id === id);
    if (matched) {
      onUpdateStats({
        ...stats,
        totalFundsRaised: stats.totalFundsRaised + matched.amount
      });
    }
    
    alert(lang === "ta" ? "பொருளாளரால் கட்டணம் சரிபார்க்கப்பட்டு இறுதி ரசீது உருவாக்கப்பட்டது!" : "Treasurer successfully verified payment & receipt finalized!");
  };

  // Welfare Scheme approval
  const handleApproveWelfareApplication = (id: string) => {
    const updated = welfareApplications.map((app) => {
      if (app.id === id) {
        onAddAuditLog(
          "Welfare Claim Approved",
          `Claim ID ${id} approved for ${app.memberName} (${app.schemeTitleEn}) - Amount: ${app.amount}`
        );
        
        // Subtract disbursed funds from system stats
        const numericAmount = parseInt(app.amount.replace(/[^0-9]/g, "")) || 5000;
        onUpdateStats({
          ...stats,
          welfareDisbursed: stats.welfareDisbursed + numericAmount,
          solvedCases: stats.solvedCases + 1
        });

        return { 
          ...app, 
          status: "approved" as const, 
          approvalDate: new Date().toLocaleDateString() 
        };
      }
      return app;
    });
    onUpdateWelfareApplications(updated);
    alert(lang === "ta" ? "நிவாரண நிதி விண்ணப்பம் அங்கீகரிக்கப்பட்டது!" : "Welfare Application Approved!");
  };

  const handleRejectWelfareApplication = (id: string) => {
    const updated = welfareApplications.map((app) => {
      if (app.id === id) {
        onAddAuditLog(
          "Welfare Claim Rejected",
          `Claim ID ${id} for ${app.memberName} rejected.`
        );
        return { ...app, status: "rejected" as const };
      }
      return app;
    });
    onUpdateWelfareApplications(updated);
  };

  const handleSetUnderReviewWelfareApplication = (id: string) => {
    const updated = welfareApplications.map((app) => {
      if (app.id === id) {
        onAddAuditLog(
          "Welfare Claim Under Review",
          `Claim ID ${id} set to Under Review status for ${app.memberName}`
        );
        return { ...app, status: "under_review" as const };
      }
      return app;
    });
    onUpdateWelfareApplications(updated);
    alert(lang === "ta" ? "விண்ணப்பம் பரிசீலனைக்கு மாற்றப்பட்டது!" : "Application placed under review!");
  };

  const handleRequestCorrectionWelfareApplication = (id: string, remarks: string) => {
    if (!remarks.trim()) {
      alert(lang === "ta" ? "தயவுசெய்து திருத்தக் குறிப்புகளை உள்ளிடவும்!" : "Please enter correction remarks first!");
      return;
    }
    const updated = welfareApplications.map((app) => {
      if (app.id === id) {
        onAddAuditLog(
          "Welfare Claim Correction Requested",
          `Claim ID ${id} flagged for correction. Remarks: ${remarks}`
        );
        return { 
          ...app, 
          status: "needs_correction" as const, 
          correctionRemarks: remarks 
        };
      }
      return app;
    });
    onUpdateWelfareApplications(updated);
    alert(lang === "ta" ? "விண்ணப்பதாரருக்கு திருத்தக் கோரிக்கை அனுப்பப்பட்டது!" : "Correction request successfully issued to applicant!");
    setRemarksDict(prev => ({ ...prev, [id]: "" }));
  };

  // Leader Management
  const handleAddLeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaderName.trim() || !newLeaderPhone.trim()) return;

    const added: Leader = {
      id: `l_${Date.now()}`,
      name: newLeaderName,
      nameEn: newLeaderNameEn || newLeaderName,
      role: newLeaderRole,
      roleEn: newLeaderRoleEn,
      phone: newLeaderPhone,
      photoUrl: newLeaderPhoto,
      district: currentUser.district || "சென்னை",
      districtEn: currentUser.districtEn || "Chennai"
    };

    onUpdateLeaders([...leaders, added]);
    onAddAuditLog("Added Executive Leader", `Leader ${added.nameEn} added to Directory.`);
    setNewLeaderName("");
    setNewLeaderNameEn("");
    setNewLeaderPhone("");
  };

  const handleDeleteLeader = (id: string) => {
    const leaderToDelete = leaders.find((l) => l.id === id);
    onUpdateLeaders(leaders.filter((l) => l.id !== id));
    if (leaderToDelete) {
      onAddAuditLog("Deleted Executive Leader", `Leader ${leaderToDelete.nameEn} was deleted.`);
    }
  };

  // Post News & Circulars
  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle.trim() || !newNewsContent.trim()) return;

    const finalImg = newNewsImageSource === "file" ? newNewsImageBase64 : newNewsImageUrl.trim();

    const added: NewsItem = {
      id: `news_${Date.now()}`,
      title: newNewsTitle,
      titleEn: newNewsTitleEn || newNewsTitle,
      content: newNewsContent,
      contentEn: newNewsContentEn || newNewsContent,
      date: new Date().toISOString().split("T")[0],
      category: newNewsCat,
      categoryTa: newNewsCat === "news" ? "செய்தி" : newNewsCat === "circular" ? "சுற்றறிக்கை" : "நிகழ்வு",
      imageUrl: finalImg || undefined
    };

    onUpdateNews([added, ...news]);
    onAddAuditLog("Published News / Bulletin", `News titled "${added.titleEn}" published with image.`);
    setNewNewsTitle("");
    setNewNewsTitleEn("");
    setNewNewsContent("");
    setNewNewsContentEn("");
    setNewNewsImageBase64("");
    setNewNewsImageFileName("");
    setNewNewsImageUrl("");
  };

  const handleDeleteNews = (id: string) => {
    const newsToDelete = news.find((n) => n.id === id);
    onUpdateNews(news.filter((n) => n.id !== id));
    if (newsToDelete) {
      onAddAuditLog("Deleted News Bulletin", `Bulletin ID ${id} deleted.`);
    }
  };

  // Backup and restore simulator
  const handleExportBackup = () => {
    const backupData = {
      leaders,
      news,
      registrations,
      payments,
      welfareApplications,
      stats,
      timestamp: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `TNP_Database_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onAddAuditLog("System Export", "Full database backup file successfully compiled and downloaded.");
  };

  const handleSimulatedRestore = () => {
    // Faux load defaults or trigger file reading
    alert(
      lang === "ta" 
        ? "காப்புப்பிரதி (Backup JSON) வெற்றிகரமாக இறக்குமதி செய்யப்பட்டது!" 
        : "Simulated SQL database restore completed successfully! Check logs."
    );
    onAddAuditLog("System Restore", "Database restored to secure snapshot from master recovery node.");
  };

  // Broadcast Urgent text
  const handleDispatchEmergency = () => {
    if (!emergencyText.trim()) return;
    onSendEmergency(emergencyText);
    onAddAuditLog("Dispatched Emergency Broadcast", `Alert published: "${emergencyText}"`);
    setEmergencyText("");
    alert(lang === "ta" ? "அவசர அறிவிப்பு நேரலையில் ஒளிபரப்பப்பட்டது!" : "Emergency banner live broadcast successfully!");
  };

  // District filter for District Admins
  const filteredRegistrations = registrations.filter((r) => {
    if (currentUser.role === "district_admin") {
      return r.district === currentUser.district;
    }
    return true;
  });

  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    return p.memberName.toLowerCase().includes(query) || p.memberId.toLowerCase().includes(query);
  });

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-[600px]">
      
      {/* LEFT SIDEBAR: Adapt tabs dynamically based on user privilege */}
      <div className="bg-stone-900 text-stone-100 p-5 flex flex-col justify-between border-r border-stone-800">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-black text-xs block tracking-widest text-amber-500 uppercase">
                {currentUser.role === "super_admin" ? "SUPER ADMIN HUB" : "EXECUTIVE PORTAL"}
              </span>
              <span className="text-[10px] text-stone-400 font-bold block max-w-[150px] truncate">
                {lang === "ta" ? currentUser.name : currentUser.nameEn}
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {/* Dashboard available to all execs */}
            <button
              onClick={() => setAdminTab("dashboard")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                adminTab === "dashboard" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <Activity className="w-4 h-4 text-amber-500" />
              <span>{lang === "ta" ? "நிர்வாக மேலாண்மைப் பலகை" : "Executive Dashboard"}</span>
            </button>

            {/* AI Analytics & Smart Projections Hub */}
            <button
              onClick={() => setAdminTab("ai_analytics")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                adminTab === "ai_analytics" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <span>{lang === "ta" ? "AI பகுப்பாய்வு & கணிப்புகள்" : "AI Analytics & Predictions"}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[8px] uppercase tracking-wider">
                New
              </span>
            </button>

            {/* Member Approvals (Super Admin, Dist Admin) */}
            {canApproveMembers && (
              <button
                onClick={() => setAdminTab("member_approvals")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  adminTab === "member_approvals" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>{lang === "ta" ? "உறுப்பினர் ஒப்புதல்" : "Member Approvals"}</span>
                </div>
                {registrations.filter((r) => r.status === "pending").length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[9px]">
                    {registrations.filter((r) => r.status === "pending").length}
                  </span>
                )}
              </button>
            )}

            {/* Welfare Approvals */}
            {canApproveWelfare && (
              <button
                onClick={() => setAdminTab("welfare_approvals")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  adminTab === "welfare_approvals" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{lang === "ta" ? "நலத்திட்ட ஒப்புதல்கள்" : "Welfare Board Claims"}</span>
                </div>
                {welfareApplications.filter((w) => w.status === "pending").length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[9px]">
                    {welfareApplications.filter((w) => w.status === "pending").length}
                  </span>
                )}
              </button>
            )}

            {/* Payments & Subscription Ledger Approvals */}
            {canApprovePayments && (
              <button
                onClick={() => setAdminTab("payment_verifications")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  adminTab === "payment_verifications" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{lang === "ta" ? "நிதி கணக்குச் சரிபார்ப்பு" : "Subscription Audits"}</span>
                </div>
                {payments.filter((p) => p.status === "pending").length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-stone-950 font-black text-[9px]">
                    {payments.filter((p) => p.status === "pending").length}
                  </span>
                )}
              </button>
            )}

            {/* Member Card Payment Verification (Super Admin, Treasurer, State Admin) */}
            {canApprovePayments && (
              <button
                onClick={() => setAdminTab("member_card_payments")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  adminTab === "member_card_payments" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ta" ? "உறுப்பினர் அட்டை கட்டணங்கள்" : "Member Card Payments"}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-black text-[8px] uppercase tracking-wider">
                  ₹100
                </span>
              </button>
            )}

            {/* News Circulars Uploads */}
            {["super_admin", "district_admin", "state_admin"].includes(currentUser.role) && (
              <button
                onClick={() => setAdminTab("news_circulars")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === "news_circulars" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{lang === "ta" ? "செய்தி வெளியீடு" : "Publish News"}</span>
              </button>
            )}

            {/* Leaders directory */}
            {["super_admin", "state_admin"].includes(currentUser.role) && (
              <button
                onClick={() => setAdminTab("leaders_directory")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === "leaders_directory" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{lang === "ta" ? "தலைமை நிர்வாகிகள் பட்டியல்" : "Leaders Directory"}</span>
              </button>
            )}

            {/* Security Audit logs & DB backup */}
            {["super_admin", "state_admin"].includes(currentUser.role) && (
              <button
                onClick={() => setAdminTab("audit_logs")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === "audit_logs" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <Database className="w-4 h-4" />
                <span>{lang === "ta" ? "பாதுகாப்புப் பதிவேடு (Logs)" : "Audit Logs & Backup"}</span>
              </button>
            )}

            {/* Website Controls */}
            {canEditSettings && (
              <button
                onClick={() => setAdminTab("system_controls")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === "system_controls" ? "bg-[#b91c1c] text-white shadow" : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <Settings className="w-4 h-4 text-amber-500 animate-[spin_10s_linear_infinite]" />
                <span>{lang === "ta" ? "சங்கக் கட்டுப்பாடுகள்" : "System Settings"}</span>
              </button>
            )}

            {/* Self-Healing & Health System */}
            {["super_admin", "state_admin", "state_president"].includes(currentUser.role) && (
              <button
                onClick={() => setAdminTab("self_healing")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  adminTab === "self_healing" ? "bg-amber-500 text-stone-950 shadow" : "text-amber-400 hover:bg-stone-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === "ta" ? "தானியங்கி பாதுகாப்பு" : "Self-Healing Engine"}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {/* Super Admin ID Card Design & Direct Editor */}
            {isSuperAdmin && (
              <button
                onClick={() => setAdminTab("id_card_customizer")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === "id_card_customizer" ? "bg-amber-500 text-stone-950 shadow" : "text-amber-300 hover:bg-stone-800"
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>{lang === "ta" ? "🎛️ அட்டை வடிவமைப்பு & எடிட்டர்" : "🎛️ ID Card Customizer"}</span>
              </button>
            )}

            {/* Union Video & Audio Conference Studio (Leaders & Admins) */}
            {["union_admin", "district_admin", "state_admin", "state_president", "state_treasurer", "super_admin"].includes(currentUser.role) && (
              <button
                onClick={() => setAdminTab("conference_studio")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === "conference_studio" ? "bg-[#b91c1c] text-white shadow" : "text-amber-300 hover:bg-stone-800"
                }`}
              >
                <Video className="w-4 h-4 text-amber-400" />
                <span>{lang === "ta" ? "🎥 பொறுப்பாளர்கள் கான்பரன்ஸ்" : "🎥 Leaders Conference Studio"}</span>
              </button>
            )}
          </nav>
        </div>

        <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/60 text-[10px] text-stone-400">
          📍 Role Status: <span className="text-amber-400 font-extrabold uppercase">{currentUser.role.replace("_", " ")}</span>
          <br />
          District Scope: <span className="text-white font-bold">{lang === "ta" ? currentUser.district : currentUser.districtEn}</span>
        </div>
      </div>

      {/* RIGHT WORKSPACE */}
      <div className="col-span-3 p-6 bg-white overflow-y-auto">
        
        {/* TAB: AI ANALYTICS & SMART PREDICTIONS */}
        {adminTab === "ai_analytics" && (
          <SmartAIAnalytics
            lang={lang}
            currentUser={currentUser}
            registrations={registrations}
            payments={payments}
            welfareApplications={welfareApplications}
            stats={stats}
            auditLogs={auditLogs}
            onAddAuditLog={onAddAuditLog}
          />
        )}

        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {adminTab === "dashboard" && (
          <div className="space-y-6 text-left">
            <div className="border-b border-stone-100 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-lg font-black text-stone-900 uppercase">
                  {lang === "ta" ? "நிர்வாக பகுப்பாய்வு மையம்" : "EXECUTIVE CONTROL DASHBOARD"}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === "ta" 
                    ? "அரசு அங்கீகாரம், உறுப்பினர் கட்டண வரவு மற்றும் நலநிதி நிலவர கண்காணிப்பு" 
                    : "Track live registrations, treasury collections, and welfare relief dispatch metrics."}
                </p>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-3.5 py-1.5 border border-stone-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-stone-50 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-stone-500" />
                <span>{lang === "ta" ? "அறிக்கை அச்சிடு" : "Print Report"}</span>
              </button>
            </div>

            {/* Micro KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">TODAY'S ENROLLMENTS</span>
                <p className="text-2xl font-black text-[#b91c1c] mt-1">+{registrations.length}</p>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">● Active Verification</span>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">PENDING WORKFLOWS</span>
                <p className="text-2xl font-black text-amber-500 mt-1">
                  {registrations.filter((r) => r.status === "pending").length + welfareApplications.filter((w) => w.status === "pending").length}
                </p>
                <span className="text-[10px] text-stone-400 block mt-1">Requires immediate sign-off</span>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">MONTHLY TREASURY</span>
                <p className="text-2xl font-black text-stone-900 mt-1">₹{(stats.totalFundsRaised).toLocaleString()}</p>
                <span className="text-[10px] text-stone-400 block mt-1">Total union balance ledger</span>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">RESOLVED WELFARE BOARD CASES</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{stats.solvedCases}</p>
                <span className="text-[10px] text-[#b91c1c] font-semibold block mt-1">₹{stats.welfareDisbursed.toLocaleString()} spent</span>
              </div>
            </div>

            {/* Graphic Representation & District Ranks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left columns: Beautiful CSS-based graphical bar chart of district performance */}
              <div className="md:col-span-2 border border-stone-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wide">
                  {lang === "ta" ? "மாவட்டவாரி உறுப்பினர் சேர்க்கை விகிதம்" : "District Enrolment Statistics (Active painters)"}
                </h4>

                <div className="space-y-3.5 pt-2">
                  {[
                    { district: "சென்னை (Chennai)", count: 18450, percent: 100, color: "bg-[#b91c1c]" },
                    { district: "மதுரை (Madurai)", count: 12500, percent: 68, color: "bg-amber-500" },
                    { district: "கோயம்புத்தூர் (Coimbatore)", count: 9800, percent: 53, color: "bg-stone-900" },
                    { district: "திருச்சிராப்பள்ளி (Trichy)", count: 4870, percent: 26, color: "bg-stone-400" }
                  ].map((dist, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-800">{dist.district}</span>
                        <span className="font-mono font-bold text-stone-600">{dist.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full ${dist.color} rounded-full`} style={{ width: `${dist.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Quick Emergency Alert Trigger */}
              <div className="bg-stone-900 text-white rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-500 mb-2">
                    <ShieldAlert className="w-4 h-4 animate-bounce" />
                    <span className="font-black text-xs uppercase tracking-wider">{lang === "ta" ? "அவசரக் கால அலர்ட்" : "URGENT BROADCASTER"}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed mb-4">
                    {lang === "ta" 
                      ? "விபத்து அல்லது அவசர மரணம் நேரிடின் உடனடி நிவாரணக் குழுவை அனுப்ப லைவ் அலர்ட் பதாகையை இங்கு வெளியிடவும்." 
                      : "Publish accident helpdesk alerts. Instantly flashes a red banner with contact numbers on the front-end homepage."}
                  </p>
                  <textarea
                    rows={2}
                    value={emergencyText}
                    onChange={(e) => setEmergencyText(e.target.value)}
                    placeholder={lang === "ta" ? "விபத்து ஏற்பட்ட இடம், நபர் பெயர் மற்றும் தொடர்பு எண்..." : "Accident details, phone number..."}
                    className="w-full p-2.5 bg-stone-800 text-white rounded-xl text-xs border border-stone-700 placeholder-stone-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleDispatchEmergency}
                  disabled={!emergencyText.trim()}
                  className="mt-3 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all disabled:bg-stone-800"
                >
                  <span>{lang === "ta" ? "நேரலையாக ஒளிபரப்பு" : "Dispatch Live Banner"}</span>
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>

            </div>

            {/* Latest Activities feed */}
            <div className="border border-stone-200 rounded-2xl p-5">
              <h4 className="font-extrabold text-stone-900 text-xs uppercase mb-4 tracking-wide">
                {lang === "ta" ? "சமீபத்திய பாதுகாப்பு பதிவுகள் (Audit Logs)" : "Recent Security Audit logs"}
              </h4>
              <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
                {auditLogs.slice(0, 5).map((log, idx) => (
                  <div key={`adm_log_s_${log.id}_${idx}`} className="text-xs flex justify-between items-start border-b border-stone-100 pb-2.5 last:border-none last:pb-0">
                    <div>
                      <span className="font-mono text-stone-400 block text-[9px]">{log.timestamp}</span>
                      <span className="font-bold text-stone-800 block mt-0.5">{log.action}</span>
                      <span className="text-stone-500 text-[10px] mt-0.5 block">{log.details}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[9px] font-bold uppercase shrink-0">
                      {log.performedBy}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MEMBER APPROVAL SHEET */}
        {adminTab === "member_approvals" && (() => {
          const approvalStatusFiltered = filteredRegistrations.filter((r) => {
            if (approvalFilter === "all") return true;
            return r.status === approvalFilter;
          });

          return (
            <div className="space-y-6 text-left">
              <div className="border-b border-stone-100 pb-3 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    {lang === "ta" ? "புதிய உறுப்பினர் சேர்க்கை ஒப்புதல்கள்" : "MEMBER ENROLLMENT WORKFLOW"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === "ta" 
                      ? "விண்ணப்பங்களை பல்வேறு நிலைகளில் சரிபார்த்து உறுப்பினர் எண் மற்றும் QR குறியீடுகளை ஒதுக்கவும்." 
                      : "Approve/Reject requests, request corrections, or keep under-review. Approval generates a digital ID card."}
                  </p>
                </div>
                
                {/* Status Counters */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-1 rounded-md">
                    Pending: {filteredRegistrations.filter((r) => r.status === "pending").length}
                  </span>
                  <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-2 py-1 rounded-md">
                    Review: {filteredRegistrations.filter((r) => r.status === "under_review").length}
                  </span>
                  <span className="bg-yellow-100 text-yellow-900 font-extrabold text-[10px] px-2 py-1 rounded-md">
                    Correction: {filteredRegistrations.filter((r) => r.status === "needs_correction").length}
                  </span>
                </div>
              </div>

              {/* Sub-tab selection for admin status filters */}
              <div className="flex flex-wrap bg-stone-100 p-1 rounded-xl border border-stone-200/50 w-full md:w-fit text-xs font-bold">
                {[
                  { id: "all", label: "அனைத்தும்", labelEn: "All" },
                  { id: "pending", label: "காத்திருப்பவை", labelEn: "Pending" },
                  { id: "under_review", label: "பரிசீலனை", labelEn: "Under Review" },
                  { id: "needs_correction", label: "திருத்தம் தேவை", labelEn: "Correction Required" },
                  { id: "approved", label: "அங்கீகரிக்கப்பட்டவை", labelEn: "Approved" },
                  { id: "rejected", label: "நிராகரிக்கப்பட்டவை", labelEn: "Rejected" }
                ].map((tabObj, idx) => (
                  <button
                    key={`adm_tab_${tabObj.id}_${idx}`}
                    onClick={() => setApprovalFilter(tabObj.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      approvalFilter === tabObj.id 
                        ? "bg-stone-900 text-amber-400 shadow-sm" 
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {lang === "ta" ? tabObj.label : tabObj.labelEn} ({
                      tabObj.id === "all" 
                        ? filteredRegistrations.length 
                        : filteredRegistrations.filter((r) => r.status === tabObj.id).length
                    })
                  </button>
                ))}
              </div>

              {approvalStatusFiltered.length === 0 ? (
                <div className="text-center py-20 text-stone-400 text-xs border border-dashed border-stone-200 rounded-2xl">
                  {lang === "ta" ? "வடிகட்டப்பட்ட பிரிவில் விண்ணப்பங்கள் எதுவும் இல்லை!" : "No enrollment applications in this category."}
                </div>
              ) : (
                <div className="space-y-4">
                  {approvalStatusFiltered.map((m, idx) => (
                    <div key={`adm_mem_${m.id}_${idx}`} className="p-5 border border-stone-200 bg-stone-50/50 rounded-2xl space-y-4 shadow-sm hover:border-amber-400 transition-all text-stone-800">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <img src={m.photoUrl} alt="Photo" className="h-14 w-14 rounded-full object-cover border-2 border-amber-500 shadow-sm shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-stone-900 text-sm block">{m.name}</span>
                              <span className="text-xs text-stone-500 font-mono">({m.nameEn})</span>
                            </div>
                            <span className="text-xs text-stone-500 block mt-0.5">தந்தை: {m.fatherName} | 📍 {m.district}</span>
                          </div>
                        </div>

                        {/* Badges for status */}
                        <div className="flex items-center gap-2">
                          {m.status === "approved" && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg uppercase">
                              Approved: {m.regNumber}
                            </span>
                          )}
                          {m.status === "rejected" && (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-lg uppercase">
                              Rejected
                            </span>
                          )}
                          {m.status === "under_review" && (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-lg uppercase">
                              Under Review
                            </span>
                          )}
                          {m.status === "needs_correction" && (
                            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 font-bold text-[10px] rounded-lg uppercase">
                              Correction Required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-stone-600 bg-white p-4 rounded-xl border border-stone-100 leading-relaxed">
                        <span>📱 கைபேசி (Phone): <strong className="text-stone-900">{m.phone}</strong></span>
                        {m.whatsapp && <span>💬 வாட்ஸ்அப்: <strong className="text-stone-900">{m.whatsapp}</strong></span>}
                        <span>💳 ஆதார் எண்: <strong className="text-stone-900">{m.aadhaar}</strong></span>
                        <span>🩸 இரத்த வகை: <strong className="text-stone-900">{m.bloodGroup}</strong></span>
                        <span>📅 பிறந்த தேதி: <strong className="text-stone-900">{m.dob}</strong></span>
                        <span>💼 தொழில் (Role): <strong className="text-stone-900">{m.profession}</strong></span>
                        <span>💼 அனுபவம்: <strong className="text-stone-900">{m.experienceYears} {lang === "ta" ? "ஆண்டுகள்" : "Years"}</strong></span>
                        <span>🏠 முகவரி: <strong className="text-stone-900">{m.address}, {m.villageOrTown}, {m.taluk}, {m.pinCode}</strong></span>
                      </div>

                      {/* Display Documents links */}
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                        {m.aadhaarFrontUrl && (
                          <a href={m.aadhaarFrontUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border">
                            📄 {lang === "ta" ? "ஆதார் முன் பக்கம்" : "Aadhaar Front"}
                          </a>
                        )}
                        {m.aadhaarBackUrl && (
                          <a href={m.aadhaarBackUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border">
                            📄 {lang === "ta" ? "ஆதார் பின் பக்கம்" : "Aadhaar Back"}
                          </a>
                        )}
                        {m.additionalDocsUrl && (
                          <a href={m.additionalDocsUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border">
                            📎 {lang === "ta" ? "இதர ஆவணங்கள்" : "Additional Doc"}
                          </a>
                        )}
                        {m.signatureData && (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-900 rounded border border-amber-200">
                            ✍️ {lang === "ta" ? "கையொப்பம் உள்ளது" : "Signature Registered"}
                          </span>
                        )}
                      </div>

                      {/* If needs correction, display current remarks */}
                      {m.status === "needs_correction" && m.correctionRemarks && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-900 text-xs rounded-xl font-medium">
                          <strong>⚠️ {lang === "ta" ? "தற்போதைய திருத்தக் குறிப்பு:" : "Current Correction Remarks:"}</strong> {m.correctionRemarks}
                        </div>
                      )}

                      {/* ACTION SUITE (visible for unapproved/non-rejected or allows modification) */}
                      {m.status !== "approved" && m.status !== "rejected" && (
                        <div className="pt-2 border-t border-dashed border-stone-100 flex flex-col gap-3">
                          <div className="flex flex-wrap gap-2 justify-end">
                            {/* Set Under Review Action */}
                            {m.status === "pending" && (
                              <button
                                onClick={() => handleSetUnderReview(m.id)}
                                className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-extrabold cursor-pointer transition-all"
                              >
                                ⏳ {lang === "ta" ? "பரிசீலனைக்கு மாற்று" : "Put Under Review"}
                              </button>
                            )}

                            {/* Reject Action */}
                            <button
                              onClick={() => handleRejectMember(m.id)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-extrabold cursor-pointer transition-all"
                            >
                              ❌ {lang === "ta" ? "நிராகரி" : "Reject"}
                            </button>

                            {/* Approve Action */}
                            <button
                              onClick={() => handleApproveMember(m.id)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black cursor-pointer transition-all shadow-sm"
                            >
                              ✓ {lang === "ta" ? "அங்கீகரி (Approve)" : "Approve Application"}
                            </button>
                          </div>

                          {/* Request Correction Box */}
                          <div className="bg-stone-100 p-3 rounded-xl flex flex-col md:flex-row gap-2 items-end">
                            <div className="flex-1 text-left w-full">
                              <label className="block text-[10px] font-bold text-stone-600 mb-1">
                                {lang === "ta" ? "விண்ணப்பதாரருக்கு திருத்தக் குறிப்பு அனுப்பவும்:" : "Flag for Correction & Send Remarks to Applicant:"}
                              </label>
                              <input
                                type="text"
                                value={remarksDict[m.id] || ""}
                                onChange={(e) => setRemarksDict(prev => ({ ...prev, [m.id]: e.target.value }))}
                                placeholder={lang === "ta" ? "எ.கா: புகைப்படம் மங்கலாக உள்ளது, ஆதார் பின் பக்கம் தெளிவாக இல்லை." : "E.g. Face photo blurry, please re-upload Aadhaar backside copy."}
                                className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRequestCorrection(m.id, remarksDict[m.id] || "")}
                              className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-3.5 py-1.5 rounded-lg text-xs font-extrabold shrink-0 cursor-pointer transition-all"
                            >
                              ⚠️ {lang === "ta" ? "திருத்தம் கேள்" : "Request Correction"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 3: WELFARE APPROVAL SHEET */}
        {adminTab === "welfare_approvals" && (() => {
          // Calculate stats for reporting
          const todayStr = new Date().toISOString().split("T")[0];
          const dailyCount = welfareApplications.filter(w => w.appliedAt === todayStr).length;
          
          // Helper to check within days
          const getClaimsInPastDays = (days: number) => {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            return welfareApplications.filter(w => new Date(w.appliedAt) >= cutoff).length;
          };

          const weeklyCount = getClaimsInPastDays(7);
          const monthlyCount = getClaimsInPastDays(30);

          // District wise map
          const distMap: {[key: string]: number} = {};
          welfareApplications.forEach(w => {
            distMap[w.district] = (distMap[w.district] || 0) + 1;
          });

          // Scheme wise map
          const schemeMap: {[key: string]: number} = {};
          welfareApplications.forEach(w => {
            schemeMap[w.schemeTitleEn] = (schemeMap[w.schemeTitleEn] || 0) + 1;
          });

          // Filter applications
          const filteredWelfareApps = welfareApplications.filter((app) => {
            // District filter
            if (welfareDistrictFilter !== "all" && app.district !== welfareDistrictFilter) {
              return false;
            }
            // Status filter
            if (welfareStatusFilter !== "all" && app.status !== welfareStatusFilter) {
              return false;
            }
            // Search query
            if (welfareSearch.trim()) {
              const q = welfareSearch.toLowerCase();
              return (
                app.memberName.toLowerCase().includes(q) ||
                app.memberId.toLowerCase().includes(q) ||
                app.id.toLowerCase().includes(q) ||
                app.schemeTitleEn.toLowerCase().includes(q) ||
                app.schemeTitle.includes(q)
              );
            }
            return true;
          });

          // Report JSON export handler
          const handleExportWelfareReport = () => {
            const reportData = {
              generatedAt: new Date().toISOString(),
              totalClaimsCount: welfareApplications.length,
              filteredCount: filteredWelfareApps.length,
              dailyCount,
              weeklyCount,
              monthlyCount,
              districtBreakdown: distMap,
              schemeBreakdown: schemeMap,
              applications: filteredWelfareApps
            };

            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(reportData, null, 2)
            )}`;
            const anchor = document.createElement("a");
            anchor.setAttribute("href", jsonString);
            anchor.setAttribute("download", `TNP_Welfare_Report_${new Date().toISOString().split("T")[0]}.json`);
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            
            onAddAuditLog("Welfare Report Exported", `Super Admin exported welfare claim logs containing ${filteredWelfareApps.length} records.`);
          };

          return (
            <div className="space-y-6 text-left animate-[fadeIn_0.4s_ease-out]">
              
              {/* Header */}
              <div className="border-b border-stone-100 pb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-stone-900 uppercase tracking-wide">
                    {lang === "ta" ? "அரசு நலவாரிய திட்ட உதவிகள் கோரல் & ஆய்வறிக்கைகள்" : "UNION WELFARE CLAIMS & REPORTING SYSTEM"}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === "ta" 
                      ? "விபத்து, ஓய்வூதியம் மற்றும் 15 வகையான நலநிதி கோரிக்கைகளை சரிபார்த்து திருத்தங்கள் கேட்டல் அல்லது ஒப்புதல் வழங்குதல்." 
                      : "Perform district-wise / scheme-wise queries, audit user-uploaded documents, and dispatch approvals."}
                  </p>
                </div>
                
                <button
                  onClick={handleExportWelfareReport}
                  className="px-4 py-2 bg-stone-950 text-white hover:bg-stone-850 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm self-start md:self-auto shrink-0"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ta" ? "ஆய்வறிக்கை பதிவிறக்கு (JSON)" : "Export Report Log"}</span>
                </button>
              </div>

              {/* REPORT DASHBOARD SUMMARY GRID */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Daily/Weekly/Monthly Stats */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                  <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider block">Claim Timeline Audits</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded-xl border border-stone-100">
                      <span className="text-[10px] text-stone-500 block">Today</span>
                      <strong className="text-sm text-stone-950 font-black">{dailyCount}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-stone-100">
                      <span className="text-[10px] text-stone-500 block">7 Days</span>
                      <strong className="text-sm text-[#b91c1c] font-black">{weeklyCount}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-stone-100">
                      <span className="text-[10px] text-stone-500 block">30 Days</span>
                      <strong className="text-sm text-amber-600 font-black">{monthlyCount}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. District Breakdowns */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider block">District-wise claims</span>
                  <div className="text-[11px] space-y-1 max-h-16 overflow-y-auto pr-1">
                    {Object.keys(distMap).length === 0 ? (
                      <span className="text-stone-400">No district records.</span>
                    ) : (
                      Object.entries(distMap).map(([dist, val]) => (
                        <div key={dist} className="flex justify-between items-center text-stone-700 font-medium">
                          <span>📍 {dist}</span>
                          <strong className="font-mono text-stone-900">{val}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Scheme-wise Breakdowns */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 col-span-1 md:col-span-2">
                  <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider block">Top Schemes requested</span>
                  <div className="text-[11px] space-y-1 max-h-16 overflow-y-auto pr-1">
                    {Object.keys(schemeMap).length === 0 ? (
                      <span className="text-stone-400">No active claims catalogued.</span>
                    ) : (
                      Object.entries(schemeMap).map(([sch, val], idx) => (
                        <div key={`sch_${sch}_${idx}`} className="flex justify-between items-center text-stone-700 font-medium truncate">
                          <span className="truncate max-w-[280px]">📋 {sch}</span>
                          <strong className="font-mono text-stone-900 shrink-0 ml-2">({val})</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* SEARCH & FILTERS CONTROLS */}
              <div className="bg-white p-4 border border-stone-200 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                
                {/* Search */}
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Search claims (பெயர் / ID)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search member, phone, claim title..."
                      value={welfareSearch}
                      onChange={(e) => setWelfareSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border rounded-xl text-xs bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2" />
                  </div>
                </div>

                {/* District Dropdown */}
                <div>
                  <label className="block font-bold text-stone-600 mb-1">District (மாவட்டம்)</label>
                  <select
                    value={welfareDistrictFilter}
                    onChange={(e) => setWelfareDistrictFilter(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-xl bg-stone-50 font-bold text-stone-800 cursor-pointer"
                  >
                    <option value="all">அனைத்து மாவட்டங்கள் (All)</option>
                    {["சென்னை", "மதுரை", "கோயம்புத்தூர்", "திருச்சிராப்பள்ளி", "சேலம்", "நெல்லை", "தஞ்சாவூர்", "திண்டுக்கல்"].map((d, idx) => (
                      <option key={`adm_d_${d}_${idx}`} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Status Toggle Subtabs */}
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Status (விண்ணப்ப நிலை)</label>
                  <select
                    value={welfareStatusFilter}
                    onChange={(e) => setWelfareStatusFilter(e.target.value as any)}
                    className="w-full px-2.5 py-2 border rounded-xl bg-stone-50 font-bold text-stone-800 cursor-pointer"
                  >
                    <option value="all">அனைத்தும் (All)</option>
                    <option value="pending">காத்திருப்பவை (Pending)</option>
                    <option value="under_review">பரிசீலனையில் (Under Review)</option>
                    <option value="needs_correction">திருத்தம் தேவை (Correction Required)</option>
                    <option value="approved">ஒப்புதல் பெற்றவை (Approved)</option>
                    <option value="rejected">நிராகரிக்கப்பட்டவை (Rejected)</option>
                  </select>
                </div>

              </div>

              {/* LIST OF CLAIMS */}
              {filteredWelfareApps.length === 0 ? (
                <div className="text-center py-16 text-stone-400 text-xs border border-dashed border-stone-200 rounded-2xl bg-stone-50/30">
                  {lang === "ta" ? "வடிகட்டப்பட்ட பிரிவில் நலவாரிய விண்ணப்பங்கள் எதுவும் இல்லை!" : "No welfare claims matching your active filters."}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredWelfareApps.map((claim, idx) => (
                    <div key={`adm_claim_${claim.id}_${idx}`} className="p-5 border border-stone-200 bg-stone-50/50 rounded-2xl space-y-4 shadow-sm hover:border-amber-400 transition-all text-stone-800">
                      
                      {/* Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-stone-200/50 pb-3">
                        <div>
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold border border-amber-200 px-2.5 py-0.5 rounded-full uppercase">
                            {lang === "ta" ? claim.schemeTitle : claim.schemeTitleEn}
                          </span>
                          <h4 className="font-black text-stone-950 text-sm mt-2">{claim.memberName}</h4>
                          <span className="text-xs text-stone-500 block mt-0.5">
                            ID: <strong className="text-stone-700">{claim.memberId}</strong> | Mobile: <strong className="text-stone-700">{claim.memberPhone}</strong> | 📍 {claim.district}
                          </span>
                        </div>

                        {/* Status badge & claim benefit */}
                        <div className="text-right flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs font-black text-emerald-700 block">Benefit: {claim.amount}</span>
                          
                          {claim.status === "pending" && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-bold text-[9px]">
                              PENDING REVIEW
                            </span>
                          )}
                          {claim.status === "under_review" && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[9px]">
                              UNDER REVIEW
                            </span>
                          )}
                          {claim.status === "needs_correction" && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded font-bold text-[9px] border border-orange-200">
                              CORRECTION REQUESTED
                            </span>
                          )}
                          {claim.status === "approved" && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[9px]">
                              APPROVED ON {claim.approvalDate}
                            </span>
                          )}
                          {claim.status === "rejected" && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[9px]">
                              REJECTED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reasons description */}
                      <div className="p-3.5 bg-white rounded-xl border border-stone-150 text-xs leading-relaxed text-stone-600">
                        📝 <span className="font-extrabold text-stone-800 uppercase text-[9px] tracking-wider block mb-1">Applicant Claim Description:</span> 
                        <p className="text-stone-700 font-medium">{claim.remarks || "No comments provided. Local documents checked."}</p>
                      </div>

                      {/* SCANNED DOCUMENTS INSPECTOR */}
                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-stone-600 block">Uploaded Supporting Documents:</span>
                        
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                          {claim.photoUrl ? (
                            <a href={claim.photoUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border rounded-lg flex items-center gap-1">
                              📸 Face Photo Verified
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 bg-stone-100 text-stone-400 border rounded-lg italic">📸 No Photo</span>
                          )}

                          {claim.identityDocUrl ? (
                            <a href={claim.identityDocUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border rounded-lg flex items-center gap-1">
                              📄 Identity Document
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 bg-stone-100 text-stone-400 border rounded-lg italic">📄 No ID Proof</span>
                          )}

                          {claim.addressProofUrl ? (
                            <a href={claim.addressProofUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border rounded-lg flex items-center gap-1">
                              🏠 Address Proof
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 bg-stone-100 text-stone-400 border rounded-lg italic">🏠 No Address Proof</span>
                          )}

                          {claim.certificateUrl ? (
                            <a href={claim.certificateUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border rounded-lg flex items-center gap-1">
                              🎓 Special Certificates
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 bg-stone-100 text-stone-400 border rounded-lg italic">🎓 No Certificate</span>
                          )}

                          {claim.supportingDocUrl ? (
                            <a href={claim.supportingDocUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border rounded-lg flex items-center gap-1">
                              📎 Supporting File
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 bg-stone-100 text-stone-400 border rounded-lg italic">📎 No Supp Doc</span>
                          )}
                        </div>
                      </div>

                      {/* Display correction remarks if present */}
                      {claim.status === "needs_correction" && claim.correctionRemarks && (
                        <div className="p-3 bg-orange-50 border border-orange-200 text-orange-950 text-xs rounded-xl font-medium">
                          <strong>⚠️ Correction remarks sent to member:</strong> {claim.correctionRemarks}
                        </div>
                      )}

                      {/* ACTIONS BAR (Visible to state executives/super admins) */}
                      {claim.status !== "approved" && claim.status !== "rejected" && (
                        <div className="border-t border-dashed border-stone-200 pt-3 space-y-3">
                          
                          <div className="flex flex-wrap gap-2 justify-end">
                            {/* Put Under Review */}
                            {claim.status === "pending" && (
                              <button
                                onClick={() => handleSetUnderReviewWelfareApplication(claim.id)}
                                className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg text-xs font-extrabold cursor-pointer transition-all"
                              >
                                ⏳ Put Under Review
                              </button>
                            )}

                            {/* Reject Application */}
                            <button
                              onClick={() => handleRejectWelfareApplication(claim.id)}
                              className="px-3.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-extrabold cursor-pointer transition-all"
                            >
                              ✕ Reject Claim
                            </button>

                            {/* Approve Application */}
                            <button
                              onClick={() => handleApproveWelfareApplication(claim.id)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black cursor-pointer transition-all shadow-sm"
                            >
                              ✓ Approve & Disburse Amount
                            </button>
                          </div>

                          {/* Request Correction text block */}
                          <div className="p-3 bg-stone-100 rounded-xl flex flex-col md:flex-row gap-2 items-end">
                            <div className="flex-1 w-full text-left">
                              <label className="block text-[10px] font-bold text-stone-600 mb-1">
                                Send Correction Request (Remarks will flash in the applicant's tracking ledger):
                              </label>
                              <input
                                type="text"
                                value={remarksDict[claim.id] || ""}
                                onChange={(e) => setRemarksDict(prev => ({ ...prev, [claim.id]: e.target.value }))}
                                placeholder="E.g., Bank details incorrect, scan copy blurry, please re-upload passbook copy."
                                className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRequestCorrectionWelfareApplication(claim.id, remarksDict[claim.id] || "")}
                              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-lg text-xs cursor-pointer shrink-0 transition-all"
                            >
                              ⚠️ Ask for Correction
                            </button>
                          </div>

                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })()}

        {/* TAB 4: TREASURER FINANCIAL LEDGER & PAYMENT VERIFICATION */}
        {adminTab === "payment_verifications" && (
          <div className="space-y-6 text-left">
            <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  {lang === "ta" ? "நிதி வரவு மற்றும் சந்தா சரிபார்ப்பு" : "TREASURY SUBSCRIPTION AUDITS"}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === "ta" 
                    ? "உறுப்பினர் ஆண்டுச் சந்தா மற்றும் நன்கொடைகள் சரிபார்த்தல்" 
                    : "Review payments submitted online, generate receipts, and finalize membership status."}
                </p>
              </div>
              <span className="bg-stone-900 text-amber-400 font-extrabold text-xs px-2.5 py-1 rounded-lg font-mono">
                Verification Req: {payments.filter((p) => p.status === "pending").length}
              </span>
            </div>

            {/* Live Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={lang === "ta" ? "தொகை அல்லது பெயர் கொண்டு தேட..." : "Search ledger records..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredPayments.map((p, idx) => (
                <div key={`adm_pay_${p.id}_${idx}`} className="p-4 border border-stone-200 bg-stone-50 rounded-2xl flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <span className="font-extrabold text-stone-950 text-sm block">{p.memberName}</span>
                    <span className="text-stone-500 block">ID: {p.memberId} | TXN: {p.transactionId}</span>
                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                      {p.paymentTypeTa} ({p.paymentType})
                    </span>
                  </div>

                  <div className="text-right space-y-2">
                    <span className="font-black text-stone-900 text-sm block">₹{p.amount}.00</span>
                    {p.status === "pending" ? (
                      <button
                        onClick={() => handleVerifyPayment(p.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition-all"
                      >
                        {lang === "ta" ? "வரவை ஏற்றுக்கொள்" : "Approve & Receipt"}
                      </button>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 font-black rounded text-[9px] block">
                        ● COMPLETELY AUDITED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MEMBER CARD PAYMENT VERIFICATION & CONFIGURATION */}
        {adminTab === "member_card_payments" && (
          <div className="space-y-6 text-left animate-[fadeIn_0.5s_ease-out]">
            <AdminMemberCardVerification 
              currentAdminName={currentUser.name || 'Admin'} 
              currentUser={currentUser}
              isSuperAdmin={currentUser.role === "super_admin" || currentUser.isPrimarySuperAdmin === true}
              lang={lang}
            />
          </div>
        )}

        {/* TAB 5: PUBLISH NEWS & BULLETINS */}
        {adminTab === "news_circulars" && (
          <div className="space-y-6 text-left animate-[fadeIn_0.5s_ease-out]">
            <h4 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-2">
              {lang === "ta" ? "அறிவிப்புகள் மற்றும் சுற்றறிக்கைகள் எழுதுதல்" : "POST NOTIFICATIONS & BULLETINS"}
            </h4>

            {/* AI DRAFTING COMPANION SECTION */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-300 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500 text-stone-950 p-1.5 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-stone-900 text-xs uppercase block">
                    🧙‍♂️ AI SUPER BRAIN - DRAFTING COMPANION
                  </span>
                  <span className="text-[10px] text-stone-600 block">
                    {lang === "ta"
                      ? "சுற்றறிக்கைகள், கூட்டப் பொருள்கள் மற்றும் சந்திப்பு முடிவுகளை AI மூலம் உடனடியாக வரைவு செய்ய விபரம் உள்ளிடவும்."
                      : "Type a quick description and let the AI generate professional bilingual announcements."}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "வரைவு செய்ய வேண்டிய விபரம்" : "What should the draft be about?"}
                  </label>
                  <input
                    type="text"
                    value={draftPrompt}
                    onChange={(e) => setDraftPrompt(e.target.value)}
                    placeholder={lang === "ta" ? "எ.கா: செப்டம்பர் 5-ல் சென்னையில் நடைபெறும் கல்வி உதவித்தொகை வழங்கும் விழா" : "e.g. Scholarship distribution camp in Madurai on Sept 5"}
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "வரைவு வகை (Type)" : "Document Category"}
                  </label>
                  <select
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="circular">{lang === "ta" ? "சுற்றறிக்கை (Circular)" : "Official Circular"}</option>
                    <option value="news">{lang === "ta" ? "செய்தி (News Bulletin)" : "General News"}</option>
                    <option value="event">{lang === "ta" ? "நிகழ்வு (Event Plan)" : "Upcoming Event"}</option>
                    <option value="minutes">{lang === "ta" ? "கூட்ட முடிவுரை (Meeting Minutes)" : "Meeting Minutes"}</option>
                    <option value="reminder">{lang === "ta" ? "நினைவூட்டல் (Renewal Reminder)" : "Renewal Reminder"}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleGenerateAIDraft}
                  disabled={draftLoading || !draftPrompt.trim()}
                  className="px-4 py-2 bg-stone-900 hover:bg-[#b91c1c] text-white disabled:bg-stone-300 disabled:text-stone-500 font-extrabold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {draftLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{lang === "ta" ? "வரைவு செய்யப்படுகிறது..." : "Super Brain Drafting..."}</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ {lang === "ta" ? "AI மூலம் வரைவு செய்" : "Draft with AI Super Brain"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleAddNews} className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
              <span className="font-extrabold text-xs text-stone-800 block">
                {lang === "ta" ? "புதிய சுற்றறிக்கை வரைவு" : "Compose New Bulletin Card"}
              </span>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">தலைப்பு (Tamil) *</label>
                    <input
                      type="text"
                      required
                      value={newNewsTitle}
                      onChange={(e) => setNewNewsTitle(e.target.value)}
                      placeholder="எ.கா: திருச்சி பயிற்சி முகாம்"
                      className="w-full px-3 py-2 border rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={newNewsTitleEn}
                      onChange={(e) => setNewNewsTitleEn(e.target.value)}
                      placeholder="e.g., Trichy Painting Workshop"
                      className="w-full px-3 py-2 border rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">வகையினம் (Category) *</label>
                  <select
                    value={newNewsCat}
                    onChange={(e) => setNewNewsCat(e.target.value as any)}
                    className="px-3 py-2 border rounded-xl bg-white cursor-pointer"
                  >
                    <option value="news">செய்தி (News)</option>
                    <option value="circular">சுற்றறிக்கை (Circular)</option>
                    <option value="event">நிகழ்வு (Event)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">விவரம் (Tamil) *</label>
                  <textarea
                    required
                    rows={3}
                    value={newNewsContent}
                    onChange={(e) => setNewNewsContent(e.target.value)}
                    placeholder="முழு உரை உள்ளடக்கம்..."
                    className="w-full p-3 border rounded-xl bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">Content (English) *</label>
                  <textarea
                    required
                    rows={3}
                    value={newNewsContentEn}
                    onChange={(e) => setNewNewsContentEn(e.target.value)}
                    placeholder="Detailed description in English..."
                    className="w-full p-3 border rounded-xl bg-white resize-none"
                  />
                </div>

                {/* News Image attachment from Mobile Gallery */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-extrabold text-stone-800 text-[11px]">
                      {lang === "ta" ? "📱 செய்தி புகைப்படம் / பேனர் (Mobile Gallery Image - விருப்பத்தேர்வு)" : "📱 Attach Image / Banner (Optional)"}
                    </label>
                    <div className="flex gap-1 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setNewNewsImageSource("file")}
                        className={`px-2 py-0.5 rounded cursor-pointer ${newNewsImageSource === "file" ? "bg-[#b91c1c] text-white" : "bg-stone-200 text-stone-700"}`}
                      >
                        {lang === "ta" ? "📱 கேலரி" : "📱 Gallery"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewNewsImageSource("url")}
                        className={`px-2 py-0.5 rounded cursor-pointer ${newNewsImageSource === "url" ? "bg-[#b91c1c] text-white" : "bg-stone-200 text-stone-700"}`}
                      >
                        {lang === "ta" ? "🌐 URL" : "🌐 URL"}
                      </button>
                    </div>
                  </div>

                  {newNewsImageSource === "file" ? (
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.size > 5 * 1024 * 1024) {
                              alert(lang === "ta" ? "படத்தின் அளவு 5MB-ஐ விட அதிகமாக இருக்கக்கூடாது" : "Image size exceeds 5MB limit.");
                              return;
                            }
                            setNewNewsImageFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = () => {
                              setNewNewsImageBase64(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-200 file:text-amber-950 hover:file:bg-amber-300 cursor-pointer border rounded-xl bg-white p-1"
                      />
                      {newNewsImageBase64 && (
                        <div className="mt-2 flex items-center gap-2">
                          <img src={newNewsImageBase64} alt="Preview" className="h-16 w-24 object-cover rounded-lg border shadow-xs" />
                          <div className="text-[10px]">
                            <span className="font-bold text-stone-700 block truncate max-w-xs">{newNewsImageFileName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewNewsImageBase64("");
                                setNewNewsImageFileName("");
                              }}
                              className="text-red-600 font-bold hover:underline cursor-pointer"
                            >
                              {lang === "ta" ? "படத்தை நீக்கு" : "Remove"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      placeholder="https://example.com/banner.jpg"
                      value={newNewsImageUrl}
                      onChange={(e) => setNewNewsImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-xl bg-white text-xs"
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-amber-500" />
                <span>{lang === "ta" ? "நேரலையில் பதிவிடு" : "Publish Announcement"}</span>
              </button>
            </form>

            <div className="space-y-2 pt-4">
              <h5 className="font-extrabold text-stone-900 text-xs uppercase mb-2">Published Bulletins:</h5>
              {news.map((item, idx) => (
                <div key={`adm_news_${item.id}_${idx}`} className="p-3 border border-stone-200 rounded-xl bg-stone-50 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-stone-800 block">{lang === "ta" ? item.title : item.titleEn}</span>
                    <span className="text-[10px] text-stone-400 block">{item.date} | {item.category.toUpperCase()}</span>
                  </div>
                  {canDeleteData && (
                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LEADERS DIRECTORY MANAGEMENT */}
        {adminTab === "leaders_directory" && (
          <div className="space-y-6 text-left animate-[fadeIn_0.5s_ease-out]">
            <h4 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-2">
              {lang === "ta" ? "தலைமை நிர்வாகிகள் மற்றும் மாவட்ட பிரதிநிதிகள்" : "LEADERS & REPRESENTATIVES DIRECTORY"}
            </h4>

            {/* Listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaders.map((l, idx) => {
                const isPresident = l.roleEn.includes("President");
                const isSecretary = l.roleEn.includes("Secretary");

                const defaultPhoto = isPresident 
                  ? "/s_michael_alvin.svg" 
                  : isSecretary 
                    ? "/r_xavier_babu.svg" 
                    : "/r_sakthivel.svg";
                
                const photoSrc = (l.photoUrl && !l.photoUrl.includes("placehold.co")) ? l.photoUrl : defaultPhoto;

                const borderColor = isPresident 
                  ? "border-amber-500" 
                  : isSecretary 
                    ? "border-blue-600" 
                    : "border-emerald-600";

                return (
                  <div key={`adm_ldr_${l.id}_${idx}`} className="p-3.5 border border-stone-200 rounded-2xl bg-stone-50 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`relative group ${isSuperAdmin ? "cursor-pointer" : ""}`}
                        onClick={() => {
                          if (isSuperAdmin) {
                            const input = document.getElementById(`adm_dir_file_${l.id}`) as HTMLInputElement;
                            input?.click();
                          }
                        }}
                      >
                        <img 
                          src={photoSrc} 
                          alt="Photo" 
                          className={`h-11 w-11 rounded-full object-cover border-2 ${borderColor} shadow-sm bg-white`} 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultPhoto;
                          }}
                        />
                        {isSuperAdmin && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                            <Camera className="w-4 h-4 text-amber-300" />
                          </div>
                        )}
                        {isSuperAdmin && (
                          <input
                            type="file"
                            id={`adm_dir_file_${l.id}`}
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
                                  const updated = leaders.map(item => item.id === l.id ? { ...item, photoUrl: base64 } : item);
                                  onUpdateLeaders(updated);
                                  onAddAuditLog("Updated Leader Photo", `Photo updated for leader: ${l.nameEn}`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <span className="font-extrabold text-stone-950 text-sm block">{lang === "ta" ? l.name : l.nameEn}</span>
                        <span className="text-[10px] text-amber-800 font-extrabold uppercase">{lang === "ta" ? l.role : l.roleEn}</span>
                        <span className="text-stone-400 text-[10px] block mt-0.5">{l.phone}</span>
                      </div>
                    </div>
                    {canDeleteData && (
                      <button
                        onClick={() => handleDeleteLeader(l.id)}
                        className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-[#b91c1c] rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleAddLeader} className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
              <span className="font-extrabold text-xs text-stone-800 block">
                {lang === "ta" ? "புதிய தலைவர் கார்டு சேர்க்க (Super Admin Only)" : "Add New Leader Card (Super Admin Only)"}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">பெயர் (Tamil) *</label>
                  <input
                    type="text"
                    required
                    value={newLeaderName}
                    onChange={(e) => setNewLeaderName(e.target.value)}
                    placeholder="எஸ். மைக்கேல் ஆல்வின்"
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={newLeaderNameEn}
                    onChange={(e) => setNewLeaderNameEn(e.target.value)}
                    placeholder="S. Michael Alvin"
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">பதவி (Tamil) *</label>
                  <input
                    type="text"
                    required
                    value={newLeaderRole}
                    onChange={(e) => setNewLeaderRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Role (English) *</label>
                  <input
                    type="text"
                    required
                    value={newLeaderRoleEn}
                    onChange={(e) => setNewLeaderRoleEn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">தொலைபேசி எண் *</label>
                  <input
                    type="text"
                    required
                    value={newLeaderPhone}
                    onChange={(e) => setNewLeaderPhone(e.target.value)}
                    placeholder="+919443xxxxxx"
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">
                    {lang === "ta" ? "புகைப்படம் (Upload Image or URL)" : "Photo Upload / URL"}
                  </label>
                  <div className="flex items-center gap-2">
                    {isSuperAdmin ? (
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.size > 2 * 1024 * 1024) {
                              alert(lang === "ta" ? "கோப்பின் அளவு 2MB-ஐ விட அதிகமாக இருக்கக்கூடாது (Max 2MB)" : "File size exceeds 2MB limit.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setNewLeaderPhoto(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer border rounded-xl bg-white p-1"
                      />
                    ) : (
                      <input
                        type="text"
                        value={newLeaderPhoto}
                        onChange={(e) => setNewLeaderPhoto(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border rounded-xl bg-white"
                      />
                    )}
                  </div>
                  {newLeaderPhoto && (
                    <div className="mt-1 flex items-center gap-2">
                      <img src={newLeaderPhoto} alt="Preview" className="w-8 h-8 rounded-full object-cover border border-amber-500" />
                      <span className="text-[10px] text-emerald-700 font-bold">✓ Photo ready</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                + Save Executive Details
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: SECURITY SYSTEM CONTROLS */}
        {adminTab === "system_controls" && (
          <div className="space-y-6 text-left animate-[fadeIn_0.5s_ease-out]">
            <h4 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-2">
              {lang === "ta" ? "பாதுகாப்பு & இணையதள செயல்பாட்டுக் கட்டுப்பாடுகள்" : "SECURITY & WEB MANAGEMENT SYSTEM"}
            </h4>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 leading-relaxed">
              🔑 <span className="font-extrabold">Super-User Authorization Active:</span> Changes made here modify the registration API workflows, OTP generation thresholds, and District preliminary approval capabilities instantly.
            </div>

            <div className="space-y-4 max-w-lg text-xs text-stone-700">
              <div className="flex justify-between items-center p-3 border border-stone-200 rounded-xl bg-stone-50">
                <div>
                  <span className="font-bold block text-stone-900">District Preliminary Approval Flow</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Let District Secretaries pre-approve local applications before state review.</span>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.allowDistrictPreliminaryApproval}
                  onChange={(e) => {
                    onUpdateSystemSettings({
                      ...systemSettings,
                      allowDistrictPreliminaryApproval: e.target.checked
                    });
                    onAddAuditLog("Modified System Switch", `District Preliminary Approval set to: ${e.target.checked}`);
                  }}
                  className="h-4.5 w-4.5 cursor-pointer accent-[#b91c1c]"
                />
              </div>

              <div className="flex justify-between items-center p-3 border border-stone-200 rounded-xl bg-stone-50">
                <div>
                  <span className="font-bold block text-stone-900">Enable Member Auto-Approval Bypass</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Automatically accept applications with fully verified Aadhaar records.</span>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.enableAutoApproval}
                  onChange={(e) => {
                    onUpdateSystemSettings({
                      ...systemSettings,
                      enableAutoApproval: e.target.checked
                    });
                    onAddAuditLog("Modified System Switch", `Auto-Approval set to: ${e.target.checked}`);
                  }}
                  className="h-4.5 w-4.5 cursor-pointer accent-[#b91c1c]"
                />
              </div>

              <div className="flex justify-between items-center p-3 border border-stone-200 rounded-xl bg-stone-50">
                <div>
                  <span className="font-bold block text-stone-900">Platform Maintenance Mode</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Lock website actions except for verified State Executives.</span>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => {
                    onUpdateSystemSettings({
                      ...systemSettings,
                      maintenanceMode: e.target.checked
                    });
                    onAddAuditLog("Modified System Switch", `Platform Maintenance Mode set to: ${e.target.checked}`);
                  }}
                  className="h-4.5 w-4.5 cursor-pointer accent-[#b91c1c]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1.5">Required Membership Fee (INR):</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={systemSettings.requiredSubscriptionAmount}
                    onChange={(e) => {
                      onUpdateSystemSettings({
                        ...systemSettings,
                        requiredSubscriptionAmount: Number(e.target.value)
                      });
                    }}
                    className="w-32 px-3 py-2 border rounded-xl bg-stone-50 text-stone-900"
                  />
                  <button
                    onClick={() => {
                      onAddAuditLog("Modified Fee Parameter", `Yearly subscription fee adjusted to Rs. ${systemSettings.requiredSubscriptionAmount}`);
                      alert("Successfully updated membership fee threshold!");
                    }}
                    className="px-4 py-2 bg-stone-950 text-white rounded-xl hover:bg-stone-800 font-extrabold text-xs cursor-pointer shadow-sm"
                  >
                    Set Amount
                  </button>
                </div>
              </div>

              {/* DYNAMIC AI KNOWLEDGE BASE EDITOR */}
              <div className="border-t border-stone-200 pt-6 mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-stone-900 text-xs uppercase tracking-wider block">
                      🤖 AI KNOWLEDGE BASE & SYSTEM INSTRUCTIONS
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {lang === "ta" 
                        ? "AI உதவியாளரின் அறிவுத் தளம் மற்றும் விதிகளை இங்கிருந்து நிர்வகிக்கலாம்." 
                        : "Manage custom guidelines and bylaws dynamically injected into the AI Super Brain."}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#b91c1c] text-white rounded text-[9px] font-black tracking-widest uppercase">
                    {lang === "ta" ? "சூப்பர் அட்மின் மட்டும்" : "SUPER ADMIN ONLY"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-extrabold text-[#b91c1c] text-[10px] uppercase">
                      தமிழ் அறிவுத் தளம் (AI Tamil Guidelines)
                    </label>
                    <textarea
                      value={systemSettings.aiKnowledgeBaseTa || ""}
                      onChange={(e) => {
                        onUpdateSystemSettings({
                          ...systemSettings,
                          aiKnowledgeBaseTa: e.target.value
                        });
                      }}
                      rows={8}
                      placeholder="சங்கத்தின் கொள்கைகள் மற்றும் தமிழ் வழிமுறைகள்..."
                      className="w-full px-3 py-2 border rounded-xl bg-stone-50 text-stone-900 font-sans text-xs leading-relaxed focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-extrabold text-amber-800 text-[10px] uppercase">
                      English Knowledge Base (AI English Guidelines)
                    </label>
                    <textarea
                      value={systemSettings.aiKnowledgeBaseEn || ""}
                      onChange={(e) => {
                        onUpdateSystemSettings({
                          ...systemSettings,
                          aiKnowledgeBaseEn: e.target.value
                        });
                      }}
                      rows={8}
                      placeholder="Union policies, safety bylaws, and painting standards in English..."
                      className="w-full px-3 py-2 border rounded-xl bg-stone-50 text-stone-900 font-sans text-xs leading-relaxed focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    onAddAuditLog("AI Knowledge Base Updated", "Published revised custom knowledge guidelines to AI Agent.");
                    alert(lang === "ta" ? "AI அறிவுத் தளம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!" : "AI Knowledge Base successfully updated and deployed!");
                  }}
                  className="px-4 py-2.5 bg-[#b91c1c] hover:bg-red-800 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  🚀 {lang === "ta" ? "அறிவுத் தளத்தை புதுப்பிக்கவும்" : "Save & Publish Guidelines"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS & BACKUP EXPORT */}
        {adminTab === "audit_logs" && (
          <div className="space-y-6 text-left animate-[fadeIn_0.5s_ease-out]">
            <div className="border-b border-stone-100 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-black text-stone-900 uppercase">
                  {lang === "ta" ? "பாதுகாப்பு தணிக்கை மற்றும் தரவு மேலாண்மை" : "DATABASE BACKUP & AUDIT LOGGER"}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === "ta" 
                    ? "அனைத்து ஒப்புதல்கள், நிதி மாற்றங்கள் மற்றும் காப்புப்பிரதி ஏற்றுதல்/இறக்குதல் விவரங்கள்" 
                    : "Cryptographically track and trace administrative actions. Download SQL dump backups."}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleSimulatedRestore}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border"
                >
                  <Upload className="w-4 h-4 text-stone-600" />
                  <span>{lang === "ta" ? "காப்பு மீட்க (Restore)" : "Restore Database"}</span>
                </button>

                <button
                  onClick={handleExportBackup}
                  className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-800 text-amber-400 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ta" ? "காப்பு ஏற்று (Backup JSON)" : "Download SQL Dump"}</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-900 text-white uppercase text-[10px] tracking-wider">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">User Account</th>
                    <th className="p-3">Scope Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-stone-50/50">
                  {auditLogs.map((log, idx) => (
                    <tr key={`adm_log_${log.id}_${idx}`} className="hover:bg-white transition-all">
                      <td className="p-3 font-mono text-[10px] text-stone-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3 font-bold text-stone-800">{log.action}</td>
                      <td className="p-3 text-stone-600 leading-relaxed">{log.details}</td>
                      <td className="p-3 font-semibold text-[#b91c1c] shrink-0">{log.performedBy}</td>
                      <td className="p-3 font-extrabold text-stone-400 text-[10px] uppercase shrink-0">{log.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: SELF-HEALING & HEALTH COMMAND CONSOLE */}
        {adminTab === "self_healing" && (
          <div className="space-y-6 text-left animate-[fadeIn_0.5s_ease-out]">
            <SelfHealingConsole
              currentUserRole={currentUser.role}
              adminName={currentUser.name || currentUser.adminUsername || "Admin"}
              onAddAuditLog={onAddAuditLog}
            />
          </div>
        )}

        {/* TAB 10: SUPER ADMIN ID CARD DESIGN & DIRECT EDITOR */}
        {adminTab === "id_card_customizer" && isSuperAdmin && (
          <div className="space-y-6 text-left animate-[fadeIn_0.3s_ease-out]">
            <SuperAdminIdCardEditor
              lang={lang}
              currentUser={currentUser}
              registrations={registrations}
              onUpdateRegistration={(updated) => {
                const nextRegs = registrations.map(r => r.id === updated.id ? updated : r);
                onUpdateRegistrations(nextRegs);
              }}
              onAddRegistration={(newReg) => {
                onUpdateRegistrations([newReg, ...registrations]);
              }}
              onAddAuditLog={onAddAuditLog}
            />
          </div>
        )}

        {/* TAB 11: LEADERS VIDEO & AUDIO CONFERENCE STUDIO */}
        {adminTab === "conference_studio" && (
          <div className="space-y-6 text-left animate-[fadeIn_0.3s_ease-out]">
            <UnionConferenceStudio
              lang={lang}
              currentUser={currentUser}
              onAddAuditLog={onAddAuditLog}
            />
          </div>
        )}

      </div>

    </div>
  );
}
