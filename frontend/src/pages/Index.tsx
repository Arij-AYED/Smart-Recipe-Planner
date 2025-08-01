import { useState, useEffect } from 'react';
import { Search, Calendar, ChefHat, Clock, Users, Heart, Plus, Filter, User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import RecipeCard from '@/components/RecipeCard';
import MealPlannerCalendar from '@/components/MealPlannerCalendar';
import IngredientSearch from '@/components/IngredientSearch';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_BASE_URL;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('discover');
  const [recipes, setRecipes] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch approved recipes from backend with submitted search and goal filters
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (submittedSearchQuery) params.q = submittedSearchQuery;
        if (selectedGoal) params.goal = selectedGoal;
        console.log('Fetching recipes with params:', params);
        const response = await axios.get(`${API_URL}/api/recipes`, { params });
        console.log('Recipes response:', response.data);
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching recipes:', error.response?.data || error.message);
        toast({
          title: 'Error',
          description: 'Failed to fetch recipes. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [submittedSearchQuery, selectedGoal]);

  const quickGoals = [
    { label: 'High Protein', icon: '💪', color: 'bg-orange-100 text-orange-800' },
    { label: 'Low Carb', icon: '🥬', color: 'bg-green-100 text-green-800' },
    { label: 'Heart Healthy', icon: '❤️', color: 'bg-red-100 text-red-800' },
    { label: 'Quick Meals', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Vegan', icon: '🌱', color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Comfort Food', icon: '🍲', color: 'bg-amber-100 text-amber-800' }
  ];

  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      user = JSON.parse(storedUser);
      console.log('Parsed user role:', user?.role);
    } else {
      console.warn('No user data found in localStorage');
    }
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value.trim();
    setSubmittedSearchQuery(query);
    setSearchQuery(query); // Keep input in sync
  };

  const handleGoalClick = (goal) => {
    console.log('Selected goal:', goal);
    setSelectedGoal(goal === selectedGoal ? null : goal);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSubmittedSearchQuery('');
    setSelectedGoal(null);
    (document.getElementById('search-input') as any).value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
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
              {localStorage.getItem('token') ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                      <img
                        src={user?.profileImage ? `${API_URL}${user.profileImage}` : '/default-avatar.jpg'}
                        className="w-8 h-8 object-cover rounded-full mr-2"
                        alt="Profile"
                      />
                      <User className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center w-full">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'chef' && (
                      <DropdownMenuItem asChild>
                        <Link to="/chef" className="flex items-center w-full">
                          <ChefHat className="w-4 h-4 mr-2" />
                          Chef Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
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
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="search-input"
                      name="search"
                      placeholder="Try 'high protein breakfast' or 'quick dinner ideas'..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-20 py-6 text-lg border-2 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 rounded-2xl"
                    />
                    <Button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 rounded-xl"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Quick Goals */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">Popular Goals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickGoals.map((goal, index) => (
                  <button
                    key={index}
                    onClick={() => handleGoalClick(goal.label)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 group ${
                      selectedGoal === goal.label
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
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
                <Button
                  variant="outline"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={clearFilters}
                >
                  View All Recipes
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading recipes...</p>
                  </div>
                ) : recipes.length > 0 ? (
                  recipes.map((recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} user={user} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No recipes found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                  </div>
                )}
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
      <Toaster />
    </div>
  );
};

export default Index;