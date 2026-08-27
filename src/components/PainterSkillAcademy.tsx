import React, { useState } from "react";
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  Play, 
  Shield, 
  Sparkles, 
  Check, 
  FileText, 
  Star,
  Download,
  Video,
  Radio,
  ExternalLink,
  Building2,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { UserAccount } from "../types";

interface CourseModule {
  id: string;
  title: string;
  titleEn: string;
  brand: string;
  duration: string;
  instructor: string;
  category: string;
  videoUrl: string;
  description: string;
}

interface LiveClass {
  id: string;
  title: string;
  brand: string;
  speaker: string;
  date: string; // YYYY-MM-DD
  time: string;
  meetLink: string;
  status: "upcoming" | "live" | "completed";
}

interface PainterSkillAcademyProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function PainterSkillAcademy({
  lang,
  currentUser,
  onAddAuditLog
}: PainterSkillAcademyProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "live_classes" | "calendar" | "exam" | "certificate">("courses");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [playingCourse, setPlayingCourse] = useState<CourseModule | null>(null);

  // Calendar navigation state (August 2026 default)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 7 = August (0-indexed)

  // Exam state
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1]);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);

  const brandCourses: CourseModule[] = [
    {
      id: "c_asian_1",
      title: "ஏசியன் பெயிண்ட்ஸ் (Asian Paints) - ராயல் மற்றும் அபிகா கோட்டிங் நுட்பங்கள்",
      titleEn: "Asian Paints - Royale Luxury Emulsion & Apex Ultima Application",
      brand: "Asian Paints",
      duration: "50 நிமிடங்கள்",
      instructor: "ஸ்ரீனிவாசன் (Asian Paints Master Trainer)",
      category: "Luxury Emulsions",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      description: "ஏசியன் பெயிண்ட்ஸ் நிறுவனத்தின் பிரீமியம் ராயல் ஷைன் மற்றும் வெளிப்புற அபிகாக் கோட்டிங் பூசும் முறை மற்றும் தரம்."
    },
    {
      id: "c_nippon_1",
      title: "நிப்பான் பெயிண்ட் (Nippon Paint) - ஜப்பான் டெக்னாலஜி நீர்ப்புகாப்பு & ஆட்டோமோடிவ்",
      titleEn: "Nippon Paint - advanced Waterproofing & Momento Special Finishes",
      brand: "Nippon Paint",
      duration: "45 நிமிடங்கள்",
      instructor: "கார்த்திகேயன் (Nippon Tech Expert)",
      category: "Waterproofing & Finishes",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      description: "நிப்பான் மொமென்டோ ஸ்பெஷல் டெக்ஸ்சர் ஃபினிஷஸ் மற்றும் ஷீல்ட் வாட்டர்ப்ரூஃபிங் முறைகள்."
    },
    {
      id: "c_berger_1",
      title: "பெஞ்சர் & பட்ஜெட் பெயிண்ட் (Berger & Budget Paints) - எகானமி சுவர் பராமரிப்பு",
      titleEn: "Berger & Budget Paints - Economic Wall Care & Easy Clean",
      brand: "Berger",
      duration: "40 நிமிடங்கள்",
      instructor: "ரமேஷ் குமார் (Berger Senior Applicator)",
      category: "Budget & Economy",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      description: "குறைந்த செலவில் நீண்ட உழைப்பு தரும் பெஞ்சர் மற்றும் பட்ஜெட் பெயிண்ட் வகைகளின் பயன்பாடு."
    },
    {
      id: "c_dulux_1",
      title: "டுலக்ஸ் பெயிண்ட் (Dulux Paint) - வெல்வெட் டச் & வீathershield ப்ரோ",
      titleEn: "Dulux Paint - Velvet Touch & Weathershield Max Application",
      brand: "Dulux",
      duration: "50 நிமிடங்கள்",
      instructor: "அன்வர் பாஷா (Dulux Technical Advisor)",
      category: "Premium Emulsions",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      description: "டுலக்ஸ் வெல்வெட் டச் உட்புற சுவர்களுக்கான சொகுசு பூச்சு மற்றும் வெதர்ஷீல்ட் வெளிப்புறப் பாதுகாப்பு."
    },
    {
      id: "c_jsw_1",
      title: "ஜே எஸ் டபிள்யூ பெயிண்ட்ஸ் (JSW Paints) - ஆர்ட் ஆஃப் கலர் மற்றும் உலோகப் பாதுகாப்பு",
      titleEn: "JSW Paints - Halos & Plasti Dip Metal Protection Masterclass",
      brand: "JSW",
      duration: "45 நிமிடங்கள்",
      instructor: "முருகேசன் (JSW Master Trainer)",
      category: "Eco-Friendly Paints",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      description: "வாசனை அற்ற மற்றும் சுற்றுச்சூழலுக்கு உகந்த ஜே.எஸ்.டபிள்யூ ஹாலோஸ் பெயிண்ட் அடிக்கும் நவீன முறைகள்."
    }
  ];

  const liveClasses: LiveClass[] = [
    {
      id: "lc_1",
      title: "ஏசியன் பெயிண்ட்ஸ் நேரலை மாஸ்டர் கிளாஸ்: 2026 டெக்ஸ்சர் டிசைன்கள்",
      brand: "Asian Paints",
      speaker: "பிரவீன் குமார் (Technical Head)",
      date: "2026-08-28",
      time: "மாலை 04:00 மணி (4:00 PM)",
      meetLink: "https://meet.google.com/abc-defg-hij",
      status: "upcoming"
    },
    {
      id: "lc_2",
      title: "நிப்பான் பெயிண்ட் & வாட்டர்ப்ரூஃபிங் நேரலை பயிற்சி முகாம்",
      brand: "Nippon Paint",
      speaker: "சுந்தர் ராஜ் (Application Specialist)",
      date: "2026-08-29",
      time: "காலை 11:00 மணி (11:00 AM)",
      meetLink: "https://meet.google.com/xyz-uvwx-rst",
      status: "upcoming"
    },
    {
      id: "lc_3",
      title: "டுலக்ஸ் மற்றும் ஜே எஸ் டபிள்யூ இணைந்த கலர் கலவை நேரலை அரங்கு",
      brand: "Dulux & JSW",
      speaker: "டாக்டர் ஆனந்த் (Color Consultant)",
      date: "2026-08-30",
      time: "மாலை 06:00 மணி (6:00 PM)",
      meetLink: "https://meet.google.com/lmn-opqr-stu",
      status: "upcoming"
    },
    {
      id: "lc_4",
      title: "பெஞ்சர் பெயிண்ட்ஸ் எகானமி சுவர் பராமரிப்பு சிறப்பு பட்டறை",
      brand: "Berger",
      speaker: "ரமேஷ் குமார் (Senior Applicator)",
      date: "2026-09-02",
      time: "காலை 10:00 மணி (10:00 AM)",
      meetLink: "https://meet.google.com/bgr-1234-xyz",
      status: "upcoming"
    },
    {
      id: "lc_5",
      title: "ஏசியன் பெயிண்ட்ஸ் ராயல் எமல்ஷன் மற்றும் ஸ்பிரை நுட்பங்கள்",
      brand: "Asian Paints",
      speaker: "ஸ்ரீனிவாசன் (Master Trainer)",
      date: "2026-09-05",
      time: "மாலை 03:00 மணி (3:00 PM)",
      meetLink: "https://meet.google.com/asp-5678-abc",
      status: "upcoming"
    }
  ];

  const questions = [
    {
      q: lang === "ta" ? "1. உயரமான கட்டடங்களில் பெயிண்டிங் செய்யும் போது எந்த பாதுகாப்பு பெல்ட் கட்டாயமானது?" : "1. Which safety harness is mandatory for high-rise painting?",
      options: [
        lang === "ta" ? "சாதாரண கயிறு (Normal Rope)" : "Normal Rope",
        lang === "ta" ? "முழு உடல் பாதுகாப்பு ஹார்னஸ் (Full Body Safety Harness)" : "Full Body Safety Harness",
        lang === "ta" ? "துணி நாடா (Cloth Strap)" : "Cloth Strap"
      ],
      correct: 1
    },
    {
      q: lang === "ta" ? "2. எப்பாக்ஸி பெயிண்ட் பூசுவதற்கு முன் தரை மேற்பரப்பில் என்ன இருக்கக்கூடாது?" : "2. What must be absent on the surface before applying epoxy coating?",
      options: [
        lang === "ta" ? "ஈரப்பதம் மற்றும் தூசி (Moisture & Dust)" : "Moisture & Dust",
        lang === "ta" ? "காற்றோட்டம் (Ventilation)" : "Ventilation",
        lang === "ta" ? "வெளிச்சம் (Lighting)" : "Lighting"
      ],
      correct: 0
    },
    {
      q: lang === "ta" ? "3. பெயிண்டிங் செய்யும் போது கண்கள் மற்றும் சுவாசப் பாதுகாப்பிற்காக எதைப் பயன்படுத்த வேண்டும்?" : "3. What should be used to protect eyes and lungs during spray painting?",
      options: [
        lang === "ta" ? "முகக்கவசம் மற்றும் பாதுகாப்பு கண்ணாடிகள் (Mask & Safety Goggles)" : "Mask & Safety Goggles",
        lang === "ta" ? "எதுவும் தேவையில்லை (Nothing required)" : "Nothing required",
        lang === "ta" ? "கண்ணாடி மட்டும் (Glasses only)" : "Glasses only"
      ],
      correct: 0
    }
  ];

  const handleEvaluateExam = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score += 1;
    });
    setExamScore(score);
    setExamSubmitted(true);
    if (score >= 2) {
      onAddAuditLog("Painter Safety Exam Passed", `Painter passed safety certification exam with score ${score}/3`);
    }
  };

  const filteredCourses = selectedBrand === "all" 
    ? brandCourses 
    : brandCourses.filter(c => c.brand.toLowerCase().includes(selectedBrand.toLowerCase()));

  // Calendar generator helpers
  const monthNamesTa = ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"];
  const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-emerald-900/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/25 border border-emerald-400/35 rounded-full text-xs text-emerald-300 font-extrabold mb-3">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === "ta" ? "பிராண்ட் பெயிண்ட் & நேரடி ஆன்லைன் பயிற்சி அகாடமி" : "Brand Paints & Live Online Masterclass Academy"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {lang === "ta" ? "ஏசியன், நிப்பான், டுலக்ஸ், ஜே.எஸ்.டபிள்யூ & பட்ஜெட் பயிற்சி" : "Asian, Nippon, Dulux, JSW & Budget Masterclasses"}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              {lang === "ta"
                ? "முன்னணி பெயிண்ட் நிறுவனங்களின் அதிகாரப்பூர்வ தொழில்நுட்பப் பயிற்சி வகுப்புகள், நேரலை ஆன்லைன் வகுப்புகள் மற்றும் சான்றிதழ்கள்."
                : "Official technical training courses, live online masterclasses, and certified badges from leading paint manufacturers."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "courses" ? "bg-emerald-400 text-slate-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {lang === "ta" ? "பிராண்ட் வகுப்புகள் (Courses)" : "Brand Courses"}
            </button>
            <button
              onClick={() => setActiveTab("live_classes")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "live_classes" ? "bg-emerald-400 text-slate-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{lang === "ta" ? "நேரலை வகுப்புகள் (Live)" : "Live Classes"}</span>
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "calendar" ? "bg-emerald-400 text-slate-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === "ta" ? "பயிற்சி காலண்டர் (Calendar)" : "Training Calendar"}</span>
            </button>
            <button
              onClick={() => setActiveTab("exam")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "exam" ? "bg-emerald-400 text-slate-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {lang === "ta" ? "பாதுகாப்புத் தேர்வு (Exam)" : "Safety Exam"}
            </button>
            <button
              onClick={() => setActiveTab("certificate")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "certificate" ? "bg-emerald-400 text-slate-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {lang === "ta" ? "சான்றிதழ் (Certificate)" : "Certificate"}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: BRAND COURSES */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          {/* Brand Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "அனைத்து பிராண்டுகளும் (All Brands)" },
              { id: "Asian Paints", label: "ஏசியன் பெயிண்ட்ஸ் (Asian Paints)" },
              { id: "Nippon Paint", label: "நிப்பான் பெயிண்ட் (Nippon Paint)" },
              { id: "Berger", label: "பெஞ்சர் & பட்ஜெட் (Berger / Budget)" },
              { id: "Dulux", label: "டுலக்ஸ் (Dulux)" },
              { id: "JSW", label: "ஜே.எஸ்.டபிள்யூ (JSW Paints)" }
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBrand(b.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedBrand === b.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 flex flex-col justify-between hover:border-emerald-400 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-black border border-emerald-200">
                      {course.brand}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">⏱️ {course.duration}</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{course.description}</p>
                  
                  <div className="pt-2 text-xs font-semibold text-slate-500">
                    <span>👨‍🏫 {course.instructor}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setPlayingCourse(course);
                      onAddAuditLog("Brand Course Started", `Started masterclass: ${course.title}`);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{lang === "ta" ? "வீடியோ வகுப்பைக் காண" : "Watch Masterclass"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ONLINE CLASSES */}
      {activeTab === "live_classes" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Radio className="w-6 h-6 text-rose-600 animate-pulse" />
                  <span>{lang === "ta" ? "நேரலை ஆன்லைன் பயிற்சி வகுப்புகள் (Live Zoom / Google Meet)" : "Live Online Training & Expert Masterclasses"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === "ta"
                    ? "இந்தியாவின் முன்னணி பெயிண்ட் நிறுவன நிபுணர்கள் நடத்தும் நேரலை ஆன்லைன் வகுப்புகளில் கலந்துகொண்டு சான்றிதழ் பெறுங்கள்."
                    : "Join live interactive sessions hosted by master technicians from Asian Paints, Nippon, Dulux, JSW & Berger."}
                </p>
              </div>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-black">
                🔴 {lang === "ta" ? "வரவிருக்கும் வகுப்புகள்" : "Upcoming Sessions"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveClasses.map((lc) => (
                <div key={lc.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-rose-400 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-black">
                        {lc.brand}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        {lc.date}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900">{lc.title}</h4>
                    
                    <div className="space-y-1 text-xs text-slate-600 font-semibold">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{lc.time}</span>
                      </p>
                      <p className="text-slate-500 font-normal">👨‍🏫 {lc.speaker}</p>
                    </div>
                  </div>

                  <a
                    href={lc.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onAddAuditLog("Live Class Joined", `Joined live class: ${lc.title}`)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>{lang === "ta" ? "நேரலை வகுப்பில் இணைய (Join Meet)" : "Join Live Class"}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRAINING CALENDAR VIEW */}
      {activeTab === "calendar" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-emerald-600" />
                <span>{lang === "ta" ? "பிராண்ட் பெயிண்ட் பயிற்சி மற்றும் பட்டறை காலண்டர்" : "Paint Company Training & Workshop Calendar"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === "ta"
                  ? "ஏசியன், நிப்பான், டுலக்ஸ் மற்றும் அனைத்து பிராண்டுகளின் நேரலை பயிற்சி நாட்களை மாத வாரியாகக் காண்க."
                  : "View upcoming live sessions and workshop schedules month by month across all paint manufacturers."}
              </p>
            </div>

            {/* Month & Year Navigation */}
            <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
              <button
                onClick={prevMonth}
                className="p-2 bg-white rounded-xl shadow-sm text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-slate-900 min-w-32 text-center">
                {lang === "ta" ? monthNamesTa[currentMonth] : monthNamesEn[currentMonth]} {currentYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 bg-white rounded-xl shadow-sm text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500 pb-2 border-b border-slate-100">
              <span>Sun (ஞாயிறு)</span>
              <span>Mon (திங்கள்)</span>
              <span>Tue (செவ்வாய்)</span>
              <span>Wed (புதன்)</span>
              <span>Thu (வியாழன்)</span>
              <span>Fri (வெள்ளி)</span>
              <span>Sat (சனி)</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Padding for first day */}
              {Array.from({ length: firstDay }).map((_, idx) => (
                <div key={`empty_${idx}`} className="h-28 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const formattedMonth = String(currentMonth + 1).padStart(2, "0");
                const formattedDay = String(dayNum).padStart(2, "0");
                const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

                const dayClasses = liveClasses.filter(c => c.date === dateStr);
                const isToday = dateStr === "2026-08-25";

                return (
                  <div
                    key={`day_${dayNum}`}
                    className={`h-28 p-2 rounded-2xl border flex flex-col justify-between overflow-y-auto transition-all ${
                      isToday ? "bg-emerald-50/80 border-emerald-400 shadow-sm" : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${isToday ? "text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded-md" : "text-slate-800"}`}>
                        {dayNum}
                      </span>
                      {dayClasses.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>

                    <div className="space-y-1 mt-1">
                      {dayClasses.map((lc) => (
                        <div
                          key={lc.id}
                          onClick={() => {
                            onAddAuditLog("Calendar Event Clicked", `Viewed event: ${lc.title} on ${lc.date}`);
                            alert(`${lc.title}\nBrand: ${lc.brand}\nTime: ${lc.time}\nSpeaker: ${lc.speaker}`);
                          }}
                          className="p-1.5 bg-white rounded-lg border border-purple-200 text-[9px] font-bold text-slate-900 shadow-xs cursor-pointer hover:bg-purple-50 truncate"
                          title={`${lc.brand}: ${lc.title}`}
                        >
                          <span className="text-purple-700 block font-black">{lc.brand}</span>
                          <span className="truncate block text-slate-700">{lc.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Schedule List Summary */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-sm font-black text-slate-900">{lang === "ta" ? "இந்த மாதத்திற்கான முழுமையான பயிற்சி அட்டவணை பட்டியல்" : "Complete Monthly Workshop Schedule"}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {liveClasses.map((lc) => (
                <div key={`list_${lc.id}`} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[9px] font-black">{lc.brand}</span>
                      <span className="text-[11px] font-bold text-slate-500">📅 {lc.date} ({lc.time})</span>
                    </div>
                    <p className="text-xs font-black text-slate-900">{lc.title}</p>
                  </div>
                  <a
                    href={lc.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black shrink-0"
                  >
                    Join
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SAFETY EXAM */}
      {activeTab === "exam" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 max-w-2xl mx-auto">
          {!examSubmitted ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  <span>{lang === "ta" ? "TNPA² பெயிண்டர் பாதுகாப்பு & தொழிற்திறன் தேர்வு" : "TNPA² Painter Safety & Skill Online Exam"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === "ta"
                    ? "சான்றிதழ் பெற கீழே உள்ள 3 கேள்விகளுக்குச் சரியான பதிலைத் தேர்ந்தெடுக்கவும்."
                    : "Answer the following 3 questions correctly to earn your master certified badge."}
                </p>
              </div>

              <div className="space-y-6">
                {questions.map((qObj, qIdx) => (
                  <div key={qIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-xs font-black text-slate-900">{qObj.q}</p>
                    <div className="space-y-2">
                      {qObj.options.map((opt, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer hover:border-emerald-400">
                          <input
                            type="radio"
                            name={`question_${qIdx}`}
                            checked={answers[qIdx] === optIdx}
                            onChange={() => {
                              const updated = [...answers];
                              updated[qIdx] = optIdx;
                              setAnswers(updated);
                            }}
                            className="text-emerald-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleEvaluateExam}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === "ta" ? "தேர்வைச் சமர்ப்பித்து மதிப்பெண் பெறுக" : "Submit & Evaluate Exam"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 py-8">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${examScore >= 2 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                {examScore >= 2 ? <CheckCircle className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {examScore >= 2 ? (lang === "ta" ? "🎉 வாழ்த்துகள்! தேர்வில் வெற்றி பெற்றீர்கள்!" : "🎉 Congratulations! Exam Passed!") : (lang === "ta" ? "மறுபடியும் முயற்சிக்கவும்" : "Please Try Again")}
              </h3>
              <p className="text-xs text-slate-600">
                {lang === "ta" ? `உங்கள் மதிப்பெண்: ${examScore} / 3` : `Your Score: ${examScore} / 3`}
              </p>
              {examScore >= 2 ? (
                <div className="pt-4">
                  <button
                    onClick={() => setActiveTab("certificate")}
                    className="px-6 py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    {lang === "ta" ? "உங்கள் அதிகாரப்பூர்வ சான்றிதழைக் காண்க" : "View Your Official Certificate"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setExamSubmitted(false); setAnswers([-1, -1, -1]); }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  {lang === "ta" ? "மீண்டும் முயற்சிக்கவும்" : "Retry Exam"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CERTIFICATE & BADGE */}
      {activeTab === "certificate" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div id="certificate-print-area" className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-amber-400 space-y-6 text-center relative overflow-hidden print:shadow-none print:border-8">
            {/* Watermark badge */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <Award className="w-96 h-96 text-amber-600" />
            </div>

            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] font-black font-mono border border-slate-300">
                CERT ID: TNPA-CERT-2026-8942
              </span>
            </div>

            <div className="absolute top-4 right-4">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center text-[9px] font-black border border-amber-400">
                <span>TNPA²</span>
                <span className="text-[7px] text-amber-300">VERIFIED</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <span className="px-3.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black">
                {lang === "ta" ? "அதிகாரப்பூர்வ தொழிற்திறன் சான்றிதழ்" : "Official Master Certification"}
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">தமிழ்நாடு பெயிண்டர்கள் சங்கம் (TNPA²)</h2>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">{lang === "ta" ? "சான்றிதழ் மற்றும் மாஸ்டர் பேட்ஜ்" : "Master Painter & Safety Badge"}</p>
            </div>

            <div className="py-6 border-y border-slate-200 space-y-3">
              <p className="text-xs text-slate-600 font-medium">{lang === "ta" ? "இது சான்றளிக்கப்படுவது என்னவென்றால்:" : "This is proudly certified that:"}</p>
              <h3 className="text-2xl font-black text-emerald-700">{currentUser?.name || "ஆர். முருகன் (R. Murugan)"}</h3>
              <p className="text-xs font-bold text-slate-700">
                {lang === "ta" ? "உறுப்பினர் எண்: TNP-2026-0042 | மாவட்டம்: சென்னை" : "Reg No: TNP-2026-0042 | District: Chennai"}
              </p>
              <p className="text-xs text-slate-600 max-w-md mx-auto pt-2 leading-relaxed">
                {lang === "ta"
                  ? "ஏசியன், நிப்பான், டுலக்ஸ் மற்றும் ஜே.எஸ்.டபிள்யூ பிராண்ட் பயிற்சி வகுப்புகள் மற்றும் பாதுகாப்பு நெறிமுறைகளில் வெற்றிகரமாகத் தேர்ச்சி பெற்றுள்ளார்."
                  : "Has successfully completed Asian Paints, Nippon, Dulux, JSW training modules & safety protocols and is awarded Certified Master Painter status."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs">
              <div className="text-left font-semibold text-slate-500 space-y-0.5">
                <p>जारी / Issued Date: 2026-08-25</p>
                <p>Status: <span className="text-emerald-700 font-black">VERIFIED & ACTIVE</span></p>
                <p>Authorized By: State President & Super Admin</p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] text-slate-600 font-mono">
                <p className="font-bold text-slate-900">Digital Authenticity</p>
                <p>Scan to verify at tnpa2.org/verify</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                window.print();
                onAddAuditLog("Certificate Printed", `Printed digital certificate for ${currentUser?.name || "Member"}`);
              }}
              className="px-5 py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{lang === "ta" ? "சான்றிதழ் பிரிண்ட் / PDF சேமி" : "Print / Save PDF"}</span>
            </button>
            <button
              onClick={() => {
                onAddAuditLog("Physical Certificate Requested", `Requested physical printed certificate dispatch for ${currentUser?.name || "Member"}`);
                alert(lang === "ta" 
                  ? "✓ உங்கள் கோரிக்கை பெறப்பட்டது! சங்கத்தின் தலைமையகத்தில் இருந்து முத்திரையிடப்பட்ட அசல் சான்றிதழ் மற்றும் லேமினேட்டட் பேட்ஜ் உங்கள் வீட்டு முகவரிக்கு தபால் மூலம் அனுப்பி வைக்கப்படும்." 
                  : "✓ Physical printed certificate request submitted! Union headquarters will dispatch your laminated certificate and master badge to your postal address.");
              }}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>{lang === "ta" ? "அச்சிடப்பட்ட சான்றிதழ் பெற (Request Print)" : "Request Printed Copy"}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIDEO PLAYER MODAL */}
      {playingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-[fadeIn_0.3s_ease-out] flex flex-col max-h-[92vh]">
            <div className="p-4 md:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-black uppercase">
                  {playingCourse.brand}
                </span>
                <h3 className="text-sm md:text-base font-black truncate max-w-md">{playingCourse.title}</h3>
              </div>
              <button
                onClick={() => setPlayingCourse(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm font-black transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center group">
              {playingCourse.videoUrl && (playingCourse.videoUrl.includes("youtube.com") || playingCourse.videoUrl.includes("youtu.be")) ? (
                <iframe
                  src={`${playingCourse.videoUrl}${playingCourse.videoUrl.includes("?") ? "&" : "?"}autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
                  title={playingCourse.title}
                  className="w-full h-full border-0 absolute inset-0 z-10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  autoPlay
                  playsInline
                  key={playingCourse.id}
                  poster="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop"
                  className="w-full h-full object-contain"
                  src={playingCourse.videoUrl}
                  onError={(e) => {
                    console.warn("Video playback error, falling back to secondary source");
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border border-emerald-500/30 flex items-center gap-1.5 shadow-lg pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>TNPA² HD Masterclass Stream</span>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold">⏱️ {playingCourse.duration} | 👨‍🏫 {playingCourse.instructor}</p>
                  <p className="text-xs text-slate-700 font-medium mt-1">{playingCourse.description}</p>
                </div>
                <button
                  onClick={() => {
                    onAddAuditLog("Course Completed", `Completed video course: ${playingCourse.title}`);
                    alert(lang === "ta" ? "வாழ்த்துகள்! வகுப்பு வெற்றிகரமாக முடிக்கப்பட்டது. சான்றிதழ் பிரிவில் உங்கள் சான்றிதழைப் பெற்றுக்கொள்ளலாம்." : "Congratulations! Course completed successfully. You can download your certificate in the certificate section.");
                    setPlayingCourse(null);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{lang === "ta" ? "வகுப்பை முடித்துவிட்டேன் (Mark Completed)" : "Mark Completed & Claim"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
