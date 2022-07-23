import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Create from '../../components/svg/create.svg';
import Info from '../../components/svg/info.svg';
import Delete from '../../components/svg/delete.svg';
import Dots from '../../components/svg/dots.svg';
import EditPhoto from '../../components/svg/editPhotoSmall.svg';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import NProgress from 'nprogress';
import {
  useCreateContactMutation,
  useRemoveContactInGroupMutation,
  useEditGroupMutation,
  useGetGroupContactsQuery,
} from '../../features/stymQuery';
import Modal from '../../components/Modal';
import AddContactModal from './components/AddContactModal';
import ContactInfoModal from '../profile/components/ContactInfoModal';
import Layout from '../../components/Layout';

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Skeleton,
  Box,
  Text,
} from '@chakra-ui/react';
import EditableTitleGroup from '../../components/EditableTitleGroup';

export default function Group() {
  // id group
  const router = useRouter();
  const { id } = router?.query;

  const [isOpenContact, setIsOpenContact] = useState(false);
  const [isOpenContactInfo, setIsOpenContactInfo] = useState();
  const [activeContact, setActiveContact] = useState();
  const [activeGroup, setActiveGroup] = useState();

  const [editGroupPhoto, result] = useEditGroupMutation();
  const [createContact] = useCreateContactMutation();
  const [removeContactInGroup] = useRemoveContactInGroupMutation();
  const { data = {}, isLoading } = useGetGroupContactsQuery(id);

  const { group } = data;

  const [photo, setPhoto] = useState();

  useEffect(() => {
    const changePhoto = async () => {
      const data = new FormData();
      data.append('file', photo);
      await editGroupPhoto({
        data,
        contactGroupId: group?.id,
      });
    };
    photo && changePhoto();
  }, [photo]);

  if (result?.isLoading) {
    NProgress.start();
  } else {
    NProgress.done();
  }

  const handlePhotoEdit = (e) => {
    setPhoto(e.target.files[0]);
  };

  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('email', values.email);
    formData.append('phone', values.phone);

    try {
      const res = await createContact(formData);
      console.log(res, 'res create contact');
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmitContactInfo = async (values) => {
    console.log(values);
  };

  const onSubmitGroupInfo = async (values) => {
    console.log(values);
  };

  return (
    <Layout>
      <Box display='flex'>
        <Box position='relative' mr='27px'>
          <label
            htmlFor='groupPic'
            className='absolute bottom-[-4px] left-[-7px] cursor-pointer '
          >
            <EditPhoto style={{ width: '32px', height: '32px' }} />
          </label>
          <img
            src={
              group?.image
                ? group?.image
                : photo
                ? URL.createObjectURL(photo)
                : '/profile_pic.png'
            }
            alt='img'
            width={77}
            className='object-cover rounded-full aspect-square'
          />
          <input
            type='file'
            accept='image/*'
            id='groupPic'
            name='groupPic'
            onChange={handlePhotoEdit}
          />
        </Box>
        {/* <Text as='h1' fontWeight='500' fontSize='68px' lineHeight='110%'> */}
        {/* {group?.name} */}
        <EditableTitleGroup
          group={group}
          contactGroupId={id}
          isLoadingGroup={isLoading}
        />
        {/* </Text> */}
      </Box>

      <Box display='flex' justifyContent='space-between' mt='60px'>
        <Box width='85%'>
          <div className='flex flex-col-reverse gap-5 md:my-0 basis-1/2'>
            {isLoading && (
              <>
                <Skeleton width='100%' height='2rem' borderRadius={10} />
                <Skeleton width='100%' height='2rem' borderRadius={10} />
                <Skeleton width='100%' height='2rem' borderRadius={10} />
              </>
            )}
            {group?.contacts?.length !== 0 && group?.contacts !== null
              ? group?.contacts?.map((contact) => {
                  return (
                    <div
                      key={contact.id}
                      className='flex items-center justify-between w-full '
                    >
                      <div className='flex items-center gap-4 truncate'>
                        <img
                          src={contact.image || '/profile_pic.png'}
                          alt={contact.name}
                          width={50}
                          className='object-cover rounded-full aspect-square'
                        />
                        <span className='truncate'>
                          {contact.name || contact.email || 'N/A'}
                        </span>
                      </div>

                      <Menu>
                        <MenuButton>
                          <Dots className='w-7' />
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            _hover={{
                              color: 'brand.200',
                              bg: 'transparent',
                            }}
                            icon={<Info className='w-4' />}
                            onClick={() => {
                              setIsOpenContactInfo(!isOpenContactInfo);
                              setActiveContact(contact);
                            }}
                          >
                            Contact info
                          </MenuItem>

                          <MenuItem
                            _hover={{
                              color: 'brand.200',
                              bg: 'transparent',
                            }}
                            icon={<Delete className='w-4' />}
                            onClick={() =>
                              removeContactInGroup({
                                contactId: contact.contactId,
                                contactGroupId: id,
                              })
                            }
                          >
                            Remove contact from group
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </div>
                  );
                })
              : !isLoading &&
                group?.contacts === null && (
                  <Box
                    mt='56px'
                    display='flex'
                    alignItems='center'
                    flexDirection='column'
                  >
                    <Text
                      as='h4'
                      fontWeight='500'
                      fontSize='42px'
                      lineHeight='110%'
                      // textAlign='Center'
                    >
                      You don&apos;t have contacts in this group yet. Just add
                      one
                    </Text>
                    <button
                      className='w-[70px] h-[70px] mt-[31px]'
                      onClick={() => {
                        setIsOpenContact(!isOpenContact);
                        setActiveGroup(group?.id);
                      }}
                    >
                      <Create />
                    </button>
                  </Box>
                )}
          </div>
          <Modal
            isOpen={isOpenContact}
            setIsOpen={setIsOpenContact}
            title='Add contact in group'
            alignItems='baseLine'
          >
            <AddContactModal
              action='AddContact'
              onSubmit={onSubmit}
              setIsOpen={setIsOpenContact}
              contactGroupId={activeGroup}
            />
          </Modal>

          {/* Contact info modal  */}
          <Modal
            isOpen={isOpenContactInfo}
            setIsOpen={setIsOpenContactInfo}
            title='Contact info'
            paddingLeft='50px'
            paddingRight='50px'
          >
            <ContactInfoModal
              action='info'
              onSubmit={onSubmitContactInfo}
              setIsOpen={setIsOpenContactInfo}
              contact={activeContact}
            />
          </Modal>
        </Box>
        {group?.contacts !== null && (
          <Box>
            <button
              className='order-2 px-4 py-2 border border-my-orange text-my-orange self-baseline rounded-30 hover:text-white hover:bg-my-orange'
              onClick={() => {
                setIsOpenContact(!isOpenContact);
                setActiveGroup(group?.id);
              }}
            >
              +Contact
            </button>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
