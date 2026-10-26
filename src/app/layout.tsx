import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/cart/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Aeromach — Aerospace & Aviation Technical Apparel Lab',
  description:
    'Independent aerospace apparel engineered from fluid dynamics, propulsion CAD schematics, and flight mechanics principles. Minimalist technical streetwear for engineers and aviation purists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Razorpay Standard Checkout SDK */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="min-h-screen flex flex-col bg-aerospace-950 text-slate-100">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
