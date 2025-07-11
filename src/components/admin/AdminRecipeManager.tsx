
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X, Clock, Users, ChefHat } from 'lucide-react';
import { RecipePreview } from './RecipePreview';

export const AdminRecipeManager = () => {
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      title: "Spaghetti Carbonara",
      chef: "Marco Rossi",
      description: "Classic Italian pasta dish with eggs, cheese, and pancetta",
      cookTime: "20 mins",
      servings: 4,
      difficulty: "Medium",
      status: "Pending",
      submittedAt: "2024-01-15",
      image: "/placeholder.svg",
      ingredients: "400g spaghetti\n200g pancetta\n4 large eggs\n100g Pecorino Romano cheese\nBlack pepper\nSalt",
      instructions: "Cook spaghetti in salted boiling water\nFry pancetta until crispy\nWhisk eggs with cheese and pepper\nCombine hot pasta with pancetta\nAdd egg mixture and toss quickly"
    },
    {
      id: 2,
      title: "Chicken Tikka Masala",
      chef: "Priya Sharma",
      description: "Creamy Indian curry with tender chicken pieces",
      cookTime: "45 mins",
      servings: 6,
      difficulty: "Hard",
      status: "Approved",
      submittedAt: "2024-01-14",
      image: "/placeholder.svg",
      ingredients: "1kg chicken breast\n400ml coconut milk\n400g canned tomatoes\n2 onions\nGinger-garlic paste\nGaram masala\nTurmeric\nCumin\nCoriander",
      instructions: "Marinate chicken in yogurt and spices\nGrill chicken until charred\nSauté onions until golden\nAdd spices and cook until fragrant\nAdd tomatoes and simmer\nAdd grilled chicken and coconut milk\nSimmer until thick and creamy"
    },
    {
      id: 3,
      title: "Chocolate Lava Cake",
      chef: "Sophie Martin",
      description: "Decadent chocolate dessert with molten center",
      cookTime: "25 mins",
      servings: 2,
      difficulty: "Medium",
      status: "Rejected",
      submittedAt: "2024-01-13",
      image: "/placeholder.svg",
      ingredients: "100g dark chocolate\n100g butter\n2 eggs\n50g sugar\n30g flour\nButter for ramekins",
      instructions: "Melt chocolate and butter\nWhisk eggs and sugar\nCombine chocolate mixture with eggs\nFold in flour\nPour into buttered ramekins\nBake at 200°C for 12 minutes"
    }
  ]);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = (recipe) => {
    setSelectedRecipe(recipe);
    setPreviewOpen(true);
  };

  const handleApprove = (id) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id ? { ...recipe, status: 'Approved' } : recipe
    ));
    setPreviewOpen(false);
  };

  const handleReject = (id) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id ? { ...recipe, status: 'Rejected' } : recipe
    ));
    setPreviewOpen(false);
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
              <div key={recipe.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{recipe.title}</h3>
                    <Badge className={getStatusColor(recipe.status)}>
                      {recipe.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">by {recipe.chef}</p>
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
                        onClick={() => handleApprove(recipe.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(recipe.id)}
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
