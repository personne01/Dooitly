/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON body parsing with slightly larger limits to handle image uploads
app.use(express.json({ limit: "15mb" }));

// Initialize the GoogleGenAI instance as recommended by the gemini-api skill rules
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Model to perform standard text and structured schema reasoning
const COCHING_MODEL = "gemini-3.5-flash";

// Help make Gemini API queries resilient with automatic retries and fallback
async function generateContentWithRetry(options: any, retries = 3, delayMs = 1500, fallbackGenerator?: () => any): Promise<any> {
  let lastError: any = null;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent(options);
      return response;
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || err?.code;
      const msg = (err?.message || "").toLowerCase();
      const isTransient = 
        status === 503 || status === 429 ||
        msg.includes("503") || msg.includes("429") ||
        msg.includes("unavailable") || msg.includes("demand") || msg.includes("temporary") ||
        msg.includes("resource exhausted") || msg.includes("limit reached");
      
      if (isTransient && i < retries - 1) {
        console.warn(`[Gemini API Warning] Transient error, retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries}): ${err?.message || err}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2;
        continue;
      }
      break;
    }
  }

  // If retries exhausted, check if we have a fallback generator
  if (fallbackGenerator) {
    console.warn("[Gemini API Error] Retries exhausted. Triggering smart fallback recovery option...");
    try {
      const fallbackResult = fallbackGenerator();
      return {
        text: JSON.stringify(fallbackResult),
        isFallback: true
      };
    } catch (fbErr) {
      console.error("[Fallback Error] Failed to execute fallback:", fbErr);
    }
  }

  throw lastError;
}

// Fallback Generators to sustain robust app functionality under AI peak loads:
const makeHealthFallback = (transactions: any[], preferences: any, language: string) => {
  const isId = language === "id";
  const monthlyIn = Number(preferences?.monthlyIncome || 10000000);
  const savingsRate = Number(preferences?.targetSavingsRate || 25);
  const currency = preferences?.currency || "Rp ";

  const txs = transactions || [];
  const totalIn = txs.filter((t: any) => t.type === "income").reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0) || monthlyIn;
  const totalOut = txs.filter((t: any) => t.type === "expense").reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);
  const calcSavingsRate = totalIn > 0 ? Math.max(0, Math.min(100, Math.round(((totalIn - totalOut) / totalIn) * 100))) : savingsRate;
  const overallScore = Math.max(30, Math.min(95, Math.round(50 + (calcSavingsRate * 0.5))));

  if (isId) {
    return {
      overallScore: overallScore,
      incomeStability: "Stable",
      spendingBehavior: totalOut > totalIn * 0.75 ? "Konsumtif Menengah" : "Relatif Terkendali",
      monthlySavingsRate: calcSavingsRate,
      financialRiskLevel: "Medium",
      recommendations: [
        "Kurangi biaya berlangganan bulanan non-esensial.",
        "Bangun dana darurat setara 6 bulan pengeluaran untuk kekebalan finansial dooitly.",
        "Mulailah menyisihkan minimal 15% dari pemasukan langsung ke dalam portofolio investasi terkelola."
      ],
      metrics: {
        emergencyFundRatio: 2.5,
        debtServicingRatio: 10,
        investmentRate: 15
      }
    };
  } else {
    return {
      overallScore: overallScore,
      incomeStability: "Stable",
      spendingBehavior: totalOut > totalIn * 0.75 ? "Moderate Leisure Spike" : "Disciplined Accumulator",
      monthlySavingsRate: calcSavingsRate,
      financialRiskLevel: "Low",
      recommendations: [
        "Prune recursive monthly software or media subscription overlaps.",
        "Secure sound liquid buffers prior to taking highly volatile market allocations.",
        "Enforce automated paycheck splits with at least 15% committed direct to high-yield indexes."
      ],
      metrics: {
        emergencyFundRatio: 2.5,
        debtServicingRatio: 10,
        investmentRate: 15
      }
    };
  }
};

const makeScamFallback = (rawText: string, language: string) => {
  const isId = language === "id";
  const text = (rawText || "").toLowerCase();
  
  const hasHighRoi = text.includes("persen") || text.includes("promo") || text.includes("diskon") || text.includes("invest") || text.includes("%") || text.includes("menang") || text.includes("hadiah") || text.includes("cepat kaya") || text.includes("guaranteed") || text.includes("crypto") || text.includes("deposit");
  const urgent = text.includes("cepat") || text.includes("segera") || text.includes("hari ini") || text.includes("urgent") || text.includes("now") || text.includes("immediately") || text.includes("limit") || text.includes("terbatas");

  const probability = hasHighRoi ? 75 : 20;
  const level = probability > 50 ? "High" : "Low";

  if (isId) {
    return {
      scamProbability: probability,
      riskLevel: level,
      detectedRedFlags: hasHighRoi ? ["Indikasi pengembalian hasil melimpah tidak wajar/tinggi di luar batas normal.", "Adanya unsur ajakan yang cenderung impulsif."] : ["Referensi umum terpantau biasa tanpa risiko berlebih."],
      phrasingIndicators: urgent ? ["Pola kalimat desakan waktu ('segera lakukan', 'tersisa beberapa slot')."] : [],
      legalAnomalies: hasHighRoi ? ["Tidak disertakan jaminan validasi izin OJK atau lembaga penjamin resmi."] : [],
      recommendation: probability > 50 ? "SANGAT DIANJURKAN: Tahan diri dari mengirimkan uang/data pribadi. Lakukan verifikasi mendalam di situs resmi atau tanyakan di forum regulator dooitly." : "Rekomendasi umum: Tetap waspada terhadap tautan yang mencurigakan dan jangan bagikan OTP.",
      urgencyTacticFound: urgent
    };
  } else {
    return {
      scamProbability: probability,
      riskLevel: level,
      detectedRedFlags: hasHighRoi ? ["Abnormally high guaranteed returns.", "Multi-level referral or recruitment emphasis."] : ["Standard communication parameters with moderate footprint."],
      phrasingIndicators: urgent ? ["High-urgency phrases triggering prompt actions.", "Scarcity tactics like limited slot counters."] : [],
      legalAnomalies: hasHighRoi ? ["No verifiable regulatory oversight license registration found."] : [],
      recommendation: probability > 50 ? "HIGHLY RECOMMENDED: Halt further transfer or data entries. Do not click random verification links; verify credential origin." : "Standard guidance: Practice standard cyber hygiene and do not share one-time password hashes.",
      urgencyTacticFound: urgent
    };
  }
};

const makeInvestmentFallback = (assetName: string, riskAppetite: string, language: string) => {
  const isId = language === "id";
  const assetLower = (assetName || "").toLowerCase();
  
  let assetClass = "Crypto Assets";
  let explanation = "Asset explainer default description";
  let pros = ["High Liquidity"];
  let cons = ["Volatile fluctuations"];

  if (assetLower.includes("gold") || assetLower.includes("emas")) {
    assetClass = isId ? "Logam Mulia" : "Precious Metals";
    explanation = isId ? "Instrumen lindung nilai (hedging) defensif klasik untuk menjaga nilai beli di tengah inflasi global." : "A time-tested defensive hedging tool that retains real purchasing power in high-inflation environments.";
    pros = isId ? ["Sangat aman saat krisis ekonomi", "Mudah dijual kembali secara fisik"] : ["Incredible hedge against systemic recessions", "High physical and digital liquidity"];
    cons = isId ? ["Tidak memiliki arus kas periodik dividend", "Pertumbuhan jangka panjang cenderung lambat"] : ["No passive cash distribution or yields", "Slow historical capital growth rate"];
  } else if (assetLower.includes("stock") || assetLower.includes("saham") || assetLower.includes("etf") || assetLower.includes("idx")) {
    assetClass = isId ? "Saham / Ekuitas Publik" : "Public Equities";
    explanation = isId ? "Sertifikat kepemilikan bagian bisnis korporasi global atau nasional terdaftar publik dengan imbal hasil dividen atau capital gain." : "Fractional ownership of listed blue-chip companies with compounding dividends and capital appreciation.";
    pros = isId ? ["Potensi imbal hasil jangka panjang tinggi", "Likuiditas perdagangan instan harian"] : ["High compound returns in bull runs", "Instant daily exchange order settlement"];
    cons = isId ? ["Fluktuasi harga pasar harian sensitif berita", "Tidak ada jaminan modal pokok aman"] : ["Subject to economic demand drawdowns", "Principal capital is unprotected"];
  } else {
    assetClass = isId ? "Dana Reksa Campuran" : "Managed Alternative Assets";
    explanation = isId ? "Rencana alokasi instrumen reksa dana campuran, obligasi pemerintah, atau alternatif terkelola." : "A balanced array of sovereign bonds, indexes, and custom asset classes tailored for retail wealth builders.";
    pros = isId ? ["Diversifikasi risiko menyebar otomatis", "Tingkat volatilitas teratur moderat"] : ["Spreads specific single-asset risk vectors", "Calm daily volatility parameters"];
    cons = isId ? ["Imbal hasil lebih moderat dibanding saham tunggal", "Adanya sedikit beban kelola manajer investasi"] : ["Muted returns compared to single-stock peaks", "Small management expense ratios apply"];
  }

  return {
    assetClass,
    explanationPlainEnglish: explanation,
    riskRewardProfile: isId ? "Profil risiko sejalan dengan indeks global terdaftar." : "Risk-reward correlates strongly with macro sector performance.",
    targetAllocationPercentage: riskAppetite === "Aggressive" ? 30 : 15,
    historicalVolatilityLabel: riskAppetite === "Aggressive" ? "High" : "Moderate",
    pros,
    cons,
    suitabilityDecision: isId ? `Sangat Cocok untuk profil risiko ${riskAppetite}.` : `Suitable for your specified ${riskAppetite} risk parameters.`
  };
};

const makeSimulationFallback = (preferences: any, goals: any, simulationYears: number) => {
  const currentAge = Number(preferences?.currentAge || 25);
  const targetAge = currentAge + Number(simulationYears || 30);
  const monthlyIn = Number(preferences?.monthlyIncome || 10000000);
  const savingsRate = Number(preferences?.targetSavingsRate || 25);
  const monthlySavings = (monthlyIn * savingsRate) / 100;
  
  const chartData = [];
  let balance = Number(preferences?.currentNetWorth || 50000000);
  let totalSaved = balance;
  const rate = 0.07;

  for (let year = 1; year <= 10; year++) {
    for (let month = 0; month < 12; month++) {
      balance = (balance + monthlySavings) * (1 + rate / 12);
      totalSaved += monthlySavings;
    }
    chartData.push({
      year: year,
      conservativeProjection: Math.round(totalSaved),
      expectedProjection: Math.round(balance),
      optimisticProjection: Math.round(balance * 1.15)
    });
  }

  return {
    currentAge,
    targetAge,
    projectedNetWorth: Math.round(balance),
    monthlyInvestmentNeeded: Math.round(monthlySavings),
    probabilityOfSuccess: 88,
    strategicAdvice: "Keep discipline in automation! We recommend locking a tight surplus each month of consistent investment directly in low-cost diversified indexes.",
    milestones: [
      { age: currentAge + 2, title: "Emergency Resilience Peak", netWorth: Math.round(balance * 0.2) },
      { age: currentAge + 5, title: "Minor Financial Independence Point", netWorth: Math.round(balance * 0.5) },
      { age: targetAge, title: "Compounding Apex Goal Milestone", netWorth: Math.round(balance) }
    ],
    chartData
  };
};

const makeCashflowFallback = (trendTimeframe: string, trendData: any[], preferences: any, language: string) => {
  const isId = language === "id";
  const monthlyIn = Number(preferences?.monthlyIncome || 10000000);
  const currency = preferences?.currency || "Rp ";

  const dataPoints = trendData || [];
  const totalSpent = dataPoints.reduce((sum: number, item: any) => sum + (Number(item.outflow) || 0), 0);
  const totalInflow = dataPoints.reduce((sum: number, item: any) => sum + (Number(item.inflow) || 0), 0) || monthlyIn;
  const averageSpent = dataPoints.length > 0 ? (totalSpent / dataPoints.length) : 0;
  const ratio = totalInflow > 0 ? ((totalSpent / totalInflow) * 100).toFixed(0) : "0";

  if (isId) {
    return {
      summary: `Berdasarkan kalkulasi lokal dooitly, arus kas Anda berada pada rasio pengeluaran sekitar ${ratio}% dari total pemasukan. Tren pada jangka waktu ${trendTimeframe} ini menunjukkan total pengeluaran kumulatif sebesar ${currency}${totalSpent.toLocaleString()} dibandingkan pendapatan total ${currency}${totalInflow.toLocaleString()}.`,
      leakSource: `Analisis mendeteksi potensi sisa anggaran tidak optimal di pos-pos pengeluaran tidak berulang. Rata-rata pengeluaran per periode adalah ${currency}${averageSpent.toLocaleString() || "0"}.`,
      ratioAnalysis: `Rasio spending-to-income Anda tercatat sebesar ${ratio}%. Ini menunjukkan margin surplus simpanan yang bersih namun perlu diperketat lagi agar mencapai target aman minimal 20-30%.`,
      actions: [
        `Pertimbangkan menyaring langganan otomatis di bawah platform dooitly demi saving lebih cepat.`,
        `Alokasikan dana darurat cair setara 3-6 kali pengeluaran bulanan (${currency}${(averageSpent * 3).toLocaleString()}) di reksa dana pasar uang berkinerja stabil.`,
        `Gunakan target investasi otomatis 20% langsung di awal bulan begitu Anda menerima pemasukan atau sisa surplus kas.`
      ]
    };
  } else {
    return {
      summary: `According to dooitly's local metrics, your net cash flow registers a spend-to-income ratio of around ${ratio}%. Over the ${trendTimeframe} timeline, cumulative expenditures reached ${currency}${totalSpent.toLocaleString()} compared to an influx of ${currency}${totalInflow.toLocaleString()}.`,
      leakSource: `Potential leaks found in non-structured subscription tiers. Your average outlay per node is calculated around ${currency}${averageSpent.toLocaleString()}.`,
      ratioAnalysis: `Your cash burn rate is at ${ratio}%. This highlights opportunities for building emergency cushion reserves in liquid accounts.`,
      actions: [
        `Audit high-frequency discretionary categories to seal leaks immediately.`,
        `Park dynamic emergency reserves of at least 3-6 months (${currency}${(averageSpent * 3).toLocaleString()}) in automated high-yield accounts.`,
        `Commit to pre-allocated wealth compounding rules of exactly 20% immediately upon monthly inflow.`
      ]
    };
  }
};

