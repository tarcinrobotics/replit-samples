import React from 'react';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import Header from '@/components/layout/header';
import { SidebarContext, useSidebarState } from '@/hooks/use-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Tab, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

const Analytics: React.FC = () => {
  const sidebarState = useSidebarState();
  const [timeframe, setTimeframe] = React.useState('month');
  
  const { data: studentData, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/analytics/students', timeframe],
  });

  const { data: courseData, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/analytics/courses', timeframe],
  });

  // Default data for visualization
  const studentStats = {
    total: 2547,
    active: 2103,
    inactive: 244,
    graduated: 200,
    completionRate: 78.3,
    retentionRate: 91.2,
    engagementRate: 84.5,
    demographics: {
      ageGroups: [
        { label: '18-24', value: 35 },
        { label: '25-34', value: 42 },
        { label: '35-44', value: 15 },
        { label: '45+', value: 8 }
      ],
      countries: [
        { label: 'United States', value: 45 },
        { label: 'India', value: 12 },
        { label: 'UK', value: 8 },
        { label: 'Canada', value: 6 },
        { label: 'Others', value: 29 }
      ]
    }
  };
  
  const courseStats = {
    total: 36,
    active: 28,
    draft: 5,
    archived: 3,
    avgCompletionTime: '4.2 weeks',
    avgRating: 4.6,
    categories: [
      { label: 'Web Development', value: 32 },
      { label: 'Data Science', value: 24 },
      { label: 'Mobile Development', value: 18 },
      { label: 'UI/UX Design', value: 16 },
      { label: 'Machine Learning', value: 10 }
    ],
    difficulty: [
      { label: 'Beginner', value: 45 },
      { label: 'Intermediate', value: 38 },
      { label: 'Advanced', value: 17 }
    ]
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
          <Header title="Analytics" />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Platform Analytics</h2>
                <div>
                  <Tabs defaultValue={timeframe} onValueChange={setTimeframe}>
                    <TabsList>
                      <TabsTrigger value="week">This Week</TabsTrigger>
                      <TabsTrigger value="month">This Month</TabsTrigger>
                      <TabsTrigger value="quarter">This Quarter</TabsTrigger>
                      <TabsTrigger value="year">This Year</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-gray-500">Total Students</p>
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{studentStats.total}</h3>
                        <div className="p-2 bg-primary-50 rounded-full">
                          <Icon name="user" className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-gray-500">Active Courses</p>
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{courseStats.active}</h3>
                        <div className="p-2 bg-blue-50 rounded-full">
                          <Icon name="book" className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-gray-500">Completion Rate</p>
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{studentStats.completionRate}%</h3>
                        <div className="p-2 bg-green-50 rounded-full">
                          <Icon name="check" className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-gray-500">Avg. Course Rating</p>
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{courseStats.avgRating.toFixed(1)}/5</h3>
                        <div className="p-2 bg-yellow-50 rounded-full">
                          <span className="text-yellow-600">★</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Chart Tabs */}
              <Tabs defaultValue="students">
                <TabsList className="mb-6">
                  <TabsTrigger value="students">Student Analytics</TabsTrigger>
                  <TabsTrigger value="courses">Course Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="students" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Student Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Active Students</span>
                            <span>{studentStats.active}</span>
                          </div>
                          <Progress value={(studentStats.active / studentStats.total) * 100} className="h-2" />
                          
                          <div className="flex justify-between">
                            <span>Inactive Students</span>
                            <span>{studentStats.inactive}</span>
                          </div>
                          <Progress value={(studentStats.inactive / studentStats.total) * 100} className="h-2 bg-gray-200" />
                          
                          <div className="flex justify-between">
                            <span>Graduated Students</span>
                            <span>{studentStats.graduated}</span>
                          </div>
                          <Progress value={(studentStats.graduated / studentStats.total) * 100} className="h-2 bg-gray-200" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Student Demographics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Demographics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <h4 className="text-sm font-medium mb-4">Age Groups</h4>
                          <div className="space-y-4">
                            {studentStats.demographics.ageGroups.map((group, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-700">{group.label}</span>
                                  <span className="text-sm font-medium text-gray-900">{group.value}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${group.value}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-4">Top Countries</h4>
                          <div className="space-y-4">
                            {studentStats.demographics.countries.map((country, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-700">{country.label}</span>
                                  <span className="text-sm font-medium text-gray-900">{country.value}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${country.value}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Student Engagement Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-2 items-center justify-center p-4 border rounded-lg">
                          <span className="text-sm text-gray-500">Completion Rate</span>
                          <div className="relative pt-1 w-full">
                            <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
                              <div style={{ width: `${studentStats.completionRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                            </div>
                          </div>
                          <span className="text-xl font-bold">{studentStats.completionRate}%</span>
                        </div>
                        
                        <div className="flex flex-col space-y-2 items-center justify-center p-4 border rounded-lg">
                          <span className="text-sm text-gray-500">Retention Rate</span>
                          <div className="relative pt-1 w-full">
                            <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
                              <div style={{ width: `${studentStats.retentionRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                            </div>
                          </div>
                          <span className="text-xl font-bold">{studentStats.retentionRate}%</span>
                        </div>
                        
                        <div className="flex flex-col space-y-2 items-center justify-center p-4 border rounded-lg">
                          <span className="text-sm text-gray-500">Engagement Rate</span>
                          <div className="relative pt-1 w-full">
                            <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
                              <div style={{ width: `${studentStats.engagementRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                            </div>
                          </div>
                          <span className="text-xl font-bold">{studentStats.engagementRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="courses" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Active Courses</span>
                            <span>{courseStats.active}</span>
                          </div>
                          <Progress value={(courseStats.active / courseStats.total) * 100} className="h-2" />
                          
                          <div className="flex justify-between">
                            <span>Draft Courses</span>
                            <span>{courseStats.draft}</span>
                          </div>
                          <Progress value={(courseStats.draft / courseStats.total) * 100} className="h-2 bg-gray-200" />
                          
                          <div className="flex justify-between">
                            <span>Archived Courses</span>
                            <span>{courseStats.archived}</span>
                          </div>
                          <Progress value={(courseStats.archived / courseStats.total) * 100} className="h-2 bg-gray-200" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Course Difficulty Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Difficulty Levels</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {courseStats.difficulty.map((level, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-700">{level.label}</span>
                                <span className="text-sm font-medium text-gray-900">{level.value}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full ${
                                  level.label === 'Beginner' ? 'bg-green-500' :
                                  level.label === 'Intermediate' ? 'bg-blue-500' : 'bg-purple-500'
                                }`} style={{ width: `${level.value}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Course Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {courseStats.categories.map((category, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-700">{category.label}</span>
                              <span className="text-sm font-medium text-gray-900">{category.value}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className={`h-2.5 rounded-full ${
                                index === 0 ? 'bg-blue-600' :
                                index === 1 ? 'bg-green-500' :
                                index === 2 ? 'bg-purple-500' :
                                index === 3 ? 'bg-pink-500' : 'bg-yellow-500'
                              }`} style={{ width: `${category.value}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Course Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-2 items-center justify-center p-4 border rounded-lg">
                          <span className="text-sm text-gray-500">Avg. Completion Time</span>
                          <span className="text-xl font-bold">{courseStats.avgCompletionTime}</span>
                        </div>
                        
                        <div className="flex flex-col space-y-2 items-center justify-center p-4 border rounded-lg">
                          <span className="text-sm text-gray-500">Avg. Rating</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xl ${i < Math.floor(courseStats.avgRating) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                          <span className="text-xl font-bold">{courseStats.avgRating.toFixed(1)}/5</span>
                        </div>
                        
                        <div className="flex flex-col space-y-2 items-center justify-center p-4 border rounded-lg">
                          <span className="text-sm text-gray-500">Student Satisfaction</span>
                          <div className="relative pt-1 w-full">
                            <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
                              <div style={{ width: '92%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                            </div>
                          </div>
                          <span className="text-xl font-bold">92%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Analytics;
