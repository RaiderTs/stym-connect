import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Create from '../svg/create.svg';
import Info from '../svg/info.svg';
import Chevron from '../svg/navigateBack.svg';
import { UploadIcon } from '@heroicons/react/solid';
import {
  useCreateFileMutation,
  useCreateStymMutation,
  useGetAllStymsQuery,
  useCreateFolderMutation,
} from '../../features/stymQuery';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../../selectors/auth';
import StymAlbum from './StymAlbum';
import { googleSignout, logout } from '../../features/auth/authSlice';
import ChakraMenu from '../ChakraMenu';
import FilterMenu from '../Filter';
import CreateStymModal from '../CreateStymModal';
import Preloader from '../../components/Preloader';
import { useDropzone } from 'react-dropzone';
import { useS3Upload } from 'next-s3-upload';
import { toast } from 'react-toastify';
import StymTrack from './StymTrack';
import NProgress from 'nprogress';
import { useRouter } from 'next/router';
import { Text, useColorMode, Box } from '@chakra-ui/react';
import { CreateStymWithFilesInMainFolders } from '../CreateStymWithFilesInMainFolders';
import { increment, reset, setTotal } from '../../features/fileCounterSlice';
import { toaster } from '../Toast';
import Modal from '../Modal';
import { FormikContainer } from '../CreateFolderForm';

