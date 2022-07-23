import { Spinner, Text, useColorMode } from '@chakra-ui/react';

export default function FullPageLoader() {
  const { colorMode } = useColorMode();

  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-gray-800'>
      <Spinner
        thickness='6px'
        speed='0.65s'
        emptyColor='gray.200'
        mb='1rem'
        size={'xl'}
        color={colorMode === 'light' ? 'brand-primary.500' : 'brand.500'}
      />
      <Text color={colorMode === 'light' ? 'blackAlpha.800' : 'whiteAlpha.900'}>
        Loading...
      </Text>
    </div>
  );
}
