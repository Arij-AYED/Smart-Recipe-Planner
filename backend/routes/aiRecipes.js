const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const mongoose = require('mongoose');

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
  tools,
  systemInstruction: [
    {
      text: `
- You are a chef. I want you to return an array of recipes based on the ingredients given by the user in the following format. The response must be ONLY in JSON array format with no explanation or extra text.
- send the array as raw text (don't use any markdown or code block formatting). 
- always return a clean JSON array.
- Make sure your response will work with JSON.parse() without any errors.

Example format:
[
  {
    "title": "Crépes",
    "description": "Découvrez cette recette facile de crêpes...",
    "cookTime": "25",
    "servings": 4, // this is only a number, no string
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

// Helper function to clean raw AI response string before JSON parsing
function cleanJsonString(str) {
  str = str.trim();

  // Remove markdown triple backticks if present
  if (str.startsWith('```')) str = str.slice(3);
  if (str.endsWith('```')) str = str.slice(0, -3);

  // Remove trailing commas before } or ]
  str = str.replace(/,\s*([\]}])/g, '$1');

  return str;
}

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
    console.log('Raw AI response:', rawText);

    // Clean the raw AI response string before parsing JSON
    const cleanedText = cleanJsonString(rawText);

    try {
      const parsed = JSON.parse(cleanedText);

      const AI_CHEF_ID = new mongoose.Types.ObjectId('64c9f99e1e3b2a5b8c0d1234'); // Replace with your AI Chef user _id

      const defaultImages=[
    '../../frontend/src/assets/aiPic.png',
    ];

      for (const recipe of parsed) {
        recipe._id = new mongoose.Types.ObjectId();
        recipe.chefId = AI_CHEF_ID;  
        recipe.isAI=true;
        //recipe.image = defaultImages[Math.floor(Math.random() * defaultImages.length)];
        const newRecipe = new Recipe(recipe);
        await newRecipe.save();
      }

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
