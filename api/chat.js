import OpenAI from 'openai';

export default async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://western-visayas-driving-institute.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  // … OpenAI call …

  res.setHeader('Access-Control-Allow-Origin', 'https://western-visayas-driving-institute.github.io');
  res.status(200).json({ reply });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, history, language } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'OpenAI API key not set in environment' });
    return;
  }

  const openai = new OpenAI({ apiKey });

  // System prompt with WVDI info
  const systemPrompt = `You are DriveBot, the helpful, friendly assistant for Western Visayas Driving Institute (WVDI).

Branches:
- Bacolod: 4/F Space #4007 Ayala Malls Capitol Central, Gatuslao St. Bacolod City
- Kabankalan: Cor. Guanzon & Rizal Sts., Kabankalan City, Negros Occidental
- Dumaguete: Capitol Area, Taclobo, Dumaguete City, Negros Oriental

Contact:
- Phone: (034) 435-5803
- Email: info@wvdi.ph
- Opening hours: Mondays to Saturdays, 8:00 AM to 6:00 PM

Services:
- Theoretical Driving Course (TDC)
- Practical Driving Course (PDC)
- Student Permit Application Assistance
- Driver's License Application and Renewal Support

You answer in the same language as the user. You help users with course info, enrollment, schedules, and general questions about WVDI.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(history || []),
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });
    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: error.message || 'Error processing your request' });
  }
}
