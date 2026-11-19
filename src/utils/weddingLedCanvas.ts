import { LedTheme } from '../components/WeddingLedScreenPage';

// ==========================================
// 1. TINH TÚ KIM CƯƠNG (DIAMOND CELESTIAL STAR)
// ==========================================
export const drawDiamondStar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
  color: string,
  points: 4 | 8 = 4,
  brightnessFactor: number = 0.7
) => {
  ctx.save();
  ctx.translate(x, y);

  const effectiveAlpha = Math.max(0, Math.min(1, alpha * brightnessFactor));

  // 1. Quầng sáng starlight halo dịu nhẹ
  const haloGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3.6);
  haloGrad.addColorStop(0, color);
  haloGrad.addColorStop(0.3, color);
  haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.globalAlpha = Math.max(0, Math.min(1, effectiveAlpha * 0.22));
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 3.6, 0, Math.PI * 2);
  ctx.fill();

  // 2. Tia sáng kim cương 4 cánh chính (Diffraction Spikes thanh nhã)
  ctx.globalAlpha = Math.max(0, Math.min(1, effectiveAlpha * 0.75));
  ctx.fillStyle = color;
  const flareLen = size * 3.8;
  const flareThick = size * 0.42;

  // Tia đứng
  ctx.beginPath();
  ctx.moveTo(0, -flareLen);
  ctx.lineTo(flareThick, 0);
  ctx.lineTo(0, flareLen);
  ctx.lineTo(-flareThick, 0);
  ctx.closePath();
  ctx.fill();

  // Tia ngang
  ctx.beginPath();
  ctx.moveTo(-flareLen, 0);
  ctx.lineTo(0, flareThick);
  ctx.lineTo(flareLen, 0);
  ctx.lineTo(0, -flareThick);
  ctx.closePath();
  ctx.fill();

  // 3. Tia phụ nếu là sao 8 cánh (8-point Diffraction Flare)
  if (points === 8) {
    const subLen = flareLen * 0.52;
    const subThick = flareThick * 0.35;
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, -subLen);
    ctx.lineTo(subThick, 0);
    ctx.lineTo(0, subLen);
    ctx.lineTo(-subThick, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-subLen, 0);
    ctx.lineTo(0, subThick);
    ctx.lineTo(subLen, 0);
    ctx.lineTo(0, -subThick);
    ctx.closePath();
    ctx.fill();
  }

  // 4. Nhân sao sáng ở tâm (được tinh chỉnh thanh tao, không lóa mắt)
  ctx.globalAlpha = Math.max(0, Math.min(1, effectiveAlpha * 0.85));
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// ==========================================
// 1.2 HÀNH TINH PHÁT SÁNG CHỚP CHỚP (GLOWING CELESTIAL PLANET)
// ==========================================
/**
 * Vẽ hành tinh phát sáng chớp chớp (Glowing Celestial Planet)
 * Bao gồm: Quầng sáng phát quang (Atmospheric Glow), vành đai nghiêng (Planetary Rings),
 * khối cầu 3D với gradient chuyển sắc và đốm sáng specular glint ngọc trai.
 */
