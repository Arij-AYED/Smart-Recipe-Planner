
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Reply } from 'lucide-react';

export const ChefFeedback = () => {
  const [feedbacks] = useState([
    {
      id: 1,
      recipeTitle: "Spaghetti Carbonara",
      userName: "Sarah Johnson",
      rating: 5,
      comment: "Amazing recipe! The carbonara turned out perfectly creamy. My family loved it!",
      date: "2024-01-15",
      helpful: 12,
      replied: false
    },
    {
      id: 2,
      recipeTitle: "Chicken Tikka Masala",
      userName: "Mike Chen",
      rating: 4,
      comment: "Great flavors, but I found the cooking time was a bit longer than expected. Maybe add 10 more minutes to the instructions.",
      date: "2024-01-14",
      helpful: 8,
      replied: true
    },
    {
      id: 3,
      recipeTitle: "Spaghetti Carbonara",
      userName: "Emily Davis",
      rating: 5,
      comment: "This is now my go-to carbonara recipe. The technique for the eggs is spot on!",
      date: "2024-01-13",
      helpful: 15,
      replied: false
    },
    {
      id: 4,
      recipeTitle: "Chicken Tikka Masala",
      userName: "David Wilson",
      rating: 3,
      comment: "Good recipe but could use more spice. I added extra garam masala and it was perfect.",
      date: "2024-01-12",
      helpful: 5,
      replied: false
    }
  ]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Feedback</h2>
        <p className="text-gray-600">See what users think about your recipes</p>
      </div>

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{feedback.userName}</h3>
                  <Badge variant="outline" className="text-xs">
                    {feedback.recipeTitle}
                  </Badge>
                  <Badge className={`${getRatingColor(feedback.rating)} text-xs`}>
                    {feedback.rating}/5
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {renderStars(feedback.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(feedback.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              {feedback.comment}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {feedback.helpful} found helpful
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {feedback.replied && (
                  <Badge variant="outline" className="text-xs">
                    Replied
                  </Badge>
                )}
                <Button variant="outline" size="sm">
                  <Reply className="h-4 w-4 mr-1" />
                  {feedback.replied ? 'View Reply' : 'Reply'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
