import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const UserRole = {
  STUDENT: "student",
  TUTOR: "tutor",
  ADMIN: "admin",
} as const;

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default(UserRole.STUDENT),
  bio: text("bio"),
  profileImage: text("profile_image"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  bio: true,
  profileImage: true,
});

// Tutor profile schema
export const tutorProfiles = pgTable("tutor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjects: text("subjects").array(),
  education: text("education"),
  experience: text("experience"),
  hourlyRate: integer("hourly_rate"),
  availability: json("availability"),
  rating: integer("rating"),
});

export const insertTutorProfileSchema = createInsertSchema(tutorProfiles).pick({
  userId: true,
  subjects: true,
  education: true,
  experience: true,
  hourlyRate: true,
  availability: true,
  rating: true,
});

// Course schema
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subject: text("subject").notNull(),
  level: text("level").notNull(),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(), // in minutes
  maxStudents: integer("max_students").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  tutorId: true,
  title: true,
  description: true,
  subject: true,
  level: true,
  price: true,
  duration: true,
  maxStudents: true,
  isActive: true,
});

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  studentId: integer("student_id").notNull(),
  tutorId: integer("tutor_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  courseId: true,
  studentId: true,
  tutorId: true,
  status: true,
  notes: true,
}).extend({
  // Override date field to accept both Date objects and strings
  date: z.union([
    z.date(),
    z.string().transform((val) => new Date(val))
  ])
});

// Course enrollment schema
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  studentId: integer("student_id").notNull(),
  enrollmentDate: timestamp("enrollment_date").notNull(),
  status: text("status").notNull().default("active"),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).pick({
  courseId: true,
  studentId: true,
  enrollmentDate: true,
  status: true,
});

// Review schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  tutorId: integer("tutor_id").notNull(),
  studentId: integer("student_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  date: timestamp("date").notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  courseId: true,
  tutorId: true,
  studentId: true,
  rating: true,
  comment: true,
  date: true,
});

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TutorProfile = typeof tutorProfiles.$inferSelect;
export type InsertTutorProfile = z.infer<typeof insertTutorProfileSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
