import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
  reason?: string;
};

export default function ProtectedRoute({
  children,
  redirectTo = "/auth",
  reason,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    const reasonParam = reason ? `&reason=${encodeURIComponent(reason)}` : "";
    return (
      <Navigate
        to={`${redirectTo}?mode=sign-in${reasonParam}`}
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
}