export const drawGlowingPlanet = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  color: string,
  hasRing: boolean = false,
  brightnessFactor: number = 0.8
) => {
  ctx.save();
  ctx.translate(x, y);

  const effectiveAlpha = Math.max(0, Math.min(1, alpha * brightnessFactor));

  // 1. Quầng sáng phát quang khí quyển (Atmospheric Halo)
  const atmoGrad = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius * 3.0);
  atmoGrad.addColorStop(0, color);
  atmoGrad.addColorStop(0.35, color);
  atmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.globalAlpha = Math.max(0, Math.min(1, effectiveAlpha * 0.35));
  ctx.fillStyle = atmoGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 3.0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Vành đai hành tinh nghiêng (Planetary Rings)
  if (hasRing) {
    ctx.save();
    ctx.rotate(-0.38); // Góc nghiêng tự nhiên ~22 độ
    ctx.scale(1, 0.32); // Elip dẹt
    
    // Vành đai chính
    ctx.beginPath();
    ctx.arc(0, 0, radius * 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${effectiveAlpha * 0.65})`;
    ctx.lineWidth = Math.max(1.2, radius * 0.38);
    ctx.stroke();

    // Vành đai ngoài ánh vàng/cyan
    ctx.beginPath();
    ctx.arc(0, 0, radius * 3.1, 0, Math.PI * 2);
    ctx.strokeStyle = color === '#ffffff' ? `rgba(254, 240, 138, ${effectiveAlpha * 0.35})` : `rgba(255, 255, 255, ${effectiveAlpha * 0.3})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // 3. Khối cầu hành tinh 3D
  const sphereGrad = ctx.createRadialGradient(-radius * 0.32, -radius * 0.32, radius * 0.08, 0, 0, radius);
  sphereGrad.addColorStop(0, '#ffffff');
  sphereGrad.addColorStop(0.35, color);
  sphereGrad.addColorStop(0.85, color);
  sphereGrad.addColorStop(1, 'rgba(10, 15, 30, 0.85)');
  ctx.globalAlpha = Math.max(0, Math.min(1, effectiveAlpha * 0.95));
  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // 4. Điểm sáng lấp lánh (Specular glint)
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = Math.max(0, Math.min(1, effectiveAlpha));
  ctx.beginPath();
  ctx.arc(-radius * 0.35, -radius * 0.35, Math.max(0.7, radius * 0.28), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// ==========================================
// 1.3 DẢI NGÂN HÀ PHÁT SÁNG (MILKY WAY GALACTIC RIVER)
// ==========================================
/**
 * Vẽ dải ngân hà phát sáng mềm mại (Milky Way Galactic River) ở phần đỉnh đầu và phần chân
 * Giúp tạo chiều sâu vũ trụ lộng lẫy, huyền ảo cho mẫu phông nền Tinh Tú.
 */
export const drawMilkyWayNebula = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  theme: LedTheme,
  brightnessFactor: number = 0.7
) => {
  ctx.save();
  const speed = 0.0006;

  // Màu sắc dải mây ngân hà tùy theo theme
  let c1 = 'rgba(254, 240, 138, '; // Vàng champagne
  let c2 = 'rgba(147, 197, 253, '; // Lam nhạt
  let c3 = 'rgba(216, 180, 254, '; // Tím ngân hà
  if (theme === 'ruby') {
    c1 = 'rgba(254, 205, 211, ';
    c2 = 'rgba(254, 240, 138, ';
    c3 = 'rgba(251, 113, 133, ';
  } else if (theme === 'emerald') {
    c1 = 'rgba(167, 243, 208, ';
    c2 = 'rgba(254, 240, 138, ';
    c3 = 'rgba(110, 231, 183, ';
  } else if (theme === 'gold') {
    c1 = 'rgba(254, 240, 138, ';
    c2 = 'rgba(253, 224, 71, ';
    c3 = 'rgba(251, 191, 36, ';
  }

  // 1. DẢI NGÂN HÀ ĐỈNH ĐẦU (TOP GALACTIC STREAM: y: 0 -> 28% height)
  const topGrad = ctx.createLinearGradient(0, 0, width, height * 0.26);
  topGrad.addColorStop(0, `${c1}${0.07 * brightnessFactor})`);
  topGrad.addColorStop(0.35, `${c3}${0.09 * brightnessFactor})`);
  topGrad.addColorStop(0.7, `${c2}${0.08 * brightnessFactor})`);
  topGrad.addColorStop(1, `${c1}${0.05 * brightnessFactor})`);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  // Sóng uốn lượn mềm mại của dải mây ngân hà đỉnh
  for (let x = width; x >= 0; x -= 30) {
    const yWave = height * 0.16 + Math.sin(x * 0.0028 + time * speed) * (height * 0.04) + Math.cos(x * 0.0055 - time * speed * 1.5) * (height * 0.025);
    ctx.lineTo(x, yWave);
  }
  ctx.closePath();
  ctx.fillStyle = topGrad;
  ctx.fill();

  // Đám mây bụi sao tinh cầu phát quang điểm xuyết trên đỉnh
  const topCloud1 = ctx.createRadialGradient(width * 0.28, height * 0.1, 10, width * 0.28, height * 0.1, width * 0.3);
  topCloud1.addColorStop(0, `${c1}${0.12 * brightnessFactor})`);
  topCloud1.addColorStop(0.5, `${c3}${0.05 * brightnessFactor})`);
  topCloud1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topCloud1;
  ctx.fillRect(0, 0, width, height * 0.28);

  const topCloud2 = ctx.createRadialGradient(width * 0.72, height * 0.12, 10, width * 0.72, height * 0.12, width * 0.28);
  topCloud2.addColorStop(0, `${c2}${0.10 * brightnessFactor})`);
  topCloud2.addColorStop(0.6, `${c1}${0.04 * brightnessFactor})`);
  topCloud2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topCloud2;
  ctx.fillRect(0, 0, width, height * 0.28);

  // 2. DẢI NGÂN HÀ CHÂN DƯỚI (BOTTOM GALACTIC STREAM: y: 72% -> 100% height)
  const botGrad = ctx.createLinearGradient(width, height, 0, height * 0.74);
  botGrad.addColorStop(0, `${c1}${0.08 * brightnessFactor})`);
  botGrad.addColorStop(0.4, `${c2}${0.09 * brightnessFactor})`);
  botGrad.addColorStop(0.75, `${c3}${0.07 * brightnessFactor})`);
  botGrad.addColorStop(1, `${c1}${0.04 * brightnessFactor})`);

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, height);
  // Sóng uốn lượn mềm mại của dải mây ngân hà dưới chân
  for (let x = width; x >= 0; x -= 30) {
    const yWave = height * 0.82 + Math.sin(x * 0.0025 - time * speed * 1.2) * (height * 0.045) + Math.cos(x * 0.006 + time * speed) * (height * 0.02);
    ctx.lineTo(x, yWave);
  }
  ctx.closePath();
  ctx.fillStyle = botGrad;
  ctx.fill();

  const botCloud1 = ctx.createRadialGradient(width * 0.45, height * 0.9, 10, width * 0.45, height * 0.9, width * 0.35);
  botCloud1.addColorStop(0, `${c1}${0.11 * brightnessFactor})`);
  botCloud1.addColorStop(0.55, `${c2}${0.05 * brightnessFactor})`);
  botCloud1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = botCloud1;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  ctx.restore();
};

