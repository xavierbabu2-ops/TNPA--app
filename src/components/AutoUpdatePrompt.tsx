import React, { useState, useEffect } from "react";
import { RefreshCw, Sparkles, X, Smartphone } from "lucide-react";

interface AutoUpdatePromptProps {
  lang: "ta" | "en";
}

export async function forcePurgeCacheAndReload() {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.update().catch(() => {});
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      }
    }
  } catch (e) {
    console.warn("Cache purge notice:", e);
  } finally {
    // Bust browser HTTP cache and reload
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("_v", Date.now().toString());
    window.location.href = currentUrl.toString();
  }
}

export function AutoUpdatePrompt({ lang }: AutoUpdatePromptProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates immediately
        reg.update().catch(() => {});

        // Listen for new worker found
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

      // Periodically check for updates (every 5 minutes)
      const interval = setInterval(() => {
        if (registration) {
          registration.update().catch(() => {});
        }
      }, 5 * 60 * 1000);

      // Check for updates whenever user returns to the APK / app window
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          navigator.serviceWorker.ready.then((reg) => {
            reg.update().catch(() => {});
          });
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("online", handleVisibilityChange);

      // Listen for controller change (reload when updated)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("online", handleVisibilityChange);
      };
    }
  }, [registration]);

  const handleUpdate = () => {
    setIsUpdating(true);
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      // Force cache bust & hard reload
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-500 z-50 animate-bounce">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-amber-300">
              {lang === "ta" ? "புதிய பதிப்பு கிடைத்துள்ளது! 🚀" : "New Update Available! 🚀"}
            </h4>
            <p className="text-xs text-stone-300 mt-0.5">
              {lang === "ta"
                ? "சங்க செயலியின் புதிய அம்சங்கள் மற்றும் பாதுகாப்பு மாற்றங்கள் தயாராக உள்ளன."
                : "A new version with the latest features and fixes is ready."}
            </p>
          </div>
        </div>
        <button
          onClick={() => setUpdateAvailable(false)}
          className="text-stone-400 hover:text-white p-1"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
          <span>
            {isUpdating
              ? (lang === "ta" ? "புதுப்பிக்கப்படுகிறது..." : "Updating...")
              : (lang === "ta" ? "இப்போதே புதுப்பிக்கவும் (Update Now)" : "Update Now")}
          </span>
        </button>
      </div>
    </div>
  );
}
export default AutoUpdatePrompt;
