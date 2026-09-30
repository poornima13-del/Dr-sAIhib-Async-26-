import React, { useState } from 'react';
import { Language } from '../types';
import { BODY_PARTS_MAPPING } from '../data/knowledgeBase';
import { translations } from '../data/translations';
import { RotateCcw } from 'lucide-react';

interface BodyMapProps {
  language: Language;
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
  onBrowseAllCategories?: () => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({
  language,
  selectedPart,
  onSelectPart,
  onBrowseAllCategories
}) => {
  const [view, setView] = useState<'front' | 'back'>('front');
  const t = translations[language] || translations.en;

  const partLabels = (key: string) => {
    const item = BODY_PARTS_MAPPING[key];
    if (!item) return key;
    return item.label[language] || item.label.en;
  };

  const getPartClass = (partKey: string) => {
    const isSelected = selectedPart === partKey;
    return `cursor-pointer transition-all duration-150 ${
      isSelected
        ? 'fill-teal-500 stroke-teal-700 stroke-2 filter drop-shadow-md'
        : 'fill-slate-200 dark:fill-slate-700 hover:fill-teal-300 dark:hover:fill-teal-700 stroke-slate-400 dark:stroke-slate-500 stroke-1'
    }`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col items-center select-none">
      {/* Front / Back Toggle Buttons & Quick instructions */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setView('front')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              view === 'front'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-200 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            👤 {t.frontBody}
          </button>
          <button
            type="button"
            onClick={() => setView('back')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              view === 'back'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-200 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            🔄 {t.backBody}
          </button>
        </div>

        {onBrowseAllCategories && (
          <button
            type="button"
            onClick={onBrowseAllCategories}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
          >
            Browse Categories →
          </button>
        )}
      </div>

      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 text-center">
        {language === 'hi'
          ? 'शरीर पर जहां दर्द या तकलीफ है, वहां छुएं:'
          : language === 'kn'
          ? 'ದೇಹದಲ್ಲಿ ನೋವಿರುವ ಭಾಗವನ್ನು ಮುಟ್ಟಿ:'
          : 'Tap on the body part where it hurts:'}
      </p>

      {/* Interactive SVG Body with expanded specific zones */}
      <div className="relative w-64 h-80 sm:w-72 sm:h-88">
        <svg viewBox="0 0 240 330" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          {view === 'front' ? (
            <g>
              {/* Head / Forehead */}
              <circle
                cx="120"
                cy="32"
                r="24"
                className={getPartClass('head')}
                onClick={() => onSelectPart('head')}
                role="button"
                aria-label="Head"
              />

              {/* Eyes */}
              <ellipse
                cx="108"
                cy="28"
                rx="6"
                ry="4"
                className={getPartClass('eyes')}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('eyes');
                }}
                role="button"
                aria-label="Eyes"
              />
              <ellipse
                cx="132"
                cy="28"
                rx="6"
                ry="4"
                className={getPartClass('eyes')}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('eyes');
                }}
                role="button"
                aria-label="Eyes"
              />

              {/* Nose */}
              <polygon
                points="120,32 116,40 124,40"
                className={getPartClass('nose')}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('nose');
                }}
                role="button"
                aria-label="Nose"
              />

