import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import CreatableSelect from 'react-select/creatable';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Button,
  useColorMode,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import LoadingSpinner from '../../../components/LoadingSpinner';

import {
  useGetUserContactsQuery,
  useAddContactInGroupMutation,
} from '../../../features/stymQuery';

import AddUser from '../../../components/svg/addUser.svg';
import DeleteUser from '../../../components/svg/deleteUser.svg';

const AddContactModal = ({ contactGroupId, setIsOpen }) => {
  const { data, isLoading } = useGetUserContactsQuery();
  const [addContactInGroup] = useAddContactInGroupMutation();
  const { colorMode } = useColorMode();

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
          ? '#e3e3e3'
          : undefined,
      };
    },

    input: (provided, state) => {
      return {
        ...provided,
        color: colorMode === 'dark' ? '#ffffff' : '#172747',
      };
    },
  };

  const onSubmit = async (values) => {
    for (let x = 0; x < values.email.length; x++) {
      const options = {
        contactId: values.email[x],
        contactGroupId: contactGroupId,
      };
      try {
        const response = await addContactInGroup(options);
        const { data } = response;
        if (data.status) {
          toast.success('Contact added!', {
            position: 'bottom-center',
          });
        } else if (!data.status) {
          toast.error('The contact is already in one of the groups', {
            position: 'bottom-center',
          });
        }
        setIsOpen(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const options =
    data &&
    data?.contacts
      .filter((c) => c.email) // * filter out contacts without email
      .map((contact) => {
        const { email } = contact;
        return {
          value: contact.contactId,
          label: email,
        };
      });

  return (
    <>
      <div className='flex flex-col'>
        <Formik
          initialValues={{ email: '' }}
          //   validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({
            handleChange,
            values,

            touched,
            errors,
            setFieldValue,
          }) => {
            return (
              <Form className='flex flex-col'>
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
                          <div
                            key={index}
                            className='flex items-center w-full '
                          >
                            <div className='flex items-center w-full h-10 text-sm rounded-10'>
                              {errors.email && touched.email}
                              <CreatableSelect
                                styles={customStyles}
                                placeholder='Select email address or type to add'
                                name={`email.${index}`}
                                id='email'
                                type='email'
                                options={options}
                                onChange={(selectedOption) =>
                                  setFieldValue(
                                    `email.${index}`,
                                    selectedOption.value
                                  )
                                }
                                components={{
                                  IndicatorSeparator: () => null,
                                }}
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

                <Button
                  mt='20px'
                  type='submit'
                  ml='auto'
                  borderRadius={30}
                  bg='brand.200'
                  color={'white'}
                  fontWeight='500'
                  _hover={{ bg: 'brand.200' }}
                  fontSize={14}
                  disabled={values.email.length === 0}
                  isLoading={isLoading}
                >
                  + Add
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </>
  );
};

export default AddContactModal;
