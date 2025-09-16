import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  ChevronRight,
  User,
  School,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-professional-gray via-blue-50 to-professional-blue/20">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm border-professional-blue/10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-professional-blue to-student rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-professional-navy">
                EduHub
              </h1>
            </div>
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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-professional-navy mb-4">
            Welcome to Your Learning Hub
          </h2>
          <p className="text-lg text-professional-slate max-w-2xl mx-auto">
            Choose your role to access personalized features designed to enhance
            your educational experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Card */}
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-professional-blue/20 hover:border-student bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-student/10 to-student/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-student/20 group-hover:to-student/30 transition-all shadow-lg">
                <User className="w-10 h-10 text-student" />
              </div>
              <CardTitle className="text-2xl text-professional-navy">
                Student Portal
              </CardTitle>
              <CardDescription className="text-professional-slate">
                Access your courses, assignments, and academic progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-professional-slate">
                  <BookOpen className="w-4 h-4 text-student" />
                  <span>View enrolled courses and materials</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-professional-slate">
                  <BarChart3 className="w-4 h-4 text-student" />
                  <span>Track assignments and grades</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-professional-slate">
                  <Users className="w-4 h-4 text-student" />
                  <span>Collaborate with classmates</span>
                </div>
              </div>
              <Link to="/login">
                <Button className="w-full mt-6 bg-gradient-to-r from-student to-student-dark hover:from-student-dark hover:to-student text-white group-hover:from-student-dark group-hover:to-student transition-all shadow-md">
                  Enter as Student
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Teacher Card */}
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-professional-blue/20 hover:border-teacher bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-teacher/10 to-teacher/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-teacher/20 group-hover:to-teacher/30 transition-all shadow-lg">
                <School className="w-10 h-10 text-teacher" />
              </div>
              <CardTitle className="text-2xl text-professional-navy">
                Teacher Portal
              </CardTitle>
              <CardDescription className="text-professional-slate">
                Manage your classes, students, and educational content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-professional-slate">
                  <BookOpen className="w-4 h-4 text-teacher" />
                  <span>Create and manage course content</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-professional-slate">
                  <BarChart3 className="w-4 h-4 text-teacher" />
                  <span>Grade assignments and track progress</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-professional-slate">
                  <Users className="w-4 h-4 text-teacher" />
                  <span>Manage student enrollment</span>
                </div>
              </div>
              <Link to="/login">
                <Button className="w-full mt-6 bg-gradient-to-r from-teacher to-teacher-dark hover:from-teacher-dark hover:to-teacher text-white group-hover:from-teacher-dark group-hover:to-teacher transition-all shadow-md">
                  Enter as Teacher
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16">
          <p className="text-sm text-professional-slate">
            Secure • Intuitive • Collaborative Learning Platform
          </p>
        </div>
      </main>
    </div>
  );
}
