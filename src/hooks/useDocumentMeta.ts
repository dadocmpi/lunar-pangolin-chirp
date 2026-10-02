import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type MetaKey = 'home' | 'pricing' | 'about' | 'howItWorks' | 'contact' | 'terms' | 'privacy' | 'disclaimer';

/** Map an i18next base code to an Open Graph locale (e.g. pt -> pt_BR). */
const OG_LOCALE: Record<string, string> = {
  en: 'en_US', pt: 'pt_BR', it: 'it_IT', es: 'es_ES', fr: 'fr_FR', de: 'de_DE',
  ru: 'ru_RU', zh: 'zh_CN', ja: 'ja_JP', ar: 'ar_AR', he: 'he_IL',
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets the document title, description and Open Graph tags for the current page
 * in the active language. The page-specific keys live under `meta.<page>.*`.
 */
export function useDocumentMeta(page: MetaKey) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const title = t(`meta.${page}.title`);
    const description = t(`meta.${page}.description`);
    const lang = (i18n.language || 'en').split('-')[0];

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:locale', OG_LOCALE[lang] ?? 'en_US');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
  }, [page, t, i18n.language]);
}

export default useDocumentMeta;
