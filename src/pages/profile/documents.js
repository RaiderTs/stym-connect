import { useState } from 'react';
import ProfileLayout from './components/ProfileLayout';
import Folder from '../../components/svg/folders.svg';
import { useS3Upload } from 'next-s3-upload';
import {
  useDeleteDocumentsMutation,
  useGetDocumentsQuery,
  useShareDocumentsMutation,
  useUploadDocumentsMutation,
} from '../../features/stymQuery';
import ShareMenu from '../../components/Shared/ShareMenu';
import Modal from '../../components/Modal';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DocumentMenu from './components/DocumentMenu';
import { useColorMode } from '@chakra-ui/react';
import Preloader from '../../components/Preloader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { userSelector } from '../../selectors/auth';
import { deleteS3Object } from '../api/s3-delete';
import md5 from 'md5';

export default function Documents() {
  const [urls, setUrls] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [activeDocumentName, setActiveDocumentName] = useState('');
  const user = useSelector(userSelector);
  const { colorMode } = useColorMode();
  const { uploadToS3, files } = useS3Upload();
  const [isOpenShare, setIsOpenShare] = useState(false);
  const selected = useSelector((state) => state.modal.selected);
  const { data, isLoading, isFetching } = useGetDocumentsQuery();
  const [uploadDocs] = useUploadDocumentsMutation();
  const [deleteDocs, { isLoading: isDeleting, isSuccess: deleted }] =
    useDeleteDocumentsMutation();
  const [shareDocs, { isLoading: isSharing, isSuccess }] =
    useShareDocumentsMutation();

  const handleFilesChange = async ({ target }) => {
    const files = Array.from(target.files);

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      const newName = file?.name?.replace(/[^A-Za-z0-9.]/g, '_');

      function renameFile(file, newName) {
        return new File([file], newName, {
          type: file.type,
          lastModified: file.lastModified,
        });
      }

      const { url } = await uploadToS3(renameFile(file, newName), {
        endpoint: {
          request: {
            body: {
              email: user.email,
              stymId: '',
            },
          },
        },
      });

      setUrls((current) => [...current, url]);

      const formData = new FormData();
      formData.append('name', file.name);
      formData.append('link', url);
      formData.append('size', file.size);

      try {
        const res = await uploadDocs(formData);

        if (res.data.status) {
          toast.success('Document uploaded', {
            position: 'bottom-center',
          });
        } else {
          toast.error('Something went wrong', {
            position: 'bottom-center',
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleDelete = async (id) => {
    const sanitizedFilename = activeDocumentName.replace(/[^A-Za-z0-9.]/g, '_');
    const md5Email = md5(user.email);
    const regularPath = `public/${md5Email}/${sanitizedFilename}`;
    await deleteS3Object({
      Bucket: 'stymconnectappbucket130953-dev',
      Key: regularPath,
    });
    const res = await deleteDocs({ id });
    if (res.data.status) {
      toast.success('Document deleted', {
        position: 'bottom-center',
        autoClose: 1000,
      });
    } else {
      toast.error('Something went wrong', {
        position: 'bottom-center',
        autoClose: 1000,
      });
    }
  };
  const combinedData = data ? [...data?.files, ...data?.sharedFiles] : [];

  const handleShare = async (values, id) => {
    // console.log('🚀 values', values);
    // console.log('🚀 id', id);

    if (values.email !== 0) {
      for (let i = 0; i < values.email.length; i++) {
        const email = values.email[i];
        const formData = new FormData();
        formData.append('file', id);
        formData.append('access', selected.value);
        formData.append('email', email);
        formData.append('message', values.message);

        try {
          const res = await shareDocs(formData);

          if (res.data.status) {
            toast.success('File shared', {
              position: 'bottom-center',
            });
          } else if (
            res.data.message ===
            'This file has already been shared with this user'
          ) {
            toast.error(
              `This file has already been shared with ${res.data.email}`,
              {
                position: 'bottom-center',
              }
            );
          } else {
            toast.error('Something went wrong', {
              position: 'bottom-center',
            });
          }
        } catch (error) {
          console.log(error);
          setIsOpenShare(true);
        }
        setIsOpenShare(false);
      }
    }

    // goup

    if (values.group !== 0) {
      for (let i = 0; i < values.group.length; i++) {
        const group = values.group[i];
        const formData = new FormData();
        formData.append('file', id);
        formData.append('access', selected.value);
        formData.append('contactGroupId', group);
        formData.append('message', values.message);

        const res = await shareDocs(formData);
        if (res?.data.status) {
          toast.success('Stym shared with group contacts', {
            position: 'bottom-center',
          });
          // setIsError(false);
        } else if (res?.data.message === 'contacts_not_found') {
          toast.error(`Group ${res?.data?.group?.name} is empty`, {
            position: 'bottom-center',
          });
        } else {
          toast.error('Something went wrong', {
            position: 'bottom-center',
          });
        }
        setIsOpenShare(false);
      }
    }
  };

  return (
    <ProfileLayout>
      <div className='flex flex-col max-w-xl gap-3 grow'>
        {isLoading ? (
          <>
            <Preloader height='h-12 static ' width='w-full' />
            <Preloader height='h-6' width='w-3/4' />
            <Preloader height='h-6' width='w-1/3' />
            <Preloader height='h-6' width='w-1/4' />
          </>
        ) : (
          <div className='flex justify-between'>
            <div className='mb-4 text-3xl font-medium'>Documents</div>
            <label htmlFor='docs'>
              <input
                type='file'
                name='docs'
                id='docs'
                multiple={true}
                onChange={handleFilesChange}
              />
              <div
                role='button'
                className='flex items-center px-5 py-2 bg-white border rounded-full border-my-orange text-my-orange hover:bg-my-orange hover:text-white'
              >
                {(isDeleting || isFetching) && <LoadingSpinner color='mr-3' />}{' '}
                Add documents
              </div>
            </label>
          </div>
        )}
        {data?.files?.length === 0 && (
          <div>You don&apos;t have any documents yet</div>
        )}
        {data?.files &&
          combinedData.map((file) => {
            return (
              <div
                key={file.id}
                className='flex items-center justify-between mb-2'
              >
                <div className='flex items-center gap-4'>
                  <Folder className='w-4' />
                  <span>{file.name}</span>
                </div>

                <div
                  onClick={() => {
                    setActiveDocumentId(file.id);
                    setActiveDocumentName(file.name);
                  }}
                >
                  <DocumentMenu
                    handleDelete={handleDelete}
                    setIsOpenShare={setIsOpenShare}
                    isOpenShare={isOpenShare}
                    id={file.id}
                    link={file.link}
                    name={file.name}
                    documents
                  />
                </div>
                {/* <Modal
                  isOpen={isOpenShare}
                  setIsOpen={setIsOpenShare}
                  title='Share'
                >
                  <ShareMenu
                    onSubmit={(values) =>
                      // handleShare(values, file.id)
                      console.log(values)
                    }
                    isSharing={isSharing}
                    success={isSuccess}
                  />
                </Modal> */}
              </div>
            );
          })}
        <Modal isOpen={isOpenShare} setIsOpen={setIsOpenShare} title='Share'>
          <ShareMenu
            onSubmit={(values) => handleShare(values, activeDocumentId)}
            isSharing={isSharing}
            success={isSuccess}
          />
        </Modal>
        {files.length !== 0
          ? files.map((file, index) => (
              <div
                key={index}
                className={`${
                  file.progress < 50 ? 'text-black' : 'text-white'
                } ${
                  file.size === file.uploaded ? 'hidden' : ''
                } w-full relative h-14 shadow-md  bg-[#EAEEF2] rounded-md ${
                  colorMode === 'dark' ? 'bg-my-light-gray' : ''
                }`}
              >
                <div
                  className='grid rounded-md h-14 place-items-center bg-my-light-green'
                  style={{
                    width: `${file?.progress}%`,
                  }}
                >
                  <div className='absolute left-0 right-0 flex justify-center w-full'>
                    {file.progress.toFixed(0)}%
                  </div>
                </div>
              </div>
            ))
          : null}
      </div>
    </ProfileLayout>
  );
}
