
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import UpcomingSession from './UpcomingSession';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Session {
  id: number;
  tutorName: string;
  tutorAvatarUrl?: string;
  subject: string;
  topic: string;
  startTime: Date;
  endTime: Date;
  tutorId: number;
  tutorRating?: number;
  tutorBio?: string;
}

interface SessionsListProps {
  sessions: Session[];
  onJoinSession: (sessionId: number) => void;
  onReschedule: (sessionId: number) => void;
  onFindTutors: () => void;
}

const SessionsList: React.FC<SessionsListProps> = ({ 
  sessions,
  onJoinSession,
  onReschedule,
  onFindTutors
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  
  // Get unique subjects for filter
  const subjects = ['all', ...new Set(sessions.map(session => session.subject))];
  
  // Filter sessions by subject
  const filteredSessions = selectedSubject === 'all' 
    ? sessions 
    : sessions.filter(session => session.subject === selectedSubject);

  // Fetch tutor details for each session
  const { data: tutorsData } = useQuery({
    queryKey: ['/api/tutors'],
  });

  if (sessions.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 text-center">
          <div className="py-8">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming sessions</h3>
            <p className="mt-1 text-sm text-gray-500">Schedule a session with a tutor to get started.</p>
            <div className="mt-6">
              <Button onClick={onFindTutors}>
                Find Tutors
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-4">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {filteredSessions.map(session => {
          const tutorDetails = tutorsData?.find((t: any) => t.id === session.tutorId);
          return (
            <UpcomingSession
              key={session.id}
              tutorName={session.tutorName}
              tutorAvatarUrl={session.tutorAvatarUrl}
              subject={session.subject}
              topic={session.topic}
              startTime={new Date(session.startTime)}
              endTime={new Date(session.endTime)}
              onJoinSession={() => onJoinSession(session.id)}
              onReschedule={() => onReschedule(session.id)}
              tutorRating={tutorDetails?.rating}
              tutorBio={tutorDetails?.bio}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SessionsList;
