const express = require('express');
const router = express.Router();
const { likeComment } = require('../controllers/commentsController');
const authenticateToken = require('../middleware/authmiddleware');

console.log('🔍 likeComment:', likeComment);
console.log('🔍 authenticateToken:', authenticateToken);
// Like or unlike a comment
router.post('/:id/like', authenticateToken, likeComment);

// Add a reply to a comment
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ error: 'Reply comment is required' });
    }

    const Comment = require('../models/Comment');
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    parentComment.replies.push({
      userId,
      comment,
      date: new Date(),
    });

    await parentComment.save();
    res.json(parentComment);
  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Fetch comments for a recipe
router.get('/recipe/:recipeId', async (req, res) => {
  try {
    const comments = await Comment.find({ recipeId: req.params.recipeId })
      .populate('userId', 'username')
      .populate('replies.userId', 'username');
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Add a new comment
router.post('/recipe/:recipeId', authenticateToken, async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const userId = req.user.id;
    const recipeId = req.params.recipeId;

    if (!comment || !rating) {
      return res.status(400).json({ error: 'Comment and rating are required' });
    }

    const newComment = new Comment({
      recipeId,
      userId,
      comment,
      rating,
    });

    await newComment.save();
    const populatedComment = await Comment.findById(newComment._id)
      .populate('userId', 'username')
      .populate('replies.userId', 'username');

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;