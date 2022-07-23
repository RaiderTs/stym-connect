import Dots from '../../components/svg/dots.svg';
import ContactsActions from './ContactsActions';
import {
  Box,
  useColorMode,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@chakra-ui/react';

export default function ContactsMenu({ users, owner, stymId, fetching }) {
  const { colorMode } = useColorMode();
  return (
    <>
      <Popover placement='bottom-end'>
        <PopoverTrigger>
          <IconButton borderRadius={'100%'}>
            <Dots className='w-6' />
          </IconButton>
        </PopoverTrigger>
        <PopoverContent
          _focus={{ boxShadow: 'none' }}
          borderRadius={30}
          w='fit-content'
        >
          <PopoverBody>
            <Box className='grid gap-3 p-4'>
              <Box className='flex items-center justify-between gap-12 p-2'>
                <div className='flex items-center justify-center'>
                  <img
                    src={owner?.image || '/profile_pic.png'}
                    alt='owner avatar'
                    className='object-cover w-12 rounded-full aspect-square'
                  />
                  <div className='ml-4'>
                    <Tooltip
                      label={owner?.name}
                      variant='my-tooltip'
                      borderRadius='10px'
                      left='5px'
                      placement='top-start'
                      padding='5px 15px'
                      backgroundColor={colorMode === 'dark' && '#0F2042'}
                    >
                      <p className='max-w-[200px] truncate text-sm font-medium '>
                        {owner?.name}
                      </p>
                    </Tooltip>
                  </div>
                </div>
                <span>Owner</span>
              </Box>

              {users &&
                users.map(
                  ({ firstName, lastName, email, id, image, access }) => (
                    <div
                      key={id}
                      className='flex items-center justify-between gap-12 p-2 rounded-lg'
                    >
                      <Box className='flex items-center justify-center '>
                        <img
                          src={image || '/profile_pic.png'}
                          alt={firstName || email}
                          className='object-cover w-12 rounded-full aspect-square'
                        />
                        <Box className='ml-4'>
                          <Tooltip
                            label={
                              firstName && lastName
                                ? `${firstName}  ${lastName}`
                                : email || 'N/A'
                            }
                            variant='my-tooltip'
                            borderRadius='10px'
                            left='5px'
                            placement='top-start'
                            padding='5px 15px'
                            backgroundColor={colorMode === 'dark' && '#0F2042'}
                          >
                            <p className='text-sm font-medium max-w-[200px] truncate'>
                              {firstName && lastName
                                ? `${firstName}  ${lastName}`
                                : email || 'N/A'}
                            </p>
                          </Tooltip>
                        </Box>
                      </Box>
                      <ContactsActions
                        access={access}
                        userId={id}
                        stymId={stymId}
                        fetching={fetching}
                        email={owner.email} // * if stym is not yours you can't edit contacts access
                      />
                    </div>
                  )
                )}
            </Box>
            {/* </Box> */}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
}
