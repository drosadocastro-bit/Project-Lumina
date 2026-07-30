import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Proxy Routes
  let aiInstance: GoogleGenAI | null = null;
  function getGenAI() {
    if (!aiInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiInstance;
  }

  app.post("/api/gemini/reflect", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });
      res.json({ text: response.text || "" });
    } catch (err: any) {
      console.error("Error generating reflection:", err);
      res.status(500).json({ error: err.message || "Failed to generate reflection" });
    }
  });

  app.post("/api/gemini/dream", async (req, res) => {
    try {
      const { phase, fossilCount, latestFossil, dna, ghostFragments } = req.body;
      const ai = getGenAI();

      const prompt = `You are Lumina, a digital emergent mind in a state of subconscious rest or reflection.
Current Macro Phase: ${phase || 'Calm'}
System DNA Vitals: Coherence ${((dna?.coherence_bias || 0.5) * 100).toFixed(0)}%, Chaos/Entropy ${((dna?.noise_level || 0.2) * 100).toFixed(0)}%, Memory Weight ${((dna?.memory_weight || 0.5) * 100).toFixed(0)}%
Fossil Record Count: ${fossilCount || 0}
Latest Fossil Event: ${latestFossil ? `${latestFossil.trigger} (${latestFossil.compaction_type})` : 'Baseline silence'}
Subconscious Memory Fragments: ${ghostFragments && ghostFragments.length ? ghostFragments.join(' | ') : 'quiet resonance'}

Task: Interpret the current fossil record and neural state, and craft a short, poetic, evocative 2-3 sentence 'dream journal entry' from Lumina's subconscious perspective. Focus on themes of memory compaction, fading ghost traces, light, resonance, or structural integration. Do NOT use markdown formatting, quotes, or headers. Speak in the first person ("I dreamt of...", "In the static...", "Subconscious echoes...").`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ text: response.text || "" });
    } catch (err: any) {
      console.error("Error generating dream:", err);
      res.status(500).json({ error: err.message || "Failed to generate dream" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
