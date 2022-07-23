import axios from 'axios';
import fileDownload from 'js-file-download';

import PlayAlbumOrange from '../../components/svg/playAlbumOrange.svg';
import Download from '../../components/svg/downloadAlbum.svg';
import ShareAlbum from '../../components/svg/shareAlbum.svg';
import Dots from '../svg/dots.svg';
import Delete from '../svg/delete.svg';
import Pause from '../svg/pause.svg';
import Info from '../svg/info.svg';
import Arrow from '../svg/arrow-left.svg';
import Open from '../svg/open.svg';
import Image from 'next/image';
import PlayTrack from '../svg/play-filled.svg';
import PauseTrack from '../svg/pause-filled.svg';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
  Tooltip,
  useDisclosure,
  Box,
  Button,
  useColorMode,
} from '@chakra-ui/react';
import {
  pausePlayback,
  setCurrentTrack,
  setPlaylist,
  startPlayback,
} from '../../features/audio/audioSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { userSelector } from '../../selectors/auth';
import {
  useAddToMyStymPageMutation,
  useCreateStymShareMutation,
  useDeleteFileMutation,
  useRemoveFromMyStymPageMutation,
  useActivateShareMutation,
} from '../../features/stymQuery';
import Modal from '../Modal';
import ShareMenu from '../Shared/ShareMenu';
import { deleteS3Object } from '../../pages/api/s3-delete';
import {
  downloadS3Object,
  getS3File,
  streamToString,
} from '../../pages/api/s3-download';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import FileDetails from '../../components/FileDetails';
import md5 from 'md5';
import Link from 'next/link';
import LoadingSpinner from '../LoadingSpinner';

