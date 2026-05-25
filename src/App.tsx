/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Cpu, Wallet, TrendingUp, Activity, 
  ShieldAlert, Landmark, BookOpen, Layers, Target, Coins, Globe, Trash2,
  Menu, X
} from 'lucide-react';
import { Transaction, FinancialGoal, UserPreferences, MonthlyRecap } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_GOALS } from './data/mockTransactions';
import { TRANSLATIONS, Language } from './data/translations';

// Import our modular subviews
import DashboardView from './components/DashboardView';
import AdvisorChatView from './components/AdvisorChatView';
import HealthAnalyzerView from './components/HealthAnalyzerView';
import ScamDetectorView from './components/ScamDetectorView';
import FutureSimulatorView from './components/FutureSimulatorView';
import PitchRoomView from './components/PitchRoomView';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Language preference managed in local memory
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('aura_language');
    return (saved === 'en' || saved === 'id') ? saved : 'en';
  });

  // 2. Multi-state profile preferences in local memory - DEFAULT TO 0 / Rp
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('aura_preferences');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      currency: 'Rp',
      monthlyIncome: 0,
      currentSavings: 0,
      monthlyInvestment: 0,
      riskAppetite: 'moderate'
    };
  });

  // 3. Transactions managed in local memory - DEFAULT TO EMPTY ARRAY
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('aura_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // 4. Financial Goals managed in local memory - DEFAULT TO EMPTY ARRAY
  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('aura_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // 5. Monthly Recaps list
  const [monthlyRecaps, setMonthlyRecaps] = useState<MonthlyRecap[]>(() => {
    const saved = localStorage.getItem('aura_monthly_recaps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Onboarding completion status state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const completed = localStorage.getItem('aura_onboarding_completed');
    return completed !== 'true';
  });

  // Onboarding temporary form states
  const [onboardCurrency, setOnboardCurrency] = useState('Rp');
  const [onboardIncome, setOnboardIncome] = useState('');
  const [onboardSavings, setOnboardSavings] = useState('');
  const [onboardInvestment, setOnboardInvestment] = useState('');
  const [onboardRisk, setOnboardRisk] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  const handleCompleteOnboarding = (initialPrefs: UserPreferences) => {
    setPreferences(initialPrefs);
    localStorage.setItem('aura_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('aura_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('aura_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('aura_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('aura_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('aura_monthly_recaps', JSON.stringify(monthlyRecaps));
  }, [monthlyRecaps]);

  // Selected translations dictionary
  const t = TRANSLATIONS[language];

  // Setup preference updates
  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updated }));
  };

  // Add real manual transactions
  const handleAddTransaction = (desc: string, amount: number, cat: string, type: 'income' | 'expense') => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: desc,
      category: cat,
      amount: amount,
      type: type
    };
    setTransactions(prev => [newTx, ...prev]);

    // Update current savings when transaction is added to reflect live compound state changes
    if (type === 'income') {
      setPreferences(prev => ({ ...prev, currentSavings: prev.currentSavings + amount }));
    } else {
      setPreferences(prev => ({ ...prev, currentSavings: Math.max(0, prev.currentSavings - amount) }));
    }
  };

  // Add financial goals
  const handleAddGoal = (name: string, targetAmount: number, currentSaved: number, targetYear: number, category: any) => {
    const newGoal: FinancialGoal = {
      id: `goal-${Date.now()}`,
      name,
      targetAmount,
      currentSaved,
      targetYear,
      category
    };
    setGoals(prev => [...prev, newGoal]);
  };

  // Delete individual financial goal
  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Delete individual transaction
  const handleDeleteTransaction = (txId: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== txId));
  };

  // Monthly Data Recapitulation Handlers
  const handleAddMonthlyRecap = (recap: Omit<MonthlyRecap, 'id'>) => {
    const newRecap: MonthlyRecap = {
      ...recap,
      id: `recap-${Date.now()}`
    };
    setMonthlyRecaps(prev => [newRecap, ...prev]);
  };

  const handleApplyMonthlyRecap = (recap: MonthlyRecap) => {
    setPreferences(prev => ({
      ...prev,
      monthlyIncome: recap.monthlyIncome,
      currentSavings: recap.currentSavings,
      monthlyInvestment: recap.monthlyInvestment
    }));
  };

  const handleDeleteMonthlyRecap = (recapId: string) => {
    setMonthlyRecaps(prev => prev.filter(r => r.id !== recapId));
  };

  // Clear all mock defaults to start with actual pristine user input
  const handleClearToCleanSlate = () => {
    if (window.confirm(t.syncAssetsConfirm)) {
      setTransactions([]);
      setGoals([]);
      setMonthlyRecaps([]);
      setPreferences({
        currency: 'Rp',
        monthlyIncome: 0,
        currentSavings: 0,
        monthlyInvestment: 0,
        riskAppetite: 'moderate'
      });
      localStorage.removeItem('aura_onboarding_completed');
      setShowOnboarding(true);
      alert(t.syncAssetsSuccess || "State synchronized into a fresh slate!");
    }
  };

  const currentSavingsRate = preferences.monthlyIncome > 0 
    ? Math.round((preferences.monthlyInvestment / preferences.monthlyIncome) * 100) 
    : 0;

  return (
    <div id="aura_os_app_frame" className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Absolute futuristic ambient glow background anchors */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Primary responsive grid split into a sleek sidebar and main workspace */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between bg-[#080808]/95 backdrop-blur-md p-4 mb-6 rounded-2xl border border-white/10 shadow-lg select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.3)] shrink-0">
              <span className="font-black text-white text-base italic">A</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-zinc-500 font-bold text-xs tracking-widest">ATURDUIT</span>
                <span className="text-white font-extrabold text-xs tracking-wider">AI</span>
              </div>
              <p className="text-[8px] text-zinc-500 font-mono">v2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-teal-400 mr-2 bg-zinc-950 px-2.5 py-1 rounded-lg border border-white/5">
              {preferences.currency}{preferences.currentSavings.toLocaleString()}
            </span>
            <button
              id="mobile_menu_trigger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-zinc-900 border border-white/10 rounded-xl text-white hover:bg-zinc-850 transition cursor-pointer flex items-center justify-center w-9 h-9"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Brand + Icon-text Navigation list + Language switcher */}
          <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block lg:col-span-3 bg-[#080808]/95 backdrop-blur-md p-6 rounded-2xl border border-white/15 shadow-[0_4px_30px_rgba(0,0,0,0.8)] space-y-6 w-full mb-6 lg:mb-0`}>
            
            {/* Logo block */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.35)] shrink-0 select-none">
                <span className="font-black text-white text-xl italic">A</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500 font-bold text-sm tracking-widest">ATURDUIT</span>
                  <span className="text-white font-extrabold text-sm tracking-wider">AI</span>
                </div>
                <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] uppercase font-bold tracking-widest rounded">
                  {t.activeMode}
                </span>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">v2.5 Flash</p>
              </div>
            </div>

            {/* Language Selection widgets */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                {t.selectLanguage}
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-zinc-950 p-1 rounded-lg border border-white/5">
                <button
                  id="lang_picker_en"
                  onClick={() => setLanguage('en')}
                  className={`py-1.5 text-[10px] font-mono font-bold rounded uppercase transition-all ${
                    language === 'en' 
                      ? 'bg-indigo-950 text-indigo-300 shadow-md border border-indigo-900/40' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  English
                </button>
                <button
                  id="lang_picker_id"
                  onClick={() => setLanguage('id')}
                  className={`py-1.5 text-[10px] font-mono font-bold rounded uppercase transition-all ${
                    language === 'id' 
                      ? 'bg-indigo-950 text-indigo-300 shadow-md border border-indigo-900/40' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Indonesian
                </button>
              </div>
            </div>

            {/* Custom Interactive Side Tab Bar - Icon + Text format */}
            <nav id="applet_tabs_rail" className="flex flex-col gap-1.5 pt-2">
              
              <button 
                id="tab_overview"
                onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
                className={`py-3 px-3.5 rounded-xl text-left text-xs font-semibold tracking-wide transition flex items-center gap-3 ${
                  activeTab === 'overview' 
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-bold' 
                    : 'bg-white/0 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <Activity className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>{t.tabOverview}</span>
              </button>

              <button 
                id="tab_chat"
                onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
                className={`py-3 px-3.5 rounded-xl text-left text-xs font-semibold tracking-wide transition flex items-center gap-3 ${
                  activeTab === 'chat' 
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-bold' 
                    : 'bg-white/0 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <Cpu className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>{t.tabChat}</span>
              </button>

              <button 
                id="tab_health"
                onClick={() => { setActiveTab('health'); setIsMobileMenuOpen(false); }}
                className={`py-3 px-3.5 rounded-xl text-left text-xs font-semibold tracking-wide transition flex items-center gap-3 ${
                  activeTab === 'health' 
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-bold' 
                    : 'bg-white/0 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <Wallet className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{t.tabHealth}</span>
              </button>

              <button 
                id="tab_scam"
                onClick={() => { setActiveTab('scam'); setIsMobileMenuOpen(false); }}
                className={`py-3 px-3.5 rounded-xl text-left text-xs font-semibold tracking-wide transition flex items-center gap-3 ${
                  activeTab === 'scam' 
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-bold' 
                    : 'bg-white/0 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{t.tabScam}</span>
              </button>

              <button 
                id="tab_simulator"
                onClick={() => { setActiveTab('simulator'); setIsMobileMenuOpen(false); }}
                className={`py-3 px-3.5 rounded-xl text-left text-xs font-semibold tracking-wide transition flex items-center gap-3 ${
                  activeTab === 'simulator' 
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-bold' 
                    : 'bg-white/0 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{t.tabSimulator}</span>
              </button>

              <button 
                id="tab_pitch"
                onClick={() => { setActiveTab('pitch'); setIsMobileMenuOpen(false); }}
                className={`py-3 px-3.5 rounded-xl text-left text-xs font-semibold tracking-wide transition flex items-center gap-3 border border-transparent ${
                  activeTab === 'pitch' 
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-bold' 
                    : 'bg-white/0 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0 text-purple-400" />
                <span>{t.tabPitch}</span>
              </button>

            </nav>

            {/* Settings and clear states */}
            <div className="border-t border-white/10 pt-5 space-y-3.5">
              <div className="text-[10px] text-zinc-500 font-mono tracking-tighter">
                <span className="block font-bold mb-1">LOCAL DISPATCH MEMORY:</span>
                <p className="text-zinc-400 leading-normal">{t.localMemoryAlert}</p>
              </div>

              <button
                id="clear_to_user_data_btn"
                onClick={handleClearToCleanSlate}
                className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 border border-rose-900/30 rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.syncAssets}</span>
              </button>
            </div>

            {/* Basic user indicators */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono uppercase">{t.savingsRate}:</span>
                <span className="text-white font-mono font-black">{currentSavingsRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono uppercase">Status:</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  {t.systemSecured}
                </span>
              </div>
            </div>

          </aside>

          {/* RIGHT WORKSPACE: Renders selected subview */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Core Router view space */}
            <div id="primary_tab_contents_router" className="animate-fade-in duration-300">
              
              {activeTab === 'overview' && (
                <DashboardView 
                  preferences={preferences} 
                  transactions={transactions} 
                  goals={goals} 
                  onChangePreferences={handleUpdatePreferences} 
                  onNavigateToTab={setActiveTab}
                  onAddGoal={handleAddGoal}
                  onDeleteGoal={handleDeleteGoal}
                  language={language}
                  t={t}
                  monthlyRecaps={monthlyRecaps}
                  onAddMonthlyRecap={handleAddMonthlyRecap}
                  onApplyMonthlyRecap={handleApplyMonthlyRecap}
                  onDeleteMonthlyRecap={handleDeleteMonthlyRecap}
                />
              )}

              {activeTab === 'chat' && (
                <AdvisorChatView 
                  preferences={preferences}
                  language={language}
                  t={t}
                />
              )}

              {activeTab === 'health' && (
                <HealthAnalyzerView 
                  preferences={preferences} 
                  transactions={transactions} 
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  language={language}
                  t={t}
                />
              )}

              {activeTab === 'scam' && (
                <ScamDetectorView 
                  language={language}
                  t={t}
                />
              )}

              {activeTab === 'simulator' && (
                <FutureSimulatorView 
                  preferences={preferences} 
                  onChangePreferences={handleUpdatePreferences}
                  language={language}
                  t={t}
                />
              )}

              {activeTab === 'pitch' && (
                <PitchRoomView 
                  language={language}
                  t={t}
                />
              )}

            </div>

            {/* Footer info branding block */}
            <footer id="aura_footer_notes" className="flex flex-col sm:flex-row justify-between items-center bg-[#080808]/80 p-5 rounded-2xl border border-white/10 text-[10px] text-zinc-500 gap-4">
              <div className="flex items-center gap-2 font-mono">
                <span>ATURDUIT FINANCIAL OS</span>
                <span className="text-zinc-800">•</span>
                <span>POWERED BY ADVANCED GEMINI INTELLIGENCE</span>
              </div>
              <span className="font-mono text-zinc-600 uppercase tracking-widest">
                SECURE DEVICE MEMORY ENGINE ACTIVE
              </span>
            </footer>

          </main>

        </div>
      </div>

      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.8)] space-y-6 animate-fade-in relative overflow-hidden select-none">
            {/* ambient decor */}
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="text-center relative">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <span className="font-black text-white text-xl italic select-none">A</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {language === 'id' ? 'Selamat Datang di AturDuit Financial OS' : 'Welcome to AturDuit Financial OS'}
              </h2>
              <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto">
                {language === 'id' 
                  ? 'Let\'s calibrate your financial dashboard! Mulailah dengan mengisi preferensi dasar di bawah ini.' 
                  : 'Let\'s calibrate your personal financial workspace. Fill in your basic info below to begin.'}
              </p>
              
              {/* Language switcher inside onboarding */}
              <div className="mt-4 flex justify-center gap-2">
                <button 
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-mono font-bold transition-all ${language === 'id' ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300' : 'bg-zinc-900 border border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                >
                  Indonesian (ID)
                </button>
                <button 
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-mono font-bold transition-all ${language === 'en' ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300' : 'bg-zinc-900 border border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCompleteOnboarding({
                currency: onboardCurrency,
                monthlyIncome: parseFloat(onboardIncome) || 0,
                currentSavings: parseFloat(onboardSavings) || 0,
                monthlyInvestment: parseFloat(onboardInvestment) || 0,
                riskAppetite: onboardRisk
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Currency */}
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-zinc-400 text-xs font-mono font-medium block">
                    {language === 'id' ? 'Simbol Mata Uang' : 'Currency Symbol'}
                  </label>
                  <select
                    value={onboardCurrency}
                    onChange={(e) => setOnboardCurrency(e.target.value)}
                    className="w-full bg-zinc-90 w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-505 focus:border-indigo-500 text-sm"
                  >
                    <option value="Rp">Rp (IDR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="¥">¥ (JPY)</option>
                  </select>
                </div>

                {/* Risk Profile */}
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-zinc-400 text-xs font-mono font-medium block">
                    {language === 'id' ? 'Profil Risiko' : 'Risk Profile'}
                  </label>
                  <select
                    value={onboardRisk}
                    onChange={(e) => setOnboardRisk(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="conservative">{language === 'id' ? 'Konservatif' : 'Conservative'}</option>
                    <option value="moderate">{language === 'id' ? 'Moderat' : 'Moderate'}</option>
                    <option value="aggressive">{language === 'id' ? 'Agresif' : 'Aggressive'}</option>
                  </select>
                </div>
              </div>

              {/* Monthly Income */}
              <div className="space-y-1">
                <label className="text-zinc-400 text-xs font-mono font-medium block flex justify-between">
                  <span>{language === 'id' ? 'Pemasukan Bulanan' : 'Monthly Income'}</span>
                   <span className="text-[10px] text-zinc-500 font-mono">({onboardCurrency})</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder={onboardCurrency === 'Rp' ? 'Contoh: 7500000' : 'e.g. 3500'}
                  value={onboardIncome}
                  onChange={(e) => setOnboardIncome(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono"
                />
              </div>

              {/* Current Savings */}
              <div className="space-y-1">
                <label className="text-zinc-400 text-xs font-mono font-medium block flex justify-between">
                  <span>{language === 'id' ? 'Tabungan / Aset Saat Ini' : 'Current Savings / Assets'}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({onboardCurrency})</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder={onboardCurrency === 'Rp' ? 'Contoh: 25000000' : 'e.g. 12000'}
                  value={onboardSavings}
                  onChange={(e) => setOnboardSavings(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono"
                />
              </div>

              {/* Monthly Investment */}
              <div className="space-y-1">
                <label className="text-zinc-400 text-xs font-mono font-medium block flex justify-between">
                  <span>{language === 'id' ? 'Komitmen Investasi Bulanan' : 'Monthly Investment Target'}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({onboardCurrency})</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder={onboardCurrency === 'Rp' ? 'Contoh: 1500000' : 'e.g. 500'}
                  value={onboardInvestment}
                  onChange={(e) => setOnboardInvestment(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold p-3.5 rounded-xl transition-all duration-150 shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 cursor-pointer mt-6 text-sm"
              >
                <span>{language === 'id' ? 'Mulai Pemantauan Finansial' : 'Begin Financial Monitoring'}</span>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
