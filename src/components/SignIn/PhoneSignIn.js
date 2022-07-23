import React, { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import { Router, useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { useColorMode } from '@chakra-ui/react';

export default function PhoneSignIn() {
  const [number, setNumber] = useState('+1');
  const [step, setStep] = useState();
  const [OTP, setOTP] = useState();
  const [localId, setLocalId] = useState('');
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const auth = getAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    setStep(false);
  }, []);

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha-div',
      {
        size: 'invisible',
        callback: (response) => {},
      },
      auth
    );
  };

  const verifyOTP = (e) => {
    let otp = e.target.value;

    setOTP(otp);

    if (otp?.length === 6) {
      let confirmationResult = window.confirmationResult;
      setOTP('');

      confirmationResult
        ?.confirm(otp)
        .then((result) => {
          // User signed in successfully.
          // console.log(result.user, 'res.user');
          // console.log(result._tokenResponse, 'token res');

          // const { metadata, uid } = result.user;
          const { isNewUser, localId: uid } = result._tokenResponse;
          // setOTP('');

          // console.log(uid, 'uid');
          // console.log(isNewUser, 'is new?');
          // console.log(metaData, 'meta');

          // const isNewUser = metaData.creationTime === metaData.lastSignInTime;

          if (isNewUser) {
            toast.error('Please create an account first!', {
              position: 'bottom-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            router.push('/sign-up');
            return;
          }
          //  else {
          // toast.success('Success', {
          //   position: 'bottom-center',
          //   autoClose: 5000,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          // });
          // router.push('/');
          // }
          const user = new FormData();
          user.append('uid', uid);

          dispatch(login(user)).then(() => router.push('/'));

          setLocalId(uid);
          // console.log(localId, 'local id');

          // router.push('/');
        })
        .catch((error) => {
          console.log(error);
          if (error) {
            toast.error('Something went wrong!', {
              position: 'bottom-center',
            });
          }
        });
    }
  };

  const handleOTP = (e) => {
    if (isPossiblePhoneNumber(number ?? '0')) {
      generateRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      signInWithPhoneNumber(auth, number, appVerifier)
        .then((confirmationResult) => {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          window.confirmationResult = confirmationResult;
        })
        .catch((error) => {
          console.log(error);
        });
    }
    setStep(true);
  };

  return (
    <div>
      <button onClick={() => setStep(!step)}>step 2</button>
      <ToastContainer theme={colorMode} />

      {!step ? (
        <div className='space-y-5 rounded-r-2 mb-[18px] w-[20rem]'>
          <PhoneInput
            international
            defaultCountry='US'
            value={number}
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
          <button
            onClick={handleOTP}
            disabled={!isPossiblePhoneNumber(number || '1')}
            className='bg-primary-purple disabled:bg-my-gray text-[14px] rounded-[10px] font-bold p-5 text-white w-full'
          >
            Get code via sms or email
          </button>
        </div>
      ) : (
        <input
          maxLength='6'
          className='font-mono focus:outline-none otp-input'
          type='text'
          value={OTP}
          onChange={verifyOTP}
        />
      )}

      <div id='recaptcha-div'></div>
    </div>
  );
}
