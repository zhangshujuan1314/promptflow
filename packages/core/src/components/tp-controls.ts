import { StateManager } from '../state';

const tpl = document.createElement('template');
tpl.innerHTML = `<style>
  :host{display:flex;gap:6px;align-items:center;font:monospace;background:#1a1a1a;padding:8px 12px;border-radius:8px;user-select:none}
  button{background:#2a2a2a;color:#ccc;border:1px solid #3a3a3a;border-radius:4px;padding:4px 10px;font:inherit;font-size:14px;cursor:pointer;min-width:32px;text-align:center}
  button:hover{background:#3a3a3a;color:#fff}
  button:active{background:#4a4a4a}
  #sd{color:#fff;font-size:14px;min-width:42px;text-align:center}
</style>
<button id="play" title="Play">▶</button><button id="pause" title="Pause">⏸</button><button id="jb" title="Jump back 5s">↩</button>
<button id="sdow">−</button><span id="sd">1.0</span><button id="sup">+</button>
<button id="fdow">A−</button><button id="fup">A+</button><button id="cl">✕</button>`;

export class TpControls extends HTMLElement {
  private state = StateManager.getInstance();
  private unsubs: (() => void)[] = [];

  connectedCallback(): void {
    if (!this.shadowRoot) { this.attachShadow({mode:'open'}); this.shadowRoot!.appendChild(tpl.content.cloneNode(true)); }
    const r = this.shadowRoot!;
    const sd = r.getElementById('sd')!;
    sd.textContent = this.state.get<number>('speed').toFixed(1);
    this.unsubs.push(this.state.subscribe('speed', (v: number) => { sd.textContent = v.toFixed(1); }));

    r.getElementById('play')!.addEventListener('click', () => this.state.set('isRunning', true));
    r.getElementById('pause')!.addEventListener('click', () => this.state.set('isRunning', false));
    r.getElementById('jb')!.addEventListener('click', () => {
      const run = this.state.get<boolean>('isRunning'); this.state.set('isRunning', !run);
    }); // ponytail: placeholder jumpBack
    r.getElementById('sdow')!.addEventListener('click', () => {
      this.state.set('speed', +Math.max(0.1, this.state.get<number>('speed') - 0.1).toFixed(1));
    });
    r.getElementById('sup')!.addEventListener('click', () => {
      this.state.set('speed', +Math.min(5, this.state.get<number>('speed') + 0.1).toFixed(1));
    });
    r.getElementById('fdow')!.addEventListener('click', () => {
      this.state.set('fontSize', Math.max(12, this.state.get<number>('fontSize') - 2));
    });
    r.getElementById('fup')!.addEventListener('click', () => {
      this.state.set('fontSize', Math.min(120, this.state.get<number>('fontSize') + 2));
    });
    r.getElementById('cl')!.addEventListener('click', () => this.state.set('script', ''));
  }
  disconnectedCallback(): void { this.unsubs.forEach(fn => fn()); }
}
if (!customElements.get('tp-controls')) customElements.define('tp-controls', TpControls);
