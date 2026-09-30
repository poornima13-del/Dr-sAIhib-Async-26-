import React, { useState } from 'react';
import { Language, AshaContact, CheckRecord } from '../types';
import { translations } from '../data/translations';
import { speakText, stopSpeaking } from '../utils/voice';
import {
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
  HeartPulse,
  UserCheck,
  Stethoscope,
  Info,
  Clock,
  Activity
} from 'lucide-react';

interface CancerCheckupProps {
  language: Language;
  patientName: string;
  patientCode: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  ashaContact: AshaContact | null;
  onClose: () => void;
  onFinishCheckup: (record: Partial<CheckRecord>) => void;
}

export const CancerCheckup: React.FC<CancerCheckupProps> = ({
  language,
  patientName,
  patientCode,
  age,
  gender,
  ashaContact,
  onClose,
  onFinishCheckup
}) => {
  const t = translations[language] || translations.en;

  // Step 0: Primary Anatomical Target Warning Signs
  // Step 1: Tobacco, Habits & Family Exposure
  // Step 2: Duration & Systemic Flags
  // Step 3: Diagnostic Assessment & Hospital Referral Plan
  const [currentStep, setCurrentStep] = useState(0);

  // Warning symptoms selected
  const [selectedSigns, setSelectedSigns] = useState<string[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [duration, setDuration] = useState<'3_weeks' | '2_months' | '6_months'>('3_weeks');
  const [familyCancer, setFamilyCancer] = useState<'yes' | 'no' | 'unknown'>('no');
  const [hasWeightLoss, setHasWeightLoss] = useState<boolean>(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const cancerWarningCategories = [
    {
      id: 'oral_mouth_ulcer',
      emoji: '👄',
      organ: { en: 'Mouth & Throat (Oral Cavity)', hi: 'मुंह, जीभ और गाल', kn: 'ಬಾಯಿ ಮತ್ತು ಗಂಟಲು' },
      title: {
        en: 'White/red patch or non-healing mouth ulcer > 3 weeks',
        hi: 'मुंह में सफेद या लाल छाला जो 3 हफ्ते से न भर रहा हो',
        kn: '3 ವಾರಗಳಾದರೂ ವಾಸಿಯಾಗದ ಬಾಯಿಯ ಹುಣ್ಣು ಅಥವಾ ಬಿಳಿ ಕಲೆ'
      },
      desc: {
        en: 'High alert for tobacco / gutka / pan chewers (Leukoplakia / Oral Cancer)',
        hi: 'तंबाकू, गुटखा या पान खाने वालों में ओरल कैंसर की मुख्य चेतावनी',
        kn: 'ತಂಬಾಕು, ಗುಟ್ಕಾ ಸೇವಿಸುವವರಲ್ಲಿ ಬಾಯಿ ಕ್ಯಾನ್ಸರ್ ಮುನ್ಸೂಚನೆ'
      }
    },
    {
      id: 'breast_lump',
      genderLimit: 'female',
      emoji: '🩺',
      organ: { en: 'Breast & Underarm', hi: 'स्तन व कांख (बगल)', kn: 'ಎದೆ ಮತ್ತು ಕಂಕುಳು' },
      title: {
        en: 'Painless hard lump in breast or armpit / nipple retraction',
        hi: 'स्तन या कांख में बिना दर्द की सख्त गांठ या निप्पल का अंदर धंसना',
        kn: 'ಎದೆ ಅಥವಾ ಕಂಕುಳಿನಲ್ಲಿ ನೋವಿಲ್ಲದ ಗಟ್ಟಿಯಾದ ಗಡ್ಡೆ'
      },
      desc: {
        en: '#1 cancer in Indian women. Early detection gives >95% cure rate',
        hi: 'महिलाओं में सबसे आम कैंसर। शुरुआती जांच से 95% से अधिक इलाज संभव',
        kn: 'ಮಹಿಳೆಯರಲ್ಲಿ ಆರಂಭದಲ್ಲೇ ಗುರುತಿಸಿದರೆ ಶೇ.95 ಗುಣಪಡಿಸಬಹುದು'
      }
    },
    {
      id: 'cervical_bleeding',
      genderLimit: 'female',
      emoji: '🩸',
      organ: { en: 'Cervix & Uterus', hi: 'गर्भाशय (बच्चेदानी का मुंह)', kn: 'ಗರ್ಭಕಂಠ ಮತ್ತು ಗರ್ಭಾಶಯ' },
      title: {
        en: 'Abnormal bleeding between periods or after menopause / foul discharge',
        hi: 'माहवारी के अलावा या मीनोपॉज (उम्र ढलने) के बाद खून या बदबूदार पानी',
        kn: 'ಮುಟ್ಟಿನ ಮಧ್ಯೆ ಅಥವಾ ಮುಟ್ಟು ನಿಂತ ಮೇಲೆ ರಕ್ತಸ್ರಾವ'
      },
      desc: {
        en: 'Cervical cancer warning sign. Detected easily with VIA / Pap smear test',
        hi: 'सर्वाइकल कैंसर का लक्षण। उपकेंद्र पर वीआईए या पैप स्मीयर से आसान जांच',
        kn: 'ಗರ್ಭಕಂಠದ ಕ್ಯಾನ್ಸರ್ ಲಕ್ಷಣ. ಸರಳ ತಪಾಸಣೆಯಿಂದ ಪತ್ತೆ ಹಚ್ಚಬಹುದು'
      }
    },
    {
      id: 'lung_hemoptysis',
      emoji: '🫁',
      organ: { en: 'Lungs & Windpipe', hi: 'फेफड़े और सांस नली', kn: 'ಶ್ವಾಸಕೋಶ' },
      title: {
        en: 'Persistent cough > 3 weeks, coughing streaks of blood or hoarseness',
        hi: '3 हफ्ते से लगातार खांसी, खांसी में खून के छींटे या आवाज बैठना',
        kn: '3 ವಾರಗಳಿಂದ ನಿರಂತರ ಕೆಮ್ಮು ಅಥವಾ ಕೆಮ್ಮಿನಲ್ಲಿ ರಕ್ತ'
      },
      desc: {
        en: 'Critical warning sign in bidi/cigarette smokers and firewood exposure',
        hi: 'बीड़ी, सिगरेट और चूल्हे के धुएं के संपर्क में रहने वालों में फेफड़ों का जोखिम',
        kn: 'ಬೀಡಿ, ಸಿಗರೇಟು ಸೇದುವವರಲ್ಲಿ ಶ್ವಾಸಕೋಶದ ಕ್ಯಾನ್ಸರ್ ಅಪಾಯ'
      }
    },
    {
      id: 'esophagus_dysphagia',
      emoji: '🥣',
      organ: { en: 'Food-pipe & Stomach', hi: 'अन्नप्रणाली व आमाशय (पेट)', kn: 'ಅನ್ನನಾಳ ಮತ್ತು ಜಠರ' },
      title: {
        en: 'Progressive difficulty swallowing solid food or food sticking in chest',
        hi: 'रोटी या ठोस खाना निगलने में लगातार रुकावट या गले में अटकना',
        kn: 'ಘನ ಆಹಾರ ನುಂಗಲು ಕಷ್ಟವಾಗುವುದು ಅಥವಾ ಅನ್ನನಾಳದಲ್ಲಿ ಸಿಲುಕುವುದು'
      },
      desc: {
        en: 'Warning sign of esophagus (food pipe) narrowing or gastric tumor',
        hi: 'भोजन नली में सिकुड़न या पेट के ट्यूमर का संकेत (एंडोस्कोपी जरूरी)',
        kn: 'ಅನ್ನನಾಳ ಅಥವಾ ಜಠರದ ತೊಂದರೆಯ ಸಂಕೇತ'
      }
    },
    {
      id: 'bowel_rectal_bleed',
      emoji: '💩',
      organ: { en: 'Bowel & Colon', hi: 'बड़ी आंत और मलाशय', kn: 'ದೊಡ್ಡ ಕರುಳು' },
      title: {
        en: 'Dark blood in stool, persistent diarrhea/constipation change > 3 weeks',
        hi: 'शौच में काला या लाल खून आना, 3 हफ्ते से पेट साफ होने की आदत में बदलाव',
        kn: 'ಮಲದಲ್ಲಿ ರಕ್ತ ಅಥವಾ ಮಲವಿಸರ್ಜನೆಯಲ್ಲಿ ನಿರಂತರ ಬದಲಾವಣೆ'
      },
      desc: {
        en: 'Colorectal warning sign requiring digital exam and colonoscopy',
        hi: 'बवासीर से अलग आंत के कैंसर का संकेत',
        kn: 'ಕರುಳಿನ ತಪಾಸಣೆ ಅಗತ್ಯವಿರುವ ಚಿಹ್ನೆ'
      }
    },
    {
      id: 'lymph_nodes_neck',
      emoji: '🩺',
      organ: { en: 'Neck & Lymph Nodes', hi: 'गले व कांख की लसिका ग्रंथियां', kn: 'ಕುತ್ತಿಗೆಯ ಗಡ್ಡೆಗಳು' },
      title: {
        en: 'Firm, painless swelling or lumps on neck, collarbone or groin',
        hi: 'गले, हंसली की हड्डी या जांघ में बिना दर्द वाली सख्त गांठें',
        kn: 'ಕುತ್ತಿಗೆ ಅಥವಾ ತೊಡೆಯ ಸಂದುಗಳಲ್ಲಿ ನೋವಿಲ್ಲದ ಊತ'
      },
      desc: {
        en: 'Can indicate lymphoma, metastatic spread, or chronic tubercular glands',
        hi: 'बायोप्सी या एफ.एन.ए.सी (FNAC) जांच द्वारा तुरंत पुष्टि जरूरी',
        kn: 'ಎಫ್‌ಎನ್‌ಎಸಿ ತಪಾಸಣೆ ಅಗತ್ಯವಿರುವ ಗಡ್ಡೆಗಳು'
      }
    }
  ];

  const toggleSign = (id: string) => {
    setSelectedSigns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleHabit = (h: string) => {
    setSelectedHabits((prev) =>
      prev.includes(h) ? prev.filter((item) => item !== h) : [...prev, h]
    );
  };

  // Diagnostic warning scoring
  const hasHighRiskSigns =
    selectedSigns.includes('oral_mouth_ulcer') ||
    selectedSigns.includes('breast_lump') ||
    selectedSigns.includes('cervical_bleeding') ||
    selectedSigns.includes('lung_hemoptysis') ||
    selectedSigns.includes('esophagus_dysphagia');

  const hasHabitRisk = selectedHabits.length > 0;

  const warningLevel: 'high' | 'watch' | 'low' =
    hasHighRiskSigns || (selectedSigns.length >= 2 && hasHabitRisk)
      ? 'high'
      : selectedSigns.length > 0 || hasWeightLoss
      ? 'watch'
      : 'low';

  const handleFinishAndSave = () => {
    onFinishCheckup({
      patientCode,
      patientName: patientName || 'Patient',
      age,
      gender,
      cancerWarningLevel: warningLevel,
      cancerWarningReasons: selectedSigns,
      habits: selectedHabits,
      cancerFamilyHistory: familyCancer,
      resultSeverity: warningLevel === 'high' ? 'emergency' : warningLevel === 'watch' ? 'moderate' : 'mild',
      selectedSymptoms: selectedSigns.length > 0 ? selectedSigns : ['cancer_screen_normal'],
      date: Date.now()
    });
  };

  const handleSpeakSpeech = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakText(text, language, () => setIsSpeaking(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 text-slate-800 dark:text-slate-100 overflow-y-auto font-sans">
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
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Specialized Oncology Triage
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                {language === 'hi'
                  ? 'कैंसर शुरुआती चेतावनी जांच (स्क्रीनिंग)'
                  : language === 'kn'
                  ? 'ಕ್ಯಾನ್ಸರ್ ಆರಂಭಿಕ ಎಚ್ಚರಿಕೆ ತಪಾಸಣೆ'
                  : 'Cancer Early Warning Diagnosis'}
              </h2>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-black text-xs">
            Step {currentStep + 1} of 3
          </span>
        </div>

        {/* STEP 0: Specific Cancer Symptoms (No generic cold/cough) */}
        {currentStep === 0 && (
          <div className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                {language === 'hi'
                  ? 'क्या इनमें से कोई भी लगातार संकेत महसूस हो रहा है?'
                  : 'Do you notice any of these persistent cancer warning signs?'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'कैंसर के संकेत आम सर्दी-खांसी से अलग होते हैं और 3 हफ्ते से ज्यादा टिके रहते हैं:'
                  : 'Targeted organ-specific signs lasting over 3 weeks:'}
              </p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {cancerWarningCategories
                .filter((cat) => !cat.genderLimit || cat.genderLimit === gender)
                .map((cat) => {
                  const isSelected = selectedSigns.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleSign(cat.id)}
                      className={`w-full p-3 rounded-2xl border-2 text-left flex items-start gap-2.5 transition active:scale-98 ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{cat.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            {cat.organ[language] || cat.organ.en}
                          </span>
                        </div>
                        <span className="font-bold text-xs sm:text-sm block text-slate-800 dark:text-slate-100 mt-0.5">
                          {cat.title[language] || cat.title.en}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-tight">
                          {cat.desc[language] || cat.desc.en}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-1" />}
                    </button>
                  );
                })}

              {/* None Button */}
              <button
                type="button"
                onClick={() => setSelectedSigns([])}
                className={`w-full p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition ${
                  selectedSigns.length === 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold">
                  {language === 'hi' ? 'नहीं, इनमें से कोई भी लक्षण नहीं है' : 'No, none of these warning signs'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>{t.next} (Habits & Exposure) →</span>
            </button>
          </div>
        )}

        {/* STEP 1: Tobacco, Daily Habits & Systemic Flags */}
        {currentStep === 1 && (
          <div className="space-y-4 pt-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                {language === 'hi' ? 'तंबाकू की आदतें और वजन का घटना' : 'Habits, Exposure & Weight Changes'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'ग्रामीण भारत में 60% से अधिक कैंसर तंबाकू और बीड़ी की वजह से होते हैं:'
                  : 'Tobacco is the leading driver of rural cancers in India:'}
              </p>
            </div>

            {/* Habits Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-slate-500">
                {language === 'hi' ? 'दैनिक आदतें (जो लागू हो चुनें)' : 'Daily Habits (Tap if any)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gutka_tobacco', label: '🌿 Khaini / Gutka / Tobacco', sub: 'Kept in mouth' },
                  { id: 'bidi_smoking', label: '🚬 Bidi / Cigarette Smoke', sub: 'Smoked daily' },
                  { id: 'alcohol', label: '🍷 Alcohol Drink', sub: 'Liver / Esophagus risk' },
                  { id: 'pan_masala', label: '🍃 Betel Quid / Areca Nut', sub: 'Submucous fibrosis' }
                ].map((item) => {
                  const isSelected = selectedHabits.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleHabit(item.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100 font-black shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unexplained Weight Loss Toggle */}
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-rose-900 dark:text-rose-200 block">
                  📉 {language === 'hi' ? 'अचानक तेजी से वजन घटना (> 5-10 किलो)' : 'Unexplained Rapid Weight Loss (>5 kg)'}
                </span>
                <span className="text-[11px] text-rose-800 dark:text-rose-300">
                  {language === 'hi' ? 'बिना किसी डाइटिंग या बीमारी के वजन तेजी से गिरना' : 'Losing weight rapidly without intentional dieting'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasWeightLoss(!hasWeightLoss)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                  hasWeightLoss ? 'bg-rose-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700'
                }`}
              >
                {hasWeightLoss ? 'YES' : 'NO'}
              </button>
            </div>

            {/* Duration */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                {language === 'hi' ? 'यह परेशानी कितने समय से बनी हुई है?' : 'How long have you noticed these signs?'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '3_weeks' as const, label: '> 3 Weeks' },
                  { id: '2_months' as const, label: '> 2 Months' },
                  { id: '6_months' as const, label: '> 6 Months' }
                ].map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setDuration(dur.id)}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      duration === dur.id
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>{t.next} (Cancer Diagnosis Report) →</span>
            </button>
          </div>
        )}

        {/* STEP 2: Diagnostic Guidance & Referral Plan */}
        {currentStep === 2 && (
          <div className="space-y-4 pt-1">
            {/* Warning Banner */}
            <div
              className={`p-4 sm:p-5 rounded-3xl border-2 text-white shadow-lg ${
                warningLevel === 'high'
                  ? 'bg-gradient-to-r from-rose-600 to-red-700 border-red-400'
                  : warningLevel === 'watch'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-700 border-amber-400'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {warningLevel === 'high' ? '⚠️' : warningLevel === 'watch' ? '🔍' : '✅'}
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-0.5">
                    {warningLevel === 'high'
                      ? 'HIGH EARLY-WARNING SUSPICION'
                      : warningLevel === 'watch'
                      ? 'MODERATE WATCH — SCREENING ADVISED'
                      : 'LOW RISK — ROUTINE PREVENTION'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    {warningLevel === 'high'
                      ? (language === 'hi' ? 'उच्च चेतावनी — जिला अस्पताल NCD क्लीनिक जाएं' : 'High Early Warning — Visit District Hospital NCD Clinic')
                      : warningLevel === 'watch'
                      ? (language === 'hi' ? 'जांच जरूरी — नजदीकी स्वास्थ्य केंद्र (PHC) दिखाएं' : 'Medical Test Advised — Consult PHC Doctor')
                      : (language === 'hi' ? 'कोई खतरनाक लक्षण नहीं — तंबाकू से दूर रहें' : 'No Critical Signs Observed — Maintain Healthy Habits')}
                  </h3>
                </div>
              </div>
            </div>

            {/* Reassurance Banner */}
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
              <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  {language === 'hi' ? 'घबराएं नहीं, समय पर जांच ही जीवन रक्षा है' : 'Do Not Panic — Early Testing Means Full Cure'}
                </span>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-0.5 leading-relaxed">
                  {language === 'hi'
                    ? '80% गांठें और छाले सामान्य संक्रमण होते हैं और कैंसर नहीं होते। लेकिन डॉक्टर द्वारा बायोप्सी या जांच कराने से ही सच्चाई का पता चलता है और शुरुआती दौर में कैंसर 100% ठीक हो सकता है।'
                    : 'Over 80% of lumps and ulcers turn out to be benign. However, early laboratory tests are the only definitive way to rule out cancer and achieve complete cure.'}
                </p>
              </div>
            </div>

            {/* Recommended Diagnostic Tests */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <span className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider block">
                {language === 'hi' ? 'सरकारी अस्पताल में करवाने योग्य आवश्यक जांचें:' : 'Recommended Clinical Diagnostic Tests:'}
              </span>
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                {selectedSigns.includes('oral_mouth_ulcer') && (
                  <p className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    🔬 <strong>Oral Biopsy:</strong> Small painless scrape/tissue test to verify ulcer tissue.
                  </p>
                )}
                {selectedSigns.includes('breast_lump') && (
                  <p className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                    🩺 <strong>Mammography / FNAC:</strong> Needle aspiration test to examine breast lump cells.
                  </p>
                )}
                {selectedSigns.includes('cervical_bleeding') && (
                  <p className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    🔬 <strong>VIA / Pap Smear:</strong> Visual acetic acid test available free at Subcentre / PHC.
                  </p>
                )}
                {selectedSigns.includes('lung_hemoptysis') && (
                  <p className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    🫁 <strong>Chest X-Ray / Sputum test:</strong> Checks lung fields and rules out active TB or mass.
                  </p>
                )}
                {selectedSigns.includes('esophagus_dysphagia') && (
                  <p className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    🥣 <strong>Upper GI Endoscopy:</strong> Camera view of food pipe to detect cause of swallowing issue.
                  </p>
                )}
                {selectedSigns.length === 0 && (
                  <p className="text-slate-500">
                    Continue regular monthly self-examinations (mouth checks for tobacco users, breast self-exam for women).
                  </p>
                )}
              </div>
            </div>

            {/* Government Ayushman Bharat Cover */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
              <strong>Ayushman Bharat PM-JAY:</strong> Free oncology diagnosis, surgery, and chemotherapy up to ₹5 Lakh per family at all empanelled tertiary hospitals.
            </div>

            {/* Read Aloud & Save Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  handleSpeakSpeech(
                    warningLevel === 'high'
                      ? 'कैंसर शुरुआती चेतावनी जांच। जिला अस्पताल के एनसीडी क्लीनिक में बायोप्सी या विशेषज्ञ जांच कराएं। समय पर पहचान जान बचाती है।'
                      : 'कैंसर जांच रिपोर्ट तैयार है। तंबाकू का सेवन तुरंत बंद करें और नजदीकी स्वास्थ्य केंद्र में डॉक्टर से मिलें।'
                  )
                }
                className="flex-1 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
                <span>{isSpeaking ? 'Stop Speaking' : 'Read Aloud'}</span>
              </button>

              <button
                type="button"
                onClick={handleFinishAndSave}
                className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
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
