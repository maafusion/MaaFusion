import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LayoutDashboard, Image, MessageSquare, Plus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminDesigns } from '@/components/admin/AdminDesigns';
import { AdminInquiries } from '@/components/admin/AdminInquiries';
import { DesignUploadModal } from '@/components/admin/DesignUploadModal';
import { useAuth } from '@/hooks/useAuth';

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage designs and inquiries
              </p>
            </div>
            <Button variant="luxury" onClick={() => setIsUploadOpen(true)}>
              <Plus className="mr-2 w-4 h-4" />
              Add Design
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="designs" className="gap-2">
                <Image className="w-4 h-4" />
                Designs
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Inquiries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AdminOverview />
            </TabsContent>

            <TabsContent value="designs">
              <AdminDesigns onAddDesign={() => setIsUploadOpen(true)} />
            </TabsContent>

            <TabsContent value="inquiries">
              <AdminInquiries />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Upload Modal */}
      <DesignUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </Layout>
  );
}
