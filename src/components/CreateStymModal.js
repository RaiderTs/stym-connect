import { Fragment, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  incrementUploadFiles,
  reset,
  setTotalUploadFiles,
} from '../features/fileCounterSlice';
import Close from './svg/close.svg';
import Back from './svg/navigateBack.svg';
import {
  useAddStymToFolderMutation,
  useCreateFileMutation,
  useCreateFolderMutation,
  useCreateStymMutation,
  useGetFoldersQuery,
} from '../features/stymQuery';
import { useS3Upload } from 'next-s3-upload';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import Modal from './Modal';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  useColorMode,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../selectors/auth';
import CreatableSelect from 'react-select/creatable';

export default function CreateStymModal({ isOpen, setIsOpen }) {
  const { uploadToS3 } = useS3Upload();
  const [createStym] = useCreateStymMutation();
  const [createFile] = useCreateFileMutation();
  const [createFolder] = useCreateFolderMutation();
  const [folderFiles, setFolderFiles] = useState([]);
  const { colorMode } = useColorMode();
  const user = useSelector(userSelector);
  const { data: { folders } = [], isLoading } = useGetFoldersQuery();
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [addFolderToStym, { isLoading: isAdding }] =
    useAddStymToFolderMutation();
  const router = useRouter();
  const dispatch = useDispatch();

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

      backgroundColor: colorMode === 'dark' ? '#EAEEF266' : '#f7faf8',
      borderRadius: 10,
      padding: '5px',
      width: '100%',
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
    option: (styles, { isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        // color:
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

  const folderOptions =
    folders &&
    folders?.map((folder) => {
      const { name, id } = folder;
      return {
        value: id,
        label: name,
      };
    });

  const initialValues = {
    artistName: '',
    title: '',
    files: [],
  };
  const validationSchema = Yup.object({
    artistName: Yup.string().optional(),
    title: Yup.string().required('Required'),
  });

  const handleSubmit = async (values) => {
    dispatch(reset());
    const files = values.files;
    NProgress.start();
    const formData = new FormData();
    formData.append('name', values.title);
    formData.append('singer', values.artistName);
    const res = await createStym(formData);
    // NProgress.done();
    if (
      res?.data.message === 'Complete'
      // && folderFiles.length > 0
    ) {
      router.push(`/my-stym/${res?.data?.stym?.id}`);
      toast.success('Stym created', {
        position: 'bottom-center',
        autoClose: 1000,
      });
      const folderName = folderFiles[0]?.webkitRelativePath.split('/')[0];
      const stymId = res.data.id;
      const formData = new FormData();
      formData.append('name', folderName);

      if (folderName) {
        try {
          const folderId = await createFolder({ body: formData, stymId });
          localStorage.setItem('folderId', `${folderId?.data?.id}`);

          if (folderId.data.message === 'folder_exists') {
            toast.error('Folder by this name already exists', {
              position: 'bottom-center',
            });
            return;
          }
          dispatch(setTotalUploadFiles(folderFiles.length));
          // const s3res = await handleFolderUpload(id, folderId);
          for (let index = 0; index < folderFiles.length; index++) {
            const file = folderFiles[index];
            // console.log(file, 's3 file');
            const newName = file?.name?.replace(/[^A-Za-z0-9.]/g, '_');

            function renameFile(file, newName) {
              return new File([file], newName, {
                type: file.type,
                lastModified: file.lastModified,
              });
            }

            const { url } = await uploadToS3(renameFile(file, newName), {
              endpoint: {
                request: {
                  body: {
                    email: user.email,
                    stymId,
                    folderId: folderId.data.id,
                  },
                },
              },
            });

            const formData = new FormData();
            formData.append('name', file.name);
            formData.append('size', file.size);
            formData.append('link', url);

            try {
              const response = await createFile({
                body: formData,
                stymId,
                folderId: folderId.data.id,
              });

              const { data } = response;
              // if (data.message === 'Complete') {
              //   toast.success('File added!', {
              //     position: 'bottom-center',
              //     autoClose: 500,
              //   });
              // } else
              if (data.message === 'file_exists_by_name') {
                toast.error("You've already added a file with this name", {
                  position: 'bottom-center',
                });
              }
            } catch (error) {
              console.log(error, 'something went wrong');
            }
            dispatch(incrementUploadFiles());
          }
          dispatch(reset());
        } catch (error) {
          console.log(error);
        }
      }
    }

    if (res?.data.message === 'no_access') {
      toast.warning('Subscribe to use this functionality', {
        position: 'bottom-center',
      });
    }

    if (res) {
      dispatch(setTotalUploadFiles(files.length));

      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const newName = file?.name?.replace(/[^A-Za-z0-9.]/g, '_');

        function renameFile(file, newName) {
          return new File([file], newName, {
            type: file.type,
            lastModified: file.lastModified,
          });
        }

        const { url } = await uploadToS3(renameFile(file, newName), {
          endpoint: {
            request: {
              body: {
                email: user.email,
                stymId: res.data.id,
                folderId: 0,
              },
            },
          },
        });
        const formData = new FormData();
        formData.append('name', file?.name);
        formData.append('size', file.size);
        formData.append('link', url);

        if (
          selectedFolder !== null &&
          selectedFolder?.value !== 363 &&
          selectedFolder?.value !== 364 &&
          selectedFolder?.value !== 365 &&
          selectedFolder?.value !== 366
        ) {
          await addFolderToStym({
            folderId: selectedFolder?.value,
            stymId: res?.data?.id,
          });
        }

        try {
          const response = await createFile({
            body: formData,
            stymId: res.data.id,
            folderId: selectedFolder?.value ? selectedFolder?.value : 0,
          });

          // console.log(response);
          const { data } = response;
        } catch (error) {
          console.log(error, 'something went wrong');
        }
        dispatch(incrementUploadFiles());
      }
      dispatch(reset());
    }
    localStorage.removeItem('folderId');
  };

  return (
    <Modal title='Create Stym' isCentered isOpen={isOpen} setIsOpen={setIsOpen}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isValid, setFieldValue, errors }) => {
          return (
            <Form method='post' className='flex flex-col'>
              <div className='text-center sm:mt-0 sm:text-left'>
                <div className='space-y-4 '>
                  <Field
                    type='text'
                    name='title'
                    value={values.title}
                    placeholder='Title'
                    className={`${
                      errors.title ? 'border border-red-400' : ''
                    } w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none`}
                  />
                  <Field
                    type='text'
                    name='artistName'
                    className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
                    value={values.artistName}
                    placeholder='Name (Optional)'
                  />
                  <CreatableSelect
                    id='folderSelect'
                    styles={customStyles}
                    placeholder='Select a category'
                    options={folderOptions}
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    name='folderSelect'
                    onChange={(selectedOption) =>
                      setSelectedFolder(selectedOption)
                    }
                  />
                </div>
              </div>

              <div className='justify-between gap-4 pt-6 space-y-5 md:space-y-0 md:flex'>
                <FormControl w={'fit-content'}>
                  <FormLabel htmlFor='files'>
                    <Button
                      as={'div'}
                      cursor='pointer'
                      borderRadius={30}
                      fontWeight='normal'
                      variant='outline'
                      size='sm'
                      color={'brand.200'}
                      borderColor='brand.200'
                      _hover={{ bg: 'brand.200', color: 'white' }}
                      _active={{ bg: 'brand.200', color: 'white' }}
                      mr={4}
                    >
                      + Upload files
                    </Button>
                  </FormLabel>
                </FormControl>
                <label htmlFor='uploadFolderWithFiles'>
                  <Button
                    type='submit'
                    fontWeight={'500'}
                    borderRadius={30}
                    as={'div'}
                    cursor='pointer'
                    backgroundColor='transparent'
                    border='1px'
                    size='sm'
                    borderColor={'brand.200'}
                    color={'brand.200'}
                    _hover={{ bg: 'brand.200', color: 'white' }}
                    _active={{ bg: 'brand.200', color: 'white' }}
                  >
                    Upload folder
                  </Button>
                </label>
                <input
                  type='file'
                  name='uploadFolderWithFiles'
                  id='uploadFolderWithFiles'
                  webkitdirectory=''
                  msdirectory=''
                  mozdirectory=''
                  onChange={(e) => setFolderFiles(e.target.files)}
                />
                <Field
                  type='file'
                  name='files'
                  id='files'
                  value=''
                  multiple
                  onChange={(event) => {
                    setFieldValue('files', Array.from(event.target.files));
                  }}
                />

                <Button
                  type='submit'
                  disabled={!isValid}
                  onClick={() => setIsOpen(false)}
                  borderRadius={30}
                  fontWeight='normal'
                  size='sm'
                  borderColor='brand.200'
                  variant='outline'
                  color={'brand.200'}
                  _hover={{ bg: 'brand.200', color: 'white' }}
                  _active={{ bg: 'brand.200', color: 'white' }}
                >
                  Create
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
