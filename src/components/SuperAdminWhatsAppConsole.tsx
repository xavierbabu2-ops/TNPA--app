import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  Clock, 
  Lock, 
  Download, 
  Printer, 
  AlertTriangle, 
  Check, 
  Phone, 
  User, 
  MapPin, 
  FileText,
  Activity
} from "lucide-react";
import { DistrictWhatsAppGroup, DistrictWhatsAppReportRow, DetailedAuditRecord } from "../types";

const TN_DISTRICTS_LIST = [
  { ta: "அரியலூர்", en: "Ariyalur" },
  { ta: "செங்கல்பட்டு", en: "Chengalpattu" },
  { ta: "சென்னை", en: "Chennai" },
  { ta: "கோயம்புத்தூர்", en: "Coimbatore" },
  { ta: "கடலூர்", en: "Cuddalore" },
  { ta: "தர்மபுரி", en: "Dharmapuri" },
  { ta: "திண்டுக்கல்", en: "Dindigul" },
  { ta: "ஈரோடு", en: "Erode" },
  { ta: "கள்ளக்குறிச்சி", en: "Kallakurichi" },
  { ta: "காஞ்சிபுரம்", en: "Kanchipuram" },
  { ta: "கன்னியாகுமரி", en: "Kanyakumari" },
  { ta: "கரூர்", en: "Karur" },
  { ta: "கிருஷ்ணகிரி", en: "Krishnagiri" },
  { ta: "மதுரை", en: "Madurai" },
  { ta: "மயிலாடுதுறை", en: "Mayiladuthurai" },
  { ta: "நாகப்பட்டினம்", en: "Nagapattinam" },
  { ta: "நாமக்கல்", en: "Namakkal" },
  { ta: "நீலகிரி", en: "Nilgiris" },
  { ta: "பெரம்பலூர்", en: "Perambalur" },
  { ta: "புதுக்கோட்டை", en: "Pudukkottai" },
  { ta: "ராமநாதபுரம்", en: "Ramanathapuram" },
  { ta: "ராணிப்பேட்டை", en: "Ranipet" },
  { ta: "சேலம்", en: "Salem" },
  { ta: "சிவகங்கை", en: "Sivagangai" },
  { ta: "தென்காசி", en: "Tenkasi" },
  { ta: "தஞ்சாவூர்", en: "Thanjavur" },
  { ta: "தேனி", en: "Theni" },
  { ta: "தூத்துக்குடி", en: "Thoothukudi" },
  { ta: "திருச்சிராப்பள்ளி", en: "Tiruchirappalli" },
  { ta: "திருநெல்வேலி", en: "Tirunelveli" },
  { ta: "திருப்பத்தூர்", en: "Tirupathur" },
  { ta: "திருப்பூர்", en: "Tiruppur" },
  { ta: "திருவள்ளூர்", en: "Tiruvallur" },
  { ta: "திருவண்ணாமலை", en: "Tiruvannamalai" },
  { ta: "திருவாரூர்", en: "Tiruvarur" },
  { ta: "வேலூர்", en: "Vellore" },
  { ta: "விழுப்புரம்", en: "Viluppuram" },
  { ta: "விருதுநகர்", en: "Virudhunagar" }
];

