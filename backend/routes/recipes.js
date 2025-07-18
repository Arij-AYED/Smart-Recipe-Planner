const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const multer = require('multer');
const bodyParser = require('body-parser');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists or adjust path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Middleware to parse JSON and urlencoded data
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new recipe with image upload
router.post('/', upload.single('image'), async (req, res) => {
  const recipeData = {
    title: req.body.title,
    description: req.body.description,
    cookTime: req.body.cookTime,
    servings: req.body.servings,
    difficulty: req.body.difficulty,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions,
    status: 'Pending',
    image: req.file ? `/uploads/${req.file.filename}` : '/placeholder.svg',
  };
  const recipe = new Recipe(recipeData);
  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a recipe with image upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    recipe.title = req.body.title || recipe.title;
    recipe.description = req.body.description || recipe.description;
    recipe.cookTime = req.body.cookTime || recipe.cookTime;
    recipe.servings = req.body.servings || recipe.servings;
    recipe.difficulty = req.body.difficulty || recipe.difficulty;
    recipe.ingredients = req.body.ingredients || recipe.ingredients;
    recipe.instructions = req.body.instructions || recipe.instructions;
    if (req.file) {
      recipe.image = `/uploads/${req.file.filename}`;
    }

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a recipe
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;