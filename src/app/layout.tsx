import type { Metadata } from 'next';
import { Fraunces, Sora } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Sandra Nino | Asesora Inmobiliaria',
  description:
    'Inventario inmobiliario exclusivo de Sandra Nino. Casas, apartamentos, galpones y terrenos en venta y alquiler en Carabobo, Venezuela.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${sora.variable}`}>
      <body className="antialiased min-h-screen bg-cream text-text-body font-body selection:bg-terracotta/20 selection:text-text-heading">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
