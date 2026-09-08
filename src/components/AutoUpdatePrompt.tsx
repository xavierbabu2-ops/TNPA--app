import React, { useState, useEffect } from "react";
import { RefreshCw, Sparkles, X, CheckCircle2, ShieldCheck } from "lucide-react";
import { performInstantAppUpdate, checkForAppUpdate, VersionInfo } from "../utils/autoUpdater";
import { APP_VERSION } from "../version";

interface AutoUpdatePromptProps {
  lang: "ta" | "en";
}

export { performInstantAppUpdate as forcePurgeCacheAndReload };

export function AutoUpdatePrompt({ lang }: AutoUpdatePromptProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [autoApplyCountdown, setAutoApplyCountdown] = useState(5);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Listen for custom event from autoUpdater
    const handleUpdateReady = (e: any) => {
      if (e.detail) {
        setUpdateInfo(e.detail);
        setUpdateAvailable(true);
        setIsDismissed(false);
      }
    };
    window.addEventListener("tnpa_update_ready", handleUpdateReady);

    // 2. Service Worker ready listener
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.update().catch(() => {});
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener("tnpa_update_ready", handleUpdateReady);
    };
  }, []);

  // Automatic countdown to apply update without any user friction
  useEffect(() => {
    if (!updateAvailable || isDismissed || isUpdating) return;

    if (autoApplyCountdown <= 0) {
      setIsUpdating(true);
      performInstantAppUpdate();
      return;
    }

    const timer = setTimeout(() => {
      setAutoApplyCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [updateAvailable, autoApplyCountdown, isDismissed, isUpdating]);

  const handleUpdateNow = () => {
    setIsUpdating(true);
    performInstantAppUpdate();
  };

  if (!updateAvailable || isDismissed) {
    return null;
  }

  return (
    <div 
      id="auto-update-ota-banner"
      className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[420px] bg-stone-950/95 text-white p-5 rounded-3xl shadow-2xl border-2 border-amber-400 z-[9999] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 rounded-2xl shadow-lg shrink-0 mt-0.5">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {lang === "ta" ? "நேரடி தானியங்கி அப்டேட்" : "OTA Auto-Update"}
              </span>
              <span className="bg-stone-800 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-stone-700">
                v{updateInfo?.version || "3.3.0"}
              </span>
            </div>
            <h4 className="font-black text-sm text-amber-300 leading-tight">
              {lang === "ta" 
                ? "புதிய அதிகாரப்பூர்வ பதிப்பு தயாராக உள்ளது! 🚀" 
                : "Official App Update is Ready! 🚀"}
            </h4>
            <p className="text-xs text-stone-200 leading-relaxed">
              {lang === "ta"
                ? "பழைய செயலியை அன்இன்ஸ்டால் செய்யத் தேவையில்லை! 38 மாவட்ட நிர்வாகிகள் கிளவுட் பாதுகாப்பு மற்றும் புதிய வசதிகள் தானாகவே நிறுவப்படும்."
                : "No need to uninstall the app! Latest 38 districts Firestore persistence and new features will apply automatically."}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress & Action Bar */}
      <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-3">
        <div className="text-[11px] text-amber-200 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          {lang === "ta"
            ? `${autoApplyCountdown} வினாடிகளில் தானாகப் புதுப்பிக்கப்படும்...`
            : `Auto-refreshing in ${autoApplyCountdown}s...`}
        </div>

        <button
          onClick={handleUpdateNow}
          disabled={isUpdating}
          className="py-2.5 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin text-stone-950" : ""}`} />
          <span>
            {isUpdating
              ? (lang === "ta" ? "புதுப்பிக்கிறது..." : "Updating...")
              : (lang === "ta" ? "இப்போதே புதுப்பி" : "Update Now")}
          </span>
        </button>
      </div>
    </div>
  );
}
export default AutoUpdatePrompt;

