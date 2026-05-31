/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  DollarSign, TrendingUp, ShieldAlert, Award, Star, AppWindow, 
  HelpCircle, CreditCard, ChevronRight, CheckCircle2, Search, Sparkles, RefreshCw, Trash2, PlusCircle,
  Activity, Target, Cpu, BookOpen, Clock, Compass, HelpCircle as TooltipIcon, Lightbulb, Loader2, AlertTriangle, Download, Layers, PieChart as PieChartIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Transaction, FinancialGoal, UserPreferences, InvestmentExplanation, MonthlyRecap, Subscription, Asset } from '../types';
import { FINTECH_QUESTS } from '../data/mockTransactions';
import { Language } from '../data/translations';
import ExportWizardModal from './ExportWizardModal';

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
  onAddTransaction: (desc: string, amount: number, cat: string, type: 'income' | 'expense') => void;
  onDeleteTransaction: (txId: string) => void;
  subscriptions: Subscription[];
  onDeleteSubscription: (id: string) => void;
  activeQuestInProgressId: string | null;
  setActiveQuestInProgressId: (id: string | null) => void;
  questsList: any[];
  onCompleteQuest: (questId: string) => void;
  assets: Asset[];
}

import HealthAnalyzerView from './HealthAnalyzerView';

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
  onDeleteMonthlyRecap,
  onAddTransaction,
  onDeleteTransaction,
  subscriptions,
  onDeleteSubscription,
  activeQuestInProgressId,
  setActiveQuestInProgressId,
  questsList,
  onCompleteQuest,
  assets
}: DashProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportWizardOpen, setExportWizardOpen] = useState(false);
  const [wizardFilename, setWizardFilename] = useState('');
  const [wizardExportType, setWizardExportType] = useState<'pdf' | 'csv' | 'json'>('csv');
  const [wizardDataContent, setWizardDataContent] = useState('');

  const exportToPDF = async () => {
    setWizardFilename('hud_dashboard.pdf');
    setWizardExportType('pdf');
    setWizardDataContent('');
    setExportWizardOpen(true);
  };

  const exportToCSV = (type: 'transactions' | 'assets') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (type === 'transactions') {
      headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
      rows = transactions.map(tx => [
        tx.date || '',
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        tx.category || '',
        tx.type || '',
        tx.amount.toString()
      ]);
      filename = 'hud_transactions.csv';
    } else {
      headers = ['Asset Name', 'Category', 'Value', 'Expected Return (%)', 'Institution'];
      rows = assets.map(a => [
        `"${a.name.replace(/"/g, '""')}"`,
        a.category,
        a.value.toString(),
        a.expectedReturn.toString(),
        `"${(a.institution || '').replace(/"/g, '""')}"`
      ]);
      filename = 'hud_assets.csv';
    }

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    setWizardFilename(filename);
    setWizardExportType('csv');
    setWizardDataContent(csvContent);
    setExportWizardOpen(true);
  };

  const exportToJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      currency: preferences.currency,
      preferences,
      transactions,
      assets,
      goals,
      subscriptions
    };
    setWizardFilename('hud_dashboard_data.json');
    setWizardExportType('json');
    setWizardDataContent(JSON.stringify(data, null, 2));
    setExportWizardOpen(true);
  };

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

  // Dynamic Transaction-based Multi-timeframe Trend Selector
  const [trendTimeframe, setTrendTimeframe] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('bulanan');

  const getAggregatedTrendData = () => {
    const groups: Record<string, { label: string; monthlyIncome: number; monthlyExpense: number; timestamp: number }> = {};
    const monthsId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = language === 'id' ? monthsId : monthsEn;

    transactions.forEach(tx => {
      if (!tx.date) return;
      const dateObj = new Date(tx.date);
      if (isNaN(dateObj.getTime())) return;

      let key = '';
      let label = '';
      let timestamp = dateObj.getTime();

      if (trendTimeframe === 'harian') {
        key = tx.date;
        const parts = tx.date.split('-');
        if (parts.length === 3) {
          const [, month, day] = parts;
          const mName = months[parseInt(month, 10) - 1] || '';
          label = `${parseInt(day, 10)} ${mName}`;
        } else {
          label = tx.date;
        }
      } else if (trendTimeframe === 'mingguan') {
        const day = dateObj.getDay();
        const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(dateObj.setDate(diff));
        key = startOfWeek.toISOString().split('T')[0];
        const parts = key.split('-');
        if (parts.length === 3) {
          const [, month, dayNum] = parts;
          const mName = months[parseInt(month, 10) - 1] || '';
          label = language === 'id' ? `Minggu ${parseInt(dayNum, 10)} ${mName}` : `W/o ${parseInt(dayNum, 10)} ${mName}`;
        } else {
          label = key;
        }
        timestamp = startOfWeek.getTime();
      } else if (trendTimeframe === 'bulanan') {
        const parts = tx.date.split('-');
        const year = parts[0];
        const month = parts[1];
        key = `${year}-${month}`;
        const mName = months[parseInt(month, 10) - 1] || '';
        label = `${mName} ${year}`;
        timestamp = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1).getTime();
      } else {
        // tahunan
        const year = tx.date.split('-')[0];
        key = year;
        label = year;
        timestamp = new Date(parseInt(year, 10), 0, 1).getTime();
      }

      if (!groups[key]) {
        groups[key] = {
          label,
          monthlyIncome: 0,
          monthlyExpense: 0,
          timestamp
        };
      }

      if (tx.type === 'income') {
        groups[key].monthlyIncome += tx.amount;
      } else {
        groups[key].monthlyExpense += tx.amount;
      }
    });

    return Object.values(groups).sort((a, b) => a.timestamp - b.timestamp);
  };

  const trendData = getAggregatedTrendData();

  // states and fetcher for real-time AI Cash Flow report
  const [isCashflowReportLoading, setIsCashflowReportLoading] = useState(false);
  const [cashflowReport, setCashflowReport] = useState<{
    summary: string;
    leakSource: string;
    ratioAnalysis: string;
    actions: string[];
  } | null>(() => {
    const saved = localStorage.getItem('aura_cashflow_ai_report');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [cashflowReportError, setCashflowReportError] = useState<string | null>(null);

  const fetchCashflowAIReport = async () => {
    setIsCashflowReportLoading(true);
    setCashflowReportError(null);
    try {
      const response = await fetch('/api/gemini/analyze-cashflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trendTimeframe,
          trendData: trendData.slice(-15), // Avoid passing overly long arrays
          preferences,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(language === 'id' ? 'Gagal menghubungi Kecerdasan AI' : 'Failed to contact AI Engine');
      }

      const data = await response.json();
      setCashflowReport(data);
      localStorage.setItem('aura_cashflow_ai_report', JSON.stringify(data));
    } catch (err: any) {
      setCashflowReportError(err.message || 'System issues');
    } finally {
      setIsCashflowReportLoading(false);
    }
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
    onCompleteQuest(id);
  };

  const handleResolveQuestClick = (quest: any) => {
    if (quest.status === 'completed') return;

    // Set quest as currently in-progress
    setActiveQuestInProgressId(quest.id);

    if (quest.id === 'quest-1') {
      alert(language === 'id' 
        ? "Misi Aktif Dimulai! Silakan hapus atau pangkas kebocoran langganan Anda di halaman Cashflow Command Center (Tab: Data Keseluruhan / Sub-nav: Input Langganan) untuk menyelesaikan misi ini."
        : "Active Mission Started! Go to Cashflow Command Center (Tab: Overall Data / Sub-nav: Subscription Inputs) and delete/prune any unused subscriptions to complete your mission."
      );
      onNavigateToTab('fcc');
    } else if (quest.id === 'quest-2') {
      alert(language === 'id' 
        ? "Misi Aktif Dimulai! Anda diarahkan ke halaman Scam Sentinel. Silakan lakukan audit kelayakan penipuan pada investasi mencurigakan apa saja di sana untuk menyelesaikan misi."
        : "Active Mission Started! Redirecting you to Scam Sentinel. Analyze any suspect high-yield opportunity to audit fraud and claim reward."
      );
      onNavigateToTab('scam');
    } else if (quest.id === 'quest-3') {
      alert(language === 'id' 
        ? "Misi Aktif Dimulai! Anda diarahkan ke Future Simulator. Silakan sesuaikan target pensiun atau kekayaan dan klik 'Trajectory Projection Simulation' untuk menyelesaikan misi."
        : "Active Mission Started! Redirecting you to the Future Simulator. Adjust your target metrics and click 'Project Future Horizons' to fulfill this quest."
      );
      onNavigateToTab('simulator');
    }
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

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, current) => sum + current.amount, 0);

  return (
    <div id="dash_view_root" className="grid grid-cols-1 xl:grid-cols-12 gap-6" ref={componentRef}>
      
      {/* Header section with Export controls */}
      <div className="xl:col-span-12 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#0a0a0a]/50 border border-white/5 p-4.5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">HUD Dashboard</h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            {language === 'id' 
              ? 'Selamat datang di pusat pemantauan finansial terintegrasi Anda.' 
              : 'Welcome to your integrated personal financial telemetry center.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative" data-html2canvas-ignore="true">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 text-xs font-mono uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3.5 py-2 rounded-lg border border-white/5 transition cursor-pointer select-none"
            >
              <Download className="w-4 h-4" /> {language === 'id' ? 'Ekspor' : 'Export'}
            </button>
            {isExportOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsExportOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-zinc-950 p-1.5 shadow-2xl z-50 flex flex-col gap-0.5">
                  <div className="px-2 py-1 text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-white/5 mb-1">
                    {language === 'id' ? 'FORMAT FILES' : 'SELECT FORMAT'}
                  </div>
                  <button
                    type="button"
                    onClick={() => { exportToPDF(); setIsExportOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs transition font-semibold"
                  >
                    📄 Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => { exportToCSV('transactions'); setIsExportOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs transition font-semibold"
                  >
                    📊 CSV (Transactions)
                  </button>
                  <button
                    type="button"
                    onClick={() => { exportToCSV('assets'); setIsExportOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs transition font-semibold"
                  >
                    📈 CSV (Assets)
                  </button>
                  <button
                    type="button"
                    onClick={() => { exportToJSON(); setIsExportOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs transition font-semibold"
                  >
                    ⚙️ JSON (All Data)
                  </button>
                </div>
              </>
            )}

            <ExportWizardModal
              isOpen={exportWizardOpen}
              onClose={() => setExportWizardOpen(false)}
              filename={wizardFilename}
              exportType={wizardExportType}
              dataContent={wizardDataContent}
              componentRef={componentRef}
              language={language}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-550 bg-zinc-950 p-1.5 px-3 border border-white/5 rounded-md uppercase tracking-wider hidden sm:inline-block">
            {language === 'id' ? 'SISTEM DIPANTAU • NYALA' : 'SECURE HUD NODE • ACTIVE'}
          </span>
        </div>
      </div>

      {/* HUD left core variables column */}
      <div className="xl:col-span-8 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          
          {/* CARD 1: Total Nilai Aset */}
          <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-4.5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-teal-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block mb-1">
                {language === 'id' ? 'TOTAL NILAI ASET' : 'TOTAL ASSETS VALUE'}
                <HelpTooltip text={language === 'id' ? 'Akumulasi total semua kelas aset (kas, saham, emas, properti) yang Anda masukkan di ACC.' : 'The combined aggregate value of all cash holdings, stock funds, precious metals, and real estate registered in ACC.'} />
              </span>
              <h3 className="text-lg font-bold font-mono text-teal-400 select-text">
                {preferences.currency}{(assets && assets.length > 0 ? assets.reduce((sum, a) => sum + a.value, 0) : 0).toLocaleString()}
              </h3>
            </div>
            <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-2 border-t border-white/5 mt-3">
              <span>{language === 'id' ? 'Aset Terdaftar' : 'Holdings'}</span>
              <span className="text-teal-400/90 font-mono font-bold">ACC ACTIVE</span>
            </div>
          </div>

          {/* CARD 2: Total Portofolio Investasi */}
          <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-4.5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block mb-1">
                {language === 'id' ? 'TOTAL INVESTASI AKTIF' : 'ACTIVE INVESTMENT VALUE'}
                <HelpTooltip text={language === 'id' ? 'Estimasi total nilai aset Anda di luar porsi kas (di luar kategori cash).' : 'Total cumulative valuation of non-cash compounding holdings.'} />
              </span>
              <h3 className="text-lg font-bold font-mono text-indigo-400 select-text">
                {preferences.currency}{(assets && assets.length > 0 ? assets.filter(a => a.category !== 'cash').reduce((sum, a) => sum + a.value, 0) : 0).toLocaleString()}
              </h3>
            </div>
            <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-2 border-t border-white/5 mt-3">
              <span>{language === 'id' ? 'Rasio Compounding' : 'Yield Ratio'}</span>
              <span className="text-indigo-400 font-bold font-mono">
                {assets && assets.length > 0
                  ? Math.round((assets.filter(a => a.category !== 'cash').reduce((sum, a) => sum + a.value, 0) / Math.max(1, assets.reduce((sum, a) => sum + a.value, 0))) * 100)
                  : 0}%
              </span>
            </div>
          </div>

          {/* CARD 3: Target Alokasi Bulanan */}
          <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-4.5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block mb-1">
                {t.monthlyCompoundContribution}
                <HelpTooltip text={language === 'id' ? 'Dana segar reguler yang ditargetkan masuk tabungan & pasar modal bulan ini.' : 'Monthly funds committed toward your strategic investment goals.'} />
              </span>
              <h3 className="text-lg font-bold font-mono text-yellow-400 select-text">
                {preferences.currency}{preferences.monthlyInvestment.toLocaleString()}
              </h3>
            </div>
            <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-2 border-t border-white/5 mt-3">
              <span>{t.surplusTargetAllocation}</span>
              <span className="text-yellow-400 font-bold font-mono">{t.activeTarget}</span>
            </div>
          </div>

          {/* CARD 4: Margin Arus Kas Bulanan */}
          <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-4.5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block mb-1">
                {t.monthlyCashMargin}
                <HelpTooltip text={`${language === 'id' ? 'Sisa surplus kas bulan berjalan (Pemasukan - Total Pengeluaran).' : 'Income - Expenses. The remaining cash buffer for security or savings.'} (Calc: ${preferences.currency}${preferences.monthlyIncome.toLocaleString()} - ${preferences.currency}${totalExpense.toLocaleString()})`} />
              </span>
              <h3 className="text-lg font-bold font-mono text-rose-400 select-text font-semibold">
                {preferences.currency}{(preferences.monthlyIncome - totalExpense).toLocaleString()}
              </h3>
            </div>
            <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-2 border-t border-white/5 mt-3">
              <span>{t.expensesTrackedBuffer}</span>
              <span className="text-rose-400 font-bold font-mono">{t.activeTracking}</span>
            </div>
          </div>

        </div>

        {/* Monthly Trend Chart */}
        <div id="monthly_recaps_chart" className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                {language === 'id' ? 'ANALISIS TREN ALIRAN DANA' : 'CASH FLOW TREND ANALYSIS'}
              </h4>
              <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                {language === 'id' 
                  ? 'Visualisasi kumulatif pemasukan vs pengeluaran dari data transaksi rinci.'
                  : 'Cumulative visualization of detailed inflows vs outflows gathered from active logs.'}
              </p>
            </div>

            {/* Timeframe Selector Buttons */}
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-white/5 gap-1 self-start sm:self-center">
              {(['harian', 'mingguan', 'bulanan', 'tahunan'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTrendTimeframe(tf)}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-mono transition font-bold select-none cursor-pointer ${
                    trendTimeframe === tf 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tf === 'harian' ? (language === 'id' ? 'Harian' : 'Daily') :
                   tf === 'mingguan' ? (language === 'id' ? 'Mingguan' : 'Weekly') :
                   tf === 'bulanan' ? (language === 'id' ? 'Bulanan' : 'Monthly') :
                   (language === 'id' ? 'Tahunan' : 'Yearly')}
                </button>
              ))}
            </div>
          </div>

          {trendData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-zinc-650 font-sans">
              {language === 'id' 
                ? 'Belum ada data untuk memetakan visualisasi tren aliran dana.' 
                : 'No transaction data available to plot visualization trends.'}
            </div>
          ) : (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorIncomeDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenseDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="label" stroke="#666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickFormatter={(val) => `${preferences.currency}${val.toLocaleString()}`} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} 
                    formatter={(value) => [`${preferences.currency}${Number(value).toLocaleString()}`]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="monthlyIncome" 
                    stroke="#10b981" 
                    fill="url(#colorIncomeDash)" 
                    strokeWidth={2}
                    name={language === 'id' ? 'Pemasukan' : 'Income'} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="monthlyExpense" 
                    stroke="#ef4444" 
                    fill="url(#colorExpenseDash)" 
                    strokeWidth={2}
                    name={language === 'id' ? 'Pengeluaran' : 'Expense'} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* AI Generated Trend Diagnostics Report */}
          <div className="mt-5 pt-5 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-extrabold tracking-wider uppercase text-zinc-300">
                  {language === 'id' ? 'Laporan Tren Keuangan AI' : 'AI Trend Analytics Report'}
                </span>
              </div>
              <button
                type="button"
                onClick={fetchCashflowAIReport}
                disabled={isCashflowReportLoading || trendData.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 hover:from-indigo-500/30 hover:to-cyan-500/30 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold cursor-pointer select-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCashflowReportLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'id' ? 'Menganalisis...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>{cashflowReport ? (language === 'id' ? 'Hitung Ulang' : 'Recalculate') : (language === 'id' ? 'Generate Diagnostik' : 'Generate Diagnostics')}</span>
                  </>
                )}
              </button>
            </div>

            {cashflowReportError && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cashflowReportError}</span>
              </div>
            )}

            {isCashflowReportLoading && !cashflowReport && (
              <div className="p-5 border border-white/5 rounded-xl bg-zinc-950/40 text-center space-y-2">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
                <p className="text-xs text-zinc-400 font-sans">
                  {language === 'id' 
                    ? 'Memasukkan model kecerdasan dan mengevaluasi tren pengeluaran Anda...' 
                    : 'Engaging economic intelligence model and auditing trend sheets...'}
                </p>
              </div>
            )}

            {!isCashflowReportLoading && !cashflowReport && !cashflowReportError && (
              <div className="p-4 border border-zinc-805 border-white/5 rounded-xl bg-[#09090b]/40 text-center">
                <p className="text-xs text-zinc-500">
                  {language === 'id' 
                    ? 'Klik "Generate Diagnostik" untuk memicu audit aliran kas dooitly bertenaga AI.' 
                    : 'Click "Generate Diagnostics" to spark dooitly AI cash flow audit for this trend chart.'}
                </p>
              </div>
            )}

            {cashflowReport && (
              <div className={`space-y-3 animate-fade-in ${isCashflowReportLoading ? 'opacity-40' : ''}`}>
                <div className="bg-[#09090b]/80 border border-white/5 p-4 rounded-xl space-y-3 font-sans">
                  
                  {/* Summary text */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 tracking-wider">
                      {language === 'id' ? '■ ANALISIS UTAMA' : '■ CORE SYNTHESIS'}
                    </span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {cashflowReport.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Leaks analysis */}
                    <div className="bg-zinc-950/40 p-3 rounded-lg border border-white/5">
                      <span className="text-[9px] font-mono uppercase text-[#eab308] tracking-wider block">
                        {language === 'id' ? '⚠️ PENYEBAB KEBOCORAN' : '⚠️ LEAK EVALUATION'}
                      </span>
                      <p className="text-xs text-zinc-400 mt-1">
                        {cashflowReport.leakSource}
                      </p>
                    </div>

                    {/* Ratio analysis */}
                    <div className="bg-zinc-950/40 p-3 rounded-lg border border-white/5">
                      <span className="text-[9px] font-mono uppercase text-[#14b8a6] tracking-wider block">
                        {language === 'id' ? '📊 ANALISIS RASIO' : '📊 RATIO ANALYSIS'}
                      </span>
                      <p className="text-xs text-zinc-400 mt-1">
                        {cashflowReport.ratioAnalysis}
                      </p>
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#10b981] tracking-wider">
                      {language === 'id' ? '⚡ 3 REKOMENDASI TINDAKAN' : '⚡ 3 ACTION STEPS'}
                    </span>
                    <ul className="mt-2 space-y-1.5 rounded-lg bg-emerald-500/5 p-3 border border-emerald-500/10">
                      {cashflowReport.actions?.map((act: string, idx: number) => (
                        <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Analysis & Growth Chart Container */}
        {assets.length > 0 && (
          <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                {language === 'id' ? 'ANALISIS PORTOFOLIO & PERTUMBUHAN' : 'PORTFOLIO ANALYTICS & GROWTH'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donut Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assets.reduce((acc: any[], asset) => {
                        const existing = acc.find(item => item.name === asset.category);
                        if (existing) { existing.value += asset.value; }
                        else { acc.push({ name: asset.category, value: asset.value }); }
                        return acc;
                      }, [])}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {assets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#14b8a6', '#6366f1', '#06b6d4', '#f59e0b', '#eab308', '#71717a'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${preferences.currency}${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Growth Line Chart */}
              <div className="h-48 border-l border-white/5 pl-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Array.from({ length: 21 }, (_, i) => i).map(year => ({
                    year,
                    value: assets.reduce((sum, asset) => {
                      return sum + (asset.value * Math.pow(1 + (asset.expectedReturn / 100), year));
                    }, 0)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="year" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${preferences.currency}${val.toLocaleString(undefined, {notation: 'compact'})}`} />
                    <Tooltip 
                      formatter={(value: number) => [`${preferences.currency}${Math.round(value).toLocaleString()}`, 'Value']}
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}



        {/* Level & XP RPG Gamified UI Bar */}
        <div id="gamified_xp_bar" className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg space-y-3 mt-6">
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
            {questsList.map(quest => {
              const isInProgress = activeQuestInProgressId === quest.id;
              return (
                <div 
                  key={quest.id} 
                  className={`bg-zinc-950/60 p-4 rounded-xl space-y-2 relative group overflow-hidden transition-all duration-200 border ${
                    isInProgress ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-950/5' : 'border-white/5'
                  }`}
                >
                  {isInProgress && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-black text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-bl">
                      {language === 'id' ? 'Sedang Berjalan' : 'In Progress'}
                    </div>
                  )}
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
                      onClick={() => handleResolveQuestClick(quest)}
                      className={`w-full text-center py-2 rounded-lg text-xs font-mono font-bold border transition duration-150 cursor-pointer ${
                        isInProgress 
                          ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-400' 
                          : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 hover:text-white'
                      }`}
                    >
                      {isInProgress ? (language === 'id' ? 'Lanjutkan Misi' : 'Continue Quest') : t.resolveQuest}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription anti-leak sensor */}
        <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-4 font-sans">
          <div>
            <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-rose-400" /> {t.subscriptionLeakSensor}
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1">{t.subscriptionLeakDesc}</p>
          </div>

          <div className="space-y-3 text-xs">
            {subscriptions.length === 0 ? (
              <div className="text-center p-6 bg-zinc-950/20 border border-dashed border-white/5 text-zinc-500 rounded-xl">
                {language === 'id' ? 'Tidak ada pembocoran langganan terdeteksi!' : 'No silent subscription leaks active!'}
              </div>
            ) : (
              subscriptions.map(sub => (
                <div key={sub.id} className="flex justify-between items-center p-3.5 bg-zinc-950/60 rounded-xl border border-white/5 leading-tight hover:border-white/12 transition duration-150">
                  <div>
                    <span className="text-white font-medium block">{sub.name}</span>
                    <span className="text-[9px] text-zinc-500 font-mono block mt-1">{sub.description}</span>
                  </div>
                  <button
                    onClick={() => {
                      onDeleteSubscription(sub.id);
                      alert(t.prunedSuccess || "Recalculated cash balance surplus!");
                      if (activeQuestInProgressId === 'quest-1') {
                        onCompleteQuest('quest-1');
                        alert(language === 'id' ? "Selamat! Misi selesai. 350 XP berhasil didapatkan!" : "Congratulations! Quest Purge Subscription Bloat is solved! 350 XP earned!");
                      }
                    }}
                    className="text-[10px] bg-rose-950/20 border border-rose-900/40 text-rose-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-900 hover:text-white transition-all cursor-pointer"
                  >
                    {t.prune}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