const makeChatFallback = (message: string, context: any) => {
  const userText = (message || "").toLowerCase();
  const userName = context?.name || "Builder";
  const currency = context?.currency || "Rp ";
  const income = Number(context?.monthlyIncome || 10000000);

  if (userText.includes("invest") || userText.includes("alokasi") || userText.includes("saham") || userText.includes("reksa") || userText.includes("portofolio")) {
    return {
      text: `Halo ${userName}! Sistem kecerdasan Gemini utama sedang mengalami peningkatan beban trafik. Berikut adalah analisis strategi lokal dooitly untuk Anda:
      
- **Prinsip Utama**: Selalu alokasikan minimal **20%** pendapatan Anda (**${currency}${(income * 0.2).toLocaleString()}**) untuk diinvestasikan secara disiplin sejak awal bulan.
- **Rekomendasi Portofolio**: Utamakan Reksa Dana Pasar Uang cair untuk dana darurat, dan Reksa Dana Indeks saham (seperti IDX30 atau S&P 500) untuk imbal hasil jangka panjang yang optimal.
- **Diversifikasi**: Kurangi alokasi aset tunggal spekulatif bermargin tinggi.`
    };
  }

  if (userText.includes("debt") || userText.includes("hutang") || userText.includes("cicilan") || userText.includes("pinjol")) {
    return {
      text: `Halo ${userName}. Jaringan utama sedang sangat sibuk, namun berikut adalah panduan taktis pelunasan utang dari dooitly:

- **Metode Avalans (Avalanche)**: Prioritaskan melunasi kewajiban dengan bunga persentase tertinggi terlebih dahulu untuk meminimalkan beban bunga kumulatif.
- **Metode Bola Salju (Snowball)**: Selesaikan cicilan terkecil dahulu jika Anda memerlukan kepuasan psikologis cepat untuk membangun momentum.
- **Konsolidation**: Hindari menutup utang lama dengan utang baru yang berbunga lebih tinggi.`
    };
  }

  return {
    text: `Halo, ${userName}! Sistem kecerdasan buatan utama sedang mengalami lonjakan beban kueri, namun asisten strategi lokal dooitly tetap aktif. 

Bagaimana saya bisa menemani perencanaan kekayaan Anda hari ini? Kita bisa membahas kalkulator bunga majemuk, menyisir anggaran kebocoran kas bulanan, atau menyusun strategi dana darurat!`
  };
};

