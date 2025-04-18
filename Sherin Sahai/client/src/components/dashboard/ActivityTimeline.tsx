import React from 'react';
import { format } from 'date-fns';

interface Activity {
  id: number;
  description: React.ReactNode;
  timestamp: Date | string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  // Function to calculate relative time
  const getRelativeTime = (dateInput: Date | string): string => {
    // Ensure we have a Date object
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6">
        <ul className="space-y-6">
          {activities.map((activity, index) => (
            <li key={activity.id} className="relative flex gap-x-4">
              {index < activities.length - 1 && (
                <div className="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
                  <div className="w-px bg-gray-200"></div>
                </div>
              )}
              <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
              </div>
              <div className="flex-auto py-0.5 text-sm leading-5">
                {activity.description}
              </div>
              <time className="flex-none py-0.5 text-sm leading-5 text-gray-500">
                {getRelativeTime(activity.timestamp)}
              </time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityTimeline;
