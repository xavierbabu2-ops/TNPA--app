import React, { useState, useMemo } from "react";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Layers, 
  Phone, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Camera, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Share2, 
  FileText, 
  X, 
  Check, 
  Filter, 
  UserCheck, 
  Users,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Lock,
  AlertCircle,
  Scale,
  ShieldAlert,
  Gavel,
  Printer,
  Upload,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { ExecutiveMember, ExecutiveLevel, UserAccount } from "../types";
import { getExecutivePhoto, DEFAULT_EXECUTIVE_PORTRAITS } from "../utils/executivePhotos";

interface ExecutiveDirectoryPortalProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  isSuperAdmin: boolean;
  isStatePresident?: boolean;
  executives: ExecutiveMember[];
  onSaveExecutive: (executive: ExecutiveMember) => void;
  onDeleteExecutive: (id: string) => void;
  onAddAuditLog: (action: string, details: string) => void;
  initialActiveLevel?: ExecutiveLevel;
  onClose?: () => void;
  onSimulateRole?: (role: "super_admin" | "state_president" | "visitor") => void;
}

const TN_DISTRICTS_LIST = [
  "சென்னை", "கோயம்புத்தூர்", "மதுரை", "திருச்சிராப்பள்ளி", "சேலம்", 
  "திருநெல்வேலி", "ஈரோடு", "திருப்பூர்", "வேலூர்", "திண்டுக்கல்", 
  "தஞ்சாவூர்", "காஞ்சிபுரம்", "திருவள்ளூர்", "செங்கல்பட்டு", "கடலூர்", 
  "விழுப்புரம்", "கள்ளக்குறிச்சி", "திருவண்ணாமலை", "ராணிப்பேட்டை", "திருப்பத்தூர்", 
  "தர்மபுரி", "கிருஷ்ணகிரி", "நாமக்கல்", "கரூர்", "பெரம்பலூர்", 
  "அரியலூர்", "மயிலாடுதுறை", "நாகப்பட்டினம்", "திருவாரூர்", "புதுக்கோட்டை", 
  "சிவகங்கை", "ராமநாதபுரம்", "விருதுநகர்", "தேனி", "தென்காசி", 
  "தூத்துக்குடி", "கன்னியாகுமரி", "நீலகிரி"
];

const ZONES_LIST = [
  { id: "north", ta: "வடக்கு மண்டலம் (North Zone)", en: "North Zone" },
  { id: "west", ta: "மேற்கு மண்டலம் (West Zone)", en: "West Zone" },
  { id: "central_east", ta: "மத்திய & கிழக்கு மண்டலம் (Central & East Zone)", en: "Central & East Zone" },
  { id: "south", ta: "தெற்கு மண்டலம் (South Zone)", en: "South Zone" }
];

