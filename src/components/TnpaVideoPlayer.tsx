import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw, 
  RotateCw, 
  AlertTriangle, 
  Radio, 
  RefreshCw,
  Share2,
  Tv,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { addBreadcrumb, executeSelfHealing } from "../utils/selfHealing";

interface TnpaVideoPlayerProps {
  src?: string; // Video URL or HLS / YouTube link
  title?: string;
  lang?: "ta" | "en";
  isLive?: boolean;
  poster?: string;
  onShare?: () => void;
}

export default function TnpaVideoPlayer({
  src,
  title = "TNPA² மாநில தலைவர் நேரலை உரை (Live State Broadcast)",
  lang = "ta",
  isLive = true,
  poster,
  onShare
}: TnpaVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quality, setQuality] = useState<string>("1080p HD");
  const [showControlsOverlay, setShowControlsOverlay] = useState<boolean>(true);

  // Auto-hide controls timeout
  const hideTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    const isM3u8 = src.includes(".m3u8") || src.includes("/hls/");

    if (isM3u8) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          setHasError(false);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.warn("HLS Stream Error:", data);
          if (data.fatal) {
            addBreadcrumb("media", `HLS fatal stream error: ${data.type} (${data.details})`);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                hls?.destroy();
                setHasError(true);
                setIsLoading(false);
                executeSelfHealing(
                  `Live TV Stream Offline: ${data.details || data.type}`,
                  "TnpaVideoPlayer",
                  { streamUrl: src, fatal: true }
                ).catch(() => {});
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    }

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
      setHasError(false);
    };
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setHasError(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);

    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
    };
  }, [src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => setHasError(true));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setHasError(true));
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "00:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  // Determine if URL is YouTube
  const isYouTube = src && (src.includes("youtube.com") || src.includes("youtu.be"));
  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0];
    } else if (url.includes("embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}` : url;
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-stone-950 rounded-3xl overflow-hidden border-2 border-stone-800 shadow-2xl group w-full aspect-video flex flex-col justify-between"
      onMouseMove={() => {
        setShowControlsOverlay(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => setShowControlsOverlay(true), 4000);
      }}
    >
      
      {/* ================================================= */}
      {/* TNPA² TV TOP BRANDING WATERMARK & LIVE BADGE HEADER */}
      {/* ================================================= */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-stone-950/90 via-stone-950/50 to-transparent flex items-center justify-between pointer-events-none">
        
        {/* Association Branding Logo & Name */}
        <div className="flex items-center gap-2.5 bg-black/70 border border-amber-500/40 px-3 py-1.5 rounded-2xl backdrop-blur-md pointer-events-auto shadow-lg">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-[#b91c1c] to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-inner">
            TV
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-xs tracking-wide flex items-center gap-1.5">
              <span>TNPA² TV</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-stone-950 font-black rounded">
                {lang === "ta" ? "அதிகாரப்பூர்வ சேனல்" : "OFFICIAL"}
              </span>
            </span>
            <span className="text-[10px] text-stone-300 font-medium">
              {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் சங்கம்" : "TN Painters Association"}
            </span>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isLive ? (
            <div className="px-3 py-1 bg-red-600/90 border border-red-400 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-2 backdrop-blur-md animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>{lang === "ta" ? "நேரலை (ON AIR)" : "LIVE BROADCAST"}</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-stone-800/90 border border-stone-600 text-stone-300 text-xs font-bold rounded-xl backdrop-blur-md">
              {lang === "ta" ? "ஆவணக்காப்பகம் (Archive)" : "RECORDED REPLAY"}
            </div>
          )}

          {/* Quality badge */}
          <div className="px-2.5 py-1 bg-black/70 border border-white/20 text-amber-300 text-[11px] font-mono font-bold rounded-xl hidden sm:block">
            {quality}
          </div>
        </div>

      </div>

      {/* ================================================= */}
      {/* VIDEO / STREAM VIEWPORT AREA                      */}
      {/* ================================================= */}
      <div className="relative w-full h-full flex items-center justify-center bg-stone-950 overflow-hidden">
        
        {/* Loading Spinner */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/80 z-20 backdrop-blur-xs space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-amber-200 font-bold text-xs">
              {lang === "ta" ? "டிஎன்பிஏ டிவி சிக்னல் ஏற்றப்படுகிறது..." : "Loading TNPA² TV Stream..."}
            </span>
          </div>
        )}

        {/* Error Fallback */}
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950 p-6 z-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-white font-extrabold text-sm">
                {lang === "ta" ? "நேரலை இணைப்பில் சிக்கல் / பிழை" : "Stream Playback Error"}
              </h4>
              <p className="text-stone-400 text-xs">
                {lang === "ta"
                  ? "இந்த நேரலை சர்வர் URL தற்காலிகமாக கிடைக்கவில்லை அல்லது பிரவுசர் தடை செய்கிறது. கீழே உள்ள பொத்தானைக் கொண்டு மீண்டும் முயற்சிக்கவும்."
                  : "Unable to load video stream URL. Please try reloading or check network connection."}
              </p>
            </div>
            <button
              onClick={handleReload}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{lang === "ta" ? "மீண்டும் முயற்சிக்கவும் (Reload)" : "Reload Stream"}</span>
            </button>
          </div>
        ) : null}

        {/* Video Player or Default Stream Placeholder */}
        {src ? (
          isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(src)}
              title={title}
              className="w-full h-full border-0 absolute inset-0 z-10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              autoPlay={isPlaying}
              muted={isMuted}
              playsInline
              className="w-full h-full object-contain absolute inset-0 z-10"
              onClick={togglePlay}
              onError={() => setHasError(true)}
            />
          )
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-center">
            {/* Background pattern / glow */}
            <div className="absolute inset-0 bg-radial from-red-950/40 via-transparent to-transparent pointer-events-none animate-pulse" />
            
            <div className="z-10 space-y-4 max-w-md text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-stone-900/90 border border-amber-500/40 shadow-2xl backdrop-blur-md mb-2">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#b91c1c] to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
                  TV
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest block">
                  {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் சங்கம் - நேரலை ஒளிபரப்பு" : "TNPA² OFFICIAL BROADCAST"}
                </span>
                <h3 className="font-black text-white text-base sm:text-lg">TNPA² TV 24x7</h3>
              </div>

              <p className="text-stone-300 text-xs sm:text-sm bg-black/60 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
                {title}
              </p>

              <button
                onClick={togglePlay}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-xs rounded-2xl shadow-xl hover:from-amber-400 hover:to-yellow-400 transition-all inline-flex items-center gap-2 cursor-pointer animate-bounce"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === "ta" ? "▶ டிஎன்பிஏ டிவி நேரலை இயக்கு" : "▶ Start TNPA² TV Stream"}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ================================================= */}
      {/* BOTTOM CUSTOM PLAYER CONTROLS BAR                 */}
      {/* ================================================= */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent flex flex-col space-y-2 backdrop-blur-sm">
        
        {/* Progress Bar (if not YouTube) */}
        {!isYouTube && duration > 0 && (
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-mono text-stone-400">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[10px] font-mono text-stone-400">{formatTime(duration)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-white text-xs">
          
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold transition-all cursor-pointer shadow-md"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Volume slider */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hidden sm:block"
            />

            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <Tv className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-xs text-amber-300">TNPA² TV 24x7</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onShare && (
              <button
                onClick={onShare}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-white/10"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "ta" ? "பகிர்" : "Share"}</span>
              </button>
            )}

            <button
              onClick={toggleFullScreen}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
