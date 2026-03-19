import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
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
      stats: { volume: "Volume Total Gerenciado", traders: "Investidores Ativos", uptime: "Uptime da Infraestrutura", latency: "Precisão de Execução" },
      methodology: { badge: "NOSSA VANTAGEM", title: "PRECISÃO QUANTITATIVA", momentum: { title: "Otimização de Momentum Dinâmico", desc: "Nossos algoritmos identificam e exploram movimentos de preços.", f1: "Validação multi-timeframe", f2: "Correlação entre ativos", f3: "Escalonamento adaptativo" }, volatility: { title: "Escudo de Volatilidade Inteligente", desc: "Modelagem matemática avançada que preserva o capital.", f1: "Integração VIX em tempo real", f2: "Limites de drawdown não lineares", f3: "Redução de risco automatizada" }, risk: { title: "Arquitetura de Risco Sistemático", desc: "Rigorosos controles institucionais garantindo a preservação do capital.", f1: "Otimização do Critério de Kelly", f2: "Simulações de Monte Carlo", f3: "Monitoramento VaR 24/7" } },
      process_home: { badge: "O ROTEIRO", title: "DO CAPITAL À", subtitle: "PERFORMANCE DE ELITE", step1: { title: "Alocação Estratégica", desc: "Selecione o plano de nível institucional." }, step2: { title: "Integração Instantânea", desc: "Nossa infraestrutura sincroniza em milissegundos." }, step3: { title: "Implementação Algorítmica", desc: "Modelos de alta frequência executam operações." }, step4: { title: "Análise de Performance", desc: "Monitore cada execução em tempo real." }, step5: { title: "Liquidez de Capital", desc: "Solicite saques de lucros diretamente." } },
      cta_home: { badge: "VAGAS INSTITUCIONAIS LIMITADAS", title: "PRONTO PARA OTIMIZAR", subtitle: "SEU PORTFÓLIO?", desc: "Junte-se a uma rede exclusiva de investidores globais.", btn: "VER PLANOS DE INVESTIMENTO", trust: "Protegido por Criptografia Institucional AES-256." },
      pricing: { badge: "TRANSPARÊNCIA", title: "ALOCAÇÕES DE", subtitle: "CAPITAL", desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.", select: "GARANTIR ESTE PLANO", allocation: "CAPITAL GERENCIADO", month: "taxa mensal" },
      about: { badge: "NOSSO LEGADO", title: "PIONEIRISMO NA", subtitle: "FRONTEIRA QUANTITATIVA", desc: "A Braxel Markets foi fundada no princípio da acessibilidade.", historyTitle: "NOSSA JORNADA", historyDesc1: "Desde 2026, estamos na vanguarda do trading algorítmico.", historyDesc2: "Nossa equipe trabalha incansavelmente para manter a infraestrutura mais robusta.", stats: { founded: "Fundada", users: "Usuários Ativos", uptime: "Uptime do Sistema", support: "Alcance Global" }, values: { mission: "MISSÃO", missionDesc: "Democratizar o acesso à infraestrutura de trading de alta frequência.", vision: "VISION", visionDesc: "Tornar-se o padrão global para tecnologia de investimento automatizada.", values: "VALORES", valuesDesc: "Transparência, rigor matemático e compromisso." } },
      howItWorks: { badge: "INFRAESTRUTURA", title: "COMO O", subtitle: "MOTOR FUNCIONA", desc: "Nosso ecossistema é projetado para velocidade, segurança e transparência absoluta.", steps: [ { title: "Criação de Conta", desc: "Registre seu perfil institucional." }, { title: "Seleção de Plano", desc: "Escolha um nível de alocação." }, { title: "Pagamento Seguro", desc: "Conclua sua assinatura." }, { title: "Integração de API", desc: "Nosso sistema gera uma subconta exclusiva." }, { title: "Execução ao Vivo", desc: "As estratégias começam a ser executadas imediatamente." }, { title: "Relatórios Semanais", desc: "Receba auditorias de desempenho detalhadas." } ], cta: "PRONTO PARA COMEÇAR?", ctaBtn: "INICIAR ALOCAÇÃO AGORA" },
      contact: { badge: "SUPORTE", title: "CONCIERGE", subtitle: "INSTITUCIONAL", desc: "Nossa equipe de suporte dedicada está disponível 24/7.", infoTitle: "CANAIS DIRETOS", formTitle: "ENVIE UMA MENSAGEM", placeholders: { name: "NOME COMPLETO", email: "ENDEREÇO DE E-MAIL", subject: "ASSUNTO", message: "SUA MENSAGEM" }, sendBtn: "ENVIAR MENSAGEM" }
    }
  },
  it: {
    translation: {
      nav: {
        pricing: "PIANI DI INVESTIMENTO",
        howItWorks: "INFRASTRUTTURA",
        about: "LA NOSTRA EREDITÀ",
        contact: "SUPPORTO ISTITUZIONALE",
        login: "ACCESSO TERMINALE",
        openAccount: "UNISCITI A BRAXEL",
        dashboard: "DASHBOARD",
        logout: "DISCONNETTI"
      },
      auth: {
        loginTitle: "Accesso",
        loginSubtitle: "Inserisci le tue credenziali di accesso.",
        registerTitle: "Crea Account",
        registerSubtitle: "Inizia il tuo viaggio nel mercato istituzionale.",
        email: "Indirizzo Email",
        password: "Password",
        fullName: "Nome Completo",
        forgotPassword: "Password dimenticata?",
        noAccount: "Non hai un account?",
        hasAccount: "Hai già l'accesso?",
        btnAccess: "ACCEDI ALL'ACCOUNT",
        btnCreate: "CREA IL MIO ACCOUNT",
        termsAgree: "Accetto i Termini e la Privacy."
      },
      dashboard: {
        portfolio: "Portafoglio",
        activeServices: "Servizi Attivi",
        newAllocation: "Nuova Allocazione",
        noServices: "Nessun piano di investimento attivo trovato.",
        balance: "Saldo Attuale",
        withdraw: "Prelievo",
        liquidity: "Liquidità",
        requestWithdraw: "Richiedi Prelievo",
        selectAccount: "Seleziona Account",
        amount: "Importo (USD)",
        iban: "IBAN / Dati Bancari",
        btnWithdraw: "INVIA RICHIESTA DI PRELIEVO",
        profile: "Gestione Profilo",
        settings: "Impostazioni",
        firstName: "Nome",
        lastName: "Cognome",
        saveChanges: "SALVA MODIFICHE"
      },
      checkout: {
        summary: "Riepilogo Ordine",
        finalize: "Finalizza la tua Allocazione",
        managedCapital: "Capitale Gestito",
        total: "Importo Totale",
        secure: "Checkout Sicuro",
        authRequired: "Autenticazione Richiesta",
        authDesc: "Accedi o crea un account per collegare questo piano al tuo profilo.",
        btnLogin: "Accedi all'Account",
        btnRegister: "Crea Nuovo Account",
        loggedInAs: "Connesso come",
        btnPay: "Paga con PayPal"
      },
      hero: {
        title1: "GESTIONE CAPITALE",
        title2: "ALGORITMICA D'ELITE.",
        desc: "Implementa strategie quantitative di livello istituzionale progettate per il mercato moderno. Sperimenta la precisione di esecuzione in millisecondi.",
        getStarted: "ESPLORA I PIANI DI INVESTIMENTO",
        viewStrategies: "METODOLOGIA TECNICA"
      },
      stats: { volume: "Volume Totale Gestito", traders: "Investitori Attivi", uptime: "Uptime Infrastruttura", latency: "Precisione Esecuzione" },
      methodology: { badge: "IL NOSTRO VANTAGGIO", title: "PRECISIONE QUANTITATIVA", momentum: { title: "Ottimizzazione Momentum Dinamico", desc: "I nostri algoritmi identificano e sfruttano i movimenti dei prezzi.", f1: "Validazione multi-timeframe", f2: "Correlazione cross-asset", f3: "Scaling adattivo" }, volatility: { title: "Scudo Volatilità Intelligente", desc: "Modellazione matematica avanzada che preserva il capitale.", f1: "Integrazione VIX in tempo reale", f2: "Limiti drawdown non lineari", f3: "De-risking automatizzato" }, risk: { title: "Architettura Rischio Sistematico", desc: "Rigorosi controlli istituzionali per la preservazione del capitale.", f1: "Ottimizzazione Criterio di Kelly", f2: "Simulazioni Monte Carlo", f3: "Monitoraggio VaR 24/7" } },
      process_home: { badge: "LA ROADMAP", title: "DAL CAPITALE ALLA", subtitle: "PERFORMANCE D'ELITE", step1: { title: "Allocazione Strategica", desc: "Seleziona il piano istituzionale." }, step2: { title: "Integrazione Istantanea", desc: "La nostra infrastruttura si sincronizza in millisecondi." }, step3: { title: "Distribuzione Algoritmica", desc: "Modelli ad alta frequenza eseguono operazioni." }, step4: { title: "Analisi Performance", desc: "Monitora ogni esecuzione in tempo reale." }, step5: { title: "Liquidità Capitale", desc: "Richiedi prelievi di profitto direttamente." } },
      cta_home: { badge: "POSTI ISTITUZIONALI LIMITATI", title: "PRONTO A OTTIMIZZARE", subtitle: "IL TUO PORTAFOGLIO?", desc: "Unisciti a una rete esclusiva di investitori globali.", btn: "VEDI PIANI DI INVESTIMENTO", trust: "Protetto da Crittografia Istituzionale AES-256." },
      pricing: { badge: "TRASPARENZA", title: "ALLOCAZIONI DI", subtitle: "CAPITALE", desc: "Infrastruttura istituzionale con una struttura commissionale trasparente.", select: "ASSICURA QUESTO PIANO", allocation: "CAPITALE GESTITO", month: "canone mensile" },
      about: { badge: "LA NOSTRA EREDITÀ", title: "PIONIERI NELLA", subtitle: "FRONTIERA QUANTITATIVA", desc: "Braxel Markets è stata fondata sul principio dell'accessibilità.", historyTitle: "IL NOSTRO VIAGGIO", historyDesc1: "Dal 2026, siamo all'avanguardia nel trading algoritmico.", historyDesc2: "Il nostro team lavora instancabilmente per mantenere l'infrastruttura più robusta.", stats: { founded: "Fondato", users: "Utenti Attivi", uptime: "Uptime Sistema", support: "Portata Globale" }, values: { mission: "MISSIONE", missionDesc: "Democratizzare l'accesso al trading ad alta frequenza.", vision: "VISIONE", visionDesc: "Diventare lo standard globale per gli investimenti automatizzati.", values: "VALORI", valuesDesc: "Trasparenza, rigore matematico e impegno." } },
      howItWorks: { badge: "INFRASTRUTTURA", title: "COME FUNZIONA", subtitle: "IL MOTORE", desc: "Il nostro ecosistema è progettato per velocità, sicurezza e trasparenza assoluta.", steps: [ { title: "Creazione Account", desc: "Registra il tuo profilo istituzionale." }, { title: "Selezione Piano", desc: "Scegli un livello di allocação." }, { title: "Pagamento Sicuro", desc: "Completa l'abbonamento." }, { title: "Integrazione API", desc: "Il sistema genera un sub-account unico." }, { title: "Esecuzione Live", desc: "Le strategie iniziano immediatamente." }, { title: "Report Settimanali", desc: "Ricevi audit dettagliati sulle performance." } ], cta: "PRONTO A PARTIRE?", ctaBtn: "INIZIA ALLOCAZIONE ORA" },
      contact: { badge: "SUPPORTO", title: "CONCIERGE", subtitle: "ISTITUZIONALE", desc: "Il nostro team di supporto dedicato è disponibile 24/7.", infoTitle: "CANALI DIRETTI", formTitle: "INVIA UN MESSAGGIO", placeholders: { name: "NOME COMPLETO", email: "INDIRIZZO EMAIL", subject: "OGGETTO", message: "IL TUO MESSAGGIO" }, sendBtn: "INVIA MESSAGGIO" }
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
      order: ['localStorage', 'cookie', 'sessionStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;