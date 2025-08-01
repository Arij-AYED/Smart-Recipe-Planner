import { useState, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:3000';

const [newCommentRating, setNewCommentRating] = useState(0);API_URL

interface Comment {
  _id: string;
  userId: { _id: string; username: string };
  comment: string;
  rating: number;
  date: string;
  likes: string[];
  replies: { _id: string; userId: { _id: string; username: string }; comment: string; date: string }[];
}

interface CommentSectionProps {
  recipeId: string;
  user: any;
}

const CommentSection = ({ recipeId, user }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const handleAddComment = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('You must be logged in to comment');
    return;
  }

  if (!newComment || !newCommentRating) {
    toast.error('Comment and rating are required');
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/comments/recipe/${recipeId}`,
      { comment: newComment, rating: newCommentRating },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setComments([...comments, response.data]);
    setNewComment('');
    setNewCommentRating(0);
    toast.success('Comment added');
  } catch (error) {
    console.error('Error adding comment:', error);
    toast.error('Failed to add comment');
  }
};
  // Fetch comments for the recipe
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/comments/recipe/${recipeId}`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments');
      }
    };
    fetchComments();
  }, [recipeId]);

  // Handle liking a comment
  const handleLikeComment = async (commentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to like comments');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(
        comments.map((c) =>
          c._id === commentId ? { ...c, likes: response.data.likes } : c
        )
      );
      toast.success('Comment like updated');
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  // Handle adding a reply
  const handleAddReply = async (commentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to reply');
      return;
    }

    const replyComment = replyText[commentId];
    if (!replyComment) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/comments/${commentId}/reply`,
        { comment: replyComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(
        comments.map((c) =>
          c._id === commentId ? { ...c, replies: response.data.replies } : c
        )
      );
      setReplyText({ ...replyText, [commentId]: '' });
      toast.success('Reply added');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  return (
    <div className="space-y-4">
        <div className="mb-4">
  <Input
    value={newComment}
    onChange={(e) => setNewComment(e.target.value)}
    placeholder="Write a comment..."
    className="mb-2"
  />
  <div className="flex items-center space-x-2">
    <span>Rating:</span>
    {[1, 2, 3, 4, 5].map((star) => (
      <Button
        key={star}
        variant={newCommentRating >= star ? 'default' : 'outline'}
        size="sm"
        onClick={() => setNewCommentRating(star)}
      >
        ★
      </Button>
    ))}
  </div>
  <Button onClick={handleAddComment} className="mt-2">
    Submit Comment
  </Button>
</div>
      {comments.map((comment) => (
        <Card key={comment._id} className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{comment.userId.username}</p>
                <p className="text-sm text-gray-600">{new Date(comment.date).toLocaleDateString()}</p>
                <p className="mt-1">{comment.comment}</p>
                <p className="text-sm">Rating: {comment.rating}/5</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(comment._id)}
                  className={comment.likes.includes(user?._id) ? 'text-red-500' : ''}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {comment.likes.length}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReplyText({ ...replyText, [comment._id]: replyText[comment._id] || '' })
                  }
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>

            {/* Reply input */}
            {replyText[comment._id] !== undefined && (
              <div className="mt-2 flex space-x-2">
                <Input
                  value={replyText[comment._id]}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [comment._id]: e.target.value })
                  }
                  placeholder="Write a reply..."
                />
                <Button onClick={() => handleAddReply(comment._id)}>Submit</Button>
              </div>
            )}

            {/* Display replies */}
            {comment.replies.map((reply) => (
              <div key={reply._id} className="ml-6 mt-2 border-l-2 pl-4">
                <p className="font-semibold">{reply.userId.username}</p>
                <p className="text-sm text-gray-600">{new Date(reply.date).toLocaleDateString()}</p>
                <p>{reply.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommentSection;