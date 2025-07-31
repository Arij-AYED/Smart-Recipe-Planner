import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, Reply } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Textarea } from '@/components/ui/textarea';

const API_URL = 'http://localhost:3000';

export const ChefFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/recipes/my-recipes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const recipes = response.data;
        const commentPromises = recipes.map((recipe) =>
          axios.get(`${API_URL}/recipes/${recipe._id}/comments`)
        );
        const commentResponses = await Promise.all(commentPromises);
        const allComments = commentResponses.flatMap((res, index) =>
          res.data.map(comment => ({
            ...comment,
            recipeTitle: recipes[index].title,
          }))
        );
        setFeedbacks(allComments);
      } catch (error) {
        console.error('Error fetching feedback:', error.response?.data || error.message);
        toast.error('Failed to fetch feedback.');
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      fetchFeedback();
    }
  }, [token]);

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please log in to reply.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    const reply = replyText[commentId]?.trim();
    if (!reply) {
      toast.error('Please provide a reply.');
      return;
    }
    const feedbackExists = feedbacks.find(c => c._id === commentId);
    if (!feedbackExists) {
      toast.error('Comment not found. Please refresh the page.');
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/comments/${commentId}/reply`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbacks(feedbacks.map(c => c._id === commentId ? response.data : c));
      setReplyText({ ...replyText, [commentId]: '' });
      toast.success('Reply submitted successfully.');
    } catch (error) {
      console.error('Error submitting reply:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to submit reply.');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!token) {
      toast.error('Please log in to like a comment.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    try {
      const feedbackExists = feedbacks.find(c => c._id === commentId);
      if (!feedbackExists) {
        toast.error('Comment not found. Please refresh the page.');
        return;
      }
      const response = await axios.post(
        `${API_URL}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbacks(feedbacks.map(c => c._id === commentId ? response.data : c));
      toast.success('Like updated.');
    } catch (error) {
      console.error('Error liking comment:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to like comment.');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) return <p className="text-center text-gray-600">Loading feedback...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Feedback</h2>
        <p className="text-gray-600">See what users think about your recipes</p>
      </div>

      <div className="grid gap-4">
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <Card key={feedback._id} className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {feedback.userId?.firstname || 'Unknown'} {feedback.userId?.lastname || 'User'}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {feedback.recipeTitle}
                    </Badge>
                    <Badge className={`${getRatingColor(feedback.rating)} text-xs`}>
                      {feedback.rating}/5
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(feedback.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">{renderStars(feedback.rating)}</div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{feedback.comment}</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLikeComment(feedback._id)}
                    className={feedback.likes.includes(user._id) ? 'text-orange-600' : ''}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {feedback.likes.length} Likes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReplyText({ ...replyText, [feedback._id]: replyText[feedback._id] ? '' : ' ' })}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                </div>
                {replyText[feedback._id] && (
                  <form onSubmit={(e) => handleReplySubmit(feedback._id, e)} className="mt-4">
                    <Textarea
                      placeholder="Write your reply here..."
                      value={replyText[feedback._id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [feedback._id]: e.target.value })}
                      className="w-full mb-2"
                    />
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                      Submit Reply
                    </Button>
                  </form>
                )}
                {feedback.replies.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {feedback.replies.map((reply, index) => (
                      <div key={index} className="pl-6 border-l-2 border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {reply.userId?.firstname || 'Unknown'} {reply.userId?.lastname || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <p className="text-gray-600">No feedback yet for your recipes.</p>
        )}
      </div>
    </div>
  );
};