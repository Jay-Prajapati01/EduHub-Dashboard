import express from 'express';
import auth from '../middleware/auth';
import CommunityPost from '../models/CommunityPost';
import User from '../models/User';

const router = express.Router();

// Get all community posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await CommunityPost.find({ isRemoved: false })
      .populate('author', 'name email role')
      .populate('comments.author', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const newPost = new CommunityPost({
      title,
      content,
      author: userId
    });

    await newPost.save();
    
    const populatedPost = await CommunityPost.findById(newPost._id)
      .populate('author', 'name email role');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Add a comment to a post
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      content,
      author: userId,
      createdAt: new Date()
    });

    await post.save();
    
    const updatedPost = await CommunityPost.findById(postId)
      .populate('author', 'name email role')
      .populate('comments.author', 'name email role');
    
    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Like a post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    if (post.likes.includes(userId)) {
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();
    
    const updatedPost = await CommunityPost.findById(postId)
      .populate('author', 'name email role')
      .populate('comments.author', 'name email role');
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Teacher moderation routes
// Flag a post
router.put('/:postId/flag', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isFlagged = true;
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Remove a post
router.put('/:postId/remove', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isRemoved = true;
    await post.save();
    
    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;