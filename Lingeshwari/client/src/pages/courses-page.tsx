import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CourseCard } from "@/components/courses/course-card";
import { CourseForm } from "@/components/courses/course-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { Course, Enrollment } from "@shared/schema";
import { PlusCircle, Search, BookOpen, Filter } from "lucide-react";

export default function CoursesPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  
  const isStudent = user?.role === "student";
  const isTutor = user?.role === "tutor";
  
  // Fetch all available courses
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    enabled: !!user,
  });
  
  // For tutors, fetch their courses
  const { data: tutorCourses, isLoading: tutorCoursesLoading } = useQuery<Course[]>({
    queryKey: [`/api/tutors/${user?.id}/courses`],
    enabled: !!user && isTutor,
  });
  
  // For students, fetch enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<Enrollment[]>({
    queryKey: ['/api/enrollments'],
    enabled: !!user && isStudent,
  });
  
  // Filter and sort courses based on search and filters
  const filteredCourses = (courses || []).filter(course => {
    // Search filter
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Subject filter
    if (subjectFilter !== "all" && course.subject !== subjectFilter) {
      return false;
    }
    
    // Level filter
    if (levelFilter !== "all" && course.level !== levelFilter) {
      return false;
    }
    
    return true;
  });
  
  // Get unique subjects for filter options
  const subjects = Array.from(new Set((courses || []).map(course => course.subject)));
  
  // Get unique levels for filter options
  const levels = Array.from(new Set((courses || []).map(course => course.level)));
  
  // Check if a student is enrolled in a course
  const isEnrolled = (courseId: number) => {
    return enrollments?.some(enrollment => enrollment.courseId === courseId);
  };
  
  // Handle enrollment
  const handleEnroll = (courseId: number) => {
    if (!user) return;
    
    // Navigate to course details for enrollment
    setLocation(`/courses/${courseId}`);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground">
              {isTutor 
                ? "Manage your courses and create new ones" 
                : "Browse and enroll in courses"}
            </p>
          </div>
          
          {isTutor && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create a New Course</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to create a new course. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <CourseForm onSuccess={() => setCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {isTutor ? (
          // Tutor view
          <Tabs defaultValue="my-courses" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-courses">My Courses</TabsTrigger>
              <TabsTrigger value="all-courses">All Courses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-courses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {!tutorCoursesLoading && tutorCourses && tutorCourses.length > 0 ? (
                  tutorCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onViewDetails={() => setLocation(`/courses/${course.id}`)}
                    />
                  ))
                ) : tutorCoursesLoading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-72 rounded-lg bg-gray-100 animate-pulse" />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">You haven't created any courses yet.</p>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Course
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all-courses" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {!coursesLoading && filteredCourses.length > 0 ? (
                  filteredCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onViewDetails={() => setLocation(`/courses/${course.id}`)}
                    />
                  ))
                ) : coursesLoading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-72 rounded-lg bg-gray-100 animate-pulse" />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <h3 className="text-lg font-medium mb-2">No courses found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Student view
          <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {!coursesLoading && filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    enrolled={isEnrolled(course.id)}
                    onViewDetails={() => setLocation(`/courses/${course.id}`)}
                    onEnroll={() => handleEnroll(course.id)}
                  />
                ))
              ) : coursesLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-72 rounded-lg bg-gray-100 animate-pulse" />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
