export function StatsSection() {
  return (
    <section className="bg-cream py-14 text-charcoal relative overflow-hidden sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">

          {/* Editorial / Statement */}
          <div className="md:w-1/2 space-y-6 animate-fade-up sm:space-y-8">
            <h2 className="font-serif text-3xl leading-tight text-charcoal sm:text-4xl md:text-5xl">
              Cultivating art <br />
              <span className="italic text-charcoal/50">since 2010.</span>
            </h2>
            <div className="h-px w-16 bg-gold-dark" />
            <p className="font-sans text-base text-charcoal/70 leading-relaxed sm:text-lg">
              For over 15 years, our studio has been a sanctuary for artisans and visionaries.
              We are a team of 10+ dedicated craftsmen, united by a passion for blending
              ancient Indian aesthetics with cutting-edge digital rendering.
            </p>
            <p className="font-sans text-base text-charcoal/70 leading-relaxed sm:text-lg">
              From contemporary figurative sculptures to divine art and bespoke jewelry,
              we don't just create models; we sculpt emotion and heritage into every pixel.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-6 sm:gap-8 sm:pt-8">
              <div>
                <span className="block font-serif text-4xl text-charcoal">15+</span>
                <span className="text-xs uppercase tracking-widest text-charcoal/50 mt-2 block">Years Experience</span>
              </div>
              <div>
                <span className="block font-serif text-4xl text-charcoal">10+</span>
                <span className="text-xs uppercase tracking-widest text-charcoal/50 mt-2 block">Master Artisans</span>
              </div>
            </div>
          </div>

          {/* Visual / Image */}
          <div className="md:w-1/2 relative h-[500px] w-full hidden md:block animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 border border-charcoal/5 rotate-3" />
            <div className="absolute inset-0 bg-cream shadow-soft -rotate-2 hover:rotate-0 transition-transform duration-700 overflow-hidden">
              <img
                src="https://p7fzjac0b1.ufs.sh/f/XMtknvqcEipyWNSincPHbdSloLstyEP0WCe3zifU1auKBONq"
                alt="Cultivating Art at MaaFusion"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
