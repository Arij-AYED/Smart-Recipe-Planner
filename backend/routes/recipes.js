const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const multer = require('multer');
const bodyParser = require('body-parser');
const authenticate = require('../middleware/auth');
const mega = require('mega');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');


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


// Get all approved recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find({ status: 'Approved' });
    console.log('Fetched approved recipes:', recipes.length);
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching approved recipes:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get all available tags
router.get('/tags', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    const allTags = [...new Set(recipes.flatMap(recipe => recipe.tags || []))];
    console.log('Fetched tags:', allTags);
    res.json(allTags);
  } catch (err) {
    console.error('Error fetching tags:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get all recipes (for admin dashboard and ChefRecipeManager)
router.get('/all', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    console.log('Fetched all recipes:', recipes.length);
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching all recipes:', err.message);
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
    tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
    calories: req.body.calories ? parseInt(req.body.calories) : 0,
    chefId: req.body.chefId ,
  };
  const recipe = new Recipe(recipeData);
  try {
    const newRecipe = await recipe.save();
    console.log('Recipe saved:', newRecipe);
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error('Error saving recipe:', err.message);
    res.status(400).json({ message: err.message });
  }
});


// Update a recipe with image upload or status change
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
    recipe.status = req.body.status || recipe.status; // Allow status updates
    if (req.file) {
      recipe.image = `/uploads/${req.file.filename}`;
    }
    recipe.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : recipe.tags;
    recipe.calories = req.body.calories ? parseInt(req.body.calories) : recipe.calories;
    recipe.chefId = req.body.chefId || recipe.chefId;

    const updatedRecipe = await recipe.save();
    console.log('Recipe updated:', updatedRecipe);
    res.json(updatedRecipe);
  } catch (err) {
    console.error('Error updating recipe:', err.message);
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

router.get('/my-recipes', authenticate, async (req, res) => {
  try {
    const myRecipes = await Recipe.find({ createdBy: req.user._id }); // assuming `createdBy` field exists
    res.json(myRecipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user recipes' });
  }});

// Get a single recipe by ID (must be after specific routes)
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching recipe with ID: ${req.params.id}`);
    if (!mongoose.isValidObjectId(req.params.id)) {
      console.log(`Invalid ObjectID: ${req.params.id}`);
      return res.status(400).json({ message: 'Invalid recipe ID format' });
    }
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      console.log(`Recipe not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Recipe not found' });
    }
    console.log('Recipe fetched:', recipe);
    res.json(recipe);
  } catch (err) {
    console.error('Error fetching recipe:', err.message);
    res.status(500).json({ message: err.message });

  }
});
module.exports = router;