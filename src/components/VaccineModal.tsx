import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { ShieldCheck, CheckCircle2, AlertCircle, X, ChevronRight, Volume2, Calendar, Baby, Info } from 'lucide-react';
import { speakText } from '../utils/voice';

interface VaccineModalProps {
  language: Language;
  ageYears: number;
  ageUnit?: 'months' | 'years';
  onClose: () => void;
  onSaveCheckedVaccines?: (vaccineIds: string[]) => void;
}

interface VaccineScheduleItem {
  id: string;
  ageGroup: string;
  ageYearsMax: number;
  name: string;
  disease: {
    en: string;
    hi: string;
    kn: string;
  };
  dose: string;
  importance: {
    en: string;
    hi: string;
    kn: string;
  };
}

export const VaccineModal: React.FC<VaccineModalProps> = ({
  language,
  ageYears,
  ageUnit = 'years',
  onClose,
  onSaveCheckedVaccines
}) => {
  const t = translations[language] || translations.en;

  // Complete India Universal Immunization Programme (UIP) Schedule
  const allVaccines: VaccineScheduleItem[] = [
    {
      id: 'birth_bcg',
      ageGroup: 'At Birth (0-15 days)',
      ageYearsMax: 1,
      name: 'BCG',
      disease: {
        en: 'Tuberculosis (TB)',
        hi: 'टी.बी. (तपेदिक) से सुरक्षा',
        kn: 'ಕ್ಷಯರೋಗ (ಟಿಬಿ) ತಡೆಗಟ್ಟುವಿಕೆ'
      },
      dose: 'Left Upper Arm (0.1 ml)',
      importance: {
        en: 'Protects infants against severe childhood tuberculosis & meningitis',
        hi: 'शिशु को जानलेवा टीबी और दिमागी बुखार से बचाता है',
        kn: 'ಶಿಶುವಿಗೆ ತೀವ್ರ ಕ್ಷಯರೋಗ ಮತ್ತು ಮೆದುಳು ಜ್ವರದಿಂದ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ'
      }
    },
    {
      id: 'birth_opv',
      ageGroup: 'At Birth (0-15 days)',
      ageYearsMax: 1,
      name: 'OPV 0 (Oral Polio)',
      disease: {
        en: 'Polio (Poliomyelitis)',
        hi: 'पोलियो लकवा से सुरक्षा',
        kn: 'ಪೋಲಿಯೋ ಲಕ್ವ ರಕ್ಷಣೆ'
      },
      dose: '2 Oral Drops',
      importance: {
        en: 'Prevents childhood paralytic polio',
        hi: 'पोलियो के लकवे से जीवनभर सुरक्षा देता है',
        kn: 'ಪೋಲಿಯೋ ಪಾರ್ಶ್ವವಾಯು ಬರದಂತೆ ತಡೆಯುತ್ತದೆ'
      }
    },
    {
      id: 'birth_hepb',
      ageGroup: 'At Birth (within 24h)',
      ageYearsMax: 1,
      name: 'Hepatitis B (Birth Dose)',
      disease: {
        en: 'Hepatitis B Liver Infection',
        hi: 'हेपेटाइटिस बी (पीलिया व लिवर संक्रमण)',
        kn: 'ಹೆಪಟೈಟಿಸ್ ಬಿ ಯಕೃತ್ತಿನ ಸೋಂಕು'
      },
      dose: 'Thigh Intramuscular',
      importance: {
        en: 'Prevents transmission of chronic liver infection from mother to newborn',
        hi: 'मां से बच्चे में लिवर संक्रमण फैलने से रोकता है',
        kn: 'ತಾಯಿಯಿಂದ ನವಜಾತ ಶಿಶುವಿಗೆ ಯಕೃತ್ತಿನ ಸೋಂಕು ಹರಡುವುದನ್ನು ತಡೆಯುತ್ತದೆ'
      }
    },
    {
      id: '6w_penta1',
      ageGroup: '6 Weeks (1.5 Months)',
      ageYearsMax: 1,
      name: 'Pentavalent 1 + OPV 1 + Rota 1',
      disease: {
        en: 'Diphtheria, Pertussis, Tetanus, Hep B, Hib & Diarrhea',
        hi: 'गलघोंटू, काली खांसी, धनुस्तंभ, पीलिया, निमोनिया व रोटा डायरिया',
        kn: 'ಗಳಗಂಡ, ನಾಯಿಕೆಮ್ಮು, ಧನುರ್ವಾಯು, ಕಾಮಾಲೆ ಮತ್ತು ಅತಿಸಾರ'
      },
      dose: 'Injection & Drops',
      importance: {
        en: 'Protects against 5 deadly childhood diseases + rotavirus diarrhea',
        hi: '5 जानलेवा बीमारियों और पानी जैसे दस्त से सुरक्षा',
        kn: '5 ಮಾರಣಾಂತಿಕ ರೋಗಗಳು ಮತ್ತು ರೋ bair ವರಸ್ ಅತಿಸಾರದಿಂದ ರಕ್ಷಣೆ'
      }
    },
    {
      id: '10w_penta2',
      ageGroup: '10 Weeks (2.5 Months)',
      ageYearsMax: 1,
      name: 'Pentavalent 2 + OPV 2 + Rota 2',
      disease: {
        en: '2nd Dose: 5 Diseases + Rotavirus',
        hi: 'दूसरी खुराक: 5 रोग और रोटावायरस',
        kn: 'ಎರಡನೇ ಡೋಸ್: 5 ಕಾಯಿಲೆಗಳು ಮತ್ತು ರೋಟಾವೈರಸ್'
      },
      dose: 'Injection & Drops',
      importance: {
        en: 'Builds stronger immunity booster in infants',
        hi: 'शिशु की रोग प्रतिरोधक क्षमता को दोगुना करता है',
        kn: 'ಶಿಶುವಿನ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ'
      }
    },
    {
      id: '14w_penta3',
      ageGroup: '14 Weeks (3.5 Months)',
      ageYearsMax: 1,
      name: 'Pentavalent 3 + OPV 3 + fIPV 2 + PCV 2',
      disease: {
        en: 'Full 1st Year Core Protection + Pneumococcal',
        hi: 'तीसरी खुराक: पूर्ण सुरक्षा व न्यूमोकोकल निमोनिया',
        kn: 'ಮೂರನೇ ಡೋಸ್: ನ್ಯುಮೋನಿಯಾ ಮತ್ತು ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ'
      },
      dose: 'Injections & Drops',
      importance: {
        en: 'Prevents severe bacterial pneumonia and meningitis',
        hi: 'फेफड़ों के खतरनाक निमोनिया और पस से बचाता है',
        kn: 'ತೀವ್ರ ನ್ಯುಮೋನಿಯಾ ಮತ್ತು ಮೆದುಳು ಜ್ವರ ತಡೆಯುತ್ತದೆ'
      }
    },
    {
      id: '9m_mr1',
      ageGroup: '9 to 12 Months',
      ageYearsMax: 2,
      name: 'MR 1 (Measles-Rubella) + Vit A',
      disease: {
        en: 'Measles (Khasra), Rubella & Eye Health',
        hi: 'खसरा (मीजल्स), रूबेला और आंखों की रोशनी (विटामिन ए)',
        kn: 'ದಡಾರ (ಮೀಸಲ್ಸ್), ರುಬೆಲ್ಲಾ ಮತ್ತು ವಿಟಮಿನ್ ಎ'
      },
      dose: 'Subcutaneous Right Arm + Spoon',
      importance: {
        en: 'Prevents blindness, high fever rashes, and congenital rubella',
        hi: 'खसरे से होने वाली कमजोरी, अंधापन और निमोनिया रोकता है',
        kn: 'ದಡಾರ ಮತ್ತು ದೃಷ್ಟಿದೋಷ ಬರದಂತೆ ತಡೆಯುತ್ತದೆ'
      }
    },
    {
      id: '16m_booster',
      ageGroup: '16 to 24 Months (1.5 - 2 Years)',
      ageYearsMax: 5,
      name: 'DPT Booster 1 + MR 2 + OPV Booster',
      disease: {
        en: 'DPT Booster & Measles 2nd Dose',
        hi: 'डी.पी.टी बूस्टर, खसरा दूसरा टीका और पोलियो ड्रॉप',
        kn: 'ಡಿಪಿಟಿ ಬೂಸ್ಟರ್ ಮತ್ತು ದಡಾರ ಎರಡನೇ ಲಸಿಕೆ'
      },
      dose: 'Thigh Muscle + Drops',
      importance: {
        en: 'Critical booster for toddlers against whooping cough & diphtheria',
        hi: 'चलने-फिरने वाले बच्चों के लिए जरूरी बूस्टर खुराक',
        kn: 'ಮಕ್ಕಳಲ್ಲಿ ದೀರ್ಘಕಾಲಿಕ ರಕ್ಷಣೆಗಾಗಿ ಮುಖ್ಯ ಬೂಸ್ಟರ್'
      }
    },
    {
      id: '5y_dpt2',
      ageGroup: '5 to 6 Years (School Entry)',
      ageYearsMax: 8,
      name: 'DPT Booster 2',
      disease: {
        en: 'Diphtheria, Pertussis, Tetanus (School Age)',
        hi: 'डी.पी.टी दूसरा बूस्टर (स्कूल प्रवेश पर)',
        kn: 'ಡಿಪಿಟಿ ಎರಡನೇ ಬೂಸ್ಟರ್ (ಶಾಲಾ ವಯಸ್ಸು)'
      },
      dose: 'Left Upper Arm Muscle',
      importance: {
        en: 'Protects growing children from tetanus injury infections and throat diphtheria',
        hi: 'चोट लगने पर धनुस्तंभ (टिटनेस) और गले के संक्रमण से सुरक्षा',
        kn: 'ಗಾಯವಾದಾಗ ಧನುರ್ವಾಯು ಸೋಂಕು ಬರದಂತೆ ರಕ್ಷಿಸುತ್ತದೆ'
      }
    },
    {
      id: '10y_td',
      ageGroup: '10 Years',
      ageYearsMax: 14,
      name: 'Td (Tetanus & adult Diphtheria)',
      disease: {
        en: 'Tetanus and Diphtheria Booster',
        hi: 'टी.डी टीका (टिटनेस और डिप्थीरिया)',
        kn: 'ಟಿ.ಡಿ ಲಸಿಕೆ (ಧನುರ್ವಾಯು ಮತ್ತು ಡಿಫ್ತೀರಿಯಾ)'
      },
      dose: 'Upper Arm Muscle',
      importance: {
        en: 'Ensures long-term tetanus protection from cuts, rust nails, and soil injuries',
        hi: 'लोहे, मिट्टी और खेलकूद की चोटों से टिटनेस का बचाव',
        kn: 'ಆಟವಾಡಾಗ ಆಗುವ ಗಾಯಗಳಿಂದ ಧನುರ್ವಾಯು ತಡೆಯಲು'
      }
    },
    {
      id: '16y_td',
      ageGroup: '16 Years',
      ageYearsMax: 18,
      name: 'Td Booster (16 Years)',
      disease: {
        en: 'Adolescent Td Booster',
        hi: '16 वर्ष पर टी.डी बूस्टर टीका',
        kn: '16ನೇ ವಯಸ್ಸಿನ ಟಿ.ಡಿ ಬೂಸ್ಟರ್'
      },
      dose: 'Upper Arm Muscle',
      importance: {
        en: 'Final childhood immunization step before adulthood',
        hi: 'वयस्क होने से पहले जरूरी अंतिम सुरक्षा खुराक',
        kn: 'ಪ್ರೌಢಾವಸ್ಥೆಗೆ ಕಾಲಿಡುವ ಮುನ್ನ ಅಂತಿಮ ಸುರಕ್ಷಾ ಲಸಿಕೆ'
      }
    },
    {
      id: 'hpv_girls',
      ageGroup: '9 to 14 Years (Adolescent Girls)',
      ageYearsMax: 18,
      name: 'HPV Vaccine (Cervical Cancer Prevention)',
      disease: {
        en: 'Human Papillomavirus / Cervical Cancer',
        hi: 'एच.पी.वी टीका (बच्चेदानी के मुंह के कैंसर से बचाव)',
        kn: 'ಎಚ್‌ಪಿವಿ ಲಸಿಕೆ (ಗರ್ಭಕಂಠದ ಕ್ಯಾನ್ಸರ್ ತಡೆಗಟ್ಟುವಿಕೆ)'
      },
      dose: '2 Doses (6 Months Apart)',
      importance: {
        en: 'Prevents >85% of cervical cancers in adult women when given before 15 years',
        hi: 'लड़कियों को बड़े होकर गर्भाशय ग्रीवा (cervical) कैंसर से बचाता है',
        kn: 'ಹೆಣ್ಣುಮಕ್ಕಳಿಗೆ ಭವಿಷ್ಯದಲ್ಲಿ ಗರ್ಭಕಂಠದ ಕ್ಯಾನ್ಸರ್ ಬರದಂತೆ ತಡೆಯುತ್ತದೆ'
      }
    }
  ];

  // Filter vaccines relevant to the entered age
  // E.g. If age is 5, highlight 5-6y vaccines, show past ones as checkable
  const [checkedIds, setCheckedIds] = useState<string[]>([
    'birth_bcg',
    'birth_opv',
    'birth_hepb',
    '6w_penta1',
    '10w_penta2',
    '14w_penta3'
  ]);

  const toggleVaccine = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSpeakVaccine = (vac: VaccineScheduleItem) => {
    const diseaseName = vac.disease[language] || vac.disease.en;
    const msg =
      language === 'hi'
        ? `${vac.name} का टीका। ${diseaseName}। उम्र: ${vac.ageGroup}। सरकारी अस्पताल और आंगनवाड़ी में मुफ्त उपलब्ध है।`
        : language === 'kn'
        ? `${vac.name} ಲಸಿಕೆ. ${diseaseName}. ವಯಸ್ಸು: ${vac.ageGroup}. ಅಂಗನವಾಡಿ ಮತ್ತು ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಉಚಿತವಾಗಿ ಲಭ್ಯವಿದೆ.`
        : `${vac.name} vaccine for ${diseaseName}. Scheduled at ${vac.ageGroup}. Available free at government health centres.`;
    speakText(msg, language);
  };

  const handleSave = () => {
    if (onSaveCheckedVaccines) {
      onSaveCheckedVaccines(checkedIds);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 text-slate-800 dark:text-slate-100 overflow-y-auto">
      <div className="max-w-xl mx-auto w-full my-auto bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center shadow-xs">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Universal Immunization Checklist (UIP)
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">
                {ageUnit === 'months'
                  ? language === 'hi'
                    ? `शिशु टीकाकरण जांच सूची (उम्र: ${ageYears} माह)`
                    : language === 'kn'
                    ? `ಶಿಶು ಲಸಿಕೆ ತಪಾಸಣೆ ಪಟ್ಟಿ (ವಯಸ್ಸು: ${ageYears} ತಿಂಗಳು)`
                    : `Infant Vaccine Checklist (${ageYears} Months)`
                  : language === 'hi'
                  ? `टीकाकरण जांच सूची (उम्र: ${ageYears} वर्ष)`
                  : language === 'kn'
                  ? `ಲಸಿಕೆ ತಪಾಸಣೆ ಪಟ್ಟಿ (ವಯಸ್ಸು: ${ageYears} ವರ್ಷ)`
                  : `Vaccine Checklist for Age ${ageYears} Years`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              {language === 'hi' ? 'सभी सरकारी टीके पूर्णतः मुफ्त हैं' : 'All UIP Government Vaccines are 100% Free'}
            </span>
            <span className="text-[11px] text-amber-800 dark:text-amber-300">
              {language === 'hi'
                ? 'यदि कोई टीका छूट गया है, तो नजदीकी आंगनवाड़ी केंद्र या प्राथमिक स्वास्थ्य केंद्र (PHC) में तुरंत लगवाया जा सकता है।'
                : 'Missed any vaccine? Free catch-up doses are given every Wednesday at Anganwadi / Subcentre.'}
            </span>
          </div>
        </div>

        {/* Vaccine List */}
        <div className="space-y-2.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
          {allVaccines.map((vac) => {
            const isChecked = checkedIds.includes(vac.id);
            const isAgeTarget = ageYears <= vac.ageYearsMax;

            return (
              <div
                key={vac.id}
                className={`p-3 rounded-2xl border-2 transition flex items-start justify-between gap-3 ${
                  isChecked
                    ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-500/80 shadow-2xs'
                    : isAgeTarget
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/40'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div
                  onClick={() => toggleVaccine(vac.id)}
                  className="flex items-start gap-2.5 flex-1 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isChecked
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-4 h-4 fill-white text-teal-600" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                        {vac.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {vac.ageGroup}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mt-0.5">
                      {vac.disease[language] || vac.disease.en}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {vac.importance[language] || vac.importance.en}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpeakVaccine(vac)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-white dark:hover:bg-slate-800 shrink-0"
                  title="Speak details"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-500">
            <span>{checkedIds.length} of {allVaccines.length} Marked Done</span>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md active:scale-95 transition"
          >
            {language === 'hi' ? 'सेव करें और जारी रखें' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
