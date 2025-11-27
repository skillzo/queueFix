import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const phoneNumber = localStorage.getItem("phoneNumber");
  const fullName = localStorage.getItem("fullName");

  if (!phoneNumber || !fullName) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
