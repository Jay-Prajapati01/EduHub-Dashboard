import { Router, Response } from "express";
import Course from "../models/Course";
import Assignment from "../models/Assignment";
import Enrollment from "../models/Enrollment";
import User from "../models/User";
import auth, { AuthRequest } from "../middleware/auth";

const router = Router();

// Apply auth middleware to all routes
router.use(auth);

// Middleware to ensure user is a teacher
const isTeacher = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ message: "Access denied. Teachers only." });
  }
  next();
};

router.use(isTeacher);

// Get teacher dashboard data
router.get("/dashboard", async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?._id;

    // Get teacher's courses
    const courses = await Course.find({ teacher: teacherId })
      .populate("students", "name email")
      .exec();

    // Get total students across all courses
    const totalStudents = courses.reduce(
      (total, course) => total + course.students.length,
      0,
    );

    // Get pending assignments to grade
    const assignments = await Assignment.find({ teacher: teacherId });
    const pendingGrades = assignments.reduce((total, assignment) => {
      return (
        total +
        assignment.submissions.filter((sub) => sub.grade === undefined).length
      );
    }, 0);

    // Calculate average grade across all assignments
    let totalGradeSum = 0;
    let totalGradedSubmissions = 0;

    assignments.forEach((assignment) => {
      assignment.submissions.forEach((submission) => {
        if (submission.grade !== undefined) {
          totalGradeSum += (submission.grade / assignment.totalPoints) * 100;
          totalGradedSubmissions++;
        }
      });
    });

    const avgGrade =
      totalGradedSubmissions > 0
        ? Math.round(totalGradeSum / totalGradedSubmissions)
        : 0;

    // Get recent submissions
    const recentSubmissions = await Assignment.find({ teacher: teacherId })
      .populate({
        path: "submissions.student",
        select: "name",
      })
      .populate("course", "title")
      .sort({ "submissions.submittedAt": -1 })
      .limit(10);

    const flatSubmissions = [];
    recentSubmissions.forEach((assignment) => {
      assignment.submissions
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime(),
        )
        .slice(0, 3)
        .forEach((submission) => {
          flatSubmissions.push({
            assignmentTitle: assignment.title,
            course: assignment.course.title,
            studentName: submission.student.name,
            submittedAt: submission.submittedAt,
            grade: submission.grade,
            assignmentId: assignment._id,
            submissionId: submission._id,
          });
        });
    });

    flatSubmissions.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );

    res.json({
      stats: {
        activeClasses: courses.length,
        totalStudents,
        pendingGrades,
        avgGrade,
      },
      courses: courses.map((course) => ({
        id: course._id,
        title: course.title,
        description: course.description,
        studentCount: course.students.length,
        schedule: course.schedule,
        semester: course.semester,
      })),
      recentSubmissions: flatSubmissions.slice(0, 5),
      todaySchedule: courses
        .filter((course) => {
          const today = new Date().toLocaleDateString("en-US", {
            weekday: "long",
          });
          return course.schedule.days.includes(today);
        })
        .map((course) => ({
          id: course._id,
          title: course.title,
          time: course.schedule.time,
          room: course.schedule.room,
        })),
    });
  } catch (error: any) {
    console.error("Teacher dashboard error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get teacher courses
router.get("/courses", async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?._id;

    const courses = await Course.find({ teacher: teacherId })
      .populate("students", "name email")
      .exec();

    res.json({
      courses: courses.map((course) => ({
        id: course._id,
        title: course.title,
        description: course.description,
        students: course.students,
        schedule: course.schedule,
        semester: course.semester,
        createdAt: course.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Get courses error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new course
router.post("/courses", async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?._id;
    const { title, description, schedule, semester } = req.body;

    const course = new Course({
      title,
      description,
      teacher: teacherId,
      schedule,
      semester,
      students: [],
    });

    await course.save();

    res.status(201).json({
      message: "Course created successfully",
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        schedule: course.schedule,
        semester: course.semester,
      },
    });
  } catch (error: any) {
    console.error("Create course error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get course assignments
router.get(
  "/courses/:courseId/assignments",
  async (req: AuthRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.user?._id;

      // Verify teacher owns this course
      const course = await Course.findOne({
        _id: courseId,
        teacher: teacherId,
      });

      if (!course) {
        return res.status(403).json({ message: "Course not found" });
      }

      const assignments = await Assignment.find({ course: courseId })
        .populate({
          path: "submissions.student",
          select: "name email",
        })
        .sort({ createdAt: -1 });

      res.json({
        assignments: assignments.map((assignment) => ({
          id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          totalPoints: assignment.totalPoints,
          submissionCount: assignment.submissions.length,
          submissions: assignment.submissions.map((sub) => ({
            id: sub._id,
            student: sub.student,
            submittedAt: sub.submittedAt,
            grade: sub.grade,
            feedback: sub.feedback,
            fileUrl: sub.fileUrl,
          })),
        })),
      });
    } catch (error: any) {
      console.error("Get assignments error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// Create assignment
router.post(
  "/courses/:courseId/assignments",
  async (req: AuthRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.user?._id;
      const { title, description, dueDate, totalPoints } = req.body;

      // Verify teacher owns this course
      const course = await Course.findOne({
        _id: courseId,
        teacher: teacherId,
      });

      if (!course) {
        return res.status(403).json({ message: "Course not found" });
      }

      const assignment = new Assignment({
        title,
        description,
        course: courseId,
        teacher: teacherId,
        dueDate: new Date(dueDate),
        totalPoints,
        submissions: [],
      });

      await assignment.save();

      res.status(201).json({
        message: "Assignment created successfully",
        assignment: {
          id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          totalPoints: assignment.totalPoints,
        },
      });
    } catch (error: any) {
      console.error("Create assignment error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// Grade assignment submission
router.put(
  "/assignments/:assignmentId/submissions/:submissionId/grade",
  async (req: AuthRequest, res: Response) => {
    try {
      const { assignmentId, submissionId } = req.params;
      const { grade, feedback } = req.body;
      const teacherId = req.user?._id;

      const assignment = await Assignment.findOne({
        _id: assignmentId,
        teacher: teacherId,
      });

      if (!assignment) {
        return res.status(403).json({ message: "Assignment not found" });
      }

      const submission = assignment.submissions.find(
        (sub) => sub._id?.toString() === submissionId,
      );

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      submission.grade = grade;
      submission.feedback = feedback || "";

      await assignment.save();

      // Update enrollment grade (simplified average)
      const enrollment = await Enrollment.findOne({
        student: submission.student,
        course: assignment.course,
      });

      if (enrollment) {
        const studentAssignments = await Assignment.find({
          course: assignment.course,
          "submissions.student": submission.student,
        });

        let totalGrade = 0;
        let gradeCount = 0;

        studentAssignments.forEach((assign) => {
          const studentSub = assign.submissions.find(
            (sub) => sub.student.toString() === submission.student.toString(),
          );
          if (studentSub?.grade !== undefined) {
            totalGrade += (studentSub.grade / assign.totalPoints) * 100;
            gradeCount++;
          }
        });

        if (gradeCount > 0) {
          enrollment.currentGrade = totalGrade / gradeCount;
          await enrollment.save();
        }
      }

      res.json({ message: "Grade submitted successfully" });
    } catch (error: any) {
      console.error("Grade submission error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// Add student to course
router.post(
  "/courses/:courseId/students",
  async (req: AuthRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const { studentEmail } = req.body;
      const teacherId = req.user?._id;

      // Verify teacher owns this course
      const course = await Course.findOne({
        _id: courseId,
        teacher: teacherId,
      });

      if (!course) {
        return res.status(403).json({ message: "Course not found" });
      }

      // Find student by email
      const student = await User.findOne({
        email: studentEmail,
        role: "student",
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        student: student._id,
        course: courseId,
      });

      if (existingEnrollment) {
        return res
          .status(400)
          .json({ message: "Student already enrolled in this course" });
      }

      // Create enrollment
      const enrollment = new Enrollment({
        student: student._id,
        course: courseId,
        status: "active",
      });

      await enrollment.save();

      // Add student to course
      course.students.push(student._id);
      await course.save();

      res.json({ message: "Student added to course successfully" });
    } catch (error: any) {
      console.error("Add student error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

export default router;
