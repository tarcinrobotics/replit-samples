import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useSidebar } from '@/hooks/use-sidebar';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { openSidebar } = useSidebar();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: Hamburger Menu (Mobile) and Page Title */}
        <div className="flex items-center">
          <button 
            className="md:hidden mr-2 p-2 rounded-md hover:bg-gray-100"
            onClick={openSidebar}
          >
            <Icon name="menu" className="h-6 w-6 text-gray-500" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        {/* Right: Search, Notifications & Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden sm:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="h-5 w-5 text-gray-400" />
            </div>
            <Input 
              type="text" 
              placeholder="Search..." 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" 
            />
          </div>
          
          {/* Notifications */}
          <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative">
            <Icon name="bell" className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          {/* Help */}
          <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
            <Icon name="help-circle" className="h-6 w-6" />
          </button>
          
          {/* Create New */}
          <Button 
            onClick={() => window.location.href = '/instructors/new'} 
            className="hidden sm:flex items-center"
          >
            <Icon name="plus" className="h-4 w-4 mr-1" />
            Create
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
