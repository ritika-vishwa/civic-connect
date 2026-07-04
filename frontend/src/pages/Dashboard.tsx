import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CitizenDashboard } from '../components/dashboard/CitizenDashboard';
import { OfficialDashboard } from '../components/dashboard/OfficialDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { ModeratorDashboard } from '../components/dashboard/ModeratorDashboard';

export const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex flex-col gap-8 w-full">
        <div className="border-b border-white/10 pb-6">
          <div className="h-10 w-72 skeleton-shimmer rounded-xl mb-3"></div>
          <div className="h-3 w-80 skeleton-shimmer rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {[0, 1, 2].map(i => (
            <div key={i} className="col-span-1 md:col-span-4 h-36 rounded-2xl border border-white/5 skeleton-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  // Route based on user role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'official') {
    return <OfficialDashboard />;
  }

  if (user.role === 'moderator') {
    return <ModeratorDashboard />;
  }

  // Default for citizens
  return <CitizenDashboard />;
};

export default Dashboard;
