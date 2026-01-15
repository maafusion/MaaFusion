import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';


export default function About() {
  return (
    <Layout>
      <SEO 
        title="About Us" 
        description="Learn about the legacy of GEETA & JASHI and our mission to bridge ancient tradition with modern design." 
      />
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-cream" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[80px] opacity-40" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold text-charcoal mb-6 animate-fade-up sm:text-5xl md:text-6xl text-balance">
              About <span className="text-gold-dark">MaaFusion</span>
            </h1>
            <p className="text-base text-charcoal/80 animate-fade-up sm:text-lg md:text-xl font-sans leading-relaxed text-pretty" style={{ animationDelay: '0.1s' }}>
              Much like a mother’s touch transforms a house into a home, our team designs your dreams. We fuse classic values with modern style to create one-of-a-kind designs
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
              <div className="space-y-6 text-charcoal/80">
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-charcoal">Maa (The Roots)</h3>
                  <p className="text-base sm:text-lg font-sans">
                    A symbol of love and tradition. Dedicated to <strong className="font-serif font-bold text-gold-dark whitespace-nowrap text-lg sm:text-xl">GEETA & JASHI</strong>, the mothers whose blessings inspire our every step.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-charcoal">Fusion (The Craft)</h3>
                  <p className="text-base sm:text-lg font-sans">
                    It is the art of blending different worlds. We merge ancient Indian aesthetics with 3D precision, uniting culture with technology.
                  </p>
                </div>
                  <div className="space-y-2">
                  <h3 className="text-xl font-serif text-charcoal">Creation (The Outcome)</h3>
                  <p className="text-base sm:text-lg font-sans">
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

      {/* Team */}
      <section className="bg-card/50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6 sm:text-4xl">
              Meet the <span className="text-gold-gradient">Artisans</span>
            </h2>
            <p className="text-charcoal/80 mb-8 text-base sm:text-lg font-sans">
              Behind every stunning design is a passionate team blending traditional artistry with cutting-edge technology. Committed to constant innovation, we invite you to join our journey and support our artisans as we strive to create the extraordinary.
            </p>
            <div className="grid grid-cols-1 gap-6 pt-2 justify-items-center">
              <div className="text-center">
                <span className="block font-serif text-4xl text-charcoal">4+</span>
                <span className="text-xs sm:text-sm uppercase tracking-widest text-charcoal/80 mt-2 block">Designers</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
