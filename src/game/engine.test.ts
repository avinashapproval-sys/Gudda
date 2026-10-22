import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBadge,
  calculateScore,
  selectRoundQuestions,
  shuffleOptions,
  applyThirdUmpire,
  sortLeaderboard
} from './engine';
import { BUNDLED_QUESTIONS } from '../data/bundledQuestions';
import { LeaderboardEntry } from '../types/game';

test('Badge calculation meets specification boundaries', () => {
  assert.equal(calculateBadge(0), 'Grounded Spectator');
  assert.equal(calculateBadge(1), 'Grounded Spectator');
  assert.equal(calculateBadge(2), 'Grounded Spectator');
  assert.equal(calculateBadge(3), 'First Officer of the Pitch');
  assert.equal(calculateBadge(4), 'First Officer of the Pitch');
  assert.equal(calculateBadge(5), 'Captain of the Century');
});

test('Score calculation correctly computes main score and distinct bonus points', () => {
  // 5 correct answers with powerplay on question 1, fast responses
  const answers = [
    { isCorrect: true, powerplayUsed: true, timeTakenSeconds: 5 },
    { isCorrect: true, powerplayUsed: false, timeTakenSeconds: 6 },
    { isCorrect: true, powerplayUsed: false, timeTakenSeconds: 4 },
    { isCorrect: true, powerplayUsed: false, timeTakenSeconds: 10 },
    { isCorrect: true, powerplayUsed: false, timeTakenSeconds: 2 }
  ];

  const result = calculateScore(answers, 150); // 150 baggage bonus
  assert.equal(result.mainScore, 5, 'Main score must strictly be 5');
  assert.equal(result.maxStreak, 5, 'Streak should be 5');
  assert.ok(result.bonusScore > 150, 'Bonus score must include powerplay and time bonus');
  assert.equal(result.totalPoints, (5 * 100) + result.bonusScore);
});

test('Question repository contains at least 80 unique, verified questions with 20+ per category', () => {
  assert.ok(BUNDLED_QUESTIONS.length >= 80, `Expected >= 80 questions, found ${BUNDLED_QUESTIONS.length}`);
  
  const idSet = new Set<string>();
  for (const q of BUNDLED_QUESTIONS) {
    assert.ok(q.id, 'Question must have unique ID');
    assert.ok(!idSet.has(q.id), `Duplicate question ID found: ${q.id}`);
    idSet.add(q.id);
    assert.ok(q.text.length > 5, 'Question text must not be empty');
    assert.ok(q.options.includes(q.correctAnswer), `Options must include correct answer for ${q.id}`);
    assert.ok(q.explanation.length > 5, 'Explanation must be provided');
    assert.ok(q.enabled === true, 'Bundled question should be enabled');
  }

  const cricket = BUNDLED_QUESTIONS.filter(q => q.category === 'cricket').length;
  const aviation = BUNDLED_QUESTIONS.filter(q => q.category === 'aviation').length;
  const personal = BUNDLED_QUESTIONS.filter(q => q.category === 'advik_personal').length;
  const combo = BUNDLED_QUESTIONS.filter(q => q.category === 'cricket_aviation_combo').length;

  assert.ok(cricket >= 20, `Cricket count ${cricket} must be >= 20`);
  assert.ok(aviation >= 20, `Aviation count ${aviation} must be >= 20`);
  assert.ok(personal >= 20, `Personal count ${personal} must be >= 20`);
  assert.ok(combo >= 20, `Combo count ${combo} must be >= 20`);
});

test('selectRoundQuestions selects 5 non-repeating questions with category mix', () => {
  const round = selectRoundQuestions(BUNDLED_QUESTIONS, [], 5);
  assert.equal(round.length, 5, 'Round must have exactly 5 questions');
  
  const ids = round.map(q => q.id);
  const uniqueIds = new Set(ids);
  assert.equal(uniqueIds.size, 5, 'No duplicate questions within the same round');

  const categories = new Set(round.map(q => q.category));
  assert.ok(categories.size >= 3, 'Round should have category variety');
});

test('Third Umpire lifeline reduces options to exactly 2 including the correct answer', () => {
  const options = ['Option A', 'Option B', 'Option C', 'Option D'];
  const correct = 'Option B';
  const reduced = applyThirdUmpire(options, correct);
  
  assert.equal(reduced.length, 2, 'Third Umpire should leave exactly 2 options');
  assert.ok(reduced.includes(correct), 'Reduced options must contain the correct answer');
});

test('Option shuffling preserves the correct answer string value', () => {
  const options = ['Sachin Tendulkar', 'Rohit Sharma', 'Virat Kohli', 'MS Dhoni'];
  const correct = 'Sachin Tendulkar';
  const { shuffledOptions, newCorrectAnswer } = shuffleOptions(options, correct);
  
  assert.equal(shuffledOptions.length, 4);
  assert.equal(newCorrectAnswer, correct);
  assert.ok(shuffledOptions.includes(correct));
});

test('Leaderboard sorting applies multi-tier tie-breaking rules', () => {
  const entries: LeaderboardEntry[] = [
    {
      id: '1',
      gameSessionId: 's1',
      nickname: 'Alpha',
      correctAnswers: 4,
      mainScore: 4,
      bonusPoints: 100,
      totalPoints: 500,
      badge: 'First Officer of the Pitch',
      durationSeconds: 45,
      timestamp: 1000
    },
    {
      id: '2',
      gameSessionId: 's2',
      nickname: 'Bravo',
      correctAnswers: 5,
      mainScore: 5,
      bonusPoints: 200,
      totalPoints: 700,
      badge: 'Captain of the Century',
      durationSeconds: 50,
      timestamp: 2000
    },
    {
      id: '3',
      gameSessionId: 's3',
      nickname: 'Charlie',
      correctAnswers: 5,
      mainScore: 5,
      bonusPoints: 200,
      totalPoints: 700,
      badge: 'Captain of the Century',
      durationSeconds: 30, // Faster than Bravo with same points
      timestamp: 3000
    }
  ];

  const sorted = sortLeaderboard(entries);
  assert.equal(sorted[0].nickname, 'Charlie', 'Charlie has highest score and faster duration than Bravo');
  assert.equal(sorted[1].nickname, 'Bravo');
  assert.equal(sorted[2].nickname, 'Alpha');
});
