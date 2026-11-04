// Hệ thống phát nhạc thiệp cưới chuyên dụng: Hỗ trợ cả file âm thanh & Web Audio Synthesizer dự phòng 100%

// Xử lý đường dẫn tương thích cả Vercel (root /) và GitHub Pages (/hysu/)
export function resolveAudioUrl(url?: string): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const clean = url.startsWith('/') ? url.slice(1) : url;
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
}

// ==============================================================
// WEB AUDIO API SYNTHESIZER: Nhạc chuông / Piano cưới lãng mạn
// Chạy 100% offline, không phụ thuộc mạng, không bao giờ bị lỗi 403/CORS
// ==============================================================
class WeddingSynthPlayer {
  private ctx: AudioContext | null = null;
  private isRunning = false;
  private timerId: any = null;
  private volumeNode: GainNode | null = null;
  private currentVolume = 0.6;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Chuyển đổi MIDI sang tần số Hz
  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Phát một nốt nhạc piano / chuông ngân lãng mạn
  private playNote(midi: number, startTime: number, duration: number, velocity = 0.5, isBell = false) {
    if (!this.ctx) return;
    const freq = this.midiToFreq(midi);

    // Oscillator chính (Sóng sin ấm áp)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Hài âm thứ 2 (Triangle nhẹ tạo chất âm piano/harp)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Chuông ngân lung linh (cho giai điệu chính)
    let osc3: OscillatorNode | null = null;
    let osc3Gain: GainNode | null = null;
    if (isBell) {
      osc3 = this.ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, startTime);
      osc3Gain = this.ctx.createGain();
      osc3Gain.gain.setValueAtTime(velocity * 0.15, startTime);
      osc3Gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration * 1.5, 2.0));
      osc3.connect(osc3Gain);
    }

    // Bộ bao âm lượng (ADSR Envelope)
    const noteGain = this.ctx.createGain();
    const attack = 0.02;
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(velocity * 0.25, startTime + attack);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.8);

    // Kết nối đến master volume
    if (this.volumeNode) {
      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(this.volumeNode);
      if (osc3 && osc3Gain) {
        osc3Gain.connect(this.volumeNode);
      }
    }

    const stopTime = startTime + duration + 1.0;
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(stopTime);
    osc2.stop(stopTime);

    if (osc3) {
      osc3.start(startTime);
      osc3.stop(stopTime);
    }
  }

  // Bắt đầu chuỗi giai điệu Canon in D
  public start(onStart?: () => void) {
    this.initContext();
    if (!this.ctx) return;
    this.isRunning = true;

    if (!this.volumeNode) {
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.volumeNode.connect(this.ctx.destination);
    }

    const chords = [
      [50, 57, 62, 66], // D major
      [45, 52, 57, 64], // A major
      [47, 54, 59, 62], // B minor
      [42, 49, 54, 61], // F# minor
      [43, 50, 55, 59], // G major
      [38, 50, 54, 57], // D major
      [43, 50, 55, 62], // G major
      [45, 52, 57, 64], // A major
    ];

    const melody1 = [74, 73, 71, 69, 67, 66, 67, 69];
    const melody2 = [
      74, 76, 78, 74,
      73, 69, 71, 73,
      71, 67, 69, 71,
      69, 66, 67, 69,
      67, 64, 66, 67,
      66, 62, 64, 66,
      67, 71, 69, 67,
      69, 73, 74, 76,
    ];

    const tempo = 74;
    const beatDur = 60 / tempo;
    const loopDurationSec = 16 * beatDur * 2; // 32 nhịp ~ 26 giây

    const scheduleLoop = (startTime: number) => {
      if (!this.isRunning || !this.ctx) return;

      for (let cycle = 0; cycle < 2; cycle++) {
        const cycleOffset = startTime + cycle * 16 * beatDur;

        // Hòa âm đệm
        for (let bar = 0; bar < 8; bar++) {
          const chordTime = cycleOffset + bar * 2 * beatDur;
          const chord = chords[bar];
          // Nốt bass
          this.playNote(chord[0], chordTime, 1.8 * beatDur, 0.45);
          // Rải nốt đệm
          this.playNote(chord[1], chordTime + 0.5 * beatDur, 1.2 * beatDur, 0.22);
          this.playNote(chord[2], chordTime + 1.0 * beatDur, 1.0 * beatDur, 0.25);
          this.playNote(chord[3], chordTime + 1.5 * beatDur, 0.8 * beatDur, 0.2);
        }

        // Giai điệu
        if (cycle === 0) {
          melody1.forEach((note, idx) => {
            const noteTime = cycleOffset + idx * 2 * beatDur;
            this.playNote(note, noteTime, 1.8 * beatDur, 0.5, true);
            this.playNote(note - 12, noteTime, 1.6 * beatDur, 0.28);
          });
        } else {
          melody2.forEach((note, idx) => {
            const noteTime = cycleOffset + idx * 0.5 * beatDur;
            this.playNote(note, noteTime, 0.45 * beatDur, 0.52, true);
            if (idx % 2 === 0) {
              this.playNote(note - 12, noteTime, 0.8 * beatDur, 0.25);
            }
          });
        }
      }

      // Hẹn giờ lặp lại
      this.timerId = setTimeout(() => {
        if (this.isRunning && this.ctx) {
          scheduleLoop(this.ctx.currentTime + 0.1);
        }
      }, (loopDurationSec - 0.5) * 1000);
    };

    scheduleLoop(this.ctx.currentTime + 0.05);
    if (onStart) onStart();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getIsRunning() {
    return this.isRunning;
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.volumeNode && this.ctx) {
      this.volumeNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }
}

// Đối tượng Synth dùng chung
export const weddingSynth = new WeddingSynthPlayer();

// Danh sách bài hát gợi ý có sẵn (Ưu tiên file cục bộ & Synth dự phòng)
export const PRESET_WEDDING_SONGS = [
  {
    id: 'canon-in-d',
    title: 'Canon in D (Pachelbel - Piano & Chuông Lãng Mạn)',
    url: '/audio/canon-in-d.wav',
    isLocal: true,
  },
  {
    id: 'wedding-waltz',
    title: 'Wedding Waltz (Điệu Valse Lễ Đường Ngọt Ngào)',
    url: '/audio/wedding-waltz.wav',
    isLocal: true,
  },
  {
    id: 'synth-canon',
    title: 'Giai Điệu Hạnh Phúc (Web Audio Realtime - 100% Hoạt Động)',
    url: 'builtin:synth',
    isLocal: true,
  },
];
