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

router.get('/favorites',authenticate,async (req,res)=>{
  try{
    const user=req.user;
    const favorites =await Recipe.find({ _id: { $in: user.favorites } })
    res.json(favorites);
  }catch (error) {
    console.error(err);
    res.status(500).json({error:'Failed to fetch favorites'});
}
});


module.exports = router;
