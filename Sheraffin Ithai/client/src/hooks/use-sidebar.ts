import { useState, useCallback, createContext, useContext } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {}
});

export const useSidebarState = (): SidebarContextType => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  return {
    isOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar
  };
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  
  return context;
};
