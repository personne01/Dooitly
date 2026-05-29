/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Building2, Coins, Gem, Landmark, Wallet, HelpCircle, 
  Plus, Trash2, Edit2, TrendingUp, Briefcase, HelpCircle as InfoIcon,
  Layers, Percent, ShieldCheck, ArrowRight, Save, X, Download, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Asset, UserPreferences } from '../types';
import { Language } from '../data/translations';
import FutureSimulatorView from './FutureSimulatorView';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AssetCommandCenterProps {
  preferences: UserPreferences;
  onChangePreferences: (prefs: Partial<UserPreferences>) => void;
  language: Language;
  t: any;
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onUpdateAsset: (id: string, asset: Partial<Asset>) => void;
  onDeleteAsset: (id: string) => void;
  activeQuestInProgressId?: string | null;
  onCompleteQuest?: (questId: string) => void;
}

export default function AssetCommandCenterView({
  preferences,
  onChangePreferences,
  language,
  t,
  assets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  activeQuestInProgressId,
  onCompleteQuest
}: AssetCommandCenterProps) {
  const [activeSubTab, setActiveSubTab] = useState<'management' | 'simulator'>('management');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartType, setChartType] = useState<'both' | 'donut' | 'line'>('both');
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
    pdf.save('portfolio_analysis.pdf');
  };

  const exportToCSV = () => {
    const headers = ['Asset Name', 'Category', 'Value', 'Expected Return (%)', 'Institution'];
    const rows = assets.map(a => [
      `"${a.name.replace(/"/g, '""')}"`,
      a.category,
      a.value.toString(),
      a.expectedReturn.toString(),
      `"${(a.institution || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", 'portfolio_assets.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      currency: preferences.currency,
      assets
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", 'portfolio_assets_data.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Input states for new asset
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Asset['category']>('cash');
  const [valueStr, setValueStr] = useState('');
  const [returnStr, setReturnStr] = useState('');
  const [institution, setInstitution] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<Asset['category']>('cash');
  const [editValueStr, setEditValueStr] = useState('');
  const [editReturnStr, setEditReturnStr] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [filter, setFilter] = useState<Asset['category'] | 'all'>('all');

  // Localized strings
  const tr = {
    id: {
      title: "Asset Command Center",
      subtitle: "Manajemen portofolio terenskripsi dan modul proyeksi kekayaan jangka panjang.",
      subTabManagement: "Aset & Investasi Saya",
      subTabSimulator: "Proyeksi Pertumbuhan",
      totalAssets: "Total Nilai Aset",
      totalInvestments: "Total Investasi Aktif",
      weightedReturn: "Weighted Expected Return",
      allAssetsLabel: "Semua Holdings Aset",
      addNewAsset: "Tambah Aset Baru",
      assetNamePlaceholder: "Contoh: Saham S&P 500, Reksadana, Emas",
      categoryLabel: "Kategori",
      institutionLabel: "Lembaga / Broker (Opsional)",
      institutionPlaceholder: "Contoh: Bank BCA, Bibit, Pluang",
      valueLabel: "Nilai Aset saat ini",
      returnLabel: "Estimasi Return Tahunan (%)",
      submitAdd: "Tambahkan Aset",
      submitSave: "Simpan Perubahan",
      cancelEdit: "Batal",
      noAssets: "Belum ada aset terdaftar. Mulai bangun portofolio Anda dengan menambahkan aset baru di panel samping!",
      weightedReturnDesc: "Weighted average return dihitung otomatis berdasarkan alokasi bobot nilai masing-masing aset investasi Anda.",
      cashCat: "Kas & Setara Kas",
      stockCat: "Saham & Reksa Dana",
      cryptoCat: "Crypto & Digital Aset",
      propertyCat: "Properti & Real Estate",
      goldCat: "Logam Mulia / Emas",
      otherCat: "Aset Lainnya",
      allocated: "Dialokasikan"
    },
    en: {
      title: "Asset Command Center",
      subtitle: "Encrypted portfolio management & multi-milestone strategic compound projection.",
      subTabManagement: "My Portfolio & Assets",
      subTabSimulator: "Compounding Projection",
      totalAssets: "Total Asset Value",
      totalInvestments: "Total Active Investments",
      weightedReturn: "Weighted Expected Return",
      allAssetsLabel: "All Asset Holdings",
      addNewAsset: "Register New Asset",
      assetNamePlaceholder: "e.g. S&P 500 Index Fund, Physical Gold",
      categoryLabel: "Category",
      institutionLabel: "Institution / Broker (Optional)",
      institutionPlaceholder: "e.g. Bank Account, Brokerage, Exchange",
      valueLabel: "Current Valuation Asset Value",
      returnLabel: "Expected Annual Yield (%)",
      submitAdd: "Add Asset to Deck",
      submitSave: "Save Modifications",
      cancelEdit: "Cancel",
      noAssets: "No assets found in state registry. Initialize your compound asset blueprint by defining holding sectors!",
      weightedReturnDesc: "Weighted average return automatically reflects proportional scale of your strategic compounding assets.",
      cashCat: "Cash & High-Yield Savings",
      stockCat: "Equities / Stock Funds",
      cryptoCat: "Crypto Assets",
      propertyCat: "Real Estate & Land",
      goldCat: "Physical Gold & Bullions",
      otherCat: "Alternative Assets",
      allocated: "Allocated"
    }
  };

  const l = language === 'id' ? tr.id : tr.en;

  const getCategoryIcon = (cat: Asset['category']) => {
    switch (cat) {
      case 'cash':
        return <Wallet className="w-4 h-4 text-teal-400" />;
      case 'stock':
        return <Landmark className="w-4 h-4 text-indigo-400" />;
      case 'crypto':
        return <Coins className="w-4 h-4 text-cyan-400" />;
      case 'property':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'gold':
        return <Gem className="w-4 h-4 text-yellow-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getCategoryColor = (cat: Asset['category']) => {
    switch (cat) {
      case 'cash': return '#14b8a6'; // teal-500
      case 'stock': return '#6366f1'; // indigo-500
      case 'crypto': return '#06b6d4'; // cyan-500
      case 'property': return '#f59e0b'; // amber-500
      case 'gold': return '#eab308'; // yellow-500
      default: return '#71717a'; // zinc-500
    }
  };

  const getCategoryLabel = (cat: Asset['category']) => {
    switch (cat) {
      case 'cash': return l.cashCat;
      case 'stock': return l.stockCat;
      case 'crypto': return l.cryptoCat;
      case 'property': return l.propertyCat;
      case 'gold': return l.goldCat;
      default: return l.otherCat;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valueStr) || 0;
    const ret = parseFloat(returnStr) || 0;
    if (!name.trim()) return;

    onAddAsset({
      name: name.trim(),
      category,
      value: val,
      expectedReturn: ret,
      institution: institution.trim() || undefined
    });

    // Reset fields
    setName('');
    setValueStr('');
    setReturnStr('');
    setInstitution('');
  };

  const handleStartEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setEditName(asset.name);
    setEditCategory(asset.category);
    setEditValueStr(asset.value.toString());
    setEditReturnStr(asset.expectedReturn.toString());
    setEditInstitution(asset.institution || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    onUpdateAsset(editingId, {
      name: editName.trim(),
      category: editCategory,
      value: parseFloat(editValueStr) || 0,
      expectedReturn: parseFloat(editReturnStr) || 0,
      institution: editInstitution.trim() || undefined
    });

    setEditingId(null);
  };

  // Portfolio calculations
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalInvestments = assets
    .filter(a => a.category !== 'cash')
    .reduce((sum, a) => sum + a.value, 0);

  // Weighted return calculation for investments (or all assets)
  // Formula: sum(asset.value * asset.expectedReturn) / sum(asset.value)
  const totalValueWithReturn = assets.reduce((sum, a) => sum + (a.value * a.expectedReturn), 0);
  const weightedReturn = totalAssets > 0 ? (totalValueWithReturn / totalAssets) : 0;

  // Chart data
  const categoryData = assets.reduce((acc, asset) => {
    const cat = asset.category;
    acc[cat] = (acc[cat] || 0) + asset.value;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, value]) => ({
    name: getCategoryLabel(category as Asset['category']),
    value,
    color: getCategoryColor(category as Asset['category'])
  }));

  // Growth projection data
  const years = Array.from({ length: 21 }, (_, i) => i);
  const chartData = years.map(year => {
    const totalAtYear = assets.reduce((sum, asset) => {
      return sum + (asset.value * Math.pow(1 + (asset.expectedReturn / 100), year));
    }, 0);
    return {
      year,
      value: totalAtYear
    };
  });

  return (
    <div className="space-y-6" id="asset-command-center" ref={componentRef}>
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            {l.title}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">{l.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
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
                    onClick={() => { exportToCSV(); setIsExportOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs transition font-semibold"
                  >
                    📊 CSV (Assets list)
                  </button>
                  <button
                    type="button"
                    onClick={() => { exportToJSON(); setIsExportOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs transition font-semibold"
                  >
                    ⚙️ JSON (Assets data)
                  </button>
                </div>
              </>
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 p-1.5 px-3 border border-white/5 rounded-md uppercase tracking-wider">
            SECURE PORTFOLIO NODE • ACTIVE
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        <button
          onClick={() => setActiveSubTab('management')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeSubTab === 'management'
              ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {l.subTabManagement}
        </button>
        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            activeSubTab === 'simulator'
              ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {l.subTabSimulator}
        </button>
      </div>

      {activeSubTab === 'management' ? (
        <div className="flex flex-col gap-6">
          
          {/* Asset Totals Cards (Full Width Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Total Asset Card */}
            <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl pointer-events-none"></div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                {l.totalAssets}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-teal-400">
                {preferences.currency}{totalAssets.toLocaleString()}
              </h3>
              <div className="text-[9px] text-zinc-500 mt-2 font-mono flex items-center gap-1.5 border-t border-white/5 pt-2">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified live value ledger</span>
              </div>
            </div>

            {/* Total Investments Card */}
            <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                {l.totalInvestments}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-indigo-400">
                {preferences.currency}{totalInvestments.toLocaleString()}
              </h3>
              <div className="text-[9px] text-zinc-500 mt-2 font-mono flex justify-between items-center border-t border-white/5 pt-2">
                <span>{language === 'id' ? 'Porsi Portofolio' : 'Portfolio Share'}</span>
                <span className="text-indigo-400 font-bold">
                  {totalAssets > 0 ? Math.round((totalInvestments / totalAssets) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Weighted Returns Card */}
            <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-yellow-500/5 rounded-full blur-xl pointer-events-none"></div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                Weighted Expected Return
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-yellow-400">
                {weightedReturn.toFixed(2)}% <span className="text-xs text-zinc-500 font-normal">/ thn</span>
              </h3>
              <div className="text-[9px] text-zinc-500 mt-2 font-mono flex items-center justify-between border-t border-white/5 pt-2">
                <span>Yield Compounding Target</span>
                <span className="text-teal-400 font-bold flex items-center gap-0.5">
                  <Percent className="w-3 h-3" /> APY
                </span>
              </div>
            </div>

          </div>

            {/* Donut Chart and Growth Line Chart were here, now moved to the right column */}

            {/* Portfolio Analytics Card (Full Width in Left Column) */}
            {assets.length > 0 && (
              <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                     {language === 'id' ? 'ANALISIS PORTOFOLIO' : 'PORTFOLIO ANALYTICS'}
                  </span>
                  <div className="flex bg-zinc-900 rounded-lg p-1">
                    <button onClick={() => setChartType('both')} className={`p-1.5 rounded-md ${chartType === 'both' ? 'bg-zinc-800' : ''}`}><Layers className="w-3 h-3 text-zinc-400"/></button>
                    <button onClick={() => setChartType('donut')} className={`p-1.5 rounded-md ${chartType === 'donut' ? 'bg-zinc-800' : ''}`}><PieChartIcon className="w-3 h-3 text-zinc-400"/></button>
                    <button onClick={() => setChartType('line')} className={`p-1.5 rounded-md ${chartType === 'line' ? 'bg-zinc-800' : ''}`}><TrendingUp className="w-3 h-3 text-zinc-400"/></button>
                  </div>
                </div>
                
                <div className={chartType === 'both' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "h-64"}>
                  {/* Donut Chart */}
                  {(chartType === 'both' || chartType === 'donut') && (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => `${preferences.currency}${value.toLocaleString()}`}
                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                            itemStyle={{ fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Growth Line Chart */}
                  {(chartType === 'both' || chartType === 'line') && (
                    <div className="h-48 border-l border-white/5 pl-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="year" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${preferences.currency}${val.toLocaleString(undefined, {notation: 'compact'})}`} />
                          <Tooltip 
                            formatter={(value: number) => [`${preferences.currency}${Math.round(value).toLocaleString()}`, 'Value']}
                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                          />
                          <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* List of Asset Holdings */}
            <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  {l.allAssetsLabel} ({assets.length})
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">
                  MANAGED ASSETS LEDGER
                </span>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
                >
                  All
                </button>
                {(['cash', 'stock', 'crypto', 'property', 'gold', 'other'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>

              {assets.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-dashed border-white/5">
                  <HelpCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {l.noAssets}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {assets.filter(a => filter === 'all' || a.category === filter).map((asset) => (
                    <div 
                      key={asset.id} 
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        editingId === asset.id 
                          ? 'bg-indigo-950/15 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.08)]' 
                          : 'bg-zinc-950/50 hover:bg-zinc-900/40 border-white/5'
                      }`}
                    >
                      {editingId === asset.id ? (
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] text-zinc-400 font-mono uppercase">Nama Aset</label>
                              <input 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-zinc-400 font-mono uppercase">Lembaga / Broker</label>
                              <input 
                                type="text"
                                value={editInstitution}
                                onChange={(e) => setEditInstitution(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] text-zinc-400 font-mono uppercase">{l.categoryLabel}</label>
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value as Asset['category'])}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                              >
                                <option value="cash">{l.cashCat}</option>
                                <option value="stock">{l.stockCat}</option>
                                <option value="crypto">{l.cryptoCat}</option>
                                <option value="property">{l.propertyCat}</option>
                                <option value="gold">{l.goldCat}</option>
                                <option value="other">{l.otherCat}</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-zinc-400 font-mono uppercase">Nilai Aset ({preferences.currency})</label>
                              <input 
                                type="number"
                                value={editValueStr}
                                onChange={(e) => setEditValueStr(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-zinc-400 font-mono uppercase">Return Tahunan (%)</label>
                              <input 
                                type="number"
                                step="0.1"
                                value={editReturnStr}
                                onChange={(e) => setEditReturnStr(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/5 rounded-lg text-xs font-mono uppercase cursor-pointer"
                            >
                              {l.cancelEdit}
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {l.submitSave}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between gap-4 select-none">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-zinc-900/60 rounded-xl flex items-center justify-center border border-white/5">
                              {getCategoryIcon(asset.category)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold text-xs font-sans">{asset.name}</span>
                                {asset.institution && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/5 text-zinc-500 rounded font-mono uppercase">
                                    {asset.institution}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 font-mono uppercase">
                                <span>{getCategoryLabel(asset.category)}</span>
                                <span>•</span>
                                <span className="text-yellow-500">+{asset.expectedReturn}% Return</span>
                                {asset.createdAt && (
                                  <>
                                    <span>•</span>
                                    <span title={new Date(asset.createdAt).toLocaleString()}>
                                      {language === 'id' ? 'Dibuat: ' : 'Created: '}{new Date(asset.createdAt).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                                {asset.updatedAt && (
                                  <>
                                    <span>•</span>
                                    <span title={new Date(asset.updatedAt).toLocaleString()}>
                                      {language === 'id' ? 'Diperbarui: ' : 'Updated: '}{new Date(asset.updatedAt).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="block text-white font-mono font-bold text-xs select-text">
                                {preferences.currency}{asset.value.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono uppercase">
                                {totalAssets > 0 ? Math.round((asset.value / totalAssets) * 100) : 0}% {l.allocated}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEdit(asset)}
                                className="p-1.5 bg-zinc-900 hover:bg-zinc-850 hover:text-indigo-400 text-zinc-500 rounded-lg border border-white/5 transition-colors cursor-pointer"
                                title="Edit holding info"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteAsset(asset.id)}
                                className="p-1.5 bg-zinc-900 hover:bg-red-950/30 hover:text-red-400 text-zinc-500 rounded-lg border border-white/5 transition-colors cursor-pointer"
                                title="Remove asset holding"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Explainer card for weighted average returns info */}
            <div className="bg-zinc-950/40 p-4 border border-white/5 rounded-2xl flex gap-3 select-none">
              <InfoIcon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-wide text-zinc-400 font-semibold uppercase block">
                  Weighted compounding physics
                </span>
                <p className="text-xs text-zinc-500 leading-normal font-sans">
                  {l.weightedReturnDesc}
                </p>
              </div>
            </div>

          {/* RIGHT SIDE: Add Asset Form card + Merged Charts */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Tambah Asset Button and Modal */}
            <button
               onClick={() => setIsModalOpen(true)}
               className="w-full py-4 border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-2xl flex items-center justify-center gap-2 text-zinc-500 hover:text-indigo-400 transition-all cursor-pointer bg-zinc-950/20"
            >
              <Plus className="w-5 h-5" />
              <span className="font-mono text-xs font-bold uppercase">{l.addNewAsset}</span>
            </button>

            {/* Weighted Returns Card */}
            <div className="bg-gradient-to-br from-zinc-900/60 to-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-yellow-500/5 rounded-full blur-xl pointer-events-none"></div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                Weighted Expected Return
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-yellow-400">
                {weightedReturn.toFixed(2)}% <span className="text-xs text-zinc-500 font-normal">/ thn</span>
              </h3>
              <div className="text-[9px] text-zinc-500 mt-2 font-mono flex items-center justify-between border-t border-white/5 pt-2">
                <span>Yield Compounding Target</span>
                <span className="text-teal-400 font-bold flex items-center gap-0.5">
                  <Percent className="w-3 h-3" /> APY
                </span>
              </div>
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-[#0a0a0a] w-full max-w-lg p-6 rounded-2xl border border-white/5 shadow-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-mono uppercase font-bold text-white">
                      {l.addNewAsset}
                    </h4>
                    <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
                  </div>
                  <form onSubmit={(e) => { handleSubmit(e); setIsModalOpen(false); }} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">Nama Aset</label>
                      <input 
                        type="text"
                        required
                        placeholder={l.assetNamePlaceholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900 shadow-inner border border-white/5 focus:border-indigo-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none placeholder:text-zinc-650 transition duration-150 font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">{l.categoryLabel}</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Asset['category'])}
                        className="w-full bg-zinc-900 shadow-inner border border-white/5 focus:border-indigo-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                       <option value="cash">{l.cashCat}</option>
                       <option value="stock">{l.stockCat}</option>
                       <option value="crypto">{l.cryptoCat}</option>
                       <option value="property">{l.propertyCat}</option>
                       <option value="gold">{l.goldCat}</option>
                       <option value="other">{l.otherCat}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">{l.institutionLabel}</label>
                      <input 
                        type="text"
                        placeholder={l.institutionPlaceholder}
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full bg-zinc-900 shadow-inner border border-white/5 focus:border-indigo-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none placeholder:text-zinc-650 transition duration-150 font-sans"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">Nilai Aset ({preferences.currency})</label>
                        <input 
                          type="number"
                          required
                          value={valueStr}
                          onChange={(e) => setValueStr(e.target.value)}
                          className="w-full bg-zinc-900 shadow-inner border border-white/5 focus:border-indigo-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">APY Return (%)</label>
                        <input 
                          type="number"
                          step="0.1"
                          required
                          value={returnStr}
                          onChange={(e) => setReturnStr(e.target.value)}
                          className="w-full bg-zinc-900 shadow-inner border border-white/5 focus:border-indigo-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2.5 mt-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{l.submitAdd}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Future projections / Compound simulation moved dynamically within ACC page */
        <FutureSimulatorView 
          preferences={preferences}
          onChangePreferences={onChangePreferences}
          language={language}
          t={t}
          activeQuestInProgressId={activeQuestInProgressId}
          onCompleteQuest={onCompleteQuest}
        />
      )}

    </div>
  );
}