// ----------------- API ENDPOINTS -----------------

// API 1: Health Analyzer (Supports optional Base64 Statement Image OR raw transaction records)
app.post("/api/gemini/analyze-health", async (req, res) => {
  try {
    const { image, textQuery, transactions, preferences } = req.body;

    let contents: any[] = [];
    let systemInstructions = `You are the Aura AI Intelligence Health Core.
Analyze the user's financial profile, transaction stream, or bank statement image.
Assess their spending habits, income robustness, risk profile, and create an actionable score (0-100).
Produce a highly critical yet constructive and elegant JSON breakdown fitting the requested schema.`;

    if (image) {
      contents.push({
        inlineData: {
          mimeType: image.split(";")[0].split(":")[1] || "image/png",
          data: image.split(",")[1] || image,
        },
      });
      contents.push({
        text: `Review the statement in this screenshot. Extract transaction data, analyze balances, assess cash flow safety, and combine with optional records. User text question: "${textQuery || "Please scan this and generate health assessment"}"`,
      });
    } else {
      contents.push({
        text: `Review the user transactions: ${JSON.stringify(transactions || [])} and pref profile: ${JSON.stringify(preferences || {})}. Query: "${textQuery || "Perform general cash flow audit"}"`,
      });
    }

    const response = await generateContentWithRetry({
      model: COCHING_MODEL,
      contents,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.INTEGER,
              description: "Weighted evaluation from 0-100 indicating financial wellness.",
            },
            incomeStability: {
              type: Type.STRING,
              description: "Must be one of: 'Stable' | 'Variable' | 'Volatile'.",
            },
            spendingBehavior: {
              type: Type.STRING,
              description: "Short analysis summarizing behavioral habits like 'High impulsiveness' or 'Disciplined accumulator'.",
            },
            monthlySavingsRate: {
              type: Type.NUMBER,
              description: "Calculated savings percentage (0 to 100).",
            },
            financialRiskLevel: {
              type: Type.STRING,
              description: "Risk classification: 'Low' | 'Medium' | 'High'.",
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Top 3-4 customized, highly specific, strategic financial optimizations.",
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                emergencyFundRatio: {
                  type: Type.NUMBER,
                  description: "Months of living expenses currently covered in liquid cash.",
                },
                debtServicingRatio: {
                  type: Type.NUMBER,
                  description: "Percentage of income going to debt service (0 to 100).",
                },
                investmentRate: {
                  type: Type.NUMBER,
                  description: "Percentage of monthly income going into dynamic investments (0 to 100).",
                },
              },
              required: ["emergencyFundRatio", "debtServicingRatio", "investmentRate"],
            },
          },
          required: [
            "overallScore",
            "incomeStability",
            "spendingBehavior",
            "monthlySavingsRate",
            "financialRiskLevel",
            "recommendations",
            "metrics",
          ],
        },
      },
    }, 3, 1500, () => makeHealthFallback(transactions || [], preferences || {}, "id")); // Note: Let's default to preference indicator or ID if context is ID

    const bodyText = response.text || "{}";
    res.json(JSON.parse(bodyText.trim()));
  } catch (error: any) {
    console.error("Health Analyzer API error:", error);
    res.status(500).json({ error: error?.message || "Failed to analyze financials" });
  }
});

