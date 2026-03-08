import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        pricing: "PRICING",
        howItWorks: "HOW IT WORKS",
        about: "ABOUT US",
        contact: "CONTACT",
        login: "LOGIN",
        openAccount: "OPEN ACCOUNT"
      },
      hero: {
        badge: "INSTITUTIONAL ACCESS NOW OPEN",
        title1: "THE FUTURE OF",
        title2: "QUANT TRADING.",
        desc: "Proprietary algorithms engineered for the modern market. Experience institutional-grade execution with millisecond precision.",
        getStarted: "GET STARTED NOW",
        viewStrategies: "VIEW STRATEGIES"
      },
      stats: {
        volume: "VOLUME TRADED",
        traders: "ACTIVE TRADERS",
        uptime: "UPTIME SLA",
        latency: "AVG LATENCY"
      },
      footer: {
        rights: "All rights reserved.",
        privacy: "Privacy",
        terms: "Terms",
        disclaimer: "Financial Disclaimer"
      }
    }
  },
  pt: {
    translation: {
      nav: {
        pricing: "PREÇOS",
        howItWorks: "COMO FUNCIONA",
        about: "SOBRE NÓS",
        contact: "CONTATO",
        login: "ENTRAR",
        openAccount: "ABRIR CONTA"
      },
      hero: {
        badge: "ACESSO INSTITUCIONAL ABERTO",
        title1: "O FUTURO DO",
        title2: "QUANT TRADING.",
        desc: "Algoritmos proprietários projetados para o mercado moderno. Experimente execução de nível institucional com precisão de milissegundos.",
        getStarted: "COMEÇAR AGORA",
        viewStrategies: "VER ESTRATÉGIAS"
      },
      stats: {
        volume: "VOLUME NEGOCIADO",
        traders: "TRADERS ATIVOS",
        uptime: "SLA DE UPTIME",
        latency: "LATÊNCIA MÉDIA"
      },
      footer: {
        rights: "Todos os direitos reservados.",
        privacy: "Privacidade",
        terms: "Termos",
        disclaimer: "Aviso Financeiro"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;