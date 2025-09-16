import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  School,
  BookOpen,
  Users,
  BarChart3,
  ArrowLeft,
  Plus,
  Clock,
  TrendingUp,
  LogOut,
  Settings,
  FileText,
  Calendar,
  Mail,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AttendanceManager from "@/components/AttendanceManager";
import CourseDetailsViewer from "@/components/CourseDetailsViewer";
import AttendanceHistoryManager from "@/components/AttendanceHistoryManager";
import GradeSubmissions from "@/components/GradeSubmissions";
import CourseMaterials from "@/components/CourseMaterials";
import AssignmentStatusTracker from "@/components/AssignmentStatusTracker";

interface DashboardData {
  stats: {
    activeClasses: number;
    totalStudents: number;
    pendingGrades: number;
    avgGrade: number;
    avgAttendance: number;
  };
  courses: Array<{
    id: string;
    title: string;
    description: string;
    studentCount: number;
    schedule: {
      days: string[];
      time: string;
      room: string;
    };
    semester: string;
  }>;
  recentSubmissions: Array<{
    assignmentTitle: string;
    course: string;
    studentName: string;
    submittedAt: string;
  }>;
  todaySchedule: Array<{
    id: string;
    title: string;
    time: string;
    room: string;
  }>;
}

export default function TeacherDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showNewClassDialog, setShowNewClassDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
    const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
      const [showTakeAttendanceDialog, setShowTakeAttendanceDialog] = useState(false);
  const [showCourseDetailsDialog, setShowCourseDetailsDialog] = useState(false);
  const [showManageAttendanceDialog, setShowManageAttendanceDialog] = useState(false);
    const [showGradeSubmissionsDialog, setShowGradeSubmissionsDialog] = useState(false);
    const [showCourseMaterialsDialog, setShowCourseMaterialsDialog] = useState(false);
  const [showAssignmentStatusDialog, setShowAssignmentStatusDialog] = useState(false);
    const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState<{id: string, name: string} | null>(null);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<{id: string, name: string} | null>(null);
  const [selectedCourseForManage, setSelectedCourseForManage] = useState<{id: string, name: string} | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [newClassForm, setNewClassForm] = useState({
    title: "",
    description: "",
    room: "",
    time: "",
    days: [] as string[],
    semester: "Fall 2024",
  });

    const [newAssignmentForm, setNewAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    totalPoints: "",
    courseId: "",
    type: "",
    instructions: "",
    allowLateSubmissions: true,
    latePenalty: "",
  });

    const [addStudentForm, setAddStudentForm] = useState({
    studentEmail: "",
    courseId: "",
  });

  const [takeAttendanceForm, setTakeAttendanceForm] = useState({
    courseId: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!user || user.role !== "teacher") {
      navigate("/login");
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/teacher/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

    const handleCreateClass = async () => {
    if (!newClassForm.title || !newClassForm.description || !newClassForm.room || !newClassForm.time) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newClassForm.title,
          description: newClassForm.description,
          room: newClassForm.room,
          time: newClassForm.time,
          days: newClassForm.days.length > 0 ? newClassForm.days : ["Monday"],
          semester: newClassForm.semester,
        }),
      });

            setIsCreating(true);

      if (response.ok) {
        const result = await response.json();
        console.log("Course created successfully:", result);

        // Show success notification
        setNotification({
          message: `Course "${newClassForm.title}" created successfully!`,
          type: 'success'
        });

        // Reset form
        setNewClassForm({
          title: "",
          description: "",
          room: "",
          time: "",
          days: [],
          semester: "Fall 2024",
        });

        // Close dialog
        setShowNewClassDialog(false);

        // Refresh dashboard data to update counts
        await fetchDashboardData();

        // Hide notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);

      } else {
        const error = await response.json();
        setNotification({
          message: `Error creating course: ${error.message}`,
          type: 'error'
        });
        setTimeout(() => setNotification(null), 5000);
      }
        } catch (error) {
      console.error("Error creating course:", error);
      setNotification({
        message: "Failed to create course. Please try again.",
        type: 'error'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsCreating(false);
    }
  };

    const handleCreateAssignment = async () => {
    if (!newAssignmentForm.title || !newAssignmentForm.courseId || !newAssignmentForm.dueDate || !newAssignmentForm.totalPoints || !newAssignmentForm.type) {
      setNotification({
        message: "Please fill in all required fields",
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const response = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newAssignmentForm.title,
          description: newAssignmentForm.description,
          instructions: newAssignmentForm.instructions,
          dueDate: newAssignmentForm.dueDate,
          dueTime: newAssignmentForm.dueTime,
          totalPoints: parseInt(newAssignmentForm.totalPoints),
          courseId: newAssignmentForm.courseId,
          type: newAssignmentForm.type,
          allowLateSubmissions: newAssignmentForm.allowLateSubmissions,
          latePenalty: newAssignmentForm.latePenalty ? parseInt(newAssignmentForm.latePenalty) : 0,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const selectedCourse = dashboardData?.courses.find(c => c.id === newAssignmentForm.courseId);

        setNotification({
          message: `Assignment "${newAssignmentForm.title}" created successfully for "${selectedCourse?.title}"!`,
          type: 'success'
        });

        setNewAssignmentForm({
          title: "",
          description: "",
          dueDate: "",
          dueTime: "",
          totalPoints: "",
          courseId: "",
          type: "",
          instructions: "",
          allowLateSubmissions: true,
          latePenalty: "",
        });

        setShowAssignmentDialog(false);
        setTimeout(() => setNotification(null), 3000);
      } else {
        const error = await response.json();
        setNotification({
          message: `Error creating assignment: ${error.message}`,
          type: 'error'
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      setNotification({
        message: "Failed to create assignment. Please try again.",
        type: 'error'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

    const handleAddStudent = async () => {
    if (!addStudentForm.studentEmail || !addStudentForm.courseId) {
      setNotification({
        message: "Please provide both student email and select a course",
        type: 'error'
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Extract student name from email (before @)
    const studentName = addStudentForm.studentEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = studentName.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    try {
      const response = await fetch(`/api/teacher/courses/${addStudentForm.courseId}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentEmail: addStudentForm.studentEmail,
          studentName: formattedName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Student added successfully:", result);

        // Show success notification
        setNotification({
          message: `Student "${formattedName}" added to "${result.course.title}" successfully!`,
          type: 'success'
        });

        // Reset form
        setAddStudentForm({
          studentEmail: "",
          courseId: "",
        });

        // Close dialog
        setShowAddStudentDialog(false);

        // Refresh dashboard data to update counts
        await fetchDashboardData();

        // Hide notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);

      } else {
        const error = await response.json();
        setNotification({
          message: `Error adding student: ${error.message}`,
          type: 'error'
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error("Error adding student:", error);
      setNotification({
        message: "Failed to add student. Please try again.",
        type: 'error'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

    const handleViewSubmissions = (courseId: string) => {
    const course = dashboardData?.courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourseForDetails({ id: course.id, name: course.title });
      setShowCourseDetailsDialog(true);
    }
  };

  const handleCloseCourseDetails = () => {
    setShowCourseDetailsDialog(false);
    setSelectedCourseForDetails(null);
  };

    const handleGradeSubmissions = () => {
    setShowGradeSubmissionsDialog(true);
  };

  const handleCloseGradeSubmissions = () => {
    setShowGradeSubmissionsDialog(false);
  };

    const handleManageStudents = (courseId?: string) => {
    const course = dashboardData?.courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourseForManage({ id: course.id, name: course.title });
      setShowManageAttendanceDialog(true);
    }
  };

  const handleCloseManageAttendance = () => {
    setShowManageAttendanceDialog(false);
    setSelectedCourseForManage(null);
  };

    const handleCourseMaterials = () => {
    setShowCourseMaterialsDialog(true);
  };

    const handleCloseCourseMaterials = () => {
    setShowCourseMaterialsDialog(false);
  };

  const handleOpenAssignmentStatus = () => {
    setShowAssignmentStatusDialog(true);
  };

  const handleCloseAssignmentStatus = () => {
    setShowAssignmentStatusDialog(false);
  };

    const handleAttendance = (courseId: string, courseName: string) => {
    setSelectedCourseForAttendance({ id: courseId, name: courseName });
    setShowAttendanceDialog(true);
  };

    const handleCloseAttendance = () => {
    setShowAttendanceDialog(false);
    setSelectedCourseForAttendance(null);
  };

  const handleTakeAttendanceFromQuickActions = () => {
    setShowTakeAttendanceDialog(true);
  };

  const handleCloseTakeAttendance = () => {
    setShowTakeAttendanceDialog(false);
    setTakeAttendanceForm({
      courseId: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleStartAttendance = () => {
    if (!takeAttendanceForm.courseId) {
      setNotification({
        message: "Please select a course to take attendance",
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const selectedCourse = dashboardData?.courses.find(c => c.id === takeAttendanceForm.courseId);
    if (selectedCourse) {
      setSelectedCourseForAttendance({ id: selectedCourse.id, name: selectedCourse.title });
      setShowTakeAttendanceDialog(false);
      setShowAttendanceDialog(true);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

            if (response.ok) {
        const result = await response.json();
        console.log("Course deleted successfully:", result);

        // Show success notification
        setNotification({
          message: `Course "${courseName}" deleted successfully!`,
          type: 'success'
        });

        // Refresh dashboard data to update counts
        await fetchDashboardData();

        // Hide notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);

      } else {
        const error = await response.json();
        setNotification({
          message: `Error deleting course: ${error.message}`,
          type: 'error'
        });
        setTimeout(() => setNotification(null), 5000);
      }
        } catch (error) {
      console.error("Error deleting course:", error);
      setNotification({
        message: "Failed to delete course. Please try again.",
        type: 'error'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-professional-gray via-blue-50 to-professional-blue/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teacher"></div>
          <p className="mt-4 text-professional-slate">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-professional-gray via-blue-50 to-professional-blue/10">
        <div className="text-center">
          <p className="text-professional-slate">
            Failed to load dashboard data
          </p>
          <Button
            onClick={fetchDashboardData}
            className="mt-4 bg-teacher hover:bg-teacher-dark"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-600">Back</span>
              </Link>
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Teacher Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-600">
                Welcome, {user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Good morning, {user?.name?.split(" ")[1] || user?.name}!
          </h2>
          <p className="text-slate-600">
            Manage your classes and track student progress.
          </p>
        </div>

        {/* Stats Cards - Exact match to image */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Active Classes</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {dashboardData.stats.activeClasses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Students</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {dashboardData.stats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pending Grades</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {dashboardData.stats.pendingGrades}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Avg Grade</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {dashboardData.stats.avgGrade}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Avg Attendance</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {dashboardData.stats.avgAttendance}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Class Overview */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900">My Classes</CardTitle>
                  <Dialog
                    open={showNewClassDialog}
                    onOpenChange={setShowNewClassDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Class
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Class</DialogTitle>
                        <DialogDescription>
                          Add a new class to your teaching schedule.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">
                            Title
                          </Label>
                          <Input
                            id="title"
                            value={newClassForm.title}
                            onChange={(e) =>
                              setNewClassForm({
                                ...newClassForm,
                                title: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Course title"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={newClassForm.description}
                            onChange={(e) =>
                              setNewClassForm({
                                ...newClassForm,
                                description: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Course description"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="room" className="text-right">
                            Room
                          </Label>
                          <Input
                            id="room"
                            value={newClassForm.room}
                            onChange={(e) =>
                              setNewClassForm({
                                ...newClassForm,
                                room: e.target.value,
                              })
                            }
                                                        className="col-span-3"
                            placeholder="Room number"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="time" className="text-right">
                            Time
                          </Label>
                          <Input
                            id="time"
                            value={newClassForm.time}
                            onChange={(e) =>
                              setNewClassForm({
                                ...newClassForm,
                                time: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="e.g., 10:00 AM"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="semester" className="text-right">
                            Semester
                          </Label>
                          <Input
                            id="semester"
                            value={newClassForm.semester}
                            onChange={(e) =>
                              setNewClassForm({
                                ...newClassForm,
                                semester: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="e.g., Fall 2024"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowNewClassDialog(false)}
                        >
                          Cancel
                        </Button>
                                                <Button
                          onClick={handleCreateClass}
                          disabled={isCreating}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          {isCreating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating...
                            </>
                          ) : (
                            "Create Class"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.courses.map((course, index) => {
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
                              {course.studentCount} students • {course.schedule.days.join(", ")} {course.schedule.time} • {course.schedule.room}
                            </p>
                            <div className="flex items-center space-x-4">
                              <Badge variant="secondary" className="bg-white/90 text-slate-700 shadow-sm">
                                Active
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {course.semester}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAttendance(course.id, course.title)}
                            className="flex-1 sm:flex-none bg-white/90 border-cyan-300 hover:bg-cyan-50 hover:border-cyan-400 text-cyan-700 shadow-sm"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Attendance</span>
                            <span className="sm:hidden">Attend</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSubmissions(course.id)}
                            className="flex-1 sm:flex-none bg-white/90 border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-700 shadow-sm"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageStudents(course.id)}
                            className="flex-1 sm:flex-none bg-white/90 border-orange-300 hover:bg-orange-50 hover:border-orange-400 text-orange-700 shadow-sm"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            className="flex-1 sm:flex-none bg-white/90 border-red-300 hover:bg-red-50 hover:border-red-400 text-red-600 shadow-sm"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                            <span className="sm:hidden">Del</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentSubmissions.map((submission, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {submission.studentName} submitted {submission.assignmentTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {submission.course} • Just now
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGradeSubmissions}
                        className="border-blue-300 hover:bg-blue-50"
                      >
                        Grade
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
                        {/* Quick Actions - Enhanced Design */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-blue-50 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                                <CardTitle className="text-xl text-slate-900 pl-3">
                  Quick Actions
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">Manage your courses, students, and assignments efficiently</p>
              </CardHeader>
              <CardContent className="space-y-4">
                                <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="group w-full justify-start h-14 bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100 text-slate-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                      size="lg"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-900">Create Assignment</div>
                        <div className="text-xs text-slate-600 mt-0.5">Add new assignments for students</div>
                      </div>
                    </Button>
                  </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-6">
                      <DialogTitle className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="text-xl font-semibold text-slate-900">Create Assignment</span>
                          <p className="text-sm text-slate-600 font-normal mt-1">
                            Create a comprehensive assignment for your students
                          </p>
                        </div>
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="assignment-title" className="text-sm font-medium text-slate-700">
                              Assignment Title *
                            </Label>
                            <Input
                              id="assignment-title"
                              placeholder="Enter assignment title"
                              value={newAssignmentForm.title}
                              onChange={(e) =>
                                setNewAssignmentForm({
                                  ...newAssignmentForm,
                                  title: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="assignment-course" className="text-sm font-medium text-slate-700">
                              Course *
                            </Label>
                            <Select
                              value={newAssignmentForm.courseId}
                              onValueChange={(value) =>
                                setNewAssignmentForm({
                                  ...newAssignmentForm,
                                  courseId: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select course" />
                              </SelectTrigger>
                              <SelectContent>
                                {dashboardData?.courses.map((course) => (
                                  <SelectItem key={course.id} value={course.id}>
                                    <div className="flex items-center space-x-2">
                                      <BookOpen className="w-4 h-4 text-blue-600" />
                                      <span>{course.title}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="assignment-type" className="text-sm font-medium text-slate-700">
                              Assignment Type *
                            </Label>
                            <Select
                              value={newAssignmentForm.type}
                              onValueChange={(value) =>
                                setNewAssignmentForm({
                                  ...newAssignmentForm,
                                  type: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="homework">Homework</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="exam">Exam</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                                <SelectItem value="lab">Lab Assignment</SelectItem>
                                <SelectItem value="essay">Essay</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="assignment-points" className="text-sm font-medium text-slate-700">
                              Total Points *
                            </Label>
                            <Input
                              id="assignment-points"
                              type="number"
                              placeholder="100"
                              value={newAssignmentForm.totalPoints}
                              onChange={(e) =>
                                setNewAssignmentForm({
                                  ...newAssignmentForm,
                                  totalPoints: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Due Date & Time */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Due Date & Time</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="assignment-due-date" className="text-sm font-medium text-slate-700">
                              Due Date *
                            </Label>
                            <Input
                              id="assignment-due-date"
                              type="date"
                              value={newAssignmentForm.dueDate}
                              onChange={(e) =>
                                setNewAssignmentForm({
                                  ...newAssignmentForm,
                                  dueDate: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="assignment-due-time" className="text-sm font-medium text-slate-700">
                              Due Time *
                            </Label>
                            <Input
                              id="assignment-due-time"
                              type="time"
                              value={newAssignmentForm.dueTime}
                              onChange={(e) =>
                                setNewAssignmentForm({
                                  ...newAssignmentForm,
                                  dueTime: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description & Instructions */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Description & Instructions</h3>

                        <div className="space-y-2">
                          <Label htmlFor="assignment-description" className="text-sm font-medium text-slate-700">
                            Short Description
                          </Label>
                          <Input
                            id="assignment-description"
                            placeholder="Brief description of the assignment"
                            value={newAssignmentForm.description}
                            onChange={(e) =>
                              setNewAssignmentForm({
                                ...newAssignmentForm,
                                description: e.target.value,
                              })
                            }
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assignment-instructions" className="text-sm font-medium text-slate-700">
                            Detailed Instructions
                          </Label>
                          <Textarea
                            id="assignment-instructions"
                            placeholder="Provide detailed instructions for students..."
                            value={newAssignmentForm.instructions}
                            onChange={(e) =>
                              setNewAssignmentForm({
                                ...newAssignmentForm,
                                instructions: e.target.value,
                              })
                            }
                            className="w-full min-h-[120px] resize-y"
                          />
                        </div>
                      </div>

                      {/* Submission Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Submission Settings</h3>

                        <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border">
                          <input
                            type="checkbox"
                            id="allow-late"
                            checked={newAssignmentForm.allowLateSubmissions}
                            onChange={(e) =>
                              setNewAssignmentForm({
                                ...newAssignmentForm,
                                allowLateSubmissions: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <Label htmlFor="allow-late" className="text-sm font-medium text-slate-700">
                              Allow Late Submissions
                            </Label>
                            <p className="text-xs text-slate-600 mt-1">
                              Students can submit after the due date with penalty
                            </p>
                          </div>
                        </div>

                        {newAssignmentForm.allowLateSubmissions && (
                          <div className="space-y-2">
                            <Label htmlFor="late-penalty" className="text-sm font-medium text-slate-700">
                              Late Penalty (% per day)
                            </Label>
                            <Input
                              id="late-penalty"
                              type="number"
                              placeholder="10"
                              value={newAssignmentForm.latePenalty}
                              onChange={(e) =>
                                setNewAssignmentForm({
                                  ...newAssignmentForm,
                                  latePenalty: e.target.value,
                                })
                              }
                              className="w-full md:w-48"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAssignmentDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateAssignment}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        Create Assignment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                                <Button
                  variant="outline"
                  className="group w-full justify-start h-14 bg-gradient-to-r from-white to-green-50 border-2 border-green-200 hover:border-green-400 hover:from-green-50 hover:to-green-100 text-slate-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  size="lg"
                  onClick={handleGradeSubmissions}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4 group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">Grade Submissions</div>
                    <div className="text-xs text-slate-600 mt-0.5">Review and grade student work</div>
                  </div>
                </Button>

                                <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="group w-full justify-start h-14 bg-gradient-to-r from-white to-purple-50 border-2 border-purple-200 hover:border-purple-400 hover:from-purple-50 hover:to-purple-100 text-slate-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                      size="lg"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-900">Add Student</div>
                        <div className="text-xs text-slate-600 mt-0.5">Enroll new students to courses</div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Student to Course</DialogTitle>
                      <DialogDescription>
                        Add a student to one of your courses by email.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="student-email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="student-email"
                          type="email"
                          value={addStudentForm.studentEmail}
                          onChange={(e) =>
                            setAddStudentForm({
                              ...addStudentForm,
                              studentEmail: e.target.value,
                            })
                          }
                          className="col-span-3"
                                                    placeholder="student@example.com"
                        />
                        <div className="col-span-4 text-xs text-slate-500 mt-1">
                          Student name will be auto-generated from email
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="student-course" className="text-right">
                          Course
                        </Label>
                        <Select
                          value={addStudentForm.courseId}
                          onValueChange={(value) =>
                            setAddStudentForm({
                              ...addStudentForm,
                              courseId: value,
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {dashboardData.courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddStudentDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddStudent}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        Add Student
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                                <Button
                  variant="outline"
                  className="group w-full justify-start h-14 bg-gradient-to-r from-white to-orange-50 border-2 border-orange-200 hover:border-orange-400 hover:from-orange-50 hover:to-orange-100 text-slate-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  size="lg"
                                    onClick={handleCourseMaterials}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-4 group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">Course Materials</div>
                    <div className="text-xs text-slate-600 mt-0.5">Manage course resources</div>
                  </div>
                </Button>

                                <Button
                  variant="outline"
                  className="group w-full justify-start h-14 bg-gradient-to-r from-white to-cyan-50 border-2 border-cyan-200 hover:border-cyan-400 hover:from-cyan-50 hover:to-cyan-100 text-slate-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  size="lg"
                  onClick={handleTakeAttendanceFromQuickActions}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mr-4 group-hover:from-cyan-600 group-hover:to-cyan-700 transition-all duration-300">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">Take Attendance</div>
                    <div className="text-xs text-slate-600 mt-0.5">Mark student attendance</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="group w-full justify-start h-14 bg-gradient-to-r from-white to-purple-50 border-2 border-purple-200 hover:border-purple-400 hover:from-purple-50 hover:to-purple-100 text-slate-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  size="lg"
                  onClick={handleOpenAssignmentStatus}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">Assignment Status</div>
                    <div className="text-xs text-slate-600 mt-0.5">Track student progress</div>
                  </div>
                </Button>
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
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">Your classes and events for today</p>
              </CardHeader>
              <CardContent className="space-y-4">
                                {dashboardData.todaySchedule.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className="group flex justify-between items-center p-4 bg-gradient-to-r from-white to-teal-50 border border-teal-100 rounded-xl hover:border-teal-300 hover:shadow-md transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <span className="text-slate-900 font-semibold block">
                          {schedule.title}
                        </span>
                        <span className="text-xs text-slate-600 mt-1 block">
                          {schedule.room}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                        {schedule.time}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
                    </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        } transition-all duration-300`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

                  {/* Take Attendance Course Selection Dialog */}
      <Dialog open={showTakeAttendanceDialog} onOpenChange={handleCloseTakeAttendance}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-semibold text-slate-900">Take Attendance</span>
                <p className="text-sm text-slate-600 font-normal mt-1">
                  Select a course and date to take attendance for your students
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Course Selection */}
            <div className="space-y-3">
              <Label htmlFor="attendance-course" className="text-sm font-medium text-slate-700">
                Select Course
              </Label>
              <Select
                value={takeAttendanceForm.courseId}
                onValueChange={(value) =>
                  setTakeAttendanceForm({
                    ...takeAttendanceForm,
                    courseId: value,
                  })
                }
              >
                <SelectTrigger className="w-full h-12 border-2 border-slate-200 hover:border-cyan-300 focus:border-cyan-500 transition-colors">
                  <SelectValue placeholder="Choose a course for attendance" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {dashboardData?.courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} className="p-3">
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{course.title}</p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{course.studentCount} students</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{course.schedule.days.join(", ")} {course.schedule.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <Label htmlFor="attendance-date" className="text-sm font-medium text-slate-700">
                Select Date
              </Label>
              <Input
                id="attendance-date"
                type="date"
                value={takeAttendanceForm.date}
                onChange={(e) =>
                  setTakeAttendanceForm({
                    ...takeAttendanceForm,
                    date: e.target.value,
                  })
                }
                className="w-full h-12 border-2 border-slate-200 hover:border-cyan-300 focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Selected Course Preview */}
            {takeAttendanceForm.courseId && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-cyan-200 flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-2">Ready to Take Attendance</h3>
                    {(() => {
                      const course = dashboardData?.courses.find(c => c.id === takeAttendanceForm.courseId);
                      return course ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-slate-700">Course:</span>
                            <span className="text-sm text-slate-900">{course.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-slate-700">Students:</span>
                            <span className="text-sm text-slate-900">{course.studentCount} enrolled</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-slate-700">Location:</span>
                            <span className="text-sm text-slate-900">{course.schedule.room}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-slate-700">Date:</span>
                            <span className="text-sm text-slate-900">
                              {new Date(takeAttendanceForm.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6">
            <Button
              variant="outline"
              onClick={handleCloseTakeAttendance}
              className="w-full sm:w-auto border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartAttendance}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
              disabled={!takeAttendanceForm.courseId}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Start Attendance
            </Button>
          </div>
        </DialogContent>
      </Dialog>

            {/* Course Details Viewer Dialog */}
      {selectedCourseForDetails && (
        <CourseDetailsViewer
          courseId={selectedCourseForDetails.id}
          courseName={selectedCourseForDetails.name}
          isOpen={showCourseDetailsDialog}
          onClose={handleCloseCourseDetails}
        />
      )}

            {/* Attendance History Manager Dialog */}
      {selectedCourseForManage && (
        <AttendanceHistoryManager
          courseId={selectedCourseForManage.id}
          courseName={selectedCourseForManage.name}
          isOpen={showManageAttendanceDialog}
          onClose={handleCloseManageAttendance}
        />
      )}

            {/* Grade Submissions Dialog */}
      <GradeSubmissions
        isOpen={showGradeSubmissionsDialog}
        onClose={handleCloseGradeSubmissions}
      />

            {/* Course Materials Dialog */}
      <CourseMaterials
        isOpen={showCourseMaterialsDialog}
        onClose={handleCloseCourseMaterials}
        courses={dashboardData?.courses || []}
      />

      {/* Assignment Status Tracker Dialog */}
      <AssignmentStatusTracker
        isOpen={showAssignmentStatusDialog}
        onClose={handleCloseAssignmentStatus}
      />

      {/* Attendance Manager Dialog */}
      {selectedCourseForAttendance && (
        <AttendanceManager
          courseId={selectedCourseForAttendance.id}
          courseName={selectedCourseForAttendance.name}
          isOpen={showAttendanceDialog}
          onClose={handleCloseAttendance}
        />
      )}
    </div>
  );
}
