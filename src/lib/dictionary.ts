import 'server-only';
import type { Locale } from '../../i18n-config';

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  vi: () => import('../app/dictionaries/vi.json').then((module) => module.default),
  jp: () => import('../app/dictionaries/jp.json').then((module) => module.default),
} as const;

export const getDictionary = async (locale: Locale) => {
  return (dictionaries[locale] || dictionaries.vi)();
};