import React, { useState } from 'react';
import { Language, AshaContact, CheckRecord } from '../types';
import { translations } from '../data/translations';
import { speakText, stopSpeaking } from '../utils/voice';
import {
  Heart,
  Baby,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
  Printer,
  Calendar,
  Pill,
  HeartPulse,
  UserCheck
} from 'lucide-react';

interface PregnancyCheckupProps {
  language: Language;
  patientName: string;
  patientCode: string;
  age: number;
  ashaContact: AshaContact | null;
  onClose: () => void;
  onFinishCheckup: (record: Partial<CheckRecord>) => void;
}

export const PregnancyCheckup: React.FC<PregnancyCheckupProps> = ({
  language,
  patientName,
  patientCode,
  age,
  ashaContact,
  onClose,
  onFinishCheckup
}) => {
  const t = translations[language] || translations.en;

  // Step 0: Month & Trimester
  // Step 1: Obstetric Danger Signs (Red Flags)
  // Step 2: Essential ANC Care & Tests
  // Step 3: Nutrition & Fetal Movement
  // Step 4: Final Assessment & Guidance
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [month, setMonth] = useState<number>(5);
  const [isFirstPregnancy, setIsFirstPregnancy] = useState(true);

  // Danger signs
  const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>([]);

  // ANC Tests
  const [receivedTT, setReceivedTT] = useState<boolean>(true);
  const [takingIFA, setTakingIFA] = useState<boolean>(true);
  const [takingCalcium, setTakingCalcium] = useState<boolean>(true);
  const [bpCheckedThisMonth, setBpCheckedThisMonth] = useState<boolean>(true);
  const [ultrasoundDone, setUltrasoundDone] = useState<boolean>(true);
  const [normalFetalKicks, setNormalFetalKicks] = useState<boolean>(true);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const dangerSignsList = [
    {
      id: 'vaginal_bleeding',
      emoji: '🩸',
      title: {
        en: 'Vaginal bleeding or spotting',
        hi: 'योनि से खून या धब्बे आना',
        kn: 'ಯೋನಿಯಿಂದ ರಕ್ತಸ್ರಾವ'
      },
      desc: {
        en: 'Threat of miscarriage or placenta separation',
        hi: 'गर्भपात या प्लेसेंटा अलग होने का गंभीर खतरा',
        kn: 'ಗರ್ಭಪಾತ ಅಥವಾ ಜರಾಯು ಬೇರ್ಪಡುವ ಅಪಾಯ'
      }
    },
    {
      id: 'severe_headache_vision',
      emoji: '⚡',
      title: {
        en: 'Severe headache with blurred vision / spots',
        hi: 'तेज सिरदर्द के साथ आंखों के आगे धुंधलापन',
        kn: 'ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣು ಮಂಜಾಗುವುದು'
      },
      desc: {
        en: 'Danger sign of severe High BP (Pre-eclampsia/Eclampsia)',
        hi: 'अत्यधिक हाई बी.पी. और दौरे पड़ने का लक्षण',
        kn: 'ಅಧಿಕ ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಮೂರ್ಛೆಯ ಲಕ್ಷಣ'
      }
    },
    {
      id: 'facial_puffiness',
      emoji: '💧',
      title: {
        en: 'Sudden swelling on face and hands in morning',
        hi: 'सुबह चेहरे और हाथों पर अचानक सूजन आ जाना',
        kn: 'ಮುಖ ಮತ್ತು ಕೈಗಳಲ್ಲಿ ಹಠಾತ್ ಊತ'
      },
      desc: {
        en: 'Sign of protein leak and blood pressure spike',
        hi: 'खून का दबाव बढ़ने और गुर्दे पर दबाव का संकेत',
        kn: 'ರಕ್ತದೊತ್ತಡ ಹೆಚ್ಚಳದ ಚಿಹ್ನೆ'
      }
    },
    {
      id: 'reduced_fetal_movement',
      emoji: '👶',
      title: {
        en: 'Decreased or no baby movements (<10 kicks / 12h)',
        hi: 'गर्भ में बच्चे की हलचल कम होना या बंद होना',
        kn: 'ಮಗುವಿನ ಚಲನವಲನ ಕಡಿಮೆಯಾಗುವುದು'
      },
      desc: {
        en: 'Urgent sign of fetal distress or umbilical cord issue',
        hi: 'गर्भस्थ शिशु की परेशानी का तत्काल संकेत',
        kn: 'ಗರ್ಭದಲ್ಲಿ ಮಗುವಿಗೆ ತೊಂದರೆಯಾಗುತ್ತಿರುವ ಸಂಕೇತ'
      }
    },
    {
      id: 'water_leakage',
      emoji: '🌊',
      title: {
        en: 'Sudden gush or leakage of watery fluid',
        hi: 'प्रसव समय से पहले अचानक पानी की थैली फटना',
        kn: 'ಹೆರಿಗೆಯ ಮುನ್ನವೇ ನೀರಿನ ಒಸರುವಿಕೆ'
      },
      desc: {
        en: 'Premature rupture of membranes (infection risk)',
        hi: 'संक्रमण और समय से पूर्व प्रसव का जोखिम',
        kn: 'ಸೋಂಕಿನ ಮತ್ತು ಅಕಾಲಿಕ ಹೆರಿಗೆಯ ಅಪಾಯ'
      }
    },
    {
      id: 'severe_abdominal_pain',
      emoji: '💥',
      title: {
        en: 'Continuous sharp pain in lower abdomen',
        hi: 'पेट के निचले हिस्से में लगातार तेज दर्द',
        kn: 'ಹೊಟ್ಟೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ನಿರಂತರ ತೀವ್ರ ನೋವು'
      },
      desc: {
        en: 'Danger sign of uterine tenderness or infection',
        hi: 'गर्भाशय में संक्रमण या खिंचाव',
        kn: 'ಗರ್ಭಾಶಯದ ತೊಂದರೆ'
      }
    },
    {
      id: 'high_fever_chills',
      emoji: '🌡️',
      title: {
        en: 'High fever (>101°F) with shaking chills',
        hi: 'तेज बुखार और कंपकंपी',
        kn: 'ತೀವ್ರ ಜ್ವರ ಮತ್ತು ನಡುಕ'
      },
      desc: {
        en: 'Maternal infection that can harm the baby',
        hi: 'गंभीर संक्रमण जो शिशु के लिए हानिकारक है',
        kn: 'ಮಗುವಿಗೆ ಅಪಾಯ ತರಬಹುದಾದ ಸೋಂಕು'
      }
    }
  ];

  const toggleDangerSign = (id: string) => {
    setSelectedDangerSigns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const hasHighRiskDanger = selectedDangerSigns.length > 0;
  const trimester = month <= 3 ? 1 : month <= 6 ? 2 : 3;

  const handleFinishAndSave = () => {
    onFinishCheckup({
      patientCode,
      patientName: patientName || 'Pregnant Mother',
      age,
      isPregnant: true,
      pregnancyMonths: month,
      isFirstPregnancy,
      pregnancyRedFlags: selectedDangerSigns,
      isPregnancyPath: true,
      resultSeverity: hasHighRiskDanger ? 'emergency' : 'mild',
      selectedSymptoms: selectedDangerSigns.length > 0 ? selectedDangerSigns : ['routine_pregnancy_check'],
      date: Date.now()
    });
  };

  const handleSpeakGuidance = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakText(text, language, () => setIsSpeaking(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 text-slate-800 dark:text-slate-100 overflow-y-auto font-sans">
      <div className="max-w-xl mx-auto w-full my-auto bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (currentStep > 0) setCurrentStep((prev) => prev - 1);
                else onClose();
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Antenatal Health Assessment
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                {language === 'hi'
                  ? 'माता व गर्भस्थ शिशु स्वास्थ्य जांच'
                  : language === 'kn'
                  ? 'ತಾಯಿ ಮತ್ತು ಗರ್ಭಸ್ಥ ಶಿಶುವಿನ ಆರೋಗ್ಯ ತಪಾಸಣೆ'
                  : 'Mother & Unborn Child Pregnancy Checkup'}
              </h2>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-black text-xs">
            Step {currentStep + 1} of 4
          </span>
        </div>

        {/* STEP 0: Gestational Month & Pregnancy History */}
        {currentStep === 0 && (
          <div className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <span className="text-3xl">🤰</span>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                {language === 'hi' ? 'गर्भावस्था का कौन सा महीना चल रहा है?' : 'Which month of pregnancy are you in?'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'उचित सलाह और जांच के लिए गर्भावस्था का समय बताएं' : 'Select your current month to personalize antenatal advice'}
              </p>
            </div>

            {/* Big Month Selector (1 to 9) */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-center space-y-3">
              <span className="text-4xl font-black text-rose-600 dark:text-rose-400 font-mono">
                Month {month}
              </span>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {month <= 3
                  ? '1st Trimester (1 to 12 Weeks) • Organ formation'
                  : month <= 6
                  ? '2nd Trimester (13 to 27 Weeks) • Rapid baby growth'
                  : '3rd Trimester (28 to 40 Weeks) • Final delivery preparation'}
              </div>

              {/* Grid of 1 to 9 buttons */}
              <div className="grid grid-cols-9 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonth(m)}
                    className={`py-2 rounded-xl font-black text-sm transition active:scale-95 ${
                      month === m
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-rose-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* First Pregnancy vs Subsequent */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'क्या यह आपकी पहली डिलीवरी है?' : 'Is this your first pregnancy?'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsFirstPregnancy(true)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                    isFirstPregnancy
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200'
                  }`}
                >
                  {language === 'hi' ? 'हाँ, पहली बार (First Time)' : 'Yes, First Time'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFirstPregnancy(false)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                    !isFirstPregnancy
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200'
                  }`}
                >
                  {language === 'hi' ? 'पहले भी बच्चे हैं' : 'Had previous delivery'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>{t.next} (Danger Signs Screening) →</span>
            </button>
          </div>
        )}

        {/* STEP 1: Obstetric Danger Signs (Red Flags) */}
        {currentStep === 1 && (
          <div className="space-y-3.5 pt-1">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider inline-block mb-1">
                Priority Safety Check
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                {language === 'hi'
                  ? 'क्या इनमें से कोई भी खतरे का लक्षण महसूस हो रहा है?'
                  : 'Do you have any of these maternal danger signs?'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'गर्भावस्था में ये लक्षण दिखने पर तुरंत अस्पताल जाना जरूरी है:'
                  : 'Tap any danger sign if experienced recently:'}
              </p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {dangerSignsList.map((ds) => {
                const isSelected = selectedDangerSigns.includes(ds.id);
                return (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => toggleDangerSign(ds.id)}
                    className={`w-full p-3 rounded-2xl border-2 text-left flex items-start gap-2.5 transition active:scale-98 ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{ds.emoji}</span>
                    <div className="flex-1">
                      <span className="font-bold text-xs sm:text-sm block">
                        {ds.title[language] || ds.title.en}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-tight">
                        {ds.desc[language] || ds.desc.en}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-1" />}
                  </button>
                );
              })}

              {/* None Button */}
              <button
                type="button"
                onClick={() => setSelectedDangerSigns([])}
                className={`w-full p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition ${
                  selectedDangerSigns.length === 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold">
                  {language === 'hi' ? 'नहीं, इनमें से कोई खतरे का लक्षण नहीं है' : 'No, none of these danger signs'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>{t.next} (Antenatal Checkups) →</span>
            </button>
          </div>
        )}

        {/* STEP 2: Antenatal Care Checklist (ANC) */}
        {currentStep === 2 && (
          <div className="space-y-3.5 pt-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                {language === 'hi' ? 'जरूरी टीके और दवाइयां' : 'Essential Vaccines & Supplements'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'सरकारी दिशानिर्देशों के अनुसार जांचें कि आपको ये मिल रहे हैं:'
                  : 'Verify routine antenatal care received at Anganwadi / Subcentre:'}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* TT / Td Injections */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">
                    💉 {language === 'hi' ? 'टिटनेस (TT / Td) का टीका' : 'Tetanus Toxoid (TT / Td) Injections'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'गर्भावस्था में 2 टीके जरूरी हैं' : '2 doses required during pregnancy'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReceivedTT(true)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      receivedTT ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceivedTT(false)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      !receivedTT ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    PENDING
                  </button>
                </div>
              </div>

              {/* Iron Folic Acid (IFA) Tablets */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">
                    🔴 {language === 'hi' ? 'आयरन फोलिक एसिड (लाल गोली)' : 'Daily Iron Folic Acid (IFA) Tablets'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'खून की कमी (एनीमिया) से बचाव के लिए' : 'Prevents maternal anemia & birth defects'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTakingIFA(true)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      takingIFA ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    TAKING
                  </button>
                  <button
                    type="button"
                    onClick={() => setTakingIFA(false)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      !takingIFA ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    NO
                  </button>
                </div>
              </div>

              {/* Calcium Tablets */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">
                    ⚪ {language === 'hi' ? 'कैल्शियम की गोली' : 'Daily Calcium Tablets'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'हड्डियों और बी.पी. सामान्य रखने के लिए' : 'Strengthens bones and fetal skeletal growth'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTakingCalcium(true)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      takingCalcium ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    TAKING
                  </button>
                  <button
                    type="button"
                    onClick={() => setTakingCalcium(false)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      !takingCalcium ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    NO
                  </button>
                </div>
              </div>

              {/* BP & Weight Checked */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">
                    🩺 {language === 'hi' ? 'इस महीने बी.पी. व वजन की जांच' : 'BP & Weight Checked this Month'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'आशा दीदी या उपकेंद्र पर' : 'At Subcentre / Anganwadi VHSND day'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBpCheckedThisMonth(true)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      bpCheckedThisMonth ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => setBpCheckedThisMonth(false)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      !bpCheckedThisMonth ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    DUE
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>{t.next} (View Maternal Care Report) →</span>
            </button>
          </div>
        )}

        {/* STEP 3: Complete Maternal Health Report & Safe Home Plan */}
        {currentStep === 3 && (
          <div className="space-y-4 pt-1">
            {/* Urgency Status Banner */}
            <div
              className={`p-4 sm:p-5 rounded-3xl border-2 text-white shadow-lg ${
                hasHighRiskDanger
                  ? 'bg-gradient-to-r from-rose-600 to-red-700 border-red-400'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-700 border-teal-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{hasHighRiskDanger ? '🚨' : '🤰'}</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-0.5">
                    {hasHighRiskDanger ? 'HIGH RISK PREGNANCY ALERT' : 'NORMAL ANTENATAL CARE PLAN'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    {hasHighRiskDanger
                      ? (language === 'hi' ? 'उच्च जोखिम गर्भावस्था — तुरंत अस्पताल जाएं' : 'High Risk Pregnancy — Immediate Medical Visit Required')
                      : (language === 'hi' ? 'माता व शिशु दोनों स्वस्थ — नियमित देखभाल जारी रखें' : 'Mother & Baby Healthy — Routine Antenatal Care')}
                  </h3>
                </div>
              </div>

              {hasHighRiskDanger && (
                <div className="mt-3 pt-3 border-t border-white/20 flex gap-2">
                  <a
                    href="tel:108"
                    className="flex-1 py-2 px-3 rounded-xl bg-white text-rose-700 font-black text-xs text-center shadow-md active:scale-95 transition"
                  >
                    CALL 108 AMBULANCE
                  </a>
                  <a
                    href="tel:104"
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-900 text-white font-black text-xs text-center border border-white/20"
                  >
                    CALL 104 HELPLINE
                  </a>
                </div>
              )}
            </div>

            {/* Mother Nutrition & Care Rules */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <span className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider block">
                {language === 'hi' ? 'गर्भवती माता के लिए 5 जरूरी नियम' : '5 Essential Maternal Rules:'}
              </span>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{language === 'hi' ? 'बाईं करवट सोएं' : 'Sleep on Left Side:'}</strong> {language === 'hi' ? 'बाईं करवट सोने से गर्भ में शिशु तक खून और ऑक्सीजन बेहतर पहुंचता है।' : 'Increases blood & oxygen flow to baby.'}
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{language === 'hi' ? 'पौष्टिक आहार' : 'Iron-rich Diet:'}</strong> {language === 'hi' ? 'हरी पत्तेदार सब्जियां (पालक), गुड़, चना, दालें, दूध और अंडा खाएं।' : 'Green leafy vegetables, jaggery, lentils, milk.'}
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{language === 'hi' ? 'भारी वजन न उठाएं' : 'Avoid Heavy Lifting:'}</strong> {language === 'hi' ? 'पानी का भारी घड़ा या भारी बोरी उठाने से बचें और दोपहर में 2 घंटे आराम करें।' : 'Do not lift heavy water pots; rest 2 hours daily.'}
                  </span>
                </li>
                {!takingIFA && (
                  <li className="flex items-start gap-1.5 text-rose-600 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'आयरन की लाल गोली तुरंत शुरू करें (आशा दीदी से मुफ्त लें)।' : 'Start Iron Folic Acid tablets immediately from ASHA.'}</span>
                  </li>
                )}
                {!receivedTT && (
                  <li className="flex items-start gap-1.5 text-rose-600 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'टिटनेस (TT / Td) का छूटा हुआ टीका तुरंत लगवाएं।' : 'Get your due TT / Td injection at PHC without delay.'}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Government Schemes Info */}
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 space-y-1">
              <span className="font-black uppercase tracking-wider block">
                🇮🇳 Government Maternity Benefits Available:
              </span>
              <p>• <strong>PMMVY:</strong> ₹5,000 direct bank transfer for pregnant mothers.</p>
              <p>• <strong>Janani Suraksha Yojana (JSY):</strong> ₹1,400 incentive & free transport for hospital birth.</p>
              <p>• <strong>Free Health Checks:</strong> Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) on 9th of every month.</p>
            </div>

            {/* Read Aloud Guidance & Finalize */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  handleSpeakGuidance(
                    hasHighRiskDanger
                      ? 'उच्च जोखिम गर्भावस्था। कृपया तुरंत 108 एम्बुलेंस से नजदीकी अस्पताल जाएं।'
                      : 'माता व शिशु दोनों सुरक्षित हैं। बाईं करवट सोएं, आयरन की गोली लें, और नियमित जांच कराएं।'
                  )
                }
                className="flex-1 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
                <span>{isSpeaking ? 'Stop Speaking' : 'Read Aloud'}</span>
              </button>

              <button
                type="button"
                onClick={handleFinishAndSave}
                className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save to Medical Slip</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
