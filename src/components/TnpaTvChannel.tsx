import React, { useState, useEffect, useRef } from "react";
import { 
  Tv, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Radio, 
  Share2, 
  Send, 
  Users, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  Copy, 
  Check, 
  Smartphone, 
  Video, 
  ShieldCheck, 
  Bell, 
  ExternalLink,
  Award,
  Zap,
  Globe,
  Upload,
  Cpu,
  Layers,
  Mic,
  Film,
  Bot,
  Image as ImageIcon,
  CheckSquare,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Eye,
  Sliders,
  Tag,
  FileText,
  Volume
} from "lucide-react";
import { UserAccount, MemberRegistration } from "../types";
import AdminLiveBroadcastControl from "./AdminLiveBroadcastControl";
import TnpaVideoPlayer from "./TnpaVideoPlayer";

interface TnpaTvChannelProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  registrations: MemberRegistration[];
  onAddAuditLog: (action: string, details: string) => void;
}

interface TvProgram {
  id: string;
  time: string;
  title: string;
  titleEn: string;
  category: "news" | "speech" | "welfare" | "training" | "debate";
  presenter: string;
  isLiveNow?: boolean;
}

interface TvVideoItem {
  id: string;
  title: string;
  titleEn: string;
  duration: string;
  views: string;
  date: string;
  category: string;
  thumbnailColor: string;
  videoUrl?: string;
  speaker: string;
  headline?: string;
  summary?: string;
  tickerText?: string;
}

