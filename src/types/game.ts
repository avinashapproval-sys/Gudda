export type QuestionCategory = 
  | 'cricket'
  | 'aviation'
  | 'advik_personal'
  | 'cricket_aviation_combo';

export type QuestionType = 'multiple_choice' | 'true_false' | 'scenario';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  type: QuestionType;
  difficulty: Difficulty;
  options: string[];
  correctAnswer: string;
  explanation: string;
  enabled: boolean;
  tags: string[];
  sourceOrNote: string;
  hint?: string;
}

export interface RoundAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  powerplayUsed?: boolean;
  timeTakenSeconds: number;
}

export interface LeaderboardEntry {
  id: string;
  gameSessionId: string;
  nickname: string;
  correctAnswers: number;
  mainScore: number;
  bonusPoints: number;
  bonusScore?: number;
  totalPoints: number;
  badge: 'Grounded Spectator' | 'First Officer of the Pitch' | 'Captain of the Century';
  durationSeconds: number;
  timestamp: number;
  isLocalOnly?: boolean;
}

export type ThemeMode = 'sky' | 'stadium';

export interface MysteryBaggageOutcome {
  id: string;
  name: string;
  bonusScore: number;
  advikFact?: string;
  message: string;
  type: 'small_bonus' | 'large_bonus' | 'fact' | 'humour' | 'no_bonus';
}

export interface AirlineCardConfig {
  airlineName: string;
  aircraftType: 'Airbus A380' | 'Boeing 787 Dreamliner';
  liveryColor: string;
  liveryName: string;
  destination: 'Switzerland (Zurich)' | 'Dubai (Burj Khalifa View)' | 'London Heathrow' | 'Mumbai Chhatrapati Shivaji';
  departure: string;
  inFlightMeal: string;
  flightNumber: string;
  seat: string;
}
