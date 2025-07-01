// app/dictionaries.ts
import 'server-only';

const dictionaries = {
  vi: () => import('./dictionaries/vi.json').then((module) => module.default),
  jp: () => import('./dictionaries/jp.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  return (dictionaries as any)[locale]?.() ?? dictionaries.vi();
};