import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

interface PopularCourse {
  title: string;
  percentage: number;
  color: string;
}

const PopularCoursesChart: React.FC = () => {
  const { data, isLoading } = useQuery<PopularCourse[]>({
    queryKey: ['/api/dashboard/popular-courses'],
  });

  // Fallback data if API doesn't return anything
  const defaultCourses = [
    { title: 'Web Development Fundamentals', percentage: 28, color: 'bg-blue-600' },
    { title: 'Data Science Essentials', percentage: 23, color: 'bg-green-500' },
    { title: 'Mobile App Development', percentage: 19, color: 'bg-purple-500' },
    { title: 'UI/UX Design Principles', percentage: 16, color: 'bg-pink-500' },
    { title: 'Machine Learning Basics', percentage: 14, color: 'bg-yellow-500' },
  ];

  const courses = data || defaultCourses;

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <CardContent className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Most Popular Courses</h3>
        <p className="mt-1 text-sm text-gray-500">Enrollment distribution by course</p>
      </CardContent>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">{course.title}</span>
                  <span className="text-sm font-medium text-gray-900">{course.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`${course.color} h-2.5 rounded-full`} style={{ width: `${course.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PopularCoursesChart;
