import React, { useEffect } from 'react';
import Google from '../svg/google.svg';

import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { googleSignIn } from '../../features/auth/authSlice';
import { useRouter } from 'next/router';
import { userSelector } from '../../selectors/auth';
import { useColorMode } from '@chakra-ui/react';

export default function GoogleSignIn() {
  const dispatch = useDispatch();
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const user = useSelector(userSelector);
  const { isLoading } = useSelector((state) => state.auth);

  const handleGoogleLogin = async () => {
    await dispatch(googleSignIn()).then(() => router.push('/'));
  };

  return (
    <div>
      <button
        onClick={handleGoogleLogin}
        className={`${
          colorMode === 'dark'
            ? 'text-white border-primary-purple'
            : 'text-my-orange border-my-orange'
        } transition duration-500 ease-in-out flex justify-center align-center gap-2 w-full bg-transparent  font-medium p-5 border-2  rounded-10`}
      >
        <Google /> Log in with Google
      </button>
    </div>
  );
}
