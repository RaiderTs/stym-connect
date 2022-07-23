import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikController from '../../../components/Formik/FormikController';
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function CreateContactModal(props) {
  const [number, setNumber] = useState('');
  const initialValues = {
    email: '',
    firstName: '',
    lastName: '',
    nickName: '',
  };
  const validationSchema = Yup.object({
    email: Yup.string().email().required('Required'),
    firstName: Yup.string().required('Required'),
    lastName: Yup.string().required('Required'),
    nickName: Yup.string(),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => props.onSubmit(values, number)}
    >
      {({ handleSubmit, isValid, values }) => {
        return (
          <Form
            method='post'
            className='flex flex-col gap-4'
            onSubmit={handleSubmit}
          >
            <FormikController
              control='input'
              type='text'
              //   label='Artist name'
              name='firstName'
              placeholder='First name'
              className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
            />
            <FormikController
              control='input'
              type='text'
              //   label='Artist name'
              name='lastName'
              placeholder='Last name'
              className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
            />
            <FormikController
              control='input'
              type='email'
              //   label='Artist name'
              name='email'
              placeholder='Email'
              className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
            />
            <FormikController
              control='input'
              type='text'
              //   label='Artist name'
              name='nickName'
              placeholder='Nick name'
              className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
            />
            <PhoneInput
              className='w-full profile-number focus:outline-none '
              international
              // defaultCountry='US'
              value={number || ''}
              onChange={setNumber}
              placeholder='+1 (555) 555-5555'
              limitMaxLength
              error={
                number
                  ? isPossiblePhoneNumber(number)
                    ? undefined
                    : 'Invalid phone number'
                  : 'Phone number required'
              }
            />
            <Button
              type='submit'
              fontWeight='500'
              fontSize='14px'
              lineHeight='100%'
              padding='8px 16px'
              border='1px'
              borderRadius='30px'
              backgroundColor='#fff'
              className='self-end shadow-sm w-max text-my-orange border-my-orange rounded-30 hover:bg-my-orange hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm'
              disabled={!values.email || !isValid}
              _hover={{ color: 'brand' }}
            >
              {props.action}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
