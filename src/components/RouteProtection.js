import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { userSelector } from '../selectors/auth';
import FullPageLoader from '../components/FullPageLoader';

export default function RouteProtection({ protectedRoutes, children }) {
  const user = useSelector(userSelector);
  const loading = useSelector((state) => state.auth.isLoading);
  const router = useRouter();
  const pathname = router.pathname;
  const pathIsProtected = protectedRoutes.indexOf(pathname) !== -1;

  useEffect(() => {
    if (!loading && !user && pathIsProtected) {
      router.push('/sign-in');
    }
  }, [pathIsProtected, user, loading]);

  if ((loading || !user) && pathIsProtected) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
