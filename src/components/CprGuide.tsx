import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { speakText, stopSpeaking } from '../utils/voice';
import { ArrowLeft, Volume2, VolumeX, Play, Pause, ChevronLeft, ChevronRight, HeartPulse, PhoneCall, Sparkles } from 'lucide-react';

interface CprGuideProps {
  language: Language;
  onClose: () => void;
}

export const CprGuide: React.FC<CprGuideProps> = ({ language, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const steps = [
    {
      step: 1,
      title: {
        en: '1. CHECK RESPONSE (TAP & SHOUT)',
        hi: '1. होश जांचें (कंधे हिलाएं और पुकारें)',
        kn: '1. ಪ್ರಜ್ಞೆ ಪರೀಕ್ಷಿಸಿ (ತಟ್ಟಿ ಮತ್ತು ಕೂಗಿ)'
      },
      text: {
        en: 'Kneel beside the person. Tap both shoulders firmly and shout loudly: "Are you okay?" Look at their chest to see if they are breathing normally.',
        hi: 'मरीज के पास घुटने टेकें। दोनों हाथों से दोनों कंधे जोर से थपथपाएं और पुकारें: "क्या आप ठीक हैं?" देखें कि क्या छाती सामान्य रूप से सांस ले रही है।',
        kn: 'ವ್ಯಕ್ತಿಯ ಪಕ್ಕದಲ್ಲಿ ಮಂಡಿಯೂರಿ. ಎರಡೂ ಕೈಗಳಿಂದ ಭुಜಗಳನ್ನು ಗಟ್ಟಿಯಾಗಿ ತಟ್ಟಿ ಜೋರಾಗಿ ಕೇಳಿ: "ನೀವು ಆರಾಮವಾಗಿದ್ದೀರಾ?" ಎದೆಯ ಉಸಿರಾಟ ಗಮನಿಸಿ.'
      },
      badge: 'TAP BOTH SHOULDERS',
      renderSvg: () => (
        <svg viewBox="0 0 360 210" className="w-full h-52 select-none drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`
              @keyframes tapShoulderAnim {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(4px); }
              }
              @keyframes vibrationRing {
                0% { r: 5px; opacity: 1; stroke-width: 2.5px; }
                100% { r: 24px; opacity: 0; stroke-width: 0.5px; }
              }
              @keyframes speechPop {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.04); }
              }
              .anim-tap { animation: tapShoulderAnim 0.7s infinite ease-in-out; }
              .anim-ring1 { animation: vibrationRing 1.2s infinite ease-out; }
              .anim-ring2 { animation: vibrationRing 1.2s infinite 0.6s ease-out; }
              .anim-bubble { animation: speechPop 2s infinite ease-in-out; transform-origin: 210px 45px; }
            `}</style>
            <linearGradient id="skinRescuer1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#FDBA74" />
            </linearGradient>
            <linearGradient id="skinVictim1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FECDD3" />
              <stop offset="100%" stopColor="#FDA4AF" />
            </linearGradient>
            <linearGradient id="rescuerPolo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="victimMat" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>

          {/* Firm Ground Mat */}
          <rect x="10" y="172" width="340" height="24" rx="4" fill="url(#victimMat)" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="20" y1="184" x2="340" y2="184" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="6 4" />

          {/* HUMAN VICTIM (Lying on back, unresponsive) */}
          <g id="victim">
            {/* Trousers & Shoes */}
            <path d="M 180 160 L 290 162 L 290 176 L 180 176 Z" fill="#1E293B" />
            <path d="M 290 162 L 306 158 L 310 176 L 290 176 Z" fill="#020617" /> {/* Shoes */}

            {/* Torso & Green Shirt with Collar */}
            <rect x="88" y="150" width="96" height="28" rx="7" fill="#059669" stroke="#064E3B" strokeWidth="1.5" />
            <path d="M 88 158 L 100 164 L 88 170" stroke="#D1FAE5" strokeWidth="2" fill="none" />

            {/* Victim Arm by side */}
            <path d="M 102 170 L 165 170" stroke="url(#skinVictim1)" strokeWidth="8" strokeLinecap="round" />

            {/* Head & Neck */}
            <path d="M 80 164 L 88 164" stroke="url(#skinVictim1)" strokeWidth="10" strokeLinecap="round" />
            <ellipse cx="66" cy="162" rx="17" ry="15" fill="url(#skinVictim1)" stroke="#BE123C" strokeWidth="1.5" />
            {/* Dark Hair */}
            <path d="M 50 160 C 50 146, 72 144, 82 152 C 80 156, 76 162, 70 162 Z" fill="#0F172A" />
            {/* Closed eye */}
            <path d="M 62 163 L 68 163" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
            {/* Relaxed mouth */}
            <path d="M 64 170 L 70 170" stroke="#9F1239" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* HUMAN RESCUER KNEELING BESIDE VICTIM (ANIMATED TAPPING) */}
          <g id="rescuer">
            {/* Knees and Legs */}
            <path d="M 140 180 C 122 180, 115 158, 130 140 L 158 140" fill="none" stroke="#1E3A8A" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="118" cy="176" rx="10" ry="7" fill="#020617" />

            {/* Torso leaning attentively forward */}
            <path d="M 152 140 L 140 92" stroke="url(#rescuerPolo)" strokeWidth="24" strokeLinecap="round" />

            {/* Head and Profile Face */}
            <line x1="138" y1="88" x2="132" y2="76" stroke="url(#skinRescuer1)" strokeWidth="10" strokeLinecap="round" />
            <ellipse cx="130" cy="64" rx="17" ry="19" fill="url(#skinRescuer1)" stroke="#B45309" strokeWidth="1.5" />
            {/* Hair */}
            <path d="M 118 60 C 118 42, 142 42, 148 56 C 144 52, 134 50, 126 54 Z" fill="#451A03" />
            {/* Eye looking down */}
            <circle cx="125" cy="62" r="2.2" fill="#78350F" />
            {/* Nose & Open Mouth shouting */}
            <path d="M 116 63 L 112 67 L 117 69" stroke="#B45309" strokeWidth="1.8" fill="none" />
            <ellipse cx="116" cy="74" rx="4" ry="5.5" fill="#78350F" />

            {/* ANIMATED ARMS & HANDS FIRMLY TAPPING VICTIM'S SHOULDERS */}
            <g className="anim-tap">
              {/* Rescuer Left Arm reaching far shoulder */}
              <path d="M 136 94 L 98 125 L 78 150" fill="none" stroke="url(#skinRescuer1)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="78" cy="150" rx="8" ry="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />

              {/* Rescuer Right Arm reaching near shoulder */}
              <path d="M 142 96 L 116 128 L 102 152" fill="none" stroke="url(#skinRescuer1)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="102" cy="152" rx="8" ry="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
            </g>
          </g>

          {/* VIBRATION SHOCKWAVE RINGS ON SHOULDERS */}
          <circle cx="78" cy="150" r="14" stroke="#EF4444" fill="none" className="anim-ring1" />
          <circle cx="102" cy="152" r="14" stroke="#EF4444" fill="none" className="anim-ring2" />

          {/* ANIMATED SPEECH CALLOUT */}
          <g className="anim-bubble" transform="translate(155, 30)">
            <path d="M 0 0 L 160 0 C 168 0, 172 4, 172 12 L 172 44 C 172 52, 168 56, 160 56 L 24 56 L 6 68 L 14 56 L 0 56 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
            <text x="86" y="24" textAnchor="middle" fill="#DC2626" fontSize="13.5" fontWeight="950">"ARE YOU OK?!"</text>
            <text x="86" y="42" textAnchor="middle" fill="#047857" fontSize="10.5" fontWeight="bold">Tap both shoulders firmly</text>
          </g>
        </svg>
      )
    },
    {
      step: 2,
      title: {
        en: '2. CALL FOR HELP / DIAL 108',
        hi: '2. मदद मांगें / तुरंत 108 डायल करें',
        kn: '2. ಸಹಾಯಕ್ಕೆ ಕರೆಯಿರಿ / 108 ಡಯಲ್ ಮಾಡಿ'
      },
      text: {
        en: 'Shout to anyone nearby: "Help! Call 108 ambulance now!" Dial 108 on your phone, put on SPEAKER so your hands remain completely free.',
        hi: 'आसपास किसी को भी पुकारें: "मदद करो! 108 पर एम्बुलेंस बुलाओ!" फोन पर 108 डायल करें और स्पीकर ऑन रखें ताकि दोनों हाथ खाली रहें।',
        kn: 'ಜನರನ್ನು ಕೂಗಿ ಕರೆಯಿರಿ: "ಸಹಾಯ ಮಾಡಿ! ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ!" ಫೋನ್ ಸ್ಪೀಕರ್‌ನಲ್ಲಿಟ್ಟು 108 ಗೆ ಕರೆ ಮಾಡಿ.'
      },
      badge: 'DIAL 108 & SPEAKER ON',
      renderSvg: () => (
        <svg viewBox="0 0 360 210" className="w-full h-52 select-none drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`
              @keyframes waveRescuerHand {
                0%, 100% { transform: rotate(-10deg); }
                50% { transform: rotate(15deg); }
              }
              @keyframes soundPulse {
                0% { opacity: 0; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.1); }
                100% { opacity: 0; transform: scale(1.4); }
              }
              @keyframes ambulanceFlash {
                0%, 100% { fill: #EF4444; }
                50% { fill: #0284C7; }
              }
              .anim-wave { animation: waveRescuerHand 0.8s infinite ease-in-out; transform-origin: 105px 75px; }
              .anim-sound { animation: soundPulse 1.2s infinite ease-out; }
              .anim-siren { animation: ambulanceFlash 0.5s infinite steps(1); }
            `}</style>
          </defs>

          {/* Ground */}
          <line x1="15" y1="185" x2="345" y2="185" stroke="#CBD5E1" strokeWidth="3" />

          {/* Victim resting safely */}
          <rect x="20" y="170" width="80" height="15" rx="4" fill="#94A3B8" />
          <circle cx="16" cy="174" r="11" fill="#FDA4AF" />

          {/* HUMAN RESCUER KNEELING UPRIGHT */}
          <g transform="translate(40, 0)">
            {/* Kneeling Legs */}
            <path d="M 85 185 C 72 185, 68 165, 78 142 L 98 142" fill="none" stroke="#1E3A8A" strokeWidth="16" strokeLinecap="round" />
            <ellipse cx="66" cy="180" rx="9" ry="6" fill="#020617" />

            {/* Torso straight upright */}
            <path d="M 90 142 L 90 82" stroke="#0284C7" strokeWidth="24" strokeLinecap="round" />

            {/* Head Shouting for help */}
            <circle cx="90" cy="54" r="18" fill="#FED7AA" stroke="#B45309" strokeWidth="1.5" />
            <path d="M 76 50 C 76 34, 102 34, 106 48 C 102 44, 90 42, 84 46 Z" fill="#451A03" />
            <ellipse cx="98" cy="60" rx="5" ry="7" fill="#78350F" />
            <circle cx="94" cy="52" r="2" fill="#78350F" />

            {/* ANIMATED WAVING HAND TO ATTRACT BYSTANDERS */}
            <g className="anim-wave">
              <path d="M 80 84 L 54 62 L 44 34" fill="none" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <g transform="translate(40, 24)">
                <ellipse cx="6" cy="10" rx="8" ry="10" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
                <line x1="2" y1="2" x2="3" y2="7" stroke="#B45309" strokeWidth="1.5" />
                <line x1="6" y1="1" x2="6" y2="6" stroke="#B45309" strokeWidth="1.5" />
                <line x1="10" y1="2" x2="9" y2="7" stroke="#B45309" strokeWidth="1.5" />
              </g>
            </g>

            {/* Left Arm holding modern smartphone on speaker */}
            <path d="M 102 86 L 132 80 L 146 80" fill="none" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <g transform="translate(146, 52)">
              <rect x="0" y="0" width="36" height="56" rx="7" fill="#020617" stroke="#38BDF8" strokeWidth="2.5" />
              <rect x="4" y="6" width="28" height="40" rx="4" fill="#FFFFFF" />
              <text x="18" y="28" textAnchor="middle" fill="#DC2626" fontSize="15" fontWeight="950">108</text>
              <text x="18" y="40" textAnchor="middle" fill="#0284C7" fontSize="8" fontWeight="bold">SPEAKER</text>

              {/* Pulsing sound waves */}
              <g className="anim-sound">
                <path d="M 42 16 C 50 24, 50 38, 42 46" stroke="#38BDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M 48 10 C 60 20, 60 48, 48 58" stroke="#0284C7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* 108 AMBULANCE VEHICLE WITH FLASHING SIREN */}
          <g transform="translate(230, 105)">
            <rect x="0" y="16" width="86" height="42" rx="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <path d="M 64 16 L 86 16 L 98 34 L 98 58 L 86 58 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <rect x="68" y="22" width="24" height="15" rx="2" fill="#38BDF8" />
            {/* Red Cross */}
            <rect x="28" y="26" width="22" height="7" fill="#DC2626" />
            <rect x="35.5" y="18.5" width="7" height="22" fill="#DC2626" />
            <text x="39" y="52" textAnchor="middle" fill="#DC2626" fontSize="11" fontWeight="950">108</text>
            {/* Wheels */}
            <circle cx="24" cy="58" r="9" fill="#0F172A" />
            <circle cx="82" cy="58" r="9" fill="#0F172A" />
            {/* Animated Flashing Emergency Siren */}
            <polygon points="40,8 46,16 34,16" className="anim-siren" />
          </g>
        </svg>
      )
    },
    {
      step: 3,
      title: {
        en: '3. HAND POSITION ON CENTER OF CHEST',
        hi: '3. हाथों की सही स्थिति (छाती के केंद्र में)',
        kn: '3. ಎದೆಯ ಮಧ್ಯಭಾಗದಲ್ಲಿ ಕೈಗಳನ್ನು ಇಡುವುದು'
      },
      text: {
        en: 'Place heel of your dominant hand on the center of the breastbone (lower half of sternum, between nipples). Interlock fingers of your other hand on top. Keep fingers OFF the ribs!',
        hi: 'अपनी हथेली का निचला हिस्सा मरीज की छाती के ठीक बीच (स्तनों के बीच की हड्डी पर) रखें। दूसरे हाथ की उंगलियां ऊपर फंसा लें। उंगलियों को छाती से ऊपर उठा कर रखें।',
        kn: 'ನಿಮ್ಮ ಹಸ್ತದ ಹಿಮ್ಮಡಿಯನ್ನು ಎದೆಯ ಮಧ್ಯದ ಮೂಳೆಯ ಮೇಲೆ ಇಡಿ. ಇನ್ನೊಂದು ಕೈ ಬೆರಳುಗಳನ್ನು ಮೇಲಿಂದ ಸಿಕ್ಕಿಸಿ. ಬೆರಳುಗಳು ಪಕ್ಕೆಲುಬುಗಳನ್ನು ಮುಟ್ಟದಂತೆ ಮೇಲಕ್ಕೆತ್ತಿ.'
      },
      badge: 'LOWER HALF OF STERNUM',
      renderSvg: () => (
        <svg viewBox="0 0 360 210" className="w-full h-52 select-none drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`
              @keyframes targetPulse {
                0% { r: 18px; stroke-width: 4px; opacity: 1; }
                50% { r: 32px; stroke-width: 2px; opacity: 0.6; }
                100% { r: 18px; stroke-width: 4px; opacity: 1; }
              }
              .anim-target { animation: targetPulse 1.4s infinite ease-in-out; }
            `}</style>
          </defs>

          {/* Anatomical Human Chest */}
          <path
            d="M 60 50 C 105 16, 255 16, 300 50 C 325 85, 325 155, 300 188 C 255 200, 105 200, 60 188 C 35 155, 35 85, 60 50 Z"
            fill="#F8FAFC"
            stroke="#94A3B8"
            strokeWidth="3"
          />

          {/* Clavicles (Collarbones) */}
          <path d="M 110 48 C 145 60, 165 60, 180 68 C 195 60, 215 60, 250 48" stroke="#94A3B8" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Rib Contours */}
          <path d="M 130 92 C 150 100, 165 102, 180 104 C 195 102, 210 100, 230 92" stroke="#CBD5E1" strokeWidth="2" fill="none" />
          <path d="M 125 124 C 145 134, 165 136, 180 138 C 195 136, 215 134, 235 124" stroke="#CBD5E1" strokeWidth="2" fill="none" />

          {/* Sternum (Breastbone) */}
          <rect x="170" y="68" width="20" height="96" rx="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />

          {/* Nipple Landmark Reference Line */}
          <circle cx="105" cy="118" r="4.5" fill="#94A3B8" />
          <circle cx="255" cy="118" r="4.5" fill="#94A3B8" />
          <line x1="105" y1="118" x2="255" y2="118" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* ANIMATED CPR TARGET CROSSHAIR */}
          <circle cx="180" cy="132" r="26" stroke="#DC2626" strokeWidth="3.5" fill="#FEE2E2" className="anim-target" />
          <circle cx="180" cy="132" r="8" fill="#DC2626" />

          {/* REALISTIC INTERLOCKED HUMAN HANDS */}
          <g transform="translate(148, 96)">
            {/* Heel of lower hand seated directly on target */}
            <ellipse cx="32" cy="36" rx="21" ry="15" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <path d="M 44 26 C 58 14, 72 18, 76 30 L 52 44" fill="#FBBF24" stroke="#B45309" strokeWidth="1.8" />

            {/* Upper hand interlocked on top */}
            <ellipse cx="30" cy="28" rx="23" ry="17" fill="#FBBF24" stroke="#92400E" strokeWidth="2" />
            {/* Interlaced knuckles */}
            <circle cx="20" cy="16" r="5" fill="#F59E0B" stroke="#92400E" strokeWidth="1.2" />
            <circle cx="28" cy="14" r="5" fill="#F59E0B" stroke="#92400E" strokeWidth="1.2" />
            <circle cx="36" cy="14" r="5" fill="#F59E0B" stroke="#92400E" strokeWidth="1.2" />
            <circle cx="44" cy="16" r="5" fill="#F59E0B" stroke="#92400E" strokeWidth="1.2" />

            {/* Straight vertical wrists extending up */}
            <rect x="20" y="38" width="22" height="34" rx="4" fill="#FED7AA" stroke="#92400E" strokeWidth="2" />
          </g>

          <rect x="95" y="178" width="170" height="22" rx="11" fill="#020617" />
          <text x="180" y="193" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="900" letterSpacing="0.5">
            HEEL OF HAND ON STERNUM
          </text>
        </svg>
      )
    },
    {
      step: 4,
      title: {
        en: '4. PUSH HARD & FAST (100–120 BPM)',
        hi: '4. तेज और गहरा दबाएं (1 मिनट में 100-120 बार)',
        kn: '4. ವೇಗವಾಗಿ ಮತ್ತು ಬಲವಾಗಿ ಒತ್ತಿ (ನಿಮಿಷಕ್ಕೆ 100-120)'
      },
      text: {
        en: 'Lock elbows straight! Keep shoulders directly over your hands. Use upper-body weight to push down 5 cm (2 inches). Match the beating rhythm and allow full recoil!',
        hi: 'कोहनियां बिल्कुल सीधी (लॉक) रखें! कंधे सीधे हाथों के ऊपर। शरीर के वजन से छाती को 5 सेमी (2 इंच) नीचे दबाएं। लय के साथ दबाएं और छाती को पूरा ऊपर आने दें।',
        kn: 'ಮೊಣಕೈಗಳನ್ನು ನೇರವಾಗಿ ಮಡಚದೆ ಇಡಿ! ಹೆಗಲುಗಳನ್ನು ಕೈಗಳ ಮೇಲೆ ನೇರವಾಗಿರಿಸಿ. ದೇಹದ ತೂಕದಿಂದ 5 ಸೆಂ.ಮೀ (2 ಇಂಚು) ಆಳಕ್ಕೆ ಒತ್ತಿ.'
      },
      badge: 'LOCKED ELBOWS • 5 CM DEPTH',
      renderSvg: () => (
        <svg viewBox="0 0 360 210" className="w-full h-52 select-none drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`
              @keyframes cprCompressAnim {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(7px); }
              }
              @keyframes chestRecoilAnim {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.82); }
              }
              @keyframes metronomePulse {
                0%, 100% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.15); opacity: 1; }
              }
              .anim-compress { animation: cprCompressAnim 0.54s infinite ease-in-out; }
              .anim-chest { animation: chestRecoilAnim 0.54s infinite ease-in-out; transform-origin: 155px 170px; }
              .anim-metro { animation: metronomePulse 0.54s infinite ease-in-out; transform-origin: 290px 140px; }
            `}</style>
          </defs>

          {/* Firm Floor */}
          <line x1="15" y1="185" x2="345" y2="185" stroke="#CBD5E1" strokeWidth="3" />

          {/* VICTIM CHEST WITH ANIMATED RECOIL */}
          <g className="anim-chest">
            <rect x="60" y="160" width="190" height="20" rx="5" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
            <circle cx="50" cy="160" r="14" fill="#FDA4AF" />
          </g>

          {/* ANIMATED FULL-BODY RESCUER IN LOCKED-ELBOW CPR POSTURE */}
          <g className="anim-compress">
            {/* Knees on ground */}
            <path d="M 230 185 C 218 185, 212 165, 222 144 L 242 144" fill="none" stroke="#1E3A8A" strokeWidth="18" strokeLinecap="round" />
            <ellipse cx="206" cy="180" rx="9" ry="6" fill="#020617" />

            {/* Thighs upright at 90 degrees */}
            <path d="M 230 144 L 206 90" stroke="#1D4ED8" strokeWidth="22" strokeLinecap="round" />

            {/* Torso leaning directly over victim's chest */}
            <path d="M 206 90 L 155 62" stroke="#0284C7" strokeWidth="24" strokeLinecap="round" />

            {/* Head Looking Down */}
            <circle cx="150" cy="40" r="17" fill="#FED7AA" stroke="#B45309" strokeWidth="1.5" />
            <path d="M 138 36 C 142 22, 160 22, 164 34" fill="#451A03" />
            <circle cx="146" cy="42" r="2.2" fill="#78350F" />

            {/* RIGID VERTICAL LOCKED-ELBOW ARMS (Pistons transferring body mass) */}
            <line x1="155" y1="68" x2="155" y2="154" stroke="#FED7AA" strokeWidth="13" strokeLinecap="round" />
            <line x1="155" y1="68" x2="155" y2="154" stroke="#1E3A8A" strokeWidth="2" strokeDasharray="3 3" />

            {/* Hands on Sternum */}
            <ellipse cx="155" cy="156" rx="15" ry="10" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />

            {/* Downward Compression 5 cm Arrow */}
            <g transform="translate(155, 112)">
              <line x1="0" y1="-28" x2="0" y2="20" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
              <polygon points="-8,16 0,28 8,16" fill="#10B981" />
            </g>
          </g>

          {/* 5 CM DEPTH BADGE */}
          <g transform="translate(255, 50)">
            <rect x="0" y="0" width="90" height="48" rx="10" fill="#10B981" />
            <text x="45" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">DEPTH</text>
            <text x="45" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="950">5 cm (2")</text>
          </g>

          {/* ANIMATED METRONOME RHYTHM BADGE */}
          <g className="anim-metro" transform="translate(255, 112)">
            <rect x="0" y="0" width="90" height="48" rx="10" fill="#0284C7" />
            <text x="45" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="bold">RATE</text>
            <text x="45" y="37" textAnchor="middle" fill="#FFFFFF" fontSize="13.5" fontWeight="950">110 BPM</text>
          </g>
        </svg>
      )
    },
    {
      step: 5,
      title: {
        en: '5. HEAD-TILT CHIN-LIFT / OPEN AIRWAY',
        hi: '5. सिर पीछे झुकाएं / ठोड़ी ऊपर उठाएं',
        kn: '5. ತಲೆ ಹಿಂದಕ್ಕೆ ಬಾಗಿಸಿ / ಗಲ್ಲವನ್ನು ಎತ್ತಿ'
      },
      text: {
        en: 'Gently tilt forehead back with one hand. Lift chin with 2 fingers of your other hand to open airway. If trained, give 2 gentle breaths (30 pushes : 2 breaths). If NOT trained, continue hands-only compressions!',
        hi: 'एक हाथ से माथा पीछे की ओर दबाएं। दूसरे हाथ की दो उंगलियों से ठोड़ी ऊपर उठाएं ताकि सांस की नली खुल जाए। सीखा है तो 2 फूंक दें (30 बार दबाना : 2 फूंक)। नहीं सीखा, तो सिर्फ छाती दबाते रहें।',
        kn: 'ಒಂದು ಕೈಯಿಂದ ಹಣೆಯನ್ನು ಹಿಂದಕ್ಕೆ ತಳ್ಳಿ. ಇನ್ನೊಂದು ಕೈಯ 2 ಬೆರಳುಗಳಿಂದ ಗಲ್ಲವನ್ನು ಮೇಲಕ್ಕೆತ್ತಿ ಶ್ವಾಸನಾಳವನ್ನು ತೆರೆಯಿರಿ. ತರಬೇತಿ ಇದ್ದರೆ 2 ಉಸಿರು ನೀಡಿ, ಇಲ್ಲದಿದ್ದರೆ ನಿರಂತರವಾಗಿ ಎದೆಯನ್ನೇ ಒತ್ತಿರಿ.'
      },
      badge: 'TILT HEAD • LIFT CHIN',
      renderSvg: () => (
        <svg viewBox="0 0 360 210" className="w-full h-52 select-none drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`
              @keyframes oxygenFlow {
                0% { stroke-dashoffset: 40; }
                100% { stroke-dashoffset: 0; }
              }
              .anim-airway {
                stroke-dasharray: 6 4;
                animation: oxygenFlow 1.2s linear infinite;
              }
            `}</style>
          </defs>

          <line x1="15" y1="185" x2="345" y2="185" stroke="#CBD5E1" strokeWidth="3" />

          {/* Victim Profile with Head Tilted Back */}
          <g transform="translate(45, 20)">
            {/* Shoulders */}
            <path d="M 60 155 C 80 145, 140 145, 190 155" stroke="#475569" strokeWidth="22" strokeLinecap="round" />
            <path d="M 75 145 L 85 105" stroke="#FDA4AF" strokeWidth="18" strokeLinecap="round" />

            {/* Head tilted backwards */}
            <g transform="translate(85, 100) rotate(26)">
              <ellipse cx="0" cy="0" rx="26" ry="32" fill="#FDA4AF" stroke="#BE123C" strokeWidth="2" />
              <path d="M -18 -26 C -5 -38, 25 -32, 30 -14" fill="#1E293B" />
              <path d="M 24 -4 L 32 0 L 25 6" stroke="#BE123C" strokeWidth="1.8" fill="none" />
              <ellipse cx="24" cy="16" rx="5" ry="7" fill="#881337" />

              {/* ANIMATED FLOWING AIRWAY TUBE */}
              <path d="M 12 12 C 16 22, 20 32, 22 45" stroke="#38BDF8" strokeWidth="6" fill="none" strokeLinecap="round" className="anim-airway" />
            </g>

            {/* Rescuer Hand 1: Forehead tilt (pushing back) */}
            <path d="M 35 60 L 58 80 L 78 82" fill="none" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="78" cy="82" rx="9" ry="7" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />

            {/* Rescuer Hand 2: Two fingers under chin bone lifting up */}
            <path d="M 145 130 L 122 122 L 108 120" fill="none" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="108" cy="120" r="5.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          </g>

          {/* AIRWAY OPEN BADGE */}
          <g transform="translate(215, 45)">
            <rect x="0" y="0" width="130" height="64" rx="12" fill="#0284C7" />
            <text x="65" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="950">AIRWAY OPEN</text>
            <text x="65" y="42" textAnchor="middle" fill="#BAE6FD" fontSize="10.5" fontWeight="bold">Tongue lifted off throat</text>
            <text x="65" y="54" textAnchor="middle" fill="#E0F2FE" fontSize="9.5" fontWeight="medium">30 pushes : 2 breaths</text>
          </g>
        </svg>
      )
    },
    {
      step: 6,
      title: {
        en: '6. NEVER STOP UNTIL AMBULANCE ARRIVES',
        hi: '6. एम्बुलेंस आने तक रुकें नहीं (रिले टीम)',
        kn: '6. ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುವವರೆಗೂ ಮುಂದುವರಿಸಿ'
      },
      text: {
        en: 'Do not stop! If tired, switch with another helper every 2 minutes without interrupting chest compressions. Continue non-stop until the 108 ambulance medical team takes over.',
        hi: 'बिल्कुल न रुकें! यदि आप थक जाएं, तो बिना रुके हर 2 मिनट में दूसरे साथी को छाती दबाने दें। जब तक 108 की मेडिकल टीम न पहुंचे, इसे लगातार जारी रखें।',
        kn: 'ಖಂಡಿತ ನಿಲ್ಲಿಸಬೇಡಿ! ಸುಸ್ತಾದರೆ ಪ್ರತಿ 2 ನಿಮಿಷಕ್ಕೊಮ್ಮೆ ಇನ್ನೊಬ್ಬರೊಂದಿಗೆ ಬದಲಾಯಿಸಿಕೊಳ್ಳಿ. 108 ತಂಡ ಬರುವವರೆಗೆ ನಿರಂತರವಾಗಿ ಮಾಡಿ.'
      },
      badge: 'RELAY RESCUE • TEAMWORK',
      renderSvg: () => (
        <svg viewBox="0 0 360 210" className="w-full h-52 select-none drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`
              @keyframes paramedicArrive {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(-4px); }
              }
              .anim-paramedic { animation: paramedicArrive 1.4s infinite ease-in-out; }
            `}</style>
          </defs>

          <line x1="15" y1="185" x2="345" y2="185" stroke="#CBD5E1" strokeWidth="3" />

          {/* Active Rescuer pumping */}
          <g transform="translate(25, 0)">
            <path d="M 85 185 L 90 150 L 110 150" fill="none" stroke="#1E3A8A" strokeWidth="12" strokeLinecap="round" />
            <path d="M 105 150 L 92 105" stroke="#0284C7" strokeWidth="18" strokeLinecap="round" />
            <circle cx="88" cy="80" r="14" fill="#FED7AA" stroke="#B45309" strokeWidth="1.5" />
            <line x1="92" y1="105" x2="92" y2="160" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" />
          </g>

          {/* Second Helper ready on opposite side */}
          <g transform="translate(105, 0)">
            <path d="M 70 185 L 65 150 L 45 150" fill="none" stroke="#065F46" strokeWidth="12" strokeLinecap="round" />
            <path d="M 50 150 L 62 105" stroke="#059669" strokeWidth="18" strokeLinecap="round" />
            <circle cx="66" cy="80" r="14" fill="#FED7AA" stroke="#B45309" strokeWidth="1.5" />
            <path d="M 60 108 L 40 125 L 30 135" fill="none" stroke="#FED7AA" strokeWidth="7" strokeLinecap="round" />
          </g>

          {/* UNIFORMED 108 PARAMEDIC ARRIVING WITH EMERGENCY KIT */}
          <g className="anim-paramedic" transform="translate(245, 75)">
            <path d="M 35 110 L 35 48" stroke="#DC2626" strokeWidth="20" strokeLinecap="round" />
            <line x1="25" y1="74" x2="45" y2="74" stroke="#FDE047" strokeWidth="5" />
            <circle cx="35" cy="28" r="15" fill="#FED7AA" stroke="#B45309" strokeWidth="1.5" />
            {/* Paramedic Cap */}
            <path d="M 18 25 C 18 10, 52 10, 52 25 Z" fill="#020617" />
            {/* Stethoscope */}
            <path d="M 26 38 C 22 48, 48 48, 44 38" stroke="#020617" strokeWidth="3" fill="none" />
            {/* First Aid Kit */}
            <rect x="52" y="60" width="28" height="24" rx="5" fill="#DC2626" stroke="#020617" strokeWidth="1.5" />
            <rect x="61" y="56" width="10" height="5" fill="#020617" />
            <path d="M 60 72 L 72 72 M 66 66 L 66 78" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
          </g>

          {/* TOP INCOMING RELAY BADGE */}
          <g transform="translate(75, 16)">
            <rect x="0" y="0" width="210" height="36" rx="18" fill="#DC2626" />
            <text x="105" y="23" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="950">
              SWITCH EVERY 2 MIN • HELP IS HERE
            </text>
          </g>
        </svg>
      )
    }
  ];

  const current = steps[currentStep];

  // Metronome audio pulse (110 BPM)
  const playClick = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.08);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.08);
    } catch {
      // AudioContext unavailable
    }
  };

  const toggleMetronome = () => {
    if (isMetronomeActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsMetronomeActive(false);
    } else {
      setIsMetronomeActive(true);
      playClick();
      // 110 compressions per minute = ~545ms interval
      timerRef.current = window.setInterval(playClick, 545);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeaking();
    };
  }, []);

  const handleReadStep = () => {
    if (isReadingAloud) {
      stopSpeaking();
      setIsReadingAloud(false);
    } else {
      const titleText = current.title[language] || current.title.en;
      const bodyText = current.text[language] || current.text.en;
      setIsReadingAloud(true);
      speakText(`${titleText}. ${bodyText}`, language, () => {
        setIsReadingAloud(false);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between p-3 sm:p-4 text-slate-100 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-xl mx-auto w-full pt-1 pb-2">
        <button
          onClick={() => {
            stopSpeaking();
            if (timerRef.current) clearInterval(timerRef.current);
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Step Pill */}
          <span className="px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-200 font-black text-xs">
            Step {currentStep + 1} of 6
          </span>

          {/* Read Aloud Button */}
          <button
            onClick={handleReadStep}
            className={`p-2 rounded-full border transition active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
              isReadingAloud
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-800 border-slate-700 text-purple-300 hover:bg-slate-700'
            }`}
          >
            {isReadingAloud ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
            <span className="hidden sm:inline">{isReadingAloud ? 'Stop' : 'Read Aloud'}</span>
          </button>
        </div>
      </div>

      {/* Main Pictorial Card */}
      <div className="max-w-xl mx-auto w-full my-auto bg-slate-900 rounded-3xl p-4 sm:p-5 border-2 border-purple-500/40 shadow-2xl flex flex-col justify-between space-y-3">
        {/* Step Badge & Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
              {current.badge}
            </span>

            {/* Metronome Beat Button for Step 4 */}
            {currentStep === 3 && (
              <button
                onClick={toggleMetronome}
                className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 transition active:scale-95 ${
                  isMetronomeActive
                    ? 'bg-emerald-500 text-slate-950 animate-pulse'
                    : 'bg-slate-800 border border-emerald-500/50 text-emerald-400'
                }`}
              >
                {isMetronomeActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isMetronomeActive ? 'Rhythm Playing (110 BPM)' : 'Play Rhythm Beat'}</span>
              </button>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-black text-white leading-tight">
            {current.title[language] || current.title.en}
          </h2>
        </div>

        {/* Animated Human SVG Pictorial Area */}
        <div className="bg-slate-950 rounded-2xl p-2 border border-slate-800 flex items-center justify-center">
          {current.renderSvg()}
        </div>

        {/* Minimal High-Impact Text Instruction */}
        <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
          {current.text[language] || current.text.en}
        </p>

        {/* Step Navigation Dots & Arrows */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`p-2.5 rounded-2xl border flex items-center gap-1 font-bold text-xs transition ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  currentStep === idx ? 'w-6 bg-purple-500' : 'w-2 bg-slate-700'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
            className={`p-2.5 rounded-2xl border flex items-center gap-1 font-bold text-xs transition ${
              currentStep === steps.length - 1
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : 'bg-purple-600 border-purple-500 text-white hover:bg-purple-700 active:scale-95 shadow-md'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency Call 108 Footer Strip */}
      <div className="max-w-xl mx-auto w-full pt-2">
        <a
          href="tel:108"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-98 transition border border-rose-400/40"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>{language === 'hi' ? 'तुरंत 108 पर एम्बुलेंस बुलाएं (मुफ्त कॉल)' : 'Call 108 Ambulance Now (Toll Free)'}</span>
        </a>
      </div>
    </div>
  );
};
