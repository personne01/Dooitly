/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  targetYear: number;
  category: 'housing' | 'retirement' | 'travel' | 'investment' | 'other';
}

export interface UserPreferences {
  currency: string;
  monthlyIncome: number;
  currentSavings: number;
  monthlyInvestment: number;
  riskAppetite: 'conservative' | 'moderate' | 'aggressive';
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  isActive: boolean;
  description: string;
}

export interface MonthlyRecap {
  id: string;
  monthYear: string; // e.g. "Mei 2026"
  monthlyIncome: number;
  monthlyExpense: number;
  currentSavings: number;
  monthlyInvestment: number;
}

// 1. AI Health Scoring Report
export interface HealthReport {
  overallScore: number;
  incomeStability: 'Stable' | 'Variable' | 'Volatile';
  spendingBehavior: string;
  monthlySavingsRate: number;
  financialRiskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
  metrics: {
    emergencyFundRatio: number; // in months covered
    debtServicingRatio: number; // % of income
    investmentRate: number; // % of income
  };
}

// 2. Scam Analysis
export interface ScamAnalysis {
  scamProbability: number; // 0 - 100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe';
  detectedRedFlags: string[];
  phrasingIndicators: string[];
  legalAnomalies: string[];
  recommendation: string;
  urgencyTacticFound: boolean;
}

// 3. Investment Evaluation
export interface InvestmentExplanation {
  assetClass: string;
  explanationPlainEnglish: string;
  riskRewardProfile: string;
  targetAllocationPercentage: number;
  historicalVolatilityLabel: string;
  pros: string[];
  cons: string[];
  suitabilityDecision: string;
}

// 4. Future Simulation
export interface SimulationResult {
  year: number;
  conservativeProjection: number;
  expectedProjection: number;
  optimisticProjection: number;
}

export interface FutureProjectionReport {
  currentAge: number;
  targetAge: number;
  projectedNetWorth: number;
  monthlyInvestmentNeeded: number;
  probabilityOfSuccess: number; // 0-100
  milestones: { age: number; title: string; netWorth: number }[];
  strategicAdvice: string;
  chartData: SimulationResult[];
}

// Chat Messages types
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'cash' | 'stock' | 'crypto' | 'property' | 'gold' | 'other';
  value: number;
  expectedReturn: number; // e.g. 8 for 8% annual return
  institution?: string; // bank name/exchange/broker
  createdAt?: string;
  updatedAt?: string;
}
