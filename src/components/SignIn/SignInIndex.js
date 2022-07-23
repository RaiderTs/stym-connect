import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import GoogleSignIn from './GoogleSignIn';
import PhoneSignIn from './PhoneSignIn';
import CredentialsSignIn from './CredentialsSignIn';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../../selectors/auth';
import Router, { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import { useColorMode } from '@chakra-ui/react';

export default function SignIn() {
  const [toggleLoginForm, setLoginForm] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(userSelector);
  const { colorMode, toggleColorMode } = useColorMode();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // console.log(user && isLoading, 'is loading');

    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  return (
    <div className='flex flex-col items-center justify-center w-full min-h-screen gap-[5rem] px-4'>
      {/* <main className='flex flex-col items-center justify-start flex-1 gap-[5rem] px-20 text-center'> */}
      <div>
        <a className='flex items-center'>
          <Image
            src={colorMode === 'light' ? '/logo.svg' : '/logo_dark.svg'}
            alt='logo'
            width={250}
            height={34}
          />
        </a>
      </div>

      <h1 className='md:text-[4.25rem] text-4xl font-medium'>Welcome back!</h1>
      <div>
        {toggleLoginForm ? <PhoneSignIn /> : <CredentialsSignIn />}

        <div
          onClick={() => setLoginForm(!toggleLoginForm)}
          className='inline-flex cursor-pointer text-[#FF6A2A] my-8 text-left text-[12px] '
        >
          {toggleLoginForm ? 'Or login with password' : 'Or login with phone'}
        </div>
        <GoogleSignIn />
        <p className='mt-12 text-xs text-center'>
          Don&lsquo;t have an account?
          <Link href='/sign-up'>
            <a className='text-my-orange'> Sign up</a>
          </Link>
        </p>
      </div>
      {/* </main> */}

      <ToastContainer />
    </div>
  );
}
