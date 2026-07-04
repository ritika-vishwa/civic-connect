import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { CanvasLayout } from './layouts/CanvasLayout';

// Public Pages
import { Landing } from './pages/Landing';
import { About } from './pages/About';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Community } from './pages/Community';
import { Events } from './pages/Events';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Map } from './pages/Map';
import { ReportIssue } from './pages/ReportIssue';
import { SuccessScreen } from './pages/SuccessScreen';
import { IssueDetails } from './pages/IssueDetails';
import { MyComplaints } from './pages/MyComplaints';
import { OfficerWorkspace } from './pages/OfficerWorkspace';
import { AdminManagement } from './pages/AdminManagement';
import { Settings } from './pages/Settings';

// Global Utility
import { CommandPalette } from './components/ui/CommandPalette';
import { SupportModal } from './components/ui/SupportModal';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#031427] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Role-Based Route Wrapper
const RoleRoute: React.FC<{ children: React.ReactNode; allowedRoles: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#031427] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
      </div>
    );
  }
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  React.useEffect(() => {
    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.add('light');
    }
  }, []);
  return (
    <BrowserRouter>
      <AuthProvider>
        <IssueProvider>
          <NotificationProvider>
            
            {/* Global Command Palette search listener */}
            <CommandPalette />
            
            {/* Global Support Modal */}
            <SupportModal />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />

              {/* Transactional/Auth Routes wrapped in CanvasLayout */}
              <Route element={<CanvasLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
                <Route path="/success" element={<ProtectedRoute><SuccessScreen /></ProtectedRoute>} />
              </Route>

              {/* Standard Operational Routes wrapped in DashboardLayout */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<RoleRoute allowedRoles={['official', 'moderator', 'admin']}><Analytics /></RoleRoute>} />
                <Route path="/community" element={<Community />} />
                <Route path="/events" element={<Events />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/map" element={<Map />} />
                <Route path="/issues/:id" element={<IssueDetails />} />
                <Route path="/my-complaints" element={<MyComplaints />} />
                <Route path="/officer" element={<RoleRoute allowedRoles={['official', 'admin']}><OfficerWorkspace /></RoleRoute>} />
                <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminManagement /></RoleRoute>} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

          </NotificationProvider>
        </IssueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
