import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    details: 'Mumbai, Maharashtra, India',
    action: 'Get Directions',
    href: 'https://maps.google.com'
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: '+91 93227 45718',
    action: 'Call Now',
    href: 'tel:+919322745718'
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: 'maafusioncreation76@gmail.com',
    action: 'Send Email',
    href: 'mailto:maafusioncreation76@gmail.com'
  },
];

export default function Contact() {
  return (
    <Layout>
      <SEO 
        title="Contact Us" 
        description="Get in touch with MaaFusion. Visit our studio in Mumbai, or contact us via phone or email." 
      />
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-cream" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[80px] opacity-40" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl font-bold text-charcoal mb-6 animate-fade-up sm:text-5xl md:text-6xl">
              Get in <span className="text-gold-dark">Touch</span>
            </h1>
            <p className="text-base text-charcoal/70 animate-fade-up sm:text-lg md:text-xl" style={{ animationDelay: '0.1s' }}>
              Have a question or want to discuss a project? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
            {contactInfo.map((item, index) => (
              <div
                key={item.title}
                className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-charcoal/5 shadow-soft hover:shadow-gold/20 transition-all duration-300 hover:-translate-y-1 h-full"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors shrink-0">
                  <item.icon className="w-7 h-7 text-charcoal group-hover:text-gold-dark transition-colors" />
                </div>
                <h3 className="font-serif text-xl font-medium text-charcoal mb-3">{item.title}</h3>
                <p className="text-charcoal/60 mb-6 flex-grow">{item.details}</p>
                <a 
                  href={item.href}
                  className="text-xs uppercase tracking-widest text-gold-dark font-semibold border-b border-gold-dark/30 pb-1 hover:border-gold-dark transition-colors mt-auto"
                >
                  {item.action}
                </a>
              </div>
            ))}
          </div>

        </div>
      </section>
    </Layout>
  );
}
