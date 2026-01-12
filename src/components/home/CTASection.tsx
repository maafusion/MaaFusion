import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-16 md:py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-background to-charcoal" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="mb-6 font-serif text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
            Ready to Create Something{' '}
            <span className="italic text-gold">Extraordinary?</span>
          </h2>
          <p className="mb-10 text-base text-cream/70 sm:text-lg">
            Let's discuss your vision. Our expert designers are ready to bring
            your ideas to life with precision and artistry.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="default" size="lg" asChild className="bg-gold hover:bg-gold-dark text-charcoal font-serif">
              <Link to="/contact">
                Get In Touch
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-gold/50 text-cream hover:bg-gold/10">
              <Link to="/about">Our Story</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
