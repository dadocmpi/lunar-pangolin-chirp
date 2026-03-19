import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' }
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
      footer: {
        desc: "Institutional-grade investment infrastructure. Proprietary technology for the modern market.",
        platform: "Platform",
        company: "Company",
        support: "Digital Support",
        rights: "All rights reserved.",
        privacy: "Privacy",
        terms: "Terms",
        disclaimer: "Financial Disclaimer"
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
        termsAgree: "I agree to the Terms and Privacy.",
        futureTitle: "The Future of",
        futureSubtitle: "Investment",
        features: ["Institutional-grade algorithms", "Advanced capital protection", "Millisecond execution", "Total transparency"]
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
        securityDesc: "Institutional-grade security. Your payment is processed through encrypted channels.",
        footerNote: "By completing this purchase, you authorize Braxel Markets to deploy algorithmic strategies."
      },
      legal: {
        termsTitle: "Terms of Service",
        privacyTitle: "Privacy Policy",
        disclaimerTitle: "Financial Disclaimer",
        badgeLegal: "Legal",
        badgePrivacy: "Privacy",
        badgeRisk: "Risk"
      },
      hero: {
        title1: "ELITE ALGORITHMIC",
        title2: "CAPITAL MANAGEMENT.",
        desc: "Deploy institutional-grade quantitative strategies engineered for the modern market. Experience millisecond execution precision and advanced risk mitigation protocols.",
        getStarted: "EXPLORE INVESTMENT PLANS",
        viewStrategies: "TECHNICAL METHODOLOGY"
      },
      stats: { volume: "Total Managed Volume", traders: "Global Active Investors", uptime: "Infrastructure Uptime", latency: "Execution Precision" },
      pricing: { badge: "TRANSPARENCY", title: "CAPITAL", subtitle: "ALLOCATIONS", desc: "Institutional-grade infrastructure with a transparent fee structure.", select: "SECURE THIS PLAN", allocation: "MANAGED CAPITAL", month: "monthly fee" },
      dashboard: { portfolio: "Portfolio", activeServices: "Active Services", newAllocation: "New Allocation", noServices: "No active investment plans found.", balance: "Current Balance", withdraw: "Withdrawal", liquidity: "Liquidity", requestWithdraw: "Request Withdrawal", selectAccount: "Select Account", amount: "Amount (USD)", iban: "IBAN / Bank Details", btnWithdraw: "SUBMIT WITHDRAWAL REQUEST", profile: "Profile Management", settings: "Settings", firstName: "First Name", lastName: "Last Name", saveChanges: "SAVE CHANGES" }
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
      footer: {
        desc: "Infraestrutura de investimento de nível institucional. Tecnologia proprietária para o mercado moderno.",
        platform: "Plataforma",
        company: "Empresa",
        support: "Suporte Digital",
        rights: "Todos os direitos reservados.",
        privacy: "Privacidade",
        terms: "Termos",
        disclaimer: "Aviso Legal"
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
        termsAgree: "Eu concordo com os Termos e Privacidade.",
        futureTitle: "O Futuro do",
        futureSubtitle: "Investimento",
        features: ["Algoritmos institucionais", "Proteção de capital avançada", "Execução em milissegundos", "Transparência total"]
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
        securityDesc: "Segurança de nível institucional. Seu pagamento é processado por canais criptografados.",
        footerNote: "Ao concluir esta compra, você autoriza a Braxel Markets a implementar estratégias algorítmicas."
      },
      legal: {
        termsTitle: "Termos de Serviço",
        privacyTitle: "Política de Privacidade",
        disclaimerTitle: "Aviso Legal Financeiro",
        badgeLegal: "Legal",
        badgePrivacy: "Privacidade",
        badgeRisk: "Risco"
      },
      hero: {
        title1: "GESTÃO DE CAPITAL",
        title2: "ALGORÍTMICA DE ELITE.",
        desc: "Implemente estratégias quantitativas de nível institucional projetadas para o mercado moderno. Experimente precisão de execução em milissegundos.",
        getStarted: "EXPLORAR PLANOS DE INVESTIMENTO",
        viewStrategies: "METODOLOGIA TÉCNICA"
      },
      stats: { volume: "Volume Total Gerenciado", traders: "Investidores Ativos", uptime: "Uptime da Infraestrutura", latency: "Precisão de Execução" },
      pricing: { badge: "TRANSPARENCY", title: "ALOCAÇÕES DE", subtitle: "CAPITAL", desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.", select: "GARANTIR ESTE PLANO", allocation: "CAPITAL GERENCIADO", month: "taxa mensal" },
      dashboard: { portfolio: "Portfólio", activeServices: "Serviços Ativos", newAllocation: "Nova Alocação", noServices: "Nenhum plano de investimento ativo encontrado.", balance: "Saldo Atual", withdraw: "Saque", liquidity: "Liquidez", requestWithdraw: "Solicitar Saque", selectAccount: "Selecionar Conta", amount: "Valor (USD)", iban: "IBAN / Dados Bancários", btnWithdraw: "ENVIAR SOLICITAÇÃO DE SAQUE", profile: "Gestão de Perfil", settings: "Configurações", firstName: "Nome", lastName: "Sobrenome", saveChanges: "SALVAR ALTERAÇÕES" }
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
      footer: {
        desc: "Infrastruttura di investimento di livello istituzionale. Tecnologia proprietaria per il mercato moderno.",
        platform: "Piattaforma",
        company: "Azienda",
        support: "Supporto Digitale",
        rights: "Tutti i diritti riservati.",
        privacy: "Privacy",
        terms: "Termini",
        disclaimer: "Dichiarazione di non responsabilità"
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
        termsAgree: "Accetto i Termini e la Privacy.",
        futureTitle: "Il Futuro dell'",
        futureSubtitle: "Investimento",
        features: ["Algoritmi istituzionali", "Protezione avanzata del capitale", "Esecuzione in millisecondi", "Trasparenza totale"]
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
        securityDesc: "Sicurezza di livello istituzionale. Il tuo pagamento è elaborato tramite canali crittografati.",
        footerNote: "Completando questo acquisto, autorizzi Braxel Markets a implementare strategie algoritmiche."
      },
      legal: {
        termsTitle: "Termini di Servizio",
        privacyTitle: "Informativa sulla Privacy",
        disclaimerTitle: "Dichiarazione di non responsabilità finanziaria",
        badgeLegal: "Legale",
        badgePrivacy: "Privacy",
        badgeRisk: "Rischio"
      },
      hero: {
        title1: "GESTIONE CAPITALE",
        title2: "ALGORITMICA D'ELITE.",
        desc: "Implementa strategie quantitative di livello istituzionale progettate per il mercato moderno. Sperimenta la precisione di esecuzione in millisecondi.",
        getStarted: "ESPLORA I PIANI DI INVESTIMENTO",
        viewStrategies: "METODOLOGIA TECNICA"
      },
      stats: { volume: "Volume Totale Gestito", traders: "Investitori Attivi", uptime: "Uptime Infrastruttura", latency: "Precisione Esecuzione" },
      pricing: { badge: "TRASPARENZA", title: "ALLOCAZIONI DI", subtitle: "CAPITALE", desc: "Infrastruttura istituzionale con una struttura commissionale trasparente.", select: "ASSICURA QUESTO PIANO", allocation: "CAPITALE GESTITO", month: "canone mensile" },
      dashboard: { portfolio: "Portafoglio", activeServices: "Servizi Attivi", newAllocation: "Nuova Allocazione", noServices: "Nessun piano di investimento attivo trovato.", balance: "Saldo Attuale", withdraw: "Prelievo", liquidity: "Liquidità", requestWithdraw: "Richiedi Prelievo", selectAccount: "Seleziona Account", amount: "Importo (USD)", iban: "IBAN / Dati Bancari", btnWithdraw: "INVIA RICHIESTA DI PRELIEVO", profile: "Gestione Profilo", settings: "Impostazioni", firstName: "Nome", lastName: "Cognome", saveChanges: "SALVA MODIFICHE" }
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