import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, Download, Share2, RotateCcw, Award, CheckCircle2, 
  ExternalLink, Sparkles, Send, Check
} from 'lucide-react';
import { ThemeMode, LeaderboardEntry } from '../types/game';
import { calculateBadge } from '../game/engine';
import { drawBoardingPass } from '../utils/canvasPass';
import { soundManager } from '../utils/soundManager';

interface ResultsScreenProps {
  theme: ThemeMode;
  nickname: string;
  mainScore: number;
  bonusPoints: number;
  totalPoints: number;
  durationSeconds: number;
  gameSessionId: string;
  onPlayAgain: () => void;
  onNavigateToLeaderboard: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  theme,
  nickname,
  mainScore,
  bonusPoints,
  totalPoints,
  durationSeconds,
  gameSessionId,
  onPlayAgain,
  onNavigateToLeaderboard
}) => {
  const badge = calculateBadge(mainScore);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  
  // Submission to leaderboard state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

  const isSky = theme === 'sky';

  // Confetti and fanfare on load
  useEffect(() => {
    if (mainScore === 5) {
      soundManager.playVictoryFanfare();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else if (mainScore >= 3) {
      soundManager.playBoardingChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      soundManager.playStartup();
    }

    // Render Canvas Boarding Pass
    if (canvasRef.current) {
      const url = drawBoardingPass(canvasRef.current, {
        nickname: nickname || 'Champion Player',
        mainScore,
        bonusPoints,
        totalPoints,
        badge,
        theme
      });
      setDownloadUrl(url);
    }
  }, [mainScore, bonusPoints, totalPoints, nickname, badge, theme]);

  // Submit to Leaderboard
  const handleSubmitScore = async () => {
    if (submittedRank !== null || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          mainScore,
          bonusPoints,
          totalPoints,
          gameSessionId,
          durationSeconds
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedRank(data.rank || 1);
        soundManager.playAircraftConfirm();
      } else {
        throw new Error(data.error || 'Failed to submit online score');
      }
    } catch {
      // Local fallback mode: store locally when offline
      const localEntry: LeaderboardEntry = {
        id: `local_${Date.now()}`,
        gameSessionId,
        nickname: nickname || 'Anonymous',
        correctAnswers: mainScore,
        mainScore,
        bonusPoints,
        totalPoints,
        badge,
        durationSeconds,
        timestamp: Date.now(),
        isLocalOnly: true
      };

      try {
        const saved = JSON.parse(localStorage.getItem('advik_local_leaderboard') || '[]');
        saved.push(localEntry);
        localStorage.setItem('advik_local_leaderboard', JSON.stringify(saved));
        setIsOfflineSaved(true);
        setSubmittedRank(1);
      } catch {
        setSubmitError('Unable to sync score. Saved on this device.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Share Message
  const handleShareWhatsApp = () => {
    soundManager.playClick();
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://advik-quiz.web.app';
    const text = `I scored ${mainScore}/5 accuracy and earned the "${badge}" badge in Advik's Pitch & Plane Quiz! 🏏✈️ Total Score: ${totalPoints} PTS. Can you beat me? Play here: ${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const getBadgeVisuals = () => {
    switch (badge) {
      case 'Captain of the Century':
        return {
          color: 'from-amber-400 via-yellow-300 to-amber-500 text-slate-950',
          border: 'border-amber-400',
          desc: 'Flawless 5/5 innings! The ultimate master of Indian cricket and commercial aviation.'
        };
      case 'First Officer of the Pitch':
        return {
          color: 'from-sky-400 via-blue-400 to-indigo-500 text-white',
          border: 'border-sky-400',
          desc: 'High-flying performance! You know Advik’s world with sharp precision.'
        };
      default:
        return {
          color: 'from-slate-600 via-slate-700 to-slate-800 text-slate-100',
          border: 'border-slate-600',
          desc: 'Good effort in the outfield! Grab a bun with butter, tune into Layover Aviation, and try again!'
        };
    }
  };

  const badgeVis = getBadgeVisuals();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 text-center">
      {/* Top Banner */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold tracking-wide mb-4">
        <Sparkles className="w-4 h-4 text-amber-400" />
        ROUND SUMMARY • 12TH YEAR 2026 EDITION
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight mb-2">
        Innings Complete, {nickname}!
      </h1>
      <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
        Your flight has safely touched down and your cricket innings is official in the scorebook!
      </p>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
        {/* Main Score (Accuracy) */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-lg">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Main Pitch Score
          </span>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono">
            {mainScore} <span className="text-2xl text-slate-500">/ 5</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {Math.round((mainScore / 5) * 100)}% Pitch Accuracy
          </span>
        </div>

        {/* Bonus Points */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-lg">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Bonus Score
          </span>
          <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono">
            +{bonusPoints}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Powerplay &amp; Baggage
          </span>
        </div>

        {/* Total Points */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-lg">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Points
          </span>
          <div className="text-4xl sm:text-5xl font-black text-sky-400 font-mono">
            {totalPoints}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Completed in {durationSeconds}s
          </span>
        </div>
      </div>

      {/* Official Badge Card */}
      <div className={`max-w-xl mx-auto p-6 rounded-2xl border shadow-xl mb-10 ${badgeVis.border} bg-slate-800/60`}>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
          OFFICIAL BADGE AWARDED
        </span>
        <div className={`inline-block px-5 py-2.5 rounded-xl font-black text-lg sm:text-xl uppercase tracking-wide bg-gradient-to-r ${badgeVis.color} shadow-lg mb-3`}>
          {badge}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          {badgeVis.desc}
        </p>
      </div>

      {/* Boarding Pass / Match Ticket Section */}
      <div className="mb-10 text-left max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="font-extrabold text-lg text-slate-100">
              ✈️ Your Digital Boarding Pass
            </h3>
            <p className="text-xs text-slate-400">
              Gudda Airlines Flight GA-2026 • First Class Suite 12A
            </p>
          </div>

          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`Advik_Pitch_Plane_Pass_${nickname}.png`}
              onClick={() => soundManager.playBoardingChime()}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </a>
          )}
        </div>

        {/* Canvas Display */}
        <div className="rounded-2xl border border-slate-700 overflow-hidden shadow-2xl bg-slate-950 flex justify-center p-2">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-w-[850px] rounded-xl shadow-inner"
          />
        </div>
      </div>

      {/* Action Buttons Hub */}
      <div className="max-w-xl mx-auto space-y-3">
        {/* Submit to Shared Leaderboard Button */}
        {submittedRank === null ? (
          <button
            disabled={isSubmitting}
            onClick={handleSubmitScore}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-base bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Syncing to Leaderboard...' : 'Submit Score to Online Leaderboard'}</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm font-bold flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>
              {isOfflineSaved
                ? 'Saved to Local Device Leaderboard (Offline Mode)'
                : `Score Submitted Online! Ranked #${submittedRank} on Leaderboard!`}
            </span>
          </div>
        )}

        {/* WhatsApp Share Button */}
        <button
          onClick={handleShareWhatsApp}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-base bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Share2 className="w-5 h-5" />
          <span>Share Result on WhatsApp</span>
        </button>

        {/* Action Row: Replay & View Leaderboard */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              soundManager.playStartup();
              onPlayAgain();
            }}
            className={`py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
              isSky
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-200 hover:bg-sky-500/30'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Another Round</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onNavigateToLeaderboard();
            }}
            className="py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>View Leaderboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
