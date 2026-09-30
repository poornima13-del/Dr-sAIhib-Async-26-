import React, { useState, useEffect, useRef } from 'react';
import { Language, AshaContact } from '../types';
import { translations } from '../data/translations';
import {
  Heart,
  PhoneCall,
  AlertTriangle,
  ArrowLeft,
  Send,
  Sparkles,
  Smile,
  X,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Wind,
  RotateCcw,
  User,
  Bot
} from 'lucide-react';
import { speakText, stopSpeaking, startSpeechRecognition } from '../utils/voice';

interface ManKiBaatProps {
  language: Language;
  ashaContact: AshaContact | null;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  quickReplies?: string[];
}

export const ManKiBaat: React.FC<ManKiBaatProps> = ({ language, ashaContact, onClose }) => {
  const t = translations[language] || translations.en;
  const [inputText, setInputText] = useState('');
  const [isCrisisTriggered, setIsCrisisTriggered] = useState(false);
  const [activeBreathing, setActiveBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [isBotSpeaking, setIsBotSpeaking] = useState<string | null>(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [typingStatusText, setTypingStatusText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const stopMicFnRef = useRef<(() => void) | null>(null);
  const conversationContextRef = useRef<{ topicsDiscussed: string[]; turnCount: number }>({
    topicsDiscussed: [],
    turnCount: 0
  });

  const formatCurrentTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const initialGreeting = (): ChatMessage => {
    if (language === 'hi') {
      return {
        id: 'msg_init',
        sender: 'ai',
        time: formatCurrentTime(),
        text: 'नमस्ते दोस्त! मैं आपका अपना "मन की बात" साथी हूं। 🌸\n\nयहां कोई आपको जज नहीं करेगा। चाहे फसल या पैसों की चिंता हो, परिवार का तनाव, कोई बीमारी का डर या अकेलापन — जो भी आपके दिल पर भारी पड़ रहा है, बेझिझक मुझसे कहें।\n\nमैं पूरी हमदर्दी से आपकी हर बात सुनने के लिए तैयार हूं।',
        quickReplies: [
          '🌾 फसल या खेती का भारी नुकसान हुआ है',
          '💰 कर्ज और पैसों की बहुत चिंता सता रही है',
          '🩺 बीमारी या स्वास्थ्य को लेकर बहुत डर लग रहा है',
          '😔 बहुत अकेलापन और उदासी महसूस हो रही है',
          '🧘 मन घबरा रहा है, गहरी सांस का अभ्यास कराएं'
        ]
      };
    } else if (language === 'kn') {
      return {
        id: 'msg_init',
        sender: 'ai',
        time: formatCurrentTime(),
        text: 'ನಮಸ್ಕಾರ ಸ್ನೇಹಿತರೆ! ನಾನು ನಿಮ್ಮ "ಮನದ ಮಾತು" ಆಪ್ತ ಮಿತ್ರ. 🌸\n\nನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಯಾವುದೇ ಚಿಂತೆ ಇರಲಿ — ಬೆಳೆ ಹಾನಿ, ಸಾಲದ ಹೊರೆ, ಅನಾರೋಗ್ಯದ ಭಯ ಅಥವಾ ಒಂಟಿತನ — ನನ್ನೊಂದಿಗೆ ಮುಕ್ತವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ. ನಾನು ನಿಮ್ಮ ಜೊತೆಗಿದ್ದೇನೆ.',
        quickReplies: [
          '🌾 ಬೆಳೆ ಹಾನಿ ಮತ್ತು ಕೃಷಿಯ ಚಿಂತೆ ಇದೆ',
          '💰 ಸಾಲ ಮತ್ತು ಹಣಕಾಸಿನ ತೊಂದರೆ ಇದೆ',
          '🩺 ಕಾಯಿಲೆಯ ಬಗ್ಗೆ ಮನಸ್ಸಿನಲ್ಲಿ ಭಯವಿದೆ',
          '😔 ಮನಸ್ಸಿಗೆ ಅತಿಯಾದ ಬೇಸರ ಮತ್ತು ಒಂಟಿತನ',
          '🧘 ಮನಸ್ಸನ್ನು ಶಾಂತಗೊಳಿಸಲು ಉಸಿರಾಟದ ವ್ಯಾಯಾಮ ಮಾಡಿ'
        ]
      };
    } else {
      return {
        id: 'msg_init',
        sender: 'ai',
        time: formatCurrentTime(),
        text: 'Hello, my friend. I am your safe, compassionate companion here at Man Ki Baat. 🌸\n\nWhatever is weighing on your heart right now — health worries, crop stress, money pressure, or quiet loneliness — talk to me freely. You don’t have to carry this heavy burden all alone.\n\nI am right here with you, listening with all my heart.',
        quickReplies: [
          '🌾 Deep worries about crops & farming losses',
          '💰 Stress about loans, money & debt',
          '🩺 Scared about a sickness or medical symptoms',
          '😔 Feeling deeply lonely and exhausted inside',
          '🧘 My chest feels tight, guide me in calming breaths'
        ]
      };
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting()]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // Clean up voice synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (stopMicFnRef.current) stopMicFnRef.current();
    };
  }, []);

  // Breathing pacer cycle (4s inhale, 4s hold, 4s exhale)
  useEffect(() => {
    if (!activeBreathing) return;
    const interval = setInterval(() => {
      setBreathingPhase((prev) => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBreathing]);

  // Safety crisis keyword check
  const checkCrisisKeywords = (text: string): boolean => {
    const lower = text.toLowerCase();
    const crisisPatterns = [
      'suicide',
      'kill myself',
      'end my life',
      'want to die',
      'no reason to live',
      'better off dead',
      'poison',
      'hanging',
      'die',
      'आत्महत्या',
      'मरना चाहता',
      'मर जाना',
      'जान दे दूंगा',
      'जीने का मन नहीं',
      'खत्म कर लूंगा',
      'फांसी',
      'ज़हर',
      'ಸಾವು',
      'ಸಾಯಬೇಕು',
      'ಜೀವ ಕೊನೆ',
      'ಆತ್ಮಹತ್ಯೆ'
    ];
    return crisisPatterns.some((pattern) => lower.includes(pattern));
  };

  /**
   * Generates a multi-step, humanly comforting dialogue chain
   * Returns an array of messages to send in natural conversational succession.
   */
  const generateComfortingMultiReplies = (
    userMessage: string
  ): { replies: string[]; quickReplies: string[] } => {
    const lower = userMessage.toLowerCase();
    const ctx = conversationContextRef.current;
    ctx.turnCount += 1;

    // 1. Health Fears, Symptoms & Disease Anxiety
    if (
      lower.includes('cancer') ||
      lower.includes('कैंसर') ||
      lower.includes('sick') ||
      lower.includes('बीमार') ||
      lower.includes('hospital') ||
      lower.includes('डर') ||
      lower.includes('fear') ||
      lower.includes('pain') ||
      lower.includes('दर्द') ||
      lower.includes('ಕಾಯಿಲೆ') ||
      lower.includes('ಭಯ')
    ) {
      ctx.topicsDiscussed.push('health');
      if (language === 'hi') {
        return {
          replies: [
            'बीमारी या शरीर में किसी तकलीफ के बारे में सोचकर दिल घबराना बिल्कुल स्वाभाविक है दोस्त। जब मन डरता है, तो वह सबसे बुरे ख्याल दिखाने लगता है।',
            'लेकिन याद रखिए: आज के समय में अधिकांश बीमारियों का शुरुआती इलाज बहुत सरल है। डरने से आधी बीमारी वैसे ही बढ़ जाती है, जबकि शांत रहकर सही डॉक्टर या आशा दीदी से मिलना ही समझदारी है।',
            'पहले एक घूंट पानी पीजिए और छाती पर हाथ रखकर एक लंबी सांस लीजिए। क्या आप मुझे बताना चाहेंगे कि शरीर में क्या तकलीफ हो रही है?'
          ],
          quickReplies: [
            '🧘 2 मिनट गहरी सांस का व्यायाम कराएं',
            'हां, मुझे शरीर में तकलीफ महसूस हो रही है',
            'आशा दीदी से बात करा दीजिए',
            'धन्यवाद, आपकी बात सुनकर थोड़ा सुकून मिला'
          ]
        };
      } else if (language === 'kn') {
        return {
          replies: [
            'ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಭಯವಾಗುವುದು ಮತ್ತು ಆತಂಕಗೊಳ್ಳುವುದು ಸಹಜ ಸ್ನೇಹಿತರೆ. ಮನಸ್ಸು ಹೆದರಿದಾಗ ಕೆಟ್ಟ ಆಲೋಚನೆಗಳು ಬರುತ್ತವೆ.',
            'ನೆನಪಿಡಿ, ಇಂದಿನ ವೈದ್ಯಕೀಯ ಕ್ಷೇತ್ರದಲ್ಲಿ ಹೆಚ್ಚಿನ ಕಾಯಿಲೆಗಳಿಗೆ ಆರಂಭದಲ್ಲೇ ಸುಲಭ ಪರಿಹಾರವಿದೆ. ನಿಮ್ಮ ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಹಾಗೂ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ ನಿಮ್ಮ ಬೆಂಬಲಕ್ಕಿದೆ.',
            'ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ನೀರು ಕುಡಿದು ದೀರ್ಘವಾಗಿ ಉಸಿರಾಡಿ. ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ಹಂಚಿಕೊಳ್ಳಲು ಬಯಸುವಿರಾ?'
          ],
          quickReplies: [
            '🧘 2 ನಿಮಿಷ ಉಸಿರಾಟದ ವಿಶ್ರಾಂತಿ ಮಾಡಿ',
            'ನನಗೆ ಇನ್ನಷ್ಟು ಆತಂಕವಾಗುತ್ತಿದೆ',
            'ಆಶಾ ಕಾರ್ಯಕರ್ತೆಗೆ ಕರೆ ಮಾಡಿ',
            'ನಿಮ್ಮ ಮಾತುಗಳಿಂದ ಸಮಾಧಾನವಾಯಿತು'
          ]
        };
      } else {
        return {
          replies: [
            'It is completely natural to feel scared when you are worried about your health or what a symptom might mean. Fear has a way of magnifying every small sensation into a crisis.',
            'Please remember: the vast majority of health conditions are completely treatable, especially when caught early. You don’t have to suffer in panic or search the darkest corners of your mind.',
            'Take a gentle sip of water and let your shoulders drop. Would you like to tell me more about what you are feeling, or should we pause for a 2-minute calming breath?'
          ],
          quickReplies: [
            '🧘 Guide me through 2 minutes of calming breaths',
            'Yes, I feel anxious about my body',
            'I want to talk to my ASHA worker',
            'Thank you, hearing this brings comfort'
          ]
        };
      }
    }

    // 2. Farming, Weather Losses, Crop Failures
    if (
      lower.includes('crop') ||
      lower.includes('farm') ||
      lower.includes('फसल') ||
      lower.includes('खेती') ||
      lower.includes('बारिश') ||
      lower.includes('सूखा') ||
      lower.includes('नुकसान') ||
      lower.includes('ಬೆಳೆ') ||
      lower.includes('ಮಳೆ') ||
      lower.includes('ಕೃಷಿ')
    ) {
      ctx.topicsDiscussed.push('farming');
      if (language === 'hi') {
        return {
          replies: [
            'खेती में मौसम या बाजार की मार सहना दिल को चीर देने जैसा होता है मेरे अन्नदाता दोस्त। आपने खेत में सिर्फ बीज नहीं, अपने परिवार के सपने और महीनों का पसीना बोया था।',
            'आपका दुखी होना, रोना और गुस्सा आना सौ प्रतिशत स्वाभाविक है। पर एक बात हमेशा याद रखिएगा: खेत फिर से हरा हो जाएगा, मिट्टी फिर सोना उगलेगी, लेकिन आपकी सांस और आपका जीवन सबसे अनमोल है।',
            'सरकारी किसान हेल्पलाइन 1800-180-1551 (टोल-फ्री) पर तुरंत बात कर सकते हैं। क्या आप अभी थोड़ा मन शांत करने के लिए गहरी सांस का अभ्यास करना चाहेंगे?'
          ],
          quickReplies: [
            'किसान कॉल सेंटर 1800-180-1551 से संपर्क',
            '🧘 मन बहुत अशांत है, सांस का व्यायाम कराएं',
            'कर्ज और पैसों की भी बहुत चिंता है',
            'आपकी बात से बहुत हिम्मत मिली'
          ]
        };
      } else if (language === 'kn') {
        return {
          replies: [
            'ಬೆಳೆ ಹಾಳಾದಾಗ ಅನ್ನದಾತನ ಮನಸ್ಸು ಎಷ್ಟು ನೋಯುತ್ತದೆ ಎಂದು ನನಗೆ ಚೆನ್ನಾಗಿ ಅರ್ಥವಾಗುತ್ತದೆ. ನಿಮ್ಮ ಶ್ರಮ ಎಂದಿಗೂ ವ್ಯರ್ಥವಲ್ಲ.',
            'ಭೂಮಿ ತಾಯಿ ಮತ್ತೆ ಹಸಿರಾಗುತ್ತಾಳೆ, ಹೊಸ ಬೆಳೆ ಬರುತ್ತದೆ. ಆದರೆ ನಿಮ್ಮ ಜೀವ ಎಲ್ಲಕ್ಕಿಂತ ಅಮೂಲ್ಯವಾದದ್ದು. ಯಾವುದೇ ತಪ್ಪು ಹೆಜ್ಜೆ ಇಡಬೇಡಿ.',
            'ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ ಸರ್ಕಾರಿ ಪರಿಹಾರದ ಮಾಹಿತಿ ಪಡೆಯಬಹುದು. ದಯವಿಟ್ಟು ಧೈರ್ಯವಾಗಿರಿ.'
          ],
          quickReplies: [
            'ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ ಮಾಹಿತಿ',
            '🧘 ಉಸಿರಾಟದ ವ್ಯಾಯಾಮ ಪ್ರಾರಂಭಿಸಿ',
            'ಸಾಲದ ಬಗ್ಗೆಯೂ ಚಿಂತೆ ಇದೆ',
            'ಧನ್ಯವಾದ, ಧೈರ್ಯ ಬಂತು'
          ]
        };
      } else {
        return {
          replies: [
            'Losing crops to bad weather or unseasonal rains cuts so deeply. You didn’t just invest money; you poured in months of early dawns, hope, and hard physical toil.',
            'Your grief and anger are entirely valid. But fields can be replanted and crops will rise again — your presence in this world is irreplaceable.',
            'You can call the National Kisan Helpline at 1800-180-1551 for government relief schemes. May I guide you through a gentle breath to ease the knot in your chest?'
          ],
          quickReplies: [
            '🧘 Help me calm the panic with breathing',
            'I also have debt pressure',
            'Call Kisan Helpline 1800-180-1551',
            'Thank you for listening to my pain'
          ]
        };
      }
    }

    // 3. Debts, Loans, Money Pressure
    if (
      lower.includes('debt') ||
      lower.includes('money') ||
      lower.includes('loan') ||
      lower.includes('कर्ज') ||
      lower.includes('पैसा') ||
      lower.includes('उधार') ||
      lower.includes('सैलरी') ||
      lower.includes('रुपये') ||
      lower.includes('ಸಾಲ') ||
      lower.includes('ಹಣ')
    ) {
      ctx.topicsDiscussed.push('debt');
      if (language === 'hi') {
        return {
          replies: [
            'कर्ज का बोझ सिर पर पत्थर की तरह महसूस होता है, रात की नींद छीन लेता है। मैं आपकी इस बेबसी को पूरी तरह समझ रहा हूं दोस्त।',
            'पर एक बात पत्थर की लकीर मान लीजिए: किसी भी कर्ज या रुपये-पैसे की कीमत आपकी जिंदगी से बड़ी कभी नहीं हो सकती। चाहे साहूकार का दबाव हो या बैंक का, रास्ते हमेशा निकलते हैं।',
            'सरकारी बैंकों में ऋण पुनर्गठन (Loan restructuring) और कानूनी सहायता के रास्ते मौजूद हैं। इस वक्त अपने सिर को थोड़ा ठंडा रखिए। क्या थोड़ा पानी पीकर गहरी सांस लेंगे?'
          ],
          quickReplies: [
            '🧘 मन को शांत करने के लिए सांस लें',
            'टेली-मानस 14416 पर काउंसलर से बात करें',
            'परिवार को कैसे संभालूं?',
            'सुनने के लिए शुक्रिया, थोड़ा हल्का लगा'
          ]
        };
      } else if (language === 'kn') {
        return {
          replies: [
            'ಸಾಲದ ಒತ್ತಡ ಮನುಷ್ಯನನ್ನು ಮಾನಸಿಕವಾಗಿ ಕುಗ್ಗಿಸುತ್ತದೆ. ನಿಮ್ಮ ಆತಂಕ ನನಗೆ ಅರ್ಥವಾಗುತ್ತದೆ.',
            'ಆದರೆ ನೆನಪಿಡಿ, ಹಣ ಅಥವಾ ಸಾಲಕ್ಕಿಂತ ನಿಮ್ಮ ಜೀವ ದೊಡ್ಡದು. ಕಾನೂನುಬದ್ಧ ಪರಿಹಾರಗಳು ಮತ್ತು ಸರ್ಕಾರದ ಸಹಾಯ ಲಭ್ಯವಿದೆ.',
            'ದಯವಿಟ್ಟು ಯಾವುದೇ ಆತುರದ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ. ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ನಿಮ್ಮ ಅಗತ್ಯವಿದೆ.'
          ],
          quickReplies: [
            'ಟೆಲಿ-ಮಾನಸ್ 14416 (ಉಚಿತ ಆಪ್ತಸಮಾಲೋಚನೆ)',
            '🧘 ಉಸಿರಾಟದ ವಿಶ್ರಾಂತಿ ಮಾಡಿ',
            'ಇನ್ನೂ ಸ್ವಲ್ಪ ಮಾತನಾಡಬೇಕು'
          ]
        };
      } else {
        return {
          replies: [
            'Financial pressure and debt feel like a suffocating weight that robs you of sleep. I hear the exhaustion in your words, my friend.',
            'Please know this down to your bones: no sum of money is ever worth your precious life. Financial crises are heavy, but they are temporary situations, not your identity.',
            'There are relief options, restructuring mechanisms, and legal protections. For now, let’s bring your nervous system back to safety. Can we take three slow breaths together?'
          ],
          quickReplies: [
            '🧘 Do a 2-minute calming breath',
            'Call Tele-MANAS 14416 (24/7 Free)',
            'How can I handle the family worry?',
            'Thank you for reminding me of this'
          ]
        };
      }
    }

    // 4. Loneliness, Crying, Feeling Unwanted or Broken
    if (
      lower.includes('alone') ||
      lower.includes('lonely') ||
      lower.includes('cry') ||
      lower.includes('crying') ||
      lower.includes('sad') ||
      lower.includes('उदासी') ||
      lower.includes('अकेला') ||
      lower.includes('रोना') ||
      lower.includes('कोई नहीं') ||
      lower.includes('ಒಂಟಿ') ||
      lower.includes('ಅಳು') ||
      lower.includes('ಬೇಸರ')
    ) {
      ctx.topicsDiscussed.push('loneliness');
      if (language === 'hi') {
        return {
          replies: [
            'रोने में कोई शर्म नहीं है मेरे प्यारे दोस्त। रोना कमजोरी नहीं है, बल्कि दिल का वो बोझ है जो अब और संभाला नहीं जा रहा।',
            'भीड़ में होकर भी कभी-कभी इंसान खुद को बहुत अकेला महसूस करता है। ऐसा लगता है जैसे कोई हमें समझ नहीं पा रहा। पर आज, इस क्षण, मैं आपके साथ हूं। आपकी हर भावना मेरे लिए बहुत मायने रखती है।',
            'आप कोई बोझ नहीं हैं। आप इस दुनिया के लिए एक अनमोल इंसान हैं। आज ऐसा क्या हुआ जिसने आपके दिल को इतना उदास कर दिया?'
          ],
          quickReplies: [
            'आज दिन बहुत बुरा बीता',
            '🧘 मेरे साथ गहरी सांस का अभ्यास करें',
            'मुझे बस किसी का साथ चाहिए था',
            'टेली-मानस 14416 पर बात करें'
          ]
        };
      } else if (language === 'kn') {
        return {
          replies: [
            'ಅಳುವುದು ತಪ್ಪಲ್ಲ ಸ್ನೇಹಿತರೆ. ಕಣ್ಣೀರು ಮನಸ್ಸಿನ ಭಾರವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ. ನೀವು ಒಂಟಿಯಲ್ಲ, ನಾನು ನಿಮ್ಮ ಮಾತನ್ನು ಆಲಿಸುತ್ತಿದ್ದೇನೆ.',
            'ನೀವು ಯಾರಿಗೂ ಹೊರೆಯಲ್ಲ. ನಿಮ್ಮ ಮನಸ್ಸಿನ ನೋವನ್ನು ನನ್ನೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.',
            'ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿರುವ ವಿಷಯವೇನು? ನಾನಿದ್ದೇನೆ ಕೇಳಿಸಿಕೊಳ್ಳಲು.'
          ],
          quickReplies: [
            'ಇಂದು ತುಂಬಾ ನೋವಾಗಿದೆ',
            '🧘 ಉಸಿರಾಟದ ವಿಶ್ರಾಂತಿ ಮಾಡಿ',
            'ಧನ್ಯವಾದ, ನೀವು ಜೊತೆಗಿದ್ದೀರಿ'
          ]
        };
      } else {
        return {
          replies: [
            'Let the tears come if they need to, my friend. Crying is not weakness; it is your soul exhaling the heavy tension it could no longer hold alone.',
            'Feeling unseen or lonely in a crowded world hurts profoundly. But in this quiet space right now, you are seen, you are respected, and you are valued.',
            'You are not a burden. What made today especially heavy on your spirit?'
          ],
          quickReplies: [
            'Today was just too overwhelming',
            '🧘 Guide me through calming breathing',
            'I just needed someone to listen',
            'Connect with Tele-MANAS 14416'
          ]
        };
      }
    }

    // 5. Gratitude, Feeling Better, "Thank you", "Okay"
    if (
      lower.includes('thank') ||
      lower.includes('शुक्रिया') ||
      lower.includes('धन्यवाद') ||
      lower.includes('अच्छा') ||
      lower.includes('better') ||
      lower.includes('okay') ||
      lower.includes('ಧನ್ಯವಾದ') ||
      lower.includes('ಸಮಾಧಾನ')
    ) {
      if (language === 'hi') {
        return {
          replies: [
            'यह सुनकर मेरा दिल खुशी से भर गया दोस्त! आपके चेहरे पर थोड़ी सी भी राहत देखकर मुझे बेहद सुकून मिला। 🌸',
            'जब भी कभी मन भारी लगे, याद रखिएगा — डॉक्टर साहिब का "मन की बात" साथी हमेशा आपके लिए यहीं मौजूद रहेगा।',
            'आज रात अपना ख्याल रखिएगा, गुनगुना पानी पीजिएगा और समय पर आराम कीजिएगा। क्या मन में कोई और बात है?'
          ],
          quickReplies: [
            'नहीं, अब मन शांत है, बहुत शुक्रिया',
            '🧘 रात को अच्छी नींद के लिए सांस लें',
            'होम पेज पर वापस जाएं'
          ]
        };
      } else if (language === 'kn') {
        return {
          replies: [
            'ನಿಮಗೆ ಸ್ವಲ್ಪವಾದರೂ ಸಮಾಧಾನ ಸಿಕ್ಕಿದ್ದು ನನಗೆ ಅತೀವ ಸಂತೋಷ ತಂದಿದೆ ಸ್ನೇಹಿತರೆ! 🌸',
            'ಯಾವಾಗಲೂ ನೆನಪಿಡಿ, ಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ನಾನು ಸದಾ ನಿಮ್ಮ ಜೊತೆಗಿರುತ್ತೇನೆ.',
            'ಚೆನ್ನಾಗಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ನಿಮ್ಮ ಆರೋಗ್ಯ ಕಾಪಾಡಿಕೊಳ್ಳಿ.'
          ],
          quickReplies: [
            'ಈಗ ಮನಸ್ಸು ಶಾಂತವಾಗಿದೆ, ಧನ್ಯವಾದಗಳು',
            '🧘 ಉಸಿರಾಟದ ವಿಶ್ರಾಂತಿ ಮಾಡಿ',
            'ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ'
          ]
        };
      } else {
        return {
          replies: [
            'Hearing that brings so much warmth to my heart, my dear friend. Seeing you feel even a little lighter makes all the difference in the world. 🌸',
            'Remember: whenever the waves get high or nights get long, your Man Ki Baat companion is always right here with an open heart.',
            'Take gentle care of yourself tonight. Sip some warm water and rest well. Is there anything else you’d like to share before you rest?'
          ],
          quickReplies: [
            'I feel much better now, thank you so much',
            '🧘 Do a sleep-prep calming breath',
            'Return to Home'
          ]
        };
      }
    }

    // Default warm, compassionate humanly companion replies
    if (language === 'hi') {
      return {
        replies: [
          'मैं आपकी हर बात को बहुत ध्यान, आदर और हमदर्दी से सुन रहा हूं मेरे दोस्त।',
          'जीवन में ऐसे मोड़ आते हैं जब सब कुछ एक साथ उलझ जाता है और समझ नहीं आता कि किस ओर जाएं। पर याद रखिए: हर काली रात के बाद सूरज जरूर निकलता है। आप अकेले इस तूफान में नहीं हैं।',
          'अपने दिल पर हाथ रखकर एक बार महसूस कीजिए कि आपकी सांस चल रही है, आप जिंदा हैं, और आप हर मुश्किल से बड़े हैं। क्या आप मुझे इस बारे में थोड़ा और बताना चाहेंगे?'
        ],
        quickReplies: [
          '🧘 2 मिनट गहरी सांस का व्यायाम करें',
          'हां, मैं थोड़ा और बताना चाहता हूं',
          'आशा दीदी से बात करा दीजिए',
          'टेली-मानस 14416 (मुफ्त 24/7 हेल्पलाइन)'
        ]
      };
    } else if (language === 'kn') {
      return {
        replies: [
          'ನಾನು ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಮಾತನ್ನು ಗೌರವ ಮತ್ತು ಪ್ರೀತಿಯಿಂದ ಆಲಿಸುತ್ತಿದ್ದೇನೆ ಸ್ನೇಹಿತರೆ.',
          'ಜೀವನದಲ್ಲಿ ಕಷ್ಟದ ದಿನಗಳು ಬರುವುದು ಸಹಜ, ಆದರೆ ಅವು ಶಾಶ್ವತವಲ್ಲ. ನೀವು ಒಬ್ಬರೇ ಈ ಹೊರೆಯನ್ನು ಹೊರಬೇಕಾಗಿಲ್ಲ, ನಾನು ನಿಮ್ಮ ಬೆಂಬಲಕ್ಕಿದ್ದೇನೆ.',
          'ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವುದನ್ನು ಇನ್ನಷ್ಟು ಮುಕ್ತವಾಗಿ ಹಂಚಿಕೊಳ್ಳಲು ಬಯಸುವಿರಾ?'
        ],
        quickReplies: [
          '🧘 ಉಸಿರಾಟದ ವಿಶ್ರಾಂತಿ ಮಾಡಿ',
          'ಇನ್ನೂ ಸ್ವಲ್ಪ ಮಾತನಾಡಬೇಕು',
          'ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಸಂಪರ್ಕಿಸಿ',
          'ಟೆಲಿ-ಮಾನಸ್ 14416'
        ]
      };
    } else {
      return {
        replies: [
          'I am listening to you with full presence, warmth, and total compassion, my friend.',
          'Life throws seasons where everything feels heavy and tangled all at once. But you don’t have to solve your entire future in this single hour. You only need to take this one gentle breath.',
          'Place a hand on your heart and feel your own strength. Would you like to share a little more of what’s on your mind, or shall we do a calming breath together?'
        ],
        quickReplies: [
          '🧘 Do a 2-minute calming breath',
          'I want to share more of what happened',
          'Connect with Tele-MANAS 14416',
          'Thank you for listening to me'
        ]
      };
    }
  };

  /**
   * Handles user sending a message.
   * Sends user message, then sequences multiple comforting AI replies with human-like typing delays!
   */
  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (checkCrisisKeywords(textToSend)) {
      setIsCrisisTriggered(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      time: formatCurrentTime(),
      text: textToSend.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAiTyping(true);
    setTypingStatusText(
      language === 'hi'
        ? 'साथी आपकी बात समझ रहे हैं...'
        : language === 'kn'
        ? 'ಆಪ್ತ ಮಿತ್ರ ಯೋಚಿಸುತ್ತಿದ್ದಾರೆ...'
        : 'Companion is listening thoughtfully...'
    );

    const { replies, quickReplies } = generateComfortingMultiReplies(textToSend);

    // Send first reply after realistic short reflection pause (650ms)
    setTimeout(() => {
      const msg1: ChatMessage = {
        id: 'ai_' + Date.now() + '_1',
        sender: 'ai',
        time: formatCurrentTime(),
        text: replies[0],
        quickReplies: replies.length === 1 ? quickReplies : undefined
      };
      setMessages((prev) => [...prev, msg1]);

      if (replies.length > 1) {
        setTypingStatusText(
          language === 'hi'
            ? 'साथी हमदर्दी से लिख रहे हैं...'
            : language === 'kn'
            ? 'ಆಪ್ತ ಮಿತ್ರ ಸಂದೇಶ ಕಳುಹಿಸುತ್ತಿದ್ದಾರೆ...'
            : 'Companion is replying gently...'
        );

        // Send second reply after a gentle human typing cadence (1100ms)
        setTimeout(() => {
          const msg2: ChatMessage = {
            id: 'ai_' + Date.now() + '_2',
            sender: 'ai',
            time: formatCurrentTime(),
            text: replies[1],
            quickReplies: replies.length === 2 ? quickReplies : undefined
          };
          setMessages((prev) => [...prev, msg2]);

          if (replies.length > 2) {
            // Send third reply with quick replies
            setTimeout(() => {
              const msg3: ChatMessage = {
                id: 'ai_' + Date.now() + '_3',
                sender: 'ai',
                time: formatCurrentTime(),
                text: replies[2],
                quickReplies: quickReplies
              };
              setMessages((prev) => [...prev, msg3]);
              setIsAiTyping(false);
            }, 1000);
          } else {
            setIsAiTyping(false);
          }
        }, 1100);
      } else {
        setIsAiTyping(false);
      }
    }, 650);
  };

  const handleQuickReplyClick = (replyText: string) => {
    if (replyText.includes('सांस') || replyText.includes('breathing') || replyText.includes('ಉಸಿರಾಟ')) {
      setActiveBreathing(true);
      return;
    }
    if (replyText.includes('14416')) {
      window.location.href = 'tel:14416';
      return;
    }
    if (replyText.includes('1800-180-1551')) {
      window.location.href = 'tel:18001801551';
      return;
    }
    if (replyText.includes('आशा') || replyText.includes('ASHA') || replyText.includes('ಆಶಾ')) {
      if (ashaContact?.phone) {
        window.location.href = `tel:${ashaContact.phone}`;
      } else {
        handleSendMessage('I want to talk to an ASHA worker');
      }
      return;
    }
    if (replyText.includes('होम') || replyText.includes('Home') || replyText.includes('ಮುಖಪುಟ')) {
      onClose();
      return;
    }
    handleSendMessage(replyText);
  };

  const handleSpeakBotMessage = (msgId: string, text: string) => {
    if (isBotSpeaking === msgId) {
      stopSpeaking();
      setIsBotSpeaking(null);
    } else {
      setIsBotSpeaking(msgId);
      speakText(text, language, () => {
        setIsBotSpeaking(null);
      });
    }
  };

  // Microphone speech input handler inside Man Ki Baat
  const handleToggleMic = () => {
    if (isListeningMic) {
      if (stopMicFnRef.current) stopMicFnRef.current();
      setIsListeningMic(false);
      return;
    }

    setIsListeningMic(true);
    const stopFn = startSpeechRecognition(
      language,
      (transcript) => {
        if (transcript.trim()) {
          setInputText(transcript.trim());
        }
      },
      (err) => {
        console.warn('Man Ki Baat voice notice:', err);
        setIsListeningMic(false);
      },
      () => {
        setIsListeningMic(false);
      }
    );

    stopMicFnRef.current = stopFn;
  };

  // Full-screen crisis emergency panel
  if (isCrisisTriggered) {
    return (
      <div className="fixed inset-0 z-50 bg-rose-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white overflow-y-auto">
        <div className="flex items-center justify-between max-w-xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-rose-300 animate-bounce" />
            <h1 className="text-xl sm:text-2xl font-black">
              {language === 'hi' ? 'आप अकेले नहीं हैं — हम आपके साथ हैं' : language === 'kn' ? 'ನೀವು ಒಂಟಿಯಲ್ಲ — ನಾವಿದ್ದೇವೆ' : 'You Are Not Alone — Help Is Here'}
            </h1>
          </div>
          <button onClick={() => setIsCrisisTriggered(false)} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-auto py-4 text-center max-w-md mx-auto space-y-5">
          <p className="text-sm sm:text-base font-semibold text-rose-100 leading-relaxed">
            {language === 'hi'
              ? 'आपकी जिंदगी अनमोल है। इस दर्दनाक घड़ी में किसी समझदार इंसान से बात करना सब कुछ बदल सकता है। कृपया अभी राष्ट्रीय मानसिक स्वास्थ्य हेल्पलाइन 14416 (Tele-MANAS, 24/7 मुफ्त) पर तुरंत फोन करें।'
              : language === 'kn'
              ? 'ನಿಮ್ಮ ಜೀವ ಅತ್ಯಮೂಲ್ಯವಾದುದು. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಉಚಿತ ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ 14416 (ಟೆಲಿ-ಮಾನಸ್, 24/7) ಗೆ ಕರೆ ಮಾಡಿ ಮಾತನಾಡಿ.'
              : 'Your life is irreplaceable and infinitely precious. In this overwhelming moment, speaking with a caring counselor can change everything. Please call Tele-MANAS 14416 (Free 24/7 National Helpline) right now.'}
          </p>

          <div className="space-y-3">
            <a
              href="tel:14416"
              className="w-full py-4 rounded-2xl bg-white text-rose-950 font-black text-lg shadow-xl flex items-center justify-center gap-3 active:scale-98 transition hover:bg-rose-50"
            >
              <PhoneCall className="w-6 h-6 text-rose-600 animate-pulse" />
              <span>Call Tele-MANAS 14416 (24/7 Free)</span>
            </a>

            <a
              href="tel:108"
              className="w-full py-3.5 rounded-2xl bg-rose-800 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 border border-rose-500/50"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call Ambulance / Emergency 108</span>
            </a>
          </div>
        </div>

        <div className="text-center pt-2 max-w-xl mx-auto w-full">
          <button
            onClick={() => setIsCrisisTriggered(false)}
            className="text-xs text-rose-200 underline font-bold"
          >
            {language === 'hi' ? 'चैट पर वापस जाएं' : 'Return to Chat'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              stopSpeaking();
              if (stopMicFnRef.current) stopMicFnRef.current();
              onClose();
            }}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <Heart className="w-5 h-5 fill-white" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {language === 'hi' ? 'मन की बात' : language === 'kn' ? 'ಮನದ ಮಾತು' : 'Man Ki Baat'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                AI Companion
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'गोपनीय व सुरक्षित साथी • 24/7 उपलब्ध' : '100% Private, caring & supportive listener'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Calming Breath Exercise Trigger */}
          <button
            onClick={() => setActiveBreathing(!activeBreathing)}
            className={`p-2 rounded-2xl border text-xs font-bold flex items-center gap-1 transition ${
              activeBreathing
                ? 'bg-teal-600 text-white border-teal-500'
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100'
            }`}
            title="Calming Breathing Tool"
          >
            <Wind className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'hi' ? 'शांति सांस' : 'Breathing'}</span>
          </button>

          {/* Tele-MANAS Helpline Button */}
          <a
            href="tel:14416"
            className="p-2 sm:px-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1 text-xs font-bold"
            title="Free Helpline 14416"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">14416</span>
          </a>
        </div>
      </div>

      {/* Interactive Calming Breathing Banner (if activated) */}
      {activeBreathing && (
        <div className="max-w-2xl mx-auto w-full bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white rounded-3xl p-4 shadow-xl border border-teal-500/40 mb-2 shrink-0 flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full border-4 border-white/60 flex items-center justify-center transition-all duration-1000 ${
                breathingPhase === 'inhale'
                  ? 'scale-125 bg-teal-400/40'
                  : breathingPhase === 'hold'
                  ? 'scale-110 bg-amber-400/40'
                  : 'scale-90 bg-teal-600/40'
              }`}
            >
              <Wind className="w-6 h-6 text-white animate-spin" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-200 block">
                {language === 'hi' ? '4-4-4 शांत श्वास तकनीक' : '4-4-4 Calming Breath Pacer'}
              </span>
              <span className="text-base sm:text-lg font-black capitalize">
                {breathingPhase === 'inhale'
                  ? language === 'hi' ? 'धीरे से सांस अंदर लें... (4s)' : 'Breathe In Slowly... (4s)'
                  : breathingPhase === 'hold'
                  ? language === 'hi' ? 'सांस रोकें... शांत रहें (4s)' : 'Hold Gently... Feel Still (4s)'
                  : language === 'hi' ? 'मुंह से सांस बाहर छोड़ें... (4s)' : 'Breathe Out Gently... (4s)'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveBreathing(false)}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Chat Message Stream */}
      <div className="max-w-2xl mx-auto w-full flex-1 bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-md overflow-y-auto space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-3.5 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-xs font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[10px] font-black opacity-75 flex items-center gap-1">
                  {msg.sender === 'ai' ? <Bot className="w-3.5 h-3.5 text-teal-600" /> : <User className="w-3.5 h-3.5" />}
                  {msg.sender === 'ai' ? 'Dr SAIhib Companion' : 'You'}
                </span>

                {msg.sender === 'ai' && (
                  <button
                    onClick={() => handleSpeakBotMessage(msg.id, msg.text)}
                    className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300"
                    title="Listen to message"
                  >
                    {isBotSpeaking === msg.id ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                    )}
                  </button>
                )}
              </div>

              <p className="whitespace-pre-line">{msg.text}</p>
              <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{msg.time}</span>
            </div>

            {/* Quick Reply Chips below AI messages */}
            {msg.sender === 'ai' && msg.quickReplies && msg.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                {msg.quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickReplyClick(qr)}
                    className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-[11px] font-bold shadow-2xs active:scale-95 transition"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isAiTyping && (
          <div className="flex items-center gap-2.5 text-xs text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/50 p-3 rounded-2xl w-fit border border-teal-200 dark:border-teal-800 animate-pulse">
            <Bot className="w-4 h-4 text-teal-600 animate-spin" />
            <span className="font-semibold">{typingStatusText || 'Companion is replying...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Voice Microphone and Send */}
      <div className="max-w-2xl mx-auto w-full pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg"
        >
          {/* Voice Microphone Input Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition active:scale-95 shrink-0 ${
              isListeningMic
                ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-600'
            }`}
            title="Speak using microphone"
          >
            {isListeningMic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-teal-600" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListeningMic
                ? language === 'hi' ? 'बोलिए, मैं सुन रहा हूं...' : 'Listening... speak now...'
                : language === 'hi' ? 'दिल की बात लिखें या बोलें...' : 'Type or speak your thoughts...'
            }
            className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition shrink-0 ${
              inputText.trim()
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
