import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useSelector } from 'react-redux';
import { userSelector } from '../../../selectors/auth';

export default function ProfileNav() {
  const router = useRouter();
  const user = useSelector(userSelector);
  const pathname = router.pathname;

  return (
    <div className='flex flex-col gap-4 mb-8 text-2xl font-medium md:mb-0'>
      <Link href='/profile'>
        <a className={`${pathname === '/profile' ? 'text-my-orange' : ''} `}>
          General
        </a>
      </Link>
      <Link href='/profile/contacts'>
        <a
          className={`${
            pathname === '/profile/contacts' ? 'text-my-orange' : ''
          }`}
        >
          Contacts
        </a>
      </Link>
      <Link href='/profile/documents'>
        <a
          className={`${
            pathname === '/profile/documents' ? 'text-my-orange' : ''
          }`}
        >
          Documents
        </a>
      </Link>

      {user?.tariff === 'premium' && (
        <Link href='/profile/users-and-access'>
          <a
            className={`${
              pathname === '/profile/users-and-access' ? 'text-my-orange' : ''
            } whitespace-nowrap`}
          >
            Users and Access
          </a>
        </Link>
      )}

      <Link href='/profile/trash'>
        <a
          className={`${pathname === '/profile/trash' ? 'text-my-orange' : ''}`}
        >
          Trash
        </a>
      </Link>
    </div>
  );
}
