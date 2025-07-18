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
  chefId: { type: String, default: '1' }, // Optional field for chef association
  tags: [{ type: String, default: [] }],    // Array of tags
  calories: { type: Number, default: 0 },   // Number of calories
});

module.exports = mongoose.model('Recipe', recipeSchema);