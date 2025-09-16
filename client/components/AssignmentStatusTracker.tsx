import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  PlayCircle,
  FileText,
  Calendar,
  Target,
  AlertCircle,
  RefreshCw,
  Eye,
  Download,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AssignmentStatusTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AssignmentStatus {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  totalPoints: number;
  type: string;
  courseName: string;
  totalStudents: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  overdue: number;
  completionRate: number;
  averageTime: number; // in minutes
  recentActivity: Array<{
    studentName: string;
    action: 'started' | 'submitted' | 'saved_draft';
    timestamp: string;
  }>;
  studentDetails: Array<{
    id: string;
    name: string;
    email: string;
    status: 'not_started' | 'in_progress' | 'submitted' | 'overdue';
    startedAt?: string;
    submittedAt?: string;
    timeSpent?: number; // in minutes
    grade?: number;
  }>;
}

export default function AssignmentStatusTracker({ isOpen, onClose }: AssignmentStatusTrackerProps) {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentStatus[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAssignmentStatus();
      // Set up auto-refresh every 30 seconds for real-time updates
      const interval = setInterval(fetchAssignmentStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchAssignmentStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teacher/assignments/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      } else {
        console.error("Failed to fetch assignment status");
      }
    } catch (error) {
      console.error("Error fetching assignment status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAssignmentStatus();
    setRefreshing(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-semibold text-slate-900">Assignment Status Tracker</span>
                <p className="text-sm text-slate-600 font-normal mt-1">
                  Monitor real-time progress and student engagement
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-purple-300 hover:bg-purple-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading assignment status...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assignment List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Active Assignments</h3>
              
              {assignments.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium mb-2">No assignments found</p>
                    <p className="text-sm text-slate-500">Create assignments to track their progress</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const isSelected = selectedAssignment?.id === assignment.id;
                    const isOverdue = new Date(assignment.dueDate) < new Date();
                    
                    return (
                      <Card
                        key={assignment.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected 
                            ? "border-purple-300 bg-purple-50 shadow-md" 
                            : "border-slate-200 hover:border-purple-200"
                        }`}
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-slate-900 truncate text-sm">
                                  {assignment.title}
                                </h4>
                                {isOverdue && (
                                  <Badge className="bg-red-100 text-red-700 text-xs">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-600">{assignment.courseName}</p>
                              <p className="text-xs text-slate-500">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-600">Progress</span>
                                <span className="font-medium text-slate-900">
                                  {assignment.submitted}/{assignment.totalStudents}
                                </span>
                              </div>
                              <Progress 
                                value={assignment.completionRate} 
                                className="h-2 bg-slate-100"
                              />
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center p-1 bg-blue-50 rounded border border-blue-100">
                                <div className="font-semibold text-blue-600">{assignment.inProgress}</div>
                                <div className="text-blue-700">Working</div>
                              </div>
                              <div className="text-center p-1 bg-green-50 rounded border border-green-100">
                                <div className="font-semibold text-green-600">{assignment.submitted}</div>
                                <div className="text-green-700">Done</div>
                              </div>
                              <div className="text-center p-1 bg-slate-50 rounded border border-slate-100">
                                <div className="font-semibold text-slate-600">{assignment.notStarted}</div>
                                <div className="text-slate-700">Pending</div>
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

            {/* Assignment Details */}
            <div className="lg:col-span-2">
              {selectedAssignment ? (
                <div className="space-y-6">
                  {/* Assignment Overview */}
                  <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div>
                          <span className="text-purple-900">{selectedAssignment.title}</span>
                          <p className="text-sm text-purple-700 font-normal mt-1">
                            {selectedAssignment.courseName} • {selectedAssignment.totalPoints} points
                          </p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 capitalize">
                          {selectedAssignment.type}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">
                            {selectedAssignment.totalStudents}
                          </div>
                          <div className="text-sm text-slate-600">Total Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedAssignment.inProgress}
                          </div>
                          <div className="text-sm text-slate-600">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedAssignment.submitted}
                          </div>
                          <div className="text-sm text-slate-600">Submitted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(selectedAssignment.completionRate)}%
                          </div>
                          <div className="text-sm text-slate-600">Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatTimeSpent(selectedAssignment.averageTime)}
                          </div>
                          <div className="text-sm text-slate-600">Avg Time</div>
                        </div>
                      </div>

                      {/* Progress Visualization */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-900">Overall Progress</h4>
                        <Progress 
                          value={selectedAssignment.completionRate} 
                          className="h-4 bg-slate-100"
                        />
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>0%</span>
                          <span className="font-medium">
                            {Math.round(selectedAssignment.completionRate)}% Complete
                          </span>
                          <span>100%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-slate-700" />
                        <span>Recent Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedAssignment.recentActivity.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">
                            No recent activity
                          </p>
                        ) : (
                          selectedAssignment.recentActivity.slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                                {activity.action === 'started' && <PlayCircle className="w-4 h-4 text-blue-600" />}
                                {activity.action === 'submitted' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                {activity.action === 'saved_draft' && <FileText className="w-4 h-4 text-orange-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">
                                  {activity.studentName} 
                                  {activity.action === 'started' && ' started the assignment'}
                                  {activity.action === 'submitted' && ' submitted the assignment'}
                                  {activity.action === 'saved_draft' && ' saved a draft'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(activity.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Student Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-slate-700" />
                        <span>Student Progress Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedAssignment.studentDetails.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                                {getStatusIcon(student.status)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{student.name}</p>
                                <p className="text-sm text-slate-600">{student.email}</p>
                                {student.timeSpent && (
                                  <p className="text-xs text-slate-500">
                                    Time spent: {formatTimeSpent(student.timeSpent)}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {student.submittedAt && (
                                <div className="text-right text-xs text-slate-500">
                                  <p>Submitted:</p>
                                  <p>{new Date(student.submittedAt).toLocaleDateString()}</p>
                                </div>
                              )}
                              
                              <Badge className={`${getStatusColor(student.status)} border capitalize`}>
                                {student.status.replace('_', ' ')}
                              </Badge>
                              
                              {student.status === 'submitted' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-300 hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-slate-200 h-full flex items-center justify-center">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium mb-2">Select an Assignment</p>
                    <p className="text-sm text-slate-500">
                      Choose an assignment from the list to view detailed progress and student activity
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
