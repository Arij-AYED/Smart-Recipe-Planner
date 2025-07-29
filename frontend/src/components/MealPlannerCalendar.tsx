import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, PenLine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Fetch available recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${API_URL}/recipes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableRecipes(response.data.map((recipe: any) => ({
          _id: recipe._id,
          title: recipe.title,
        })));
      } catch (error) {
        console.error('Error fetching recipes:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch recipes.',
          variant: 'destructive',
        });
      }
    };
    fetchRecipes();
  }, [token]);

  // Fetch meal plan for the current week
  useEffect(() => {
    const fetchMealPlan = async () => {
      setIsLoading(true);
      try {
        const startOfWeek = getWeekDates()[0];
        const response = await axios.get(`${API_URL}/meal-plans`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { weekStartDate: startOfWeek.toISOString() },
        });
        const fetchedMealPlan = response.data;
        setMealPlanId(fetchedMealPlan._id);
        setMealPlan(fetchedMealPlan.meals);
      } catch (error) {
        console.error('Error fetching meal plan:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch meal plan.',
          variant: 'destructive',
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
    return days.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
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

  const handleAddMeal = async () => {
    if (!editingMeal || !selectedMeal.trim()) return;

    const updatedMealPlan = {
      ...mealPlan,
      [editingMeal.day]: {
        ...mealPlan[editingMeal.day],
        [editingMeal.mealType]: selectedMeal,
      },
    };

    setMealPlan(updatedMealPlan);

    try {
      await axios.put(
        `${API_URL}/meal-plans/${mealPlanId}`,
        { meals: updatedMealPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: 'Success',
        description: 'Meal plan updated.',
      });
    } catch (error) {
      console.error('Error updating meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update meal plan.',
        variant: 'destructive',
      });
    }

    setEditingMeal(null);
    setSelectedMeal('');
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
      toast({
        title: 'Success',
        description: 'Meal removed.',
      });
    } catch (error) {
      console.error('Error updating meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove meal.',
        variant: 'destructive',
      });
    }

    if (editingMeal?.day === day && editingMeal?.mealType === mealType) {
      setEditingMeal(null);
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {days.map((day, dayIndex) => (
          <Card key={day} className="bg-white/80 backdrop-blur-sm border-orange-100">
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
                          onClick={handleAddMeal}
                          className="bg-green-500 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingMeal(null)}
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
                            onClick={() => {
                              setEditingMeal({ day, mealType });
                              setSelectedMeal(mealPlan[day][mealType] || '');
                            }}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
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