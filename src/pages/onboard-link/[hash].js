import { useColorMode } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { userSelector } from '../../selectors/auth';

export default function OnboardLink() {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useSelector(userSelector);
  const router = useRouter();
  const { hash } = router.query;

  useEffect(() => {
    if (hash) {
      fetch(`https://api.stymconnect.com/auth/stym/share/access/${hash}`, {
        method: 'GET',
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status && res.user) {
            router.replace('/');
          } else if (res.message === 'Share not found') {
            toast.error(`Sorry, we couldn't find that stym`, {
              position: 'bottom-center',
            });
          } else if (res.user === false) {
            toast.success(`Shared successfully`, {
              position: 'bottom-center',
            });
          } else {
            console.log(res.message);
            router.push('/sign-in');
          }
        });
    }
  }, [hash, user, router]);

  return (
    <div className='flex justify-center w-full h-screen '>
      <div className='flex flex-col items-center justify-center gap-20'>
        <div>
          <Image
            src={colorMode === 'light' ? '/logo.svg' : '/logo_dark.svg'}
            alt='logo'
            width={250}
            height={34}
          />
        </div>
        <div>
          <h1 className='font-medium text-center mb-7 text-7xl'>
            Your stym file is ready to be opened
          </h1>
          <h3 className='text-4xl font-medium text-center'>
            Create an account/sign in to access it
          </h3>
        </div>

        <div>
          <Link href='/sign-up'>
            <a>
              <button className='my-5 disabled:bg-my-gray dark:bg-slate-400 text-sm rounded-10 bg-[#8B37FF] font-bold p-5 text-white w-full'>
                Create account
              </button>
            </a>
          </Link>
          <Link href='/sign-in'>
            <a>
              <button className='disabled:bg-my-gray bg-primary-purple text-[14px] rounded-10 font-bold p-5 text-white w-full'>
                Login
              </button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
