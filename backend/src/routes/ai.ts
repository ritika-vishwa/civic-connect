import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const router = Router();

router.post('/generate-description', async (req, res) => {
  try {
    const { title, category, date, time, location } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Event title is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a highly skilled copywriter and civic engagement expert helping a user create an engaging event description for a local community platform.
The platform has a modern, neon/cyberpunk aesthetic.

Event Title: "${title}"
Category: "${category || 'General'}"
${date ? `Date: "${date}"` : ''}
${time ? `Time: "${time}"` : ''}
${location ? `Location: "${location}"` : ''}

Please generate a highly engaging, structured, and detailed event description (about 3-4 paragraphs) that would excite citizens to attend.
Include:
- A catchy opening hook
- The main purpose and agenda of the event
- Why it matters for the community
${(date || time || location) ? '- Weave the provided date, time, and location into the description naturally.' : ''}

Output ONLY the text of the description, ready to be pasted into a text area. Do not include markdown formatting like ** or #. Keep it professional but energetic.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ description: text.trim() });
  } catch (error: any) {
    console.error('Error generating AI description:', error);
    res.status(500).json({ error: 'Failed to generate description with AI.', details: error.message });
  }
});

export default router;
