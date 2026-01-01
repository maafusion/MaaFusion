import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  seamless?: boolean; // If true, removes top padding for transparent navbar overlap
}

export function Layout({ children, showFooter = true, seamless = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className={`flex-1 ${seamless ? '' : 'pt-24'}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
