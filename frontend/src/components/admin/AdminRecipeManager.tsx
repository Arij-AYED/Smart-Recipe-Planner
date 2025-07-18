import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X, Clock, Users, ChefHat } from 'lucide-react';
import { RecipePreview } from './RecipePreview';

const API_URL = 'http://localhost:3000'; // Matches backend port

export const AdminRecipeManager = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch all recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${API_URL}/recipes/all`);
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };
    fetchRecipes();
  }, []);

  const handlePreview = (recipe) => {
    setSelectedRecipe(recipe);
    setPreviewOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}/recipes/${id}`, { status: 'Approved' });
      const response = await axios.get(`${API_URL}/recipes/all`);
      setRecipes(response.data);
      setPreviewOpen(false);
    } catch (error) {
      console.error('Error approving recipe:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API_URL}/recipes/${id}`, { status: 'Rejected' });
      const response = await axios.get(`${API_URL}/recipes/all`);
      setRecipes(response.data);
      setPreviewOpen(false);
    } catch (error) {
      console.error('Error rejecting recipe:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = recipes.filter(r => r.status === 'Pending').length;
  const approvedCount = recipes.filter(r => r.status === 'Approved').length;
  const rejectedCount = recipes.filter(r => r.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipe Management</CardTitle>
          <CardDescription>Review and manage submitted recipes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div key={recipe._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{recipe.title}</h3>
                    <Badge className={getStatusColor(recipe.status)}>
                      {recipe.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">by {recipe.chefId || 'Unknown Chef'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.cookTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings}
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="h-4 w-4" />
                      {recipe.difficulty}
                    </div>
                    {recipe.calories > 0 && (
                      <div className="flex items-center gap-1">
                        <span>Calories: {recipe.calories}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipe.tags && recipe.tags.map((tag) => (
                      <Badge key={tag} className="bg-blue-100 text-blue-800">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(recipe)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  {recipe.status === 'Pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(recipe._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(recipe._id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <RecipePreview
        recipe={selectedRecipe}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};