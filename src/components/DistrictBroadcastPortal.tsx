import React, { useState } from "react";
import { 
  Megaphone, 
  Send, 
  Bell, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Plus, 
  Share2,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import { UserAccount } from "../types";

interface BroadcastMessage {
  id: string;
  title: string;
  titleEn: string;
  district: string;
  message: string;
  senderName: string;
  senderRole: string;
  date: string;
  priority: "normal" | "urgent" | "emergency";
}

interface DistrictBroadcastPortalProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  isSuperAdmin: boolean;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function DistrictBroadcastPortal({
  lang,
  currentUser,
  isSuperAdmin,
  onAddAuditLog
}: DistrictBroadcastPortalProps) {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([
    {
      id: "br_1",
      title: "மாநில செயற்குழுக் கூட்டம் குறித்த அவசர அறிவிப்பு",
      titleEn: "Urgent State Executive Meeting Notice",
      district: "அனைத்து மாவட்டங்கள் (All Districts)",
      message: "வரும் செப்டம்பர் 10 ஆம் தேதி சென்னை தலைமை அலுவலகத்தில் மாநில பெயிண்டர்கள் சங்க செயற்குழுக் கூட்டம் நடைபெறுகிறது. மாவட்ட தலைவர்கள் மற்றும் செயலாளர்கள் தவறாமல் கலந்துகொள்ளவும்.",
      senderName: "ஆர். சேகர் (மாநில தலைவர்)",
      senderRole: "State President",
      date: "2026-08-24",
      priority: "urgent"
    },
    {
      id: "br_2",
      title: "நலவாரிய ஸ்மார்ட் கார்டு புதுப்பித்தல் முகாம்",
      titleEn: "Welfare Board Smart Card Renewal Camp",
      district: "கோயம்புத்தூர்",
      message: "கோயம்புத்தூர் மாவட்ட அலுவலகத்தில் நாளை முதல் மூன்று நாட்களுக்கு நலவாரிய ஸ்மார்ட் கார்டு புதுப்பித்தல் மற்றும் புதிய பதிவு முகாம் நடைபெறுகிறது.",
      senderName: "எஸ். ரமேஷ் (மாவட்ட தலைவர்)",
      senderRole: "District President",
      date: "2026-08-22",
      priority: "normal"
    }
  ]);

  // New broadcast form state (for Admins / Super Admin)
  const [title, setTitle] = useState("");
  const [district, setDistrict] = useState("அனைத்து மாவட்டங்கள் (All Districts)");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<BroadcastMessage["priority"]>("normal");

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert(lang === "ta" ? "தலைப்பு மற்றும் செய்தியை உள்ளிடவும்!" : "Please enter title and message!");
      return;
    }

    const newBroadcast: BroadcastMessage = {
      id: `br_${Date.now()}`,
      title,
      titleEn: title,
      district,
      message,
      senderName: currentUser ? currentUser.name : "Super Admin",
      senderRole: currentUser ? currentUser.role : "super_admin",
      date: new Date().toISOString().split("T")[0],
      priority
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    onAddAuditLog("District Broadcast Sent", `New broadcast sent to ${district}: ${title}`);
    alert(lang === "ta" 
      ? "✓ நேரலை பிராட்காஸ்ட் அறிவிப்பு அனைத்து உறுப்பினர்களின் மொபைல்களுக்கும் வெற்றிகரமாக அனுப்பப்பட்டது!" 
      : "✓ Live broadcast notification dispatched successfully to all member devices!");

    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-purple-900/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/25 border border-purple-400/35 rounded-full text-xs text-purple-300 font-extrabold mb-3">
              <Megaphone className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === "ta" ? "நேரலை மாவட்ட வாட்ஸ்அப் & செய்தி அறிவிப்புகள்" : "Real-Time District Push Broadcasts"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {lang === "ta" ? "அவசர பிராட்காஸ்ட் செய்தி மையம்" : "Live Announcement Broadcast Center"}
            </h1>
            <p className="text-purple-200 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              {lang === "ta"
                ? "மாநிலத் தலைவர் மற்றும் மாவட்ட அட்மின்கள் வெளியிடும் உடனடி வாட்ஸ்அப் / புஷ் அறிவிப்புகளை உடனுக்குடன் படித்துத் தெரிந்து கொள்ளுங்கள்."
                : "Read and receive instant WhatsApp and push broadcast circulars dispatched by state and district admins."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              <span>{lang === "ta" ? "சமீபத்திய நேரலை அறிவிப்புகள் (Active Circulars)" : "Recent Live Broadcasts"}</span>
            </h3>

            <div className="space-y-4">
              {broadcasts.map((br) => (
                <div key={br.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 hover:border-purple-400 transition-all">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-black">
                        {br.district}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        br.priority === "emergency" ? "bg-rose-100 text-rose-800 animate-pulse" :
                        br.priority === "urgent" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {br.priority.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">📅 {br.date}</span>
                  </div>

                  <h4 className="text-base font-black text-slate-900">{br.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{br.message}</p>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-800">👤 {br.senderName} <span className="text-[10px] font-normal">({br.senderRole})</span></span>
                    <button
                      onClick={() => alert(lang === "ta" ? "✓ அறிவிப்பு வாட்ஸ்அப்பில் பகிரப்பட்டது!" : "✓ Broadcast shared to WhatsApp!")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{lang === "ta" ? "வாட்ஸ்அப் பகிர்" : "Share WhatsApp"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dispatch New Broadcast (For Admins / Super Admin) */}
        <div>
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              <span>{lang === "ta" ? "புதிய அறிவிப்பை வெளியிடுக" : "Dispatch Broadcast"}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {lang === "ta"
                ? "மாநில அல்லது மாவட்ட அட்மின்கள் அனைத்து உறுப்பினர்களுக்கும் ஒரே கிளிக்கில் அறிவிப்பை அனுப்பலாம்."
                : "Admins can dispatch circulars instantly to all registered union members."}
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  {lang === "ta" ? "அறிவிப்பு தலைப்பு (Title) *" : "Broadcast Title *"}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="எ.கா: சிறப்பு நலவாரிய முகாம்"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  {lang === "ta" ? "இலக்கு மாவட்டம் (Target District) *" : "Target District *"}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="அனைத்து மாவட்டங்கள் (All Districts)">அனைத்து மாவட்டங்கள் (All Districts)</option>
                  {["சென்னை", "கோயம்புத்தூர்", "மதுரை", "திருச்சி", "சேலம்", "நெல்லை", "வேலூர்", "ஈரோடு", "தஞ்சாவூர்", "திண்டுக்கல்", "விருதுநகர்", "கன்னியாகுமரி"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  {lang === "ta" ? "முன்னுரிமை நிலை (Priority) *" : "Priority Level *"}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="normal">Normal (வழக்கமான அறிவிப்பு)</option>
                  <option value="urgent">Urgent (அவசர அறிவிப்பு)</option>
                  <option value="emergency">Emergency (மிக அவசரம்)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  {lang === "ta" ? "செய்தி உள்ளடக்கம் (Message) *" : "Message Content *"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="உறுப்பினர்களுக்கு அனுப்ப வேண்டிய செய்தி விவரங்களை இங்கே எழுதுக..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{lang === "ta" ? "அறிவிப்பை உடனே அனுப்புக" : "Dispatch Broadcast Now"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
