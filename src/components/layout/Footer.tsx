import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cream border-t border-charcoal/10 pt-24 pb-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">

          {/* Brand Column */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="inline-block">
              <span className="font-serif text-3xl text-charcoal tracking-tight">MaaFusion</span>
            </Link>
            <p className="font-sans text-charcoal/60 text-sm max-w-sm leading-relaxed">
              We create digital masterpieces that bridge the gap between ancient tradition and modern luxury.
              Elevating the art of jewelry and murti design.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="font-serif text-lg text-charcoal mb-6">Studio</h4>
            <ul className="space-y-4">
              {[
                { label: 'Home', path: '/' },
                { label: 'About Us', path: '/about' },
                { label: 'Contact', path: '/contact' },
                { label: 'Portfolio', path: '/portfolio' }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="font-sans text-sm text-charcoal/60 hover:text-gold-dark transition-colors uppercase tracking-widest"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-serif text-lg text-charcoal mb-6">Legal</h4>
            <ul className="space-y-4">
              {[
                { label: 'Terms of Use', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="font-sans text-sm text-charcoal/60 hover:text-gold-dark transition-colors uppercase tracking-widest"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-charcoal/10 gap-4">
          <p className="font-sans text-xs text-charcoal/40 uppercase tracking-widest">
            © {currentYear} Maa Fusion Creations
          </p>
          <p className="font-sans text-xs text-charcoal/40 uppercase tracking-widest">
            Designed with Intention
          </p>
        </div>
      </div>
    </footer>
  );
}
