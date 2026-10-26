/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#4B5970',
          700: '#3E4C66',
          800: '#303C52',
          900: '#253042',
          950: '#1C2534',
        },
        emerald: {
          50: '#F3FAF7',
          100: '#E3F3EC',
          200: '#C8E8DA',
          300: '#9AD5BD',
          400: '#68BE9D',
          500: '#43A380',
          600: '#34896A',
          700: '#2B7158',
          800: '#265B48',
          900: '#224B3C',
          950: '#1F3735',
        },
        teal: {
          50: '#F3FAF9',
          100: '#E2F3F1',
          200: '#C6E7E3',
          300: '#99D2CC',
          400: '#67B8B0',
          500: '#449B93',
          600: '#35827B',
          700: '#2C6B65',
          800: '#275652',
          900: '#234744',
          950: '#1F3638',
        },
        cyan: {
          50: '#F2FAFD',
          100: '#E0F3FA',
          200: '#C2E6F4',
          300: '#91D1EA',
          400: '#5CB4D8',
          500: '#3B98BF',
          600: '#2E7FA3',
          700: '#286785',
          800: '#25546C',
          900: '#22465A',
          950: '#1A3140',
        },
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#152C40',
        },
        accent: {
          50: '#F2FBF7',
          100: '#E1F5EC',
          500: '#38A882',
          600: '#2B8E6D',
          700: '#237459',
        },
        ai: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          gradient: 'linear-gradient(135deg, #6366F1 0%, #3B98BF 100%)',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'soft': '0 4px 12px 0 rgba(15, 23, 42, 0.06)',
        'soft-md': '0 8px 24px -4px rgba(15, 23, 42, 0.08)',
        'soft-lg': '0 16px 36px -6px rgba(15, 23, 42, 0.10)',
        'ai-glow': '0 0 24px rgba(99, 102, 241, 0.18)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'scan-laser': 'scan-laser 2.8s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'scan-laser': {
          '0%': { top: '0%', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        }
      }
    },
  },
  plugins: [],
}