export default function ExecutiveDirectoryPortal({
  lang,
  currentUser,
  isSuperAdmin,
  isStatePresident,
  executives,
  onSaveExecutive,
  onDeleteExecutive,
  onAddAuditLog,
  initialActiveLevel = "state",
  onClose,
  onSimulateRole
}: ExecutiveDirectoryPortalProps) {
  const [activeLevel, setActiveLevel] = useState<ExecutiveLevel>(initialActiveLevel);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("all");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("all");

  // Modal State for Appoint / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState<ExecutiveMember | null>(null);

  // Delete Confirm Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formLevel, setFormLevel] = useState<ExecutiveLevel>("state");
  const [formRole, setFormRole] = useState("");
  const [formRoleEn, setFormRoleEn] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const [formDistrict, setFormDistrict] = useState("சென்னை");
  const [formZone, setFormZone] = useState("வடக்கு மண்டலம் (North Zone)");
  const [formUnitType, setFormUnitType] = useState<"union" | "town" | "area" | "wing" | "other">("union");
  const [formUnitName, setFormUnitName] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive" | "transferred">("active");
  const [formNotes, setFormNotes] = useState("");
  const [formLegalOathAccepted, setFormLegalOathAccepted] = useState(true);
  const [viewingOathExecutive, setViewingOathExecutive] = useState<ExecutiveMember | null>(null);

  // Dedicated Executive Direct Photo Studio Modal State
  const [photoModalExecutive, setPhotoModalExecutive] = useState<ExecutiveMember | null>(null);
  const [photoModalUrl, setPhotoModalUrl] = useState<string>("");
  const [photoUploadSuccessToast, setPhotoUploadSuccessToast] = useState<string | null>(null);

  // RBAC Evaluation:
  // 1. Super Admin: full authority across all levels (State, District, Zone, Area/Union).
  // 2. State President:
  //    - Can edit other State Executives (excluding Super Admin).
  //    - Has full rights to appoint, edit, and reassign all District, Zonal, and Area/Union executives.
  const isEffectiveStatePresident = Boolean(
    isStatePresident ||
    currentUser?.role === "state_president" ||
    currentUser?.id === "usr_president" ||
    (currentUser?.name && currentUser.name.includes("மைக்கேல் ஆல்வின்"))
  );

  // Helper to identify Super Admin's executive record
  const isSuperAdminExecutive = (exec: ExecutiveMember) => {
    return (
      exec.id === "exec_st_2" ||
      exec.name.includes("சேவியர் பாபு") ||
      (exec.nameEn && exec.nameEn.toLowerCase().includes("xavier babu")) ||
      exec.role.includes("சூப்பர் அட்மின்") ||
      (exec.roleEn && exec.roleEn.toLowerCase().includes("super admin"))
    );
  };

  // Can the current user edit this specific executive?
  const canEditExecutive = (exec: ExecutiveMember): boolean => {
    if (isSuperAdmin) return true;
    if (isEffectiveStatePresident) {
      if (exec.level === "state") {
        // State President can edit other state executives, but CANNOT edit Super Admin
        return !isSuperAdminExecutive(exec);
      }
      // Full editing rights for district, zone, union_area
      return true;
    }
    return false;
  };

  // Can the current user delete/remove this specific executive?
  const canDeleteExecutive = (exec: ExecutiveMember): boolean => {
    if (isSuperAdmin) return true;
    if (isEffectiveStatePresident) {
      // State tier: State President has edit rights ONLY ("திருத்துவது மட்டும்"), no deletion rights
      if (exec.level === "state") return false;
      // District, zone, union_area: Full rights to delete/remove ("மாற்றுவது போன்ற உரிமைகள்")
      return true;
    }
    return false;
  };

  // Can the current user appoint new executives in this tier?
  const canAppointAtTier = (level: ExecutiveLevel): boolean => {
    if (isSuperAdmin) return true;
    if (isEffectiveStatePresident) {
      // State tier appointments are restricted to Super Admin
      if (level === "state") return false;
      // District, zone, union_area: State President can appoint
      return true;
    }
    return false;
  };

  // Can appoint in general (for top banner "+ புதிய நிர்வாகி நியமனம்" button)
  const canAppointGeneral = isSuperAdmin || isEffectiveStatePresident;

  // Counts
  const counts = useMemo(() => {
    return {
      state: executives.filter(e => e.level === "state").length,
      district: executives.filter(e => e.level === "district").length,
      zone: executives.filter(e => e.level === "zone").length,
      union_area: executives.filter(e => e.level === "union_area").length
    };
  }, [executives]);

  // Filtered List
  const filteredExecutives = useMemo(() => {
    return executives.filter(exec => {
      // 1. Level match
      if (exec.level !== activeLevel) return false;

      // 2. District filter
      if (selectedDistrictFilter !== "all" && exec.district !== selectedDistrictFilter) {
        return false;
      }

      // 3. Zone filter
      if (selectedZoneFilter !== "all" && exec.zone && !exec.zone.includes(selectedZoneFilter)) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = exec.name.toLowerCase().includes(q) || (exec.nameEn && exec.nameEn.toLowerCase().includes(q));
        const matchRole = exec.role.toLowerCase().includes(q) || (exec.roleEn && exec.roleEn.toLowerCase().includes(q));
        const matchPhone = exec.phone.toLowerCase().includes(q);
        const matchDistrict = exec.district ? exec.district.toLowerCase().includes(q) : false;
        const matchZone = exec.zone ? exec.zone.toLowerCase().includes(q) : false;
        const matchUnit = exec.unitName ? exec.unitName.toLowerCase().includes(q) : false;
        return matchName || matchRole || matchPhone || matchDistrict || matchZone || matchUnit;
      }

      return true;
    }).sort((a, b) => (a.order || 99) - (b.order || 99));
  }, [executives, activeLevel, selectedDistrictFilter, selectedZoneFilter, searchQuery]);

  // Open Appoint Modal
  const handleOpenAppointModal = (defaultLevel?: ExecutiveLevel) => {
    let targetLevel = defaultLevel || activeLevel;
    // If state president tries to appoint at state level, redirect default to district tier
    if (isEffectiveStatePresident && !isSuperAdmin && targetLevel === "state") {
      targetLevel = "district";
    }
    setEditingExecutive(null);
    setFormLevel(targetLevel);
    setFormName("");
    setFormNameEn("");
    setFormPhone("");
    setFormPhotoUrl(DEFAULT_EXECUTIVE_PORTRAITS[Math.floor(Math.random() * DEFAULT_EXECUTIVE_PORTRAITS.length)]);
    setFormDistrict("சென்னை");
    setFormZone("வடக்கு மண்டலம் (North Zone)");
    setFormUnitType("union");
    setFormUnitName("");
    setFormStatus("active");
    setFormNotes("");
    setFormLegalOathAccepted(true);

    // Set smart default roles based on level
    if (targetLevel === "state") {
      setFormRole("மாநில நிர்வாகி");
      setFormRoleEn("State Executive");
    } else if (targetLevel === "district") {
      setFormRole("மாவட்ட தலைவர்");
      setFormRoleEn("District President");
    } else if (targetLevel === "zone") {
      setFormRole("மண்டல செயலாளர்");
      setFormRoleEn("Zonal Secretary");
    } else {
      setFormRole("ஒன்றிய தலைவர்");
      setFormRoleEn("Union President");
    }

    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (exec: ExecutiveMember) => {
    setEditingExecutive(exec);
    setFormLevel(exec.level);
    setFormName(exec.name);
    setFormNameEn(exec.nameEn || "");
    setFormRole(exec.role);
    setFormRoleEn(exec.roleEn || "");
    setFormPhone(exec.phone);
    setFormPhotoUrl(getExecutivePhoto(exec));
    setFormDistrict(exec.district || "சென்னை");
    setFormZone(exec.zone || "வடக்கு மண்டலம் (North Zone)");
    setFormUnitType(exec.unitType || "union");
    setFormUnitName(exec.unitName || "");
    setFormStatus(exec.status || "active");
    setFormNotes(exec.notes || "");
    setFormLegalOathAccepted(exec.legalOathAccepted !== false);
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert(lang === "ta" ? "நிர்வாகியின் பெயரை உள்ளிடவும்" : "Please enter executive name");
      return;
    }
    if (!formRole.trim()) {
      alert(lang === "ta" ? "நிர்வாகப் பதவியை உள்ளிடவும்" : "Please enter role/position");
      return;
    }
    if (!formPhone.trim()) {
      alert(lang === "ta" ? "தொடர்பு தொலைபேசி எண்ணை உள்ளிடவும்" : "Please enter phone number");
      return;
    }

    if (!formLegalOathAccepted) {
      alert(
        lang === "ta"
          ? "மாநிலத் தலைவர் மற்றும் மாநில பொதுச்செயலாளர் அவர்களின் ஒழுங்கு நெறிமுறை & விசுவாச உறுதிமொழியை ஏற்றுக்கொண்டு ஒப்புதல் அளிக்க வேண்டும்!"
          : "Union code of conduct and leadership directives undertaking must be certified to appoint/save executive!"
      );
      return;
    }

    // RBAC validation:
    if (isEffectiveStatePresident && !isSuperAdmin) {
      if (editingExecutive) {
        if (editingExecutive.level === "state" && isSuperAdminExecutive(editingExecutive)) {
          alert(lang === "ta" ? "சூப்பர் அட்மின் விவரங்களை மாநில தலைவர் திருத்த முடியாது." : "State President cannot edit Super Admin details.");
          return;
        }
      } else {
        if (formLevel === "state") {
          alert(lang === "ta" ? "மாநில நிர்வாகிகள் நியமனம் சூப்பர் அட்மின் ஒப்புதலுடன் மட்டுமே செய்ய முடியும்." : "State executive appointments are restricted to Super Admin.");
          return;
        }
      }
    }

    const roleActorTitle = isSuperAdmin 
      ? "Super Admin" 
      : (currentUser?.name ? `${currentUser.name} (மாநில தலைவர்)` : "மாநில தலைவர் (State President)");

    const newOrUpdated: ExecutiveMember = {
      id: editingExecutive ? editingExecutive.id : `exec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      level: formLevel,
      name: formName.trim(),
      nameEn: formNameEn.trim() || undefined,
      role: formRole.trim(),
      roleEn: formRoleEn.trim() || undefined,
      phone: formPhone.trim(),
      photoUrl: formPhotoUrl.trim() || undefined,
      district: (formLevel === "district" || formLevel === "union_area") ? formDistrict : (formLevel === "state" ? "தமிழ்நாடு" : undefined),
      districtEn: formLevel === "district" || formLevel === "union_area" ? formDistrict : (formLevel === "state" ? "Tamil Nadu" : undefined),
      zone: (formLevel === "zone" || formLevel === "district") ? formZone : undefined,
      unitType: formLevel === "union_area" ? formUnitType : undefined,
      unitName: formLevel === "union_area" ? formUnitName.trim() : undefined,
      status: formStatus,
      notes: formNotes.trim() || undefined,
      appointedDate: editingExecutive?.appointedDate || new Date().toISOString().split("T")[0],
      appointedBy: editingExecutive ? editingExecutive.appointedBy : roleActorTitle,
      order: editingExecutive?.order || (formLevel === "state" ? 10 : 20),
      legalOathAccepted: true,
      legalOathAcceptedAt: editingExecutive?.legalOathAcceptedAt || new Date().toISOString(),
      legalOathRef: editingExecutive?.legalOathRef || "TNPA/LEGAL-NOT/2026/044"
    };

    onSaveExecutive(newOrUpdated);
    const actorLabel = isSuperAdmin ? "சூப்பர் அட்மின்" : "மாநில தலைவர்";
    onAddAuditLog(
      editingExecutive ? `${actorLabel} நிர்வாகப் பொறுப்பாளர் திருத்தம்` : `${actorLabel} புதிய நிர்வாகி நியமனம்`,
      `${actorLabel} ${editingExecutive ? "திருத்தியுள்ளார்" : "நியமித்துள்ளார்"}: ${newOrUpdated.name} - ${newOrUpdated.role} (${newOrUpdated.level})`
    );

    setIsModalOpen(false);
  };

  // Handle Photo File Upload for Edit/Appoint Modal
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        alert(lang === "ta" ? "கோப்பின் அளவு 3MB-ஐ விட அதிகமாக இருக்கக்கூடாது (Max 3MB)" : "File size must be under 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Dedicated Executive Photo Studio Modal
  const handleOpenPhotoModal = (exec: ExecutiveMember) => {
    setPhotoModalExecutive(exec);
    setPhotoModalUrl(getExecutivePhoto(exec));
  };

  // Handle Photo File Upload in Dedicated Photo Modal
  const handlePhotoModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        alert(lang === "ta" ? "கோப்பின் அளவு 3MB-ஐ விட அதிகமாக இருக்கக்கூடாது (Max 3MB)" : "File size must be under 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoModalUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save New Photo from Dedicated Photo Modal
  const handleSavePhotoModal = () => {
    if (!photoModalExecutive) return;
    if (!photoModalUrl.trim()) {
      alert(lang === "ta" ? "செல்லுபடியாகும் புகைப்படத்தைத் தேர்ந்தெடுக்கவும் அல்லது பதிவேற்றவும்." : "Please select or upload a valid photograph.");
      return;
    }
    const updated: ExecutiveMember = {
      ...photoModalExecutive,
      photoUrl: photoModalUrl.trim()
    };
    onSaveExecutive(updated);

    // Sync with localStorage
    try {
      const stored = localStorage.getItem("tnpa_executives_v1");
      if (stored) {
        const list = JSON.parse(stored);
        const idx = list.findIndex((e: any) => e.id === updated.id);
        if (idx >= 0) {
          list[idx] = updated;
        } else {
          list.push(updated);
        }
        localStorage.setItem("tnpa_executives_v1", JSON.stringify(list));
      }
    } catch (e) {}

    onAddAuditLog(
      lang === "ta" ? "நிர்வாகி புகைப்படம் மாற்றம்" : "Executive Photo Updated",
      lang === "ta"
        ? `${updated.name} (${updated.role}) அவர்களின் நேரடி புகைப்படம் வெற்றிகரமாக மாற்றப்பட்டது.`
        : `Direct portrait photo updated for ${updated.nameEn || updated.name} (${updated.roleEn || updated.role}).`
    );

    setPhotoUploadSuccessToast(
      lang === "ta"
        ? `${updated.name} அவர்களின் நேரடி புகைப்படம் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது!`
        : `Photo updated successfully for ${updated.nameEn || updated.name}!`
    );
    setTimeout(() => setPhotoUploadSuccessToast(null), 4000);
    setPhotoModalExecutive(null);
  };

  // Execute Deletion
  const handleExecuteDelete = () => {
    if (!deleteConfirmId) return;
    const target = executives.find(e => e.id === deleteConfirmId);
    if (target && isEffectiveStatePresident && !isSuperAdmin && target.level === "state") {
      alert(lang === "ta" ? "மாநில நிர்வாகிகளை மாநில தலைவரால் நீக்க முடியாது; திருத்த மட்டுமே முடியும்." : "State executives cannot be deleted by State President.");
      setDeleteConfirmId(null);
      return;
    }
    onDeleteExecutive(deleteConfirmId);
    if (target) {
      const actorLabel = isSuperAdmin ? "சூப்பர் அட்மின்" : "மாநில தலைவர்";
      onAddAuditLog(
        `${actorLabel} நிர்வாகி நீக்கம்`, 
        `${actorLabel} நீக்கியுள்ளார்: ${target.name} (${target.role} - ${target.level})`
      );
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header & Overview Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border border-stone-700/60 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-8 w-64 h-64 bg-[#b91c1c]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-[#b91c1c] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? "அதிகாரப்பூர்வ நிர்வாகக் கட்டமைப்பு" : "Official Executive Hierarchy"}</span>
              </span>
              {isSuperAdmin && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-xs">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>{lang === "ta" ? "சூப்பர் அட்மின் முழு கட்டுப்பாடு" : "Super Admin Control"}</span>
                </span>
              )}
              {isEffectiveStatePresident && !isSuperAdmin && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-xs">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>{lang === "ta" ? "மாநில தலைவர் நிர்வாக அதிகாரம்" : "State President Authority"}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              {lang === "ta" ? "சங்க நிர்வாகிகள் பட்டியல்" : "Official Association Executives Directory"}
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm mt-1 leading-relaxed">
              {lang === "ta" 
                ? "மாநிலம், மாவட்டம், மண்டலம் மற்றும் பகுதி ஒன்றிய அளவிலான அதிகாரப்பூர்வ நிர்வாகப் பொறுப்பாளர்கள் பட்டியல்."
                : "Comprehensive directories across State, District, Zonal, and Area/Union tiers."}
            </p>

            {/* State President Authority Scope Explanatory Notice */}
            {isEffectiveStatePresident && !isSuperAdmin && (
              <div className="mt-3 p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs flex items-start gap-2.5 shadow-sm">
                <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-300 font-bold mb-0.5">
                    {lang === "ta" ? "மாநில தலைவர் அதிகார வரம்பு (President Authority):" : "State President Authority Scope:"}
                  </strong>
                  <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                    {lang === "ta" 
                      ? "மாவட்ட, மண்டலம், பகுதி ஒன்றிய நிர்வாகிகளை நியமிக்கவும், திருத்தவும், மாற்றவும் முழு அதிகாரம் உண்டு. மாநில நிர்வாகிகள் பட்டியலில் சூப்பர் அட்மினைத் தவிர மற்ற மாநில நிர்வாகிகளைத் திருத்தும் அதிகாரம் வழங்கப்பட்டுள்ளது."
                      : "Full rights to appoint, edit, and reassign District, Zonal, and Area/Union executives. State executives can be edited (excluding Super Admin)."}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Testing Switcher */}
            {onSimulateRole && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-stone-700/60 text-xs">
                <span className="text-stone-400 text-[11px] font-bold">
                  {lang === "ta" ? "அதிகார சோதனை (Role Mode):" : "Role Mode:"}
                </span>
                <button
                  type="button"
                  onClick={() => onSimulateRole("super_admin")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isSuperAdmin 
                      ? "bg-amber-400 text-stone-900 ring-2 ring-amber-300 shadow-sm" 
                      : "bg-white/10 hover:bg-white/20 text-stone-200"
                  }`}
                >
                  👑 {lang === "ta" ? "சூப்பர் அட்மின்" : "Super Admin"}
                </button>
                <button
                  type="button"
                  onClick={() => onSimulateRole("state_president")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isEffectiveStatePresident && !isSuperAdmin
                      ? "bg-emerald-400 text-stone-900 ring-2 ring-emerald-300 shadow-sm" 
                      : "bg-white/10 hover:bg-white/20 text-stone-200"
                  }`}
                >
                  🎖️ {lang === "ta" ? "மாநில தலைவர்" : "State President"}
                </button>
                <button
                  type="button"
                  onClick={() => onSimulateRole("visitor")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    !isSuperAdmin && !isEffectiveStatePresident
                      ? "bg-stone-300 text-stone-900 ring-2 ring-white shadow-sm" 
                      : "bg-white/10 hover:bg-white/20 text-stone-200"
                  }`}
                >
                  👥 {lang === "ta" ? "பார்வையாளர்" : "Visitor"}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
            {canAppointGeneral && (
              <button
                onClick={() => handleOpenAppointModal()}
                className="px-4 py-2.5 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === "ta" ? "+ புதிய நிர்வாகி நியமனம்" : "+ Appoint Executive"}</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Dedicated Tier Tabs Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-1.5 bg-stone-200/80 rounded-2xl border border-stone-300 shadow-inner">
        {/* 1. மாநில நிர்வாகிகள் */}
        <button
          onClick={() => {
            setActiveLevel("state");
            setSelectedDistrictFilter("all");
            setSelectedZoneFilter("all");
          }}
          className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
            activeLevel === "state"
              ? "bg-[#b91c1c] text-white shadow-md ring-2 ring-rose-200"
              : "text-stone-700 hover:text-stone-950 hover:bg-white/60 bg-white/30"
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <div className="text-center sm:text-left">
            <span className="block leading-tight">{lang === "ta" ? "மாநில நிர்வாகிகள்" : "State Executives"}</span>
            <span className={`text-[10px] font-bold ${activeLevel === "state" ? "text-rose-100" : "text-stone-500"}`}>
              {counts.state} {lang === "ta" ? "நிர்வாகிகள்" : "Leaders"}
            </span>
          </div>
        </button>

        {/* 2. மாவட்ட நிர்வாகிகள் */}
        <button
          onClick={() => {
            setActiveLevel("district");
            setSelectedZoneFilter("all");
          }}
          className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
            activeLevel === "district"
              ? "bg-[#b91c1c] text-white shadow-md ring-2 ring-rose-200"
              : "text-stone-700 hover:text-stone-950 hover:bg-white/60 bg-white/30"
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <div className="text-center sm:text-left">
            <span className="block leading-tight">{lang === "ta" ? "மாவட்ட நிர்வாகிகள்" : "District Executives"}</span>
            <span className={`text-[10px] font-bold ${activeLevel === "district" ? "text-rose-100" : "text-stone-500"}`}>
              {counts.district} {lang === "ta" ? "மாவட்டங்கள்" : "Districts"}
            </span>
          </div>
        </button>

        {/* 3. மண்டல நிர்வாகிகள் */}
        <button
          onClick={() => {
            setActiveLevel("zone");
            setSelectedDistrictFilter("all");
          }}
          className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
            activeLevel === "zone"
              ? "bg-[#b91c1c] text-white shadow-md ring-2 ring-rose-200"
              : "text-stone-700 hover:text-stone-950 hover:bg-white/60 bg-white/30"
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <div className="text-center sm:text-left">
            <span className="block leading-tight">{lang === "ta" ? "மண்டல நிர்வாகிகள்" : "Zonal Executives"}</span>
            <span className={`text-[10px] font-bold ${activeLevel === "zone" ? "text-rose-100" : "text-stone-500"}`}>
              {counts.zone} {lang === "ta" ? "மண்டலங்கள்" : "Zones"}
            </span>
          </div>
        </button>

        {/* 4. பகுதி / ஒன்றிய நிர்வாகிகள் */}
        <button
          onClick={() => {
            setActiveLevel("union_area");
          }}
          className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
            activeLevel === "union_area"
              ? "bg-[#b91c1c] text-white shadow-md ring-2 ring-rose-200"
              : "text-stone-700 hover:text-stone-950 hover:bg-white/60 bg-white/30"
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <div className="text-center sm:text-left">
            <span className="block leading-tight">{lang === "ta" ? "பகுதி ஒன்றிய நிர்வாகிகள்" : "Area & Union List"}</span>
            <span className={`text-[10px] font-bold ${activeLevel === "union_area" ? "text-rose-100" : "text-stone-500"}`}>
              {counts.union_area} {lang === "ta" ? "கிளைகள்" : "Units"}
            </span>
          </div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeLevel === "state"
                ? (lang === "ta" ? "பெயர், பதவி, தொலைபேசி எண் தேடுக..." : "Search state leaders...")
                : activeLevel === "district"
                  ? (lang === "ta" ? "மாவட்டம், பெயர், பதவி தேடுக..." : "Search district executives...")
                  : activeLevel === "zone"
                    ? (lang === "ta" ? "மண்டலம், பொறுப்பாளர் தேடுக..." : "Search zonal coordinators...")
                    : (lang === "ta" ? "ஒன்றியம், நகரம், பகுதி, பெயர் தேடுக..." : "Search union, town, area leaders...")
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* District Dropdown (for district or union_area) */}
          {(activeLevel === "district" || activeLevel === "union_area") && (
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
            >
              <option value="all">{lang === "ta" ? "அனைத்து மாவட்டங்கள் (38)" : "All Districts (38)"}</option>
              {TN_DISTRICTS_LIST.map((dist, idx) => (
                <option key={idx} value={dist}>{dist}</option>
              ))}
            </select>
          )}

          {/* Zone Dropdown (for zone or district) */}
          {(activeLevel === "zone" || activeLevel === "district") && (
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
            >
              <option value="all">{lang === "ta" ? "அனைத்து மண்டலங்கள் (4)" : "All Zones (4)"}</option>
              {ZONES_LIST.map((z) => (
                <option key={z.id} value={z.ta}>{z.ta}</option>
              ))}
            </select>
          )}

          {canAppointAtTier(activeLevel) ? (
            <button
              onClick={() => handleOpenAppointModal(activeLevel)}
              className="px-3.5 py-2 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "நியமனம் செய்" : "Appoint"}</span>
            </button>
          ) : (
            activeLevel === "state" && isEffectiveStatePresident && !isSuperAdmin && (
              <div className="px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-xl text-[10px] text-stone-600 font-bold flex items-center gap-1 shrink-0">
                <Lock className="w-3 h-3 text-stone-400" />
                <span>{lang === "ta" ? "மாநில நியமனம்: சூப்பர் அட்மின் மட்டுமே" : "State Appts: Super Admin Only"}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Active Tier Explanatory Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          {activeLevel === "state" && <Building2 className="w-5 h-5 text-[#b91c1c]" />}
          {activeLevel === "district" && <MapPin className="w-5 h-5 text-[#b91c1c]" />}
          {activeLevel === "zone" && <Globe className="w-5 h-5 text-[#b91c1c]" />}
          {activeLevel === "union_area" && <Layers className="w-5 h-5 text-[#b91c1c]" />}
          <div>
            <h3 className="font-black text-stone-900 text-base">
              {activeLevel === "state" && (lang === "ta" ? "மாநில நிர்வாகிகள் பட்டியல் (State Executives)" : "State Executives List")}
              {activeLevel === "district" && (lang === "ta" ? "மாவட்ட நிர்வாகிகள் பட்டியல் (District Executives)" : "District Executives List")}
              {activeLevel === "zone" && (lang === "ta" ? "மண்டல நிர்வாகிகள் பட்டியல் (Zonal Executives)" : "Zonal Executives List")}
              {activeLevel === "union_area" && (lang === "ta" ? "பகுதி / ஒன்றிய நிர்வாகிகள் பட்டியல் (Area & Union Executives)" : "Area & Union Executives List")}
            </h3>
            <span className="text-[11px] text-stone-500 block">
              {activeLevel === "state" && (lang === "ta" ? "மாநிலத் தலைமை, பொதுச்செயலாளர், பொருளாளர் மற்றும் வழிகாட்டுதல் குழு" : "State core leadership, general secretary, treasurer, and supreme council")}
              {activeLevel === "district" && (lang === "ta" ? "தமிழ்நாட்டின் 38 மாவட்டங்களின் தலைவர், செயலாளர் மற்றும் நிர்வாக அமைப்புகள்" : "District presidents, secretaries, and leadership panels across 38 districts")}
              {activeLevel === "zone" && (lang === "ta" ? "வடக்கு, தெற்கு, கிழக்கு, மேற்கு மண்டல ஒருங்கிணைப்புச் செயலாளர்கள்" : "Zonal secretaries and coordinators covering North, South, West & Central/East")}
              {activeLevel === "union_area" && (lang === "ta" ? "வட்ட ஒன்றியங்கள், நகரப் பிரிவுகள் மற்றும் பகுதி அளவிலான களப் பொறுப்பாளர்கள்" : "Block unions, town branches, and area coordinators connecting local artisans")}
            </span>
          </div>
        </div>

        <span className="text-xs font-extrabold text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
          {filteredExecutives.length} {lang === "ta" ? "பொறுப்பாளர்கள்" : "Executives"}
        </span>
      </div>

      {/* Executives Grid */}
      {filteredExecutives.length === 0 ? (
        <div className="bg-stone-50 border border-dashed border-stone-300 rounded-3xl p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-stone-300 mx-auto" />
          <h4 className="font-extrabold text-stone-700 text-sm">
            {lang === "ta" ? "நிர்வாகிகள் பட்டியல் கிடைக்கவில்லை" : "No executive members found"}
          </h4>
          <p className="text-stone-500 text-xs max-w-md mx-auto">
            {searchQuery 
              ? (lang === "ta" ? "தேடலுக்குரிய முடிவுகள் எதுவும் இல்லை. தேடல் வார்த்தையை மாற்றிப் பார்க்கவும்." : "No results match your search filters.")
              : (lang === "ta" ? "இப்பிரிவில் இன்னும் நிர்வாகிகள் நியமிக்கப்படவில்லை. புதிய நிர்வாகிகளை நியமிக்கலாம்." : "No executives currently appointed in this section.")}
          </p>
          {canAppointAtTier(activeLevel) && (
            <button
              onClick={() => handleOpenAppointModal(activeLevel)}
              className="px-4 py-2 bg-[#b91c1c] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-rose-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "ta" ? "இப்பிரிவுக்கு நிர்வாகி நியமிக்க" : "Appoint Executive for this tier"}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExecutives.map((exec) => {
            const isPresident = exec.role.includes("தலைவர்") || (exec.roleEn && exec.roleEn.includes("President"));
            const isSecretary = exec.role.includes("செயலாளர்") || (exec.roleEn && exec.roleEn.includes("Secretary"));
            const isTreasurer = exec.role.includes("பொருளாளர்") || (exec.roleEn && exec.roleEn.includes("Treasurer"));

            const badgeBg = isPresident
              ? "bg-amber-50 text-amber-900 border-amber-200 ring-1 ring-amber-100"
              : isSecretary
                ? "bg-blue-50 text-blue-900 border-blue-200 ring-1 ring-blue-100"
                : isTreasurer
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200 ring-1 ring-emerald-100"
                  : "bg-purple-50 text-purple-900 border-purple-200 ring-1 ring-purple-100";

            return (
              <div 
                key={exec.id} 
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Bar: District / Zone / Unit Tag & Status */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {exec.district && (
                        <span className="text-[10px] font-black uppercase text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-[#b91c1c]" />
                          <span>{exec.district}</span>
                        </span>
                      )}
                      {exec.unitName && (
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {exec.unitName}
                        </span>
                      )}
                      {exec.zone && !exec.unitName && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {exec.zone.split(" ")[0]}
                        </span>
                      )}
                    </div>

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      exec.status === "active" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-stone-200 text-stone-600"
                    }`}>
                      {exec.status === "active" ? (lang === "ta" ? "செயலில்" : "Active") : (lang === "ta" ? "விடுப்பு" : "Inactive")}
                    </span>
                  </div>

                  {/* Profile & Identity */}
                  {/* Profile & Identity - Authentic Direct Portrait Photo (Strictly No Icons) */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="relative shrink-0 group/photo">
                      <img 
                        src={getExecutivePhoto(exec)} 
                        alt={exec.name} 
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm border-2 border-amber-300/80 bg-stone-100 ring-2 ring-stone-100"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_EXECUTIVE_PORTRAITS[0];
                        }}
                      />

                      {/* Direct Instant Photo Change/Upload Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPhotoModal(exec);
                        }}
                        title={lang === "ta" ? "நேரடி புகைப்படம் மாற்ற / பதிவேற்ற" : "Change / Upload Direct Photo"}
                        className="absolute -top-1.5 -right-1.5 bg-amber-500 hover:bg-amber-600 active:scale-90 text-white p-1 rounded-full shadow-md border-2 border-white transition-all cursor-pointer z-10"
                      >
                        <Camera className="w-3 h-3" />
                      </button>

                      {/* Tier Badge Icon */}
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-stone-900 text-sm truncate">
                        {exec.name}
                      </h4>
                      {exec.nameEn && (
                        <span className="text-[11px] text-stone-400 block truncate">
                          {exec.nameEn}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-black rounded-md ${badgeBg}`}>
                          {exec.role}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenPhotoModal(exec)}
                          className="text-[10px] text-amber-700 hover:text-amber-900 font-bold inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-200/80 transition-colors cursor-pointer"
                          title={lang === "ta" ? "புகைப்படம் மாற்றுக" : "Change Photo"}
                        >
                          <Camera className="w-2.5 h-2.5 text-amber-600" />
                          <span>{lang === "ta" ? "படம்" : "Photo"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Details if any */}
                  {exec.notes && (
                    <p className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-xl border border-stone-100 mb-3 leading-relaxed">
                      {exec.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Actions: Call, WhatsApp, Legal Oath & Order */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${exec.phone}`}
                      className="flex-1 py-2 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{exec.phone}</span>
                    </a>

                    <a
                      href={`https://wa.me/${exec.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all cursor-pointer"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Direct Change / Upload Photo Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenPhotoModal(exec)}
                    className="w-full py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100/90 text-amber-950 border border-amber-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    title={lang === "ta" ? "நிர்வாகியின் புகைப்படத்தை மாற்றவும் அல்லது பதிவேற்றவும்" : "Change or Upload Executive Photo"}
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{lang === "ta" ? "புகைப்படம் மாற்ற / பதிவேற்ற" : "Change / Upload Photo"}</span>
                  </button>

                  {/* Official Appointment Order Button */}
                  <button
                    onClick={() => setViewingOathExecutive(exec)}
                    className="w-full py-1.5 px-2.5 bg-rose-50/80 hover:bg-rose-100 text-rose-950 border border-rose-200/80 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    title={lang === "ta" ? "அதிகாரப்பூர்வ நியமன ஆணை" : "View Official Appointment Order"}
                  >
                    <Award className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                    <span>{lang === "ta" ? "அதிகாரப்பூர்வ நியமன ஆணை" : "Official Appointment Order"}</span>
                  </button>

                  {/* Executive Management Controls (Super Admin & State President RBAC) */}
                  {(() => {
                    const canEdit = canEditExecutive(exec);
                    const canDelete = canDeleteExecutive(exec);
                    const isProtectedSuperAdmin = exec.level === "state" && isSuperAdminExecutive(exec);

                    if (isEffectiveStatePresident && !isSuperAdmin && isProtectedSuperAdmin) {
                      return (
                        <div className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-stone-100 border border-stone-200 rounded-xl text-[10px] text-stone-600 font-bold w-full">
                          <Lock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <span>{lang === "ta" ? "சூப்பர் அட்மின் பதிவு - திருத்த இயலாது" : "Super Admin - Protected"}</span>
                        </div>
                      );
                    }

                    if (!canEdit && !canDelete) return null;

                    return (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEditModal(exec)}
                            className={`flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${!canDelete ? "w-full" : ""}`}
                          >
                            <Edit3 className="w-3 h-3 text-amber-700" />
                            <span>
                              {exec.level === "state" && isEffectiveStatePresident && !isSuperAdmin
                                ? (lang === "ta" ? "மாற்று / திருத்து (தலைவர்)" : "Edit (President)")
                                : (lang === "ta" ? "மாற்று / திருத்து" : "Edit / Change")}
                            </span>
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => setDeleteConfirmId(exec.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                            title={lang === "ta" ? "பதவி நீக்கம்" : "Remove"}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APPOINTMENT & EDIT MODAL (SUPER ADMIN & STATE PRESIDENT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#b91c1c]" />
                <h3 className="font-black text-stone-900 text-base">
                  {editingExecutive 
                    ? (lang === "ta" 
                        ? `நிர்வாகப் பொறுப்பாளர் விவரங்களை மாற்றுக ${isEffectiveStatePresident && !isSuperAdmin ? "(மாநில தலைவர்)" : ""}` 
                        : `Update Executive Official ${isEffectiveStatePresident && !isSuperAdmin ? "(State President)" : ""}`) 
                    : (lang === "ta" 
                        ? `புதிய நிர்வாகி நியமனம் ${isSuperAdmin ? "(சூப்பர் அட்மின்)" : "(மாநில தலைவர்)"}` 
                        : `Appoint New Executive ${isSuperAdmin ? "(Super Admin)" : "(State President)"}`)}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              {/* Level Selector */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  {lang === "ta" ? "நிர்வாகப் பிரிவு (Hierarchy Level):" : "Hierarchy Level:"}
                </label>
                {isEffectiveStatePresident && !isSuperAdmin && editingExecutive && editingExecutive.level === "state" ? (
                  <div className="p-2.5 bg-stone-100 border border-stone-200 rounded-xl font-bold text-stone-800 text-xs flex items-center justify-between">
                    <span>{lang === "ta" ? "1. மாநில நிர்வாகிகள் பட்டியல் (State Executives)" : "1. State Executives"}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                      {lang === "ta" ? "திருத்துவது மட்டும்" : "Edit Only"}
                    </span>
                  </div>
                ) : (
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as ExecutiveLevel)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:ring-2 focus:ring-[#b91c1c]"
                  >
                    {isSuperAdmin && (
                      <option value="state">{lang === "ta" ? "1. மாநில நிர்வாகிகள் பட்டியல் (State Executives)" : "State Executives"}</option>
                    )}
                    <option value="district">{lang === "ta" ? "2. மாவட்ட நிர்வாகிகள் பட்டியல் (District Executives)" : "District Executives"}</option>
                    <option value="zone">{lang === "ta" ? "3. மண்டல நிர்வாகிகள் பட்டியல் (Zonal Executives)" : "Zonal Executives"}</option>
                    <option value="union_area">{lang === "ta" ? "4. பகுதி / ஒன்றிய நிர்வாகிகள் பட்டியல் (Area & Union)" : "Area & Union Executives"}</option>
                  </select>
                )}
              </div>

              {/* Name (Ta & En) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "பெயர் (தமிழ்): *" : "Name (Tamil): *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: ஆர். கார்த்திகேயன்"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "பெயர் (ஆங்கிலம்):" : "Name (English):"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R. Karthikeyan"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                  />
                </div>
              </div>

              {/* Role & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "நிர்வாகப் பதவி: *" : "Role / Position: *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      formLevel === "state" ? "மாநில தலைவர் / பொருளாளர்" :
                      formLevel === "district" ? "மாவட்ட தலைவர் / செயலாளர்" :
                      formLevel === "zone" ? "மண்டல செயலாளர்" : "ஒன்றிய தலைவர் / பகுதி செயலாளர்"
                    }
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "பதவி (ஆங்கிலம்):" : "Role (English):"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. District President"
                    value={formRoleEn}
                    onChange={(e) => setFormRoleEn(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  {lang === "ta" ? "தொடர்பு எண்: *" : "Phone Number: *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98400 12345"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                />
              </div>

              {/* Executive Photo Studio Section (Strictly Real Photos Only - No Icons) */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-700" />
                    <span>{lang === "ta" ? "நிர்வாகி நேரடி புகைப்படம் (ஐகான் கிடையாது): *" : "Executive Real Photo (No Icons Allowed): *"}</span>
                  </label>
                  <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    {lang === "ta" ? "புகைப்படம் மட்டுமே" : "Photos Only"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative shrink-0">
                    <img 
                      src={formPhotoUrl || DEFAULT_EXECUTIVE_PORTRAITS[0]} 
                      alt="Executive Preview" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-stone-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_EXECUTIVE_PORTRAITS[0];
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="w-full py-2 px-3 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === "ta" ? "கேமரா / கேலரியில் இருந்து பதிவேற்றுக" : "Upload from Camera / Files"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      placeholder={lang === "ta" ? "அல்லது நேரடி புகைப்பட URL..." : "Or paste Photo URL..."}
                      value={formPhotoUrl}
                      onChange={(e) => setFormPhotoUrl(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500"
                    />

                    {/* Quick Preset Portraits */}
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 block mb-1">
                        {lang === "ta" ? "மாதிரி நிர்வாகி படத்திலிருந்து தேர்வு செய்க:" : "Or pick from dignified portraits:"}
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {DEFAULT_EXECUTIVE_PORTRAITS.slice(0, 8).map((pUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormPhotoUrl(pUrl)}
                            className={`shrink-0 w-8 h-8 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              formPhotoUrl === pUrl ? "border-amber-600 scale-110 shadow-sm ring-1 ring-amber-500" : "border-stone-200 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={pUrl} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditional Tier Fields */}
              {(formLevel === "district" || formLevel === "union_area") && (
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "மாவட்டம் (District):" : "District:"}
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                  >
                    {TN_DISTRICTS_LIST.map((dist, idx) => (
                      <option key={idx} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              )}

              {(formLevel === "zone" || formLevel === "district") && (
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "மண்டலம் (Zone):" : "Zone:"}
                  </label>
                  <select
                    value={formZone}
                    onChange={(e) => setFormZone(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                  >
                    {ZONES_LIST.map((z) => (
                      <option key={z.id} value={z.ta}>{z.ta}</option>
                    ))}
                  </select>
                </div>
              )}

              {formLevel === "union_area" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      {lang === "ta" ? "கிளை வகை (Unit Type):" : "Unit Type:"}
                    </label>
                    <select
                      value={formUnitType}
                      onChange={(e) => setFormUnitType(e.target.value as any)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                    >
                      <option value="union">{lang === "ta" ? "ஒன்றியம் (Block Union)" : "Block Union"}</option>
                      <option value="town">{lang === "ta" ? "நகரம் (Town Unit)" : "Town Unit"}</option>
                      <option value="area">{lang === "ta" ? "பகுதி (Area Unit)" : "Area Unit"}</option>
                      <option value="wing">{lang === "ta" ? "இளைஞரணி / துணைப் பிரிவு" : "Wing Unit"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      {lang === "ta" ? "ஒன்றியம் / பகுதியின் பெயர்:" : "Unit / Area Name:"}
                    </label>
                    <input
                      type="text"
                      placeholder="எ.கா: வட சென்னை ஒன்றியம்"
                      value={formUnitName}
                      onChange={(e) => setFormUnitName(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                    />
                  </div>
                </div>
              )}

              {/* Status & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "நிலை (Status):" : "Status:"}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                  >
                    <option value="active">{lang === "ta" ? "செயலில் உள்ளது (Active)" : "Active"}</option>
                    <option value="inactive">{lang === "ta" ? "விடுப்பில் உள்ளது (Inactive)" : "Inactive"}</option>
                    <option value="transferred">{lang === "ta" ? "இடமாற்றம் செய்யப்பட்டது (Transferred)" : "Transferred"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {lang === "ta" ? "பொறுப்பு குறிப்புகள் (Notes):" : "Notes / Remarks:"}
                  </label>
                  <input
                    type="text"
                    placeholder="எ.கா: மாவட்ட ஒருங்கிணைப்பாளர்"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-[#b91c1c]"
                  />
                </div>
              </div>

              {/* MANDATORY UNION DISCIPLINE & LEADERSHIP UNDERTAKING */}
              <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-950 font-extrabold">
                  <div className="w-6 h-6 rounded-lg bg-[#b91c1c] text-white flex items-center justify-center shrink-0">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span>{lang === "ta" ? "பொறுப்பாளர் சத்தியப்பிரமாண உறுதிமொழி வாசகம்:" : "Solemn Oath of Allegiance & Discipline:"}</span>
                  <span className="ml-auto font-mono text-[9px] bg-rose-200/80 px-2 py-0.5 rounded font-black text-rose-900">TNPA/EXEC/2026</span>
                </div>
                <blockquote className="text-[11px] font-black text-[#991b1b] bg-white p-3 rounded-xl border border-rose-200 leading-relaxed italic shadow-2xs">
                  "{lang === "ta"
                    ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தைச் சார்ந்த இன்று முதல் இந்த சங்கத்தில் உறுப்பினர் அல்லது பொறுப்பாளராக திறன் பட செயல்படுவேன். மேலும் இந்த சங்கத்தில் மாநில தலைமை பற்றியோ இந்த சங்கத்தைப் பற்றியோ அவதூறு பரப்புவது மற்றும் இழிவு படுத்துவது இது போன்ற செயல்களில் ஈடுபட மாட்டேன் எனவும் மேலும் மாநில தலைமை எடுக்கும் முடிவுகளுக்கு கட்டுப்பட்டு நடப்பேன் எனவும் உறுதியளிக்கிறேன்."
                    : "Belonging to Tamil Nadu Painters and Artists Progressive Association, from this day forward I will function efficiently as a member or office bearer in this association. Furthermore, I swear that I will not engage in defaming, criticizing, or degrading the association or its state leadership, and I pledge that I will strictly abide by all decisions taken by the state leadership."}"
                </blockquote>
                <label className="flex items-start gap-2 pt-1 font-bold text-rose-950 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formLegalOathAccepted}
                    onChange={(e) => setFormLegalOathAccepted(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 mt-0.5 w-4 h-4"
                  />
                  <span className="text-[11px] leading-snug">
                    {lang === "ta"
                      ? "மேற்கண்ட அதிகாரப்பூர்வ உறுதிமொழியை இந்நிர்வாகி முழுமையாக ஏற்றுக்கொண்டுள்ளார் என சான்றளிக்கிறேன்."
                      : "I certify that this official has solemnly pledged adherence to the above oath."}
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  {lang === "ta" ? "ரத்து" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingExecutive ? (lang === "ta" ? "சேமிக்க" : "Save Changes") : (lang === "ta" ? "நியமிக்க" : "Appoint Official")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                {lang === "ta" ? "நிர்வாகப் பொறுப்பிலிருந்து நீக்கவா?" : "Confirm Removal of Executive"}
              </h3>
              <p className="text-stone-500 text-xs mt-1">
                {lang === "ta" 
                  ? "இவரை நிர்வாகப் பொறுப்பாளர் பட்டியலில் இருந்து நீக்க உறுதி செய்கிறீர்களா? இது உடனடியாக பதிவேடுகளில் புதுப்பிக்கப்படும்."
                  : "Are you sure you want to remove this official from the executive hierarchy?"}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {lang === "ta" ? "இல்லை, ரத்து" : "Cancel"}
              </button>
              <button
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
              >
                {lang === "ta" ? "ஆம், நீக்கு" : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL APPOINTMENT ORDER MODAL */}
      {viewingOathExecutive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-[#b91c1c]/30 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            {/* Modal Top Header */}
            <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#b91c1c] text-white flex items-center justify-center shadow-md">
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    {lang === "ta" ? "அதிகாரப்பூர்வ நிர்வாகி நியமன ஆணை சான்றிதழ்" : "Official Executive Appointment Order"}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-stone-300 mt-0.5">
                    <span className="font-mono text-amber-400 font-bold">TNPA/APPT-ORD/2026/{viewingOathExecutive.id.toUpperCase()}</span>
                    <span>•</span>
                    <span>{lang === "ta" ? "அரசு பதிவு: TNMDUJCLMDUTU- 50-26-00044" : "Govt Reg: TNMDUJCLMDUTU- 50-26-00044"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewingOathExecutive(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Body (Printable framed layout) */}
            <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-xs bg-stone-50/50">
              {/* Header Crest */}
              <div className="text-center pb-4 border-b border-stone-200">
                <div className="inline-flex items-center justify-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#b91c1c] text-white flex items-center justify-center font-black text-lg shadow-sm">
                    TN
                  </div>
                </div>
                <h2 className="text-base sm:text-lg font-black text-rose-950 uppercase tracking-wide">
                  தமிழ்நாடு பெயிண்டர்கள் சங்கம்
                </h2>
                <p className="text-[11px] text-stone-600 font-semibold mt-0.5">
                  TAMIL NADU PAINTERS ASSOCIATION
                </p>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                  Govt Reg: TNMDUJCLMDUTU- 50-26-00044 | Registered under TN Societies Act 1975
                </p>
              </div>

              {/* Official Order Banner */}
              <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm text-center">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black tracking-wider uppercase inline-block mb-2">
                  {lang === "ta" ? "அதிகாரப்பூர்வ நிர்வாகி நியமன சான்றிதழ்" : "OFFICIAL EXECUTIVE APPOINTMENT ORDER"}
                </span>
                <p className="text-xs text-stone-600">
                  {lang === "ta" ? "ஆணை எண்:" : "Order Ref:"} <strong className="text-stone-900 font-mono">TNPA/APPT-ORD/2026/{viewingOathExecutive.id.toUpperCase()}</strong>
                  <span className="mx-2">•</span>
                  {lang === "ta" ? "தேதி:" : "Date:"} <strong className="text-stone-900 font-mono">{viewingOathExecutive.appointedDate || new Date().toISOString().split("T")[0]}</strong>
                </p>
              </div>

              {/* Executive Profile Card */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-xs">
                <img
                  src={getExecutivePhoto(viewingOathExecutive)}
                  alt={viewingOathExecutive.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-300 shrink-0 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_EXECUTIVE_PORTRAITS[0];
                  }}
                />

                <div className="text-center sm:text-left space-y-1 flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h3 className="text-base font-black text-stone-950">
                      {viewingOathExecutive.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-black">
                      {viewingOathExecutive.role}
                    </span>
                  </div>
                  {viewingOathExecutive.nameEn && (
                    <p className="text-[11px] text-stone-500 font-semibold">{viewingOathExecutive.nameEn} ({viewingOathExecutive.roleEn})</p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-[11px] text-stone-600 pt-1 flex-wrap">
                    <span>
                      {lang === "ta" ? "நிலை:" : "Tier:"} <strong className="text-stone-900 capitalize">{viewingOathExecutive.level}</strong>
                    </span>
                    {viewingOathExecutive.district && (
                      <span>
                        {lang === "ta" ? "மாவட்டம்:" : "District:"} <strong className="text-stone-900">{viewingOathExecutive.district}</strong>
                      </span>
                    )}
                    {viewingOathExecutive.unitName && (
                      <span>
                        {lang === "ta" ? "ஒன்றியம்/பகுதி:" : "Unit:"} <strong className="text-stone-900">{viewingOathExecutive.unitName}</strong>
                      </span>
                    )}
                    <span>
                      {lang === "ta" ? "நியமித்த தலைமை:" : "Appointed By:"} <strong className="text-stone-900">{viewingOathExecutive.appointedBy || "மாநில தலைமை"}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* OFFICIAL APPOINTMENT RESOLUTION & LEADERSHIP DIRECTIVE */}
              <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
                  <Award className="w-4 h-4 text-[#b91c1c] shrink-0" />
                  <span>
                    {lang === "ta" ? "மாநில தலைமை அதிகாரப்பூர்வ நியமன ஆணை விபரம்:" : "Official Leadership Appointment Decree:"}
                  </span>
                </div>

                <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200/70 space-y-2 text-[11px] leading-relaxed text-stone-800">
                  <p>
                    <strong>1. அதிகாரப்பூர்வ நியமனம்:</strong> தமிழ்நாடு பெயிண்டர்கள் சங்கத்தின் மாநில பொதுக்குழு மற்றும் செயற்குழுவின் ஏகோபித்த முடிவின்படி, மாநிலத் தலைவர் மற்றும் மாநில பொதுச்செயலாளர் ஆகியோரின் நேரடி ஒப்புதலுடன் திரு/திருமதி <strong>{viewingOathExecutive.name}</strong> அவர்கள் <strong>{viewingOathExecutive.role}</strong> பொறுப்பிற்கு அதிகாரப்பூர்வமாக நியமிக்கப்படுகிறார்.
                  </p>
                  <p>
                    <strong>2. சங்கப் பணி & விசுவாச நெறிமுறை:</strong> இந்நிர்வாகி சங்கத்தின் வளர்ச்சிக்கும், உறுப்பினர்களின் முன்னேற்றத்திற்கும், மாநிலத் தலைவர் மற்றும் மாநில பொதுச்செயலாளர் ஆகியோரின் வழிகாட்டுதலுக்கு முழுமையாகக் கட்டுப்பட்டு உண்மையாகவும் அர்ப்பணிப்புடனும் செயலாற்ற வேண்டும். சங்கத்தின் நற்பெயருக்கு களங்கம் விளைவிக்கும் செயல்களிலோ அல்லது தலைமைக்கு எதிரான ஒழுங்கீனங்களிலோ ஈடுபட்டால் எவ்வித முன்னறிவிப்புமின்றி இப்பதவி உடனடியாக ரத்து செய்யப்படும்.
                  </p>
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[#991b1b]">
                    <strong>3. நிர்வாகி சத்தியப்பிரமாண உறுதிமொழி வாசகம்:</strong>
                    <blockquote className="italic font-extrabold mt-1 text-[11px] leading-relaxed">
                      "{lang === "ta"
                        ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தைச் சார்ந்த இன்று முதல் இந்த சங்கத்தில் உறுப்பினர் அல்லது பொறுப்பாளராக திறன் பட செயல்படுவேன். மேலும் இந்த சங்கத்தில் மாநில தலைமை பற்றியோ இந்த சங்கத்தைப் பற்றியோ அவதூறு பரப்புவது மற்றும் இழிவு படுத்துவது இது போன்ற செயல்களில் ஈடுபட மாட்டேன் எனவும் மேலும் மாநில தலைமை எடுக்கும் முடிவுகளுக்கு கட்டுப்பட்டு நடப்பேன் எனவும் உறுதியளிக்கிறேன்."
                        : "Belonging to Tamil Nadu Painters and Artists Progressive Association, from this day forward I will function efficiently as a member or office bearer in this association. Furthermore, I swear that I will not engage in defaming, criticizing, or degrading the association or its state leadership, and I pledge that I will strictly abide by all decisions taken by the state leadership."}"
                    </blockquote>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-[11px] bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {lang === "ta"
                      ? "மாநிலத் தலைவர் மற்றும் மாநில பொதுச்செயலாளர் அவர்களின் அதிகாரப்பூர்வ ஒப்புதலுடன் இந்நியமன ஆணை வழங்கப்படுகிறது."
                      : "This appointment order is issued with the full official endorsement of the State President and State General Secretary."}
                  </span>
                </div>
              </div>

              {/* Endorsements & Signatures - Only State President and State General Secretary */}
              <div className="pt-4 border-t-2 border-stone-200 grid grid-cols-2 gap-4 text-center">
                {/* 1. State General Secretary: ரா. சேவியர் பாபு */}
                <div className="p-4 bg-white rounded-2xl border-2 border-stone-200/90 shadow-xs flex flex-col items-center justify-between">
                  <div className="h-12 flex items-center justify-center">
                    <span className="font-serif italic text-base text-[#991b1b] font-black tracking-wider">
                      R. Xavier Babu
                    </span>
                  </div>
                  <div className="w-full border-t border-stone-300 pt-2">
                    <h5 className="text-xs sm:text-sm font-black text-stone-950">ரா. சேவியர் பாபு</h5>
                    <p className="text-[11px] font-extrabold text-[#b91c1c]">மாநில பொதுச்செயலாளர்</p>
                    <span className="block text-[10px] text-stone-500 font-medium mt-0.5">தமிழ்நாடு பெயிண்டர்கள் சங்கம்</span>
                    <span className="block text-[9px] text-stone-400 font-mono mt-0.5">+91 70101 31915</span>
                  </div>
                </div>

                {/* 2. State President: எஸ். மைக்கேல் ஆல்வின் */}
                <div className="p-4 bg-white rounded-2xl border-2 border-stone-200/90 shadow-xs flex flex-col items-center justify-between">
                  <div className="h-12 flex items-center justify-center">
                    <span className="font-serif italic text-base text-[#991b1b] font-black tracking-wider">
                      S. Michael Alwin
                    </span>
                  </div>
                  <div className="w-full border-t border-stone-300 pt-2">
                    <h5 className="text-xs sm:text-sm font-black text-stone-950">எஸ். மைக்கேல் ஆல்வின்</h5>
                    <p className="text-[11px] font-extrabold text-[#b91c1c]">மாநிலத் தலைவர்</p>
                    <span className="block text-[10px] text-stone-500 font-medium mt-0.5">தமிழ்நாடு பெயிண்டர்கள் சங்கம்</span>
                    <span className="block text-[9px] text-stone-400 font-mono mt-0.5">+91 97893 31681</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Print */}
            <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? "சான்றிதழ் அச்சிடுக (Print)" : "Print Order"}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingOathExecutive(null)}
                className="px-5 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
              >
                {lang === "ta" ? "மூடுக" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED EXECUTIVE PHOTO STUDIO MODAL (STRICTLY REAL PHOTOS - NO ICONS) */}
      {photoModalExecutive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-300 space-y-4 my-8 animate-[scaleIn_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base">
                    {lang === "ta" ? "நிர்வாகி நேரடி புகைப்படம் மாற்றும் அரங்கம்" : "Executive Direct Photo Studio"}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-bold">
                    {lang === "ta" 
                      ? "அனைத்து நிர்வாகிகளுக்கும் நேரடி புகைப்படம் மட்டுமே காட்டப்படும் (ஐகான் கிடையாது)" 
                      : "Direct photos only for all executives (No icons allowed)"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPhotoModalExecutive(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Executive Summary */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {lang === "ta" ? "நிர்வாகப் பொறுப்பாளர்" : "Executive Official"}
                </span>
                <h4 className="font-black text-stone-900 text-sm">
                  {photoModalExecutive.name} {photoModalExecutive.nameEn ? `(${photoModalExecutive.nameEn})` : ""}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-[#b91c1c]">
                    {photoModalExecutive.role}
                  </span>
                  <span className="text-[10px] text-stone-500 font-semibold">
                    • {photoModalExecutive.district || photoModalExecutive.zone || photoModalExecutive.level}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-black px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full shrink-0">
                {lang === "ta" ? "நேரடி படம்" : "Real Photo"}
              </span>
            </div>

            {/* Photo Preview & Live Inspection */}
            <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50/50 to-stone-50 rounded-2xl border border-amber-200/80">
              <div className="relative">
                <img
                  src={photoModalUrl || DEFAULT_EXECUTIVE_PORTRAITS[0]}
                  alt="Executive"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl ring-4 ring-amber-400/80 bg-stone-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_EXECUTIVE_PORTRAITS[0];
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md border-2 border-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{lang === "ta" ? "உறுதிப்படுத்தப்பட்ட நேரடி புகைப்படம்" : "Verified Direct Portrait Photo"}</span>
                </span>
              </div>
            </div>

            {/* Upload Options Tabs / Choices */}
            <div className="space-y-3">
              {/* Option A: Device Camera or Gallery */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-700" />
                    <span>{lang === "ta" ? "விருப்பம் 1: கேமரா அல்லது கேலரியில் இருந்து தேர்வு செய்க:" : "Option 1: Camera or Device Gallery Upload:"}</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-semibold">Max 3MB</span>
                </label>
                <label className="w-full py-2.5 px-4 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{lang === "ta" ? "கேமராவில் எடுக்க / படத்தை பதிவேற்ற கிளிக் செய்க" : "Choose File or Take Camera Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoModalFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Direct Image URL */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>{lang === "ta" ? "விருப்பம் 2: ஆன்லைன் புகைப்பட இணைய முகவரி (URL):" : "Option 2: Direct Photo Web URL:"}</span>
                </label>
                <input
                  type="url"
                  placeholder={lang === "ta" ? "https://example.com/photo.jpg போன்ற நேரடி இணைப்பு..." : "https://example.com/photo.jpg"}
                  value={photoModalUrl}
                  onChange={(e) => setPhotoModalUrl(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Option C: Dignified Preset Executive Portraits */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === "ta" ? "விருப்பம் 3: அதிகாரப்பூர்வ மாதிரி நிர்வாகி புகைப்படங்களிலிருந்து தேர்வு செய்க:" : "Option 3: Choose from Official Dignified Portraits:"}</span>
                </label>
                <div className="grid grid-cols-6 gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xl max-h-36 overflow-y-auto">
                  {DEFAULT_EXECUTIVE_PORTRAITS.map((pUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoModalUrl(pUrl)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        photoModalUrl === pUrl 
                          ? "border-amber-600 ring-2 ring-amber-500 scale-105 shadow-md" 
                          : "border-stone-200 opacity-75 hover:opacity-100 hover:border-amber-300"
                      }`}
                      title={`Portrait #${idx + 1}`}
                    >
                      <img src={pUrl} alt="" className="w-full h-full object-cover" />
                      {photoModalUrl === pUrl && (
                        <div className="absolute inset-0 bg-amber-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPhotoModalExecutive(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {lang === "ta" ? "ரத்து" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleSavePhotoModal}
                className="px-5 py-2.5 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{lang === "ta" ? "புகைப்படத்தை சேமித்து மாற்றுக" : "Save & Update Photo"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SUCCESS TOAST */}
      {photoUploadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-center gap-3 animate-[slideUp_0.3s_ease-out]">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-white">
              {lang === "ta" ? "வெற்றிகரமாக புதுப்பிக்கப்பட்டது" : "Successfully Updated"}
            </h5>
            <p className="text-[11px] text-stone-300">
              {photoUploadSuccessToast}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
