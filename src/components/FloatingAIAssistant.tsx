import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  HelpCircle, 
  Loader, 
  MessageSquare, 
  Volume2, 
  VolumeX,
  Mic, 
  MicOff,
  RefreshCw, 
  ShieldAlert, 
  Award, 
  ChevronDown, 
  Paintbrush, 
  Maximize2 
} from "lucide-react";
import { UserAccount, SystemSettings } from "../types";

interface Message {
  role: "user" | "model";
  text: string;
  gesture?: "greeting" | "thinking" | "speaking" | "neutral" | "happy";
}

interface FloatingAIAssistantProps {
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

export default function FloatingAIAssistant({ lang, currentUser, systemData, systemSettings }: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [avatarState, setAvatarState] = useState<"greeting" | "thinking" | "speaking" | "neutral" | "happy">("greeting");
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isSuperAdmin = currentUser?.role === "super_admin";

  const tamilFAQ = isSuperAdmin ? [
    "தலைமை உறுப்பினர் புள்ளிவிவரங்கள் 📊",
    "புதிய சங்க அறிவிப்பு வரைவு செய்க 📝",
    "பரிந்துரைக்கப்பட்ட நலத்திட்டங்கள் 💡",
    "சங்க கொள்கை விதிகள் 🏛️"
  ] : [
    "சங்க வரலாறு & நோக்கம் 🎨",
    "உறுப்பினர் ஓய்வூதியத் திட்டம் 👴",
    "விபத்து மரண நிதியுதவி எவ்வளவு? 🏥",
    "பெயிண்டிங் பாதுகாப்பு வழிமுறைகள் 🥽"
  ];

  const englishFAQ = isSuperAdmin ? [
    "Membership Analytics & Summary 📊",
    "Draft Official Circular 📝",
    "Welfare Fund Allocations 💡",
    "Core Policy & Guidelines 🏛️"
  ] : [
    "Union History & Vision 🎨",
    "Member Pension Scheme 👴",
    "Accident Assistance Fund 🏥",
    "Painting Safety Guidelines 🥽"
  ];

  const faqs = lang === "ta" ? tamilFAQ : englishFAQ;

  useEffect(() => {
    let greetingText = "";
    if (isSuperAdmin) {
      greetingText = lang === "ta"
        ? "மதிப்பிற்குரிய மாநிலப் பொதுச் செயலாளர் ரா. சேவியர் பாபு அவர்களுக்கு வணக்கம்! (🙏 இரு கைகூப்பி பணிவான வணக்கம்). நான் சங்கத்தின் 'தலைமை AI' ஆலோசகர். சபை மேலாண்மை, புதிய சங்க வரைவுகள் மற்றும் உறுப்பினர் அறிக்கைகளை தயாரிக்க நான் சித்தமாக உள்ளேன். எதில் உதவ வேண்டும்?"
        : "Respected State General Secretary R. Xavier Babu, Vanakkam! (🙏 Warm respectful greetings). I am your TNPA 'Talaimai AI' Advisor. Prepared to draft executive files, compile membership charts, or review state level funds. How shall I assist today, Leader?";
    } else {
      greetingText = lang === "ta"
        ? "வணக்கம் தோழரே! (😊 கை கூப்பி வணக்கம்) நான் தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கத்தின் (TNPA AI) உத்தியோகபூர்வ அனிம் உதவியாளர். உறுப்பினர் சேர்க்கை, நலவாரிய நிதியுதவி மற்றும் பெயிண்டிங் பாதுகாப்பு விதிகள் போன்ற அனைத்து சந்தேகங்களுக்கும் உதவ நான் கடமைப்பட்டுள்ளேன்!"
        : "Vanakkam Comrade! (🙏 Greetings with folded hands) I am your official TNPA AI Assistant. I can help you with union enrollment, Construction Welfare Board pension, accident insurance claims, and painting safety gear guidelines. Ask me anything!";
    }

    setMessages([{ role: "model", text: greetingText, gesture: "greeting" }]);
    setAvatarState("greeting");
  }, [lang, currentUser]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isOpen]);

  // Handle Speech Recognition (Microphone feature)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === "ta" ? "ta-IN" : "en-IN";

      rec.onstart = () => {
        setIsListening(true);
        setAvatarState("thinking");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
        setAvatarState("neutral");
      };

      rec.onend = () => {
        setIsListening(false);
        setAvatarState("neutral");
      };

