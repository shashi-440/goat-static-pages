/**
 * Stub of amber-user-website's hooks/useIsRedirect.
 *
 * There it returns `isDesktop && isInternalUser` from the Redux appData slice —
 * an internal-staff affordance that forces full page loads instead of client-side
 * routing. For every ordinary visitor it evaluates to false, so false is the
 * production-accurate constant here and CustomLink keeps using react-router <Link>
 * for internal paths.
 */
const useIsRedirect = (): boolean => false;

export default useIsRedirect;
