import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  pgEnum,
  doublePrecision,
  primaryKey,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Create user role enum
export const userRoleEnum = pgEnum("user_role", ["Student", "Tutor", "Admin"]);

// Create booking status enum
export const bookingStatusEnum = pgEnum("booking_status", ["Pending", "Confirmed", "Rejected"]);

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: userRoleEnum("role").notNull().default("Student"),
    isApproved: boolean("is_approved").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("email_idx").on(table.email),
    };
  }
);

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: doublePrecision("price").notNull(),
  subject: text("subject").notNull(),
  tutorId: integer("tutor_id")
    .notNull()
    .references(() => users.id),
  averageRating: doublePrecision("average_rating").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  published: boolean("published").notNull().default(true),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  status: bookingStatusEnum("status").notNull().default("Pending"),
  bookingTime: timestamp("booking_time").notNull().defaultNow(),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  sessionDate: timestamp("session_date"),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  relatedId: integer("related_id"),
  type: text("type").notNull(), // 'booking', 'confirmation', 'review', etc.
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, isApproved: true, createdAt: true })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertCourseSchema = createInsertSchema(courses)
  .omit({ 
    id: true, 
    averageRating: true,
    createdAt: true 
  })
  .extend({
    // Ensure price is always treated as a number
    price: z.union([z.number(), z.string().transform(val => parseFloat(val))]),
  });

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingTime: true,
  sessionDate: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = Omit<z.infer<typeof insertUserSchema>, "confirmPassword">;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type BookingWithCourseAndTutor = Booking & {
  course: Course;
  tutor: User;
};

export type CourseWithReviews = Course & {
  reviews: Review[];
  tutor: User;
};
