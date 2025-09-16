import { Router, Response } from "express";
import Course from "../models/Course";
import Assignment from "../models/Assignment";
import Enrollment from "../models/Enrollment";
import auth, { AuthRequest } from "../middleware/auth";

const router = Router();

// Apply auth middleware to all routes
router.use(auth);

// Middleware to ensure user is a student
const isStudent = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({ message: "Access denied. Students only." });
  }
  next();
};

router.use(isStudent);

// Get student dashboard data
router.get("/dashboard", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?._id;

    // Get enrolled courses
    const enrollments = await Enrollment.find({
      student: studentId,
      status: "active",
    })
      .populate({
        path: "course",
        populate: {
          path: "teacher",
          select: "name",
        },
      })
      .exec();

    // Get pending assignments
    const courseIds = enrollments.map((enrollment) => enrollment.course._id);
    const assignments = await Assignment.find({
      course: { $in: courseIds },
      dueDate: { $gte: new Date() },
    })
      .populate("course", "title")
      .sort({ dueDate: 1 })
      .limit(10);

    // Get recent activity (assignments with submissions)
    const recentActivity = await Assignment.find({
      course: { $in: courseIds },
      "submissions.student": studentId,
    })
      .populate("course", "title")
      .sort({ updatedAt: -1 })
      .limit(5);

    // Calculate GPA (simplified - average of all grades)
    const allSubmissions = await Assignment.find({
      course: { $in: courseIds },
      "submissions.student": studentId,
      "submissions.grade": { $exists: true },
    });

    let totalGrade = 0;
    let gradeCount = 0;

    allSubmissions.forEach((assignment) => {
      const submission = assignment.submissions.find(
        (sub) => sub.student.toString() === studentId?.toString(),
      );
      if (submission?.grade !== undefined) {
        totalGrade += (submission.grade / assignment.totalPoints) * 100;
        gradeCount++;
      }
    });

    const gpa = gradeCount > 0 ? (totalGrade / gradeCount / 100) * 4.0 : 0;

    res.json({
      stats: {
        activeCourses: enrollments.length,
        pendingTasks: assignments.length,
        gpa: Math.round(gpa * 10) / 10,
      },
      courses: enrollments.map((enrollment) => ({
        id: enrollment.course._id,
        title: enrollment.course.title,
        teacher: enrollment.course.teacher.name,
        schedule: enrollment.course.schedule,
        currentGrade: enrollment.currentGrade || 0,
      })),
      upcomingDeadlines: assignments.map((assignment) => ({
        id: assignment._id,
        title: assignment.title,
        course: assignment.course.title,
        dueDate: assignment.dueDate,
      })),
      recentActivity: recentActivity.map((assignment) => {
        const submission = assignment.submissions.find(
          (sub) => sub.student.toString() === studentId?.toString(),
        );
        return {
          id: assignment._id,
          title: assignment.title,
          course: assignment.course.title,
          submittedAt: submission?.submittedAt,
          grade: submission?.grade,
          totalPoints: assignment.totalPoints,
        };
      }),
    });
  } catch (error: any) {
    console.error("Student dashboard error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get student courses
router.get("/courses", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?._id;

    const enrollments = await Enrollment.find({
      student: studentId,
      status: "active",
    })
      .populate({
        path: "course",
        populate: {
          path: "teacher",
          select: "name",
        },
      })
      .exec();

    const courses = enrollments.map((enrollment) => ({
      id: enrollment.course._id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      teacher: enrollment.course.teacher.name,
      schedule: enrollment.course.schedule,
      currentGrade: enrollment.currentGrade || 0,
      status: enrollment.status,
    }));

    res.json({ courses });
  } catch (error: any) {
    console.error("Get courses error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get course assignments
router.get(
  "/courses/:courseId/assignments",
  async (req: AuthRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const studentId = req.user?._id;

      // Verify student is enrolled in this course
      const enrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId,
        status: "active",
      });

      if (!enrollment) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }

      const assignments = await Assignment.find({ course: courseId })
        .populate("course", "title")
        .sort({ dueDate: -1 });

      const assignmentsWithSubmissions = assignments.map((assignment) => {
        const submission = assignment.submissions.find(
          (sub) => sub.student.toString() === studentId?.toString(),
        );
        return {
          id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          totalPoints: assignment.totalPoints,
          submission: submission
            ? {
                submittedAt: submission.submittedAt,
                grade: submission.grade,
                feedback: submission.feedback,
                fileUrl: submission.fileUrl,
              }
            : null,
        };
      });

      res.json({ assignments: assignmentsWithSubmissions });
    } catch (error: any) {
      console.error("Get assignments error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// Submit assignment
router.post(
  "/assignments/:assignmentId/submit",
  async (req: AuthRequest, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const { fileUrl } = req.body;
      const studentId = req.user?._id;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check if already submitted
      const existingSubmission = assignment.submissions.find(
        (sub) => sub.student.toString() === studentId?.toString(),
      );

      if (existingSubmission) {
        return res
          .status(400)
          .json({ message: "Assignment already submitted" });
      }

      // Add submission
      assignment.submissions.push({
        student: studentId!,
        submittedAt: new Date(),
        fileUrl: fileUrl || "",
      });

      await assignment.save();

      res.json({ message: "Assignment submitted successfully" });
    } catch (error: any) {
      console.error("Submit assignment error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

export default router;
