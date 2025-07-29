const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const authenticate = require('../middleware/auth');

// Get all users (Admin only for safety)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    const users = await User.find().select('firstname lastname email role isBanned isChefActive');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id/ban
router.put('/:id/ban', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    const { isBanned, isChefActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned, isChefActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/:id/promote
router.put('/:id/promote', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User promoted to admin successfully', user });
  } catch (error) {
    console.error('Promotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a recipe to favorites
router.post('/favorites/:recipeId', authenticate, async (req, res) => {
  const userId = req.user._id; // Changed from req.user.id
  const { recipeId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
    }
    res.status(200).json({ message: 'Recipe added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove a recipe from favorites
router.delete('/favorites/:recipeId', authenticate, async (req, res) => {
  const userId = req.user._id; // Changed from req.user.id
  const { recipeId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== recipeId
    );
    await user.save();
    res.status(200).json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Get user's favorite recipes
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites'); // Changed from req.user.id
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.favorites); // Send back full recipe objects
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

module.exports = router;