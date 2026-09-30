import React, { useState, useEffect } from 'react';
import { Language, AppSettings } from '../types';
import { translations } from '../data/translations';
import { Logo } from './Logo';
import { Wifi, WifiOff, ShieldCheck, UserCheck, Download, User } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenAsha: () => void;
  onOpenPrivacy: () => void;
  onResetToHome: () => void;
  currentPatientCode?: string | null;
  onSwitchPatient?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  settings,
  onUpdateSettings,
  onOpenAsha,
  onOpenPrivacy,
  onResetToHome,
  currentPatientCode,
  onSwitchPatient
}) => {
  const t = translations[language] || translations.en;
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const cycleFontSize = () => {
    if (settings.fontSize === 'normal') onUpdateSettings({ fontSize: 'large' });
    else if (settings.fontSize === 'large') onUpdateSettings({ fontSize: 'xlarge' });
    else onUpdateSettings({ fontSize: 'normal' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-4xl mx-auto px-3 py-2 sm:px-4 flex items-center justify-between gap-2">
        {/* Brand Logo & Current Patient ID */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetToHome}
            className="flex items-center text-left focus:outline-hidden rounded-xl p-0.5"
            aria-label="Dr sAIhib Home"
          >
            <Logo size="small" />
          </button>

          {/* Current Patient ID Pill */}
          {currentPatientCode && (
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-[10px] sm:text-[11px] font-black">
              <User className="w-3 h-3 text-teal-600 shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-none">ID: {currentPatientCode}</span>
              {onSwitchPatient && (
                <button
                  onClick={onSwitchPatient}
                  title={t.switchPatientBtn || 'Switch Patient'}
                  className="ml-1 text-[9px] underline text-teal-600 hover:text-teal-900 cursor-pointer"
                >
                  ✎
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sovereign Offline Badge */}
          <div
            title={t.offlineDesc}
            className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Text Size Toggle */}
          <button
            onClick={cycleFontSize}
            title={t.fontSizeBtn}
            className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
          >
            {settings.fontSize === 'normal' ? 'A' : settings.fontSize === 'large' ? 'A+' : 'A++'}
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
            title={t.contrastBtn}
            className={`p-1.5 rounded-lg text-xs font-semibold border transition ${
              settings.highContrast
                ? 'bg-black text-yellow-300 border-yellow-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            🌓
          </button>

          {/* Language Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700">
            {(['en', 'hi', 'kn'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-1.5 py-1 text-xs font-black rounded-lg transition-all ${
                  language === lang
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'ಕ'}
              </button>
            ))}
          </div>

          {/* ASHA Mode Quick Access */}
          <button
            onClick={onOpenAsha}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 text-xs font-bold"
            title={t.ashaModeBtn}
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">ASHA</span>
          </button>

          {/* Install PWA Prompt */}
          {!isInstalled && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold shadow-xs"
              title="Install App"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Privacy Button */}
          <button
            onClick={onOpenPrivacy}
            title={t.privacyNoticeBtn}
            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