export default function StymIndex() {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleS3Upload(acceptedFiles),
  });
  const { colorMode } = useColorMode();
  const [queryOptions, setQueryOptions] = useState();
  const [s3Loading, setS3Loading] = useState(true);

  const s3FilesCounter = useSelector((state) => state.fileCounter);
  const [isOpenCreateFolder, setIsOpenCreateFolder] = useState(false);

  const [dndId, setDndId] = useState();
  const [createFile, { isLoading: isFileCreating }] = useCreateFileMutation();
  const [createStym, { isLoading: isStymCreating }] = useCreateStymMutation();
  const [createFolder, { isLoading: isFolderCreating }] =
    useCreateFolderMutation();
  const { uploadToS3, files: s3Files } = useS3Upload();
  const [isOpen, setIsOpen] = useState(false);
  const [isMainFoldersUpload, setIsMainFoldersUpload] = useState(false);
  const [stymForFolder, setStymForFolder] = useState();
  const [defaultFolderFiles, setDefaultFolderFiles] = useState([]);
  const [showDropzone, setShowDropzone] = useState(false);
  const [sort, setSort] = useState('default');
  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const router = useRouter();

  const {
    data = [],
    error,
    refetch,
    isLoading,
    isError,
    isSuccess,
    isFetching,
  } = useGetAllStymsQuery(queryOptions, {
    // skip: !queryOptions,
  });
  const { styms = [], shares = [] } = data;

  // console.log(queryOptions, 'queryOptions');

  // * refetch on user change
  useEffect(() => {
    refetch();
  }, [user]);

  if (!isFetching) NProgress.done();
  if (isFileCreating || isFetching) NProgress.start();

  const handleCreateStymWithFolderName = async (e) => {
    const files = e?.target?.files;
    const folderName = files[0]?.webkitRelativePath.split('/')[0];
    await setDefaultFolderFiles(files);
    const formData = new FormData();
    formData.append('name', folderName);
    const stym = await createStym(formData);

    if (stym.data.message === 'stym_exists') {
      toaster({
        type: 'error',
        message: 'Stym with this name already exists',
      });
      e.target.value = null;
      // return;
    }

    // if (stym.data.message === 'Complete') {
    //   toaster({
    //     type: 'success',
    //     message: 'Stym create',
    //   });
    // }

    if (stym?.data?.status !== false) {
      await setStymForFolder(stym);
      // console.log(stymForFolder, 'stymForFolder');
      await setIsMainFoldersUpload(true);
    }
    // console.log(stym);
  };

  const handleS3Upload = (acceptedFiles) => {
    dispatch(setTotal(acceptedFiles.length));

    console.log(acceptedFiles, 'acceptedFiles');
    acceptedFiles.forEach(async (file) => {
      setShowDropzone(false);

      const { name, size } = file;

      const newName = file?.name?.replace(/[^A-Za-z0-9.]/g, '_');

      function renameFile(file, newName) {
        return new File([file], newName, {
          type: file.type,
          lastModified: file.lastModified,
        });
      }

      const { url } = await uploadToS3(renameFile(file, newName), {
        endpoint: {
          request: {
            body: {
              email: user.email,
              stymId: '',
            },
          },
        },
      });

      const formData = new FormData();
      formData.append('name', name);
      formData.append('size', size);
      formData.append('link', url);

      try {
        const response = await createFile({
          body: formData,
          stymId: 0,
          folderId: 0,
        });

        const { data } = response;
        if (data.message === 'Complete') {
          toast.success('File added!', {
            position: 'bottom-center',
            autoClose: 500,
          });
          // NProgress.done();
        } else if (data.message === 'file_exists_by_name') {
          NProgress.done();
          toast.error("You've already added a file with this name", {
            position: 'bottom-center',
          });
        }
      } catch (error) {
        console.log(error, 'something went wrong');
      }
      dispatch(increment());
    });
    if (s3FilesCounter.currentFileNum === s3FilesCounter.totalFilesNum) {
      dispatch(reset());
    }
  };

  // console.log(s3FilesCounter, 's3FilesCounter');
  const handleFolderUpload = async (e) => {
    const folder = e.target.files;

    setDndId(0);
    dispatch(setTotal(folder.length));
    for (let index = 0; index < folder.length; index++) {
      const file = folder[index];

      const newName = file?.name?.replace(/[^A-Za-z0-9.]/g, '_');

      function renameFile(file, newName) {
        return new File([file], newName, {
          type: file.type,
          lastModified: file.lastModified,
        });
      }

      const { url } = await uploadToS3(renameFile(file, newName), {
        endpoint: {
          request: {
            body: {
              email: user.email,
              stymId: '',
            },
          },
        },
      });

      const formData = new FormData();
      formData.append('name', file.name);
      formData.append('size', file.size);
      formData.append('link', url);

      try {
        const response = await createFile({
          body: formData,
          stymId: 0,
          folderId: 0,
        });

        const { data } = response;
        localStorage.setItem('folderId', '0');
        if (data.message === 'Complete') {
          toast.success('File added!', {
            position: 'bottom-center',
            autoClose: 500,
          });
        } else if (data.message === 'file_exists_by_name') {
          toast.error("You've already added a file with this name", {
            position: 'bottom-center',
          });
        }
      } catch (error) {
        console.log(error, 'something went wrong');
      }

      dispatch(increment());
    }
    if (s3FilesCounter.currentFileNum === s3FilesCounter.totalFilesNum) {
      dispatch(reset());
    }
    localStorage.removeItem('folderId');
  };

  const sortedStyms = useMemo(() => {
    const sharesPlusStyms = [...shares, ...styms];
    const sortedStyms = sharesPlusStyms.slice();

    switch (sort) {
      case 'alpha':
        return sortedStyms.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent':
        return sortedStyms.sort((a, b) => {
          return new Date(b.createdDate) - new Date(a.createdDate);
        });
      case 'folder':
        return sortedStyms.sort((a, b) =>
          a.singer !== null && b.singer !== null
            ? a.singer.localeCompare(b.singer)
            : 'Z'
        );
      default:
        return sharesPlusStyms;
    }
  }, [styms, shares, sort]);

  if (error?.status === 401) {
    if (user?.providerId) {
      dispatch(googleSignout());
    }
    dispatch(logout());
    router.replace('/sign-in');
  }

  if (isError)
    return (
      <div className='flex items-center gap-4 p-4 border rounded-lg text-my-red w-max border-my-red'>
        <Info className='w-6 text-my-red' /> Something went wrong!
      </div>
    );

  const handleSortRecent = () => {
    setSort('recent');
  };
  const handleSortAlpha = () => {
    setSort('alpha');
  };
  const handleSortByFolder = () => {
    setSort('folder');
  };
  const handleSortByYear = () => {
    console.log('year');
  };

  const options = [
    {
      id: 0,
      title: 'Recently added',
      key: 'recent',
      handleClick: () => handleSortRecent,
    },
    {
      id: 1,
      title: 'A-Z',
      key: 'alpha',
      handleClick: () => handleSortAlpha,
    },
    {
      id: 2,
      title: 'Folder',
      key: 'folder',
      handleClick: () => handleSortByFolder,
    },
    {
      id: 3,
      title: 'Year',
      key: 'year',
      handleClick: () => handleSortByYear,
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

  const preloaderArr = Array.from(Array(6).keys());
  const preloaderMarkup = preloaderArr.map((value, i) => (
    <div key={i}>
      <Preloader
        height={'h-[240px]'}
        width={'w-[240px]'}
        rounded={'rounded-30'}
      />
      <div className='mt-3'>
        <Preloader height={'h-[5px]'} width={'w-[100px]'} />
      </div>
      <div className='mt-3'>
        <Preloader height={'h-[5px]'} width={'w-[150px]'} />
      </div>
    </div>
  ));

  // * create folder
  const handleCreateFolder = async (values) => {
    const formData = new FormData();
    formData.append('name', values.folderName);

    try {
      const res = await createFolder({ body: formData, stymId: 0 });

      if (res.data.message === 'Complete') {
        toast.success('Category created!', {
          position: 'bottom-center',
          autoClose: 500,
        });

        if (res.data.message === 'folder_exists') {
          toast.error('Folder by this name already exists', {
            position: 'bottom-center',
          });
        }
        return res;
      }
    } catch (error) {
      toast.error('Something went wrong!', {
        position: 'bottom-center',
        autoClose: 1000,
      });
      console.log(error);
    }
  };

  return (
    <div className='relative min-h-[200vh] overflow-x-hidden'>
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <h1 className='mb-8 text-3xl font-medium md:mb-12 md:text-5xl'>
          My Stym
        </h1>
        {user?.tariff !== null && !isLoading && (
          <label
            htmlFor='dndFolder'
            className='order-2 px-4 py-2 mb-8 border cursor-pointer md:mb-12 border-my-orange text-my-orange self-baseline rounded-30 hover:text-white hover:bg-my-orange'
          >
            <p onClick={() => setShowDropzone(!showDropzone)}>+New</p>
          </label>
        )}
      </Box>

      {/* Filters */}

      {user?.tariff === null && sortedStyms.length === 0 && (
        <div>
          <div className='mb-8 text-2xl font-medium md:mb-12 '>
            Get a subscription to be able to create styms
          </div>
        </div>
      )}
      {user?.tariff && (
        <div className='flex justify-end pb-5'>
          <div className='flex justify-between w-40'>
            <FilterMenu
              name='Filter'
              setQueryOptions={setQueryOptions}
              queryOptions={queryOptions}
            />

            <ChakraMenu name='Sort' menuBtn={chevron} options={options} />
          </div>
        </div>
      )}

      {/* Styms  */}

      <div className='flex flex-col flex-wrap items-center mb-20 md:items-start md:flex-row md:gap-6'>
        {isLoading && user?.tariff
          ? preloaderMarkup
          : sortedStyms.map((s) => (
              <StymAlbum
                key={s.id}
                stym={s}
                isLoading={isLoading}
                setS3Loading={setS3Loading}
                s3Loading={s3Loading}
                shared
              />
            ))}

        {/* Create btn */}

        {(!isLoading || !isFetching) && (
          <>
            {user?.tariff && (
              <div
                onClick={() => setShowDropzone(!showDropzone)}
                className='grid border cursor-pointer border-my-light-purple rounded-30 w-60 h-60 place-items-center '
              >
                <Create className='w-12' />
              </div>
            )}
          </>
        )}
      </div>
      {/* {console.log(s3FilesCounter.currentFileNum, 'currentFileNum')} */}
      {/* Dropzone files */}
      {/* <span className='flex items-baseline gap-4 text-2xl font-medium'>
        <div className='text-base text-gray-500'>
          {s3FilesCounter.currentFileNum > 0 && (
            <div>
              file {s3FilesCounter.currentFileNum}/
              {s3FilesCounter.totalFilesNum}
            </div>
          )}
        </div>
      </span> */}
      {/* {console.log(s3FilesCounter.currentFileNum, 'currentFileNum')} */}
      {/* {console.log(s3FilesCounter.totalFilesNum, 'totalFilesNum')} */}
      {/* {s3FilesCounter.totalFilesNum > 0 && (
        <div className='mb-8 text-lg text-gray-500'>
          <div>
            File {s3FilesCounter.currentFileNum}/{s3FilesCounter.totalFilesNum}
          </div>
        </div>
      )} */}
      <div className='grid gap-4 md:grid-cols-2'>
        {data?.files?.map((file) => {
          return (
            <StymTrack
              link={file.link}
              key={file.id}
              image={file.image}
              name={file.name}
              src={file.link}
              id={file.id}
              folderId={0}
              info={file.info}
              isMyStym={true}
              setS3Loading={setS3Loading}
              s3Loading={s3Loading}
            />
          );
        })}

        {s3Files.length !== 0
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
      {showDropzone && user?.tariff !== null && (
        <div
          {...getRootProps({
            onClick: (event) => event.stopPropagation(),
            role: 'div',
          })}
          className={`fixed top-0 left-0 z-20 ml-[65px]  grid w-[95%] h-screen gap-6 text-xl border-8 border-dashed place-items-center  ${
            colorMode === 'light' ? 'bg-slate-50' : 'bg-slate-600'
          }`}
        >
          <input
            {...getInputProps({
              onChange: handleS3Upload,
            })}
          />
          <UploadIcon className='self-end w-20' />
          <div className='self-start'>
            <Text>Drop files/folders here</Text>
            <p
              role={'button'}
              onClick={() => {
                setIsOpen(!isOpen);
                setShowDropzone(!showDropzone);
              }}
              className='px-4 py-2 mt-4 text-sm font-normal text-white cursor-pointer w-max bg-my-orange rounded-30'
            >
              Create Stym
            </p>

            <label htmlFor='folders'>
              <p
                role={'button'}
                // onClick={() => {
                // setIsMainFoldersUpload(!isMainFoldersUpload);
                // setShowDropzone(!showDropzone);
                // }}
                className='px-4 py-2 mt-2 text-sm font-normal text-white cursor-pointer w-max bg-my-orange rounded-30'
              >
                Upload folders
              </p>
              <input
                type='file'
                name='folders'
                id='folders'
                onChange={(e) => handleCreateStymWithFolderName(e)}
                webkitdirectory=''
                msdirectory=''
                mozdirectory=''
              />
            </label>

            <p
              role={'button'}
              onClick={() => {
                setIsOpenCreateFolder(!isOpenCreateFolder);
              }}
              className='px-4 py-2 mt-2 text-sm font-normal text-white cursor-pointer w-max bg-my-orange rounded-30'
            >
              Create category
            </p>

            <button
              onClick={() => setShowDropzone(!showDropzone)}
              className='px-4 py-2 mt-8 text-base font-medium bg-white border border-slate-200 text-slate-500 hover:border-transparent rounded-30 hover:border-slate-400 sm:w-auto sm:text-sm'
            >
              Close
            </button>
          </div>
        </div>
      )}
      <CreateStymModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        showDropzone={showDropzone}
        setShowDropzone={setShowDropzone}
      />

      <CreateStymWithFilesInMainFolders
        isOpen={isMainFoldersUpload}
        setIsOpen={setIsMainFoldersUpload}
        showDropzone={showDropzone}
        setShowDropzone={setShowDropzone}
        // folders={folders}
        stym={stymForFolder}
        stymId={stymForFolder?.data?.id}
        defaultFolderFiles={defaultFolderFiles}
      />

      <Modal
        isOpen={isOpenCreateFolder}
        setIsOpen={setIsOpenCreateFolder}
        title='Create category'
      >
        <FormikContainer
          action='Add'
          onSubmit={handleCreateFolder}
          stymId={0}
          setIsOpen={setIsOpenCreateFolder}
          createFolderInMainPage
        />
      </Modal>
    </div>
  );
}
