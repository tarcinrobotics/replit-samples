
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Clock3, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UpcomingSessionProps {
  tutorName: string;
  tutorAvatarUrl?: string;
  subject: string;
  topic: string;
  startTime: Date;
  endTime: Date;
  onJoinSession: () => void;
  onReschedule: () => void;
  tutorRating?: number;
  tutorBio?: string;
}

const UpcomingSession: React.FC<UpcomingSessionProps> = ({
  tutorName,
  tutorAvatarUrl,
  subject,
  topic,
  startTime,
  endTime,
  onJoinSession,
  onReschedule,
  tutorRating,
  tutorBio
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const timeDisplay = formatDistanceToNow(startTime, { addSuffix: true });
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const formattedDuration = duration.toFixed(1);
  const courseTitle = `${subject}: ${topic}`;

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-full overflow-hidden">
            {tutorAvatarUrl ? (
              <img 
                src={tutorAvatarUrl} 
                alt={`${tutorName}'s portrait`} 
                className="h-12 w-12 rounded-full object-cover" 
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-800 font-medium text-lg">
                  {tutorName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <div>
              <h3 className="text-lg font-bold text-primary-700">{courseTitle}</h3>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600">with</span>
                <span className="ml-1 text-base text-gray-900">{tutorName}</span>
                {tutorRating && (
                  <div className="flex items-center ml-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">{tutorRating}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center space-x-4">
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1 text-primary-500" />
                  {timeDisplay}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <Clock3 className="h-4 w-4 mr-1 text-primary-500" />
                  {formattedDuration} hours
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onJoinSession}>Join Session</Button>
          <Button variant="outline" onClick={onReschedule}>Reschedule</Button>
        </div>
      </div>
      
      <button 
        className="mt-4 text-sm text-gray-500 flex items-center"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4 mr-1" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-1" />
            Show course details
          </>
        )}
      </button>
      
      {expanded && (
        <div className="mt-4 pl-16 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Course Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-primary-700">{subject}</h5>
              <p className="text-sm text-gray-700 mt-1">{topic}</p>
              <p className="text-sm text-gray-600 mt-2">
                This session provides comprehensive instruction and practical examples in {topic.toLowerCase()}, 
                focusing on advanced concepts and real-world applications.
              </p>
            </div>
          </div>
          
          {tutorBio && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">About the Tutor</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-gray-900">{tutorName}</span>
                  {tutorRating && (
                    <div className="flex items-center ml-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm text-gray-600">{tutorRating}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700">{tutorBio}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingSession;
