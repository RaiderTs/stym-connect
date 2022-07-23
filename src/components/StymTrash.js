import axios from 'axios';
import fileDownload from 'js-file-download';

import PlayAlbumOrange from '../components/svg/playAlbumOrange.svg';
import Download from '../components/svg/downloadAlbum.svg';
import Dots from '../components/svg/dots.svg';
import Delete from '../components/svg/delete.svg';
import Pause from '../components/svg/pause.svg';
import Info from '../components/svg/info.svg';
import Arrow from '../components/svg/arrow-left.svg';
import Image from 'next/image';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
  useDisclosure,
  Box,
  useColorMode,
} from '@chakra-ui/react';
import {
  pausePlayback,
  setCurrentTrack,
  setPlaylist,
} from '../features/audio/audioSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { userSelector } from '../selectors/auth';
import {
  useAddToMyStymPageMutation,
  useRemoveFromMyStymPageMutation,
} from '../features/stymQuery';
import { deleteS3Object } from '../pages/api/s3-delete';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import FileDetails from './FileDetails';
import md5 from 'md5';

export default function StymTrash({
  image,
  name,
  src,
  id,
  playlist,
  folderId,
  info,
  isHome = false,
  isMyStym = false,
}) {
  const router = useRouter();
  const user = useSelector(userSelector);
  // const token = user.token;
  const { colorMode } = useColorMode();
  const [isOpenShare, setIsOpenShare] = useState(false);
  const [isFileDetailsOpen, setIsFileDetailsOpen] = useState(false);
  const [isError, setIsError] = useState();
  const [s3Loading, setS3Loading] = useState(true);
  const open = () => setIsFileDetailsOpen(!isFileDetailsOpen);
  const isPlaying = useSelector((state) => state.audio.currentTrack.isPlaying);
  const currentTrack = useSelector((state) => state.audio.currentTrack);
  const selected = useSelector((state) => state.modal.selected);
  const dispatch = useDispatch();

  const [addToMyStymPage, { isLoading: isAddingToMyStymPage }] =
    useAddToMyStymPageMutation();
  const [removeFromMyStymPage, { isLoading: isRemovingFromMyStymPage }] =
    useRemoveFromMyStymPageMutation();
  const { sid } = router.query;

  const toggleShowOnMyStymPage = async () => {
    if (isHome.status === false) {
      const res = await addToMyStymPage(isHome.shareId);
      if (res.data.status) {
        toast.success('Added to My Stym page', {
          position: 'bottom-center',
        });
      }
    } else if (isHome.status === true) {
      const res = await removeFromMyStymPage(isHome.shareId);
      if (res.data.status) {
        toast.success('Removed from My Stym page', {
          position: 'bottom-center',
        });
      }
    }
  };

  const handlePlay = () => {
    dispatch(
      setCurrentTrack({
        title: name,
        src,
        fileId: id,
        folderId,
        image,
        playMode: 'single',
      })
    );
    // } else dispatch(startPlayback());
    if (playlist) {
      dispatch(setPlaylist(playlist));
    }
  };

  const handlePause = () => {
    dispatch(pausePlayback());
  };

  const handleDownload = async () => {
    setS3Loading(false);
    try {
      const handleDownloadFile = (src, name) => {
        const id = toast.loading('Downloading...', {
          position: 'bottom-right',
        });
        axios
          .get(src, {
            responseType: 'blob',
          })
          .then((res) => {
            res &&
              toast.update(id, {
                render: 'File downloaded',
                type: 'success',
                isLoading: false,
                autoClose: 1000,
                position: 'bottom-center',
              });
            !res &&
              toast.update(id, {
                render: 'Something went wrong!',
                type: 'error',
                isLoading: false,
                autoClose: 1000,
                position: 'bottom-center',
              });
            fileDownload(res.data, name);
          })
          .catch(() => {
            toast.update(id, {
              render: 'Something went wrong!',
              type: 'error',
              isLoading: false,
              autoClose: 5,
              position: 'bottom-center',
            });
            toast.clearWaitingQueue();
          });
        setS3Loading(true);
        return;
      };
      handleDownloadFile(src, name);
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: 'Something went wrong!',
        type: 'error',
        isLoading: false,
        autoClose: 1000,
        position: 'bottom-center',
      });
    }
    toast.clearWaitingQueue();
  };

  return (
    <>
      <Box
        borderColor={colorMode === 'light' ? 'gray.100' : 'gray.600'}
        className={`${
          isPlaying && currentTrack.fileId === id
            ? 'bg-primary-purple text-white'
            : ''
        } gap-4 flex items-center justify-between w-[100%] h-14 px-3 py-2 shadow-md border text-sm rounded-10 `}
      >
        <div className='flex items-center gap-4 truncate'>
          <Image
            src={image || '/stym-dark.png'}
            width={40}
            height={40}
            className='rounded-10 '
            alt='album cover'
          />
          <span className='max-w-[30ch] whitespace-nowrap truncate'>
            {name}
          </span>
        </div>
        <div className='flex gap-4'>
          {src?.includes('.mp3') ||
          src?.includes('.wav') ||
          src?.includes('.aac') ||
          src?.includes('.mp4') ||
          src?.includes('.ogg') ||
          src?.includes('.flac') ||
          src?.includes('.m4a') ? (
            isPlaying && currentTrack.fileId === id ? (
              <Pause className='w-5 cursor-pointer' onClick={handlePause} />
            ) : (
              <PlayAlbumOrange
                className='w-4 cursor-pointer'
                onClick={handlePlay}
              />
            )
          ) : null}
          <Box as='button' disabled={!s3Loading} onClick={handleDownload}>
            <Download className='w-4 cursor-pointer' />
          </Box>
          {/* delete and details menu */}
          <Popover placement='bottom-end' gutter={11} closeOnBlur={true}>
            {({ isOpen, onClose }) => (
              <>
                <PopoverTrigger>
                  <Box>
                    <Dots className='flex w-5 cursor-pointer' />
                  </Box>
                </PopoverTrigger>
                <PopoverContent
                  _focus={{ boxShadow: 'none' }}
                  w={'fit-content'}
                >
                  <PopoverBody gap={5} experimental_spaceY={3}>
                    <FileDetails
                      info={info}
                      isOpen={isFileDetailsOpen}
                      open={open}
                    />

                    {isHome && (
                      <Text
                        onClick={() => {
                          toggleShowOnMyStymPage();
                          onClose();
                        }}
                        display={'flex'}
                        gap={2}
                        _hover={{ color: 'brand.500' }}
                        cursor='pointer'
                      >
                        {!isHome.status ? (
                          <Arrow className='w-4 ' aria-hidden='true' />
                        ) : (
                          <Arrow
                            className='w-4 rotate-180'
                            aria-hidden='true'
                          />
                        )}
                        {!isHome.status ? 'To My Stym' : 'From My Stym'}
                      </Text>
                    )}
                  </PopoverBody>
                </PopoverContent>
              </>
            )}
          </Popover>
        </div>
      </Box>
    </>
  );
}
