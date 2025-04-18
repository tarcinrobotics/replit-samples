import React from 'react';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import Header from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarContext, useSidebarState } from '@/hooks/use-sidebar';
import { useQuery } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/layout/user-avatar';

interface Instructor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  coursesCount: number;
  studentsCount: number;
  rating: number;
  status: 'active' | 'on-leave' | 'inactive';
}

const Instructors: React.FC = () => {
  const sidebarState = useSidebarState();

  const { data, isLoading } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  // Fallback data
  const defaultInstructors = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      specialization: 'Web Development',
      coursesCount: 5,
      studentsCount: 456,
      rating: 4.8,
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      specialization: 'Data Science',
      coursesCount: 3,
      studentsCount: 328,
      rating: 4.7,
      status: 'active'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      specialization: 'Mobile Development',
      coursesCount: 4,
      studentsCount: 289,
      rating: 4.5,
      status: 'active'
    },
    {
      id: '4',
      name: 'Emily Wilson',
      email: 'emily.wilson@example.com',
      specialization: 'UI/UX Design',
      coursesCount: 2,
      studentsCount: 187,
      rating: 4.9,
      status: 'active'
    },
    {
      id: '5',
      name: 'David Chen',
      email: 'david.chen@example.com',
      specialization: 'Machine Learning',
      coursesCount: 3,
      studentsCount: 213,
      rating: 4.6,
      status: 'on-leave'
    },
    {
      id: '6',
      name: 'Jessica Taylor',
      email: 'jessica.taylor@example.com',
      specialization: 'Graphic Design',
      coursesCount: 4,
      studentsCount: 175,
      rating: 4.4,
      status: 'active'
    }
  ] as Instructor[];

  const instructors = data || defaultInstructors;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarContext.Provider value={sidebarState}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (Desktop) */}
        <Sidebar />

        {/* Mobile Sidebar */}
        <MobileSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Instructors" />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">All Instructors</h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="search" className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      placeholder="Search instructors..." 
                      className="pl-10" 
                    />
                  </div>
                  <Button onClick={() => window.location.href = '/instructors/new'}>
                    <Icon name="plus" className="h-4 w-4 mr-1" />
                    Add Instructor
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="animate-pulse p-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded-md mb-4"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {instructors.map((instructor) => (
                            <tr key={instructor.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <UserAvatar name={instructor.name} />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                                    <div className="text-sm text-gray-500">{instructor.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{instructor.specialization}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{instructor.coursesCount}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{instructor.studentsCount}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-900">
                                  <span className="text-yellow-500 mr-1">★</span>
                                  {instructor.rating.toFixed(1)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(instructor.status)}`}>
                                  {instructor.status === 'active' ? 'Active' :
                                   instructor.status === 'on-leave' ? 'On Leave' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-primary-600 hover:text-primary-900 mr-3">
                                  <Icon name="eye" className="h-4 w-4 inline mr-1" />
                                  View
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900">
                                  <Icon name="message" className="h-4 w-4 inline mr-1" />
                                  Message
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Instructors;