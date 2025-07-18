const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: String,
  description: String,
  cookTime: String,
  servings: Number,
  difficulty: String,
  ingredients: String,
  instructions: String,
  status: { type: String, default: 'Pending' },
  image: String,
  chefId: String,
});

module.exports = mongoose.model('Recipe', recipeSchema);