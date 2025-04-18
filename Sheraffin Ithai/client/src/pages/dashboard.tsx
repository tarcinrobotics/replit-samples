import React from 'react';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import Header from '@/components/layout/header';
import OverviewCards from '@/components/dashboard/overview-cards';
import EnrollmentChart from '@/components/dashboard/enrollment-chart';
import PopularCoursesChart from '@/components/dashboard/popular-courses-chart';
import RecentActivity from '@/components/dashboard/recent-activity';
import StudentsTable from '@/components/dashboard/students-table';
import { SidebarContext, useSidebarState } from '@/hooks/use-sidebar';

const Dashboard: React.FC = () => {
  const sidebarState = useSidebarState();
  
  return (
    <SidebarContext.Provider value={sidebarState}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (Desktop) */}
        <Sidebar />
        
        {/* Mobile Sidebar */}
        <MobileSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Dashboard" />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              {/* Overview Cards */}
              <OverviewCards />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <EnrollmentChart />
                <PopularCoursesChart />
              </div>
              
              {/* Recent Activity & Student Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <RecentActivity />
                <StudentsTable />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Dashboard;
