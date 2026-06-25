import { StateManager } from './state';

export class ScrollingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: StateManager;
  private rafId: number | null = null;
  private lastTime = 0;
  private phase = 0;
  private speedMult = 0;
  private targetSpeedMult = 0;
  private deferredTarget: number | null = null;
  private wrappedLines: string[] = [];
  private lineHeight = 0;
  private unsubs: (() => void)[] = [];

  private readonly FADE_FRACTION = 0.15;
  private readonly LERP_FACTOR = 8.0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ScrollingEngine: no 2D context');
    this.ctx = ctx;
    this.state = StateManager.getInstance();
    this.unsubs.push(
      this.state.subscribe('isRunning', (v: boolean) => { v ? this.start() : this.pause(); }),
      this.state.subscribe('fontSize', () => this.reflow()),
      this.state.subscribe('script', () => this.reflow()),
    );
    this.reflow();
    this.loop = this.loop.bind(this);
  }

  start(): void {
    if (this.rafId !== null) return;
    this.targetSpeedMult = 1; this.deferredTarget = null;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }
  pause(): void { this.targetSpeedMult = 0; }
  stop(): void {
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this.phase = 0; this.speedMult = 0; this.targetSpeedMult = 0;
    this.deferredTarget = null; this.render();
  }
  updateConfig(_k: string, _v: any): void {}
  setText(text: string): void { this.state.set('script', text); }
  destroy(): void { this.stop(); this.unsubs.forEach(fn => fn()); }

  private reflow(): void {
    const text = this.state.get<string>('script');
    const fontSize = this.state.get<number>('fontSize');
    this.ctx.font = `${fontSize}px monospace`;
    this.lineHeight = fontSize * 1.4;
    this.wrappedLines = this.wrapLines(text, this.canvas.width - 40);
    this.phase = 0; this.deferredTarget = null; this.render();
  }

  private wrapLines(text: string, maxWidth: number): string[] {
    if (!text) return [''];
    const lines: string[] = [];
    for (const para of text.split('\n')) {
      if (!para) { lines.push(''); continue; }
      let line = '';
      for (const ch of para) {
        const test = line + ch;
        if (this.ctx.measureText(test).width > maxWidth && line.length > 0) { lines.push(line); line = ch; }
        else { line = test; }
      }
      lines.push(line);
    }
    return lines;
  }

  private loop(now: number): void {
    const dt = Math.min((now - this.lastTime) / 1000, 0.25);
    this.lastTime = now;
    this.speedMult += (this.targetSpeedMult - this.speedMult) * Math.min(1, this.LERP_FACTOR * dt);
    const speed = this.state.get<number>('speed');
    this.phase += speed * this.speedMult * dt;
    const cycleLen = Math.max(this.wrappedLines.length * this.lineHeight, this.canvas.height);
    if (this.state.get<string>('scrollMode') === 'stopAtEnd') {
      if (this.deferredTarget === null) this.deferredTarget = cycleLen - this.canvas.height * 0.3;
      if (this.phase >= this.deferredTarget && this.wrappedLines.length > 1) {
        this.phase = this.deferredTarget;
        this.state.set('isRunning', false);
      }
    }
    this.render();
    if (this.speedMult > 0.001 || this.targetSpeedMult > 0) {
      this.rafId = requestAnimationFrame(this.loop);
    } else { this.rafId = null; }
  }

  private render(): void {
    const w = this.canvas.clientWidth || this.canvas.width;
    const h = this.canvas.clientHeight || this.canvas.height;
    const dpr = window.devicePixelRatio || 1;
    if (this.canvas.width !== Math.floor(w * dpr) || this.canvas.height !== Math.floor(h * dpr)) {
      this.canvas.width = Math.floor(w * dpr); this.canvas.height = Math.floor(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h); ctx.save();
    const fontSize = this.state.get<number>('fontSize');
    ctx.font = `${fontSize}px monospace`; ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'top';
    const cycleLen = Math.max(this.wrappedLines.length * this.lineHeight, h);
    const offsetY = -(this.phase % cycleLen);
    for (let copy = 0; copy < 2; copy++) {
      const baseY = copy * cycleLen;
      for (let i = 0; i < this.wrappedLines.length; i++) {
        const y = baseY + i * this.lineHeight + offsetY + 20;
        if (y + this.lineHeight < 0 || y > h) continue;
        ctx.fillText(this.wrappedLines[i], 20, y);
      }
    }
    ctx.restore();
    const fadeH = h * this.FADE_FRACTION;
    if (fadeH > 0) {
      const tg = ctx.createLinearGradient(0, 0, 0, fadeH);
      tg.addColorStop(0, '#000'); tg.addColorStop(1, 'transparent');
      ctx.fillStyle = tg; ctx.fillRect(0, 0, w, fadeH);
      const bg = ctx.createLinearGradient(0, h - fadeH, 0, h);
      bg.addColorStop(0, 'transparent'); bg.addColorStop(1, '#000');
      ctx.fillStyle = bg; ctx.fillRect(0, h - fadeH, w, fadeH);
    }
  }
}
