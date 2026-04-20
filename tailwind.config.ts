import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        espresso: '#131109',
        cream: '#F0EAD6',
        gold: '#C8923A',
        capacity: {
          green: '#4A7C59',
          amber: '#E8A838',
          red: '#C0392B'
        }
      },
      borderRadius: {
        card: '14px'
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;

