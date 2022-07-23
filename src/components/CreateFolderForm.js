import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { AddStymToFolder } from './AddStymToFolder';
import FormikController from './Formik/FormikController';

export function FormikContainer(props) {
  const initialValues = {
    folderName: '',
  };
  const validationSchema = Yup.object({
    folderName: Yup.string().required('Required'),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={props.onSubmit}
    >
      {(formik) => {
        return (
          <Form className='flex flex-col'>
            <FormikController
              control='input'
              type='text'
              name='folderName'
              placeholder='Category name'
              className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
            />
            <div className='flex justify-between mt-8'>
              {!props.createFolderInMainPage && (
                <AddStymToFolder
                  setIsOpen={props.isOpen}
                  stymId={props.stymId}
                />
              )}
              {!props.createFolderInMainPage && (
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
              )}
              <input
                type='file'
                name='uploadFolderWithFiles'
                id='uploadFolderWithFiles'
                webkitdirectory=''
                msdirectory=''
                mozdirectory=''
                onChange={props.handleCreateFolderWithFiles}
              />
              <Button
                type='submit'
                fontWeight={'500'}
                borderRadius={30}
                backgroundColor='transparent'
                border='1px'
                size='sm'
                borderColor={'brand.200'}
                color={'brand.200'}
                _hover={{ bg: 'brand.200', color: 'white' }}
                _active={{ bg: 'brand.200', color: 'white' }}
                onClick={() => props.setIsOpen(false)}
                isDisabled={!formik.isValid}
              >
                {!props.createFolderInMainPage ? props.action : 'Create'}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
