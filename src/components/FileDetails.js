import React from 'react';
import Info from '../components/svg/info.svg';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  Box,
  Text,
  Flex,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { format } from 'date-fns';

export default function FileDetails({ isOpen, open, info = {} }) {
  // const { createDate = new Date() } = info;
  const { colorMode } = useColorMode();

  const formattedDate = format(new Date(), 'dd/MM/yyyy');

  const { size, createDate, owner, sharedWith, updateDate, shared } = info;

  return (
    <Popover
      closeOnBlur={true}
      isLazy
      // lazyBehavior='keepMounted'
      placement='right-start'
      isOpen={isOpen}
      offset={[-8, 20]}
    >
      <PopoverTrigger>
        <Box display={'flex'} gap={2}>
          <Text
            display={'flex'}
            gap={2}
            cursor='pointer'
            _hover={{ color: 'brand.500' }}
            onClick={open}
            color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}
          >
            <Info className='w-4' /> File Details
          </Text>
        </Box>
      </PopoverTrigger>
      <PopoverContent _focus={{ boxShadow: 'none' }}>
        <PopoverBody p={2}>
          <PopoverHeader
            fontSize={20}
            textAlign='center'
            color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}
          >
            File History
          </PopoverHeader>
          <Box experimental_spaceY={3} p={3}>
            <Flex justify={'space-between'}>
              <Text
                fontWeight={'500'}
                color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}
              >{`${createDate ? 'Date uploaded' : 'Last updated'}`}</Text>
              <Text color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}>
                {createDate ? createDate : updateDate}
              </Text>
            </Flex>
            <Flex justify={'space-between'}>
              <Text
                fontWeight={'500'}
                color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}
              >
                File size
              </Text>
              <Text color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}>
                {size}
              </Text>
            </Flex>
            <Flex justify={'space-between'}>
              <Text
                fontWeight={'500'}
                color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}
              >
                Owned by
              </Text>
              <Tooltip
                label={owner?.name ? owner.name : owner?.email}
                variant='my-tooltip'
                borderRadius='10px'
                // left='70px'
                placement='bottom-start'
                padding='5px 15px'
                backgroundColor={colorMode === 'dark' && '#0F2042'}
              >
                <Text
                  color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}
                  className='w-[150px] truncate'
                >
                  {owner?.name ? owner.name : owner?.email}
                </Text>
              </Tooltip>
            </Flex>
            <Flex justify={'space-between'}>
              <Text
                fontWeight={'500'}
                color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}
              >
                Shared with
              </Text>
              <Text color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}>
                {sharedWith ? sharedWith : shared?.count}
              </Text>
            </Flex>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
