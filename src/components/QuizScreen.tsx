import React, { useState, useEffect, useRef } from 'react';
import { Clock, Zap, Radio, HelpCircle, CheckCircle2, XCircle, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { Question, ThemeMode, RoundAnswer } from '../types/game';
import { applyThirdUmpire, shuffleOptions } from '../game/engine';
import { soundManager } from '../utils/soundManager';

interface QuizScreenProps {
  theme: ThemeMode;
  questions: Question[];
  currentQuestionIndex: number;
  onAnswerQuestion: (answer: RoundAnswer) => void;
  onProceedToBaggage: () => void;
  onProceedToNextQuestion: () => void;
  currentStreak: number;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  theme,
  questions,
  currentQuestionIndex,
  onAnswerQuestion,
  onProceedToBaggage,
  onProceedToNextQuestion,
  currentStreak
}) => {
  const currentQ = questions[currentQuestionIndex];

  // Options state (shuffled on question load)
  const [displayedOptions, setDisplayedOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  // Lifelines availability (one use each per 5-question round)
  const [thirdUmpireUsed, setThirdUmpireUsed] = useState(false);
  const [atcUsed, setAtcUsed] = useState(false);
  const [powerplayActive, setPowerplayActive] = useState(false);
  const [powerplayUsedOverall, setPowerplayUsedOverall] = useState(false);

  // ATC hint display
  const [revealedHint, setRevealedHint] = useState<string | null>(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isSky = theme === 'sky';

  // Load new question options and reset state
  useEffect(() => {
    if (!currentQ) return;

    const { shuffledOptions } = shuffleOptions(currentQ.options, currentQ.correctAnswer);
    setDisplayedOptions(shuffledOptions);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setRevealedHint(null);
    setPowerplayActive(false);
    setTimerSeconds(20);

    // Start 20-second timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, currentQ]);

  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">Loading pitch delivery...</p>
      </div>
    );
  }

  // Handle Option Click
  const handleSelectOption = (opt: string) => {
    if (isAnswered) return; // Prevent double answer
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.correctAnswer;
    const timeTaken = 20 - timerSeconds;

    if (isCorrect) {
      soundManager.playCorrect();
      if (currentStreak + 1 === 3) {
        // Hat-trick crowd cheer
        setTimeout(() => soundManager.playCrowdCheer(), 350);
      }
    } else {
      soundManager.playIncorrect();
    }

    onAnswerQuestion({
      questionId: currentQ.id,
      selectedAnswer: opt,
      isCorrect,
      powerplayUsed: powerplayActive,
      timeTakenSeconds: timeTaken
    });
  };

  // Lifeline 1: Third Umpire (50:50)
  const handleThirdUmpire = () => {
    if (thirdUmpireUsed || isAnswered) return;
    soundManager.playClick();
    const reduced = applyThirdUmpire(displayedOptions, currentQ.correctAnswer);
    setDisplayedOptions(reduced);
    setThirdUmpireUsed(true);
  };

  // Lifeline 2: Air Traffic Control (Hint)
  const handleATC = () => {
    if (atcUsed || isAnswered) return;
    soundManager.playAircraftConfirm();
    setRevealedHint(currentQ.hint || `ATC Radar Notice: Advik closely ties this to ${currentQ.category.replace('_', ' ')}!`);
    setAtcUsed(true);
  };

  // Lifeline 3: Powerplay (Double Points)
  const handlePowerplay = () => {
    if (powerplayUsedOverall || isAnswered) return;
    soundManager.playClick();
    setPowerplayActive(true);
    setPowerplayUsedOverall(true);
  };

  const getCategoryLabel = () => {
    switch (currentQ.category) {
      case 'cricket':
        return { label: 'Cricket & Preferences', icon: '🏏', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'aviation':
        return { label: 'Commercial Aviation', icon: '✈️', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
      case 'advik_personal':
        return { label: "Advik's Likes & Habits", icon: '⭐', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default:
        return { label: 'Pitch & Plane Scenarios', icon: '🎯', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    }
  };

  const cat = getCategoryLabel();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Header: Progress & Streak HUD */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Ball {currentQuestionIndex + 1} of 5
          </span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  idx < currentQuestionIndex
                    ? 'bg-amber-400 border-amber-400'
                    : idx === currentQuestionIndex
                    ? 'bg-sky-400 border-sky-300 ring-2 ring-sky-400/30 scale-110'
                    : 'bg-slate-800 border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
          timerSeconds <= 5 
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-bounce' 
            : 'bg-slate-800 border-slate-700 text-slate-300'
        }`}>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timerSeconds}s</span>
        </div>
      </div>

      {/* Streak Combo Banner (Juice & Feedback) */}
      {currentStreak >= 2 && (
        <div className="mb-4 py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm">
          <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
          {currentStreak === 2 && 'BUILDING MOMENTUM! 2 in a row!'}
          {currentStreak === 3 && 'HAT-TRICK! 3 in a row! Crowd is roaring!'}
          {currentStreak === 4 && 'ON FIRE! 4 consecutive deliveries dispatched!'}
          {currentStreak >= 5 && 'PERFECT FLIGHT & PERFECT INNINGS! Clean sweep!'}
        </div>
      )}

      {/* Question Container Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border shadow-xl relative overflow-hidden transition-all duration-300 ${
        isSky
          ? 'bg-slate-800/90 border-sky-500/30 shadow-sky-950/40'
          : 'bg-slate-800/90 border-emerald-500/30 shadow-emerald-950/40'
      }`}>
        {/* Powerplay Active Glow */}
        {powerplayActive && (
          <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider py-1 text-center shadow-md">
            ⚡ POWERPLAY ACTIVE: DOUBLE POINTS FOR THIS DELIVERY!
          </div>
        )}

        {/* Category & Difficulty Badges */}
        <div className={`flex flex-wrap items-center justify-between gap-2 mb-5 ${powerplayActive ? 'mt-4' : ''}`}>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cat.color}`}>
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </span>

          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-700/60 text-slate-400">
            {currentQ.difficulty} delivery
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-50 leading-snug mb-6">
          {currentQ.text}
        </h2>

        {/* ATC Hint Banner if triggered */}
        {revealedHint && (
          <div className="mb-6 p-3.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-200 text-xs sm:text-sm flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold text-sky-300 block mb-0.5">Air Traffic Control Transmission:</span>
              <p>{revealedHint}</p>
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3">
          {displayedOptions.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isChosen = selectedAnswer === opt;
            const isCorrectOption = opt === currentQ.correctAnswer;

            let btnStyle = 'bg-slate-900/80 border-slate-700/80 hover:border-slate-500 text-slate-100 hover:bg-slate-900';

            if (isAnswered) {
              if (isCorrectOption) {
                btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40 font-bold';
              } else if (isChosen) {
                btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold';
              } else {
                btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={opt}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`w-full p-4 rounded-xl border text-left font-medium text-sm sm:text-base transition-all flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isAnswered && isCorrectOption
                      ? 'bg-emerald-500 text-slate-950'
                      : isAnswered && isChosen
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {letter}
                  </span>
                  <span>{opt}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {!isCorrectOption && isChosen && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation Box */}
        {isAnswered && (
          <div className={`mt-6 p-4 rounded-xl border text-xs sm:text-sm animate-in fade-in duration-200 ${
            selectedAnswer === currentQ.correctAnswer
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-slate-900/70 border-slate-700/80 text-slate-300'
          }`}>
            <div className="flex items-start gap-2.5">
              <span className="text-lg">
                {selectedAnswer === currentQ.correctAnswer ? '🏏🎯' : '💡'}
              </span>
              <div>
                <span className="font-bold block mb-1">
                  {selectedAnswer === currentQ.correctAnswer
                    ? 'Pure Shot! Correct Answer:'
                    : `Bowled Out! Correct Answer: ${currentQ.correctAnswer}`}
                </span>
                <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
              </div>
            </div>

            {/* Next Button */}
            <div className="mt-4 pt-3 border-t border-slate-700/40 flex justify-end">
              <button
                onClick={() => {
                  soundManager.playTransition();
                  if (isLastQuestion) {
                    onProceedToBaggage();
                  } else {
                    onProceedToNextQuestion();
                  }
                }}
                className={`py-2.5 px-6 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
                  isSky
                    ? 'bg-sky-500 hover:bg-sky-400 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                }`}
              >
                <span>{isLastQuestion ? 'Proceed to Mystery Baggage' : 'Next Delivery'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lifeline Controls HUD */}
      <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Match Lifelines
          </span>
          <span className="text-[11px] text-slate-500">1 use per round</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Lifeline 1: Third Umpire */}
          <button
            disabled={thirdUmpireUsed || isAnswered || displayedOptions.length <= 2}
            onClick={handleThirdUmpire}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
              thirdUmpireUsed
                ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-amber-400 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 mx-auto mb-1 ${thirdUmpireUsed ? 'text-slate-600' : 'text-amber-400'}`} />
            <span className="block text-xs font-bold">Third Umpire</span>
            <span className="text-[10px] text-slate-400">50:50 options</span>
          </button>

          {/* Lifeline 2: Air Traffic Control */}
          <button
            disabled={atcUsed || isAnswered}
            onClick={handleATC}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
              atcUsed
                ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-sky-400 hover:bg-slate-800'
            }`}
          >
            <Radio className={`w-4 h-4 mx-auto mb-1 ${atcUsed ? 'text-slate-600' : 'text-sky-400'}`} />
            <span className="block text-xs font-bold">Air Traffic Control</span>
            <span className="text-[10px] text-slate-400">Tower hint</span>
          </button>

          {/* Lifeline 3: Powerplay */}
          <button
            disabled={powerplayUsedOverall || isAnswered}
            onClick={handlePowerplay}
            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
              powerplayUsedOverall
                ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                : powerplayActive
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold ring-2 ring-amber-400/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-purple-400 hover:bg-slate-800'
            }`}
          >
            <Zap className={`w-4 h-4 mx-auto mb-1 ${powerplayUsedOverall ? 'text-slate-600' : 'text-purple-400'}`} />
            <span className="block text-xs font-bold">Powerplay</span>
            <span className="text-[10px] text-slate-400">Double points</span>
          </button>
        </div>
      </div>
    </div>
  );
};
