import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Award, RotateCcw, Zap } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface SpotTheCatchProps {
  onBack: () => void;
  onAddBonus?: (points: number) => void;
}

export const SpotTheCatch: React.FC<SpotTheCatchProps> = ({ onBack, onAddBonus }) => {
  const [gameState, setGameState] = useState<'idle' | 'running' | 'caught' | 'six'>('idle');
  const [ballPosition, setBallPosition] = useState<number>(0); // 0 to 100
  const [direction, setDirection] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');

  const animRef = useRef<number | null>(null);

  // Ball movement animation
  useEffect(() => {
    if (gameState !== 'running') return;

    let pos = ballPosition;
    let dir = direction;
    const speed = 1.35;

    const loop = () => {
      pos += dir * speed;
      if (pos >= 100) {
        pos = 100;
        dir = -1;
      } else if (pos <= 0) {
        pos = 0;
        dir = 1;
      }
      setBallPosition(pos);
      setDirection(dir);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, direction]);

  const handleStart = () => {
    soundManager.playClick();
    setBallPosition(10);
    setDirection(1);
    setGameState('running');
    setFeedback('');
  };

  const handleCatchAttempt = () => {
    if (gameState !== 'running') return;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    setAttempts((a) => a + 1);

    // Target Sweet Spot: 78 to 92 (right on the boundary rope cushion!)
    if (ballPosition >= 78 && ballPosition <= 92) {
      soundManager.playCrowdCheer();
      setGameState('caught');
      const pts = 150;
      setScore((s) => s + pts);
      setFeedback('UNBELIEVABLE CATCH ON THE BOUNDARY ROPE! A Suryakumar Yadav 2024 Final Special!');
      if (onAddBonus) onAddBonus(pts);
    } else if (ballPosition > 92) {
      soundManager.playIncorrect();
      setGameState('six');
      setFeedback('IT SAILED OVER THE CUSHION! Six runs! Miller cleared the rope.');
    } else {
      soundManager.playIncorrect();
      setGameState('six');
      setFeedback('Too early! Advik shouts in frustration from the couch!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
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

      <div className="text-center mb-8">
        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
          🏏 TIMING MINI-GAME
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight mt-2 mb-2">
          Spot the Catch: Barbados 2024
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          David Miller lofts a high shot to long-off! Tap the catch button precisely when the ball enters the green boundary cushion zone!
        </p>
      </div>

      {/* Cricket Pitch & Boundary Track */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl mb-8 relative overflow-hidden">
        {/* Sky Background */}
        <div className="h-40 rounded-xl bg-gradient-to-b from-sky-950/70 via-slate-900 to-emerald-950/90 relative overflow-hidden border border-slate-700/60 p-4">
          {/* Boundary Rope Marker */}
          <div className="absolute right-[12%] top-0 bottom-0 w-2.5 bg-rose-600 border-x border-white shadow-lg flex items-center justify-center">
            <span className="text-[9px] uppercase tracking-tighter text-white font-black rotate-90 whitespace-nowrap">
              ROPE
            </span>
          </div>

          {/* Sweet Spot Zone (78% to 92%) */}
          <div className="absolute left-[78%] w-[14%] top-0 bottom-0 bg-emerald-500/25 border-x-2 border-dashed border-emerald-400 flex items-center justify-center">
            <span className="text-[10px] uppercase font-black text-emerald-300 text-center leading-tight">
              PERFECT CATCH ZONE
            </span>
          </div>

          {/* Outfield Grass Line */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-emerald-900/60 border-t border-emerald-700/60 flex items-center px-4 justify-between text-[10px] text-emerald-300/80 font-mono">
            <span>Pitch / Bowler's End</span>
            <span>Long-Off Boundary</span>
          </div>

          {/* The Flying Ball */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-transform duration-75 text-3xl select-none"
            style={{
              left: `calc(${ballPosition}% - 16px)`,
              filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))'
            }}
          >
            🏏
          </div>

          {/* Fielder Silhouette */}
          <div className="absolute right-[14%] bottom-6 text-2xl select-none">
            🏃
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          {gameState === 'idle' ? (
            <button
              onClick={handleStart}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-black text-base bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg transition-all"
            >
              Bowl Delivery &amp; Start Catch!
            </button>
          ) : gameState === 'running' ? (
            <button
              onClick={handleCatchAttempt}
              className="w-full sm:w-auto py-4 px-12 rounded-xl font-black text-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl ring-4 ring-amber-400/30 active:scale-95 transition-all"
            >
              JUMP &amp; CATCH NOW!
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Another Catch</span>
            </button>
          )}
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`mt-6 p-4 rounded-xl border text-center text-sm font-bold animate-in fade-in duration-200 ${
            gameState === 'caught'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500 text-rose-200'
          }`}>
            <p>{feedback}</p>
          </div>
        )}

        {/* Score Tally */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-around text-xs text-slate-400">
          <div>
            <span className="block font-bold text-slate-200 text-sm">{score} PTS</span>
            <span>Catch Points</span>
          </div>
          <div>
            <span className="block font-bold text-slate-200 text-sm">{attempts}</span>
            <span>Catch Attempts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
