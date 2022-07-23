import '../styles/globals.css';
import store, { persistor } from '../app/store';
import 'nprogress/nprogress.css';
import { ChakraProvider } from '@chakra-ui/react';
import NProgress from 'nprogress';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import initAuth from '../utils/initAuth';
import { PersistGate } from 'redux-persist/integration/react';
import 'react-toastify/dist/ReactToastify.css';
import 'sendbird-uikit/dist/index.css';
import { ToastContainer } from 'react-toastify';
import ReactPlayer from '../components/ReactPlayer';
import { useRouter } from 'next/router';
import theme from '../styles/theme';
import RouteProtection from '../components/RouteProtection';
import * as ga from '../lib/ga';

initAuth();
// firebaseApp();

function MyApp({ Component, pageProps }) {
  NProgress.configure({
    showSpinner: false,
  });
  NProgress.configure({
    trickleSpeed: 400,
  });
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url);
    };
    //When the component is mounted, subscribe to router changes
    //and log those page views
    router.events.on('routeChangeComplete', handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    const handleRouteStart = () => NProgress.start();
    const handleRouteDone = () => NProgress.done();

    router.events.on('routeChangeStart', handleRouteStart);
    router.events.on('routeChangeComplete', handleRouteDone);
    router.events.on('routeChangeError', handleRouteDone);

    return () => {
      // Make sure to remove the event handler on unmount!
      router.events.off('routeChangeStart', handleRouteStart);
      router.events.off('routeChangeComplete', handleRouteDone);
      router.events.off('routeChangeError', handleRouteDone);
    };
  }, [router]);

  const user = store.getState().auth.user?.status;

  const protectedRoutes = [
    '/my-stym',
    '/profile',
    '/settings',
    '/notifications',
    '/result',
    '/shared',
    '/subscription',
    '/collabs',
    '/folders',
    '/',
  ];

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ChakraProvider theme={theme}>
          <RouteProtection protectedRoutes={protectedRoutes}>
            <Component {...pageProps} />
            {/* {user && <ReactPlayer />} */}
            <ReactPlayer />
            <ToastContainer limit={1} />
          </RouteProtection>
        </ChakraProvider>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
