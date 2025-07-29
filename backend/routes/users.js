// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe=require('../models/Recipe'); // adjust the path if needed
const authenticate = require('../middleware/auth'); // authentication middleware

// Get user profile
// Get all users (Admin only for safety)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('firstname lastname email role isBanned isChefActive');; // fetch all users
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});
// PUT /api/users/:id/ban
router.put('/:id/ban', async (req, res) => {
  try {
    const { isBanned, isChefActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isBanned,
        isChefActive
      },
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

router.put('/:id/promote',async (req,res)=>{
  try{
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {role:'admin'},
      {new:true}
    )
    if (!user){
      return res.status(404).json({error: 'User not found'});
    }
    res.json({message: 'User promoted to admin successfully', user});
  }catch (error){
    console.error('Promotion error:', error);
    res.status(500).json({error: 'Server error'});
  }
})

router.post('/favorites/:recipeId', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
    }
    res.status(200).json({ message: 'Recipe added to favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// ❌ Remove a recipe from favorites
router.delete('/favorites/:recipeId', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.params;

  try {
    const user = await User.findById(userId);
    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== recipeId
    );
    await user.save();
    res.status(200).json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.favorites); // send back full recipe objects
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});



module.exports = router;
