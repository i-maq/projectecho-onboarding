import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const poppins = localFont({
  src: [
    { path: '../public/fonts/Poppins-300.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/Poppins-400.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/Poppins-500.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/Poppins-600.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/Poppins-700.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/Poppins-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Echo - Your Personal Memory Journal',
  description: 'A beautiful, private journaling application powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${poppins.variable} font-poppins h-full flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="gradient-bg min-h-screen h-full flex-grow">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}