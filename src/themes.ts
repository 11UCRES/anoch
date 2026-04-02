export interface Theme {
  id: string;
  name: string;
  primary: string;
  bg: string;
  text: string;
  accent: string;
}

export const themes: Theme[] = [
  {
    id: 'nocturne',
    name: 'Nocturne',
    primary: 'bg-[#5b61e0]',
    bg: 'bg-[#0a0a0c]',
    text: 'text-white',
    accent: 'bg-[#2d2f34]',
  },
  {
    id: 'light',
    name: 'Light',
    primary: 'bg-blue-600',
    bg: 'bg-white',
    text: 'text-gray-900',
    accent: 'bg-blue-50',
  },
  {
    id: 'dark',
    name: 'Dark',
    primary: 'bg-indigo-500',
    bg: 'bg-gray-900',
    text: 'text-white',
    accent: 'bg-gray-800',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primary: 'bg-purple-600',
    bg: 'bg-slate-950',
    text: 'text-slate-100',
    accent: 'bg-slate-900',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primary: 'bg-orange-500',
    bg: 'bg-stone-900',
    text: 'text-stone-100',
    accent: 'bg-stone-800',
  }
];
