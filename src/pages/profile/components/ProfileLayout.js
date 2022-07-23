import { Box } from '@chakra-ui/react';
import Layout from '../../../components/Layout';
import ProfileHeader from './ProfileHeader';
import ProfileNav from './ProfileNav';

export default function ProfileLayout({ children }) {
  return (
    <Layout>
      <Box className=' h-full min-h-[100vh]'>
        <ProfileHeader />

        <Box className='flex flex-col px-8 py-5 md:flex-row gap-7 md:px-0 mb-28 '>
          <ProfileNav />
          {children}
        </Box>
      </Box>
    </Layout>
  );
}
