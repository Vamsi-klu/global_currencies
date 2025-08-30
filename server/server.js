import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 8787;
const STATIC_DIR = process.env.STATIC_DIR || path.resolve(__dirname, '../curr');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Serve the static UI
app.use(express.static(STATIC_DIR));

// Health
app.get('/api/health', (_, res) => res.json({ ok: true }));

// AI proxy: builds the prompt and returns structured JSON points
app.post('/api/chat', async (req, res) => {
  try {
    const { question, minBullets = 10, style = 'balanced', detail = 2, model } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Missing question' });
    }
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server missing OPENAI_API_KEY' });
    }

    const styleMap = { concise: 'concise but complete', balanced: 'balanced length', 'in-depth': 'deep, thorough' };
    const sys = 'You are an expert analyst of money, macroeconomics, and currencies. Produce clear, factual, organized guidance.';
    const userInstruction = `Task: Answer the user question as an ordered list of at least ${Math.max(10, +minBullets || 10)} bullet points. Each point must contain a short title and a well-explained 1-3 sentence explanation. Style should be ${styleMap[style] || 'balanced'}. Detail level: ${detail}/3. Return ONLY valid JSON with this exact shape:\n{ "points": [ { "title": string, "explanation": string } ] }\nDo not include any extra keys or prose.`;

    const body = {
      model: model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `${userInstruction}\n\nUser question: ${question}` }
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' }
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).json({ error: 'OpenAI error', details: t });
    }
    const j = await r.json();
    let content = j?.choices?.[0]?.message?.content || '';
    let parsed;
    try { parsed = JSON.parse(content); } catch {
      parsed = { points: fallbackParse(content, Math.max(10, +minBullets || 10)) };
    }
    let points = Array.isArray(parsed.points) ? parsed.points : [];
    while (points.length < Math.max(10, +minBullets || 10)) {
      points.push({ title: `Additional consideration ${points.length + 1}`, explanation: 'Add more detail specific to the user context.' });
    }
    res.json({ points });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

function fallbackParse(text, n) {
  const lines = String(text).split(/\r?\n/).filter(Boolean);
  const bullets = [];
  for (const ln of lines) {
    const m = ln.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (m) bullets.push(m[1].trim());
  }
  const result = bullets.slice(0, Math.max(n, bullets.length)).map((t, i) => ({
    title: t.split(':')[0] || `Point ${i + 1}`,
    explanation: t.includes(':') ? t.split(':').slice(1).join(':').trim() : ''
  }));
  return result.length ? result : [{ title: 'Summary', explanation: text }];
}

// Fallback to index.html for SPA-like behavior
app.get('*', (req, res) => {
  res.sendFile(path.resolve(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
  console.log(`Serving static from ${STATIC_DIR}`);
});

