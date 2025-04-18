import React from 'react';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarContext, useSidebarState } from '@/hooks/use-sidebar';
import { useQuery } from '@tanstack/react-query';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  studentsCount: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const Courses: React.FC = () => {
  const sidebarState = useSidebarState();
  
  const { data, isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  // Fallback data
  const defaultCourses = [
    {
      id: '1',
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
      instructor: 'John Smith',
      studentsCount: 856,
      duration: '8 weeks',
      level: 'Beginner'
    },
    {
      id: '2',
      title: 'Data Science Essentials',
      description: 'Master data analysis techniques using Python and popular libraries.',
      instructor: 'Sarah Johnson',
      studentsCount: 624,
      duration: '12 weeks',
      level: 'Intermediate'
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'Create native mobile applications for iOS and Android platforms.',
      instructor: 'Michael Brown',
      studentsCount: 418,
      duration: '10 weeks',
      level: 'Intermediate'
    },
    {
      id: '4',
      title: 'UI/UX Design Principles',
      description: 'Learn design thinking and create user-centered digital experiences.',
      instructor: 'Emily Wilson',
      studentsCount: 352,
      duration: '6 weeks',
      level: 'Beginner'
    },
    {
      id: '5',
      title: 'Machine Learning Basics',
      description: 'Understand machine learning algorithms and their applications.',
      instructor: 'David Chen',
      studentsCount: 276,
      duration: '14 weeks',
      level: 'Advanced'
    }
  ] as Course[];
  
  const courses = data || defaultCourses;

  return (
    <SidebarContext.Provider value={sidebarState}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (Desktop) */}
        <Sidebar />
        
        {/* Mobile Sidebar */}
        <MobileSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Courses" />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">All Courses</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="bg-gray-200 h-12"></CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">{course.description}</p>
                        <div className="flex justify-between text-sm">
                          <div className="text-gray-500">
                            <span className="font-medium">Instructor:</span> {course.instructor}
                          </div>
                          <div className="text-gray-500">
                            <span className="font-medium">{course.studentsCount}</span> students
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="text-gray-500">
                            <span className="font-medium">Duration:</span> {course.duration}
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              course.level === 'Beginner' 
                                ? 'bg-green-100 text-green-800' 
                                : course.level === 'Intermediate' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {course.level}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Courses;
