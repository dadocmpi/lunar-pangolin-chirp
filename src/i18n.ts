import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        pricing: "INVESTMENT PLANS",
        howItWorks: "INFRASTRUCTURE",
        about: "OUR LEGACY",
        contact: "INSTITUTIONAL SUPPORT",
        login: "CLIENT ACCESS",
        openAccount: "ESTABLISH ALLOCATION"
      },
      hero: {
        badge: "SYSTEMATIC CAPITAL ALLOCATION",
        title1: "QUANTITATIVE",
        title2: "INFRASTRUCTURE.",
        desc: "Braxel Markets provides the technological framework for institutional-grade systematic strategies. Engineered for precision, stability, and absolute transparency in global markets.",
        getStarted: "VIEW ALLOCATIONS",
        viewStrategies: "TECHNICAL FRAMEWORK"
      },
      stats: {
        volume: "AUM & Volume",
        traders: "Institutional Clients",
        uptime: "System Availability",
        latency: "Execution Latency"
      },
      methodology: {
        badge: "METHODOLOGY",
        title: "MATHEMATICAL RIGOR",
        momentum: {
          title: "Systematic Momentum",
          desc: "Proprietary models identifying sustained price vectors through high-dimensional statistical analysis and multi-factor validation.",
          f1: "Statistical Arbitrage",
          f2: "Cross-Asset Correlation",
          f3: "Dynamic Exposure"
        },
        volatility: {
          title: "Risk Mitigation",
          desc: "Advanced mathematical frameworks designed to preserve capital during market turbulence through real-time recalibration.",
          f1: "Non-Linear Drawdown Limits",
          f2: "Automated De-Risking",
          f3: "Volatility Clustering Analysis"
        },
        risk: {
          title: "Portfolio Architecture",
          desc: "Rigorous institutional controls ensuring capital preservation through continuous optimization and stress testing.",
          f1: "Kelly Criterion Optimization",
          f2: "Monte Carlo Simulations",
          f3: "24/7 VaR Monitoring"
        }
      },
      process_home: {
        badge: "FRAMEWORK",
        title: "FROM CAPITAL TO",
        subtitle: "PERFORMANCE",
        step1: { title: "Strategic Selection", desc: "Identify the allocation tier that aligns with your institutional objectives and risk parameters." },
        step2: { title: "Secure Integration", desc: "Our infrastructure establishes a unique sub-account linked to our core algorithmic engine." },
        step3: { title: "Systematic Deployment", desc: "High-frequency models execute trades with optimized leverage and institutional risk controls." },
        step4: { title: "Real-Time Auditing", desc: "Monitor every execution and performance metric through our proprietary client dashboard." },
        step5: { title: "Capital Liquidity", desc: "Request profit distributions directly to your verified bank account with 48-hour settlement." }
      },
      cta_home: {
        badge: "INSTITUTIONAL ACCESS",
        title: "OPTIMIZE YOUR",
        subtitle: "CAPITAL ALLOCATION",
        desc: "Join a network of global investors utilizing proprietary quantitative infrastructure. Secure your allocation for the current fiscal quarter.",
        btn: "ESTABLISH ALLOCATION",
        trust: "Secured by AES-256 Institutional Encryption Standards."
      },
      pricing: {
        badge: "ALLOCATIONS",
        title: "INVESTMENT",
        subtitle: "TIERS",
        desc: "Institutional-grade infrastructure with a transparent fee structure. Engineered for performance and capital preservation.",
        select: "SELECT TIER",
        allocation: "MANAGED CAPITAL",
        month: "management fee"
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
        login: "ACESSO CLIENTE",
        openAccount: "ESTABELECER ALOCAÇÃO"
      },
      hero: {
        badge: "ALOCAÇÃO SISTEMÁTICA DE CAPITAL",
        title1: "INFRAESTRUTURA",
        title2: "QUANTITATIVA.",
        desc: "A Braxel Markets fornece a estrutura tecnológica para estratégias sistemáticas de nível institucional. Projetada para precisão, estabilidade e transparência absoluta nos mercados globais.",
        getStarted: "VER ALOCAÇÕES",
        viewStrategies: "ESTRUTURA TÉCNICA"
      },
      stats: {
        volume: "AUM & Volume",
        traders: "Clientes Institucionais",
        uptime: "Disponibilidade do Sistema",
        latency: "Latência de Execução"
      },
      methodology: {
        badge: "METODOLOGIA",
        title: "RIGOR MATEMÁTICO",
        momentum: {
          title: "Momentum Sistemático",
          desc: "Modelos proprietários identificando vetores de preço sustentados através de análise estatística de alta dimensão e validação multifatorial.",
          f1: "Arbitragem Estatística",
          f2: "Correlação entre Ativos",
          f3: "Exposição Dinâmica"
        },
        volatility: {
          title: "Mitigação de Risco",
          desc: "Estruturas matemáticas avançadas projetadas para preservar o capital durante turbulências de mercado através de recalibração em tempo real.",
          f1: "Limites de Drawdown Não Lineares",
          f2: "Desalavancagem Automática",
          f3: "Análise de Agrupamento de Volatilidade"
        },
        risk: {
          title: "Arquitetura de Portfólio",
          desc: "Rigorosos controles institucionais garantindo a preservação do capital através de otimização contínua e testes de estresse.",
          f1: "Otimização do Critério de Kelly",
          f2: "Simulações de Monte Carlo",
          f3: "Monitoramento VaR 24/7"
        }
      },
      process_home: {
        badge: "ESTRUTURA",
        title: "DO CAPITAL À",
        subtitle: "PERFORMANCE",
        step1: { title: "Seleção Estratégica", desc: "Identifique o nível de alocação que se alinha aos seus objetivos institucionais e parâmetros de risco." },
        step2: { title: "Integração Segura", desc: "Nossa infraestrutura estabelece uma subconta exclusiva vinculada ao nosso motor algorítmico central." },
        step3: { title: "Implementação Sistemática", desc: "Modelos de alta frequência executam operações com alavancagem otimizada e controles de risco institucionais." },
        step4: { title: "Auditoria em Tempo Real", desc: "Monitore cada execução e métrica de desempenho através do nosso dashboard proprietário." },
        step5: { title: "Liquidez de Capital", desc: "Solicite distribuições de lucro diretamente para sua conta bancária verificada com liquidação em 48 horas." }
      },
      cta_home: {
        badge: "ACESSO INSTITUCIONAL",
        title: "OTIMIZE SUA",
        subtitle: "ALOCAÇÃO DE CAPITAL",
        desc: "Junte-se a uma rede de investidores globais utilizando infraestrutura quantitativa proprietária. Garanta sua alocação para o trimestre fiscal atual.",
        btn: "ESTABELECER ALOCAÇÃO",
        trust: "Protegido por Padrões de Criptografia Institucional AES-256."
      },
      pricing: {
        badge: "ALOCAÇÕES",
        title: "NÍVEIS DE",
        subtitle: "INVESTIMENTO",
        desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente. Projetada para performance e preservação de capital.",
        select: "SELECIONAR NÍVEL",
        allocation: "CAPITAL GERENCIADO",
        month: "taxa de gestão"
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