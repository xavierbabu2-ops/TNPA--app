import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  PhoneCall, 
  User, 
  MapPin, 
  FileText, 
  HelpCircle,
  Check,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { UserAccount } from "../types";
import { subscribeToGrievances, saveGrievanceToFirestore } from "../lib/syncService";

interface GrievanceItem {
  id: string;
  ticketNo: string;
  category: string;
  subject: string;
  description: string;
  district: string;
  memberName: string;
  memberPhone: string;
  status: "pending" | "in_review" | "resolved";
  createdAt: string;
  response?: string;
}

interface GrievanceSupportDeskProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onAddAuditLog: (action: string, details: string) => void;
}

const defaultGrievanceTickets: GrievanceItem[] = [
  {
    id: "g_1",
    ticketNo: "TNPA-GRV-2026-0104",
    category: "insurance",
    subject: "விபத்து காப்பீட்டு தொகை தாமதம்",
    description: "கடந்த மாதம் சமர்ப்பிக்கப்பட்ட விபத்து நிவாரண கோரிக்கை இன்னும் சரிபார்க்கப்படவில்லை.",
    district: "சென்னை",
    memberName: "ஆர். முருகன்",
    memberPhone: "9840012345",
    status: "in_review",
    createdAt: "2026-08-20",
    response: "மாவட்ட செயலாளர் மூலம் மருத்துவ சான்றிதழ் சரிபார்க்கப்பட்டு வருகிறது."
  },
  {
    id: "g_2",
    ticketNo: "TNPA-GRV-2026-0089",
    category: "membership",
    subject: "அடையாள அட்டை டிஜிட்டல் மாற்றம்",
    description: "புதிய அடையாள அட்டையில் மாவட்டம் தவறாக உள்ளது.",
    district: "கோயம்புத்தூர்",
    memberName: "கார்த்திகேயன்",
    memberPhone: "9790011223",
    status: "resolved",
    createdAt: "2026-08-15",
    response: "தவறு திருத்தப்பட்டு புதிய டிஜிட்டல் அட்டை வழங்கப்பட்டது."
  }
];

