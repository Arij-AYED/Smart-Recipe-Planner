require ('dotenv').config();
const express = require('express');
const mongoose = require ('mongoose');
const cors = require('cors'); // allows frontend to access backend
const adminRoutes=require('./routes/admin');
const authRoutes = require ('./routes/auth');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');
const mealPlanRoutes = require('./routes/mealPlans');
//const commentRoutes=require('./routes/comments');
const path = require('path');



const app = express();
const aiRecipesRoute= require('./routes/aiRecipes');
app.use(express.json());
app.use(cors());

app.use('/api/ai-recipes', aiRecipesRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads',express.static('public/uploads'));

app.use(express.static(path.join(__dirname, 'public', 'dest')));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dest', 'index.html'));
});


//Connect to mongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err)=>console.error('MongoDB error:',err));



//use auth routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);  
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
//app.use('/api/comments', commentRoutes);
app.use('/api', authRoutes);

app.use(express.json());

const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




