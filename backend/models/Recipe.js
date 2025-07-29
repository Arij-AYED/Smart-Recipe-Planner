const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  cookTime: { type: String, required: true },
  servings: { type: Number, required: true },
  difficulty: { type: String, required: true },
  ingredients: { type: String, required: true },
  instructions: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] },
  image: { type: String, default: '/placeholder.svg' },
  tags: [{ type: String }],
  calories: { type: Number, default: 0 },
  chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Recipe', recipeSchema);