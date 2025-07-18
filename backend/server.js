// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/recipeDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log(err));

// // Define Recipe Schema
// const recipeSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   cookTime: String,
//   servings: Number,
//   difficulty: String,
//   ingredients: String, // Store as a string for simplicity
//   instructions: String,
//   status: { type: String, default: 'Pending' },
//   image: String,
//   chefId: { type: String, default: '1' }, // Optional: for associating with a chef
// });

// const Recipe = mongoose.model('Recipe', recipeSchema);

// // API Endpoints
// // Get all recipes
// app.get('/recipes', async (req, res) => {
//   try {
//     const recipes = await Recipe.find();
//     res.json(recipes);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Create a new recipe
// app.post('/recipes', async (req, res) => {
//   const recipe = new Recipe(req.body);
//   try {
//     const newRecipe = await recipe.save();
//     res.status(201).json(newRecipe);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Delete a recipe
// app.delete('/recipes/:id', async (req, res) => {
//   try {
//     const recipe = await Recipe.findById(req.params.id);
//     if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
//     await recipe.remove();
//     res.json({ message: 'Recipe deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });