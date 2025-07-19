import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "id";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys and values
const translations = {
  en: {
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.add": "Add",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",
    
    // Navigation
    "nav.inventory": "Inventory",
    "nav.analytics": "Analytics",
    "nav.predictions": "Predictions",
    "nav.settings": "Settings",
    "nav.users": "Users",
    "nav.help": "Help",
    "nav.alerts": "Alerts",
    
    // Inventory
    "inventory.title": "Raw Materials",
    "inventory.subtitle": "Inventory Management",
    "inventory.addMaterial": "Add New Material",
    "inventory.materialName": "Material Name",
    "inventory.description": "Description",
    "inventory.category": "Category",
    "inventory.quantity": "Quantity",
    "inventory.unit": "Unit",
    "inventory.minStock": "Minimum Stock Level",
    "inventory.supplier": "Supplier Name",
    "inventory.dateOfPurchase": "Date of Purchase",
    "inventory.totalYards": "Total Yards",
    "inventory.usage": "Usage for Product",
    "inventory.sku": "SKU",
    "inventory.generate": "Generate",
    "inventory.editMaterial": "Edit Material",
    "inventory.useMaterial": "Use Material",
    
    // Search
    "search.placeholder": "Search materials...",
    "search.noResults": "No materials found",
    "search.resultsFor": "Results for",
    "search.showingResults": "Showing {count} of {total} materials",
    "search.clearSearch": "Clear search",
    "search.clearFilters": "Clear filters",
    
    // Settings
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
    "settings.companyName": "Company Name",
    "settings.contactEmail": "Contact Email",
    "settings.bio": "Bio",
    
    // Predictions
    "predictions.title": "AI Predictions",
    "predictions.overview": "Overview",
    "predictions.risks": "Top Risks",
    "predictions.reorders": "Reorder Suggestions",
    "predictions.criticalMaterials": "Critical Materials",
    "predictions.averageStock": "Average Stock Days",
    "predictions.confidence": "Confidence",
    "predictions.daysLeft": "Days Left",
    "predictions.dailyUsage": "Daily Usage",
    
    // Analytics
    "analytics.title": "Analytics",
    "analytics.overview": "Overview",
    "analytics.charts": "Charts",
    "analytics.reports": "Reports",
    
    // Help
    "help.title": "Help & Documentation",
    "help.gettingStarted": "Getting Started",
    "help.features": "Features",
    "help.overview": "Overview",
    
    // Languages
    "language.english": "English",
    "language.indonesian": "Bahasa Indonesia"
  },
  id: {
    // Common
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.edit": "Edit",
    "common.delete": "Hapus",
    "common.add": "Tambah",
    "common.search": "Cari",
    "common.loading": "Memuat...",
    "common.error": "Error",
    "common.success": "Berhasil",
    "common.confirm": "Konfirmasi",
    "common.yes": "Ya",
    "common.no": "Tidak",
    
    // Navigation
    "nav.inventory": "Inventori",
    "nav.analytics": "Analitik",
    "nav.predictions": "Prediksi",
    "nav.settings": "Pengaturan",
    "nav.users": "Pengguna",
    "nav.help": "Bantuan",
    "nav.alerts": "Peringatan",
    
    // Inventory
    "inventory.title": "Bahan Mentah",
    "inventory.subtitle": "Manajemen Inventori",
    "inventory.addMaterial": "Tambah Bahan Baru",
    "inventory.materialName": "Nama Bahan",
    "inventory.description": "Deskripsi",
    "inventory.category": "Kategori",
    "inventory.quantity": "Jumlah",
    "inventory.unit": "Satuan",
    "inventory.minStock": "Stok Minimum",
    "inventory.supplier": "Nama Pemasok",
    "inventory.dateOfPurchase": "Tanggal Pembelian",
    "inventory.totalYards": "Total Yard",
    "inventory.usage": "Penggunaan untuk Produk",
    "inventory.sku": "SKU",
    "inventory.generate": "Buat",
    "inventory.editMaterial": "Edit Bahan",
    "inventory.useMaterial": "Gunakan Bahan",
    
    // Search
    "search.placeholder": "Cari bahan...",
    "search.noResults": "Tidak ada bahan ditemukan",
    "search.resultsFor": "Hasil untuk",
    "search.showingResults": "Menampilkan {count} dari {total} bahan",
    "search.clearSearch": "Hapus pencarian",
    "search.clearFilters": "Hapus filter",
    
    // Settings
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
    "settings.companyName": "Nama Perusahaan",
    "settings.contactEmail": "Email Kontak",
    "settings.bio": "Bio",
    
    // Predictions
    "predictions.title": "Prediksi AI",
    "predictions.overview": "Ringkasan",
    "predictions.risks": "Risiko Utama",
    "predictions.reorders": "Saran Pemesanan Ulang",
    "predictions.criticalMaterials": "Bahan Kritis",
    "predictions.averageStock": "Rata-rata Hari Stok",
    "predictions.confidence": "Keyakinan",
    "predictions.daysLeft": "Hari Tersisa",
    "predictions.dailyUsage": "Penggunaan Harian",
    
    // Analytics
    "analytics.title": "Analitik",
    "analytics.overview": "Ringkasan",
    "analytics.charts": "Grafik",
    "analytics.reports": "Laporan",
    
    // Help
    "help.title": "Bantuan & Dokumentasi",
    "help.gettingStarted": "Memulai",
    "help.features": "Fitur",
    "help.overview": "Ringkasan",
    
    // Languages
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
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found in fallback
          }
        }
        break;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  useEffect(() => {
    // Update document lang attribute
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
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}