import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const designSchema = z.object({
  title: z.string().min(2, 'Title is required').max(100),
  description: z.string().optional(),
  category: z.enum(['pendant', 'ring', 'murti', 'other']),
  image_url: z.string().url('Please enter a valid image URL'),
  video_url: z.string().url('Please enter a valid video URL').optional().or(z.literal('')),
});

type DesignFormData = z.infer<typeof designSchema>;

interface DesignUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesignUploadModal({ isOpen, onClose }: DesignUploadModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DesignFormData>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'pendant',
      image_url: '',
      video_url: '',
    },
  });

  const onSubmit = async (data: DesignFormData) => {
    setIsLoading(true);

    const { error } = await supabase.from('designs').insert({
      title: data.title,
      description: data.description || null,
      category: data.category,
      image_url: data.image_url,
      video_url: data.video_url || null,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add design. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Design Added!',
        description: 'The design has been added to the gallery.',
      });
      form.reset();
      onClose();
      // Trigger refresh
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add New Design</DialogTitle>
          <DialogDescription>
            Add a new design to your gallery. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Design title"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.watch('category')}
              onValueChange={(value: 'pendant' | 'ring' | 'murti' | 'other') =>
                form.setValue('category', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendant">Pendant</SelectItem>
                <SelectItem value="ring">Ring</SelectItem>
                <SelectItem value="murti">Murti</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL *</Label>
            <Input
              id="image_url"
              placeholder="https://example.com/image.jpg"
              {...form.register('image_url')}
            />
            {form.formState.errors.image_url && (
              <p className="text-sm text-destructive">
                {form.formState.errors.image_url.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL (optional)</Label>
            <Input
              id="video_url"
              placeholder="https://example.com/video.mp4"
              {...form.register('video_url')}
            />
            {form.formState.errors.video_url && (
              <p className="text-sm text-destructive">
                {form.formState.errors.video_url.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the design..."
              rows={3}
              {...form.register('description')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="luxury" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Add Design
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
