import React, { useState, useEffect } from 'react';
import { CheckRecord, Language } from '../types';
import { translations } from '../data/translations';
import { getAllChecks, updateCheckFollowUp, deleteCheck, exportAllData, importAllData } from '../utils/db';
import {
  Search,
  Calendar,
  User,
  Trash2,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Upload,
  ArrowLeft,
  FileText,
  ChevronRight,
  Eye,
  Camera
} from 'lucide-react';

interface RecordsScreenProps {
  language: Language;
  onBack: () => void;
  onViewRecord: (record: CheckRecord) => void;
  onPrintRecord: (record: CheckRecord) => void;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({
  language,
  onBack,
  onViewRecord,
  onPrintRecord
}) => {
  const t = translations[language] || translations.en;
  const [records, setRecords] = useState<CheckRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    const data = await getAllChecks();
    setRecords(data);
    setIsLoading(false);
  };

  const handleToggleFollowUp = async (record: CheckRecord) => {
    if (!record.id) return;
    const newStatus = !record.followUpDone;
    await updateCheckFollowUp(record.id, record.followUpNotes || '', newStatus);
    loadRecords();
  };

  const handleSaveNotes = async (id: string) => {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;
    await updateCheckFollowUp(id, noteText, rec.followUpDone || false);
    setEditingNotesId(null);
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this record permanently?')) {
      await deleteCheck(id);
      loadRecords();
    }
  };

  const handleExportData = async () => {
    const jsonStr = await exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DrSAIhib_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = await importAllData(content);
        if (ok) {
          alert('Data restored successfully!');
          loadRecords();
        } else {
          alert('Failed to parse backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const filteredRecords = records.filter((r) => {
    const nameMatch = (r.patientName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const symptomMatch = r.selectedSymptoms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return nameMatch || symptomMatch;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>
        <h2 className="font-black text-xl text-slate-800 dark:text-slate-100">
          {t.recordsTitle}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportData}
            title={t.exportDataBtn}
            className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-xs font-bold flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Backup</span>
          </button>
          <label className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-xs"
        />
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.map((rec) => {
          const isEmergency = rec.resultSeverity === 'emergency';
          const isModerate = rec.resultSeverity === 'moderate';

          return (
            <div
              key={rec.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
            >
              {/* Row 1: Patient Name, Severity badge, date */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600" />
                    <h3 className="font-black text-base text-slate-800 dark:text-slate-100">
                      {rec.patientName || (language === 'hi' ? 'अज्ञात मरीज' : 'Unnamed Patient')}
                    </h3>
                    {rec.patientCode && (
                      <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {rec.patientCode}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({rec.age}y, {rec.gender})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(rec.date).toLocaleDateString()} {new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                      isEmergency
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : isModerate
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {rec.resultSeverity}
                  </span>
                  {rec.cancerWarningLevel !== 'none' && (
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                      Cancer: {rec.cancerWarningLevel.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Photos attached */}
              {rec.photos && rec.photos.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-500">
                    {rec.photos.length} {t.photosAttached}:
                  </span>
                  <div className="flex gap-1.5">
                    {rec.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt="Photo"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-2xs"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up notes & Done toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleFollowUp(rec)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl transition ${
                    rec.followUpDone
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  <CheckCircle className={`w-3.5 h-3.5 ${rec.followUpDone ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <span>{rec.followUpDone ? t.followUpDone : t.followUpDue}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingNotesId(rec.id || null);
                      setNoteText(rec.followUpNotes || '');
                    }}
                    className="text-xs text-slate-500 hover:text-teal-600 font-semibold"
                  >
                    {rec.followUpNotes ? '📝 Notes' : '+ ' + t.addNotes}
                  </button>
                  <button
                    onClick={() => onViewRecord(rec)}
                    className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100"
                    title={t.viewSlipBtn}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onPrintRecord(rec)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    title={t.printAdviceBtn}
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  {rec.id && (
                    <button
                      onClick={() => handleDelete(rec.id!)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notes editing view */}
              {editingNotesId === rec.id && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter ASHA worker follow-up observations, medicine given, or clinic referral..."
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingNotesId(null)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-500"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => rec.id && handleSaveNotes(rec.id)}
                      className="px-3 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold"
                    >
                      {t.save}
                    </button>
                  </div>
                </div>
              )}

              {/* Display saved note if present */}
              {rec.followUpNotes && editingNotesId !== rec.id && (
                <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl italic">
                  Note: {rec.followUpNotes}
                </div>
              )}
            </div>
          );
        })}

        {filteredRecords.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p>{t.noRecords}</p>
          </div>
        )}
      </div>
    </div>
  );
};
