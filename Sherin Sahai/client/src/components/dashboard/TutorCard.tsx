import React from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BookSessionButton from '@/components/booking/BookSessionButton';

interface TutorCardProps {
  name: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  subjects: string[];
  bio: string;
  hourlyRate: number;
  onBookSession: () => void;
  onViewProfile: () => void;
  tutorId?: number;
}

const TutorCard: React.FC<TutorCardProps> = ({
  name,
  avatarUrl,
  rating,
  reviewCount,
  subjects,
  bio,
  hourlyRate,
  onBookSession,
  onViewProfile,
  tutorId
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full overflow-hidden">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={`${name}'s portrait`} 
                className="h-16 w-16 rounded-full object-cover" 
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-800 font-medium text-lg">
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="ml-2 text-sm text-gray-600">{rating.toFixed(1)} ({reviewCount} reviews)</p>
            </div>
            <div className="mt-1">
              {subjects.slice(0, 2).map(subject => (
                <Badge 
                  key={subject} 
                  variant="secondary" 
                  className="mr-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
                >
                  {subject}
                </Badge>
              ))}
              {subjects.length > 2 && (
                <span className="text-xs text-gray-500">+{subjects.length - 2} more</span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {bio}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">${hourlyRate}/hour</div>
          <div className="flex space-x-2">
            <BookSessionButton
              size="sm"
              tutorId={tutorId || 0}
              tutorName={name}
              subjects={subjects}
              onClick={onBookSession}
            />
            <Link href={`/tutors/${tutorId || 0}`}>
              <Button size="sm" variant="outline" onClick={() => onViewProfile()}>
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
