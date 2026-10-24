import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Role, Party, Slip, LedgerEntry, RateSettings, UserProfile } from '../types';
import { partyRepository } from '../repositories/partyRepository';
import { slipRepository } from '../repositories/slipRepository';
import { ledgerRepository } from '../repositories/ledgerRepository';
import { settingsRepository } from '../repositories/settingsRepository';
import { INITIAL_RATE_SETTINGS } from '../repositories/sampleData';
import { speechService } from '../services/speechService';
import { TRANSLATIONS } from '../constants/translations';
import {
  auth,
  fetchUserProfile,
  saveUserProfile,
  deleteUserData,
  testFirestoreConnection,
} from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { exportUserDataToCSV } from '../services/dataExportService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeTab: 'home' | 'khata' | 'slips' | 'rates' | 'more';
  setActiveTab: (tab: 'home' | 'khata' | 'slips' | 'rates' | 'more') => void;
  t: typeof TRANSLATIONS['ur'];
  // Auth & Profile
  user: User | null;
  userProfile: UserProfile | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  saveProfile: (profile: UserProfile) => Promise<void>;
  exportMyDataCSV: () => Promise<void>;
  deleteMyAccountAndData: () => Promise<void>;
  // Repositories Data
  parties: Party[];
  slips: Slip[];
  ledgerEntries: LedgerEntry[];
  settings: RateSettings;
  isLoading: boolean;
  // Actions
  refreshData: () => Promise<void>;
  createParty: (party: Omit<Party, 'id' | 'createdAt'>) => Promise<Party>;
  createSlip: (slip: Omit<Slip, 'id' | 'createdAt'>) => Promise<Slip>;
  createLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'createdAt'>) => Promise<LedgerEntry>;
  saveSettings: (settings: RateSettings) => Promise<void>;
  resetAllSampleData: () => Promise<void>;
  // Speech Narration
  isSpeaking: boolean;
  currentSpokenText: string;
  speak: (urduText: string, romanFallback?: string, englishFallback?: string) => void;
  stopSpeech: () => void;
  // First Run Intro
  hasSeenIntro: boolean;
  completeIntro: () => void;
  reopenIntro: () => void;
  // PWA & Connectivity
  isOnline: boolean;
  isPWAInstallable: boolean;
  isPWAInstalled: boolean;
  triggerPWAInstall: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apna_khata_lang');
      if (saved === 'ur' || saved === 'ur-Latn' || saved === 'en') return saved;
    }
    return 'ur';
  });

  const [currentRole, setCurrentRoleState] = useState<Role>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apna_khata_role');
      if (saved && ['farmer', 'arhti', 'cold_storage', 'transporter', 'buyer'].includes(saved)) {
        return saved as Role;
      }
    }
    return 'farmer';
  });

  const [activeTab, setActiveTab] = useState<'home' | 'khata' | 'slips' | 'rates' | 'more'>('home');
  const [parties, setParties] = useState<Party[]>([]);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [settings, setSettings] = useState<RateSettings>(INITIAL_RATE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Auth & Profile State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('apna_khata_user_profile');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // ignore
        }
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpokenText, setCurrentSpokenText] = useState('');

  // First run intro
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('apna_khata_intro_done') === 'true';
    }
    return true;
  });

  // Connectivity & PWA
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  // Sync HTML dir and lang
  useEffect(() => {
    const isRtl = language === 'ur';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'ur' ? 'ur' : language === 'ur-Latn' ? 'ur-Latn' : 'en';
    localStorage.setItem('apna_khata_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrentRole = (role: Role) => {
    setCurrentRoleState(role);
    localStorage.setItem('apna_khata_role', role);
    if (userProfile && userProfile.role !== role) {
      saveProfile({ ...userProfile, role }).catch(() => {});
    }
  };

  // Auth listener & Firestore Profile sync
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const profile = await fetchUserProfile(fbUser.uid);
          if (profile) {
            setUserProfile(profile);
            setCurrentRoleState(profile.role);
            localStorage.setItem('apna_khata_role', profile.role);
            localStorage.setItem('apna_khata_user_profile', JSON.stringify(profile));
          }
        } catch (err) {
          console.warn('[AppContext] Could not fetch profile for user:', err);
        }
      }
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  const saveProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentRoleState(profile.role);
    localStorage.setItem('apna_khata_role', profile.role);
    localStorage.setItem('apna_khata_user_profile', JSON.stringify(profile));
    await saveUserProfile(profile);
    await refreshData();
  };

  const deleteMyAccountAndData = async () => {
    if (!userProfile) return;
    const uid = userProfile.id;
    await deleteUserData(uid);
    setUserProfile(null);
    setUser(null);
    localStorage.removeItem('apna_khata_user_profile');
    await refreshData();
  };

  const exportMyDataCSV = async () => {
    await exportUserDataToCSV(userProfile);
  };

  // Speech subscription
  useEffect(() => {
    const unsubscribe = speechService.subscribe(({ isSpeaking: speaking, currentText }) => {
      setIsSpeaking(speaking);
      setCurrentSpokenText(currentText);
    });
    return () => unsubscribe();
  }, []);

  // Online / offline listeners & PWA prompt
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsPWAInstalled(isStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Load Initial Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allParties, allSlips, allEntries, appSettings] = await Promise.all([
        partyRepository.getAll(),
        slipRepository.getAll(),
        ledgerRepository.getAll(),
        settingsRepository.getSettings(),
      ]);
      setParties(allParties);
      setSlips(allSlips);
      setLedgerEntries(allEntries);
      setSettings(appSettings);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const createParty = async (data: Omit<Party, 'id' | 'createdAt'>): Promise<Party> => {
    const newParty = await partyRepository.save(data);
    await refreshData();
    return newParty;
  };

  const createSlip = async (data: Omit<Slip, 'id' | 'createdAt'>): Promise<Slip> => {
    const newSlip = await slipRepository.save(data);
    const isCredit = data.type === 'boli' || data.type === 'kanta' || data.type === 'challan';
    await ledgerRepository.save({
      date: data.date,
      partyId: data.partyId,
      partyName: data.partyName,
      slipId: newSlip.id,
      description: `${newSlip.slipNumber} (${data.variety} - ${data.netWeight} ${data.unit})`,
      debitPKR: isCredit ? 0 : data.netPayablePKR,
      creditPKR: isCredit ? data.netPayablePKR : 0,
      balancePKR: isCredit ? data.netPayablePKR : -data.netPayablePKR,
      isSample: false,
    });

    await partyRepository.updateBalance(data.partyId, isCredit ? data.netPayablePKR : -data.netPayablePKR);
    await refreshData();
    return newSlip;
  };

  const createLedgerEntry = async (data: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry> => {
    const newEntry = await ledgerRepository.save(data);
    const delta = data.creditPKR - data.debitPKR;
    await partyRepository.updateBalance(data.partyId, delta);
    await refreshData();
    return newEntry;
  };

  const saveSettings = async (newSettings: RateSettings) => {
    await settingsRepository.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const resetAllSampleData = async () => {
    await Promise.all([
      partyRepository.resetToSample(),
      slipRepository.resetToSample(),
      ledgerRepository.resetToSample(),
      settingsRepository.resetToSample(),
    ]);
    await refreshData();
  };

  const speak = (urduText: string, romanFallback?: string, englishFallback?: string) => {
    speechService.speak(urduText, romanFallback, englishFallback, language);
  };

  const stopSpeech = () => {
    speechService.stop();
  };

  const completeIntro = () => {
    setHasSeenIntro(true);
    localStorage.setItem('apna_khata_intro_done', 'true');
  };

  const reopenIntro = () => {
    setHasSeenIntro(false);
  };

  const triggerPWAInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        t,
        user,
        userProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        saveProfile,
        exportMyDataCSV,
        deleteMyAccountAndData,
        parties,
        slips,
        ledgerEntries,
        settings,
        isLoading,
        refreshData,
        createParty,
        createSlip,
        createLedgerEntry,
        saveSettings,
        resetAllSampleData,
        isSpeaking,
        currentSpokenText,
        speak,
        stopSpeech,
        hasSeenIntro,
        completeIntro,
        reopenIntro,
        isOnline,
        isPWAInstallable: !!deferredPrompt,
        isPWAInstalled,
        triggerPWAInstall,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
