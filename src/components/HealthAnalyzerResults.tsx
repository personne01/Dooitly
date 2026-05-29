
import React from 'react';
import { ShieldAlert, CheckCircle2, DollarSign, Activity, TrendingUp, PieChart, Info, Trash2 } from 'lucide-react';
import { HealthReport, Transaction, UserPreferences } from '../types';

export default function HealthAnalyzerResults({
  report,
  transactions,
  preferences,
  onDeleteTransaction,
  language,
  t,
  errorFeedback
}: {
  report: HealthReport | null;
  transactions: Transaction[];
  preferences: UserPreferences;
  onDeleteTransaction: (txId: string) => void;
  language: any;
  t: any;
  errorFeedback: string | null;
}) {
  return (
    <div className="space-y-6">
      {report ? (
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-zinc-950 text-indigo-400 font-mono text-xl font-bold relative shadow-lg">
                {report.overallScore}
                <div className="absolute inset-0 rounded-full border border-indigo-400 animate-pulse"></div>
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{t.overallHealthScore}</h4>
                <p className="text-xs text-zinc-500 font-mono">{t.scoringModel} <span className="text-indigo-400 font-bold">{report.spendingBehavior}</span></p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="bg-zinc-950 p-2.5 rounded border border-white/10 min-w-28 text-center text-xs">
                <span className="text-zinc-500 block uppercase font-mono">{t.incomeSafety}</span>
                <span className="text-emerald-400 font-bold">{report.incomeStability}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
            <div className="bg-zinc-950 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 font-mono block">{t.compoundRate}</span>
              <span className="text-sm font-semibold text-white">{report.metrics.investmentRate}%</span>
            </div>
          </div>
          <div className="space-y-3">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">{t.strategicOptimization}</span>
            {report.recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-2.5 p-3 bg-indigo-950/15 border border-indigo-900/40 rounded-xl text-xs text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950/40 border border-white/10 rounded-2xl p-8 text-center space-y-4 text-xs">
          <Info className="w-12 h-12 text-zinc-700 mx-auto" />
          <h4 className="text-white font-medium">{t.noReportsCalced}</h4>
          <p className="text-zinc-500">{t.noReportsDesc}</p>
          {errorFeedback && <div className="text-rose-300 p-2.5 rounded font-mono bg-rose-950/50">{errorFeedback}</div>}
        </div>
      )}

      <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-4">
        <h4 className="font-semibold text-white text-xs font-mono uppercase">{t.userTxBuffer}</h4>
        {transactions.map(tx => (
          <div key={tx.id} className="flex justify-between items-center p-2.5 bg-zinc-950/80 rounded-xl border border-white/5 text-xs text-white">
            <span>{tx.description}</span>
            <div className="flex items-center gap-3">
              <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-[#f43f5e]'}`}>
                {tx.type === 'income' ? '+' : '-'}{preferences.currency}{tx.amount.toLocaleString()}
              </span>
              <button onClick={() => onDeleteTransaction(tx.id)} className="text-zinc-650 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
