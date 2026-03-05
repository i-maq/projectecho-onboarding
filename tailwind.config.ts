import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      colors: {
        // Echo design system
        echo: {
          bg: {
            primary: '#f0f2f5',
            secondary: '#f8f9fb',
            tertiary: '#ffffff',
          },
          purple: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          text: {
            primary: '#1a1a2e',
            secondary: '#4a4a68',
            muted: '#8a8aa3',
          },
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
        },
        // Shadcn compatibility
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'echo-soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'echo-card': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'echo-elevated': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'echo-glow': '0 0 20px rgba(139, 92, 246, 0.15)',
        'echo-glow-strong': '0 0 40px rgba(139, 92, 246, 0.25)',
        'echo-neumorphic': '-4px -4px 8px #ffffff, 4px 4px 8px rgba(139, 92, 246, 0.15)',
        'echo-neumorphic-hover': '-6px -6px 12px #ffffff, 6px 6px 16px rgba(139, 92, 246, 0.2)',
        'echo-neumorphic-pressed': 'inset -2px -2px 4px #ffffff, inset 2px 2px 4px rgba(139, 92, 246, 0.2)',
      },
      backdropBlur: {
        'echo-glass': '12px',
        'echo-glass-strong': '20px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'echo-gradient': 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        'echo-gradient-soft': 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
        'echo-gradient-subtle': 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
