import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CourseForm } from "@/components/courses/course-form";
import { BookingForm } from "@/components/bookings/booking-form";
import { ReviewForm } from "@/components/courses/review-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Course, User, TutorProfile, Enrollment, Review } from "@shared/schema";
import {
  BookOpen,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Edit,
  Star,
  ExternalLink,
  ArrowLeft,
  Trash,
} from "lucide-react";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const courseId = parseInt(id);
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);

  const isStudent = user?.role === "student";
  const isTutor = user?.role === "tutor";

  // Fetch course details
  const {
    data: course,
    isLoading,
    error,
  } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !isNaN(courseId),
  });

  // Fetch tutor details
  const { data: tutor } = useQuery<User & { profile?: TutorProfile }>({
    queryKey: [course ? `/api/tutors/${course.tutorId}` : null],
    enabled: !!course,
  });

  // Fetch enrollment status
  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
    enabled: !!user && isStudent,
  });

  // Fetch reviews
  const { data: reviews } = useQuery<(Review & { studentName?: string })[]>({
    queryKey: [`/api/reviews/course/${courseId}`],
    enabled: !isNaN(courseId),
  });

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/enrollments", { courseId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully enrolled in this course.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in this course.",
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setLocation("/courses");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course.",
        variant: "destructive",
      });
    },
  });

  // Handle enrollment
  const handleEnroll = () => {
    if (!user) return;
    enrollMutation.mutate();
  };

  // Handle delete
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  // Check if student is enrolled
  const isEnrolled = enrollments?.some(
    (enrollment) => enrollment.courseId === courseId
  );

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100);
  };

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Calculate average rating
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation("/courses")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isOwner = isTutor && user?.id === course.tutorId;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/courses")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
            <Badge variant={course.isActive ? "default" : "outline"}>
              {course.level}
            </Badge>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Edit Course</DialogTitle>
                      <DialogDescription>
                        Make changes to your course. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <CourseForm
                      course={course}
                      onSuccess={() => setEditDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </>
            )}

            {isStudent && !isEnrolled && (
              <Button
                onClick={handleEnroll}
                disabled={enrollMutation.isPending || !course.isActive}
              >
                {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
              </Button>
            )}

            {isStudent && isEnrolled && (
              <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Book a Session</DialogTitle>
                    <DialogDescription>
                      Select a date and time for your session with the tutor.
                    </DialogDescription>
                  </DialogHeader>
                  <BookingForm
                    course={course}
                    onSuccess={() => setBookDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{course.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Duration
                    </span>
                    <span className="font-medium">
                      {formatDuration(course.duration)}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Subject
                    </span>
                    <span className="font-medium">{course.subject}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Max Students
                    </span>
                    <span className="font-medium">{course.maxStudents}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Price
                    </span>
                    <span className="font-medium">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {reviews && reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Reviews
                    <Badge variant="outline" className="ml-2">
                      {reviews.length} reviews
                    </Badge>
                    {averageRating > 0 && (
                      <div className="flex items-center ml-auto">
                        <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                        <span>{averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b last:border-b-0 pb-4 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{review.studentName}</div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.comment || "No comment provided."}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tutor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tutor ? (
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage
                        src={tutor.profileImage}
                        alt={`${tutor.firstName} ${tutor.lastName}`}
                      />
                      <AvatarFallback>
                        {tutor.firstName?.charAt(0)}
                        {tutor.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-medium">
                      {tutor.firstName} {tutor.lastName}
                    </h3>
                    {tutor.profile?.rating && (
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                        <span>{tutor.profile.rating}</span>
                      </div>
                    )}
                    {tutor.bio && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {tutor.bio}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={() => setLocation(`/tutors/${tutor.id}`)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Tutor Profile
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Tutor information not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {isStudent && isEnrolled && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => setBookDialogOpen(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book a Session
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                    <CardDescription>Share your experience with this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReviewForm courseId={courseId} />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
