import { VaccineItem } from '../types';

export const UIP_VACCINATION_SCHEDULE: VaccineItem[] = [
  // At Birth
  {
    id: 'bcg_birth',
    name: 'BCG (Tuberculosis)',
    schedule: 'At Birth (or up to 1 year)',
    minAgeMonths: 0,
    maxAgeMonths: 12,
    description: {
      en: 'Protects newborn from severe childhood tuberculosis and TB meningitis.',
      hi: 'शिशु को टीबी (तपेदिक) और दिमागी टीबी से बचाता है। जन्म के तुरंत बाद दिया जाता है।',
      kn: 'ನವಜಾತ ಶಿಶುವನ್ನು ಕ್ಷಯರೋಗ (ಟಿಬಿ) ಮತ್ತು ಮಿದುಳು ಸೋಂಕಿನಿಂದ ರಕ್ಷಿಸುತ್ತದೆ.'
    }
  },
  {
    id: 'opv_0_birth',
    name: 'OPV-0 (Polio Birth Dose)',
    schedule: 'At Birth (within 15 days)',
    minAgeMonths: 0,
    maxAgeMonths: 1,
    description: {
      en: 'Oral polio drops given within 15 days of birth.',
      hi: 'पोलियो ड्रॉप्स (2 बूंद) जन्म के 15 दिनों के भीतर।',
      kn: 'ಜನನದ 15 ದಿನಗಳೊಳಗೆ ನೀಡಲಾಗುವ ಪೋಲಿಯೋ ಹನಿಗಳು.'
    }
  },
  {
    id: 'hepb_birth',
    name: 'Hepatitis B Birth Dose',
    schedule: 'At Birth (within 24 hours)',
    minAgeMonths: 0,
    maxAgeMonths: 1,
    description: {
      en: 'Protects liver from Hepatitis B infection.',
      hi: 'हेपेटाइटिस बी (पीलिया/लिवर संक्रमण) से बचाव के लिए 24 घंटे के भीतर।',
      kn: 'ಹೆಪಟೈಟಿಸ್ ಬಿ ಸೋಂಕಿನಿಂದ ಯಕೃತ್ತನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.'
    }
  },

  // 6 Weeks (1.5 months)
  {
    id: 'penta_1',
    name: 'Pentavalent-1 & OPV-1',
    schedule: '6 Weeks (1.5 Months)',
    minAgeMonths: 1.5,
    maxAgeMonths: 12,
    description: {
      en: '5-in-1 vaccine: Diphtheria, Pertussis, Tetanus, Hep B, Hib (Pneumonia/Meningitis) + Polio drops.',
      hi: '5 बीमारियों का टीका (गलघोंटू, काली खांसी, टिटनेस, हेपेटाइटिस बी, हिब निमोनिया) + पोलियो।',
      kn: '5 ಕಾಯಿಲೆಗಳ ತಡೆ ಲಸಿಕೆ ಮತ್ತು ಪೋಲಿಯೋ ಹನಿಗಳು.'
    }
  },
  {
    id: 'rota_1',
    name: 'Rotavirus-1 & fIPV-1',
    schedule: '6 Weeks (1.5 Months)',
    minAgeMonths: 1.5,
    maxAgeMonths: 12,
    description: {
      en: 'Protects from severe infant diarrhea and injectable polio fraction.',
      hi: 'बच्चों में गंभीर दस्त और निर्जलीकरण रोकने के लिए रोटावायरस ड्रॉप्स।',
      kn: 'ತೀವ್ರ ಅತಿಸಾರ ಮತ್ತು ನಿರ್ಜಲೀಕರಣ ತಡೆಗಟ್ಟಲು ರೋಟಾವೈರಸ್ ಹನಿಗಳು.'
    }
  },
  {
    id: 'pcv_1',
    name: 'PCV-1 (Pneumococcal)',
    schedule: '6 Weeks (1.5 Months)',
    minAgeMonths: 1.5,
    maxAgeMonths: 12,
    description: {
      en: 'Protects against severe pneumonia and ear/blood infections.',
      hi: 'निमोनिया और फेफड़ों के गंभीर संक्रमण से बचाव का टीका।',
      kn: 'ನ್ಯುಮೋನಿಯಾ ಮತ್ತು ಶ್ವಾಸಕೋಶದ ಸೋಂಕಿನಿಂದ ರಕ್ಷಣೆ.'
    }
  },

  // 10 Weeks (2.5 months)
  {
    id: 'penta_2',
    name: 'Pentavalent-2 & OPV-2 & Rota-2',
    schedule: '10 Weeks (2.5 Months)',
    minAgeMonths: 2.5,
    maxAgeMonths: 12,
    description: {
      en: 'Second dose of Pentavalent, Oral Polio drops, and Rotavirus.',
      hi: 'पेंटावेलेंट, पोलियो और रोटावायरस की दूसरी खुराक।',
      kn: 'ಪೆಂಟಾವಲೆಂಟ್, ಪೋಲಿಯೋ ಮತ್ತು ರೋಟಾವೈರಸ್ ಎರಡನೇ ಡೋಸ್.'
    }
  },

  // 14 Weeks (3.5 months)
  {
    id: 'penta_3',
    name: 'Pentavalent-3, OPV-3, Rota-3, PCV-2',
    schedule: '14 Weeks (3.5 Months)',
    minAgeMonths: 3.5,
    maxAgeMonths: 12,
    description: {
      en: 'Third dose of primary infant vaccines + fIPV-2 and PCV-2.',
      hi: 'प्राथमिक टीकों की तीसरी खुराक (पेंटावेलेंट 3, पोलियो 3, पीसीवी 2)।',
      kn: 'ಪ್ರಾಥಮಿಕ ಲಸಿಕೆಗಳ ಮೂರನೇ ಡೋಸ್.'
    }
  },

  // 9-12 Months
  {
    id: 'mr_1',
    name: 'MR-1 (Measles-Rubella) & PCV Booster',
    schedule: '9-12 Months',
    minAgeMonths: 9,
    maxAgeMonths: 24,
    description: {
      en: 'Measles-Rubella vaccine 1st dose, PCV Booster shot, Vitamin A dose 1.',
      hi: 'खसरा-रूबेला (MR 1) का पहला टीका, पीसीवी बूस्टर और विटामिन ए की पहली खुराक।',
      kn: 'ದಡಾರ-ರುಬೆಲ್ಲಾ ಮೊದಲ ಲಸಿಕೆ ಮತ್ತು ವಿಟಮಿನ್ ಎ ಡೋಸ್.'
    }
  },

  // 16-24 Months
  {
    id: 'mr_2_dpt_boost',
    name: 'MR-2 & DPT Booster-1',
    schedule: '16-24 Months',
    minAgeMonths: 16,
    maxAgeMonths: 36,
    description: {
      en: 'MR 2nd dose, DPT Booster 1, OPV Booster, Vitamin A.',
      hi: 'खसरा-रूबेला 2, डीपीटी बूस्टर 1, पोलियो बूस्टर।',
      kn: 'ದಡಾರ ಎರಡನೇ ಡೋಸ್ ಮತ್ತು ಡಿಪಿಟಿ ಬೂಸ್ಟರ್ 1.'
    }
  },

  // 5-6 Years
  {
    id: 'dpt_boost_2',
    name: 'DPT Booster-2',
    schedule: '5-6 Years',
    minAgeMonths: 60,
    maxAgeMonths: 84,
    description: {
      en: 'School-entry DPT booster to reinforce diphtheria and tetanus protection.',
      hi: 'स्कूल जाने की उम्र में डीपीटी बूस्टर 2 (गलघोंटू और टिटनेस से सुरक्षा)।',
      kn: 'ಶಾಲಾ ಪ್ರವೇಶದ ವಯಸ್ಸಿನಲ್ಲಿ ಡಿಪಿಟಿ ಬೂಸ್ಟರ್ 2 ಲಸಿಕೆ.'
    }
  },

  // 10 & 16 Years
  {
    id: 'td_teen',
    name: 'Td Vaccine (Tetanus-Diphtheria)',
    schedule: '10 Years & 16 Years',
    minAgeMonths: 120,
    maxAgeMonths: 216,
    description: {
      en: 'Adolescent tetanus and adult-type diphtheria booster.',
      hi: 'किशोरावस्था में टिटनेस और डिप्थीरिया से सुरक्षा का टीडी (Td) टीका।',
      kn: 'ಹದಿಹರೆಯದವರಲ್ಲಿ ಟಿಟಾನಸ್ ಮತ್ತು ಡಿಫ್ತೀರಿಯಾ ತಡೆ ಟಿಡಿ ಲಸಿಕೆ.'
    }
  }
];

export function getDueVaccinesForAge(ageInMonths: number): VaccineItem[] {
  // Returns vaccines that are due or overdue up to this age
  return UIP_VACCINATION_SCHEDULE.filter((v) => ageInMonths >= v.minAgeMonths);
}
