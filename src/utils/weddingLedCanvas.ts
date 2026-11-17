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

/**
 * Vẽ trọn vẹn Phông Nền Màn Hình Lụa Satin (Full-Bleed Satin Silk Backdrop)
 * Bao gồm:
 * 1. Toàn bộ nền phủ rèm lụa dập ly satin mềm mại từ trần xuống sàn (Full-bleed vertical satin pleats)
 * 2. Các dải sóng lụa uốn lượn bay bổng phía trước (Flowing wavy silk ribbon cascades)
 * 3. Điểm nhấn ánh xà cừ óng ả (Specular Satin Sheen) di chuyển theo thời gian thực
 * 4. Quầng sáng bảo vệ chữ trung tâm (Center Typography Safe Zone Halo)
 * 5. Bụi lụa xà cừ lơ lửng (Floating Pearl Dust Motes)
 */
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

  // ========================================================
  // BƯỚC 1: LỚP PHÔNG LỤA SATIN DẬP LY PHỦ KÍN TOÀN BỘ MÀN HÌNH (FULL-BLEED SATIN DRAPES)
  // ========================================================
  // Chiều rộng mỗi nếp dập ly lụa (~50px - 70px tùy độ phân giải màn hình)
  const foldWidth = Math.max(42, Math.min(75, width / 22));
  const foldCount = Math.ceil(width / foldWidth) + 2;

  // Lớp gradient nền vải lụa tổng thể
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0, colors.bgStart);
  baseGrad.addColorStop(0.5, `rgba(${colors.base.join(',')}, 0.85)`);
  baseGrad.addColorStop(1, colors.bgEnd);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Vẽ từng nếp gấp lụa satin dập ly mềm mại trải dài toàn bộ chiều ngang
  for (let i = 0; i < foldCount; i++) {
    const xBase = (i - 1) * foldWidth;
    const pleatPoints: Array<{ xLeft: number; xRight: number; xMid: number; y: number }> = [];

    const yStep = 25;
    for (let y = 0; y <= height; y += yStep) {
      // Chuyển động lượn sóng tự nhiên của vải lụa treo rủ
      const waveOffset =
        Math.sin(y * 0.0035 + time * 0.0012 * speedMultiplier + i * 0.35) * 16 +
        Math.cos(y * 0.007 + time * 0.0018 * speedMultiplier + i * 0.5) * 8;

      const xL = xBase + waveOffset;
      const xR = xBase + foldWidth + waveOffset;
      const xM = (xL + xR) / 2;

      pleatPoints.push({ xLeft: xL, xRight: xR, xMid: xM, y });
    }

    if (pleatPoints.length < 2) continue;

    // Mặt phẳng nếp gấp dập ly
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pleatPoints[0].xLeft, pleatPoints[0].y);
    for (let p = 1; p < pleatPoints.length; p++) {
      ctx.lineTo(pleatPoints[p].xLeft, pleatPoints[p].y);
    }
    for (let p = pleatPoints.length - 1; p >= 0; p--) {
      ctx.lineTo(pleatPoints[p].xRight, pleatPoints[p].y);
    }
    ctx.closePath();

    // Gradient hình trụ 3D mô phỏng độ phản quang của vải lụa satin (Cylindrical Satin Lighting)
    const pleatGrad = ctx.createLinearGradient(xBase, 0, xBase + foldWidth, 0);
    pleatGrad.addColorStop(0, `rgba(${colors.deep.join(',')}, 0.82)`);
    pleatGrad.addColorStop(0.35, `rgba(${colors.base.join(',')}, 0.95)`);
    // Điểm phản quang satin lấp lánh (Gleam highlight)
    const gleamShift = 0.5 + Math.sin(time * 0.0015 * speedMultiplier + i) * 0.08;
    pleatGrad.addColorStop(
      Math.max(0.4, Math.min(0.6, gleamShift)),
      `rgba(${colors.light.join(',')}, ${0.85 * brightnessMultiplier})`
    );
    pleatGrad.addColorStop(0.75, `rgba(${colors.base.join(',')}, 0.95)`);
    pleatGrad.addColorStop(1, `rgba(${colors.deep.join(',')}, 0.82)`);

    ctx.fillStyle = pleatGrad;
    ctx.fill();

    // Đường gân óng ánh dọc theo sống nếp vải lụa (Specular Ridge Sheen)
    ctx.beginPath();
    ctx.moveTo(pleatPoints[0].xMid, pleatPoints[0].y);
    for (let p = 1; p < pleatPoints.length; p++) {
      ctx.lineTo(pleatPoints[p].xMid, pleatPoints[p].y);
    }
    ctx.strokeStyle = `rgba(${colors.light.join(',')}, ${0.35 * brightnessMultiplier})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  // ========================================================
  // BƯỚC 2: CÁC DẢI LỤA SATIN BAY UỐN LƯỢN ĐA TẦNG PHÍA TRƯỚC (WAVY SILK OVERLAYS)
  // ========================================================
  const ribbons = [
    // Dải lụa 1: Lướt nhẹ phía trên (Swoop Upper)
    {
      baseYPercent: 0.22,
      amp: height * 0.065,
      freq1: 0.0028,
      freq2: 0.0055,
      speed1: 0.0012 * speedMultiplier,
      speed2: 0.0019 * speedMultiplier,
      thickness: height * 0.22,
      alpha: 0.55 * brightnessMultiplier,
      crestShift: 0.45,
    },
    // Dải lụa 2: Dải lụa chính uốn lượn ôm quanh vùng chữ (Main Flowing Silk Drape)
    {
      baseYPercent: 0.48,
      amp: height * 0.085,
      freq1: 0.0022,
      freq2: 0.0042,
      speed1: 0.0009 * speedMultiplier,
      speed2: 0.0016 * speedMultiplier,
      thickness: height * 0.28,
      alpha: 0.48 * brightnessMultiplier,
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
      thickness: height * 0.26,
      alpha: 0.58 * brightnessMultiplier,
      crestShift: 0.55,
    },
  ];

  ribbons.forEach((ribbon, rIdx) => {
    const step = 20;
    const points: Array<{ x: number; yTop: number; yBot: number; yMid: number }> = [];

    let minY = height;
    let maxY = 0;

    for (let x = -40; x <= width + 40; x += step) {
      let midY =
        height * ribbon.baseYPercent +
        Math.sin(x * ribbon.freq1 + time * ribbon.speed1) * ribbon.amp +
        Math.cos(x * ribbon.freq2 + time * ribbon.speed2 + rIdx * 1.5) * (ribbon.amp * 0.55);

      // Bảo vệ vùng chữ trung tâm
      const dx = (x - cx) / safeRx;
      const dy = (midY - cy) / safeRy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1.05) {
        const pushDir = midY < cy ? -1 : 1;
        const pushDist = (1.05 - dist) * (height * 0.15);
        midY += pushDir * pushDist;
      }

      const th = ribbon.thickness * (1 + 0.22 * Math.sin(x * 0.0035 + time * 0.001));
      const yTop = midY - th * 0.5;
      const yBot = midY + th * 0.5;

      if (yTop < minY) minY = yTop;
      if (yBot > maxY) maxY = yBot;

      points.push({ x, yTop, yBot, yMid: midY });
    }

    if (points.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].yTop);
    for (let p = 1; p < points.length; p++) ctx.lineTo(points[p].x, points[p].yTop);
    for (let p = points.length - 1; p >= 0; p--) ctx.lineTo(points[p].x, points[p].yBot);
    ctx.closePath();

    const ribGrad = ctx.createLinearGradient(0, minY, 0, maxY);
    ribGrad.addColorStop(0, `rgba(${colors.deep.join(',')}, ${0.15 * ribbon.alpha})`);
    ribGrad.addColorStop(0.35, `rgba(${colors.base.join(',')}, ${0.75 * ribbon.alpha})`);
    ribGrad.addColorStop(ribbon.crestShift, `rgba(${colors.light.join(',')}, ${0.98 * ribbon.alpha})`);
    ribGrad.addColorStop(0.7, `rgba(${colors.base.join(',')}, ${0.65 * ribbon.alpha})`);
    ribGrad.addColorStop(1, `rgba(${colors.deep.join(',')}, ${0.15 * ribbon.alpha})`);

    ctx.fillStyle = ribGrad;
    ctx.fill();

    // Sọc sáng lụa óng ánh
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].yMid);
    for (let p = 1; p < points.length; p++) ctx.lineTo(points[p].x, points[p].yMid);
    ctx.strokeStyle = `rgba(${colors.light.join(',')}, ${0.9 * ribbon.alpha * brightnessMultiplier})`;
    ctx.lineWidth = 2.0;
    ctx.stroke();

    ctx.restore();
  });

  // ========================================================
  // BƯỚC 3: QUẦNG SÁNG BẢO VỆ CHỮ TRUNG TÂM (CENTER TYPOGRAPHY ILLUMINATION ZONE)
  // ========================================================
  // Tạo quầng sáng dịu nhẹ ở tâm giúp chữ vàng kim / trắng luôn nổi bật sắc nét tuyệt đối
  const centerHalo = ctx.createRadialGradient(cx, cy, width * 0.1, cx, cy, width * 0.42);
  centerHalo.addColorStop(0, `rgba(${colors.deep.join(',')}, 0.42)`);
  centerHalo.addColorStop(0.6, `rgba(${colors.deep.join(',')}, 0.20)`);
  centerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.save();
  ctx.fillStyle = centerHalo;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // ========================================================
  // BƯỚC 4: HẠT BỤI LỤA XÀ CỪ LƠ LỬNG (FLOATING PEARL DUST MOTES)
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

// ==========================================
// 3. PHÔNG NỀN RÈM SÂN KHẤU (THEATRICAL VELVET STAGE CURTAINS)
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
        bgDark: '#1c1102',
      };
    case 'emerald':
      return {
        main: '#064e3b',
        highlight: '#059669',
        shadow: '#022118',
        sheen: 'rgba(167, 243, 208, ',
        goldTrim: '#fef08a',
        goldAccent: '#eab308',
        bgDark: '#01150f',
      };
    case 'galaxy':
      return {
        main: '#1a1f4b',
        highlight: '#323f8c',
        shadow: '#060a1c',
        sheen: 'rgba(224, 231, 255, ',
        goldTrim: '#fef08a',
        goldAccent: '#eab308',
        bgDark: '#040717',
      };
    case 'champagne':
      return {
        main: '#701a35',
        highlight: '#a82c54',
        shadow: '#310614',
        sheen: 'rgba(253, 232, 240, ',
        goldTrim: '#fef08a',
        goldAccent: '#eab308',
        bgDark: '#18040a',
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
        bgDark: '#170104',
      };
  }
};

/**
 * Vẽ trọn vẹn Phông Nền Rèm Sân Khấu (Theatrical Velvet Stage Curtains)
 * Bao gồm:
 * 1. Phông rèm nhung hậu đài xếp ly phủ kín toàn bộ màn hình (Full-bleed velvet backdrop drapes)
 * 2. Hai cánh rèm nhung lớn hai bên được vén duyên dáng bằng dây thắt nơ & chùm tua rua chỉ vàng (Grand side swags with golden tassels)
 * 3. Yếm rèm vòm trên cùng (Proscenium Valance) với 5 vòm uốn cong, viền chỉ vàng và huy hiệu vương miện hoàng gia
 * 4. Hai luồng đèn rọi sân khấu quét chéo (Dual Theatrical Spotlights) hội tụ rọi sáng tên Cô Dâu & Chú Rể
 * 5. Dàn đèn hắt chân sàn sân khấu (Stage Footlights Uplighting)
 * 6. Bụi vàng kim lung linh trong luồng sáng (Golden Spotlight Stardust)
 */
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

  // ========================================================
  // BƯỚC 1: PHÔNG RÈM NHUNG HẬU ĐÀI PHỦ KÍN TOÀN MÀN HÌNH (FULL-BLEED VELVET BACKDROP)
  // ========================================================
  // Nền nhung tối sân khấu
  ctx.save();
  ctx.fillStyle = c.bgDark;
  ctx.fillRect(0, 0, width, height);

  // Vẽ các nếp xếp ly nhung chạy dọc toàn màn hình phía sau
  const backPleatWidth = Math.max(36, Math.min(60, width / 26));
  const backPleatCount = Math.ceil(width / backPleatWidth) + 1;

  for (let b = 0; b < backPleatCount; b++) {
    const xLeft = b * backPleatWidth;
    const xRight = (b + 1) * backPleatWidth;
    const xMid = (xLeft + xRight) / 2;

    // Gradient hình trụ nếp nhung
    const pleatGrad = ctx.createLinearGradient(xLeft, 0, xRight, 0);
    pleatGrad.addColorStop(0, c.shadow);
    pleatGrad.addColorStop(0.35, c.highlight);
    pleatGrad.addColorStop(0.65, c.main);
    pleatGrad.addColorStop(1, c.shadow);

    ctx.fillStyle = pleatGrad;
    ctx.fillRect(xLeft, 0, backPleatWidth + 1, height);

    // Đường gân nhung thanh mảnh
    ctx.strokeStyle = `${c.sheen}0.12)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xMid, 0);
    ctx.lineTo(xMid, height);
    ctx.stroke();
  }
  ctx.restore();

  // ========================================================
  // BƯỚC 2: ÁNH ĐÈN RỌI SÂN KHẤU (THEATRICAL DUAL SPOTLIGHTS & STAGE AMBIENCE)
  // ========================================================
  if (includeSpotlights) {
    const sway = Math.sin(time * 0.001) * (width * 0.02);
    const spotlightY = -15;

    // 2.1 Luồng đèn rọi từ góc trái (Left Spotlight Cone)
    const leftSourceX = width * 0.06;
    const coneGrad1 = ctx.createRadialGradient(
      leftSourceX,
      spotlightY,
      20,
      cx + sway,
      cy,
      Math.max(width, height) * 0.68
    );
    coneGrad1.addColorStop(0, `rgba(255, 248, 220, ${0.25 * brightnessMultiplier})`);
    coneGrad1.addColorStop(0.35, `rgba(255, 235, 175, ${0.09 * brightnessMultiplier})`);
    coneGrad1.addColorStop(1, 'rgba(255, 225, 140, 0)');

    ctx.save();
    ctx.fillStyle = coneGrad1;
    ctx.beginPath();
    ctx.moveTo(leftSourceX, spotlightY);
    ctx.lineTo(cx + sway - width * 0.28, height);
    ctx.lineTo(cx + sway + width * 0.24, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2.2 Luồng đèn rọi từ góc phải (Right Spotlight Cone)
    const rightSourceX = width * 0.94;
    const coneGrad2 = ctx.createRadialGradient(
      rightSourceX,
      spotlightY,
      20,
      cx - sway,
      cy,
      Math.max(width, height) * 0.68
    );
    coneGrad2.addColorStop(0, `rgba(255, 248, 220, ${0.25 * brightnessMultiplier})`);
    coneGrad2.addColorStop(0.35, `rgba(255, 235, 175, ${0.09 * brightnessMultiplier})`);
    coneGrad2.addColorStop(1, 'rgba(255, 225, 140, 0)');

    ctx.save();
    ctx.fillStyle = coneGrad2;
    ctx.beginPath();
    ctx.moveTo(rightSourceX, spotlightY);
    ctx.lineTo(cx - sway - width * 0.24, height);
    ctx.lineTo(cx - sway + width * 0.28, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2.3 Quầng sáng hội tụ trung tâm sân khấu (Center Stagepool)
    const poolGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.38);
    poolGrad.addColorStop(0, `rgba(255, 248, 220, ${0.16 * brightnessMultiplier})`);
    poolGrad.addColorStop(0.45, `rgba(255, 235, 160, ${0.06 * brightnessMultiplier})`);
    poolGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.fillStyle = poolGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, width * 0.38, height * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2.4 Đèn hắt sàn sân khấu (Stage Footlights Uplighting)
    const footGrad = ctx.createLinearGradient(0, height, 0, height - height * 0.16);
    footGrad.addColorStop(0, `rgba(254, 240, 138, ${0.18 * brightnessMultiplier})`);
    footGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.fillStyle = footGrad;
    ctx.fillRect(0, height - height * 0.16, width, height * 0.16);
    ctx.restore();
  }

  // ========================================================
  // BƯỚC 3: HAI CÁNH RÈM NHUNG LỚN HAI BÊN SÂN KHẤU (LEFT & RIGHT VELVET DRAPES)
  // ========================================================
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

    for (let i = 0; i < pleatCount; i++) {
      const frac1 = i / pleatCount;
      const frac2 = (i + 1) / pleatCount;

      const xTop1 = frac1 * topSpan;
      const xTop2 = frac2 * topSpan;

      const xMid1 = tieX + frac1 * (width * 0.045);
      const xMid2 = tieX + frac2 * (width * 0.045);

      const xBot1 = frac1 * botSpan;
      const xBot2 = frac2 * botSpan;

      ctx.beginPath();
      ctx.moveTo(xTop1, 0);
      ctx.quadraticCurveTo(xMid1 - 10, tieY * 0.55, xMid1, tieY);
      ctx.quadraticCurveTo(xMid1 + 10, tieY + (height - tieY) * 0.45, xBot1, height);
      ctx.lineTo(xBot2, height);
      ctx.quadraticCurveTo(xMid2 + 10, tieY + (height - tieY) * 0.45, xMid2, tieY);
      ctx.quadraticCurveTo(xMid2 - 10, tieY * 0.55, xTop2, 0);
      ctx.closePath();

      const midPointX = (xMid1 + xMid2) / 2;
      const pleatGrad = ctx.createLinearGradient(xMid1, 0, xMid2, 0);
      pleatGrad.addColorStop(0, c.shadow);
      pleatGrad.addColorStop(0.35, c.highlight);
      pleatGrad.addColorStop(0.7, c.main);
      pleatGrad.addColorStop(1, c.shadow);

      ctx.fillStyle = pleatGrad;
      ctx.fill();

      // Sọc sáng nhung ở sống nếp gấp
      ctx.strokeStyle = `${c.sheen}0.25)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo((xTop1 + xTop2) / 2, 0);
      ctx.quadraticCurveTo(midPointX - 10, tieY * 0.55, midPointX, tieY);
      ctx.quadraticCurveTo(midPointX + 10, tieY + (height - tieY) * 0.45, (xBot1 + xBot2) / 2, height);
      ctx.stroke();
    }

    // Dây nơ thắt rèm hoàng gia & Chùm tua rua chỉ vàng
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
    ctx.lineWidth = 5.5;
    ctx.stroke();

    // Nút thắt nơ vàng kim
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(cordX + width * 0.022, cordY + 4, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Chùm tua rua chỉ vàng rủ xuống
    const tasselBaseX = cordX + width * 0.022;
    const tasselBaseY = cordY + 10;
    const tasselLen = Math.min(45, height * 0.075);

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(tasselBaseX, tasselBaseY + 6, 6.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 1.6;
    for (let f = -4; f <= 4; f++) {
      ctx.strokeStyle = f % 2 === 0 ? '#fef08a' : '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(tasselBaseX + f * 1.5, tasselBaseY + 12);
      ctx.lineTo(tasselBaseX + f * 2.4, tasselBaseY + 12 + tasselLen);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  };

  drawSideCurtain(false);
  drawSideCurtain(true);

  // ========================================================
  // BƯỚC 4: YẾM RÈM VÒM KHÁN ĐÀI PHÍA TRÊN CÙNG (SCALLOPED PROSCENIUM VALANCE)
  // ========================================================
  const valanceH = Math.min(88, height * 0.128);
  const scallopCount = 5;
  const scallopW = width / scallopCount;

  for (let s = 0; s < scallopCount; s++) {
    const xStart = s * scallopW;
    const xEnd = (s + 1) * scallopW;
    const xMid = (xStart + xEnd) / 2;
    const dipY = valanceH * 0.88;

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

    // Nếp nhung tỏa nan quạt
    ctx.strokeStyle = `${c.sheen}0.18)`;
    ctx.lineWidth = 1.2;
    for (let r = 1; r <= 3; r++) {
      const rx = xStart + (r / 4) * scallopW;
      ctx.beginPath();
      ctx.moveTo(rx, 5);
      ctx.quadraticCurveTo(xMid, dipY * 0.65, xMid, dipY);
      ctx.stroke();
    }

    // Dây viền chỉ vàng hoàng gia uốn lượn
    ctx.beginPath();
    ctx.moveTo(xStart, 0);
    ctx.quadraticCurveTo(xMid - (xMid - xStart) * 0.45, dipY, xMid, dipY);
    ctx.quadraticCurveTo(xMid + (xEnd - xMid) * 0.45, dipY, xEnd, 0);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.8;
    ctx.stroke();

    // Hạt cườm / tua rua vàng rủ xuống
    const beadCount = 9;
    for (let b = 1; b < beadCount; b++) {
      const t = b / beadCount;
      const bx = (1 - t) * (1 - t) * xStart + 2 * (1 - t) * t * xMid + t * t * xEnd;
      const by = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * dipY + t * t * 0;

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by + 9);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx, by + 10, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 4.1 Thanh xà ngang vàng kim hoàng gia trên cùng
  const barH = 15;
  const barGrad = ctx.createLinearGradient(0, 0, 0, barH);
  barGrad.addColorStop(0, '#78350f');
  barGrad.addColorStop(0.35, '#fde047');
  barGrad.addColorStop(0.65, '#fef08a');
  barGrad.addColorStop(1, '#92400e');

  ctx.save();
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, width, barH);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(0, 0, width, barH);
  ctx.restore();

  // 4.2 Huy hiệu hoàng gia ở chính giữa yếm rèm
  ctx.save();
  const crestX = width / 2;
  const crestY = valanceH * 0.42;

  const crestHalo = ctx.createRadialGradient(crestX, crestY, 2, crestX, crestY, 26);
  crestHalo.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
  crestHalo.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = crestHalo;
  ctx.beginPath();
  ctx.arc(crestX, crestY, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(crestX, crestY, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  drawDiamondStar(ctx, crestX, crestY, 7, 1.0, '#ffffff', 8, 1.0);
  ctx.restore();
};
