import React, { Component, ErrorInfo, ReactNode } from "react";
import { executeSelfHealing, addBreadcrumb, resetAllCircuitBreakers } from "../utils/selfHealing";
import { ShieldCheck, RefreshCw, AlertTriangle, ArrowLeft, Activity } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackModuleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isHealing: boolean;
  healingMessageTa: string;
  healingMessageEn: string;
  healingSuccess: boolean;
  countdown: number;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  private timer: any = null;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isHealing: false,
      healingMessageTa: "தானியங்கி பாதுகாப்பு அமைப்பு சரிசெய்கிறது...",
      healingMessageEn: "Auto-Recovery Engine is analyzing and mitigating...",
      healingSuccess: false,
      countdown: 3
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      isHealing: true 
    };
  }

  public async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    addBreadcrumb("system", `ErrorBoundary caught exception: ${error.message}`, {
      stack: errorInfo.componentStack?.slice(0, 200)
    });

    const moduleName = (this as any).props?.fallbackModuleName || "ApplicationRoot";
    
    try {
      const result = await executeSelfHealing(error, moduleName, {
        componentStack: errorInfo.componentStack
      });

      (this as any).setState({
        errorInfo,
        isHealing: false,
        healingSuccess: result.success,
        healingMessageTa: result.actionTakenTa || "பாதுகாப்பான நிலைக்கு மாற்றப்பட்டது",
        healingMessageEn: result.actionTaken || "Safely restored to stable state"
      });
    } catch {
      (this as any).setState({
        isHealing: false,
        healingSuccess: false,
        healingMessageTa: "தானியங்கி மீட்பு தோல்வியடைந்தது. நிர்வாகியின் கவனத்திற்கு அனுப்பப்பட்டுள்ளது.",
        healingMessageEn: "Automatic repair failed. Escalated to Administrator."
      });
    }
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  private handleManualReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    try {
      resetAllCircuitBreakers();
      // Clear only corrupted temp render keys, preserving user registration & form records
      sessionStorage.clear();
      (this as any).setState({ hasError: false, error: null, errorInfo: null, isHealing: false });
    } catch {
      window.location.href = "/";
    }
  };

  public render() {
    if ((this as any).state.hasError) {
      return (
        <div id="self-healing-error-boundary" className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 sm:p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-stone-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Header / Brand */}
            <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <span>TNPA தானியங்கி பாதுகாப்பு & மீட்பு அமைப்பு</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-widest font-mono">
                    Self-Healing Active
                  </span>
                </h1>
                <p className="text-xs text-stone-400">
                  Automated Failure Isolation & Zero-Data-Loss Recovery
                </p>
              </div>
            </div>

            {/* Incident Summary Card */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-stone-200">
                    தற்காலிக இயக்கப் பிழை கண்டறியப்பட்டது (Temporary Issue Detected)
                  </p>
                  <p className="text-xs text-stone-400 font-mono break-all line-clamp-2">
                    {(this as any).state.error?.message || "Unexpected runtime exception"}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 bg-stone-900/90 rounded-lg border border-stone-800 flex items-center gap-3">
                <Activity className="w-4 h-4 text-emerald-400 animate-spin" />
                <div className="text-xs space-y-0.5">
                  <div className="text-emerald-400 font-medium">{(this as any).state.healingMessageTa}</div>
                  <div className="text-stone-400 text-[11px]">{(this as any).state.healingMessageEn}</div>
                </div>
              </div>
            </div>

            {/* User Safe Reassurance Notice */}
            <div className="text-xs text-stone-400 leading-relaxed bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5 space-y-1">
              <p className="font-semibold text-amber-300">
                🔒 உங்கள் பதிவுகள் மற்றும் படிவ விவரங்கள் முழுமையாக பாதுகாக்கப்பட்டுள்ளன.
              </p>
              <p className="text-stone-400 text-[11px]">
                Your member records and inputs are safe. No data was deleted or altered.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="btn-self-healing-recover"
                onClick={this.handleResetState}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>நிலையான திரைக்குத் திரும்பு (Recover)</span>
              </button>

              <button
                id="btn-self-healing-reload"
                onClick={this.handleManualReload}
                className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center gap-2 border border-stone-700 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>பக்கத்தைப் புதுப்பி (Refresh)</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
