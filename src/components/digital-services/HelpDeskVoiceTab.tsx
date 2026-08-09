import React from "react";
import { Sparkles, PhoneCall, Send, FileText, Calendar, AlertTriangle } from "lucide-react";
import { UserAccount } from "../../types";

interface HelpDeskVoiceTabProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  darkMode: boolean;
  onAddAuditLog: (action: string, details: string) => void;
  
  // Complaints States & Handlers
  complaints: any[];
  setComplaints: React.Dispatch<React.SetStateAction<any[]>>;
  activeComplaintId: string | null;
  setActiveComplaintId: (id: string | null) => void;
  newCompSubject: string;
  setNewCompSubject: (val: string) => void;
  newCompCategory: string;
  setNewCompCategory: (val: string) => void;
  newCompDesc: string;
  setNewCompDesc: (val: string) => void;
  newCompDoc: string;
  setNewCompDoc: (val: string) => void;
  complaintChatInput: string;
  setComplaintChatInput: (val: string) => void;

  // Voice Secretary States
  voiceResponse: string;
  setVoiceResponse: (val: string) => void;
  voiceInputActive: boolean;
  setVoiceInputActive: (val: boolean) => void;

  // Call Assistant States
  callbacks: any[];
  setCallbacks: React.Dispatch<React.SetStateAction<any[]>>;
  callPhone: string;
  setCallPhone: (val: string) => void;
  callDateTime: string;
  setCallDateTime: (val: string) => void;
  callTopic: string;
  setCallTopic: (val: string) => void;
  callConsent: boolean;
  setCallConsent: (val: boolean) => void;

  // Action callback for smart task workflow
  onAddWorkflowTask: (title: string, titleEn: string) => void;
}

