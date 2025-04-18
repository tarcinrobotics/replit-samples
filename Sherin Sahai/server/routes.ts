import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

type User = {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
};

type Tutor = {
  id: number;
  name: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  subjects: string[];
  bio: string;
  hourlyRate: number;
};

type Session = {
  id: number;
  tutorId: number;
  tutorName: string;
  tutorAvatarUrl?: string;
  subject: string;
  topic: string;
  startTime: Date;
  endTime: Date;
};

type LearningActivity = {
  id: number;
  activityType: string;
  tutorName?: string;
  subjectName?: string;
  topic?: string;
  timestamp: Date;
};

// Mock data for the application
const mockUser: User = {
  id: 1,
  name: "Alex Johnson",
  email: "alex@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80",
};

const mockTutors: Tutor[] = [
  {
    id: 1,
    name: "David Chen",
    avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 5.0,
    reviewCount: 48,
    subjects: ["Physics", "Math"],
    bio: "PhD in Physics with 7+ years of teaching experience. Specializes in mechanics, electromagnetism, and calculus.",
    hourlyRate: 45,
  },
  {
    id: 2,
    name: "Emily Taylor",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 4.9,
    reviewCount: 32,
    subjects: ["English", "Literature"],
    bio: "Master's in English Literature with expertise in essay writing, literary analysis, and creative writing workshops.",
    hourlyRate: 38,
  },
  {
    id: 3,
    name: "James Rodriguez",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 5.0,
    reviewCount: 67,
    subjects: ["Programming", "Web Dev"],
    bio: "Software engineer with 10+ years of experience. Expert in JavaScript, React, Node.js, and full-stack development.",
    hourlyRate: 55,
  },
  {
    id: 4,
    name: "Sophia Kim",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 4.8,
    reviewCount: 41,
    subjects: ["Chemistry", "Biology"],
    bio: "Biochemistry researcher with teaching experience at university level. Passionate about making complex science accessible to all students.",
    hourlyRate: 50,
  },
  {
    id: 5,
    name: "Marcus Johnson",
    avatarUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 4.7,
    reviewCount: 28,
    subjects: ["History", "Political Science"],
    bio: "History professor specializing in modern political movements. Can help with essays, exam prep, and research methodology.",
    hourlyRate: 42,
  },
  {
    id: 6,
    name: "Aisha Patel",
    avatarUrl: "https://images.unsplash.com/photo-1619343177293-4b765668b3dc?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 5.0,
    reviewCount: 54,
    subjects: ["Mathematics", "Statistics"],
    bio: "Data scientist with a PhD in Applied Mathematics. Specializes in statistics, calculus, and advanced mathematical concepts.",
    hourlyRate: 52,
  },
  {
    id: 7,
    name: "Lucas Moreno",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 4.9,
    reviewCount: 37,
    subjects: ["Spanish", "French"],
    bio: "Multilingual language instructor with 8 years of teaching experience. Focuses on conversation, grammar, and cultural context.",
    hourlyRate: 40,
  },
  {
    id: 8,
    name: "Olivia Bennett",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 4.8,
    reviewCount: 45,
    subjects: ["Economics", "Business"],
    bio: "MBA graduate with experience in investment banking. Helps students master economic principles, business strategy, and finance.",
    hourlyRate: 48,
  },
  {
    id: 9,
    name: "Zain Abidi",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 4.7,
    reviewCount: 29,
    subjects: ["Computer Science", "Artificial Intelligence"],
    bio: "AI researcher and software developer specialized in machine learning. Can help with programming assignments and algorithm design.",
    hourlyRate: 60,
  },
];

