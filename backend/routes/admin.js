const express=require('express');
const router=express.Router();
const {verifyAdmin} =require('../middleware/authmiddleware');
const User=require('../models/User');
const Recipe=require('../models/Recipe');
// Get all users
// admin.js
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().lean(); // Use .lean() for better performance
    const transformedUsers = await Promise.all(
      users.map(async (user) => {
        const recipesCount = await Recipe.countDocuments({ createdBy: user._id });
        return {
          id: user._id.toString(),
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          status: user.isBanned ? 'banned' : user.isChefActive && user.role === 'chef' ? 'active' : 'inactive',
          joinedAt: user.createdAt.toISOString().split('T')[0], // Format date
          recipesCount,
          lastLogin: user.updatedAt.toISOString().split('T')[0], // Use updatedAt as a proxy for lastLogin
        };
      })
    );
    res.json(transformedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});
//Dashboard stats
router.get('/stats',verifyAdmin,async (req,res)=>{
    try{
        const totalUsers=await User.countDocuments();
        const totalChefs = await User.countDocuments({ role: 'chef' });
        const totalRecipes=await Recipe.countDocuments();
        const pendingRecipes = await Recipe.countDocuments({ approved: false });

        res.json({totalUsers,totalChefs,totalRecipes,pendingRecipes});

    }catch(err){
        res.status(500).json({error:err.message});
    }
})

//Approve recipe
router.put('/recipe/:id/approve',verifyAdmin,async(req,res)=>{
    try{
        const recipe=await Recipe.findByIdAndUpdate(req.params.id,{ approved:true});
        res.json({message:'Recipe approved',recipe});

    }catch (err){
        res.status(500).json({error:err.message});
    }
});

// Reject recipe
router.put('/recipes/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe rejected and deleted', recipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Ban or unban user 
router.put('/users/:id/ban',verifyAdmin, async (req,res) =>{
    try{
        const user=await User.findById(req.params.id);
        user.isBanned=!user.isBanned;
        await user.save();
        res.json({message:`User ${user.isBanned ? 'banned':'unbanned'}`,user});

    }catch(err){
        res.status(500).json({error:err.message});
    }

})
// Promote user to admin
router.put('/users/:id/promote', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
    res.json({ message: 'User promoted to admin', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve chef account
router.put('/chefs/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isChefApproved: true }, { new: true });
    res.json({ message: 'Chef account approved', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;