import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  GraduationCap,
  Bell
} from "lucide-react";

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    upcomingAssignments: 0,
    averageGrade: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (user) {
      // Mock data for demonstration
      setCourses([
        { id: "1", title: "Introduction to Computer Science", instructor: "Dr. Smith", schedule: { days: ["Mon", "Wed"], time: "10:00 AM", room: "Room 101" } },
        { id: "2", title: "Data Structures and Algorithms", instructor: "Prof. Johnson", schedule: { days: ["Tue", "Thu"], time: "2:00 PM", room: "Room 203" } },
        { id: "3", title: "Web Development", instructor: "Dr. Williams", schedule: { days: ["Fri"], time: "1:00 PM", room: "Lab 3" } }
      ]);
      
      setAssignments([
        { id: "1", title: "Programming Assignment 1", course: "Introduction to Computer Science", dueDate: "2023-10-15", status: "completed" },
        { id: "2", title: "Algorithm Analysis", course: "Data Structures and Algorithms", dueDate: "2023-10-20", status: "pending" },
        { id: "3", title: "Portfolio Website", course: "Web Development", dueDate: "2023-10-25", status: "in-progress" }
      ]);
      
      setStats({
        enrolledCourses: 3,
        upcomingAssignments: 2,
        averageGrade: 85,
        attendanceRate: 92
      });
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.enrolledCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Upcoming Assignments</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.upcomingAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Average Grade</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.averageGrade}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Attendance Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.attendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Courses */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900">My Courses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course, index) => {
                    const gradients = [
                      "from-blue-50 to-indigo-50 border-blue-200",
                      "from-green-50 to-emerald-50 border-green-200",
                      "from-purple-50 to-violet-50 border-purple-200",
                    ];

                    return (
                      <div
                        key={course.id}
                        className={`flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 bg-gradient-to-r ${gradients[index % 3]} rounded-xl border shadow-sm hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center space-x-4 w-full lg:w-auto mb-4 lg:mb-0">
                          <div className="w-14 h-14 bg-white/90 rounded-xl flex items-center justify-center shadow-sm">
                            <BookOpen className="w-7 h-7 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-lg truncate">
                              {course.title}
                            </p>
                            <p className="text-sm text-slate-600 mb-2">
                              Instructor: {course.instructor} • {course.schedule.days.join(", ")} {course.schedule.time} • {course.schedule.room}
                            </p>
                            <div className="flex items-center space-x-4">
                              <Badge variant="secondary" className="bg-white/90 text-slate-700 shadow-sm">
                                Active
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none bg-white/90 border-cyan-300 hover:bg-cyan-50 hover:border-cyan-400 text-cyan-700 shadow-sm"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Schedule</span>
                            <span className="sm:hidden">Sched</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none bg-white/90 border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-700 shadow-sm"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Materials
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Assignments */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Upcoming Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                          <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{assignment.title}</p>
                          <p className="text-sm text-slate-600">{assignment.course}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                          <Badge
                            className={
                              assignment.status === "completed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : assignment.status === "in-progress"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }
                          >
                            {assignment.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      Welcome, {user?.name || 'Student'}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Your academic journey at a glance</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  Track your courses, assignments, and academic progress all in one place.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full justify-start h-10 border-blue-200 hover:border-blue-400 hover:bg-blue-50">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Calendar
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-10 border-purple-200 hover:border-purple-400 hover:bg-purple-50">
                    <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                    Grades
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-teal-50 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl text-slate-900">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold">Today's Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.slice(0, 2).map((course, index) => (
                  <div
                    key={course.id}
                    className="group flex justify-between items-center p-4 bg-gradient-to-r from-white to-teal-50 border border-teal-100 rounded-xl hover:border-teal-300 hover:shadow-md transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <span className="text-slate-900 font-semibold block">
                          {course.title}
                        </span>
                        <span className="text-xs text-slate-600 mt-1 block">
                          {course.schedule.room}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                        {course.schedule.time}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
