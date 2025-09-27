export const i18n = {
  locales: ['vi', 'jp'] as const,
  defaultLocale: 'vi' as const,
};

export type Locale = (typeof i18n.locales)[number]; 