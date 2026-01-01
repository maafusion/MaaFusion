import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-cream overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-charcoal/3 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[80vh]">

          {/* Text Content - Spans 7 cols */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-10">
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <span className="font-serif italic text-gold-dark text-xl tracking-wider">
                Est. 2010
              </span>
              <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-charcoal tracking-tight">
                Maa <br />
                <span className="italic font-light text-charcoal-muted">Fusion</span>
              </h1>
            </div>

            <div className="h-px w-24 bg-gold/30 animate-reveal" style={{ animationDelay: '0.5s' }} />

            <p className="font-sans text-charcoal-muted text-lg max-w-md leading-relaxed animate-fade-up" style={{ animationDelay: '0.6s' }}>
              Where ancient tradition meets contemporary elegance. We craft exquisite digital sculptures and jewelry designs that breathe life into your vision.
            </p>

            <div className="flex flex-wrap gap-6 pt-4 animate-fade-up" style={{ animationDelay: '0.8s' }}>
              <Button
                variant="ghost"
                className="h-auto px-8 py-4 text-charcoal/70 hover:text-gold-dark hover:bg-transparent transition-all duration-300 font-serif tracking-widest uppercase text-xs group pl-0"
                asChild
              >
                <Link to="/about" className="flex items-center gap-2">
                  Our Story
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Abstract Composition / Image Placeholder - Spans 5 cols */}
          <div className="lg:col-span-5 relative h-full min-h-[400px] lg:min-h-auto hidden lg:block">
            <div className="absolute inset-0 flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="relative w-full aspect-[3/4] max-w-md">
                {/* <div className="absolute inset-0 border border-gold/20 translate-x-4 translate-y-4" /> */}
                <div className="absolute inset-0 bg-transparent overflow-visible group flex items-center justify-center">
                  <img
                    //src="https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipy84jiuPXCBrH7fo5ScA90Pi2DydakjmzqV1RI"
                    src="https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipykpy8h15VKqEhGNuBz8xCs9WZRkYAdH4e0P26"
                    alt="MaaFusion Hero Art"
                    className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105 drop-shadow-2xl"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