export default function StymTrack({
  image,
  name,
  src,
  id,
  playlist,
  folderId,
  info,
  isHome = false,
  isMyStym = false,
  shouldStartFetching = true,
  setShouldStartFetching = null,
  share,
  isPlaylistQueue = false,
  isInbox = false,
  isPublic = false,
  s3Loading,
  setS3Loading,
  itemInbox,
  link,
}) {
  const router = useRouter();
  const user = useSelector(userSelector);
  // const token = user.token;
  const { colorMode } = useColorMode();
  const [isOpenShare, setIsOpenShare] = useState(false);
  const [isFileDetailsOpen, setIsFileDetailsOpen] = useState(false);
  const [activeBtn, setActiveBtn] = useState();
  const [isError, setIsError] = useState();
  const currentStymId = useSelector((state) => state.audio.currentTrack.stymId);

  const open = () => setIsFileDetailsOpen(!isFileDetailsOpen);
  const isPlaying = useSelector((state) => state.audio.currentTrack.isPlaying);
  const currentTrack = useSelector((state) => state.audio.currentTrack);
  const selected = useSelector((state) => state.modal.selected);
  const dispatch = useDispatch();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();
  const [createShare, { isLoading: isSharing }] = useCreateStymShareMutation();
  const [addToMyStymPage, { isLoading: isAddingToMyStymPage }] =
    useAddToMyStymPageMutation();
  const [removeFromMyStymPage, { isLoading: isRemovingFromMyStymPage }] =
    useRemoveFromMyStymPageMutation();
  const [activateShare, { isLoading: isActivating }] = useActivateShareMutation(
    {}
  );
  const { sid } = router.query;

  if (isDeleting) {
    NProgress.start();
  } else {
    NProgress.done();
  }

  const handleDelete = async (id, folderId = null) => {
    try {
      const res = await deleteFile({ stymId: sid || 0, folderId, fileId: id });
      // console.log(res);
      if (res.data.status) {
        toast.success('File deleted', {
          position: 'bottom-center',
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error('Something went wrong!', {
        position: 'bottom-center',
        autoClose: 1000,
      });
      console.log(error);
    }
  };

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

  const handleDownload = async () => {
    // console.log('click');
    setS3Loading(false);
    const sanitizedFilename = name?.replace(/[^A-Za-z0-9.]/g, '_');
    const stymId = md5(`${sid}`);
    const path = sid
      ? `${md5(user.email)}/${stymId}/${sanitizedFilename}`
      : `${md5(user.email)}/${sanitizedFilename}`;
    try {
      const fileUrl = await getS3File(`public/${path}`);
      const handleDownloadFile = (fileUrl, name) => {
        const id = toast.loading('Downloading...', {
          position: 'bottom-right',
        });
        axios
          .get(fileUrl, {
            responseType: 'blob',
          })
          .then((res) => {
            res &&
              toast.update(id, {
                render: 'File downloaded',
                type: 'success',
                isLoading: false,
                autoClose: 50,
                position: 'bottom-center',
              });
            setS3Loading(true);
            !res &&
              toast.update(id, {
                render: 'Something went wrong!',
                type: 'error',
                isLoading: false,
                autoClose: 50,
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
            setS3Loading(true);
          });
        return;
      };
      handleDownloadFile(link ? link : fileUrl, name);
      // router.replace(fileUrl);
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: 'Something went wrong!',
        type: 'error',
        isLoading: false,
        autoClose: 1000,
        position: 'bottom-center',
      });
      setS3Loading(true);
    }
    toast.clearWaitingQueue();
  };

  const handleDownloadInboxStym = async () => {
    setS3Loading(false);
    const stymId = md5(`${itemInbox?.info?.stym?.id}`);
    const id = toast.loading('Generating a download link...', {
      position: 'bottom-center',
    });
    try {
      const res = await fetch(
        'https://bcxdoh9y7g.execute-api.us-east-1.amazonaws.com/s3-zip/AWS-create-zip',
        {
          method: 'POST',
          body: JSON.stringify({
            bucketKey: `${md5(itemInbox?.users?.viewer?.email)}/${stymId}`,
            archiveName: itemInbox?.info?.stym?.name?.toString(),
          }),
        }
      );
      const data = await res.json();
      const { fileUrl } = data;
      // console.log(fileUrl, 'res');
      fileUrl &&
        toast.update(id, {
          render: 'Downloading...',
          type: 'success',
          isLoading: false,
          autoClose: 1000,
          position: 'bottom-center',
        });

      data.errorMessage &&
        toast.update(id, {
          render: 'Something went wrong!',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
          position: 'bottom-center',
        });
      router.push(fileUrl);
    } catch (error) {
      toast.update(id, {
        render: 'Something went wrong!',
        type: 'error',
        isLoading: false,
        autoClose: 500,
        position: 'bottom-center',
      });
      setS3Loading(true);
      console.log(error);
    }
    setS3Loading(true);
    toast.clearWaitingQueue();
  };

  const handleDownloadInbox = async () => {
    if (!itemInbox?.info?.file) {
      handleDownloadInboxStym();
      return;
    }
    try {
      const handleDownloadFile = (fileUrl, name) => {
        const id = toast.loading('Downloading...', {
          position: 'bottom-right',
        });
        axios
          .get(fileUrl, {
            responseType: 'blob',
          })
          .then((res) => {
            res &&
              toast.update(id, {
                render: 'File downloaded',
                type: 'success',
                isLoading: false,
                autoClose: 50,
                position: 'bottom-center',
              });

            !res &&
              toast.update(id, {
                render: 'Something went wrong!',
                type: 'error',
                isLoading: false,
                autoClose: 50,
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
        return;
      };
      handleDownloadFile(itemInbox.info.file.link, name);
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: 'Something went wrong!',
        type: 'error',
        isLoading: false,
        autoClose: 1000,
        position: 'bottom-center',
      });
      setS3Loading(true);
    }
    toast.clearWaitingQueue();
  };

  // * file sharing

  const onSubmit = async (values) => {
    if (values.email !== 0) {
      for (let i = 0; i < values.email.length; i++) {
        const email = values.email[i];
        const formData = new FormData();
        sid && formData.append('stym', sid);
        formData.append('file', id);
        formData.append('access', selected.value); // * value from redux state
        formData.append('email', email);
        formData.append('message', values.message);
        try {
          const res = await createShare(formData);
          if (res?.data.status) {
            toast.success('Stym shared', {
              position: 'bottom-center',
            });
            setIsError(false);
          } else if (
            res?.data.message ===
            'This file has already been shared with this user'
          ) {
            toast.error(
              `This file has already been shared with ${res.data.email}`,
              {
                position: 'bottom-center',
              }
            );
          } else {
            toast.error('Something went wrong!', {
              position: 'bottom-center',
            });
            // setIsError(true);
          }
        } catch (error) {
          console.log(error);
          setIsError(true);
        }
        !isError && setIsOpenShare(false);
      }
    }
    // group
    if (values.group !== 0) {
      for (let i = 0; i < values.group.length; i++) {
        const group = values.group[i];
        const formData = new FormData();
        sid && formData.append('stym', sid);
        formData.append('file', id);
        formData.append('access', selected.value); // * value from redux state
        formData.append('contactGroupId', group);
        formData.append('message', values.message);

        try {
          const res = await createShare(formData);
          if (res?.data.status) {
            toast.success('Stym shared with group contacts', {
              position: 'bottom-center',
            });
            // setIsError(false);
          } else if (res?.data.message === 'contacts_not_found') {
            toast.error(`Group ${res?.data?.group?.name} is empty`, {
              position: 'bottom-center',
            });
            setIsError(false);
          } else {
            toast.error('Something went wrong!', {
              position: 'bottom-center',
            });
            setIsError(true);
          }
        } catch (error) {
          console.log(error);
        }
        !isError && setIsOpen(false);
      }
    }
  };
  // console.log(itemInbox);

  const handlePlay = () => {
    dispatch(
      setCurrentTrack({
        title: name,
        src,
        fileId: id,
        folderId,
        image,
        playMode: isPlaylistQueue ? 'playlist' : 'single',
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
  // console.log(isMyStym, 'is my stym');
  const handlePlayInbox = () => {
    const folders = itemInbox?.info?.stym?.folders?.map(
      (folder) => folder.files
    );
    const files = folders?.map((file) => file?.map((f) => f)).flat();
    const playlistSource = files?.filter(
      (file) =>
        file.link.includes('mp3') ||
        file.link.includes('.wav') ||
        file.link.includes('.aac') ||
        file.link.includes('.mp4') ||
        file.link.includes('.ogg') ||
        file.link.includes('.flac') ||
        file.link.includes('.m4a')
    );
    if (
      folders?.length === 0 ||
      playlistSource?.length === 0 ||
      files?.length === 0
    ) {
      return toast.error('No files in this stym', {
        position: 'bottom-center',
      });
    }

    // * get objects from folders
    // * put them in an array

    // * filter out non audio files

    // console.log(playlistSource.length === 0, 'playlistSource');
    // if (playlist && playlist.length !== 0) {
    // console.log(playlistSource, 'setting files playlist');
    dispatch(setPlaylist(playlistSource));
    if (currentTrack.stymId === itemInbox?.info?.stym?.id) {
      dispatch(startPlayback());
    }

    if (currentTrack.src === null) {
      dispatch(
        setCurrentTrack({
          src: '',
          playMode: 'single',
        })
      );
    }
    // if (currentTrack.src === '') {
    dispatch(
      setCurrentTrack({
        title: playlistSource[0]?.name || null,
        fileId: playlistSource[0]?.id || null,
        folderId: playlistSource[0]?.folder || null,
        src: playlistSource[0]?.link || null,
        image: itemInbox?.info?.stym?.image || playlistSource[0]?.image || null,
        stymId: itemInbox?.info?.stym?.id || null,
        playMode: 'playlist',
        inboxId: itemInbox?.id || null,
      })
    );

    // console.log(playlist.folders, 'playlist from stym album');
    // console.log(files, 'files from stym album');
    // console.log(currentTrack.src, 'track src');
  };

  return (
    <>
      <Box
        borderColor={colorMode === 'light' ? 'gray.100' : 'gray.600'}
        className={`${
          isPlaying && currentTrack.fileId === id
            ? 'bg-primary-purple text-white'
            : ''
        } gap-4 flex items-center justify-between w-[19rem] h-14 md:w-auto px-3 py-2 shadow-md border text-sm rounded-10 `}
      >
        <div className='flex items-center gap-4 truncate'>
          <Image
            src={image || '/stym-dark.png'}
            width={40}
            height={40}
            className='rounded-10 '
            alt='album cover'
          />
          <Tooltip
            label={name}
            variant='my-tooltip'
            borderRadius='10px'
            // left='70px'
            placement='bottom-start'
            padding='5px 15px'
            backgroundColor={colorMode === 'dark' && '#0F2042'}
          >
            <span className='max-w-[30ch] whitespace-nowrap truncate '>
              {name}
            </span>
          </Tooltip>
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
          {itemInbox?.info?.stym && !itemInbox?.info?.file ? (
            isPlaying && currentTrack.inboxId === itemInbox?.id ? (
              <PauseTrack
                onClick={handlePause}
                className='cursor-pointer w-[10px] text-my-orange'
              />
            ) : (
              <PlayTrack
                className='cursor-pointer w-[12px] text-my-orange'
                onClick={handlePlayInbox}
              />
            )
          ) : null}
          {!isPublic && (
            <Box
              as='button'
              disabled={!s3Loading}
              onClick={isInbox ? handleDownloadInbox : handleDownload}
            >
              <Download className='w-4 cursor-pointer' />
            </Box>
          )}
          {!isPublic && user?.email === info?.owner?.email && (
            <ShareAlbum
              onClick={() => setIsOpenShare(!isOpenShare)}
              className='w-4 cursor-pointer'
            />
          )}

          {/* delete and details menu */}
          {!isPlaylistQueue && (
            <Popover placement='bottom-end' gutter={11} closeOnBlur={true}>
              {({ isOpen, onClose }) => (
                <>
                  <PopoverTrigger>
                    <Box>
                      <Dots
                        onMouseEnter={
                          setShouldStartFetching !== null
                            ? () => setShouldStartFetching(!shouldStartFetching)
                            : null
                        }
                        className='flex w-5 cursor-pointer'
                      />
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
                      {itemInbox?.info?.stym?.id && (
                        <Link href={`my-stym/${itemInbox?.info?.stym?.id}`}>
                          <a>
                            <Text
                              display={'flex'}
                              mt='10px'
                              gap={2}
                              cursor='pointer'
                              _hover={{ color: 'brand.500' }}
                              onClick={open}
                              color={
                                colorMode === 'dark' ? 'gray.100' : 'gray.600'
                              }
                            >
                              <Open className='w-4' /> Open
                            </Text>
                          </a>
                        </Link>
                      )}
                      {/* {share && (
                        <Button
                          padding='0.5rem 1.5rem'
                          name='activate'
                          variant='outline'
                          border='none'
                          size='sm'
                          fontWeight='normal'
                          onClick={async (e) => {
                            await handleActivateShare(e, share?.hash);
                            onClose();
                          }}
                          disabled={share?.active}
                          _disabled={{ cursor: 'default' }}
                        >
                          {share?.active ? (
                            <span className='text-my-orange'>Activated</span>
                          ) : (
                            'Activate'
                          )}
                        </Button>
                      )} */}

                      {(user.email === info?.owner?.email || !isInbox) && (
                        <Text
                          onClick={() => {
                            handleDelete(id, folderId);
                            onClose();
                          }}
                          display={'flex'}
                          gap={2}
                          _hover={{ color: 'brand.500' }}
                          cursor='pointer'
                        >
                          <Delete className='w-4' aria-hidden='true' />
                          Delete
                        </Text>
                      )}
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
                          color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}
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
          )}
        </div>
        <Modal isOpen={isOpenShare} setIsOpen={setIsOpenShare} title='Share'>
          <ShareMenu onSubmit={onSubmit} isSharing={isSharing} />
        </Modal>
      </Box>
    </>
  );
}
