/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // 디자인 토큰은 src/index.css의 :root CSS 변수에서 가져온다.
      // Tailwind 클래스 `bg-primary`, `text-sale` 등을 사용할 수 있다.
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark:    'var(--color-primary-dark)',
          light:   'var(--color-primary-light)',
          bg:      'var(--color-primary-bg)',
        },
        sale:        'var(--color-sale)',
        rent:        'var(--color-rent)',
        presale:     'var(--color-presale)',
        auction:     'var(--color-auction)',
        development: 'var(--color-development)',
        page:        'var(--color-bg-page)',
        surface:     'var(--color-bg-white)',
        muted:       'var(--color-bg-light)',
        ink: {
          DEFAULT:  'var(--color-text-primary)',
          secondary:'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          disabled: 'var(--color-text-disabled)',
        },
        line: {
          DEFAULT: 'var(--color-border)',
          light:   'var(--color-border-light)',
        },
      },
      boxShadow: {
        'token-sm':  'var(--shadow-sm)',
        'token-md':  'var(--shadow-md)',
        'token-lg':  'var(--shadow-lg)',
        'token-xl':  'var(--shadow-xl)',
        'token-2xl': 'var(--shadow-2xl)',
        'orange':    'var(--shadow-orange)',
      },
      borderRadius: {
        'token-sm':  'var(--radius-sm)',
        'token-md':  'var(--radius-md)',
        'token-lg':  'var(--radius-lg)',
        'token-xl':  'var(--radius-xl)',
        'token-2xl': 'var(--radius-2xl)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
