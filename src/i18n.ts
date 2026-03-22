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

const resources = {
  en: {
    translation: {
      nav: { pricing: "INVESTMENT PLANS", howItWorks: "THE INFRASTRUCTURE", about: "ABOUT US", contact: "INSTITUTIONAL SUPPORT", login: "TERMINAL ACCESS", openAccount: "CREATE ACCOUNT", dashboard: "DASHBOARD", logout: "SIGN OUT" },
      footer: { desc: "Institutional-grade investment infrastructure. Proprietary technology for the modern market.", platform: "Platform", company: "Company", support: "Digital Support", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", disclaimer: "Financial Disclaimer" },
      auth: { loginTitle: "Login", loginSubtitle: "Enter your access credentials.", registerTitle: "Create Account", registerSubtitle: "Start your journey in the institutional market.", email: "Email Address", password: "Password", fullName: "Full Name", forgotPassword: "Forgot password?", noAccount: "Don't have an account?", hasAccount: "Already have access?", btnAccess: "ACCESS ACCOUNT", btnCreate: "CREATE MY ACCOUNT", termsAgree: "I agree to the Terms and Privacy.", futureTitle: "The Future of", futureSubtitle: "Investment", features: ["Institutional-grade algorithms", "Advanced capital protection", "Millisecond execution", "Total transparency"] },
      hero: { title1: "ELITE ALGORITHMIC", title2: "CAPITAL MANAGEMENT.", desc: "Deploy institutional-grade quantitative strategies engineered for the modern market. Experience millisecond execution precision and advanced risk mitigation protocols.", getStarted: "EXPLORE INVESTMENT PLANS", viewStrategies: "TECHNICAL METHODOLOGY" },
      stats: { volume: "Total Managed Volume", traders: "Global Active Investors", uptime: "Infrastructure Uptime", latency: "Execution Precision" },
      methodology: { badge: "METHODOLOGY", title: "QUANTITATIVE STRATEGIES", momentum: { title: "MOMENTUM ANALYSIS", desc: "Identification of high-probability trends using proprietary neural networks.", f1: "Trend Detection", f2: "Volume Analysis", f3: "Pattern Recognition" }, volatility: { title: "VOLATILITY ADAPTATION", desc: "Dynamic adjustment of exposure based on real-time market conditions.", f1: "Dynamic Hedging", f2: "Adaptive Stops", f3: "Liquidity Monitoring" }, risk: { title: "RISK MITIGATION", desc: "Multi-layered protection protocols to ensure capital preservation.", f1: "Drawdown Control", f2: "Asset Correlation", f3: "Stress Testing" } },
      process_home: { badge: "PROCESS", title: "INSTITUTIONAL", subtitle: "WORKFLOW", step1: { title: "REGISTRATION", desc: "Secure onboarding and identity verification." }, step2: { title: "ALLOCATION", desc: "Selection of the managed capital tier." }, step3: { title: "INTEGRATION", desc: "Deployment of algorithmic infrastructure." }, step4: { title: "MONITORING", desc: "Real-time performance tracking via terminal." }, step5: { title: "LIQUIDITY", desc: "Seamless profit withdrawal protocols." } },
      cta_home: { badge: "OPPORTUNITY", title: "SCALE YOUR", subtitle: "CAPITAL", desc: "Join the elite group of investors utilizing Braxel's proprietary infrastructure.", btn: "START ALLOCATION", trust: "Institutional Grade Security" },
      pricing: { badge: "TRANSPARENCY", title: "CAPITAL", subtitle: "ALLOCATIONS", desc: "Institutional-grade infrastructure with a transparent fee structure.", select: "SECURE THIS PLAN", allocation: "MANAGED CAPITAL", month: "monthly fee" },
      howItWorks: { badge: "INFRASTRUCTURE", title: "TECHNICAL", subtitle: "ARCHITECTURE", desc: "Our proprietary ecosystem is built for speed, security, and consistent performance.", steps: [{ title: "REGISTRATION", desc: "Create your institutional profile." }, { title: "DASHBOARD", desc: "Access your private management terminal." }, { title: "PLAN SELECTION", desc: "Choose your capital allocation tier." }, { title: "API DEPLOYMENT", desc: "Automated connection to global markets." }, { title: "EXECUTION", desc: "Millisecond algorithmic trade processing." }, { title: "REPORTING", desc: "Detailed weekly performance analytics." }], cta: "READY TO DEPLOY?", ctaBtn: "JOIN THE NETWORK" },
      about: { badge: "ABOUT US", title: "INSTITUTIONAL", subtitle: "EXCELLENCE", desc: "Braxel Markets represents the pinnacle of algorithmic capital management.", historyTitle: "OUR HISTORY", historyDesc1: "Founded by a team of quantitative analysts and software engineers, Braxel was built to bridge the gap between retail capital and institutional technology.", historyDesc2: "Today, we manage billions in volume with a focus on risk-adjusted returns and infrastructure stability.", stats: { founded: "Founded", users: "Active Users", uptime: "Uptime", support: "Support" }, values: { mission: "MISSION", missionDesc: "To provide elite algorithmic infrastructure for global capital.", vision: "VISION", visionDesc: "To define the future of automated quantitative management.", values: "VALUES", valuesDesc: "Transparency, precision, and unwavering security." } },
      contact: { badge: "SUPPORT", title: "INSTITUTIONAL", subtitle: "CHANNELS", desc: "Our dedicated support team is available 24/7 for institutional inquiries.", infoTitle: "CONTACT INFO", formTitle: "DIRECT INQUIRY", placeholders: { name: "FULL NAME", email: "EMAIL ADDRESS", subject: "SUBJECT", message: "MESSAGE" }, sendBtn: "SEND INQUIRY" },
      dashboard: { portfolio: "Portfolio", activeServices: "Active Services", newAllocation: "New Allocation", noServices: "No active investment plans found.", balance: "Current Balance", withdraw: "Withdrawal", liquidity: "Liquidity", requestWithdraw: "Request Withdrawal", selectAccount: "Select Account", amount: "Amount (USD)", iban: "IBAN / Bank Details", btnWithdraw: "SUBMIT WITHDRAWAL REQUEST", profile: "Profile Management", settings: "Settings", firstName: "First Name", lastName: "Last Name", saveChanges: "SAVE CHANGES", verifiedAccount: "Verified Account", totalAUM: "Total Assets Under Management", activeAlgos: "Active Algorithms", systemStatus: "System Status", operational: "Operational", infraProtection: "Infrastructure Protection", twoFactor: "Two-Factor Auth", notEnabled: "Not Enabled", enable2FA: "Enable 2FA", kycStatus: "KYC Verification", verified: "Verified", viewDocs: "View Documents", investor: "Investor" },
      checkout: { summary: "SUMMARY", allocationTitle: "Institutional", allocationSubtitle: "Allocation", tierLabel: "Algorithmic Infrastructure Tier", billedMonthly: "Billed Monthly", detailsTitle: "Allocation Details", managedCapital: "Managed Capital", setupFee: "Setup Fee", waived: "WAIVED", latency: "Execution Latency", infrastructureTitle: "Included Infrastructure", realTimeMonitoring: "Real-time Monitoring", activeUponDeployment: "Active upon deployment", totalDue: "Total Due", dedicatedNode: "Dedicated Node", globalMarkets: "Global Markets", instantSetup: "Instant Setup", authRequired: "AUTHENTICATION REQUIRED", authDesc: "Please login or create an account to proceed with the allocation.", btnLogin: "LOGIN TO PROCEED", btnRegister: "CREATE ACCOUNT", confirmDeployment: "Confirm Deployment", deploymentDesc: "By confirming, you authorize the deployment of the algorithmic infrastructure associated with the {{plan}} plan.", proceedPayment: "PROCEED TO SECURE PAYMENT", secureGateway: "Secure Gateway", back: "Back", riskDisclosure: "Risk Disclosure: Algorithmic trading involves substantial risk of loss. Past performance is not indicative of future results.", secureTransaction: "Secure Transaction", paypalNote: "Your payment information is processed securely by PayPal. Braxel Markets does not store your credit card details.", encryptionNote: "Encrypted by AES-256 Institutional Standards", verifying: "Verifying Institutional Transaction...", loading: "Loading Terminal...", globalInfra: "Global Payment Infrastructure", qrCode: "QR Code", allCards: "All Cards", localPay: "Local Pay" },
      legal: { badgeLegal: "LEGAL", termsTitle: "TERMS OF SERVICE" },
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
      transparency: {
        title: "TRANSPARENCY & RISK",
        badge: "SECURITY",
        desc: "We operate with total transparency. It is important to understand that past performance does not guarantee future results. Our approach is strictly probabilistic, focused on long-term capital preservation and risk-adjusted growth.",
        warning: "RISK WARNING: Trading involves significant risk. Never allocate capital you cannot afford to lose."
      }
    }
  },
  pt: {
    translation: {
      nav: { pricing: "PLANOS DE INVESTIMENTO", howItWorks: "INFRAESTRUTURA", about: "SOBRE NÓS", contact: "SUPORTE INSTITUCIONAL", login: "ACESSO AO TERMINAL", openAccount: "CRIAR CONTA", dashboard: "PAINEL", logout: "SAIR" },
      footer: { desc: "Infraestrutura de investimento de nível institucional. Tecnologia proprietária para o mercado moderno.", platform: "Plataforma", company: "Empresa", support: "Suporte Digital", rights: "Todos os direitos reservados.", privacy: "Privacidade", terms: "Termos", disclaimer: "Aviso Legal" },
      auth: { loginTitle: "Login", loginSubtitle: "Insira suas credenciais de acesso.", registerTitle: "Criar Conta", registerSubtitle: "Comece sua jornada no mercado institucional.", email: "Endereço de E-mail", password: "Senha", fullName: "Nome Completo", forgotPassword: "Esqueceu a senha?", noAccount: "Não tem uma conta?", hasAccount: "Já possui acesso?", btnAccess: "ACESSAR CONTA", btnCreate: "CRIAR MINHA CONTA", termsAgree: "Eu concordo com os Termos e Privacidade.", futureTitle: "O Futuro do", futureSubtitle: "Investimento", features: ["Algoritmos institucionais", "Proteção de capital avançada", "Execução em milissegundos", "Transparência total"] },
      hero: { title1: "GESTÃO DE CAPITAL", title2: "ALGORÍTMICA DE ELITE.", desc: "Implemente estratégias quantitativas de nível institucional projetadas para o mercado moderno. Experimente precisão de execução em milissegundos.", getStarted: "EXPLORAR PLANOS DE INVESTIMENTO", viewStrategies: "METODOLOGIA TÉCNICA" },
      stats: { volume: "Volume Total Gerenciado", traders: "Investidores Ativos", uptime: "Uptime da Infraestrutura", latency: "Precisão de Execução" },
      methodology: { badge: "METODOLOGIA", title: "ESTRATÉGIAS QUANTITATIVAS", momentum: { title: "ANÁLISE DE MOMENTUM", desc: "Identificação de tendências de alta probabilidade usando redes neurais proprietárias.", f1: "Detecção de Tendência", f2: "Análise de Volume", f3: "Reconhecimento de Padrões" }, volatility: { title: "ADAPTÇÃO DE VOLATILIDADE", desc: "Ajuste dinâmico de exposição baseado em condições de mercado em tempo real.", f1: "Hedging Dinâmico", f2: "Stops Adaptativos", f3: "Monitoramento de Liquidez" }, risk: { title: "MITIGAÇÃO DE RIESGO", desc: "Protocolos de proteção em múltiplas camadas para garantir a preservação do capital.", f1: "Controle de Drawdown", f2: "Correlação de Ativos", f3: "Testes de Estresse" } },
      process_home: { badge: "PROCESSO", title: "FLUXO", subtitle: "INSTITUCIONAL", step1: { title: "REGISTRO", desc: "Onboarding seguro e verificação de identidade." }, step2: { title: "ALOCAÇÃO", desc: "Seleção do nível de capital gerenciado." }, step3: { title: "INTEGRAÇÃO", desc: "Implementação da infraestrutura algorítmica." }, step4: { title: "MONITORAMENTO", desc: "Acompanhamento em tempo real via terminal." }, step5: { title: "LIQUIDITÀ", desc: "Protocolos de saque de lucros simplificados." } },
      cta_home: { badge: "OPPORTUNITY", title: "ESCALE SEU", subtitle: "CAPITAL", desc: "Junte-se ao grupo de elite de investidores que utilizam a infraestrutura proprietária da Braxel.", btn: "INICIAR ALOCAÇÃO", trust: "Segurança de Nível Institucional" },
      pricing: { badge: "TRANSPARÊNCIA", title: "ALOCAÇÕES DE", subtitle: "CAPITAL", desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.", select: "GARANTIR ESTE PLANO", allocation: "CAPITAL GERENCIADO", month: "taxa mensal" },
      howItWorks: { badge: "INFRAESTRUTURA", title: "ARQUITETURA", subtitle: "TÉCNICA", desc: "Nosso ecossistema proprietário é construído para velocidade, segurança e desempenho consistente.", steps: [{ title: "REGISTRO", desc: "Crie seu perfil institucional." }, { title: "PAINEL", desc: "Acesse seu terminal privado de gestão." }, { title: "SELEÇÃO DE PLANO", desc: "Escolha seu nível de alocação de capital." }, { title: "IMPLEMENTAÇÃO API", desc: "Conexão automatizada aos mercados globais." }, { title: "EXECUÇÃO", desc: "Processamento de ordens em milissegundos." }, { title: "RELATÓRIOS", desc: "Análise detalhada de desempenho semanal." }], cta: "PRONTO PARA COMEÇAR?", ctaBtn: "ENTRAR NA REDE" },
      about: { badge: "SOBRE NÓS", title: "EXCELÊNCIA", subtitle: "INSTITUCIONAL", desc: "A Braxel Markets representa o ápice da gestão algorítmica de capital.", historyTitle: "NOSSA HISTÓRIA", historyDesc1: "Fundada por uma equipe de analistas quantitativos e engenheiros de software, a Braxel foi criada para unir o capital individual à tecnologia institucional.", historyDesc2: "Hoje, gerenciamos bilhões em volume com foco em retornos ajustados ao risco e estabilidade de infraestrutura.", stats: { founded: "Fundada", users: "Usuários Ativos", uptime: "Uptime", support: "Suporte" }, values: { mission: "MISSÃO", missionDesc: "Fornecer infraestrutura algorítmica de elite para o capital global.", vision: "VISÃO", visionDesc: "Definir o futuro da gestão quantitativa automatizada.", values: "VALORES", valuesDesc: "Transparencia, precisão e segurança inabalável." } },
      contact: { badge: "SUPORTE", title: "CANAIS", subtitle: "INSTITUCIONAIS", desc: "Nossa equipe de suporte dedicada está disponível 24/7 para consultas institucionais.", infoTitle: "CONTATO", formTitle: "CONSULTA DIRETA", placeholders: { name: "NOME COMPLETO", email: "ENDEREÇO DE E-MAIL", subject: "ASSUNTO", message: "MENSAGEM" }, sendBtn: "ENVIAR CONSULTA" },
      dashboard: { portfolio: "Portfólio", activeServices: "Serviços Ativos", newAllocation: "Nova Alocação", noServices: "Nenhum plano de investimento ativo encontrado.", balance: "Saldo Atual", withdraw: "Saque", liquidity: "Liquidez", requestWithdraw: "Solicitar Saque", selectAccount: "Selecionar Conta", amount: "Valor (USD)", iban: "IBAN / Dados Bancários", btnWithdraw: "ENVIAR SOLICITAÇÃO DE SAQUE", profile: "Gestão de Perfil", settings: "Configurações", firstName: "Nome", lastName: "Sobrenome", saveChanges: "SALVAR ALTERAÇÕES", verifiedAccount: "Conta Verificada", totalAUM: "Total de Ativos sob Gestão", activeAlgos: "Algoritmos Ativos", systemStatus: "Status do Sistema", operational: "Operacional", infraProtection: "Proteção de Infraestrutura", twoFactor: "Autenticação de Dois Fatores", notEnabled: "Não Ativado", enable2FA: "Ativar 2FA", kycStatus: "Verificação KYC", verified: "Verificado", viewDocs: "Ver Documentos", investor: "Investidor" },
      checkout: { summary: "RESUMO", allocationTitle: "Alocação", allocationSubtitle: "Institucional", tierLabel: "Nível de Infraestrutura Algorítmica", billedMonthly: "Faturado Mensualmente", detailsTitle: "Detalhes da Alocação", managedCapital: "Capital Gerenciado", setupFee: "Taxa de Configuração", waived: "ISENTA", latency: "Latência de Execução", infrastructureTitle: "Infraestrutura Incluída", realTimeMonitoring: "Monitoramento em Tempo Real", activeUponDeployment: "Ativo após implementação", totalDue: "Total Devido", dedicatedNode: "Nó Dedicado", globalMarkets: "Mercados Globais", instantSetup: "Configuração Instantânea", authRequired: "AUTENTICAÇÃO NECESSÁRIA", authDesc: "Por favor, faça login ou crie uma conta para prosseguir com a alocação.", btnLogin: "LOGIN PARA PROSSEGUIR", btnRegister: "CRIAR CONTA", confirmDeployment: "Confirmar Implementação", deploymentDesc: "Ao confirmar, você autoriza a implementação da infraestrutura algorítmica associada ao plano {{plan}}.", proceedPayment: "PROSSEGUIR PARA PAGAMENTO SEGURO", secureGateway: "Gateway Seguro", back: "Voltar", riskDisclosure: "Divulgação de Risco: O trading algorítmico envolve risco substancial de perda. O desempenho passado não é indicativo de resultados futuros.", secureTransaction: "Transação Segura", paypalNote: "Suas informações de pagamento são processadas com segurança pelo PayPal. A Braxel Markets não armazena os dados do seu cartão.", encryptionNote: "Criptografado por Padrões Institucionais AES-256", verifying: "Verificando Transação Institucional...", loading: "Carregando Terminal...", globalInfra: "Infraestrutura Global de Pagamento", qrCode: "QR Code", allCards: "Todos os Cartões", localPay: "Pagamento Local" },
      legal: { badgeLegal: "LEGAL", termsTitle: "TERMOS DE SERVIÇO" },
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
      transparency: {
        title: "TRANSPARÊNCIA E RISCO",
        badge: "SEGURANÇA",
        desc: "Operamos com transparência total. É importante entender que retornos passados não garantem resultados futuros. Nossa abordagem é estritamente probabilística, focada na preservação de capital e crescimento ajustado ao risco.",
        warning: "AVISO DE RISCO: O trading envolve risco significativo. Nunca aloque capital que você não possa perder."
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
    detection: {
      order: ['localStorage', 'cookie', 'sessionStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    }
  }, (err, t) => {
    if (err) return console.error(err);
    document.documentElement.lang = i18n.language;
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  const isRtl = lng === 'ar' || lng === 'he';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
});

export default i18n;