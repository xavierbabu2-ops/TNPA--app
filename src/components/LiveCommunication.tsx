import React, { useState, useEffect, useRef } from "react";
import { 
  Video, Calendar, Users, BarChart3, PlusCircle, Volume2, 
  Send, Trash2, Check, AlertCircle, Share2, Bell, Download, 
  MapPin, Clock, User, Award, Shield, MessageSquare, Plus, 
  CheckSquare, CheckCircle2, ShieldAlert, ArrowRight, HelpCircle, 
  FileText, Camera, Paperclip, Vote, ChevronRight, Play, MicOff, Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Meeting {
  id: string;
  name: string;
  type: string;
  description: string;
  district: string;
  state: string;
  date: string;
  time: string;
  endTime: string;
  speaker: string;
  chiefGuest: string;
  banner: string;
  link: string;
  password?: string;
  status: "live" | "upcoming" | "past";
}

interface ChatMessage {
  id: string;
  user: string;
  role: string;
  message: string;
  timestamp: string;
  isPinned?: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: { label: string; votes: number }[];
  votedOption?: number;
}

interface QAQuestion {
  id: string;
  user: string;
  question: string;
  category: "Welfare" | "Legal" | "Safety" | "General";
  status: "pending" | "approved";
  answer?: string;
}

interface LiveCommunicationProps {
  lang: "ta" | "en";
  currentUser: any;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function LiveCommunication({ lang, currentUser, onAddAuditLog }: LiveCommunicationProps) {
  // 1. ACTIVE TABS
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "live_stream" | "calendar" | "analytics" | "admin_panel">("dashboard");
  
  // 2. SCROLLING ANNOUNCEMENT BAR
  const [announcements] = useState([
    { id: 1, text: "🔴 நேரடி ஒளிபரப்பு: மாநில செயற்குழு கூட்டம் இன்று மாலை 4:00 மணிக்கு துவங்குகிறது.", textEn: "🔴 Live stream: State Executive Committee Meeting starts today at 4:00 PM." },
    { id: 2, text: "🔥 புதிய அறிவிப்பு: அரசு ஓவியர் நல வாரியத்தின் ஓய்வூதியத் தொகை உயர்வு விவாதம்.", textEn: "🔥 Announcement: Pension raise discussion for government welfare board artists." },
    { id: 3, text: "⚠️ முக்கிய அறிவிப்பு: ஆகஸ்ட் 15 சுதந்திர தின சிறப்பு ஓவிய முகாம் திட்டங்கள்.", textEn: "⚠️ Emergency Notice: Special Independence Day Painting Camps and Planning." }
  ]);
  const [activeAnnIdx, setActiveAnnIdx] = useState(0);

  // 3. MEETINGS STATE
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: "meet_1",
      name: "மாநில செயற்குழு கூட்டம் 2026",
      type: "Executive Meeting",
      description: "தமிழ்நாடு முழுவதும் உள்ள பெயிண்டர்கள் மற்றும் ஓவியர்களின் உரிமைகள் மற்றும் நலவாரிய நிதி உயர்வு பற்றிய ஆலோசனைக் கூட்டம்.",
      district: "All Districts",
      state: "Tamil Nadu",
      date: "2026-08-04",
      time: "16:00",
      endTime: "18:00",
      speaker: "திரு. சுந்தரமூர்த்தி (மாநில தலைவர்)",
      chiefGuest: "மாண்புமிகு தொழிலாளர் நலத்துறை அமைச்சர்",
      banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800",
      link: "https://youtu.be/live_meeting_tnpa",
      password: "TNPA_EXECUTIVE",
      status: "live"
    },
    {
      id: "meet_2",
      name: "மதுரை மாவட்ட ஓவியர்கள் விழிப்புணர்வு முகாம்",
      type: "Labour Welfare Awareness Programs",
      description: "அரசு நலவாரிய திட்டங்களில் சேர்வது எப்படி? பாதுகாப்பு உபகரணங்கள் கையாளுதல் பற்றிய இலவசப் பயிற்சி.",
      district: "Madurai",
      state: "Tamil Nadu",
      date: "2026-08-05",
      time: "10:00",
      endTime: "13:00",
      speaker: "திரு. கே. பாலு (மதுரை மாவட்ட செயலாளர்)",
      chiefGuest: "திரு. ஆறுமுகம் (மாவட்ட தொழிலாளர் நல அதிகாரி)",
      banner: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
      link: "https://meet.google.com/abc-defg-hij",
      status: "upcoming"
    },
    {
      id: "meet_3",
      name: "பெயிண்டர்களுக்கான நவீன ஸ்ப்ரே நுட்பங்கள் பயிற்சி வகுப்பு",
      type: "Training Classes",
      description: "நவீன தொழில்முறை ஸ்ப்ரே பெயிண்டிங் மற்றும் சுவர்கள் வடிவமைப்பு குறித்த நேரடி செயல்முறை பயிற்சி.",
      district: "Coimbatore",
      state: "Tamil Nadu",
      date: "2026-08-03",
      time: "11:00",
      endTime: "14:00",
      speaker: "பொறியாளர் திரு. ராஜேஷ் (தொழில்நுட்ப நிபுணர்)",
      chiefGuest: "திரு. கே.வி. ராமன் (தொழிலதிபர்)",
      banner: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800",
      link: "https://zoom.us/j/past_training_id",
      status: "past"
    }
  ]);

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("meet_1");
  const activeMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0];

  // 4. CREATE MEETING FORM STATES
  const [newMeetName, setNewMeetName] = useState("");
  const [newMeetType, setNewMeetType] = useState("Executive Meeting");
  const [newMeetDesc, setNewMeetDesc] = useState("");
  const [newMeetDistrict, setNewMeetDistrict] = useState("All Districts");
  const [newMeetState, setNewMeetState] = useState("Tamil Nadu");
  const [newMeetDate, setNewMeetDate] = useState("");
  const [newMeetTime, setNewMeetTime] = useState("");
  const [newMeetEndTime, setNewMeetEndTime] = useState("");
  const [newMeetSpeaker, setNewMeetSpeaker] = useState("");
  const [newMeetChief, setNewMeetChief] = useState("");
  const [newMeetLink, setNewMeetLink] = useState("https://youtube.com/live/example");
  const [newMeetPassword, setNewMeetPassword] = useState("");
  const [bannerPreview, setBannerPreview] = useState("https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800");

  // Notifications timing configuration
  const [notifyImmediately, setNotifyImmediately] = useState(true);
  const [notify24Hours, setNotify24Hours] = useState(true);
  const [notify3Hours, setNotify3Hours] = useState(false);
  const [notify1Hour, setNotify1Hour] = useState(true);
  const [notify15Mins, setNotify15Mins] = useState(true);
  const [notifyOnStart, setNotifyOnStart] = useState(true);

  // 5. LIVE INTERACTIVE ROOM STATES (CHAT, POLLS, Q&A, ATTENDANCE)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "c1", user: "முத்துசாமி (திருச்சி)", role: "member", message: "மாநில தலைவர் அவர்களுக்கு வணக்கம். நலவாரிய விபத்து நிதி உயர்வு எப்போது அமலுக்கு வரும்?", timestamp: "16:05" },
    { id: "c2", user: "நிர்வாகி (சென்னை)", role: "super_admin", message: "வணக்கம் முத்துசாமி. இது குறித்து இன்றைய கூட்டத்தில் தொழிலாளர் துறை அமைச்சரிடம் மனு அளிக்க உள்ளோம்.", timestamp: "16:06" },
    { id: "c3", user: "சிவக்குமார் (கோவை)", role: "member", message: "நவீன ஸ்ப்ரே பெயிண்டிங் கருவிகள் வாங்க மானியம் கிடைக்குமா?", timestamp: "16:10", isPinned: true }
  ]);
  const [currentChatInput, setCurrentChatInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Interactive Poll
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: "poll_1",
      question: "அடுத்த கூட்டுறவு ஓவியப் பயிற்சி முகாம் எங்கு நடத்தப்பட வேண்டும்?",
      options: [
        { label: "மதுரை (Madurai)", votes: 45 },
        { label: "சேலம் (Salem)", votes: 28 },
        { label: "திருநெல்வேலி (Nellai)", votes: 37 },
        { label: "திருச்சி (Trichy)", votes: 52 }
      ],
      votedOption: undefined
    }
  ]);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState("சென்னை\nகடலூர்\nவேலூர்");

  // Interactive Q&A Session
  const [questions, setQuestions] = useState<QAQuestion[]>([
    { id: "q1", user: "கிருஷ்ணன் (சேலம்)", question: "ஓவியர் நலவாரிய அடையாள அட்டை பெற எத்தனை நாட்கள் ஆகும்?", category: "Welfare", status: "approved", answer: "பொதுவாக விண்ணப்பித்த 15 நாட்களுக்குள் சரிபார்க்கப்பட்டு அட்டை வழங்கப்படும்." },
    { id: "q2", user: "ராமலிங்கம் (நெல்லை)", question: "உயரத்தில் வேலை செய்யும் போது தவறி விழுந்தால் காப்பீடு பெற என்னென்ன ஆவணங்கள் தேவை?", category: "Safety", status: "pending" },
    { id: "q3", user: "விஜயகுமார் (ஈரோடு)", question: "சங்கத்தின் மூலம் பெயிண்டிங் ஒப்பந்தங்களுக்கு வக்கீல் உதவி கிடைக்குமா?", category: "Legal", status: "approved" }
  ]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState<"Welfare" | "Legal" | "Safety" | "General">("Welfare");

  // AI Live Assistant
  const [aiAssistantTab, setAiAssistantTab] = useState<"faq" | "agenda" | "translate" | "notes">("faq");
  const [aiAssistantNotes, setAiAssistantNotes] = useState<string[]>([
    "• மாநிலத் தலைவர் உரையைத் தொடங்கினார் - சங்க உறுப்பினர்களின் வளர்ச்சி குறித்து உரை.",
    "• தொழிலாளர் நல வாரியத்தில் பதிவு செய்வதன் நன்மைகள் விவரிக்கப்பட்டன.",
    "• பாதுகாப்பு பெல்ட் மற்றும் ஹெல்மெட் பயன்பாடு கட்டாயமாக்கப்பட வேண்டும் என முடிவு."
  ]);
  const [aiAssistantQuestion, setAiAssistantQuestion] = useState("");
  const [aiAssistantAnswers, setAiAssistantAnswers] = useState<{ q: string; a: string }[]>([
    { q: "நலவாரிய மரண நிதி உதவி எவ்வளவு?", a: "பணியின் போது விபத்து மரண நிதி உதவி ₹5,00,000 அரசு மூலமும் மற்றும் சங்கத்தின் அவசர நிதியாக ₹1,00,000-ம் உடனடியாக வழங்கப்படுகிறது." }
  ]);

  // Attendance State
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([
    { id: "att_1", name: "கார்த்திகேயன் (மதுரை)", district: "Madurai", checkIn: "15:58", status: "Ontime", duration: "120 mins" },
    { id: "att_2", name: "அன்பழகன் (சென்னை)", district: "Chennai", checkIn: "16:05", status: "Ontime", duration: "115 mins" },
    { id: "att_3", name: "துரைராஜ் (சேலம்)", district: "Salem", checkIn: "16:22", status: "Late Entry", duration: "98 mins" }
  ]);
  const [memberCheckedIn, setMemberCheckedIn] = useState(false);
  const [lateThreshold, setLateThreshold] = useState("16:15");

  // Meeting Saved Artifacts
  const [artifacts, setArtifacts] = useState({
    recordingUrl: "https://youtu.be/past_recording_sample",
    presentation: "TNPA_Welfare_Presentation_2026.pdf",
    photos: ["Photo_Executive_1.jpg", "Photo_Executive_2.jpg"],
    minutesDraft: {
      summary: "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் மாநிலக் கூட்டத்தில் தொழிலாளர் நல அமைச்சர் முன்னிலையில் முக்கிய கோரிக்கைகள் அடங்கிய மனு சமர்ப்பிக்கப்பட்டது. ஓவியர்களின் நலன் காக்கும் பல்வேறு தீர்மானங்கள் நிறைவேற்றப்பட்டன.",
      decisions: [
        "உயரமான பணிகளில் பணிபுரியும் போது டபுள்-ஹூக் பெல்ட் அணிவதை 100% கட்டாயமாக்குவது.",
        "ஒவ்வொரு மாவட்டத்திலும் மாதம் ஒருமுறை நலவாரிய இலவச விழிப்புணர்வு முகாம்கள் நடத்துவது."
      ],
      actionItems: [
        "சென்னை மாவட்டச் செயலாளர் - தொழிலாளர் துறை இயக்குநரைச் சந்தித்து புதிய உறுப்பினர் விண்ணப்பங்களை விரைவுபடுத்துதல்.",
        "கோவை மாவட்டத் தலைவர் - நவீன பெயிண்டிங் கருவிகள் பயிற்சிப் பயிலரங்கிற்கு ஏற்பாடு செய்தல்."
      ]
    }
  });

  // 6. GENERAL TIMERS & MARQUEE ROTATION
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnnIdx((prev) => (prev + 1) % announcements.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  // Handler to post a live chat message
  const handleSendChat = () => {
    if (!currentChatInput.trim()) return;
    if (isMuted) {
      alert("You are muted by the administrator.");
      return;
    }
    const newMessage: ChatMessage = {
      id: `chat_${Date.now()}`,
      user: currentUser ? `${currentUser.name} (${currentUser.district || "visitor"})` : "விருந்தினர்",
      role: currentUser ? currentUser.role : "visitor",
      message: currentChatInput,
      timestamp: new Date().toLocaleTimeString("ta-IN", { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setCurrentChatInput("");
    onAddAuditLog("Live Chat Message", `Posted: ${currentChatInput.substring(0, 30)}...`);
  };

  // Chat Moderation Handlers (Admin)
  const handlePinMessage = (msgId: string) => {
    setChatMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPinned: !m.isPinned } : m));
    onAddAuditLog("Pin Live Chat Message", `Toggled pin for message ID: ${msgId}`);
  };

  const handleDeleteMessage = (msgId: string) => {
    setChatMessages(prev => prev.filter(m => m.id !== msgId));
    onAddAuditLog("Delete Live Chat Message", `Admin deleted message ID: ${msgId}`);
  };

  const handleBlockUser = (username: string) => {
    setBlockedUsers(prev => [...prev, username]);
    alert(`${username} has been blocked from chat.`);
    onAddAuditLog("Block User", `Admin blocked user: ${username}`);
  };

  // Poll Voting Handler
  const handleVote = (pollId: string, optionIdx: number) => {
    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        if (p.votedOption !== undefined) return p; // Cannot vote twice
        const newOpts = [...p.options];
        newOpts[optionIdx].votes += 1;
        return { ...p, options: newOpts, votedOption: optionIdx };
      }
      return p;
    }));
    onAddAuditLog("Submit Live Poll Vote", `Voted for option index ${optionIdx} on poll ${pollId}`);
  };

  // Post Question Handler
  const handlePostQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: QAQuestion = {
      id: `q_${Date.now()}`,
      user: currentUser ? currentUser.name : "உறுப்பினர்",
      question: newQuestionText,
      category: newQuestionCategory,
      status: "pending"
    };
    setQuestions(prev => [newQ, ...prev]);
    setNewQuestionText("");
    alert(lang === "ta" ? "உங்கள் கேள்வி ஒப்புதலுக்கு அனுப்பப்பட்டது." : "Your question sent for moderator approval.");
    onAddAuditLog("Post Live Q&A Question", `Submitted question: ${newQuestionText.substring(0, 35)}...`);
  };

  // Q&A Moderation Handlers (Admin)
  const handleApproveQuestion = (qId: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, status: "approved" } : q));
    onAddAuditLog("Approve Q&A Question", `Approved question ID: ${qId}`);
  };

  const handleAnswerQuestion = (qId: string, answerText: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, answer: answerText } : q));
    onAddAuditLog("Answer Q&A Question", `Answered question ID: ${qId}`);
  };

  // AI Assistant Ask FAQ Handler
  const handleAskAI = () => {
    if (!aiAssistantQuestion.trim()) return;
    
    // Simple custom responses
    let response = "கேள்விக்கு நன்றி. இது தொடர்பான விரிவான விவரங்கள் சங்கத்தின் சட்டவிதிகளில் கூறப்பட்டுள்ளன.";
    if (aiAssistantQuestion.includes("நலவாரியம்") || aiAssistantQuestion.includes("welfare")) {
      response = "நலவாரியத்தில் உறுப்பினராக பதிவு பெற குறைந்தது 18 வயது இருக்க வேண்டும், கடந்த ஒரு வருடத்தில் 90 நாட்கள் பெயிண்டிங் வேலை செய்ததற்கான சான்று அவசியம்.";
    } else if (aiAssistantQuestion.includes("பாதுகாப்பு") || aiAssistantQuestion.includes("safety")) {
      response = "பணியிடங்களில் 10 அடி உயரத்திற்கு மேல் பணிபுரியும் போது டபுள்-ஹூக் பாதுகாப்பு பெல்ட், ஹெல்மெட் மற்றும் கவச ஆடை அணிவது சங்கத்தின் விதிமுறைகளின்படி கட்டாயமாகும்.";
    } else if (aiAssistantQuestion.includes("சந்தா") || aiAssistantQuestion.includes("subscription")) {
      response = "ஆண்டு உறுப்பினர் புதுப்பிப்பு சந்தா ₹500 ஆகும். இதை ஆன்லைன் மூலமாகவோ அல்லது மாவட்ட செயலாளரிடமோ செலுத்தலாம்.";
    }

    setAiAssistantAnswers(prev => [...prev, { q: aiAssistantQuestion, a: response }]);
    setAiAssistantQuestion("");
  };

  // Attendance Log Join Button Handler
  const handleMemberCheckIn = () => {
    if (memberCheckedIn) return;
    setMemberCheckedIn(true);
    const newLog = {
      id: `att_${Date.now()}`,
      name: currentUser ? `${currentUser.name} (${currentUser.district || "Member"})` : "நடப்பு உறுப்பினர்",
      district: currentUser ? currentUser.district || "General" : "General",
      checkIn: new Date().toLocaleTimeString("ta-IN", { hour: "2-digit", minute: "2-digit" }),
      status: "Ontime",
      duration: "Calculated at Exit"
    };
    setAttendanceLogs(prev => [newLog, ...prev]);
    onAddAuditLog("Attendance Checked-In", `${newLog.name} registered via Join Live button.`);
    alert(lang === "ta" ? "உங்கள் வருகை வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!" : "Your attendance has been registered successfully!");
  };

  // Create Meeting Handler
  const handleCreateMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetName.trim()) {
      alert("Please enter meeting name");
      return;
    }
    const newMeet: Meeting = {
      id: `meet_${Date.now()}`,
      name: newMeetName,
      type: newMeetType,
      description: newMeetDesc,
      district: newMeetDistrict,
      state: newMeetState,
      date: newMeetDate || new Date().toISOString().split("T")[0],
      time: newMeetTime || "18:00",
      endTime: newMeetEndTime || "20:00",
      speaker: newMeetSpeaker,
      chiefGuest: newMeetChief,
      banner: bannerPreview,
      link: newMeetLink,
      password: newMeetPassword || undefined,
      status: "upcoming"
    };

    setMeetings(prev => [...prev, newMeet]);
    
    // Simulate auto-notifications triggered
    alert(
      lang === "ta" 
        ? `கூட்டம் உருவாக்கப்பட்டது! உறுப்பினர்களுக்குத் தானியங்கி அறிவிப்புகள் அனுப்பப்பட்டன: \n- உட்செயலி அறிவிப்பு (In-App) \n- மின்னஞ்சல் (Email) \n- புஷ் அறிவிப்பு (Push Notification)`
        : `Meeting created! Auto-notifications dispatched to members via In-App, Email & Push alerts.`
    );

    onAddAuditLog("Create Meeting", `Created: ${newMeetName} (${newMeetType}) for ${newMeetDistrict}`);
    
    // Reset Form
    setNewMeetName("");
    setNewMeetDesc("");
    setNewMeetSpeaker("");
    setNewMeetChief("");
    setActiveSubTab("dashboard");
  };

  // Admin Manual Attendance Check-In
  const handleManualCheckIn = (name: string, district: string) => {
    const newLog = {
      id: `att_${Date.now()}`,
      name,
      district,
      checkIn: "16:10",
      status: "Admin Manual",
      duration: "110 mins"
    };
    setAttendanceLogs(prev => [newLog, ...prev]);
    onAddAuditLog("Admin Manual Attendance", `Added attendee: ${name}`);
  };

  // Create Poll from Admin Tab
  const handleCreatePoll = () => {
    if (!newPollQuestion.trim()) return;
    const optionsArray = newPollOptions.split("\n").filter(o => o.trim()).map(o => ({ label: o.trim(), votes: 0 }));
    if (optionsArray.length < 2) {
      alert("Please enter at least 2 options");
      return;
    }
    const newP: Poll = {
      id: `poll_${Date.now()}`,
      question: newPollQuestion,
      options: optionsArray
    };
    setPolls(prev => [newP, ...prev]);
    setNewPollQuestion("");
    setNewPollOptions("சென்னை\nகடலூர்\nவேலூர்");
    alert("New live poll created for members!");
    onAddAuditLog("Create Live Poll", `Question: ${newPollQuestion}`);
  };

  // Calendar event helpers
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const scheduledMeetingsMap: Record<number, Meeting[]> = {
    4: meetings.filter(m => m.date === "2026-08-04"),
    5: meetings.filter(m => m.date === "2026-08-05"),
    15: [
      { id: "ind_day", name: "சுதந்திர தின சிறப்பு ஓவியப் போட்டி", type: "Special Announcements", description: "அனைத்து மாவட்டங்களிலும் ஓவியப் போட்டி", district: "All Districts", state: "Tamil Nadu", date: "2026-08-15", time: "09:00", endTime: "12:00", speaker: "தலைமை நடுவர் குழு", chiefGuest: "மாநில செயலர்", banner: "", link: "", status: "upcoming" }
    ]
  };

  return (
    <div className="w-full space-y-6 text-left font-sans">
      
      {/* 1. SCROLLING ANNOUNCEMENT BAR (GLASS UI) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#7f1d1d] to-[#1e1b4b] border-y-2 border-amber-500 py-2 px-4 shadow-md flex items-center gap-3">
        <div className="shrink-0 bg-yellow-400 text-[#7f1d1d] font-black text-[10px] md:text-xs px-2.5 py-1 rounded uppercase tracking-wider animate-pulse flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{lang === "ta" ? "முக்கிய அறிவிப்பு" : "Breaking News"}</span>
        </div>
        <div className="flex-1 overflow-hidden h-6 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeAnnIdx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white font-semibold text-xs md:text-sm truncate mt-0.5"
            >
              {lang === "ta" ? announcements[activeAnnIdx].text : announcements[activeAnnIdx].textEn}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex gap-1">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveAnnIdx(i)}
              className={`h-2 w-2 rounded-full transition-all ${activeAnnIdx === i ? "bg-amber-400 w-4" : "bg-white/40"}`}
            />
          ))}
        </div>
      </div>

      {/* 2. SUB-NAVIGATION FOR COMMUNICATION MODULE */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "dashboard", label: "அரங்கு & கூட்டங்கள்", labelEn: "Meetings Arena", icon: <Video className="w-4 h-4" /> },
            { id: "live_stream", label: "நேரடி ஒளிபரப்பு", labelEn: "Live Streaming", icon: <Play className="w-4 h-4 text-red-600 animate-pulse" /> },
            { id: "calendar", label: "நிகழ்வு நாட்காட்டி", labelEn: "Union Calendar", icon: <Calendar className="w-4 h-4" /> },
            { id: "analytics", label: "பங்கேற்பு அறிக்கை", labelEn: "Participation Reports", icon: <BarChart3 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                if (tab.id === "live_stream") {
                  onAddAuditLog("Join Stream Arena", `Opened Live Stream page for: ${activeMeeting.name}`);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? "bg-[#b91c1c] text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {tab.icon}
              <span>{lang === "ta" ? tab.label : tab.labelEn}</span>
            </button>
          ))}

          {/* Super Admin Tab */}
          {currentUser && currentUser.role === "super_admin" && (
            <button
              onClick={() => setActiveSubTab("admin_panel")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
                activeSubTab === "admin_panel"
                  ? "bg-amber-500 text-stone-950 border-amber-600 font-black"
                  : "text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === "ta" ? "புதிய கூட்டம் உருவாக்கு" : "Create Meeting (Admin)"}</span>
            </button>
          )}
        </div>

        <div className="text-xs text-stone-500 flex items-center gap-1 font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{lang === "ta" ? "ஒலிபரப்பு இணைப்பு இயங்குகிறது" : "Live Feed Synced"}</span>
        </div>
      </div>

      {/* 3. MAIN TAB VIEWS */}
      
      {/* TAB A: MEETING ARENA & DASHBOARD */}
      {activeSubTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Meeting Catalog */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Indicator Hero Banner */}
            <div className="bg-gradient-to-br from-[#7f1d1d] via-[#a21caf] to-[#1e1b4b] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-white/10">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Video className="w-64 h-64 text-white" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-red-600 text-white font-black text-[10px] rounded-full uppercase tracking-wider animate-bounce flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                    {lang === "ta" ? "நேரலையில் உள்ளது" : "LIVE NOW"}
                  </span>
                  <span className="px-3 py-1 bg-black/40 text-amber-300 font-extrabold text-[10px] rounded-full uppercase">
                    {meetings[0].type}
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="text-xl md:text-2xl font-black text-amber-400">
                    {meetings[0].name}
                  </h3>
                  <p className="text-stone-200 text-xs md:text-sm leading-relaxed max-w-xl">
                    {meetings[0].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-xs text-stone-200">
                  <div className="flex items-center gap-1.5 bg-black/30 p-2 rounded-xl">
                    <User className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[9px] text-stone-400 block">{lang === "ta" ? "முதன்மை பேச்சாளர்" : "Speaker"}</span>
                      <span className="font-bold truncate">{meetings[0].speaker}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/30 p-2 rounded-xl">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <div>
                      <span className="text-[9px] text-stone-400 block">{lang === "ta" ? "சிறப்பு விருந்தினர்" : "Chief Guest"}</span>
                      <span className="font-bold truncate">{meetings[0].chiefGuest}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/30 p-2 rounded-xl">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <div>
                      <span className="text-[9px] text-stone-400 block">{lang === "ta" ? "மாவட்டம் / மாநிலம்" : "Scope"}</span>
                      <span className="font-bold">{meetings[0].district}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/30 p-2 rounded-xl">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[9px] text-stone-400 block">{lang === "ta" ? "நேரம்" : "Time Slot"}</span>
                      <span className="font-bold">{meetings[0].time} - {meetings[0].endTime}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedMeetingId(meetings[0].id);
                      setActiveSubTab("live_stream");
                    }}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-current text-stone-950" />
                    <span>{lang === "ta" ? "இப்போதே இணைவீர்" : "Join Stream Now"}</span>
                  </button>

                  <button
                    onClick={handleMemberCheckIn}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer border border-white/20"
                  >
                    {memberCheckedIn ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-4 h-4" /> {lang === "ta" ? "வருகை பதிவானது" : "Attended"}
                      </span>
                    ) : (
                      lang === "ta" ? "வருகை பதிவு செய்க" : "Check-In Attendance"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Complete Catalog List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-stone-900 text-sm tracking-wide uppercase">
                  {lang === "ta" ? "சங்க கூட்டங்களின் பட்டியல்" : "UNION MEETINGS CATALOG"}
                </h4>
                <span className="text-xs text-stone-500 font-bold">
                  {meetings.length} {lang === "ta" ? "கூட்டங்கள் கண்டறியப்பட்டது" : "Meetings Configured"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meetings.map((meet, idx) => (
                  <div
                    key={`lc_meet_${meet.id}_${idx}`}
                    className={`bg-white border rounded-2xl overflow-hidden transition-all text-left flex flex-col justify-between ${
                      selectedMeetingId === meet.id
                        ? "border-amber-500 ring-2 ring-amber-500/10 shadow"
                        : "border-stone-200 hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Banner Image */}
                      <div className="h-32 w-full bg-stone-100 relative">
                        <img
                          src={meet.banner}
                          alt={meet.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase text-white rounded ${
                            meet.status === "live" ? "bg-red-600 animate-pulse" :
                            meet.status === "upcoming" ? "bg-amber-500" : "bg-stone-500"
                          }`}>
                            {lang === "ta"
                              ? (meet.status === "live" ? "நேரலை" : meet.status === "upcoming" ? "அடுத்த கூட்டம்" : "முடிந்தது")
                              : meet.status.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-black/60 text-white rounded">
                            {meet.type.split(" ")[0]}
                          </span>
                        </div>
                      </div>

                      {/* Info Body */}
                      <div className="p-4 space-y-2">
                        <h5 className="font-extrabold text-stone-900 text-xs md:text-sm line-clamp-2">
                          {meet.name}
                        </h5>
                        <p className="text-stone-500 text-[11px] line-clamp-2 leading-relaxed">
                          {meet.description}
                        </p>

                        <div className="pt-2 border-t border-stone-100 space-y-1.5 text-[10px] text-stone-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>{meet.date} | {meet.time} - {meet.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            <span>{meet.district} • {meet.state}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-stone-400" />
                            <span className="truncate"><b>{lang === "ta" ? "தலைமை:" : "Speaker:"}</b> {meet.speaker}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="p-4 pt-0 bg-stone-50 border-t border-stone-100 flex gap-2 justify-between items-center">
                      <div className="flex gap-1">
                        {/* Download notice file */}
                        <button
                          onClick={() => {
                            alert(lang === "ta" ? "அதிகாரப்பூர்வ கூட்ட சுற்றறிக்கை PDF பதிவிறக்கம் செய்யப்படுகிறது." : "Downloading official circular PDF.");
                            onAddAuditLog("Download Notice", `Notice downloaded for ${meet.name}`);
                          }}
                          title="Download PDF"
                          className="p-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 text-stone-700 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {/* Add Reminder button */}
                        <button
                          onClick={() => {
                            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meet.name)}&dates=20260804T160000Z/20260804T180000Z&details=${encodeURIComponent(meet.description)}`;
                            window.open(calendarUrl, "_blank");
                            onAddAuditLog("Add Reminder Google Calendar", `Google reminder window opened for: ${meet.name}`);
                          }}
                          title="Add to Google Calendar"
                          className="p-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 text-stone-700 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#b91c1c]" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedMeetingId(meet.id);
                          setActiveSubTab("live_stream");
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                          selectedMeetingId === meet.id
                            ? "bg-[#b91c1c] text-white"
                            : "bg-white hover:bg-stone-100 text-stone-800 border border-stone-200"
                        }`}
                      >
                        {meet.status === "past"
                          ? (lang === "ta" ? "பதிவு காண்க" : "Watch Recording")
                          : (lang === "ta" ? "விவரங்கள் & இணை" : "Details & Join")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Mini Dashboard widgets */}
          <div className="space-y-6">
            
            {/* Live Streaming Indicator Widget */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider pb-2 border-b border-stone-100">
                {lang === "ta" ? "ஒளிபரப்பு சாதனங்கள்" : "STREAMING HARDWARE COMPATIBILITY"}
              </h4>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                {lang === "ta" ? "நமது தளம் அனைத்து முன்னணி நேரடி ஒளிபரப்பு சாதனங்களையும் ஆதரிக்கிறது." : "Compatible with premier low-latency live streaming protocols."}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: "YouTube Live", active: true },
                  { name: "Google Meet", active: true },
                  { name: "Zoom", active: true },
                  { name: "Jitsi Meet", active: true },
                  { name: "Custom RTMP", active: true },
                  { name: "Union SRT Server", active: false }
                ].map((st, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-stone-50 rounded-xl border border-stone-100">
                    <span className={`h-2 w-2 rounded-full ${st.active ? "bg-emerald-500" : "bg-stone-300"}`} />
                    <span className="font-bold text-stone-700 text-[11px]">{st.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Live Poll Widget */}
            {polls.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                  <Vote className="w-5 h-5 text-amber-500" />
                  <h4 className="font-extrabold text-[#b91c1c] text-xs uppercase tracking-wider">
                    {lang === "ta" ? "நேரடி கருத்துக்கணிப்பு" : "LIVE UNION POLL"}
                  </h4>
                </div>

                <div>
                  <h5 className="font-extrabold text-stone-900 text-xs">
                    {polls[0].question}
                  </h5>
                  <span className="text-[9px] text-stone-400 block mt-1">
                    {polls[0].votedOption !== undefined 
                      ? (lang === "ta" ? "✓ வாக்கு பதிவு செய்யப்பட்டது" : "✓ Thank you for voting") 
                      : (lang === "ta" ? "கீழே உள்ள விருப்பங்களில் ஒன்றை தேர்வு செய்க:" : "Cast your choice below:")}
                  </span>
                </div>

                <div className="space-y-2">
                  {polls[0].options.map((opt, idx) => {
                    const totalVotes = polls[0].options.reduce((acc, curr) => acc + curr.votes, 0);
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    const hasVoted = polls[0].votedOption !== undefined;

                    return (
                      <button
                        key={idx}
                        disabled={hasVoted}
                        onClick={() => handleVote(polls[0].id, idx)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all relative overflow-hidden flex justify-between items-center ${
                          hasVoted 
                            ? (polls[0].votedOption === idx ? "bg-amber-50 border-amber-400" : "bg-stone-50 border-stone-200")
                            : "bg-stone-50 hover:bg-stone-100 border-stone-200 cursor-pointer"
                        }`}
                      >
                        {/* Custom progress background */}
                        {hasVoted && (
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-amber-500/10 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        )}
                        <span className="relative z-10 text-stone-800 text-[11px] truncate max-w-[80%]">{opt.label}</span>
                        <span className="relative z-10 text-stone-900 font-mono text-[11px]">
                          {hasVoted ? `${pct}%` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Attendance QR Card */}
            <div className="bg-gradient-to-br from-[#b91c1c] to-[#7f1d1d] rounded-2xl p-5 text-white shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/15">
                <Users className="w-5 h-5 text-yellow-300" />
                <h4 className="font-extrabold text-yellow-300 text-xs uppercase tracking-wider">
                  {lang === "ta" ? "QR வருகைப்பதிவு" : "QR CODE CHECK-IN"}
                </h4>
              </div>
              
              <p className="text-white/80 text-[10px] leading-relaxed">
                {lang === "ta" ? "கூட்ட அரங்கிற்குள் நுழையும் போது இந்த QR குறியீட்டை ஸ்கேன் செய்து வருகையைப் பதிவு செய்யலாம்." : "Scan this QR code in person or show to local district secretary to register attendance."}
              </p>

              <div className="bg-white p-3 rounded-xl w-32 h-32 mx-auto flex items-center justify-center">
                {/* Simulated QR Code using SVG bars */}
                <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 bg-stone-50">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded ${
                        (i * 3 + 7) % 5 === 0 || i % 4 === 0 || i < 5 || i > 20 || i % 7 === 0
                          ? "bg-stone-900" 
                          : "bg-transparent"
                      }`} 
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <span className="text-[10px] bg-black/30 px-3 py-1 rounded-full text-stone-200 font-mono">
                  MEET_ID: {activeMeeting.id}
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB B: LIVE STREAM VIEWPORT & ARENA */}
      {activeSubTab === "live_stream" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Streaming & AI Panel Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header details */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9px] rounded uppercase animate-pulse">
                    LIVE STREAM
                  </span>
                  <span className="text-stone-400 text-xs">|</span>
                  <span className="text-[11px] text-amber-800 font-extrabold uppercase">
                    {activeMeeting.type}
                  </span>
                </div>
                <h3 className="font-extrabold text-stone-900 text-base mt-1 text-left">
                  {activeMeeting.name}
                </h3>
              </div>

              {/* Attendance Button HUD */}
              <button
                onClick={handleMemberCheckIn}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  memberCheckedIn 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                    : "bg-[#b91c1c] hover:bg-[#991b1b] text-white shadow"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {memberCheckedIn 
                    ? (lang === "ta" ? "வருகை பதிவானது" : "Attendance Logged") 
                    : (lang === "ta" ? "வருகையை உறுதிசெய்" : "Log My Attendance")}
                </span>
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative bg-black rounded-3xl aspect-video overflow-hidden shadow-2xl border border-stone-800 group">
              
              {/* Simulated Live Broadcast video feedback */}
              <div className="absolute inset-0 bg-gradient-to-tr from-stone-900 to-stone-950 flex flex-col justify-between p-6">
                
                {/* Player Top HUD */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                    <span className="text-[10px] text-white font-black tracking-widest font-mono">LIVE • 01:22:45</span>
                  </div>

                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-amber-300 font-bold border border-white/10">
                    <Users className="w-3.5 h-3.5" />
                    <span>345 {lang === "ta" ? "உறுப்பினர்கள் நேரலையில்" : "Members Watching"}</span>
                  </div>
                </div>

                {/* Speaker Center Presentation Mock */}
                <div className="my-auto text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center animate-pulse">
                    <User className="w-10 h-10 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-base font-extrabold">{activeMeeting.speaker}</h4>
                    <p className="text-amber-400 text-xs font-bold mt-1">
                      {lang === "ta" ? "“முக்கிய நலவாரிய தீர்மானங்கள் அறிக்கை”" : "“Core Welfare Board Amendments Presentation”"}
                    </p>
                  </div>
                </div>

                {/* Player Controls Overlaid Bottom */}
                <div className="bg-black/60 backdrop-blur-sm p-3 rounded-2xl border border-white/5 flex justify-between items-center text-xs text-white">
                  <div className="flex items-center gap-3">
                    <button className="p-1 hover:text-amber-400 cursor-pointer">
                      <Play className="w-4 h-4 fill-current text-white" />
                    </button>
                    <button 
                      onClick={() => setIsMuted(!isMuted)} 
                      className="p-1 hover:text-amber-400 cursor-pointer"
                    >
                      {isMuted ? <MicOff className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span className="font-mono text-[10px] text-stone-400">1080p UltraLow Latency</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900">
                      RTMP Secure Sync
                    </span>
                    <button className="p-1 hover:text-amber-400 cursor-pointer">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Watermark logo */}
              <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-5 pointer-events-none select-none">
                <span className="text-5xl font-black text-white tracking-widest font-sans">
                  TNPA DIGITAL UNION
                </span>
              </div>
            </div>

            {/* AI LIVE ASSISTANT IN-STREAM HUB */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100 justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-900 flex items-center justify-center font-black text-xs">
                    AI
                  </div>
                  <h4 className="font-extrabold text-stone-900 text-sm">
                    {lang === "ta" ? "AI நேரடி கூட்ட உதவியாளர்" : "AI LIVE STREAMING ASSISTANT"}
                  </h4>
                </div>

                {/* Assistant subtab bar */}
                <div className="flex gap-1 bg-stone-100 p-1 rounded-xl text-[10px] font-bold">
                  {[
                    { id: "faq", label: "கேள்வி-பதில்", labelEn: "FAQ Finder" },
                    { id: "agenda", label: "அஜெண்டா", labelEn: "Agenda Timeline" },
                    { id: "translate", label: "மொழிபெயர்ப்பு", labelEn: "Translation" },
                    { id: "notes", label: "நேரடி குறிப்புகள்", labelEn: "Live Notes" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAiAssistantTab(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                        aiAssistantTab === tab.id 
                          ? "bg-stone-900 text-white" 
                          : "text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {lang === "ta" ? tab.label : tab.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Subtab Content Panels */}
              {aiAssistantTab === "faq" && (
                <div className="space-y-4 text-xs">
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    {lang === "ta" 
                      ? "கூட்டம் நடைபெறும் போதே உங்கள் சந்தேகங்களை AI உதவியாளரிடம் கேட்டு உடனடியாகத் தெரிந்து கொள்ளலாம்." 
                      : "Ask any union rules or welfare procedures directly to the AI Assistant during live session."}
                  </p>

                  <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                    {aiAssistantAnswers.map((ans, i) => (
                      <div key={i} className="p-3 bg-stone-50 rounded-xl space-y-1 border border-stone-100">
                        <p className="font-bold text-[#b91c1c]">💬 {ans.q}</p>
                        <p className="text-stone-600 leading-relaxed font-medium">🤖 {ans.a}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={lang === "ta" ? "நலவாரியம் விபத்து உதவித்தொகை எவ்வளவு?..." : "Ask AI about pension amounts, welfare limits..."}
                      value={aiAssistantQuestion}
                      onChange={(e) => setAiAssistantQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      onClick={handleAskAI}
                      className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
                    >
                      {lang === "ta" ? "கேள்" : "Ask AI"}
                    </button>
                  </div>
                </div>
              )}

              {aiAssistantTab === "agenda" && (
                <div className="space-y-3 text-xs">
                  <div className="relative border-l border-amber-300 ml-4 pl-6 space-y-4 py-2">
                    {[
                      { time: "04:00 PM", title: "தமிழ்த்தாய் வாழ்த்து & துவக்க உரை", desc: "மாநிலத் துணைத் தலைவர் முன்னுரை", completed: true },
                      { time: "04:15 PM", title: "மாநிலத் தலைவர் சிறப்புரை", desc: "கூட்டத்தின் கொள்கை விளக்கங்கள்", completed: true },
                      { time: "04:45 PM", title: "தொழிலாளர் நல வாரிய அமைச்சர் உரை", desc: "அரசு புதிய சலுகைகள் அறிவிப்பு", completed: false },
                      { time: "05:30 PM", title: "உறுப்பினர்களின் வினாவிடை & தீர்வு", desc: "மாவட்ட வாரியாக கேள்விகளுக்கு நேரடிப் பதில்", completed: false }
                    ].map((ag, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[31px] top-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center border ${
                          ag.completed ? "bg-amber-500 border-amber-600 text-stone-950" : "bg-white border-stone-300 text-stone-400"
                        }`}>
                          {ag.completed ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                        </div>
                        <span className="font-mono text-[10px] text-[#b91c1c] font-bold block">{ag.time}</span>
                        <h5 className="font-extrabold text-stone-900 text-xs mt-0.5">{ag.title}</h5>
                        <p className="text-stone-500 text-[10px]">{ag.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiAssistantTab === "translate" && (
                <div className="space-y-3 text-xs text-left">
                  <p className="text-stone-500 text-[11px]">
                    {lang === "ta" 
                      ? "நேரடி உரையாடல்கள் மற்றும் பேச்சை உங்களுக்கு விருப்பமான மொழியில் உடனுக்குடன் மொழிபெயர்க்கிறது." 
                      : "Translate live stream speech transcript and chat entries instantly in Tamil/English."}
                  </p>
                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
                    <span className="text-[10px] text-amber-900 font-extrabold block">🤖 AI REAL-TIME FEED TRANSLATOR:</span>
                    <p className="italic text-stone-600">
                      &ldquo;The Minister of Labour has assured that registered painters who complete their 60th year of age will receive their pension approvals directly at the district camps.&rdquo;
                    </p>
                    <p className="font-semibold text-stone-800 border-t border-amber-100/40 pt-2">
                      🗣️ <b>தமிழ் மொழிபெயர்ப்பு:</b> &ldquo;60 வயது நிறைவடைந்த பதிவு பெற்ற ஓவியர்கள் தங்கள் ஓய்வூதிய அனுமதியை நேரடியாக மாவட்ட முகாம்களில் பெறுவார்கள் என தொழிலாளர் நலத்துறை அமைச்சர் உறுதி அளித்துள்ளார்.&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {aiAssistantTab === "notes" && (
                <div className="space-y-3 text-xs text-left">
                  <div className="flex justify-between items-center">
                    <p className="text-stone-500 text-[11px]">{lang === "ta" ? "AI தானாகவே கூட்டத்தின் முக்கியக் குறிப்புகளை தொகுக்கிறது." : "AI automatically compiles key takeaways in real-time."}</p>
                    <button 
                      onClick={() => {
                        const noteText = prompt(lang === "ta" ? "புதிய குறிப்பு சேர்க்க:" : "Add custom note:");
                        if (noteText) setAiAssistantNotes(prev => [...prev, `• ${noteText}`]);
                      }}
                      className="text-[10px] text-[#b91c1c] font-black hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> {lang === "ta" ? "குறிப்பு சேர்" : "Add Note"}
                    </button>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 font-mono text-[11px] text-stone-700">
                    {aiAssistantNotes.map((note, idx) => (
                      <p key={idx}>{note}</p>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Interactive Chat & Moderation Panel */}
          <div className="space-y-6">
            
            {/* Live Chat Box */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm h-[480px] flex flex-col justify-between overflow-hidden">
              
              {/* Chat Title */}
              <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="font-extrabold text-stone-900 text-xs uppercase tracking-wide">
                    {lang === "ta" ? "நேரடி அரட்டை" : "LIVE CHAT FEED"}
                  </span>
                </div>

                <span className="text-[10px] text-stone-400 font-bold font-mono">345 Online</span>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs text-left">
                
                {/* Pinned message banner if any */}
                {chatMessages.filter(m => m.isPinned).map(pinned => (
                  <div key={`pin_${pinned.id}`} className="p-2.5 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-[9px] text-yellow-800 font-extrabold uppercase block">📌 PINNED BY ADMIN</span>
                      <p className="font-bold text-stone-800 mt-0.5">{pinned.user}: <span className="font-medium text-stone-600">{pinned.message}</span></p>
                    </div>
                  </div>
                ))}

                {/* Main list */}
                {chatMessages.map((msg, idx) => (
                  <div key={`lc_msg_${msg.id}_${idx}`} className="p-2.5 bg-stone-50 rounded-xl space-y-1 hover:bg-stone-100 transition-all relative group">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-stone-900 text-[11px]">
                          {msg.user}
                        </span>
                        {msg.role === "super_admin" && (
                          <span className="bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-stone-400 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed font-medium">{msg.message}</p>

                    {/* Admin Moderation Hover Tools */}
                    {currentUser && currentUser.role === "super_admin" && (
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 shadow-sm">
                        <button
                          onClick={() => handlePinMessage(msg.id)}
                          title="Pin Message"
                          className="p-1 hover:bg-amber-50 text-amber-600 rounded cursor-pointer"
                        >
                          📌
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Delete Message"
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleBlockUser(msg.user)}
                          title="Block User"
                          className="p-1 hover:bg-stone-200 text-stone-900 rounded cursor-pointer text-[9px] font-bold"
                        >
                          🚫
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex gap-1.5">
                <input
                  type="text"
                  placeholder={
                    isMuted 
                      ? (lang === "ta" ? "நிர்வாகியால் முடக்கப்பட்டுள்ளது" : "You have been muted") 
                      : (lang === "ta" ? "உங்கள் கருத்தை எழுதவும்..." : "Write a public comment...")
                  }
                  disabled={isMuted}
                  value={currentChatInput}
                  onChange={(e) => setCurrentChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  className="flex-grow px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-stone-800"
                />
                <button
                  onClick={handleSendChat}
                  disabled={isMuted}
                  className="p-2 bg-[#b91c1c] text-white rounded-xl hover:bg-[#991b1b] transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Q&A Session Panel */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                  {lang === "ta" ? "கேள்வி & பதில் அரங்கு" : "LIVE Q&A SESSION"}
                </h4>
              </div>

              {/* List of Qs */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div key={`lc_q_${q.id}_${idx}`} className="p-2.5 bg-stone-50 rounded-xl space-y-1.5 border border-stone-100 text-left text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-stone-800">{q.user}</span>
                      <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-800 rounded font-bold uppercase">
                        {q.category}
                      </span>
                    </div>

                    <p className="text-stone-700 font-semibold">{q.question}</p>

                    {/* If Approved & Answered */}
                    {q.status === "approved" && q.answer && (
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-950 font-medium">
                        <span className="font-black text-[9px] text-emerald-800 block uppercase">SPEAKER REPLY:</span>
                        {q.answer}
                      </div>
                    )}

                    {/* Pending review or admin controls */}
                    {q.status === "pending" && (
                      <div className="flex justify-between items-center pt-1.5 text-[9px]">
                        <span className="text-amber-600 font-bold">⏳ {lang === "ta" ? "ஒப்புதலுக்குக் காத்திருக்கிறது" : "Pending Approval"}</span>
                        {currentUser && currentUser.role === "super_admin" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleApproveQuestion(q.id)}
                              className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const ans = prompt("Enter speaker response:");
                                if (ans) {
                                  handleApproveQuestion(q.id);
                                  handleAnswerQuestion(q.id, ans);
                                }
                              }}
                              className="px-2 py-0.5 bg-indigo-600 text-white rounded font-bold cursor-pointer"
                            >
                              Answer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit QA Form */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex gap-2">
                  <select
                    value={newQuestionCategory}
                    onChange={(e: any) => setNewQuestionCategory(e.target.value)}
                    className="p-1.5 border border-stone-200 rounded-xl text-xs bg-white text-stone-800 focus:outline-none"
                  >
                    <option value="Welfare">Welfare / நலவாரியம்</option>
                    <option value="Safety">Safety / பாதுகாப்பு</option>
                    <option value="Legal">Legal / சட்ட ஆலோசனை</option>
                    <option value="General">General / பொது</option>
                  </select>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder={lang === "ta" ? "உங்கள் தொழில்சார் கேள்விகளைப் பதிவிடுக..." : "Post your professional questions to speaker..."}
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePostQuestion()}
                    className="flex-grow px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none bg-white text-stone-800"
                  />
                  <button
                    onClick={handlePostQuestion}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                  >
                    {lang === "ta" ? "அனுப்பு" : "Post"}
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB C: UNION CALENDAR & EVENTS */}
      {activeSubTab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Calendar Viewport */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider">
                  {lang === "ta" ? "ஆகஸ்ட் 2026 நாட்காட்டி" : "AUGUST 2026 EVENT CALENDAR"}
                </h4>
                <p className="text-stone-400 text-xs mt-0.5">{lang === "ta" ? "ஒன்றிய மற்றும் மாவட்ட அளவிலான கூட்டங்கள்" : "Upcoming and historic schedule slots."}</p>
              </div>

              {/* Download Calendar File button */}
              <button
                onClick={() => {
                  alert("Download calendar file (TNPA_Calendar_2026.ics) started!");
                  onAddAuditLog("Download ICS File", "ICS calendar file download triggered.");
                }}
                className="px-3 py-1.5 bg-stone-100 text-stone-800 rounded-lg text-xs font-bold hover:bg-stone-200 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? ".ICS கோப்பு" : ".ICS Calendar File"}</span>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {/* Day headers */}
              {["ஞாயிறு (Sun)", "திங்கள் (Mon)", "செவ்வாய் (Tue)", "புதன் (Wed)", "வியாழன் (Thu)", "வெள்ளி (Fri)", "சனி (Sat)"].map((day, idx) => (
                <div key={idx} className="p-1 text-[10px] text-stone-400 font-extrabold uppercase">
                  {day.split(" ")[0]}
                </div>
              ))}

              {/* Offset days (August 2026 starts on Saturday, so 5 empty cells) */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`empty_${i}`} className="p-4 bg-stone-50/50 rounded-xl border border-stone-100/20" />
              ))}

              {/* Active days */}
              {calendarDays.map((day) => {
                const dayMeetings = scheduledMeetingsMap[day] || [];
                const isHoliday = day === 15; // Independence Day

                return (
                  <div
                    key={`cal_day_${day}`}
                    className={`p-3 min-h-[85px] rounded-xl border flex flex-col justify-between text-left transition-all relative overflow-hidden ${
                      dayMeetings.length > 0
                        ? "border-amber-400 bg-amber-50/20"
                        : "border-stone-100 bg-stone-50/30"
                    } ${isHoliday ? "bg-rose-50/40 border-rose-300" : ""}`}
                  >
                    <span className={`font-mono text-xs font-black ${
                      isHoliday ? "text-rose-600" : "text-stone-500"
                    }`}>
                      {day}
                    </span>

                    {/* Meeting tags inside days */}
                    <div className="space-y-1 mt-1">
                      {dayMeetings.map((m, idx) => (
                        <div
                          key={`lc_dm_${m.id}_${idx}`}
                          onClick={() => {
                            setSelectedMeetingId(m.id);
                            setActiveSubTab("dashboard");
                          }}
                          className={`p-1 rounded text-[8px] font-bold cursor-pointer truncate ${
                            m.status === "live" ? "bg-red-600 text-white" :
                            m.status === "upcoming" ? "bg-amber-100 text-amber-900 border border-amber-300" :
                            "bg-stone-100 text-stone-600"
                          }`}
                          title={m.name}
                        >
                          {m.name}
                        </div>
                      ))}
                      {isHoliday && (
                        <span className="text-[7.5px] font-black text-rose-700 uppercase tracking-tight block">
                          சுதந்திர தினம் (Holiday)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Key events and Holiday Lists */}
          <div className="space-y-6 text-left">
            
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider pb-2 border-b border-stone-100">
                {lang === "ta" ? "அடுத்த முக்கியத் தேதிகள்" : "IMPORTANT HIGHLIGHTED SCHEDULES"}
              </h4>

              <div className="space-y-3.5 text-xs">
                {[
                  { date: "04 Aug 2026", title: "மாநில செயற்குழு கூட்டம்", desc: "தற்போதைய நேரடி ஒளிபரப்பு", type: "Live Now" },
                  { date: "05 Aug 2026", title: "மதுரை மாவட்ட ஓவியர்கள் விழிப்புணர்வு முகாம்", desc: "பாதுகாப்பு மற்றும் உபகரணங்கள் பயிற்சி", type: "Upcoming" },
                  { date: "15 Aug 2026", title: "சுதந்திர தின சிறப்பு ஓவியப் போட்டி", desc: "அனைத்து மாவட்ட சங்கங்களிலும் ஓவியப்போட்டிகள்", type: "Holiday" }
                ].map((ev, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="font-mono text-[10px] text-[#b91c1c] font-black bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl block shrink-0 text-center min-w-[75px]">
                      {ev.date.split(" ")[0]} {ev.date.split(" ")[1]}
                    </span>
                    <div>
                      <h5 className="font-extrabold text-stone-900 text-xs">{ev.title}</h5>
                      <p className="text-stone-400 text-[10px]">{ev.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Notification Settings reminder check */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500 animate-swing" />
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                  {lang === "ta" ? "தனிப்பட்ட நினைவூட்டல்" : "PERSONAL ALERTS CONFIG"}
                </h4>
              </div>

              <p className="text-stone-500 text-[11px] leading-relaxed">
                {lang === "ta" ? "ஒவ்வொரு கூட்டத்திற்கும் முன் உட்செயலி மற்றும் மின்னஞ்சல் நினைவூட்டல்களைத் தேர்வு செய்யவும்." : "Set custom advance push notifications for your registered mobile number."}
              </p>

              <div className="space-y-2 text-xs">
                {[
                  { label: "Immediately / உடனே", checked: true },
                  { label: "24 Hours Before / 24 மணி நேரம் முன்", checked: true },
                  { label: "3 Hours Before / 3 மணி நேரம் முன்", checked: false },
                  { label: "1 Hour Before / 1 மணி நேரம் முன்", checked: true },
                  { label: "15 Minutes Before / 15 நிமிடங்கள் முன்", checked: true }
                ].map((alertOpt, idx) => (
                  <label key={idx} className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={alertOpt.checked}
                      className="rounded border-stone-300 text-[#b91c1c] focus:ring-[#b91c1c] w-3.5 h-3.5"
                    />
                    <span className="text-[11px]">{alertOpt.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB D: PARTICIPATION REPORTS & ANALYTICS */}
      {activeSubTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Main Reports Panel */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h4 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider">
                {lang === "ta" ? "கூட்டங்களின் வரலாற்று பங்கேற்பு அறிக்கை" : "HISTORIC ATTENDANCE & PARTICIPATION REPORT"}
              </h4>
              <p className="text-stone-400 text-xs mt-0.5">{lang === "ta" ? "மாவட்ட அளவிலான வருகை மற்றும் நேரலை ஒளிபரப்பு புள்ளிவிவரங்கள்" : "District-wise aggregate check-ins and video duration minutes metrics."}</p>
            </div>

            {/* Graphical Analytics Charts (using custom high-fidelity SVG graphs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Chart 1: District Wise Participation (Vertical progress-bars) */}
              <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl space-y-4">
                <div>
                  <h5 className="font-extrabold text-stone-900 text-xs">
                    {lang === "ta" ? "மாவட்ட வாரியாகப் பங்கேற்பு (%)" : "District Wise Participation (%)"}
                  </h5>
                  <span className="text-[9px] text-stone-400">Top active districts this month</span>
                </div>

                <div className="space-y-3.5">
                  {[
                    { district: "மதுரை (Madurai)", pct: 92, count: 240, color: "bg-amber-500" },
                    { district: "கோவை (Coimbatore)", pct: 85, count: 198, color: "bg-[#b91c1c]" },
                    { district: "சென்னை (Chennai)", pct: 78, count: 312, color: "bg-indigo-600" },
                    { district: "சேலம் (Salem)", pct: 64, count: 145, color: "bg-emerald-600" },
                    { district: "திருச்சி (Trichy)", pct: 58, count: 120, color: "bg-rose-500" }
                  ].map((dist, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-stone-700">
                        <span>{dist.district}</span>
                        <span className="font-mono text-stone-900">{dist.count} Members ({dist.pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${dist.color}`} 
                          style={{ width: `${dist.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 2: Meeting Type Aggregate Hours */}
              <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl space-y-4">
                <div>
                  <h5 className="font-extrabold text-stone-900 text-xs">
                    {lang === "ta" ? "கூட்டங்களின் சராசரி நேரம் (நிமிடங்கள்)" : "Average Meeting Duration (Minutes)"}
                  </h5>
                  <span className="text-[9px] text-stone-400">Segmented by Union meeting type</span>
                </div>

                <div className="space-y-3.5">
                  {[
                    { type: "Executive / செயற்குழு", mins: 120, count: 5, color: "bg-[#b91c1c]" },
                    { type: "Training / பயிற்சி வகுப்பு", mins: 180, count: 12, color: "bg-amber-500" },
                    { type: "Welfare Programs / நல விழிப்புணர்வு", mins: 150, count: 8, color: "bg-emerald-600" },
                    { type: "Emergency / அவசரக் கூட்டம்", mins: 60, count: 3, color: "bg-rose-600" }
                  ].map((tp, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-stone-700">
                        <span>{tp.type}</span>
                        <span className="font-mono text-stone-900">{tp.mins} mins avg ({tp.count} events)</span>
                      </div>
                      {/* Using percentage width out of 180 max */}
                      <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${tp.color}`} 
                          style={{ width: `${(tp.mins / 180) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Attendance Roster Logs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                  {lang === "ta" ? "நேரலை வருகையாளர்கள் பட்டியல் (Roster Log)" : "LIVE ATTENDEE ROSTER LOG"}
                </h5>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-1 rounded font-mono">
                  {attendanceLogs.length} Checked In
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-600 border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-800 font-extrabold border-b border-stone-200">
                      <th className="p-2.5">Name / மாவட்டம்</th>
                      <th className="p-2.5">In Time</th>
                      <th className="p-2.5">Log Method</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {attendanceLogs.map((log, idx) => (
                      <tr key={`lc_log_${log.id}_${idx}`} className="hover:bg-stone-50">
                        <td className="p-2.5 font-bold text-stone-900">{log.name}</td>
                        <td className="p-2.5 font-mono">{log.checkIn}</td>
                        <td className="p-2.5 font-semibold text-stone-500">{log.status}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold">
                            ✓ Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: AI Minutes & Saved Deliverables */}
          <div className="space-y-6">
            
            {/* AI Auto Minutes Output */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <FileText className="w-5 h-5 text-[#b91c1c]" />
                <h4 className="font-extrabold text-[#b91c1c] text-xs uppercase tracking-wider">
                  {lang === "ta" ? "AI தானியங்கி கூட்ட குறிப்புகள்" : "AI AUTO MINUTES OF MEETING"}
                </h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[9px] text-[#b91c1c] font-black uppercase tracking-wider block">Meeting Summary / கூட்டச் சுருக்கம்</span>
                  <p className="text-stone-600 leading-relaxed font-medium mt-1">
                    {artifacts.minutesDraft.summary}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] text-amber-800 font-black uppercase tracking-wider block">Important Decisions / முக்கிய தீர்மானங்கள்</span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-stone-600 font-medium">
                    {artifacts.minutesDraft.decisions.map((dec, i) => (
                      <li key={i}>{dec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[9px] text-emerald-800 font-black uppercase tracking-wider block">Action Items / செயல்பாட்டுப் பணிகள்</span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-stone-600 font-medium">
                    {artifacts.minutesDraft.actionItems.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    alert(lang === "ta" ? "AI தயாரித்த கூட்டக்குறிப்புகள் PDF வடிவில் பதிவிறக்கம் செய்யப்படுகிறது." : "Downloading AI drafted meeting minutes PDF.");
                    onAddAuditLog("Download Minutes PDF", "Downloaded compiled minutes of meeting.");
                  }}
                  className="w-full py-2.5 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold transition-all"
                >
                  {lang === "ta" ? "முழு அறிக்கையையும் பதிவிறக்கு" : "Download Official Minutes Report"}
                </button>
              </div>
            </div>

            {/* Saved Presentation & photos repo */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider pb-2 border-b border-stone-100">
                {lang === "ta" ? "கூட்ட ஆவணங்களின் தொகுப்பு" : "MEETING REPOSITORY ARTIFACTS"}
              </h4>

              <div className="space-y-2.5 text-xs text-left">
                <div className="p-2.5 bg-stone-50 rounded-xl flex justify-between items-center border border-stone-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-500" />
                    <span className="font-bold text-stone-800 truncate max-w-[150px]">{artifacts.presentation}</span>
                  </div>
                  <button 
                    onClick={() => alert("Downloading Slide files.")}
                    className="text-[10px] text-amber-800 font-extrabold hover:underline"
                  >
                    Download
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {artifacts.photos.map((ph, i) => (
                    <div key={i} className="bg-stone-50 border border-stone-100 p-2 rounded-xl text-center space-y-1.5">
                      <div className="h-14 w-full bg-stone-200 rounded-lg flex items-center justify-center">
                        <Camera className="w-5 h-5 text-stone-400" />
                      </div>
                      <span className="text-[9px] font-mono text-stone-500 block truncate">{ph}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB E: SUPER ADMIN MEETING CREATOR (ONLY FOR SUPER ADMIN) */}
      {activeSubTab === "admin_panel" && currentUser && currentUser.role === "super_admin" && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm text-left">
          
          <div className="border-b border-stone-100 pb-4 mb-6">
            <h4 className="font-black text-stone-900 text-lg md:text-xl uppercase tracking-wide">
              {lang === "ta" ? "நிர்வாகிகளுக்கான புதிய கூட்ட மேலாண்மை" : "SUPER ADMIN MEETING CREATION CONSOLE"}
            </h4>
            <p className="text-stone-500 text-xs mt-1">
              {lang === "ta" 
                ? "இங்கிருந்து நீங்கள் புதிய கூட்டங்களை உருவாக்கி, உறுப்பினர்களுக்குத் தானியங்கி அறிவிப்புகளை அனுப்பலாம்." 
                : "Schedule state/district conferences, configure live streams, and trigger automated push/SMS notifies."}
            </p>
          </div>

          <form onSubmit={handleCreateMeetingSubmit} className="space-y-6 text-xs">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "கூட்டத்தின் பெயர் (Meeting Name) *" : "Meeting Name *"}</label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: கோவை மாவட்ட பொதுக்குழு"
                  value={newMeetName}
                  onChange={(e) => setNewMeetName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "கூட்டத்தின் வகை (Meeting Type) *" : "Meeting Type *"}</label>
                <select
                  value={newMeetType}
                  onChange={(e) => setNewMeetType(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="State Meetings">State Meetings / மாநிலக் கூட்டங்கள்</option>
                  <option value="District Meetings">District Meetings / மாவட்டக் கூட்டங்கள்</option>
                  <option value="Emergency Meetings">Emergency Meetings / அவசரக் கூட்டங்கள்</option>
                  <option value="Executive Meetings">Executive Meetings / செயற்குழு கூட்டங்கள்</option>
                  <option value="Training Classes">Training Classes / தொழில்நுட்பப் பயிற்சி</option>
                  <option value="Special Announcements">Special Announcements / சிறப்பு அறிவிப்பு</option>
                  <option value="Blood Donation Meetings">Blood Donation Meetings / குருதி கொடை முகாம்</option>
                  <option value="Labour Welfare Awareness Programs">Labour Welfare / தொழிலாளர் நல முகாம்</option>
                  <option value="Women's Wing Meetings">Women's Wing Meetings / மகளிர் அணி</option>
                  <option value="Youth Wing Meetings">Youth Wing Meetings / இளைஞர் அணி</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700">{lang === "ta" ? "கூட்ட விவரம் (Description) *" : "Description *"}</label>
              <textarea
                rows={3}
                required
                placeholder="கூட்டத்தின் நோக்கங்கள் மற்றும் நிகழ்ச்சித் திட்டங்கள்..."
                value={newMeetDesc}
                onChange={(e) => setNewMeetDesc(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "மாவட்டம் (District) *" : "District *"}</label>
                <input
                  type="text"
                  required
                  placeholder="All Districts, Chennai..."
                  value={newMeetDistrict}
                  onChange={(e) => setNewMeetDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "மாநிலம் (State) *" : "State *"}</label>
                <input
                  type="text"
                  required
                  value={newMeetState}
                  onChange={(e) => setNewMeetState(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "கூட்டம் நடைபெறும் தேதி *" : "Meeting Date *"}</label>
                <input
                  type="date"
                  required
                  value={newMeetDate}
                  onChange={(e) => setNewMeetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "ஆரம்ப நேரம் (Start Time) *" : "Start Time *"}</label>
                <input
                  type="time"
                  required
                  value={newMeetTime}
                  onChange={(e) => setNewMeetTime(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "முடிவடையும் நேரம் *" : "End Time *"}</label>
                <input
                  type="time"
                  required
                  value={newMeetEndTime}
                  onChange={(e) => setNewMeetEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "முதன்மை உரையாளர் *" : "Speaker / Coordinator *"}</label>
                <input
                  type="text"
                  required
                  placeholder="உரையாளர் பெயர்"
                  value={newMeetSpeaker}
                  onChange={(e) => setNewMeetSpeaker(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "சிறப்பு விருந்தினர்" : "Chief Guest"}</label>
                <input
                  type="text"
                  placeholder="விருந்தினர் பெயர்"
                  value={newMeetChief}
                  onChange={(e) => setNewMeetChief(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "ஒளிபரப்பு லிங்க் (Streaming Link) *" : "Streaming Link *"}</label>
                <input
                  type="url"
                  required
                  value={newMeetLink}
                  onChange={(e) => setNewMeetLink(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "கூட்ட கடவுச்சொல் (Password)" : "Meeting Password (Optional)"}</label>
                <input
                  type="text"
                  placeholder="மாநில செயற்குழு கடவுச்சொல்"
                  value={newMeetPassword}
                  onChange={(e) => setNewMeetPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">{lang === "ta" ? "கூட்ட போஸ்டர் / பேனர் படம்" : "Meeting Banner Image Link"}</label>
                <select
                  value={bannerPreview}
                  onChange={(e) => setBannerPreview(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800">Abstract Art (Banner A)</option>
                  <option value="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800">Paint Brushes (Banner B)</option>
                  <option value="https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800">Modern Painting Tools (Banner C)</option>
                </select>
              </div>
            </div>

            {/* AUTOMATED AUTO NOTIFICATION TIMINGS SELECTORS */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3.5">
              <span className="text-[#b91c1c] font-black uppercase tracking-wider block">
                {lang === "ta" ? "தானியங்கி அறிவிப்புகள் அமைப்பு (Auto Notifications Scheduler)" : "AUTOMATED NOTIFICATIONS SCHEDULER"}
              </span>
              <p className="text-stone-500 text-[11px]">
                {lang === "ta" 
                  ? "தேர்ந்தெடுக்கப்பட்ட அறிவிப்பு நேரங்களில் அனைத்து உறுப்பினர்களின் மொபைல் மற்றும் மின்னஞ்சலுக்குத் தானாகவே நினைவூட்டல் அனுப்பப்படும்." 
                  : "Dispatch instant emails, SMS, and in-app alerts at calibrated countdown parameters."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifyImmediately} 
                    onChange={(e) => setNotifyImmediately(e.target.checked)}
                    className="rounded border-stone-300 text-[#b91c1c] focus:ring-[#b91c1c] w-4 h-4" 
                  />
                  <span>Immediately / கூட்டம் உருவானதும்</span>
                </label>

                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notify24Hours} 
                    onChange={(e) => setNotify24Hours(e.target.checked)}
                    className="rounded border-stone-300 text-[#b91c1c] focus:ring-[#b91c1c] w-4 h-4" 
                  />
                  <span>24 Hours Before</span>
                </label>

                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notify3Hours} 
                    onChange={(e) => setNotify3Hours(e.target.checked)}
                    className="rounded border-stone-300 text-[#b91c1c] focus:ring-[#b91c1c] w-4 h-4" 
                  />
                  <span>3 Hours Before</span>
                </label>

                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notify1Hour} 
                    onChange={(e) => setNotify1Hour(e.target.checked)}
                    className="rounded border-stone-300 text-[#b91c1c] focus:ring-[#b91c1c] w-4 h-4" 
                  />
                  <span>1 Hour Before</span>
                </label>

                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notify15Mins} 
                    onChange={(e) => setNotify15Mins(e.target.checked)}
                    className="rounded border-stone-300 text-[#b91c1c] focus:ring-[#b91c1c] w-4 h-4" 
                  />
                  <span>15 Mins Before</span>
                </label>

                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifyOnStart} 
                    onChange={(e) => setNotifyOnStart(e.target.checked)}
                    className="rounded border-stone-300 text-[#b91c1c] focus:ring-[#b91c1c] w-4 h-4" 
                  />
                  <span>Meeting Started / தொடங்கியதும்</span>
                </label>
              </div>

              {/* Delivery Channels */}
              <div className="pt-2 border-t border-stone-200/60 flex flex-wrap gap-4 text-stone-600 font-bold">
                <span>{lang === "ta" ? "அனுப்பப்படும் ஊடகங்கள்:" : "Dispatch Channels:"}</span>
                <span className="text-stone-900">✓ In App Push Alert</span>
                <span className="text-stone-900">✓ E-Mail (SMTP Synced)</span>
                <span className="text-stone-900">✓ WhatsApp Notification</span>
                <span className="text-stone-400">⏳ SMS Broadcast (Awaiting custom gateway)</span>
              </div>
            </div>

            {/* Admin Manual Attendance Seeder */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3.5">
              <span className="text-[#b91c1c] font-black uppercase tracking-wider block">
                {lang === "ta" ? "கைமுறை வருகைப்பதிவு (Manual Attendance Register)" : "ADMIN MANUAL ATTENDANCE OVERRIDE"}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleManualCheckIn("ராமசாமி (சேலம்)", "Salem")}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 font-bold"
                >
                  + Add Ramasamy (Salem)
                </button>
                <button
                  type="button"
                  onClick={() => handleManualCheckIn("தங்கவேல் (ஈரோடு)", "Erode")}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 font-bold"
                >
                  + Add Thangavel (Erode)
                </button>
              </div>
            </div>

            {/* CREATE Live Poll Seeder */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <span className="text-[#b91c1c] font-black uppercase tracking-wider block">
                {lang === "ta" ? "புதிய நேரடி கருத்துக்கணிப்பு உருவாக்கு (Instant Poll Creator)" : "INSTANT POLL CREATOR"}
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Poll Question?"
                  value={newPollQuestion}
                  onChange={(e) => setNewPollQuestion(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800"
                />
                <textarea
                  rows={2}
                  placeholder="Options (one per line)..."
                  value={newPollOptions}
                  onChange={(e) => setNewPollOptions(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 font-mono"
                />
                <button
                  type="button"
                  onClick={handleCreatePoll}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold"
                >
                  Publish Live Poll
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setActiveSubTab("dashboard")}
                className="px-5 py-3 bg-stone-100 text-stone-800 font-bold rounded-xl hover:bg-stone-200 transition-all cursor-pointer"
              >
                {lang === "ta" ? "ரத்து செய்" : "Cancel"}
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl transition-all cursor-pointer shadow"
              >
                {lang === "ta" ? "கூட்டத்தை உருவாக்கு & அறிவி" : "Publish Meeting & Dispatch"}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
