import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, PenLine, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = 'http://localhost:3000';

const MealPlannerCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editingMeal, setEditingMeal] = useState<{ day: string; mealType: string } | null>(null);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, string | null>>>({
    Monday: { Breakfast: null, Lunch: null, Dinner: null },
    Tuesday: { Breakfast: null, Lunch: null, Dinner: null },
    Wednesday: { Breakfast: null, Lunch: null, Dinner: null },
    Thursday: { Breakfast: null, Lunch: null, Dinner: null },
    Friday: { Breakfast: null, Lunch: null, Dinner: null },
    Saturday: { Breakfast: null, Lunch: null, Dinner: null },
    Sunday: { Breakfast: null, Lunch: null, Dinner: null },
  });
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [availableRecipes, setAvailableRecipes] = useState<{ _id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shoppingList, setShoppingList] = useState<{ name: string; quantity: number; unit: string }[]>([]);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Fetch available recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/recipes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableRecipes(response.data.map((recipe: any) => ({
          _id: recipe._id,
          title: recipe.title,
        })));
      } catch (error) {
        console.error('Error fetching recipes:', error);
        toast.error('Failed to fetch recipes.');
      }
    };
    if (token) {
      fetchRecipes();
    }
  }, [token]);

  // Fetch meal plan for the current week
  useEffect(() => {
    const fetchMealPlan = async () => {
      setIsLoading(true);
      try {
        const startOfWeek = getNormalizedWeekStart();
        console.log('🔍 Fetching meal plan for week starting:', startOfWeek.toISOString());
        console.log('🔍 Current week state:', currentWeek);
        console.log('🔍 Token exists:', !!token);
        
        const response = await axios.get(`${API_URL}/meal-plans`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { weekStartDate: startOfWeek.toISOString() },
        });
        
        const fetchedMealPlan = response.data;
        console.log('📦 Raw response from server:', fetchedMealPlan);
        console.log('📦 Meals object:', fetchedMealPlan.meals);
        console.log('📦 Meals object type:', typeof fetchedMealPlan.meals);
        console.log('📦 Meals object keys:', Object.keys(fetchedMealPlan.meals || {}));
        
        setMealPlanId(fetchedMealPlan._id);
        
        if (fetchedMealPlan.meals && typeof fetchedMealPlan.meals === 'object' && !Array.isArray(fetchedMealPlan.meals)) {
          console.log('✅ Setting meal plan with fetched data:', fetchedMealPlan.meals);
          setMealPlan(fetchedMealPlan.meals);
        } else {
          console.log('⚠️ No valid meals data, using default structure');
          setMealPlan({
            Monday: { Breakfast: null, Lunch: null, Dinner: null },
            Tuesday: { Breakfast: null, Lunch: null, Dinner: null },
            Wednesday: { Breakfast: null, Lunch: null, Dinner: null },
            Thursday: { Breakfast: null, Lunch: null, Dinner: null },
            Friday: { Breakfast: null, Lunch: null, Dinner: null },
            Saturday: { Breakfast: null, Lunch: null, Dinner: null },
            Sunday: { Breakfast: null, Lunch: null, Dinner: null },
          });
        }
      } catch (error) {
        console.error('❌ Error fetching meal plan:', error);
        console.error('❌ Error response:', error.response?.data);
        toast.error('Failed to fetch meal plan.');
        setMealPlan({
          Monday: { Breakfast: null, Lunch: null, Dinner: null },
          Tuesday: { Breakfast: null, Lunch: null, Dinner: null },
          Wednesday: { Breakfast: null, Lunch: null, Dinner: null },
          Thursday: { Breakfast: null, Lunch: null, Dinner: null },
          Friday: { Breakfast: null, Lunch: null, Dinner: null },
          Saturday: { Breakfast: null, Lunch: null, Dinner: null },
          Sunday: { Breakfast: null, Lunch: null, Dinner: null },
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      fetchMealPlan();
    }
  }, [currentWeek, token]);

  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return days.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  };

  const getNormalizedWeekStart = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const weekDates = getWeekDates();

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case 'Breakfast':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'Lunch':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'Dinner':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const handleSaveMeal = async () => {
    console.log('💾 Starting save meal process');
    console.log('💾 Editing meal:', editingMeal);
    console.log('💾 Selected meal:', selectedMeal);
    console.log('💾 Meal plan ID:', mealPlanId);
    console.log('💾 Current meal plan state:', mealPlan);
    
    if (!editingMeal || !selectedMeal.trim()) {
      toast.error('Please select a day, meal type, and recipe.');
      return;
    }

    if (!mealPlanId) {
      toast.error('No meal plan ID found. Please try refreshing the page.');
      return;
    }

    if (!token) {
      toast.error('You are not logged in. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    const updatedMealPlan = {
      ...mealPlan,
      [editingMeal.day]: {
        ...mealPlan[editingMeal.day],
        [editingMeal.mealType]: selectedMeal,
      },
    };

    console.log('💾 Updated meal plan to send:', updatedMealPlan);

    try {
      setIsLoading(true);
      const response = await axios.put(
        `${API_URL}/meal-plans/${mealPlanId}`,
        { meals: updatedMealPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('💾 Server response after save:', response.data);
      
      setMealPlan(updatedMealPlan);
      setEditingMeal(null);
      setSelectedMeal('');
      
      toast.success('Meal plan updated successfully!');
    } catch (error: any) {
      console.error('❌ Error updating meal plan:', error);
      console.error('❌ Error response:', error.response?.data);
      let errorMessage = 'Failed to update meal plan.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Meal plan not found. Please try refreshing.';
        } else if (error.response.status === 403) {
          errorMessage = 'Unauthorized. Please log in again.';
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 2000);
        } else if (error.response.status === 401) {
          errorMessage = 'Session expired. Redirecting to login...';
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 2000);
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeal = async (day: string, mealType: string) => {
    const updatedMealPlan = {
      ...mealPlan,
      [day]: {
        ...mealPlan[day],
        [mealType]: null,
      },
    };

    setMealPlan(updatedMealPlan);

    try {
      await axios.put(
        `${API_URL}/meal-plans/${mealPlanId}`,
        { meals: updatedMealPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Meal removed successfully!');
    } catch (error) {
      console.error('Error updating meal plan:', error);
      toast.error('Failed to remove meal.');
    }

    if (editingMeal?.day === day && editingMeal?.mealType === mealType) {
      setEditingMeal(null);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!token) {
      toast.error('You are not logged in. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    // Collect all recipe IDs from the meal plan with their frequencies
    const recipeFrequencies = Object.values(mealPlan)
      .flatMap(day => Object.values(day))
      .filter(id => id !== null) as string[];
    const frequencyMap = recipeFrequencies.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(frequencyMap).length === 0) {
      toast.error('No meals planned for this week.');
      setShoppingList([]);
      setIsShoppingListOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      // Fetch recipes for the meal plan
      const response = await axios.post(`${API_URL}/recipes/bulk`, { recipeIds: Object.keys(frequencyMap) }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Parse and aggregate ingredients with frequency adjustment
      const allIngredients = response.data.flatMap((recipe: any) =>
        recipe.ingredients
          ? recipe.ingredients.split('\n').map((ing: string) => {
              const parts = ing.trim().split(/\s+/);
              let quantity = parseInt(parts[0], 10) || 1;
              let unit = parts[1] || '';
              let name = parts.slice(2).join(' ');
              return { name, quantity: quantity * (frequencyMap[recipe._id] || 1), unit };
            })
          : []
      );

      // Aggregate ingredients by name
      const ingredientTotals = allIngredients.reduce((acc, ing) => {
        const existing = acc.find(item => item.name.toLowerCase() === ing.name.toLowerCase());
        if (existing) {
          existing.quantity += ing.quantity;
        } else {
          acc.push({ ...ing });
        }
        return acc;
      }, [] as { name: string; quantity: number; unit: string }[]);

      // Get available ingredients from localStorage
      const availableIngredients = JSON.parse(localStorage.getItem('availableIngredients') || '[]')
        .map((ing: string) => ing.toLowerCase());

      // Filter out available ingredients to get the shopping list
      const missingIngredients = ingredientTotals.filter(ing =>
        !availableIngredients.some(avail =>
          ing.name.toLowerCase().includes(avail) || avail.includes(ing.name.toLowerCase())
        )
      );

      console.log('Shopping list:', missingIngredients);
      setShoppingList(missingIngredients);
      setIsShoppingListOpen(true);
    } catch (error: any) {
      console.error('Error generating shopping list:', error);
      toast.error(error.response?.data?.message || 'Failed to generate shopping list.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPlannedMeals = Object.values(mealPlan).reduce((total, day) => {
    return total + Object.values(day).filter(meal => meal !== null).length;
  }, 0);

  if (!token) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please <Link to="/login" className="text-orange-600 underline">log in</Link> to access your meal planner.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />
      {/* Calendar Header */}
      <Card className="bg-gradient-to-r from-blue-400 to-green-400 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                Week of {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h3>
              <p className="opacity-90">
                {totalPlannedMeals} meals planned • {21 - totalPlannedMeals} meals to plan
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => navigateWeek('prev')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => navigateWeek('next')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                className="bg-white text-orange-600 hover:bg-gray-50"
                onClick={handleGenerateShoppingList}
                disabled={isLoading}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isLoading ? 'Generating...' : 'Generate Shopping List'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {days.map((day, dayIndex) => (
          <Card key={day} className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="pb-3">
              <div className="text-center">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {day}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {weekDates[dayIndex].toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mealTypes.map((mealType) => (
                <div key={mealType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {mealType}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-6 h-6 p-0 hover:bg-orange-100"
                      onClick={() => {
                        setEditingMeal({ day, mealType });
                        setSelectedMeal(mealPlan[day][mealType] || '');
                      }}
                    >
                      <Plus className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>

                  {editingMeal?.day === day && editingMeal?.mealType === mealType ? (
                    <div className="space-y-2">
                      <select
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        value={selectedMeal}
                        onChange={(e) => setSelectedMeal(e.target.value)}
                      >
                        <option value="">Select a recipe</option>
                        {availableRecipes.map((recipe) => (
                          <option key={recipe._id} value={recipe._id}>
                            {recipe.title}
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-500 text-white hover:bg-green-600"
                          onClick={handleSaveMeal}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingMeal(null);
                            setSelectedMeal('');
                          }}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : mealPlan[day][mealType] ? (
                    <div
                      className={`p-3 rounded-lg border-2 ${getMealColor(
                        mealType
                      )} cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => {
                        setEditingMeal({ day, mealType });
                        setSelectedMeal(mealPlan[day][mealType] || '');
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium">
                          {availableRecipes.find(r => r._id === mealPlan[day][mealType])?.title || 'Unknown Recipe'}
                        </p>
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMeal(day, mealType);
                            }}
                            title="Delete Meal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="ml-2 text-green-500 hover:text-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMeal({ day, mealType });
                              setSelectedMeal(mealPlan[day][mealType] || '');
                            }}
                            title="Edit Meal"
                          >
                            <PenLine className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-3 rounded-lg border-2 border-dashed border-gray-300 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors"
                      onClick={() => {
                        setEditingMeal({ day, mealType });
                        setSelectedMeal('');
                      }}
                    >
                      <p className="text-xs text-gray-400">Add Recipe</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shopping List Dialog */}
      <Dialog open={isShoppingListOpen} onOpenChange={setIsShoppingListOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Shopping List</DialogTitle>
            <DialogDescription>
              Ingredients needed for your meal plan this week
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {shoppingList.length === 0 ? (
              <p className="text-gray-600 text-center">No ingredients needed. Either no meals are planned or you have all required ingredients.</p>
            ) : (
              <ul className="space-y-2">
                {shoppingList.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span>{ingredient.quantity} {ingredient.unit} {ingredient.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsShoppingListOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalPlannedMeals}
            </div>
            <div className="text-sm text-gray-600">Meals Planned</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-green-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(Object.values(mealPlan).flatMap(day => Object.values(day).filter(m => m))).size}
            </div>
            <div className="text-sm text-gray-600">Unique Recipes</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">~{Math.round(totalPlannedMeals * 600)}</div>
            <div className="text-sm text-gray-600">Avg Daily Calories</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MealPlannerCalendar;