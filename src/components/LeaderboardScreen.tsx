import React, { useState, useEffect } from 'react';
import { Trophy, Search, RefreshCw, Play, ShieldAlert, Award, Clock, ArrowLeft } from 'lucide-react';
import { LeaderboardEntry, ThemeMode } from '../types/game';
import { sortLeaderboard } from '../game/engine';
import { soundManager } from '../utils/soundManager';

interface LeaderboardScreenProps {
  theme: ThemeMode;
  onPlayQuiz: () => void;
  onNavigateHome: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  theme,
  onPlayQuiz,
  onNavigateHome
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const isSky = theme === 'sky';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        let onlineList: LeaderboardEntry[] = data.success ? data.leaderboard : [];

        // Check if there are local offline scores stored on this device
        try {
          const localStored = JSON.parse(localStorage.getItem('advik_local_leaderboard') || '[]');
          if (Array.isArray(localStored) && localStored.length > 0) {
            onlineList = [...onlineList, ...localStored];
          }
        } catch {
          // Ignore parse errors
        }

        const sorted = sortLeaderboard(onlineList);
        setEntries(sorted);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        // Offline fallback
        try {
          const localStored = JSON.parse(localStorage.getItem('advik_local_leaderboard') || '[]');
          setEntries(sortLeaderboard(localStored));
        } catch {
          setEntries([]);
        }
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filtered = entries.filter((e) =>
    e.nickname.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigateHome();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-amber-400" />
            Shared Hall of Fame
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official rankings across all devices for Advik's Pitch &amp; Plane Quiz
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setRefreshKey((k) => k + 1);
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              soundManager.playStartup();
              onPlayQuiz();
            }}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all ${
              isSky
                ? 'bg-sky-500 hover:bg-sky-400 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play Innings</span>
          </button>
        </div>
      </div>

      {/* Filter and Rules Legend */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search player nickname..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-3">
          <span>Tie-break rule: Total Pts &gt; Accuracy &gt; Faster Time</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl bg-slate-850">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/90 border-b border-slate-700 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4 text-center">Accuracy</th>
                <th className="py-3 px-4 text-center">Bonus</th>
                <th className="py-3 px-4 text-center">Total Points</th>
                <th className="py-3 px-4">Badge</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    Fetching current flight telemetry &amp; scorebook...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No scores found matching "{filterQuery}". Step onto the pitch and be the first!
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;

                  let rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-slate-800 font-mono text-xs flex items-center justify-center font-bold text-slate-400">
                      {rank}
                    </span>
                  );

                  if (rank === 1) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/20">
                        🥇
                      </span>
                    );
                  } else if (rank === 2) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                        🥈
                      </span>
                    );
                  } else if (rank === 3) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                        🥉
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isTop3 ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      <td className="py-3 px-4">{rankBadge}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span>{item.nickname}</span>
                          {item.isLocalOnly && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-normal">
                              Local Device
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                        {item.correctAnswers} / 5
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-400">
                        +{item.bonusPoints}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-sky-400">
                        {item.totalPoints}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold ${
                          item.badge === 'Captain of the Century'
                            ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                            : item.badge === 'First Officer of the Pitch'
                            ? 'bg-sky-400/15 text-sky-300 border border-sky-400/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {item.badge}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-xs">
                        {item.durationSeconds}s
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
