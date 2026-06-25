import { StateManager } from '../state';

const tpl = document.createElement('template');
tpl.innerHTML = `<style>
  :host{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);align-items:center;justify-content:center;pointer-events:none}
  :host([active]){display:flex}
  #n{font:monospace;font-size:20vw;color:#fff;animation:pulse 1s ease-in-out infinite}
  @keyframes pulse{0%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.7}100%{transform:scale(1);opacity:1}}
</style><div id="n"></div>`;

export class TpCountdown extends HTMLElement {
  private state = StateManager.getInstance();
  private unsubs: (() => void)[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private count = 0;

  connectedCallback(): void {
    if (!this.shadowRoot) { this.attachShadow({mode:'open'}); this.shadowRoot!.appendChild(tpl.content.cloneNode(true)); }
    const nel = this.shadowRoot!.getElementById('n')!;
    this.unsubs.push(this.state.subscribe('isRunning', (running: boolean) => {
      if (running && this.state.get<string>('countdownBehavior') === 'always') this.start(nel);
    }));
  }

  private start(el: HTMLElement): void {
    if (this.timer !== null) return;
    this.count = this.state.get<number>('countdownSeconds');
    this.setAttribute('active', '');
    el.textContent = String(this.count);
    this.timer = setInterval(() => {
      this.count--;
      if (this.count <= 0) this.hide(el);
      else el.textContent = String(this.count);
    }, 1000);
  }

  private hide(el: HTMLElement): void {
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
    this.removeAttribute('active'); el.textContent = '';
  }
  disconnectedCallback(): void {
    this.unsubs.forEach(fn => fn());
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
  }
}
if (!customElements.get('tp-countdown')) customElements.define('tp-countdown', TpCountdown);
