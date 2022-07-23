import { useS3Upload } from 'next-s3-upload';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import {
  useCreateFolderMutation,
  useGetFilesInStymByIdQuery,
  useGetStymByIdQuery,
  useCreateFileMutation,
  useCreateStymShareMutation,
  useEditStymCoverMutation,
  useDeleteStymMutation,
  useDeleteFolderInStymMutation,
  useAddActivityLogMutation,
} from '../../features/stymQuery';
import PlayAlbumOrange from '../../components/svg/playAlbumOrange.svg';
import DownloadAlbum from '../../components/svg/downloadAlbum.svg';
import ShareAlbum from '../../components/svg/shareAlbum.svg';
import Delete from '../../components/svg/delete.svg';
import Create from '../../components/svg/create.svg';
import { UploadIcon } from '@heroicons/react/solid';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../../selectors/auth';
import StymTrack from '../../components/Mystym/StymTrack';
import { toast } from 'react-toastify';
import { setCurrentTrack, setPlaylist } from '../../features/audio/audioSlice';
import Modal from '../../components/Modal';
import ShareMenu from '../../components/Shared/ShareMenu';
import EditableTextField from '../../components/EditableTextField';
import EditableTitleFolder from '../../components/EditableTitleFolder';
import Preloader from '../../components/Preloader';
import NProgress from 'nprogress';
import ContactsMenu from './ContactsMenu';
import DragAndDrop from '../../components/DragAndDrop';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import {
  Text,
  useColorMode,
  Button,
  Progress,
  Tooltip,
} from '@chakra-ui/react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { deleteS3Object } from '../api/s3-delete';
import md5 from 'md5';
import { FormikContainer } from '../../components/CreateFolderForm';
import { useDropzone } from 'react-dropzone';
import { toaster } from '../../components/Toast';
import {
  setTotalUploadFiles,
  incrementUploadFiles,
  reset,
} from '../../features/fileCounterSlice';
import { getS3Link } from '../api/s3-zipper';

