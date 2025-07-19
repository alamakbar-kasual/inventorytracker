import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "id";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple flat translations
const translations = {
  en: {
    "settings.title": "Settings",
    "settings.profile": "Profile",
    "settings.notifications": "Notifications",
    "settings.inventory": "Inventory",
    "settings.display": "Display",
    "settings.data": "Data",
    "settings.security": "Security",
    "settings.language": "Language",
    "settings.language.description": "Choose your preferred language",
    "settings.theme": "Theme",
    "settings.theme.description": "Choose light or dark theme",
    "nav.inventory": "Inventory",
    "nav.analytics": "Analytics",
    "nav.settings": "Settings",
    "nav.alerts": "Alerts",
    "inventory.title": "Raw Materials",
    "inventory.subtitle": "Inventory Management",
    "inventory.addMaterial": "Add Material",
    "common.save": "Save",
    "language.english": "English",
    "language.indonesian": "Bahasa Indonesia"
  },
  id: {
    "settings.title": "Pengaturan",
    "settings.profile": "Profil",
    "settings.notifications": "Notifikasi",
    "settings.inventory": "Inventori",
    "settings.display": "Tampilan",
    "settings.data": "Data",
    "settings.security": "Keamanan",
    "settings.language": "Bahasa",
    "settings.language.description": "Pilih bahasa yang diinginkan",
    "settings.theme": "Tema",
    "settings.theme.description": "Pilih tema terang atau gelap",
    "nav.inventory": "Inventori",
    "nav.analytics": "Analitik",
    "nav.settings": "Pengaturan",
    "nav.alerts": "Peringatan",
    "inventory.title": "Bahan Mentah",
    "inventory.subtitle": "Manajemen Inventori",
    "inventory.addMaterial": "Tambah Bahan",
    "common.save": "Simpan",
    "language.english": "English",
    "language.indonesian": "Bahasa Indonesia"
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "en" || saved === "id") ? saved : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key];
    if (translation) return translation;
    
    // Fallback to English
    const englishTranslation = translations.en[key];
    if (englishTranslation) return englishTranslation;
    
    // Return key if no translation found
    return key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}