interface SuperAdminWhatsAppConsoleProps {
  lang: "ta" | "en";
  currentUser: any;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function SuperAdminWhatsAppConsole({
  lang,
  currentUser,
  onAddAuditLog
}: SuperAdminWhatsAppConsoleProps) {
  const [subTab, setSubTab] = useState<"groups" | "report" | "audit">("groups");
  
  // Group list & Loading state
  const [groups, setGroups] = useState<DistrictWhatsAppGroup[]>([]);
  const [reports, setReports] = useState<DistrictWhatsAppReportRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<DetailedAuditRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Primary Super Admin Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<Partial<DistrictWhatsAppGroup> | null>(null);
  const [editReason, setEditReason] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Check if current user is Primary Super Admin
  const isPrimarySuperAdmin = 
    currentUser?.isPrimarySuperAdmin === true || 
    currentUser?.role === "super_admin" || 
    currentUser?.adminUsername === "superadmin";

  useEffect(() => {
    fetchWhatsAppGroups();
    fetchReports();
    fetchAuditLogs();
  }, []);

  const fetchWhatsAppGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp-groups");
      const data = await res.json();
      if (data.success && data.groups) {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error("Error loading WhatsApp groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/whatsapp-consent/report");
      const data = await res.json();
      if (data.success && data.report) {
        setReports(data.report);
      }
    } catch (err) {
      console.error("Error loading consent report:", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/admin/detailed-audit-logs");
      const data = await res.json();
      if (data.success && data.logs) {
        const waLogs = data.logs.filter((l: DetailedAuditRecord) => 
          l.action.includes("WHATSAPP") || l.fieldChanged.toLowerCase().includes("whatsapp")
        );
        setAuditLogs(waLogs);
      }
    } catch (err) {
      console.error("Error loading audit logs:", err);
    }
  };

  const handleSelectDistrict = (distName: string) => {
    const matchedDist = TN_DISTRICTS_LIST.find(d => d.ta === distName || d.en.toLowerCase() === distName.toLowerCase());
    const taName = matchedDist ? matchedDist.ta : distName;
    const enName = matchedDist ? matchedDist.en : distName;

    // Check if group already exists for this district
    const existing = groups.find(g => 
      g.district.trim().toLowerCase() === taName.trim().toLowerCase() ||
      g.districtEn.trim().toLowerCase() === enName.trim().toLowerCase()
    );

    if (existing) {
      setEditingGroup({ ...existing });
      setEditReason(lang === "ta" ? `${taName} மாவட்ட வாட்ஸ்அப் குழு அமைப்புகள் புதுப்பித்தல்` : `Updating WhatsApp group for ${enName}`);
    } else {
      setEditingGroup(prev => ({
        ...prev,
        district: taName,
        districtEn: enName,
        groupName: `TNPA ${taName} மாவட்ட உறுப்பினர்கள்`,
        inviteLink: prev?.inviteLink || "https://chat.whatsapp.com/",
        status: prev?.status || "active",
        coordinatorName: prev?.coordinatorName || "",
        coordinatorPhone: prev?.coordinatorPhone || ""
      }));
    }
  };

  const handleOpenEditModal = (groupToEdit?: DistrictWhatsAppGroup) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (groupToEdit) {
      setEditingGroup({ ...groupToEdit });
      setEditReason(lang === "ta" ? `${groupToEdit.district} மாவட்ட வாட்ஸ்அப் குழு அமைப்புகள் புதுப்பித்தல்` : `Update WhatsApp group for ${groupToEdit.district}`);
    } else {
      setEditingGroup({
        district: "சென்னை",
        districtEn: "Chennai",
        groupName: "TNPA சென்னை மாவட்ட உறுப்பினர்கள்",
        inviteLink: "https://chat.whatsapp.com/",
        status: "active",
        coordinatorName: "",
        coordinatorPhone: ""
      });
      setEditReason(lang === "ta" ? "புதிய மாவட்ட வாட்ஸ்அப் குழு அமைத்தல்" : "District WhatsApp Group Configuration");
    }
    setIsModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const district = (editingGroup?.district || "").trim();
    const groupName = (editingGroup?.groupName || "").trim();
    let inviteLink = (editingGroup?.inviteLink || "").trim();

    if (!district || !groupName || !inviteLink) {
      setErrorMessage(lang === "ta" 
        ? "மாவட்டம், குழு பெயர் மற்றும் அழைப்பு இணைப்பு ஆகியவை கட்டாயமாகும்." 
        : "District Name, Group Name, and Invite Link are required.");
      return;
    }

    if (!inviteLink.startsWith("http://") && !inviteLink.startsWith("https://")) {
      inviteLink = `https://${inviteLink}`;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/whatsapp-groups", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-primary-super-admin": "true",
          "x-user-role": currentUser?.role || "super_admin",
          "x-username": currentUser?.adminUsername || currentUser?.username || "superadmin",
          "x-user-id": currentUser?.id || "usr_super_admin"
        },
        body: JSON.stringify({
          id: editingGroup?.id,
          district: district,
          districtEn: (editingGroup?.districtEn || district).trim(),
          groupName: groupName,
          inviteLink: inviteLink,
          status: editingGroup?.status || "active",
          coordinatorName: (editingGroup?.coordinatorName || "").trim(),
          coordinatorPhone: (editingGroup?.coordinatorPhone || "").trim(),
          reason: editReason || `Official WhatsApp group update for ${district} by Primary Super Admin`,
          userRole: currentUser?.role || "super_admin",
          adminUsername: currentUser?.adminUsername || currentUser?.username || "superadmin",
          editorName: currentUser?.name || currentUser?.adminName || "Super Admin R. Xavier Babu",
          editorUsername: currentUser?.adminUsername || currentUser?.username || "superadmin",
          editorId: currentUser?.id || "usr_super_admin"
        })
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Non-JSON response received from server:", jsonErr);
        data = { success: false, error: "Invalid server response format." };
      }

