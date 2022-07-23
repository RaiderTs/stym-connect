import React, { useState } from 'react';
import { useRouter } from 'next/router';
import md5 from 'md5';
import axios from 'axios';
import { toast } from 'react-toastify';
import fileDownload from 'js-file-download';
import Dots from '../../../components/svg/dots.svg';
import Share from '../../../components/svg/shareAlbum.svg';
import Delete from '../../../components/svg/delete.svg';
import Download from '../../../components/svg/downloadAlbum.svg';
import {
  Menu,
  Button,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Icon,
} from '@chakra-ui/react';
export default function DocumentMenu({
  handleDelete,
  setIsOpenShare,
  isOpenShare,
  id,
  link,
  name,
}) {
  const router = useRouter();
  const handleDownload = async () => {
    try {
      // const handleDownloadFile = (link, name) => {
      //   const id = toast.loading('Downloading...', {
      //     position: 'bottom-right',
      //   });
      //   axios
      //     .get(link, {
      //       responseType: 'blob',
      //     })
      //     .then((res) => {
      //       res &&
      //         toast.update(id, {
      //           render: 'File downloaded',
      //           type: 'success',
      //           isLoading: false,
      //           autoClose: 50,
      //           position: 'bottom-center',
      //         });
      //       !res &&
      //         toast.update(id, {
      //           render: 'Something went wrong!',
      //           type: 'error',
      //           isLoading: false,
      //           autoClose: 50,
      //           position: 'bottom-center',
      //         });
      //       fileDownload(res.data, name);
      //     })
      //     .catch(() => {
      //       toast.update(id, {
      //         render: 'Something went wrong!',
      //         type: 'error',
      //         isLoading: false,
      //         autoClose: 5,
      //         position: 'bottom-center',
      //       });
      //       toast.clearWaitingQueue();
      //     });
      //   return;
      // };
      // handleDownloadFile(link, name);
      router.replace(link);
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: 'Something went wrong!',
        type: 'error',
        isLoading: false,
        autoClose: 1000,
        position: 'bottom-center',
      });
    }
  };

  return (
    <Menu>
      <MenuButton
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
        _focus={{ outline: 'none' }}
        backgroundColor={'transparent'}
        as={IconButton}
      >
        <Dots className='w-6' />
      </MenuButton>
      <MenuList minWidth={'4rem'}>
        <MenuItem
          _hover={{ color: 'brand.200', bg: 'transparent' }}
          icon={<Share className='w-4' />}
          onClick={() => setIsOpenShare(!isOpenShare)}
        >
          Share
        </MenuItem>
        <MenuItem
          as={'a'}
          cursor='pointer'
          onClick={handleDownload}
          _hover={{ color: 'brand.200', bg: 'transparent' }}
          icon={<Download className='w-4' />}
        >
          Download
        </MenuItem>
        <MenuItem
          _hover={{ color: 'brand.200', bg: 'transparent' }}
          icon={<Delete className='w-4' />}
          onClick={() => handleDelete(id)}
        >
          Delete
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
