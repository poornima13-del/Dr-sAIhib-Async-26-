import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { ShieldCheck, Cpu, HardDrive, WifiOff, X } from 'lucide-react';

interface PrivacyModalProps {
  language: Language;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ language, onClose }) => {
  const t = translations[language] || translations.en;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-slate-800 dark:text-white">
              {t.privacyTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.privacyText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900">
            <Cpu className="w-5 h-5 text-teal-600 mb-1" />
            <h4 className="font-bold text-xs text-teal-900 dark:text-teal-200">
              100% On-Device AI Logic
            </h4>
            <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-0.5">
              All 27 conditions, cancer rules, and triage scoring execute right on your browser JavaScript.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900">
            <HardDrive className="w-5 h-5 text-sky-600 mb-1" />
            <h4 className="font-bold text-xs text-sky-900 dark:text-sky-200">
              Local IndexedDB Storage
            </h4>
            <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-0.5">
              Patient profiles, visits, and photos remain strictly inside the device database (DrSAIhibDB).
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
            <WifiOff className="w-5 h-5 text-amber-600 mb-1" />
            <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
              Airplane Mode Ready
            </h4>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
              Cached by Service Worker (sw.js). Works in remote villages with zero mobile network.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900">
            <span className="text-xl block mb-1">📱</span>
            <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
              SMS Rural Telemedicine
            </h4>
            <p className="text-[11px] text-indigo-800 dark:text-indigo-300 mt-0.5">
              Generate offline GSM SMS advice to alert the village ASHA didi over ordinary basic phone networks.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
