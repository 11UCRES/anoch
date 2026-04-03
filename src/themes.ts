export interface Theme {
  id: string;
  name: string;
  primary: string;
  bg: string;
  sidebar: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  card: string;
  input: string;
}

export const themes: Theme[] = [
  {
    id: 'nocturne',
    name: 'Nocturne',
    primary: 'bg-[#5b61e0]',
    bg: 'bg-[#0a0a0c]',
    sidebar: 'bg-[#050507]',
    text: 'text-white',
    textMuted: 'text-gray-500',
    accent: 'bg-[#1a1b23]',
    border: 'border-white/5',
    card: 'bg-[#111216]',
    input: 'bg-[#1a1b1e]',
  },
  {
    id: 'light',
    name: 'Light',
    primary: 'bg-blue-600',
    bg: 'bg-gray-50',
    sidebar: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    accent: 'bg-blue-50',
    border: 'border-gray-200',
    card: 'bg-white',
    input: 'bg-white',
  },
  {
    id: 'dark',
    name: 'Dark',
    primary: 'bg-indigo-500',
    bg: 'bg-gray-900',
    sidebar: 'bg-gray-950',
    text: 'text-white',
    textMuted: 'text-gray-400',
    accent: 'bg-gray-800',
    border: 'border-white/10',
    card: 'bg-gray-800/50',
    input: 'bg-gray-800',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primary: 'bg-purple-600',
    bg: 'bg-slate-950',
    sidebar: 'bg-black',
    text: 'text-slate-100',
    textMuted: 'text-slate-500',
    accent: 'bg-slate-900',
    border: 'border-white/5',
    card: 'bg-slate-900/50',
    input: 'bg-slate-900',
  },
  {
    id: 'pink',
    name: 'Pink',
    primary: 'bg-pink-500',
    bg: 'bg-[#1a0b14]',
    sidebar: 'bg-[#12070d]',
    text: 'text-pink-50',
    textMuted: 'text-pink-300/50',
    accent: 'bg-pink-900/20',
    border: 'border-pink-500/10',
    card: 'bg-pink-950/30',
    input: 'bg-pink-950/50',
  }
];
