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
      hero: { title1: "ELITE ALGORITHMISCHES", title2: "KAPITALMANAGEMENT.", desc: "Nutzen Sie institutionelle quantitative Strategien für den modernen Markt. Erleben Sie Millisekunden-Präzision und fortschrittliche Risikominderung.", getStarted: "INVESTITIONSPLÄNE ERKUNDEN", viewStrategies: "TECHNISCHE METHODIK" },
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