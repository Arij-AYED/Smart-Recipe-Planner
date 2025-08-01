const express = require('express');
const router = express.Router();
const { GoogleGenAI, HarmBlockThreshold, HarmCategory } = require('@google/genai');
require('dotenv').config();

// Initialize GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


// Gemini configuration
const tools = [
  {
    googleSearch: {},
  },
];

const config = {
//   thinkingConfig: {
//     thinkingBudget: -1,
//   },
//   safetySettings: [
//     {
//       category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//       threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
//     },
//   ],
  tools,
  systemInstruction: [
    {
      text: `You are a chef. I want you to return an array of recipes based on the ingredients given by the user in the following format. The response must be ONLY in JSON array format with no explanation or extra text.
send the array as raw text (don't use any markdown or code block formatting).
Example format:
[
  {
    "title": "Crépes",
    "description": "Découvrez cette recette facile de crêpes...",
    "cookTime": "25",
    "servings": 4,
    "difficulty": "Easy",
    "ingredients": "250g Flour\\r\\n4 Eggs\\r\\n1/2 L Milk\\r\\n1 pinch of Salt\\r\\n2 tbsp Sugar",
    "instructions": "Mettez la farine dans un saladier...",
    "tags": [
      "easy",
      "beginners",
      "fun-to-make",
      "low-carb",
      "high-protein",
      "quick-meals"
    ],
    "calories": 140
  }
]`,
    },
  ],
};

router.post('/', async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Invalid ingredients format. Must be an array.' });
  }

  try {
    const model = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model,
      config,
      contents: [ingredients.join(', ')],
    });

    const rawText = response.text;

    // Attempt to parse JSON output
    try {
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      console.warn('Failed to parse Gemini JSON, returning raw text', err);
      res.json({ rawResponse: rawText });
    }
  } catch (err) {
    console.error('Gemini API Error:', err.message);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

module.exports = router;
