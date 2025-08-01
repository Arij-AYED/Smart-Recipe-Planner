const Comment = require('../models/Comment');

const likeComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.likes.includes(userId)) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error('Error liking comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { likeComment };
