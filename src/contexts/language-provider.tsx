"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { translations, Language, TranslationKey } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<Language>("en");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem("language") as Language | null;
    if (storedLang && translations[storedLang]) {
      setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem("language", language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    }
  }, [language, isMounted]);

  const t = (key: TranslationKey): string => {
    if (!isMounted) return ""; // Prevents server/client mismatch
    return translations[language][key] || translations.en[key];
  };

  const dir = language === "ur" ? "rtl" : "ltr";

  const value = useMemo(
    () => ({ language, setLanguage, t, dir }),
    [language, t, dir]
  );
  
  if (!isMounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
