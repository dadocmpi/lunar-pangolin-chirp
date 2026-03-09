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
      about: {
        badge: "INSTITUTIONAL",
        title: "ABOUT",
        subtitle: "BRAXEL MARKETS",
        desc: "Our mission is to democratize access to institutional-grade investment strategies through technology.",
        historyTitle: "OUR HISTORY",
        historyDesc1: "Braxel Markets was born from the vision of quantitative finance experts who noticed the lack of access for common investors to high-performance automation tools.",
        historyDesc2: "Since our founding in London, we have built a robust and transparent infrastructure that allows investing with the same precision as large institutional players.",
        stats: {
          founded: "FOUNDED",
          users: "USERS",
          uptime: "UPTIME",
          support: "SUPPORT"
        },
        values: {
          mission: "MISSION",
          missionDesc: "Provide cutting-edge technology for secure financial goals.",
          vision: "VISION",
          visionDesc: "To be the global leader in automated investments.",
          values: "VALUES",
          valuesDesc: "Integrity, transparency, and constant innovation."
        }
      },
      howItWorks: {
        badge: "PROCESS",
        title: "HOW IT",
        subtitle: "WORKS",
        desc: "A simple and transparent six-step flow for you to start investing with professional automation.",
        steps: [
          { title: "Registration", desc: "Fast and secure process." },
          { title: "Plan", desc: "Choose your ideal allocation." },
          { title: "Payment", desc: "Processing via PayPal." },
          { title: "Activation", desc: "Receive your account ID." },
          { title: "Withdrawals", desc: "Requests in EUR." },
          { title: "Reports", desc: "Weekly email summaries." }
        ],
        cta: "Ready for the first step?",
        ctaBtn: "CREATE MY ACCOUNT"
      },
      contact: {
        badge: "SUPPORT",
        title: "GET IN",
        subtitle: "CONTACT",
        desc: "We are here to help. Contact us for any questions or specialized support.",
        infoTitle: "INFORMATION",
        formTitle: "SEND A MESSAGE",
        placeholders: {
          name: "NAME",
          email: "EMAIL",
          subject: "SUBJECT",
          message: "MESSAGE"
        },
        sendBtn: "SEND MESSAGE"
      },
      footer: {
        rights: "All rights reserved.",
        privacy: "Privacy",
        terms: "Terms",
        disclaimer: "Financial Disclaimer"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Force English
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;