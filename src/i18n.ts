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
      about: {
        badge: "INSTITUCIONAL",
        title: "SOBRE A",
        subtitle: "BRAXEL MARKETS",
        desc: "Nossa missão é democratizar o acesso a estratégias de investimento de nível institucional através da tecnologia.",
        historyTitle: "NOSSA HISTÓRIA",
        historyDesc1: "A Braxel Markets nasceu da visão de especialistas em finanças quantitativas que perceberam a falta de acesso do investidor comum a ferramentas de automação de alta performance.",
        historyDesc2: "Desde nossa fundação em Londres, construímos uma infraestrutura robusta e transparente que permite investir com a mesma precisão dos grandes players institucionais.",
        stats: {
          founded: "FUNDAÇÃO",
          users: "USUÁRIOS",
          uptime: "UPTIME",
          support: "SUPORTE"
        },
        values: {
          mission: "MISSÃO",
          missionDesc: "Prover tecnologia de ponta para objetivos financeiros seguros.",
          vision: "VISÃO",
          visionDesc: "Ser a plataforma líder global em investimentos automatizados.",
          values: "VALORES",
          valuesDesc: "Integridade, transparência e inovação constante."
        }
      },
      howItWorks: {
        badge: "PROCESSO",
        title: "COMO",
        subtitle: "FUNCIONA",
        desc: "Um fluxo simples e transparente em seis etapas para você começar a investir com automação profissional.",
        steps: [
          { title: "Registro", desc: "Processo rápido e seguro." },
          { title: "Plano", desc: "Escolha sua alocação ideal." },
          { title: "Pagamento", desc: "Processamento via PayPal." },
          { title: "Ativação", desc: "Receba seu ID de conta." },
          { title: "Saques", desc: "Solicitações em EUR." },
          { title: "Relatórios", desc: "Resumos semanais por e-mail." }
        ],
        cta: "Pronto para o primeiro passo?",
        ctaBtn: "CRIAR MINHA CONTA"
      },
      contact: {
        badge: "SUPORTE",
        title: "ENTRE EM",
        subtitle: "CONTATO",
        desc: "Estamos aqui para ajudar. Entre em contato conosco para qualquer dúvida ou suporte especializado.",
        infoTitle: "INFORMAÇÕES",
        formTitle: "ENVIE UMA MENSAGEM",
        placeholders: {
          name: "NOME",
          email: "E-MAIL",
          subject: "ASSUNTO",
          message: "MENSAGEM"
        },
        sendBtn: "ENVIAR MENSAGEM"
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