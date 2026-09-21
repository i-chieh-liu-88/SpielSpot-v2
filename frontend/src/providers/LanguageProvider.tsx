import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { germanTranslations } from "../i18n/translations";

export type Language = "en" | "de";
export type TranslationValues = Record<string, string | number>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (source: string, values?: TranslationValues) => string;
};

const STORAGE_KEY = "spielspot-language";

function getInitialLanguage(): Language {
  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return storedLanguage === "de" ? "de" : "en";
}

function interpolate(source: string, values?: TranslationValues) {
  if (!values) return source;

  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replaceAll(`{${key}}`, String(value)),
    source,
  );
}

function translateToGerman(source: string) {
  const directTranslation = germanTranslations[source];
  if (directTranslation) return directTranslation;

  const ageRange = source.match(/^Ages (.+)$/);
  if (ageRange) return `${ageRange[1]} Jahre`;

  const safetyRating = source.match(/^(Excellent|Very good|Good) · (.+)$/);
  if (safetyRating) {
    const ratingLabels: Record<string, string> = {
      Excellent: "Ausgezeichnet",
      "Very good": "Sehr gut",
      Good: "Gut",
    };
    return `${ratingLabels[safetyRating[1]]} · ${safetyRating[2]}`;
  }

  const communitySafety = source.match(/^(.+)\/5 community safety rating$/);
  if (communitySafety) {
    return `${communitySafety[1]}/5 Sicherheitsbewertung der Community`;
  }

  const germanMonths: Record<string, string> = {
    January: "Januar",
    February: "Februar",
    March: "März",
    April: "April",
    May: "Mai",
    June: "Juni",
    July: "Juli",
    August: "August",
    September: "September",
    October: "Oktober",
    November: "November",
    December: "Dezember",
  };
  const date = source.match(/^([A-Za-z]+) (\d{4})$/);
  if (date && germanMonths[date[1]]) {
    return `${germanMonths[date[1]]} ${date[2]}`;
  }

  return source;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => undefined,
  toggleLanguage: () => undefined,
  t: interpolate,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    document.title =
      language === "de"
        ? germanTranslations["SpielSpot — Find Playgrounds Near You"]
        : "SpielSpot — Find Playgrounds Near You";
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (source: string, values?: TranslationValues) => {
      const translation = language === "de" ? translateToGerman(source) : source;
      return interpolate(translation, values);
    };

    return {
      language,
      setLanguage,
      toggleLanguage: () =>
        setLanguage((currentLanguage) =>
          currentLanguage === "en" ? "de" : "en",
        ),
      t,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext);
}
