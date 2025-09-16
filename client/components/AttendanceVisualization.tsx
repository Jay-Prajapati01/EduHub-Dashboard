import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  Award,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceRecord {
  date: string;
  course: string;
  status: "present" | "absent" | "late";
}

interface CourseAttendance {
  id: string;
  title: string;
  totalClasses: number;
  attended: number;
  absent: number;
  late: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  attended: number;
  total: number;
  percentage: number;
}

interface AttendanceData {
  studentId: string;
  studentName: string;
  overall: {
    totalClasses: number;
    attended: number;
    absent: number;
    late: number;
    percentage: number;
  };
  courses: CourseAttendance[];
  recentAttendance: AttendanceRecord[];
  monthlyData: MonthlyData[];
}

interface AttendanceVisualizationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AttendanceVisualization({
  isOpen,
  onClose,
}: AttendanceVisualizationProps) {
  const { token } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState<
    "overview" | "courses" | "calendar"
  >("overview");

  useEffect(() => {
    if (isOpen) {
      fetchAttendanceData();
    }
  }, [isOpen]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/attendance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      } else {
        console.error("Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "absent":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "late":
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-success/10 text-success border-success/30";
      case "absent":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "late":
        return "bg-warning/10 text-warning border-warning/30";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 80) return "text-warning";
    return "text-destructive";
  };

  const getPerformanceBarColor = (percentage: number) => {
    if (percentage >= 90) return "bg-success";
    if (percentage >= 80) return "bg-warning";
    return "bg-destructive";
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-professional-blue/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-professional-navy">
              {attendanceData?.overall.totalClasses || 0}
            </div>
            <div className="text-sm text-professional-slate">Total Classes</div>
          </CardContent>
        </Card>
        <Card className="border-success/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {attendanceData?.overall.attended || 0}
            </div>
            <div className="text-sm text-professional-slate">Attended</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {attendanceData?.overall.absent || 0}
            </div>
            <div className="text-sm text-professional-slate">Absent</div>
          </CardContent>
        </Card>
        <Card className="border-warning/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {attendanceData?.overall.late || 0}
            </div>
            <div className="text-sm text-professional-slate">Late</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Percentage */}
      <Card className="bg-gradient-to-r from-professional-gray to-white border-professional-blue/20">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Award className="w-8 h-8 text-professional-blue" />
            <div>
              <div className="text-3xl font-bold text-professional-navy">
                {attendanceData?.overall.percentage || 0}%
              </div>
              <div className="text-sm text-professional-slate">
                Overall Attendance Rate
              </div>
            </div>
          </div>
          <div className="w-full bg-professional-gray rounded-full h-3">
            <div
              className={`${getPerformanceBarColor(attendanceData?.overall.percentage || 0)} h-3 rounded-full transition-all duration-300`}
              style={{ width: `${attendanceData?.overall.percentage || 0}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-professional-blue" />
            <span>Monthly Attendance Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData?.monthlyData.map((month, index) => (
              <div key={month.month} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-professional-navy">
                  {month.month}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-professional-slate">
                      {month.attended}/{month.total} classes
                    </span>
                    <span
                      className={`text-sm font-medium ${getPerformanceColor(month.percentage)}`}
                    >
                      {month.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-professional-gray rounded-full h-2">
                    <div
                      className={`${getPerformanceBarColor(month.percentage)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${month.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-4">
      {attendanceData?.courses.map((course, index) => {
        const colors = [
          "border-blue-200",
          "border-green-200",
          "border-purple-200",
          "border-orange-200",
        ];
        const bgColors = [
          "from-blue-50 to-indigo-50",
          "from-green-50 to-emerald-50",
          "from-purple-50 to-violet-50",
          "from-orange-50 to-amber-50",
        ];

        return (
          <Card
            key={course.id}
            className={`${colors[index % 4]} bg-gradient-to-r ${bgColors[index % 4]}`}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-professional-navy">
                  {course.title}
                </CardTitle>
                <Badge className={`${getStatusColor("present")} font-medium`}>
                  {course.percentage}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-success">
                    {course.attended}
                  </div>
                  <div className="text-xs text-professional-slate">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-destructive">
                    {course.absent}
                  </div>
                  <div className="text-xs text-professional-slate">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning">
                    {course.late}
                  </div>
                  <div className="text-xs text-professional-slate">Late</div>
                </div>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2">
                <div
                  className={`${getPerformanceBarColor(course.percentage)} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${course.percentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderCalendar = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-professional-blue" />
          <span>Recent Attendance Records</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attendanceData?.recentAttendance.map((record, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-professional-gray rounded-lg border border-professional-blue/10"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(record.status)}
                <div>
                  <p className="font-medium text-professional-navy">
                    {record.course}
                  </p>
                  <p className="text-sm text-professional-slate">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge className={`${getStatusColor(record.status)} capitalize`}>
                {record.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-professional-blue" />
            <span>My Attendance Report</span>
          </DialogTitle>
          <DialogDescription>
            View your attendance statistics and track your academic progress.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-professional-blue mx-auto"></div>
            <p className="mt-4 text-professional-slate">
              Loading attendance data...
            </p>
          </div>
        ) : attendanceData ? (
          <div className="space-y-6">
            {/* View Switcher */}
            <div className="flex space-x-2">
              <Button
                variant={selectedView === "overview" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView("overview")}
                className={
                  selectedView === "overview" ? "bg-professional-blue" : ""
                }
              >
                <Target className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={selectedView === "courses" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView("courses")}
                className={
                  selectedView === "courses" ? "bg-professional-blue" : ""
                }
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                By Course
              </Button>
              <Button
                variant={selectedView === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView("calendar")}
                className={
                  selectedView === "calendar" ? "bg-professional-blue" : ""
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Recent Records
              </Button>
            </div>

            {/* Content */}
            {selectedView === "overview" && renderOverview()}
            {selectedView === "courses" && renderCourses()}
            {selectedView === "calendar" && renderCalendar()}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-professional-slate">
              No attendance data available
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
