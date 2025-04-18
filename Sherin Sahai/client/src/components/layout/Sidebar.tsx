import React from 'react';
import {
  Home,
  Users,
  Calendar,
  HelpCircle,
  Settings
} from 'lucide-react';
import { NavigationLink } from '@/components/ui/navigation-link';
import CompassLogo from '@/components/ui/compass-logo';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  return (
    <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-10 bg-white border-r border-gray-200 w-64">
      {/* Logo and title */}
      <div className="flex items-center px-6 py-4 h-16 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-3 relative">
            <div className="absolute inset-0 rounded-full bg-primary-600 opacity-10"></div>
            <CompassLogo />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">TutorConnect</h1>
        </div>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto pt-5 pb-4">
        <div className="px-2 space-y-1">
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
      
      {/* User profile */}
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
  );
};

export default Sidebar;
