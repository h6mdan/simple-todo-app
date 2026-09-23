import { ListThemeId } from '../types.ts';

export interface ThemeConfig {
  id: ListThemeId;
  name: string;
  headerBg: string;
  headerText: string;
  accentColor: string;
  accentBg: string;
  primaryButtonBg: string;
  badgeBg: string;
  previewColor: string;
}

export const THEMES: Record<ListThemeId, ThemeConfig> = {
  blue: {
    id: 'blue',
    name: 'Classic Blue',
    headerBg: 'bg-white',
    headerText: 'text-slate-900',
    accentColor: 'text-[#2564cf]',
    accentBg: 'bg-blue-50 text-[#2564cf]',
    primaryButtonBg: 'bg-[#2564cf] hover:bg-[#1a55b8] text-white',
    badgeBg: 'bg-blue-50 text-blue-700',
    previewColor: '#2564cf',
  },
  mountain: {
    id: 'mountain',
    name: 'Cerulean Day',
    headerBg: 'bg-white',
    headerText: 'text-slate-900',
    accentColor: 'text-[#0284c7]',
    accentBg: 'bg-sky-50 text-[#0284c7]',
    primaryButtonBg: 'bg-[#0284c7] hover:bg-[#0369a1] text-white',
    badgeBg: 'bg-sky-50 text-sky-700',
    previewColor: '#0284c7',
  },
  sunset: {
    id: 'sunset',
    name: 'Crimson Sunset',
    headerBg: 'bg-white',
    headerText: 'text-slate-900',
    accentColor: 'text-[#e11d48]',
    accentBg: 'bg-rose-50 text-[#e11d48]',
    primaryButtonBg: 'bg-[#e11d48] hover:bg-[#be123c] text-white',
    badgeBg: 'bg-rose-50 text-rose-700',
    previewColor: '#e11d48',
  },
  forest: {
    id: 'forest',
    name: 'Evergreen',
    headerBg: 'bg-white',
    headerText: 'text-slate-900',
    accentColor: 'text-[#059669]',
    accentBg: 'bg-emerald-50 text-[#059669]',
    primaryButtonBg: 'bg-[#059669] hover:bg-[#047857] text-white',
    badgeBg: 'bg-emerald-50 text-emerald-700',
    previewColor: '#059669',
  },
  purple: {
    id: 'purple',
    name: 'Royal Violet',
    headerBg: 'bg-white',
    headerText: 'text-slate-900',
    accentColor: 'text-[#7c3aed]',
    accentBg: 'bg-purple-50 text-[#7c3aed]',
    primaryButtonBg: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white',
    badgeBg: 'bg-purple-50 text-purple-700',
    previewColor: '#7c3aed',
  },
  dusk: {
    id: 'dusk',
    name: 'Midnight Onyx',
    headerBg: 'bg-white',
    headerText: 'text-slate-900',
    accentColor: 'text-slate-800',
    accentBg: 'bg-slate-100 text-slate-800',
    primaryButtonBg: 'bg-slate-800 hover:bg-slate-900 text-white',
    badgeBg: 'bg-slate-100 text-slate-800',
    previewColor: '#334155',
  },
  coral: {
    id: 'coral',
    name: 'Tangerine',
    headerBg: 'bg-white',
    headerText: 'text-slate-900',
    accentColor: 'text-[#ea580c]',
    accentBg: 'bg-orange-50 text-[#ea580c]',
    primaryButtonBg: 'bg-[#ea580c] hover:bg-[#c2410c] text-white',
    badgeBg: 'bg-orange-50 text-orange-700',
    previewColor: '#ea580c',
  },
  slate: {
    id: 'slate',
    name: 'Graphite',
    headerBg: 'bg-white',
    headerText: 'text-slate-900',
    accentColor: 'text-[#475569]',
    accentBg: 'bg-slate-100 text-[#475569]',
    primaryButtonBg: 'bg-[#475569] hover:bg-[#334155] text-white',
    badgeBg: 'bg-slate-100 text-slate-700',
    previewColor: '#475569',
  },
};
