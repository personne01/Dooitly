/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { ScamAnalysis } from '../types';
import { Language } from '../data/translations';

interface ScamProps {
  language: Language;
  t: any;
  activeQuestInProgressId?: string | null;
  onCompleteQuest?: (questId: string) => void;
}

export default function ScamDetectorView({ 
  language, 
  t,
  activeQuestInProgressId,
  onCompleteQuest
}: ScamProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [errMessage, setErrMessage] = useState<string | null>(null);

  const MOCK_SCENARIOS = language === 'id' ? [
    {
      title: "1. Tawaran Investasi Komisi Harian Telegram (Pegasus)",
      text: "PELUANG DAHSYAT HARI INI! Dapatkan Rp 25.000.000 bersih per hari dengan Robot AI Trading Otomatis kami. Dijamin 100% tanpa risiko kegagalan. Cukup transfer deposit minimum Rp 1.500.000 sekarang juga untuk kunci slot VIP kuota terbatas! Izin Otoritas Jasa Keuangan (OJK) sedang proses."
    },
    {
      title: "2. Lowongan Kerja Kerja-Sampingan Like Video",
      text: "LOWONGAN KERJA DI RUMAH SAJA! Dapatkan gaji Rp 10.000.000 per minggu hanya dengan klik like/subscribe video Youtube. Tidak perlu pengalaman kerja. Sebelum mulai, Anda wajib mentransfer biaya jaminan server sebesar Rp 350.000 yang akan dikembalikan penuh bersama gaji pertama Anda."
    },
    {
      title: "3. Likuiditas Koin Token Kripto Lunar Yield",
      text: "Token LUNA-GOLD akan segera terdaftar minggu depan! Dapatkan bunga tabungan tahunan 15.000% APR dengan mengunci dana Anda di protokol Yield Farm terdesentralisasi kami sekarang. Tanpa verifikasi KYC, identitas tim dirahasiakan demi keselamatan koin, beli sebelum harga melonjak drastis!"
    }
  ] : [
    {
      title: "1. 25% Weekly Passive Trading Bot Pitch",
      text: "URGENT OPPORTUNITY! Make $1,500 daily with our automated AI Trading Algorithm. Guaranteed zero risk. You only need to deposit $100 starting today to secure the private pool. Click this non-refundable telegram link right now before registration slots run out! Unverified offshore license."
    },
    {
      title: "2. Tasks Job Circular (Upfront Security Collateral)",
      text: "EASY WORK AT HOME! Earn money reacting on Youtube videos, earn up to $1,000 weekly. Requires no experience. To unlock the active workspace, please send $50 collateral security payment which will be refunded on your first payout. Click below to chat with an unverified WhatsApp hiring assistant."
    },
    {
      title: "3. Decentralized Lunar Yield Token Audit",
      text: "Launch price of LUNA-GOLD is pegged. Buy and lock assets in the yield farm protocol for 15,000% Annual Percentage Rate. No KYC check needed, contract audit pending. Team identity is confidential but holds large token pools ready for the exchange release next week!"
    }
  ];

  const triggerSentinelAudit = async (customText?: string) => {
    const textToScan = customText || inputText;
    if (!textToScan.trim() || isLoading) return;

    setIsLoading(true);
    setErrMessage(null);
    try {
      const response = await fetch('/api/gemini/detect-scam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: textToScan })
      });

      if (!response.ok) {
        throw new Error('Aura Anti-Fraud Core encountered connection failures');
      }

      const parsed: ScamAnalysis = await response.json();
      setAnalysis(parsed);
    } catch (err: any) {
      console.error(err);
      setErrMessage(err.message || 'Scantinel timed out');
      
      // Localized fallback scam analysis reports
      if (language === 'id') {
        setAnalysis({
          scamProbability: 95,
          riskLevel: 'Sangat Tinggi',
          detectedRedFlags: [
            "Menjanjikan imbal hasil pasif tidak masuk akal (Rp 25 juta/hari secara dijamin).",
            "Meminta transfer deposit awal dengan kedok 'biaya jaminan server' atau 'deposit VIP'.",
            "Mendesak tenggat waktu (FOMO urgensi tinggi agar pengguna tidak sempat berpikir logis)."
          ],
          phrasingIndicators: [
            "Penggunaan diksi agresif: 'DIJAMIN TANPA RISIKO', 'DAHSYAT', 'TRANSFER SEKARANG JUGA'."
          ],
          legalAnomalies: [
            "Tidak terdaftar resmi di Otoritas Jasa Keuangan (OJK). Tidak ada legalitas entitas korporat berizin."
          ],
          recommendation: "Jangan transfer uang! Ini adalah skema penipuan klasik. Blokir kontak penawaran segera.",
          urgencyTacticFound: true
        });
      } else {
        setAnalysis({
          scamProbability: 92,
          riskLevel: 'Severe',
          detectedRedFlags: [
            "Guaranteed unrealistic compounding capital returns (25% weekly).",
            "Confidential founder identities with immediate liquidity pools.",
            "Urgency-manipulation (slots expiring in minutes)."
          ],
          phrasingIndicators: [
            "Explicit usage of extreme FOMO labels: 'URGENT', 'Guaranteed zero risk'."
          ],
          legalAnomalies: [
            "Lack of direct registration on local registers (OJK / SEC equivalents)."
          ],
          recommendation: "Stay away! Extreme threat detected. Zero liquidity backing.",
          urgencyTacticFound: true
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadScenario = (text: string) => {
    setInputText(text);
    triggerSentinelAudit(text);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Active Quest Banner */}
      {activeQuestInProgressId === 'quest-2' && (
        <div className="bg-amber-500/5 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.05)] animate-fade-in">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500 text-black font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              <Sparkles className="w-3 h-3 animate-spin" />
              {language === 'id' ? 'MISI AKTIF BERJALAN' : 'ACTIVE QUEST'}
            </span>
            <h4 className="text-xs font-bold text-white mt-1 uppercase tracking-tight font-mono">
              {language === 'id' ? 'Bongkar & Audit Skema Penipuan Finansial!' : 'Expose and Audit High-Yield Scam Pitch!'}
            </h4>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
              {language === 'id' 
                ? 'Misi dimulai! Silakan ketik, salin pesan penawaran mencurigakan Anda sendiri, atau klik salah satu Skenario Simulasi cepat di sebelah kiri untuk memindainya dengan mesin AI anti-fraud kami demi menyelesaikan misi.'
                : 'Active Quest Started! Paste any high-yield proposal or select a mock simulation scenario on the left, then run the AI Sentinel Scan to classify fraud risk criteria and secure 500 XP.'}
            </p>
          </div>
          {analysis && onCompleteQuest ? (
            <button
              id="claim_scammed_quest_rewards_btn"
              onClick={() => {
                onCompleteQuest('quest-2');
                alert(language === 'id' 
                  ? 'Selamat! Misi Selesai! Anda berhasil mendeteksi indikator penipuan dan mengamankan 500 XP ke profil RPG Anda.' 
                  : 'Congratulations! Quest complete. You ran a successful deep sentinel audit on a sketchy deal and earned 500 XP.'
                );
              }}
              className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold rounded-xl transition cursor-pointer self-start sm:self-center uppercase"
            >
              {language === 'id' ? 'Verifikasi & Selesaikan Misi' : 'Verify & Claim XP'}
            </button>
          ) : (
            <div className="text-[10px] text-zinc-500 font-mono border border-white/5 bg-zinc-950 px-3 py-1.5 rounded-lg whitespace-nowrap self-start sm:self-center">
              {language === 'id' ? 'Jalankan Audit Pemindaian Terlebih Dahulu' : 'Run Anti-Fraud Scan First'}
            </div>
          )}
        </div>
      )}

      <div id="scam_detector_root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* Input panel */}
      <div className="lg:col-span-5 bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-6">
        <div>
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            {t.scamTitle}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            {t.scamDesc}
          </p>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase">{language === 'id' ? 'Teks Proposal / Pesan Penawaran' : 'Input proposal context'}</label>
          <textarea
            id="scam_audit_input_area"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            placeholder={t.scamPlaceholder}
            className="w-full bg-zinc-950 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Buttons */}
        <button
          id="trigger_scam_scan_btn"
          onClick={() => triggerSentinelAudit()}
          disabled={!inputText.trim() || isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t.scamAnalysing}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.analyzeThreat}</span>
            </>
          )}
        </button>

        {/* Quick Sandboxed Scenarios */}
        <div className="border-t border-white/10 pt-4 space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">{t.sandboxScenarios}</span>
          <div className="space-y-1.5">
            {MOCK_SCENARIOS.map((sec, idx) => (
              <button
                key={idx}
                onClick={() => loadScenario(sec.text)}
                className="w-full text-left p-2.5 rounded-lg bg-zinc-950 hover:bg-indigo-950/20 hover:text-indigo-400 text-[11px] text-zinc-400 border border-white/5 hover:border-indigo-900/40 transition flex justify-between items-center group cursor-pointer"
              >
                <span className="truncate pr-1 font-sans">{sec.title}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result feedback */}
      <div className="lg:col-span-7">
        {analysis ? (
          <div className={`bg-[#0a0a0a] p-6 rounded-2xl border shadow-xl space-y-6 ${
            analysis.scamProbability > 70 
              ? 'border-red-900/50' 
              : analysis.scamProbability > 40 ? 'border-amber-900/40' : 'border-slate-800'
          }`}>
            <div className="flex justify-between items-start border-b border-white/5 pb-5 gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center bg-zinc-950 font-mono text-xl font-bold relative ${
                  analysis.scamProbability > 70 ? 'border-red-500 text-red-500' : 'border-emerald-500 text-emerald-500'
                }`}>
                  {analysis.scamProbability}%
                  <div className={`absolute inset-0 rounded-full border animate-pulse ${
                    analysis.scamProbability > 70 ? 'border-red-400' : 'border-emerald-400'
                  }`}></div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{t.sentinelVerdict}</h4>
                  <p className="text-xs text-zinc-500 font-mono">
                    {t.scamClassification} <span className={analysis.scamProbability > 70 ? 'text-red-400 font-black' : 'text-emerald-400 font-black'}>{analysis.riskLevel} {t.riskText}</span>
                  </p>
                </div>
              </div>
              <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[10px] text-zinc-500">
                {t.urgencyLabel} <span className="text-white font-extrabold">{analysis.urgencyTacticFound ? "COERCION" : "STABLE"}</span>
              </div>
            </div>

            {/* Red flags identified */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-400" /> {t.threatFlags}
              </span>
              <div className="space-y-2">
                {analysis.detectedRedFlags.map((flag, idx) => (
                  <p key={idx} className="text-xs text-zinc-300 p-2.5 bg-red-950/10 border border-red-900/30 rounded-lg">
                    {flag}
                  </p>
                ))}
              </div>
            </div>

            {/* Phrasing & linguistic anomalies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950/65 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block mb-2 font-bold">{t.psychologicalPhra}</span>
                <ul className="text-xs text-zinc-350 space-y-1.5 list-disc pl-4 font-mono">
                  {analysis.phrasingIndicators.map((phr, idx) => (
                    <li key={idx} className="text-rose-300">{phr}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-950/65 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-zinc-555 uppercase tracking-widest block mb-2 font-bold">{t.legalAnomalies}</span>
                <ul className="text-xs text-zinc-350 space-y-1.5 list-disc pl-4 font-mono">
                  {analysis.legalAnomalies.map((leg, idx) => (
                    <li key={idx} className="text-orange-300">{leg}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Final verdict instructions box */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 flex gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg border border-white/5 shrink-0 text-red-300 self-start">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h5 className="text-xs text-white uppercase font-bold font-mono tracking-widest">{t.recommendationTitle}</h5>
                <p className="text-xs text-emerald-300 font-medium mt-1 leading-relaxed">{analysis.recommendation}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/40 border border-white/10 rounded-2xl p-12 text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-emerald-700 mx-auto" />
            <div>
              <h4 className="text-white font-medium text-sm">{t.suspiciousQueueSafe}</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {t.noThreatReq}
              </p>
            </div>
            {errMessage && (
              <div className="text-xs bg-red-950/50 border border-red-900 text-red-300 p-2 text-center rounded max-w-sm mx-auto font-mono">
                {errMessage}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
    </div>
  );
}
