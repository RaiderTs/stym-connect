import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useRemoveUserContactsMutation } from '../../../features/stymQuery';

import Delete from '../../../components/svg/delete.svg';

export default function ContactInfoModal(props) {
  console.log(props);

  const [removeUserContacts] = useRemoveUserContactsMutation();
  const handleClick = async (contactId) => {
    try {
      const response = await removeUserContacts(contactId);
      const { data } = response;
      if (data.status) {
        toast.success('Contact removed!', {
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
        <Box display='flex' alignItems='center' justifyContent='center'>
          <img
            src={props.contact.image || '/profile_pic.png'}
            alt='img'
            width={150}
            className='object-cover rounded-full aspect-square'
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

        <Text
          as='h3'
          mt='38px'
          fontSize='14px'
          lineHeight='21px'
          fontWeight='500'
        >
          Profile Name
        </Text>
        <Text as='h3' mt='4px' fontSize='14px' lineHeight='21px'>
          {props.contact.name}
        </Text>

        <Text
          as='h3'
          mt='25px'
          fontSize='14px'
          lineHeight='21px'
          fontWeight='500'
        >
          Nickname
        </Text>
        <Text as='h3' mt='4px' fontSize='14px' lineHeight='21px'>
          {props.contact.nickName}
        </Text>

        <Text
          as='h3'
          mt='25px'
          fontSize='14px'
          lineHeight='21px'
          fontWeight='500'
        >
          Email
        </Text>
        <Text as='p' mt='4px' fontSize='14px' lineHeight='21px'>
          {props.contact.email}
        </Text>

        {props?.contact?.group?.name && (
          <>
            <Text as='h3' mt='35px' fontSize='14px' lineHeight='21px'>
              Group
            </Text>
            <Text as='p' mt='4px' fontSize='14px' lineHeight='21px'>
              {props?.contact?.group?.name}
            </Text>
          </>
        )}

        <Box
          mt='38px'
          display='flex'
          alignItems='center'
          role='button'
          color='red'
          onClick={() => {
            handleClick(props.contact.contactId);
            props.setIsOpen(false);
          }}
        >
          <Box w='16px' h='16px' mr='8px'>
            <Delete />
          </Box>
          <Text fontSize='14px' lineHeight='21px'>
            Remove contact
          </Text>
        </Box>
      </Box>
    </>
  );
}
