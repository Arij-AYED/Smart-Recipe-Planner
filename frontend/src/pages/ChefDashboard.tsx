
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChefRecipeManager } from '@/components/chef/ChefRecipeManager';
import { ChefFeedback } from '@/components/chef/ChefFeedback';
import { ChefHat, FileText, MessageSquare } from 'lucide-react';

const ChefDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Chef Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage your recipes and view user feedback</p>
        </div>

        <Tabs defaultValue="recipes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Recipes
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              User Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-6">
            <ChefRecipeManager />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <ChefFeedback />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChefDashboard;
