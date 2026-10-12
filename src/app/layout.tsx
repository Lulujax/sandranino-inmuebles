import type { Metadata } from 'next';
import { Playfair_Display, Manrope } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sandra Nino | Asesora Inmobiliaria',
  description:
    'Catálogo inmobiliario exclusivo de Sandra Nino. Casas, apartamentos, galpones y terrenos en venta y alquiler en Carabobo, Venezuela.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${manrope.variable}`}>
      <body className="antialiased min-h-screen bg-cream text-text-body font-sans selection:bg-terracotta/20 selection:text-text-heading">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
