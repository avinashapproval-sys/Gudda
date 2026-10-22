import React, { useState } from 'react';
import { Sparkles, Luggage, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { ThemeMode, MysteryBaggageOutcome } from '../types/game';
import { soundManager } from '../utils/soundManager';

interface MysteryBaggageProps {
  theme: ThemeMode;
  onComplete: (outcome: MysteryBaggageOutcome) => void;
}

const OUTCOMES: MysteryBaggageOutcome[] = [
  {
    id: 'out_1',
    name: 'Gudda Airlines First-Class Amenity Kit',
    bonusScore: 250,
    message: 'Golden Tag Unlocked! An ultra-luxurious Gudda Airlines amenity kit loaded with flight perks!',
    type: 'large_bonus'
  },
  {
    id: 'out_2',
    name: 'Advik’s Match-Winning Willow Bat',
    bonusScore: 200,
    advikFact: 'Advik’s superpower of hitting 120-metre sixes on command powers this kit!',
    message: 'Crack of the bat! Advik’s pull-shot willow earns you hefty boundary points.',
    type: 'large_bonus'
  },
  {
    id: 'out_3',
    name: 'Extra White Sauce Pasta Galley Box',
    bonusScore: 150,
    advikFact: 'Advik’s favourite meal is chicken penne pasta in creamy white sauce!',
    message: 'The in-flight chefs packaged hot pasta just for you! Delicious bonus!',
    type: 'fact'
  },
  {
    id: 'out_4',
    name: 'Domino’s Choco Lava Secret Compartment',
    bonusScore: 120,
    advikFact: 'Advik will always pick Domino’s Choco Lava cake as his favourite dessert.',
    message: 'Warm, gooey molten chocolate discovered inside the thermal luggage lining!',
    type: 'fact'
  },
  {
    id: 'out_5',
    name: 'Advik’s Lucky Remote Control',
    bonusScore: 100,
    advikFact: 'When cricket matches get too close for comfort, Advik turns off the television!',
    message: 'One click of the power button avoids nail-biting stress and secures your bonus!',
    type: 'humour'
  },
  {
    id: 'out_6',
    name: 'Airport Security Hand-Luggage Inspection',
    bonusScore: 0,
    message: 'Advik’s extra supply of soft buns with butter passed security, but no bonus points were found this round!',
    type: 'no_bonus'
  }
];

export const MysteryBaggage: React.FC<MysteryBaggageProps> = ({
  theme,
  onComplete
}) => {
  const [selectedBagIndex, setSelectedBagIndex] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<MysteryBaggageOutcome | null>(null);
  const isSky = theme === 'sky';

  const bags = [
    {
      id: 'aviation_bag',
      title: 'Aviation Pilot Case',
      icon: '✈️',
      desc: 'Heavy-duty crew roller bag from Korean Air tarmac',
      color: 'from-sky-600 to-blue-800'
    },
    {
      id: 'cricket_bag',
      title: 'Cricket Kit Bag',
      icon: '🏏',
      desc: 'Filled with pads, batting gloves, and Rohit Sharma stickers',
      color: 'from-emerald-600 to-teal-800'
    },
    {
      id: 'mystery_bag',
      title: 'Gudda Mystery Duffle',
      icon: '🧳',
      desc: 'First-class monogrammed suite luggage',
      color: 'from-purple-600 to-indigo-800'
    }
  ];

  const handlePickBag = (idx: number) => {
    if (selectedBagIndex !== null) return; // Prevent repeated claims

    setSelectedBagIndex(idx);
    soundManager.playBagOpen();

    // Select random outcome from configured bounded list
    const randomOutcome = OUTCOMES[Math.floor(Math.random() * OUTCOMES.length)];
    setOutcome(randomOutcome);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide mb-4">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        BONUS ROUND • CHOOSE YOUR LUGGAGE
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight mb-3">
        Advik's Mystery Baggage
      </h1>
      <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
        The 5-ball innings is complete! Baggage reclaim is now open. Pick one piece of luggage to reveal bonus points, funny Advik facts, or special surprises!
      </p>

      {/* 3 Bags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {bags.map((bag, i) => {
          const isSelected = selectedBagIndex === i;
          const isDimmed = selectedBagIndex !== null && !isSelected;

          return (
            <button
              key={bag.id}
              disabled={selectedBagIndex !== null}
              onClick={() => handlePickBag(i)}
              className={`p-6 rounded-2xl border text-left transition-all duration-300 transform relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-800 border-amber-400 ring-4 ring-amber-400/30 scale-105 shadow-2xl'
                  : isDimmed
                  ? 'bg-slate-900/40 border-slate-800 opacity-40 cursor-not-allowed'
                  : 'bg-slate-800/80 border-slate-700/80 hover:border-amber-400/60 hover:-translate-y-1.5 shadow-lg'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bag.color} flex items-center justify-center text-3xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                {bag.icon}
              </div>

              <h3 className="font-extrabold text-base text-slate-100 group-hover:text-amber-300 mb-1">
                {bag.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {bag.desc}
              </p>

              {selectedBagIndex === null && (
                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>UNZIP TO REVEAL</span>
                  <Luggage className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Outcome Reveal Box */}
      {outcome && (
        <div className={`p-6 sm:p-8 rounded-2xl border max-w-xl mx-auto text-left shadow-2xl animate-in zoom-in-95 duration-300 ${
          outcome.bonusScore > 0
            ? 'bg-slate-800/90 border-amber-400/50 shadow-amber-950/40'
            : 'bg-slate-800/90 border-slate-700 shadow-slate-950/40'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Luggage Contents Revealed
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
              outcome.bonusScore > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
            }`}>
              {outcome.bonusScore > 0 ? `+${outcome.bonusScore} BONUS PTS` : 'NO BONUS'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-100 mb-2">
            {outcome.name}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {outcome.message}
          </p>

          {outcome.advikFact && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-amber-200 mb-6">
              <span className="font-bold text-amber-400 block mb-0.5">⭐ Advik Fact Check:</span>
              <p>{outcome.advikFact}</p>
            </div>
          )}

          <button
            onClick={() => {
              soundManager.playBoardingChime();
              onComplete(outcome);
            }}
            className={`w-full py-3.5 px-6 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              isSky
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white'
            }`}
          >
            <span>Proceed to Results &amp; Boarding Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
