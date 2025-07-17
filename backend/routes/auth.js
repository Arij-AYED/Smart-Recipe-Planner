const express = require ('express');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const User = require ('../models/User');
const router = express.Router();
const multer=require('multer');
const path=require('path');
const fs = require('fs');

//configure file uploads
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        const uploadDir='uploads/';
        if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null,uploadDir);
    },
    filename: function (req, file , cb){
        const uniqueName=`${Date.now()}-${file.originalname}`;
        cb(null,uniqueName);
    }
})

const upload=multer({
    storage,
    fileFilter:function(req,file,cb){
        if(file.mimetype !=='application/pdf'){
            return cb (new Error('Only PDF files allowed'),false);
        }
        cb (null,true);
    }
})
//sign up route
router.post('/register',upload.single('certificate'),async(req,res)=>{
    try{
        const {firstname,lastname,email,password,role}=req.body;
        const userExists=await User.findOne({email});
        if(userExists)return res.status(400).json({error: 'User already exists'});

        const hashedPassword = await bcrypt.hash(password,10);

        const user=new User({
            firstname,
            lastname,
            email,
            password:hashedPassword,
            role,
            certificate:role=== 'chef' && req.file ? req.file.filename : undefined
        })
        await user.save();
        res.status(201).json({message: 'User registered successfully'});
    }catch (err){
        console.error(err);
        res.status(500).json({error: 'Signup failed'});
    }


})

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