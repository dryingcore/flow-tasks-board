
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { KanbanProvider } from "@/contexts/kanban";
import Index from "@/pages/Index";
import ApiSettings from "@/pages/ApiSettings";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const AuthenticatedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <KanbanProvider>
            <Index />
          </KanbanProvider>
        </ProtectedRoute>
      } />
      <Route path="/api-settings" element={
        <ProtectedRoute>
          <KanbanProvider>
            <ApiSettings />
          </KanbanProvider>
        </ProtectedRoute>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
