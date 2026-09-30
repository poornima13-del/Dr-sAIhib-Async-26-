import React, { useState, useEffect } from 'react';
import { Language, AshaContact } from '../types';
import { translations } from '../data/translations';
import { PhoneCall, MapPin, X, AlertOctagon, HeartHandshake, ShieldAlert } from 'lucide-react';

interface SosModalProps {
  language: Language;
  ashaContact: AshaContact | null;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ language, ashaContact, onClose }) => {
  const t = translations[language] || translations.en;
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          });
        },
        (err) => {
          setGeoError(err.message);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-rose-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-8 h-8 text-rose-300 animate-bounce" />
          <div>
            <span className="text-xs uppercase font-black tracking-widest text-rose-200">
              EMERGENCY SOS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {language === 'hi' ? 'आपातकालीन सहायता' : language === 'kn' ? 'ತುರ್ತು ಸಹಾಯ' : 'Emergency Assistance'}
            </h1>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold transition"
          aria-label="Close SOS"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Body: Location info & Big Call 108 */}
      <div className="my-auto py-4 space-y-5 text-center max-w-md mx-auto w-full">
        {/* GPS Location Pill */}
        <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-xs flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4 text-rose-300 shrink-0" />
          {coords ? (
            <span className="font-mono text-rose-100">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} (±{coords.accuracy}m)
            </span>
          ) : (
            <span className="text-rose-200">
              {geoError ? 'Location offline (tell dispatcher village name)' : 'Detecting GPS location...'}
            </span>
          )}
        </div>

        {/* The Big Call 108 Button */}
        <a
          href="tel:108"
          className="w-full py-6 sm:py-8 rounded-3xl bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-2xl sm:text-3xl shadow-2xl flex flex-col items-center justify-center gap-2 ring-8 ring-rose-500/40 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <PhoneCall className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            <span>CALL 108 NOW</span>
          </div>
          <span className="text-xs font-semibold tracking-wider text-rose-100">
            {language === 'hi' ? 'मुफ्त सरकारी एम्बुलेंस (Toll Free)' : language === 'kn' ? 'ಉಚಿತ ಸರ್ಕಾರಿ ಆಂಬ್ಯುಲೆನ್ಸ್' : 'Free Government Ambulance'}
          </span>
        </a>

        {/* Secondary Call ASHA & 104 */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <a
            href={`tel:${ashaContact?.ashaPhone || '9876543210'}`}
            className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition"
          >
            <HeartHandshake className="w-5 h-5 text-teal-300" />
            <span>Call ASHA Didi</span>
            <span className="text-[10px] text-white/70">{ashaContact?.ashaName || 'Local Worker'}</span>
          </a>

          <a
            href="tel:104"
            className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition"
          >
            <ShieldAlert className="w-5 h-5 text-amber-300" />
            <span>Health Helpline 104</span>
            <span className="text-[10px] text-white/70">Medical Advice</span>
          </a>
        </div>
      </div>

      {/* Bottom Emergency Reassurance */}
      <div className="text-center pt-2">
        <p className="text-xs text-rose-200">
          {language === 'hi'
            ? 'घबराएं नहीं। फोन करते ही अपना गांव, मरीज की हालत और नजदीकी लैंडमार्क बताएं।'
            : language === 'kn'
            ? 'ಗಾಬರಿಯಾಗಬೇಡಿ. ಕರೆ ಮಾಡಿದ ತಕ್ಷಣ ನಿಮ್ಮ ಊರು, ರೋಗಿಯ ಸ್ಥಿತಿಯನ್ನು ತಿಳಿಸಿ.'
            : 'Stay calm. When connected, state your village name, landmark, and patient condition clearly.'}
        </p>
      </div>
    </div>
  );
};
