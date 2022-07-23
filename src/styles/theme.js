import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const theme = extendTheme({
  colors: {
    brand: {
      500: '#FF6A2A',
      200: '#FF6A2A',
    },
    'brand-primary': {
      500: '#8B37FF',
      200: '#8B37FF',
    },
    'brand-black': {
      500: '#0F2042',
      200: '#0F2042',
    },
    'brand-gray': {
      500: '#B0B0BD',
    },
  },

  components: {
    Tooltip: {
      variants: {
        'my-tooltip': {
          bg: 'white',
          color: 'brand.500',
          borderColor: 'brand.500',
          borderWidth: '1px',
        },
      },
    },
  },

  styles: {
    global: (props) => ({
      body: {
        bg: mode('whiteAlpha.900', '#0f2042')(props),
        color: mode('gray.900', 'whiteAlpha.900')(props),
      },
    }),
  },
});

export default theme;
