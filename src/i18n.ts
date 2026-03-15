import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Lista dos 20 idiomas mais falados (ISO codes)
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ar', name: 'العربية' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'mr', name: 'मराठी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ko', name: '한국어' },
  { code: 'fr', name: 'Français' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'it', name: 'Italiano' },
  { code: 'pl', name: 'Polski' }
];

const resources = {
  en: {
    translation: {
      nav: {
        pricing: "INVESTMENT PLANS",
        howItWorks: "THE INFRASTRUCTURE",
        about: "OUR LEGACY",
        contact: "INSTITUTIONAL SUPPORT",
        login: "TERMINAL ACCESS",
        openAccount: "JOIN BRAXEL"
      },
      // ... (mantendo o restante das traduções existentes)
      hero: {
        badge: "INSTITUTIONAL LIQUIDITY NOW ACCESSIBLE",
        title1: "ELITE ALGORITHMIC",
        title2: "CAPITAL MANAGEMENT.",
        desc: "Deploy institutional-grade quantitative strategies engineered for the modern market. Experience millisecond execution precision and advanced risk mitigation protocols.",
        getStarted: "EXPLORE INVESTMENT PLANS",
        viewStrategies: "TECHNICAL METHODOLOGY"
      },
      stats: {
        volume: "Total Managed Volume",
        traders: "Global Active Investors",
        uptime: "Infrastructure Uptime",
        latency: "Execution Precision"
      },
      methodology: {
        badge: "OUR EDGE",
        title: "QUANTITATIVE PRECISION",
        momentum: {
          title: "Dynamic Momentum Optimization",
          desc: "Our algorithms identify and exploit sustained price movements across global asset classes using high-dimensional statistical analysis.",
          f1: "Multi-timeframe validation",
          f2: "Cross-asset correlation",
          f3: "Adaptive position scaling"
        },
        volatility: {
          title: "Intelligent Volatility Shield",
          desc: "Advanced mathematical modeling that preserves capital during turbulence by dynamically recalibrating market exposure in real-time.",
          f1: "Real-time VIX integration",
          f2: "Non-linear drawdown limits",
          f3: "Automated de-risking"
        },
        risk: {
          title: "Systematic Risk Architecture",
          desc: "Rigorous institutional controls ensuring capital preservation through continuous portfolio optimization and stress testing.",
          f1: "Kelly Criterion optimization",
          f2: "Monte Carlo simulations",
          f3: "24/7 VaR monitoring"
        }
      },
      process_home: {
        badge: "THE ROADMAP",
        title: "FROM CAPITAL TO",
        subtitle: "ELITE PERFORMANCE",
        step1: { title: "Strategic Allocation", desc: "Select the institutional-grade plan that aligns with your financial goals and secure your spot." },
        step2: { title: "Instant Integration", desc: "Our proprietary infrastructure syncs with your unique account ID in milliseconds." },
        step3: { title: "Algorithmic Deployment", desc: "High-frequency models execute trades with optimized leverage and institutional risk parameters." },
        step4: { title: "Performance Analysis", desc: "Monitor every execution and metric in real-time through your professional dashboard." },
        step5: { title: "Capital Liquidity", desc: "Request profit withdrawals directly to your bank account with guaranteed 48-hour processing." }
      },
      cta_home: {
        badge: "LIMITED INSTITUTIONAL SLOTS",
        title: "READY TO OPTIMIZE",
        subtitle: "YOUR PORTFOLIO?",
        desc: "Join an exclusive network of global investors utilizing proprietary quantitative infrastructure. Secure your allocation for the current fiscal quarter.",
        btn: "VIEW INVESTMENT PLANS",
        trust: "Protected by AES-256 Institutional Encryption."
      },
      pricing: {
        badge: "TRANSPARENCY",
        title: "CAPITAL",
        subtitle: "ALLOCATIONS",
        desc: "Institutional-grade infrastructure with a transparent fee structure. No hidden costs, just pure performance.",
        select: "SECURE THIS PLAN",
        allocation: "MANAGED CAPITAL",
        month: "monthly fee"
      },
      about: {
        badge: "OUR LEGACY",
        title: "PIONEERING THE",
        subtitle: "QUANTITATIVE FRONTIER",
        desc: "Braxel Markets was founded on the principle that institutional-grade technology should be accessible to sophisticated investors worldwide.",
        historyTitle: "OUR JOURNEY",
        historyDesc1: "Since 2026, we have been at the forefront of algorithmic trading, developing proprietary models that navigate the complexities of global markets with surgical precision.",
        historyDesc2: "Our team of quantitative analysts and software engineers work tirelessly to maintain the most robust investment infrastructure in the industry.",
        stats: {
          founded: "Founded",
          users: "Active Users",
          uptime: "System Uptime",
          support: "Global Reach"
        },
        values: {
          mission: "MISSION",
          missionDesc: "To democratize access to high-frequency trading infrastructure and elite capital management.",
          vision: "VISION",
          visionDesc: "To become the global standard for automated institutional investment technology.",
          values: "VALUES",
          valuesDesc: "Transparency, mathematical rigor, and unwavering commitment to capital preservation."
        }
      },
      howItWorks: {
        badge: "INFRASTRUCTURE",
        title: "HOW THE",
        subtitle: "ENGINE WORKS",
        desc: "Our ecosystem is designed for speed, security, and absolute transparency. Here is how we manage your capital.",
        steps: [
          { title: "Account Creation", desc: "Register your institutional profile and complete our security verification process." },
          { title: "Plan Selection", desc: "Choose an allocation level that fits your risk profile and investment objectives." },
          { title: "Secure Payment", desc: "Complete your subscription using our encrypted payment gateways." },
          { title: "API Integration", desc: "Our system generates a unique sub-account linked to our master algorithmic core." },
          { title: "Live Execution", desc: "Strategies begin executing immediately across global liquidity pools." },
          { title: "Weekly Reporting", desc: "Receive detailed performance audits and risk metrics every weekend." }
        ],
        cta: "READY TO DEPLOY?",
        ctaBtn: "START ALLOCATION NOW"
      },
      contact: {
        badge: "SUPPORT",
        title: "INSTITUTIONAL",
        subtitle: "CONCIERGE",
        desc: "Our dedicated support team is available 24/7 to assist with technical inquiries and account management.",
        infoTitle: "DIRECT CHANNELS",
        formTitle: "SEND a MESSAGE",
        placeholders: {
          name: "FULL NAME",
          email: "EMAIL ADDRESS",
          subject: "SUBJECT",
          message: "YOUR MESSAGE"
        },
        sendBtn: "SEND MESSAGE"
      }
    }
  },
  pt: {
    translation: {
      nav: {
        pricing: "PLANOS DE INVESTIMENTO",
        howItWorks: "INFRAESTRUTURA",
        about: "NOSSO LEGADO",
        contact: "SUPORTE INSTITUCIONAL",
        login: "ACESSO AO TERMINAL",
        openAccount: "JUNTAR-SE À BRAXEL"
      },
      hero: {
        badge: "LIQUIDEZ INSTITUCIONAL AGORA ACESSÍVEL",
        title1: "GESTÃO DE CAPITAL",
        title2: "ALGORÍTMICA DE ELITE.",
        desc: "Implemente estratégias quantitativas de nível institucional projetadas para o mercado moderno. Experimente precisão de execução em milissegundos e protocolos avançados de mitigação de risco.",
        getStarted: "EXPLORAR PLANOS DE INVESTIMENTO",
        viewStrategies: "METODOLOGIA TÉCNICA"
      },
      stats: {
        volume: "Volume Total Gerenciado",
        traders: "Investidores Ativos",
        uptime: "Uptime da Infraestrutura",
        latency: "Precisão de Execução"
      },
      methodology: {
        badge: "NOSSA VANTAGEM",
        title: "PRECISÃO QUANTITATIVA",
        momentum: {
          title: "Otimização de Momentum Dinâmico",
          desc: "Nossos algoritmos identificam e exploram movimentos de preços sustentados em classes de ativos globais usando análise estatística de alta dimensão.",
          f1: "Validação multi-timeframe",
          f2: "Correlação entre ativos",
          f3: "Escalonamento adaptativo"
        },
        volatility: {
          title: "Escudo de Volatilidade Inteligente",
          desc: "Modelagem matemática avançada que preserva o capital durante turbulências, recalibrando dinamicamente a exposição ao mercado em tempo real.",
          f1: "Integração VIX em tempo real",
          f2: "Limites de drawdown não lineares",
          f3: "Redução de risco automatizada"
        },
        risk: {
          title: "Arquitetura de Risco Sistemático",
          desc: "Rigorosos controles institucionais garantindo a preservação do capital através de otimização contínua de portfólio e testes de estresse.",
          f1: "Otimização do Critério de Kelly",
          f2: "Simulações de Monte Carlo",
          f3: "Monitoramento VaR 24/7"
        }
      },
      process_home: {
        badge: "O ROTEIRO",
        title: "DO CAPITAL À",
        subtitle: "PERFORMANCE DE ELITE",
        step1: { title: "Alocação Estratégica", desc: "Selecione o plano de nível institucional que se alinha aos seus objetivos financeiros e garanta sua vaga." },
        step2: { title: "Integração Instantânea", desc: "Nossa infraestrutura proprietária sincroniza com seu ID de conta exclusivo em milissegundos." },
        step3: { title: "Implementação Algorítmica", desc: "Modelos de alta frequência executam operações com alavancagem otimizada e parâmetros de risco institucionais." },
        step4: { title: "Análise de Performance", desc: "Monitore cada execução e métrica em tempo real através do seu dashboard profissional." },
        step5: { title: "Liquidez de Capital", desc: "Solicite saques de lucros diretamente para sua conta bancária com processamento garantido em 48 horas." }
      },
      cta_home: {
        badge: "VAGAS INSTITUCIONAIS LIMITADAS",
        title: "PRONTO PARA OTIMIZAR",
        subtitle: "SEU PORTFÓLIO?",
        desc: "Junte-se a uma rede exclusiva de investidores globais utilizando infraestrutura quantitativa proprietária. Garanta sua alocação para o trimestre fiscal atual.",
        btn: "VER PLANOS DE INVESTIMENTO",
        trust: "Protegido por Criptografia Institucional AES-256."
      },
      pricing: {
        badge: "TRANSPARÊNCIA",
        title: "ALOCAÇÕES DE",
        subtitle: "CAPITAL",
        desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente. Sem custos ocultos, apenas performance pura.",
        select: "GARANTIR ESTE PLANO",
        allocation: "CAPITAL GERENCIADO",
        month: "taxa mensal"
      },
      about: {
        badge: "NOSSO LEGADO",
        title: "PIONEIRISMO NA",
        subtitle: "FRONTEIRA QUANTITATIVA",
        desc: "A Braxel Markets foi fundada no princípio de que a tecnologia de nível institucional deve ser acessível a investidores sofisticados em todo o mundo.",
        historyTitle: "NOSSA JORNADA",
        historyDesc1: "Desde 2026, estamos na vanguarda do trading algorítmico, desenvolvendo modelos proprietários que navegam pelas complexidades dos mercados globais com precisão cirúrgica.",
        historyDesc2: "Nossa equipe de analistas quantitativos e engenheiros de software trabalha incansavelmente para manter a infraestrutura de investimento mais robusta do setor.",
        stats: {
          founded: "Fundada",
          users: "Usuários Ativos",
          uptime: "Uptime do Sistema",
          support: "Alcance Global"
        },
        values: {
          mission: "MISSÃO",
          missionDesc: "Democratizar o acesso à infraestrutura de trading de alta frequência e gestão de capital de elite.",
          vision: "VISÃO",
          visionDesc: "Tornar-se o padrão global para tecnologia de investimento institucional automatizada.",
          values: "VALORES",
          valuesDesc: "Transparência, rigor matemático e compromisso inabalável com a preservação do capital."
        }
      },
      howItWorks: {
        badge: "INFRAESTRUTURA",
        title: "COMO O",
        subtitle: "MOTOR FUNCIONA",
        desc: "Nosso ecossistema é projetado para velocidade, segurança e transparência absoluta. Veja como gerenciamos seu capital.",
        steps: [
          { title: "Criação de Conta", desc: "Registre seu perfil institucional e complete nosso processo de verificação de segurança." },
          { title: "Seleção de Plano", desc: "Escolha um nível de alocação que se adapte ao seu perfil de risco e objetivos de investimento." },
          { title: "Pagamento Seguro", desc: "Conclua sua assinatura usando nossos gateways de pagamento criptografados." },
          { title: "Integração de API", desc: "Nosso sistema gera uma subconta exclusiva vinculada ao nosso núcleo algorítmico mestre." },
          { title: "Execução ao Vivo", desc: "As estratégias começam a ser executadas imediatamente em pools de liquidez globais." },
          { title: "Relatórios Semanais", desc: "Receba auditorias de desempenho detalhadas e métricas de risco todo final de semana." }
        ],
        cta: "PRONTO PARA COMEÇAR?",
        ctaBtn: "INICIAR ALOCAÇÃO AGORA"
      },
      contact: {
        badge: "SUPORTE",
        title: "CONCIERGE",
        subtitle: "INSTITUCIONAL",
        desc: "Nossa equipe de suporte dedicada está disponível 24 horas por dia, 7 dias por semana para ajudar com consultas técnicas e gestão de conta.",
        infoTitle: "CANAIS DIRETOS",
        formTitle: "ENVIE UMA MENSAGEM",
        placeholders: {
          name: "NOME COMPLETO",
          email: "ENDEREÇO DE E-MAIL",
          subject: "ASSUNTO",
          message: "SUA MENSAGEM"
        },
        sendBtn: "ENVIAR MENSAGEM"
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