import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User, Course } from "@shared/schema";
import { LoadingSpinner, FullPageLoader } from "@/components/LoadingSpinner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Settings,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  BarChart,
  ShieldAlert,
  Search,
  Eye,
  Edit,
  Trash,
  Star,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Remove password property from the User type
type UserWithoutPassword = Omit<User, "password">;

type PlatformStatistics = {
  totalStudents: number;
  totalTutors: number;
  totalCourses: number;
  totalBookings: number;
  confirmedBookings: number;
};

type DetailedBooking = {
  id: number;
  status: string;
  bookingTime: string;
  studentId: number;
  courseId: number;
  sessionDate: string | null;
  course: {
    id: number;
    title: string;
    subject: string;
  };
  student: {
    id: number;
    name: string;
    email: string;
  };
  tutor: {
    id: number;
    name: string;
    email: string;
  };
};

export default function AdminDashboard() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  // Fetch admin statistics
  const { 
    data: statistics, 
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery<PlatformStatistics>({
    queryKey: ["/api/admin/statistics"],
  });

  // Fetch all users
  const { 
    data: allUsers, 
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch tutors (for approval)
  const { 
    data: tutors, 
    isLoading: isLoadingTutors 
  } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/users/Tutor"],
  });

  // Fetch all courses
  const { 
    data: courses, 
    isLoading: isLoadingCourses,
    error: coursesError
  } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
  });

  // Fetch all bookings
  const { 
    data: bookings, 
    isLoading: isLoadingBookings,
    error: bookingsError
  } = useQuery<DetailedBooking[]>({
    queryKey: ["/api/admin/bookings"],
  });

  // Update tutor approval status mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ id, isApproved }: { id: number; isApproved: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/approve`, { isApproved });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor approval status updated",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/Tutor"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      
      // Close the dialog
      setIsApproveDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/courses/${id}`);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (userId: number) => {
    setSelectedUserId(userId);
    setIsApproveDialogOpen(true);
  };

  const confirmApproval = (isApproved: boolean) => {
    if (selectedUserId) {
      approvalMutation.mutate({ id: selectedUserId, isApproved });
    }
  };

  const handleDeleteCourse = (courseId: number) => {
    if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      deleteMutation.mutate(courseId);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Filter users based on search term
  const filteredUsers = allUsers?.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Filter courses based on search term
  const filteredCourses = courses?.filter(
    (course) =>
      course.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
      course.subject.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
      (course as any).tutorName?.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  // Filter bookings based on search term
  const filteredBookings = bookings?.filter(
    (booking) =>
      booking.course.title.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
      booking.student.name.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
      booking.tutor.name.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
      booking.status.toLowerCase().includes(bookingSearchTerm.toLowerCase())
  );

  // Loading state
  const isLoading = isLoadingStats || isLoadingUsers || isLoadingCourses || isLoadingBookings;
  if (isLoading) {
    return <FullPageLoader />;
  }

  // Error state
  const error = statsError || usersError || coursesError || bookingsError;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h1>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  // Ensure we have admin access
  if (user?.role !== "Admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  // Get pending tutors count
  const pendingTutors = tutors?.filter(tutor => !tutor.isApproved) || [];

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
                  href="/admin-dashboard"
                  className="border-primary text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Admin Dashboard
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
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <span className="hidden md:inline-block">{user?.name}</span>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      Admin
                    </Badge>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
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
              href="/admin-dashboard"
              className="bg-primary-50 border-primary text-primary block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Admin Dashboard
            </Link>
          </div>
          
          {/* Mobile user menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5" />
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
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Admin Dashboard</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Dashboard tabs */}
          <div className="px-4 py-6 sm:px-0">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
              <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-4 gap-2">
                <TabsTrigger value="overview" className="px-6">
                  <BarChart className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="px-6">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="courses" className="px-6">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Courses
                </TabsTrigger>
                <TabsTrigger value="bookings" className="px-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  Bookings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{statistics?.totalStudents}</div>
                      <p className="text-xs text-muted-foreground">Registered students on the platform</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
                      {pendingTutors.length > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          {pendingTutors.length} Pending
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{statistics?.totalTutors}</div>
                      <p className="text-xs text-muted-foreground">
                        {tutors && tutors.filter(t => t.isApproved).length} approved, {pendingTutors.length} pending approval
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{statistics?.totalCourses}</div>
                      <p className="text-xs text-muted-foreground">Courses available on the platform</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{statistics?.totalBookings}</div>
                      <p className="text-xs text-muted-foreground">
                        {statistics?.confirmedBookings} confirmed, {(statistics?.totalBookings || 0) - (statistics?.confirmedBookings || 0)} pending
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity and Pending Approvals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending Tutor Approvals */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Tutor Approvals</CardTitle>
                      <CardDescription>
                        Tutors waiting for account approval
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingTutors ? (
                        <div className="flex justify-center py-8">
                          <LoadingSpinner size={30} />
                        </div>
                      ) : pendingTutors.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No pending tutor approvals
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {pendingTutors.map((tutor) => (
                            <div key={tutor.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{tutor.name}</div>
                                <div className="text-sm text-gray-500">{tutor.email}</div>
                                <div className="text-xs text-gray-400">Registered on {new Date(tutor.createdAt).toLocaleDateString()}</div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                  onClick={() => handleApprove(tutor.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleApprove(tutor.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Bookings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Bookings</CardTitle>
                      <CardDescription>
                        Latest bookings made on the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingBookings ? (
                        <div className="flex justify-center py-8">
                          <LoadingSpinner size={30} />
                        </div>
                      ) : !bookings || bookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No bookings found
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings.slice(0, 5).map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{booking.course.title}</div>
                                <div className="text-sm text-gray-500">
                                  Student: {booking.student.name} • Tutor: {booking.tutor.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Booked on {new Date(booking.bookingTime).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge className={booking.status === "Confirmed" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"}>
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                          Manage all users on the platform
                        </CardDescription>
                      </div>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          className="pl-8"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUsers ? (
                      <div className="flex justify-center py-12">
                        <LoadingSpinner size={40} />
                      </div>
                    ) : !filteredUsers || filteredUsers.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No users found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Registered</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    user.role === "Admin" ? "default" : 
                                    user.role === "Tutor" ? "outline" : "secondary"
                                  }>
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {user.role === "Tutor" && (
                                    <Badge variant={user.isApproved ? "success" : "outline"} className={
                                      user.isApproved 
                                        ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                    }>
                                      {user.isApproved ? "Approved" : "Pending"}
                                    </Badge>
                                  )}
                                  {user.role === "Student" && (
                                    <Badge variant="success" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                      Active
                                    </Badge>
                                  )}
                                  {user.role === "Admin" && (
                                    <Badge variant="success" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                      Admin
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {user.role === "Tutor" && !user.isApproved && (
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50"
                                        onClick={() => handleApprove(user.id)}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    )}
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
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <CardTitle>Course Management</CardTitle>
                        <CardDescription>
                          Manage all courses on the platform
                        </CardDescription>
                      </div>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search courses..."
                          className="pl-8"
                          value={courseSearchTerm}
                          onChange={(e) => setCourseSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCourses ? (
                      <div className="flex justify-center py-12">
                        <LoadingSpinner size={40} />
                      </div>
                    ) : !filteredCourses || filteredCourses.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No courses found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Course Title</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Tutor</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCourses.map((course) => (
                              <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>{course.subject}</TableCell>
                                <TableCell>{(course as any).tutorName || "Unknown"}</TableCell>
                                <TableCell>${course.price.toFixed(2)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span>{course.averageRating?.toFixed(1) || "N/A"}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                                      onClick={() => handleDeleteCourse(course.id)}
                                    >
                                      <Trash className="h-4 w-4" />
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
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <CardTitle>Booking Management</CardTitle>
                        <CardDescription>
                          View all bookings on the platform
                        </CardDescription>
                      </div>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search bookings..."
                          className="pl-8"
                          value={bookingSearchTerm}
                          onChange={(e) => setBookingSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingBookings ? (
                      <div className="flex justify-center py-12">
                        <LoadingSpinner size={40} />
                      </div>
                    ) : !filteredBookings || filteredBookings.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No bookings found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Course</TableHead>
                              <TableHead>Student</TableHead>
                              <TableHead>Tutor</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Booking Date</TableHead>
                              <TableHead>Session Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredBookings.map((booking) => (
                              <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.course.title}</TableCell>
                                <TableCell>{booking.student.name}</TableCell>
                                <TableCell>{booking.tutor.name}</TableCell>
                                <TableCell>
                                  <Badge className={booking.status === "Confirmed" 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-yellow-100 text-yellow-800"}>
                                    {booking.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(booking.bookingTime).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {booking.sessionDate 
                                    ? new Date(booking.sessionDate).toLocaleDateString() 
                                    : <span className="text-gray-400 italic">Not scheduled</span>}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Tutor Approval Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tutor Approval</DialogTitle>
            <DialogDescription>
              Would you like to approve or reject this tutor?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)} 
              disabled={approvalMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmApproval(false)} 
              disabled={approvalMutation.isPending}
            >
              {approvalMutation.isPending ? <LoadingSpinner className="mr-2" size={16} /> : <XCircle className="mr-2 h-4 w-4" />}
              Reject
            </Button>
            <Button 
              onClick={() => confirmApproval(true)} 
              disabled={approvalMutation.isPending}
            >
              {approvalMutation.isPending ? <LoadingSpinner className="mr-2" size={16} /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}