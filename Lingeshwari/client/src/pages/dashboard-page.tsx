import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { CourseCard } from "@/components/courses/course-card";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { BookOpen, Users, Calendar, Clock, PlusCircle, Bookmark, GraduationCap } from "lucide-react";
import { Course, Booking, Enrollment } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const isStudent = user?.role === "student";
  const isTutor = user?.role === "tutor";
  
  // Fetch courses
  const { data: courses } = useQuery<Course[]>({
    queryKey: [isTutor ? `/api/courses?tutorId=${user?.id}` : '/api/courses'],
    enabled: !!user,
  });
  
  // Fetch bookings
  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    enabled: !!user,
  });
  
  // Fetch enrollments for students
  const { data: enrollments } = useQuery<(Enrollment & { course?: Course })[]>({
    queryKey: ['/api/enrollments'],
    enabled: !!user && isStudent,
  });
  
  // Stats for dashboard cards
  const stats = {
    totalCourses: isTutor ? courses?.length || 0 : enrollments?.length || 0,
    upcomingBookings: bookings?.filter(b => b.status === "accepted" && new Date(b.date) > new Date()).length || 0,
    pendingBookings: bookings?.filter(b => b.status === "pending").length || 0,
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {isTutor && (
            <Button onClick={() => setLocation("/courses")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          )}
          {isStudent && (
            <Button onClick={() => setLocation("/tutors")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Find Tutors
            </Button>
          )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isTutor ? "My Courses" : "Enrolled Courses"}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {isTutor ? "Courses you're teaching" : "Courses you're enrolled in"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground">
                Confirmed upcoming sessions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">
                {isTutor ? "Waiting for your approval" : "Waiting for tutor approval"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
            {isStudent && <TabsTrigger value="enrolled">Enrolled Courses</TabsTrigger>}
            {isTutor && <TabsTrigger value="my-courses">My Courses</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{user ? `Welcome, ${user.firstName}` : "Welcome to TutorBridge"}</CardTitle>
                <CardDescription>
                  {isStudent 
                    ? "Track your learning journey and connect with expert tutors." 
                    : isTutor 
                      ? "Manage your courses and student sessions all in one place."
                      : "Manage the TutorBridge platform and its users."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Button variant="outline" className="justify-start" onClick={() => setLocation("/courses")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      {isStudent ? "Browse Courses" : "Manage Courses"}
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setLocation("/bookings")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Manage Bookings
                    </Button>
                    {isStudent && (
                      <Button variant="outline" className="justify-start" onClick={() => setLocation("/tutors")}>
                        <Users className="mr-2 h-4 w-4" />
                        Find Tutors
                      </Button>
                    )}
                    <Button variant="outline" className="justify-start" onClick={() => setLocation("/profile")}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      My Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {(bookings && bookings.length > 0) ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center gap-4 p-2 border rounded-md">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Booking {booking.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString()} • Status: {booking.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No recent activity to display</p>
                    <Button variant="link" onClick={() => setLocation(isStudent ? "/tutors" : "/courses")}>
                      {isStudent ? "Find a tutor" : "Create your first course"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  View and manage your upcoming booked sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <BookingsTable 
                    bookings={bookings.filter(b => b.status === "accepted" && new Date(b.date) > new Date())}
                    onRowClick={(booking) => console.log("Booking clicked", booking)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No upcoming sessions</p>
                    <Button variant="link" onClick={() => setLocation(isStudent ? "/tutors" : "/courses")}>
                      {isStudent ? "Find a tutor" : "Create your first course"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {isStudent && (
            <TabsContent value="enrolled">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                  <CardDescription>
                    Courses you're currently enrolled in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enrollments && enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {enrollments.map((enrollment) => (
                        enrollment.course && (
                          <CourseCard
                            key={enrollment.id}
                            course={enrollment.course}
                            enrolled={true}
                            onViewDetails={() => setLocation(`/courses/${enrollment.courseId}`)}
                          />
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bookmark className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">You're not enrolled in any courses yet</p>
                      <Button variant="link" onClick={() => setLocation("/courses")}>
                        Browse available courses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {isTutor && (
            <TabsContent value="my-courses">
              <Card>
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>
                    Courses you're teaching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {courses && courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onViewDetails={() => setLocation(`/courses/${course.id}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">You haven't created any courses yet</p>
                      <Button variant="link" onClick={() => setLocation("/courses")}>
                        Create your first course
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
