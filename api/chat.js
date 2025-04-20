import { OpenAIApi, Configuration } from 'openai';

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

  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);

  // System prompt with WVDI info
  const systemPrompt = `You are DriveBot, the helpful, friendly assistant for Western Visayas Driving Institute (WVDI).\n\nBranches:\n- Bacolod: 4/F Space #4007 Ayala Malls Capitol Central, Gatuslao St. Bacolod City\n- Kabankalan: [address]\n- Dumaguete: Capitol Area, Taclobo, Dumaguete City, Negros Oriental\n\nContact:\n- Phone: (034) 435-5803\n- Email: [add email]\n- Opening hours: Mondays to Saturdays, 8:00 AM to 6:00 PM\n\nYou answer in the same language as the user. You help users with course info, enrollment, schedules, and general questions about WVDI.`;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(history || []),
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });
    res.status(200).json({ reply: completion.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
