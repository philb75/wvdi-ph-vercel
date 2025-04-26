// api/chat.js  ── Node-runtime on Vercel
import OpenAI from 'openai';

/** GitHub-Pages origin that’s allowed to call this API */
const ORIGIN = 'https://western-visayas-driving-institute.github.io';

/** Utility: set common CORS headers */
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  /* ---------- 1. CORS PRE-FLIGHT ---------- */
  if (req.method === 'OPTIONS') {
    setCors(res);
    return res.status(204).end(); // ✅ tell the browser “OK, go ahead”
  }

  /* ---------- 2. REJECT OTHER VERBS ---------- */
  if (req.method !== 'POST') {
    setCors(res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* ---------- 3. HANDLE THE ACTUAL POST ---------- */
  setCors(res);                       // must be on the real response too

  const { message, history, language } = req.body || {};
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not set' });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',          // ← use any model you like
      messages: [
        {
          role: 'system',
          content: `You are DriveBot, the helpful, friendly assistant for Western Visayas Driving Institute (WVDI).

Branches:
- Bacolod: 4/F Space #4007 Ayala Malls Capitol Central, Gatuslao St. Bacolod City
- Kabankalan: Cor. Guanzon & Rizal Sts., Kabankalan City, Negros Occidental
- Dumaguete: Capitol Area, Taclobo, Dumaguete City, Negros Oriental

Contact:
- Phone: (034) 435-5803
- Email: info@wvdi.ph
- Opening hours: Mondays to Saturdays, 8:00 AM – 6:00 PM

Services:
- Theoretical Driving Course (TDC)
- Practical Driving Course (PDC)
- Student-permit assistance
- Driver-license application & renewal

You always answer in the user’s language and help with course info, enrollment, schedules, and general WVDI questions.`,
        },
        ...(history || []),
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });

    return res
      .status(200)
      .json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI error:', err);
    return res
      .status(500)
      .json({ error: err?.message || 'Error processing your request' });
  }
}
