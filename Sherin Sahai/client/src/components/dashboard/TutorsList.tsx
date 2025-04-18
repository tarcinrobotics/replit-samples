import React from 'react';
import TutorCard from './TutorCard';

interface Tutor {
  id: number;
  name: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  subjects: string[];
  bio: string;
  hourlyRate: number;
}

interface TutorsListProps {
  tutors: Tutor[];
  onBookSession: (tutorId: number) => void;
  onViewProfile: (tutorId: number) => void;
}

const TutorsList: React.FC<TutorsListProps> = ({
  tutors,
  onBookSession,
  onViewProfile
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutors.map(tutor => (
        <TutorCard
          key={tutor.id}
          name={tutor.name}
          avatarUrl={tutor.avatarUrl}
          rating={tutor.rating}
          reviewCount={tutor.reviewCount}
          subjects={tutor.subjects}
          bio={tutor.bio}
          hourlyRate={tutor.hourlyRate}
          onBookSession={() => onBookSession(tutor.id)}
          onViewProfile={() => onViewProfile(tutor.id)}
          tutorId={tutor.id}
        />
      ))}
    </div>
  );
};

export default TutorsList;
