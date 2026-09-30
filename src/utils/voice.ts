import { Language } from '../types';
import { SYMPTOMS_LIST } from '../data/knowledgeBase';

// Web Speech API interfaces
interface IWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SpeechRecognition?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webkitSpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as IWindow;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

// Gentle pleasant audio chimes using Web Audio API
export function playChime(type: 'start' | 'success' | 'stop') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'start') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // Ignore audio context errors if muted or blocked
  }
}

// Comprehensive multi-lingual and transliterated keyword map for rural and urban India
export const COMMON_PHONETIC_KEYWORDS: Record<string, string[]> = {
  fever: [
    'fever', 'temperature', 'hot', 'chills', 'shivering', 'warm', 'high temp',
    'बुखार', 'ताप', 'गरम', 'ठंड', 'कांपना', 'तेज बुखार',
    'bukhar', 'buhar', 'taap', 'jwara', 'jvara', 'bisi', 'ಜ್ವರ', 'ಬಿಸಿ', 'ಚಳಿ'
  ],
  cough: [
    'cough', 'coughing', 'hack', 'phlegm', 'mucus', 'dry cough', 'wet cough',
    'खांसी', 'कफ', 'बलगम', 'सूखी खांसी', 'खांसी आ रही',
    'khansi', 'khaasi', 'kaf', 'balgam', 'kemmu', 'kaph', 'ಕೆಮ್ಮು', 'ಕಫ'
  ],
  headache: [
    'headache', 'head ache', 'head pain', 'migraine', 'throbbing head',
    'सिरदर्द', 'सिर में दर्द', 'माथा दर्द', 'सर दर्द', 'माथे में दर्द',
    'sardard', 'sir dard', 'matha dard', 'tale novu', 'thale novu', 'talenovu', 'ತಲೆನೋವು', 'ತಲೆ ನೋವು'
  ],
  fatigue: [
    'tired', 'weakness', 'fatigue', 'no energy', 'drowsy', 'exhausted', 'lethargic',
    'कमजोरी', 'थकान', 'सुस्ती', 'थकावट', 'बेहोशी', 'शरीर टूट रहा',
    'kamzori', 'kamjori', 'thakan', 'ayasa', 'susthu', 'susthi', 'ಆಯಾಸ', 'ಸುಸ್ತು', 'ನಿಶ್ಯಕ್ತಿ'
  ],
  dizziness: [
    'dizziness', 'fainting', 'spinning', 'giddy', 'lightheaded', 'loss of balance',
    'चक्कर', 'बेहोशी', 'सिर घूमना', 'अंधेरा छाना',
    'chakkar', 'behosh', 'thale suthu', 'ತಲೆಸುತ್ತು', 'ಮೂರ್ಛೆ'
  ],
  sore_throat: [
    'sore throat', 'throat pain', 'throat irritation', 'difficulty swallowing',
    'गले में खराश', 'गले में दर्द', 'गला खराब', 'गले में सूजन',
    'gala dard', 'gale me dard', 'kharash', 'gantalu novu', 'gantalu uritha', 'ಗಂಟಲು ನೋವು', 'ಗಂಟಲು'
  ],
  runny_nose: [
    'runny nose', 'cold', 'sneezing', 'blocked nose', 'nasal congestion', 'flu',
    'सर्दी', 'जुकाम', 'नाक बहना', 'छींक', 'नाक बंद',
    'sardi', 'jukham', 'jukaam', 'naak bahna', 'sheetha', 'moogu sora', 'ಶೀತ', 'ನೆಗಡಿ'
  ],
  breathlessness: [
    'breathless', 'shortness of breath', 'difficulty breathing', 'gasping', 'wheezing', 'asthma',
    'सांस फूलना', 'दम घुटना', 'सांस लेने में तकलीफ', 'सांस की तकलीफ',
    'saans', 'dam', 'saans phoolna', 'usirata thondare', 'dammu', 'ಉಸಿರಾಟದ ತೊಂದರೆ', 'ದಮ್ಮು'
  ],
  chest_pain: [
    'chest pain', 'heart pain', 'pressure in chest', 'tightness in chest', 'angina',
    'छाती में दर्द', 'सीने में दर्द', 'छाती भारी', 'दिल में दर्द',
    'chhati dard', 'sine me dard', 'chati dard', 'ede novu', 'edenoavu', 'ಎದೆ ನೋವು', 'ಎದೆಬಡಿತ'
  ],
  abdominal_pain: [
    'stomach pain', 'belly ache', 'cramps', 'tummy ache', 'stomach ache', 'abdomen pain',
    'पेट दर्द', 'पेट में मरोड़', 'पेट खराब', 'पेट में ऐंठन',
    'pet dard', 'pet kharab', 'marod', 'hotte novu', 'hottenovu', 'ಹೊಟ್ಟೆ ನೋವು', 'ಹೊಟ್ಟೆ'
  ],
  nausea_vomiting: [
    'vomiting', 'nausea', 'throwing up', 'puking', 'queasy', 'vomit',
    'उल्टी', 'जी मिचलाना', 'मतली', 'कै', 'उलटी होना',
    'ulti', 'ji michlana', 'matli', 'vanthi', 'vaanthi', 'ವಾಂತಿ', 'ವಾಕರಿಕೆ'
  ],
  diarrhea: [
    'diarrhea', 'loose motion', 'loose stools', 'watery stool', 'dysentery',
    'दस्त', 'पतला शौच', 'पेचिश', 'झाड़ा', 'बार बार दस्त',
    'dast', 'patla shouch', 'jhada', 'bhedi', 'hotteli neeru', 'ಭೇದಿ', 'ಅತಿಸಾರ'
  ],
  constipation: [
    'constipation', 'hard stool', 'difficulty passing stool',
    'कब्ज', 'पेट साफ न होना', 'शौच न आना',
    'kabz', 'kabji', 'malahaddhe', 'kattu', 'ಮಲಬದ್ಧತೆ'
  ],
  joint_pain: [
    'joint pain', 'knee pain', 'arthritis', 'body ache', 'back pain', 'leg pain',
    'जोड़ों में दर्द', 'घुटने में दर्द', 'बदन दर्द', 'कमर दर्द', 'हाथ पैर में दर्द',
    'jodon me dard', 'ghutna dard', 'badan dard', 'keelu novu', 'kaalu novu', 'ಮೈಕೈ ನೋವು', 'ಕೀಲು ನೋವು'
  ],
  skin_rash: [
    'rash', 'itching', 'skin red', 'bumps', 'spots', 'allergy', 'hive',
    'खुजली', 'दाद', 'खाज', 'लाल चकत्ते', 'फोड़े',
    'khujli', 'daad', 'khaaj', 'lal chakatte', 'thurike', 'kajji', 'daddara', 'ತುರಿಕೆ', 'ಕಜ್ಜಿ', 'ದದ್ದು'
  ],
  eye_redness: [
    'red eye', 'eye pain', 'eye burning', 'watering eye', 'conjunctivitis',
    'आंख लाल', 'आंख में दर्द', 'आंख से पानी', 'आंख आना',
    'aankh lal', 'aankh me dard', 'kannu kempu', 'kannu novu', 'ಕಣ್ಣು ಕೆಂಪು', 'ಕಣ್ಣು ನೋವು'
  ],
  ear_pain: [
    'ear pain', 'ear ache', 'ear discharge', 'ear ringing',
    'कान दर्द', 'कान में मवाद', 'कान बहना', 'कान में दर्द',
    'kaan dard', 'kan dard', 'kivi novu', 'kivili neeru', 'ಕಿವಿ ನೋವು', 'ಕಿವಿ ಸೋರುವುದು'
  ],
  toothache: [
    'toothache', 'teeth pain', 'gum swelling', 'dental pain',
    'दांत दर्द', 'मसूड़े में सूजन', 'दांत में कीड़ा',
    'daant dard', 'dant dard', 'hallu novu', 'hallunovvu', 'ಹಲ್ಲು ನೋವು'
  ],
  jaundice_skin: [
    'yellow eyes', 'yellow skin', 'jaundice', 'dark urine',
    'पीलिया', 'आंखें पीली', 'पेशाब पीला', 'त्वचा पीली',
    'peeliya', 'piliya', 'kaamale', 'kamale', 'ಕಾಮಾಲೆ'
  ],
  mouth_ulcer: [
    'mouth ulcer', 'blister in mouth', 'canker sore', 'tongue blister',
    'मुंह में छाला', 'जीभ में छाला', 'मुंह के छाले',
    'chhale', 'chaale', 'baayi hunnu', 'ಬಾಯಿ ಹುಣ್ಣು'
  ]
};

