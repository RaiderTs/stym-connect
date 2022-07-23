import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Create from '../../components/svg/create.svg';
import Info from '../../components/svg/info.svg';
import Delete from '../../components/svg/delete.svg';
import Dots from '../../components/svg/dots.svg';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { userSelector } from '../../selectors/auth';
import {
  useCreateContactMutation,
  useGetUserContactsQuery,
  useCreateGroupMutation,
  useGetListGroupsQuery,
  useRemoveGroupMutation,
  useRemoveUserContactsMutation,
  useEditGroupMutation,
} from '../../features/stymQuery';
import ProfileLayout from './components/ProfileLayout';
import Modal from '../../components/Modal';
import CreateContactModal from './components/CreateContactModal';
import CreateGroupModal from './components/CreateGroupModal';
import ContactInfoModal from './components/ContactInfoModal';
import GroupInfoModal from './components/GroupInfoModal';
import second from '../../components/Formik/FormikController';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Skeleton,
  //
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';

export default function Contacts() {
  const router = useRouter();

  const [buttonName, setButtonName] = useState('+Contact');
  const [isOpenContact, setIsOpenContact] = useState(false);
  const [isOpenCreateGroup, setIsOpenCreateGroup] = useState(false);
  const [isOpenContactInfo, setIsOpenContactInfo] = useState();
  const [isOpenGroupInfo, setIsOpenGroupInfo] = useState();
  const [activeContact, setActiveContact] = useState();
  const [activeGroup, setActiveGroup] = useState();
  const [submitError, setSubmitError] = useState(false);
  const user = useSelector(userSelector);
  const [editGroup] = useEditGroupMutation();
  const [createContact] = useCreateContactMutation();
  const [createGroup] = useCreateGroupMutation();
  const [removeGroup] = useRemoveGroupMutation();
  const [removeUserContacts] = useRemoveUserContactsMutation();
  const { data: { contacts } = [], isLoading } = useGetUserContactsQuery();
  const {
    data: { groups } = [],
    isLoading: { loading },
  } = useGetListGroupsQuery();

  const onSubmit = async (values, number) => {
    const formData = new FormData();

    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('email', values.email);
    formData.append('phone', number);
    formData.append('nickName', `@${values.nickName}`);

    try {
      const response = await createContact(formData);
      const { data } = response;
      if (data.status) {
        toast.success('Contact created!', {
          position: 'bottom-center',
        });
        setSubmitError(false);
        setIsOpenContact(false);
      }
      if (!data.status) {
        toast.error('Something went wrong. Try again', {
          position: 'bottom-center',
        });
        setSubmitError(true);
        setIsOpenContact(true);
      } else if (data.message.includes('exists')) {
        toast.error('User by this nickname already exists. Try again', {
          position: 'bottom-center',
        });
        setSubmitError(true);
        setIsOpenContact(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmitGroup = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    values.description && formData.append('description', values.description);
    try {
      const res = await createGroup(formData);
      // console.log(res, 'res create group');
      const { data } = res;
      if (data.status) {
        toast.success('Group created!', {
          position: 'bottom-center',
        });
      } else if (!data.status) {
        toast.error('Something went wrong. Try again', {
          position: 'bottom-center',
        });
      }
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

  const handleClick = async (contactId) => {
    try {
      const response = await removeUserContacts(contactId);
      const { data } = response;
      //  console.log(data.status);
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

  const handleGroupRemove = async (contactId) => {
    try {
      const response = await removeGroup(contactId);
      const { data } = response;
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

  const options = [
    {
      id: 0,
      title: 'Contact info',
      icon: <Info className='w-4 mr-2' aria-hidden='true' />,
      handleClick: () => null,
    },
    {
      id: 1,
      title: 'Remove contact',

      handleClick: () => null,
    },
  ];

  return (
    <ProfileLayout>
      <Tabs width='100%' isLazy>
        <TabList
          display='flex'
          alignItems='center'
          justifyContent='center'
          borderBottom='none'
        >
          <Tab
            index='tab-1'
            fontWeight='500'
            fontSize='26px'
            lineHeight='100%'
            padding='2px 0'
            onClick={() => setButtonName('+Contact')}
            mr='6px'
            _active={{
              bg: 'transparent',
            }}
            _focus={{ borderColor: 'transparent' }}
            _selected={{ color: 'brand.200', borderBottom: '2px' }}
          >
            All
          </Tab>
          <Tab
            index='tab-2'
            fontWeight='500'
            fontSize='26px'
            lineHeight='100%'
            padding='2px 0'
            onClick={() => setButtonName('+Group')}
            ml='6px'
            _active={{
              bg: 'transparent',
            }}
            _focus={{ borderColor: 'transparent' }}
            _selected={{ color: 'brand.200', borderBottom: '2px' }}
          >
            Groups
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {user?.tariff === null && (
              <div className='mt-[30px]'>
                <div className='mb-8 text-2xl font-medium text-center md:mb-12'>
                  Get a subscription to be able to create contacts
                </div>
              </div>
            )}

            {user?.tariff && contacts?.length === 0 && (
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
                  You don’t have any contacts yet. Just add one
                </Text>
                <button
                  className='w-[70px] h-[70px] mt-[31px]'
                  onClick={() => setIsOpenContact(!isOpenContact)}
                >
                  <Create />
                </button>
              </Box>
            )}
            <Box display='flex' justifyContent='space-between' mt='90px'>
              <Box width='85%'>
                <div className='flex flex-col-reverse gap-5 md:my-0 basis-1/2'>
                  {isLoading && (
                    <>
                      <Skeleton width='100%' height='2rem' borderRadius={10} />
                      <Skeleton width='100%' height='2rem' borderRadius={10} />
                      <Skeleton width='100%' height='2rem' borderRadius={10} />
                    </>
                  )}

                  {contacts?.length !== 0 &&
                  contacts !== undefined &&
                  user?.tariff !== null
                    ? contacts.map((contact) => {
                        return (
                          <div
                            key={contact.id}
                            className='flex items-center justify-between w-full '
                          >
                            <div
                              className='flex items-center gap-4 truncate cursor-pointer'
                              onClick={() => {
                                setIsOpenContactInfo(!isOpenContactInfo);
                                setActiveContact(contact);
                              }}
                            >
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
                                  onClick={() => handleClick(contact.contactId)}
                                >
                                  Remove contact
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </div>
                        );
                      })
                    : !isLoading}
                </div>
                <Modal
                  isOpen={isOpenContact}
                  setIsOpen={setIsOpenContact}
                  title='Create contact'
                >
                  <CreateContactModal
                    action='Create'
                    onSubmit={onSubmit}
                    setIsOpen={setIsOpenContact}
                    isError={submitError}
                  />
                </Modal>
              </Box>
              <Box>
                {contacts?.length !== 0 &&
                  contacts !== undefined &&
                  contacts !== null && (
                    <button
                      className='order-2 px-4 py-2 border border-my-orange text-my-orange self-baseline rounded-30 hover:text-white hover:bg-my-orange'
                      onClick={() => setIsOpenContact(!isOpenContact)}
                    >
                      {buttonName}
                    </button>
                  )}
              </Box>
            </Box>
          </TabPanel>
          <TabPanel>
            {user?.tariff === null && (
              <div className='mt-[30px]'>
                <div className='mb-8 text-2xl font-medium text-center md:mb-12'>
                  Get a subscription to be able to create group
                </div>
              </div>
            )}

            {(user?.tariff && groups?.length === 0) ||
              (user?.tariff && groups?.length === undefined && (
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
                  >
                    You don’t have any groups yet. Just add one
                  </Text>
                  <button
                    className='w-[70px] h-[70px] mt-[31px] '
                    onClick={() => setIsOpenCreateGroup(!isOpenCreateGroup)}
                  >
                    <Create />
                  </button>
                </Box>
              ))}
            <Box display='flex' justifyContent='space-between' mt='90px'>
              <Box width='85%'>
                <div className='flex flex-col-reverse gap-5 md:my-0 basis-1/2'>
                  {loading && (
                    <>
                      <Skeleton width='100%' height='2rem' borderRadius={10} />
                      <Skeleton width='100%' height='2rem' borderRadius={10} />
                      <Skeleton width='100%' height='2rem' borderRadius={10} />
                    </>
                  )}

                  {groups?.length !== 0 &&
                  groups !== undefined &&
                  groups !== null &&
                  user?.tariff !== null
                    ? groups?.map((group) => {
                        return (
                          <div
                            key={group.id}
                            className='flex items-center justify-between w-full '
                          >
                            <div
                              className='flex items-center gap-4 truncate cursor-pointer'
                              onClick={() => {
                                // setIsOpenGroupInfo(!isOpenGroupInfo);
                                setActiveGroup(group);
                              }}
                            >
                              <img
                                src={group.image || '/profile_pic.png'}
                                alt={group.name}
                                width={50}
                                className='object-cover rounded-full aspect-square'
                              />
                              <Link href={`/group/${group.id}`}>
                                <a>
                                  <span className='truncate'>
                                    {group.name || 'N/A'}
                                  </span>
                                </a>
                              </Link>
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
                                    setIsOpenGroupInfo(!isOpenGroupInfo);
                                    setActiveGroup(group);
                                  }}
                                >
                                  Group info
                                </MenuItem>
                                <MenuItem
                                  _hover={{
                                    color: 'brand.200',
                                    bg: 'transparent',
                                  }}
                                  icon={<Delete className='w-4' />}
                                  onClick={() => handleGroupRemove(group.id)}
                                >
                                  Remove group
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </div>
                        );
                      })
                    : !loading}
                </div>
                <Modal
                  isOpen={isOpenCreateGroup}
                  setIsOpen={setIsOpenCreateGroup}
                  title='Create group'
                >
                  <CreateGroupModal
                    action='Create'
                    onSubmit={onSubmitGroup}
                    setIsOpen={setIsOpenCreateGroup}
                  />
                </Modal>
              </Box>
              <Box>
                {groups?.length !== 0 &&
                  groups !== undefined &&
                  groups !== null && (
                    <button
                      className='order-2 px-4 py-2 border border-my-orange text-my-orange self-baseline rounded-30 hover:text-white hover:bg-my-orange'
                      onClick={() => setIsOpenCreateGroup(!isOpenCreateGroup)}
                    >
                      {buttonName}
                    </button>
                  )}
              </Box>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      {/* Contact modal */}
      <Modal
        isOpen={isOpenContactInfo}
        setIsOpen={setIsOpenContactInfo}
        title='Contact info'
        paddingLeft='50px'
        paddingRight='50px'
      >
        <ContactInfoModal
          action='Delete contact'
          onSubmit={onSubmitContactInfo}
          setIsOpen={setIsOpenContactInfo}
          contact={activeContact}
        />
      </Modal>
      {/*  */}
      {/* Group modal */}
      <Modal
        isOpen={isOpenGroupInfo}
        setIsOpen={setIsOpenGroupInfo}
        title='Group info'
        paddingLeft='50px'
        paddingRight='50px'
      >
        <GroupInfoModal
          action='Delete contact'
          onSubmit={onSubmitGroupInfo}
          setIsOpen={setIsOpenGroupInfo}
          groupe={activeGroup}
        />
      </Modal>
      {/*  */}
    </ProfileLayout>
  );
}
