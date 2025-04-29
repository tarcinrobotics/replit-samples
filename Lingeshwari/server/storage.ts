import { 
  users, User, InsertUser,
  tutorProfiles, TutorProfile, InsertTutorProfile,
  courses, Course, InsertCourse,
  bookings, Booking, InsertBooking,
  enrollments, Enrollment, InsertEnrollment,
  reviews, Review, InsertReview
} from "@shared/schema";
import session from "express-session";
import { DatabaseStorage } from "./database-storage";

// Storage interface definition
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Tutor profile methods
  getTutorProfile(id: number): Promise<TutorProfile | undefined>;
  getTutorProfileByUserId(userId: number): Promise<TutorProfile | undefined>;
  createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile>;
  updateTutorProfile(id: number, profile: Partial<TutorProfile>): Promise<TutorProfile | undefined>;
  getAllTutorProfiles(): Promise<TutorProfile[]>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByTutorId(tutorId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  getAllCourses(): Promise<Course[]>;
  getActiveCourses(): Promise<Course[]>;
  
  // Booking methods
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByStudentId(studentId: number): Promise<Booking[]>;
  getBookingsByTutorId(tutorId: number): Promise<Booking[]>;
  getBookingsByCourseId(courseId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Enrollment methods
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getEnrollmentsByStudentId(studentId: number): Promise<Enrollment[]>;
  getEnrollmentsByCourseId(courseId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | undefined>;
  deleteEnrollment(id: number): Promise<boolean>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByStudentId(studentId: number): Promise<Review[]>;
  getReviewsByTutorId(tutorId: number): Promise<Review[]>;
  getReviewsByCourseId(courseId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tutorProfiles: Map<number, TutorProfile>;
  private courses: Map<number, Course>;
  private bookings: Map<number, Booking>;
  private enrollments: Map<number, Enrollment>;
  private reviews: Map<number, Review>;
  
  sessionStore: session.SessionStore;
  
  private userId: number;
  private tutorProfileId: number;
  private courseId: number;
  private bookingId: number;
  private enrollmentId: number;
  private reviewId: number;

  constructor() {
    this.users = new Map();
    this.tutorProfiles = new Map();
    this.courses = new Map();
    this.bookings = new Map();
    this.enrollments = new Map();
    this.reviews = new Map();
    
    this.userId = 1;
    this.tutorProfileId = 1;
    this.courseId = 1;
    this.bookingId = 1;
    this.enrollmentId = 1;
    this.reviewId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with seed data
    this.seedData();
  }
  
  /**
   * Seed the database with sample tutors and courses
   */
  private async seedData() {
    // Create 10 tutors
    const tutors: User[] = [
      {
        id: this.userId++,
        username: "sarah_math",
        password: "password123", // In a real app, these would be hashed
        email: "sarah@example.com",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "tutor",
        bio: "Math expert with 8 years of teaching experience. Ph.D. in Applied Mathematics.",
        profileImage: "https://randomuser.me/api/portraits/women/1.jpg"
      },
      {
        id: this.userId++,
        username: "david_science",
        password: "password123",
        email: "david@example.com",
        firstName: "David",
        lastName: "Miller",
        role: "tutor",
        bio: "Physics professor with a passion for making complex concepts simple to understand.",
        profileImage: "https://randomuser.me/api/portraits/men/2.jpg"
      },
      {
        id: this.userId++,
        username: "emma_lang",
        password: "password123",
        email: "emma@example.com",
        firstName: "Emma",
        lastName: "Wilson",
        role: "tutor",
        bio: "Linguistics expert specializing in Spanish, French, and German language instruction.",
        profileImage: "https://randomuser.me/api/portraits/women/3.jpg"
      },
      {
        id: this.userId++,
        username: "michael_prog",
        password: "password123",
        email: "michael@example.com",
        firstName: "Michael",
        lastName: "Brown",
        role: "tutor",
        bio: "Software developer with 10+ years of experience teaching programming and web development.",
        profileImage: "https://randomuser.me/api/portraits/men/4.jpg"
      },
      {
        id: this.userId++,
        username: "jennifer_art",
        password: "password123",
        email: "jennifer@example.com",
        firstName: "Jennifer",
        lastName: "Davis",
        role: "tutor",
        bio: "Fine arts graduate with a specialization in painting and art history.",
        profileImage: "https://randomuser.me/api/portraits/women/5.jpg"
      },
      {
        id: this.userId++,
        username: "robert_history",
        password: "password123",
        email: "robert@example.com",
        firstName: "Robert",
        lastName: "Garcia",
        role: "tutor",
        bio: "History professor with expertise in American and European history from the 18th century onwards.",
        profileImage: "https://randomuser.me/api/portraits/men/6.jpg"
      },
      {
        id: this.userId++,
        username: "lisa_chem",
        password: "password123",
        email: "lisa@example.com",
        firstName: "Lisa",
        lastName: "Martinez",
        role: "tutor",
        bio: "Chemistry teacher with a knack for breaking down complex molecular concepts.",
        profileImage: "https://randomuser.me/api/portraits/women/7.jpg"
      },
      {
        id: this.userId++,
        username: "james_business",
        password: "password123",
        email: "james@example.com",
        firstName: "James",
        lastName: "Taylor",
        role: "tutor",
        bio: "MBA graduate with experience in business administration, marketing, and entrepreneurship.",
        profileImage: "https://randomuser.me/api/portraits/men/8.jpg"
      },
      {
        id: this.userId++,
        username: "patricia_music",
        password: "password123",
        email: "patricia@example.com",
        firstName: "Patricia",
        lastName: "Anderson",
        role: "tutor",
        bio: "Concert pianist with 15 years of experience teaching music theory and piano.",
        profileImage: "https://randomuser.me/api/portraits/women/9.jpg"
      },
      {
        id: this.userId++,
        username: "thomas_econ",
        password: "password123",
        email: "thomas@example.com",
        firstName: "Thomas",
        lastName: "White",
        role: "tutor",
        bio: "Economics professor specializing in microeconomics and macroeconomics.",
        profileImage: "https://randomuser.me/api/portraits/men/10.jpg"
      }
    ];
    
    // Add tutors to the database
    for (const tutor of tutors) {
      this.users.set(tutor.id, tutor);
      
      // Create tutor profile for each tutor
      const profile: TutorProfile = {
        id: this.tutorProfileId++,
        userId: tutor.id,
        subjects: this.getSubjectsForTutor(tutor.username),
        education: this.getEducationForTutor(tutor.username),
        experience: `${Math.floor(Math.random() * 10) + 5} years of teaching experience`,
        hourlyRate: Math.floor(Math.random() * 50) + 30,
        availability: {},
        rating: Math.floor(Math.random() * 2) + 4 // Random rating between 4-5
      };
      
      this.tutorProfiles.set(profile.id, profile);
      
      // Create 2-3 courses for each tutor to ensure at least 20 courses total
      const courseCount = Math.floor(Math.random() * 2) + 2; // 2-3 courses per tutor
      for (let i = 0; i < courseCount; i++) {
        const course = this.generateCourseForTutor(tutor.id, tutor.username);
        this.courses.set(course.id, course);
      }
    }
    
    // Create admin account
    const admin: User = {
      id: this.userId++,
      username: "admin",
      password: "adminpass",
      email: "admin@tutorbridge.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      bio: "System administrator",
      profileImage: "https://randomuser.me/api/portraits/lego/1.jpg"
    };
    
    this.users.set(admin.id, admin);
    
    console.log(`Seeded database with ${tutors.length} tutors and ${this.courses.size} courses`);
  }
  
  private getSubjectsForTutor(username: string): string[] {
    switch (true) {
      case username.includes("math"):
        return ["Algebra", "Calculus", "Statistics", "Trigonometry"];
      case username.includes("science"):
        return ["Physics", "Astronomy", "Mechanics", "Thermodynamics"];
      case username.includes("lang"):
        return ["Spanish", "French", "German", "English"];
      case username.includes("prog"):
        return ["JavaScript", "Python", "React", "Web Development"];
      case username.includes("art"):
        return ["Painting", "Drawing", "Art History", "Sculpture"];
      case username.includes("history"):
        return ["World History", "American History", "European History", "Ancient Civilizations"];
      case username.includes("chem"):
        return ["Organic Chemistry", "Inorganic Chemistry", "Biochemistry"];
      case username.includes("business"):
        return ["Business Administration", "Marketing", "Entrepreneurship", "Finance"];
      case username.includes("music"):
        return ["Piano", "Music Theory", "Composition", "Music History"];
      case username.includes("econ"):
        return ["Microeconomics", "Macroeconomics", "International Economics", "Economic Theory"];
      default:
        return ["General Education", "Study Skills"];
    }
  }
  
  private getEducationForTutor(username: string): string {
    switch (true) {
      case username.includes("math"):
        return "Ph.D. in Applied Mathematics, Stanford University";
      case username.includes("science"):
        return "Ph.D. in Physics, MIT";
      case username.includes("lang"):
        return "M.A. in Linguistics, Columbia University";
      case username.includes("prog"):
        return "M.S. in Computer Science, UC Berkeley";
      case username.includes("art"):
        return "M.F.A. in Fine Arts, Rhode Island School of Design";
      case username.includes("history"):
        return "Ph.D. in History, Yale University";
      case username.includes("chem"):
        return "Ph.D. in Chemistry, Harvard University";
      case username.includes("business"):
        return "MBA, Wharton School of Business";
      case username.includes("music"):
        return "M.M. in Piano Performance, Juilliard School";
      case username.includes("econ"):
        return "Ph.D. in Economics, Princeton University";
      default:
        return "M.Ed. in Education, University of Michigan";
    }
  }
  
  private generateCourseForTutor(tutorId: number, tutorUsername: string): Course {
    const subjects = this.getSubjectsForTutor(tutorUsername);
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    let title = "";
    let description = "";
    
    switch (true) {
      case tutorUsername.includes("math"):
        title = `${level} ${subject} Mastery`;
        description = `A comprehensive course covering all aspects of ${subject}. Perfect for students looking to improve their math skills and confidence.`;
        break;
      case tutorUsername.includes("science"):
        title = `Exploring ${subject}`;
        description = `Dive deep into the fascinating world of ${subject}. This course combines theoretical knowledge with practical experiments and applications.`;
        break;
      case tutorUsername.includes("lang"):
        title = `${subject} for ${level} Learners`;
        description = `Develop your ${subject} language skills through conversation, grammar lessons, and cultural insights. Small group settings for maximum practice.`;
        break;
      case tutorUsername.includes("prog"):
        title = `${subject} from Scratch to Expert`;
        description = `Learn ${subject} programming from the ground up. By the end of this course, you'll be able to build real-world applications with confidence.`;
        break;
      case tutorUsername.includes("art"):
        title = `The Art of ${subject}`;
        description = `Unlock your creative potential with this ${level} ${subject} course. Learn techniques, composition, and develop your unique artistic style.`;
        break;
      case tutorUsername.includes("history"):
        title = `Understanding ${subject}`;
        description = `A fascinating journey through ${subject}, examining key events, figures, and movements that shaped our world today.`;
        break;
      case tutorUsername.includes("chem"):
        title = `${subject}: Principles and Applications`;
        description = `Master the fundamentals of ${subject} through clear explanations, interactive models, and practical lab demonstrations.`;
        break;
      case tutorUsername.includes("business"):
        title = `${subject} Fundamentals`;
        description = `Gain practical knowledge in ${subject} applicable to real-world business scenarios. Ideal for current and aspiring business professionals.`;
        break;
      case tutorUsername.includes("music"):
        title = `${subject} for ${level} Students`;
        description = `Develop your musical abilities in ${subject} through structured lessons, practice techniques, and performance opportunities.`;
        break;
      case tutorUsername.includes("econ"):
        title = `${subject}: Theory and Practice`;
        description = `Understand the principles of ${subject} and how they apply to current economic situations and policy decisions.`;
        break;
      default:
        title = `Introduction to ${subject}`;
        description = `A foundational course in ${subject} designed to give students a solid understanding of core concepts and principles.`;
    }
    
    return {
      id: this.courseId++,
      tutorId,
      title,
      description,
      subject,
      level,
      price: (Math.floor(Math.random() * 150) + 50) * 100, // Random price between $50-$200 (in cents)
      duration: [60, 90, 120][Math.floor(Math.random() * 3)], // Random duration of 60, 90, or 120 minutes
      maxStudents: Math.floor(Math.random() * 10) + 1, // Random max between 1-10 students
      isActive: true
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role
    );
  }
  
  // Tutor profile methods
  async getTutorProfile(id: number): Promise<TutorProfile | undefined> {
    return this.tutorProfiles.get(id);
  }
  
  async getTutorProfileByUserId(userId: number): Promise<TutorProfile | undefined> {
    return Array.from(this.tutorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile> {
    const id = this.tutorProfileId++;
    const tutorProfile: TutorProfile = { ...profile, id };
    this.tutorProfiles.set(id, tutorProfile);
    return tutorProfile;
  }
  
  async updateTutorProfile(id: number, profileData: Partial<TutorProfile>): Promise<TutorProfile | undefined> {
    const profile = await this.getTutorProfile(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.tutorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  async getAllTutorProfiles(): Promise<TutorProfile[]> {
    return Array.from(this.tutorProfiles.values());
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getCoursesByTutorId(tutorId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.tutorId === tutorId
    );
  }
  
  async createCourse(courseData: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const course: Course = { ...courseData, id };
    this.courses.set(id, course);
    return course;
  }
  
  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined> {
    const course = await this.getCourse(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...courseData };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }
  
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async getActiveCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.isActive
    );
  }
  
  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByStudentId(studentId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.studentId === studentId
    );
  }
  
  async getBookingsByTutorId(tutorId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.tutorId === tutorId
    );
  }
  
  async getBookingsByCourseId(courseId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.courseId === courseId
    );
  }
  
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const booking: Booking = { ...bookingData, id };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const booking = await this.getBooking(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingData };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async deleteBooking(id: number): Promise<boolean> {
    return this.bookings.delete(id);
  }
  
  // Enrollment methods
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }
  
  async getEnrollmentsByStudentId(studentId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.studentId === studentId
    );
  }
  
  async getEnrollmentsByCourseId(courseId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.courseId === courseId
    );
  }
  
  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentId++;
    const enrollment: Enrollment = { ...enrollmentData, id };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }
  
  async updateEnrollment(id: number, enrollmentData: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const enrollment = await this.getEnrollment(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment = { ...enrollment, ...enrollmentData };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }
  
  async deleteEnrollment(id: number): Promise<boolean> {
    return this.enrollments.delete(id);
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByStudentId(studentId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.studentId === studentId
    );
  }
  
  async getReviewsByTutorId(tutorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.tutorId === tutorId
    );
  }
  
  async getReviewsByCourseId(courseId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.courseId === courseId
    );
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const review: Review = { ...reviewData, id };
    this.reviews.set(id, review);
    return review;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    return this.reviews.delete(id);
  }
}

// Use DatabaseStorage for persistent storage with PostgreSQL
export const storage = new DatabaseStorage();
