import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Download, Sparkles, Award } from 'lucide-react';
import { drawTradingCard } from '../../utils/canvasPass';
import { soundManager } from '../../utils/soundManager';

interface AdvikTradingCardProps {
  onBack: () => void;
}

export const AdvikTradingCard: React.FC<AdvikTradingCardProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      const url = drawTradingCard(canvasRef.current);
      setDownloadUrl(url);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 text-center">
      <div className="text-left">
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
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        OFFICIAL 2026 COLLECTIBLE
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight mb-2">
        Advik Special Trading Card
      </h1>
      <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
        Celebrating 12 years of big sixes, superjumbos, and delicious penne pasta. Hover or drag to experience the holographic shine!
      </p>

      {/* 3D Tilt Card Container */}
      <div className="flex justify-center mb-8">
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 0.1s ease-out'
          }}
          className="relative rounded-3xl p-3 bg-gradient-to-tr from-amber-500/20 via-sky-500/20 to-purple-500/20 border-2 border-amber-400/40 shadow-2xl shadow-amber-500/10 cursor-pointer group"
        >
          {/* Holographic light sheen overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-300"
            style={{
              background: `linear-gradient(${tilt.x * 10 + 135}deg, rgba(255,255,255,0.4) 0%, transparent 60%)`
            }}
          />

          <canvas
            ref={canvasRef}
            className="w-full max-w-[360px] h-auto rounded-2xl shadow-2xl block"
          />
        </div>
      </div>

      {/* Action Button */}
      {downloadUrl && (
        <div className="flex justify-center">
          <a
            href={downloadUrl}
            download="Advik_12th_Year_Trading_Card.png"
            onClick={() => soundManager.playBoardingChime()}
            className="py-3 px-6 rounded-xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-xl transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Trading Card (High-Res PNG)</span>
          </a>
        </div>
      )}
    </div>
  );
};
