import mongoose from "mongoose";
import User from "../models/User";
import Course from "../models/Course";
import Assignment from "../models/Assignment";
import Enrollment from "../models/Enrollment";
import connectDB from "./connection";

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await Enrollment.deleteMany({});

    console.log("🗑️  Cleared existing data");

    // Create users
    const teacher1 = new User({
      email: "prof.smith@eduhub.com",
      password: "password123",
      name: "Professor Smith",
      role: "teacher",
    });

    const teacher2 = new User({
      email: "dr.johnson@eduhub.com",
      password: "password123",
      name: "Dr. Johnson",
      role: "teacher",
    });

    const student1 = new User({
      email: "alex.student@eduhub.com",
      password: "password123",
      name: "Alex Johnson",
      role: "student",
    });

    const student2 = new User({
      email: "sarah.student@eduhub.com",
      password: "password123",
      name: "Sarah Wilson",
      role: "student",
    });

    const student3 = new User({
      email: "mike.student@eduhub.com",
      password: "password123",
      name: "Mike Davis",
      role: "student",
    });

    await Promise.all([
      teacher1.save(),
      teacher2.save(),
      student1.save(),
      student2.save(),
      student3.save(),
    ]);

    console.log("👥 Created users");

    // Create courses
    const course1 = new Course({
      title: "Advanced Mathematics",
      description: "Advanced calculus and linear algebra concepts",
      teacher: teacher1._id,
      students: [student1._id, student2._id, student3._id],
      schedule: {
        days: ["Monday", "Wednesday", "Friday"],
        time: "10:00 AM",
        room: "Room 204",
      },
      semester: "Fall 2024",
    });

    const course2 = new Course({
      title: "Physics Laboratory",
      description: "Hands-on physics experiments and lab work",
      teacher: teacher1._id,
      students: [student1._id, student2._id],
      schedule: {
        days: ["Tuesday", "Thursday"],
        time: "2:00 PM",
        room: "Lab 101",
      },
      semester: "Fall 2024",
    });

    const course3 = new Course({
      title: "Computer Science",
      description: "Programming fundamentals and algorithms",
      teacher: teacher2._id,
      students: [student1._id, student3._id],
      schedule: {
        days: ["Wednesday"],
        time: "1:00 PM",
        room: "Room 305",
      },
      semester: "Fall 2024",
    });

    const course4 = new Course({
      title: "Chemistry",
      description: "Organic and inorganic chemistry principles",
      teacher: teacher2._id,
      students: [student1._id, student2._id, student3._id],
      schedule: {
        days: ["Thursday"],
        time: "9:00 AM",
        room: "Lab 203",
      },
      semester: "Fall 2024",
    });

    await Promise.all([
      course1.save(),
      course2.save(),
      course3.save(),
      course4.save(),
    ]);

    console.log("📚 Created courses");

    // Create enrollments
    const enrollments = [
      new Enrollment({
        student: student1._id,
        course: course1._id,
        currentGrade: 85,
        status: "active",
      }),
      new Enrollment({
        student: student1._id,
        course: course2._id,
        currentGrade: 92,
        status: "active",
      }),
      new Enrollment({
        student: student1._id,
        course: course3._id,
        currentGrade: 78,
        status: "active",
      }),
      new Enrollment({
        student: student1._id,
        course: course4._id,
        currentGrade: 89,
        status: "active",
      }),
      new Enrollment({
        student: student2._id,
        course: course1._id,
        currentGrade: 90,
        status: "active",
      }),
      new Enrollment({
        student: student2._id,
        course: course2._id,
        currentGrade: 88,
        status: "active",
      }),
      new Enrollment({
        student: student2._id,
        course: course4._id,
        currentGrade: 95,
        status: "active",
      }),
      new Enrollment({
        student: student3._id,
        course: course1._id,
        currentGrade: 75,
        status: "active",
      }),
      new Enrollment({
        student: student3._id,
        course: course3._id,
        currentGrade: 82,
        status: "active",
      }),
      new Enrollment({
        student: student3._id,
        course: course4._id,
        currentGrade: 77,
        status: "active",
      }),
    ];

    await Promise.all(enrollments.map((enrollment) => enrollment.save()));

    console.log("📝 Created enrollments");

    // Create assignments
    const assignment1 = new Assignment({
      title: "Calculus Problem Set #3",
      description:
        "Solve integration and differentiation problems from Chapter 5",
      course: course1._id,
      teacher: teacher1._id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      totalPoints: 100,
      submissions: [
        {
          student: student2._id,
          submittedAt: new Date(),
          grade: 92,
          feedback: "Excellent work! Very clear solutions.",
        },
        {
          student: student3._id,
          submittedAt: new Date(),
          grade: 85,
          feedback: "Good work, minor calculation errors.",
        },
      ],
    });

    const assignment2 = new Assignment({
      title: "Physics Lab Report",
      description: "Write a comprehensive report on the pendulum experiment",
      course: course2._id,
      teacher: teacher1._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      totalPoints: 50,
      submissions: [
        {
          student: student1._id,
          submittedAt: new Date(),
          // No grade yet - pending
        },
      ],
    });

    const assignment3 = new Assignment({
      title: "Algorithm Implementation",
      description: "Implement sorting algorithms in your preferred language",
      course: course3._id,
      teacher: teacher2._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      totalPoints: 75,
      submissions: [],
    });

    const assignment4 = new Assignment({
      title: "Chemistry Quiz #2",
      description: "Online quiz covering chapters 5-7",
      course: course4._id,
      teacher: teacher2._id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      totalPoints: 25,
      submissions: [
        {
          student: student1._id,
          submittedAt: new Date(),
          grade: 23,
          feedback: "Well done!",
        },
        {
          student: student2._id,
          submittedAt: new Date(),
          grade: 25,
          feedback: "Perfect score!",
        },
      ],
    });

    await Promise.all([
      assignment1.save(),
      assignment2.save(),
      assignment3.save(),
      assignment4.save(),
    ]);

    console.log("📋 Created assignments");

    console.log("✅ Database seeded successfully!");
    console.log("\n🔑 Login credentials:");
    console.log("Teacher: prof.smith@eduhub.com / password123");
    console.log("Teacher: dr.johnson@eduhub.com / password123");
    console.log("Student: alex.student@eduhub.com / password123");
    console.log("Student: sarah.student@eduhub.com / password123");
    console.log("Student: mike.student@eduhub.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
