const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const multer = require('multer');
const bodyParser = require('body-parser');
const authenticate = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Middleware to parse JSON and urlencoded data
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Get all approved recipes with optional search and goal filtering
router.get('/', async (req, res) => {
  try {
    const { q, goal } = req.query;
    const query = { status: 'Approved' };

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { title: searchRegex },
        { tags: searchRegex }
      ];
    }

    if (goal) {
      const goalToTags = {
        'High Protein': ['high-protein', 'protein'],
        'Low Carb': ['low-carb', 'keto'],
        'Heart Healthy': ['heart-healthy', 'low-fat'],
        'Quick Meals': ['quick-meals', 'under-30-minutes'],
        'Vegan': ['vegan', 'plant-based'],
        'Comfort Food': ['comfort-food', 'hearty', 'Comfort Food']
      };
      const tags = goalToTags[goal];
      if (tags) {
        query.tags = { $in: tags.map(tag => new RegExp(`^${tag}$`, 'i')) };
      } else {
        console.log('Invalid goal:', goal);
        return res.status(400).json({ message: 'Invalid goal' });
      }
    }

    const recipes = await Recipe.find(query).populate('chefId', 'firstname lastname');
    console.log('Fetched approved recipes:', recipes.length, 'Query:', query);
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

// Get all recipes (for admin dashboard)
router.get('/all', authenticate, async (req, res) => {
  try {
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
  //check if the user is a chef and active
  if (req.user.role==='chef'){
    if(!req.user.isChefActive){
      console.log('Inactive chef tried to create a recipe:',req.user._id);
      return res.status(403).json({message: 'Your chef account is not actiavted yet.'});
    }
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
    tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim().toLowerCase().replace(/\s+/g, '-')) : [],
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

    if (req.user.role === 'admin') {
      if (req.body.status) {
        recipe.status = req.body.status;
      }
    } else if (recipe.chefId.toString() === req.user._id.toString()) {
      recipe.title = req.body.title || recipe.title;
      recipe.description = req.body.description || recipe.description;
      recipe.cookTime = req.body.cookTime || recipe.cookTime;
      recipe.servings = req.body.servings || recipe.servings;
      recipe.difficulty = req.body.difficulty || recipe.difficulty;
      recipe.ingredients = req.body.ingredients || recipe.ingredients;
      recipe.instructions = req.body.instructions || recipe.instructions;
      if (req.file) {
        recipe.image = `/Uploads/${req.file.filename}`;
      }
      recipe.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim().toLowerCase().replace(/\s+/g, '-')) : recipe.tags;
      recipe.calories = req.body.calories ? parseInt(req.body.calories) : recipe.calories;
    } else {
      return res.status(403).json({ message: 'Unauthorized to update this recipe' });
    }

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

    if (req.user.role !== 'admin' && recipe.chefId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this recipe' });
    }

    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error('Error deleting recipe:', err);
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

// Create a comment for a recipe
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { comment, rating } = req.body;
    if (!comment || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Comment and valid rating (1-5) are required' });
    }
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    const commentData = {
      recipeId: req.params.id,
      userId: req.user._id,
      comment,
      rating,
      likes: [],
      replies: [],
    };
    const newComment = new Comment(commentData);
    await newComment.save();
    const populatedComment = await Comment.findById(newComment._id).populate('userId', 'firstname lastname');
    console.log('Comment saved:', populatedComment);
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Error saving comment:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Get all comments for a recipe
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ recipeId: req.params.id })
      .populate('userId', 'firstname lastname')
      .populate('replies.userId', 'firstname lastname');
    console.log(`Fetched ${comments.length} comments for recipe ${req.params.id}`);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Like a comment
router.post('/comments/:commentId/like', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const userId = req.user._id;
    if (comment.likes.includes(userId)) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
    }
    await comment.save();
    console.log('Comment like toggled:', comment);
    const populatedComment = await Comment.findById(req.params.commentId)
      .populate('userId', 'firstname lastname')
      .populate('replies.userId', 'firstname lastname');
    res.json(populatedComment);
  } catch (err) {
    console.error('Error liking comment:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Reply to a comment
router.post('/comments/:commentId/reply', authenticate, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) {
      return res.status(400).json({ message: 'Reply text is required' });
    }
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    comment.replies.push({
      userId: req.user._id,
      comment: reply,
      date: new Date(),
    });
    await comment.save();
    console.log('Reply added:', comment);
    const updatedComment = await Comment.findById(req.params.commentId)
      .populate('userId', 'firstname lastname')
      .populate('replies.userId', 'firstname lastname');
    res.json(updatedComment);
  } catch (err) {
    console.error('Error adding reply:', err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;