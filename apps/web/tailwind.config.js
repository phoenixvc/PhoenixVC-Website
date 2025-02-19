// tailwind.config.js
import baseConfig from '../../tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
    ...baseConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', "class"],
  theme: {
  	extend: {
            ...baseConfig.theme?.extend,
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			content: 'rgb(var(--color-text) / <alpha-value>)',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		textColor: {
  			theme: {
  				base: 'rgb(var(--color-text) / <alpha-value>)',
  				muted: 'rgb(var(--color-muted) / <alpha-value>)',
  				primary: 'rgb(var(--color-primary) / <alpha-value>)',
  				secondary: 'rgb(var(--color-secondary) / <alpha-value>)'
  			}
  		},
  		backgroundColor: {
  			theme: {
  				base: 'rgb(var(--color-background) / <alpha-value>)',
  				primary: 'rgb(var(--color-primary) / <alpha-value>)',
  				secondary: 'rgb(var(--color-secondary) / <alpha-value>)'
  			}
  		},
  		borderColor: {
  			theme: 'rgb(var(--color-border) / <alpha-value>)'
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
  		},
  		backdropBlur: {
  			xs: '2px',
  			sm: '4px',
  			md: '8px',
  			lg: '10px',
  			xl: '16px',
  			'2xl': '24px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
      ...baseConfig.plugins || [],
    require("tailwindcss-animate")
],
}
