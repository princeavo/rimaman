/** @type {import('tailwindcss').Config} */

// Permet d'utiliser les modificateurs d'opacité Tailwind (ex: bg-primary/10)
// tout en pilotant la couleur réelle via une variable CSS (--color-xxx),
// elle-même définie différemment en mode clair (:root) et sombre (.dark).
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

const colorTokens = [
  'primary', 'on-primary', 'primary-container', 'on-primary-container',
  'primary-fixed', 'primary-fixed-dim', 'on-primary-fixed', 'on-primary-fixed-variant',
  'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
  'secondary-fixed', 'secondary-fixed-dim', 'on-secondary-fixed', 'on-secondary-fixed-variant',
  'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
  'tertiary-fixed', 'tertiary-fixed-dim', 'on-tertiary-fixed', 'on-tertiary-fixed-variant',
  'error', 'error-container', 'on-error', 'on-error-container',
  'background', 'on-background',
  'surface', 'surface-bright', 'surface-dim', 'on-surface', 'on-surface-variant',
  'surface-variant', 'surface-tint',
  'surface-container-lowest', 'surface-container-low', 'surface-container',
  'surface-container-high', 'surface-container-highest',
  'inverse-surface', 'inverse-on-surface', 'inverse-primary',
  'outline', 'outline-variant',
];

const colors = Object.fromEntries(
  colorTokens.map((token) => [token, withOpacity(`--color-${token}`)])
);

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors,
      fontFamily: {
        "headline": ["Sora", "Outfit", "sans-serif"],
        "body": ["Space Grotesk", "sans-serif"],
        "label": ["Space Grotesk", "sans-serif"]
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
}
