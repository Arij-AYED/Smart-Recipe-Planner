import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat, ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:3000';

const RecipeDetails = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/recipes/${id}`);
        setRecipe(response.data);
      } catch (error) {
        console.error('Error fetching recipe:', error.response?.data || error.message);
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const truncateDescription = (description) => {
    if (!description) return '';
    const lines = description.split('\n');
    const truncated = lines.slice(0, 3).join('\n');
    return lines.length > 3 ? `${truncated}...` : truncated;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <p className="text-center text-gray-600">Loading recipe...</p>;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;
  if (!recipe) return <p className="text-center text-gray-600">Recipe not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
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
            <Link to="/">
              <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={`${API_URL}${recipe.image || '/placeholder.svg'}`}
                alt={recipe.title}
                className="w-full h-96 object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                onError={(e) => {
                  console.log('Image failed to load:', recipe.image);
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="md:w-1/2 p-6">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900">{recipe.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                  {recipe.status && (
                    <Badge className="bg-gray-100 text-gray-800">{recipe.status}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.cookTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings} servings
                  </div>
                  {recipe.calories > 0 && (
                    <div className="flex items-center gap-1 font-medium text-orange-600">
                      <span>{recipe.calories} cal</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags && recipe.tags.map((tag, index) => (
                    <Badge key={index} className="bg-slate-200 text-slate-800">{tag}</Badge>
                  ))}
                </div>
                
              </CardContent>
              
            </div>
            
          </div>
        </Card>
        <div className='mt-8 '>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">
            {showFullDescription ? recipe.description : truncateDescription(recipe.description)}
            </p>
            {recipe.description.split('\n').length > 3 && (
            <Button
                variant="link"
                className="text-orange-600 p-0 h-auto"
                onClick={() => setShowFullDescription(!showFullDescription)}
            >
            {showFullDescription ? 'Show Less' : 'Read More'}
            </Button>
            )}
        </div>
        <div className='mt-8'>
            <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients?.split('\n').map((ingredient: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
        </div>
        <div className='mt-8'>
            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions?.split('\n').map((instruction: string, index: number) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
        </div>
      </main>
    </div>
  );
};

export default RecipeDetails;