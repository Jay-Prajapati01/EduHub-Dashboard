import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Socket, io } from 'socket.io-client';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  timestamp: string;
  isDeleted: boolean;
  isSystem?: boolean;
}

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Chat {
  _id: string;
  participants: ChatUser[];
  messages: Message[];
  isGroupChat: boolean;
  groupName?: string;
  suspendedUsers: string[];
}

const ChatInterface = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isTeacher = user?.role === 'teacher';

  // Fetch all chats for the current user
  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chat', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific chat by ID
  const fetchChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentChat(data);
        
        // Join the chat room via socket
        if (socket) {
          socket.emit('join_chat', chatId);
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  // Send a message in the current chat
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !currentChat || !socket) return;
    
    try {
      // Optimistically add message to UI
      const tempMessage: Message = {
        _id: Date.now().toString(),
        sender: {
          _id: user?._id || '',
          name: user?.name || '',
          email: user?.email || '',
          role: user?.role || ''
        },
        content: message,
        timestamp: new Date().toISOString(),
        isDeleted: false
      };
      
      // Update UI immediately
      setCurrentChat(prevChat => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, tempMessage]
        };
      });
      
      // Update chats list with the new message
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat._id === currentChat._id) {
            return {
              ...chat,
              messages: [...(chat.messages || []), tempMessage]
            };
          }
          return chat;
        });
      });
      
      // Emit message via socket
      socket.emit('send_message', {
        chatId: currentChat._id,
        content: message
      });
      
      // Also send to server for persistence
      const response = await fetch(`/api/chat/${currentChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: message })
      });
      
      // Clear message input
      setMessage('');
      
      // Stop typing indicator
      socket.emit('stop_typing', {
        chatId: currentChat._id
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !currentChat) return;
    
    // Emit typing event
    socket.emit('typing', {
      chatId: currentChat._id
    });
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', {
        chatId: currentChat._id
      });
    }, 3000);
  };

  // Teacher moderation functions
  const suspendUser = async (chatId: string, userId: string) => {
    if (!isTeacher) return;
    
    try {
      const response = await fetch(`/api/chat/${chatId}/suspend/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Refresh the current chat
        fetchChat(chatId);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const unsuspendUser = async (chatId: string, userId: string) => {
    if (!isTeacher) return;
    
    try {
      const response = await fetch(`/api/chat/${chatId}/unsuspend/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Refresh the current chat
        fetchChat(chatId);
      }
    } catch (error) {
      console.error('Error unsuspending user:', error);
    }
  };

  const removeUser = async (chatId: string, userId: string) => {
    if (!isTeacher) return;
    
    try {
      const response = await fetch(`/api/chat/${chatId}/participants/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Refresh the current chat and the chat list
        fetchChats();
        if (currentChat?._id === chatId) {
          setCurrentChat(null);
        }
      }
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;
    
    // Connect to WebSocket server
    const newSocket = io('http://localhost:8081', {
      query: { userId: user._id }
    });
    
    setSocket(newSocket);
    
    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    newSocket.on('message', (newMessage: Message) => {
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat._id === currentChat?._id) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage]
            };
          }
          return chat;
        });
      });
      
      if (currentChat && currentChat._id === newMessage.chatId) {
        setCurrentChat(prevChat => {
          if (!prevChat) return null;
          return {
            ...prevChat,
            messages: [...prevChat.messages, newMessage]
          };
        });
      }
    });
    
    newSocket.on('user_online', (userId: string) => {
      setOnlineUsers(prev => {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      });
    });
    
    newSocket.on('user_offline', (userId: string) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });
    
    newSocket.on('typing', (data: { userId: string, chatId: string }) => {
      if (currentChat && currentChat._id === data.chatId && data.userId !== user._id) {
        setTypingUsers(prev => {
          if (prev.includes(data.userId)) return prev;
          return [...prev, data.userId];
        });
      }
    });
    
    newSocket.on('stop_typing', (data: { userId: string, chatId: string }) => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
    });
    
    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading chats...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-gray-900 text-white">
      {/* Discord-like sidebar */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Channels</h2>
          {isTeacher && (
            <button className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        <div>
          {chats.length === 0 ? (
            <div className="p-4 text-gray-400">No channels available</div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat._id} 
                className={`p-3 mx-2 my-1 rounded cursor-pointer hover:bg-gray-700 flex items-center ${currentChat?._id === chat._id ? 'bg-gray-700' : ''}`}
                onClick={() => fetchChat(chat._id)}
              >
                <h3 className="font-medium">
                  {chat.isGroupChat 
                    ? chat.groupName 
                    : chat.participants.find(p => p._id !== user?._id)?.name || 'Chat'}
                </h3>
                <p className="text-sm text-gray-500">
                  {chat.messages.length > 0 
                    ? `${chat.messages[chat.messages.length - 1].content.substring(0, 30)}${chat.messages[chat.messages.length - 1].content.length > 30 ? '...' : ''}`
                    : 'No messages yet'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat messages and input */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">
                  {currentChat.isGroupChat 
                    ? currentChat.groupName 
                    : currentChat.participants.find(p => p._id !== user?._id)?.name || 'Chat'}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentChat.participants.length} participants
                </p>
              </div>
              
              {/* Teacher moderation controls */}
              {isTeacher && currentChat.isGroupChat && (
                <div className="flex space-x-2">
                  <select 
                    className="border rounded p-2 text-sm"
                    onChange={(e) => {
                      const [action, userId] = e.target.value.split('|');
                      if (action && userId) {
                        if (action === 'suspend') suspendUser(currentChat._id, userId);
                        if (action === 'unsuspend') unsuspendUser(currentChat._id, userId);
                        if (action === 'remove') removeUser(currentChat._id, userId);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Moderate Users</option>
                    {currentChat.participants
                      .filter(p => p._id !== user?._id && p.role !== 'teacher')
                      .map(p => (
                        <React.Fragment key={p._id}>
                          {currentChat.suspendedUsers.includes(p._id) ? (
                            <option value={`unsuspend|${p._id}`}>Unsuspend {p.name}</option>
                          ) : (
                            <option value={`suspend|${p._id}`}>Suspend {p.name}</option>
                          )}
                          <option value={`remove|${p._id}`}>Remove {p.name}</option>
                        </React.Fragment>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChat.messages.length === 0 ? (
                <div className="text-center text-gray-500 my-8">No messages yet</div>
              ) : (
                currentChat.messages.map(msg => (
                  <div 
                    key={msg._id} 
                    className={`flex ${msg.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender._id === user?._id 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-gray-200 rounded-bl-none'
                      }`}
                    >
                      {msg.isDeleted ? (
                        <p className="italic text-gray-500">This message was deleted</p>
                      ) : (
                        <>
                          <p className="text-xs font-semibold mb-1">
                            {msg.sender.name} 
                            {msg.sender.role === 'teacher' && ' (Teacher)'}
                          </p>
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Check if user is suspended */}
            {currentChat.suspendedUsers.includes(user?._id) ? (
              <div className="p-4 bg-red-100 text-red-800 text-center">
                You have been suspended from this chat and cannot send messages.
              </div>
            ) : (
              /* Message input */
              <form onSubmit={sendMessage} className="p-4 border-t flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Send
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;