const mockSessions: Session[] = [
  {
    id: 1,
    tutorId: 1,
    tutorName: "Sarah Wilson",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Mathematics",
    topic: "Advanced Calculus",
    startTime: new Date(new Date().setHours(new Date().getHours() + 2)),
    endTime: new Date(new Date().setHours(new Date().getHours() + 3, 30)),
  },
  {
    id: 2,
    tutorId: 2,
    tutorName: "Michael Brown",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Computer Science",
    topic: "Data Structures",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(new Date().getHours() + 1, 30)),
  },
  {
    id: 5,
    tutorId: 4,
    tutorName: "Sophia Kim",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Chemistry",
    topic: "Organic Compounds",
    startTime: new Date(new Date().setDate(new Date().getDate() + 2)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 1)),
  },
  {
    id: 6,
    tutorId: 6,
    tutorName: "Aisha Patel",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1619343177293-4b765668b3dc?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Statistics",
    topic: "Probability Distributions",
    startTime: new Date(new Date().setDate(new Date().getDate() + 3)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(new Date().getHours() + 2)),
  },
  {
    id: 7,
    tutorId: 7,
    tutorName: "Lucas Moreno",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Spanish",
    topic: "Conversational Practice",
    startTime: new Date(new Date().setHours(new Date().getHours() + 5)),
    endTime: new Date(new Date().setHours(new Date().getHours() + 6)),
  },
  {
    id: 8,
    tutorId: 8,
    tutorName: "Olivia Bennett",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Economics",
    topic: "Macroeconomic Theory",
    startTime: new Date(new Date().setDate(new Date().getDate() + 4)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 4)).setHours(new Date().getHours() + 1, 30)),
  },
  {
    id: 9,
    tutorId: 9,
    tutorName: "Zain Abidi",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Computer Science",
    topic: "Machine Learning Basics",
    startTime: new Date(new Date().setDate(new Date().getDate() + 2)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 2)),
  },
  {
    id: 10,
    tutorId: 3,
    tutorName: "James Rodriguez",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Web Development",
    topic: "React Fundamentals",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(new Date().getHours() + 2)),
  },
];

const mockPastSessions: Session[] = [
  {
    id: 3,
    tutorId: 1,
    tutorName: "Sarah Wilson",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Mathematics",
    topic: "Advanced Calculus",
    startTime: new Date(new Date().setDate(new Date().getDate() - 3)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 3)).setHours(new Date().getHours() + 1, 30)),
  },
  {
    id: 4,
    tutorId: 2,
    tutorName: "Michael Brown",
    tutorAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subject: "Computer Science",
    topic: "Data Structures",
    startTime: new Date(new Date().setDate(new Date().getDate() - 7)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 7)).setHours(new Date().getHours() + 1, 30)),
  },
];

const mockLearningActivities: LearningActivity[] = [
  {
    id: 1,
    activityType: "session_completed",
    tutorName: "Sarah Wilson",
    topic: "Advanced Calculus",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
  {
    id: 2,
    activityType: "homework_completed",
    subjectName: "Physics 201",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 4)),
  },
  {
    id: 3,
    activityType: "session_completed",
    tutorName: "Michael Brown",
    topic: "Data Structures",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 7)),
  },
  {
    id: 4,
    activityType: "material_reviewed",
    subjectName: "Linear Algebra",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 7)),
  },
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // API Routes
  
  // User stats
  app.get("/api/user/stats", (req, res) => {
    res.json({
      totalHours: 27.5,
      completedSessions: 14,
      upcomingSessions: mockSessions.length,
    });
  });

  // Upcoming sessions
  app.get("/api/sessions/upcoming", (req, res) => {
    res.json(mockSessions);
  });

  // Past sessions
  app.get("/api/sessions/past", (req, res) => {
    res.json(mockPastSessions);
  });

  // Popular tutors
  app.get("/api/tutors/popular", (req, res) => {
    res.json(mockTutors);
  });

  // All tutors
  app.get("/api/tutors", (req, res) => {
    res.json(mockTutors);
  });

  // Learning activities
  app.get("/api/activities", (req, res) => {
    res.json(mockLearningActivities);
  });

  const httpServer = createServer(app);

  return httpServer;
}
