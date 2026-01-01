import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const categories = [
  {
    title: 'Pendant Collection',
    description: 'Elegant pendants crafted with precision and artistic detail.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop',
  },
  {
    title: 'Ring Designs',
    description: 'Exquisite rings that symbolize timeless beauty and craftsmanship.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=400&fit=crop',
  },
  {
    title: 'Murti Creations',
    description: 'Sacred Murti designs blending tradition with modern artistry.',
    image: 'https://images.unsplash.com/photo-1567591370504-80f8e543ff83?w=600&h=400&fit=crop',
  },
];

export function FeaturedSection() {
  const { user } = useAuth();

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
          {categories.map((category, index) => (
            <div
              key={category.title}
              className="group card-luxury-hover overflow-hidden animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {category.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {category.description}
                </p>
                <Button variant="luxury-ghost" size="sm" className="group/btn" asChild>
                  <Link to={user ? "/gallery" : "/auth"}>
                    View Collection
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
            <Link to={user ? "/gallery" : "/auth?mode=signup"}>
              {user ? "View Full Gallery" : "Join to Explore All Designs"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
