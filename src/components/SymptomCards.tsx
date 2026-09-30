import React, { useState } from 'react';
import { Symptom, Language, SymptomCategory } from '../types';
import { SYMPTOMS_LIST, BODY_PARTS_MAPPING } from '../data/knowledgeBase';
import { speakText } from '../utils/voice';
import { Volume2, CheckCircle2, PlusCircle, AlertTriangle, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

interface SymptomCardsProps {
  language: Language;
  selectedSymptomIds: string[];
  onToggleSymptom: (id: string) => void;
  activeCategory: SymptomCategory | 'all';
  activeBodyPart: string | null;
  onOpenOtherModal: () => void;
  otherText?: string;
  hasOtherPhotos?: boolean;
  onSwitchToCategories?: () => void;
  onBackToBodyMap?: () => void;
}

export const SymptomCards: React.FC<SymptomCardsProps> = ({
  language,
  selectedSymptomIds,
  onToggleSymptom,
  activeCategory,
  activeBodyPart,
  onOpenOtherModal,
  otherText,
  hasOtherPhotos,
  onSwitchToCategories,
  onBackToBodyMap
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 5; // 5 symptoms + 1 "Other" card = exactly 6 cards for zero-scroll grid

  // Filter symptoms based on active body part or category
  const filteredSymptoms = SYMPTOMS_LIST.filter((symptom) => {
    if (activeBodyPart) {
      const partData = BODY_PARTS_MAPPING[activeBodyPart];
      if (partData && !partData.symptomIds.includes(symptom.id)) {
        return false;
      }
    }
    if (activeCategory !== 'all' && symptom.category !== activeCategory) {
      return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSymptoms.length / ITEMS_PER_PAGE));
  const pageSymptoms = filteredSymptoms.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const getSymptomLabel = (symptom: Symptom) => {
    const list = symptom.keywords[language] || symptom.keywords.en;
    return list[0] || symptom.id;
  };

  const handleCardClick = (symptom: Symptom) => {
    onToggleSymptom(symptom.id);
    const label = getSymptomLabel(symptom);
    speakText(label, language);
  };

  const handleAudioOnly = (e: React.MouseEvent, symptom: Symptom) => {
    e.stopPropagation();
    const label = getSymptomLabel(symptom);
    speakText(label, language);
  };

  const zoneTitle = activeBodyPart
    ? BODY_PARTS_MAPPING[activeBodyPart]?.label[language] || activeBodyPart
    : activeCategory !== 'all'
    ? activeCategory.replace('_', ' ').toUpperCase()
    : 'All Symptoms';

  return (
    <div className="space-y-3">
      {/* Navigation sub-bar: Back to Body Map & Switch to Categories */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {onBackToBodyMap && (
          <button
            type="button"
            onClick={onBackToBodyMap}
            className="flex items-center gap-1 font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Body Map</span>
          </button>
        )}

        <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
          {zoneTitle} ({filteredSymptoms.length})
        </span>

        {onSwitchToCategories && (
          <button
            type="button"
            onClick={onSwitchToCategories}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            All Categories →
          </button>
        )}
      </div>

      {/* 2-column, 3-row zero-scroll grid (max 6 items) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {pageSymptoms.map((symptom) => {
          const isSelected = selectedSymptomIds.includes(symptom.id);
          const label = getSymptomLabel(symptom);

          return (
            <div
              key={symptom.id}
              onClick={() => handleCardClick(symptom)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(symptom);
                }
              }}
              className={`min-h-[88px] sm:min-h-[96px] p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col justify-between cursor-pointer select-none transition-all active:scale-95 ${
                isSelected
                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-md ring-2 ring-teal-400/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300'
              }`}
            >
              {/* Top row: Emoji, Audio speaker, Selection mark */}
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl">{symptom.emoji}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleAudioOnly(e, symptom)}
                    title="Hear name"
                    className="p-1 rounded-full text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 fill-teal-100 dark:fill-teal-950" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  )}
                </div>
              </div>

              {/* Label & Sensitive / Cancer badging */}
              <div className="mt-1">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
                  {label}
                </span>

                {symptom.isSensitiveStd && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-violet-600 dark:text-violet-400 mt-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Confidential</span>
                  </span>
                )}

                {symptom.isCancerWarning && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Warning</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* The "Other" Card (Always present on every page) */}
        <div
          onClick={onOpenOtherModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenOtherModal();
            }
          }}
          className={`min-h-[88px] sm:min-h-[96px] p-2.5 sm:p-3 rounded-2xl border-2 border-dashed flex flex-col justify-between cursor-pointer select-none transition-all active:scale-95 ${
            otherText || hasOtherPhotos
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl">✍️</span>
            {otherText || hasOtherPhotos ? (
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            ) : (
              <PlusCircle className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="mt-1">
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 block">
              + Other Problem
            </span>
            <span className="text-[10px] text-slate-500 truncate block">
              {otherText || 'Type, speak, photo'}
            </span>
          </div>
        </div>
      </div>

      {/* Pagination Controls if more than 5 symptoms in category */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
              currentPage === 0
                ? 'opacity-30 text-slate-400 cursor-not-allowed'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentPage === i ? 'w-4 bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
              currentPage >= totalPages - 1
                ? 'opacity-30 text-slate-400 cursor-not-allowed'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <span>More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