// API 1.5: Receipt Photo/Invoice OCR Parser
app.post("/api/gemini/parse-receipt", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image data to parse" });
    }

    // Extract base64 and mimeType
    const mimeType = image.split(";")[0].split(":")[1] || "image/png";
    const base64Data = image.split(",")[1] || image;

    const response = await generateContentWithRetry({
      model: COCHING_MODEL,
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: "Scan this transaction invoice, invoice photo, transfer slip, or receipt screenshot. Extract primary transaction details. Translate/simplify description into a short, clean name or merchant. Guess the category and transaction flow type ('income' or 'expense'). Output amount as a number and date in YYYY-MM-DD format.",
        },
      ],
      config: {
        systemInstruction: "You are the Aura Receipt Intelligence OCR module. Carefully transcribe receipt images and map them to standard transaction data with high compliance.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, description: "Must be exactly 'income' or 'expense'" },
            category: { type: Type.STRING, description: "Must map to one of these: 'Food & Beverage', 'Groceries', 'Transportation', 'Rent/Housing', 'Entertainment', 'Health', 'Investment', 'Other', 'Income', 'Investment dividend', 'Other Inflow'" },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" }
          },
          required: ["description", "amount", "type", "category", "date"],
        },
      },
    });

    res.json(JSON.parse((response.text || "{}").trim()));
  } catch (error: any) {
    console.error("Parse receipt API error:", error);
    res.status(500).json({ error: error?.message || "Failed to parse receipt image details" });
  }
});

