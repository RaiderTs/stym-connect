import { useRouter } from 'next/dist/client/router';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { userSelector } from '../../../selectors/auth';
import md5 from 'md5';
import ProfileLayout from '../components/ProfileLayout';
import StymTrash from '../../../components/StymTrash';
import { deleteS3Object } from '../../../pages/api/s3-delete';
import { toast } from 'react-toastify';
import Replay from '../../../components/svg/replay.svg';
import Dots from '../../../components/svg/dots.svg';
import Delete from '../../../components/svg/delete.svg';
import Open from '../../../components/svg/open.svg';
import Info from '../../../components/svg/info.svg';
import ArrowRight from '../../../components/svg/arrow-right-p.svg';
import ArrowLeft from '../../../components/svg/arrow-left-p.svg';
// import { useS3Upload } from 'next-s3-upload';
import {
  useGetTrashListQuery,
  useRestoreFileFromTrashMutation,
  useRestoreStymFromTrashMutation,
  useRemoveFileFromTrashMutation,
  useRemoveStymFromTrashMutation,
  useRemoveAllDataFromTrashMutation,
} from '../../../features/stymQuery';
import ShareMenu from '../../../components/Shared/ShareMenu';
import Modal from '../../../components/Modal';
import {
  useColorMode,
  Checkbox,
  Box,
  Image,
  Text,
  Skeleton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Tooltip,
  Button,
  useMediaQuery,
} from '@chakra-ui/react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import NProgress from 'nprogress';

