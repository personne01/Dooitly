/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, Cpu, Target, Award, DollarSign, 
  Layers, Landmark, Briefcase, Zap, Flame, Key, ChevronRight, ChevronLeft 
} from 'lucide-react';
import { Language } from '../data/translations';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface AboutProps {
  language: Language;
  t: any;
}

export default function AboutDooitlyView({ language, t }: AboutProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const getSlides = (): Slide[] => {
    if (language === 'id') {
      return [
        {
          id: "concept",
          title: "Apa Itu Dooitly?",
          subtitle: "Sistem Manajemen Keuangan Personal Bertenaga AI",
          icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
          content: (
            <div className="space-y-4 text-zinc-300">
              <p className="border-l-2 border-indigo-500 pl-3 italic text-zinc-100 font-medium">
                "Dooitly adalah asisten cerdas untuk mengelola keuangan, melacak aset, dan merencanakan masa depan dengan dukungan teknologi AI terkini."
              </p>
              <p className="text-sm leading-relaxed">
                Kami membangun platform ini untuk membantu Anda menjauh dari kecemasan finansial melalui analisis data yang terintegrasi, visualisasi aset yang intuitif, serta perlindungan terhadap penipuan keuangan—semuanya dalam satu dasbor yang elegan.
              </p>
            </div>
          )
        },
        {
          id: "features",
          title: "Fitur Unggulan",
          subtitle: "Navigasi finansial yang komprehensif",
          icon: <Layers className="w-6 h-6 text-purple-400" />,
          content: (
            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
              {[
                { title: "Cashflow Command", desc: "Pantau arus kas harian Anda dengan mudah." },
                { title: "Asset Command", desc: "Kelola portofolio investasi Anda secara terpusat." },
                { title: "Scam Sentinel", desc: "Deteksi dini penipuan keuangan dengan AI." },
                { title: "Future Simulator", desc: "Simulasikan pertumbuhan aset masa depan Anda." }
              ].map((f, i) => (
                <div key={i} className="bg-zinc-950 p-3 rounded-lg border border-white/5">
                  <h5 className="font-semibold text-white">{f.title}</h5>
                  <p className="text-zinc-500 mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          )
        },
        {
          id: "tech",
          title: "Teknologi & AI",
          subtitle: "Kecerdasan di balik Dooitly",
          icon: <Cpu className="w-6 h-6 text-teal-400" />,
          content: (
            <div className="space-y-4 text-zinc-300 text-sm">
              <p>Dooitly didukung oleh model AI tercanggih dari Google Gemini untuk memberikan analisis yang presisi dan aman.</p>
              <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 space-y-2">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Analisis Aman & Terstruktur
                </h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Semua analisis dilakukan melalui alur yang terstruktur dan aman, memastikan data keuangan Anda diproses dengan privasi yang terjaga dan informasi yang dapat diandalkan.
                </p>
              </div>
            </div>
          )
        }
      ];
    }

    return [
      {
        id: "concept",
        title: "What is Dooitly?",
        subtitle: "A Smart AI-Powered Personal Wealth System",
        icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
        content: (
          <div className="space-y-4 text-gray-300">
            <p className="border-l-2 border-indigo-500 pl-3 italic text-gray-100 font-medium">
              "Dooitly is your AI-powered companion for managing finances, tracking assets, and planning your future with confidence."
            </p>
            <p className="text-sm leading-relaxed">
              We built this platform to move you away from financial anxiety through integrated data analysis, intuitive asset visualization, and financial fraud protection—all in a single, elegant dashboard.
            </p>
          </div>
        )
      },
      {
        id: "features",
        title: "Key Features",
        subtitle: "Comprehensive financial navigation",
        icon: <Layers className="w-6 h-6 text-purple-400" />,
        content: (
          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            {[
              { title: "Cashflow Command", desc: "Track your daily cash effortlessly." },
              { title: "Asset Command", desc: "Centrally manage your investment portfolio." },
              { title: "Scam Sentinel", desc: "Early financial fraud detection with AI." },
              { title: "Future Simulator", desc: "Simulate your future asset growth." }
            ].map((f, i) => (
              <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <h5 className="font-semibold text-white">{f.title}</h5>
                <p className="text-zinc-400 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        )
      },
      {
        id: "tech",
        title: "Technology & AI",
        subtitle: "The intelligence powering Dooitly",
        icon: <Cpu className="w-6 h-6 text-teal-400" />,
        content: (
          <div className="space-y-4 text-gray-300 text-sm">
            <p>Dooitly is powered by state-of-the-art AI models from Google Gemini to provide precise, actionable, and secure analysis.</p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure & Structured Analysis
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                All analyses are performed through structured and secure workflows, ensuring your financial data is processed with respect to privacy and reliable insights.
              </p>
            </div>
          </div>
        )
      }
    ];
  };

  const slides = getSlides();

  return (
    <div id="pitch_room_root" className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-900">
            {language === 'id' ? 'PAPARAN STRATEGI HACKATHON' : 'HACKATHON STRATEGIST DECK'}
          </span>
          <h2 className="text-lg font-bold font-sans text-white tracking-tight mt-1">
            {language === 'id' ? 'Strategi Startup & Arsitektur Platform' : 'Startup Strategy & Platform Architecture'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            id="prev_slide_btn"
            onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
            disabled={activeSlideIndex === 0}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-zinc-500 text-center w-12 selection:bg-indigo-500">
            {activeSlideIndex + 1} / {slides.length}
          </span>
          <button 
            id="next_slide_btn"
            onClick={() => setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={activeSlideIndex === slides.length - 1}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Panel */}
      <div className="bg-zinc-950/40 p-6 rounded-xl border border-white/5 min-h-[280px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-900 rounded-lg border border-white/5">
              {slides[activeSlideIndex].icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-mono">
                {slides[activeSlideIndex].title}
              </h3>
              <p className="text-xs text-indigo-400 font-mono">
                {slides[activeSlideIndex].subtitle}
              </p>
            </div>
          </div>
          <div className="pt-2">
            {slides[activeSlideIndex].content}
          </div>
        </div>
        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-650 font-mono">
          <span>DOOITLY • {language === 'id' ? 'SPESIFIKASI PRESENTASI' : 'PITCH SPECIFICATIONS'}</span>
          <span>GEMINI AI STUDIO EXCLUSIVE</span>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="flex justify-center gap-1.5">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setActiveSlideIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === activeSlideIndex ? 'w-6 bg-indigo-500' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
