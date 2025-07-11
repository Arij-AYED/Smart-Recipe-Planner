
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Eye, Clock, ChefHat } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  cookTime: string;
  difficulty: string;
  tags: string[];
}

export const AdminRecipeManager = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: '1',
      title: 'Spicy Thai Basil Chicken',
      author: 'John Doe',
      status: 'pending',
      submittedAt: '2024-01-15',
      cookTime: '25 min',
      difficulty: 'Medium',
      tags: ['Thai', 'Spicy', 'Chicken']
    },
    {
      id: '2',
      title: 'Vegan Buddha Bowl',
      author: 'Jane Smith',
      status: 'pending',
      submittedAt: '2024-01-14',
      cookTime: '20 min',
      difficulty: 'Easy',
      tags: ['Vegan', 'Healthy', 'Bowl']
    },
    {
      id: '3',
      title: 'Classic Beef Bourguignon',
      author: 'Mike Johnson',
      status: 'approved',
      submittedAt: '2024-01-13',
      cookTime: '3 hours',
      difficulty: 'Hard',
      tags: ['French', 'Beef', 'Stew']
    },
    {
      id: '4',
      title: 'Quick Pasta Carbonara',
      author: 'Sarah Wilson',
      status: 'rejected',
      submittedAt: '2024-01-12',
      cookTime: '15 min',
      difficulty: 'Easy',
      tags: ['Italian', 'Pasta', 'Quick']
    }
  ]);

  const handleRecipeAction = (recipeId: string, action: 'approve' | 'reject') => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, status: action === 'approve' ? 'approved' : 'rejected' }
        : recipe
    ));
  };

  const getStatusBadge = (status: Recipe['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
    }
  };

  const pendingCount = recipes.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((recipes.filter(r => r.status === 'approved').length / recipes.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipe Management</CardTitle>
          <CardDescription>Review and manage submitted recipes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Cook Time</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{recipe.title}</div>
                      <div className="flex gap-1 mt-1">
                        {recipe.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{recipe.author}</TableCell>
                  <TableCell>{getStatusBadge(recipe.status)}</TableCell>
                  <TableCell>{recipe.submittedAt}</TableCell>
                  <TableCell>{recipe.cookTime}</TableCell>
                  <TableCell>{recipe.difficulty}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {recipe.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleRecipeAction(recipe.id, 'approve')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleRecipeAction(recipe.id, 'reject')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
