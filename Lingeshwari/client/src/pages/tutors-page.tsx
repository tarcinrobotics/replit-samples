import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TutorCard } from "@/components/tutors/tutor-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { User, TutorProfile, Course } from "@shared/schema";
import { Search, Filter, GraduationCap } from "lucide-react";

export default function TutorsPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  
  // Fetch tutors
  const { data: tutors, isLoading } = useQuery<(User & { profile?: TutorProfile })[]>({
    queryKey: ['/api/tutors'],
    enabled: !!user,
  });
  
  // Fetch all courses to count courses per tutor
  const { data: courses } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    enabled: !!user,
  });
  
  // Filter tutors based on search and filters
  const filteredTutors = (tutors || []).filter(tutor => {
    // Search filter (name, bio)
    if (searchQuery && 
        !`${tutor.firstName} ${tutor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(tutor.bio && tutor.bio.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    // Subject filter
    if (subjectFilter !== "all") {
      if (!tutor.profile?.subjects || !tutor.profile.subjects.includes(subjectFilter)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Get unique subjects from all tutors for filter options
  const subjects = Array.from(
    new Set(
      (tutors || [])
        .filter(tutor => tutor.profile?.subjects && tutor.profile.subjects.length > 0)
        .flatMap(tutor => tutor.profile?.subjects || [])
    )
  );
  
  // Count courses for each tutor
  const getTutorCourseCount = (tutorId: number) => {
    return (courses || []).filter(course => course.tutorId === tutorId).length;
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tutors</h1>
          <p className="text-muted-foreground">
            Browse and connect with expert tutors across various subjects
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tutors by name or description..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!isLoading && filteredTutors.length > 0 ? (
            filteredTutors.map(tutor => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                courseCount={getTutorCourseCount(tutor.id)}
                onViewProfile={() => setLocation(`/tutors/${tutor.id}`)}
              />
            ))
          ) : isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-lg bg-gray-100 animate-pulse" />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tutors found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSubjectFilter("all");
              }}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
