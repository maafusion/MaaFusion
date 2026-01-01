import { useEffect, useState } from 'react';
import { Loader2, Check, X, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'pending' | 'closed';
  created_at: string;
  design: {
    title: string;
  } | null;
}

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        design:designs(title)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInquiries(data as unknown as Inquiry[]);
    }
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: 'pending' | 'closed') => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    } else {
      setInquiries(
        inquiries.map((inq) =>
          inq.id === id ? { ...inq, status } : inq
        )
      );
      toast({
        title: 'Updated',
        description: `Inquiry marked as ${status}.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="card-luxury p-12 text-center">
        <p className="text-muted-foreground">No inquiries yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <div key={inquiry.id} className="card-luxury p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {inquiry.name}
                </h3>
                <Badge variant={inquiry.status === 'pending' ? 'default' : 'secondary'}>
                  {inquiry.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {inquiry.email}
                </span>
                {inquiry.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {inquiry.phone}
                  </span>
                )}
              </div>

              {inquiry.design && (
                <p className="text-sm text-primary mb-2">
                  Re: {inquiry.design.title}
                </p>
              )}

              <p className="text-muted-foreground">{inquiry.message}</p>

              <p className="text-xs text-muted-foreground mt-3">
                {new Date(inquiry.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {inquiry.status === 'pending' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(inquiry.id, 'closed')}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark Closed
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(inquiry.id, 'pending')}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Reopen
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
