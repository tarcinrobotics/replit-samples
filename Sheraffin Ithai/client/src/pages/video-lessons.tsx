import React from 'react';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import Header from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarContext, useSidebarState } from '@/hooks/use-sidebar';
import { useQuery } from '@tanstack/react-query';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface VideoLesson {
  id: string;
  title: string;
  course: string;
  instructor: string;
  duration: string;
  views: number;
  thumbnailUrl: string;
  uploadDate: string;
}

const VideoLessons: React.FC = () => {
  const sidebarState = useSidebarState();
  
  const { data, isLoading } = useQuery<VideoLesson[]>({
    queryKey: ['/api/videos'],
  });

  // Fallback data
  const defaultVideos = [
    {
      id: '1',
      title: 'Introduction to HTML5',
      course: 'Web Development Fundamentals',
      instructor: 'John Smith',
      duration: '18:25',
      views: 1542,
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=HTML5+Intro',
      uploadDate: '2023-11-10T09:30:00Z'
    },
    {
      id: '2',
      title: 'CSS Flexbox Layout',
      course: 'Web Development Fundamentals',
      instructor: 'John Smith',
      duration: '23:10',
      views: 1238,
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=CSS+Flexbox',
      uploadDate: '2023-11-12T14:15:00Z'
    },
    {
      id: '3',
      title: 'Python for Data Analysis',
      course: 'Data Science Essentials',
      instructor: 'Sarah Johnson',
      duration: '32:44',
      views: 985,
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=Python+Data',
      uploadDate: '2023-11-15T11:20:00Z'
    },
    {
      id: '4',
      title: 'Mobile App Design Principles',
      course: 'UI/UX Design Principles',
      instructor: 'Emily Wilson',
      duration: '26:18',
      views: 723,
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=App+Design',
      uploadDate: '2023-11-18T16:45:00Z'
    },
    {
      id: '5',
      title: 'JavaScript ES6 Features',
      course: 'Web Development Fundamentals',
      instructor: 'John Smith',
      duration: '28:55',
      views: 1105,
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=ES6+Features',
      uploadDate: '2023-11-20T10:00:00Z'
    },
    {
      id: '6',
      title: 'Introduction to Neural Networks',
      course: 'Machine Learning Basics',
      instructor: 'David Chen',
      duration: '45:32',
      views: 832,
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=Neural+Networks',
      uploadDate: '2023-11-16T13:10:00Z'
    }
  ] as VideoLesson[];
  
  const videos = data || defaultVideos;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
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
          <Header title="Video Lessons" />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Educational Videos</h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="search" className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      placeholder="Search videos..." 
                      className="pl-10" 
                    />
                  </div>
                  <Button>
                    <Icon name="plus" className="h-4 w-4 mr-1" />
                    Upload Video
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="space-y-4 p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{video.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{video.course}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <div>Instructor: {video.instructor}</div>
                          <div className="flex items-center">
                            <Icon name="eye" className="h-4 w-4 mr-1" />
                            {formatViews(video.views)} views
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-xs text-gray-500">{formatDate(video.uploadDate)}</span>
                          <Button variant="outline" size="sm">
                            <Icon name="eye" className="h-3 w-3 mr-1" />
                            Watch
                          </Button>
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

export default VideoLessons;
