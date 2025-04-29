import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { BookingWithCourseAndTutor, Notification } from "@shared/schema";
import { LoadingSpinner, FullPageLoader } from "@/components/LoadingSpinner";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  BookOpen,
  CalendarDays,
  Clock,
  Search,
  Bell,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Type for the dashboard data response
type StudentDashboardData = {
  bookings: BookingWithCourseAndTutor[];
  notifications: Notification[];
};

export default function StudentDashboard() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("courses");

  // Fetch student dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<StudentDashboardData>({
    queryKey: ["/api/student/dashboard"],
  });

  const bookings = dashboardData?.bookings || [];
  const notifications = dashboardData?.notifications || [];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.course.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.tutor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

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

  // Count unread notifications
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  
  // Count pending and confirmed bookings
  const pendingBookingsCount = bookings.filter(b => b.status === "Pending").length;
  const confirmedBookingsCount = bookings.filter(b => b.status === "Confirmed").length;

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
                  href="/student-dashboard"
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
            <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </Button>
              </div>
              
              {/* User dropdown */}
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
              href="/student-dashboard"
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
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Student Dashboard</h1>
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
                    <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookings.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {bookings.length === 0
                        ? "No courses enrolled"
                        : `Across ${new Set(bookings.map(b => b.course.subject)).size} subjects`}
                    </p>
                  </CardContent>
                </Card>

                {/* Pending Bookings Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingBookingsCount}</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting confirmation from tutors
                    </p>
                  </CardContent>
                </Card>

                {/* Confirmed Bookings Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{confirmedBookingsCount}</div>
                    <p className="text-xs text-muted-foreground">
                      Ready for learning
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Dashboard tabs */}
            <div className="px-4 py-6 sm:px-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 w-full md:w-auto md:inline-flex">
                  <TabsTrigger value="courses" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>My Courses</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <Badge className="ml-1 bg-red-100 text-red-800 hover:bg-red-100">
                        {unreadNotificationsCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Courses Tab */}
                <TabsContent value="courses">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle>My Enrolled Courses</CardTitle>
                          <CardDescription>
                            View all your course enrollments and their status
                          </CardDescription>
                        </div>
                        <div className="w-full sm:w-auto">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search courses..."
                              className="pl-8 w-full sm:w-64"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {bookings.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500 text-lg mb-6">You haven't enrolled in any courses yet.</p>
                          <Link href="/courses">
                            <Button>Browse Courses</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Tutor</TableHead>
                                <TableHead>Booking Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Session Date</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredBookings.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                                    No results match your search.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                filteredBookings.map((booking) => (
                                  <TableRow key={booking.id}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">{booking.course.title}</p>
                                        <p className="text-sm text-gray-500">{booking.course.subject}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="font-medium">{booking.tutor?.name || "Expert Tutor"}</div>
                                    </TableCell>
                                    <TableCell>
                                      {new Date(booking.bookingTime).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                      <Badge 
                                        className={booking.status === "Confirmed" 
                                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}
                                      >
                                        {booking.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {booking.sessionDate 
                                        ? new Date(booking.sessionDate).toLocaleDateString() 
                                        : booking.status === "Pending" 
                                          ? "Awaiting confirmation" 
                                          : "Not scheduled"}
                                    </TableCell>
                                    <TableCell>
                                      {booking.status === "Confirmed" && (
                                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                                          <Star className="h-3 w-3" />
                                          <span>Review</span>
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle>My Notifications</CardTitle>
                          <CardDescription>
                            Stay updated with your course and booking notifications
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          Mark all as read
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {notifications.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500 text-lg">You don't have any notifications yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {notifications.map((notification) => (
                            <div key={notification.id} className={`p-4 rounded-lg border ${notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-100'}`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{notification.message}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
