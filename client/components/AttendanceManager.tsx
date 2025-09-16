import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  BarChart3,
  Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  id: string;
  name: string;
  email: string;
  status: "present" | "absent";
}

interface AttendanceData {
  course: {
    id: string;
    title: string;
    date: string;
  };
  students: Student[];
}

interface AttendanceManagerProps {
  courseId: string;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AttendanceManager({
  courseId,
  courseName,
  isOpen,
  onClose,
}: AttendanceManagerProps) {
  const { token } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<"all" | "present" | "absent">(
    "all",
  );

  useEffect(() => {
    if (isOpen && courseId) {
      fetchAttendance();
    }
  }, [isOpen, courseId, selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/teacher/courses/${courseId}/attendance?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

  const updateAttendance = (studentId: string, status: Student["status"]) => {
    if (!attendanceData) return;

    const updatedStudents = attendanceData.students.map((student) =>
      student.id === studentId ? { ...student, status } : student,
    );

    setAttendanceData({
      ...attendanceData,
      students: updatedStudents,
    });
  };

  const saveAttendance = async () => {
    if (!attendanceData) return;

    setSaving(true);
    try {
      const attendanceRecord = attendanceData.students.reduce(
        (acc, student) => {
          acc[student.id] = student.status;
          return acc;
        },
        {} as Record<string, string>,
      );

      const response = await fetch(
        `/api/teacher/courses/${courseId}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: selectedDate,
            attendance: attendanceRecord,
          }),
        },
      );

            if (response.ok) {
        const result = await response.json();
        console.log("Attendance saved successfully:", result);

        // Show success notification in the UI
        alert(`Attendance saved successfully!\n\nCourse: ${result.course.title}\nDate: ${result.date}\nRecords Updated: ${result.recordsUpdated}\n\nPresent: ${result.summary.present}\nAbsent: ${result.summary.absent}`);

        // Close the dialog after successful save
        onClose();
      } else {
        const error = await response.json();
        console.error("Failed to save attendance:", error);
        alert(`Failed to save attendance: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
    } finally {
      setSaving(false);
    }
  };

    const getStatusIcon = (status: Student["status"]) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

    const getStatusColor = (status: Student["status"]) => {
    switch (status) {
      case "present":
        return "bg-success/10 text-success border-success/30";
      case "absent":
        return "bg-destructive/10 text-destructive border-destructive/30";
    }
  };

  const getFilteredStudents = () => {
    if (!attendanceData) return [];
    if (filter === "all") return attendanceData.students;
    return attendanceData.students.filter(
      (student) => student.status === filter,
    );
  };

    const getAttendanceStats = () => {
    if (!attendanceData) return { present: 0, absent: 0, total: 0 };

    const stats = attendanceData.students.reduce(
      (acc, student) => {
        acc[student.status]++;
        acc.total++;
        return acc;
      },
      { present: 0, absent: 0, total: 0 },
    );

    return stats;
  };

  const stats = getAttendanceStats();
  const filteredStudents = getFilteredStudents();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-semibold text-slate-900">Attendance Management</span>
              <p className="text-sm text-slate-600 font-normal mt-1">{courseName}</p>
            </div>
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Mark attendance for your students on the selected date. All enrolled students are listed below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter">Filter Students</Label>
              <Select
                value={filter}
                onValueChange={(value: typeof filter) => setFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="present">Present Only</SelectItem>
                  <SelectItem value="absent">Absent Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attendance Stats */}
          {attendanceData && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border-professional-blue/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-professional-navy">
                    {stats.total}
                  </div>
                  <div className="text-sm text-professional-slate">
                    Total Students
                  </div>
                </CardContent>
              </Card>
              <Card className="border-success/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">
                    {stats.present}
                  </div>
                  <div className="text-sm text-professional-slate">Present</div>
                </CardContent>
              </Card>
              <Card className="border-destructive/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {stats.absent}
                  </div>
                  <div className="text-sm text-professional-slate">Absent</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Student List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-professional-blue mx-auto"></div>
              <p className="mt-4 text-professional-slate">
                Loading attendance data...
              </p>
            </div>
                    ) : attendanceData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Enrolled Students ({filteredStudents.length} of {stats.total})</span>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/30"
                    >
                      {Math.round((stats.present / stats.total) * 100)}%
                      Attendance
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-professional-gray rounded-lg border border-professional-blue/10"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(student.status)}
                        <div>
                          <p className="font-medium text-professional-navy">
                            {student.name}
                          </p>
                          <p className="text-sm text-professional-slate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`${getStatusColor(student.status)} capitalize`}
                        >
                          {student.status}
                        </Badge>
                        <div className="flex items-center space-x-1">
                                                    <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateAttendance(student.id, "present")
                            }
                            className={
                              student.status === "present"
                                ? "bg-success text-white border-success"
                                : "border-success/30 hover:bg-success hover:text-white"
                            }
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateAttendance(student.id, "absent")
                            }
                            className={
                              student.status === "absent"
                                ? "bg-destructive text-white border-destructive"
                                : "border-destructive/30 hover:bg-destructive hover:text-white"
                            }
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
                    ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-2">
                No students enrolled in this course
              </p>
              <p className="text-sm text-slate-500">
                Add students to this course to take attendance
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
                        <Button
              onClick={saveAttendance}
              disabled={saving || !attendanceData || attendanceData.students.length === 0}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {attendanceData?.students.length === 0 ? "No Students to Save" : "Save Attendance"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
