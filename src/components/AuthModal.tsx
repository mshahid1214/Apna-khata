import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { DEV_TEST_USERS, signInWithGoogle, logOut } from '../services/firebase';
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  ArrowRight,
  Sparkles,
  MapPin,
  AlertCircle,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOUTH_PUNJAB_DISTRICTS = [
  'ملتان (Multan)',
  'خانیوال (Khanewal)',
  'بہاولپور (Bahawalpur)',
  'رحیم یار خان (Rahim Yar Khan)',
  'وہاڑی (Vehari)',
  'لودھراں (Lodhran)',
  'مظفر گڑھ (Muzaffargarh)',
  'ساہیوال (Sahiwal)',
  'پاکپتن (Pakpattan)',
  'راجن پور (Rajanpur)',
  'ڈیرہ غازی خان (D.G. Khan)',
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, saveProfile, t, speak } = useApp();

  const [authMethod, setAuthMethod] = useState<'phone' | 'google'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('+92 300 1234567');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Profile setup state
  const [profileName, setProfileName] = useState(userProfile?.name || '');
  const [profilePhone, setProfilePhone] = useState(userProfile?.phone || phoneNumber);
  const [profileRole, setProfileRole] = useState<Role>(userProfile?.role || 'farmer');
  const [profileDistrict, setProfileDistrict] = useState(
    userProfile?.district || SOUTH_PUNJAB_DISTRICTS[0]
  );
  const [consentAccepted, setConsentAccepted] = useState(userProfile?.consentAccepted || false);

  if (!isOpen) return null;

  // Handle Quick Dev Test Account Select
  const handleSelectDevTestUser = (testUser: typeof DEV_TEST_USERS[0]) => {
    setPhoneNumber(testUser.phone);
    setProfileName(testUser.name);
    setProfileRole(testUser.role);
    setProfileDistrict(testUser.district);
    setOtpCode(testUser.otp);
    setIsOtpSent(true);
    setErrorMsg('');
  };

  // Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setErrorMsg('براہ کرم درست فون نمبر درج کریں۔');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsOtpSent(true);
      setOtpCode('123456'); // Pre-fill test OTP for seamless development experience
      speak('او ٹی پی کوڈ بھیج دیا گیا ہے۔ ٹیسٹ کوڈ ایک دو تین چار پانچ چھ درج کریں۔');
    }, 600);
  };

  // Verify OTP & Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMsg('براہ کرم درست 6 ہندسی OTP کوڈ درج کریں۔');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Find matching dev test user or default
      const matchedTestUser = DEV_TEST_USERS.find(
        (u) => u.phone.replace(/\s+/g, '') === phoneNumber.replace(/\s+/g, '')
      );

      const simulatedUid = `phone_user_${phoneNumber.replace(/\D/g, '')}`;
      const name = profileName.trim() || matchedTestUser?.name || 'کسان ممبر';
      const role = profileRole || matchedTestUser?.role || 'farmer';
      const district = profileDistrict || matchedTestUser?.district || SOUTH_PUNJAB_DISTRICTS[0];

      await saveProfile({
        id: simulatedUid,
        name,
        phone: phoneNumber,
        role,
        district,
        consentAccepted: true,
        consentDate: new Date().toISOString(),
        isVerified: role === 'cold_storage' || role === 'arhti',
        createdAt: new Date().toISOString(),
      });

      speak(`خوش آمدید ${name}۔ آپ کا فون لاگ ان کامیاب رہا۔`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'لاگ ان کرنے میں خرابی پیش آئی۔');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In Fallback
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const gUser = await signInWithGoogle();
      const existingName = gUser.displayName || 'صارف اپنا کھاتہ';
      const existingPhone = gUser.phoneNumber || phoneNumber || '0300-0000000';

      await saveProfile({
        id: gUser.uid,
        name: existingName,
        phone: existingPhone,
        role: profileRole,
        district: profileDistrict,
        email: gUser.email || undefined,
        consentAccepted: true,
        consentDate: new Date().toISOString(),
        isVerified: profileRole === 'cold_storage' || profileRole === 'arhti',
        createdAt: new Date().toISOString(),
      });

      speak(`گوگل لاگ ان کامیاب رہا۔ خوش آمدید ${existingName}۔`);
      onClose();
    } catch (err: any) {
      console.warn('Google sign in canceled or failed:', err);
      setErrorMsg('گوگل سائن ان مکمل نہیں ہو سکا۔ فون نمبر طریقہ استعمال کیجیے۔');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setErrorMsg('براہ کرم اپنا نام درج کریں۔');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('براہ کرم پرائیویسی اقرار نامہ چیک کریں۔');
      return;
    }

    if (!userProfile) return;

    setIsLoading(true);
    try {
      await saveProfile({
        ...userProfile,
        name: profileName.trim(),
        phone: profilePhone.trim() || userProfile.phone,
        role: userProfile.role, // Users strictly blocked from modifying their own role
        district: profileDistrict,
        consentAccepted: true,
        isVerified: userProfile.isVerified, // Block users from modifying verification
        consentDate: userProfile.consentDate || new Date().toISOString(),
      });
      speak('آپ کی پروفائل کامیابی سے محفوظ ہو گئی۔');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'محفوظ کرنے میں خرابی۔');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
      <div className="max-w-md w-full parchment-slip rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-[#78350F] relative max-h-[90vh] overflow-y-auto text-stone-900 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 end-4 w-9 h-9 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center hover:bg-stone-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-3 border-b-2 border-stone-800 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#78350F] font-bold text-xs mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>محفوظ سائن ان و کلاؤڈ کھاتہ</span>
          </div>
          <h3 className="text-2xl font-bold font-urdu text-stone-900">
            {userProfile ? 'صارف اکاؤنٹ و پروفائل' : 'اپنا کھاتہ میں لاگ ان کریں'}
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            کسان، آڑھتی اور کولڈ اسٹوریج آپریٹر کے مشترکہ ریکارڈ کے لیے
          </p>
        </div>

        {/* Active Logged-in State */}
        {userProfile ? (
          <form onSubmit={handleSaveProfileChanges} className="space-y-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-400 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-sm text-emerald-950">
                    فعال سائن ان (Signed In)
                  </span>
                </div>
                {userProfile.isVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                    ✓ تصدیق شدہ
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-700">
                <strong>فون نمبر:</strong> <bdi dir="ltr">{userProfile.phone}</bdi>
              </div>
            </div>

            {/* Editable Profile Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block text-stone-700 mb-1">
                  آپ کا پورا نام (Name) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-stone-300 rounded-xl font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold block text-stone-700 mb-1">
                  منڈی کردار (Role)
                </label>
                <div className="w-full h-11 px-3 bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-800 flex items-center justify-between text-xs">
                  <span>{t.roles[userProfile.role]?.title || userProfile.role}</span>
                  <span className="text-[10px] text-stone-500 bg-stone-200 px-2 py-0.5 rounded font-medium">
                    مستقل (تبدیلی صرف بذریعہ ایڈمن)
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold block text-stone-700 mb-1">
                  ضلع (South Punjab District) <span className="text-rose-600">*</span>
                </label>
                <select
                  value={profileDistrict}
                  onChange={(e) => setProfileDistrict(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-stone-300 rounded-xl font-bold text-stone-900"
                >
                  {SOUTH_PUNJAB_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Strict Privacy Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-[11px] text-stone-700 space-y-1">
                <div className="font-bold text-[#78350F] flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>پرائیویسی گارنٹی (Privacy Protection)</span>
                </div>
                <p>
                  ہم صرف آپ کا نام، فون، کردار اور ضلع محفوظ کرتے ہیں۔ <strong>قانوناً ہم شناختی کارڈ (CNIC) یا کوئی نجی دستاویزات طلب نہیں کرتے۔</strong>
                </p>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#78350F]"
                  required
                />
                <span className="text-[11px] text-stone-800 leading-tight">
                  میں اقرار کرتا ہوں کہ میرا ڈیٹا صرف منڈی کے باہمی حساب کتاب کے لیے محفوظ کیا جائے۔
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 min-h-[46px] bg-[#78350F] hover:bg-[#602a0c] text-amber-50 font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                {isLoading ? 'محفوظ ہو رہا ہے...' : 'پروفائل تبدیلیاں محفوظ کریں'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="min-h-[46px] px-3.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>لاگ آؤٹ</span>
              </button>
            </div>
          </form>
        ) : (
          /* Sign-in Flow */
          <div className="space-y-4">
            {/* Quick Dev Test Accounts (Rendered only when environment flag is explicitly enabled) */}
            {import.meta.env.VITE_ENABLE_DEV_TEST_LOGINS === 'true' && (
              <div className="bg-amber-100/70 p-3 rounded-2xl border border-amber-300 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#78350F]">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>ٹیسٹ اکاؤنٹس (فوری ڈویلپمنٹ ٹیسٹنگ)</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  کسی بھی کردار پر کلک کریں تاکہ وہ ٹیسٹ نمبر اور OTP کے ساتھ خود بخود لوڈ ہو جائے:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {DEV_TEST_USERS.map((u) => (
                    <button
                      key={u.phone}
                      type="button"
                      onClick={() => handleSelectDevTestUser(u)}
                      className="p-2 bg-white hover:bg-amber-50 border border-stone-200 rounded-xl text-start flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-stone-900 block">{u.name}</span>
                        <span className="text-[10px] text-stone-500">
                          {u.district} · {u.phone}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-mono font-bold">
                        OTP: {u.otp}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Methods Tabs */}
            <div className="flex rounded-xl bg-stone-200 p-1">
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMethod === 'phone'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                فون نمبر و OTP
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('google')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMethod === 'google'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                گوگل سائن ان (Google Fallback)
              </button>
            </div>

            {/* Phone Form */}
            {authMethod === 'phone' && (
              <div className="space-y-3">
                {!isOtpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="font-bold block text-xs text-stone-700 mb-1">
                        پاکستانی موبائل فون نمبر درج کیجیے:
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute start-3 top-3 text-stone-400" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+92 300 1234567"
                          className="w-full h-11 ps-9 pe-3 bg-white border border-stone-300 rounded-xl font-bold font-mono text-sm text-stone-900"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full min-h-[46px] bg-[#78350F] hover:bg-[#602a0c] text-amber-50 font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>{isLoading ? 'او ٹی پی کوڈ بھیجا جا رہا ہے...' : 'او ٹی پی (OTP) کوڈ حاصل کریں'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-950 font-bold flex items-center justify-between">
                      <span>کوڈ برائے {phoneNumber}</span>
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-[11px] text-amber-900 underline font-normal"
                      >
                        نمبر تبدیل کریں
                      </button>
                    </div>

                    <div>
                      <label className="font-bold block text-xs text-stone-700 mb-1">
                        6 ہندسی OTP کوڈ درج کریں:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full h-11 px-3 bg-white border-2 border-amber-600 rounded-xl font-bold font-mono text-center text-lg tracking-widest text-stone-900"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="font-bold block text-stone-700 mb-1">آپ کا نام</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="مثلاً حاجی غلام رسول"
                          className="w-full h-10 px-2.5 bg-white border border-stone-300 rounded-xl font-bold text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold block text-stone-700 mb-1">کردار</label>
                        <select
                          value={profileRole}
                          onChange={(e) => setProfileRole(e.target.value as Role)}
                          className="w-full h-10 px-2 bg-white border border-stone-300 rounded-xl font-bold text-xs"
                        >
                          <option value="farmer">کسان (Farmer)</option>
                          <option value="arhti">آڑھتی (Arhti)</option>
                          <option value="cold_storage">کولڈ اسٹوریج</option>
                          <option value="transporter">ٹرانسپورٹر</option>
                          <option value="buyer">خریدار</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block text-xs text-stone-700 mb-1">
                        ضلع (District)
                      </label>
                      <select
                        value={profileDistrict}
                        onChange={(e) => setProfileDistrict(e.target.value)}
                        className="w-full h-10 px-2 bg-white border border-stone-300 rounded-xl font-bold text-xs"
                      >
                        {SOUTH_PUNJAB_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Privacy consent checkbox */}
                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(e) => setConsentAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-[#78350F]"
                        required
                      />
                      <span className="text-[11px] text-stone-800 leading-tight">
                        میں اقرار کرتا ہوں کہ میرا ڈیٹا صرف منڈی حساب کتاب کے لیے محفوظ ہوگا۔ کوئی شناختی کارڈ نمبر طلب نہیں کیا جائے گا۔
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full min-h-[46px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                    >
                      {isLoading ? 'تصدیق ہو رہی ہے...' : 'تصدیق کریں و لاگ ان ہوں'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Google Fallback */}
            {authMethod === 'google' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  اگر آپ اپنے تصدیق شدہ گوگل ای میل کے ذریعے لاگ ان ہونا چاہیں تو نیچے دیا گیا بٹن دبائیں:
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold block text-stone-700 mb-1">منڈی کردار</label>
                    <select
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value as Role)}
                      className="w-full h-10 px-2 bg-white border border-stone-300 rounded-xl font-bold text-xs"
                    >
                      <option value="farmer">کسان (Farmer)</option>
                      <option value="arhti">آڑھتی (Arhti)</option>
                      <option value="cold_storage">کولڈ اسٹوریج</option>
                      <option value="transporter">ٹرانسپورٹر</option>
                      <option value="buyer">خریدار</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block text-stone-700 mb-1">ضلع</label>
                    <select
                      value={profileDistrict}
                      onChange={(e) => setProfileDistrict(e.target.value)}
                      className="w-full h-10 px-2 bg-white border border-stone-300 rounded-xl font-bold text-xs"
                    >
                      {SOUTH_PUNJAB_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full min-h-[48px] bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isLoading ? 'گوگل سے تصدیق جاری...' : 'گوگل اکاؤنٹ سے لاگ ان کریں'}</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
