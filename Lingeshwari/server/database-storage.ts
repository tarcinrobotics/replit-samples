import { 
  users, User, InsertUser,
  tutorProfiles, TutorProfile, InsertTutorProfile,
  courses, Course, InsertCourse,
  bookings, Booking, InsertBooking,
  enrollments, Enrollment, InsertEnrollment,
  reviews, Review, InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  // Tutor profile methods
  async getTutorProfile(id: number): Promise<TutorProfile | undefined> {
    const [profile] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.id, id));
    return profile;
  }
  
  async getTutorProfileByUserId(userId: number): Promise<TutorProfile | undefined> {
    const [profile] = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, userId));
    return profile;
  }
  
  async createTutorProfile(profile: InsertTutorProfile): Promise<TutorProfile> {
    const [createdProfile] = await db.insert(tutorProfiles).values(profile).returning();
    return createdProfile;
  }
  
  async updateTutorProfile(id: number, profileData: Partial<TutorProfile>): Promise<TutorProfile | undefined> {
    const [updatedProfile] = await db
      .update(tutorProfiles)
      .set(profileData)
      .where(eq(tutorProfiles.id, id))
      .returning();
    return updatedProfile;
  }
  
  async getAllTutorProfiles(): Promise<TutorProfile[]> {
    return await db.select().from(tutorProfiles);
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }
  
  async getCoursesByTutorId(tutorId: number): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.tutorId, tutorId));
  }
  
  async createCourse(courseData: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(courseData).returning();
    return course;
  }
  
  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined> {
    const [updatedCourse] = await db
      .update(courses)
      .set(courseData)
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return true; // If no error was thrown, the deletion was successful
  }
  
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }
  
  async getActiveCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true));
  }
  
  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }
  
  async getBookingsByStudentId(studentId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.studentId, studentId));
  }
  
  async getBookingsByTutorId(tutorId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.tutorId, tutorId));
  }
  
  async getBookingsByCourseId(courseId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.courseId, courseId));
  }
  
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }
  
  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }
  
  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return true; // If no error was thrown, the deletion was successful
  }
  
  // Enrollment methods
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return enrollment;
  }
  
  async getEnrollmentsByStudentId(studentId: number): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
  }
  
  async getEnrollmentsByCourseId(courseId: number): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  }
  
  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(enrollmentData).returning();
    return enrollment;
  }
  
  async updateEnrollment(id: number, enrollmentData: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set(enrollmentData)
      .where(eq(enrollments.id, id))
      .returning();
    return updatedEnrollment;
  }
  
  async deleteEnrollment(id: number): Promise<boolean> {
    const result = await db.delete(enrollments).where(eq(enrollments.id, id));
    return true; // If no error was thrown, the deletion was successful
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async getReviewsByStudentId(studentId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.studentId, studentId));
  }
  
  async getReviewsByTutorId(tutorId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.tutorId, tutorId));
  }
  
  async getReviewsByCourseId(courseId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.courseId, courseId));
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    return true; // If no error was thrown, the deletion was successful
  }
}