/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#dce8fd',
          200: '#c0d4fc',
          300: '#94b8fa',
          400: '#6193f6',
          500: '#3d6ef1',
          600: '#274fd6',
          700: '#1f3db8',
          800: '#173496', // govt blue
          900: '#122c74',
          950: '#0c1e52',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#fedaa8',
          300: '#fec071',
          400: '#fd9a38',
          500: '#f97d0c', // india saffron
          600: '#ea6002',
          700: '#c24706',
          800: '#9c390d',
          900: '#7e300e',
        },
        // subtle green accents for success/achieved states
        india: {
          green: '#138808',
          chakra: '#173496',
          saffron: '#ff9933',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(16,42,100,0.10), 0 1px 2px -1px rgba(16,42,100,0.08)',
        'card-hover': '0 8px 20px -6px rgba(16,42,100,0.18)',
        sidebar: '2px 0 12px -2px rgba(12,30,82,0.35)',
      },
    },
  },
  plugins: [],
}
