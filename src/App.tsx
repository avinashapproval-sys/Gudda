import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { MysteryBaggage } from './components/MysteryBaggage';
import { ResultsScreen } from './components/ResultsScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { MiniGamesHub } from './components/minigames/MiniGamesHub';
import { SpotTheCatch } from './components/minigames/SpotTheCatch';
import { PlaneSpotter } from './components/minigames/PlaneSpotter';
import { GuddaAirlinesBuilder } from './components/minigames/GuddaAirlinesBuilder';
import { AdvikTradingCard } from './components/minigames/AdvikTradingCard';
import { LuckySofa } from './components/minigames/LuckySofa';
import { AdminModal } from './components/AdminModal';
import { EasterEggBanner } from './components/EasterEggBanner';
import { Question, ThemeMode, RoundAnswer, MysteryBaggageOutcome } from './types/game';
import { BUNDLED_QUESTIONS } from './data/bundledQuestions';
import { selectRoundQuestions, calculateScore } from './game/engine';
import { soundManager } from './utils/soundManager';

export function App() {
  // Theme mode: sky (default) or stadium
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('advik_quiz_theme');
      if (saved === 'stadium' || saved === 'sky') return saved;
    }
    return 'sky';
  });

  // Sound mute state
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  // Navigation screen
  const [activeScreen, setActiveScreen] = useState<string>('welcome');

  // Player Nickname
  const [nickname, setNickname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('advik_quiz_nickname') || '';
    }
    return '';
  });

  // Questions database
  const [allQuestions, setAllQuestions] = useState<Question[]>(BUNDLED_QUESTIONS);
  const [recentQuestionIds, setRecentQuestionIds] = useState<string[]>([]);

  // Current active round state
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [roundAnswers, setRoundAnswers] = useState<RoundAnswer[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [gameSessionId, setGameSessionId] = useState<string>('');
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [totalRoundDuration, setTotalRoundDuration] = useState<number>(0);

  // Mystery baggage bonus
  const [mysteryBaggageBonus, setMysteryBaggageBonus] = useState<number>(0);

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);

  // Dynamic visual triggers
  const [showFlyover, setShowFlyover] = useState(false);
  const [showCricketBlast, setShowCricketBlast] = useState(false);

  // Load questions from backend API with bundled fallback
  const fetchQuestions = () => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.questions) && data.questions.length >= 80) {
          setAllQuestions(data.questions);
        }
      })
      .catch(() => {
        // Safe offline fallback
        setAllQuestions(BUNDLED_QUESTIONS);
      });
  };

  useEffect(() => {
    fetchQuestions();

    // Check for autostart parameter (e.g. ?autostart=1 for ultra-mode testability)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') {
        const testName = 'TestPilot2026';
        setNickname(testName);
        startNewRound(testName);
      }
    }
  }, []);

  // Theme change
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'sky' ? 'stadium' : 'sky';
    setTheme(nextTheme);
    localStorage.setItem('advik_quiz_theme', nextTheme);
  };

  // Sound mute change
  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Start new round
  const startNewRound = (nameToUse?: string) => {
    const activeName = nameToUse || nickname || 'Champion Player';
    localStorage.setItem('advik_quiz_nickname', activeName);

    // Pick 5 non-repeating questions mixing categories
    const selected = selectRoundQuestions(allQuestions, recentQuestionIds, 5);
    setRoundQuestions(selected);
    setCurrentQuestionIndex(0);
    setRoundAnswers([]);
    setCurrentStreak(0);
    setMysteryBaggageBonus(0);
    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setGameSessionId(newSessionId);
    setRoundStartTime(Date.now());

    // Update recent question history (up to last 20 questions)
    const newIds = selected.map((q) => q.id);
    setRecentQuestionIds((prev) => [...prev, ...newIds].slice(-20));

    setActiveScreen('quiz');
  };

  // Handle answering a question
  const handleAnswerQuestion = (ans: RoundAnswer) => {
    setRoundAnswers((prev) => [...prev, ans]);
    if (ans.isCorrect) {
      setCurrentStreak((s) => s + 1);
    } else {
      setCurrentStreak(0);
    }
  };

  // Next question
  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  // Proceed to Mystery Baggage
  const handleProceedToBaggage = () => {
    const duration = Math.round((Date.now() - roundStartTime) / 1000);
    setTotalRoundDuration(duration);
    setActiveScreen('baggage');
  };

  // Complete Mystery Baggage
  const handleCompleteBaggage = (outcome: MysteryBaggageOutcome) => {
    setMysteryBaggageBonus(outcome.bonusScore);
    setActiveScreen('results');
  };

  // Calculate final score
  const scoreResult = calculateScore(
    roundAnswers.map((a) => ({
      isCorrect: a.isCorrect,
      powerplayUsed: a.powerplayUsed,
      timeTakenSeconds: a.timeTakenSeconds
    })),
    mysteryBaggageBonus
  );

  // Trigger Flyover Animation
  const triggerFlyoverAnimation = () => {
    setShowFlyover(true);
    setTimeout(() => setShowFlyover(false), 4000);
  };

  // Trigger Cricket Blast
  const triggerCricketBlastAnimation = () => {
    setShowCricketBlast(true);
    setTimeout(() => setShowCricketBlast(false), 3500);
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 relative overflow-x-hidden ${
      theme === 'sky' ? 'bg-slate-900 text-slate-100' : 'bg-emerald-950 text-slate-100'
    }`}>
      {/* Dynamic Animated Flyover Plane Easter Egg */}
      {showFlyover && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute top-[20%] -left-48 animate-[flyacross_3.5s_linear_forwards] flex items-center gap-3">
            <span className="text-7xl sm:text-9xl filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">
              ✈️
            </span>
            <div className="bg-sky-500 text-white font-black text-sm px-3 py-1 rounded-full shadow-lg">
              AIRBUS A380 • GUDDA AIRLINES
            </div>
          </div>
        </div>
      )}

      {/* Cricket Boundary Blast Easter Egg */}
      {showCricketBlast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-lg shadow-2xl flex items-center gap-3 border-2 border-white">
            <span className="text-3xl">🏏💥</span>
            <span>SKY BOUNDARY MAGIC! CATCH OF THE CENTURY!</span>
          </div>
        </div>
      )}

      {/* Persistent Navigation Bar */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeScreen={activeScreen}
        onNavigate={(scr) => {
          if (scr === 'welcome') {
            setActiveScreen('welcome');
          } else {
            setActiveScreen(scr);
          }
        }}
        onOpenEasterEgg={() => setIsEasterEggOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col">
        {activeScreen === 'welcome' && (
          <WelcomeScreen
            theme={theme}
            nickname={nickname}
            onSetNickname={setNickname}
            onStartQuiz={() => startNewRound()}
            onNavigate={(screen) => setActiveScreen(screen)}
          />
        )}

        {activeScreen === 'quiz' && (
          <QuizScreen
            theme={theme}
            questions={roundQuestions}
            currentQuestionIndex={currentQuestionIndex}
            onAnswerQuestion={handleAnswerQuestion}
            onProceedToNextQuestion={handleNextQuestion}
            onProceedToBaggage={handleProceedToBaggage}
            currentStreak={currentStreak}
          />
        )}

        {activeScreen === 'baggage' && (
          <MysteryBaggage
            theme={theme}
            onComplete={handleCompleteBaggage}
          />
        )}

        {activeScreen === 'results' && (
          <ResultsScreen
            theme={theme}
            nickname={nickname || 'Champion Player'}
            mainScore={scoreResult.mainScore}
            bonusPoints={scoreResult.bonusScore}
            totalPoints={scoreResult.totalPoints}
            durationSeconds={totalRoundDuration || 35}
            gameSessionId={gameSessionId}
            onPlayAgain={() => startNewRound()}
            onNavigateToLeaderboard={() => setActiveScreen('leaderboard')}
          />
        )}

        {activeScreen === 'leaderboard' && (
          <LeaderboardScreen
            theme={theme}
            onPlayQuiz={() => startNewRound()}
            onNavigateHome={() => setActiveScreen('welcome')}
          />
        )}

        {activeScreen === 'minigames' && (
          <MiniGamesHub
            onBack={() => setActiveScreen('welcome')}
            onSelectGame={(gameId) => setActiveScreen(`minigames_${gameId}`)}
          />
        )}

        {activeScreen === 'minigames_catch' && (
          <SpotTheCatch
            onBack={() => setActiveScreen('minigames')}
            onAddBonus={(pts) => setMysteryBaggageBonus((b) => b + pts)}
          />
        )}

        {activeScreen === 'minigames_spotter' && (
          <PlaneSpotter
            onBack={() => setActiveScreen('minigames')}
            onAddBonus={(pts) => setMysteryBaggageBonus((b) => b + pts)}
          />
        )}

        {activeScreen === 'minigames_gudda' && (
          <GuddaAirlinesBuilder
            onBack={() => setActiveScreen('minigames')}
          />
        )}

        {activeScreen === 'minigames_card' && (
          <AdvikTradingCard
            onBack={() => setActiveScreen('minigames')}
          />
        )}

        {activeScreen === 'minigames_sofa' && (
          <LuckySofa
            onBack={() => setActiveScreen('minigames')}
            onAddBonus={(pts) => setMysteryBaggageBonus((b) => b + pts)}
          />
        )}
      </main>

      {/* Secret Easter Egg Terminal Modal */}
      <EasterEggBanner
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
        onTriggerFlyover={triggerFlyoverAnimation}
        onTriggerCricketBlast={triggerCricketBlastAnimation}
      />

      {/* Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        questions={allQuestions}
        onRefreshQuestions={fetchQuestions}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Advik's Pitch &amp; Plane Quiz • Celebrating 12 Years in 2026</span>
          <span className="text-[11px] text-slate-400">
            Airbus A380 &amp; Rohit Sharma Pull Shots • Gudda Airlines Special
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