      recognitionRef.current = rec;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(lang === "ta" 
        ? "உங்கள் உலாவியில் குரல் அறிதல் அம்சம் ஆதரிக்கப்படவில்லை. தயவுசெய்து Chrome உலாவியைப் பயன்படுத்தவும்." 
        : "Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSpeakText = (text: string) => {
    if (!isSpeakingEnabled) return;
    const cleanText = text.replace(/\([^)]+\)/g, "").replace(/●/g, "");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === "ta" ? "ta-IN" : "en-IN";
      utterance.rate = 1.05; // Perfect natural pacing
      
      setAvatarState("speaking");
      window.speechSynthesis.speak(utterance);
      
      utterance.onend = () => {
        setAvatarState("neutral");
      };
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    setAvatarState("thinking");

    const history = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const res = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          history,
          role: currentUser?.role,
          systemData: isSuperAdmin ? systemData : undefined,
          systemSettings: systemSettings
        })
      });

      if (!res.ok) throw new Error("Connection error");
      const data = await res.json();
      
      const responseText = data.reply || "";
      setMessages((prev) => [...prev, { role: "model", text: responseText, gesture: "speaking" }]);
      setAvatarState("speaking");

      // Auto-speak responses if audio is enabled
      if (isSpeakingEnabled) {
        handleSpeakText(responseText);
      } else {
        setTimeout(() => {
          setAvatarState("neutral");
        }, 3000);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: lang === "ta" 
            ? "மன்னிக்கவும் தோழரே, இணைய தொடர்பில் சிக்கல் ஏற்பட்டுள்ளது. தயவுசெய்து மீண்டும் ஒருமுறை முயற்சிக்கவும்." 
            : "Apologies, comrade. Connection timed out. Please try again in a moment.",
          gesture: "neutral"
        }
      ]);
      setAvatarState("neutral");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    let greetingText = "";
    if (isSuperAdmin) {
      greetingText = lang === "ta"
        ? "மதிப்பிற்குரிய மாநிலப் பொதுச் செயலாளர் அவர்களுக்கு வணக்கம்! மீண்டும் ஒருமுறை தங்களை வரவேற்பதில் மகிழ்ச்சி அடைகிறேன். தங்களுக்கு எவ்வாறு உதவட்டும்?"
        : "Welcome back, Respected General Secretary! I am ready for administrative work. What task shall we tackle next?";
    } else {
      greetingText = lang === "ta"
        ? "வணக்கம் தோழரே! மீண்டும் ஒருமுறை உங்களை வரவேற்பதில் மகிழ்ச்சி. வேறென்ன உதவிகள் தேவைப்படுகிறது?"
        : "Welcome back! How else can I guide you regarding union matters, comrades?";
    }
    setMessages([{ role: "model", text: greetingText, gesture: "greeting" }]);
    setAvatarState("greeting");
  };

  return (
    <>
      {/* 1. FLOATING CHAT BALLOON ACTION TRIGGER */}
      <button
        id="tnpa-ai-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 hover:scale-105 active:scale-95 text-white p-3.5 rounded-full shadow-[0_10px_30px_rgba(185,28,28,0.4)] flex items-center gap-2 border border-amber-400 transition-all duration-300 group"
        title="TNPA AI Assistant"
      >
        <div className="relative w-10 h-10 rounded-full bg-stone-900 border border-amber-300 overflow-hidden flex items-center justify-center">
          {/* Pulsing online status indicator dot */}
          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-stone-950 z-20 animate-pulse" />
          
          {/* Miniature cute face preview */}
          <svg viewBox="0 0 120 120" className="w-10 h-10 mt-1">
            <circle cx="60" cy="55" r="24" fill="#ffe0cc" />
            {/* Red Beret */}
            <path d="M 32,38 Q 60,14 88,38 Z" fill="#b91c1c" />
            <path d="M 32,36 Q 60,30 88,36" stroke="#eab308" strokeWidth="2" fill="none" />
            {/* Cute eyes */}
            <circle cx="48" cy="54" r="3.5" fill="#1c1917" />
            <circle cx="72" cy="54" r="3.5" fill="#1c1917" />
            <circle cx="50" cy="52" r="1" fill="white" />
            <circle cx="74" cy="52" r="1" fill="white" />
            {/* Smile */}
            <path d="M 55,64 Q 60,68 65,64" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <div className="text-left pr-2 hidden md:block">
          <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider block leading-none">
            {isSuperAdmin ? "ADMIN ASSISTANT" : "TNPA UNION GUIDE"}
          </span>
          <span className="text-xs font-black tracking-wide text-white block">
            {isSuperAdmin ? "தலைமை AI 📊" : "TNPA AI உதவியாளர்"}
          </span>
        </div>

        <MessageSquare className="w-5 h-5 text-amber-100 group-hover:rotate-12 transition-transform hidden sm:block" />
      </button>

      {/* 2. EXPANDABLE FLOATING CHAT PANEL */}
      {isOpen && (
        <div 
          id="tnpa-ai-panel"
          className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[400px] h-[600px] bg-white rounded-2xl border border-stone-200 shadow-[0_15px_40px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden z-50 animate-[slideUp_0.3s_ease-out] text-stone-800"
        >
          
          {/* A. HEADER: BRANDING & MINIMIZE CONTROL */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-[#801010] text-white p-3 px-4 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="relative w-11 h-11 bg-stone-900/60 rounded-full border-2 border-amber-500/30 flex items-center justify-center p-1">
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-950 animate-pulse" />
                
                {/* INTERACTIVE AVATAR IN COMPACT HEADER */}
                <svg viewBox="0 0 120 120" className="w-10 h-10">
                  <circle cx="60" cy="55" r="22" fill="#ffe0cc" />
                  {/* Artist Red Beret with Gold Paint palette emblem */}
                  <path d="M 36,36 Q 60,12 84,36 Z" fill="#b91c1c" />
                  <path d="M 35,34 Q 60,28 85,34" stroke="#eab308" strokeWidth="2.0" fill="none" />
                  {/* Paint Brush behind ear */}
                  <path d="M 78,35 L 88,18" stroke="#f59e0b" strokeWidth="2" />
                  <polygon points="88,18 90,14 86,17" fill="#b91c1c" />
                  {/* Cute blush */}
                  <ellipse cx="48" cy="62" rx="2" ry="1" fill="#ffa3a3" />
                  <ellipse cx="72" cy="62" rx="2" ry="1" fill="#ffa3a3" />

                  {/* Dynamic Face State */}
                  {avatarState === "thinking" ? (
                    <>
                      <ellipse cx="48" cy="54" rx="2" ry="2.5" fill="#1c1917" />
                      <ellipse cx="72" cy="54" rx="2" ry="2.5" fill="#1c1917" />
                      <circle cx="60" cy="61" r="1.5" fill="#1c1917" />
                    </>
                  ) : avatarState === "speaking" ? (
                    <>
                      <path d="M 44,55 Q 49,52 54,54" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <ellipse cx="72" cy="54" rx="2.5" ry="3.5" fill="#1c1917" />
                      {/* Fluctuate mouth for Lip Sync simulation */}
                      <ellipse cx="60" cy="62" rx="2" ry="3" fill="#e11d48" className="animate-pulse" />
                    </>
                  ) : (
                    <>
                      <circle cx="48" cy="54" r="3" fill="#1c1917" />
                      <circle cx="72" cy="54" r="3" fill="#1c1917" />
                      <path d="M 54,62 Q 60,66 66,62" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </>
                  )}
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white tracking-wide uppercase">
                    {isSuperAdmin ? "TALAIMAI AI" : "TNPA AI"}
                  </h4>
                  <span className="text-[8px] bg-red-600 text-amber-200 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                    {lang === "ta" ? "நேரலை" : "ONLINE"}
                  </span>
                </div>
                <p className="text-[9px] text-stone-400 font-bold leading-tight">
                  {lang === "ta" 
                    ? "பெயிண்டர்கள் & ஓவியர்கள் முன்னேற்ற சங்கம்" 
                    : "Painters & Artists Advancement Association"}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
                className={`p-1.5 rounded-lg border text-stone-300 hover:text-white transition-colors ${
                  isSpeakingEnabled ? "bg-amber-500/10 border-amber-500/40" : "bg-stone-800 border-stone-700"
                }`}
                title={isSpeakingEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
              >
                {isSpeakingEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
              </button>

              <button 
                onClick={handleReset}
                className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 hover:text-white text-stone-400 transition-colors"
                title="Restart Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-red-950 transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* B. LARGE DYNAMIC GESTURING VISUAL AVATAR PANEL */}
          <div className="bg-gradient-to-b from-stone-950 to-stone-900 p-2 flex flex-col items-center justify-center text-center text-white border-b border-stone-800 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-[-50%] left-[-20%] w-48 h-48 rounded-full bg-[#b91c1c]" />
              <div className="absolute bottom-[-50%] right-[-20%] w-48 h-48 rounded-full bg-amber-500" />
            </div>

            {/* BIG SVG CHARACTER DYNAMIC VIEW */}
            <div className="relative w-28 h-28 my-1 flex items-center justify-center bg-stone-900/60 rounded-full border border-amber-500/20 p-1 shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
              
              <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] z-10">
                {/* Hair back */}
                <path d="M 38,45 Q 28,65 35,90 Q 60,95 85,90 Q 92,65 82,45 Z" fill="#2d221e" />

                {/* Neck */}
                <rect x="54" y="68" width="12" height="12" fill="#ffd1b3" rx="2" />
                
                {/* Shoulders & Painter's Red Jacket Uniform */}
                <path d="M 32,84 Q 45,76 60,76 Q 75,76 88,84 L 92,110 L 28,110 Z" fill="#b91c1c" />
                
                {/* Gold lapel with artist palette emblem */}
                <path d="M 45,76 L 54,82 L 52,90 Z" fill="#eab308" />
                <path d="M 75,76 L 66,82 L 68,90 Z" fill="#eab308" />
                <circle cx="50" cy="85" r="1.5" fill="#ef4444" />
                <circle cx="48" cy="87" r="1" fill="#3b82f6" />
                <circle cx="52" cy="87" r="1" fill="#22c55e" />

                {/* Head */}
                <circle cx="60" cy="55" r="22" fill="#ffe0cc" />

                {/* Hair Front / Anime Spiky bangs */}
                <path d="M 38,45 Q 60,35 82,45 Q 80,48 74,50 Q 68,52 64,48 Q 60,55 54,50 Q 46,52 38,45 Z" fill="#3d302a" />
                
                {/* Artist French Beret with paint brush */}
                <path d="M 38,36 Q 60,14 82,36 Z" fill="#b91c1c" />
                <ellipse cx="60" cy="35" rx="21" ry="5" fill="#991b1b" />
                <circle cx="60" cy="22" r="3" fill="#eab308" />
                <path d="M 78,35 L 90,16" stroke="#f59e0b" strokeWidth="2.5" />
                <polygon points="90,16 93,12 88,15" fill="#3b82f6" /> {/* paint tip */}

                {/* Blush */}
                <ellipse cx="46" cy="61" rx="2.5" ry="1.2" fill="#ffa3a3" opacity="0.8" />
                <ellipse cx="74" cy="61" rx="2.5" ry="1.2" fill="#ffa3a3" opacity="0.8" />

                {/* EXPRESSION GESTURES */}
                {avatarState === "greeting" && (
                  <>
                    {/* Smiling eyes */}
                    <path d="M 44,54 Q 49,51 52,55" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 76,54 Q 71,51 68,55" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 57,63 Q 60,67 63,63" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    
                    {/* Folded Greeting Hands (Vanakkam) */}
                    <g className="animate-bounce" style={{ animationDuration: '2.4s' }}>
                      <path d="M 56,88 Q 60,81 64,88 Z" fill="#ffe0cc" stroke="#b91c1c" strokeWidth="0.8" />
                      <line x1="60" y1="82" x2="60" y2="88" stroke="#b91c1c" strokeWidth="1" />
                    </g>
                  </>
                )}

                {avatarState === "thinking" && (
                  <>
                    {/* Analytical analytical eyes looking up */}
                    <ellipse cx="49" cy="53" rx="2.5" ry="3" fill="#1c1917" />
                    <ellipse cx="71" cy="53" rx="2.5" ry="3" fill="#1c1917" />
                    <circle cx="50" cy="51" r="0.8" fill="white" />
                    <circle cx="72" cy="51" r="0.8" fill="white" />
                    <circle cx="60" cy="62" r="1.5" fill="#1c1917" />
                    
                    {/* Paint Palette in hand */}
                    <g className="animate-pulse">
                      <path d="M 80,82 Q 92,72 90,88 Q 80,95 80,82 Z" fill="#d6d3d1" stroke="#444" strokeWidth="0.5" />
                      <circle cx="84" cy="80" r="1.5" fill="#ef4444" />
                      <circle cx="87" cy="83" r="1.5" fill="#3b82f6" />
                      <circle cx="85" cy="87" r="1.5" fill="#22c55e" />
                    </g>
                  </>
                )}

                {avatarState === "speaking" && (
                  <>
                    {/* Talking eyes */}
                    <circle cx="48" cy="54" r="3" fill="#1c1917" />
                    <circle cx="72" cy="54" r="3" fill="#1c1917" />
                    <circle cx="49" cy="52" r="0.8" fill="white" />
                    <circle cx="73" cy="52" r="0.8" fill="white" />
                    
                    {/* Mouth moving based on standard css scale */}
                    <ellipse cx="60" cy="63" rx="3.5" ry="5" fill="#e11d48" className="animate-[pulse_0.15s_infinite]" />
                    <path d="M 56,61 Q 60,63 64,61" stroke="#1c1917" strokeWidth="1" fill="none" />

                    {/* Paint Brush waving */}
                    <g className="animate-bounce" style={{ animationDuration: '0.8s' }}>
                      <path d="M 80,80 L 95,65" stroke="#f59e0b" strokeWidth="1.8" />
                      <path d="M 95,65 Q 98,62 94,61 Z" fill="#ef4444" />
                    </g>
                  </>
                )}

                {avatarState === "neutral" && (
                  <>
                    <circle cx="48" cy="54" r="3" fill="#1c1917" />
                    <circle cx="72" cy="54" r="3" fill="#1c1917" />
                    <path d="M 56,63 Q 60,65 64,63" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </>
                )}

                {avatarState === "happy" && (
                  <>
                    <path d="M 44,54 Q 49,51 52,55" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 76,54 Q 71,51 68,55" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 55,62 Q 60,69 65,62 Z" fill="#e11d48" />
                    
                    {/* Double thumbs up / brush waving */}
                    <g className="animate-bounce">
                      <circle cx="82" cy="80" r="3" fill="#ffe0cc" />
                      <path d="M 82,77 L 85,73" stroke="#b91c1c" strokeWidth="1" />
                    </g>
                  </>
                )}
              </svg>
            </div>

            <p className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {avatarState === "speaking" ? (lang === "ta" ? "மகிழ்ச்சியுடன் பதிலளிக்கிறது..." : "Speaking naturally...") : 
               avatarState === "thinking" ? (lang === "ta" ? "பதில் தேடுகிறது..." : "Processing query...") : 
               avatarState === "greeting" ? (lang === "ta" ? "இரு கைகூப்பி வரவேற்கிறது!" : "Welcoming you!") : 
               (lang === "ta" ? "உங்களுக்காக காத்திருக்கிறது..." : "Ready to guide you")}
            </p>
          </div>

          {/* C. CHAT BODY: MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 bg-stone-50 space-y-3.5 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left"
                }`}
              >
                {/* Icon Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === "user" 
                    ? "bg-amber-100 border-amber-300 text-amber-900" 
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-3 rounded-2xl shadow-sm text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-tr from-[#9a1c1c] to-[#b91c1c] text-white rounded-tr-none"
                    : "bg-white border border-stone-200 text-stone-800 rounded-tl-none font-medium"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Speaker trigger button inside models response */}
                  {msg.role === "model" && (
                    <button 
                      onClick={() => handleSpeakText(msg.text)}
                      className="mt-2 text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      {lang === "ta" ? "குரலில் கேளுங்கள்" : "Listen aloud"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[80%] mr-auto">
                <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-white border border-stone-200 rounded-2xl rounded-tl-none shadow-sm">
                  {/* Simulated Typing Animation */}
                  <div className="flex items-center gap-1 px-1 py-0.5">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* D. FAST FAQ INQUIRIES TAP LIST */}
          <div className="p-2 bg-stone-100 border-t border-stone-200 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
            {faqs.map((faq, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(faq.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, ""))}
                className="bg-white border border-stone-200 hover:border-red-500 text-stone-700 hover:text-red-700 font-bold text-[10px] px-3 py-1.5 rounded-full shadow-sm transition-all shrink-0 flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3 text-red-500" />
                {faq}
              </button>
            ))}
          </div>

          {/* E. FOOTER: TEXT & VOICE INPUT INTERFACES */}
          <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0">
            {/* Real-time Microphone Button */}
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                isListening 
                  ? "bg-red-600 border-red-500 text-white animate-pulse" 
                  : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              }`}
              title={isListening ? "Listening... click to stop" : "Speak using microphone"}
            >
              {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Main Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  handleSendMessage(input);
                }
              }}
              placeholder={
                isListening 
                  ? (lang === "ta" ? "உங்கள் குரல் கேட்கிறது..." : "Listening...") 
                  : (lang === "ta" ? "சங்கத் தோழரிடம் கேட்க..." : "Type union question...")
              }
              disabled={loading || isListening}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-600 transition-colors"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage(input)}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#b91c1c] border border-red-700 hover:bg-red-800 active:scale-95 text-white shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* F. SECURITY NOTICE ACCORDION */}
          <div className="bg-stone-900 text-stone-400 text-[8px] p-1.5 px-3 text-center border-t border-stone-800 tracking-wide font-medium">
            🛡️ {lang === "ta" ? "பாதுகாப்பான உத்தியோகபூர்வ இணைப்பு - தரவுகள் குறியாக்கம் செய்யப்பட்டுள்ளன" : "SECURED UNION ENVELOPE - ROLE PERMISSIONS AND DATA PROTECTION ACTIVE"}
          </div>

        </div>
      )}
    </>
  );
}
