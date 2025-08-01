import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Heart, Book, Settings, Camera, Edit3, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import RecipeCard from '@/components/RecipeCard';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BASE_URL;

interface UserData {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  certificate?: string;
  profileImage?: string;
  bio?: string;
  location?: string;
}

const UserProfile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstname: '',
    lastname: '',
    bio: '',
    location: ''
  });
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchFavoriteRecipes();
    fetchUserRecipes();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user) {
        toast({
          title: "Timeout",
          description: "Unable to load profile after several seconds.",
          variant: "destructive"
        });
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [user]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Not Logged In",
        description: "Please log in to view your profile",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Fetching user profile with token:', token); // Debug log
      const response = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('User profile response:', response.data); // Debug log
      setUser(response.data);
      setEditForm({
        firstname: response.data.firstname || '',
        lastname: response.data.lastname || '',
        bio: response.data.bio || '',
        location: response.data.location || ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error.response?.data || error.message);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive"
      });
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const fetchFavoriteRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Favorite recipes response:', response.data); // Debug log
      setFavoriteRecipes(response.data);
    } catch (error) {
      console.error('Error fetching favorite recipes:', error.response?.data || error.message);
      toast({
        title: "Error",
        description: "Failed to load favorite recipes.",
        variant: "destructive"
      });
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/recipes/my-recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('User recipes response:', response.data); // Debug log
      setUserRecipes(response.data);
    } catch (error) {
      console.error('Error fetching user recipes:', error.response?.data || error.message);
      toast({
        title: "Error",
        description: "Failed to load your recipes.",
        variant: "destructive"
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/auth/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/auth/upload-avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(prev => prev ? { ...prev, profileImage: response.data.profileImage } : null);
      toast({
        title: "Success",
        description: "Profile image updated successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error.response?.data || error.message);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              My Profile
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6 relative">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-6 md:space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profileImage} alt={user.firstname} />
                  <AvatarFallback className="text-xl bg-gradient-to-r from-blue-400 to-green-400 text-white">
                    {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="absolute top-0 right-4">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className="bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-600 hover:to-green-600"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstname">First Name</Label>
                        <Input
                          id="firstname"
                          value={editForm.firstname}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstname: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastname">Last Name</Label>
                        <Input
                          id="lastname"
                          value={editForm.lastname}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastname: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Where are you located?"
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-gradient-to-r from-blue-500 to-green-500"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.firstname} {user.lastname}
                    </h2>
                    <p className="text-gray-600 mb-2">{user.email}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                      <Badge
                        variant={user.role === 'chef' ? 'default' : 'secondary'}
                        className={user.role === 'chef' ? 'bg-gradient-to-r from-blue-500 to-green-500' : ''}
                      >
                        {user.role === 'chef' ? '👨‍🍳 Chef' : '👤 User'}
                      </Badge>
                    </div>
                    {user.bio && <p className="text-gray-600 mb-2">{user.bio}</p>}
                    {user.location && <p className="text-gray-500">📍 {user.location}</p>}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue={user.role === 'chef' ? "my-recipes" : "favorites"} className="space-y-6">
          <TabsList className={`grid w-full ${user.role === 'chef' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Favorites</span>
            </TabsTrigger>
            {user.role === 'chef' && (
              <TabsTrigger value="my-recipes" className="flex items-center space-x-2">
                <Book className="w-4 h-4" />
                <span>My Recipes</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Favorite Recipes</span>
                </CardTitle>
                <CardDescription>
                  Recipes you've saved and loved
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteRecipes.map((recipe) => (
                      <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No favorite recipes yet</p>
                    <p className="text-sm text-gray-400">Start exploring and save recipes you love!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'chef' && (
            <TabsContent value="my-recipes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Book className="w-5 h-5 text-blue-500" />
                    <span>My Recipes</span>
                  </CardTitle>
                  <CardDescription>
                    Recipes you've created and shared
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userRecipes.map((recipe) => (
                        <RecipeCard key={recipe._id} recipe={recipe} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No recipes created yet</p>
                      <p className="text-sm text-gray-400">Start sharing your culinary creations!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span>Account Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={user.email} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Input
                      value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  {user.certificate && (
                    <div>
                      <Label>Chef Certificate</Label>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          ✓ Certificate Uploaded
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;