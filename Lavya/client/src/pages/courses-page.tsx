import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course, InsertBooking } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Filter,
  Search,
  ArrowUpDown,
  StarIcon,
  DollarSign,
  BookOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "price-low" | "price-high" | "rating" | "newest";

export default function CoursesPage() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Parse the query parameters from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Get subject
    const subjectParam = params.get("subject");
    if (subjectParam) {
      setSelectedSubject(subjectParam);
    }
    
    // Get search
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    // Get category
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    // Get price range
    const minPrice = params.get("minPrice");
    const maxPrice = params.get("maxPrice");
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)]);
    }
    
    // Get rating
    const rating = params.get("rating");
    if (rating) {
      setMinRating(Number(rating));
    }
    
    // Get sort option
    const sort = params.get("sort") as SortOption;
    if (sort) {
      setSortBy(sort);
    }
  }, []);

  // Fetch subjects
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<string[]>({
    queryKey: ["/api/subjects"],
  });

  // Fetch all courses
  const { data: allCourses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Get unique categories from courses
  const categories = allCourses 
    ? Array.from(new Set(allCourses.map(course => course.category)))
    : [];

  // Apply all filters to courses
  const filteredCourses = allCourses
    ? allCourses
        // Filter by subject
        .filter(course => selectedSubject === "All" || course.subject === selectedSubject)
        // Filter by category
        .filter(course => selectedCategory === "All" || course.category === selectedCategory)
        // Filter by price range
        .filter(course => course.price >= priceRange[0] && course.price <= priceRange[1])
        // Filter by rating
        .filter(course => (course.averageRating || 0) >= minRating)
        // Filter by search query (title or description)
        .filter(course => 
          searchQuery === "" || 
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        // Sort courses based on selected sort option
        .sort((a, b) => {
          switch (sortBy) {
            case "price-low":
              return a.price - b.price;
            case "price-high":
              return b.price - a.price;
            case "rating":
              return (b.averageRating || 0) - (a.averageRating || 0);
            case "newest":
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            default:
              return 0;
          }
        })
    : [];

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course booked successfully!",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/student/dashboard"] });
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

  const navigateToDashboard = () => {
    if (user?.role === "Student") {
      navigate("/student-dashboard");
    } else if (user?.role === "Tutor") {
      navigate("/tutor-dashboard");
    }
  };

  const handleEnroll = (courseId: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (user.role !== "Student") {
      toast({
        title: "Access Denied",
        description: "Only students can enroll in courses",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({
      courseId,
      studentId: user.id,
      status: "Pending",
    });
  };

  const updateFilters = (filters: {
    subject?: string;
    category?: string;
    priceRange?: [number, number];
    minRating?: number;
    searchQuery?: string;
    sortBy?: SortOption;
  }) => {
    // Update state with new filter values
    if (filters.subject !== undefined) setSelectedSubject(filters.subject);
    if (filters.category !== undefined) setSelectedCategory(filters.category);
    if (filters.priceRange !== undefined) setPriceRange(filters.priceRange);
    if (filters.minRating !== undefined) setMinRating(filters.minRating);
    if (filters.searchQuery !== undefined) setSearchQuery(filters.searchQuery);
    if (filters.sortBy !== undefined) setSortBy(filters.sortBy);
    
    // Update URL without page refresh
    const params = new URLSearchParams(window.location.search);
    
    // Handle subject
    if (filters.subject !== undefined) {
      if (filters.subject === "All") {
        params.delete("subject");
      } else {
        params.set("subject", filters.subject);
      }
    }
    
    // Handle category
    if (filters.category !== undefined) {
      if (filters.category === "All") {
        params.delete("category");
      } else {
        params.set("category", filters.category);
      }
    }
    
    // Handle price range
    if (filters.priceRange !== undefined) {
      params.set("minPrice", filters.priceRange[0].toString());
      params.set("maxPrice", filters.priceRange[1].toString());
    }
    
    // Handle rating
    if (filters.minRating !== undefined) {
      if (filters.minRating === 0) {
        params.delete("rating");
      } else {
        params.set("rating", filters.minRating.toString());
      }
    }
    
    // Handle search query
    if (filters.searchQuery !== undefined) {
      if (filters.searchQuery === "") {
        params.delete("search");
      } else {
        params.set("search", filters.searchQuery);
      }
    }
    
    // Handle sort option
    if (filters.sortBy !== undefined) {
      params.set("sort", filters.sortBy);
    }
    
    const newUrl = 
      window.location.pathname + 
      (params.toString() ? `?${params.toString()}` : "");
    
    window.history.pushState({}, "", newUrl);
  };
  
  // Helper functions for specific filter updates
  const handleFilterBySubject = (subject: string) => {
    updateFilters({ subject });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    updateFilters({ searchQuery: query });
  };
  
  const handleCategoryChange = (category: string) => {
    updateFilters({ category });
  };
  
  const handlePriceRangeChange = (value: number[]) => {
    updateFilters({ priceRange: [value[0], value[1]] });
  };
  
  const handleRatingChange = (value: number) => {
    updateFilters({ minRating: value });
  };
  
  const handleSortChange = (value: SortOption) => {
    updateFilters({ sortBy: value });
  };
  
  const resetFilters = () => {
    updateFilters({
      subject: "All",
      category: "All",
      priceRange: [0, 1000],
      minRating: 0,
      searchQuery: "",
      sortBy: "newest"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
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
                  className="border-primary text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Courses
                </Link>
                {user && (
                  <Link
                    href={user.role === "Student" ? "/student-dashboard" : "/tutor-dashboard"}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
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
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:inline-block">{user.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={navigateToDashboard}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
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
              ) : (
                <div className="flex space-x-4">
                  <Link href="/auth">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link href="/auth">
                    <Button>Sign up</Button>
                  </Link>
                </div>
              )}
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
              className="bg-primary-50 border-primary text-primary block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Courses
            </Link>
            {user && (
              <Link
                href={user.role === "Student" ? "/student-dashboard" : "/tutor-dashboard"}
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Dashboard
              </Link>
            )}
          </div>
          
          {/* Mobile auth or user menu */}
          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={navigateToDashboard}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
                >
                  Dashboard
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
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 px-4">
                <Link href="/auth" className="block w-full">
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link href="/auth" className="block w-full">
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Course Listing */}
      <div className="py-12 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Explore Courses</h1>
            <p className="text-lg text-gray-600">Find the perfect course to enhance your knowledge and skills.</p>
          </div>

          {/* Subject filters */}
          <div className="mb-4 overflow-x-auto">
            {isLoadingSubjects ? (
              <div className="flex justify-center">
                <LoadingSpinner size={24} />
              </div>
            ) : (
              <div className="inline-flex space-x-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => handleFilterBySubject("All")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedSubject === "All"
                      ? "bg-primary text-white"
                      : "text-gray-800 bg-white hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                {subjects?.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => handleFilterBySubject(subject)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      selectedSubject === subject
                        ? "bg-primary text-white"
                        : "text-gray-800 bg-white hover:bg-gray-100"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Search and filter controls */}
          <div className="mb-8">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              {/* Search bar */}
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by course title or description"
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              {/* Sort dropdown */}
              <div className="w-full md:w-48">
                <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <span>Sort by</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter button */}
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              {/* Reset filters button */}
              {(selectedSubject !== "All" || 
                selectedCategory !== "All" || 
                priceRange[0] !== 0 ||
                priceRange[1] !== 1000 || 
                minRating !== 0 || 
                searchQuery !== "") && (
                <Button 
                  variant="ghost" 
                  className="gap-1"
                  onClick={resetFilters}
                >
                  <X className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
            
            {/* Advanced filters section */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Category filter */}
                  <div>
                    <Label className="mb-2 block">Category</Label>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>{selectedCategory === "All" ? "All Categories" : selectedCategory}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Price range filter */}
                  <div>
                    <Label className="mb-2 block">Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                    <Slider
                      defaultValue={[0, 1000]}
                      value={priceRange}
                      min={0}
                      max={1000}
                      step={10}
                      onValueChange={handlePriceRangeChange}
                      className="my-4"
                    />
                  </div>
                  
                  {/* Rating filter */}
                  <div>
                    <Label className="mb-2 block">Minimum Rating: {minRating.toFixed(1)}</Label>
                    <Slider
                      defaultValue={[0]}
                      value={[minRating]}
                      min={0}
                      max={5}
                      step={0.5}
                      onValueChange={(values) => handleRatingChange(values[0])}
                      className="my-4"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'result' : 'results'}
            </p>
          </div>

          {/* Course list */}
          {isLoadingCourses ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size={40} />
            </div>
          ) : filteredCourses && filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                          {course.subject}
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {course.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <User className="text-gray-400 h-4 w-4 mr-1" />
                        <span className="text-sm text-gray-500">Expert Tutor</span>
                      </div>
                      {course.averageRating !== null && (
                        <div className="flex items-center">
                          <span className="text-xs text-yellow-500 mr-1">★</span>
                          <span className="text-sm text-gray-700">{course.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">${course.price.toFixed(2)}</span>
                      <Button
                        onClick={() => handleEnroll(course.id)}
                        disabled={bookingMutation.isPending}
                      >
                        {bookingMutation.isPending && bookingMutation.variables?.courseId === course.id ? (
                          <>
                            <LoadingSpinner className="mr-2" size={16} />
                            Processing...
                          </>
                        ) : (
                          "Enroll Now"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {selectedSubject !== "All" && selectedCategory === "All" && priceRange[0] === 0 && priceRange[1] === 1000 && minRating === 0 && searchQuery === ""
                  ? `No courses found for ${selectedSubject}.`
                  : "No courses match your current filters."}
              </p>
              
              <div className="mt-6 flex flex-col gap-3 items-center">
                {searchQuery !== "" && (
                  <p className="text-sm text-gray-500">Try adjusting your search terms.</p>
                )}
                
                {(selectedSubject !== "All" || selectedCategory !== "All" || priceRange[0] !== 0 || priceRange[1] !== 1000 || minRating !== 0) && (
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={resetFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reset All Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                About
              </a>
            </div>
            <div className="px-5 py-2">
              <Link href="/courses" className="text-base text-gray-500 hover:text-gray-900">
                Courses
              </Link>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Tutors
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Blog
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Contact
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Terms
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Privacy
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-500">&copy; 2023 EduConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
