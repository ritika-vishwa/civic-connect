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

router.post('/analyze-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

    const prompt = `Analyze this image of a civic issue. Return ONLY a valid JSON object (no markdown formatting, no backticks) with the following fields:
"category": one of ["Potholes", "Water Leaks", "Broken Streetlights", "Garbage Accumulation", "Drainage Blockages", "Road Damage", "Sanitation Issues", "Other"].
"confidence": a number between 0 and 1 indicating how confident you are.
"severity": one of ["Low", "Medium", "High", "Critical"].
"department": one of ["Public Works", "Sanitation", "Traffic Control", "Urban Operations"].
"title": A short, clear title for the issue.
"description": A detailed description of what is seen in the image.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);

    let jsonStr = result.response.text().trim();
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) {
      jsonStr = match[0];
    }
    const aiData = JSON.parse(jsonStr);

    res.json(aiData);
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image.', details: error.message });
  }
});

router.post('/assist', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Rewrite the following issue description to be professional, detailed, and objective for a city municipal department. Keep it concise. Also generate a short, punchy title. Return ONLY a JSON object with "title" and "description" keys.\n\nOriginal title: ${title || ''}\nOriginal description: ${description}`;
    
    const result = await model.generateContent(prompt);
    
    let jsonStr = result.response.text().trim();
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) jsonStr = match[0];
    const data = JSON.parse(jsonStr);

    res.json(data);
  } catch (error: any) {
    console.error('Error in AI assist:', error);
    res.status(500).json({ error: 'Failed to rewrite description.', details: error.message });
  }
});

router.post('/verify-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

    const prompt = `Analyze this image to verify if it represents a valid real-world municipal or civic issue (such as potholes, road damage, garbage piles, broken lights, leaks, graffiti, vandalism, public safety hazards).
    
    Determine if the image is fake, irrelevant, a selfie, indoor room clean, drawing, meme, food, text document, or clip art.
    
    Return a JSON object exactly matching this format:
    {
      "isValid": true | false,
      "reason": "Clear explanation of why it is approved or rejected."
    }
    Return raw JSON only, no markdown styling.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);

    let jsonStr = result.response.text().trim();
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) {
      jsonStr = match[0];
    }
    const aiData = JSON.parse(jsonStr);

    res.json(aiData);
  } catch (error: any) {
    console.error('Error verifying image:', error);
    res.status(500).json({ error: 'Failed to verify image.', details: error.message });
  }
});

export default router;
