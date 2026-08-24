import React, { useState, useEffect } from "react";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Crown, 
  Radio, 
  Volume2, 
  VolumeX, 
  Settings, 
  Share2, 
  MessageSquare, 
  Send, 
  Lock, 
  Unlock, 
  Sparkles, 
  Calendar, 
  Plus, 
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Award
} from "lucide-react";
import { UserAccount } from "../types";

interface UnionConferenceStudioProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onAddAuditLog: (action: string, details: string) => void;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  district: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
}

interface ScheduledMeeting {
  id: string;
  title: string;
  titleEn: string;
  date: string;
  time: string;
  host: string;
  roomType: "Video Conference" | "Audio Conference" | "State Leadership Broadcast";
  status: "upcoming" | "live" | "completed";
}

export default function UnionConferenceStudio({
  lang,
  currentUser,
  onAddAuditLog
}: UnionConferenceStudioProps) {
  const role = currentUser?.role || "visitor";
  const isSuperAdmin = role === "super_admin";
  const isStateAdmin = role === "state_admin" || role === "state_president" || role === "state_treasurer" || isSuperAdmin;
  const isLeader = ["union_admin", "district_admin", "state_admin", "state_president", "state_treasurer", "super_admin"].includes(role);

  // Active call state
  const [inCall, setInCall] = useState<boolean>(false);
  const [meetingMode, setMeetingMode] = useState<"video" | "audio" | "broadcast">("video");
  const [activeRoomId, setActiveRoomId] = useState<string>("TNPA-HQ-MASTER-01");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRoomLocked, setIsRoomLocked] = useState<boolean>(false);

  // Chat messages inside meeting
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: "System", text: lang === "ta" ? "காபரன்ஸ் அறை தொடங்கப்பட்டது. சூப்பர் அட்மின் முழுமையான கட்டுப்பாட்டில் உள்ளார்." : "Conference room initialized. Super Admin has supreme master controls.", time: "11:00 AM" }
  ]);
  const [chatInput, setChatInput] = useState<string>("");

  // Participants list simulation
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "p1", name: currentUser?.name || "செல்லப்பாண்டியன் (Super Admin)", role: "Super Admin", district: "தலைமை அலுவலகம் (HQ)", isMuted: false, isVideoOn: true, isSpeaking: true, isHandRaised: false },
    { id: "p2", name: "ஆர். ராஜேஷ் (District Sec)", role: "District Admin", district: "மதுரை", isMuted: true, isVideoOn: true, isSpeaking: false, isHandRaised: false },
    { id: "p3", name: "மு. பாண்டி செல்வம் (State Sec)", role: "State Admin", district: "சென்னை", isMuted: false, isVideoOn: true, isSpeaking: false, isHandRaised: true },
    { id: "p4", name: "க. சக்திவேல் (Treasurer)", role: "State Treasurer", district: "கோயம்புத்தூர்", isMuted: true, isVideoOn: false, isSpeaking: false, isHandRaised: false },
    { id: "p5", name: "ச. முருகேசன் (Leader)", role: "District Admin", district: "திருச்சி", isMuted: true, isVideoOn: true, isSpeaking: false, isHandRaised: false }
  ]);

  // Scheduled Meetings list
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>([
    {
      id: "m_01",
      title: "மாநில மாவட்டச் செயலாளர்கள் அவசர ஆலோசனைக் கூட்டம்",
      titleEn: "State District Secretaries Emergency Consultative Meet",
      date: "2026-08-25",
      time: "04:00 PM",
      host: "சூப்பர் அட்மின் / மாநிலத் தலைவர்",
      roomType: "Video Conference",
      status: "upcoming"
    },
    {
      id: "m_02",
      title: "நலவாரிய நிதியுதவி மற்றும் உறுப்பினர் புதுப்பித்தல் மீளாய்வு",
      titleEn: "Welfare Fund & Member Renewal Review Session",
      date: "2026-08-26",
      time: "11:00 AM",
      host: "மாநில பொருளாளர்",
      roomType: "Audio Conference",
      status: "upcoming"
    }
  ]);

  // New meeting form state (Super Admin / State Admin only)
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [newTitleTa, setNewTitleTa] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<"Video Conference" | "Audio Conference" | "State Leadership Broadcast">("Video Conference");

  // Handle joining meeting
  const handleStartOrJoinMeeting = (mode: "video" | "audio" | "broadcast") => {
    if (!isLeader) {
      alert(lang === "ta" 
        ? "அனுமதி மறுக்கப்பட்டது: வீடியோ / ஆடியோ கான்பரன்ஸ் வசதி பதிவுபெற்ற பொறுப்பாளர்கள் மற்றும் அட்மின்களுக்கு மட்டுமே."
        : "Access Denied: Video & Audio Conference is restricted to registered union leaders and admins.");
      return;
    }
    setMeetingMode(mode);
    setInCall(true);
    onAddAuditLog("Union Conference Joined", `Started/Joined ${mode} conference room: ${activeRoomId} by ${currentUser?.name}`);
  };

  const handleEndMeeting = () => {
    if (!isSuperAdmin && !isStateAdmin) {
      alert(lang === "ta" ? "பொது பங்கேற்பாளர்கள் கூட்டத்தை முடிக்க முடியாது." : "Only Admins can end the conference for all.");
      setInCall(false);
      return;
    }
    if (window.confirm(lang === "ta" ? "இந்தக் கூட்டத்தை அனைவருக்குமாக முடிக்க விரும்புகிறீர்களா?" : "Do you want to end this conference for all participants?")) {
      setInCall(false);
      onAddAuditLog("Union Conference Ended", `Conference room ${activeRoomId} terminated by ${currentUser?.name}`);
    }
  };

  // Super Admin Supreme Controls
  const handleMuteAll = () => {
    if (!isSuperAdmin && !isStateAdmin) {
      alert(lang === "ta" ? "சூப்பர் அட்மின் அல்லது மாநில அட்மின் மட்டுமே அனைவரையும் மியூட் செய்ய முடியும்." : "Only Super Admin or State Admin can mute all participants.");
      return;
    }
    setParticipants(prev => prev.map(p => ({ ...p, isMuted: true })));
    onAddAuditLog("Super Admin Conference Control", `Muted all participants in room ${activeRoomId}`);
    alert(lang === "ta" ? "✓ அனைத்து பங்கேற்பாளர்களும் மியூட் செய்யப்பட்டுள்ளனர்!" : "✓ All participants have been muted by Super Admin command!");
  };

  const handleToggleLockRoom = () => {
    if (!isSuperAdmin) {
      alert(lang === "ta" ? "அறையைப் பூட்டுவதற்கான அதிகாரம் சூப்பர் அட்மினுக்கு மட்டுமே உள்ளது." : "Room locking is restricted to Super Admin.");
      return;
    }
    setIsRoomLocked(!isRoomLocked);
    onAddAuditLog("Super Admin Room Lock", `Room ${activeRoomId} locked state changed to: ${!isRoomLocked}`);
  };

  const handleKickParticipant = (id: string, name: string) => {
    if (!isSuperAdmin) {
      alert(lang === "ta" ? "பங்கேற்பாளரை வெளியேற்ற சூப்பர் அட்மின் அனுமதி தேவை." : "Only Super Admin can remove participants.");
      return;
    }
    if (window.confirm(lang === "ta" ? `${name} அவர்களை கூட்டத்திலிருந்து வெளியேற்றவா?` : `Remove ${name} from conference?`)) {
      setParticipants(prev => prev.filter(p => p.id !== id));
      onAddAuditLog("Super Admin Kick Participant", `Removed ${name} from conference room.`);
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = {
      sender: currentUser?.name || "Responsible Leader",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, msg]);
    setChatInput("");
  };

  const handleCreateMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin && !isStateAdmin) {
      alert(lang === "ta" ? "புதிய கூட்டத்தை சூப்பர் அட்மின் அல்லது மாநில அட்மின் மட்டுமே திட்டமிட இயலும்." : "Only Super Admin / State Admin can schedule meetings.");
      return;
    }
    const newM: ScheduledMeeting = {
      id: `m_${Date.now()}`,
      title: newTitleTa || newTitleEn || "மாநில பொறுப்பாளர்கள் கூட்டம்",
      titleEn: newTitleEn || newTitleTa || "State Leaders Meeting",
      date: newDate || "2026-08-30",
      time: newTime || "10:00 AM",
      host: currentUser?.name || "Super Admin",
      roomType: newType,
      status: "upcoming"
    };
    setScheduledMeetings(prev => [newM, ...prev]);
    setShowNewMeetingModal(false);
    setNewTitleTa("");
    setNewTitleEn("");
    onAddAuditLog("Schedule Union Meeting", `Scheduled new ${newType}: ${newM.title}`);
    alert(lang === "ta" ? "✓ புதிய காபரன்ஸ் கூட்டம் வெற்றிகரமாகத் திட்டமிடப்பட்டது!" : "✓ New union conference meeting successfully scheduled!");
  };

  return (
    <div className="space-y-6 text-left animate-[fadeIn_0.3s_ease-out]">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-stone-900 via-[#b91c1c] to-stone-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500 text-stone-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow">
              {lang === "ta" ? "அட்வான்ஸ் திட்டங்கள் (Advanced Plans)" : "Advanced Union Suite"}
            </span>
            <span className="text-amber-300 text-xs font-bold">
              {lang === "ta" ? "வீடியோ & ஆடியோ கான்பரன்ஸ் ஸ்டுடியோ" : "Video & Audio Conference Studio"}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">
            {lang === "ta" ? "🎥 பொறுப்பாளர்கள் கான்பரன்ஸ் & பிராட்காஸ்ட் மையம்" : "Leaders Video & Audio Conference Center"}
          </h3>
          <p className="text-stone-300 text-xs md:text-sm max-w-2xl">
            {lang === "ta"
              ? "அனைத்து பதிவு செய்யப்பட்ட மாவட்டச் செயலாளர்கள், மாநிலத் தலைவர்கள் மற்றும் பொறுப்பாளர்களுக்கான பாதுகாப்பான வீடியோ மற்றும் ஆடியோ மாநாட்டு அரங்கம். முழுமையான கட்டுப்பாடுகள் சூப்பர் அட்மின் மற்றும் மாநில அட்மின்களிடம் மட்டுமே."
              : "Secure HD Video & Audio conferencing for all registered union leaders across districts. Master controls strictly restricted to Super Admin and State Admins."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          {isLeader ? (
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{lang === "ta" ? `அனுமதிக்கப்பட்டவர்: ${role.replace("_", " ")}` : `Authorized: ${role}`}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-500 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-300">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>{lang === "ta" ? "பொதுப் பார்வை (Leader Access Required)" : "Leader Access Restricted"}</span>
            </div>
          )}
        </div>
      </div>

      {/* IF IN ACTIVE CALL / MEETING */}
      {inCall ? (
        <div className="bg-stone-950 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-6 text-white relative overflow-hidden">
          
          {/* CALL HEADER BAR */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                  {meetingMode === "video" ? "🔴 LIVE HD VIDEO CONFERENCE" : meetingMode === "audio" ? "🎧 LIVE AUDIO CONFERENCE" : "📡 STATE LEADERSHIP BROADCAST"}
                </span>
                <h4 className="text-base font-black text-white">{activeRoomId} - TNPA² Master Assembly</h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-stone-800 text-stone-300 font-bold text-xs rounded-xl flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{participants.length} {lang === "ta" ? "பங்கேற்பாளர்கள்" : "Participants"}</span>
              </span>

              {isSuperAdmin && (
                <span className="px-3 py-1 bg-amber-500 text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{lang === "ta" ? "சூப்பர் அட்மின் மாஸ்டர் கண்ட்ரோல்" : "Super Admin Supreme"}</span>
                </span>
              )}
            </div>
          </div>

          {/* MAIN VIDEO STAGE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[380px]">
            {participants.map((p, idx) => (
              <div 
                key={p.id}
                className="bg-stone-900 border border-stone-800 hover:border-amber-500/60 rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden group transition-all"
              >
                {/* Video feed simulation / Avatar */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <Users className="w-32 h-32 text-stone-700" />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                    p.role === "Super Admin" ? "bg-amber-500 text-stone-950" : "bg-stone-800 text-stone-300"
                  }`}>
                    {p.role}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {p.isMuted ? (
                      <MicOff className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
                    )}

                    {/* Super Admin Action on Participant */}
                    {isSuperAdmin && p.id !== "p1" && (
                      <button
                        onClick={() => handleKickParticipant(p.id, p.name)}
                        className="w-5 h-5 bg-rose-900/80 hover:bg-rose-700 text-white rounded-full text-[10px] flex items-center justify-center cursor-pointer"
                        title="Remove Participant"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Avatar / Initials */}
                <div className="my-auto py-6 text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-[#b91c1c] text-white font-black text-lg mx-auto flex items-center justify-center shadow-lg border-2 border-amber-400">
                    {p.name.slice(0, 2)}
                  </div>
                  <h5 className="font-black text-sm text-white mt-3 truncate">{p.name}</h5>
                  <p className="text-[11px] font-bold text-amber-300">{p.district}</p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-800/80 pt-2 relative z-10">
                  <span>{p.isSpeaking ? "🗣️ Speaking..." : "Listening"}</span>
                  <span className="text-emerald-400 font-bold">HD Audio</span>
                </div>
              </div>
            ))}
          </div>

          {/* SUPER ADMIN SUPREME CONTROLS BAR */}
          {(isSuperAdmin || isStateAdmin) && (
            <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black text-amber-300 uppercase">
                  {lang === "ta" ? "அட்மின் மாஸ்டர் கட்டுப்பாடுகள்:" : "Admin Master Controls:"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleMuteAll}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl cursor-pointer shadow flex items-center gap-1.5"
                >
                  <MicOff className="w-4 h-4" />
                  <span>{lang === "ta" ? "அனைவரையும் மியூட் செய் (Mute All)" : "Mute All Participants"}</span>
                </button>

                {isSuperAdmin && (
                  <button
                    onClick={handleToggleLockRoom}
                    className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer shadow flex items-center gap-1.5 ${
                      isRoomLocked ? "bg-amber-500 text-stone-950" : "bg-stone-800 hover:bg-stone-700 text-white"
                    }`}
                  >
                    {isRoomLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    <span>{isRoomLocked ? (lang === "ta" ? "அறை பூட்டப்பட்டுள்ளது (Locked)" : "Room Locked") : (lang === "ta" ? "அறையைப் பூட்டு (Lock Room)" : "Lock Room")}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer shadow flex items-center gap-1.5 ${
                    isRecording ? "bg-red-600 animate-pulse text-white" : "bg-stone-800 hover:bg-stone-700 text-white"
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>{isRecording ? (lang === "ta" ? "பதிவு செய்யப்படுகிறது..." : "Recording...") : (lang === "ta" ? "கூட்டத்தைப் பதிவு செய் (Record)" : "Record Meeting")}</span>
                </button>
              </div>
            </div>
          )}

          {/* CALL TOOLBAR CONTROLS */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-stone-800">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-2xl font-black text-xs cursor-pointer flex items-center gap-2 transition-all ${
                isMuted ? "bg-rose-600 text-white" : "bg-stone-800 hover:bg-stone-700 text-white"
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isMuted ? (lang === "ta" ? "மியூட் ரத்து" : "Unmute") : (lang === "ta" ? "மியூட்" : "Mute")}</span>
            </button>

            {meetingMode === "video" && (
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-4 rounded-2xl font-black text-xs cursor-pointer flex items-center gap-2 transition-all ${
                  !isVideoOn ? "bg-rose-600 text-white" : "bg-stone-800 hover:bg-stone-700 text-white"
                }`}
              >
                {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                <span>{!isVideoOn ? (lang === "ta" ? "வீடியோ ஆன்" : "Camera On") : (lang === "ta" ? "வீடியோ ஆஃப்" : "Camera Off")}</span>
              </button>
            )}

            <button
              onClick={handleEndMeeting}
              className="px-8 py-4 bg-rose-700 hover:bg-rose-600 text-white font-black text-xs rounded-2xl cursor-pointer shadow-lg flex items-center gap-2 transition-all"
            >
              <PhoneOff className="w-5 h-5" />
              <span>{lang === "ta" ? "கூட்டத்தை முடி / வெளியேறு" : "Leave / End Meeting"}</span>
            </button>
          </div>

        </div>
      ) : (
        /* SCHEDULED MEETINGS & ROOM LAUNCHER */
        <div className="space-y-6">
          
          {/* QUICK LAUNCH BANNER */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black text-[#b91c1c] uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-md">
                {lang === "ta" ? "உடனடி காபரன்ஸ் அறை" : "Instant Conference Room"}
              </span>
              <h4 className="text-xl font-black text-stone-900">
                {lang === "ta" ? "பொறுப்பாளர்கள் நேரலை அரங்கம்" : "Leaders Live Assembly Room"}
              </h4>
              <p className="text-stone-600 text-xs md:text-sm max-w-xl">
                {lang === "ta"
                  ? "எந்த நேரத்திலும் அனைத்து மாவட்ட நிர்வாகிகளுடனும் மாநிலத் தலைவர்களுடனும் உடனடி வீடியோ அல்லது ஆடியோ மாநாட்டைத் தொடங்கலாம்."
                  : "Start an instant high-definition video or audio conference with all union leaders across districts instantly."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => handleStartOrJoinMeeting("video")}
                className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-black text-xs rounded-2xl shadow-lg flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>{lang === "ta" ? "🎥 வீடியோ காபரன்ஸ் தொடங்கு" : "Start Video Conference"}</span>
              </button>

              <button
                onClick={() => handleStartOrJoinMeeting("audio")}
                className="px-6 py-3.5 bg-[#b91c1c] hover:bg-rose-800 text-white font-black text-xs rounded-2xl shadow-lg flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>{lang === "ta" ? "🎧 ஆடியோ காபரன்ஸ் தொடங்கு" : "Start Audio Conference"}</span>
              </button>

              {(isSuperAdmin || isStateAdmin) && (
                <button
                  onClick={() => setShowNewMeetingModal(true)}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-2xl shadow-lg flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === "ta" ? "📅 புதிய கூட்டத்தைத் திட்டமிடு" : "Schedule Meeting"}</span>
                </button>
              )}
            </div>
          </div>

          {/* SCHEDULED MEETINGS LIST */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="font-black text-stone-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#b91c1c]" />
                <span>{lang === "ta" ? "வரவிருக்கும் கூட்டங்கள் மற்றும் பிராட்காஸ்ட்கள்" : "Upcoming Scheduled Meetings & Broadcasts"}</span>
              </h4>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                {scheduledMeetings.length} {lang === "ta" ? "நிகழ்வுகள்" : "Events"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduledMeetings.map((m) => (
                <div 
                  key={m.id}
                  className="bg-stone-50 border border-stone-200 hover:border-amber-400 rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 bg-rose-100 text-[#b91c1c] text-[10px] font-black uppercase rounded">
                        {m.roomType}
                      </span>
                      <span className="text-xs font-extrabold text-stone-500">
                        📅 {m.date} | ⏰ {m.time}
                      </span>
                    </div>

                    <h5 className="font-black text-stone-900 text-sm">
                      {lang === "ta" ? m.title : m.titleEn}
                    </h5>

                    <p className="text-xs text-stone-600">
                      <strong>{lang === "ta" ? "நடத்துபவர்: " : "Host: "}</strong>{m.host}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {lang === "ta" ? "பதிவு செய்தவர்கள் அனைவரும் பங்கேற்கலாம்" : "Open for all Leaders"}
                    </span>

                    <button
                      onClick={() => handleStartOrJoinMeeting(m.roomType === "Audio Conference" ? "audio" : "video")}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-black rounded-xl cursor-pointer shadow"
                    >
                      {lang === "ta" ? "சேரு (Join Room)" : "Join Room"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SCHEDULE NEW MEETING MODAL (SUPER ADMIN / STATE ADMIN ONLY) */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 text-left">
            
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#b91c1c]" />
                <span>{lang === "ta" ? "புதிய காபரன்ஸ் கூட்டத்தைத் திட்டமிடு" : "Schedule New Union Conference"}</span>
              </h3>
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeetingSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                  {lang === "ta" ? "கூட்ட தலைப்பு (தமிழ்)" : "Meeting Title (Tamil)"}
                </label>
                <input
                  type="text"
                  placeholder="எ.கா: மாநில நிர்வாகிகள் மாதாந்திர ஆய்வுக்கூட்டம்"
                  value={newTitleTa}
                  onChange={(e) => setNewTitleTa(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                  {lang === "ta" ? "கூட்ட தலைப்பு (English)" : "Meeting Title (English)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Leaders Monthly Review Meet"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "தேதி (Date)" : "Date"}
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                    {lang === "ta" ? "நேரம் (Time)" : "Time"}
                  </label>
                  <input
                    type="text"
                    placeholder="04:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase mb-1">
                  {lang === "ta" ? "கான்ஃபரன்ஸ் வகை (Conference Type)" : "Conference Type"}
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                >
                  <option value="Video Conference">Video Conference (HD)</option>
                  <option value="Audio Conference">Audio Conference</option>
                  <option value="State Leadership Broadcast">State Leadership Broadcast</option>
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  {lang === "ta" ? "ரத்து செய்" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#b91c1c] hover:bg-rose-800 text-white font-black text-xs rounded-xl cursor-pointer shadow flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === "ta" ? "திட்டமிடு & வெளியிடு" : "Schedule Meeting"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
