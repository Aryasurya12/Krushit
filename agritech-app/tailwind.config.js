/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // KRUSHIT STARTUP PALETTE
                agri: {
                    dark: '#1E2D24',    // Rich Forest (Text/Dark BG)
                    green: '#2F6F4E',   // Deep Leaf (Primary Brand)
                    leaf: '#4CAF50',    // Fresh Crop (Secondary/Success)
                    soil: '#8D6E63',    // Warm Soil (Accents)
                    harvest: '#FBC02D', // Harvest Yellow (Highlights)
                    cream: '#F4F8F2',   // Soft Cream (Main BG)
                    sage: '#E8F2EC',    // Muted Sage (Card BG)
                    white: '#FFFFFF',   // Pure White
                },
                // Semantic Mapping
                primary: {
                    DEFAULT: '#2F6F4E',
                    50: '#E8F5E9',
                    100: '#C8E6C9',
                    500: '#2F6F4E', // Deep Leaf
                    600: '#1B5E20',
                    hover: '#245A3E',
                },
                secondary: {
                    DEFAULT: '#4CAF50',
                    500: '#4CAF50', // Fresh Crop
                    hover: '#43A047',
                },
                accent: {
                    DEFAULT: '#8D6E63', // Soil
                    yellow: '#FBC02D', // Harvest
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Poppins', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'soft': '0 4px 20px -2px rgba(47, 111, 78, 0.1)', // Green tinted shadow
                'card': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'elevated': '0 10px 30px -5px rgba(47, 111, 78, 0.15)',
            },
            borderRadius: {
                'xl': '16px',
                '2xl': '20px',
                '3xl': '24px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
