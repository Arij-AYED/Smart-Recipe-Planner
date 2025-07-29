require ('dotenv').config();
const express = require('express');
const mongoose = require ('mongoose');
const cors = require('cors'); // allows frontend to access backend
const adminRoutes=require('./routes/admin');
const authRoutes = require ('./routes/auth');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());
//Connect to mongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err)=>console.error('MongoDB error:',err));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads',express.static('public/uploads'));
//use auth routes
app.use('/api',authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/users', userRoutes); 
app.use('/api/users', userRoutes); 
app.use('/recipes', recipeRoutes);
app.use('/auth', authRoutes);

app.use('/auth',require('./routes/auth'));
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




