import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Users, ChefHat, ArrowLeft, Star, ThumbsUp, Reply } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = 'http://localhost:3000';

const RecipeDetails = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [replyText, setReplyText] = useState({});
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchRecipeAndComments = async () => {
      try {
        setIsLoading(true);
        const [recipeResponse, commentsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/recipes/${id}`),
          axios.get(`${API_URL}/api/recipes/${id}/comments`)
        ]);
        setRecipe(recipeResponse.data);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Error fetching recipe or comments:', error.response?.data || error.message);
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipeAndComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please log in to submit a comment.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    if (!newComment.trim() || rating < 1 || rating > 5) {
      toast.error('Please provide a comment and a rating between 1 and 5.');
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/recipes/${id}/comments`,
        { comment: newComment, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, response.data]);
      setNewComment('');
      setRating(0);
      toast.success('Comment submitted successfully.');
    } catch (error) {
      console.error('Error submitting comment:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to submit comment.');
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
      const commentExists = comments.find(c => c._id === commentId);
      if (!commentExists) {
        toast.error('Comment not found. Please refresh the page.');
        return;
      }
      const response = await axios.post(
        `${API_URL}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map(c => c._id === commentId ? response.data : c));
      toast.success('Like updated.');
    } catch (error) {
      console.error('Error liking comment:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to like comment.');
    }
  };

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
    const commentExists = comments.find(c => c._id === commentId);
    if (!commentExists) {
      toast.error('Comment not found. Please refresh the page.');
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/comments/${commentId}/reply`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map(c => c._id === commentId ? response.data : c));
      setReplyText({ ...replyText, [commentId]: '' });
      toast.success('Reply submitted successfully.');
    } catch (error) {
      console.error('Error submitting reply:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to submit reply.');
    }
  };

  const truncateDescription = (description) => {
    if (!description) return '';
    const lines = description.split('\n');
    const truncated = lines.slice(0, 3).join('\n');
    return lines.length > 3 ? `${truncated}...` : truncated;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        onClick={() => setRating(i + 1)}
        style={{ cursor: 'pointer' }}
      />
    ));
  };

  if (isLoading) return <p className="text-center text-gray-600">Loading recipe...</p>;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;
  if (!recipe) return <p className="text-center text-gray-600">Recipe not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Toaster />
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                Smart Recipe Planner
              </h1>
            </div>
            <Link to="/">
              <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={`${API_URL}${recipe.image || '/placeholder.svg'}`}
                alt={recipe.title}
                className="w-full h-96 object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                onError={(e) => {
                  console.log('Image failed to load:', recipe.image);
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="md:w-1/2 p-6">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900">{recipe.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                  {recipe.status && (
                    <Badge className="bg-gray-100 text-gray-800">{recipe.status}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.cookTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings} servings
                  </div>
                  {recipe.calories > 0 && (
                    <div className="flex items-center gap-1 font-medium text-orange-600">
                      <span>{recipe.calories} cal</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags && recipe.tags.map((tag, index) => (
                    <Badge key={index} className="bg-slate-200 text-slate-800">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Description</h3>
          <p className="text-gray-600 whitespace-pre-line">
            {showFullDescription ? recipe.description : truncateDescription(recipe.description)}
          </p>
          {recipe.description.split('\n').length > 3 && (
            <Button
              variant="link"
              className="text-orange-600 p-0 h-auto"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show Less' : 'Read More'}
            </Button>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
          <ul className="space-y-2">
            {recipe.ingredients?.split('\n').map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Instructions</h3>
          <ol className="space-y-3">
            {recipe.instructions?.split('\n').map((instruction, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-700">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Comments</h3>
          {token ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Rate this recipe:</span>
                  {renderStars(rating)}
                </div>
                <Textarea
                  placeholder="Write your comment here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full"
                />
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  Submit Comment
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600 mb-4">
              Please <Link to="/login" className="text-orange-600 underline">log in</Link> to leave a comment.
            </p>
          )}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment._id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {comment.userId?.firstname || 'Unknown'} {comment.userId?.lastname || 'User'}
                      </span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {comment.rating}/5
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.comment}</p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLikeComment(comment._id)}
                      className={comment.likes.includes(user._id) ? 'text-orange-600' : ''}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {comment.likes.length} Likes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyText({ ...replyText, [comment._id]: replyText[comment._id] ? '' : ' ' })}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                  {replyText[comment._id] && (
                    <form onSubmit={(e) => handleReplySubmit(comment._id, e)} className="mt-4">
                      <Textarea
                        placeholder="Write your reply here..."
                        value={replyText[comment._id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                        className="w-full mb-2"
                      />
                      <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                        Submit Reply
                      </Button>
                    </form>
                  )}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {comment.replies.map((reply, index) => (
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
                </Card>
              ))
            ) : (
              <p className="text-gray-600">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipeDetails;