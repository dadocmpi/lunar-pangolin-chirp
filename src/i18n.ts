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
      methodology: { badge: "OUR EDGE", title: "QUANTITATIVE PRECISION", momentum: { title: "Dynamic Momentum Optimization", desc: "Our algorithms identify and exploit sustained price movements.", f1: "Multi-timeframe validation", f2: "Cross-asset correlation", f3: "Adaptive position scaling" }, volatility: { title: "Intelligent Volatility Shield", desc: "Advanced mathematical modeling that preserves capital.", f1: "Real-time VIX integration", f2: "Non-linear drawdown limits", f3: "Automated de-risking" }, risk: { title: "Systematic Risk Architecture", desc: "Rigorous institutional controls ensuring capital preservation.", f1: "Kelly Criterion optimization", f2: "Monte Carlo simulations", f3: "24/7 VaR monitoring" } },
      process_home: { badge: "THE ROADMAP", title: "FROM CAPITAL TO", subtitle: "ELITE PERFORMANCE", step1: { title: "Strategic Allocation", desc: "Select the institutional-grade plan." }, step2: { title: "Instant Integration", desc: "Our infrastructure syncs in milliseconds." }, step3: { title: "Algorithmic Deployment", desc: "High-frequency models execute trades." }, step4: { title: "Performance Analysis", desc: "Monitor every execution in real-time." }, step5: { title: "Capital Liquidity", desc: "Request profit withdrawals directly." } },
      cta_home: { badge: "LIMITED INSTITUTIONAL SLOTS", title: "READY TO OPTIMIZE", subtitle: "YOUR PORTFOLIO?", desc: "Join an exclusive network of global investors.", btn: "VIEW INVESTMENT PLANS", trust: "Protected by AES-256 Institutional Encryption." },
      pricing: { badge: "TRANSPARENCY", title: "CAPITAL", subtitle: "ALLOCATIONS", desc: "Institutional-grade infrastructure with a transparent fee structure.", select: "SECURE THIS PLAN", allocation: "MANAGED CAPITAL", month: "monthly fee" },
      about: { badge: "OUR LEGACY", title: "PIONEERING THE", subtitle: "QUANTITATIVE FRONTIER", desc: "Braxel Markets was founded on the principle of accessibility.", historyTitle: "OUR JOURNEY", historyDesc1: "Since 2026, we have been at the forefront of algorithmic trading.", historyDesc2: "Our team works tirelessly to maintain the most robust infrastructure.", stats: { founded: "Founded", users: "Active Users", uptime: "System Uptime", support: "Global Reach" }, values: { mission: "MISSION", missionDesc: "To democratize access to high-frequency trading.", vision: "VISION", visionDesc: "To become the global standard for automated investment.", values: "VALUES", valuesDesc: "Transparency, mathematical rigor, and commitment." } },
      howItWorks: { badge: "INFRASTRUCTURE", title: "HOW THE", subtitle: "ENGINE WORKS", desc: "Our ecosystem is designed for speed, security, and absolute transparency.", steps: [ { title: "Account Creation", desc: "Register your institutional profile." }, { title: "Plan Selection", desc: "Choose an allocation level." }, { title: "Secure Payment", desc: "Complete your subscription." }, { title: "API Integration", desc: "Our system generates a unique sub-account." }, { title: "Live Execution", desc: "Strategies begin executing immediately." }, { title: "Weekly Reporting", desc: "Receive detailed performance audits." } ], cta: "READY TO DEPLOY?", ctaBtn: "START ALLOCATION NOW" },
      contact: { badge: "SUPPORT", title: "INSTITUTIONAL", subtitle: "CONCIERGE", desc: "Our dedicated support team is available 24/7.", infoTitle: "DIRECT CHANNELS", formTitle: "SEND a MESSAGE", placeholders: { name: "FULL NAME", email: "EMAIL ADDRESS", subject: "SUBJECT", message: "YOUR MESSAGE" }, sendBtn: "SEND MESSAGE" },
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
      methodology: { badge: "NOSSA VANTAGEM", title: "PRECISÃO QUANTITATIVA", momentum: { title: "Otimização de Momentum Dinâmico", desc: "Nossos algoritmos identificam e exploram movimentos de preços.", f1: "Validação multi-timeframe", f2: "Correlação entre ativos", f3: "Escalonamento adaptativo" }, volatility: { title: "Escudo de Volatilidade Inteligente", desc: "Modelagem matemática avançada que preserva o capital.", f1: "Integração VIX em tempo real", f2: "Limites de drawdown não lineares", f3: "Redução de risco automatizada" }, risk: { title: "Arquitetura de Risco Sistemático", desc: "Rigorosos controles institucionais garantindo a preservação do capital.", f1: "Otimização do Critério de Kelly", f2: "Simulações de Monte Carlo", f3: "Monitoramento VaR 24/7" } },
      process_home: { badge: "O ROTEIRO", title: "DO CAPITAL À", subtitle: "PERFORMANCE DE ELITE", step1: { title: "Alocação Estratégica", desc: "Selecione o plano de nível institucional." }, step2: { title: "Integração Instantânea", desc: "Nossa infraestrutura sincroniza em milissegundos." }, step3: { title: "Implementação Algorítmica", desc: "Modelos de alta frequência executam operações." }, step4: { title: "Análise de Performance", desc: "Monitore cada execução em tempo real." }, step5: { title: "Liquidez de Capital", desc: "Solicite saques de lucros diretamente." } },
      cta_home: { badge: "VAGAS INSTITUCIONAIS LIMITADAS", title: "PRONTO PARA OTIMIZAR", subtitle: "SEU PORTFÓLIO?", desc: "Junte-se a uma rede exclusiva de investidores globais.", btn: "VER PLANOS DE INVESTIMENTO", trust: "Protegido por Criptografia Institucional AES-256." },
      pricing: { badge: "TRANSPARÊNCIA", title: "ALOCAÇÕES DE", subtitle: "CAPITAL", desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.", select: "GARANTIR ESTE PLANO", allocation: "CAPITAL GERENCIADO", month: "taxa mensal" },
      about: { badge: "NOSSO LEGADO", title: "PIONEIRISMO NA", subtitle: "FRONTEIRA QUANTITATIVA", desc: "A Braxel Markets foi fundada no princípio da acessibilidade.", historyTitle: "NOSSA JORNADA", historyDesc1: "Desde 2026, estamos na vanguarda do trading algorítmico.", historyDesc2: "Nossa equipe trabalha incansavelmente para manter a infraestrutura mais robusta.", stats: { founded: "Fundada", users: "Usuários Ativos", uptime: "Uptime do Sistema", support: "Alcance Global" }, values: { mission: "MISSÃO", missionDesc: "Democratizar o acesso à infraestrutura de trading de alta frequência.", vision: "VISÃO", visionDesc: "Tornar-se o padrão global para tecnologia de investimento automatizada.", values: "VALORES", valuesDesc: "Transparência, rigor matemático e compromisso." } },
      howItWorks: { badge: "INFRAESTRUTURA", title: "COMO O", subtitle: "MOTOR FUNCIONA", desc: "Nosso ecossistema é projetado para velocidade, segurança e transparência absoluta.", steps: [ { title: "Criação de Conta", desc: "Registre seu perfil institucional." }, { title: "Seleção de Plano", desc: "Escolha um nível de alocação." }, { title: "Pagamento Seguro", desc: "Conclua sua assinatura." }, { title: "Integração de API", desc: "Nosso sistema gera uma subconta exclusiva." }, { title: "Execução ao Vivo", desc: "As estratégias começam a ser executadas imediatamente." }, { title: "Relatórios Semanais", desc: "Receba auditorias de desempenho detalhadas." } ], cta: "PRONTO PARA COMEÇAR?", ctaBtn: "INICIAR ALOCAÇÃO AGORA" },
      contact: { badge: "SUPORTE", title: "CONCIERGE", subtitle: "INSTITUCIONAL", desc: "Nossa equipe de suporte dedicada está disponível 24/7.", infoTitle: "CANAIS DIRETOS", formTitle: "ENVIE UMA MENSAGEM", placeholders: { name: "NOME COMPLETO", email: "ENDEREÇO DE E-MAIL", subject: "ASSUNTO", message: "SUA MENSAGEM" }, sendBtn: "ENVIAR MENSAGEM" },
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
      methodology: { badge: "IL NOSTRO VANTAGGIO", title: "PRECISIONE QUANTITATIVA", momentum: { title: "Ottimizzazione Momentum Dinamico", desc: "I nostri algoritmi identificano e sfruttano i movimenti dei prezzi.", f1: "Validazione multi-timeframe", f2: "Correlazione cross-asset", f3: "Scaling adattivo" }, volatility: { title: "Scudo Volatilità Intelligente", desc: "Modellazione matematica avanzada che preserva il capitale.", f1: "Integrazione VIX in tempo reale", f2: "Limiti drawdown non lineari", f3: "De-risking automatizzato" }, risk: { title: "Architettura Rischio Sistematico", desc: "Rigorosi controlli istituzionali per la preservazione del capitale.", f1: "Ottimizzazione Criterio di Kelly", f2: "Simulazioni Monte Carlo", f3: "Monitoraggio VaR 24/7" } },
      process_home: { badge: "LA ROADMAP", title: "DAL CAPITALE ALLA", subtitle: "PERFORMANCE D'ELITE", step1: { title: "Allocazione Strategica", desc: "Seleziona il piano istituzionale." }, step2: { title: "Integrazione Istantanea", desc: "La nostra infrastruttura si sincronizza in millisecondi." }, step3: { title: "Distribuzione Algoritmica", desc: "Modelli ad alta frequenza eseguono operazioni." }, step4: { title: "Analisi Performance", desc: "Monitora ogni esecuzione in tempo reale." }, step5: { title: "Liquidità Capitale", desc: "Richiedi prelievi di profitto direttamente." } },
      cta_home: { badge: "POSTI ISTITUZIONALI LIMITATI", title: "PRONTO A OTTIMIZZARE", subtitle: "IL TUO PORTAFOGLIO?", desc: "Unisciti a una rete esclusiva di investitori globali.", btn: "VEDI PIANI DI INVESTIMENTO", trust: "Protetto da Crittografia Istituzionale AES-256." },
      pricing: { badge: "TRASPARENZA", title: "ALLOCAZIONI DI", subtitle: "CAPITALE", desc: "Infrastruttura istituzionale con una struttura commissionale trasparente.", select: "ASSICURA QUESTO PIANO", allocation: "CAPITALE GESTITO", month: "canone mensile" },
      about: { badge: "LA NOSTRA EREDITÀ", title: "PIONIERI NELLA", subtitle: "FRONTEIRA QUANTITATIVA", desc: "Braxel Markets è stata fondata sul principio dell'accessibilità.", historyTitle: "IL NOSTRO VIAGGIO", historyDesc1: "Dal 2026, siamo all'avanguardia nel trading algoritmico.", historyDesc2: "Il nostro team lavora instancabilmente per mantenere l'infrastruttura più robusta.", stats: { founded: "Fondato", users: "Utenti Attivi", uptime: "Uptime Sistema", support: "Portata Globale" }, values: { mission: "MISSIONE", missionDesc: "Democratizzare l'accesso al trading ad alta frequenza.", vision: "VISIONE", visionDesc: "Diventare lo standard globale per gli investimenti automatizzati.", values: "VALORES", valuesDesc: "Trasparenza, rigore matematico e impegno." } },
      howItWorks: { badge: "INFRAESTRUTTURA", title: "COME FUNZIONA", subtitle: "IL MOTORE", desc: "Il nostro ecosistema è progettato per velocità, sicurezza e trasparenza assoluta.", steps: [ { title: "Creazione Account", desc: "Registra il tuo profilo istituzionale." }, { title: "Selezione Piano", desc: "Scegli un livello di allocazione." }, { title: "Pagamento Sicuro", desc: "Completa l'abbonamento." }, { title: "Integrazione API", desc: "Il sistema genera un sub-account unico." }, { title: "Esecuzione Live", desc: "Le strategie iniziano immediatamente." }, { title: "Report Settimanali", desc: "Ricevi audit dettagliati sulle performance." } ], cta: "PRONTO A PARTIRE?", ctaBtn: "INIZIA ALLOCAZIONE ORA" },
      contact: { badge: "SUPPORTO", title: "CONCIERGE", subtitle: "ISTITUZIONALE", desc: "Il nostro team di supporto dedicato è disponibile 24/7.", infoTitle: "CANALI DIRETTI", formTitle: "INVIA UN MESSAGGIO", placeholders: { name: "NOME COMPLETO", email: "INDIRIZZO EMAIL", subject: "OGGETTO", message: "IL TUO MESSAGGIO" }, sendBtn: "INVIA MESSAGGIO" },
      dashboard: { portfolio: "Portafoglio", activeServices: "Servizi Attivi", newAllocation: "Nuova Allocazione", noServices: "Nessun piano di investimento attivo trovato.", balance: "Saldo Attuale", withdraw: "Prelievo", liquidity: "Liquidità", requestWithdraw: "Richiedi Prelievo", selectAccount: "Seleziona Account", amount: "Importo (USD)", iban: "IBAN / Dati Bancari", btnWithdraw: "INVIA RICHIESTA DI PRELIEVO", profile: "Gestione Profilo", settings: "Impostazioni", firstName: "Nome", lastName: "Cognome", saveChanges: "SALVA MODIFICHE" }
    }
  },
  es: {
    translation: {
      nav: {
        pricing: "PLANES DE INVERSIÓN",
        howItWorks: "INFRAESTRUCTURA",
        about: "NUESTRO LEGADO",
        contact: "SOPORTE INSTITUCIONAL",
        login: "ACCESO AL TERMINAL",
        openAccount: "UNIRSE A BRAXEL",
        dashboard: "PANEL",
        logout: "CERRAR SESIÓN"
      },
      footer: {
        desc: "Infraestructura de inversión de nivel institucional. Tecnología propia para el mercado moderno.",
        platform: "Plataforma",
        company: "Empresa",
        support: "Soporte Digital",
        rights: "Todos los derechos reservados.",
        privacy: "Privacidad",
        terms: "Términos",
        disclaimer: "Aviso Legal"
      },
      auth: {
        loginTitle: "Iniciar Sesión",
        loginSubtitle: "Ingrese sus credenciales de acceso.",
        registerTitle: "Crear Cuenta",
        registerSubtitle: "Comience su viaje no mercado institucional.",
        email: "Correo Electrónico",
        password: "Contraseña",
        fullName: "Nombre Completo",
        forgotPassword: "¿Olvidó su contraseña?",
        noAccount: "¿No tiene una cuenta?",
        hasAccount: "¿Ya tiene acceso?",
        btnAccess: "ACCEDER A LA CUENTA",
        btnCreate: "CREAR MI CUENTA",
        termsAgree: "Acepto los Términos e la Privacidad.",
        futureTitle: "El Futuro de la",
        futureSubtitle: "Inversión",
        features: ["Algoritmos institucionales", "Protección de capital avanzada", "Ejecución en milisegundos", "Transparencia total"]
      },
      checkout: {
        summary: "Resumen del Pedido",
        finalize: "Finalice su Asignación",
        managedCapital: "Capital Gestionado",
        total: "Monto Total",
        secure: "Pago Seguro",
        authRequired: "Autenticación Requerida",
        authDesc: "Inicie sesión o cree una cuenta para vincular este plan a su perfil.",
        btnLogin: "Iniciar Sesión",
        btnRegister: "Crear Nueva Cuenta",
        loggedInAs: "Sesión iniciada como",
        securityDesc: "Seguridad de nivel institucional. Su pago se procesa a través de canales cifrados.",
        footerNote: "Al completar esta compra, autoriza a Braxel Markets a implementar estrategias algorítmicas."
      },
      legal: {
        termsTitle: "Términos de Servicio",
        privacyTitle: "Política de Privacidad",
        disclaimerTitle: "Aviso Legal Financiero",
        badgeLegal: "Legal",
        badgePrivacy: "Privacidad",
        badgeRisk: "Riesgo"
      },
      hero: {
        title1: "GESTIÓN DE CAPITAL",
        title2: "ALGORÍTMICA DE ÉLITE.",
        desc: "Implemente estrategias cuantitativas de nivel institucional diseñadas para el mercado moderno. Experimente precisión de ejecución en milisegundos.",
        getStarted: "EXPLORAR PLANES DE INVERSIÓN",
        viewStrategies: "METODOLOGÍA TÉCNICA"
      },
      stats: { volume: "Volumen Total Gestionado", traders: "Inversores Activos", uptime: "Uptime de Infraestructura", latency: "Precisión de Ejecución" },
      methodology: { badge: "NUESTRA VENTAJA", title: "PRECISIÓN CUANTITATIVA", momentum: { title: "Optimización de Momentum Dinámico", desc: "Nuestros algoritmos identifican y explotan movimientos de precios.", f1: "Validación multi-timeframe", f2: "Correlación entre activos", f3: "Escalado adaptativo" }, volatility: { title: "Escudo de Volatilidad Inteligente", desc: "Modelado matemático avanzado que preserva o capital.", f1: "Integración VIX en tiempo real", f2: "Límites de drawdown no lineales", f3: "Reducción de riesgo automatizada" }, risk: { title: "Arquitectura de Riesgo Sistemático", desc: "Rigurosos controles institucionales garantizando la preservación del capital.", f1: "Optimización del Criterio de Kelly", f2: "Simulaciones de Monte Carlo", f3: "Monitoreo VaR 24/7" } },
      process_home: { badge: "EL MAPA", title: "DEL CAPITAL AL", subtitle: "RENDIMIENTO DE ÉLITE", step1: { title: "Asignación Estratégica", desc: "Seleccione el plan institucional." }, step2: { title: "Integración Instantánea", desc: "Nuestra infraestructura se sincroniza en milisegundos." }, step3: { title: "Despliegue Algorítmico", desc: "Modelos de alta frecuencia ejecutan operaciones." }, step4: { title: "Análisis de Rendimiento", desc: "Monitoree cada ejecución en tiempo real." }, step5: { title: "Liquidez de Capital", desc: "Solicite retiros de ganancias directamente." } },
      cta_home: { badge: "CUPOS INSTITUCIONALES LIMITADOS", title: "¿LISTO PARA OPTIMIZAR", subtitle: "SU PORTAFOLIO?", desc: "Únase a una red exclusiva de inversores globales.", btn: "VER PLANES DE INVERSIÓN", trust: "Protegido por Cifrado Institucional AES-256." },
      pricing: { badge: "TRANSPARENCIA", title: "ASIGNACIONES DE", subtitle: "CAPITAL", desc: "Infraestructura institucional con una estructura de tarifas transparente.", select: "ASEGURAR ESTE PLAN", allocation: "CAPITAL GESTIONADO", month: "tarifa mensual" },
      about: { badge: "NUESTRO LEGADO", title: "PIONEROS EN LA", subtitle: "FRONTERA CUANTITATIVA", desc: "Braxel Markets se fundó sobre el principio de la accesibilidad.", historyTitle: "NUESTRO VIAJE", historyDesc1: "Desde 2026, estamos a la vanguardia del trading algorítmico.", historyDesc2: "Nuestro equipo trabaja incansablemente para mantener la infraestructura más robusta.", stats: { founded: "Fundada", users: "Usuarios Activos", uptime: "Uptime del Sistema", support: "Alcance Global" }, values: { mission: "MISIÓN", missionDesc: "Democratizar el acceso al trading de alta frecuencia.", vision: "VISIÓN", visionDesc: "Convertirse en el estándar global para la inversión automatizada.", values: "VALORES", valuesDesc: "Transparencia, rigor matemático y compromiso." } },
      howItWorks: { badge: "INFRAESTRUCTURA", title: "CÓMO FUNCIONA", subtitle: "EL MOTOR", desc: "Nuestro ecosistema está diseñado para velocidad, seguridad y transparencia absoluta.", steps: [ { title: "Creación de Cuenta", desc: "Registre su perfil institucional." }, { title: "Selección de Plan", desc: "Elija un nivel de asignación." }, { title: "Pago Seguro", desc: "Complete su suscripción." }, { title: "Integración de API", desc: "Nuestro sistema genera una subcuenta única." }, { title: "Ejecución en Vivo", desc: "Las estrategias comienzan a ejecutarse inmediatamente." }, { title: "Informes Semanales", desc: "Reciba auditorías de rendimiento detalladas." } ], cta: "¿LISTO PARA EMPEZAR?", ctaBtn: "INICIAR ASIGNACIÓN AHORA" },
      contact: { badge: "SOPORTE", title: "CONCIERGE", subtitle: "INSTITUCIONAL", desc: "Nuestro equipo de soporte dedicado está disponible 24/7.", infoTitle: "CANALES DIRECTOS", formTitle: "ENVIAR UN MENSAJE", placeholders: { name: "NOMBRE COMPLETO", email: "CORREO ELECTRÓNICO", subject: "ASUNTO", message: "SU MENSAJE" }, sendBtn: "ENVIAR MENSAJE" },
      dashboard: { portfolio: "Portafolio", activeServices: "Servicios Activos", newAllocation: "Nueva Asignación", noServices: "No se encontraron planes de inversión activos.", balance: "Saldo Actual", withdraw: "Retiro", liquidity: "Liquidez", requestWithdraw: "Solicitar Retiro", selectAccount: "Seleccionar Cuenta", amount: "Monto (USD)", iban: "IBAN / Datos Bancarios", btnWithdraw: "ENVIAR SOLICITUD DE RETIRO", profile: "Gestión de Perfil", settings: "Configuración", firstName: "Nombre", lastName: "Apellido", saveChanges: "GUARDAR CAMBIOS" }
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
  }, (err, t) => {
    if (err) return console.error(err);
    // Sincroniza o atributo lang do HTML na inicialização
    document.documentElement.lang = i18n.language;
  });

// Listener para atualizar o atributo lang sempre que o idioma mudar
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;