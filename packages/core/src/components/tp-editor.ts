import { StateManager } from '../state';

const tpl = document.createElement('template');
tpl.innerHTML = `<style>
  :host{display:flex;flex-direction:column;font:monospace;background:#1a1a1a;color:#ccc;border-radius:8px;padding:8px;gap:6px;height:100%;box-sizing:border-box}
  .bar{display:flex;gap:6px;flex-shrink:0}
  button{background:#2a2a2a;color:#ccc;border:1px solid #3a3a3a;border-radius:4px;padding:4px 10px;font:inherit;font-size:13px;cursor:pointer}
  button:hover{background:#3a3a3a;color:#fff}
  textarea{flex:1;background:#111;color:#fff;border:1px solid #3a3a3a;border-radius:4px;padding:8px;font:inherit;font-size:14px;resize:none;min-height:120px}
  textarea:focus{outline:1px solid #555}
  .stats{flex-shrink:0;font-size:12px;color:#888}
  input[type=file]{display:none}
</style>
<div class="bar"><button id="imp">📂 Import</button><button id="exp">💾 Export</button></div>
<textarea id="ta" placeholder="Enter your script here..."></textarea>
<div class="stats" id="stats"></div>
<input type="file" id="fi" accept=".txt">`;

export class TpEditor extends HTMLElement {
  private state = StateManager.getInstance();
  private unsubs: (() => void)[] = [];
  private ignoreInput = false;
  private ta!: HTMLTextAreaElement;
  private stats!: HTMLElement;
  private fi!: HTMLInputElement;

  connectedCallback(): void {
    if (!this.shadowRoot) { this.attachShadow({mode:'open'}); this.shadowRoot!.appendChild(tpl.content.cloneNode(true)); }
    const r = this.shadowRoot!;
    this.ta = r.getElementById('ta') as HTMLTextAreaElement;
    this.stats = r.getElementById('stats')!;
    this.fi = r.getElementById('fi') as HTMLInputElement;

    this.ta.value = this.state.get<string>('script');
    this.updStats();
    this.unsubs.push(
      this.state.subscribe('script', (v: string) => { if (this.ignoreInput) return; if (this.ta.value !== v) { this.ta.value = v; this.updStats(); } }),
      this.state.subscribe('speed', () => this.updStats()),
    );
    this.ta.addEventListener('input', () => { this.ignoreInput = true; this.state.set('script', this.ta.value); this.ignoreInput = false; this.updStats(); });

    r.getElementById('imp')!.addEventListener('click', () => this.fi.click());
    this.fi.addEventListener('change', () => {
      const f = this.fi.files?.[0]; if (!f) return;
      const fr = new FileReader();
      fr.onload = () => { this.ta.value = fr.result as string; this.state.set('script', fr.result as string); this.updStats(); };
      fr.readAsText(f); this.fi.value = '';
    });
    r.getElementById('exp')!.addEventListener('click', () => {
      const b = new Blob([this.ta.value], {type:'text/plain'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'script.txt'; a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  private updStats(): void {
    const text = this.ta.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sp = this.state.get<number>('speed');
    const wpm = 150 * sp;
    const min = wpm > 0 ? words / wpm : 0;
    const mm = Math.floor(min);
    const ss = Math.round((min - mm) * 60);
    this.stats.textContent = `Words: ${words} | Est: ${mm}:${String(ss).padStart(2,'0')} (150wpm×${sp.toFixed(1)})`;
  }
  disconnectedCallback(): void { this.unsubs.forEach(fn => fn()); }
}
if (!customElements.get('tp-editor')) customElements.define('tp-editor', TpEditor);
