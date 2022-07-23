import Play from '../../components/svg/play-filled.svg';
import Pause from '../../components/svg/pause-filled.svg';
import Share from '../../components/svg/shareAlbum.svg';
import Dots from '../../components/svg/dots.svg';
import Open from '../../components/svg/open.svg';
import Download from '../../components/svg/downloadAlbum.svg';
import Delete from '../../components/svg/delete.svg';
import Arrow from '../../components/svg/arrow-left.svg';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  pausePlayback,
  setCurrentTrack,
  setPlaylist,
  startPlayback,
} from '../../features/audio/audioSlice';
import {
  useAddToMyStymPageMutation,
  useCreateStymShareMutation,
  useDeleteStymMutation,
  useEditStymShareMutation,
  useGetFilesInStymByIdQuery,
  useRemoveFromMyStymPageMutation,
  useAddActivityLogMutation,
} from '../../features/stymQuery';
import { useState } from 'react';
import Modal from '../Modal';
import ShareMenu from '../Shared/ShareMenu';
import { toast } from 'react-toastify';
import { userSelector } from '../../selectors/auth';
import NProgress from 'nprogress';
import LoadingSpinner from '../LoadingSpinner';
import {
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Box,
  Tooltip,
} from '@chakra-ui/react';
import md5 from 'md5';
import ConfirmationDialog from '../ConfirmationDialog';
import StymDetails from '../StymDetails';
import { stubFalse } from 'lodash';

