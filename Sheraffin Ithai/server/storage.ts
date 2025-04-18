import {
  User, InsertUser, 
  Course, InsertCourse, 
  Student, InsertStudent, 
  Instructor, InsertInstructor, 
  Assignment, InsertAssignment, 
  Activity, InsertActivity, 
  Content, InsertContent, 
  Video, InsertVideo,
  users, courses, students, instructors, assignments, activities, contents, videos
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Student operations
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;

  // Instructor operations
  getInstructors(): Promise<Instructor[]>;
  getInstructor(id: number): Promise<Instructor | undefined>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;

  // Assignment operations
  getAssignments(): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;

  // Activity operations
  getActivities(): Promise<Activity[]>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Dashboard stats
  getDashboardStats(): Promise<any>;
  getEnrollmentTrend(): Promise<any>;
  getPopularCourses(): Promise<any>;

  // Content operations
  getContents(): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;

  // Video operations
  getVideos(): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;

  // Session store
  sessionStore: any; // Using any type for session store to avoid typechecking issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private students: Map<number, Student>;
  private instructors: Map<number, Instructor>;
  private assignments: Map<number, Assignment>;
  private activities: Map<number, Activity>;
  private contents: Map<number, Content>;
  private videos: Map<number, Video>;

  private userIdCounter: number;
  private courseIdCounter: number;
  private studentIdCounter: number;
  private instructorIdCounter: number;
  private assignmentIdCounter: number;
  private activityIdCounter: number;
  private contentIdCounter: number;
  private videoIdCounter: number;

  sessionStore: any; // Using any type for session store to avoid type issues

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.students = new Map();
    this.instructors = new Map();
    this.assignments = new Map();
    this.activities = new Map();
    this.contents = new Map();
    this.videos = new Map();

    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.studentIdCounter = 1;
    this.instructorIdCounter = 1;
    this.assignmentIdCounter = 1;
    this.activityIdCounter = 1;
    this.contentIdCounter = 1;
    this.videoIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    this.initializeData();
  }

  private initializeData(): void {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "password123", // This will be hashed by auth.ts
      email: "admin@edconnect.com",
      name: "Admin User",
      role: "admin"
    });

    // Create instructors
    const instructorData = [
      {
        username: "john.smith",
        email: "john.smith@edconnect.com",
        name: "John Smith",
        specialization: "Web Development",
        rating: 4.9
      },
      {
        username: "sarah.johnson",
        email: "sarah.johnson@edconnect.com",
        name: "Sarah Johnson", 
        specialization: "Data Science",
        rating: 4.8
      },
      {
        username: "michael.brown",
        email: "michael.brown@edconnect.com",
        name: "Michael Brown",
        specialization: "Mobile Development",
        rating: 4.7
      },
      {
        username: "emily.wilson",
        email: "emily.wilson@edconnect.com",
        name: "Emily Wilson",
        specialization: "UI/UX Design",
        rating: 4.9
      },
      {
        username: "david.chen",
        email: "david.chen@edconnect.com",
        name: "David Chen",
        specialization: "Machine Learning",
        rating: 4.8
      },
      {
        username: "robert.zhang",
        email: "robert.zhang@edconnect.com",
        name: "Robert Zhang",
        specialization: "Cloud Architecture",
        rating: 4.9
      },
      {
        username: "lisa.kumar",
        email: "lisa.kumar@edconnect.com",
        name: "Lisa Kumar",
        specialization: "Cybersecurity",
        rating: 4.7
      },
      {
        username: "alex.patel",
        email: "alex.patel@edconnect.com",
        name: "Alex Patel",
        specialization: "Game Development",
        rating: 4.8
      },
      {
        username: "maria.garcia",
        email: "maria.garcia@edconnect.com",
        name: "Maria Garcia",
        specialization: "DevOps",
        rating: 4.6
      },
      {
        username: "thomas.lee",
        email: "thomas.lee@edconnect.com",
        name: "Thomas Lee",
        specialization: "Blockchain",
        rating: 4.7
      }
    ];

    for (const data of instructorData) {
      this.createUser({
        username: data.username,
        password: "password123", // This will be hashed by auth.ts
        email: data.email,
        name: data.name,
        role: "instructor"
      }).then(user => {
        this.createInstructor({
          userId: user.id,
          specialization: data.specialization,
          rating: data.rating,
          status: "active"
        });

        // Create courses for each instructor (example)
        this.createCourse({
          title: `${data.specialization} Fundamentals`,
          description: `Introduction to ${data.specialization}`,
          instructorId: user.id,
          duration: "8 weeks",
          level: "Beginner"
        });
      });
    }


    // Create student user
    this.createUser({
      username: "student",
      password: "password123", // This will be hashed by auth.ts
      email: "student@edconnect.com",
      name: "Jane Doe",
      role: "student"
    }).then(user => {
      // Create student profile
      this.createStudent({
        userId: user.id,
        progress: 50,
        enrollmentDate: new Date(),
        status: "active"
      });

      // Create some activities
      this.createActivity({
        userId: user.id,
        type: "join",
        action: "joined",
        target: "Web Development Fundamentals"
      });

      this.createActivity({
        userId: user.id,
        type: "complete",
        action: "completed",
        target: "Introduction to HTML module"
      });
    });

    // Create assignments
    this.createAssignment({
      title: "HTML Portfolio Project",
      courseId: 1,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      points: 100,
      status: "active"
    });

    this.createAssignment({
      title: "CSS Responsive Layout Challenge",
      courseId: 1,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      points: 150,
      status: "active"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      id,
      ...user,
      createdAt: new Date() 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const newCourse: Course = {
      id,
      ...course,
      createdAt: new Date()
    };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentIdCounter++;
    const newStudent: Student = {
      id,
      ...student,
      createdAt: new Date()
    };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async getInstructors(): Promise<Instructor[]> {
    return Array.from(this.instructors.values());
  }

  async getInstructor(id: number): Promise<Instructor | undefined> {
    return this.instructors.get(id);
  }

  async createInstructor(instructor: InsertInstructor): Promise<Instructor> {
    const id = this.instructorIdCounter++;
    const newInstructor: Instructor = {
      id,
      ...instructor,
      createdAt: new Date()
    };
    this.instructors.set(id, newInstructor);
    return newInstructor;
  }

  async getAssignments(): Promise<Assignment[]> {
    return Array.from(this.assignments.values());
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const id = this.assignmentIdCounter++;
    const newAssignment: Assignment = {
      id,
      ...assignment,
      createdAt: new Date()
    };
    this.assignments.set(id, newAssignment);
    return newAssignment;
  }

  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return (await this.getActivities()).slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const newActivity: Activity = {
      id,
      ...activity,
      createdAt: new Date()
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getDashboardStats(): Promise<any> {
    const studentCount = this.students.size || 2547;
    const prevMonthStudentCount = studentCount - Math.floor(Math.random() * 300);
    const studentChangePercent = ((studentCount - prevMonthStudentCount) / prevMonthStudentCount) * 100;

    const courseCount = this.courses.size || 36;
    const prevMonthCourseCount = courseCount - Math.floor(Math.random() * 3);
    const courseChangePercent = ((courseCount - prevMonthCourseCount) / prevMonthCourseCount) * 100;

    // Simulated revenue stats
    const revenue = 87432;
    const prevMonthRevenue = 79399;
    const revenueChangePercent = ((revenue - prevMonthRevenue) / prevMonthRevenue) * 100;

    // Simulated completion rate
    const completionRate = 78.3;
    const prevMonthCompletionRate = 80.4;
    const completionRateChangePercent = ((completionRate - prevMonthCompletionRate) / prevMonthCompletionRate) * 100;

    return {
      totalStudents: {
        current: studentCount,
        changePercent: studentChangePercent
      },
      activeCourses: {
        current: courseCount,
        changePercent: courseChangePercent
      },
      totalRevenue: {
        current: revenue,
        changePercent: revenueChangePercent
      },
      completionRate: {
        current: completionRate,
        changePercent: completionRateChangePercent
      }
    };
  }

  async getEnrollmentTrend(): Promise<any> {
    // For a real implementation, this would aggregate data from the database
    // Here we're returning mockup data that matches the frontend display
    const months = [
      { name: 'Jan', value: 'Jan', height: '30%' },
      { name: 'Feb', value: 'Feb', height: '40%' },
      { name: 'Mar', value: 'Mar', height: '35%' },
      { name: 'Apr', value: 'Apr', height: '50%' },
      { name: 'May', value: 'May', height: '65%' },
      { name: 'Jun', value: 'Jun', height: '70%' },
      { name: 'Jul', value: 'Jul', height: '60%' },
      { name: 'Aug', value: 'Aug', height: '75%' },
      { name: 'Sep', value: 'Sep', height: '90%' },
      { name: 'Oct', value: 'Oct', height: '80%' },
      { name: 'Nov', value: 'Nov', height: '85%' },
      { name: 'Dec', value: 'Dec', height: '95%' }
    ];

    return months;
  }

  async getPopularCourses(): Promise<any> {
    // For a real implementation, this would aggregate course enrollment data
    // Here we're returning mockup data that matches the frontend display
    return [
      { title: 'Web Development Fundamentals', percentage: 28, color: 'bg-blue-600' },
      { title: 'Data Science Essentials', percentage: 23, color: 'bg-green-500' },
      { title: 'Mobile App Development', percentage: 19, color: 'bg-purple-500' },
      { title: 'UI/UX Design Principles', percentage: 16, color: 'bg-pink-500' },
      { title: 'Machine Learning Basics', percentage: 14, color: 'bg-yellow-500' }
    ];
  }

  async getContents(): Promise<Content[]> {
    return Array.from(this.contents.values());
  }

  async createContent(content: InsertContent): Promise<Content> {
    const id = this.contentIdCounter++;
    const newContent: Content = {
      id,
      ...content,
      createdAt: new Date()
    };
    this.contents.set(id, newContent);
    return newContent;
  }

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const newVideo: Video = {
      id,
      ...video,
      createdAt: new Date()
    };
    this.videos.set(id, newVideo);
    return newVideo;
  }
}

// Implement Database Storage for PostgreSQL
export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any type for session store to avoid type issues

  constructor() {
    // Set up session store based on whether database is available
    if (pool) {
      console.log('Using PostgreSQL session store');
      this.sessionStore = new PostgresSessionStore({ 
        pool, 
        createTableIfMissing: true 
      });
    } else {
      console.log('Using Memory session store');
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    if (!db) return undefined;

    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) return undefined;

    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    if (!db) throw new Error('Database not available');

    try {
      const [newUser] = await db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    if (!db) return [];

    try {
      return await db.select().from(courses);
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  }

  async getCourse(id: number): Promise<Course | undefined> {
    if (!db) return undefined;

    try {
      const [course] = await db.select().from(courses).where(eq(courses.id, id));
      return course;
    } catch (error) {
      console.error('Error getting course by ID:', error);
      return undefined;
    }
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    if (!db) throw new Error('Database not available');

    try {
      const [newCourse] = await db.insert(courses).values(course).returning();
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Student operations
  async getStudents(): Promise<Student[]> {
    if (!db) return [];

    try {
      return await db.select().from(students);
    } catch (error) {
      console.error('Error getting students:', error);
      return [];
    }
  }

  async getStudent(id: number): Promise<Student | undefined> {
    if (!db) return undefined;

    try {
      const [student] = await db.select().from(students).where(eq(students.id, id));
      return student;
    } catch (error) {
      console.error('Error getting student by ID:', error);
      return undefined;
    }
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    if (!db) throw new Error('Database not available');

    try {
      const [newStudent] = await db.insert(students).values(student).returning();
      return newStudent;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  // Instructor operations
  async getInstructors(): Promise<Instructor[]> {
    if (!db) return [];

    try {
      return await db.select().from(instructors);
    } catch (error) {
      console.error('Error getting instructors:', error);
      return [];
    }
  }

  async getInstructor(id: number): Promise<Instructor | undefined> {
    if (!db) return undefined;

    try {
      const [instructor] = await db.select().from(instructors).where(eq(instructors.id, id));
      return instructor;
    } catch (error) {
      console.error('Error getting instructor by ID:', error);
      return undefined;
    }
  }

  async createInstructor(instructor: InsertInstructor): Promise<Instructor> {
    if (!db) throw new Error('Database not available');

    try {
      const [newInstructor] = await db.insert(instructors).values(instructor).returning();
      return newInstructor;
    } catch (error) {
      console.error('Error creating instructor:', error);
      throw error;
    }
  }

  // Assignment operations
  async getAssignments(): Promise<Assignment[]> {
    if (!db) return [];

    try {
      return await db.select().from(assignments);
    } catch (error) {
      console.error('Error getting assignments:', error);
      return [];
    }
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    if (!db) return undefined;

    try {
      const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
      return assignment;
    } catch (error) {
      console.error('Error getting assignment by ID:', error);
      return undefined;
    }
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    if (!db) throw new Error('Database not available');

    try {
      const [newAssignment] = await db.insert(assignments).values(assignment).returning();
      return newAssignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    if (!db) return [];

    try {
      return await db.select().from(activities).orderBy(activities.createdAt);
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    if (!db) return [];

    try {
      return await db.select().from(activities).orderBy(activities.createdAt).limit(limit);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    if (!db) throw new Error('Database not available');

    try {
      const [newActivity] = await db.insert(activities).values(activity).returning();
      return newActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // Content operations
  async getContents(): Promise<Content[]> {
    if (!db) return [];

    try {
      return await db.select().from(contents);
    } catch (error) {
      console.error('Error getting contents:', error);
      return [];
    }
  }

  async createContent(content: InsertContent): Promise<Content> {
    if (!db) throw new Error('Database not available');

    try {
      const [newContent] = await db.insert(contents).values(content).returning();
      return newContent;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  // Video operations
  async getVideos(): Promise<Video[]> {
    if (!db) return [];

    try {
      return await db.select().from(videos);
    } catch (error) {
      console.error('Error getting videos:', error);
      return [];
    }
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    if (!db) throw new Error('Database not available');

    try {
      const [newVideo] = await db.insert(videos).values(video).returning();
      return newVideo;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  // Dashboard stats - we'll use the same mock data for now
  async getDashboardStats(): Promise<any> {
    const studentCount = (await this.getStudents()).length || 2547;
    const prevMonthStudentCount = studentCount - Math.floor(Math.random() * 300);
    const studentChangePercent = ((studentCount - prevMonthStudentCount) / prevMonthStudentCount) * 100;

    const courseCount = (await this.getCourses()).length || 36;
    const prevMonthCourseCount = courseCount - Math.floor(Math.random() * 3);
    const courseChangePercent = ((courseCount - prevMonthCourseCount) / prevMonthCourseCount) * 100;

    // Simulated revenue stats
    const revenue = 87432;
    const prevMonthRevenue = 79399;
    const revenueChangePercent = ((revenue - prevMonthRevenue) / prevMonthRevenue) * 100;

    // Simulated completion rate
    const completionRate = 78.3;
    const prevMonthCompletionRate = 80.4;
    const completionRateChangePercent = ((completionRate - prevMonthCompletionRate) / prevMonthCompletionRate) * 100;

    return {
      totalStudents: {
        current: studentCount,
        changePercent: studentChangePercent
      },
      activeCourses: {
        current: courseCount,
        changePercent: courseChangePercent
      },
      totalRevenue: {
        current: revenue,
        changePercent: revenueChangePercent
      },
      completionRate: {
        current: completionRate,
        changePercent: completionRateChangePercent
      }
    };
  }

  async getEnrollmentTrend(): Promise<any> {
    // For a real implementation, this would aggregate data from the database
    // Here we're returning mockup data that matches the frontend display
    const months = [
      { name: 'Jan', value: 'Jan', height: '30%' },
      { name: 'Feb', value: 'Feb', height: '40%' },
      { name: 'Mar', value: 'Mar', height: '35%' },
      { name: 'Apr', value: 'Apr', height: '50%' },
      { name: 'May', value: 'May', height: '65%' },
      { name: 'Jun', value: 'Jun', height: '70%' },
      { name: 'Jul', value: 'Jul', height: '60%' },
      { name: 'Aug', value: 'Aug', height: '75%' },
      { name: 'Sep', value: 'Sep', height: '90%' },
      { name: 'Oct', value: 'Oct', height: '80%' },
      { name: 'Nov', value: 'Nov', height: '85%' },
      { name: 'Dec', value: 'Dec', height: '95%' }
    ];

    return months;
  }

  async getPopularCourses(): Promise<any> {
    // For a real implementation, this would aggregate course enrollment data
    // Here we're returning mockup data that matches the frontend display
    return [
      { title: 'Web Development Fundamentals', percentage: 28, color: 'bg-blue-600' },
      { title: 'Data Science Essentials', percentage: 23, color: 'bg-green-500' },
      { title: 'Mobile App Development', percentage: 19, color: 'bg-purple-500' },
      { title: 'UI/UX Design Principles', percentage: 16, color: 'bg-pink-500' },
      { title: 'Machine Learning Basics', percentage: 14, color: 'bg-yellow-500' }
    ];
  }
}

// Function to initialize database with sample data
async function initializeDatabase(storage: DatabaseStorage) {
  console.log('Initializing database with sample data...');

  try {
    // Check if db is available
    if (!db) return;

    // Check each table separately and populate if empty
    const existingStudents = await db.select().from(students);
    const existingInstructors = await db.select().from(instructors);
    const existingCourses = await db.select().from(courses);
    const existingAssignments = await db.select().from(assignments);
    const existingContents = await db.select().from(contents);
    const existingVideos = await db.select().from(videos);
    const existingActivities = await db.select().from(activities);

    console.log(`Database contains: ${existingStudents.length} students, ${existingInstructors.length} instructors, ${existingCourses.length} courses`);

    // If we have data in all tables, skip initialization
    if (existingStudents.length > 0 && 
        existingInstructors.length > 0 && 
        existingCourses.length > 0 && 
        existingAssignments.length > 0 && 
        existingContents.length > 0 && 
        existingVideos.length > 0 && 
        existingActivities.length > 0) {
      console.log('All tables already contain data, skipping initialization');
      return;
    }

    console.log('Some tables are empty, initializing with sample data...');

    // Create admin user
    const adminUser = await storage.createUser({
      username: "admin",
      password: "password123", // This will be hashed by auth.ts
      email: "admin@edconnect.com",
      name: "Admin User",
      role: "admin"
    });

    // Create instructors
    const instructorData = [
      {
        username: "john.smith",
        email: "john.smith@edconnect.com",
        name: "John Smith",
        specialization: "Web Development",
        rating: 4.9
      },
      {
        username: "sarah.johnson",
        email: "sarah.johnson@edconnect.com",
        name: "Sarah Johnson", 
        specialization: "Data Science",
        rating: 4.8
      },
      {
        username: "michael.brown",
        email: "michael.brown@edconnect.com",
        name: "Michael Brown",
        specialization: "Mobile Development",
        rating: 4.7
      },
      {
        username: "emily.wilson",
        email: "emily.wilson@edconnect.com",
        name: "Emily Wilson",
        specialization: "UI/UX Design",
        rating: 4.9
      },
      {
        username: "david.chen",
        email: "david.chen@edconnect.com",
        name: "David Chen",
        specialization: "Machine Learning",
        rating: 4.8
      },
      {
        username: "robert.zhang",
        email: "robert.zhang@edconnect.com",
        name: "Robert Zhang",
        specialization: "Cloud Architecture",
        rating: 4.9
      },
      {
        username: "lisa.kumar",
        email: "lisa.kumar@edconnect.com",
        name: "Lisa Kumar",
        specialization: "Cybersecurity",
        rating: 4.7
      },
      {
        username: "alex.patel",
        email: "alex.patel@edconnect.com",
        name: "Alex Patel",
        specialization: "Game Development",
        rating: 4.8
      },
      {
        username: "maria.garcia",
        email: "maria.garcia@edconnect.com",
        name: "Maria Garcia",
        specialization: "DevOps",
        rating: 4.6
      },
      {
        username: "thomas.lee",
        email: "thomas.lee@edconnect.com",
        name: "Thomas Lee",
        specialization: "Blockchain",
        rating: 4.7
      }
    ];

    for (const data of instructorData) {
      const instructorUser = await storage.createUser({
        username: data.username,
        password: "password123", // This will be hashed by auth.ts
        email: data.email,
        name: data.name,
        role: "instructor"
      });

      await storage.createInstructor({
        userId: instructorUser.id,
        specialization: data.specialization,
        rating: data.rating,
        status: "active"
      });
    }

    // Create courses
    const webDevCourse = await storage.createCourse({
      title: "Web Development Fundamentals",
      description: "Learn the basics of web development including HTML, CSS, and JavaScript.",
      instructorId: 1, // Assuming the first instructor created is webDevInstructor
      duration: "8 weeks",
      level: "Beginner"
    });

    const jsAdvancedCourse = await storage.createCourse({
      title: "Advanced JavaScript",
      description: "Deep dive into advanced JavaScript concepts and modern frameworks.",
      instructorId: 1, // Assuming the first instructor created is webDevInstructor
      duration: "10 weeks",
      level: "Advanced"
    });

    const dataScienceCourse = await storage.createCourse({
      title: "Data Science Essentials",
      description: "Introduction to data analysis, visualization, and machine learning basics.",
      instructorId: 2, // Assuming the second instructor created is dataScienceInstructor
      duration: "12 weeks",
      level: "Intermediate"
    });

    const mobileDevCourse = await storage.createCourse({
      title: "Mobile App Development",
      description: "Build cross-platform mobile applications using React Native.",
      instructorId: 3, // Assuming the third instructor created is mobileDevInstructor
      duration: "10 weeks",
      level: "Intermediate"
    });

    const uxDesignCourse = await storage.createCourse({
      title: "UI/UX Design Principles",
      description: "Learn user interface and experience design fundamentals for digital products.",
      instructorId: 4, // Assuming the fourth instructor created is uiuxInstructor
      duration: "6 weeks",
      level: "Beginner"
    });

    // Create student users
    const studentNames = [
      "Jane Doe", "Mark Johnson", "Sarah Williams", "Michael Brown", 
      "Emma Lewis", "Ryan Davis", "Olivia Garcia", "David Wilson",
      "Sophia Martinez", "James Anderson", "Isabella Taylor", "Daniel Thomas"
    ];

    for (let i = 0; i < studentNames.length; i++) {
      const name = studentNames[i];
      const username = name.toLowerCase().replace(' ', '.');

      const studentUser = await storage.createUser({
        username,
        password: "password123", // This will be hashed by auth.ts
        email: `${username}@example.com`,
        name,
        role: "student"
      });

      // Create student profile
      const student = await storage.createStudent({
        userId: studentUser.id,
        progress: Math.floor(Math.random() * 100),
        enrollmentDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),        status: ["active", "active", "active", "on-hold", "completed"][Math.floor(Math.random() * 5)]
      });

      // Create some activities
      const courseOptions = [webDevCourse, jsAdvancedCourse, dataScienceCourse, mobileDevCourse, uxDesignCourse];
      const randomCourse = courseOptions[Math.floor(Math.random() * courseOptions.length)];

      await storage.createActivity({
        userId: studentUser.id,
        type: "join",
        action: "joined",
        target: randomCourse.title
      });

      if (Math.random() > 0.5) {
        await storage.createActivity({
          userId: studentUser.id,
          type: "complete",
          action: "completed",
          target: "Introduction module"
        });
      }
    }

    // Create assignments
    await storage.createAssignment({
      title: "HTML Portfolio Project",
      courseId: webDevCourse.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      points: 100,
      status: "active"
    });

    await storage.createAssignment({
      title: "CSS Responsive Layout Challenge",
      courseId: webDevCourse.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      points: 150,
      status: "active"
    });

    await storage.createAssignment({
      title: "JavaScript DOM Manipulation",
      courseId: webDevCourse.id,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      points: 200,
      status: "active"
    });

    await storage.createAssignment({
      title: "React Component Architecture",
      courseId: jsAdvancedCourse.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      points: 250,
      status: "active"
    });

    // Create content items
    await storage.createContent({
      title: "HTML Fundamentals",
      type: "pdf",
      courseId: webDevCourse.id,
      size: "2.4 MB",
      uploadedBy: 1, // Assuming the first instructor created is webDevInstructor
      uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    });

    await storage.createContent({
      title: "CSS Styling Guide",
      type: "pdf",
      courseId: webDevCourse.id,
      size: "3.8 MB",
      uploadedBy: 1, // Assuming the first instructor created is webDevInstructor
      uploadDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
    });

    await storage.createContent({
      title: "JavaScript Best Practices",
      type: "doc",
      courseId: jsAdvancedCourse.id,
      size: "1.2 MB",
      uploadedBy: 1, // Assuming the first instructor created is webDevInstructor
      uploadDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
    });

    // Create video lessons
    await storage.createVideo({
      title: "Introduction to HTML",
      courseId: webDevCourse.id,
      instructorId: 1, // Assuming the first instructor created is webDevInstructor
      duration: "45:20",
      views: 1287,
      thumbnailUrl: "https://images.unsplash.com/photo-1516280440429-4c717584f42f?w=800&q=80",
      uploadDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) // 28 days ago
    });

    await storage.createVideo({
      title: "CSS Flexbox Layout",
      courseId: webDevCourse.id,
      instructorId: 1, // Assuming the first instructor created is webDevInstructor
      duration: "38:15",
      views: 942,
      thumbnailUrl: "https://images.unsplash.com/photo-1516280440429-4c717584f42f?w=800&q=80",
      uploadDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) // 21 days ago
    });

    await storage.createVideo({
      title: "JavaScript Fundamentals",
      courseId: webDevCourse.id,
      instructorId: 1, // Assuming the first instructor created is webDevInstructor
      duration: "52:30",
      views: 1836,
      thumbnailUrl: "https://images.unsplash.com/photo-1516280440429-4c717584f42f?w=800&q=80",
      uploadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    });

    await storage.createVideo({
      title: "Advanced React Hooks",
      courseId: jsAdvancedCourse.id,
      instructorId: 1, // Assuming the first instructor created is webDevInstructor
      duration: "64:45",
      views: 2104,
      thumbnailUrl: "https://images.unsplash.com/photo-1516280440429-4c717584f42f?w=800&q=80",
      uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    });

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Determine which storage implementation to use based on database availability
let storage: IStorage;

if (db) {
  console.log('Using PostgreSQL database storage');
  const dbStorage = new DatabaseStorage();
  storage = dbStorage;

  // Initialize database with sample data
  initializeDatabase(dbStorage).catch(console.error);
} else {
  console.log('Using in-memory storage');
  storage = new MemStorage();
}

export { storage };