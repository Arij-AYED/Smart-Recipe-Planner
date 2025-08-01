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
import { Plus, Edit, Trash2, Clock, Users, ChefHat, Eye, Flame, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RecipePreview } from '../admin/RecipePreview';

import baking_powder from "../../assets/baking_powder.png"
import bread from "../../assets/bread.png"
import butter from "../../assets/butter.png"
import cheese from "../../assets/cheese.png"
import chicken_breast from "../../assets/chicken_breast.png"
import chocolate from "../../assets/chocolate.png"
import eggs from "../../assets/eggs.png"
import flour from "../../assets/flour.png"
import lettuce from "../../assets/lettuce.png"
import milk from "../../assets/milk.png"
import olive_oil from "../../assets/olive_oil.png"
import rice from "../../assets/rice.png"
import salt from "../../assets/salt.png"
import sugar from "../../assets/sugar.png"
import tomato from "../../assets/tomato.png"
import vanilla from "../../assets/vanilla.png"


const API_URL = 'http://localhost:3000';

export const ChefRecipeManager = () => {
  const [recipes, setRecipes] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cookTime: '',
    servings: '',
    difficulty: '',
    ingredients: [], // Changed to array of { name, quantity, unit }
    instructions: '',
    image: null,
    tags: [],
    calories: '',
    newTag: '',
    selectedIngredient: '', // For the current ingredient being added
    quantity: '', // For the quantity input
  });
  const navigate = useNavigate();

  // Predefined ingredient list with units and images
  const ingredientOptions = [
  { name: 'Chicken Breast', unit: 'grams', image: chicken_breast },
  { name: 'Olive Oil', unit: 'ml', image: olive_oil },
  { name: 'Tomatoes', unit: '', image: tomato },
  { name: 'Rice', unit: 'grams', image: rice },
  { name: 'Eggs', unit: '', image: eggs },
  { name: 'Milk', unit: 'ml', image: milk },
  { name: 'Cheese', unit: 'grams', image: cheese },
  { name: 'Butter', unit: 'grams', image: butter },
  { name: 'Flour', unit: 'grams', image: flour },
  { name: 'Sugar', unit: 'grams', image: sugar },
  { name: 'Salt', unit: 'grams', image: salt },
  { name: 'Chocolate', unit: 'grams', image: chocolate },
  { name: 'Lettuce', unit: 'pieces', image: lettuce },
  { name: 'Vanilla Sugar', unit: 'units', image: vanilla },
  { name: 'Baking Powder', unit: 'grams', image: baking_powder },
  { name: 'Bread', unit: 'pieces', image: bread },

];

  // Fetch user's recipes and available tags from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('User role:', user.role);
        if (!token) {
          toast.error('Please log in to view your recipes');
          navigate('/login');
          return;
        }
        console.log('Fetching recipes with token:', token);
        const [recipesResponse, tagsResponse] = await Promise.all([
          axios.get(`${API_URL}/recipes/my-recipes`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/recipes/tags`)
        ]);
        console.log('User recipes response:', recipesResponse.data);
        console.log('Tags response:', tagsResponse.data);
        setRecipes(recipesResponse.data);
        setAvailableTags(tagsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        toast.error(error.response?.data?.error || 'Failed to fetch recipes');
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired or unauthorized. Please log in again.');
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [navigate]);

  // Handle creating or updating a recipe
  const handleSaveRecipe = async () => {
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    dataToSend.append('cookTime', formData.cookTime);
    dataToSend.append('servings', formData.servings);
    dataToSend.append('difficulty', formData.difficulty);
    // Convert ingredients array to newline-separated string
    dataToSend.append('ingredients', formData.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`).join('\n'));
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

    try {
      console.log('Sending recipe data:', Object.fromEntries(dataToSend));
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to save recipes');
        navigate('/login');
        return;
      }
      console.log('Sending request with token:', token);
      if (editingRecipe) {
        await axios.put(`${API_URL}/recipes/${editingRecipe._id}`, dataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });
        toast.success('Recipe updated successfully');
      } else {
        const response = await axios.post(`${API_URL}/recipes`, dataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });
        console.log('Created recipe:', response.data);
        toast.success('Recipe created successfully');
      }
      const response = await axios.get(`${API_URL}/recipes/my-recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(response.data);
      setFormData({
        title: '',
        description: '',
        cookTime: '',
        servings: '',
        difficulty: '',
        ingredients: [],
        instructions: '',
        image: null,
        tags: [],
        calories: '',
        newTag: '',
        selectedIngredient: '',
        quantity: '',
      });
      setEditingRecipe(null);
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error saving recipe:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to save recipe');
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired or unauthorized. Please log in again.');
        navigate('/login');
      }
    }
  };

  // Handle deleting a recipe
  const handleDeleteRecipe = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to delete recipes');
        navigate('/login');
        return;
      }
      await axios.delete(`${API_URL}/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const response = await axios.get(`${API_URL}/recipes/my-recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(response.data);
      toast.success('Recipe deleted successfully');
    } catch (error) {
      console.error('Error deleting recipe:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to delete recipe');
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired or unauthorized. Please log in again.');
        navigate('/login');
      }
    }
  };

  // Handle edit button click
  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      title: recipe.title || '',
      description: recipe.description || '',
      cookTime: recipe.cookTime || '',
      servings: recipe.servings?.toString() || '',
      difficulty: recipe.difficulty || '',
      ingredients: recipe.ingredients ? recipe.ingredients.split('\n').map(line => {
        const [quantity, unit, name] = line.trim().split(' ', 3);
        return { quantity: parseInt(quantity) || '', unit, name };
      }) : [],
      instructions: recipe.instructions || '',
      image: null,
      tags: recipe.tags || [],
      calories: recipe.calories ? recipe.calories.toString() : '',
      newTag: '',
      selectedIngredient: '',
      quantity: '',
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

  // Handle adding an ingredient
  const handleAddIngredient = () => {
    if (formData.selectedIngredient && formData.quantity) {
      const selected = ingredientOptions.find(ing => ing.name === formData.selectedIngredient);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          ingredients: [
            ...prev.ingredients,
            {
              name: selected.name,
              quantity: parseInt(formData.quantity) || 1,
              unit: selected.unit,
            },
          ],
          selectedIngredient: '',
          quantity: '',
        }));
      }
    }
  };

  // Remove an ingredient
  const removeIngredient = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, index) => index !== indexToRemove),
    }));
  };

  // Truncate description to 3 lines
  const truncateDescription = (description) => {
    if (!description) return 'No description available';
    const lines = description.split('\n').filter(line => line.trim());
    const truncated = lines.slice(0, 3).join('\n');
    return lines.length > 3 ? `${truncated}...` : truncated;
  };

  const handlePreview = (recipe) => {
    setSelectedRecipe(recipe);
    setPreviewOpen(true);
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
                <div className="flex gap-2 mb-2">
                  <Select
                    value={formData.selectedIngredient}
                    onValueChange={(value) => setFormData({ ...formData, selectedIngredient: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredientOptions.map((ing) => (
                        <SelectItem key={ing.name} value={ing.name}>
                          <div className="flex items-center gap-2">
                            <img src={ing.image} alt={ing.name} className="w-6 h-6 rounded-full" />
                            {ing.name} ({ing.unit})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Quantity"
                    className="w-20"
                  />
                  <Button onClick={handleAddIngredient} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {formData.ingredients.length > 0 && (
                  <ul className="space-y-2">
                    {formData.ingredients.map((ing, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>{ing.quantity} {ing.unit} {ing.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
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
                      <Badge key={tag} className="bg-slate-200 text-slate-800">
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
        {recipes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recipes created yet</p>
            <p className="text-sm text-gray-400">Start sharing your culinary creations!</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <Card key={recipe._id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={`${API_URL}${recipe.image || '/placeholder.svg'}`}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
                <Badge className={`absolute top-2 right-2 ${getStatusColor(recipe.status)}`}>
                  {recipe.status}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{recipe.title}</CardTitle>
                <CardDescription className="line-clamp-3">{truncateDescription(recipe.description)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {recipe.cookTime} min
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
                    <div className="flex items-center gap-1 ml-20 font-semibold text-orange-600">
                      <Flame className="h-4 w-4" />
                      {recipe.calories} cal
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {recipe.tags && recipe.tags.map((tag) => (
                    <Badge key={tag} className="bg-slate-200 text-slate-800">{tag}</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-black-300 hover:text-black-700 flex-1 hover:-translate-y-0.5 transition-all duration-500 cursor-pointer"
                    onClick={() => handlePreview(recipe)}
                  >
                    <Eye className="h-4 w-4 mr-1 transition-transform duration-500" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700 flex-1 hover:-translate-y-0.5 transition-all duration-500 cursor-pointer"
                    onClick={() => handleEditRecipe(recipe)}
                  >
                    <Edit className="h-4 w-4 mr-1 transition-transform duration-500" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteRecipe(recipe._id)}
                    className="text-red-600 hover:text-red-700 flex-1 hover:-translate-y-0.5 transition-all duration-500 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-1 transition-transform duration-500" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <RecipePreview
        recipe={selectedRecipe}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onApprove={() => {}}
        onReject={() => {}}
      />
    </div>
  );
};