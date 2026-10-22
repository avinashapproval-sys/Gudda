import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Sparkles, Plane, Utensils, MapPin, Palette } from 'lucide-react';
import { AirlineCardConfig } from '../../types/game';
import { drawGuddaAirlineCard } from '../../utils/canvasPass';
import { soundManager } from '../../utils/soundManager';

interface GuddaAirlinesBuilderProps {
  onBack: () => void;
}

export const GuddaAirlinesBuilder: React.FC<GuddaAirlinesBuilderProps> = ({ onBack }) => {
  const [airlineName, setAirlineName] = useState<string>('Gudda Airlines');
  const [aircraftType, setAircraftType] = useState<'Airbus A380' | 'Boeing 787 Dreamliner'>('Airbus A380');
  const [livery, setLivery] = useState<{ color: string; name: string }>({
    color: '#0284c7', // Sky Blue
    name: 'Sky Blue (Morning Calm)'
  });
  const [destination, setDestination] = useState<'Switzerland (Zurich)' | 'Dubai (Burj Khalifa View)' | 'London Heathrow' | 'Mumbai Chhatrapati Shivaji'>('Switzerland (Zurich)');
  const [inFlightMeal, setInFlightMeal] = useState<string>('White Sauce Chicken Penne + Choco Lava + Bun');
  const [flightNumber, setFlightNumber] = useState<string>('GA-2026');
  const [seat, setSeat] = useState<string>('12A (First Suite)');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const liveries = [
    { color: '#0284c7', name: 'Sky Blue (Korean Air Calm)' },
    { color: '#15803d', name: 'Stadium Pitch Turf Green' },
    { color: '#b91c1c', name: 'Air India Crimson' },
    { color: '#d97706', name: 'Wankhede Royal Gold' },
    { color: '#6366f1', name: 'Midnight Jet Purple' }
  ];

  const meals = [
    'White Sauce Chicken Penne + Choco Lava + Bun',
    'Domino’s Choco Lava Special + Chilled Sprite',
    'Soft Spongy Butter Buns + Hot Soup + Sprite',
    'Chef Advik’s Premier First-Class Pasta Feast'
  ];

  // Re-draw canvas whenever configuration changes
  useEffect(() => {
    if (canvasRef.current) {
      const cfg: AirlineCardConfig = {
        airlineName,
        aircraftType,
        liveryColor: livery.color,
        liveryName: livery.name,
        destination,
        departure: 'Mumbai Wankhede Hub (BOM)',
        inFlightMeal,
        flightNumber,
        seat
      };
      const url = drawGuddaAirlineCard(canvasRef.current, cfg);
      setDownloadUrl(url);
    }
  }, [airlineName, aircraftType, livery, destination, inFlightMeal, flightNumber, seat]);

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
        <span>Back to Mini-Games Hub</span>
      </button>

      <div className="text-center mb-8">
        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 uppercase tracking-wider">
          ✈️ CUSTOM FLEET DESIGNER
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight mt-2 mb-2">
          Build Your Gudda Airlines Card
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Craft your custom flagship airliner with Advik's dream aircraft, Swiss/Dubai routes, and in-flight pasta catering!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Controls Column */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          {/* Airline Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Airline Name
            </label>
            <input
              type="text"
              value={airlineName}
              maxLength={25}
              onChange={(e) => setAirlineName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Aircraft Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-sky-400" />
              <span>Flagship Aircraft</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Airbus A380', 'Boeing 787 Dreamliner'] as const).map((ac) => (
                <button
                  key={ac}
                  onClick={() => {
                    soundManager.playClick();
                    setAircraftType(ac);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    aircraftType === ac
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-2 ring-sky-400/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {ac}
                </button>
              ))}
            </div>
          </div>

          {/* Livery Palette */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Livery Colour Scheme</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {liveries.map((liv) => (
                <button
                  key={liv.name}
                  onClick={() => {
                    soundManager.playClick();
                    setLivery(liv);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                    livery.name === liv.name
                      ? 'border-white text-white ring-2 ring-white/30 bg-slate-800'
                      : 'border-slate-700 text-slate-300 bg-slate-850'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: liv.color }}
                  />
                  <span>{liv.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Dream Destination</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Switzerland (Zurich)">Switzerland (Zurich - Swiss Alps Gateway)</option>
              <option value="Dubai (Burj Khalifa View)">Dubai (Burj Khalifa &amp; DXB A380s)</option>
              <option value="London Heathrow">London Heathrow (Lord's Cricket Hub)</option>
              <option value="Mumbai Chhatrapati Shivaji">Mumbai Chhatrapati Shivaji (Wankhede)</option>
            </select>
          </div>

          {/* In-Flight Catering */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>In-Flight First-Class Menu</span>
            </label>
            <select
              value={inFlightMeal}
              onChange={(e) => setInFlightMeal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {meals.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Canvas Card Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-200">
              Live Fleet Card Preview
            </h3>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`${airlineName.replace(/\s+/g, '_')}_Card.png`}
                onClick={() => soundManager.playBoardingChime()}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white flex items-center gap-1.5 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Airline Card</span>
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950 p-2 flex justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-w-[600px] rounded-xl shadow-inner"
            />
          </div>

          <p className="text-xs text-slate-400 text-center">
            Official fictional collectible card honoring Advik's favorite aircraft and culinary loves.
          </p>
        </div>
      </div>
    </div>
  );
};
