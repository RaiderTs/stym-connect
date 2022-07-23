import { toast } from 'react-toastify';
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import {
  useAddStymToFolderMutation,
  useGetFoldersQuery,
} from '../features/stymQuery';
import LoadingSpinner from './LoadingSpinner';

export function AddStymToFolder({ isOpen, stymId}) {
  const { data, isLoading } = useGetFoldersQuery(undefined, {
    skip: isOpen,
  });
  const [addStym, { isLoading: isAdding }] = useAddStymToFolderMutation();

  const handleClick = async (folderId) => {
    const res = await addStym({ folderId, stymId });
    if (res?.data?.status) {
      toast.success('Category added to Stym', {
        position: 'bottom-center',
        autoClose: 1000,
      });
    } else if (res?.data?.message === 'folder_in_stym_exists') {
      toast.warning("You've already added this to stym", {
        position: 'bottom-center',
      });
    }
  };

  return (
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
        Add category to Stym
      </MenuButton>
      <MenuList>
        {data?.folders.length === 0 && <MenuItem>No category</MenuItem>}
        {data?.folders?.map((folder) => (
          <MenuItem
            id={folder.id}
            key={folder.id}
            onClick={() => handleClick(folder.id)}
          >
            {folder.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
