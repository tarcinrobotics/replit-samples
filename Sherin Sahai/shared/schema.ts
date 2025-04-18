import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true),
});

export const tutors = pgTable("tutors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  bio: text("bio"),
  subjects: text("subjects").array(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id),
  tutorId: integer("tutor_id").references(() => tutors.id),
  subject: text("subject").notNull(),
  topic: text("topic"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isCompleted: boolean("is_completed").default(false),
});

export const learningActivities = pgTable("learning_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  totalHours: decimal("total_hours", { precision: 10, scale: 2 }).default("0"),
  completedSessions: integer("completed_sessions").default(0),
  upcomingSessions: integer("upcoming_sessions").default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  avatarUrl: true,
});

export const insertTutorSchema = createInsertSchema(tutors).pick({
  userId: true,
  bio: true,
  subjects: true,
  hourlyRate: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  studentId: true,
  tutorId: true,
  subject: true,
  topic: true,
  startTime: true,
  endTime: true,
});

export const insertLearningActivitySchema = createInsertSchema(learningActivities).pick({
  userId: true,
  activityType: true,
  description: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tutor = typeof tutors.$inferSelect;
export type InsertTutor = z.infer<typeof insertTutorSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type LearningActivity = typeof learningActivities.$inferSelect;
export type InsertLearningActivity = z.infer<typeof insertLearningActivitySchema>;

export type Stats = typeof stats.$inferSelect;
