import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, Users, ChefHat } from 'lucide-react';

const API_URL = 'http://localhost:5000'; // Matches backend port

export const ChefRecipeManager = () => {
  const [recipes, setRecipes] = useState([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cookTime: '',
    servings: '',
    difficulty: '',
    ingredients: '',
    instructions: '',
    image: null as File | null,
    tags: [] as string[],
    calories: '',
    newTag: '', // New state for typing a new tag
  });

  // Fetch all recipes and available tags from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesResponse, tagsResponse] = await Promise.all([
          axios.get(`${API_URL}/recipes/all`), // Changed to /all to fetch all recipes
          axios.get(`${API_URL}/recipes/tags`),
        ]);
        console.log('Recipes fetched:', recipesResponse.data); // Debug log
        console.log('Tags fetched:', tagsResponse.data); // Debug log
        setRecipes(recipesResponse.data);
        setAvailableTags(tagsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  // Handle creating or updating a recipe
  const handleSaveRecipe = async () => {
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    dataToSend.append('cookTime', formData.cookTime);
    dataToSend.append('servings', formData.servings);
    dataToSend.append('difficulty', formData.difficulty);
    dataToSend.append('ingredients', formData.ingredients);
    dataToSend.append('instructions', formData.instructions);
    if (formData.image) {
      dataToSend.append('image', formData.image);
    }
    if (formData.tags.length > 0) {
      dataToSend.append('tags', formData.tags.join(','));
    }
    if (formData.calories) {
      dataToSend.append('calories', formData.calories);
    }
    // Add chefId (hardcoded for now, adjust based on auth system)
    dataToSend.append('chefId', '1'); // Matches default in Recipe.js

    try {
      console.log('Sending data:', Object.fromEntries(dataToSend)); // Debug log
      if (editingRecipe) {
        await axios.put(`${API_URL}/recipes/${editingRecipe._id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API_URL}/recipes`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      const response = await axios.get(`${API_URL}/recipes/all`); // Fetch all recipes
      setRecipes(response.data);
      setFormData({
        title: '',
        description: '',
        cookTime: '',
        servings: '',
        difficulty: '',
        ingredients: '',
        instructions: '',
        image: null,
        tags: [],
        calories: '',
        newTag: '',
      });
      setEditingRecipe(null);
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error saving recipe:', error.response?.data || error.message);
    }
  };

  // Handle deleting a recipe
  const handleDeleteRecipe = async (id) => {
    try {
      await axios.delete(`${API_URL}/recipes/${id}`);
      const response = await axios.get(`${API_URL}/recipes/all`); // Fetch all recipes
      setRecipes(response.data);
    } catch (error) {
      console.error('Error deleting recipe:', error.response?.data || error.message);
    }
  };

  // Handle edit button click
  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      title: recipe.title,
      description: recipe.description,
      cookTime: recipe.cookTime,
      servings: recipe.servings.toString(),
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image: null,
      tags: recipe.tags || [],
      calories: recipe.calories ? recipe.calories.toString() : '',
      newTag: '',
    });
    setIsCreateOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle tag selection or addition
  const handleTagChange = (value) => {
    if (value === 'add-new' && formData.newTag.trim()) {
      const newTag = formData.newTag.trim();
      if (newTag && !availableTags.includes(newTag)) {
        setAvailableTags([...availableTags, newTag]);
      }
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag], newTag: '' }));
    } else if (value && availableTags.includes(value)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, value] }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleNewTagInput = (e) => {
    setFormData({ ...formData, newTag: e.target.value });
  };

  const addNewTag = (e) => {
    if (e.key === 'Enter' && formData.newTag.trim()) {
      const newTag = formData.newTag.trim();
      if (newTag && !availableTags.includes(newTag)) {
        setAvailableTags([...availableTags, newTag]);
      }
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag], newTag: '' }));
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Recipes</h2>
          <p className="text-gray-600">Create, edit, and manage your recipes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}</DialogTitle>
              <DialogDescription>
                {editingRecipe ? 'Update an existing recipe' : 'Add a new recipe to your collection'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Recipe Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter recipe title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the recipe"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cookTime">Cook Time</Label>
                  <Input
                    id="cookTime"
                    value={formData.cookTime}
                    onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                    placeholder="30 mins"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                    placeholder="4"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="List ingredients (one per line)"
                  rows={5}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Step-by-step cooking instructions"
                  rows={6}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (Select or add new)</Label>
                <div className="flex gap-2">
                  <Select onValueChange={handleTagChange} value="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="newTag"
                    value={formData.newTag}
                    onChange={handleNewTagInput}
                    onKeyPress={addNewTag}
                    placeholder="Type new tag and press Enter"
                    className="w-1/2"
                  />
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} className="bg-blue-100 text-blue-800">
                        {tag} <button onClick={() => removeTag(tag)} className="ml-1 text-red-600">×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  placeholder="Enter calories"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image (Please select from Downloads folder)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFormData({ ...formData, image: file || null });
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsCreateOpen(false);
                setEditingRecipe(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveRecipe} className="bg-orange-500 hover:bg-orange-600">
                {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe._id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={`${API_URL}${recipe.image || '/placeholder.svg'}`} // Use full backend URL
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} // Fallback if image fails
              />
              <Badge className={`absolute top-2 right-2 ${getStatusColor(recipe.status)}`}>
                {recipe.status}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{recipe.title}</CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
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
              <div className="flex flex-wrap gap-1 mb-2">
                {recipe.tags && recipe.tags.map((tag) => (
                  <Badge key={tag} className="bg-blue-100 text-blue-800">{tag}</Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditRecipe(recipe)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteRecipe(recipe._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};