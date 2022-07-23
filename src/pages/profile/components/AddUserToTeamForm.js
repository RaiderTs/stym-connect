import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikController from '../../../components/Formik/FormikController';

export default function AddUserToTeamForm(props) {
  const initialValues = {
    email: '',
  };
  const validationSchema = Yup.object({
    email: Yup.string().required('Required'),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={props.onSubmit}
    >
      {(formik) => {
        return (
          <Form method='post' className='flex flex-col'>
            <FormikController
              control='input'
              type='email'
              //   label='Artist name'
              name='email'
              placeholder='Email'
              value={formik.values.email || ''}
              className='w-full h-10 px-5 mb-8 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
            />
            <Button
              fontWeight={'normal'}
              _hover={{ bg: 'brand.200' }}
              borderRadius={30}
              bg='brand.200'
              _active={{ bg: 'brand.200', color: 'white' }}
              width={'5rem'}
              ml={'auto'}
              className='flex items-center px-4 py-2 text-white border border-my-orange bg-my-orange'
              onClick={() => props.setIsOpen(false)}
            >
              {props.action}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
