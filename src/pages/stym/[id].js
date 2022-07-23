import { useS3Upload } from 'next-s3-upload';
import md5 from 'md5';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useGetDataForPublicLinkQuery } from '../../features/stymQuery';
import PlayAlbumOrange from '../../components/svg/playAlbumOrange.svg';
import DownloadAlbum from '../../components/svg/downloadAlbum.svg';
import { useDispatch, useSelector } from 'react-redux';
import StymTrash from '../../components/StymTrash';
import { toast } from 'react-toastify';
import { setCurrentTrack, setPlaylist } from '../../features/audio/audioSlice';
import Preloader from '../../components/Preloader';
import { Text, Box, useColorMode } from '@chakra-ui/react';

export default function AlbumInTrash() {
  const [folderList, setFolderList] = useState([]);
  const [dndId, setDndId] = useState();
  const [s3Loading, setS3Loading] = useState(true);
  const { colorMode } = useColorMode();
  const [s3FilesCounter, setS3FilesCounter] = useState({
    currentFileNum: 0,
    totalFilesNum: 0,
  });
  const { uploadToS3, files: s3Files } = useS3Upload();
  const router = useRouter();
  const dispatch = useDispatch();
  const currentPlaylist = useSelector((state) => state.audio.currentPlaylist);
  const selected = useSelector((state) => state.modal.selected);
  const { id } = router.query;

  const {
    data = {},
    refetch,
    isLoading,
    error: queryError,
    isFetching: isF,
  } = useGetDataForPublicLinkQuery(id, {
    skip: id ? false : true,
  });

  useEffect(() => {
    const foldersArr = data?.stym?.folders.map((item) => ({
      id: item.id,
      name: item.name,
      files: item.files,
      images: item.images,
      expanded: false,
    }));

    setFolderList(foldersArr);
  }, [data?.stym?.folders]);

  const { users } = data?.stym?.info?.shared || [];
  const { info } = data?.stym || [];
  const sid = data?.stym?.id || [];
  const email = data?.stym?.info?.owner?.email || null;
  const access = data?.stym?.access;
  const files = data?.stym?.playList;

  const handlePlay = () => {
    const filteredFiles = files.filter(
      (file) =>
        file.link.includes('mp3') ||
        file.link.includes('.wav') ||
        file.link.includes('.aac') ||
        file.link.includes('.mp4') ||
        file.link.includes('.ogg') ||
        file.link.includes('.flac') ||
        file.link.includes('.m4a')
    );
    if (files.length === 0 || filteredFiles?.length === 0) {
      return toast.error('No files in this stym', {
        position: 'bottom-center',
      });
    }

    dispatch(setPlaylist(filteredFiles || []));

    dispatch(
      setCurrentTrack({
        title: filteredFiles[0].name || null,
        fileId: filteredFiles[0]?.id || null,
        stymId: filteredFiles[0]?.stym || null,
        folderId: filteredFiles[0]?.folder || null,
        src: filteredFiles[0]?.link || null,
        image: filteredFiles[0]?.image || null,
        playMode: 'playlist',
      })
    );
  };

  const src = data?.stym?.image
    ? data?.stym?.image
    : data?.stym?.image === null && colorMode === 'light'
    ? '/stym-dark.png'
    : '/stym-light.png';

  const handelFilesLength = (id) => {
    setFolderList(
      folderList.map((folder) => {
        return folder?.id === id
          ? {
              ...folder,
              expanded: !folder.expanded,
            }
          : folder;
      })
    );
  };

  const handleStymDownload = async () => {
    setS3Loading(false);
    const stymId = md5(`${sid}`);
    if (sid) {
      try {
        const id = toast.loading('Generating a download link...', {
          position: 'bottom-center',
        });
        const res = await fetch(
          'https://bcxdoh9y7g.execute-api.us-east-1.amazonaws.com/s3-zip/AWS-create-zip',
          {
            method: 'POST',
            body: JSON.stringify({
              bucketKey: `${md5(email)}/${stymId}`,
              archiveName: sid ? sid.toString() : '',
            }),
          }
        );
        const data = await res.json();
        const { fileUrl } = data;
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
        console.log(error);
      }
    }
    setS3Loading(true);
  };

  return (
    <>
      <div className='mt-[20px] flex justify-center width-full items-center m-auto mb-[15px]'>
        <Link href='/sign-in'>
          <a className='flex items-center'>
            <img
              src={colorMode === 'light' ? '/logo.svg' : '/logo_dark.svg'}
              alt='logo'
              width={250}
              height={34}
            />
          </a>
        </Link>
      </div>
      <Layout>
        <div className='flex flex-col mb-12 space-y-6 md:space-y-0 md:justify-between md:flex-row'>
          <div className='flex flex-col gap-12 md:flex-row'>
            <div className='relative flex-none h-min'>
              {isLoading ? (
                <Preloader
                  height={'h-[250px]'}
                  padding={'p-[8rem]'}
                  rounded={'rounded-30'}
                />
              ) : (
                <img
                  width={240}
                  height={240}
                  src={src}
                  className='object-cover h-60 w-60 rounded-30'
                  alt='album cover'
                />
              )}
            </div>

            <div
              className={`${
                true ? 'p-0' : 'py-2'
              } flex flex-col gap-7 justify-between sm`}
            >
              <div>
                {/* <h1 className='mb-4 font-bold md:text-5xl xl:text-8xl'> */}
                {isLoading ? (
                  <Preloader
                    height={'h-[4rem]'}
                    padding={'p-[1rem]'}
                    width={'w-[15rem]'}
                  />
                ) : (
                  <Text
                    fontFamily={'inherit'}
                    fontSize={'3rem'}
                    sx={{ '@media (max-width: 640px)': { fontSize: '2.5rem' } }}
                  >
                    {data?.stym?.name}
                  </Text>
                )}

                <p className='text-2xl font-medium md:text-4xl '>
                  {data?.stym?.singer}
                </p>
              </div>

              <div className='flex gap-8 font-medium'>
                {isLoading ? (
                  <Preloader
                    height={'h-[2rem]'}
                    padding={'p-[2rem]'}
                    width={'w-[30rem]'}
                  />
                ) : (
                  <>
                    <span>Number of files: {info?.countFiles}</span>
                    <span>
                      Size: {info?.size.includes('NAN') ? '0' : info?.size}
                    </span>
                    <span>Uploaded date: {info?.updateDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* <div className='flex flex-col justify-between gap-5'> */}
          {isLoading ? (
            <Preloader
              height={'h-[2rem]'}
              padding={'p-[2rem]'}
              width={'w-[17rem]'}
            />
          ) : (
            // stym Play Download Share Del
            <div className='flex'>
              <div
                // if access is viewer, hide share and delete
                className='grid grid-cols-2 gap-x-5'
              >
                <div
                  onClick={handlePlay}
                  className='flex items-center gap-4 text-center cursor-default md:flex-col'
                >
                  <PlayAlbumOrange className='w-6 cursor-pointer md:w-16 text-my-orange' />
                  <span>Play</span>
                </div>
              </div>
              <a className='cursor-pointer'>
                <button
                  disabled={!s3Loading}
                  className='flex items-center gap-4 text-center md:flex-col'
                  onClick={() => handleStymDownload()}
                >
                  <DownloadAlbum className='w-6 cursor-pointer md:w-16 text-my-orange' />
                  Download
                </button>
              </a>
            </div>
          )}
        </div>

        {folderList?.map((folder) => (
          <div key={folder.id} className='mb-12'>
            <div className='flex justify-between w-full mb-6' key={folder.id}>
              <span className='flex items-baseline gap-4 text-2xl font-medium'>
                {folder?.id !== 0 && folder?.files?.length !== 0
                  ? folder.name
                  : null}
                {(folder.id === dndId || folder.id === 0) && (
                  <div className='text-base text-gray-500'>
                    {s3FilesCounter.currentFileNum > 0 && (
                      <div>file {s3FilesCounter.currentFileNum}</div>
                    )}
                  </div>
                )}
              </span>

              {folder?.files?.length > 2 && (
                <span
                  className='cursor-pointer hover:text-my-orange'
                  onClick={() => handelFilesLength(folder?.id)}
                >
                  {folder?.expanded ? 'See less' : 'See all'}
                </span>
              )}
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              {!folder?.expanded
                ? folder?.files?.slice(0, 2).map((track) => {
                    return (
                      <StymTrash
                        info={track.info}
                        createdDate={track.createDate}
                        key={track.id}
                        id={track.id}
                        folderId={folder.id}
                        src={track.link}
                        image={data?.stym?.image}
                        name={track.name}
                      />
                    );
                  })
                : folder?.files.map((track) => {
                    return (
                      <StymTrash
                        info={track.info}
                        createdDate={track.createDate}
                        key={track.id}
                        id={track.id}
                        folderId={folder.id}
                        src={track.link}
                        image={data?.stym?.image}
                        name={track.name}
                      />
                    );
                  })}

              {s3Files.length !== 0 && folder.id === dndId
                ? s3Files.map((file, index) => (
                    <div
                      key={index}
                      className={`${
                        file.progress < 50 ? 'text-black' : 'text-white'
                      } ${
                        file.size === file.uploaded ? 'hidden' : ''
                      } w-full relative h-14 shadow-md  bg-[#EAEEF2] rounded-md dark:bg-my-light-gray`}
                    >
                      <div
                        className='grid rounded-md h-14 place-items-center bg-my-light-green'
                        style={{
                          width: `${file?.progress}%`,
                        }}
                      >
                        <div className='absolute left-0 right-0 flex justify-center w-full'>
                          {file.progress.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </div>
        ))}
      </Layout>
    </>
  );
}
