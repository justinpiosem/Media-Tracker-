import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CoabLogo } from './CoabLogo';
import { 
  LayoutDashboard, 
  Layers,
  CalendarDays, 
  Users, 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Download,
  Terminal,
  FolderArchive,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    isDark, 
    toggleTheme, 
    currentProfile, 
    userRole, 
    members,
    switchMember,
    notifications,
    updateMemberRole,
    handleSignOut
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleBadgeColor = {
    admin: 'bg-[#E1910F]/15 text-[#E1910F] border-[#E1910F]/30',
    editor: 'bg-[#245439]/15 text-[#245439] dark:text-[#6ee7b7] border-[#245439]/30',
    contributor: 'bg-[#092638]/10 dark:bg-[#FFFFFF]/10 text-[#092638] dark:text-[#E2E8F0] border-slate-300 dark:border-slate-700',
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-[#061722]/90 border-b border-[#064420]/10 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          
          {/* Brand & Seal Logo */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer shrink-0" onClick={() => setCurrentTab('dashboard')}>
            <CoabLogo size={38} />
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#092638] dark:text-white flex items-center gap-1">
                  COAB <span className="text-[#064420] dark:text-[#4ade80]">Tracker</span>
                </span>
              </div>
              <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                College of Accountancy & Business
              </span>
            </div>
          </div>

          {/* 5 Main Tabs Navigation (Responsive for tablet & desktop) */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100/80 dark:bg-[#0b2434] rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-1.5 lg:space-x-2 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-[11px] lg:text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-[#064420] text-[#064420] dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#092638] dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('eisenhower')}
              className={`flex items-center space-x-1.5 lg:space-x-2 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-[11px] lg:text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'eisenhower'
                  ? 'bg-white dark:bg-[#064420] text-[#064420] dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#092638] dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Eisenhower</span>
            </button>

            <button
              onClick={() => setCurrentTab('calendar')}
              className={`flex items-center space-x-1.5 lg:space-x-2 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-[11px] lg:text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'calendar'
                  ? 'bg-white dark:bg-[#064420] text-[#064420] dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#092638] dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setCurrentTab('directory')}
              className={`flex items-center space-x-1.5 lg:space-x-2 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-[11px] lg:text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'directory'
                  ? 'bg-white dark:bg-[#064420] text-[#064420] dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#092638] dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Directory</span>
            </button>

            <button
              onClick={() => setCurrentTab('notifications')}
              className={`relative flex items-center space-x-1.5 lg:space-x-2 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-[11px] lg:text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'notifications'
                  ? 'bg-white dark:bg-[#064420] text-[#064420] dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#092638] dark:hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span>Alerts</span>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-[16px] h-[16px] lg:min-w-[18px] lg:h-[18px] px-1 rounded-full bg-[#E1910F] text-white text-[9px] lg:text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Icons & User Account */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Direct Export Project Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b2434] hover:bg-slate-50 dark:hover:bg-[#12364c] text-[#092638] dark:text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              title="Export Project Codebase (ZIP)"
            >
              <Download className="w-3.5 h-3.5 text-[#064420] dark:text-[#4ade80]" />
              <span className="hidden sm:inline">Export ZIP</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-slate-500 hover:text-[#092638] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#E1910F]" /> : <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            </button>

            {/* Quick Notification icon button on mobile */}
            <button
              onClick={() => setCurrentTab('notifications')}
              className="md:hidden relative p-2 rounded-xl text-slate-500 hover:text-[#092638] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E1910F]" />
              )}
            </button>

            {/* Active Member Profile & Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1 sm:py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b2434] hover:border-[#064420]/30 transition-all shadow-xs"
              >
                {currentProfile?.photoUrl ? (
                  <img
                    src={currentProfile.photoUrl}
                    alt={currentProfile.name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-[#064420]/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#064420] text-white flex items-center justify-center text-xs font-bold">
                    {currentProfile?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#092638] dark:text-white max-w-[100px] lg:max-w-[120px] truncate">
                    {currentProfile?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {userRole}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile & Member Switcher Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-[#0b2434] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#092638] dark:text-white truncate">
                        {currentProfile?.name}
                      </p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${roleBadgeColor[userRole]}`}>
                        {userRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentProfile?.email}</p>
                    {currentProfile?.position && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {currentProfile.position} • {currentProfile.org}
                      </p>
                    )}
                  </div>

                  {/* Role Control */}
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#061722]/50 border-b border-slate-100 dark:border-slate-700/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Access Role Level</span>
                      <ShieldCheck className="w-3 h-3 text-[#E1910F]" />
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {(['admin', 'editor', 'contributor'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            if (currentProfile) updateMemberRole(currentProfile.id, r);
                          }}
                          className={`text-[10px] font-semibold py-1 rounded-md transition-all capitalize ${
                            userRole === r
                              ? 'bg-[#064420] text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Switch Member Profile */}
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                      Switch Committee Member:
                    </p>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {members.map((m) => {
                        const isSelected = m.id === currentProfile?.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              switchMember(m.id);
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-1.5 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'bg-[#064420]/10 dark:bg-[#4ade80]/15 text-[#064420] dark:text-[#4ade80] font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              {m.photoUrl ? (
                                <img src={m.photoUrl} alt={m.name} className="w-5 h-5 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {m.name.charAt(0)}
                                </div>
                              )}
                              <span className="text-xs truncate">{m.name}</span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wide opacity-60 ml-2 shrink-0">{m.role}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="px-2 pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setCurrentTab('directory');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span>Manage All Members & Directory</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setIsExportModalOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#064420] dark:text-[#4ade80] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-3.5 h-3.5" />
                        Export Project (.ZIP)
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-[#064420]/10 dark:bg-[#4ade80]/20">Code</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out of Google
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Floating Modern Mobile Bottom Navigation Dock */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#061722]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl transition-all ${
              currentTab === 'dashboard' 
                ? 'text-[#064420] dark:text-[#4ade80] font-bold bg-[#064420]/10 dark:bg-[#4ade80]/15' 
                : 'text-slate-500 dark:text-slate-400 hover:text-[#092638]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight leading-none">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('eisenhower')}
            className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl transition-all ${
              currentTab === 'eisenhower' 
                ? 'text-[#064420] dark:text-[#4ade80] font-bold bg-[#064420]/10 dark:bg-[#4ade80]/15' 
                : 'text-slate-500 dark:text-slate-400 hover:text-[#092638]'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight leading-none">Matrix</span>
          </button>

          <button
            onClick={() => setCurrentTab('calendar')}
            className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl transition-all ${
              currentTab === 'calendar' 
                ? 'text-[#064420] dark:text-[#4ade80] font-bold bg-[#064420]/10 dark:bg-[#4ade80]/15' 
                : 'text-slate-500 dark:text-slate-400 hover:text-[#092638]'
            }`}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight leading-none">Calendar</span>
          </button>

          <button
            onClick={() => setCurrentTab('directory')}
            className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl transition-all ${
              currentTab === 'directory' 
                ? 'text-[#064420] dark:text-[#4ade80] font-bold bg-[#064420]/10 dark:bg-[#4ade80]/15' 
                : 'text-slate-500 dark:text-slate-400 hover:text-[#092638]'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight leading-none">Directory</span>
          </button>

          <button
            onClick={() => setCurrentTab('notifications')}
            className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl relative transition-all ${
              currentTab === 'notifications' 
                ? 'text-[#064420] dark:text-[#4ade80] font-bold bg-[#064420]/10 dark:bg-[#4ade80]/15' 
                : 'text-slate-500 dark:text-slate-400 hover:text-[#092638]'
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5 mb-0.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#E1910F] text-white text-[8px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-none">Alerts</span>
          </button>
        </div>
      </nav>

      {/* Export Project Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0b2434] border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#064420]/10 dark:bg-[#4ade80]/15 text-[#064420] dark:text-[#4ade80]">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#092638] dark:text-white">
                    Export Project Codebase
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Download complete project files as a .ZIP archive
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Download CTA button */}
            <div className="p-4 rounded-2xl bg-[#064420]/5 dark:bg-[#064420]/20 border border-[#064420]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#092638] dark:text-white">
                  coab-media-operations-hub.zip
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Includes React, TypeScript, Tailwind, and configs
                </p>
              </div>
              <a
                href="/api/export-zip"
                download="coab-media-operations-hub.zip"
                onClick={() => setIsDownloading(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#064420] hover:bg-[#245439] text-white text-xs font-bold shadow-md transition-all active:scale-95 text-center"
              >
                <Download className="w-4 h-4" />
                <span>Download .ZIP</span>
              </a>
            </div>

            {/* Quick Local Run Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                How to run locally
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-1.5 overflow-x-auto">
                <p className="text-slate-400 text-[11px]"># 1. Unzip the downloaded file and cd into it</p>
                <p className="text-emerald-400">unzip coab-media-operations-hub.zip -d coab-app</p>
                <p className="text-emerald-400">cd coab-app</p>
                <p className="text-slate-400 text-[11px] mt-2"># 2. Install dependencies</p>
                <p className="text-emerald-400">npm install</p>
                <p className="text-slate-400 text-[11px] mt-2"># 3. Start development server</p>
                <p className="text-emerald-400">npm run dev</p>
              </div>
            </div>

            {/* AI Studio Platform Note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#061722]/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Alternative: Google AI Studio Platform Export
              </span>
              <p>
                In the Google AI Studio editor (the outer browser tab hosting this app), click the <strong>Settings (⚙️)</strong> icon or project menu in the upper right header to access <strong>Export to GitHub</strong> or <strong>Download ZIP</strong>.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
