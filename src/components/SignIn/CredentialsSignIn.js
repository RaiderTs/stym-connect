import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import TogglePass from '../svg/togglepass.svg';
import { login } from '../../features/auth/authSlice';
// import { useLoginMutation } from '../../app/services/auth';
import { toast } from 'react-toastify';
import { InputGroup, InputRightElement, Button } from '@chakra-ui/react';

export default function CredentialsSignIn() {
  const [type, setType] = useState('password');
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const togglePass = () => {
    setType((prevState) => ({
      type: !prevState.type,
    }));
  };

  const router = useRouter();
  const dispatch = useDispatch();
  // const [login, { isLoading }] = useLoginMutation();

  const validationSchema = Yup.object({
    email: Yup.string()
      .max(30, 'Must be 30 characters or less')
      .email('Invalid email address')
      .required('Please enter your email'),
    password: Yup.string().required('Please enter your password'),
  });

  return (
    <div className='flex flex-col w-[20rem]'>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          const formData = new FormData();
          formData.append('email', values.email);
          formData.append('password', values.password);

          try {
            const res = await dispatch(login(formData));
            if (res.payload === 'Invalid email or password') {
              toast.error('Wrong password', {
                position: 'bottom-center',
              });
            } else if (res.payload === 'User not found') {
              toast.error(`Couldn't find your account`, {
                position: 'bottom-center',
              });
            }
          } catch (error) {
            console.log(error);
            toast.error('Something went wrong', {
              position: 'bottom-center',
            });
          }

          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          isValid,
        }) => (
          <form method='post' onSubmit={handleSubmit}>
            {/* {errors.email && touched.email && errors.email} */}
            <input
              className='mb-5 dark:bg-slate-100 placeholder:text-sm w-full p-5 leading-tight text-gray-700 bg-[#EAEEF266]  rounded-lg appearance-none focus:outline-none'
              type='email'
              name='email'
              placeholder='Email address'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />

            {/* {errors.password && touched.password && errors.password} */}
            <InputGroup>
              <input
                className='mb-5 dark:bg-slate-100 placeholder:text-sm w-full p-5 leading-tight text-gray-700 bg-[#EAEEF266]  rounded-lg appearance-none focus:outline-none '
                type={show ? 'text' : 'password'}
                name='password'
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder='Password'
                value={values.password}
              />
              <InputRightElement width='4.5rem' paddingTop='20px'>
                <Button
                  paddingRight='0'
                  h='1.75rem'
                  size='sm'
                  onClick={handleClick}
                  color={show ? 'brand-black.500' : 'brand-gray.500'}
                  bg='transparent'
                  _hover={{ bg: 'transparent' }}
                  _focus={{ borderColor: 'transparent' }}
                  _active={{ borderColor: 'transparent' }}
                >
                  <TogglePass />
                </Button>
              </InputRightElement>
            </InputGroup>
            <button
              type='submit'
              disabled={!isValid}
              className='disabled:bg-my-gray bg-primary-purple text-[14px] rounded-10 font-bold p-5 text-white w-full'
            >
              {isSubmitting ? 'Logging in' : 'Log in'}
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
}
