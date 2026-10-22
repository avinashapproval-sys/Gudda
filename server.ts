import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { BUNDLED_QUESTIONS } from './src/data/bundledQuestions';
import { Question, LeaderboardEntry } from './src/types/game';
import { sortLeaderboard, calculateBadge } from './src/game/engine';

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Initialize database files if not present
let questionsCache: Question[] = [];
if (fs.existsSync(QUESTIONS_FILE)) {
  try {
    questionsCache = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));
  } catch {
    questionsCache = [...BUNDLED_QUESTIONS];
  }
} else {
  questionsCache = [...BUNDLED_QUESTIONS];
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questionsCache, null, 2));
}

let leaderboardCache: LeaderboardEntry[] = [];
if (fs.existsSync(LEADERBOARD_FILE)) {
  try {
    leaderboardCache = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf-8'));
  } catch {
    leaderboardCache = [];
  }
} else {
  // Seed sample initial top scores celebrating Advik's circle
  leaderboardCache = [
    {
      id: 'init_1',
      gameSessionId: 'sess_init1',
      nickname: 'Hitman_PullShot',
      correctAnswers: 5,
      mainScore: 5,
      bonusPoints: 350,
      totalPoints: 850,
      badge: 'Captain of the Century',
      durationSeconds: 28,
      timestamp: Date.now() - 3600000 * 24
    },
    {
      id: 'init_2',
      gameSessionId: 'sess_init2',
      nickname: 'A380_Spotter',
      correctAnswers: 5,
      mainScore: 5,
      bonusPoints: 280,
      totalPoints: 780,
      badge: 'Captain of the Century',
      durationSeconds: 34,
      timestamp: Date.now() - 3600000 * 12
    },
    {
      id: 'init_3',
      gameSessionId: 'sess_init3',
      nickname: 'SwissAlps_Flyer',
      correctAnswers: 4,
      mainScore: 4,
      bonusPoints: 210,
      totalPoints: 610,
      badge: 'First Officer of the Pitch',
      durationSeconds: 42,
      timestamp: Date.now() - 3600000 * 6
    },
    {
      id: 'init_4',
      gameSessionId: 'sess_init4',
      nickname: 'WhiteSaucePenne',
      correctAnswers: 4,
      mainScore: 4,
      bonusPoints: 180,
      totalPoints: 580,
      badge: 'First Officer of the Pitch',
      durationSeconds: 39,
      timestamp: Date.now() - 3600000 * 2
    }
  ];
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboardCache, null, 2));
}

function saveQuestions() {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questionsCache, null, 2));
}

function saveLeaderboard() {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboardCache, null, 2));
}

// ================= API ROUTES =================

// 1. Get Questions
app.get('/api/questions', (_req: Request, res: Response) => {
  res.json({ success: true, questions: questionsCache });
});

// 2. Add Question (Admin)
app.post('/api/questions', (req: Request, res: Response) => {
  const newQ: Question = req.body;
  if (!newQ.text || !newQ.correctAnswer || !newQ.options || newQ.options.length < 2) {
    return res.status(400).json({ success: false, error: 'Invalid question payload' });
  }
  newQ.id = newQ.id || `custom_${Date.now()}`;
  questionsCache.unshift(newQ);
  saveQuestions();
  res.json({ success: true, question: newQ });
});

// 3. Update Question (Admin)
app.put('/api/questions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = questionsCache.findIndex(q => q.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Question not found' });
  }
  questionsCache[index] = { ...questionsCache[index], ...req.body };
  saveQuestions();
  res.json({ success: true, question: questionsCache[index] });
});

// 4. Delete Question (Admin)
app.delete('/api/questions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  questionsCache = questionsCache.filter(q => q.id !== id);
  saveQuestions();
  res.json({ success: true, id });
});

// 5. Get Leaderboard
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  const sorted = sortLeaderboard(leaderboardCache);
  res.json({ success: true, leaderboard: sorted });
});

// 6. Submit Score
app.post('/api/leaderboard', (req: Request, res: Response) => {
  const {
    nickname,
    correctAnswers,
    mainScore,
    bonusPoints,
    totalPoints,
    gameSessionId,
    durationSeconds
  } = req.body;

  // Sanitization and limits
  const cleanNickname = (nickname || 'Anonymous Player').trim().substring(0, 20);
  if (!cleanNickname) {
    return res.status(400).json({ success: false, error: 'Nickname cannot be empty' });
  }

  // Prevent duplicate accidental submissions from the same session
  if (gameSessionId) {
    const existing = leaderboardCache.find(e => e.gameSessionId === gameSessionId);
    if (existing) {
      return res.json({ success: true, entry: existing, duplicate: true });
    }
  }

  const validMainScore = Math.max(0, Math.min(5, Number(mainScore) || 0));
  const validBonus = Math.max(0, Number(bonusPoints) || 0);
  const calculatedTotal = (validMainScore * 100) + validBonus;
  const badge = calculateBadge(validMainScore);

  const entry: LeaderboardEntry = {
    id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    gameSessionId: gameSessionId || `sess_${Date.now()}`,
    nickname: cleanNickname,
    correctAnswers: validMainScore,
    mainScore: validMainScore,
    bonusPoints: validBonus,
    totalPoints: calculatedTotal,
    badge,
    durationSeconds: Math.max(5, Number(durationSeconds) || 30),
    timestamp: Date.now()
  };

  leaderboardCache.push(entry);
  saveLeaderboard();

  const sorted = sortLeaderboard(leaderboardCache);
  const rank = sorted.findIndex(e => e.id === entry.id) + 1;

  res.json({ success: true, entry, rank });
});

// 7. Delete Leaderboard Entry (Admin moderation)
app.delete('/api/leaderboard/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  leaderboardCache = leaderboardCache.filter(e => e.id !== id);
  saveLeaderboard();
  res.json({ success: true, id });
});

// 8. Reset Leaderboard (Admin)
app.post('/api/leaderboard/reset', (req: Request, res: Response) => {
  const { adminSecret } = req.body;
  if (adminSecret !== 'advik2026') {
    return res.status(403).json({ success: false, error: 'Unauthorized reset request' });
  }
  leaderboardCache = [];
  saveLeaderboard();
  res.json({ success: true, message: 'Leaderboard reset successfully' });
});

// 9. Stats endpoint
app.get('/api/stats', (_req: Request, res: Response) => {
  const totalEntries = leaderboardCache.length;
  const avgScore = totalEntries > 0
    ? (leaderboardCache.reduce((acc, curr) => acc + curr.mainScore, 0) / totalEntries).toFixed(1)
    : '0';
  const perfectRuns = leaderboardCache.filter(e => e.mainScore === 5).length;
  const activeQuestions = questionsCache.filter(q => q.enabled).length;

  res.json({
    success: true,
    stats: {
      totalEntries,
      avgScore,
      perfectRuns,
      activeQuestions,
      totalQuestions: questionsCache.length
    }
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Advik Pitch & Plane Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
