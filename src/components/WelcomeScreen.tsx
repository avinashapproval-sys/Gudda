import React, { useState } from 'react';
import { Play, Sparkles, Trophy, Plane, Shield, Award, ChevronRight, BookmarkCheck } from 'lucide-react';
import { ThemeMode } from '../types/game';
import { soundManager } from '../utils/soundManager';

interface WelcomeScreenProps {
  theme: ThemeMode;
  nickname: string;
  onSetNickname: (name: string) => void;
  onStartQuiz: () => void;
  onNavigate: (screen: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  theme,
  nickname,
  onSetNickname,
  onStartQuiz,
  onNavigate
}) => {
  const [inputName, setInputName] = useState(nickname);
  const [errorMsg, setErrorMsg] = useState('');

  const isSky = theme === 'sky';

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputName.trim();
    if (!clean) {
      setErrorMsg('Please enter a nickname to step onto the pitch!');
      soundManager.playIncorrect();
      return;
    }
    if (clean.length < 2) {
      setErrorMsg('Nickname must be at least 2 characters long.');
      soundManager.playIncorrect();
      return;
    }
    setErrorMsg('');
    onSetNickname(clean);
    soundManager.playStartup();
    onStartQuiz();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center">
      {/* 12th Year Commemorative Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold tracking-wide mb-6 animate-pulse">
        <Sparkles className="w-4 h-4 text-amber-400" />
        CELEBRATING ADVIK'S 12TH YEAR • 2026 EDITION
      </div>

      {/* Main Title & Hero Branding */}
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-4">
        ADVIK'S <br className="sm:hidden" />
        <span className={isSky 
          ? 'bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent'
          : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent'
        }>
          PITCH &amp; PLANE
        </span> QUIZ
      </h1>

      <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
        How well do you <span className="text-amber-400 font-bold underline decoration-amber-400/50 underline-offset-4">really</span> know Advik? 
        Test your knowledge across Indian Cricket, Airbus A380 Superjumbos, and Advik's funniest habits!
      </p>

      {/* Hero Interactive Card: Nickname Entry */}
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-2xl border shadow-2xl transition-all duration-300 ${
        isSky 
          ? 'bg-slate-800/80 border-sky-500/30 shadow-sky-950/50'
          : 'bg-slate-800/80 border-emerald-500/30 shadow-emerald-950/50'
      }`}>
        <form onSubmit={handleStart} className="space-y-4">
          <div className="text-left">
            <label htmlFor="nickname-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Player Nickname / Call-Sign
            </label>
            <input
              id="nickname-input"
              type="text"
              maxLength={20}
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. HitmanFan, SkyCaptain..."
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-base transition-all"
              autoFocus
            />
            {errorMsg && (
              <p className="text-rose-400 text-xs font-semibold mt-1.5 text-left">{errorMsg}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1 text-left">
              No login required. Your nickname will appear on the Boarding Pass &amp; Leaderboard.
            </p>
          </div>

          <button
            type="submit"
            className={`w-full py-4 px-6 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${
              isSky
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-emerald-500/25'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            START 5-BALL INNINGS
          </button>
        </form>

        {/* Quick Format Info */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="block font-black text-amber-400 text-sm">5 Balls</span>
            <span className="text-slate-400 text-[11px]">Fresh per round</span>
          </div>
          <div>
            <span className="block font-black text-sky-400 text-sm">3 Lifelines</span>
            <span className="text-slate-400 text-[11px]">Umpire, ATC, PP</span>
          </div>
          <div>
            <span className="block font-black text-emerald-400 text-sm">Mystery Bag</span>
            <span className="text-slate-400 text-[11px]">Bonus round</span>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="w-full max-w-4xl mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
        {/* Spot the Catch */}
        <div 
          onClick={() => {
            soundManager.playClick();
            onNavigate('minigames_catch');
          }}
          className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-amber-400/50 hover:bg-slate-800 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 font-bold">
            🏏
          </div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-400 flex items-center justify-between">
            Spot the Catch <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Recreate Suryakumar Yadav's 2024 final boundary rope catch timing game!
          </p>
        </div>

        {/* Plane Spotter */}
        <div 
          onClick={() => {
            soundManager.playClick();
            onNavigate('minigames_spotter');
          }}
          className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-sky-400/50 hover:bg-slate-800 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2.5 font-bold">
            ✈️
          </div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-sky-400 flex items-center justify-between">
            Plane Spotter <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Identify the A380, Boeing 787, 747, and A350 from clean aircraft silhouettes.
          </p>
        </div>

        {/* Build Gudda Airlines */}
        <div 
          onClick={() => {
            soundManager.playClick();
            onNavigate('minigames_gudda');
          }}
          className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-indigo-400/50 hover:bg-slate-800 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2.5 font-bold">
            🎫
          </div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 flex items-center justify-between">
            Gudda Airlines <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Customize livery, routes to Switzerland or Dubai, and download your airline card.
          </p>
        </div>

        {/* Advik Trading Card */}
        <div 
          onClick={() => {
            soundManager.playClick();
            onNavigate('minigames_card');
          }}
          className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-purple-400/50 hover:bg-slate-800 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5 font-bold">
            🌟
          </div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-purple-400 flex items-center justify-between">
            Trading Card <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Interactive holographic 12th year collectible card with Pull Shot 99 stats!
          </p>
        </div>
      </div>

      {/* Verified Badges Info */}
      <div className="w-full max-w-2xl mt-10 p-4 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-around text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-slate-400" />
          <span>0–2: Grounded Spectator</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-sky-400" />
          <span>3–4: First Officer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400 font-bold" />
          <span className="text-amber-300 font-bold">5/5: Captain of the Century</span>
        </div>
      </div>
    </div>
  );
};