// ==========================================
// 2. PHÔNG NỀN MÀN HÌNH LỤA SATIN (FULL-BLEED SATIN SILK BACKDROP)
// ==========================================
export interface SilkMote {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedX: number;
  speedY: number;
  phase: number;
}

export const createSilkMotes = (count: number, width: number, height: number): SilkMote[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2.2 + 0.8,
    alpha: Math.random() * 0.6 + 0.2,
    speedX: (Math.random() - 0.3) * 0.45,
    speedY: -Math.random() * 0.4 - 0.15,
    phase: Math.random() * Math.PI * 2,
  }));
};

export const getSilkColors = (theme: LedTheme) => {
  switch (theme) {
    case 'ruby':
      return {
        // Đỏ son hỷ sự / Ruby Satin (Chuẩn tiệc cưới & lễ gia tiên truyền thống)
        base: [195, 24, 55],       // Đỏ son ruby
        light: [255, 185, 205],     // Ánh lụa satin xà cừ óng ả
        deep: [60, 5, 16],          // Rãnh gấp bóng nhung đỏ
        accent: '#fef08a',          // Bụi kim ngân
        mote: 'rgba(255, 228, 230, ',
        bgStart: '#30040c',
        bgEnd: '#1a0206',
      };
    case 'champagne':
      return {
        // Trắng ngà & Kem Ngọc Trai / Ivory Pearl Satin (Phong cách tiệc cưới châu Âu sang trọng)
        base: [225, 205, 190],     // Trắng ngà / Kem pearl
        light: [255, 252, 248],    // Ánh xà cừ ngọc trai tinh khôi
        deep: [115, 85, 75],       // Nếp gấp bóng kem
        accent: '#fef3c7',
        mote: 'rgba(255, 250, 240, ',
        bgStart: '#2d1b1b',
        bgEnd: '#170c0c',
      };
    case 'gold':
      return {
        // Hoàng gia Champagne / Gold Silk (Phong cách sảnh tiệc 5 sao lộng lẫy)
        base: [218, 160, 40],      // Hoàng kim satin
        light: [255, 248, 190],    // Ánh kim ngân lấp lánh
        deep: [75, 45, 8],         // Nếp gấp hổ phách đồng
        accent: '#ffffff',
        mote: 'rgba(254, 240, 138, ',
        bgStart: '#332005',
        bgEnd: '#140c01',
      };
    case 'emerald':
      return {
        // Xanh lục bảo / Jade Silk (Phong cách quý phái thanh cao)
        base: [16, 145, 105],      // Lụa xanh ngọc bích
        light: [185, 252, 228],    // Ánh bạc ngọc bảo
        deep: [3, 48, 32],         // Nếp gấp tối lục bảo
        accent: '#a7f3d0',
        mote: 'rgba(209, 250, 229, ',
        bgStart: '#04281c',
        bgEnd: '#01140e',
      };
    case 'galaxy':
    default:
      return {
        // Xanh lam vương giả / Royal Sapphire Satin
        base: [80, 95, 215],       // Lụa xanh hoàng gia
        light: [215, 230, 255],    // Ánh trăng bạch kim
        deep: [15, 20, 65],
        accent: '#93c5fd',
        mote: 'rgba(224, 231, 255, ',
        bgStart: '#0f173d',
        bgEnd: '#060a1f',
      };
  }
};

