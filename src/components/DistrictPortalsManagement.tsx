import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Building2, 
  MapPin, 
  Users, 
  Key, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Camera, 
  Upload, 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  X, 
  Edit3, 
  Trash2, 
  Printer, 
  Share2, 
  ChevronRight, 
  Copy, 
  ExternalLink,
  Sparkles,
  Lock,
  Unlock,
  Layers,
  ArrowLeft,
  Check,
  RefreshCw,
  Eye,
  FileText,
  Flag,
  Briefcase
} from "lucide-react";
import { ALL_38_TAMILNADU_DISTRICTS } from "../data/initialExecutives";
import { 
  DistrictInChargePerson, 
  DistrictSuperKeyRecord, 
  DistrictPortalOverview, 
  InChargeCategory 
} from "../types/districtPortals";
import { 
  loadAllDistrictInCharges, 
  loadAllDistrictSuperKeys, 
  saveAllDistrictInCharges, 
  saveAllDistrictSuperKeys, 
  getDistrictsOverviewList, 
  getInChargesForDistrict, 
  verifyDistrictSuperKey, 
  persistInChargePerson, 
  removeInChargePerson, 
  updateDistrictSuperKey,
  DEFAULT_EXEC_AVATARS,
  generateDefaultSuperKey,
  subscribeToDistrictInCharges,
  fetchDistrictInChargesFromFirestore,
  subscribeToDistrictSuperKeys
} from "../utils/districtInChargeStorage";
import { compressImageFile } from "../utils/imageCompressor";
import { UserAccount } from "../types";
import DistrictAppointmentOrderModal from "./DistrictAppointmentOrderModal";

export const ROLE_PRESETS_BY_CATEGORY: Record<InChargeCategory, { label: string; roles: string[] }> = {
  district_leader: {
    label: "⭐ மாவட்ட தலைமைப் பொறுப்புகள்",
    roles: [
      "மாவட்டத் தலைவர்",
      "மாவட்டச் செயலாளர்",
      "மாவட்டப் பொருளாளர்",
      "மாவட்ட செயல் தலைவர்"
    ]
  },
  district_executive: {
    label: "🏛️ மாவட்ட முதன்மை நிர்வாகிகள்",
    roles: [
      "மாவட்ட துணைத் தலைவர்",
      "மாவட்ட இணைச் செயலாளர்",
      "மாவட்ட துணைச் செயலாளர்",
      "தலைமை நிலையச் செயலாளர்",
      "அமைப்புச் செயலாளர்",
      "பிரச்சாரச் செயலாளர்",
      "செய்தித் தொடர்பாளர்",
      "செயற்குழு உறுப்பினர்",
      "பொதுக்குழு உறுப்பினர்"
    ]
  },
  district_wing: {
    label: "🚩 மாவட்ட சார்பு அணிகள்",
    roles: [
      "மாவட்ட இளைஞரணி அமைப்பாளர்",
      "மாவட்ட இளைஞரணி துணை அமைப்பாளர்",
      "மாவட்ட மகளிரணி அமைப்பாளர்",
      "மாவட்ட மகளிரணி துணை அமைப்பாளர்",
      "தொழிலாளர் நலப் பிரிவு அமைப்பாளர்",
      "சட்டப் பிரிவு ஆலோசகர் / அமைப்பாளர்",
      "IT & சமூக ஊடக அணி அமைப்பாளர்",
      "கலை & பண்பாட்டு அணி அமைப்பாளர்"
    ]
  },
  town_incharge: {
    label: "🏢 நகரப் பொறுப்பாளர்கள்",
    roles: [
      "நகரத் தலைவர்",
      "நகரச் செயலாளர்",
      "நகரப் பொருளாளர்",
      "நகர துணைத் தலைவர்",
      "நகர துணைச் செயலாளர்",
      "பகுதி / வார்டு செயலாளர்",
      "நகர அமைப்பாளர்"
    ]
  },
  union_incharge: {
    label: "🌾 ஒன்றியப் பொறுப்பாளர்கள்",
    roles: [
      "ஒன்றியத் தலைவர்",
      "ஒன்றியச் செயலாளர்",
      "ஒன்றியப் பொருளாளர்",
      "ஒன்றிய துணைத் தலைவர்",
      "ஒன்றிய துணைச் செயலாளர்",
      "ஒன்றிய அமைப்பாளர்"
    ]
  },
  branch_incharge: {
    label: "🏡 பேரூர் / கிளைப் பொறுப்பாளர்கள்",
    roles: [
      "பேரூர் தலைவர்",
      "பேரூர் செயலாளர்",
      "பேரூர் பொருளாளர்",
      "கிளைத் தலைவர்",
      "கிளைச் செயலாளர்",
      "கிளைப் பொருளாளர்"
    ]
  }
};

interface DistrictPortalsManagementProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  isSuperAdmin: boolean;
  isStatePresident?: boolean;
  onAddAuditLog: (action: string, details: string) => void;
  initialDistrictCode?: string;
}

