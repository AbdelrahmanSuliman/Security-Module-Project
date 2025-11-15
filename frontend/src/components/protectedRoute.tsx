import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const role = localStorage.getItem("role"); 
  const token = localStorage.getItem("token"); 

  if (!token || !role || !allowedRoles.includes(role.toUpperCase())) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
