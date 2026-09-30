/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Language,
  CheckRecord,
  PatientProfile,
  AppSettings,
  AshaContact,
  SymptomCategory,
  SkinAnswers
} from './types';
import { translations } from './data/translations';
import { Header } from './components/Header';
import { Logo } from './components/Logo';
import { SosModal } from './components/SosModal';
import { CprGuide } from './components/CprGuide';
import { ManKiBaat } from './components/ManKiBaat';
import { VaccineModal } from './components/VaccineModal';
import { PregnancyCheckup } from './components/PregnancyCheckup';
import { CancerCheckup } from './components/CancerCheckup';
import { BodyMap } from './components/BodyMap';
import { SymptomCards } from './components/SymptomCards';
import { SkinQuestionnaire } from './components/SkinQuestionnaire';
import { ResultScreen } from './components/ResultScreen';
import { RecordsScreen } from './components/RecordsScreen';
import { AshaScreen } from './components/AshaScreen';
import { PrintSlip } from './components/PrintSlip';
import { PrivacyModal } from './components/PrivacyModal';
import { evaluateSymptoms } from './utils/engine';
import {
  initDB,
  saveCheckRecord,
  savePatient,
  getAllPatients,
  getSettings,
  saveSettings,
  getAshaContact
} from './utils/db';
import {
  startSpeechRecognition,
  speakText,
  stopSpeaking,
  matchSymptomsFromText
} from './utils/voice';
import {
  PhoneCall,
  HeartPulse,
  Stethoscope,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  FileText,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Plus,
  Minus,
  Search,
  Sparkles,
  RefreshCw,
  X,
  Mic,
  Activity,
  AlertOctagon,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  User,
  Heart,
  Baby,
  Ribbon
} from 'lucide-react';

