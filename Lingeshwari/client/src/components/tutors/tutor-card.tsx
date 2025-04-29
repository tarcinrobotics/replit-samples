import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, BookOpen, Users } from "lucide-react";
import { User, TutorProfile } from "@shared/schema";

interface TutorCardProps {
  tutor: User & { profile?: TutorProfile };
  courseCount?: number;
  onViewProfile: () => void;
}

export function TutorCard({ tutor, courseCount = 0, onViewProfile }: TutorCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return "T";
    return name.charAt(0).toUpperCase();
  };
  
  const getFullName = () => {
    return `${tutor.firstName} ${tutor.lastName}`;
  };
  
  const renderSubjects = () => {
    if (!tutor.profile?.subjects || tutor.profile.subjects.length === 0) {
      return <span className="text-muted-foreground text-sm">No subjects specified</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tutor.profile.subjects.map((subject, index) => (
          <Badge key={index} variant="secondary">
            {subject}
          </Badge>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-0">
        <div className="flex items-center">
          <Avatar className="h-12 w-12">
            <AvatarImage src={tutor.profileImage} alt={getFullName()} />
            <AvatarFallback>{getInitials(tutor.firstName)}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="text-lg font-medium">{getFullName()}</h3>
            {tutor.profile?.rating && (
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                <span className="text-sm">{tutor.profile.rating}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="space-y-4">
          {tutor.bio && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {tutor.bio}
            </p>
          )}
          
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Subjects</h4>
            {renderSubjects()}
          </div>
          
          {tutor.profile?.education && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Education</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tutor.profile.education}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm">{courseCount} courses</span>
            </div>
            {tutor.profile?.hourlyRate && tutor.profile.hourlyRate > 0 && (
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  ${(tutor.profile.hourlyRate / 100).toFixed(2)}/hr
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={onViewProfile} className="w-full" variant="outline">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
