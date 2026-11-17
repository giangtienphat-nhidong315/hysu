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
// 2. MÀN HÌNH SÓNG LỤA BAY (SILK BACKDROP ENGINE)
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
        base: [195, 25, 55],       // Đỏ ruby nhung
        light: [255, 175, 195],     // Ánh lụa satin hồng phấn xà cừ
        deep: [55, 4, 15],          // Vết gấp tối nhung ruby
        accent: '#fef08a',          // Bụi vàng kim
        mote: 'rgba(255, 228, 230, ',
      };
    case 'gold':
      return {
        base: [218, 155, 35],      // Hoàng kim satin
        light: [255, 245, 185],    // Ánh xà cừ kim ngân
        deep: [70, 42, 6],         // Nếp bóng hổ phách
        accent: '#ffffff',
        mote: 'rgba(254, 240, 138, ',
      };
    case 'champagne':
      return {
        base: [210, 115, 155],     // Hồng champagne quý phái
        light: [255, 230, 240],    // Ánh lụa ngọc trai
        deep: [75, 20, 50],
        accent: '#fbcfe8',
        mote: 'rgba(253, 242, 248, ',
      };
    case 'emerald':
      return {
        base: [16, 145, 105],      // Lụa xanh lục bảo
        light: [180, 250, 225],    // Ánh bạc ngọc bích
        deep: [2, 45, 30],
        accent: '#a7f3d0',
        mote: 'rgba(209, 250, 229, ',
      };
    case 'galaxy':
    default:
      return {
        base: [85, 95, 220],       // Lụa xanh lam vương giả & chàm
        light: [210, 230, 255],    // Ánh trăng bạch kim
        deep: [14, 18, 60],
        accent: '#93c5fd',
        mote: 'rgba(224, 231, 255, ',
      };
  }
};

