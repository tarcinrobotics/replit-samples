import React from 'react';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import Header from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarContext, useSidebarState } from '@/hooks/use-sidebar';
import { useQuery } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';

interface ContentItem {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'video' | 'image' | 'audio' | 'other';
  course: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
}

const ContentLibrary: React.FC = () => {
  const sidebarState = useSidebarState();
  
  const { data, isLoading } = useQuery<ContentItem[]>({
    queryKey: ['/api/content'],
  });

  // Fallback data
  const defaultContent = [
    {
      id: '1',
      title: 'HTML5 Course Syllabus.pdf',
      type: 'pdf',
      course: 'Web Development Fundamentals',
      size: '2.4 MB',
      uploadedBy: 'John Smith',
      uploadDate: '2023-11-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'CSS Grid Layout Examples.doc',
      type: 'doc',
      course: 'Web Development Fundamentals',
      size: '1.8 MB',
      uploadedBy: 'John Smith',
      uploadDate: '2023-11-16T14:45:00Z'
    },
    {
      id: '3',
      title: 'Data Visualization Best Practices.pdf',
      type: 'pdf',
      course: 'Data Science Essentials',
      size: '4.2 MB',
      uploadedBy: 'Sarah Johnson',
      uploadDate: '2023-11-10T09:15:00Z'
    },
    {
      id: '4',
      title: 'Mobile App Wireframes.image',
      type: 'image',
      course: 'UI/UX Design Principles',
      size: '5.7 MB',
      uploadedBy: 'Emily Wilson',
      uploadDate: '2023-11-18T11:20:00Z'
    },
    {
      id: '5',
      title: 'JavaScript Functions Overview.pdf',
      type: 'pdf',
      course: 'Web Development Fundamentals',
      size: '3.1 MB',
      uploadedBy: 'John Smith',
      uploadDate: '2023-11-14T16:00:00Z'
    },
    {
      id: '6',
      title: 'Introduction to Machine Learning.video',
      type: 'video',
      course: 'Machine Learning Basics',
      size: '128.5 MB',
      uploadedBy: 'David Chen',
      uploadDate: '2023-11-12T13:10:00Z'
    },
    {
      id: '7',
      title: 'Swift Programming Guide.pdf',
      type: 'pdf',
      course: 'Mobile App Development',
      size: '6.3 MB',
      uploadedBy: 'Michael Brown',
      uploadDate: '2023-11-17T15:30:00Z'
    },
    {
      id: '8',
      title: 'Design System Components.doc',
      type: 'doc',
      course: 'UI/UX Design Principles',
      size: '2.9 MB',
      uploadedBy: 'Emily Wilson',
      uploadDate: '2023-11-19T10:00:00Z'
    }
  ] as ContentItem[];
  
  const contentItems = data || defaultContent;
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <div className="h-8 w-8 rounded-md bg-red-100 flex items-center justify-center text-red-600">PDF</div>;
      case 'doc':
        return <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">DOC</div>;
      case 'video':
        return <div className="h-8 w-8 rounded-md bg-purple-100 flex items-center justify-center text-purple-600">VID</div>;
      case 'image':
        return <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center text-green-600">IMG</div>;
      case 'audio':
        return <div className="h-8 w-8 rounded-md bg-yellow-100 flex items-center justify-center text-yellow-600">AUD</div>;
      default:
        return <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">FILE</div>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <Header title="Content Library" />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Educational Resources</h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="search" className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      placeholder="Search content..." 
                      className="pl-10" 
                    />
                  </div>
                  <Button>
                    <Icon name="plus" className="h-4 w-4 mr-1" />
                    Upload Content
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {contentItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getFileIcon(item.type)}
                                  <div className="ml-4 text-sm font-medium text-gray-900">{item.title}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.course}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.size}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.uploadedBy}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(item.uploadDate)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-primary-600 hover:text-primary-900 mr-3">
                                  <Icon name="eye" className="h-4 w-4 inline mr-1" />
                                  View
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900">
                                  <Icon name="download" className="h-4 w-4 inline mr-1" />
                                  Download
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

export default ContentLibrary;
