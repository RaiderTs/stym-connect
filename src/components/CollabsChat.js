import React from 'react';
import Layout from '../components/Layout';
import { App } from 'sendbird-uikit';
import { APP_ID } from '../utils/constants';
import 'sendbird-uikit/dist/index.css';
import { useSelector } from 'react-redux';
import { userSelector } from '../selectors/auth';
import { useRouter } from 'next/router';
import { useColorMode } from '@chakra-ui/react';

export default function CollabsChat() {
  const { colorMode, toggleColorMode } = useColorMode();

  const router = useRouter();

  const user = useSelector(userSelector);
  const nickname = user?.displayName ? user.displayName : `Noname ${user?.email}`;

  // if (user && !user.status) {
  //   router.push('/sign-in');
  // }

  return (
    <Layout>
      <div className='h-[80vh] mb-20'>
        <h1 className='mb-8 text-5xl font-medium'>Collabs</h1>
        <App
          theme={colorMode}
          appId={APP_ID}
          userId={user.email}
          nickname={nickname}
        />
      </div>
    </Layout>
  );
}
