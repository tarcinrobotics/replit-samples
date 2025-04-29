import { useAuth } from "@/hooks/use-auth";
import { FullPageLoader } from "@/components/LoadingSpinner";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <FullPageLoader />
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If user is student, only allow access to student dashboard
  if (path === "/tutor-dashboard" && user.role === "Student") {
    return (
      <Route path={path}>
        <Redirect to="/student-dashboard" />
      </Route>
    );
  }

  // If user is tutor, only allow access to tutor dashboard
  if (path === "/student-dashboard" && user.role === "Tutor") {
    return (
      <Route path={path}>
        <Redirect to="/tutor-dashboard" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
