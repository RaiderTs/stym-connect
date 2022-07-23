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
  useColorMode,
} from '@chakra-ui/react';
import { format } from 'date-fns';

export default function StymDetails({ isOpen, open, info = {}, date }) {
  // const { createDate = new Date() } = info;
  const { colorMode } = useColorMode();

  const { size, owner } = info;

  return (
    <Popover
      closeOnBlur={true}
      isLazy
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
          >
            <Info className='w-4' /> Stym Details
          </Text>
        </Box>
      </PopoverTrigger>
      <PopoverContent _focus={{ boxShadow: 'none' }}>
        <PopoverBody p={2}>
          <Box experimental_spaceY={3} p={3}>
            <Flex justify={'space-between'}>
              <Text fontWeight={'500'}>Date uploaded</Text>
              <Text color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}>
                {format(new Date(date), 'dd/MM/yyyy')}
              </Text>
            </Flex>
            <Flex justify={'space-between'}>
              <Text fontWeight={'500'}>Stym size</Text>
              <Text color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}>
                {size}
              </Text>
            </Flex>
            <Flex justify={'space-between'}>
              <Text fontWeight={'500'}>Shared by</Text>
              <Text color={colorMode === 'dark' ? 'gray.100' : 'gray.600'}>
                {owner?.name ? owner.name : owner?.email}
              </Text>
            </Flex>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
