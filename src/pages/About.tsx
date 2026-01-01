import { Layout } from '@/components/layout/Layout';
import { Award, Users, Gem, Heart } from 'lucide-react';

const values = [
  {
    icon: Gem,
    title: 'Craftsmanship',
    description: 'Every design reflects our commitment to precision and artistic excellence.',
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'We pour our heart into each creation, ensuring every piece tells a story.',
  },
  {
    icon: Users,
    title: 'Client Focus',
    description: 'Your vision is our priority. We work closely to bring your ideas to life.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for perfection in every detail, from concept to final render.',
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-charcoal to-background" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up">
              About <span className="text-gold-gradient">Maa Fusion</span>
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-up" style={{ animationDelay: '0.1s' }}>
              For over 15 years, we've been at the forefront of jewelry and Murti design, 
              blending traditional artistry with contemporary aesthetics to create pieces 
              that transcend time.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold text-foreground mb-6">
                Our <span className="text-gold-gradient">Story</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Maa Fusion Creations was born from a deep reverence for traditional Indian 
                  craftsmanship and a vision to bring it into the modern era. Our journey 
                  began with a simple belief: that true beauty lies in the perfect harmony 
                  of tradition and innovation.
                </p>
                <p>
                  Today, we stand as a testament to that belief. Our team of skilled designers 
                  and artisans work tirelessly to create designs that honor our rich heritage 
                  while embracing contemporary sensibilities. Each piece in our portfolio 
                  represents countless hours of dedication, creativity, and an unwavering 
                  commitment to excellence.
                </p>
                <p>
                  From intricate pendant designs to majestic Murti creations, we bring dreams 
                  to life through the art of digital rendering, allowing our clients to 
                  visualize their perfect piece before it's brought into physical existence.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden card-luxury">
                <img
                  src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=600&fit=crop"
                  alt="Jewelry craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gold-gradient rounded-lg flex items-center justify-center">
                <div className="text-center text-primary-foreground">
                  <div className="font-display text-3xl font-bold">15+</div>
                  <div className="text-sm">Years</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
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
                className="card-luxury-hover p-8 text-center animate-fade-up"
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
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl font-bold text-foreground mb-6">
              Meet the <span className="text-gold-gradient">Artisans</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Behind every stunning design is a team of passionate artists, designers, 
              and craftspeople who bring decades of combined experience to every project. 
              Our team blends traditional techniques with cutting-edge technology to 
              create renders that capture the true essence of each piece.
            </p>
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full border border-primary/30 bg-primary/5">
              <span className="text-primary font-medium">Expert Team of 10+ Designers</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
