import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  BookOpen,
  MapPin,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CourseDetailsProps {
  courseId: string;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface CourseDetails {
  course: {
    id: string;
    title: string;
    description: string;
    schedule: {
      days: string[];
      time: string;
      room: string;
    };
    semester: string;
    studentCount: number;
  };
  attendanceStats: {
    totalSessions: number;
    averageAttendance: number;
    highestAttendance: number;
    lowestAttendance: number;
  };
  recentSessions: Array<{
    date: string;
    presentCount: number;
    absentCount: number;
    totalStudents: number;
    attendanceRate: number;
  }>;
  students: Array<{
    id: string;
    name: string;
    email: string;
    attendanceRate: number;
    totalPresent: number;
    totalAbsent: number;
    totalSessions: number;
  }>;
}

export default function CourseDetailsViewer({
  courseId,
  courseName,
  isOpen,
  onClose,
}: CourseDetailsProps) {
  const { token } = useAuth();
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourseDetails();
    }
  }, [isOpen, courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/courses/${courseId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourseDetails(data);
      } else {
        console.error("Failed to fetch course details");
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (rate >= 75) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 90) return <TrendingUp className="w-4 h-4" />;
    if (rate >= 75) return <BarChart3 className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Course Details - {courseName}</span>
          </DialogTitle>
          <DialogDescription>
            Comprehensive view of course statistics and student attendance data.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading course details...</p>
          </div>
        ) : courseDetails ? (
          <div className="space-y-6">
            {/* Course Information */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-blue-900">Course Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Course Title</p>
                      <p className="text-slate-900 font-semibold">{courseDetails.course.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Enrolled Students</p>
                      <p className="text-slate-900 font-semibold">{courseDetails.course.studentCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Schedule</p>
                      <p className="text-slate-900 font-semibold">
                        {courseDetails.course.schedule.days.join(", ")} at {courseDetails.course.schedule.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Room</p>
                      <p className="text-slate-900 font-semibold">{courseDetails.course.schedule.room}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Semester</p>
                      <p className="text-slate-900 font-semibold">{courseDetails.course.semester}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {courseDetails.attendanceStats.averageAttendance}%
                  </div>
                  <div className="text-sm text-slate-600">Average Attendance</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {courseDetails.attendanceStats.totalSessions}
                  </div>
                  <div className="text-sm text-slate-600">Total Sessions</div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">
                    {courseDetails.attendanceStats.highestAttendance}%
                  </div>
                  <div className="text-sm text-slate-600">Highest Attendance</div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">
                    {courseDetails.attendanceStats.lowestAttendance}%
                  </div>
                  <div className="text-sm text-slate-600">Lowest Attendance</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-slate-700" />
                  <span>Recent Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseDetails.recentSessions.map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                          <Calendar className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {new Date(session.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-600">
                            {session.presentCount} present, {session.absentCount} absent
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`${getAttendanceColor(session.attendanceRate)} border`}
                        >
                          {getAttendanceIcon(session.attendanceRate)}
                          <span className="ml-1">{session.attendanceRate}%</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-slate-700" />
                  <span>Student Attendance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseDetails.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{student.name}</p>
                          <p className="text-sm text-slate-600">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-slate-600">
                            {student.totalPresent}/{student.totalSessions} sessions
                          </p>
                          <p className="text-xs text-slate-500">
                            {student.totalAbsent} absences
                          </p>
                        </div>
                        <Badge
                          className={`${getAttendanceColor(student.attendanceRate)} border min-w-[70px] justify-center`}
                        >
                          {student.attendanceRate}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-2">No course details available</p>
            <p className="text-sm text-slate-500">Unable to load course information</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
