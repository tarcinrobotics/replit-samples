import { scrypt } from "crypto";
import { promisify } from "util";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db } from "./db";
import {
  users,
  tutorProfiles,
  courses,
  User,
  TutorProfile,
  Course,
} from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = "tutorbridge-salt"; // In a real app, use a random salt per user
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

interface TutorData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: string;
}

const tutorData: TutorData[] = [
  {
    username: "sarah_math",
    email: "sarah@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    bio: "Math expert with 8 years of teaching experience. Ph.D. in Applied Mathematics.",
    profileImage: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    username: "david_science",
    email: "david@example.com",
    firstName: "David",
    lastName: "Miller",
    bio: "Physics professor with a passion for making complex concepts simple to understand.",
    profileImage: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    username: "emma_lang",
    email: "emma@example.com",
    firstName: "Emma",
    lastName: "Wilson",
    bio: "Linguistics expert specializing in Spanish, French, and German language instruction.",
    profileImage: "https://randomuser.me/api/portraits/women/3.jpg"
  },
  {
    username: "michael_prog",
    email: "michael@example.com",
    firstName: "Michael",
    lastName: "Brown",
    bio: "Software developer with 10+ years of experience teaching programming and web development.",
    profileImage: "https://randomuser.me/api/portraits/men/4.jpg"
  },
  {
    username: "jennifer_art",
    email: "jennifer@example.com",
    firstName: "Jennifer",
    lastName: "Davis",
    bio: "Fine arts graduate with a specialization in painting and art history.",
    profileImage: "https://randomuser.me/api/portraits/women/5.jpg"
  },
  {
    username: "robert_history",
    email: "robert@example.com",
    firstName: "Robert",
    lastName: "Garcia",
    bio: "History professor with expertise in American and European history from the 18th century onwards.",
    profileImage: "https://randomuser.me/api/portraits/men/6.jpg"
  },
  {
    username: "lisa_chem",
    email: "lisa@example.com",
    firstName: "Lisa",
    lastName: "Martinez",
    bio: "Chemistry teacher with a knack for breaking down complex molecular concepts.",
    profileImage: "https://randomuser.me/api/portraits/women/7.jpg"
  },
  {
    username: "james_business",
    email: "james@example.com",
    firstName: "James",
    lastName: "Taylor",
    bio: "MBA graduate with experience in business administration, marketing, and entrepreneurship.",
    profileImage: "https://randomuser.me/api/portraits/men/8.jpg"
  },
  {
    username: "patricia_music",
    email: "patricia@example.com",
    firstName: "Patricia",
    lastName: "Anderson",
    bio: "Concert pianist with 15 years of experience teaching music theory and piano.",
    profileImage: "https://randomuser.me/api/portraits/women/9.jpg"
  },
  {
    username: "thomas_econ",
    email: "thomas@example.com",
    firstName: "Thomas",
    lastName: "White",
    bio: "Economics professor specializing in microeconomics and macroeconomics.",
    profileImage: "https://randomuser.me/api/portraits/men/10.jpg"
  }
];

function getSubjectsForTutor(username: string): string[] {
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

function getEducationForTutor(username: string): string {
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

function generateCourseForTutor(tutorId: number, tutorUsername: string): Omit<Course, "id"> {
  const subjects = getSubjectsForTutor(tutorUsername);
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

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");
    
    // Create admin user
    const hashedAdminPassword = await hashPassword("adminpass");
    const [admin] = await db.insert(users).values({
      username: "admin",
      password: hashedAdminPassword,
      email: "admin@tutorbridge.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      bio: "System administrator",
      profileImage: "https://randomuser.me/api/portraits/lego/1.jpg"
    }).returning();
    
    console.log("Created admin user:", admin.username);
    
    // Create tutors
    let createdTutorCount = 0;
    let createdCourseCount = 0;
    
    for (const tutorInfo of tutorData) {
      // Create tutor user account
      const hashedPassword = await hashPassword("password123");
      const [tutor] = await db.insert(users).values({
        username: tutorInfo.username,
        password: hashedPassword,
        email: tutorInfo.email,
        firstName: tutorInfo.firstName,
        lastName: tutorInfo.lastName,
        role: "tutor",
        bio: tutorInfo.bio,
        profileImage: tutorInfo.profileImage
      }).returning();
      
      createdTutorCount++;
      
      // Create tutor profile
      const [profile] = await db.insert(tutorProfiles).values({
        userId: tutor.id,
        subjects: getSubjectsForTutor(tutor.username),
        education: getEducationForTutor(tutor.username),
        experience: `${Math.floor(Math.random() * 10) + 5} years of teaching experience`,
        hourlyRate: Math.floor(Math.random() * 50) + 30,
        availability: {},
        rating: Math.floor(Math.random() * 2) + 4 // Random rating between 4-5
      }).returning();
      
      // Create 3-4 courses for each tutor
      const courseCount = Math.floor(Math.random() * 2) + 3; // 3-4 courses per tutor
      for (let i = 0; i < courseCount; i++) {
        const courseData = generateCourseForTutor(tutor.id, tutor.username);
        await db.insert(courses).values(courseData);
        createdCourseCount++;
      }
    }
    
    console.log(`Seeded database with ${createdTutorCount} tutors and ${createdCourseCount} courses`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seed directly when this file is executed
// In ESM modules, we detect this differently

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this file is being run directly
if (process.argv[1] === __filename) {
  seedDatabase()
    .then(() => {
      console.log("Database seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error during database seeding:", error);
      process.exit(1);
    });
}