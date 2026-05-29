
import React, { useState } from 'react';
import { Upload, Activity, Sparkles, RefreshCw } from 'lucide-react';

export default function HealthAnalyzerInput({ 
  onAddTransaction, 
  onRunAudit, 
  isLoading, 
  t, 
  language 
}: { 
  onAddTransaction: (desc: string, amount: number, cat: string, type: 'income' | 'expense') => void;
  onRunAudit: (image: string | null, textQuery: string) => void;
  isLoading: boolean;
  t: any;
  language: any;
}) {
  const [statementImage, setStatementImage] = useState<string | null>(null);
  const [statementFileName, setStatementFileName] = useState<string>('');
  const [textQuery, setTextQuery] = useState('');
  
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCat, setNewCat] = useState('Dining/Food');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatementFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setStatementImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMockTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;
    onAddTransaction(newDesc, parseFloat(newAmount), newCat, newType);
    setNewDesc('');
    setNewAmount('');
  };

  return (
    <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-xl space-y-6">
      <div>
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          {t.healthTitle}
        </h3>
        <p className="text-xs text-zinc-500 mt-1">{t.healthDesc}</p>
      </div>

      <div className="p-4 bg-zinc-950/40 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/60 transition group relative cursor-pointer text-center">
        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        <div className="space-y-2">
          <div className="p-3 bg-zinc-900 mx-auto w-12 h-12 rounded-lg border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 transition">
            <Upload className="w-5 h-5" />
          </div>
          {statementFileName ? (
            <div className="text-xs"><span className="text-emerald-400 font-medium font-mono">{statementFileName}</span></div>
          ) : (
            <div className="text-xs text-zinc-400"><span className="text-white hover:underline">{t.dragClickUpload}</span></div>
          )}
        </div>
      </div>

      <input 
        type="text"
        value={textQuery}
        onChange={(e) => setTextQuery(e.target.value)}
        placeholder={t.focusPlaceholder}
        className="w-full bg-zinc-950 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
      />

      <button 
        onClick={() => onRunAudit(statementImage, textQuery)}
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2"
      >
        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        <span>{isLoading ? t.parsingStatement : t.generateDiagnostics}</span>
      </button>

      <form onSubmit={handleCreateMockTransaction} className="border-t border-white/10 pt-4 space-y-3">
        <span className="text-xs font-mono text-zinc-400 uppercase">{t.addMicrotransaction}</span>
        <input type="text" placeholder={t.descLabel} value={newDesc} required onChange={e => setNewDesc(e.target.value)} className="w-full bg-zinc-950 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs" />
        <input type="number" step="0.01" placeholder="Amount" value={newAmount} required onChange={e => setNewAmount(e.target.value)} className="w-full bg-zinc-950 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs" />
        <button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-1.5 rounded-lg text-[11px] font-medium border border-white/10">
          {t.saveBalanceDelta}
        </button>
      </form>
    </div>
  );
}
