import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  Users, 
  Clock,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { DistrictWhatsAppGroup, WhatsAppConsentStatus } from "../types";

interface DistrictWhatsAppJoinModalProps {
  lang: "ta" | "en";
  isOpen: boolean;
  onClose: () => void;
  memberDetails: {
    id: string;
    name: string;
    phone: string;
    district: string;
    role?: string;
    regNumber?: string;
  };
  onConsentRecorded?: (status: WhatsAppConsentStatus, inviteLink?: string, groupName?: string) => void;
}

export default function DistrictWhatsAppJoinModal({
  lang,
  isOpen,
  onClose,
  memberDetails,
  onConsentRecorded
}: DistrictWhatsAppJoinModalProps) {
  const [step, setStep] = useState<"ask_consent" | "group_ready" | "no_group">("ask_consent");
  const [loading, setLoading] = useState<boolean>(false);
  const [group, setGroup] = useState<DistrictWhatsAppGroup | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkOpened, setLinkOpened] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && memberDetails.district) {
      setStep("ask_consent");
      setLinkOpened(false);
      setErrorMessage(null);
      fetchDistrictGroup(memberDetails.district);
    }
  }, [isOpen, memberDetails.district]);

  const fetchDistrictGroup = async (dist: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/whatsapp-groups/district/${encodeURIComponent(dist)}`);
      const data = await res.json();
      if (data.success && data.available && data.group) {
        setGroup(data.group);
      } else {
        setGroup(null);
      }
    } catch (err) {
      console.error("Error fetching district WhatsApp group:", err);
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAcceptConsent = async () => {
    setLoading(true);
    setErrorMessage(null);

    // Re-verify group availability
    if (!group) {
      setStep("no_group");
      setLoading(false);
      // Record status as NOT_ASKED / Attempted
      recordConsentOnServer("NOT_ASKED", "", "");
      return;
    }

    setStep("group_ready");
    setLoading(false);

    // Record initial ACCEPTED status on server
    await recordConsentOnServer("ACCEPTED", group.inviteLink, group.groupName);
    if (onConsentRecorded) {
      onConsentRecorded("ACCEPTED", group.inviteLink, group.groupName);
    }
  };

  const handleDeclineConsent = async () => {
    setLoading(true);
    await recordConsentOnServer("DECLINED", "", "");
    if (onConsentRecorded) {
      onConsentRecorded("DECLINED");
    }
    setLoading(false);
    onClose();
  };

  const handleOpenWhatsAppLink = async () => {
    if (!group || !group.inviteLink) return;

    setLinkOpened(true);

    // Send JOIN_LINK_OPENED consent event to server
    await recordConsentOnServer("JOIN_LINK_OPENED", group.inviteLink, group.groupName);
    if (onConsentRecorded) {
      onConsentRecorded("JOIN_LINK_OPENED", group.inviteLink, group.groupName);
    }

    // Direct browser / WhatsApp app redirect fallback
    const inviteUrl = group.inviteLink.startsWith("http")
      ? group.inviteLink
      : `https://${group.inviteLink}`;

    window.open(inviteUrl, "_blank", "noopener,noreferrer");
  };

  const recordConsentOnServer = async (
    status: WhatsAppConsentStatus, 
    inviteLinkShown: string, 
    groupName: string
  ) => {
    try {
      await fetch("/api/whatsapp-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: memberDetails.id,
          memberName: memberDetails.name,
          memberPhone: memberDetails.phone,
          district: memberDetails.district,
          memberRole: memberDetails.role || "Member",
          regNumber: memberDetails.regNumber || "",
          consentStatus: status,
          inviteLinkShown,
          groupName
        })
      });
    } catch (err) {
      console.error("Failed to record consent on server:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-stone-800 max-w-lg w-full overflow-hidden text-stone-900 my-auto">
        
        {/* Header with TNPA & WhatsApp Branding */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white p-5 flex items-center justify-between border-b-2 border-emerald-950">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/30 border border-emerald-300 flex items-center justify-center text-white shrink-0 shadow-inner">
              <MessageSquare className="w-7 h-7 text-emerald-200 fill-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {lang === "ta" ? "TNPA மாவட்ட வாட்ஸ்அப் குழு" : "TNPA District WhatsApp Group"}
              </h3>
              <p className="text-xs text-emerald-200 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                {lang === "ta" ? "அதிகாரப்பூர்வ மாவட்ட இணைப்புகள்" : "Official District Connection Portal"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-900/50 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Member Details Brief Bar */}
        <div className="bg-stone-100 p-3.5 px-5 border-b border-stone-200 text-xs text-stone-700 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-stone-900">
            <User className="w-3.5 h-3.5 text-emerald-700" />
            <span>{memberDetails.name}</span>
            {memberDetails.regNumber && (
              <span className="bg-stone-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-stone-800">
                {memberDetails.regNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <span className="flex items-center gap-1 font-semibold text-emerald-800">
              <MapPin className="w-3.5 h-3.5" />
              {memberDetails.district}
            </span>
            <span className="text-stone-400">|</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {memberDetails.phone}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-stone-600">
                {lang === "ta" ? "மாவட்ட வாட்ஸ்அப் குழு விபரங்கள் சரிபார்க்கப்படுகின்றன..." : "Verifying district WhatsApp group credentials..."}
              </p>
            </div>
          ) : step === "ask_consent" ? (
            /* STEP 1: CONSENT QUESTION */
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-stone-900 mb-1">
                  {lang === "ta" ? "வாட்ஸ்அப் குழு ஒப்புதல்" : "WhatsApp Group Invitation Consent"}
                </h4>
                <p className="text-sm font-semibold text-emerald-900 leading-relaxed">
                  “உங்கள் மாவட்டத்திற்கான TNPA WhatsApp குழுவில் இணைய விரும்புகிறீர்களா?”
                </p>
                <p className="text-xs text-stone-600 mt-2">
                  {lang === "ta" 
                    ? "உங்களின் மாவட்ட சங்கம், நலவாரிய அறிவிப்புகள் மற்றும் அவசர தகவல்களை நேரடியாக வாட்ஸ்அப் வழியாகப் பெற இணைந்திடுங்கள்." 
                    : "Receive instant official announcements, welfare notices, and event updates directly from your district union."}
                </p>
              </div>

              {/* Explicit Consent Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAcceptConsent}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{lang === "ta" ? "ஆம், இணைய விரும்புகிறேன்" : "Yes, I Want to Join"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeclineConsent}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4 text-stone-600" />
                  <span>{lang === "ta" ? "இப்போது வேண்டாம்" : "Not Now"}</span>
                </button>
              </div>
            </div>
          ) : step === "group_ready" && group ? (
            /* STEP 2: GROUP IDENTIFIED & JOIN BUTTON */
            <div className="space-y-5">
              <div className="bg-emerald-50/80 border-2 border-emerald-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                      {lang === "ta" ? "கண்டறியப்பட்ட மாவட்ட குழு" : "Identified District Group"}
                    </span>
                    <h4 className="text-base font-bold text-stone-900 mt-1">
                      {group.groupName}
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {lang === "ta" ? `மாவட்டம்: ${group.district}` : `District: ${group.districtEn || group.district}`}
                    </p>
                  </div>
                </div>

                {group.coordinatorName && (
                  <div className="pt-2 border-t border-emerald-200/80 text-xs text-stone-700 flex items-center justify-between">
                    <span className="font-medium text-stone-600">{lang === "ta" ? "ஒருங்கிணைப்பாளர்:" : "Coordinator:"}</span>
                    <span className="font-bold text-stone-900">{group.coordinatorName} ({group.coordinatorPhone})</span>
                  </div>
                )}
              </div>

              {/* Instruction banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  {lang === "ta" 
                    ? "கீழே உள்ள 'WhatsApp குழுவில் இணைய' பொத்தானை அழுத்தியவுடன் அதிகாரப்பூர்வ வாட்ஸ்அப் செயலி திறக்கும். அங்கு 'Join Group' என்பதை அழுத்தி இணைப்பை நிறைவு செய்யவும்." 
                    : "Tapping the button below will open WhatsApp directly. Tap 'Join Group' inside WhatsApp to complete joining."}
                </p>
              </div>

              {/* Final Join Action Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppLink}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base"
                >
                  <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
                  <span>{lang === "ta" ? "WhatsApp குழுவில் இணைய" : "Join WhatsApp Group"}</span>
                  <ExternalLink className="w-4 h-4 text-emerald-100" />
                </button>

                {linkOpened && (
                  <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg p-3 text-center text-xs font-medium animate-fadeIn">
                    ✓ {lang === "ta" 
                      ? "WhatsApp இணைப்பு திறக்கப்பட்டது. குழுவில் சேர WhatsApp செயலியில் 'Join Group' தட்டவும்." 
                      : "WhatsApp link opened. Tap 'Join Group' inside WhatsApp to finish."}
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800 underline"
                >
                  {lang === "ta" ? "பின்னர் பார்க்கவும் (முடிந்தது)" : "Close Window"}
                </button>
              </div>
            </div>
          ) : (
            /* NO GROUP CONFIGURED FALLBACK */
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-stone-900">
                {lang === "ta" ? "வாட்ஸ்அப் குழு அமைக்கப்படவில்லை" : "WhatsApp Group Not Configured"}
              </h4>
              <p className="text-sm font-semibold text-stone-800 bg-stone-100 p-3.5 rounded-xl border border-stone-200 leading-relaxed">
                “இந்த மாவட்டத்திற்கான WhatsApp குழு தற்போது அமைக்கப்படவில்லை. பின்னர் முயற்சிக்கவும்.”
              </p>
              <p className="text-xs text-stone-500">
                {lang === "ta" 
                  ? "உங்கள் மாவட்டத்திற்கான வாட்ஸ்அப் குழு அமைக்கப்பட்டதும் மாநில தலைமையகத்தில் இருந்து தகவல் தெரிவிக்கப்படும்." 
                  : "You will be notified once the official WhatsApp group for your district goes live."}
              </p>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-stone-800 hover:bg-stone-900 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-xs"
                >
                  {lang === "ta" ? "சரி, புரிந்தது" : "OK, Got It"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="bg-stone-50 p-3 px-5 border-t border-stone-200 text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === "ta" ? "அதிகாரப்பூர்வ TNPA வாட்ஸ்அப் அழைப்பு இணைப்பு பாதுகாப்பு உத்தரவாதம்" : "Official TNPA Direct WhatsApp Invite Link Guarantee"}</span>
        </div>
      </div>
    </div>
  );
}
