/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFAF9',
        surface: '#FFFFFF',
        ink: '#292524',
        muted: '#57534E',
        accent: '#92400E',
        border: '#D6D3D1',
        linen: '#F1F0EB',
        forest: '#354C3C',
        'forest-dark': '#25382B',
      },
      fontFamily: {
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