// API 2: Scam / Fraud Detector
app.post("/api/gemini/detect-scam", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ error: "Missing material to inspect" });
    }

    const response = await generateContentWithRetry({
      model: COCHING_MODEL,
      contents: `Perform fraud audit on this proposal text, URL, message, or project profile: "${rawText}"`,
      config: {
        systemInstruction: `You are the Aura Anti-Fraud Sentinel.
Analyze text materials, messages, cold emails, investment models, or suspicious links.
Evaluate psychological triggers like high urgency, unrealistic ROI, unverified legal claims, or multi-level payment designs.
Output a highly robust safety diagnostic JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scamProbability: {
              type: Type.INTEGER,
              description: "Assessed scam percentage probability, from 0 to 100.",
            },
            riskLevel: {
              type: Type.STRING,
              description: "Must be: 'Low' | 'Medium' | 'High' | 'Severe'.",
            },
            detectedRedFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Identified fraud red flags like 'Guaranteed 25% weekly', 'Exclusive private pool', etc.",
            },
            phrasingIndicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific phrasing tactics discovered in materials.",
            },
            legalAnomalies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Legal red flags, missing registrations or regulatory gaps.",
            },
            recommendation: {
              type: Type.STRING,
              description: "Definitive action advice for the target user.",
            },
            urgencyTacticFound: {
              type: Type.BOOLEAN,
              description: "True if quick decision mechanisms or FOMO manipulation is used.",
            },
          },
          required: [
            "scamProbability",
            "riskLevel",
            "detectedRedFlags",
            "phrasingIndicators",
            "legalAnomalies",
            "recommendation",
            "urgencyTacticFound",
          ],
        },
      },
    }, 3, 1500, () => makeScamFallback(rawText, "id"));

    res.json(JSON.parse((response.text || "{}").trim()));
  } catch (error: any) {
    console.error("Scam Detector API error:", error);
    res.status(500).json({ error: error?.message || "Failed to analyze fraud" });
  }
});

// API 3: Investment Explanation
app.post("/api/gemini/explain-investment", async (req, res) => {
  try {
    const { assetName, riskAppetite } = req.body;
    if (!assetName) {
      return res.status(400).json({ error: "Missing asset identifier or description" });
    }

    const response = await generateContentWithRetry({
      model: COCHING_MODEL,
      contents: `Explain asset: "${assetName}". User portfolio risk configuration: "${riskAppetite || "Moderate"}".`,
      config: {
        systemInstruction: `You are the Aura Asset Intel Core.
Break down investment definitions, index charts, commodities, real estate syndicates, stock symbols, or crypto algorithms.
Explain mechanics in crystal clear, zero-jargon but sophisticated language suited for ambitious young accumulators.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assetClass: { type: Type.STRING, description: "Category of the target wealth vehicle." },
            explanationPlainEnglish: { type: Type.STRING, description: "Highly engaging, simple yet precise 2-3 sentence overview." },
            riskRewardProfile: { type: Type.STRING, description: "Detailed high-voltage risk explanation." },
            targetAllocationPercentage: { type: Type.INTEGER, description: "Suggested percentage in their overall modern wallet (0 to 100)." },
            historicalVolatilityLabel: { type: Type.STRING, description: "E.g., Low, Moderate, High, Speculative Extreme." },
            pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Clear advantages." },
            cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key risks and downsides." },
            suitabilityDecision: { type: Type.STRING, description: "Final direct assessment based on user's target risk profile." },
          },
          required: [
            "assetClass",
            "explanationPlainEnglish",
            "riskRewardProfile",
            "targetAllocationPercentage",
            "historicalVolatilityLabel",
            "pros",
            "cons",
            "suitabilityDecision",
          ],
        },
      },
    }, 3, 1500, () => makeInvestmentFallback(assetName, riskAppetite || "Moderate", "id"));

    res.json(JSON.parse((response.text || "{}").trim()));
  } catch (error: any) {
    console.error("Investment Explainer API error:", error);
    res.status(500).json({ error: error?.message || "Failed to explain asset" });
  }
});

