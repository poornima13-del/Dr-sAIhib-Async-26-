import React, { useState } from 'react';
import { CheckRecord, Language, AshaContact } from '../types';
import { translations } from '../data/translations';
import { speakText, stopSpeaking } from '../utils/voice';
import {
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  Printer,
  Share2,
  Volume2,
  VolumeX,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Heart,
  Activity,
  FileText
} from 'lucide-react';

interface ResultScreenProps {
  language: Language;
  record: CheckRecord;
  ashaContact: AshaContact | null;
  onPrint: () => void;
  onStartOver: () => void;
  onOpenRecords: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  language,
  record,
  ashaContact,
  onPrint,
  onStartOver,
  onOpenRecords
}) => {
  const t = translations[language] || translations.en;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSelfExamModal, setShowSelfExamModal] = useState<'breast' | 'oral' | null>(null);

  const isEmergency = record.resultSeverity === 'emergency';
  const isModerate = record.resultSeverity === 'moderate';
  const hasCancerWatch = record.cancerWarningLevel === 'watch' || record.cancerWarningLevel === 'high';
  const highlightAsha = isEmergency || isModerate || hasCancerWatch || record.needsReview || record.underlyingHints.length > 0;

  // Build SMS text payload for offline GSM transmission
  const buildSmsBody = () => {
    const symCount = record.selectedSymptoms.length;
    const dateStr = new Date(record.date).toLocaleDateString();
    return encodeURIComponent(
      `Dr SAIhib Health Report:
Name: ${record.patientName || 'Patient'}
Age: ${record.age}, Gender: ${record.gender}
Severity: ${record.resultSeverity.toUpperCase()}
Symptoms: ${symCount} reported
Cancer Warning: ${record.cancerWarningLevel.toUpperCase()}
Date: ${dateStr}
Please review at PHC/Subcentre.`
    );
  };

  // Build full report speech script
  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const severityText =
      record.resultSeverity === 'emergency'
        ? t.severityEmergencyTitle + '. ' + t.severityEmergencyDesc
        : record.resultSeverity === 'moderate'
        ? t.severityModerateTitle + '. ' + t.severityModerateDesc
        : t.severityMildTitle + '. ' + t.severityMildDesc;

    const conditionText = record.matchedConditions.map((mc) => mc.condition.name[language]).join(', ');
    const fullSpeech = `${t.resultTitle}. ${severityText}. ${t.whatItCouldBe}: ${conditionText}.`;

    speakText(fullSpeech, language);
    setIsSpeaking(true);
  };

  const handleShare = async () => {
    const text = `Dr SAIhib Health Advice for ${record.patientName || 'Patient'}: Assessed Urgency is ${record.resultSeverity.toUpperCase()}.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dr SAIhib Health Guidance',
          text,
          url: window.location.href
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText(text);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Patient Header Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold text-xs">
            ID
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs sm:text-sm text-teal-700 dark:text-teal-300">
                {record.patientCode || 'SAI-PATIENT'}
              </span>
              <span className="font-black text-sm sm:text-base text-slate-800 dark:text-slate-100">
                {record.patientName || 'Patient'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {record.age} Yrs • {record.gender.toUpperCase()} {record.isPregnant ? '• Pregnant' : ''} • {new Date(record.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-teal-100"
            title="Print Advice Slip"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Slip</span>
          </button>
        </div>
      </div>

      {/* 1. Large Severity Banner with Face & Color */}
      <div
        className={`p-6 rounded-3xl border-2 text-white shadow-lg transition-all ${
          isEmergency
            ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 border-red-400'
            : isModerate
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 border-amber-300'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border-emerald-400'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shrink-0">
            {isEmergency ? '🚨' : isModerate ? '⚠️' : '😊'}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
              {record.resultSeverity.toUpperCase()}
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-tight">
              {isEmergency
                ? t.severityEmergencyTitle
                : isModerate
                ? t.severityModerateTitle
                : t.severityMildTitle}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1">
              {isEmergency
                ? t.severityEmergencyDesc
                : isModerate
                ? t.severityModerateDesc
                : t.severityMildDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 2. EMERGENCY RED STICKY / TOP PANEL (If Emergency) */}
      {isEmergency && (
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 shadow-md">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-black text-lg mb-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 animate-bounce" />
            <span>{t.emergencyPanelTitle}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <a
              href="tel:108"
              className="p-3 rounded-2xl bg-rose-600 text-white font-black text-center text-sm shadow-md hover:bg-rose-700 flex flex-col items-center justify-center gap-1 active:scale-95 transition"
            >
              <PhoneCall className="w-5 h-5" />
              <span>{t.callAmbulance108}</span>
            </a>
            <a
              href="tel:104"
              className="p-3 rounded-2xl bg-amber-600 text-white font-black text-center text-sm shadow-md hover:bg-amber-700 flex flex-col items-center justify-center gap-1 active:scale-95 transition"
            >
              <PhoneCall className="w-5 h-5" />
              <span>{t.callHelpline104}</span>
            </a>
            {ashaContact?.doctorPhone && (
              <a
                href={`tel:${ashaContact.doctorPhone}`}
                className="p-3 rounded-2xl bg-slate-800 text-white font-black text-center text-sm shadow-md hover:bg-slate-900 flex flex-col items-center justify-center gap-1 active:scale-95 transition"
              >
                <PhoneCall className="w-5 h-5" />
                <span>{t.callDoctor}</span>
              </a>
            )}
            {ashaContact?.ashaPhone && (
              <a
                href={`tel:${ashaContact.ashaPhone}`}
                className="p-3 rounded-2xl bg-teal-600 text-white font-black text-center text-sm shadow-md hover:bg-teal-700 flex flex-col items-center justify-center gap-1 active:scale-95 transition"
              >
                <PhoneCall className="w-5 h-5" />
                <span>ASHA Didi</span>
              </a>
            )}
          </div>

          {/* First aid guide for emergency */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-xs text-slate-800 dark:text-slate-200 border border-rose-200 dark:border-rose-900">
            <strong className="block font-bold text-rose-700 dark:text-rose-400 mb-1">
              {t.firstAidTitle}
            </strong>
            <p>
              {language === 'hi'
                ? 'मरीज को शांत रखें, सीधा लिटाने के बजाय सहारा देकर बैठाएं या करवट दिलाएं। चलने न दें और तुरंत नजदीकी अस्पताल ले जाएं।'
                : language === 'kn'
                ? 'ರೋಗಿಯನ್ನು ಶಾಂತವಾಗಿರಿಸಿ, ನೇರವಾಗಿ ಮಲಗಿಸುವ ಬದಲು ಆಸರೆ ನೀಡಿ ಕೂರಿಸಿ. ನಡೆಯಲು ಬಿಡಬೇಡಿ ಮತ್ತು ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ.'
                : 'Keep patient calm. Do not allow them to walk or exert. Keep airway clear and transfer to nearest emergency hospital immediately.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Cancer Early-Warning Card (Violet) */}
      {record.cancerWarningLevel !== 'none' && (
        <div className="p-5 rounded-3xl bg-violet-50 dark:bg-violet-950/40 border-2 border-violet-400 dark:border-violet-700 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💜</span>
              <h3 className="font-black text-lg text-violet-950 dark:text-violet-100">
                {t.cancerWarningTitle}
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black ${
                record.cancerWarningLevel === 'high'
                  ? 'bg-rose-600 text-white'
                  : record.cancerWarningLevel === 'watch'
                  ? 'bg-violet-700 text-white'
                  : 'bg-violet-200 text-violet-800'
              }`}
            >
              {record.cancerWarningLevel === 'high'
                ? t.cancerLevelHigh
                : record.cancerWarningLevel === 'watch'
                ? t.cancerLevelWatch
                : t.cancerLevelLow}
            </span>
          </div>

          <p className="text-xs font-semibold text-violet-900/80 dark:text-violet-200 mb-3">
            {t.cancerWarningDisclaimer}
          </p>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-900 text-xs text-slate-700 dark:text-slate-300 mb-3 space-y-1">
            <p className="font-bold text-violet-900 dark:text-violet-300">
              🏛️ {t.freePhcScreening}
            </p>
            <p>
              {language === 'hi'
                ? 'सरकारी प्राथमिक स्वास्थ्य केंद्र (PHC) पर मुंह, स्तन और गर्भाशय के कैंसर की मुफ्त प्राथमिक जांच उपलब्ध है।'
                : language === 'kn'
                ? 'ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರದಲ್ಲಿ ಬಾಯಿ, ಸ್ತನ ಮತ್ತು ಗರ್ಭಕೋಶದ ಕ್ಯಾನ್ಸರ್ ತಪಾಸಣೆ ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿದೆ.'
                : 'Government PHCs provide 100% free screening and counseling for oral, breast, and cervical wellness.'}
            </p>
          </div>

          {/* Self-Examination Helper Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowSelfExamModal('breast')}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>🌸</span>
              <span>{language === 'hi' ? 'स्तन स्वयं-जांच गाइड' : language === 'kn' ? 'ಸ್ತನ ಸ್ವಯಂ-ಪರೀಕ್ಷೆ ವಿಧಾನ' : 'Breast Self-Exam Guide'}</span>
            </button>
            <button
              onClick={() => setShowSelfExamModal('oral')}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>👄</span>
              <span>{language === 'hi' ? 'मुंह की स्वयं-जांच गाइड' : language === 'kn' ? 'ಬಾಯಿ ತಪಾಸಣೆ ವಿಧಾನ' : 'Oral Inspection Guide'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Underlying Chronic Disease Hints Card */}
      {record.underlyingHints.length > 0 && (
        <div className="p-5 rounded-3xl bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-400 dark:border-sky-700 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-sky-950 dark:text-sky-100 font-black text-lg">
            <Activity className="w-5 h-5 text-sky-600" />
            <h3>{t.underlyingHintsTitle}</h3>
          </div>
          <p className="text-xs text-sky-900/80 dark:text-sky-200 mb-3">
            {t.underlyingHintsDesc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {record.underlyingHints.map((hint, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <span className="text-xl">
                  {hint === 'diabetesCheck'
                    ? '🩸'
                    : hint === 'tbScreening'
                    ? '🫁'
                    : hint === 'anemiaCheck'
                    ? '🥗'
                    : hint === 'hypertensionCheck'
                    ? '💓'
                    : '🩺'}
                </span>
                <span>
                  {hint === 'diabetesCheck'
                    ? language === 'hi'
                      ? 'डायबिटीज (शुगर) की जांच कराएं'
                      : language === 'kn'
                      ? 'ಸಕ್ಕರೆ ಕಾಯಿಲೆ (ಡಯಾಬಿಟಿಸ್) ಪರೀಕ್ಷಿಸಿ'
                      : 'Fasting Blood Sugar / Diabetes Test'
                    : hint === 'tbScreening'
                    ? language === 'hi'
                      ? 'बलगम की जांच (टीबी टेस्ट)'
                      : language === 'kn'
                      ? 'ಕಫ ಪರೀಕ್ಷೆ (ಟಿಬಿ ತಪಾಸಣೆ)'
                      : 'Sputum (Balgam) TB Screening'
                    : hint === 'anemiaCheck'
                    ? language === 'hi'
                      ? 'हीमोग्लोबिन (खून) की जांच'
                      : language === 'kn'
                      ? 'ಹಿಮೋಗ್ಲೋಬಿನ್ (ರಕ್ತ) ಪರೀಕ್ಷೆ'
                      : 'Hemoglobin / Anemia Check'
                    : hint === 'hypertensionCheck'
                    ? language === 'hi'
                      ? 'ब्लड प्रेशर (बीपी) की जांच'
                      : language === 'kn'
                      ? 'ರಕ್ತದೊತ್ತಡ (ಬಿಪಿ) ಪರೀಕ್ಷೆ'
                      : 'Blood Pressure Evaluation'
                    : language === 'hi'
                    ? 'हृदय (दिल) की जांच'
                    : language === 'kn'
                    ? 'ಹೃದಯ ಪರೀಕ್ಷೆ'
                    : 'Cardiac Evaluation'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Condition Findings ("What it could be") */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>🩺</span>
          <span>{t.whatItCouldBe}</span>
        </h3>

        <div className="space-y-3">
          {record.matchedConditions.map((mc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="font-bold text-base text-teal-800 dark:text-teal-300">
                  {mc.condition.name[language] || mc.condition.name.en}
                </h4>
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                    mc.confidence === 'likely'
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mc.confidence === 'likely' ? t.likely : t.possible}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {mc.condition.summary[language] || mc.condition.summary.en}
              </p>
            </div>
          ))}

          {record.matchedConditions.length === 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-300">
              {language === 'hi'
                ? 'आपके बताए गए लक्षणों के अनुसार सुरक्षित घरेलू देखभाल और आराम की सलाह दी जाती है।'
                : language === 'kn'
                ? 'ನಿಮ್ಮ ಲಕ್ಷಣಗಳ ಪ್ರಕಾರ ಸಾಮಾನ್ಯ ವಿಶ್ರಾಂತಿ ಮತ್ತು ಮನೆ ಆರೈಕೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.'
                : 'General symptom care and rest advised. Please follow precautions below.'}
            </div>
          )}
        </div>
      </div>

      {/* 6. What to do now & Precautions */}
      {record.matchedConditions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>💡</span>
            <span>{t.whatToDoNow}</span>
          </h3>

          <div className="space-y-2">
            {record.matchedConditions[0].condition.whatToDo[language].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>

          {/* OTC Medicines */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <span>💊</span>
              <span>{t.otcMedicines}</span>
            </h4>
            <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-2 text-[11px] text-amber-900 dark:text-amber-200">
              {t.otcWarning}
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
              {record.matchedConditions[0].condition.medicines[language].map((med, i) => (
                <li key={i}>{med}</li>
              ))}
            </ul>
          </div>

          {/* Do's and Don'ts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{t.dos}</span>
              </span>
              <ul className="space-y-1 text-xs text-emerald-950 dark:text-emerald-200">
                {record.matchedConditions[0].condition.precautions.dos[language].map((d, i) => (
                  <li key={i}>✓ {d}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
              <span className="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1 mb-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>{t.donts}</span>
              </span>
              <ul className="space-y-1 text-xs text-rose-950 dark:text-rose-200">
                {record.matchedConditions[0].condition.precautions.donts[language].map((d, i) => (
                  <li key={i}>✕ {d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 7. CONTACT VILLAGE ASHA DIDI CARD */}
      <div
        className={`p-5 rounded-3xl border-2 transition-all ${
          highlightAsha
            ? 'bg-gradient-to-br from-teal-500/10 via-amber-500/10 to-teal-500/20 border-teal-500 shadow-md ring-2 ring-teal-400/40'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👩‍⚕️</span>
            <div>
              <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">
                {t.contactAshaTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ashaContact?.ashaName || 'Village ASHA Worker'} ({ashaContact?.village || 'Local Panchayat'})
              </p>
            </div>
          </div>
          {highlightAsha && (
            <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-black uppercase animate-pulse">
              Recommended
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
          {language === 'hi'
            ? 'अपनी आशा दीदी को फोन करें या बिना इंटरनेट के SMS भेजकर अपनी जांच रिपोर्ट साझा करें।'
            : language === 'kn'
            ? 'ನಿಮ್ಮ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ SMS ಮೂಲಕ ವರದಿ ಕಳುಹಿಸಿ.'
            : 'Contact your village ASHA didi for home visit, sub-centre referral, and medicines.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Call ASHA */}
          <a
            href={`tel:${ashaContact?.ashaPhone || '9876543210'}`}
            className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t.ashaCallBtn}</span>
          </a>

          {/* Send SMS (Works 100% Offline over 2G/GSM network) */}
          <a
            href={`sms:${ashaContact?.ashaPhone || '9876543210'}?body=${buildSmsBody()}`}
            className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            title="Sends SMS over phone cellular network without internet"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.ashaSmsBtn}</span>
          </a>

          {/* WhatsApp (Online) */}
          <a
            href={`https://wa.me/91${ashaContact?.ashaPhone || '9876543210'}?text=${buildSmsBody()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <span>💬</span>
            <span>{t.ashaWhatsappBtn}</span>
          </a>
        </div>
      </div>

      {/* 8. Action Buttons Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Print Slip */}
        <button
          onClick={onPrint}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Printer className="w-4 h-4 text-teal-600" />
          <span>{t.printAdviceBtn}</span>
        </button>

        {/* Read Aloud */}
        <button
          onClick={handleReadAloud}
          className={`p-3.5 rounded-2xl font-bold text-xs border flex items-center justify-center gap-2 shadow-xs transition ${
            isSpeaking
              ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
          <span>{isSpeaking ? t.stopReadAloudBtn : t.readAloudBtn}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Share2 className="w-4 h-4 text-sky-600" />
          <span>{t.shareReportBtn}</span>
        </button>

        {/* Check Another */}
        <button
          onClick={onStartOver}
          className="p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.startOver}</span>
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={onOpenRecords}
          className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" />
          <span>{t.pastRecordsBtn}</span>
        </button>
      </div>

      {/* Self-Examination Educational Modals */}
      {showSelfExamModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowSelfExamModal(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <span>{showSelfExamModal === 'breast' ? '🌸' : '👄'}</span>
                <span>
                  {showSelfExamModal === 'breast'
                    ? language === 'hi' ? 'स्तन स्वयं-जांच (BSE) के 3 सरल चरण' : language === 'kn' ? 'ಸ್ತನ ಸ್ವಯಂ-ತಪಾಸಣೆಯ 3 ಹಂತಗಳು' : 'Breast Self-Exam (BSE) Steps'
                    : language === 'hi' ? 'मुंह की स्वयं-जांच के सरल चरण' : language === 'kn' ? 'ಬಾಯಿಯ ಸ್ವಯಂ-ತಪಾಸಣೆಯ ಹಂತಗಳು' : 'Oral Self-Inspection Steps'}
                </span>
              </h3>
              <button
                onClick={() => setShowSelfExamModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {showSelfExamModal === 'breast' ? (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-200 dark:border-violet-900">
                  <strong className="block text-violet-900 dark:text-violet-300 mb-1">
                    1. आईने के सामने देखें (In front of mirror):
                  </strong>
                  <p>हाथ कमर पर रखकर दोनों स्तनों के आकार, रंग, त्वचा में गड्ढे (dimpling) या निप्पल के अंदर धंसने की जांच करें।</p>
                </div>
                <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-200 dark:border-violet-900">
                  <strong className="block text-violet-900 dark:text-violet-300 mb-1">
                    2. छूकर महसूस करें (Feel with fingers):
                  </strong>
                  <p>पीठ के बल लेटकर या नहाते समय 3 उंगलियों के पोरों से पूरे स्तन और कांख (armpit) में गोल-गोल घुमाते हुए किसी भी गांठ या कड़ेपन की जांच करें।</p>
                </div>
                <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-200 dark:border-violet-900">
                  <strong className="block text-violet-900 dark:text-violet-300 mb-1">
                    3. निप्पल दबाकर देखें (Check for discharge):
                  </strong>
                  <p>निप्पल को हल्के से दबाएं। यदि कोई खून या पानी जैसा स्राव आए, तो तुरंत आशा दीदी या महिला डॉक्टर को दिखाएं।</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900">
                  <strong className="block text-teal-900 dark:text-teal-300 mb-1">
                    1. रोशनी में आईना देखें (Under bright light):
                  </strong>
                  <p>टॉर्च या सूरज की रोशनी में मुंह खोलें और दोनों गालों के अंदरूनी हिस्से, जीभ के दोनों किनारों और तालू को ध्यान से देखें।</p>
                </div>
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900">
                  <strong className="block text-teal-900 dark:text-teal-300 mb-1">
                    2. सफेद या लाल दाग तलाशें (Look for white/red patches):
                  </strong>
                  <p>क्या कोई सफेद या लाल दाग है जो रगड़ने से नहीं मिटता? क्या कोई छाला 3 हफ्ते से ज्यादा समय से नहीं भर रहा है?</p>
                </div>
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900">
                  <strong className="block text-teal-900 dark:text-teal-300 mb-1">
                    3. मुंह खोलने की क्षमता (Mouth opening):
                  </strong>
                  <p>क्या मुंह में अपनी 3-4 उंगलियां सामान्य रूप से चली जाती हैं? यदि मुंह खुलना कम हो रहा हो, तो तुरंत गुटखा छोड़ें और पीएचसी दिखाएं।</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowSelfExamModal(null)}
              className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
            >
              {t.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
