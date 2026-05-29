/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { 
  Compass, Landmark, Sparkles, Sliders, RefreshCw, 
  HelpCircle, AlertCircle, TrendingUp, Cpu 
} from 'lucide-react';
import { FutureProjectionReport, UserPreferences, SimulationResult } from '../types';
import { Language } from '../data/translations';

interface FutureSimProps {
  preferences: UserPreferences;
  onChangePreferences: (prefs: Partial<UserPreferences>) => void;
  language: Language;
  t: any;
  activeQuestInProgressId?: string | null;
  onCompleteQuest?: (questId: string) => void;
}

export default function FutureSimulatorView({ 
  preferences, 
  onChangePreferences, 
  language, 
  t,
  activeQuestInProgressId,
  onCompleteQuest
}: FutureSimProps) {
  const [targetAge, setTargetAge] = useState(55);
  const [currentAge, setCurrentAge] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<FutureProjectionReport | null>(null);

  const calculateInterestsLocally = (
    cAge: number, 
    tAge: number, 
    initSaved: number, 
    monthlyInv: number, 
    risk: 'conservative' | 'moderate' | 'aggressive'
  ): FutureProjectionReport => {
    const years = Math.max(1, tAge - cAge);
    const intervals = 10;
    const intervalYears = Math.max(1, Math.round(years / intervals));

    let rates = { conservative: 0.04, expected: 0.07, optimistic: 0.10 };
    if (risk === 'conservative') {
      rates = { conservative: 0.03, expected: 0.05, optimistic: 0.07 };
    } else if (risk === 'aggressive') {
      rates = { conservative: 0.05, expected: 0.09, optimistic: 0.14 };
    }

    const compiledChart: SimulationResult[] = [];
    
    for (let i = 0; i <= intervals; i++) {
       const relativeYr = i * intervalYears;
       const months = relativeYr * 12;

       const calcProjection = (rate: number) => {
         const monthlyRate = rate / 12;
         const compoundPrincipal = initSaved * Math.pow(1 + monthlyRate, months);
         let compoundAnnuity = 0;
         if (monthlyRate > 0) {
           compoundAnnuity = monthlyInv * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
         } else {
           compoundAnnuity = monthlyInv * months;
         }
         return Math.round(compoundPrincipal + compoundAnnuity);
       };

       compiledChart.push({
         year: relativeYr,
         conservativeProjection: calcProjection(rates.conservative),
         expectedProjection: calcProjection(rates.expected),
         optimisticProjection: calcProjection(rates.optimistic)
       });
    }

    const finalExpected = compiledChart[compiledChart.length - 1].expectedProjection;
    const riskAversionLabel = risk === 'aggressive' ? "Aggressive Bull Core" : risk === 'moderate' ? "Balanced Horizon" : "Treasury Defended Guard";

    const strategicAdviceId = `Pemodelan bunga majemuk dihitung dalam rentang waktu ${years} tahun menggunakan strategi ${risk === 'aggressive' ? 'Agresif Berbunga Tinggi' : risk === 'moderate' ? 'Moderat Seimbang' : 'Konservatif Amankan Modal'}. Dengan memanfaatkan pertumbuhan indeks kumulatif multi-dekade, Anda dapat melipatgandakan dana dingin secara konsisten. Meminimalkan biaya bocor di luar akan mempercepat kebebasan finansial Anda secara eksponensial.`;
    const strategicAdviceEn = `Compounding modeling calculated over a ${years}-year timespan using the ${riskAversionLabel} blueprint. Leveraging multi-decade index growth enables young accumulators to build self-sovereign buffer portfolios. By expanding monthly surplus contributions to offset standard lifestyle leakages, you increase chances of financial freedom.`;

    const strategicAdvice = language === 'id' ? strategicAdviceId : strategicAdviceEn;

    const milestones = language === 'id' ? [
      { age: Math.round(cAge + years * 0.25), title: "Tabungan Darurat Utama Terbuka", netWorth: compiledChart[2]?.expectedProjection || 12000 },
      { age: Math.round(cAge + years * 0.5), title: "Pencapaian Akumulasi Tengah Jalan", netWorth: compiledChart[5]?.expectedProjection || 100000 },
      { age: tAge, title: "Dana Impian Hari Tua Mandiri", netWorth: finalExpected }
    ] : [
      { age: Math.round(cAge + years * 0.25), title: "Core Liquid Buffer Secured", netWorth: compiledChart[2]?.expectedProjection || 12000 },
      { age: Math.round(cAge + years * 0.5), title: "First $100K Threshold Crossed", netWorth: compiledChart[5]?.expectedProjection || 100000 },
      { age: tAge, title: "Self-Sovereign Freedom Goal", netWorth: finalExpected }
    ];

    return {
      currentAge: cAge,
      targetAge: tAge,
      projectedNetWorth: finalExpected,
      monthlyInvestmentNeeded: Math.round(monthlyInv * 1.15),
      probabilityOfSuccess: Math.round(Math.min(95, 45 + (monthlyInv / 55) + (years * 1.2))),
      strategicAdvice,
      milestones,
      chartData: compiledChart
    };
  };

  const triggerSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/simulate-future', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: preferences,
          goals: [
            { id: 'sim-1', name: 'Retirement Horizon', targetAmount: 1000000, currentSaved: preferences.currentSavings, targetYear: new Date().getFullYear() + (targetAge - currentAge), category: 'retirement' }
          ],
          simulationYears: targetAge - currentAge
        })
      });

      if (!response.ok) {
        throw new Error('Fallback active');
      }

      const reportData: FutureProjectionReport = await response.json();
      setReport(reportData);
    } catch (err: any) {
      console.warn(err);
      // Fallback local calculations
      const fallbackReport = calculateInterestsLocally(
        currentAge, 
        targetAge, 
        preferences.currentSavings, 
        preferences.monthlyInvestment, 
        preferences.riskAppetite
      );
      setReport(fallbackReport);
    } finally {
      setIsLoading(false);
    }
  };

  // Run calculation immediately on load if no report present
  if (!report && !isLoading) {
    const initReport = calculateInterestsLocally(
      currentAge, 
      targetAge, 
      preferences.currentSavings, 
      preferences.monthlyInvestment, 
      preferences.riskAppetite
    );
    setReport(initReport);
  }

  const riskOptions = ['conservative', 'moderate', 'aggressive'] as const;

  return (
    <div className="space-y-6 font-sans">
      {/* Active Quest Banner */}
      {activeQuestInProgressId === 'quest-3' && (
        <div className="bg-amber-500/5 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.05)] animate-fade-in">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500 text-black font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              <Sparkles className="w-3 h-3 animate-spin" />
              {language === 'id' ? 'MISI AKTIF BERJALAN' : 'ACTIVE QUEST'}
            </span>
            <h4 className="text-xs font-bold text-white mt-1 uppercase tracking-tight font-mono">
              {language === 'id' ? 'Simulasikan & Kalibrasi Model Masa Depan Anda!' : 'Project and Calibrate Your Future Financial Horizons!'}
            </h4>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
              {language === 'id' 
                ? 'Misi dimulai! Silakan sesuaikan target umur pensiun atau kekayaan Anda pada rentang kontrol slider di bawah lalu jalankan atau perbarui simulasi proyeksi demi mengklaim 550 XP.'
                : 'Active Quest Started! Adjust the sliders, test high or low risk allocations, then trigger the trajectory simulator to calibrate your retirement path and secure 550 XP.'}
            </p>
          </div>
          {onCompleteQuest && (
            <button
              id="claim_simulated_quest_rewards_btn"
              onClick={() => {
                onCompleteQuest('quest-3');
                alert(language === 'id' 
                  ? 'Selamat! Misi Selesai! Model masa depan berhasil diseimbangkan, Anda mendapatkan tambahan 550 XP!' 
                  : 'Congratulations! Model calibrated perfectly. 555 XP has been credited successfully!'
                );
              }}
              className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold rounded-xl transition cursor-pointer self-start sm:self-center uppercase"
            >
              {language === 'id' ? 'Verifikasi & Selesaikan Misi' : 'Verify & Claim XP'}
            </button>
          )}
        </div>
      )}

      <div id="future_sim_root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">

      {/* Control sliders */}
      <div className="lg:col-span-4 bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-5">
        <div>
          <h3 className="font-semibold text-white text-base flex items-center gap-2 font-mono">
            <Sliders className="w-5 h-5 text-indigo-400" />
            {t.simParameters}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">{t.simDesc}</p>
        </div>

        {/* Current Age */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-500">{t.currentAgeLabel}</span>
            <span className="text-white font-bold">{currentAge} {language === 'id' ? 'Tahun' : 'Years'}</span>
          </div>
          <input 
            id="sim_slider_current_age"
            type="range"
            min={16}
            max={65}
            value={currentAge}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setCurrentAge(val);
              if (targetAge <= val) {
                setTargetAge(val + 5);
              }
            }}
            className="w-full h-1.5 rounded-lg bg-zinc-950 appearance-none pointer-events-auto accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Target Freedom Age */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-500">{t.targetFreedomLabel}</span>
            <span className="text-white font-bold">{targetAge} {language === 'id' ? 'Tahun' : 'Years'}</span>
          </div>
          <input 
            id="sim_slider_target_age"
            type="range"
            min={currentAge + 5}
            max={90}
            value={targetAge}
            onChange={(e) => setTargetAge(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-zinc-950 appearance-none pointer-events-auto accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Current Liquid Savings */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-500">{t.currentAssetLabel}</span>
            <span className="text-teal-400 font-bold">{preferences.currency}{preferences.currentSavings.toLocaleString()}</span>
          </div>
          <input 
            id="sim_slider_liquid_savings"
            type="range"
            min={0}
            max={500000}
            step={5000}
            value={preferences.currentSavings}
            onChange={(e) => onChangePreferences({ currentSavings: parseInt(e.target.value) })}
            className="w-full h-1.5 rounded-lg bg-zinc-950 appearance-none pointer-events-auto accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Monthly Investment Rate */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-500">{t.monthlySurplusLabel}</span>
            <span className="text-indigo-400 font-bold">{preferences.currency}{preferences.monthlyInvestment.toLocaleString()} / bln</span>
          </div>
          <input 
            id="sim_slider_monthly_rate"
            type="range"
            min={0}
            max={10000}
            step={100}
            value={preferences.monthlyInvestment}
            onChange={(e) => onChangePreferences({ monthlyInvestment: parseInt(e.target.value) })}
            className="w-full h-1.5 rounded-lg bg-zinc-950 appearance-none pointer-events-auto accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Risk appetite list selection */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-500 uppercase font-bold">{t.strategicRiskProfile}</label>
          <div className="grid grid-cols-3 gap-2">
            {riskOptions.map((r) => (
              <button
                key={r}
                id={`risk_selector_btn_${r}`}
                onClick={() => onChangePreferences({ riskAppetite: r })}
                className={`py-2 text-[10px] font-mono font-bold uppercase rounded-lg border transition cursor-pointer ${
                  preferences.riskAppetite === r 
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500/30 shadow-md' 
                    : 'bg-zinc-950/50 text-zinc-500 border-white/5 hover:text-white'
                }`}
              >
                {r === 'conservative' ? (language === 'id' ? 'Senggang' : 'Conserv') : r === 'moderate' ? (language === 'id' ? 'Sedang' : 'Moderat') : (language === 'id' ? 'Agresif' : 'Aggress')}
              </button>
            ))}
          </div>
        </div>

        {/* Run compute */}
        <button
          id="simulate_btn"
          onClick={triggerSimulation}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t.simulatingFuture}</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              <span>{t.recalcProjections}</span>
            </>
          )}
        </button>

      </div>

      {/* Analytics outputs Area */}
      <div className="lg:col-span-8 space-y-6">

        {report && (
          <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-5">
            
            {/* Future forecast header stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-white/5 pb-5">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">{t.estimatedFreedomVault}</span>
                <h4 className="text-xl font-bold text-teal-400 mt-1 font-mono">
                  {preferences.currency}{report.projectedNetWorth.toLocaleString()}
                </h4>
                <p className="text-[10px] text-zinc-500 font-sans mt-0.5">{t.projectedAge} {report.targetAge}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">{t.successRate}</span>
                <div className="flex items-center gap-2 mt-1">
                  <h4 className="text-xl font-bold text-white font-mono">
                    {report.probabilityOfSuccess}%
                  </h4>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-black font-mono ${report.probabilityOfSuccess >= 70 ? 'bg-emerald-950 border border-emerald-900/50 text-emerald-400' : 'bg-orange-950 border border-orange-900/50 text-orange-400'}`}>
                    {report.probabilityOfSuccess >= 70 ? 'STRONG' : 'MUTABLE'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-sans mt-0.5">{t.monteCarlo}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">{t.nextTierTarget}</span>
                <h4 className="text-xl font-bold text-indigo-400 mt-1 font-mono">
                  {preferences.currency}{report.monthlyInvestmentNeeded.toLocaleString()} / bln
                </h4>
                <p className="text-[10px] text-zinc-500 font-sans mt-0.5">{t.suggestedBaseline}</p>
              </div>
            </div>

            {/* Recharts chart canvas */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">{t.growthEnvelope}</span>
              <div id="chart_canvas_box" className="h-[240px] w-full text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={report.chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1c1c1e" strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#475569" 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => language === 'id' ? `Thn ${val}` : `Yr ${val}`} 
                    />
                    <YAxis 
                      stroke="#475569" 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `${preferences.currency}${(val / 1000).toLocaleString()}K`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#050505', borderColor: '#1c1c1e', borderRadius: '8px' }} 
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(val: any) => [`${preferences.currency}${val.toLocaleString()}`, 'Portfolio']}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Area 
                      type="monotone" 
                      name={language === 'id' ? 'Skenario Agresif' : 'Bull Outlook'} 
                      dataKey="optimisticProjection" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorOpt)" 
                    />
                    <Area 
                      type="monotone" 
                      name={language === 'id' ? 'Skenario Seimbang' : 'Expected Horizon'} 
                      dataKey="expectedProjection" 
                      stroke="#6366f1" 
                      fillOpacity={1} 
                      fill="url(#colorExp)" 
                    />
                    <Area 
                      type="monotone" 
                      name={language === 'id' ? 'Batas Lindung Modal' : 'Bear Protection'} 
                      dataKey="conservativeProjection" 
                      stroke="#f43f5e" 
                      fill="none" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategic milestone points */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block flex items-center gap-1.5 font-bold">
                <Landmark className="w-4 h-4 text-indigo-400" /> {t.milestoneThresholds}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {report.milestones.map((ms, index) => (
                  <div key={index} className="bg-zinc-950 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold">{t.ageCheckpoint} {ms.age}</span>
                    <h5 className="text-white text-xs font-medium truncate mt-1">{ms.title}</h5>
                    <span className="text-xs text-teal-400 font-mono font-bold block mt-1">
                      {preferences.currency}{ms.netWorth.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Advice with CPU Icon */}
            <div className="p-4 bg-zinc-950/70 border border-white/5 rounded-xl flex gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-teal-400 shrink-0 self-start">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-xs text-zinc-300 leading-relaxed font-sans">
                <strong>{t.strategicAlignment}</strong> {report.strategicAdvice}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
    </div>
  );
}
