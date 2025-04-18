import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/layout/user-avatar';

// API response student type
interface ApiStudent {
  id: number;
  userId: number;
  progress: number;
  enrollmentDate: string;
  status: string;
  createdAt: string;
}

// Component display student type
interface Student {
  id: string;
  name: string;
  email: string;
  course: {
    title: string;
    track: string;
  };
  progress: number;
  status: 'active' | 'on-hold' | 'completed';
}

interface StudentsTableProps {
  timeframe?: 'week' | 'month' | 'quarter';
}

const StudentsTable: React.FC<StudentsTableProps> = ({ timeframe = 'week' }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(timeframe);

  const { data: apiData, isLoading } = useQuery<{ students: ApiStudent[], total: number }>({
    queryKey: ['/api/students/recent', selectedTimeframe],
  });

  // Transform API data to display format
  const transformedStudents = apiData?.students?.map(student => ({
    id: student.id.toString(),
    name: `Student ${student.userId}`, // Placeholder, ideally would fetch from user data
    email: `student${student.userId}@educonnect.com`, // Placeholder
    course: {
      title: 'Web Development Fundamentals', // Placeholder
      track: 'Full Stack Track'             // Placeholder
    },
    progress: student.progress,
    status: student.status as 'active' | 'on-hold' | 'completed'
  }));

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fallback data if API doesn't return anything
  const defaultStudents = [
    {
      id: '1',
      name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      course: {
        title: 'Web Development Fundamentals',
        track: 'Frontend Track'
      },
      progress: 25,
      status: 'active'
    },
    {
      id: '2',
      name: 'Mark Johnson',
      email: 'mark.j@example.com',
      course: {
        title: 'Data Science Essentials',
        track: 'Analytics Track'
      },
      progress: 60,
      status: 'active'
    },
    {
      id: '3',
      name: 'Emma Lewis',
      email: 'emma.l@example.com',
      course: {
        title: 'UI/UX Design Principles',
        track: 'Design Track'
      },
      progress: 45,
      status: 'on-hold'
    },
    {
      id: '4',
      name: 'Ryan Davis',
      email: 'ryan.d@example.com',
      course: {
        title: 'Mobile App Development',
        track: 'iOS Track'
      },
      progress: 80,
      status: 'active'
    }
  ] as Student[];

  const students = transformedStudents || defaultStudents;
  const totalStudents = apiData?.total || 24;

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2">
      <CardContent className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Recent Students</h3>
            <p className="mt-1 text-sm text-gray-500">Newly registered students</p>
          </div>
          <div>
            <Select 
              defaultValue={selectedTimeframe}
              onValueChange={(value) => setSelectedTimeframe(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="animate-pulse p-4">
            <div className="h-16 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-16 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-16 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Course</th>
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
                    <div className="text-sm text-gray-900">{student.course.title}</div>
                    <div className="text-sm text-gray-500">{student.course.track}</div>
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
                      {student.status === 'active' ? 'Active' : 
                       student.status === 'on-hold' ? 'On Hold' : 'Completed'}
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
        )}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
            <p className="text-sm text-gray-500">Showing {students.length} of {totalStudents} results</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentsTable;
