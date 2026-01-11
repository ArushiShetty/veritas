/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        'veritas-purple': 'hsl(255, 35%, 50%)',
        'veritas-darkPurple': 'hsl(255, 35%, 40%)',
        'veritas-lightPurple': 'hsl(255, 35%, 95%)',
        'veritas-blue': 'hsl(199, 93%, 48%)',
        background: 'hsl(258, 43%, 98%)',
        foreground: 'hsl(256, 22%, 12%)',
        muted: 'hsl(257, 23%, 94%)',
        'muted-foreground': 'hsl(257, 8%, 47%)',
        accent: 'hsl(257, 23%, 94%)',
        'accent-foreground': 'hsl(256, 22%, 12%)',
        destructive: 'hsl(0, 84.2%, 60.2%)',
        'destructive-foreground': 'hsl(0, 0%, 98%)',
        border: 'hsl(257, 23%, 85%)',
        input: 'hsl(257, 23%, 85%)',
        ring: 'hsl(255, 35%, 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      borderRadius: {
        'xl': '0.75rem',
      },
    },
  },
  plugins: [],
}
