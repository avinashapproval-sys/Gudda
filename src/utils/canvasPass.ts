import { AirlineCardConfig } from '../types/game';

export interface BoardingPassData {
  nickname: string;
  mainScore: number;
  bonusPoints: number;
  totalPoints: number;
  badge: string;
  theme: 'sky' | 'stadium';
  dateStr?: string;
}

export function drawBoardingPass(canvas: HTMLCanvasElement, data: BoardingPassData): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = 900;
  const h = 420;
  canvas.width = w;
  canvas.height = h;

  const isSky = data.theme === 'sky';
  const primaryColor = isSky ? '#0284c7' : '#15803d'; // Sky Blue or Stadium Green
  const darkBg = '#0f172a'; // Slate 900
  const cardBg = '#1e293b'; // Slate 800
  const accentGold = '#f59e0b'; // Amber 500

  // 1. Base card background with rounded corners
  ctx.fillStyle = cardBg;
  roundRect(ctx, 0, 0, w, h, 24);
  ctx.fill();

  // 2. Header banner
  ctx.fillStyle = primaryColor;
  roundRectTop(ctx, 0, 0, w, 85, 24);
  ctx.fill();

  // Airline header text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('✈ GUDDA AIRLINES', 35, 48);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 14px "Space Grotesk", monospace';
  ctx.fillText("ADVIK'S PITCH & PLANE 2026 SPECIAL EDITION", 35, 70);

  // Class Badge on top right
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  roundRect(ctx, w - 240, 24, 205, 38, 19);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FIRST CLASS SUITE 12A', w - 137, 48);
  ctx.textAlign = 'left';

  // 3. Stub separator (perforated line)
  const stubX = 640;
  ctx.strokeStyle = '#475569';
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(stubX, 85);
  ctx.lineTo(stubX, h - 30);
  ctx.stroke();
  ctx.setLineDash([]);

  // Notches on top and bottom of perforation
  ctx.fillStyle = darkBg;
  ctx.beginPath();
  ctx.arc(stubX, 85, 12, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(stubX, h, 12, Math.PI, 0);
  ctx.fill();

  // 4. Passenger Details (Left Side)
  drawField(ctx, 'PASSENGER NAME', data.nickname.toUpperCase() || 'CHAMPION PLAYER', 40, 130, 20, '#ffffff');
  drawField(ctx, 'FLIGHT NO.', 'GA-2026', 320, 130, 18, '#38bdf8');
  drawField(ctx, 'GATE', 'CRIC-06', 480, 130, 18, '#fbbf24');

  drawField(ctx, 'ORIGIN', 'WANKHEDE STADIUM (BOM)', 40, 205, 16, '#e2e8f0');
  drawField(ctx, 'DESTINATION', 'SWISS ALPS (ZRH)', 320, 205, 16, '#e2e8f0');

  drawField(ctx, 'PITCH SCORE', `${data.mainScore} / 5 ACCURACY`, 40, 280, 22, accentGold);
  drawField(ctx, 'BONUS POINTS', `+${data.bonusPoints} PTS`, 240, 280, 18, '#34d399');
  drawField(ctx, 'TOTAL SCORE', `${data.totalPoints} PTS`, 400, 280, 22, '#60a5fa');

  // Badge pill
  ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
  ctx.strokeStyle = accentGold;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 40, 330, 380, 48, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accentGold;
  ctx.font = 'bold 15px "Space Grotesk", sans-serif';
  ctx.fillText('OFFICIAL BADGE EARNED:', 55, 350);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(data.badge.toUpperCase(), 55, 370);

  // 5. Right Stub (Boarding pass coupon)
  drawField(ctx, 'PASSENGER', data.nickname.toUpperCase() || 'PLAYER', stubX + 25, 130, 16, '#ffffff');
  drawField(ctx, 'FLIGHT', 'GA-2026', stubX + 25, 185, 15, '#38bdf8');
  drawField(ctx, 'SEAT', '12A', stubX + 140, 185, 18, '#f59e0b');
  drawField(ctx, 'MAIN SCORE', `${data.mainScore}/5`, stubX + 25, 240, 20, accentGold);
  drawField(ctx, 'AIRCRAFT', 'AIRBUS A380', stubX + 120, 240, 14, '#94a3b8');

  // Decorative Barcode
  const barY = 295;
  ctx.fillStyle = '#f8fafc';
  const barPattern = [3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 2, 1, 3, 4, 2, 3, 1, 4, 2, 1, 3];
  let curX = stubX + 25;
  for (let i = 0; i < barPattern.length; i++) {
    const width = barPattern[i];
    ctx.fillRect(curX, barY, width, 55);
    curX += width + 2;
    if (curX > w - 35) break;
  }

  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  ctx.fillText('*ADVIK-2026-GA12A-VERIFIED*', stubX + 25, 370);

  return canvas.toDataURL('image/png');
}

