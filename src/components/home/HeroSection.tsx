import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative bg-cream pb-14 pt-24 overflow-hidden sm:pt-28 md:pt-32">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-charcoal/3 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold-dark">
              Exquisite Craftsmanship
            </span>
            <h1 className="font-serif text-4xl leading-[1.1] text-charcoal tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="italic">Crafting</span> Divine <br />
              <span className="italic">Excellence</span>
            </h1>
          </div>

          <div className="h-px w-24 bg-gold/30 animate-reveal mt-10 mx-auto" style={{ animationDelay: '0.5s' }} />

          <p className="font-sans text-base text-charcoal-muted max-w-md leading-relaxed animate-fade-up mt-10 mx-auto sm:text-lg" style={{ animationDelay: '0.6s' }}>
            Where sacred traditions meet digital artistry. We craft exquisite sculptures and jewelry designs that breathe life into your vision.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 animate-fade-up mt-6 justify-center sm:gap-6" style={{ animationDelay: '0.8s' }}>
            <Button variant="ghost" asChild className="group hover:bg-transparent px-0 hover:text-gold-dark text-charcoal transition-colors">
              <Link to="/about" className="gap-2">
                <span className="font-serif italic tracking-wider text-sm border-b border-charcoal/30 group-hover:border-gold-dark pb-1">Our Story</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
