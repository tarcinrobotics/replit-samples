import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CourseCard } from "@/components/courses/course-card";
import { BookingForm } from "@/components/bookings/booking-form";
import { User, TutorProfile, Course } from "@shared/schema";
import {
  BookOpen,
  Star,
  Calendar,
  Clock,
  GraduationCap,
  Mail,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";

export default function TutorDetailsPage() {
  const { id } = useParams();
  const tutorId = parseInt(id);
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);

  const isStudent = user?.role === "student";

  // Fetch tutor details
  const {
    data: tutor,
    isLoading,
    error,
  } = useQuery<User & { profile?: TutorProfile }>({
    queryKey: [`/api/tutors/${tutorId}`],
    enabled: !isNaN(tutorId),
  });

  // Fetch tutor's courses
  const { data: courses } = useQuery<Course[]>({
    queryKey: [`/api/tutors/${tutorId}/courses`],
    enabled: !isNaN(tutorId),
  });

  // Handle booking dialog
  const handleBookSession = (course: Course) => {
    setSelectedCourse(course);
    setBookDialogOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !tutor) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-2">Tutor not found</h2>
          <p className="text-muted-foreground mb-4">
            The tutor you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation("/tutors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tutors
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Format availability
  const formatAvailability = () => {
    if (!tutor.profile?.availability) return "Not specified";
    
    const availability = tutor.profile.availability as Record<string, boolean>;
    const availableDays = Object.keys(availability).filter(day => availability[day]);
    
    if (availableDays.length === 0) return "Not available";
    
    return availableDays
      .map(day => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/tutors")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Tutor Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-2">
                  <AvatarImage
                    src={tutor.profileImage}
                    alt={`${tutor.firstName} ${tutor.lastName}`}
                  />
                  <AvatarFallback>
                    {tutor.firstName?.charAt(0)}
                    {tutor.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {tutor.firstName} {tutor.lastName}
                </CardTitle>
                {tutor.profile?.rating && (
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                    <span>{tutor.profile.rating}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {tutor.bio && (
                  <div>
                    <h3 className="font-medium mb-1">About</h3>
                    <p className="text-sm text-muted-foreground">{tutor.bio}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-1">Subjects</h3>
                  {tutor.profile?.subjects && tutor.profile.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {tutor.profile.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No subjects specified</p>
                  )}
                </div>

                {tutor.profile?.hourlyRate !== undefined && (
                  <div>
                    <h3 className="font-medium mb-1">Hourly Rate</h3>
                    <p className="text-sm font-medium">
                      ${(tutor.profile.hourlyRate / 100).toFixed(2)}/hour
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-1">Availability</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatAvailability()}
                  </p>
                </div>

                {isStudent && (
                  <Button className="w-full" disabled={!courses || courses.length === 0}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Tutor
                  </Button>
                )}
              </CardContent>
            </Card>

            {tutor.profile && (
              <Card>
                <CardHeader>
                  <CardTitle>Education & Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tutor.profile.education && (
                    <div>
                      <h3 className="font-medium mb-1">Education</h3>
                      <p className="text-sm text-muted-foreground">
                        {tutor.profile.education}
                      </p>
                    </div>
                  )}

                  {tutor.profile.experience && (
                    <div>
                      <h3 className="font-medium mb-1">Experience</h3>
                      <p className="text-sm text-muted-foreground">
                        {tutor.profile.experience}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Courses
                  {courses && (
                    <Badge variant="outline" className="ml-2">
                      {courses.length} courses
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Courses offered by {tutor.firstName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courses && courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.filter(course => course.isActive).map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onViewDetails={() => setLocation(`/courses/${course.id}`)}
                        onEnroll={() => handleBookSession(course)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      This tutor doesn't have any active courses
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const dayKey = day.toLowerCase();
                    const isAvailable = tutor.profile?.availability ? 
                      (tutor.profile.availability as any)[dayKey] : false;
                    
                    return (
                      <div 
                        key={day} 
                        className={`p-2 text-center rounded-md ${
                          isAvailable ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">{day.slice(0, 3)}</div>
                        {isAvailable ? (
                          <Check className="h-4 w-4 mx-auto text-green-500" />
                        ) : (
                          <X className="h-4 w-4 mx-auto text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      {selectedCourse && (
        <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Book a Session</DialogTitle>
              <DialogDescription>
                Select a date and time for your session with {tutor.firstName}.
              </DialogDescription>
            </DialogHeader>
            <BookingForm
              course={selectedCourse}
              onSuccess={() => setBookDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
