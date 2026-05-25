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

interface PitchProps {
  language: Language;
  t: any;
}

export default function PitchRoomView({ language, t }: PitchProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const getSlides = (): Slide[] => {
    if (language === 'id') {
      return [
        {
          id: "concept",
          title: "1. Konsep Aplikasi & Visi Produk",
          subtitle: "Sistem operasi cerdas kecerdasan buatan untuk kemapanan aset personal",
          icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
          content: (
            <div className="space-y-4 text-zinc-300">
              <p className="border-l-2 border-indigo-500 pl-3 italic text-zinc-100 font-medium">
                "AturDuit bukan sekadar aplikasi pendataan biasa; melainkan sistem navigasi keuangan terintegrasi bertenaga AI Gemini."
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-zinc-950 p-4 rounded-xl border border-white/5">
                  <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-emerald-400" /> Visi Eksekutif
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Aura mengonsolidasikan kas harian yang berantakan dengan analisis keuangan semantik secara instan. Hasilnya adalah asisten penasihat virtual otomatis yang membantu mengatasi kecemasan finansial di tengah masa inflasi tinggi.
                  </p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-white/5">
                  <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-indigo-400" /> AI sebagai Sistem Operasi (OS)
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Menggunakan pemrosesan data lokal yang persisten di memori perangkat dikombinasikan dengan API server-side, Aura dapat melakukan OCR kuitansi seketika, deteksi pola penipuan, pemetaan target masa depan, dan konsultasi taktis.
                  </p>
                </div>
              </div>
            </div>
          )
        },
        {
          id: "problems",
          title: "2. Audiens Target & Masalah yang Diselesaikan",
          subtitle: "Mengurangi kecemasan finansial bagi profesional muda & Gen Z",
          icon: <Flame className="w-6 h-6 text-orange-400" />,
          content: (
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-orange-400 font-bold uppercase font-mono">Pengeluaran Impulsif</span>
                  <h5 className="text-white text-xs font-medium mt-1">Gaya Hidup Boros</h5>
                  <p className="text-zinc-500 mt-2">Kebocoran mikro-langganan aplikasi tidak aktif serta jebakan pay-later membebani kas bulanan generasi muda.</p>
                </div>
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono font-bold">Rawan Tertipu</span>
                  <h5 className="text-white text-xs font-medium mt-1">Investasi Bodong</h5>
                  <p className="text-zinc-500 mt-2">Tawaran cepat kaya melalui grup Telegram berkedok AI Trading berisiko memakan tabungan pokok pemula.</p>
                </div>
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono font-bold">Kaku & Membosankan</span>
                  <h5 className="text-white text-xs font-medium mt-1">Kurang Motivasi</h5>
                  <p className="text-zinc-500 mt-2">Pencatatan tradisional di Excel terasa kaku. AturDuit merubah manajemen finansial menjadi RPG interaktif yang memotivasi.</p>
                </div>
              </div>
              <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl">
                <h5 className="text-white text-xs font-semibold mb-1">Rencana Empati Keuangan:</h5>
                <p className="text-zinc-400">
                  AturDuit mendekati psikologi keuangan pengguna dengan mengubah pembatasan angka kaku menjadi sistem naik tingkat (leveling) yang interaktif dan memuaskan.
                </p>
              </div>
            </div>
          )
        },
        {
          id: "workflows",
          title: "3. Sistem Alur Kerja AI (Vibe-Architecture)",
          subtitle: "8 pilar utama pendorong kecerdasan finansial personal otomatis",
          icon: <Layers className="w-6 h-6 text-purple-400" />,
          content: (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-sans">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <h5 className="font-semibold text-white">1. Asisten Konsultan</h5>
                <p className="text-zinc-500 mt-1 text-[11px]">Chat interaktif yang responsif alokasi aset.</p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <h5 className="font-semibold text-white">2. Audit Mutasi</h5>
                <p className="text-zinc-500 mt-1 text-[11px]">OCR Instan foto mutasi mutasi bank.</p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <h5 className="font-semibold text-white">3. Deteksi Kebiasaan</h5>
                <p className="text-zinc-500 mt-1 text-[11px]">Identifikasi pengeluaran konsumsi berlebih.</p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <h5 className="font-semibold text-white">4. Perencana Target</h5>
                <p className="text-zinc-500 mt-1 text-[11px]">Desain pencapaian tonggak tabungan mandiri.</p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <h5 className="font-semibold text-white">5. Penjelas Aset</h5>
                <p className="text-zinc-500 mt-1 text-[11px]">Ubah jargon teknis saham/obligasi ke bahasa sederhana.</p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <h5 className="font-semibold text-white">6. Anti-Bocor</h5>
                <p className="text-zinc-500 mt-1 text-[11px]">Deteksi penghentian langganan hampa guna.</p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <h5 className="font-semibold text-white">7. Radar Penipuan</h5>
                <p className="text-zinc-500 mt-1 text-[11px]">Pendeteksi jebakan manipulasi psikologis penawaran.</p>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <h5 className="font-semibold text-white">8. Proyeksi Simulasi</h5>
                <p className="text-zinc-500 mt-1 text-[11px]">Hitung masa depan pensiun dengan Recharts dinamis.</p>
              </div>
            </div>
          )
        },
        {
          id: "schema",
          title: "4. Integrasi SDK Gemini & Skema Kontrak JSON",
          subtitle: "Hasil analisis presisi yang terstruktur dan aman",
          icon: <Key className="w-6 h-6 text-teal-400" />,
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-2">
                <h5 className="font-semibold text-teal-400 text-[10px]">1. Kontrak Output Analisis Penipuan OCR</h5>
                <pre className="bg-zinc-950 p-2 rounded-lg border border-white/5 overflow-y-auto text-[9px] text-zinc-400 max-h-36">
{`{
  scamProbability: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe';
  detectedRedFlags: string[];
  phrasingIndicators: string[];
  legalAnomalies: string[];
  recommendation: string;
  urgencyTacticFound: boolean;
}`}
                </pre>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-indigo-400 text-[10px]">2. Kontrak Output Simulasi Finansial</h5>
                <pre className="bg-zinc-950 p-2 rounded-lg border border-white/5 overflow-y-auto text-[9px] text-zinc-400 max-h-36">
{`{
  projectedNetWorth: number;
  monthlyInvestmentNeeded: number;
  probabilityOfSuccess: number;
  strategicAdvice: string;
  milestones: {age: number; title: string}[];
  chartData: {
    year: number;
    conservativeProjection: number;
    expectedProjection: number;
    optimisticProjection: number;
  }[]
}`}
                </pre>
              </div>
            </div>
          )
        },
        {
          id: "gamification",
          title: "5. Gamifikasi (Sistem RPG Leveling AturDuit)",
          subtitle: "Merubah pendataan bosan menjadi pencapaian menyenangkan",
          icon: <Award className="w-6 h-6 text-yellow-400" />,
          content: (
            <div className="space-y-3 text-xs font-sans">
              <p className="text-zinc-350">
                AturDuit mengintegrasikan prinsip psikologi RPG ke dalam data nyata keuangan pengguna. Setiap aksi sehat menambah XP dan memperbaiki tameng keamanan personal.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-white/5">
                  <h5 className="text-white font-medium">Naik Tingkat Level</h5>
                  <p className="text-[11px] text-zinc-550 mt-1">Tingkatkan status sosial-finansial Anda dari 'Tunawisma Finansial' hingga 'Suhu Kebal Inflasi' dengan kebiasaan investasi nyata.</p>
                </div>
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-white/5">
                  <h5 className="text-white font-medium">Tantangan Harian</h5>
                  <p className="text-[11px] text-zinc-550 mt-1">Menyelesaikan audit kuitansi berlebih, memangkas kebiasaan langganan sia-sia, meningkatkan rasio kekayaan.</p>
                </div>
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-white/5">
                  <h5 className="text-white font-medium">Visual Menakjubkan</h5>
                  <p className="text-[11px] text-zinc-550 mt-1">Menghadirkan grafik interaktif untuk tonggak pelipatgandaan modal demi memicu rasa puas finansial.</p>
                </div>
              </div>
            </div>
          )
        },
        {
          id: "monetization",
          title: "6. Model Bisnis & Publikasi Startup",
          subtitle: "Skema Langganan Premium B2C & Layanan Mitra API B2B",
          icon: <Briefcase className="w-6 h-6 text-blue-400" />,
          content: (
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl">
                  <h4 className="text-indigo-400 font-semibold mb-2">Model Berbayar B2C</h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-zinc-400">
                    <li><strong className="text-white">AturDuit Basic (Gratis):</strong> Akses 3 kali audit mutasi bank bulanan, serta chat asisten tanpa batas.</li>
                    <li><strong className="text-white">AturDuit Sentinel Pro (Rp 150.000/bln):</strong> Plugin pemantau spam Telegram real-time cerdas, usulan strategi indeks reksa dana premium otomatis, serta kalkulator pensiun keluarga tanpa iklan.</li>
                  </ul>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl">
                  <h4 className="text-emerald-400 font-semibold mb-2">Kemitraan Strategis B2B</h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-zinc-400">
                    <li><strong className="text-white">Layanan API Neobank:</strong> Menjual lisensi endpoint deteksi penipuan taktik manipulatif AturDuit ke koperasi digital dan perbankan keliling.</li>
                    <li><strong className="text-white">HYSA Rujukan Tepercaya:</strong> Menghubungkan aset tersaved langsung ke instrumen obligasi syariah atau rekening tabungan bunga tinggi resmi terdaftar OJK.</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        },
        {
          id: "whywin",
          title: "7. Mengapa Solusi Ini Layak Menang?",
          subtitle: "Eksekusi visual elegan dipadu kegunaan nyata nan kokoh",
          icon: <Zap className="w-6 h-6 text-amber-400" />,
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-2">
                <h4 className="font-semibold text-teal-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Keunggulan Teknis Nyata
                  </h4>
                <p className="text-zinc-400 leading-relaxed">
                  Bukan sekadar kawat antarmuka statis, AturDuit melakukan **pemrosesan model server-side nyata** menggunakan SDK Gemini terstruktur JSON. Seluruh proses OCR kuitansi dan perencana pensiun berjalan dinamis dan persisten di memori lokal.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-teal-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" /> Sentuhan Emosi & Seni
                </h4>
                <p className="text-zinc-400 leading-relaxed">
                  Aplikasi fintech biasa adalah utilitas yang kaku dan membosankan. Dengan menyelimuti sistem operasi AturDuit di dalam tema glassmorphic futuristik gelap yang memikat, mengelola uang terasa intuitif dan memuaskan.
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
        title: "1. App Concept & Product Vision",
        subtitle: "A futuristic AI operating system for personal wealth",
        icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
        content: (
          <div className="space-y-4 text-gray-300">
            <p className="border-l-2 border-indigo-500 pl-3 italic text-gray-100 font-medium">
              "AturDuit is not an application; it is a bespoke, real-time economic intelligence client running on Gemini."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-400" /> Executive Vision
                </h4>
                <p className="text-zinc-400">
                  AturDuit unifies fragmented cash flow data with real-time semantic financial intelligence. It serves as an automated personal wealth agency, helping young builders navigate an increasingly complex inflationary world.
                </p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-indigo-400" /> AI as the OS Layer
                </h4>
                <p className="text-zinc-400">
                  By modeling all actions around a secure, server-side mental pipeline, AturDuit performs instant statement OCR, scams profiling, custom wealth asset breakdown, and career projection in real-time.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "problems",
        title: "2. Target Audience & Problems Solved",
        subtitle: "Crushing financial anxiety for Gen Z & young professionals",
        icon: <Flame className="w-6 h-6 text-orange-400" />,
        content: (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-orange-400 font-semibold uppercase font-mono">Impulsive Spend</span>
                <h5 className="text-white text-sm font-medium mt-1">Lifestyle Creep</h5>
                <p className="text-zinc-400 mt-2">Drawn in by microservices and buy-now-pay-later (BNPL), young-builders suffer subscription leakage.</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-indigo-400 font-semibold uppercase font-mono">Scam Vulnerability</span>
                <h5 className="text-white text-sm font-medium mt-1">Deceptive Markets</h5>
                <p className="text-zinc-400 mt-2">Aggressive social-media influencers lure beginners into speculative pump-and-dump fraud models.</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-emerald-400 font-semibold uppercase font-mono">Anxiety Gap</span>
                <h5 className="text-white text-sm font-medium mt-1">Analysis Paralysis</h5>
                <p className="text-zinc-400 mt-2">Traditional Excel modeling is dry and doesn't connect emotionally. AturDuit makes projection gamified and motivational.</p>
              </div>
            </div>
            <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-lg">
              <h5 className="text-white text-sm font-semibold mb-1">Empathetic Strategy Core:</h5>
              <p className="text-zinc-400">
                AturDuit addresses the psychology of wealth, turning financial monitoring from a shame-inducing list of restrictive numbers into an empowering leveling system.
              </p>
            </div>
          </div>
        )
      },
      {
        id: "workflows",
        title: "3. Modular AI Workflows (Vibe-Architecture)",
        subtitle: "The 8 components driving complete personal wealth intelligence",
        icon: <Layers className="w-6 h-6 text-purple-400" />,
        content: (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <h5 className="font-semibold text-white">1. Core Advisor</h5>
              <p className="text-zinc-400 mt-1">Conversational investment coaching.</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <h5 className="font-semibold text-white">2. Health Core</h5>
              <p className="text-zinc-400 mt-1">Statement OCR & dynamic cash flow analyzer.</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <h5 className="font-semibold text-white">3. Behavior Core</h5>
              <p className="text-zinc-400 mt-1">Microcategory impulse detection.</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <h5 className="font-semibold text-white">4. Goal Planner</h5>
              <p className="text-zinc-400 mt-1">Dynamic financial milestones engine.</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <h5 className="font-semibold text-white">5. Asset Explainer</h5>
              <p className="text-zinc-400 mt-1">Explains indices, stocks, & crypto algorithms.</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <h5 className="font-semibold text-white">6. Anti-Leak Core</h5>
              <p className="text-zinc-400 mt-1">Detects subscription dead zones.</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <h5 className="font-semibold text-white">7. Fraud Sentinel</h5>
              <p className="text-zinc-400 mt-1">Pasted cold offers threat scanning.</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <h5 className="font-semibold text-white">8. Future Simulator</h5>
              <p className="text-zinc-400 mt-1">Compounding Monte Carlo projection.</p>
            </div>
          </div>
        )
      },
      {
        id: "schema",
        title: "4. Gemini SDK Integration & JSON Contracts",
        subtitle: "Structured model schemas driving predictability",
        icon: <Key className="w-6 h-6 text-teal-400" />,
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="space-y-2">
              <h5 className="font-semibold text-teal-400 text-[10px]">1. Scam Analysis Response Schema</h5>
              <pre className="bg-slate-950 p-2 rounded border border-slate-800 overflow-y-auto text-[9px] text-zinc-400 max-h-36">
{`{
  scamProbability: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe';
  detectedRedFlags: string[];
  phrasingIndicators: string[];
  legalAnomalies: string[];
  recommendation: string;
  urgencyTacticFound: boolean;
}`}
              </pre>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-indigo-400 text-[10px]">2. Wealth Futures Response Schema</h5>
              <pre className="bg-slate-950 p-2 rounded border border-slate-800 overflow-y-auto text-[9px] text-zinc-400 max-h-36">
{`{
  projectedNetWorth: number;
  monthlyInvestmentNeeded: number;
  probabilityOfSuccess: number;
  strategicAdvice: string;
  milestones: {age: number; title: string}[];
  chartData: {
    year: number;
    conservativeProjection: number;
    expectedProjection: number;
    optimisticProjection: number;
  }[]
}`}
              </pre>
            </div>
          </div>
        )
      },
      {
        id: "gamification",
        title: "5. Gamification (Pecuniary Level System)",
        subtitle: "Transforming wealth tracking into an organic growth RPG",
        icon: <Award className="w-6 h-6 text-yellow-400" />,
        content: (
          <div className="space-y-3 text-xs">
            <p className="text-[11px] text-zinc-400">
              AturDuit abstracts traditional loyalty rewards into **Fintech Quests** and dynamic **Wealth XP**. Every healthy habit levels up the user's security shield.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                <h5 className="text-white font-medium">Level Tier Upgrades</h5>
                <p className="text-[11px] text-zinc-500 mt-1 font-sans">Progress from 'Vulnerable Sprout' to 'Anti-Fragile Sage' through verified savings behaviors.</p>
              </div>
              <div className="bg-slate-900/55 p-3 rounded border border-slate-800">
                <h5 className="text-white font-medium">AturDuit Quests Tab</h5>
                <p className="text-[11px] text-zinc-500 mt-1 font-sans">Completing anti-fraud checks, calculating long-term budgets, and flagging leakages boosts active rank.</p>
              </div>
              <div className="bg-slate-900/55 p-3 rounded border border-slate-800">
                <h5 className="text-white font-medium">Mental Rewards</h5>
                <p className="text-[11px] text-zinc-500 mt-1 font-sans">Deliberate visual delight triggers on major compounding breakthroughs, reducing financial anxiety.</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "monetization",
        title: "6. Monetization & Startup Strategy",
        subtitle: "B2C Subscription & Premium API Partnerships",
        icon: <Briefcase className="w-6 h-6 text-blue-400" />,
        content: (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-950/20 border border-indigo-900/50 p-4 rounded-xl">
                <h4 className="text-indigo-400 font-semibold mb-2">Freemium Tier Structure</h4>
                <ul className="space-y-1.5 list-disc pl-4 text-zinc-400">
                  <li><strong className="text-white">Basic AturDuit Core:</strong> 3 statement analyzes and unlimited chat advice. (Free)</li>
                  <li><strong className="text-white">AturDuit Sentinel Pro ($12/mo):</strong> Real-time browser plugin scanning suspicious transactions, smart high-yield automation strategies, and advanced family future simulation tracking.</li>
                </ul>
              </div>
              <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl">
                <h4 className="text-emerald-400 font-semibold mb-2">B2B Integrations</h4>
                <ul className="space-y-1.5 list-disc pl-4 text-zinc-400">
                  <li><strong className="text-white">Neobanking API Plugin:</strong> Selling AturDuit's scam sentinel model structure to small digital credit card cooperatives as a white-labeled anti-fraud API endpoint.</li>
                  <li><strong className="text-white">Compound Interest Partnerships:</strong> Connecting verified users to validated, secure HYSAs with zero referral kickbacks.</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "whywin",
        title: "7. Why This Wins the Hackathon",
        subtitle: "Differentiated execution and technical robustness",
        icon: <Zap className="w-6 h-6 text-amber-400" />,
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-1.5 font-mono uppercase text-teal-400">
                <ShieldCheck className="w-4 h-4" /> Technical Superiority
              </h4>
              <p className="text-zinc-400 leading-relaxed font-sans">
                Rather than larping status panels, AturDuit performs **real server-side model processing** using Gemini structured JSON schemas. No mock outputs; actual base64 analysis can run through our unified backend server proxy.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-1.5 font-mono uppercase text-teal-400">
                <Landmark className="w-4 h-4" /> Massive Emotional Saliency
              </h4>
              <p className="text-zinc-400 leading-relaxed font-sans">
                Fintech applications are usually boring utilities. By layering a cosmic glassmorphic design system around active conversational wealth mentors, it feels like an intelligent operating companion.
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
          <span>AURA FINANCIAL OS • {language === 'id' ? 'SPESIFIKASI PRESENTASI' : 'PITCH SPECIFICATIONS'}</span>
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
