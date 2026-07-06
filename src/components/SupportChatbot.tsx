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

// Language detection map
const languageMap: Record<string, string> = {
  'pt': 'Portuguese',
  'pt-BR': 'Portuguese',
  'es': 'Spanish',
  'es-ES': 'Spanish',
  'it': 'Italian',
  'it-IT': 'Italian',
  'fr': 'French',
  'fr-FR': 'French',
  'de': 'German',
  'de-DE': 'German',
  'ru': 'Russian',
  'ru-RU': 'Russian',
  'zh': 'Chinese',
  'zh-CN': 'Chinese',
  'ja': 'Japanese',
  'ja-JP': 'Japanese',
  'ar': 'Arabic',
  'ar-SA': 'Arabic',
  'he': 'Hebrew',
  'he-IL': 'Hebrew',
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
2. Managed Capital Tiers: Starter → Professional → Institutional → Enterprise
3. Real-time Market Data: Live ticker with crypto, forex, indices, commodities
4. Client Terminal: Advanced trading dashboard
5. KYC System: Mandatory identity verification for all users

TRADING TIERS:
- Starter: Entry-level managed trading
- Professional: Enhanced features and limits
- Institutional: For professional traders and funds
- Enterprise: Custom solutions for large institutions

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
        'English': `Welcome to Braxel Markets Support! 👋\n\nI'm your AI assistant. How can I help you today?`,
        'Portuguese': `Bem-vindo ao Suporte Braxel Markets! 👋\n\nSou seu assistente virtual. Como posso ajudá-lo hoje?`,
        'Spanish': `¡Bienvenido al Soporte de Braxel Markets! 👋\n\nSoy tu asistente virtual. ¿Cómo puedo ayudarte hoy?`,
        'Italian': `Benvenuto nel Supporto Braxel Markets! 👋\n\nSono il tuo assistente virtual. Come posso aiutarti oggi?`,
        'French': `Bienvenue sur le Support Braxel Markets! 👋\n\nJe suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui?`,
        'German': `Willkommen im Braxel Markets Support! 👋\n\nIch bin Ihr virtueller Assistent. Wie kann ich Ihnen heute helfen?`,
        'Russian': `Добро пожаловать в поддержку Braxel Markets! 👋\n\nЯ ваш виртуальный помощник. Чем я могу вам помочь сегодня?`,
        'Chinese': `欢迎来到 Braxel Markets 支持！👋\n\n我是您的虚拟助手。今天我能为您提供什么帮助？`,
        'Japanese': `Braxel Marketsサポートへようこそ！👋\n\n私はバーチャルアシスタントです。本日はどのようなお手伝いができるでしょうか？`,
        'Arabic': `مرحبًا بك في دعم Braxel Markets! 👋\n\nأنا مساعدك الافتراضي. كيف يمكنني مساعدتك اليوم؟`,
        'Hebrew': `ברוכים הבאים לתמיכת Braxel Markets! 👋\n\nאני העוזר הווירטואלי שלך. איך אוכל לעזור לך היום?`,
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
