import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  Calendar,
  Send,
  Save,
  Eye,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  BookOpen,
  Target,
  Timer,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AssignmentWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  totalPoints: number;
  type: string;
  courseName: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'overdue';
  timeSpent: number; // in minutes
  startedAt?: string;
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  allowLateSubmissions: boolean;
  draft?: string;
}

export default function AssignmentWorkspace({ isOpen, onClose }: AssignmentWorkspaceProps) {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [submissionContent, setSubmissionContent] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAssignments();
    }
  }, [isOpen]);

  // Timer for tracking time spent on assignment
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && selectedAssignment) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, selectedAssignment]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/assignments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      } else {
        console.error("Failed to fetch assignments");
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const startAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/student/assignments/${assignmentId}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsTimerRunning(true);
        // Update assignment status locally
        setAssignments(prev => 
          prev.map(assignment => 
            assignment.id === assignmentId 
              ? { ...assignment, status: 'in_progress' as const, startedAt: new Date().toISOString() }
              : assignment
          )
        );
        // Update selected assignment if it's the current one
        if (selectedAssignment?.id === assignmentId) {
          setSelectedAssignment(prev => prev ? { ...prev, status: 'in_progress', startedAt: new Date().toISOString() } : null);
        }
      }
    } catch (error) {
      console.error("Error starting assignment:", error);
    }
  };

  const saveDraft = async () => {
    if (!selectedAssignment) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/student/assignments/${selectedAssignment.id}/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: submissionContent,
          timeSpent: timeSpent,
        }),
      });

      if (response.ok) {
        alert("Draft saved successfully!");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const submitAssignment = async () => {
    if (!selectedAssignment || !submissionContent.trim()) {
      alert("Please enter your submission content");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/student/assignments/${selectedAssignment.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: submissionContent,
          timeSpent: timeSpent,
        }),
      });

      if (response.ok) {
        setIsTimerRunning(false);
        alert("Assignment submitted successfully!");
        
        // Update assignment status
        setAssignments(prev => 
          prev.map(assignment => 
            assignment.id === selectedAssignment.id 
              ? { ...assignment, status: 'submitted' as const, submittedAt: new Date().toISOString() }
              : assignment
          )
        );
        
        setSelectedAssignment(null);
        setSubmissionContent("");
        setTimeSpent(0);
      } else {
        alert("Failed to submit assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'text-slate-600 bg-slate-100 border-slate-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'submitted':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'overdue':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'submitted':
        return <CheckCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const isOverdue = (dueDate: string, dueTime: string) => {
    const now = new Date();
    const deadline = new Date(`${dueDate}T${dueTime}`);
    return now > deadline;
  };

  const getTimeRemaining = (dueDate: string, dueTime: string) => {
    const now = new Date();
    const deadline = new Date(`${dueDate}T${dueTime}`);
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return "Overdue";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return "Due soon";
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return assignment.status === 'not_started' || assignment.status === 'in_progress';
    if (activeTab === "submitted") return assignment.status === 'submitted';
    if (activeTab === "overdue") return assignment.status === 'overdue' || isOverdue(assignment.dueDate, assignment.dueTime);
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-semibold text-slate-900">Assignment Workspace</span>
              <p className="text-sm text-slate-600 font-normal mt-1">
                Access and complete your assignments
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading assignments...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Assignment Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>All ({assignments.length})</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Pending ({assignments.filter(a => a.status === 'not_started' || a.status === 'in_progress').length})</span>
                </TabsTrigger>
                <TabsTrigger value="submitted" className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Submitted ({assignments.filter(a => a.status === 'submitted').length})</span>
                </TabsTrigger>
                <TabsTrigger value="overdue" className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Overdue ({assignments.filter(a => isOverdue(a.dueDate, a.dueTime)).length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredAssignments.length === 0 ? (
                  <Card className="border-slate-200">
                    <CardContent className="p-12 text-center">
                      <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium mb-2">No assignments found</p>
                      <p className="text-sm text-slate-500">
                        {activeTab === "all" ? "Your teachers haven't assigned any work yet" : `No ${activeTab} assignments`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredAssignments.map((assignment) => {
                      const overdue = isOverdue(assignment.dueDate, assignment.dueTime);
                      const timeRemaining = getTimeRemaining(assignment.dueDate, assignment.dueTime);
                      
                      return (
                        <Card 
                          key={assignment.id} 
                          className="border-slate-200 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedAssignment(assignment)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 truncate">
                                  {assignment.title}
                                </h4>
                                <p className="text-sm text-slate-600">{assignment.courseName}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {assignment.totalPoints} points • {assignment.type}
                                </p>
                              </div>
                              
                              <Badge className={`${getStatusColor(assignment.status)} border ml-2`}>
                                {getStatusIcon(assignment.status)}
                                <span className="ml-1 capitalize">
                                  {assignment.status.replace('_', ' ')}
                                </span>
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {/* Time Information */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-1 text-slate-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>
                                <span className={`font-medium ${overdue ? 'text-red-600' : 'text-slate-700'}`}>
                                  {timeRemaining}
                                </span>
                              </div>
                              
                              {/* Progress for in-progress assignments */}
                              {assignment.status === 'in_progress' && assignment.timeSpent > 0 && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-600">Time spent</span>
                                    <span className="font-medium">{formatTimeSpent(assignment.timeSpent)}</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                {assignment.status === 'not_started' && (
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startAssignment(assignment.id);
                                    }}
                                  >
                                    <PlayCircle className="w-4 h-4 mr-1" />
                                    Start
                                  </Button>
                                )}
                                
                                {assignment.status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAssignment(assignment);
                                    }}
                                  >
                                    <FileText className="w-4 h-4 mr-1" />
                                    Continue
                                  </Button>
                                )}
                                
                                {assignment.status === 'submitted' && (
                                  <div className="flex space-x-2 w-full">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                    {assignment.grade && (
                                      <Badge className="bg-green-100 text-green-800 px-3 py-1">
                                        {assignment.grade}/{assignment.totalPoints}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Assignment Work Dialog */}
        <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedAssignment && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-semibold">{selectedAssignment.title}</span>
                      <p className="text-sm text-slate-600 font-normal">
                        {selectedAssignment.courseName} • {selectedAssignment.totalPoints} points
                      </p>
                    </div>
                    {isTimerRunning && (
                      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                        <Timer className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {formatTimeSpent(timeSpent + selectedAssignment.timeSpent)}
                        </span>
                      </div>
                    )}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Assignment Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedAssignment.description && (
                          <p className="text-slate-700">{selectedAssignment.description}</p>
                        )}
                        {selectedAssignment.instructions && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-blue-900 whitespace-pre-wrap">
                              {selectedAssignment.instructions}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-slate-600 pt-2">
                          <span>Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()} at {selectedAssignment.dueTime}</span>
                          <span>•</span>
                          <span>{selectedAssignment.totalPoints} points</span>
                          <span>•</span>
                          <span className="capitalize">{selectedAssignment.type}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submission Area */}
                  {selectedAssignment.status !== 'submitted' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Your Submission</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="submission">Assignment Content</Label>
                            <Textarea
                              id="submission"
                              placeholder="Enter your assignment submission here..."
                              value={submissionContent}
                              onChange={(e) => setSubmissionContent(e.target.value)}
                              className="min-h-[200px] mt-2"
                            />
                          </div>
                          
                          <div className="flex justify-between">
                            <Button
                              onClick={saveDraft}
                              disabled={saving}
                              variant="outline"
                              className="border-blue-300 hover:bg-blue-50"
                            >
                              {saving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              Save Draft
                            </Button>
                            
                            <Button
                              onClick={submitAssignment}
                              disabled={submitting || !submissionContent.trim()}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {submitting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <Send className="w-4 h-4 mr-2" />
                              )}
                              Submit Assignment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Submitted Assignment View */}
                  {selectedAssignment.status === 'submitted' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Submitted Assignment</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-green-900">
                              Assignment submitted successfully on {new Date(selectedAssignment.submittedAt!).toLocaleString()}
                            </p>
                          </div>
                          
                          {selectedAssignment.grade && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-medium text-blue-900 mb-2">Grade</h4>
                              <div className="text-2xl font-bold text-blue-700">
                                {selectedAssignment.grade}/{selectedAssignment.totalPoints}
                              </div>
                              {selectedAssignment.feedback && (
                                <div className="mt-3">
                                  <h5 className="font-medium text-blue-900 mb-1">Feedback</h5>
                                  <p className="text-blue-700">{selectedAssignment.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

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
