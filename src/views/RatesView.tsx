import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Commodity, RateSettings } from '../types';
import { COMMODITY_KEYS } from '../constants/app';
import { formatPKR } from '../services/formatters';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  Volume2,
  Info,
  Building2,
  Bell,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { defaultPriceProvider, CropMarketData } from '../services/priceProvider';
import { CropRateCard } from '../components/CropRateCard';
import { CropRateDetailModal } from '../components/CropRateDetailModal';
import { priceAlertRepository, PriceAlert } from '../repositories/priceAlertRepository';

export const RatesView: React.FC = () => {
  const { settings, saveSettings, t, language, speak } = useApp();
  const [localSettings, setLocalSettings] = useState<RateSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  // Market Price Provider State
  const [marketPrices, setMarketPrices] = useState<Record<Commodity, CropMarketData> | null>(null);
  const [loadingMarket, setLoadingMarket] = useState<boolean>(true);
  const [selectedCropData, setSelectedCropData] = useState<CropMarketData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Active Price Alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'market' | 'settings'>('market');

  const loadData = async () => {
    try {
      setLoadingMarket(true);
      const data = await defaultPriceProvider.getAllCropPrices();
      setMarketPrices(data);

      // Check price alerts against current averages
      const currentAvg: Record<Commodity, number> = {
        mango: data.mango.overallAvg,
        citrus: data.citrus.overallAvg,
        dates: data.dates.overallAvg,
        cotton: data.cotton.overallAvg,
      };
      const checkedAlerts = await priceAlertRepository.checkAlerts(currentAvg);
      setAlerts(checkedAlerts);
    } catch (err) {
      console.error('Error loading market prices:', err);
    } finally {
      setLoadingMarket(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = (cropData: CropMarketData) => {
    setSelectedCropData(cropData);
    setIsDetailOpen(true);
  };

  const handleOpenAlertModal = (cropData: CropMarketData) => {
    setSelectedCropData(cropData);
    setIsDetailOpen(true);
  };

  const handleDeleteAlert = async (id: string) => {
    await priceAlertRepository.delete(id);
    const updated = await priceAlertRepository.getAll();
    setAlerts(updated);
    speak('الرٹ کامیابی سے حذف ہو گیا۔');
  };

  const handleRateChange = (crop: Commodity, value: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      cropRates: {
        ...prev.cropRates,
        [crop]: {
          ...prev.cropRates[crop],
          ratePerManPKR: value,
        },
      },
    }));
    setIsSaved(false);
  };

  const handleConfigChange = (key: keyof RateSettings, value: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(localSettings);
    setIsSaved(true);
    speak('ریٹس اور ترتیبات کامیابی سے محفوظ ہو گئیں۔');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReadRates = () => {
    if (marketPrices) {
      const urduSpeech = `آج کے منڈی ریٹس۔ آم چونسا اوسط ${marketPrices.mango.overallAvg} روپے۔ کنو مالٹا اوسط ${marketPrices.citrus.overallAvg} روپے۔ کھجور اصیل اوسط ${marketPrices.dates.overallAvg} روپے۔ کپاس پھٹی اوسط ${marketPrices.cotton.overallAvg} روپے۔ ماخذ: نمونہ منڈی سروے ملتان، لاہور، فیصل آباد۔`;
      const romanSpeech = `Aaj ke mandi rates. Aam ${marketPrices.mango.overallAvg}. Kinnow ${marketPrices.citrus.overallAvg}. Khajoor ${marketPrices.dates.overallAvg}. Kapaas ${marketPrices.cotton.overallAvg} rupees fi man. Multan, Lahore, Faisalabad mandis.`;
      speak(urduSpeech, romanSpeech);
    } else {
      const r = localSettings.cropRates;
      const urduSpeech = `آج کے ذاتی کھاتہ ریٹس۔ آم چونسا ${r.mango.ratePerManPKR} روپے۔ کنو ${r.citrus.ratePerManPKR} روپے۔ کھجور اصیل ${r.dates.ratePerManPKR} روپے۔ کپاس پھٹی ${r.cotton.ratePerManPKR} روپے۔`;
      speak(urduSpeech);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner */}
      <div className="parchment-slip rounded-3xl p-5 border-2 border-amber-300 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-600 font-semibold">
              یومیہ مارکیٹ بھاؤ و منڈی موازنہ
            </span>
            <h2 className="text-2xl font-bold font-urdu text-stone-900">{t.rates.title}</h2>
          </div>
          <button
            onClick={handleReadRates}
            type="button"
            className="min-h-[44px] px-3.5 py-2 bg-amber-800 text-amber-100 hover:bg-amber-700 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{t.actions.listenAudio}</span>
          </button>
        </div>

        {/* Navigation Tabs between Live Wholesale Market and Personal Khata Settings */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-300">
          <button
            onClick={() => setActiveTab('market')}
            type="button"
            className={`min-h-[48px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'market'
                ? 'bg-[#78350F] text-amber-50 shadow-sm'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>ہول سیل منڈی ریٹس (Wholesale)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            type="button"
            className={`min-h-[48px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-[#78350F] text-amber-50 shadow-sm'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ذاتی کھاتہ ریٹس و فارمولا</span>
          </button>
        </div>

        {/* Notice of Data Integrity & Source */}
        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-stone-700">
          <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <p>
            {activeTab === 'market'
              ? 'مندرجہ ذیل ریٹس ملتان، لاہور اور فیصل آباد غلہ و فروٹ منڈیوں کے یومیہ ہول سیل سروے پر مبنی ہیں۔ ہر فصل کے نیچے ماخذ اور آخری اپ ڈیٹ درج ہے۔'
              : t.rates.mandiNotice}
          </p>
        </div>
      </div>

      {/* VIEW TAB 1: WHOLESALE MARKET RATES */}
      {activeTab === 'market' && (
        <div className="space-y-4">
          {/* Active Price Alerts Bar */}
          {alerts.length > 0 && (
            <div className="parchment-slip rounded-2xl p-4 border-2 border-amber-300 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-amber-200">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
                  <Bell className="w-4 h-4 text-amber-800" />
                  <span>آپ کے سیٹ کردہ ریٹ الرٹس (Price Alerts):</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                  {alerts.length} الرٹس فعال
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {alerts.map((alt) => {
                  const cropName =
                    alt.commodity === 'mango'
                      ? 'آم چونسا'
                      : alt.commodity === 'citrus'
                      ? 'کنو مالٹا'
                      : alt.commodity === 'dates'
                      ? 'کھجور اصیل'
                      : 'کپاس پھٹی';

                  return (
                    <div
                      key={alt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        alt.isTriggered
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                          : 'bg-white border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {alt.isTriggered ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Bell className="w-4 h-4 text-amber-700 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-xs font-urdu">
                            {cropName} — ہدف: <bdi dir="ltr">Rs. {alt.targetPrice}</bdi>
                          </div>
                          <div className="text-[10px] text-stone-500 font-medium">
                            {alt.condition === 'above' ? 'قیمت اوپر جانے پر' : 'قیمت نیچے گرنے پر'}
                            {alt.isTriggered && ' • (حد پار ہو چکی ہے!)'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAlert(alt.id)}
                        type="button"
                        className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-rose-100 hover:text-rose-700 text-stone-500 flex items-center justify-center transition-colors"
                        title="الرٹ ختم کریں"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4 Commodity Wholesale Cards */}
          {loadingMarket && !marketPrices ? (
            <div className="parchment-slip rounded-3xl p-8 border-2 border-amber-300 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-800 animate-spin mx-auto" />
              <p className="text-sm font-bold text-stone-700 font-urdu">
                ملتان، لاہور اور فیصل آباد منڈیوں سے تازہ ترین بھاؤ حاصل ہو رہے ہیں...
              </p>
            </div>
          ) : marketPrices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CropRateCard
                data={marketPrices.mango}
                onOpenDetail={handleOpenDetail}
                onOpenAlertModal={handleOpenAlertModal}
              />
              <CropRateCard
                data={marketPrices.citrus}
                onOpenDetail={handleOpenDetail}
                onOpenAlertModal={handleOpenAlertModal}
              />
              <CropRateCard
                data={marketPrices.dates}
                onOpenDetail={handleOpenDetail}
                onOpenAlertModal={handleOpenAlertModal}
              />
              <CropRateCard
                data={marketPrices.cotton}
                onOpenDetail={handleOpenDetail}
                onOpenAlertModal={handleOpenAlertModal}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW TAB 2: PERSONAL KHATA SETTINGS & FORMULAS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSave} className="space-y-4">
          {/* Commodity Rate Cards Grid */}
          <div className="space-y-3">
            <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-700">
              یہ ریٹس آپ کے اپنے کھاتہ اور سودوں کے خودکار حساب کتاب (ڈیفالٹ پرچی ریٹ) کے لیے استعمال ہوتے ہیں۔
            </div>

            {COMMODITY_KEYS.map((k) => {
              const crop = localSettings.cropRates[k];
              if (!crop) return null;

              return (
                <div
                  key={k}
                  className="parchment-slip rounded-2xl p-4 border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0">
                      {k === 'mango' && '🥭'}
                      {k === 'citrus' && '🍊'}
                      {k === 'dates' && '🌴'}
                      {k === 'cotton' && '☁️'}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-stone-900 font-urdu">{crop.nameUr}</h4>
                      <p className="text-xs text-stone-500">
                        {crop.varieties.join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="text-end">
                      <span className="text-[10px] text-stone-500 font-semibold block">
                        ریٹ فی من (PKR)
                      </span>
                      <input
                        type="number"
                        dir="ltr"
                        value={crop.ratePerManPKR}
                        onChange={(e) => handleRateChange(k, parseFloat(e.target.value) || 0)}
                        className="w-28 sm:w-32 h-11 px-2.5 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-mono font-bold text-stone-950 text-end"
                      />
                    </div>

                    {/* Trend Indicator */}
                    <div
                      className="p-2 rounded-xl bg-stone-100 border border-stone-200"
                      title={
                        crop.marketTrend === 'up'
                          ? t.rates.trendUp
                          : crop.marketTrend === 'down'
                          ? t.rates.trendDown
                          : t.rates.trendStable
                      }
                    >
                      {crop.marketTrend === 'up' && (
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      )}
                      {crop.marketTrend === 'down' && (
                        <TrendingDown className="w-5 h-5 text-rose-600" />
                      )}
                      {crop.marketTrend === 'stable' && (
                        <Minus className="w-5 h-5 text-stone-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global Mandi Calculation Settings */}
          <div className="parchment-slip rounded-2xl p-5 border-2 border-amber-300 shadow-xs space-y-3.5">
            <h3 className="font-bold text-base text-stone-900 font-urdu border-b border-amber-200 pb-2">
              {t.rates.configHeader}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {t.rates.manWeightLabel} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  dir="ltr"
                  value={localSettings.manKgWeight}
                  onChange={(e) => handleConfigChange('manKgWeight', parseFloat(e.target.value) || 40)}
                  className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-mono font-bold"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  معمولاً 40 کلو، ملتان غلہ منڈی میں بعض اوقات 40.85 کلو مستعمل ہے۔
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {t.rates.commissionPercentLabel}
                </label>
                <input
                  type="number"
                  step="0.5"
                  dir="ltr"
                  value={localSettings.defaultCommissionPercent}
                  onChange={(e) => handleConfigChange('defaultCommissionPercent', parseFloat(e.target.value) || 0)}
                  className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-mono font-bold"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  آڑھتی کی روایتی کمیشن شرح (معمولاً 3 سے 5 فیصد)۔
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {t.rates.kantaFeeLabel}
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={localSettings.defaultKantaFeePKR}
                  onChange={(e) => handleConfigChange('defaultKantaFeePKR', parseFloat(e.target.value) || 0)}
                  className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {t.rates.laborFeeLabel}
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={localSettings.defaultLaborPerManPKR}
                  onChange={(e) => handleConfigChange('defaultLaborPerManPKR', parseFloat(e.target.value) || 0)}
                  className="w-full h-12 px-3 rounded-xl border-2 border-stone-300 focus:border-[#78350F] bg-white text-base font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Save CTA Button (Min 56px touch target) */}
          <div>
            <button
              type="submit"
              className="w-full min-h-[58px] p-4 bg-[#78350F] hover:bg-amber-900 text-amber-50 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98"
            >
              <Save className="w-5 h-5 text-amber-300 shrink-0" />
              <span>{isSaved ? 'ترتیبات محفوظ ہو گئیں! ✓' : t.rates.saveRates}</span>
            </button>
          </div>
        </form>
      )}

      {/* Detail Modal: 3-City Comparison Table, 30-day Chart, Rule Hint, and Price Alert */}
      <CropRateDetailModal
        data={selectedCropData}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAlertCreated={() => {
          priceAlertRepository.getAll().then(setAlerts);
        }}
      />
    </div>
  );
};

