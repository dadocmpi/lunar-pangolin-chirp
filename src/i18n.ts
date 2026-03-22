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
      nav: { pricing: "INVESTMENT PLANS", howItWorks: "THE INFRASTRUCTURE", about: "ABOUT US", contact: "INSTITUTIONAL SUPPORT", login: "TERMINAL ACCESS", openAccount: "CREATE ACCOUNT", dashboard: "DASHBOARD", logout: "SIGN OUT", results: "RESULTS", faq: "FAQ" },
      footer: { desc: "Institutional-grade investment infrastructure. Proprietary technology for the modern market.", platform: "Platform", company: "Company", support: "Digital Support", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", disclaimer: "Financial Disclaimer" },
      auth: { loginTitle: "Login", loginSubtitle: "Enter your access credentials.", registerTitle: "Create Account", registerSubtitle: "Start your journey in the institutional market.", email: "Email Address", password: "Password", fullName: "Full Name", forgotPassword: "Forgot password?", noAccount: "Don't have an account?", hasAccount: "Already have access?", btnAccess: "ACCESS ACCOUNT", btnCreate: "CREATE MY ACCOUNT", termsAgree: "I agree to the Terms and Privacy.", futureTitle: "The Future of", futureSubtitle: "Investment", features: ["Institutional-grade algorithms", "Advanced capital protection", "Millisecond execution", "Total transparency"] },
      hero: { title1: "ELITE ALGORITHMIC", title2: "COPY TRADING.", desc: "Automate your wealth with institutional-grade quantitative strategies. Experience millisecond execution precision and advanced risk mitigation protocols.", getStarted: "START NOW", viewStrategies: "VIEW RESULTS" },
      results: { badge: "PERFORMANCE", title: "LIVE SYSTEM", subtitle: "METRICS", winrate: "Win Rate", growth: "Monthly Growth", trades: "Total Trades", profit: "Total Profit" },
      process_home: { badge: "HOW IT WORKS", title: "3 STEPS TO", subtitle: "AUTOMATION", step1: { title: "CONNECT", desc: "Securely link your account to our terminal." }, step2: { title: "ACTIVATE", desc: "Select your strategy and risk level." }, step3: { title: "AUTOMATE", desc: "Sit back while our algorithms execute trades." } },
      faq: { badge: "FAQ", title: "FREQUENTLY ASKED", subtitle: "QUESTIONS", q1: "Do I need prior experience?", a1: "No. Our system is fully automated and designed for beginners.", q2: "What are the risks?", a2: "Trading involves risk. We use advanced mitigation, but capital is never 100% guaranteed.", q3: "Can I cancel anytime?", a3: "Yes. There are no lock-in periods for your subscription.", q4: "How do I withdraw?", a4: "Withdrawals are processed instantly via your private dashboard." },
      cta_home: { badge: "OPPORTUNITY", title: "SCALE YOUR", subtitle: "CAPITAL", desc: "Join the elite group of investors utilizing Braxel's proprietary infrastructure.", btn: "START ALLOCATION", trust: "Institutional Grade Security" },
      pricing: { badge: "TRANSPARENCY", title: "CAPITAL", subtitle: "ALLOCATIONS", desc: "Institutional-grade infrastructure with a transparent fee structure.", select: "SECURE THIS PLAN", allocation: "MANAGED CAPITAL", month: "monthly fee" },
      legal: { badgeLegal: "LEGAL", termsTitle: "TERMS OF SERVICE", riskWarning: "Risk Warning: Trading involves significant risk. Past performance does not guarantee future results." }
    }
  },
  pt: {
    translation: {
      nav: { pricing: "PLANOS", howItWorks: "INFRAESTRUTURA", about: "SOBRE NÓS", contact: "SUPORTE", login: "ACESSAR TERMINAL", openAccount: "CRIAR CONTA", dashboard: "PAINEL", logout: "SAIR", results: "RESULTADOS", faq: "FAQ" },
      footer: { desc: "Infraestrutura de investimento de nível institucional. Tecnologia proprietária para o mercado moderno.", platform: "Plataforma", company: "Empresa", support: "Suporte Digital", rights: "Todos os direitos reservados.", privacy: "Privacidade", terms: "Termos", disclaimer: "Aviso Legal" },
      auth: { loginTitle: "Login", loginSubtitle: "Insira suas credenciais de acesso.", registerTitle: "Criar Conta", registerSubtitle: "Comece sua jornada no mercado institucional.", email: "Endereço de E-mail", password: "Senha", fullName: "Nome Completo", forgotPassword: "Esqueceu a senha?", noAccount: "Não tem uma conta?", hasAccount: "Já possui acesso?", btnAccess: "ACESSAR CONTA", btnCreate: "CRIAR MINHA CONTA", termsAgree: "Eu concordo com os Termos e Privacidade.", futureTitle: "O Futuro do", futureSubtitle: "Investimento", features: ["Algoritmos institucionais", "Proteção de capital avançada", "Execução em milissegundos", "Transparência total"] },
      hero: { title1: "COPY TRADING", title2: "ALGORÍTMICO DE ELITE.", desc: "Automatize seu patrimônio com estratégias quantitativas de nível institucional. Experimente precisão de milissegundos e protocolos de risco avançados.", getStarted: "COMEÇAR AGORA", viewStrategies: "VER RESULTADOS" },
      results: { badge: "PERFORMANCE", title: "MÉTRICAS DO", subtitle: "SISTEMA", winrate: "Taxa de Acerto", growth: "Crescimento Mensal", trades: "Operações Totais", profit: "Lucro Total" },
      process_home: { badge: "COMO FUNCIONA", title: "3 PASSOS PARA A", subtitle: "AUTOMAÇÃO", step1: { title: "CONECTAR", desc: "Vincule sua conta com segurança ao nosso terminal." }, step2: { title: "ATIVAR", desc: "Selecione sua estratégia e nível de risco." }, step3: { title: "AUTOMATIZAR", desc: "Relaxe enquanto nossos algoritmos executam as ordens." } },
      faq: { badge: "FAQ", title: "PERGUNTAS", subtitle: "FREQUENTES", q1: "Preciso de experiência prévia?", a1: "Não. Nosso sistema é totalmente automatizado e projetado para iniciantes.", q2: "Quais são os riscos?", a2: "O trading envolve riscos. Usamos mitigação avançada, mas o capital nunca é 100% garantido.", q3: "Posso cancelar quando quiser?", a3: "Sim. Não há períodos de carência para sua assinatura.", q4: "Como realizo saques?", a4: "Os saques são processados instantaneamente via seu painel privado." },
      cta_home: { badge: "OPORTUNIDADE", title: "ESCALE SEU", subtitle: "CAPITAL", desc: "Junte-se ao grupo de elite de investidores que utilizam a infraestrutura proprietária da Braxel.", btn: "INICIAR ALOCAÇÃO", trust: "Segurança de Nível Institucional" },
      pricing: { badge: "TRANSPARÊNCIA", title: "ALOCAÇÕES DE", subtitle: "CAPITAL", desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.", select: "GARANTIR ESTE PLANO", allocation: "CAPITAL GERENCIADO", month: "taxa mensal" },
      legal: { badgeLegal: "LEGAL", termsTitle: "TERMOS DE SERVIÇO", riskWarning: "Aviso de Risco: O trading envolve risco significativo. Resultados passados não garantem lucros futuros." }
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