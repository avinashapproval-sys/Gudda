import React from 'react';
import { Volume2, VolumeX, Trophy, Gamepad2, Settings, Sparkles, Plane, Shield } from 'lucide-react';
import { ThemeMode } from '../types/game';
import { soundManager } from '../utils/soundManager';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onOpenEasterEgg: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  isMuted,
  onToggleMute,
  activeScreen,
  onNavigate,
  onOpenEasterEgg,
  onOpenAdmin
}) => {
  const isSky = theme === 'sky';

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${
      isSky
        ? 'bg-slate-900/90 border-sky-800/40 text-slate-100'
        : 'bg-emerald-950/90 border-emerald-800/40 text-slate-100'
    }`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => {
            soundManager.playClick();
            onNavigate('welcome');
          }}
          className="flex items-center gap-2.5 text-left group transition-transform hover:scale-[1.02]"
          aria-label="Return to Welcome Screen"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg font-black text-lg transition-colors ${
            isSky 
              ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sky-500/20' 
              : 'bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-emerald-500/20'
          }`}>
            {isSky ? '✈️' : '🏏'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight">
                Advik's <span className={isSky ? 'text-sky-400' : 'text-emerald-400'}>Pitch &amp; Plane</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                12th Year • 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden xs:block">
              Cricket • Aviation • Personality Quiz
            </p>
          </div>
        </button>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Mode Toggle (Sky Mode vs Stadium Mode) */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleTheme();
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isSky
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
            }`}
            title={`Switch to ${isSky ? 'Stadium' : 'Sky'} Mode`}
            aria-label="Toggle Theme Mode"
          >
            {isSky ? <Plane className="w-3.5 h-3.5 text-sky-400" /> : <Shield className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden md:inline">{isSky ? 'Sky Mode' : 'Stadium Mode'}</span>
          </button>

          {/* Mini-Games Nav */}
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('minigames');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeScreen === 'minigames'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
            }`}
            aria-label="Mini-Games & Collectibles"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mini-Games</span>
          </button>

          {/* Leaderboard Nav */}
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('leaderboard');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeScreen === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
            }`}
            aria-label="Shared Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          {/* Easter Egg Trigger */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenEasterEgg();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 bg-purple-500/15 border border-purple-500/40 text-purple-300 hover:bg-purple-500/25 transition-all"
            title="Secret Easter Egg codes (SKY, A380)"
            aria-label="Secret Easter Eggs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Easter Eggs</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              soundManager.playClick();
            }}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Admin Gear */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAdmin();
            }}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
            title="Question Bank & Leaderboard Admin"
            aria-label="Admin Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
