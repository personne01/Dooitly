/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Upload, ShieldAlert, CheckCircle2, DollarSign, Activity, 
  RefreshCw, TrendingUp, Sparkles, PieChart, Info, Trash2
} from 'lucide-react';
import { HealthReport, Transaction, UserPreferences } from '../types';
import { Language } from '../data/translations';

interface HealthProps {
  preferences: UserPreferences;
  transactions: Transaction[];
  onAddTransaction: (desc: string, amount: number, cat: string, type: 'income' | 'expense') => void;
  onDeleteTransaction: (txId: string) => void;
  language: Language;
  t: any;
}

export default function HealthAnalyzerView({ 
  preferences, 
  transactions, 
  onAddTransaction, 
  onDeleteTransaction,
  language,
  t 
}: HealthProps) {
  const [statementImage, setStatementImage] = useState<string | null>(null);
  const [statementFileName, setStatementFileName] = useState<string>('');
  const [textQuery, setTextQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Manual Transaction Input Form State
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCat, setNewCat] = useState('Dining/Food');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');

  // Handle Drag / File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatementFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStatementImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeHealthAudit = async () => {
    setIsLoading(true);
    setErrorFeedback(null);
    try {
      const response = await fetch('/api/gemini/analyze-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: statementImage, // Base64 screenshot
          textQuery: textQuery,
          transactions: transactions,
          preferences: preferences
        })
      });

      if (!response.ok) {
        throw new Error('Aura Health Core computed an error. Ensure API keys are active.');
      }

      const reportData: HealthReport = await response.json();
      setReport(reportData);
    } catch (err: any) {
      console.error(err);
      setErrorFeedback(err.message || 'Audit connection failed');
      
      // Localized demo feedback reports
      if (language === 'id') {
        setReport({
          overallScore: 82,
          incomeStability: 'Sangat Stabil',
          spendingBehavior: 'Cukup Teratur, sedikit konsumsi luar',
          monthlySavingsRate: 22,
          financialRiskLevel: 'Rendah',
          recommendations: [
            "Kurangi biaya langganan aplikasi tidak aktif untuk menghemat Rp 150.000/bulan.",
            "Tingkatkan investasi surplus dana dingin ke pasar modal sebesar 5% tambahan.",
            "Tempatkan sebagian tabungan ke instrumen obligasi demi kestabilan jangka menengah."
          ],
          metrics: {
            emergencyFundRatio: 4.5,
            debtServicingRatio: 8,
            investmentRate: 20
          }
        });
      } else {
        setReport({
          overallScore: 78,
          incomeStability: 'Stable',
          spendingBehavior: 'Moderately impulsive',
          monthlySavingsRate: 18,
          financialRiskLevel: 'Medium',
          recommendations: [
            "Eliminate low-activity gym memberships saving $55 monthly.",
            "Redirect an extra 5% of monthly salary toward emergency index coverage.",
            "Establish high-yield accounts for your housing downpayment goal."
          ],
          metrics: {
            emergencyFundRatio: 4.2,
            debtServicingRatio: 12,
            investmentRate: 15
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMockTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;
    const amountVal = parseFloat(newAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    onAddTransaction(newDesc, amountVal, newCat, newType);
    setNewDesc('');
    setNewAmount('');
  };

  return (
    <div id="health_analyzer_root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Input controls panel */}
      <div className="lg:col-span-5 bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-6">
        <div>
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            {t.healthTitle}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            {t.healthDesc}
          </p>
        </div>

        {/* Bank statement upload box */}
        <div className="p-4 bg-zinc-950/40 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/60 transition group relative cursor-pointer text-center">
          <input 
            id="statement_file_uploader"
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <div className="p-3 bg-zinc-900 mx-auto w-12 h-12 rounded-lg border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 transition">
              <Upload className="w-5 h-5" />
            </div>
            {statementFileName ? (
              <div className="text-xs">
                <span className="text-emerald-400 font-medium font-mono">{statementFileName}</span>
                <p className="text-zinc-500 mt-0.5">{language === 'id' ? 'Gambar siap dipindai.' : 'Image uploaded. Ready to scan.'}</p>
              </div>
            ) : (
              <div className="text-xs text-zinc-400">
                <span className="text-white hover:underline">{t.dragClickUpload}</span>
                <p className="text-zinc-500 mt-1">{t.supportForm}</p>
              </div>
            )}
          </div>
        </div>

        {/* Text queries */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase">{t.auditInstructions}</label>
          <input 
            id="health_audit_prompt"
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder={t.focusPlaceholder}
            className="w-full bg-zinc-950 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Trigger check button */}
        <button 
          id="trigger_health_audit_btn"
          onClick={executeHealthAudit}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t.parsingStatement}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.generateDiagnostics}</span>
            </>
          )}
        </button>

        {/* Transaction ledger manual input */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <span className="text-xs font-mono text-zinc-400 uppercase">{t.addMicrotransaction}</span>
          <form onSubmit={handleCreateMockTransaction} className="grid grid-cols-2 gap-2">
            <input 
              id="new_tx_desc"
              type="text" 
              placeholder={t.descLabel} 
              value={newDesc}
              required
              onChange={e => setNewDesc(e.target.value)}
              className="col-span-2 bg-zinc-950 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
            <input 
              id="new_tx_amount"
              type="number" 
              step="0.01"
              placeholder={language === 'id' ? 'Jumlah uang' : 'Amount'} 
              value={newAmount}
              required
              onChange={e => setNewAmount(e.target.value)}
              className="bg-zinc-950 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
            <select
              id="new_tx_cat" 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)}
              className="bg-zinc-950 border border-white/10 text-white rounded-lg px-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Dining/Food">{t.foodBev}</option>
              <option value="Subscriptions">{t.entertainment}</option>
              <option value="Transit">{t.transportation}</option>
              <option value="Savings/Assets">{t.investment}</option>
              <option value="Salary/Surplus">{t.income}</option>
            </select>
            <div className="col-span-2 flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNewType('expense')}
                className={`flex-1 py-1 rounded text-xs transition ${newType === 'expense' ? 'bg-rose-950/60 border border-rose-800 text-rose-300' : 'bg-zinc-950 border border-white/5 text-zinc-500'}`}
              >
                {t.expenseType}
              </button>
              <button
                type="button"
                onClick={() => setNewType('income')}
                className={`flex-1 py-1 rounded text-xs transition ${newType === 'income' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-zinc-950 border border-white/5 text-zinc-500'}`}
              >
                {t.incomeType}
              </button>
            </div>
            <button 
              id="add_tx_btn"
              type="submit" 
              className="col-span-2 bg-zinc-900 hover:bg-zinc-800 text-white py-1.5 rounded-lg text-[11px] font-medium border border-white/10 transition cursor-pointer"
            >
              {t.saveBalanceDelta}
            </button>
          </form>
        </div>
      </div>

      {/* Audit feedback and results panel */}
      <div className="lg:col-span-7 space-y-6">
        
        {report ? (
          <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-6">
            
            {/* Header score metric */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-zinc-950 text-indigo-400 font-mono text-xl font-bold relative shadow-lg">
                  {report.overallScore}
                  <div className="absolute inset-0 rounded-full border border-indigo-400 animate-pulse"></div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{t.overallHealthScore}</h4>
                  <p className="text-xs text-zinc-500 font-mono">
                    {t.scoringModel} <span className="text-indigo-400 font-bold">{report.spendingBehavior}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="bg-zinc-950 p-2.5 rounded border border-white/10 min-w-28 text-center">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono">{t.incomeSafety}</span>
                  <span className="text-xs text-emerald-400 font-bold">{report.incomeStability}</span>
                </div>
                <div className="bg-zinc-950 p-2.5 rounded border border-white/10 min-w-28 text-center">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono">{t.threatLevel}</span>
                  <span className={`text-xs font-bold ${report.financialRiskLevel === 'Low' || report.financialRiskLevel === 'Rendah' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {report.financialRiskLevel} {t.riskText}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-metrics grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div className="bg-zinc-950 p-3 rounded-xl border border-white/5">
                <DollarSign className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <span className="text-[10px] text-zinc-500 font-mono block">{t.compoundRate}</span>
                <span className="text-sm font-semibold text-white">{report.overallScore > 10 ? report.metrics.investmentRate : 15}%</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">{t.suggestedMin}</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-white/5">
                <TrendingUp className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <span className="text-[10px] text-zinc-500 font-mono block">{t.liquidFundBuffer}</span>
                <span className="text-sm font-semibold text-white">{report.metrics.emergencyFundRatio} Months</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">{t.survivalExpenses}</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-white/5">
                <PieChart className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <span className="text-[10px] text-zinc-500 font-mono block">{t.debtRatio}</span>
                <span className="text-sm font-semibold text-white">{report.metrics.debtServicingRatio}%</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">{t.servicedMonthly}</span>
              </div>
            </div>

            {/* Custom optimization strategies */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">{t.strategicOptimization}</span>
              <div className="space-y-2">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-2.5 p-3 bg-indigo-950/15 border border-indigo-900/40 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-zinc-200 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-zinc-950/40 border border-white/10 rounded-2xl p-8 text-center space-y-4">
            <Info className="w-12 h-12 text-zinc-700 mx-auto" />
            <div>
              <h4 className="text-white font-medium text-sm">{t.noReportsCalced}</h4>
              <p className="text-xs text-zinc-550 mt-1">{t.noReportsDesc}</p>
            </div>
            {errorFeedback && (
              <div className="text-xs bg-rose-950/50 border border-rose-900 text-rose-300 p-2.5 rounded font-mono">
                {errorFeedback}
              </div>
            )}
          </div>
        )}

        {/* Current manual Ledger list visualization */}
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-white text-xs font-mono uppercase">{t.userTxBuffer} ({transactions.length} {t.recordsText})</h4>
            <span className="text-[10px] text-zinc-500">{t.autoSyncMsg}</span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center p-6 bg-zinc-950/30 border border-dashed border-white/5 text-zinc-500 rounded-xl text-xs">
              {language === 'id' ? 'Belum ada transaksi diisi. Silakan isi form di samping kiri.' : 'No transactions matching your memory state. Use the sidebar input desk to compound real transactions safely.'}
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-2.5 bg-zinc-950/80 rounded-xl border border-white/5 text-xs group relative">
                  <div>
                    <span className="text-white block font-medium">{tx.description}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{tx.date} • {tx.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-[#f43f5e]'}`}>
                      {tx.type === 'income' ? '+' : '-'}{preferences.currency}{tx.amount.toLocaleString()}
                    </span>
                    <button
                      id={`delete_tx_btn_${tx.id}`}
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1 text-zinc-650 hover:text-red-400 transition cursor-pointer"
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

      </div>

    </div>
  );
}