export function matchSymptomsFromText(text: string, lang: Language): string[] {
  if (!text) return [];

  // Normalize: lower case, remove punctuation, normalize spaces
  const normalized = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'।]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return [];

  const matchedIds = new Set<string>();

  // 1. First check high-accuracy phonetic dictionary
  Object.entries(COMMON_PHONETIC_KEYWORDS).forEach(([symptomId, phrases]) => {
    for (const phrase of phrases) {
      const cleanPhrase = phrase.toLowerCase().trim();
      if (cleanPhrase.length >= 2 && normalized.includes(cleanPhrase)) {
        matchedIds.add(symptomId);
        break;
      }
    }
  });

  // 2. Also check full SYMPTOMS_LIST from knowledge base
  SYMPTOMS_LIST.forEach((symptom) => {
    // Check keywords for active language
    const langKw = symptom.keywords[lang] || [];
    for (const kw of langKw) {
      const cleanKw = kw.toLowerCase().trim();
      if (cleanKw.length >= 2 && normalized.includes(cleanKw)) {
        matchedIds.add(symptom.id);
        break;
      }
    }

    // Check English keywords (e.g. medical loanwords)
    if (lang !== 'en' && symptom.keywords.en) {
      for (const kw of symptom.keywords.en) {
        const cleanKw = kw.toLowerCase().trim();
        if (cleanKw.length >= 3 && normalized.includes(cleanKw)) {
          matchedIds.add(symptom.id);
          break;
        }
      }
    }

    // Check Hindi keywords
    if (lang !== 'hi' && symptom.keywords.hi) {
      for (const kw of symptom.keywords.hi) {
        const cleanKw = kw.toLowerCase().trim();
        if (cleanKw.length >= 2 && normalized.includes(cleanKw)) {
          matchedIds.add(symptom.id);
          break;
        }
      }
    }
  });

  return Array.from(matchedIds);
}

