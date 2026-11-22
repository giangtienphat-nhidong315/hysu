/**
 * UTILITY ĐỒNG BỘ VÀ NÉN DỮ LIỆU ĐÁM CƯỚI (SYNC & COMPRESSION PROTOCOL)
 * Hỗ trợ:
 * 1. Nén toàn bộ dữ liệu ứng dụng thành URL Token siêu gọn để truyền qua QR / Link giữa các máy tính & điện thoại.
 * 2. Đóng gói 100% cấu hình màn hình LED (tên cặp đôi, hai họ, ngày giờ, sảnh tiệc, 4 slide, màu sắc, hiệu ứng) vào link chiếu cho nhà hàng.
 */

import { LedScreenSettings } from '../components/WeddingLedScreenPage';

// Helper chuyển chuỗi UTF-8 sang Base64 an toàn trên mọi trình duyệt
export const utf8ToBase64 = (str: string): string => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

// Helper giải mã Base64 về chuỗi UTF-8 tiếng Việt nguyên vẹn
export const base64ToUtf8 = (str: string): string => {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
};

// ==========================================
// 1. ĐỒNG BỘ MÀN HÌNH LED CHO NHÀ HÀNG
// ==========================================

export interface CompactLedPayload {
  ct?: string; // ceremonyTitle
  gn: string;  // groomName
  bn: string;  // brideName
  gp?: string; // groomParents
  bp?: string; // brideParents
  d: string;   // weddingDate
  ld?: string; // lunarDate
  t?: string;  // weddingTime
  v?: string;  // venue
  hn?: string; // hallName
  lq?: string; // loveQuote
  th?: string; // theme
  mp?: string; // motionPattern
  ff?: string; // fontFamily
  tc?: string; // textColorTheme
  fs?: string; // fontSizePreset
  nc?: string; // nameTextCase
  ts?: number; // textScale
  dm?: string; // displayMode
  spd?: number; // transitionSpeedSeconds
  es?: number[]; // enabledSlides
  scs?: Record<number, number>; // slideScales
  sct?: Record<number, string>; // slideColorThemes
  scc?: Record<number, string>; // slideCustomColors
  // Slide texts
  cb?: string; // slideCoupleBadge
  ft?: string; // slideFamilyTitle
  gfl?: string; // slideGroomFamilyLabel
  bfl?: string; // slideBrideFamilyLabel
  fq?: string; // slideFamilyQuote
  dt?: string; // slideDateTitle
  dn?: string; // slideDateNote
  qt?: string; // slideQuoteTitle
  qe?: string; // slideQuoteEnding
  // Visual effects
  bgd?: number; // bgDarkness
  bgb?: number; // bgBlur
  stm?: boolean; // showMeteors
  sts?: boolean; // showTwinklingStars
  sz?: boolean;  // starCenterSafeZone
  sb?: number;  // starBrightness
  mu?: string;  // musicUrl
  mt?: string;  // musicTitle
  sheet?: string; // google sheet webhook for live sync
}

/**
 * Đóng gói toàn bộ cấu hình LED thành token URL siêu nhẹ (~1KB)
 */
export const packLedData = (settings: LedScreenSettings, sheetUrl?: string): string => {
  try {
    const payload: CompactLedPayload = {
      ct: settings.ceremonyTitle || 'LỄ THÀNH HÔN',
      gn: settings.groomName,
      bn: settings.brideName,
      gp: settings.groomParents,
      bp: settings.brideParents,
      d: settings.weddingDate,
      ld: settings.lunarDate,
      t: settings.weddingTime,
      v: settings.venue,
      hn: settings.hallName,
      lq: settings.loveQuote,
      th: settings.theme,
      mp: settings.motionPattern,
      ff: settings.fontFamily,
      tc: settings.textColorTheme,
      fs: settings.fontSizePreset,
      nc: settings.nameTextCase,
      ts: settings.textScale,
      dm: settings.displayMode,
      spd: settings.transitionSpeedSeconds,
      es: settings.enabledSlides,
      scs: settings.slideScales,
      sct: settings.slideColorThemes as any,
      scc: settings.slideCustomColors,
      cb: settings.slideCoupleBadge,
      ft: settings.slideFamilyTitle,
      gfl: settings.slideGroomFamilyLabel,
      bfl: settings.slideBrideFamilyLabel,
      fq: settings.slideFamilyQuote,
      dt: settings.slideDateTitle,
      dn: settings.slideDateNote,
      qt: settings.slideQuoteTitle,
      qe: settings.slideQuoteEnding,
      bgd: settings.bgDarkness,
      bgb: settings.bgBlur,
      stm: settings.showMeteors,
      sts: settings.showTwinklingStars,
      sz: settings.starCenterSafeZone,
      sb: settings.starBrightness,
      mu: settings.musicUrl?.startsWith('http') ? settings.musicUrl : undefined,
      mt: settings.musicTitle,
      sheet: sheetUrl,
    };

    const json = JSON.stringify(payload);
    return encodeURIComponent(utf8ToBase64(json));
  } catch (e) {
    console.error('Lỗi đóng gói LED data:', e);
    return '';
  }
};

/**
 * Giải mã token URL thành cấu hình LED hoàn chỉnh cho trang chiếu
 */
