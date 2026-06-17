"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedQuestion {
  id: string;
  question: string;
  answer: string;
}

// Predefined knowledge base for common questions
const suggestedQuestions: SuggestedQuestion[] = [
  {
    id: '1',
    question: 'How do I start investing?',
    answer: 'To start investing with Braxel Markets:\n\n1. Create an account and complete KYC verification\n2. Log in to your dashboard\n3. Choose an investment plan\n4. Complete payment\n5. Your algorithmic infrastructure will be deployed automatically\n\nThe process is designed to be seamless and fully automated.'
  },
  {
    id: '2',
    question: 'What is the minimum investment?',
    answer: 'Our investment plans start at different tiers based on managed capital:\n\n• Starter: Starting allocation available\n• Professional: Mid-tier institutional access\n• Enterprise: Full institutional infrastructure\n\nVisit our Pricing page for detailed information about each plan and managed capital tiers.'
  },
  {
    id: '3',
    question: 'How does algorithmic trading work?',
    answer: 'Our proprietary algorithms execute high-frequency trading strategies across global markets:\n\n• Statistical Arbitrage: Exploiting price inefficiencies\n• Mean Reversion: Trading around historical averages\n• High-Frequency Trading: Ultra-low latency execution\n\nAll strategies are fully automated and monitored 24/7.'
  },
  {
    id: '4',
    question: 'What are the fees?',
    answer: 'Braxel Markets charges:\n\n• Setup Fee: One-time fee (varies by plan)\n• Monthly Management Fee: Based on your chosen tier\n• No hidden costs or performance fees\n\nExact pricing is displayed during the checkout process.'
  },
  {
    id: '5',
    question: 'How do I withdraw profits?',
    answer: 'Withdrawing your profits is simple:\n\n1. Log in to your dashboard\n2. Go to the Portfolio section\n3. Select your active service\n4. Click "Request Withdrawal"\n5. Enter the amount and your wallet/IBAN details\n6. Submit the request\n\nWithdrawals are typically processed within 1-3 business days.'
  },
  {
    id: '6',
    question: 'Is my investment safe?',
    answer: 'We implement institutional-grade security measures:\n\n• End-to-end encryption (AES-256)\n• SOC 2 Type II compliance\n• Multi-layer authentication\n• Direct market access via Equinix data centers\n• Redundant cloud infrastructure (AWS + Azure)\n\nHowever, all trading involves risk. Past performance does not guarantee future results.'
  },
  {
    id: '7',
    question: 'How long does KYC take?',
    answer: 'KYC (Know Your Customer) verification typically takes:\n\n• Automatic approval: Instant for valid documents\n• Manual review: 24-48 hours\n\nOur compliance team reviews all submissions to ensure security while maintaining a smooth onboarding experience.'
  },
  {
    id: '8',
    question: 'Contact support',
    answer: 'Our institutional support team is available 24/7:\n\n• Email: marketsbraxel@ouvidor.net\n• Response time: Within 24 hours\n\nFor urgent matters, please include "URGENT" in your email subject line.'
  }
];

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: `Welcome to Braxel Markets Support! 👋

I'm your AI assistant, here to help you with any questions about our institutional trading platform.

How can I assist you today?`,
    timestamp: new Date()
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findAnswer = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Check for keyword matches
    for (const item of suggestedQuestions) {
      const keywords = item.question.toLowerCase().split(' ');
      const matchCount = keywords.filter(word => lowerQuery.includes(word)).length;
      if (matchCount >= 2 || lowerQuery.includes(item.question.toLowerCase())) {
        return item.answer;
      }
    }
    
    // Return a generic response with suggestions
    return `Thank you for your question! 

I found some topics that might help:

• Getting started with investing
• Investment plans and pricing
• Algorithmic trading explained
• Security measures

If you need more specific assistance, please contact our support team at marketsbraxel@ouvidor.net or use one of the quick questions below.`;
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

    // Simulate AI response delay
    setTimeout(() => {
      const answer = findAnswer(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuestion = (question: SuggestedQuestion) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question.question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: question.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
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
        <div className="relative bg-[#D4AF37] text-black p-4 rounded-full flex items-center justify-center shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300">
          <MessageCircle size={24} />
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-black/90 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          AI Support
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
              <div className="relative">
                <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                  <Bot size={20} className="text-[#D4AF37]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0e27]" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">Braxel Support</h3>
                <p className="text-[9px] text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  AI Assistant Online
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

            {/* Quick Questions */}
            <div className="px-4 py-3 bg-[#0a0e27] border-t border-white/5">
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-2">Quick Questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 4).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-[9px] font-medium px-3 py-1.5 bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"
                  >
                    {q.question.length > 25 ? q.question.slice(0, 25) + '...' : q.question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0a0e27] border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..."
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
                Need more help? Email: marketsbraxel@ouvidor.net
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportChatbot;
