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
  Check
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
      status: "pending"
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
      status: "pending"
    };

    setApplications([newApp, ...applications]);
    onAddAuditLog("Office Bearer Application Submitted", `Application submitted by ${applicantName} for ${targetPosition} (${applicantDistrict}) with ${membershipYears} years membership.`);
    alert(lang === "ta" 
      ? "✓ உங்கள் பொறுப்பாளர் விண்ணப்பம் வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டு சூப்பர் அட்மின் ஒப்புதலுக்கு அனுப்பப்பட்டது!" 
      : "✓ Your office bearer application was submitted successfully and sent to Super Admin for approval!");
    
    // Reset form
    setTargetPosition("");
    setMembershipYears(3);
    setDistrictAchievements("");
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
    </div>
  );
}
