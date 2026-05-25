/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, FinancialGoal } from "../types";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: '2026-05-24',
    description: 'Netflix Premium membership',
    category: 'Entertainment',
    amount: 19.99,
    type: 'expense'
  },
  {
    id: 'tx-2',
    date: '2026-05-24',
    description: 'Starbucks Coffee',
    category: 'Food & Beverage',
    amount: 6.45,
    type: 'expense'
  },
  {
    id: 'tx-3',
    date: '2026-05-23',
    description: 'Salary Deposit TechCorp',
    category: 'Income',
    amount: 4500.00,
    type: 'income'
  },
  {
    id: 'tx-4',
    date: '2026-05-22',
    description: 'Uber Ride City Center',
    category: 'Transportation',
    amount: 18.20,
    type: 'expense'
  },
  {
    id: 'tx-5',
    date: '2026-05-20',
    description: 'Gym Membership CoreFit',
    category: 'Health',
    amount: 55.00,
    type: 'expense'
  },
  {
    id: 'tx-6',
    date: '2026-05-18',
    description: 'Weekly Organic Grocery',
    category: 'Food & Beverage',
    amount: 142.10,
    type: 'expense'
  },
  {
    id: 'tx-7',
    date: '2026-05-15',
    description: 'Crypto Exchange Deposit',
    category: 'Investment',
    amount: 250.00,
    type: 'expense'
  }
];

export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    name: 'Emergency Buffer Fund',
    targetAmount: 15000,
    currentSaved: 9000,
    targetYear: 2027,
    category: 'investment'
  },
  {
    id: 'goal-2',
    name: 'Metropolitan Housing downpayment',
    targetAmount: 75000,
    currentSaved: 18500,
    targetYear: 2030,
    category: 'housing'
  },
  {
    id: 'goal-3',
    name: 'Financial Independence Target',
    targetAmount: 500000,
    currentSaved: 42000,
    targetYear: 2045,
    category: 'retirement'
  }
];

export const FINTECH_QUESTS = [
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
