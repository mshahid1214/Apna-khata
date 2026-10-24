import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../services/formatters';

interface ParsedVoiceData {
  amount?: number;
  partyName?: string;
  flowType?: 'given' | 'received';
  entryType?: string;
  notes?: string;
  confidence?: 'high' | 'medium' | 'low';
}

interface VoiceInputButtonProps {
  /**
   * Field target or context (e.g. 'amount', 'party', 'note', or 'full_khata')
   */
  field?: 'amount' | 'party' | 'note' | 'full';
  onParsed: (data: ParsedVoiceData) => void;
  className?: string;
  placeholderPrompt?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  field = 'full',
  onParsed,
  className = '',
  placeholderPrompt,
}) => {
  const { speak, language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedVoiceData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ur-PK'; // Urdu (Pakistan), also handles Roman Urdu pronunciation

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('مائیکروفون کی اجازت نہیں ملی۔ آپ نیچے رومن اردو میں لکھ سکتے ہیں۔');
        } else if (event.error === 'no-speech') {
          setErrorMsg('کوئی آواز نہیں سنی گئی۔ دوبارہ کوشش کریں۔');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    setErrorMsg('');
    setTranscript('');
    setParsedResult(null);
    setIsModalOpen(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  // Process transcript with backend Gemini API
  const handleProcessTranscript = async (textToProcess?: string) => {
    const text = (textToProcess || transcript).trim();
    if (!text) {
      setErrorMsg('برائے مہربانی پہلے بولیں یا نیچے جملہ لکھیں۔');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          context: field,
        }),
      });

      const data = await res.json();
      if (data.success && data.parsed) {
        setParsedResult(data.parsed);
        const amt = data.parsed.amount;
        if (amt) {
          speak(`${amt} روپے کا اندراج مل گیا ہے، تصدیق کریں۔`);
        }
      } else {
        setErrorMsg('الفاظ کی تفہیم نہیں ہو سکی۔ برائے مہربانی دوبارہ بولیں۔');
      }
    } catch (err) {
      console.error('Failed to parse voice transcript:', err);
      setErrorMsg('سرور سے رابطہ نہیں ہو سکا۔ برائے مہربانی دستی طور پر درج کریں۔');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndApply = () => {
    if (parsedResult) {
      onParsed(parsedResult);
      setIsModalOpen(false);
      setTranscript('');
      setParsedResult(null);
    }
  };

  const promptExamples =
    placeholderPrompt ||
    'مثلاً: "پانچ ہزار روپے حاجی سلیم کو ایڈوانس دیے" یا "paanch hazaar rupay advance diya" یا "دو لاکھ روپے کھاد کے دیے"';

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={startListening}
        title="آواز سے اندراج (بول کر لکھیں)"
        className={`min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-xl border-2 border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 ${className}`}
      >
        <Mic className="w-4 h-4 text-amber-800 shrink-0" />
        <span className="text-xs hidden sm:inline">آواز سے درج کریں</span>
      </button>

      {/* Interactive Voice Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="w-full max-w-lg parchment-slip rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-[#78350F] text-stone-900 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-amber-300">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
                  <Mic className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-urdu text-stone-900">
                    آواز سے بول کر اندراج (Voice Entry)
                  </h3>
                  <p className="text-[11px] text-stone-600">
                    اردو، پنجابی یا رومن اردو میں بولیں (لکھ، کروڑ، ہزار وغیرہ)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopListening();
                  setIsModalOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center hover:bg-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prominent Warning Note Required by Policy */}
            <div className="p-2.5 bg-amber-100/90 border border-amber-300 rounded-xl flex items-start gap-2 text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div className="font-urdu leading-snug">
                <span className="font-bold">اہم یاد دہانی: </span>
                <span>
                  ہاتھ کی تحریر یا زبانی الفاظ پڑھنے میں غلطی ہو سکتی ہے۔ محفوظ کرنے سے پہلے ضرور
                  تصدیق کریں۔
                </span>
                <span className="block text-[10px] text-stone-600 font-sans mt-0.5">
                  AI can misread handwriting or speech. Always check before saving.
                </span>
              </div>
            </div>

            {/* Mic Record Animation Area */}
            <div className="text-center py-3 bg-amber-50 rounded-2xl border border-amber-200">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-18 h-18 mx-auto rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
                    : 'bg-[#78350F] text-amber-100 hover:bg-amber-900 ring-4 ring-amber-200'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <div className="mt-2.5">
                <span className="text-xs font-bold text-stone-800 block">
                  {isListening ? 'سنا جا رہا ہے... اب بولیں' : 'بولنے کے لیے مائیک دبائیں'}
                </span>
                <span className="text-[11px] text-stone-500 font-urdu">{promptExamples}</span>
              </div>
            </div>

            {/* Transcript Display / Quick Edit Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                آپ کے بولے گئے الفاظ (یا یہاں رومن اردو میں ٹائپ کریں):
              </label>
              <textarea
                rows={2}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="مثلاً: 50000 rupay advance diye haji rasool ko..."
                className="w-full p-2.5 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-sm font-urdu font-medium"
              />
            </div>

            {/* Quick Speech Chips for easy instant demo / testing */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-stone-500">فوری نمونے:</span>
              {[
                'پانچ ہزار روپے ایڈوانس دیے',
                'دو لاکھ روپے کھاد کا بنام اندراج',
                'ڈیڑھ لاکھ وصولی چونسا آم',
                '50 hazaar advance diya',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setTranscript(sample);
                    handleProcessTranscript(sample);
                  }}
                  className="text-[10px] bg-white hover:bg-amber-100 border border-stone-300 px-2 py-1 rounded-lg text-stone-800 font-urdu"
                >
                  "{sample}"
                </button>
              ))}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-900 font-bold">
                {errorMsg}
              </div>
            )}

            {/* Processing Spinner */}
            {isProcessing && (
              <div className="p-3 bg-amber-100 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
                <Loader2 className="w-4 h-4 animate-spin text-amber-800" />
                <span>جیمنائی ماڈل الفاظ کا تجزیہ کر رہا ہے...</span>
              </div>
            )}

            {/* Parsed Result Confirmation Card */}
            {parsedResult && !isProcessing && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>نکالے گئے فیلڈز (تصدیق کے لیے پیش ہے):</span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      parsedResult.confidence === 'high'
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-950 border border-amber-300'
                    }`}
                  >
                    {parsedResult.confidence === 'high' ? 'پراعتماد' : 'درمیانی اعتماد'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-urdu">
                  {parsedResult.amount !== undefined && (
                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-stone-500 block">رقم (Amount):</span>
                      <span className="font-bold font-mono text-emerald-950 text-sm">
                        <bdi dir="ltr">{formatPKR(parsedResult.amount, language)}</bdi>
                      </span>
                    </div>
                  )}

                  {parsedResult.partyName && (
                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-stone-500 block">فریق کا نام:</span>
                      <span className="font-bold text-stone-900">{parsedResult.partyName}</span>
                    </div>
                  )}

                  {parsedResult.flowType && (
                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-stone-500 block">رخ (Flow):</span>
                      <span className="font-bold text-stone-900">
                        {parsedResult.flowType === 'given' ? 'بنام / دیا (Debit)' : 'جمع / لیا (Credit)'}
                      </span>
                    </div>
                  )}

                  {parsedResult.entryType && (
                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-stone-500 block">نوعیت:</span>
                      <span className="font-bold text-stone-900">{parsedResult.entryType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 border-t border-amber-200 flex items-center gap-2.5">
              {!parsedResult ? (
                <button
                  type="button"
                  disabled={isProcessing || !transcript.trim()}
                  onClick={() => handleProcessTranscript()}
                  className="w-full min-h-[50px] bg-[#78350F] hover:bg-amber-900 disabled:opacity-50 text-amber-50 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>الفاظ کا تجزیہ کریں (Parse Voice)</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedResult(null);
                      setTranscript('');
                    }}
                    className="flex-1 min-h-[48px] bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs"
                  >
                    دوبارہ بولیں
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndApply}
                    className="flex-1 min-h-[48px] bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>فارم میں منتقل کریں</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
