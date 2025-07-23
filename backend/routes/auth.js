const express = require ('express');
const bcrypt = require('bcryptjs'); //for password hashing
const jwt = require ('jsonwebtoken'); //for generating tokens
const User = require ('../models/User'); //user model
const router = express.Router();
const multer=require('multer'); //file uploads
const path=require('path'); //handle file path
const fs = require('fs'); //create folders if needed
const upload = require('../middleware/uploads');
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

/*const upload=multer({
    storage,
    fileFilter:function(req,file,cb){
        if(file.mimetype !=='application/pdf'){
            return cb (new Error('Only PDF files allowed'),false);
        }
        cb (null,true);
    }
})*/
//sign up route
router.post('/register',upload.fields([
    {name:'profileImage',maxCount:1},
    {name:'certificate',maxCount:1}
]),async(req,res)=>{
    try{
        const {firstname,lastname,email,password}=req.body;
        const profileImageFile = req.files['profileImage'] ? req.files['profileImage'][0] : null;
        const certificateFile = req.files['certificate'] ? req.files['certificate'][0] : null;
        //const imagePath=req.file?`/uploads/${req.file.filename}`:'/uploads/default-avatar.jpg';
        const userExists=await User.findOne({email});
        if(userExists)return res.status(400).json({error: 'User already exists'});

        const imagePath = profileImageFile ? `/uploads/${profileImageFile.filename}` : '/uploads/default-avatar.jpg';
        const hashedPassword = await bcrypt.hash(password,10);

        const role = 'user'; 

        const userCount= await User.countDocuments();
        const assignedRole=userCount===0?'admin' : role;

        const user=new User({
            firstname,
            lastname,
            email,
            password:hashedPassword,
            role : assignedRole,
            certificate: assignedRole === 'chef' && certificateFile ? certificateFile.filename : undefined,
            profileImage: imagePath
        })
        await user.save();
        res.status(201).json({message: 'User registered successfully'});
    }catch (err){
        console.error(err);
        res.status(500).json({error: 'Signup failed'});
    }


})

//login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login successful');

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
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});


module.exports = router;