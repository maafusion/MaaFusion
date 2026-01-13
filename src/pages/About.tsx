import { Layout } from '@/components/layout/Layout';
import { Award, Users, Gem, Heart } from 'lucide-react';

const values = [
  {
    icon: Gem,
    title: 'Heritage',
    description: 'Rooted in the wisdom of the past, every design honors our cultural legacy.',
  },
  {
    icon: Heart,
    title: 'Devotion',
    description: 'We approach every project with care and dedication, treating your vision as our own.',
  },
  {
    icon: Users,
    title: 'Fusion',
    description: 'Blending ancient aesthetics with modern technology to create something truly unique.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for perfection in every detail, from concept to final digital creation.',
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-cream" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[80px] opacity-40" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold text-charcoal mb-6 animate-fade-up sm:text-5xl md:text-6xl">
              About <span className="text-gold-dark">MaaFusion</span>
            </h1>
            <p className="text-base text-charcoal/70 animate-fade-up sm:text-lg md:text-xl font-serif leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Guided by the legacy of <strong>Geeta & Jashi</strong>, we bridge the gap between ancient tradition and modern innovation. We don't just design; we translate heritage into the digital age.
            </p>
          </div>
        </div>
      </section>

      {/* Story / Philosophy */}
      <section className="bg-card/50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 md:gap-16">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-6 sm:text-4xl">
                The <span className="text-gold-gradient">Philosophy</span>
              </h2>
              <div className="space-y-6 text-muted-foreground">
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-charcoal">Maa (The Roots)</h3>
                  <p>
                    A symbol of love, tradition, and new beginnings. It is a tribute to <strong>Geeta & Jashi</strong>, the mothers whose blessings inspire our every step.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-charcoal">Fusion (The Craft)</h3>
                  <p>
                    The art of blending different worlds—ancient Indian aesthetics with 3D precision, culture with technology.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-charcoal">Creation (The Outcome)</h3>
                  <p>
                    Bringing something entirely new into existence. We mold the wisdom of the past into the style of a new era.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden card-luxury group relative">
                <img
                  src="https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipySlqg2tpdRxTN6fP4CitI3KnQwoy12Ur0ZjHa"
                  alt="Jewelry craftsmanship"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4 sm:text-4xl">
              Our <span className="text-gold-gradient">Values</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide every design we create and every relationship we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="card-luxury-hover p-6 text-center animate-fade-up sm:p-8"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-card/50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6 sm:text-4xl">
              Meet the <span className="text-gold-gradient">Artisans</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Behind every stunning design is a team of passionate artists, designers,
              and craftspeople who bring years of combined experience to every project.
              Our team blends traditional techniques with cutting-edge technology to
              create renders that capture the true essence of each piece.
            </p>
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full border border-primary/30 bg-primary/5">
              <span className="text-primary font-medium">Expert Team of 4+ Designers</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
