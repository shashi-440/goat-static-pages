/**
 * Stub of amber-user-website's hooks/useLanguagePath.
 *
 * The real hook reads the active locale from Redux and prefixes internal paths
 * with /es, /de or /fr. This sandbox is single-locale (English), so
 * getLocalizedPath is the identity function.
 *
 * If a future v2 page needs localised routing, this is the one place to grow:
 * keep the same `{ getLocalizedPath }` shape and the callers stay unchanged.
 */
export const useLanguagePath = () => ({
  getLocalizedPath: (path: string): string => path,
  currentLanguage: "en",
});

export default useLanguagePath;
