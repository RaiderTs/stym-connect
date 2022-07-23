import { Button } from '@chakra-ui/react';
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function ConfirmationDialog({
  handleDelete,
  cancel,
  loading,
  deleteFolder,
}) {
  return (
    <div className=''>
      <div className=''>
        <div className='p-3 mb-5 text-center'>
          Are you sure you want to{' '}
          <span className='text-my-orange'>delete</span>
          {` this ${deleteFolder ? 'category? ' : 'stym?'}`}
          {deleteFolder && (
            <span className='underline text-my-orange'>
              they will be deleted permanently
            </span>
          )}
        </div>
        <div className='flex justify-between'>
          <Button
            borderRadius={30}
            fontWeight={'normal'}
            onClick={cancel}
            variant='outline'
          >
            Cancel
          </Button>
          <Button
            fontWeight={'normal'}
            _hover={{ bg: 'brand.200' }}
            borderRadius={30}
            bg='brand.200'
            onClick={handleDelete}
            disabled={loading}
            className='flex items-center px-4 py-2 text-white border border-my-orange bg-my-orange'
          >
            {loading && <LoadingSpinner color='mr-3' />}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
