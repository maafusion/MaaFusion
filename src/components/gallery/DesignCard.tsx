import { useState } from 'react';
import { Eye, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesignDetailModal } from './DesignDetailModal';
import { Database } from '@/integrations/supabase/types';

type Design = Database['public']['Tables']['designs']['Row'];

interface DesignCardProps {
  design: Design;
  onInquire: () => void;
  animationDelay?: number;
}

export function DesignCard({ design, onInquire, animationDelay = 0 }: DesignCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const categoryLabels: Record<string, string> = {
    pendant: 'Pendant',
    ring: 'Ring',
    murti: 'Murti',
    other: 'Other',
  };

  return (
    <>
      <div
        className="group card-luxury-hover overflow-hidden animate-fade-up"
        style={{ animationDelay: `${animationDelay}s` }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={design.image_url}
            alt={design.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsDetailOpen(true)}
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="luxury"
              size="icon"
              onClick={onInquire}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-full text-foreground">
              {categoryLabels[design.category]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-foreground mb-1 truncate">
            {design.title}
          </h3>
          {design.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {design.description}
            </p>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DesignDetailModal
        design={design}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onInquire={() => {
          setIsDetailOpen(false);
          onInquire();
        }}
      />
    </>
  );
}
