import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const publicLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-cream/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'
        }`}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="group relative z-50">
            <div className="flex flex-col leading-none">
              <span className={`font-serif text-2xl tracking-tighter transition-colors duration-300 ${isScrolled ? 'text-charcoal' : 'text-charcoal'
                }`}>
                MaaFusion
              </span>
              <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-charcoal/60 group-hover:text-gold-dark transition-colors duration-300">
                Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {publicLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`relative text-xs font-sans font-medium tracking-widest uppercase transition-all duration-300 hover:-translate-y-1 ${isActive(link.href)
                    ? 'text-gold-dark'
                    : 'text-charcoal/70 hover:text-charcoal'
                  }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-dark" />
                )}
              </Link>
            ))}

            {/* Minimalist CTA */}
            <Link
              to="/contact"
              className={`hidden lg:inline-flex text-xs font-serif italic border-b border-charcoal/30 hover:border-gold-dark hover:text-gold-dark transition-colors duration-300 pb-0.5 ml-4`}
            >
              Inquire
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-50 p-2 text-charcoal hover:bg-black/5 rounded-full transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`fixed inset-0 bg-cream/95 backdrop-blur-xl z-40 flex items-center justify-center transition-all duration-500 ease-in-out md:hidden ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}>
          <div className="flex flex-col items-center gap-8">
            {publicLinks.map((link, idx) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-3xl font-serif text-charcoal hover:text-gold-dark transition-all duration-500 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
