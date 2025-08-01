import { Clock, Users, Heart, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_BASE_URL;
import axios from 'axios';
import aiPic from '@/assets/aiPic.png'; // adjust path accordingly



interface Recipe {
  _id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  tags: string[];
  calories: number;
  ingredients: string [];
}

interface RecipeCardProps {
  recipe: Recipe;
  user?:any;
}

const RecipeCard = ({ recipe,user }: RecipeCardProps) => {
  const [isLiked, setIsLiked] = useState<boolean>(
    user?.favorites?.includes(recipe._id) || false
  );
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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
  const toggleFavorite=async()=>{
    const token = localStorage.getItem('token');
    if(!token){
      toast.error('You must be logged in to favorite recipes');
      return;
    }
    try{
      if(isLiked){
        await axios.delete(`${API_URL}/api/users/favorites/${recipe._id}`, {
          headers :{ Authorization: `Bearer ${token}` }
      });
      setIsLiked(false);
      toast.success('Recipe removed from favorites');
      }else{
        await axios.post(`${API_URL}/api/users/favorites/${recipe._id}`, {}, {
          headers :{ Authorization: `Bearer ${token}` },
      });
        setIsLiked(true);
        toast.success('Recipe added to favorites');
      }
    }catch(error){
      console.error('Favorite toggle error:', error);
      toast.error('Failed to update favorites');
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="relative">
        <img
  src={recipe.isAI ? aiPic : `${API_URL}${recipe.image || '/placeholder.svg'}`}
  alt={recipe.title}
  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
/>

        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            className={`w-8 h-8 rounded-full p-0 ${isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-white/80 hover:bg-white'}`}
            onClick={toggleFavorite}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'text-white fill-current' : 'text-gray-600'}`} />
          </Button>
          
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
          {recipe.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{recipe.cookTime} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{recipe.servings}</span>
            </div>
          </div>
          <div className="font-medium text-blue-600">
            {recipe.calories} cal
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{recipe.tags.length - 3}
            </Badge>
          )}
        </div>

       <div className="pt-2">
  {recipe._id ? (
    <Link to={`/recipe/${recipe._id}`}>
      <Button 
        className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
      >
        View Recipe
      </Button>
    </Link>
  ) : (
    <Button 
      disabled
      className="w-full bg-gray-300 text-gray-600 cursor-not-allowed"
      title="AI preview only – recipe details unavailable"
    >
      Preview Only
    </Button>
  )}
</div>

      </CardContent>
    </Card>
  );
};

export default RecipeCard;