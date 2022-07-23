import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import Logout from '../../../components/svg/logout.svg';
import { googleSignout } from '../../../features/auth/authSlice';
import { stymApi } from '../../../features/stymQuery';

export default function ProfileHeader() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSignOut = () => {
    dispatch(googleSignout());
    router.push('/sign-in');
    dispatch(stymApi.util.resetApiState());
  };

  return (
    <div className='flex justify-between gap-4 md:mb-20 '>
      <h1 className='text-5xl font-medium'>Profile</h1>
      <div
        onClick={handleSignOut}
        className='cursor-pointer text-[#FF6A2A] flex items-center gap-2 md:gap-4'
      >
        <Logout className='w-6 md:w-12 ' />
        <span className='font-medium md:text-2xl'>Logout</span>
      </div>
    </div>
  );
}
