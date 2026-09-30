import React from 'react';
import { Language, SkinAnswers } from '../types';
import { translations } from '../data/translations';
import { AlertCircle } from 'lucide-react';

interface SkinQuestionnaireProps {
  language: Language;
  answers: SkinAnswers;
  onChange: (updated: SkinAnswers) => void;
}

export const SkinQuestionnaire: React.FC<SkinQuestionnaireProps> = ({
  language,
  answers,
  onChange
}) => {
  const t = translations[language] || translations.en;

  const colorOptions = [
    { id: 'red', label: t.skinColorRed, emoji: '🔴' },
    { id: 'white', label: t.skinColorWhite, emoji: '⚪' },
    { id: 'dark', label: t.skinColorDark, emoji: '🟤' },
    { id: 'pus', label: t.skinColorPus, emoji: '🟡' }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔍</span>
        <div>
          <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">
            {t.skinQuestionnaireTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'त्वचा और घाव के बारे में सही जानकारी चुनें'
              : language === 'kn'
              ? 'ಚರ್ಮ ಮತ್ತು ಗಾಯದ ಬಗ್ಗೆ ವಿವರ ತಿಳಿಸಿ'
              : 'Help Dr SAIhib understand your skin condition'}
          </p>
        </div>
      </div>

      {/* 1. Skin color */}
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
          {t.skinColorLabel}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {colorOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...answers, color: opt.id })}
              className={`p-3 rounded-2xl border-2 flex items-center gap-2 text-left font-bold text-xs sm:text-sm transition ${
                answers.color === opt.id
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Yes/No questions */}
      <div className="space-y-2.5">
        {[
          { key: 'itching', label: t.skinItching, emoji: '⚡' },
          { key: 'spreading', label: t.skinSpreading, emoji: '🌊' },
          { key: 'painful', label: t.skinPainful, emoji: '😣' },
          { key: 'hasFever', label: t.skinHasFever, emoji: '🌡️' }
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChange({ ...answers, [item.key]: true })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (answers as any)[item.key] === true
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...answers, [item.key]: false })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (answers as any)[item.key] === false
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Changing mole or lump (Cancer warning) */}
      <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border-2 border-violet-300 dark:border-violet-800">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
          <span className="text-xs sm:text-sm font-bold text-violet-950 dark:text-violet-200 leading-snug">
            {t.skinMoleChange}
          </span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => onChange({ ...answers, changingMole: true })}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              answers.changingMole === true
                ? 'bg-violet-700 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-700'
            }`}
          >
            {t.yes}
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...answers, changingMole: false })}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              answers.changingMole === false
                ? 'bg-slate-700 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t.no}
          </button>
        </div>
      </div>
    </div>
  );
};
