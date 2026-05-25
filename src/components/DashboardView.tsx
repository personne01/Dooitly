/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, ShieldAlert, Award, Star, AppWindow, 
  HelpCircle, CreditCard, ChevronRight, CheckCircle2, Search, Sparkles, RefreshCw, Trash2, PlusCircle
} from 'lucide-react';
import { Transaction, FinancialGoal, UserPreferences, InvestmentExplanation, MonthlyRecap } from '../types';
import { FINTECH_QUESTS } from '../data/mockTransactions';
import { Language } from '../data/translations';

interface DashProps {
  preferences: UserPreferences;
  transactions: Transaction[];
  goals: FinancialGoal[];
  onChangePreferences: (prefs: Partial<UserPreferences>) => void;
  onNavigateToTab: (tabId: string) => void;
  onAddGoal: (name: string, targetAmount: number, currentSaved: number, targetYear: number, category: any) => void;
  onDeleteGoal: (goalId: string) => void;
  language: Language;
  t: any;
  monthlyRecaps: MonthlyRecap[];
  onAddMonthlyRecap: (recap: Omit<MonthlyRecap, 'id'>) => void;
  onApplyMonthlyRecap: (recap: MonthlyRecap) => void;
  onDeleteMonthlyRecap: (recapId: string) => void;
}

