import React, { useState } from "react";
import { Video, Award, ChevronRight, CheckSquare, Clock } from "lucide-react";

interface AchievementsTvTabProps {
  lang: "ta" | "en";
  darkMode: boolean;
  onAddAuditLog: (action: string, details: string) => void;

  // Poll state passed from parent
  opinionPolls: any[];
  setOpinionPolls: React.Dispatch<React.SetStateAction<any[]>>;
}

interface VideoChannel {
  id: string;
  title: string;
  titleEn: string;
  category: "news" | "training" | "schemes";
  duration: string;
  viewers: string;
  description: string;
  descriptionEn: string;
}

export default function AchievementsTvTab({
  lang,
  darkMode,
  onAddAuditLog,
  opinionPolls,
  setOpinionPolls
}: AchievementsTvTabProps) {
  // Local list of interactive video feeds
  const channels: VideoChannel[] = [
    {
      id: "vid_1",
      title: "மாநில பொதுச்செயலாளர் ரா. சேவியர் பாபு சிறப்பு உரை",
      titleEn: "State Secretary General R. Xavier Babu's Interview",
      category: "news",
      duration: "45 mins",
      viewers: "1.2k viewing",
      description: "சங்கத்தின் எதிர்கால வளர்ச்சி திட்டங்கள் மற்றும் புதிய உறுப்பினர் நலத்திட்டங்கள் பற்றிய கலந்துரையாடல்.",
      descriptionEn: "Deep dive discussion on union milestones, regional training centers, and digital ledger expansions."
    },
    {
      id: "vid_2",
      title: "நவீன ஏர்லெஸ் ஸ்ப்ரே பெயிண்டிங் தொழில்முறை பயிற்சி",
      titleEn: "Advanced Airless Spray Masterclass & Calibration Guide",
      category: "training",
      duration: "24 mins",
      viewers: "850 watching",
      description: "தொழிற்சாலை பெயிண்டிங் கருவிகள், அழுத்த அளவீடுகள் மற்றும் பாதுகாப்பு கவச பயன்பாடு பற்றிய நேரடி செயல்விளக்கம்.",
      descriptionEn: "Step-by-step masterclass covering pressure calibration, overlap techniques, and safety harness binds."
    },
    {
      id: "vid_3",
      title: "விபத்து காப்பீடு மற்றும் நலவாரிய நிதி கோரும் முறை",
      titleEn: "Government Welfare Board Relief Fund Enrollment",
      category: "schemes",
      duration: "18 mins",
      viewers: "410 watching",
      description: "தமிழக அரசிடம் இருந்து ₹1,00,000 விபத்து நிவாரணம் பெற பூர்த்தி செய்ய வேண்டிய படிவங்கள் மற்றும் ஆவண விளக்கம்.",
      descriptionEn: "Complete walk-through for securing government welfare subsidies, emergency claims, and certificate seals."
    }
  ];

  const [activeVideo, setActiveVideo] = useState<VideoChannel>(channels[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]" id="achievements-tv-container">
      {/* Header intro */}
      <div>
        <h4 className="text-sm font-black uppercase text-indigo-600">
          {lang === "ta" ? "டிஜிட்டல் டிவி, சாதனைகள் & கருத்துக்கணிப்புகள்" : "Union Digital TV, Opinions & Achievements Portal"}
        </h4>
        <p className="text-xs text-stone-400 mt-1">
          {lang === "ta"
            ? "சங்க வீடியோக்கள், உறுப்பினர்களின் விருதுகள் மற்றும் வாராந்திர வாக்கெடுப்புகளில் பங்கேற்கவும்."
            : "Tune into official feeds, congratulate peer painters, and participate in decision surveys."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Union TV & Achievements Column */}
        <div className="lg:col-span-2 space-y-6 text-left">
          {/* Union TV Feed */}
          <div className={`p-6 rounded-3xl border ${
            darkMode ? "bg-stone-900/30 border-stone-800" : "bg-[#faf9f5] border-stone-200 shadow-sm"
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>{lang === "ta" ? "சங்க டிஜிட்டல் தொலைக்காட்சி (Union Digital TV)" : "TNPA Digital TV & Success Stories"}</span>
              </h5>
              <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black rounded uppercase animate-pulse">
                Live Broadcast
              </span>
            </div>

            {/* Video Player screen simulator */}
            <div className="relative aspect-video w-full bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 flex flex-col justify-between p-4 mb-4">
              <div className="flex justify-between items-center text-[10px] text-white z-10">
                <span className="font-extrabold bg-stone-900/80 px-2 py-0.5 rounded uppercase">
                  {activeVideo.category.toUpperCase()} HUB
                </span>
                <span className="flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded uppercase font-black">
                  LIVE ● {activeVideo.viewers}
                </span>
              </div>

              {/* Dynamic screen simulator based on isPlaying */}
              <div className="flex flex-col items-center justify-center space-y-2 py-8 z-10">
                <button
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    onAddAuditLog(isPlaying ? "TV Streaming Paused" : "TV Streaming Played", `Tuned into: ${activeVideo.titleEn}`);
                  }}
                  className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center border border-white/20 cursor-pointer transition-all focus:outline-none"
                >
                  {isPlaying ? (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-4 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-4 bg-white rounded-full animate-pulse delay-75"></div>
                    </div>
                  ) : (
                    <span className="text-white text-lg font-black ml-1">▶</span>
                  )}
                </button>
                <span className="text-white font-extrabold text-xs uppercase tracking-wider bg-stone-900/60 px-3 py-1 rounded text-center max-w-[85%] truncate">
                  {lang === "ta" ? activeVideo.title : activeVideo.titleEn}
                </span>
                {isPlaying && (
                  <span className="text-[8px] text-emerald-400 font-extrabold tracking-wider uppercase animate-pulse">
                    Streaming Active (WebGL Simulated Stream)
                  </span>
                )}
              </div>

              <div className="text-[9px] text-stone-300 font-bold bg-stone-900/80 p-2 rounded-xl border border-stone-800 flex justify-between z-10">
                <span>{lang === "ta" ? activeVideo.description : activeVideo.descriptionEn}</span>
                <span className="shrink-0 ml-2">⏱ {activeVideo.duration}</span>
              </div>
            </div>

            {/* Interactive Selector channels list */}
            <div className="space-y-2 text-left">
              <span className="text-[9px] font-extrabold uppercase text-stone-400 block">
                {lang === "ta" ? "சேனல் ஒளிபரப்பு வரிசை" : "Interactive TV Program Grid"}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {channels.map((ch, idx) => (
                  <button
                    key={`ach_ch_${ch.id}_${idx}`}
                    onClick={() => {
                      setActiveVideo(ch);
                      setIsPlaying(true);
                      onAddAuditLog("TV Channel Changed", `Switched to channel: ${ch.titleEn}`);
                    }}
                    className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                      activeVideo.id === ch.id
                        ? "border-indigo-500 bg-indigo-50/15"
                        : "border-stone-200 bg-white hover:border-stone-400"
                    }`}
                  >
                    <div>
                      <span className="text-[8px] font-black text-indigo-600 uppercase block mb-1">
                        {ch.category === "news" ? "📢 NEWS" : ch.category === "training" ? "🎓 ACADEMY" : "🏛 GOVERNMENT"}
                      </span>
                      <span className="text-[10px] font-black text-stone-900 line-clamp-2 leading-tight">
                        {lang === "ta" ? ch.title : ch.titleEn}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-stone-400 font-bold mt-2 pt-1.5 border-t border-stone-100">
                      <span>{ch.viewers}</span>
                      <span>{ch.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Member Achievements */}
          <div className={`p-6 rounded-3xl border ${
            darkMode ? "bg-stone-900/30 border-stone-800" : "bg-[#faf9f5] border-stone-200 shadow-sm"
          }`}>
            <h5 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
              {lang === "ta" ? "உறுப்பினர் சாதனைகள் மற்றும் அங்கீகாரங்கள்" : "Peer Pride: Member Achievements"}
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl text-lg font-black shrink-0">🏆</div>
                <div>
                  <h6 className="text-xs font-black text-stone-900">
                    {lang === "ta" ? "எஸ். வேல்முருகன் (சேலம்)" : "S. Velmurugan (Salem)"}
                  </h6>
                  <span className="text-[9px] text-indigo-600 font-extrabold block">25 Years Dedicated Paint Work Shield</span>
                  <p className="text-[9px] text-stone-400 font-bold mt-1">Presented by State Secretary General R. Xavier Babu</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200 flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl text-lg font-black shrink-0">🎖️</div>
                <div>
                  <h6 className="text-xs font-black text-stone-900">
                    {lang === "ta" ? "தங்கவேல் மற்றும் குழுவினர்" : "Thangavel & Team (Coimbatore)"}
                  </h6>
                  <span className="text-[9px] text-indigo-600 font-extrabold block">Disaster Relief Rescue Volunteer Shield</span>
                  <p className="text-[9px] text-stone-400 font-bold mt-1">Exceptional courage during flood protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Survey & Opinion Poll Sidebar Column */}
        <div className="space-y-6 text-left">
          <div className={`p-6 rounded-3xl border ${
            darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <h5 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
              {lang === "ta" ? "வாக்கெடுப்பு மற்றும் கருத்துக்கணிப்புகள்" : "Union Member Surveys"}
            </h5>

            {opinionPolls.map((p, idx) => {
              const totalVotes = p.votes.reduce((a: number, b: number) => a + b, 0);
              return (
                <div key={`ach_poll_${p.id}_${idx}`} className="space-y-4" id={`poll-node-${p.id}`}>
                  <h6 className="text-xs font-black text-stone-900 leading-relaxed">
                    {lang === "ta" ? p.question : p.questionEn}
                  </h6>

                  <div className="space-y-3">
                    {p.options.map((opt: string, i: number) => {
                      const isVoted = p.userVoted !== null;
                      const votePct = totalVotes > 0 ? Math.round((p.votes[i] / totalVotes) * 100) : 0;
                      return (
                        <button
                          key={`poll_opt_${p.id}_${i}`}
                          disabled={isVoted}
                          onClick={() => {
                            setOpinionPolls(prev => prev.map(item => {
                              if (item.id === p.id) {
                                const nextVotes = [...item.votes];
                                nextVotes[i]++;
                                return { ...item, votes: nextVotes, userVoted: i };
                              }
                              return item;
                            }));
                            onAddAuditLog("Survey Vote Cast", `Cast vote on poll Option ${i+1}.`);
                          }}
                          className="w-full text-left rounded-xl border border-stone-200 p-3 bg-stone-50 hover:bg-stone-100 transition-all flex flex-col gap-1 cursor-pointer text-stone-800"
                        >
                          <div className="flex justify-between items-center text-[10px] font-bold text-stone-850 w-full">
                            <span className="line-clamp-1">{opt}</span>
                            {isVoted && <span className="text-indigo-600 shrink-0">{votePct}%</span>}
                          </div>
                          {isVoted && (
                            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-indigo-600"
                                style={{ width: `${votePct}%` }}
                              ></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {p.userVoted !== null && (
                    <span className="text-[9px] font-bold text-emerald-600 block">
                      ✓ {lang === "ta" ? "வாக்கு பதிவு செய்யப்பட்டது! நன்றி." : "Vote recorded securely. Total votes: " + totalVotes}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
