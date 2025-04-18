import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronLeft, Clock, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookSessionButton from '@/components/booking/BookSessionButton';
import { useAuth } from '@/hooks/use-auth';

interface Review {
  id: number;
  studentName: string;
  studentAvatarUrl?: string;
  rating: number;
  comment: string;
  date: Date;
}

const TutorProfile: React.FC = () => {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const tutorId = parseInt(location.split('/').pop() || '0');
  const [activeTab, setActiveTab] = useState('about');

  const { data: tutor, isLoading } = useQuery({
    queryKey: ['/api/tutors', tutorId],
    queryFn: async () => {
      if (!tutorId) return null;
      const response = await fetch('/api/tutors');
      const tutors = await response.json();
      return tutors.find((t: any) => t.id === tutorId) || null;
    },
  });

  // Sample reviews for demo
  const reviews: Review[] = [
    {
      id: 1,
      studentName: 'Alex Johnson',
      studentAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=40&h=40&q=80',
      rating: 5,
      comment: 'Incredible tutor! Explained complex concepts in a way that was easy to understand. I improved so much in just a few sessions.',
      date: new Date(new Date().setDate(new Date().getDate() - 14)),
    },
    {
      id: 2,
      studentName: 'Jamie Smith',
      studentAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=40&h=40&q=80',
      rating: 4,
      comment: 'Very knowledgeable and patient. Helped me prepare for my exam and I did much better than expected.',
      date: new Date(new Date().setDate(new Date().getDate() - 30)),
    },
    {
      id: 3,
      studentName: 'Morgan Williams',
      rating: 5,
      comment: 'Amazing teacher who really cares about student success. Would definitely recommend!',
      date: new Date(new Date().setDate(new Date().getDate() - 45)),
    },
  ];

  if (isLoading || !tutor) {
    return (
      <div className="container mx-auto p-6 max-w-6xl min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col space-y-4 w-full">
          <div className="h-40 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-40 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl min-h-screen">
      <div className="mb-6">
        <Button variant="ghost" className="pl-0" onClick={() => navigate('/find-tutors')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Tutors
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tutor info column */}
        <div className="md:col-span-2">
          <div className="flex items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mr-6">
              {tutor.avatarUrl ? (
                <img
                  src={tutor.avatarUrl}
                  alt={`${tutor.name}'s portrait`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-800 font-bold text-4xl">
                    {tutor.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tutor.name}</h1>
              <div className="flex items-center mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(tutor.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="ml-2 text-sm text-gray-600">
                  {tutor.rating.toFixed(1)} ({tutor.reviewCount} reviews)
                </p>
              </div>
              <div className="mt-2 space-x-2">
                {tutor.subjects.map((subject: string) => (
                  <Badge
                    key={subject}
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-8"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">About {tutor.name}</h2>
                <p className="text-gray-700">{tutor.bio}</p>
                
                <h3 className="text-lg font-semibold mt-6 mb-3">Teaching Subjects</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {tutor.subjects.map((subject: string) => (
                    <li key={subject} className="text-gray-700">{subject}</li>
                  ))}
                </ul>
                
                <h3 className="text-lg font-semibold mt-6 mb-3">Why Choose Me</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Experienced educator with proven results</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Personalized teaching approach tailored to your learning style</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Flexible scheduling with options for recurring sessions</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Comprehensive study materials and homework support</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Student Reviews</h2>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(tutor.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="ml-2 font-medium">
                      {tutor.rating.toFixed(1)} ({tutor.reviewCount} reviews)
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {review.studentAvatarUrl ? (
                            <img
                              src={review.studentAvatarUrl}
                              alt={`${review.studentName}`}
                              className="h-10 w-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                              <span className="text-primary-800 font-medium">
                                {review.studentName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{review.studentName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking column */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Booking Information</h2>
            <div className="flex items-center justify-between mb-6">
              <span className="text-2xl font-bold text-gray-900">${tutor.hourlyRate}</span>
              <span className="text-gray-600">per hour</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">48 hour response time</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{tutor.reviewCount} students</span>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Key info and CTAs */}
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Teaches</h3>
                <p className="text-gray-900">{tutor.subjects.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Availability</h3>
                <p className="text-gray-900">Weekdays, Evenings, Weekends</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Session Format</h3>
                <p className="text-gray-900">Online (video call)</p>
              </div>
            </div>

            {/* Book session button - only show if user is logged in */}
            {user ? (
              <BookSessionButton
                tutorId={tutor.id}
                tutorName={tutor.name}
                subjects={tutor.subjects}
                className="w-full"
              />
            ) : (
              <Link href="/auth">
                <Button className="w-full">Sign in to book a session</Button>
              </Link>
            )}

            {/* Contact link */}
            <Button variant="outline" className="w-full mt-3">
              Contact Tutor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;