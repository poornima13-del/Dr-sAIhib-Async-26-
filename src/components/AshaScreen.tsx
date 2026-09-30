import React, { useState, useEffect } from 'react';
import { AshaContact, CheckRecord, Language, AppSettings } from '../types';
import { translations } from '../data/translations';
import { getAllChecks, getAshaContact, saveAshaContact, getSettings, saveSettings } from '../utils/db';
import {
  Lock,
  Unlock,
  Users,
  AlertTriangle,
  Clock,
  Download,
  Settings,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  Save
} from 'lucide-react';

interface AshaScreenProps {
  language: Language;
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const AshaScreen: React.FC<AshaScreenProps> = ({
  language,
  onBack,
  settings,
  onUpdateSettings
}) => {
  const t = translations[language] || translations.en;
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [checks, setChecks] = useState<CheckRecord[]>([]);
  const [contact, setContact] = useState<AshaContact>({
    ashaName: '',
    ashaPhone: '',
    village: '',
    doctorName: '',
    doctorPhone: '',
    phcName: '',
    phcPhone: '',
    familyPhone: ''
  });
  const [activeTab, setActiveTab] = useState<'due' | 'all' | 'contacts'>('due');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allChecks = await getAllChecks();
    setChecks(allChecks);
    const savedContact = await getAshaContact();
    if (savedContact) setContact(savedContact);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === (settings.ashaPin || '1234')) {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAshaContact(contact);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleExportCsv = () => {
    if (checks.length === 0) return;
    const headers = ['ID', 'Date', 'PatientName', 'Age', 'Gender', 'Severity', 'CancerWarning', 'Symptoms', 'FollowUpDone', 'Notes'];
    const rows = checks.map((c) => [
      c.id || '',
      new Date(c.date).toISOString().slice(0, 10),
      `"${c.patientName || 'Anonymous'}"`,
      c.age,
      c.gender,
      c.resultSeverity,
      c.cancerWarningLevel,
      `"${c.selectedSymptoms.join('; ')}"`,
      c.followUpDone ? 'YES' : 'PENDING',
      `"${(c.followUpNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Village_Health_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingFollowUps = checks.filter((c) => !c.followUpDone);
  const emergencies = checks.filter((c) => c.resultSeverity === 'emergency');

  // PIN Lock Screen
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
            {t.ashaModeHeader}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.pinPlaceholder}
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            maxLength={6}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError(false);
            }}
            placeholder="••••"
            className="w-48 mx-auto tracking-widest text-center text-2xl font-black py-2.5 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-hidden"
          />

          {pinError && (
            <p className="text-xs font-bold text-rose-600">{t.wrongPin}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
            >
              {t.unlockBtn}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Unlocked ASHA Worker Portal
  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>
        <h2 className="font-black text-xl text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <span>👩‍⚕️</span>
          <span>{t.ashaModeHeader}</span>
        </h2>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
          title="Export CSV for PHC"
        >
          <Download className="w-3.5 h-3.5" />
          <span>CSV</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">{checks.length}</span>
          <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.totalChecks}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center shadow-2xs">
          <span className="text-xl font-black text-amber-700 dark:text-amber-300">{pendingFollowUps.length}</span>
          <span className="block text-[11px] font-semibold text-amber-800 dark:text-amber-400">{t.pendingFollowUps}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-center shadow-2xs">
          <span className="text-xl font-black text-rose-700 dark:text-rose-300">{emergencies.length}</span>
          <span className="block text-[11px] font-semibold text-rose-800 dark:text-rose-400">{t.emergenciesLogged}</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('due')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'due' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t.pendingFollowUps} ({pendingFollowUps.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t.villageRegistry}
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'contacts' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {language === 'hi' ? 'नंबर बदलें' : language === 'kn' ? 'ಸಂಪರ್ಕಗಳು' : 'Contacts'}
        </button>
      </div>

      {/* Tab 1: Pending Follow-ups */}
      {activeTab === 'due' && (
        <div className="space-y-3">
          {pendingFollowUps.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-900/60 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {rec.patientName || 'Patient'} ({rec.age}y, {rec.gender})
                  </h4>
                  <span className="text-xs text-slate-400">
                    {new Date(rec.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase bg-amber-100 text-amber-800">
                  {rec.resultSeverity}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Symptoms: {rec.selectedSymptoms.slice(0, 4).join(', ')}
              </p>
              {rec.followUpNotes && (
                <p className="text-xs text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl italic">
                  Note: {rec.followUpNotes}
                </p>
              )}
            </div>
          ))}
          {pendingFollowUps.length === 0 && (
            <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-3xl p-6 text-slate-400 text-xs">
              🎉 No pending follow-ups! All village checks are up to date.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Registry */}
      {activeTab === 'all' && (
        <div className="space-y-2">
          {checks.map((rec) => (
            <div
              key={rec.id}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100">{rec.patientName || 'Anonymous'}</span>
                <span className="text-slate-400 ml-1">({rec.age}y, {rec.gender})</span>
                <span className="block text-[11px] text-slate-400">{new Date(rec.date).toLocaleDateString()}</span>
              </div>
              <div className="text-right">
                <span className="font-bold uppercase text-teal-600">{rec.resultSeverity}</span>
                <span className="block text-[10px] text-slate-400">{rec.followUpDone ? 'Done' : 'Pending'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Contacts Config */}
      {activeTab === 'contacts' && (
        <form onSubmit={handleSaveContact} className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
            {t.setupAshaContacts}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.ashaNameLabel}</label>
              <input
                type="text"
                value={contact.ashaName}
                onChange={(e) => setContact({ ...contact, ashaName: e.target.value })}
                placeholder="e.g. Radha Devi"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.ashaPhoneLabel}</label>
              <input
                type="tel"
                value={contact.ashaPhone}
                onChange={(e) => setContact({ ...contact, ashaPhone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.villageNameLabel}</label>
              <input
                type="text"
                value={contact.village}
                onChange={(e) => setContact({ ...contact, village: e.target.value })}
                placeholder="Village / Gram Panchayat"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.doctorPhoneLabel}</label>
              <input
                type="tel"
                value={contact.doctorPhone || ''}
                onChange={(e) => setContact({ ...contact, doctorPhone: e.target.value })}
                placeholder="PHC Doctor Phone"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
          </div>

          {isSavedNotice && (
            <p className="text-xs font-bold text-emerald-600 text-center">Contacts saved offline!</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveContactsBtn}</span>
          </button>
        </form>
      )}
    </div>
  );
};
