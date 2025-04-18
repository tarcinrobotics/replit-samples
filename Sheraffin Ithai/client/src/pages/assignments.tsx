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
import { Badge } from '@/components/ui/badge';

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  points: number;
  submissionsCount: number;
  status: 'active' | 'draft' | 'ended';
}

const Assignments: React.FC = () => {
  const sidebarState = useSidebarState();
  
  const { data, isLoading } = useQuery<Assignment[]>({
    queryKey: ['/api/assignments'],
  });

  // Fallback data
  const defaultAssignments = [
    {
      id: '1',
      title: 'HTML & CSS Basics Project',
      course: 'Web Development Fundamentals',
      dueDate: '2023-12-15',
      points: 100,
      submissionsCount: 45,
      status: 'active'
    },
    {
      id: '2',
      title: 'JavaScript DOM Manipulation',
      course: 'Web Development Fundamentals',
      dueDate: '2023-12-22',
      points: 150,
      submissionsCount: 0,
      status: 'draft'
    },
    {
      id: '3',
      title: 'Data Analysis with Python',
      course: 'Data Science Essentials',
      dueDate: '2023-12-10',
      points: 200,
      submissionsCount: 28,
      status: 'active'
    },
    {
      id: '4',
      title: 'Mobile UI Design Challenge',
      course: 'UI/UX Design Principles',
      dueDate: '2023-11-30',
      points: 120,
      submissionsCount: 18,
      status: 'ended'
    },
    {
      id: '5',
      title: 'React Components Creation',
      course: 'Web Development Fundamentals',
      dueDate: '2023-12-18',
      points: 180,
      submissionsCount: 32,
      status: 'active'
    },
    {
      id: '6',
      title: 'Database Schema Design',
      course: 'Mobile App Development',
      dueDate: '2023-12-20',
      points: 150,
      submissionsCount: 0,
      status: 'draft'
    }
  ] as Assignment[];
  
  const assignments = data || defaultAssignments;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return date > today && date <= threeDaysFromNow;
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
          <Header title="Assignments" />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">All Assignments</h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="search" className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      placeholder="Search assignments..." 
                      className="pl-10" 
                    />
                  </div>
                  <Button>
                    <Icon name="plus" className="h-4 w-4 mr-1" />
                    Create Assignment
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assignments.map((assignment) => (
                            <tr key={assignment.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{assignment.course}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm text-gray-900">{formatDueDate(assignment.dueDate)}</div>
                                  {isUpcoming(assignment.dueDate) && assignment.status === 'active' && (
                                    <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                                      Soon
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{assignment.points} pts</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{assignment.submissionsCount}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(assignment.status)}`}>
                                  {assignment.status === 'active' ? 'Active' :
                                   assignment.status === 'draft' ? 'Draft' : 'Ended'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-primary-600 hover:text-primary-900 mr-3">
                                  <Icon name="eye" className="h-4 w-4 inline mr-1" />
                                  View
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900">
                                  <Icon name="file-text" className="h-4 w-4 inline mr-1" />
                                  Grade
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

export default Assignments;
