const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const authenticate = require('../middleware/auth');

// Get meal plan for a specific week
router.get('/', authenticate, async (req, res) => {
  try {
    const { weekStartDate } = req.query;
    if (!weekStartDate) {
      return res.status(400).json({ message: 'weekStartDate is required' });
    }
    const startDate = new Date(weekStartDate);
    const mealPlan = await MealPlan.findOne({
      userId: req.user._id,
      weekStartDate: startDate,
    }).populate({
      path: 'meals',
      populate: {
        path: 'Monday.Breakfast Monday.Lunch Monday.Dinner ' +
              'Tuesday.Breakfast Tuesday.Lunch Tuesday.Dinner ' +
              'Wednesday.Breakfast Wednesday.Lunch Wednesday.Dinner ' +
              'Thursday.Breakfast Thursday.Lunch Thursday.Dinner ' +
              'Friday.Breakfast Friday.Lunch Friday.Dinner ' +
              'Saturday.Breakfast Saturday.Lunch Saturday.Dinner ' +
              'Sunday.Breakfast Sunday.Lunch Sunday.Dinner',
        model: 'Recipe',
      },
    });
    if (!mealPlan) {
      // Create a new meal plan if none exists
      const newMealPlan = new MealPlan({
        userId: req.user._id,
        weekStartDate: startDate,
      });
      await newMealPlan.save();
      return res.json(newMealPlan);
    }
    console.log('Fetched meal plan:', mealPlan);
    res.json(mealPlan);
  } catch (err) {
    console.error('Error fetching meal plan:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Update meal plan
router.put('/:id', authenticate, async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    if (mealPlan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    mealPlan.meals = req.body.meals || mealPlan.meals;
    const updatedMealPlan = await mealPlan.save();
    console.log('Updated meal plan:', updatedMealPlan);
    res.json(updatedMealPlan);
  } catch (err) {
    console.error('Error updating meal plan:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;