              {/* Mouth & Throat */}
              <rect
                x="112"
                y="45"
                width="16"
                height="8"
                rx="3"
                className={getPartClass('mouth_throat')}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('mouth_throat');
                }}
                role="button"
                aria-label="Mouth"
              />

              {/* Ears */}
              <circle
                cx="94"
                cy="32"
                r="6"
                className={getPartClass('ears')}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('ears');
                }}
                role="button"
                aria-label="Ears"
              />
              <circle
                cx="146"
                cy="32"
                r="6"
                className={getPartClass('ears')}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('ears');
                }}
                role="button"
                aria-label="Ears"
              />

              {/* Neck & Thyroid */}
              <rect
                x="108"
                y="57"
                width="24"
                height="16"
                rx="4"
                className={getPartClass('neck')}
                onClick={() => onSelectPart('neck')}
                role="button"
                aria-label="Neck"
              />
              <text x="120" y="69" textAnchor="middle" fontSize="9" fontWeight="bold" className="fill-slate-600 pointer-events-none">
                🪢
              </text>

              {/* Chest & Lungs */}
              <path
                d="M 85 75 C 85 75, 120 78, 155 75 L 150 114 C 135 119, 105 119, 90 114 Z"
                className={getPartClass('chest')}
                onClick={() => onSelectPart('chest')}
                role="button"
                aria-label="Chest"
              />
              <text x="120" y="96" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-slate-600 pointer-events-none">
                🫁
              </text>

              {/* Breast / Underarm Targets */}
              <circle
                cx="98"
                cy="104"
                r="11"
                className={getPartClass('breast')}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('breast');
                }}
                role="button"
                aria-label="Breast"
              />
              <circle
                cx="142"
                cy="104"
                r="11"
                className={getPartClass('breast')}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('breast');
                }}
                role="button"
                aria-label="Breast"
              />

              {/* Stomach & Belly */}
              <path
                d="M 90 116 C 105 121, 135 121, 150 116 L 146 160 C 132 165, 108 165, 94 160 Z"
                className={getPartClass('stomach')}
                onClick={() => onSelectPart('stomach')}
                role="button"
                aria-label="Stomach"
              />
              <text x="120" y="142" textAnchor="middle" fontSize="11" fontWeight="bold" className="fill-slate-600 pointer-events-none">
                🤢
              </text>

              {/* Private & Urinary Area (Includes STD / RTI) */}
              <path
                d="M 94 161 C 108 166, 132 166, 146 161 L 138 186 C 128 191, 112 191, 102 186 Z"
                className={getPartClass('private_urinary')}
                onClick={() => onSelectPart('private_urinary')}
                role="button"
                aria-label="Private & Urinary"
              />
              <text x="120" y="177" textAnchor="middle" fontSize="9" fontWeight="bold" className="fill-slate-600 pointer-events-none">
                🔒
              </text>

              {/* Arms & Hands (Left & Right) */}
              <path
                d="M 156 78 L 186 145 C 189 152, 178 156, 174 150 L 149 95 Z"
                className={getPartClass('arms_hands')}
                onClick={() => onSelectPart('arms_hands')}
                role="button"
                aria-label="Arms & Hands"
              />
              <path
                d="M 84 78 L 54 145 C 51 152, 62 156, 66 150 L 91 95 Z"
                className={getPartClass('arms_hands')}
                onClick={() => onSelectPart('arms_hands')}
                role="button"
                aria-label="Arms & Hands"
              />

              {/* Legs & Feet */}
              <path
                d="M 123 187 L 134 290 C 135 296, 118 296, 116 290 L 112 188 Z"
                className={getPartClass('legs_feet')}
                onClick={() => onSelectPart('legs_feet')}
                role="button"
                aria-label="Legs & Feet"
              />
              <path
                d="M 117 187 L 106 290 C 105 296, 122 296, 124 290 L 128 188 Z"
                className={getPartClass('legs_feet')}
                onClick={() => onSelectPart('legs_feet')}
                role="button"
                aria-label="Legs & Feet"
              />
            </g>
          ) : (
            <g>
              {/* Back of Head */}
              <circle
                cx="120"
                cy="32"
                r="24"
                className={getPartClass('head')}
                onClick={() => onSelectPart('head')}
                role="button"
                aria-label="Head Back"
              />

              {/* Back / Spine */}
              <path
                d="M 88 74 C 110 77, 130 77, 152 74 L 146 162 C 130 166, 110 166, 94 162 Z"
                className={getPartClass('back')}
                onClick={() => onSelectPart('back')}
                role="button"
                aria-label="Back & Spine"
              />
              <line x1="120" y1="78" x2="120" y2="158" stroke="#94a3b8" strokeWidth="3" strokeDasharray="4 4" pointerEvents="none" />
              <text x="120" y="122" textAnchor="middle" fontSize="11" fontWeight="bold" className="fill-slate-600 pointer-events-none">
                🦴
              </text>

              {/* Lower back / Flank */}
              <path
                d="M 94 163 C 110 167, 130 167, 146 163 L 138 188 C 128 193, 112 193, 102 188 Z"
                className={getPartClass('back')}
                onClick={() => onSelectPart('back')}
                role="button"
                aria-label="Lower Back"
              />

              {/* Arms (back) */}
              <path
                d="M 154 78 L 185 145 C 188 152, 178 156, 174 150 L 147 95 Z"
                className={getPartClass('arms_hands')}
                onClick={() => onSelectPart('arms_hands')}
                role="button"
              />
              <path
                d="M 86 78 L 55 145 C 52 152, 62 156, 66 150 L 93 95 Z"
                className={getPartClass('arms_hands')}
                onClick={() => onSelectPart('arms_hands')}
                role="button"
              />

              {/* Legs (back) */}
              <path
                d="M 123 188 L 134 290 C 135 296, 118 296, 116 290 L 112 189 Z"
                className={getPartClass('legs_feet')}
                onClick={() => onSelectPart('legs_feet')}
                role="button"
              />
              <path
                d="M 117 188 L 106 290 C 105 296, 122 296, 124 290 L 128 189 Z"
                className={getPartClass('legs_feet')}
                onClick={() => onSelectPart('legs_feet')}
                role="button"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Quick General Whole Body or Skin Chips below body */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => onSelectPart('skin_general')}
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 flex items-center gap-1.5"
        >
          <span>🔴</span>
          <span>{partLabels('skin_general')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPart('whole_body')}
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 flex items-center gap-1.5"
        >
          <span>🌡️</span>
          <span>{partLabels('whole_body')}</span>
        </button>
      </div>
    </div>
  );
};
