const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/uploads');
const authenticate = require('../middleware/auth');

// Configure file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'Uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Sign up route
router.post('/register', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;
    const profileImageFile = req.files['profileImage'] ? req.files['profileImage'][0] : null;
    const certificateFile = req.files['certificate'] ? req.files['certificate'][0] : null;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const imagePath = profileImageFile ? `/Uploads/${profileImageFile.filename}` : '/Uploads/default-avatar.jpg';
    const hashedPassword = await bcrypt.hash(password, 10);

    const validRoles = ['admin', 'chef', 'user'];
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? 'admin' : (validRoles.includes(role) ? role : 'user');

    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: assignedRole,
      certificate: assignedRole === 'chef' && certificateFile ? certificateFile.filename : undefined,
      profileImage: imagePath
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated token for user:', user._id, 'Role:', user.role, 'Token:', token);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});
//updating the user profile
router.put('/profile',authenticate,async(req,res)=>{
  const userId=req.user.id;
  const {firstname,lastname,bio,location}=req.body;
    console.log('Updating user profile for:', userId);
  console.log('New data:', { firstname, lastname, bio, location });
  try{
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstname, lastname, bio, location },
      {new:true}
    ).select('-password');

    if(!updatedUser){
      return res.status(404).json({error:'User not found'});
    }
    res.json(updatedUser);
  }catch (err){
    console.error('Error upating user profile',err);
    res.status(500).json({error:'Failed to update profile'});
  }
});

// Profile route
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching profile for user:', userId);
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;