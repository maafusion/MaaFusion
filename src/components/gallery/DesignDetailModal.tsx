import { X, MessageCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Database } from '@/integrations/supabase/types';

type Design = Database['public']['Tables']['designs']['Row'];

interface DesignDetailModalProps {
  design: Design | null;
  isOpen: boolean;
  onClose: () => void;
  onInquire: () => void;
}

export function DesignDetailModal({ design, isOpen, onClose, onInquire }: DesignDetailModalProps) {
  if (!design) return null;

  const categoryLabels: Record<string, string> = {
    pendant: 'Pendant',
    ring: 'Ring',
    murti: 'Murti',
    other: 'Other',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-card border-border">
        <DialogHeader className="sr-only">
          <DialogTitle>{design.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto md:h-full">
            <img
              src={design.image_url}
              alt={design.title}
              className="w-full h-full object-cover"
            />
            {design.video_url && (
              <div className="absolute bottom-4 right-4">
                <Button variant="secondary" size="sm" className="gap-2" asChild>
                  <a href={design.video_url} target="_blank" rel="noopener noreferrer">
                    <Play className="w-4 h-4" />
                    View Video
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full w-fit mb-4">
              {categoryLabels[design.category]}
            </span>

            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {design.title}
            </h2>

            {design.description && (
              <p className="text-muted-foreground mb-6 flex-1">
                {design.description}
              </p>
            )}

            <div className="mt-auto pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Interested in this design? Click below to send an inquiry.
              </p>
              <Button variant="luxury" size="lg" className="w-full" onClick={onInquire}>
                <MessageCircle className="mr-2 w-5 h-5" />
                Enquire Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
