import React from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './sidebar';
import Icon from '@/components/ui/icon';
import { useSidebar } from '@/hooks/use-sidebar';

interface MobileSidebarProps {
  className?: string;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ className }) => {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 bg-gray-800 bg-opacity-50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
      ></div>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">EdConnect</h1>
            </div>
            <button className="p-2 rounded-md hover:bg-gray-100" onClick={closeSidebar}>
              <Icon name="x" className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Mobile Sidebar Content (reuse the standard sidebar) */}
          <Sidebar className="border-r-0" />
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
