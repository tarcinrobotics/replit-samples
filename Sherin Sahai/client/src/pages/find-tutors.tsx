import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import TutorsList from '@/components/dashboard/TutorsList';

const FindTutors = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch all available tutors
  const { data: tutors, isLoading, error } = useQuery({
    queryKey: ['/api/tutors'],
  });

  // Handle booking a session with a tutor
  const handleBookSession = (tutorId: number) => {
    toast({
      title: "Book session",
      description: "Opening booking form...",
    });
    // In a real implementation, this would open a booking modal
  };

  // Handle viewing a tutor's profile
  const handleViewTutorProfile = (tutorId: number) => {
    navigate(`/tutors/${tutorId}`);
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Find Tutors</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Tutors</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white h-64 animate-pulse rounded-lg"></div>
              <div className="bg-white h-64 animate-pulse rounded-lg"></div>
              <div className="bg-white h-64 animate-pulse rounded-lg"></div>
              <div className="bg-white h-64 animate-pulse rounded-lg"></div>
              <div className="bg-white h-64 animate-pulse rounded-lg"></div>
              <div className="bg-white h-64 animate-pulse rounded-lg"></div>
            </div>
          ) : error ? (
            <p className="text-red-500">Error loading tutors</p>
          ) : (
            <TutorsList
              tutors={tutors || []}
              onBookSession={handleBookSession}
              onViewProfile={handleViewTutorProfile}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default FindTutors;
