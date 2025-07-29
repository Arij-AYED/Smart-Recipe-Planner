const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekStartDate: {
    type: Date,
    required: true,
  },
  meals: {
    type: Object,
    default: {
      Monday: { Breakfast: null, Lunch: null, Dinner: null },
      Tuesday: { Breakfast: null, Lunch: null, Dinner: null },
      Wednesday: { Breakfast: null, Lunch: null, Dinner: null },
      Thursday: { Breakfast: null, Lunch: null, Dinner: null },
      Friday: { Breakfast: null, Lunch: null, Dinner: null },
      Saturday: { Breakfast: null, Lunch: null, Dinner: null },
      Sunday: { Breakfast: null, Lunch: null, Dinner: null },
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);