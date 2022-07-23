import { useRouter } from 'next/router';
import React from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../../components/Layout';
import StymTrack from '../../components/Mystym/StymTrack';
import { googleSignout } from '../../features/auth/authSlice';
import {
  useGetFilesInFolderQuery,
  useGetFolderByIdQuery,
  useGetFoldersQuery,
} from '../../features/stymQuery';

// folder page by id
export default function Folder() {
  const router = useRouter();
  const query = router.query.fid;
  const dispatch = useDispatch();
  const {
    data: { folders } = {},
    isLoading,
    error,
  } = useGetFoldersQuery(query, {
    skip: query ? false : true,
  });
  // const { folder = [] } = folders[0];
  // const folder = { data.files };
  // console.log(folder, ' files ');

  console.log(folders || {}, '  data s');

  if (error?.status === 401) {
    dispatch(googleSignout());
    router.push('/sign-in');
  }

  if (error?.message === `Cannot read properties of null (reading 'token')`) {
    router.push('/sign-in');
  }

  return (
    <Layout>
      <div className='ll'>
        <h1 className='mb-12 text-5xl font-medium capitalize'>
          {folders ? folders[0]?.name : null}
        </h1>
        {
          <div className='space-y-4'>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              folders &&
              folders[0].files?.map((track) => (
                <StymTrack
                  playlist={folders.files}
                  key={track.id}
                  image={track?.image}
                  name={track.name}
                  src={track.link}
                  id={track.id}
                />
              ))
            )}
          </div>
        }
      </div>
    </Layout>
  );
}
