import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { FloatingAssistant } from '../components/layout/FloatingAssistant';
import { BackgroundShader } from '../components/layout/BackgroundShader';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen relative antialiased">
      {/* Dynamic Background Shader */}
      <BackgroundShader />

      {/* Shared Header Navigation */}
      <TopNav />

      {/* Main Layout Wrap */}
      <div className="flex-grow flex pt-20 h-screen overflow-hidden max-w-container-max mx-auto w-full relative">
        {/* Shared Left Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Content Panel */}
        <main className="flex-1 w-full md:pl-64 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth flex flex-col">
          <div className="p-margin-mobile md:p-gutter lg:p-margin-desktop flex-grow flex flex-col gap-gutter max-w-7xl mx-auto mt-4 w-full">
            <Outlet />
          </div>
          {/* Shared Footer inside main viewport */}
          <Footer />
        </main>
      </div>

      {/* Floating AI Assistant Widget */}
      <FloatingAssistant />
    </div>
  );
};
export default DashboardLayout;
