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
      nav: { pricing: "INVESTMENT PLANS", howItWorks: "THE INFRASTRUCTURE", about: "OUR LEGACY", contact: "INSTITUTIONAL SUPPORT", login: "TERMINAL ACCESS", openAccount: "JOIN BRAXEL", dashboard: "DASHBOARD", logout: "SIGN OUT" },
      footer: { desc: "Institutional-grade investment infrastructure. Proprietary technology for the modern market.", platform: "Platform", company: "Company", support: "Digital Support", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", disclaimer: "Financial Disclaimer" },
      auth: { loginTitle: "Login", loginSubtitle: "Enter your access credentials.", registerTitle: "Create Account", registerSubtitle: "Start your journey in the institutional market.", email: "Email Address", password: "Password", fullName: "Full Name", forgotPassword: "Forgot password?", noAccount: "Don't have an account?", hasAccount: "Already have access?", btnAccess: "ACCESS ACCOUNT", btnCreate: "CREATE MY ACCOUNT", termsAgree: "I agree to the Terms and Privacy.", futureTitle: "The Future of", futureSubtitle: "Investment", features: ["Institutional-grade algorithms", "Advanced capital protection", "Millisecond execution", "Total transparency"] },
      hero: { title1: "ELITE ALGORITHMIC", title2: "CAPITAL MANAGEMENT.", desc: "Deploy institutional-grade quantitative strategies engineered for the modern market. Experience millisecond execution precision and advanced risk mitigation protocols.", getStarted: "EXPLORE INVESTMENT PLANS", viewStrategies: "TECHNICAL METHODOLOGY" },
      stats: { volume: "Total Managed Volume", traders: "Global Active Investors", uptime: "Infrastructure Uptime", latency: "Execution Precision" },
      pricing: { badge: "TRANSPARENCY", title: "CAPITAL", subtitle: "ALLOCATIONS", desc: "Institutional-grade infrastructure with a transparent fee structure.", select: "SECURE THIS PLAN", allocation: "MANAGED CAPITAL", month: "monthly fee" },
      dashboard: { portfolio: "Portfolio", activeServices: "Active Services", newAllocation: "New Allocation", noServices: "No active investment plans found.", balance: "Current Balance", withdraw: "Withdrawal", liquidity: "Liquidity", requestWithdraw: "Request Withdrawal", selectAccount: "Select Account", amount: "Amount (USD)", iban: "IBAN / Bank Details", btnWithdraw: "SUBMIT WITHDRAWAL REQUEST", profile: "Profile Management", settings: "Settings", firstName: "First Name", lastName: "Last Name", saveChanges: "SAVE CHANGES" }
    }
  },
  pt: {
    translation: {
      nav: { pricing: "PLANOS DE INVESTIMENTO", howItWorks: "INFRAESTRUTURA", about: "NOSSO LEGADO", contact: "SUPORTE INSTITUCIONAL", login: "ACESSO AO TERMINAL", openAccount: "JUNTAR-SE À BRAXEL", dashboard: "PAINEL", logout: "SAIR" },
      footer: { desc: "Infraestrutura de investimento de nível institucional. Tecnologia proprietária para o mercado moderno.", platform: "Plataforma", company: "Empresa", support: "Suporte Digital", rights: "Todos os direitos reservados.", privacy: "Privacidade", terms: "Termos", disclaimer: "Aviso Legal" },
      auth: { loginTitle: "Login", loginSubtitle: "Insira suas credenciais de acesso.", registerTitle: "Criar Conta", registerSubtitle: "Comece sua jornada no mercado institucional.", email: "Endereço de E-mail", password: "Senha", fullName: "Nome Completo", forgotPassword: "Esqueceu a senha?", noAccount: "Não tem uma conta?", hasAccount: "Já possui acesso?", btnAccess: "ACESSAR CONTA", btnCreate: "CRIAR MINHA CONTA", termsAgree: "Eu concordo com os Termos e Privacidade.", futureTitle: "O Futuro do", futureSubtitle: "Investimento", features: ["Algoritmos institucionais", "Proteção de capital avançada", "Execução em milissegundos", "Transparência total"] },
      hero: { title1: "GESTÃO DE CAPITAL", title2: "ALGORÍTMICA DE ELITE.", desc: "Implemente estratégias quantitativas de nível institucional projetadas para o mercado moderno. Experimente precisão de execução em milissegundos.", getStarted: "EXPLORAR PLANOS DE INVESTIMENTO", viewStrategies: "METODOLOGIA TÉCNICA" },
      stats: { volume: "Volume Total Gerenciado", traders: "Investidores Ativos", uptime: "Uptime da Infraestrutura", latency: "Precisão de Execução" },
      pricing: { badge: "TRANSPARENCIA", title: "ALOCAÇÕES DE", subtitle: "CAPITAL", desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.", select: "GARANTIR ESTE PLANO", allocation: "CAPITAL GERENCIADO", month: "taxa mensal" },
      dashboard: { portfolio: "Portfólio", activeServices: "Serviços Ativos", newAllocation: "Nova Alocação", noServices: "Nenhum plano de investimento ativo encontrado.", balance: "Saldo Atual", withdraw: "Saque", liquidity: "Liquidez", requestWithdraw: "Solicitar Saque", selectAccount: "Selecionar Conta", amount: "Valor (USD)", iban: "IBAN / Dados Bancários", btnWithdraw: "ENVIAR SOLICITAÇÃO DE SAQUE", profile: "Gestão de Perfil", settings: "Configurações", firstName: "Nome", lastName: "Sobrenome", saveChanges: "SALVAR ALTERAÇÕES" }
    }
  },
  it: {
    translation: {
      nav: { pricing: "PIANI DI INVESTIMENTO", howItWorks: "INFRASTRUTTURA", about: "LA NOSTRA EREDITÀ", contact: "SUPPORTO ISTITUZIONALE", login: "ACCESSO TERMINALE", openAccount: "UNISCITI A BRAXEL", dashboard: "DASHBOARD", logout: "DISCONNETTI" },
      footer: { desc: "Infrastruttura di investimento di livello istituzionale. Tecnologia proprietaria per il mercato moderno.", platform: "Piattaforma", company: "Azienda", support: "Supporto Digitale", rights: "Tutti i diritti riservati.", privacy: "Privacy", terms: "Termini", disclaimer: "Dichiarazione di non responsabilità" },
      auth: { loginTitle: "Accesso", loginSubtitle: "Inserisci le tue credenziali di accesso.", registerTitle: "Crea Account", registerSubtitle: "Inizia il tuo viaggio nel mercato istituzionale.", email: "Indirizzo Email", password: "Password", fullName: "Nome Completo", forgotPassword: "Password dimenticata?", noAccount: "Non hai un account?", hasAccount: "Hai già l'accesso?", btnAccess: "ACCEDI ALL'ACCOUNT", btnCreate: "CREA IL MIO ACCOUNT", termsAgree: "Accetto i Termini e la Privacy.", futureTitle: "Il Futuro dell'", futureSubtitle: "Investimento", features: ["Algoritmi istituzionali", "Protezione avanzata del capitale", "Esecuzione in millisecondi", "Trasparenza totale"] },
      hero: { title1: "GESTIONE CAPITALE", title2: "ALGORITMICA D'ELITE.", desc: "Implementa strategie quantitative di livello istituzionale progettate per il mercato moderno. Sperimenta la precisione di esecuzione in millisecondi.", getStarted: "ESPLORA I PIANI DI INVESTIMENTO", viewStrategies: "METODOLOGIA TECNICA" },
      stats: { volume: "Volume Totale Gestito", traders: "Investitori Attivi", uptime: "Uptime Infrastruttura", latency: "Precisione Esecuzione" },
      pricing: { badge: "TRASPARENZA", title: "ALLOCAZIONI DI", subtitle: "CAPITALE", desc: "Infrastruttura istituzionale con una struttura commissionale trasparente.", select: "ASSICURA QUESTO PIANO", allocation: "CAPITALE GESTITO", month: "canone mensile" },
      dashboard: { portfolio: "Portafoglio", activeServices: "Servizi Attivi", newAllocation: "Nuova Allocazione", noServices: "Nessun piano di investimento attivo trovato.", balance: "Saldo Attuale", withdraw: "Prelievo", liquidity: "Liquidità", requestWithdraw: "Richiedi Prelievo", selectAccount: "Seleziona Account", amount: "Importo (USD)", iban: "IBAN / Dati Bancari", btnWithdraw: "INVIA RICHIESTA DI PRELIEVO", profile: "Gestione Profilo", settings: "Impostazioni", firstName: "Nome", lastName: "Cognome", saveChanges: "SALVA MODIFICHE" }
    }
  },
  de: {
    translation: {
      nav: { pricing: "INVESTITIONSPLÄNE", howItWorks: "INFRASTRUKTUR", about: "UNSER ERBE", contact: "INSTITUTIONELLER SUPPORT", login: "TERMINAL-ZUGANG", openAccount: "BRAXEL BEITRETEN", dashboard: "DASHBOARD", logout: "ABMELDEN" },
      footer: { desc: "Institutionelle Investment-Infrastruktur. Proprietäre Technologie für den modernen Markt.", platform: "Plattform", company: "Unternehmen", support: "Digitaler Support", rights: "Alle Rechte vorbehalten.", privacy: "Datenschutz", terms: "Bedingungen", disclaimer: "Haftungsausschluss" },
      auth: { loginTitle: "Anmelden", loginSubtitle: "Geben Sie Ihre Zugangsdaten ein.", registerTitle: "Konto erstellen", registerSubtitle: "Beginnen Sie Ihre Reise am institutionellen Markt.", email: "E-Mail-Adresse", password: "Passwort", fullName: "Vollständiger Name", forgotPassword: "Passwort vergessen?", noAccount: "Kein Konto?", hasAccount: "Bereits Zugang?", btnAccess: "ZUGANG ZUM KONTO", btnCreate: "MEIN KONTO ERSTELLEN", termsAgree: "Ich stimme den Bedingungen und dem Datenschutz zu.", futureTitle: "Die Zukunft der", futureSubtitle: "Investition", features: ["Institutionelle Algorithmen", "Erweiterter Kapitalschutz", "Millisekunden-Ausführung", "Volle Transparenz"] },
      hero: { title1: "ELITE ALGORITHMISCHES", title2: "KAPITALMANAGEMENT.", desc: "Nutzen Sie institutionelle quantitative Strategien für den modernen Markt. Erleben Sie Millisekunden-Präzision und fortsrittliche Risikominderung.", getStarted: "INVESTITIONSPLÄNE ERKUNDEN", viewStrategies: "TECHNISCHE METHODIK" },
      stats: { volume: "Verwaltetes Gesamtvolumen", traders: "Aktive Investoren", uptime: "Infrastruktur-Uptime", latency: "Ausführungspräzision" },
      pricing: { badge: "TRANSPARENZ", title: "KAPITAL", subtitle: "ALLOKATIONEN", desc: "Institutionelle Infrastruktur mit transparenter Gebührenstruktur.", select: "DIESEN PLAN SICHERN", allocation: "VERWALTETES KAPITAL", month: "monatliche Gebühr" },
      dashboard: { portfolio: "Portfolio", activeServices: "Aktive Dienste", newAllocation: "Neue Allokation", noServices: "Keine aktiven Investitionspläne gefunden.", balance: "Aktueller Kontostand", withdraw: "Auszahlung", liquidity: "Liquidität", requestWithdraw: "Auszahlung anfordern", selectAccount: "Konto auswählen", amount: "Betrag (USD)", iban: "IBAN / Bankdaten", btnWithdraw: "AUSZAHLUNGSANTRAG SENDEN", profile: "Profilverwaltung", settings: "Einstellungen", firstName: "Vorname", lastName: "Nachname", saveChanges: "ÄNDERUNGEN SPEICHERN" }
    }
  },
  es: {
    translation: {
      nav: { pricing: "PLANES DE INVERSIÓN", howItWorks: "INFRAESTRUCTURA", about: "NUESTRO LEGADO", contact: "SOPORTE INSTITUCIONAL", login: "ACCESO AL TERMINAL", openAccount: "UNIRSE A BRAXEL", dashboard: "PANEL", logout: "CERRAR SESIÓN" },
      footer: { desc: "Infraestructura de inversión de nivel institucional. Tecnología propia para el mercado moderno.", platform: "Plataforma", company: "Empresa", support: "Soporte Digital", rights: "Todos los derechos reservados.", privacy: "Privacidad", terms: "Términos", disclaimer: "Aviso Legal" },
      auth: { loginTitle: "Iniciar Sesión", loginSubtitle: "Ingrese sus credenciales de acceso.", registerTitle: "Crear Cuenta", registerSubtitle: "Comience su viaje no mercado institucional.", email: "Correo Electrónico", password: "Contraseña", fullName: "Nombre Completo", forgotPassword: "¿Olvidó su contraseña?", noAccount: "¿No tiene una cuenta?", hasAccount: "¿Ya tiene acceso?", btnAccess: "ACCEDER A LA CUENTA", btnCreate: "CREAR MI CUENTA", termsAgree: "Acepto los Términos e la Privacidad.", futureTitle: "El Futuro de la", futureSubtitle: "Inversión", features: ["Algoritmos institucionales", "Protección de capital avanzada", "Ejecución en milisegundos", "Transparencia total"] },
      hero: { title1: "GESTIÓN DE CAPITAL", title2: "ALGORÍTMICA DE ÉLITE.", desc: "Implemente estrategias cuantitativas de nivel institucional diseñadas para el mercado moderno. Experimente precisión de ejecución en milisegundos.", getStarted: "EXPLORAR PLANES DE INVERSIÓN", viewStrategies: "METODOLOGÍA TÉCNICA" },
      stats: { volume: "Volumen Total Gestionado", traders: "Inversores Activos", uptime: "Uptime de Infraestructura", latency: "Precisión de Ejecución" },
      pricing: { badge: "TRANSPARENCIA", title: "ASIGNACIONES DE", subtitle: "CAPITAL", desc: "Infraestructura institucional con una estructura de tarifas transparente.", select: "ASEGURAR ESTE PLAN", allocation: "CAPITAL GESTIONADO", month: "tarifa mensual" },
      dashboard: { portfolio: "Portafolio", activeServices: "Servicios Activos", newAllocation: "Nueva Asignación", noServices: "No se encontraron planes de inversión activos.", balance: "Saldo Actual", withdraw: "Retiro", liquidity: "Liquidez", requestWithdraw: "Solicitar Retiro", selectAccount: "Seleccionar Cuenta", amount: "Monto (USD)", iban: "IBAN / Datos Bancarios", btnWithdraw: "ENVIAR SOLICITUD DE RETIRO", profile: "Gestión de Perfil", settings: "Configuración", firstName: "Nombre", lastName: "Apellido", saveChanges: "GUARDAR CAMBIOS" }
    }
  },
  fr: {
    translation: {
      nav: { pricing: "PLANS D'INVESTISSEMENT", howItWorks: "L'INFRASTRUCTURE", about: "NOTRE HÉRITAGE", contact: "SUPPORT INSTITUTIONNEL", login: "ACCÈS TERMINAL", openAccount: "REJOINDRE BRAXEL", dashboard: "TABLEAU DE BORD", logout: "DÉCONNEXION" },
      footer: { desc: "Infrastructure d'investissement de classe institutionnelle. Technologie propriétaire pour le marché moderne.", platform: "Plateforme", company: "Entreprise", support: "Support Digital", rights: "Tous droits réservés.", privacy: "Confidentialité", terms: "Conditions", disclaimer: "Avis de non-responsabilité" },
      auth: { loginTitle: "Connexion", loginSubtitle: "Entrez vos identifiants d'accès.", registerTitle: "Créer un compte", registerSubtitle: "Commencez votre voyage sur le marché institutionnel.", email: "Adresse E-mail", password: "Mot de passe", fullName: "Nom complet", forgotPassword: "Mot de passe oublié ?", noAccount: "Pas de compte ?", hasAccount: "Déjà un accès ?", btnAccess: "ACCÉDER AU COMPTE", btnCreate: "CRÉER MON COMPTE", termsAgree: "J'accepte les conditions et la confidentialité.", futureTitle: "L'avenir de", futureSubtitle: "l'investissement", features: ["Algorithmes institutionnels", "Protection avancée du capital", "Exécution en millisecondes", "Transparence totale"] },
      hero: { title1: "GESTION DE CAPITAL", title2: "ALGORITHMIQUE D'ÉLITE.", desc: "Déployez des stratégies quantitatives de classe institutionnelle conçues pour le marché moderne. Découvrez la précision d'exécution en millisecondes.", getStarted: "EXPLORER LES PLANS", viewStrategies: "MÉTHODOLOGIE TECHNIQUE" },
      stats: { volume: "Volume total géré", traders: "Investisseurs actifs", uptime: "Disponibilité infrastructure", latency: "Précision d'exécution" },
      pricing: { badge: "TRANSPARENCE", title: "ALLOCATIONS DE", subtitle: "CAPITAL", desc: "Infrastructure institutionnelle avec une structure de frais transparente.", select: "SÉCURISER CE PLAN", allocation: "CAPITAL GÉRÉ", month: "frais mensuels" },
      dashboard: { portfolio: "Portefeuille", activeServices: "Services actifs", newAllocation: "Nouvelle allocation", noServices: "Aucun plan d'investissement actif trouvé.", balance: "Solde actuel", withdraw: "Retrait", liquidity: "Liquidité", requestWithdraw: "Demander un retrait", selectAccount: "Choisir un compte", amount: "Montant (USD)", iban: "IBAN / Coordonnées bancaires", btnWithdraw: "ENVOYER LA DEMANDE", profile: "Gestion du profil", settings: "Paramètres", firstName: "Prénom", lastName: "Nom", saveChanges: "ENREGISTRER" }
    }
  },
  ru: {
    translation: {
      nav: { pricing: "ИНВЕСТИЦИОННЫЕ ПЛАНЫ", howItWorks: "ИНФРАСТРУКТУРА", about: "НАШЕ НАСЛЕДИЕ", contact: "ИНСТИТУЦИОНАЛЬНАЯ ПОДДЕРЖКА", login: "ДОСТУП К ТЕРМИНАЛУ", openAccount: "ПРИСОЕДИНИТЬСЯ К BRAXEL", dashboard: "ПАНЕЛЬ УПРАВЛЕНИЯ", logout: "ВЫЙТИ" },
      footer: { desc: "Инвестиционная инфраструктура институционального уровня. Собственные технологии для современного рынка.", platform: "Платформа", company: "Компания", support: "Цифровая поддержка", rights: "Все права защищены.", privacy: "Конфиденциальность", terms: "Условия", disclaimer: "Отказ от ответственности" },
      auth: { loginTitle: "Вход", loginSubtitle: "Введите свои учетные данные.", registerTitle: "Создать аккаунт", registerSubtitle: "Начните свой путь на институциональном рынке.", email: "Электронная почта", password: "Пароль", fullName: "Полное имя", forgotPassword: "Забыли пароль?", noAccount: "Нет аккаунта?", hasAccount: "Уже есть доступ?", btnAccess: "ВОЙТИ В АККАУНТ", btnCreate: "СОЗДАТЬ МОЙ АККАУНТ", termsAgree: "Я согласен с Условиями и Конфиденциальностью.", futureTitle: "Будущее", futureSubtitle: "инвестиций", features: ["Алгоритмы институционального уровня", "Продвинутая защита капитала", "Исполнение за миллисекунды", "Полная прозрачность"] },
      hero: { title1: "ЭЛИТНОЕ АЛГОРИТМИЧЕСКОЕ", title2: "УПРАВЛЕНИЕ КАПИТАЛОМ.", desc: "Используйте количественные стратегии институционального уровня, разработанные для современного рынка. Ощутите точность исполнения за миллисекунды.", getStarted: "ИЗУЧИТЬ ИНВЕСТИЦИОННЫЕ ПЛАНЫ", viewStrategies: "ТЕХНИЧЕСКАЯ МЕТОДОЛОГИЯ" },
      stats: { volume: "Общий объем управления", traders: "Активные инвесторы", uptime: "Время работы системы", latency: "Точность исполнения" },
      pricing: { badge: "ПРОЗРАЧНОСТЬ", title: "РАСПРЕДЕЛЕНИЕ", subtitle: "КАПИТАЛА", desc: "Инфраструктура институционального уровня с прозрачной структурой комиссий.", select: "ВЫБРАТЬ ЭТОТ ПЛАН", allocation: "УПРАВЛЯЕМЫЙ КАПИТАЛ", month: "ежемесячный взнос" },
      dashboard: { portfolio: "Портфель", activeServices: "Активные услуги", newAllocation: "Новое распределение", noServices: "Активные инвестиционные планы не найдены.", balance: "Текущий баланс", withdraw: "Вывод средств", liquidity: "Ликвидность", requestWithdraw: "Запросить вывод", selectAccount: "Выбрать счет", amount: "Сумма (USD)", iban: "IBAN / Банковские реквизиты", btnWithdraw: "ОТПРАВИТЬ ЗАПРОС НА ВЫВОД", profile: "Управление профилем", settings: "Настройки", firstName: "Имя", lastName: "Фамилия", saveChanges: "СОХРАНИТЬ ИЗМЕНЕНИЯ" }
    }
  },
  zh: {
    translation: {
      nav: { pricing: "投资计划", howItWorks: "基础设施", about: "我们的传承", contact: "机构支持", login: "终端访问", openAccount: "加入 BRAXEL", dashboard: "仪表板", logout: "登出" },
      footer: { desc: "机构级投资基础设施。现代市场的专有技术。", platform: "平台", company: "公司", support: "数字支持", rights: "版权所有。", privacy: "隐私", terms: "条款", disclaimer: "免责声明" },
      auth: { loginTitle: "登录", loginSubtitle: "输入您的访问凭据。", registerTitle: "创建账户", registerSubtitle: "开始您的机构市场之旅。", email: "电子邮件地址", password: "密码", fullName: "全名", forgotPassword: "忘记密码？", noAccount: "没有账户？", hasAccount: "已有访问权限？", btnAccess: "访问账户", btnCreate: "创建我的账户", termsAgree: "我同意条款和隐私政策。", futureTitle: "投资的", futureSubtitle: "未来", features: ["机构级算法", "先进的资本保护", "毫秒级执行", "完全透明"] },
      hero: { title1: "精英算法", title2: "资本管理。", desc: "部署为现代市场设计的机构级量化策略。体验毫秒级的执行精度和先进的风险缓解协议。", getStarted: "探索投资计划", viewStrategies: "技术方法论" },
      stats: { volume: "总管理量", traders: "全球活跃投资者", uptime: "基础设施运行时间", latency: "执行精度" },
      pricing: { badge: "透明度", title: "资本", subtitle: "分配", desc: "具有透明费用结构的机构级基础设施。", select: "确保此计划", allocation: "管理资本", month: "月费" },
      dashboard: { portfolio: "投资组合", activeServices: "活跃服务", newAllocation: "新分配", noServices: "未发现活跃的投资计划。", balance: "当前余额", withdraw: "提款", liquidity: "流动性", requestWithdraw: "申请提款", selectAccount: "选择账户", amount: "金额 (USD)", iban: "IBAN / 银行详情", btnWithdraw: "提交提款申请", profile: "个人资料管理", settings: "设置", firstName: "名字", lastName: "姓氏", saveChanges: "保存更改" }
    }
  },
  ja: {
    translation: {
      nav: { pricing: "投資プラン", howItWorks: "インフラストラクチャ", about: "私たちの遺産", contact: "機関サポート", login: "ターミナルアクセス", openAccount: "BRAXELに参加", dashboard: "ダッシュボード", logout: "ログアウト" },
      footer: { desc: "機関投資家レベルの投資インフラ。現代市場向けの独自技術。", platform: "プラットフォーム", company: "会社", support: "デジタルサポート", rights: "全著作権所有。", privacy: "プライバシー", terms: "規約", disclaimer: "免責事項" },
      auth: { loginTitle: "ログイン", loginSubtitle: "アクセス資格情報を入力してください。", registerTitle: "アカウント作成", registerSubtitle: "機関投資家市場での旅を始めましょう。", email: "メールアドレス", password: "パスワード", fullName: "氏名", forgotPassword: "パスワードをお忘れですか？", noAccount: "アカウントをお持ちではありませんか？", hasAccount: "すでにアクセス権をお持ちですか？", btnAccess: "アカウントにアクセス", btnCreate: "アカウントを作成する", termsAgree: "規約とプライバシーに同意します。", futureTitle: "投資の", futureSubtitle: "未来", features: ["機関投資家レベルのアルゴリズム", "高度な資本保護", "ミリ秒単位の実行", "完全な透明性"] },
      hero: { title1: "エリート・アルゴリズム", title2: "資本管理。", desc: "現代市場向けに設計された機関投資家レベルの計量戦略を展開します。ミリ秒単位の実行精度と高度なリスク軽減プロトコルを体験してください。", getStarted: "投資プランを探索する", viewStrategies: "技術的方法論" },
      stats: { volume: "総運用資産", traders: "グローバル・アクティブ投資家", uptime: "インフラ稼働率", latency: "実行精度" },
      pricing: { badge: "透明性", title: "資本", subtitle: "配分", desc: "透明な手数料体系を備えた機関投資家レベルのインフラ。", select: "このプランを確保する", allocation: "運用資本", month: "月額料金" },
      dashboard: { portfolio: "ポートフォリオ", activeServices: "アクティブなサービス", newAllocation: "新規配分", noServices: "アクティブな投資プランが見つかりません。", balance: "現在の残高", withdraw: "出金", liquidity: "流動性", requestWithdraw: "出金をリクエストする", selectAccount: "アカウントを選択", amount: "金額 (USD)", iban: "IBAN / 銀行詳細", btnWithdraw: "出金リクエストを送信", profile: "プロフィール管理", settings: "設定", firstName: "名", lastName: "姓", saveChanges: "変更を保存" }
    }
  },
  ar: {
    translation: {
      nav: { pricing: "خطط الاستثمار", howItWorks: "البنية التحتية", about: "إرثنا", contact: "الدعم المؤسسي", login: "الوصول إلى المحطة", openAccount: "انضم إلى BRAXEL", dashboard: "لوحة القيادة", logout: "تسجيل الخروج" },
      footer: { desc: "بنية تحتية استثمارية مؤسسية. تكنولوجيا خاصة للسوق الحديث.", platform: "المنصة", company: "الشركة", support: "الدعم الرقمي", rights: "جميع الحقوق محفوظة.", privacy: "الخصوصية", terms: "الشروط", disclaimer: "إخلاء المسؤولية المالية" },
      auth: { loginTitle: "تسجيل الدخول", loginSubtitle: "أدخل بيانات الاعتماد الخاصة بك.", registerTitle: "إنشاء حساب", registerSubtitle: "ابدأ رحلتك في السوق المؤسسي.", email: "البريد الإلكتروني", password: "كلمة المرور", fullName: "الاسم الكامل", forgotPassword: "هل نسيت كلمة المرور؟", noAccount: "ليس لديك حساب؟", hasAccount: "لديك وصول بالفعل؟", btnAccess: "الوصول إلى الحساب", btnCreate: "إنشاء حسابي", termsAgree: "أوافق على الشروط والخصوصية.", futureTitle: "مستقبل", futureSubtitle: "الاستثمار", features: ["خوارزميات مؤسسية", "حماية متقدمة لرأس المال", "تنفيذ في أجزاء من الثانية", "شفافية كاملة"] },
      hero: { title1: "إدارة رأس المال", title2: "الخوارزمية النخبوية.", desc: "نشر استراتيجيات كمية مؤسسية مصممة للسوق الحديث. جرب دقة التنفيذ في أجزاء من الثانية وبروتوكولات تخفيف المخاطر المتقدمة.", getStarted: "استكشاف خطط الاستثمار", viewStrategies: "المنهجية التقنية" },
      stats: { volume: "إجمالي حجم الإدارة", traders: "المستثمرون النشطون عالمياً", uptime: "وقت تشغيل البنية التحتية", latency: "دقة التنفيذ" },
      pricing: { badge: "الشفافية", title: "تخصيص", subtitle: "رأس المال", desc: "بنية تحتية مؤسسية مع هيكل رسوم شفاف.", select: "تأمين هذه الخطة", allocation: "رأس المال المدار", month: "رسوم شهرية" },
      dashboard: { portfolio: "المحفظة", activeServices: "الخدمات النشطة", newAllocation: "تخصيص جديد", noServices: "لم يتم العثور على خطط استثمار نشطة.", balance: "الرصيد الحالي", withdraw: "سحب الأموال", liquidity: "السيولة", requestWithdraw: "طلب سحب", selectAccount: "اختر الحساب", amount: "المبلغ (USD)", iban: "IBAN / تفاصيل البنك", btnWithdraw: "إرسال طلب السحب", profile: "إدارة الملف الشخصي", settings: "الإعدادات", firstName: "الاسم الأول", lastName: "اسم العائلة", saveChanges: "حفظ التغييرات" }
    }
  },
  he: {
    translation: {
      nav: { pricing: "תוכניות השקעה", howItWorks: "התשתית", about: "המורשת שלנו", contact: "תמיכה מוסדית", login: "גישה למסוף", openAccount: "הצטרף ל-BRAXEL", dashboard: "לוח בקרה", logout: "התנתק" },
      footer: { desc: "תשתית השקעות ברמה מוסדית. טכנולוגיה קניינית לשוק המודרני.", platform: "פלטפורמה", company: "חברה", support: "תמיכה דיגיטלית", rights: "כל הזכויות שמורות.", privacy: "פרטיות", terms: "תנאים", disclaimer: "הצהרת סיכון פיננסי" },
      auth: { loginTitle: "התחברות", loginSubtitle: "הזן את פרטי הגישה שלך.", registerTitle: "יצירת חשבון", registerSubtitle: "התחל את המסע שלך בשוק המוסדי.", email: "כתובת אימייל", password: "סיסמה", fullName: "שם מלא", forgotPassword: "שכחת סיסמה?", noAccount: "אין לך חשבון?", hasAccount: "כבר יש לך גישה?", btnAccess: "גישה לחשבון", btnCreate: "צור את החשבון שלי", termsAgree: "אני מסכים לתנאים ולפרטיות.", futureTitle: "העתיד של", futureSubtitle: "ההשקעות", features: ["אלגוריתמים ברמה מוסדית", "הגנת הון מתקדמת", "ביצוע במילישניות", "שקיפות מלאה"] },
      hero: { title1: "ניהול הון", title2: "אלגוריתמי עילית.", desc: "פרוס אסטרטגיות כמותיות ברמה מוסדית המיועדות לשוק המודרני. חווה דיוק ביצוע במילישניות ופרוטוקולי הפחתת סיכונים מתקדמים.", getStarted: "חקור תוכניות השקעה", viewStrategies: "מתודולוגיה טכנית" },
      stats: { volume: "סך נפח מנוהל", traders: "משקיעים פעילים גלובליים", uptime: "זמן פעילות תשתית", latency: "דיוק ביצוע" },
      pricing: { badge: "שקיפות", title: "הקצאות", subtitle: "הון", desc: "תשתית ברמה מוסדית עם מבנה עמלות שקוף.", select: "אבטח תוכנית זו", allocation: "הון מנוהל", month: "עמלה חודשית" },
      dashboard: { portfolio: "תיק השקעות", activeServices: "שירותים פעילים", newAllocation: "הקצאה חדשה", noServices: "לא נמצאו תוכניות השקעה פעילות.", balance: "יתרה נוכחית", withdraw: "משיכה", liquidity: "נזילות", requestWithdraw: "בקש משיכה", selectAccount: "בחר חשבון", amount: "סכום (USD)", iban: "IBAN / פרטי בנק", btnWithdraw: "שלח בקשת משיכה", profile: "ניהול פרופיל", settings: "הגדרות", firstName: "שם פרטי", lastName: "שם משפחה", saveChanges: "שמור שינויים" }
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