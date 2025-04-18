import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, Shield, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

import StatCard from '@/components/dashboard/StatCard';
import SessionsList from '@/components/dashboard/SessionsList';
import TutorsList from '@/components/dashboard/TutorsList';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';

const Dashboard = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch user stats
  const { data: stats, isLoading: loadingStats, error: statsError } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  // Fetch upcoming sessions
  const { data: upcomingSessions, isLoading: loadingSessions, error: sessionsError } = useQuery({
    queryKey: ['/api/sessions/upcoming'],
  });

  // Fetch popular tutors
  const { data: popularTutors, isLoading: loadingTutors, error: tutorsError } = useQuery({
    queryKey: ['/api/tutors/popular'],
  });

  // Fetch learning activities
  const { data: activities, isLoading: loadingActivities, error: activitiesError } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Handle scheduling a new session
  const handleScheduleSession = () => {
    navigate('/find-tutors');
  };

  // Handle joining a session
  const handleJoinSession = (sessionId: number) => {
    toast({
      title: "Joining session",
      description: "Connecting to the virtual classroom...",
    });
    // In a real implementation, this would navigate to a virtual classroom
  };

  // Handle rescheduling a session
  const handleRescheduleSession = (sessionId: number) => {
    toast({
      title: "Reschedule session",
      description: "Opening reschedule options...",
    });
    // In a real implementation, this would open a reschedule modal
  };

  // Handle booking a session with a tutor
  const handleBookSession = (tutorId: number) => {
    toast({
      title: "Book session",
      description: "Opening booking form...",
    });
    // In a real implementation, this would open a booking modal or navigate
  };

  // Handle viewing a tutor's profile
  const handleViewTutorProfile = (tutorId: number) => {
    navigate(`/tutors/${tutorId}`);
  };

  // Create activity timeline items with React nodes
  const formattedActivities = activities?.map((activity: any) => ({
    id: activity.id,
    timestamp: activity.timestamp,
    description: (
      <>
        {activity.activityType === 'session_completed' && (
          <>
            <span className="font-medium text-gray-900">Session completed</span>
            <span className="text-gray-500"> with </span>
            <span className="font-medium text-gray-900">{activity.tutorName}</span>
            {activity.topic && (
              <span className="text-gray-500"> — {activity.topic}</span>
            )}
          </>
        )}
        {activity.activityType === 'homework_completed' && (
          <>
            <span className="font-medium text-gray-900">Completed homework</span>
            <span className="text-gray-500"> for </span>
            <span className="font-medium text-gray-900">{activity.subjectName}</span>
          </>
        )}
        {activity.activityType === 'material_reviewed' && (
          <>
            <span className="font-medium text-gray-900">Reviewed material</span>
            <span className="text-gray-500"> for upcoming exam in </span>
            <span className="font-medium text-gray-900">{activity.subjectName}</span>
          </>
        )}
      </>
    )
  }));

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-3">
            <Button onClick={handleScheduleSession}>
              <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
              Schedule Session
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 bg-gray-50">
        {/* Dashboard Insights */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Learning Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {loadingStats ? (
              <>
                <div className="bg-white h-28 animate-pulse rounded-lg"></div>
                <div className="bg-white h-28 animate-pulse rounded-lg"></div>
                <div className="bg-white h-28 animate-pulse rounded-lg"></div>
              </>
            ) : statsError ? (
              <p className="text-red-500">Error loading statistics</p>
            ) : (
              <>
                <StatCard
                  title="Total Hours"
                  value={stats?.totalHours || "0"}
                  percentChange={12}
                  icon={Clock}
                />
                <StatCard
                  title="Completed Sessions"
                  value={stats?.completedSessions || 0}
                  percentChange={8}
                  icon={Calendar}
                />
                <StatCard
                  title="Upcoming Sessions"
                  value={stats?.upcomingSessions || 0}
                  icon={Shield}
                  extraInfo={
                    stats?.upcomingSessions > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary-100 text-primary-800">
                        Next: Today
                      </span>
                    ) : null
                  }
                />
              </>
            )}
          </div>
        </div>
        
        {/* Upcoming Sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Sessions</h2>
            <a href="/my-sessions" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </a>
          </div>
          
          {loadingSessions ? (
            <div className="bg-white h-32 animate-pulse rounded-lg"></div>
          ) : sessionsError ? (
            <p className="text-red-500">Error loading sessions</p>
          ) : (
            <SessionsList
              sessions={upcomingSessions || []}
              onJoinSession={handleJoinSession}
              onReschedule={handleRescheduleSession}
              onFindTutors={() => navigate('/find-tutors')}
            />
          )}
        </div>
        
        {/* Popular Tutors */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Popular Tutors</h2>
            <a href="/find-tutors" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </a>
          </div>
          
          {loadingTutors ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white h-64 animate-pulse rounded-lg"></div>
              <div className="bg-white h-64 animate-pulse rounded-lg"></div>
              <div className="bg-white h-64 animate-pulse rounded-lg"></div>
            </div>
          ) : tutorsError ? (
            <p className="text-red-500">Error loading tutors</p>
          ) : (
            <TutorsList
              tutors={popularTutors || []}
              onBookSession={handleBookSession}
              onViewProfile={handleViewTutorProfile}
            />
          )}
        </div>
        
        {/* Recent Learning Activity */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Learning Activity</h2>
          </div>
          
          {loadingActivities ? (
            <div className="bg-white h-48 animate-pulse rounded-lg"></div>
          ) : activitiesError ? (
            <p className="text-red-500">Error loading activities</p>
          ) : (
            <ActivityTimeline activities={formattedActivities || []} />
          )}
        </div>
      </main>
    </>
  );
};

export default Dashboard;
