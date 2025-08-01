import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, Check, X } from 'lucide-react';

interface RecipePreviewProps {
  recipe: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const API_URL = 'http://localhost:3000';

export const RecipePreview: React.FC<RecipePreviewProps> = ({
  recipe,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  if (!recipe) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{recipe.title || 'Untitled Recipe'}</DialogTitle>
            <Badge className={getStatusColor(recipe.status)}>
              {recipe.status || 'Unknown'}
            </Badge>
          </div>
          <DialogDescription>

            Recipe by {recipe.chefId?.firstname ? `${recipe.chefId.firstname} ${recipe.chefId.lastname || ''}` : 'Unknown Chef'} • Submitted on {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}

          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={`${API_URL}${recipe.image || '/placeholder.svg'}`}
              alt={recipe.title || 'Recipe'}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
          </div>

          {/* Recipe Info */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Cook Time</p>
                <p className="font-semibold">{recipe.cookTime || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Servings</p>
                <p className="font-semibold">{recipe.servings || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="font-semibold">{recipe.difficulty || 'N/A'}</p>
              </div>
            </div>
            {recipe.calories > 0 && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Calories</p>
                <p className="font-semibold">{recipe.calories} cal</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} className="bg-blue-100 text-blue-800">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{recipe.description || 'No description available'}</p>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients?.split('\n').filter(line => line.trim()).map((ingredient: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{ingredient}</span>
                </li>
              )) || <li className="text-gray-600">No ingredients listed</li>}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions?.split('\n').filter(line => line.trim()).map((instruction: string, index: number) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              )) || <li className="text-gray-600">No instructions provided</li>}
            </ol>
          </div>

          {/* Action Buttons */}
          {recipe.status === 'Pending' && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => onApprove(recipe._id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve Recipe
              </Button>
              <Button
                onClick={() => onReject(recipe._id)}
                variant="outline"
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Reject Recipe
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};