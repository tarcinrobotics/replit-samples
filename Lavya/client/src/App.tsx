import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CoursesPage from "@/pages/courses-page";
import StudentDashboard from "@/pages/student-dashboard";
import TutorDashboard from "@/pages/tutor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

// Role-based protected route component
function RoleProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles: string[];
}) {
  const { user, isLoading } = useAuth();
  
  // Create a wrapper component that checks roles
  const WrappedComponent = () => {
    if (!user || !allowedRoles.includes(user.role)) {
      return <NotFound />;
    }
    return <Component />;
  };
  
  return <ProtectedRoute path={path} component={WrappedComponent} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/courses" component={CoursesPage} />
      <RoleProtectedRoute 
        path="/student-dashboard" 
        component={StudentDashboard}
        allowedRoles={["Student"]} 
      />
      <RoleProtectedRoute 
        path="/tutor-dashboard" 
        component={TutorDashboard}
        allowedRoles={["Tutor"]} 
      />
      <RoleProtectedRoute 
        path="/admin-dashboard" 
        component={AdminDashboard}
        allowedRoles={["Admin"]} 
      />
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
