import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import Students from "@/pages/students";
import Instructors from "@/pages/instructors";
import CreateInstructor from "@/pages/create-instructor"; // Added import
import Assignments from "@/pages/assignments";
import ContentLibrary from "@/pages/content-library";
import VideoLessons from "@/pages/video-lessons";
import Analytics from "@/pages/analytics";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/courses" component={Courses} />
      <ProtectedRoute path="/students" component={Students} />
      <ProtectedRoute path="/instructors" component={Instructors} />
      <ProtectedRoute path="/instructors/new" component={CreateInstructor} /> {/* Added route */}
      <ProtectedRoute path="/assignments" component={Assignments} />
      <ProtectedRoute path="/content-library" component={ContentLibrary} />
      <ProtectedRoute path="/video-lessons" component={VideoLessons} />
      <ProtectedRoute path="/analytics" component={Analytics} />
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