export const unpackLedData = (token: string): Partial<LedScreenSettings> & { sheetWebhook?: string } | null => {
  if (!token) return null;
  try {
    const decodedToken = decodeURIComponent(token);
    const jsonStr = base64ToUtf8(decodedToken);
    const p: CompactLedPayload = JSON.parse(jsonStr);

    if (!p.gn && !p.bn) return null;

    return {
      ceremonyTitle: p.ct || 'LỄ THÀNH HÔN',
      groomName: p.gn,
      brideName: p.bn,
      groomParents: p.gp || '',
      brideParents: p.bp || '',
      weddingDate: p.d || '',
      lunarDate: p.ld || '',
      weddingTime: p.t || '11:00',
      venue: p.v || '',
      hallName: p.hn || '',
      loveQuote: p.lq || '',
      theme: (p.th as any) || 'galaxy',
      motionPattern: (p.mp as any) || 'lua_song',
      fontFamily: (p.ff as any) || 'playfair',
      textColorTheme: (p.tc as any) || 'gold',
      fontSizePreset: (p.fs as any) || 'large',
      nameTextCase: (p.nc as any) || 'titlecase',
      textScale: p.ts ?? 130,
      displayMode: (p.dm as any) || 'static',
      transitionSpeedSeconds: p.spd ?? 8,
      enabledSlides: Array.isArray(p.es) && p.es.length > 0 ? p.es : [0, 1, 2, 3],
      slideScales: p.scs || { 0: 100, 1: 85, 2: 95, 3: 100 },
      slideColorThemes: (p.sct as any) || {},
      slideCustomColors: p.scc || {},
      slideCoupleBadge: p.cb,
      slideFamilyTitle: p.ft,
      slideGroomFamilyLabel: p.gfl,
      slideBrideFamilyLabel: p.bfl,
      slideFamilyQuote: p.fq,
      slideDateTitle: p.dt,
      slideDateNote: p.dn,
      slideQuoteTitle: p.qt,
      slideQuoteEnding: p.qe,
      bgDarkness: p.bgd ?? 40,
      bgBlur: p.bgb ?? 0,
      showMeteors: p.stm ?? true,
      showTwinklingStars: p.sts ?? true,
      starCenterSafeZone: p.sz ?? true,
      starBrightness: p.sb ?? 60,
      musicUrl: p.mu,
      musicTitle: p.mt,
      sheetWebhook: p.sheet,
    };
  } catch (e) {
    console.error('Lỗi giải nén LED data từ URL token:', e);
    return null;
  }
};

// ==========================================
// 2. ĐỒNG BỘ TOÀN BỘ ỨNG DỤNG CHO ĐIỆN THOẠI KHÁC / MÁY TÍNH KHÁC
// ==========================================

export interface WeddingPackageData {
  v: number; // version 1
  ts: number;
  profile: any;
  expenses?: any[];
  tasks?: any[];
  guests?: any[];
  guestGroups?: any[];
  schedule?: any[];
  vendors?: any[];
  contracts?: any[];
  playlist?: any[];
  sheetConfig?: any;
  ledConfig?: any;
}

/**
 * Nén toàn bộ dữ liệu ứng dụng bằng gzip CompressionStream (hoặc fallback base64)
 */
export const packFullWeddingData = async (data: Omit<WeddingPackageData, 'v' | 'ts'>): Promise<string> => {
  const payload: WeddingPackageData = {
    v: 1,
    ts: Date.now(),
    ...data,
  };

  // Loại bỏ ảnh base64 lớn nếu có trong contracts để URL không bị quá tải
  if (payload.contracts) {
    payload.contracts = payload.contracts.map(c => ({
      ...c,
      images: [],
      imageCount: (c.images || []).length,
    }));
  }

  // Loại bỏ ảnh base64 album nếu vượt quá giới hạn
  if (payload.profile && payload.profile.albumImages) {
    payload.profile = {
      ...payload.profile,
      albumImages: (payload.profile.albumImages || []).filter((img: string) => !img.startsWith('data:image')),
    };
  }

  const jsonStr = JSON.stringify(payload);

  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new Blob([new TextEncoder().encode(jsonStr)])
        .stream()
        .pipeThrough(new CompressionStream('gzip'));
      const buffer = await new Response(stream).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return 'gz:' + btoa(binary);
    } catch (e) {
      console.warn('CompressionStream fallback:', e);
    }
  }

  return 'raw:' + utf8ToBase64(jsonStr);
};

/**
 * Giải nén gói dữ liệu ứng dụng từ token
 */
export const unpackFullWeddingData = async (token: string): Promise<WeddingPackageData | null> => {
  if (!token) return null;
  try {
    if (token.startsWith('gz:')) {
      const b64 = token.substring(3);
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      if (typeof DecompressionStream !== 'undefined') {
        const stream = new Blob([bytes])
          .stream()
          .pipeThrough(new DecompressionStream('gzip'));
        const text = await new Response(stream).text();
        return JSON.parse(text);
      }
    } else if (token.startsWith('raw:')) {
      const b64 = token.substring(4);
      const text = base64ToUtf8(b64);
      return JSON.parse(text);
    } else {
      // Thử giải nén trực tiếp dạng Base64
      try {
        const text = base64ToUtf8(token);
        return JSON.parse(text);
      } catch {
        // Fallback thử dạng gzip
        const binary = atob(token);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        if (typeof DecompressionStream !== 'undefined') {
          const stream = new Blob([bytes])
            .stream()
            .pipeThrough(new DecompressionStream('gzip'));
          const text = await new Response(stream).text();
          return JSON.parse(text);
        }
      }
    }
    return null;
  } catch (e) {
    console.error('Lỗi giải nén gói dữ liệu đám cưới:', e);
    return null;
  }
};
