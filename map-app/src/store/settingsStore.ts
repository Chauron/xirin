import { create } from 'zustand';
import type { Settings, Units, TideProvider, WaveProvider, Language } from '../models/settings';

const defaultSettings: Settings = {
  units: 'metric',
  tideProvider: 'none',
  waveProvider: 'open-meteo',
  language: 'es',
  darkMode: false,
  notifyTides: false,
};

interface SettingsState {
  settings: Settings;
  setUnits: (units: Units) => void;
  setTideProvider: (provider: TideProvider) => void;
  setWaveProvider: (provider: WaveProvider) => void;
  setLanguage: (lang: Language) => void;
  setDarkMode: (dark: boolean) => void;
  setNotifyTides: (notify: boolean) => void;
  loadSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,

  setUnits: (units) => set(state => {
    const s = { ...state.settings, units };
    localStorage.setItem('xirin-settings', JSON.stringify(s));
    return { settings: s };
  }),
  setTideProvider: (provider) => set(state => {
    const s = { ...state.settings, tideProvider: provider };
    localStorage.setItem('xirin-settings', JSON.stringify(s));
    return { settings: s };
  }),
  setWaveProvider: (provider) => set(state => {
    const s = { ...state.settings, waveProvider: provider };
    localStorage.setItem('xirin-settings', JSON.stringify(s));
    return { settings: s };
  }),
  setLanguage: (lang) => set(state => {
    const s = { ...state.settings, language: lang };
    localStorage.setItem('xirin-settings', JSON.stringify(s));
    return { settings: s };
  }),
  setDarkMode: (dark) => set(state => {
    const s = { ...state.settings, darkMode: dark };
    localStorage.setItem('xirin-settings', JSON.stringify(s));
    return { settings: s };
  }),
  setNotifyTides: (notify) => set(state => {
    const s = { ...state.settings, notifyTides: notify };
    localStorage.setItem('xirin-settings', JSON.stringify(s));
    return { settings: s };
  }),
  loadSettings: () => {
    const raw = localStorage.getItem('xirin-settings');
    if (raw) {
      set({ settings: JSON.parse(raw) });
    }
  },
}));