export default function StymAlbum({
  stym,
  playlist,
  isLoading,
  isHome = false,
  s3Loading,
  setS3Loading,
  shared = false,
}) {
  const [stymS3Url, setStymS3Url] = useState();
  // const [s3Loading, setS3Loading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isStymDetailsOpen, setIsStymDetailsOpen] = useState(false);
  const [isError, setIsError] = useState();
  const { colorMode } = useColorMode();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const token = user.token;
  const isPlaying = useSelector((state) => state.audio.currentTrack.isPlaying);
  const currentTrack = useSelector((state) => state.audio.currentTrack);
  const currentPlaylist = useSelector((state) => state.audio.currentPlaylist);
  const selected = useSelector((state) => state.modal.selected);
  const currentStymId = useSelector((state) => state.audio.currentTrack.stymId);

  const [deleteStym, { isLoading: isDeleting }] = useDeleteStymMutation();
  const [createShare, { isLoading: isSharing }] = useCreateStymShareMutation();
  const [deleteShare, { isLoading: isDeletingShare }] =
    useEditStymShareMutation();
  const [addToMyStymPage, { isLoading: isAddingToMyStymPage }] =
    useAddToMyStymPageMutation();
  const [removeFromMyStymPage, { isLoading: isRemovingFromMyStymPage }] =
    useRemoveFromMyStymPageMutation();

  const [addActivityLog, { isLoading: isActivityLoading }] =
    useAddActivityLogMutation();

  if (isDeleting) NProgress.start();
  // console.log(stym);
  const handleDeleteStym = async () => {
    // console.log(stym.access);
    if (stym.access === 'viewer' || stym.access === 'editor') {
      const formData = new FormData();
      formData.append('stym', stym.id);
      formData.append('access', 'removed');
      const res = await deleteShare(formData);
      console.log(res, 'del share res');
    }

    if (stym.access === 'owner') {
      const res = await deleteStym(stym.id);
      if (res.data?.message === ' stym removed') {
        toast.success('Stym deleted', {
          position: 'bottom-center',
          autoClose: 1000,
        });
      } else if (res.data?.message === 'no edit access') {
        toast.error("You can't delete this stym", {
          position: 'bottom-center',
        });
      }
    }
  };

  const handleDownload = async () => {
    setS3Loading(false);
    const stymId = md5(`${stym.id}`);
    const id = toast.loading('Generating a download link...', {
      position: 'bottom-center',
    });
    NProgress.start();
    fetch(
      'https://bcxdoh9y7g.execute-api.us-east-1.amazonaws.com/s3-zip/AWS-create-zip',
      {
        method: 'POST',
        body: JSON.stringify({
          bucketKey: `${md5(
            shared ? stym?.info?.owner?.email : user.email
          )}/${stymId}`,
          archiveName: stym?.name?.toString(),
        }),
      }
    );

    const sleep = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    const request_retry = async (n) => {
      try {
        const res = await fetch(
          'https://bcxdoh9y7g.execute-api.us-east-1.amazonaws.com/s3-zip/AWS_check_archive',
          {
            method: 'POST',
            body: JSON.stringify({
              email: `${md5(shared ? stym?.info?.owner?.email : user.email)}`,
              archiveName: stym?.name?.toString(),
            }),
          }
        );
        const data = await res.json();

        await sleep(15000);
        if (n === 1) {
          toast.update(id, {
            render: 'Something went wrong. Try download later ',
            type: 'error',
            isLoading: false,
            autoClose: 3000,
            position: 'bottom-center',
          });
          setS3Loading(true);
          return;
        } else if (!data.fileUrl) return await request_retry(n - 1);
        else if (data.fileUrl) {
          toast.update(id, {
            render: 'Downloading...',
            type: 'success',
            isLoading: false,
            autoClose: 500,
            position: 'bottom-center',
          });
          NProgress.done();
          setS3Loading(true);
          return router.push(`${data?.fileUrl}`);
        }
      } catch (e) {
        toast.update(id, {
          render: 'Something went wrong!',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
          position: 'bottom-center',
        });
        setS3Loading(true);
        console.log(e);
      }
    };
    request_retry(60);
  };

  const toggleShowOnMyStymPage = async () => {
    if (isHome.status === false) {
      const res = await addToMyStymPage(isHome.shareId);
      console.log(res, 'res');
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
    const folders = stym?.folders.map((folder) => folder.files);
    const files = folders.map((file) => file.map((f) => f)).flat();
    const playlistSource = files.filter(
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
    if (currentTrack.stymId === stym.id) {
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
        image: stym?.image || playlistSource[0]?.image || null,
        stymId: stym?.id || null,
        playMode: 'playlist',
      })
    );

    // console.log(playlist.folders, 'playlist from stym album');
    // console.log(files, 'files from stym album');
    // console.log(currentTrack.src, 'track src');
  };

  const handlePause = () => {
    // dispatch(setPlaylist(files || []));
    if (isPlaying && currentStymId === stym.id) {
      dispatch(pausePlayback());
    } else dispatch(startPlayback());
  };

  // * share file
  const onSubmit = async (values) => {
    if (values.email !== 0) {
      for (let i = 0; i < values.email.length; i++) {
        const email = values.email[i];
        const formData = new FormData();
        formData.append('stym', stym.id);
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
        !isError && setIsOpen(false);
      }
    }
    // group
    if (values.group !== 0) {
      for (let i = 0; i < values.group.length; i++) {
        const group = values.group[i];
        // console.log(group);
        const formData = new FormData();
        formData.append('stym', stym.id);
        formData.append('access', selected.value); // * value from redux state
        formData.append('contactGroupId', group);
        formData.append('message', values.message);

        try {
          const res = await createShare(formData);
          if (res?.data.status) {
            toast.success('Stym shared with group contacts', {
              position: 'bottom-center',
            });
            setIsError(false);
          } else if (res?.data.message === 'contacts_not_found') {
            toast.error(`Group ${res?.data?.group?.name} is empty`, {
              position: 'bottom-center',
            });
            // setIsError(false);
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

  const handleOpen = () => {
    router.push(`/my-stym/${stym.id}`);
  };

  const chevron = (
    <Dots className='text-white rotate-90 w-7' aria-hidden='true' />
  );

  const imgSrc = stym?.image
    ? stym.image
    : stym?.image === null && colorMode === 'light'
    ? '/stym-dark.png'
    : '/stym-light.png';
  // const menuBtn = <Dots className='-ml-2 text-white cursor-pointer w-7' />;
  return (
    <div className='inline-flex flex-col gap-2 '>
      <div
        style={{ backgroundImage: `url(${imgSrc})` }}
        className='flex transition justify-center items-center relative w-full min-w-[240px] h-60 hover:bg-slate-600 bg-blend-multiply rounded-30 bg-cover bg-center'
      >
        <div
          className={`flex items-center justify-center w-full h-full gap-7 mt-1 opacity-0 hover:opacity-100`}
        >
          {user.email === stym.info.owner.email && (
            <Share
              onClick={() => setIsOpen(!isOpen)}
              className='w-6 text-white cursor-pointer'
            />
          )}
          {isPlaying && currentTrack.src && currentStymId === stym.id ? (
            <Pause
              onClick={handlePause}
              className='w-4 cursor-pointer text-my-orange'
            />
          ) : isLoading ? (
            <LoadingSpinner />
          ) : (
            <Play
              className='cursor-pointer w-7 text-my-orange'
              onClick={handlePlay}
            />
          )}
          <Menu>
            <MenuButton
              _hover={{ bg: 'transparent' }}
              _active={{ bg: 'transparent' }}
              _focus={{ outline: 'none' }}
              backgroundColor={'transparent'}
              // onClick={handleDownload}
            >
              {chevron}
            </MenuButton>
            <MenuList minWidth={'4rem'}>
              <MenuItem
                _hover={{ color: 'brand.200', bg: 'transparent' }}
                icon={<Open className='w-4 mr-2' aria-hidden='true' />}
                onClick={handleOpen}
              >
                Open
              </MenuItem>
              <MenuItem
                onClick={handleDownload}
                _hover={{ color: 'brand.200', bg: 'transparent' }}
                icon={<Download className='w-4 mr-2' aria-hidden='true' />}
                isDisabled={!s3Loading}
              >
                Download
              </MenuItem>
              <MenuItem
                _hover={{ color: 'brand.200', bg: 'transparent' }}
                icon={<Delete className='w-4 mr-2' aria-hidden='true' />}
                onClick={() => setIsOpenDelete(!isOpenDelete)}
              >
                Delete
              </MenuItem>
              {isHome && (
                <MenuItem
                  _hover={{ color: 'brand.200', bg: 'transparent' }}
                  icon={
                    !isHome.status ? (
                      <Arrow className='w-4 mr-2' aria-hidden='true' />
                    ) : (
                      <Arrow
                        className='w-4 mr-2 rotate-180'
                        aria-hidden='true'
                      />
                    )
                  }
                  onClick={toggleShowOnMyStymPage}
                >
                  {!isHome.status ? 'To My Stym' : 'From My Stym'}
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </div>
      </div>
      <Link href={`my-stym/${stym?.id}`}>
        <a>
          <span className='block'>
            <Tooltip
              label={stym?.name}
              variant='my-tooltip'
              borderRadius='10px'
              // left='70px'
              placement='top-start'
              padding='5px 15px'
              backgroundColor={colorMode === 'dark' && '#0F2042'}
            >
              <p className='text-2xl max-w-[15ch] font-medium  truncate'>
                {stym?.name}
              </p>
            </Tooltip>
            <Tooltip
              label={stym?.singer}
              borderRadius='10px'
              // left='70px'
              placement='bottom-start'
              padding='5px 15px'
              backgroundColor={colorMode === 'dark' ? '#0F2042' : 'white'}
              color='#FF6A2A'
              borderColor='#FF6A2A'
              border='1px'
            >
              <p className='max-w-[15ch] font-normal  truncate'>
                {stym?.singer}
              </p>
            </Tooltip>
          </span>
        </a>
      </Link>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen} title='Share'>
        <ShareMenu
          onSubmit={onSubmit}
          isSharing={isSharing}
          stymId={stym.id}
          access={stym.access}
        />
      </Modal>
      <Modal isOpen={isOpenDelete} setIsOpen={setIsOpenDelete} title='Confirm'>
        <ConfirmationDialog
          cancel={() => setIsOpenDelete(false)}
          handleDelete={handleDeleteStym}
          loading={isDeleting || isDeletingShare}
        />
      </Modal>
    </div>
  );
}
