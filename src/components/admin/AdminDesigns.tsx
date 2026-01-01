import { useEffect, useState } from 'react';
import { Loader2, Trash2, Plus, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Design = Database['public']['Tables']['designs']['Row'];

interface AdminDesignsProps {
  onAddDesign: () => void;
}

export function AdminDesigns({ onAddDesign }: AdminDesignsProps) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDesigns(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    const { error } = await supabase.from('designs').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete design.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Design has been deleted.',
      });
      setDesigns(designs.filter((d) => d.id !== id));
    }
  };

  const toggleFeatured = async (design: Design) => {
    const { error } = await supabase
      .from('designs')
      .update({ is_featured: !design.is_featured })
      .eq('id', design.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update design.',
        variant: 'destructive',
      });
    } else {
      setDesigns(
        designs.map((d) =>
          d.id === design.id ? { ...d, is_featured: !d.is_featured } : d
        )
      );
    }
  };

  const categoryLabels: Record<string, string> = {
    pendant: 'Pendant',
    ring: 'Ring',
    murti: 'Murti',
    other: 'Other',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {designs.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <p className="text-muted-foreground mb-4">No designs yet.</p>
          <Button variant="luxury" onClick={onAddDesign}>
            <Plus className="mr-2 w-4 h-4" />
            Add Your First Design
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="card-luxury overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={design.image_url}
                  alt={design.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded text-foreground">
                    {categoryLabels[design.category]}
                  </span>
                </div>
                {design.is_featured && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 truncate">
                  {design.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFeatured(design)}
                    title={design.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {design.is_featured ? (
                      <StarOff className="w-4 h-4" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(design.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
