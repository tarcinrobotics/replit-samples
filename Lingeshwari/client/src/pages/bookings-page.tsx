import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Booking, Course, User } from "@shared/schema";
import { Calendar, GraduationCap } from "lucide-react";

export default function BookingsPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  
  const isStudent = user?.role === "student";
  const isTutor = user?.role === "tutor";
  
  // Fetch bookings
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    enabled: !!user,
  });
  
  // Group bookings by status
  const upcomingBookings = bookings?.filter(
    (booking) => 
      booking.status === "accepted" && 
      new Date(booking.date) > new Date()
  ) || [];
  
  const pendingBookings = bookings?.filter(
    (booking) => booking.status === "pending"
  ) || [];
  
  const pastBookings = bookings?.filter(
    (booking) => 
      (booking.status === "completed" || booking.status === "accepted") && 
      new Date(booking.date) < new Date()
  ) || [];
  
  const cancelledBookings = bookings?.filter(
    (booking) => booking.status === "cancelled" || booking.status === "rejected"
  ) || [];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">
              {isStudent 
                ? "Manage your session bookings with tutors" 
                : "Manage your student session requests"}
            </p>
          </div>
          
          {isStudent && (
            <Button onClick={() => setLocation("/tutors")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Find Tutors
            </Button>
          )}
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingBookings.length > 0 && (
                <span className="ml-1 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                  {upcomingBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingBookings.length > 0 && (
                <span className="ml-1 bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs">
                  {pendingBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Your confirmed upcoming sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <BookingsTable 
                    bookings={upcomingBookings} 
                    onRowClick={(booking) => console.log('Clicked booking', booking)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any upcoming sessions scheduled.
                    </p>
                    {isStudent && (
                      <Button variant="outline" onClick={() => setLocation("/tutors")}>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Find Tutors
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Sessions</CardTitle>
                <CardDescription>
                  {isStudent 
                    ? "Sessions waiting for tutor approval" 
                    : "Sessions waiting for your approval"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : pendingBookings.length > 0 ? (
                  <BookingsTable 
                    bookings={pendingBookings}
                    onRowClick={(booking) => console.log('Clicked booking', booking)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                    <p className="text-muted-foreground">
                      You don't have any pending session requests.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Sessions</CardTitle>
                <CardDescription>
                  Your completed sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : pastBookings.length > 0 ? (
                  <BookingsTable 
                    bookings={pastBookings}
                    onRowClick={(booking) => console.log('Clicked booking', booking)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No past sessions</h3>
                    <p className="text-muted-foreground">
                      You don't have any past sessions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cancelled">
            <Card>
              <CardHeader>
                <CardTitle>Cancelled Sessions</CardTitle>
                <CardDescription>
                  Your cancelled or rejected sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : cancelledBookings.length > 0 ? (
                  <BookingsTable 
                    bookings={cancelledBookings}
                    onRowClick={(booking) => console.log('Clicked booking', booking)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No cancelled sessions</h3>
                    <p className="text-muted-foreground">
                      You don't have any cancelled or rejected sessions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
