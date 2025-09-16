import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  likes: string[];
  comments: {
    _id: string;
    author: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/community", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError("Error loading community posts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setError("Title and content are required");
      return;
    }
    
    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newPost),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      
      const createdPost = await response.json();
      setPosts([createdPost, ...posts]);
      setNewPost({ title: "", content: "" });
    } catch (err) {
      setError("Error creating post");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Community Forum</h1>
      
      {user && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <Input
                  placeholder="Post Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Write your post content here..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit">Post</Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet. Be the first to share something!</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post._id} className="mb-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{post.title}</CardTitle>
                    <div className="flex items-center mt-2">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-500">
                        {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
                
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="mr-2">
                    Like ({post.likes.length})
                  </Button>
                  <Button variant="outline" size="sm">
                    Comment ({post.comments.length})
                  </Button>
                </div>
                
                {post.comments.length > 0 && (
                  <div className="mt-4">
                    <Separator className="my-4" />
                    <h4 className="font-medium mb-2">Comments</h4>
                    <div className="space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="bg-muted p-3 rounded-md">
                          <div className="flex items-center mb-1">
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{comment.author.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;