import React from 'react';
import { ArrowLeft, ChevronRight, Gamepad2, Sparkles, Plane, Shield, Award, Tv } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface MiniGamesHubProps {
  onBack: () => void;
  onSelectGame: (game: string) => void;
}

export const MiniGamesHub: React.FC<MiniGamesHubProps> = ({ onBack, onSelectGame }) => {
  const games = [
    {
      id: 'catch',
      title: 'Spot the Catch: Barbados 2024',
      badge: 'Reaction Challenge',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      icon: '🏏',
      desc: 'Recreate Suryakumar Yadav’s legendary 2024 T20 World Cup final boundary catch! Tap precisely on the rope.',
      bonus: '+150 Bonus PTS'
    },
    {
      id: 'spotter',
      title: 'Advik’s Plane Spotter Radar',
      badge: 'Aviation Knowledge',
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      icon: '✈️',
      desc: 'Identify clean aircraft silhouettes including the Airbus A380, Boeing 787, 747, and A350 with engineering trivia.',
      bonus: '+100 PTS per plane'
    },
    {
      id: 'gudda',
      title: 'Build Your Gudda Airlines Fleet',
      badge: 'Interactive Creator',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      icon: '🎫',
      desc: 'Customize livery colors, aircraft type, Swiss & Dubai routes, and in-flight pasta meals. Download custom airline card!',
      bonus: 'Collectible Download'
    },
    {
      id: 'card',
      title: 'Advik 12th Year Trading Card',
      badge: 'Holographic Collectible',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: '🌟',
      desc: 'Interactive 3D tilt cricket & aviation sports card featuring Advik’s 99 Pull Shot & 100 Pasta Appetite stats.',
      bonus: 'High-Res PNG Card'
    },
    {
      id: 'sofa',
      title: 'The Lucky Sofa: TV Off Survivor',
      badge: 'Easter Egg Gag',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      icon: '📺',
      desc: 'Master Advik’s famous nerve-saving habit: switch off the television when the cricket match is nail-bitingly close!',
      bonus: '+100 PTS + Achievement'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <button
        onClick={() => {
          soundManager.playClick();
          onBack();
        }}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide mb-3">
          <Gamepad2 className="w-4 h-4 text-amber-400" />
          BONUS EXPERIENCES &amp; COLLECTIBLES
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight mb-2">
          Advik's Mini-Games Pavilion
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Take a break from the 5-ball quiz with interactive cricket reactions, aircraft identification, and custom airline card generators!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              soundManager.playClick();
              onSelectGame(g.id);
            }}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-850 text-left transition-all duration-300 shadow-xl group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  {g.icon}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${g.badgeColor}`}>
                  {g.badge}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors mb-2">
                {g.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                {g.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>{g.bonus}</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Play Experience</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
