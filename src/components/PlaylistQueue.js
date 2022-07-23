import { useState } from 'react';
import {
  Box,
  IconButton,
  Heading,
  useColorMode,
  useDisclosure,
  Modal,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import StymTrack from './Mystym/StymTrack';
import Close from './svg/close.svg';

export default function PlaylistQueue({ image, isOpen, close }) {
  const [s3Loading, setS3Loading] = useState(true);
  const { colorMode } = useColorMode();
  const cover = '/stym-dark.png';
  const playlist = useSelector((state) => state.audio.currentPlaylist);
  const currentTrack = useSelector((state) => state.audio.currentTrack);
  let imgSrc = image ? image : cover;

  const router = useRouter();

  const isPublic = router.pathname.includes('/stym');

  const singleOrPlaylist =
    playlist.length > 0 ? playlist : currentTrack !== null ? currentTrack : [];

  return (
    <Modal unmountOnExit={true} isOpen={isOpen} onClose={close}>
      <Box
        h='60vh'
        minW='80vw'
        borderWidth='1px'
        borderColor='gray.500'
        borderRadius='10px'
        top={0}
        right={0}
        transform='translate(-10%, 35%)'
        className={`${
          colorMode === 'dark' ? 'bg-my-black' : 'bg-white'
        } overflow-y-scroll fixed p-8`}
      >
        <div className='flex justify-between'>
          <Heading mb='3rem' fontSize='3rem' fontWeight='medium'>
            Queue
          </Heading>
          <IconButton icon={<Close />} onClick={close} />
        </div>

        <div className='space-y-4'>
          {playlist.length > 0 ? (
            playlist?.map((track) => (
              <StymTrack
                link={track.link}
                key={track.id}
                image={imgSrc}
                name={track.name}
                src={track.link}
                id={track.id}
                // folderId={track.folder}
                isPlaylistQueue
                isPublic={isPublic}
                setS3Loading={setS3Loading}
                s3Loading={s3Loading}
              />
            ))
          ) : (
            <StymTrack
              link={currentTrack.src}
              key={currentTrack.fileId}
              image={currentTrack.image}
              name={currentTrack.title}
              src={currentTrack.src}
              id={currentTrack.fileId}
              folderId={currentTrack.folderId}
              isPlaylistQueue
              isPublic={isPublic}
              setS3Loading={setS3Loading}
              s3Loading={s3Loading}
            />
          )}
        </div>
      </Box>
    </Modal>
  );
}
