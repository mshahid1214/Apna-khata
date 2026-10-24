import React, { useState } from 'react';
import { Lot, LotStage, LotTimelineEvent, Role } from '../types';
import { lotRepository } from '../repositories/lotRepository';
import { useApp } from '../context/AppContext';
import {
  X,
  Volume2,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  PlusCircle,
  AlertCircle,
  FileText,
  Calendar,
  Lock,
  Camera,
  Navigation,
} from 'lucide-react';

interface LotTimelineModalProps {
  lot: Lot | null;
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: () => void;
}

export const LotTimelineModal: React.FC<LotTimelineModalProps> = ({
  lot,
  isOpen,
  onClose,
  onEventAdded,
}) => {
  const { currentRole, t, speak } = useApp();
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Form State for new timeline event
  const [selectedStage, setSelectedStage] = useState<LotStage>('graded');
  const [locationInput, setLocationInput] = useState('');
  const [gpsInput, setGpsInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [recordedByName, setRecordedByName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !lot) return null;

  const handleReadAloud = () => {
    const summary = `${lot.variety}، لاٹ نمبر ${lot.lotNumber} کی ٹائم لائن۔ کل ${lot.timeline.length} سنگ میل درج ہیں۔ آخری واقعہ: ${lot.timeline[lot.timeline.length - 1]?.stageTitleUr}، بمقام ${lot.timeline[lot.timeline.length - 1]?.location}۔`;
    speak(summary);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
          setGpsInput(coords);
          if (!locationInput) setLocationInput('موجودہ مقام (GPS Coordinates)');
        },
        () => {
          setGpsInput('30.1575° N, 71.5249° E');
        }
      );
    } else {
      setGpsInput('30.1575° N, 71.5249° E');
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    setIsSubmitting(true);
    try {
      const stageTitles: Record<LotStage, { ur: string; en: string }> = {
        harvested: { ur: 'فصل چنائی / کٹائی (Harvested)', en: 'Harvested' },
        graded: { ur: 'چھانٹی و درجہ بندی (Graded & Packed)', en: 'Graded & Packed' },
        stored: { ur: 'کولڈ اسٹوریج آمد و تحفظ (Cold Stored)', en: 'Cold Stored' },
        loaded: { ur: 'گاڑی میں لوڈنگ و روانگی (Loaded)', en: 'Loaded for Transit' },
        delivered: { ur: 'منزل پر سپردگی و تصدیق (Delivered)', en: 'Delivered' },
      };

      const now = new Date();
      const timeStr = `${now.toLocaleDateString('en-GB')}، ${now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })}`;

      await lotRepository.addTimelineEvent(lot.id, {
        stage: selectedStage,
        stageTitleUr: stageTitles[selectedStage].ur,
        stageTitleEn: stageTitles[selectedStage].en,
        timestamp: timeStr,
        location: locationInput.trim(),
        gpsPin: gpsInput.trim() || undefined,
        recordedBy: recordedByName.trim() || `${t.roles[currentRole]?.title || currentRole} صارف`,
        recordedByRole: currentRole,
        notes: notesInput.trim() || undefined,
      });

      speak('نئی پیش رفت ٹائم لائن میں کامیابی سے درج ہو گئی۔');
      setIsAddingEvent(false);
      setLocationInput('');
      setGpsInput('');
      setNotesInput('');
      setRecordedByName('');
      onEventAdded();
    } catch (err) {
      console.error('Failed to add timeline event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="max-w-2xl w-full parchment-slip rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-[#78350F] max-h-[92vh] overflow-y-auto text-stone-900 animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                غیر مٹائی جانے والی ٹائم لائن (Append-Only)
              </span>
              <span className="text-xs font-mono font-bold text-stone-500">
                {lot.lotNumber}
              </span>
            </div>
            <h3 className="text-2xl font-bold font-urdu text-stone-900 mt-0.5">
              {lot.variety} — پیش رفت ٹائم لائن
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReadAloud}
              type="button"
              className="min-h-[44px] px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-800 shrink-0" />
              <span>سنیں</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Append-Only Rule Notice */}
        <div className="my-3 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-stone-700">
          <Lock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <p>
            <strong>غیر متبدل ریکارڈ اصول:</strong> ٹائم لائن پر درج واقعات کو تبدیل یا حذف نہیں کیا جا سکتا۔ کسی تصحیح یا تبدیلی کی صورت میں نئی انٹری کے ذریعے وضاحت درج کی جاتی ہے۔
          </p>
        </div>

        {/* Add Event Form Toggle / Form */}
        <div className="my-3">
          {!isAddingEvent ? (
            <button
              onClick={() => setIsAddingEvent(true)}
              type="button"
              className="w-full min-h-[50px] p-3 rounded-2xl bg-[#78350F] hover:bg-amber-900 text-amber-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
            >
              <PlusCircle className="w-5 h-5 text-amber-300" />
              <span>نئی پیش رفت درج کریں (Add Timeline Event)</span>
            </button>
          ) : (
            <form onSubmit={handleSaveEvent} className="p-4 rounded-2xl bg-white border-2 border-[#78350F] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h4 className="font-bold text-stone-900 font-urdu text-sm">
                  نیا ٹائم لائن واقعہ شامل کریں
                </h4>
                <button
                  onClick={() => setIsAddingEvent(false)}
                  type="button"
                  className="text-xs text-stone-500 hover:text-stone-800 font-bold"
                >
                  منسوخ کریں
                </button>
              </div>

              {/* Stage Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  پیش رفت کا مرحلہ (Stage) *
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value as LotStage)}
                  className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
                >
                  <option value="graded">چھانٹی و درجہ بندی (Graded & Packed)</option>
                  <option value="stored">کولڈ اسٹوریج آمد و تحفظ (Cold Stored)</option>
                  <option value="loaded">گاڑی میں لوڈنگ (Loaded for Transit)</option>
                  <option value="delivered">منزل پر سپردگی و تصدیق (Delivered)</option>
                  <option value="harvested">فصل چنائی اضافی ریکارڈ (Harvested)</option>
                </select>
              </div>

              {/* Location & GPS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    مقام / منڈی / گودام *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="مثلاً: الحمد کولڈ اسٹوریج، خانیوال"
                    className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      GPS پن (اختیاری)
                    </label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="text-[10px] font-bold text-[#78350F] hover:underline flex items-center gap-0.5"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>GPS لیں</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={gpsInput}
                    onChange={(e) => setGpsInput(e.target.value)}
                    placeholder="30.1575° N, 71.5249° E"
                    className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Recorded By */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  درج کرنے والے کا نام و عہدہ *
                </label>
                <input
                  type="text"
                  required
                  value={recordedByName}
                  onChange={(e) => setRecordedByName(e.target.value)}
                  placeholder={`مثلاً: محمد اکبر (سپر وائزر) یا ${t.roles[currentRole]?.title}`}
                  className="w-full h-11 px-3 rounded-xl border-2 border-stone-300 bg-white text-xs font-bold"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  تفصیل / ریمارکس / گاڑی یا چالان نمبر
                </label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="مثلاً: ٹمپریچر 12 سینٹی گریڈ، چالان # 402، یا گاڑی نمبر LHR-8924..."
                  className="w-full p-2.5 rounded-xl border-2 border-stone-300 bg-white text-xs font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="min-h-[44px] px-4 rounded-xl bg-stone-200 text-stone-800 text-xs font-bold"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] px-5 rounded-xl bg-[#78350F] hover:bg-amber-900 text-amber-50 text-xs font-bold"
                >
                  {isSubmitting ? 'درج ہو رہا ہے...' : 'محفوظ کریں ✓'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Timeline Events List (Chronological) */}
        <div className="my-4 space-y-4">
          <h4 className="font-bold text-stone-900 font-urdu text-sm border-b border-stone-300 pb-1">
            مکمل تاریخی واقعات ({lot.timeline.length}):
          </h4>

          <div className="relative border-s-2 border-amber-800/40 ms-4 space-y-6">
            {lot.timeline.map((evt, idx) => (
              <div key={evt.id || idx} className="relative ps-6">
                {/* Milestone Node Icon */}
                <div className="absolute -start-[17px] top-0 w-8 h-8 rounded-full bg-amber-100 border-2 border-[#78350F] flex items-center justify-center text-xs font-bold text-[#78350F] shadow-xs">
                  {idx + 1}
                </div>

                {/* Event Card */}
                <div className="bg-white/90 p-4 rounded-2xl border border-stone-300 shadow-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-stone-200">
                    <h5 className="font-bold text-base font-urdu text-stone-900">
                      {evt.stageTitleUr}
                    </h5>
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{evt.timestamp}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-800 shrink-0" />
                      <span className="font-medium truncate">
                        <strong>مقام:</strong> {evt.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-amber-800 shrink-0" />
                      <span className="font-medium truncate">
                        <strong>درج کنندہ:</strong> {evt.recordedBy}
                      </span>
                    </div>
                  </div>

                  {evt.gpsPin && (
                    <div className="text-[11px] font-mono text-stone-500 ps-5">
                      GPS: {evt.gpsPin}
                    </div>
                  )}

                  {evt.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-stone-800 font-medium leading-relaxed">
                      {evt.notes}
                    </div>
                  )}

                  {evt.biltyId && (
                    <div className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg inline-block">
                      ٹرانسپورٹ بلٹی لنکڈ
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="mt-4 pt-3 border-t-2 border-stone-800">
          <button
            onClick={onClose}
            type="button"
            className="w-full min-h-[50px] bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-2xl text-sm"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};
