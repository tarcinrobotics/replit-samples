import React, { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import CompassLogo from '@/components/ui/compass-logo';
import {
  Home,
  Users,
  Calendar,
  HelpCircle,
  Settings
} from 'lucide-react';
import { NavigationLink } from '@/components/ui/navigation-link';

interface MobileHeaderProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center px-4 py-3 justify-between">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="text-gray-500 focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col h-full">
              <div className="flex items-center px-6 py-4 h-16 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 relative">
                    <div className="absolute inset-0 rounded-full bg-primary-600 opacity-10"></div>
                    <CompassLogo />
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900">TutorConnect</h1>
                </div>
              </div>
              
              <nav className="flex-1 px-2 pt-5 pb-4">
                <div className="space-y-1">
                  <NavigationLink href="/" icon={Home}>
                    Dashboard
                  </NavigationLink>
                  
                  <NavigationLink href="/find-tutors" icon={Users}>
                    Find Tutors
                  </NavigationLink>
                  
                  <NavigationLink href="/my-sessions" icon={Calendar}>
                    My Sessions
                  </NavigationLink>
                  
                  <NavigationLink href="/help-center" icon={HelpCircle}>
                    Help Center
                  </NavigationLink>
                  
                  <NavigationLink href="/settings" icon={Settings}>
                    Settings
                  </NavigationLink>
                </div>
              </nav>
              
              <div className="flex items-center px-4 py-3 border-t border-gray-200">
                <div className="flex-shrink-0">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt="Profile picture" 
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-800 font-medium text-sm">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs font-medium text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center">
          <div className="w-8 h-8 mr-2 relative">
            <div className="absolute inset-0 rounded-full bg-primary-600 opacity-10"></div>
            <CompassLogo />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">TutorConnect</h1>
        </div>
        
        <button className="text-gray-500 focus:outline-none">
          <Bell className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default MobileHeader;
