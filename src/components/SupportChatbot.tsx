"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Minimize2, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LogoBraxel from '@/components/LogoBraxel';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SupportChatbot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simple echo response for demo
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Thank you for your message. Our team will respond shortly.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
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
    <div className={`fixed bottom-8 right-8 z-[999] transition-all duration-300 ${isMinimized ? 'w-[360px]' : 'w-[400px] max-w-[calc(100vw-2rem)]'}`}>
      <div className="bg-[#0a0e27] border border-white/10 shadow-2xl overflow-hidden">
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
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label={isMinimized ? 'Maximize' : 'Minimize'}>
                <Minimize2 size={16} />
              </button>
              <button onClick={() => { setIsOpen(false); setIsMinimized(false); }} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Close">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[#05070a]">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-[#D4AF37]/20' : 'bg-white/5'}`}>
                    {message.role === 'user' ? <User size={14} className="text-[#D4AF37]" /> : <Bot size={14} className="text-slate-400" />}
                  </div>
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block px-4 py-3 text-[11px] leading-relaxed ${message.role === 'user' ? 'bg-[#D4AF37] text-black rounded-2xl rounded-tr-sm' : 'bg-white/5 text-slate-300 rounded-2xl rounded-tl-sm border border-white/5'}`}>
                      {message.content}
                    </div>
                    <p className="text-[8px] text-slate-600 mt-1 px-1">{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div class<dyad-write path="src/components/SupportChatbot.tsx" description="SupportChatbot — fix invalid input element. The previous version used a lowercase ＜input＞ JSX tag which causes a TypeScript/React error. Replaced with the correct ＜Input＞ shadcn component import. No other behavior change.">
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Minimize2, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LogoBraxel from '@/components/LogoBraxel';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SupportChatbot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Thank you for your message. Our team will respond shortly.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
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
    <div className={`fixed bottom-8 right-8 z-[999] transition-all duration-300 ${isMinimized ? 'w-[360px]' : 'w-[400px] max-w-[calc(100vw-2rem)]'}`}>
      <div className="bg-[#0a0e27] border border-white/10 shadow-2xl overflow-hidden">
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
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label={isMinimized ? 'Maximize' : 'Minimize'}>
                <Minimize2 size={16} />
              </button>
              <button onClick={() => { setIsOpen(false); setIsMinimized(false); }} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Close">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[#05070a]">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-[#D4AF37]/20' : 'bg-white/5'}`}>
                    {message.role === 'user' ? <User size={14} className="text-[#D4AF37]" /> : <Bot size={14} className="text-slate-400" />}
                  </div>
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block px-4 py-3 text-[11px] leading-relaxed ${message.role === 'user' ? 'bg-[#D4AF37] text-black rounded-2xl rounded-tr-sm' : 'bg-white/5 text-slate-300 rounded-2xl rounded-tl-sm border border-white/5'}`}>
                      {message.content}
                    </div>
                    <p className="text-[8px] text-slate-600 mt-1 px-1">{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[#0a0e27] border-t border-white/5">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 bg-white/5 border border-white/10 text-[11px] text-white placeholder:text-slate-600 focus:border-[#D4AF37]"
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