export default function HelpDeskVoiceTab({
  lang,
  currentUser,
  darkMode,
  onAddAuditLog,
  complaints,
  setComplaints,
  activeComplaintId,
  setActiveComplaintId,
  newCompSubject,
  setNewCompSubject,
  newCompCategory,
  setNewCompCategory,
  newCompDesc,
  setNewCompDesc,
  newCompDoc,
  setNewCompDoc,
  complaintChatInput,
  setComplaintChatInput,
  voiceResponse,
  setVoiceResponse,
  voiceInputActive,
  setVoiceInputActive,
  callbacks,
  setCallbacks,
  callPhone,
  setCallPhone,
  callDateTime,
  setCallDateTime,
  callTopic,
  setCallTopic,
  callConsent,
  setCallConsent,
  onAddWorkflowTask
}: HelpDeskVoiceTabProps) {
  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]" id="help-desk-voice-container">
      {/* Tab Header intro */}
      <div>
        <h4 className="text-sm font-black uppercase text-indigo-600">
          {lang === "ta" ? "24x7 டிஜிட்டல் உதவி மையம் & AI குரல் செயலர்" : "24x7 Digital Help Desk & Voice Secretary Portal"}
        </h4>
        <p className="text-xs text-stone-400 mt-1">
          {lang === "ta"
            ? "புகார்களைப் பதிவு செய்யவும், நிர்வாகிகளுடன் அரட்டையடிக்கவும் மற்றும் குரல் கட்டளைகள் மூலம் தகவல்களை அறியவும்."
            : "Raise complaints, track redressals in real-time, speak with admin, or query our spoken AI Secretary."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Box & Redressal Tracker */}
        <div className={`p-6 rounded-3xl border lg:col-span-2 ${
          darkMode ? "bg-stone-900/30 border-stone-800" : "bg-[#faf9f5] border-stone-200 shadow-sm"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-stone-400">
              {lang === "ta" ? "1. குறைதீர்க்கும் தளம் மற்றும் அரட்டை" : "1. Grievance Redressal & Support Terminal"}
            </h5>
            <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black rounded uppercase animate-pulse">
              Admin Online
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raise Complaint Form */}
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">
                {lang === "ta" ? "புதிய புகார் பதிவு செய்" : "File a New Complaint"}
              </span>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-1">
                  {lang === "ta" ? "புகார் தலைப்பு" : "Grievance Subject"}
                </label>
                <input
                  type="text"
                  value={newCompSubject}
                  onChange={(e) => setNewCompSubject(e.target.value)}
                  placeholder={lang === "ta" ? "எ.கா: சந்தா செலுத்த முடியவில்லை..." : "e.g. Unable to renew subscription..."}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs outline-none text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1">
                    {lang === "ta" ? "வகை (Category)" : "Category"}
                  </label>
                  <select
                    value={newCompCategory}
                    onChange={(e) => setNewCompCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white text-[10px] outline-none text-stone-800"
                  >
                    <option value="general">{lang === "ta" ? "பொதுவானவை" : "General"}</option>
                    <option value="pension">{lang === "ta" ? "ஓய்வூதியம்" : "Pension"}</option>
                    <option value="accident">{lang === "ta" ? "விபத்து நிதி" : "Accident Claim"}</option>
                    <option value="subscription">{lang === "ta" ? "சந்தா விவரம்" : "Subscription"}</option>
                    <option value="certification">{lang === "ta" ? "திறன் சான்றிதழ்" : "Certification"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-1">
                    {lang === "ta" ? "ஆவணங்களை இணைக்க" : "Upload Proof (Simulated)"}
                  </label>
                  <input
                    type="text"
                    value={newCompDoc}
                    onChange={(e) => setNewCompDoc(e.target.value)}
                    placeholder="e.g. receipt.png"
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white text-[10px] outline-none text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-1">
                  {lang === "ta" ? "விவரங்கள்" : "Detailed Description"}
                </label>
                <textarea
                  rows={3}
                  value={newCompDesc}
                  onChange={(e) => setNewCompDesc(e.target.value)}
                  placeholder={lang === "ta" ? "உங்களது புகாரை விரிவாக எழுதவும்..." : "Please elaborate your issue in detail..."}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs outline-none text-stone-800 resize-none"
                />
              </div>

              <button
                onClick={() => {
                  if (!newCompSubject || !newCompDesc) {
                    alert(lang === "ta" ? "தலைப்பு மற்றும் விவரங்களை உள்ளிடவும்!" : "Please fill subject and description!");
                    return;
                  }
                  const added: any = {
                    id: `comp_${Date.now()}`,
                    subject: newCompSubject,
                    subjectEn: newCompSubject,
                    category: newCompCategory,
                    status: "pending",
                    description: newCompDesc,
                    descriptionEn: newCompDesc,
                    rating: 0,
                    ratingRemarks: "",
                    chatHistory: [
                      { sender: "admin", text: "வணக்கம்! உங்கள் புகார் பதிவு செய்யப்பட்டுள்ளது. விரைவில் தீர்வு காணப்படும்.", time: new Date().toISOString().slice(11, 16) }
                    ],
                    attachments: newCompDoc ? [newCompDoc] : [],
                    createdAt: new Date().toISOString().split("T")[0]
                  };
                  setComplaints(prev => [added, ...prev]);
                  onAddAuditLog("Grievance Registered", `New complaint registered regarding: ${newCompSubject}. Status: pending.`);
                  
                  // Trigger smart task workflow in parent
                  onAddWorkflowTask(newCompSubject, newCompSubject);

                  // Reset
                  setNewCompSubject("");
                  setNewCompDesc("");
                  setNewCompDoc("");
                  alert(lang === "ta" ? "புகார் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது! தானியங்கி பணி ஆணை உருவாக்கப்பட்டது." : "Complaint filed! Automated action workflow routed to your regional admin.");
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {lang === "ta" ? "புகார் சமர்ப்பி" : "Submit Complaint"}
              </button>
            </div>

            {/* Grievance Tracker List */}
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 block">
                {lang === "ta" ? "உங்கள் புகார்களின் நிலை" : "Your Gripes & Trackers"}
              </span>
              <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
                {complaints.map((c, idx) => (
                  <div
                    key={`hd_comp_${c.id}_${idx}`}
                    onClick={() => setActiveComplaintId(c.id)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      activeComplaintId === c.id
                        ? "border-indigo-500 bg-indigo-50/10"
                        : "border-stone-200 hover:border-stone-400 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h6 className="text-xs font-black text-stone-900 line-clamp-1">
                        {lang === "ta" ? c.subject : c.subjectEn}
                      </h6>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
                        c.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : c.status === "assigned"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed mb-2">
                      {lang === "ta" ? c.description : c.descriptionEn}
                    </p>
                    <div className="flex justify-between items-center text-[8px] text-stone-400 font-bold">
                      <span>{lang === "ta" ? `வகை: ${c.category}` : `Category: ${c.category}`}</span>
                      <span>{c.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Complaint Management Terminal */}
          {activeComplaintId && (() => {
            const comp = complaints.find(c => c.id === activeComplaintId);
            if (!comp) return null;
            return (
              <div className="border-t border-stone-200/50 pt-5 mt-5 text-left">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase text-indigo-600">
                    {lang === "ta" ? `புகார் விவரம் & நிர்வாகி உரையாடல்` : `Grievance Details & Admin Portal chat`}
                  </span>
                  <button
                    onClick={() => setActiveComplaintId(null)}
                    className="text-xs text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
                  >
                    ✕ Close Detail
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Timeline, info and rating */}
                  <div className="space-y-4">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/40">
                      <h6 className="text-xs font-black mb-1">{lang === "ta" ? comp.subject : comp.subjectEn}</h6>
                      <p className="text-[10px] text-stone-500 leading-relaxed mb-3">{lang === "ta" ? comp.description : comp.descriptionEn}</p>
                      {comp.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] text-indigo-600 font-bold bg-white p-2 rounded-xl border border-stone-200/60 w-fit">
                          <FileText className="w-3 h-3" />
                          <span>{comp.attachments[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Resolution Rating */}
                    {comp.status === "resolved" && (
                      <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
                        <span className="text-[10px] font-black uppercase text-emerald-700 block mb-2">
                          {lang === "ta" ? "தீர்வுக்கான தரம் வழங்குங்கள்" : "Rate Resolution Quality"}
                        </span>
                        {comp.rating > 0 ? (
                          <div>
                            <div className="flex gap-1 text-amber-500 mb-1">
                              {"★".repeat(comp.rating)}{"☆".repeat(5 - comp.rating)}
                            </div>
                            <p className="text-[10px] text-stone-600 italic">"{comp.ratingRemarks}"</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(stars => (
                                <button
                                  key={`star_${comp.id}_${stars}`}
                                  onClick={() => {
                                    const remarks = prompt(lang === "ta" ? "கருத்துக்களைப் பகிரவும் (Remarks):" : "Add comments for this resolution:");
                                    setComplaints(prev => prev.map(c => {
                                      if (c.id === comp.id) {
                                        return { ...c, rating: stars, ratingRemarks: remarks || "Good" };
                                      }
                                      return c;
                                    }));
                                    onAddAuditLog("Grievance Rated", `Grievance ID ${comp.id} rated ${stars} stars.`);
                                  }}
                                  className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-bold cursor-pointer text-stone-850"
                                >
                                  {stars} ★
                                </button>
                              ))}
                            </div>
                            <p className="text-[9px] text-stone-400 font-bold">
                              {lang === "ta" ? "* உங்கள் மதிப்பீடு சேவையின் தரத்தை உயர்த்த உதவும்." : "* Your ratings directly evaluate admin performance."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline Chat with Admin */}
                  <div className="flex flex-col h-[220px] bg-stone-50 border border-stone-200/50 rounded-2xl overflow-hidden">
                    <div className="bg-stone-900 text-white px-3.5 py-2 flex justify-between items-center shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-wider">{lang === "ta" ? "சங்க அதிகாரி நேரடித் தொடர்பு" : "Admin Live Chat"}</span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    </div>
                    
                    {/* Chat Window */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 text-[10px] flex flex-col">
                      {comp.chatHistory.map((ch: any, i: number) => (
                        <div
                          key={i}
                          className={`p-2 rounded-xl max-w-[80%] ${
                            ch.sender === "user"
                              ? "bg-indigo-600 text-white self-end text-right"
                              : "bg-white text-stone-800 border border-stone-200/50 self-start text-left"
                          }`}
                        >
                          <p className="leading-relaxed">{ch.text}</p>
                          <span className="text-[8px] opacity-75 block mt-0.5">{ch.time}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-2 border-t border-stone-200 bg-white flex gap-1.5 shrink-0">
                      <input
                        type="text"
                        value={complaintChatInput}
                        onChange={(e) => setComplaintChatInput(e.target.value)}
                        placeholder={lang === "ta" ? "செய்தியை உள்ளிடவும்..." : "Write message..."}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs outline-none text-stone-800"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (!complaintChatInput) return;
                            const userMsg = complaintChatInput;
                            const timeStr = new Date().toISOString().slice(11, 16);
                            
                            setComplaints(prev => prev.map(c => {
                              if (c.id === comp.id) {
                                  return {
                                    ...c,
                                    chatHistory: [...c.chatHistory, { sender: "user", text: userMsg, time: timeStr }]
                                  };
                              }
                              return c;
                            }));
                            setComplaintChatInput("");

                            // Simulate Admin response
                            setTimeout(() => {
                              setComplaints(prev => prev.map(c => {
                                if (c.id === comp.id) {
                                  return {
                                    ...c,
                                    chatHistory: [...c.chatHistory, {
                                      sender: "admin",
                                      text: `பெறப்பட்டது தோழரே. உங்களது கருத்து "${userMsg}" சென்னை தணிக்கை அலுவலகத்திற்கு அனுப்பப்பட்டுள்ளது. விரைவில் தகுந்த நடவடிக்கை எடுக்கப்படும்.`,
                                      time: new Date().toISOString().slice(11, 16)
                                    }]
                                  };
                                }
                                return c;
                              }));
                            }, 1500);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (!complaintChatInput) return;
                          const userMsg = complaintChatInput;
                          const timeStr = new Date().toISOString().slice(11, 16);
                          
                          setComplaints(prev => prev.map(c => {
                            if (c.id === comp.id) {
                              return {
                                ...c,
                                chatHistory: [...c.chatHistory, { sender: "user", text: userMsg, time: timeStr }]
                              };
                            }
                            return c;
                          }));
                          setComplaintChatInput("");

                          // Simulate Admin response
                          setTimeout(() => {
                            setComplaints(prev => prev.map(c => {
                              if (c.id === comp.id) {
                                return {
                                  ...c,
                                  chatHistory: [...c.chatHistory, {
                                    sender: "admin",
                                    text: `மதிப்பிற்குரிய தோழரே, உங்களது கோரிக்கை "${userMsg}" மீதான ஆய்வு விரைவில் முடிக்கப்படும்.`,
                                    time: new Date().toISOString().slice(11, 16)
                                  }]
                                };
                              }
                              return c;
                            }));
                          }, 1500);
                        }}
                        className="p-1.5 bg-stone-900 text-white rounded-lg cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Column: AI Voice Secretary & Call Scheduler */}
        <div className="space-y-6">
          {/* Voice Secretary Panel */}
          <div className={`p-6 rounded-3xl border text-left ${
            darkMode ? "bg-stone-900/30 border-stone-800" : "bg-indigo-50/30 border-indigo-200"
          }`}>
            <div className="flex justify-between items-center mb-3">
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[8px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{lang === "ta" ? "AI தமிழ் குரல் செயலர்" : "AI Tamil Voice Secretary"}</span>
              </span>
              <span className="text-[10px] font-black text-indigo-600">LIVE AUDIO 🔴</span>
            </div>

            <p className="text-[10px] text-stone-500 leading-relaxed mb-4">
              {lang === "ta"
                ? "சுற்றறிக்கைகள், அரசாணைகள் மற்றும் விபத்து நிதி நிதிஉதவி விதிகளை உங்கள் குரல் மூலம் கேட்டு அறிந்திடுங்கள்."
                : "Listen to official union circulars and government schemes in fluent spoken Tamil."}
            </p>

            {/* Pulse Animator */}
            <div className="flex flex-col items-center justify-center py-4 bg-white/40 rounded-2xl border border-indigo-200/30 mb-4">
              <button
                onClick={() => {
                  if (voiceInputActive) {
                    setVoiceInputActive(false);
                    return;
                  }

                  setVoiceInputActive(true);
                  setVoiceResponse(lang === "ta" ? "கேட்டுக் கொண்டிருக்கிறேன்... பேசவும்" : "Listening for voice commands...");
                  
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (SpeechRecognition) {
                    const recognition = new SpeechRecognition();
                    recognition.lang = lang === "ta" ? "ta-IN" : "en-US";
                    recognition.onresult = (event: any) => {
                      const resultText = event.results[0][0].transcript;
                      setVoiceResponse(lang === "ta" ? `நீங்கள் சொன்னது: "${resultText}"` : `You said: "${resultText}"`);
                      setVoiceInputActive(false);

                      let aiReply = "";
                      const speechLower = resultText.toLowerCase();
                      if (speechLower.includes("பயிற்சி") || speechLower.includes("academy") || speechLower.includes("course")) {
                        aiReply = lang === "ta"
                          ? "தோழரே, நமது சங்கப் பயிற்சி மையத்தில் ஏர்லெஸ் ஸ்ப்ரே பெயிண்டிங் வகுப்புகள் உள்ளன. நீங்கள் பதிவு செய்யலாம்!"
                          : "Brother, our academy provides advanced Airless Spray Masterclasses. You are invited to register!";
                      } else if (speechLower.includes("ஓய்வூதியம்") || speechLower.includes("pension") || speechLower.includes("scheme")) {
                        aiReply = lang === "ta"
                          ? "அரசு கட்டுமான நலவாரியத்தில் சேர 90 நாட்கள் பணிபுரிந்திருக்க வேண்டும். உங்களுக்கு 60 வயதான பின் மாதந்தோறும் ஆயிரம் ரூபாய் ஓய்வூதியம் கிடைக்கும்."
                          : "Painters registered under Construction Welfare Board get 1,000 rupees monthly pension after reaching 60 years.";
                      } else if (speechLower.includes("விபத்து") || speechLower.includes("accident") || speechLower.includes("காப்பீடு")) {
                        aiReply = lang === "ta"
                          ? "விபத்து ஏற்பட்டால் உடனடி உதவியாக ஒரு லட்சம் ரூபாய் வரை வழங்க நமது கூட்டு காப்பீட்டுத் திட்டம் வழிவகை செய்கிறது."
                          : "Our joint accidental policy secures up to 100,000 rupees direct relief payout.";
                      } else {
                        aiReply = lang === "ta"
                          ? `வணக்கம், நான் உங்கள் குரல் செயலர். தங்களது குரல் கட்டளை: "${resultText}" பெறப்பட்டது. தங்களுக்கு உதவ நான் தயாராக உள்ளேன்!`
                          : `Greetings! Voice instruction received: "${resultText}". I am ready to translate safety manuals or welfare templates.`;
                      }

                      setVoiceResponse(aiReply);
                      
                      if (window.speechSynthesis) {
                        const synth = window.speechSynthesis;
                        const utter = new SpeechSynthesisUtterance(aiReply);
                        utter.lang = lang === "ta" ? "ta-IN" : "en-US";
                        synth.speak(utter);
                      }
                    };
                    recognition.onerror = () => {
                      setVoiceInputActive(false);
                      setVoiceResponse(lang === "ta" ? "குரல் சரியாகக் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்!" : "Audio input failed. Please try speaking again.");
                    };
                    recognition.start();
                  } else {
                    setTimeout(() => {
                      const sampleReply = lang === "ta"
                        ? "வணக்கம்! விபத்து நிதி உதவி மற்றும் நலவாரிய ஓய்வூதியம் பற்றி அறிய 'விபத்து' அல்லது 'ஓய்வூதியம்' என்று சொல்லவும்."
                        : "Hello! Say 'pension' or 'safety' to listen to guidelines.";
                      setVoiceResponse(sampleReply);
                      setVoiceInputActive(false);

                      if (window.speechSynthesis) {
                        const synth = window.speechSynthesis;
                        const utter = new SpeechSynthesisUtterance(sampleReply);
                        utter.lang = lang === "ta" ? "ta-IN" : "en-US";
                        synth.speak(utter);
                      }
                    }, 2500);
                  }
                }}
                className={`relative p-5 rounded-full text-white cursor-pointer transition-all ${
                  voiceInputActive ? "bg-red-600 animate-pulse scale-110" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                <PhoneCall className="w-6 h-6" />
                {voiceInputActive && (
                  <span className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping"></span>
                )}
              </button>
              <span className="text-[10px] font-black text-stone-900 mt-3 uppercase tracking-wider">
                {voiceInputActive ? (lang === "ta" ? "பேசவும்... கேட்டுக் கொண்டிருக்கிறேன்" : "Speak Now... Listening") : (lang === "ta" ? "பேசித் தொடங்க மைக் அழுத்தவும்" : "Click to Speak (Voice Command)")}
              </span>
            </div>

            {/* Response Display */}
            {voiceResponse && (
              <div className="bg-white p-3.5 rounded-2xl border border-indigo-100 text-xs text-stone-800 font-serif leading-relaxed text-left animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center gap-1.5 text-indigo-600 font-black mb-1.5 uppercase text-[9px]">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>AI Secretary Reply</span>
                </div>
                <p>{voiceResponse}</p>
              </div>
            )}

            {/* Quick Audio Guides */}
            <div className="mt-4 space-y-2 text-left">
              <span className="text-[9px] font-extrabold uppercase text-stone-400 block">{lang === "ta" ? "விரைவு குரல் வழிகாட்டிகள்" : "Quick Audio Summaries"}</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const txtTa = "நலவாரிய ஓய்வூதியம் என்பது கட்டுமான நலவாரியத்தில் பதிவு செய்து, அறுபது வயது பூர்த்தியடைந்த தகுதியான ஓவியர்களுக்கு மாதம் ஆயிர ரூபாய் வங்கி கணக்கில் நேரடியாக செலுத்தும் திட்டமாகும்.";
                    const txtEn = "Welfare pension transfers 1,00,000 rupees monthly pension to builders aged over 60 fully registered with the state construction welfare board.";
                    const utterTxt = lang === "ta" ? txtTa : txtEn;
                    setVoiceResponse(utterTxt);
                    if (window.speechSynthesis) {
                      const synth = window.speechSynthesis;
                      const utter = new SpeechSynthesisUtterance(utterTxt);
                      utter.lang = lang === "ta" ? "ta-IN" : "en-US";
                      synth.speak(utter);
                    }
                  }}
                  className="p-2 bg-white hover:bg-indigo-50/50 rounded-xl border border-stone-200 text-[10px] font-bold text-stone-850 text-left cursor-pointer"
                >
                  📢 {lang === "ta" ? "ஓய்வூதியத் திட்டம்" : "Pension Scheme"}
                </button>
                <button
                  onClick={() => {
                    const txtTa = "விபத்து நிதி உதவி என்பது, வேலை செய்யும் இடத்தில் விபத்து ஏற்பட்டால் உடனடியாக ஒரு லட்சம் வரை விபத்து நிவாரணமாகவும், முடக்கம் ஏற்பட்டால் மாதாந்திர உதவித்தொகையும் வழங்கும் திட்டமாகும்.";
                    const txtEn = "Under accident support, members receive up to 1,00,000 rupees instant relief for site injuries, along with permanent disability pensions.";
                    const utterTxt = lang === "ta" ? txtTa : txtEn;
                    setVoiceResponse(utterTxt);
                    if (window.speechSynthesis) {
                      const synth = window.speechSynthesis;
                      const utter = new SpeechSynthesisUtterance(utterTxt);
                      utter.lang = lang === "ta" ? "ta-IN" : "en-US";
                      synth.speak(utter);
                    }
                  }}
                  className="p-2 bg-white hover:bg-indigo-50/50 rounded-xl border border-stone-200 text-[10px] font-bold text-stone-850 text-left cursor-pointer"
                >
                  📢 {lang === "ta" ? "விபத்து காப்பீடு" : "Accident Coverage"}
                </button>
              </div>
            </div>
          </div>

          {/* AI Call Assistant Callback Scheduler */}
          <div className={`p-6 rounded-3xl border text-left ${
            darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <h5 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{lang === "ta" ? "AI தொலைபேசி அழைப்பு செயலி" : "AI Call Assistant & Logs"}</span>
            </h5>

            <p className="text-[10px] text-stone-500 leading-relaxed mb-4">
              {lang === "ta"
                ? "மாவட்ட செயலாளருடன் நேரடி ஆலோசனைக் கூட்டங்களை முன்பதிவு செய்யுங்கள். அழைப்பு விபரங்கள் தானியங்கியாக பதிவு செய்யப்படும்."
                : "Schedule direct administrative callback conferences. Dialog summaries are recorded."}
            </p>

            <div className="space-y-3">
              <input
                type="tel"
                value={callPhone}
                onChange={(e) => setCallPhone(e.target.value)}
                placeholder={lang === "ta" ? "கைபேசி எண்..." : "Enter callback mobile..."}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none bg-white text-stone-800"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={callDateTime}
                  onChange={(e) => setCallDateTime(e.target.value)}
                  className="p-2.5 rounded-xl border border-stone-200 text-[10px] outline-none bg-white text-stone-800"
                />
                <input
                  type="text"
                  value={callTopic}
                  onChange={(e) => setCallTopic(e.target.value)}
                  placeholder={lang === "ta" ? "பேச வேண்டிய தலைப்பு..." : "Subject of discussion..."}
                  className="p-2.5 rounded-xl border border-stone-200 text-[10px] outline-none bg-white text-stone-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={callConsent}
                  onChange={(e) => setCallConsent(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="consent" className="text-[8px] font-black text-stone-400 uppercase leading-none">
                  {lang === "ta" ? "அழைப்பு பதிவு செய்ய ஒப்புதல்" : "Consent to Record and log call summaries"}
                </label>
              </div>

              <button
                onClick={() => {
                  if (!callPhone || !callDateTime || !callTopic) {
                    alert("Fill phone, time, and topic to queue callback!");
                    return;
                  }
                  const cId = `call_${Date.now()}`;
                  const newCall = {
                    id: cId,
                    phone: callPhone,
                    dateTime: callDateTime.replace("T", " "),
                    topic: callTopic,
                    topicEn: callTopic,
                    consent: callConsent,
                    status: "scheduled",
                    summary: `Consent logged. Auto summary will be compiled by AI secretary upon call completion.`,
                    followUpTasks: ["Review member credentials", `Follow up ${callPhone}`]
                  };
                  setCallbacks(prev => [newCall, ...prev]);
                  onAddAuditLog("Callback Scheduled", `Callback conference queued for phone: ${callPhone} regarding: ${callTopic}.`);

                  // Reset
                  setCallPhone("");
                  setCallTopic("");
                  alert(lang === "ta" ? "அழைப்பு முன்பதிவு செய்யப்பட்டது! மாவட்ட செயலாளருக்கு எஸ்.எம்.எஸ் அனுப்பப்பட்டது." : "Callback booked! Dialing scheduler synced with district coordinator.");
                }}
                className="w-full py-2 bg-stone-950 hover:bg-stone-900 text-white font-black text-xs uppercase rounded-xl cursor-pointer"
              >
                {lang === "ta" ? "அழைப்பை திட்டமிடு" : "Schedule Callback"}
              </button>
            </div>

            {/* Scheduled Call Logs */}
            <div className="border-t border-stone-200/50 mt-5 pt-4">
              <span className="text-[9px] font-extrabold uppercase text-stone-400 block mb-2">{lang === "ta" ? "அழைப்புப் பதிவேடுகள்" : "Scheduled Call Logs"}</span>
              <div className="space-y-2.5 max-h-[150px] overflow-y-auto pr-1">
                {callbacks.map((cb, idx) => (
                  <div key={`hd_cb_${cb.id}_${idx}`} className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[10px] text-stone-700 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold">{cb.phone}</span>
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[8px] font-black uppercase shrink-0">
                        {cb.status}
                      </span>
                    </div>
                    <p className="font-bold text-stone-900 mb-1">{cb.topic}</p>
                    <div className="flex justify-between items-center text-[8px] text-stone-400">
                      <span>📅 {cb.dateTime}</span>
                      <span>{cb.consent ? "Consent Recorded" : "No record"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
