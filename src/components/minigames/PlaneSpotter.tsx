import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Info, Plane, RotateCcw } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface PlaneSpotterProps {
  onBack: () => void;
  onAddBonus?: (points: number) => void;
}

interface AircraftPuzzle {
  id: string;
  name: string;
  keyFeatures: string[];
  options: string[];
  svgArt: string;
  trivia: string;
  advikNote: string;
}

const AIRCRAFT_PUZZLES: AircraftPuzzle[] = [
  {
    id: 'a380',
    name: 'Airbus A380',
    keyFeatures: ['Full-length double-deck passenger windows', '4 heavy turbofan engines', 'Massive 79.8m wingspan with wingtip fences'],
    options: ['Airbus A380', 'Boeing 747-8', 'Airbus A350', 'Boeing 777X'],
    svgArt: 'M 10 75 Q 80 40 180 35 L 420 35 Q 520 40 590 75 L 590 100 Q 520 115 420 115 L 180 115 Q 80 110 10 85 Z',
    trivia: 'The superjumbo A380 is the world’s largest commercial passenger jet, cruising with up to 525 passengers across two full decks.',
    advikNote: 'Advik’s #1 favourite aircraft! He admires its magnificent presence and dreams of relaxing in an A380 first-class suite.'
  },
  {
    id: 'b787',
    name: 'Boeing 787 Dreamliner',
    keyFeatures: ['Scalloped chevron tooth engine nacelles', 'Swept raked wingtips with extreme aerodynamic flex', 'Streamlined nose with smooth continuous glass cockpit windows'],
    options: ['Boeing 787 Dreamliner', 'Airbus A330neo', 'Boeing 767', 'Airbus A321XLR'],
    svgArt: 'M 20 80 Q 90 55 200 50 L 450 50 Q 530 55 580 80 L 580 95 Q 530 105 450 105 L 200 105 Q 90 100 20 85 Z',
    trivia: 'Over 50% composite carbon fiber construction with electronic dimmable passenger windows and 6,000 ft cabin pressurization altitude.',
    advikNote: 'Another of Advik’s favourite widebodies! He loves spotting Korean Air and Air India 787s landing smoothly.'
  },
  {
    id: 'b747',
    name: 'Boeing 747 "Queen of the Skies"',
    keyFeatures: ['Iconic upper-deck raised bubble hump behind the cockpit', '4 engines mounted under sweeping 37.5-degree wings', 'Classic wide forward main deck'],
    options: ['Boeing 747', 'Airbus A340', 'Boeing 777', 'McDonnell Douglas DC-10'],
    svgArt: 'M 10 90 Q 70 75 120 50 L 220 50 Q 250 55 280 75 L 460 75 Q 520 80 570 90 L 570 110 Q 510 115 460 115 L 120 115 Q 70 110 10 95 Z',
    trivia: 'Introduced in 1970, the 747 revolutionized long-haul intercontinental flight and held the passenger capacity record for 37 years.',
    advikNote: 'Advik respects the 747’s legendary royal legacy, easily distinguishing its unmistakable hump profile from distance!'
  },
  {
    id: 'a350',
    name: 'Airbus A350 XWB',
    keyFeatures: ['Distinctive black "raccoon mask" around the windshield', 'Graceful upwardly curled sharklet wingtips', 'Super-quiet Rolls-Royce Trent XWB twin engines'],
    options: ['Airbus A350', 'Boeing 777-300ER', 'Airbus A330', 'Boeing 787-9'],
    svgArt: 'M 20 80 Q 90 52 210 48 L 470 48 Q 530 52 580 80 L 580 98 Q 530 108 470 108 L 210 108 Q 90 102 20 86 Z',
    trivia: 'Features an intelligent composite wing design that adapts its aerodynamic camber in real time during flight for maximum fuel efficiency.',
    advikNote: 'Advik loves watching new Air India A350 deliveries featured on YouTube plane spotting channels!'
  }
];

export const PlaneSpotter: React.FC<PlaneSpotterProps> = ({ onBack, onAddBonus }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);

  const currentPuzzle = AIRCRAFT_PUZZLES[currentIndex];
  const isAnswered = selectedGuess !== null;

  const handleGuess = (opt: string) => {
    if (isAnswered) return;
    setSelectedGuess(opt);

    if (opt === currentPuzzle.name) {
      soundManager.playAircraftConfirm();
      setScore((s) => s + 100);
      if (onAddBonus) onAddBonus(100);
    } else {
      soundManager.playIncorrect();
    }
  };

  const handleNext = () => {
    soundManager.playClick();
    setSelectedGuess(null);
    setCurrentIndex((i) => (i + 1) % AIRCRAFT_PUZZLES.length);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <button
        onClick={() => {
          soundManager.playClick();
          onBack();
        }}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Mini-Games Hub</span>
      </button>

      <div className="text-center mb-8">
        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 uppercase tracking-wider">
          ✈️ AVIATION SPOTTER CHALLENGE
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight mt-2 mb-2">
          Advik's Plane Spotter Radar
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Identify the aircraft from its profile and spotter characteristics. Can you match Advik's keen aviation eye?
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Aircraft Silhouette Box */}
        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 mb-6 text-center">
          <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest block mb-4">
            RADAR PROFILE #{currentIndex + 1} OF {AIRCRAFT_PUZZLES.length}
          </span>

          {/* SVG Silhouette Profile */}
          <div className="w-full max-w-md mx-auto h-32 flex items-center justify-center relative">
            <svg viewBox="0 0 600 160" className="w-full h-full text-sky-400 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
              {/* Silhouette Body */}
              <path
                d={currentPuzzle.svgArt}
                fill="currentColor"
                opacity="0.85"
              />
              {/* Wing Marker */}
              <path
                d="M 280 60 L 420 15 L 435 15 L 360 60 Z"
                fill="#38bdf8"
                opacity="0.9"
              />
              {/* Engine Nacelles */}
              <circle cx="340" cy="70" r="10" fill="#f59e0b" />
              {currentPuzzle.id === 'a380' || currentPuzzle.id === 'b747' ? (
                <circle cx="380" cy="75" r="9" fill="#f59e0b" />
              ) : null}
            </svg>
          </div>

          {/* Visual Clues */}
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
            {currentPuzzle.keyFeatures.map((feat, i) => (
              <div key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                <span className="text-sky-400 font-bold">•</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Guess Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {currentPuzzle.options.map((opt) => {
            const isCorrect = opt === currentPuzzle.name;
            const isChosen = selectedGuess === opt;

            let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-sky-400 hover:bg-slate-800';

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
              } else if (isChosen) {
                btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold';
              } else {
                btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-600';
              }
            }

            return (
              <button
                key={opt}
                disabled={isAnswered}
                onClick={() => handleGuess(opt)}
                className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && (
                  <div>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {!isCorrect && isChosen && <XCircle className="w-5 h-5 text-rose-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {isAnswered && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm animate-in fade-in duration-200 mb-6">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Aviation Fact Sheet: {currentPuzzle.name}</span>
            </h4>
            <p className="text-slate-300 mb-3">{currentPuzzle.trivia}</p>
            <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-xs text-sky-200">
              <span className="font-bold text-sky-400">Advik's Take: </span>
              {currentPuzzle.advikNote}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="py-2.5 px-5 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white flex items-center gap-2 shadow-md transition-all"
              >
                <span>Next Aircraft Silhouette</span>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Spotter Score */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Advik's Verified Spotting Index</span>
          <span className="font-mono font-bold text-sky-400 text-sm">{score} PTS EARNED</span>
        </div>
      </div>
    </div>
  );
};
