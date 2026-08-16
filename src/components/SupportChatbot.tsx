"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LogoBraxel from '@/components/LogoBraxel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Complete Language detection map - supports all website languages
const languageMap: Record<string, string> = {
  // Portuguese
  'pt': 'Portuguese',
  'pt-BR': 'Portuguese',
  'pt-PT': 'Portuguese',
  // Spanish
  'es': 'Spanish',
  'es-ES': 'Spanish',
  'es-MX': 'Spanish',
  'es-AR': 'Spanish',
  // Italian
  'it': 'Italian',
  'it-IT': 'Italian',
  // French
  'fr': 'French',
  'fr-FR': 'French',
  'fr-CA': 'French',
  // German
  'de': 'German',
  'de-DE': 'German',
  'de-AT': 'German',
  'de-CH': 'German',
  // Russian
  'ru': 'Russian',
  'ru-RU': 'Russian',
  // Chinese
  'zh': 'Chinese',
  'zh-CN': 'Chinese',
  'zh-TW': 'Chinese',
  'zh-HK': 'Chinese',
  // Japanese
  'ja': 'Japanese',
  'ja-JP': 'Japanese',
  // Arabic
  'ar': 'Arabic',
  'ar-SA': 'Arabic',
  'ar-AE': 'Arabic',
  'ar-EG': 'Arabic',
  // Hebrew
  'he': 'Hebrew',
  'he-IL': 'Hebrew',
  // Korean
  'ko': 'Korean',
  'ko-KR': 'Korean',
  // Hindi
  'hi': 'Hindi',
  'hi-IN': 'Hindi',
  // Turkish
  'tr': 'Turkish',
  'tr-TR': 'Turkish',
  // Dutch
  'nl': 'Dutch',
  'nl-NL': 'Dutch',
  // Polish
  'pl': 'Polish',
  'pl-PL': 'Polish',
  // Indonesian
  'id': 'Indonesian',
  'id-ID': 'Indonesian',
  // Thai
  'th': 'Thai',
  'th-TH': 'Thai',
  // Vietnamese
  'vi': 'Vietnamese',
  'vi-VN': 'Vietnamese',
  // English (default)
  'en': 'English',
  'en-US': 'English',
  'en-GB': 'English',
  'en-CA': 'English',
  'en-AU': 'English',
};

