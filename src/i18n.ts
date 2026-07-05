import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
  { code: 'he', name: 'עברית' }
];

// Base translations (English)
const enTranslation = {

  hero: { title1: "ELITE ALGORITHMIC", title2: "CAPITAL MANAGEMENT.", desc: "Deploy institutional-grade quantitative strategies engineered for the modern market. Experience millisecond execution precision and advanced risk mitigation protocols.", getStarted: "EXPLORE INVESTMENT PLANS", viewStrategies: "TECHNICAL METHODOLOGY" },
  stats: { volume: "Strategic Capital Management", traders: "Active Accounts", uptime: "Infrastructure Uptime", latency: "Execution Precision" },
  methodology: { badge: "METHODOLOGY", title: "QUANTITATIVE MODELS", statArb: { title: "STATISTICAL ARBITRAGE", desc: "Exploitation of temporary price inefficiencies between correlated assets using cointegration models and pair trading.", f1: "Cointegration Analysis", f2: "Pair Selection Algorithms", f3: "Z-Score Thresholding" }, meanRev: { title: "MEAN REVERSION", desc: "Identification of asset price deviations from historical averages, with systematic entry and exit rules.", f1: "Bollinger Band Signals", f2: "RSI Divergence Detection", f3: "Ornstein-Uhlenbeck Models" }, hft: { title: "HIGH-FREQUENCY TRADING", desc: "Ultra-low latency execution strategies leveraging co-located infrastructure for microsecond-level order placement.", f1: "Market Microstructure", f2: "Order Flow Analysis", f3: "Latency Arbitrage" } },
  transparency: { badge: "INFRASTRUCTURE", title: "TRANSPARENT TECHNOLOGY", desc: "Our infrastructure is built on enterprise-grade foundations, ensuring reliability, speed, and security.", connectivity: { title: "CONNECTIVITY", desc: "Direct market access via Equinix data centers (NY5, LD4, TY3) with sub-millisecond connectivity to major exchanges." }, cloud: { title: "CLOUD EXECUTION", desc: "Redundant execution engines deployed across AWS (us-east-1, eu-west-1) and Azure for failover resilience." }, security: { title: "SECURITY", desc: "End-to-end encryption, SOC 2 Type II compliance, and multi-layer authentication for all client operations." } },
  process_home: { badge: "PROCESS", title: "INSTITUTIONAL", subtitle: "WORKFLOW", step1: { title: "REGISTRATION", desc: "Secure onboarding and identity verification." }, step2: { title: "ALLOCATION", desc: "Selection of the managed capital tier." }, step3: { title: "INTEGRATION", desc: "Deployment of algorithmic infrastructure." }, step4: { title: "MONITORING", desc: "Real-time performance tracking via terminal." }, step5: { title: "LIQUIDITY", desc: "Seamless profit withdrawal protocols." } },
  cta_home: { badge: "OPPORTUNITY", title: "SCALE YOUR", subtitle: "CAPITAL", desc: "Join the elite group of investors utilizing Braxel's proprietary infrastructure.", btn: "START ALLOCATION", trust: "Institutional Grade Security" },
  pricing: { badge: "TRANSPARENCY", title: "CAPITAL", subtitle: "ALLOCATIONS", desc: "Institutional-grade infrastructure with a transparent fee structure.", select: "SECURE THIS PLAN", allocation: "MANAGED CAPITAL", month: "monthly fee" },
  howItWorks: { badge: "INFRASTRUCTURE", title: "TECHNICAL", subtitle: "ARCHITECTURE", desc: "Our proprietary ecosystem is built for speed, security, and consistent performance.", steps: [{ title: "REGISTRATION", desc: "Create your institutional profile." }, { title: "DASHBOARD", desc: "Access your private management terminal." }, { title: "PLAN SELECTION", desc: "Choose your capital allocation tier." }, { title: "API DEPLOYMENT", desc: "Automated connection to global markets." }, { title: "EXECUTION", desc: "Millisecond algorithmic trade processing." }, { title: "REPORTING", desc: "Detailed weekly performance analytics." }], cta: "READY TO DEPLOY?", ctaBtn: "JOIN THE NETWORK" },
  about: { badge: "ABOUT US", title: "INSTITUTIONAL", subtitle: "EXCELLENCE", desc: "Braxel Markets represents the pinnacle of algorithmic capital management.", historyTitle: "OUR HISTORY", historyDesc1: "Founded by a team of quantitative analysts and software engineers, Braxel was built to bridge the gap between retail capital and institutional technology.", historyDesc2: "Today, we focus on risk-adjusted returns and infrastructure stability, providing cutting-edge algorithmic strategies for the modern investor.", stats: { founded: "Founded", users: "Active Users", uptime: "Uptime", support: "Support" }, values: { mission: "MISSION", missionDesc: "To provide elite algorithmic infrastructure for global capital.", vision: "VISION", visionDesc: "To define the future of automated quantitative management.", values: "VALUES", valuesDesc: "Transparency, precision, and unwavering security." }, teamTitle: "LEADERSHIP TEAM", teamDesc: "Meet the founders and managers behind Braxel Markets.", team: [{ name: "Bernardo Campi", role: "Founder & CEO", bio: "Quantitative strategist and entrepreneur leading Braxel Markets' vision for institutional-grade algorithmic infrastructure.", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[Co-Founder Name]", role: "Co-Founder & CTO", bio: "Software engineer specialized in high-frequency systems and distributed computing.", linkedin: "#", photo: "" }, { name: "[Manager Name]", role: "Head of Risk Management", bio: "Former institutional risk analyst with deep expertise in portfolio optimization.", linkedin: "#", photo: "" }] },
  contact: { badge: "SUPPORT", title: "INSTITUTIONAL", subtitle: "CHANNELS", desc: "Our dedicated support team is available 24/7 for institutional inquiries.", infoTitle: "CONTACT INFO", formTitle: "DIRECT INQUIRY", placeholders: { name: "FULL NAME", email: "EMAIL ADDRESS", subject: "SUBJECT", message: "MESSAGE" }, sendBtn: "SEND INQUIRY" },

  legal: { badgeLegal: "LEGAL", termsTitle: "TERMS OF SERVICE" },
  transparency: {
    badge: "RISK MANAGEMENT",
    title: "FULL TRANSPARENCY",
    desc: "Our infrastructure combines monitoring, risk controls, and strict compliance standards to keep operations stable and capital protection protocols active.",
    warning: "Markets are volatile. Returns are never guaranteed and losses may occur even with robust safeguards.",
    protocolTitle: "Institutional Protocol",
    protocolDesc: "Our infrastructure follows strict compliance and risk management standards to ensure the highest level of operational security."
  },
  faq: {
    title: "FREQUENTLY ASKED QUESTIONS",
    badge: "FAQ",
    q1: "Is prior experience necessary?",
    a1: "No. Our infrastructure is fully automated. You only need to select your allocation tier and monitor performance via your terminal.",
    q2: "What are the risks involved?",
    a2: "As with any financial market, there are risks of capital loss due to market volatility. We use advanced risk mitigation protocols to protect capital.",
    q3: "How does the system work?",
    a3: "Our proprietary algorithms execute high-frequency quantitative strategies across global markets with millisecond precision.",
    q4: "Can I cancel my plan?",
    a4: "Yes. You can request a cancellation and capital withdrawal at any time through your dashboard protocols."
  },
  diffs: {
    title: "WHY BRAXEL MARKETS?",
    badge: "DIFFERENTIALS",
    t1: "Proprietary Tech",
    d1: "Neural networks engineered for institutional-grade execution.",
    t2: "Full Automation",
    d2: "24/7 algorithmic management without human emotional bias.",
    t3: "Simplified Access",
    d3: "Institutional infrastructure accessible through a retail-friendly terminal.",
    t4: "Professional Grade",
    d4: "Direct connection to global liquidity pools with ultra-low latency."
  },
  signals: {
    title: "LIVE ALGORITHMIC",
    subtitle: "EXECUTION",
    badge: "REAL-TIME TERMINAL",
    desc: "Monitor our proprietary infrastructure in real-time. Every signal is processed by our neural networks with millisecond precision.",
    asset: "ASSET",
    type: "TYPE",
    entry: "ENTRY",
    profit: "PROFIT",
    status: "STATUS",
    active: "ACTIVE",
    completed: "COMPLETED"
  }
};

// Portuguese translations
const ptTranslation = {

  process_home: { badge: "PROCESSO", title: "FLUXO", subtitle: "INSTITUCIONAL", step1: { title: "REGISTRO", desc: "Onboarding seguro e verificação de identidade." }, step2: { title: "ALOCAÇÃO", desc: "Seleção do nível de capital gerenciado." }, step3: { title: "INTEGRAÇÃO", desc: "Implementação da infraestrutura algorítmica." }, step4: { title: "MONITORAMENTO", desc: "Acompanhamento em tempo real via terminal." }, step5: { title: "LIQUIDEZ", desc: "Protocolos de saque de lucros simplificados." } },
  cta_home: { badge: "OPORTUNIDADE", title: "ESCALE SEU", subtitle: "CAPITAL", desc: "Junte-se ao grupo de elite de investidores que utilizam a infraestrutura proprietária da Braxel.", btn: "INICIAR ALOCAÇÃO", trust: "Segurança de Nível Institucional" },
  pricing: { badge: "TRANSPARÊNCIA", title: "ALOCAÇÕES DE", subtitle: "CAPITAL", desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.", select: "GARANTIR ESTE PLANO", allocation: "CAPITAL GERENCIADO", month: "taxa mensal" },
  howItWorks: { badge: "INFRAESTRUTURA", title: "ARQUITETURA", subtitle: "TÉCNICA", desc: "Nosso ecossistema proprietário é construído para velocidade, segurança e desempenho consistente.", steps: [{ title: "REGISTRO", desc: "Crie seu perfil institucional." }, { title: "PAINEL", desc: "Acesse seu terminal privado de gestão." }, { title: "SELEÇÃO DE PLANO", desc: "Escolha seu nível de alocação de capital." }, { title: "IMPLEMENTAÇÃO API", desc: "Conexão automatizada aos mercados globais." }, { title: "EXECUÇÃO", desc: "Processamento de ordens em milissegundos." }, { title: "RELATÓRIOS", desc: "Análise detalhada de desempenho semanal." }], cta: "PRONTO PARA COMEÇAR?", ctaBtn: "ENTRAR NA REDE" },

  legal: { badgeLegal: "LEGAL", termsTitle: "TERMOS DE SERVIÇO" },
  transparency: {
    badge: "GESTÃO DE RISCO",
    title: "TRANSPARÊNCIA TOTAL",
    desc: "Nossa infraestrutura combina monitoramento, controles de risco e padrões rígidos de conformidade para manter a operação estável e a proteção de capital sempre ativa.",
    warning: "Os mercados são voláteis. Retornos nunca são garantidos e perdas podem ocorrer mesmo com proteções robustas.",
    protocolTitle: "Protocolo Institucional",
    protocolDesc: "Nossa infraestrutura segue padrões rigorosos de conformidade e gestão de risco para garantir o mais alto nível de segurança operacional."
  },
  faq: {
    title: "PERGUNTAS FREQUENTES",
    badge: "FAQ",
    q1: "É necessária experiência prévia?",
    a1: "Não. Nossa infraestrutura é totalmente automatizada. Você só precisa selecionar seu nível de alocação e monitorar o desempenho via terminal.",
    q2: "Quais são os riscos envolvidos?",
    a2: "Como em qualquer mercado financeiro, existem riscos de perda de capital devido à volatilidade. Utilizamos protocolos avançados de mitigação para proteger o capital.",
    q3: "Como o sistema funciona?",
    a3: "Nossos algoritmos proprietários executam estratégias quantitativas de alta frequência nos mercados globais com precisão de milissegundos.",
    q4: "Posso cancelar meu plano?",
    a4: "Sim. Você pode solicitar o cancelamento e o saque do capital a qualquer momento através dos protocolos do seu painel."
  },
  diffs: {
    title: "POR QUE A BRAXEL MARKETS?",
    badge: "DIFERENCIAIS",
    t1: "Tecnologia Proprietária",
    d1: "Redes neurais projetadas para execução de nível institucional.",
    t2: "Automação Total",
    d2: "Gestão algorítmica 24/7 sem viés emocional humano.",
    t3: "Facilidade de Acesso",
    d3: "Infraestrutura institucional acessível através de um terminal intuitivo.",
    t4: "Acesso Profissional",
    d4: "Conexão direta a pools de liquidez globais com ultra-baixa latência."
  },
  signals: {
    title: "EXECUÇÃO",
    subtitle: "ALGORÍTMICA",
    badge: "TERMINAL EM TEMPO REAL",
    desc: "Monitore nossa infraestrutura proprietária em tempo real. Cada sinal é processado por nossas redes neurais com precisão de milissegundos.",
    asset: "ATIVO",
    type: "TIPO",
    entry: "ENTRADA",
    profit: "LUCRO",
    status: "STATUS",
    active: "ATIVO",
    completed: "CONCLUÍDO"
  }
};

// Italian translations
const itTranslation = {
  nav: { pricing: "PIANI DI INVESTIMENTO", howItWorks: "INFRASTRUTTURA", about: "CHI SIAMO", contact: "SUPPORTO ISTITUZIONALE", login: "ACCESSO TERMINALE", support: "Supporto", openAccount: "CREA ACCOUNT", dashboard: "PANNELLO", logout: "ESCI" },
  footer: { desc: "Infrastruttura di investimento di livello istituzionale. Tecnologia proprietaria per il mercato moderno.", platform: "Piattaforma", company: "Azienda", support: "Supporto Digitale", rights: "Tutti i diritti riservati.", privacy: "Privacy", terms: "Termini", disclaimer: "Avviso Finanziario", address: "Indirizzo Commerciale", addressValue: "Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, Brasile", riskTitle: "AVVISO DI RISCHIO", riskText: "Il trading nei mercati finanziari comporta un rischio sostanziale di perdita e non è adatto a tutti gli investitori. Le performance passate non sono indicative dei risultati futuri. Il valore degli investimenti può diminuire o aumentare. Non investire denaro che non puoi permetterti di perdere. Braxel Markets non garantisce rendimenti specifici." },
  chatbot: { title: "Supporto Braxel", placeholder: "Scrivi un messaggio...", emailSupport: "Email:" },
  auth: { loginTitle: "Accesso", loginSubtitle: "Inserisci le tue credenziali di accesso.", registerTitle: "Crea Account", registerSubtitle: "Inizia il tuo percorso nel mercato istituzionale.", email: "Indirizzo E-mail", password: "Password", fullName: "Nome Completo", forgotPassword: "Password dimenticata?", noAccount: "Non hai un account?", hasAccount: "Hai già accesso?", btnAccess: "ACCEDI ALL'ACCOUNT", btnCreate: "CREA IL MIO ACCOUNT", termsAgree: "Accetto i Termini e la Privacy.", futureTitle: "Il Futuro degli", futureSubtitle: "Investimenti", features: ["Algoritmi di livello istituzionale", "Protezione avanzata del capitale", "Esecuzione in millisecondi", "Trasparenza totale"] },
  hero: { title1: "GESTIONE ALGORITMICA", title2: "DEL CAPITALE D'ÉLITE.", desc: "Implementa strategie quantitative di livello istituzionale progettate per il mercato moderno. Sperimenta precisione di esecuzione in millisecondi e protocolli avanzati di mitigazione del rischio.", getStarted: "ESPLORA I PIANI DI INVESTIMENTO", viewStrategies: "METODOLOGIA TECNICA" },
  stats: { volume: "Gestione Strategica del Capitale", traders: "Conti Attivi", uptime: "Uptime Infrastruttura", latency: "Precisione di Esecuzione" },
  methodology: { badge: "METODOLOGIA", title: "MODELLI QUANTITATIVI", statArb: { title: "ARBITRAGGIO STATISTICO", desc: "Sfruttamento delle inefficienze temporanee di prezzo tra asset correlati utilizzando modelli di cointegrazione e pair trading.", f1: "Analisi di Cointegrazione", f2: "Algoritmi di Selezione dei Pair", f3: "Soglia Z-Score" }, meanRev: { title: "MEAN REVERSION", desc: "Identificazione delle deviazioni di prezzo rispetto alle medie storiche, con regole sistematiche di ingresso e uscita.", f1: "Segnali Bande di Bollinger", f2: "Rilevamento Divergenza RSI", f3: "Modelli Ornstein-Uhlenbeck" }, hft: { title: "TRADING AD ALTA FREQUENZA", desc: "Strategie di esecuzione a latenza ultra-bassa con infrastruttura co-localizzata per ordini a livello di microsecondi.", f1: "Microstruttura di Mercato", f2: "Analisi del Flusso Ordini", f3: "Arbitraggio di Latenza" } },
  transparency: { badge: "INFRASTRUTTURA", title: "TECNOLOGIA TRASPARENTE", desc: "La nostra infrastruttura è costruita su basi enterprise, garantendo affidabilità, velocità e sicurezza.", connectivity: { title: "CONNETTIVITÀ", desc: "Accesso diretto al mercato tramite data center Equinix (NY5, LD4, TY3) con connettività sub-millisecondo alle principali borse." }, cloud: { title: "ESECUZIONE CLOUD", desc: "Motori di esecuzione ridondanti su AWS (us-east-1, eu-west-1) e Azure per resilienza di failover." }, security: { title: "SICUREZZA", desc: "Crittografia end-to-end, conformità SOC 2 Tipo II e autenticazione multi-livello per tutte le operazioni." } },
  process_home: { badge: "PROCESSO", title: "FLUSSO", subtitle: "ISTITUZIONALE", step1: { title: "REGISTRAZIONE", desc: "Onboarding sicuro e verifica dell'identità." }, step2: { title: "ALLOCAZIONE", desc: "Selezione del livello di capitale gestito." }, step3: { title: "INTEGRAZIONE", desc: "Implementazione dell'infrastruttura algoritmica." }, step4: { title: "MONITORAGGIO", desc: "Tracciamento delle performance in tempo reale." }, step5: { title: "LIQUIDITÀ", desc: "Protocolli di prelievo dei profitti semplificati." } },
  cta_home: { badge: "OPPORTUNITÀ", title: "SCALA IL TUO", subtitle: "CAPITALE", desc: "Unisciti al gruppo d'élite di investitori che utilizzano l'infrastruttura proprietaria di Braxel.", btn: "INIZIA L'ALLOCAZIONE", trust: "Sicurezza di Livello Istituzionale" },
  pricing: { badge: "TRASPARENZA", title: "ALLOCAZIONI DI", subtitle: "CAPITALE", desc: "Infrastruttura di livello istituzionale con una struttura tariffaria trasparente.", select: "GARANTISCI QUESTO PIANO", allocation: "CAPITALE GESTITO", month: "tariffa mensile" },
  howItWorks: { badge: "INFRASTRUTTURA", title: "ARCHITETTURA", subtitle: "TECNICA", desc: "Il nostro ecosistema proprietario è costruito per velocità, sicurezza e performance costanti.", steps: [{ title: "REGISTRAZIONE", desc: "Crea il tuo profilo istituzionale." }, { title: "PANNELLO", desc: "Accedi al tuo terminale privato di gestione." }, { title: "SELEZIONE PIANO", desc: "Scegli il tuo livello di allocazione del capitale." }, { title: "IMPLEMENTAZIONE API", desc: "Connessione automatizzata ai mercati globali." }, { title: "ESECUZIONE", desc: "Elaborazione ordini in millisecondi." }, { title: "REPORTISTICA", desc: "Analisi dettagliata delle performance settimanali." }], cta: "PRONTO PER INIZIARE?", ctaBtn: "UNISCITI ALLA RETE" },
  about: { badge: "CHI SIAMO", title: "ECCELLENZA", subtitle: "ISTITUZIONALE", desc: "Braxel Markets rappresenta l'apice della gestione algoritmica del capitale.", historyTitle: "LA NOSTRA STORIA", historyDesc1: "Fondata da un team di analisti quantitativi e ingegneri del software, Braxel è stata creata per colmare il divario tra capitale retail e tecnologia istituzionale.", historyDesc2: "Oggi ci concentriamo su rendimenti aggiustati per il rischio e stabilità infrastrutturale, fornendo strategie algoritmiche all'avanguardia per l'investitore moderno.", stats: { founded: "Fondata", users: "Utenti Attivi", uptime: "Uptime", support: "Supporto" }, values: { mission: "MISSIONE", missionDesc: "Fornire infrastruttura algoritmica d'élite per il capitale globale.", vision: "VISIONE", visionDesc: "Definire il futuro della gestione quantitativa automatizzata.", values: "VALORI", valuesDesc: "Trasparenza, precisione e sicurezza incrollabile." }, teamTitle: "TEAM DI LEADERSHIP", teamDesc: "Incontra i fondatori e i gestori dietro Braxel Markets.", team: [{ name: "Bernardo Campi", role: "Fondatore & CEO", bio: "Stratega quantitativo e imprenditore che guida la visione di Braxel Markets per l'infrastruttura algoritmica istituzionale.", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[Nome Co-Fondatore]", role: "Co-Fondatore & CTO", bio: "Ingegnere del software specializzato in sistemi ad alta frequenza e calcolo distribuito.", linkedin: "#", photo: "" }, { name: "[Nome Gestore]", role: "Head of Risk Management", bio: "Ex analista di rischio istituzionale con expertise in ottimizzazione del portafoglio.", linkedin: "#", photo: "" }] },
  contact: { badge: "SUPPORTO", title: "CANALI", subtitle: "ISTITUZIONALI", desc: "Il nostro team di supporto dedicato è disponibile 24/7 per richieste istituzionali.", infoTitle: "CONTATTI", formTitle: "RICHIESTA DIRETTA", placeholders: { name: "NOME COMPLETO", email: "INDIRIZZO E-MAIL", subject: "OGGETTO", message: "MESSAGGIO" }, sendBtn: "INVIA RICHIESTA" },
  dashboard: { portfolio: "Portafoglio", activeServices: "Servizi Attivi", newAllocation: "Nuova Allocazione", noServices: "Nessun piano di investimento attivo trovato.", balance: "Saldo Attuale", withdraw: "Prelievo", liquidity: "Liquidità", requestWithdraw: "Richiedi Prelievo", selectAccount: "Seleziona Conto", amount: "Importo (USD)", iban: "IBAN / Dati Bancari", btnWithdraw: "INVIA RICHIESTA DI PRELIEVO", profile: "Gestione Profilo", settings: "Impostazioni", firstName: "Nome", lastName: "Cognome", saveChanges: "SALVA MODIFICHE", verifiedAccount: "Account Verificato", totalAUM: "Totale Asset in Gestione", activeAlgos: "Algoritmi Attivi", systemStatus: "Stato del Sistema", operational: "Operativo", infraProtection: "Protezione Infrastruttura", twoFactor: "Autenticazione a Due Fattori", notEnabled: "Non Attivata", enable2FA: "Attiva 2FA", kycStatus: "Verifica KYC", verified: "Verificato", viewDocs: "Vedi Documenti", investor: "Investitore", kycRequired: "Verifica KYC Richiesta", kycRequiredDesc: "Completa la verifica d'identità per accedere a tutte le funzionalità della piattaforma. Questo è obbligatorio per tutti gli account che gestiscono capitale.", kycUnderReview: "KYC in Revisione", kycUnderReviewDesc: "I tuoi documenti sono in fase di revisione da parte del nostro team di conformità. Questo richiede generalmente 24-48 ore.", kycRejected: "Verifica KYC Rifiutata", kycRejectedDesc: "I tuoi documenti non sono stati accettati. Per favore, invia nuovamente con documentazione valida.", resubmitDocs: "Reinvia Documenti", completeVerification: "Completa Verifica", verificationRequired: "Verifica Richiesta", goToVerification: "Vai alla Verifica", totalProfit: "Profitto Totale", drawdown: "Drawdown", maxDrawdown: "Drawdown Massimo", assetsInOperation: "Asset in Operazione", monthlyReturns: "Rendimenti Mensili", analytics: "Analisi", newWithdrawalRequest: "Nuova Richiesta di Prelievo", walletIban: "Wallet / IBAN", network: "Rete", transactionHistory: "Storico Transazioni", operations: "Operazioni", asset: "Asset", type: "Tipo", entry: "Ingresso", exit: "Uscita", profit: "Profitto", time: "Ora", status: "Stato", open: "Aperto", closed: "Chiuso", accountNotFound: "Account non trovato. Per favore, crea prima un account.", loginSuccess: "Accesso riuscito!", rememberMe: "Ricordami" },
  checkout: { summary: "RIEPILOGO", allocationTitle: "Allocazione", allocationSubtitle: "Istituzionale", tierLabel: "Livello Infrastruttura Algoritmica", billedMonthly: "Fatturato Mensilmente", detailsTitle: "Dettagli Allocazione", managedCapital: "Capitale Gestito", setupFee: "Costo di Configurazione", waived: "ESENTE", latency: "Latenza di Esecuzione", infrastructureTitle: "Infrastruttura Inclusa", realTimeMonitoring: "Monitoraggio in Tempo Reale", activeUponDeployment: "Attivo dopo l'implementazione", totalDue: "Totale Dovuto", dedicatedNode: "Nodo Dedicato", globalMarkets: "Mercati Globali", instantSetup: "Configurazione Istantanea", authRequired: "AUTENTICAZIONE RICHIESTA", authDesc: "Effettua il login o crea un account per procedere con l'allocazione.", btnLogin: "ACCEDI PER PROCEDERE", btnRegister: "CREA ACCOUNT", confirmDeployment: "Conferma Implementazione", deploymentDesc: "Confermando, autorizzi l'implementazione dell'infrastruttura algoritmica associata al piano {{plan}}.", proceedPayment: "PROCEDI AL PAGAMENTO SICURO", secureGateway: "Gateway Sicuro", back: "Indietro", riskDisclosure: "Divulgazione del Rischio: Il trading algoritmico comporta un rischio sostanziale di perdita. Le performance passate non sono indicative dei risultati futuri.", secureTransaction: "Transazione Sicura", paypalNote: "Le informazioni di pagamento sono elaborate in sicurezza da PayPal. Braxel Markets non archivia i dati della carta.", encryptionNote: "Crittografato con Standard Istituzionali AES-256", verifying: "Verifica della Transazione Istituzionale...", loading: "Caricamento Terminale...", globalInfra: "Infrastruttura di Pagamento Globale", qrCode: "Codice QR", allCards: "Tutte le Carte", selectPaymentMethod: "Seleziona Metodo di Pagamento", choosePayment: "Scegli come vuoi pagare", creditCard: "Carta di Credito", instantPayment: "Pagamento istantaneo", cardDesc: "Visa, Mastercard e altre carte", crypto: "Criptovaluta", cryptoLabel: "USDT, BTC, ETH", cryptoDesc: "Trasferimento cripto veloce e sicuro", securePayment: "Pagamento Sicuro", cardNumber: "Numero Carta", cardName: "Nome sulla Carta", cardExpiry: "Scadenza", payNow: "PAGA ORA", amountToPay: "Importo da Pagare", selectNetwork: "Seleziona Rete", yourAddress: "Il tuo Indirizzo", yourAddressPlaceholder: "Inserisci indirizzo USDT", important: "IMPORTANTE", cryptoNote: "Invia l'importo esatto per ricevere il piano", confirmCrypto: "CONFERMA CON CRYPTO", copied: "Copiato!", cryptoPending: "Pagamento registrato! In attesa di conferma.", processing: "Elaborazione...", paymentSuccess: "Pagamento approvato!", selectCountry: "Seleziona Paese", searchCountry: "Cerca paese...", phone: "Numero di Telefono", fillAllFields: "Compila tutti i campi" },
  legal: { badgeLegal: "LEGALE", termsTitle: "TERMINI DI SERVIZIO" },
  faq: {
    title: "DOMANDE FREQUENTI",
    badge: "FAQ",
    q1: "È necessaria esperienza pregressa?",
    a1: "No. La nostra infrastruttura è completamente automatizzata. Devi solo selezionare il livello di allocazione e monitorare le performance tramite il terminale.",
    q2: "Quali sono i rischi coinvolti?",
    a2: "Come in qualsiasi mercato finanziario, esistono rischi di perdita di capitale dovuti alla volatilità. Utilizziamo protocolli avanzati di mitigazione per proteggere il capitale.",
    q3: "Come funziona il sistema?",
    a3: "I nostri algoritmi proprietari eseguono strategie quantitative ad alta frequenza sui mercati globali con precisione di millisecondi.",
    q4: "Posso cancellare il mio piano?",
    a4: "Sì. Puoi richiedere la cancellazione e il prelievo del capitale in qualsiasi momento tramite i protocolli del pannello."
  },
  diffs: {
    title: "PERCHÉ BRAXEL MARKETS?",
    badge: "DIFFERENZIALI",
    t1: "Tecnologia Proprietaria",
    d1: "Reti neurali progettate per esecuzione di livello istituzionale.",
    t2: "Automazione Totale",
    d2: "Gestione algoritmica 24/7 senza bias emotivo umano.",
    t3: "Accesso Semplificato",
    d3: "Infrastruttura istituzionale accessibile tramite terminale intuitivo.",
    t4: "Livello Professionale",
    d4: "Connessione diretta a pool di liquidità globali con latenza ultra-bassa."
  },
  signals: {
    title: "ESECUZIONE",
    subtitle: "ALGORITMICA",
    badge: "TERMINALE IN TEMPO REALE",
    desc: "Monitora la nostra infrastruttura proprietaria in tempo reale. Ogni segnale è elaborato dalle nostre reti neurali con precisione di millisecondi.",
    asset: "ASSET",
    type: "TIPO",
    entry: "INGRESSO",
    profit: "PROFITTO",
    status: "STATO",
    active: "ATTIVO",
    completed: "COMPLETATO"
  }
};

// Spanish translations
const esTranslation = {
  nav: { pricing: "PLANES DE INVERSIÓN", howItWorks: "INFRAESTRUCTURA", about: "SOBRE NOSOTROS", contact: "SOPORTE INSTITUCIONAL", login: "ACCESO AL TERMINAL", support: "Soporte", openAccount: "CREAR CUENTA", dashboard: "PANEL", logout: "CERRAR SESIÓN" },
  footer: { desc: "Infraestructura de inversión de nivel institucional. Tecnología propietaria para el mercado moderno.", platform: "Plataforma", company: "Empresa", support: "Soporte Digital", rights: "Todos los derechos reservados.", privacy: "Privacidad", terms: "Términos", disclaimer: "Aviso Financiero", address: "Dirección Comercial", addressValue: "Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, Brasil", riskTitle: "AVISO DE RIESGO", riskText: "El trading en mercados financieros implica un riesgo sustancial de pérdida y no es apto para todos los inversores. El rendimiento pasado no es indicativo de resultados futuros. El valor de las inversiones puede disminuir o aumentar. No invierta dinero que no pueda permitirse perder. Braxel Markets no garantiza rendimientos específicos." },
  chatbot: { title: "Soporte Braxel", placeholder: "Escribe un mensaje...", emailSupport: "Email:" },
  auth: { loginTitle: "Iniciar Sesión", loginSubtitle: "Ingrese sus credenciales de acceso.", registerTitle: "Crear Cuenta", registerSubtitle: "Comience su camino en el mercado institucional.", email: "Correo Electrónico", password: "Contraseña", fullName: "Nombre Completo", forgotPassword: "¿Olvidó su contraseña?", noAccount: "¿No tiene una cuenta?", hasAccount: "¿Ya tiene acceso?", btnAccess: "ACCEDER A LA CUENTA", btnCreate: "CREAR MI CUENTA", termsAgree: "Acepto los Términos y la Privacidad.", futureTitle: "El Futuro de la", futureSubtitle: "Inversión", features: ["Algoritmos de nivel institucional", "Protección avanzada del capital", "Ejecución en milisegundos", "Transparencia total"] },
  hero: { title1: "GESTIÓN ALGORÍTMICA", title2: "DE CAPITAL DE ÉLITE.", desc: "Implemente estrategias cuantitativas de nivel institucional diseñadas para el mercado moderno. Experimente precisión de ejecución en milisegundos y protocolos avanzados de mitigación de riesgo.", getStarted: "EXPLORAR PLANES DE INVERSIÓN", viewStrategies: "METODOLOGÍA TÉCNICA" },
  stats: { volume: "Gestión Estratégica de Capital", traders: "Cuentas Activas", uptime: "Uptime de Infraestructura", latency: "Precisión de Ejecución" },
  methodology: { badge: "METODOLOGÍA", title: "MODELOS CUANTITATIVOS", statArb: { title: "ARBITRAJE ESTADÍSTICO", desc: "Explotación de ineficiencias temporales de precio entre activos correlacionados utilizando modelos de cointegración y pair trading.", f1: "Análisis de Cointegración", f2: "Algoritmos de Selección de Pares", f3: "Umbral Z-Score" }, meanRev: { title: "REVERSIÓN A LA MEDIA", desc: "Identificación de desviaciones de precio respecto a promedios históricos, con reglas sistemáticas de entrada y salida.", f1: "Señales de Bandas de Bollinger", f2: "Detección de Divergencia RSI", f3: "Modelos Ornstein-Uhlenbeck" }, hft: { title: "TRADING DE ALTA FRECUENCIA", desc: "Estrategias de ejecución de latencia ultra-baja con infraestructura co-localizada para órdenes a nivel de microsegundos.", f1: "Microestructura de Mercado", f2: "Análisis de Flujo de Órdenes", f3: "Arbitraje de Latencia" } },
  transparency: { badge: "INFRAESTRUCTURA", title: "TECNOLOGÍA TRANSPARENTE", desc: "Nuestra infraestructura está construida sobre bases enterprise, garantizando confiabilidad, velocidad y seguridad.", connectivity: { title: "CONECTIVIDAD", desc: "Acceso directo al mercado vía centros de datos Equinix (NY5, LD4, TY3) con conectividad sub-milisegundo a las principales bolsas." }, cloud: { title: "EJECUCIÓN EN LA NUBE", desc: "Motores de ejecución redundantes en AWS (us-east-1, eu-west-1) y Azure para resiliencia de failover." }, security: { title: "SEGURIDAD", desc: "Cifrado de extremo a extremo, conformidad SOC 2 Tipo II y autenticación multicapa para todas las operaciones." } },
  process_home: { badge: "PROCESO", title: "FLUJO", subtitle: "INSTITUCIONAL", step1: { title: "REGISTRO", desc: "Onboarding seguro y verificación de identidad." }, step2: { title: "ASIGNACIÓN", desc: "Selección del nivel de capital gestionado." }, step3: { title: "INTEGRACIÓN", desc: "Implementación de la infraestructura algorítmica." }, step4: { title: "MONITOREO", desc: "Seguimiento del rendimiento en tiempo real." }, step5: { title: "LIQUIDEZ", desc: "Protocolos simplificados de retiro de ganancias." } },
  cta_home: { badge: "OPORTUNIDAD", title: "ESCALA TU", subtitle: "CAPITAL", desc: "Únete al grupo de élite de inversores que utilizan la infraestructura propietaria de Braxel.", btn: "INICIAR ASIGNACIÓN", trust: "Seguridad de Nivel Institucional" },
  pricing: { badge: "TRANSPARENCIA", title: "ASIGNACIONES DE", subtitle: "CAPITAL", desc: "Infraestructura de nivel institucional con una estructura de tarifas transparente.", select: "ASEGURAR ESTE PLAN", allocation: "CAPITAL GESTIONADO", month: "tarifa mensual" },
  howItWorks: { badge: "INFRAESTRUCTURA", title: "ARQUITECTURA", subtitle: "TÉCNICA", desc: "Nuestro ecosistema propietario está construido para velocidad, seguridad y rendimiento constante.", steps: [{ title: "REGISTRO", desc: "Cree su perfil institucional." }, { title: "PANEL", desc: "Acceda a su terminal privado de gestión." }, { title: "SELECCIÓN DE PLAN", desc: "Elija su nivel de asignación de capital." }, { title: "IMPLEMENTACIÓN API", desc: "Conexión automatizada a mercados globales." }, { title: "EJECUCIÓN", desc: "Procesamiento de órdenes en milisegundos." }, { title: "REPORTES", desc: "Análisis detallado de rendimiento semanal." }], cta: "¿LISTO PARA COMENZAR?", ctaBtn: "UNIRSE A LA RED" },
  about: { badge: "SOBRE NOSOTROS", title: "EXCELENCIA", subtitle: "INSTITUCIONAL", desc: "Braxel Markets representa la cúspide de la gestión algorítmica de capital.", historyTitle: "NUESTRA HISTORIA", historyDesc1: "Fundada por un equipo de analistas cuantitativos e ingenieros de software, Braxel fue creada para cerrar la brecha entre el capital retail y la tecnología institucional.", historyDesc2: "Hoy nos enfocamos en rendimientos ajustados al riesgo y estabilidad de infraestructura, proporcionando estrategias algorítmicas de vanguardia para el inversor moderno.", stats: { founded: "Fundada", users: "Usuarios Activos", uptime: "Uptime", support: "Soporte" }, values: { mission: "MISIÓN", missionDesc: "Proporcionar infraestructura algorítmica de élite para el capital global.", vision: "VISIÓN", visionDesc: "Definir el futuro de la gestión cuantitativa automatizada.", values: "VALORES", valuesDesc: "Transparencia, precisión y seguridad inquebrantable." }, teamTitle: "EQUIPO DE LIDERAZGO", teamDesc: "Conozca a los fundadores y gestores detrás de Braxel Markets.", team: [{ name: "Bernardo Campi", role: "Fundador & CEO", bio: "Estratega cuantitativo y emprendedor liderando la visión de Braxel Markets para infraestructura algorítmica institucional.", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[Nombre del Co-Fundador]", role: "Co-Fundador & CTO", bio: "Ingeniero de software especializado en sistemas de alta frecuencia y computación distribuida.", linkedin: "#", photo: "" }, { name: "[Nombre del Gestor]", role: "Head de Gestión de Riesgo", bio: "Ex analista de riesgo institucional con expertise en optimización de portafolio.", linkedin: "#", photo: "" }] },
  contact: { badge: "SOPORTE", title: "CANALES", subtitle: "INSTITUCIONALES", desc: "Nuestro equipo de soporte dedicado está disponible 24/7 para consultas institucionales.", infoTitle: "CONTACTO", formTitle: "CONSULTA DIRECTA", placeholders: { name: "NOMBRE COMPLETO", email: "CORREO ELECTRÓNICO", subject: "ASUNTO", message: "MENSAJE" }, sendBtn: "ENVIAR CONSULTA" },
  dashboard: { portfolio: "Portafolio", activeServices: "Servicios Activos", newAllocation: "Nueva Asignación", noServices: "No se encontraron planes de inversión activos.", balance: "Saldo Actual", withdraw: "Retiro", liquidity: "Liquidez", requestWithdraw: "Solicitar Retiro", selectAccount: "Seleccionar Cuenta", amount: "Monto (USD)", iban: "IBAN / Datos Bancarios", btnWithdraw: "ENVIAR SOLICITUD DE RETIRO", profile: "Gestión de Perfil", settings: "Configuración", firstName: "Nombre", lastName: "Apellido", saveChanges: "GUARDAR CAMBIOS", verifiedAccount: "Cuenta Verificada", totalAUM: "Total de Activos en Gestión", activeAlgos: "Algoritmos Activos", systemStatus: "Estado del Sistema", operational: "Operativo", infraProtection: "Protección de Infraestructura", twoFactor: "Autenticación de Dos Factores", notEnabled: "No Activada", enable2FA: "Activar 2FA", kycStatus: "Verificación KYC", verified: "Verificado", viewDocs: "Ver Documentos", investor: "Inversor", kycRequired: "Verificación KYC Requerida", kycRequiredDesc: "Complete la verificación de identidad para acceder a todas las funciones de la plataforma. Esto es obligatorio para todas las cuentas que gestionan capital.", kycUnderReview: "KYC en Revisión", kycUnderReviewDesc: "Sus documentos están siendo revisados por nuestro equipo de compliance. Esto suele tardar 24-48 horas.", kycRejected: "Verificación KYC Rechazada", kycRejectedDesc: "Sus documentos no fueron aceptados. Por favor, reenvíe con documentación válida.", resubmitDocs: "Reenviar Documentos", completeVerification: "Completar Verificación", verificationRequired: "Verificación Requerida", goToVerification: "Ir a Verificación", totalProfit: "Ganancia Total", drawdown: "Drawdown", maxDrawdown: "Drawdown Máximo", assetsInOperation: "Activos en Operación", monthlyReturns: "Rendimientos Mensuales", analytics: "Análisis", newWithdrawalRequest: "Nueva Solicitud de Retiro", walletIban: "Cartera / IBAN", network: "Red", transactionHistory: "Historial de Transacciones", operations: "Operaciones", asset: "Activo", type: "Tipo", entry: "Entrada", exit: "Salida", profit: "Ganancia", time: "Hora", status: "Estado", open: "Abierto", closed: "Cerrado", accountNotFound: "Cuenta no encontrada. Por favor, cree una cuenta primero.", loginSuccess: "¡Inicio de sesión exitoso!", rememberMe: "Recordarme", kycRequiredDesc: "Пройдите проверку личности для доступа ко всем функциям платформы. Это обязательно для всех аккаунтов, управляющих капиталом.", kycUnderReview: "KYC на рассмотрении", kycUnderReviewDesc: "Ваши документы проверяются нашей командой комплаенс. Обычно это занимает 24-48 часов.", kycRejected: "Верификация KYC отклонена", kycRejectedDesc: "Ваши документы не были приняты. Пожалуйста, отправьте действительные документы повторно.", resubmitDocs: "Повторно отправить документы", completeVerification: "Завершить верификацию", verificationRequired: "Требуется верификация", goToVerification: "Перейти к верификации", totalProfit: "Общая прибыль", drawdown: "Просадка", maxDrawdown: "Макс. просадка", assetsInOperation: "Активы в работе", monthlyReturns: "Месячная доходность", analytics: "Аналитика", newWithdrawalRequest: "Новая заявка на вывод", walletIban: "Кошелёк / IBAN", network: "Сеть", transactionHistory: "История транзакций", operations: "Операции", asset: "Актив", type: "Тип", entry: "Вход", exit: "Выход", profit: "Прибыль", time: "Время", status: "Статус", open: "Открыт", closed: "Закрыт", accountNotFound: "Аккаунт не найден. Пожалуйста, сначала создайте аккаунт.", loginSuccess: "Вход выполнен успешно!", rememberMe: "Запомнить меня" },
  checkout: { summary: "RESUMEN", allocationTitle: "Asignación", allocationSubtitle: "Institucional", tierLabel: "Nivel de Infraestructura Algorítmica", billedMonthly: "Facturado Mensualmente", detailsTitle: "Detalles de Asignación", managedCapital: "Capital Gestionado", setupFee: "Tarifa de Configuración", waived: "EXENTA", latency: "Latencia de Ejecución", infrastructureTitle: "Infraestructura Incluida", realTimeMonitoring: "Monitoreo en Tiempo Real", activeUponDeployment: "Activo tras la implementación", totalDue: "Total Adeudado", dedicatedNode: "Nodo Dedicado", globalMarkets: "Mercados Globales", instantSetup: "Configuración Instantánea", authRequired: "AUTENTICACIÓN REQUERIDA", authDesc: "Inicie sesión o cree una cuenta para proceder con la asignación.", btnLogin: "INICIAR SESIÓN PARA PROCEDER", btnRegister: "CREAR CUENTA", confirmDeployment: "Confirmar Implementación", deploymentDesc: "Al confirmar, autoriza la implementación de la infraestructura algorítmica asociada al plan {{plan}}.", proceedPayment: "PROCEDER AL PAGO SEGURO", secureGateway: "Gateway Seguro", back: "Volver", riskDisclosure: "Divulgación de Riesgo: El trading algorítmico implica riesgo sustancial de pérdida. El rendimiento pasado no es indicativo de resultados futuros.", secureTransaction: "Transacción Segura", paypalNote: "Su información de pago es procesada de forma segura por PayPal. Braxel Markets no almacena los datos de su tarjeta.", encryptionNote: "Cifrado con Estándares Institucionales AES-256", verifying: "Verificando Transacción Institucional...", loading: "Cargando Terminal...", globalInfra: "Infraestructura Global de Pagos", qrCode: "Código QR", allCards: "Todas las Tarjetas", selectPaymentMethod: "Seleccionar Metodo de Pago", choosePayment: "Elige como quieres pagar", creditCard: "Tarjeta de Credito", instantPayment: "Pago instantaneo", cardDesc: "Visa, Mastercard y otras tarjetas", crypto: "Criptomoneda", cryptoLabel: "USDT, BTC, ETH", cryptoDesc: "Transferencia cripto rapida y segura", securePayment: "Pago Seguro", cardNumber: "Numero de Tarjeta", cardName: "Nombre en la Tarjeta", cardExpiry: "Vencimiento", payNow: "PAGAR AHORA", amountToPay: "Importe a Pagar", selectNetwork: "Seleccionar Red", yourAddress: "Tu Direccion", yourAddressPlaceholder: "Ingresa tu direccion USDT", important: "IMPORTANTE", cryptoNote: "Envia el importe exacto para recibir el plan", confirmCrypto: "CONFIRMAR CON CRYPTO", copied: "Copiado!", cryptoPending: "Pago registrado! Esperando confirmacion.", processing: "Procesando...", paymentSuccess: "Pago aprobado!", selectCountry: "Seleccionar Pais", searchCountry: "Buscar pais...", phone: "Numero de Telefono", fillAllFields: "Completa todos los campos" },
  legal: { badgeLegal: "LEGAL", termsTitle: "TÉRMINOS DE SERVICIO" },
  faq: {
    title: "PREGUNTAS FRECUENTES",
    badge: "FAQ",
    q1: "¿Es necesaria experiencia previa?",
    a1: "No. Nuestra infraestructura está completamente automatizada. Solo necesita seleccionar su nivel de asignación y monitorear el rendimiento a través de su terminal.",
    q2: "¿Cuáles son los riesgos involucrados?",
    a2: "Como en cualquier mercado financiero, existen riesgos de pérdida de capital debido a la volatilidad. Utilizamos protocolos avanzados de mitigación para proteger el capital.",
    q3: "¿Cómo funciona el sistema?",
    a3: "Nuestros algoritmos propietarios ejecutan estrategias cuantitativas de alta frecuencia en mercados globales con precisión de milisegundos.",
    q4: "¿Puedo cancelar mi plan?",
    a4: "Sí. Puede solicitar la cancelación y el retiro del capital en cualquier momento a través de los protocolos de su panel."
  },
  diffs: {
    title: "¿POR QUÉ BRAXEL MARKETS?",
    badge: "DIFERENCIALES",
    t1: "Tecnología Propietaria",
    d1: "Redes neuronales diseñadas para ejecución de nivel institucional.",
    t2: "Automatización Total",
    d2: "Gestión algorítmica 24/7 sin sesgo emocional humano.",
    t3: "Acceso Simplificado",
    d3: "Infraestructura institucional accesible a través de un terminal intuitivo.",
    t4: "Nivel Profesional",
    d4: "Conexión directa a pools de liquidez globales con latencia ultra-baja."
  },
  signals: {
    title: "EJECUCIÓN",
    subtitle: "ALGORÍTMICA",
    badge: "TERMINAL EN TIEMPO REAL",
    desc: "Monitoree nuestra infraestructura propietaria en tiempo real. Cada señal es procesada por nuestras redes neuronales con precisión de milisegundos.",
    asset: "ACTIVO",
    type: "TIPO",
    entry: "ENTRADA",
    profit: "GANANCIA",
    status: "ESTADO",
    active: "ACTIVO",
    completed: "COMPLETADO"
  }
};

// French translations
const frTranslation = {
  nav: { pricing: "PLANS D'INVESTISSEMENT", howItWorks: "INFRASTRUCTURE", about: "À PROPOS", contact: "SUPPORT INSTITUTIONNEL", login: "ACCÈS TERMINAL", support: "Support", openAccount: "CRÉER UN COMPTE", dashboard: "TABLEAU DE BORD", logout: "DÉCONNEXION" },
  footer: { desc: "Infrastructure d'investissement de niveau institutionnel. Technologie propriétaire pour le marché moderne.", platform: "Plateforme", company: "Entreprise", support: "Support Digital", rights: "Tous droits réservés.", privacy: "Confidentialité", terms: "Conditions", disclaimer: "Avertissement Financier", address: "Adresse Commerciale", addressValue: "Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, Brésil", riskTitle: "AVERTISSEMENT SUR LES RISQUES", riskText: "Le trading sur les marchés financiers comporte un risque substantiel de perte et ne convient pas à tous les investisseurs. Les performances passées ne préjugent pas des résultats futurs. La valeur des investissements peut baisser ou augmenter. N'investissez pas d'argent que vous ne pouvez pas vous permettre de perdre. Braxel Markets ne garantit aucun rendement spécifique." },
  chatbot: { title: "Support Braxel", placeholder: "Tapez un message...", emailSupport: "Email:" },
  auth: { loginTitle: "Connexion", loginSubtitle: "Entrez vos identifiants d'accès.", registerTitle: "Créer un Compte", registerSubtitle: "Commencez votre parcours sur le marché institutionnel.", email: "Adresse E-mail", password: "Mot de Passe", fullName: "Nom Complet", forgotPassword: "Mot de passe oublié ?", noAccount: "Vous n'avez pas de compte ?", hasAccount: "Vous avez déjà accès ?", btnAccess: "ACCÉDER AU COMPTE", btnCreate: "CRÉER MON COMPTE", termsAgree: "J'accepte les Conditions et la Confidentialité.", futureTitle: "L'Avenir de", futureSubtitle: "l'Investissement", features: ["Algorithmes de niveau institutionnel", "Protection avancée du capital", "Exécution en millisecondes", "Transparence totale"] },
  hero: { title1: "GESTION ALGORITHMIQUE", title2: "DU CAPITAL D'ÉLITE.", desc: "Déployez des stratégies quantitatives de niveau institutionnel conçues pour le marché moderne. Profitez d'une précision d'exécution en millisecondes et de protocoles avancés de mitigation des risques.", getStarted: "EXPLORER LES PLANS D'INVESTISSEMENT", viewStrategies: "MÉTHODOLOGIE TECHNIQUE" },
  stats: { volume: "Gestion Stratégique du Capital", traders: "Comptes Actifs", uptime: "Uptime Infrastructure", latency: "Précision d'Exécution" },
  methodology: { badge: "MÉTHODOLOGIE", title: "MODÈLES QUANTITATIFS", statArb: { title: "ARBITRAGE STATISTIQUE", desc: "Exploitation des inefficiences temporaires de prix entre actifs corrélés à l'aide de modèles de cointégration et de pair trading.", f1: "Analyse de Cointégration", f2: "Algorithmes de Sélection de Paires", f3: "Seuil Z-Score" }, meanRev: { title: "RETOUR À LA MOYENNE", desc: "Identification des écarts de prix par rapport aux moyennes historiques, avec des règles systématiques d'entrée et de sortie.", f1: "Signaux Bandes de Bollinger", f2: "Détection de Divergence RSI", f3: "Modèles Ornstein-Uhlenbeck" }, hft: { title: "TRADING HAUTE FRÉQUENCE", desc: "Stratégies d'exécution à latence ultra-faible avec infrastructure co-localisée pour des ordres au niveau de la microseconde.", f1: "Microstructure de Marché", f2: "Analyse du Flux d'Ordres", f3: "Arbitrage de Latence" } },
  transparency: { badge: "INFRASTRUCTURE", title: "TECHNOLOGIE TRANSPARENTE", desc: "Notre infrastructure est construite sur des bases enterprise, garantissant fiabilité, vitesse et sécurité.", connectivity: { title: "CONNECTIVITÉ", desc: "Accès direct au marché via les centres de données Equinix (NY5, LD4, TY3) avec connectivité sub-milliseconde aux principales bourses." }, cloud: { title: "EXÉCUTION CLOUD", desc: "Moteurs d'exécution redondants sur AWS (us-east-1, eu-west-1) et Azure pour la résilience de basculement." }, security: { title: "SÉCURITÉ", desc: "Chiffrement de bout en bout, conformité SOC 2 Type II et authentification multicouche pour toutes les opérations." } },
  process_home: { badge: "PROCESSUS", title: "FLUX", subtitle: "INSTITUTIONNEL", step1: { title: "INSCRIPTION", desc: "Intégration sécurisée et vérification d'identité." }, step2: { title: "ALLOCATION", desc: "Sélection du niveau de capital géré." }, step3: { title: "INTÉGRATION", desc: "Déploiement de l'infrastructure algorithmique." }, step4: { title: "SURVEILLANCE", desc: "Suivi des performances en temps réel." }, step5: { title: "LIQUIDITÉ", desc: "Protocoles simplifiés de retrait des bénéfices." } },
  cta_home: { badge: "OPPORTUNITÉ", title: "DÉVELOPPEZ VOTRE", subtitle: "CAPITAL", desc: "Rejoignez le groupe d'élite d'investisseurs utilisant l'infrastructure propriétaire de Braxel.", btn: "DÉMARRER L'ALLOCATION", trust: "Sécurité de Niveau Institutionnel" },
  pricing: { badge: "TRANSPARENCE", title: "ALLOCATIONS DE", subtitle: "CAPITAL", desc: "Infrastructure de niveau institutionnel avec une structure tarifaire transparente.", select: "SÉCURISER CE PLAN", allocation: "CAPITAL GÉRÉ", month: "frais mensuels" },
  howItWorks: { badge: "INFRASTRUCTURE", title: "ARCHITECTURE", subtitle: "TECHNIQUE", desc: "Notre écosystème propriétaire est conçu pour la vitesse, la sécurité et des performances constantes.", steps: [{ title: "INSCRIPTION", desc: "Créez votre profil institutionnel." }, { title: "TABLEAU DE BORD", desc: "Accédez à votre terminal privé de gestion." }, { title: "SÉLECTION DU PLAN", desc: "Choisissez votre niveau d'allocation de capital." }, { title: "DÉPLOIEMENT API", desc: "Connexion automatisée aux marchés mondiaux." }, { title: "EXÉCUTION", desc: "Traitement des ordres en millisecondes." }, { title: "REPORTING", desc: "Analyse détaillée des performances hebdomadaires." }], cta: "PRÊT À COMMENCER ?", ctaBtn: "REJOINDRE LE RÉSEAU" },
  about: { badge: "À PROPOS", title: "EXCELLENCE", subtitle: "INSTITUTIONNELLE", desc: "Braxel Markets représente le sommet de la gestion algorithmique du capital.", historyTitle: "NOTRE HISTOIRE", historyDesc1: "Fondée par une équipe d'analystes quantitatifs et d'ingénieurs logiciels, Braxel a été créée pour combler le fossé entre le capital retail et la technologie institutionnelle.", historyDesc2: "Aujourd'hui, nous nous concentrons sur les rendements ajustés au risque et la stabilité de l'infrastructure, offrant des stratégies algorithmiques de pointe pour l'investisseur moderne.", stats: { founded: "Fondée", users: "Utilisateurs Actifs", uptime: "Uptime", support: "Support" }, values: { mission: "MISSION", missionDesc: "Fournir une infrastructure algorithmique d'élite pour le capital mondial.", vision: "VISION", visionDesc: "Définir l'avenir de la gestion quantitative automatisée.", values: "VALEURS", valuesDesc: "Transparence, précision et sécurité inébranlable." }, teamTitle: "ÉQUIPE DE DIRECTION", teamDesc: "Découvrez les fondateurs et gestionnaires derrière Braxel Markets.", team: [{ name: "Bernardo Campi", role: "Fondateur & CEO", bio: "Stratège quantitatif et entrepreneur dirigeant la vision de Braxel Markets pour l'infrastructure algorithmique institutionnelle.", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[Nom du Co-Fondateur]", role: "Co-Fondateur & CTO", bio: "Ingénieur logiciel spécialisé dans les systèmes haute fréquence et le calcul distribué.", linkedin: "#", photo: "" }, { name: "[Nom du Gestionnaire]", role: "Directeur de la Gestion des Risques", bio: "Ancien analyste de risque institutionnel avec une expertise en optimisation de portefeuille.", linkedin: "#", photo: "" }] },
  contact: { badge: "SUPPORT", title: "CANAUX", subtitle: "INSTITUTIONNELS", desc: "Notre équipe de support dédiée est disponible 24/7 pour les demandes institutionnelles.", infoTitle: "CONTACT", formTitle: "DEMANDE DIRECTE", placeholders: { name: "NOM COMPLET", email: "ADRESSE E-MAIL", subject: "OBJET", message: "MESSAGE" }, sendBtn: "ENVOYER LA DEMANDE" },
  dashboard: { portfolio: "Portefeuille", activeServices: "Services Actifs", newAllocation: "Nouvelle Allocation", noServices: "Aucun plan d'investissement actif trouvé.", balance: "Solde Actuel", withdraw: "Retrait", liquidity: "Liquidité", requestWithdraw: "Demander un Retrait", selectAccount: "Sélectionner le Compte", amount: "Montant (USD)", iban: "IBAN / Coordonnées Bancaires", btnWithdraw: "SOUMETTRE LA DEMANDE DE RETRAIT", profile: "Gestion du Profil", settings: "Paramètres", firstName: "Prénom", lastName: "Nom", saveChanges: "ENREGISTRER LES MODIFICATIONS", verifiedAccount: "Compte Vérifié", totalAUM: "Total des Actifs sous Gestion", activeAlgos: "Algorithmes Actifs", systemStatus: "État du Système", operational: "Opérationnel", infraProtection: "Protection d'Infrastructure", twoFactor: "Authentification à Deux Facteurs", notEnabled: "Non Activée", enable2FA: "Activer 2FA", kycStatus: "Vérification KYC", verified: "Vérifié", viewDocs: "Voir les Documents", investor: "Investisseur", kycRequired: "Vérification KYC Requise", kycRequiredDesc: "Complétez la vérification d'identité pour accéder à toutes les fonctionnalités de la plateforme. Ceci est obligatoire pour tous les comptes gérant du capital.", kycUnderReview: "KYC en Cours", kycUnderReviewDesc: "Vos documents sont en cours d'examen par notre équipe de conformité. Cela prend généralement 24-48 heures.", kycRejected: "Vérification KYC Refusée", kycRejectedDesc: "Vos documents n'ont pas été acceptés. Veuillez renvoyer avec une documentation valide.", resubmitDocs: "Renvoyer les Documents", completeVerification: "Compléter la Vérification", verificationRequired: "Vérification Requise", goToVerification: "Aller à la Vérification", totalProfit: "Profit Total", drawdown: "Drawdown", maxDrawdown: "Drawdown Maximum", assetsInOperation: "Actifs en Opération", monthlyReturns: "Rendements Mensuels", analytics: "Analyses", newWithdrawalRequest: "Nouvelle Demande de Retrait", walletIban: "Portefeuille / IBAN", network: "Réseau", transactionHistory: "Historique des Transactions", operations: "Opérations", asset: "Actif", type: "Type", entry: "Entrée", exit: "Sortie", profit: "Profit", time: "Heure", status: "Statut", open: "Ouvert", closed: "Fermé", accountNotFound: "Compte non trouvé. Veuillez créer un compte d'abord.", loginSuccess: "Connexion réussie!", rememberMe: "Se souvenir de moi", kycRequiredDesc: "Пройдите проверку личности для доступа ко всем функциям платформы. Это обязательно для всех аккаунтов, управляющих капиталом.", kycUnderReview: "KYC на рассмотрении", kycUnderReviewDesc: "Ваши документы проверяются нашей командой комплаенс. Обычно это занимает 24-48 часов.", kycRejected: "Верификация KYC отклонена", kycRejectedDesc: "Ваши документы не были приняты. Пожалуйста, отправьте действительные документы повторно.", resubmitDocs: "Повторно отправить документы", completeVerification: "Завершить верификацию", verificationRequired: "Требуется верификация", goToVerification: "Перейти к верификации", totalProfit: "Общая прибыль", drawdown: "Просадка", maxDrawdown: "Макс. просадка", assetsInOperation: "Активы в работе", monthlyReturns: "Месячная доходность", analytics: "Аналитика", newWithdrawalRequest: "Новая заявка на вывод", walletIban: "Кошелёк / IBAN", network: "Сеть", transactionHistory: "История транзакций", operations: "Операции", asset: "Актив", type: "Тип", entry: "Вход", exit: "Выход", profit: "Прибыль", time: "Время", status: "Статус", open: "Открыт", closed: "Закрыт", accountNotFound: "Аккаунт не найден. Пожалуйста, сначала создайте аккаунт.", loginSuccess: "Вход выполнен успешно!", rememberMe: "Запомнить меня" },
  checkout: { summary: "RÉCAPITULATIF", allocationTitle: "Allocation", allocationSubtitle: "Institutionnelle", tierLabel: "Niveau d'Infrastructure Algorithmique", billedMonthly: "Facturé Mensuellement", detailsTitle: "Détails de l'Allocation", managedCapital: "Capital Géré", setupFee: "Frais de Configuration", waived: "EXONÉRÉS", latency: "Latence d'Exécution", infrastructureTitle: "Infrastructure Incluse", realTimeMonitoring: "Surveillance en Temps Réel", activeUponDeployment: "Actif après déploiement", totalDue: "Total Dû", dedicatedNode: "Nœud Dédié", globalMarkets: "Marchés Mondiaux", instantSetup: "Configuration Instantanée", authRequired: "AUTHENTIFICATION REQUISE", authDesc: "Veuillez vous connecter ou créer un compte pour procéder à l'allocation.", btnLogin: "SE CONNECTER POUR PROCÉDER", btnRegister: "CRÉER UN COMPTE", confirmDeployment: "Confirmer le Déploiement", deploymentDesc: "En confirmant, vous autorisez le déploiement de l'infrastructure algorithmique associée au plan {{plan}}.", proceedPayment: "PROCÉDER AU PAIEMENT SÉCURISÉ", secureGateway: "Passerelle Sécurisée", back: "Retour", riskDisclosure: "Divulgation des Risques : Le trading algorithmique comporte un risque substantiel de perte. Les performances passées ne préjugent pas des résultats futurs.", secureTransaction: "Transaction Sécurisée", paypalNote: "Vos informations de paiement sont traitées en toute sécurité par PayPal. Braxel Markets ne stocke pas les données de votre carte.", encryptionNote: "Chiffré par Standards Institutionnels AES-256", verifying: "Vérification de la Transaction Institutionnelle...", loading: "Chargement du Terminal...", globalInfra: "Infrastructure de Paiement Mondiale", qrCode: "Code QR", allCards: "Toutes les Cartes", selectPaymentMethod: "Selectionner Methode de Paiement", choosePayment: "Choisissez comment vous voulez payer", creditCard: "Carte de Credit", instantPayment: "Paiement instantane", cardDesc: "Visa, Mastercard et autres cartes", crypto: "Cryptomonnaie", cryptoLabel: "USDT, BTC, ETH", cryptoDesc: "Transfert cripto rapide et securise", securePayment: "Paiement Securise", cardNumber: "Numero de Carte", cardName: "Nom sur la Carte", cardExpiry: "Expiration", payNow: "PAYER MAINTENANT", amountToPay: "Montant a Payer", selectNetwork: "Selectionner le Reseau", yourAddress: "Votre Adresse", yourAddressPlaceholder: "Entrez votre adresse USDT", important: "IMPORTANT", cryptoNote: "Envoyez le montant exact pour recevoir le plan", confirmCrypto: "CONFIRMER AVEC CRYPTO", copied: "Copie!", cryptoPending: "Paiement enregistre! En attente de confirmation.", processing: "Traitement...", paymentSuccess: "Paiement approuve!", selectCountry: "Selectionner le Pays", searchCountry: "Rechercher pays...", phone: "Numero de Telephone", fillAllFields: "Remplissez tous les champs" },
  legal: { badgeLegal: "JURIDIQUE", termsTitle: "CONDITIONS D'UTILISATION" },
  faq: {
    title: "QUESTIONS FRÉQUENTES",
    badge: "FAQ",
    q1: "Une expérience préalable est-elle nécessaire ?",
    a1: "Non. Notre infrastructure est entièrement automatisée. Il vous suffit de sélectionner votre niveau d'allocation et de suivre les performances via votre terminal.",
    q2: "Quels sont les risques impliqués ?",
    a2: "Comme sur tout marché financier, il existe des risques de perte en capital dus à la volatilité. Nous utilisons des protocoles avancés de mitigation pour protéger le capital.",
    q3: "Comment fonctionne le système ?",
    a3: "Nos algorithmes propriétaires exécutent des stratégies quantitatives à haute fréquence sur les marchés mondiaux avec une précision de l'ordre de la milliseconde.",
    q4: "Puis-je annuler mon plan ?",
    a4: "Oui. Vous pouvez demander l'annulation et le retrait du capital à tout moment via les protocoles de votre tableau de bord."
  },
  diffs: {
    title: "POURQUOI BRAXEL MARKETS ?",
    badge: "DIFFÉRENTIELS",
    t1: "Technologie Propriétaire",
    d1: "Réseaux neuronaux conçus pour une exécution de niveau institutionnel.",
    t2: "Automatisation Totale",
    d2: "Gestion algorithmique 24/7 sans biais émotionnel humain.",
    t3: "Accès Simplifié",
    d3: "Infrastructure institutionnelle accessible via un terminal intuitif.",
    t4: "Niveau Professionnel",
    d4: "Connexion directe aux pools de liquidité mondiaux avec latence ultra-faible."
  },
  signals: {
    title: "EXÉCUTION",
    subtitle: "ALGORITHMIQUE",
    badge: "TERMINAL EN TEMPS RÉEL",
    desc: "Surveillez notre infrastructure propriétaire en temps réel. Chaque signal est traité par nos réseaux neuronaux avec une précision de l'ordre de la milliseconde.",
    asset: "ACTIF",
    type: "TYPE",
    entry: "ENTRÉE",
    profit: "PROFIT",
    status: "STATUT",
    active: "ACTIF",
    completed: "TERMINÉ"
  }
};

// German translations
const deTranslation = {
  nav: { pricing: "INVESTMENTPLÄNE", howItWorks: "INFRASTRUKTUR", about: "ÜBER UNS", contact: "INSTITUTIONELLER SUPPORT", login: "TERMINAL-ZUGANG", support: "Support", openAccount: "KONTO ERSTELLEN", dashboard: "DASHBOARD", logout: "ABMELDEN" },
  footer: { desc: "Institutionelle Investmentinfrastruktur. Proprietäre Technologie für den modernen Markt.", platform: "Plattform", company: "Unternehmen", support: "Digitaler Support", rights: "Alle Rechte vorbehalten.", privacy: "Datenschutz", terms: "Bedingungen", disclaimer: "Finanzhinweis", address: "Geschäftsadresse", addressValue: "Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, Brasilien", riskTitle: "RISIKOHINWEIS", riskText: "Der Handel an Finanzmärkten birgt ein erhebliches Verlustrisiko und ist nicht für alle Anleger geeignet. Vergangene Ergebnisse sind kein Indikator für zukünftige Ergebnisse. Der Wert von Anlagen kann steigen oder fallen. Investieren Sie kein Geld, dessen Verlust Sie sich nicht leisten können. Braxel Markets garantiert keine bestimmten Renditen." },
  chatbot: { title: "Braxel Support", placeholder: "Nachricht eingeben...", emailSupport: "Email:" },
  auth: { loginTitle: "Anmeldung", loginSubtitle: "Geben Sie Ihre Zugangsdaten ein.", registerTitle: "Konto erstellen", registerSubtitle: "Starten Sie Ihren Weg im institutionellen Markt.", email: "E-Mail-Adresse", password: "Passwort", fullName: "Vollständiger Name", forgotPassword: "Passwort vergessen?", noAccount: "Noch kein Konto?", hasAccount: "Bereits Zugang?", btnAccess: "KONTO ZUGREIFEN", btnCreate: "MEIN KONTO ERSTELLEN", termsAgree: "Ich stimme den AGB und Datenschutzrichtlinien zu.", futureTitle: "Die Zukunft der", futureSubtitle: "Investition", features: ["Institutionelle Algorithmen", "Fortschrittlicher Kapitalschutz", "Ausführung in Millisekunden", "Vollständige Transparenz"] },
  hero: { title1: "ALGORITHMISCHES", title2: "ELITE-KAPITALMANAGEMENT.", desc: "Setzen Sie institutionelle quantitative Strategien ein, die für den modernen Markt entwickelt wurden. Erleben Sie Ausführungspräzision im Millisekundenbereich und fortschrittliche Risikominderungsprotokolle.", getStarted: "INVESTMENTPLÄNE ERKUNDEN", viewStrategies: "TECHNISCHE METHODIK" },
  stats: { volume: "Strategisches Kapitalmanagement", traders: "Aktive Konten", uptime: "Infrastruktur-Uptime", latency: "Ausführungspräzision" },
  methodology: { badge: "METHODIK", title: "QUANTITATIVE MODELLE", statArb: { title: "STATISTISCHE ARBITRAGE", desc: "Ausnutzung temporärer Preisineffizienzen zwischen korrelierten Assets mittels Kointegrationsmodellen und Pair Trading.", f1: "Kointegrationsanalyse", f2: "Pair-Selection-Algorithmen", f3: "Z-Score-Schwellenwert" }, meanRev: { title: "MEAN REVERSION", desc: "Identifikation von Preisabweichungen von historischen Durchschnitten mit systematischen Ein- und Ausstiegsregeln.", f1: "Bollinger-Band-Signale", f2: "RSI-Divergenz-Erkennung", f3: "Ornstein-Uhlenbeck-Modelle" }, hft: { title: "HOCHFREQUENZHANDEL", desc: "Ultra-Low-Latency-Ausführungsstrategien mit co-lokalisierter Infrastruktur für Orderplatzierung im Mikrosekundenbereich.", f1: "Marktmikrostruktur", f2: "Order-Flow-Analyse", f3: "Latenz-Arbitrage" } },
  transparency: { badge: "INFRASTRUKTUR", title: "TRANSPARENTE TECHNOLOGIE", desc: "Unsere Infrastruktur basiert auf Enterprise-Grundlagen und gewährleistet Zuverlässigkeit, Geschwindigkeit und Sicherheit.", connectivity: { title: "KONNEKTIVITÄT", desc: "Direkter Marktzugang über Equinix-Rechenzentren (NY5, LD4, TY3) mit Sub-Millisekunden-Konnektivität zu führenden Börsen." }, cloud: { title: "CLOUD-AUSFÜHRUNG", desc: "Redundante Ausführungsengines auf AWS (us-east-1, eu-west-1) und Azure für Failover-Resilienz." }, security: { title: "SICHERHEIT", desc: "Ende-zu-Ende-Verschlüsselung, SOC 2 Typ II-Konformität und Multi-Layer-Authentifizierung für alle Operationen." } },
  process_home: { badge: "PROZESS", title: "INSTITUTIONELLER", subtitle: "WORKFLOW", step1: { title: "REGISTRIERUNG", desc: "Sicheres Onboarding und Identitätsverifizierung." }, step2: { title: "ALLOKATION", desc: "Auswahl der verwalteten Kapitalstufe." }, step3: { title: "INTEGRATION", desc: "Bereitstellung der algorithmischen Infrastruktur." }, step4: { title: "ÜBERWACHUNG", desc: "Echtzeit-Performance-Tracking über Terminal." }, step5: { title: "LIQUIDITÄT", desc: "Vereinfachte Gewinnabhebungsprotokolle." } },
  cta_home: { badge: "CHANCE", title: "SKALIEREN SIE IHR", subtitle: "KAPITAL", desc: "Treten Sie der Elite-Gruppe von Investoren bei, die Braxels proprietäre Infrastruktur nutzen.", btn: "ALLOKATION STARTEN", trust: "Institutionelle Sicherheit" },
  pricing: { badge: "TRANSPARENZ", title: "KAPITAL-", subtitle: "ALLOKATIONEN", desc: "Institutionelle Infrastruktur mit transparenter Gebührenstruktur.", select: "DIESEN PLAN SICHERN", allocation: "VERWALTETES KAPITAL", month: "monatliche Gebühr" },
  howItWorks: { badge: "INFRASTRUKTUR", title: "TECHNISCHE", subtitle: "ARCHITEKTUR", desc: "Unser proprietäres Ökosystem ist auf Geschwindigkeit, Sicherheit und konsistente Performance ausgelegt.", steps: [{ title: "REGISTRIERUNG", desc: "Erstellen Sie Ihr institutionelles Profil." }, { title: "DASHBOARD", desc: "Zugang zu Ihrem privaten Management-Terminal." }, { title: "PLANAUSWAHL", desc: "Wählen Sie Ihre Kapitalallokationsstufe." }, { title: "API-BEREITSTELLUNG", desc: "Automatisierte Anbindung an globale Märkte." }, { title: "AUSFÜHRUNG", desc: "Orderverarbeitung in Millisekunden." }, { title: "REPORTING", desc: "Detaillierte wöchentliche Performance-Analysen." }], cta: "BEREIT ZU STARTEN?", ctaBtn: "DEM NETZWERK BEITRETEN" },
  about: { badge: "ÜBER UNS", title: "INSTITUTIONELLE", subtitle: "EXZELLENZ", desc: "Braxel Markets repräsentiert den Gipfel des algorithmischen Kapitalmanagements.", historyTitle: "UNSERE GESCHICHTE", historyDesc1: "Gegründet von einem Team aus quantitativen Analysten und Software-Ingenieuren, wurde Braxel geschaffen, um die Lücke zwischen Retail-Kapital und institutioneller Technologie zu schließen.", historyDesc2: "Heute konzentrieren wir uns auf risikoadjustierte Renditen und Infrastrukturstabilität und bieten modernste algorithmische Strategien für den modernen Investor.", stats: { founded: "Gegründet", users: "Aktive Nutzer", uptime: "Uptime", support: "Support" }, values: { mission: "MISSION", missionDesc: "Elite-algorithmische Infrastruktur für globales Kapital bereitzustellen.", vision: "VISION", visionDesc: "Die Zukunft des automatisierten quantitativen Managements zu definieren.", values: "WERTE", valuesDesc: "Transparenz, Präzision und unerschütterliche Sicherheit." }, teamTitle: "FÜHRUNGSTEAM", teamDesc: "Lernen Sie die Gründer und Manager hinter Braxel Markets kennen.", team: [{ name: "Bernardo Campi", role: "Gründer & CEO", bio: "Quantitativer Stratege und Unternehmer, der die Vision von Braxel Markets für institutionelle algorithmische Infrastruktur leitet.", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[Name des Co-Gründers]", role: "Co-Gründer & CTO", bio: "Software-Ingenieur spezialisiert auf Hochfrequenzsysteme und verteiltes Rechnen.", linkedin: "#", photo: "" }, { name: "[Name des Managers]", role: "Leiter Risikomanagement", bio: "Ehemaliger institutioneller Risikoanalyst mit Expertise in Portfolio-Optimierung.", linkedin: "#", photo: "" }] },
  contact: { badge: "SUPPORT", title: "INSTITUTIONELLE", subtitle: "KANÄLE", desc: "Unser engagiertes Support-Team ist 24/7 für institutionelle Anfragen verfügbar.", infoTitle: "KONTAKT", formTitle: "DIREKTE ANFRAGE", placeholders: { name: "VOLLSTÄNDIGER NAME", email: "E-MAIL-ADRESSE", subject: "BETREFF", message: "NACHRICHT" }, sendBtn: "ANFRAGE SENDEN" },
  dashboard: { portfolio: "Portfolio", activeServices: "Aktive Dienste", newAllocation: "Neue Allokation", noServices: "Keine aktiven Investmentpläne gefunden.", balance: "Aktueller Saldo", withdraw: "Abhebung", liquidity: "Liquidität", requestWithdraw: "Abhebung beantragen", selectAccount: "Konto auswählen", amount: "Betrag (USD)", iban: "IBAN / Bankdaten", btnWithdraw: "ABHEBUNGSANTRAG EINREICHEN", profile: "Profilverwaltung", settings: "Einstellungen", firstName: "Vorname", lastName: "Nachname", saveChanges: "ÄNDERUNGEN SPEICHERN", verifiedAccount: "Verifiziertes Konto", totalAUM: "Gesamtes verwaltetes Vermögen", activeAlgos: "Aktive Algorithmen", systemStatus: "Systemstatus", operational: "Betriebsbereit", infraProtection: "Infrastrukturschutz", twoFactor: "Zwei-Faktor-Authentifizierung", notEnabled: "Nicht aktiviert", enable2FA: "2FA aktivieren", kycStatus: "KYC-Verifizierung", verified: "Verifiziert", viewDocs: "Dokumente anzeigen", investor: "Investor", kycRequired: "KYC-Verifizierung Erforderlich", kycRequiredDesc: "Füllen Sie die Identitätsprüfung aus, um alle Funktionen der Plattform zu nutzen. Dies ist für alle Konten, die Kapital verwalten, obligatorisch.", kycUnderReview: "KYC in Prüfung", kycUnderReviewDesc: "Ihre Dokumente werden von unserem Compliance-Team geprüft. Dies dauert in der Regel 24-48 Stunden.", kycRejected: "KYC Abgelehnt", kycRejectedDesc: "Ihre Dokumente wurden nicht akzeptiert. Bitte reichen Sie gültige Unterlagen erneut ein.", resubmitDocs: "Dokumente Erneut Einreichen", completeVerification: "Verifizierung Abschließen", verificationRequired: "Verifizierung Erforderlich", goToVerification: "Zur Verifizierung", totalProfit: "Gesamtgewinn", drawdown: "Drawdown", maxDrawdown: "Max Drawdown", assetsInOperation: "Aktive Vermögenswerte", monthlyReturns: "Monatliche Renditen", analytics: "Analysen", newWithdrawalRequest: "Neue Auszahlungsanfrage", walletIban: "Wallet / IBAN", network: "Netzwerk", transactionHistory: "Transaktionsverlauf", operations: "Operationen", asset: "Vermögenswert", type: "Typ", entry: "Eintrag", exit: "Ausgang", profit: "Gewinn", time: "Zeit", status: "Status", open: "Offen", closed: "Geschlossen", accountNotFound: "Konto nicht gefunden. Bitte erstellen Sie zuerst ein Konto.", loginSuccess: "Erfolgreich angemeldet!", rememberMe: "Angemeldet bleiben", kycRequiredDesc: "Пройдите проверку личности для доступа ко всем функциям платформы. Это обязательно для всех аккаунтов, управляющих капиталом.", kycUnderReview: "KYC на рассмотрении", kycUnderReviewDesc: "Ваши документы проверяются нашей командой комплаенс. Обычно это занимает 24-48 часов.", kycRejected: "Верификация KYC отклонена", kycRejectedDesc: "Ваши документы не были приняты. Пожалуйста, отправьте действительные документы повторно.", resubmitDocs: "Повторно отправить документы", completeVerification: "Завершить верификацию", verificationRequired: "Требуется верификация", goToVerification: "Перейти к верификации", totalProfit: "Общая прибыль", drawdown: "Просадка", maxDrawdown: "Макс. просадка", assetsInOperation: "Активы в работе", monthlyReturns: "Месячная доходность", analytics: "Аналитика", newWithdrawalRequest: "Новая заявка на вывод", walletIban: "Кошелёк / IBAN", network: "Сеть", transactionHistory: "История транзакций", operations: "Операции", asset: "Актив", type: "Тип", entry: "Вход", exit: "Выход", profit: "Прибыль", time: "Время", status: "Статус", open: "Открыт", closed: "Закрыт", accountNotFound: "Аккаунт не найден. Пожалуйста, сначала создайте аккаунт.", loginSuccess: "Вход выполнен успешно!", rememberMe: "Запомнить меня" },
  checkout: { summary: "ZUSAMMENFASSUNG", allocationTitle: "Institutionelle", allocationSubtitle: "Allokation", tierLabel: "Algorithmische Infrastrukturstufe", billedMonthly: "Monatlich abgerechnet", detailsTitle: "Allokationsdetails", managedCapital: "Verwaltetes Kapital", setupFee: "Einrichtungsgebühr", waived: "ERLASSEN", latency: "Ausführungslatenz", infrastructureTitle: "Enthaltene Infrastruktur", realTimeMonitoring: "Echtzeitüberwachung", activeUponDeployment: "Aktiv nach Bereitstellung", totalDue: "Gesamtbetrag", dedicatedNode: "Dedizierter Knoten", globalMarkets: "Globale Märkte", instantSetup: "Sofortige Einrichtung", authRequired: "AUTHENTIFIZIERUNG ERFORDERLICH", authDesc: "Bitte melden Sie sich an oder erstellen Sie ein Konto, um mit der Allokation fortzufahren.", btnLogin: "ANMELDEN ZUM FORTFAHREN", btnRegister: "KONTO ERSTELLEN", confirmDeployment: "Bereitstellung bestätigen", deploymentDesc: "Mit der Bestätigung autorisieren Sie die Bereitstellung der algorithmischen Infrastruktur für den Plan {{plan}}.", proceedPayment: "ZUR SICHEREN ZAHLUNG", secureGateway: "Sicheres Gateway", back: "Zurück", riskDisclosure: "Risikohinweis: Algorithmischer Handel birgt erhebliches Verlustrisiko. Vergangene Performance ist kein Indikator für zukünftige Ergebnisse.", secureTransaction: "Sichere Transaktion", paypalNote: "Ihre Zahlungsinformationen werden sicher über PayPal verarbeitet. Braxel Markets speichert keine Kartendaten.", encryptionNote: "Verschlüsselt mit institutionellen AES-256-Standards", verifying: "Institutionelle Transaktion wird verifiziert...", loading: "Terminal wird geladen...", globalInfra: "Globale Zahlungsinfrastruktur", qrCode: "QR-Code", allCards: "Alle Karten", selectPaymentMethod: "Zahlungsmethode Wahlen", choosePayment: "Wahlen Sie wie Sie zahlen mochten", creditCard: "Kreditkarte", instantPayment: "Sofortzahlung", cardDesc: "Visa, Mastercard und andere Karten", crypto: "Kryptowahrung", cryptoLabel: "USDT, BTC, ETH", cryptoDesc: "Schnelle und sichere Krypto-Transaktion", securePayment: "Sichere Zahlung", cardNumber: "Kartennummer", cardName: "Name auf der Karte", cardExpiry: "Ablauf", payNow: "JETZT ZAHLEN", amountToPay: "Zu zahlender Betrag", selectNetwork: "Netzwerk Wahlen", yourAddress: "Ihre Adresse", yourAddressPlaceholder: "Geben Sie Ihre USDT-Adresse ein", important: "WICHTIG", cryptoNote: "Senden Sie den genauen Betrag um den Plan zu erhalten", confirmCrypto: "MIT CRYPTO BESTATIGEN", copied: "Kopiert!", cryptoPending: "Zahlung registriert! Bestatigung abwarten.", processing: "Verarbeitung...", paymentSuccess: "Zahlung genehmigt!", selectCountry: "Land Auswahlen", searchCountry: "Land suchen...", phone: "Telefonnummer", fillAllFields: "Fullen Sie alle Felder aus" },
  legal: { badgeLegal: "RECHTLICHES", termsTitle: "NUTZUNGSBEDINGUNGEN" },
  faq: {
    title: "HÄUFIG GESTELLTE FRAGEN",
    badge: "FAQ",
    q1: "Ist Vorerfahrung notwendig?",
    a1: "Nein. Unsere Infrastruktur ist vollständig automatisiert. Sie müssen nur Ihre Allokationsstufe wählen und die Performance über Ihr Terminal überwachen.",
    q2: "Welche Risiken sind beteiligt?",
    a2: "Wie an jedem Finanzmarkt bestehen Risiken eines Kapitalverlusts durch Volatilität. Wir verwenden fortschrittliche Minderungsprotokolle zum Kapitalschutz.",
    q3: "Wie funktioniert das System?",
    a3: "Unsere proprietären Algorithmen führen hochfrequente quantitative Strategien an globalen Märkten mit Millisekundenpräzision aus.",
    q4: "Kann ich meinen Plan kündigen?",
    a4: "Ja. Sie können jederzeit die Kündigung und den Kapitalabzug über die Protokolle Ihres Dashboards beantragen."
  },
  diffs: {
    title: "WARUM BRAXEL MARKETS?",
    badge: "UNTERSCHEIDUNGSMERKMALE",
    t1: "Proprietäre Technologie",
    d1: "Neuronale Netze für institutionelle Ausführung entwickelt.",
    t2: "Vollständige Automatisierung",
    d2: "24/7 algorithmisches Management ohne menschliche emotionale Verzerrung.",
    t3: "Vereinfachter Zugang",
    d3: "Institutionelle Infrastruktur über ein intuitives Terminal zugänglich.",
    t4: "Professionelles Niveau",
    d4: "Direkte Verbindung zu globalen Liquiditätspools mit ultra-niedriger Latenz."
  },
  signals: {
    title: "ALGORITHMISCHE",
    subtitle: "AUSFÜHRUNG",
    badge: "ECHTZEIT-TERMINAL",
    desc: "Überwachen Sie unsere proprietäre Infrastruktur in Echtzeit. Jedes Signal wird von unseren neuronalen Netzen mit Millisekundenpräzision verarbeitet.",
    asset: "ASSET",
    type: "TYP",
    entry: "EINSTIEG",
    profit: "GEWINN",
    status: "STATUS",
    active: "AKTIV",
    completed: "ABGESCHLOSSEN"
  }
};

// Russian translations
const ruTranslation = {
  nav: { pricing: "ИНВЕСТИЦИОННЫЕ ПЛАНЫ", howItWorks: "ИНФРАСТРУКТУРА", about: "О НАС", contact: "ИНСТИТУЦИОНАЛЬНАЯ ПОДДЕРЖКА", login: "ДОСТУП К ТЕРМИНАЛУ", support: "Поддержка", openAccount: "СОЗДАТЬ АККАУНТ", dashboard: "ПАНЕЛЬ УПРАВЛЕНИЯ", logout: "ВЫХОД" },
  footer: { desc: "Инвестиционная инфраструктура институционального уровня. Проприетарная технология для современного рынка.", platform: "Платформа", company: "Компания", support: "Цифровая Поддержка", rights: "Все права защищены.", privacy: "Конфиденциальность", terms: "Условия", disclaimer: "Финансовое Уведомление", address: "Коммерческий Адрес", addressValue: "Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, Бразилия", riskTitle: "ПРЕДУПРЕЖДЕНИЕ О РИСКАХ", riskText: "Торговля на финансовых рынках сопряжена со значительным риском убытков и подходит не всем инвесторам. Прошлые результаты не гарантируют будущих. Стоимость инвестиций может как расти, так и падать. Не инвестируйте средства, потерю которых вы не можете себе позволить. Braxel Markets не гарантирует конкретной доходности." },
  chatbot: { title: "Поддержка Braxel", placeholder: "Введите сообщение...", emailSupport: "Email:" },
  auth: { loginTitle: "Вход", loginSubtitle: "Введите ваши учётные данные.", registerTitle: "Создать Аккаунт", registerSubtitle: "Начните свой путь на институциональном рынке.", email: "Электронная Почта", password: "Пароль", fullName: "Полное Имя", forgotPassword: "Забыли пароль?", noAccount: "Нет аккаунта?", hasAccount: "Уже есть доступ?", btnAccess: "ВОЙТИ В АККАУНТ", btnCreate: "СОЗДАТЬ АККАУНТ", termsAgree: "Я принимаю Условия и Политику конфиденциальности.", futureTitle: "Будущее", futureSubtitle: "Инвестиций", features: ["Алгоритмы институционального уровня", "Продвинутая защита капитала", "Исполнение в миллисекундах", "Полная прозрачность"] },
  hero: { title1: "ЭЛИТНОЕ АЛГОРИТМИЧЕСКОЕ", title2: "УПРАВЛЕНИЕ КАПИТАЛОМ.", desc: "Применяйте количественные стратегии институционального уровня, разработанные для современного рынка. Испытайте точность исполнения в миллисекундах и продвинутые протоколы снижения рисков.", getStarted: "ИЗУЧИТЬ ИНВЕСТИЦИОННЫЕ ПЛАНЫ", viewStrategies: "ТЕХНИЧЕСКАЯ МЕТОДОЛОГИЯ" },
  stats: { volume: "Стратегическое Управление Капиталом", traders: "Активные Счета", uptime: "Время Безотказной Работы", latency: "Точность Исполнения" },
  methodology: { badge: "МЕТОДОЛОГИЯ", title: "КОЛИЧЕСТВЕННЫЕ МОДЕЛИ", statArb: { title: "СТАТИСТИЧЕСКИЙ АРБИТРАЖ", desc: "Использование временных ценовых неэффективностей между коррелированными активами с помощью моделей коинтеграции и парного трейдинга.", f1: "Анализ Коинтеграции", f2: "Алгоритмы Выбора Пар", f3: "Порог Z-Score" }, meanRev: { title: "ВОЗВРАТ К СРЕДНЕМУ", desc: "Выявление отклонений цены от исторических средних с систематическими правилами входа и выхода.", f1: "Сигналы Полос Боллинджера", f2: "Обнаружение Дивергенции RSI", f3: "Модели Орнштейна-Уленбека" }, hft: { title: "ВЫСОКОЧАСТОТНАЯ ТОРГОВЛЯ", desc: "Стратегии исполнения со сверхнизкой задержкой с использованием совмещённой инфраструктуры для размещения ордеров на уровне микросекунд.", f1: "Микроструктура Рынка", f2: "Анализ Потока Ордеров", f3: "Арбитраж Задержки" } },
  transparency: { badge: "ИНФРАСТРУКТУРА", title: "ПРОЗРАЧНАЯ ТЕХНОЛОГИЯ", desc: "Наша инфраструктура построена на корпоративных основаниях, обеспечивая надёжность, скорость и безопасность.", connectivity: { title: "ПОДКЛЮЧЕНИЕ", desc: "Прямой доступ к рынку через дата-центры Equinix (NY5, LD4, TY3) с субмиллисекундным подключением к ведущим биржам." }, cloud: { title: "ОБЛАЧНОЕ ИСПОЛНЕНИЕ", desc: "Резервные движки исполнения на AWS (us-east-1, eu-west-1) и Azure для отказоустойчивости." }, security: { title: "БЕЗОПАСНОСТЬ", desc: "Сквозное шифрование, соответствие SOC 2 Type II и многоуровневая аутентификация для всех операций." } },
  process_home: { badge: "ПРОЦЕСС", title: "ИНСТИТУЦИОНАЛЬНЫЙ", subtitle: "ПРОЦЕСС", step1: { title: "РЕГИСТРАЦИЯ", desc: "Безопасная регистрация и верификация личности." }, step2: { title: "АЛЛОКАЦИЯ", desc: "Выбор уровня управляемого капитала." }, step3: { title: "ИНТЕГРАЦИЯ", desc: "Развёртывание алгоритмической инфраструктуры." }, step4: { title: "МОНИТОРИНГ", desc: "Отслеживание результатов в реальном времени." }, step5: { title: "ЛИКВИДНОСТЬ", desc: "Упрощённые протоколы вывода прибыли." } },
  cta_home: { badge: "ВОЗМОЖНОСТЬ", title: "МАСШТАБИРУЙТЕ СВОЙ", subtitle: "КАПИТАЛ", desc: "Присоединяйтесь к элитной группе инвесторов, использующих проприетарную инфраструктуру Braxel.", btn: "НАЧАТЬ АЛЛОКАЦИЮ", trust: "Безопасность Институционального Уровня" },
  pricing: { badge: "ПРОЗРАЧНОСТЬ", title: "АЛЛОКАЦИИ", subtitle: "КАПИТАЛА", desc: "Институциональная инфраструктура с прозрачной структурой комиссий.", select: "ВЫБРАТЬ ЭТОТ ПЛАН", allocation: "УПРАВЛЯЕМЫЙ КАПИТАЛ", month: "ежемесячная плата" },
  howItWorks: { badge: "ИНФРАСТРУКТУРА", title: "ТЕХНИЧЕСКАЯ", subtitle: "АРХИТЕКТУРА", desc: "Наша проприетарная экосистема создана для скорости, безопасности и стабильной производительности.", steps: [{ title: "РЕГИСТРАЦИЯ", desc: "Создайте институциональный профиль." }, { title: "ПАНЕЛЬ", desc: "Доступ к приватному терминалу управления." }, { title: "ВЫБОР ПЛАНА", desc: "Выберите уровень аллокации капитала." }, { title: "РАЗВЁРТЫВАНИЕ API", desc: "Автоматическое подключение к мировым рынкам." }, { title: "ИСПОЛНЕНИЕ", desc: "Обработка ордеров в миллисекундах." }, { title: "ОТЧЁТНОСТЬ", desc: "Детальная аналитика результатов за неделю." }], cta: "ГОТОВЫ НАЧАТЬ?", ctaBtn: "ПРИСОЕДИНИТЬСЯ К СЕТИ" },
  about: { badge: "О НАС", title: "ИНСТИТУЦИОНАЛЬНОЕ", subtitle: "ПРЕВОСХОДСТВО", desc: "Braxel Markets представляет вершину алгоритмического управления капиталом.", historyTitle: "НАША ИСТОРИЯ", historyDesc1: "Основанная командой количественных аналитиков и программных инженеров, Braxel была создана, чтобы объединить розничный капитал и институциональные технологии.", historyDesc2: "Сегодня мы фокусируемся на доходности с учётом рисков и стабильности инфраструктуры, предоставляя передовые алгоритмические стратегии для современного инвестора.", stats: { founded: "Основана", users: "Активные Пользователи", uptime: "Время Работы", support: "Поддержка" }, values: { mission: "МИССИЯ", missionDesc: "Предоставить элитную алгоритмическую инфраструктуру для глобального капитала.", vision: "ВИДЕНИЕ", visionDesc: "Определить будущее автоматизированного количественного управления.", values: "ЦЕННОСТИ", valuesDesc: "Прозрачность, точность и непоколебимая безопасность." }, teamTitle: "КОМАНДА РУКОВОДСТВА", teamDesc: "Познакомьтесь с основателями и управляющими Braxel Markets.", team: [{ name: "Bernardo Campi", role: "Основатель и CEO", bio: "Количественный стратег и предприниматель, возглавляющий видение Braxel Markets в области институциональной алгоритмической инфраструктуры.", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[Имя Сооснователя]", role: "Сооснователь и CTO", bio: "Программный инженер, специализирующийся на высокочастотных системах и распределённых вычислениях.", linkedin: "#", photo: "" }, { name: "[Имя Управляющего]", role: "Руководитель Управления Рисками", bio: "Бывший институциональный аналитик рисков с глубокой экспертизой в оптимизации портфеля.", linkedin: "#", photo: "" }] },
  contact: { badge: "ПОДДЕРЖКА", title: "ИНСТИТУЦИОНАЛЬНЫЕ", subtitle: "КАНАЛЫ", desc: "Наша специализированная команда поддержки доступна 24/7 для институциональных запросов.", infoTitle: "КОНТАКТЫ", formTitle: "ПРЯМОЙ ЗАПРОС", placeholders: { name: "ПОЛНОЕ ИМЯ", email: "ЭЛЕКТРОННАЯ ПОЧТА", subject: "ТЕМА", message: "СООБЩЕНИЕ" }, sendBtn: "ОТПРАВИТЬ ЗАПРОС" },
  dashboard: { portfolio: "Портфель", activeServices: "Активные Услуги", newAllocation: "Новая Аллокация", noServices: "Активные инвестиционные планы не найдены.", balance: "Текущий Баланс", withdraw: "Вывод", liquidity: "Ликвидность", requestWithdraw: "Запросить Вывод", selectAccount: "Выбрать Счёт", amount: "Сумма (USD)", iban: "IBAN / Банковские Реквизиты", btnWithdraw: "ОТПРАВИТЬ ЗАПРОС НА ВЫВОД", profile: "Управление Профилем", settings: "Настройки", firstName: "Имя", lastName: "Фамилия", saveChanges: "СОХРАНИТЬ ИЗМЕНЕНИЯ", verifiedAccount: "Верифицированный Аккаунт", totalAUM: "Общие Активы под Управлением", activeAlgos: "Активные Алгоритмы", systemStatus: "Статус Системы", operational: "Работает", infraProtection: "Защита Инфраструктуры", twoFactor: "Двухфакторная Аутентификация", notEnabled: "Не Активирована", enable2FA: "Включить 2FA", kycStatus: "Верификация KYC", verified: "Верифицирован", viewDocs: "Просмотр Документов", investor: "Инвестор"  , kycRequired: "Требуется верификация KYC", kycRequiredDesc: "Пройдите проверку личности для доступа ко всем функциям платформы. Это обязательно для всех аккаунтов, управляющих капиталом.", kycUnderReview: "KYC на рассмотрении", kycUnderReviewDesc: "Ваши документы проверяются нашей командой комплаенс. Обычно это занимает 24-48 часов.", kycRejected: "Верификация KYC отклонена", kycRejectedDesc: "Ваши документы не были приняты. Пожалуйста, отправьте действительные документы повторно.", resubmitDocs: "Повторно отправить документы", completeVerification: "Завершить верификацию", verificationRequired: "Требуется верификация", goToVerification: "Перейти к верификации", totalProfit: "Общая прибыль", drawdown: "Просадка", maxDrawdown: "Макс. просадка", assetsInOperation: "Активы в работе", monthlyReturns: "Месячная доходность", analytics: "Аналитика", newWithdrawalRequest: "Новая заявка на вывод", walletIban: "Кошелёк / IBAN", network: "Сеть", transactionHistory: "История транзакций", operations: "Операции", asset: "Актив", type: "Тип", entry: "Вход", exit: "Выход", profit: "Прибыль", time: "Время", status: "Статус", open: "Открыт", closed: "Закрыт", accountNotFound: "Аккаунт не найден. Пожалуйста, сначала создайте аккаунт.", loginSuccess: "Вход выполнен успешно!", rememberMe: "Запомнить меня" },
  checkout: { summary: "ИТОГО", allocationTitle: "Институциональная", allocationSubtitle: "Аллокация", tierLabel: "Уровень Алгоритмической Инфраструктуры", billedMonthly: "Ежемесячная Оплата", detailsTitle: "Детали Аллокации", managedCapital: "Управляемый Капитал", setupFee: "Плата за Настройку", waived: "ОТМЕНЕНА", latency: "Задержка Исполнения", infrastructureTitle: "Включённая Инфраструктура", realTimeMonitoring: "Мониторинг в Реальном Времени", activeUponDeployment: "Активно после развёртывания", totalDue: "Итого к Оплате", dedicatedNode: "Выделенный Узел", globalMarkets: "Глобальные Рынки", instantSetup: "Мгновенная Настройка", authRequired: "ТРЕБУЕТСЯ АУТЕНТИФИКАЦИЯ", authDesc: "Войдите или создайте аккаунт для продолжения аллокации.", btnLogin: "ВОЙТИ ДЛЯ ПРОДОЛЖЕНИЯ", btnRegister: "СОЗДАТЬ АККАУНТ", confirmDeployment: "Подтвердить Развёртывание", deploymentDesc: "Подтверждая, вы разрешаете развёртывание алгоритмической инфраструктуры плана {{plan}}.", proceedPayment: "ПЕРЕЙТИ К БЕЗОПАСНОЙ ОПЛАТЕ", secureGateway: "Безопасный Шлюз", back: "Назад", riskDisclosure: "Раскрытие Рисков: Алгоритмическая торговля сопряжена со значительным риском убытков. Прошлые результаты не гарантируют будущих.", secureTransaction: "Безопасная Транзакция", paypalNote: "Платёжная информация обрабатывается безопасно через PayPal. Braxel Markets не хранит данные вашей карты.", encryptionNote: "Зашифровано по Институциональным Стандартам AES-256", verifying: "Верификация Институциональной Транзакции...", loading: "Загрузка Терминала...", globalInfra: "Глобальная Платёжная Инфраструктура", qrCode: "QR-Код", allCards: "Все Карты", selectPaymentMethod: "Vybrat Sposob Oplaty", choosePayment: "Vyberite sposob oplaty", creditCard: "Kreditnaya Karta", instantPayment: "Mgnovennaya oplata", cardDesc: "Visa, Mastercard i drugie karty", crypto: "Kriptovalyuta", cryptoLabel: "USDT, BTC, ETH", cryptoDesc: "Bystryy i bezopasnyy kripto-perevod", securePayment: "Bezopasnaya Oplata", cardNumber: "Nomer Karty", cardName: "Imya na Karte", cardExpiry: "Srok Deystviya", payNow: "OPLATIT SEYCHAS", amountToPay: "Summa k Oplate", selectNetwork: "Vybrat Set", yourAddress: "Vash Adres", yourAddressPlaceholder: "Vvedite vash adres USDT", important: "VAZHN O", cryptoNote: "Otpravte tochnuyu summu dlya polucheniya plana", confirmCrypto: "PODTVIRDIT KRIPTO", copied: "Skopirovano!", cryptoPending: "Oplata zaregistrirovana! Ozhidanie podtverzhdeniya.", processing: "Obrabotka...", paymentSuccess: "Oplata odobrena!", selectCountry: "Vybrat Stranu", searchCountry: "Poisk strany...", phone: "Nomer Telefona", fillAllFields: "Zapolnite vse polya" },
  legal: { badgeLegal: "ПРАВОВАЯ ИНФОРМАЦИЯ", termsTitle: "УСЛОВИЯ ОБСЛУЖИВАНИЯ" },
  faq: {
    title: "ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ",
    badge: "FAQ",
    q1: "Нужен ли предварительный опыт?",
    a1: "Нет. Наша инфраструктура полностью автоматизирована. Вам нужно только выбрать уровень аллокации и отслеживать результаты через терминал.",
    q2: "Какие риски существуют?",
    a2: "Как и на любом финансовом рынке, существуют риски потери капитала из-за волатильности. Мы используем продвинутые протоколы для защиты капитала.",
    q3: "Как работает система?",
    a3: "Наши проприетарные алгоритмы исполняют высокочастотные количественные стратегии на мировых рынках с миллисекундной точностью.",
    q4: "Могу ли я отменить план?",
    a4: "Да. Вы можете запросить отмену и вывод капитала в любое время через протоколы панели управления."
  },
  diffs: {
    title: "ПОЧЕМУ BRAXEL MARKETS?",
    badge: "ПРЕИМУЩЕСТВА",
    t1: "Проприетарная Технология",
    d1: "Нейронные сети для исполнения институционального уровня.",
    t2: "Полная Автоматизация",
    d2: "Алгоритмическое управление 24/7 без человеческого эмоционального смещения.",
    t3: "Упрощённый Доступ",
    d3: "Институциональная инфраструктура через интуитивный терминал.",
    t4: "Профессиональный Уровень",
    d4: "Прямое подключение к глобальным пулам ликвидности со сверхнизкой задержкой."
  },
  signals: {
    title: "АЛГОРИТМИЧЕСКОЕ",
    subtitle: "ИСПОЛНЕНИЕ",
    badge: "ТЕРМИНАЛ РЕАЛЬНОГО ВРЕМЕНИ",
    desc: "Мониторьте нашу проприетарную инфраструктуру в реальном времени. Каждый сигнал обрабатывается нашими нейронными сетями с миллисекундной точностью.",
    asset: "АКТИВ",
    type: "ТИП",
    entry: "ВХОД",
    profit: "ПРИБЫЛЬ",
    status: "СТАТУС",
    active: "АКТИВНЫЙ",
    completed: "ЗАВЕРШЁН"
  }
};

// Chinese translations
const zhTranslation = {
  nav: { pricing: "投资计划", howItWorks: "基础设施", about: "关于我们", contact: "机构支持", login: "终端访问", support: "支持", openAccount: "创建账户", dashboard: "控制面板", logout: "退出登录" },
  footer: { desc: "机构级投资基础设施。为现代市场打造的专有技术。", platform: "平台", company: "公司", support: "数字支持", rights: "保留所有权利。", privacy: "隐私", terms: "条款", disclaimer: "金融免责声明", address: "商业地址", addressValue: "Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, 巴西", riskTitle: "风险免责声明", riskText: "金融市场交易涉及重大损失风险，并非适合所有投资者。过往业绩不代表未来表现。投资价值可能上升或下降。请勿投资您无法承受损失的资金。Braxel Markets不保证任何特定回报。" },
  auth: { loginTitle: "登录", loginSubtitle: "请输入您的访问凭证。", registerTitle: "创建账户", registerSubtitle: "开启您的机构市场之旅。", email: "电子邮箱", password: "密码", fullName: "全名", forgotPassword: "忘记密码？", noAccount: "还没有账户？", hasAccount: "已有访问权限？", btnAccess: "访问账户", btnCreate: "创建我的账户", termsAgree: "我同意条款和隐私政策。", futureTitle: "投资的", futureSubtitle: "未来", features: ["机构级算法", "高级资本保护", "毫秒级执行", "完全透明"] },
  hero: { title1: "精英算法", title2: "资本管理。", desc: "部署专为现代市场设计的机构级量化策略。体验毫秒级执行精度和先进的风险缓解协议。", getStarted: "探索投资计划", viewStrategies: "技术方法论" },
  stats: { volume: "战略资本管理", traders: "活跃账户", uptime: "基础设施运行时间", latency: "执行精度" },
  methodology: { badge: "方法论", title: "量化模型", statArb: { title: "统计套利", desc: "利用协整模型和配对交易，开发相关资产间的临时价格低效。", f1: "协整分析", f2: "配对选择算法", f3: "Z-Score阈值" }, meanRev: { title: "均值回归", desc: "识别资产价格偏离历史均值的情况，采用系统性的进出场规则。", f1: "布林带信号", f2: "RSI背离检测", f3: "Ornstein-Uhlenbeck模型" }, hft: { title: "高频交易", desc: "利用共址基础设施实现超低延迟执行策略，微秒级下单。", f1: "市场微观结构", f2: "订单流分析", f3: "延迟套利" } },
  transparency: { badge: "基础设施", title: "透明技术", desc: "我们的基础设施建立在企业级基础之上，确保可靠性、速度和安全性。", connectivity: { title: "连接性", desc: "通过Equinix数据中心（NY5、LD4、TY3）直接市场访问，与主要交易所的亚毫秒连接。" }, cloud: { title: "云端执行", desc: "在AWS（us-east-1、eu-west-1）和Azure上部署冗余执行引擎，确保故障转移弹性。" }, security: { title: "安全性", desc: "端到端加密、SOC 2 Type II合规和所有操作的多层认证。" } },
  process_home: { badge: "流程", title: "机构级", subtitle: "工作流", step1: { title: "注册", desc: "安全入驻和身份验证。" }, step2: { title: "配置", desc: "选择管理资本级别。" }, step3: { title: "集成", desc: "部署算法基础设施。" }, step4: { title: "监控", desc: "通过终端实时跟踪表现。" }, step5: { title: "流动性", desc: "简化的利润提取协议。" } },
  cta_home: { badge: "机会", title: "扩展您的", subtitle: "资本", desc: "加入使用Braxel专有基础设施的精英投资者群体。", btn: "开始配置", trust: "机构级安全" },
  pricing: { badge: "透明度", title: "资本", subtitle: "配置", desc: "机构级基础设施，透明费率结构。", select: "选择此计划", allocation: "管理资本", month: "月费" },
  howItWorks: { badge: "基础设施", title: "技术", subtitle: "架构", desc: "我们的专有生态系统专为速度、安全和稳定性能而构建。", steps: [{ title: "注册", desc: "创建您的机构配置文件。" }, { title: "控制面板", desc: "访问您的私人管理终端。" }, { title: "选择计划", desc: "选择您的资本配置级别。" }, { title: "API部署", desc: "自动连接全球市场。" }, { title: "执行", desc: "毫秒级订单处理。" }, { title: "报告", desc: "详细的每周绩效分析。" }], cta: "准备好开始了吗？", ctaBtn: "加入网络" },
  about: { badge: "关于我们", title: "机构级", subtitle: "卓越", desc: "Braxel Markets代表了算法资本管理的巅峰。", historyTitle: "我们的历史", historyDesc1: "由量化分析师和软件工程师团队创立，Braxel旨在弥合零售资本与机构技术之间的差距。", historyDesc2: "今天，我们专注于风险调整回报和基础设施稳定性，为现代投资者提供尖端算法策略。", stats: { founded: "成立", users: "活跃用户", uptime: "运行时间", support: "支持" }, values: { mission: "使命", missionDesc: "为全球资本提供精英算法基础设施。", vision: "愿景", visionDesc: "定义自动化量化管理的未来。", values: "价值观", valuesDesc: "透明、精确和坚定不移的安全。" }, teamTitle: "领导团队", teamDesc: "认识Braxel Markets背后的创始人和管理者。", team: [{ name: "Bernardo Campi", role: "创始人兼CEO", bio: "量化策略师和企业家，引领Braxel Markets在机构级算法基础设施方面的愿景。", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[联合创始人姓名]", role: "联合创始人兼CTO", bio: "专注于高频系统和分布式计算的软件工程师。", linkedin: "#", photo: "" }, { name: "[经理姓名]", role: "风险管理主管", bio: "前机构风险分析师，精通投资组合优化。", linkedin: "#", photo: "" }] },
  contact: { badge: "支持", title: "机构", subtitle: "渠道", desc: "我们的专业支持团队全天候24/7为机构咨询提供服务。", infoTitle: "联系方式", formTitle: "直接咨询", placeholders: { name: "全名", email: "电子邮箱", subject: "主题", message: "留言" }, sendBtn: "发送咨询" },
  dashboard: { portfolio: "投资组合", activeServices: "活跃服务", newAllocation: "新配置", noServices: "未找到活跃的投资计划。", balance: "当前余额", withdraw: "提款", liquidity: "流动性", requestWithdraw: "申请提款", selectAccount: "选择账户", amount: "金额 (USD)", iban: "IBAN / 银行信息", btnWithdraw: "提交提款申请", profile: "个人资料管理", settings: "设置", firstName: "名", lastName: "姓", saveChanges: "保存更改", verifiedAccount: "已验证账户", totalAUM: "管理资产总额", activeAlgos: "活跃算法", systemStatus: "系统状态", operational: "运行中", infraProtection: "基础设施保护", twoFactor: "双因素认证", notEnabled: "未启用", enable2FA: "启用2FA", kycStatus: "KYC验证", verified: "已验证", viewDocs: "查看文件", investor: "投资者", kycRequired: "需要KYC验证", kycRequiredDesc: "完成身份验证以访问平台的所有功能。这是所有管理资金的账户的必填项。", kycUnderReview: "KYC审核中", kycUnderReviewDesc: "您的文件正在由我们的合规团队审核。这通常需要24-48小时。", kycRejected: "KYC验证被拒绝", kycRejectedDesc: "您的文件未被接受。请重新提交有效文件。", resubmitDocs: "重新提交文件", completeVerification: "完成验证", verificationRequired: "需要验证", goToVerification: "前往验证", totalProfit: "总利润", drawdown: "回撤", maxDrawdown: "最大回撤", assetsInOperation: "运行中的资产", monthlyReturns: "月度收益", analytics: "分析", newWithdrawalRequest: "新的取款请求", walletIban: "钱包 / IBAN", network: "网络", transactionHistory: "交易历史", operations: "操作", asset: "资产", type: "类型", entry: "入场", exit: "出场", profit: "利润", time: "时间", status: "状态", open: "开", closed: "平", accountNotFound: "未找到账户。请先创建一个账户。", loginSuccess: "登录成功！", rememberMe: "记住我" },
  checkout: { summary: "摘要", allocationTitle: "机构", allocationSubtitle: "配置", tierLabel: "算法基础设施级别", billedMonthly: "按月计费", detailsTitle: "配置详情", managedCapital: "管理资本", setupFee: "设置费", waived: "免除", latency: "执行延迟", infrastructureTitle: "包含的基础设施", realTimeMonitoring: "实时监控", activeUponDeployment: "部署后激活", totalDue: "应付总额", dedicatedNode: "专用节点", globalMarkets: "全球市场", instantSetup: "即时设置", authRequired: "需要认证", authDesc: "请登录或创建账户以继续配置。", btnLogin: "登录以继续", btnRegister: "创建账户", confirmDeployment: "确认部署", deploymentDesc: "确认后，您授权部署与{{plan}}计划相关的算法基础设施。", proceedPayment: "继续安全支付", secureGateway: "安全网关", back: "返回", riskDisclosure: "风险披露：算法交易涉及重大损失风险。过往业绩不代表未来表现。", secureTransaction: "安全交易", paypalNote: "您的支付信息由PayPal安全处理。Braxel Markets不存储您的银行卡信息。", encryptionNote: "AES-256机构级加密标准", verifying: "正在验证机构交易...", loading: "正在加载终端...", globalInfra: "全球支付基础设施", qrCode: "二维码", allCards: "所有银行卡", selectPaymentMethod: "Xuanze Zhifu Fangshi", choosePayment: "Xuanze Nixiang de Zhifu Fangshi", creditCard: "Xinyong Ka", instantPayment: "Jishi Zhifu", cardDesc: "Visa, Mastercard he Qita Ka", crypto: "Shuz Huobi", cryptoLabel: "USDT, BTC, ETH", cryptoDesc: "Kaijie Anquan de Jiaoyi", securePayment: "Anquan Zhifu", cardNumber: "Ka Hao", cardName: "Ka Shiming", cardExpiry: "Youxiao Qi", payNow: "Liji Zhifu", amountToPay: "Zhifu Jine", selectNetwork: "Xuanze Wangluo", yourAddress: "Nin de Dizhi", yourAddressPlaceholder: "Shurong Nin de USDT Dizhi", important: "ZHONGYAO", cryptoNote: "Fasong Zhengque Jine Yi Huode Jihua", confirmCrypto: "Queren Jiaoyi", copied: "Yiqie Fuzhi!", cryptoPending: "Zhifu Yidengji! Dengdai Queren", processing: "Chuli Zhong...", paymentSuccess: "Zhifu Tongguo!", selectCountry: "Xuanze Guojia", searchCountry: "Sousuo Guojia...", phone: "Dianhua Haoima", fillAllFields: "Qing Tianxie Suoyou Ziduan" },
  legal: { badgeLegal: "法律", termsTitle: "服务条款" },
  faq: {
    title: "常见问题",
    badge: "FAQ",
    q1: "需要先前经验吗？",
    a1: "不需要。我们的基础设施完全自动化。您只需选择配置级别并通过终端监控表现。",
    q2: "涉及哪些风险？",
    a2: "与任何金融市场一样，存在因波动性导致的资本损失风险。我们使用先进的缓解协议来保护资本。",
    q3: "系统如何运作？",
    a3: "我们的专有算法在全球市场以毫秒精度执行高频量化策略。",
    q4: "我可以取消计划吗？",
    a4: "可以。您可以随时通过控制面板协议申请取消和资本提取。"
  },
  diffs: {
    title: "为什么选择BRAXEL MARKETS？",
    badge: "差异化优势",
    t1: "专有技术",
    d1: "为机构级执行设计的神经网络。",
    t2: "完全自动化",
    d2: "24/7算法管理，无人类情绪偏差。",
    t3: "简化访问",
    d3: "通过直观终端访问机构基础设施。",
    t4: "专业级别",
    d4: "以超低延迟直连全球流动性池。"
  },
  signals: {
    title: "实时算法",
    subtitle: "执行",
    badge: "实时终端",
    desc: "实时监控我们的专有基础设施。每个信号都由我们的神经网络以毫秒精度处理。",
    asset: "资产",
    type: "类型",
    entry: "入场",
    profit: "利润",
    status: "状态",
    active: "活跃",
    completed: "已完成"
  }
};

// Japanese translations
const jaTranslation = {
  nav: { pricing: "投資プラン", howItWorks: "インフラストラクチャ", about: "会社概要", contact: "機関サポート", login: "ターミナルアクセス", support: "サポート", openAccount: "アカウント作成", dashboard: "ダッシュボード", logout: "ログアウト" },
  footer: { desc: "機関投資家レベルの投資インフラ。現代の市場のための独自テクノロジー。", platform: "プラットフォーム", company: "会社", support: "デジタルサポート", rights: "全著作権所有。", privacy: "プライバシー", terms: "利用規約", disclaimer: "金融免責事項", address: "本社所在地", addressValue: "Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, ブラジル", riskTitle: "リスク免責事項", riskText: "金融市場での取引には重大な損失リスクが伴い、すべての投資家に適しているわけではありません。過去の実績は将来の結果を保証するものではありません。投資の価値は上下する可能性があります。失っても構わない資金以外は投資しないでください。Braxel Marketsは特定のリターンを保証しません。" },
  auth: { loginTitle: "ログイン", loginSubtitle: "アクセス認証情報を入力してください。", registerTitle: "アカウント作成", registerSubtitle: "機関市場での旅を始めましょう。", email: "メールアドレス", password: "パスワード", fullName: "氏名", forgotPassword: "パスワードをお忘れですか？", noAccount: "アカウントをお持ちでないですか？", hasAccount: "既にアクセス権をお持ちですか？", btnAccess: "アカウントにアクセス", btnCreate: "アカウントを作成", termsAgree: "利用規約とプライバシーポリシーに同意します。", futureTitle: "投資の", futureSubtitle: "未来", features: ["機関投資家レベルのアルゴリズム", "高度な資本保護", "ミリ秒単位の約定", "完全な透明性"] },
  hero: { title1: "エリートアルゴリズム", title2: "資本運用。", desc: "現代の市場向けに設計された機関投資家レベルの定量戦略を展開。ミリ秒単位の約定精度と高度なリスク軽減プロトコルを体験してください。", getStarted: "投資プランを見る", viewStrategies: "技術的方法論" },
  stats: { volume: "戦略的資本管理", traders: "アクティブアカウント", uptime: "インフラ稼働率", latency: "約定精度" },
  methodology: { badge: "方法論", title: "定量モデル", statArb: { title: "統計的裁定取引", desc: "共和分モデルとペアトレーディングを用いた相関資産間の一時的な価格非効率性の活用。", f1: "共和分分析", f2: "ペア選択アルゴリズム", f3: "Zスコア閾値" }, meanRev: { title: "平均回帰", desc: "過去の平均値からの資産価格偏差の特定と、体系的なエントリー・エグジットルール。", f1: "ボリンジャーバンドシグナル", f2: "RSIダイバージェンス検出", f3: "Ornstein-Uhlenbeckモデル" }, hft: { title: "高頻度取引", desc: "コロケーションインフラを活用したマイクロ秒レベルの注文発注のための超低遅延執行戦略。", f1: "市場マイクロストラクチャー", f2: "注文フロー分析", f3: "レイテンシーアービトラージ" } },
  transparency: { badge: "インフラストラクチャ", title: "透明なテクノロジー", desc: "当社のインフラはエンタープライズグレードの基盤上に構築され、信頼性、速度、セキュリティを確保しています。", connectivity: { title: "接続性", desc: "Equinixデータセンター（NY5、LD4、TY3）経由の直接市場アクセス。主要取引所へのサブミリ秒接続。" }, cloud: { title: "クラウド実行", desc: "AWS（us-east-1、eu-west-1）とAzureに冗長実行エンジンを展開し、フェイルオーバー耐性を確保。" }, security: { title: "セキュリティ", desc: "エンドツーエンド暗号化、SOC 2 Type IIコンプライアンス、全操作に対する多層認証。" } },
  process_home: { badge: "プロセス", title: "機関投資家", subtitle: "ワークフロー", step1: { title: "登録", desc: "安全なオンボーディングと本人確認。" }, step2: { title: "配分", desc: "運用資本レベルの選択。" }, step3: { title: "統合", desc: "アルゴリズムインフラの展開。" }, step4: { title: "監視", desc: "ターミナルによるリアルタイムパフォーマンス追跡。" }, step5: { title: "流動性", desc: "簡素化された利益引出プロトコル。" } },
  cta_home: { badge: "機会", title: "資本を", subtitle: "拡大", desc: "Braxelの独自インフラを活用するエリート投資家グループに参加しましょう。", btn: "配分を開始", trust: "機関投資家レベルのセキュリティ" },
  pricing: { badge: "透明性", title: "資本", subtitle: "配分", desc: "透明な手数料体系の機関投資家レベルインフラ。", select: "このプランを確保", allocation: "運用資本", month: "月額料金" },
  howItWorks: { badge: "インフラストラクチャ", title: "技術", subtitle: "アーキテクチャ", desc: "当社の独自エコシステムは、速度、セキュリティ、安定したパフォーマンスのために構築されています。", steps: [{ title: "登録", desc: "機関プロファイルを作成。" }, { title: "ダッシュボード", desc: "プライベート管理ターミナルにアクセス。" }, { title: "プラン選択", desc: "資本配分レベルを選択。" }, { title: "API展開", desc: "グローバル市場への自動接続。" }, { title: "実行", desc: "ミリ秒単位の注文処理。" }, { title: "レポート", desc: "詳細な週次パフォーマンス分析。" }], cta: "始める準備はできましたか？", ctaBtn: "ネットワークに参加" },
  about: { badge: "会社概要", title: "機関投資家レベル", subtitle: "エクセレンス", desc: "Braxel Marketsはアルゴリズム資本管理の頂点を代表します。", historyTitle: "沿革", historyDesc1: "定量アナリストとソフトウェアエンジニアのチームによって設立されたBraxelは、リテール資本と機関テクノロジーの間のギャップを埋めるために作られました。", historyDesc2: "今日、私たちはリスク調整後リターンとインフラの安定性に焦点を当て、現代の投資家のために最先端のアルゴリズム戦略を提供しています。", stats: { founded: "設立", users: "アクティブユーザー", uptime: "稼働率", support: "サポート" }, values: { mission: "ミッション", missionDesc: "グローバル資本のためのエリートアルゴリズムインフラを提供する。", vision: "ビジョン", visionDesc: "自動化された定量管理の未来を定義する。", values: "価値観", valuesDesc: "透明性、精度、揺るぎないセキュリティ。" }, teamTitle: "リーダーシップチーム", teamDesc: "Braxel Marketsの創業者と経営陣をご紹介します。", team: [{ name: "Bernardo Campi", role: "創業者兼CEO", bio: "機関投資家レベルのアルゴリズムインフラに向けたBraxel Marketsのビジョンを率いる定量ストラテジスト兼起業家。", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[共同創業者名]", role: "共同創業者兼CTO", bio: "高頻度システムと分散コンピューティングを専門とするソフトウェアエンジニア。", linkedin: "#", photo: "" }, { name: "[マネージャー名]", role: "リスク管理責任者", bio: "ポートフォリオ最適化に深い専門知識を持つ元機関リスクアナリスト。", linkedin: "#", photo: "" }] },
  contact: { badge: "サポート", title: "機関投資家", subtitle: "チャネル", desc: "当社の専門サポートチームは、機関投資家のお問い合わせに24時間年中無休で対応しています。", infoTitle: "お問い合わせ", formTitle: "直接お問い合わせ", placeholders: { name: "氏名", email: "メールアドレス", subject: "件名", message: "メッセージ" }, sendBtn: "お問い合わせを送信" },
  dashboard: { portfolio: "ポートフォリオ", activeServices: "アクティブサービス", newAllocation: "新規配分", noServices: "アクティブな投資プランが見つかりません。", balance: "現在の残高", withdraw: "出金", liquidity: "流動性", requestWithdraw: "出金を申請", selectAccount: "アカウントを選択", amount: "金額 (USD)", iban: "IBAN / 銀行情報", btnWithdraw: "出金申請を送信", profile: "プロフィール管理", settings: "設定", firstName: "名", lastName: "姓", saveChanges: "変更を保存", verifiedAccount: "認証済みアカウント", totalAUM: "運用資産総額", activeAlgos: "アクティブアルゴリズム", systemStatus: "システム状態", operational: "稼働中", infraProtection: "インフラ保護", twoFactor: "二要素認証", notEnabled: "未有効", enable2FA: "2FAを有効化", kycStatus: "KYC認証", verified: "認証済み", viewDocs: "書類を表示", investor: "投資家", kycRequired: "KYC認証が必要です", kycRequiredDesc: "プラットフォームの全機能にアクセスするには、本人確認を完了してください。これは資本を管理するすべてのアカウントに義務付けられています。", kycUnderReview: "KYC審査中", kycUnderReviewDesc: "書類はコンプライアンスチームによって審査中です。通常24〜48時間かかります。", kycRejected: "KYC認証が拒否されました", kycRejectedDesc: "書類は承認されませんでした。有効な書類を再度ご提出ください。", resubmitDocs: "書類を再提出", completeVerification: "認証を完了", verificationRequired: "認証が必要", goToVerification: "認証へ進む", totalProfit: "総利益", drawdown: "ドローダウン", maxDrawdown: "最大ドローダウン", assetsInOperation: "稼働中の資産", monthlyReturns: "月次リターン", analytics: "分析", newWithdrawalRequest: "新しい出金リクエスト", walletIban: "ウォレット / IBAN", network: "ネットワーク", transactionHistory: "取引履歴", operations: "オペレーション", asset: "資産", type: "タイプ", entry: "エントリー", exit: "イグジット", profit: "利益", time: "時間", status: "ステータス", open: "オープン", closed: "クローズ", accountNotFound: "アカウントが見つかりません。まずアカウントを作成してください。", loginSuccess: "ログイン成功！", rememberMe: "ログイン情報を保存" },
  checkout: { summary: "概要", allocationTitle: "機関", allocationSubtitle: "配分", tierLabel: "アルゴリズムインフラレベル", billedMonthly: "月次請求", detailsTitle: "配分詳細", managedCapital: "運用資本", setupFee: "セットアップ料", waived: "免除", latency: "約定遅延", infrastructureTitle: "含まれるインフラ", realTimeMonitoring: "リアルタイム監視", activeUponDeployment: "展開後にアクティブ", totalDue: "合計支払額", dedicatedNode: "専用ノード", globalMarkets: "グローバル市場", instantSetup: "即時セットアップ", authRequired: "認証が必要です", authDesc: "配分を進めるにはログインまたはアカウント作成が必要です。", btnLogin: "ログインして続行", btnRegister: "アカウント作成", confirmDeployment: "展開を確認", deploymentDesc: "確認することで、{{plan}}プランに関連するアルゴリズムインフラの展開を承認します。", proceedPayment: "安全な支払いに進む", secureGateway: "セキュアゲートウェイ", back: "戻る", riskDisclosure: "リスク開示：アルゴリズム取引には重大な損失リスクが伴います。過去の実績は将来の結果を保証しません。", secureTransaction: "安全な取引", paypalNote: "お支払い情報はPayPalにより安全に処理されます。Braxel Marketsはカード情報を保存しません。", encryptionNote: "AES-256機関グレード暗号化", verifying: "機関取引を確認中...", loading: "ターミナルを読み込み中...", globalInfra: "グローバル決済インフラ", qrCode: "QRコード", allCards: "全カード", localPay: "ローカル決済" },
  legal: { badgeLegal: "法的情報", termsTitle: "利用規約" },
  faq: {
    title: "よくあるご質問",
    badge: "FAQ",
    q1: "事前経験は必要ですか？",
    a1: "いいえ。当社のインフラは完全に自動化されています。配分レベルを選択し、ターミナルでパフォーマンスを監視するだけです。",
    q2: "どのようなリスクがありますか？",
    a2: "金融市場全般と同様、ボラティリティによる資本損失のリスクがあります。当社は資本保護のための高度な緩和プロトコルを使用しています。",
    q3: "システムはどのように機能しますか？",
    a3: "当社の独自アルゴリズムは、ミリ秒の精度でグローバル市場において高頻度定量戦略を実行します。",
    q4: "プランをキャンセルできますか？",
    a4: "はい。ダッシュボードのプロトコルを通じて、いつでもキャンセルと資本引出を申請できます。"
  },
  diffs: {
    title: "なぜBRAXEL MARKETSか？",
    badge: "差別化要因",
    t1: "独自テクノロジー",
    d1: "機関投資家レベルの約定のために設計されたニューラルネットワーク。",
    t2: "完全自動化",
    d2: "人間の感情バイアスのない24時間365日のアルゴリズム管理。",
    t3: "簡素化されたアクセス",
    d3: "直感的なターミナルを通じてアクセスする機関インフラ。",
    t4: "プロフェッショナルグレード",
    d4: "超低遅延でグローバル流動性プールに直接接続。"
  },
  signals: {
    title: "リアルタイム",
    subtitle: "アルゴリズム実行",
    badge: "リアルタイムターミナル",
    desc: "当社の独自インフラをリアルタイムで監視。すべてのシグナルはニューラルネットワークによりミリ秒の精度で処理されます。",
    asset: "資産",
    type: "タイプ",
    entry: "エントリー",
    profit: "利益",
    status: "ステータス",
    active: "アクティブ",
    completed: "完了"
  }
};

// Arabic translations
const arTranslation = {
  nav: { pricing: "خطط الاستثمار", howItWorks: "البنية التحتية", about: "من نحن", contact: "الدعم المؤسسي", login: "الوصول إلى المحطة", support: "الدعم", support: "الدعم", openAccount: "إنشاء حساب", dashboard: "لوحة التحكم", logout: "تسجيل الخروج" },
  footer: { desc: "بنية تحتية استثمارية مؤسسية. تقنية مملوكة للسوق الحديث.", platform: "المنصة", company: "الشركة", support: "الدعم الرقمي", rights: "جميع الحقوق محفوظة.", privacy: "الخصوصية", terms: "الشروط", disclaimer: "إخلاء المسؤولية المالية", address: "العنوان التجاري", addressValue: "Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, البرازيل", riskTitle: "إخلاء مسؤولية المخاطر", riskText: "التداول في الأسواق المالية ينطوي على مخاطر كبيرة للخسارة وليس مناسبًا لجميع المستثمرين. الأداء السابق لا يضمن النتائج المستقبلية. قيمة الاستثمارات قد ترتفع أو تنخفض. لا تستثمر أموالاً لا يمكنك تحمل خسارتها. Braxel Markets لا تضمن عوائد محددة." },
  chatbot: { title: "دعم Braxel", placeholder: "اكتب رسالة...", emailSupport: "البريد الإلكتروني:" },
  auth: { loginTitle: "تسجيل الدخول", loginSubtitle: "أدخل بيانات الوصول الخاصة بك.", registerTitle: "إنشاء حساب", registerSubtitle: "ابدأ رحلتك في السوق المؤسسي.", email: "البريد الإلكتروني", password: "كلمة المرور", fullName: "الاسم الكامل", forgotPassword: "نسيت كلمة المرور؟", noAccount: "ليس لديك حساب؟", hasAccount: "لديك وصول بالفعل؟", btnAccess: "الوصول إلى الحساب", btnCreate: "إنشاء حسابي", termsAgree: "أوافق على الشروط والخصوصية.", futureTitle: "مستقبل", futureSubtitle: "الاستثمار", features: ["خوارزميات مؤسسية", "حماية رأس المال المتقدمة", "تنفيذ بالميلي ثانية", "شفافية كاملة"] },
  hero: { title1: "إدارة رأس المال", title2: "الخوارزمية النخبوية.", desc: "انشر استراتيجيات كمية مؤسسية مصممة للسوق الحديث. اختبر دقة تنفيذ بالميلي ثانية وبروتوكولات متقدمة لتخفيف المخاطر.", getStarted: "استكشف خطط الاستثمار", viewStrategies: "المنهجية التقنية" },
  stats: { volume: "إدارة رأس المال الاستراتيجي", traders: "الحسابات النشطة", uptime: "وقت تشغيل البنية التحتية", latency: "دقة التنفيذ" },
  methodology: { badge: "المنهجية", title: "النماذج الكمية", statArb: { title: "المراجحة الإحصائية", desc: "استغلال عدم كفاءة الأسعار المؤقتة بين الأصول المرتبطة باستخدام نماذج التكامل المشترك وتداول الأزواج.", f1: "تحليل التكامل المشترك", f2: "خوارزميات اختيار الأزواج", f3: "عتبة Z-Score" }, meanRev: { title: "العودة إلى المتوسط", desc: "تحديد انحرافات أسعار الأصول عن المتوسطات التاريخية مع قواعد دخول وخروج منهجية.", f1: "إشارات نطاقات بولينجر", f2: "كشف تباعد RSI", f3: "نماذج Ornstein-Uhlenbeck" }, hft: { title: "التداول عالي التردد", desc: "استراتيجيات تنفيذ منخفضة الكمون جدًا مع بنية تحتية مشتركة لإرسال الأوامر بمستوى الميكروثانية.", f1: "البنية المجهرية للسوق", f2: "تحليل تدفق الأوامر", f3: "مراجحة الكمون" } },
  transparency: { badge: "البنية التحتية", title: "تقنية شفافة", desc: "بنيتنا التحتية مبنية على أسس مؤسسية تضمن الموثوقية والسرعة والأمان.", connectivity: { title: "الاتصال", desc: "وصول مباشر للسوق عبر مراكز بيانات Equinix (NY5, LD4, TY3) مع اتصال أقل من ميلي ثانية بالبورصات الرئيسية." }, cloud: { title: "التنفيذ السحابي", desc: "محركات تنفيذ احتياطية على AWS (us-east-1, eu-west-1) و Azure لمرونة تجاوز الأعطال." }, security: { title: "الأمان", desc: "تشفير من طرف إلى طرف، امتثال SOC 2 Type II ومصادقة متعددة الطبقات لجميع العمليات." } },
  process_home: { badge: "العملية", title: "سير العمل", subtitle: "المؤسسي", step1: { title: "التسجيل", desc: "تسجيل آمن والتحقق من الهوية." }, step2: { title: "التخصيص", desc: "اختيار مستوى رأس المال المُدار." }, step3: { title: "التكامل", desc: "نشر البنية التحتية الخوارزمية." }, step4: { title: "المراقبة", desc: "تتبع الأداء في الوقت الفعلي." }, step5: { title: "السيولة", desc: "بروتوكولات مبسطة لسحب الأرباح." } },
  cta_home: { badge: "فرصة", title: "وسّع", subtitle: "رأس مالك", desc: "انضم إلى مجموعة النخبة من المستثمرين الذين يستخدمون البنية التحتية المملوكة لـ Braxel.", btn: "ابدأ التخصيص", trust: "أمان مؤسسي" },
  pricing: { badge: "الشفافية", title: "تخصيصات", subtitle: "رأس المال", desc: "بنية تحتية مؤسسية بهيكل رسوم شفاف.", select: "احصل على هذا الخطة", allocation: "رأس المال المُدار", month: "رسوم شهرية" },
  howItWorks: { badge: "البنية التحتية", title: "البنية", subtitle: "التقنية", desc: "نظامنا البيئي المملوك مصمم للسرعة والأمان والأداء المتسق.", steps: [{ title: "التسجيل", desc: "أنشئ ملفك المؤسسي." }, { title: "لوحة التحكم", desc: "الوصول إلى محطة الإدارة الخاصة." }, { title: "اختيار الخطة", desc: "اختر مستوى تخصيص رأس المال." }, { title: "نشر API", desc: "الاتصال التلقائي بالأسواق العالمية." }, { title: "التنفيذ", desc: "معالجة الأوامر بالميلي ثانية." }, { title: "التقارير", desc: "تحليل أداء أسبوعي مفصل." }], cta: "مستعد للبدء؟", ctaBtn: "انضم إلى الشبكة" },
  about: { badge: "من نحن", title: "التميز", subtitle: "المؤسسي", desc: "Braxel Markets تمثل قمة إدارة رأس المال الخوارزمية.", historyTitle: "تاريخنا", historyDesc1: "أسسها فريق من المحللين الكميين ومهندسي البرمجيات، أُنشئت Braxel لسد الفجوة بين رأس المال الفردي والتقنية المؤسسية.", historyDesc2: "اليوم، نركز على العوائد المعدلة حسب المخاطر واستقرار البنية التحتية، مع تقديم استراتيجيات خوارزمية متطورة للمستثمر الحديث.", stats: { founded: "تأسست", users: "المستخدمون النشطون", uptime: "وقت التشغيل", support: "الدعم" }, values: { mission: "المهمة", missionDesc: "تقديم بنية تحتية خوارزمية نخبوية لرأس المال العالمي.", vision: "الرؤية", visionDesc: "تحديد مستقبل الإدارة الكمية الآلية.", values: "القيم", valuesDesc: "الشفافية والدقة والأمان الراسخ." }, teamTitle: "فريق القيادة", teamDesc: "تعرف على المؤسسين والمديرين وراء Braxel Markets.", team: [{ name: "Bernardo Campi", role: "المؤسس والرئيس التنفيذي", bio: "استراتيجي كمي ورائد أعمال يقود رؤية Braxel Markets للبنية التحتية الخوارزمية المؤسسية.", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[اسم الشريك المؤسس]", role: "الشريك المؤسس ومدير التقنية", bio: "مهندس برمجيات متخصص في أنظمة التردد العالي والحوسبة الموزعة.", linkedin: "#", photo: "" }, { name: "[اسم المدير]", role: "رئيس إدارة المخاطر", bio: "محلل مخاطر مؤسسي سابق ذو خبرة عميقة في تحسين المحافظ.", linkedin: "#", photo: "" }] },
  contact: { badge: "الدعم", title: "القنوات", subtitle: "المؤسسية", desc: "فريق الدعم المتخصص لدينا متاح على مدار الساعة للاستفسارات المؤسسية.", infoTitle: "معلومات الاتصال", formTitle: "استفسار مباشر", placeholders: { name: "الاسم الكامل", email: "البريد الإلكتروني", subject: "الموضوع", message: "الرسالة" }, sendBtn: "إرسال الاستفسار" },
  dashboard: { portfolio: "المحفظة", activeServices: "الخدمات النشطة", newAllocation: "تخصيص جديد", noServices: "لم يتم العثور على خطط استثمار نشطة.", balance: "الرصيد الحالي", withdraw: "سحب", liquidity: "السيولة", requestWithdraw: "طلب سحب", selectAccount: "اختر الحساب", amount: "المبلغ (USD)", iban: "IBAN / التفاصيل المصرفية", btnWithdraw: "إرسال طلب السحب", profile: "إدارة الملف", settings: "الإعدادات", firstName: "الاسم الأول", lastName: "الاسم الأخير", saveChanges: "حفظ التغييرات", verifiedAccount: "حساب موثق", totalAUM: "إجمالي الأصول المُدارة", activeAlgos: "الخوارزميات النشطة", systemStatus: "حالة النظام", operational: "يعمل", infraProtection: "حماية البنية التحتية", twoFactor: "المصادقة الثنائية", notEnabled: "غير مفعّلة", enable2FA: "تفعيل 2FA", kycStatus: "التحقق KYC", verified: "موثّق", viewDocs: "عرض المستندات", investor: "مستثمر", kycRequired: "التحقق من KYC مطلوب", kycRequiredDesc: "أكمل التحقق من الهوية للوصول إلى جميع ميزات المنصة. هذا إلزامي لجميع الحسابات التي تدير رأس المال.", kycUnderReview: "KYC قيد المراجعة", kycUnderReviewDesc: "يتم مراجعة مستنداتك من قبل فريق الامتثال لدينا. يستغرق هذا عادةً 24-48 ساعة.", kycRejected: "تم رفض التحقق من KYC", kycRejectedDesc: "لم يتم قبول مستنداتك. يرجى إعادة الإرسال بمستندات صالحة.", resubmitDocs: "إعادة إرسال المستندات", completeVerification: "إكمال التحقق", verificationRequired: "التحقق مطلوب", goToVerification: "الذهاب إلى التحقق", totalProfit: "إجمالي الربح", drawdown: "السحب", maxDrawdown: "الحد الأقصى للسحب", assetsInOperation: "الأصول قيد التشغيل", monthlyReturns: "العوائد الشهرية", analytics: "التحليلات", newWithdrawalRequest: "طلب سحب جديد", walletIban: "المحفظة / IBAN", network: "الشبكة", transactionHistory: "سجل المعاملات", operations: "العمليات", asset: "الأصل", type: "النوع", entry: "الدخول", exit: "الخروج", profit: "الربح", time: "الوقت", status: "الحالة", open: "مفتوح", closed: "مغلق", accountNotFound: "الحساب غير موجود. يرجى إنشاء حساب أولاً.", loginSuccess: "تم تسجيل الدخول بنجاح!", rememberMe: "تذكرني" },
  checkout: { summary: "الملخص", allocationTitle: "تخصيص", allocationSubtitle: "مؤسسي", tierLabel: "مستوى البنية التحتية الخوارزمية", billedMonthly: "فوترة شهرية", detailsTitle: "تفاصيل التخصيص", managedCapital: "رأس المال المُدار", setupFee: "رسوم الإعداد", waived: "معفاة", latency: "كمون التنفيذ", infrastructureTitle: "البنية التحتية المشمولة", realTimeMonitoring: "مراقبة في الوقت الفعلي", activeUponDeployment: "نشط بعد النشر", totalDue: "المجموع المستحق", dedicatedNode: "عقدة مخصصة", globalMarkets: "أسواق عالمية", instantSetup: "إعداد فوري", authRequired: "المصادقة مطلوبة", authDesc: "يرجى تسجيل الدخول أو إنشاء حساب للمتابعة.", btnLogin: "تسجيل الدخول للمتابعة", btnRegister: "إنشاء حساب", confirmDeployment: "تأكيد النشر", deploymentDesc: "بالتأكيد، تُخوّل نشر البنية التحتية الخوارزمية المرتبطة بخطة {{plan}}.", proceedPayment: "المتابعة إلى الدفع الآمن", secureGateway: "بوابة آمنة", back: "رجوع", riskDisclosure: "إفصاح المخاطر: التداول الخوارزمي ينطوي على مخاطر كبيرة للخسارة. الأداء السابق لا يضمن النتائج المستقبلية.", secureTransaction: "معاملة آمنة", paypalNote: "تتم معالجة بيانات الدفع بأمان بواسطة PayPal. Braxel Markets لا تخزن بيانات بطاقتك.", encryptionNote: "مشفر بمعايير AES-256 المؤسسية", verifying: "جارٍ التحقق من المعاملة المؤسسية...", loading: "جارٍ تحميل المحطة...", globalInfra: "بنية تحتية للدفع العالمي", qrCode: "رمز QR", allCards: "جميع البطاقات", localPay: "الدفع المحلي" },
  legal: { badgeLegal: "قانوني", termsTitle: "شروط الخدمة" },
  faq: {
    title: "الأسئلة الشائعة",
    badge: "FAQ",
    q1: "هل الخبرة المسبقة ضرورية؟",
    a1: "لا. بنيتنا التحتية مؤتمتة بالكامل. ما عليك سوى اختيار مستوى التخصيص ومراقبة الأداء عبر المحطة.",
    q2: "ما هي المخاطر المتضمنة؟",
    a2: "كما في أي سوق مالي، توجد مخاطر خسارة رأس المال بسبب التقلبات. نستخدم بروتوكولات متقدمة لحماية رأس المال.",
    q3: "كيف يعمل النظام؟",
    a3: "خوارزمياتنا المملوكة تنفذ استراتيجيات كمية عالية التردد في الأسواق العالمية بدقة الميلي ثانية.",
    q4: "هل يمكنني إلغاء خطتي؟",
    a4: "نعم. يمكنك طلب الإلغاء وسحب رأس المال في أي وقت من خلال بروتوكولات لوحة التحكم."
  },
  diffs: {
    title: "لماذا BRAXEL MARKETS؟",
    badge: "المميزات",
    t1: "تقنية مملوكة",
    d1: "شبكات عصبية مصممة للتنفيذ المؤسسي.",
    t2: "أتمتة كاملة",
    d2: "إدارة خوارزمية على مدار الساعة بدون تحيز عاطفي بشري.",
    t3: "وصول مبسط",
    d3: "بنية تحتية مؤسسية يمكن الوصول إليها عبر محطة بديهية.",
    t4: "مستوى احترافي",
    d4: "اتصال مباشر بمجمعات السيولة العالمية بكمون منخفض جدًا."
  },
  signals: {
    title: "التنفيذ",
    subtitle: "الخوارزمي",
    badge: "المحطة في الوقت الفعلي",
    desc: "راقب بنيتنا التحتية المملوكة في الوقت الفعلي. كل إشارة تتم معالجتها بواسطة شبكاتنا العصبية بدقة الميلي ثانية.",
    asset: "الأصل",
    type: "النوع",
    entry: "الدخول",
    profit: "الربح",
    status: "الحالة",
    active: "نشط",
    completed: "مكتمل"
  }
};

// Hebrew translations
const heTranslation = {
  nav: { pricing: "תוכניות השקעה", howItWorks: "תשתית", about: "אודות", contact: "תמיכה מוסדית", login: "גישה לטרמינל", support: "תמיכה", openAccount: "יצירת חשבון", dashboard: "לוח בקרה", logout: "התנתקות" },
  footer: { desc: "תשתית השקעות ברמה מוסדית. טכנולוגיה קניינית לשוק המודרני.", platform: "פלטפורמה", company: "חברה", support: "תמיכה דיגיטלית", rights: "כל הזכויות שמורות.", privacy: "פרטיות", terms: "תנאים", disclaimer: "הצהרה פיננסית", address: "כתובת מסחרית", addressValue: "Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, ברזיל", riskTitle: "הצהרת סיכונים", riskText: "מסחר בשווקים פיננסיים כרוך בסיכון משמעותי להפסד ואינו מתאים לכל המשקיעים. ביצועי עבר אינם מעידים על תוצאות עתידיות. ערך ההשקעות יכול לעלות או לרדת. אל תשקיע כסף שאינך יכול להרשות לעצמך להפסיד. Braxel Markets אינה מבטיחה תשואות ספציפיות." },
  chatbot: { title: "תמיכת Braxel", placeholder: "הקלד הודעה...", emailSupport: "אימייל:" },
  auth: { loginTitle: "התחברות", loginSubtitle: "הזן את פרטי הגישה שלך.", registerTitle: "יצירת חשבון", registerSubtitle: "התחל את המסע שלך בשוק המוסדי.", email: "כתובת דוא״ל", password: "סיסמה", fullName: "שם מלא", forgotPassword: "שכחת סיסמה?", noAccount: "אין לך חשבון?", hasAccount: "כבר יש לך גישה?", btnAccess: "גישה לחשבון", btnCreate: "צור את החשבון שלי", termsAgree: "אני מסכים לתנאים ולמדיניות הפרטיות.", futureTitle: "העתיד של", futureSubtitle: "ההשקעות", features: ["אלגוריתמים ברמה מוסדית", "הגנת הון מתקדמת", "ביצוע במילישניות", "שקיפות מלאה"] },
  hero: { title1: "ניהול הון", title2: "אלגוריתמי של אליטה.", desc: "פרוס אסטרטגיות כמותיות ברמה מוסדית שתוכננו לשוק המודרני. חווה דיוק ביצוע במילישניות ופרוטוקולי הפחתת סיכונים מתקדמים.", getStarted: "חקור תוכניות השקעה", viewStrategies: "מתודולוגיה טכנית" },
  stats: { volume: "ניהול הון אסטרטגי", traders: "חשבונות פעילים", uptime: "זמן פעילות תשתית", latency: "דיוק ביצוע" },
  methodology: { badge: "מתודולוגיה", title: "מודלים כמותיים", statArb: { title: "ארביטראז׳ סטטיסטי", desc: "ניצול חוסר יעילות מחירים זמני בין נכסים מתואמים באמצעות מודלי קו-אינטגרציה ומסחר זוגות.", f1: "ניתוח קו-אינטגרציה", f2: "אלגוריתמי בחירת זוגות", f3: "סף Z-Score" }, meanRev: { title: "חזרה לממוצע", desc: "זיהוי סטיות מחיר נכסים מממוצעים היסטוריים עם כללי כניסה ויציאה שיטתיים.", f1: "אותות רצועות בולינגר", f2: "זיהוי דיברגנציית RSI", f3: "מודלי Ornstein-Uhlenbeck" }, hft: { title: "מסחר בתדירות גבוהה", desc: "אסטרטגיות ביצוע בהשהיה אולטרא-נמוכה עם תשתית משולבת להצבת פקודות ברמת מיקרושניות.", f1: "מיקרו-מבנה שוק", f2: "ניתוח זרימת פקודות", f3: "ארביטראז׳ השהיה" } },
  transparency: { badge: "תשתית", title: "טכנולוגיה שקופה", desc: "התשתית שלנו בנויה על בסיס ארגוני, מבטיחה אמינות, מהירות ואבטחה.", connectivity: { title: "קישוריות", desc: "גישה ישירה לשוק דרך מרכזי נתונים של Equinix (NY5, LD4, TY3) עם קישוריות תת-מילישנייה לבורסות מובילות." }, cloud: { title: "ביצוע ענן", desc: "מנועי ביצוע רדונדנטיים על AWS (us-east-1, eu-west-1) ו-Azure לחוסן כשלים." }, security: { title: "אבטחה", desc: "הצפנה מקצה לקצה, עמידה ב-SOC 2 Type II ואימות רב-שכבתי לכל הפעולות." } },
  process_home: { badge: "תהליך", title: "תהליך עבודה", subtitle: "מוסדי", step1: { title: "הרשמה", desc: "קליטה מאובטחת ואימות זהות." }, step2: { title: "הקצאה", desc: "בחירת רמת ההון המנוהל." }, step3: { title: "אינטגרציה", desc: "פריסת תשתית אלגוריתמית." }, step4: { title: "ניטור", desc: "מעקב ביצועים בזמן אמת." }, step5: { title: "נזילות", desc: "פרוטוקולים מופשטים למשיכת רווחים." } },
  cta_home: { badge: "הזדמנות", title: "הגדל את", subtitle: "ההון שלך", desc: "הצטרף לקבוצת האליטה של משקיעים שמשתמשים בתשתית הקניינית של Braxel.", btn: "התחל הקצאה", trust: "אבטחה ברמה מוסדית" },
  pricing: { badge: "שקיפות", title: "הקצאות", subtitle: "הון", desc: "תשתית ברמה מוסדית עם מבנה עמלות שקוף.", select: "הבטח תוכנית זו", allocation: "הון מנוהל", month: "עמלה חודשית" },
  howItWorks: { badge: "תשתית", title: "ארכיטקטורה", subtitle: "טכנית", desc: "המערכת האקולוגית הקניינית שלנו בנויה למהירות, אבטחה וביצועים עקביים.", steps: [{ title: "הרשמה", desc: "צור את הפרופיל המוסדי שלך." }, { title: "לוח בקרה", desc: "גישה לטרמינל הניהול הפרטי." }, { title: "בחירת תוכנית", desc: "בחר את רמת הקצאת ההון." }, { title: "פריסת API", desc: "חיבור אוטומטי לשווקים גלובליים." }, { title: "ביצוע", desc: "עיבוד פקודות במילישניות." }, { title: "דיווח", desc: "ניתוח ביצועים שבועי מפורט." }], cta: "מוכן להתחיל?", ctaBtn: "הצטרף לרשת" },
  about: { badge: "אודות", title: "מצוינות", subtitle: "מוסדית", desc: "Braxel Markets מייצגת את פסגת ניהול ההון האלגוריתמי.", historyTitle: "ההיסטוריה שלנו", historyDesc1: "הוקמה על ידי צוות של אנליסטים כמותיים ומהנדסי תוכנה, Braxel נוצרה לגשר על הפער בין הון קמעונאי לטכנולוגיה מוסדית.", historyDesc2: "כיום אנו מתמקדים בתשואות מותאמות סיכון ויציבות תשתית, ומספקים אסטרטגיות אלגוריתמיות חדשניות למשקיע המודרני.", stats: { founded: "הוקמה", users: "משתמשים פעילים", uptime: "זמן פעילות", support: "תמיכה" }, values: { mission: "משימה", missionDesc: "לספק תשתית אלגוריתמית של אליטה להון גלובלי.", vision: "חזון", visionDesc: "להגדיר את עתיד הניהול הכמותי האוטומטי.", values: "ערכים", valuesDesc: "שקיפות, דיוק ואבטחה בלתי מתפשרת." }, teamTitle: "צוות ההנהגה", teamDesc: "הכירו את המייסדים והמנהלים מאחורי Braxel Markets.", team: [{ name: "Bernardo Campi", role: "מייסד ומנכ״ל", bio: "אסטרטג כמותי ויזם המוביל את החזון של Braxel Markets לתשתית אלגוריתמית מוסדית.", linkedin: "#", photo: "/team-bernardo-campi.jpg" }, { name: "[שם השותף המייסד]", role: "שותף מייסד ו-CTO", bio: "מהנדס תוכנה המתמחה במערכות תדירות גבוהה ומחשוב מבוזר.", linkedin: "#", photo: "" }, { name: "[שם המנהל]", role: "ראש ניהול סיכונים", bio: "אנליסט סיכונים מוסדי לשעבר עם מומחיות עמוקה באופטימיזציית תיקים.", linkedin: "#", photo: "" }] },
  contact: { badge: "תמיכה", title: "ערוצים", subtitle: "מוסדיים", desc: "צוות התמיכה המסור שלנו זמין 24/7 לפניות מוסדיות.", infoTitle: "פרטי קשר", formTitle: "פנייה ישירה", placeholders: { name: "שם מלא", email: "כתובת דוא״ל", subject: "נושא", message: "הודעה" }, sendBtn: "שלח פנייה" },
  dashboard: { portfolio: "תיק השקעות", activeServices: "שירותים פעילים", newAllocation: "הקצאה חדשה", noServices: "לא נמצאו תוכניות השקעה פעילות.", balance: "יתרה נוכחית", withdraw: "משיכה", liquidity: "נזילות", requestWithdraw: "בקש משיכה", selectAccount: "בחר חשבון", amount: "סכום (USD)", iban: "IBAN / פרטי בנק", btnWithdraw: "שלח בקשת משיכה", profile: "ניהול פרופיל", settings: "הגדרות", firstName: "שם פרטי", lastName: "שם משפחה", saveChanges: "שמור שינויים", verifiedAccount: "חשבון מאומת", totalAUM: "סך נכסים מנוהלים", activeAlgos: "אלגוריתמים פעילים", systemStatus: "מצב מערכת", operational: "פעיל", infraProtection: "הגנת תשתית", twoFactor: "אימות דו-שלבי", notEnabled: "לא מופעל", enable2FA: "הפעל 2FA", kycStatus: "אימות KYC", verified: "מאומת", viewDocs: "הצג מסמכים", investor: "משקיע", kycRequired: "נדרש אימות KYC", kycRequiredDesc: "השלם את האימות כדי לגשת לכל התכונות של הפלטפורמה. זהו חובה עבור כל החשבונות המנהלים הון.", kycUnderReview: "KYC בבדיקה", kycUnderReviewDesc: "המסמכים שלך נבדקים על ידי צוות הציות שלנו. זה בדרך כלל לוקח 24-48 שעות.", kycRejected: "אימות KYC נדחה", kycRejectedDesc: "המסמכים שלך לא התקבלו. אנא שלח שוב עם מסמכים תקפים.", resubmitDocs: "שלח מסמכים שוב", completeVerification: "השלם אימות", verificationRequired: "נדרש אימות", goToVerification: "עבור לאימות", totalProfit: "רווח כולל", drawdown: "משיכה", maxDrawdown: "משיכה מקסימלית", assetsInOperation: "נכסים בפעולה", monthlyReturns: "תשואות חודשיות", analytics: "ניתוחים", newWithdrawalRequest: "בקשת משיכה חדשה", walletIban: "ארנק / IBAN", network: "רשת", transactionHistory: "היסטוריית עסקאות", operations: "פעולות", asset: "נכס", type: "סוג", entry: "כניסה", exit: "יציאה", profit: "רווח", time: "זמן", status: "סטטוס", open: "פתוח", closed: "סגור", accountNotFound: "החשבון לא נמצא. אנא צור חשבון קודם.", loginSuccess: "התחברת בהצלחה!", rememberMe: "זכור אותי" },
  checkout: { summary: "סיכום", allocationTitle: "הקצאה", allocationSubtitle: "מוסדית", tierLabel: "רמת תשתית אלגוריתמית", billedMonthly: "חיוב חודשי", detailsTitle: "פרטי הקצאה", managedCapital: "הון מנוהל", setupFee: "דמי הקמה", waived: "מוותר", latency: "השהיית ביצוע", infrastructureTitle: "תשתית כלולה", realTimeMonitoring: "ניטור בזמן אמת", activeUponDeployment: "פעיל לאחר פריסה", totalDue: "סה״כ לתשלום", dedicatedNode: "צומת ייעודי", globalMarkets: "שווקים גלובליים", instantSetup: "הקמה מיידית", authRequired: "נדרש אימות", authDesc: "אנא התחבר או צור חשבון כדי להמשיך בהקצאה.", btnLogin: "התחבר להמשך", btnRegister: "צור חשבון", confirmDeployment: "אשר פריסה", deploymentDesc: "באישור, אתה מאשר את פריסת התשתית האלגוריתמית הקשורה לתוכנית {{plan}}.", proceedPayment: "המשך לתשלום מאובטח", secureGateway: "שער מאובטח", back: "חזרה", riskDisclosure: "גילוי סיכונים: מסחר אלגוריתמי כרוך בסיכון משמעותי להפסד. ביצועי עבר אינם מעידים על תוצאות עתידיות.", secureTransaction: "עסקה מאובטחת", paypalNote: "פרטי התשלום שלך מעובדים בצורה מאובטחת על ידי PayPal. Braxel Markets אינה מאחסנת את פרטי הכרטיס.", encryptionNote: "מוצפן בתקני AES-256 מוסדיים", verifying: "מאמת עסקה מוסדית...", loading: "טוען טרמינל...", globalInfra: "תשתית תשלומים גלובלית", qrCode: "קוד QR", allCards: "כל הכרטיסים", localPay: "תשלום מקומי" },
  legal: { badgeLegal: "משפטי", termsTitle: "תנאי שירות" },
  faq: {
    title: "שאלות נפוצות",
    badge: "FAQ",
    q1: "האם נדרש ניסיון קודם?",
    a1: "לא. התשתית שלנו אוטומטית לחלוטין. עליך רק לבחור את רמת ההקצאה ולעקוב אחר הביצועים דרך הטרמינל.",
    q2: "מהם הסיכונים הכרוכים?",
    a2: "כמו בכל שוק פיננסי, קיימים סיכוני הפסד הון עקב תנודתיות. אנו משתמשים בפרוטוקולים מתקדמים להגנת ההון.",
    q3: "איך המערכת עובדת?",
    a3: "האלגוריתמים הקנייניים שלנו מבצעים אסטרטגיות כמותיות בתדירות גבוהה בשווקים גלובליים בדיוק של מילישניות.",
    q4: "האם אפשר לבטל את התוכנית?",
    a4: "כן. ניתן לבקש ביטול ומשיכת הון בכל עת דרך פרוטוקולי לוח הבקרה."
  },
  diffs: {
    title: "למה BRAXEL MARKETS?",
    badge: "יתרונות",
    t1: "טכנולוגיה קניינית",
    d1: "רשתות עצביות שתוכננו לביצוע ברמה מוסדית.",
    t2: "אוטומציה מלאה",
    d2: "ניהול אלגוריתמי 24/7 ללא הטיה רגשית אנושית.",
    t3: "גישה מופשטת",
    d3: "תשתית מוסדית נגישה דרך טרמינל אינטואיטיבי.",
    t4: "רמה מקצועית",
    d4: "חיבור ישיר למאגרי נזילות גלובליים בהשהיה אולטרא-נמוכה."
  },
  signals: {
    title: "ביצוע",
    subtitle: "אלגוריתמי",
    badge: "טרמינל בזמן אמת",
    desc: "עקוב אחר התשתית הקניינית שלנו בזמן אמת. כל אות מעובד על ידי הרשתות העצביות שלנו בדיוק של מילישניות.",
    asset: "נכס",
    type: "סוג",
    entry: "כניסה",
    profit: "רווח",
    status: "מצב",
    active: "פעיל",
    completed: "הושלם"
  }
};

const resources = {
  en: { translation: enTranslation },
  pt: { translation: ptTranslation },
  it: { translation: itTranslation },
  es: { translation: esTranslation },
  fr: { translation: frTranslation },
  de: { translation: deTranslation },
  ru: { translation: ruTranslation },
  zh: { translation: zhTranslation },
  ja: { translation: jaTranslation },
  ar: { translation: arTranslation },
  he: { translation: heTranslation }
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
  }, (err) => {
    if (err) return console.error(err);
    document.documentElement.lang = i18n.language;
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  const isRtl = lng === 'ar' || lng === 'he';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
});

export default i18n;
