const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const multer = require('multer');
const bodyParser = require('body-parser');
const authenticate = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/'); // Ensure this directory exists or adjust path
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
    const recipes = await Recipe.find({ status: 'Approved' }).populate('chefId', 'firstname lastname');
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
router.get('/all', authenticate, async (req, res) => {
  try {
    // Only admins can access all recipes
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    const recipes = await Recipe.find().populate('chefId', 'firstname lastname');
    console.log('Fetched all recipes:', recipes.length);
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching all recipes:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Create a new recipe with image upload
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  console.log('Creating recipe, user ID:', req.user._id);
  if (!req.user._id) {
    console.error('No user ID found in request');
    return res.status(401).json({ message: 'Unauthorized: No user ID found' });
  }
  const recipeData = {
    title: req.body.title,
    description: req.body.description,
    cookTime: req.body.cookTime,
    servings: req.body.servings,
    difficulty: req.body.difficulty,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions,
    status: 'Pending',
    image: req.file ? `/Uploads/${req.file.filename}` : '/placeholder.svg',
    tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
    calories: req.body.calories ? parseInt(req.body.calories) : 0,
    chefId: req.user._id,
  };
  const recipe = new Recipe(recipeData);
  try {
    const newRecipe = await recipe.save();
    console.log('Recipe saved with chefId:', newRecipe.chefId);
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error('Error saving recipe:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Update a recipe with image upload or status change
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    // Admins can update any recipe's status; chefs can only update their own recipes
    if (req.user.role !== 'admin' && recipe.chefId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized to update this recipe' });
    }

    recipe.title = req.body.title || recipe.title;
    recipe.description = req.body.description || recipe.description;
    recipe.cookTime = req.body.cookTime || recipe.cookTime;
    recipe.servings = req.body.servings || recipe.servings;
    recipe.difficulty = req.body.difficulty || recipe.difficulty;
    recipe.ingredients = req.body.ingredients || recipe.ingredients;
    recipe.instructions = req.body.instructions || recipe.instructions;
    recipe.status = req.body.status || recipe.status;
    if (req.file) {
      recipe.image = `/Uploads/${req.file.filename}`;
    }
    recipe.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : recipe.tags;
    recipe.calories = req.body.calories ? parseInt(req.body.calories) : recipe.calories;
    recipe.chefId = req.user._id;

    const updatedRecipe = await recipe.save();
    console.log('Recipe updated:', updatedRecipe);
    res.json(updatedRecipe);
  } catch (err) {
    console.error('Error updating recipe:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Delete a recipe
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    // Ensure the user can only delete their own recipes
    if (req.user.role !== 'admin' && recipe.chefId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized to delete this recipe' });
    }

    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get recipes for the authenticated user
router.get('/my-recipes', authenticate, async (req, res) => {
  try {
    console.log('Fetching recipes for user:', req.user._id);
    const myRecipes = await Recipe.find({ chefId: req.user._id }).populate('chefId', 'firstname lastname');
    console.log(`Fetched ${myRecipes.length} recipes for user ${req.user._id}`);
    res.json(myRecipes);
  } catch (err) {
    console.error('Error fetching user recipes:', err.message);
    res.status(500).json({ error: 'Failed to fetch user recipes' });
  }
});

// Get a single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching recipe with ID: ${req.params.id}`);
    if (!mongoose.isValidObjectId(req.params.id)) {
      console.log(`Invalid ObjectID: ${req.params.id}`);
      return res.status(400).json({ message: 'Invalid recipe ID format' });
    }
    const recipe = await Recipe.findById(req.params.id).populate('chefId', 'firstname lastname');
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