export default function App() {
  // Navigation & Screen state
  // Step 0: New Home Screen (Ambulance, CPR, Check Symptoms, Cancer Early Warning Diagnosis, Man Ki Baat)
  // Step 1: Patient ID System (New / Returning)
  // Step 2: Question 1 — Age & Gender (Vaccine pop-up if <18, Pregnancy checkup if pregnant)
  // Step 3: Question 2 — Main Symptoms (Body Map / Cards / Audio speech — Camera removed!)
  // Step 4: Question 3 — Duration
  // Step 5: Question 4 — Severity & Pain
  // Step 6: Question 5 — Emergency Danger Signs (Red Flags)
  // Step 7: Question 6 — Conditions & Habits
  // Step 8: Result Screen
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentScreen, setCurrentScreen] = useState<'wizard' | 'records' | 'asha'>('wizard');

  // Modals & Dedicated Feature Overlays
  const [showSosModal, setShowSosModal] = useState(false);
  const [showCprGuide, setShowCprGuide] = useState(false);
  const [showManKiBaat, setShowManKiBaat] = useState(false);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showPregnancyCheckup, setShowPregnancyCheckup] = useState(false);
  const [showCancerCheckup, setShowCancerCheckup] = useState(false);
  const [showPrintSlip, setShowPrintSlip] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);

  // Settings & DB State
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    fontSize: 'normal',
    highContrast: false,
    darkMode: false,
    ashaPin: '1234'
  });
  const [ashaContact, setAshaContact] = useState<AshaContact | null>(null);
  const [savedPatients, setSavedPatients] = useState<PatientProfile[]>([]);

  // Patient ID & Profile state
  const [patientIdTab, setPatientIdTab] = useState<'new' | 'returning'>('new');
  const [currentPatientCode, setCurrentPatientCode] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [returningIdInput, setReturningIdInput] = useState('');
  const [idCopied, setIdCopied] = useState(false);
  const [idSearchError, setIdSearchError] = useState('');

  // Question 1: Age & Gender (Support 0-11 months as well as years)
  const [age, setAge] = useState(30);
  const [ageUnit, setAgeUnit] = useState<'months' | 'years'>('years');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [isPregnant, setIsPregnant] = useState(false);
  const [hasOpenedVaccineForAge, setHasOpenedVaccineForAge] = useState<string | null>(null);

  // Question 2: Symptoms (Camera removed!)
  const [symptomNavTab, setSymptomNavTab] = useState<'body' | 'categories'>('categories');
  const [activeBodyPart, setActiveBodyPart] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<SymptomCategory | 'all'>('all');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');
  const [lastRecognizedSymptoms, setLastRecognizedSymptoms] = useState<string[]>([]);
  const [typedVoiceText, setTypedVoiceText] = useState('');
  const [voiceNotice, setVoiceNotice] = useState<string>('');
  const [skinAnswers, setSkinAnswers] = useState<SkinAnswers>({
    color: 'red',
    itching: false,
    spreading: false,
    painful: false,
    hasFever: false,
    days: '1-3',
    changingMole: false
  });

  // Question 3: Duration
  const [duration, setDuration] = useState<'today' | '1-3_days' | 'more_than_3_days' | 'more_than_3_weeks'>('1-3_days');

  // Question 4: Severity & Pain
  const [severityResponse, setSeverityResponse] = useState<'mild' | 'medium' | 'severe'>('medium');
  const [gettingWorse, setGettingWorse] = useState(false);

  // Question 5: Red Flags
  const [redFlagsSelected, setRedFlagsSelected] = useState<string[]>([]);

  // Question 6: Conditions & Habits
  const [conditions, setConditions] = useState<string[]>([]);
  const [habits, setHabits] = useState<string[]>([]);
  const [cancerFamilyHistory, setCancerFamilyHistory] = useState<'yes' | 'no' | 'unknown'>('unknown');

  // Result state
  const [completedRecord, setCompletedRecord] = useState<CheckRecord | null>(null);

  // Audio readout state for questions
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  // Voice recognition active state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [stopListeningFn, setStopListeningFn] = useState<(() => void) | null>(null);

  const t = translations[settings.language] || translations.en;

  // Initialize DB and load settings
  useEffect(() => {
    async function setup() {
      try {
        await initDB();
        const loadedSettings = await getSettings();
        if (loadedSettings) setSettings(loadedSettings);
        const contact = await getAshaContact();
        if (contact) setAshaContact(contact);
        const patients = await getAllPatients();
        setSavedPatients(patients);
      } catch (err) {
        console.warn('DB initialization notice:', err);
      }
    }
    setup();
    setCurrentPatientCode(generateRandomPatientCode());
  }, []);

  // When entered age is 0-11 months or under 18 years, immediately trigger vaccine pop-up checklist for that specific age
  useEffect(() => {
    const ageKey = `${age}_${ageUnit}`;
    const isChild = ageUnit === 'months' || (ageUnit === 'years' && age < 18);
    if (currentStep === 2 && isChild && hasOpenedVaccineForAge !== ageKey) {
      setShowVaccineModal(true);
      setHasOpenedVaccineForAge(ageKey);
    }
  }, [currentStep, age, ageUnit, hasOpenedVaccineForAge]);

  function generateRandomPatientCode(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `SAI-${num}`;
  }

  const handleUpdateSettings = async (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleLanguageChange = (lang: Language) => {
    handleUpdateSettings({ language: lang });
  };

  // Toggle symptom
  const handleToggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleToggleCondition = (cond: string) => {
    if (cond === 'none') {
      setConditions([]);
      return;
    }
    setConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleToggleHabit = (h: string) => {
    if (h === 'none') {
      setHabits([]);
      return;
    }
    setHabits((prev) =>
      prev.includes(h) ? prev.filter((item) => item !== h) : [...prev, h]
    );
  };

  const handleToggleRedFlag = (rf: string) => {
    if (rf === 'none') {
      setRedFlagsSelected([]);
      return;
    }
    setRedFlagsSelected((prev) =>
      prev.includes(rf) ? prev.filter((item) => item !== rf) : [...prev, rf]
    );
  };

  // Voice speech-to-text handler for symptoms
  const handleToggleVoice = () => {
    if (isListening && stopListeningFn) {
      stopListeningFn();
      setIsListening(false);
      setStopListeningFn(null);
      return;
    }

    setVoiceTranscript('');
    setLastRecognizedSymptoms([]);
    setVoiceNotice('');

    const stopFn = startSpeechRecognition(
      settings.language,
      (transcript, matchedIds) => {
        setVoiceTranscript(transcript);
        if (matchedIds.length > 0) {
          setLastRecognizedSymptoms(matchedIds);
          setSelectedSymptoms((prev) => Array.from(new Set([...prev, ...matchedIds])));
          setVoiceNotice(
            settings.language === 'hi'
              ? `✓ ${matchedIds.length} लक्षण पहचाने गए और जोड़े गए`
              : `✓ ${matchedIds.length} symptom(s) recognized & added!`
          );
        }
      },
      (err) => {
        console.warn('Voice error notice:', err);
        setVoiceNotice(err);
      },
      () => {
        setIsListening(false);
      }
    );

    setIsListening(true);
    setStopListeningFn(() => stopFn);
  };

  const handleAddTypedSymptoms = (text: string) => {
    if (!text.trim()) return;
    const matched = matchSymptomsFromText(text, settings.language);
    setVoiceTranscript(text);
    if (matched.length > 0) {
      setLastRecognizedSymptoms(matched);
      setSelectedSymptoms((prev) => Array.from(new Set([...prev, ...matched])));
      setVoiceNotice(
        settings.language === 'hi'
          ? `✓ ${matched.length} लक्षण जोड़े गए!`
          : `✓ Added ${matched.length} symptom(s)!`
      );
      setTypedVoiceText('');
    } else {
      setOtherText((prev) => (prev ? `${prev}, ${text.trim()}` : text.trim()));
      setVoiceNotice(
        settings.language === 'hi'
          ? `विवरण में जोड़ा गया: "${text}"`
          : `Added to notes: "${text}"`
      );
      setTypedVoiceText('');
    }
  };

  // Voice question read aloud (6 streamlined questions)
  const handleSpeakCurrentQuestion = () => {
    if (isSpeakingQuestion) {
      stopSpeaking();
      setIsSpeakingQuestion(false);
      return;
    }

    let speechText = '';
    const lang = settings.language;

    if (currentStep === 2) {
      speechText =
        lang === 'hi'
          ? 'प्रश्न एक। यह जांच किसके लिए है? मरीज की उम्र और लिंग चुनें। यदि उम्र 18 से कम है तो टीकाकरण जांच उपलब्ध है।'
          : lang === 'kn'
          ? 'ಪ್ರಶ್ನೆ ಒಂದು. ಈ ತಪಾಸಣೆ ಯಾರಿಗಾಗಿ? ರೋಗಿಯ ವಯಸ್ಸು ಮತ್ತು ಲಿಂಗ ಆಯ್ಕೆಮಾಡಿ.'
          : 'Question one. Who is this checkup for? Please select patient age and gender. Vaccine checklist available for children under 18.';
    } else if (currentStep === 3) {
      speechText =
        lang === 'hi'
          ? 'प्रश्न दो। आपको क्या परेशानी है? शरीर का हिस्सा छूएं या बोलकर बताएं।'
          : lang === 'kn'
          ? 'ಪ್ರಶ್ನೆ ಎರಡು. ನಿಮಗೆ ಯಾವ ಸಮಸ್ಯೆ ಕಾಡುತ್ತಿದೆ? ದೇಹದ ಭಾಗ ಮುಟ್ಟಿ ಅಥವಾ ಮಾತನಾಡಿ.'
          : 'Question two. What symptoms are troubling you? Tap where it hurts or speak into the microphone.';
    } else if (currentStep === 4) {
      speechText =
        lang === 'hi'
          ? 'प्रश्न तीन। यह परेशानी कितने समय से है? आज ही, एक से तीन दिन, या तीन दिन से ज्यादा।'
          : lang === 'kn'
          ? 'ಪ್ರಶ್ನೆ ಮೂರು. ಈ ತೊಂದರೆ ಎಷ್ಟು ದಿನಗಳಿಂದ ಇದೆ?'
          : 'Question three. How long have you had this problem? Today, one to three days, or more than three days.';
    } else if (currentStep === 5) {
      speechText =
        lang === 'hi'
          ? 'प्रश्न चार। दर्द या तकलीफ कितनी तेज है? हल्की, मध्यम, या बहुत तेज।'
          : lang === 'kn'
          ? 'ಪ್ರಶ್ನೆ ನಾಲ್ಕು. ನೋವು ಎಷ್ಟು ತೀವ್ರವಾಗಿದೆ? ಕಡಿಮೆ, ಮಧ್ಯಮ, ಅಥವಾ ತೀವ್ರ.'
          : 'Question four. How severe is the pain or discomfort? Mild, moderate, or severe.';
    } else if (currentStep === 6) {
      speechText =
        lang === 'hi'
          ? 'प्रश्न पांच। क्या छाती में तेज दर्द, सांस फूलना, सांप काटना या बेहोशी जैसे कोई आपातकालीन खतरे हैं?'
          : lang === 'kn'
          ? 'ಪ್ರಶ್ನೆ ಐದು. ಎದೆ ನೋವು ಅಥವಾ ಯಾವುದೇ ತುರ್ತು ಅಪಾಯದ ಚಿಹ್ನೆಗಳಿವೆಯೇ?'
          : 'Question five. Are there any emergency danger signs like chest pain, breathlessness, or snake bite?';
    } else if (currentStep === 7) {
      speechText =
        lang === 'hi'
          ? 'प्रश्न छह। क्या कोई पुरानी बीमारी जैसे डायबिटीज, बीपी, या तंबाकू बीड़ी की आदत है?'
          : lang === 'kn'
          ? 'ಪ್ರಶ್ನೆ ಆರು. ಮಧುಮೇಹ, ರಕ್ತದೊತ್ತಡ, ಅಥವಾ ತಂಬಾಕು ಸೇವನೆಯ ಅಭ್ಯಾಸಗಳಿವೆಯೇ?'
          : 'Question six. Any chronic conditions like diabetes or high BP, or habits like tobacco or bidi?';
    }

    if (speechText) {
      setIsSpeakingQuestion(true);
      speakText(speechText, lang, () => setIsSpeakingQuestion(false));
    }
  };

  // Load existing patient into checkup
  const handleSelectExistingPatient = (patient: PatientProfile) => {
    setCurrentPatientCode(patient.patientCode);
    setPatientName(patient.name || '');
    setAge(patient.age ?? 30);
    setAgeUnit(patient.ageUnit || 'years');
    setGender(patient.gender || 'female');
    setIsPregnant(patient.isPregnant || false);
    setConditions(patient.conditions || []);
    setHabits(patient.habits || []);
    setCancerFamilyHistory(patient.cancerFamilyHistory || 'unknown');
    setCurrentStep(2);
  };

  // Search returning patient by code
  const handleSearchReturningPatient = () => {
    const code = returningIdInput.trim().toUpperCase();
    if (!code) {
      setIdSearchError(settings.language === 'hi' ? 'कृपया आईडी कोड दर्ज करें' : 'Please enter an ID code');
      return;
    }
    const found = savedPatients.find(
      (p) => p.patientCode.toUpperCase() === code || p.id === code
    );
    if (found) {
      setIdSearchError('');
      handleSelectExistingPatient(found);
    } else {
      setIdSearchError(
        settings.language === 'hi'
          ? 'यह मरीज आईडी नहीं मिली। नया मरीज चुनें या दोबारा जांचें।'
          : 'Patient ID not found on this device. Create new or check spelling.'
      );
    }
  };

  // Copy patient ID
  const handleCopyPatientId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentPatientCode);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    }
  };

  // Speak patient ID
  const handleSpeakPatientId = () => {
    const lang = settings.language;
    const spokenCode = currentPatientCode.split('').join(' ');
    const msg =
      lang === 'hi'
        ? `आपका मरीज पहचान कोड है: ${spokenCode}`
        : lang === 'kn'
        ? `ನಿಮ್ಮ ರೋಗಿಯ ಐಡಿ ಕೋಡ್: ${spokenCode}`
        : `Your patient ID code is: ${spokenCode}`;
    speakText(msg, lang);
  };

  // Final Triage computation & save for Symptoms Checkup
  const handleFinishTriage = async () => {
    const allSymptomsCombined = Array.from(
      new Set([...selectedSymptoms, ...redFlagsSelected])
    );

    const evalResult = evaluateSymptoms({
      selectedSymptoms: allSymptomsCombined,
      otherText,
      duration,
      severityResponse,
      age,
      gender,
      isPregnant,
      conditions,
      habits,
      cancerFamilyHistory,
      skinAnswers
    });

    const activePatientCode = currentPatientCode || generateRandomPatientCode();
    const displayName = patientName.trim() || (settings.language === 'hi' ? 'मरीज' : 'Patient');

    const record: CheckRecord = {
      patientCode: activePatientCode,
      patientName: displayName,
      age,
      ageUnit,
      ageInMonths: ageUnit === 'months' ? age : age * 12,
      gender,
      isPregnant: gender === 'female' ? isPregnant : false,
      conditions,
      habits,
      cancerFamilyHistory,
      selectedSymptoms: allSymptomsCombined,
      otherText: otherText.trim() || undefined,
      needsReview: !!otherText.trim(),
      duration,
      severityResponse,
      gettingWorse,
      skinAnswers,
      photos: [], // Camera feature removed
      resultSeverity: evalResult.severity,
      cancerWarningLevel: evalResult.cancerWarningLevel,
      cancerWarningReasons: evalResult.cancerWarningReasons,
      underlyingHints: evalResult.underlyingHints,
      matchedConditions: evalResult.matchedConditions,
      date: Date.now(),
      followUpDone: false
    };

    try {
      const savedId = await saveCheckRecord(record);
      record.id = savedId;

      await savePatient({
        patientCode: activePatientCode,
        name: displayName,
        age,
        ageUnit,
        ageInMonths: ageUnit === 'months' ? age : age * 12,
        gender,
        isPregnant: gender === 'female' ? isPregnant : false,
        conditions,
        habits,
        cancerFamilyHistory,
        createdAt: Date.now(),
        lastVisitAt: Date.now()
      });

      const updatedPatients = await getAllPatients();
      setSavedPatients(updatedPatients);
    } catch (err) {
      console.warn('Saving check record notice:', err);
    }

    setCompletedRecord(record);
    setCurrentStep(8); // Result screen for symptoms
  };

  // Handling custom specialized checkup results (Cancer or Pregnancy)
  const handleSaveSpecializedRecord = async (customRecord: Partial<CheckRecord>) => {
    const activePatientCode = currentPatientCode || generateRandomPatientCode();
    const displayName = patientName.trim() || (settings.language === 'hi' ? 'मरीज' : 'Patient');

    const fullRecord: CheckRecord = {
      patientCode: activePatientCode,
      patientName: displayName,
      age,
      ageUnit,
      ageInMonths: ageUnit === 'months' ? age : age * 12,
      gender,
      isPregnant: customRecord.isPregnant ?? isPregnant,
      pregnancyMonths: customRecord.pregnancyMonths,
      isFirstPregnancy: customRecord.isFirstPregnancy,
      pregnancyRedFlags: customRecord.pregnancyRedFlags,
      conditions,
      habits,
      cancerFamilyHistory,
      selectedSymptoms: customRecord.selectedSymptoms || [],
      photos: [],
      duration: '1-3_days',
      severityResponse: customRecord.resultSeverity === 'emergency' ? 'severe' : 'mild',
      gettingWorse: false,
      resultSeverity: customRecord.resultSeverity || 'mild',
      cancerWarningLevel: customRecord.cancerWarningLevel || 'none',
      cancerWarningReasons: customRecord.cancerWarningReasons || [],
      underlyingHints: [],
      matchedConditions: [],
      date: Date.now(),
      followUpDone: false,
      ...customRecord
    };

    try {
      const savedId = await saveCheckRecord(fullRecord);
      fullRecord.id = savedId;
      setCompletedRecord(fullRecord);
      setShowPregnancyCheckup(false);
      setShowCancerCheckup(false);
      setCurrentStep(8);
    } catch (err) {
      console.warn('Specialized record save error:', err);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setCurrentScreen('wizard');
    setSelectedSymptoms([]);
    setOtherText('');
    setRedFlagsSelected([]);
    setDuration('1-3_days');
    setSeverityResponse('medium');
    setGettingWorse(false);
    setCurrentPatientCode(generateRandomPatientCode());
    setPatientName('');
    setIdCopied(false);
    setIdSearchError('');
    setAge(30);
    setAgeUnit('years');
    setLastRecognizedSymptoms([]);
    setVoiceTranscript('');
    setTypedVoiceText('');
    setVoiceNotice('');
    setHasOpenedVaccineForAge(null);
    setShowVaccineModal(false);
    setShowPregnancyCheckup(false);
    setShowCancerCheckup(false);
    stopSpeaking();
    setIsSpeakingQuestion(false);
  };

  const fontClass =
    settings.fontSize === 'large'
      ? 'text-lg'
      : settings.fontSize === 'xlarge'
      ? 'text-xl'
      : 'text-base';

  const contrastClass = settings.highContrast ? 'contrast-125 saturate-150' : '';

  return (
    <div
      className={`min-h-screen font-sans ${contrastClass} ${
        settings.darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
      }`}
    >
      {/* Top Header */}
      <Header
        language={settings.language}
        onLanguageChange={handleLanguageChange}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenAsha={() => setCurrentScreen('asha')}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onResetToHome={handleStartOver}
        currentPatientCode={currentPatientCode}
        onSwitchPatient={() => {
          setCurrentStep(1);
          setCurrentScreen('wizard');
        }}
      />

      <main className={`max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-5 ${fontClass}`}>
        {/* VIEW: Records Screen */}
        {currentScreen === 'records' && (
          <RecordsScreen
            language={settings.language}
            onBack={() => setCurrentScreen('wizard')}
            onViewRecord={(rec) => {
              setCompletedRecord(rec);
              setCurrentStep(8);
              setCurrentScreen('wizard');
            }}
            onPrintRecord={(rec) => {
              setCompletedRecord(rec);
              setShowPrintSlip(true);
            }}
          />
        )}

        {/* VIEW: ASHA Mode Screen */}
        {currentScreen === 'asha' && (
          <AshaScreen
            language={settings.language}
            onBack={() => setCurrentScreen('wizard')}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {/* VIEW: Wizard / Home Flow */}
        {currentScreen === 'wizard' && (
          <div>
            {/* STEP 0: NEW HOME SCREEN WITH CANCER EARLY WARNING DIAGNOSIS AS ITS OWN DISTINCT OPTION */}
            {currentStep === 0 && (
              <div className="flex flex-col justify-between min-h-[calc(100vh-5rem)] py-2 space-y-4">
                {/* Hero Logo - Bigger, Darker, Ultra Visible */}
                <div className="text-center pt-2 sm:pt-4">
                  <div className="inline-block p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-102 transition-all">
                    <Logo size="hero" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-950 dark:text-teal-200 mt-2.5 tracking-tight">
                    {t.tagline || 'Your Smart Health Partner'}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-300 mt-0.5">
                    {settings.language === 'hi'
                      ? '100% संप्रभु व ऑफलाइन — संपूर्ण डेटा व कृत्रिम बुद्धिमत्ता आपके फोन में'
                      : settings.language === 'kn'
                      ? '100% ಸ್ವಾಯತ್ತ ಮತ್ತು ಆಫ್‌ಲೈನ್ — ಮಾಹಿತಿ ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲೇ ಸುರಕ್ಷಿತ'
                      : '100% Sovereign & Offline — Zero cloud upload, runs fully on-device'}
                  </p>
                </div>

                {/* THE FOUR MAIN UNMISSABLE COLOR-CODED BUTTONS */}
                <div className="space-y-3 sm:space-y-3.5 my-auto">
                  {/* Button 1: Ambulance / SOS (Coral Red) */}
                  <button
                    onClick={() => setShowSosModal(true)}
                    className="w-full p-4 sm:p-4.5 rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl active:scale-98 transition-all flex items-center justify-between group border-2 border-rose-400/60"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 text-left">
                      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <span className="text-3xl sm:text-4xl">🚑</span>
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-rose-100">
                          {settings.language === 'hi' ? 'तुरंत 108 सहायता' : 'EMERGENCY 108'}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                          {t.ambulanceSosBtn || 'Ambulance / SOS'}
                        </h2>
                        <p className="text-xs text-rose-100 font-medium mt-0.5">
                          {t.ambulanceSosDesc || 'One-tap emergency 108 call & GPS location'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-1.5 transition-transform shrink-0 ml-2" />
                  </button>

                  {/* Button 2: CPR — Save a Life (Violet) */}
                  <button
                    onClick={() => setShowCprGuide(true)}
                    className="w-full p-4 sm:p-4.5 rounded-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-xl hover:shadow-2xl active:scale-98 transition-all flex items-center justify-between group border-2 border-purple-400/60"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 text-left">
                      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <span className="text-3xl sm:text-4xl">❤️</span>
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-purple-100">
                          {settings.language === 'hi' ? 'हार्ट अटैक सहायता' : 'HUMAN PICTORIAL GUIDE'}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                          {t.cprGuideBtn || 'CPR — Save a Life'}
                        </h2>
                        <p className="text-xs text-purple-100 font-medium mt-0.5">
                          {t.cprGuideDesc || 'Illustrated emergency heart resuscitation guide'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-1.5 transition-transform shrink-0 ml-2" />
                  </button>

                  {/* Button 3: Check Symptoms (General Illness / Triage) */}
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="w-full p-4 sm:p-4.5 rounded-3xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl active:scale-98 transition-all flex items-center justify-between group border-2 border-teal-300/60"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 text-left">
                      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <span className="text-3xl sm:text-4xl">🩺</span>
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-teal-100">
                          {settings.language === 'hi' ? 'रोग व लक्षण जांच' : 'SYMPTOMS & HOME CARE'}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                          {t.healthCheckupBtn || 'Check Symptoms'}
                        </h2>
                        <p className="text-xs text-teal-100 font-medium mt-0.5">
                          {t.healthCheckupDesc || 'Triage common illness, fever & home remedies'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-1.5 transition-transform shrink-0 ml-2" />
                  </button>

                  {/* Button 4: Cancer Early Warning Diagnosis (Dedicated First-Page Option) */}
                  <button
                    onClick={() => setShowCancerCheckup(true)}
                    className="w-full p-4 sm:p-4.5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl active:scale-98 transition-all flex items-center justify-between group border-2 border-amber-300/70"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 text-left">
                      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <span className="text-3xl sm:text-4xl">🎗️</span>
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-amber-100">
                          {settings.language === 'hi' ? 'विशेष ऑन्कोलॉजी स्क्रीनिंग' : 'SPECIALIZED SCREENING'}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                          {t.cancerDiagnosisBtn || 'Cancer Early Warning Diagnosis'}
                        </h2>
                        <p className="text-xs text-amber-100 font-medium mt-0.5">
                          {t.cancerDiagnosisDesc || 'Dedicated screening for non-healing ulcers, lumps & tobacco risk'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-1.5 transition-transform shrink-0 ml-2" />
                  </button>
                </div>

                {/* Sub-Card: Man Ki Baat — Talk to someone & Quick Links */}
                <div className="pt-1 space-y-2">
                  <button
                    onClick={() => setShowManKiBaat(true)}
                    className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-rose-200 dark:border-rose-900/40 text-left flex items-center justify-between shadow-xs hover:shadow-md transition active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Heart className="w-5 h-5 fill-white" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                          {t.manKiBaatBtn || 'Man Ki Baat — Talk to Someone'}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t.manKiBaatDesc || 'Private emotional listening, Tele-MANAS 14416 & calming care'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-rose-400 shrink-0" />
                  </button>

                  {/* Secondary Links: Records & ASHA */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                    <button
                      onClick={() => setCurrentScreen('records')}
                      className="py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400 shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>{t.pastRecordsBtn}</span>
                    </button>
                    <button
                      onClick={() => setCurrentScreen('asha')}
                      className="py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>{t.ashaModeBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: PATIENT ID SYSTEM */}
            {currentStep === 1 && (
              <div className="space-y-4 pt-1 pb-12">
                {/* Step Top Bar */}
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t.back}</span>
                  </button>
                  <span className="font-black text-slate-400 uppercase tracking-wider text-[11px]">
                    {t.patientIdTitle || 'Patient ID Setup'}
                  </span>
                  <button
                    onClick={handleStartOver}
                    className="flex items-center gap-1 font-bold text-rose-500 hover:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.startOver}</span>
                  </button>
                </div>

                {/* Patient ID System Card */}
                <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <User className="w-6 h-6 text-teal-600" />
                      <span>{t.patientIdTitle || 'Patient Identification'}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t.patientIdSubtitle || 'Create or enter a patient ID code to securely record history on this device.'}
                    </p>
                  </div>

                  {/* Tabs: New Patient vs Returning Patient */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                    <button
                      onClick={() => setPatientIdTab('new')}
                      className={`py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                        patientIdTab === 'new'
                          ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t.newPatientBtn || 'New Patient'}
                    </button>
                    <button
                      onClick={() => setPatientIdTab('returning')}
                      className={`py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                        patientIdTab === 'returning'
                          ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t.returningPatientBtn || 'Returning Patient'}
                    </button>
                  </div>

                  {/* TAB 1: NEW PATIENT */}
                  {patientIdTab === 'new' && (
                    <div className="space-y-4 pt-1">
                      {/* Big Auto-Generated ID Display */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border-2 border-teal-500/40 text-center space-y-2">
                        <span className="text-xs uppercase font-black text-teal-800 dark:text-teal-300 tracking-wider">
                          {t.yourPatientId || 'Your Patient ID Code'}
                        </span>
                        <div className="text-4xl sm:text-5xl font-mono font-black text-teal-900 dark:text-teal-100 tracking-wider">
                          {currentPatientCode}
                        </div>
                        <p className="text-[11px] text-teal-700 dark:text-teal-300">
                          {settings.language === 'hi'
                            ? 'यह कोड याद रखें — अगली बार सारा पिछला रिकॉर्ड तुरंत खुल जाएगा'
                            : 'Note down this code to view all past checks and records on future visits'}
                        </p>

                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleCopyPatientId}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-300 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-teal-100"
                          >
                            {idCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{idCopied ? t.idCopied || 'Copied!' : t.copyIdBtn || 'Copy ID'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSpeakPatientId}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-300 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-teal-100"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>{settings.language === 'hi' ? 'बोलकर सुनें' : 'Read Aloud'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentPatientCode(generateRandomPatientCode())}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-slate-100"
                            title="Generate another code"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{settings.language === 'hi' ? 'नया कोड' : 'New Code'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Patient Name input (Optional) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                          {t.nameLabel}
                        </label>
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder={t.namePlaceholder}
                          className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-98 transition"
                      >
                        <span>{settings.language === 'hi' ? 'चेकअप शुरू करें (प्रश्न 1) →' : 'Start Checkup (Question 1) →'}</span>
                      </button>
                    </div>
                  )}

                  {/* TAB 2: RETURNING PATIENT */}
                  {patientIdTab === 'returning' && (
                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                          {t.enterIdPlaceholder || 'Enter 4-6 digit ID (e.g. SAI-4021)'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={returningIdInput}
                            onChange={(e) => setReturningIdInput(e.target.value)}
                            placeholder="SAI-XXXX"
                            className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-base text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500 uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleSearchReturningPatient}
                            className="px-5 py-3 rounded-2xl bg-teal-600 text-white font-bold text-sm shadow-md hover:bg-teal-700 shrink-0"
                          >
                            <Search className="w-5 h-5" />
                          </button>
                        </div>
                        {idSearchError && (
                          <p className="text-xs font-bold text-rose-500 mt-1">{idSearchError}</p>
                        )}
                      </div>

                      {/* Recent Patients List */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          {t.recentPatientsTitle || 'Recent Patients on this Device'}
                        </h4>
                        {savedPatients.length === 0 ? (
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center text-xs text-slate-400">
                            {settings.language === 'hi' ? 'इस फोन पर कोई पुराना मरीज नहीं मिला।' : 'No saved patients found on this device yet.'}
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {savedPatients.map((pat) => (
                              <button
                                key={pat.id || pat.patientCode}
                                type="button"
                                onClick={() => handleSelectExistingPatient(pat)}
                                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-left flex items-center justify-between group transition"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-200 flex items-center justify-center font-mono font-bold text-xs">
                                    ID
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-black text-sm text-teal-700 dark:text-teal-300">
                                        {pat.patientCode}
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                                        {pat.name || 'Patient'}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                      {pat.age}y, {pat.gender} {pat.isPregnant ? '• Pregnant' : ''}
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPatientCode(generateRandomPatientCode());
                            setCurrentStep(2);
                          }}
                          className="text-xs text-slate-500 hover:text-teal-600 underline font-medium"
                        >
                          {t.guestContinueBtn || 'Continue as Guest (No ID)'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CHECKUP FLOW: 6 STREAMLINED QUESTIONS (STEPS 2 TO 7) */}
            {currentStep >= 2 && currentStep <= 7 && (
              <div className="space-y-4 pt-1 pb-16">
                {/* Wizard Header Bar: Back, Question X of 6, Speaker Read Aloud, Start Over */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                      className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t.back}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 text-xs">
                        Question {currentStep - 1} of 6
                      </span>

                      {/* Read Aloud Question Button */}
                      <button
                        onClick={handleSpeakCurrentQuestion}
                        className={`p-1.5 rounded-full border flex items-center gap-1 text-[11px] font-bold transition active:scale-95 ${
                          isSpeakingQuestion
                            ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 hover:bg-teal-50'
                        }`}
                        title="Read question aloud"
                      >
                        {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-600" />}
                        <span className="hidden sm:inline">{isSpeakingQuestion ? t.stopAudioBtn || 'Stop' : t.listenQuestionBtn || 'Listen'}</span>
                      </button>
                    </div>

                    <button
                      onClick={handleStartOver}
                      className="flex items-center gap-1 font-bold text-rose-500 hover:underline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.startOver}</span>
                    </button>
                  </div>

                  {/* Colorful Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-600 transition-all duration-300 rounded-full"
                      style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
                    />
                  </div>
                </div>

                {/* QUESTION 1 (Step 2): Who is this checkup for? (Age, Gender, Vaccine Pop-up & Pregnancy Checkup) */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                          {t.q1Title || 'Who is this checkup for?'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.q1Subtitle || 'Select age, gender, and pregnancy status'}
                        </p>
                      </div>

                      {/* Age Unit Selector: Years vs 0-11 Months */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                          <button
                            type="button"
                            onClick={() => {
                              setAgeUnit('years');
                              if (age < 1) setAge(5);
                            }}
                            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm transition ${
                              ageUnit === 'years'
                                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs ring-1 ring-teal-500/20'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {settings.language === 'hi' ? 'वर्ष (1 से 110 वर्ष)' : settings.language === 'kn' ? 'ವರ್ಷಗಳು (1 - 110 ವರ್ಷ)' : 'Years (1 to 110y)'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAgeUnit('months');
                              if (age > 11) setAge(6);
                            }}
                            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm transition ${
                              ageUnit === 'months'
                                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs ring-1 ring-teal-500/20'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            🍼 {settings.language === 'hi' ? 'माह (0 से 11 माह / शिशु)' : settings.language === 'kn' ? 'ತಿಂಗಳುಗಳು (0 - 11 ತಿಂಗಳು)' : 'Months (0–11m Infant)'}
                          </button>
                        </div>

                        {/* Age Stepper Card */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-center sm:text-left">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase">
                              {ageUnit === 'months'
                                ? settings.language === 'hi' ? 'शिशु की आयु (महीने)' : 'Infant Age (Months)'
                                : t.ageLabel}
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
                              {ageUnit === 'months'
                                ? age === 0
                                  ? settings.language === 'hi' ? '0 माह (नवजात शिशु <1m)' : '0 Months (Newborn <1m)'
                                  : `${age} ${settings.language === 'hi' ? 'माह (शिशु)' : 'Months (Infant)'}`
                                : `${age} years`}
                            </span>
                          </div>

                          {/* Steppers */}
                          <div className="flex items-center gap-2">
                            {ageUnit === 'years' && (
                              <button
                                type="button"
                                onClick={() => setAge((prev) => Math.max(1, prev - 5))}
                                className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black hover:bg-slate-300"
                              >
                                -5
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setAge((prev) => Math.max(0, prev - 1))}
                              className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-black text-xl hover:bg-slate-300"
                            >
                              <Minus className="w-5 h-5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setAge((prev) => Math.min(ageUnit === 'months' ? 11 : 110, prev + 1))}
                              className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md hover:bg-teal-700"
                            >
                              <Plus className="w-5 h-5" />
                            </button>

                            {ageUnit === 'years' && (
                              <button
                                type="button"
                                onClick={() => setAge((prev) => Math.min(110, prev + 5))}
                                className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black hover:bg-slate-300"
                              >
                                +5
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Quick Infant Milestone Pills for 0-11 months */}
                        {ageUnit === 'months' && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[11px] font-bold text-slate-500 mr-1">
                              {settings.language === 'hi' ? 'जल्दी चुनें:' : 'Quick Select:'}
                            </span>
                            {[
                              { label: settings.language === 'hi' ? 'नवजात (0m)' : 'Newborn (0m)', val: 0 },
                              { label: '1.5m (6w)', val: 1 },
                              { label: '2.5m (10w)', val: 2 },
                              { label: '3.5m (14w)', val: 3 },
                              { label: '6 Months', val: 6 },
                              { label: '9 Months (MR1)', val: 9 },
                              { label: '11 Months', val: 11 }
                            ].map((pill) => (
                              <button
                                key={pill.val}
                                type="button"
                                onClick={() => setAge(pill.val)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 ${
                                  age === pill.val
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* VACCINE POP-UP BANNER IF AGE IS 0-11 MONTHS OR < 18 YEARS */}
                      {(ageUnit === 'months' || (ageUnit === 'years' && age < 18)) && (
                        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border-2 border-teal-500/60 flex items-center justify-between gap-3 animate-pulse">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                              <Baby className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="font-black text-xs sm:text-sm text-teal-950 dark:text-teal-100 block">
                                {ageUnit === 'months'
                                  ? settings.language === 'hi'
                                    ? `शिशु टीकाकरण सूची उपलब्ध (${age} माह)`
                                    : `Infant Vaccine Checklist Available (${age} Months)`
                                  : settings.language === 'hi'
                                  ? `टीकाकरण सूची उपलब्ध (उम्र: ${age} वर्ष)`
                                  : `Childhood Vaccine Checklist Available (Age ${age})`}
                              </span>
                              <span className="text-[11px] text-teal-800 dark:text-teal-300">
                                {settings.language === 'hi' ? 'सरकारी UIP शेड्यूल के अनुसार आवश्यक टीके जांचें' : 'View age-specific UIP immunization schedule & missed vaccines'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowVaccineModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shrink-0 shadow-md active:scale-95"
                          >
                            {settings.language === 'hi' ? 'टीके देखें' : 'Open Checklist'}
                          </button>
                        </div>
                      )}

                      {/* Gender Large Picture Cards */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                          {t.genderLabel}
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { id: 'male' as const, label: t.male, emoji: '👨' },
                            { id: 'female' as const, label: t.female, emoji: '👩' },
                            { id: 'other' as const, label: t.other, emoji: '🧑' }
                          ].map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setGender(g.id)}
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 font-bold text-sm transition active:scale-95 ${
                                gender === g.id
                                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 shadow-md ring-2 ring-teal-400/20'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="text-3xl">{g.emoji}</span>
                              <span>{g.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pregnancy check & DEDICATED PREGNANCY CHECKUP FEATURE */}
                      {gender === 'female' && age >= 12 && age <= 52 && (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-3">
                          <label className="block text-xs font-black text-rose-900 dark:text-rose-200">
                            {t.pregnantLabel}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsPregnant(true);
                                setShowPregnancyCheckup(true);
                              }}
                              className={`py-3 rounded-xl border font-bold text-xs sm:text-sm transition ${
                                isPregnant
                                  ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-400/30'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200'
                              }`}
                            >
                              🤰 {t.yes}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsPregnant(false)}
                              className={`py-3 rounded-xl border font-bold text-xs sm:text-sm transition ${
                                !isPregnant
                                  ? 'bg-slate-700 text-white border-slate-800'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200'
                              }`}
                            >
                              {t.no}
                            </button>
                          </div>

                          {/* IF WOMAN CLICKS SHE IS PREGNANT: OFFER SPECIALIZED PREGNANCY CHECKUP */}
                          {isPregnant && (
                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 flex items-center justify-between gap-2 shadow-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <div>
                                  <span className="font-black text-xs text-rose-900 dark:text-rose-200 block">
                                    {settings.language === 'hi' ? 'माता व गर्भस्थ शिशु स्वास्थ्य जांच' : 'Complete Pregnancy & Fetal Checkup'}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {settings.language === 'hi' ? 'खतरे के संकेत, आयरन गोली, व सुरक्षित प्रसव तैयारी' : 'Check maternal danger signs, IFA tablets & fetal movement'}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setShowPregnancyCheckup(true)}
                                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shrink-0 active:scale-95"
                              >
                                {settings.language === 'hi' ? 'गर्भावस्था जांच शुरू करें' : 'Start Pregnancy Check'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-98 transition"
                    >
                      <span>{t.next} →</span>
                    </button>
                  </div>
                )}

                {/* QUESTION 2 (Step 3): What symptoms are troubling you? (CAMERA REMOVED) */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                            {t.q2Title || 'What symptoms are troubling you?'}
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t.q2Subtitle || 'Tap where it hurts or speak into the microphone'}
                          </p>
                        </div>
                        {selectedSymptoms.length > 0 && (
                          <span className="px-3 py-1 rounded-full bg-teal-600 text-white font-black text-xs shrink-0">
                            {selectedSymptoms.length} Selected
                          </span>
                        )}
                      </div>

                      {/* Voice Recognition & Voice-Text Symptom Input Bar */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 p-3.5 sm:p-4 rounded-3xl border-2 border-amber-300 dark:border-amber-700/60 shadow-sm space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              type="button"
                              onClick={handleToggleVoice}
                              className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition shrink-0 ${
                                isListening
                                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/40'
                                  : 'bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                              }`}
                              title={isListening ? 'Stop listening' : 'Start speaking'}
                            >
                              <Mic className={`w-7 h-7 ${isListening ? 'animate-bounce' : ''}`} />
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                                  {isListening ? (settings.language === 'hi' ? '🎙️ सुन रहे हैं... बोलिए' : '🎙️ Listening... speak now!') : (t.speakBtn || 'Tap to Speak Symptoms')}
                                </span>
                                {isListening && (
                                  <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider">
                                    Live
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-amber-900 dark:text-amber-200 mt-0.5 font-medium leading-tight">
                                {voiceTranscript
                                  ? `"${voiceTranscript}"`
                                  : settings.language === 'hi'
                                  ? 'उदा: "मुझे बुखार है और सिर में तेज दर्द है"'
                                  : settings.language === 'kn'
                                  ? 'ಉದಾ: "ನನಗೆ ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ"'
                                  : 'Say: "I have fever and severe headache"'}
                              </p>
                            </div>
                          </div>

                          {isListening && (
                            <button
                              type="button"
                              onClick={handleToggleVoice}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shrink-0 active:scale-95"
                            >
                              Done
                            </button>
                          )}
                        </div>

                        {/* Visual audio wave bars when listening */}
                        {isListening && (
                          <div className="flex items-center justify-center gap-1.5 py-1 bg-white/70 dark:bg-slate-900/60 rounded-xl">
                            {[16, 28, 40, 24, 36, 44, 20, 32, 18, 30].map((h, i) => (
                              <span
                                key={i}
                                className="w-1 bg-amber-500 rounded-full animate-pulse"
                                style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Real-time recognized symptom chips feedback */}
                        {lastRecognizedSymptoms.length > 0 && (
                          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1.5">
                            <span className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                              <Check className="w-4 h-4 text-emerald-600" />
                              {settings.language === 'hi' ? 'पहचाने गए लक्षण (चयनित):' : 'Recognized & Selected:'}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {lastRecognizedSymptoms.map((symId) => (
                                <span
                                  key={symId}
                                  className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] shadow-2xs capitalize"
                                >
                                  {symId.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {voiceNotice && (
                          <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                            {voiceNotice}
                          </p>
                        )}

                        {/* Alternative Voice-Text Input and Common Phrase Chips */}
                        <div className="pt-1 border-t border-amber-200/80 dark:border-amber-800/60 space-y-2">
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={typedVoiceText}
                              onChange={(e) => setTypedVoiceText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddTypedSymptoms(typedVoiceText);
                                }
                              }}
                              placeholder={
                                settings.language === 'hi'
                                  ? 'या लक्षण यहां टाइप करें (उदा: बुखार, उल्टी)...'
                                  : 'Or type symptoms here (e.g. fever, headache)...'
                              }
                              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddTypedSymptoms(typedVoiceText)}
                              disabled={!typedVoiceText.trim()}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black disabled:opacity-40"
                            >
                              Add
                            </button>
                          </div>

                          {/* Quick Voice Combinations */}
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 mr-1">
                              {settings.language === 'hi' ? 'जल्दी बोलें/चुनें:' : 'Quick Say:'}
                            </span>
                            {[
                              { label: '🌡️ Fever + Headache', val: 'fever and headache' },
                              { label: '🤢 Stomach Ache + Vomiting', val: 'stomach pain and vomiting' },
                              { label: '🤧 Cough + Cold', val: 'cough and cold' },
                              { label: '💩 Loose Motion', val: 'diarrhea loose motion' },
                              { label: 'बुखार और सिरदर्द', val: 'बुखार सिरदर्द' },
                              { label: 'ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು', val: 'ಜ್ವರ ಕೆಮ್ಮು' }
                            ].map((chip, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAddTypedSymptoms(chip.val)}
                                className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/80 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300/70 text-[10px] font-bold transition active:scale-95"
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sub-Tabs: Body Map vs Category Cards */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => setSymptomNavTab('categories')}
                          className={`py-2 rounded-xl text-xs sm:text-sm font-black transition ${
                            symptomNavTab === 'categories'
                              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          📋 {t.categoriesTab}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSymptomNavTab('body')}
                          className={`py-2 rounded-xl text-xs sm:text-sm font-black transition ${
                            symptomNavTab === 'body'
                              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          🧍 {t.tapBodyTab}
                        </button>
                      </div>

                      {/* TAB: Body Map */}
                      {symptomNavTab === 'body' && (
                        <BodyMap
                          language={settings.language}
                          selectedPart={activeBodyPart}
                          onSelectPart={(part) => {
                            setActiveBodyPart(part);
                            setSymptomNavTab('categories');
                          }}
                          onBrowseAllCategories={() => setSymptomNavTab('categories')}
                        />
                      )}

                      {/* TAB: Categories */}
                      {symptomNavTab === 'categories' && (
                        <SymptomCards
                          language={settings.language}
                          selectedSymptomIds={selectedSymptoms}
                          onToggleSymptom={handleToggleSymptom}
                          activeCategory={activeCategory}
                          activeBodyPart={activeBodyPart}
                          onOpenOtherModal={() => setShowOtherModal(true)}
                          otherText={otherText}
                          hasOtherPhotos={false}
                          onBackToBodyMap={() => setSymptomNavTab('body')}
                        />
                      )}

                      {/* Skin Questionnaire trigger if skin symptoms selected */}
                      {(selectedSymptoms.includes('skin_rash') || selectedSymptoms.includes('itching_skin')) && (
                        <SkinQuestionnaire
                          language={settings.language}
                          answers={skinAnswers}
                          onChange={(newAnswers) => setSkinAnswers(newAnswers)}
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-98 transition"
                    >
                      <span>{t.next} ({selectedSymptoms.length} {settings.language === 'hi' ? 'लक्षण' : 'symptoms'}) →</span>
                    </button>
                  </div>
                )}

                {/* QUESTION 3 (Step 4): How long have you had this? (Duration) */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                          {t.q3Title || 'How long have you had this problem?'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.q3Subtitle || 'Duration helps identify acute infections vs persistent warning signs'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            id: 'today' as const,
                            title: t.durToday || 'Today (within 24 hours)',
                            desc: t.durTodayDesc || 'Sudden onset / acute pain',
                            badge: '24h',
                            emoji: '⚡'
                          },
                          {
                            id: '1-3_days' as const,
                            title: t.dur1to3Days || '1 to 3 Days',
                            desc: t.dur1to3DaysDesc || 'Recent onset / progressing',
                            badge: '1-3d',
                            emoji: '📅'
                          },
                          {
                            id: 'more_than_3_days' as const,
                            title: t.durMoreThan3Days || 'More than 3 Days',
                            desc: t.durMoreThan3DaysDesc || 'Persistent infection or symptom',
                            badge: '>3d',
                            emoji: '⏳'
                          },
                          {
                            id: 'more_than_3_weeks' as const,
                            title: t.durMoreThan3Weeks || 'More than 3 Weeks',
                            desc: t.durMoreThan3WeeksDesc || 'Chronic / High warning flag',
                            badge: '>3wks',
                            emoji: '⚠️'
                          }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setDuration(item.id)}
                            className={`p-4 sm:p-5 rounded-2xl border-2 text-left flex items-start gap-3 transition active:scale-98 ${
                              duration === item.id
                                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-600 shadow-md ring-2 ring-teal-400/20'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="text-2xl">{item.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-sm text-slate-800 dark:text-slate-100">{item.title}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-98 transition"
                    >
                      <span>{t.next} →</span>
                    </button>
                  </div>
                )}

                {/* QUESTION 4 (Step 5): How severe is the pain or discomfort? */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                          {t.q4Title || 'How severe is the pain or discomfort?'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.q4Subtitle || 'Choose how badly it affects your ability to work or rest'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {
                            id: 'mild' as const,
                            title: t.sevMild || 'Mild Discomfort',
                            desc: t.sevMildDesc || 'Can carry on with daily tasks and work',
                            emoji: '🙂',
                            color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                          },
                          {
                            id: 'medium' as const,
                            title: t.sevModerate || 'Moderate Pain',
                            desc: t.sevModerateDesc || 'Disturbing sleep and difficult to do normal work',
                            emoji: '😐',
                            color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                          },
                          {
                            id: 'severe' as const,
                            title: t.sevSevere || 'Severe / Unbearable',
                            desc: t.sevSevereDesc || 'Very intense pain or unable to stand / walk',
                            emoji: '😣',
                            color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                          }
                        ].map((sev) => (
                          <button
                            key={sev.id}
                            type="button"
                            onClick={() => setSeverityResponse(sev.id)}
                            className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition active:scale-98 ${
                              severityResponse === sev.id
                                ? `${sev.color} shadow-lg ring-2 ring-teal-400/20 font-black`
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="text-4xl">{sev.emoji}</span>
                            <span className="font-black text-sm">{sev.title}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{sev.desc}</span>
                          </button>
                        ))}
                      </div>

                      {/* Rapidly worsening toggle */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                            {settings.language === 'hi' ? 'क्या तकलीफ तेजी से बढ़ रही है?' : 'Is the pain/condition rapidly getting worse?'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {settings.language === 'hi' ? 'पिछले कुछ घंटों में लक्षण गंभीर हो गए हैं' : 'Noticeable deterioration over the past few hours'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGettingWorse(!gettingWorse)}
                          className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                            gettingWorse
                              ? 'bg-rose-500 text-white shadow-md'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {gettingWorse ? 'YES (Worsening)' : 'NO'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-98 transition"
                    >
                      <span>{t.next} →</span>
                    </button>
                  </div>
                )}

                {/* QUESTION 5 (Step 6): Emergency Danger Signs (Red Flags) */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider inline-block mb-1">
                          Safety Priority
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                          {t.q5Title || 'Any emergency danger signs?'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.q5Subtitle || 'Tap if you or the patient experience any of these critical red flags:'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: 'chest_pain', label: t.rfChestPain || 'Severe crushing chest pain or pressure', emoji: '💔' },
                          { id: 'breathlessness', label: t.rfBreathless || 'Severe difficulty breathing / gasping', emoji: '🫁' },
                          { id: 'snake_bite', label: t.rfSnakeBite || 'Snake bite or toxic insect sting', emoji: '🐍' },
                          { id: 'unconsciousness', label: t.rfUnconscious || 'Fainting, collapse, or confusion', emoji: '😵' },
                          { id: 'abnormal_bleeding_women', label: t.rfSevereBleed || 'Severe uncontrolled bleeding', emoji: '🩸' },
                          { id: 'blood_in_cough', label: t.rfCoughBlood || 'Coughing up blood or vomiting blood', emoji: '⚠️' },
                          { id: 'stiff_neck_fever', label: t.rfStiffNeck || 'High fever with stiff neck & light hurt', emoji: '🌡️' }
                        ].map((flag) => {
                          const isSelected = redFlagsSelected.includes(flag.id);
                          return (
                            <button
                              key={flag.id}
                              type="button"
                              onClick={() => handleToggleRedFlag(flag.id)}
                              className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition active:scale-98 ${
                                isSelected
                                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="text-xl shrink-0">{flag.emoji}</span>
                              <span className="font-bold text-xs flex-1">{flag.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                            </button>
                          );
                        })}

                        {/* None button */}
                        <button
                          type="button"
                          onClick={() => handleToggleRedFlag('none')}
                          className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition sm:col-span-2 ${
                            redFlagsSelected.length === 0
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm font-black'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold flex-1">{t.rfNone || 'No emergency danger signs'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(7)}
                      className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-98 transition"
                    >
                      <span>{t.next} →</span>
                    </button>
                  </div>
                )}

                {/* QUESTION 6 (Step 7): Existing conditions & Daily habits (Final checkup step) */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                          {t.q6Title || 'Any existing conditions or daily habits?'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.q6Subtitle || 'These help Dr SAIhib personalize medicine cautions and health risks'}
                        </p>
                      </div>

                      {/* Conditions */}
                      <div>
                        <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">
                          {t.existingConditionsLabel}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'diabetes', label: t.diabetes, emoji: '🩸' },
                            { id: 'high_bp', label: t.highBp, emoji: '💓' },
                            { id: 'asthma', label: t.asthma, emoji: '🫁' },
                            { id: 'heart_disease', label: t.heartDisease, emoji: '❤️' },
                            { id: 'none', label: t.none, emoji: '✨' }
                          ].map((item) => {
                            const isSelected = item.id === 'none' ? conditions.length === 0 : conditions.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleToggleCondition(item.id)}
                                className={`p-2.5 rounded-xl border-2 text-xs font-bold flex items-center gap-1.5 transition ${
                                  isSelected
                                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 shadow-2xs'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span>{item.emoji}</span>
                                <span className="truncate">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Habits */}
                      <div>
                        <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">
                          {t.habitsLabel}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'tobacco', label: t.tobacco, emoji: '🌿' },
                            { id: 'smoking', label: t.smoking, emoji: '🚬' },
                            { id: 'alcohol', label: t.alcohol, emoji: '🍷' },
                            { id: 'none', label: t.none, emoji: '✨' }
                          ].map((item) => {
                            const isSelected = item.id === 'none' ? habits.length === 0 : habits.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleToggleHabit(item.id)}
                                className={`p-2.5 rounded-xl border-2 text-xs font-bold flex items-center gap-1.5 transition ${
                                  isSelected
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-200 shadow-2xs'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span>{item.emoji}</span>
                                <span className="truncate">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Final Action Button: Generate Health Guidance Report */}
                    <button
                      type="button"
                      onClick={handleFinishTriage}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 via-sky-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-black text-lg shadow-xl flex items-center justify-center gap-2 active:scale-98 transition ring-4 ring-teal-500/20"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>{settings.language === 'hi' ? 'स्वास्थ्य सलाह रिपोर्ट देखें' : 'Get Health Guidance Report'} →</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 8: RESULT SCREEN */}
            {currentStep === 8 && completedRecord && (
              <ResultScreen
                language={settings.language}
                record={completedRecord}
                ashaContact={ashaContact}
                onPrint={() => setShowPrintSlip(true)}
                onStartOver={handleStartOver}
                onOpenRecords={() => setCurrentScreen('records')}
              />
            )}
          </div>
        )}
      </main>

      {/* SPECIALIZED FULL-SCREEN OVERLAYS & MODALS */}
      {/* 1. SOS Modal (Direct 1-tap call 108 & GPS location) */}
      {showSosModal && (
        <SosModal
          language={settings.language}
          ashaContact={ashaContact}
          onClose={() => setShowSosModal(false)}
        />
      )}

      {/* 2. CPR Step-by-Step Human Pictorial Guide */}
      {showCprGuide && (
        <CprGuide
          language={settings.language}
          onClose={() => setShowCprGuide(false)}
        />
      )}

      {/* 3. Man Ki Baat (Emotional Support & Tele-MANAS) */}
      {showManKiBaat && (
        <ManKiBaat
          language={settings.language}
          ashaContact={ashaContact}
          onClose={() => setShowManKiBaat(false)}
        />
      )}

      {/* 4. Childhood Vaccine UIP Checklist (< 18 Years) */}
      {showVaccineModal && (
        <VaccineModal
          language={settings.language}
          ageYears={age}
          onClose={() => setShowVaccineModal(false)}
          onSaveCheckedVaccines={(ids) => {
            console.log('Saved checked vaccines:', ids);
          }}
        />
      )}

      {/* 5. Dedicated Maternal & Pregnancy Checkup */}
      {showPregnancyCheckup && (
        <PregnancyCheckup
          language={settings.language}
          patientName={patientName}
          patientCode={currentPatientCode}
          age={age}
          ashaContact={ashaContact}
          onClose={() => setShowPregnancyCheckup(false)}
          onFinishCheckup={handleSaveSpecializedRecord}
        />
      )}

      {/* 6. Dedicated Cancer Early Warning Diagnosis Track */}
      {showCancerCheckup && (
        <CancerCheckup
          language={settings.language}
          patientName={patientName}
          patientCode={currentPatientCode}
          age={age}
          gender={gender}
          ashaContact={ashaContact}
          onClose={() => setShowCancerCheckup(false)}
          onFinishCheckup={handleSaveSpecializedRecord}
        />
      )}

      {/* 7. Sovereign AI & Privacy Modal */}
      {showPrivacyModal && (
        <PrivacyModal
          language={settings.language}
          onClose={() => setShowPrivacyModal(false)}
        />
      )}

      {/* 8. Printable A4 Advice Slip */}
      {showPrintSlip && completedRecord && (
        <PrintSlip
          language={settings.language}
          record={completedRecord}
          ashaContact={ashaContact}
          onClose={() => setShowPrintSlip(false)}
        />
      )}
    </div>
  );
}
