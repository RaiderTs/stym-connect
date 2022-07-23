import { Formik, Field, Form } from 'formik';
import {
  Box,
  Center,
  Heading,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { userSelector } from '../../selectors/auth';
import * as Yup from 'yup';
import { useRestoreAccountMutation } from '../../features/stymQuery';
import { useToast } from '@chakra-ui/react';

export default function RestoreAccount() {
  const router = useRouter();
  const { token } = router.query;
  const toast = useToast();

  const schema = Yup.object({
    password1: Yup.string().required('Please enter your new password').min(6),
    password2: Yup.string()
      .required()
      .oneOf([Yup.ref('password1'), null], 'Passwords must match'),
  });
  const [restore, { isLoading }] = useRestoreAccountMutation();

  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append('password', values.password1);
    const res = await restore({ body: formData, token });
    if (res.error?.originalStatus === 404) {
      toast({
        title: 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } else if (res.data.status) {
      toast({
        title: 'Password changed!',
        status: 'success',
        duration: 3000,
      });
      router.push('/sign-in');
    } else if (!res.data.status) {
      toast({
        title: 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Center h='100vh'>
      <Box rounded='md' w={'20rem'}>
        <Heading mb={6} fontFamily={'inherit'}>
          Restore Account
        </Heading>
        <Formik
          initialValues={{
            password1: '',
            password2: '',
          }}
          onSubmit={onSubmit}
          validationSchema={schema}
        >
          {({ errors, touched, isValid }) => (
            <Form method='post'>
              <VStack spacing={4} align='flex-start'>
                <FormControl>
                  <FormLabel htmlFor='password1'>New password</FormLabel>
                  <Field
                    as={Input}
                    id='password1'
                    name='password1'
                    type='password'
                    variant='filled'
                  />

                  <FormErrorMessage>
                    {errors.password1 && touched.password1
                      ? errors.password1
                      : null}
                  </FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='password2'>Confirm password</FormLabel>
                  <Field
                    as={Input}
                    id='password2'
                    name='password2'
                    type='password'
                    variant='filled'
                  />
                  <FormErrorMessage>{errors.password2}</FormErrorMessage>
                </FormControl>

                <Button
                  fontWeight={'normal'}
                  type='submit'
                  colorScheme='brand-primary'
                  color='white'
                  isFullWidth
                  disabled={!isValid}
                >
                  Change password
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Center>
  );
}
