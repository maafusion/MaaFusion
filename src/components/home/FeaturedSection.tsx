import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageHoverCarousel } from '@/components/ui/image-hover-carousel';
import { FEATURED_COLLECTIONS } from '@/data/collections';

export function FeaturedSection() {
  return (
    <section className="py-12 bg-cream text-charcoal overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-6 leading-tight">
              Curated <span className="italic text-charcoal/50">Collections</span>
            </h2>
            <p className="text-charcoal/60 text-lg font-sans max-w-md">
              A selection of our finest digital sculptures and jewelry designs,
              crafted with precision and artistic vision.
            </p>
          </div>
          <div className="hidden md:block">
            <Button variant="ghost" asChild className="group hover:bg-transparent px-0 hover:text-gold-dark text-charcoal transition-colors">
              <Link to="/gallery" className="gap-2">
                <span className="font-serif italic tracking-wider text-sm border-b border-charcoal/30 group-hover:border-gold-dark pb-1">View Full Gallery</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Categories Grid - Conceptual Asymmetry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {FEATURED_COLLECTIONS.map((category, index) => (
            <div
              key={category.title}
              className="group flex flex-col space-y-6"
            >
              <div
                className="relative aspect-[3/4] overflow-hidden bg-white shadow-soft transition-all duration-700 hover:-translate-y-2 hover:shadow-gold/20"
              >
                <div className="absolute inset-0">
                  <div className="w-full h-full relative overflow-hidden bg-gray-50">
                    <ImageHoverCarousel
                      images={category.images}
                      alt={category.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start px-2">
                <span className="font-sans text-[10px] tracking-widest uppercase text-gold-dark mb-2 opacity-80 group-hover:opacity-100 transition-opacity">0{index + 1} / Collection</span>
                <h3 className="font-serif text-3xl text-charcoal group-hover:text-gold-dark transition-colors duration-300 mb-2">
                  {category.title}
                </h3>
                <p className="text-charcoal/60 text-sm font-sans line-clamp-2 leading-relaxed tracking-wide">
                  {category.description}
                </p>
                <Link to="/contact" className="mt-4 text-sm font-serif italic border-b border-transparent group-hover:border-charcoal/30 transition-all">
                  Explore
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-16 md:hidden text-center">
          <Button variant="ghost" asChild className="group hover:bg-transparent px-0 hover:text-gold-dark text-charcoal transition-colors">
            <Link to="/gallery" className="gap-2">
              <span className="font-serif italic tracking-wider text-sm border-b border-charcoal/30 group-hover:border-gold-dark pb-1">View Full Gallery</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
