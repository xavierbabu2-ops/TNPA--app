/**
 * TNPA² Zero-Uninstall Instant OTA (Over-The-Air) Auto-Update Engine
 * Ensures that installed PWAs, home-screen apps, and mobile web clients
 * receive the latest features and database fixes automatically WITHOUT
 * requiring the user to uninstall the application.
 */

import { APP_VERSION, APP_BUILD_ID } from "../version";

export interface VersionInfo {
  version: string;
  buildId: number;
  buildDate: string;
  mandatoryUpdate?: boolean;
  releaseNotes?: string;
  messageTa?: string;
  messageEn?: string;
}

let isUpdatingInProgress = false;

/**
 * Hard-purge browser Service Worker cache storage and reload
 */
export async function performInstantAppUpdate(): Promise<void> {
  if (isUpdatingInProgress) return;
  isUpdatingInProgress = true;

  console.log("[AutoUpdater] Initiating instant client update...");

  try {
    // 1. Delete all CacheStorage items to prevent serving stale hashed assets
    if (typeof window !== "undefined" && "caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log("[AutoUpdater] Cleared CacheStorage keys:", cacheNames);
    }

    // 2. Instruct all ServiceWorker registrations to skip waiting and activate immediately
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        await reg.update().catch(() => {});
      }
    }
  } catch (err) {
    console.warn("[AutoUpdater] Cache cleanup warning:", err);
  } finally {
    // 3. Bust URL cache query and perform clean reload
    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("_v", Date.now().toString());
      window.location.href = currentUrl.toString();
    }
  }
}

/**
 * Proactively check whether an update is published on the server
 */
export async function checkForAppUpdate(options?: {
  silent?: boolean;
  onUpdateAvailable?: (info: VersionInfo) => void;
  onUpToDate?: () => void;
}): Promise<boolean> {
  try {
    // 1. Trigger Service Worker update check
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.update().catch(() => {});
          if (reg.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        }
      }).catch(() => {});
    }

    // 2. Fetch fresh version manifest from server (bypassing any browser cache)
    const res = await fetch(`/api/version?_t=${Date.now()}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache"
      },
      cache: "no-store"
    });

    if (!res.ok) {
      // Fallback to static version.json
      const fallbackRes = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!fallbackRes.ok) return false;
      const data: VersionInfo = await fallbackRes.json();
      return handleVersionComparison(data, options);
    }

    const data: VersionInfo = await res.json();
    return handleVersionComparison(data, options);
  } catch (err) {
    if (!options?.silent) {
      console.warn("[AutoUpdater] Check for update warning:", err);
    }
    return false;
  }
}

function handleVersionComparison(
  remote: VersionInfo,
  options?: {
    silent?: boolean;
    onUpdateAvailable?: (info: VersionInfo) => void;
    onUpToDate?: () => void;
  }
): boolean {
  const remoteBuildId = Number(remote.buildId || 0);
  const isNewer = remoteBuildId > APP_BUILD_ID || (remote.version && remote.version !== APP_VERSION);

  if (isNewer) {
    console.log(`[AutoUpdater] New update detected! Current: ${APP_VERSION} (${APP_BUILD_ID}) -> Remote: ${remote.version} (${remote.buildId})`);
    
    // Broadcast event to active UI components
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tnpa_update_ready", { detail: remote })
      );
    }

    if (options?.onUpdateAvailable) {
      options.onUpdateAvailable(remote);
    }

    // If mandatory, schedule seamless reload if not already performed this session
    const lastReloadKey = "tnpa_auto_reloaded_build";
    const lastReloaded = sessionStorage.getItem(lastReloadKey);
    if (remote.mandatoryUpdate && lastReloaded !== String(remoteBuildId)) {
      sessionStorage.setItem(lastReloadKey, String(remoteBuildId));
      setTimeout(() => {
        performInstantAppUpdate();
      }, 3000);
    }

    return true;
  } else {
    if (options?.onUpToDate) {
      options.onUpToDate();
    }
    return false;
  }
}

/**
 * Initialize automatic background listeners:
 * - On app launch
 * - On window refocus / unminimize
 * - On network re-connection
 * - On Service Worker controller change
 * - Every 3 minutes in the background
 */
export function initAutoUpdateListeners(): () => void {
  if (typeof window === "undefined") return () => {};

  // Check immediately on load after a short delay so rendering completes first
  const initialTimer = setTimeout(() => {
    checkForAppUpdate({ silent: true });
  }, 3000);

  // Check when user returns to app
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      checkForAppUpdate({ silent: true });
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Check when user comes online
  const handleOnline = () => {
    checkForAppUpdate({ silent: true });
  };
  window.addEventListener("online", handleOnline);

  // Periodic poll every 3 minutes
  const interval = setInterval(() => {
    checkForAppUpdate({ silent: true });
  }, 3 * 60 * 1000);

  // When a new Service Worker takes over (controllerchange), reload seamlessly
  let reloading = false;
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!reloading) {
        reloading = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && (event.data.type === "TNPA_VERSION_UPDATED" || event.data.type === "TNPA_FORCE_RELOAD")) {
        performInstantAppUpdate();
      }
    });
  }

  return () => {
    clearTimeout(initialTimer);
    clearInterval(interval);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("online", handleOnline);
  };
}
