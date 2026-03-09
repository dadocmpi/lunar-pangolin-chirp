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
        volume: "Trading Volume",
        traders: "Active Traders",
        uptime: "System Uptime",
        latency: "Execution Latency"
      },
      methodology: {
        badge: "METHODOLOGY",
        title: "INSTITUTIONAL-GRADE STRATEGY",
        momentum: {
          title: "Momentum Strategy",
          desc: "We identify sustained price movements across multiple asset classes using advanced statistical analysis.",
          f1: "Multi-timeframe analysis",
          f2: "Correlation detection",
          f3: "Dynamic scaling"
        },
        volatility: {
          title: "Volatility Protection",
          desc: "Advanced modeling that protects capital during market turbulence by dynamically adjusting exposure.",
          f1: "Real-time VIX integration",
          f2: "Adaptive drawdown limits",
          f3: "De-risking protocols"
        },
        risk: {
          title: "Risk Management",
          desc: "Rigorous controls ensuring capital preservation through systematic portfolio optimization.",
          f1: "Kelly Criterion sizing",
          f2: "Monte Carlo stress tests",
          f3: "Daily VaR monitoring"
        }
      },
      infrastructure: {
        badge: "INFRASTRUCTURE",
        title: "GLOBAL CONNECTIVITY",
        desc: "Our servers are strategically located in the world's primary financial hubs to ensure the lowest possible latency.",
        london: "London (LD4)",
        newyork: "New York (NY4)",
        tokyo: "Tokyo (TY3)"
      },
      process_home: {
        badge: "THE PROCESS",
        title: "FROM CAPITAL TO",
        subtitle: "PERFORMANCE",
        step1: { title: "Select Allocation", desc: "Choose the institutional plan that fits your capital goals and complete the secure payment." },
        step2: { title: "Instant Activation", desc: "Our proprietary infrastructure connects to your account ID in milliseconds." },
        step3: { title: "Algorithmic Execution", desc: "High-frequency algorithms execute trades with optimized leverage and risk control." },
        step4: { title: "Real-time Monitoring", desc: "Track every operation and performance metric through your dedicated dashboard." },
        step5: { title: "Secure Returns", desc: "Request withdrawals of your profits directly to your bank account within 48 hours." }
      },
      cta_home: {
        badge: "SECURE YOUR SPOT",
        title: "READY TO ELEVATE",
        subtitle: "YOUR CAPITAL?",
        desc: "Join thousands of institutional investors and start your journey with our proprietary quantitative strategies today. Limited slots available for the current quarter.",
        btn: "GET STARTED NOW",
        trust: "Institutional-grade security guaranteed."
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
      pricing: {
        badge: "TRANSPARENCY",
        title: "INVESTMENT",
        subtitle: "PLANS",
        desc: "Clear cost structure with no hidden fees. Choose the ideal allocation for your capital.",
        select: "SELECT PLAN",
        allocation: "ALLOCATION",
        month: "month"
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
        login: "LOGIN",
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
        volume: "Volume de Negociação",
        traders: "Traders Ativos",
        uptime: "Uptime do Sistema",
        latency: "Latência de Execução"
      },
      methodology: {
        badge: "METODOLOGIA",
        title: "ESTRATÉGIA DE NÍVEL INSTITUCIONAL",
        momentum: {
          title: "Estratégia de Momentum",
          desc: "Identificamos movimentos de preços sustentados em várias classes de ativos usando análise estatística avançada.",
          f1: "Análise multi-timeframe",
          f2: "Detecção de correlação",
          f3: "Escalonamento dinâmico"
        },
        volatility: {
          title: "Proteção de Volatilidade",
          desc: "Modelagem avançada que protege o capital durante a turbulência do mercado, ajustando dinamicamente a exposição.",
          f1: "Integração VIX em tempo real",
          f2: "Limites de drawdown adaptativos",
          f3: "Protocolos de de-risking"
        },
        risk: {
          title: "Gestão de Risco",
          desc: "Controles rigorosos que garantem a preservação do capital através da otimização sistemática do portfólio.",
          f1: "Dimensionamento Kelly Criterion",
          f2: "Testes de estresse Monte Carlo",
          f3: "Monitoramento diário de VaR"
        }
      },
      infrastructure: {
        badge: "INFRAESTRUTURA",
        title: "CONECTIVIDADE GLOBAL",
        desc: "Nossos servidores estão estrategicamente localizados nos principais hubs financeiros do mundo para garantir a menor latência possível.",
        london: "Londres (LD4)",
        newyork: "Nova York (NY4)",
        tokyo: "Tóquio (TY3)"
      },
      process_home: {
        badge: "O PROCESSO",
        title: "DO CAPITAL À",
        subtitle: "PERFORMANCE",
        step1: { title: "Selecione a Alocação", desc: "Escolha o plano institucional que se adapta aos seus objetivos e complete o pagamento seguro." },
        step2: { title: "Ativação Instantânea", desc: "Nossa infraestrutura proprietária conecta sua conta em milissegundos." },
        step3: { title: "Execução Algorítmica", desc: "Algoritmos de alta frequência executam operações com alavancagem otimizada e controle de risco." },
        step4: { title: "Monitoramento em Tempo Real", desc: "Acompanhe cada operação e métrica de performance através do seu dashboard dedicado." },
        step5: { title: "Retornos Seguros", desc: "Solicite saques de seus lucros diretamente para sua conta bancária em até 48 horas." }
      },
      cta_home: {
        badge: "GARANTA SUA VAGA",
        title: "PRONTO PARA ELEVAR",
        subtitle: "SEU CAPITAL?",
        desc: "Junte-se a milhares de investidores institucionais e comece sua jornada com nossas estratégias quantitativas proprietárias hoje mesmo. Vagas limitadas para o trimestre atual.",
        btn: "COMEÇAR AGORA",
        trust: "Segurança de nível institucional garantida."
      },
      about: {
        badge: "INSTITUCIONAL",
        title: "SOBRE A",
        subtitle: "BRAXEL MARKETS",
        desc: "Nossa missão é democratizar o acesso a estratégias de investimento de nível institucional através da tecnologia.",
        historyTitle: "NOSSA HISTÓRIA",
        historyDesc1: "A Braxel Markets nasceu da visão de especialistas em finanças quantitativas que notaram a falta de acesso para investidores comuns a ferramentas de automação de alta performance.",
        historyDesc2: "Desde nossa fundação em Londres, construímos uma infraestrutura robusta e transparente que permite investir com a mesma precisão que grandes players institucionais.",
        stats: {
          founded: "FUNDADA",
          users: "USUÁRIOS",
          uptime: "UPTIME",
          support: "SUPORTE"
        },
        values: {
          mission: "MISSÃO",
          missionDesc: "Fornecer tecnologia de ponta para objetivos financeiros seguros.",
          vision: "VISION",
          visionDesc: "Ser o líder global em investimentos automatizados.",
          values: "VALORES",
          valuesDesc: "Integridade, transparência e inovação constante."
        }
      },
      howItWorks: {
        badge: "PROCESSO",
        title: "COMO",
        subtitle: "FUNCIONA",
        desc: "Um fluxo simples e transparente de seis etapas para você começar a investir com automação profissional.",
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
      pricing: {
        badge: "TRANSPARÊNCIA",
        title: "PLANOS DE",
        subtitle: "INVESTIMENTO",
        desc: "Estrutura de custos clara, sem taxas ocultas. Escolha a alocação ideal para o seu capital.",
        select: "SELECIONAR PLANO",
        allocation: "ALOCAÇÃO",
        month: "mês"
      },
      contact: {
        badge: "SUPORTE",
        title: "ENTRE EM",
        subtitle: "CONTATO",
        desc: "Estamos aqui para ajudar. Entre em contato para qualquer dúvida ou suporte especializado.",
        infoTitle: "INFORMAÇÃO",
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
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;