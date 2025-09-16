import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import auth, { AuthRequest } from "../middleware/auth";

const router = Router();

// Register user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role
    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
    });

    await user.save();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get current user
router.get("/me", auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    res.json({
      user: {
        id: user?._id,
        email: user?.email,
        name: user?.name,
        role: user?.role,
        profilePicture: user?.profilePicture,
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Logout (client-side only, just remove token)
router.post("/logout", (req: Request, res: Response) => {
  res.json({ message: "Logout successful" });
});

export default router;
