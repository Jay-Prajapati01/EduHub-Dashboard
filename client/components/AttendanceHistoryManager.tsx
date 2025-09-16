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
  Save,
  RefreshCw,
  AlertTriangle,
  User,
  Edit3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceHistoryManagerProps {
  courseId: string;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AttendanceRecord {
  date: string;
  students: Array<{
    id: string;
    name: string;
    email: string;
    status: "present" | "absent";
    canEdit: boolean;
  }>;
}

export default function AttendanceHistoryManager({
  courseId,
  courseName,
  isOpen,
  onClose,
}: AttendanceHistoryManagerProps) {
  const { token } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStudents, setEditingStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && courseId) {
      fetchAttendanceHistory();
    }
  }, [isOpen, courseId]);

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/teacher/courses/${courseId}/attendance/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAttendanceHistory(data.records || []);
        if (data.records && data.records.length > 0) {
          setSelectedDate(data.records[0].date);
          setSelectedRecord(data.records[0]);
        }
      } else {
        console.error("Failed to fetch attendance history");
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const record = attendanceHistory.find(r => r.date === date);
    setSelectedRecord(record || null);
    setEditingStudents(new Set());
  };

  const toggleStudentStatus = (studentId: string) => {
    if (!selectedRecord) return;

    const updatedRecord = {
      ...selectedRecord,
      students: selectedRecord.students.map(student =>
        student.id === studentId
          ? {
              ...student,
              status: student.status === "present" ? "absent" : "present" as "present" | "absent"
            }
          : student
      )
    };

    setSelectedRecord(updatedRecord);
    setEditingStudents(prev => new Set([...prev, studentId]));
  };

  const saveAttendanceChanges = async () => {
    if (!selectedRecord || editingStudents.size === 0) return;

    setSaving(true);
    try {
      const attendanceData = selectedRecord.students.reduce((acc, student) => {
        if (editingStudents.has(student.id)) {
          acc[student.id] = student.status;
        }
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch(
        `/api/teacher/courses/${courseId}/attendance/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: selectedRecord.date,
            attendance: attendanceData,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `Attendance updated successfully!\n\nDate: ${selectedRecord.date}\nUpdated Records: ${editingStudents.size}\n\nChanges saved for ${result.course.title}`
        );
        setEditingStudents(new Set());
        // Refresh the data
        await fetchAttendanceHistory();
      } else {
        const error = await response.json();
        alert(`Failed to update attendance: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Failed to update attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: "present" | "absent") => {
    return status === "present"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-red-100 text-red-800 border-red-300";
  };

  const getStatusIcon = (status: "present" | "absent") => {
    return status === "present" ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <XCircle className="w-4 h-4" />
    );
  };

  const getAttendanceStats = () => {
    if (!selectedRecord) return { present: 0, absent: 0, total: 0 };

    const stats = selectedRecord.students.reduce(
      (acc, student) => {
        acc[student.status]++;
        acc.total++;
        return acc;
      },
      { present: 0, absent: 0, total: 0 }
    );

    return stats;
  };

  const stats = getAttendanceStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit3 className="w-6 h-6 text-orange-600" />
            <span>Manage Attendance - {courseName}</span>
          </DialogTitle>
          <DialogDescription>
            View and correct attendance records for previous sessions. You can fix any mistakes made during attendance taking.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading attendance history...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-select">Select Date to Manage</Label>
                <Select value={selectedDate} onValueChange={handleDateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {attendanceHistory.map((record) => (
                      <SelectItem key={record.date} value={record.date}>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Stats for Selected Date */}
              {selectedRecord && (
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-xs text-slate-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                    <div className="text-xs text-slate-600">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                    <div className="text-xs text-slate-600">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((stats.present / stats.total) * 100)}%
                    </div>
                    <div className="text-xs text-slate-600">Rate</div>
                  </div>
                </div>
              )}
            </div>

            {/* Warning for Changes */}
            {editingStudents.size > 0 && (
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    You have {editingStudents.size} unsaved changes
                  </p>
                  <p className="text-sm text-yellow-700">
                    Click "Save Changes" to apply the attendance corrections.
                  </p>
                </div>
              </div>
            )}

            {/* Student List */}
            {selectedRecord ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>
                        Attendance for {new Date(selectedRecord.date).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {Math.round((stats.present / stats.total) * 100)}% Attendance
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedRecord.students.map((student) => (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                          editingStudents.has(student.id)
                            ? "bg-blue-50 border-blue-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                            <User className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{student.name}</p>
                            <p className="text-sm text-slate-600">{student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge
                            className={`${getStatusColor(student.status)} border`}
                          >
                            {getStatusIcon(student.status)}
                            <span className="ml-1 capitalize">{student.status}</span>
                          </Badge>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStudentStatus(student.id)}
                            className="border-orange-300 hover:bg-orange-50 text-orange-600"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Correct
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium mb-2">No attendance records found</p>
                <p className="text-sm text-slate-500">
                  Take attendance for this course to see records here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex space-x-2">
            {editingStudents.size > 0 && (
              <Button
                onClick={() => setEditingStudents(new Set())}
                variant="outline"
                className="border-slate-300"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Changes
              </Button>
            )}
            <Button
              onClick={saveAttendanceChanges}
              disabled={saving || editingStudents.size === 0}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingStudents.size > 0 ? `Save ${editingStudents.size} Changes` : "No Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
