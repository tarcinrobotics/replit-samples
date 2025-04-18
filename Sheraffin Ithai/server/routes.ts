import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCourseSchema, insertStudentSchema, insertInstructorSchema, insertAssignmentSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API routes for dashboard data
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/enrollments", async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentTrend();
      res.json(enrollments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/popular-courses", async (req, res) => {
    try {
      const courses = await storage.getPopularCourses();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Recent students
  app.get("/api/students/recent", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as string || 'week';
      const students = await storage.getStudents();
      // This would typically be filtered by timeframe
      // For now, just return the first 4 students
      const recentStudents = students.slice(0, 4);
      res.json({ students: recentStudents, total: students.length });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Recent activities
  app.get("/api/activities/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 4;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const parseResult = insertUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid user data",
          errors: parseResult.error.errors
        });
      }
      
      const existingUser = await storage.getUserByUsername(parseResult.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(parseResult.data);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const parseResult = insertCourseSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid course data",
          errors: parseResult.error.errors
        });
      }
      
      const course = await storage.createCourse(parseResult.data);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Student routes
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const parseResult = insertStudentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid student data",
          errors: parseResult.error.errors
        });
      }
      
      const student = await storage.createStudent(parseResult.data);
      res.status(201).json(student);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Instructor routes
  app.get("/api/instructors", async (req, res) => {
    try {
      const instructors = await storage.getInstructors();
      res.json(instructors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/instructors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const instructor = await storage.getInstructor(id);
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      
      res.json(instructor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/instructors", async (req, res) => {
    try {
      const parseResult = insertInstructorSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid instructor data",
          errors: parseResult.error.errors
        });
      }
      
      const instructor = await storage.createInstructor(parseResult.data);
      res.status(201).json(instructor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assignment routes
  app.get("/api/assignments", async (req, res) => {
    try {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/assignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const assignment = await storage.getAssignment(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assignments", async (req, res) => {
    try {
      const parseResult = insertAssignmentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid assignment data",
          errors: parseResult.error.errors
        });
      }
      
      const assignment = await storage.createAssignment(parseResult.data);
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const parseResult = insertActivitySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid activity data",
          errors: parseResult.error.errors
        });
      }
      
      const activity = await storage.createActivity(parseResult.data);
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Content routes
  app.get("/api/content", async (req, res) => {
    try {
      const contents = await storage.getContents();
      res.json(contents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Video routes
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Analytics routes
  app.get("/api/analytics/students", async (req, res) => {
    try {
      // For now, just returning mock data that matches the frontend display
      const data = {
        totalStudents: 2547,
        activeStudents: 1823,
        newStudents: 432,
        completionRate: 78.3,
        byGender: [
          { name: 'Male', value: 38 },
          { name: 'Female', value: 52 },
          { name: 'Other', value: 10 }
        ],
        byAge: [
          { name: '18-24', value: 45 },
          { name: '25-34', value: 30 },
          { name: '35-44', value: 15 },
          { name: '45+', value: 10 }
        ],
        byLocation: [
          { name: 'North America', value: 40 },
          { name: 'Europe', value: 30 },
          { name: 'Asia', value: 20 },
          { name: 'Other', value: 10 }
        ],
        performanceData: [
          { month: 'Jan', average: 78 },
          { month: 'Feb', average: 75 },
          { month: 'Mar', average: 80 },
          { month: 'Apr', average: 82 },
          { month: 'May', average: 85 },
          { month: 'Jun', average: 82 },
          { month: 'Jul', average: 80 },
          { month: 'Aug', average: 84 },
          { month: 'Sep', average: 87 },
          { month: 'Oct', average: 89 },
          { month: 'Nov', average: 90 },
          { month: 'Dec', average: 88 }
        ]
      };
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/courses", async (req, res) => {
    try {
      // For now, just returning mock data that matches the frontend display
      const data = {
        totalCourses: 36,
        activeCourses: 28,
        completedCourses: 8,
        averageCompletion: 82.5,
        byCategory: [
          { name: 'Web Development', value: 30 },
          { name: 'Data Science', value: 25 },
          { name: 'Mobile Development', value: 20 },
          { name: 'Design', value: 15 },
          { name: 'Other', value: 10 }
        ],
        byDifficulty: [
          { name: 'Beginner', value: 45 },
          { name: 'Intermediate', value: 35 },
          { name: 'Advanced', value: 20 }
        ],
        popularCourses: [
          { name: 'Web Development Fundamentals', students: 358 },
          { name: 'Data Science Essentials', students: 295 },
          { name: 'Mobile App Development', students: 247 },
          { name: 'UI/UX Design Principles', students: 214 },
          { name: 'Machine Learning Basics', students: 183 }
        ],
        enrollmentTrend: [
          { month: 'Jan', value: 155 },
          { month: 'Feb', value: 190 },
          { month: 'Mar', value: 210 },
          { month: 'Apr', value: 245 },
          { month: 'May', value: 270 },
          { month: 'Jun', value: 310 },
          { month: 'Jul', value: 290 },
          { month: 'Aug', value: 320 },
          { month: 'Sep', value: 380 },
          { month: 'Oct', value: 355 },
          { month: 'Nov', value: 370 },
          { month: 'Dec', value: 390 }
        ]
      };
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
