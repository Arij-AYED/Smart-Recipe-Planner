import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Image, ChefHat, Mail, Lock, Eye, EyeOff, User, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import axios from 'axios';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '', 
    password: '',
    confirmPassword: '',
    profileImage: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.role === 'chef' && !certificateFile) {
      toast.error('Please upload a chef certificate');
      setIsLoading(false);
      return;
    }

    const form = new FormData();
    form.append('firstname', formData.firstName);
    form.append('lastname', formData.lastName);
    form.append('email', formData.email);
    form.append('password', formData.password);
    form.append('role', formData.role);
    if (certificateFile) {
      form.append('certificate', certificateFile);
    }
    if (formData.profileImage) {
      form.append('profileImage', formData.profileImage);
    }

    // DEBUG: Log the role and all form data key/values before sending
    console.log("Selected role:", formData.role);
    for (let pair of form.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await axios.post(import.meta.env.VITE_BASE_URL+'/api/register', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Signup response:', response.data);
      toast.success('🎉 Signup successful! Please log in.');
      navigate('/login');
    } catch (error: any) {
      console.error('Signup error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setCertificateFile(file);
    } else {
      toast.error('Please upload a PDF file only');
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, profileImage: file }));
    } else {
      toast.error('Please upload a valid image');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            Smart Recipe Planner
          </h1>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-600">
              Join us to start your personalized meal planning journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="profileImage" className="text-sm font-medium text-gray-700">
                  Profile Image
                </Label>
                <div className="relative">
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="profileImage"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Image className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formData.profileImage ? formData.profileImage.name : 'Upload your profile image'}
                    </span>
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  JPG, PNG, or GIF. Max size 5MB.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  I want to join as:
                </Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  className="grid grid-cols-2 gap-4"
                >
                  {/* Wrap RadioGroupItem + Label in a label tag to make it clickable */}
                  <label htmlFor="user" className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="user" id="user" />
                    <span>User</span>
                  </label>
                  <label htmlFor="chef" className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="chef" id="chef" />
                    <span>Chef</span>
                  </label>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10 border-gray-200 focus:border-orange-400"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="pl-10 border-gray-200 focus:border-orange-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-orange-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 border-gray-200 focus:border-orange-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10 border-gray-200 focus:border-orange-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {formData.role === 'chef' && (
                <div className="space-y-2">
                  <Label htmlFor="certificate" className="text-sm font-medium text-gray-700">
                    Chef Certificate (PDF)
                  </Label>
                  <div className="relative">
                    <input
                      id="certificate"
                      type="file"
                      accept=".pdf"
                      onChange={handleCertificateUpload}
                      className="hidden"
                    />
                    <Label
                      htmlFor="certificate"
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {certificateFile ? certificateFile.name : 'Upload your chef certificate (PDF)'}
                      </span>
                      {certificateFile && <FileText className="h-4 w-4 text-green-600" />}
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload your culinary certificate or professional qualification
                  </p>
                </div>
              )}

              <div className="flex items-start space-x-2 text-sm">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400 mt-0.5"
                  required
                />
                <label htmlFor="terms" className="text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-orange-600 hover:text-orange-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white font-medium py-2.5"
              >
                {isLoading ? 'Creating Account...' : `Create ${formData.role === 'chef' ? 'Chef' : 'User'} Account`}
              </Button>
            </form>

            {/* Rest of your UI */}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