export const drawSilkBackdrop = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  theme: LedTheme,
  speedMultiplier: number = 1.0,
  brightnessMultiplier: number = 1.0,
  motes: SilkMote[] = []
) => {
  const colors = getSilkColors(theme);
  const cx = width / 2;
  const cy = height * 0.48;
  const safeRx = width * 0.38;
  const safeRy = height * 0.35;

  // 1. Bầu không khí lụa nền chuyển màu mượt mà (Ambient Silk Sheen)
  const ambientGrad = ctx.createRadialGradient(cx, cy, width * 0.15, cx, cy, width * 0.7);
  ambientGrad.addColorStop(0, `rgba(${colors.base.join(',')}, ${0.08 * brightnessMultiplier})`);
  ambientGrad.addColorStop(0.5, `rgba(${colors.light.join(',')}, ${0.04 * brightnessMultiplier})`);
  ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.save();
  ctx.fillStyle = ambientGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // 2. Các dải sóng lụa (Flowing Silk Ribbons)
  // Mỗi dải lụa là sự kết hợp các sóng sin hài hòa với độ dày và góc nghiêng tự nhiên
  const ribbons = [
    // Dải lụa 1: Lướt nhẹ phía trên (Swoop Upper)
    {
      baseYPercent: 0.22,
      amp: height * 0.065,
      freq1: 0.0028,
      freq2: 0.0055,
      speed1: 0.0012 * speedMultiplier,
      speed2: 0.0019 * speedMultiplier,
      thickness: height * 0.24,
      alpha: 0.42 * brightnessMultiplier,
      crestShift: 0.45,
    },
    // Dải lụa 2: Dải lụa chính uốn lượn mềm mại quanh vùng chữ (Main Flowing Silk Drape)
    {
      baseYPercent: 0.46,
      amp: height * 0.085,
      freq1: 0.0022,
      freq2: 0.0042,
      speed1: 0.0009 * speedMultiplier,
      speed2: 0.0016 * speedMultiplier,
      thickness: height * 0.32,
      alpha: 0.38 * brightnessMultiplier,
      crestShift: 0.5,
    },
    // Dải lụa 3: Lướt nhẹ phía dưới sàn tiệc (Lower Silk Cascade)
    {
      baseYPercent: 0.76,
      amp: height * 0.075,
      freq1: 0.0025,
      freq2: 0.0048,
      speed1: 0.0011 * speedMultiplier,
      speed2: 0.0018 * speedMultiplier,
      thickness: height * 0.28,
      alpha: 0.45 * brightnessMultiplier,
      crestShift: 0.55,
    },
    // Dải lụa 4: Vải voan mỏng ánh xà cừ bay chéo (Translucent Satin Veil)
    {
      baseYPercent: 0.60,
      amp: height * 0.055,
      freq1: 0.0035,
      freq2: 0.007,
      speed1: 0.0015 * speedMultiplier,
      speed2: 0.0022 * speedMultiplier,
      thickness: height * 0.20,
      alpha: 0.28 * brightnessMultiplier,
      crestShift: 0.48,
    },
  ];

  ribbons.forEach((ribbon, rIdx) => {
    const step = 20;
    const points: Array<{ x: number; yTop: number; yBot: number; yMid: number }> = [];

    let minY = height;
    let maxY = 0;

    for (let x = -40; x <= width + 40; x += step) {
      // Hàm sóng sin đa tần số tạo chuyển động nhấp nhô như lụa trước gió
      let midY =
        height * ribbon.baseYPercent +
        Math.sin(x * ribbon.freq1 + time * ribbon.speed1) * ribbon.amp +
        Math.cos(x * ribbon.freq2 + time * ribbon.speed2 + rIdx * 1.5) * (ribbon.amp * 0.55);

      // Bảo vệ vùng chữ trung tâm (Center Safe Zone for Typography)
      const dx = (x - cx) / safeRx;
      const dy = (midY - cy) / safeRy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let localAlpha = ribbon.alpha;
      if (dist < 1.05) {
        // Uốn dải lụa duyên dáng vòng lên trên hoặc trễ xuống dưới vùng chữ
        const pushDir = midY < cy ? -1 : 1;
        const pushDist = (1.05 - dist) * (height * 0.16);
        midY += pushDir * pushDist;
        // Giảm bớt độ đậm ở trung tâm để tên Cô Dâu & Chú Rể luôn tinh tế, rõ ràng
        localAlpha *= 0.35 + dist * 0.65;
      }

      const th = ribbon.thickness * (1 + 0.22 * Math.sin(x * 0.0035 + time * 0.001));
      const yTop = midY - th * 0.5;
      const yBot = midY + th * 0.5;

      if (yTop < minY) minY = yTop;
      if (yBot > maxY) maxY = yBot;

      points.push({ x, yTop, yBot, yMid: midY });
    }

    if (points.length < 2) return;

    // 2.1 Vẽ mặt phẳng dải lụa với gradient ánh xà cừ satin
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].yTop);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].yTop);
    }
    for (let i = points.length - 1; i >= 0; i--) {
      ctx.lineTo(points[i].x, points[i].yBot);
    }
    ctx.closePath();

    const ribGrad = ctx.createLinearGradient(0, minY, 0, maxY);
    ribGrad.addColorStop(0, `rgba(${colors.deep.join(',')}, ${0.05 * ribbon.alpha})`);
    ribGrad.addColorStop(
      ribbon.crestShift * 0.7,
      `rgba(${colors.base.join(',')}, ${0.65 * ribbon.alpha})`
    );
    // Điểm phản chiếu ánh sáng óng ả đặc trưng của vải satin cao cấp (Specular Satin Sheen)
    ribGrad.addColorStop(
      ribbon.crestShift,
      `rgba(${colors.light.join(',')}, ${0.95 * ribbon.alpha})`
    );
    ribGrad.addColorStop(
      ribbon.crestShift + (1 - ribbon.crestShift) * 0.3,
      `rgba(${colors.base.join(',')}, ${0.55 * ribbon.alpha})`
    );
    ribGrad.addColorStop(1, `rgba(${colors.deep.join(',')}, ${0.08 * ribbon.alpha})`);

    ctx.fillStyle = ribGrad;
    ctx.fill();

    // 2.2 Vẽ đường gân nếp lụa óng ánh (Specular Highlight Edge along Crest)
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].yMid);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].yMid);
    }
    ctx.strokeStyle = `rgba(${colors.light.join(',')}, ${0.85 * ribbon.alpha * brightnessMultiplier})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.restore();
  });

  // 3. Hạt bụi lụa xà cừ óng ánh lơ lửng (Floating Pearl Dust Motes)
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

    // Giảm độ sáng nếu bay thẳng vào tâm chữ
    const dx = (m.x - cx) / safeRx;
    const dy = (m.y - cy) / safeRy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let moteAlpha = m.alpha * brightnessMultiplier * (0.6 + 0.4 * Math.sin(m.phase));
    if (dist < 1.0) {
      moteAlpha *= Math.max(0.2, dist);
    }

    ctx.save();
    ctx.fillStyle = `${colors.mote}${Math.max(0, Math.min(1, moteAlpha))})`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};

// ==========================================
// 3. MÀN HÌNH RÈM SÂN KHẤU (ROYAL STAGE CURTAINS ENGINE)
// ==========================================
export const getCurtainColors = (theme: LedTheme) => {
  switch (theme) {
    case 'gold':
      return {
        main: '#784c0c',
        highlight: '#c68f1e',
        shadow: '#291a02',
        sheen: 'rgba(255, 235, 175, ',
        goldTrim: '#fef08a',
        goldAccent: '#eab308',
      };
    case 'emerald':
      return {
        main: '#064e3b',
        highlight: '#059669',
        shadow: '#022118',
        sheen: 'rgba(167, 243, 208, ',
        goldTrim: '#fef08a',
        goldAccent: '#eab308',
      };
    case 'galaxy':
      return {
        main: '#1e1b4b',
        highlight: '#3730a3',
        shadow: '#080824',
        sheen: 'rgba(224, 231, 255, ',
        goldTrim: '#fef08a',
        goldAccent: '#eab308',
      };
    case 'champagne':
      return {
        main: '#701a35',
        highlight: '#a82c54',
        shadow: '#310614',
        sheen: 'rgba(253, 232, 240, ',
        goldTrim: '#fef08a',
        goldAccent: '#eab308',
      };
    case 'ruby':
    default:
      return {
        main: '#680517',
        highlight: '#9f122e',
        shadow: '#240107',
        sheen: 'rgba(254, 205, 211, ',
        goldTrim: '#fef08a',
        goldAccent: '#eab308',
      };
  }
};

export const drawStageCurtains = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  theme: LedTheme,
  brightnessMultiplier: number = 1.0,
  includeSpotlights: boolean = true
) => {
  const c = getCurtainColors(theme);
  const cx = width / 2;
  const cy = height * 0.48;

  // 1. ÁNH ĐÈN RỌI SÂN KHẤU (THEATRICAL DUAL SPOTLIGHTS & STAGE AMBIENCE)
  if (includeSpotlights) {
    const sway = Math.sin(time * 0.001) * (width * 0.02);
    const spotlightY = -15;

    // 1.1 Luồng đèn rọi từ góc trái (Left Spotlight Cone)
    const leftSourceX = width * 0.06;
    const coneGrad1 = ctx.createRadialGradient(
      leftSourceX,
      spotlightY,
      20,
      cx + sway,
      cy,
      Math.max(width, height) * 0.65
    );
    coneGrad1.addColorStop(0, `rgba(255, 248, 220, ${0.22 * brightnessMultiplier})`);
    coneGrad1.addColorStop(0.35, `rgba(255, 235, 175, ${0.08 * brightnessMultiplier})`);
    coneGrad1.addColorStop(1, 'rgba(255, 225, 140, 0)');

    ctx.save();
    ctx.fillStyle = coneGrad1;
    ctx.beginPath();
    ctx.moveTo(leftSourceX, spotlightY);
    ctx.lineTo(cx + sway - width * 0.26, height);
    ctx.lineTo(cx + sway + width * 0.22, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 1.2 Luồng đèn rọi từ góc phải (Right Spotlight Cone)
    const rightSourceX = width * 0.94;
    const coneGrad2 = ctx.createRadialGradient(
      rightSourceX,
      spotlightY,
      20,
      cx - sway,
      cy,
      Math.max(width, height) * 0.65
    );
    coneGrad2.addColorStop(0, `rgba(255, 248, 220, ${0.22 * brightnessMultiplier})`);
    coneGrad2.addColorStop(0.35, `rgba(255, 235, 175, ${0.08 * brightnessMultiplier})`);
    coneGrad2.addColorStop(1, 'rgba(255, 225, 140, 0)');

    ctx.save();
    ctx.fillStyle = coneGrad2;
    ctx.beginPath();
    ctx.moveTo(rightSourceX, spotlightY);
    ctx.lineTo(cx - sway - width * 0.22, height);
    ctx.lineTo(cx - sway + width * 0.26, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 1.3 Quầng sáng hội tụ trung tâm sân khấu (Center Stage Stagepool)
    const poolGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.38);
    poolGrad.addColorStop(0, `rgba(255, 248, 220, ${0.14 * brightnessMultiplier})`);
    poolGrad.addColorStop(0.45, `rgba(255, 235, 160, ${0.05 * brightnessMultiplier})`);
    poolGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.fillStyle = poolGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, width * 0.38, height * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 1.4 Đèn hắt sàn sân khấu (Stage Footlights Uplighting)
    const footGrad = ctx.createLinearGradient(0, height, 0, height - height * 0.16);
    footGrad.addColorStop(0, `rgba(254, 240, 138, ${0.15 * brightnessMultiplier})`);
    footGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.fillStyle = footGrad;
    ctx.fillRect(0, height - height * 0.16, width, height * 0.16);
    ctx.restore();
  }

  // 2. KHUNG RÈM NHUNG HAI BÊN SÂN KHẤU (LEFT & RIGHT VELVET PROSCENIUM DRAPES)
  const drawSideCurtain = (isRight: boolean) => {
    ctx.save();
    if (isRight) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    const topSpan = width * 0.22;
    const tieX = width * 0.075;
    const tieY = height * 0.55;
    const botSpan = width * 0.16;
    const pleatCount = 8;

    // Vẽ từng nếp gấp nhung 3D (Cylindrical Velvet Pleats)
    for (let i = 0; i < pleatCount; i++) {
      const frac1 = i / pleatCount;
      const frac2 = (i + 1) / pleatCount;

      const xTop1 = frac1 * topSpan;
      const xTop2 = frac2 * topSpan;

      const xMid1 = tieX + frac1 * (width * 0.045);
      const xMid2 = tieX + frac2 * (width * 0.045);

      const xBot1 = frac1 * botSpan;
      const xBot2 = frac2 * botSpan;

      // Đường viền cong xếp nếp tự nhiên
      ctx.beginPath();
      ctx.moveTo(xTop1, 0);
      ctx.quadraticCurveTo(xMid1 - 10, tieY * 0.55, xMid1, tieY);
      ctx.quadraticCurveTo(xMid1 + 10, tieY + (height - tieY) * 0.45, xBot1, height);
      ctx.lineTo(xBot2, height);
      ctx.quadraticCurveTo(xMid2 + 10, tieY + (height - tieY) * 0.45, xMid2, tieY);
      ctx.quadraticCurveTo(xMid2 - 10, tieY * 0.55, xTop2, 0);
      ctx.closePath();

      // Phối màu đổ bóng nhung sang trọng
      const midPointX = (xMid1 + xMid2) / 2;
      const pleatGrad = ctx.createLinearGradient(xMid1, 0, xMid2, 0);
      pleatGrad.addColorStop(0, c.shadow);
      pleatGrad.addColorStop(0.35, c.highlight);
      pleatGrad.addColorStop(0.7, c.main);
      pleatGrad.addColorStop(1, c.shadow);

      ctx.fillStyle = pleatGrad;
      ctx.fill();

      // Sọc sáng nhung ở sống nếp gấp (Velvet Ridge Highlight)
      ctx.strokeStyle = `${c.sheen}0.18)`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo((xTop1 + xTop2) / 2, 0);
      ctx.quadraticCurveTo(midPointX - 10, tieY * 0.55, midPointX, tieY);
      ctx.quadraticCurveTo(midPointX + 10, tieY + (height - tieY) * 0.45, (xBot1 + xBot2) / 2, height);
      ctx.stroke();
    }

    // 2.2 Dây nơ thắt rèm hoàng gia & Chùm tua rua chỉ vàng (Golden Rope & Tassel Tieback)
    const cordX = tieX + width * 0.022;
    const cordY = tieY;

    // Dây xoắn kim loại vàng cuốn quanh rèm
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cordX, cordY, width * 0.03, 10, 0.15, 0, Math.PI * 2);
    const cordGrad = ctx.createLinearGradient(cordX - 30, cordY - 10, cordX + 30, cordY + 10);
    cordGrad.addColorStop(0, '#92400e');
    cordGrad.addColorStop(0.4, '#fde047');
    cordGrad.addColorStop(0.8, '#fef08a');
    cordGrad.addColorStop(1, '#b45309');
    ctx.strokeStyle = cordGrad;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Nút thắt nơ vàng kim hoàng gia
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(cordX + width * 0.022, cordY + 4, 7, 0, Math.PI * 2);
    ctx.fill();

    // Chùm tua rua chỉ vàng rủ xuống (Gold Fringe Tassels)
    const tasselBaseX = cordX + width * 0.022;
    const tasselBaseY = cordY + 10;
    const tasselLen = Math.min(42, height * 0.07);

    // Bầu tua rua
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(tasselBaseX, tasselBaseY + 6, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sợi tua rua rủ xuống
    ctx.lineWidth = 1.5;
    for (let f = -4; f <= 4; f++) {
      ctx.strokeStyle = f % 2 === 0 ? '#fef08a' : '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(tasselBaseX + f * 1.4, tasselBaseY + 12);
      ctx.lineTo(tasselBaseX + f * 2.2, tasselBaseY + 12 + tasselLen);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  };

  // Vẽ rèm bên trái & rèm bên phải
  drawSideCurtain(false);
  drawSideCurtain(true);

  // 3. YẾM RÈM VÒM KHÁN ĐÀI PHÍA TRÊN CÙNG (SCALLOPED PROSCENIUM VALANCE & GOLD FRINGE)
  const valanceH = Math.min(85, height * 0.125);
  const scallopCount = 5; // 5 vòm uốn cong đối xứng chuẩn sảnh tiệc hoàng gia
  const scallopW = width / scallopCount;

  for (let s = 0; s < scallopCount; s++) {
    const xStart = s * scallopW;
    const xEnd = (s + 1) * scallopW;
    const xMid = (xStart + xEnd) / 2;
    const dipY = valanceH * 0.88;

    // Mặt phẳng yếm rèm vòm cong (Scalloped Arc)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xStart, 0);
    ctx.lineTo(xEnd, 0);
    ctx.quadraticCurveTo(xMid + (xEnd - xMid) * 0.45, dipY, xMid, dipY);
    ctx.quadraticCurveTo(xMid - (xMid - xStart) * 0.45, dipY, xStart, 0);
    ctx.closePath();

    const valGrad = ctx.createLinearGradient(0, 0, 0, dipY);
    valGrad.addColorStop(0, c.shadow);
    valGrad.addColorStop(0.3, c.main);
    valGrad.addColorStop(0.7, c.highlight);
    valGrad.addColorStop(0.95, c.main);
    valGrad.addColorStop(1, c.shadow);

    ctx.fillStyle = valGrad;
    ctx.fill();

    // Nếp nhung tỏa nan quạt trên mỗi vòm
    ctx.strokeStyle = `${c.sheen}0.15)`;
    ctx.lineWidth = 1.2;
    for (let r = 1; r <= 3; r++) {
      const rx = xStart + (r / 4) * scallopW;
      ctx.beginPath();
      ctx.moveTo(rx, 5);
      ctx.quadraticCurveTo(xMid, dipY * 0.65, xMid, dipY);
      ctx.stroke();
    }

    // Dây viền chỉ vàng hoàng gia uốn lượn theo vòm (Gold Trim Band)
    ctx.beginPath();
    ctx.moveTo(xStart, 0);
    ctx.quadraticCurveTo(xMid - (xMid - xStart) * 0.45, dipY, xMid, dipY);
    ctx.quadraticCurveTo(xMid + (xEnd - xMid) * 0.45, dipY, xEnd, 0);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hạt cườm / tua rua vàng rủ xuống dọc theo đường cong
    const beadCount = 9;
    for (let b = 1; b < beadCount; b++) {
      const t = b / beadCount;
      // Điểm trên cung quadratic
      const bx = (1 - t) * (1 - t) * xStart + 2 * (1 - t) * t * xMid + t * t * xEnd;
      const by = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * dipY + t * t * 0;

      // Sợi tua rua nhỏ 6px
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by + 8);
      ctx.stroke();

      // Hạt ngọc / cườm vàng
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx, by + 9, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 3.1 Thanh xà ngang vàng kim hoàng gia trên cùng (Top Golden Pelmet Bar)
  const barH = 14;
  const barGrad = ctx.createLinearGradient(0, 0, 0, barH);
  barGrad.addColorStop(0, '#78350f');
  barGrad.addColorStop(0.35, '#fde047');
  barGrad.addColorStop(0.65, '#fef08a');
  barGrad.addColorStop(1, '#92400e');

  ctx.save();
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, width, barH);

  // Đường viền kim loại sáng
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, barH);
  ctx.restore();

  // 3.2 Huy hiệu hoàng gia ở chính giữa yếm rèm (Center Royal Golden Crest)
  ctx.save();
  const crestX = width / 2;
  const crestY = valanceH * 0.42;

  // Hào quang huy hiệu
  const crestHalo = ctx.createRadialGradient(crestX, crestY, 2, crestX, crestY, 24);
  crestHalo.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
  crestHalo.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = crestHalo;
  ctx.beginPath();
  ctx.arc(crestX, crestY, 24, 0, Math.PI * 2);
  ctx.fill();

  // Vòng ngọc huy hiệu vàng
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(crestX, crestY, 9, 0, Math.PI * 2);
  ctx.fill();

  // Viền ngoài huy hiệu
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ngôi sao 8 cánh hoàng gia trong huy hiệu
  drawDiamondStar(ctx, crestX, crestY, 6, 1.0, '#ffffff', 8, 1.0);
  ctx.restore();
};
