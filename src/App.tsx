import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { EisenhowerView } from './components/EisenhowerView';
import { CalendarView } from './components/CalendarView';
import { DirectoryView } from './components/DirectoryView';
import { NotificationsView } from './components/NotificationsView';
import { LoginGate } from './components/LoginGate';
import { CoabLogo } from './components/CoabLogo';

const MainContent: React.FC = () => {
  const { currentTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 md:pb-12 transition-all">
      {currentTab === 'dashboard' && <DashboardView />}
      {currentTab === 'eisenhower' && <EisenhowerView />}
      {currentTab === 'calendar' && <CalendarView />}
      {currentTab === 'directory' && <DirectoryView />}
      {currentTab === 'notifications' && <NotificationsView />}
    </main>
  );
};

const AuthLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#061722] text-white flex flex-col items-center justify-center p-6 space-y-4 font-sans select-none">
      <div className="relative flex items-center justify-center">
        <CoabLogo size={56} className="shadow-2xl rounded-2xl" />
        <div className="absolute -inset-2 rounded-2xl border-2 border-[#E1910F]/60 border-t-transparent animate-spin" />
      </div>
      <div className="text-center space-y-1.5 pt-2">
        <h2 className="text-base font-bold tracking-tight text-white">COAB Multimedia Committee</h2>
        <p className="text-xs text-slate-400">Verifying Google authentication status...</p>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const { isDark } = useApp();

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen bg-[#F8FAF9] dark:bg-[#061722] text-[#092638] dark:text-[#F8FAF9] flex flex-col font-sans transition-colors selection:bg-[#E1910F]/30 selection:text-[#092638] relative`}>
      <Navbar />
      <div className="flex-1">
        <MainContent />
      </div>
      
      {/* Minimalist footer */}
      <footer className="border-t border-[#064420]/10 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            College of Accountancy & Business (COAB) Multimedia Committee
          </p>
          <p className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Media Operations & Production Hub
          </p>
        </div>
      </footer>
    </div>
  );
};

const RootContent: React.FC = () => {
  const { currentUser, isLoadingAuth } = useApp();

  if (isLoadingAuth) {
    return <AuthLoadingState />;
  }

  if (!currentUser) {
    return <LoginGate />;
  }

  return <AppLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <RootContent />
    </AppProvider>
  );
}
