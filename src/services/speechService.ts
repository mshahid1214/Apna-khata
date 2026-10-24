/**
 * Web Speech API service for Apna Khata
 * Provides Urdu native voice synthesis with Roman Urdu phonetics fallback
 * and visual synchronization events.
 */

type SpeechCallback = (state: { isSpeaking: boolean; currentText: string }) => void;

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<SpeechCallback> = new Set();
  private isUrduVoiceSupported = false;
  private hasInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.isUrduVoiceSupported = voices.some(
      (v) => v.lang.startsWith('ur') || v.lang === 'ur-PK' || v.lang === 'ur-IN'
    );
    this.hasInitialized = true;
  }

  public subscribe(cb: SpeechCallback) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(isSpeaking: boolean, currentText: string) {
    this.listeners.forEach((cb) => cb({ isSpeaking, currentText }));
  }

  public getUrduSupport(): boolean {
    if (!this.hasInitialized) {
      this.initVoices();
    }
    return this.isUrduVoiceSupported;
  }

  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.notify(false, '');
  }

  /**
   * Speak content aloud.
   * If native Urdu voice exists, uses Urdu utterance.
   * Otherwise uses phonetic Roman Urdu fallback with available Hindi or English voice.
   */
  public speak(
    urduText: string,
    romanUrduFallback?: string,
    englishFallback?: string,
    preferredLang: 'ur' | 'ur-Latn' | 'en' = 'ur'
  ) {
    if (!this.synth) return;

    this.stop();

    const voices = this.synth.getVoices();
    const urduVoice = voices.find(
      (v) => v.lang.startsWith('ur') || v.lang === 'ur-PK' || v.lang === 'ur-IN'
    );
    const hindiVoice = voices.find(
      (v) => v.lang.startsWith('hi') || v.lang === 'hi-IN'
    );
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en')
    );

    let textToSpeak = urduText;
    let selectedVoice = urduVoice;
    let speechLang = 'ur-PK';

    if (preferredLang === 'en' && englishFallback) {
      textToSpeak = englishFallback;
      selectedVoice = englishVoice;
      speechLang = 'en-US';
    } else if (urduVoice) {
      textToSpeak = urduText;
      selectedVoice = urduVoice;
      speechLang = 'ur-PK';
    } else {
      // Confirmed Decision: Fallback to Roman Urdu phonetics using Hindi or English voice
      textToSpeak = romanUrduFallback || urduText;
      selectedVoice = hindiVoice || englishVoice;
      speechLang = hindiVoice ? 'hi-IN' : 'en-US';
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = speechLang;
    utterance.rate = 0.9; // Slightly slower for low-literacy clarity
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.notify(true, urduText);
    };

    utterance.onend = () => {
      this.notify(false, '');
    };

    utterance.onerror = () => {
      this.notify(false, '');
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }
}

export const speechService = new SpeechService();