/**
 * Robust Speech Recognition Starter
 * Runs synchronously in response to user click to preserve browser gesture tokens.
 */
export function startSpeechRecognition(
  lang: Language,
  onResult: (transcript: string, matchedSymptomIds: string[]) => void,
  onError: (err: string) => void,
  onEnd: () => void
): () => void {
  const win = window as IWindow;
  const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRec) {
    onError('Speech recognition not supported on this browser. Please type or use quick chips.');
    return () => {};
  }

  let isExplicitlyStopped = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recognition: any = null;

  const langCodeMap: Record<Language, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    kn: 'kn-IN'
  };

  let accumulatedTranscript = '';
  const accumulatedMatchedIds = new Set<string>();

  try {
    playChime('start');
    recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = langCodeMap[lang] || 'en-IN';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript + ' ';
      }
      accumulatedTranscript = currentTranscript.trim();

      const matched = matchSymptomsFromText(accumulatedTranscript, lang);
      matched.forEach((id) => accumulatedMatchedIds.add(id));

      if (matched.length > 0) {
        playChime('success');
      }

      onResult(accumulatedTranscript, Array.from(accumulatedMatchedIds));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn('Speech recognition notice:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isExplicitlyStopped = true;
        onError(
          lang === 'hi'
            ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें या नीचे लक्षण चुनें।'
            : 'Microphone permission not granted. Please allow microphone in browser or select symptoms below.'
        );
      } else if (event.error === 'network') {
        onError(
          lang === 'hi'
            ? 'वॉइस सेवा के लिए इंटरनेट आवश्यक है। आप नीचे तुरंत लक्षण चुन सकते हैं।'
            : 'Network connection required for voice recognition. You can tap quick symptoms below.'
        );
      } else if (event.error !== 'no-speech') {
        onError(event.error);
      }
    };

    recognition.onend = () => {
      if (!isExplicitlyStopped) {
        // Try gentle continuation if not stopped by user
        try {
          recognition.start();
        } catch {
          playChime('stop');
          onEnd();
        }
      } else {
        playChime('stop');
        onEnd();
      }
    };

    recognition.start();
  } catch (err) {
    console.warn('Failed to start speech recognition synchronously:', err);
    onError(
      lang === 'hi'
        ? 'माइक्रोफ़ोन शुरू नहीं हो सका। कृपया नीचे दिए गए त्वरित लक्षणों को टैप करें।'
        : 'Could not start microphone. Please tap the quick symptom buttons below.'
    );
  }

  return () => {
    isExplicitlyStopped = true;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    }
  };
}

export function speakText(text: string, lang: Language, onEnd?: () => void): void {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd();
    return;
  }

  try {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92; // Slightly gentler, empathetic pace
    utterance.pitch = 1.0;

    const langCodeMap: Record<Language, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN'
    };
    utterance.lang = langCodeMap[lang] || 'en-IN';

    // Try finding Indian accent or matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(lang) || v.lang.includes(langCodeMap[lang])
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis notice:', e);
    if (onEnd) onEnd();
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