export default function DashboardView({ 
  preferences, 
  transactions, 
  goals, 
  onChangePreferences, 
  onNavigateToTab,
  onAddGoal,
  onDeleteGoal,
  language,
  t,
  monthlyRecaps,
  onAddMonthlyRecap,
  onApplyMonthlyRecap,
  onDeleteMonthlyRecap
}: DashProps) {
  const [activeQuests, setActiveQuests] = useState(FINTECH_QUESTS);
  const [tickerSearch, setTickerSearch] = useState('');
  const [isLoadingTicker, setIsLoadingTicker] = useState(false);
  const [tickerReport, setTickerReport] = useState<InvestmentExplanation | null>(null);

  // Goal Form Fields
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalCurrentSaved, setGoalCurrentSaved] = useState('');
  const [goalTargetYear, setGoalTargetYear] = useState('2030');
  const [goalCategory, setGoalCategory] = useState<'housing' | 'retirement' | 'travel' | 'investment' | 'other'>('investment');

  // Preference Settings editing state
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [editSavings, setEditSavings] = useState(preferences.currentSavings.toString());
  const [editIncome, setEditIncome] = useState(preferences.monthlyIncome.toString());
  const [editInvestment, setEditInvestment] = useState(preferences.monthlyInvestment.toString());
  const [editRisk, setEditRisk] = useState(preferences.riskAppetite);

  // Monthly Recap Form Fields
  const [isAddingRecap, setIsAddingRecap] = useState(false);
  const [recapMonthYear, setRecapMonthYear] = useState('');
  const [recapIncome, setRecapIncome] = useState('');
  const [recapExpense, setRecapExpense] = useState('');
  const [recapSavings, setRecapSavings] = useState('');
  const [recapInvestment, setRecapInvestment] = useState('');

  const handleCreateRecap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recapMonthYear) return;
    onAddMonthlyRecap({
      monthYear: recapMonthYear,
      monthlyIncome: parseFloat(recapIncome) || 0,
      monthlyExpense: parseFloat(recapExpense) || 0,
      currentSavings: parseFloat(recapSavings) || 0,
      monthlyInvestment: parseFloat(recapInvestment) || 0,
    });
    setRecapMonthYear('');
    setRecapIncome('');
    setRecapExpense('');
    setRecapSavings('');
    setRecapInvestment('');
    setIsAddingRecap(false);
  };

  const handleAutoFillActiveData = () => {
    const date = new Date();
    const months = language === 'id' 
      ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    setRecapMonthYear(`${months[date.getMonth()]} ${date.getFullYear()}`);
    setRecapIncome(preferences.monthlyIncome.toString());
    setRecapExpense(totalExpense.toString());
    setRecapSavings(preferences.currentSavings.toString());
    setRecapInvestment(preferences.monthlyInvestment.toString());
  };

  const levelXP = 3450;
  const levelXPMax = 5000;
  const currentLevel = 14;

    const HelpTooltip = ({ text }: { text: string }) => (
      <div className="relative group inline-block">
        <HelpCircle className="w-3 h-3 text-zinc-600 inline ml-1 cursor-help" />
        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-black border border-white/10 rounded text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 font-sans pointer-events-none">
          {text}
        </div>
      </div>
    );

  const handleQuestCompletion = (id: string) => {
    setActiveQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'completed' } : q));
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onChangePreferences({
      currentSavings: parseFloat(editSavings) || 0,
      monthlyIncome: parseFloat(editIncome) || 0,
      monthlyInvestment: parseFloat(editInvestment) || 0,
      riskAppetite: editRisk
    });
    setIsEditingPreferences(false);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTargetAmount) return;
    onAddGoal(
      goalName,
      parseFloat(goalTargetAmount) || 0,
      parseFloat(goalCurrentSaved) || 0,
      parseInt(goalTargetYear) || 2030,
      goalCategory
    );
    setGoalName('');
    setGoalTargetAmount('');
    setGoalCurrentSaved('');
    setIsAddingGoal(false);
  };

  const handleExplainAsset = async () => {
    if (!tickerSearch.trim() || isLoadingTicker) return;
    setIsLoadingTicker(true);
    setTickerReport(null);
    try {
      const response = await fetch('/api/gemini/explain-investment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetName: tickerSearch,
          riskAppetite: preferences.riskAppetite
        })
      });

      if (!response.ok) {
        throw new Error('Explainer lost sync with intelligence network');
      }

      const data: InvestmentExplanation = await response.json();
      setTickerReport(data);
    } catch (err: any) {
      console.error(err);
      // Graceful local translation fallback for asset audit
      if (language === 'id') {
        setTickerReport({
          assetClass: "Ekuitas Indeks Diversifikasi",
          explanationPlainEnglish: `Indeks pelacak portofolio terbuka yang mengikuti pergerakan perusahaan-perusahaan berkapitalisasi besar. Sangat stabil untuk pemupukan akumulasi dana majemuk jangka panjang (10-30 tahun).`,
          riskRewardProfile: "Fluktuasi pasar saham sedang. Sedikit terdampak penurunan ekonomi jangka pendek, namun menghasilkan imbal hasil jauh melampaui tabungan biasa.",
          targetAllocationPercentage: 35,
          historicalVolatilityLabel: "Sedang",
          pros: ["Keamanan indeks terdistribusi", "Penyeimbangan otomatis berkala"],
          cons: ["Dipengaruhi kontraksi inflasi makro"],
          suitabilityDecision: `Cocok untuk profil risiko Anda (${preferences.riskAppetite.toUpperCase()}). Disarankan alokasi 35% dari surplus kas.`
        });
      } else {
        setTickerReport({
          assetClass: "Diversified Equities Pool",
          explanationPlainEnglish: `Standard compilation tracks public indices containing major corporate holdings. Highly robust for individuals accumulating passive returns over 10-30 years continuously.`,
          riskRewardProfile: "Balanced stock fluctuations. Vulnerable to general bear pullbacks but builds substantial interest compared to liquid retail savings.",
          targetAllocationPercentage: 35,
          historicalVolatilityLabel: "Moderate",
          pros: ["Broad index safety", "Automatic quarterly rebalancing"],
          cons: ["Vulnerable to rapid inflation contractions"],
          suitabilityDecision: `Matches your current profile (${preferences.riskAppetite.toUpperCase()}) perfectly. Suggested allocation is 35% of surplus.`
        });
      }
    } finally {
      setIsLoadingTicker(false);
    }
  };

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, current) => sum + current.amount, 0);

  return (
    <div id="dash_view_root" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* HUD left core variables column */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Monthly Data Recapitulation Ledger */}
        <div id="monthly_recaps_ledger" className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-4 font-sans">
          <div className="flex justify-between items-center font-mono">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                {language === 'id' ? 'REKAPITULASI DATA BULANAN' : 'MONTHLY FINANCIAL RECAPS'}
              </h4>
              <span className="text-[10px] text-zinc-500">
                {language === 'id' ? 'Simpan rekaman agregat bulanan & pasangkan sebagai input dasar' : 'Archive monthly summaries & recall them as your active workspace inputs'}
              </span>
            </div>
            <button
              id="add_recap_toggle_btn"
              onClick={() => {
                setIsAddingRecap(!isAddingRecap);
                if (!isAddingRecap) {
                  handleAutoFillActiveData();
                }
              }}
              className="py-1 px-3 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-mono flex items-center gap-1 hover:bg-indigo-500/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isAddingRecap ? (language === 'id' ? 'Tutup' : 'Close') : (language === 'id' ? '+ Tambah Rekap' : '+ Add Recap')}</span>
            </button>
          </div>

          {/* New Recap submission form */}
          {isAddingRecap && (
            <form onSubmit={handleCreateRecap} className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3.5 text-xs animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  {language === 'id' ? 'Simpan Catatan Baru' : 'Record New Monthly Summary'}
                </h5>
                <button
                  type="button"
                  onClick={handleAutoFillActiveData}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 border border-white/5 rounded text-[10px] text-zinc-400 font-mono transition"
                >
                  {language === 'id' ? 'Ambil Data Aktif Saat Ini' : 'Snapshot Current Active Data'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Bulan & Tahun' : 'Month & Year'}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mei 2026"
                    value={recapMonthYear}
                    onChange={e => setRecapMonthYear(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Pemasukan' : 'Income'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={recapIncome}
                    onChange={e => setRecapIncome(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Pengeluaran' : 'Expenses'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={recapExpense}
                    onChange={e => setRecapExpense(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Tabungan Akhir' : 'Final Savings'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={recapSavings}
                    onChange={e => setRecapSavings(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Alokasi Investasi' : 'Invest Rate'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={recapInvestment}
                    onChange={e => setRecapInvestment(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg transition text-xs font-mono"
              >
                {language === 'id' ? 'SIMPAN REKAPITULASI DATA' : 'STORE MONTHLY RECAP DATA'}
              </button>
            </form>
          )}

          {/* List of saved recaps */}
          {monthlyRecaps.length === 0 ? (
            <div className="text-center p-6 bg-zinc-950/30 border border-dashed border-white/5 text-zinc-500 rounded-xl text-xs">
              {language === 'id' 
                ? 'Belum ada data rekapitulasi bulanan tersimpan. Klik "+ Tambah Rekap" di atas untuk mulai menginput.' 
                : 'No historical monthly summaries recorded yet. Fill a sheet or snapshot current stats to start.'}
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyRecaps.map(recap => (
                <div key={recap.id} className="p-4 bg-zinc-950/50 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition hover:border-white/15">
                  <div className="space-y-1">
                    <span className="text-teal-400 font-bold font-mono text-sm block">
                      {recap.monthYear}
                    </span>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[10px] font-mono text-zinc-400">
                      <div>
                        {language === 'id' ? 'Pemasukan:' : 'Income:'}{" "}
                        <strong className="text-white">{preferences.currency}{recap.monthlyIncome.toLocaleString()}</strong>
                      </div>
                      <div>
                        {language === 'id' ? 'Pengeluaran:' : 'Spend:'}{" "}
                        <strong className="text-rose-400">-{preferences.currency}{recap.monthlyExpense.toLocaleString()}</strong>
                      </div>
                      <div>
                        {language === 'id' ? 'Tabungan:' : 'Savings:'}{" "}
                        <strong className="text-teal-400">{preferences.currency}{recap.currentSavings.toLocaleString()}</strong>
                      </div>
                      <div>
                        {language === 'id' ? 'Investasi:' : 'Invested:'}{" "}
                        <strong className="text-indigo-400">{preferences.currency}{recap.monthlyInvestment.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyMonthlyRecap(recap);
                        alert(language === 'id' 
                          ? `Data untuk ${recap.monthYear} berhasil diterapkan ke dashboard aktif!`
                          : `Successfully applied ${recap.monthYear} metrics as active dashboard parameters!`
                        );
                      }}
                      className="py-1.5 px-3 bg-teal-950 text-teal-300 border border-teal-900 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-teal-900 hover:text-white transition duration-150 cursor-pointer"
                      title={language === 'id' ? 'Terapkan data bulanan ke dashboard' : 'Apply monthly data to dashboard'}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{language === 'id' ? 'Gunakan Data Ini' : 'Load Data'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMonthlyRecap(recap.id)}
                      className="p-1.5 bg-rose-950/30 border border-rose-900/30 text-rose-400 hover:bg-rose-900 transition-all rounded-lg cursor-pointer animate-fade-in"
                      title={t.deleteBtn}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Futuristic Dashboard Header cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between relative">
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                {t.selfSovereignAssets}
                <HelpTooltip text={language === 'id' ? 'Semua tabungan dan aset likuid yang Anda miliki saat ini.' : 'Current sum of allあなたの personal liquid savings and asset holdings.'} />
              </span>
              <h3 className="text-2xl font-bold font-mono text-teal-400">
                {preferences.currency}{preferences.currentSavings.toLocaleString()}
              </h3>
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-3 border-t border-white/5 mt-4">
              <span>{t.primaryCompoundPool}</span>
              <span className="text-emerald-400 font-bold font-mono">{t.annualReturn}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between relative">
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                {t.monthlyCompoundContribution}
                <HelpTooltip text={language === 'id' ? 'Dana yang dialokasikan untuk target investasi bulanan Anda.' : 'Monthly funds committed toward your strategic investment goals.'} />
              </span>
              <h3 className="text-2xl font-bold font-mono text-indigo-400">
                {preferences.currency}{preferences.monthlyInvestment.toLocaleString()}
              </h3>
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-3 border-t border-white/5 mt-4">
              <span>{t.surplusTargetAllocation}</span>
              <span className="text-indigo-400 font-bold font-mono">{t.activeTarget}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between relative">
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                {t.monthlyCashMargin}
                <HelpTooltip text={`${language === 'id' ? 'Pemasukan - Pengeluaran. Surplus untuk tabungan/investasi. ' : 'Income - Expenses. The remaining surplus designated for savings/invest. '} (Calc: ${preferences.currency}${preferences.monthlyIncome.toLocaleString()} - ${preferences.currency}${totalExpense.toLocaleString()})`} />
              </span>
              <h3 className="text-2xl font-bold font-mono text-rose-400">
                {preferences.currency}{(preferences.monthlyIncome - totalExpense).toLocaleString()}
              </h3>
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-3 border-t border-white/5 mt-4">
              <span>{t.expensesTrackedBuffer}</span>
              <span className="text-rose-400 font-bold font-mono">{t.activeTracking}</span>
            </div>
          </div>

        </div>

        {/* Adjust wealth variables inline */}
        <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {language === 'id' ? 'KONFIGURASI DATA SAYA' : 'MY FINANCIAL INPUT DESK'}
              </h4>
              <p className="text-[10px] text-zinc-500 mt-1">
                {language === 'id' ? 'Sesuaikan jumlah tabungan Anda sendiri untuk simulasi akurat' : 'Customize values safely. No dummy defaults, input your actual liquid balance.'}
              </p>
            </div>
            <button
              id="toggle_preferences_edit"
              onClick={() => {
                setEditSavings(preferences.currentSavings.toString());
                setEditIncome(preferences.monthlyIncome.toString());
                setEditInvestment(preferences.monthlyInvestment.toString());
                setEditRisk(preferences.riskAppetite);
                setIsEditingPreferences(!isEditingPreferences);
              }}
              className="py-1 px-3 bg-indigo-950 text-indigo-300 border border-indigo-900 rounded-lg text-xs font-mono hover:bg-indigo-900 transition-all cursor-pointer"
            >
              {isEditingPreferences ? (language === 'id' ? 'Batal' : 'Cancel') : (language === 'id' ? 'Ubah Data' : 'Adjust Data')}
            </button>
          </div>

          {isEditingPreferences && (
            <form onSubmit={handleSavePreferences} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5 animate-fade-in text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-mono">{t.savedToDate}</label>
                <input
                  type="number"
                  value={editSavings}
                  onChange={e => setEditSavings(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Pemasukan Bulanan' : 'Monthly Income'}</label>
                <input
                  type="number"
                  value={editIncome}
                  onChange={e => setEditIncome(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Investasi Bulanan' : 'Monthly Invest'}</label>
                <input
                  type="number"
                  value={editInvestment}
                  onChange={e => setEditInvestment(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-mono">{t.strategicRiskProfile}</label>
                <select
                  value={editRisk}
                  onChange={e => setEditRisk(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              <button
                type="submit"
                className="col-span-2 sm:col-span-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg transition"
              >
                {language === 'id' ? 'Terapkan Perubahan' : 'Apply Financial Snapshot'}
              </button>
            </form>
          )}
        </div>

        {/* Level & XP RPG Gamified UI Bar */}
        <div id="gamified_xp_bar" className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <div>
                <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">{t.financialSecurityTier}</h4>
                <p className="text-[10px] text-zinc-500">Class: <span className="text-indigo-300 font-medium font-sans">{t.securityClass}</span></p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-white">Lvl {currentLevel}</span>
              <p className="text-[9px] text-zinc-500 font-mono">{levelXP} / {levelXPMax} XP</p>
            </div>
          </div>
          <div className="w-full bg-[#050505] h-2 rounded-full border border-white/5 overflow-hidden">
            <div 
              style={{ width: `${(levelXP / levelXPMax) * 100}%` }}
              className="bg-gradient-to-r from-indigo-500 to-rose-500 h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Interactive Asset Explanation Ticker Search Desk */}
        <div id="ticker_explainer_desk" className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" /> {t.assetExplainerTitle}
            </h4>
            <p className="text-xs text-zinc-500 mt-1">{t.assetExplainerDesc}</p>
          </div>
          <div className="flex gap-2">
            <input 
              id="asset_search_input"
              type="text"
              value={tickerSearch}
              onChange={(e) => setTickerSearch(e.target.value)}
              placeholder={t.assetExplainerPlaceholder}
              className="flex-1 bg-zinc-950 border border-white/10 text-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 placeholder-zinc-650"
            />
            <button 
              id="asset_explain_btn"
              onClick={handleExplainAsset}
              disabled={!tickerSearch.trim() || isLoadingTicker}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isLoadingTicker ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.explaining}</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>{t.explainBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Asset Explanation Report */}
          {tickerReport && (
            <div id="ticker_diagnostic_card" className="p-5 bg-black/40 rounded-xl border border-white/5 space-y-4 animate-fade-in">
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <h5 className="font-bold text-xs font-mono uppercase text-teal-400">{tickerSearch}</h5>
                  <span className="text-[10px] text-zinc-500">{language === 'id' ? 'Kelas Aset:' : 'Asset Class:'} <strong className="text-white font-medium">{tickerReport.assetClass}</strong></span>
                </div>
                <div className="bg-zinc-900 border border-white/5 px-2.5 py-1 rounded text-right">
                  <span className="text-[9px] text-zinc-500 block uppercase font-mono">{language === 'id' ? 'Usulan Alokasi' : 'Suggested Pool'}</span>
                  <span className="text-xs text-teal-400 font-bold font-mono">{tickerReport.targetAllocationPercentage}%</span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">{tickerReport.explanationPlainEnglish}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans">
                <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-lg">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider block font-bold mb-1.5">{language === 'id' ? 'Keunggulan' : 'Advantages'}</span>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                    {tickerReport.pros.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <div className="p-3 bg-rose-950/10 border border-rose-900/20 rounded-lg">
                  <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider block font-bold mb-1.5">{language === 'id' ? 'Risiko / Sisi Negatif' : 'Risks / Downsides'}</span>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                    {tickerReport.cons.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 p-2 border-t border-white/5 flex justify-between">
                <span>Volatility: <strong className="text-zinc-300">{tickerReport.historicalVolatilityLabel}</strong></span>
                <span className="text-indigo-400 font-semibold">{tickerReport.suitabilityDecision}</span>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Data Recapitulation Ledger */}
        <div id="monthly_recaps_ledger" className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-4 font-sans">
          <div className="flex justify-between items-center font-mono">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                {language === 'id' ? 'REKAPITULASI DATA BULANAN' : 'MONTHLY FINANCIAL RECAPS'}
              </h4>
              <span className="text-[10px] text-zinc-500">
                {language === 'id' ? 'Simpan rekaman agregat bulanan & pasangkan sebagai input dasar' : 'Archive monthly summaries & recall them as your active workspace inputs'}
              </span>
            </div>
            <button
              id="add_recap_toggle_btn"
              onClick={() => {
                setIsAddingRecap(!isAddingRecap);
                if (!isAddingRecap) {
                  handleAutoFillActiveData();
                }
              }}
              className="py-1 px-3 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-mono flex items-center gap-1 hover:bg-indigo-500/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isAddingRecap ? (language === 'id' ? 'Tutup' : 'Close') : (language === 'id' ? '+ Tambah Rekap' : '+ Add Recap')}</span>
            </button>
          </div>

          {/* New Recap submission form */}
          {isAddingRecap && (
            <form onSubmit={handleCreateRecap} className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3.5 text-xs animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  {language === 'id' ? 'Simpan Catatan Baru' : 'Record New Monthly Summary'}
                </h5>
                <button
                  type="button"
                  onClick={handleAutoFillActiveData}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 border border-white/5 rounded text-[10px] text-zinc-400 font-mono transition"
                >
                  {language === 'id' ? 'Ambil Data Aktif Saat Ini' : 'Snapshot Current Active Data'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Bulan & Tahun' : 'Month & Year'}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mei 2026"
                    value={recapMonthYear}
                    onChange={e => setRecapMonthYear(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Pemasukan' : 'Income'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={recapIncome}
                    onChange={e => setRecapIncome(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Pengeluaran' : 'Expenses'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={recapExpense}
                    onChange={e => setRecapExpense(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Tabungan Akhir' : 'Final Savings'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={recapSavings}
                    onChange={e => setRecapSavings(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Alokasi Investasi' : 'Invest Rate'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={recapInvestment}
                    onChange={e => setRecapInvestment(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg transition text-xs font-mono"
              >
                {language === 'id' ? 'SIMPAN REKAPITULASI DATA' : 'STORE MONTHLY RECAP DATA'}
              </button>
            </form>
          )}

          {/* List of saved recaps */}
          {monthlyRecaps.length === 0 ? (
            <div className="text-center p-6 bg-zinc-950/30 border border-dashed border-white/5 text-zinc-500 rounded-xl text-xs">
              {language === 'id' 
                ? 'Belum ada data rekapitulasi bulanan tersimpan. Klik "+ Tambah Rekap" di atas untuk mulai menginput.' 
                : 'No historical monthly summaries recorded yet. Fill a sheet or snapshot current stats to start.'}
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyRecaps.map(recap => (
                <div key={recap.id} className="p-4 bg-zinc-950/50 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition hover:border-white/15">
                  <div className="space-y-1">
                    <span className="text-teal-400 font-bold font-mono text-sm block">
                      {recap.monthYear}
                    </span>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[10px] font-mono text-zinc-400">
                      <div>
                        {language === 'id' ? 'Pemasukan:' : 'Income:'}{" "}
                        <strong className="text-white">{preferences.currency}{recap.monthlyIncome.toLocaleString()}</strong>
                      </div>
                      <div>
                        {language === 'id' ? 'Pengeluaran:' : 'Spend:'}{" "}
                        <strong className="text-rose-400">-{preferences.currency}{recap.monthlyExpense.toLocaleString()}</strong>
                      </div>
                      <div>
                        {language === 'id' ? 'Tabungan:' : 'Savings:'}{" "}
                        <strong className="text-teal-400">{preferences.currency}{recap.currentSavings.toLocaleString()}</strong>
                      </div>
                      <div>
                        {language === 'id' ? 'Investasi:' : 'Invested:'}{" "}
                        <strong className="text-indigo-400">{preferences.currency}{recap.monthlyInvestment.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyMonthlyRecap(recap);
                        alert(language === 'id' 
                          ? `Data untuk ${recap.monthYear} berhasil diterapkan ke dashboard aktif!`
                          : `Successfully applied ${recap.monthYear} metrics as active dashboard parameters!`
                        );
                      }}
                      className="py-1.5 px-3 bg-teal-950 text-teal-300 border border-teal-900 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-teal-900 hover:text-white transition duration-150 cursor-pointer"
                      title={language === 'id' ? 'Terapkan data bulanan ke dashboard' : 'Apply monthly data to dashboard'}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{language === 'id' ? 'Gunakan Data Ini' : 'Load Data'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMonthlyRecap(recap.id)}
                      className="p-1.5 bg-rose-950/30 border border-rose-900/30 text-rose-400 hover:bg-rose-900 transition-all rounded-lg cursor-pointer animate-fade-in"
                      title={t.deleteBtn}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals / Targets Track Grid */}
        <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-4">
          <div className="flex justify-between items-center font-mono">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">{t.compoundedMultiMilestone}</h4>
              <span className="text-[10px] text-zinc-650">{t.dynamicTargetCalibration}</span>
            </div>
            <button
              id="add_goal_toggle_btn"
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className="py-1 px-3 bg-emerald-950 text-emerald-300 border border-emerald-900 rounded-lg text-xs font-mono flex items-center gap-1 hover:bg-emerald-900 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAddingGoal ? (language === 'id' ? 'Sembunyikan' : 'Hide Form') : (language === 'id' ? '+ Tambah Target' : '+ Add Goal')}</span>
            </button>
          </div>

          {/* Goal creator form */}
          {isAddingGoal && (
            <form onSubmit={handleCreateGoal} className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3.5 text-xs animate-fade-in">
              <h5 className="font-semibold text-white">{t.addGoalTitle}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{t.goalName}</label>
                  <input
                    type="text"
                    required
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    placeholder="e.g. Dream Apartment Downpayment"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{t.targetAmount} (USD/Rp)</label>
                  <input
                    type="number"
                    required
                    value={goalTargetAmount}
                    onChange={e => setGoalTargetAmount(e.target.value)}
                    placeholder="75000"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{t.savedToDate}</label>
                  <input
                    type="number"
                    value={goalCurrentSaved}
                    onChange={e => setGoalCurrentSaved(e.target.value)}
                    placeholder="15000"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{t.targetYear}</label>
                  <input
                    type="number"
                    value={goalTargetYear}
                    onChange={e => setGoalTargetYear(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{t.categoryLabel}</label>
                  <select
                    value={goalCategory}
                    onChange={e => setGoalCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="housing">Housing</option>
                    <option value="retirement">Retirement</option>
                    <option value="travel">Travel</option>
                    <option value="investment">Investment/Savings</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-lg transition"
              >
                {t.saveGoal}
              </button>
            </form>
          )}

          {goals.length === 0 ? (
            <div className="text-center p-6 bg-zinc-950/30 border border-dashed border-white/5 text-zinc-500 rounded-xl text-xs">
              {language === 'id' ? 'Belum ada target finansial. Klik "+ Tambah Target" di atas untuk menambahkan milik Anda !' : 'No financial goals yet. Keep your focus high by adding your actual personal goals above!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goals.map(goal => {
                const pct = Math.min(100, Math.round((goal.currentSaved / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} className="p-4 bg-zinc-950/60 rounded-xl border border-white/5 space-y-3 relative group">
                    <button
                      id={`delete_goal_btn_${goal.id}`}
                      onClick={() => onDeleteGoal(goal.id)}
                      className="absolute top-2 right-2 p-1 bg-rose-950/35 border border-rose-900/30 text-rose-400 hover:bg-rose-900 transition-all rounded opacity-0 group-hover:opacity-100 cursor-pointer"
                      title={t.deleteBtn}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{goal.category} horizon</span>
                      <h5 className="text-white text-xs font-semibold truncate mt-1">{goal.name}</h5>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>{language === 'id' ? 'Ada:' : 'Have:'} {preferences.currency}{goal.currentSaved.toLocaleString()}</span>
                        <span>{language === 'id' ? 'Target:' : 'Target:'} {preferences.currency}{goal.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className="bg-teal-400 h-full rounded" />
                      </div>
                      <span className="text-[9px] font-mono text-teal-400 flex justify-between pt-1">
                        <span>{pct}% {language === 'id' ? 'tercapai' : 'secured'}</span>
                        <span>By {goal.targetYear}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Gamification column */}
      <div className="xl:col-span-4 space-y-6">

        {/* Active Quest logs list */}
        <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-emerald-400" /> {t.activeWealthQuests}
            </h4>
            <span className="text-[10px] bg-emerald-950/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-900/40 uppercase font-black tracking-widest animate-pulse font-bold">
              {t.playable}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">{t.questsDesc}</p>
          
          <div className="space-y-3">
            {activeQuests.map(quest => (
              <div key={quest.id} className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 space-y-2 relative group overflow-hidden">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest">{quest.category} Mode</span>
                    <h5 className="font-semibold text-xs text-white mt-1">{quest.title}</h5>
                  </div>
                  <span className="text-[9px] font-mono text-yellow-400 uppercase font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">{quest.xpReward} XP</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{quest.description}</p>
                {quest.status === 'completed' ? (
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-semibold bg-emerald-950/10 border border-emerald-900/30 p-2 rounded-lg justify-center mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.rewardCredited}</span>
                  </div>
                ) : (
                  <button
                    id={`complete_quest_btn_${quest.id}`}
                    onClick={() => handleQuestCompletion(quest.id)}
                    className="w-full text-center py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-xs font-mono font-bold border border-white/10 hover:text-white transition duration-150 cursor-pointer"
                  >
                    {t.resolveQuest}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subscription anti-leak sensor */}
        <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-4">
          <div>
            <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-rose-400" /> {t.subscriptionLeakSensor}
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1">{t.subscriptionLeakDesc}</p>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="flex justify-between items-center p-3.5 bg-zinc-950/60 rounded-xl border border-white/5 leading-tight">
              <div>
                <span className="text-white font-medium block">{t.unusedFitnessTitle}</span>
                <span className="text-[9px] text-zinc-500 font-mono block mt-1">{language === 'id' ? 'Menguras Rp 220.000 / bln • Penggunaan Nol' : 'Draining $19.99 / mo • Zero login record'}</span>
              </div>
              <button
                onClick={() => alert(t.prunedSuccess)}
                className="text-[10px] bg-rose-950/20 border border-rose-900/40 text-rose-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-900 hover:text-white transition-all cursor-pointer"
              >
                {t.prune}
              </button>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-zinc-950/60 rounded-xl border border-white/5 leading-tight">
              <div>
                <span className="text-white font-medium block">{t.cloudStackTitle}</span>
                <span className="text-[9px] text-zinc-550 font-mono block mt-1">{language === 'id' ? 'Menguras Rp 450.000 / bln • API Tidak Aktif' : 'Draining $35.000 / mo • Inactive API space'}</span>
              </div>
              <button
                onClick={() => alert(t.prunedSuccess)}
                className="text-[10px] bg-rose-950/20 border border-rose-900/40 text-rose-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-900 hover:text-white transition-all cursor-pointer"
              >
                {t.prune}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
