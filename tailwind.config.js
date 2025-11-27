/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Open Sans"', 'sans-serif'],
                display: ['"Montserrat"', 'sans-serif'],
            },
            colors: {
                eco: {
                    cream: '#FFF8F0',
                    peach: '#F7D6D0',
                    lavender: '#9D8D9E',
                    purple: '#6A6C8A',
                    darkPurple: '#4A4B65',
                    lime: '#A4C639',
                    limeHover: '#8FB328',
                    forest: '#2E4A3D',
                    text: '#333333',
                }
            }
        },
    },
    plugins: [],
}
