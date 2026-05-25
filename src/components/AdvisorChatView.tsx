/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, HelpCircle, GraduationCap } from 'lucide-react';
import { ChatMessage, UserPreferences } from '../types';
import { Language } from '../data/translations';

interface AdvisorChatProps {
  preferences: UserPreferences;
  language: Language;
  t: any;
}

export default function AdvisorChatView({ preferences, language, t }: AdvisorChatProps) {
  const getInitialWelcome = () => {
    if (language === 'id') {
      return `Salam hangat. Saya adalah AturDuit, asisten strategi, penasihat, dan pelatih keuangan personal Anda.

Berikut adalah konfigurasi profil Anda saat ini:
- Pendapatan Bulanan: **${preferences.currency}${preferences.monthlyIncome.toLocaleString()}**
- Aset Tabungan Saat Ini: **${preferences.currency}${preferences.currentSavings.toLocaleString()}**
- Profil Risiko: **${preferences.riskAppetite.toUpperCase()}**

Aspek keuangan apa yang ingin Anda diskusikan hari ini? Silakan pilih dari daftar pertanyaan cepat di bawah ini atau ketikkan pertanyaan Anda sendiri secara spesifik.`;
    }
    return `Greetings, Master. I am AturDuit. I represent your core logical wealth companion, strategist, and advisor.

I am configured with your current profile:
- Monthly Income: **${preferences.currency}${preferences.monthlyIncome.toLocaleString()}**
- Savings Surplus: **${preferences.currency}${preferences.currentSavings.toLocaleString()}**
- Risk Aperture: **${preferences.riskAppetite.toUpperCase()}**

What financial horizons shall we investigate today? You can choose one of the preset concepts below or ask any tailored query.`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Re-generate welcome message if preferences or language change
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: getInitialWelcome(),
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [preferences, language]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.slice(-10), // Limit history context
          message: text,
          context: { preferences }
        })
      });

      if (!response.ok) {
        throw new Error('Intelligence proxy timed out');
      }

      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || "I was unable to structure an assessment. Please rephrase your query.",
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'model',
        text: language === 'id' 
          ? `⚠️ [Terjadi Pengecualian] Hubungan AturDuit ke server Gemini terputus: ${err.message || 'Silakan cek koneksi internet Anda'}.`
          : `⚠️ [System Exception] AturDuit lost sync with the Gemini engine: ${err.message || 'Check your internet connection and API health'}.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: language === 'id' 
          ? "Sistem dihidupkan ulang. Riwayat percakapan dikosongkan. Tanyakan apa saja untuk strategi keuangan baru."
          : "System restarted. Session history trimmed. Ask me anything to formulate a new wealth tactic.",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const presets = language === 'id' ? [
    "Bagaimana membangun tabungan darurat Rp 10 juta pertama?",
    "Alokasikan aset untuk profil risiko konservatif vs agresif.",
    "Bantu saya mengidentifikasi jebakan pengeluaran impulsif.",
    "Formulakan rencana keuangan bebas hutang dalam 3 langkah."
  ] : [
    "How do I compound my first $10k safely?",
    "Analyze S&P 500 index vs mutual fund costs.",
    "Identify common emotional spending trigger traps.",
    "Give me a 3-step career capital compound plan."
  ];

  return (
    <div id="advisor_chat_root" className="bg-[#0a0a0a]/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.9)] flex flex-col h-[600px] justify-between relative overflow-hidden">
      
      {/* Tab Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4 h-12">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 font-mono">
              {t.advisorTitle} <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">{t.advisorSubtitle}</p>
          </div>
        </div>
        <button 
          id="clear_chat_history_btn"
          onClick={clearChatHistory}
          className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-white border border-white/10 bg-zinc-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          title="Clear chat records"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{language === 'id' ? 'Reset Obrolan' : 'Reset Chat'}</span>
        </button>
      </div>

      {/* Messages Scrolling Hub */}
      <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 scrollbar-thin">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
            <div className={`p-2 h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-zinc-900 border-white/10 text-teal-400'
            }`}>
              {msg.role === 'user' ? 'U' : <Sparkles className="w-3.5 h-3.5 animate-pulse" />}
            </div>
            <div className="space-y-1">
              <div id={`chat_msg_bubble_${msg.id}`} className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-sans ${
                msg.role === 'user' 
                  ? 'bg-indigo-900 border border-indigo-500/40 text-white rounded-tr-none shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                  : 'bg-zinc-900/60 border border-white/5 text-zinc-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              <span className="text-[9px] text-zinc-500 block px-1 font-mono tracking-tight">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="p-2 h-8 w-8 rounded-full bg-zinc-900 border border-white/10 text-teal-400 flex items-center justify-center shrink-0 animate-spin">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 bg-zinc-900/40 border border-white/5 text-zinc-400 text-xs italic rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="animate-pulse">
                {language === 'id' 
                  ? 'Aura sedang berdiskusi dengan jejaring kecerdasan buatan Gemini...' 
                  : 'Aura is calculating investment strategies with primary intelligence network...'}
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Action Preset Prompt Chips */}
      {messages.length === 1 && (
        <div id="advisor_preset_chips" className="mb-3 space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1 font-bold">
            <HelpCircle className="w-3 h-3 text-indigo-400" /> {t.presettedInquiries}
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-xs bg-zinc-900/55 hover:bg-indigo-500/10 text-zinc-300 hover:text-indigo-400 px-3.5 py-2 rounded-full border border-white/5 hover:border-indigo-500/30 text-left transition duration-150 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Bar */}
      <div className="flex gap-2">
        <input
          id="advisor_chat_input_el"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
          placeholder={t.chatPlaceholder}
          disabled={isLoading}
          className="flex-1 bg-zinc-950/80 border border-white/10 text-white rounded-full px-5 py-3.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-zinc-650 disabled:opacity-50 transition duration-150 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
        />
        <button
          id="advisor_chat_submit_btn"
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
          className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-full shadow-lg transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4 font-bold" />
        </button>
      </div>

    </div>
  );
}
