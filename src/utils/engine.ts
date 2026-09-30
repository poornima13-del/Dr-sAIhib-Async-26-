import { CheckRecord, Condition, SeverityLevel, CancerWarningLevel } from '../types';
import { CONDITIONS_LIST, SYMPTOMS_LIST } from '../data/knowledgeBase';

export interface EvaluationResult {
  severity: SeverityLevel;
  cancerWarningLevel: CancerWarningLevel;
  cancerWarningReasons: string[];
  underlyingHints: string[];
  matchedConditions: { condition: Condition; score: number; confidence: 'likely' | 'possible' }[];
  isRedFlagTriggered: boolean;
  emergencyFirstAid: string[];
}

export function evaluateSymptoms(record: Partial<CheckRecord>): EvaluationResult {
  const symptoms = record.selectedSymptoms || [];
  const duration = record.duration || 'today';
  const severityAnswer = record.severityResponse || 'medium';
  const age = record.age ?? 30;
  const isPregnant = record.isPregnant || false;
  const habits = record.habits || [];
  const conditions = record.conditions || [];
  const familyCancer = record.cancerFamilyHistory || 'unknown';
  const skinAnswers = record.skinAnswers;

  // 1. Red Flag Override Assessment
  const redFlagsTriggered: string[] = [];
  SYMPTOMS_LIST.forEach((s) => {
    if (s.isRedFlag && symptoms.includes(s.id)) {
      redFlagsTriggered.push(s.id);
    }
  });

  // Chest area priority rule: chest pain or severe breathlessness always emergency!
  const hasChestEmergency = symptoms.includes('chest_pain') || symptoms.includes('breathlessness');
  
  // Severe right abdominal pain (appendicitis)
  const hasAppendicitisSign = symptoms.includes('severe_right_stomach_pain');

  // Stroke sign (FAST)
  const hasStrokeSign = symptoms.includes('facial_droop_speech');

  // Snake bite
  const hasSnakeBite = symptoms.includes('snake_bite');

  // Extreme dehydration combination
  const hasDehydration = symptoms.includes('loose_motions') && symptoms.includes('vomiting') && (symptoms.includes('dizziness') || symptoms.includes('fatigue'));

  // Pregnancy with bleeding or severe headache
  const pregnantComplication = isPregnant && (symptoms.includes('abnormal_bleeding_women') || symptoms.includes('severe_sudden_headache'));

  // High vulnerability: under 5 years or over 60 years with high fever/severe pain
  const isVulnerableAge = (age < 5 || age > 60) && (symptoms.includes('fever') && severityAnswer === 'severe');

  const isEmergency = 
    redFlagsTriggered.length > 0 || 
    hasChestEmergency || 
    hasAppendicitisSign || 
    hasStrokeSign || 
    hasSnakeBite || 
    hasDehydration || 
    pregnantComplication ||
    isVulnerableAge;

  // 2. Cancer Early-Warning Scoring & Logic
  const cancerWarningReasons: string[] = [];
  let cancerScore = 0;

  // Breast warning path
  if (symptoms.includes('breast_lump')) {
    cancerScore += 4;
    cancerWarningReasons.push('breastLumpDetected');
  }
  if (symptoms.includes('breast_skin_changes')) {
    cancerScore += 3;
    cancerWarningReasons.push('breastSkinChangeDetected');
  }

  // Oral warning path
  if (symptoms.includes('mouth_ulcer_persistent')) {
    cancerScore += 3;
    cancerWarningReasons.push('persistentMouthUlcer');
    if (habits.includes('tobacco') || habits.includes('smoking')) {
      cancerScore += 3;
      cancerWarningReasons.push('tobaccoHabitRisk');
    }
  }

  // Neck / throat lump
  if (symptoms.includes('neck_lump')) {
    cancerScore += 3;
    cancerWarningReasons.push('persistentNeckLump');
  }

  // Chronic cough & blood
  if (symptoms.includes('cough_persistent') && (duration === 'more_than_3_weeks' || duration === 'more_than_3_days')) {
    cancerScore += 2;
    cancerWarningReasons.push('prolongedCough');
  }
  if (symptoms.includes('cough_blood')) {
    cancerScore += 4;
    cancerWarningReasons.push('bloodInCough');
  }

  // Bleeding in urine or abnormal vaginal bleeding
  if (symptoms.includes('blood_in_urine')) {
    cancerScore += 3;
    cancerWarningReasons.push('bloodInUrine');
  }
  if (symptoms.includes('abnormal_bleeding_women')) {
    cancerScore += 3;
    cancerWarningReasons.push('abnormalVaginalBleeding');
  }

  // Systemic warning signs
  if (symptoms.includes('unexplained_weight_loss')) {
    cancerScore += 3;
    cancerWarningReasons.push('unexplainedWeightLoss');
  }
  if (symptoms.includes('night_sweats')) {
    cancerScore += 2;
    cancerWarningReasons.push('nightSweats');
  }

  // Skin questionnaire mole change
  if (skinAnswers?.changingMole) {
    cancerScore += 4;
    cancerWarningReasons.push('changingMoleOrLump');
  }

  // Modifiers
  if (duration === 'more_than_3_weeks') cancerScore += 2;
  if (familyCancer === 'yes') cancerScore += 2;
  if (age >= 45) cancerScore += 1;
  if (habits.includes('tobacco') || habits.includes('smoking') || habits.includes('alcohol')) cancerScore += 1;

  let cancerWarningLevel: CancerWarningLevel = 'none';
  if (cancerScore >= 6) {
    cancerWarningLevel = 'high';
  } else if (cancerScore >= 3) {
    cancerWarningLevel = 'watch';
  } else if (cancerScore > 0 || age >= 50 || familyCancer === 'yes') {
    cancerWarningLevel = 'low';
  }

  // 3. Underlying Chronic Disease Hints
  const underlyingHints: string[] = [];

  // Diabetes hint
  const hasFrequentUrination = symptoms.includes('burning_urination');
  const hasFatigue = symptoms.includes('fatigue');
  const hasSlowHealingWound = symptoms.includes('minor_cut_wound') && (duration === 'more_than_3_weeks' || duration === 'more_than_3_days');
  if ((hasFrequentUrination && hasFatigue) || hasSlowHealingWound || conditions.includes('diabetes')) {
    underlyingHints.push('diabetesCheck');
  }

  // Tuberculosis hint
  if (symptoms.includes('cough_persistent') && (duration === 'more_than_3_weeks' || symptoms.includes('night_sweats') || symptoms.includes('unexplained_weight_loss') || symptoms.includes('cough_blood'))) {
    underlyingHints.push('tbScreening');
  }

  // Anemia hint
  if (symptoms.includes('fatigue') && symptoms.includes('dizziness') && (symptoms.includes('breathlessness') || symptoms.includes('headache') || isPregnant)) {
    underlyingHints.push('anemiaCheck');
  }

  // Hypertension hint
  if ((symptoms.includes('headache') && symptoms.includes('dizziness')) || conditions.includes('high_bp')) {
    underlyingHints.push('hypertensionCheck');
  }

  // Heart disease hint
  if (symptoms.includes('chest_pain') || (conditions.includes('heart_disease') && symptoms.includes('breathlessness'))) {
    underlyingHints.push('heartDiseaseCheck');
  }

  // 4. Condition Matching & Scoring
  const scoredConditions: { condition: Condition; score: number; confidence: 'likely' | 'possible' }[] = [];

  CONDITIONS_LIST.forEach((cond) => {
    let score = 0;

    // Check primary symptoms (weight: 3.5 each)
    cond.primarySymptoms.forEach((symId) => {
      if (symptoms.includes(symId)) {
        score += 3.5;
      }
    });

    // Check secondary symptoms (weight: 1.5 each)
    cond.secondarySymptoms.forEach((symId) => {
      if (symptoms.includes(symId)) {
        score += 1.5;
      }
    });

    // Duration bonus
    if (cond.category === 'early_warning' && duration === 'more_than_3_weeks') {
      score += 2;
    }

    // Chest pain priority bonus for heart attack
    if (cond.id === 'possible_heart_attack' && hasChestEmergency) {
      score += 5;
    }

    // Appendicitis priority bonus
    if (cond.id === 'possible_appendicitis' && hasAppendicitisSign) {
      score += 5;
    }

    // Stroke priority bonus
    if (cond.id === 'possible_stroke' && hasStrokeSign) {
      score += 5;
    }

    // Snake bite priority bonus
    if (cond.id === 'snake_bite_emergency' && hasSnakeBite) {
      score += 10;
    }

    if (score >= 3) {
      scoredConditions.push({
        condition: cond,
        score,
        confidence: score >= 6 ? 'likely' : 'possible'
      });
    }
  });

  // Sort descending by score
  scoredConditions.sort((a, b) => b.score - a.score);
  const matched = scoredConditions.slice(0, 3);

  // 5. Final Overall Severity Determination
  let overallSeverity: SeverityLevel = 'mild';

  if (isEmergency || (matched.length > 0 && matched[0].condition.severity === 'emergency')) {
    overallSeverity = 'emergency';
  } else if (
    severityAnswer === 'severe' || 
    duration === 'more_than_3_weeks' || 
    cancerWarningLevel === 'high' || 
    (matched.length > 0 && matched[0].condition.severity === 'moderate') ||
    symptoms.length >= 3
  ) {
    overallSeverity = 'moderate';
  } else {
    overallSeverity = 'mild';
  }

  // Emergency first-aid steps if emergency
  const emergencyFirstAid: string[] = [];
  if (hasChestEmergency) {
    emergencyFirstAid.push('chestEmergencyFirstAid');
  } else if (hasStrokeSign) {
    emergencyFirstAid.push('strokeFirstAid');
  } else if (hasSnakeBite) {
    emergencyFirstAid.push('snakeBiteFirstAid');
  } else if (hasAppendicitisSign) {
    emergencyFirstAid.push('appendicitisFirstAid');
  } else if (hasDehydration) {
    emergencyFirstAid.push('dehydrationFirstAid');
  }

  return {
    severity: overallSeverity,
    cancerWarningLevel,
    cancerWarningReasons,
    underlyingHints,
    matchedConditions: matched,
    isRedFlagTriggered: isEmergency,
    emergencyFirstAid
  };
}
