import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

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
    <html lang="es">
      <body className="antialiased min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

