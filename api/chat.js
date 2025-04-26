import { json } from 'micro';      // <— already installed in Vercel
import OpenAI from 'openai';
import { readFile } from 'fs/promises';

const ORIGIN = 'https://western-visayas-driving-institute.github.io';
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Disable the default bodyParser so we can read raw stream
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  /* ---- OPTIONS (pre-flight) ---- */
  if (req.method === 'OPTIONS') {
    setCors(res);
    return res.status(204).end();
  }

  /* ---- Only allow POST ---- */
  if (req.method !== 'POST') {
    setCors(res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCors(res);

  /* ---- Parse JSON body safely ---- */
  let payload = {};
  try {
    payload = await json(req);           // <— parses the stream
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { message = '', history = [] } = payload;
  if (!message.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  /* ---- OpenAI ---- */
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }

  try {
    const instructions = await readFile(new URL('./drivebot_instructions.txt', import.meta.url), 'utf8');
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',        // updated from gpt-3.5-turbo
      messages: [
        { role: 'system', content: instructions },
        ...history,
        { role: 'user', content: message }
      ],
      temperature: 0.7
    });

    return res
      .status(200)
      .json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI error:', err);
    return res
      .status(500)
      .json({ error: err?.message || 'OpenAI request failed' });
  }
}
