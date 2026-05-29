import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, RefreshCw, Trash2, Activity, Target, Save, CreditCard, Sparkles, CheckCircle2, ShieldAlert, Upload, Loader2, Calendar, Camera, AlertTriangle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, FinancialGoal, UserPreferences, MonthlyRecap, Subscription } from '../types';
import { Language } from '../data/translations';
import HealthAnalyzerView from './HealthAnalyzerView';

interface FCCProps {
  preferences: UserPreferences;
  transactions: Transaction[];
  goals: FinancialGoal[];
  onAddGoal: (name: string, targetAmount: number, currentSaved: number, targetYear: number, category: any) => void;
  onDeleteGoal: (goalId: string) => void;
  language: Language;
  t: any;
  monthlyRecaps: MonthlyRecap[];
  onAddMonthlyRecap: (recap: Omit<MonthlyRecap, 'id'>) => void;
  onApplyMonthlyRecap: (recap: MonthlyRecap) => void;
  onDeleteMonthlyRecap: (recapId: string) => void;
  onAddTransaction: (desc: string, amount: number, cat: string, type: 'income' | 'expense', date?: string) => void;
  onDeleteTransaction: (txId: string) => void;
  onChangePreferences: (prefs: Partial<UserPreferences>) => void;
  subscriptions: Subscription[];
  onAddSubscription: (name: string, cost: number, isActive: boolean, description?: string) => void;
  onDeleteSubscription: (id: string) => void;
  activeQuestInProgressId: string | null;
  setActiveQuestInProgressId: (id: string | null) => void;
  onCompleteQuest: (questId: string) => void;
}

const formatInputMonthToReadable = (value: string, lang: 'id' | 'en') => {
  if (!value) return '';
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    const monthsId = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = lang === 'id' ? monthsId[monthIndex] : monthsEn[monthIndex];
    return `${monthName} ${year}`;
  }
  return value; // fallback
};

