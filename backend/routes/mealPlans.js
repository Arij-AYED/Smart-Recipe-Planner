const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const authenticate = require('../middleware/auth');
const mongoose = require('mongoose');

// Get meal plan for a specific week
router.get('/', authenticate, async (req, res) => {
  try {
    const { weekStartDate } = req.query;
    if (!weekStartDate) {
      return res.status(400).json({ message: 'weekStartDate is required' });
    }
    
    // Normaliser la date reçue pour éviter les problèmes de fuseaux horaires
    const inputDate = new Date(weekStartDate);
    const normalizedDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
    
    console.log('Looking for meal plan for user:', req.user._id);
    console.log('Input date:', weekStartDate);
    console.log('Normalized date:', normalizedDate.toISOString());
    
    // Chercher avec une plage de dates pour être sûr de trouver le bon meal plan
    const startOfDay = new Date(normalizedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(normalizedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    let mealPlan = await MealPlan.findOne({
      userId: req.user._id,
      weekStartDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!mealPlan) {
      // Create a new meal plan if none exists
      console.log('No meal plan found, creating new one for date:', normalizedDate);
      const newMealPlan = new MealPlan({
        userId: req.user._id,
        weekStartDate: normalizedDate,
        meals: {
          Monday: { Breakfast: null, Lunch: null, Dinner: null },
          Tuesday: { Breakfast: null, Lunch: null, Dinner: null },
          Wednesday: { Breakfast: null, Lunch: null, Dinner: null },
          Thursday: { Breakfast: null, Lunch: null, Dinner: null },
          Friday: { Breakfast: null, Lunch: null, Dinner: null },
          Saturday: { Breakfast: null, Lunch: null, Dinner: null },
          Sunday: { Breakfast: null, Lunch: null, Dinner: null },
        }
      });
      mealPlan = await newMealPlan.save();
    }
    
    console.log('Returning meal plan:', {
      id: mealPlan._id,
      weekStartDate: mealPlan.weekStartDate,
      mealsCount: Object.values(mealPlan.meals).reduce((count, day) => 
        count + Object.values(day).filter(meal => meal !== null).length, 0
      )
    });
    
    res.json(mealPlan);
  } catch (err) {
    console.error('Error fetching meal plan:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Update meal plan
router.put('/:id', authenticate, async (req, res) => {
  try {
    console.log('Updating meal plan:', req.params.id);
    console.log('New meals data:', req.body.meals);
    
    const mealPlan = await MealPlan.findById(req.params.id);
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    if (mealPlan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Mise à jour des meals
    if (req.body.meals) {
      mealPlan.meals = req.body.meals;
    }
    
    const updatedMealPlan = await mealPlan.save();
    console.log('Updated meal plan successfully:', updatedMealPlan);
    
    res.json(updatedMealPlan);
  } catch (err) {
    console.error('Error updating meal plan:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;