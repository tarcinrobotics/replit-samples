import {
  User, InsertUser, Course, InsertCourse, Booking, InsertBooking,
  userRoleEnum, bookingStatusEnum, Review, InsertReview, Notification, InsertNotification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define the SessionStore type
type SessionStore = session.Store;

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: "Student" | "Tutor" | "Admin"): Promise<User[]>;
  updateUserApprovalStatus(id: number, isApproved: boolean): Promise<User>;

  // Course methods
  getCourseById(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getCoursesBySubject(subject: string): Promise<Course[]>;
  getCoursesByTutorId(tutorId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<boolean>;
  updateCourseRating(id: number, averageRating: number): Promise<Course>;

  // Booking methods
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByStudentId(studentId: number): Promise<Booking[]>;
  getBookingByCourseId(courseId: number): Promise<Booking[]>;
  getBookingsByTutorId(tutorId: number): Promise<Booking[]>;
  getBookingsByCourseIds(courseIds: number[]): Promise<Booking[]>;
  getBookingByStudentAndCourse(studentId: number, courseId: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: "Pending" | "Confirmed"): Promise<Booking>;
  updateBookingSessionDate(id: number, sessionDate: Date): Promise<Booking>;
  getConfirmedBookingsByStudentId(studentId: number): Promise<Booking[]>;

  // Review methods
  getReviewById(id: number): Promise<Review | undefined>;
  getReviewsByCourseId(courseId: number): Promise<Review[]>;
  getReviewsByStudentId(studentId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Notification methods
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<number>;

  // Subject methods
  getAllSubjects(): Promise<string[]>;

  // Statistics methods
  getPlatformStatistics(): Promise<{
    totalStudents: number;
    totalTutors: number;
    totalCourses: number;
    totalBookings: number;
    confirmedBookings: number;
  }>;

  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private notifications: Map<number, Notification>;
  private subjects: string[];
  sessionStore: SessionStore;
  private userIdCounter: number;
  private courseIdCounter: number;
  private bookingIdCounter: number;
  private reviewIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.notifications = new Map();
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.bookingIdCounter = 1;
    this.reviewIdCounter = 1;
    this.notificationIdCounter = 1;
    this.subjects = ["Mathematics", "Programming", "Science", "English", "Business Studies"];
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Seed data
    this.seedData();
  }

  private seedData() {
    // Create admin user
    const admin = { 
      id: 1, 
      name: "Admin User", 
      email: "admin@educonnect.com", 
      password: "admin123", 
      role: "Admin" as const,
      isApproved: true,
      createdAt: new Date()
    };
    this.users.set(admin.id, admin);
    this.userIdCounter = 2;

    // Create tutors
    const tutors = [
      { 
        id: 2, 
        name: "Ravi Kumar", 
        email: "ravi@example.com", 
        password: "password123", 
        role: "Tutor" as const,
        isApproved: true,
        createdAt: new Date()
      },
      { 
        id: 3, 
        name: "Priya Sharma", 
        email: "priya@example.com", 
        password: "password123", 
        role: "Tutor" as const,
        isApproved: true,
        createdAt: new Date()
      },
      { 
        id: 4, 
        name: "Anjali Patel", 
        email: "anjali@example.com", 
        password: "password123", 
        role: "Tutor" as const,
        isApproved: true,
        createdAt: new Date()
      },
      { 
        id: 5, 
        name: "Amit Verma", 
        email: "amit@example.com", 
        password: "password123", 
        role: "Tutor" as const,
        isApproved: true,
        createdAt: new Date()
      },
      { 
        id: 6, 
        name: "Sunita Reddy", 
        email: "sunita@example.com", 
        password: "password123", 
        role: "Tutor" as const,
        isApproved: false,
        createdAt: new Date()
      },
    ];

    tutors.forEach(tutor => {
      this.users.set(tutor.id, tutor);
      this.userIdCounter = Math.max(this.userIdCounter, tutor.id + 1);
    });

    // Create sample student
    const student = { 
      id: 7, 
      name: "Student User", 
      email: "student@example.com", 
      password: "student123", 
      role: "Student" as const,
      isApproved: true,
      createdAt: new Date()
    };
    this.users.set(student.id, student);
    this.userIdCounter = 8;

    // Create courses
    const courses = [
      // Mathematics Courses
      { 
        id: 1, 
        title: "Algebra Basics", 
        description: "Learn fundamental algebra concepts including equations, functions, and graphing.", 
        category: "Mathematics", 
        price: 35.99, 
        subject: "Mathematics", 
        tutorId: 2,
        averageRating: 4.5,
        published: true,
        createdAt: new Date() 
      },
      { 
        id: 2, 
        title: "Calculus 101", 
        description: "Introduction to differential and integral calculus with practical applications.", 
        category: "Mathematics", 
        price: 45.99,
        subject: "Mathematics",
        tutorId: 2,
        averageRating: 4.2,
        published: true,
        createdAt: new Date()
      },
      {
        id: 3,
        title: "Geometry Mastery",
        description: "Master geometric concepts, theorems, and proofs with practical examples.",
        category: "Mathematics",
        price: 39.99,
        subject: "Mathematics",
        tutorId: 2,
        averageRating: 4.7,
        published: true,
        createdAt: new Date()
      },
      // Programming Courses
      {
        id: 4,
        title: "Python Programming",
        description: "Learn Python programming from basics to advanced concepts.",
        category: "Programming",
        price: 49.99,
        subject: "Programming",
        tutorId: 3,
        averageRating: 4.8,
        published: true,
        createdAt: new Date()
      },
      {
        id: 5,
        title: "Web Development Fundamentals",
        description: "Master HTML, CSS, and JavaScript for modern web development.",
        category: "Programming",
        price: 55.99,
        subject: "Programming",
        tutorId: 3,
        averageRating: 4.6,
        published: true,
        createdAt: new Date()
      },
      {
        id: 6,
        title: "Java Programming Essential",
        description: "Comprehensive Java programming course for beginners to intermediate.",
        category: "Programming",
        price: 45.99,
        subject: "Programming",
        tutorId: 3,
        averageRating: 4.4,
        published: true,
        createdAt: new Date()
      },
      // Science Courses
      {
        id: 7,
        title: "Physics Fundamentals",
        description: "Learn basic physics concepts, mechanics, and thermodynamics.",
        category: "Science",
        price: 42.99,
        subject: "Science",
        tutorId: 4,
        averageRating: 4.3,
        published: true,
        createdAt: new Date()
      },
      {
        id: 8,
        title: "Chemistry Basics",
        description: "Introduction to chemistry concepts and chemical reactions.",
        category: "Science",
        price: 41.99,
        subject: "Science",
        tutorId: 4,
        averageRating: 4.5,
        published: true,
        createdAt: new Date()
      },
      {
        id: 9,
        title: "Biology Essentials",
        description: "Explore fundamental concepts of biology and life sciences.",
        category: "Science",
        price: 39.99,
        subject: "Science",
        tutorId: 4,
        averageRating: 4.4,
        published: true,
        createdAt: new Date()
      },
      // English Courses
      {
        id: 10,
        title: "English Grammar",
        description: "Master English grammar rules and writing skills.",
        category: "English",
        price: 38.99,
        subject: "English",
        tutorId: 5,
        averageRating: 4.6,
        published: true,
        createdAt: new Date()
      },
      {
        id: 11,
        title: "Creative Writing",
        description: "Learn creative writing techniques and story development.",
        category: "English",
        price: 36.99,
        subject: "English",
        tutorId: 5,
        averageRating: 4.7,
        published: true,
        createdAt: new Date()
      },
      {
        id: 12,
        title: "Business English",
        description: "Professional English communication for business contexts.",
        category: "English",
        price: 44.99,
        subject: "English",
        tutorId: 5,
        averageRating: 4.5,
        published: true,
        createdAt: new Date()
      }
    ];

    courses.forEach(course => {
      this.courses.set(course.id, course);
      this.courseIdCounter = Math.max(this.courseIdCounter, course.id + 1);
    });

    // Add sample reviews
    const reviews = [
      {
        id: 1,
        rating: 5,
        reviewText: "Excellent course! The instructor explained concepts clearly.",
        studentId: 7,
        courseId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        rating: 4,
        reviewText: "Very informative and practical examples.",
        studentId: 7,
        courseId: 4,
        createdAt: new Date()
      }
    ];

    reviews.forEach(review => {
      this.reviews.set(review.id, review);
      this.reviewIdCounter = Math.max(this.reviewIdCounter, review.id + 1);
    });

    // Add sample bookings
    const bookings = [
      {
        id: 1,
        status: "Confirmed" as const,
        bookingTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        studentId: 7,
        courseId: 1,
        sessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days in future
      },
      {
        id: 2,
        status: "Confirmed" as const,
        bookingTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        studentId: 7,
        courseId: 4,
        sessionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days in future
      },
      {
        id: 3,
        status: "Pending" as const,
        bookingTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        studentId: 7,
        courseId: 5,
        sessionDate: null
      }
    ];

    bookings.forEach(booking => {
      this.bookings.set(booking.id, booking);
      this.bookingIdCounter = Math.max(this.bookingIdCounter, booking.id + 1);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const isApproved = user.role === 'Student' || user.role === 'Admin';
    // Ensure role is properly set
    const role = user.role as "Student" | "Tutor" | "Admin";
    const newUser: User = { 
      ...user, 
      id, 
      createdAt, 
      isApproved,
      role 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: "Student" | "Tutor" | "Admin"): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async updateUserApprovalStatus(id: number, isApproved: boolean): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = { ...user, isApproved };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Course methods
  async getCourseById(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCoursesBySubject(subject: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.subject === subject);
  }

  async getCoursesByTutorId(tutorId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.tutorId === tutorId);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const createdAt = new Date();
    const averageRating = 0;
    
    const newCourse: Course = {
      id,
      title: course.title,
      description: course.description,
      subject: course.subject,
      category: course.category,
      price: course.price,
      tutorId: course.tutorId,
      createdAt,
      averageRating,
      published: true // Always publish courses by default
    };
    
    // Log course creation with published status
    console.log("Creating new course:", { ...newCourse, published: true });
    this.courses.set(id, newCourse);
    
    // Verify course was added
    const savedCourse = this.courses.get(id);
    console.log("Saved course:", savedCourse);
    
    return newCourse;
  }

  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course> {
    const course = this.courses.get(id);
    if (!course) {
      throw new Error(`Course with ID ${id} not found`);
    }
    
    const updatedCourse: Course = { ...course, ...courseData };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const exists = this.courses.has(id);
    if (!exists) {
      return false;
    }
    
    // Delete associated bookings and reviews first
    const courseBookings = await this.getBookingByCourseId(id);
    for (const booking of courseBookings) {
      this.bookings.delete(booking.id);
    }
    
    const courseReviews = await this.getReviewsByCourseId(id);
    for (const review of courseReviews) {
      this.reviews.delete(review.id);
    }
    
    // Now delete the course
    return this.courses.delete(id);
  }

  async updateCourseRating(id: number, averageRating: number): Promise<Course> {
    const course = this.courses.get(id);
    if (!course) {
      throw new Error(`Course with ID ${id} not found`);
    }
    
    const updatedCourse: Course = { ...course, averageRating };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }
  
  // Booking methods
  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByStudentId(studentId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.studentId === studentId);
  }

  async getBookingByCourseId(courseId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.courseId === courseId);
  }

  async getBookingsByTutorId(tutorId: number): Promise<Booking[]> {
    const tutorCourses = await this.getCoursesByTutorId(tutorId);
    const courseIds = tutorCourses.map(course => course.id);
    return Array.from(this.bookings.values()).filter(booking => courseIds.includes(booking.courseId));
  }

  async getBookingsByCourseIds(courseIds: number[]): Promise<Booking[]> {
    const allBookings = Array.from(this.bookings.values());
    const filteredBookings = allBookings.filter(booking => courseIds.includes(booking.courseId));
    
    // Add student info to each booking
    const bookingsWithStudents = await Promise.all(
      filteredBookings.map(async (booking) => {
        const student = await this.getUser(booking.studentId);
        return {
          ...booking,
          student: student ? {
            id: student.id,
            name: student.name,
            email: student.email
          } : null
        };
      })
    );
    
    return bookingsWithStudents;
  }

  async getBookingByStudentAndCourse(studentId: number, courseId: number): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(
      booking => booking.studentId === studentId && booking.courseId === courseId
    );
  }

  async getConfirmedBookingsByStudentId(studentId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.studentId === studentId && booking.status === "Confirmed"
    );
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const bookingTime = new Date();
    const sessionDate = null;
    // Ensure status is set correctly
    const status = booking.status || "Pending";
    const newBooking: Booking = { 
      ...booking, 
      id, 
      bookingTime, 
      sessionDate,
      status
    };
    
    // Debug logging for booking creation
    console.log(`Creating new booking (ID: ${id}) for course ${booking.courseId} by student ${booking.studentId}`);
    
    this.bookings.set(id, newBooking);
    
    // Debug - Verify booking was added to storage
    const allBookings = Array.from(this.bookings.values());
    console.log(`Total bookings after addition: ${allBookings.length}`);
    console.log(`Bookings for course ${booking.courseId}:`, 
      allBookings.filter(b => b.courseId === booking.courseId).length);
    
    return newBooking;
  }

  async updateBookingStatus(id: number, status: "Pending" | "Confirmed"): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    const updatedBooking: Booking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async updateBookingSessionDate(id: number, sessionDate: Date): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    const updatedBooking: Booking = { ...booking, sessionDate };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review methods
  async getReviewById(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByCourseId(courseId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.courseId === courseId);
  }

  async getReviewsByStudentId(studentId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.studentId === studentId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const createdAt = new Date();
    // Ensure reviewText is not undefined
    const reviewText = review.reviewText ?? null;
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt,
      reviewText
    };
    this.reviews.set(id, newReview);
    
    // Update course average rating
    const courseReviews = await this.getReviewsByCourseId(review.courseId);
    const totalRating = courseReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / courseReviews.length;
    await this.updateCourseRating(review.courseId, averageRating);
    
    return newReview;
  }

  // Notification methods
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const createdAt = new Date();
    const isRead = false;
    // Ensure relatedId is not undefined
    const relatedId = notification.relatedId ?? null;
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt, 
      isRead,
      relatedId
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    
    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<number> {
    const userNotifications = await this.getNotificationsByUserId(userId);
    let count = 0;
    
    for (const notification of userNotifications) {
      if (!notification.isRead) {
        const updatedNotification: Notification = { ...notification, isRead: true };
        this.notifications.set(notification.id, updatedNotification);
        count++;
      }
    }
    
    return count;
  }
  
  // Subject methods
  async getAllSubjects(): Promise<string[]> {
    return [...this.subjects];
  }

  // Statistics methods
  async getPlatformStatistics(): Promise<{
    totalStudents: number;
    totalTutors: number;
    totalCourses: number;
    totalBookings: number;
    confirmedBookings: number;
  }> {
    const students = await this.getUsersByRole("Student");
    const tutors = await this.getUsersByRole("Tutor");
    const courses = await this.getAllCourses();
    const bookings = Array.from(this.bookings.values());
    const confirmedBookings = bookings.filter(booking => booking.status === "Confirmed");

    return {
      totalStudents: students.length,
      totalTutors: tutors.length,
      totalCourses: courses.length,
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length
    };
  }
}

export const storage = new MemStorage();