
import { useState, useEffect } from 'react';
import { Plus, X, Search, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import toast from 'react-hot-toast';
import RecipeCard from './RecipeCard';
import { set } from 'date-fns';

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:3000';

const IngredientSearch = () => {
  const [ingredients, setIngredients] = useState<string[]>(JSON.parse(localStorage.getItem('availableIngredients') || '[]'));
  const [newIngredient, setNewIngredient] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const popularIngredients = [
    'Chicken Breast', 'Salmon', 'Ground Beef', 'Eggs', 'Rice', 'Pasta',
    'Tomatoes', 'Onions', 'Garlic', 'Bell Peppers', 'Spinach', 'Broccoli',
    'Cheese', 'Yogurt', 'Milk', 'Olive Oil', 'Salt', 'Black Pepper'
  ];

  // Save ingredients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('availableIngredients', JSON.stringify(ingredients));
  }, [ingredients]);

  // Fetch recipes based on selected ingredients
  useEffect(() => {
    const fetchRecipes = async () => {
      if (ingredients.length === 0) {
        setRecipes([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/recipes/by-ingredients`, {
          params: { ingredients: ingredients.join(',') }
        });
        console.log('Fetched recipes:', response.data);
        setRecipes(response.data);
      } catch (err: any) {
        console.error('Error fetching recipes:', err.message);
        setError(err.response?.data?.message || 'Failed to fetch recipes');
        toast.error(err.response?.data?.message || 'Failed to fetch recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [ingredients]);


  const addIngredient = (ingredient: string) => {
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
      setNewIngredient('');
      setSuggestions([]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleInputChange = (value: string) => {
    setNewIngredient(value);
    if (value.length > 0) {
      const filtered = popularIngredients.filter(ingredient =>
        ingredient.toLowerCase().includes(value.toLowerCase()) &&
        !ingredients.includes(ingredient)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const getMatchPercentage = (recipe: any) => {
    if (!recipe.ingredients) return 0;
    // Split recipe ingredients string into an array
    const recipeIngredients = recipe.ingredients.split('\n').map((ing: string) => ing.trim().toLowerCase()).filter((ing: string) => ing);
    const matches = recipeIngredients.filter((ing: string) => 
      ingredients.some(userIng => 
        ing.toLowerCase().includes(userIng.toLowerCase()) ||
        userIng.toLowerCase().includes(ing.toLowerCase())
      )
    ).length;
    return Math.round((matches / recipeIngredients.length) * 100);
  };
  const handleAISuggestions= async () => {
    
    try {
      const response = await axios.post('http://localhost:3000/api/ai-recipes', {
        ingredients,
      });
      setSuggestedRecipes(response.data.recipe || []);
  }catch ( error) {
    console.error('Error fetching Ai suggestions:',error);
    toast.error('Failed to fetch AI suggestions');
  }
}

  return (
    <div className="space-y-8">
      {/* Ingredient Input Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-orange-500" />
            <span>Your Available Ingredients</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Ingredients */}
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-orange-100 text-orange-800 border-orange-200 pr-1"
              >
                {ingredient}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-4 h-4 p-0 ml-2 hover:bg-orange-200"
                  onClick={() => removeIngredient(ingredient)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>

          {/* Add New Ingredient */}
          <div className="relative">
            <div className="flex space-x-2">
              <Input
                placeholder="Add an ingredient (e.g., chicken breast, tomatoes...)"
                value={newIngredient}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient(newIngredient)}
                className="flex-1"
              />
              <Button 
                onClick={() => addIngredient(newIngredient)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => addIngredient(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Popular Ingredients */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Popular ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {popularIngredients.slice(0, 8).map((ingredient, index) => (
                <button
                  key={index}
                  onClick={() => addIngredient(ingredient)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    ingredients.includes(ingredient)
                      ? 'bg-green-100 text-green-800 border-green-300 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-orange-100 hover:border-orange-300'
                  }`}
                  disabled={ingredients.includes(ingredient)}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {loading && (
        <p className="text-center text-gray-500 text-sm"> Generating recipes with AI...</p>
      )}

      {/* AI Recipe Suggestions */}
      {ingredients.length > 0 && (
        <div className="space-y-6">
          <button
          onClick={handleAISuggestions}
          className="w-full text-left">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6" />
                <div>
                  <h3 className="text-xl font-bold">AI Recipe Suggestions</h3>
                  <p className="opacity-90">
                    Based on your {ingredients.length} ingredients, here are perfect matches
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </button>

          {loading && (
            <Card className="bg-gray-50">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Loading recipes...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && recipes.length === 0 && (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Recipes Found
                </h3>
                <p className="text-gray-600">
                  Try adding more ingredients or different combinations to find matching recipes.
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && recipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((recipe) => {
                const matchPercentage = getMatchPercentage(recipe);
                return (
                  <div key={recipe._id} className="relative">
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-green-500 text-white">
                        {matchPercentage}% match
                      </Badge>
                    </div>
                    <RecipeCard recipe={recipe} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Missing Ingredients Alert */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Get even better suggestions!
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                Add common pantry staples like olive oil, salt, and herbs to unlock hundreds more recipes.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Olive Oil', 'Salt', 'Black Pepper', 'Herbs'].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => addIngredient(item)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {ingredients.length === 0 && (
        <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start Adding Your Ingredients
            </h3>
            <p className="text-gray-600 mb-4">
              Tell us what you have in your kitchen and we'll suggest amazing recipes you can make right now!
            </p>
            <Button 
              onClick={() => addIngredient('Chicken Breast')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Add Your First Ingredient
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IngredientSearch;