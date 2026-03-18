import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'he', name: 'עברית' },
  { code: 'ar', name: 'العربية' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' }
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
        openAccount: "JOIN BRAXEL",
        dashboard: "DASHBOARD",
        logout: "SIGN OUT"
      },
      auth: {
        loginTitle: "Login",
        loginSubtitle: "Enter your access credentials.",
        registerTitle: "Create Account",
        registerSubtitle: "Start your journey in the institutional market.",
        email: "Email Address",
        password: "Password",
        fullName: "Full Name",
        forgotPassword: "Forgot password?",
        noAccount: "Don't have an account?",
        hasAccount: "Already have access?",
        btnAccess: "ACCESS ACCOUNT",
        btnCreate: "CREATE MY ACCOUNT",
        termsAgree: "I agree to the Terms and Privacy."
      },
      dashboard: {
        portfolio: "Portfolio",
        activeServices: "Active Services",
        newAllocation: "New Allocation",
        noServices: "No active investment plans found.",
        balance: "Current Balance",
        withdraw: "Withdrawal",
        liquidity: "Liquidity",
        requestWithdraw: "Request Withdrawal",
        selectAccount: "Select Account",
        amount: "Amount (USD)",
        iban: "IBAN / Bank Details",
        btnWithdraw: "SUBMIT WITHDRAWAL REQUEST",
        profile: "Profile Management",
        settings: "Settings",
        firstName: "First Name",
        lastName: "Last Name",
        saveChanges: "SAVE CHANGES"
      },
      checkout: {
        summary: "Order Summary",
        finalize: "Finalize your Allocation",
        managedCapital: "Managed Capital",
        total: "Total Amount",
        secure: "Secure Checkout",
        authRequired: "Authentication Required",
        authDesc: "Please login or create an account to link this investment plan to your profile.",
        btnLogin: "Login to Account",
        btnRegister: "Create New Account",
        loggedInAs: "Logged in as",
        btnPay: "Pay with PayPal"
      },
      hero: {
        title1: "ELITE ALGORITHMIC",
        title2: "CAPITAL MANAGEMENT.",
        desc: "Deploy institutional-grade quantitative strategies engineered for the modern market. Experience millisecond execution precision and advanced risk mitigation protocols.",
        getStarted: "EXPLORE INVESTMENT PLANS",
        viewStrategies: "TECHNICAL METHODOLOGY"
      },
      // ... (mantendo as outras traduções existentes)
      stats: { volume: "Total Managed Volume", traders: "Global Active Investors", uptime: "Infrastructure Uptime", latency: "Execution Precision" },
      methodology: { badge: "OUR EDGE", title: "QUANTITATIVE PRECISION", momentum: { title: "Dynamic Momentum Optimization", desc: "Our algorithms identify and exploit sustained price movements.", f1: "Multi-timeframe validation", f2: "Cross-asset correlation", f3: "Adaptive position scaling" }, volatility: { title: "Intelligent Volatility Shield", desc: "Advanced mathematical modeling that preserves capital.", f1: "Real-time VIX integration", f2: "Non-linear drawdown limits", f3: "Automated de-risking" }, risk: { title: "Systematic Risk Architecture", desc: "Rigorous institutional controls ensuring capital preservation.", f1: "Kelly Criterion optimization", f2: "Monte Carlo simulations", f3: "24/7 VaR monitoring" } },
      process_home: { badge: "THE ROADMAP", title: "FROM CAPITAL TO", subtitle: "ELITE PERFORMANCE", step1: { title: "Strategic Allocation", desc: "Select the institutional-grade plan." }, step2: { title: "Instant Integration", desc: "Our infrastructure syncs in milliseconds." }, step3: { title: "Algorithmic Deployment", desc: "High-frequency models execute trades." }, step4: { title: "Performance Analysis", desc: "Monitor every execution in real-time." }, step5: { title: "Capital Liquidity", desc: "Request profit withdrawals directly." } },
      cta_home: { badge: "LIMITED INSTITUTIONAL SLOTS", title: "READY TO OPTIMIZE", subtitle: "YOUR PORTFOLIO?", desc: "Join an exclusive network of global investors.", btn: "VIEW INVESTMENT PLANS", trust: "Protected by AES-256 Institutional Encryption." },
      pricing: { badge: "TRANSPARENCY", title: "CAPITAL", subtitle: "ALLOCATIONS", desc: "Institutional-grade infrastructure with a transparent fee structure.", select: "SECURE THIS PLAN", allocation: "MANAGED CAPITAL", month: "monthly fee" },
      about: { badge: "OUR LEGACY", title: "PIONEERING THE", subtitle: "QUANTITATIVE FRONTIER", desc: "Braxel Markets was founded on the principle of accessibility.", historyTitle: "OUR JOURNEY", historyDesc1: "Since 2026, we have been at the forefront of algorithmic trading.", historyDesc2: "Our team works tirelessly to maintain the most robust infrastructure.", stats: { founded: "Founded", users: "Active Users", uptime: "System Uptime", support: "Global Reach" }, values: { mission: "MISSION", missionDesc: "To democratize access to high-frequency trading.", vision: "VISION", visionDesc: "To become the global standard for automated investment.", values: "VALUES", valuesDesc: "Transparency, mathematical rigor, and commitment." } },
      howItWorks: { badge: "INFRASTRUCTURE", title: "HOW THE", subtitle: "ENGINE WORKS", desc: "Our ecosystem is designed for speed, security, and absolute transparency.", steps: [ { title: "Account Creation", desc: "Register your institutional profile." }, { title: "Plan Selection", desc: "Choose an allocation level." }, { title: "Secure Payment", desc: "Complete your subscription." }, { title: "API Integration", desc: "Our system generates a unique sub-account." }, { title: "Live Execution", desc: "Strategies begin executing immediately." }, { title: "Weekly Reporting", desc: "Receive detailed performance audits." } ], cta: "READY TO DEPLOY?", ctaBtn: "START ALLOCATION NOW" },
      contact: { badge: "SUPPORT", title: "INSTITUTIONAL", subtitle: "CONCIERGE", desc: "Our dedicated support team is available 24/7.", infoTitle: "DIRECT CHANNELS", formTitle: "SEND a MESSAGE", placeholders: { name: "FULL NAME", email: "EMAIL ADDRESS", subject: "SUBJECT", message: "YOUR MESSAGE" }, sendBtn: "SEND MESSAGE" }
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
        openAccount: "JUNTAR-SE À BRAXEL",
        dashboard: "PAINEL",
        logout: "SAIR"
      },
      auth: {
        loginTitle: "Login",
        loginSubtitle: "Insira suas credenciais de acesso.",
        registerTitle: "Criar Conta",
        registerSubtitle: "Comece sua jornada no mercado institucional.",
        email: "Endereço de E-mail",
        password: "Senha",
        fullName: "Nome Completo",
        forgotPassword: "Esqueceu a senha?",
        noAccount: "Não tem uma conta?",
        hasAccount: "Já possui acesso?",
        btnAccess: "ACESSAR CONTA",
        btnCreate: "CRIAR MINHA CONTA",
        termsAgree: "Eu concordo com os Termos e Privacidade."
      },
      dashboard: {
        portfolio: "Portfólio",
        activeServices: "Serviços Ativos",
        newAllocation: "Nova Alocação",
        noServices: "Nenhum plano de investimento ativo encontrado.",
        balance: "Saldo Atual",
        withdraw: "Saque",
        liquidity: "Liquidez",
        requestWithdraw: "Solicitar Saque",
        selectAccount: "Selecionar Conta",
        amount: "Valor (USD)",
        iban: "IBAN / Dados Bancários",
        btnWithdraw: "ENVIAR SOLICITAÇÃO DE SAQUE",
        profile: "Gestão de Perfil",
        settings: "Configurações",
        firstName: "Nome",
        lastName: "Sobrenome",
        saveChanges: "SALVAR ALTERAÇÕES"
      },
      checkout: {
        summary: "Resumo do Pedido",
        finalize: "Finalize sua Alocação",
        managedCapital: "Capital Gerenciado",
        total: "Valor Total",
        secure: "Checkout Seguro",
        authRequired: "Autenticação Necessária",
        authDesc: "Por favor, faça login ou crie uma conta para vincular este plano ao seu perfil.",
        btnLogin: "Fazer Login",
        btnRegister: "Criar Nova Conta",
        loggedInAs: "Logado como",
        btnPay: "Pagar com PayPal"
      },
      hero: {
        title1: "GESTÃO DE CAPITAL",
        title2: "ALGORÍTMICA DE ELITE.",
        desc: "Implemente estratégias quantitativas de nível institucional projetadas para o mercado moderno. Experimente precisão de execução em milissegundos.",
        getStarted: "EXPLORAR PLANOS DE INVESTIMENTO",
        viewStrategies: "METODOLOGIA TÉCNICA"
      },
      // ... (mantendo as outras traduções existentes)
      stats: { volume: "Volume Total Gerenciado", traders: "Investidores Ativos", uptime: "Uptime da Infraestrutura", latency: "Precisão de Execução" },
      methodology: { badge: "NOSSA VANTAGEM", title: "PRECISÃO QUANTITATIVA", momentum: { title: "Otimização de Momentum Dinâmico", desc: "Nossos algoritmos identificam e exploram movimentos de preços.", f1: "Validação multi-timeframe", f2: "Correlação entre ativos", f3: "Escalonamento adaptativo" }, volatility: { title: "Escudo de Volatilidade Inteligente", desc: "Modelagem matemática avançada que preserva o capital.", f1: "Integração VIX em tempo real", f2: "Limites de drawdown não lineares", f3: "Redução de risco automatizada" }, risk: { title: "Arquitetura de Risco Sistemático", desc: "Rigorosos controles institucionais garantindo a preservação do capital.", f1: "Otimização do Critério de Kelly", f2: "Simulações de Monte Carlo", f3: "Monitoramento VaR 24/7" } },
      process_home: { badge: "O ROTEIRO", title: "DO CAPITAL À", subtitle: "PERFORMANCE DE ELITE", step1: { title: "Alocação Estratégica", desc: "Selecione o plano de nível institucional." }, step2: { title: "Integração Instantânea", desc: "Nossa infraestrutura sincroniza em milissegundos." }, step3: { title: "Implementação Algorítmica", desc: "Modelos de alta frequência executam operações." }, step4: { title: "Análise de Performance", desc: "Monitore cada execução em tempo real." }, step5: { title: "Liquidez de Capital", desc: "Solicite saques de lucros diretamente." } },
      cta_home: { badge: "VAGAS INSTITUCIONAIS LIMITADAS", title: "PRONTO PARA OTIMIZAR", subtitle: "SEU PORTFÓLIO?", desc: "Junte-se a uma rede exclusiva de investidores globais.", btn: "VER PLANOS DE INVESTIMENTO", trust: "Protegido por Criptografia Institucional AES-256." },
      pricing: { badge: "TRANSPARÊNCIA", title: "ALOCAÇÕES DE", subtitle: "CAPITAL", desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.", select: "GARANTIR ESTE PLANO", allocation: "CAPITAL GERENCIADO", month: "taxa mensal" },
      about: { badge: "NOSSO LEGADO", title: "PIONEIRISMO NA", subtitle: "FRONTEIRA QUANTITATIVA", desc: "A Braxel Markets foi fundada no princípio da acessibilidade.", historyTitle: "NOSSA JORNADA", historyDesc1: "Desde 2026, estamos na vanguarda do trading algorítmico.", historyDesc2: "Nossa equipe trabalha incansavelmente para manter a infraestrutura mais robusta.", stats: { founded: "Fundada", users: "Usuários Ativos", uptime: "Uptime do Sistema", support: "Alcance Global" }, values: { mission: "MISSÃO", missionDesc: "Democratizar o acesso à infraestrutura de trading de alta frequência.", vision: "VISION", visionDesc: "Tornar-se o padrão global para tecnologia de investimento automatizada.", values: "VALORES", valuesDesc: "Transparência, rigor matemático e compromisso." } },
      howItWorks: { badge: "INFRAESTRUTURA", title: "COMO O", subtitle: "MOTOR FUNCIONA", desc: "Nosso ecossistema é projetado para velocidade, segurança e transparência absoluta.", steps: [ { title: "Criação de Conta", desc: "Registre seu perfil institucional." }, { title: "Seleção de Plano", desc: "Escolha um nível de alocação." }, { title: "Pagamento Seguro", desc: "Conclua sua assinatura." }, { title: "Integração de API", desc: "Nosso sistema gera uma subconta exclusiva." }, { title: "Execução ao Vivo", desc: "As estratégias começam a ser executadas imediatamente." }, { title: "Relatórios Semanais", desc: "Receba auditorias de desempenho detalhadas." } ], cta: "PRONTO PARA COMEÇAR?", ctaBtn: "INICIAR ALOCAÇÃO AGORA" },
      contact: { badge: "SUPORTE", title: "CONCIERGE", subtitle: "INSTITUCIONAL", desc: "Nossa equipe de suporte dedicada está disponível 24/7.", infoTitle: "CANAIS DIRETOS", formTitle: "ENVIE UMA MENSAGEM", placeholders: { name: "NOME COMPLETO", email: "ENDEREÇO DE E-MAIL", subject: "ASSUNTO", message: "SUA MENSAGEM" }, sendBtn: "ENVIAR MENSAGEM" }
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
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;