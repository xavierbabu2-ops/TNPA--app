/**
 * Safe Web Speech API Helper
 * Prevents "TypeError: Illegal constructor" crashes across mobile browsers,
 * WebViews (iOS/Android), and environments where SpeechRecognition or
 * SpeechSynthesisUtterance are non-constructible or restricted.
 */

export interface SafeSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean, rawEvent: any) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

export interface SafeSpeechRecognitionHandle {
  recognition: any;
  start: () => boolean;
  stop: () => void;
  abort: () => void;
}

/**
 * Check if Speech Recognition is supported and constructible in the current environment
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return typeof SpeechRecClass === "function";
  } catch {
    return false;
  }
}

/**
 * Safely create a SpeechRecognition instance with event handlers wrapped in error guards.
 * Returns null if unsupported or if constructor throws "Illegal constructor".
 */
export function createSafeSpeechRecognition(options: SafeSpeechRecognitionOptions = {}): SafeSpeechRecognitionHandle | null {
  if (typeof window === "undefined") return null;

  try {
    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (typeof SpeechRecClass !== "function") {
      return null;
    }

    // Try constructing instance inside try-catch to catch "Illegal constructor"
    let recognition: any = null;
    try {
      recognition = new SpeechRecClass();
    } catch (constructErr) {
      console.warn("[SafeSpeech] SpeechRecognition constructor failed or illegal:", constructErr);
      return null;
    }

    if (!recognition) return null;

    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? false;
    recognition.lang = options.lang || "ta-IN";

    if (options.onStart) {
      recognition.onstart = () => {
        try {
          options.onStart?.();
        } catch (e) {
          console.warn("[SafeSpeech] onStart error:", e);
        }
      };
    }

    recognition.onresult = (event: any) => {
      try {
        const results = event?.results;
        if (!results || results.length === 0) return;
        const lastResult = results[results.length - 1];
        const transcript = lastResult?.[0]?.transcript || "";
        const isFinal = Boolean(lastResult?.isFinal);
        options.onResult?.(transcript, isFinal, event);
      } catch (e) {
        console.warn("[SafeSpeech] onResult parsing error:", e);
      }
    };

    recognition.onerror = (event: any) => {
      try {
        console.warn("[SafeSpeech] recognition error event:", event?.error || event);
        options.onError?.(event);
      } catch (e) {
        console.warn("[SafeSpeech] onError callback error:", e);
      }
    };

    recognition.onend = () => {
      try {
        options.onEnd?.();
      } catch (e) {
        console.warn("[SafeSpeech] onEnd callback error:", e);
      }
    };

    return {
      recognition,
      start: () => {
        try {
          recognition.start();
          return true;
        } catch (e) {
          console.warn("[SafeSpeech] recognition.start() failed:", e);
          options.onError?.(e);
          return false;
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          console.warn("[SafeSpeech] recognition.stop() failed:", e);
        }
      },
      abort: () => {
        try {
          recognition.abort();
        } catch (e) {
          console.warn("[SafeSpeech] recognition.abort() failed:", e);
        }
      }
    };
  } catch (err) {
    console.warn("[SafeSpeech] createSafeSpeechRecognition unexpected error:", err);
    return null;
  }
}

/**
 * Check if Speech Synthesis is supported in the current environment
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const hasSynth = "speechSynthesis" in window && typeof window.speechSynthesis?.speak === "function";
    const hasUtterance = "SpeechSynthesisUtterance" in window && typeof (window as any).SpeechSynthesisUtterance === "function";
    return hasSynth && hasUtterance;
  } catch {
    return false;
  }
}

/**
 * Safely cancels any ongoing speech synthesis
 */
export function safeCancelSpeech(): void {
  if (typeof window === "undefined") return;
  try {
    if ("speechSynthesis" in window && typeof window.speechSynthesis?.cancel === "function") {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    console.warn("[SafeSpeech] cancel speech failed:", e);
  }
}

export interface SafeSpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Defensive Speech Synthesis Voice Output
 * Cleans text and wraps all instantiation and playback calls in safe guards.
 */
export function safeSpeak(text: string, options: SafeSpeakOptions = {}): boolean {
  if (typeof window === "undefined" || !text || !text.trim()) return false;

  try {
    if (!("speechSynthesis" in window) || typeof window.speechSynthesis?.speak !== "function") {
      console.warn("[SafeSpeech] window.speechSynthesis is not available");
      options.onError?.(new Error("Speech synthesis not available"));
      return false;
    }

    if (!("SpeechSynthesisUtterance" in window) || typeof (window as any).SpeechSynthesisUtterance !== "function") {
      console.warn("[SafeSpeech] SpeechSynthesisUtterance is not a constructible function");
      options.onError?.(new Error("SpeechSynthesisUtterance not constructible"));
      return false;
    }

    // Cancel existing queued speech
    safeCancelSpeech();

    // Clean text: strip emojis, parenthetical emoji descriptions, asterisks, bullet points
    const cleanText = text
      .replace(/\([^)]+\)/g, " ")
      .replace(/[*#●_~`]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return false;

    // Instantiate inside try-catch to guard against "TypeError: Illegal constructor"
    let utterance: SpeechSynthesisUtterance;
    try {
      const UtteranceClass = (window as any).SpeechSynthesisUtterance;
      utterance = new UtteranceClass(cleanText);
    } catch (constructErr) {
      console.warn("[SafeSpeech] SpeechSynthesisUtterance constructor error:", constructErr);
      options.onError?.(constructErr);
      return false;
    }

    if (!utterance) return false;

    utterance.lang = options.lang || "ta-IN";
    if (typeof options.rate === "number") utterance.rate = options.rate;
    if (typeof options.pitch === "number") utterance.pitch = options.pitch;
    if (typeof options.volume === "number") utterance.volume = options.volume;

    utterance.onstart = () => {
      try {
        options.onStart?.();
      } catch (e) {
        console.warn("[SafeSpeech] utterance.onstart error:", e);
      }
    };

    utterance.onend = () => {
      try {
        options.onEnd?.();
      } catch (e) {
        console.warn("[SafeSpeech] utterance.onend error:", e);
      }
    };

    utterance.onerror = (err) => {
      try {
        console.warn("[SafeSpeech] utterance.onerror:", err);
        options.onError?.(err);
      } catch (e) {
        console.warn("[SafeSpeech] utterance.onerror handler exception:", e);
      }
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn("[SafeSpeech] safeSpeak general error:", err);
    try {
      options.onError?.(err);
    } catch {}
    return false;
  }
}