export function drawGuddaAirlineCard(canvas: HTMLCanvasElement, cfg: AirlineCardConfig): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = 800;
  const h = 500;
  canvas.width = w;
  canvas.height = h;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, w, h, 20);
  ctx.fill();

  // Top header stripe with chosen livery color
  ctx.fillStyle = cfg.liveryColor;
  roundRectTop(ctx, 0, 0, w, 110, 20);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`✈ ${cfg.airlineName.toUpperCase()}`, 40, 55);

  ctx.font = '600 16px "Space Grotesk", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(`FLAGSHIP CARRIER - ${cfg.liveryName.toUpperCase()} LIVERY`, 40, 85);

  // Content card
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  roundRect(ctx, 30, 130, w - 60, h - 160, 16);
  ctx.fill();

  drawField(ctx, 'FLAGSHIP AIRCRAFT', cfg.aircraftType, 60, 180, 22, '#38bdf8');
  drawField(ctx, 'FLIGHT NUMBER', cfg.flightNumber, 440, 180, 20, '#fbbf24');

  drawField(ctx, 'DEPARTURE HUB', cfg.departure, 60, 260, 18, '#e2e8f0');
  drawField(ctx, 'DREAM DESTINATION', cfg.destination, 440, 260, 18, '#e2e8f0');

  drawField(ctx, 'FIRST-CLASS CATERING', cfg.inFlightMeal, 60, 340, 18, '#34d399');
  drawField(ctx, 'SUITE NUMBER', cfg.seat, 440, 340, 20, '#f59e0b');

  // Decorative seal
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  roundRect(ctx, 60, 395, w - 120, 50, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("CERTIFIED OFFICIAL FLEET CARD • ADVIK'S PITCH & PLANE 2026", w / 2, 426);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}

export function drawTradingCard(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = 450;
  const h = 650;
  canvas.width = w;
  canvas.height = h;

  // Trading card border & holographic dark gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#064e3b');
  ctx.fillStyle = grad;
  roundRect(ctx, 0, 0, w, h, 28);
  ctx.fill();

  // Shiny gold metallic border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  roundRect(ctx, 10, 10, w - 20, h - 20, 22);
  ctx.stroke();

  // Top Title
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 13px "Space Grotesk", monospace';
  ctx.textAlign = 'center';
  ctx.fillText("LEGENDARY COLLECTIBLE • 12TH YEAR EDITION (2026)", w / 2, 38);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText("ADVIK", w / 2, 72);

  ctx.font = 'bold 14px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText("OPENING BATSMAN & A380 CAPTAIN", w / 2, 94);

  // Card center artwork box
  const artY = 115;
  const artH = 200;
  ctx.fillStyle = '#1e293b';
  roundRect(ctx, 30, artY, w - 60, artH, 16);
  ctx.fill();

  // Art drawing: Combined Cricket Bat & Airplane motif
  ctx.fillStyle = '#fbbf24';
  ctx.font = '72px sans-serif';
  ctx.fillText("🏏✈️", w / 2, artY + 115);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px "Space Grotesk", sans-serif';
  ctx.fillText("RO-KO SYNERGY • GUDDA AIRLINES FLAGSHIP", w / 2, artY + 170);

  // Playful verified stats list
  const stats = [
    { name: 'PULL SHOT POWER', val: '99', color: '#f59e0b' },
    { name: 'AIRCRAFT KNOWLEDGE', val: '100', color: '#38bdf8' },
    { name: 'PASTA APPETITE', val: '100', color: '#ec4899' },
    { name: 'AIRPORT EXCITEMENT', val: '100', color: '#10b981' },
    { name: 'TV OFF REFLEX (TENSE)', val: '98', color: '#a855f7' }
  ];

  let statY = 350;
  stats.forEach((st) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillText(st.name, 45, statY);

    ctx.textAlign = 'right';
    ctx.fillStyle = st.color;
    ctx.font = 'bold 17px "Space Grotesk", monospace';
    ctx.fillText(st.val, w - 45, statY);

    // Stat bar background
    ctx.fillStyle = '#334155';
    roundRect(ctx, 45, statY + 6, w - 90, 8, 4);
    ctx.fill();

    // Fill bar
    ctx.fillStyle = st.color;
    const fillW = ((w - 90) * parseInt(st.val)) / 100;
    roundRect(ctx, 45, statY + 6, fillW, 8, 4);
    ctx.fill();

    statY += 45;
  });

  // Footer seal
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.fillText("SPECIAL ATTRIBUTE: 120M SIX & A380 FIRST CLASS", w / 2, h - 35);

  return canvas.toDataURL('image/png');
}

function drawField(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  fontSize: number,
  valueColor: string
) {
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px "Space Grotesk", sans-serif';
  ctx.fillText(label, x, y);

  ctx.fillStyle = valueColor;
  ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText(value, x, y + 24);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectTop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
