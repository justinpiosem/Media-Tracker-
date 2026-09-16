import React from 'react';
import { useApp } from '../context/AppContext';
import { CoabLogo } from './CoabLogo';
import { 
  ShieldCheck, 
  Calendar, 
  HardDrive, 
  Layers, 
  AlertCircle, 
  Lock,
  ArrowRight
} from 'lucide-react';

export const LoginGate: React.FC = () => {
  const { handleSignIn, isLoadingAuth, authError, clearAuthError } = useApp();

  return (
    <div className="min-h-screen bg-radial-[at_50%_0%] from-emerald-950/20 via-[#061722] to-[#040f17] text-[#F8FAF9] flex flex-col justify-between selection:bg-[#E1910F]/30 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#064420]/25 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-[#E1910F]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top minimal header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-8 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <CoabLogo className="w-10 h-10 shadow-lg rounded-xl" />
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              COAB Multimedia Committee
            </h1>
            <p className="text-xs text-emerald-400/90 font-medium">
              Media Operations & Production Hub
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Workspace SSO Protected</span>
        </div>
      </header>

      {/* Center login card */}
      <main className="max-w-md w-full mx-auto px-6 py-4 flex-1 flex flex-col justify-center z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-8 shadow-2xl relative">
          {/* Subtle top accent border */}
          <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#064420] to-transparent" />

          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[#064420]/30 border border-[#064420]/50 text-emerald-400 mb-1 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-[#E1910F]" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Authorized Sign In
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign in with your Google Account to access the production board, deliverable deadlines, and team directory.
            </p>
          </div>

          {/* Auth Error Banner if popup failed */}
          {authError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs flex items-start space-x-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-100">Sign-in Notice</p>
                <p className="text-red-300/90 mt-0.5">{authError}</p>
                <button 
                  onClick={clearAuthError}
                  className="mt-2 text-[11px] text-red-300 underline font-medium hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isLoadingAuth}
            className="w-full flex items-center justify-center space-x-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoadingAuth ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Integrated features summary */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 text-center">
              Google Workspace Services
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex flex-col items-center">
                <Calendar className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[11px] text-slate-300 font-medium">Calendar</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex flex-col items-center">
                <HardDrive className="w-4 h-4 text-blue-400 mb-1" />
                <span className="text-[11px] text-slate-300 font-medium">Drive</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex flex-col items-center">
                <Layers className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-[11px] text-slate-300 font-medium">Matrix</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500 z-10">
        <p>College of Accountancy & Business (COAB) • Media Committee Deliverables & Production Hub</p>
        <p className="text-slate-600 mt-1">Super Admin: makabentajustin55@gmail.com</p>
      </footer>
    </div>
  );
};