      if (res.ok && data?.success) {
        const msg = lang === "ta" 
          ? (data.messageTa || "வாட்ஸ்அப் குழு அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன.") 
          : (data.message || "WhatsApp group configuration saved successfully.");
        setSuccessMessage(msg);
        
        onAddAuditLog(
          "WHATSAPP_GROUP_UPDATED", 
          `Configured WhatsApp Group for ${district}: ${groupName}`
        );

        fetchWhatsAppGroups();
        fetchReports();
        fetchAuditLogs();

        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMessage(null);
        }, 800);
      } else {
        const errText = lang === "ta" 
          ? (data?.errorTa || data?.error || "சேமிப்பதில் தோல்வி ஏற்பட்டது.") 
          : (data?.error || "Failed to save configuration.");
        setErrorMessage(errText);
      }
    } catch (err: any) {
      console.error("Error saving WhatsApp group:", err);
      const networkErrMsg = lang === "ta" 
        ? "சேவையகத்துடன் இணைக்க முடியவில்லை. இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
        : "Failed to communicate with server. Please verify network connection and retry.";
      setErrorMessage(networkErrMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string, districtName: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY REMOVE the official WhatsApp group for ${districtName}? This action will be audited.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/whatsapp-groups/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-primary-super-admin": "true",
          "x-user-role": currentUser?.role || "super_admin",
          "x-username": currentUser?.adminUsername || currentUser?.username || "superadmin",
          "x-user-id": currentUser?.id || "usr_super_admin"
        }
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Non-JSON response in delete:", jsonErr);
        data = { success: false, error: "Invalid server response." };
      }
      if (res.ok && data?.success) {
        alert(data.messageTa || data.message);
        onAddAuditLog("WHATSAPP_GROUP_DELETED", `Deleted WhatsApp group link for district ${districtName}`);
        fetchWhatsAppGroups();
        fetchReports();
        fetchAuditLogs();
      } else {
        alert(data?.errorTa || data?.error || "Failed to delete group.");
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("Error contacting server to delete group.");
    }
  };

  // Filtered groups
  const filteredGroups = groups.filter((g) => {
    const matchesSearch = 
      g.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.districtEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.coordinatorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || g.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-stone-900">
      
      {/* SUPER ADMIN ACCESS BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white rounded-2xl p-5 shadow-xl border-2 border-emerald-600/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <MessageSquare className="w-7 h-7 text-emerald-300 fill-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-stone-950 font-black text-[9px] uppercase tracking-wider">
                PRIMARY SUPER ADMIN EXCLUSIVE
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-800 text-emerald-300 font-mono text-[9px] border border-emerald-700">
                AUDITED RBAC CONTROL
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white mt-1">
              {lang === "ta" ? "மாவட்ட வாட்ஸ்அப் குழு மேலாண்மை மையம்" : "District WhatsApp Groups Command Center"}
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              {lang === "ta" 
                ? "38 மாவட்டங்களுக்கும் பிரத்தியேக வாட்ஸ்அப் குழு இணைப்புகள், ஒருங்கிணைப்பாளர்கள் மற்றும் உறுப்பினர் ஒப்புதல் புள்ளிவிவரங்கள்." 
                : "Manage official WhatsApp group links, coordinators, and audit member consent analytics across all 38 TN districts."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              fetchWhatsAppGroups();
              fetchReports();
              fetchAuditLogs();
            }}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === "ta" ? "புதுப்பி" : "Refresh Data"}</span>
          </button>

          <button
            onClick={() => handleOpenEditModal()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === "ta" ? "புதிய குழு சேர்" : "Add District Group"}</span>
          </button>
        </div>
      </div>

      {/* MODULE SUB-NAVIGATION */}
      <div className="flex border-b border-stone-200 gap-2 bg-stone-100 p-1.5 rounded-xl">
        <button
          onClick={() => setSubTab("groups")}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            subTab === "groups"
              ? "bg-stone-900 text-white shadow-md"
              : "text-stone-600 hover:bg-stone-200"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>{lang === "ta" ? "மாவட்ட வாட்ஸ்அப் அமைப்புகள் (38)" : "District Group Directory (38)"}</span>
        </button>

        <button
          onClick={() => setSubTab("report")}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            subTab === "report"
              ? "bg-stone-900 text-white shadow-md"
              : "text-stone-600 hover:bg-stone-200"
          }`}
        >
          <Activity className="w-4 h-4 text-amber-400" />
          <span>{lang === "ta" ? "உறுப்பினர் சேர்க்கை அறிக்கை" : "Member Consent Report"}</span>
        </button>

        <button
          onClick={() => setSubTab("audit")}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            subTab === "audit"
              ? "bg-stone-900 text-white shadow-md"
              : "text-stone-600 hover:bg-stone-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>{lang === "ta" ? "வாட்ஸ்அப் தணிக்கைப் பதிவேடு" : "Audit Trail History"}</span>
        </button>
      </div>

      {/* SUB-TAB 1: DISTRICT GROUPS DIRECTORY */}
      {subTab === "groups" && (
        <div className="space-y-4">
          
          {/* Search & Filter HUD */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="relative flex-grow w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ta" ? "மாவட்டம், குழு பெயர், ஒருங்கிணைப்பாளர் தேடுக..." : "Search district, group name, coordinator..."}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-stone-600 shrink-0">{lang === "ta" ? "நிலை:" : "Status:"}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-xl bg-white text-xs text-stone-800 font-semibold cursor-pointer"
              >
                <option value="all">{lang === "ta" ? "அனைத்தும்" : "All Status"}</option>
                <option value="active">{lang === "ta" ? "செயலில் உள்ளவை (Active)" : "Active Groups"}</option>
                <option value="inactive">{lang === "ta" ? "செயலிழந்தவை (Inactive)" : "Inactive Groups"}</option>
              </select>
            </div>
          </div>

          {/* Groups Directory Table */}
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-stone-200 uppercase font-extrabold text-[10px] tracking-wider border-b">
                    <th className="p-3.5">{lang === "ta" ? "மாவட்டம் (District)" : "District"}</th>
                    <th className="p-3.5">{lang === "ta" ? "வாட்ஸ்அப் குழு பெயர்" : "WhatsApp Group Name"}</th>
                    <th className="p-3.5">{lang === "ta" ? "அழைப்பு இணைப்பு (Invite Link)" : "Invite Link"}</th>
                    <th className="p-3.5">{lang === "ta" ? "ஒருங்கிணைப்பாளர்" : "Coordinator"}</th>
                    <th className="p-3.5 text-center">{lang === "ta" ? "நிலை" : "Status"}</th>
                    <th className="p-3.5 text-center">{lang === "ta" ? "கடைசி மாற்றம்" : "Last Updated"}</th>
                    <th className="p-3.5 text-right">{lang === "ta" ? "செயல்கள்" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-500">
                        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        {lang === "ta" ? "மாவட்ட வாட்ஸ்அப் விபரங்கள் ஏற்றப்படுகின்றன..." : "Loading District WhatsApp Groups..."}
                      </td>
                    </tr>
                  ) : filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-500">
                        {lang === "ta" ? "எந்த மாவட்ட வாட்ஸ்அப் குழுவும் கண்டறியப்படவில்லை." : "No matching district WhatsApp groups found."}
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-3.5 font-bold text-stone-900">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{group.district}</span>
                            {group.districtEn && (
                              <span className="text-[10px] text-stone-400 font-mono">({group.districtEn})</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 font-bold text-emerald-950">
                          {group.groupName}
                        </td>

                        <td className="p-3.5 font-mono text-[11px] text-stone-600 max-w-[200px] truncate">
                          <a
                            href={group.inviteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                          >
                            <span className="truncate">{group.inviteLink}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>

                        <td className="p-3.5">
                          {group.coordinatorName ? (
                            <div>
                              <span className="font-bold text-stone-900 block">{group.coordinatorName}</span>
                              <span className="text-[10px] text-stone-500 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-stone-400" />
                                {group.coordinatorPhone}
                              </span>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            group.status === "active" 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-stone-200 text-stone-600 border border-stone-300"
                          }`}>
                            {group.status === "active" 
                              ? (lang === "ta" ? "செயலில்" : "Active")
                              : (lang === "ta" ? "செயலிழப்பு" : "Inactive")}
                          </span>
                        </td>

                        <td className="p-3.5 text-center text-[10px] text-stone-500">
                          <div>{new Date(group.lastUpdated).toLocaleDateString("en-IN")}</div>
                          {group.lastUpdatedBy && (
                            <div className="font-semibold text-stone-700">{group.lastUpdatedBy}</div>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(group)}
                            className="p-1.5 bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-900 rounded-lg transition-colors cursor-pointer"
                            title="Edit Official Group Link"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteGroup(group.id, group.district)}
                            className="p-1.5 bg-stone-100 hover:bg-red-100 text-stone-800 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                            title="Delete Group Mapping"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MEMBER CONSENT REPORT */}
      {subTab === "report" && (
        <div className="space-y-5">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase block tracking-wider">
                {lang === "ta" ? "மொத்த மாவட்டங்கள்" : "Districts Configured"}
              </span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">
                {reports.length}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
              <span className="text-[10px] font-extrabold text-blue-800 uppercase block tracking-wider">
                {lang === "ta" ? "ஒப்புதல் அளித்து இணைந்தோர்" : "Accepted / Joined"}
              </span>
              <span className="text-2xl font-black text-blue-950 mt-1 block">
                {reports.reduce((acc, r) => acc + (r.acceptedCount || 0) + (r.linkOpenedCount || 0), 0)}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase block tracking-wider">
                {lang === "ta" ? "இணைப்பு திறந்தோர்" : "Link Opened"}
              </span>
              <span className="text-2xl font-black text-amber-950 mt-1 block">
                {reports.reduce((acc, r) => acc + (r.linkOpenedCount || 0), 0)}
              </span>
            </div>

            <div className="bg-stone-100 border border-stone-200 p-4 rounded-2xl">
              <span className="text-[10px] font-extrabold text-stone-600 uppercase block tracking-wider">
                {lang === "ta" ? "நிராகரித்தோர்" : "Declined"}
              </span>
              <span className="text-2xl font-black text-stone-800 mt-1 block">
                {reports.reduce((acc, r) => acc + (r.declinedCount || 0), 0)}
              </span>
            </div>
          </div>

          {/* District Breakdown Table */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-stone-900 text-white flex justify-between items-center">
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{lang === "ta" ? "மாவட்ட வாரியாக வாட்ஸ்அப் இணைப்பு நிலை அறிக்கை" : "District-Wise WhatsApp Join Status Report"}</span>
              </h4>
              <button
                onClick={() => window.print()}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-xs font-bold rounded-lg transition-colors"
              >
                {lang === "ta" ? "அச்சிடு" : "Print Report"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-bold border-b text-[10px] uppercase">
                    <th className="p-3">{lang === "ta" ? "மாவட்டம்" : "District"}</th>
                    <th className="p-3">{lang === "ta" ? "குழு பெயர்" : "Group Name"}</th>
                    <th className="p-3 text-center">{lang === "ta" ? "மொத்த உறுப்பினர்கள்" : "Members"}</th>
                    <th className="p-3 text-center text-emerald-700">{lang === "ta" ? "ஒப்புக்கொண்டோர்" : "Accepted"}</th>
                    <th className="p-3 text-center text-blue-700">{lang === "ta" ? "இணைப்பு திறந்தோர்" : "Link Opened"}</th>
                    <th className="p-3 text-center text-stone-500">{lang === "ta" ? "நிராகரித்தோர்" : "Declined"}</th>
                    <th className="p-3 text-center">{lang === "ta" ? "ஒருங்கிணைப்பாளர்" : "Coordinator"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {reports.map((row, idx) => (
                    <tr key={`rep_row_${idx}`} className="hover:bg-stone-50">
                      <td className="p-3 font-bold text-stone-900">{row.district}</td>
                      <td className="p-3 text-emerald-900">{row.groupName || "Not Configured"}</td>
                      <td className="p-3 text-center font-bold">{row.totalMembers}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{row.acceptedCount}</td>
                      <td className="p-3 text-center font-bold text-blue-700">{row.linkOpenedCount}</td>
                      <td className="p-3 text-center font-bold text-stone-500">{row.declinedCount}</td>
                      <td className="p-3 text-center text-[11px] text-stone-600">
                        {row.coordinatorName ? `${row.coordinatorName} (${row.coordinatorPhone})` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AUDIT TRAIL HISTORY */}
      {subTab === "audit" && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{lang === "ta" ? "வாட்ஸ்அப் குழு மாற்றங்கள் தணிக்கைப் பதிவேடு" : "WhatsApp Group Configuration Audit Log"}</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === "ta" 
                  ? "முதன்மை சூப்பர் அட்மினினால் செய்யப்பட்ட மாற்றங்கள் மற்றும் அனுமதி மீறல் முயற்சிகளின் முழுமையான பதிவேடு." 
                  : "Immutable log of all official group updates, deletions, and unauthorized modification attempts."}
              </p>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              {lang === "ta" ? "இதுவரை வாட்ஸ்அப் குழு மாற்றங்கள் எதுவும் பதிவாகவில்லை." : "No WhatsApp configuration changes logged yet."}
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    log.isUnauthorizedAttempt 
                      ? "bg-red-50 border-red-300 text-red-950" 
                      : "bg-stone-50 border-stone-200 text-stone-800"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        log.isUnauthorizedAttempt ? "bg-red-600 text-white" : "bg-emerald-700 text-white"
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-bold text-stone-900">{log.fieldChanged}</span>
                    </div>

                    <span className="text-[10px] text-stone-500 font-mono">
                      {log.timestampTa || new Date(log.timestamp).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border">
                    <div>
                      <span className="text-stone-400 block text-[9px] uppercase">Previous Value / முந்தைய நிலை:</span>
                      <span className="font-mono text-stone-700">{log.previousValue}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[9px] uppercase">New Value / புதிய நிலை:</span>
                      <span className="font-mono font-bold text-emerald-900">{log.newValue}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center text-[10px] text-stone-500 pt-1">
                    <span>
                      <strong>Editor:</strong> {log.editorName} ({log.role}) | <strong>IP:</strong> {log.ipAddress}
                    </span>
                    {log.reason && (
                      <span className="italic text-stone-600">"{log.reason}"</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRIMARY SUPER ADMIN EDIT MODAL */}
      {isModalOpen && editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-stone-800 max-w-lg w-full overflow-hidden text-stone-900 my-auto">
            
            <div className="bg-stone-900 text-white p-5 border-b border-stone-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {lang === "ta" ? "மாவட்ட வாட்ஸ்அப் குழு அமைத்தல்" : "Configure District WhatsApp Group"}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-6 space-y-4 text-xs">
              
              {errorMessage && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-xl font-medium">
                  ⚠️ {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl font-medium">
                  ✓ {successMessage}
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "மாவட்டம் தேர்ந்தெடு அல்லது உள்ளிடு *" : "Select or Enter District *"}
                </label>
                <div className="space-y-2">
                  <select
                    value={editingGroup.district || ""}
                    onChange={(e) => handleSelectDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl bg-white text-stone-800 font-bold cursor-pointer text-sm"
                  >
                    <option value="">-- {lang === "ta" ? "38 மாவட்டங்களில் ஒன்றைத் தேர்ந்தெடுக்கவும்" : "Select from 38 TN Districts"} --</option>
                    {TN_DISTRICTS_LIST.map((d) => (
                      <option key={d.en} value={d.ta}>
                        {d.ta} ({d.en}) {groups.some(g => g.district === d.ta) ? "✓ [அமைக்கப்பட்டுள்ளது]" : ""}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={editingGroup.district || ""}
                      onChange={(e) => setEditingGroup({ ...editingGroup, district: e.target.value })}
                      placeholder="மாவட்டம் (தமிழ்) எ.கா: திருவாரூர்"
                      className="w-full px-3 py-1.5 border rounded-lg bg-stone-50 focus:bg-white text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={editingGroup.districtEn || ""}
                      onChange={(e) => setEditingGroup({ ...editingGroup, districtEn: e.target.value })}
                      placeholder="District (English) e.g. Tiruvarur"
                      className="w-full px-3 py-1.5 border rounded-lg bg-stone-50 focus:bg-white text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "அதிகாரப்பூர்வ வாட்ஸ்அப் குழு பெயர் *" : "Official WhatsApp Group Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={editingGroup.groupName || ""}
                  onChange={(e) => setEditingGroup({ ...editingGroup, groupName: e.target.value })}
                  placeholder="TNPA திருவாரூர் மாவட்ட உறுப்பினர்கள்"
                  className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "வாட்ஸ்அப் அழைப்பு இணைப்பு (Invite Link) *" : "WhatsApp Group Invite Link *"}
                </label>
                <input
                  type="url"
                  required
                  value={editingGroup.inviteLink || ""}
                  onChange={(e) => setEditingGroup({ ...editingGroup, inviteLink: e.target.value })}
                  placeholder="https://chat.whatsapp.com/G12345Example"
                  className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "ஒருங்கிணைப்பாளர் பெயர்" : "Coordinator Name"}
                  </label>
                  <input
                    type="text"
                    value={editingGroup.coordinatorName || ""}
                    onChange={(e) => setEditingGroup({ ...editingGroup, coordinatorName: e.target.value })}
                    placeholder="எம். செல்வம்"
                    className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "கைபேசி எண்" : "Coordinator Mobile"}
                  </label>
                  <input
                    type="text"
                    value={editingGroup.coordinatorPhone || ""}
                    onChange={(e) => setEditingGroup({ ...editingGroup, coordinatorPhone: e.target.value })}
                    placeholder="+91 94431 12345"
                    className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "குழு நிலை *" : "Group Status *"}
                </label>
                <select
                  value={editingGroup.status || "active"}
                  onChange={(e) => setEditingGroup({ ...editingGroup, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 border rounded-xl bg-white text-stone-800 font-bold cursor-pointer"
                >
                  <option value="active">{lang === "ta" ? "செயலில் உள்ளது (Active)" : "Active (Members can join)"}</option>
                  <option value="inactive">{lang === "ta" ? "செயலிழப்பு (Inactive)" : "Inactive (Hide link)"}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "மாற்றத்திற்கான காரணம் (தணிக்கைப் பதிவேட்டிற்கு)" : "Reason for Edit (For Audit Trail)"}
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Official invite link update by Super Admin"
                  className="w-full px-3.5 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === "ta" ? "அமைப்புகளைச் சேமி" : "Save Group Link"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  {lang === "ta" ? "ரத்து" : "Cancel"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
