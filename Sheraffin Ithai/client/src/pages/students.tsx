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

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
  courses: number;
  progress: number;
  status: 'active' | 'inactive' | 'graduated';
}

const Students: React.FC = () => {
  const sidebarState = useSidebarState();
  
  const { data, isLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  // Fallback data
  const defaultStudents = [
    {
      id: '1',
      name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      enrollmentDate: '2023-09-15',
      courses: 3,
      progress: 68,
      status: 'active'
    },
    {
      id: '2',
      name: 'Mark Johnson',
      email: 'mark.j@example.com',
      enrollmentDate: '2023-08-22',
      courses: 2,
      progress: 45,
      status: 'active'
    },
    {
      id: '3',
      name: 'Emma Lewis',
      email: 'emma.l@example.com',
      enrollmentDate: '2023-10-05',
      courses: 1,
      progress: 23,
      status: 'active'
    },
    {
      id: '4',
      name: 'Ryan Davis',
      email: 'ryan.d@example.com',
      enrollmentDate: '2023-07-18',
      courses: 4,
      progress: 92,
      status: 'active'
    },
    {
      id: '5',
      name: 'Jessica Wilson',
      email: 'jessica.w@example.com',
      enrollmentDate: '2023-11-02',
      courses: 2,
      progress: 12,
      status: 'active'
    },
    {
      id: '6',
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      enrollmentDate: '2023-06-30',
      courses: 5,
      progress: 100,
      status: 'graduated'
    },
    {
      id: '7',
      name: 'David Johnson',
      email: 'david.j@example.com',
      enrollmentDate: '2023-08-14',
      courses: 3,
      progress: 78,
      status: 'active'
    },
    {
      id: '8',
      name: 'Amanda Garcia',
      email: 'amanda.g@example.com',
      enrollmentDate: '2023-09-28',
      courses: 2,
      progress: 35,
      status: 'inactive'
    }
  ] as Student[];
  
  const students = data || defaultStudents;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'graduated':
        return 'bg-blue-100 text-blue-800';
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
          <Header title="Students" />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">All Students</h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="search" className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      placeholder="Search students..." 
                      className="pl-10" 
                    />
                  </div>
                  <Button>
                    <Icon name="plus" className="h-4 w-4 mr-1" />
                    Add Student
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="animate-pulse p-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded-md mb-4"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <UserAvatar name={student.name} />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(student.enrollmentDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.courses}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="relative pt-1">
                                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                    <div 
                                      style={{ width: `${student.progress}%` }} 
                                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">{student.progress}% Complete</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(student.status)}`}>
                                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
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

export default Students;
