import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
  Input,
  Tooltip,
  PopoverArrow,
  Popover,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
  useDisclosure,
  FormLabel,
  Heading,
  useColorMode,
} from '@chakra-ui/react';
import { useState } from 'react';
import EditIcon from './svg/edit.svg';
import { useEditStymCoverMutation } from '../features/stymQuery';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { Field, Formik } from 'formik';
import LoadingSpinner from './LoadingSpinner';
import * as Yup from 'yup';
import { values } from 'lodash';

export default function EditableTextField({ name, stymId, access, singer }) {
  const [editStymName, { isLoading }] = useEditStymCoverMutation();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { colorMode } = useColorMode;

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Name is required'),
  });

  const onSubmit = async (values) => {
    const { name, title } = values;
    const formData = new FormData();
    formData.append('name', title);
    formData.append('singer', name);
    const options = { stymId, body: formData };

    if (access === 'owner') {
      try {
        const res = await editStymName(options);
        if (res.data.message === 'no edit access') {
          toast.error("You can't edit this stym", {
            position: 'bottom-center',
          });
        } else if (res.data.status === false) {
          toast.error(res.data.message, {
            position: 'bottom-center',
          });
        }
        // refetch();
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (isLoading) {
    NProgress.start();
  } else {
    NProgress.done();
  }
  return (
    <Box position={'relative'} display='flex'>
      <Box d='inline-block' mr={3} sx>
        <Tooltip
          label={name}
          variant='my-tooltip'
          borderRadius='10px'
          left='70px'
          placement='bottom-end'
          padding='5px 15px'
          backgroundColor={colorMode === 'dark' && '#0F2042'}
        >
          <Heading
            maxWidth={'400px'}
            fontFamily={'inherit'}
            fontSize={'3rem'}
            textOverflow='ellipsis'
            whiteSpace='nowrap'
            overflow='hidden'
            sx={{ '@media (max-width: 640px)': { fontSize: '2.5rem' } }}
          >
            {name}
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
        {access === 'owner' && (
          <PopoverTrigger>
            <IconButton
              borderRadius='100%'
              icon={<EditIcon className='w-5' />}
            />
          </PopoverTrigger>
        )}
        <PopoverContent p={5}>
          <Formik
            initialValues={{
              title: name ? name : '',
              name: singer ? singer : '',
            }}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
          >
            {({ handleSubmit, isValid }) => (
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel htmlFor='name'>Title</FormLabel>
                    <Field as={Input} id='title' name='title' type='text' />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor='Name'>Artist name</FormLabel>
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
        </PopoverContent>
      </Popover>
    </Box>
  );
}
