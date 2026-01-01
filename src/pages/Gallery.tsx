import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { DesignCard } from '@/components/gallery/DesignCard';
import { InquiryModal } from '@/components/gallery/InquiryModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Design = Database['public']['Tables']['designs']['Row'];

const categories = [
  { value: 'all', label: 'All Designs' },
  { value: 'pendant', label: 'Pendants' },
  { value: 'ring', label: 'Rings' },
  { value: 'murti', label: 'Murti' },
  { value: 'other', label: 'Other' },
];

export default function Gallery() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDesigns();
    }
  }, [user, activeCategory]);

  const fetchDesigns = async () => {
    setIsLoading(true);
    let query = supabase.from('designs').select('*').order('created_at', { ascending: false });

    if (activeCategory !== 'all') {
      query = query.eq('category', activeCategory);
    }

    const { data, error } = await query;

    if (!error && data) {
      setDesigns(data);
    }
    setIsLoading(false);
  };

  const handleInquire = (design: Design) => {
    setSelectedDesign(design);
    setIsInquiryOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-charcoal to-background" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-up">
              Design <span className="text-gold-gradient">Gallery</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Explore our exclusive collection of jewelry and Murti designs. 
              Click on any design to view details or make an inquiry.
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? 'luxury' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className="flex-shrink-0"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">
                No designs found in this category.
              </p>
              <p className="text-sm text-muted-foreground">
                Check back soon for new additions to our collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {designs.map((design, index) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  onInquire={() => handleInquire(design)}
                  animationDelay={index * 0.05}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inquiry Modal */}
      <InquiryModal
        design={selectedDesign}
        isOpen={isInquiryOpen}
        onClose={() => {
          setIsInquiryOpen(false);
          setSelectedDesign(null);
        }}
      />
    </Layout>
  );
}
