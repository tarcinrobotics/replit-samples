import { ReactNode, useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen flex-col">
      <Header onMenuToggle={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} className="hidden md:flex" />
        {/* Mobile sidebar - will be shown as a drawer */}
        <div className="md:hidden">
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" 
              onClick={toggleSidebar}
            ></div>
          )}
          <Sidebar 
            isOpen={sidebarOpen} 
            className="fixed left-0 top-16 z-50 h-[calc(100%-4rem)]" 
          />
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
