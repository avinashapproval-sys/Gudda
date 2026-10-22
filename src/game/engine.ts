import { Question, LeaderboardEntry } from '../types/game';

export type BadgeType = 'Grounded Spectator' | 'First Officer of the Pitch' | 'Captain of the Century';

export function calculateBadge(mainScore: number): BadgeType {
  if (mainScore >= 5) {
    return 'Captain of the Century';
  }
  if (mainScore >= 3) {
    return 'First Officer of the Pitch';
  }
  return 'Grounded Spectator';
}

export interface ScoreCalculationInput {
  isCorrect: boolean;
  powerplayUsed?: boolean;
  timeTakenSeconds?: number;
}

export interface ScoreResult {
  mainScore: number;
  bonusScore: number;
  totalPoints: number;
  maxStreak: number;
}

export function calculateScore(
  answers: ScoreCalculationInput[],
  mysteryBaggageBonus = 0
): ScoreResult {
  let mainScore = 0;
  let bonusScore = mysteryBaggageBonus;
  let currentStreak = 0;
  let maxStreak = 0;

  for (const ans of answers) {
    if (ans.isCorrect) {
      mainScore += 1;
      currentStreak += 1;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }

      // Powerplay bonus: award +100 bonus points
      if (ans.powerplayUsed) {
        bonusScore += 100;
      }

      // Time bonus for fast answers (under 20s time budget)
      if (ans.timeTakenSeconds !== undefined && ans.timeTakenSeconds < 20) {
        const remaining = Math.max(0, 20 - Math.floor(ans.timeTakenSeconds));
        // Up to +100 time bonus (5 pts per second saved)
        bonusScore += Math.min(100, remaining * 5);
      }
    } else {
      currentStreak = 0;
    }
  }

  // Streak bonuses
  if (maxStreak >= 5) {
    bonusScore += 200; // Perfect 5/5 run bonus
  } else if (maxStreak >= 3) {
    bonusScore += 100; // Hat-trick streak bonus
  }

  const totalPoints = (mainScore * 100) + bonusScore;

  return {
    mainScore,
    bonusScore,
    totalPoints,
    maxStreak
  };
}

export function selectRoundQuestions(
  allQuestions: Question[],
  recentIds: string[] = [],
  count = 5
): Question[] {
  const enabled = allQuestions.filter(q => q.enabled);
  if (enabled.length === 0) {
    return [];
  }

  // Filter out recent questions if there are plenty remaining
  let eligible = enabled.filter(q => !recentIds.slice(-20).includes(q.id));
  if (eligible.length < count) {
    // Relax recent restrictions if pool is constrained
    eligible = [...enabled];
  }

  const cricketPool = eligible.filter(q => q.category === 'cricket');
  const aviationPool = eligible.filter(q => q.category === 'aviation');
  const personalPool = eligible.filter(q => q.category === 'advik_personal');
  const otherPool = eligible.filter(q => q.category === 'cricket_aviation_combo');

  const selected: Question[] = [];
  const pickedIds = new Set<string>();

  const pickFrom = (pool: Question[]) => {
    const unpicked = pool.filter(q => !pickedIds.has(q.id));
    if (unpicked.length === 0) return null;
    const item = unpicked[Math.floor(Math.random() * unpicked.length)];
    pickedIds.add(item.id);
    selected.push(item);
    return item;
  };

  // Rule: Aim for at least 1 cricket, 1 aviation, 1 personal question
  pickFrom(cricketPool.length > 0 ? cricketPool : eligible);
  pickFrom(aviationPool.length > 0 ? aviationPool : eligible);
  pickFrom(personalPool.length > 0 ? personalPool : eligible);

  // Fill remaining slots
  while (selected.length < count && pickedIds.size < eligible.length) {
    const remaining = eligible.filter(q => !pickedIds.has(q.id));
    if (remaining.length === 0) break;
    const item = remaining[Math.floor(Math.random() * remaining.length)];
    pickedIds.add(item.id);
    selected.push(item);
  }

  // Fallback if not enough from eligible pool
  if (selected.length < count) {
    const backup = enabled.filter(q => !pickedIds.has(q.id));
    for (const item of backup) {
      if (selected.length >= count) break;
      pickedIds.add(item.id);
      selected.push(item);
    }
  }

  // Shuffle final question order
  return shuffleArray(selected);
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function shuffleOptions(
  options: string[],
  correctAnswer: string
): { shuffledOptions: string[]; newCorrectAnswer: string } {
  // If true/false, preserve standard True / False order
  if (options.length === 2 && options.includes('True') && options.includes('False')) {
    return { shuffledOptions: ['True', 'False'], newCorrectAnswer: correctAnswer };
  }

  const shuffled = shuffleArray(options);
  return {
    shuffledOptions: shuffled,
    newCorrectAnswer: correctAnswer
  };
}

export function applyThirdUmpire(
  options: string[],
  correctAnswer: string
): string[] {
  if (options.length <= 2) {
    return options; // Already 2 or fewer options
  }
  const incorrectOptions = options.filter(opt => opt !== correctAnswer);
  const randomIncorrect = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
  return shuffleArray([correctAnswer, randomIncorrect]);
}

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    // 1. Total points descending
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    // 2. Main correct answers descending
    if (b.correctAnswers !== a.correctAnswers) {
      return b.correctAnswers - a.correctAnswers;
    }
    // 3. Duration ascending (faster is better)
    if (a.durationSeconds !== b.durationSeconds) {
      return a.durationSeconds - b.durationSeconds;
    }
    // 4. Timestamp ascending (earlier record achieved first)
    return a.timestamp - b.timestamp;
  });
}
