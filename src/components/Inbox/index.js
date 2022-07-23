import React, { useState } from 'react';
import CheckIcon from '../svg/check-circle.svg';
import CheckIconArrow from '../svg/circledUpRight.svg';
import Delete from '../svg/delete.svg';
import ArrowRight from '../svg/arrow-right-p.svg';
import ArrowLeft from '../svg/arrow-left-p.svg';
import {
  useInboxUnreadMutation,
  useInboxReadMutation,
  useRemoveInboxMutation,
  useInboxQuery,
} from '../../features/stymQuery';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { useSelector } from 'react-redux';
import { userSelector } from '../../selectors/auth';
import { InboxItem } from './InboxItem';
import {
  Box,
  Checkbox,
  Text,
  useColorMode,
  useMediaQuery,
} from '@chakra-ui/react';

export function Inbox() {
  const user = useSelector(userSelector);
  const [isSelected, setIsSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [sm] = useMediaQuery('(min-width: 640px)');

  const { data, isLoading, isFetching } = useInboxQuery({
    page: currentPage,
    limit: 10,
  });
  const [inboxUnread, { result: resultUnreadFile }] = useInboxUnreadMutation();
  const [inboxRead, { result: resultReadFile }] = useInboxReadMutation();
  const [removeInbox, { result: resultRemoveFile }] = useRemoveInboxMutation();

  if (isFetching) {
    NProgress.start();
  } else {
    NProgress.done();
  }

  const { colorMode } = useColorMode();

  const handleUnreadClick = () => {
    isSelected.map(async (item) => {
      try {
        const res = await inboxUnread(item);
        const { data } = res;
        if (data.status) {
          toast.success('File marked as unread', {
            position: 'bottom-center',
          });
          setIsSelected([]);
        } else {
          toast.error('Something went wrong, please try again later', {
            position: 'bottom-center',
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  const handleReadClick = () => {
    isSelected.map(async (item) => {
      try {
        const res = await inboxRead(item);
        const { data } = res;
        if (data.status) {
          toast.success('File marked as read', {
            position: 'bottom-center',
          });
          setIsSelected([]);
        } else {
          toast.error('Something went wrong, please try again later', {
            position: 'bottom-center',
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  const handleDeleteClick = () => {
    isSelected.map(async (item) => {
      try {
        const res = await removeInbox(item);
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
      } catch (error) {
        console.log(error);
      }
    });
  };

  const handleChange = (e) => {
    if (e.target.checked) {
      setIsSelected([...isSelected, Number(e.target.id)]);
    } else {
      setIsSelected(isSelected.filter((id) => id !== Number(e.target.id)));
    }
  };

  const handleClickBack = () => {
    if (currentPage === 1) return;
    setCurrentPage((page) => page - 1);
  };

  const handleClick = () => {
    if (currentPage === data?.counter?.countPages) return;
    setCurrentPage((page) => page + 1);
  };

  return (
    <div className=' h-[100vh]'>
      <h1 className='mb-12 text-5xl font-medium'>Inbox</h1>
      <Box experimental_spaceY={6}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          {isSelected.length !== 0 && (
            <Box display='flex'>
              <Box
                as='button'
                display='flex'
                alignItems='center'
                cursor='pointer'
                onClick={handleReadClick}
                color={colorMode === 'light' ? 'brand-black.500' : 'white'}
              >
                <CheckIcon />
                <Text ml='10px' fontSize={sm ? '16px' : '12px'}>
                  {' '}
                  Mark as read
                </Text>
              </Box>
              <Box
                as='button'
                ml='48px'
                display='flex'
                alignItems='center'
                cursor='pointer'
                onClick={handleUnreadClick}
                color='#FF6A2A'
                // color={colorMode === 'light' ? 'brand' : 'white'}
              >
                <CheckIconArrow width='16' height='16' />
                <Text ml='10px' fontSize={sm ? '16px' : '12px'}>
                  {' '}
                  Mark as unread
                </Text>
              </Box>
              <Box
                as='button'
                display='flex'
                alignItems='center'
                cursor='pointer'
                color='red'
                ml='48px'
                onClick={handleDeleteClick}
              >
                <Box w='16px' h='16px'>
                  <Delete />
                </Box>
                <Text ml='10px' fontSize={sm ? '16px' : '12px'}>
                  {' '}
                  Delete
                </Text>
              </Box>
            </Box>
          )}

          <Box display='flex' gap={4} ml='auto' paddingRight={!sm ? 16 : ''}>
            <Text>{`${currentPage}${
              data?.counter?.countPages ? `-${data?.counter?.countPages}` : ''
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
        </Box>
        {data?.inbox?.map(
          (item) =>
            item.info && (
              <Box
                display='flex'
                flexDirection={!sm ? 'column' : ''}
                gap={!sm ? 4 : ''}
                with='100%'
                key={item.id}
              >
                <Checkbox
                  mr='16px'
                  size='lg'
                  colorScheme='brand'
                  _focus={{ boxShadow: 'transparent' }}
                  id={item.id}
                  name={item.id}
                  isChecked={isSelected.includes(Number(item.id))}
                  onChange={handleChange}
                  borderColor={colorMode === 'light' ? 'gray.200' : 'white'}
                />
                <InboxItem key={item.id} itemInbox={item} />
              </Box>
            )
        )}
      </Box>
    </div>
  );
}
