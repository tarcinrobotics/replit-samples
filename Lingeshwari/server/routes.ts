import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCourseSchema, insertBookingSchema, insertTutorProfileSchema, insertEnrollmentSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Helper middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Helper middleware to check if user has specific role
  const hasRole = (role: string) => (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getActiveCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", isAuthenticated, hasRole("tutor"), async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        tutorId: req.user?.id
      });
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put("/api/courses/:id", isAuthenticated, hasRole("tutor"), async (req, res) => {
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if the tutor owns the course
      if (course.tutorId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to update this course" });
      }
      
      const updatedCourse = await storage.updateCourse(course.id, req.body);
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, hasRole("tutor"), async (req, res) => {
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if the tutor owns the course
      if (course.tutorId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to delete this course" });
      }
      
      await storage.deleteCourse(course.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Tutor routes
  app.get("/api/tutors", async (req, res) => {
    try {
      const tutors = await storage.getUsersByRole("tutor");
      res.json(tutors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });
  
  app.get("/api/tutor-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllTutorProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutor profiles" });
    }
  });

  app.get("/api/tutors/:id", async (req, res) => {
    try {
      const tutor = await storage.getUser(parseInt(req.params.id));
      if (!tutor || tutor.role !== "tutor") {
        return res.status(404).json({ message: "Tutor not found" });
      }
      
      const profile = await storage.getTutorProfileByUserId(tutor.id);
      
      res.json({ ...tutor, profile });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutor" });
    }
  });

  app.get("/api/tutors/:id/courses", async (req, res) => {
    try {
      const tutor = await storage.getUser(parseInt(req.params.id));
      if (!tutor || tutor.role !== "tutor") {
        return res.status(404).json({ message: "Tutor not found" });
      }
      
      const courses = await storage.getCoursesByTutorId(tutor.id);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutor courses" });
    }
  });

  app.put("/api/tutors/profile", isAuthenticated, hasRole("tutor"), async (req, res) => {
    try {
      const profile = await storage.getTutorProfileByUserId(req.user?.id as number);
      if (!profile) {
        // Create profile if it doesn't exist
        const profileData = insertTutorProfileSchema.parse({
          ...req.body,
          userId: req.user?.id
        });
        const newProfile = await storage.createTutorProfile(profileData);
        return res.json(newProfile);
      }
      
      // Update existing profile
      const updatedProfile = await storage.updateTutorProfile(profile.id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tutor profile" });
    }
  });

  // Booking routes
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      let bookings;
      
      if (req.user?.role === "student") {
        bookings = await storage.getBookingsByStudentId(req.user.id);
      } else if (req.user?.role === "tutor") {
        bookings = await storage.getBookingsByTutorId(req.user.id);
      } else if (req.user?.role === "admin") {
        // Admins can see all bookings
        const allBookings = Array.from(new Map());
        bookings = await Promise.all(
          allBookings.map(async (booking) => {
            const student = await storage.getUser(booking.studentId);
            const tutor = await storage.getUser(booking.tutorId);
            const course = await storage.getCourse(booking.courseId);
            return { ...booking, student, tutor, course };
          })
        );
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", isAuthenticated, hasRole("student"), async (req, res) => {
    try {
      const course = await storage.getCourse(req.body.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Handle date conversion
      let formattedData = { ...req.body };
      if (typeof formattedData.date === 'string') {
        formattedData.date = new Date(formattedData.date);
      }
      
      const bookingData = insertBookingSchema.parse({
        ...formattedData,
        studentId: req.user?.id,
        tutorId: course.tutorId,
        status: "pending"
      });
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getBooking(parseInt(req.params.id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only allow tutor to update status
      if (req.user?.role === "tutor" && booking.tutorId === req.user.id) {
        const { status } = req.body;
        if (!["accepted", "rejected", "completed", "cancelled"].includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }
        
        const updatedBooking = await storage.updateBooking(booking.id, { status });
        return res.json(updatedBooking);
      }
      
      // Students can only cancel their own bookings
      if (req.user?.role === "student" && booking.studentId === req.user.id) {
        if (req.body.status === "cancelled") {
          const updatedBooking = await storage.updateBooking(booking.id, { status: "cancelled" });
          return res.json(updatedBooking);
        }
        return res.status(403).json({ message: "Students can only cancel bookings" });
      }
      
      res.status(403).json({ message: "Not authorized to update this booking" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Enrollment routes
  app.get("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      let enrollments;
      
      if (req.user?.role === "student") {
        enrollments = await storage.getEnrollmentsByStudentId(req.user.id);
        
        // Append course details
        enrollments = await Promise.all(
          enrollments.map(async (enrollment) => {
            const course = await storage.getCourse(enrollment.courseId);
            return { ...enrollment, course };
          })
        );
      } else if (req.user?.role === "tutor") {
        // Get all courses by this tutor
        const courses = await storage.getCoursesByTutorId(req.user.id);
        
        // Get enrollments for each course
        enrollments = [];
        for (const course of courses) {
          const courseEnrollments = await storage.getEnrollmentsByCourseId(course.id);
          enrollments.push(...courseEnrollments.map(e => ({ ...e, course })));
        }
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post("/api/enrollments", isAuthenticated, hasRole("student"), async (req, res) => {
    try {
      const course = await storage.getCourse(req.body.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if already enrolled
      const existing = await storage.getEnrollmentsByCourseId(course.id);
      const alreadyEnrolled = existing.some(e => e.studentId === req.user?.id);
      if (alreadyEnrolled) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      const enrollmentData = insertEnrollmentSchema.parse({
        courseId: course.id,
        studentId: req.user?.id as number,
        enrollmentDate: new Date(),
        status: "active"
      });
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid enrollment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Review routes
  app.get("/api/reviews/course/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByCourseId(courseId);
      
      // Add student names
      const reviewsWithNames = await Promise.all(
        reviews.map(async (review) => {
          const student = await storage.getUser(review.studentId);
          return {
            ...review,
            studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
          };
        })
      );
      
      res.json(reviewsWithNames);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", isAuthenticated, hasRole("student"), async (req, res) => {
    try {
      const course = await storage.getCourse(req.body.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Verify student is enrolled in the course
      const enrollments = await storage.getEnrollmentsByStudentId(req.user?.id as number);
      const isEnrolled = enrollments.some(e => e.courseId === course.id);
      if (!isEnrolled) {
        return res.status(403).json({ message: "You must be enrolled in the course to review it" });
      }
      
      // Check if student already reviewed this course
      const reviews = await storage.getReviewsByCourseId(course.id);
      const alreadyReviewed = reviews.some(r => r.studentId === req.user?.id);
      if (alreadyReviewed) {
        return res.status(400).json({ message: "You have already reviewed this course" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        studentId: req.user?.id as number,
        tutorId: course.tutorId,
        date: new Date()
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // User profile routes
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user?.id as number);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let profile = null;
      if (user.role === "tutor") {
        profile = await storage.getTutorProfileByUserId(user.id);
      }
      
      res.json({ user, profile });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const { password, role, ...updateData } = req.body; // Prevent changing password or role through this endpoint
      
      const updatedUser = await storage.updateUser(req.user?.id as number, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, hasRole("admin"), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id", isAuthenticated, hasRole("admin"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get("/api/admin/courses", isAuthenticated, hasRole("admin"), async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
