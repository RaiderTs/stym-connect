import { ChevronDownIcon } from '@heroicons/react/solid';
import { useEditStymShareMutation } from '../../features/stymQuery';
import {
  Box,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
} from '@chakra-ui/react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSelector } from 'react-redux';
import { userSelector } from '../../selectors/auth';

export default function ContactsActions({
  userId,
  stymId,
  access,
  fetching,
  email,
}) {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useSelector(userSelector);
  const [editShare, { isLoading }] = useEditStymShareMutation();

  const handleSelect = async (e) => {
    const value = e.target.value;

    const formData = new FormData();
    formData.append('stym', stymId);
    formData.append('viewer', userId);
    formData.append('access', value);

    try {
      const res = await editShare(formData);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Box>
      <Menu isLazy={true}>
        {user.email !== email ? ( // * owner's email
          <Text textTransform={'capitalize'}>{access}</Text>
        ) : (
          <MenuButton
            textTransform={'capitalize'}
            as={Button}
            fontWeight='normal'
            variant='outline'
            fontSize={14}
            display='flex'
            rightIcon={
              isLoading ? (
                <LoadingSpinner color='text-my-orange flex' />
              ) : (
                <ChevronDownIcon className='w-4 ' />
              )
            }
          >
            {access}
          </MenuButton>
        )}
        <MenuList minWidth={'2rem'}>
          <MenuItem
            _hover={{ color: 'brand.200', bg: 'transparent' }}
            value={'viewer'}
            onClick={handleSelect}
          >
            Viewer
          </MenuItem>
          <MenuItem
            _hover={{ color: 'brand.200', bg: 'transparent' }}
            value='editor'
            onClick={handleSelect}
          >
            Editor
          </MenuItem>
          <MenuItem
            _hover={{ color: 'brand.200', bg: 'transparent' }}
            value='removed'
            onClick={handleSelect}
          >
            Remove
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
}
