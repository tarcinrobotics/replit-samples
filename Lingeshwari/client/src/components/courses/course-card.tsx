import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course } from "@shared/schema";
import { BookOpen, Clock, Users, DollarSign, ExternalLink } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
  onViewDetails: () => void;
  showActions?: boolean;
  enrolled?: boolean;
}

export function CourseCard({
  course,
  onEnroll,
  onViewDetails,
  showActions = true,
  enrolled = false,
}: CourseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold line-clamp-2">
            {course.title}
          </CardTitle>
          <Badge variant={course.isActive ? "default" : "outline"}>
            {course.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {course.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{course.subject}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{formatDuration(course.duration)}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">Max {course.maxStudents} students</span>
          </div>
          <div className="flex items-center text-sm font-medium">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formatPrice(course.price)}</span>
          </div>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="pt-3 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewDetails}
            className="flex-1 mr-2"
          >
            Details
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Button>
          {!enrolled && onEnroll && (
            <Button 
              size="sm" 
              onClick={onEnroll}
              className="flex-1"
            >
              Enroll
            </Button>
          )}
          {enrolled && (
            <Badge variant="secondary" className="ml-2">
              Enrolled
            </Badge>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