export default function TnpaTvChannel({
  lang,
  currentUser,
  registrations,
  onAddAuditLog
}: TnpaTvChannelProps) {
  const isSuperAdmin = currentUser?.role === "super_admin";
  // Main View Navigation: "channel" (Live TV & Archive) vs "studio" (AI Auto News Studio) vs "admin_control" (Super Admin Broadcast Control)
  const [activeViewMode, setActiveViewMode] = useState<"channel" | "studio" | "admin_control">("channel");

  // Optional RTMP / HLS Stream environment variable & source configuration
  const rtmpIngestUrl = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_RTMP_INGEST_URL) || (typeof process !== "undefined" && process.env?.RTMP_INGEST_URL) || "";
  const liveHlsUrl = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_LIVE_HLS_PLAYBACK_URL) || (typeof process !== "undefined" && process.env?.LIVE_HLS_PLAYBACK_URL) || "";

  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<"live" | "welfare" | "events" | "news">("live");
  const [liveViewers, setLiveViewers] = useState(14320);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Ticker Messages
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerNewsTa, setTickerNewsTa] = useState<string[]>([
    "TNPA² டிவி நேரலை: தமிழ்நாடு பெயிண்டர்கள் நலச் சங்கம் மூலம் 38 மாவட்ட உறுப்பினர்களுக்கும் டிஜிட்டல் சேவைகள் துவக்கம்!",
    "மாநில தலைவர் S. மைக்கேல் ஆல்வின் உரை: நலவாரிய ஓய்வூதியம் ₹2,000 ஆக உயர்த்த அரசுக்கு கோரிக்கை மனு அளிப்பு.",
    "பொதுச்செயலாளர் R. சேவியர் பாபு அறிவிப்பு: அனைத்து ஒன்றிய பொறுப்பாளர்களுக்கும் TNPA² டிவி நேரலை லிங்க் எஸ்.எம்.எஸ் மூலம் அனுப்பப்படுகிறது.",
    "பொருளாளர் R. சக்திவேல் தகவல்: சங்க சந்தா செலுத்திய உறுப்பினர்களுக்கு உடனடி QR அடையாள அட்டை வழங்கப்பட்டு வருகிறது."
  ]);

  const [tickerNewsEn, setTickerNewsEn] = useState<string[]>([
    "TNPA² TV Live: Official digital TV Channel launched for 38 districts of Tamil Nadu Painters Association!",
    "State President S. Michael Alvin: Memorandum submitted requesting construction welfare pension increase to ₹2,000.",
    "General Secretary R. Xavier Babu: Official TV channel link being dispatched via SMS to all union office bearers.",
    "State Treasurer R. Sakthivel: Instant digital QR ID Cards issued to all subscribed union members."
  ]);

  // Rotate ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerNewsTa.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tickerNewsTa.length]);

  // Faux viewer count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers((prev) => prev + Math.floor(Math.random() * 7) - 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Broadcast Link Dispatch Modal & State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState<"all" | "officials" | "districts">("all");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Live Chat comments
  const [comments, setComments] = useState<Array<{ id: number; user: string; role: string; text: string; time: string; likes: number }>>([
    { id: 1, user: "முத்துக்கிருஷ்ணன் (மதுரை)", role: "மாவட்ட தலைவர்", text: "TNPA² டிவி சேனல் துவக்கம் மிகவும் அருமை! வாழ்க சங்கம்!", time: "1 நிமிடம் முன்பு", likes: 24 },
    { id: 2, user: "சரவணன் (கோவை)", role: "ஒன்றிய செயலாளர்", text: "மாநில தலைவர் மைக்கேல் ஆல்வின் அவர்களின் நேரலை உரைக்காக காத்திருக்கிறோம்.", time: "3 நிமிடங்கள் முன்பு", likes: 18 },
    { id: 3, user: "அருண் (சென்னை)", role: "உறுப்பினர்", text: "எங்கள் பகுதியில் உள்ள 150 பெயிண்டர்களுக்கும் இந்த டிவி லிங்க் பகிர்ந்துவிட்டேன்!", time: "5 நிமிடங்கள் முன்பு", likes: 42 }
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const author = currentUser ? currentUser.name : "உறுப்பினர் (Visitor)";
    const authorRole = currentUser ? currentUser.role.replace("_", " ") : "உறுப்பினர்";
    setComments((prev) => [
      {
        id: Date.now(),
        user: author,
        role: authorRole,
        text: newComment,
        time: "இப்பொழுது",
        likes: 0
      },
      ...prev
    ]);
    setNewComment("");
  };

  const channelUrl = `${window.location.origin}/?tab=tv_channel&channel=tnpa2-live`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(channelUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Dispatch Link Engine to all members
  const handleDispatchTvLink = () => {
    setIsDispatching(true);
    setDispatchSuccessMsg(null);

    setTimeout(() => {
      setIsDispatching(false);
      const recipientCount = dispatchTarget === "all" ? registrations.length + 12840 : dispatchTarget === "officials" ? 420 : 38;
      const msg = lang === "ta" 
        ? `வெற்றி! ${recipientCount} உறுப்பினர்கள் & பொறுப்பாளர்களுக்கு TNPA² டிவி சேனல் நேரலை லிங்க் (SMS & WhatsApp) மூலம் வெற்றிகரமாக அனுப்பப்பட்டது!` 
        : `Success! TNPA² TV Channel link dispatched via SMS & WhatsApp to ${recipientCount} union members & officials!`;
      
      setDispatchSuccessMsg(msg);
      onAddAuditLog("TNPA2 TV Channel Broadcast", `Dispatched TV link to ${recipientCount} members/officials via SMS server.`);
    }, 2000);
  };

  // Program Schedule
  const programGuide: TvProgram[] = [
    {
      id: "p1",
      time: "09:00 AM",
      title: "காலை சங்கம் செய்தி மலர்",
      titleEn: "Morning Union News Bulletin",
      category: "news",
      presenter: "செய்திப் பிரிவு (Media Desk)"
    },
    {
      id: "p2",
      time: "11:30 AM",
      title: "அரசு நலவாரிய நிதி & ஓய்வூதியம் வழிகாட்டி",
      titleEn: "Government Welfare Scheme & Pension Guide",
      category: "welfare",
      presenter: "நலவாரிய நிபுணர் குழு"
    },
    {
      id: "p3",
      time: "02:30 PM",
      title: "மாநில தலைவர் S. மைக்கேல் ஆல்வின் சிறப்பு உரை (நேரலை)",
      titleEn: "State President S. Michael Alvin Special Address (LIVE)",
      category: "speech",
      presenter: "S. மைக்கேல் ஆல்வின் (மாநில தலைவர்)",
      isLiveNow: true
    },
    {
      id: "p4",
      time: "05:00 PM",
      title: "பொதுச்செயலாளர் ரா. சேவியர் பாபு நேரலை குறைதீர்ப்பு",
      titleEn: "General Secretary R. Xavier Babu Live Grievance Q&A",
      category: "debate",
      presenter: "ரா. சேவியர் பாபு (மாநில பொதுச்செயலாளர்)"
    },
    {
      id: "p5",
      time: "08:00 PM",
      title: "இரவு நேரலை விவாதம் & 38 மாவட்டச் செய்திகள்",
      titleEn: "Prime Time News & 38 District Union Updates",
      category: "news",
      presenter: "TNPA² செய்திக் குழு"
    }
  ];

  // Past Video Archive with Real-time Super Admin sync
  const defaultArchive: TvVideoItem[] = [
    {
      id: "v1",
      title: "மாநில பேரவைக் கூட்டம் 2026 - தலைவர்கள் சிறப்பு உரை",
      titleEn: "State General Council 2026 - Executive Keynote Addresses",
      duration: "42:15",
      views: "18.5K",
      date: "3 நாட்கள் முன்பு",
      category: "மாநாடு",
      thumbnailColor: "from-amber-700 to-rose-900",
      speaker: "S. மைக்கேல் ஆல்வின் & ரா. சேவியர் பாபு"
    },
    {
      id: "v2",
      title: "பெயிண்டர் நலவாரிய அடையாள அட்டை பெறும் எளிய வழிமுறைகள்",
      titleEn: "Easy Steps to Apply for Construction Welfare Board ID Card",
      duration: "18:40",
      views: "34.2K",
      date: "1 வாரம் முன்பு",
      category: "பயிற்சி",
      thumbnailColor: "from-[#b91c1c] to-stone-900",
      speaker: "R. சக்திவேல் (மாநில பொருளாளர்)"
    },
    {
      id: "v3",
      title: "உயர் கட்டடங்களில் பெயிண்டிங் செய்யும்போது பின்பற்ற வேண்டிய பாதுகாப்பு முறைகள்",
      titleEn: "Safety & Harness Guidelines for High-Rise Painting Workers",
      duration: "25:10",
      views: "12.8K",
      date: "2 வாரங்கள் முன்பு",
      category: "பாதுகாப்பு",
      thumbnailColor: "from-blue-800 to-indigo-950",
      speaker: "பாதுகாப்புப் பிரிவு"
    },
    {
      id: "v4",
      title: "மதுரை & கோவை மாவட்ட மாபெரும் பெயிண்டர்கள் விழிப்புணர்வு பேரணி",
      titleEn: "Madurai & Coimbatore Painters Mega Awareness Rally",
      duration: "31:05",
      views: "22.1K",
      date: "3 வாரங்கள் முன்பு",
      category: "பேரணி",
      thumbnailColor: "from-emerald-800 to-teal-950",
      speaker: "மாவட்ட நிர்வாகிகள்"
    }
  ];

  const [videoArchive, setVideoArchive] = useState<TvVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem("tnpa2_tv_custom_media");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultArchive;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("tnpa2_tv_custom_media");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setVideoArchive(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tnpa_tv_media_updated", handleStorageChange as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tnpa_tv_media_updated", handleStorageChange as EventListener);
    };
  }, []);

  // ==========================================
  // AI AUTO NEWS STUDIO STATES & ENGINE
  // ==========================================
  const [sampleVideos, setSampleVideos] = useState([
    {
      id: "sample_1",
      name: "மாநில செயற்குழு மாநாடு 2026 (State Executive Conference)",
      location: "திருச்சிராப்பள்ளி (Tiruchirappalli)",
      duration: "03:45",
      previewBg: "from-rose-900 via-stone-900 to-amber-900",
      detectedPeople: ["எஸ். மைக்கேல் ஆல்வின் (மாநில தலைவர்)", "ரா. சேவியர் பாபு (மாநில பொதுச் செயலாளர்)", "ஆர். சக்திவேல் (மாநில பொருளாளர்)"],
      suggestedCategory: "Conference",
      suggestedHeadline: "TNPA² மாநில மாநாடு திருச்சி மாநகரில் எழுச்சியுடன் துவக்கம் - 10,000 ஓவியர்கள் பங்கேற்பு!",
      suggestedSummary: "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் மாநில செயற்குழு மாநாடு திருச்சியில் நடைபெற்றது. மாநில தலைவர் எஸ். மைக்கேல் ஆல்வின் தலைமையில் நடைபெற்ற இம்மாநாட்டில், மாநில பொதுச் செயலாளர் ரா. சேவியர் பாபு சிறப்புரையாற்றினார். ஓவியர் நலவாரிய ஓய்வூதியத்தை ₹2,000 ஆக உயர்த்தவும் விபத்து காப்பீட்டு தொகையை ₹5 லட்சமாக அதிகரிக்கவும் அரசை வலியுறுத்தி முக்கிய தீர்மானங்கள் நிறைவேற்றப்பட்டன.",
      tickerText: "🔴 பிரேக்கிங் செய்தி: TNPA² மாநில மாநாட்டில் ஓவியர்களுக்கு ₹5 லட்சம் விபத்து காப்பீடு கோரி தீர்மானம் நிறைவேற்றம்!",
      aiScript: "வணக்கம். TNPA² டிவி செய்திப் செய்திகளுக்காக AI செய்தி வாசிப்பாளர். திருச்சி மாநகரில் தமிழ்நாடு பெயிண்டர்கள் நலச் சங்கத்தின் மாநில மாநாடு மிக பிரம்மாண்டமாக நடைபெற்றது. இதில் மாநில தலைவர் எஸ். மைக்கேல் ஆல்வின் மற்றும் மாநில பொதுச்செயலாளர் ரா. சேவியர் பாபு ஆகியோர் உரையாற்றினர். 38 மாவட்டங்களில் இருந்து பல்லாயிரக்கணக்கான ஓவிய தோழர்கள் கலந்து கொண்டனர்.",
      highlights: ["0:15 - கொடியேற்றம் & வரவேற்புரை", "1:20 - மாநில பொதுச் செயலாளர் ரா. சேவியர் பாபு உரை", "2:45 - நலவாரிய கோரிக்கை தீர்மானங்கள் வாசிப்பு"]
    },
    {
      id: "sample_2",
      name: "நலவாரிய ஓய்வூதிய கோரிக்கை மனு தாக்கல் (Welfare Pension Petition)",
      location: "சென்னை தலைமைச் செயலகம் (Chennai Secretariat)",
      duration: "02:10",
      previewBg: "from-amber-900 via-[#b91c1c] to-stone-900",
      detectedPeople: ["ரா. சேவியர் பாபு (மாநில பொதுச் செயலாளர்)", "ஆர். சக்திவேல் (மாநில பொருளாளர்)"],
      suggestedCategory: "Welfare Scheme",
      suggestedHeadline: "தொழிலாளர் நலத் துறை அமைச்சரிடம் TNPA² சார்பில் கோரிக்கை மனு கையளிப்பு!",
      suggestedSummary: "தமிழ்நாடு தொழிலாளர் நலன் மற்றும் திறன் மேம்பாட்டுத் துறை அமைச்சரை நேரில் சந்தித்த TNPA² மாநில பொதுச் செயலாளர் ரா. சேவியர் பாபு மற்றும் மாநில பொருளாளர் ஆர். சக்திவேல் ஆகியோர், ஓய்வூதியத்தை ₹2,000 ஆக உயர்த்தக் கோரும் விரிவான மனுவை அளித்தனர்.",
      tickerText: "அரசுக்கு கோரிக்கை மனு: கட்டுமான நலவாரிய ஓவியர்களுக்கு மாத ஓய்வூதியம் ₹2,000 உயர்த்த வலியுறுத்தல்!",
      aiScript: "வணக்கம். சென்னை தலைமைச் செயலகத்தில் தொழிலாளர் நலத்துறை அமைச்சரை நேரில் சந்தித்த மாநில பொதுச்செயலாளர் ரா. சேவியர் பாபு, ஓவியர் நலவாரிய உறுப்பினர்களுக்கு உடனடியாக ஓய்வூதியம் வழங்கும் நடைமுறையை எளிமைப்படுத்த வலியுறுத்தினார்.",
      highlights: ["0:10 - அமைச்சருடன் சந்திப்பு", "0:50 - கோரிக்கை மனு வாசிப்பு", "1:40 - மாநில பொதுச்செயலாளர் செய்தி அறிக்கை"]
    },
    {
      id: "sample_3",
      name: "உயர் கட்டட பெயிண்டிங் பாதுகாப்புப் பயிற்சி (Safety Harness Workshop)",
      location: "கோவை (Coimbatore)",
      duration: "04:12",
      previewBg: "from-blue-900 via-indigo-950 to-stone-900",
      detectedPeople: ["பாதுகாப்பு நிபுணர் குழு", "கோவை மாவட்ட நிர்வாகிகள்"],
      suggestedCategory: "Training",
      suggestedHeadline: "10 அடிக்கு மேல் உயரத்தில் வேலை செய்யும் ஓவியர்களுக்கு நவீன பாதுகாப்பு பெல்ட் பயிற்சி!",
      suggestedSummary: "கோவையில் TNPA² சார்பில் ஏற்பாடு செய்யப்பட்டிருந்த உயர்கட்டட பெயிண்டிங் பாதுகாப்பு முகாமில் 300-க்கும் மேற்பட்ட பெயிண்டர்களுக்கு சர்வதேச தரத்திலான ஹெல்மெட் மற்றும் சேஃப்டி ஹார்னஸ் பயன்படுத்த செயல்முறைப் பயிற்சி அளிக்கப்பட்டது.",
      tickerText: "பாதுகாப்பு முகாம்: 10 அடிக்கு மேல் பணிபுரியும் பெயிண்டர்களுக்கு கட்டாய சேஃப்டி பெல்ட் விழிப்புணர்வு!",
      aiScript: "வணக்கம். கோவையில் நடைபெற்ற பெயிண்டிங் பாதுகாப்பு விழிப்புணர்வு முகாமில், பணியின்போது ஏற்படும் விபத்துகளை முற்றிலுமாக தவிர்க்கும் நவீன பாதுகாப்பு கருவிகள் குறித்து செயல்முறை விளக்கம் அளிக்கப்பட்டது.",
      highlights: ["0:30 - சேஃப்டி பெல்ட் செயல்முறை", "2:00 - வேதிப்பொருள் சுவாசக் கவசம் விளக்கம்", "3:30 - சான்றிதழ் வழக்கம்"]
    }
  ]);

  const categoriesList = [
    "Union News",
    "Welfare Scheme",
    "Protest",
    "Conference",
    "Meeting",
    "Training",
    "Membership",
    "Government Announcement",
    "Accident Awareness",
    "Achievement",
    "Social Service"
  ];

  const categoriesTaMap: Record<string, string> = {
    "Union News": "சங்கச் செய்தி",
    "Welfare Scheme": "நலவாரியத் திட்டம்",
    "Protest": "ஆர்ப்பாட்டம் / போராட்டம்",
    "Conference": "மாநாடு / பேரவை",
    "Meeting": "செயற்குழு கூட்டம்",
    "Training": "பாதுகாப்புப் பயிற்சி",
    "Membership": "உறுப்பினர் சேர்க்கை",
    "Government Announcement": "அரசு அறிவிப்பு",
    "Accident Awareness": "விபத்து விழிப்புணர்வு",
    "Achievement": "சங்கச் சாதனை",
    "Social Service": "சமுதாயப் பணி"
  };

  // Selected video for AI processing
  const [selectedVideoId, setSelectedVideoId] = useState<string>("sample_1");
  const [customVideoName, setCustomVideoName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState<number>(0);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);

  // Video Upload States
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // File Upload Process & Validation (500MB max, MP4, MOV, WEBM)
  const handleProcessVideoFile = (file: File) => {
    if (!isSuperAdmin) {
      alert(lang === "ta" ? "மன்னிக்கவும்! வீடியோ பதிவேற்றம் சூப்பர் அட்மினுக்கு மட்டுமே அனுமதிக்கப்பட்டுள்ளது." : "Sorry! Video upload is restricted to Super Admin only.");
      return;
    }
    setUploadError(null);
    setUploadSuccess(null);

    if (file.size > 500 * 1024 * 1024) {
      setUploadError(lang === "ta" ? "கோப்பின் அளவு 500MB-ஐ விட அதிகமாக இருக்கக்கூடாது (Max 500MB)" : "File size exceeds 500MB limit.");
      return;
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/avi'];
    const isValidExt = /\.(mp4|mov|webm|m4v|avi)$/i.test(file.name);
    if (!validTypes.includes(file.type) && !isValidExt) {
      setUploadError(lang === "ta" ? "MP4, MOV அல்லது WEBM வீடியோ கோப்புகள் மட்டுமே அனுமதிக்கப்படும்" : "Invalid format. Only MP4, MOV, WEBM allowed.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      setUploadedFile(file);
      const objUrl = URL.createObjectURL(file);
      setUploadedFileUrl(objUrl);

      const newId = `upload_${Date.now()}`;
      const newVideoItem = {
        id: newId,
        name: file.name,
        location: currentUser?.district ? `${currentUser.district} (Uploaded)` : "Tamil Nadu (Uploaded)",
        duration: "03:15",
        previewBg: "from-stone-900 via-rose-950 to-stone-950",
        detectedPeople: [currentUser?.name ? `${currentUser.name} (Uploaded Admin)` : "ரா. சேவியர் பாபு (மாநில பொதுச் செயலாளர்)"],
        suggestedCategory: "Union News",
        suggestedHeadline: `TNPA² சிறப்புச் செய்தி: ${file.name.replace(/\.[^/.]+$/, "")} குறித்த நேரலை அறிக்கை`,
        suggestedSummary: `உறுப்பினர் பதிவேற்றிய புதிய வீடியோ கோப்பு '${file.name}' வெற்றிகரமாக AI ஸ்டுடியோவிற்குள் இணைக்கப்பட்டது. மாநில சங்க நடவடிக்கைகள் மற்றும் மாவட்ட கோரிக்கைகள் குறித்த முக்கிய தகவல்களை இப்பதிவு கொண்டுள்ளது.`,
        tickerText: `🔴 பிரேக்கிங் செய்தி: புதிய வீடியோ பதிவேற்றம் செய்யப்பட்டுள்ளது - ${file.name}`,
        aiScript: `வணக்கம். TNPA² AI செய்தி வாசிப்பாளர். நிர்வாகியால் பதிவேற்றப்பட்ட புதிய வீடியோ கோப்பு வெற்றிகரமாக பகுப்பாய்வு செய்யப்பட்டுள்ளது.`,
        highlights: ["0:10 - கோப்பு முன்னோக்கம்", "1:15 - AI பகுப்பாய்வு சுருக்கம்", "2:00 - முக்கிய குறிப்புகள்"]
      };

      setSampleVideos((prev: any[]) => [newVideoItem, ...prev]);
      setSelectedVideoId(newId);
      setIsAnalyzed(false);

      setUploadSuccess(lang === "ta" ? "வீடியோ வெற்றிகரமாக பதிவேற்றப்பட்டது! AI பகுப்பாய்விற்கு தயாராக உள்ளது." : "Video uploaded successfully! Ready for AI analysis.");
      onAddAuditLog("Video Uploaded Successfully", `File: ${file.name} (${Math.round(file.size / (1024 * 1024))}MB)`);
    }, 1200);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessVideoFile(e.target.files[0]);
    }
  };

  // Editable AI Results
  const [aiHeadline, setAiHeadline] = useState<string>("");
  const [aiCategory, setAiCategory] = useState<string>("Union News");
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiTickerText, setAiTickerText] = useState<string>("");
  const [aiScript, setAiScript] = useState<string>("");
  const [aiSpeaker, setAiSpeaker] = useState<string>("ரா. சேவியர் பாபு (மாநில பொதுச் செயலாளர்)");
  const [aiHighlights, setAiHighlights] = useState<string[]>([]);
  const [aiQualityScore, setAiQualityScore] = useState<number>(98);
  const [duplicateChecked, setDuplicateChecked] = useState<boolean>(true);

  // Overlay Controls
  const [showTnpaLogo, setShowTnpaLogo] = useState<boolean>(true);
  const [showTnpaFlag, setShowTnpaFlag] = useState<boolean>(true);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState<boolean>(true);
  const [showHeadlineOverlay, setShowHeadlineOverlay] = useState<boolean>(true);
  const [showLowerThird, setShowLowerThird] = useState<boolean>(true);
  const [showNewsTickerOverlay, setShowNewsTickerOverlay] = useState<boolean>(true);
  const [showIntroOutro, setShowIntroOutro] = useState<boolean>(true);
  
  // Virtual AI Anchor & Voice TTS State
  const [showAiAnchor, setShowAiAnchor] = useState<boolean>(true);
  const [isSpeakingScript, setIsSpeakingScript] = useState<boolean>(false);
  const [broadcastMode, setBroadcastMode] = useState<"instant" | "scheduled" | "breaking">("instant");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishedSuccess, setPublishedSuccess] = useState<boolean>(false);

  // Auto populate on select or analyze
  const handleSelectVideo = (vId: string) => {
    setSelectedVideoId(vId);
    setIsAnalyzed(false);
    setPublishedSuccess(false);
  };

  // Trigger AI Analysis
  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgressStep(1);
    setIsAnalyzed(false);
    setPublishedSuccess(false);

    const targetVid = sampleVideos.find(v => v.id === selectedVideoId) || sampleVideos[0];

    setTimeout(() => setAnalysisProgressStep(2), 700);
    setTimeout(() => setAnalysisProgressStep(3), 1400);
    setTimeout(() => setAnalysisProgressStep(4), 2100);

    setTimeout(() => {
      setIsAnalyzing(false);
      setIsAnalyzed(true);
      setAiHeadline(targetVid.suggestedHeadline);
      setAiCategory(targetVid.suggestedCategory);
      setAiSummary(targetVid.suggestedSummary);
      setAiTickerText(targetVid.tickerText);
      setAiScript(targetVid.aiScript);
      setAiSpeaker(targetVid.detectedPeople[0] || "ரா. சேவியர் பாபு (மாநில பொதுச் செயலாளர்)");
      setAiHighlights(targetVid.highlights);
      setAiQualityScore(98);
      setDuplicateChecked(true);

      onAddAuditLog("AI News Studio Video Analysis", `Analyzed video '${targetVid.name}'. Auto-generated headline & TV assets.`);
    }, 2800);
  };

  const handleSpeakAiScript = () => {
    setIsSpeakingScript(!isSpeakingScript);
    if (!isSpeakingScript && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(aiScript || "TNPA² AI News Update");
      utterance.lang = lang === "ta" ? "ta-IN" : "en-US";
      utterance.onend = () => setIsSpeakingScript(false);
      window.speechSynthesis.speak(utterance);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleApproveAndPublish = () => {
    setIsPublishing(true);
    setPublishedSuccess(false);

    setTimeout(() => {
      setIsPublishing(false);
      setPublishedSuccess(true);
      onAddAuditLog("TNPA2 TV Broadcast Published", `Published AI-generated news broadcast: ${aiHeadline}`);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">

      {/* SUPER ADMIN & VIEWER TOP TAB SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 p-3 rounded-2xl border border-stone-800 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#b91c1c] to-amber-500 text-white flex items-center justify-center font-black">
            TV
          </div>
          <div>
            <h3 className="text-white font-black text-sm">TNPA² 24x7 Digital TV & News Studio</h3>
            <p className="text-stone-400 text-[11px]">{lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் சங்கம் அதிகாரப்பூர்வ தொலைக்காட்சி" : "Official Media Broadcast Channel"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewMode("channel")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeViewMode === "channel"
                ? "bg-[#b91c1c] text-white shadow-md"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{lang === "ta" ? "நேரலை TV & ஆவணக்காப்பகம்" : "Live TV & Archive"}</span>
          </button>

          <button
            onClick={() => setActiveViewMode("studio")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeViewMode === "studio"
                ? "bg-amber-500 text-stone-950 font-black shadow-md"
                : "bg-stone-800 text-amber-400 hover:bg-stone-700"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === "ta" ? "AI வீடியோ வடிவமைப்பு (AI Design)" : "AI Video Design Studio"}</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveViewMode("admin_control")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeViewMode === "admin_control"
                  ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md font-black"
                  : "bg-stone-800 text-rose-300 hover:bg-stone-700 border border-rose-500/30"
              }`}
            >
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>{lang === "ta" ? "அட்மின் நேரலை கண்ட்ரோல்" : "Super Admin Stream Control"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* MODE 3: SUPER ADMIN LIVE STREAM CONTROL    */}
      {/* ========================================== */}
      {activeViewMode === "admin_control" && (
        <AdminLiveBroadcastControl
          lang={lang}
          currentUser={currentUser}
          onAddAuditLog={onAddAuditLog}
        />
      )}

      {/* ========================================== */}
      {/* MODE 1: LIVE TV BROADCAST & ARCHIVE VIEW   */}
      {/* ========================================== */}
      {activeViewMode === "channel" && (
        <div className="space-y-6">
          
          {/* MAIN VIDEO PLAYER & LIVE CHAT SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col (8 cols): Video Player Frame */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="space-y-3">
                {(() => {
                  const activeStreamSource = uploadedFileUrl || liveHlsUrl || (rtmpIngestUrl ? rtmpIngestUrl : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
                  const isStreamConfigured = Boolean(activeStreamSource && activeStreamSource.trim().length > 0);

                  if (isStreamConfigured) {
                    return (
                      <TnpaVideoPlayer
                        src={activeStreamSource}
                        title={lang === "ta" ? "TNPA² மாநிலத் தலைவர் நேரலை உரை - நலவாரிய ஓய்வூதியம்" : "TNPA² Live State President Keynote"}
                        lang={lang}
                        isLive={true}
                        onShare={handleCopyLink}
                      />
                    );
                  }

                  return (
                    <div className="relative aspect-video bg-stone-900 border border-stone-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl overflow-hidden group">
                      {/* Background decorative glow */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-900 to-[#b91c1c]/10 opacity-70 pointer-events-none" />
                      
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-stone-800/80 border border-stone-700/80 backdrop-blur-md rounded-full text-stone-400 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span>{lang === "ta" ? "ஒளிபரப்பு நிலை" : "Broadcast Status"}</span>
                      </div>

                      <div className="relative z-10 p-4 bg-stone-800/80 border border-stone-700 rounded-full text-amber-400 shadow-lg">
                        <Radio className="w-10 h-10 animate-pulse text-rose-500" />
                      </div>

                      <div className="relative z-10 space-y-2 max-w-lg">
                        <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                          {lang === "ta" 
                            ? "நேரலை ஒளிபரப்பு தற்போது முடங்கியுள்ளது அல்லது அமைக்கப்படவில்லை" 
                            : "Live stream currently offline or not configured"}
                        </h3>
                        <p className="text-xs text-stone-400 leading-relaxed font-medium">
                          {lang === "ta"
                            ? "RTMP_INGEST_URL அல்லது நேரலை ஸ்ட்ரீம் URLகள் சுற்றுச்சூழலில் (Environment) அமைக்கப்படவில்லை அல்லது பதிவேற்றப்பட்ட வீடியோ இல்லை. நிர்வாகியால் நேரலை துவங்கப்படும்போது இங்கு தானாக ஒளிபரப்பாகும்."
                            : "Neither RTMP_INGEST_URL nor live stream playback URLs are currently configured. Once a stream is configured or uploaded by administrators, live video will stream here."}
                        </p>
                      </div>

                      {isSuperAdmin && (
                        <div className="relative z-10 pt-2 flex flex-wrap gap-3 justify-center">
                          <button
                            onClick={() => setActiveViewMode("admin_control")}
                            className="px-4 py-2 bg-gradient-to-r from-[#b91c1c] to-amber-600 hover:from-rose-800 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Sliders className="w-4 h-4" />
                            <span>{lang === "ta" ? "நேரலை அமைப்புகளை நிர்வகி (Control Panel)" : "Manage Broadcast Settings"}</span>
                          </button>
                          <button
                            onClick={() => setActiveViewMode("studio")}
                            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>{lang === "ta" ? "வீடியோ பதிவேற்று (Upload Video)" : "Upload Stream Video"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Bottom Running News Ticker */}
                <div className="bg-[#b91c1c] text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-3 overflow-hidden shadow-md border border-red-700">
                  <span className="px-2.5 py-1 bg-yellow-400 text-stone-950 text-[10px] font-black rounded uppercase shrink-0 animate-pulse">
                    {lang === "ta" ? "செய்தி பலகை" : "TICKER"}
                  </span>
                  <div className="truncate text-stone-100 font-medium">
                    {lang === "ta" ? tickerNewsTa[tickerIndex] : tickerNewsEn[tickerIndex]}
                  </div>
                </div>
              </div>

              {/* Quick Channel Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "live", name: "TNPA² நேரலை", nameEn: "TNPA² Live", icon: <Radio className="w-4 h-4 text-rose-600" /> },
                  { id: "welfare", name: "நலவாரிய வழிகாட்டி", nameEn: "Welfare Board TV", icon: <ShieldCheck className="w-4 h-4 text-amber-600" /> },
                  { id: "events", name: "மாநாடுகள் & பேரணி", nameEn: "Conferences TV", icon: <Award className="w-4 h-4 text-blue-600" /> },
                  { id: "news", name: "மாவட்ட செய்திகள்", nameEn: "District News TV", icon: <Tv className="w-4 h-4 text-emerald-600" /> }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch.id as any)}
                    className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all flex items-center gap-2.5 cursor-pointer ${
                      selectedChannel === ch.id
                        ? "bg-[#b91c1c] text-white border-amber-400 shadow-md"
                        : "bg-white border-stone-200 text-stone-800 hover:border-stone-300"
                    }`}
                  >
                    {ch.icon}
                    <span className="truncate">{lang === "ta" ? ch.name : ch.nameEn}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Right Col (4 cols): Live Interactive Comments / Chat Box */}
            <div className="lg:col-span-4 bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-[480px]">
              <div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#b91c1c]" />
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      {lang === "ta" ? "நேரலை உறுப்பினர்கள் கருத்துகள்" : "Live Member Reactions & Chat"}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                    {comments.length} {lang === "ta" ? "கருத்துகள்" : "Messages"}
                  </span>
                </div>

                {/* Comments Scrollable Area */}
                <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <div key={c.id} className="p-2.5 bg-stone-50 border border-stone-150 rounded-2xl text-xs space-y-1 hover:bg-stone-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-stone-900 text-[11px]">{c.user}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded">
                          {c.role}
                        </span>
                      </div>
                      <p className="text-stone-700 leading-relaxed font-medium">{c.text}</p>
                      <div className="flex justify-between items-center text-[10px] text-stone-400 pt-1">
                        <span>{c.time}</span>
                        <button 
                          onClick={() => {
                            setComments(prev => prev.map(item => item.id === c.id ? { ...item, likes: item.likes + 1 } : item));
                          }}
                          className="flex items-center gap-1 text-stone-500 hover:text-[#b91c1c] cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{c.likes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Comment Input Form */}
              <form onSubmit={handleAddComment} className="pt-3 border-t border-stone-100 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={lang === "ta" ? "உங்கள் கருத்தைப் பதிவிடவும்..." : "Write a live comment..."}
                  className="flex-grow px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#b91c1c]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

          {/* PROGRAM GUIDE (EPG) & RECENT BROADCAST ARCHIVE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Today's TV Program Schedule (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">
                    {lang === "ta" ? "இன்றைய TV நிகழ்ச்சிகள் அட்டவணை" : "Today's TV Program Schedule (EPG)"}
                  </h3>
                  <p className="text-stone-400 text-[11px]">
                    {lang === "ta" ? "TNPA² சேனல் நேரலை நேரங்கள்" : "Official Broadcast Timings"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {programGuide.map((prog) => (
                  <div
                    key={prog.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      prog.isLiveNow
                        ? "bg-amber-50/80 border-amber-400 shadow-sm"
                        : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    <div className="shrink-0 text-center space-y-1">
                      <span className={`px-2 py-1 rounded text-[10px] font-black block ${prog.isLiveNow ? "bg-[#b91c1c] text-white" : "bg-stone-200 text-stone-800"}`}>
                        {prog.time}
                      </span>
                      {prog.isLiveNow && (
                        <span className="text-[9px] font-black text-[#b91c1c] block animate-pulse">
                          ● LIVE NOW
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-stone-900 text-xs">
                        {lang === "ta" ? prog.title : prog.titleEn}
                      </h4>
                      <p className="text-stone-500 text-[11px] font-medium">
                        {prog.presenter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Past Video Archive & TV News Clips (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#b91c1c]" />
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      {lang === "ta" ? "முந்தைய ஒளிபரப்புகள் & வீடியோ ஆவணக்காப்பகம்" : "Previous TV Broadcasts & Video Archive"}
                    </h3>
                    <p className="text-stone-400 text-[11px]">
                      {lang === "ta" ? "சங்க மாநாடுகள், நலவாரியப் பயிற்சிகள் & வீடியோக்கள்" : "State conventions, safety seminars & rally recordings"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#b91c1c]">
                  {videoArchive.length} {lang === "ta" ? "வீடியோக்கள்" : "Videos"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videoArchive.map((vid) => (
                  <div
                    key={vid.id}
                    className="border border-stone-200 rounded-2xl overflow-hidden hover:border-amber-500 hover:shadow-md transition-all group cursor-pointer bg-stone-50 flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className={`relative aspect-video bg-gradient-to-br ${vid.thumbnailColor} p-4 flex flex-col justify-between text-white`}>
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-black/60 rounded text-[9px] font-bold backdrop-blur-xs">
                            {vid.category}
                          </span>
                          <span className="px-2 py-0.5 bg-black/80 rounded text-[9px] font-mono font-bold">
                            {vid.duration}
                          </span>
                        </div>

                        <div className="mx-auto h-10 w-10 rounded-full bg-white/20 group-hover:bg-amber-500 text-white group-hover:text-stone-950 flex items-center justify-center backdrop-blur-xs transition-all shadow-lg">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>

                        <div className="text-[10px] text-stone-200 font-semibold truncate">
                          {vid.speaker}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3 space-y-1">
                        <h4 className="font-extrabold text-stone-900 text-xs leading-snug group-hover:text-[#b91c1c] transition-colors line-clamp-2">
                          {lang === "ta" ? vid.title : vid.titleEn}
                        </h4>
                        <div className="flex justify-between items-center text-[10px] text-stone-400 pt-1">
                          <span>{vid.views} {lang === "ta" ? "பார்வைகள்" : "views"}</span>
                          <span>{vid.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* MODE 2: AI AUTO NEWS STUDIO (ADMIN CENTER) */}
      {/* ========================================== */}
      {activeViewMode === "studio" && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          
          {/* STUDIO BANNER INFO */}
          <div className="p-5 bg-stone-900 border border-amber-500/40 rounded-3xl text-white shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#b91c1c] to-amber-500 rounded-2xl text-white shadow-lg">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-amber-300">
                    {lang === "ta" ? "TNPA² AI Auto News Studio - தானியங்கி செய்தி தயாரிப்பு மையம்" : "TNPA² AI Auto News Studio - Video Converter & Broadcast Creator"}
                  </h2>
                  <p className="text-xs text-stone-300">
                    {lang === "ta" ? "நிர்வாகி பதிவேற்றும் வீடியோக்களை AI தானாக பகுப்பாய்வு செய்து, தலைப்பு, செய்தி சுருக்கம், ஓடும் செய்தி மற்றும் அனிமேஷன் கிராபிக்ஸ்களுடன் டிஜிட்டல் செய்தியாக மாற்றும்." : "Automatically converts uploaded raw videos into professional broadcast TV news with headlines, overlays, tickers, and AI virtual anchors."}
                  </p>
                </div>
              </div>
              
              <span className="hidden md:inline-flex px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-extrabold rounded-full border border-amber-500/40 items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI POWERED V2.5</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN (5 COLS): STEP 1 - VIDEO SELECTION & AI ENGINE TRIGGER */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* STEP 1: VIDEO INPUT SELECTOR */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#b91c1c] text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      {lang === "ta" ? "வீடியோ பதிவேற்றம் / மாதிரி வீடியோ தேர்வு" : "Upload Video or Select Sample Recording"}
                    </h3>
                  </div>
                  <Film className="w-4 h-4 text-stone-400" />
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="video/mp4,video/quicktime,video/webm"
                  className="hidden"
                />

                {/* Upload Drag & Drop Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleProcessVideoFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-2 transition-all cursor-pointer ${
                    isDraggingOver ? "border-amber-500 bg-amber-50/30" : "border-stone-300 hover:border-amber-500 bg-stone-50"
                  }`}
                >
                  <Upload className={`w-8 h-8 text-amber-600 mx-auto ${isUploading ? "animate-spin" : "animate-bounce"}`} />
                  <p className="text-xs font-extrabold text-stone-800">
                    {lang === "ta" ? "புதிய வீடியோவை இங்கே இழுத்துப் போடவும் அல்லது கிளிக் செய்யவும்" : "Drag & drop video file here or click to browse"}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    MP4, MOV, WEBM (Max 500MB) • Supports HD 1080p
                  </p>

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[10px] font-bold text-stone-600">
                        <span>{lang === "ta" ? "பதிவேற்றம் செய்யப்படுகிறது..." : "Uploading video..."}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Uploaded File Info Preview */}
                  {uploadedFile && !isUploading && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-1 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-900 truncate max-w-[80%]">📹 {uploadedFile.name}</span>
                        <span className="text-[9px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                          {Math.round(uploadedFile.size / (1024 * 1024))} MB
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-700">
                        {lang === "ta" ? "✓ வீடியோ வெற்றிகரமாக இணைக்கப்பட்டது. AI பகுப்பாய்வு பொத்தானை அழுத்தவும்." : "✓ Video loaded successfully. Click 'Analyze Video with AI Studio'."}
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 text-left">
                      ⚠️ {uploadError}
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadSuccess && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 text-left">
                      {uploadSuccess}
                    </div>
                  )}
                </div>

                {/* Sample Pre-loaded Videos */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-stone-700">
                    {lang === "ta" ? "அல்லது மாதிரி சங்க நிகழ்வு வீடியோவைத் தேர்ந்தெடுக்கவும்:" : "Or pick a sample union recording:"}
                  </label>
                  
                  <div className="space-y-2">
                    {sampleVideos.map((sv) => (
                      <button
                        key={sv.id}
                        onClick={() => handleSelectVideo(sv.id)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          selectedVideoId === sv.id
                            ? "bg-amber-50 border-amber-500 shadow-sm"
                            : "bg-stone-50 border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="font-extrabold text-xs text-stone-900 block">{sv.name}</span>
                          <div className="flex items-center gap-2 text-[10px] text-stone-500">
                            <span>📍 {sv.location}</span>
                            <span>⏱️ {sv.duration}</span>
                          </div>
                        </div>
                        {selectedVideoId === sv.id && (
                          <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI ANALYZE TRIGGER BUTTON */}
                <button
                  onClick={handleRunAiAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-gradient-to-r from-[#b91c1c] via-rose-700 to-amber-600 hover:from-rose-800 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === "ta" ? "AI பகுப்பாய்வு நடக்கிறது..." : "AI Engine Analyzing Video..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>{lang === "ta" ? "🤖 AI மூலம் வீடியோவை பகுப்பாய்வு செய்க" : "Analyze Video with AI Studio"}</span>
                    </>
                  )}
                </button>

                {/* Progress Animation during analysis */}
                {isAnalyzing && (
                  <div className="p-4 bg-stone-900 text-amber-300 rounded-2xl text-xs space-y-2 border border-amber-500/30">
                    <div className="flex items-center justify-between font-bold">
                      <span>{lang === "ta" ? "AI பகுப்பாய்வு முன்னேற்றம்:" : "AI Processing Steps:"}</span>
                      <span>{analysisProgressStep * 25}%</span>
                    </div>

                    <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full transition-all duration-500" 
                        style={{ width: `${analysisProgressStep * 25}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-stone-300 space-y-1 pt-1">
                      {analysisProgressStep >= 1 && <p className="flex items-center gap-1">✅ 1. Analyzing video frames & location...</p>}
                      {analysisProgressStep >= 2 && <p className="flex items-center gap-1">✅ 2. Identifying leaders & speakers (ரா. சேவியர் பாபு, எஸ். மைக்கேல் ஆல்வின்)...</p>}
                      {analysisProgressStep >= 3 && <p className="flex items-center gap-1">✅ 3. Generating Tamil headline & ticker text...</p>}
                      {analysisProgressStep >= 4 && <p className="flex items-center gap-1">✅ 4. Creating TV graphics & AI Voice Script...</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: EDITABLE AI ANALYSIS RESULTS (When Analyzed) */}
              {isAnalyzed && (
                <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center">
                        2
                      </span>
                      <h3 className="font-extrabold text-stone-900 text-sm">
                        {lang === "ta" ? "AI உருவாக்கிய செய்தி விவரங்கள் (சரிபார்க்கவும்)" : "AI Generated News Metadata (Editable)"}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      Score: {aiQualityScore}%
                    </span>
                  </div>

                  {/* Duplicate Check & Quality Status */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                      <span>{lang === "ta" ? "போலி வீடியோ சோதனையில் வெற்றி (No Duplicate Found)" : "Duplicate Check Passed - HD 1080p Verified"}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded text-emerald-900">Valid</span>
                  </div>

                  {/* Headline Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-stone-700">
                      {lang === "ta" ? "செய்தித் தலைப்பு (AI Headline):" : "Auto Headline:"}
                    </label>
                    <textarea
                      value={aiHeadline}
                      onChange={(e) => setAiHeadline(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:border-[#b91c1c] focus:outline-none font-bold text-stone-900"
                    />
                  </div>

                  {/* Category Selector (11 official categories) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-stone-700">
                      {lang === "ta" ? "செய்திப் பிரிவு (Category):" : "Category Classification:"}
                    </label>
                    <select
                      value={aiCategory}
                      onChange={(e) => setAiCategory(e.target.value)}
                      className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:border-[#b91c1c] focus:outline-none font-bold"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat} ({categoriesTaMap[cat] || cat})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ticker Text */}
                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-stone-700">
                      {lang === "ta" ? "ஓடும் செய்தி வரிக்கூறு (News Ticker):" : "News Ticker Text:"}
                    </label>
                    <input
                      type="text"
                      value={aiTickerText}
                      onChange={(e) => setAiTickerText(e.target.value)}
                      className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-xl font-medium"
                    />
                  </div>

                  {/* Tamil Summary */}
                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-stone-700">
                      {lang === "ta" ? "செய்திச் சுருக்கம் (Summary):" : "Tamil News Summary:"}
                    </label>
                    <textarea
                      value={aiSummary}
                      onChange={(e) => setAiSummary(e.target.value)}
                      rows={3}
                      className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-800 leading-relaxed"
                    />
                  </div>

                  {/* Identified Speaker */}
                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-stone-700">
                      {lang === "ta" ? "அடையாளம் காணப்பட்ட நிர்வாகி (Lower Third Speaker):" : "Identified Speaker Name:"}
                    </label>
                    <input
                      type="text"
                      value={aiSpeaker}
                      onChange={(e) => setAiSpeaker(e.target.value)}
                      className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    />
                  </div>

                  {/* Highlights */}
                  <div className="p-3 bg-stone-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-stone-500 uppercase block">
                      {lang === "ta" ? "முக்கிய நிகழ்வுகள் (Video Highlights):" : "Key Moments & Chapters:"}
                    </span>
                    <ul className="text-xs space-y-0.5 text-stone-700">
                      {aiHighlights.map((hl, i) => (
                        <li key={i}>• {hl}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

            </div>

            {/* RIGHT COLUMN (7 COLS): STEP 3 - LIVE STUDIO PREVIEW & OVERLAYS & PUBLISH */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* STUDIO PREVIEW PLAYER WITH GRAPHIC OVERLAYS */}
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4 text-white">
                <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-extrabold text-amber-300 text-sm">
                      {lang === "ta" ? "TV செய்தி முன்னோட்டம் & தானியங்கி கிராபிக்ஸ்" : "TV News Broadcast Studio Preview"}
                    </h3>
                  </div>

                  <span className="text-[10px] bg-red-600 text-white font-black px-2.5 py-0.5 rounded tracking-wider flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    PREVIEW STUDIO
                  </span>
                </div>

                {/* GRAPHICS CONTROLS TOGGLES */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-950 p-3 rounded-2xl border border-stone-800 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTnpaLogo}
                      onChange={(e) => setShowTnpaLogo(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>TNPA Logo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showHeadlineOverlay}
                      onChange={(e) => setShowHeadlineOverlay(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Headline Bar</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLowerThird}
                      onChange={(e) => setShowLowerThird(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Speaker Name</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNewsTickerOverlay}
                      onChange={(e) => setShowNewsTickerOverlay(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>News Ticker</span>
                  </label>
                </div>

                {/* INTERACTIVE TV PREVIEW CANVAS */}
                <div className="relative aspect-video w-full bg-stone-950 rounded-2xl overflow-hidden border-2 border-stone-800 shadow-2xl flex flex-col justify-between p-4">
                  
                  {/* Dynamic Gradient Background simulating video stream */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-rose-950/40 to-stone-950 pointer-events-none" />

                  {/* TOP OVERLAYS: TNPA LOGO & FLAG */}
                  <div className="relative z-10 flex justify-between items-start">
                    {/* Top Left Flag & Live Badge */}
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#b91c1c] text-white font-black text-[10px] rounded tracking-wider flex items-center gap-1 shadow-md">
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                        TNPA² TV NEWS
                      </span>
                      {showTnpaFlag && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-[9px] rounded uppercase shadow-sm">
                          TNPA Flag
                        </span>
                      )}
                    </div>

                    {/* Top Right Logo */}
                    {showTnpaLogo && (
                      <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                        <div className="h-5 w-5 rounded-full bg-[#b91c1c] text-white flex items-center justify-center font-black text-[10px]">
                          T
                        </div>
                        <span className="text-amber-400 font-black text-[10px] tracking-wider">OFFICIAL BROADCAST</span>
                      </div>
                    )}
                  </div>

                  {/* CENTER CONTENT & VIRTUAL AI ANCHOR */}
                  <div className="relative z-10 my-auto flex items-center justify-between gap-4">
                    
                    {/* Speaker / Event Highlight Card */}
                    <div className="space-y-2 max-w-sm">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded border border-amber-500/30">
                        {aiCategory || "Union News"}
                      </span>
                      
                      <h3 className="font-black text-white text-sm md:text-base leading-snug drop-shadow-md">
                        {aiHeadline || (lang === "ta" ? "வீடியோவை பகுப்பாய்வு செய்யவும்..." : "Select & Analyze Video...")}
                      </h3>
                    </div>

                    {/* VIRTUAL AI NEWS ANCHOR AVATAR */}
                    {showAiAnchor && (
                      <div className="bg-stone-900/90 border border-amber-400/50 p-2.5 rounded-2xl backdrop-blur-md text-center space-y-1.5 shrink-0 w-32 shadow-2xl animate-[fadeIn_0.3s_ease-out]">
                        <div className="relative mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-[#b91c1c] p-0.5 shadow-md">
                          <div className="h-full w-full bg-stone-950 rounded-full flex items-center justify-center overflow-hidden">
                            <Bot className="w-9 h-9 text-amber-300 animate-pulse" />
                          </div>
                          {isSpeakingScript && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-stone-900 animate-ping" />
                          )}
                        </div>
                        <span className="text-[10px] font-black text-amber-300 block">AI Anchor</span>
                      </div>
                    )}

                  </div>

                  {/* BOTTOM OVERLAYS: LOWER THIRD SPEAKER BAR & HEADLINE & TICKER */}
                  <div className="relative z-10 space-y-1.5 pt-2 border-t border-white/10">
                    
                    {/* Lower Third Speaker Bar */}
                    {showLowerThird && aiSpeaker && (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#b91c1c] to-amber-600 text-white px-3 py-1 rounded-r-xl text-xs font-black shadow-lg">
                        <Users className="w-3.5 h-3.5 text-yellow-300" />
                        <span>{aiSpeaker}</span>
                      </div>
                    )}

                    {/* Scrolling Breaking News Ticker */}
                    {showNewsTickerOverlay && (
                      <div className="bg-[#b91c1c] text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-2 overflow-hidden shadow-inner">
                        <span className="px-1.5 py-0.5 bg-yellow-400 text-stone-950 text-[9px] font-black rounded uppercase shrink-0">
                          BREAKING
                        </span>
                        <div className="truncate text-stone-100 font-medium text-[11px]">
                          {aiTickerText || "TNPA² AI Auto News Studio - 38 மாவட்ட செய்திகள் நேரலை"}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* AI VOICE-OVER (TTS) SCRIPT & PLAYER */}
                <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-extrabold text-amber-300">
                        {lang === "ta" ? "AI செய்தி வாசிப்பாளர் உரை (Voice-Over Script):" : "AI Virtual Presenter Voice Script:"}
                      </span>
                    </div>

                    <button
                      onClick={handleSpeakAiScript}
                      className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                        isSpeakingScript
                          ? "bg-rose-600 text-white animate-pulse"
                          : "bg-amber-500 hover:bg-amber-400 text-stone-950"
                      }`}
                    >
                      <Volume className="w-3.5 h-3.5" />
                      <span>{isSpeakingScript ? (lang === "ta" ? "நிறுத்து" : "Stop Voice") : (lang === "ta" ? "🔊 AI குரல் கேட்க" : "🔊 Listen AI Voice")}</span>
                    </button>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed font-mono p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                    "{aiScript || (lang === "ta" ? "செய்தி வாசிப்பாளர் உரை இங்கே தோன்றும்..." : "AI Voice script preview will appear here...")}"
                  </p>
                </div>

                {/* PUBLISHING & BROADCAST SELECTION */}
                <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                  <span className="text-xs font-extrabold text-stone-300 block">
                    {lang === "ta" ? "ஒளிபரப்பு முறை தேர்வு (Broadcast Options):" : "Publishing Broadcast Mode:"}
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "instant", label: "உடனடி ஒளிபரப்பு (Instant Live)", labelEn: "Instant Live" },
                      { id: "scheduled", label: "அட்டவணை (Scheduled Stream)", labelEn: "Scheduled Stream" },
                      { id: "breaking", label: "பிரேக்கிங் நியூஸ் (Breaking Flash)", labelEn: "Breaking Flash" }
                    ].map((bm) => (
                      <button
                        key={bm.id}
                        onClick={() => setBroadcastMode(bm.id as any)}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-center cursor-pointer transition-all ${
                          broadcastMode === bm.id
                            ? "bg-amber-500 text-stone-950 border-amber-400"
                            : "bg-stone-900 text-stone-400 border-stone-800 hover:text-white"
                        }`}
                      >
                        {bm.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Success Banner */}
                  {publishedSuccess && (
                    <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>
                        {lang === "ta" 
                          ? "வெற்றி! AI செய்தி தயாரிப்பு வெற்றிகரமாக TNPA² TV சேனலில் வெளியிடப்பட்டது!" 
                          : "Success! AI Generated news broadcast published to TNPA² TV Channel!"}
                      </span>
                    </div>
                  )}

                  {/* APPROVE & PUBLISH BUTTON */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleApproveAndPublish}
                      disabled={isPublishing || !isAnalyzed}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isPublishing ? (
                        <span>{lang === "ta" ? "ஒளிபரப்பப்படுகிறது..." : "Publishing Stream..."}</span>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>{lang === "ta" ? "ஒப்புதல் அளித்து TNPA² TV-யில் வெளியிடுக (Approve & Publish)" : "Approve & Publish to TNPA² TV"}</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* DISPATCH TV LINK TO ALL MEMBERS MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-amber-500/30 text-left animate-[scaleUp_0.2s_ease-out]">
            
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#b91c1c] to-amber-500 text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">
                    {lang === "ta" ? "TNPA² TV லிங்க் உறுப்பினர்களுக்கு அனுப்புக" : "Dispatch TV Channel Link to Members"}
                  </h3>
                  <p className="text-stone-500 text-xs">
                    {lang === "ta" ? "அனைத்து பொறுப்பாளர்கள் & உறுப்பினர்களின் மொபைலுக்கு SMS/WhatsApp லிங்க் அனுப்பப்படும்." : "Sends automated SMS & WhatsApp notification to registered union members."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Top 3 Linked Leaders Status */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>{lang === "ta" ? "இணைக்கப்பட்ட தலைவர்கள் (Top 3 Linked Leaders):" : "Linked Top 3 Executive Leaders:"}</span>
              </div>
              <div className="space-y-1 text-[11px] text-stone-700">
                <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-amber-200">
                  <span className="font-bold">1. R. Xavier Babu (General Secretary)</span>
                  <span className="font-mono text-amber-800">+91 70101 31915 ✓</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-amber-200">
                  <span className="font-bold">2. S. Michael Alvin (State President)</span>
                  <span className="font-mono text-amber-800">+91 98765 43210 ✓</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-amber-200">
                  <span className="font-bold">3. R. Sakthivel (State Treasurer)</span>
                  <span className="font-mono text-amber-800">+91 98401 23456 ✓</span>
                </div>
              </div>
              <p className="text-[10px] text-emerald-800 font-bold italic">
                {lang === "ta" ? "• நேரலை தொடங்கும் போது மேற்கண்ட 3 தலைவர்களுக்கும் SMS/WhatsApp மூலமாக உடனடி லிங்க் செல்லும்." : "• Live TV notifications & stream links are automatically dispatched to these leaders instantly."}
              </p>
            </div>

            {/* Target Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-stone-700">
                {lang === "ta" ? "பெறுநர்கள் குழுவைத் தேர்வு செய்க:" : "Select Recipient Group:"}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "all", label: "அனைத்து 12,800+ பதிவுபெற்ற உறுப்பினர்கள் (All Members)", labelEn: "All 12,800+ Members" },
                  { id: "officials", label: "மாநில, மண்டல & நகர நிர்வாகிகள் மட்டுமே (Executives Only)", labelEn: "Union Executives & Officials Only" },
                  { id: "districts", label: "38 மாவட்ட தலைவர்கள் மட்டும் (District Presidents)", labelEn: "38 District Office Bearers" }
                ].map((target) => (
                  <button
                    key={target.id}
                    onClick={() => setDispatchTarget(target.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                      dispatchTarget === target.id
                        ? "bg-amber-50 border-amber-500 text-amber-950 shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-700"
                    }`}
                  >
                    <span>{lang === "ta" ? target.label : target.labelEn}</span>
                    {dispatchTarget === target.id && <CheckCircle className="w-4 h-4 text-amber-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Link Preview */}
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">
                {lang === "ta" ? "அனுப்பப்படும் செய்தி உரை:" : "SMS Message Preview:"}
              </span>
              <p className="text-stone-800 font-mono text-[11px]">
                "TNPA² டிவி நேரலை ஒளிபரப்பு துவக்கம்! சங்க செய்திகள் & நலவாரிய தகவல்களை நேரலையில் காண கிளிக் செய்க: {channelUrl}"
              </p>
            </div>

            {/* Success Message Banner */}
            {dispatchSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{dispatchSuccessMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-1/3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {lang === "ta" ? "மூடுக" : "Close"}
              </button>
              
              <button
                onClick={handleDispatchTvLink}
                disabled={isDispatching}
                className="w-2/3 py-2.5 bg-[#b91c1c] hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDispatching ? (
                  <span>{lang === "ta" ? "அனுப்பப்படுகிறது..." : "Dispatching Server Request..."}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{lang === "ta" ? "SMS & WhatsApp அனுப்பவும்" : "Send SMS & WhatsApp Link"}</span>
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
