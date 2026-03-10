import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        pricing: "INVESTMENT PLANS",
        howItWorks: "THE INFRASTRUCTURE",
        about: "OUR LEGACY",
        contact: "INSTITUTIONAL SUPPORT",
        login: "CLIENT ACCESS",
        openAccount: "JOIN BRAXEL"
      },
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
        step1: { title: "Strategic Allocation", desc: "Select the institutional-grade plan that aligns with your financial objectives and secure your slot." },
        step2: { title: "Instant Integration", desc: "Our proprietary infrastructure synchronizes with your unique account ID in milliseconds." },
        step3: { title: "Algorithmic Deployment", desc: "High-frequency models execute trades with optimized leverage and institutional risk parameters." },
        step4: { title: "Performance Analytics", desc: "Monitor every execution and real-time metric through your professional-grade dashboard." },
        step5: { title: "Capital Liquidity", desc: "Request profit withdrawals directly to your bank account with guaranteed 48-hour processing." }
      },
      cta_home: {
        badge: "LIMITED INSTITUTIONAL SLOTS",
        title: "READY TO OPTIMIZE",
        subtitle: "YOUR PORTFOLIO?",
        desc: "Join an exclusive network of global investors utilizing proprietary quantitative infrastructure. Secure your allocation for the current fiscal quarter.",
        btn: "VIEW INVESTMENT PLANS",
        trust: "Secured by AES-256 Institutional Encryption."
      },
      pricing: {
        badge: "TRANSPARENCY",
        title: "CAPITAL",
        subtitle: "ALLOCATIONS",
        desc: "Institutional-grade infrastructure with a transparent fee structure. No hidden costs, just pure performance.",
        select: "SECURE THIS PLAN",
        allocation: "MANAGED CAPITAL",
        month: "monthly fee"
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
        traders: "Investidores Ativos Globais",
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
          f3: "De-risking automatizado"
        },
        risk: {
          title: "Arquitetura de Risco Sistemático",
          desc: "Controles institucionais rigorosos que garantem a preservação do capital através da otimização contínua do portfólio e testes de estresse.",
          f1: "Otimização Kelly Criterion",
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