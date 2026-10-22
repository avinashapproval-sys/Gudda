import React, { useState } from 'react';
import { X, Sparkles, Send, Plane } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundManager';

interface EasterEggBannerProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerFlyover: () => void;
  onTriggerCricketBlast: () => void;
}

export const EasterEggBanner: React.FC<EasterEggBannerProps> = ({
  isOpen,
  onClose,
  onTriggerFlyover,
  onTriggerCricketBlast
}) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();

    if (clean === 'SKY') {
      soundManager.playCrowdCheer();
      confetti({
        particleCount: 120,
        spread: 90,
        colors: ['#0284c7', '#f59e0b', '#10b981']
      });
      onTriggerCricketBlast();
      setMessage('🏏 SURYAKUMAR YADAV CELEBRATION ACTIVATED! That 2024 final boundary catch was pure poetry!');
    } else if (clean === 'A380') {
      soundManager.playJetFlyover();
      onTriggerFlyover();
      setMessage('✈️ SUPERJUMBO AIRBUS A380 FLYOVER INITIATED! 4 Trent 900 engines roaring at 35,000 feet!');
    } else if (clean === 'RO-KO' || clean === 'ROKO') {
      soundManager.playCorrect();
      confetti({ particleCount: 70, spread: 80 });
      setMessage('👑 RO-KO SUPREMACY! Rohit Sharma & Virat Kohli taking the bowling attack apart!');
    } else if (clean === 'GUDDA') {
      soundManager.playStartup();
      setMessage('✈️ GUDDA AIRLINES FIRST CLASS: White sauce penne pasta & Sprite now being served!');
    } else {
      soundManager.playIncorrect();
      setMessage('Code unrecognized. Try entering "SKY", "A380", or "RO-KO"!');
    }
    setCode('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative text-left">
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-100 text-base">Secret Easter Egg Terminal</h3>
            <p className="text-[11px] text-slate-400">Discover hidden Pitch &amp; Plane animations</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Type secret keywords inspired by Advik's world: Try <strong className="text-purple-300 font-mono">SKY</strong>, <strong className="text-purple-300 font-mono">A380</strong>, or <strong className="text-purple-300 font-mono">RO-KO</strong>!
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Type code here..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            autoFocus
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Launch</span>
          </button>
        </form>

        {message && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
