import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  Save,
  User,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface GradeSubmissionsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  totalPoints: number;
  type: string;
  courseName: string;
  submissions: Submission[];
}

interface Submission {
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  grade?: number;
  feedback?: string;
}

export default function GradeSubmissions({ isOpen, onClose }: GradeSubmissionsProps) {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({
    grade: "",
    feedback: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchAssignments();
    }
  }, [isOpen]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teacher/assignments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Mock course names and submissions for demo
        const assignmentsWithDetails = data.assignments.map((assignment: any) => ({
          ...assignment,
          courseName: "Advanced Mathematics", // Mock course name
          submissions: [
            {
              studentId: "student1",
              studentName: "John Smith",
              submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              content: "Assignment submission content...",
            },
            {
              studentId: "student2",
              studentName: "Sarah Johnson",
              submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              content: "My submission for this assignment...",
              grade: 85,
              feedback: "Good work! Consider adding more details in section 2."
            },
            {
              studentId: "student3",
              studentName: "Mike Davis",
              submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              content: "Here is my completed assignment...",
            },
          ]
        }));
        setAssignments(assignmentsWithDetails);
      } else {
        console.error("Failed to fetch assignments");
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (studentId: string) => {
    if (!selectedAssignment || !gradeForm.grade) {
      alert("Please enter a grade");
      return;
    }

    setGrading(studentId);
    try {
      const response = await fetch(
        `/api/teacher/assignments/${selectedAssignment.id}/grade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            grade: parseInt(gradeForm.grade),
            feedback: gradeForm.feedback,
          }),
        }
      );

      if (response.ok) {
        // Update local state
        const updatedAssignments = assignments.map(assignment => 
          assignment.id === selectedAssignment.id 
            ? {
                ...assignment,
                submissions: assignment.submissions.map(submission =>
                  submission.studentId === studentId
                    ? { ...submission, grade: parseInt(gradeForm.grade), feedback: gradeForm.feedback }
                    : submission
                )
              }
            : assignment
        );
        
        setAssignments(updatedAssignments);
        setSelectedAssignment(updatedAssignments.find(a => a.id === selectedAssignment.id) || null);
        
        setGradeForm({ grade: "", feedback: "" });
        alert("Grade submitted successfully!");
      } else {
        alert("Failed to submit grade");
      }
    } catch (error) {
      console.error("Error grading submission:", error);
      alert("Error submitting grade");
    } finally {
      setGrading(null);
    }
  };

  const getSubmissionStatus = (submission: Submission) => {
    if (submission.grade !== undefined) {
      return { status: "graded", color: "text-green-600 bg-green-50 border-green-200" };
    }
    return { status: "pending", color: "text-orange-600 bg-orange-50 border-orange-200" };
  };

  const getGradeColor = (grade: number, totalPoints: number) => {
    const percentage = (grade / totalPoints) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getAssignmentStats = (assignment: Assignment) => {
    const total = assignment.submissions.length;
    const graded = assignment.submissions.filter(s => s.grade !== undefined).length;
    const pending = total - graded;
    const avgGrade = assignment.submissions
      .filter(s => s.grade !== undefined)
      .reduce((sum, s) => sum + (s.grade || 0), 0) / (graded || 1);

    return { total, graded, pending, avgGrade: graded > 0 ? avgGrade : 0 };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-semibold text-slate-900">Grade Submissions</span>
              <p className="text-sm text-slate-600 font-normal mt-1">
                Review and grade student assignment submissions
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading assignments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assignment List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Assignments</h3>
              
              {assignments.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium mb-2">No assignments found</p>
                    <p className="text-sm text-slate-500">Create assignments to see them here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const stats = getAssignmentStats(assignment);
                    const isSelected = selectedAssignment?.id === assignment.id;
                    
                    return (
                      <Card
                        key={assignment.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected 
                            ? "border-green-300 bg-green-50 shadow-md" 
                            : "border-slate-200 hover:border-green-200"
                        }`}
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-slate-900 truncate">
                                {assignment.title}
                              </h4>
                              <p className="text-sm text-slate-600">{assignment.courseName}</p>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <Badge variant="outline" className="bg-white/80">
                                {assignment.type}
                              </Badge>
                              <span className="text-slate-500">
                                {assignment.totalPoints} pts
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-semibold text-green-600">{stats.graded}</div>
                                <div className="text-slate-600">Graded</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-semibold text-orange-600">{stats.pending}</div>
                                <div className="text-slate-600">Pending</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submission Details */}
            <div className="lg:col-span-2">
              {selectedAssignment ? (
                <div className="space-y-6">
                  {/* Assignment Header */}
                  <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-6 h-6 text-green-600" />
                          <div>
                            <span className="text-green-900">{selectedAssignment.title}</span>
                            <p className="text-sm text-green-700 font-normal mt-1">
                              {selectedAssignment.courseName}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {selectedAssignment.totalPoints} Points
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-slate-900">
                            {getAssignmentStats(selectedAssignment).total}
                          </div>
                          <div className="text-slate-600">Total Submissions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">
                            {getAssignmentStats(selectedAssignment).graded}
                          </div>
                          <div className="text-slate-600">Graded</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">
                            {getAssignmentStats(selectedAssignment).pending}
                          </div>
                          <div className="text-slate-600">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">
                            {getAssignmentStats(selectedAssignment).avgGrade.toFixed(1)}
                          </div>
                          <div className="text-slate-600">Avg Grade</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submissions */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-900">Student Submissions</h4>
                    
                    {selectedAssignment.submissions.map((submission) => {
                      const status = getSubmissionStatus(submission);
                      const isGrading = grading === submission.studentId;
                      
                      return (
                        <Card key={submission.studentId} className="border-slate-200">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* Student Info */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {submission.studentName}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  {submission.grade !== undefined && (
                                    <div className="text-right">
                                      <div className={`text-lg font-bold ${getGradeColor(submission.grade, selectedAssignment.totalPoints)}`}>
                                        {submission.grade}/{selectedAssignment.totalPoints}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {Math.round((submission.grade / selectedAssignment.totalPoints) * 100)}%
                                      </div>
                                    </div>
                                  )}
                                  
                                  <Badge className={`${status.color} border`}>
                                    {status.status}
                                  </Badge>
                                </div>
                              </div>

                              {/* Submission Content */}
                              <div className="p-4 bg-slate-50 rounded-lg border">
                                <p className="text-sm text-slate-700">{submission.content}</p>
                              </div>

                              {/* Existing Feedback */}
                              {submission.feedback && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-sm font-medium text-blue-900 mb-1">Feedback:</p>
                                  <p className="text-sm text-blue-700">{submission.feedback}</p>
                                </div>
                              )}

                              {/* Grading Form */}
                              {submission.grade === undefined && (
                                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                  <h5 className="font-medium text-green-900">Grade Submission</h5>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-slate-700">
                                        Grade (out of {selectedAssignment.totalPoints})
                                      </Label>
                                      <Input
                                        type="number"
                                        placeholder="85"
                                        value={gradeForm.grade}
                                        onChange={(e) => setGradeForm({...gradeForm, grade: e.target.value})}
                                        max={selectedAssignment.totalPoints}
                                        min="0"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">
                                      Feedback (optional)
                                    </Label>
                                    <Textarea
                                      placeholder="Provide feedback for the student..."
                                      value={gradeForm.feedback}
                                      onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                  
                                  <Button
                                    onClick={() => handleGradeSubmission(submission.studentId)}
                                    disabled={isGrading || !gradeForm.grade}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {isGrading ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Submit Grade
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Card className="border-slate-200 h-full flex items-center justify-center">
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium mb-2">Select an Assignment</p>
                    <p className="text-sm text-slate-500">
                      Choose an assignment from the list to view and grade submissions
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
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
