import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-professional-gray via-blue-50 to-professional-blue/20">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm border-professional-blue/10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-professional-blue to-student rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-professional-navy">
                EduHub
              </h1>
            </Link>
            <Badge
              variant="secondary"
              className="text-xs bg-professional-blue/10 text-professional-navy"
            >
              v2.0
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-sm text-professional-slate hover:text-professional-navy mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <h2 className="text-3xl font-bold text-professional-navy mb-2">
              Welcome Back
            </h2>
            <p className="text-professional-slate">
              Sign in to your EduHub account
            </p>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-professional-blue/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-professional-blue to-student hover:from-student hover:to-professional-blue shadow-md"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-professional-slate">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-professional-blue hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Demo credentials */}
              <div className="mt-6 p-4 bg-professional-gray rounded-lg border border-professional-blue/10">
                <h4 className="text-sm font-medium text-professional-navy mb-2">
                  Demo Accounts:
                </h4>
                <div className="text-xs text-professional-slate space-y-1">
                  <p>
                    <strong className="text-teacher">Teacher:</strong>{" "}
                    prof.smith@eduhub.com / password123
                  </p>
                  <p>
                    <strong className="text-student">Student:</strong>{" "}
                    alex.student@eduhub.com / password123
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
