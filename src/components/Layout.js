import { Box, Flex } from '@chakra-ui/react';
import SearchIndex from './Search/SearchIndex';
import Sidebar from './Sidebar';
import {useSelector} from 'react-redux';
import {userSelector} from '../selectors/auth'

export default function Layout({ children }) {
  const user = useSelector(userSelector)

  return (
    <>
      <Box className='relative overflow-hidden flex h-full min-h-[100vh]'>
       {user && <Sidebar />}
        <Box className='flex w-full flex-column '>
          <Box className='w-full h-full ml-[60px] px-3 py-5 md:flex md:flex-col md:px-5 xl:px-20 mb-28 '>
            <div className='flex flex-col'>
             {user && <SearchIndex />}
              {children}
            </div>
          </Box>
        </Box>
      </Box>
    </>
  );
}
