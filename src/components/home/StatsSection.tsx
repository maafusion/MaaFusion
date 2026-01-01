const stats = [
  { value: '100+', label: 'Unique Designs' },
  { value: '50+', label: 'Happy Clients' },
  { value: '15+', label: 'Years Experience' },
  { value: '24/7', label: 'Support' },
];

export function StatsSection() {
  return (
    <section className="py-20 border-y border-border bg-card/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="font-display text-4xl md:text-5xl font-bold text-gold-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
