import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikController from '../../../components/Formik/FormikController';

export default function CreateGroupModal(props) {
  const initialValues = {
    name: '',
    description: '',
  };
  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    // description: Yup.string().required('Required'),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={props.onSubmit}
    >
      {(formik) => {
        return (
          <Form method='post' className='flex flex-col gap-4'>
            <FormikController
              control='input'
              type='text'
              //   label='Artist name'
              name='name'
              placeholder='Group name'
              className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
            />
            <FormikController
              control='input'
              type='text'
              //   label='Artist name'
              name='description'
              placeholder='Description (optional)'
              className='w-full h-10 px-5 text-sm bg-my-faint-blue rounded-10 focus:outline-none'
            />
            <button
              type='submit'
              className='self-end px-4 py-2 mt-3 text-base font-medium bg-white border shadow-sm w-max text-my-orange border-my-orange rounded-30 hover:bg-my-orange hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm'
              onClick={() => props.setIsOpen(false)}
            >
              {props.action}
            </button>
          </Form>
        );
      }}
    </Formik>
  );
}
