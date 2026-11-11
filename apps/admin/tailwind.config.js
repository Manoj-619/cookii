/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E05315',
          hover: '#C4430D',
          subtle: '#FFF2EC',
          border: '#FED7C2',
        },
        fresh: {
          DEFAULT: '#15803D',
          subtle: '#ECFDF5',
          border: '#BBF7D0',
        },
        canvas: '#FAF7F2',
        card: '#FFFFFF',
        subtle: '#F3EFEA',
        ink: {
          primary: '#1E1B18',
          secondary: '#635D56',
          muted: '#968E85',
        },
        stroke: {
          subtle: '#EBE5DD',
          default: '#DDD5CA',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      borderRadius: {
        'card': '16px',
        'sheet': '24px',
      },
    },
  },
  plugins: [],
};

