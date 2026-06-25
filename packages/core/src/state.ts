// StateManager singleton for promptflow core state

const STORAGE_KEY = 'promptflow:core:state';

interface State {
  script: string;
  isRunning: boolean;
  speed: number;
  fontSize: number;
  scrollMode: 'infinite' | 'page' | 'none';
  countdownBehavior: 'never' | 'always' | 'once';
  countdownSeconds: number;
  overlayWidth: number;
  overlayHeight: number;
  privacyMode: boolean;
}

type StateKey = keyof State;
type Subscriber<T = any> = (value: T) => void;

const DEFAULTS: State = {
  script: '',
  isRunning: false,
  speed: 1,
  fontSize: 48,
  scrollMode: 'infinite',
  overlayWidth: 600,
  overlayHeight: 150,
  countdownBehavior: 'never',
  countdownSeconds: 3,
  privacyMode: false,
};

export class StateManager {
  private static instance: StateManager | null = null;
  private state: State;
  private subscribers: Map<StateKey, Set<Subscriber>> = new Map();
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.state = { ...DEFAULTS };
    this.loadFromStorage();
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  get<T>(key: StateKey): T {
    return this.state[key] as unknown as T;
  }

  set(key: StateKey, value: any): void {
    (this.state as any)[key] = value;
    this.notify(key, value);
    this.schedulePersist();
  }

  subscribe(key: StateKey, cb: Subscriber): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(cb);
    return () => {
      this.subscribers.get(key)?.delete(cb);
    };
  }

  getAll(): Record<string, any> {
    return { ...this.state };
  }

  reset(): void {
    this.state = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS) as StateKey[]) {
      this.notify(key, this.state[key]);
    }
    this.cancelPersist();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may not be available
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        for (const key of Object.keys(DEFAULTS) as StateKey[]) {
          if (key in stored) {
            (this.state as any)[key] = stored[key];
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private notify(key: StateKey, value: any): void {
    const subs = this.subscribers.get(key);
    if (subs) {
      for (const cb of subs) {
        try {
          cb(value);
        } catch {
          // Swallow subscriber errors
        }
      }
    }
  }

  private schedulePersist(): void {
    if (this.persistTimer !== null) {
      clearTimeout(this.persistTimer);
    }
    this.persistTimer = setTimeout(() => {
      this.persistToStorage();
      this.persistTimer = null;
    }, 250);
  }

  private persistToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // localStorage may not be available
    }
  }

  private cancelPersist(): void {
    if (this.persistTimer !== null) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
  }
}
