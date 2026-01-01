import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-background to-charcoal" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Create Something{' '}
            <span className="text-gold-gradient">Extraordinary?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Let's discuss your vision. Our expert designers are ready to bring 
            your ideas to life with precision and artistry.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="luxury" size="xl" asChild>
              <Link to="/contact">
                Get In Touch
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="luxury-outline" size="xl" asChild>
              <Link to="/about">Our Story</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