export default function DistrictPortalsManagement({
  lang,
  currentUser,
  isSuperAdmin,
  isStatePresident,
  onAddAuditLog,
  initialDistrictCode
}: DistrictPortalsManagementProps) {
  // Central Authority Evaluation:
  // Super Admin and State President have full permissions to change, delete, and edit across all 38 districts.
  const isEffectiveStatePresident = Boolean(
    isStatePresident ||
    currentUser?.role === "state_president" ||
    currentUser?.id === "usr_president" ||
    (currentUser?.phone && (currentUser.phone.includes("9789331681") || currentUser.phone.includes("97893 31681"))) ||
    (currentUser?.name && currentUser.name.includes("மைக்கேல் ஆல்வின்"))
  );

  const hasCentralAuthority = isSuperAdmin || isEffectiveStatePresident;

  // Master data
  const [incharges, setIncharges] = useState<DistrictInChargePerson[]>(() => loadAllDistrictInCharges());
  const [superKeys, setSuperKeys] = useState<DistrictSuperKeyRecord[]>(() => loadAllDistrictSuperKeys());

  // View state: 'directory' (all 38 districts) or 'district_view' (dedicated single district)
  const [activeView, setActiveView] = useState<"directory" | "district_view">(
    initialDistrictCode ? "district_view" : "directory"
  );
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>(
    initialDistrictCode ? initialDistrictCode.toUpperCase() : "CHE"
  );

  // Filter & Search in 38 Districts Directory
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("all");

  // Single District Sub-tabs
  const [districtSubTab, setDistrictSubTab] = useState<
    "leadership" | "district_executives" | "district_wings" | "town_incharges" | "union_incharges" | "register_new" | "super_key"
  >("leadership");

  // Super Key authentication for the currently opened district
  const [districtKeyInput, setDistrictKeyInput] = useState("");
  const [isDistrictKeyUnlocked, setIsDistrictKeyUnlocked] = useState(false);
  const [keyErrorMsg, setKeyErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Modal for Viewing / Printing Appointment Order
  const [selectedPersonForOrder, setSelectedPersonForOrder] = useState<DistrictInChargePerson | null>(null);

  // Edit In-Charge State
  const [editingPerson, setEditingPerson] = useState<DistrictInChargePerson | null>(null);

  // Form State: Register New In-Charge
  const [regSelectedDistrictCode, setRegSelectedDistrictCode] = useState<string>(
    initialDistrictCode ? initialDistrictCode.toUpperCase() : "CHE"
  );
  const [regCategory, setRegCategory] = useState<InChargeCategory>("district_leader");
  const [regRole, setRegRole] = useState("மாவட்டத் தலைவர்");
  const [regName, setRegName] = useState("");
  const [regNameEn, setRegNameEn] = useState("");
  const [regUnitType, setRegUnitType] = useState<"district" | "taluk" | "town" | "union" | "wing" | "branch">("district");
  const [regUnitName, setRegUnitName] = useState("");
  const [regTaluk, setRegTaluk] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regWhatsapp, setRegWhatsapp] = useState("");
  const [regSameAsPhone, setRegSameAsPhone] = useState(false);
  const [regAltPhone, setRegAltPhone] = useState("");
  const [regAadhaar, setRegAadhaar] = useState("");
  const [regExperienceYears, setRegExperienceYears] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regBloodGroup, setRegBloodGroup] = useState("O+");
  const [regPhotoUrl, setRegPhotoUrl] = useState(DEFAULT_EXEC_AVATARS[0]);
  const [regAppointedDate, setRegAppointedDate] = useState(new Date().toISOString().split("T")[0]);
  const [regAppointedBy, setRegAppointedBy] = useState("மாநில தலைமை");
  const [regNotes, setRegNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMsg, setFormSuccessMsg] = useState<string | null>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [pendingAppointPerson, setPendingAppointPerson] = useState<DistrictInChargePerson | null>(null);
  const [pendingDeletePerson, setPendingDeletePerson] = useState<DistrictInChargePerson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteCheckbox, setConfirmDeleteCheckbox] = useState(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Real-time Firestore sync & immediate load for all 38 districts in-charges
  useEffect(() => {
    // 1. Immediate fetch from Firestore cloud database
    setIsCloudSyncing(true);
    fetchDistrictInChargesFromFirestore().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setIncharges(fetched);
      }
      setIsCloudSyncing(false);
    }).catch(() => {
      setIsCloudSyncing(false);
    });

    // 2. Real-time live listener from Firestore
    const unsubIncharges = subscribeToDistrictInCharges((remoteList) => {
      if (remoteList && remoteList.length > 0) {
        setIncharges(remoteList);
      }
    });

    // 3. Real-time live listener for Super Keys
    const unsubKeys = subscribeToDistrictSuperKeys((remoteKeys) => {
      if (remoteKeys && remoteKeys.length > 0) {
        setSuperKeys(remoteKeys);
      }
    });

    // 4. Custom window event listener for local updates
    const handleLocalUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setIncharges(e.detail);
      }
    };
    window.addEventListener("tnpa_incharges_changed", handleLocalUpdate);

    // 5. When user switches back to this tab or app on mobile, auto-refresh from Firestore
    const handleFocusOrVisible = () => {
      fetchDistrictInChargesFromFirestore().then((fetched) => {
        if (fetched && fetched.length > 0) {
          setIncharges(fetched);
        }
      }).catch(() => {});
    };
    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    return () => {
      unsubIncharges();
      unsubKeys();
      window.removeEventListener("tnpa_incharges_changed", handleLocalUpdate);
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    };
  }, []);

  // Manual refresh from Cloud Database
  const handleRefreshCloudData = async () => {
    setIsCloudSyncing(true);
    try {
      const fresh = await fetchDistrictInChargesFromFirestore();
      if (fresh) {
        setIncharges(fresh);
      }
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Auto-unlock if Super Admin, State President (Central Authority), or matching district admin
  useEffect(() => {
    if (hasCentralAuthority) {
      setIsDistrictKeyUnlocked(true);
    } else if (currentUser?.role === "district_admin" && currentUser.district) {
      const distObj = ALL_38_TAMILNADU_DISTRICTS.find(
        d => d.code.toUpperCase() === selectedDistrictCode || d.ta === currentUser.district
      );
      if (distObj && distObj.code.toUpperCase() === selectedDistrictCode) {
        setIsDistrictKeyUnlocked(true);
      } else {
        setIsDistrictKeyUnlocked(false);
      }
    } else {
      setIsDistrictKeyUnlocked(false);
    }
    setDistrictKeyInput("");
    setKeyErrorMsg(null);
  }, [selectedDistrictCode, hasCentralAuthority, currentUser]);

  const canManage = isDistrictKeyUnlocked || hasCentralAuthority;

  // Selected district info
  const currentDistrictObj = useMemo(() => {
    return (
      ALL_38_TAMILNADU_DISTRICTS.find(d => d.code.toUpperCase() === selectedDistrictCode) ||
      ALL_38_TAMILNADU_DISTRICTS[0]
    );
  }, [selectedDistrictCode]);

  // Incharges for the selected district
  const districtData = useMemo(() => {
    return getInChargesForDistrict(selectedDistrictCode, incharges);
  }, [selectedDistrictCode, incharges]);

  // Current district super key record
  const currentDistrictKeyRecord = useMemo(() => {
    return (
      superKeys.find(k => k.districtCode.toUpperCase() === selectedDistrictCode) || {
        districtCode: selectedDistrictCode,
        districtTa: currentDistrictObj.ta,
        districtEn: currentDistrictObj.en,
        superKey: generateDefaultSuperKey(selectedDistrictCode),
        status: "active" as const,
        generatedAt: new Date().toISOString(),
        authorizedPhones: []
      }
    );
  }, [selectedDistrictCode, superKeys, currentDistrictObj]);

  // 38 Districts Overview List
  const overviewList = useMemo(() => {
    return getDistrictsOverviewList(incharges, superKeys);
  }, [incharges, superKeys]);

  // Filtered 38 Districts
  const filteredDistricts = useMemo(() => {
    return overviewList.filter(d => {
      const matchesSearch =
        d.districtTa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.districtEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.districtCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZone =
        selectedZoneFilter === "all" || d.zone.includes(selectedZoneFilter);
      return matchesSearch && matchesZone;
    });
  }, [overviewList, searchQuery, selectedZoneFilter]);

  // Handle Photo Upload (Automatic smart compression into clean, lightweight passport JPEG)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("தயவுசெய்து 15MB-க்குள் உள்ள புகைப்படத்தைத் தேர்ந்தெடுக்கவும்!");
      return;
    }

    setIsCompressingPhoto(true);
    try {
      const compressedData = await compressImageFile(file, 380, 0.82);
      setRegPhotoUrl(compressedData);
    } catch (err) {
      console.warn("Image compressor fallback:", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setRegPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingPhoto(false);
      // Reset the file input value so selecting the same file again works
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  // Verify Super Key
  const handleVerifyKey = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyErrorMsg(null);
    const success = verifyDistrictSuperKey(selectedDistrictCode, districtKeyInput, superKeys);
    if (success) {
      setIsDistrictKeyUnlocked(true);
      setDistrictKeyInput("");
      onAddAuditLog(
        "District Super Key Verified",
        `Unlocked ${currentDistrictObj.ta} district portal using Super Key.`
      );
    } else {
      setKeyErrorMsg(
        lang === "ta"
          ? "❌ தவறான சூப்பர் கீ! சரியான மாவட்ட சாவியை உள்ளிடவும்."
          : "❌ Invalid Super Key for this district!"
      );
    }
  };

  // Regenerate Super Key
  const handleRegenerateKey = async () => {
    if (!isSuperAdmin && !isDistrictKeyUnlocked) return;
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const newKey = `TNPA-${selectedDistrictCode}-KEY-2026-${randSuffix}`;
    const updated = await updateDistrictSuperKey(selectedDistrictCode, newKey, superKeys);
    setSuperKeys(updated);
    onAddAuditLog(
      "Regenerated District Super Key",
      `New Super Key generated for ${currentDistrictObj.ta}: ${newKey}`
    );
    alert(lang === "ta" ? `புதிய சூப்பர் கீ உருவாக்கப்பட்டது: ${newKey}` : `New Super Key generated: ${newKey}`);
  };

  // Copy Super Key
  const handleCopySuperKey = () => {
    navigator.clipboard.writeText(currentDistrictKeyRecord.superKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Share Super Key via WhatsApp
  const handleShareKeyWhatsApp = () => {
    const text = `வணக்கம்,\nதமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கம் (TNPA²)\n${currentDistrictObj.ta} மாவட்ட நிர்வாகத்திற்கான அதிகாரப்பூர்வ சூப்பர் கீ:\n🔑 ${currentDistrictKeyRecord.superKey}\n\nமாவட்ட தலைவர், செயலாளர், பொருளாளர் இந்த சாவியைப் பயன்படுத்தி மாவட்டப் பக்கத்தில் பொறுப்பாளர்களைப் பதிவு செய்யலாம்.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Open In-Charge Edit Form
  const handleOpenEditInCharge = (person: DistrictInChargePerson) => {
    if (!canManage) {
      alert("எடிட் செய்ய மாவட்ட சூப்பர் கீ அல்லது மாநில தலைமை (சூப்பர் அட்மின் / மாநில தலைவர்) அனுமதி தேவை!");
      return;
    }
    setEditingPerson(person);
    setRegSelectedDistrictCode(person.districtCode);
    setRegCategory(person.category);
    setRegRole(person.role);
    setRegName(person.name);
    setRegNameEn(person.nameEn || "");
    setRegUnitName(person.unitName || "");
    setRegUnitType(person.unitType || (person.category === "town_incharge" ? "town" : person.category === "union_incharge" ? "union" : person.category === "district_wing" ? "wing" : "district"));
    setRegTaluk(person.taluk || "");
    setRegPhone(person.phone);
    setRegWhatsapp(person.whatsapp || person.phone || "");
    setRegSameAsPhone(person.whatsapp === person.phone);
    setRegAltPhone(person.altPhone || "");
    setRegAadhaar(person.aadhaar || "");
    setRegExperienceYears(person.experienceYears ? String(person.experienceYears) : "");
    setRegAddress(person.address);
    setRegBloodGroup(person.bloodGroup || "O+");
    setRegPhotoUrl(person.photoUrl);
    setRegAppointedDate(person.appointedDate);
    setRegAppointedBy(person.appointedBy || "");
    setRegNotes(person.notes || "");
    setFormSuccessMsg(null);
    setFormValidationError(null);
    setDistrictSubTab("register_new");
  };

  // Step 1: Open Confirmation Dialog before Appointment / Edit
  const handleInitiateSubmitInCharge = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccessMsg(null);
    setFormValidationError(null);

    if (!canManage) {
      setFormValidationError(
        "பொறுப்பாளர்களை பதிவு செய்ய அல்லது எடிட் செய்ய மாவட்ட சூப்பர் கீ அல்லது மாநில தலைமை (சூப்பர் அட்மின் / மாநில தலைவர்) அனுமதி தேவை!"
      );
      return;
    }

    if (!regName.trim() || !regPhone.trim() || !regAddress.trim()) {
      setFormValidationError("பெயர், கைபேசி எண் மற்றும் முகவரியை கட்டாயம் உள்ளிடவும்!");
      return;
    }

    const targetDistrictCode = regSelectedDistrictCode || selectedDistrictCode;
    const targetDistrictObj = ALL_38_TAMILNADU_DISTRICTS.find(
      d => d.code.toUpperCase() === targetDistrictCode.toUpperCase()
    ) || currentDistrictObj;

    const countExisting = incharges.filter(
      i => i.districtCode.toUpperCase() === targetDistrictCode.toUpperCase()
    ).length;
    const orderNo = editingPerson?.appointmentOrderNo || `TNPA/${targetDistrictCode}/${regCategory.toUpperCase().slice(0, 4)}/2026/${String(
      countExisting + 1
    ).padStart(3, "0")}`;

    const defaultAppointer = isSuperAdmin 
      ? "மாநில சூப்பர் அட்மின்" 
      : isEffectiveStatePresident 
      ? "மாநில தலைவர்" 
      : `${targetDistrictObj.ta} மாவட்ட தலைமை`;

    const personToConfirm: DistrictInChargePerson = {
      id: editingPerson ? editingPerson.id : `dist_incharge_${targetDistrictCode.toLowerCase()}_${Date.now()}`,
      name: regName.trim(),
      nameEn: regNameEn.trim() || undefined,
      category: regCategory,
      role: regRole.trim(),
      districtTa: targetDistrictObj.ta,
      districtEn: targetDistrictObj.en,
      districtCode: targetDistrictCode,
      unitType: regUnitType,
      unitName: regUnitName.trim() || `${targetDistrictObj.ta} பிரிவு`,
      taluk: regTaluk.trim() || undefined,
      phone: regPhone.trim(),
      altPhone: regAltPhone.trim() || undefined,
      whatsapp: (regSameAsPhone ? regPhone.trim() : regWhatsapp.trim()) || undefined,
      aadhaar: regAadhaar.trim() || undefined,
      experienceYears: regExperienceYears ? parseInt(regExperienceYears, 10) : undefined,
      address: regAddress.trim(),
      photoUrl: regPhotoUrl,
      bloodGroup: regBloodGroup,
      appointedDate: regAppointedDate,
      appointedBy: regAppointedBy.trim() || defaultAppointer,
      appointmentOrderNo: orderNo,
      status: "active",
      notes: regNotes.trim() || undefined,
      createdAt: editingPerson?.createdAt || new Date().toISOString()
    };

    setPendingAppointPerson(personToConfirm);
  };

  // Step 2: Confirm & Execute Appointment / Update
  const handleConfirmAppoint = async () => {
    if (!pendingAppointPerson) return;
    setIsSubmitting(true);
    setFormSuccessMsg(null);
    setFormValidationError(null);

    const personToSave = pendingAppointPerson;

    try {
      const updated = await persistInChargePerson(personToSave, incharges);
      setIncharges(updated);
      setSelectedDistrictCode(personToSave.districtCode);
      setFormSuccessMsg(
        lang === "ta"
          ? `✅ ${personToSave.name} (${personToSave.role}) ${editingPerson ? "விவரங்கள் வெற்றிகரமாக மாற்றப்பட்டது/எடிட் செய்யப்பட்டது!" : "வெற்றிகரமாக நியமிக்கப்பட்டார்!"} ஆணை எண்: ${personToSave.appointmentOrderNo}`
          : `✅ Successfully saved ${personToSave.name} (${personToSave.role})!`
      );
      const actorLabel = isSuperAdmin ? "சூப்பர் அட்மின்" : isEffectiveStatePresident ? "மாநில தலைவர்" : "மாவட்ட நிர்வாகம்";
      onAddAuditLog(
        editingPerson ? `${actorLabel} பொறுப்பாளர் மாற்றம்` : `${actorLabel} பொறுப்பாளர் நியமனம்`,
        `${actorLabel}: ${editingPerson ? "Updated" : "Appointed"} ${personToSave.name} as ${personToSave.role} in ${personToSave.districtTa} (${personToSave.unitName})`
      );

      // Close modal and reset form
      setPendingAppointPerson(null);
      setEditingPerson(null);
      setRegName("");
      setRegNameEn("");
      setRegPhone("");
      setRegWhatsapp("");
      setRegSameAsPhone(false);
      setRegAltPhone("");
      setRegTaluk("");
      setRegAddress("");
      setRegAadhaar("");
      setRegExperienceYears("");
      setRegNotes("");

      // Switch to proper tab to see result
      if (personToSave.category === "town_incharge" || personToSave.category === "branch_incharge") setDistrictSubTab("town_incharges");
      else if (personToSave.category === "union_incharge") setDistrictSubTab("union_incharges");
      else if (personToSave.category === "district_wing") setDistrictSubTab("district_wings");
      else if (personToSave.category === "district_executive") setDistrictSubTab("district_executives");
      else setDistrictSubTab("leadership");
    } catch (err: any) {
      console.error("Save error:", err);
      // Ensure confirmation modal is closed so UI doesn't freeze
      setPendingAppointPerson(null);
      const msg = err?.message || "";
      setFormValidationError(
        msg
          ? `பதிவு செய்வதில் பிழை ஏற்பட்டது (${msg})! மீண்டும் முயற்சிக்கவும்.`
          : "பதிவு செய்வதில் பிழை ஏற்பட்டது! மீண்டும் முயற்சிக்கவும்."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Open Delete Confirmation Dialog
  const handleInitiateDeleteInCharge = (person: DistrictInChargePerson) => {
    if (!canManage) {
      alert("நீக்குவதற்கு மாவட்ட சூப்பர் கீ அல்லது மாநில தலைமை (சூப்பர் அட்மின் / மாநில தலைவர்) அனுமதி தேவை!");
      return;
    }
    setConfirmDeleteCheckbox(false);
    setPendingDeletePerson(person);
  };

  // Step 2: Confirm & Execute Deletion
  const handleConfirmDeleteInCharge = async () => {
    if (!pendingDeletePerson) return;
    setIsDeleting(true);

    try {
      const person = pendingDeletePerson;
      const updated = await removeInChargePerson(person.id, incharges);
      setIncharges(updated);
      const actorLabel = isSuperAdmin ? "சூப்பர் அட்மின்" : isEffectiveStatePresident ? "மாநில தலைவர்" : "மாவட்ட நிர்வாகம்";
      onAddAuditLog(
        `${actorLabel} பொறுப்பாளர் நீக்கம்`,
        `${actorLabel}: Removed ${person.name} (${person.role}) from ${person.districtTa} (${person.unitName})`
      );
      setFormSuccessMsg(
        lang === "ta"
          ? `✅ ${person.name} (${person.role}) அவர்களின் பொறுப்பு வெற்றிகரமாக நீக்கப்பட்டது.`
          : `✅ Successfully removed ${person.name} (${person.role})`
      );
      setPendingDeletePerson(null);
      setConfirmDeleteCheckbox(false);
    } catch (err) {
      console.error("Delete error:", err);
      alert("நீக்குவதில் பிழை ஏற்பட்டது!");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open single district page
  const handleOpenDistrictPage = (code: string) => {
    setSelectedDistrictCode(code.toUpperCase());
    setActiveView("district_view");
    setDistrictSubTab("leadership");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-stone-950 via-[#7f1d1d] to-stone-950 text-white py-6 px-4 sm:px-6 shadow-xl border-b-4 border-amber-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-lg shrink-0 border-2 border-white">
              🏛️
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  38 மாவட்ட அதிகாரப்பூர்வ கட்டமைப்பு
                </span>
                <span className="bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block"></span>
                  ☁️ கிளவுட் நேரலை தரவுத்தளம் ({incharges.length} பதிவு)
                </span>
                <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  🔑 சூப்பர் கீ இயக்கப்பட்ட தளம்
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {lang === "ta" 
                  ? "மாவட்ட பொறுப்பாளர் பக்கங்கள் & ஒன்றிய / நகர நியமன மையம்"
                  : "District Executive Portals & Town / Union In-Charges"}
              </h1>
              <p className="text-xs text-amber-200 font-semibold mt-0.5">
                தமிழ்நாடு முழுவதும் உள்ள 38 மாவட்டங்களின் தலைவர், செயலாளர், பொருளாளர் மற்றும் நிர்வாகப் பொறுப்பாளர்கள் (கிளவுடில் நிரந்தரமாக சேமிக்கப்படும்)
              </p>
            </div>
          </div>

          {/* Quick Stats or Navigation Back */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshCloudData}
              disabled={isCloudSyncing}
              title="கிளவுட் தரவுத்தளத்திலிருந்து புதுப்பிக்கவும்"
              className="p-2.5 bg-stone-900/80 hover:bg-stone-800 text-amber-300 rounded-xl border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? "animate-spin text-amber-400" : ""}`} />
              <span className="hidden sm:inline">{isCloudSyncing ? "புதுப்பிக்கிறது..." : "கிளவுட் சிங்"}</span>
            </button>
            {activeView === "district_view" ? (
              <button
                onClick={() => setActiveView("directory")}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 border border-amber-400/40 cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-amber-300" />
                <span>{lang === "ta" ? "38 மாவட்டங்கள் பட்டியல்" : "All 38 Districts"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingPerson(null);
                    setRegSelectedDistrictCode(selectedDistrictCode || "CHE");
                    setRegCategory("district_leader");
                    setRegRole("மாவட்டத் தலைவர்");
                    setRegName("");
                    setRegNameEn("");
                    setRegTaluk("");
                    setRegPhone("");
                    setRegWhatsapp("");
                    setRegSameAsPhone(false);
                    setRegAltPhone("");
                    setRegAddress("");
                    setRegAadhaar("");
                    setRegExperienceYears("");
                    setRegUnitName(`${currentDistrictObj.ta} மாவட்ட தலைமை`);
                    setActiveView("district_view");
                    setDistrictSubTab("register_new");
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-amber-300"
                >
                  <Plus className="w-4 h-4 text-stone-950 stroke-[3]" />
                  <span>புதிய நிர்வாகி பதிவு</span>
                </button>
                <div className="bg-black/40 backdrop-blur-sm border border-amber-500/30 rounded-2xl px-4 py-2 text-center text-xs hidden sm:block">
                  <span className="text-stone-300 block text-[10px] font-bold">மொத்த பொறுப்பாளர்கள்:</span>
                  <span className="text-amber-400 font-black text-base">{incharges.length} நபர்கள்</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: 38 DISTRICTS DIRECTORY (38 மாவட்டங்கள் முழு பட்டியல்) */}
      {/* ========================================================================= */}
      {activeView === "directory" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          
          {/* Search & Zone Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ta" ? "மாவட்டம் / குறியீடு தேடுக..." : "Search District / Code..."}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Zone Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {[
                { id: "all", label: "அனைத்து மண்டலங்கள் (38)" },
                { id: "வடக்கு", label: "வடக்கு (North)" },
                { id: "தெற்கு", label: "தெற்கு (South)" },
                { id: "மேற்கு", label: "மேற்கு (West)" },
                { id: "கிழக்கு", label: "கிழக்கு (East)" },
                { id: "மத்திய", label: "மத்திய (Central)" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedZoneFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedZoneFilter === tab.id
                      ? "bg-[#b91c1c] text-white shadow"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shrink-0">
                🛡️
              </div>
              <div>
                <p className="font-extrabold text-stone-900">
                  மாநில தலைவர் & சூப்பர் அட்மின் முழு அதிகாரம் (State President & Super Admin Central Authority):
                </p>
                <p className="text-stone-700 font-semibold mt-0.5">
                  38 மாவட்ட பொறுப்பாளர்கள், நகர பொறுப்பாளர்கள், ஒன்றிய பொறுப்பாளர்கள், மண்டல பொறுப்பாளர்கள், மற்றும் மாநில பொறுப்பாளர்களை மாற்ற, நீக்க, எடிட் செய்ய சூப்பர் அட்மினுக்கும் மற்றும் மாநில தலைவருக்கும் நேரடி முழு அனுமதி உண்டு.
                </p>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  மாவட்ட அளவில் தலைவர், செயலாளர், பொருளாளர் தங்கள் மாவட்ட சூப்பர் கீயை உள்ளிட்டு பொறுப்பாளர்களைப் பதிவு செய்யலாம்.
                </p>
              </div>
            </div>

            <div className="text-stone-500 font-bold text-[11px] shrink-0 text-right">
              <div>காண்பிக்கப்படுவது: <span className="font-black text-[#b91c1c]">{filteredDistricts.length}</span> / 38 மாவட்டங்கள்</div>
              {hasCentralAuthority && (
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px]">
                  ✓ மைய அதிகாரம் திறக்கப்பட்டுள்ளது
                </span>
              )}
            </div>
          </div>

          {/* 38 Districts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDistricts.map((dist) => (
              <div
                key={dist.districtCode}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group hover:border-amber-400"
              >
                {/* Card Top */}
                <div className="p-4 border-b border-stone-100 bg-gradient-to-b from-stone-50 to-white">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#b91c1c] text-white flex items-center justify-center font-black text-xs shadow">
                        {dist.districtCode}
                      </div>
                      <div>
                        <h3 className="font-black text-base text-stone-900 group-hover:text-[#b91c1c] transition-colors leading-tight">
                          {dist.districtTa}
                        </h3>
                        <span className="text-[11px] font-bold text-stone-500">
                          {dist.districtEn} District
                        </span>
                      </div>
                    </div>
                    
                    <span className="bg-stone-100 text-stone-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-stone-200">
                      {dist.zone}
                    </span>
                  </div>

                  {/* Leadership Snapshot */}
                  <div className="space-y-1 text-xs pt-2">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="text-stone-500 text-[11px] font-semibold">தலைவர்:</span>
                      <span className="font-bold truncate max-w-[170px] text-stone-900">
                        {dist.presidentName || "நியமிக்கப்படவில்லை"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="text-stone-500 text-[11px] font-semibold">செயலாளர்:</span>
                      <span className="font-bold truncate max-w-[170px] text-stone-900">
                        {dist.secretaryName || "நியமிக்கப்படவில்லை"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="text-stone-500 text-[11px] font-semibold">பொருளாளர்:</span>
                      <span className="font-bold truncate max-w-[170px] text-stone-900">
                        {dist.treasurerName || "நியமிக்கப்படவில்லை"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Counts Badges */}
                <div className="px-4 py-2.5 bg-stone-50/70 border-b border-stone-100 grid grid-cols-3 gap-1 text-center text-[10px]">
                  <div className="bg-white p-1 rounded-lg border border-stone-200">
                    <span className="text-stone-500 block">மாவட்ட</span>
                    <span className="font-black text-stone-900">{dist.totalDistrictExecutives}</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg border border-stone-200">
                    <span className="text-stone-500 block">நகர</span>
                    <span className="font-black text-stone-900">{dist.totalTownInCharges}</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg border border-stone-200">
                    <span className="text-stone-500 block">ஒன்றிய</span>
                    <span className="font-black text-stone-900">{dist.totalUnionInCharges}</span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-3 bg-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>சூப்பர் கீ தயார்</span>
                  </div>

                  <button
                    onClick={() => handleOpenDistrictPage(dist.districtCode)}
                    className="px-3.5 py-1.5 bg-[#b91c1c] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <span>பக்கம் திறக்க</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DEDICATED DISTRICT PORTAL PAGE (தனித்தனி மாவட்டப் பக்கங்கள்) */}
      {/* ========================================================================= */}
      {activeView === "district_view" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          
          {/* Top District Switcher & Breadcrumb */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView("directory")}
                className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition-colors cursor-pointer"
                title="அனைத்து மாவட்டங்கள்"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-bold text-stone-400 block uppercase">
                  தமிழ்நாடு 38 மாவட்டங்கள் &gt; {currentDistrictObj.zone} மண்டலம்
                </span>
                <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <span>{currentDistrictObj.ta} மாவட்ட பொறுப்பாளர் பக்கம்</span>
                  <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-md font-extrabold border border-amber-300">
                    {selectedDistrictCode}
                  </span>
                </h2>
              </div>
            </div>

            {/* Switch District Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-stone-500 whitespace-nowrap">மாவட்டம் மாற்ற:</span>
              <select
                value={selectedDistrictCode}
                onChange={(e) => {
                  setSelectedDistrictCode(e.target.value);
                  setDistrictSubTab("leadership");
                }}
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-extrabold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {ALL_38_TAMILNADU_DISTRICTS.map((d) => (
                  <option key={d.code} value={d.code.toUpperCase()}>
                    {d.ta} ({d.en} - {d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* District Super Key Banner & Unlock Status */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-5 mb-6 shadow-xl border border-stone-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0 border ${
                  isDistrictKeyUnlocked 
                    ? "bg-emerald-600 text-white border-emerald-400" 
                    : "bg-amber-500 text-stone-950 border-amber-300"
                }`}>
                  {isDistrictKeyUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-white">
                      {currentDistrictObj.ta} மாவட்ட சூப்பர் கீ (District Super Key)
                    </span>
                    {hasCentralAuthority ? (
                      <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <ShieldCheck className="w-3 h-3 text-[#b91c1c]" />
                        {isSuperAdmin ? "சூப்பர் அட்மின் மைய அதிகாரம் (Super Admin Central Authority)" : "மாநில தலைவர் மைய அதிகாரம் (State President Central Authority)"}
                      </span>
                    ) : isDistrictKeyUnlocked ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3 h-3" />
                        நிர்வாக அணுகல் திறக்கப்பட்டது (Unlocked)
                      </span>
                    ) : (
                      <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        🔒 பூட்டப்பட்டுள்ளது
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {hasCentralAuthority
                      ? "சூப்பர் அட்மின் மற்றும் மாநில தலைவருக்கு 38 மாவட்டங்களின் அனைத்து பொறுப்பாளர்களையும் மாற்ற, நீக்க, எடிட் செய்ய முழு அதிகாரம் உண்டு."
                      : isDistrictKeyUnlocked
                      ? "மாவட்ட தலைவர், செயலாளர், பொருளாளர் ஆகியோர் பிற மாவட்ட, ஒன்றிய மற்றும் நகரப் பொறுப்பாளர்களைப் பதிவு செய்யலாம்."
                      : "பொறுப்பாளர்களை நியமித்து பதிவு செய்வதற்கு மாவட்ட தலைவர் / செயலாளர் / பொருளாளர் சூப்பர் கீயை உள்ளிடவும்."}
                  </p>
                </div>
              </div>

              {/* Unlock Input or Key Actions */}
              <div className="w-full md:w-auto">
                {isDistrictKeyUnlocked ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-black/60 px-3.5 py-2 rounded-xl border border-amber-500/40 text-xs font-mono font-bold text-amber-300 select-all flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentDistrictKeyRecord.superKey}</span>
                    </div>

                    <button
                      onClick={handleCopySuperKey}
                      className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-all cursor-pointer border border-stone-700"
                      title="சூப்பர் கீ நகலெடு"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleShareKeyWhatsApp}
                      className="p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer"
                      title="வாட்ஸ்அப்பில் தலைவருக்கு அனுப்பு"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {hasCentralAuthority && (
                      <button
                        onClick={handleRegenerateKey}
                        className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all cursor-pointer"
                        title="புதிய சாவி உருவாக்குக (Regenerate)"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleVerifyKey} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={districtKeyInput}
                      onChange={(e) => setDistrictKeyInput(e.target.value)}
                      placeholder="சூப்பர் கீ உள்ளிடவும்..."
                      className="px-3 py-2 bg-stone-950 border border-stone-600 rounded-xl text-xs font-mono font-bold text-amber-300 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      🔑 திறக்கவும்
                    </button>
                  </form>
                )}
                {keyErrorMsg && (
                  <p className="text-red-400 text-[11px] font-bold mt-1 text-right sm:text-left">
                    {keyErrorMsg}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* District Sub-Navigation Tabs */}
          <div className="flex border-b border-stone-200 overflow-x-auto scrollbar-none gap-2 mb-6 select-none">
            {[
              {
                id: "leadership",
                label: `மாவட்ட தலைமை (3)`,
                icon: Award,
                count: 3
              },
              {
                id: "district_executives",
                label: `மாவட்ட நிர்வாகிகள் (${districtData.districtExecutives.length})`,
                icon: Users,
                count: districtData.districtExecutives.length
              },
              {
                id: "district_wings",
                label: `சார்பு அணிகள் (${districtData.districtWings.length})`,
                icon: Flag,
                count: districtData.districtWings.length
              },
              {
                id: "town_incharges",
                label: `நகரப் பொறுப்பாளர்கள் (${districtData.townInCharges.length})`,
                icon: Building2,
                count: districtData.townInCharges.length
              },
              {
                id: "union_incharges",
                label: `ஒன்றியப் பொறுப்பாளர்கள் (${districtData.unionInCharges.length})`,
                icon: Layers,
                count: districtData.unionInCharges.length
              },
              {
                id: "register_new",
                label: "➕ புதிய நிர்வாகி பதிவு",
                icon: Plus,
                highlight: true
              },
              {
                id: "super_key",
                label: "🔑 சூப்பர் கீ மையம்",
                icon: Key
              }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = districtSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDistrictSubTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-extrabold rounded-t-2xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-white text-[#b91c1c] border-t-2 border-x border-[#b91c1c] shadow-sm -mb-px"
                      : tab.highlight
                      ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* SUB-TAB 1: DISTRICT LEADERSHIP (தலைவர், செயலாளர், பொருளாளர்) */}
          {/* ========================================================================= */}
          {districtSubTab === "leadership" && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{currentDistrictObj.ta} மாவட்ட தலைமை நிர்வாகிகள்:</strong> மாவட்டத் தலைவர், மாவட்டச் செயலாளர், மாவட்டப் பொருளாளர் ஆகியோர் மாநில தலைமையால் நியமிக்கப்பட்டு அங்கீகரிக்கப்பட்டுள்ளனர்.
                  </span>
                </div>

                {isDistrictKeyUnlocked && (
                  <button
                    onClick={() => {
                      setRegCategory("district_leader");
                      setRegRole("மாவட்டத் தலைவர்");
                      setDistrictSubTab("register_new");
                    }}
                    className="px-3 py-1.5 bg-[#b91c1c] text-white font-black rounded-xl text-xs shadow hover:bg-red-700 transition-all shrink-0 cursor-pointer"
                  >
                    தலைமை மாற்ற / சேர்க்க
                  </button>
                )}
              </div>

              {/* 3 Core Leader Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "மாவட்டத் தலைவர்",
                    roleTag: "District President",
                    person: districtData.leadership.president,
                    color: "border-red-500 from-red-50 to-white"
                  },
                  {
                    title: "மாவட்டச் செயலாளர்",
                    roleTag: "District Secretary",
                    person: districtData.leadership.secretary,
                    color: "border-amber-500 from-amber-50 to-white"
                  },
                  {
                    title: "மாவட்டப் பொருளாளர்",
                    roleTag: "District Treasurer",
                    person: districtData.leadership.treasurer,
                    color: "border-emerald-500 from-emerald-50 to-white"
                  }
                ].map((item, idx) => {
                  const p = item.person;
                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-3xl border-2 ${item.color} shadow-lg overflow-hidden flex flex-col justify-between`}
                    >
                      {/* Top Header */}
                      <div className="bg-stone-900 text-white p-4 text-center relative">
                        <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                          {item.roleTag}
                        </span>
                        <h3 className="text-base font-black text-amber-300 mt-1">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-stone-400">
                          {currentDistrictObj.ta} மாவட்டம்
                        </p>
                      </div>

                      {/* Photo & Details */}
                      {p ? (
                        <div className="p-5 flex flex-col items-center text-center flex-1">
                          <div className="relative mb-3">
                            <img
                              src={p.photoUrl || DEFAULT_EXEC_AVATARS[0]}
                              alt={p.name}
                              className="w-28 h-32 object-cover rounded-2xl border-2 border-stone-300 shadow-md bg-stone-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_EXEC_AVATARS[0];
                              }}
                            />
                            <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow border-2 border-white">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <h4 className="text-lg font-black text-stone-900">
                            {p.name}
                          </h4>
                          {p.nameEn && (
                            <p className="text-xs font-semibold text-stone-500">{p.nameEn}</p>
                          )}

                          <div className="w-full bg-stone-50 rounded-xl p-3 text-xs text-stone-700 space-y-1.5 mt-3 border border-stone-200 text-left">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <a href={`tel:${p.phone}`} className="font-bold text-stone-900 hover:text-[#b91c1c]">
                                {p.phone}
                              </a>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <span className="text-[11px] text-stone-600 line-clamp-2">
                                {p.address || "முகவரி பதிவு செய்யப்பட்டுள்ளது"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200">
                              <span className="text-stone-500 font-semibold">இரத்த வகை:</span>
                              <span className="font-black text-red-600">{p.bloodGroup || "O+"}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-stone-500">
                              <span>ஆணை எண்:</span>
                              <span className="font-mono font-bold text-stone-800">{p.appointmentOrderNo || "-"}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 flex flex-col items-center text-center flex-1 justify-center space-y-3">
                          <div className="w-20 h-20 rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400">
                            <Users className="w-10 h-10 stroke-1" />
                          </div>
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-extrabold text-[10px] border border-stone-200">
                              இன்னும் நியமிக்கப்படவில்லை
                            </span>
                            <p className="text-xs text-stone-500 mt-1.5">
                              {currentDistrictObj.ta} மாவட்டத்திற்கு {item.title} இன்னும் நியமிக்கப்படவில்லை.
                            </p>
                          </div>

                          {canManage ? (
                            <button
                              onClick={() => {
                                setEditingPerson(null);
                                setRegCategory("district_leader");
                                setRegRole(item.title);
                                setRegUnitName(`${currentDistrictObj.ta} மாவட்ட தலைமை`);
                                setDistrictSubTab("register_new");
                              }}
                              className="px-4 py-2 bg-[#b91c1c] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer mt-2 active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>இப்பொறுப்பாளரை நியமிக்க</span>
                            </button>
                          ) : (
                            <p className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                              நியமிக்க சூப்பர் கீயை உள்ளிடவும்
                            </p>
                          )}
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
                        {p ? (
                          <>
                            <button
                              onClick={() => setSelectedPersonForOrder(p)}
                              className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>நியமன ஆணை காண்க</span>
                            </button>

                            <a
                              href={`https://wa.me/${p.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer"
                              title="வாட்ஸ்அப்பில் தொடர்பு கொள்க"
                            >
                              <Share2 className="w-4 h-4" />
                            </a>

                            {canManage && (
                              <>
                                <button
                                  onClick={() => handleOpenEditInCharge(p)}
                                  className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-all cursor-pointer border border-amber-300"
                                  title="எடிட் / மாற்று"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleInitiateDeleteInCharge(p)}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all cursor-pointer border border-rose-200"
                                  title="பொறுப்பை நீக்குக"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full text-center text-[10px] text-stone-400 font-medium py-1">
                            பொறுப்பாளர் பதிவு காத்திருப்பில்
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 2: DISTRICT EXECUTIVES (மாவட்டப் பொறுப்பாளர்கள்) */}
          {/* ========================================================================= */}
          {districtSubTab === "district_executives" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
                <div>
                  <h3 className="font-black text-base text-stone-900">
                    {currentDistrictObj.ta} மாவட்டப் பொறுப்பாளர்கள் (District Level Executives)
                  </h3>
                  <p className="text-xs text-stone-500">
                    மாவட்ட துணைத் தலைவர்கள், இணைச் செயலாளர்கள், அணி அமைப்பாளர்கள்
                  </p>
                </div>

                {canManage && (
                  <button
                    onClick={() => {
                      setEditingPerson(null);
                      setRegCategory("district_executive");
                      setRegRole("மாவட்ட துணைத் தலைவர்");
                      setDistrictSubTab("register_new");
                    }}
                    className="px-4 py-2 bg-[#b91c1c] text-white font-black text-xs rounded-xl shadow hover:bg-red-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>புதிய மாவட்ட பொறுப்பாளர் சேர்க்க</span>
                  </button>
                )}
              </div>

              {districtData.districtExecutives.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                  <Users className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <h4 className="font-black text-base text-stone-700">இம்மாவட்டத்தில் பிற மாவட்ட பொறுப்பாளர்கள் இன்னும் நியமிக்கப்படவில்லை</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    சூப்பர் கீ அல்லது மாநில தலைமை அனுமதி மூலம் "புதிய பொறுப்பாளர் பதிவு" செய்து உடனடியாக நியமிக்கலாம்.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {districtData.districtExecutives.map((p) => (
                    <InChargeCard
                      key={p.id}
                      person={p}
                      canManage={canManage}
                      onViewOrder={() => setSelectedPersonForOrder(p)}
                      onEdit={() => handleOpenEditInCharge(p)}
                      onDelete={() => handleInitiateDeleteInCharge(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 3: TOWN IN-CHARGES (நகரப் பொறுப்பாளர்கள்) */}
          {/* ========================================================================= */}
          {districtSubTab === "town_incharges" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
                <div>
                  <h3 className="font-black text-base text-stone-900">
                    {currentDistrictObj.ta} நகரப் பொறுப்பாளர்கள் (Town / City In-Charges)
                  </h3>
                  <p className="text-xs text-stone-500">
                    மாவட்டத்தில் உள்ள அனைத்து நகரங்கள், நகராட்சிகள் மற்றும் பேரூராட்சிகளின் தலைவர்கள், செயலாளர்கள்
                  </p>
                </div>

                {canManage && (
                  <button
                    onClick={() => {
                      setEditingPerson(null);
                      setRegCategory("town_incharge");
                      setRegRole("நகரத் தலைவர்");
                      setDistrictSubTab("register_new");
                    }}
                    className="px-4 py-2 bg-[#b91c1c] text-white font-black text-xs rounded-xl shadow hover:bg-red-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>புதிய நகர பொறுப்பாளர் பதிவு</span>
                  </button>
                )}
              </div>

              {districtData.townInCharges.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                  <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <h4 className="font-black text-base text-stone-700">நகரப் பொறுப்பாளர்கள் இன்னும் பதிவு செய்யப்படவில்லை</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    சூப்பர் அட்மின், மாநில தலைவர் அல்லது மாவட்ட சூப்பர் கீ மூலம் புதிய நகரப் பொறுப்பாளர்களைப் பதிவு செய்யலாம்.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {districtData.townInCharges.map((p) => (
                    <InChargeCard
                      key={p.id}
                      person={p}
                      canManage={canManage}
                      onViewOrder={() => setSelectedPersonForOrder(p)}
                      onEdit={() => handleOpenEditInCharge(p)}
                      onDelete={() => handleInitiateDeleteInCharge(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 4: UNION IN-CHARGES (ஒன்றியப் பொறுப்பாளர்கள்) */}
          {/* ========================================================================= */}
          {districtSubTab === "union_incharges" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
                <div>
                  <h3 className="font-black text-base text-stone-900">
                    {currentDistrictObj.ta} ஒன்றியப் பொறுப்பாளர்கள் (Union / Block In-Charges)
                  </h3>
                  <p className="text-xs text-stone-500">
                    மாவட்டத்தில் உள்ள ஊராட்சி ஒன்றியங்கள் மற்றும் வட்டாரப் பொறுப்பாளர்கள்
                  </p>
                </div>

                {canManage && (
                  <button
                    onClick={() => {
                      setEditingPerson(null);
                      setRegCategory("union_incharge");
                      setRegRole("ஒன்றியச் செயலாளர்");
                      setDistrictSubTab("register_new");
                    }}
                    className="px-4 py-2 bg-[#b91c1c] text-white font-black text-xs rounded-xl shadow hover:bg-red-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>புதிய ஒன்றிய பொறுப்பாளர் பதிவு</span>
                  </button>
                )}
              </div>

              {districtData.unionInCharges.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                  <Layers className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <h4 className="font-black text-base text-stone-700">ஒன்றியப் பொறுப்பாளர்கள் இன்னும் பதிவு செய்யப்படவில்லை</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    சூப்பர் அட்மின், மாநில தலைவர் அல்லது மாவட்ட சூப்பர் கீ மூலம் ஒன்றியப் பொறுப்பாளர்களைப் பதிவு செய்யலாம்.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {districtData.unionInCharges.map((p) => (
                    <InChargeCard
                      key={p.id}
                      person={p}
                      canManage={canManage}
                      onViewOrder={() => setSelectedPersonForOrder(p)}
                      onEdit={() => handleOpenEditInCharge(p)}
                      onDelete={() => handleInitiateDeleteInCharge(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB: DISTRICT WINGS (மாவட்ட சார்பு அணிகள்) */}
          {/* ========================================================================= */}
          {districtSubTab === "district_wings" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
                <div>
                  <h3 className="font-black text-base text-stone-900">
                    {currentDistrictObj.ta} மாவட்ட சார்பு அணிகள் (District Wings & Cells)
                  </h3>
                  <p className="text-xs text-stone-500">
                    இளைஞரணி, மகளிரணி, தொழிலாளர் நலப் பிரிவு, சட்டப் பிரிவு, IT அணி மற்றும் பிற சார்பு அமைப்புகள்
                  </p>
                </div>

                {canManage && (
                  <button
                    onClick={() => {
                      setEditingPerson(null);
                      setRegCategory("district_wing");
                      setRegRole("மாவட்ட இளைஞரணி அமைப்பாளர்");
                      setRegUnitType("wing");
                      setRegUnitName(`${currentDistrictObj.ta} மாவட்ட இளைஞரணி`);
                      setDistrictSubTab("register_new");
                    }}
                    className="px-4 py-2 bg-[#b91c1c] text-white font-black text-xs rounded-xl shadow hover:bg-red-700 transition-all flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>புதிய சார்பு அணி பொறுப்பாளர் பதிவு</span>
                  </button>
                )}
              </div>

              {districtData.districtWings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                  <Flag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <h4 className="font-black text-base text-stone-700">சார்பு அணிப் பொறுப்பாளர்கள் இன்னும் பதிவு செய்யப்படவில்லை</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    சூப்பர் அட்மின், மாநில தலைவர் அல்லது மாவட்ட சூப்பர் கீ மூலம் சார்பு அணிப் பொறுப்பாளர்களைப் பதிவு செய்யலாம்.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {districtData.districtWings.map((p) => (
                    <InChargeCard
                      key={p.id}
                      person={p}
                      canManage={canManage}
                      onViewOrder={() => setSelectedPersonForOrder(p)}
                      onEdit={() => handleOpenEditInCharge(p)}
                      onDelete={() => handleInitiateDeleteInCharge(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 5: REGISTER NEW IN-CHARGE (புகைப்படத்துடன் கூடிய விரிவான பதிவு படிவம்) */}
          {/* ========================================================================= */}
          {districtSubTab === "register_new" && (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8">
              {/* Header */}
              <div className="border-b border-stone-200 pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      {ALL_38_TAMILNADU_DISTRICTS.find(d => d.code.toUpperCase() === (regSelectedDistrictCode || selectedDistrictCode).toUpperCase())?.ta || currentDistrictObj.ta} மாவட்டம்
                    </span>
                    <span className="bg-stone-900 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      அதிகாரப்பூர்வ நியமன மையம்
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900">
                    {editingPerson 
                      ? "பொறுப்பாளர் விவரங்களைத் திருத்துதல் (Edit Executive Profile)" 
                      : "புதிய மாவட்ட / நகர / ஒன்றிய / சார்பு அணி நிர்வாகி பதிவு"}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {editingPerson 
                      ? `${editingPerson.name} (${editingPerson.role}) அவர்களின் விவரங்களைப் புதுப்பிக்கவும்` 
                      : "38 மாவட்ட தலைமை, முதன்மை நிர்வாகிகள், சார்பு அணிகள், நகர, ஒன்றிய மற்றும் கிளைப் பொறுப்பாளர்களைப் பதிவு செய்யும் அதிகாரப்பூர்வ படிவம்"}
                  </p>
                </div>

                {!canManage && (
                  <div className="bg-red-50 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>பதிவு செய்ய மாவட்ட சூப்பர் கீ அல்லது மாநில தலைமை அனுமதி தேவை!</span>
                  </div>
                )}
              </div>

              {/* Form Success Message */}
              {formSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold mb-6 flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{formSuccessMsg}</span>
                  </div>
                  <button
                    onClick={() => setFormSuccessMsg(null)}
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-black cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Form Validation Error Message */}
              {formValidationError && (
                <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold mb-6 flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{formValidationError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormValidationError(null)}
                    className="text-rose-700 hover:text-rose-900 text-xs font-black cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleInitiateSubmitInCharge} className="space-y-6">
                
                {/* 1. District & Category Selection Block */}
                <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-4">
                  <div className="flex items-center gap-2 font-black text-xs text-amber-950 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <span>1. நியமன மாவட்டம் & நிர்வாகப் பிரிவு தேர்வு</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* District Dropdown (All 38 Districts) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        நிர்வாக மாவட்டம் (District) *
                      </label>
                      <select
                        value={regSelectedDistrictCode}
                        onChange={(e) => {
                          const newCode = e.target.value;
                          setRegSelectedDistrictCode(newCode);
                          const dObj = ALL_38_TAMILNADU_DISTRICTS.find(d => d.code === newCode);
                          if (dObj && (!regUnitName || regUnitName.includes("மாவட்டம்") || regUnitName.includes("பிரிவு"))) {
                            setRegUnitName(`${dObj.ta} மாவட்ட தலைமை`);
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-extrabold text-stone-900 focus:ring-2 focus:ring-amber-500 shadow-sm"
                      >
                        {ALL_38_TAMILNADU_DISTRICTS.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.ta} ({d.en}) - [{d.code}]
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-amber-800 font-semibold mt-1">
                        தமிழ்நாடு முழுவதும் உள்ள 38 மாவட்டங்களில் எந்த மாவட்டத்திற்கும் பதிவு செய்யலாம்.
                      </p>
                    </div>

                    {/* Category Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        நியமனப் பிரிவு (Administrative Category) *
                      </label>
                      <select
                        value={regCategory}
                        onChange={(e) => {
                          const val = e.target.value as InChargeCategory;
                          setRegCategory(val);
                          const dName = ALL_38_TAMILNADU_DISTRICTS.find(d => d.code === regSelectedDistrictCode)?.ta || currentDistrictObj.ta;
                          
                          if (val === "district_leader") {
                            setRegRole("மாவட்டத் தலைவர்");
                            setRegUnitType("district");
                            setRegUnitName(`${dName} மாவட்ட தலைமை`);
                          } else if (val === "district_executive") {
                            setRegRole("மாவட்ட துணைத் தலைவர்");
                            setRegUnitType("district");
                            setRegUnitName(`${dName} மாவட்ட செயற்குழு`);
                          } else if (val === "district_wing") {
                            setRegRole("மாவட்ட இளைஞரணி அமைப்பாளர்");
                            setRegUnitType("wing");
                            setRegUnitName(`${dName} மாவட்ட இளைஞரணி`);
                          } else if (val === "town_incharge") {
                            setRegRole("நகரத் தலைவர்");
                            setRegUnitType("town");
                            setRegUnitName(`${dName} நகரம்`);
                          } else if (val === "union_incharge") {
                            setRegRole("ஒன்றியச் செயலாளர்");
                            setRegUnitType("union");
                            setRegUnitName(`${dName} ஒன்றியம்`);
                          } else if (val === "branch_incharge") {
                            setRegRole("பேரூர் தலைவர்");
                            setRegUnitType("branch");
                            setRegUnitName(`${dName} பேரூர் கிளை`);
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-extrabold text-stone-900 focus:ring-2 focus:ring-amber-500 shadow-sm"
                      >
                        <option value="district_leader">⭐ மாவட்ட தலைமை (தலைவர் / செயலாளர் / பொருளாளர்)</option>
                        <option value="district_executive">🏛️ மாவட்ட முதன்மை நிர்வாகிகள் (துணைத் தலைவர் / அமைப்புச் செயலர்...)</option>
                        <option value="district_wing">🚩 மாவட்ட சார்பு அணிகள் (இளைஞரணி / மகளிரணி / IT அணி...)</option>
                        <option value="town_incharge">🏢 நகரப் பொறுப்பாளர்கள் (நகரத் தலைவர் / செயலாளர் / வார்டு...)</option>
                        <option value="union_incharge">🌾 ஒன்றியப் பொறுப்பாளர்கள் (ஒன்றியத் தலைவர் / செயலாளர்...)</option>
                        <option value="branch_incharge">🏡 பேரூர் / கிராமக் கிளைகள் (பேரூர் தலைவர் / கிளை அமைப்பாளர்...)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick-Pick Role Buttons (Pills) */}
                  <div>
                    <span className="text-[11px] font-extrabold text-stone-700 block mb-1.5">
                      விரைவுப் பதவி தேர்வு (கிளிக் செய்து உடனடியாக தேர்ந்தெடுக்கலாம்):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ROLE_PRESETS_BY_CATEGORY[regCategory]?.roles.map((presetRole) => (
                        <button
                          key={presetRole}
                          type="button"
                          onClick={() => setRegRole(presetRole)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            regRole === presetRole
                              ? "bg-amber-500 text-stone-950 border-amber-600 shadow-sm font-black scale-105"
                              : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100 hover:border-amber-400"
                          }`}
                        >
                          {presetRole}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Designation & Jurisdiction Block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      பதவி / பொறுப்புப் பெயர் (Designation Title) *
                    </label>
                    <input
                      type="text"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      placeholder="உதா: மாவட்டத் தலைவர் / நகரச் செயலாளர்"
                      required
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      பிரிவு வகை (Unit Jurisdiction Type) *
                    </label>
                    <select
                      value={regUnitType}
                      onChange={(e) => setRegUnitType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="district">மாவட்டம் முழுவதும் (Entire District)</option>
                      <option value="taluk">வட்டம் / தாலுகா (Taluk Level)</option>
                      <option value="town">நகரம் / நகராட்சி / பகுதி (Town/City/Ward)</option>
                      <option value="union">ஊராட்சி ஒன்றியம் / வட்டாரம் (Union/Block)</option>
                      <option value="wing">சார்பு அணி (Wing / Cell)</option>
                      <option value="branch">பேரூர் / கிராமக் கிளை (Branch / Panchayat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      தாலுகா / வட்டம் பெயர் (Taluk Name)
                    </label>
                    <input
                      type="text"
                      value={regTaluk}
                      onChange={(e) => setRegTaluk(e.target.value)}
                      placeholder="உதா: மதுரை வடக்கு / சேலம் மேற்கு / ஈரோடு"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      அலகு / பகுதி / அணியின் பெயர் (Unit / Section Name) *
                    </label>
                    <input
                      type="text"
                      value={regUnitName}
                      onChange={(e) => setRegUnitName(e.target.value)}
                      placeholder="உதா: மதுரை மேற்கு நகரம் / உசிலம்பட்டி ஒன்றியம் / மாவட்ட இளைஞரணி"
                      required
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 3. Personal & Contact Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-black text-xs text-stone-900 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-stone-600" />
                    <span>2. பொறுப்பாளர் தனிநபர் மற்றும் தொடர்பு விவரங்கள்</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        பொறுப்பாளர் பெயர் தமிழில் *
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="உதா: இரா. பாலகிருஷ்ணன்"
                        required
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        பெயர் ஆங்கிலத்தில் (Name in English)
                      </label>
                      <input
                        type="text"
                        value={regNameEn}
                        onChange={(e) => setRegNameEn(e.target.value)}
                        placeholder="e.g. R. Balakrishnan"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        கைபேசி எண் (Mobile Number) *
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          if (regSameAsPhone) setRegWhatsapp(e.target.value);
                        }}
                        placeholder="98400 12345"
                        required
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-stone-700">
                          வாட்ஸ்அப் எண் (WhatsApp)
                        </label>
                        <label className="flex items-center gap-1 text-[10px] text-stone-600 font-semibold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={regSameAsPhone}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setRegSameAsPhone(checked);
                              if (checked) setRegWhatsapp(regPhone);
                            }}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>கைபேசி எண்ணே</span>
                        </label>
                      </div>
                      <input
                        type="tel"
                        value={regWhatsapp}
                        onChange={(e) => setRegWhatsapp(e.target.value)}
                        disabled={regSameAsPhone}
                        placeholder="98400 12345"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        மாற்றுத் தொடர்பு எண் (Alternate Phone)
                      </label>
                      <input
                        type="tel"
                        value={regAltPhone}
                        onChange={(e) => setRegAltPhone(e.target.value)}
                        placeholder="உதா: 98400 67890"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ஆதார் எண் (Aadhaar No)
                      </label>
                      <input
                        type="text"
                        value={regAadhaar}
                        onChange={(e) => setRegAadhaar(e.target.value)}
                        placeholder="12 இலக்க ஆதார் எண்"
                        maxLength={12}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        இரத்த வகை (Blood Group)
                      </label>
                      <select
                        value={regBloodGroup}
                        onChange={(e) => setRegBloodGroup(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ஓவியத் தொழில் அனுபவம் (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={regExperienceYears}
                        onChange={(e) => setRegExperienceYears(e.target.value)}
                        placeholder="உதா: 15 ஆண்டுகள்"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Full Address */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      முழு முகவரி (Full Residential Address with Pincode) *
                    </label>
                    <textarea
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="கதவு எண், தெரு, கிராமம்/நகரம், தாலுகா, பின்கோடு..."
                      rows={2}
                      required
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 4. Official Appointment Credentials */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 font-black text-xs text-stone-900 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>3. அதிகாரப்பூர்வ நியமனச் சான்றிதழ் விவரங்கள்</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        நியமன தேதி (Appointment Date)
                      </label>
                      <input
                        type="date"
                        value={regAppointedDate}
                        onChange={(e) => setRegAppointedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        நியமித்த அதிகாரி / அதிகாரம் (Appointed By)
                      </label>
                      <input
                        type="text"
                        value={regAppointedBy}
                        onChange={(e) => setRegAppointedBy(e.target.value)}
                        placeholder="உதா: மாநில தலைமை / சூப்பர் அட்மின்"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        சிறப்பு பொறுப்புகள் / குறிப்புகள் (Portfolio / Notes)
                      </label>
                      <input
                        type="text"
                        value={regNotes}
                        onChange={(e) => setRegNotes(e.target.value)}
                        placeholder="உதா: உறுப்பினர் சேர்க்கை & பொதுக்குழு பொறுப்பாளர்"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Photo Upload Section */}
                <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
                  <label className="block text-xs font-black text-stone-900 mb-2">
                    📷 பொறுப்பாளர் பாஸ்போர்ட் புகைப்படம் (Official Photo Upload) *
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Live Preview */}
                    <div className="relative shrink-0">
                      <img
                        src={regPhotoUrl}
                        alt="Preview"
                        className="w-24 h-28 object-cover rounded-xl border-2 border-amber-500 shadow bg-white"
                      />
                      <span className="absolute -bottom-2 -right-2 bg-stone-900 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                        Live Photo
                      </span>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isCompressingPhoto}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow transition-all active:scale-95"
                        >
                          {isCompressingPhoto ? (
                            <>
                              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                              <span>படம் சுருக்கப்படுகிறது (Compressing)...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-amber-400" />
                              <span>கணினி / மொபைலில் இருந்து படம் பதிவேற்ற</span>
                            </>
                          )}
                        </button>

                        <span className="text-stone-400 text-xs">அல்லது மாதிரி படம் தேர்வு செய்க:</span>
                      </div>

                      {/* Default Avatar Selector */}
                      <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                        {DEFAULT_EXEC_AVATARS.map((avatar, i) => (
                          <img
                            key={i}
                            src={avatar}
                            alt={`Avatar ${i}`}
                            onClick={() => setRegPhotoUrl(avatar)}
                            className={`w-10 h-10 rounded-lg object-cover cursor-pointer border-2 transition-all shrink-0 ${
                              regPhotoUrl === avatar ? "border-[#b91c1c] scale-105 shadow" : "border-stone-300 hover:border-amber-400"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPerson(null);
                      setDistrictSubTab("leadership");
                    }}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    ரத்து செய்க
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#b91c1c] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>
                      {isSubmitting
                        ? "செயல்பாட்டில் உள்ளது..."
                        : editingPerson
                        ? "சரிபார்த்து மாற்றங்களை உறுதி செய் (Review & Update)"
                        : "சரிபார்த்து நியமனத்தை உறுதி செய் (Review & Appoint)"}
                    </span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 6: SUPER KEY MANAGEMENT (சூப்பர் கீ மையம்) */}
          {/* ========================================================================= */}
          {districtSubTab === "super_key" && (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {currentDistrictObj.ta} மாவட்ட பாதுகாப்பு மையம்
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  மாவட்ட சூப்பர் கீ மேலாண்மை & அனுமதி விவரங்கள்
                </h3>
                <p className="text-xs text-stone-500">
                  இம்மாவட்டத் தலைவர், செயலாளர் மற்றும் பொருளாளர் ஆகியோருக்கு மட்டுமே இந்த சாவி வழங்கப்பட வேண்டும்.
                </p>
              </div>

              {/* Super Key Display Card */}
              <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white p-6 rounded-2xl border-2 border-amber-500 shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-amber-400 text-xs font-bold block uppercase tracking-wider">
                      அதிகாரப்பூர்வ மாவட்ட சூப்பர் கீ:
                    </span>
                    <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider mt-1 select-all">
                      {currentDistrictKeyRecord.superKey}
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      உருவாக்கப்பட்ட தேதி: {new Date(currentDistrictKeyRecord.generatedAt).toLocaleDateString("ta-IN")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCopySuperKey}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey ? "நகலெடுக்கப்பட்டது!" : "சாவி நகலெடு"}</span>
                    </button>

                    <button
                      onClick={handleShareKeyWhatsApp}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>வாட்ஸ்அப்பில் அனுப்பு</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-800 text-xs text-stone-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    இந்த சூப்பர் கீயை உள்ளிடுவதன் மூலம் மாவட்ட தலைவர் மற்றும் நிர்வாகிகள் பிற மாவட்ட, ஒன்றிய மற்றும் நகரப் பொறுப்பாளர்களை உடனடியாக நியமிக்க முடியும்.
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-950 space-y-2">
                <h4 className="font-black text-sm text-stone-900">சூப்பர் கீ பயன்பாட்டு நெறிமுறைகள்:</h4>
                <p>1. இந்த சாவி மாவட்டத் தலைவர், மாவட்டச் செயலாளர், மாவட்டப் பொருளாளர் ஆகிய மூவருக்கும் பொதுவான நிர்வாக சாவியாகும்.</p>
                <p>2. இச்சாவியைப் பயன்படுத்தி உள்நுழைந்த பிறகு, அந்தந்த மாவட்ட எல்லைக்குட்பட்ட நகரப் பொறுப்பாளர்கள் மற்றும் ஒன்றியப் பொறுப்பாளர்களைப் பதிவு செய்யலாம்.</p>
                <p>3. மாவட்ட நிர்வாகிகள் மாறும்போது மாநில தலைமை மூலம் புதிய சூப்பர் கீயை உருவாக்கிக் கொள்ளலாம்.</p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Appointment Order & Badge Modal */}
      <DistrictAppointmentOrderModal
        person={selectedPersonForOrder}
        isOpen={!!selectedPersonForOrder}
        onClose={() => setSelectedPersonForOrder(null)}
        lang={lang}
      />

      {/* ========================================================================= */}
      {/* CONFIRMATION DIALOG: APPOINT / UPDATE EXECUTIVE (நியமன உறுதிப்படுத்தல்) */}
      {/* ========================================================================= */}
      {pendingAppointPerson && (
        <div 
          id="appoint-confirm-dialog-backdrop"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div 
            id="appoint-confirm-dialog-card"
            className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden my-6"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-5 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shrink-0 shadow">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      பாதுகாப்பு சரிபார்ப்பு
                    </span>
                    <span className="text-stone-300 text-xs font-semibold">
                      {editingPerson ? "விவர மாற்றம்" : "புதிய நியமனம்"}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black mt-0.5 text-white">
                    {editingPerson 
                      ? "பொறுப்பாளர் மாற்றத்தை உறுதி செய்க" 
                      : "புதிய பொறுப்பாளர் நியமனத்தை உறுதி செய்க"}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPendingAppointPerson(null)}
                disabled={isSubmitting}
                className="text-stone-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition cursor-pointer"
                title="மூடு"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-stone-700">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-amber-900 leading-relaxed font-medium">
                  கீழ்க்கண்ட விவரங்கள் மாவட்ட இணையதளத்திலும் மாநில அதிகாரப்பூர்வ ஆவணத்திலும் சேமிக்கப்படும். தயவுசெய்து ஒருமுறை சரிபார்க்கவும்.
                </p>
              </div>

              {/* In-Charge Details Review Card */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                  <img
                    src={pendingAppointPerson.photoUrl}
                    alt={pendingAppointPerson.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-black text-stone-900">{pendingAppointPerson.name}</h4>
                    {pendingAppointPerson.nameEn && (
                      <p className="text-stone-500 font-semibold">{pendingAppointPerson.nameEn}</p>
                    )}
                    <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#b91c1c] text-white font-black text-[10px]">
                      {pendingAppointPerson.role}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block font-semibold">மாவட்டம்:</span>
                    <span className="font-bold text-stone-800">{pendingAppointPerson.districtTa}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block font-semibold">நிர்வாகப் பிரிவு:</span>
                    <span className="font-bold text-stone-800">{pendingAppointPerson.unitName}</span>
                  </div>
                  {pendingAppointPerson.taluk && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-400 block font-semibold">வட்டம் (Taluk):</span>
                      <span className="font-bold text-stone-800">{pendingAppointPerson.taluk}</span>
                    </div>
                  )}
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block font-semibold">கைபேசி எண்:</span>
                    <span className="font-bold text-stone-800">{pendingAppointPerson.phone}</span>
                  </div>
                  {pendingAppointPerson.whatsapp && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-400 block font-semibold">வாட்ஸ்அப் எண்:</span>
                      <span className="font-bold text-emerald-700">{pendingAppointPerson.whatsapp}</span>
                    </div>
                  )}
                  {pendingAppointPerson.bloodGroup && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-stone-400 block font-semibold">இரத்த வகை:</span>
                      <span className="font-bold text-rose-700">{pendingAppointPerson.bloodGroup}</span>
                    </div>
                  )}
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200 col-span-2">
                    <span className="text-stone-400 block font-semibold">நியமன ஆணை எண்:</span>
                    <span className="font-mono font-bold text-stone-900">{pendingAppointPerson.appointmentOrderNo}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200 col-span-2">
                    <span className="text-stone-400 block font-semibold">முகவரி:</span>
                    <span className="font-medium text-stone-800">{pendingAppointPerson.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingAppointPerson(null)}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-white hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 transition cursor-pointer"
              >
                திரும்பச் சரிபார் (Back)
              </button>
              <button
                type="button"
                id="btn-confirm-appoint"
                onClick={handleConfirmAppoint}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#b91c1c] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>பதிவாகிறது...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>{editingPerson ? "உறுதியாக மாற்று (Confirm & Update)" : "உறுதியாக நியமி (Confirm Appointment)"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION DIALOG: DELETE / REMOVE EXECUTIVE (நீக்கல் உறுதிப்படுத்தல்) */}
      {/* ========================================================================= */}
      {pendingDeletePerson && (
        <div 
          id="delete-confirm-dialog-backdrop"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div 
            id="delete-confirm-dialog-card"
            className="bg-white rounded-3xl max-w-md w-full border border-rose-200 shadow-2xl overflow-hidden my-6"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-red-950 p-5 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      எச்சரிக்கை
                    </span>
                    <span className="text-rose-200 text-xs font-semibold">பொறுப்பு நீக்கம்</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black mt-0.5 text-white">
                    நிர்வாகி பொறுப்பை நீக்குதல்
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPendingDeletePerson(null);
                  setConfirmDeleteCheckbox(false);
                }}
                disabled={isDeleting}
                className="text-rose-200 hover:text-white p-1 rounded-xl hover:bg-white/10 transition cursor-pointer"
                title="மூடு"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-stone-700">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1.5 font-medium">
                <p className="font-bold flex items-center gap-1.5 text-rose-950">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>கவனம்: இப்பொறுப்பாளர் உடனடியாக நீக்கப்படுவார்!</span>
                </p>
                <p className="text-[11px] leading-relaxed text-rose-800">
                  இவரை நீக்கினால், மாவட்ட இணையதளப் பொறுப்பாளர்கள் பட்டியலிலிருந்து இவரது விபரம் மற்றும் நியமன ஆணை அகற்றப்படும்.
                </p>
              </div>

              {/* Person Summary */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center gap-3">
                <img
                  src={pendingDeletePerson.photoUrl}
                  alt={pendingDeletePerson.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-300 shadow-sm shrink-0"
                />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-stone-900">{pendingDeletePerson.name}</h4>
                  <div className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                    {pendingDeletePerson.role}
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    {pendingDeletePerson.districtTa} ({pendingDeletePerson.unitName})
                  </p>
                  <p className="text-stone-400 font-mono text-[10px]">
                    {pendingDeletePerson.appointmentOrderNo}
                  </p>
                </div>
              </div>

              {/* Safety Checkbox */}
              <label 
                id="lbl-confirm-delete-checkbox"
                className="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100/60 transition"
              >
                <input
                  type="checkbox"
                  id="confirm-delete-checkbox"
                  checked={confirmDeleteCheckbox}
                  onChange={(e) => setConfirmDeleteCheckbox(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-stone-800 leading-snug select-none">
                  ஆம், இந்த நிர்வாகியை அவரது பொறுப்பிலிருந்து முழுமையாக நீக்க நான் ஒப்புக்கொள்கிறேன்.
                </span>
              </label>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPendingDeletePerson(null);
                  setConfirmDeleteCheckbox(false);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-white hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 transition cursor-pointer"
              >
                ரத்து செய்க (Cancel)
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                onClick={handleConfirmDeleteInCharge}
                disabled={!confirmDeleteCheckbox || isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>நீக்கப்படுகிறது...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>நீக்குவதை உறுதி செய் (Confirm Delete)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-Component: In-Charge Card with Photo & Call Action
interface InChargeCardProps {
  key?: React.Key;
  person: DistrictInChargePerson;
  canManage: boolean;
  onViewOrder: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}

function InChargeCard({ person, canManage, onViewOrder, onEdit, onDelete }: InChargeCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between group hover:border-amber-400">
      <div>
        <div className="flex items-start gap-3 mb-3">
          {/* Photo */}
          <div className="relative shrink-0">
            <img
              src={person.photoUrl}
              alt={person.name}
              className="w-16 h-20 object-cover rounded-xl border border-stone-200 shadow-sm bg-stone-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_EXEC_AVATARS[0];
              }}
            />
            <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-0.5 rounded-full shadow">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <span className="bg-stone-100 text-stone-700 text-[10px] font-black px-2 py-0.5 rounded-md inline-block mb-1">
              {person.unitName}
            </span>
            <h4 className="font-black text-sm text-stone-900 truncate">
              {person.name}
            </h4>
            <div className="font-extrabold text-xs text-[#b91c1c]">
              {person.role}
            </div>
            <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
              {person.districtTa} மாவட்டம்
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-stone-50 rounded-xl p-2.5 text-[11px] text-stone-700 space-y-1 mb-3 border border-stone-200">
          <div className="flex items-center justify-between">
            <span className="text-stone-400 font-semibold">தொலைபேசி:</span>
            <a href={`tel:${person.phone}`} className="font-bold text-stone-900 hover:text-[#b91c1c]">
              {person.phone}
            </a>
          </div>
          {person.whatsapp && (
            <div className="flex items-center justify-between">
              <span className="text-stone-400 font-semibold">வாட்ஸ்அப்:</span>
              <a
                href={`https://wa.me/91${person.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>{person.whatsapp}</span>
              </a>
            </div>
          )}
          {person.taluk && (
            <div className="flex items-center justify-between">
              <span className="text-stone-400 font-semibold">வட்டம் / தாலுகா:</span>
              <span className="font-bold text-stone-800">{person.taluk}</span>
            </div>
          )}
          {person.experienceYears && (
            <div className="flex items-center justify-between">
              <span className="text-stone-400 font-semibold">ஓவிய அனுபவம்:</span>
              <span className="font-bold text-amber-800">{person.experienceYears} ஆண்டுகள்</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-stone-400 font-semibold">இரத்த வகை:</span>
            <span className="font-black text-red-600">{person.bloodGroup || "O+"}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-stone-400 font-semibold shrink-0">முகவரி:</span>
            <span className="font-semibold text-stone-600 text-right truncate">
              {person.address}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
        <button
          onClick={onViewOrder}
          className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>நியமன ஆணை</span>
        </button>

        <a
          href={`tel:${person.phone}`}
          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors"
          title="அழைக்க"
        >
          <Phone className="w-4 h-4" />
        </a>

        {person.whatsapp && (
          <a
            href={`https://wa.me/91${person.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`வணக்கம் ${person.name} அவர்களே, தமிழ்நாடு ஓவியர்கள் சங்கத்தில் இருந்து தொடர்பு கொள்கிறோம்.`)}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow transition-colors flex items-center justify-center"
            title="வாட்ஸ்அப் செய்தி"
          >
            <Share2 className="w-4 h-4" />
          </a>
        )}

        {canManage && (
          <>
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 hover:bg-amber-50 text-stone-500 hover:text-amber-700 rounded-xl transition-colors cursor-pointer border border-stone-200 hover:border-amber-300"
                title="எடிட் / மாற்று"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
              title="நீக்குக"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
