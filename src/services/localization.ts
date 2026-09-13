export const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
};

export function t(key: string, language: string = DEFAULT_LANGUAGE): string {
  const values: Record<string, Record<string, string>> = {
    en: {
      language: 'Language',
      assessment: 'Assessment',
      learning: 'Learning',
      insights: 'Insights',
      admin: 'Admin',
    },
    hi: {
      language: 'भाषा',
      assessment: 'मूल्यांकन',
      learning: 'सीखना',
      insights: 'अंतर्दृष्टि',
      admin: 'प्रशासन',
    },
    kn: {
      language: 'ಭಾಷೆ',
      assessment: 'ಮೌಲ್ಯಮಾಪನ',
      learning: 'ಕಲಿಕೆ',
      insights: 'ಅಪಾಯಿಂತರಗಳು',
      admin: 'ಮಾಡುководನ',
    },
  };

  return values[language]?.[key] ?? values.en[key] ?? key;
}
