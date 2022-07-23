module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        10: '0.625rem',
        30: '1.875rem',
      },
      colors: {
        'my-black': '#0F2042',
        'my-red': '#E03A00',
        'my-orange': '#FF6A2A',
        'dark-orange': '#FF532D',
        'my-green': '#0EAD69',
        'my-light-green': '#6FCF97',
        'my-light-gray': '#EAEEF266',
        'my-gray': '#DEDEDE',
        'primary-purple': '#8B37FF',
        'my-faint-blue': '#EAEEF266',
        'my-light-purple': '#FF00BF',
        'my-color-checkbox': '#F2F2F2',
        'my-dark-grey': '#54546F',
        'my-dark-blue': '#0C0B31',
      },
    },
  },

  plugins: [],
};
