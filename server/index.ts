import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import communityRoutes from "./routes/community";
import chatRoutes from "./routes/chat";
import mongoose from "mongoose";
import connectDB from "./database/connection";
import http from "http";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT) || 8080;
const SOCKET_PORT = 8081;

// Connect to MongoDB
connectDB();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Keep existing demo route for backward compatibility
  app.get("/api/demo", handleDemo);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      message: "EduHub API is running",
      timestamp: new Date().toISOString(),
    });
  });
  
  // Community routes
  app.use("/api/community", communityRoutes);
  
  // Chat routes
  app.use("/api/chat", chatRoutes);

  // Placeholder API routes that return mock data for development
  app.get("/api/auth/me", (req, res) => {
    res.status(401).json({ message: "Not authenticated" });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    // Mock login for demo accounts
    if (email === "prof.smith@eduhub.com" && password === "password123") {
      res.json({
        message: "Login successful",
        token: "mock-teacher-token",
        user: {
          id: "teacher1",
          email: "prof.smith@eduhub.com",
          name: "Professor Smith",
          role: "teacher",
        },
      });
    } else if (
      email === "alex.student@eduhub.com" &&
      password === "password123"
    ) {
      res.json({
        message: "Login successful",
        token: "mock-student-token",
        user: {
          id: "student1",
          email: "alex.student@eduhub.com",
          name: "Alex Johnson",
          role: "student",
        },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, name, role } = req.body;
    res.json({
      message: "User created successfully",
      token: "mock-token",
      user: {
        id: "new-user",
        email,
        name,
        role,
      },
    });
  });

    // Mock student dashboard data with real-time updates
  app.get("/api/student/dashboard", (req, res) => {
    const { timestamp } = req.query;

    // Calculate real-time stats based on current assignments and materials
    const pendingAssignments = teacherAssignments.filter(a =>
      !a.submissions || a.submissions.length === 0
    ).length;

    const totalMaterials = courseMaterials.length;

    res.json({
      stats: {
        activeCourses: teacherCourses.length,
        pendingTasks: pendingAssignments,
        gpa: 3.8,
        attendance: 85.2,
        totalMaterials: totalMaterials,
        lastUpdated: new Date().toISOString(),
      },
      courses: [
        {
          id: "course1",
          title: "Advanced Mathematics",
          teacher: "Prof. Johnson",
          schedule: {
            days: ["Monday", "Wednesday", "Friday"],
            time: "10:00 AM",
            room: "Room 204",
          },
          currentGrade: 85,
        },
        {
          id: "course2",
          title: "Physics Laboratory",
          teacher: "Dr. Smith",
          schedule: {
            days: ["Tuesday", "Thursday"],
            time: "2:00 PM",
            room: "Lab 101",
          },
          currentGrade: 92,
        },
      ],
      upcomingDeadlines: [
        {
          id: "assignment1",
          title: "Math Assignment",
          course: "Advanced Mathematics",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      ],
      recentActivity: [
        {
          id: "activity1",
          title: "Grade received for Physics Lab Report",
          course: "Physics Laboratory",
          grade: 92,
          totalPoints: 100,
        },
      ],
    });
  });

          // Mock attendance history storage (would be database in production)
  let attendanceHistory: Record<string, Array<{
    date: string;
    attendance: Record<string, string>;
  }>> = {};

  // Mock assignments storage
  let assignments: Array<{
    id: string;
    title: string;
    description: string;
    instructions: string;
    dueDate: string;
    dueTime: string;
    totalPoints: number;
    courseId: string;
    type: string;
    allowLateSubmissions: boolean;
    latePenalty: number;
    createdAt: string;
    submissions: Array<{
      studentId: string;
      studentName: string;
      submittedAt: string;
      content: string;
      grade?: number;
      feedback?: string;
    }>;
    }> = [];

  // Teacher assignments array (synchronized with assignments)
  let teacherAssignments: Array<{
    id: string;
    title: string;
    description: string;
    instructions: string;
    dueDate: string;
    dueTime: string;
    totalPoints: number;
    courseId: string;
    type: string;
    allowLateSubmissions: boolean;
    latePenalty: number;
    createdAt: string;
    submissions: Array<{
      studentId: string;
      studentName: string;
      submittedAt: string;
      content: string;
      grade?: number;
      feedback?: string;
    }>;
  }> = [];

  // Mock course materials storage
  let courseMaterials: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    courseId: string;
    fileUrl?: string;
    content?: string;
    createdAt: string;
  }> = [];

  // Get course details with attendance statistics
  app.get("/api/teacher/courses/:courseId/details", (req, res) => {
    const { courseId } = req.params;
    const course = teacherCourses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Mock attendance statistics
    const mockStats = {
      totalSessions: 12,
      averageAttendance: 87,
      highestAttendance: 96,
      lowestAttendance: 73
    };

    const mockRecentSessions = [
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        presentCount: Math.floor(course.studentCount * 0.9),
        absentCount: Math.ceil(course.studentCount * 0.1),
        totalStudents: course.studentCount,
        attendanceRate: 90
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        presentCount: Math.floor(course.studentCount * 0.85),
        absentCount: Math.ceil(course.studentCount * 0.15),
        totalStudents: course.studentCount,
        attendanceRate: 85
      },
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        presentCount: Math.floor(course.studentCount * 0.92),
        absentCount: Math.ceil(course.studentCount * 0.08),
        totalStudents: course.studentCount,
        attendanceRate: 92
      }
    ];

    const mockStudentStats = (course.enrolledStudents || []).map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      attendanceRate: 75 + Math.floor(Math.random() * 20), // Random between 75-95%
      totalPresent: 8 + Math.floor(Math.random() * 4), // Random between 8-11
      totalAbsent: 1 + Math.floor(Math.random() * 3), // Random between 1-3
      totalSessions: 12
    }));

    res.json({
      course,
      attendanceStats: mockStats,
      recentSessions: mockRecentSessions,
      students: mockStudentStats
    });
  });

  // Get attendance history for a course
  app.get("/api/teacher/courses/:courseId/attendance/history", (req, res) => {
    const { courseId } = req.params;
    const course = teacherCourses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Mock attendance history data
    const mockHistory = [
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        students: (course.enrolledStudents || []).map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          status: Math.random() > 0.2 ? "present" : "absent" as "present" | "absent",
          canEdit: true
        }))
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        students: (course.enrolledStudents || []).map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          status: Math.random() > 0.15 ? "present" : "absent" as "present" | "absent",
          canEdit: true
        }))
      },
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        students: (course.enrolledStudents || []).map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          status: Math.random() > 0.1 ? "present" : "absent" as "present" | "absent",
          canEdit: true
        }))
      }
    ];

    res.json({
      course: {
        id: course.id,
        title: course.title
      },
      records: mockHistory
    });
  });

  // Update attendance record
  app.put("/api/teacher/courses/:courseId/attendance/update", (req, res) => {
    const { courseId } = req.params;
    const { date, attendance } = req.body;

    const course = teacherCourses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    console.log(`Updating attendance for course ${courseId} (${course.title}) on ${date}:`, attendance);

    // Store the update (in production this would update the database)
    if (!attendanceHistory[courseId]) {
      attendanceHistory[courseId] = [];
    }

    const existingRecordIndex = attendanceHistory[courseId].findIndex(record => record.date === date);
    if (existingRecordIndex >= 0) {
      attendanceHistory[courseId][existingRecordIndex].attendance = {
        ...attendanceHistory[courseId][existingRecordIndex].attendance,
        ...attendance
      };
    } else {
      attendanceHistory[courseId].push({ date, attendance });
    }

    res.json({
      message: "Attendance updated successfully",
      course: {
        id: courseId,
        title: course.title
      },
      date,
      updatedRecords: Object.keys(attendance).length
    });
  });

    // Create assignment
  app.post("/api/teacher/assignments", (req, res) => {
    try {
      const {
        title,
        description,
        instructions,
        dueDate,
        dueTime,
        totalPoints,
        courseId,
        type,
        allowLateSubmissions,
        latePenalty
      } = req.body;

      if (!title || !courseId || !dueDate || !totalPoints || !type) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      const course = teacherCourses.find(c => c.id === courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const newAssignment = {
        id: `assignment_${Date.now()}`,
        title,
        description: description || '',
        instructions: instructions || '',
        dueDate,
        dueTime: dueTime || '23:59',
        totalPoints,
        courseId,
        type,
        allowLateSubmissions: allowLateSubmissions || false,
        latePenalty: latePenalty || 0,
        createdAt: new Date().toISOString(),
        submissions: []
      };

      assignments.push(newAssignment);

      res.status(201).json({
        message: "Assignment created successfully",
        assignment: newAssignment,
        course: {
          id: course.id,
          title: course.title
        }
      });
    } catch (error) {
      console.error("Create assignment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get assignments for a course
  app.get("/api/teacher/courses/:courseId/assignments", (req, res) => {
    const { courseId } = req.params;
    const courseAssignments = assignments.filter(a => a.courseId === courseId);

    res.json({
      assignments: courseAssignments,
      totalAssignments: courseAssignments.length
    });
  });

  // Get all assignments for teacher
  app.get("/api/teacher/assignments", (req, res) => {
    res.json({
      assignments,
      totalAssignments: assignments.length
    });
  });

    // Assignment status tracking for teachers
  app.get("/api/teacher/assignments/status", (req, res) => {
    const assignmentsWithStatus = assignments.map(assignment => {
      const course = teacherCourses.find(c => c.id === assignment.courseId);
      const totalStudents = course?.studentCount || 0;

      // Mock student progress data
      const notStarted = Math.floor(totalStudents * 0.3);
      const inProgress = Math.floor(totalStudents * 0.4);
      const submitted = totalStudents - notStarted - inProgress;
      const overdue = Math.floor(totalStudents * 0.1);

      const studentDetails = [];
      // Generate mock student details
      if (course?.enrolledStudents) {
        course.enrolledStudents.forEach((student, index) => {
          let status = 'not_started';
          if (index < submitted) status = 'submitted';
          else if (index < submitted + inProgress) status = 'in_progress';
          else if (index < submitted + inProgress + overdue) status = 'overdue';

          studentDetails.push({
            id: student.id,
            name: student.name,
            email: student.email,
            status,
            startedAt: status !== 'not_started' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
            submittedAt: status === 'submitted' ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString() : undefined,
            timeSpent: status !== 'not_started' ? Math.floor(Math.random() * 120) + 30 : undefined,
            grade: status === 'submitted' ? Math.floor(Math.random() * 30) + 70 : undefined
          });
        });
      }

      const recentActivity = [
        {
          studentName: "John Smith",
          action: "submitted",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          studentName: "Sarah Johnson",
          action: "started",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        },
        {
          studentName: "Mike Davis",
          action: "saved_draft",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        }
      ];

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        dueTime: assignment.dueTime,
        totalPoints: assignment.totalPoints,
        type: assignment.type,
        courseName: course?.title || 'Unknown Course',
        totalStudents,
        notStarted,
        inProgress,
        submitted,
        overdue,
        completionRate: totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0,
        averageTime: Math.floor(Math.random() * 60) + 45, // Random average time
        recentActivity,
        studentDetails
      };
    });

    res.json({
      assignments: assignmentsWithStatus
    });
  });

    // Get assignments for student dashboard with real-time updates
  app.get("/api/student/assignments", (req, res) => {
    const { timestamp } = req.query;

    // Use teacherAssignments for real-time updates from teacher dashboard
    const studentAssignments = teacherAssignments.map(assignment => {
      const status = ['not_started', 'in_progress', 'submitted'][Math.floor(Math.random() * 3)];
      const timeSpent = status !== 'not_started' ? Math.floor(Math.random() * 120) + 15 : 0;

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate,
        dueTime: assignment.dueTime,
        totalPoints: assignment.totalPoints,
        type: assignment.type,
        courseName: teacherCourses.find(c => c.id === assignment.courseId)?.title || 'Unknown Course',
        status,
        timeSpent,
        startedAt: status !== 'not_started' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
        submittedAt: status === 'submitted' ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString() : undefined,
        grade: status === 'submitted' ? Math.floor(Math.random() * 30) + 70 : undefined,
        feedback: status === 'submitted' ? "Good work! Consider adding more details in section 2." : undefined,
        allowLateSubmissions: assignment.allowLateSubmissions,
        draft: status === 'in_progress' ? "This is a saved draft of my assignment..." : undefined
      };
    });

    res.json({
      assignments: studentAssignments,
      totalAssignments: studentAssignments.length
    });
  });

  // Start assignment (student)
  app.post("/api/student/assignments/:assignmentId/start", (req, res) => {
    const { assignmentId } = req.params;

    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Track assignment start
    console.log(`Student started assignment: ${assignment.title}`);

    res.json({
      message: "Assignment started successfully",
      startedAt: new Date().toISOString()
    });
  });

  // Save draft (student)
  app.post("/api/student/assignments/:assignmentId/draft", (req, res) => {
    const { assignmentId } = req.params;
    const { content, timeSpent } = req.body;

    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    console.log(`Draft saved for assignment: ${assignment.title}`);

    res.json({
      message: "Draft saved successfully",
      savedAt: new Date().toISOString()
    });
  });

  // Submit assignment (student)
  app.post("/api/student/assignments/:assignmentId/submit", (req, res) => {
    const { assignmentId } = req.params;
    const { content } = req.body;

    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const submission = {
      studentId: "student1", // Mock student ID
      studentName: "Alex Johnson", // Mock student name
      submittedAt: new Date().toISOString(),
      content: content || "Assignment submission content"
    };

    assignment.submissions.push(submission);

    res.json({
      message: "Assignment submitted successfully",
      submission
    });
  });

  // Grade assignment submission
  app.post("/api/teacher/assignments/:assignmentId/grade", (req, res) => {
    const { assignmentId } = req.params;
    const { studentId, grade, feedback } = req.body;

    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const submission = assignment.submissions.find(s => s.studentId === studentId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.grade = grade;
    submission.feedback = feedback;

    res.json({
      message: "Assignment graded successfully",
      submission
    });
  });

    // Create course material
  app.post("/api/teacher/materials", (req, res) => {
    try {
      const { title, description, type, courseId, content, fileUrl } = req.body;

      if (!title || !type || !courseId) {
        return res.status(400).json({ message: "Title, type, and course are required" });
      }

      const course = teacherCourses.find(c => c.id === courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const newMaterial = {
        id: `material_${Date.now()}`,
        title,
        description: description || '',
        type,
        courseId,
        fileUrl: fileUrl || '',
        content: content || '',
        createdAt: new Date().toISOString()
      };

      courseMaterials.push(newMaterial);

      res.status(201).json({
        message: "Material created successfully",
        material: newMaterial
      });
    } catch (error) {
      console.error("Create material error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all course materials
  app.get("/api/teacher/materials", (req, res) => {
    res.json({
      materials: courseMaterials,
      totalMaterials: courseMaterials.length
    });
  });

  // Get materials for a specific course
  app.get("/api/teacher/courses/:courseId/materials", (req, res) => {
    const { courseId } = req.params;
    const materials = courseMaterials.filter(m => m.courseId === courseId);

    res.json({
      materials,
      totalMaterials: materials.length
    });
  });

  // Delete course material
  app.delete("/api/teacher/materials/:materialId", (req, res) => {
    try {
      const { materialId } = req.params;
      const materialIndex = courseMaterials.findIndex(m => m.id === materialId);

      if (materialIndex === -1) {
        return res.status(404).json({ message: "Material not found" });
      }

      const deletedMaterial = courseMaterials.splice(materialIndex, 1)[0];

      res.json({
        message: "Material deleted successfully",
        material: deletedMaterial
      });
    } catch (error) {
      console.error("Delete material error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

    // Get materials for student dashboard with real-time updates
  app.get("/api/student/materials", (req, res) => {
    const { timestamp } = req.query;

    // Use courseMaterials for real-time updates from teacher dashboard
    const studentMaterials = courseMaterials.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type,
      fileUrl: material.fileUrl,
      courseName: teacherCourses.find(c => c.id === material.courseId)?.title || 'Unknown Course',
      createdAt: material.createdAt
    }));

        res.json({
      materials: studentMaterials,
      totalMaterials: studentMaterials.length,
      lastUpdated: new Date().toISOString(),
      timestamp: Date.now()
    });
  });

  // Get all students enrolled by the teacher
  app.get("/api/teacher/students", (req, res) => {
    const allStudents = [];
    const studentMap = new Map();

    // Collect all unique students from all courses
    teacherCourses.forEach(course => {
      if (course.enrolledStudents) {
        course.enrolledStudents.forEach(student => {
          if (!studentMap.has(student.email)) {
            studentMap.set(student.email, {
              ...student,
              courses: [{ id: course.id, title: course.title }]
            });
          } else {
            studentMap.get(student.email).courses.push({
              id: course.id,
              title: course.title
            });
          }
        });
      }
    });

    res.json({
      students: Array.from(studentMap.values()),
      totalStudents: studentMap.size
    });
  });

  // Attendance endpoints - using real enrolled students
  app.get("/api/teacher/courses/:courseId/attendance", (req, res) => {
    const { courseId } = req.params;
    const { date } = req.query;

    const course = teacherCourses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get real enrolled students and set default attendance status
    const students = (course.enrolledStudents || []).map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      status: "present" // Default status, can be changed by teacher
    }));

    res.json({
      course: {
        id: courseId,
        title: course.title,
        date: date || new Date().toISOString().split("T")[0],
      },
      students
    });
  });

    app.post("/api/teacher/courses/:courseId/attendance", (req, res) => {
    const { courseId } = req.params;
    const { date, attendance } = req.body;

    const course = teacherCourses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    console.log(
      `Saving attendance for course ${courseId} (${course.title}) on ${date}:`,
      attendance,
    );

    // Here you would typically save to database
    // For now we just log and return success
    const attendanceCount = Object.keys(attendance);
    const presentCount = Object.values(attendance).filter(status => status === 'present').length;
    const absentCount = Object.values(attendance).filter(status => status === 'absent').length;

    res.json({
      message: "Attendance saved successfully",
      course: {
        id: courseId,
        title: course.title
      },
      date,
      recordsUpdated: attendanceCount.length,
      summary: {
        present: presentCount,
        absent: absentCount,
        total: attendanceCount.length
      }
    });
  });

  app.get("/api/student/attendance", (req, res) => {
    // Mock student attendance data with visual representation
    res.json({
      studentId: "student1",
      studentName: "Alex Johnson",
      overall: {
        totalClasses: 45,
        attended: 38,
        absent: 5,
        late: 2,
        percentage: 84.4,
      },
      courses: [
        {
          id: "course1",
          title: "Advanced Mathematics",
          totalClasses: 15,
          attended: 13,
          absent: 1,
          late: 1,
          percentage: 86.7,
        },
        {
          id: "course2",
          title: "Physics Laboratory",
          totalClasses: 12,
          attended: 11,
          absent: 1,
          late: 0,
          percentage: 91.7,
        },
        {
          id: "course3",
          title: "Computer Science",
          totalClasses: 10,
          attended: 8,
          absent: 2,
          late: 0,
          percentage: 80.0,
        },
        {
          id: "course4",
          title: "Chemistry",
          totalClasses: 8,
          attended: 6,
          absent: 1,
          late: 1,
          percentage: 75.0,
        },
      ],
      recentAttendance: [
        {
          date: "2024-01-15",
          course: "Advanced Mathematics",
          status: "present",
        },
        { date: "2024-01-14", course: "Physics Laboratory", status: "present" },
        { date: "2024-01-13", course: "Computer Science", status: "absent" },
        { date: "2024-01-12", course: "Chemistry", status: "late" },
        {
          date: "2024-01-11",
          course: "Advanced Mathematics",
          status: "present",
        },
        { date: "2024-01-10", course: "Physics Laboratory", status: "present" },
        { date: "2024-01-09", course: "Computer Science", status: "present" },
        { date: "2024-01-08", course: "Chemistry", status: "present" },
        {
          date: "2024-01-07",
          course: "Advanced Mathematics",
          status: "present",
        },
        { date: "2024-01-06", course: "Physics Laboratory", status: "present" },
      ],
      monthlyData: [
        { month: "Sep", attended: 18, total: 20, percentage: 90 },
        { month: "Oct", attended: 16, total: 19, percentage: 84.2 },
        { month: "Nov", attended: 14, total: 17, percentage: 82.4 },
        { month: "Dec", attended: 12, total: 15, percentage: 80 },
        { month: "Jan", attended: 8, total: 10, percentage: 80 },
      ],
    });
  });

            // In-memory storage for development (would be database in production)
    let teacherCourses = [
    {
      id: "course1",
            title: "Advanced Mathematics",
      description: "Advanced calculus and linear algebra concepts",
      studentCount: 3,
      enrolledStudents: [
        {
          id: "student_1",
          name: "John Smith",
          email: "john.smith@student.edu",
          enrolledAt: new Date().toISOString()
        },
        {
          id: "student_2",
          name: "Sarah Johnson",
          email: "sarah.johnson@student.edu",
          enrolledAt: new Date().toISOString()
        },
        {
          id: "student_3",
          name: "Mike Davis",
          email: "mike.davis@student.edu",
          enrolledAt: new Date().toISOString()
        }
      ],
      schedule: {
        days: ["Monday", "Wednesday", "Friday"],
        time: "10:00 AM",
        room: "Room 204",
      },
      semester: "Fall 2024",
    },
    {
      id: "course2",
            title: "Physics Laboratory",
      description: "Hands-on physics experiments and lab work",
      studentCount: 2,
      enrolledStudents: [
        {
          id: "student_4",
          name: "Emily Wilson",
          email: "emily.wilson@student.edu",
          enrolledAt: new Date().toISOString()
        },
        {
          id: "student_5",
          name: "David Brown",
          email: "david.brown@student.edu",
          enrolledAt: new Date().toISOString()
        }
      ],
      schedule: {
        days: ["Tuesday", "Thursday"],
        time: "2:00 PM",
        room: "Lab 101",
      },
      semester: "Fall 2024",
    },
  ];

  // Create new course
  app.post("/api/teacher/courses", (req, res) => {
    try {
      const { title, description, room, time, days, semester } = req.body;

      if (!title || !description || !room || !time || !semester) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newCourse = {
        id: `course${teacherCourses.length + 1}_${Date.now()}`,
        title,
        description,
                studentCount: 0,
        enrolledStudents: [],
        schedule: {
          days: days || ["Monday"],
          time,
          room,
        },
        semester,
      };

      teacherCourses.push(newCourse);

      res.status(201).json({
        message: "Course created successfully",
        course: newCourse,
        totalCourses: teacherCourses.length,
      });
    } catch (error) {
      console.error("Create course error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete course
  app.delete("/api/teacher/courses/:courseId", (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIndex = teacherCourses.findIndex(course => course.id === courseId);

      if (courseIndex === -1) {
        return res.status(404).json({ message: "Course not found" });
      }

      const deletedCourse = teacherCourses.splice(courseIndex, 1)[0];

      res.json({
        message: "Course deleted successfully",
        course: deletedCourse,
        totalCourses: teacherCourses.length,
      });
    } catch (error) {
      console.error("Delete course error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

    // Get all courses
  app.get("/api/teacher/courses", (req, res) => {
    res.json({
      courses: teacherCourses,
      totalCourses: teacherCourses.length,
    });
  });

  // Add student to course
  app.post("/api/teacher/courses/:courseId/students", (req, res) => {
    try {
      const { courseId } = req.params;
      const { studentEmail, studentName } = req.body;

      if (!studentEmail || !studentName) {
        return res.status(400).json({ message: "Student email and name are required" });
      }

      const course = teacherCourses.find(c => c.id === courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Initialize enrolledStudents if it doesn't exist
      if (!course.enrolledStudents) {
        course.enrolledStudents = [];
      }

      // Check if student already enrolled
      if (course.enrolledStudents.find(s => s.email === studentEmail)) {
        return res.status(400).json({ message: "Student already enrolled in this course" });
      }

      // Add student to course
      const newStudent = {
        id: `student_${Date.now()}`,
        name: studentName,
        email: studentEmail,
        enrolledAt: new Date().toISOString()
      };

      course.enrolledStudents.push(newStudent);
      course.studentCount = course.enrolledStudents.length;

      res.status(201).json({
        message: "Student added successfully",
        student: newStudent,
        course: {
          id: course.id,
          title: course.title,
          studentCount: course.studentCount
        },
        totalStudents: teacherCourses.reduce((total, c) => total + c.studentCount, 0)
      });
    } catch (error) {
      console.error("Add student error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Mock teacher dashboard data
  app.get("/api/teacher/dashboard", (req, res) => {
        res.json({
      stats: {
        activeClasses: teacherCourses.length,
        totalStudents: teacherCourses.reduce((total, course) => total + course.studentCount, 0),
        pendingGrades: 18,
        avgGrade: 87,
        avgAttendance: 85.2,
      },
      courses: teacherCourses,
      recentSubmissions: [
        {
          assignmentTitle: "Physics Lab Report",
          course: "Physics Laboratory",
          studentName: "Sarah Johnson",
          submittedAt: new Date(),
        },
      ],
      todaySchedule: [
        {
          id: "course1",
          title: "Advanced Math",
          time: "10:00 AM",
          room: "Room 204",
        },
      ],
        });
  });

  // Create assignment endpoint
  app.post("/api/teacher/assignments", (req, res) => {
    try {
      const { title, description, instructions, dueDate, dueTime, totalPoints, type, courseId, allowLateSubmissions } = req.body;

      if (!title || !type || !courseId || !dueDate) {
        return res.status(400).json({ message: "Title, type, course, and due date are required" });
      }

      const course = teacherCourses.find(c => c.id === courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const newAssignment = {
        id: `assignment_${Date.now()}`,
        title,
        description: description || '',
        instructions: instructions || '',
        dueDate,
        dueTime: dueTime || '23:59',
        totalPoints: totalPoints || 100,
        type,
        courseId,
        allowLateSubmissions: allowLateSubmissions || false,
        createdAt: new Date().toISOString(),
        submissions: []
      };

      teacherAssignments.push(newAssignment);
      assignments.push(newAssignment); // Keep both arrays in sync

      res.status(201).json({
        message: "Assignment created successfully",
        assignment: newAssignment
      });
    } catch (error) {
      console.error("Create assignment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  return app;
}

// Socket.io server setup
export function createSocketServer() {
  const socketServer = http.createServer();
  const io = new Server(socketServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store online users
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    console.log(`User connected: ${userId}`);
    
    // Add user to online users
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit("user_online", userId);
    }
    
    // Join chat rooms
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);
    });
    
    // Handle sending messages
    socket.on("send_message", async (data) => {
      const { chatId, content } = data;
      
      try {
        // Broadcast to all users in the chat
        io.to(chatId).emit("message", {
          _id: new mongoose.Types.ObjectId().toString(),
          sender: { _id: userId },
          content,
          timestamp: new Date().toISOString(),
          isDeleted: false
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
    
    // Handle typing indicators
    socket.on("typing", (data) => {
      const { chatId } = data;
      socket.to(chatId).emit("typing", { userId, chatId });
    });
    
    socket.on("stop_typing", (data) => {
      const { chatId } = data;
      socket.to(chatId).emit("stop_typing", { userId, chatId });
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("user_offline", userId);
      }
    });
  });

  return socketServer;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const socketServer = createSocketServer();
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
  
  socketServer.listen(SOCKET_PORT, () => {
    console.log(`Socket.io server running on http://0.0.0.0:${SOCKET_PORT}`);
  });
}
