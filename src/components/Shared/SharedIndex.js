import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { googleSignout } from '../../features/auth/authSlice';
import Chevron from '../svg/navigateBack.svg';
import {
  useGetAllStymsQuery,
  useGetSharedFilesQuery,
  useSortShareFilesQuery,
} from '../../features/stymQuery';
import StymAlbum from '../Mystym/StymAlbum';
import StymTrack from '../Mystym/StymTrack';
import ChakraMenu from '../ChakraMenu';
import FilterMenu from '../Filter';
import NProgress from 'nprogress';
import { colorMode, Box, Skeleton } from '@chakra-ui/react';

export default function SharedHome() {
  const [queryOptions, setQueryOptions] = useState();
  const [s3Loading, setS3Loading] = useState(true);

  const {
    data: { shares } = [],
    isLoading,
    error,
    isFetching,
  } = useSortShareFilesQuery(queryOptions, {
    // skip: !queryOptions,
  });

  if (isFetching) {
    NProgress.start();
  } else {
    NProgress.done();
  }

  const router = useRouter();
  const dispatch = useDispatch();

  if (error?.status === 401) {
    dispatch(googleSignout());
    router.push('/sign-in');
  }

  const handleSortByName = () => {
    setQueryOptions(() => ({
      sortName: 'name',
    }));
  };
  const handleSortByLastModified = () => {
    setQueryOptions(() => ({
      sortLastModified: 'lastModified',
    }));
  };
  const handleSortByDate = () => {
    setQueryOptions(() => ({
      sortLastModified: 'date',
    }));
  };

  const options = [
    {
      id: 0,
      title: 'Name',
      key: 'name',
      handleClick: () => handleSortByName,
    },
    {
      id: 1,
      title: 'Last modified',
      key: 'modified',
      handleClick: () => handleSortByLastModified,
    },
    {
      id: 2,
      title: 'Date',
      key: 'Date',
      handleClick: () => handleSortByDate,
    },
  ];

  const chevron = (
    <Chevron
      className={`w-2 rotate-[270deg] ${
        colorMode === 'dark' ? 'text-my-orange' : 'text-primary-purple'
      }`}
      aria-hidden='true'
    />
  );

  return (
    <div className='h-full '>
      <h1 className='mb-12 text-5xl font-medium'>Shared</h1>
      <Box display='flex' alignItems='center' justifyContent='end'>
        <ChakraMenu name='Sort' menuBtn={chevron} options={options} />
      </Box>
      <div className='gap-8 mb-12 '>
        {shares &&
          shares?.map((s) => {
            return (
              <div
                key={
                  s?.email
                    ? s?.email
                    : s?.letter
                    ? s?.letter
                    : s?.lastModified
                    ? s?.lastModified
                    : s?.date
                    ? s?.date
                    : ''
                }
                className='mb-12'
              >
                {/* {console.log(
                  s?.files !== null ? s?.files[0].info?.owner?.name : ''
                )} */}

                {s.email && s.name ? (
                  <div className='flex items-center gap-4'>
                    <p className='mb-5 text-base font-medium'>{s.name}</p>
                    <p className='mb-5 text-sm text-gray-400'>({s.email})</p>
                  </div>
                ) : (
                  <div className='flex items-center gap-4'>
                    <p className='mb-5 text-base font-medium'>
                      {s?.files !== null
                        ? s?.files[0].info?.owner?.name
                        : s?.styms !== null
                        ? s?.styms[0].info?.owner?.name
                        : ''}
                    </p>
                    <p className='mb-5 text-sm text-gray-400'>
                      (
                      {s?.files !== null
                        ? s?.files[0].info?.owner?.email
                        : s?.styms !== null
                        ? s?.styms[0].info?.owner?.email
                        : ''}
                      )
                    </p>
                  </div>
                )}

                <div className='flex flex-wrap gap-4 mb-10'>
                  {s.styms?.map((stym) => {
                    // console.log(stym?.info?.isHome.status, 'isHome shared page');
                    return (
                      <StymAlbum
                        key={stym.id}
                        stym={stym}
                        // playlist={s.stym.playList}
                        isHome={stym?.info?.isHome}
                        setS3Loading={setS3Loading}
                        s3Loading={s3Loading}
                        shared
                      />
                    );
                  })}
                  {/* {s.styms === null && <p>No Styms</p>} */}
                </div>
                <div className='max-w-md space-y-5'>
                  {s?.files?.map((f) => (
                    <StymTrack
                      link={f.link}
                      info={f.info}
                      createdDate={f.createDate}
                      key={f.id}
                      id={f.id}
                      folderId={f.id}
                      src={f.link}
                      image={f?.stym?.image}
                      name={f.name}
                      isHome={f.info?.isHome}
                      setS3Loading={setS3Loading}
                      s3Loading={s3Loading}
                    />
                  ))}
                </div>
              </div>
            );
          })}

        {isLoading ||
          (isFetching && (
            <>
              <Skeleton
                width='350px'
                height='2rem'
                borderRadius={10}
                mt='20px'
              />
              <Skeleton width='240px' h='240px' borderRadius={10} mt='20px' />
              <Skeleton
                width='350px'
                height='2rem'
                borderRadius={10}
                mt='20px'
              />
              <Skeleton width='240px' h='240px' borderRadius={10} mt='20px' />
              <Skeleton
                width='350px'
                height='2rem'
                borderRadius={10}
                mt='20px'
              />
              <Skeleton width='240px' h='240px' borderRadius={10} mt='20px' />
            </>
          ))}
        {/* {new_shares?.length === 0 && <div>no data</div>} */}
      </div>
    </div>
  );
}
