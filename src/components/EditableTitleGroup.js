import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
  Input,
  PopoverArrow,
  Popover,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
  useDisclosure,
  FormLabel,
  Heading,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { useState } from 'react';
import EditIcon from './svg/edit.svg';
import { useEditGroupMutation } from '../features/stymQuery';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { Field, Formik } from 'formik';
import LoadingSpinner from './LoadingSpinner';
import * as Yup from 'yup';
import { values } from 'lodash';

export default function EditableTitleGroup({
  group,
  contactGroupId,
  isLoadingGroup,
}) {
  const [editGroup, { isLoading }] = useEditGroupMutation();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { colorMode } = useColorMode;

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const onSubmit = async (values) => {
    const { name } = values;
    const data = new FormData();
    data.append('name', name);
    try {
      const res = await editGroup({
        data,
        contactGroupId: contactGroupId,
      });
      if (res.data.status) {
        toast.success('Name updated', {
          position: 'bottom-center',
          autoClose: 1000,
        });
      } else if (res.data.message === 'group_name_exists') {
        toast.error('Group with the same name already exists', {
          position: 'bottom-center',
          autoClose: 1500,
        });
      }
    } catch (error) {
      toast.error('Something went wrong!', {
        position: 'bottom-center',
        autoClose: 1000,
      });
      console.log(error);
    }
  };
  if (isLoading) {
    NProgress.start();
  } else {
    NProgress.done();
  }

  return (
    <Box position={'relative'} display='flex' alignItems='center'>
      <Box d='inline-block' mr={3}>
        <Tooltip
          label={group?.name}
          variant='my-tooltip'
          borderRadius='10px'
          // left='70px'
          placement='top-end'
          padding='5px 15px'
          backgroundColor={colorMode === 'dark' && '#0F2042'}
        >
          <Heading
            fontFamily={'inherit'}
            fontWeight='500'
            fontSize='68px'
            lineHeight='110%'
            className='max-w-[400px] truncate'
          >
            {group?.name}
          </Heading>
        </Tooltip>
      </Box>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement='bottom-start'
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <IconButton
            borderRadius='100%'
            width='40px'
            icon={<EditIcon className='w-5' />}
          />
        </PopoverTrigger>

        <PopoverContent p={5}>
          {!isLoadingGroup && (
            <Formik
              initialValues={{
                name: group?.name ? group?.name : '',
              }}
              onSubmit={onSubmit}
              validationSchema={validationSchema}
            >
              {({ handleSubmit, isValid }) => (
                <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                    <FormControl>
                      <FormLabel htmlFor='name'>Title</FormLabel>
                      <Field as={Input} id='name' name='name' type='text' />
                    </FormControl>

                    <ButtonGroup d='flex' justifyContent='flex-end'>
                      <Button
                        variant='outline'
                        borderRadius={30}
                        onClick={onClose}
                        fontWeight='normal'
                      >
                        Cancel
                      </Button>
                      <Button
                        color='white'
                        type='submit'
                        onClick={onClose}
                        borderRadius={30}
                        colorScheme='brand'
                        fontWeight='normal'
                        isDisabled={!isValid}
                      >
                        Save
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </form>
              )}
            </Formik>
          )}
        </PopoverContent>
      </Popover>
    </Box>
  );
}
