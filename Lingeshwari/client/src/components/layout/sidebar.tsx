import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  BookOpen, 
  Calendar, 
  GraduationCap,
  Users, 
  User,
  LayoutDashboard,
  Settings,
  ShieldCheck
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
}

export function Sidebar({ className, isOpen = true }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const isStudent = user?.role === "student";
  const isTutor = user?.role === "tutor";
  const isAdmin = user?.role === "admin";

  return (
    <div className={cn(
      "flex h-screen border-r bg-background pb-12 transition-all duration-200 ease-in-out", 
      isOpen ? "w-64" : "w-0 overflow-hidden",
      className
    )}>
      <div className="space-y-4 py-4 flex flex-col h-full w-full">
        <div className="px-3 py-2 flex items-center">
          <BookOpen className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-lg font-semibold tracking-tight">TutorBridge</h2>
        </div>
        <div className="px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {isStudent ? "Student Portal" : isTutor ? "Tutor Portal" : "Admin Portal"}
          </h2>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            <Button
              variant={isActive("/") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => window.location.href = "/"}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            
            <Button
              variant={isActive("/courses") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => window.location.href = "/courses"}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </Button>
            
            {!isAdmin && (
              <Button
                variant={isActive("/bookings") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => window.location.href = "/bookings"}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Bookings
              </Button>
            )}
            
            {!isTutor && (
              <Button
                variant={isActive("/tutors") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => window.location.href = "/tutors"}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Tutors
              </Button>
            )}
            
            {isAdmin && (
              <Button
                variant={isActive("/admin") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => window.location.href = "/admin"}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            )}
            
            <Button
              variant={isActive("/profile") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => window.location.href = "/profile"}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
