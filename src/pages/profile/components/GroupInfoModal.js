import { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { toast } from 'react-toastify';

import {
  useRemoveGroupMutation,
  useEditGroupMutation,
} from '../../../features/stymQuery';

import Delete from '../../../components/svg/delete.svg';
import EditPhoto from '../../../components/svg/editPhoto.svg';

export default function GroupInfoModal(props) {
  const [removeGroup] = useRemoveGroupMutation();
  const [editGroupPhoto] = useEditGroupMutation();
  const [photo, setPhoto] = useState();

  console.log(props);

  useEffect(() => {
    const changePhoto = async () => {
      const data = new FormData();
      // data.append('name', props?.groupe?.name);
      data.append('file', photo);
      await editGroupPhoto({
        data,
        contactGroupId: props?.groupe?.id,
      });
    };
    photo && changePhoto();
  }, [photo]);

  const handlePhotoEdit = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleGroupRemove = async (contactId) => {
    try {
      const response = await removeGroup(contactId);
      const { data } = response;
      console.log(data.status);
      if (data.status) {
        toast.success('Group removed!', {
          position: 'bottom-center',
        });
      } else if (!data.status) {
        toast.error('Something went wrong. Try again', {
          position: 'bottom-center',
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Box p='4px 50px 30px 50px'>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          position='relative'
        >
          <img
            src={
              props?.groupe.image
                ? props?.groupe.image
                : photo
                ? URL.createObjectURL(photo)
                : '/profile_pic.png'
            }
            alt='img'
            width={150}
            className='object-cover rounded-full aspect-square'
          />
          <label
            htmlFor='groupPic'
            className='absolute bottom-0 left-[70px] cursor-pointer'
          >
            <EditPhoto className='flex mb-[4px]' />
          </label>
          <input
            type='file'
            accept='image/*'
            id='groupPic'
            name='groupPic'
            onChange={handlePhotoEdit}
          />
        </Box>

        <Text
          as='h2'
          mt='40px'
          fontWeight='500'
          fontSize='26px'
          lineHeight='100%'
        >
          Info
        </Text>

        <Text as='h3' mt='38px' fontSize='14px' lineHeight='21px'>
          {props?.groupe.description}
        </Text>

        <Text
          as='h3'
          mt='25px'
          fontSize='14px'
          lineHeight='21px'
          fontWeight='500'
        >
          Group name
        </Text>
        <Text as='p' mt='4px' fontSize='14px' lineHeight='21px'>
          {props?.groupe.name}
        </Text>

        <Text
          as='h3'
          mt='25px'
          fontSize='14px'
          lineHeight='21px'
          fontWeight='500'
        >
          Number of contacts in a group
        </Text>
        <Text as='p' mt='4px' fontSize='14px' lineHeight='21px'>
          {props?.groupe?.contacts?.length}
        </Text>

        <Text
          as='h3'
          mt='25px'
          fontSize='14px'
          lineHeight='21px'
          fontWeight='500'
        >
          Created
        </Text>
        <Text as='p' mt='4px' fontSize='14px' lineHeight='21px'>
          {props?.groupe?.createdAt
            ? props?.groupe?.createdAt
            : 'No creation date'}
        </Text>

        <Box
          mt='38px'
          display='flex'
          alignItems='center'
          role='button'
          color='red'
          onClick={() => {
            handleGroupRemove(props?.groupe.id);
            props?.setIsOpen(false);
          }}
        >
          <Box w='16px' h='16px' mr='8px'>
            <Delete />
          </Box>
          <Text fontSize='14px' lineHeight='21px'>
            Remove group
          </Text>
        </Box>
      </Box>
    </>
  );
}
