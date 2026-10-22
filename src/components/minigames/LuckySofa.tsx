import React, { useState } from 'react';
import { ArrowLeft, Power, Tv, Award, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface LuckySofaProps {
  onBack: () => void;
  onAddBonus?: (points: number) => void;
}

export const LuckySofa: React.FC<LuckySofaProps> = ({ onBack, onAddBonus }) => {
  const [tvPoweredOn, setTvPoweredOn] = useState<boolean>(true);
  const [tenseState, setTenseState] = useState<'calm' | 'tense' | 'blackout' | 'won'>('tense');
  const [achievementUnlocked, setAchievementUnlocked] = useState<boolean>(false);

  const handleSwitchOff = () => {
    soundManager.playClick();
    setTvPoweredOn(false);
    setTenseState('blackout');

    if (!achievementUnlocked) {
      setAchievementUnlocked(true);
      setTimeout(() => {
        soundManager.playCrowdCheer();
        setTenseState('won');
        if (onAddBonus) onAddBonus(100);
      }, 1500);
    }
  };

  const handleReset = () => {
    soundManager.playClick();
    setTvPoweredOn(true);
    setTenseState('tense');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 text-center">
      <div className="text-left">
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mini-Games Hub</span>
        </button>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide mb-3">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        EASTER EGG EXPERIENCE • THE LUCKY SOFA
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight mb-2">
        The Lucky Sofa: Match-Day Nerves
      </h1>
      <p className="text-sm text-slate-300 max-w-lg mx-auto mb-8">
        Whenever a cricket match becomes nail-bitingly close, Advik’s secret superpower is clicking the TV remote off! Can you survive the tension?
      </p>

      {/* Retro TV Screen Frame */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-4 border-slate-700 shadow-2xl max-w-xl mx-auto relative">
        <div className="h-64 sm:h-72 rounded-2xl bg-black border-2 border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner">
          {tvPoweredOn ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-black animate-pulse border border-rose-500/30">
                🔴 LIVE • FINAL OVER OF THE WORLD CUP
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-100">
                2 BALLS REMAINING!
              </h3>
              <p className="text-sm text-amber-300 font-mono font-bold">
                Opposition needs 4 runs to win. Bumrah is running in!
              </p>
              <p className="text-xs text-rose-300 font-semibold animate-bounce">
                Advik's heart is thumping! The tension is at 100%!
              </p>
            </div>
          ) : tenseState === 'blackout' ? (
            <div className="text-slate-500 font-mono text-xs animate-pulse">
              [ SCREEN BLACKOUT: ADVIK SWITCHED OFF THE TELEVISION ]
              <br />
              <span className="text-[10px] text-slate-600">Waiting in silent anticipation...</span>
            </div>
          ) : (
            <div className="space-y-3 animate-in zoom-in-95 duration-300">
              <div className="text-5xl">🏆🇮🇳</div>
              <h3 className="text-2xl font-black text-emerald-400">
                INDIA HAS WON THE MATCH!
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                Advik's TV switch-off superstition worked magic! The final wicket fell and the stadium erupted in celebration!
              </p>
            </div>
          )}
        </div>

        {/* TV Stand Legs & Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Tv className="w-4 h-4 text-slate-500" />
            <span>Living Room Television Simulation</span>
          </div>

          {tvPoweredOn ? (
            <button
              onClick={handleSwitchOff}
              className="py-3 px-6 rounded-xl font-black text-sm bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Power className="w-4 h-4" />
              <span>TOO TENSE! SWITCH OFF TV NOW!</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="py-2.5 px-5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Turn TV Back On</span>
            </button>
          )}
        </div>
      </div>

      {/* Achievement Unlocked Card */}
      {achievementUnlocked && (
        <div className="mt-8 p-5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-left max-w-md mx-auto shadow-xl animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black shrink-0">
              📺
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                SPECIAL EASTER EGG UNLOCKED
              </span>
              <h4 className="text-base font-black text-slate-100">
                TV Off Survivor (+100 PTS)
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Mastered Advik's famous nerve-saving tactic during high-stakes cricket encounters!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
