import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageHoverCarousel } from '@/components/ui/image-hover-carousel';
import { FEATURED_COLLECTIONS } from '@/data/collections';

export function FeaturedSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured <span className="text-gold-gradient">Collections</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our signature collections, each piece meticulously designed
            to capture the essence of elegance and tradition.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_COLLECTIONS.map((category, index) => (
            <div
              key={category.title}
              className="group card-luxury-hover overflow-hidden animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative h-64 overflow-hidden">
                <ImageHoverCarousel
                  images={category.images}
                  alt={category.title}
                  className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {category.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {category.description}
                </p>
                <Button variant="luxury-ghost" size="sm" className="group/btn" asChild>
                  <Link to="/contact">
                    Inquire Now
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button variant="luxury" size="lg" asChild>
            <Link to="/contact">
              Contact Us for Custom Designs
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
