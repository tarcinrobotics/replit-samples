import React, { Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import Dashboard from "@/pages/dashboard";
import FindTutors from "@/pages/find-tutors";
import MySessions from "@/pages/my-sessions";
import HelpCenter from "@/pages/help-center";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { useAuth } from "@/hooks/use-auth";

// AuthenticatedLayout component that requires login
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return null; // This will be handled by the ProtectedRoute
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar user={user} />
      <MobileHeader user={user} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <div className="md:hidden h-14"></div> {/* Mobile header spacer */}
        {children}
      </div>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  // Show loading spinner if auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary-600 rounded-full"></div>
      </div>
    );
  }
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/">
        {() => {
          if (user) {
            return <Redirect to="/dashboard" />;
          } else {
            return <Redirect to="/home" />;
          }
        }}
      </Route>
      
      {/* Tutor profile - accessible to all users */}
      <Route path="/tutors/:id">
        {(params) => {
          const TutorProfile = React.lazy(() => import('./pages/tutor-profile'));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <TutorProfile />
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Protected routes */}
      <ProtectedRoute 
        path="/dashboard" 
        component={() => (
          <AuthenticatedLayout>
            <Dashboard />
          </AuthenticatedLayout>
        )} 
      />
      <ProtectedRoute 
        path="/find-tutors" 
        component={() => (
          <AuthenticatedLayout>
            <FindTutors />
          </AuthenticatedLayout>
        )} 
      />
      <ProtectedRoute 
        path="/my-sessions" 
        component={() => (
          <AuthenticatedLayout>
            <MySessions />
          </AuthenticatedLayout>
        )} 
      />
      <ProtectedRoute 
        path="/help-center" 
        component={() => (
          <AuthenticatedLayout>
            <HelpCenter />
          </AuthenticatedLayout>
        )} 
      />
      <ProtectedRoute 
        path="/settings" 
        component={() => (
          <AuthenticatedLayout>
            <Settings />
          </AuthenticatedLayout>
        )} 
      />
      
      {/* 404 route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