export default function FinancialCommandCenterView({
  preferences,
  transactions,
  goals,
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
  onChangePreferences,
  subscriptions,
  onAddSubscription,
  onDeleteSubscription,
  activeQuestInProgressId,
  setActiveQuestInProgressId,
  onCompleteQuest
}: FCCProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);

  const exportToPDF = async () => {
    if (!componentRef.current) return;
    const canvas = await html2canvas(componentRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('cashflow_command.pdf');
  };

  const exportToCSV = (type: 'transactions' | 'recaps' | 'subscriptions') => {
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
      filename = 'cashflow_transactions.csv';
    } else if (type === 'recaps') {
      headers = ['Month/Year', 'Monthly Income', 'Monthly Expense', 'Current Savings', 'Monthly Investment'];
      rows = monthlyRecaps.map(mr => [
        mr.monthYear,
        mr.monthlyIncome.toString(),
        mr.monthlyExpense.toString(),
        mr.currentSavings.toString(),
        mr.monthlyInvestment.toString()
      ]);
      filename = 'cashflow_monthly_recaps.csv';
    } else {
      headers = ['Name', 'Cost', 'Active Status', 'Description'];
      rows = subscriptions.map(sub => [
        `"${sub.name.replace(/"/g, '""')}"`,
        sub.cost.toString(),
        sub.isActive ? 'Active' : 'Inactive',
        `"${(sub.description || '').replace(/"/g, '""')}"`
      ]);
      filename = 'cashflow_subscriptions.csv';
    }

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      currency: preferences.currency,
      preferences,
      transactions,
      monthlyRecaps,
      subscriptions,
      goals
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", 'cashflow_data.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [activeTab, setActiveTab] = useState<'bulanan' | 'keseluruhan'>('bulanan');
  const [isAddingRecap, setIsAddingRecap] = useState(false);

  const [recapMonthYear, setRecapMonthYear] = useState('');
  const [recapIncome, setRecapIncome] = useState('');
  const [recapExpense, setRecapExpense] = useState('');
  const [recapSavings, setRecapSavings] = useState('');
  const [recapInvestment, setRecapInvestment] = useState('');

  // Symmetrical inline overall config form states
  const [prefSavings, setPrefSavings] = useState(preferences.currentSavings.toString());
  const [prefIncome, setPrefIncome] = useState(preferences.monthlyIncome.toString());
  const [prefInvestment, setPrefInvestment] = useState(preferences.monthlyInvestment.toString());
  const [prefRisk, setPrefRisk] = useState(preferences.riskAppetite);

  // Dynamic subscriptions input states
  const [newSubName, setNewSubName] = useState('');
  const [newSubCost, setNewSubCost] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubActive, setNewSubActive] = useState(activeQuestInProgressId !== 'quest-1');

  // Detailed transaction logging states inside FCC
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Food & Beverage');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // OCR Photo Scanner states
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Scam Sentinel states
  const [scamSentinelEnabled, setScamSentinelEnabled] = useState(false);
  const [isScamAuditing, setIsScamAuditing] = useState(false);
  const [scamAuditResult, setScamAuditResult] = useState<{
    scamProbability: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Severe';
    detectedRedFlags: string[];
    recommendation: string;
  } | null>(null);

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

  // Auto trigger scam sentinel when description or amount field is updated and scam sentinel is enabled
  useEffect(() => {
    if (scamSentinelEnabled && txDesc.length > 5) {
      const delayDebounceSelector = setTimeout(() => {
        runScamSentinelAudit();
      }, 1000);
      return () => clearTimeout(delayDebounceSelector);
    } else {
      setScamAuditResult(null);
    }
  }, [txDesc, scamSentinelEnabled]);

  // Helper to parse receipt photo using Express server endpoint
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const response = await fetch('/api/gemini/parse-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64String })
          });

          if (!response.ok) {
            throw new Error('Receipt parsing server error');
          }

          const parsed = await response.json();
          if (parsed) {
            if (parsed.description) setTxDesc(parsed.description);
            if (parsed.amount) setTxAmount(parsed.amount.toString());
            if (parsed.type) {
              setTxType(parsed.type);
              if (parsed.category) setTxCategory(parsed.category);
              else setTxCategory(parsed.type === 'income' ? 'Income' : 'Food & Beverage');
            }
            if (parsed.date) setTxDate(parsed.date);
          }
        } catch (err: any) {
          console.error(err);
          setOcrError(language === 'id' ? 'Gagal memindai gambar resi. Silakan coba unggah kembali.' : 'Failed to scan receipt image. Please try uploading again.');
        } finally {
          setIsOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setOcrError(language === 'id' ? 'Gagal memuat berkas.' : 'Failed to load file.');
      setIsOcrLoading(false);
    }
  };

  // Helper to audit current transaction with Aura Anti-Fraud engine
  const runScamSentinelAudit = async () => {
    if (!txDesc) return;
    setIsScamAuditing(true);
    try {
      const response = await fetch('/api/gemini/detect-scam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: `AUDIT INPUT: Deskripsi: ${txDesc}, Jumlah: ${txAmount}, Kategori: ${txCategory}, Jenis: ${txType}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        setScamAuditResult(result);
      }
    } catch (err) {
      console.error("Scam sentinel error:", err);
    } finally {
      setIsScamAuditing(false);
    }
  };

  // Calculates derived values from transactions detail inputs
  const totalDetailedIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDetailedExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Synchronize overall inputs with global config
  useEffect(() => {
    setPrefSavings(preferences.currentSavings.toString());
    setPrefIncome(preferences.monthlyIncome.toString());
    setPrefInvestment(preferences.monthlyInvestment.toString());
    setPrefRisk(preferences.riskAppetite);
  }, [preferences]);

  useEffect(() => {
    setNewSubActive(activeQuestInProgressId !== 'quest-1');
  }, [activeQuestInProgressId]);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onChangePreferences({
      currentSavings: parseFloat(prefSavings) || 0,
      monthlyIncome: parseFloat(prefIncome) || 0,
      monthlyInvestment: parseFloat(prefInvestment) || 0,
      riskAppetite: prefRisk
    });
    alert(language === 'id' 
      ? 'Perubahan data berhasil disimpan ke profil sistem!' 
      : 'Core finance values saved successfully to your system profile!'
    );
  };

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubCost) return;
    onAddSubscription(
      newSubName,
      parseFloat(newSubCost) || 0,
      newSubActive,
      newSubDesc || undefined
    );
    setNewSubName('');
    setNewSubCost('');
    setNewSubDesc('');
    alert(language === 'id' 
      ? `Layanan "${newSubName}" didaftarkan ke sensor audit langganan!` 
      : `Registered subscription "${newSubName}" to leak sensor audit feed!`
    );
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txAmount) return;
    onAddTransaction(txDesc, parseFloat(txAmount), txCategory, txType, txDate);
    setTxDesc('');
    setTxAmount('');
    setScamAuditResult(null);
    alert(language === 'id' 
      ? `Transaksi "${txDesc}" senilai ${preferences.currency}${parseFloat(txAmount).toLocaleString()} berhasil dicatat!` 
      : `Transaction "${txDesc}" worth ${preferences.currency}${parseFloat(txAmount).toLocaleString()} recorded successfully!`
    );
  };

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalCurrentSaved, setGoalCurrentSaved] = useState('');
  const [goalTargetYear, setGoalTargetYear] = useState('2030');
  const [goalCategory, setGoalCategory] = useState<'housing' | 'retirement' | 'travel' | 'investment' | 'other'>('investment');

  const handleAutoFillActiveData = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    setRecapMonthYear(`${year}-${month}`);
    setRecapIncome(totalDetailedIncome.toString());
    setRecapExpense(totalDetailedExpense.toString());
    setRecapSavings(preferences.currentSavings.toString());
    setRecapInvestment(preferences.monthlyInvestment.toString());
  };

  const handleCreateRecap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recapMonthYear) return;
    const serializedMonth = formatInputMonthToReadable(recapMonthYear, language);
    onAddMonthlyRecap({
      monthYear: serializedMonth,
      monthlyIncome: parseFloat(recapIncome) || 0,
      monthlyExpense: parseFloat(recapExpense) || 0,
      currentSavings: parseFloat(recapSavings) || 0,
      monthlyInvestment: parseFloat(recapInvestment) || 0,
    });
    setRecapMonthYear('');
    setIsAddingRecap(false);
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

  return (
    <div className="space-y-6" ref={componentRef}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Cashflow Command Center</h2>
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 text-xs font-mono uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg border border-white/5 transition"
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
                    onClick={() => { exportToCSV('recaps'); setIsExportOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs transition font-semibold"
                  >
                    📈 CSV (Monthly Recaps)
                  </button>
                  <button
                    type="button"
                    onClick={() => { exportToCSV('subscriptions'); setIsExportOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs transition font-semibold"
                  >
                    💸 CSV (Subscriptions)
                  </button>
                  <button
                    type="button"
                    onClick={() => { exportToJSON(); setIsExportOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs transition font-semibold"
                  >
                    ⚙️ JSON (All Cashflow)
                  </button>
                </div>
              </>
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 p-1 px-2 border border-white/5 rounded-md uppercase">
            SECURE ENCRYPTED NODE • OPERATOR
          </span>
        </div>
      </div>

      {/* Active Quest RPG Banner */}
      {activeQuestInProgressId && (activeQuestInProgressId === 'quest-1' || activeQuestInProgressId === 'quest-3') && (
        <div className="bg-amber-500/5 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.05)] animate-pulse">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500 text-black font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-spin font-bold" />
              {language === 'id' ? 'MISI AKTIF BERJALAN' : 'ACTIVE QUEST'}
            </span>
            <h4 className="text-xs font-bold text-white mt-1 uppercase tracking-tight">
              {activeQuestInProgressId === 'quest-1' 
                ? (language === 'id' ? 'Pangkas Kebocoran Dana Langganan Anda!' : 'Purge Silent Subscription Bloat!')
                : (language === 'id' ? 'Kalibrasi Model & Model Risiko Finansial!' : 'Calibrate Financial Projections Model!')
              }
            </h4>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
              {activeQuestInProgressId === 'quest-1' 
                ? (language === 'id' 
                  ? 'Misi dimulai! Silakan tambahkan langganan bocor Anda di formulir "INPUT LANGGANAN" di tab "Data Keseluruhan" lalu hapus/prun langganan tersebut untuk memangkas pengeluaran siluman dan klaim 350 XP.'
                  : 'Quest Active! Please register or view leaking subscriptions inside the "Overall Data" tab, and click prune/delete to purge the liability and secure 350 RPG XP.')
                : (language === 'id'
                  ? 'Ubah salah satu dari variabel tabungan aktif, pemasukan, atau profil risiko finansial di tab "Data Keseluruhan" lalu klik "Simpan" untuk mengkalibrasikannya dengan simulator cerdas dan klaim 500 XP!'
                  : 'Adjust any variables (Current Savings, Income, profile, etc.) in the "Overall Data" tab Configurator and save settings to calibrate simulations and claim 500 RPG XP!')
              }
            </p>
          </div>
          <button
            onClick={() => {
              if (activeQuestInProgressId === 'quest-1') {
                if (subscriptions.length < 2) {
                  onCompleteQuest('quest-1');
                  alert(language === 'id' ? 'Luar Biasa! Misi Selesai! XP telah ditransfer ke profil karakter Anda!' : 'Fantastic work! Quest completed! XP sent.');
                } else {
                  alert(language === 'id' ? 'Harap hapus / pangkas salah satu langganan terlebih dahulu!' : 'Please delete or prune one of the unused subscription to complete the requirement first!');
                }
              } else if (activeQuestInProgressId === 'quest-3') {
                onCompleteQuest('quest-3');
                alert(language === 'id' ? 'Sukses! Kalibrasi Model Finansial Selesai! XP telah didistribusikan.' : 'Simulations Calibrated! Strategic model aligned. XP awarded.');
              }
            }}
            className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold rounded-xl transition cursor-pointer self-start sm:self-center uppercase"
          >
            {language === 'id' ? 'Verifikasi & Selesaikan' : 'Verify & Claim XP'}
          </button>
        </div>
      )}

      {/* Sub-navigation */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('bulanan')}
          className={`text-xs font-mono uppercase pb-2 ${activeTab === 'bulanan' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500'}`}
        >
          {language === 'id' ? 'Data Bulanan' : 'Monthly Data'}
        </button>
        <button
          onClick={() => setActiveTab('keseluruhan')}
          className={`text-xs font-mono uppercase pb-2 ${activeTab === 'keseluruhan' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500'}`}
        >
          {language === 'id' ? 'Data Keseluruhan' : 'Overall Data'}
        </button>
      </div>      {activeTab === 'bulanan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
          
          {/* COLUMN 1: Rincian Transaksi - Detailed Transactions Inflow/Outflow Ledger */}
          <div id="transactions_ledger_desk" className="lg:col-span-12 xl:col-span-12 bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-5">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                {language === 'id' ? 'RINCIAN ALIRAN DANA' : 'TRANSACTIONS DETAIL FEED'}
              </h4>
              <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                {language === 'id' 
                  ? 'Catat pemasukan dan pengeluaran rincian Anda. Nilai rekap bulanan Anda akan diakumulasikan otomatis dari sini.' 
                  : 'Log your individual inflows and outflows. Recaps and overall parameters will derive directly from these entries.'}
              </p>
            </div>

            {/* Quick Microtransaction Input Form with OCR Photo scanner, Date calendar picker, and Scam Sentinel protection */}
            <form onSubmit={handleCreateTransaction} className="p-4 bg-zinc-950/80 border border-white/10 rounded-xl space-y-3.5 text-xs animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">
                  {language === 'id' ? '+ CATAT TRANSAKSI RINCI' : '+ LOG NEW DETAIL ENTRY'}
                </span>
                
                {/* Photo OCR Scan Trigger Button */}
                <label className="cursor-pointer inline-flex items-center gap-1.5 py-1 px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] uppercase font-mono transition duration-150">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'id' ? 'PINDAI FOTO' : 'SCAN PHOTO'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleReceiptUpload} 
                    className="hidden" 
                    disabled={isOcrLoading}
                  />
                </label>
              </div>

              {/* OCR Loading & Error Feed */}
              {isOcrLoading && (
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg flex items-center gap-2 text-indigo-300 font-mono text-[10px] animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'id' ? 'Aura AI: Menganalisis & menyalin informasi foto...' : 'Aura AI: OCR-Analyzing receipt artifact...'}</span>
                </div>
              )}

              {ocrError && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg text-rose-400 font-mono text-[10px]">
                  {ocrError}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-zinc-500 text-[10px] uppercase font-mono">{language === 'id' ? 'Deskripsi' : 'Description'}</label>
                <input 
                  type="text" 
                  placeholder={language === 'id' ? 'e.g. Gaji Freelance, Starbucks, Listrik, Investasi private pool' : 'e.g. Consulting, Groceries, Cloud Hosting, Private pool investment'} 
                  value={txDesc} 
                  required 
                  onChange={e => setTxDesc(e.target.value)} 
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-500 text-[10px] uppercase font-mono">{language === 'id' ? 'Jumlah' : 'Amount'}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g. 50000" 
                    value={txAmount} 
                    required 
                    onChange={e => setTxAmount(e.target.value)} 
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono" 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-zinc-500 text-[10px] uppercase font-mono">{language === 'id' ? 'Jenis Aliran' : 'Flow Type'}</label>
                  <select 
                    value={txType} 
                    onChange={e => {
                      const selectedType = e.target.value as 'income' | 'expense';
                      setTxType(selectedType);
                      setTxCategory(selectedType === 'income' ? 'Income' : 'Food & Beverage');
                    }}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="expense">{language === 'id' ? 'Pengeluaran' : 'Expense'}</option>
                    <option value="income">{language === 'id' ? 'Pemasukan' : 'Income'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 font-sans">
                  <label className="text-zinc-500 text-[10px] uppercase font-mono">{language === 'id' ? 'Kategori Klasifikasi' : 'Classification Category'}</label>
                  <select 
                    value={txCategory} 
                    onChange={e => setTxCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                  >
                    {txType === 'income' ? (
                      <>
                        <option value="Income">Salary / Income</option>
                        <option value="Investment dividend">Investment Return / Dividen</option>
                        <option value="Other Inflow">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Food & Beverage">Dining / Food & Drink</option>
                        <option value="Groceries">Groceries / Belanja Bulanan</option>
                        <option value="Transportation">Transportation / Transport</option>
                        <option value="Rent/Housing">Rent / Utilitas Rumah</option>
                        <option value="Entertainment">Entertainment / Netflix / Hiburan</option>
                        <option value="Health">Health / Kesehatan</option>
                        <option value="Investment">Investment Allocation / Investasi</option>
                        <option value="Other">Other Expenses / Sisi Lainnya</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Calendar Date Input Opsi */}
                <div className="space-y-1">
                  <label className="text-zinc-500 text-[10px] uppercase font-mono">{language === 'id' ? 'Tanggal Transaksi' : 'Transaction Date'}</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={txDate} 
                      required
                      onChange={e => setTxDate(e.target.value)} 
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono" 
                    />
                  </div>
                </div>
              </div>

              {/* Scam Sentinel Integration Configuration */}
              <div className="bg-zinc-950 p-3 rounded-lg border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                    {language === 'id' ? 'AKTIFKAN SCAM SENTINEL' : 'ACTIVATE SCAM SENTINEL'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={scamSentinelEnabled}
                      onChange={e => setScamSentinelEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-450 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                {scamSentinelEnabled && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {isScamAuditing ? (
                      <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{language === 'id' ? 'Sentinel sedang mengaudit material penawaran...' : 'Sentinel auditing proposal material...'}</span>
                      </div>
                    ) : scamAuditResult ? (
                      <div className={`p-2.5 rounded border text-[10px] space-y-1.5 font-sans leading-relaxed ${
                        scamAuditResult.scamProbability > 60 
                          ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' 
                          : scamAuditResult.scamProbability > 30 
                            ? 'bg-amber-500/5 border-amber-500/20 text-amber-300' 
                            : 'bg-teal-500/5 border-teal-500/20 text-teal-300'
                      }`}>
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold uppercase tracking-wider">
                            🛡️ {language === 'id' ? 'Laporan Detektor Anti-Penipuan' : 'Aura sentinel safety analysis'}
                          </span>
                          <span className="font-black">
                            {scamAuditResult.scamProbability}% RISK
                          </span>
                        </div>
                        <p className="text-[11px] font-sans">
                          {scamAuditResult.recommendation}
                        </p>
                        {scamAuditResult.detectedRedFlags.length > 0 && (
                          <div className="pt-1.5 border-t border-white/5 space-y-1">
                            <span className="font-mono text-[9px] uppercase tracking-wider block text-zinc-400">
                              {language === 'id' ? 'Bendera Merah Terdeteksi:' : 'Detected Red Flags:'}
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-zinc-300 text-[9px]">
                              {scamAuditResult.detectedRedFlags.slice(0, 3).map((flag, idx) => (
                                <li key={idx} className="truncate">{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-sans text-zinc-500 italic block">
                        {language === 'id' ? 'Masukkan deskripsi di atas untuk mendeteksi tanda-tanda penipuan (scam) secara otomatis.' : 'Type a description above to auto-scan against high-yield scam indicators.'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-mono font-bold transition duration-150 cursor-pointer uppercase tracking-wider">
                {language === 'id' ? 'CATAT TRANSAKSI AKTIF' : 'COMMIT REAL TRANSACTION'}
              </button>
            </form>

            {/* List of microtransactions logged */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                <span>{language === 'id' ? 'RIWAYAT PENYATAAN TRANSAKSI' : 'TRANSACTION RECAP FEED'}</span>
                <span className="text-indigo-400 font-bold">Total: {transactions.length} entries</span>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center p-6 bg-zinc-950/20 border border-dashed border-white/5 text-zinc-650 rounded-xl text-xs">
                  {language === 'id' ? 'Belum ada rincian transaksi terekam.' : 'No active detailed ledger records.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {transactions.map(tx => (
                    <div key={tx.id} className="p-3 bg-zinc-950/40 rounded-xl border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition leading-tight">
                      <div>
                        <span className="font-bold text-white block text-xs">{tx.description}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] text-zinc-500 font-mono block uppercase">{tx.category}</span>
                          <span className="text-zinc-650 font-mono">•</span>
                          <span className="text-[9px] text-zinc-550 font-mono block">{tx.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-bold font-mono ${tx.type === 'income' ? 'text-teal-400' : 'text-rose-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{preferences.currency}{tx.amount.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 rounded transition duration-150 cursor-pointer"
                        >
                          <Trash2 className="w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
                   {/* COLUMN 2: Tren Grafis dari Rincian Transaksi */}
          <div className="lg:col-span-12 xl:col-span-12 space-y-6">
            
            {/* Trend Chart */}
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
                <div className="h-[220px] flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-zinc-650 font-sans">
                  {language === 'id' 
                    ? 'Belum ada data untuk memetakan visualisasi tren aliran dana.' 
                    : 'No transaction data available to plot visualization trends.'}
                </div>
              ) : (
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
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
                        fill="url(#colorIncome)" 
                        strokeWidth={2}
                        name={language === 'id' ? 'Pemasukan' : 'Income'} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="monthlyExpense" 
                        stroke="#ef4444" 
                        fill="url(#colorExpense)" 
                        strokeWidth={2}
                        name={language === 'id' ? 'Pengeluaran' : 'Expense'} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Summary Stats beneath the custom real-time chart */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 font-mono text-[11px]">
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                  <span className="text-zinc-500 block uppercase text-[9px] mb-1">
                    {language === 'id' ? 'TOTAL PEMASUKAN AKTIF' : 'ACCUMULATED RECORDED INFLOWS'}
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {preferences.currency}{totalDetailedIncome.toLocaleString()}
                  </span>
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                  <span className="text-zinc-500 block uppercase text-[9px] mb-1">
                    {language === 'id' ? 'TOTAL PENGELUARAN AKTIF' : 'ACCUMULATED RECORDED OUTFLOWS'}
                  </span>
                  <span className="text-rose-400 font-bold text-sm">
                    {preferences.currency}{totalDetailedExpense.toLocaleString()}
                  </span>
                </div>
              </div>

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
          </div>
        </div>
      </div>
      ) : (
        <div id="overall_financial_configurator_panel" className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in font-sans">
          
          {/* PROFILE DATA CONFIGURATION */}
          <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-[#111] border-white/5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {language === 'id' ? 'KONFIGURASI DATA SAYA' : 'MY PROFILE CONFIGURATOR'}
                </h4>
                <p className="text-[10px] text-zinc-500">
                  {language === 'id' ? 'Sesuaikan tabungan aktif, pemandangan pemasukan dsb' : 'Adjust your core financial snapshot for trajectory projections'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono flex items-center justify-between">
                    <span>{t.savedToDate || 'Current Savings'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const calculatedSurplus = Math.max(0, totalDetailedIncome - totalDetailedExpense);
                        setPrefSavings(calculatedSurplus.toString());
                        alert(language === 'id' 
                          ? `Nilai terisi otomatis senilai ${preferences.currency}${calculatedSurplus.toLocaleString()} surplus rincian!` 
                          : `Populated ${preferences.currency}${calculatedSurplus.toLocaleString()} surplus from details!`
                        );
                      }}
                      className="text-[9px] text-indigo-400 hover:text-indigo-300 font-mono hover:underline uppercase transition cursor-pointer font-bold"
                    >
                      {language === 'id' ? 'Surplus Aliran' : 'Sync Flow'}
                    </button>
                  </label>
                  <input
                    type="number"
                    required
                    value={prefSavings}
                    onChange={e => setPrefSavings(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono flex items-center justify-between">
                    <span>{language === 'id' ? 'Pemasukan Bulanan' : 'Monthly Income'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPrefIncome(totalDetailedIncome.toString());
                        alert(language === 'id' 
                          ? `Nilai terisi otomatis senilai ${preferences.currency}${totalDetailedIncome.toLocaleString()} dari transaksi masuk!` 
                          : `Populated ${preferences.currency}${totalDetailedIncome.toLocaleString()} from detailed income transactions!`
                        );
                      }}
                      className="text-[9px] text-indigo-400 hover:text-indigo-300 font-mono hover:underline uppercase transition cursor-pointer font-bold"
                    >
                      {language === 'id' ? 'Sinkronkan Detil' : 'Sync Details'}
                    </button>
                  </label>
                  <input
                    type="number"
                    required
                    value={prefIncome}
                    onChange={e => setPrefIncome(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Alokasi Investasi Bulanan' : 'Monthly Investment'}</label>
                  <input
                    type="number"
                    required
                    value={prefInvestment}
                    onChange={e => setPrefInvestment(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{t.strategicRiskProfile || 'Risk tolerance'}</label>
                  <select
                    value={prefRisk}
                    onChange={e => setPrefRisk(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer font-mono text-xs uppercase"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'id' ? 'Simpan Konfigurasi Akun' : 'Save Account Profile'}</span>
              </button>
            </form>
          </div>

          {/* SUBSCRIPTION INPUTS PANEL */}
          <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-xl space-y-4 font-sans">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {language === 'id' ? 'INPUT LANGGANAN BARU' : 'ADD LEAKING SUBSCRIPTIONS'}
                </h4>
                <p className="text-[10px] text-zinc-500">
                  {language === 'id' ? 'Masukkan keanggawaran / layanan bulanan untuk dipindai oleh sensor' : 'Add subscription details for anti-leak tracking'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-3 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Nama Layanan' : 'Subscription Name'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Premium, Gym CoreFit, Cloud Hosting"
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Biaya Bulanan' : 'Monthly Fee'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 150000"
                    value={newSubCost}
                    onChange={e => setNewSubCost(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Status Layanan' : 'Service Status'}</label>
                  <div className="flex items-center gap-2 p-2.5 bg-zinc-950 border border-white/10 rounded-lg h-[41px]">
                    <input
                      type="checkbox"
                      id="sub_status_check"
                      checked={newSubActive}
                      onChange={e => setNewSubActive(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-white/10"
                    />
                    <label htmlFor="sub_status_check" className="text-zinc-300 text-[11px] font-sans">
                      {language === 'id' ? 'Aktif Digunakan' : 'Actively Used'}
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 text-[10px] uppercase font-mono">{language === 'id' ? 'Catatan Keterangan' : 'Description Memo'}</label>
                <input
                  type="text"
                  placeholder={language === 'id' ? 'e.g. Menguras Rp 150.000 / bln • Jarang Log-In' : 'e.g. Draining monthly • Zero login record'}
                  value={newSubDesc}
                  onChange={e => setNewSubDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer font-mono text-xs uppercase"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'id' ? 'Tambah Langganan' : 'Add Subscription'}</span>
              </button>
            </form>

            {/* List of current dynamic subscriptions */}
            <div className="border-t border-white/5 pt-4 space-y-2 font-sans">
              <span className="text-[9px] font-mono uppercase text-zinc-500 block mb-2">{language === 'id' ? 'DAFTAR SENSOR LANGGANAN DI-AUDIT' : 'CURRENT SUBSCRIPTION AUDIT FEED'}</span>
              
              {subscriptions.length === 0 ? (
                <div className="text-center p-4 bg-zinc-950/20 border border-dashed border-white/5 text-zinc-500 rounded-xl text-[11px]">
                  {language === 'id' ? 'Tidak ada langganan terdaftar' : 'No subscriptions registered'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {subscriptions.map(sub => (
                    <div key={sub.id} className="p-3 bg-zinc-950/40 rounded-xl border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition">
                      <div>
                        <span className="font-bold text-white block text-xs">{sub.name}</span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">{sub.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteSubscription(sub.id);
                          // Check if active quest was purging subscription bloat, complete it!
                          if (activeQuestInProgressId === 'quest-1') {
                            onCompleteQuest('quest-1');
                            alert(language === 'id' ? "Luar Biasa! RPG Quest Selesai - Kebocoran berhasil terpangkas dan XP telah didapatkan!" : "Brilliant! RPG Quest Success - Leaking subscription purged and XP credited!");
                          }
                        }}
                        className="p-1 px-2.5 bg-rose-950/30 hover:bg-rose-900 border border-rose-900/40 text-rose-300 font-mono text-[9px] rounded transition cursor-pointer font-black"
                      >
                        {language === 'id' ? 'HAPUS' : 'DELETE'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

