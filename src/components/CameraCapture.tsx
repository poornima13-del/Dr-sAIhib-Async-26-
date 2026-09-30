import React, { useRef, useState } from 'react';
import { Language } from '../types';
import { Camera, ImagePlus, Trash2, RotateCcw, Info, CheckCircle2 } from 'lucide-react';
import { translations } from '../data/translations';

interface CameraCaptureProps {
  language: Language;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  language,
  photos,
  onPhotosChange,
  maxPhotos = 3
}) => {
  const t = translations[language] || translations.en;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const retakeIndexRef = useRef<number | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Direct trigger for native camera / file picker
  const triggerCamera = (indexToReplace: number | null = null) => {
    retakeIndexRef.current = indexToReplace;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (!dataUrl) return;

      if (retakeIndexRef.current !== null && retakeIndexRef.current >= 0) {
        // Replace existing photo (Retake)
        const updated = [...photos];
        updated[retakeIndexRef.current] = dataUrl;
        onPhotosChange(updated);
        retakeIndexRef.current = null;
      } else {
        // Add new photo up to maxPhotos
        if (photos.length < maxPhotos) {
          onPhotosChange([...photos, dataUrl]);
        }
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
            {language === 'hi'
              ? 'घाव / चकत्ते की फोटो (वैकल्पिक)'
              : language === 'kn'
              ? 'ಗಾಯ / ಗುಳ್ಳೆಯ ಫೋಟೋ (ಐಚ್ಛಿಕ)'
              : 'Show Rash / Wound / Swelling (Optional)'}
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {photos.length} / {maxPhotos}
        </span>
      </div>

      {/* Honest UI Explanation */}
      <div className="flex items-start gap-2 p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 text-xs text-teal-900 dark:text-teal-200">
        <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {language === 'hi'
            ? 'फोटो केवल आपके फोन में सुरक्षित रहती है ताकि आप आशा दीदी या डॉक्टर को दिखा सकें। डॉक्टर SAIहिब फोटो से नहीं, आपके उत्तरों से सलाह देते हैं।'
            : language === 'kn'
            ? 'ಫೋಟೋ ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲೇ ಇರುತ್ತದೆ ಮತ್ತು ಡಾಕ್ಟರ್ ಅಥವಾ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಗೆ ತೋರಿಸಲು ಬಳಸಲಾಗುತ್ತದೆ.'
            : 'The photo is saved offline on this device to show your ASHA worker or doctor. Dr SAIhib uses your questions and answers, not the picture, to provide guidance.'}
        </p>
      </div>

      {/* Thumbnail Previews & Native Camera Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-teal-500/40 bg-slate-100 dark:bg-slate-900 shadow-xs group"
          >
            <img
              src={photo}
              alt={`Wound photo ${idx + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setPreviewPhoto(photo)}
            />

            {/* Quick Actions overlay: Delete & Retake */}
            <div className="absolute top-1 right-1 flex gap-1">
              <button
                type="button"
                onClick={() => triggerCamera(idx)}
                className="p-1 rounded-full bg-black/70 hover:bg-black text-white shadow-xs"
                title="Retake photo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeletePhoto(idx)}
                className="p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                title="Delete photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] font-bold text-white flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              <span>#{idx + 1}</span>
            </div>
          </div>
        ))}

        {/* Add photo button (if < maxPhotos) */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => triggerCamera(null)}
            className="aspect-square rounded-2xl border-2 border-dashed border-teal-400 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 flex flex-col items-center justify-center gap-1 text-teal-700 dark:text-teal-300 font-bold text-xs transition active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center text-teal-600 dark:text-teal-300">
              <Camera className="w-5 h-5" />
            </div>
            <span>{photos.length === 0 ? 'Take Photo' : '+ Add Another'}</span>
          </button>
        )}
      </div>

      {/* Hidden standard native input with capture="environment" */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Full Screen View Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-sm w-full bg-slate-900 rounded-3xl p-3 shadow-2xl">
            <img src={previewPhoto} alt="Full view" className="w-full rounded-2xl max-h-[70vh] object-contain" />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
