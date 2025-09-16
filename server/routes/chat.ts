import express from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import { Chat } from '../models/Chat';
import User from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

// Get all chats for a user
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email role')
      .sort({ updatedAt: -1 });
    
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific chat by ID
router.get('/:chatId', auth, async (req: AuthRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;
    
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    }).populate('participants', 'name email role')
      .populate('messages.sender', 'name email role');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is suspended in this chat
    if (chat.suspendedUsers.includes(userId as any)) {
      return res.status(403).json({ message: 'You are suspended from this chat' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new chat
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const { participants, isGroupChat, groupName } = req.body;
    const userId = req.user?._id;
    
    // Ensure current user is included in participants
    if (!participants.includes(userId.toString())) {
      participants.push(userId.toString());
    }
    
    // Convert string IDs to ObjectIds
    const participantIds = participants.map(id => new mongoose.Types.ObjectId(id));
    
    // Check if a direct chat already exists between these two users
    if (!isGroupChat && participants.length === 2) {
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: participantIds, $size: 2 }
      });
      
      if (existingChat) {
        return res.json(existingChat);
      }
    }
    
    const newChat = new Chat({
      participants: participantIds,
      isGroupChat,
      groupName: isGroupChat ? groupName : undefined,
      messages: []
    });
    
    await newChat.save();
    
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email role');
    
    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message in a chat
router.post('/:chatId/messages', auth, async (req: AuthRequest, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant
    if (!chat.participants.includes(userId as any)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }
    
    // Check if user is suspended
    if (chat.suspendedUsers.includes(userId as any)) {
      return res.status(403).json({ message: 'You are suspended from this chat' });
    }
    
    const newMessage = {
      sender: userId,
      content,
      timestamp: new Date(),
      isDeleted: false
    };
    
    chat.messages.push(newMessage);
    await chat.save();
    
    // Populate the sender information for the new message
    const updatedChat = await Chat.findById(chatId)
      .populate('participants', 'name email role')
      .populate('messages.sender', 'name email role');
    
    const sentMessage = updatedChat?.messages[updatedChat.messages.length - 1];
    
    res.status(201).json(sentMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher moderation endpoints

// Suspend a user from a chat (teacher only)
router.post('/:chatId/suspend/:userId', auth, async (req: AuthRequest, res) => {
  try {
    const { chatId, userId } = req.params;
    const teacherId = req.user?._id;
    
    // Check if the current user is a teacher
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can suspend users' });
    }
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if teacher is a participant
    if (!chat.participants.includes(teacherId as any)) {
      return res.status(403).json({ message: 'Not authorized to moderate this chat' });
    }
    
    // Add user to suspended list if not already there
    if (!chat.suspendedUsers.includes(new mongoose.Types.ObjectId(userId) as any)) {
      chat.suspendedUsers.push(new mongoose.Types.ObjectId(userId));
      await chat.save();
    }
    
    res.json({ message: 'User suspended from chat' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unsuspend a user from a chat (teacher only)
router.post('/:chatId/unsuspend/:userId', auth, async (req: AuthRequest, res) => {
  try {
    const { chatId, userId } = req.params;
    const teacherId = req.user?._id;
    
    // Check if the current user is a teacher
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can unsuspend users' });
    }
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if teacher is a participant
    if (!chat.participants.includes(teacherId as any)) {
      return res.status(403).json({ message: 'Not authorized to moderate this chat' });
    }
    
    // Remove user from suspended list
    chat.suspendedUsers = chat.suspendedUsers.filter(
      id => id.toString() !== userId
    );
    
    await chat.save();
    
    res.json({ message: 'User unsuspended from chat' });
  } catch (error) {
    console.error('Error unsuspending user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a user from a chat (teacher only)
router.delete('/:chatId/participants/:userId', auth, async (req: AuthRequest, res) => {
  try {
    const { chatId, userId } = req.params;
    const teacherId = req.user?._id;
    
    // Check if the current user is a teacher
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can remove users' });
    }
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if teacher is a participant
    if (!chat.participants.includes(teacherId as any)) {
      return res.status(403).json({ message: 'Not authorized to moderate this chat' });
    }
    
    // Remove user from participants
    chat.participants = chat.participants.filter(
      id => id.toString() !== userId
    );
    
    // Also remove from suspended users if they were suspended
    chat.suspendedUsers = chat.suspendedUsers.filter(
      id => id.toString() !== userId
    );
    
    await chat.save();
    
    res.json({ message: 'User removed from chat' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;