import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Bot, HelpCircle, Loader, MessageSquare, Volume2, RefreshCw, ShieldAlert, Award } from "lucide-react";
import { UserAccount, SystemSettings } from "../types";

interface Message {
  role: "user" | "model";
  text: string;
  gesture?: "greeting" | "thinking" | "speaking" | "neutral";
}

interface WelfareAdvisorProps {
  lang: "ta" | "en";
  currentUser?: UserAccount | null;
  systemData?: {
    totalRegisteredMembers: number;
    pendingClaimsCount: number;
    approvedClaimsCount: number;
    totalSubscriptionCollections: number;
    activeDistrictsCount: number;
  };
  systemSettings?: SystemSettings;
}

export default function WelfareAdvisor({ lang, currentUser, systemData, systemSettings }: WelfareAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<"greeting" | "thinking" | "speaking" | "neutral">("greeting");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = currentUser?.role === "super_admin";

  const tamilFAQ = isSuperAdmin ? [
    "தலைமை அறிக்கை & உறுப்பினர் புள்ளிவிவரங்கள் 📊",
    "புதிய சர்குலர் / அறிவிப்பு வரைவு தயார் செய்க 📝",
    "நலத்திட்டங்கள் நிதி நிலைமை & பரிந்துரைகள் 💡",
    "சங்க கொள்கை முடிவுகள் & வழிகாட்டுதல்கள் 🏛️"
  ] : [
    "சங்கத்தின் சட்டங்கள் மற்றும் விதிகள் என்ன? 🎨",
    "பெயிண்டர்கள் நலத்திட்டங்கள் மற்றும் உதவித்தொகைகள் யாவை? 👴",
    "உறுப்பினர் சேர்க்கை மற்றும் புதுப்பித்தல் எவ்வாறு செய்வது? 📝",
    "அவசர உதவி அல்லது சங்கச் செயலாளரைத் தொடர்பு கொள்ள வழிமுறைகள்? 📞"
  ];

  const englishFAQ = isSuperAdmin ? [
    "State Membership Report & Statistics Summary 📊",
    "Draft New Announcement / Official Notice 📝",
    "Welfare Schemes Funds State & Recommendations 💡",
    "Association Core Policy Rules & Guidelines 🏛️"
  ] : [
    "What are the official TNPA bylaws and rules? 🎨",
    "What welfare schemes and benefits does TNPA offer? 👴",
    "How to register or renew my membership? 📝",
    "How to escalate queries or contact the General Secretary? 📞"
  ];

  const faqs = lang === "ta" ? tamilFAQ : englishFAQ;

  useEffect(() => {
    // Add initial greeting with folded hands animation
    let greetingText = "";
    if (isSuperAdmin) {
      greetingText = lang === "ta"
        ? "மதிப்பிற்குரிய மாநிலப் பொதுச் செயலாளர் ரா. சேவியர் பாபு அவர்களுக்கு வணக்கம்! (🙏 இரு கைகூப்பி பணிவான வணக்கம்). நான் சங்கத்தின் 'தலைமை AI' ஆலோசகர். சங்கத்தின் கொள்கை முடிவுகள், மாவட்ட நிர்வாகம், நிதிநிலை அறிக்கைகள், புதிய அறிவிப்புகள் வரைவு போன்ற உயர்நிலை மேலாண்மைப் பணிகளில் தங்களுக்கு உதவ நான் சித்தமாக உள்ளேன். எதில் தங்களுக்கு உதவட்டும்?"
        : "Respected State General Secretary R. Xavier Babu, Vanakkam! (🙏 Respectful greetings). I am your TNPA 'Talaimai AI' Advisor. I am primed to assist with executive decisions, drafting announcements, compiling member analytics, and managing state association policies. How can I serve you today, Leader?";
    } else {
      greetingText = lang === "ta"
        ? "வணக்கம் தோழரே! (😊 கை கூப்பி வணக்கம்) நான் உங்கள் தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கத்தின் (TNPA AI) உத்தியோகபூர்வ AI உதவியாளர். ஓவியர் நலவாரிய உதவித்தொகை, உறுப்பினர் சேர்க்கை, விபத்து காப்பீடு மற்றும் பெயிண்டிங் பாதுகாப்பு விதிகள் சார்ந்த எந்தவொரு கேள்விகளுக்கும் உதவ நான் கடமைப்பட்டுள்ளேன்!"
        : "Vanakkam Comrade! (🙏 Greetings with folded hands) I am your official Tamil Nadu Painters and Artists Advancement Association (TNPA AI) Assistant. I am here to help you navigate union bylaws, welfare grants, state pension forms, and painting safety measures. How may I serve you today?";
    }

    setMessages([{ role: "model", text: greetingText, gesture: "greeting" }]);
    setAvatarState("greeting");
  }, [lang, currentUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setAvatarState("thinking");

    try {
      const history = messages.slice(-6).map((msg) => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: textToSend, 
          history,
          role: currentUser?.role,
          systemData: isSuperAdmin ? systemData : undefined,
          systemSettings: systemSettings
        })
      });

      if (!res.ok) throw new Error("Connection failed");
      const data = await res.json();
      
      setMessages((prev) => [...prev, { role: "model", text: data.reply, gesture: "speaking" }]);
      setAvatarState("speaking");

      // Stay speaking for a while, then go to neutral
      setTimeout(() => {
        setAvatarState("neutral");
      }, 6000);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: lang === "ta" 
            ? "மன்னிக்கவும் தோழரே, என்னால் சேவையகத்துடன் இணைக்க முடியவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்." 
            : "Apologies, comrade. I was unable to reach the TNPA server. Please try again in a few moments.",
          gesture: "neutral"
        }
      ]);
      setAvatarState("neutral");
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    let greetingText = "";
    if (isSuperAdmin) {
      greetingText = lang === "ta"
        ? "மதிப்பிற்குரிய மாநிலப் பொதுச் செயலாளர் அவர்களுக்கு வணக்கம்! மீண்டும் ஒருமுறை தங்களை வரவேற்பதில் மகிழ்ச்சி அடைகிறேன். உங்களுக்கு நான் எவ்வாறு உதவட்டும்?"
        : "Welcome back, Respected State General Secretary! It is my absolute honor to assist you again. What executive tasks would you like to address?";
    } else {
      greetingText = lang === "ta"
        ? "வணக்கம்! (😊 கை கூப்பி வணக்கம்) மீண்டும் ஒருமுறை உங்களை வரவேற்பதில் மகிழ்ச்சி அடைகிறேன். உங்களுக்கு நான் எவ்வாறு உதவட்டும்?"
        : "Welcome back! (🙏 Greetings with folded hands) It is my pleasure to assist you again. What would you like to inquire about?";
    }
    setMessages([{ role: "model", text: greetingText, gesture: "greeting" }]);
    setAvatarState("greeting");
  };

  // Speaks aloud (Synthesizer representation / text-to-speech option)
  const handleSpeakText = (text: string) => {
    // Filter out emoji parentheticals
    const cleanText = text.replace(/\([^)]+\)/g, "").replace(/●/g, "");
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === "ta" ? "ta-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
      setAvatarState("speaking");
      utterance.onend = () => setAvatarState("neutral");
    } else {
      alert(lang === "ta" ? "உங்கள் உலாவி பேச்சு தொகுப்பை ஆதரிக்கவில்லை!" : "Your browser does not support text-to-speech.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl flex flex-col lg:flex-row h-[600px] overflow-hidden animate-[fadeIn_0.5s_ease-out] text-stone-800">
      
      {/* SIDEBAR: INTERACTIVE ANIME AVATAR CONTAINER */}
      <div className="w-full lg:w-72 bg-gradient-to-b from-stone-900 to-stone-950 p-5 flex flex-col justify-between items-center text-center text-white border-b lg:border-b-0 lg:border-r border-stone-800 shrink-0 relative overflow-hidden">
        
        {/* Abstract Background Design: TNPA Red and Gold Waves & Stars */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 rounded-full bg-[#b91c1c]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 rounded-full bg-amber-500" />
          <div className="absolute top-[40%] left-[10%] w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          <div className="absolute top-[20%] right-[15%] w-3 h-3 rounded-full bg-white animate-pulse" />
        </div>

        {/* Header Name & Flag Indicator */}
        <div className="w-full z-10 flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              {isSuperAdmin ? (lang === "ta" ? "தலைமை நிர்வாக ஆலோசகர்" : "STATE LEADERSHIP ADVISOR") : (lang === "ta" ? "TNPA உத்தியோகபூர்வ உதவியாளர்" : "TNPA OFFICIAL GUIDE")}
            </span>
          </div>
          <h3 className="font-extrabold text-sm text-stone-100 uppercase tracking-wide flex items-center gap-1.5">
            {isSuperAdmin && <Award className="w-4 h-4 text-amber-400 animate-pulse" />}
            {isSuperAdmin 
              ? (lang === "ta" ? "தலைமை AI (Super Admin)" : "TALAIMAI AI (SUPER ADMIN)")
              : (lang === "ta" ? "AI உத்தியோகபூர்வ உதவியாளர்" : "OFFICIAL TNPA AI ASSISTANT")}
          </h3>
          <span className="text-[10px] text-stone-400 font-bold">
            {isSuperAdmin 
              ? (lang === "ta" ? "மாநிலச் செயலாளர் நிர்வாகத் துணைவி" : "Executive Advisor Avatar")
              : (lang === "ta" ? "அனிம் அவதார் முகப்பு" : "Interactive Anime Avatar")}
          </span>
        </div>

        {/* INTERACTIVE ANIME AVATAR VISUALIZATION (SVG DRAWING WITH GESTURE STATE) */}
        <div className="relative w-40 h-40 my-4 z-10 flex items-center justify-center bg-stone-900/60 rounded-full border-2 border-amber-500/30 p-2 shadow-inner">
          
          {/* Circular flag emblem backdrop */}
          <div className="absolute inset-1 bg-gradient-to-tr from-[#b91c1c]/30 to-amber-500/20 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: '20s' }} />

          {/* SVG Vector Anime Avatar character */}
          <svg viewBox="0 0 120 120" className="w-36 h-36 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            {/* Background TNPA Flag Emblem Shield behind avatar */}
            <circle cx="60" cy="60" r="50" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 45,25 Q 60,18 75,25 Q 75,45 60,55 Q 45,45 45,25 Z" fill="#b91c1c" opacity="0.15" />

            {/* Hair back */}
            <path d="M 38,45 Q 28,65 35,90 Q 60,95 85,90 Q 92,65 82,45 Z" fill="#2d221e" />

            {/* Neck */}
            <rect x="54" y="68" width="12" height="12" fill="#ffd1b3" rx="2" />
            
            {/* Shoulders & Uniform Jacket (Red with Gold Accents) */}
            <path d="M 32,84 Q 45,76 60,76 Q 75,76 88,84 L 92,110 L 28,110 Z" fill="#b91c1c" />
            
            {/* Gold Lapels / Collar trim */}
            <path d="M 45,76 L 54,82 L 52,90 Z" fill="#eab308" />
            <path d="M 75,76 L 66,82 L 68,90 Z" fill="#eab308" />
            {/* Gold Tie / Center badge */}
            <polygon points="58,80 62,80 60,94" fill="#eab308" />
            {/* Gold Shoulder Epaulets */}
            <path d="M 32,84 Q 38,82 44,84" stroke="#eab308" strokeWidth="3" fill="none" />
            <path d="M 88,84 Q 82,82 76,84" stroke="#eab308" strokeWidth="3" fill="none" />

            {/* Face/Head */}
            <circle cx="60" cy="55" r="22" fill="#ffe0cc" />

            {/* Hair Front/Bangs (Anime style) */}
            <path d="M 38,45 Q 60,35 82,45 Q 80,48 74,50 Q 68,52 64,48 Q 60,55 54,50 Q 46,52 38,45 Z" fill="#3d302a" />
            
            {/* Cute Artist French Beret with Paint Brush */}
            {/* Beret Base */}
            <path d="M 38,36 Q 60,14 82,36 Z" fill="#b91c1c" />
            <ellipse cx="60" cy="35" rx="21" ry="5" fill="#991b1b" />
            {/* Beret little stem */}
            <circle cx="60" cy="22" r="3" fill="#eab308" />
            {/* Paint brush tucked into the beret */}
            <path d="M 78,35 L 90,16" stroke="#f59e0b" strokeWidth="2.5" />
            <polygon points="90,16 93,12 88,15" fill="#3b82f6" /> {/* Blue paint tip */}

            {/* Blush cheeks */}
            <ellipse cx="46" cy="60" rx="3" ry="1.5" fill="#ffa3a3" opacity="0.7" />
            <ellipse cx="74" cy="60" rx="3" ry="1.5" fill="#ffa3a3" opacity="0.7" />

            {/* ANIMATED GESTURE EXPRESSIONS BY STATE */}
            {avatarState === "greeting" && (
              <>
                {/* Bowing / Closed happy greeting eyes */}
                <path d="M 45,54 Q 50,51 52,55" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 75,54 Q 70,51 68,55" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Happy smile */}
                <path d="M 57,63 Q 60,67 63,63" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                
                {/* Folded Hands in prayer/bowing gesture (🙏 Vanakkam) at bottom of face */}
                <g className="animate-bounce" style={{ animationDuration: '2s' }}>
                  <path d="M 55,88 Q 60,80 65,88 Z" fill="#ffe0cc" stroke="#b91c1c" strokeWidth="1" />
                  <line x1="60" y1="81" x2="60" y2="88" stroke="#b91c1c" strokeWidth="1.5" />
                  <path d="M 51,84 Q 60,81 69,84" stroke="#eab308" strokeWidth="1" fill="none" />
                </g>
              </>
            )}

            {avatarState === "thinking" && (
              <>
                {/* Thoughtful curved analytical eyes (looking up-right) */}
                <ellipse cx="49" cy="54" rx="2.5" ry="3" fill="#1c1917" />
                <ellipse cx="71" cy="54" rx="2.5" ry="3" fill="#1c1917" />
                <circle cx="50" cy="53" r="0.8" fill="white" />
                <circle cx="72" cy="53" r="0.8" fill="white" />
                <path d="M 45,49 Q 50,47 52,50" stroke="#3d302a" strokeWidth="1.5" fill="none" />
                <path d="M 75,49 Q 70,46 68,49" stroke="#3d302a" strokeWidth="1.5" fill="none" />
                {/* Puzzled neutral mouth */}
                <circle cx="60" cy="62" r="1.5" fill="#1c1917" />
                
                {/* Thinking finger on chin */}
                <g className="animate-pulse">
                  <path d="M 56,66 Q 54,61 58,61 Q 61,61 59,66" fill="#ffe0cc" stroke="#3d302a" strokeWidth="0.8" />
                  {/* Thought bubbles floating above */}
                  <circle cx="82" cy="30" r="2" fill="white" opacity="0.6" className="animate-ping" />
                  <circle cx="88" cy="24" r="3.5" fill="#eab308" opacity="0.8" />
                </g>
              </>
            )}

            {avatarState === "speaking" && (
              <>
                {/* Joyful wink or wide excited anime eyes */}
                <path d="M 44,55 Q 49,51 54,54" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
                <circle cx="71" cy="54" r="3" fill="#1c1917" />
                <circle cx="72" cy="53" r="1" fill="white" />
                {/* Big happy open speaking mouth */}
                <path d="M 55,62 Q 60,70 65,62 Z" fill="#e11d48" />
                <path d="M 55,62 Q 60,70 65,62" stroke="#1c1917" strokeWidth="1" fill="none" />

                {/* Friendly waving hand */}
                <g className="animate-bounce" style={{ animationDuration: '1s' }}>
                  {/* Arm extending */}
                  <path d="M 84,82 Q 95,74 98,66" stroke="#b91c1c" strokeWidth="6" strokeLinecap="round" fill="none" />
                  {/* Palm & fingers */}
                  <circle cx="98" cy="63" r="5" fill="#ffe0cc" />
                  <path d="M 94,61 Q 92,57 95,57 Q 98,59 96,63" fill="#ffe0cc" />
                  <path d="M 98,59 Q 98,55 101,55 Q 103,57 101,61" fill="#ffe0cc" />
                </g>
              </>
            )}

            {avatarState === "neutral" && (
              <>
                {/* Classic friendly smiling anime eyes */}
                <circle cx="48" cy="54" r="2.5" fill="#1c1917" />
                <circle cx="72" cy="54" r="2.5" fill="#1c1917" />
                <circle cx="49" cy="53" r="0.8" fill="white" />
                <circle cx="73" cy="53" r="0.8" fill="white" />
                <path d="M 44,49 Q 48,47 51,49" stroke="#3d302a" strokeWidth="1.5" fill="none" />
                <path d="M 76,49 Q 72,47 69,49" stroke="#3d302a" strokeWidth="1.5" fill="none" />
                {/* Gentle happy line smile */}
                <path d="M 56,62 Q 60,65 64,62" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </>
            )}
          </svg>
        </div>

        {/* Gestures Text Bubble */}
        <div className="bg-stone-850 p-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-300 w-full z-10">
          <span className="text-amber-400 font-extrabold block mb-0.5">
            {avatarState === "greeting" && "😊 கை கூப்பி வணக்கம்!"}
            {avatarState === "thinking" && "🤔 பதில் யோசிக்கிறேன்..."}
            {avatarState === "speaking" && "😀 இயல்பாக பேசி விளக்குகிறேன்!"}
            {avatarState === "neutral" && "🤝 உங்களோடு உரையாடுகிறேன்!"}
          </span>
          <p className="text-[10px] text-stone-400 leading-normal font-medium">
            {lang === "ta" 
              ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கத்திற்கான பிரத்யேக AI ஆலோசகர்" 
              : "Dedicated AI Companion for the TNPA Painters & Artists Association"}
          </p>
        </div>

        {/* Reset Chat button */}
        <button
          onClick={handleResetChat}
          className="mt-3 w-full py-1.5 bg-[#b91c1c] hover:bg-red-800 text-stone-100 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all uppercase tracking-wider z-10"
        >
          <RefreshCw className="w-3 h-3 text-amber-400 animate-spin-slow" />
          <span>{lang === "ta" ? "உரையாடலை மீட்டமை" : "Reset Conversation"}</span>
        </button>

      </div>

      {/* CHAT MODULE CONTAINER */}
      <div className="flex-1 flex flex-col h-full bg-white">
        
        {/* Chat Header Banner */}
        <div className="px-5 py-4 bg-gradient-to-r from-stone-900 to-[#b91c1c] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-500 flex items-center justify-center border-2 border-white shadow-md shrink-0">
              <Bot className="w-5 h-5 text-stone-950" />
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-xs tracking-wider uppercase text-amber-400">
                {lang === "ta" ? "ஓவியர் சங்க AI உதவியாளர் (TNPA AI)" : "TNPA PAINTERS & ARTISTS AI COMPANION"}
              </h4>
              <span className="text-[9px] text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span>{lang === "ta" ? "செயலில் உள்ளது | நலவாரியம் & தொழில் வழிகாட்டி" : "ONLINE | WELFARE BOARD & SAFETY GUIDE"}</span>
              </span>
            </div>
          </div>
          
          <div className="bg-stone-800 text-stone-300 rounded-full p-1 border border-stone-700">
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {/* Messages Scrolling Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-50/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              {/* Message Avatar Icon */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                  msg.role === "user" 
                    ? "bg-stone-950 text-amber-400 border-stone-800" 
                    : "bg-[#b91c1c] text-white border-[#b91c1c]"
                }`}
              >
                {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Content Bubble */}
              <div className="flex flex-col text-left">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-stone-950 text-white rounded-tr-none shadow-sm"
                      : "bg-white text-stone-900 rounded-tl-none border border-stone-200/80 shadow-sm"
                  }`}
                >
                  <div 
                    className="prose prose-sm max-w-none text-left"
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, "<br/>") }}
                  />
                </div>
                
                {/* Audio voice synthesizer clicker (exclusive for Bot messages) */}
                {msg.role === "model" && (
                  <button
                    onClick={() => handleSpeakText(msg.text)}
                    className="mt-1 self-start flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-[#b91c1c] hover:bg-red-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-red-100"
                  >
                    <Volume2 className="w-3 h-3 text-[#b91c1c]" />
                    <span>{lang === "ta" ? "ஒலி வடிவில் கேள்" : "Listen Response"}</span>
                  </button>
                )}
              </div>

            </div>
          ))}

          {/* Thinking Loading spinner */}
          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="h-8 w-8 rounded-full bg-[#b91c1c] text-white flex items-center justify-center shrink-0 shadow-sm border border-red-500">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3.5 bg-white border border-stone-200 rounded-2xl rounded-tl-none text-xs text-stone-500 flex items-center gap-2.5 shadow-sm">
                <Loader className="w-4 h-4 animate-spin text-[#b91c1c]" />
                <span className="font-bold text-stone-700 animate-pulse">
                  {lang === "ta" ? "காவல் சட்டம் & விதிகளை ஆய்வு செய்கிறேன்..." : "Consulting police regulations..."}
                </span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* INPUT AND SUGGESTED FAQS FOR RAPID DISCOVERY */}
        <div className="p-4 border-t border-stone-200 bg-white shrink-0">
          
          {/* Quick FAQ Suggestion Bar */}
          <div className="mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#b91c1c] block mb-1.5 text-left flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "பரிந்துரைக்கப்பட்ட கேள்விகள் (FAQs):" : "RECOMMENDED INQUIRIES:"}</span>
            </span>
            <div className="flex flex-wrap gap-1.5 justify-start">
              {faqs.map((faq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(faq)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-stone-50 hover:bg-amber-50/50 hover:border-amber-400 border border-stone-200 text-stone-700 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer disabled:opacity-50"
                >
                  {faq}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Form submission */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={
                lang === "ta" 
                  ? "கேள்வியைக் கேளுங்கள் (எ.கா: காவலர் ஓய்வூதியம், சங்கம் விதிகள்)..." 
                  : "Enter inquiry (e.g., medical claims, TNPA bylaws)..."
              }
              className="flex-1 px-4 py-3 border border-stone-200 rounded-2xl text-xs bg-stone-50/40 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-[#b91c1c] hover:bg-red-800 text-white rounded-2xl active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:bg-stone-200 disabled:text-stone-400 disabled:scale-100 shadow-md hover:shadow-lg"
            >
              <Send className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
