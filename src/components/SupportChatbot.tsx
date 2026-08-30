"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setTimeout(() => {
      const assistantMessage: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: 'Thank you for your message. Our team will respond shortly.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[999] bg-[#D4AF37] text-black px-6 py-4 flex items-center gap-3 hover:opacity-90 transition-opacity"
        aria-label="Open support chat"
      >
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">
          {typeof t === 'function' ? t('nav.support', 'Support') : 'Support'}
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-8 right-8 z-[999] w-[400px] max-w-[calc(100vw-2rem)] bg-[#0a0e27] border border-white/10 shadow-2xl"
      role="dialog"
      aria-label="Support chat"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#0a0e27] to-[#0f1430]">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">
            {typeof t === 'function' ? t('chatbot.title', 'Braxel Support') : 'Braxel Support'}
          </h3>
          <p className="text-[9px] text-[#D4AF37] flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
            Braxel Markets AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMinimized((v) => !v)}
            className="p-2 text-slate-400 hover:text-white"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {isMinimized ? '+' : '−'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
            className="p-2 text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">×</span>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[#05070a]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user' ? 'flex gap-3 flex-row-reverse' : 'flex gap-3'
                }
              >
                <div
                  className={
                    message.role === 'user'
                      ? 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#D4AF37]/20'
                      : 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/5'
                  }
                >
                  <span className="text-[10px] font-black text-white">
                    {message.role === 'user' ? 'U' : 'B'}
                  </span>
                </div>
                <div
                  className={
                    message.role === 'user' ? 'max-w-[80%] text-right' : 'max-w-[80%]'
                  }
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'inline-block px-4 py-3 text-[11px] leading-relaxed bg-[#D4AF37] text-black rounded-2xl rounded-tr-sm'
                        : 'inline-block px-4 py-3 text-[11px] leading-relaxed bg-white/5 text-slate-300 rounded-2xl rounded-tl-sm border border-white/5'
                    }
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-[#0a0e27] border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={
                  typeof t === 'function'
                    ? t('chatbot.placeholder', 'Type a message...')
                    : 'Type a message...'
                }
                className="flex-1 bg-white/5 border border-white/10 text-[11px] text-white placeholder:text-slate-600 focus:border-[#D4AF37] px-3 py-2 outline-none"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-3 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 disabled:opacity-50"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Send
                </span>
              </button>
            </div>
            <p className="text-[8px] text-slate-600 mt-2 text-center">
              {typeof t === 'function'
                ? t('chatbot.emailSupport', 'Email:') + ' marketsbraxel@ouvidor.net'
                : 'Email: marketsbraxel@ouvidor.net'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportChatbot;