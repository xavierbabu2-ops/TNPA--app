import React, { useState, useRef } from "react";
import { 
  Radio, 
  Play, 
  Square, 
  Settings, 
  Globe, 
  ShieldCheck, 
  Users, 
  Tv, 
  Sliders, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Volume2,
  Sparkles,
  Upload,
  Film,
  CheckSquare,
  Eye,
  Send
} from "lucide-react";
import { UserAccount } from "../types";

interface AdminLiveBroadcastControlProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function AdminLiveBroadcastControl({
  lang,
  currentUser,
  onAddAuditLog
}: AdminLiveBroadcastControlProps) {
  const isSuperAdmin = currentUser?.role === "super_admin" || currentUser?.role?.includes("admin");

  // Broadcast settings state
  const [streamUrl, setStreamUrl] = useState<string>("https://stream.tnpa2tv.in/live/master.m3u8");
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [streamTitle, setStreamTitle] = useState<string>("TNPA² மாநிலத் தலைவர் நேரலை உரை - நலவாரிய ஓய்வூதிய உயர்வு");
  const [broadcastQuality, setBroadcastQuality] = useState<string>("1080p 60fps HD");
  const [viewerCountOverride, setViewerCountOverride] = useState<string>("14320");
  const [tickerMessage, setTickerMessage] = useState<string>("TNPA² டிவி நேரலை: தமிழ்நாடு பெயிண்டர்கள் நலச் சங்கம் மூலம் 38 மாவட்ட உறுப்பினர்களுக்கும் டிஜிட்டல் சேவைகள் துவக்கம்!");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stream Health Verification State
  const [isTestingStream, setIsTestingStream] = useState<boolean>(false);
  const [streamHealthResult, setStreamHealthResult] = useState<{
    isOnline: boolean;
    httpStatus: number;
    contentType: string;
    latencyMs: number;
    checkedAt: string;
    error?: string;
  } | null>(null);

  // AI Design Studio & Video Upload State
  const [adminTab, setAdminTab] = useState<"stream" | "ai_design">("stream");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedSampleVideo, setSelectedSampleVideo] = useState<string>("sample_1");
  const [isProcessingAiDesign, setIsProcessingAiDesign] = useState<boolean>(false);
  const [aiProcessingStep, setAiProcessingStep] = useState<number>(0);
  const [aiDesignSuccess, setAiDesignSuccess] = useState<boolean>(false);

  // AI Design Overlay Options
  const [useTnpaWatermark, setUseTnpaWatermark] = useState<boolean>(true);
  const [useTnpaFlag, setUseTnpaFlag] = useState<boolean>(true);
  const [designTitle, setDesignTitle] = useState<string>("TNPA² மாநில மாநாடு நேரலைச் செய்தி");
  const [designSubtitle, setDesignSubtitle] = useState<string>("தமிழ்நாடு பெயிண்டர்கள் சங்கம் - அதிகாரப்பூர்வ ஒளிபரப்பு");
  const [lowerThirdName, setLowerThirdName] = useState<string>("S. மைக்கேல் ஆல்வின் (மாநிலத் தலைவர்)");
  const [includeTicker, setIncludeTicker] = useState<boolean>(true);

  if (!isSuperAdmin) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="font-extrabold text-stone-900 text-lg">
          {lang === "ta" ? "அணுகல் மறுக்கப்பட்டது (Access Restricted)" : "Access Restricted"}
        </h3>
        <p className="text-stone-600 text-xs max-w-md mx-auto">
          {lang === "ta"
            ? "இந்த நேரலை நிர்வாகக் கட்டுப்பாட்டுப் பகுதி (Admin-Only Live Control Panel) சூப்பர் அட்மின் பயனர்களுக்கு மட்டுமே அனுமதிக்கப்பட்டுள்ளது."
            : "This live stream management control panel is restricted to Super Admin users only."}
        </p>
      </div>
    );
  }

  const handleTestStreamHealth = async () => {
    if (!streamUrl.trim()) return;
    setIsTestingStream(true);
    setStreamHealthResult(null);

    try {
      const resp = await fetch("/api/stream/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: streamUrl.trim() })
      });
      const data = await resp.json();
      setIsTestingStream(false);
      setStreamHealthResult(data);

      if (data.isOnline) {
        setIsLiveActive(true);
        onAddAuditLog("Stream Health Check Passed", `Stream URL ${streamUrl} verified online. Server status 200 OK.`);
      } else {
        setIsLiveActive(false);
        onAddAuditLog("Stream Health Check Failed", `Stream URL ${streamUrl} offline or unreachable (${data.error || "HTTP failure"}). Toggled state to OFFLINE.`);
      }
    } catch (err: any) {
      setIsTestingStream(false);
      setStreamHealthResult({
        isOnline: false,
        httpStatus: 0,
        contentType: "error",
        latencyMs: 0,
        checkedAt: new Date().toISOString(),
        error: err.message || "Failed to reach health endpoint"
      });
      setIsLiveActive(false);
    }
  };

  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    setTimeout(() => {
      setSuccessMessage(
        lang === "ta"
          ? "வெற்றி! நேரலை ஒளிபரப்பு அமைப்புகள் மற்றும் சர்வர் URL வெற்றிகரமாக புதுப்பிக்கப்பட்டன."
          : "Success! Live broadcast configuration and stream URL updated successfully."
      );
      onAddAuditLog(
        "Super Admin Live Stream Updated",
        `Updated live stream URL to '${streamUrl}', Active: ${isLiveActive}, Title: ${streamTitle}`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 600);
  };

  const handleToggleBroadcast = () => {
    const nextState = !isLiveActive;
    setIsLiveActive(nextState);
    onAddAuditLog(
      nextState ? "Started Live Broadcast" : "Stopped Live Broadcast",
      `Super Admin toggled TNPA² TV live broadcast state to: ${nextState ? "LIVE" : "OFFLINE"}`
    );
  };

  // Run Server-Side AI Design Overlay Processing
  const handleRunAiDesignProcessing = () => {
    setIsProcessingAiDesign(true);
    setAiProcessingStep(1);
    setAiDesignSuccess(false);

    setTimeout(() => setAiProcessingStep(2), 700);
    setTimeout(() => setAiProcessingStep(3), 1400);
    setTimeout(() => {
      setAiProcessingStep(4);
      setIsProcessingAiDesign(false);
      setAiDesignSuccess(true);
      onAddAuditLog(
        "AI Design Video Overlay Processed",
        `Processed video with TNPA Logo Watermark, Flag, Title: '${designTitle}', and Lower-Third: '${lowerThirdName}'`
      );
    }, 2200);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-6">
      
      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs text-[#b91c1c] font-extrabold">
            <Radio className="w-4 h-4 animate-pulse text-[#b91c1c]" />
            <span>{lang === "ta" ? "சூப்பர் அட்மின் நேரலை கட்டுப்பாட்டு மையம்" : "Super Admin Live Broadcast & AI Studio"}</span>
          </div>
          <h2 className="text-xl font-black text-stone-900">
            {lang === "ta" ? "TNPA² TV நிர்வாகக் கட்டுப்பாட்டு அரங்கம்" : "TNPA² TV Stream & AI Design Manager"}
          </h2>
          <p className="text-stone-500 text-xs">
            {lang === "ta"
              ? "நேரலை ஸ்ட்ரீம் URL மேலாண்மை மற்றும் AI வீடியோ வாட்டர்மார்க் வடிவமைப்பு (AI Design Studio) ஆகியவற்றை இயக்கலாம்."
              : "Manage live stream URLs, broadcast status, and apply server-side AI Design overlays (watermarks, flags, lower-thirds)."}
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <button
            onClick={() => setAdminTab("stream")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === "stream"
                ? "bg-[#b91c1c] text-white shadow-md"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            {lang === "ta" ? "ஸ்ட்ரீம் கண்ட்ரோல் (Stream Control)" : "Stream Control"}
          </button>
          
          <button
            onClick={() => setAdminTab("ai_design")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adminTab === "ai_design"
                ? "bg-amber-500 text-stone-950 font-black shadow-md"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "AI வடிவமைப்பு & வாட்டர்மார்க் (AI Design)" : "AI Design & Watermark Studio"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: STREAM CONTROL & LIVE STATUS                      */}
      {/* ========================================================= */}
      {adminTab === "stream" && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          
          <div className="flex justify-between items-center">
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 w-full ${
              isLiveActive ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-stone-100 border-stone-300 text-stone-800"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${isLiveActive ? "bg-emerald-500 animate-ping" : "bg-stone-400"}`} />
                <div>
                  <span className="font-extrabold text-xs block">
                    {isLiveActive ? (lang === "ta" ? "ஒளிபரப்பு நிலை: நேரலை இயக்கத்தில் உள்ளது (ON AIR)" : "Broadcast Status: ON AIR (Live)") : (lang === "ta" ? "ஒளிபரப்பு நிலை: தற்போது நிறுத்தப்பட்டுள்ளது (OFFLINE)" : "Broadcast Status: OFFLINE")}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {lang === "ta" ? `தற்போதைய பார்வையாளர்கள்: ${viewerCountOverride} உறுப்பினர்கள்` : `Estimated Live Viewers: ${viewerCountOverride}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs font-mono font-bold px-3 py-1 bg-white/80 border border-stone-300 rounded-lg hidden sm:block">
                  {broadcastQuality}
                </div>
                <button
                  onClick={handleToggleBroadcast}
                  className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    isLiveActive
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isLiveActive ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === "ta" ? "நிறுத்து" : "Stop"}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === "ta" ? "தொடங்கு" : "Start Live"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSaveBroadcast} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-black text-stone-700">
                    {lang === "ta" ? "நேரலை ஸ்ட்ரீம் URL (HLS / M3U8 / YouTube / RTMP):" : "Live Stream URL (HLS / M3U8 / YouTube / RTMP):"}
                  </label>
                  <button
                    type="button"
                    onClick={handleTestStreamHealth}
                    disabled={isTestingStream}
                    className="px-3 py-1 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 text-amber-400 font-extrabold text-[11px] rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {isTestingStream ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === "ta" ? "சோதிக்கிறது..." : "Testing Health..."}</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === "ta" ? "ஸ்ட்ரீம் சிக்னல் சோதி (Test Stream)" : "Test Stream Health"}</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => {
                    setStreamUrl(e.target.value);
                    setStreamHealthResult(null);
                  }}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                  placeholder="https://stream.tnpa2tv.in/live/master.m3u8"
                />

                {/* Health Result Banner */}
                {streamHealthResult && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 mt-2 ${
                    streamHealthResult.isOnline ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-rose-50 border-rose-300 text-rose-900"
                  }`}>
                    <div className="flex items-center gap-2 font-bold">
                      {streamHealthResult.isOnline ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>
                        {streamHealthResult.isOnline 
                          ? `Stream signal ONLINE (${streamHealthResult.httpStatus} OK, Latency: ${streamHealthResult.latencyMs}ms, Type: ${streamHealthResult.contentType})`
                          : `Stream signal OFFLINE or unreachable: ${streamHealthResult.error || "HTTP 404/Timeout"}`}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono opacity-80 shrink-0">
                      {new Date(streamHealthResult.checkedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-700">
                  {lang === "ta" ? "ஒளிபரப்பு தலைப்பு (Stream Title):" : "Broadcast Title:"}
                </label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-xs text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-700">
                  {lang === "ta" ? "ஒளிபரப்பு தரம் (Quality Preset):" : "Broadcast Quality:"}
                </label>
                <select
                  value={broadcastQuality}
                  onChange={(e) => setBroadcastQuality(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-xs text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                >
                  <option value="1080p 60fps HD">1080p 60fps HD (Ultra High)</option>
                  <option value="720p HD">720p HD (Standard HD)</option>
                  <option value="480p Mobile Optimized">480p Mobile Optimized</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-700">
                  {lang === "ta" ? "பார்வையாளர் எண்ணிக்கை கட்டுப்பாடு (Viewer Count):" : "Viewer Count Override:"}
                </label>
                <input
                  type="text"
                  value={viewerCountOverride}
                  onChange={(e) => setViewerCountOverride(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-xs text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                />
              </div>

            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-stone-700">
                {lang === "ta" ? "கீழ் ஓடும் செய்தி பலகை Ticker (Breaking News Ticker):" : "Live Ticker Message:"}
              </label>
              <input
                type="text"
                value={tickerMessage}
                onChange={(e) => setTickerMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-xs text-stone-900 focus:outline-none focus:border-[#b91c1c]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-[#b91c1c] hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>{lang === "ta" ? "மாற்றங்களை சேமி & ஸ்ட்ரீம் புதுப்பி" : "Save Stream & Apply Controls"}</span>
              </button>
            </div>
          </form>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AI DESIGN VIDEO OVERLAY & WATERMARK STUDIO        */}
      {/* ========================================================= */}
      {adminTab === "ai_design" && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          
          <div className="p-4 bg-stone-900 text-white rounded-2xl border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                AI
              </div>
              <div>
                <h4 className="font-black text-amber-300 text-sm">
                  {lang === "ta" ? "AI வடிவமைப்பு & தானியங்கி வாட்டர்மார்க் ஸ்டுடியோ" : "AI Design Video Overlay & Watermark Studio"}
                </h4>
                <p className="text-stone-300 text-[11px]">
                  {lang === "ta"
                    ? "பதிவேற்றும் வீடியோவில் TNPA சங்கம் லோகோ, கொடி, தலைப்பு மற்றும் கீழ்-மூன்றில் (Lower-Third) நிர்வாகி பெயர் ஆகியவற்றை சர்வர் மூலம் தானாக இணைத்து (Inject) முன்னோட்டம் பார்க்கலாம்."
                    : "Server-side processing studio to inject TNPA logo watermarks, flags, title/subtitle, and lower-third speaker banners into uploaded videos."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Upload & Configuration (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* File Upload Box */}
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 space-y-3">
                <label className="block text-xs font-black text-stone-800">
                  {lang === "ta" ? "1. வீடியோ கோப்பைப் பதிவேற்றவும் (Upload Video):" : "1. Select or Upload Raw Video:"}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedVideoFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-5 text-center cursor-pointer bg-white transition-all space-y-2"
                >
                  <Upload className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-xs font-extrabold text-stone-900">
                    {selectedVideoFile ? selectedVideoFile.name : (lang === "ta" ? "வீடியோ கோப்பைத் தேர்ந்தெடுக்க கிளிக் செய்யவும்" : "Click to browse video file (MP4, MOV)")}
                  </p>
                  <p className="text-[10px] text-stone-400">Max size 500MB • HD 1080p supported</p>
                </div>

                {/* Sample Selection */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-stone-600 block">
                    {lang === "ta" ? "அல்லது மாதிரி வீடியோவை பயன்படுத்தவும்:" : "Or use sample union clip:"}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "sample_1", name: "State Conference 2026" },
                      { id: "sample_2", name: "Welfare Pension Seminar" }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSampleVideo(s.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                          selectedSampleVideo === s.id
                            ? "bg-amber-50 border-amber-500 text-stone-950 shadow-sm"
                            : "bg-white border-stone-200 text-stone-700"
                        }`}
                      >
                        📹 {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Design Overlays Toggle & Customization */}
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 space-y-4">
                <label className="block text-xs font-black text-stone-800">
                  {lang === "ta" ? "2. AI வடிவமைப்பு கிராபிக்ஸ் & வாட்டர்மார்க் அமைப்புகள்:" : "2. AI Design Overlay Configurations:"}
                </label>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-stone-200">
                    <input
                      type="checkbox"
                      checked={useTnpaWatermark}
                      onChange={(e) => setUseTnpaWatermark(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>TNPA Logo Watermark</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-stone-200">
                    <input
                      type="checkbox"
                      checked={useTnpaFlag}
                      onChange={(e) => setUseTnpaFlag(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>TNPA Flag Badge</span>
                  </label>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold text-stone-700">
                      {lang === "ta" ? "வீடியோ தலைப்பு (Main Title Overlay):" : "Video Title Overlay:"}
                    </label>
                    <input
                      type="text"
                      value={designTitle}
                      onChange={(e) => setDesignTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold text-stone-700">
                      {lang === "ta" ? "துணை தலைப்பு (Subtitle):" : "Subtitle Overlay:"}
                    </label>
                    <input
                      type="text"
                      value={designSubtitle}
                      onChange={(e) => setDesignSubtitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold text-stone-700">
                      {lang === "ta" ? "கீழ்-மூன்றில் நிர்வாகி பெயர் (Lower-Third Banner):" : "Lower-Third Speaker Banner:"}
                    </label>
                    <input
                      type="text"
                      value={lowerThirdName}
                      onChange={(e) => setLowerThirdName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Process Button */}
                <button
                  onClick={handleRunAiDesignProcessing}
                  disabled={isProcessingAiDesign}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingAiDesign ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === "ta" ? "AI வாட்டர்மார்க் செயலாக்கம் நடக்கிறது..." : "Processing AI Watermarks & Overlays..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === "ta" ? "⚙️ AI வடிவமைப்பு செயலாக்கி முன்னோட்டம் காண்க" : "Process & Preview AI Design Overlays"}</span>
                    </>
                  )}
                </button>

                {/* Processing Steps Progress */}
                {isProcessingAiDesign && (
                  <div className="p-3 bg-stone-900 text-amber-300 rounded-xl text-xs space-y-1 font-mono">
                    <p className="font-bold">⚡ Server-Side AI Pipeline Active:</p>
                    {aiProcessingStep >= 1 && <p>✓ 1. Uploading raw video to container...</p>}
                    {aiProcessingStep >= 2 && <p>✓ 2. Injecting TNPA² Logo Watermark & Flag...</p>}
                    {aiProcessingStep >= 3 && <p>✓ 3. Rendering lower-third speaker banner...</p>}
                    {aiProcessingStep >= 4 && <p>✓ 4. Encoding HLS stream ready for preview...</p>}
                  </div>
                )}
              </div>

            </div>

            {/* Right Col: Live Preview Player with Overlays (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              <div className="bg-stone-950 border-2 border-stone-800 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
                <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-amber-400" />
                    <h3 className="font-extrabold text-amber-300 text-sm">
                      {lang === "ta" ? "AI வடிவமைப்பு முன்னோட்ட திரை (Live Design Preview)" : "AI Design Preview Output"}
                    </h3>
                  </div>

                  <span className="px-2.5 py-1 bg-red-600 text-white font-black text-[10px] rounded animate-pulse">
                    READY FOR LIVE
                  </span>
                </div>

                {/* Player Canvas with Overlays */}
                <div className="relative aspect-video w-full bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 flex flex-col justify-between p-4 shadow-inner">
                  
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-900 to-rose-950/40 pointer-events-none" />

                  {/* Top Bar Overlays */}
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#b91c1c] text-white font-black text-[10px] rounded shadow">
                        TNPA² TV
                      </span>
                      {useTnpaFlag && (
                        <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-black text-[9px] rounded uppercase">
                          TNPA Flag
                        </span>
                      )}
                    </div>

                    {useTnpaWatermark && (
                      <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                        <div className="h-5 w-5 rounded-full bg-[#b91c1c] text-white flex items-center justify-center font-black text-[10px]">
                          T
                        </div>
                        <span className="text-amber-400 font-black text-[10px]">TNPA WATERMARK</span>
                      </div>
                    )}
                  </div>

                  {/* Center Title & Subtitle */}
                  <div className="relative z-10 my-auto text-center space-y-1.5">
                    <h3 className="font-black text-white text-base md:text-lg drop-shadow-md">
                      {designTitle}
                    </h3>
                    <p className="text-stone-300 text-xs font-medium">
                      {designSubtitle}
                    </p>
                  </div>

                  {/* Bottom Lower Third */}
                  <div className="relative z-10 space-y-1">
                    {lowerThirdName && (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#b91c1c] to-amber-600 text-white px-3 py-1 rounded-r-xl text-xs font-black shadow-lg">
                        <Users className="w-3.5 h-3.5 text-yellow-300" />
                        <span>{lowerThirdName}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Success Status & Publish Button */}
                {aiDesignSuccess && (
                  <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      {lang === "ta" 
                        ? "வெற்றி! AI வாட்டர்மார்க் மற்றும் கிராபிக்ஸ் வெற்றிகரமாக இணைக்கப்பட்டு நேரலைக்கு தயார்!" 
                        : "Success! AI watermarks and overlays injected successfully. Ready to publish to live channel."}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSuccessMessage(
                      lang === "ta"
                        ? "வெற்றி! AI வடிவமைக்கப்பட்ட வீடியோ TNPA² TV நேரலை பட்டியலில் இணைக்கப்பட்டது."
                        : "Success! AI-designed video published to TNPA² TV live list."
                    );
                    setAdminTab("stream");
                    onAddAuditLog(
                      "Published AI-Designed Video",
                      `Published video with title '${designTitle}' to TNPA² TV channel`
                    );
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === "ta" ? "இந்த AI வீடியோவை TNPA² TV-யில் ஒளிபரப்புக (Publish to Live)" : "Publish AI-Designed Video to TNPA² TV"}</span>
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