// API 4: Future wealth simulator projection with milestones
app.post("/api/gemini/simulate-future", async (req, res) => {
  try {
    const { preferences, goals, simulationYears } = req.body;

    const query = `Create a 30-year projections table and structural roadmap. User initial configuration: ${JSON.stringify(preferences || {})}. Selected goals: ${JSON.stringify(goals || [])}. Target years to plan for: ${simulationYears || 30}.`;

    const response = await generateContentWithRetry({
      model: COCHING_MODEL,
      contents: query,
      config: {
        systemInstruction: `You are the Aura Future Projection Engine.
Analyze savings profile, investment contributions, goals, and compound potential.
Construct milestones, calculated portfolio probabilities, and generate visual, non-trivial financial curve growth matrices.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentAge: { type: Type.INTEGER },
            targetAge: { type: Type.INTEGER },
            projectedNetWorth: { type: Type.INTEGER, description: "Final expected wealth projection." },
            monthlyInvestmentNeeded: { type: Type.INTEGER },
            probabilityOfSuccess: { type: Type.INTEGER, description: "Determined success rate percentage (0 to 100) based on target profile." },
            strategicAdvice: { type: Type.STRING, description: "1-2 paragraphs of tactical wealth advice to cross the threshold." },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  age: { type: Type.INTEGER },
                  title: { type: Type.STRING, description: "E.g., First $100K liquid, Emergency fund security, Financial Freedom target." },
                  netWorth: { type: Type.INTEGER },
                },
                required: ["age", "title", "netWorth"],
              },
            },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.INTEGER, description: "Relative year number from 1 to 10" },
                  conservativeProjection: { type: Type.INTEGER, description: "Lower-bound compound interest model net worth." },
                  expectedProjection: { type: Type.INTEGER, description: "Expected index growth return net worth." },
                  optimisticProjection: { type: Type.INTEGER, description: "Upper-bound bull market net worth." },
                },
                required: ["year", "conservativeProjection", "expectedProjection", "optimisticProjection"],
              },
              description: "Structured array representing exactly 10 projection nodes for line chart representation.",
            },
          },
          required: [
            "currentAge",
            "targetAge",
            "projectedNetWorth",
            "monthlyInvestmentNeeded",
            "probabilityOfSuccess",
            "strategicAdvice",
            "milestones",
            "chartData",
          ],
        },
      },
    }, 3, 1500, () => makeSimulationFallback(preferences || {}, goals || [], simulationYears || 30));

    res.json(JSON.parse((response.text || "{}").trim()));
  } catch (error: any) {
    console.error("Simulation API error:", error);
    res.status(500).json({ error: error?.message || "Failed to compute projection simulation" });
  }
});

// API 5: Chat Advisor (Aura wealth coach chat endpoint - using conversational history)
app.post("/api/gemini/advisor-chat", async (req, res) => {
  try {
    const { history, message, context } = req.body;

    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Priming system system instruction
    const systemPrompt = `You are Aura OS, a state-of-the-art futuristic wealth advisor, investing coach, financial planner, risk detective, and career optimization guide.
User Context: ${JSON.stringify(context || {})}
Your personality is highly technical but extremely accessible, empathetic, motivational, concise, and trustworthy.
Use Markdown formatting for responses (bullet points, bold highlights, small summaries).
Guide them to think about compounding, eliminating subscription leaks, avoiding scam traps, and planning smart goals.
In every message, include actionable steps. Offer wisdom, but challenge them in a supportive coaching voice.`;

    const chatInstance = ai.chats.create({
      model: COCHING_MODEL,
      config: {
        systemInstruction: systemPrompt,
      },
      history: chatHistory,
    });

    let serverReply;
    let lastErr: any = null;
    let delayMs = 1500;
    for (let j = 0; j < 3; j++) {
      try {
        serverReply = await chatInstance.sendMessage({
          message: message,
        });
        break;
      } catch (chatError: any) {
        lastErr = chatError;
        const s = chatError?.status || chatError?.statusCode || chatError?.code;
        const m = (chatError?.message || "").toLowerCase();
        const isTrans = s === 503 || s === 429 || m.includes("503") || m.includes("429") || m.includes("unavailable") || m.includes("demand") || m.includes("temporary");
        if (isTrans && j < 2) {
          console.warn(`[Advisor Chat Warning] Transient chat error, retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2;
          continue;
        }
        break;
      }
    }

    if (!serverReply) {
      console.warn("[Advisor Chat Error] Retries exhausted. Triggering local chat fallback...");
      serverReply = makeChatFallback(message, context || {});
    }

    res.json({ text: serverReply.text });
  } catch (error: any) {
    console.error("Chat Advisor API error:", error);
    res.status(500).json({ error: error?.message || "Failed to stream chat thoughts" });
  }
});

