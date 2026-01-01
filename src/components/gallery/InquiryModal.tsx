import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Design = Database['public']['Tables']['designs']['Row'];

const inquirySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email is required').max(255),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryModalProps {
  design: Design | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InquiryModal({ design, isOpen, onClose }: InquiryModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: user?.email || '',
      phone: '',
      message: design ? `I am interested in the design "${design.title}". Please provide more information.` : '',
    },
  });

  // Reset form when design changes
  useState(() => {
    if (design && isOpen) {
      form.reset({
        name: '',
        email: user?.email || '',
        phone: '',
        message: `I am interested in the design "${design.title}". Please provide more information.`,
      });
    }
  });

  const onSubmit = async (data: InquiryFormData) => {
    if (!user || !design) return;

    setIsLoading(true);

    const { error } = await supabase.from('inquiries').insert({
      user_id: user.id,
      design_id: design.id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send inquiry. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Inquiry Sent!',
        description: "Thank you for your interest. We'll get back to you soon.",
      });
      form.reset();
      onClose();
    }
  };

  if (!design) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Send Inquiry</DialogTitle>
          <DialogDescription>
            Interested in <span className="text-primary">{design.title}</span>? 
            Fill out the form below and we'll get back to you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Your name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              placeholder="Your phone number"
              {...form.register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Tell us more about your requirements..."
              rows={4}
              {...form.register('message')}
            />
            {form.formState.errors.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.message.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="luxury" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Inquiry
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
