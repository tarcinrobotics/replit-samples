import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Course, insertCourseSchema } from "@shared/schema";
import { LoadingSpinner, FullPageLoader } from "@/components/LoadingSpinner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  PlusCircle,
  BarChart,
  Users,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DashboardData = {
  courses: (Course & { bookings: any[]; averageRating: number })[];
  totalCourses: number;
  totalBookings: number;
};

export default function TutorDashboard() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [isViewCourseDialogOpen, setIsViewCourseDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Fetch tutor dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<DashboardData>({
    queryKey: ["/api/tutor/dashboard"],
  });

  // Fetch subjects for form select
  const { data: subjects } = useQuery<string[]>({
    queryKey: ["/api/subjects"],
  });

  // Create course form
  const courseForm = useForm({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: 0,
      subject: "",
      tutorId: user?.id || 0,
    },
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course created successfully!",
      });
      // Reset form and close dialog
      courseForm.reset();
      setIsAddCourseDialogOpen(false);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/dashboard"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking status updated!",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/dashboard"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCreateCourse = (data: any) => {
    createCourseMutation.mutate({
      ...data,
      price: parseFloat(data.price),
      tutorId: user?.id,
    });
  };

  const confirmBooking = (bookingId: number) => {
    updateBookingStatusMutation.mutate({ id: bookingId, status: "Confirmed" });
  };

  // Edit course handler
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    courseForm.reset({
      title: course.title,
      description: course.description,
      subject: course.subject,
      category: course.category,
      price: course.price,
      tutorId: course.tutorId
    });
    setIsEditCourseDialogOpen(true);
  };

  // View course handler
  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsViewCourseDialogOpen(true);
  };

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/courses/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course updated successfully!",
      });
      // Reset form and close dialog
      setIsEditCourseDialogOpen(false);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateCourse = (data: any) => {
    if (selectedCourse) {
      updateCourseMutation.mutate({
        id: selectedCourse.id,
        ...data,
        price: parseFloat(data.price),
        tutorId: user?.id,
      });
    }
  };

  // Show loading screen while data is being fetched
  if (isLoading) {
    return <FullPageLoader />;
  }

  // If error occurs
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h1>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  // Get recent bookings (last 3)
  const recentBookings = dashboardData?.courses
    .flatMap((course) => course.bookings)
    .sort((a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-primary text-xl font-bold">
                  EduConnect
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {/* Desktop navigation */}
                <Link
                  href="/"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/courses"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Courses
                </Link>
                <Link
                  href="/tutor-dashboard"
                  className="border-primary text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Desktop right navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline-block">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Courses
            </Link>
            <Link
              href="/tutor-dashboard"
              className="bg-primary-50 border-primary text-primary block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile user menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
              >
                Profile
              </button>
              <button
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard content */}
      <div className="py-10 flex-grow">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Tutor Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Dashboard summary cards */}
            <div className="px-4 py-8 sm:px-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Courses Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.totalCourses || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData?.totalCourses === 0
                        ? "No courses created yet"
                        : `Across ${new Set(dashboardData?.courses.map(c => c.subject)).size} subjects`}
                    </p>
                  </CardContent>
                </Card>

                {/* Total Bookings Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.totalBookings || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData?.totalBookings === 0
                        ? "No bookings received yet"
                        : `From your ${dashboardData?.totalCourses} courses`}
                    </p>
                  </CardContent>
                </Card>

                {/* Pending Bookings Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData?.courses
                        .flatMap(course => course.bookings)
                        .filter(booking => booking.status === "Pending")
                        .length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting your confirmation
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Bookings and Courses Section */}
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Pending Bookings Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {dashboardData?.courses
                        .flatMap(course => course.bookings)
                        .filter(booking => booking.status === "Pending")
                        .length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Awaiting your confirmation</p>
                  </CardContent>
                </Card>

                {/* Total Courses Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Your Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboardData?.courses.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Active courses</p>
                  </CardContent>
                </Card>

                {/* Average Rating Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {(dashboardData?.courses.reduce((sum, course) => sum + course.averageRating, 0) / 
                        (dashboardData?.courses.length || 1)).toFixed(1)} ⭐
                    </div>
                    <p className="text-xs text-muted-foreground">Based on student reviews</p>
                  </CardContent>
                </Card>
              </div>

              {/* My Courses Table */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>My Courses</CardTitle>
                      <CardDescription>
                        Manage your course offerings
                      </CardDescription>
                    </div>
                    <Dialog open={isAddCourseDialogOpen} onOpenChange={setIsAddCourseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add New Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                          <DialogTitle>Create a New Course</DialogTitle>
                          <DialogDescription>
                            Fill in the details below to create a new course offering.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...courseForm}>
                          <form onSubmit={courseForm.handleSubmit(handleCreateCourse)} className="space-y-4">
                            <FormField
                              control={courseForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Course Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="E.g., Introduction to Python" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={courseForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Provide a detailed description of your course..." 
                                      rows={3}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={courseForm.control}
                                name="subject"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a subject" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {subjects?.map((subject) => (
                                          <SelectItem key={subject} value={subject}>
                                            {subject}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={courseForm.control}
                                name="category"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                      <Input placeholder="E.g., Beginner" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={courseForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price ($)</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="0" step="0.01" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Set the price for your course in USD
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={createCourseMutation.isPending}
                              >
                                {createCourseMutation.isPending ? (
                                  <>
                                    <LoadingSpinner className="mr-2" size={16} />
                                    Creating...
                                  </>
                                ) : (
                                  "Create Course"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboardData?.courses.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg mb-6">You haven't created any courses yet.</p>
                      <Button onClick={() => setIsAddCourseDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Course
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Bookings</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboardData?.courses.map((course) => (
                            <TableRow key={course.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{course.title}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-xs">{course.description}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{course.subject}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">${course.price.toFixed(2)}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{course.bookings.length}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 px-2"
                                    onClick={() => handleEditCourse(course)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 px-2"
                                    onClick={() => handleViewCourse(course)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Bookings Table */}
              {dashboardData && dashboardData.courses.some(course => 
                course.bookings.some(booking => booking.status === "Pending")
              ) && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Pending Bookings</CardTitle>
                    <CardDescription>
                      Review and confirm student enrollment requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Booking Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboardData.courses.flatMap(course => 
                            course.bookings
                              .filter(booking => booking.status === "Pending")
                              .map(booking => (
                                <TableRow key={booking.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{course.title}</p>
                                      <p className="text-sm text-gray-500">{course.subject}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {booking.student ? (
                                        <>
                                          <div className="font-medium">{booking.student.name}</div>
                                          <div className="text-xs text-gray-500">{booking.student.email}</div>
                                        </>
                                      ) : (
                                        <>Student #{booking.studentId}</>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(booking.bookingTime).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                      <Clock className="mr-1 h-3 w-3" />
                                      Pending
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      className="h-8"
                                      onClick={() => confirmBooking(booking.id)}
                                      disabled={updateBookingStatusMutation.isPending}
                                    >
                                      {updateBookingStatusMutation.isPending ? (
                                        <LoadingSpinner size={16} />
                                      ) : (
                                        <>
                                          <Check className="mr-1 h-3 w-3" />
                                          Confirm
                                        </>
                                      )}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Course Dialog */}
      <Dialog open={isEditCourseDialogOpen} onOpenChange={setIsEditCourseDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update your course details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(handleUpdateCourse)} className="space-y-4">
              <FormField
                control={courseForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={courseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={courseForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects?.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={courseForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={courseForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Set the price for your course in USD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateCourseMutation.isPending}
                >
                  {updateCourseMutation.isPending ? (
                    <>
                      <LoadingSpinner className="mr-2" size={16} />
                      Updating...
                    </>
                  ) : (
                    "Update Course"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Course Dialog */}
      <Dialog open={isViewCourseDialogOpen} onOpenChange={setIsViewCourseDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Course details and information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-gray-500 mt-1">{selectedCourse?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Subject</h4>
                <p className="text-sm text-gray-500 mt-1">{selectedCourse?.subject}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Category</h4>
                <p className="text-sm text-gray-500 mt-1">{selectedCourse?.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Price</h4>
                <p className="text-sm text-gray-500 mt-1">${selectedCourse?.price.toFixed(2)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Total Bookings</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {dashboardData?.courses.find(c => c.id === selectedCourse?.id)?.bookings.length || 0}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewCourseDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewCourseDialogOpen(false);
              if (selectedCourse) {
                handleEditCourse(selectedCourse);
              }
            }}>
              Edit Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}