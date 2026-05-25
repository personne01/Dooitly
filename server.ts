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

    const response = await ai.models.generateContent({
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
    });

    const bodyText = response.text || "{}";
    res.json(JSON.parse(bodyText.trim()));
  } catch (error: any) {
    console.error("Health Analyzer API error:", error);
    res.status(500).json({ error: error?.message || "Failed to analyze financials" });
  }
});

// API 2: Scam / Fraud Detector
app.post("/api/gemini/detect-scam", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ error: "Missing material to inspect" });
    }

    const response = await ai.models.generateContent({
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
    });

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

    const response = await ai.models.generateContent({
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
    });

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

    const response = await ai.models.generateContent({
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
    });

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

    const serverReply = await chatInstance.sendMessage({
      message: message,
    });

    res.json({ text: serverReply.text });
  } catch (error: any) {
    console.error("Chat Advisor API error:", error);
    res.status(500).json({ error: error?.message || "Failed to stream chat thoughts" });
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
