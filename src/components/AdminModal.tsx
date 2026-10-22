import React, { useState, useEffect } from 'react';
import { 
  X, Lock, ShieldCheck, Plus, Trash2, CheckCircle2, 
  XCircle, Search, RefreshCw, AlertTriangle, Database, BarChart3
} from 'lucide-react';
import { Question, LeaderboardEntry, QuestionCategory } from '../types/game';
import { soundManager } from '../utils/soundManager';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onRefreshQuestions: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  questions,
  onRefreshQuestions
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<'questions' | 'leaderboard' | 'stats'>('questions');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add question state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQCategory, setNewQCategory] = useState<QuestionCategory>('cricket');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState('');
  const [newQExplanation, setNewQExplanation] = useState('');

  // Leaderboard entries for moderation
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  // Load leaderboard when tab opens
  useEffect(() => {
    if (isAuthenticated && activeTab === 'leaderboard') {
      fetch('/api/leaderboard')
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setLeaderboard(data.leaderboard);
        });
    }
  }, [isAuthenticated, activeTab]);

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'advik2026') {
      soundManager.playAircraftConfirm();
      setIsAuthenticated(true);
      setPinError('');
    } else {
      soundManager.playIncorrect();
      setPinError('Incorrect Admin Passcode. Try "advik2026".');
    }
  };

  // Toggle question enabled state
  const handleToggleEnabled = async (q: Question) => {
    soundManager.playClick();
    try {
      const res = await fetch(`/api/questions/${q.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !q.enabled })
      });
      if (res.ok) {
        onRefreshQuestions();
      }
    } catch {
      // Ignore
    }
  };

  // Delete question
  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    soundManager.playClick();
    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      onRefreshQuestions();
    } catch {
      // Ignore
    }
  };

  // Add question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !newQCorrect.trim() || newQOptions.some((o) => !o.trim())) {
      alert('Please fill out all options and the correct answer');
      return;
    }
    soundManager.playClick();

    const newQuestion: Question = {
      id: `custom_${Date.now()}`,
      text: newQText.trim(),
      category: newQCategory,
      type: 'multiple_choice',
      difficulty: 'medium',
      options: newQOptions.map((o) => o.trim()),
      correctAnswer: newQCorrect.trim(),
      explanation: newQExplanation.trim() || 'Verified admin question for Advik’s quiz.',
      enabled: true,
      tags: ['custom_admin'],
      sourceOrNote: 'Added via Admin Dashboard'
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewQText('');
        setNewQOptions(['', '', '', '']);
        setNewQCorrect('');
        setNewQExplanation('');
        onRefreshQuestions();
      }
    } catch {
      // Ignore
    }
  };

  // Delete leaderboard entry (moderation)
  const handleDeleteLeaderboardEntry = async (id: string) => {
    soundManager.playClick();
    try {
      await fetch(`/api/leaderboard/${id}`, { method: 'DELETE' });
      setLeaderboard((prev) => prev.filter((e) => e.id !== id));
    } catch {
      // Ignore
    }
  };

  // Reset leaderboard
  const handleResetLeaderboard = async () => {
    soundManager.playClick();
    try {
      await fetch('/api/leaderboard/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: 'advik2026' })
      });
      setLeaderboard([]);
      setConfirmReset(false);
    } catch {
      // Ignore
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesCat = filterCat === 'all' || q.category === filterCat;
    const matchesQuery = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const activeCount = questions.filter((q) => q.enabled).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-black text-lg text-slate-100">
                Advik Quiz Owner Console
              </h2>
              <p className="text-xs text-slate-400">
                Repository Management &amp; Leaderboard Moderation
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Barrier if not unlocked */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-100 mb-2">
              Restricted Admin Authentication
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter the administration passcode to manage questions and moderate scores. (Hint: <code className="text-amber-400 font-bold">advik2026</code>)
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Passcode..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-center tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              {pinError && <p className="text-rose-400 text-xs font-semibold">{pinError}</p>}

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
              >
                Unlock Admin Console
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-850 px-4 gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('questions');
                }}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'questions'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Question Bank ({activeCount}/{questions.length} Active)</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('leaderboard');
                }}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'leaderboard'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Leaderboard Moderation</span>
              </button>
            </div>

            {/* TAB 1: QUESTIONS REPOSITORY */}
            {activeTab === 'questions' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <select
                      value={filterCat}
                      onChange={(e) => setFilterCat(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value="all">All Categories</option>
                      <option value="cricket">Cricket</option>
                      <option value="aviation">Aviation</option>
                      <option value="advik_personal">Advik Personal</option>
                      <option value="cricket_aviation_combo">Combo Scenarios</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setShowAddForm(!showAddForm);
                    }}
                    className="py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddForm ? 'Cancel New Question' : 'Add Question'}</span>
                  </button>
                </div>

                {/* Add Question Form Modal */}
                {showAddForm && (
                  <form onSubmit={handleCreateQuestion} className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                      Add New Verified Question to Repository
                    </h4>
                    <div>
                      <input
                        type="text"
                        placeholder="Question text..."
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newQCategory}
                        onChange={(e) => setNewQCategory(e.target.value as any)}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="cricket">Cricket &amp; Preferences</option>
                        <option value="aviation">Commercial Aviation</option>
                        <option value="advik_personal">Advik Likes &amp; Food</option>
                        <option value="cricket_aviation_combo">Combo Scenarios</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Correct Answer (must match one option)..."
                        value={newQCorrect}
                        onChange={(e) => setNewQCorrect(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {newQOptions.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          value={opt}
                          onChange={(e) => {
                            const copy = [...newQOptions];
                            copy[i] = e.target.value;
                            setNewQOptions(copy);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          required
                        />
                      ))}
                    </div>
                    <textarea
                      placeholder="Short explanation/fact..."
                      value={newQExplanation}
                      onChange={(e) => setNewQExplanation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white resize-none h-16"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="py-1.5 px-3 rounded-lg text-xs bg-slate-700 text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-1.5 px-4 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      >
                        Save Question to Database
                      </button>
                    </div>
                  </form>
                )}

                {/* Questions List Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-800">
                    {filteredQuestions.map((q) => (
                      <div
                        key={q.id}
                        className={`p-3.5 flex items-start justify-between gap-3 text-xs ${
                          q.enabled ? 'bg-slate-900/60' : 'bg-slate-900/20 opacity-50'
                        }`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500">{q.id}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 uppercase font-semibold">
                              {q.category}
                            </span>
                            <span className="text-[10px] text-slate-400">• {q.difficulty}</span>
                          </div>
                          <p className="font-semibold text-slate-200 text-sm">{q.text}</p>
                          <p className="text-amber-400 font-medium">Correct: {q.correctAnswer}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleEnabled(q)}
                            className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                              q.enabled
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                            title={q.enabled ? 'Disable Question' : 'Enable Question'}
                          >
                            {q.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{q.enabled ? 'Active' : 'Disabled'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LEADERBOARD MODERATION */}
            {activeTab === 'leaderboard' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">
                      Leaderboard Records ({leaderboard.length} Total Entries)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Remove abusive nicknames, invalid scores, or reset table.
                    </p>
                  </div>

                  {!confirmReset ? (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Reset Leaderboard Data</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-400 font-bold">Confirm Full Reset?</span>
                      <button
                        onClick={handleResetLeaderboard}
                        className="py-1 px-2.5 rounded text-xs font-bold bg-rose-600 text-white"
                      >
                        Yes, Erase All
                      </button>
                      <button
                        onClick={() => setConfirmReset(false)}
                        className="py-1 px-2 rounded text-xs bg-slate-700 text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-800">
                    {leaderboard.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        No leaderboard entries currently recorded.
                      </div>
                    ) : (
                      leaderboard.map((item, i) => (
                        <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-400 w-6 text-center">#{i + 1}</span>
                            <div>
                              <span className="font-bold text-slate-200 block">{item.nickname}</span>
                              <span className="text-[11px] text-slate-400">
                                Accuracy: {item.correctAnswers}/5 • Bonus: +{item.bonusPoints} • Total: {item.totalPoints} PTS
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteLeaderboardEntry(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Remove Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
