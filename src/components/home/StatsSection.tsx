export function StatsSection() {
  return (
    <section className="bg-cream py-14 text-charcoal relative overflow-hidden sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">

          {/* Editorial / Statement */}
          <div className="md:w-1/2 space-y-6 animate-fade-up sm:space-y-8">
            <h2 className="font-serif text-3xl leading-tight text-charcoal sm:text-4xl md:text-5xl">
              Guided by Grace, <br />
              <span className="italic text-charcoal/80">Crafted in Digital.</span>
            </h2>
            <div className="h-px w-16 bg-gold-dark" />
            <p className="font-sans text-base text-gold-dark font-medium leading-relaxed sm:text-lg text-justify">
              From the earliest days of childhood to every step of growing up, one blessing has never
              left us — a mother’s. Her love has quietly guided our path, and her prayers have kept us
              grounded.
            </p>
            <p className="font-sans text-base text-gold-dark font-medium leading-relaxed sm:text-lg text-justify">
              A small token of appreciation and a gift for you, Mom. Thank you for everything.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6 sm:gap-8 sm:pt-8">
              <div>
                <span className="block font-serif text-4xl text-charcoal">3+</span>
                <span className="text-xs sm:text-sm uppercase tracking-widest text-charcoal/80 mt-2 block">Years Business</span>
              </div>
              <div>
                <span className="block font-serif text-4xl text-charcoal">10+</span>
                <span className="text-xs sm:text-sm uppercase tracking-widest text-charcoal/80 mt-2 block">Years Exp.</span>
              </div>
              <div>
                <span className="block font-serif text-4xl text-charcoal">4+</span>
                <span className="text-xs sm:text-sm uppercase tracking-widest text-charcoal/80 mt-2 block">Creative Minds</span>
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
