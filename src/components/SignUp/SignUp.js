import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import GoogleSignIn from '../SignIn/GoogleSignIn';
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import TogglePass from '../svg/togglepass.svg';
import {
  useColorMode,
  InputGroup,
  InputRightElement,
  Button,
} from '@chakra-ui/react';
import Select from 'react-select';
import { options } from './timezoneOptions';
import { login, register } from '../../features/auth/authSlice';

export default function SignUp() {
  const { colorMode } = useColorMode();
  const [number, setNumber] = useState('+1');
  const [timezone, setTimezone] = useState();
  const [type, setType] = useState('password');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const isNumberValid = () => isPossiblePhoneNumber(number || '+1');

  const validationSchema = Yup.object({
    nickName: Yup.string(),
    email: Yup.string()
      .max(60, 'Must be 30 characters or less')
      .email('Invalid email address')
      .required('Please enter your email'),
    password: Yup.string().required('Please enter your password').min(6),
    passwordConfirm: Yup.string()
      .required()
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  });

  // * select styles
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      textAlign: 'left',

      backgroundColor: colorMode === 'dark' ? '#192642' : '#f7f8fa',
    }),

    control: (_) => ({
      marginBottom: '20px',
      display: 'flex',
      backgroundColor: colorMode === 'dark' ? '#EAEEF266' : '#f7f8fa',

      borderRadius: 10,
      padding: '14px',
    }),

    singleValue: (provided) => {
      return {
        ...provided,
        textAlign: 'left',

        color: colorMode === 'dark' ? '#cad3e7' : '#172747',
      };
    },

    option: (provided, state) => ({
      ...provided,
      color: state.isFocused && colorMode === 'dark' ? '#3f3f3f' : '#818181',
    }),

    input: (provided, state) => {
      return {
        ...provided,
        color: colorMode === 'dark' ? '#e6e6e6' : '#172747',
      };
    },

    placeholder: (provided) => {
      return {
        ...provided,
        color: colorMode === 'dark' ? '#f7f8fa' : '#818181',

        textAlign: 'left',
        fontSize: '14px',
      };
    },
  };

  return (
    <>
      {/* <div className='flex flex-col items-center min-h-screen pt-[5rem]'> */}
      <div className='flex flex-col items-center min-h-screen  justify-center gap-[5rem] px-4 text-center'>
        <div>
          <Link href='/'>
            <a className='flex items-center'>
              <Image
                src={colorMode === 'light' ? '/logo.svg' : '/logo_dark.svg'}
                alt='logo'
                width={250}
                height={34}
              />
            </a>
          </Link>
        </div>

        <h1 className='text-4xl md:text-[4.25rem] font-medium'>Welcome!</h1>
        <div className='max-w-[20rem]'>
          <Formik
            initialValues={{
              nickName: '',
              email: '',
              password: '',
              passwordConfirm: '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const nickName = values.nickName;
              const name = nickName.includes('@') ? nickName : `@${nickName}`;
              const user = new FormData();
              user.append('nickName', name);
              user.append('email', values.email);
              user.append('password', values.password);
              user.append('phone', number);
              timezone?.value && user.append('timezone', timezone.value);

              const loginUser = new FormData();
              loginUser.append('email', values.email);
              loginUser.append('password', values.password);

              await dispatch(register(user)).then(() =>
                dispatch(login(loginUser)).then(() => router.push('/'))
              );
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
                {/* {errors.email && touched.email ? (
                  <div>{errors.email}</div>
                ) : null} */}
                <input
                  className={`${
                    colorMode === 'dark'
                      ? 'text-white placeholder:text-gray-100'
                      : 'text-gray-700'
                  } mb-5 w-full p-5 leading-tight placeholder:text-sm  bg-[#EAEEF266] rounded-lg appearance-none`}
                  type='email'
                  name='email'
                  placeholder='Email address'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                />

                <input
                  className={`${
                    colorMode === 'dark'
                      ? 'text-white placeholder:text-gray-100'
                      : 'text-gray-700'
                  } mb-5 w-full p-5 leading-tight placeholder:text-sm  bg-[#EAEEF266] rounded-lg appearance-none`}
                  type='text'
                  name='nickName'
                  placeholder='Nick name'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.nickName}
                />

                {/* {errors.password && touched.password ? (
                  <div>{errors.password}</div>
                ) : null} */}
                <InputGroup>
                  <input
                    className={`${
                      colorMode === 'dark'
                        ? 'text-white placeholder:text-gray-100'
                        : 'text-gray-700'
                    } mb-5 w-full p-5 leading-tight placeholder:text-sm  bg-[#EAEEF266] rounded-lg appearance-none`}
                    type={show ? 'text' : 'password'}
                    name='password'
                    placeholder='Password'
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  <InputRightElement width='4.5rem' paddingTop='20px'>
                    <Button
                      paddingRight='0'
                      h='1.75rem'
                      size='sm'
                      onClick={() => setShow(!show)}
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
                {/* {errors.passwordConfirm && touched.passwordConfirm ? (
                  <div>{errors.passwordConfirm}</div>
                ) : null} */}
                <InputGroup>
                  <input
                    className={`${
                      colorMode === 'dark'
                        ? 'text-white placeholder:text-gray-100'
                        : 'text-gray-700'
                    } mb-5 w-full p-5 leading-tight placeholder:text-sm  bg-[#EAEEF266] rounded-lg appearance-none`}
                    type={showConfirm ? 'text' : 'password'}
                    name='passwordConfirm'
                    placeholder='Confirm Password'
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.passwordConfirm}
                  />
                  <InputRightElement width='4.5rem' paddingTop='20px'>
                    <Button
                      paddingRight='0'
                      h='1.75rem'
                      size='sm'
                      onClick={() => setShowConfirm(!showConfirm)}
                      color={showConfirm ? 'brand-black.500' : 'brand-gray.500'}
                      bg='transparent'
                      _hover={{ bg: 'transparent' }}
                      _focus={{ borderColor: 'transparent' }}
                      _active={{ borderColor: 'transparent' }}
                    >
                      <TogglePass />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <Select
                  styles={customStyles}
                  margin='10px'
                  placeholder='Select your timezone'
                  options={options}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  name='timezone'
                  onChange={setTimezone}
                ></Select>
                <div className='w-[20rem] flex mb-[18px]'>
                  <PhoneInput
                    international
                    style={{ width: 'inherit' }}
                    name='number'
                    className={
                      colorMode === 'dark'
                        ? 'PhoneInputDark'
                        : 'PhoneInputLight'
                    }
                    value={number}
                    defaultCountry='US'
                    onChange={setNumber}
                    placeholder='+1'
                    limitMaxLength
                    error={
                      number
                        ? isPossiblePhoneNumber(number)
                          ? undefined
                          : 'Invalid phone number'
                        : 'Phone number required'
                    }
                  />
                </div>
                <button
                  className='my-5 disabled:opacity-30   text-sm rounded-10 bg-[#8B37FF] font-bold p-5 text-white w-full'
                  type='submit'
                  disabled={!isValid || !isNumberValid()}
                >
                  {isSubmitting ? 'Loading' : 'Create Account'}
                </button>
                <GoogleSignIn />
              </form>
            )}
          </Formik>

          <div className='mt-12 text-xs'>
            Already have an account?{' '}
            <Link href='/sign-in'>
              <a>
                <span className='text-[#FF6A2A]'>Login</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
}
