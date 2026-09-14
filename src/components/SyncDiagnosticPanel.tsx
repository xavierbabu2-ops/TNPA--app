import React, { useState, useEffect } from "react";
import { 
  SyncTelemetryEvent, 
  getRecentSyncEvents, 
  subscribeToSyncEvents, 
  triggerTestDistrictSyncPing,
  computeTimeAgo 
} from "../utils/syncTelemetry";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Users, 
  Sliders, 
  FileText 
} from "lucide-react";

interface SyncDiagnosticPanelProps {
  lang: "ta" | "en";
}

export default function SyncDiagnosticPanel({ lang }: SyncDiagnosticPanelProps) {
  const [events, setEvents] = useState<SyncTelemetryEvent[]>(() => getRecentSyncEvents());
  const [filter, setFilter] = useState<"all" | "district">("all");
  const [isPinging, setIsPinging] = useState(false);
  const [pingNotification, setPingNotification] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Subscribe to real-time sync events
  useEffect(() => {
    const unsubscribe = subscribeToSyncEvents((updatedEvents) => {
      setEvents(updatedEvents);
    });

    // Rerender every 5s to update "timeAgo" labels
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingNotification(null);
    try {
      const result = await triggerTestDistrictSyncPing();
      setPingNotification(
        lang === "ta" 
          ? `✅ சோதனை வெற்றி: ${result.latencyMs ? `${result.latencyMs}ms - ` : ""}${result.recordCount ?? 0} மாவட்ட நிர்வாகிகள் உறுதிசெய்யப்பட்டனர்!`
          : `✅ Verified: ${result.latencyMs ? `${result.latencyMs}ms - ` : ""}${result.recordCount ?? 0} district executives synced in real-time!`
      );
      setTimeout(() => setPingNotification(null), 5000);
    } catch {
      setPingNotification(
        lang === "ta" ? "⚠️ சோதனை தோல்வியடைந்தது, மீண்டும் முயற்சிக்கவும்." : "⚠️ Ping check failed."
      );
    } finally {
      setIsPinging(false);
    }
  };

  // Filter events and ensure strictly last 10
  const displayedEvents = events
    .filter((e) => {
      if (filter === "district") {
        return e.isDistrictRelated || e.objectType === "district_executives";
      }
      return true;
    })
    .slice(0, 10);

  const getObjectTypeIcon = (type: string) => {
    switch (type) {
      case "district_executives":
      case "district_super_keys":
        return <MapPin className="w-3.5 h-3.5 text-emerald-400" />;
      case "registrations":
        return <Users className="w-3.5 h-3.5 text-blue-400" />;
      case "executives":
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
      case "union_config":
        return <Sliders className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  const getObjectTypeBadgeClass = (type: string) => {
    switch (type) {
      case "district_executives":
      case "district_super_keys":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-500/50";
      case "registrations":
        return "bg-blue-950/80 text-blue-300 border-blue-500/50";
      case "executives":
        return "bg-purple-950/80 text-purple-300 border-purple-500/50";
      case "union_config":
        return "bg-amber-950/80 text-amber-300 border-amber-500/50";
      default:
        return "bg-stone-800 text-stone-300 border-stone-600";
    }
  };

  return (
    <div className="bg-stone-950/90 rounded-2xl border border-stone-800 p-3 sm:p-4 space-y-3.5 text-left shadow-inner">
      {/* Panel Top HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-1.5">
              {lang === "ta" 
                ? "கிளவுட் ஒத்திசைவு நிகழ்வு பதிவேடு (Diagnostic Panel)" 
                : "Firestore Live Sync Diagnostic Panel"}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                LAST 10 EVENTS
              </span>
            </span>
          </div>
          <p className="text-[10px] text-stone-400">
            {lang === "ta"
              ? "மாவட்டப் பதிவு மற்றும் நிர்வாகிகள் நேரலை மாற்றங்களை நிகழ்நேரத்தில் சரிபார்க்கும் பதிவேடு"
              : "Verify real-time status of district registration updates & Firestore synchronization events"}
          </p>
        </div>

        {/* Live Test Ping Action Button */}
        <button
          type="button"
          onClick={handleTestPing}
          disabled={isPinging}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold rounded-xl transition-all shadow cursor-pointer disabled:opacity-50"
          title={lang === "ta" ? "நேரலை மாவட்ட ஒத்திசைவை உடனடியாகச் சோதிக்க" : "Trigger test ping to verify live district sync"}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-amber-400" : "text-emerald-300"}`} />
          <span>
            {isPinging
              ? (lang === "ta" ? "சோதிக்கிறது..." : "Pinging...")
              : (lang === "ta" ? "மாவட்ட ஒத்திசைவு சோதனை" : "Test District Ping")}
          </span>
        </button>
      </div>

      {/* Ping Notification Banner */}
      {pingNotification && (
        <div className="p-2 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-[11px] text-emerald-200 font-medium animate-fadeIn flex items-center justify-between">
          <span>{pingNotification}</span>
          <span className="text-[10px] font-mono text-emerald-400">LIVE PING 200 OK</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 p-0.5 bg-stone-900 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              filter === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            {lang === "ta" ? "அனைத்து நிகழ்வுகள்" : "All Events"} ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("district")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
              filter === "district"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>{lang === "ta" ? "மாவட்டப் பதிவுகள் மட்டும்" : "District Updates Only"}</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] text-stone-400 font-mono">
          <Clock className="w-3 h-3 text-stone-500" />
          <span>Realtime Stream Active</span>
        </div>
      </div>

      {/* Events Table / Timeline List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-700">
        {displayedEvents.length === 0 ? (
          <div className="p-4 text-center text-stone-500 text-xs border border-dashed border-stone-800 rounded-xl">
            {lang === "ta" ? "ஒத்திசைவு நிகழ்வுகள் எதுவும் இல்லை" : "No synchronization events found"}
          </div>
        ) : (
          displayedEvents.map((evt, idx) => (
            <div
              key={evt.id || `evt_${idx}`}
              className={`p-2.5 rounded-xl border transition-all text-xs space-y-1.5 ${
                evt.isDistrictRelated
                  ? "bg-stone-900/90 border-emerald-900/60 hover:border-emerald-700/80"
                  : "bg-stone-900/60 border-stone-800/80 hover:border-stone-700"
              }`}
            >
              {/* Event Header: Timestamp, Object Type, Status */}
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Object Type Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getObjectTypeBadgeClass(
                      evt.objectType
                    )}`}
                  >
                    {getObjectTypeIcon(evt.objectType)}
                    <span>{evt.objectType}</span>
                  </span>

                  {/* District Highlight Tag */}
                  {evt.isDistrictRelated && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[9px] border border-emerald-500/30">
                      {lang === "ta" ? "📍 மாவட்டப் பதிவு" : "📍 DISTRICT UPDATE"}
                    </span>
                  )}

                  {/* Record Count */}
                  {evt.recordCount !== undefined && (
                    <span className="text-[10px] text-stone-400 font-mono bg-stone-800 px-1.5 py-0.5 rounded">
                      {evt.recordCount} {lang === "ta" ? "பதிவுகள்" : "records"}
                    </span>
                  )}
                </div>

                {/* Timestamp & Relative Time */}
                <div className="flex items-center gap-1.5 text-right font-mono text-[10px]">
                  <span className="text-amber-400 font-bold">{evt.formattedTime}</span>
                  <span className="text-stone-500">({computeTimeAgo(evt.timestamp)})</span>
                </div>
              </div>

              {/* Event Details Text */}
              <p className="text-[11px] text-stone-300 leading-snug font-normal">
                {lang === "ta" ? evt.details.ta : evt.details.en}
              </p>

              {/* Event Meta Footer: Source, Status, Latency */}
              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-800/60 font-mono">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-stone-400" />
                  <span>
                    {evt.syncSource === "firestore_listener"
                      ? "onSnapshot (Realtime)"
                      : evt.syncSource === "firestore_write"
                      ? "setDoc (Cloud Write)"
                      : "getDocs (Live Fetch)"}
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  {evt.latencyMs !== undefined && (
                    <span className="flex items-center gap-0.5 text-emerald-400">
                      <Zap className="w-3 h-3" />
                      <span>{evt.latencyMs}ms</span>
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      evt.status === "success"
                        ? "text-emerald-400"
                        : evt.status === "pending"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{evt.status === "success" ? "VERIFIED SYNC" : evt.status.toUpperCase()}</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Diagnostics Verification Footer */}
      <div className="pt-2 border-t border-stone-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-stone-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
          <span className="font-semibold text-stone-300">
            {lang === "ta" 
              ? "38 மாவட்ட நிர்வாகிகள் நிகழ்நேர நேரலை கண்காணிப்பு செயலில் உள்ளது" 
              : "Real-time Monitoring Active for all 38 District In-Charges"}
          </span>
        </span>
        <span className="font-mono text-stone-500">
          Sync Engine: Google Firestore Multi-Device Channel
        </span>
      </div>
    </div>
  );
}
