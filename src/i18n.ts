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
      nav: { pricing: "INVESTMENT PLANS", howItWorks: "THE INFRASTRUCTURE", about: "OUR LEGACY", contact: "INSTITUTIONAL SUPPORT", login: "TERMINAL ACCESS", openAccount: "CREATE ACCOUNT", dashboard: "DASHBOARD", logout: "SIGN OUT" },
      footer: { desc: "Institutional-grade investment infrastructure. Proprietary technology for the modern market.", platform: "Platform", company: "Company", support: "Digital Support", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", disclaimer: "Financial Disclaimer" },
      auth: { loginTitle: "Login", loginSubtitle: "Enter your access credentials.", registerTitle: "Create Account", registerSubtitle: "Start your journey in the institutional market.", email: "Email Address", password: "Password", fullName: "Full Name", forgotPassword: "Forgot password?", noAccount: "Don't have an account?", hasAccount: "Already have access?", btnAccess: "ACCESS ACCOUNT", btnCreate: "CREATE MY ACCOUNT", termsAgree: "I agree to the Terms and Privacy.", futureTitle: "The Future of", futureSubtitle: "Investment", features: ["Institutional-grade algorithms", "Advanced capital protection", "Millisecond execution", "Total transparency"] },
      hero: { title1: "ELITE ALGORITHMIC", title2: "CAPITAL MANAGEMENT.", desc: "Deploy institutional-grade quantitative strategies engineered for the modern market. Experience millisecond execution precision and advanced risk mitigation protocols.", getStarted: "EXPLORE INVESTMENT PLANS", viewStrategies: "TECHNICAL METHODOLOGY" },
      stats: { volume: "Total Managed Volume", traders: "Global Active Investors", uptime: "Infrastructure Uptime", latency: "Execution Precision" },
      methodology: { badge: "METHODOLOGY", title: "QUANTITATIVE STRATEGIES", momentum: { title: "MOMENTUM ANALYSIS", desc: "Identification of high-probability trends using proprietary neural networks.", f1: "Trend Detection", f2: "Volume Analysis", f3: "Pattern Recognition" }, volatility: { title: "VOLATILITY ADAPTATION", desc: "Dynamic adjustment of exposure based on real-time market conditions.", f1: "Dynamic Hedging", f2: "Adaptive Stops", f3: "Liquidity Monitoring" }, risk: { title: "RISK MITIGATION", desc: "Multi-layered protection protocols to ensure capital preservation.", f1: "Drawdown Control", f2: "Asset Correlation", f3: "Stress Testing" } },
      process_home: { badge: "PROCESS", title: "INSTITUTIONAL", subtitle: "WORKFLOW", step1: { title: "REGISTRATION", desc: "Secure onboarding and identity verification." }, step2: { title: "ALLOCATION", desc: "Selection of the managed capital tier." }, step3: { title: "INTEGRATION", desc: "Deployment of algorithmic infrastructure." }, step4: { title: "MONITORING", desc: "Real-time performance tracking via terminal." }, step5: { title: "LIQUIDITY", desc: "Seamless profit withdrawal protocols." } },
      cta_home: { badge: "OPPORTUNITY", title: "SCALE YOUR", subtitle: "CAPITAL", desc: "Join the elite group of investors utilizing Braxel's proprietary infrastructure.", btn: "START ALLOCATION", trust: "Institutional Grade Security" },
      pricing: { badge: "TRANSPARENCY", title: "CAPITAL", subtitle: "ALLOCATIONS", desc: "Institutional-grade infrastructure with a transparent fee structure.", select: "SECURE THIS PLAN", allocation: "MANAGED CAPITAL", month: "monthly fee" },
      howItWorks: { badge: "INFRASTRUCTURE", title: "TECHNICAL", subtitle: "ARCHITECTURE", desc: "Our proprietary ecosystem is built for speed, security, and consistent performance.", steps: [{ title: "REGISTRATION", desc: "Create your institutional profile." }, { title: "DASHBOARD", desc: "Access your private management terminal." }, { title: "PLAN SELECTION", desc: "Choose your capital allocation tier." }, { title: "API DEPLOYMENT", desc: "Automated connection to global markets." }, { title: "EXECUTION", desc: "Millisecond algorithmic trade processing." }, { title: "REPORTING", desc: "Detailed weekly performance analytics." }], cta: "READY TO DEPLOY?", ctaBtn: "JOIN THE NETWORK" },
      about: { badge: "LEGACY", title: "INSTITUTIONAL", subtitle: "EXCELLENCE", desc: "Braxel Markets represents the pinnacle of algorithmic capital management.", historyTitle: "OUR HISTORY", historyDesc1: "Founded by a team of quantitative analysts and software engineers, Braxel was built to bridge the gap between retail capital and institutional technology.", historyDesc2: "Today, we manage billions in volume with a focus on risk-adjusted returns and infrastructure stability.", stats: { founded: "Founded", users: "Active Users", uptime: "Uptime", support: "Support" }, values: { mission: "MISSION", missionDesc: "To provide elite algorithmic infrastructure for global capital.", vision: "VISION", visionDesc: "To define the future of automated quantitative management.", values: "VALUES", valuesDesc: "Transparency, precision, and unwavering security." } },
      contact: { badge: "SUPPORT", title: "INSTITUTIONAL", subtitle: "CHANNELS", desc: "Our dedicated support team is available 24/7 for institutional inquiries.", infoTitle: "CONTACT INFO", formTitle: "DIRECT INQUIRY", placeholders: { name: "FULL NAME", email: "EMAIL ADDRESS", subject: "SUBJECT", message: "MESSAGE" }, sendBtn: "SEND INQUIRY" },
      dashboard: { portfolio: "Portfolio", activeServices: "Active Services", newAllocation: "New Allocation", noServices: "No active investment plans found.", balance: "Current Balance", withdraw: "Withdrawal", liquidity: "Liquidity", requestWithdraw: "Request Withdrawal", selectAccount: "Select Account", amount: "Amount (USD)", iban: "IBAN / Bank Details", btnWithdraw: "SUBMIT WITHDRAWAL REQUEST", profile: "Profile Management", settings: "Settings", firstName: "First Name", lastName: "Last Name", saveChanges: "SAVE CHANGES" },
      checkout: { 
        summary: "SUMMARY", 
        allocationTitle: "Institutional",
        allocationSubtitle: "Allocation",
        tierLabel: "Algorithmic Infrastructure Tier",
        billedMonthly: "Billed Monthly",
        detailsTitle: "Allocation Details",
        managedCapital: "Managed Capital",
        setupFee: "Setup Fee",
        waived: "WAIVED",
        latency: "Execution Latency",
        infrastructureTitle: "Included Infrastructure",
        realTimeMonitoring: "Real-time Monitoring",
        activeUponDeployment: "Active upon deployment",
        totalDue: "Total Due",
        dedicatedNode: "Dedicated Node",
        globalMarkets: "Global Markets",
        instantSetup: "Instant Setup",
        authRequired: "AUTHENTICATION REQUIRED",
        authDesc: "Please login or create an account to proceed with the allocation.",
        btnLogin: "LOGIN TO PROCEED",
        btnRegister: "CREATE ACCOUNT",
        confirmDeployment: "Confirm Deployment",
        deploymentDesc: "By confirming, you authorize the deployment of the algorithmic infrastructure associated with the {{plan}} plan.",
        proceedPayment: "PROCEED TO SECURE PAYMENT",
        secureGateway: "Secure Gateway",
        back: "Back",
        riskDisclosure: "Risk Disclosure: Algorithmic trading involves substantial risk of loss. Past performance is not indicative of future results.",
        secureTransaction: "Secure Transaction",
        paypalNote: "Your payment information is processed securely by PayPal. Braxel Markets does not store your credit card details.",
        encryptionNote: "Encrypted by AES-256 Institutional Standards"
      },
      legal: { badgeLegal: "LEGAL", termsTitle: "TERMS OF SERVICE" }
    }
  },
  pt: {
    translation: {
      nav: { pricing: "PLANOS DE INVESTIMENTO", howItWorks: "INFRAESTRUTURA", about: "NOSSO LEGADO", contact: "SUPORTE INSTITUCIONAL", login: "ACESSO AO TERMINAL", openAccount: "CRIAR CONTA", dashboard: "PAINEL", logout: "SAIR" },
      footer: { desc: "Infraestrutura de investimento de nível institucional. Tecnologia proprietária para o mercado moderno.", platform: "Plataforma", company: "Empresa", support: "Suporte Digital", rights: "Todos os direitos reservados.", privacy: "Privacidade", terms: "Termos", disclaimer: "Aviso Legal" },
      auth: { loginTitle: "Login", loginSubtitle: "Insira suas credenciais de acesso.", registerTitle: "Criar Conta", registerSubtitle: "Comece sua jornada no mercado institucional.", email: "Endereço de E-mail", password: "Senha", fullName: "Nome Completo", forgotPassword: "Esqueceu a senha?", noAccount: "Não tem uma conta?", hasAccount: "Já possui acesso?", btnAccess: "ACESSAR CONTA", btnCreate: "CRIAR MINHA CONTA", termsAgree: "Eu concordo com os Termos e Privacidade.", futureTitle: "O Futuro do", futureSubtitle: "Investimento", features: ["Algoritmos institucionais", "Proteção de capital avançada", "Execução em milissegundos", "Transparença total"] },
      hero: { title1: "GESTÃO DE CAPITAL", title2: "ALGORÍTMICA DE ELITE.", desc: "Implemente estratégias quantitativas de nível institucional projetadas para o mercado moderno. Experimente precisão de execução em milissegundos.", getStarted: "EXPLORAR PLANOS DE INVESTIMENTO", viewStrategies: "METODOLOGIA TÉCNICA" },
      stats: { volume: "Volume Total Gerenciado", traders: "Investidores Ativos", uptime: "Uptime da Infraestrutura", latency: "Precisão de Execução" },
      methodology: { badge: "METODOLOGIA", title: "ESTRATÉGIAS QUANTITATIVAS", momentum: { title: "ANÁLISIS DE MOMENTUM", desc: "Identificação de tendências de alta probabilidade usando redes neurais proprietárias.", f1: "Detecção de Tendência", f2: "Análise de Volume", f3: "Reconhecimento de Padrões" }, volatility: { title: "ADAPTACIÓN DE VOLATILIDADE", desc: "Ajuste dinâmico de exposição baseado em condições de mercado em tempo real.", f1: "Hedging Dinâmico", f2: "Stops Adaptativos", f3: "Monitoramento de Liquidez" }, risk: { title: "MITIGAÇÃO DE RISCO", desc: "Protocolos de proteção em múltiplas camadas para garantir a preservação do capital.", f1: "Controle de Drawdown", f2: "Correlação de Ativos", f3: "Testes de Estresse" } },
      process_home: { badge: "PROCESSO", title: "FLUXO", subtitle: "INSTITUCIONAL", step1: { title: "REGISTRO", desc: "Onboarding seguro e verificação de identidade." }, step2: { title: "ALOCAÇÃO", desc: "Seleção do nível de capital gerenciado." }, step3: { title: "INTEGRAÇÃO", desc: "Implementação da infraestrutura algorítmica." }, step4: { title: "MONITORAMENTO", desc: "Acompanhamento em tempo real via terminal." }, step5: { title: "LIQUIDEZ", desc: "Protocolos de saque de lucros simplificados." } },
      cta_home: { badge: "OPPORTUNIDADE", title: "ESCALE SEU", subtitle: "CAPITAL", desc: "Junte-se ao grupo de elite de investidores que utilizam a infraestrutura proprietária da Braxel.", btn: "INICIAR ALOCAÇÃO", trust: "Segurança de Nível Institucional" },
      pricing: { badge: "TRANSPARENCIA", title: "ALOCAÇÕES DE", subtitle: "CAPITAL", desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.", select: "GARANTIR ESTE PLANO", allocation: "CAPITAL GERENCIADO", month: "taxa mensal" },
      howItWorks: { badge: "INFRAESTRUTURA", title: "ARQUITETURA", subtitle: "TÉCNICA", desc: "Nosso ecossistema proprietário é construído para velocidade, segurança e desempenho consistente.", steps: [{ title: "REGISTRO", desc: "Crie seu perfil institucional." }, { title: "PAINEL", desc: "Acesse seu terminal privado de gestão." }, { title: "SELEÇÃO DE PLANO", desc: "Escolha seu nível de alocação de capital." }, { title: "IMPLEMENTAÇÃO API", desc: "Conexão automatizada aos mercados globais." }, { title: "EXECUÇÃO", desc: "Processamento de ordens em milissegundos." }, { title: "RELATÓRIOS", desc: "Análise detalhada de desempenho semanal." }], cta: "PRONTO PARA COMEÇAR?", ctaBtn: "ENTRAR NA REDE" },
      about: { badge: "LEGADO", title: "EXCELÊNCIA", subtitle: "INSTITUTIONAL", desc: "A Braxel Markets representa o ápice da gestão algorítmica de capital.", historyTitle: "NOSSA HISTÓRIA", historyDesc1: "Fundada por uma equipe de analistas quantitativos e engenheiros de software, a Braxel foi criada para unir o capital individual à tecnologia institucional.", historyDesc2: "Hoje, gerenciamos bilhões em volume com foco em retornos ajustados ao risco e estabilidade de infraestrutura.", stats: { founded: "Fundada", users: "Usuários Ativos", uptime: "Uptime", support: "Suporte" }, values: { mission: "MISSÃO", missionDesc: "Fornecer infraestrutura algorítmica de elite para o capital global.", vision: "VISÃO", visionDesc: "Definir o futuro da gestão quantitativa automatizada.", values: "VALORES", valuesDesc: "Transparença, precisão e segurança inabalável." } },
      contact: { badge: "SUPORTE", title: "CANAIS", subtitle: "INSTITUCIONAIS", desc: "Nossa equipe de suporte dedicada está disponível 24/7 para consultas institucionais.", infoTitle: "CONTATO", formTitle: "CONSULTA DIRETA", placeholders: { name: "NOME COMPLETO", email: "ENDEREÇO DE E-MAIL", subject: "ASSUNTO", message: "MENSAGEM" }, sendBtn: "ENVIAR CONSULTA" },
      dashboard: { portfolio: "Portfólio", activeServices: "Serviços Ativos", newAllocation: "Nova Alocação", noServices: "Nenhum plano de investimento ativo encontrado.", balance: "Saldo Atual", withdraw: "Saque", liquidity: "Liquidez", requestWithdraw: "Solicitar Saque", selectAccount: "Selecionar Conta", amount: "Valor (USD)", iban: "IBAN / Dados Bancários", btnWithdraw: "ENVIAR SOLICITAÇÃO DE SAQUE", profile: "Gestão de Perfil", settings: "Configurações", firstName: "Nome", lastName: "Sobrenome", saveChanges: "SALVAR ALTERAÇÕES" },
      checkout: { 
        summary: "RESUMO", 
        allocationTitle: "Alocação",
        allocationSubtitle: "Institucional",
        tierLabel: "Nível de Infraestrutura Algorítmica",
        billedMonthly: "Faturado Mensalmente",
        detailsTitle: "Detalhes da Alocação",
        managedCapital: "Capital Gerenciado",
        setupFee: "Taxa de Configuração",
        waived: "ISENTA",
        latency: "Latência de Execução",
        infrastructureTitle: "Infraestrutura Incluída",
        realTimeMonitoring: "Monitoramento em Tempo Real",
        activeUponDeployment: "Ativo após implementação",
        totalDue: "Total Devido",
        dedicatedNode: "Nó Dedicado",
        globalMarkets: "Mercados Globais",
        instantSetup: "Configuração Instantânea",
        authRequired: "AUTENTICAÇÃO NECESSÁRIA",
        authDesc: "Por favor, faça login ou crie uma conta para prosseguir com a alocação.",
        btnLogin: "LOGIN PARA PROSSEGUIR",
        btnRegister: "CRIAR CONTA",
        confirmDeployment: "Confirmar Implementação",
        deploymentDesc: "Ao confirmar, você autoriza a implementação da infraestrutura algorítmica associada ao plano {{plan}}.",
        proceedPayment: "PROSSEGUIR PARA PAGAMENTO SEGURO",
        secureGateway: "Gateway Seguro",
        back: "Voltar",
        riskDisclosure: "Divulgação de Risco: O trading algorítmico envolve risco substancial de perda. O desempenho passado não é indicativo de resultados futuros.",
        secureTransaction: "Transação Segura",
        paypalNote: "Suas informações de pagamento são processadas com segurança pelo PayPal. A Braxel Markets não armazena os dados do seu cartão.",
        encryptionNote: "Criptografado por Padrões Institucionais AES-256"
      },
      legal: { badgeLegal: "LEGAL", termsTitle: "TERMOS DE SERVIÇO" }
    }
  },
  it: {
    translation: {
      nav: { pricing: "PIANI DI INVESTIMENTO", howItWorks: "INFRASTRUTTURA", about: "IL NOSTRO LEGACY", contact: "SUPPORTO ISTITUZIONALE", login: "ACCESSO TERMINALE", openAccount: "CREA ACCOUNT", dashboard: "DASHBOARD", logout: "ESCI" },
      checkout: { 
        summary: "RIEPILOGO", allocationTitle: "Allocazione", allocationSubtitle: "Istituzionale", tierLabel: "Livello Infrastruttura Algoritmica", billedMonthly: "Fatturato Mensilmente", detailsTitle: "Dettagli Allocazione", managedCapital: "Capitale Gestito", setupFee: "Costo di Attivazione", waived: "GRATUITO", latency: "Latenza di Esecuzione", infrastructureTitle: "Infrastruttura Inclusa", realTimeMonitoring: "Monitoraggio in Tempo Reale", activeUponDeployment: "Attivo dopo l'implementazione", totalDue: "Totale Dovuto", dedicatedNode: "Nodo Dedicato", globalMarkets: "Mercati Globali", instantSetup: "Configurazione Istantanea", authRequired: "AUTENTICAZIONE RICHIESTA", authDesc: "Accedi o crea un account per procedere con l'allocazione.", btnLogin: "ACCEDI PER PROCEDERE", btnRegister: "CREA ACCOUNT", confirmDeployment: "Conferma Implementazione", deploymentDesc: "Confermando, autorizzi l'implementazione dell'infrastruttura algoritmica associata al piano {{plan}}.", proceedPayment: "PROCEDI AL PAGAMENTO SICURO", secureGateway: "Gateway Sicuro", back: "Indietro", riskDisclosure: "Informativa sui Rischi: Il trading algoritmico comporta un rischio sostanziale di perdita.", secureTransaction: "Transazione Sicura", paypalNote: "Le tue informazioni di pagamento sono elaborate in modo sicuro da PayPal.", encryptionNote: "Criptato secondo gli Standard Istituzionali AES-256"
      }
    }
  },
  es: {
    translation: {
      nav: { pricing: "PLANES DE INVERSIÓN", howItWorks: "INFRAESTRUCTURA", about: "NUESTRO LEGADO", contact: "SOPORTE INSTITUCIONAL", login: "ACCESO TERMINAL", openAccount: "CREAR CUENTA", dashboard: "PANEL", logout: "CERRAR SESIÓN" },
      checkout: { 
        summary: "RESUMEN", allocationTitle: "Asignación", allocationSubtitle: "Institucional", tierLabel: "Nivel de Infraestructura Algorítmica", billedMonthly: "Facturado Mensualmente", detailsTitle: "Detalles de Asignación", managedCapital: "Capital Gestionado", setupFee: "Tarifa de Configuración", waived: "EXENTO", latency: "Latencia de Ejecución", infrastructureTitle: "Infraestructura Incluida", realTimeMonitoring: "Monitoreo en Tiempo Real", activeUponDeployment: "Activo tras la implementación", totalDue: "Total a Pagar", dedicatedNode: "Nodo Dedicado", globalMarkets: "Mercados Globales", instantSetup: "Configuración Instantánea", authRequired: "AUTENTICACIÓN REQUERIDA", authDesc: "Inicie sesión o cree una cuenta para proceder con la asignación.", btnLogin: "INICIAR SESIÓN PARA PROCEDER", btnRegister: "CREAR CUENTA", confirmDeployment: "Confirmar Implementación", deploymentDesc: "Al confirmar, autoriza la implementación de la infraestructura algorítmica asociada al plan {{plan}}.", proceedPayment: "PROCEDER AL PAGO SEGURO", secureGateway: "Pasarela Segura", back: "Atrás", riskDisclosure: "Divulgación de Riesgos: El trading algorítmico implica un riesgo sustancial de pérdida.", secureTransaction: "Transacción Segura", paypalNote: "Su información de pago es procesada de forma segura por PayPal.", encryptionNote: "Encriptado por Estándares Institucionales AES-256"
      }
    }
  },
  fr: {
    translation: {
      nav: { pricing: "PLANS D'INVESTISSEMENT", howItWorks: "L'INFRASTRUCTURE", about: "NOTRE HÉRITAGE", contact: "SUPPORT INSTITUTIONNEL", login: "ACCÈS TERMINAL", openAccount: "CRÉER UN COMPTE", dashboard: "TABLEAU DE BORD", logout: "DÉCONNEXION" },
      checkout: { 
        summary: "RÉSUMÉ", allocationTitle: "Allocation", allocationSubtitle: "Institutionnelle", tierLabel: "Niveau d'Infrastructure Algorithmique", billedMonthly: "Facturé Mensuellement", detailsTitle: "Détails de l'Allocation", managedCapital: "Capital Géré", setupFee: "Frais de Configuration", waived: "OFFERT", latency: "Latence d'Exécution", infrastructureTitle: "Infrastructure Incluse", realTimeMonitoring: "Surveillance en Temps Réel", activeUponDeployment: "Actif dès le déploiement", totalDue: "Total Dû", dedicatedNode: "Nœud Dédié", globalMarkets: "Marchés Mondiaux", instantSetup: "Configuration Instantanée", authRequired: "AUTHENTIFICATION REQUISE", authDesc: "Veuillez vous connecter ou créer un compte pour procéder à l'allocation.", btnLogin: "SE CONNECTER POUR CONTINUER", btnRegister: "CRÉER UN COMPTE", confirmDeployment: "Confirmer le Déploiement", deploymentDesc: "En confirmant, vous autorisez le déploiement de l'infrastructure algorithmique associée au plan {{plan}}.", proceedPayment: "PASSER AU PAIEMENT SÉCURISÉ", secureGateway: "Passerelle Sécurisée", back: "Retour", riskDisclosure: "Avertissement sur les Risques : Le trading algorithmique comporte un risque substantiel de perte.", secureTransaction: "Transaction Sécurisée", paypalNote: "Vos informations de paiement sont traitées en toute sécurité par PayPal.", encryptionNote: "Crypté selon les Normes Institutionnelles AES-256"
      }
    }
  },
  de: {
    translation: {
      nav: { pricing: "INVESTITIONSPLÄNE", howItWorks: "INFRASTRUKTUR", about: "UNSER VERMÄCHTNIS", contact: "INSTITUTIONELLER SUPPORT", login: "TERMINAL-ZUGANG", openAccount: "KONTO ERSTELLEN", dashboard: "DASHBOARD", logout: "ABMELDEN" },
      checkout: { 
        summary: "ZUSAMMENFASSUNG", allocationTitle: "Institutionelle", allocationSubtitle: "Allokation", tierLabel: "Stufe der algorithmischen Infrastruktur", billedMonthly: "Monatliche Abrechnung", detailsTitle: "Allokationsdetails", managedCapital: "Verwaltetes Kapital", setupFee: "Einrichtungsgebühr", waived: "ERLASSEN", latency: "Ausführungslatenz", infrastructureTitle: "Enthaltene Infrastruktur", realTimeMonitoring: "Echtzeit-Überwachung", activeUponDeployment: "Aktiv nach Bereitstellung", totalDue: "Gesamtbetrag", dedicatedNode: "Dedizierter Knoten", globalMarkets: "Globale Märkte", instantSetup: "Sofortige Einrichtung", authRequired: "AUTHENTIFIZIERUNG ERFORDERLICH", authDesc: "Bitte melden Sie sich an oder erstellen Sie ein Konto, um mit der Allokation fortzufahren.", btnLogin: "ANMELDEN ZUM FORTFAHREN", btnRegister: "KONTO ERSTELLEN", confirmDeployment: "Bereitstellung bestätigen", deploymentDesc: "Mit der Bestätigung autorisieren Sie die Bereitstellung der algorithmischen Infrastruktur für den Plan {{plan}}.", proceedPayment: "WEITER ZUR SICHEREN ZAHLUNG", secureGateway: "Sicheres Gateway", back: "Zurück", riskDisclosure: "Risikohinweis: Algorithmischer Handel birgt erhebliche Verlustrisiken.", secureTransaction: "Sichere Transaktion", paypalNote: "Ihre Zahlungsinformationen werden sicher von PayPal verarbeitet.", encryptionNote: "Verschlüsselt nach institutionellen AES-256-Standards"
      }
    }
  },
  ru: {
    translation: {
      nav: { pricing: "ИНВЕСТИЦИОННЫЕ ПЛАНЫ", howItWorks: "ИНФРАСТРУКТУРА", about: "НАШЕ НАСЛЕДИЕ", contact: "ПОДДЕРЖКА", login: "ДОСТУП К ТЕРМИНАЛУ", openAccount: "СОЗДАТЬ АККАУНТ", dashboard: "ПАНЕЛЬ", logout: "ВЫХОД" },
      checkout: { 
        summary: "ОБЗОР", allocationTitle: "Институциональное", allocationSubtitle: "Размещение", tierLabel: "Уровень алгоритмической инфраструктуры", billedMonthly: "Ежемесячная оплата", detailsTitle: "Детали размещения", managedCapital: "Управляемый капитал", setupFee: "Плата за настройку", waived: "ОТМЕНЕНА", latency: "Задержка исполнения", infrastructureTitle: "Включенная инфраструктура", realTimeMonitoring: "Мониторинг в реальном времени", activeUponDeployment: "Активируется после развертывания", totalDue: "Итого к оплате", dedicatedNode: "Выделенный узел", globalMarkets: "Глобальные рынки", instantSetup: "Мгновенная настройка", authRequired: "ТРЕБУЕТСЯ АВТОРИЗАЦИЯ", authDesc: "Пожалуйста, войдите или создайте аккаунт, чтобы продолжить размещение.", btnLogin: "ВОЙТИ ДЛЯ ПРОДОЛЖЕНИЯ", btnRegister: "СОЗДАТЬ АККАУНТ", confirmDeployment: "Подтвердить развертывание", deploymentDesc: "Подтверждая, вы разрешаете развертывание алгоритмической инфраструктуры, связанной с планом {{plan}}.", proceedPayment: "ПЕРЕЙТИ К БЕЗОПАСНОЙ ОПЛАТЕ", secureGateway: "Безопасный шлюз", back: "Назад", riskDisclosure: "Раскрытие рисков: Алгоритмическая торговля сопряжена со значительным риском убытков.", secureTransaction: "Безопасная транзакция", paypalNote: "Ваша платежная информация надежно обрабатывается PayPal.", encryptionNote: "Зашифровано по институциональным стандартам AES-256"
      }
    }
  },
  zh: {
    translation: {
      nav: { pricing: "投资计划", howItWorks: "基础设施", about: "我们的传承", contact: "机构支持", login: "终端访问", openAccount: "创建账户", dashboard: "仪表板", logout: "登出" },
      checkout: { 
        summary: "摘要", allocationTitle: "机构", allocationSubtitle: "分配", tierLabel: "算法基础设施层级", billedMonthly: "按月计费", detailsTitle: "分配详情", managedCapital: "管理资本", setupFee: "设置费", waived: "免除", latency: "执行延迟", infrastructureTitle: "包含的基础设施", realTimeMonitoring: "实时监控", activeUponDeployment: "部署后激活", totalDue: "应付总额", dedicatedNode: "专用节点", globalMarkets: "全球市场", instantSetup: "即时设置", authRequired: "需要身份验证", authDesc: "请登录或创建账户以继续分配。", btnLogin: "登录以继续", btnRegister: "创建账户", confirmDeployment: "确认部署", deploymentDesc: "确认后，即表示您授权部署与 {{plan}} 计划相关的算法基础设施。", proceedPayment: "继续安全支付", secureGateway: "安全网关", back: "返回", riskDisclosure: "风险披露：算法交易涉及重大损失风险。", secureTransaction: "安全交易", paypalNote: "您的支付信息由 PayPal 安全处理。", encryptionNote: "采用 AES-256 机构标准加密"
      }
    }
  },
  ja: {
    translation: {
      nav: { pricing: "投資プラン", howItWorks: "インフラストラクチャ", about: "私たちの遺産", contact: "機関サポート", login: "ターミナルアクセス", openAccount: "アカウント作成", dashboard: "ダッシュボード", logout: "ログアウト" },
      checkout: { 
        summary: "概要", allocationTitle: "機関投資家向け", allocationSubtitle: "アロケーション", tierLabel: "アルゴリズム・インフラ・ティア", billedMonthly: "月額請求", detailsTitle: "アロケーション詳細", managedCapital: "運用資産", setupFee: "セットアップ費用", waived: "免除", latency: "実行レイテンシ", infrastructureTitle: "含まれるインフラ", realTimeMonitoring: "リアルタイム・モニタリング", activeUponDeployment: "デプロイ時に有効化", totalDue: "合計金額", dedicatedNode: "専用ノード", globalMarkets: "グローバル市場", instantSetup: "即時セットアップ", authRequired: "認証が必要です", authDesc: "アロケーションを進めるには、ログインまたはアカウント作成を行ってください。", btnLogin: "ログインして進む", btnRegister: "アカウント作成", confirmDeployment: "デプロイの確認", deploymentDesc: "確認することで、{{plan}} プランに関連するアルゴリズム・インフラのデプロイを承認したことになります。", proceedPayment: "安全な支払いに進む", secureGateway: "セキュア・ゲートウェイ", back: "戻る", riskDisclosure: "リスク開示：アルゴリズム取引には重大な損失のリスクが伴います。", secureTransaction: "安全な取引", paypalNote: "お支払い情報はPayPalによって安全に処理されます。", encryptionNote: "AES-256機関基準による暗号化"
      }
    }
  },
  ar: {
    translation: {
      nav: { pricing: "خطط الاستثمار", howItWorks: "البنية التحتية", about: "إرثنا", contact: "الدعم المؤسسي", login: "الوصول إلى المحطة", openAccount: "إنشاء حساب", dashboard: "لوحة القيادة", logout: "تسجيل الخروج" },
      checkout: { 
        summary: "ملخص", allocationTitle: "تخصيص", allocationSubtitle: "مؤسسي", tierLabel: "مستوى البنية التحتية الخوارزمية", billedMonthly: "فوترة شهرية", detailsTitle: "تفاصيل التخصيص", managedCapital: "رأس المال المدار", setupFee: "رسوم الإعداد", waived: "معفى", latency: "زمن تنفيذ العمليات", infrastructureTitle: "البنية التحتية المضمنة", realTimeMonitoring: "مراقبة في الوقت الفعلي", activeUponDeployment: "نشط عند النشر", totalDue: "إجمالي المستحق", dedicatedNode: "عقدة مخصصة", globalMarkets: "أسواق عالمية", instantSetup: "إعداد فوري", authRequired: "المصادقة مطلوبة", authDesc: "يرجى تسجيل الدخول أو إنشاء حساب للمتابعة في التخصيص.", btnLogin: "تسجيل الدخول للمتابعة", btnRegister: "إنشاء حساب", confirmDeployment: "تأكيد النشر", deploymentDesc: "من خلال التأكيد، فإنك تفوض نشر البنية التحتية الخوارزمية المرتبطة بخطة {{plan}}.", proceedPayment: "المتابعة للدفع الآمن", secureGateway: "بوابة آمنة", back: "رجوع", riskDisclosure: "إخلاء المسؤولية عن المخاطر: ينطوي التداول الخوارزمي على مخاطر كبيرة للخسارة.", secureTransaction: "معاملة آمنة", paypalNote: "تتم معالجة معلومات الدفع الخاصة بك بشكل آمن بواسطة PayPal.", encryptionNote: "مشفر بمعايير AES-256 المؤسسية"
      }
    }
  },
  he: {
    translation: {
      nav: { pricing: "תוכניות השקעה", howItWorks: "התשתית", about: "המורשת שלנו", contact: "תמיכה מוסדית", login: "גישה לטרמינל", openAccount: "צור חשבון", dashboard: "לוח בקרה", logout: "התנתק" },
      checkout: { 
        summary: "סיכום", allocationTitle: "הקצאה", allocationSubtitle: "מוסדית", tierLabel: "רמת תשתית אלגוריתמית", billedMonthly: "חיוב חודשי", detailsTitle: "פרטי הקצאה", managedCapital: "הון מנוהל", setupFee: "דמי הקמה", waived: "פטור", latency: "זמן ביצוע", infrastructureTitle: "תשתית כלולה", realTimeMonitoring: "ניטור בזמן אמת", activeUponDeployment: "פעיל עם הפריסה", totalDue: "סה\"כ לתשלום", dedicatedNode: "צומת ייעודי", globalMarkets: "שווקים גלובליים", instantSetup: "הקמה מיידית", authRequired: "נדרש אימות", authDesc: "אנא התחבר או צור חשבון כדי להמשיך בהקצאה.", btnLogin: "התחבר להמשך", btnRegister: "צור חשבון", confirmDeployment: "אשר פריסה", deploymentDesc: "על ידי אישור, אתה מאשר את פריסת התשתית האלגוריתמית הקשורה לתוכנית {{plan}}.", proceedPayment: "המשך לתשלום מאובטח", secureGateway: "שער מאובטח", back: "חזור", riskDisclosure: "גילוי סיכונים: מסחר אלגוריתמי כרוך בסיכון משמעותי להפסד.", secureTransaction: "עסקה מאובטחת", paypalNote: "פרטי התשלום שלך מעובדים בצורה מאובטחת על ידי PayPal.", encryptionNote: "מוצفن לפי תקני AES-256 מוסדיים"
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
});

export default i18n;