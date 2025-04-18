import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SessionsList from '@/components/dashboard/SessionsList';

const MySessions = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch upcoming sessions
  const { data: upcomingSessions, isLoading: loadingUpcoming, error: upcomingError } = useQuery({
    queryKey: ['/api/sessions/upcoming'],
  });

  // Fetch past sessions
  const { data: pastSessions, isLoading: loadingPast, error: pastError } = useQuery({
    queryKey: ['/api/sessions/past'],
  });

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

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mb-6">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {loadingUpcoming ? (
                <div className="bg-white h-32 animate-pulse rounded-lg"></div>
              ) : upcomingError ? (
                <p className="text-red-500">Error loading upcoming sessions</p>
              ) : (
                <SessionsList
                  sessions={upcomingSessions || []}
                  onJoinSession={handleJoinSession}
                  onReschedule={handleRescheduleSession}
                  onFindTutors={() => navigate('/find-tutors')}
                />
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {loadingPast ? (
                <div className="bg-white h-32 animate-pulse rounded-lg"></div>
              ) : pastError ? (
                <p className="text-red-500">Error loading past sessions</p>
              ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  {(pastSessions || []).map((session: any) => (
                    <div key={session.id} className="p-6 border-b border-gray-200">
                      <div className="flex items-start">
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                          {session.tutorAvatarUrl ? (
                            <img 
                              src={session.tutorAvatarUrl} 
                              alt={`${session.tutorName}'s portrait`} 
                              className="h-12 w-12 rounded-full object-cover" 
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-800 font-medium text-lg">
                                {session.tutorName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-gray-900">{session.tutorName}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(session.startTime).toLocaleDateString()} • 
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {session.subject}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              {session.topic}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(pastSessions || []).length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500">No past sessions found.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default MySessions;