export default function Trash() {
  const [sm] = useMediaQuery('(min-width: 640px)');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { data, isLoading, isFetching } = useGetTrashListQuery({
    page: currentPage,
    limit: 10,
  });

  const [restoreFile, { result: resultRestoreFile, isLoading: isRestoring }] =
    useRestoreFileFromTrashMutation();
  const [restoreStym, { result: resultRestoreStym }] =
    useRestoreStymFromTrashMutation();
  const [removeFile, { isFetching: fetchingRemoveFile }] =
    useRemoveFileFromTrashMutation();
  const [removeStym, { isFetching: fetchingRemoveStym }] =
    useRemoveStymFromTrashMutation();
  const [removeAllDataFromTrash, { isFetching: fetchingRemoveAllData }] =
    useRemoveAllDataFromTrashMutation();

  const [isDisabled, setIsDisabled] = useState(false);
  const [isSelected, setIsSelected] = useState([]);
  const [urls, setUrls] = useState([]);
  const [emptyTrash, setEmptyTrash] = useState(false);
  // const user = useSelector(userSelector);
  const { colorMode } = useColorMode();
  // const { uploadToS3, files } = useS3Upload();
  const [isOpenShare, setIsOpenShare] = useState(false);
  const selected = useSelector((state) => state.modal.selected);

  const user = useSelector(userSelector);

  if (fetchingRemoveFile || fetchingRemoveStym) {
    NProgress.start();
  } else {
    NProgress.done();
  }
  // Pagination

  const handleClickBack = () => {
    if (currentPage === 1) return;
    setCurrentPage((page) => page - 1);
  };

  const handleClick = () => {
    if (currentPage === data?.counter?.countPages) return;
    setCurrentPage((page) => page + 1);
  };

  const handleRestoreClick = (isSelected) => {
    const files = [];
    const stym = [];
    isSelected.map((item) => {
      item.name === 'stym' ? stym.push(item) : files.push(item);
    });
    if (files.length > 0) {
      files.map(async (item) => {
        try {
          const res = await restoreFile(item.id);
          const { data } = res;
          if (data.status) {
            toast.success('File restored', {
              position: 'bottom-center',
            });
            setIsSelected([]);
          } else {
            toast.error('Something went wrong, please try again later', {
              position: 'bottom-center',
            });
          }
        } catch (err) {
          console.log(err);
        }
      });
    }
    if (stym.length > 0) {
      stym.map(async (item) => {
        try {
          const res = await restoreStym(item.id);
          const { data } = res;
          if (data.status) {
            toast.success('Stym restored', {
              position: 'bottom-center',
            });
            setIsSelected([]);
          } else {
            toast.error('Something went wrong, please try again later', {
              position: 'bottom-center',
            });
          }
        } catch (err) {
          console.log(err);
        }
      });
    }
  };

  const deleteS3Folder = (item) => {
    const sid = item.id;
    const md5Email = md5(user.email);
    const md5StymId = sid ? md5(`${sid}`) : null;
    item.playList
      ? item?.playList.map(async ({ name, folder }) => {
          const sanitizedFilename = name?.replace(/[^A-Za-z0-9.]/g, '_');
          const folderId = md5(`${folder ? folder : 0}`);
          const regularPath = `public/${md5Email}/${md5StymId}/${folderId}/${sanitizedFilename}`;
          await deleteS3Object({
            Bucket: 'stymconnectappbucket130953-dev',
            Key: regularPath,
          });
        })
      : item?.playList[0].map(async ({ name }) => {
          const sanitizedFilename = name.replace(/[^A-Za-z0-9.]/g, '_');
          const regularPath = `public/${md5Email}/${md5StymId}/${sanitizedFilename}`;
          await deleteS3Object({
            Bucket: 'stymconnectappbucket130953-dev',
            Key: regularPath,
          });
        });
  };

  const handleRemoveClick = (isSelected) => {
    const files = [];
    const stym = [];
    isSelected.map((item) => {
      item.name === 'stym' ? stym.push(item) : files.push(item);
    });
    if (files.length > 0) {
      files.map(async (item) => {
        const sanitizedFilename = item.fileName.replace(/[^A-Za-z0-9.]/g, '_');
        const sid = item.sid.trim();
        const folderId = md5(`${item?.folderId ? item.folderId : 0}`);
        const md5Email = md5(user.email);
        const md5StymId = sid ? md5(`${sid}`) : null;
        const regularPath = `public/${md5Email}/${md5StymId}/${folderId}/${sanitizedFilename}`;
        try {
          await deleteS3Object({
            Bucket: 'stymconnectappbucket130953-dev',
            Key: regularPath,
          });
          const res = await removeFile(item.id);
          const { data } = res;
          if (data.status) {
            toast.success('File deleted', {
              position: 'bottom-center',
            });
            setIsSelected([]);
          } else {
            toast.error('Something went wrong, please try again later', {
              position: 'bottom-center',
            });
          }
        } catch (err) {
          console.log(err);
        }
      });
    }
    if (stym.length > 0) {
      stym.map(async (item) => {
        console.log(item);
        try {
          deleteS3Folder(item);
          const res = await removeStym(item.id);
          const { data } = res;
          if (data.status) {
            toast.success('Stym deleted', {
              position: 'bottom-center',
              // autoClose: 1000,
            });
            setIsSelected([]);
          } else {
            toast.error('Something went wrong, please try again later', {
              position: 'bottom-center',
            });
          }
        } catch (err) {
          console.log(err);
        }
      });
    }
  };

  const handleEmptyTrash = () => {
    setIsDisabled(true);
    if (data?.files !== 0) {
      data?.files?.map(async (item) => {
        const sid = item.stym;
        const folderId = md5(`${item?.folder ? item.folder : 0}`);
        const sanitizedFilename = item.name.replace(/[^A-Za-z0-9.]/g, '_');
        const md5Email = md5(user.email);
        const md5StymId = sid ? md5(`${sid}`) : null;
        // const fileName = item.link.split('/').pop()
        const dropzonePath = `public/${md5Email}/${sanitizedFilename}`;
        const regularPath = `public/${md5Email}/${md5StymId}/${folderId}/${sanitizedFilename}`;
        try {
          await deleteS3Object({
            Bucket: 'stymconnectappbucket130953-dev',
            Key: sid ? regularPath : dropzonePath,
          });
          const res = await removeFile(item.id);
          const { data } = res;
          if (data.status) {
            toast.success('Trash emptied', {
              position: 'bottom-center',
              toastId: 'something',
              autoClose: 300,
            });
            setIsSelected([]);
            setIsDisabled(false);
          } else {
            toast.error('Something went wrong, please try again later', {
              position: 'bottom-center',
              toastId: 'something',
            });
            setIsDisabled(false);
          }
        } catch (err) {
          console.log(err);
          setIsDisabled(false);
        }
      });
    }
    if (data?.styms !== 0) {
      data?.styms?.map(async (item) => {
        console.log(item);
        try {
          deleteS3Folder(item);
          const res = await removeStym(item.id);
          const { data } = res;
          if (data.status) {
            toast.success('Trash empty', {
              position: 'bottom-center',
              toastId: 'something',
              autoClose: 300,
            });
            setIsSelected([]);
            setIsDisabled(false);
          } else {
            toast.error('Something went wrong, please try again later', {
              position: 'bottom-center',
              toastId: 'something',
            });
            setIsDisabled(false);
          }
        } catch (err) {
          console.log(err);
          setIsDisabled(false);
        }
      });
    }
  };

  const handleChange = (e, track = null, stym = null) => {
    const { name, id } = e.target;
    if (e.target.checked) {
      setIsSelected([
        ...isSelected,
        {
          name: name,
          id: id,
          fileName: `${track ? track.name : e.target.value}`,
          sid: `${track ? track.stym : id}`,
          playList: stym ? stym.playList : null,
          folderId: track?.folder,
        },
      ]);
    } else {
      setIsSelected(isSelected.filter(({ id }) => id !== e.target.id));
    }
  };

  const handleOpen = (id) => {
    router.push(`trash/stym/${id}`);
  };

  return (
    <ProfileLayout>
      <Box width='100%'>
        {(!isLoading && data?.files !== null) ||
        (!isLoading && data?.styms !== null) ? (
          <Box display='flex' mb='15px' w='full'>
            {isSelected.length !== 0 && (
              <Box display='flex' alignItems='center' gap={4}>
                <Button
                  borderWidth={1}
                  borderColor='brand.200'
                  borderRadius={30}
                  bg='transparent'
                  color='brand.200'
                  fontWeight='500'
                  fontSize={14}
                  leftIcon={<Replay className='w-4' />}
                  _hover={{ color: 'white', bg: 'brand.200' }}
                  onClick={() => handleRestoreClick(isSelected)}
                >
                  Restore
                </Button>
                <Button
                  borderRadius={30}
                  fontWeight='500'
                  fontSize={14}
                  leftIcon={<Delete className='w-4' />}
                  bg='transparent'
                  onClick={() => {
                    handleRemoveClick(isSelected);
                  }}
                >
                  Delete forever
                </Button>
              </Box>
            )}
            <Box
              display='flex'
              position='relative'
              alignItems='center'
              ml='auto'
              gap={4}
            >
              <Box
                display='flex'
                gap={4}
                ml='auto'
                paddingRight={!sm ? 16 : ''}
                alignItems='center'
                position='relative'
                mr='25px'
              >
                <Text minWidth={'60px'} textAlign='end'>{`${currentPage}${
                  data?.counter?.countPages
                    ? `-${data?.counter?.countPages}`
                    : ''
                }`}</Text>
                <Box display='flex' alignItems='center' gap='25px'>
                  <Box
                    as='button'
                    role='button'
                    onClick={handleClickBack}
                    color={currentPage === 1 ? 'gray' : 'brand.200'}
                  >
                    <ArrowLeft />
                  </Box>
                  <Box
                    as='button'
                    role='button'
                    onClick={handleClick}
                    color={
                      currentPage === data?.counter?.countPages
                        ? 'gray'
                        : 'brand.200'
                    }
                  >
                    <ArrowRight />
                  </Box>
                </Box>
              </Box>
              <Tooltip
                variant='my-tooltip'
                placement='top'
                label='Files stored in the recycle bin for more than 30 days are
                  automatically deleted'
              >
                <span>
                  <Info className='w-8 text-my-orange' />
                </span>
              </Tooltip>
              <Button
                ml='auto'
                borderRadius={30}
                bg='brand.200'
                color='white'
                fontWeight='500'
                fontSize={14}
                leftIcon={<Delete className='w-4' />}
                disabled={isDisabled}
                _hover={{ color: 'white', bg: 'brand.200' }}
                onClick={handleEmptyTrash}
              >
                {' '}
                {currentPage === data?.counter?.countPages
                  ? 'Empty trash'
                  : 'Empty trash on this page'}
              </Button>
            </Box>
          </Box>
        ) : null}
        <div className='flex flex-col gap-[18px] w-[100%] relative'>
          {isLoading && (
            <>
              <Skeleton width='100%' height='2rem' borderRadius={10} />
              <Skeleton width='100%' height='2rem' borderRadius={10} />
              <Skeleton width='100%' height='2rem' borderRadius={10} />
            </>
          )}

          {data?.files?.map((track) => {
            return (
              <Box key={track.id}>
                {/* {console.log(track)} */}
                <Box display='flex' with='100%'>
                  <Checkbox
                    mr='16px'
                    size='lg'
                    colorScheme='brand'
                    _focus={{ boxShadow: 'transparent' }}
                    id={track.id}
                    name='file'
                    // isChecked={}
                    onChange={(e) => handleChange(e, track, null)}
                    borderColor={colorMode === 'light' ? 'gray.200' : 'white'}
                  />
                  <StymTrash
                    info={track.info}
                    createdDate={track.createDate}
                    key={track.id}
                    id={track.id}
                    src={track.link}
                    image={track?.image}
                    name={track.name}
                  />
                </Box>
              </Box>
            );
          })}
          {/* folders */}
          {data?.styms?.map((stym) => {
            return (
              <Box key={stym.id}>
                {/* {console.log(stym)} */}
                <Box display='flex' with='100%'>
                  <Checkbox
                    mr='16px'
                    size='lg'
                    colorScheme='brand'
                    _focus={{ boxShadow: 'transparent' }}
                    id={stym.id}
                    name='stym'
                    value={stym.name}
                    // isChecked={}
                    borderColor={colorMode === 'light' ? 'gray.200' : 'white'}
                    // onChange={handleChange}
                    onChange={(e) => handleChange(e, null, stym)}
                  />
                  <Box
                    borderColor={
                      colorMode === 'light' ? 'gray.100' : 'gray.600'
                    }
                    className='bg-gray-200 text-gray-600  gap-4 flex items-center justify-between w-[100%] h-14 px-3 py-2 shadow-md border text-sm rounded-10 '
                  >
                    <div className='flex items-center gap-4 truncate'>
                      <Image
                        src={stym?.image || '/stym-dark.png'}
                        width='40px'
                        height='40px'
                        className='rounded-10 '
                        alt='album cover'
                      />
                      <span className='max-w-[30ch] whitespace-nowrap truncate'>
                        {stym?.name}
                      </span>
                    </div>
                    <div className='flex gap-4'>
                      <Popover
                        placement='bottom-end'
                        gutter={11}
                        closeOnBlur={true}
                      >
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
                              <PopoverBody
                                _hover={{
                                  color: 'brand.200',
                                  bg: 'transparent',
                                }}
                                onClick={() => handleOpen(stym.id)}
                                cursor='pointer'
                                display='flex'
                              >
                                <Open className='w-4 mr-2' aria-hidden='true' />
                                Open
                              </PopoverBody>
                            </PopoverContent>
                          </>
                        )}
                      </Popover>
                    </div>
                  </Box>
                </Box>
              </Box>
            );
          })}
          {data?.files !== null || data?.styms !== null ? null : (
            <Text
              as='h2'
              fontWeight='500'
              fontSize='42px'
              lineHeight='110%'
              textAlign='Center'
            >
              Trash is empty
            </Text>
          )}
        </div>
      </Box>
    </ProfileLayout>
  );
}
