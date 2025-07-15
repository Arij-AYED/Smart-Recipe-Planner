const express = require ('express');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const User = require ('../models/User');
const router = express.Router();

//Register

router.post('/register',async (req,res) =>{
    const {email,password}=req.body;

    const userExists=await User.findOne({email});
    if (userExists) return res.status(400).json({error:'User already exists'});

    const hashedPassword = await bcrypt.hash(password,10);
    const newUser=new User({email,password:hashedPassword});
    await newUser.save();

    res.status(201).json({message:'User registered'});
});

//login
router.post('/login', async(req,res) =>{
    const {email,password}=req.body;

    const user=await User.findOne({email});
    if(!user){
            console.log('User not found');
         return res.status(401).json({error:'Invalid credentials'});
      }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
        console.log('password missmatch');
         return res.status(401).json({ error: 'Invalid credentials' });
          }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful');    
     res.json({ message: 'Login successful', token });
});

module.exports = router;