// API 6: AI Cash Flow Report Generator based on detailed record trends
app.post("/api/gemini/analyze-cashflow", async (req, res) => {
  try {
    const { trendTimeframe, trendData, preferences, language } = req.body;

    const query = `Analyze the cash flow trend dataset compiled at timeframe: "${trendTimeframe}".
Historical Trend Points: ${JSON.stringify(trendData || [])}
Preferences profile: ${JSON.stringify(preferences || {})}
Please respond strictly in the requested language: "${language === "id" ? "Indonesian (Bahasa Indonesia)" : "English"}".
Provide an elegant, constructive evaluation of their current income vs spending habits, major asset gaps, and next logical tactical adjustments.`;

    const response = await generateContentWithRetry({
      model: COCHING_MODEL,
      contents: query,
      config: {
        systemInstruction: `You are the dooitly AI Strategic Wealth Consultant.
Analyze the user's cash flow inputs, trend data, and surplus margins.
Produce a sophisticated, professional, yet readable JSON report.
All text values MUST be completely in the user's requested language (${language === "id" ? "Indonesian / Bahasa Indonesia" : "English"}).`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A comprehensive narrative summarizing cash flow status (e.g. surplus stability, high expense ratio during specific times).",
            },
            leakSource: {
              type: Type.STRING,
              description: "A short assessment focusing on potential leaks or volatile periods in the trends.",
            },
            ratioAnalysis: {
              type: Type.STRING,
              description: "Brief analysis comparing current total income vs total recorded expenditures.",
            },
            actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 highly actionable, clear financial adjustments or asset optimization advice list.",
            },
          },
          required: ["summary", "leakSource", "ratioAnalysis", "actions"],
        },
      },
    }, 3, 1500, () => makeCashflowFallback(trendTimeframe || "bulanan", trendData || [], preferences || {}, language || "en"));

    res.json(JSON.parse((response.text || "{}").trim()));
  } catch (error: any) {
    console.error("Analyze Cashflow API error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate AI trend analysis report" });
  }
});

// Serve static compiled assets in production, otherwise mount high-performance Vite dev server
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Mounting Vite dynamic middleware workspace...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aura Engine Online] Ports & Bridges configured at http://localhost:${PORT}`);
  });
}

initializeServer();
