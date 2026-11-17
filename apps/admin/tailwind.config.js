/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cookii: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669', // Primary Cookii Green
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        mint: {
          DEFAULT: '#F6FAF7',
          50: '#FFFFFF',
          100: '#F6FAF7',
          200: '#E6F3EC',
          300: '#D2EADE',
        },
        sidebar: {
          DEFAULT: '#0D1117',
          card: '#161B22',
          hover: '#1F242C',
          border: '#30363D',
          muted: '#8B949E',
        },
        brand: {
          DEFAULT: '#059669',
          hover: '#047857',
          subtle: '#ECFDF5',
          border: '#A7F3D0',
        },
        fresh: {
          DEFAULT: '#059669',
          subtle: '#ECFDF5',
          border: '#A7F3D0',
        },
        canvas: '#F6FAF7',
        card: '#FFFFFF',
        subtle: '#F1F7F4',
        ink: {
          primary: '#111827',
          secondary: '#4B5563',
          muted: '#9CA3AF',
        },
        stroke: {
          subtle: '#E5E7EB',
          default: '#D1D5DB',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '22px': '22px',
        card: '22px',
        sheet: '24px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
