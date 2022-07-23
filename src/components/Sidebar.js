import Link from 'next/link';
import { useEffect, useState } from 'react';
import Burger from '../components/svg/burger.svg';
import Mystym from '../components/svg/mystym.svg';
import Group from '../components/svg/group.svg';
import Inbox from '../components/svg/inbox.svg';
import Folders from '../components/svg/folders.svg';
import Collaborations from '../components/svg/collaborations.svg';
import Notifications from '../components/svg/notifications.svg';
import Settings from '../components/svg/settings.svg';
import Light from '../components/svg/light.svg';
import Dark from '../components/svg/dark.svg';
import StymMark from '../components/svg/stym-mark.svg';
import StymWordMark from '../components/svg/stym-wordmark.svg';
import NavigateBack from '../components/svg/navigateBack.svg';
import { useSelector } from 'react-redux';
import { userSelector } from '../selectors/auth';
import { useRouter } from 'next/router';
import { MdSubscriptions } from 'react-icons/md';
import { Avatar, AvatarBadge, Box, Fade, useColorMode } from '@chakra-ui/react';
import { Switch } from '@chakra-ui/react';
import { useGetUserProfileDataQuery } from '../features/stymQuery';

export default function Sidebar() {
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const user = useSelector(userSelector);
  const { colorMode, toggleColorMode } = useColorMode();

  const router = useRouter();
  const query = router.asPath;

  const { data, refetch } = useGetUserProfileDataQuery();

  const profileImg = data?.data?.image || '';

  const src = profileImg
    ? profileImg
    : user?.photoURL?.lol
    ? user.photoURL
    : '/profile_pic.png';

  useEffect(() => {
    refetch();
  }, [user || query === '/notifications']);

  return (
    <Box
      bg={colorMode === 'dark' ? '#0F2042' : '#fff'}
      className={`transition-[width, border-radius] duration-500 ease-in-out fixed h-full z-[100] border-my-gray border-r-[1px]  ${
        toggleSidebar ? 'w-[60px]' : 'w-[230px] rounded-r-[30px]'
      } `}
    >
      <Box
        as='ul'
        className='flex flex-col justify-between h-full gap-5 px-4 pt-4 pb-28'
      >
        <Box
          _hover={colorMode === 'dark' ? 'brand.500' : 'bg-gray-200'}
          display={'flex'}
          flexDirection='column'
          gap={6}
          mb={5}
        >
          {/* {query === '/' ? ( */}
          <li className='flex items-center '>
            <Link href='/'>
              <a
                className={`${
                  colorMode === 'dark' ? 'white' : 'text-primary-purple'
                } flex gap-4`}
              >
                <StymMark className='w-6 ' />
                <span
                  className={
                    'transition-opacity flex  ease-linear ' +
                    (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                  }
                >
                  <StymWordMark className='w-24 ' />
                </span>
              </a>
            </Link>
          </li>
          {/* ) : ( */}
          <li
            className={`${
              colorMode === 'dark'
                ? 'hover:text-my-orange'
                : 'hover:text-primary-purple'
            } overflow-hidden  flex `}
          >
            <a
              onClick={() => router.back()}
              className={`${
                query === '/shared' && colorMode === 'dark'
                  ? 'text-my-orange'
                  : 'text'
              } flex gap-4`}
            >
              <NavigateBack className='w-3 cursor-pointer :text-white' />
              <span
                className={
                  'transition-opacity ease-linear cursor-pointer ' +
                  (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                }
              >
                Back
              </span>
            </a>
          </li>
          {/* )} */}
          <li className='flex'>
            <Burger
              className='w-6 cursor-pointer'
              onClick={() => setToggleSidebar(!toggleSidebar)}
            />
          </li>
        </Box>
        <li
          className={`${
            colorMode === 'dark'
              ? 'hover:text-my-orange'
              : 'hover:text-primary-purple'
          } overflow-hidden flex `}
        >
          <Link href='/my-stym'>
            <a
              className={`${
                query === '/my-stym' && colorMode === 'dark'
                  ? 'text-my-orange'
                  : colorMode === 'light' && query === '/my-stym'
                  ? 'text-primary-purple'
                  : ''
              } flex gap-4`}
            >
              <Mystym className='w-6 ' />
              <span
                className={
                  'transition-opacity whitespace-nowrap ease-linear ' +
                  (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                }
              >
                My Stym
              </span>
            </a>
          </Link>
        </li>
        <li
          className={`${
            colorMode === 'dark'
              ? 'hover:text-my-orange'
              : 'hover:text-primary-purple'
          } overflow-hidden  flex `}
        >
          <Link href='/shared'>
            <a
              className={`${
                query === '/shared' && colorMode === 'dark'
                  ? 'text-my-orange'
                  : colorMode === 'light' && query === '/shared'
                  ? 'text-primary-purple'
                  : ''
              } flex gap-4`}
            >
              <Group className='w-6 ' />
              <span
                className={
                  'transition-opacity ease-linear ' +
                  (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                }
              >
                Shared
              </span>
            </a>
          </Link>
        </li>
        <li
          className={`${
            colorMode === 'dark'
              ? 'hover:text-my-orange'
              : 'hover:text-primary-purple'
          } overflow-hidden  flex `}
        >
          <Link href='/inbox'>
            <a
              className={`${
                query === '/folders' && colorMode === 'dark'
                  ? 'text-my-orange'
                  : colorMode === 'light' && query === '/folders'
                  ? 'text-primary-purple'
                  : ''
              } flex gap-4`}
            >
              <Inbox className='w-6 ' />
              <span
                className={
                  'transition-opacity ease-linear ' +
                  (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                }
              >
                Inbox
              </span>
            </a>
          </Link>
        </li>
        <li
          className={`${
            colorMode === 'dark'
              ? 'hover:text-my-orange'
              : 'hover:text-primary-purple'
          } overflow-hidden  flex `}
        >
          <Link href='/collabs'>
            <a
              className={`${
                query === '/collabs' && colorMode === 'dark'
                  ? 'text-my-orange'
                  : colorMode === 'light' && query === '/collabs'
                  ? 'text-primary-purple'
                  : ''
              } flex gap-4`}
            >
              <Collaborations className='w-6 ' />
              <span
                className={
                  'transition-opacity ease-linear ' +
                  (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                }
              >
                Collaborations
              </span>
            </a>
          </Link>
        </li>
        <li
          className={`${
            colorMode === 'dark'
              ? 'hover:text-my-orange'
              : 'hover:text-primary-purple'
          } overflow-hidden  flex `}
        >
          <Link href='/subscription'>
            <a
              className={`${
                query === '/subscription' && colorMode === 'dark'
                  ? 'text-my-orange'
                  : colorMode === 'light' && query === '/subscription'
                  ? 'text-primary-purple'
                  : ''
              } flex gap-4`}
            >
              <MdSubscriptions className='text-2xl ' />

              <span
                className={
                  'transition-opacity ease-linear ' +
                  (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                }
              >
                Subscriptions
              </span>
            </a>
          </Link>
        </li>
        <Box as='li' overflow={'hidden'}>
          <div className='flex items-center w-40 gap-5 '>
            <Light onClick={toggleColorMode} className='w-6 cursor-pointer ' />

            <Switch
              _focus={{ boxShadow: 'transparent !important' }}
              isChecked={colorMode === 'dark'}
              colorScheme='brand'
              onChange={toggleColorMode}
            />
            <Dark onClick={toggleColorMode} className='w-4 cursor-pointer ' />
          </div>
        </Box>
        <li
          className={`${
            colorMode === 'dark'
              ? 'hover:text-my-orange'
              : 'hover:text-primary-purple'
          } overflow-hidden  flex `}
        >
          <Link href='/notifications'>
            <a
              className={`${
                query === '/notifications' && colorMode === 'dark'
                  ? 'text-my-orange '
                  : colorMode === 'light' && query === '/notifications'
                  ? 'text-primary-purple'
                  : ''
              } flex gap-4`}
            >
              <Box pos='relative'>
                <Notifications
                  className={`w-6 ${
                    query === '/notifications' ? 'text-primary-purple' : 'white'
                  }`}
                  fill={query === '/notifications' ? '#8B37FF ' : 'none'}
                />
                {data?.data?.notification && (
                  <Box
                    pos='absolute'
                    right={0}
                    top={0}
                    w='0.6em'
                    h='0.6em'
                    bg='brand.500'
                    borderRadius='full'
                  ></Box>
                )}
              </Box>
              <span
                className={
                  'transition-opacity ease-linear ' +
                  (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                }
              >
                Notifications
              </span>
            </a>
          </Link>
        </li>
        <li
          className={`${
            colorMode === 'dark'
              ? 'hover:text-my-orange'
              : 'hover:text-primary-purple'
          } overflow-hidden  flex `}
        >
          <Link href='/settings'>
            <a
              className={`${
                query === '/settings' && colorMode === 'dark'
                  ? 'text-my-orange'
                  : colorMode === 'light' && query === '/settings'
                  ? 'text-primary-purple'
                  : ''
              } flex gap-4`}
            >
              <Settings className='w-6 ' />
              <span
                className={
                  'transition-opacity ease-linear ' +
                  (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                }
              >
                Settings
              </span>
            </a>
          </Link>
        </li>
        <li
          className={`${
            colorMode === 'dark'
              ? 'hover:text-my-orange'
              : 'hover:text-primary-purple'
          } overflow-hidden  flex `}
        >
          <Link passHref href='/profile'>
            <a className='relative flex items-center gap-4'>
              <img
                src={src}
                alt='google profile picture'
                className='object-cover w-[25px] mr-3 duration-150 aspect-square rounded-full right-1/4 '
              />
              <Box className='flex items-center gap-4 absolute left-[40px]'>
                <span
                  className={
                    (query === '/profile' && colorMode === 'dark'
                      ? 'text-my-orange '
                      : colorMode === 'light'
                      ? 'text-primary-purple'
                      : '') +
                    'transition-opacity ease-linear ' +
                    (toggleSidebar ? 'opacity-0' : 'delay-200 opacity-1')
                  }
                >
                  Profile
                </span>
              </Box>
            </a>
          </Link>
        </li>
      </Box>
    </Box>
  );
}
