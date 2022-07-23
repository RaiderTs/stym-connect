import Play from '../../components/svg/play-filled.svg';
import Pause from '../../components/svg/pause-filled.svg';
import Dots from '../../components/svg/dots.svg';
import Open from '../../components/svg/open.svg';
import Download from '../../components/svg/downloadAlbum.svg';
import Delete from '../../components/svg/delete.svg';
import { format } from 'date-fns';
import {
  pausePlayback,
  setCurrentTrack,
  setPlaylist,
  startPlayback,
} from '../../features/audio/audioSlice';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/dist/client/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  useDeleteFolderMutation,
  useGetFileByIdQuery,
  useGetStymByIdQuery,
  useGetEditFileQuery,
} from '../../features/stymQuery';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useColorMode,
  useMediaQuery,
} from '@chakra-ui/react';
import LoadingSpinner from '../LoadingSpinner';
import StymTrack from '../Mystym/StymTrack';

export function InboxItem({ itemInbox, isLoading }) {
  const { colorMode } = useColorMode();
  const [sm] = useMediaQuery('(min-width: 640px)');
  const [shouldStartFetching, setShouldStartFetching] = useState(true);
  const [s3Loading, setS3Loading] = useState(true);

  const { data = {} } = useGetStymByIdQuery(itemInbox?.info?.stym?.id, {
    skip: shouldStartFetching || !itemInbox?.info?.stym?.id,
  });
  const { data: fileInfo } = useGetFileByIdQuery(itemInbox?.info?.file?.id, {
    skip: shouldStartFetching || !itemInbox?.info?.file?.id,
  });

  const src = itemInbox?.info?.file?.link;
  return (
    <Box
      h={sm ? '5.375rem' : 'auto'}
      py={4}
      w={sm ? '100%' : '85%'}
      borderRadius='15px'
      bg={!itemInbox?.inboxRead ? 'gray.300' : 'gray.100'}
      color='brand-black.500'
    >
      <Flex
        px={6}
        gap={12}
        alignItems={sm ? 'center' : ''}
        flexDirection={sm ? 'row' : 'column'}
        justifyContent='space-between'
        whiteSpace='nowrap'
      >
        <Flex alignItems='center' gap={6}>
          <img
            // src='/stym-dark.png'
            src={itemInbox.users.viewer.image || '/stym-dark.png'}
            className='rounded-full aspect-square'
            width='50px'
            height='50px'
            alt='img'
          />
          <Tooltip
            label={itemInbox?.users?.viewer?.name}
            variant='my-tooltip'
            borderRadius='10px'
            // left='70px'
            placement='top-start'
            padding='5px 15px'
            backgroundColor={colorMode === 'dark' && '#0F2042'}
          >
            <Text whiteSpace='nowrap' mr='10px' className='w-[200px] truncate'>
              {itemInbox?.users?.viewer?.name}
            </Text>
          </Tooltip>

          {!sm && (
            <Text>
              {format(new Date(itemInbox.createAt.replace(/-/g, '/')), 'LLL d')}
            </Text>
          )}
          {!sm && (
            <Text>
              {format(new Date(itemInbox.createAt.replace(/-/g, '/')), 'p')}
            </Text>
          )}
        </Flex>

        <Flex
          gap={24}
          alignItems='center'
          width='55%'
          justifyContent='spaceBetween'
        >
          <Box minW={sm && '10rem'} width='41rem'>
            <StymTrack
              folderId={null}
              id={itemInbox?.info?.file?.id}
              image={
                itemInbox?.info?.file
                  ? itemInbox?.info?.file?.image
                  : itemInbox?.info?.stym
                  ? itemInbox?.info?.stym?.image
                  : '/stym-dark.png'
              }
              info={data?.stym?.info || fileInfo?.file?.info}
              itemInbox={itemInbox}
              name={
                itemInbox?.info?.file
                  ? itemInbox?.info?.file?.name
                  : itemInbox?.info?.stym
                  ? itemInbox?.info?.stym?.name
                  : '/stym-dark.png'
              }
              src={src}
              isHome={itemInbox?.info?.isHome}
              isInbox={true}
              share={itemInbox?.info?.share}
              shouldStartFetching={shouldStartFetching}
              setShouldStartFetching={setShouldStartFetching}
              s3Loading={s3Loading}
              setS3Loading={setS3Loading}
            />
          </Box>
          <Flex gap={5}>
            {sm && (
              <Text>
                {format(
                  new Date(itemInbox.createAt.replace(/-/g, '/')),
                  'LLL d'
                )}
              </Text>
            )}
            {sm && (
              <Text>
                {format(new Date(itemInbox.createAt.replace(/-/g, '/')), 'p')}
              </Text>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
