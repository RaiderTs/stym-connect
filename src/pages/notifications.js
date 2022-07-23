import { useState } from 'react';
import Layout from '../components/Layout';
import Preloader from '../components/Preloader';
import {
  useActivateShareMutation,
  useGetNotificationsQuery,
  useSetNotificationIgnoredMutation,
} from '../features/stymQuery';
import CaretRight from '../components/svg/caret-right.svg';
import { useDispatch } from 'react-redux';
import { googleSignout } from '../features/auth/authSlice';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  color,
  Flex,
  useColorMode,
  Tooltip,
} from '@chakra-ui/react';
import { format, differenceInDays } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import Link from 'next/link';
import NProgress from 'nprogress';

export default function Notifications() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [activeBtn, setActiveBtn] = useState();
  const {
    data: { messages } = [],
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery();

  const [activateShare, { isLoading: isActivating }] = useActivateShareMutation(
    {}
  );

  const [setNotificationIgnored, { isLoading: isIgnored }] =
    useSetNotificationIgnoredMutation();

  if (isIgnored) {
    NProgress.start();
  } else {
    NProgress.done();
  }

  const handleNotificationIgnored = async (notificationId) => {
    try {
      const res = await setNotificationIgnored(notificationId);
      console.log(res);
      if (res.data.status) {
        toast.success('Notification ignored', {
          position: 'bottom-center',
          autoClose: 1000,
        });
      }
    } catch (error) {
      if (!res.data.status) {
        toast.error('Something went wrong. Please try again', {
          position: 'bottom-center',
          autoClose: 1000,
        });
      }
      console.log(error);
    }
  };

  const handleActivateShare = async (e, hash, shareId) => {
    setActiveBtn(shareId);
    // console.log(e.target.name);
    const res = await activateShare(hash);
    if (res.data.status) {
      toast.success('Share activated', {
        position: 'bottom-center',
      });
    }
    setActiveBtn(null);
    // refetch();
  };
  const dispatch = useDispatch();
  const router = useRouter();

  const time = (time) => {
    return format(new Date(time.replace(/-/g, '/')), 'hh:mm a');
  };

  const calculateDiff = (date) => {
    return Math.abs(
      differenceInDays(new Date(date.replace(/-/g, '/')), new Date())
    );
  };

  if (messages?.length === 0) {
    return (
      <Layout>
        <div>
          <h1 className='mb-12 text-5xl font-medium'>Notifications</h1>
          <p className='text-2xl'>No notifications yet</p>
        </div>
      </Layout>
    );
  }

  if (error?.status === 401) {
    dispatch(googleSignout());
    router.push('/sign-in');
  }

  return (
    <Layout>
      <>
        <h1 className='mb-12 text-2xl font-medium md:text-5xl'>
          Notifications
        </h1>
        <div className='mb-12 border-b border-my-gray'>
          <h2
            className={`${
              colorMode === 'dark' ? 'text-white' : ''
            } text-lg font-medium `}
          >
            TODAY
          </h2>
        </div>
        <Flex direction={'column'}>
          {isLoading && (
            <div className='flex items-center justify-between max-w-lg mb-8'>
              <div className='flex items-center'>
                <Preloader
                  height={'h-[52px]'}
                  width={'w-[52px]'}
                  rounded={'rounded-full'}
                />
                <div className='flex flex-col ml-4'>
                  <Preloader height={'h-[20px]'} width={'w-[250px]'} />
                  <Preloader
                    height={'h-[20px]'}
                    width={'w-[100px]'}
                    mt={'mt-2'}
                  />
                </div>
              </div>
              <div>
                <Preloader height={'h-[5px]'} width={'w-[50px]'} />
              </div>
            </div>
          )}
          {messages?.length > 0 && !isLoading
            ? messages
                // .filter(
                //   (thing, index, self) =>
                //     self.findIndex(
                //       (t) =>
                //         t?.info?.isHome?.sharedId ===
                //         thing?.info?.isHome?.sharedId
                //     ) === index
                // )
                .map((message) => {
                  // console.log(message);
                  if (calculateDiff(message?.createAt) === 0) {
                    return (
                      <div key={message?.id} className='max-w-lg mb-10'>
                        <div className='flex justify-between'>
                          {/* avatar and username div */}
                          <div className='flex items-center mb-8 '>
                            <img
                              src={
                                message?.users?.viewer?.image ||
                                '/profile_pic.png'
                              }
                              alt='profile pic'
                              className='h-[52px] w-[52px] rounded-full object-cover aspect-square items-center'
                            />
                            <div className='flex flex-col items-start gap-2 ml-2 '>
                              <Tooltip
                                label={message?.users?.viewer?.name}
                                variant='my-tooltip'
                                borderRadius='10px'
                                left='5px'
                                placement='top-start'
                                padding='5px 15px'
                                backgroundColor={
                                  colorMode === 'dark' && '#0F2042'
                                }
                              >
                                <span
                                  className={`w-[350px] truncate ${
                                    colorMode === 'dark' ? 'text-my-orange' : ''
                                  } text-base font-medium mb-0.5  leading-[100%]`}
                                >
                                  {message?.users?.viewer?.name}
                                </span>
                              </Tooltip>

                              {message?.info?.stym && (
                                <span
                                  className={`font-normal text-sm md:text-md leading-[100%] ${
                                    colorMode === 'dark'
                                      ? ' text-gray-400'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  Shared a stym with you
                                </span>
                              )}
                              {message?.info?.file && (
                                <span
                                  className={`font-normal text-sm md:text-md leading-[100%] ${
                                    colorMode === 'dark'
                                      ? ' text-gray-400'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  Shared a file with you
                                </span>
                              )}
                              {message?.info === null && (
                                <span
                                  className={`font-normal text-sm md:text-md leading-[100%] ${
                                    colorMode === 'dark'
                                      ? ' text-gray-400'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {message?.message}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* time div */}
                          <div
                            className={`  ${
                              colorMode === 'dark'
                                ? ' text-gray-400'
                                : 'text-gray-500'
                            }`}
                          >
                            <span className='text-md whitespace-nowrap'>
                              {time(message?.createAt)}
                            </span>
                          </div>
                        </div>
                        {message?.info?.file && !message?.info?.stym && (
                          <Tooltip
                            label={message?.info?.file?.name}
                            variant='my-tooltip'
                            borderRadius='10px'
                            // left='70px'
                            placement='bottom-start'
                            padding='5px 15px'
                            backgroundColor={colorMode === 'dark' && '#0F2042'}
                          >
                            <p className='ml-[50px] w-[365px] truncate'>
                              File:&nbsp; {message?.info?.file?.name}
                            </p>
                          </Tooltip>
                        )}
                        {message?.info?.stym && (
                          <div className='flex items-center justify-between gap-4 '>
                            <div className='flex items-center '>
                              <div className='ml-[50px]'>
                                {colorMode === 'dark' ? (
                                  <img
                                    className='rounded-md w-9 h-9 '
                                    src={
                                      message?.info?.stym?.image ||
                                      '/stym-light.png'
                                    }
                                    alt='stym cover'
                                  />
                                ) : (
                                  <img
                                    className='rounded-md w-9 h-9'
                                    src={
                                      message?.info?.stym?.image ||
                                      '/stym-dark.png'
                                    }
                                    alt='stym cover'
                                  />
                                )}
                              </div>
                              <Tooltip
                                label={message?.info?.stym?.name}
                                variant='my-tooltip'
                                borderRadius='10px'
                                left='50px'
                                placement='bottom-end'
                                padding='5px 15px'
                                backgroundColor={
                                  colorMode === 'dark' && '#0F2042'
                                }
                              >
                                <p className='ml-[15px] w-[150px] truncate'>
                                  {message?.info?.stym?.name}
                                </p>
                              </Tooltip>

                              {message?.info?.file && (
                                <Tooltip
                                  label={message?.info?.file?.name}
                                  variant='my-tooltip'
                                  borderRadius='10px'
                                  // left='70px'
                                  placement='top-end'
                                  padding='5px 15px'
                                  backgroundColor={
                                    colorMode === 'dark' && '#0F2042'
                                  }
                                >
                                  <p className='ml-6 w-[200px] truncate'>
                                    File:&nbsp; {message?.info?.file?.name}
                                  </p>
                                </Tooltip>
                              )}
                            </div>

                            <Link href={`my-stym/${message?.info?.stym?.id}`}>
                              <a
                                className={`${
                                  colorMode === 'dark' ? 'text-my-orange' : ''
                                }`}
                              >
                                <CaretRight className='w-6 h-6' />
                              </a>
                            </Link>
                          </div>
                        )}
                        {message?.info?.share && (
                          <Flex
                            gap={8}
                            float={'right'}
                            alignItems='center'
                            mt='15px'
                          >
                            {!message?.info?.share?.active && (
                              <button
                                name='ignore'
                                onClick={() =>
                                  handleNotificationIgnored(message?.id)
                                }
                                disabled={message?.ignored}
                                className={`${
                                  colorMode === 'dark'
                                    ? 'text-primary-purple'
                                    : 'text-primary-purple'
                                } flex  disabled:cursor-default cursor-pointer`}
                              >
                                {/* {isIgnored && (
                                <LoadingSpinner color='text-primary mr-3' />
                              )} */}
                                {message?.ignored ? 'Ignored' : 'Ignore'}
                              </button>
                            )}
                            {!message?.ignored && (
                              <Button
                                name='activate'
                                variant='outline'
                                border='none'
                                size='sm'
                                fontWeight='normal'
                                onClick={(e) =>
                                  handleActivateShare(
                                    e,
                                    message?.info?.share?.hash,
                                    message?.info?.share?.shareId
                                  )
                                }
                                disabled={message?.info?.share?.active}
                                _disabled={{ cursor: 'default' }}
                              >
                                {message?.info?.share?.active ? (
                                  <span
                                    className={`${
                                      colorMode === 'dark'
                                        ? 'text-primary-purple'
                                        : 'text-primary-purple'
                                    }`}
                                  >
                                    Access granted
                                  </span>
                                ) : (
                                  <span
                                    className={`${
                                      colorMode === 'dark'
                                        ? 'text-primary-purple'
                                        : 'text-primary-purple'
                                    }`}
                                  >
                                    Grant access
                                  </span>
                                )}
                              </Button>
                            )}
                          </Flex>
                        )}
                      </div>
                    );
                  } else {
                    return null;
                  }
                })
            : null}
          {messages?.length === 0 && <p>No notifications for today</p>}
        </Flex>

        {/* LAST WEEEK */}

        <div className='mb-12 border-b border-my-gray'>
          <h2 className='text-lg font-medium '>LAST WEEK</h2>
        </div>
        <div className='flex flex-col-reverse mb-8'>
          {isLoading && (
            <div className='flex items-center justify-between max-w-lg'>
              <div className='flex items-center'>
                <Preloader
                  height={'h-[52px]'}
                  width={'w-[52px]'}
                  rounded={'rounded-full'}
                />
                <div className='flex flex-col ml-4'>
                  <Preloader height={'h-[20px]'} width={'w-[250px]'} />
                  <Preloader
                    height={'h-[20px]'}
                    width={'w-[100px]'}
                    mt={'mt-2'}
                  />
                </div>
              </div>
              <div>
                <Preloader height={'h-[5px]'} width={'w-[50px]'} />
              </div>
            </div>
          )}
          {messages &&
            messages?.map((message) => {
              if (
                calculateDiff(message?.createAt) <= 7 &&
                calculateDiff(message?.createAt) !== 0
              ) {
                return (
                  <div
                    key={message?.id}
                    className='flex justify-between max-w-lg'
                  >
                    <div className='flex items-center mb-8 '>
                      <img
                        src={
                          message?.users?.viewer?.image || '/profile_pic.png'
                        }
                        alt='profile pic'
                        className='h-[52px] w-[52px] rounded-full object-cover aspect-square items-center'
                      />
                      <div className='flex flex-col items-start gap-2 ml-2 '>
                        <Tooltip
                          label={message?.users?.viewer?.name}
                          variant='my-tooltip'
                          borderRadius='10px'
                          left='5px'
                          placement='top-start'
                          padding='5px 15px'
                          backgroundColor={colorMode === 'dark' && '#0F2042'}
                        >
                          <span
                            className={`w-[350px] truncate ${
                              colorMode === 'dark' ? 'text-my-orange' : ''
                            } text-base font-medium mb-0.5  leading-[100%]`}
                          >
                            {message?.users?.viewer?.name}
                          </span>
                        </Tooltip>
                        <Tooltip
                          label={
                            // calculateDiff(message.createAt) +
                            message?.message
                          }
                          variant='my-tooltip'
                          borderRadius='10px'
                          left='5px'
                          placement='top-start'
                          padding='5px 15px'
                          backgroundColor={colorMode === 'dark' && '#0F2042'}
                        >
                          <span
                            className={`w-[350px] truncate font-normal text-sm md:text-md leading-[100%] ${
                              colorMode === 'dark'
                                ? ' text-gray-400'
                                : 'text-gray-500'
                            }`}
                          >
                            {/* {calculateDiff(message.createAt)} */}
                            {message?.message}
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                    <div className='flex items-center mb-8 '>
                      <span
                        className={`whitespace-nowrap text-[16px] ${
                          colorMode === 'dark'
                            ? ' text-gray-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {time(message?.createAt)}
                      </span>
                    </div>
                  </div>
                );
              }
            })}
        </div>

        <>
          <div className='mb-12 border-b border-my-gray'>
            <h2 className='mb-2 text-lg font-medium uppercase '>
              More than a week ago
            </h2>
          </div>
          {isLoading && (
            <div className='flex items-center justify-between max-w-lg'>
              <div className='flex items-center'>
                <Preloader
                  height={'h-[52px]'}
                  width={'w-[52px]'}
                  rounded={'rounded-full'}
                />
                <div className='flex flex-col ml-4'>
                  <Preloader height={'h-[20px]'} width={'w-[250px]'} />
                  <Preloader
                    height={'h-[20px]'}
                    width={'w-[100px]'}
                    mt={'mt-2'}
                  />
                </div>
              </div>
              <div>
                <Preloader height={'h-[5px]'} width={'w-[50px]'} />
              </div>
            </div>
          )}
          <div className='flex flex-col-reverse mb-8'>
            {messages &&
              messages?.map((message) => {
                if (calculateDiff(message?.createAt) > 14) {
                  return (
                    <div
                      key={message?.id}
                      className='flex justify-between max-w-lg'
                    >
                      <div className='flex items-center mb-8 '>
                        <img
                          src={
                            message?.users?.viewer?.image || '/profile_pic.png'
                          }
                          alt='profile pic'
                          className='h-[52px] w-[52px] rounded-full  object-cover aspect-square items-center'
                        />
                        <div className='flex flex-col items-start gap-2 ml-2 '>
                          <Tooltip
                            label={message?.users?.viewer?.name}
                            variant='my-tooltip'
                            borderRadius='10px'
                            left='5px'
                            placement='top-start'
                            padding='5px 15px'
                            backgroundColor={colorMode === 'dark' && '#0F2042'}
                          >
                            <span
                              className={`w-[350px] truncate ${
                                colorMode === 'dark' ? 'text-my-orange' : ''
                              } text-base font-medium mb-0.5  leading-[100%]`}
                            >
                              {message?.users?.viewer?.name}
                            </span>
                          </Tooltip>
                          <Tooltip
                            label={message?.message}
                            variant='my-tooltip'
                            borderRadius='10px'
                            left='5px'
                            placement='top-start'
                            padding='5px 15px'
                            backgroundColor={colorMode === 'dark' && '#0F2042'}
                          >
                            <span
                              className={`font-normal text-sm md:text-md leading-[100%]  w-[350px] truncate ${
                                colorMode === 'dark'
                                  ? ' text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              {message?.message}
                            </span>
                          </Tooltip>
                        </div>
                      </div>
                      <div className='flex items-center mb-8 '>
                        <span
                          className={`whitespace-nowrap text-[16px] ${
                            colorMode === 'dark'
                              ? ' text-gray-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {time(message?.createAt)}
                        </span>
                      </div>
                    </div>
                  );
                }
              })}
          </div>
        </>
      </>
    </Layout>
  );
}