export const isSilkPattern = (pattern: string): boolean => {
  return pattern === 'lua' || pattern === 'lua_song' || pattern === 'lua_dongchay' || pattern === 'lua_xeply';
};

// ========================================================
// 2.1 MẪU LỤA 1: SÓNG LỤA DẬP DỀNH (LIQUID SILK OCEAN WAVES)
// ========================================================
/**
 * Mô phỏng mặt sóng lụa satin liên hoàn đa tầng (Continuous Rolling Silk Waves).
 * Từng lớp sóng lụa dập dềnh bồng bềnh phủ kín toàn màn hình với đỉnh sóng phản quang
 * satin óng ả (anisotropic specular crest sheen) lướt theo nhịp sóng.
 */
export const drawSilkOceanWaves = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: ReturnType<typeof getSilkColors>,
  speedMultiplier: number = 1.0,
  brightnessMultiplier: number = 1.0
) => {
  const numLayers = 9;
  const stepX = Math.max(16, Math.floor(width / 75));

  for (let k = 0; k < numLayers; k++) {
    // Độ cao cơ sở của từng tầng sóng lụa từ trên xuống dưới
    const yBase = (k / (numLayers - 1)) * (height * 1.12) - (height * 0.06);
    const layerSpeed = speedMultiplier * (0.0009 + 0.00025 * Math.sin(k * 1.5));
    const layerTime = time * layerSpeed;
    const amp = (height / 11) * (0.85 + 0.35 * Math.sin(k * 1.3));

    const wavePoints: Array<{ x: number; y: number; slope: number }> = [];

    for (let x = -40; x <= width + 40; x += stepX) {
      // Hàm sóng sin/cos kết hợp đa tần tạo chuyển động dập dềnh hữu cơ
      const f1 = 0.0022;
      const f2 = 0.0046;
      const f3 = 0.0012;

      const p1 = x * f1 + layerTime + k * 0.85;
      const p2 = x * f2 - layerTime * 1.35 + k * 1.25;
      const p3 = (x * f3 + yBase * 0.002) + layerTime * 0.7;

      const w1 = Math.sin(p1) * amp;
      const w2 = Math.cos(p2) * (amp * 0.42);
      const w3 = Math.sin(p3) * (amp * 0.28);

      const y = yBase + w1 + w2 + w3;

      // Đạo hàm tính độ nghiêng sóng để mô phỏng ánh sáng phản quang bắt vào ngọn sóng
      const slope = Math.cos(p1) * (f1 * amp) - Math.sin(p2) * (f2 * amp * 0.42);

      wavePoints.push({ x, y, slope });
    }

    if (wavePoints.length < 2) continue;

    // Vẽ khối diện tích sóng lụa đổ bóng xuống chân
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
    for (let p = 1; p < wavePoints.length; p++) {
      ctx.lineTo(wavePoints[p].x, wavePoints[p].y);
    }
    // Đóng vùng polygon xuống đáy màn hình
    ctx.lineTo(width + 60, height + 60);
    ctx.lineTo(-60, height + 60);
    ctx.closePath();

    // Gradient màu lụa satin mô phỏng chuyển sắc từ đỉnh sóng sáng óng ả xuống rãnh sóng sâu
    const minWaveY = Math.min(...wavePoints.map(p => p.y));
    const maxWaveY = minWaveY + amp * 2.8 + height * 0.15;
    const waveGrad = ctx.createLinearGradient(0, minWaveY, 0, maxWaveY);
    
    // Đỉnh sóng đón sáng satin
    waveGrad.addColorStop(0, `rgba(${colors.light.join(',')}, ${0.92 * brightnessMultiplier})`);
    waveGrad.addColorStop(0.18, `rgba(${colors.base.join(',')}, 0.90)`);
    waveGrad.addColorStop(0.65, `rgba(${colors.base.join(',')}, 0.78)`);
    waveGrad.addColorStop(1, `rgba(${colors.deep.join(',')}, 0.95)`);

    ctx.fillStyle = waveGrad;
    ctx.fill();

    // Vẽ đường sống sóng phản quang ánh satin óng ả (Specular Ridge Sheen)
    ctx.beginPath();
    ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
    for (let p = 1; p < wavePoints.length; p++) {
      ctx.lineTo(wavePoints[p].x, wavePoints[p].y);
    }
    ctx.strokeStyle = `rgba(${colors.light.join(',')}, ${0.58 * brightnessMultiplier})`;
    ctx.lineWidth = Math.max(1.8, Math.min(3.2, width / 500));
    ctx.stroke();

    // Dải ánh sáng thứ cấp (Secondary Sub-sheen) tạo độ bóng mượt tơ lụa
    ctx.beginPath();
    ctx.moveTo(wavePoints[0].x, wavePoints[0].y + 4.5);
    for (let p = 1; p < wavePoints.length; p++) {
      ctx.lineTo(wavePoints[p].x, wavePoints[p].y + 4.5);
    }
    ctx.strokeStyle = `rgba(${colors.light.join(',')}, ${0.28 * brightnessMultiplier})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }
};

// ========================================================
// 2.2 MẪU LỤA 2: DÒNG CHẢY LỤA MỀM (CASCADING FLUID SILK)
// ========================================================
/**
 * Mô phỏng những dải lụa satin khổ lớn uốn lượn bay lướt ngang và chéo sân khấu tiệc cưới
 * với độ vặn xoắn 3D (3D ribbon twists), khi xoắn lộ mặt bóng mờ và mặt bắt sáng lấp lánh.
 */
export const drawSilkFlowingCascade = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: ReturnType<typeof getSilkColors>,
  speedMultiplier: number = 1.0,
  brightnessMultiplier: number = 1.0
) => {
  const ribbons = [
    // Dải lụa 1: Lướt góc cao uốn lượn mềm mại
    {
      baseYPercent: 0.16,
      amp: height * 0.08,
      freq1: 0.0022,
      freq2: 0.0048,
      speed1: 0.0011 * speedMultiplier,
      speed2: 0.0018 * speedMultiplier,
      thickPercent: 0.24,
      alpha: 0.88,
    },
    // Dải lụa 2: Dải trung tâm lớn nhất, chuyển động lượn sóng ôm trọn không gian
    {
      baseYPercent: 0.42,
      amp: height * 0.11,
      freq1: 0.0018,
      freq2: 0.0036,
      speed1: 0.0009 * speedMultiplier,
      speed2: 0.0015 * speedMultiplier,
      thickPercent: 0.32,
      alpha: 0.82,
    },
    // Dải lụa 3: Dải chéo giao thoa từ đối diện
    {
      baseYPercent: 0.62,
      amp: height * 0.09,
      freq1: 0.0024,
      freq2: 0.0042,
      speed1: -0.0008 * speedMultiplier,
      speed2: 0.0014 * speedMultiplier,
      thickPercent: 0.28,
      alpha: 0.85,
    },
    // Dải lụa 4: Dải lụa rủ phía sàn tiệc
    {
      baseYPercent: 0.84,
      amp: height * 0.085,
      freq1: 0.0020,
      freq2: 0.0050,
      speed1: 0.0012 * speedMultiplier,
      speed2: 0.0019 * speedMultiplier,
      thickPercent: 0.26,
      alpha: 0.90,
    },
  ];

  ribbons.forEach((rb, rIdx) => {
    const step = 20;
    const points: Array<{ x: number; yTop: number; yBot: number; yMid: number; twist: number }> = [];

    let minY = height;
    let maxY = 0;

    for (let x = -50; x <= width + 50; x += step) {
      const midY =
        height * rb.baseYPercent +
        Math.sin(x * rb.freq1 + time * rb.speed1 + rIdx * 1.4) * rb.amp +
        Math.cos(x * rb.freq2 + time * rb.speed2 + rIdx * 2.2) * (rb.amp * 0.45);

      // Độ phồng và co bóp nhịp nhàng của dải lụa khi bay trong gió
      const thMod = 1 + 0.28 * Math.sin(x * 0.0032 + time * 0.0012 * speedMultiplier + rIdx * 1.8);
      const th = height * rb.thickPercent * thMod;

      const yTop = midY - th * 0.5;
      const yBot = midY + th * 0.5;

      if (yTop < minY) minY = yTop;
      if (yBot > maxY) maxY = yBot;

      // Góc xoắn 3D của tấm lụa
      const twist = Math.sin(x * 0.0024 + time * 0.0009 * speedMultiplier + rIdx * 1.5);

      points.push({ x, yTop, yBot, yMid: midY, twist });
    }

    if (points.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].yTop);
    for (let p = 1; p < points.length; p++) ctx.lineTo(points[p].x, points[p].yTop);
    for (let p = points.length - 1; p >= 0; p--) ctx.lineTo(points[p].x, points[p].yBot);
    ctx.closePath();

    const ribGrad = ctx.createLinearGradient(0, minY, 0, maxY);
    ribGrad.addColorStop(0, `rgba(${colors.deep.join(',')}, ${0.25 * rb.alpha})`);
    ribGrad.addColorStop(0.32, `rgba(${colors.base.join(',')}, ${0.85 * rb.alpha})`);
    ribGrad.addColorStop(0.55, `rgba(${colors.light.join(',')}, ${0.98 * rb.alpha * brightnessMultiplier})`);
    ribGrad.addColorStop(0.78, `rgba(${colors.base.join(',')}, ${0.75 * rb.alpha})`);
    ribGrad.addColorStop(1, `rgba(${colors.deep.join(',')}, ${0.30 * rb.alpha})`);

    ctx.fillStyle = ribGrad;
    ctx.fill();

    // Các đường gân tơ lụa mềm (Silk thread contour streamlines)
    [0.35, 0.5, 0.65].forEach((frac, fIdx) => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].yTop + (points[0].yBot - points[0].yTop) * frac);
      for (let p = 1; p < points.length; p++) {
        const py = points[p].yTop + (points[p].yBot - points[p].yTop) * frac;
        ctx.lineTo(points[p].x, py);
      }
      ctx.strokeStyle = `rgba(${colors.light.join(',')}, ${(fIdx === 1 ? 0.65 : 0.35) * rb.alpha * brightnessMultiplier})`;
      ctx.lineWidth = fIdx === 1 ? 1.8 : 1.0;
      ctx.stroke();
    });

    ctx.restore();
  });
};

// ========================================================
// 2.3 MẪU LỤA 3: LỤA RỦ XẾP NẾP GỢN SÓNG (ORGANIC DRAPED SILK FOLDS)
// ========================================================
/**
 * Mô phỏng tấm rèm lụa satin buông rủ với các múi nếp gấp hữu cơ (organic curved folds)
 * đung đưa và gợn sóng nhịp nhàng như làn gió nhẹ thoảng qua sảnh tiệc hoàng gia.
 * Không cứng đờ như sọc kẻ mà có nếp uốn mềm mại, bóng đổ 3D và gợn sóng tự nhiên.
 */
export const drawSilkDrapedFolds = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: ReturnType<typeof getSilkColors>,
  speedMultiplier: number = 1.0,
  brightnessMultiplier: number = 1.0
) => {
  // Độ rộng cơ bản của từng nếp gấp rủ
  const foldBaseWidth = Math.max(48, Math.min(85, width / 20));
  const foldCount = Math.ceil(width / foldBaseWidth) + 3;

  for (let i = 0; i < foldCount; i++) {
    // Phân bổ độ rộng hữu cơ tự nhiên cho từng nếp vải
    const organicWidth = foldBaseWidth * (0.85 + 0.3 * (((i * 7) % 5) / 4));
    const xBase = (i - 1.5) * foldBaseWidth;

    const points: Array<{ xLeft: number; xRight: number; xMid: number; y: number; gleamShift: number }> = [];
    const yStep = 20;

    for (let y = 0; y <= height + 20; y += yStep) {
      // 1. Sóng đung đưa tự nhiên theo phương ngang của vải lụa treo rủ
      const sway =
        Math.sin(y * 0.0032 + time * 0.0014 * speedMultiplier + i * 0.45) * 18 +
        Math.cos(y * 0.0068 - time * 0.0020 * speedMultiplier + i * 0.72) * 9;

      // 2. Gợn sóng gió ngang (Horizontal breeze ripple) di chuyển từ trên xuống dưới
      const breeze = Math.sin(y * 0.012 - time * 0.0028 * speedMultiplier + i * 0.35) * 5;

      const totalOffset = sway + breeze;
      const xL = xBase + totalOffset;
      const xR = xBase + organicWidth + totalOffset;
      const xM = (xL + xR) / 2;

      // Điểm phản quang satin di chuyển theo sống nếp vải
      const gleamShift = 0.45 + 0.18 * Math.sin(time * 0.0016 * speedMultiplier + i * 0.6 + y * 0.002);

      points.push({ xLeft: xL, xRight: xR, xMid: xM, y, gleamShift });
    }

    if (points.length < 2) continue;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].xLeft, points[0].y);
    for (let p = 1; p < points.length; p++) ctx.lineTo(points[p].xLeft, points[p].y);
    for (let p = points.length - 1; p >= 0; p--) ctx.lineTo(points[p].xRight, points[p].y);
    ctx.closePath();

    // Gradient 3D hình trụ uốn cong mô phỏng bề mặt cong của nếp vải satin
    const avgMid = points[Math.floor(points.length / 2)].xMid;
    const pleatGrad = ctx.createLinearGradient(avgMid - organicWidth * 0.5, 0, avgMid + organicWidth * 0.5, 0);
    pleatGrad.addColorStop(0, `rgba(${colors.deep.join(',')}, 0.90)`);
    pleatGrad.addColorStop(0.3, `rgba(${colors.base.join(',')}, 0.92)`);
    pleatGrad.addColorStop(0.5, `rgba(${colors.light.join(',')}, ${0.92 * brightnessMultiplier})`);
    pleatGrad.addColorStop(0.72, `rgba(${colors.base.join(',')}, 0.90)`);
    pleatGrad.addColorStop(1, `rgba(${colors.deep.join(',')}, 0.90)`);

    ctx.fillStyle = pleatGrad;
    ctx.fill();

    // Bóng đổ rãnh sâu (Crease drop shadow) giữa 2 nếp vải chồng lên nhau
    ctx.beginPath();
    ctx.moveTo(points[0].xLeft, points[0].y);
    for (let p = 1; p < points.length; p++) ctx.lineTo(points[p].xLeft, points[p].y);
    ctx.strokeStyle = `rgba(${colors.deep.join(',')}, 0.65)`;
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Đường gân lụa sáng óng ả dọc theo sống múi vải
    ctx.beginPath();
    ctx.moveTo(points[0].xMid, points[0].y);
    for (let p = 1; p < points.length; p++) ctx.lineTo(points[p].xMid, points[p].y);
    ctx.strokeStyle = `rgba(${colors.light.join(',')}, ${0.35 * brightnessMultiplier})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }
};

