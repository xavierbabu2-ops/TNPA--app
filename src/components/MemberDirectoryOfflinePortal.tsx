import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Award, 
  ShieldCheck, 
  Filter, 
  UserPlus, 
  X, 
  Download, 
  Share2, 
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  QrCode
} from "lucide-react";
import { MemberRegistration, OfflineDatabaseStats, DirectoryFilterParams } from "../types";
import { 
  getOfflineMembers, 
  saveMemberLocally, 
  syncPendingMutationsToServer, 
  fetchAndCacheServerDatabase,
  getOfflineDatabaseStats,
  registerOfflineSyncListeners,
  TN_ALL_DISTRICTS
} from "../utils/offlineMemberDatabase";

interface MemberDirectoryOfflinePortalProps {
  lang: "ta" | "en";
  currentUser?: any;
  onOpenIdCard?: (member: MemberRegistration) => void;
}

export default function MemberDirectoryOfflinePortal({
  lang,
  currentUser,
  onOpenIdCard
}: MemberDirectoryOfflinePortalProps) {
  const [members, setMembers] = useState<MemberRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBlood, setSelectedBlood] = useState("all");

  // Database Stats
  const [stats, setStats] = useState<OfflineDatabaseStats>({
    totalCachedMembers: 45620,
    totalDistricts: 38,
    lastSyncedAt: null,
    pendingMutationsCount: 0,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    storageType: "indexedDB"
  });

  // Selected Member for Modal / Detail
  const [selectedMember, setSelectedMember] = useState<MemberRegistration | null>(null);
  
  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    nameEn: "",
    fatherName: "",
    phone: "",
    district: "சென்னை",
    bloodGroup: "O+",
    experienceYears: 5,
    specialization: "Exterior & Texture Painting",
    address: "",
    gender: "ஆண் (Male)"
  });

  // Load members from local offline database
  const loadDirectoryData = async () => {
    setLoading(true);
    try {
      const filterParams: DirectoryFilterParams = {
        district: selectedDistrict,
        status: selectedStatus,
        bloodGroup: selectedBlood,
        searchQuery: searchQuery
      };
      const result = await getOfflineMembers(filterParams);
      setMembers(result.members);
    } catch (err) {
      console.error("Error loading offline member directory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and connectivity listener setup
  useEffect(() => {
    loadDirectoryData();

    // Register offline/online listeners
    const unsubscribe = registerOfflineSyncListeners((newStats) => {
      setStats(newStats);
      loadDirectoryData();
    });

    // Attempt cache refresh if online
    if (navigator.onLine) {
      fetchAndCacheServerDatabase().then((res) => {
        if (res.success) {
          getOfflineDatabaseStats().then(setStats);
          loadDirectoryData();
        }
      });
    }

    return () => unsubscribe();
  }, [selectedDistrict, selectedStatus, selectedBlood]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDirectoryData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Manual Trigger: Sync Offline Updates with Server
  const handleManualSync = async () => {
    if (!navigator.onLine) {
      setSyncFeedback(
        lang === "ta" 
          ? "⚠️ இணைய இணைப்பு இல்லை. இணைப்பு வந்ததும் தானாக ஒத்திசைக்கப்படும்." 
          : "⚠️ Internet connection offline. Will auto-sync once connected."
      );
      setTimeout(() => setSyncFeedback(null), 4000);
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(lang === "ta" ? "ஒத்திசைவு நடைபெறுகிறது..." : "Syncing with master state database...");
    
    try {
      const syncRes = await syncPendingMutationsToServer();
      const fetchRes = await fetchAndCacheServerDatabase();
      const updatedStats = await getOfflineDatabaseStats();
      setStats(updatedStats);
      await loadDirectoryData();

      if (syncRes.syncedCount > 0) {
        setSyncFeedback(
          lang === "ta" 
            ? `✅ ${syncRes.syncedCount} லோக்கல் பதிவுகள் மாநில தலைமை சேவையகத்துடன் வெற்றிகரமாக ஒத்திசைக்கப்பட்டன!` 
            : `✅ Successfully synced ${syncRes.syncedCount} local offline records to master server!`
        );
      } else {
        setSyncFeedback(
          lang === "ta" 
            ? "✅ லோக்கல் டைரக்டரி சேமிப்பகம் முழுமையாக புதுப்பிக்கப்பட்டது." 
            : "✅ Local offline database is up to date with server."
        );
      }
    } catch (err: any) {
      setSyncFeedback(lang === "ta" ? "ஒத்திசைவு தோல்வி: " + err.message : "Sync error: " + err.message);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Submit New Member (Works 100% Offline & Online)
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name.trim() || !newMemberForm.phone.trim()) {
      alert(lang === "ta" ? "பெயர் மற்றும் தொலைபேசி எண் கட்டாயம்." : "Name and phone are required.");
      return;
    }

    const newMemberRecord: MemberRegistration = {
      id: `reg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      regNumber: `TNP-2026-${Math.floor(1000 + Math.random() * 9000).toString()}`,
      name: newMemberForm.name.trim(),
      nameEn: newMemberForm.nameEn.trim() || newMemberForm.name.trim(),
      fatherName: newMemberForm.fatherName.trim() || "பெற்றோர் பெயர்",
      dob: "1990-01-01",
      gender: newMemberForm.gender,
      bloodGroup: newMemberForm.bloodGroup,
      phone: newMemberForm.phone.trim(),
      aadhaar: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      district: newMemberForm.district,
      address: newMemberForm.address.trim() || `${newMemberForm.district} மாவட்டம், தமிழ்நாடு`,
      experienceYears: Number(newMemberForm.experienceYears) || 5,
      specialization: newMemberForm.specialization,
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150",
      status: "approved",
      createdAt: new Date().toISOString()
    };

    try {
      await saveMemberLocally(newMemberRecord, true);
      setShowAddModal(false);
      setNewMemberForm({
        name: "",
        nameEn: "",
        fatherName: "",
        phone: "",
        district: "சென்னை",
        bloodGroup: "O+",
        experienceYears: 5,
        specialization: "Exterior & Texture Painting",
        address: "",
        gender: "ஆண் (Male)"
      });
      await loadDirectoryData();
      const updatedStats = await getOfflineDatabaseStats();
      setStats(updatedStats);

      setSyncFeedback(
        stats.isOnline
          ? (lang === "ta" ? "✅ உறுப்பினர் பதிவு சேமிக்கப்பட்டு சேவையகத்துடன் ஒத்திசைக்கப்பட்டது!" : "✅ Member saved and synced with server!")
          : (lang === "ta" ? "💾 ஆஃப்லைன் முறை: பதிவு லோக்கல் நினைவகத்தில் சேமிக்கப்பட்டது. இணையம் வந்ததும் தானாக ஒத்திசைக்கப்படும்." : "💾 Offline Mode: Member saved to device cache and queued for auto-sync.")
      );
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err: any) {
      alert("Error saving member: " + err.message);
    }
  };

  // Export Roster as CSV
  const handleExportCSV = () => {
    const headers = ["Reg Number", "Name", "District", "Phone", "Blood Group", "Experience (Yrs)", "Specialization", "Status"];
    const rows = members.map(m => [
      m.regNumber,
      `"${m.name}"`,
      `"${m.district}"`,
      m.phone,
      m.bloodGroup,
      m.experienceYears,
      `"${m.specialization || 'General Painting'}"`,
      m.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TNPA_Member_Directory_${selectedDistrict}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* 1. Offline & Sync Sentinel Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        stats.isOnline 
          ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200 text-emerald-950 shadow-sm" 
          : "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-300 text-amber-950 shadow-sm"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stats.isOnline ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}`}>
              {stats.isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm">
                  {stats.isOnline 
                    ? (lang === "ta" ? "நேரலை சேவையக இணைப்பு (Online - Live Synced)" : "Online Connection Active")
                    : (lang === "ta" ? "ஆஃப்லைன் முறை - லோக்கல் டைரக்டரி இயங்குகிறது (Offline Mode Active)" : "Offline Mode - Local Cached Directory Active")}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stats.isOnline ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900 animate-pulse"
                }`}>
                  {stats.storageType === "indexedDB" ? "IndexedDB PWA Cache" : "LocalStorage Cache"}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {lang === "ta" 
                  ? "PWA சர்வீஸ் ஒர்க்கர் மூலம் 38 மாவட்ட உறுப்பினர்களின் தரவுகள் உங்கள் போனில் ஆஃப்லைனிலும் பார்க்க சேமிக்கப்பட்டுள்ளது."
                  : "Member database cached locally by PWA Service Worker for uninterrupted offline read & write access across all 38 districts."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {stats.pendingMutationsCount > 0 && (
              <span className="text-xs bg-amber-600 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                {stats.pendingMutationsCount} {lang === "ta" ? "ஒத்திசைக்க காத்திருக்கிறது" : "Pending Sync"}
              </span>
            )}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {lang === "ta" ? "இப்போது ஒத்திசை" : "Sync Now"}
            </button>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {syncFeedback && (
          <div className="mt-3 text-xs font-semibold p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 text-stone-900 animate-[fadeIn_0.3s_ease]">
            {syncFeedback}
          </div>
        )}
      </div>

      {/* 2. Database Stats Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-stone-200 p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase">
            <Database className="w-4 h-4 text-[#b91c1c]" />
            {lang === "ta" ? "சேமிக்கப்பட்ட உறுப்பினர்கள்" : "Cached Members"}
          </div>
          <div className="text-xl font-extrabold text-stone-900 mt-1">
            {stats.totalCachedMembers.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
            {lang === "ta" ? "முழு மாநில பட்டியல்" : "All 38 Districts"}
          </span>
        </div>

        <div className="bg-white border border-stone-200 p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase">
            <MapPin className="w-4 h-4 text-indigo-600" />
            {lang === "ta" ? "மாவட்டங்கள்" : "Districts Covered"}
          </div>
          <div className="text-xl font-extrabold text-stone-900 mt-1">
            38
          </div>
          <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">
            {lang === "ta" ? "தமிழ்நாடு முழுவதும்" : "Across Tamil Nadu"}
          </span>
        </div>

        <div className="bg-white border border-stone-200 p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {lang === "ta" ? "ஆஃப்லைன் நிலவரம்" : "Offline Readiness"}
          </div>
          <div className="text-xl font-extrabold text-emerald-800 mt-1">
            100%
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
            {lang === "ta" ? "இணையமின்றி இயங்கும்" : "Full Offline Read/Write"}
          </span>
        </div>

        <div className="bg-white border border-stone-200 p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase">
            <Clock className="w-4 h-4 text-amber-600" />
            {lang === "ta" ? "கடைசி ஒத்திசைவு" : "Last Synced"}
          </div>
          <div className="text-sm font-extrabold text-stone-900 mt-1.5 truncate">
            {stats.lastSyncedAt 
              ? new Date(stats.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : (lang === "ta" ? "இப்போது தயார்" : "Ready now")}
          </div>
          <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">
            {lang === "ta" ? "ஆட்டோ-சின்க் தயார்" : "Auto-Sync Active"}
          </span>
        </div>
      </div>

      {/* 3. Search, Filter & Action Toolbar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ta" ? "உறுப்பினர் பெயர், பதிவு எண் (TNP-2026-XXXX), தொலைபேசி, மாவட்டம் தேடுக..." : "Search by member name, Reg No, mobile, skill, or district..."}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 focus:border-[#b91c1c]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-none bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              {lang === "ta" ? "+ புதிய உறுப்பினர் சேர்" : "+ Add Member (Offline Ready)"}
            </button>
            <button
              onClick={handleExportCSV}
              title="Export CSV"
              className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-200 transition-all text-xs font-bold flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === "ta" ? "ஏற்றுமதி" : "Export"}</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-xs">
          {/* District Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
            <span className="text-stone-500 font-bold px-1.5 whitespace-nowrap">{lang === "ta" ? "மாவட்டம்:" : "District:"}</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-transparent font-semibold text-stone-900 focus:outline-none"
            >
              <option value="all">{lang === "ta" ? "அனைத்து 38 மாவட்டங்கள் (All)" : "All 38 Districts"}</option>
              {TN_ALL_DISTRICTS.map((d, i) => {
                const pureName = d.split(" (")[0];
                return <option key={i} value={pureName}>{d}</option>;
              })}
            </select>
          </div>

          {/* Blood Group Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
            <span className="text-stone-500 font-bold px-1.5 whitespace-nowrap">{lang === "ta" ? "இரத்த வகை:" : "Blood Group:"}</span>
            <select
              value={selectedBlood}
              onChange={(e) => setSelectedBlood(e.target.value)}
              className="w-full bg-transparent font-semibold text-stone-900 focus:outline-none"
            >
              <option value="all">{lang === "ta" ? "அனைத்தும் (All)" : "All Blood Groups"}</option>
              <option value="O+">O+ Positive</option>
              <option value="A+">A+ Positive</option>
              <option value="B+">B+ Positive</option>
              <option value="AB+">AB+ Positive</option>
              <option value="O-">O- Negative</option>
              <option value="A-">A- Negative</option>
              <option value="B-">B- Negative</option>
              <option value="AB-">AB- Negative</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
            <span className="text-stone-500 font-bold px-1.5 whitespace-nowrap">{lang === "ta" ? "நிலை:" : "Status:"}</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent font-semibold text-stone-900 focus:outline-none"
            >
              <option value="all">{lang === "ta" ? "அனைத்து நிலைகள் (All)" : "All Status"}</option>
              <option value="approved">{lang === "ta" ? "அங்கீகரிக்கப்பட்டது (Approved)" : "Approved"}</option>
              <option value="pending">{lang === "ta" ? "நிலுவையில் (Pending)" : "Pending"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Member Cards Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-stone-500 uppercase">
            {lang === "ta" ? `காட்டப்படும் உறுப்பினர்கள்: ${members.length}` : `Displaying Members: ${members.length}`}
          </span>
          <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {lang === "ta" ? "அங்கீகரிக்கப்பட்ட மாநில தரவு" : "Verified State Registry"}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl space-y-3">
            <RefreshCw className="w-8 h-8 text-[#b91c1c] animate-spin mx-auto" />
            <p className="text-sm font-bold text-stone-700">
              {lang === "ta" ? "லோக்கல் நினைவகத்திலிருந்து உறுப்பினர்கள் பட்டியல் எடுக்கப்படுகிறது..." : "Loading local member directory cache..."}
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-stone-800">
              {lang === "ta" ? "தேடப்பட்ட அளவுகோலுக்கு ஏற்ப உறுப்பினர்கள் எவரும் கிடைக்கவில்லை." : "No members found matching your search criteria."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDistrict("all");
                setSelectedBlood("all");
                setSelectedStatus("all");
              }}
              className="text-xs text-[#b91c1c] font-bold hover:underline"
            >
              {lang === "ta" ? "வடிகட்டிகளை மீட்டமைக்க (Reset Filters)" : "Reset Filters"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 bg-white border border-stone-200 hover:border-stone-400 rounded-2xl shadow-sm transition-all text-left flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start gap-3 border-b border-stone-100 pb-3">
                    <img
                      src={member.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150"}
                      alt={member.name}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200 shadow-sm shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-black font-mono text-[#b91c1c] bg-red-50 px-2 py-0.5 rounded">
                          {member.regNumber}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          {member.status === "approved" ? (lang === "ta" ? "அங்கீகரிக்கப்பட்டது" : "Approved") : member.status}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-stone-900 text-sm mt-1 truncate">
                        {member.name}
                      </h4>
                      {member.nameEn && member.nameEn !== member.name && (
                        <p className="text-[11px] text-stone-500 truncate">{member.nameEn}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs text-stone-600">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-500" />
                        {lang === "ta" ? "மாவட்டம்:" : "District:"}
                      </span>
                      <span className="font-bold text-stone-900">{member.district}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 font-medium">
                        {lang === "ta" ? "இரத்த வகை / அனுபவம்:" : "Blood / Experience:"}
                      </span>
                      <span className="font-bold text-stone-900">
                        {member.bloodGroup || "O+"} • {member.experienceYears || 5} {lang === "ta" ? "ஆண்டுகள்" : "Yrs"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 font-medium">
                        {lang === "ta" ? "தொழில் திறன்:" : "Specialization:"}
                      </span>
                      <span className="font-semibold text-stone-800 truncate max-w-[150px]">
                        {member.specialization || "General Painting"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <a
                    href={`tel:${member.phone}`}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-2 rounded-xl text-center flex items-center justify-center gap-1 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#b91c1c]" />
                    {member.phone}
                  </a>
                  <button
                    onClick={() => {
                      if (onOpenIdCard) {
                        onOpenIdCard(member);
                      } else {
                        setSelectedMember(member);
                      }
                    }}
                    className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {lang === "ta" ? "அட்டை" : "ID Card"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Quick Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-black text-[#b91c1c] uppercase">
                  {lang === "ta" ? "உடனடி உறுப்பினர் பதிவு" : "OFFLINE REGISTRATION PORTAL"}
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  {lang === "ta" ? "புதிய உறுப்பினர் சேர்க்கை" : "Add Member to Local Directory"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  {lang === "ta" ? "உறுப்பினர் பெயர் (தமிழ்): *" : "Member Name (Tamil): *"}
                </label>
                <input
                  type="text"
                  required
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="எ.கா: சு. முத்துக்குமார்"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "பெயர் (ஆங்கிலம்):" : "Name (English):"}
                  </label>
                  <input
                    type="text"
                    value={newMemberForm.nameEn}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, nameEn: e.target.value })}
                    placeholder="e.g. S. Muthukumar"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "தொலைபேசி எண்: *" : "Mobile Phone: *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    placeholder="9843212345"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "மாவட்டம்: *" : "District: *"}
                  </label>
                  <select
                    value={newMemberForm.district}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, district: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none"
                  >
                    {TN_ALL_DISTRICTS.map((d, i) => {
                      const pureName = d.split(" (")[0];
                      return <option key={i} value={pureName}>{d}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "இரத்த வகை:" : "Blood Group:"}
                  </label>
                  <select
                    value={newMemberForm.bloodGroup}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, bloodGroup: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none"
                  >
                    <option value="O+">O+ Positive</option>
                    <option value="A+">A+ Positive</option>
                    <option value="B+">B+ Positive</option>
                    <option value="AB+">AB+ Positive</option>
                    <option value="O-">O- Negative</option>
                    <option value="A-">A- Negative</option>
                    <option value="B-">B- Negative</option>
                    <option value="AB-">AB- Negative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "அனுபவம் (ஆண்டுகள்):" : "Experience (Years):"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newMemberForm.experienceYears}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, experienceYears: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "தொழில் சிறப்பு:" : "Specialization:"}
                  </label>
                  <select
                    value={newMemberForm.specialization}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, specialization: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none"
                  >
                    <option value="Exterior & Texture Painting">Exterior & Texture Painting</option>
                    <option value="Interior Luxury Painting & PU">Interior Luxury Painting & PU</option>
                    <option value="Commercial Spray Coating">Commercial Spray Coating</option>
                    <option value="Waterproofing & Epoxy Coatings">Waterproofing & Epoxy Coatings</option>
                    <option value="Traditional Murals & Gold Leafing">Traditional Murals & Gold Leafing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  {lang === "ta" ? "முகவரி:" : "Address:"}
                </label>
                <textarea
                  rows={2}
                  value={newMemberForm.address}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, address: e.target.value })}
                  placeholder="எண் 12, காமராஜர் தெரு..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-100"
                >
                  {lang === "ta" ? "ரத்துசெய்" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {lang === "ta" ? "உறுப்பினரை சேமிக்க" : "Save Member to Directory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Member Detail Quick View Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#b91c1c] shadow-sm"
                />
                <div>
                  <span className="text-[11px] font-black font-mono text-[#b91c1c] bg-red-50 px-2 py-0.5 rounded">
                    {selectedMember.regNumber}
                  </span>
                  <h3 className="text-base font-extrabold text-stone-900 mt-1">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs text-stone-500">{selectedMember.nameEn}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500 font-bold">{lang === "ta" ? "மாவட்டம்:" : "District:"}</span>
                <span className="font-extrabold text-stone-900">{selectedMember.district}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500 font-bold">{lang === "ta" ? "தொலைபேசி:" : "Phone:"}</span>
                <a href={`tel:${selectedMember.phone}`} className="font-extrabold text-[#b91c1c] hover:underline">{selectedMember.phone}</a>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500 font-bold">{lang === "ta" ? "இரத்த வகை:" : "Blood Group:"}</span>
                <span className="font-extrabold text-stone-900">{selectedMember.bloodGroup}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500 font-bold">{lang === "ta" ? "தொழில் சிறப்பு:" : "Specialization:"}</span>
                <span className="font-extrabold text-stone-900">{selectedMember.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-bold">{lang === "ta" ? "முகவரி:" : "Address:"}</span>
                <span className="font-medium text-stone-900 text-right max-w-[200px]">{selectedMember.address}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm"
            >
              {lang === "ta" ? "மூடுக" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
