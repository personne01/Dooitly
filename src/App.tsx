/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Cpu, Wallet, TrendingUp, Activity, 
  ShieldAlert, Landmark, Layers, Target, Coins, Globe, Trash2,
  Menu, X, LayoutDashboard, Banknote, Briefcase, MessageSquare, Presentation,
} from 'lucide-react';
import { Transaction, FinancialGoal, UserPreferences, MonthlyRecap, Subscription, Asset } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_GOALS } from './data/mockTransactions';
import { TRANSLATIONS, Language } from './data/translations';

// Import our modular subviews
import DashboardView from './components/DashboardView';
import AdvisorChatView from './components/AdvisorChatView';
import ScamDetectorView from './components/ScamDetectorView';
import FutureSimulatorView from './components/FutureSimulatorView';
import AboutDooitlyView from './components/AboutDooitlyView';
import FinancialCommandCenterView from './components/FinancialCommandCenterView';
import AssetCommandCenterView from './components/AssetCommandCenterView';
// @ts-ignore
// Inline styled logo utilized below to bypass binary file restrictions in static hosting


export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

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

  // 6. Subscriptions list
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('aura_subscriptions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'sub-1',
        name: 'Unused Fitness Application',
        cost: 220000,
        isActive: false,
        description: 'Menguras Rp 220.000 / bln • Penggunaan Nol'
      },
      {
        id: 'sub-2',
        name: 'Decommissioned cloud stack space',
        cost: 450000,
        isActive: false,
        description: 'Menguras Rp 450.000 / bln • API Tidak Aktif'
      }
    ];
  });

  // 9. Assets list state managed in offline-first secure memory
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('aura_assets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'ast-1',
        name: 'Tabungan Utama',
        category: 'cash',
        value: 15500000,
        expectedReturn: 2.5,
        institution: 'Bank BCA'
      },
      {
        id: 'ast-2',
        name: 'Indo-Index Equity Mutual Fund',
        category: 'stock',
        value: 10000000,
        expectedReturn: 8.5,
        institution: 'Bibit'
      }
    ];
  });

  const handleAddAsset = (asset: Omit<Asset, 'id'>) => {
    const now = new Date().toISOString();
    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      ...asset,
      createdAt: now,
      updatedAt: now
    };
    setAssets(prev => [...prev, newAsset]);
    showToast(language === 'id' ? `Aset "${asset.name}" berhasil didaftarkan!` : `Asset "${asset.name}" registered successfully!`);
  };

  const handleUpdateAsset = (id: string, updatedFields: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields, updatedAt: new Date().toISOString() } : a));
    showToast(language === 'id' ? `Aset berhasil diperbarui!` : `Asset updated successfully!`);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => {
      const remaining = prev.filter(a => a.id !== id);
      return remaining;
    });
    showToast(language === 'id' ? `Aset berhasil dihapus!` : `Asset removed successfully!`);
  };

  // 7. Active quest ID currently in progress
  const [activeQuestInProgressId, setActiveQuestInProgressId] = useState<string | null>(() => {
    return localStorage.getItem('aura_active_quest_id') || null;
  });

  // 8. Financial RPG Quests state
  const [questsList, setQuestsList] = useState(() => {
    const saved = localStorage.getItem('aura_quests_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'quest-1',
        title: 'Purge Subscription Bloat',
        description: 'Scan and identify recurring services you have not used in 30 days.',
        status: 'pending',
        xpReward: 350,
        category: 'Lifestyle'
      },
      {
        id: 'quest-2',
        title: 'Anti-Scam Awareness Training',
        description: 'Analyze a hypothetical high-yield opportunity with the Scam Sentinel.',
        status: 'pending',
        xpReward: 200,
        category: 'Security'
      },
      {
        id: 'quest-3',
        title: 'Emergency Core Shield',
        description: 'Direct 10% of this month\'s income surplus into your compound index fund.',
        status: 'completed',
        xpReward: 500,
        category: 'Wealth'
      }
    ];
  });

  // Onboarding completion status state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const completed = localStorage.getItem('aura_onboarding_completed');
    return completed !== 'true';
  });

  // Sidebar show/hidden state requested by user
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('aura_sidebar_expanded');
    return saved !== 'false';
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
    localStorage.setItem('aura_sidebar_expanded', isSidebarExpanded ? 'true' : 'false');
  }, [isSidebarExpanded]);

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

  useEffect(() => {
    localStorage.setItem('aura_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('aura_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('aura_quests_list', JSON.stringify(questsList));
  }, [questsList]);

  useEffect(() => {
    if (activeQuestInProgressId) {
      localStorage.setItem('aura_active_quest_id', activeQuestInProgressId);
    } else {
      localStorage.removeItem('aura_active_quest_id');
    }
  }, [activeQuestInProgressId]);

  // Selected translations dictionary
  const t = TRANSLATIONS[language];

  const handleCompleteQuest = (questId: string) => {
    setQuestsList(prev => prev.map(q => q.id === questId ? { ...q, status: 'completed' } : q));
    setActiveQuestInProgressId(null);
  };

  // Setup preference updates
  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updated }));
  };

  // Dynamic Subscription Methods
  const handleAddSubscription = (name: string, cost: number, isActive: boolean, description?: string) => {
    const currencySym = preferences.currency || 'Rp';
    const finalDescription = description || (language === 'id' 
      ? `Menguras ${currencySym} ${cost.toLocaleString()} / bln • Konfigurasi manual`
      : `Draining ${currencySym} ${cost.toLocaleString()} / mo • Custom active entry`);

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      name,
      cost,
      isActive,
      description: finalDescription
    };
    setSubscriptions(prev => [...prev, newSub]);
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  // Add real manual transactions
  const handleAddTransaction = (desc: string, amount: number, cat: string, type: 'income' | 'expense', date?: string) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
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

  // Trigger custom confirmation modal instead of blocking and failing native dialogs
  const handleClearToCleanSlate = () => {
    setShowClearConfirm(true);
  };

  const handlePerformClearAll = () => {
    // 1. Clear all React states
    setTransactions([]);
    setGoals([]);
    setMonthlyRecaps([]);
    setSubscriptions([
      {
        id: 'sub-1',
        name: 'Unused Fitness Application',
        cost: 220000,
        isActive: false,
        description: 'Menguras Rp 220.000 / bln • Penggunaan Nol'
      },
      {
        id: 'sub-2',
        name: 'Decommissioned cloud stack space',
        cost: 450000,
        isActive: false,
        description: 'Menguras Rp 450.000 / bln • API Tidak Aktif'
      }
    ]);
    setPreferences({
      currency: 'Rp',
      monthlyIncome: 0,
      currentSavings: 0,
      monthlyInvestment: 0,
      riskAppetite: 'moderate'
    });
    setActiveQuestInProgressId(null);
    setQuestsList([
      {
        id: 'quest-1',
        title: 'Purge Subscription Bloat',
        description: 'Scan and identify recurring services you have not used in 30 days.',
        status: 'pending',
        xpReward: 350,
        category: 'Lifestyle'
      },
      {
        id: 'quest-2',
        title: 'Anti-Scam Awareness Training',
        description: 'Analyze a hypothetical high-yield opportunity with the Scam Sentinel.',
        status: 'pending',
        xpReward: 200,
        category: 'Security'
      },
      {
        id: 'quest-3',
        title: 'Emergency Core Shield',
        description: 'Direct 10% of this month\'s income surplus into your compound index fund.',
        status: 'completed',
        xpReward: 500,
        category: 'Wealth'
      }
    ]);
    setAssets([]);

    // 2. Clear onboarding input fields to start pristine
    setOnboardIncome('');
    setOnboardSavings('');
    setOnboardInvestment('');
    setOnboardCurrency('Rp');
    setOnboardRisk('moderate');

    // 3. Purge all related localStorage keys
    localStorage.removeItem('aura_onboarding_completed');
    localStorage.removeItem('aura_preferences');
    localStorage.removeItem('aura_transactions');
    localStorage.removeItem('aura_goals');
    localStorage.removeItem('aura_assets');
    localStorage.removeItem('aura_monthly_recaps');
    localStorage.removeItem('aura_subscriptions');
    localStorage.removeItem('aura_quests_list');
    localStorage.removeItem('aura_active_quest_id');
    localStorage.removeItem('aura_cashflow_ai_report');

    // 4. Force onboarding overlay, clean tabs, and hide confirm panel
    setShowOnboarding(true);
    setActiveTab('overview');
    setShowClearConfirm(false);

    showToast(t.syncAssetsSuccess || "Sistem disinkronkan ke kondisi bersih!");
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
      <div className="max-w-[1550px] mx-auto px-4 py-8">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between bg-[#080808]/95 backdrop-blur-md p-4 mb-6 rounded-2xl border border-white/10 shadow-lg select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-[0_0_10px_rgba(99,102,241,0.3)] shrink-0 bg-[#0a0a0a] flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white italic select-none text-sm">
                d
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white font-extrabold text-sm tracking-wider">dooitly</span>
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
          <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block ${isSidebarExpanded ? 'lg:col-span-3' : 'lg:col-span-1'} bg-[#080808]/95 backdrop-blur-md p-6 rounded-2xl border border-white/15 shadow-[0_4px_30px_rgba(0,0,0,0.8)] space-y-6 w-full mb-6 lg:mb-0 relative transition-all duration-300`}>
            
            {/* Logo block with desktop collapse/expand selector */}
             <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.35)] shrink-0 select-none bg-[#0a0a0a] flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white italic select-none text-base">
                    d
                  </div>
                </div>
                {isSidebarExpanded && (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-extrabold text-base tracking-wider">dooitly</span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] uppercase font-bold tracking-widest rounded">
                      {t.activeMode}
                    </span>
                    <p className="text-[9px] text-zinc-500 font-mono mt-0.5">v2.5 Flash</p>
                  </div>
                )}
              </div>

              {/* Toggle to collapse/expand navigation menu on desktop layout */}
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="hidden lg:flex p-1.5 bg-white/5 hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/25 rounded-md text-zinc-500 hover:text-indigo-400 transition cursor-pointer"
                title={isSidebarExpanded ? (language === 'id' ? 'Sembunyikan Navigasi' : 'Collapse Sidebar') : (language === 'id' ? 'Tampilkan Navigasi' : 'Expand Sidebar')}
              >
                {isSidebarExpanded ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Language Selection widgets - Hidden when collapsed */}
            {isSidebarExpanded && (
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
                    EN
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
                    ID
                  </button>
                </div>
              </div>
            )}

            {/* Custom Interactive Side Tab Bar - Icon or Icon + Text format */}
            <nav id="applet_tabs_rail" className="flex flex-col gap-1.5 pt-2">
              
              {[
                { id: 'overview', icon: LayoutDashboard, label: t.tabOverview, color: 'text-indigo-400' },
                { id: 'fcc', icon: Banknote, label: 'Cashflow Command', color: 'text-emerald-400' },
                { id: 'assets', icon: Briefcase, label: 'Asset Command', color: 'text-amber-400' },
                { id: 'chat', icon: MessageSquare, label: t.tabChat, color: 'text-cyan-400' },
                { id: 'scam', icon: ShieldAlert, label: t.tabScam, color: 'text-red-400' },
                { id: 'pitch', icon: Presentation, label: t.tabPitch, color: 'text-purple-400' },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  id={`tab_${tab.id}`}
                  onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                  className={`group relative py-3 px-3.5 rounded-xl text-left text-xs font-semibold tracking-wide transition flex items-center gap-3 w-full border ${
                    activeTab === tab.id 
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-bold' 
                      : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                  } ${!isSidebarExpanded && 'justify-center px-0'}`}
                  title={!isSidebarExpanded ? tab.label : undefined}
                >
                  <tab.icon className={`w-4 h-4 shrink-0 ${tab.color}`} />
                  {isSidebarExpanded && <span>{tab.label}</span>}
                  
                  {/* Micro tooltip contextual navigation helper - only when collapsed or for extra context */}
                  {!isSidebarExpanded && (
                    <div className="absolute left-[120%] top-1/2 -translate-y-1/2 w-48 p-3 bg-black/95 border border-white/10 rounded-xl shadow-2xl transition duration-150 opacity-0 group-hover:opacity-100 pointer-events-none scale-90 group-hover:scale-100 translate-x-2 group-hover:translate-x-0 z-50 text-left leading-normal font-sans text-[10px] font-normal text-zinc-300">
                      <span className={`font-extrabold text-white block mb-1 uppercase tracking-wider font-mono text-[10px] ${tab.color}`}>{tab.label}</span>
                      {language === 'id' ? 'Pilih modul ini.' : 'Select this module.'}
                    </div>
                  )}
                </button>
              ))}

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
          <main className={`space-y-6 transition-all duration-300 ${isSidebarExpanded ? 'lg:col-span-9' : 'lg:col-span-11'}`}>
            
            {/* Core Router view space */}
            <div id="primary_tab_contents_router" className="animate-fade-in duration-300">
              
              {activeTab === 'overview' && (
                <DashboardView 
                  preferences={preferences} 
                  transactions={transactions} 
                  goals={goals}
                  assets={assets}
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
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  subscriptions={subscriptions}
                  onDeleteSubscription={handleDeleteSubscription}
                  activeQuestInProgressId={activeQuestInProgressId}
                  setActiveQuestInProgressId={setActiveQuestInProgressId}
                  questsList={questsList}
                  onCompleteQuest={handleCompleteQuest}
                />
              )}

              {activeTab === 'fcc' && (
                <FinancialCommandCenterView
                  preferences={preferences} 
                  transactions={transactions} 
                  goals={goals} 
                  onAddGoal={handleAddGoal}
                  onDeleteGoal={handleDeleteGoal}
                  language={language}
                  t={t}
                  monthlyRecaps={monthlyRecaps}
                  onAddMonthlyRecap={handleAddMonthlyRecap}
                  onApplyMonthlyRecap={handleApplyMonthlyRecap}
                  onDeleteMonthlyRecap={handleDeleteMonthlyRecap}
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onChangePreferences={handleUpdatePreferences}
                  subscriptions={subscriptions}
                  onAddSubscription={handleAddSubscription}
                  onDeleteSubscription={handleDeleteSubscription}
                  activeQuestInProgressId={activeQuestInProgressId}
                  setActiveQuestInProgressId={setActiveQuestInProgressId}
                  onCompleteQuest={handleCompleteQuest}
                />
              )}

              {activeTab === 'assets' && (
                <AssetCommandCenterView
                   assets={assets}
                   onAddAsset={handleAddAsset}
                   onUpdateAsset={handleUpdateAsset}
                   onDeleteAsset={handleDeleteAsset}
                   language={language}
                   t={t}
                   preferences={preferences}
                   onChangePreferences={handleUpdatePreferences}
                />
              )}

              {activeTab === 'chat' && (
                <AdvisorChatView 
                  preferences={preferences}
                  language={language}
                  t={t}
                />
              )}

              {activeTab === 'scam' && (
                <ScamDetectorView 
                  language={language}
                  t={t}
                  activeQuestInProgressId={activeQuestInProgressId}
                  onCompleteQuest={handleCompleteQuest}
                />
              )}

              {activeTab === 'simulator' && (
                <FutureSimulatorView 
                  preferences={preferences} 
                  onChangePreferences={handleUpdatePreferences}
                  language={language}
                  t={t}
                  activeQuestInProgressId={activeQuestInProgressId}
                  onCompleteQuest={handleCompleteQuest}
                />
              )}

              {activeTab === 'pitch' && (
                <AboutDooitlyView 
                  language={language}
                  t={t}
                />
              )}

            </div>

            {/* Footer info branding block */}
            <footer id="aura_footer_notes" className="flex flex-col sm:flex-row justify-between items-center bg-[#080808]/80 p-5 rounded-2xl border border-white/10 text-[10px] text-zinc-500 gap-4">
              <div className="flex items-center gap-2 font-mono">
                <span>DOOITLY FINANCIAL OS</span>
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
                <span className="font-black text-white text-xl italic select-none">d</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {language === 'id' ? 'Selamat Datang di dooitly Financial OS' : 'Welcome to dooitly Financial OS'}
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

      {/* Non-blocking safe custom confirmation modal for clean slate */}
      {showClearConfirm && (
        <div id="clear_confirm_modal" className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_10px_50px_rgba(239,68,68,0.1)] space-y-6 relative overflow-hidden text-center animate-fade-in select-none">
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              {language === 'id' ? 'Kosongkan Semua Data?' : 'Reset All Data?'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              {t.syncAssetsConfirm}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                id="cancel_clear_btn"
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl border border-white/5 transition-all cursor-pointer"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                id="confirm_clear_btn"
                type="button"
                onClick={handlePerformClearAll}
                className="flex-1 py-3 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] cursor-pointer"
              >
                {language === 'id' ? 'Hapus Semua' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern, non-blocking floating toast system */}
      {toastMessage && (
        <div id="app_toast_notification" className="fixed bottom-6 right-6 z-55 max-w-sm bg-[#080808] border border-indigo-500/30 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in select-none">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
          <span className="text-xs font-mono text-zinc-300">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