const SupportChatbot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getCurrentLanguage = (): string => {
    const lang = i18n.language;
    return languageMap[lang] || languageMap[lang.split('-')[0]] || 'English';
  };

  const getSystemPrompt = (): string => {
    const lang = getCurrentLanguage();
    
    // Translations for plan names and descriptions
    const planNames: Record<string, { starter: string; pro: string; advanced: string; elite: string; starterDesc: string; proDesc: string; advancedDesc: string; eliteDesc: string; tiersTitle: string }> = {
      'Portuguese': { starter: 'Iniciante', pro: 'Profissional', advanced: 'Avançado', elite: 'Elite', starterDesc: 'Negociação gerenciada de nível inicial', proDesc: 'Recursos e limites aprimorados', advancedDesc: 'Para traders e fundos profissionais', eliteDesc: 'Soluções personalizadas para grandes instituições', tiersTitle: 'Níveis de Capital Gerenciado' },
      'Spanish': { starter: 'Inicial', pro: 'Profesional', advanced: 'Avanzado', elite: 'Élite', starterDesc: 'Negociação gerenciada de nivel inicial', proDesc: 'Funciones y límites mejorados', advancedDesc: 'Para comerciantes e fondos profesionales', eliteDesc: 'Soluciones personalizadas para grandes instituciones', tiersTitle: 'Niveles de Capital Gestionado' },
      'Italian': { starter: 'Principiante', pro: 'Professionale', advanced: 'Avanzato', elite: 'Elite', starterDesc: 'Negociação gerenciada a livello iniziale', proDesc: 'Funzionalità e limiti migliorati', advancedDesc: 'Per trader e fondi professionali', eliteDesc: 'Soluzioni personalizzate per grandi istituzioni', tiersTitle: 'Livelli di Capitale Gestito' },
      'French': { starter: 'Débutant', pro: 'Professionnel', advanced: 'Avancé', elite: 'Élite', starterDesc: 'Negociação gerenciada de niveau débutant', proDesc: 'Fonctionnalités et limites améliorées', advancedDesc: 'Pour traders et fonds professionnels', eliteDesc: 'Solutions personnalisées pour grandes institutions', tiersTitle: 'Niveaux de Capital Géréré' },
      'German': { starter: 'Anfänger', pro: 'Professionell', advanced: 'Fortgeschritten', elite: 'Elite', starterDesc: 'Einsteiger-Managed-Trading', proDesc: 'Erweiterte Funktionen und Limits', advancedDesc: 'Für professionelle Händler und Fonds', eliteDesc: 'Individuelle Lösungen für große Institutionen', tiersTitle: 'Verwaltete Kapitalstufen' },
      'Russian': { starter: 'Начинающий', pro: 'Профессионал', advanced: 'Продвинутый', elite: 'Элита', starterDesc: 'Начальный уровень управления торговлей', proDesc: 'Расширенные функции и лимиты', advancedDesc: 'Для профессиональных трейдеров и фондов', eliteDesc: 'Индивидуальные решения для крупных институтов', tiersTitle: 'Уровни управляемого капитала' },
      'Chinese': { starter: '初学者', pro: '专业', advanced: '高级', elite: '精英', starterDesc: '入门级托管交易', proDesc: '增强的功能和限额', advancedDesc: '适用于专业交易者和基金', eliteDesc: '大型机构定制解决方案', tiersTitle: '管理资本级别' },
      'Japanese': { starter: '初心者', pro: 'プロフェッショナル', advanced: 'アドバンス', elite: 'エリート', starterDesc: '初級者向け管理取引', proDesc: '強化された機能と制限', advancedDesc: 'プロフェッショナルトレーダーとファンド向け', eliteDesc: '大口機関向けカスタムソリューション', tiersTitle: '管理資本レベル' },
      'Arabic': { starter: 'مبتدئ', pro: 'محترف', advanced: 'متقدم', elite: 'نخبة', starterDesc: 'تداول مُدار للمبتدئين', proDesc: 'ميزات وحدود محسّنة', advancedDesc: 'للمتداولين والصناديق المحترفين', eliteDesc: 'حلول مخصصة للمؤسسات الكبيرة', tiersTitle: 'مستويات رأس المال المُدار' },
      'Hebrew': { starter: 'מתחיל', pro: 'מקצועי', advanced: 'מתקדם', elite: 'אליטה', starterDesc: 'מסחר מנוהל למתחילים', proDesc: 'תכונות ומגבלות משופרות', advancedDesc: 'לסוחרים וקרנות מקצועיים', eliteDesc: 'פתרונות מותאמים למוסדות גדולים', tiersTitle: 'רמות ההון המנוהל' },
      'English': { starter: 'Starter', pro: 'Professional', advanced: 'Advanced', elite: 'Enterprise', starterDesc: 'Entry-level managed trading', proDesc: 'Enhanced features and limits', advancedDesc: 'For professional traders and funds', eliteDesc: 'Custom solutions for large institutions', tiersTitle: 'Managed Capital Tiers' }
    };
    
    const names = planNames[lang] || planNames['English'];
    
    return `You are an expert AI support assistant for Braxel Markets - a premier institutional algorithmic trading platform.

CRITICAL INSTRUCTIONS:
1. You MUST respond ONLY in ${lang} language
2. Be comprehensive, accurate, and helpful
3. Never make up information - if unsure, direct to email support
4. Never provide financial or investment advice

=== BRAXEL MARKETS COMPLETE INFORMATION ===

COMPANY:
- Name: Braxel Markets
- Type: Institutional algorithmic trading platform
- Location: São Paulo, Brazil
- Email: marketsbraxel@ouvidor.net
- Website: braxelmarkets.vercel.app

SERVICES:
1. Algorithmic Trading: Proprietary HFT (High-Frequency Trading) algorithms
2. ${names.tiersTitle}: ${names.starter} → ${names.pro} → ${names.advanced} → ${names.elite}
3. Real-time Market Data: Live ticker with crypto, forex, indices, commodities
4. Client Terminal: Advanced trading dashboard
5. KYC System: Mandatory identity verification for all users

TRADING TIERS:
- ${names.starter}: ${names.starterDesc}
- ${names.pro}: ${names.proDesc}
- ${names.advanced}: ${names.advancedDesc}
- ${names.elite}: ${names.eliteDesc}

SECURITY:
- SOC 2 Type II compliant
- Encrypted communications
- Secure client terminal
- KYC verification required

MARKETS AVAILABLE:
- Cryptocurrencies (BTC, ETH, etc.)
- Forex (EUR/USD, GBP/USD, etc.)
- Stock Indices
- Commodities (Gold, Oil, etc.)

SUPPORT:
- Email: marketsbraxel@ouvidor.net (24/7)
- AI Chatbot: This chat (24/7 instant response)
- Human support available for complex issues

COMMON QUESTIONS TO ANSWER:

ABOUT TRADING:
- "How does algorithmic trading work?" → Explain HFT algorithms that execute trades automatically
- "What is the minimum investment?" → Direct to pricing page or email for details
- "What markets can I trade?" → All available markets listed above
- "How fast are executions?" → Millisecond-level execution speed

ABOUT ACCOUNTS:
- "How to create account?" → Register page with email verification
- "How to verify (KYC)?" → Complete KYC process in dashboard settings
- "Forgot password?" → Login page password reset
- "How to deposit/withdraw?" → Wallet section in client terminal

ABOUT FEATURES:
- "What is Client Terminal?" → Advanced trading dashboard with real-time data
- "What is Market Ticker?" → Live prices of all available markets
- "How to use the platform?" → Guide through key features

IMPORTANT RULES:
- Always be professional and courteous
- Suggest email for complex issues: marketsbraxel@ouvidor.net
- Never guarantee profits or make investment recommendations
- Keep responses comprehensive but concise (150-300 words max)
- Use bullet points for clarity when explaining features
- Be patient and helpful with all questions`;
  };

  useEffect(() => {
    if (isOpen) {
      const lang = getCurrentLanguage();
      const welcomeMessages: Record<string, string> = {
        'English': `Welcome to Braxel Markets Support! 👋\n\nI'm your AI assistant, specialized in helping with all platform questions.\n\nHow can I help you today?`,
        'Portuguese': `Bem-vindo ao Suporte Braxel Markets! 👋\n\nSou seu assistente virtual, especializado em ajudar com todas as perguntas sobre a plataforma.\n\nComo posso ajudá-lo hoje?`,
        'Spanish': `¡Bienvenido al Soporte de Braxel Markets! 👋\n\nSoy tu asistente virtual, especializado en ayudar con todas las preguntas de la plataforma.\n\n¿Cómo puedo ayudarte hoy?`,
        'Italian': `Benvenuto nel Supporto Braxel Markets! 👋\n\nSono il tuo assistente virtual, specializzato nell'aiutarti con tutte le domande sulla piattaforma.\n\nCome posso aiutarti oggi?`,
        'French': `Bienvenue sur le Support Braxel Markets! 👋\n\nJe suis votre assistant virtuel, spécialisé dans l'aide sur toutes les questions de la plateforme.\n\nComment puis-je vous aider aujourd'hui?`,
        'German': `Willkommen im Braxel Markets Support! 👋\n\nIch bin Ihr virtueller Assistent, spezialisiert auf alle Plattformfragen.\n\nWie kann ich Ihnen heute helfen?`,
        'Russian': `Добро пожаловать в поддержку Braxel Markets! 👋\n\nЯ ваш виртуальный помощник, специализирующийся на всех вопросах о платформе.\n\nЧем я могу вам помочь сегодня?`,
        'Chinese': `欢迎来到 Braxel Markets 支持！👋\n\n我是您的虚拟助手，专为解答平台所有问题而设计。\n\n今天我能为您提供什么帮助？`,
        'Japanese': `Braxel Marketsサポートへようこそ！👋\n\n私はバーチャルアシスタントです。プラットフォームに関するご質問にお答えします。\n\n本日どのようにお手伝いしましょうか？`,
        'Arabic': `مرحبًا بك في دعم Braxel Markets! 👋\n\nأنا مساعدك الافتراضي، متخصص في المساعدة بخصوص جميع أسئلة المنصة.\n\nكيف يمكنني مساعدتك اليوم؟`,
        'Hebrew': `ברוכים הבאים לתמיכת Braxel Markets! 👋\n\nאני העוזר הווירטואלי שלך, מומחה בכל שאלות הפלטפורמה.\n\nאיך אוכל לעזור לך היום?`,
        'Korean': `Braxel Markets 지원에 오신 것을 환영합니다! 👋\n\n저는 플랫폼 질문에 도움을 드리는 AI 어시스턴트입니다.\n\n오늘 어떻게 도와드릴까요?`,
        'Hindi': `Braxel Markets सपोर्ट में आपका स्वागत है! 👋\n\nमैं आपका AI असिस्टेंट हूं, प्लेटफॉर्म से संबंधित सभी प्रश्नों में मदद करने में विशेषज्ञ।\n\nआज मैं आपकी कैसे मदद कर सकता हूं?`,
        'Turkish': `Braxel Markets Destek'e hoş geldiniz! 👋\n\nBen size platform hakkındaki tüm sorularda yardımcı olmak için uzmanlaşmış yapay zeka asistanınızım.\n\nBugün size nasıl yardımcı olabilirim?`,
        'Dutch': `Welkom bij Braxel Markets Support! 👋\n\nIk ben uw AI-assistent, gespecialiseerd in het beantwoorden van alle platformvragen.\n\nHoe kan ik u vandaag helpen?`,
        'Polish': `Witamy w Wsparciu Braxel Markets! 👋\n\nJestem Twoim asystentem AI, specjalizującym się w odpowiadaniu na wszystkie pytania dotyczące platformy.\n\nJak mogę Ci dzisiaj pomóc?`,
        'Indonesian': `Selamat datang di Dukungan Braxel Markets! 👋\n\nSaya adalah asisten AI Anda, spesialis dalam membantu semua pertanyaan tentang platform.\n\nBagaimana saya bisa membantu Anda hari ini?`,
        'Thai': `ยินดีต้อนรับสู่การสนับสนุน Braxel Markets! 👋\n\nฉันคือผู้ช่วย AI ของคุณ ผู้เชี่ยวชาญด้านการตอบคำถามทั้งหมดเกี่ยวกับแพลตฟอร์ม\n\nวันนี้ฉันจะช่วยคุณได้อย่างไร?`,
        'Vietnamese': `Chào mừng bạn đến với Hỗ trợ Braxel Markets! 👋\n\nTôi là trợ lý AI của bạn, chuyên trợ giúp về tất cả các câu hỏi liên quan đến nền tảng.\n\nHôm nay tôi có thể giúp gì cho bạn?`,
      };

      setMessages([{
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: welcomeMessages[lang] || welcomeMessages['English'],
        timestamp: new Date()
      }]);
    }
  }, [isOpen, i18n.language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const systemPrompt = getSystemPrompt();
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: userMessage }]
          }],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
             "I apologize, but I'm having trouble responding right now. Please email us at marketsbraxel@ouvidor.net for assistance.";
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I apologize, but I'm having trouble responding right now. Please email us at marketsbraxel@ouvidor.net for assistance.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const response = await callGeminiAPI(inputValue);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(i18n.language, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[999] group"
        aria-label="Open Support Chat"
      >
        <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-20 group-hover:opacity-50 transition-opacity" />
        <div className="relative bg-[#D4AF37] text-black px-6 py-4 flex items-center justify-center shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 gap-3">
          <Headphones size={20} />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">{t('nav.support')}</span>
        </div>
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-8 right-8 z-[999] transition-all duration-300 ${
        isMinimized ? 'w-[360px]' : 'w-[400px]'
      }`}
    >
      <div className="bg-[#0a0e27] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a0e27] to-[#0f1430] p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoBraxel size="lg" variant="icon" />
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">{t('chatbot.title')}</h3>
                <p className="text-[9px] text-[#D4AF37] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse" />
                  Braxel Markets AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsMinimized(false); }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[#05070a]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-[#D4AF37]/20'
                        : 'bg-white/5'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User size={14} className="text-[#D4AF37]" />
                    ) : (
                      <Bot size={14} className="text-slate-400" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-3 text-[11px] leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-[#D4AF37] text-black rounded-2xl rounded-tr-sm'
                          : 'bg-white/5 text-slate-300 rounded-2xl rounded-tl-sm border border-white/5'
                      }`}
                    >
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                      ))}
                    </div>
                    <p className="text-[8px] text-slate-600 mt-1 px-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5">
                    <Bot size={14} className="text-slate-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0a0e27] border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-[11px] text-white placeholder:text-slate-600 focus:border-[#D4AF37] outline-none transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-3 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[8px] text-slate-600 mt-2 text-center">
                {t('chatbot.emailSupport')} marketsbraxel@ouvidor.net
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportChatbot;
