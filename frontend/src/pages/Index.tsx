import { useState, useEffect } from 'react';
import { Search, Calendar, ChefHat, Clock, Users, Heart, Plus, Filter, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RecipeCard from '@/components/RecipeCard';
import MealPlannerCalendar from '@/components/MealPlannerCalendar';
import IngredientSearch from '@/components/IngredientSearch';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('discover');
  const [recipes, setRecipes] = useState([]);

  // Fetch approved recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${API_URL}/recipes`);
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };
    fetchRecipes();
  }, []);

  const quickGoals = [
    { label: "High Protein", icon: "💪", color: "bg-orange-100 text-orange-800" },
    { label: "Low Carb", icon: "🥬", color: "bg-green-100 text-green-800" },
    { label: "Heart Healthy", icon: "❤️", color: "bg-red-100 text-red-800" },
    { label: "Quick Meals", icon: "⚡", color: "bg-yellow-100 text-yellow-800" },
    { label: "Vegan", icon: "🌱", color: "bg-emerald-100 text-emerald-800" },
    { label: "Comfort Food", icon: "🍲", color: "bg-amber-100 text-amber-800" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                Smart Recipe Planner
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'discover', label: 'Discover', icon: Search },
                  { id: 'planner', label: 'Meal Planner', icon: Calendar },
                  { id: 'ingredients', label: 'Ingredients', icon: Plus }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedTab(id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                      selectedTab === id
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
              
              <Link to="/login">
                <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'discover' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Discover Your Next
                <span className="block bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                  Favorite Recipe
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                AI-powered recipe suggestions based on your ingredients, dietary goals, and taste preferences
              </p>
              
              {/* Smart Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Try 'high protein breakfast' or 'quick dinner ideas'..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-6 text-lg border-2 border-orange-200 focus:border-orange-400 rounded-2xl"
                  />
                  <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Goals */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">Popular Goals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickGoals.map((goal, index) => (
                  <button
                    key={index}
                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all hover:scale-105 group"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{goal.icon}</div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${goal.color}`}>
                      {goal.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Recipes */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Featured Recipes</h3>
                <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                  View All Recipes
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'planner' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Weekly Meal Planner</h2>
              <p className="text-gray-600">Plan your meals for the week and generate shopping lists automatically</p>
            </div>
            <MealPlannerCalendar />
          </div>
        )}

        {selectedTab === 'ingredients' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">What's in Your Kitchen?</h2>
              <p className="text-gray-600">Tell us what ingredients you have and we'll suggest perfect recipes</p>
            </div>
            <IngredientSearch />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;