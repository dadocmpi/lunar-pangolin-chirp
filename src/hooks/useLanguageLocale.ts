// Re-render on language change so every Intl-formatted value follows the active
// locale (and RTL direction) immediately, without a full page reload.
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function useLanguageLocale(): string {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState(i18n.language || "en");

  useEffect(() => {
    const handler = (lng: string) => setLocale(lng);
    i18n.on("languageChanged", handler);
    setLocale(i18n.language || "en");
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, [i18n]);

  return locale;
}

export default useLanguageLocale;