// ========================================================
// 2.4 HÀM ĐIỀU PHỐI TỔNG THỂ PHÔNG NỀN LỤA SATIN
// ========================================================
/**
 * Vẽ trọn vẹn Phông Nền Màn Hình Lụa Satin (Full-Bleed Satin Silk Backdrop)
 * Hỗ trợ 3 mẫu chuyển động gợn sóng:
 * 1. 'lua_song' (hoặc 'lua'): Sóng Lụa Dập Dềnh (Liquid Silk Ocean Waves)
 * 2. 'lua_dongchay': Dòng Chảy Lụa Mềm (Cascading Fluid Silk)
 * 3. 'lua_xeply': Lụa Rủ Xếp Nếp Gợn Sóng (Organic Draped Silk Folds)
 */
export const drawSilkBackdrop = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  theme: LedTheme,
  speedMultiplier: number = 1.0,
  brightnessMultiplier: number = 1.0,
  motes: SilkMote[] = [],
  pattern: 'lua_song' | 'lua_dongchay' | 'lua_xeply' | 'lua' = 'lua_song'
) => {
  const colors = getSilkColors(theme);
  const cx = width / 2;
  const cy = height * 0.48;
  const safeRx = width * 0.38;
  const safeRy = height * 0.35;

  // Lớp gradient nền vải lụa tổng thể
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0, colors.bgStart);
  baseGrad.addColorStop(0.5, `rgba(${colors.base.join(',')}, 0.88)`);
  baseGrad.addColorStop(1, colors.bgEnd);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Điều phối vẽ mẫu lụa theo yêu cầu
  if (pattern === 'lua_dongchay') {
    drawSilkFlowingCascade(ctx, width, height, time, colors, speedMultiplier, brightnessMultiplier);
  } else if (pattern === 'lua_xeply') {
    drawSilkDrapedFolds(ctx, width, height, time, colors, speedMultiplier, brightnessMultiplier);
  } else {
    // Mặc định hoặc 'lua_song' / 'lua': Sóng Lụa Dập Dềnh
    drawSilkOceanWaves(ctx, width, height, time, colors, speedMultiplier, brightnessMultiplier);
  }

  // ========================================================
  // QUẦNG SÁNG BẢO VỆ CHỮ TRUNG TÂM (CENTER TYPOGRAPHY ILLUMINATION ZONE)
  // ========================================================
  // Giúp chữ vàng kim / trắng luôn nổi bật sắc nét tuyệt đối trên nền vải lụa
  const centerHalo = ctx.createRadialGradient(cx, cy, width * 0.1, cx, cy, width * 0.42);
  centerHalo.addColorStop(0, `rgba(${colors.deep.join(',')}, 0.40)`);
  centerHalo.addColorStop(0.6, `rgba(${colors.deep.join(',')}, 0.18)`);
  centerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.save();
  ctx.fillStyle = centerHalo;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // ========================================================
  // HẠT BỤI LỤA XÀ CỪ LƠ LỬNG (FLOATING PEARL DUST MOTES)
  // ========================================================
  motes.forEach(m => {
    m.x += m.speedX * speedMultiplier;
    m.y += m.speedY * speedMultiplier;
    m.phase += 0.02 * speedMultiplier;

    if (m.y < -20) {
      m.y = height + 20;
      m.x = Math.random() * width;
    }
    if (m.x < -20) m.x = width + 20;
    if (m.x > width + 20) m.x = -20;

    const dx = (m.x - cx) / safeRx;
    const dy = (m.y - cy) / safeRy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let moteAlpha = m.alpha * brightnessMultiplier * (0.6 + 0.4 * Math.sin(m.phase));
    if (dist < 1.0) moteAlpha *= Math.max(0.2, dist);

    ctx.save();
    ctx.fillStyle = `${colors.mote}${Math.max(0, Math.min(1, moteAlpha))})`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};
