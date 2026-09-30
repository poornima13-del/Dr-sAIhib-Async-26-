import React from 'react';
import { CheckRecord, Language, AshaContact } from '../types';
import { translations } from '../data/translations';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintSlipProps {
  language: Language;
  record: CheckRecord;
  ashaContact: AshaContact | null;
  onClose: () => void;
}

export const PrintSlip: React.FC<PrintSlipProps> = ({
  language,
  record,
  ashaContact,
  onClose
}) => {
  const t = translations[language] || translations.en;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-6 overflow-y-auto">
      {/* Top action bar (hidden on print) */}
      <div className="print:hidden w-full max-w-2xl bg-white dark:bg-slate-800 p-3 rounded-2xl mb-4 flex items-center justify-between shadow-md">
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>
        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
          Print Preview (A4 Sheet)
        </span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-black shadow-md hover:bg-teal-700"
        >
          <Printer className="w-4 h-4" />
          <span>{t.printAdviceBtn}</span>
        </button>
      </div>

      {/* The Printable A4 Sheet */}
      <div className="w-full max-w-2xl bg-white text-black p-6 sm:p-8 rounded-2xl shadow-2xl print:shadow-none print:m-0 print:p-0 print:w-full border border-slate-300 print:border-none font-sans text-xs">
        {/* Header */}
        <div className="border-b-2 border-black pb-3 mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1">
              <span>Dr s</span>
              <span className="px-1.5 py-0.5 bg-teal-600 text-white font-black text-xs rounded">AI</span>
              <span>hib</span>
              <span className="text-sm font-normal ml-2">| {t.printSlipTitle}</span>
            </h1>
            <p className="text-[10px] text-gray-700">{t.tagline} — Rural Sovereign Offline Health Guidance</p>
          </div>
          <div className="text-right text-[10px]">
            {record.patientCode && (
              <p className="font-mono font-black text-xs text-teal-800">ID: {record.patientCode}</p>
            )}
            <p className="font-bold">{new Date(record.date).toLocaleDateString()}</p>
            <p>{new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Patient Details Table */}
        <div className="bg-gray-100 p-2.5 rounded border border-gray-300 mb-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
          <div>
            <span className="text-gray-600 block text-[9px] uppercase">Patient ID</span>
            <span className="font-mono font-black text-teal-900">{record.patientCode || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px] uppercase">{t.nameLabel}</span>
            <span className="font-bold">{record.patientName || 'Anonymous Patient'}</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px] uppercase">{t.ageLabel} / {t.genderLabel}</span>
            <span className="font-bold">{record.age} Yrs / {record.gender.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px] uppercase">Urgency</span>
            <span className="font-black uppercase">{record.resultSeverity}</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px] uppercase">Cancer Screening</span>
            <span className="font-bold">{record.cancerWarningLevel.toUpperCase()}</span>
          </div>
        </div>

        {/* Symptoms & Attached Photos */}
        <div className="mb-3">
          <h2 className="font-bold text-[11px] uppercase border-b border-gray-300 pb-0.5 mb-1.5">
            {t.printSymptoms}
          </h2>
          <p className="mb-2">
            {record.selectedSymptoms.join(', ') || 'General evaluation'}
          </p>

          {record.photos && record.photos.length > 0 && (
            <div className="flex gap-2 items-center mb-2">
              <span className="text-[10px] font-bold text-gray-600">Attached Photos:</span>
              <div className="flex gap-2">
                {record.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt="Wound"
                    className="w-12 h-12 rounded object-cover border border-gray-400 print:grayscale"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Potential Conditions & Guidance */}
        <div className="mb-3">
          <h2 className="font-bold text-[11px] uppercase border-b border-gray-300 pb-0.5 mb-1.5">
            {t.whatItCouldBe} & Care Plan
          </h2>
          {record.matchedConditions.slice(0, 2).map((mc, idx) => (
            <div key={idx} className="mb-2">
              <p className="font-bold text-[11px]">
                {idx + 1}. {mc.condition.name[language] || mc.condition.name.en} ({mc.confidence.toUpperCase()})
              </p>
              <ul className="list-disc list-inside ml-2 text-[10px] space-y-0.5 mt-0.5">
                {mc.condition.whatToDo[language].slice(0, 3).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* OTC Medicine Suggestions */}
        {record.matchedConditions.length > 0 && (
          <div className="mb-3">
            <h2 className="font-bold text-[11px] uppercase border-b border-gray-300 pb-0.5 mb-1">
              {t.otcMedicines}
            </h2>
            <ul className="list-disc list-inside text-[10px] ml-2">
              {record.matchedConditions[0].condition.medicines[language].map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="border border-black p-2 rounded mb-3 bg-gray-50 flex items-center justify-between text-[10px]">
          <div>
            <p className="font-bold">National Emergency Ambulance: 108 | Health Helpline: 104</p>
            <p>Village ASHA: {ashaContact?.ashaName || 'ASHA Didi'} (Phone: {ashaContact?.ashaPhone || '9876543210'})</p>
          </div>
          <div className="text-right font-bold text-[11px]">
            {ashaContact?.village || 'Gram Panchayat'}
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="border-t border-gray-300 pt-2 text-[9px] text-gray-600 text-center leading-normal">
          {t.printDisclaimer}
        </div>
      </div>
    </div>
  );
};
