import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Download, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Building2,
  Sparkles,
  Award,
  Upload,
  FileUp,
  CheckCircle2,
  Loader2,
  Pencil,
  RotateCcw,
  Palette,
  Eye,
  Sliders,
  UserCheck,
  Radio,
  Share2,
  RefreshCw,
  Globe,
  Image as ImageIcon,
  FileText,
  Clock,
  X,
  Camera,
  Save,
  ExternalLink
} from "lucide-react";
import { MemberRegistration, UserAccount } from "../types";
import UnionOfficialIdCard from "./UnionOfficialIdCard";
import { MemberCardPaymentModal } from "./MemberCardPaymentModal";
import EditMemberIdCardModal, { MemberCardEditableData } from "./EditMemberIdCardModal";
import { ALL_38_TAMILNADU_DISTRICTS } from "../data/initialExecutives";
import { exportIdCardAsPDF, exportIdCardAsImages } from "../utils/idCardPdfExport";
import { getMemberCardRequestByMemberId } from "../utils/memberCardStorage";
import { formatMemberNumber, generateDistrictRegNumber } from "../utils/districtCodes";
import { storage, db } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { 
  saveRegistrationToFirestore, 
  saveUnionConfigToFirestore, 
  subscribeToUnionConfig,
  GlobalUnionConfig 
} from "../lib/syncService";

