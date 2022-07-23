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
import { useEditFolderNameInStymMutation } from '../features/stymQuery';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { Field, Formik } from 'formik';
import LoadingSpinner from './LoadingSpinner';
import * as Yup from 'yup';
import { values } from 'lodash';

export default function EditableTitleFolder({
  name,
  stymId,
  access,
  folderId,
}) {
  const [editFolderNameInStym, { isLoading }] =
    useEditFolderNameInStymMutation();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { colorMode } = useColorMode;

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const onSubmit = async (values) => {
    const { name } = values;
    const formData = new FormData();
    formData.append('name', name);
    const options = { stymId, folderId, body: formData };

    if (access === 'owner') {
      try {
        const res = await editFolderNameInStym(options);
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
    <Box position={'relative'} display='flex' alignItems='center'>
      <Box d='inline-block' mr={3}>
        <Tooltip
          label={name}
          variant='my-tooltip'
          borderRadius='10px'
          // left='70px'
          placement='top-end'
          padding='5px 15px'
          backgroundColor={colorMode === 'dark' && '#0F2042'}
        >
          <Heading
            fontFamily={'inherit'}
            fontSize={'26px'}
            className='max-w-[400px] truncate'
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
              width='40px'
              icon={<EditIcon className='w-5' />}
            />
          </PopoverTrigger>
        )}
        <PopoverContent p={5}>
          <Formik
            initialValues={{
              name: name ? name : '',
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
        </PopoverContent>
      </Popover>
    </Box>
  );
}
