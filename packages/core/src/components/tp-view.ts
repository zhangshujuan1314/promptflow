import { ScrollingEngine } from '../engine';
import { StateManager } from '../state';

const tpl = document.createElement('template');
tpl.innerHTML = `<style>
  :host{display:block;width:100%;height:100%;background:#000;overflow:hidden;position:relative}
  canvas{display:block;width:100%;height:100%}
  #privacy{display:none;position:absolute;inset:0;background:rgba(0,0,0,.92);color:#f44;font:monospace;font-size:clamp(14px,3vw,28px);align-items:center;justify-content:center;pointer-events:none;z-index:10}
  :host([privacy]) #privacy{display:flex}
</style><canvas></canvas><div id="privacy">🔒 Privacy Mode</div>`;

export class TpView extends HTMLElement {
  private engine: ScrollingEngine | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ro: ResizeObserver | null = null;
  private unsubs: (() => void)[] = [];
  private state = StateManager.getInstance();

  connectedCallback(): void {
    if (!this.shadowRoot) { this.attachShadow({mode:'open'}); this.shadowRoot!.appendChild(tpl.content.cloneNode(true)); }
    this.canvas = this.shadowRoot!.querySelector('canvas')!;
    this.engine = new ScrollingEngine(this.canvas);
    this.ro = new ResizeObserver(() => {
      if (!this.canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const cw = Math.floor(this.canvas.clientWidth * dpr);
      const ch = Math.floor(this.canvas.clientHeight * dpr);
      if (this.canvas.width !== cw || this.canvas.height !== ch) {
        this.canvas.width = cw; this.canvas.height = ch;
        const ctx = this.canvas.getContext('2d'); if (ctx) ctx.setTransform(dpr,0,0,dpr,0,0);
      }
    });
    this.ro.observe(this);
    this.unsubs.push(this.state.subscribe('privacyMode', (v: boolean) => {
      v ? this.setAttribute('privacy','') : this.removeAttribute('privacy');
    }));
    if (this.state.get<boolean>('privacyMode')) this.setAttribute('privacy','');
  }
  disconnectedCallback(): void {
    this.engine?.destroy(); this.engine = null;
    this.ro?.disconnect(); this.ro = null;
    this.unsubs.forEach(fn => fn());
  }
}
if (!customElements.get('tp-view')) customElements.define('tp-view', TpView);
