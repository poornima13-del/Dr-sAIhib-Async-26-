export type Language = 'en' | 'hi' | 'kn';

export type SeverityLevel = 'mild' | 'moderate' | 'emergency';

export type CancerWarningLevel = 'none' | 'low' | 'watch' | 'high';

export interface Symptom {
  id: string;
  nameKey: string;
  category: SymptomCategory;
  bodyParts: string[];
  emoji: string;
  color: string;
  keywords: {
    en: string[];
    hi: string[];
    kn: string[];
  };
  isCancerWarning?: boolean;
  isRedFlag?: boolean;
  isSensitiveStd?: boolean;
}

export type SymptomCategory = 
  | 'general'
  | 'head_face'
  | 'chest_breathing'
  | 'stomach'
  | 'skin_injury'
  | 'urinary_women'
  | 'reproductive_std'
  | 'bones_joints'
  | 'rural_occupational'
  | 'warning_signs';

export interface Condition {
  id: string;
  name: Record<Language, string>;
  category: string;
  severity: SeverityLevel;
  primarySymptoms: string[];
  secondarySymptoms: string[];
  minAge?: number;
  maxAge?: number;
  gender?: 'male' | 'female' | 'all';
  summary: Record<Language, string>;
  whatToDo: Record<Language, string[]>;
  medicines: Record<Language, string[]>;
  precautions: {
    dos: Record<Language, string[]>;
    donts: Record<Language, string[]>;
  };
  whenToSeeDoctor: Record<Language, string[]>;
}

export interface PatientProfile {
  id?: string;
  patientCode: string; // 4-6 char short easy ID (e.g. VIL-4021 or custom 4-digit PIN)
  name: string;
  age: number; // in years or decimal
  ageUnit: 'months' | 'years';
  ageInMonths: number;
  gender: 'male' | 'female' | 'other';
  isPregnant?: boolean;
  pregnancyMonths?: number;
  weight?: string;
  conditions: string[];
  habits: string[];
  cancerFamilyHistory: 'yes' | 'no' | 'unknown';
  createdAt: number;
  lastVisitAt?: number;
}

export interface VaccineItem {
  id: string;
  name: string;
  schedule: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  description: Record<Language, string>;
}

export interface SkinAnswers {
  color: string;
  itching: boolean;
  spreading: boolean;
  painful: boolean;
  hasFever: boolean;
  days: string;
  changingMole: boolean;
}

export interface CheckRecord {
  id?: string;
  patientId?: string;
  patientCode: string;
  patientName: string;
  age: number;
  ageUnit: 'months' | 'years';
  ageInMonths: number;
  gender: 'male' | 'female' | 'other';
  isPregnant?: boolean;
  pregnancyMonths?: number;
  isFirstPregnancy?: boolean;
  pregnancyRedFlags?: string[];
  isPregnancyPath?: boolean;
  vaccinesChecked?: { vaccineId: string; name: string; status: 'yes' | 'no' | 'not_sure' }[];
  missedVaccines?: string[];
  conditions: string[];
  habits: string[];
  cancerFamilyHistory: 'yes' | 'no' | 'unknown';
  selectedSymptoms: string[];
  otherText?: string;
  needsReview?: boolean;
  duration: 'today' | '1-3_days' | 'more_than_3_days' | 'more_than_3_weeks';
  severityResponse: 'mild' | 'medium' | 'severe';
  gettingWorse: boolean;
  skinAnswers?: SkinAnswers;
  photos: string[]; // Base64 data URLs
  resultSeverity: SeverityLevel;
  cancerWarningLevel: CancerWarningLevel;
  cancerWarningReasons: string[];
  underlyingHints: string[];
  matchedConditions: { condition: Condition; score: number; confidence: 'likely' | 'possible' }[];
  date: number;
  followUpNotes?: string;
  followUpDone?: boolean;
  caseStatus?: 'pending' | 'checked'; // For ASHA worker portal
  checkedAt?: number;
}

export interface AshaContact {
  ashaName: string;
  ashaPhone: string;
  village: string;
  doctorName?: string;
  doctorPhone?: string;
  phcName?: string;
  phcPhone?: string;
  familyPhone?: string;
}

export interface AppSettings {
  language: Language;
  fontSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  darkMode: boolean;
  ashaPin: string;
  activePatientId?: string;
}
