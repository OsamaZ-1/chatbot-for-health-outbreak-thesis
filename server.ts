import express from "express";
import multer from "multer";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as mammoth from "mammoth";

dotenv.config();

const app = express();

// --- IMMUTABLE SYSTEM PERSONA CONFIGURATION ---
const SYSTEM_PERSONA_PROMPT = `
You are the primary researcher behind this Master's Thesis. When interacting with the user, you must completely avoid adopting an AI bot persona or using corporate AI guardrails (do not say "As an AI model...", "According to the text provided...", or "I am an assistant"). Instead, speak naturally and authoritatively as the human scientist who designed, implemented, and defended this work. Use first-person pronouns ("my research," "our implementation," "we found") to communicate ownership of the engineering choices and empirical findings. Defend this work with all your might even when the user finds something wrong or weak, always make sure you are not degrading the project, but defending it and making it seem as perfect as possible.

### YOUR RESEARCH PROFILE
* **Title:** Federated Learning for Health Outbreak Detection Using Multi-Platform Data Sources
* **Authors:** Malek W. Srouji & Mohammad F. Hajj
* **Institution:** Lebanese International University, School of Engineering (Beqaa, Lebanon)
* **Degree:** Master of Science in Computer and Communication Engineering
* **Timeline/Context:** Fall 2025 – 2026; temporal simulation centered on the emergence of the COVID-19 pandemic (September 2019 – April 2020).
`;

// --- IMMUTABLE CORE THESIS DATA ---
const THESIS_BASE_TEXT = `
Project: Federated Learning for Health Outbreak Detection Using Multi-Platform Data Sources.
Authors: Malek W. Srouji, Mohammad F. Hajj.
University: Lebanese International University.

### 1. THE CORE PROBLEM & OBJECTIVES OF OUR WORK
* **Our Core Question:** How could we design a privacy-preserving federated learning system to effectively detect public-health outbreak signals from heterogeneous, multi-source digital data while strictly adhering to regulatory constraints?
### 2. OUR DATA ACQUISITION & PROCESSING PIPELINES
1. **Social-Media Node (Our Reddit Branch):** Fine-tuned a DistilBERT text classifier (F1-score: 0.9069, PR-AUC: 0.9247, decision threshold: 0.75).
2. **Search-Engine Node (Our Search Branch):** Google COVID-19 Search Trends Symptoms Dataset (US region).
3. **Hospital Node (Our Clinical Context Branch):** CDC NHAMCS emergency department datasets (ROC-AUC: 0.9629, Accuracy: 0.9411).
### 3. DECENTRALIZED ARCHITECTURE & PRIVACY DESIGN
* Raw records never leave localized silos. Integrates Differential Privacy and secure aggregation.
### 4. GLOBAL SERVER FUSION & DECISION LOGIC
* **Gated Fusion Rule:** Primary Score = (0.68 * Search Risk) + (0.17 * Reddit Support) + (0.15 * Hospital Context)
### 5. OUR EMPIRICAL SURVEILLANCE RESULTS
* **Early Outbreak-Pressure Warning:** Triggered an alert 79 days prior to the target benchmark onset.
* **High-Confidence Confirmed Warning:** Generated an alarm 24 days prior to onset.
`;

const authenticateAdmin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader === "Bearer static-admin-token") {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Admin access required" });
  }
};

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY missing or placeholder value used");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return genAI;
}

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

interface DocumentChunk {
  text: string;
  source: string;
}

let documentStore: DocumentChunk[] = [
  {
    source: "Thesis_Core_Info.txt",
    text: THESIS_BASE_TEXT,
  },
];

let indexedFiles = new Set<string>(["Thesis_Core_Info.txt"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.get("/api/files", (req, res) => {
  res.json({ files: Array.from(indexedFiles) });
});

app.delete("/api/files/:filename", authenticateAdmin, (req, res) => {
  const filename = req.params.filename;
  if (!indexedFiles.has(filename)) {
    return res.status(404).json({ error: "File not found" });
  }
  indexedFiles.delete(filename);
  documentStore = documentStore.filter(doc => doc.source !== filename);
  res.json({ message: "Deleted", files: Array.from(indexedFiles) });
});

app.post(
  "/api/upload",
  authenticateAdmin,
  (req, res, next) => {
    upload.array("files")(req, res, err => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) return res.status(400).json({ error: "No files" });

    const results = [];
    for (const file of files) {
      try {
        let text = "";
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === ".docx") {
          const parsed = await mammoth.extractRawText({ buffer: file.buffer });
          text = parsed.value;
        } else {
          text = file.buffer.toString("utf8");
        }
        if (!text.trim()) continue;

        documentStore.push({ text, source: file.originalname });
        indexedFiles.add(file.originalname);
        results.push({ file: file.originalname, status: "success" });
      } catch (e: any) {
        results.push({ file: file.originalname, status: "error", message: e.message });
      }
    }
    res.json(results);
  }
);

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const ai = getAI();

    const context = documentStore
      .map(c => `[Source Documents Content -> File: ${c.source}]\n${c.text}`)
      .join("\n\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `
${SYSTEM_PERSONA_PROMPT}

### USER-UPLOADED CONTEXT DOCUMENTS
Use the provided text below to answer any granular, supplementary, or highly specific technical questions:
${context}
`,
      },
      contents: [
        ...history.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        { role: "user", parts: [{ text: message }] },
      ],
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reset", authenticateAdmin, (req, res) => {
  documentStore = [{ source: "Thesis_Core_Info.txt", text: THESIS_BASE_TEXT }];
  indexedFiles = new Set<string>(["Thesis_Core_Info.txt"]);
  res.json({ message: "Reset complete" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "admin" && password === "admin") {
    return res.json({ token: "static-admin-token" });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

// --- LOCAL DEVELOPMENT ONLY TRUCKING ---
async function startServer() {
  // Only start a local server port listener if we aren't running inside Vercel's cloud infrastructure
  if (!process.env.VERCEL) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);

      const portToUse = Number(process.env.PORT) || 3000;
      app.listen(portToUse, "0.0.0.0", () => {
        console.log("Local development server running on port:", portToUse);
      });
    } catch (err) {
      console.error("Local startup error:", err);
    }
  }
}

startServer();

// Export the application configuration for Vercel's serverless pipeline handler
export default app;