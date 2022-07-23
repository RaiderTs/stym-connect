import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { googleSignout } from '../../features/auth/authSlice';
import { userSelector } from '../../selectors/auth';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import PhotoUpload from '../../components/svg/photo_upload.svg';
import Info from '../../components/svg/info.svg';
import Arrow from '../../components/svg/out-arrow.svg';
import Delete from '../../components/svg/delete.svg';
import Facebook from '../../components/svg/facebookURL.svg';
import Twitter from '../../components/svg/twitterURL.svg';
import Instagram from '../../components/svg/instagram.svg';
import Website from '../../components/svg/website.svg';
import NProgress from 'nprogress';
import ProfileLayout from './components/ProfileLayout';
import Preloader from '../../components/Preloader';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Box, Tooltip, useColorMode } from '@chakra-ui/react';
import {
  stymApi,
  useGetUserProfileDataQuery,
  useRestoreAccountRequestMutation,
  useUpdateProfileDataMutation,
} from '../../features/stymQuery';

export default function Profile() {
  const [number, setNumber] = useState();
  const [edit, setEdit] = useState({
    profile: true,
    social: true,
  });
  const [photo, setPhoto] = useState();
  const [skip, setSkip] = useState(true);
  const [userInfo, setUserInfo] = useState([]);
  const [isPhotoPicked, setIsPhotoPicked] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(userSelector);

  const token = user?.token;
  const { data, error, isLoading, isFetching, refetch } =
    useGetUserProfileDataQuery({
      skip: skip,
    });
  const [updateProfileData, { isLoading: isUpdating }] =
    useUpdateProfileDataMutation();
  const { data: profileData } = data ? data : [];
  // console.log(error, 'data');o
  const [restoreRequest, { isLoading: isRequesting }] =
    useRestoreAccountRequestMutation();

  const handleCancel = (handleReset, name) => {
    setEdit((prev) => ({ ...prev, [name]: !prev[name] }));
    handleReset();
  };

  const { colorMode, toggleColorMode } = useColorMode();

  const handleRestoreAccount = async () => {
    const formData = new FormData();
    formData.append('email', profileData?.email);
    const res = await restoreRequest(formData);
    console.log(res);
    if (res?.data?.status) {
      toast.success('Check your email for further instructions', {
        position: 'bottom-center',
      });
    }
  };

  if (isFetching) {
    NProgress.start();
  } else {
    NProgress.done();
  }

  const handlePhotoUpload = (e) => {
    // if (file.size > 1024) /////////////////

    setPhoto(e.target.files[0]);
    setIsPhotoPicked(true);
  };

  const handlePhotoDelete = async () => {
    try {
      const formData = new FormData();
      formData.append('image', '1');
      const res = await updateProfileData(formData);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const formData = new FormData();
    formData.append('file', photo);

    const postPhoto = async () => {
      const data = await updateProfileData(formData);

      if (!data?.data?.status) {
        toast.error('Something went wrong', {
          position: 'bottom-center',
        });
      }
    };

    if (isPhotoPicked && photo) {
      postPhoto().then(() => refetch());
      setPhoto(null);
      setIsPhotoPicked(false);
    }
  }, [isPhotoPicked, photo]);

  useEffect(() => {
    refetch();
  }, [user]);

  if (error?.status === 401) {
    dispatch(googleSignout());
    dispatch(stymApi.util.resetApiState());
    router.push('/sign-in');
  }
  const re =
    /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/;

  const validateUrl = (url) => {
    let error;
    if (url && !re.test(url)) {
      error = 'Make sure the url is correct';
    }
    return error;
  };

  return (
    <ProfileLayout>
      <Box className='flex-grow gap-20 md:flex'>
        <div className='mb-8 md:w-1/2'>
          <div className='gap-5 mb-5 md:flex md:w-full'>
            {isLoading || isFetching ? (
              <Preloader
                height={'h-[10rem]'}
                width={'w-[10rem]'}
                rounded={'rounded-full'}
              />
            ) : (
              <img
                style={{ backgroundPosition: '25% 75%' }}
                className='object-cover max-w-[200px] mx-auto my-5 rounded-full md:max-w-2/5 md:mx-0 md:my-0 aspect-square self-baseline'
                src={profileData?.image || user?.photoUrl || '/profile_pic.png'}
                alt='profile image'
              />
            )}

            <div className='flex flex-col gap-5 md:justify-start mr-[10px] min-w-[50%]'>
              {isLoading || isFetching ? (
                <Preloader
                  height={'h-[2.5rem]'}
                  width={'w-[15rem]'}
                  rounded={'rounded-[10px]'}
                />
              ) : (
                <Tooltip
                  label={`${profileData?.firstName || ' '} ${
                    profileData?.lastName || ' '
                  }`}
                  variant='my-tooltip'
                  borderRadius='10px'
                  left='50px'
                  placement='top-end'
                  padding='5px 15px'
                  backgroundColor={colorMode === 'dark' && '#0F2042'}
                >
                  <span className='text-xl font-medium md:text-4xl  max-w-[350px] truncate'>
                    {`${profileData?.firstName || ' '} 
                    ${profileData?.lastName || ' '}`}
                  </span>
                </Tooltip>
              )}
              {isLoading || isFetching ? (
                <Preloader
                  height={'h-[2.5rem]'}
                  width={'w-[15rem]'}
                  rounded={'rounded-[10px]'}
                />
              ) : null}
              {profileData?.nickName && (
                <input
                  type='text'
                  className='w-full h-10 px-5 bg-my-faint-blue rounded-10 focus:outline-none'
                  readOnly
                  value={profileData?.nickName}
                />
              )}
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='profilePic'
                  className='flex items-center gap-1 cursor-pointer w-fit color-black'
                >
                  <PhotoUpload className='flex mb-[4px]' /> Upload photo
                </label>
                <input
                  type='file'
                  accept='image/*'
                  id='profilePic'
                  name='profilePic'
                  onChange={handlePhotoUpload}
                  disabled={isLoading || isFetching}
                />

                <button
                  onClick={handlePhotoDelete}
                  type='button'
                  className='flex items-center gap-1 cursor-pointer w-fit'
                >
                  <Delete className='flex mb-[4px] w-4' /> Delete
                </button>
              </div>
            </div>
          </div>
          {/* inputs */}
          <>
            <Formik
              enableReinitialize={true}
              initialValues={{
                ...profileData,
              }}
              onSubmit={async (values, { setSubmitting }) => {
                const firstName = values.firstName;

                const lastName = values.lastName;

                const phone = number ? number : '';
                const file = isPhotoPicked ? photo : '';

                const nickName = values.nickName;

                const formData = new FormData();

                const name = nickName?.includes('@')
                  ? nickName
                  : `@${nickName}`;

                nickName !== profileData?.nickName &&
                  formData.append('nickName', name);
                firstName !== profileData?.firstName &&
                  formData.append('firstName', firstName);
                lastName !== profileData?.lastName &&
                  formData.append('lastName', lastName);
                phone &&
                  phone !== profileData?.phone &&
                  formData.append('phone', phone);
                file && formData.append('file', file);

                try {
                  const res = await updateProfileData(formData);
                  if (!res.data.status) {
                    toast.error(`${res.data.message}`, {
                      position: 'bottom-center',
                    });
                  } else if (res?.error?.status === 'PARSING_ERROR') {
                    toast.error('Something went wrong!', {
                      position: 'bottom-center',
                    });
                  } else if (res.data.status) {
                    toast.success('Profile updated', {
                      position: 'bottom-center',
                    });
                  }
                } catch (error) {
                  console.log(error);
                }

                setEdit({ profile: true });
                setSkip((prevState) => !prevState.skip);
              }}
            >
              {({
                values,
                handleChange,
                handleReset,
                handleSubmit,
                isSubmitting,
                isValid,
                errors,
                touched,
              }) => (
                <Form method='post' className='md:w-full'>
                  <div className='space-y-5'>
                    <div className='flex gap-5'>
                      {isLoading || isFetching ? (
                        <Preloader
                          height={'h-[2.5rem]'}
                          width={'w-[22.5rem]'}
                          rounded={'rounded-[10px]'}
                        />
                      ) : (
                        <Field
                          readOnly={edit.profile}
                          name='firstName'
                          onChange={handleChange}
                          placeholder='First name'
                          className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
                        />
                      )}
                      {isLoading || isFetching ? (
                        <Preloader
                          height={'h-[2.5rem]'}
                          width={'w-[22.5rem]'}
                          rounded={'rounded-[10px]'}
                        />
                      ) : (
                        <Field
                          readOnly={edit.profile}
                          name='lastName'
                          onChange={handleChange}
                          placeholder='Last name'
                          className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
                        />
                      )}
                    </div>
                    <div className='flex gap-5'>
                      {isLoading || isFetching ? (
                        <Preloader
                          height={'h-[2.5rem]'}
                          width={'w-[22.5rem]'}
                          rounded={'rounded-[10px]'}
                        />
                      ) : (
                        <Field
                          readOnly
                          type='email'
                          name='email'
                          placeholder='Email'
                          className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
                        />
                      )}
                      {isLoading || isFetching ? (
                        <Preloader
                          height={'h-[2.5rem]'}
                          width={'w-[22.5rem]'}
                          rounded={'rounded-[10px]'}
                        />
                      ) : (
                        <Field
                          readOnly={edit.profile}
                          type='text'
                          name='profileLink'
                          placeholder='Profile link'
                          className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
                        />
                      )}
                    </div>
                    <div className='flex gap-5'>
                      {isLoading || isFetching ? (
                        <Preloader
                          height={'h-[2.5rem]'}
                          width={'w-[22.5rem]'}
                          rounded={'rounded-[10px]'}
                        />
                      ) : (
                        <Field
                          readOnly={edit.profile}
                          name='nickName'
                          onChange={handleChange}
                          placeholder='Nick name'
                          className='w-[93%] h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
                        />
                      )}
                      {isLoading || isFetching ? (
                        <Preloader
                          height={'h-[2.5rem]'}
                          width={'w-[22.5rem]'}
                          rounded={'rounded-[10px]'}
                        />
                      ) : (
                        <PhoneInput
                          disabled={edit.profile}
                          className='w-full h-10 profile-number focus:outline-none'
                          international
                          defaultCountry='US'
                          value={profileData?.phone || ''}
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
                      )}
                    </div>
                  </div>
                  <div className='flex gap-5 mt-5'>
                    {edit.profile ? (
                      <button
                        onClick={() =>
                          setEdit((prev) => ({ ...prev, profile: false }))
                        }
                        className='px-4 py-2 text-sm text-white rounded-full disabled:opacity-50 bg-my-orange'
                      >
                        Edit
                      </button>
                    ) : (
                      <div className='flex gap-4 '>
                        <button
                          type='submit'
                          className='px-4 py-2 text-sm text-white rounded-full bg-my-orange'
                        >
                          <span className='flex'>
                            {isSubmitting && <LoadingSpinner color='mr-2' />}
                            Save
                          </span>
                        </button>
                        <button
                          type='reset'
                          onClick={() => handleCancel(handleReset, 'profile')}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
            <Formik
              enableReinitialize={true}
              initialValues={{
                ...profileData,
              }}
              onSubmit={async (values, { setSubmitting }) => {
                const socials = values.socials || [];

                const transformedArray = Object.entries(socials).map(
                  ([key, value]) => {
                    return {
                      type: key,
                      link: value,
                    };
                  }
                );

                const formData = new FormData();

                socials &&
                  formData.append('socials', JSON.stringify(transformedArray));
                try {
                  const res = await updateProfileData(formData);

                  if (res?.error?.status === 'PARSING_ERROR') {
                    toast.error('Something went wrong!', {
                      position: 'bottom-center',
                    });
                  } else if (res.data.status) {
                    toast.success('Profile updated', {
                      position: 'bottom-center',
                    });
                  }
                } catch (error) {
                  console.log(error);
                }

                setEdit({ profile: true });
                setSkip((prevState) => !prevState.skip);
              }}
            >
              {({ handleChange, handleReset, isSubmitting, errors }) => (
                <Form method='post' className='md:w-full'>
                  {/* social */}
                  <div className='space-y-5 mt-9'>
                    <hr className='text-[#E3E6EB] mb-6 ' />
                    <div className='flex flex-col justify-between md:items-center md:flex-row'>
                      <p className='text-2xl font-medium'>Social Profiles</p>
                      {errors?.socials ? (
                        <div className='flex items-center gap-2 text-sm text-red-500'>
                          <Info className='w-4 text-red-500' /> Make sure the
                          url is correct
                        </div>
                      ) : null}
                    </div>
                    <div className='flex gap-5'>
                      <label
                        htmlFor='facebook'
                        className='relative w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 '
                      >
                        <Facebook className='w-8 h-8 transform -translate-y-1/2 pointer-events-none top-[70%] absolute left-3" ' />
                        <Field
                          validate={validateUrl}
                          readOnly={edit.social}
                          name='socials.facebook'
                          onChange={handleChange}
                          placeholder='Facebook URL'
                          className='w-full h-full pl-6 text-sm bg-transparent focus:outline-none'
                        />
                      </label>
                      <label
                        htmlFor='twitter'
                        className='relative w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 '
                      >
                        <Twitter className='w-8 h-8 transform -translate-y-1/2 pointer-events-none top-[73%] absolute left-3"  ' />
                        <Field
                          validate={validateUrl}
                          readOnly={edit.social}
                          name='socials.twitter'
                          onChange={handleChange}
                          placeholder='Twitter URL'
                          className='w-full h-full pl-6 text-sm bg-transparent focus:outline-none'
                        />
                      </label>
                    </div>
                    <div className='flex gap-5'>
                      <label
                        htmlFor='instagram'
                        className='relative w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 '
                      >
                        <Instagram className='w-6 h-6 transform -translate-y-1/2 pointer-events-none top-[18px] absolute left-3' />
                        <Field
                          validate={validateUrl}
                          readOnly={edit.social}
                          name='socials.instagram'
                          onChange={handleChange}
                          placeholder='Instagram URL'
                          className='w-full h-full pl-6 text-sm bg-transparent focus:outline-none'
                        />
                      </label>
                      <label
                        htmlFor='website'
                        className='relative w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 '
                      >
                        <Website className='w-4 h-4 transform -translate-y-1/2 pointer-events-none top-[18px] absolute left-4 ' />
                        <Field
                          validate={validateUrl}
                          readOnly={edit.social}
                          name='socials.website'
                          onChange={handleChange}
                          placeholder='Website'
                          className='w-full h-full pl-6 text-sm bg-transparent focus:outline-none'
                        />
                      </label>
                    </div>
                    {/* Buttons change */}
                    <div className='flex gap-5 mt-5'>
                      {edit.social ? (
                        <button
                          onClick={() =>
                            setEdit((prev) => ({ ...prev, social: false }))
                          }
                          className='px-4 py-2 text-sm text-white rounded-full bg-my-orange'
                        >
                          Edit
                        </button>
                      ) : (
                        <div className='flex gap-4'>
                          <button
                            type='submit'
                            disabled={errors?.socials}
                            className='px-4 py-2 text-sm text-white rounded-full disabled:opacity-50 bg-my-orange'
                          >
                            <span className='flex'>
                              {isSubmitting && <LoadingSpinner color='mr-2' />}{' '}
                              Save
                            </span>
                          </button>
                          <button
                            type='reset'
                            onClick={() => handleCancel(handleReset, 'social')}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
            {/* password */}
            <div className='space-y-5 mt-9'>
              <hr className='text-[#E3E6EB] mb-6 ' />

              <div className='flex flex-col justify-end'>
                <p className='mb-6 text-2xl font-medium'>Reset password</p>
                <p className='mb-6 font-sm text-s'>
                  Don&apos;t worry if you just forgot your password
                </p>
                <button
                  type='button'
                  className='flex items-center h-10 px-5 text-white rounded-full cursor-pointer w-max bg-my-orange disabled:opacity-50'
                  onClick={handleRestoreAccount}
                  disabled={isRequesting}
                >
                  {isRequesting && <LoadingSpinner color='mr-3' />}
                  Reset Password
                </button>
              </div>
            </div>
          </>
        </div>
        <div className='md:w-1/2'>
          {!isLoading && (
            <>
              {user?.tariff && (
                <>
                  <div className='mb-5 text-xl font-medium'>Storage</div>
                  <div className='w-full h-16 bg-[#EAEEF2] rounded-md dark:bg-my-light-gray'>
                    <div
                      className='h-16 rounded-md bg-my-light-green'
                      style={{
                        width: `${profileData?.storage.procent}%`,
                      }}
                    ></div>
                  </div>
                  <div className='inline-block mt-3 mb-10 text-xs font-medium'>
                    {profileData?.storage.size}
                  </div>
                </>
              )}
              <div className='text-2xl font-medium '>
                Account plan:{' '}
                <span className='text-4xl capitalize'>
                  {user?.tariff ? user.tariff : 'Basic'}
                </span>
              </div>
              <>
                <Link href='subscription'>
                  <a className='flex gap-12 pt-5 pb-2 font-medium border-b w-max border-b-my-black'>
                    Change plan <Arrow className='w-5' />
                  </a>
                </Link>
              </>
            </>
          )}
        </div>
      </Box>
    </ProfileLayout>
  );
}
