/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HealthReport, Transaction, UserPreferences } from '../types';
import { Language } from '../data/translations';
import HealthAnalyzerInput from './HealthAnalyzerInput';
import HealthAnalyzerResults from './HealthAnalyzerResults';

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
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const handleRunAudit = async (image: string | null, textQuery: string) => {
    setIsLoading(true);
    setErrorFeedback(null);
    try {
      const response = await fetch('/api/gemini/analyze-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          textQuery,
          transactions,
          preferences
        })
      });

      if (!response.ok) throw new Error('Aura Health Core computed an error.');
      const reportData: HealthReport = await response.json();
      setReport(reportData);
    } catch (err: any) {
      setErrorFeedback(err.message || 'Audit connection failed');
      // Fallback demo for visualization
      setReport({
          overallScore: 82,
          incomeStability: 'Sangat Stabil',
          spendingBehavior: 'Cukup Teratur, sedikit konsumsi luar',
          monthlySavingsRate: 22,
          financialRiskLevel: 'Rendah',
          recommendations: [
            "Kurangi biaya langganan aplikasi tidak aktif untuk menghemat Rp 150.000/bulan.",
            "Tingkatkan investasi surplus dana dingin ke pasar modal sebesar 5% tambahan."
          ],
          metrics: {
            emergencyFundRatio: 4.5,
            debtServicingRatio: 8,
            investmentRate: 20
          }
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="health_analyzer_root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5">
        <HealthAnalyzerInput 
          onAddTransaction={onAddTransaction}
          onRunAudit={handleRunAudit}
          isLoading={isLoading}
          t={t}
          language={language}
        />
      </div>
      <div className="lg:col-span-7">
        <HealthAnalyzerResults 
          report={report}
          transactions={transactions}
          preferences={preferences}
          onDeleteTransaction={onDeleteTransaction}
          language={language}
          t={t}
          errorFeedback={errorFeedback}
        />
      </div>
    </div>
  );
}
