import React from 'react';
import { Link, useLocation } from 'wouter';
import Icon from '@/components/ui/icon';
import UserAvatar from '@/components/layout/user-avatar';
import { cn } from '@/lib/utils';

interface SidebarLink {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarLinkGroupProps {
  title: string;
  links: SidebarLink[];
  currentPath: string;
}

const SidebarLinkGroup: React.FC<SidebarLinkGroupProps> = ({ title, links, currentPath }) => {
  return (
    <div className="space-y-1">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h2>
      {links.map((link, index) => (
        <div key={index}>
          <Link href={link.href}>
            <div className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
              currentPath === link.href 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-700 hover:bg-gray-100"
            )}>
              <span className={cn(
                "h-5 w-5 mr-3",
                currentPath === link.href ? "text-primary-500" : "text-gray-500"
              )}>
                {link.icon}
              </span>
              {link.label}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [location] = useLocation();

  const mainLinks = [
    { href: '/', icon: <Icon name="home" />, label: 'Dashboard' },
    { href: '/courses', icon: <Icon name="book" />, label: 'Courses' },
    { href: '/students', icon: <Icon name="user" />, label: 'Students' },
    { href: '/instructors', icon: <Icon name="users" />, label: 'Instructors' },
    { href: '/assignments', icon: <Icon name="file-text" />, label: 'Assignments' },
  ];

  const resourceLinks = [
    { href: '/content-library', icon: <Icon name="package" />, label: 'Content Library' },
    { href: '/video-lessons', icon: <Icon name="video" />, label: 'Video Lessons' },
    { href: '/analytics', icon: <Icon name="bar-chart" />, label: 'Analytics' },
  ];

  return (
    <aside className={cn(
      "hidden md:flex flex-col w-64 border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar",
      className
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">EdConnect</h1>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <SidebarLinkGroup 
          title="Main" 
          links={mainLinks} 
          currentPath={location} 
        />
        
        <div className="mt-8">
          <SidebarLinkGroup 
            title="Resources" 
            links={resourceLinks} 
            currentPath={location} 
          />
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <UserAvatar name="John Smith" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Smith</p>
            <p className="text-xs text-gray-500 truncate">Instructor</p>
          </div>
          <button className="rounded-full p-1 hover:bg-gray-100">
            <Icon name="settings" className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
