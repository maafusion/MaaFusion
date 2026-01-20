import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cream border-t border-charcoal/10 pt-16 pb-10 md:pt-24 md:pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12 mb-16 md:mb-24">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="inline-block">
              <img src="/logo-v5.svg" alt="MaaFusion" className="h-10 w-auto" />
            </Link>
            <p className="font-sans text-charcoal/80 text-sm max-w-sm leading-relaxed mt-2">
              A digital homage to tradition. Blending culture and creativity
              under the guiding light of motherly blessings.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="font-serif text-xl text-charcoal mb-6">Studio</h4>
            <ul className="space-y-4">
              {[
                { label: "Home", path: "/" },
                { label: "About Us", path: "/about" },
                { label: "Contact", path: "/contact" },
                { label: "Gallery", path: "/gallery" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="font-sans text-sm text-charcoal hover:text-gold-dark transition-colors uppercase tracking-widest"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-serif text-xl text-charcoal mb-6">Legal</h4>
            <ul className="space-y-4">
              {[
                { label: "Terms of Use", path: "/terms" },
                { label: "Privacy Policy", path: "/privacy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="font-sans text-sm text-charcoal hover:text-gold-dark transition-colors uppercase tracking-widest"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-charcoal/10 pt-6 md:pt-8">
          <p className="font-sans text-xs text-charcoal/60 uppercase tracking-widest">
            Copyright {currentYear} Maa Fusion Creations
          </p>
        </div>
      </div>
    </footer>
  );
}


