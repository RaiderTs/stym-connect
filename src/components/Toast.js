import { toast } from 'react-toastify';

export const toaster = ({ type, message }) => {
  return (
    <>
      {toast[type](message, {
        position: 'bottom-center',
        toastId: 'something',
        autoClose: 500,
      })}
    </>
  );
};
