import { Formik, Form, Field, FieldArray } from 'formik';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import React, { Fragment, useState } from 'react';
import Chevron from '../../components/svg/navigateBack.svg';
import AddUser from '../../components/svg/addUser.svg';
import DeleteUser from '../../components/svg/deleteUser.svg';
import AddGroup from '../../components/svg/collaborations.svg';
import Group from '../../components/svg/group.svg';
import Link from '../../components/svg/link.svg';
import { toaster } from '../../components/Toast';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { setSelected } from '../../features/modalSlice';
import LoadingSpinner from '../LoadingSpinner';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Button,
  useColorMode,
  Icon,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import CreatableSelect from 'react-select/creatable';
import {
  useGetUserContactsQuery,
  useGetListGroupsQuery,
  useCreatePublicLinkMutation,
} from '../../features/stymQuery';

export default function ShareMenu({
  onSubmit,
  isSharing = false,
  stymId = null,
  access = false,
}) {
  // { isLoading: isPublicLinkCreating }
  const [createPublicLink, result] = useCreatePublicLinkMutation();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const { colorMode } = useColorMode();
  const selected = useSelector((state) => state.modal.selected);
  // const options = useSelector((state) => state.modal.options);
  const dispatch = useDispatch();

  const { data, isLoading } = useGetUserContactsQuery();
  const {
    data: { groups } = [],
    isLoading: { loading },
  } = useGetListGroupsQuery();

  const validationSchema = Yup.object().shape({
    message: Yup.string(),
    email: Yup.array()
      .transform(function (value, originalValue) {
        if (this.isType(value) && value !== null) {
          return value;
        }
        return originalValue ? originalValue.split(/[\s,]+/) : [];
      })
      .of(Yup.string().email(({ value }) => `${value} is not a valid email`)),
    group: Yup.array().of(Yup.number()),
  });

  const handleSelect = (e) => {
    dispatch(setSelected({ value: e.target.value }));
    // console.log(e.target.value);
  };

  const optionsContact =
    data &&
    data?.contacts
      .filter((c) => c.email) // * filter out contacts without email
      .map((contact) => {
        const { email } = contact;
        return {
          value: email,
          label: email,
        };
      });

  const optionsGroup = groups?.map((group) => {
    return {
      value: group.id,
      label: group.name,
      icon: <Group />,
    };
  });

  const customStyles = {
    container: (provided) => ({
      ...provided,
    }),

    menu: (provided) => ({
      ...provided,
      textAlign: 'left',
      width: '20rem',

      backgroundColor: colorMode === 'dark' ? '#192642' : '#f7f8fa',
    }),

    control: (_) => ({
      display: 'flex',
      // backgroundColor: '#f7f8fa',

      backgroundColor: colorMode === 'dark' ? '#EAEEF266' : '#f7f8fa',
      borderRadius: 10,
      padding: '5px',
      width: '22rem',
    }),

    singleValue: (provided) => {
      return { ...provided, textAlign: 'left' };
    },
    placeholder: (provided) => {
      return {
        ...provided,
        color: colorMode === 'dark' ? '#f7f8fa' : '#9b9b9b',

        textAlign: 'left',
        fontSize: '14px',
      };
    },
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      // console.log(data);
      return {
        ...styles,
        ':active': {
          ...styles[':active'],
          backgroundColor: !isDisabled
            ? isSelected
              ? '#ff9c71'
              : '#e3e3e3'
            : undefined,
        },
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? '#ff8a58'
          : isFocused
          ? '#A0AEC0'
          : undefined,
        color: isDisabled ? undefined : isFocused ? 'black' : undefined,
      };
    },

    input: (provided, state) => {
      return {
        ...provided,
        color: colorMode === 'dark' ? '#ffffff' : '#172747',
      };
    },
  };

  const onCreatePublicLink = async (stymId) => {
    const formData = new FormData();
    formData.append('stym_id', stymId);
    try {
      const res = await createPublicLink(formData);
      const { data } = res;
      toaster({ type: 'success', message: 'Link copied' });
    } catch (error) {
      console.log(error);
    }
  };

  const actions = (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon className='w-4' />}
        fontWeight='normal'
        variant='outline'
        fontSize={14}
      >
        {selected.value === 'viewer' ? 'View' : 'Can edit'}
      </MenuButton>
      <MenuList fontSize={14} minWidth={'6rem'}>
        <MenuItem
          _hover={{ color: 'brand.200', bg: 'transparent' }}
          onClick={handleSelect}
          value='viewer'
        >
          View
        </MenuItem>
        <MenuItem
          _hover={{ color: 'brand.200', bg: 'transparent' }}
          onClick={handleSelect}
          value='editor'
        >
          Can edit
        </MenuItem>
      </MenuList>
    </Menu>
  );

  return (
    <div className='flex flex-col'>
      <Formik
        initialValues={{ email: '', message: '', group: '' }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({
          handleChange,
          values,
          isValid,
          touched,
          errors,
          setFieldValue,
        }) => {
          return (
            <Form className='flex flex-col'>
              {/* {console.log(errors)} */}
              <FieldArray
                name='email'
                render={(arrayHelpers) => (
                  <Box className='space-y-5'>
                    <button
                      type='button'
                      disabled={values.email.length >= 5 || isLoading}
                      className='flex items-center px-4 py-2 text-sm border rounded-10 hover:text-white border-my-orange text-my-orange hover:bg-my-orange disabled:opacity-50'
                      onClick={() => arrayHelpers.push('')}
                    >
                      <AddUser className='w-4 h-4 mr-2 hover:text-white ' />
                      Add email address
                    </button>
                    {values.email &&
                      values.email.length > 0 &&
                      values.email.map((email, index) => (
                        <div key={index} className='flex items-center w-full '>
                          <div className='flex items-center w-full h-10 text-sm rounded-10'>
                            {errors.email && touched.email}
                            <CreatableSelect
                              styles={customStyles}
                              placeholder='Select email address'
                              name={`email.${index}`}
                              id='email'
                              type='email'
                              options={optionsContact}
                              onChange={(selectedOption) =>
                                setFieldValue(
                                  `email.${index}`,
                                  selectedOption.value
                                )
                              }
                              components={{
                                IndicatorSeparator: () => null,
                              }}
                              getOptionLabel={(e) => (
                                <Box display='flex' alignItems='center'>
                                  <Box w='15px' h='15px'>
                                    {e.icon}
                                  </Box>
                                  <Box as='span' ml='5px' cursor='pointer'>
                                    {e.label}
                                  </Box>
                                </Box>
                              )}
                            />
                            <button
                              type='button'
                              onClick={() => arrayHelpers.remove(index)} // remove email
                              className='absolute flex items-center rounded-md cursor-pointer left-[89%]'
                            >
                              <DeleteUser className='w-4 h-4 transform pointer-events-none ' />
                            </button>
                          </div>
                        </div>
                      ))}
                  </Box>
                )}
              />
              {/* group */}
              <FieldArray
                name='group'
                render={(arrayHelpers) => (
                  <Box className='mt-4 space-y-5'>
                    <button
                      type='button'
                      disabled={values.email.length >= 5 || isLoading}
                      className='flex items-center px-4 py-2 text-sm border rounded-10 hover:text-white border-my-orange text-my-orange hover:bg-my-orange disabled:opacity-50'
                      onClick={() => arrayHelpers.push('')}
                    >
                      <AddGroup className='w-4 h-4 mr-2 hover:text-white ' />
                      Add group
                    </button>
                    {values.group &&
                      values.group.length > 0 &&
                      values.group.map((group, index) => (
                        <div key={index} className='flex items-center w-full '>
                          <div className='flex items-center w-full h-10 text-sm rounded-10'>
                            {errors.group && touched.group}
                            <CreatableSelect
                              styles={customStyles}
                              placeholder='Select group'
                              name={`group.${index}`}
                              id='group'
                              type='group'
                              options={optionsGroup}
                              onChange={(selectedOption) =>
                                setFieldValue(
                                  `group.${index}`,
                                  selectedOption.value
                                )
                              }
                              components={{
                                IndicatorSeparator: () => null,
                              }}
                              getOptionLabel={(e) => (
                                <Box display='flex' alignItems='center'>
                                  <Box w='15px' h='15px'>
                                    {e.icon}
                                  </Box>
                                  <Box as='span' ml='5px' cursor='pointer'>
                                    {e.label}
                                  </Box>
                                </Box>
                              )}
                            />
                            <button
                              type='button'
                              onClick={() => arrayHelpers.remove(index)} // remove email
                              className='absolute flex items-center rounded-md cursor-pointer left-[89%]'
                            >
                              <DeleteUser className='w-4 h-4 transform pointer-events-none ' />
                            </button>
                          </div>
                        </div>
                      ))}
                  </Box>
                )}
              />

              <div className='flex items-center justify-between mt-10'>
                <span>Anyone with this link can</span>
                <span>{actions}</span>
              </div>
              {/* message */}
              <p className='mt-10'>Add a message</p>
              <textarea
                className='w-full px-5 py-2 my-4 text-sm border-none outline-none bg-my-light-gray rounded-10 focus:outline-none'
                onChange={handleChange}
                value={values.massage}
                name='message'
                rows='1'
              />
              <Box display='flex' justifyContent='space-between'>
                {access === 'owner' && (
                  <CopyToClipboard text={`app.stymconnect.com/stym/${stymId}`}>
                    <Button
                      _focus={{ boxShadow: 'transparent' }}
                      onClick={() => {
                        onCreatePublicLink(stymId);
                      }}
                      leftIcon={<Link />}
                      variant='link'
                      color='brand.200'
                      fontWeight='400'
                      fontSize={14}
                    >
                      Make this stym public{' '}
                    </Button>
                  </CopyToClipboard>
                )}

                <Button
                  type='submit'
                  ml='auto'
                  borderRadius={30}
                  bg='brand.200'
                  color={'white'}
                  fontWeight='500'
                  _hover={{ bg: 'brand.200' }}
                  fontSize={14}
                  leftIcon={isSharing && <LoadingSpinner />}
                  disabled={!isValid}
                >
                  Share
                </Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