export default function Album() {
  const [res, setRes] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleFilesChange(acceptedFiles),
  });
  const { colorMode } = useColorMode();
  const [isOpenCreateFolder, setIsOpenCreateFolder] = useState(false);
  const [isOpenShare, setIsOpenShare] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenDeleteFolder, setIsOpenDeleteFolder] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [isError, setIsError] = useState();
  const [dndId, setDndId] = useState('');

  const [folderList, setFolderList] = useState([]);

  // const [stymS3Url, setStymS3Url] = useState(null);
  const [s3Loading, setS3Loading] = useState(true);

  const s3FilesCounter = useSelector((state) => state.fileCounter);
  const [showDropzone, setShowDropzone] = useState(false);
  const { uploadToS3, files: s3Files } = useS3Upload();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const currentPlaylist = useSelector((state) => state.audio.currentPlaylist);
  const selected = useSelector((state) => state.modal.selected);
  const { sid } = router.query;
  const {
    data = {},
    isLoading,
    error: queryError,
    isFetching: isF,
  } = useGetStymByIdQuery(sid, {
    skip: sid ? false : true,
  });

  // console.log(data);
  if (
    queryError?.message === `Cannot read properties of null (reading 'token')`
  ) {
    router.push('/sign-in');
  }

  const { users } = data?.stym?.info?.shared || [];
  const { info } = data?.stym || [];
  const access = data?.stym?.access;

  // * get track in stym for global playback
  // * set skip to false once the component mounts; without this the id will be undefined and the query wont work
  const {
    data: { files } = [],
    isLoading: isFileLoading,
    refetch,
  } = useGetFilesInStymByIdQuery(sid, {
    skip: sid ? false : true,
  });

  // console.log(files)

  const [createFolder, { isLoading: isFolderCreating }] =
    useCreateFolderMutation();
  const [editStymCover, { isLoading: isCoverEditing }] =
    useEditStymCoverMutation();
  const [deleteStym, { isLoading: isDeleting }] = useDeleteStymMutation();
  const [createFile, { isLoading: isFileCreating }] = useCreateFileMutation();
  const [createShare, { isLoading: isSharing }] = useCreateStymShareMutation();
  const [deleteFolderInStym, { isLoading: isDeletingFolder }] =
    useDeleteFolderInStymMutation();
  const [addActivityLog, { isLoading: isActivityLoading }] =
    useAddActivityLogMutation();

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

  // * update stym photo
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];

    const photoData = new FormData();
    photoData.append('file', file);

    const options = { stymId: sid, body: photoData };

    try {
      const res = await editStymCover(options);
      if (res.data.message === 'no edit access') {
        toaster({
          type: 'error',
          message: 'You do not have permission to edit this stym',
        });
      }
      console.log(res, 'photo res');
    } catch (error) {
      console.log(error);
    }
  };

  if (isCoverEditing || isFolderCreating || isFileCreating || isF) {
    NProgress.start(true);
  }
  // * S3 upload
  const handleFilesChange = (acceptedFiles) => {
    dispatch(reset());
    // dispatch(setTotalUploadFiles(acceptedFiles?.length));

    acceptedFiles.forEach(async (file) => {
      setShowDropzone(false);
      // const file = acceptedFiles[index];
      const newName = file?.name?.replace(/[^A-Za-z0-9.]/g, '_');

      function renameFile(file, newName) {
        return new File([file], newName, {
          type: file.type,
          lastModified: file.lastModified,
        });
      }

      const { name, size } = file;
      const { url } = await uploadToS3(renameFile(file, newName), {
        endpoint: {
          request: {
            body: {
              email: user.email,
              stymId: sid,
              folderId: dndId,
            },
          },
        },
      });
      s3FilesCounter.totalFilesUpload === 0 &&
        dispatch(setTotalUploadFiles(acceptedFiles?.length));
      NProgress.start();

      const formData = new FormData();
      formData.append('name', name);
      formData.append('size', size);
      formData.append('link', url);

      try {
        const response = await createFile({
          body: formData,
          stymId: sid,
          folderId: dndId,
        });
        localStorage.setItem('folderId', `${dndId !== '' ? dndId : 0}`);

        const { data } = response;
        if (data.message === 'Complete') {
          toaster({ type: 'success', message: 'File added' });
        } else if (data.message === 'file_exists_by_name') {
          toaster({
            type: 'error',
            message: 'File with this name already exists',
          });
        }
      } catch (error) {
        console.log(error, 'something went wrong');
      }

      dispatch(incrementUploadFiles());
    });
    setDndId('');
    localStorage.removeItem('folderId');
    dispatch(reset());
  };

  // * S3 folder upload
  const handleFolderUpload = async (e, id) => {
    dispatch(reset());
    // console.log(id);
    setShowDropzone(false);
    const folder = e.target.files;
    console.log(folder, 'folder');
    dispatch(setTotalUploadFiles(folder.length));

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
              stymId: sid,
              folderId: dndId || id,
              name: newName,
            },
          },
        },
      });

      NProgress.start();

      const formData = new FormData();
      formData.append('name', file.name);
      formData.append('size', file.size);
      formData.append('link', url);

      try {
        const response = await createFile({
          body: formData,
          stymId: sid,
          folderId: dndId || id,
        });
        setIsOpenCreateFolder(false);
        const { data } = response;
        if (data.message === 'Complete') {
          toaster({ type: 'success', message: 'File added' });
        } else if (data.message === 'file_exists_by_name') {
          toaster({
            type: 'error',
            message: 'File with this name already exists',
          });
        }
      } catch (error) {
        console.log(error, 'something went wrong');
      }
      dispatch(incrementUploadFiles());
      refetch();
    }
    dispatch(reset());
    setDndId('');
  };

  const handleCreateFolderWithFiles = async (e) => {
    // console.log(e.target.files, 'handleCreateFolderWithFiles');

    const files = e?.target?.files;
    const folderName = files[0]?.webkitRelativePath.split('/')[0];

    const formData = new FormData();
    formData.append('name', folderName);

    try {
      const res = await createFolder({ body: formData, stymId: sid });
      // console.log(res.data.id);
      setRes(res.data.id);

      if (res.data.message === 'folder_exists') {
        toaster({
          type: 'error',
          message: 'Folder by this name already exists',
        });
        return;
      }

      const s3res = await handleFolderUpload(e, res?.data?.id);
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(stymS3Url, 'asd');
  const handlePlay = () => {
    // console.log(files, 'files sid');

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
    // console.log(data.stym.playList, 'files in album');

    // if (currentPlaylist.length === 0)
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

  //* stym sharing
  const onSubmit = async (values) => {
    if (values.email !== 0) {
      for (let i = 0; i < values.email.length; i++) {
        const email = values.email[i];
        const formData = new FormData();
        formData.append('stym', sid);
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
        !isError && setIsOpenShare(false);
      }
    }
    // group
    if (values.group !== 0) {
      for (let i = 0; i < values.group.length; i++) {
        const group = values.group[i];
        console.log(group);
        const formData = new FormData();
        formData.append('stym', sid);
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
        !isError && setIsOpenShare(false);
      }
    }
  };

  // * create folder
  const handleCreateFolder = async (values) => {
    const formData = new FormData();
    formData.append('name', values.folderName);

    try {
      const res = await createFolder({ body: formData, stymId: sid });

      if (res.data.message === 'folder_exists') {
        toast.error('Folder by this name already exists', {
          position: 'bottom-center',
        });
      }
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  //* download stym
  const { name } = data?.stym || [];

  const handleStymDownload = async () => {
    setS3Loading(false);
    const stymId = md5(`${sid}`);
    const id = toast.loading('Generating a download link...', {
      position: 'bottom-center',
    });
    NProgress.start();
    if (sid) {
      fetch(
        'https://bcxdoh9y7g.execute-api.us-east-1.amazonaws.com/s3-zip/AWS-create-zip',
        {
          method: 'POST',
          body: JSON.stringify({
            bucketKey: `${md5(info?.owner?.email)}/${stymId}`,
            archiveName: name ? name : '',
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
                email: `${md5(info?.owner?.email)}`,
                archiveName: name ? name : '',
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
    }
  };

  // * delete stym
  const handleDeleteStym = async () => {
    try {
      await deleteStym(sid);
      setIsOpenDelete(false);
      router.push('/my-stym');
    } catch (error) {
      console.log(error);
    }
  };

  const deleteS3Folder = () => {
    const md5Email = md5(user.email);
    const md5StymId = sid ? md5(`${sid}`) : null;
    const folderId = md5(`${activeFolder.id ? activeFolder.id : 0}`);
    activeFolder.files &&
      activeFolder.files.map(async ({ name }) => {
        const regularPath = `public/${md5Email}/${md5StymId}/${folderId}/${name.replace(
          /[^A-Za-z0-9.]/g,
          '_'
        )}`;
        await deleteS3Object({
          Bucket: 'stymconnectappbucket130953-dev',
          Key: regularPath,
        });
      });
  };

  // delete folder in stym
  const handleDeleteFolderInStym = async () => {
    try {
      deleteS3Folder();
      const res = await deleteFolderInStym({
        stymId: sid,
        folderId: activeFolder.id,
      });
      if (res?.data.status) {
        toast.success('Category deleted from stym', {
          position: 'bottom-center',
        });
        setIsOpenDeleteFolder(false);
      } else if (!res?.data.status)
        toast.error('Something went wrong!', {
          position: 'bottom-center',
        });
    } catch (error) {
      console.log(error);
    }
  };

  const prepareDnd = (id) => {
    // console.log(id, 'prep');
    setDndId(id);
    setShowDropzone(!showDropzone);
  };

  if (data.message === 'stym_not_found') router.push('/404');
  if (queryError?.originalStatus === 401) {
    // dispatch(googleSignout());
    router.push('/sign-in');
  }

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

  if (
    s3FilesCounter?.currentFilesUpload === s3FilesCounter?.totalFilesUpload &&
    s3FilesCounter?.currentFilesUpload !== 0 &&
    s3FilesCounter?.totalFilesUpload !== 0
  ) {
    toaster({ type: 'success', message: 'Upload Complete' });
    dispatch(reset());
    setDndId('');
    localStorage.removeItem('folderId');
  }

  const folderIdFromStorage = localStorage.getItem('folderId');

  return (
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
            {!isLoading && user?.email === data?.stym?.info?.owner.email && (
              <label htmlFor='stymPic'>
                <div className='absolute flex px-4 py-2 text-white cursor-pointer -bottom-6 rounded-30 bg-my-orange'>
                  {isCoverEditing && <LoadingSpinner color='mr-3' />}
                  Edit photo
                </div>
              </label>
            )}
            <input
              onChange={handlePhotoChange}
              accept='image/png, image/jpeg'
              className='absolute z-10'
              disabled={isLoading}
              type='file'
              name='stymPic'
              id='stymPic'
            />
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
                <EditableTextField
                  name={data?.stym?.name}
                  stymId={sid}
                  access={data?.stym?.access}
                  singer={data?.stym?.singer}
                />
              )}
              <Tooltip
                label={!data?.stym?.singer ? '' : data?.stym?.singer}
                variant='my-tooltip'
                borderRadius='10px'
                // left='70px'
                placement='bottom-start'
                padding='5px 15px'
                backgroundColor={colorMode === 'dark' && '#0F2042'}
              >
                <p className='text-2xl font-medium md:text-4xl w-[400px] truncate'>
                  {!data?.stym?.singer ? '' : data?.stym?.singer}
                </p>
              </Tooltip>
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
                  {s3FilesCounter?.totalFilesUpload > 0 && (
                    <>
                      <div className='text-base '>
                        {s3FilesCounter?.currentFilesUpload > 0 && (
                          <div>
                            Added files: {s3FilesCounter?.currentFilesUpload}/
                            {s3FilesCounter?.totalFilesUpload}
                          </div>
                        )}
                        <Progress
                          value={s3FilesCounter?.currentFilesUpload}
                          min={0}
                          max={s3FilesCounter?.totalFilesUpload}
                          colorScheme='brand'
                          borderRadius={10}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-between gap-5'>
          {isLoading ? (
            <Preloader
              height={'h-[2rem]'}
              padding={'p-[2rem]'}
              width={'w-[17rem]'}
            />
          ) : (
            // stym Play Download Share Del

            <div
              // if access is viewer, hide share and delete
              className={`grid grid-cols-2 gap-5  ${
                data?.stym?.access === 'owner' ||
                data?.stym?.access === 'editor'
                  ? 'md:grid-cols-4'
                  : ''
              }`}
            >
              <div
                onClick={handlePlay}
                className='flex items-center gap-4 text-center cursor-default md:flex-col'
              >
                <PlayAlbumOrange className='w-6 cursor-pointer md:w-16 text-my-orange' />
                <span>Play</span>
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

              {(data?.stym?.access === 'owner' ||
                data?.stym?.access === 'editor') && (
                <div
                  onClick={() => setIsOpenShare(!isOpenShare)}
                  className='flex items-center gap-4 text-center cursor-default md:flex-col'
                >
                  <ShareAlbum className='w-6 cursor-pointer md:w-16 text-my-orange' />
                  <span>Share</span>
                </div>
              )}
              {(data?.stym?.access === 'owner' ||
                data?.stym?.access === 'editor') && (
                <div
                  onClick={() => setIsOpenDelete(!isOpenDelete)}
                  className='flex items-center gap-4 text-center cursor-default md:flex-col'
                >
                  <Delete className='w-6 cursor-pointer md:w-16 text-my-orange' />
                  <span>Delete</span>
                </div>
              )}
            </div>
          )}

          {/* contacts menu */}

          {!isLoading && (
            <div className='grid self-end grid-flow-col place-items-center'>
              {info?.shared?.users.slice(0, 3).map((user) => {
                return (
                  <div key={user.id}>
                    <img
                      src={user.image || '/profile_pic.png'}
                      alt={user.name}
                      className='object-cover w-10 rounded-full aspect-square'
                    />
                  </div>
                );
              })}

              <ContactsMenu
                fetching={isF}
                users={users}
                owner={info?.owner}
                stymId={sid}
              />
            </div>
          )}
        </div>
      </div>

      {/* create folder */}

      <div className='self-end mb-5'>
        {!isLoading && (
          <button
            onClick={() => setIsOpenCreateFolder(!isOpenCreateFolder)}
            className='p-3 border rounded-full text-my-orange border-my-orange hover:text-white hover:bg-my-orange'
          >
            {isFolderCreating ? 'Creating category' : '+ Category'}
          </button>
        )}
      </div>

      {data?.stym?.folders.length === 0 && (
        <h2 className='text-2xl'>Create a folder first to upload files</h2>
      )}
      {folderList?.map((folder) => (
        <div key={folder.id} className='mb-12'>
          <div
            className={`flex  w-full mb-6  ${
              folder?.id === 0 ? 'justify-end' : 'justify-between'
            }`}
            key={folder.id}
          >
            {folder?.id !== 0 && (
              <span className='flex items-center gap-4 text-2xl font-medium'>
                <EditableTitleFolder
                  name={folder?.id !== 0 ? folder.name : null}
                  stymId={sid}
                  folderId={folder?.id}
                  access={data?.stym?.access}
                />
                {folder?.name ? (
                  <Button
                    type='submit'
                    ml='auto'
                    borderRadius='50%'
                    paddingRight='8px'
                    width='27px'
                    fontWeight='500'
                    _focus={{ boxShadow: 'transparent' }}
                    fontSize={14}
                    leftIcon={<Delete width='25px' />}
                    onClick={() => {
                      setActiveFolder(folder);
                      setIsOpenDeleteFolder(!isOpenDeleteFolder);
                    }}
                  />
                ) : null}
                {(folder.id === dndId || folder.id === 0) && (
                  <div className='text-base text-gray-500'>
                    {s3FilesCounter?.currentFilesUpload > 0 &&
                      s3FilesCounter?.totalFilesUpload !== 0 && (
                        <div
                          className={`colorMode === 'light' ? 'text-slate-50' : 'text-slate-400'`}
                        >
                          Added files: {s3FilesCounter?.currentFilesUpload}/
                          {s3FilesCounter?.totalFilesUpload}
                        </div>
                      )}
                  </div>
                )}
              </span>
            )}

            {folder?.files?.length > 2 && (
              <div className='flex'>
                {!folder?.expanded && (
                  <p className='mr-4'>{`Files: ${folder?.files?.length}`}</p>
                )}
                <span
                  className='underline cursor-pointer hover:text-my-orange underline-offset-2'
                  onClick={() => handelFilesLength(folder?.id)}
                >
                  {folder?.expanded ? 'See less' : 'See all'}
                </span>
              </div>
            )}
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            {!folder?.expanded
              ? folder?.files?.slice(0, 2).map((track) => {
                  return (
                    <StymTrack
                      link={track.link}
                      info={track.info}
                      createdDate={track.createDate}
                      key={track.id}
                      id={track.id}
                      folderId={folder.id}
                      src={track.link}
                      image={data?.stym?.image}
                      name={track.name}
                      setS3Loading={setS3Loading}
                      s3Loading={s3Loading}
                    />
                  );
                })
              : folder?.files.map((track) => {
                  return (
                    <StymTrack
                      link={track.link}
                      info={track.info}
                      createdDate={track.createDate}
                      key={track.id}
                      id={track.id}
                      folderId={folder.id}
                      src={track.link}
                      image={data?.stym?.image}
                      name={track.name}
                      setS3Loading={setS3Loading}
                      s3Loading={s3Loading}
                    />
                  );
                })}

            {(!isLoading || !isF) && (
              <>
                {user.tariff && (
                  <div
                    onClick={() => prepareDnd(folder.id)}
                    className='grid border shadow-md cursor-pointer h-14 border-my-light-purple rounded-10 place-items-center '
                  >
                    <Create className='w-8' />
                  </div>
                )}
              </>
            )}

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
      {showDropzone && user.tariff !== null && (
        <div
          {...getRootProps({
            onClick: (event) => event.stopPropagation(),
            role: 'div',
            // onDrop: handleFilesChange,
          })}
          className={`fixed top-0 left-0 z-20 ml-[65px] grid w-[95%] h-screen gap-6 text-xl border-8 border-dashed place-items-center  ${
            colorMode === 'light' ? 'bg-slate-50' : 'bg-slate-600'
          }`}
        >
          <input
            {...getInputProps({
              onChange: handleFilesChange,
            })}
          />

          <UploadIcon className='self-end w-20' />
          <div className='self-start text-center'>
            <Text>Drop files/folders here</Text>
            <label htmlFor='folders'>
              <div
                role={'button'}
                className='px-4 py-2 mx-auto mt-2 text-sm font-normal text-white cursor-pointer w-36 bg-my-orange rounded-30'
              >
                Upload folders
              </div>
              <input
                type='file'
                name='folders'
                id='folders'
                onChange={(e) => handleFolderUpload(e)}
                webkitdirectory=''
                msdirectory=''
                mozdirectory=''
              />
            </label>
            <button
              onClick={() => setShowDropzone(!showDropzone)}
              className='px-4 py-2 mt-2 text-base font-medium bg-white border border-slate-200 text-slate-500 hover:border-transparent rounded-30 hover:border-slate-400 sm:w-auto sm:text-sm'
            >
              Close
            </button>
          </div>
        </div>
      )}
      <Modal isOpen={isOpenShare} setIsOpen={setIsOpenShare} title='Share'>
        <ShareMenu
          onSubmit={onSubmit}
          isSharing={isSharing}
          stymId={sid}
          access={access}
        />
      </Modal>

      <Modal isOpen={isOpenDelete} setIsOpen={setIsOpenDelete} title='Confirm'>
        <ConfirmationDialog
          cancel={() => setIsOpenDelete(false)}
          handleDelete={handleDeleteStym}
          loading={isDeleting}
        />
      </Modal>

      <Modal
        isOpen={isOpenDeleteFolder}
        setIsOpen={setIsOpenDeleteFolder}
        title='Confirm'
      >
        <ConfirmationDialog
          cancel={() => setIsOpenDeleteFolder(false)}
          handleDelete={handleDeleteFolderInStym}
          loading={isDeletingFolder}
          deleteFolder
        />
      </Modal>

      <Modal
        isOpen={isOpenCreateFolder}
        setIsOpen={setIsOpenCreateFolder}
        title='Create category'
      >
        <FormikContainer
          action='Add'
          onSubmit={handleCreateFolder}
          stymId={sid}
          setIsOpen={setIsOpenCreateFolder}
          handleCreateFolderWithFiles={handleCreateFolderWithFiles}
        />
      </Modal>
    </Layout>
  );
}
