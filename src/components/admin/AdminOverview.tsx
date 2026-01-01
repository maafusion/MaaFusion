import { useEffect, useState } from 'react';
import { Image, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalDesigns: number;
  pendingInquiries: number;
  totalInquiries: number;
  recentInquiries: number;
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalDesigns: 0,
    pendingInquiries: 0,
    totalInquiries: 0,
    recentInquiries: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Get total designs
    const { count: designCount } = await supabase
      .from('designs')
      .select('*', { count: 'exact', head: true });

    // Get pending inquiries
    const { count: pendingCount } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total inquiries
    const { count: totalInquiryCount } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    // Get recent inquiries (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: recentCount } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    setStats({
      totalDesigns: designCount || 0,
      pendingInquiries: pendingCount || 0,
      totalInquiries: totalInquiryCount || 0,
      recentInquiries: recentCount || 0,
    });
  };

  const statCards = [
    {
      title: 'Total Designs',
      value: stats.totalDesigns,
      icon: Image,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Inquiries',
      value: stats.pendingInquiries,
      icon: MessageSquare,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'This Week',
      value: stats.recentInquiries,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="card-luxury p-6 animate-fade-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="font-display text-3xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card-luxury p-6">
        <h3 className="font-display text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="font-medium text-foreground mb-2">Add New Design</h4>
            <p className="text-sm text-muted-foreground">
              Upload new jewelry or Murti designs to the gallery.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="font-medium text-foreground mb-2">Manage Inquiries</h4>
            <p className="text-sm text-muted-foreground">
              Review and respond to client inquiries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
