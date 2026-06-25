import { StateManager } from '../state';

const tpl = document.createElement('template');
tpl.innerHTML = `<style>
  :host{display:block;font:monospace;background:#1a1a1a;color:#ccc;padding:12px;border-radius:8px}
  .row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  label{min-width:100px;font-size:13px;color:#aaa}
  input[type=range]{flex:1;accent-color:#666}
  select{background:#2a2a2a;color:#ccc;border:1px solid #3a3a3a;border-radius:4px;padding:2px 6px;font:inherit}
  .val{min-width:48px;font-size:13px;color:#fff;text-align:right}
  #cds{display:none}
</style>
<div class="row"><label>Speed</label><input type="range" id="speed" min="0.1" max="5" step="0.1"><span class="val" id="speedV">1.0</span></div>
<div class="row"><label>Font Size</label><input type="range" id="fs" min="12" max="120" step="2"><span class="val" id="fsV">48</span></div>
<div class="row"><label>Width</label><input type="range" id="ow" min="400" max="1200" step="10"><span class="val" id="owV">600</span></div>
<div class="row"><label>Height</label><input type="range" id="oh" min="120" max="300" step="10"><span class="val" id="ohV">150</span></div>
<div class="row"><label>Mode</label><select id="mode"><option value="infinite">Infinite</option><option value="stopAtEnd">Stop at End</option></select></div>
<div class="row"><label>Countdown</label><select id="cd"><option value="never">Never</option><option value="always">Always</option></select></div>
<div class="row" id="cds"><label>Cd Sec</label><input type="range" id="cdr" min="1" max="10" step="1"><span class="val" id="cdrV">3</span></div>`;

export class TpSettings extends HTMLElement {
  private state = StateManager.getInstance();
  private unsubs: (() => void)[] = [];

  connectedCallback(): void {
    if (!this.shadowRoot) { this.attachShadow({mode:'open'}); this.shadowRoot!.appendChild(tpl.content.cloneNode(true)); }
    const r = this.shadowRoot!;

    const br = (id: string, key: string, vid: string, fmt: (v: number) => string = String) => {
      const inp = r.getElementById(id) as HTMLInputElement;
      const ve = r.getElementById(vid)!;
      const init = this.state.get<number>(key as any);
      inp.value = String(init); ve.textContent = fmt(init);
      this.unsubs.push(this.state.subscribe(key as any, (v: number) => {
        if (String(inp.value) !== String(v)) { inp.value = String(v); ve.textContent = fmt(v); }
      }));
      inp.addEventListener('input', () => { const v = parseFloat(inp.value); this.state.set(key as any, v); ve.textContent = fmt(v); });
    };

    br('speed', 'speed', 'speedV', v => v.toFixed(1));
    br('fs', 'fontSize', 'fsV');
    br('ow', 'overlayWidth', 'owV');
    br('oh', 'overlayHeight', 'ohV');

    const modeSel = r.getElementById('mode') as HTMLSelectElement;
    modeSel.value = this.state.get<string>('scrollMode');
    this.unsubs.push(this.state.subscribe('scrollMode', (v: string) => { modeSel.value = v; }));
    modeSel.addEventListener('change', () => this.state.set('scrollMode', modeSel.value));

    const cdSel = r.getElementById('cd') as HTMLSelectElement;
    const cdsDiv = r.getElementById('cds')!;
    cdSel.value = this.state.get<string>('countdownBehavior');
    const updVis = (v: string) => { cdsDiv.style.display = v === 'always' ? 'flex' : 'none'; };
    updVis(cdSel.value);
    this.unsubs.push(this.state.subscribe('countdownBehavior', (v: string) => { cdSel.value = v; updVis(v); }));
    cdSel.addEventListener('change', () => { this.state.set('countdownBehavior', cdSel.value); updVis(cdSel.value); });

    br('cdr', 'countdownSeconds', 'cdrV');
  }
  disconnectedCallback(): void { this.unsubs.forEach(fn => fn()); }
}
if (!customElements.get('tp-settings')) customElements.define('tp-settings', TpSettings);
