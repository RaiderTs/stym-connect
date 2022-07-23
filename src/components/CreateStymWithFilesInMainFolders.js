import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useS3Upload } from 'next-s3-upload';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  incrementUploadFiles,
  reset,
  setTotalUploadFiles,
} from '../features/fileCounterSlice';
import {
  useAddStymToFolderMutation,
  useCreateFileMutation,
  useGetFoldersQuery,
} from '../features/stymQuery';
import { userSelector } from '../selectors/auth';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';

export function CreateStymWithFilesInMainFolders({
  isOpen,
  setIsOpen,
  showDropzone,
  setShowDropzone,
  stym = { folders: [] },
  defaultFolderFiles,
  stymId,
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const s3FilesCounter = useSelector((state) => state.fileCounter);
  const [selected, setSelected] = useState();
  const [createFile, { isLoading: isCreatingFiles }] = useCreateFileMutation();
  const { uploadToS3 } = useS3Upload();
  const user = useSelector(userSelector);
  const { data } = stym;
  const [addStym, { isLoading: isAdding }] = useAddStymToFolderMutation();
  const { data: allFolders, isLoading } = useGetFoldersQuery(undefined, {
    skip: !isOpen,
  });

  const handleSubmit = async () => {
    // console.log(selected.id, 'selected');

    if (stymId === undefined) {
      return;
    }

    // if (
    //   selected &&
    //   selected?.id !== 363 &&
    //   selected?.id !== 364 &&
    //   selected?.id !== 365 &&
    //   selected?.id !== 366
    // ) {
    try {
      const res = await addStym({ folderId: selected.id, stymId });
      // if (!res.data.status) {
      //   toast.error('Something went wrong!', {
      //     position: 'bottom-center',
      //   });
      // }
      // console.log(res);
      // if (res.data.message === 'folder_in_stym_exists' || res.data.status) {
      //   toast.success('Category created', {
      //     position: 'bottom-center',
      //   });
      // }
    } catch (error) {
      console.log(error);
    }
    // }

    if (defaultFolderFiles.length === 0) {
      toast.error('No files selected', {
        position: 'bottom-center',
      });
      return;
    }

    dispatch(setTotalUploadFiles(defaultFolderFiles.length));

    for (let index = 0; index < defaultFolderFiles.length; index++) {
      const file = defaultFolderFiles[index];
      // console.log(file, 's3 file');
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
              email: user?.email,
              stymId: data?.id,
              folderId: selected?.id || 0,
            },
          },
        },
      });

      const formData = new FormData();
      formData.append('name', file.name);
      formData.append('size', file.size);
      formData.append('link', url);

      try {
        // console.log(stymId, 'stym id')
        const response = await createFile({
          body: formData,
          stymId,
          folderId: selected?.id || 0,
        });
        localStorage.setItem('folderId', `${selected?.id || 0}`);
        const { data } = response;
        if (data.message === 'Complete') {
          setShowDropzone(!showDropzone);
          setIsOpen(!isOpen);
          router.push(`/my-stym/${stymId}`);
        }
      } catch (error) {
        console.log(error, 'something went wrong');
      }

      dispatch(incrementUploadFiles());
    }
    dispatch(reset());
    localStorage.removeItem('folderId');
  };

  return (
    <Modal
      title='Choose a category'
      isCentered
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <Menu placement='auto-end'>
        <MenuButton
          fontWeight={'500'}
          borderRadius={30}
          as={Button}
          leftIcon={
            (isLoading || isAdding) && (
              <LoadingSpinner color='inherit' hover='text-white' />
            )
          }
          size='sm'
          backgroundColor='transparent'
          border='1px'
          borderColor={'brand.200'}
          color={'brand.200'}
          _hover={{ bg: 'brand.200', color: 'white' }}
          _active={{ bg: 'brand.200', color: 'white' }}
        >
          {selected?.name ? selected?.name : 'Choose a category'}
        </MenuButton>
        <MenuList>
          {allFolders?.folders.length === 0 && <MenuItem>No category</MenuItem>}
          {allFolders?.folders?.map((folder) => (
            <MenuItem
              id={folder.id}
              key={folder.id}
              onClick={() => setSelected(folder)}
            >
              {folder.name}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <Button
        leftIcon={
          isCreatingFiles && (
            <LoadingSpinner color='inherit' hover='text-white' />
          )
        }
        type='submit'
        onClick={handleSubmit}
        borderRadius={30}
        fontWeight='normal'
        size='sm'
        float='right'
        borderColor='brand.200'
        variant='outline'
        color={'brand.200'}
        _hover={{ bg: 'brand.200', color: 'white' }}
        _active={{ bg: 'brand.200', color: 'white' }}
      >
        Create
      </Button>
    </Modal>
  );
}
