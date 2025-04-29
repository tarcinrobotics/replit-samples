import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBookingSchema, insertCourseSchema, insertReviewSchema, insertNotificationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check user role
const hasRole = (role: string | string[]) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Only ${roles.join(' or ')} can access this resource` });
    }

    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes
  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      // Get all published courses
      const allCourses = await storage.getAllCourses();
      const courses = allCourses.filter(course => course.published === true);

      // Get tutor info and reviews for each course
      const coursesWithDetails = await Promise.all(
        courses.map(async (course) => {
          const tutor = await storage.getUser(course.tutorId);
          const reviews = await storage.getReviewsByCourseId(course.id);
          const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
            : 0;

          // Add debug logging
          console.log(`Processing course ${course.id}: ${course.title}`);

          return {
            ...course,
            tutorName: tutor ? tutor.name : "Unknown Tutor",
            averageRating: parseFloat(averageRating.toFixed(1)),
            reviewCount: reviews.length,
            tutor: {
              id: tutor?.id,
              name: tutor?.name || "Unknown Tutor"
            }
          };
        })
      );

      // Log the final response
      console.log("Sending courses:", coursesWithDetails.length);

      res.json(coursesWithDetails);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get a specific course by ID
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Get tutor info
      const tutor = await storage.getUser(course.tutorId);

      // Get reviews for course
      const reviews = await storage.getReviewsByCourseId(courseId);

      // Get detailed reviews with student info
      const reviewsWithStudentInfo = await Promise.all(
        reviews.map(async (review) => {
          const student = await storage.getUser(review.studentId);
          return {
            ...review,
            studentName: student ? student.name : "Unknown Student",
          };
        })
      );

      res.json({
        ...course,
        tutor: tutor ? { id: tutor.id, name: tutor.name, email: tutor.email, role: tutor.role } : null,
        reviews: reviewsWithStudentInfo,
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Get courses by subject
  app.get("/api/courses/subject/:subject", async (req, res) => {
    try {
      const subject = req.params.subject;
      const courses = await storage.getCoursesBySubject(subject);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses by subject:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Create a course (tutors only)
  app.post("/api/courses", isAuthenticated, hasRole("Tutor"), async (req, res) => {
    try {
      const tutor = await storage.getUser(req.user.id);

      // Temporarily allow all tutors to create courses for testing
      if (!tutor.isApproved) {
        await storage.updateUserApprovalStatus(tutor.id, true);
      }

      const courseData = insertCourseSchema.parse({
        ...req.body,
        tutorId: req.user.id,
      });

      // Create course with all required fields
      // Create course with all required fields
      const course = await storage.createCourse({
        ...courseData,
        averageRating: 0,
        createdAt: new Date(),
        published: true // Ensure course is published
      });

      // Log creation with published status
      console.log("Creating course with published status:", true);

      // Create notification for admin
      await storage.createNotification({
        userId: 1, // Admin ID
        message: `New course "${course.title}" created by ${tutor.name}`,
        type: "course",
        relatedId: course.id
      });

      // Update course list
      const allCourses = await storage.getAllCourses();
      console.log(`Total courses after creation: ${allCourses.length}`);

      // Update course ratings and reviews
      const reviews = await storage.getReviewsByCourseId(course.id);
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      await storage.updateCourseRating(course.id, avgRating);

      res.status(201).json(course);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Update course (tutors only)
  app.put("/api/courses/:id", isAuthenticated, hasRole("Tutor"), async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      // Check if course exists
      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if tutor owns the course
      if (course.tutorId !== req.user.id && req.user.role !== "Admin") {
        return res.status(403).json({ message: "You do not have permission to update this course" });
      }

      const courseData = insertCourseSchema.parse({
        ...req.body,
        tutorId: course.tutorId, // Preserve original tutorId
      });

      const updatedCourse = await storage.updateCourse(courseId, courseData);
      res.json(updatedCourse);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Patch course (partial update for tutors only)
  app.patch("/api/courses/:id", isAuthenticated, hasRole("Tutor"), async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      // Check if course exists
      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if tutor owns the course
      if (course.tutorId !== req.user.id && req.user.role !== "Admin") {
        return res.status(403).json({ message: "You do not have permission to update this course" });
      }

      // Use partial validation for PATCH
      const courseData = insertCourseSchema.partial().parse({
        ...req.body,
        tutorId: course.tutorId, // Preserve original tutorId
      });

      const updatedCourse = await storage.updateCourse(courseId, courseData);
      res.json(updatedCourse);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Delete course (tutors only)
  app.delete("/api/courses/:id", isAuthenticated, hasRole(["Tutor", "Admin"]), async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      // Check if course exists
      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if tutor owns the course or is admin
      if (course.tutorId !== req.user.id && req.user.role !== "Admin") {
        return res.status(403).json({ message: "You do not have permission to delete this course" });
      }

      const success = await storage.deleteCourse(courseId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete course" });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Create a booking (students only)
  app.post("/api/bookings", isAuthenticated, hasRole("Student"), async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        studentId: req.user.id,
      });

      // Check if course exists
      const course = await storage.getCourseById(bookingData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if booking already exists
      const existingBooking = await storage.getBookingByStudentAndCourse(
        bookingData.studentId,
        bookingData.courseId
      );
      if (existingBooking) {
        return res.status(400).json({ message: "You have already booked this course" });
      }

      // Get student info
      const student = await storage.getUser(req.user.id);

      // Create booking with proper status and student details
      const booking = await storage.createBooking({
        courseId: bookingData.courseId,
        studentId: student.id,
        status: "Pending",
        bookingTime: new Date()
      });

      // Log booking creation
      console.log(`New booking created for course ${bookingData.courseId} by student ${student.name}`);

      // Create notification for tutor
      await storage.createNotification({
        userId: course.tutorId,
        message: `New booking request from ${student.name} for your course "${course.title}"`,
        type: "booking",
        relatedId: booking.id
      });

      // Create notification for student
      await storage.createNotification({
        userId: student.id,
        message: `Your booking request for "${course.title}" has been submitted and is pending tutor approval`,
        type: "booking",
        relatedId: booking.id
      });

      res.status(201).json({
        ...booking,
        course,
        student: {
          id: student.id,
          name: student.name,
          email: student.email
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get student bookings (dashboard data)
  app.get("/api/student/dashboard", isAuthenticated, hasRole("Student"), async (req, res) => {
    try {
      const bookings = await storage.getBookingsByStudentId(req.user.id);
      const detailedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const course = await storage.getCourseById(booking.courseId);
          const tutor = course ? await storage.getUser(course.tutorId) : null;
          return {
            ...booking,
            course,
            tutor: tutor ? { id: tutor.id, name: tutor.name, email: tutor.email, role: tutor.role } : null,
          };
        })
      );

      // Get notifications
      const notifications = await storage.getNotificationsByUserId(req.user.id);

      res.json({
        bookings: detailedBookings,
        notifications: notifications
      });
    } catch (error) {
      console.error("Error fetching student dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Get student's confirmed courses
  app.get("/api/student/courses", isAuthenticated, hasRole("Student"), async (req, res) => {
    try {
      const confirmedBookings = await storage.getConfirmedBookingsByStudentId(req.user.id);

      const detailedCourses = await Promise.all(
        confirmedBookings.map(async (booking) => {
          const course = await storage.getCourseById(booking.courseId);
          const tutor = course ? await storage.getUser(course.tutorId) : null;

          // Get student's review for this course if exists
          const reviews = await storage.getReviewsByCourseId(booking.courseId);
          const studentReview = reviews.find(review => review.studentId === req.user.id);

          return {
            ...course,
            booking: {
              id: booking.id,
              status: booking.status,
              bookingTime: booking.bookingTime,
              sessionDate: booking.sessionDate
            },
            tutor: tutor ? { id: tutor.id, name: tutor.name, email: tutor.email, role: tutor.role } : null,
            hasReview: !!studentReview,
            review: studentReview
          };
        })
      );

      res.json(detailedCourses);
    } catch (error) {
      console.error("Error fetching student courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get tutor courses and bookings (dashboard data)
  app.get("/api/tutor/dashboard", isAuthenticated, hasRole("Tutor"), async (req, res) => {
    try {
      const courses = await storage.getCoursesByTutorId(req.user.id);
      const courseIds = courses.map((course) => course.id);

      const bookings = await storage.getBookingsByCourseIds(courseIds);

      // Fetch student information for each booking
      type BookingWithStudent = typeof bookings[0] & { 
        student: { id: number; name: string; email: string } | null;
      };

      const bookingsWithStudents: BookingWithStudent[] = [];
      for (const booking of bookings) {
        const student = await storage.getUser(booking.studentId);
        bookingsWithStudents.push({
          ...booking,
          student: student ? {
            id: student.id,
            name: student.name,
            email: student.email
          } : null
        });
      }

      // Get reviews for each course
      const courseBookings = await Promise.all(courses.map(async (course) => {
        const courseBookings = bookingsWithStudents.filter(
          (booking) => booking.courseId === course.id
        );

        const reviews = await storage.getReviewsByCourseId(course.id);
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0;

        return {
          ...course,
          bookings: courseBookings.map(booking => ({
            ...booking,
            student: booking.student || {
              id: booking.studentId,
              name: "Unknown Student",
              email: ""
            }
          })),
          averageRating: avgRating,
          totalBookings: courseBookings.length
        };
      }));

      // Get notifications
      const notifications = await storage.getNotificationsByUserId(req.user.id);

      // Get review statistics
      const reviews = [];
      for (const course of courses) {
        const courseReviews = await storage.getReviewsByCourseId(course.id);
        reviews.push(...courseReviews);
      }

      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Log debug information
      console.log("Tutor Dashboard Request for user ID:", req.user.id);
      console.log("Courses:", courses.length ? courses.map(c => ({ id: c.id, title: c.title })) : "No courses");
      console.log("Bookings:", bookings.length ? bookings.map(b => ({ id: b.id, courseId: b.courseId, status: b.status })) : "No bookings");
      console.log("Course Bookings:", courseBookings.map(c => ({ 
        id: c.id, 
        title: c.title, 
        bookings: c.bookings.length 
      })));

      const responseData = {
        courses: courseBookings,
        totalCourses: courses.length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === "Pending").length,
        confirmedBookings: bookings.filter(b => b.status === "Confirmed").length,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: reviews.length,
        notifications: notifications
      };

      res.json(responseData);
    } catch (error) {
      console.error("Error fetching tutor dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Update booking status (tutors only)
  app.patch("/api/bookings/:id/status", isAuthenticated, hasRole("Tutor"), async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const { status, sessionDate } = req.body;
      if (status !== "Pending" && status !== "Confirmed" && status !== "Rejected") {
        return res.status(400).json({ message: "Invalid status value" });
      }

      // Check if booking exists
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if tutor owns the course
      const course = await storage.getCourseById(booking.courseId);
      if (!course || course.tutorId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to update this booking" });
      }

      // Update status
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);

      // If session date provided, update it too
      if (sessionDate && status === "Confirmed") {
        const sessionDateObj = new Date(sessionDate);
        await storage.updateBookingSessionDate(bookingId, sessionDateObj);
      }

      // Create notification for student when booking is confirmed
      if (status === "Confirmed") {
        await storage.createNotification({
          userId: booking.studentId,
          message: `Your booking for "${course.title}" has been confirmed`,
          type: "confirmation",
          relatedId: bookingId
        });
      }

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Create a review (students only)
  app.post("/api/reviews", isAuthenticated, hasRole("Student"), async (req, res) => {
    try {
      const { courseId, rating, reviewText } = req.body;

      // Validate input
      const reviewData = insertReviewSchema.parse({
        courseId: parseInt(courseId),
        rating: parseInt(rating),
        reviewText,
        studentId: req.user.id
      });

      // Check if course exists
      const course = await storage.getCourseById(reviewData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if student has a confirmed booking for this course
      const booking = await storage.getBookingByStudentAndCourse(req.user.id, reviewData.courseId);
      if (!booking) {
        return res.status(403).json({ message: "You must book this course before reviewing it" });
      }

      if (booking.status !== "Confirmed") {
        return res.status(403).json({ message: "You can only review confirmed bookings" });
      }

      // Check if student already reviewed this course
      const existingReviews = await storage.getReviewsByCourseId(reviewData.courseId);
      const existingReview = existingReviews.find(review => review.studentId === req.user.id);

      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this course" });
      }

      // Create review
      const review = await storage.createReview(reviewData);

      // Create notification for tutor
      await storage.createNotification({
        userId: course.tutorId,
        message: `New review (${rating}/5) for your course "${course.title}"`,
        type: "review",
        relatedId: review.id
      });

      // Update course average rating
      const courseReviews = await storage.getReviewsByCourseId(review.courseId);
      const avgRating = courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length;
      await storage.updateCourseRating(review.courseId, avgRating);

      await storage.createNotification({
        userId: course.tutorId,
        message: `New ${review.rating}/5 star review for "${course.title}"`,
        type: "review",
        relatedId: review.id
      });

      res.status(201).json({
        ...review,
        averageRating: avgRating
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Get user's notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const notification = await storage.markNotificationAsRead(notificationId);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const count = await storage.markAllNotificationsAsRead(req.user.id);
      res.json({ message: `Marked ${count} notifications as read` });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  // Get all subjects
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // ADMIN ROUTES

  // Get platform statistics (admin only)
  app.get("/api/admin/statistics", isAuthenticated, hasRole("Admin"), async (req, res) => {
    try {
      const statistics = await storage.getPlatformStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, hasRole("Admin"), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPassword);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get users by role (admin only)
  app.get("/api/admin/users/:role", isAuthenticated, hasRole("Admin"), async (req, res) => {
    try {
      const role = req.params.role;
      if (role !== "Student" && role !== "Tutor" && role !== "Admin") {
        return res.status(400).json({ message: "Invalid role" });
      }

      const users = await storage.getUsersByRole(role);
      // Remove password from response
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPassword);
    } catch (error) {
      console.error("Error fetching users by role:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Approve/reject tutor (admin only)
  app.patch("/api/admin/users/:id/approve", isAuthenticated, hasRole("Admin"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const { isApproved } = req.body;
      if (typeof isApproved !== "boolean") {
        return res.status(400).json({ message: "isApproved must be a boolean" });
      }

      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user is a tutor
      if (user.role !== "Tutor") {
        return res.status(400).json({ message: "Only tutors can be approved/rejected" });
      }

      // Update approval status
      const updatedUser = await storage.updateUserApprovalStatus(userId, isApproved);
      const { password, ...userWithoutPassword } = updatedUser;

      // Create notification for tutor
      await storage.createNotification({
        userId: userId,
        message: isApproved 
          ? "Congratulations! Your tutor account has been approved." 
          : "Your tutor account application has been rejected.",
        type: "approval",
        relatedId: userId
      });

      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating tutor approval:", error);
      res.status(500).json({ message: "Failed to update tutor approval" });
    }
  });

  // Get all courses (admin only)
  app.get("/api/admin/courses", isAuthenticated, hasRole("Admin"), async (req, res) => {
    try {
      const courses = await storage.getAllCourses();

      // Get detailed course info with tutor names
      const detailedCourses = await Promise.all(
        courses.map(async (course) => {
          const tutor = await storage.getUser(course.tutorId);
          return {
            ...course,
            tutorName: tutor ? tutor.name : "Unknown Tutor",
          };
        })
      );

      res.json(detailedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get all bookings (admin only)
  app.get("/api/admin/bookings", isAuthenticated, hasRole("Admin"), async (req, res) => {
    try {
      const bookings = await Promise.all(
        Array.from(await storage.getAllCourses()).flatMap(async (course) => {
          const courseBookings = await storage.getBookingByCourseId(course.id);
          return Promise.all(courseBookings.map(async (booking) => {
            const student = await storage.getUser(booking.studentId);
            const tutor = await storage.getUser(course.tutorId);
            return {
              ...booking,
              course: {
                id: course.id,
                title: course.title,
                subject: course.subject
              },
              student: student ? { 
                id: student.id, 
                name: student.name, 
                email: student.email 
              } : null,
              tutor: tutor ? { 
                id: tutor.id, 
                name: tutor.name, 
                email: tutor.email 
              } : null
            };
          }));
        })
      ).then(arrays => arrays.flat());

      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}