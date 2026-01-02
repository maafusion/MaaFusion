import { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, UserRound, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';

const publicLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, loading, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isAuthPage = location.pathname === '/auth';
  const userMetadata = useMemo(() => (user?.user_metadata ?? {}) as Record<string, unknown>, [user]);
  const fullName = useMemo(() => {
    const first = typeof userMetadata.first_name === 'string' ? userMetadata.first_name.trim() : '';
    const last = typeof userMetadata.last_name === 'string' ? userMetadata.last_name.trim() : '';
    return `${first} ${last}`.trim();
  }, [userMetadata]);
  const displayName = fullName || user?.email || 'Account';
  const phone = typeof userMetadata.phone === 'string' ? userMetadata.phone : undefined;
  const initials = useMemo(() => {
    if (fullName) {
      return fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'ME';
  }, [fullName, user]);

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

            {/* Auth CTA */}
            <div className="flex items-center ml-4">
              {loading ? (
                <div className="h-9 w-28 rounded-full bg-charcoal/10 animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 bg-cream/70 text-charcoal shadow-sm transition hover:-translate-y-0.5 hover:border-gold/40"
                      aria-label="Open account menu"
                    >
                      {initials ? (
                        <span className="text-xs font-semibold tracking-widest">{initials}</span>
                      ) : (
                        <UserRound className="h-5 w-5" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="text-xs uppercase tracking-[0.2em] text-charcoal/60">
                      Account
                    </DropdownMenuLabel>
                    <div className="px-2 py-2 text-sm text-charcoal">
                      <p className="font-medium">{displayName}</p>
                      {user?.email && <p className="text-xs text-charcoal/60">{user.email}</p>}
                      {phone && <p className="text-xs text-charcoal/60">{phone}</p>}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        signOut();
                      }}
                      className="text-charcoal/80 focus:text-charcoal"
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/auth?mode=sign-in"
                  className={`rounded-full border border-charcoal/20 bg-cream/70 px-6 py-2 text-xs uppercase tracking-[0.3em] text-charcoal transition-all hover:border-gold/40 ${isAuthPage
                      ? 'border-gold/50 bg-gold/20 text-charcoal shadow-sm'
                      : ''
                    }`}
                >
                  Login
                </Link>
              )}
            </div>
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
            {user ? (
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 rounded-full border border-charcoal/10 bg-white/70 px-5 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal text-cream">
                    <span className="text-xs font-semibold tracking-widest">{initials}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-charcoal">{displayName}</p>
                    {user?.email && <p className="text-xs text-charcoal/60">{user.email}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    setIsOpen(false);
                  }}
                  className="text-sm uppercase tracking-[0.3em] text-charcoal/70 hover:text-charcoal transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-4">
                <Link
                  to="/auth?mode=sign-in"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-charcoal/20 bg-white/80 px-6 py-3 text-xs uppercase tracking-[0.3em] text-charcoal transition-all hover:border-gold/40"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth?mode=sign-up"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-charcoal/20 bg-charcoal px-6 py-3 text-xs uppercase tracking-[0.3em] text-cream transition-all hover:bg-charcoal/90"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
