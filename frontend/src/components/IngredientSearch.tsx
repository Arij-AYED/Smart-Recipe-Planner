
import { useState } from 'react';
import { Plus, X, Search, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import RecipeCard from './RecipeCard';

const IngredientSearch = () => {
  const [ingredients, setIngredients] = useState<string[]>(['Chicken', 'Tomatoes', 'Garlic']);
  const [newIngredient, setNewIngredient] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const popularIngredients = [
    'Chicken Breast', 'Salmon', 'Ground Beef', 'Eggs', 'Rice', 'Pasta',
    'Tomatoes', 'Onions', 'Garlic', 'Bell Peppers', 'Spinach', 'Broccoli',
    'Cheese', 'Yogurt', 'Milk', 'Olive Oil', 'Salt', 'Black Pepper'
  ];

  const suggestedRecipes = [
    {
      id: 1,
      title: "Garlic Chicken with Tomatoes",
      image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop",
      cookTime: "30 min",
      servings: 4,
      difficulty: "Easy",
      tags: ["High Protein", "Mediterranean", "One Pan"],
      calories: 380,
      ingredients: ["Chicken", "Tomatoes", "Garlic", "Olive Oil"]
    },
    {
      id: 2,
      title: "Chicken Tomato Skillet",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop",
      cookTime: "25 min",
      servings: 3,
      difficulty: "Easy",
      tags: ["Quick", "One Pan", "Comfort Food"],
      calories: 350,
      ingredients: ["Chicken", "Tomatoes", "Garlic", "Herbs"]
    }
  ];

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
    const matches = recipe.ingredients.filter((ing: string) => 
      ingredients.some(userIng => 
        ing.toLowerCase().includes(userIng.toLowerCase()) ||
        userIng.toLowerCase().includes(ing.toLowerCase())
      )
    ).length;
    return Math.round((matches / recipe.ingredients.length) * 100);
  };

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

      {/* AI Recipe Suggestions */}
      {ingredients.length > 0 && (
        <div className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestedRecipes.map((recipe) => {
              const matchPercentage = getMatchPercentage(recipe);
              return (
                <div key={recipe.id} className="relative">
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
