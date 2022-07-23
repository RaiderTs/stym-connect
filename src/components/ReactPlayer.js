import React, { useEffect, useRef, useState } from 'react';
import Pause from '../components/svg/pause.svg';
import Rewind from '../components/svg/rewind.svg';
import FastForward from '../components/svg/fastforward.svg';
import Loop from '../components/svg/loop.svg';
import QueueIcon from '../components/svg/playlist-queue.svg';
import PlayAlbumOrange from './svg/playAlbumOrange.svg';
import Close from './svg/close.svg';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import {
  pausePlayback,
  setCurrentTrack,
  setPlaylist,
  startPlayback,
} from '../features/audio/audioSlice';
import PlaylistQueue from './PlaylistQueue';
import { useColorMode, useDisclosure, Tooltip } from '@chakra-ui/react';

export default function ReactPlayer() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const currentTrack = useSelector((state) => state.audio.currentTrack);
  const currentPlaylist = useSelector((state) => state.audio.currentPlaylist);
  const playMode = useSelector((state) => state.audio.playMode); // set src to playlist or single track

  // const srcPrefix =
  //   'https://stymconnectappbucket130953-dev.s3.amazonaws.com/public/';

  const isPlaying = useSelector((state) => state.audio.currentTrack.isPlaying);

  const hide =
    router.pathname.includes('/sign-in') ||
    router.pathname.includes('/sign-up') ||
    router.pathname.includes('/404') ||
    router.pathname.includes('/onboard-link') ||
    currentTrack.src === '';

  const audioPlayer = useRef();

  const handleClickPrevious = () => {
    setCurrentTrackIndex(() => {
      return currentTrackIndex === 0
        ? currentPlaylist?.length - 1
        : currentTrackIndex - 1;
    });
    dispatch(
      setCurrentTrack({
        title: currentPlaylist[currentTrackIndex]?.name,
        fileId: currentPlaylist[currentTrackIndex]?.id,
        stymId: currentPlaylist[currentTrackIndex]?.stym,
        folderId: currentPlaylist[currentTrackIndex]?.folder,
        image: currentPlaylist[currentTrackIndex]?.image,
        src: currentPlaylist[currentTrackIndex]?.link,
        playMode: 'playlist',
      })
    );
  };

  const handleClickNext = () => {
    setCurrentTrackIndex(() => {
      return currentTrackIndex < currentPlaylist.length - 1
        ? currentTrackIndex + 1
        : 0;
    });
    if (currentPlaylist.length > 0) {
      dispatch(
        setCurrentTrack({
          title: currentPlaylist[currentTrackIndex]?.name,
          fileId: currentPlaylist[currentTrackIndex]?.id,
          stymId: currentPlaylist[currentTrackIndex]?.stym,
          folderId: currentPlaylist[currentTrackIndex]?.folder,
          image: currentPlaylist[currentTrackIndex]?.image,
          src: currentPlaylist[currentTrackIndex]?.link,
          playMode: 'playlist',
        })
      );
    }
  };

  useEffect(() => {
    if (isPlaying) {
      audioPlayer?.current?.audio?.current.play();
    } else {
      audioPlayer?.current?.audio?.current.pause();
    }
  }, [isPlaying]);

  const photo = (
    <div className='flex items-center justify-between gap-4 h-12 basis-[70%]'>
      <div className='flex items-center gap-4'>
        <Image
          className='hidden rounded-md md:block md:w-10 md:ml-5'
          src={
            currentPlaylist[currentTrackIndex]?.image
              ? currentPlaylist[currentTrackIndex].image
              : currentTrack?.image
              ? currentTrack.image
              : '/stym-dark.png'
          }
          alt='stym-cover'
          width={40}
          height={40}
        />
        <div>
          <Tooltip
            label={currentTrack?.title?.split('-')[1]}
            variant='my-tooltip'
            borderRadius='10px'
            // left='70px'
            placement='top'
            padding='5px 15px'
            backgroundColor={colorMode === 'dark' && '#0F2042'}
          >
            <p
              className={`text-xs max-w-[450px] truncate${
                colorMode === 'dark' ? 'text-white' : ''
              }  md:text-lg`}
            >
              {currentTrack?.title?.split('-')[1]}
            </p>
          </Tooltip>
          <Tooltip
            label={currentTrack?.title?.split('-')[0]}
            variant='my-tooltip'
            borderRadius='10px'
            // left='70px'
            placement='top'
            padding='5px 15px'
            backgroundColor={colorMode === 'dark' && '#0F2042'}
          >
            <p
              className={`text-xs ${
                colorMode === 'dark' ? 'text-white' : ''
              }  md:text-sm`}
            >
              {currentTrack?.title?.split('-')[0]}
            </p>
          </Tooltip>
          {/* <p>currentMusicIndex: {currentTrackIndex?.toString()}</p> */}
        </div>
      </div>
      <QueueIcon
        className={`${
          colorMode === 'light' ? 'text-my-black' : 'text-white'
        } w-6 cursor-pointer`}
        onClick={onToggle}
      />
    </div>
  );

  return (
    <div
      className={`${
        hide ? 'hidden' : ''
      } fixed bottom-0 z-[200] left-0 flex items-center w-full border-my-light-gray`}
    >
      <AudioPlayer
        onPlaying={() => dispatch(startPlayback())}
        onPause={() => dispatch(pausePlayback())}
        onPlayError={(error) => console.log(error)}
        autoPlayAfterSrcChange={true}
        ref={audioPlayer}
        src={currentTrack.src}
        onClickPrevious={handleClickPrevious}
        onClickNext={handleClickNext}
        style={{
          backgroundColor: `${colorMode === 'light' ? '#fff' : '#0F2042'}`,
        }}
        // showSkipControls={playMode === 'single' ? false : true}
        onEnded={playMode === 'playlist' && (() => handleClickNext())}
        customIcons={{
          play: (
            <PlayAlbumOrange
              className={`w-7  ${
                colorMode === 'dark' ? 'text-white' : 'text-my-black'
              } `}
            />
          ),
          pause: (
            <Pause
              className={`w-7  ${
                colorMode === 'dark' ? 'text-white' : 'text-my-black'
              } `}
            />
          ),
          rewind: (
            <Rewind
              className={`w-7 ${
                colorMode === 'dark' ? 'text-white' : 'text-my-black'
              } `}
            />
          ),
          forward: (
            <FastForward
              className={`w-7 ${
                colorMode === 'dark' ? 'text-white' : 'text-my-black'
              } `}
            />
          ),
          loop: (
            <Loop
              className={`w-6 ${
                colorMode === 'dark' ? 'text-white' : 'text-my-black'
              } `}
            />
          ),
        }}
        customControlsSection={[
          <Close
            key={'close'}
            onClick={() => {
              dispatch(setCurrentTrack({ src: '' }));
              dispatch(setPlaylist([]));
              onClose();
            }}
            className={`w-8 cursor-pointer -ml-7 ${
              colorMode === 'dark' ? 'text-white' : ''
            }`}
          />,
          RHAP_UI.ADDITIONAL_CONTROLS,
          photo,
          <PlaylistQueue
            key={currentTrack.fileId}
            image={currentTrack.image}
            name={currentTrack.title}
            src={currentTrack.src}
            fileId={currentTrack.id}
            stymId={currentTrack.stym}
            folderId={currentTrack.folder}
            isOpen={isOpen}
            close={onToggle}
            playlist={
              currentPlaylist.length !== 0 ? currentPlaylist : currentTrack
            }
          />,

          RHAP_UI.MAIN_CONTROLS,
          RHAP_UI.VOLUME_CONTROLS,
        ]}
        volume={0.5}
      />
    </div>
  );
}
