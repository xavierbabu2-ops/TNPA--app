import React, { useState } from "react";
import { 
  Award, 
  UserCheck, 
  Megaphone, 
  Plus, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Building2, 
  Star, 
  Sparkles,
  Phone,
  User,
  Check,
  Scale,
  ShieldAlert,
  Gavel,
  Printer,
  X
} from "lucide-react";
import { OfficeBearerAnnouncement, OfficeBearerApplication, UserAccount } from "../types";
import OfficeBearerCertificateGenerator from "./OfficeBearerCertificateGenerator";

interface OfficeBearerPortalProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  isSuperAdmin: boolean;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function OfficeBearerPortal({
  lang,
  currentUser,
  isSuperAdmin,
  onAddAuditLog
}: OfficeBearerPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"announcements" | "apply" | "certificate" | "manage_applications">("announcements");

  // Initial dummy announcements
  const [announcements, setAnnouncements] = useState<OfficeBearerAnnouncement[]>([
    {
      id: "ann_1",
      title: "சென்னை மாவட்ட தலைவர் மற்றும் செயலாளர் பதவிக்கான திறந்த அறிவிப்பு",
      titleEn: "Open Announcement for Chennai District President & Secretary Posts",
      position: "மாவட்ட தலைவர் / செயலாளர் (District President / Secretary)",
      district: "சென்னை",
      districtEn: "Chennai",
      description: "தமிழ்நாடு பெயிண்டர்கள் சங்கத்தின் சென்னை மாவட்ட கிளைக்கான புதிய நிர்வாகிகளைத் தேர்ந்தெடுக்க தகுதியான உறுப்பினர்களிடமிருந்து விண்ணப்பங்கள் வரவேற்கப்படுகின்றன. குறைந்தபட்சம் 5 ஆண்டுகள் உறுப்பினராக இருக்க வேண்டும்.",
      descriptionEn: "Applications are invited from eligible members for the post of District President & Secretary for Chennai District. Minimum 5 years membership required.",
      lastDate: "2026-09-30",
      status: "active",
      createdAt: "2026-08-20"
    },
    {
      id: "ann_2",
      title: "கோயம்புத்தூர் மாவட்ட இணைச் செயலாளர் பதவி",
      titleEn: "Coimbatore District Joint Secretary Post Announcement",
      position: "மாவட்ட இணைச் செயலாளர் (District Joint Secretary)",
      district: "கோயம்புத்தூர்",
      districtEn: "Coimbatore",
      description: "கோயம்புத்தூர் வட்டார பெயிண்டர்கள் நலனுக்காகவும் சங்க வளர்ச்சிப் பணிகளுக்காகவும் அர்ப்பணிப்புடன் பணியாற்ற புதிய இணைச் செயலாளர் பதவிக்கு விண்ணப்பிக்கலாம்.",
      descriptionEn: "Applications invited for Coimbatore District Joint Secretary to lead welfare and union growth.",
      lastDate: "2026-10-15",
      status: "active",
      createdAt: "2026-08-22"
    }
  ]);

  // Initial sample applications
  const [applications, setApplications] = useState<OfficeBearerApplication[]>([
    {
      id: "app_1",
      announcementId: "ann_1",
      applicantName: "ஆர். கார்த்திகேயன்",
      applicantPhone: "9840012345",
      district: "சென்னை",
      districtEn: "Chennai",
      targetPosition: "சென்னை மாவட்ட தலைவர்",
      membershipYears: 7,
      districtAchievements: "சென்னையில் கடந்த 5 ஆண்டுகளாக 450+ பெயிண்டர்களை சங்கத்தில் இணைத்துள்ளேன். விபத்து நிவாரணம் மற்றும் கல்வி உதவித்தொகை பெற்றுத் தர தீவிரமாக உழைத்துள்ளேன்.",
      memberRegNumber: "TNP-2026-0042",
      appliedAt: "2026-08-21",
      status: "pending",
      legalOathAccepted: true,
      legalOathAcceptedAt: "2026-08-21T10:00:00.000Z",
      legalOathRef: "TNPA/LEGAL-NOT/2026/044"
    }
  ]);

  // New Announcement form state (for Super Admin)
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnTitleEn, setNewAnnTitleEn] = useState("");
  const [newAnnPosition, setNewAnnPosition] = useState("");
  const [newAnnDistrict, setNewAnnDistrict] = useState("சென்னை");
  const [newAnnDesc, setNewAnnDesc] = useState("");
  const [newAnnDate, setNewAnnDate] = useState("2026-10-30");

  // Application form state
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState("");
  const [applicantName, setApplicantName] = useState(currentUser?.name || "");
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || "");
  const [applicantDistrict, setApplicantDistrict] = useState(currentUser?.district || "சென்னை");
  const [targetPosition, setTargetPosition] = useState("");
  const [membershipYears, setMembershipYears] = useState<number>(3);
  const [districtAchievements, setDistrictAchievements] = useState("");
  const [memberRegNumber, setMemberRegNumber] = useState(currentUser?.regNumber || "TNP-2026-");
  const [bearerLegalOathAccepted, setBearerLegalOathAccepted] = useState(false);
  const [showBearerLegalModal, setShowBearerLegalModal] = useState(false);

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnPosition || !newAnnDesc) {
      alert(lang === "ta" ? "அனைத்து விவரங்களையும் நிரப்பவும்!" : "Please fill all details!");
      return;
    }
    const newAnnouncement: OfficeBearerAnnouncement = {
      id: `ann_${Date.now()}`,
      title: newAnnTitle,
      titleEn: newAnnTitleEn || newAnnTitle,
      position: newAnnPosition,
      district: newAnnDistrict,
      districtEn: newAnnDistrict,
      description: newAnnDesc,
      descriptionEn: newAnnDesc,
      lastDate: newAnnDate,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    onAddAuditLog("Office Bearer Announcement Published", `New post announcement published for ${newAnnDistrict}: ${newAnnPosition}`);
    setNewAnnTitle("");
    setNewAnnTitleEn("");
    setNewAnnPosition("");
    setNewAnnDesc("");
    alert(lang === "ta" ? "✓ புதிய பொறுப்பாளர் அறிவிப்பு வெற்றிகரமாக வெளியிடப்பட்டது!" : "✓ Office bearer announcement published successfully!");
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || !targetPosition || !districtAchievements) {
      alert(lang === "ta" ? "அனைத்து விண்ணப்ப விவரங்களையும் சரியாக நிரப்பவும்!" : "Please fill all application fields correctly!");
      return;
    }

    if (!bearerLegalOathAccepted) {
      alert(
        lang === "ta" 
          ? "மாநில சட்ட ஆலோசனைக் குழுவின் சங்கம் மற்றும் மாநில தலைமை மீதான அவதூறு தடுப்பு உறுதிமொழியை ஏற்றுக்கொண்டு தேர்வு செய்ய வேண்டும்!" 
          : "You must accept the State Legal Advisory Board Anti-Defamation Code of Conduct Oath to proceed!"
      );
      return;
    }

    const newApp: OfficeBearerApplication = {
      id: `app_${Date.now()}`,
      announcementId: selectedAnnouncementId || undefined,
      applicantName,
      applicantPhone,
      district: applicantDistrict,
      districtEn: applicantDistrict,
      targetPosition,
      membershipYears: Number(membershipYears) || 1,
      districtAchievements,
      memberRegNumber,
      appliedAt: new Date().toISOString().split("T")[0],
      status: "pending",
      legalOathAccepted: true,
      legalOathAcceptedAt: new Date().toISOString(),
      legalOathRef: "TNPA/LEGAL-NOT/2026/044"
    };

    setApplications([newApp, ...applications]);
    onAddAuditLog("Office Bearer Application Submitted", `Application submitted by ${applicantName} for ${targetPosition} (${applicantDistrict}) with ${membershipYears} years membership and signed legal non-defamation oath.`);
    alert(lang === "ta" 
      ? "✓ உங்கள் பொறுப்பாளர் விண்ணப்பம் & சட்ட உறுதிமொழி வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டு சூப்பர் அட்மின் ஒப்புதலுக்கு அனுப்பப்பட்டது!" 
      : "✓ Your office bearer application & legal oath were submitted successfully and sent to Super Admin for approval!");
    
    // Reset form
    setTargetPosition("");
    setMembershipYears(3);
    setDistrictAchievements("");
    setBearerLegalOathAccepted(false);
    setActiveSubTab("announcements");
  };

  const handleUpdateApplicationStatus = (id: string, status: "approved" | "rejected") => {
    setApplications(applications.map(app => app.id === id ? { ...app, status } : app));
    const appItem = applications.find(a => a.id === id);
    if (appItem) {
      onAddAuditLog(
        status === "approved" ? "Office Bearer Application Approved" : "Office Bearer Application Rejected",
        `Application for ${appItem.applicantName} (${appItem.targetPosition}) was ${status} by Super Admin.`
      );
    }
    alert(lang === "ta" ? `✓ விண்ணப்பம் ${status === "approved" ? "ஏற்கப்பட்டது (Approved)" : "நாகரிகமாக நிராகரிக்கப்பட்டது"}` : `✓ Application status updated to ${status}`);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950 via-[#7f1d1d] to-amber-950 text-white p-6 md:p-8 shadow-xl border border-rose-900/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-300 font-extrabold mb-3">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "ta" ? "அதிகாரப்பூர்வ பொறுப்பாளர் மையம்" : "Official Office Bearer Center"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {lang === "ta" ? "புதிய பொறுப்பாளர் அறிவிப்புகள் & விண்ணப்பங்கள்" : "New Office Bearer Announcements & Applications"}
            </h1>
            <p className="text-stone-300 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              {lang === "ta"
                ? "சங்கத்தின் மாநில, மாவட்ட மற்றும் ஒன்றிய பொறுப்பாளர் பதவி அறிவிப்புகளைப் பார்வையிடவும். தகுதியான உறுப்பினர்கள் சங்க அனுபவம் மற்றும் மாவட்ட சாதனைகளுடன் விண்ணப்பித்து சூப்பர் அட்மின் ஒப்புதலைப் பெறலாம்."
                : "View official office bearer position openings. Qualified members can apply with association experience and district achievements for Super Admin approval."}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubTab("announcements")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "announcements" ? "bg-amber-400 text-stone-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>{lang === "ta" ? "அறிவிப்புகள்" : "Announcements"}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("apply")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "apply" ? "bg-amber-400 text-stone-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{lang === "ta" ? "பொறுப்பாளர் விண்ணப்பம்" : "Apply for Post"}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("certificate")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "certificate" ? "bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300" : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40"
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>{lang === "ta" ? "பொறுப்பாளர் சான்றிதழ் (45 நாள் விதி)" : "Executive Certificate (45-Day Rule)"}</span>
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveSubTab("manage_applications")}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 relative ${
                  activeSubTab === "manage_applications" ? "bg-amber-400 text-stone-950 shadow-md" : "bg-rose-900/60 text-white hover:bg-rose-900"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>{lang === "ta" ? "சூப்பர் அட்மின் மேலாண்மை" : "Super Admin Review"}</span>
                {applications.filter(a => a.status === "pending").length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900">
                    {applications.filter(a => a.status === "pending").length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: ANNOUNCEMENTS */}
      {activeSubTab === "announcements" && (
        <div className="space-y-6">
          {isSuperAdmin && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-stone-200">
              <h3 className="text-base font-black text-stone-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-600" />
                <span>{lang === "ta" ? "புதிய பொறுப்பாளர் பதவி அறிவிப்பை வெளியிட (Super Admin)" : "Publish New Office Bearer Announcement"}</span>
              </h3>
              <form onSubmit={handlePublishAnnouncement} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">
                    {lang === "ta" ? "அறிவிப்பு தலைப்பு (தமிழில்) *" : "Announcement Title (Tamil) *"}
                  </label>
                  <input
                    type="text"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    placeholder="எ.கா: மதுரை மாவட்ட தலைவர் பதவி அறிவிப்பு"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">
                    {lang === "ta" ? "பதவிப் பெயர் (Position) *" : "Position Title *"}
                  </label>
                  <input
                    type="text"
                    value={newAnnPosition}
                    onChange={(e) => setNewAnnPosition(e.target.value)}
                    placeholder="எ.கா: மாவட்ட தலைவர் (District President)"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">
                    {lang === "ta" ? "மாவட்டம் (District) *" : "District *"}
                  </label>
                  <select
                    value={newAnnDistrict}
                    onChange={(e) => setNewAnnDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 bg-white"
                  >
                    {["சென்னை", "கோயம்புத்தூர்", "மதுரை", "திருச்சி", "சேலம்", "நெல்லை", "வேலூர்", "ஈரோடு", "தஞ்சாவூர்", "திண்டுக்கல்", "விருதுநகர்", "கன்னியாகுமரி"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">
                    {lang === "ta" ? "கடைசி தேதி (Last Date) *" : "Last Date *"}
                  </label>
                  <input
                    type="date"
                    value={newAnnDate}
                    onChange={(e) => setNewAnnDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">
                    {lang === "ta" ? "விவரங்கள் & தகுதிகள் (Description) *" : "Description & Qualifications *"}
                  </label>
                  <textarea
                    rows={3}
                    value={newAnnDesc}
                    onChange={(e) => setNewAnnDesc(e.target.value)}
                    placeholder="உறுப்பினர் தகுதிகள், மாவட்ட பணிகள் மற்றும் விண்ணப்பிக்கும் முறை பற்றி எழுதுக..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>{lang === "ta" ? "அறிவிப்பை வெளியிடுக" : "Publish Announcement"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Announcements List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 flex flex-col justify-between hover:border-amber-400 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-extrabold border border-rose-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {ann.district}
                    </span>
                    <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {lang === "ta" ? `கடைசி தேதி: ${ann.lastDate}` : `Last Date: ${ann.lastDate}`}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-stone-900">{ann.title}</h3>
                  <p className="text-xs font-bold text-rose-600">{ann.position}</p>
                  <p className="text-xs text-stone-600 font-medium leading-relaxed">{ann.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">ID: {ann.id}</span>
                  <button
                    onClick={() => {
                      setSelectedAnnouncementId(ann.id);
                      setTargetPosition(ann.position);
                      setApplicantDistrict(ann.district);
                      setActiveSubTab("apply");
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{lang === "ta" ? "இப்பதவிக்கு விண்ணப்பிக்க" : "Apply for Post"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: APPLY FOR OFFICE BEARER */}
      {activeSubTab === "apply" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-stone-200 max-w-3xl mx-auto">
          <div className="border-b border-stone-200 pb-4 mb-6">
            <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-rose-600" />
              <span>{lang === "ta" ? "புதிய பொறுப்பாளர் பதவிக்கான விண்ணப்பப் படிவம்" : "Office Bearer Application Form"}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {lang === "ta"
                ? "சங்கத்தின் விதிகளின்படி, உங்கள் உறுப்புரிமை ஆண்டுகள் மற்றும் மாவட்டத்தில் செய்த சேவைகளைத் துல்லியமாகப் பதிவு செய்யவும்."
                : "Accurately record your association membership duration and district contributions according to union rules."}
            </p>
          </div>

          <form onSubmit={handleSubmitApplication} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">
                  {lang === "ta" ? "விண்ணப்பதாரர் பெயர் (Applicant Name) *" : "Applicant Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="எ.கா: திரு. க. முரளி"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">
                  {lang === "ta" ? "தொலைபேசி எண் (Phone Number) *" : "Phone Number *"}
                </label>
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="9840012345"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">
                  {lang === "ta" ? "மாவட்டம் (District) *" : "District *"}
                </label>
                <select
                  value={applicantDistrict}
                  onChange={(e) => setApplicantDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                >
                  {["சென்னை", "கோயம்புத்தூர்", "மதுரை", "திருச்சி", "சேலம்", "நெல்லை", "வேலூர்", "ஈரோடு", "தஞ்சாவூர்", "திண்டுக்கல்", "விருதுநகர்", "கன்னியாகுமரி"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">
                  {lang === "ta" ? "விண்ணப்பிக்கும் பதவி (Target Position) *" : "Target Position *"}
                </label>
                <input
                  type="text"
                  required
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  placeholder="எ.கா: மாவட்ட தலைவர் / செயலாளர்"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">
                  {lang === "ta" ? "சங்க உறுப்பினர் எண் (Reg Number)" : "Member Reg Number"}
                </label>
                <input
                  type="text"
                  value={memberRegNumber}
                  onChange={(e) => setMemberRegNumber(e.target.value)}
                  placeholder="TNP-2026-0042"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1 text-rose-700">
                  {lang === "ta" ? "சங்கத்தில் உறுப்பினராக உள்ள ஆண்டுகள் (Years of Membership) *" : "Years of Membership in TNPA *"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  required
                  value={membershipYears}
                  onChange={(e) => setMembershipYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-rose-50/50 border border-rose-300 rounded-xl text-xs font-black text-rose-900"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  {lang === "ta" ? "குறைந்தபட்சம் 3 ஆண்டுகள் உறுப்பினர் அனுபவம் அவசியமானது." : "Minimum 3 years membership experience required."}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1 text-rose-700">
                {lang === "ta" ? "மாவட்டத்தில் நீங்கள் செய்த சிறப்புகள் & சங்கப் பணிகள் (District Achievements & Contributions) *" : "District Achievements & Contributions *"}
              </label>
              <textarea
                rows={4}
                required
                value={districtAchievements}
                onChange={(e) => setDistrictAchievements(e.target.value)}
                placeholder={lang === "ta" ? "உங்கள் மாவட்டத்தில் பெயிண்டர்களுக்காக நீங்கள் ஆற்றிய சேவைகள், உறுப்பினர்களை இணைத்தது, நலவாரிய உதவிகள் பெற்றுத் தந்தது போன்ற சிறப்புகளை விரிவாக எழுதுக..." : "Describe your contributions, welfare camps organized, member enrollment drive, and services rendered in your district..."}
                className="w-full px-3.5 py-2.5 bg-rose-50/50 border border-rose-300 rounded-xl text-xs font-bold text-stone-800 leading-relaxed"
              />
            </div>

            {/* MANDATORY LEGAL ADVISORY BOARD ANTI-DEFAMATION & DISCIPLINARY OATH */}
            <div className="bg-gradient-to-br from-rose-50/90 via-amber-50/40 to-stone-50 border-2 border-rose-300/80 rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-rose-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#b91c1c] text-white flex items-center justify-center shadow-sm shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-rose-950 uppercase tracking-wide">
                        {lang === "ta" ? "மாநில சட்ட ஆலோசனைக் குழு - பொறுப்பாளர் அவதூறு தடுப்பு உறுதிமொழி" : "State Legal Advisory Board - Office Bearer Statutory Oath"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono font-black text-[9px] border border-rose-300">
                        REF: TNPA/LEGAL-NOT/2026/044
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-600 font-medium block mt-0.5">
                      {lang === "ta" ? "அரசு பதிவு: TNMDUJCLMDUTU- 50-26-00044 | சென்னை & மதுரை உயர்நீதிமன்ற வழக்கறிஞர்கள்" : "Govt Reg No: TNMDUJCLMDUTU- 50-26-00044"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBearerLegalModal(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "சட்ட ஆவணம்" : "Legal Document"}</span>
                </button>
              </div>

              {/* Crucial Statutory Oath Terms for Office Bearers */}
              <div className="text-xs text-stone-800 space-y-2.5 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-rose-100">
                {/* USER MANDATED FORMAL SOLEMN OATH STATEMENT */}
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-xl p-3.5 space-y-2 text-stone-900 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wide">
                    <Award className="w-4 h-4 text-[#991b1b]" />
                    <span>{lang === "ta" ? "பொறுப்பாளர் சத்தியப்பிரமாண உறுதிமொழி வாசகம்:" : "Office Bearer Solemn Oath of Allegiance:"}</span>
                  </div>
                  <blockquote className="text-xs sm:text-[13px] font-black text-[#991b1b] bg-white p-3 rounded-lg border border-amber-200 leading-relaxed italic shadow-2xs">
                    "{lang === "ta"
                      ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தைச் சார்ந்த இன்று முதல் இந்த சங்கத்தில் உறுப்பினர் அல்லது பொறுப்பாளராக திறன் பட செயல்படுவேன். மேலும் இந்த சங்கத்தில் மாநில தலைமை பற்றியோ இந்த சங்கத்தைப் பற்றியோ அவதூறு பரப்புவது மற்றும் இழிவு படுத்துவது இது போன்ற செயல்களில் ஈடுபட மாட்டேன் எனவும் மேலும் மாநில தலைமை எடுக்கும் முடிவுகளுக்கு கட்டுப்பட்டு நடப்பேன் எனவும் உறுதியளிக்கிறேன்."
                      : "Belonging to Tamil Nadu Painters and Artists Progressive Association, from this day forward I will function efficiently as a member or office bearer in this association. Furthermore, I swear that I will not engage in defaming, criticizing, or degrading the association or its state leadership, and I pledge that I will strictly abide by all decisions taken by the state leadership."}"
                  </blockquote>
                </div>

                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="font-bold text-rose-950">
                    <span>{lang === "ta" ? "1. சங்கம் மற்றும் மாநில தலைமை மீதான அவதூறு தவிர்ப்பு கட்டளை:" : "1. Strict Prohibition of Criticism against Union & State Leadership:"}</span>
                    <p className="font-normal text-stone-700 text-[11px] mt-0.5 leading-relaxed">
                      {lang === "ta"
                        ? "நமது சங்கத்தின் சட்ட ஆலோசகர்கள் மூலம் அறிவுறுத்தப்பட்டுள்ளபடி, சங்கத்தின் பொறுப்பாளர் பதவிக்கு விண்ணப்பிக்கும் அல்லது பதவி ஏற்கும் ஒவ்வொரு நிர்வாகியும், நமது சங்கத்தைப் பற்றியோ அல்லது மாநிலத் தலைமை (மாநிலத் தலைவர், மாநில நிர்வாகிகள்) பற்றியோ பொதுவெளியிலோ, மேடைகளிலோ, வாட்ஸ்அப் உள்ளிட்ட சமூக ஊடகங்களிலோ தவறான விமர்சனங்களோ அல்லது இழிவான பேச்சுகளோ பேசவோ, பரப்பவோ கூடாது. ஏதேனும் கருத்து வேறுபாடுகள் இருப்பின், மாநில சட்ட ஆலோசனைக் குழு மற்றும் தலைமை ஒழுங்கு நடவடிக்கைக் குழுவின் முன் மட்டுமே எழுத்துப்பூர்வமாகத் தெரிவிக்க வேண்டும்."
                        : "Every office bearer is bound by the State Legal Advisory Board to never criticize or defame the association or state leadership in any public forum or social media."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-rose-100">
                  <Gavel className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div className="font-bold text-rose-950">
                    <span>{lang === "ta" ? "2. இவ்வுறுதிமொழியை மீறினால் ஏற்படும் நேரடி விளைவுகள் (Consequences of Violation):" : "2. Direct Consequences of Violation:"}</span>
                    <ul className="list-disc pl-4 font-normal text-stone-700 text-[11px] space-y-1 mt-1">
                      <li>
                        <strong className="text-rose-900">{lang === "ta" ? "பதவி & உறுப்புரிமை உடனடி பறிப்பு:" : "Immediate Removal & Expulsion:"}</strong> {lang === "ta" ? "பொறுப்பாளர் பதவியிலிருந்து உடனடியாக நீக்கப்பட்டு சங்க அடிப்படை உறுப்பினர் உரிமையும் ரத்து செய்யப்படும்." : "Immediate termination of post and permanent cancellation of membership."}
                      </li>
                      <li>
                        <strong className="text-rose-900">{lang === "ta" ? "நலவாரிய சலுகைகள் & சான்றிதழ் ரத்து:" : "Forfeiture of Benefits & Certificate:"}</strong> {lang === "ta" ? "அனைத்து நலத்திட்ட உதவிகள் மற்றும் நியமன சான்றிதழ் செல்லாததாக அறிவிக்கப்படும்." : "Revocation of all welfare aid, insurance, and appointment certificate."}
                      </li>
                      <li>
                        <strong className="text-rose-900">{lang === "ta" ? "கிரிமினல் & சைபர் வழக்கு (BNS 356 & IT Act 66D):" : "Criminal Prosecution:"}</strong> {lang === "ta" ? "பாரதிய நியாய சன்ஹிதா (BNS) பிரிவுகள் 356 (குற்றவியல் அவதூறு), 351 (மிரட்டல்) மற்றும் தகவல் தொழில்நுட்ப சட்டம் 66D கீழ் சைபர் கிரைம் கிரிமினல் வழக்கு பதிவு செய்யப்படும்." : "Criminal prosecution under BNS Sec 356, 351 and IT Act Sec 66D."}
                      </li>
                      <li>
                        <strong className="text-rose-900">{lang === "ta" ? "ரூ. 1 கோடி சிவில் இழப்பீட்டு வழக்கு:" : "Civil Damages Suit up to ₹1 Crore:"}</strong> {lang === "ta" ? "சங்கத்தின் பெயருக்கு களங்கம் ஏற்படுத்திய குற்றத்திற்காக சென்னை உயர்நீதிமன்றத்தில் ₹1 கோடி இழப்பீடு கோரி வழக்கு தொடரப்படும்." : "Civil suit for damages up to ₹1 Crore in the High Court."}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mandatory Undertaking Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-100/70 border border-rose-300 text-rose-950 cursor-pointer hover:bg-rose-100 transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={bearerLegalOathAccepted}
                  onChange={(e) => setBearerLegalOathAccepted(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5 w-4 h-4"
                />
                <span className="text-xs font-bold leading-relaxed">
                  {lang === "ta"
                    ? "«தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தைச் சார்ந்த இன்று முதல் இந்த சங்கத்தில் பொறுப்பாளராக திறன் பட செயல்படுவேன். மேலும் இந்த சங்கத்தில் மாநில தலைமை பற்றியோ இந்த சங்கத்தைப் பற்றியோ அவதூறு பரப்புவது மற்றும் இழிவு படுத்துவது இது போன்ற செயல்களில் ஈடுபட மாட்டேன் எனவும் மேலும் மாநில தலைமை எடுக்கும் முடிவுகளுக்கு கட்டுப்பட்டு நடப்பேன் எனவும் உறுதியளிக்கிறேன்» – மேற்கண்ட உறுதிமொழியை நான் முழுமையாக ஏற்றுக்கொண்டு சான்றளிக்கிறேன்."
                    : "«Belonging to Tamil Nadu Painters and Artists Progressive Association, from this day forward I will function efficiently as an office bearer. Furthermore, I swear that I will not defame or degrade the union or state leadership, and I pledge to abide by decisions of the state leadership» – I certify and accept this pledge."}
                </span>
              </label>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lang === "ta" ? "விதிமுறைகள் குறிப்பு:" : "Submission Guidelines:"}</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                {lang === "ta"
                  ? "நீங்கள் சமர்ப்பிக்கும் விண்ணப்பம் மாநிலத் தலைவர் மற்றும் சூப்பர் அட்மின் குழுவால் பரிசீலிக்கப்பட்டு, தகுதியின் அடிப்படையில் அப்ரூவல் வழங்கப்படும்."
                  : "Your submitted application will be reviewed by the State President & Super Admin committee for approval based on merit."}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab("announcements")}
                className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-extrabold rounded-xl cursor-pointer transition-all"
              >
                {lang === "ta" ? "ரத்து செய்" : "Cancel"}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{lang === "ta" ? "சூப்பர் அட்மினுக்கு விண்ணப்பம் அனுப்புக" : "Submit to Super Admin"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT 3: OFFICIAL CERTIFICATE GENERATOR (45-DAY RULE) */}
      {activeSubTab === "certificate" && (
        <OfficeBearerCertificateGenerator
          lang={lang}
          currentUser={currentUser}
          onAddAuditLog={onAddAuditLog}
        />
      )}

      {/* TAB CONTENT 4: SUPER ADMIN MANAGEMENT */}
      {activeSubTab === "manage_applications" && isSuperAdmin && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200">
            <h3 className="text-base font-black text-stone-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              <span>{lang === "ta" ? "பெறுப்பட்ட பொறுப்பாளர் விண்ணப்பங்கள் (Super Admin Approval Register)" : "Office Bearer Applications Review Hub"}</span>
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              {lang === "ta"
                ? "உறுப்பினர்களின் சங்க அனுபவ ஆண்டுகள் மற்றும் மாவட்ட சாதனைகளைச் சரிபார்த்து அப்ரூவல் அல்லது ரிஜெக்ட் செய்யவும்."
                : "Review membership duration and district achievements of applicants and approve or reject."}
            </p>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <p className="text-stone-400 text-center py-8">No applications found.</p>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-black">
                          {app.district}
                        </span>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-black font-mono">
                          {app.memberRegNumber || "Reg: N/A"}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          app.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                          app.status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-stone-900">
                        {app.applicantName} <span className="text-xs font-normal text-stone-500">(+91 {app.applicantPhone})</span>
                      </h4>

                      <p className="text-xs font-bold text-rose-700">
                        {lang === "ta" ? "விரும்பும் பதவி: " : "Target Position: "} {app.targetPosition}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                          <span className="text-[10px] font-extrabold text-stone-400 block">{lang === "ta" ? "சங்க உறுப்புரிமை அனுபவம்:" : "Membership Experience:"}</span>
                          <span className="font-black text-stone-900">{app.membershipYears} {lang === "ta" ? "ஆண்டுகள் (Years)" : "Years"}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                          <span className="text-[10px] font-extrabold text-stone-400 block">{lang === "ta" ? "சமர்ப்பிக்கப்பட்ட தேதி:" : "Applied Date:"}</span>
                          <span className="font-semibold text-stone-800">{app.appliedAt}</span>
                        </div>
                      </div>

                      {/* Signed Legal Oath Badge */}
                      <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950">
                        <Scale className="w-4 h-4 text-rose-700 shrink-0" />
                        <span className="font-bold">
                          {lang === "ta" ? "மாநில சட்ட ஆலோசகர் அவதூறு தடுப்பு உறுதிமொழி ஏற்கப்பட்டது" : "Signed Legal Non-Defamation Oath"}
                        </span>
                        <span className="ml-auto font-mono text-[10px] bg-rose-200/80 px-2 py-0.5 rounded font-black text-rose-900">
                          {app.legalOathRef || "TNPA/LEGAL-NOT/2026/044"}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                        <span className="text-[10px] font-extrabold text-stone-400 block">{lang === "ta" ? "மாவட்டத்தில் செய்த சிறப்புகள் & சேவைகள்:" : "District Contributions & Achievements:"}</span>
                        <p className="font-medium leading-relaxed">{app.districtAchievements}</p>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto">
                      {app.status !== "approved" && (
                        <button
                          onClick={() => handleUpdateApplicationStatus(app.id, "approved")}
                          className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{lang === "ta" ? "அப்ரூவ் செய்" : "Approve"}</span>
                        </button>
                      )}
                      {app.status !== "rejected" && (
                        <button
                          onClick={() => handleUpdateApplicationStatus(app.id, "rejected")}
                          className="flex-1 md:flex-none px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{lang === "ta" ? "நாகரிகமாக நிராகரி" : "Reject"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATE LEGAL ADVISORY BOARD STATUTORY UNDERTAKING MODAL */}
      {showBearerLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#b91c1c] text-white flex items-center justify-center shadow">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    {lang === "ta" ? "மாநில சட்ட ஆலோசனைக் குழு - பொறுப்பாளர் சட்ட உறுதிமொழி பத்திரம்" : "State Legal Advisory Council - Office Bearer Statutory Undertaking"}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-stone-300 mt-0.5">
                    <span className="font-mono text-amber-400 font-bold">REF: TNPA/LEGAL-NOT/2026/044</span>
                    <span>•</span>
                    <span>{lang === "ta" ? "அரசு பதிவு: TNMDUJCLMDUTU- 50-26-00044" : "Govt Reg: TNMDUJCLMDUTU- 50-26-00044"}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowBearerLegalModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Official Legal Document Format */}
            <div className="p-6 overflow-y-auto space-y-5 text-stone-800 text-xs leading-relaxed">
              {/* Seal Banner */}
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <span className="text-xs font-black text-rose-950 uppercase tracking-wider block">
                    {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் சங்கம்" : "TAMIL NADU PAINTERS ASSOCIATION"}
                  </span>
                  <span className="text-[11px] text-stone-600 block">
                    {lang === "ta" ? "தலைமையகம்: 45/2, பாரதியார் தெரு, அண்ணா நகர், சென்னை - 600040" : "Headquarters: Chennai, Tamil Nadu"}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono block mt-0.5">
                    Affiliated under TN Societies Registration Act 1975
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-black text-center shrink-0">
                  <Gavel className="w-4 h-4 mx-auto mb-0.5 text-rose-700" />
                  HIGH COURT APPROVED
                </div>
              </div>

              {/* Subject */}
              <div className="p-3 bg-amber-500/10 border-l-4 border-amber-500 text-stone-900 text-xs font-bold rounded-r-xl">
                {lang === "ta" 
                  ? "பொருள்: மாநில / மாவட்ட / பகுதி / ஒன்றிய பொறுப்பாளர்கள் சங்கம் மற்றும் மாநிலத் தலைமை மீதான அவதூறுகளைத் தடுத்தல், ஒழுங்கு நெறிமுறை மற்றும் சட்டரீதியான கடுமையான விளைவுகள் குறித்த அதிகாரப்பூர்வ உறுதிமொழி."
                  : "Subject: Statutory undertaking on prevention of defamation, office bearer discipline, and legal liabilities."}
              </div>

              {/* MANDATED SOLEMN OATH CLAUSE */}
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
                <span className="text-[11px] font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#991b1b]" />
                  {lang === "ta" ? "பொறுப்பாளர் சத்தியப்பிரமாண உறுதிமொழி வாசகம்:" : "Office Bearer Solemn Oath of Allegiance:"}
                </span>
                <p className="text-xs sm:text-[13px] font-black text-[#991b1b] bg-white p-3 rounded-xl border border-amber-200 leading-relaxed italic shadow-2xs">
                  "{lang === "ta"
                    ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தைச் சார்ந்த இன்று முதல் இந்த சங்கத்தில் உறுப்பினர் அல்லது பொறுப்பாளராக திறன் பட செயல்படுவேன். மேலும் இந்த சங்கத்தில் மாநில தலைமை பற்றியோ இந்த சங்கத்தைப் பற்றியோ அவதூறு பரப்புவது மற்றும் இழிவு படுத்துவது இது போன்ற செயல்களில் ஈடுபட மாட்டேன் எனவும் மேலும் மாநில தலைமை எடுக்கும் முடிவுகளுக்கு கட்டுப்பட்டு நடப்பேன் எனவும் உறுதியளிக்கிறேன்."
                    : "Belonging to Tamil Nadu Painters and Artists Progressive Association, from this day forward I will function efficiently as a member or office bearer in this association. Furthermore, I swear that I will not engage in defaming, criticizing, or degrading the association or its state leadership, and I pledge that I will strictly abide by all decisions taken by the state leadership."}"
                </p>
              </div>

              {/* Clauses */}
              <div className="space-y-3.5">
                <div>
                  <h4 className="font-extrabold text-stone-950 text-xs flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === "ta" ? "1. சட்ட ஆலோசகர்கள் குழுவின் முக்கிய உத்தரவு:" : "1. Directive of the Legal Advisory Council:"}</span>
                  </h4>
                  <p className="text-stone-700 leading-relaxed text-[11px]">
                    {lang === "ta"
                      ? "தமிழ்நாடு பெயிண்டர்கள் சங்கத்தில் பதவி வகிக்கும் அல்லது பொறுப்பாளர் பதவி ஏற்கும் எந்தவொரு நிர்வாகியும் சங்கத்தின் நற்பெயரையும் மாநில தலைமையின் (மாநிலத் தலைவர், மாநில நிர்வாகிகள்) மாண்பையும் பாதுகாக்கும் கடமை உடையவர்கள் ஆவர். சங்கத்தைப் பற்றியோ, மாநிலத் தலைமை பற்றியோ எந்தவொரு பொது அரங்கிலோ, பொதுக்கூட்டங்களிலோ, வாட்ஸ்அப் குழுக்கள், முகநூல், யூடியூப் போன்ற சமூக வலைத்தளங்களிலோ அவதூறாகவோ அல்லது தவறான தகவல்களைப் பரப்பும் வகையிலோ பேசுவது முற்றிலும் தடை செய்யப்பட்டுள்ளது."
                      : "Every executive or office bearer admitted to leadership is strictly prohibited from speaking, publishing, or circulating defamatory or false statements against the union or state leadership."}
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-stone-950 text-xs flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>{lang === "ta" ? "2. இவ்வுறுதிமொழியை மீறினால் ஏற்படும் உடனடி விளைவுகள்:" : "2. Consequences of Violation:"}</span>
                  </h4>
                  <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-[11px] space-y-2 text-rose-950">
                    <p>
                      <strong>அ) உடனடி பதவி நீக்கம் & உறுப்பினர் ரத்து:</strong> பொறுப்பாளர் பதவியிலிருந்து எந்த முன்னறிவிப்புமின்றி உடனடியாக நீக்கப்பட்டு, அடிப்படை உறுப்பினர் அட்டையும் ரத்து செய்யப்படும்.
                    </p>
                    <p>
                      <strong>ஆ) நலவாரிய உதவிகள் & நியமன சான்றிதழ் ரத்து:</strong> நலவாரியத்தின் மூலம் வழங்கப்படும் விபத்துக் காப்பீடு மற்றும் உதவிகள் முடக்கப்படும். அலுவலக சான்றிதழ் செல்லாது என அறிவிக்கப்படும்.
                    </p>
                    <p>
                      <strong>இ) குற்றவியல் வழக்கு (BNS 356, 351 & IT Act):</strong> பாரதிய நியாய சன்ஹிதா (BNS) பிரிவுகள் 356 (அவதூறு), 351, 352 மற்றும் தகவல் தொழில்நுட்ப சட்டம் (IT Act) பிரிவு 66D, 67 பிரிவுகளில் ஜாமீனில் வர இயலாத குற்றவியல் வழக்கு தொடரப்படும்.
                    </p>
                    <p>
                      <strong>ஈ) ரூ. 1 கோடி சிவில் நஷ்டஈடு வழக்கு:</strong> சங்கத்தின் மதிப்பு மற்றும் தலைமைக்கு களங்கம் விளைவித்ததற்காக சென்னை உயர்நீதிமன்றத்தில் ரூ.1 கோடி வரை இழப்பீடு கோரி சிவில் வழக்கு பாயும்.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-stone-950 text-xs flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>{lang === "ta" ? "3. அதிகாரப்பூர்வ முறையீடு முறை:" : "3. Official Grievance Procedure:"}</span>
                  </h4>
                  <p className="text-stone-700 leading-relaxed text-[11px]">
                    {lang === "ta"
                      ? "பொறுப்பாளர்களுக்கு ஏதேனும் ஆலோசனைகள் அல்லது கருத்து வேறுபாடுகள் இருப்பின், மாநில சட்ட ஆலோசனைக் குழு மற்றும் மாநில தலைமை ஒழுங்கு நடவடிக்கைக் குழுவிற்கு மட்டுமே நேரில் அல்லது எழுத்துப்பூர்வமாக மனு அளிக்க வேண்டும்."
                      : "Any grievance must be addressed strictly to the State Legal Advisory Board and Disciplinary Council."}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 text-[10px] text-stone-600">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <span className="font-bold text-stone-900 block text-xs">அட்வகேட் எஸ். முத்துக்குமார், B.A., B.L.</span>
                  <span>தலைமை சட்ட ஆலோசகர், சென்னை உயர்நீதிமன்றம்</span>
                  <span className="block text-stone-400 font-mono mt-0.5">Bar Council Reg: MS/1420/2012</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <span className="font-bold text-stone-900 block text-xs">அட்வகேட் கே. ரவிச்சந்திரன், B.Sc., M.L.</span>
                  <span>மூத்த சட்ட ஆலோசகர், மதுரை உயர்நீதிமன்றக் கிளை</span>
                  <span className="block text-stone-400 font-mono mt-0.5">Bar Council Reg: MS/2105/2015</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? "அச்சிடுக (Print)" : "Print"}</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setBearerLegalOathAccepted(true);
                  setShowBearerLegalModal(false);
                }}
                className="px-5 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{lang === "ta" ? "முழுமையாகப் படித்தேன் & உறுதிமொழியேற்கிறேன்" : "I Read & Accept Oath"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
