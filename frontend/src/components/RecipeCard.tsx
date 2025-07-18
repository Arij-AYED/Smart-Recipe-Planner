import { Clock, Users, Heart, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const API_URL = 'http://localhost:5000';

interface Recipe {
  _id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  tags: string[];
  calories: number;
  ingredients: string;
}

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
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

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="relative">
        <img
          src={`${API_URL}${recipe.image || '/placeholder.svg'}`}
          alt={recipe.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            className={`w-8 h-8 rounded-full p-0 ${isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-white/80 hover:bg-white'}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'text-white fill-current' : 'text-gray-600'}`} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={`w-8 h-8 rounded-full p-0 ${isBookmarked ? 'bg-orange-500 hover:bg-orange-600' : 'bg-white/80 hover:bg-white'}`}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-white fill-current' : 'text-gray-600'}`} />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
          {recipe.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{recipe.cookTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{recipe.servings}</span>
            </div>
          </div>
          <div className="font-medium text-orange-600">
            {recipe.calories} cal
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{recipe.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="pt-2">
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white"
            onClick={() => console.log('View recipe:', recipe._id)}
          >
            View Recipe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;