interface MemberIdCardPortalProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  registrations: MemberRegistration[];
  onUpdateRegistration?: (updated: MemberRegistration) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function MemberIdCardPortal({
  lang,
  currentUser,
  registrations = [],
  onUpdateRegistration,
  onAddAuditLog
}: MemberIdCardPortalProps) {
  // Check authorization: only Super Admin and State President can modify / edit ID cards
  const canEditIdCard = Boolean(
    currentUser && (
      currentUser.role === "super_admin" ||
      currentUser.role === "state_president" ||
      currentUser.isPrimarySuperAdmin
    )
  );
  const isSuperAdmin = canEditIdCard;

  const safeRegistrations = Array.isArray(registrations) ? registrations : [];

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    safeRegistrations.length > 0 ? safeRegistrations[0].id : "custom"
  );

  const [activeSubTab, setActiveSubTab] = useState<"id_card" | "application" | "directory_cards">("id_card");
  const [cardSide, setCardSide] = useState<"front" | "back" | "both">("both");
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [showLiveCustomizer, setShowLiveCustomizer] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // PDF Export & Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);
  const [generatedPdfResult, setGeneratedPdfResult] = useState<{ blobUrl: string; fileName: string } | null>(null);

  // Dynamic Editable state for instant interactive testing
  const [customName, setCustomName] = useState(currentUser?.name || "மு.பிரகாசம்");
  const [customFather, setCustomFather] = useState("சு. முனுசாமி");
  const [customOccupation, setCustomOccupation] = useState("பெயிண்டர் மற்றும் ஓவியர்");
  const [customDistrict, setCustomDistrict] = useState(currentUser?.district || "மதுரை");
  const [customPhone, setCustomPhone] = useState(currentUser?.phone || "9842189420");
  const [customBlood, setCustomBlood] = useState(currentUser?.bloodGroup || "O+");
  const [customRegNo, setCustomRegNo] = useState(currentUser?.regNumber || "4016");
  const [customAge, setCustomAge] = useState("38");
  const [customPlace, setCustomPlace] = useState("உத்தங்குடி");
  const [customAddress, setCustomAddress] = useState("1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107");
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>(
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500"
  );
  const [customEmblemUrl, setCustomEmblemUrl] = useState<string>("");
  const [customLogoUrl, setCustomLogoUrl] = useState<string>("");
  const [customWatermarkUrl, setCustomWatermarkUrl] = useState<string>(() => localStorage.getItem("tnpa_custom_watermark") || "");

  // Dedicated Edit Member Card Modal State (New Option)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingCardEdit, setIsSavingCardEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);
  const [editModalData, setEditModalData] = useState<MemberCardEditableData>({
    name: currentUser?.name || "மு.பிரகாசம்",
    fatherName: "சு. முனுசாமி",
    regNumber: currentUser?.regNumber || "4016",
    district: currentUser?.district || "மதுரை",
    phone: currentUser?.phone || "9842189420",
    bloodGroup: currentUser?.bloodGroup || "O+",
    age: "38",
    occupation: "பெயிண்டர் மற்றும் ஓவியர்",
    address: "1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107",
    photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500"
  });

  // Subscribe to global union config on mount to pull latest Super Admin logos and emblem
  useEffect(() => {
    const unsub = subscribeToUnionConfig((cfg: GlobalUnionConfig) => {
      if (cfg.customLogoUrl) setCustomLogoUrl(cfg.customLogoUrl);
      if (cfg.customEmblemUrl) setCustomEmblemUrl(cfg.customEmblemUrl);
      if (cfg.sampleIdCardData && selectedMemberId === "custom") {
        if (cfg.sampleIdCardData.name) setCustomName(cfg.sampleIdCardData.name);
        if (cfg.sampleIdCardData.fatherName) setCustomFather(cfg.sampleIdCardData.fatherName);
        if (cfg.sampleIdCardData.occupation) setCustomOccupation(cfg.sampleIdCardData.occupation);
        if (cfg.sampleIdCardData.district) setCustomDistrict(cfg.sampleIdCardData.district);
        if (cfg.sampleIdCardData.phone) setCustomPhone(cfg.sampleIdCardData.phone);
        if (cfg.sampleIdCardData.bloodGroup) setCustomBlood(cfg.sampleIdCardData.bloodGroup);
        if (cfg.sampleIdCardData.regNumber) setCustomRegNo(cfg.sampleIdCardData.regNumber);
        if (cfg.sampleIdCardData.age) setCustomAge(cfg.sampleIdCardData.age);
        if (cfg.sampleIdCardData.address) {
          setCustomAddress(cfg.sampleIdCardData.address);
          setCustomPlace(cfg.sampleIdCardData.address);
        }
        if (cfg.sampleIdCardData.photoUrl) setCustomPhotoUrl(cfg.sampleIdCardData.photoUrl);
      }
    });
    return () => unsub();
  }, [selectedMemberId]);

  const currentMember = safeRegistrations.find(r => r && r.id === selectedMemberId);

  // Derived effective values
  const memberName = currentMember ? currentMember.name : customName;
  const memberFather = currentMember ? (currentMember.fatherName || customFather) : customFather;
  const memberOccupation = currentMember ? (currentMember.occupation || customOccupation) : customOccupation;
  const memberDistrict = currentMember ? currentMember.district : customDistrict;
  const memberPhone = currentMember ? currentMember.phone : customPhone;
  const memberBlood = currentMember ? (currentMember.bloodGroup || customBlood) : customBlood;
  const rawRegNo = currentMember ? (currentMember.regNumber || customRegNo) : customRegNo;
  const memberRegNo = rawRegNo ? formatMemberNumber(rawRegNo, memberDistrict) : generateDistrictRegNumber(memberDistrict);
  const memberAge = currentMember ? (currentMember.age || customAge) : customAge;
  const memberPlace = currentMember ? (currentMember.address || customPlace) : customPlace;
  const memberAddress = currentMember ? (currentMember.address || customAddress) : customAddress;
  const memberPhoto = currentMember?.photoUrl || customPhotoUrl;

  const handleMemberSelect = (val: string) => {
    setSelectedMemberId(val);
    const mem = safeRegistrations.find(r => r && r.id === val);
    if (mem) {
      setCustomName(mem.name);
      if (mem.fatherName) setCustomFather(mem.fatherName);
      if (mem.district) setCustomDistrict(mem.district);
      if (mem.phone) setCustomPhone(mem.phone);
      if (mem.bloodGroup) setCustomBlood(mem.bloodGroup);
      if (mem.regNumber) setCustomRegNo(mem.regNumber);
      if (mem.age) setCustomAge(String(mem.age));
      if (mem.occupation) setCustomOccupation(mem.occupation);
      if (mem.photoUrl) setCustomPhotoUrl(mem.photoUrl);
      if (mem.address) {
        setCustomPlace(mem.address);
        setCustomAddress(mem.address);
      }
    }
  };

  const handleResetDefaults = () => {
    setSelectedMemberId("custom");
    setCustomName("மு.பிரகாசம்");
    setCustomFather("சு. முனுசாமி");
    setCustomOccupation("பெயிண்டர் மற்றும் ஓவியர்");
    setCustomDistrict("மதுரை");
    setCustomPhone("9842189420");
    setCustomBlood("O+");
    setCustomRegNo("4016");
    setCustomAge("38");
    setCustomPlace("உத்தங்குடி");
    setCustomAddress("1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107");
    setCustomPhotoUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500");
    setCustomEmblemUrl("");
    setCustomLogoUrl("");
  };

  // ============================================================================
  // NEW OPTION: OPEN EDIT MEMBER ID CARD MODAL
  // ============================================================================
  const handleOpenEditModal = (memberToEdit?: MemberRegistration) => {
    if (memberToEdit) {
      setSelectedMemberId(memberToEdit.id);
      handleMemberSelect(memberToEdit.id);
      setEditModalData({
        name: memberToEdit.name || "",
        fatherName: memberToEdit.fatherName || "",
        regNumber: memberToEdit.regNumber || "",
        district: memberToEdit.district || "மதுரை",
        phone: memberToEdit.phone || "",
        bloodGroup: memberToEdit.bloodGroup || "O+",
        age: String(memberToEdit.age || "38"),
        occupation: memberToEdit.occupation || "பெயிண்டர் மற்றும் ஓவியர்",
        address: memberToEdit.address || "",
        photoUrl: memberToEdit.photoUrl || customPhotoUrl
      });
    } else {
      setEditModalData({
        name: memberName,
        fatherName: memberFather,
        regNumber: rawRegNo,
        district: memberDistrict,
        phone: memberPhone,
        bloodGroup: memberBlood,
        age: String(memberAge),
        occupation: memberOccupation,
        address: memberAddress,
        photoUrl: memberPhoto
      });
    }
    setIsEditModalOpen(true);
  };

  // ============================================================================
  // NEW OPTION: SAVE EDITED MEMBER ID CARD DETAILS
  // ============================================================================
  const handleSaveMemberCardEdit = async (updatedData: MemberCardEditableData) => {
    setIsSavingCardEdit(true);
    try {
      // 1. Update local custom state
      setCustomName(updatedData.name);
      setCustomFather(updatedData.fatherName);
      setCustomRegNo(updatedData.regNumber);
      setCustomDistrict(updatedData.district);
      setCustomPhone(updatedData.phone);
      setCustomBlood(updatedData.bloodGroup);
      setCustomAge(updatedData.age);
      setCustomOccupation(updatedData.occupation);
      setCustomAddress(updatedData.address);
      setCustomPlace(updatedData.address);
      setCustomPhotoUrl(updatedData.photoUrl);

      // 2. If editing registered member, update registration in state and Firestore
      const targetMember = currentMember || safeRegistrations.find(r => r && r.id === selectedMemberId);
      if (targetMember) {
        const updatedMem: MemberRegistration = {
          ...targetMember,
          name: updatedData.name,
          fatherName: updatedData.fatherName,
          regNumber: updatedData.regNumber,
          district: updatedData.district,
          phone: updatedData.phone,
          bloodGroup: updatedData.bloodGroup,
          age: String(updatedData.age),
          occupation: updatedData.occupation,
          address: updatedData.address,
          photoUrl: updatedData.photoUrl
        };
        if (onUpdateRegistration) {
          onUpdateRegistration(updatedMem);
        }
        await saveRegistrationToFirestore(updatedMem);
      }

      // 3. Update global union config sample data so changes persist across devices
      await saveUnionConfigToFirestore({
        customLogoUrl,
        customEmblemUrl,
        sampleIdCardData: {
          name: updatedData.name,
          fatherName: updatedData.fatherName,
          occupation: updatedData.occupation,
          district: updatedData.district,
          phone: updatedData.phone,
          bloodGroup: updatedData.bloodGroup,
          regNumber: updatedData.regNumber,
          age: updatedData.age,
          address: updatedData.address,
          photoUrl: updatedData.photoUrl
        },
        updatedBy: currentUser?.name || "Admin"
      });

      onAddAuditLog(
        "Edit Member ID Card",
        `Successfully edited ID card details for: ${updatedData.name} (${updatedData.regNumber}, ${updatedData.district})`
      );

      setIsEditModalOpen(false);
      setEditSuccessMsg(
        lang === "ta"
          ? "✅ உறுப்பினர் அடையாள அட்டை விவரங்கள் வெற்றிகரமாக திருத்தப்பட்டு அட்டையில் மாற்றப்பட்டது!"
          : "✅ Member ID card details successfully updated on the card!"
      );
      setTimeout(() => setEditSuccessMsg(null), 6000);
    } catch (error) {
      console.error("Error saving member card edit:", error);
      alert(lang === "ta" ? "சேமிப்பதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்." : "Error saving updates. Please try again.");
    } finally {
      setIsSavingCardEdit(false);
    }
  };

  // BROADCAST & PUBLISH ALL CHANGES LIVE TO EVERY USER DOWNLOADING THE APP
  const handlePublishLiveToAllUsers = async () => {
    if (!canEditIdCard) {
      alert(
        lang === "ta"
          ? "⚠️ உறுப்பினர் அட்டையை திருத்துவது மற்றும் மாற்றுவது சூப்பர் அட்மின் மற்றும் மாநிலத் தலைவருக்கு மட்டுமே அனுமதி உண்டு!"
          : "⚠️ Only Super Admin and State President are authorized to edit and modify ID cards!"
      );
      return;
    }
    setIsPublishing(true);
    try {
      if (currentMember) {
        const updatedMem: MemberRegistration = {
          ...currentMember,
          name: memberName,
          fatherName: memberFather,
          occupation: memberOccupation,
          district: memberDistrict,
          phone: memberPhone,
          bloodGroup: memberBlood,
          regNumber: memberRegNo,
          age: String(memberAge),
          address: memberAddress,
          photoUrl: memberPhoto
        };
        await saveRegistrationToFirestore(updatedMem);
        if (onUpdateRegistration) {
          onUpdateRegistration(updatedMem);
        }
      }

      // Also save global ID card settings so all devices see the updated logo & emblem & sample config
      await saveUnionConfigToFirestore({
        customLogoUrl,
        customEmblemUrl,
        sampleIdCardData: {
          name: customName,
          fatherName: customFather,
          occupation: customOccupation,
          district: customDistrict,
          phone: customPhone,
          bloodGroup: customBlood,
          regNumber: customRegNo,
          age: customAge,
          address: customAddress,
          photoUrl: customPhotoUrl
        },
        updatedBy: currentUser?.name || "Super Admin"
      });

      onAddAuditLog(
        "Live Sync ID Card to All Users",
        `Super Admin published real-time ID card and member details update globally to all connected app users & devices.`
      );

      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);
    } catch (err) {
      console.warn("Publish error:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (side === "front") {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    if (!currentMember) return;

    const setUploading = side === "front" ? setUploadingFront : setUploadingBack;
    setUploading(true);

    try {
      const storageRef = ref(storage, `id_cards/${currentMember.id}_${side}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const docRef = doc(db, "registrations", currentMember.id);
      const updateData = side === "front" ? { cardFrontUrl: downloadUrl } : { cardBackUrl: downloadUrl };
      await updateDoc(docRef, updateData);

      const updatedMember = {
        ...currentMember,
        ...(side === "front" ? { cardFrontUrl: downloadUrl } : { cardBackUrl: downloadUrl })
      };

      if (onUpdateRegistration) {
        onUpdateRegistration(updatedMember);
      }

      onAddAuditLog(
        `Upload ID Card (${side})`,
        `Successfully uploaded and stored ID card ${side} image for ${currentMember.name} via Firebase Storage`
      );

      alert(
        lang === "ta"
          ? `✅ அடையாள அட்டை ${side === "front" ? "முன்பக்க" : "பின்பக்க"} படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!`
          : `✅ ID card ${side} image uploaded successfully!`
      );
    } catch (error) {
      console.warn("Storage upload error, using local state:", error);
    } finally {
      setUploading(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
    onAddAuditLog("Print Member ID Card", `Printed official ID card for: ${memberName}`);
  };

  // Check payment approval status
  const currentMemberKey = currentMember?.regNumber || currentMember?.id || customRegNo || "custom";
  const existingPaymentRequest =
    getMemberCardRequestByMemberId(currentMemberKey) ||
    (currentMember?.regNumber ? getMemberCardRequestByMemberId(currentMember.regNumber) : null) ||
    (currentMember?.id ? getMemberCardRequestByMemberId(currentMember.id) : null);

  // Payment / authorization status - All registered members and officials can download their official ID cards directly
  const isPaymentApproved = true;

  const handleDownloadPdf = async () => {
    if (!isPaymentApproved) {
      setShowPaymentModal(true);
      return;
    }

    setIsGeneratingPdf(true);
    setPdfStatusMessage("அடையாள அட்டை PDF தயார் செய்யப்படுகிறது...");

    const originalSide = cardSide;
    if (cardSide !== "both") {
      setCardSide("both");
      // Wait for DOM to render both sides properly
      await new Promise((r) => setTimeout(r, 250));
    }

    try {
      const success = await exportIdCardAsPDF({
        memberName: memberName,
        memberId: memberRegNo,
        district: memberDistrict,
        frontElementId: "union-id-card-front",
        backElementId: "union-id-card-back",
        onProgress: (msg) => setPdfStatusMessage(msg),
        onSuccess: (result) => {
          setGeneratedPdfResult({ blobUrl: result.blobUrl, fileName: result.fileName });
        }
      });

      if (success) {
        onAddAuditLog("Download ID Card PDF", `Downloaded high-res PDF for ${memberName} (${memberRegNo})`);
        setTimeout(() => {
          setIsGeneratingPdf(false);
          setPdfStatusMessage("✅ PDF தயார்! போனில் தானாக திறக்கப்படவில்லை எனில் கீழே உள்ள பொத்தானைப் பயன்படுத்தவும்.");
        }, 800);
      } else {
        setIsGeneratingPdf(false);
        setPdfStatusMessage("❌ PDF உருவாக்கத்தில் பிழை. நேரடியாக அச்சிடவும்.");
      }
    } catch (err) {
      console.error("PDF export error:", err);
      setIsGeneratingPdf(false);
      setPdfStatusMessage("❌ பிழை ஏற்பட்டது.");
    } finally {
      if (originalSide !== "both") {
        setCardSide(originalSide);
      }
    }
  };

  const handleDownloadPngs = async () => {
    if (!isPaymentApproved) {
      setShowPaymentModal(true);
      return;
    }

    setIsGeneratingPdf(true);
    setPdfStatusMessage("PNG படங்கள் தயார் செய்யப்படுகிறது...");

    const originalSide = cardSide;
    if (cardSide !== "both") {
      setCardSide("both");
      await new Promise((r) => setTimeout(r, 150));
    }

    try {
      await exportIdCardAsImages({
        memberName: memberName,
        memberId: memberRegNo,
        frontElementId: "union-id-card-front",
        backElementId: "union-id-card-back",
        onProgress: (msg) => setPdfStatusMessage(msg)
      });
      onAddAuditLog("Download ID Card PNGs", `Downloaded Front & Back PNGs for ${memberName}`);
    } catch (err) {
      console.error("PNG export error:", err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfStatusMessage(null);
      if (originalSide !== "both") {
        setCardSide(originalSide);
      }
    }
  };

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* Real-time Global Synchronization Header Banner */}
      <div className="bg-emerald-900/90 text-emerald-100 px-4 py-2.5 rounded-2xl border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold text-white">
            {lang === "ta" 
              ? "🟢 நேரலை சர்வர் ஒத்திசைவு (Live Cloud Sync Active)" 
              : "🟢 Live Real-Time Multi-Device Sync Active"}
          </span>
          <span className="hidden sm:inline text-emerald-200">
            • {lang === "ta" 
                ? "சூப்பர் அட்மின் மாற்றும் ஐடி கார்டு & உறுப்பினர் விவரங்கள் உடனடியாக அனைத்து பயனர்களுக்கும் தெரியும்." 
                : "All Super Admin ID card updates propagate instantly to every user downloading this app."}
          </span>
        </div>

        <button
          onClick={handlePublishLiveToAllUsers}
          disabled={isPublishing}
          className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Globe className="w-3.5 h-3.5" />
          )}
          <span>{lang === "ta" ? "அனைவருக்கும் நேரலையாகப் பதிவேற்று (Sync Live)" : "Broadcast to All Users"}</span>
        </button>
      </div>

      {publishSuccess && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>
            {lang === "ta" 
              ? "✅ சூப்பர் அட்வின் மாற்றங்கள் வெற்றிகரமாக சேமிக்கப்பட்டு இந்த ஆப்பை பயன்படுத்தும் அனைவருக்கும் உடனே தெரிவுபடுத்தப்பட்டது!" 
              : "✅ Updates published globally! Visible immediately to all users downloading/using this app."}
          </span>
        </div>
      )}

      {editSuccessMsg && (
        <div className="bg-emerald-700 text-white p-4 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-3 shadow-xl border-2 border-emerald-400 animate-pulse">
          <CheckCircle2 className="w-6 h-6 text-yellow-300 shrink-0" />
          <span>{editSuccessMsg}</span>
        </div>
      )}

      {/* Top Main Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#C00000] via-stone-900 to-[#111111] text-white p-6 md:p-8 shadow-2xl border-2 border-[#C00000]/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-yellow-400/40 rounded-full text-xs text-yellow-300 font-extrabold shadow-sm">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>{lang === "ta" ? "அதிகாரப்பூர்வ சங்க அடையாள அட்டை வடிவமைப்பு" : "Official Union Membership ID Card Generator"}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide">
              தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
            </h1>
            
            <p className="text-stone-300 text-xs md:text-sm max-w-2xl leading-relaxed font-medium">
              {lang === "ta"
                ? "அரசு பதிவு எண் TNMDUJCLM DUTU-50-26-00044 • இரு பக்கங்களும் கொண்ட நேரடி அட்டை வடிவமைப்பு மற்றும் மொபைல் ஃபைல் மேனேஜர் புகைப்பட மாற்றம்."
                : "Official Membership ID Card Layout with Side-by-Side Front and Back Dynamic Previews & Instant Device File Manager Uploads."}
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab("id_card")}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "id_card"
                  ? "bg-yellow-400 text-stone-950 shadow-xl scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{lang === "ta" ? "🪪 அடையாள அட்டை (ID Card)" : "🪪 ID Card"}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("application")}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "application"
                  ? "bg-yellow-400 text-stone-950 shadow-xl scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span>📄 {lang === "ta" ? "விண்ணப்ப படிவம்" : "Application"}</span>
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveSubTab("directory_cards")}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
                  activeSubTab === "directory_cards"
                    ? "bg-yellow-400 text-stone-950 shadow-xl scale-105"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <span>👥 {lang === "ta" ? "உறுப்பினர்கள் பட்டியல்" : "Manage All"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SUB-TAB 1: DIGITAL ID CARD VIEW (SIDE-BY-SIDE PREVIEW & CONTROLS) */}
      {/* ================================================================= */}
      {activeSubTab === "id_card" && (
        <div className="space-y-8">
          
          {/* Quick Action & View Control Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Member Selector Dropdown */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <UserCheck className="w-5 h-5 text-[#C00000] shrink-0" />
              <div className="flex-1">
                <label className="text-[11px] font-black text-stone-600 block uppercase">
                  {lang === "ta" ? "உறுப்பினர் தேர்வு / முன்மாதிரி:" : "Select Member / Sample Record:"}
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleMemberSelect(e.target.value)}
                  className="mt-0.5 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-black text-stone-900 focus:outline-none focus:border-[#C00000] w-full sm:w-80 cursor-pointer"
                >
                  <option value="custom">✨ {lang === "ta" ? "மு.பிரகாசம் (மாதிரி அட்டை / Editable Sample)" : "M. Prakasam (Editable Sample)"}</option>
                  {safeRegistrations.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.district} - {m.regNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Mode Switcher (Both / Front / Back) */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
              
              {/* NEW OPTION: DEDICATED EDIT MEMBER ID CARD BUTTON */}
              <button
                id="btn-edit-member-id-card"
                onClick={() => handleOpenEditModal()}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-stone-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border-2 border-yellow-300 active:scale-95 shrink-0"
                title={lang === "ta" ? "உறுப்பினர் அடையாள அட்டை விவரங்களைத் திருத்த புதிய ஆப்ஷன்" : "New option to edit member ID card details"}
              >
                <Pencil className="w-4 h-4 text-stone-950" />
                <span>{lang === "ta" ? "✏️ அட்டை விவரங்களைத் திருத்து" : "✏️ Edit Member Card"}</span>
              </button>

              <div className="bg-stone-100 p-1 rounded-2xl flex gap-1 border border-stone-200">
                <button
                  onClick={() => setCardSide("both")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    cardSide === "both" ? "bg-[#C00000] text-white shadow-md" : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  {lang === "ta" ? "இரு பக்கங்களும் (Side-by-Side)" : "Both Sides"}
                </button>
                <button
                  onClick={() => setCardSide("front")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    cardSide === "front" ? "bg-[#C00000] text-white shadow-md" : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  {lang === "ta" ? "முன்பக்கம் (Front)" : "Front"}
                </button>
                <button
                  onClick={() => setCardSide("back")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    cardSide === "back" ? "bg-[#C00000] text-white shadow-md" : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  {lang === "ta" ? "பின்பக்கம் (Back)" : "Back"}
                </button>
              </div>

              {/* Toggle Live Customizer Form (Authorized Super Admin & State President only) */}
              {canEditIdCard && (
                <button
                  onClick={() => setShowLiveCustomizer(!showLiveCustomizer)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                    showLiveCustomizer ? "bg-stone-900 text-yellow-400 border-stone-900" : "bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showLiveCustomizer ? (lang === "ta" ? "படிவத்தை மறை" : "Hide Form") : (lang === "ta" ? "நேரடி திருத்தம்" : "Edit Live")}</span>
                </button>
              )}

              {/* Print & PDF & PNG Download Buttons */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2 bg-gradient-to-r from-[#C00000] to-[#800000] hover:from-red-700 hover:to-red-900 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-yellow-400/50 active:scale-95 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                ) : (
                  <Download className="w-4 h-4 text-yellow-300" />
                )}
                <span>{lang === "ta" ? "📥 PDF பதிவிறக்கம்" : "📥 Download PDF"}</span>
              </button>

              <button
                onClick={handleDownloadPngs}
                disabled={isGeneratingPdf}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-yellow-300 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-yellow-500/40 active:scale-95 disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4 text-yellow-300" />
                <span>{lang === "ta" ? "🖼️ PNG படங்கள்" : "🖼️ PNG Images"}</span>
              </button>

              <button
                onClick={handlePrintCard}
                className="px-3.5 py-2 bg-stone-900 hover:bg-black text-yellow-400 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-stone-700 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === "ta" ? "அச்சிடு" : "Print"}</span>
              </button>
            </div>

          </div>

          {/* Progress Toast */}
          {pdfStatusMessage && (
            <div className="p-3 bg-amber-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{pdfStatusMessage}</span>
              </div>
            </div>
          )}

          {/* Persistent Open PDF Card Banner */}
          {generatedPdfResult && (
            <div className="p-3.5 bg-emerald-900 border-2 border-emerald-400 text-white rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-black">
                  ✓
                </div>
                <div>
                  <h4 className="font-black text-xs text-yellow-300">
                    {lang === "ta" ? "அடையாள அட்டை PDF தயார்!" : "ID Card PDF Ready!"}
                  </h4>
                  <p className="text-[11px] text-emerald-100">
                    {lang === "ta" ? "கோப்பை நேரடியாக திறக்க கீழே உள்ள பொத்தானை அழுத்தவும்" : "Click below to view or save the PDF file"}
                  </p>
                </div>
              </div>
              <a
                href={generatedPdfResult.blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={generatedPdfResult.fileName}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-4 h-4 text-stone-950" />
                <span>{lang === "ta" ? "📂 கோப்பைத் திறக்க (Open PDF)" : "📂 Open PDF File"}</span>
              </a>
            </div>
          )}

          {/* COLOR PALETTE & SPECIFICATION BADGE */}
          <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#C00000]" />
              <span className="font-black text-stone-800">வண்ண அமைப்பு (Official Union Theme):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-stone-200 shadow-sm">
                <span className="w-3 h-3 rounded-full bg-[#C00000] border border-black/20" />
                <span>Primary Red: #C00000</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-stone-200 shadow-sm">
                <span className="w-3 h-3 rounded-full bg-[#FFFFFF] border border-black/20" />
                <span>Background: #FFFFFF</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-stone-200 shadow-sm">
                <span className="w-3 h-3 rounded-full bg-[#800000] border border-black/20" />
                <span>Dark Red: #800000</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-stone-200 shadow-sm">
                <span className="w-3 h-3 rounded-full bg-[#000000] border border-black/20" />
                <span>Text: #000000</span>
              </span>
            </div>
          </div>

          {/* DEDICATED ID CARD HEADER & QUICK EDIT BAR */}
          <div className="w-full max-w-4xl mx-auto bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-3.5 sm:p-4 rounded-2xl border-2 border-stone-700 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C00000] text-white flex items-center justify-center font-black shadow text-base shrink-0">
                🪪
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-sm text-yellow-400">{memberName}</h3>
                  <span className="text-[11px] font-mono bg-stone-950 px-2 py-0.5 rounded text-stone-200 font-bold border border-stone-700">
                    {memberRegNo}
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-medium">
                  {memberDistrict} • {memberOccupation} • {memberBlood}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-direct-edit-card"
                onClick={() => handleOpenEditModal()}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer border border-yellow-300 active:scale-95"
                title="உறுப்பினர் அடையாள அட்டை விவரங்களை திருத்துவதற்கு புதிய ஆப்ஷன்"
              >
                <Pencil className="w-4 h-4 text-stone-950" />
                <span>{lang === "ta" ? "✏️ அட்டையைத் திருத்து" : "✏️ Edit Card"}</span>
              </button>

              <label className="px-3.5 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-stone-600 active:scale-95">
                <Camera className="w-3.5 h-3.5 text-yellow-400" />
                <span>{lang === "ta" ? "படம் மாற்று" : "Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "front")}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* DYNAMIC TWO PREVIEW CARDS (SIDE-BY-SIDE) */}
          <div className="w-full flex justify-center py-4">
            <UnionOfficialIdCard
              currentUser={currentUser}
              isEditable={canEditIdCard}
              member={{
                id: currentMember?.id || "member_1",
                name: memberName,
                fatherName: memberFather,
                regNumber: memberRegNo,
                district: memberDistrict,
                occupation: memberOccupation,
                photoUrl: memberPhoto,
                bloodGroup: memberBlood,
                age: memberAge,
                phone: memberPhone,
                place: memberPlace,
                address: memberAddress
              }}
              side={cardSide}
              customLogoUrl={customLogoUrl}
              customLogoLeftUrl={customLogoUrl}
              customLogoRightUrl={customLogoUrl}
              customGovtSealUrl={customEmblemUrl}
              customWatermarkUrl={customWatermarkUrl}
              onUpdatePhoto={(newPhotoUrl) => {
                setCustomPhotoUrl(newPhotoUrl);
                if (currentMember) {
                  currentMember.photoUrl = newPhotoUrl;
                }
                onAddAuditLog("Update Member Card Photo", `Updated official card photo for: ${memberName}`);
              }}
              onUpdateGovtSeal={(newSealUrl) => {
                setCustomEmblemUrl(newSealUrl);
                onAddAuditLog("Update Govt Seal", `Updated official Tamil Nadu govt seal on member ID cards`);
              }}
              onUpdateLogo={(newLogoUrl) => {
                setCustomLogoUrl(newLogoUrl);
                onAddAuditLog("Update Association Logo", `Updated association logo on member ID cards`);
              }}
              onUpdateLogoLeft={(newLogoUrl) => {
                setCustomLogoUrl(newLogoUrl);
                onAddAuditLog("Update Association Logo", `Updated left association logo on member ID cards`);
              }}
              onUpdateLogoRight={(newLogoUrl) => {
                setCustomLogoUrl(newLogoUrl);
                onAddAuditLog("Update Association Logo", `Updated right association logo on member ID cards`);
              }}
              onUpdateWatermark={(newWatermarkUrl) => {
                setCustomWatermarkUrl(newWatermarkUrl);
                localStorage.setItem("tnpa_custom_watermark", newWatermarkUrl);
                onAddAuditLog("Update Watermark", `Updated ID card watermark image from device`);
              }}
            />
          </div>

          {/* DEDICATED OFFICIAL DOWNLOAD HUB & PAYMENT VERIFICATION CARD */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-700/80 pb-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>அதிகாரப்பூர்வ அட்டை பதிவிறக்கம் & அச்சிடுதல் மையம்</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  உறுப்பினர் அடையாள அட்டை (PDF & PNG) பதிவிறக்கம்
                </h3>
                <p className="text-xs sm:text-sm text-stone-300">
                  சங்கத்தின் தரநிலைகளுக்கு ஏற்ப துல்லியமான அளவு (CR80 Standard ID Card Ratio) மற்றும் உயர்தர பிரிண்டிங் தெளிவுடன் (300 DPI) உடனடியாகப் பதிவிறக்கம் செய்யலாம்.
                </p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isPaymentApproved ? (
                  <div className="px-4 py-2 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl text-emerald-300 text-xs font-black flex items-center gap-2 shadow-inner">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>கார்டு அப்ரூவல் முடிந்தது (Ready to Download)</span>
                  </div>
                ) : existingPaymentRequest?.status === "district_approved" ? (
                  <div className="px-4 py-2 bg-amber-500/20 border-2 border-amber-400 rounded-2xl text-amber-300 text-xs font-black flex items-center gap-2 shadow-inner">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>சூப்பர் அட்மின் இறுதி ஒப்புதலுக்குக் காத்திருக்கிறது</span>
                  </div>
                ) : existingPaymentRequest?.status === "pending" ? (
                  <div className="px-4 py-2 bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl text-yellow-300 text-xs font-black flex items-center gap-2 shadow-inner">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span>கட்டண சரிபார்ப்பு நிலுவையில் உள்ளது</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-red-500/20 border-2 border-red-400 rounded-2xl text-red-300 text-xs font-black flex items-center gap-2 shadow-inner">
                    <CreditCard className="w-4 h-4 text-red-400" />
                    <span>₹100 கட்டணம் & ஒப்புதல் தேவை</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              
              {/* Button 1: Download High-Res PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="py-4 px-5 bg-gradient-to-r from-[#C00000] to-[#900000] hover:from-red-600 hover:to-red-800 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer border-2 border-yellow-400/60 active:scale-95 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-300" />
                ) : (
                  <Download className="w-5 h-5 text-yellow-300" />
                )}
                <span>📥 PDF அட்டை பதிவிறக்கம்</span>
              </button>

              {/* Button 2: Download Front & Back PNGs */}
              <button
                type="button"
                onClick={handleDownloadPngs}
                disabled={isGeneratingPdf}
                className="py-4 px-5 bg-stone-800 hover:bg-stone-700 text-yellow-400 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-stone-600 active:scale-95 disabled:opacity-50"
              >
                <ImageIcon className="w-5 h-5 text-yellow-400" />
                <span>🖼️ முன்பின் படங்கள் (PNG)</span>
              </button>

              {/* Button 3: Direct Print */}
              <button
                type="button"
                onClick={handlePrintCard}
                className="py-4 px-5 bg-white hover:bg-stone-100 text-stone-950 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-stone-300 active:scale-95"
              >
                <Printer className="w-5 h-5 text-[#C00000]" />
                <span>🖨️ நேரடி பிரிண்ட் (Print)</span>
              </button>

            </div>

            {/* Hint message if user needs to pay */}
            {!isPaymentApproved && (
              <div className="bg-amber-500/10 border border-amber-400/30 p-3.5 rounded-2xl text-xs text-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    அடையாள அட்டையைப் பதிவிறக்கம் செய்ய ₹100 ஜிபே (Google Pay / PhonePe) கட்டணம் செலுத்தி, UTR எண்ணை உள்ளிடவும். மாவட்ட மற்றும் சூப்பர் அட்மின் ஒப்புதல் அளித்தவுடன் உடனடியாக பதிவிறக்கம் செய்துகொள்ளலாம்.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-stone-950 rounded-xl font-black text-xs shrink-0 cursor-pointer shadow-sm"
                >
                  கட்டணம் செலுத்த
                </button>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* INTERACTIVE LIVE CUSTOMIZER / FIELD EDITOR PANEL                */}
          {/* =============================================================== */}
          {canEditIdCard && showLiveCustomizer && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-200 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-[#C00000]" />
                    <h3 className="text-base font-black text-stone-900">
                      {lang === "ta" ? "நேரடி அடையாள அட்டை தரவு திருத்தம் (Live Dynamic Editor)" : "Live Dynamic ID Card Editor"}
                    </h3>
                  </div>
                  <p className="text-stone-500 text-xs">
                    {lang === "ta"
                      ? "கீழே உள்ள புலங்களை மாற்றியவுடன் மேலேயுள்ள அடையாள அட்டை உடனடியாக புதுப்பிக்கப்படும். புகைப்படத்தை மாற்ற அட்டையிலுள்ள பென்சில் ஐகானைத் தொடவும்."
                      : "Type in any field to see instant real-time updates on both Front and Back cards. Click the pencil icon on the card to open your device file manager."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-stone-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "மீட்டமை (Reset)" : "Reset Defaults"}</span>
                </button>
              </div>

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                {/* 1. Member Number (உறுப்பினர் எண்) */}
                <div className="space-y-1">
                  <label className="font-black text-stone-700 block">
                    உறுப்பினர் எண் (Member No) :
                  </label>
                  <input
                    type="text"
                    value={customRegNo}
                    onChange={(e) => setCustomRegNo(e.target.value)}
                    placeholder="எ.கா: 4016 அல்லது TN-MDU-4016"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
                  />
                </div>

                {/* 2. Member Name (உறுப்பினர் பெயர்) */}
                <div className="space-y-1">
                  <label className="font-black text-stone-700 block">
                    உறுப்பினர் பெயர் (Member Name) :
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="எ.கா: மு.பிரகாசம்"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
                  />
                </div>

                {/* 3. Member Profession (உறுப்பினர் தொழில்) */}
                <div className="space-y-1">
                  <label className="font-black text-stone-700 block">
                    உறுப்பினர் தொழில் (Occupation) :
                  </label>
                  <input
                    type="text"
                    value={customOccupation}
                    onChange={(e) => setCustomOccupation(e.target.value)}
                    placeholder="எ.கா: பெயிண்டர் மற்றும் ஓவியர்"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
                  />
                </div>

                {/* 4. Father's Name (தந்தை பெயர்) */}
                <div className="space-y-1">
                  <label className="font-black text-stone-700 block">
                    தந்தை பெயர் (Father's Name) :
                  </label>
                  <input
                    type="text"
                    value={customFather}
                    onChange={(e) => setCustomFather(e.target.value)}
                    placeholder="எ.கா: சு. முனுசாமி"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
                  />
                </div>

                {/* 5. Age (வயது) */}
                <div className="space-y-1">
                  <label className="font-black text-stone-700 block">
                    வயது (Age) :
                  </label>
                  <input
                    type="text"
                    value={customAge}
                    onChange={(e) => setCustomAge(e.target.value)}
                    placeholder="எ.கா: 38"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
                  />
                </div>

                {/* 6. Blood Group (இரத்த வகை) */}
                <div className="space-y-1">
                  <label className="font-black text-stone-700 block">
                    இரத்த வகை (Blood Group) :
                  </label>
                  <select
                    value={customBlood}
                    onChange={(e) => setCustomBlood(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] cursor-pointer"
                  >
                    <option value="O+">O+ (பாசிட்டிவ்)</option>
                    <option value="O-">O- (நெகட்டிவ்)</option>
                    <option value="A+">A+ (பாசிட்டிவ்)</option>
                    <option value="A-">A- (நெகட்டிவ்)</option>
                    <option value="B+">B+ (பாசிட்டிவ்)</option>
                    <option value="B-">B- (நெகட்டிவ்)</option>
                    <option value="AB+">AB+ (பாசிட்டிவ்)</option>
                    <option value="AB-">AB- (நெகட்டிவ்)</option>
                  </select>
                </div>

                {/* 7. Location (இருப்பிடம் / முகவரி) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-black text-stone-700 block">
                    இருப்பிடம் / முழு முகவரி (Location / Address) :
                  </label>
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => {
                      setCustomAddress(e.target.value);
                      setCustomPlace(e.target.value);
                    }}
                    placeholder="எ.கா: 1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
                  />
                </div>

                {/* 8. Phone Number (தொடர்பு எண்) */}
                <div className="space-y-1">
                  <label className="font-black text-stone-700 block">
                    தொடர்பு எண் (Phone Number) :
                  </label>
                  <input
                    type="tel"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    placeholder="எ.கா: 9842189420"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000]"
                  />
                </div>

              </div>

              {/* Direct Device File Manager Upload Buttons */}
              <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Photo File Manager Trigger */}
                <label className="p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border-2 border-dashed border-[#C00000]/40 flex items-center gap-3 cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#C00000] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-xs text-stone-900 block">
                      📁 உறுப்பினர் புகைப்படம்
                    </span>
                    <span className="text-[10px] text-stone-500">
                      மொபைல் கேலரி / ஃபைல்
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "front")}
                    className="hidden"
                  />
                </label>

                {/* 2. Emblem File Manager Trigger */}
                <label className="p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border-2 border-dashed border-emerald-600/40 flex items-center gap-3 cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-xs text-stone-900 block">
                      🏛️ அரசு முத்திரை சின்னம்
                    </span>
                    <span className="text-[10px] text-stone-500">
                      முத்திரை படம் பதிவேற்ற
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setCustomEmblemUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {/* 3. Association Logo Trigger */}
                <label className="p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border-2 border-dashed border-stone-400 flex items-center gap-3 cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-yellow-400 flex items-center justify-center shrink-0 shadow-md">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-xs text-stone-900 block">
                      🎨 சங்க லோகோ மாற்றம்
                    </span>
                    <span className="text-[10px] text-stone-500">
                      புதிய லோகோ தேர்வு
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setCustomLogoUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {/* 4. Center Watermark Trigger */}
                <label className="p-4 bg-amber-50/80 hover:bg-amber-100/90 rounded-2xl border-2 border-dashed border-amber-500/60 flex items-center gap-3 cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-xs text-stone-900 block">
                      🖼️ நடு வாட்டர்மார்க்
                    </span>
                    <span className="text-[10px] text-stone-600">
                      {customWatermarkUrl ? "✓ மாற்றப்பட்டது" : "போனிலிருந்து தேர்வு"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const res = reader.result as string;
                          setCustomWatermarkUrl(res);
                          localStorage.setItem("tnpa_custom_watermark", res);
                          onAddAuditLog("Update Watermark", "Updated ID card watermark image from device");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-TAB 2: OFFICIAL APPLICATION FORM VIEW                        */}
      {/* ================================================================= */}
      {activeSubTab === "application" && (
        <div className="bg-white p-6 md:p-10 rounded-3xl border-2 border-stone-200 shadow-xl max-w-4xl mx-auto space-y-8">
          
          <div className="text-center border-b border-stone-200 pb-6 space-y-2">
            <div className="flex justify-center items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#C00000] text-white flex items-center justify-center font-black text-lg shadow-md">
                TN
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-stone-900 leading-tight">
                  தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
                </h2>
                <span className="text-xs font-bold text-stone-500">TN PA² STATE WELFARE UNION</span>
              </div>
            </div>
            <p className="text-stone-600 text-xs font-bold">
              பதிவு அலுவலகம்: எண் 1/14, அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107 | அரசு பதிவு எண்: TNMDUJCLMDUTU-50-26-00044
            </p>
            <h3 className="text-sm md:text-base font-black text-[#C00000] pt-2">
              உறுப்பினர் சேர்க்கை & அடையாள அட்டை விண்ணப்பப் படிவம் (Official Membership Application)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">உறுப்பினர் முழு பெயர் (Member Name):</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberName}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">உறுப்பினர் எண் (Registration No):</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-mono font-black text-[#C00000]">
                {memberRegNo}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">தந்தை பெயர் (Father's Name):</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberFather}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">தொழில் (Occupation):</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberOccupation}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">வயது (Age):</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberAge} ஆண்டுகள்
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">இரத்த வகை (Blood Group):</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-[#C00000]">
                {memberBlood}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">கைபேசி எண் (Mobile Phone):</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-mono font-black text-stone-900">
                {memberPhone}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 font-bold uppercase">மாவட்டம் & இருப்பிடம்:</span>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-900">
                {memberDistrict} ({memberAddress})
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-xs space-y-3">
            <h4 className="font-black text-stone-900">உறுப்பினர் உறுதிமொழி & பிரகடனம்:</h4>
            <p className="text-stone-700 leading-relaxed font-medium">
              “நான் தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் (TNPA²) சட்டதிட்டங்களை முழுமையாக ஏற்றுக்கொள்கிறேன். சங்கத்தின் வளர்ச்சிக்கும், உறுப்பினர்களின் நலனுக்கும் முழு ஒத்துழைப்பு நல்குவேன் என உறுதி அளிக்கிறேன்.”
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-stone-200 text-xs">
            <div className="text-center space-y-2">
              <div className="h-10 border-b border-stone-400 w-40 mx-auto" />
              <span className="font-bold text-stone-700">உறுப்பினர் கையொப்பம்</span>
            </div>

            <button
              onClick={handlePrintCard}
              className="px-6 py-3 bg-[#C00000] hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>விண்ணப்பத்தைப் பிரிண்ட் செய் (Print PDF)</span>
            </button>

            <div className="text-center space-y-2">
              <div className="h-10 border-b border-stone-400 w-40 mx-auto" />
              <span className="font-bold text-stone-700">மாநில பொதுச்செயலாளர் முத்திரை</span>
            </div>
          </div>

        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-TAB 3: MANAGE ALL ID CARDS                                    */}
      {/* ================================================================= */}
      {activeSubTab === "directory_cards" && isSuperAdmin && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                {lang === "ta" ? "அனைத்து உறுப்பினர்களின் அடையாள அட்டை மேலாண்மை" : "Manage All Members ID Cards"}
              </h3>
              <p className="text-stone-400 text-xs">
                {safeRegistrations.length} {lang === "ta" ? "பதிவு பெற்ற உறுப்பினர்கள்" : "Registered Members"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeRegistrations.filter(Boolean).map((mem) => (
              <div key={mem.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={mem.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150"} alt="" className="h-12 w-12 rounded-xl object-cover border border-[#C00000] shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-black text-stone-900 text-xs truncate">{mem.name}</h4>
                    <p className="text-stone-500 text-[11px] truncate">{mem.district} • {mem.regNumber}</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ID Card Ready</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      handleOpenEditModal(mem);
                    }}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    title={lang === "ta" ? "அட்டை திருத்து" : "Edit ID Card"}
                  >
                    <Pencil className="w-3 h-3" />
                    <span>{lang === "ta" ? "திருத்து" : "Edit"}</span>
                  </button>

                  <button
                    onClick={() => {
                      handleMemberSelect(mem.id);
                      setActiveSubTab("id_card");
                    }}
                    className="px-3 py-1.5 bg-[#C00000] text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-all shrink-0 cursor-pointer"
                  >
                    {lang === "ta" ? "அட்டை காண்க" : "View ID"}
                  </button>

                  <button
                    onClick={() => {
                      handleMemberSelect(mem.id);
                      setActiveSubTab("id_card");
                      setTimeout(() => {
                        handleDownloadPdf();
                      }, 400);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
                    title={lang === "ta" ? "PDF அட்டை பதிவிறக்கம்" : "Download PDF ID Card"}
                  >
                    <Download className="w-3 h-3 text-yellow-300" />
                    <span>{lang === "ta" ? "டவுன்லோடு" : "Download"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBER CARD ₹100 PAYMENT & DUAL-APPROVAL MODAL */}
      <MemberCardPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        member={{
          id: currentMember?.id || selectedMemberId || "custom",
          name: memberName,
          nameEn: currentMember?.nameEn || "",
          regNumber: memberRegNo,
          district: memberDistrict,
          phone: memberPhone,
          photoUrl: memberPhoto
        }}
        isSuperAdmin={isSuperAdmin}
        onApprovedDownload={handleDownloadPdf}
        lang={lang}
      />

      {/* NEW DEDICATED EDIT MEMBER ID CARD MODAL */}
      <EditMemberIdCardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lang={lang}
        initialData={editModalData}
        onSave={handleSaveMemberCardEdit}
        isSaving={isSavingCardEdit}
      />

    </div>
  );
}
