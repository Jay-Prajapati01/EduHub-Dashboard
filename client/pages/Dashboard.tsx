import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (user.role === "student") {
        navigate("/student");
      } else if (user.role === "teacher") {
        navigate("/teacher");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-gradient">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg shadow-sm hover-scale border">
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            <p className="text-muted-foreground mb-4">Access your enrolled courses and learning materials.</p>
            <a href="/student" className="text-primary hover:underline">View Courses →</a>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm hover-scale border">
            <h2 className="text-xl font-semibold mb-4">Community</h2>
            <p className="text-muted-foreground mb-4">Connect with peers and teachers in our learning community.</p>
            <a href="/community" className="text-primary hover:underline">Join Discussion →</a>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm hover-scale border">
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <p className="text-muted-foreground mb-4">Access learning resources and study materials.</p>
            <a href="#" className="text-primary hover:underline">Browse Resources →</a>
          </div>
        </div>
      </main>
    </div>
  );
}