export default function GrievanceSupportDesk({
  lang,
  currentUser,
  onAddAuditLog
}: GrievanceSupportDeskProps) {
  const [category, setCategory] = useState<string>("insurance");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [district, setDistrict] = useState<string>(currentUser?.district || "சென்னை");
  const [submittedTickets, setSubmittedTickets] = useState<GrievanceItem[]>(defaultGrievanceTickets);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to real-time grievances in Firestore
  useEffect(() => {
    const unsub = subscribeToGrievances((remoteList) => {
      if (remoteList && remoteList.length > 0) {
        setSubmittedTickets(remoteList);
      }
    });
    return () => unsub();
  }, []);

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert(lang === "ta" ? "அனைத்து விவரங்களையும் நிரப்பவும்!" : "Please fill all details!");
      return;
    }

    setIsSubmitting(true);
    const newTicket: GrievanceItem = {
      id: `g_${Date.now()}`,
      ticketNo: `TNPA-GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      subject: subject.trim(),
      description: description.trim(),
      district,
      memberName: currentUser?.name || (currentUser?.nameEn ? currentUser.nameEn : "உறுப்பினர்"),
      memberPhone: currentUser?.phone || "9840000000",
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0]
    };

    await saveGrievanceToFirestore(newTicket);
    setSubmittedTickets(prev => [newTicket, ...prev.filter(t => t.id !== newTicket.id)]);
    onAddAuditLog("Grievance Submitted", `Ticket ${newTicket.ticketNo} submitted for ${category}`);
    setSuccessMsg(lang === "ta" ? `✓ உங்கள் புகார் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது! புகார் எண்: ${newTicket.ticketNo}` : `✓ Grievance submitted successfully! Ticket No: ${newTicket.ticketNo}`);
    setSubject("");
    setDescription("");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out] pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 md:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/25 border border-blue-400/40 rounded-full text-xs text-blue-300 font-extrabold">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === "ta" ? "உறுப்பினர் குறைகள் & உதவி மையம்" : "Member Grievance & Support Desk"}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            {lang === "ta" ? "சங்கத் தோழர்களின் குறைகள் தீர்க்கும் தளம்" : "TNPA² Grievance & Redressal Cell"}
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
            {lang === "ta"
              ? "காப்பீட்டு கோரிக்கைகள், தினக்கூலி புகார்கள், அடையாள அட்டை சிக்கல்கள் மற்றும் அவசர உதவிகளை நேரடியாக மாநில தலைமைக்கு பதிவு செய்யுங்கள்."
              : "Register and track grievances regarding insurance claims, wage disputes, identity cards, and welfare support directly with the union secretariat."}
          </p>
        </div>
      </div>

      {/* Main Grid: Form & Existing Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Submit Form */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
              <span>{lang === "ta" ? "புதிய புகார் / கோரிக்கை பதிவு" : "Submit New Grievance"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === "ta" ? "உங்கள் மாவட்டத்தின் நிர்வாகிக்கு உடனடி தகவல் அனுப்பப்படும்" : "Sent directly to your district secretary and state admin"}
            </p>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold leading-relaxed">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmitGrievance} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">
                {lang === "ta" ? "புகார் பிரிவு (Category)" : "Grievance Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="insurance">{lang === "ta" ? "🛡️ விபத்து காப்பீடு & நிவாரணம்" : "Insurance & Accident Relief"}</option>
                <option value="wages">{lang === "ta" ? "💰 தினக்கூலி & சம்பளப் பிரச்சினை" : "Daily Wages & Wage Dispute"}</option>
                <option value="membership">{lang === "ta" ? "🪪 உறுப்பினர் அட்டை & பதிவு" : "Membership Card & Registration"}</option>
                <option value="training">{lang === "ta" ? "🏆 பிராண்ட் பயிற்சி & சான்றிதழ்" : "Training & Certification"}</option>
                <option value="other">{lang === "ta" ? "📌 பிற அவசர உதவிகள்" : "Other Emergency Help"}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">
                {lang === "ta" ? "மாவட்டம் (District)" : "District"}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                placeholder="எ.கா. சென்னை"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">
                {lang === "ta" ? "தலைப்பு (Subject)" : "Subject"}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                placeholder={lang === "ta" ? "சுருக்கமான தலைப்பு..." : "Brief subject..."}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">
                {lang === "ta" ? "விவரமான விளக்கம் (Description)" : "Detailed Description"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                placeholder={lang === "ta" ? "உங்கள் பிரச்சினை பற்றிய முழு விவரங்களை இங்கே எழுதவும்..." : "Write full details about your issue here..."}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{lang === "ta" ? "புகாரைப் பதிவு செய்க (Submit Ticket)" : "Submit Grievance Ticket"}</span>
            </button>
          </form>
        </div>

        {/* Right: Tickets List & Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>{lang === "ta" ? "பதிவு செய்யப்பட்ட புகார்கள் & நிலை (Track Tickets)" : "Submitted Grievance Tickets & Status"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === "ta" ? "நிவாரணம் மற்றும் கோரிக்கைகளின் தற்போதைய நிலை" : "Real-time tracking of union redressal status"}
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-black border border-blue-200">
                {submittedTickets.length} {lang === "ta" ? "புகார்கள்" : "Tickets"}
              </span>
            </div>

            <div className="space-y-4">
              {submittedTickets.map((t) => (
                <div key={t.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-mono font-bold">
                        {t.ticketNo}
                      </span>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-black">
                        {t.category.toUpperCase()}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      t.status === "resolved" 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                        : t.status === "in_review"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}>
                      {t.status === "resolved" ? "✓ தீர்வு காணப்பட்டது (Resolved)" : t.status === "in_review" ? "⏳ பரிசீலனையில் (In Review)" : "📌 நிலுவையில் (Pending)"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">{t.subject}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span>👤 {t.memberName} ({t.memberPhone})</span>
                      <span>📍 {t.district}</span>
                      <span>📅 {t.createdAt}</span>
                    </div>

                    {t.response && (
                      <div className="w-full bg-blue-50/80 p-2.5 rounded-xl border border-blue-200 text-xs text-blue-900 font-semibold mt-1">
                        <span className="font-black text-blue-700">சங்கத் தலைமை பதில்: </span> {t.response}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Helpline Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <h4 className="text-base font-black text-white">{lang === "ta" ? "அவசர உதவிக்குத் தொடர்புகொள்ள (Emergency Helpline)" : "Emergency Helpline & Support"}</h4>
              <p className="text-xs text-slate-300">
                {lang === "ta" 
                  ? "வேலை தள விபத்துகள் மற்றும் அவசர உதவிகளுக்கு உடனடியாக மாநில அலுவலகத்தைத் தொடர்புகொள்ளவும்." 
                  : "For workplace accidents and urgent union support, call our 24/7 dedicated helpline."}
              </p>
            </div>
            <a
              href="tel:9840012345"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg cursor-pointer flex items-center gap-2 shrink-0 transition-all hover:scale-105"
            >
              <PhoneCall className="w-4 h-4" />
              <span>+91 98400 12345</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
